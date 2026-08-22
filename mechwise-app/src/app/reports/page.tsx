"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  ShieldCheck,
  Percent,
  Lock,
  Unlock,
  Building2,
  PieChart as PieIcon,
  ArrowDownRight,
  CheckCircle2,
  FileText
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatAUD } from "@/lib/utils"
import * as XLSX from "xlsx"

export default function ReportsPage() {
  // Authentication PIN Gate (Strict workshop manager PIN: 1234)
  // No persistent session storage — PIN is strictly required every single time the reports are accessed
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState(false)

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("Q1")

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Workshop manager secure PIN
    if (pinInput === "1234") {
      setIsAuthenticated(true)
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  const handleLockReports = () => {
    setIsAuthenticated(false)
    setPinInput("")
    setPinError(false)
  }

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    fetch(`/api/reports?period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [period, isAuthenticated])

  const handleExportExcel = () => {
    if (!data) return
    const wb = XLSX.utils.book_new()

    // Sheet 1: BAS Summary & Financials
    const basSummaryData = [
      ["ATO BAS Box", "Description", "Amount ($ AUD)"],
      ["Box G1", "Total Taxable Sales (ex-GST)", data.financials?.atoBoxG1 || 0],
      ["Box 1A", "GST on Sales Collected (10%)", data.financials?.atoBox1A || 0],
      ["Box 1B", "GST on Purchases Paid (Claimable 10%)", data.financials?.atoBox1B || 0],
      ["Net ATO", "Net GST Payable to ATO (1A - 1B)", data.financials?.atoNetPayable || 0],
      ["Total Outgoings", "Supplier Expenses (ex-GST)", data.financials?.totalSupplierExpensesExGst || 0],
      ["Net Profit", "Net Operating Profit (ex-GST)", data.financials?.netOperatingProfit || 0],
    ]
    const wsBAS = XLSX.utils.aoa_to_sheet(basSummaryData)
    XLSX.utils.book_append_sheet(wb, wsBAS, "Australian BAS Summary")

    // Sheet 2: Customer Invoices Ledger
    if (data.rawLedger?.customerInvoices) {
      const wsCust = XLSX.utils.json_to_sheet(data.rawLedger.customerInvoices)
      XLSX.utils.book_append_sheet(wb, wsCust, "Customer Invoices")
    }

    // Sheet 3: Supplier Outgoings Ledger
    if (data.rawLedger?.supplierInvoices) {
      const wsSupp = XLSX.utils.json_to_sheet(data.rawLedger.supplierInvoices)
      XLSX.utils.book_append_sheet(wb, wsSupp, "Supplier Expenses")
    }

    XLSX.writeFile(wb, `Dhalla_Automotive_BAS_Report_${period}.xlsx`)
  }

  // 1. PIN Barrier View
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-amber-100 text-[#E8920D] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">Financial Security Check</h2>
            <p className="text-xs text-gray-500 mt-1">
              Australian BAS, P&L reports, and tax compliance data are restricted. Enter workshop manager PIN to unlock.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                placeholder="Enter 4-Digit PIN (e.g. 1234)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value)
                  setPinError(false)
                }}
                className={`w-full py-2.5 px-4 text-center font-mono text-lg font-bold tracking-widest border rounded-xl focus:outline-none focus:ring-2 ${
                  pinError
                    ? "border-red-500 ring-red-200 bg-red-50/50"
                    : "border-gray-300 focus:ring-[#E8920D]"
                }`}
              />
              {pinError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1.5">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1B2A4A] hover:bg-[#243656] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 text-[#E8920D]" />
              <span>Unlock Financial Hub</span>
            </button>
          </form>
          <p className="text-[10px] text-gray-400 font-mono">Dhalla Automotive • MVRL58941</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Calculating Australian BAS & Workshop Financial Analytics...
      </div>
    )
  }

  const { financials, monthlyRevenue, serviceTypeBreakdown, staffProductivity, partsSummary } = data || {}

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#E8920D]" />
            Reports & Australian BAS Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quarterly BAS Reconciliation (1A vs 1B), Net Income, Parts Profit Margin & Staff Productivity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Lock Hub button */}
          <button
            onClick={handleLockReports}
            className="px-3 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg text-xs font-semibold border border-gray-200 hover:border-red-200 transition-all flex items-center gap-1.5"
            title="Lock Financial Hub"
          >
            <Lock className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
            <span>Lock Hub</span>
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export BAS Excel (.xlsx)</span>
          </button>

          {/* Period Selector */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-200">
            {["Q1", "Q2", "Q3", "Q4", "FY25-26"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  period === p
                    ? "bg-[#1B2A4A] text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Australian BAS Net Tax Reconciliation Card */}
      <div className="bg-[#1B2A4A] text-white rounded-2xl p-6 shadow-md border border-[#243656] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#243656] pb-4">
          <div>
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest font-mono">
              ATO Business Activity Statement (BAS) Reconciliation
            </span>
            <h2 className="text-xl font-bold mt-0.5">GST Net Settlement Summary</h2>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-right">
            <span className="text-[10px] text-gray-300 uppercase block font-semibold">Net GST Payable to ATO</span>
            <span className="text-2xl font-mono font-black text-amber-400">
              {formatAUD(financials?.netGstPayableToATO || 0)}
            </span>
          </div>
        </div>

        {/* 4 BAS Box Breakdown Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#243656] p-3.5 rounded-xl border border-[#2d436b]">
            <span className="text-[10px] text-gray-400 font-mono block">Box G1 — Taxable Sales (Ex-GST)</span>
            <p className="text-lg font-bold font-mono text-white mt-1">
              {formatAUD(financials?.atoBoxG1 || 0)}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">Customer revenue ex-GST</p>
          </div>

          <div className="bg-[#243656] p-3.5 rounded-xl border border-[#2d436b]">
            <span className="text-[10px] text-amber-400 font-mono block">Box 1A — GST on Sales Collected</span>
            <p className="text-lg font-bold font-mono text-amber-300 mt-1">
              +{formatAUD(financials?.atoBox1A || 0)}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">10% GST from customer invoices</p>
          </div>

          <div className="bg-[#243656] p-3.5 rounded-xl border border-[#2d436b]">
            <span className="text-[10px] text-blue-300 font-mono block">Box 1B — GST on Purchases Paid</span>
            <p className="text-lg font-bold font-mono text-blue-300 mt-1">
              -{formatAUD(financials?.atoBox1B || 0)}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">Claimable input tax credit</p>
          </div>

          <div className="bg-[#243656] p-3.5 rounded-xl border border-[#2d436b]">
            <span className="text-[10px] text-emerald-400 font-mono block">Net Income (Ex-GST)</span>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {formatAUD(financials?.netOperatingProfit || 0)}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">Sales ex-GST − Supplier expenses</p>
          </div>
        </div>
      </div>

      {/* 2-Column Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expenses Chart */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
                Workshop Revenue & Net Margin Trend
              </h3>
              <p className="text-xs text-gray-500">7-month trailing performance ($ AUD)</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">+18.4% YoY</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => formatAUD(Number(val))}
                  contentStyle={{ backgroundColor: "#1B2A4A", borderRadius: 8, color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Customer Revenue" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Supplier Expenses" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#E8920D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Stream Breakdown Pie */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
              Revenue by Stream & Parts
            </h3>
            <p className="text-xs text-gray-500 mb-3">Labour vs Parts sales breakdown</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTypeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {serviceTypeBreakdown?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {serviceTypeBreakdown?.map((s: any) => (
              <div key={s.name} className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  ></span>
                  <span>{s.name}</span>
                </span>
                <span className="font-mono font-bold text-gray-800">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff & Mechanic Productivity Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
              Mechanic Performance & NSW Certifications
            </h3>
            <p className="text-xs text-gray-500">
              MVRL safety inspection compliance & completed work order values
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Certifications</th>
                <th className="py-3 px-4 text-center">Jobs Assigned</th>
                <th className="py-3 px-4 text-center">Jobs Completed</th>
                <th className="py-3 px-4 text-right">Total Labour & Job Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffProductivity?.map((s: any) => (
                <tr key={s.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                  <td className="py-3 px-4 text-gray-600">{s.role}</td>
                  <td className="py-3 px-4 space-x-1">
                    {s.isMvrlCertified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        MVRL
                      </span>
                    )}
                    {s.isArcCertified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        ARC A/C
                      </span>
                    )}
                    {!s.isMvrlCertified && !s.isArcCertified && (
                      <span className="text-[10px] text-gray-400 font-mono">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-gray-800">
                    {s.jobsAssigned}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                    {s.jobsCompleted}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                    {formatAUD(s.totalJobValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

