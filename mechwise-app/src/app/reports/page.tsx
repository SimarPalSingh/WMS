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

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("Q1")

  useEffect(() => {
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
  }, [period])

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Calculating Australian BAS & Workshop Financial Analytics...
      </div>
    )
  }

  const { financials, monthlyRevenue, serviceTypeBreakdown, staffProductivity } = data || {}

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#E8920D]" />
            Reports & Australian BAS Summary
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quarterly Business Activity Statement (BAS), GST reconciliation & mechanic productivity
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          {["Q1", "Q2", "Q3", "Q4", "FY25-26"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? "bg-[#1B2A4A] text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Financial & BAS KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Total Invoiced (Inc-GST)
          </span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">
            {formatAUD(financials?.totalRevenueIncGst || 1134.0)}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {financials?.totalInvoicesCount} tax invoices issued
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Net Sales (Ex-GST)
          </span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">
            {formatAUD(financials?.totalRevenueExGst || 1030.0)}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">ATO Box G1 Taxable Sales</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs bg-amber-50/30">
          <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">
            GST Collected (10%)
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {formatAUD(financials?.totalGstCollected || 104.0)}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">ATO Box 1A GST on sales</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Avg Invoice Value
          </span>
          <p className="text-2xl font-bold font-mono text-[#1B2A4A] mt-1">
            {formatAUD(financials?.avgInvoiceValue || 567.0)}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">Per workshop visit</p>
        </div>
      </div>

      {/* 2-Column Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expenses Chart */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
                Workshop Revenue & Net Profit Trend
              </h3>
              <p className="text-xs text-gray-500">7-month trailing cash flow ($ AUD)</p>
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
                <Bar dataKey="revenue" name="Revenue" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Parts & Overheads" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Gross Profit" fill="#E8920D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Type Breakdown Pie */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-1">
              Revenue by Service Type
            </h3>
            <p className="text-xs text-gray-500 mb-4">Top workshop revenue streams</p>
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
                <Tooltip />
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
              Mechanic & Staff Performance
            </h3>
            <p className="text-xs text-gray-500">
              MVRL safety certifications & workshop labour efficiency
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">NSW MVRL Certified</th>
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
                  <td className="py-3 px-4">
                    {s.isMvrlCertified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Pink Slip Certified
                      </span>
                    ) : (
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
