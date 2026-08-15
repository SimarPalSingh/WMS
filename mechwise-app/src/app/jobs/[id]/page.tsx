"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import {
  Wrench,
  Car,
  User,
  Clock,
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

const LIFECYCLE_STAGES = [
  "Booked",
  "Waiting",
  "InProgress",
  "WaitingForParts",
  "QC",
  "ReadyForPickup",
  "Completed",
]

export default function JobCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [jobCard, setJobCard] = useState<any>(null)
  const [staffList, setStaffList] = useState<any[]>([])
  const [bayList, setBayList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [workshop, setWorkshop] = useState<any>(null)
  const [lines, setLines] = useState<any[]>([])
  const [status, setStatus] = useState("")
  const [staffId, setStaffId] = useState("")
  const [bayId, setBayId] = useState("")
  const [includeGst, setIncludeGst] = useState(true)
  const [customerNotes, setCustomerNotes] = useState("")
  const [internalNotes, setInternalNotes] = useState("")

  const fetchJobCard = () => {
    fetch(`/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.jobCard) {
          setJobCard(data.jobCard)
          setLines(data.jobCard.lines || [])
          setStatus(data.jobCard.status)
          setStaffId(data.jobCard.staffId || "")
          setBayId(data.jobCard.bayId || "")
          setIncludeGst(data.jobCard.includeGst !== undefined ? data.jobCard.includeGst : true)
          setCustomerNotes(data.jobCard.customerNotes || "")
          setInternalNotes(data.jobCard.internalNotes || "")
        }
        if (data.workshop) {
          setWorkshop(data.workshop)
        }
        setStaffList(data.staffList || [])
        setBayList(data.bayList || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchJobCard()
  }, [id])

  const handleUpdateStatus = async (newStatus: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          lines,
          staffId: staffId || null,
          bayId: bayId || null,
          includeGst,
          customerNotes,
          internalNotes,
        }),
      })
      const updated = await res.json()
      if (updated.jobCard) {
        setJobCard(updated.jobCard)
        setStatus(updated.jobCard.status)
        setIncludeGst(updated.jobCard.includeGst !== undefined ? updated.jobCard.includeGst : true)
        setLines(updated.jobCard.lines || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddLine = (type: "Labour" | "Part" | "Subcontract") => {
    const labourRate = workshop?.defaultLabourRate || 95.0
    const defaultUnitPrice = type === "Labour" ? labourRate : 50.0
    setLines([
      ...lines,
      {
        lineType: type,
        description: type === "Labour" ? "Additional Diagnostic / Labour" : "Replacement Part",
        qty: 1,
        unitPriceExGst: defaultUnitPrice,
        lineTotalExGst: defaultUnitPrice,
        isCompleted: false,
      },
    ])
  }

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines]
    updated[index][field] = value
    if (field === "qty" || field === "unitPriceExGst") {
      const q = parseFloat(updated[index].qty) || 0
      const p = parseFloat(updated[index].unitPriceExGst) || 0
      updated[index].lineTotalExGst = q * p
    }
    setLines(updated)
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Loading Job Card workspace...
      </div>
    )
  }

  if (!jobCard) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Job Card not found.
      </div>
    )
  }

  const subtotalExGst = lines.reduce(
    (acc, l) => acc + (parseFloat(l.lineTotalExGst) || 0),
    0
  )
  const gstAmount = includeGst ? Math.round(subtotalExGst * 0.10 * 100) / 100 : 0
  const totalPayable = includeGst ? subtotalExGst + gstAmount : subtotalExGst

  const completedCount = lines.filter((l) => l.isCompleted).length
  const progressPct = lines.length > 0 ? Math.round((completedCount / lines.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Cards Pipeline</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleUpdateStatus(status)}
            disabled={saving}
            className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243656] transition-all disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Job Changes"}
          </button>

          {status !== "Completed" && (
            <button
              onClick={() => handleUpdateStatus("Completed")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Job & Generate Invoice</span>
            </button>
          )}

          {jobCard.invoice && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Tax Invoice Generated: {jobCard.invoice.invoiceNumber}
            </span>
          )}
        </div>
      </div>

      {/* 7-Step Interactive Lifecycle Progress Pills */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#1B2A4A] uppercase tracking-wider">
            Job Lifecycle Status
          </span>
          <span className="font-mono text-gray-500 font-semibold">
            Work Items Done: {completedCount} / {lines.length} ({progressPct}%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCurrent = status === stage
            return (
              <button
                key={stage}
                onClick={() => handleUpdateStatus(stage)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                  isCurrent
                    ? "bg-[#E8920D] text-white shadow-md ring-2 ring-[#E8920D]/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="text-[10px] opacity-70 font-mono">Step {idx + 1}</div>
                <div className="truncate">{stage}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Job Card Header & Vehicle Summary */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-[#1B2A4A] text-amber-400 border-2 border-[#243656] px-4 py-2.5 rounded-xl text-center shadow-md">
              <span className="text-[10px] text-gray-400 font-mono tracking-widest block">
                JOB CARD
              </span>
              <span className="font-mono font-black text-2xl tracking-wider">
                {jobCard.jobCardNumber}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/vehicles/${jobCard.vehicle?.id}`}
                  className="font-mono font-bold text-sm bg-gray-100 px-2.5 py-0.5 rounded border border-gray-300 text-gray-900 hover:text-[#E8920D]"
                >
                  {jobCard.vehicle?.registration}
                </Link>
                <h1 className="text-base font-bold text-gray-900">
                  {jobCard.vehicle?.year} {jobCard.vehicle?.make} {jobCard.vehicle?.model}
                </h1>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Client:{" "}
                <Link
                  href={`/clients/${jobCard.client?.id}`}
                  className="font-semibold text-gray-900 hover:text-[#E8920D]"
                >
                  {jobCard.client?.businessName ||
                    `${jobCard.client?.firstName} ${jobCard.client?.lastName}`}
                </Link>{" "}
                <span className="font-mono text-gray-400">({jobCard.client?.mobilePhone})</span>
              </p>
              <p className="text-xs text-gray-500 italic mt-1">
                Notes: "{jobCard.customerNotes || "Standard maintenance service"}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <label className="block text-gray-400 text-[10px] font-bold uppercase">
                Mechanic Assigned
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="mt-1 px-2.5 py-1.5 border rounded-lg font-medium text-gray-800 bg-white"
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] font-bold uppercase">
                Bay Allocation
              </label>
              <select
                value={bayId}
                onChange={(e) => setBayId(e.target.value)}
                className="mt-1 px-2.5 py-1.5 border rounded-lg font-medium text-gray-800 bg-white"
              >
                <option value="">-- No Bay --</option>
                {bayList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Work Items Checklist & Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Work Items Checklist */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#E8920D]" />
              Work Items & Parts Checklist
            </h2>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleAddLine("Labour")}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
              >
                + Add Labour
              </button>
              <button
                type="button"
                onClick={() => handleAddLine("Part")}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
              >
                + Add Part
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  line.isCompleted
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(line.isCompleted)}
                  onChange={(e) => handleLineChange(idx, "isCompleted", e.target.checked)}
                  className="w-4 h-4 text-[#E8920D] rounded cursor-pointer"
                />

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                      placeholder="Item description"
                      className="w-full px-2 py-1 bg-white border rounded font-medium text-gray-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={line.lineType}
                      onChange={(e) => handleLineChange(idx, "lineType", e.target.value)}
                      className="w-full px-2 py-1 bg-white border rounded text-[11px]"
                    >
                      <option value="Labour">Labour</option>
                      <option value="Part">Part</option>
                      <option value="Subcontract">Subcontract</option>
                      <option value="Sundry">Sundry</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.1"
                      value={line.qty}
                      onChange={(e) => handleLineChange(idx, "qty", e.target.value)}
                      placeholder="Qty/Hrs"
                      className="w-full px-2 py-1 bg-white border rounded font-mono text-center"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900">
                      {formatAUD(line.lineTotalExGst)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Financials & Completion Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
                Financial Breakdown
              </h3>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="rounded text-[#E8920D] cursor-pointer"
                />
                <span>Include GST (10%)</span>
              </label>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Labour & Parts (Ex-GST)</span>
                <span className="font-mono font-semibold text-gray-900">
                  {formatAUD(subtotalExGst)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  Australian GST {includeGst ? "(10%)" : "(0% GST-Free)"}
                </span>
                <span className={`font-mono font-semibold ${includeGst ? "text-gray-900" : "text-gray-400"}`}>
                  {formatAUD(gstAmount)}
                </span>
              </div>
              <div className="pt-2.5 border-t border-gray-200 flex justify-between text-sm font-bold text-[#1B2A4A]">
                <span>Total Payable {includeGst ? "(Inc-GST)" : "(GST-Free)"}</span>
                <span className="font-mono text-emerald-700">{formatAUD(totalPayable)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-3">
              Automated Triggers on Finish
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Auto-generates gapless ATO Tax Invoice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Records permanent vehicle logbook history</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Schedules +6 months service reminder</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
