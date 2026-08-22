import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const supplierId = searchParams.get("supplierId")

    const where: any = { workshopId }

    if (status && status !== "All") {
      where.paymentStatus = status
    }

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (search) {
      where.OR = [
        { supplierInvNumber: { contains: search } },
        { supplier: { name: { contains: search } } }
      ]
    }

    const invoices = await prisma.supplierInvoice.findMany({
      where,
      include: {
        supplier: true,
        lines: true
      },
      orderBy: { invoiceDate: "desc" }
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Error fetching supplier invoices:", error)
    return NextResponse.json({ error: "Failed to fetch supplier invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      supplierId,
      supplierInvNumber,
      invoiceDate,
      dueDate,
      isGstInclusive,
      totalAmount,
      paymentStatus,
      notes,
      lines,
      isNewSupplier,
      newSupplierData
    } = body

    let finalSupplierId = supplierId

    // Create new supplier on the fly if requested
    if (isNewSupplier && newSupplierData) {
      if (!newSupplierData.name) {
        return NextResponse.json({ error: "Supplier Name is required" }, { status: 400 })
      }

      const supplier = await prisma.supplier.create({
        data: {
          workshopId,
          name: newSupplierData.name.trim(),
          abn: newSupplierData.abn ? newSupplierData.abn.trim() : null,
          contactName: newSupplierData.contactName ? newSupplierData.contactName.trim() : null,
          phone: newSupplierData.phone ? newSupplierData.phone.trim() : null,
          email: newSupplierData.email ? newSupplierData.email.trim() : null,
          address: newSupplierData.address ? newSupplierData.address.trim() : null,
          accountNo: newSupplierData.accountNo ? newSupplierData.accountNo.trim() : null,
        }
      })
      finalSupplierId = supplier.id
    }

    if (!finalSupplierId || !supplierInvNumber || !totalAmount) {
      return NextResponse.json({ error: "Supplier, Invoice Number, and Total Amount are required" }, { status: 400 })
    }

    const rawTotal = parseFloat(totalAmount)
    let subtotalExGst = 0
    let gstAmount = 0
    let totalIncGst = 0

    if (isGstInclusive) {
      // Reverse GST calculation: Total Inc GST / 1.10 = Subtotal Ex GST
      subtotalExGst = Math.round((rawTotal / 1.10) * 100) / 100
      gstAmount = Math.round((rawTotal - subtotalExGst) * 100) / 100
      totalIncGst = rawTotal
    } else {
      subtotalExGst = rawTotal
      gstAmount = Math.round((rawTotal * 0.10) * 100) / 100
      totalIncGst = Math.round((subtotalExGst + gstAmount) * 100) / 100
    }

    // Default single line item if no custom lines provided
    const lineItems = (lines && lines.length > 0) ? lines.map((l: any, idx: number) => ({
      description: l.description || `Supplier Invoice ${supplierInvNumber}`,
      category: l.category || "Parts & Supplies",
      qty: parseFloat(l.qty || 1),
      unitPriceExGst: parseFloat(l.unitPriceExGst || subtotalExGst),
      lineTotalExGst: parseFloat(l.lineTotalExGst || subtotalExGst),
      gstRate: 0.10,
      gstAmount: parseFloat(l.gstAmount || gstAmount),
      lineTotalIncGst: parseFloat(l.lineTotalIncGst || totalIncGst),
      sortOrder: idx
    })) : [
      {
        description: `Parts & Consumables (Inv #${supplierInvNumber})`,
        category: "Parts & Supplies",
        qty: 1,
        unitPriceExGst: subtotalExGst,
        lineTotalExGst: subtotalExGst,
        gstRate: 0.10,
        gstAmount: gstAmount,
        lineTotalIncGst: totalIncGst,
        sortOrder: 0
      }
    ]

    const newInvoice = await prisma.supplierInvoice.create({
      data: {
        workshopId,
        supplierId: finalSupplierId,
        supplierInvNumber: supplierInvNumber.trim(),
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        isGstInclusive: Boolean(isGstInclusive),
        subtotalExGst,
        gstAmount,
        totalIncGst,
        paymentStatus: paymentStatus || "Paid",
        notes: notes || null,
        lines: {
          create: lineItems
        }
      },
      include: {
        supplier: true,
        lines: true
      }
    })

    return NextResponse.json({ invoice: newInvoice }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating supplier invoice:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "An invoice with this Supplier and Invoice Number already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create supplier invoice" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const { id, paymentStatus, notes } = body

    if (!id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 })
    }

    const updated = await prisma.supplierInvoice.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        supplier: true,
        lines: true
      }
    })

    return NextResponse.json({ invoice: updated })
  } catch (error) {
    console.error("Error updating supplier invoice:", error)
    return NextResponse.json({ error: "Failed to update supplier invoice" }, { status: 500 })
  }
}
