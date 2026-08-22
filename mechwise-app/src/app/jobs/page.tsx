"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  UserPlus,
  FileSpreadsheet
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

// Simplified visible status tabs per user specification
const SIMPLIFIED_STATUS_TABS = [
  "All",
  "Booked",
  "InProgress",
  "Completed",
  "Cancelled"
]

export default function JobCardsPage() {
  const router = useRouter()
  const [jobCards, setJobCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Options for creation
  const [clients, setClients] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [bays, setBays] = useState<any[]>([])

  // Unified creation mode
  const [isNewClientMode, setIsNewClientMode] = useState(false)
  const [isNewVehicleMode, setIsNewVehicleMode] = useState(false)

  const [newClientData, setNewClientData] = useState({
    clientType: "Individual",
    firstName: "",
    lastName: "",
    businessName: "",
    mobilePhone: "",
    email: ""
  })

  const [newVehicleData, setNewVehicleData] = useState({
    registration: "",
    make: "Toyota",
    model: "",
    year: "2021",
    bodyType: "Sedan",
    fuelType: "Petrol",
    vin: ""
  })

  const [newJob, setNewJob] = useState({
    clientId: "",
    vehicleId: "",
    staffId: "",
    bayId: "",
    priority: "Normal",
    includeGst: true,
    mileageIn: "",
    discountExGst: "",
    futureNotes: "",
    nextServiceOdoDue: "",
    nextPinkSlipDue: "",
    customerNotes: "",
    lines: [
      { category: "General", lineType: "Labour", description: "Standard General Logbook Service", qty: 2.0, unitPriceExGst: 95.0 },
      { category: "General", lineType: "Part", description: "Engine Oil & Filter Package", qty: 1.0, unitPriceExGst: 85.0 },
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
              { category: "General", lineType: "Labour", description: "Standard General Logbook Service", qty: 2.0, unitPriceExGst: rate },
              { category: "General", lineType: "Part", description: "Engine Oil & Filter Package", qty: 1.0, unitPriceExGst: 85.0 },
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

  const handleSelectClient = (clientId: string) => {
    setNewJob((prev) => {
      const updated = { ...prev, clientId }
      if (clientId) {
        const clientObj = clients.find((c) => c.id === clientId)
        // If client has any linked vehicles, auto-select the first vehicle and populate its details
        if (clientObj?.clientVehicles?.length && clientObj.clientVehicles.length > 0) {
          const firstVehicle = clientObj.clientVehicles[0].vehicle
          if (firstVehicle) {
            updated.vehicleId = firstVehicle.id
            if (firstVehicle.currentMileageKm) {
              updated.mileageIn = String(firstVehicle.currentMileageKm)
            }
            if (firstVehicle.nextServiceKm) {
              updated.nextServiceOdoDue = String(firstVehicle.nextServiceKm)
            }
            if (firstVehicle.pinkSlipExpiry) {
              updated.nextPinkSlipDue = new Date(firstVehicle.pinkSlipExpiry).toISOString().split("T")[0]
            }
          }
        } else {
          // Client has no registered vehicles yet
          updated.vehicleId = ""
        }
      }
      return updated
    })
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setNewJob((prev) => {
      const updated = { ...prev, vehicleId }
      if (vehicleId) {
        const vehicleObj = vehicles.find((v) => v.id === vehicleId)
        // Auto-select linked owner client if available
        const primaryOwner = vehicleObj?.clientVehicles?.[0]?.client
        if (primaryOwner) {
          updated.clientId = primaryOwner.id
        }
        // Auto-populate vehicle odometer and service targets
        if (vehicleObj?.currentMileageKm) {
          updated.mileageIn = String(vehicleObj.currentMileageKm)
        }
        if (vehicleObj?.nextServiceKm) {
          updated.nextServiceOdoDue = String(vehicleObj.nextServiceKm)
        }
        if (vehicleObj?.pinkSlipExpiry) {
          updated.nextPinkSlipDue = new Date(vehicleObj.pinkSlipExpiry).toISOString().split("T")[0]
        }
      }
      return updated
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...newJob,
        isNewClient: isNewClientMode,
        newClientData: isNewClientMode ? newClientData : null,
        isNewVehicle: isNewVehicleMode,
        newVehicleData: isNewVehicleMode ? newVehicleData : null
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const json = await res.json()
        setShowModal(false)
        // Immediately navigate directly into the newly created job card
        if (json.jobCard?.id) {
          router.push(`/jobs/${json.jobCard.id}`)
        } else {
          fetchJobs()
        }
      } else {
        const errJson = await res.json()
        alert(errJson.error || "Failed to create job card")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
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

      {/* Simplified Status Pipeline Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-gray-200 text-xs">
        {SIMPLIFIED_STATUS_TABS.map((st) => {
          const isActive = statusFilter === st
          const label = st === "InProgress" ? "In Progress" : st
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
              {label}
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
                              : job.status === "Cancelled"
                              ? "bg-gray-100 text-gray-800"
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

      {/* Unified Job Intake Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#E8920D]" />
              Open New Job Card & Intake
            </h2>
            <form onSubmit={handleCreateJobCard} className="space-y-4 text-xs">
              {/* Customer Selector / Creator */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">1. Customer / Client *</label>
                  <button
                    type="button"
                    onClick={() => setIsNewClientMode(!isNewClientMode)}
                    className="text-[11px] text-[#E8920D] hover:underline font-semibold"
                  >
                    {isNewClientMode ? "← Select Existing Client" : "+ Register New Client Here"}
                  </button>
                </div>

                {isNewClientMode ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={newClientData.firstName ?? ""}
                        onChange={(e) => setNewClientData({ ...newClientData, firstName: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">Last Name / Company</label>
                      <input
                        type="text"
                        placeholder="Smith or Co Pty Ltd"
                        value={newClientData.lastName ?? ""}
                        onChange={(e) => setNewClientData({ ...newClientData, lastName: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        placeholder="0412 345 678"
                        value={newClientData.mobilePhone ?? ""}
                        onChange={(e) => setNewClientData({ ...newClientData, mobilePhone: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={newClientData.email ?? ""}
                        onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <select
                    required
                    value={newJob.clientId ?? ""}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">-- Select Existing Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientType === "Business" ? c.businessName : `${c.firstName} ${c.lastName}`} ({c.mobilePhone || "No phone"}) {c.clientVehicles?.length ? `• ${c.clientVehicles.length} vehicle(s)` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vehicle Selector / Creator */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">2. Vehicle *</label>
                  <button
                    type="button"
                    onClick={() => setIsNewVehicleMode(!isNewVehicleMode)}
                    className="text-[11px] text-[#E8920D] hover:underline font-semibold"
                  >
                    {isNewVehicleMode ? "← Select Existing Vehicle" : "+ Register New Vehicle Here"}
                  </button>
                </div>

                {isNewVehicleMode ? (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">Rego Plate *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL88AA"
                        value={newVehicleData.registration ?? ""}
                        onChange={(e) => setNewVehicleData({ ...newVehicleData, registration: e.target.value.toUpperCase() })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">Make & Model *</label>
                      <input
                        type="text"
                        required
                        placeholder="Toyota Hilux"
                        value={newVehicleData.model ?? ""}
                        onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-[10px] font-semibold">Body Type</label>
                      <select
                        value={newVehicleData.bodyType ?? "Sedan"}
                        onChange={(e) => setNewVehicleData({ ...newVehicleData, bodyType: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded bg-white"
                      >
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Ute">Ute</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(() => {
                      const selectedClient = clients.find((c) => c.id === newJob.clientId)
                      const clientVehiclesList = selectedClient?.clientVehicles?.map((cv: any) => cv.vehicle).filter(Boolean) || []
                      const hasClientVehicles = clientVehiclesList.length > 0

                      return (
                        <>
                          <select
                            required
                            value={newJob.vehicleId ?? ""}
                            onChange={(e) => handleSelectVehicle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
                          >
                            <option value="">
                              {hasClientVehicles
                                ? `-- Select Vehicle for ${selectedClient?.firstName || selectedClient?.businessName} (${clientVehiclesList.length} registered) --`
                                : "-- Select Existing Vehicle --"}
                            </option>

                            {/* If a client is selected and has cars, show their cars at the top / filtered */}
                            {hasClientVehicles ? (
                              <optgroup label={`Vehicles registered to ${selectedClient?.businessName || `${selectedClient?.firstName || ""} ${selectedClient?.lastName || ""}`.trim()}`}>
                                {clientVehiclesList.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.registration} ({v.year} {v.make} {v.model})
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}

                            {/* Show other workshop fleet vehicles */}
                            <optgroup label={hasClientVehicles ? "Other Fleet Vehicles" : "All Workshop Vehicles"}>
                              {vehicles
                                .filter((v) => !clientVehiclesList.some((cv: any) => cv.id === v.id))
                                .map((v) => {
                                  const owner = v.clientVehicles?.[0]?.client
                                  const ownerTag = owner ? ` [${owner.businessName || `${owner.firstName || ""} ${owner.lastName || ""}`.trim()}]` : ""
                                  return (
                                    <option key={v.id} value={v.id}>
                                      {v.registration} ({v.year} {v.make} {v.model}){ownerTag}
                                    </option>
                                  )
                                })}
                            </optgroup>
                          </select>

                          {newJob.clientId && hasClientVehicles && (
                            <p className="text-[10px] text-gray-500 font-mono">
                              Showing {clientVehiclesList.length} vehicle(s) linked to this client (first vehicle selected automatically).
                            </p>
                          )}
                          {newJob.clientId && !hasClientVehicles && (
                            <p className="text-[10px] text-amber-600 font-medium">
                              This client does not have any registered vehicles yet. Click "+ Register New Vehicle Here" above to add one.
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Assign Mechanic</label>
                  <select
                    value={newJob.staffId ?? ""}
                    onChange={(e) => setNewJob({ ...newJob, staffId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
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
                    value={newJob.bayId ?? ""}
                    onChange={(e) => setNewJob({ ...newJob, bayId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
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
                    value={newJob.mileageIn ?? ""}
                    onChange={(e) => setNewJob({ ...newJob, mileageIn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Customer Reported Symptoms / Work Order</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 70,000 km logbook service + front brake shudder"
                  value={newJob.customerNotes ?? ""}
                  onChange={(e) => setNewJob({ ...newJob, customerNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg whitespace-pre-wrap break-words"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#E8920D] text-white rounded-lg font-bold hover:bg-[#d68307] shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Opening..." : "Save & Open Job Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

