"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BellRing,
  Search,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  User,
  ShieldAlert,
  MessageSquare,
} from "lucide-react"
import { formatDateAU } from "@/lib/utils"

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([])
  const [workshop, setWorkshop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [sending, setSending] = useState(false)
  const [dispatchResult, setDispatchResult] = useState<any>(null)

  const fetchReminders = () => {
    setLoading(true)
    fetch(`/api/reminders?type=${filterType}&status=${filterStatus}`)
      .then((res) => res.json())
      .then((data) => {
        setReminders(data.reminders || [])
        setWorkshop(data.workshop)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchReminders()
  }, [filterType, filterStatus])

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reminders.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSendBatchSMS = async () => {
    if (!selectedIds.length) return
    setSending(true)
    setDispatchResult(null)
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderIds: selectedIds }),
      })
      const data = await res.json()
      setDispatchResult(data)
      setSelectedIds([])
      fetchReminders()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const dueThisMonthCount = reminders.filter((r) => {
    const due = new Date(r.dueDate)
    const now = new Date()
    return (
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear() &&
      r.status === "Pending"
    )
  }).length

  const overdueCount = reminders.filter(
    (r) => new Date(r.dueDate) < new Date() && r.status === "Pending"
  ).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-[#E8920D]" />
            Service & Pink Slip Reminders
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Automated ACMA-compliant SMS reminder campaign engine (9:00 AM – 8:00 PM AEST)
          </p>
        </div>

        <button
          onClick={handleSendBatchSMS}
          disabled={sending || selectedIds.length === 0}
          className="flex items-center space-x-2 bg-[#E8920D] hover:bg-[#d68307] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? "Dispatching SMS..." : `Send SMS to ${selectedIds.length} Selected`}</span>
        </button>
      </div>

      {/* Dispatch Result Feedback Banner */}
      {dispatchResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900">
              Successfully Dispatched {dispatchResult.sentCount} SMS Reminders!
            </p>
            <p className="text-emerald-700 mt-0.5">{dispatchResult.acmaNotice}</p>
          </div>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Total In Queue
          </span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{reminders.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Active customer vehicles</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Due This Month
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{dueThisMonthCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Upcoming logbook services</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Overdue Reminders
          </span>
          <p className="text-2xl font-bold font-mono text-red-600 mt-1">{overdueCount}</p>
          <p className="text-[11px] text-red-600 mt-0.5">Requires immediate SMS follow-up</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            ACMA Spam Act Compliance
          </span>
          <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            9 AM – 8 PM Window
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Includes 'Reply STOP to opt out'</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {["All", "NextService", "PinkSlip"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t
                  ? "bg-[#1B2A4A] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "NextService" ? "Next Service" : t === "PinkSlip" ? "Pink Slip" : "All Types"}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {["All", "Pending", "Sent"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? "bg-[#E8920D] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading service reminders engine...
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No reminders found matching the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === reminders.length && reminders.length > 0
                      }
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Vehicle Rego</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Reminder Type</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sent Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reminders.map((r) => {
                  const isOverdue = new Date(r.dueDate) < new Date() && r.status === "Pending"
                  const isSelected = selectedIds.includes(r.id)

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-amber-50/20 transition-colors ${
                        isSelected ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(r.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-[#1B2A4A] text-amber-400 px-2.5 py-0.5 rounded border border-[#243656]">
                          {r.vehicle?.registration}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {r.vehicle?.year} {r.vehicle?.make} {r.vehicle?.model}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {r.client?.businessName || `${r.client?.firstName} ${r.client?.lastName}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700">
                        {r.client?.mobilePhone || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.reminderType === "PinkSlip"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {r.reminderType === "PinkSlip" ? "Pink Slip Inspection" : "Logbook Service"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {formatDateAU(r.dueDate)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === "Sent"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-gray-800">
                        {r.sendCount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
