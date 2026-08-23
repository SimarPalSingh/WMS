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

    const quotation = await prisma.quotation.findFirst({
      where: { id, workshopId },
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
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } })

    return NextResponse.json({ quotation, workshop })
  } catch (error) {
    console.error("Error fetching quotation:", error)
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 })
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

    const { status, notes } = body

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        client: true,
        vehicle: true,
        lines: true
      }
    })

    return NextResponse.json({ quotation: updated })
  } catch (error) {
    console.error("Error updating quotation:", error)
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
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

    const existingQuotation = await prisma.quotation.findFirst({
      where: { id, workshopId }
    })

    if (!existingQuotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Delete quotation lines
    await prisma.quotationLine.deleteMany({ where: { quotationId: id } })

    // Delete quotation
    await prisma.quotation.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Quotation deleted successfully" })
  } catch (error) {
    console.error("Error deleting quotation:", error)
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}

