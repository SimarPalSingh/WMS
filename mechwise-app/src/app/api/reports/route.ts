import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "Q1" // Q1, Q2, Q3, Q4, FY

    // Aggregate Invoices (Revenue)
    const invoices = await prisma.invoice.findMany({
      where: { workshopId },
      include: { lines: true, payments: true }
    })

    const totalRevenueIncGst = invoices.reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)
    const totalRevenueExGst = invoices.reduce((acc, inv) => acc + (inv.subtotalExGst || 0), 0)
    const totalGstCollected = invoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0)
    const totalPaidRevenue = invoices.reduce((acc, inv) => {
      const paid = inv.payments.reduce((pAcc, p) => pAcc + p.amount, 0)
      return acc + paid
    }, 0)

    // Staff Performance Metrics
    const staff = await prisma.staff.findMany({
      where: { workshopId, isActive: true },
      include: {
        assignedJobCards: {
          include: { lines: true }
        }
      }
    })

    const staffProductivity = staff.map((s) => {
      const jobsCompleted = s.assignedJobCards.filter((j) => j.status === "Completed").length
      const totalJobValue = s.assignedJobCards.reduce((acc, j) => acc + j.totalExGst, 0)
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName || ""}`,
        role: s.role,
        isMvrlCertified: s.isMvrlCertified,
        jobsAssigned: s.assignedJobCards.length,
        jobsCompleted,
        totalJobValue
      }
    })

    // Monthly Chart Distribution (Simulation for FY 2025-26)
    const monthlyRevenue = [
      { month: "Jul", revenue: 18450, expenses: 8200, profit: 10250 },
      { month: "Aug", revenue: 21200, expenses: 9100, profit: 12100 },
      { month: "Sep", revenue: 19800, expenses: 8900, profit: 10900 },
      { month: "Oct", revenue: 24500, expenses: 10400, profit: 14100 },
      { month: "Nov", revenue: 22900, expenses: 9800, profit: 13100 },
      { month: "Dec", revenue: 28400, expenses: 12100, profit: 16300 },
      { month: "Jan", revenue: 26100, expenses: 11200, profit: 14900 },
    ]

    // Service Type Breakdown
    const serviceTypeBreakdown = [
      { name: "Scheduled Logbook", value: 45, color: "#1B2A4A" },
      { name: "Brakes & Suspension", value: 25, color: "#E8920D" },
      { name: "NSW Pink Slip Inspections", value: 18, color: "#7C3AED" },
      { name: "Air Conditioning (ARC)", value: 12, color: "#059669" },
    ]

    return NextResponse.json({
      period,
      financials: {
        totalRevenueIncGst,
        totalRevenueExGst,
        totalGstCollected,
        totalPaidRevenue,
        avgInvoiceValue: invoices.length > 0 ? totalRevenueIncGst / invoices.length : 0,
        totalInvoicesCount: invoices.length,
        basQuarter: "Q1 2025-26 (Jul - Sep)",
        gstPayableATO: totalGstCollected
      },
      monthlyRevenue,
      serviceTypeBreakdown,
      staffProductivity
    })
  } catch (error) {
    console.error("Error generating reports:", error)
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 })
  }
}
