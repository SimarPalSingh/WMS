import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const where: any = { workshopId }

    if (search) {
      where.OR = [
        { registration: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
        { vin: { contains: search } },
        {
          clientVehicles: {
            some: {
              client: {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { businessName: { contains: search } },
                ]
              }
            }
          }
        }
      ]
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        clientVehicles: {
          include: {
            client: true
          }
        },
        jobCards: {
          orderBy: { dateIn: "desc" },
          take: 1
        },
        serviceReminders: {
          where: { status: "Pending" },
          orderBy: { dueDate: "asc" }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      registration,
      make,
      model,
      year,
      colour,
      fuelType,
      transmission,
      vin,
      currentMileageKm,
      clientId
    } = body

    if (!registration) {
      return NextResponse.json({ error: "Registration plate is required" }, { status: 400 })
    }

    const upperRego = registration.toUpperCase().replace(/\s+/g, "")

    const vehicle = await prisma.vehicle.create({
      data: {
        workshopId,
        registration: upperRego,
        make,
        model,
        year: year ? parseInt(year) : null,
        colour,
        fuelType,
        transmission,
        vin,
        currentMileageKm: currentMileageKm ? parseInt(currentMileageKm) : null,
        nextServiceDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Default 6 months
        pinkSlipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
      }
    })

    if (clientId) {
      await prisma.clientVehicle.create({
        data: {
          clientId,
          vehicleId: vehicle.id,
          relationship: "Owner",
          isPrimaryOwner: true
        }
      })
    }

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
