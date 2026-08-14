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
