import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: { id, workshopId },
      include: {
        workshop: true,
        client: true,
        vehicle: true,
        jobCard: {
          include: {
            staff: true
          }
        },
        lines: {
          orderBy: { sortOrder: "asc" }
        },
        payments: {
          orderBy: { paymentDate: "desc" }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { id } = await params
    const body = await request.json()

    const { amount, paymentMethod, paymentRef, notes } = body

    const invoice = await prisma.invoice.findFirst({
      where: { id, workshopId },
      include: { payments: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const payAmount = parseFloat(amount) || 0
    if (payAmount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than 0" }, { status: 400 })
    }

    // 1. Record payment
    const payment = await prisma.payment.create({
      data: {
        workshopId,
        invoiceId: id,
        clientId: invoice.clientId,
        amount: payAmount,
        paymentMethod: paymentMethod || "EFTPOS",
        paymentRef: paymentRef || null,
        notes: notes || null
      }
    })

    // 2. Recalculate invoice status
    const allPayments = [...invoice.payments, payment]
    const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0)

    let paymentStatus = "Unpaid"
    if (totalPaid >= invoice.finalAmount) {
      paymentStatus = "Paid"
    } else if (totalPaid > 0) {
      paymentStatus = "Partial"
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { paymentStatus },
      include: {
        workshop: true,
        client: true,
        vehicle: true,
        lines: true,
        payments: true
      }
    })

    return NextResponse.json({ invoice: updatedInvoice, payment })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { id } = await params
    const body = await request.json()

    const { discountExGst, isGstFree, notes, futureNotes, paymentStatus } = body

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, workshopId },
      include: { lines: true, payments: true }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const subtotalExGst = existingInvoice.lines.reduce((acc, l) => acc + l.lineTotalExGst, 0)
    const discount = discountExGst !== undefined ? Math.max(0, parseFloat(discountExGst) || 0) : existingInvoice.discountExGst
    const gstFree = isGstFree !== undefined ? Boolean(isGstFree) : existingInvoice.isGstFree

    const netSubtotal = Math.max(0, subtotalExGst - discount)
    const gstAmount = gstFree ? 0 : Math.round(netSubtotal * 0.10 * 100) / 100
    const finalAmount = gstFree ? netSubtotal : Math.round((netSubtotal + gstAmount) * 100) / 100

    // Update lines GST amount if GST toggle changed
    if (isGstFree !== undefined) {
      for (const line of existingInvoice.lines) {
        await prisma.invoiceLine.update({
          where: { id: line.id },
          data: {
            gstRate: gstFree ? 0.0 : 0.10,
            gstAmount: gstFree ? 0.0 : Math.round(line.lineTotalExGst * 0.10 * 100) / 100
          }
        })
      }
    }

    const totalPaid = existingInvoice.payments.reduce((acc, p) => acc + p.amount, 0)
    let newPaymentStatus = paymentStatus || existingInvoice.paymentStatus
    if (totalPaid >= finalAmount) {
      newPaymentStatus = "Paid"
    } else if (newPaymentStatus === "Paid" && totalPaid < finalAmount) {
      newPaymentStatus = "Unpaid"
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        discountExGst: discount,
        isGstFree: gstFree,
        subtotalExGst,
        gstAmount,
        finalAmount,
        paymentStatus: newPaymentStatus,
        notes: notes !== undefined ? notes : existingInvoice.notes,
        futureNotes: futureNotes !== undefined ? futureNotes : existingInvoice.futureNotes
      },
      include: {
        workshop: true,
        client: true,
        vehicle: true,
        lines: {
          orderBy: { sortOrder: "asc" }
        },
        payments: {
          orderBy: { paymentDate: "desc" }
        }
      }
    })

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { id } = await params

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, workshopId }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Delete lines and payments
    await prisma.invoiceLine.deleteMany({ where: { invoiceId: id } })
    await prisma.payment.deleteMany({ where: { invoiceId: id } })

    // Delete invoice
    await prisma.invoice.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}

