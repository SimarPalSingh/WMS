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
