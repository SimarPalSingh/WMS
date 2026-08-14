import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Lookup client by ID or demo token
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: token },
          { id: "cli-01" } // fallback demo link
        ]
      },
      include: {
        workshop: true,
        clientVehicles: {
          include: {
            vehicle: {
              include: {
                maintenanceHist: { orderBy: { serviceDate: "desc" } },
                jobCards: {
                  include: { invoice: true, lines: true },
                  orderBy: { dateIn: "desc" }
                }
              }
            }
          }
        },
        invoices: {
          orderBy: { invoiceDate: "desc" },
          include: { lines: true, payments: true }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: "Portal link expired or invalid" }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error fetching portal data:", error)
    return NextResponse.json({ error: "Failed to load customer portal" }, { status: 500 })
  }
}
