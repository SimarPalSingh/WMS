import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: any = { workshopId, isActive: true }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { abn: { contains: search } },
        { contactName: { contains: search } }
      ]
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { supplierInvoices: true, parts: true }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    // Handle bulk import from Excel or single supplier creation
    if (Array.isArray(body)) {
      const results = []
      for (const item of body) {
        if (!item.name) continue

        const supplier = await prisma.supplier.upsert({
          where: {
            workshopId_name: {
              workshopId,
              name: String(item.name).trim()
            }
          },
          update: {
            abn: item.abn ? String(item.abn).trim() : undefined,
            contactName: item.contactName || undefined,
            phone: item.phone || undefined,
            email: item.email || undefined,
            address: item.address || undefined,
            accountNo: item.accountNo || undefined,
          },
          create: {
            workshopId,
            name: String(item.name).trim(),
            abn: item.abn ? String(item.abn).trim() : null,
            contactName: item.contactName || null,
            phone: item.phone || null,
            email: item.email || null,
            address: item.address || null,
            accountNo: item.accountNo || null,
          }
        })
        results.push(supplier)
      }
      return NextResponse.json({ success: true, count: results.length })
    }

    const { name, abn, contactName, phone, email, address, accountNo } = body

    if (!name) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 })
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        workshopId,
        name: name.trim(),
        abn: abn ? abn.trim() : null,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        accountNo: accountNo || null
      }
    })

    return NextResponse.json({ supplier: newSupplier }, { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const { id, name, abn, contactName, phone, email, address, accountNo, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 })
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        abn: abn !== undefined ? abn.trim() : undefined,
        contactName: contactName !== undefined ? contactName : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        accountNo: accountNo !== undefined ? accountNo : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    })

    return NextResponse.json({ supplier: updated })
  } catch (error) {
    console.error("Error updating supplier:", error)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
  }
}
