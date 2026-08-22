import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const staffMembers = await prisma.staff.findMany({
      where: { workshopId },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({ staff: staffMembers })
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const { firstName, lastName, role, mobile, email, hourlyRate, isMvrlCertified, isArcCertified, isActive } = body

    if (!firstName || !role) {
      return NextResponse.json({ error: "First name and role are required" }, { status: 400 })
    }

    const newStaff = await prisma.staff.create({
      data: {
        workshopId,
        firstName,
        lastName: lastName || null,
        role,
        mobile: mobile || null,
        email: email || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isMvrlCertified: Boolean(isMvrlCertified),
        isArcCertified: Boolean(isArcCertified),
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    })

    return NextResponse.json({ staff: newStaff }, { status: 201 })
  } catch (error) {
    console.error("Error creating staff:", error)
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const { id, firstName, lastName, role, mobile, email, hourlyRate, isMvrlCertified, isArcCertified, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: {
        firstName,
        lastName: lastName !== undefined ? lastName : undefined,
        role,
        mobile: mobile !== undefined ? mobile : undefined,
        email: email !== undefined ? email : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isMvrlCertified: isMvrlCertified !== undefined ? Boolean(isMvrlCertified) : undefined,
        isArcCertified: isArcCertified !== undefined ? Boolean(isArcCertified) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    })

    return NextResponse.json({ staff: updated })
  } catch (error) {
    console.error("Error updating staff:", error)
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 })
    }

    await prisma.staff.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 })
  }
}
