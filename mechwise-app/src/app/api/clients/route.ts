import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || "All"

    const where: any = { workshopId }

    if (type === "Individual" || type === "Business") {
      where.clientType = type
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { businessName: { contains: search } },
        { mobilePhone: { contains: search } },
        { email: { contains: search } },
        { clientVehicles: { some: { vehicle: { registration: { contains: search } } } } }
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        clientVehicles: {
          include: {
            vehicle: true
          }
        },
        invoices: {
          select: {
            finalAmount: true,
            paymentStatus: true
          }
        },
        jobCards: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      clientType,
      firstName,
      lastName,
      businessName,
      mobilePhone,
      email,
      abn,
      address,
      suburb,
      postcode,
      preferredContact,
      notes,
    } = body

    const client = await prisma.client.create({
      data: {
        workshopId,
        clientType: clientType || "Individual",
        firstName,
        lastName,
        businessName,
        mobilePhone,
        email,
        abn,
        address,
        suburb,
        postcode,
        preferredContact: preferredContact || "SMS",
        notes,
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
