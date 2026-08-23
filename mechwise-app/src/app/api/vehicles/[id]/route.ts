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

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, workshopId },
      include: {
        clientVehicles: {
          orderBy: { isPrimaryOwner: "desc" },
          include: {
            client: true
          }
        },
        jobCards: {
          include: {
            staff: true,
            lines: true,
            invoice: true
          },
          orderBy: { dateIn: "desc" }
        },
        invoices: {
          orderBy: { invoiceDate: "desc" }
        },
        serviceReminders: {
          orderBy: { dueDate: "asc" }
        },
        maintenanceHist: {
          orderBy: { serviceDate: "desc" }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
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
      clientId
    } = body

    const dataToUpdate: any = {}
    if (registration) dataToUpdate.registration = registration.toUpperCase().replace(/\s+/g, "")
    if (make !== undefined) dataToUpdate.make = make
    if (model !== undefined) dataToUpdate.model = model
    if (year !== undefined) dataToUpdate.year = year ? parseInt(year) : null
    if (colour !== undefined) dataToUpdate.colour = colour
    if (fuelType !== undefined) dataToUpdate.fuelType = fuelType
    if (transmission !== undefined) dataToUpdate.transmission = transmission
    if (vin !== undefined) dataToUpdate.vin = vin ? vin.trim().toUpperCase() : null
    if (engineNumber !== undefined) dataToUpdate.engineNumber = engineNumber ? engineNumber.trim().toUpperCase() : null
    if (engineCapacity !== undefined) dataToUpdate.engineCapacity = engineCapacity
    if (bodyType !== undefined) dataToUpdate.bodyType = bodyType
    if (currentMileageKm !== undefined) dataToUpdate.currentMileageKm = currentMileageKm ? parseInt(currentMileageKm) : null
    if (nextServiceKm !== undefined) dataToUpdate.nextServiceKm = nextServiceKm ? parseInt(nextServiceKm) : null
    if (nextServiceDue !== undefined) dataToUpdate.nextServiceDue = nextServiceDue ? new Date(nextServiceDue) : null
    if (pinkSlipExpiry !== undefined) dataToUpdate.pinkSlipExpiry = pinkSlipExpiry ? new Date(pinkSlipExpiry) : null

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: dataToUpdate
    })

    // Handle re-assigning or de-linking owner (Strict 1 Vehicle : 1 Client)
    if (clientId !== undefined) {
      // 1. De-link vehicle from any previous client(s)
      await prisma.clientVehicle.deleteMany({
        where: { vehicleId: id }
      })

      if (clientId !== "UNASSIGNED" && clientId !== "" && clientId !== null) {
        // 2. Assign strictly to the single new client
        await prisma.clientVehicle.create({
          data: {
            clientId,
            vehicleId: id,
            relationship: "Owner",
            isPrimaryOwner: true
          }
        })

        // DYNAMIC CROSS-ENTITY CASCADE:
        // Update active job cards, quotations, unpaid invoices, and service reminders with the new clientId
        await Promise.all([
          // 1. Update open / in-progress job cards
          prisma.jobCard.updateMany({
            where: {
              vehicleId: id,
              status: { notIn: ["Completed", "Cancelled"] }
            },
            data: { clientId }
          }),

          // 2. Update active / pending / approved quotations
          prisma.quotation.updateMany({
            where: {
              vehicleId: id,
              status: { notIn: ["Finalised", "Declined", "Expired"] }
            },
            data: { clientId }
          }),

          // 3. Update pending / unpaid invoices
          prisma.invoice.updateMany({
            where: {
              vehicleId: id,
              paymentStatus: "Unpaid"
            },
            data: { clientId }
          }),

          // 4. Update pending reminders
          prisma.serviceReminder.updateMany({
            where: {
              vehicleId: id,
              status: "Pending"
            },
            data: { clientId }
          })
        ])
      }
    }

    // CASCADE VEHICLE SERVICE & PINK SLIP DUE DATES TO REMINDERS
    const primaryLink = await prisma.clientVehicle.findFirst({
      where: { vehicleId: id, isPrimaryOwner: true }
    })
    const effectiveClientId = primaryLink?.clientId || null

    // 1. Sync Next Service Reminder
    if (nextServiceDue !== undefined) {
      if (nextServiceDue) {
        const parsedServiceDate = new Date(nextServiceDue)
        const existingServiceReminder = await prisma.serviceReminder.findFirst({
          where: { vehicleId: id, reminderType: "NextService", status: "Pending" }
        })

        if (existingServiceReminder) {
          await prisma.serviceReminder.update({
            where: { id: existingServiceReminder.id },
            data: {
              dueDate: parsedServiceDate,
              clientId: effectiveClientId || existingServiceReminder.clientId
            }
          })
        } else {
          await prisma.serviceReminder.create({
            data: {
              workshopId,
              vehicleId: id,
              clientId: effectiveClientId,
              reminderType: "NextService",
              dueDate: parsedServiceDate,
              status: "Pending",
              sendCount: 0
            }
          })
        }
      } else {
        // If cleared, delete pending reminder
        await prisma.serviceReminder.deleteMany({
          where: { vehicleId: id, reminderType: "NextService", status: "Pending" }
        })
      }
    }

    // 2. Sync Pink Slip Due Date Reminder
    if (pinkSlipExpiry !== undefined) {
      if (pinkSlipExpiry) {
        const parsedPinkSlipDate = new Date(pinkSlipExpiry)
        const existingPinkSlipReminder = await prisma.serviceReminder.findFirst({
          where: { vehicleId: id, reminderType: "PinkSlip", status: "Pending" }
        })

        if (existingPinkSlipReminder) {
          await prisma.serviceReminder.update({
            where: { id: existingPinkSlipReminder.id },
            data: {
              dueDate: parsedPinkSlipDate,
              clientId: effectiveClientId || existingPinkSlipReminder.clientId
            }
          })
        } else {
          await prisma.serviceReminder.create({
            data: {
              workshopId,
              vehicleId: id,
              clientId: effectiveClientId,
              reminderType: "PinkSlip",
              dueDate: parsedPinkSlipDate,
              status: "Pending",
              sendCount: 0
            }
          })
        }
      } else {
        // If cleared, delete pending reminder
        await prisma.serviceReminder.deleteMany({
          where: { vehicleId: id, reminderType: "PinkSlip", status: "Pending" }
        })
      }
    }

    return NextResponse.json({ vehicle: updatedVehicle })
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
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

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, workshopId }
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // 1. Delete client-vehicle relationships
    await prisma.clientVehicle.deleteMany({ where: { vehicleId: id } })

    // 2. Delete reminders & maintenance history
    await prisma.serviceReminder.deleteMany({ where: { vehicleId: id } })
    await prisma.maintenanceHistory.deleteMany({ where: { vehicleId: id } })

    // 3. Delete invoices
    const invoices = await prisma.invoice.findMany({ where: { vehicleId: id } })
    for (const inv of invoices) {
      await prisma.invoiceLine.deleteMany({ where: { invoiceId: inv.id } })
      await prisma.payment.deleteMany({ where: { invoiceId: inv.id } })
    }
    await prisma.invoice.deleteMany({ where: { vehicleId: id } })

    // 4. Delete quotations
    const quotations = await prisma.quotation.findMany({ where: { vehicleId: id } })
    for (const q of quotations) {
      await prisma.quotationLine.deleteMany({ where: { quotationId: q.id } })
    }
    await prisma.quotation.deleteMany({ where: { vehicleId: id } })

    // 5. Delete job cards
    const jobCards = await prisma.jobCard.findMany({ where: { vehicleId: id } })
    for (const jc of jobCards) {
      await prisma.jobCardLine.deleteMany({ where: { jobCardId: jc.id } })
    }
    await prisma.jobCard.deleteMany({ where: { vehicleId: id } })

    // 6. Delete vehicle
    await prisma.vehicle.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}

