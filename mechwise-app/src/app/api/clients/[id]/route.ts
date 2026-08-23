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

    const client = await prisma.client.findFirst({
      where: { id, workshopId },
      include: {
        clientVehicles: {
          include: {
            vehicle: {
              include: {
                jobCards: {
                  orderBy: { dateIn: "desc" },
                  take: 5
                },
                maintenanceHist: {
                  orderBy: { serviceDate: "desc" }
                }
              }
            }
          }
        },
        jobCards: {
          orderBy: { dateIn: "desc" },
          include: {
            vehicle: true,
            staff: true
          }
        },
        invoices: {
          orderBy: { invoiceDate: "desc" }
        },
        serviceReminders: {
          orderBy: { dueDate: "asc" }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error fetching client details:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
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

    const {
      clientType,
      firstName,
      lastName,
      businessName,
      abn,
      mobilePhone,
      email,
      address,
      suburb,
      state,
      postcode,
      notes
    } = body

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        clientType: clientType || "Individual",
        firstName: firstName ? firstName.trim() : null,
        lastName: lastName ? lastName.trim() : null,
        businessName: businessName ? businessName.trim() : null,
        abn: abn ? abn.trim() : null,
        mobilePhone: mobilePhone ? mobilePhone.trim() : null,
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        suburb: suburb ? suburb.trim() : null,
        state: state ? state.trim() : "NSW",
        postcode: postcode ? postcode.trim() : null,
        notes: notes !== undefined ? notes : undefined
      }
    })

    return NextResponse.json({ client: updatedClient })
  } catch (error) {
    console.error("Error updating client profile:", error)
    return NextResponse.json({ error: "Failed to update client profile" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { id: clientId } = await params
    const body = await request.json()

    const {
      vehicleId,
      isNewVehicle,
      newVehicleData,
      relationship = "Owner"
    } = body

    let finalVehicleId = vehicleId

    // 1. If registering a brand new vehicle directly to this client
    if (isNewVehicle && newVehicleData) {
      if (!newVehicleData.registration) {
        return NextResponse.json({ error: "Registration plate is required" }, { status: 400 })
      }
      const upperRego = (newVehicleData.registration || "").toUpperCase().replace(/\s+/g, "")

      const curKm = newVehicleData.currentMileageKm ? parseInt(newVehicleData.currentMileageKm) : null
      const nxtKm = newVehicleData.nextServiceKm ? parseInt(newVehicleData.nextServiceKm) : curKm ? curKm + 10000 : null

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
          engineNumber: newVehicleData.engineNumber ? newVehicleData.engineNumber.trim().toUpperCase() : null,
          engineCapacity: newVehicleData.engineCapacity ? newVehicleData.engineCapacity.trim() : null,
          bodyType: newVehicleData.bodyType || "Sedan",
          currentMileageKm: curKm,
          nextServiceKm: nxtKm,
          nextServiceDue: newVehicleData.nextServiceDue ? new Date(newVehicleData.nextServiceDue) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          pinkSlipExpiry: newVehicleData.pinkSlipExpiry ? new Date(newVehicleData.pinkSlipExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        }
      })
      finalVehicleId = createdVehicle.id
    }

    if (!finalVehicleId) {
      return NextResponse.json({ error: "Vehicle is required to link" }, { status: 400 })
    }

    // When re-linking or assigning a vehicle to this client, demote previous primary owners
    await prisma.clientVehicle.updateMany({
      where: { vehicleId: finalVehicleId },
      data: { isPrimaryOwner: false }
    })

    // Check if relationship already exists for this client
    const existing = await prisma.clientVehicle.findFirst({
      where: { clientId, vehicleId: finalVehicleId }
    })

    if (existing) {
      await prisma.clientVehicle.update({
        where: { id: existing.id },
        data: { isPrimaryOwner: true, relationship }
      })
    } else {
      await prisma.clientVehicle.create({
        data: {
          clientId,
          vehicleId: finalVehicleId,
          relationship,
          isPrimaryOwner: true
        }
      })
    }

    // Touch vehicle updated timestamp
    await prisma.vehicle.update({
      where: { id: finalVehicleId },
      data: { updatedAt: new Date() }
    })

    // DYNAMIC CROSS-ENTITY CASCADE:
    // When linking a vehicle to this client, update all active jobs, quotes, unpaid invoices, and pending reminders
    await Promise.all([
      // 1. Update open / in-progress job cards
      prisma.jobCard.updateMany({
        where: {
          vehicleId: finalVehicleId,
          status: { notIn: ["Completed", "Cancelled"] }
        },
        data: { clientId }
      }),

      // 2. Update active quotations
      prisma.quotation.updateMany({
        where: {
          vehicleId: finalVehicleId,
          status: { notIn: ["Finalised", "Declined", "Expired"] }
        },
        data: { clientId }
      }),

      // 3. Update unpaid invoices
      prisma.invoice.updateMany({
        where: {
          vehicleId: finalVehicleId,
          paymentStatus: "Unpaid"
        },
        data: { clientId }
      }),

      // 4. Update pending reminders
      prisma.serviceReminder.updateMany({
        where: {
          vehicleId: finalVehicleId,
          status: "Pending"
        },
        data: { clientId }
      })
    ])

    return NextResponse.json({ success: true, vehicleId: finalVehicleId })
  } catch (error: any) {
    console.error("Error linking vehicle to client:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "This vehicle is already registered or linked." }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to link vehicle to client" }, { status: 500 })
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

    const existingClient = await prisma.client.findFirst({
      where: { id, workshopId }
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Clean up or cascade linked records before removing client
    // 1. Delete client-vehicle relationships
    await prisma.clientVehicle.deleteMany({ where: { clientId: id } })

    // 2. Delete reminders & payments
    await prisma.serviceReminder.deleteMany({ where: { clientId: id } })
    await prisma.payment.deleteMany({ where: { clientId: id } })

    // 3. Delete invoices and lines
    const invoices = await prisma.invoice.findMany({ where: { clientId: id } })
    for (const inv of invoices) {
      await prisma.invoiceLine.deleteMany({ where: { invoiceId: inv.id } })
      await prisma.payment.deleteMany({ where: { invoiceId: inv.id } })
    }
    await prisma.invoice.deleteMany({ where: { clientId: id } })

    // 4. Delete quotations
    const quotations = await prisma.quotation.findMany({ where: { clientId: id } })
    for (const q of quotations) {
      await prisma.quotationLine.deleteMany({ where: { quotationId: q.id } })
    }
    await prisma.quotation.deleteMany({ where: { clientId: id } })

    // 5. Delete job cards
    const jobCards = await prisma.jobCard.findMany({ where: { clientId: id } })
    for (const jc of jobCards) {
      await prisma.jobCardLine.deleteMany({ where: { jobCardId: jc.id } })
    }
    await prisma.jobCard.deleteMany({ where: { clientId: id } })

    // 6. Delete client
    await prisma.client.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}

