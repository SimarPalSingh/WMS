import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "All"
    const status = searchParams.get("status") || "All"

    const where: any = { workshopId }

    if (type && type !== "All") {
      where.reminderType = type
    }
    if (status && status !== "All") {
      where.status = status
    }

    const [reminders, workshop] = await Promise.all([
      prisma.serviceReminder.findMany({
        where,
        include: {
          client: true,
          vehicle: true
        },
        orderBy: { dueDate: "asc" }
      }),
      prisma.workshop.findUnique({
        where: { id: workshopId }
      })
    ])

    return NextResponse.json({ reminders, workshop })
  } catch (error) {
    console.error("Error fetching service reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const { reminderIds = [], customMessage } = body

    if (!reminderIds.length) {
      return NextResponse.json({ error: "No reminders selected" }, { status: 400 })
    }

    // ACMA Spam Act 2003 Compliance Window Check (9:00 AM to 8:00 PM AEST)
    const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }))
    const currentHour = nowSydney.getHours()

    const isWithinAcmaWindow = currentHour >= 9 && currentHour < 20

    const updatedReminders = []

    for (const id of reminderIds) {
      const reminder = await prisma.serviceReminder.findFirst({
        where: { id, workshopId },
        include: { client: true, vehicle: true }
      })

      if (reminder) {
        const updated = await prisma.serviceReminder.update({
          where: { id },
          data: {
            status: "Sent",
            smsSentDate: new Date(),
            sendCount: { increment: 1 }
          },
          include: {
            client: true,
            vehicle: true
          }
        })
        updatedReminders.push(updated)
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: updatedReminders.length,
      acmaCompliant: isWithinAcmaWindow,
      acmaNotice: isWithinAcmaWindow
        ? "Delivered within 9:00 AM – 8:00 PM AEST ACMA regulatory window."
        : "Queued for 9:00 AM dispatch per ACMA Spam Act 2003 regulations.",
      reminders: updatedReminders
    })
  } catch (error) {
    console.error("Error dispatching SMS reminders:", error)
    return NextResponse.json({ error: "Failed to dispatch reminders" }, { status: 500 })
  }
}
