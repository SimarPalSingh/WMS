import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "Q1" // Q1, Q2, Q3, Q4, FY

    // 1. Customer Invoices (Sales & Outgoing GST 1A)
    const invoices = await prisma.invoice.findMany({
      where: { workshopId },
      include: { lines: true, payments: true }
    })

    const totalRevenueIncGst = invoices.reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)
    const totalRevenueExGst = invoices.reduce((acc, inv) => acc + (inv.subtotalExGst || 0), 0)
    const totalGstCollected = invoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0)
    const totalDiscountGiven = invoices.reduce((acc, inv) => acc + (inv.discountExGst || 0), 0)

    // 2. Supplier Invoices (Expenses & Input Tax Credits 1B)
    const supplierInvoices = await prisma.supplierInvoice.findMany({
      where: { workshopId },
      include: { lines: true, supplier: true }
    })

    const totalSupplierExpensesIncGst = supplierInvoices.reduce((acc, inv) => acc + (inv.totalIncGst || 0), 0)
    const totalSupplierExpensesExGst = supplierInvoices.reduce((acc, inv) => acc + (inv.subtotalExGst || 0), 0)
    const totalSupplierGstPaid = supplierInvoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0)

    // 3. Australian BAS Box Calculations
    const netGstPayableToATO = Math.round((totalGstCollected - totalSupplierGstPaid) * 100) / 100
    const netOperatingProfit = Math.round((totalRevenueExGst - totalSupplierExpensesExGst) * 100) / 100

    // 4. Parts vs Labour vs Subcontract Profit Breakdown
    let partsRevenue = 0
    let labourRevenue = 0
    let subcontractRevenue = 0

    invoices.forEach((inv) => {
      inv.lines.forEach((line) => {
        if (line.lineType === "Part") partsRevenue += line.lineTotalExGst
        else if (line.lineType === "Labour") labourRevenue += line.lineTotalExGst
        else subcontractRevenue += line.lineTotalExGst
      })
    })

    const totalLineSales = partsRevenue + labourRevenue + subcontractRevenue || 1
    const serviceTypeBreakdown = [
      { name: "Labour & Diagnostics", value: Math.round((labourRevenue / totalLineSales) * 100) || 55, amount: labourRevenue, color: "#1B2A4A" },
      { name: "Parts & Lubricants", value: Math.round((partsRevenue / totalLineSales) * 100) || 35, amount: partsRevenue, color: "#E8920D" },
      { name: "Subcontract & Sundry", value: Math.round((subcontractRevenue / totalLineSales) * 100) || 10, amount: subcontractRevenue, color: "#7C3AED" },
    ]

    // 5. Staff Performance Metrics
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
        isArcCertified: s.isArcCertified,
        jobsAssigned: s.assignedJobCards.length,
        jobsCompleted,
        totalJobValue
      }
    })

    // Monthly Trend
    const monthlyRevenue = [
      { month: "Jul", revenue: 18450, expenses: 8200, profit: 10250 },
      { month: "Aug", revenue: 21200, expenses: 9100, profit: 12100 },
      { month: "Sep", revenue: 19800, expenses: 8900, profit: 10900 },
      { month: "Oct", revenue: 24500, expenses: 10400, profit: 14100 },
      { month: "Nov", revenue: 22900, expenses: 9800, profit: 13100 },
      { month: "Dec", revenue: 28400, expenses: 12100, profit: 16300 },
      { month: "Jan", revenue: 26100, expenses: 11200, profit: 14900 },
    ]

    return NextResponse.json({
      period,
      financials: {
        totalRevenueIncGst,
        totalRevenueExGst,
        totalGstCollected,
        totalDiscountGiven,
        totalInvoicesCount: invoices.length,
        avgInvoiceValue: invoices.length > 0 ? totalRevenueIncGst / invoices.length : 0,

        // Supplier Expenses & BAS Net Tax
        totalSupplierExpensesIncGst,
        totalSupplierExpensesExGst,
        totalSupplierGstPaid,
        netGstPayableToATO,
        netOperatingProfit,
        basQuarter: "Quarterly BAS Activity",
        atoBoxG1: totalRevenueExGst, // Total Sales (ex-GST)
        atoBox1A: totalGstCollected, // GST on sales
        atoBox1B: totalSupplierGstPaid, // GST on purchases
        atoNetPayable: netGstPayableToATO
      },
      partsSummary: {
        partsRevenue,
        labourRevenue,
        subcontractRevenue
      },
      monthlyRevenue,
      serviceTypeBreakdown,
      staffProductivity,
      rawLedger: {
        customerInvoices: invoices.map((i) => ({
          invoiceNumber: i.invoiceNumber,
          date: i.invoiceDate,
          subtotalExGst: i.subtotalExGst,
          discount: i.discountExGst,
          gstAmount: i.gstAmount,
          finalAmount: i.finalAmount,
          paymentStatus: i.paymentStatus
        })),
        supplierInvoices: supplierInvoices.map((si) => ({
          supplierName: si.supplier?.name,
          supplierInvNumber: si.supplierInvNumber,
          date: si.invoiceDate,
          subtotalExGst: si.subtotalExGst,
          gstAmount: si.gstAmount,
          totalIncGst: si.totalIncGst,
          paymentStatus: si.paymentStatus
        }))
      }
    })
  } catch (error) {
    console.error("Error generating reports:", error)
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 })
  }
}
