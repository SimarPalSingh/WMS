import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "All"
    const search = searchParams.get("search") || ""

    const where: any = { workshopId }

    if (status && status !== "All") {
      where.paymentStatus = status
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { vehicle: { registration: { contains: search } } },
        { client: { firstName: { contains: search } } },
        { client: { lastName: { contains: search } } },
        { client: { businessName: { contains: search } } }
      ]
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        vehicle: true,
        jobCard: true,
        lines: true,
        payments: true
      },
      orderBy: { invoiceDate: "desc" }
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
