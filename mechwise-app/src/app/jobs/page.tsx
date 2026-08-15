"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Wrench,
  Search,
  Plus,
  Car,
  User,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

const STATUS_PILLS = [
  "All",
  "Booked",
  "Waiting",
  "InProgress",
  "WaitingForParts",
  "QC",
  "ReadyForPickup",
  "Completed",
  "Cancelled",
]

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)

  // Options for creation
  const [clients, setClients] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [bays, setBays] = useState<any[]>([])

  const [newJob, setNewJob] = useState({
    clientId: "",
    vehicleId: "",
    staffId: "",
    bayId: "",
    priority: "Normal",
    includeGst: true,
    mileageIn: "",
    customerNotes: "",
    lines: [
      { lineType: "Labour", description: "Standard General Logbook Service", qty: 2.0, unitPriceExGst: 95.0 },
      { lineType: "Part", description: "Engine Oil & Filter Package", qty: 1.0, unitPriceExGst: 85.0 },
    ],
  })

  const fetchJobs = () => {
    setLoading(true)
    fetch(`/api/jobs?status=${statusFilter}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((d) => {
        setJobCards(d.jobCards || [])
        setBays(d.bays || [])
        setStaff(d.staff || [])
        setClients(d.clients || [])
        setVehicles(d.vehicles || [])
        if (d.workshop?.defaultLabourRate) {
          const rate = d.workshop.defaultLabourRate
          setNewJob((prev) => ({
            ...prev,
            lines: [
              { lineType: "Labour", description: "Standard General Logbook Service", qty: 2.0, unitPriceExGst: rate },
              { lineType: "Part", description: "Engine Oil & Filter Package", qty: 1.0, unitPriceExGst: 85.0 },
            ],
          }))
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchJobs()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      })
      if (res.ok) {
        setShowModal(false)
        fetchJobs()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#E8920D]" />
            Job Cards & Workflow Pipeline
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live workshop jobs from intake through inspection, parts, QC, and invoicing
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-[#E8920D] hover:bg-[#d68307] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Job Card</span>
        </button>
      </div>

      {/* Status Pipeline Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-gray-200 text-xs">
        {STATUS_PILLS.map((st) => {
          const isActive = statusFilter === st
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#1B2A4A] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-200/70"
              }`}
            >
              {st}
            </button>
          )
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Job # (JC-0087), Rego, Customer, or Notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white font-mono placeholder:font-sans transition-all"
          />
        </form>
      </div>

      {/* Job Cards Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading active job cards...
          </div>
        ) : jobCards.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No job cards found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                  <th className="py-3 px-4">Job #</th>
                  <th className="py-3 px-4">Vehicle Rego</th>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Assigned Mechanic</th>
                  <th className="py-3 px-4">Bay Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount (Ex-GST)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobCards.map((job) => {
                  const clientName = job.client
                    ? job.client.businessName || `${job.client.firstName || ""} ${job.client.lastName || ""}`
                    : "No Client"

                  return (
                    <tr key={job.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-mono font-bold text-gray-900 hover:text-[#E8920D]"
                        >
                          {job.jobCardNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-[#1B2A4A] text-amber-400 px-2.5 py-0.5 rounded border border-[#243656]">
                          {job.vehicle?.registration}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{clientName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {job.client?.mobilePhone}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        {job.staff?.firstName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                        {job.bay?.name || "No Bay"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            job.status === "InProgress"
                              ? "bg-amber-100 text-amber-800"
                              : job.status === "QC"
                              ? "bg-purple-100 text-purple-800"
                              : job.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : job.status === "WaitingForParts"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">
                        {formatAUD(job.totalExGst)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center text-[#E8920D] font-semibold hover:underline text-xs"
                        >
                          <span>Open Card</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Job Card Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Open New Job Card</h2>
            <form onSubmit={handleCreateJobCard} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Customer / Client *</label>
                  <select
                    required
                    value={newJob.clientId}
                    onChange={(e) => setNewJob({ ...newJob, clientId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientType === "Business" ? c.businessName : `${c.firstName} ${c.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Vehicle Rego *</label>
                  <select
                    required
                    value={newJob.vehicleId}
                    onChange={(e) => setNewJob({ ...newJob, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration} ({v.year} {v.make} {v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Assign Mechanic</label>
                  <select
                    value={newJob.staffId}
                    onChange={(e) => setNewJob({ ...newJob, staffId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Workshop Bay</label>
                  <select
                    value={newJob.bayId}
                    onChange={(e) => setNewJob({ ...newJob, bayId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Unassigned --</option>
                    {bays.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Odometer In (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 68450"
                    value={newJob.mileageIn}
                    onChange={(e) => setNewJob({ ...newJob, mileageIn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Customer Reported Symptoms / Work Order</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 70,000 km logbook service + brake inspection"
                  value={newJob.customerNotes}
                  onChange={(e) => setNewJob({ ...newJob, customerNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-semibold text-gray-900">Include Australian GST (10%)</p>
                  <p className="text-[10px] text-gray-500">
                    When enabled, the auto-generated invoice will include 10% GST on completion.
                  </p>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={newJob.includeGst}
                    onChange={(e) => setNewJob({ ...newJob, includeGst: e.target.checked })}
                    className="rounded text-[#E8920D] cursor-pointer"
                  />
                  <span>10% GST</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E8920D] text-white rounded-lg font-semibold hover:bg-[#d68307]"
                >
                  Open Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
