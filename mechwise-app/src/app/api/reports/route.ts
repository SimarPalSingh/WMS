import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const workshopId = session?.workshopId || "dhalla-auto-nsw"

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "Q1" // Q1, Q2, Q3, Q4, FY25-26

    // Australian Financial Year 2025-2026 Quarter Date Range Mapping
    // Q1: 1 July 2025 - 30 September 2025
    // Q2: 1 October 2025 - 31 December 2025
    // Q3: 1 January 2026 - 31 March 2026
    // Q4: 1 April 2026 - 30 June 2026
    // FY: 1 July 2025 - 30 June 2026
    const currentYear = new Date().getFullYear() // 2026
    let startDate: Date
    let endDate: Date
    let monthsInPeriod: { key: string; label: string; monthIndex: number; year: number }[] = []

    if (period === "Q1") {
      startDate = new Date(2025, 6, 1, 0, 0, 0) // 1 Jul 2025
      endDate = new Date(2025, 8, 30, 23, 59, 59) // 30 Sep 2025
      monthsInPeriod = [
        { key: "2025-07", label: "Jul", monthIndex: 6, year: 2025 },
        { key: "2025-08", label: "Aug", monthIndex: 7, year: 2025 },
        { key: "2025-09", label: "Sep", monthIndex: 8, year: 2025 }
      ]
    } else if (period === "Q2") {
      startDate = new Date(2025, 9, 1, 0, 0, 0) // 1 Oct 2025
      endDate = new Date(2025, 11, 31, 23, 59, 59) // 31 Dec 2025
      monthsInPeriod = [
        { key: "2025-10", label: "Oct", monthIndex: 9, year: 2025 },
        { key: "2025-11", label: "Nov", monthIndex: 10, year: 2025 },
        { key: "2025-12", label: "Dec", monthIndex: 11, year: 2025 }
      ]
    } else if (period === "Q3") {
      startDate = new Date(2026, 0, 1, 0, 0, 0) // 1 Jan 2026
      endDate = new Date(2026, 2, 31, 23, 59, 59) // 31 Mar 2026
      monthsInPeriod = [
        { key: "2026-01", label: "Jan", monthIndex: 0, year: 2026 },
        { key: "2026-02", label: "Feb", monthIndex: 1, year: 2026 },
        { key: "2026-03", label: "Mar", monthIndex: 2, year: 2026 }
      ]
    } else if (period === "Q4") {
      startDate = new Date(2026, 3, 1, 0, 0, 0) // 1 Apr 2026
      endDate = new Date(2026, 5, 30, 23, 59, 59) // 30 Jun 2026
      monthsInPeriod = [
        { key: "2026-04", label: "Apr", monthIndex: 3, year: 2026 },
        { key: "2026-05", label: "May", monthIndex: 4, year: 2026 },
        { key: "2026-06", label: "Jun", monthIndex: 5, year: 2026 }
      ]
    } else {
      // Full Financial Year (FY25-26)
      startDate = new Date(2025, 6, 1, 0, 0, 0) // 1 Jul 2025
      endDate = new Date(2026, 5, 30, 23, 59, 59) // 30 Jun 2026
      monthsInPeriod = [
        { key: "2025-07", label: "Jul", monthIndex: 6, year: 2025 },
        { key: "2025-08", label: "Aug", monthIndex: 7, year: 2025 },
        { key: "2025-09", label: "Sep", monthIndex: 8, year: 2025 },
        { key: "2025-10", label: "Oct", monthIndex: 9, year: 2025 },
        { key: "2025-11", label: "Nov", monthIndex: 10, year: 2025 },
        { key: "2025-12", label: "Dec", monthIndex: 11, year: 2025 },
        { key: "2026-01", label: "Jan", monthIndex: 0, year: 2026 },
        { key: "2026-02", label: "Feb", monthIndex: 1, year: 2026 },
        { key: "2026-03", label: "Mar", monthIndex: 2, year: 2026 },
        { key: "2026-04", label: "Apr", monthIndex: 3, year: 2026 },
        { key: "2026-05", label: "May", monthIndex: 4, year: 2026 },
        { key: "2026-06", label: "Jun", monthIndex: 5, year: 2026 }
      ]
    }

    // 1. Customer Invoices (Sales & Outgoing GST 1A - ONLY PAID INVOICES FOR SELECTED PERIOD)
    const invoices = await prisma.invoice.findMany({
      where: {
        workshopId,
        paymentStatus: "Paid",
        invoiceDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { lines: true, payments: true }
    })

    const totalRevenueIncGst = invoices.reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)
    const totalRevenueExGst = invoices.reduce((acc, inv) => acc + (inv.subtotalExGst || 0), 0)
    const totalGstCollected = invoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0)
    const totalDiscountGiven = invoices.reduce((acc, inv) => acc + (inv.discountExGst || 0), 0)

    // 2. Supplier Invoices (Expenses & Input Tax Credits 1B - ONLY PAID INVOICES FOR SELECTED PERIOD)
    const supplierInvoices = await prisma.supplierInvoice.findMany({
      where: {
        workshopId,
        paymentStatus: "Paid",
        invoiceDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { lines: true, supplier: true }
    })

    const totalSupplierExpensesIncGst = supplierInvoices.reduce((acc, inv) => acc + (inv.totalIncGst || 0), 0)
    const totalSupplierExpensesExGst = supplierInvoices.reduce((acc, inv) => acc + (inv.subtotalExGst || 0), 0)
    const totalSupplierGstPaid = supplierInvoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0)

    // 3. Australian BAS Box Calculations
    const netGstPayableToATO = Math.round((totalGstCollected - totalSupplierGstPaid) * 100) / 100
    const netOperatingProfit = Math.round((totalRevenueExGst - totalSupplierExpensesExGst) * 100) / 100

    // 4. Revenue Breakdown across ALL Categories & Streams
    const [allParts, jobCategories] = await Promise.all([
      prisma.part.findMany({ where: { workshopId } }),
      prisma.jobCategory.findMany({ where: { workshopId } })
    ])

    const partCategoryMap = new Map<string, string>()
    allParts.forEach((p) => {
      if (p.name && p.category) partCategoryMap.set(p.name.toLowerCase(), p.category)
      if (p.partNumber && p.category) partCategoryMap.set(p.partNumber.toLowerCase(), p.category)
    })

    const categoryTotals: Record<string, number> = {
      "Labour & Diagnostics": 0,
      "Oils & Fluids": 0,
      "Brakes & Suspension": 0,
      "Filters": 0,
      "Ignition & Electrical": 0,
      "Tyres & Wheels": 0,
      "Safety Inspections": 0,
      "General Parts & Supplies": 0
    }

    let partsRevenue = 0
    let labourRevenue = 0
    let subcontractRevenue = 0

    invoices.forEach((inv) => {
      inv.lines.forEach((line) => {
        const lineTotal = line.lineTotalExGst || (line.qty * line.unitPriceExGst) || 0

        if (line.lineType === "Labour") {
          labourRevenue += lineTotal
          const catName = line.description?.toLowerCase().includes("safety") || line.description?.toLowerCase().includes("pink slip")
            ? "Safety Inspections"
            : line.description?.toLowerCase().includes("brake")
            ? "Brakes & Suspension"
            : "Labour & Diagnostics"
          categoryTotals[catName] = (categoryTotals[catName] || 0) + lineTotal
        } else if (line.lineType === "Part") {
          partsRevenue += lineTotal
          let detectedCategory = "General Parts & Supplies"
          const descLower = line.description?.toLowerCase() || ""
          if (partCategoryMap.has(descLower)) {
            detectedCategory = partCategoryMap.get(descLower)!
          } else if (descLower.includes("oil") || descLower.includes("fluid") || descLower.includes("coolant") || descLower.includes("castrol")) {
            detectedCategory = "Oils & Fluids"
          } else if (descLower.includes("brake") || descLower.includes("pad") || descLower.includes("rotor") || descLower.includes("bendix")) {
            detectedCategory = "Brakes & Suspension"
          } else if (descLower.includes("filter") || descLower.includes("ryco")) {
            detectedCategory = "Filters"
          } else if (descLower.includes("plug") || descLower.includes("spark") || descLower.includes("battery") || descLower.includes("ignition")) {
            detectedCategory = "Ignition & Electrical"
          } else if (descLower.includes("tyre") || descLower.includes("wheel")) {
            detectedCategory = "Tyres & Wheels"
          }
          categoryTotals[detectedCategory] = (categoryTotals[detectedCategory] || 0) + lineTotal
        } else {
          subcontractRevenue += lineTotal
          categoryTotals["General Parts & Supplies"] = (categoryTotals["General Parts & Supplies"] || 0) + lineTotal
        }
      })
    })

    const totalCalculatedSales = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

    const categoryColors: Record<string, string> = {
      "Labour & Diagnostics": "#1B2A4A",
      "Oils & Fluids": "#E8920D",
      "Brakes & Suspension": "#DC2626",
      "Filters": "#2563EB",
      "Ignition & Electrical": "#7C3AED",
      "Tyres & Wheels": "#059669",
      "Safety Inspections": "#D97706",
      "General Parts & Supplies": "#64748B"
    }

    const serviceTypeBreakdown = Object.entries(categoryTotals)
      .map(([name, amount]) => {
        const pct = totalCalculatedSales > 0 ? Math.round((amount / totalCalculatedSales) * 100) : 0
        return {
          name,
          value: pct,
          amount: Math.round(amount * 100) / 100,
          color: categoryColors[name] || "#94A3B8"
        }
      })
      .sort((a, b) => b.amount - a.amount)

    // 5. Staff Performance Metrics for Selected Period
    const staff = await prisma.staff.findMany({
      where: { workshopId, isActive: true },
      include: {
        assignedJobCards: {
          where: {
            dateCompleted: {
              gte: startDate,
              lte: endDate
            }
          },
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

    // 6. Dynamic Monthly Trend for the Selected Period
    // Aggregates real invoice totals by month for the active quarter/FY
    const monthlyRevenue = monthsInPeriod.map((m) => {
      const monthInvoices = invoices.filter((inv) => {
        const d = new Date(inv.invoiceDate)
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year
      })
      const monthSuppInvoices = supplierInvoices.filter((si) => {
        const d = new Date(si.invoiceDate)
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year
      })

      const revenue = monthInvoices.reduce((sum, i) => sum + (i.subtotalExGst || 0), 0)
      const expenses = monthSuppInvoices.reduce((sum, si) => sum + (si.subtotalExGst || 0), 0)
      const profit = Math.round((revenue - expenses) * 100) / 100

      return {
        month: m.label,
        revenue: Math.round(revenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit
      }
    })

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
