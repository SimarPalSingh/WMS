"use client"

import { useEffect, useState } from "react"
import {
  DollarSign,
  Wrench,
  AlertCircle,
  Bell,
  Clock,
  User,
  Car,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-mono text-sm">
        Loading Dhalla Automotive Live Floor Data...
      </div>
    )
  }

  const { workshop, jobCards, invoices, reminders } = data || {}

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">
            Good morning, Tinku 👋
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Workshop Floor Overview • <span className="font-mono">{workshop?.businessName}</span> (ABN: {workshop?.abn})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            MVRL & ARC Compliant
          </span>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">$962.00</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ +14% vs last week</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Jobs</span>
            <Wrench className="w-4 h-4 text-[#E8920D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">{jobCards?.length || 3}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">3 on hoist / bays</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Invoices Unpaid</span>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">
            {formatAUD(invoices?.[0]?.finalAmount || 594.00)}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">1 invoice awaiting payment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Reminders Due</span>
            <Bell className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-900">{reminders?.length || 1}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">1 Pink Slip in next 30 days</div>
        </div>
      </div>

      {/* Workshop Floor Board (Live Bay Kanban) */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E8920D]"></span>
              Workshop Floor Live Board
            </h2>
            <p className="text-xs text-gray-500">Real-time status across 4 dedicated workshop bays</p>
          </div>
          <span className="text-xs font-mono text-gray-400">Auto-refresh active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workshop?.bays?.map((bay: any) => {
            const activeJob = jobCards?.find((j: any) => j.bayId === bay.id)

            return (
              <div
                key={bay.id}
                className={`p-4 rounded-xl border transition-all ${
                  activeJob
                    ? "border-amber-300 bg-amber-50/20 shadow-xs"
                    : "border-dashed border-gray-300 bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
                  <span>{bay.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{bay.bayType}</span>
                </div>

                {activeJob ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#1B2A4A] text-amber-400 font-mono font-bold text-xs tracking-wider border border-[#243656]">
                        {activeJob.vehicle?.registration}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeJob.status === "InProgress"
                            ? "bg-amber-100 text-amber-800"
                            : activeJob.status === "QC"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {activeJob.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {activeJob.vehicle?.make} {activeJob.vehicle?.model}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {activeJob.customerNotes || "Standard Service"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-600 font-mono">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {activeJob.staff?.firstName || "Unassigned"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatAUD(activeJob.totalExGst)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center text-gray-400 text-xs">
                    <span>Bay Available</span>
                    <button className="mt-2 text-[11px] text-[#E8920D] font-semibold hover:underline">
                      + Assign Job
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Schedule & Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Job Cards Table */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
              Active Job Cards
            </h3>
            <span className="text-xs text-gray-500 font-mono">{jobCards?.length} jobs in pipeline</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-medium">
                  <th className="py-2.5 px-3">Job #</th>
                  <th className="py-2.5 px-3">Rego</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Mechanic</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ex-GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobCards?.map((job: any) => (
                  <tr key={job.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-gray-900">
                      {job.jobCardNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-300">
                        {job.vehicle?.registration}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-900">
                        {job.client?.businessName || `${job.client?.firstName} ${job.client?.lastName}`}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">{job.client?.mobilePhone}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-700 font-medium">
                      {job.staff?.firstName || "Unassigned"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === "InProgress"
                            ? "bg-amber-100 text-amber-800"
                            : job.status === "QC"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">
                      {formatAUD(job.totalExGst)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Alerts & Compliance */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-3">
              Action Items & Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-red-900">Pink Slip Due in 18 Days</p>
                  <p className="text-red-700 text-[11px] mt-0.5">
                    Rego <span className="font-mono font-bold">BN77OP</span> (Nepean Plumbing)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-900">Parts Waiting for JC-0089</p>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Bay 4 commercial van inspection on hold
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-blue-900">MVRL Sign-off Required</p>
                  <p className="text-blue-700 text-[11px] mt-0.5">
                    Only certified mechanics (Tinku / Baljit) can finalize safety checks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
