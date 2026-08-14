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
        { jobCardNumber: { contains: search } },
        { customerNotes: { contains: search } },
        { vehicle: { registration: { contains: search } } },
        { client: { firstName: { contains: search } } },
        { client: { lastName: { contains: search } } },
        { client: { businessName: { contains: search } } }
      ]
    }

    const [jobCards, bays, staff, clients, vehicles] = await Promise.all([
      prisma.jobCard.findMany({
        where,
        include: {
          client: true,
          vehicle: true,
          staff: true,
          bay: true,
          lines: true,
          invoice: true
        },
        orderBy: { dateIn: "desc" }
      }),
      prisma.bay.findMany({ where: { workshopId }, orderBy: { displayOrder: "asc" } }),
      prisma.staff.findMany({ where: { workshopId, isActive: true } }),
      prisma.client.findMany({ where: { workshopId } }),
      prisma.vehicle.findMany({ where: { workshopId } })
    ])

    return NextResponse.json({
      jobCards,
      bays,
      staff,
      clients,
      vehicles
    })
  } catch (error) {
    console.error("Error fetching job cards:", error)
    return NextResponse.json({ error: "Failed to fetch job cards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      clientId,
      vehicleId,
      staffId,
      bayId,
      priority,
      mileageIn,
      customerNotes,
      lines = []
    } = body

    if (!clientId || !vehicleId) {
      return NextResponse.json({ error: "Client and Vehicle are required" }, { status: 400 })
    }

    // Atomic job card number generator
    const workshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: { nextJobCardNum: { increment: 1 } }
    })

    const jcNumFormatted = `JC-${String(workshop.nextJobCardNum).padStart(4, "0")}`

    let calculatedTotalExGst = 0
    const formattedLines = lines.map((l: any, idx: number) => {
      const qty = parseFloat(l.qty) || 1
      const unitPrice = parseFloat(l.unitPriceExGst) || 0
      const total = qty * unitPrice
      calculatedTotalExGst += total
      return {
        lineType: l.lineType || "Labour",
        description: l.description,
        qty,
        unitPriceExGst: unitPrice,
        lineTotalExGst: total,
        sortOrder: idx
      }
    })

    const jobCard = await prisma.jobCard.create({
      data: {
        workshopId,
        jobCardNumber: jcNumFormatted,
        clientId,
        vehicleId,
        staffId: staffId || null,
        bayId: bayId || null,
        status: "Booked",
        priority: priority || "Normal",
        mileageIn: mileageIn ? parseInt(mileageIn) : null,
        customerNotes,
        totalExGst: calculatedTotalExGst,
        lines: {
          create: formattedLines
        }
      },
      include: {
        client: true,
        vehicle: true,
        staff: true,
        bay: true,
        lines: true
      }
    })

    return NextResponse.json({ jobCard })
  } catch (error) {
    console.error("Error creating job card:", error)
    return NextResponse.json({ error: "Failed to create job card" }, { status: 500 })
  }
}
