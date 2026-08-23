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
          orderBy: { isPrimaryOwner: "desc" },
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
      engineNumber,
      engineCapacity,
      bodyType,
      currentMileageKm,
      nextServiceKm,
      nextServiceDue,
      pinkSlipExpiry,
      clientId,
      isNewClient,
      newClientData
    } = body

    if (!registration) {
      return NextResponse.json({ error: "Registration plate is required" }, { status: 400 })
    }

    let finalClientId = clientId

    // Create new client on the fly if requested
    if (isNewClient && newClientData) {
      if (!newClientData.mobilePhone && !newClientData.firstName && !newClientData.businessName) {
        return NextResponse.json({ error: "Client name or phone is required" }, { status: 400 })
      }

      const client = await prisma.client.create({
        data: {
          workshopId,
          clientType: newClientData.clientType || "Individual",
          firstName: newClientData.firstName ? newClientData.firstName.trim() : null,
          lastName: newClientData.lastName ? newClientData.lastName.trim() : null,
          businessName: newClientData.businessName ? newClientData.businessName.trim() : null,
          mobilePhone: newClientData.mobilePhone ? newClientData.mobilePhone.trim() : null,
          email: newClientData.email ? newClientData.email.trim() : null,
          address: newClientData.address ? newClientData.address.trim() : null,
          suburb: newClientData.suburb ? newClientData.suburb.trim() : "Kingswood",
          state: newClientData.state || "NSW",
          postcode: newClientData.postcode ? newClientData.postcode.trim() : null,
        }
      })
      finalClientId = client.id
    }

    const upperRego = registration.toUpperCase().replace(/\s+/g, "")

    const curKm = currentMileageKm ? parseInt(currentMileageKm) : null
    const nxtKm = nextServiceKm ? parseInt(nextServiceKm) : curKm ? curKm + 10000 : null

    const vehicle = await prisma.vehicle.create({
      data: {
        workshopId,
        registration: upperRego,
        make: make || null,
        model: model || null,
        year: year ? parseInt(year) : null,
        colour: colour || null,
        fuelType: fuelType || "Petrol",
        transmission: transmission || "Automatic",
        vin: vin ? vin.trim().toUpperCase() : null,
        engineNumber: engineNumber ? engineNumber.trim().toUpperCase() : null,
        engineCapacity: engineCapacity ? engineCapacity.trim() : null,
        bodyType: bodyType || "Sedan",
        currentMileageKm: curKm,
        nextServiceKm: nxtKm,
        nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Default 6 months
        pinkSlipExpiry: pinkSlipExpiry ? new Date(pinkSlipExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
      }
    })

    if (finalClientId) {
      await prisma.clientVehicle.create({
        data: {
          clientId: finalClientId,
          vehicleId: vehicle.id,
          relationship: "Owner",
          isPrimaryOwner: true
        }
      })
    }

    // Auto-create initial Service and Pink Slip Reminders
    if (vehicle.nextServiceDue) {
      await prisma.serviceReminder.create({
        data: {
          workshopId,
          vehicleId: vehicle.id,
          clientId: finalClientId || null,
          reminderType: "NextService",
          dueDate: vehicle.nextServiceDue,
          status: "Pending",
          sendCount: 0
        }
      })
    }

    if (vehicle.pinkSlipExpiry) {
      await prisma.serviceReminder.create({
        data: {
          workshopId,
          vehicleId: vehicle.id,
          clientId: finalClientId || null,
          reminderType: "PinkSlip",
          dueDate: vehicle.pinkSlipExpiry,
          status: "Pending",
          sendCount: 0
        }
      })
    }

    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating vehicle:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A vehicle with this registration already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
