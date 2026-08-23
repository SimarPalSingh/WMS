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
          invoice: true,
          quotation: true
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

    const {
      status,
      staffId,
      bayId,
      lines,
      customerNotes,
      internalNotes,
      futureNotes,
      discountExGst,
      nextServiceOdoDue,
      nextPinkSlipDue,
      includeGst
    } = body

    const existingJob = await prisma.jobCard.findFirst({
      where: { id, workshopId },
      include: { lines: true, vehicle: true, client: true }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 })
    }

    let calculatedLinesTotal = 0

    // Update lines if provided
    if (lines && Array.isArray(lines)) {
      await prisma.jobCardLine.deleteMany({ where: { jobCardId: id } })
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i]
        const qty = parseFloat(l.qty) || 1
        const unitPrice = parseFloat(l.unitPriceExGst) || 0
        const total = qty * unitPrice
        calculatedLinesTotal += total

        await prisma.jobCardLine.create({
          data: {
            jobCardId: id,
            category: l.category || "General",
            partId: l.partId || null,
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
    } else {
      calculatedLinesTotal = existingJob.lines.reduce((acc, l) => acc + l.lineTotalExGst, 0)
    }

    const finalDiscount = discountExGst !== undefined ? parseFloat(discountExGst) || 0 : (existingJob.discountExGst || 0)
    const netTotalExGst = Math.max(0, calculatedLinesTotal - finalDiscount)

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
        futureNotes: futureNotes !== undefined ? futureNotes : existingJob.futureNotes,
        discountExGst: finalDiscount,
        nextServiceOdoDue: nextServiceOdoDue !== undefined ? (nextServiceOdoDue ? parseInt(nextServiceOdoDue) : null) : existingJob.nextServiceOdoDue,
        nextPinkSlipDue: nextPinkSlipDue !== undefined ? (nextPinkSlipDue ? new Date(nextPinkSlipDue) : null) : existingJob.nextPinkSlipDue,
        includeGst: finalIncludeGst,
        totalExGst: netTotalExGst,
        dateCompleted: isNowCompleted ? new Date() : existingJob.dateCompleted
      },
      include: {
        client: true,
        vehicle: true,
        staff: true,
        bay: true,
        lines: true,
        invoice: true,
        quotation: true
      }
    })

    // BIDIRECTIONAL QUOTATION STATUS SYNC & AUTO-LINE SYNCHRONIZATION
    const newEffectiveStatus = status || existingJob.status
    if (newEffectiveStatus === "Completed") {
      await prisma.quotation.updateMany({
        where: { jobCardId: id, status: { not: "Finalised" } },
        data: { status: "Finalised" }
      })
    } else if (newEffectiveStatus !== "Cancelled") {
      // Revert quotation to Pending if job is active / in progress / reopened
      await prisma.quotation.updateMany({
        where: { jobCardId: id, status: "Finalised" },
        data: { status: "Pending" }
      })
    }

    // If an existing quotation is linked to this job card, keep its lines and financial breakdown synchronized
    const linkedQuote = await prisma.quotation.findFirst({
      where: { jobCardId: id }
    })

    if (linkedQuote) {
      const isQuoteGstFree = !finalIncludeGst
      const quoteGstAmount = isQuoteGstFree ? 0 : Math.round(netTotalExGst * 0.10 * 100) / 100
      const quoteTotalIncGst = isQuoteGstFree ? netTotalExGst : netTotalExGst + quoteGstAmount

      // Replace quotation lines with updated job card line items
      await prisma.quotationLine.deleteMany({
        where: { quotationId: linkedQuote.id }
      })

      for (let i = 0; i < updatedJobCard.lines.length; i++) {
        const line = updatedJobCard.lines[i]
        await prisma.quotationLine.create({
          data: {
            quotationId: linkedQuote.id,
            lineType: line.lineType,
            description: line.description,
            qty: line.qty,
            unitPriceExGst: line.unitPriceExGst,
            lineTotalExGst: line.lineTotalExGst,
            sortOrder: i
          }
        })
      }

      await prisma.quotation.update({
        where: { id: linkedQuote.id },
        data: {
          subtotalExGst: calculatedLinesTotal,
          discountExGst: finalDiscount,
          gstAmount: quoteGstAmount,
          totalAmount: quoteTotalIncGst,
          notes: updatedJobCard.customerNotes || linkedQuote.notes
        }
      })
    }

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
        const gstAmount = isGstFree ? 0 : Math.round(netTotalExGst * 0.10 * 100) / 100
        const finalAmount = isGstFree ? netTotalExGst : netTotalExGst + gstAmount

        await prisma.invoice.create({
          data: {
            workshopId,
            invoiceNumber: invNumFormatted,
            jobCardId: id,
            clientId: existingJob.clientId,
            vehicleId: existingJob.vehicleId,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days payment term
            isGstFree,
            subtotalExGst: calculatedLinesTotal,
            discountExGst: finalDiscount,
            futureNotes: updatedJobCard.futureNotes || null,
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

      // 3. Auto-record Maintenance History
      await prisma.maintenanceHistory.create({
        data: {
          vehicleId: existingJob.vehicleId,
          serviceDate: new Date(),
          serviceType: "Workshop Service",
          description: existingJob.customerNotes || "Standard maintenance service",
          mileage: existingJob.mileageIn,
          totalCost: netTotalExGst
        }
      })

      // 4. Auto-update vehicle mileage and calculate next service due targets
      await prisma.vehicle.update({
        where: { id: existingJob.vehicleId },
        data: {
          currentMileageKm: existingJob.mileageIn || undefined,
          nextServiceKm: updatedJobCard.nextServiceOdoDue || (existingJob.mileageIn ? existingJob.mileageIn + 10000 : undefined),
          nextServiceDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 months
          pinkSlipExpiry: updatedJobCard.nextPinkSlipDue || undefined
        }
      })

      // 5. Auto-schedule Next Service & Pink Slip Reminders
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

      if (updatedJobCard.nextPinkSlipDue) {
        await prisma.serviceReminder.create({
          data: {
            workshopId,
            vehicleId: existingJob.vehicleId,
            clientId: existingJob.clientId,
            reminderType: "PinkSlip",
            dueDate: updatedJobCard.nextPinkSlipDue,
            status: "Pending",
            sendCount: 0
          }
        })
      }

      // 6. Deduct Inventory Quantities & Trigger Low Stock Alert Reminders
      for (const line of updatedJobCard.lines) {
        if (line.lineType === "Part") {
          let part = null

          // Match by direct partId foreign key if present
          if (line.partId) {
            part = await prisma.part.findFirst({
              where: { id: line.partId, workshopId }
            })
          }

          // Fallback: match by partNumber or description substring
          if (!part && line.description) {
            part = await prisma.part.findFirst({
              where: {
                workshopId,
                OR: [
                  { name: { contains: line.description } },
                  { partNumber: { contains: line.description } }
                ]
              }
            })
          }

          if (part) {
            const qtyUsed = Math.max(1, Math.ceil(line.qty || 1))
            const newStockQty = Math.max(0, (part.availableStock ?? part.stockQty) - qtyUsed)

            const updatedPart = await prisma.part.update({
              where: { id: part.id },
              data: {
                stockQty: newStockQty,
                availableStock: newStockQty
              }
            })

            // Trigger Low Stock / Reorder reminder if stock drops below minStockQty
            if (updatedPart.availableStock <= updatedPart.minStockQty) {
              await prisma.serviceReminder.create({
                data: {
                  workshopId,
                  partId: updatedPart.id,
                  reminderType: "LowStock",
                  dueDate: new Date(),
                  status: "Pending",
                  messageContent: `Low stock alert: ${updatedPart.name} (${updatedPart.partNumber}) has ${updatedPart.availableStock} remaining (Min: ${updatedPart.minStockQty}).`
                }
              })
            }
          }
        }
      }
    }

    return NextResponse.json({ jobCard: updatedJobCard })
  } catch (error) {
    console.error("Error updating job card:", error)
    return NextResponse.json({ error: "Failed to update job card" }, { status: 500 })
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

    const existingJob = await prisma.jobCard.findFirst({
      where: { id, workshopId }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 })
    }

    // Unlink quotations & invoices from job card before deletion
    await prisma.quotation.updateMany({
      where: { jobCardId: id },
      data: { jobCardId: null }
    })

    await prisma.invoice.updateMany({
      where: { jobCardId: id },
      data: { jobCardId: null }
    })

    // Delete job card lines
    await prisma.jobCardLine.deleteMany({
      where: { jobCardId: id }
    })

    // Delete job card
    await prisma.jobCard.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Job card deleted successfully" })
  } catch (error) {
    console.error("Error deleting job card:", error)
    return NextResponse.json({ error: "Failed to delete job card" }, { status: 500 })
  }
}

