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
      where.status = status
    }

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search } },
        { notes: { contains: search } },
        { vehicle: { registration: { contains: search } } },
        { client: { firstName: { contains: search } } },
        { client: { lastName: { contains: search } } },
        { client: { businessName: { contains: search } } }
      ]
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        client: true,
        vehicle: true,
        jobCard: {
          include: {
            invoice: true
          }
        },
        lines: {
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ quotations })
  } catch (error) {
    console.error("Error fetching quotations:", error)
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      jobCardId,
      clientId,
      vehicleId,
      notes,
      discountExGst = 0,
      includeGst = true,
      lines = []
    } = body

    if (!clientId || !vehicleId) {
      return NextResponse.json({ error: "Client and Vehicle are required for Quotation" }, { status: 400 })
    }

    // Validate job card status and invoice existence if jobCardId is provided
    if (jobCardId) {
      const linkedJob = await prisma.jobCard.findFirst({
        where: { id: jobCardId, workshopId },
        include: { invoice: true }
      })

      if (linkedJob) {
        if (linkedJob.status === "Completed" || linkedJob.invoice) {
          return NextResponse.json(
            { error: "Cannot generate quotation: This Job Card is already completed and has an active tax invoice." },
            { status: 400 }
          )
        }
      }
    }

    // Generate quotation number (QT-0001)
    const count = await prisma.quotation.count({ where: { workshopId } })
    const quoteNum = `QT-${String(count + 1).padStart(4, "0")}`

    let subtotalExGst = 0
    const formattedLines = lines.map((l: any, idx: number) => {
      const qty = parseFloat(l.qty) || 1
      const unitPrice = parseFloat(l.unitPriceExGst) || 0
      const total = qty * unitPrice
      subtotalExGst += total
      return {
        category: l.category || "General",
        lineType: l.lineType || "Labour",
        description: l.description,
        qty,
        unitPriceExGst: unitPrice,
        lineTotalExGst: total,
        sortOrder: idx
      }
    })

    const disc = parseFloat(discountExGst) || 0
    const netSubtotal = Math.max(0, subtotalExGst - disc)
    const gst = includeGst ? Math.round(netSubtotal * 0.10 * 100) / 100 : 0
    const totalInc = netSubtotal + gst

    // Check if quotation already exists for this job card
    if (jobCardId) {
      const existingQuotation = await prisma.quotation.findFirst({
        where: { jobCardId }
      })

      if (existingQuotation) {
        // Delete old lines and re-create with latest job card changes
        await prisma.quotationLine.deleteMany({
          where: { quotationId: existingQuotation.id }
        })

        const updatedQuotation = await prisma.quotation.update({
          where: { id: existingQuotation.id },
          data: {
            clientId,
            vehicleId,
            subtotalExGst,
            discountExGst: disc,
            gstAmount: gst,
            totalAmount: totalInc,
            notes: notes || null,
            lines: {
              create: formattedLines
            }
          },
          include: {
            client: true,
            vehicle: true,
            lines: true
          }
        })

        return NextResponse.json({ quotation: updatedQuotation, updated: true }, { status: 200 })
      }
    }

    const quotation = await prisma.quotation.create({
      data: {
        workshopId,
        quoteNumber: quoteNum,
        jobCardId: jobCardId || null,
        clientId,
        vehicleId,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
        subtotalExGst,
        discountExGst: disc,
        gstAmount: gst,
        totalAmount: totalInc,
        status: "Pending",
        notes: notes || null,
        lines: {
          create: formattedLines
        }
      },
      include: {
        client: true,
        vehicle: true,
        lines: true
      }
    })

    return NextResponse.json({ quotation }, { status: 201 })
  } catch (error) {
    console.error("Error creating quotation:", error)
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 })
  }
}
