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
