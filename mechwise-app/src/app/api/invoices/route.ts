import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "All"
    const search = searchParams.get("search") || ""

    const where: any = { workshopId }

    if (status && status !== "All") {
      where.paymentStatus = status
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { vehicle: { registration: { contains: search } } },
        { client: { firstName: { contains: search } } },
        { client: { lastName: { contains: search } } },
        { client: { businessName: { contains: search } } }
      ]
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        vehicle: true,
        jobCard: true,
        lines: true,
        payments: true
      },
      orderBy: { invoiceDate: "desc" }
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      clientId,
      vehicleId,
      invoiceDate,
      dueDate,
      isGstFree,
      discountExGst = 0,
      paymentStatus = "Unpaid",
      notes,
      futureNotes,
      lines = [],
      isNewClient,
      newClientData,
      isNewVehicle,
      newVehicleData
    } = body

    let finalClientId = clientId
    let finalVehicleId = vehicleId

    // 1. Create new client on the fly if requested
    if (isNewClient && newClientData) {
      if (!newClientData.mobilePhone && !newClientData.firstName && !newClientData.businessName) {
        return NextResponse.json({ error: "Client name or phone is required" }, { status: 400 })
      }

      const client = await prisma.client.create({
        data: {
          workshopId,
          clientType: newClientData.clientType || "Individual",
          firstName: newClientData.firstName ? newClientData.firstName.trim() : null,
          lastName: newClientData.lastName ? newClientData.lastName.trim() : null,
          businessName: newClientData.businessName ? newClientData.businessName.trim() : null,
          mobilePhone: newClientData.mobilePhone ? newClientData.mobilePhone.trim() : null,
          email: newClientData.email ? newClientData.email.trim() : null,
          address: newClientData.address ? newClientData.address.trim() : null,
          suburb: newClientData.suburb ? newClientData.suburb.trim() : "Kingswood",
          state: newClientData.state || "NSW",
          postcode: newClientData.postcode ? newClientData.postcode.trim() : null,
        }
      })
      finalClientId = client.id
    }

    // 2. Create new vehicle on the fly if requested
    if (isNewVehicle && newVehicleData) {
      if (!newVehicleData.registration) {
        return NextResponse.json({ error: "Registration plate is required" }, { status: 400 })
      }

      const upperRego = newVehicleData.registration.toUpperCase().replace(/\s+/g, "")
      const vehicle = await prisma.vehicle.create({
        data: {
          workshopId,
          registration: upperRego,
          make: newVehicleData.make || "Toyota",
          model: newVehicleData.model || "Hilux",
          year: newVehicleData.year ? parseInt(newVehicleData.year) : 2021,
          bodyType: newVehicleData.bodyType || "Sedan",
          fuelType: newVehicleData.fuelType || "Petrol",
          vin: newVehicleData.vin ? newVehicleData.vin.trim().toUpperCase() : null,
          engineNumber: newVehicleData.engineNumber ? newVehicleData.engineNumber.trim().toUpperCase() : null,
          engineCapacity: newVehicleData.engineCapacity ? newVehicleData.engineCapacity.trim() : null,
        }
      })
      finalVehicleId = vehicle.id
    }

    // 3. Establish strict single ownership link if both client and vehicle exist
    if (finalClientId && finalVehicleId) {
      await prisma.clientVehicle.deleteMany({
        where: { vehicleId: finalVehicleId }
      })
      await prisma.clientVehicle.create({
        data: {
          clientId: finalClientId,
          vehicleId: finalVehicleId,
          relationship: "Owner",
          isPrimaryOwner: true
        }
      })
    }

    if (!finalClientId || !finalVehicleId) {
      return NextResponse.json({ error: "Client and Vehicle are required for direct Tax Invoice generation." }, { status: 400 })
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: "At least one line item is required." }, { status: 400 })
    }

    // Gapless sequential invoice number generation: INV-0001
    const count = await prisma.invoice.count({ where: { workshopId } })
    const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`

    let subtotalExGst = 0
    const formattedLines = lines.map((l: any, idx: number) => {
      const qty = parseFloat(l.qty) || 1
      const unitPrice = parseFloat(l.unitPriceExGst) || 0
      const total = Math.round(qty * unitPrice * 100) / 100
      subtotalExGst += total
      const gstRate = isGstFree ? 0 : 0.10
      const gstAmount = isGstFree ? 0 : Math.round(total * gstRate * 100) / 100

      return {
        lineType: l.lineType || "Labour",
        description: l.description || "General Service Item",
        qty,
        unitPriceExGst: unitPrice,
        lineTotalExGst: total,
        gstRate,
        gstAmount,
        sortOrder: idx
      }
    })

    const disc = parseFloat(discountExGst) || 0
    const netSubtotal = Math.max(0, subtotalExGst - disc)
    const totalGst = isGstFree ? 0 : Math.round(netSubtotal * 0.10 * 100) / 100
    const finalAmount = isGstFree ? netSubtotal : Math.round((netSubtotal + totalGst) * 100) / 100

    const invoice = await prisma.invoice.create({
      data: {
        workshopId,
        invoiceNumber,
        clientId: finalClientId,
        vehicleId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days net
        isGstFree: Boolean(isGstFree),
        subtotalExGst: Math.round(subtotalExGst * 100) / 100,
        discountExGst: disc,
        discountAmount: disc,
        gstAmount: totalGst,
        finalAmount,
        paymentStatus: paymentStatus || "Unpaid",
        notes: notes || null,
        futureNotes: futureNotes || null,
        lines: {
          create: formattedLines
        }
      },
      include: {
        client: true,
        vehicle: true,
        lines: true
      }
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error("Error creating direct customer invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
