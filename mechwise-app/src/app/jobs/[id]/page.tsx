"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
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
  Send,
  Calendar,
  Sparkles
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

const LIFECYCLE_STAGES = [
  "Booked",
  "InProgress",
  "QC",
  "Completed",
  "Cancelled",
]

export default function JobCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditQuoteMode = searchParams?.get("editQuote") === "true"
  const { id } = use(params)
  const [jobCard, setJobCard] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [staffList, setStaffList] = useState<any[]>([])
  const [bayList, setBayList] = useState<any[]>([])
  const [partsCatalog, setPartsCatalog] = useState<any[]>([])
  const [suppliersList, setSuppliersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quoteSuccess, setQuoteSuccess] = useState("")

  // Quick New Master Part Modal
  const [showNewPartModal, setShowNewPartModal] = useState(false)
  const [newPartIndex, setNewPartIndex] = useState<number | null>(null)
  const [newPartForm, setNewPartForm] = useState({
    partNumber: "",
    name: "",
    category: "General",
    costPrice: "0.00",
    retailPrice: "50.00",
    availableStock: "5",
    supplierId: ""
  })

  const [workshop, setWorkshop] = useState<any>(null)
  const [lines, setLines] = useState<any[]>([])
  const [status, setStatus] = useState("")
  const [staffId, setStaffId] = useState("")
  const [bayId, setBayId] = useState("")
  const [includeGst, setIncludeGst] = useState(true)
  const [discountExGst, setDiscountExGst] = useState<string | number>(0)
  const [customerNotes, setCustomerNotes] = useState("")
  const [futureNotes, setFutureNotes] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [nextServiceOdoDue, setNextServiceOdoDue] = useState<string | number>("")
  const [nextPinkSlipDue, setNextPinkSlipDue] = useState("")

  const fetchJobCard = () => {
    fetch(`/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.jobCard) {
          setJobCard(data.jobCard)
          setLines(data.jobCard.lines || [])
          setStatus(data.jobCard.status || "")
          setStaffId(data.jobCard.staffId || "")
          setBayId(data.jobCard.bayId || "")
          setIncludeGst(data.jobCard.includeGst !== undefined ? data.jobCard.includeGst : true)
          setDiscountExGst(data.jobCard.discountExGst !== null && data.jobCard.discountExGst !== undefined ? data.jobCard.discountExGst : 0)
          setCustomerNotes(data.jobCard.customerNotes || "")
          setFutureNotes(data.jobCard.futureNotes || "")
          setInternalNotes(data.jobCard.internalNotes || "")
          setNextServiceOdoDue(data.jobCard.nextServiceOdoDue !== null && data.jobCard.nextServiceOdoDue !== undefined ? data.jobCard.nextServiceOdoDue : "")
          setNextPinkSlipDue(
            data.jobCard.nextPinkSlipDue
              ? new Date(data.jobCard.nextPinkSlipDue).toISOString().split("T")[0]
              : ""
          )
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

  const fetchParts = () => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((d) => {
        setPartsCatalog(d.parts || [])
        setSuppliersList(d.suppliers || [])
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchJobCard()
    fetchParts()
  }, [id])

  const handleSaveQuickPart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartForm.partNumber || !newPartForm.name) {
      alert("Please fill in Part Number and Name.")
      return
    }

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartForm)
      })

      if (res.ok) {
        const json = await res.json()
        const createdPart = json.part
        setShowNewPartModal(false)

        // Refresh parts list
        fetchParts()

        // If opened from a specific line item row, automatically bind it
        if (newPartIndex !== null && createdPart) {
          const updated = [...lines]
          updated[newPartIndex].partId = createdPart.id
          updated[newPartIndex].description = `${createdPart.partNumber} - ${createdPart.name}`
          updated[newPartIndex].category = createdPart.category || "Parts & Supplies"
          updated[newPartIndex].unitPriceExGst = createdPart.retailPrice || 50
          const q = parseFloat(updated[newPartIndex].qty) || 1
          updated[newPartIndex].lineTotalExGst = Math.round(q * (createdPart.retailPrice || 50) * 100) / 100
          setLines(updated)
        }

        setNewPartForm({
          partNumber: "",
          name: "",
          category: "General",
          costPrice: "0.00",
          retailPrice: "50.00",
          availableStock: "5",
          supplierId: ""
        })
        setNewPartIndex(null)
      } else {
        const errJson = await res.json()
        alert(errJson.error || "Failed to create inventory part")
      }
    } catch (err) {
      console.error(err)
    }
  }

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
          discountExGst: discountExGst ? parseFloat(String(discountExGst)) : 0,
          futureNotes,
          nextServiceOdoDue: nextServiceOdoDue ? parseInt(String(nextServiceOdoDue)) : null,
          nextPinkSlipDue: nextPinkSlipDue || null,
          customerNotes,
          internalNotes,
        }),
      })
      const updated = await res.json()
      if (updated.jobCard) {
        setJobCard(updated.jobCard)
        setStatus(updated.jobCard.status)
        setIncludeGst(updated.jobCard.includeGst !== undefined ? updated.jobCard.includeGst : true)
        setDiscountExGst(updated.jobCard.discountExGst || 0)
        setLines(updated.jobCard.lines || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateQuotation = async () => {
    if (!jobCard) return
    if (jobCard.status === "Completed" || jobCard.invoice) {
      alert("Cannot generate quotation: This job card is already completed and has an active tax invoice.")
      return
    }
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: jobCard.id,
          clientId: jobCard.clientId,
          vehicleId: jobCard.vehicleId,
          notes: customerNotes,
          discountExGst: discountExGst ? parseFloat(String(discountExGst)) : 0,
          includeGst,
          lines,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const quoteNum = json.quotation?.quoteNumber || "Quote"
        const actionLabel = json.updated ? "updated" : "generated"
        setQuoteSuccess(`Quotation ${quoteNum} ${actionLabel} successfully!`)
        setTimeout(() => setQuoteSuccess(""), 4000)
        fetchJobCard()
      } else {
        const errJson = await res.json()
        alert(errJson.error || "Failed to generate quotation.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddLine = (type: "Labour" | "Part" | "Subcontract") => {
    const labourRate = workshop?.defaultLabourRate || 95.0
    const defaultUnitPrice = type === "Labour" ? labourRate : 50.0
    setLines([
      ...lines,
      {
        category: type === "Labour" ? "Labour & Diagnostics" : "Parts & Supplies",
        lineType: type,
        description: type === "Labour" ? "General Workshop Labour" : "Replacement Part / Filter",
        qty: 1,
        unitPriceExGst: defaultUnitPrice,
        lineTotalExGst: defaultUnitPrice,
        isCompleted: false,
      },
    ])
  }

  const handleSelectInventoryPart = (index: number, partId: string) => {
    const selected = partsCatalog.find((p) => p.id === partId)
    const updated = [...lines]
    if (selected) {
      const price = selected.retailPrice !== undefined ? selected.retailPrice : (selected.sellingPriceExGst || 0)
      updated[index].partId = selected.id
      updated[index].description = `${selected.partNumber} - ${selected.name}`
      updated[index].category = selected.category || "Parts & Supplies"
      updated[index].unitPriceExGst = price
      const q = parseFloat(updated[index].qty) || 1
      updated[index].lineTotalExGst = Math.round(q * price * 100) / 100
    }
    setLines(updated)
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
      updated[index].lineTotalExGst = Math.round(q * p * 100) / 100
    }
    setLines(updated)
  }

  const handleDeleteJobCard = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/jobs")
      } else {
        const json = await res.json()
        alert(json.error || "Failed to delete job card")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred while deleting job card.")
    }
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

  const linesTotalExGst = lines.reduce(
    (acc, l) => acc + (parseFloat(l.lineTotalExGst) || 0),
    0
  )
  const dollarDiscount = parseFloat(String(discountExGst)) || 0
  const subtotalAfterDiscount = Math.max(0, linesTotalExGst - dollarDiscount)
  const gstAmount = includeGst ? Math.round(subtotalAfterDiscount * 0.10 * 100) / 100 : 0
  const totalPayable = includeGst ? subtotalAfterDiscount + gstAmount : subtotalAfterDiscount

  const completedCount = lines.filter((l) => l.isCompleted).length
  const progressPct = lines.length > 0 ? Math.round((completedCount / lines.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Quotation Editing Mode Alert Banner */}
      {isEditQuoteMode && jobCard.quotation && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-purple-900 text-xs">
                Editing Quotation {jobCard.quotation.quoteNumber} Scope & Items
              </p>
              <p className="text-purple-700 text-[11px] mt-0.5">
                Add or adjust labour lines, parts, discounts, and customer notes below. Clicking <strong>Save & Update Quotation</strong> or <strong>Save Job Changes</strong> will immediately update the quotation.
              </p>
            </div>
          </div>
          <Link
            href={`/quotations/${jobCard.quotation.id}`}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
          >
            View Quotation Document →
          </Link>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Cards Pipeline</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {quoteSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-pulse">
              {quoteSuccess}
            </span>
          )}

          {jobCard.quotation ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/quotations/${jobCard.quotation.id}`}
                className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Quotation: {jobCard.quotation.quoteNumber} →</span>
              </Link>

              {status !== "Completed" && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleUpdateStatus(status)
                    setQuoteSuccess(`Quotation ${jobCard.quotation?.quoteNumber} updated with latest job items!`)
                    setTimeout(() => setQuoteSuccess(""), 4000)
                  }}
                  disabled={saving}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{saving ? "Updating..." : "Save & Update Quotation"}</span>
                </button>
              )}
            </div>
          ) : status !== "Completed" && !jobCard.invoice && status !== "Cancelled" ? (
            <button
              onClick={handleGenerateQuotation}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quotation</span>
            </button>
          ) : null}

          <button
            onClick={() => handleUpdateStatus(status)}
            disabled={saving}
            className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-xs font-semibold hover:bg-[#243656] transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Job Changes"}
          </button>

          {status !== "Completed" && status !== "Cancelled" && (
            <button
              onClick={() => handleUpdateStatus("Completed")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Finalise Invoice</span>
            </button>
          )}

          {status !== "Cancelled" && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to mark Job Card ${jobCard.jobCardNumber} as Cancelled?`)) {
                  handleUpdateStatus("Cancelled")
                }
              }}
              className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 hover:border-red-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 text-gray-500 hover:text-red-600" />
              <span>Cancel Job</span>
            </button>
          )}

          {/* Permanent Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Job</span>
          </button>

          {jobCard.invoice && (
            <Link
              href={`/invoices/${jobCard.invoice.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
            >
              Invoice: {jobCard.invoice.invoiceNumber} →
            </Link>
          )}
        </div>
      </div>

      {/* Simplified Status Lifecycle Progress */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#1B2A4A] uppercase tracking-wider">
            Job Lifecycle Status
          </span>
          <span className="font-mono text-gray-500 font-semibold">
            Work Items Done: {completedCount} / {lines.length} ({progressPct}%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LIFECYCLE_STAGES.map((stage) => {
            const isCurrent = status === stage
            return (
              <button
                key={stage}
                onClick={() => handleUpdateStatus(stage)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
                  isCurrent
                    ? stage === "Cancelled"
                      ? "bg-red-600 text-white shadow-md ring-2 ring-red-600/30"
                      : stage === "Completed"
                      ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30"
                      : "bg-[#E8920D] text-white shadow-md ring-2 ring-[#E8920D]/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="truncate">{stage === "InProgress" ? "In Progress" : stage}</div>
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
              <p className="text-xs text-gray-500 italic mt-1 whitespace-pre-wrap break-words">
                Symptoms: "{jobCard.customerNotes || "Standard maintenance service"}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <label className="block text-gray-400 text-[10px] font-bold uppercase">
                Mechanic Assigned
              </label>
              <select
                value={staffId ?? ""}
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
                value={bayId ?? ""}
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
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E8920D]" />
                Work Items & Dynamic Inventory Parts
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
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    line.isCompleted
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-gray-50/80 border-gray-200"
                  }`}
                >
                  {/* Top Header of the Line Item Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(line.isCompleted)}
                        onChange={(e) => handleLineChange(idx, "isCompleted", e.target.checked)}
                        className="w-4 h-4 text-[#E8920D] rounded cursor-pointer"
                      />
                      <span className="font-bold text-gray-800 text-[11px]">
                        Line #{idx + 1} — {line.lineType} Item
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {line.lineType === "Part" && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewPartIndex(idx)
                            setShowNewPartModal(true)
                          }}
                          className="text-[11px] text-[#E8920D] hover:underline font-semibold flex items-center gap-1"
                        >
                          + Register New Master Part
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="text-gray-400 hover:text-red-600 p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    {/* Item Description / Master Part Dropdown */}
                    <div className="sm:col-span-5">
                      <label className="block text-gray-500 text-[10px] font-semibold mb-0.5">
                        {line.lineType === "Part" ? "Master Inventory Part *" : "Item Description *"}
                      </label>
                      {line.lineType === "Part" ? (
                        <select
                          value={line.partId ?? ""}
                          onChange={(e) => handleSelectInventoryPart(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-900 text-xs"
                        >
                          <option value="">-- Select Master Part --</option>
                          {partsCatalog.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.partNumber} - {p.name} ({formatAUD(p.retailPrice || 0)})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={line.description ?? ""}
                          onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                          placeholder="e.g. Front brake pads replacement & disc rotor resurface"
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-900"
                        />
                      )}
                    </div>

                    {/* Line Type */}
                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 text-[10px] font-semibold mb-0.5">
                        Type
                      </label>
                      <select
                        value={line.lineType ?? "Labour"}
                        onChange={(e) => handleLineChange(idx, "lineType", e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                      >
                        <option value="Labour">Labour</option>
                        <option value="Part">Part</option>
                        <option value="Subcontract">Subcontract</option>
                        <option value="Sundry">Sundry</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 text-[10px] font-semibold mb-0.5 text-center">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={line.qty ?? 1}
                        onChange={(e) => handleLineChange(idx, "qty", e.target.value)}
                        placeholder="Qty"
                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-center"
                      />
                    </div>

                    {/* Unit Price (Ex-GST) */}
                    <div className="sm:col-span-3">
                      <label className="block text-gray-500 text-[10px] font-semibold mb-0.5">
                        Unit Price ($ Ex-GST)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-400 text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={line.unitPriceExGst ?? 0}
                          onChange={(e) => handleLineChange(idx, "unitPriceExGst", e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-5 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-xs font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Future Notes & Recommendations Section */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E8920D]" />
              Future Notes & Recommendations for Client
            </h3>
            <p className="text-[11px] text-gray-500">
              Notes recorded here will appear in the Future Recommendations box on the client's printed Tax Invoice.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Front brake pads at 3mm (recommend replacement next service), rear tyres near wear indicator."
              value={futureNotes ?? ""}
              onChange={(e) => setFutureNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs whitespace-pre-wrap break-words"
            />
          </div>
        </div>

        {/* Right Col: Financials, Discounts & Reminders Targets */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
                Financial Breakdown
              </h3>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border">
                <input
                  type="checkbox"
                  checked={Boolean(includeGst)}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="rounded text-[#E8920D] cursor-pointer"
                />
                <span>Include GST (10%)</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal (Ex-GST)</span>
                <span className="font-mono font-semibold text-gray-900">
                  {formatAUD(linesTotalExGst)}
                </span>
              </div>

              {/* Ex-GST Dollar Discount Field */}
              <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-800">Dollar Discount ($ Ex-GST)</label>
                  <span className="text-[10px] text-amber-800 font-semibold">Applied before GST</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={discountExGst ?? 0}
                  onChange={(e) => setDiscountExGst(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Net Subtotal (Ex-GST)</span>
                <span className="font-mono font-semibold text-gray-900">
                  {formatAUD(subtotalAfterDiscount)}
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

          {/* Next Targets Scheduled */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-700" />
              Service Target Reminders
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Next Service Target Odometer (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 78450"
                  value={nextServiceOdoDue ?? ""}
                  onChange={(e) => setNextServiceOdoDue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Next NSW Pink Slip Inspection Date</label>
                <input
                  type="date"
                  value={nextPinkSlipDue ?? ""}
                  onChange={(e) => setNextPinkSlipDue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Master Part Creation Modal */}
      {showNewPartModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E8920D]" />
                Register New Inventory Part to Master Catalog
              </h3>
              <button
                onClick={() => {
                  setShowNewPartModal(false)
                  setNewPartIndex(null)
                }}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickPart} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WIX-51348"
                    value={newPartForm.partNumber}
                    onChange={(e) => setNewPartForm({ ...newPartForm, partNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Filters"
                    value={newPartForm.category}
                    onChange={(e) => setNewPartForm({ ...newPartForm, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Part Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wix Spin-on Oil Filter"
                  value={newPartForm.name}
                  onChange={(e) => setNewPartForm({ ...newPartForm, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Cost ($ Ex-GST)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPartForm.costPrice}
                    onChange={(e) => setNewPartForm({ ...newPartForm, costPrice: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Retail ($ Ex-GST) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50.00"
                    value={newPartForm.retailPrice}
                    onChange={(e) => setNewPartForm({ ...newPartForm, retailPrice: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded font-mono font-bold text-[#1B2A4A]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newPartForm.availableStock}
                    onChange={(e) => setNewPartForm({ ...newPartForm, availableStock: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Primary Supplier (Optional)</label>
                <select
                  value={newPartForm.supplierId}
                  onChange={(e) => setNewPartForm({ ...newPartForm, supplierId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded bg-white"
                >
                  <option value="">None / Direct Sourced</option>
                  {suppliersList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.abn ? `(ABN: ${s.abn})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPartModal(false)
                    setNewPartIndex(null)
                  }}
                  className="px-3.5 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm"
                >
                  Save & Bind Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2-Step Safety Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Job Card"
        itemName={jobCard.jobCardNumber}
        itemType="Job Card"
        warningMessage="Deleting this job card will permanently remove all repair line items, labour records, and unlink associated quotations or drafts."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteJobCard}
      />
    </div>
  )
}

