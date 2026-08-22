import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = { workshopId, isActive: true }

    if (category && category !== "All") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { partNumber: { contains: search } }
      ]
    }

    const [parts, suppliers, categories] = await Promise.all([
      prisma.part.findMany({
        where,
        include: { supplier: true },
        orderBy: { name: "asc" }
      }),
      prisma.supplier.findMany({
        where: { workshopId, isActive: true },
        orderBy: { name: "asc" }
      }),
      prisma.part.findMany({
        where: { workshopId },
        select: { category: true },
        distinct: ["category"]
      })
    ])

    const distinctCategories = Array.from(
      new Set(categories.map((c) => c.category).filter(Boolean))
    )

    return NextResponse.json({
      parts,
      suppliers,
      categories: distinctCategories
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    // Handle bulk import from Excel or single part creation
    if (Array.isArray(body)) {
      const createdOrUpdated = []
      for (const item of body) {
        if (!item.partNumber || !item.name) continue

        const part = await prisma.part.upsert({
          where: {
            workshopId_partNumber: {
              workshopId,
              partNumber: String(item.partNumber).trim()
            }
          },
          update: {
            name: item.name,
            category: item.category || "General",
            costPrice: parseFloat(item.costPrice || 0),
            retailPrice: parseFloat(item.retailPrice || 0),
            stockQty: parseInt(item.stockQty || item.availableStock || 0),
            availableStock: parseInt(item.availableStock || item.stockQty || 0),
            maxStockQty: parseInt(item.maxStockQty || 50),
            minStockQty: parseInt(item.minStockQty || 2),
            restockMinQty: parseInt(item.restockMinQty || 5),
            supplierId: item.supplierId || null,
          },
          create: {
            workshopId,
            partNumber: String(item.partNumber).trim(),
            name: item.name,
            category: item.category || "General",
            costPrice: parseFloat(item.costPrice || 0),
            retailPrice: parseFloat(item.retailPrice || 0),
            stockQty: parseInt(item.stockQty || item.availableStock || 0),
            availableStock: parseInt(item.availableStock || item.stockQty || 0),
            maxStockQty: parseInt(item.maxStockQty || 50),
            minStockQty: parseInt(item.minStockQty || 2),
            restockMinQty: parseInt(item.restockMinQty || 5),
            supplierId: item.supplierId || null,
          }
        })
        createdOrUpdated.push(part)
      }
      return NextResponse.json({ success: true, count: createdOrUpdated.length })
    }

    const {
      partNumber,
      name,
      category,
      costPrice,
      retailPrice,
      availableStock,
      stockQty,
      maxStockQty,
      minStockQty,
      restockMinQty,
      supplierId,
      isNewSupplier,
      newSupplierData
    } = body

    if (!partNumber || !name) {
      return NextResponse.json({ error: "Part number and name are required" }, { status: 400 })
    }

    let finalSupplierId = supplierId || null

    if (isNewSupplier && newSupplierData?.name) {
      const createdSupplier = await prisma.supplier.create({
        data: {
          workshopId,
          name: newSupplierData.name.trim(),
          abn: newSupplierData.abn ? newSupplierData.abn.trim() : null,
          contactName: newSupplierData.contactName ? newSupplierData.contactName.trim() : null,
          phone: newSupplierData.phone ? newSupplierData.phone.trim() : null,
          email: newSupplierData.email ? newSupplierData.email.trim() : null,
          address: newSupplierData.address ? newSupplierData.address.trim() : null,
          accountNo: newSupplierData.accountNo ? newSupplierData.accountNo.trim() : null,
          isActive: true
        }
      })
      finalSupplierId = createdSupplier.id
    }

    const qty = parseInt(availableStock || stockQty || 0)

    const newPart = await prisma.part.create({
      data: {
        workshopId,
        partNumber: partNumber.trim(),
        name: name.trim(),
        category: category || "General",
        costPrice: parseFloat(costPrice || 0),
        retailPrice: parseFloat(retailPrice || 0),
        stockQty: qty,
        availableStock: qty,
        maxStockQty: parseInt(maxStockQty || 50),
        minStockQty: parseInt(minStockQty || 2),
        restockMinQty: parseInt(restockMinQty || 5),
        supplierId: finalSupplierId
      },
      include: {
        supplier: true
      }
    })

    return NextResponse.json({ part: newPart }, { status: 201 })
  } catch (error) {
    console.error("Error creating part:", error)
    return NextResponse.json({ error: "Failed to create part" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"
    const body = await request.json()

    const {
      id,
      partNumber,
      name,
      category,
      costPrice,
      retailPrice,
      availableStock,
      stockQty,
      maxStockQty,
      minStockQty,
      restockMinQty,
      supplierId,
      isNewSupplier,
      newSupplierData,
      restockAmount // For quick restock action
    } = body

    if (!id) {
      return NextResponse.json({ error: "Part ID is required" }, { status: 400 })
    }

    let updateData: any = {}

    if (restockAmount) {
      const current = await prisma.part.findUnique({ where: { id } })
      const added = parseInt(restockAmount)
      const newQty = (current?.availableStock || 0) + added
      updateData.availableStock = newQty
      updateData.stockQty = newQty
    } else {
      if (partNumber !== undefined) updateData.partNumber = partNumber.trim()
      if (name !== undefined) updateData.name = name.trim()
      if (category !== undefined) updateData.category = category
      if (costPrice !== undefined) updateData.costPrice = parseFloat(costPrice)
      if (retailPrice !== undefined) updateData.retailPrice = parseFloat(retailPrice)
      if (availableStock !== undefined) {
        updateData.availableStock = parseInt(availableStock)
        updateData.stockQty = parseInt(availableStock)
      }
      if (maxStockQty !== undefined) updateData.maxStockQty = parseInt(maxStockQty)
      if (minStockQty !== undefined) updateData.minStockQty = parseInt(minStockQty)
      if (restockMinQty !== undefined) updateData.restockMinQty = parseInt(restockMinQty)

      if (isNewSupplier && newSupplierData?.name) {
        const createdSupplier = await prisma.supplier.create({
          data: {
            workshopId,
            name: newSupplierData.name.trim(),
            abn: newSupplierData.abn ? newSupplierData.abn.trim() : null,
            contactName: newSupplierData.contactName ? newSupplierData.contactName.trim() : null,
            phone: newSupplierData.phone ? newSupplierData.phone.trim() : null,
            email: newSupplierData.email ? newSupplierData.email.trim() : null,
            address: newSupplierData.address ? newSupplierData.address.trim() : null,
            accountNo: newSupplierData.accountNo ? newSupplierData.accountNo.trim() : null,
            isActive: true
          }
        })
        updateData.supplierId = createdSupplier.id
      } else if (supplierId !== undefined) {
        updateData.supplierId = supplierId || null
      }
    }

    const updated = await prisma.part.update({
      where: { id },
      data: updateData,
      include: { supplier: true }
    })

    return NextResponse.json({ part: updated })
  } catch (error) {
    console.error("Error updating part:", error)
    return NextResponse.json({ error: "Failed to update part" }, { status: 500 })
  }
}
