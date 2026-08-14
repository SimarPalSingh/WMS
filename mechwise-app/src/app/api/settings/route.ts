import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const [workshop, staffMembers, users] = await Promise.all([
      prisma.workshop.findUnique({
        where: { id: workshopId },
        include: { bays: true, jobCategories: true }
      }),
      prisma.staff.findMany({ where: { workshopId } }),
      prisma.user.findMany({ where: { workshopId } })
    ])

    return NextResponse.json({
      workshop,
      staff: staffMembers,
      users
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      businessName,
      abn,
      mvrlNumber,
      arcNumber,
      phone,
      mobile,
      email,
      address,
      suburb,
      postcode,
      defaultLabourRate,
      smsSenderName,
      smsWindowStart,
      smsWindowEnd,
    } = body

    const updated = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        businessName,
        abn,
        mvrlNumber,
        arcNumber,
        phone,
        mobile,
        email,
        address,
        suburb,
        postcode,
        defaultLabourRate: defaultLabourRate ? parseFloat(defaultLabourRate) : undefined,
        smsSenderName,
        smsWindowStart,
        smsWindowEnd,
      }
    })

    return NextResponse.json({ workshop: updated })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
