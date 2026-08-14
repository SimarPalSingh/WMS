import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const workshopId = "dhalla-auto-nsw"

    const [workshop, jobCards, clients, vehicles, invoices, reminders] = await Promise.all([
      prisma.workshop.findUnique({
        where: { id: workshopId },
        include: { bays: { orderBy: { displayOrder: "asc" } } }
      }),
      prisma.jobCard.findMany({
        where: { workshopId },
        include: {
          client: true,
          vehicle: true,
          staff: true,
          bay: true,
          lines: true
        },
        orderBy: { dateIn: "desc" }
      }),
      prisma.client.findMany({
        where: { workshopId },
        include: { clientVehicles: { include: { vehicle: true } } }
      }),
      prisma.vehicle.findMany({ where: { workshopId } }),
      prisma.invoice.findMany({
        where: { workshopId },
        include: { client: true, vehicle: true }
      }),
      prisma.serviceReminder.findMany({
        where: { workshopId },
        include: { client: true, vehicle: true }
      })
    ])

    return NextResponse.json({
      workshop,
      jobCards,
      clients,
      vehicles,
      invoices,
      reminders
    })
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
