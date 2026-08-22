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

    const [jobCards, bays, staff, clients, vehicles, workshop] = await Promise.all([
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
      prisma.client.findMany({
        where: { workshopId },
        include: {
          clientVehicles: {
            include: { vehicle: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.vehicle.findMany({
        where: { workshopId },
        include: {
          clientVehicles: {
            include: { client: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.workshop.findUnique({ where: { id: workshopId } })
    ])

    return NextResponse.json({
      jobCards,
      bays,
      staff,
      clients,
      vehicles,
      workshop
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

    let {
      clientId,
      vehicleId,
      staffId,
      bayId,
      priority,
      includeGst = true,
      mileageIn,
      discountExGst = 0,
      futureNotes,
      nextServiceOdoDue,
      nextPinkSlipDue,
      customerNotes,
      lines = [],
      // Nested unified creation payload
      isNewClient,
      newClientData,
      isNewVehicle,
      newVehicleData
    } = body

    // 1. Handle unified new client creation if requested
    if (isNewClient && newClientData) {
      const createdClient = await prisma.client.create({
        data: {
          workshopId,
          clientType: newClientData.clientType || "Individual",
          firstName: newClientData.firstName || null,
          lastName: newClientData.lastName || null,
          businessName: newClientData.businessName || null,
          abn: newClientData.abn || null,
          mobilePhone: newClientData.mobilePhone || null,
          email: newClientData.email || null,
          address: newClientData.address || null
        }
      })
      clientId = createdClient.id
    }

    // 2. Handle unified new vehicle creation if requested
    if (isNewVehicle && newVehicleData) {
      const upperRego = (newVehicleData.registration || "").toUpperCase().replace(/\s+/g, "")
      const createdVehicle = await prisma.vehicle.create({
        data: {
          workshopId,
          registration: upperRego,
          make: newVehicleData.make || null,
          model: newVehicleData.model || null,
          year: newVehicleData.year ? parseInt(newVehicleData.year) : null,
          colour: newVehicleData.colour || null,
          fuelType: newVehicleData.fuelType || "Petrol",
          transmission: newVehicleData.transmission || "Automatic",
          vin: newVehicleData.vin ? newVehicleData.vin.trim().toUpperCase() : null,
          bodyType: newVehicleData.bodyType || "Sedan",
          currentMileageKm: mileageIn ? parseInt(mileageIn) : null
        }
      })
      vehicleId = createdVehicle.id

      if (clientId) {
        await prisma.clientVehicle.create({
          data: {
            clientId,
            vehicleId,
            relationship: "Owner",
            isPrimaryOwner: true
          }
        })
      }
    }

    if (!clientId || !vehicleId) {
      return NextResponse.json({ error: "Client and Vehicle are required to create a Job Card" }, { status: 400 })
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
        category: l.category || "General",
        partId: l.partId || null,
        lineType: l.lineType || "Labour",
        description: l.description,
        qty,
        unitPriceExGst: unitPrice,
        lineTotalExGst: total,
        sortOrder: idx
      }
    })

    const disc = parseFloat(discountExGst) || 0

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
        includeGst: Boolean(includeGst),
        mileageIn: mileageIn ? parseInt(mileageIn) : null,
        discountExGst: disc,
        futureNotes: futureNotes || null,
        nextServiceOdoDue: nextServiceOdoDue ? parseInt(nextServiceOdoDue) : null,
        nextPinkSlipDue: nextPinkSlipDue ? new Date(nextPinkSlipDue) : null,
        customerNotes,
        totalExGst: Math.max(0, calculatedTotalExGst - disc),
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

    return NextResponse.json({ jobCard }, { status: 201 })
  } catch (error) {
    console.error("Error creating job card:", error)
    return NextResponse.json({ error: "Failed to create job card" }, { status: 500 })
  }
}
