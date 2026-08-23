"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import {
  Car,
  User,
  Wrench,
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Mail,
  AlertTriangle,
  Plus,
  Trash2
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Edit Specs Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [savingSpecs, setSavingSpecs] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({
    registration: "",
    make: "",
    model: "",
    year: "",
    colour: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    vin: "",
    engineNumber: "",
    engineCapacity: "",
    bodyType: "Sedan",
    currentMileageKm: "",
    nextServiceKm: "",
    nextServiceDue: "",
    pinkSlipExpiry: "",
  })

  // Change / De-link Owner Modal
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [savingOwner, setSavingOwner] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")

  const fetchVehicle = () => {
    fetch(`/api/vehicles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicle) {
          setVehicle(data.vehicle)
          setEditFormData({
            registration: data.vehicle.registration || "",
            make: data.vehicle.make || "",
            model: data.vehicle.model || "",
            year: data.vehicle.year?.toString() || "",
            colour: data.vehicle.colour || "",
            fuelType: data.vehicle.fuelType || "Petrol",
            transmission: data.vehicle.transmission || "Automatic",
            vin: data.vehicle.vin || "",
            engineNumber: data.vehicle.engineNumber || "",
            engineCapacity: data.vehicle.engineCapacity || "",
            bodyType: data.vehicle.bodyType || "Sedan",
            currentMileageKm: data.vehicle.currentMileageKm?.toString() || "",
            nextServiceKm: data.vehicle.nextServiceKm?.toString() || "",
            nextServiceDue: data.vehicle.nextServiceDue ? data.vehicle.nextServiceDue.split("T")[0] : "",
            pinkSlipExpiry: data.vehicle.pinkSlipExpiry ? data.vehicle.pinkSlipExpiry.split("T")[0] : "",
          })
          const primary = data.vehicle.clientVehicles?.[0]?.client
          setSelectedClientId(primary ? primary.id : "")
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchClients = () => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((d) => setClients(d.clients || []))
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchVehicle()
    fetchClients()
  }, [id])

  const handleOpenEditSpecs = () => {
    if (vehicle) {
      setEditFormData({
        registration: vehicle.registration || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        colour: vehicle.colour || "",
        fuelType: vehicle.fuelType || "Petrol",
        transmission: vehicle.transmission || "Automatic",
        vin: vehicle.vin || "",
        engineNumber: vehicle.engineNumber || "",
        engineCapacity: vehicle.engineCapacity || "",
        bodyType: vehicle.bodyType || "Sedan",
        currentMileageKm: vehicle.currentMileageKm?.toString() || "",
        nextServiceKm: vehicle.nextServiceKm?.toString() || "",
        nextServiceDue: vehicle.nextServiceDue ? vehicle.nextServiceDue.split("T")[0] : "",
        pinkSlipExpiry: vehicle.pinkSlipExpiry ? vehicle.pinkSlipExpiry.split("T")[0] : "",
      })
    }
    setShowEditModal(true)
  }

  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSpecs(true)
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })
      if (res.ok) {
        setShowEditModal(false)
        fetchVehicle()
      } else {
        const json = await res.json()
        alert(json.error || "Failed to update vehicle specifications")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingSpecs(false)
    }
  }

  const handleOpenOwnerModal = () => {
    const primary = vehicle?.clientVehicles?.[0]?.client
    setSelectedClientId(primary ? primary.id : "")
    setShowOwnerModal(true)
  }

  const handleSaveOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingOwner(true)
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId ? selectedClientId : "UNASSIGNED",
        }),
      })
      if (res.ok) {
        setShowOwnerModal(false)
        fetchVehicle()
      } else {
        const json = await res.json()
        alert(json.error || "Failed to update vehicle owner")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingOwner(false)
    }
  }

  const handleDeLinkOwner = async () => {
    if (!confirm(`Are you sure you want to de-link this vehicle from its current owner?`)) return
    setSavingOwner(true)
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: "UNASSIGNED" }),
      })
      if (res.ok) {
        setShowOwnerModal(false)
        fetchVehicle()
      } else {
        const json = await res.json()
        alert(json.error || "Failed to de-link vehicle")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingOwner(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Loading vehicle profile & details...
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Vehicle not found.
      </div>
    )
  }

  const handleDeleteVehicle = async () => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/vehicles")
      } else {
        const json = await res.json()
        alert(json.error || "Failed to delete vehicle")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred while deleting vehicle.")
    }
  }

  const primaryOwner = vehicle.clientVehicles?.[0]?.client
  const ownerName = primaryOwner
    ? primaryOwner.businessName || `${primaryOwner.firstName || ""} ${primaryOwner.lastName || ""}`
    : "No Owner Linked"

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Registry</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Edit Specs Button */}
          <button
            onClick={handleOpenEditSpecs}
            className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <span>Edit Specs & Service</span>
          </button>

          {/* Delete Vehicle Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Vehicle</span>
          </button>

          {/* Change / De-link Owner Button */}
          <button
            onClick={handleOpenOwnerModal}
            className="flex items-center space-x-1.5 bg-white hover:bg-amber-50 text-[#1B2A4A] border border-[#1B2A4A]/30 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#E8920D]" />
            <span>{primaryOwner ? "Change / De-link Owner" : "Link to Owner"}</span>
          </button>

          <Link
            href={`/jobs?rego=${vehicle.registration}`}
            className="flex items-center space-x-1.5 bg-[#E8920D] hover:bg-[#d68307] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Job Card</span>
          </Link>
        </div>
      </div>

      {/* Vehicle Hero Summary Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-[#1B2A4A] text-amber-400 border-2 border-[#243656] px-4 py-2 rounded-xl text-center shadow-md">
              <span className="text-[10px] text-gray-400 font-mono tracking-widest block">
                NSW REGO
              </span>
              <span className="font-mono font-black text-2xl tracking-wider">
                {vehicle.registration}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1B2A4A]">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                {vehicle.bodyType && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                    {vehicle.bodyType}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 font-mono">
                {vehicle.colour || "White"} • {vehicle.fuelType || "Petrol"} • {vehicle.transmission || "Automatic"}
                {vehicle.engineCapacity && ` • ${vehicle.engineCapacity}`}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-gray-600 pt-1">
                {vehicle.vin && (
                  <div>
                    <span className="text-gray-400">VIN:</span> <strong className="text-gray-800">{vehicle.vin}</strong>
                  </div>
                )}
                {vehicle.engineNumber && (
                  <div>
                    <span className="text-gray-400">Engine #:</span> <strong className="text-gray-800">{vehicle.engineNumber}</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-600">Registered Owner:</span>
                {primaryOwner ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/clients/${primaryOwner.id}`}
                      className="text-xs font-semibold text-[#1B2A4A] hover:text-[#E8920D] flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ownerName}</span>
                      <span className="font-mono text-gray-400 text-[11px]">
                        ({primaryOwner.mobilePhone})
                      </span>
                    </Link>
                    <button
                      onClick={handleOpenOwnerModal}
                      className="text-[11px] text-[#E8920D] hover:underline font-semibold ml-1"
                    >
                      (Change / De-link)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleOpenOwnerModal}
                    className="text-xs text-[#E8920D] hover:underline font-semibold"
                  >
                    + Assign Owner
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3 Status Gauge Cards */}
          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6">
            <div className="bg-gray-50 p-2.5 rounded-lg border text-center flex flex-col justify-center">
              <p className="text-[9px] uppercase font-bold text-gray-400">Current Odometer</p>
              <p className="text-sm font-bold font-mono text-gray-900 mt-0.5">
                {vehicle.currentMileageKm ? `${vehicle.currentMileageKm.toLocaleString()} km` : "—"}
              </p>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center flex flex-col justify-between">
              <div>
                <p className="text-[9px] uppercase font-bold text-emerald-800">Next Service Due</p>
                <p className="text-sm font-bold font-mono text-emerald-950 mt-0.5">
                  {vehicle.nextServiceKm ? `${vehicle.nextServiceKm.toLocaleString()} km` : "—"}
                </p>
              </div>
              <div className="mt-1 pt-1 border-t border-emerald-200/60">
                <p className="text-[10px] font-mono font-semibold text-emerald-800">
                  {formatDateAU(vehicle.nextServiceDue)}
                </p>
                <span className="text-[8px] text-emerald-600 font-sans block uppercase tracking-tight">
                  (Whichever occurs earliest)
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-center flex flex-col justify-center">
              <p className="text-[9px] uppercase font-bold text-purple-800">Pink Slip Expiry</p>
              <p className="text-xs font-bold font-mono text-purple-900 mt-0.5">
                {formatDateAU(vehicle.pinkSlipExpiry)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service & Repair History Timeline */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
        <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#E8920D]" />
          Logbook Service & Job History ({vehicle.jobCards?.length || 0})
        </h2>

        {vehicle.jobCards?.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No service history recorded for this vehicle yet.
          </p>
        ) : (
          <div className="space-y-4">
            {vehicle.jobCards?.map((job: any) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-mono font-bold text-xs bg-[#1B2A4A] text-amber-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                    >
                      {job.jobCardNumber}
                    </Link>
                    <span className="text-xs font-semibold text-gray-800">
                      {job.customerNotes || "Scheduled Logbook Service"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-gray-500 font-mono">{formatDateAU(job.dateIn)}</span>
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
                  </div>
                </div>

                {/* Line items summary */}
                <div className="space-y-1 text-xs">
                  {job.lines?.map((line: any) => (
                    <div key={line.id} className="flex justify-between text-gray-600">
                      <span>
                        • {line.description} ({line.lineType})
                      </span>
                      <span className="font-mono text-gray-900 font-medium">
                        {formatAUD(line.lineTotalExGst)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Mechanic: <strong className="text-gray-800">{job.staff?.firstName || "Unassigned"}</strong>
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    Total: {formatAUD(job.totalExGst)} (ex-GST)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Specs & Maintenance Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            <h3 className="font-bold text-[#1B2A4A] text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#E8920D]" />
              Edit Vehicle Specifications & Scheduled Service
            </h3>

            <form onSubmit={handleSaveSpecs} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Registration Plate *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.registration}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        registration: e.target.value.toUpperCase()
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Body Type</label>
                  <select
                    value={editFormData.bodyType}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bodyType: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV / 4WD</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Ute">Ute / Cab Chassis</option>
                    <option value="Van">Van / Commercial</option>
                    <option value="Wagon">Station Wagon</option>
                    <option value="Coupe">Coupe / Convertible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Make</label>
                  <input
                    type="text"
                    value={editFormData.make}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, make: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    value={editFormData.year}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, year: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">VIN</label>
                  <input
                    type="text"
                    value={editFormData.vin}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        vin: e.target.value.toUpperCase()
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Engine Number</label>
                  <input
                    type="text"
                    value={editFormData.engineNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        engineNumber: e.target.value.toUpperCase()
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Engine Capacity</label>
                  <input
                    type="text"
                    value={editFormData.engineCapacity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, engineCapacity: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Fuel Type</label>
                  <select
                    value={editFormData.fuelType}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fuelType: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Colour</label>
                  <input
                    type="text"
                    value={editFormData.colour}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, colour: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    value={editFormData.currentMileageKm}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        currentMileageKm: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Next Service Due (km)</label>
                  <input
                    type="number"
                    value={editFormData.nextServiceKm}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nextServiceKm: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Next Service Due (Date)</label>
                  <input
                    type="date"
                    value={editFormData.nextServiceDue}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nextServiceDue: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Pink Slip Due Date</label>
                  <input
                    type="date"
                    value={editFormData.pinkSlipExpiry}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        pinkSlipExpiry: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSpecs}
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                >
                  {savingSpecs ? "Saving..." : "Save Vehicle Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change / De-link Owner Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="font-bold text-[#1B2A4A] text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E8920D]" />
              Manage Registered Vehicle Owner
            </h3>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-gray-500">Vehicle:</p>
                <p className="font-bold text-gray-900 font-mono">
                  {vehicle.registration} — {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="text-gray-500 mt-1">Current Owner:</p>
                <p className="font-semibold text-gray-800">
                  {ownerName} {primaryOwner?.mobilePhone ? `(${primaryOwner.mobilePhone})` : ""}
                </p>
              </div>

              <form onSubmit={handleSaveOwner} className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Select New Owner / Client
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 font-medium"
                  >
                    <option value="">-- Leave Unassigned / De-linked --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientType === "Business"
                          ? c.businessName
                          : `${c.firstName} ${c.lastName}`}{" "}
                        ({c.mobilePhone || "No phone"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {primaryOwner && (
                    <button
                      type="button"
                      onClick={handleDeLinkOwner}
                      disabled={savingOwner}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold text-xs transition-colors"
                    >
                      De-link Owner
                    </button>
                  )}

                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setShowOwnerModal(false)}
                      className="px-3 py-1.5 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingOwner}
                      className="px-4 py-1.5 bg-[#E8920D] hover:bg-[#d68307] text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                    >
                      {savingOwner ? "Updating..." : "Save Owner"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Safety Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Vehicle Record"
        itemName={`${vehicle.registration} (${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""})`}
        itemType="Vehicle"
        warningMessage="Deleting this vehicle will remove its fleet specifications, odometer/pink slip tracking, and decouple all linked historical logbook records and invoices."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteVehicle}
      />
    </div>
  )
}
