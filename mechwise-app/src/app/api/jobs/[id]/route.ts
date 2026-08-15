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

    const [jobCard, staffList, bayList, workshop] = await Promise.all([
      prisma.jobCard.findFirst({
        where: { id, workshopId },
        include: {
          client: true,
          vehicle: true,
          staff: true,
          bay: true,
          lines: {
            orderBy: { sortOrder: "asc" }
          },
          invoice: true
        }
      }),
      prisma.staff.findMany({ where: { workshopId, isActive: true } }),
      prisma.bay.findMany({ where: { workshopId, isActive: true }, orderBy: { displayOrder: "asc" } }),
      prisma.workshop.findUnique({ where: { id: workshopId } })
    ])

    if (!jobCard) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 })
    }

    return NextResponse.json({ jobCard, staffList, bayList, workshop })
  } catch (error) {
    console.error("Error fetching job card:", error)
    return NextResponse.json({ error: "Failed to fetch job card" }, { status: 500 })
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

    const { status, staffId, bayId, lines, customerNotes, internalNotes, includeGst } = body

    const existingJob = await prisma.jobCard.findFirst({
      where: { id, workshopId },
      include: { lines: true, vehicle: true, client: true }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 })
    }

    let updatedTotalExGst = existingJob.totalExGst

    // Update lines if provided
    if (lines && Array.isArray(lines)) {
      await prisma.jobCardLine.deleteMany({ where: { jobCardId: id } })
      updatedTotalExGst = 0
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i]
        const qty = parseFloat(l.qty) || 1
        const unitPrice = parseFloat(l.unitPriceExGst) || 0
        const total = qty * unitPrice
        updatedTotalExGst += total

        await prisma.jobCardLine.create({
          data: {
            jobCardId: id,
            lineType: l.lineType || "Labour",
            description: l.description,
            qty,
            unitPriceExGst: unitPrice,
            lineTotalExGst: total,
            actualLabourHrs: l.actualLabourHrs ? parseFloat(l.actualLabourHrs) : null,
            isCompleted: Boolean(l.isCompleted),
            sortOrder: i
          }
        })
      }
    }

    // Check if transition is to "Completed" to run automated trigger routines
    const isNowCompleted = status === "Completed" && existingJob.status !== "Completed"
    const finalIncludeGst = includeGst !== undefined ? Boolean(includeGst) : (existingJob.includeGst ?? true)

    const updatedJobCard = await prisma.jobCard.update({
      where: { id },
      data: {
        status: status || existingJob.status,
        staffId: staffId !== undefined ? staffId : existingJob.staffId,
        bayId: bayId !== undefined ? bayId : existingJob.bayId,
        customerNotes: customerNotes !== undefined ? customerNotes : existingJob.customerNotes,
        internalNotes: internalNotes !== undefined ? internalNotes : existingJob.internalNotes,
        includeGst: finalIncludeGst,
        totalExGst: updatedTotalExGst,
        dateCompleted: isNowCompleted ? new Date() : existingJob.dateCompleted
      },
      include: {
        client: true,
        vehicle: true,
        staff: true,
        bay: true,
        lines: true,
        invoice: true
      }
    })

    // AUTO-COMPLETION TRIGGER PIPELINE
    if (isNowCompleted) {
      // 1. Auto-generate sequential invoice if not already existing
      const existingInvoice = await prisma.invoice.findUnique({ where: { jobCardId: id } })
      if (!existingInvoice) {
        const workshop = await prisma.workshop.update({
          where: { id: workshopId },
          data: { nextInvoiceNum: { increment: 1 } }
        })

        const invNumFormatted = `INV-${String(workshop.nextInvoiceNum).padStart(4, "0")}`
        const isGstFree = !finalIncludeGst
        const gstAmount = isGstFree ? 0 : Math.round(updatedTotalExGst * 0.10 * 100) / 100
        const finalAmount = isGstFree ? updatedTotalExGst : updatedTotalExGst + gstAmount

        const newInvoice = await prisma.invoice.create({
          data: {
            workshopId,
            invoiceNumber: invNumFormatted,
            jobCardId: id,
            clientId: existingJob.clientId,
            vehicleId: existingJob.vehicleId,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days payment term
            isGstFree,
            subtotalExGst: updatedTotalExGst,
            gstAmount,
            finalAmount,
            paymentStatus: "Unpaid",
            lines: {
              create: updatedJobCard.lines.map((line) => ({
                lineType: line.lineType,
                description: line.description,
                qty: line.qty,
                unitPriceExGst: line.unitPriceExGst,
                lineTotalExGst: line.lineTotalExGst,
                gstRate: isGstFree ? 0.0 : 0.10,
                gstAmount: isGstFree ? 0.0 : Math.round(line.lineTotalExGst * 0.10 * 100) / 100,
                sortOrder: line.sortOrder
              }))
            }
          }
        })
      }

      // 2. Auto-record Maintenance History
      await prisma.maintenanceHistory.create({
        data: {
          vehicleId: existingJob.vehicleId,
          serviceDate: new Date(),
          serviceType: "Workshop Service",
          description: existingJob.customerNotes || "Standard maintenance service",
          mileage: existingJob.mileageIn,
          totalCost: updatedTotalExGst
        }
      })

      // 3. Auto-update vehicle mileage and calculate next service due date
      await prisma.vehicle.update({
        where: { id: existingJob.vehicleId },
        data: {
          currentMileageKm: existingJob.mileageIn || undefined,
          nextServiceDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // +6 months
        }
      })

      // 4. Auto-schedule Next Service Reminder
      await prisma.serviceReminder.create({
        data: {
          workshopId,
          vehicleId: existingJob.vehicleId,
          clientId: existingJob.clientId,
          reminderType: "NextService",
          dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          status: "Pending",
          sendCount: 0
        }
      })
    }

    return NextResponse.json({ jobCard: updatedJobCard })
  } catch (error) {
    console.error("Error updating job card:", error)
    return NextResponse.json({ error: "Failed to update job card" }, { status: 500 })
  }
}
