"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Car,
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
  ShieldAlert,
  Gauge,
  FileCheck
} from "lucide-react"
import { formatDateAU } from "@/lib/utils"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [isNewClientMode, setIsNewClientMode] = useState(false)

  const [newClientData, setNewClientData] = useState({
    clientType: "Individual",
    firstName: "",
    lastName: "",
    businessName: "",
    mobilePhone: "",
    email: "",
    address: "",
    suburb: "Kingswood",
    state: "NSW",
    postcode: "2747"
  })

  const [newVehicle, setNewVehicle] = useState({
    registration: "",
    make: "Toyota",
    model: "",
    year: "2021",
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
    clientId: "",
  })

  const fetchVehicles = () => {
    setLoading(true)
    fetch(`/api/vehicles?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data.vehicles || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchVehicles()
    fetch("/api/clients")
      .then((res) => res.json())
      .then((d) => setClients(d.clients || []))
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVehicles()
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...newVehicle,
        isNewClient: isNewClientMode,
        newClientData: isNewClientMode ? newClientData : null
      }

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setShowModal(false)
        setIsNewClientMode(false)
        setNewClientData({
          clientType: "Individual",
          firstName: "",
          lastName: "",
          businessName: "",
          mobilePhone: "",
          email: "",
          address: "",
          suburb: "Kingswood",
          state: "NSW",
          postcode: "2747"
        })
        setNewVehicle({
          registration: "",
          make: "Toyota",
          model: "",
          year: "2021",
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
          clientId: "",
        })
        fetchVehicles()
        fetch("/api/clients")
          .then((res) => res.json())
          .then((d) => setClients(d.clients || []))
      } else {
        const json = await res.json()
        alert(json.error || "Failed to register vehicle")
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
            <Car className="w-6 h-6 text-[#E8920D]" />
            Vehicle Fleet Registry
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Rego-first vehicle search, VIN & engine specs, logbook service tracker & NSW Pink Slip compliance
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-[#E8920D] hover:bg-[#d68307] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register New Vehicle</span>
        </button>
      </div>

      {/* Search & Lookup */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Lookup by Rego (e.g. DL88AA), VIN, Engine #, Make, or Owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white font-mono placeholder:font-sans transition-all"
          />
        </form>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading vehicle fleet registry...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No vehicles found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                  <th className="py-3 px-4">Rego Plate</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Technical Specs</th>
                  <th className="py-3 px-4">Primary Owner / Client</th>
                  <th className="py-3 px-4">Odometer</th>
                  <th className="py-3 px-4">Next Service Due</th>
                  <th className="py-3 px-4">Pink Slip Expiry</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((v) => {
                  const owner = v.clientVehicles?.[0]?.client
                  const ownerName = owner
                    ? owner.businessName || `${owner.firstName || ""} ${owner.lastName || ""}`
                    : "No Owner Linked"

                  const isServiceOverdue =
                    v.nextServiceDue && new Date(v.nextServiceDue) < new Date()

                  return (
                    <tr key={v.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/vehicles/${v.id}`}
                          className="font-mono font-bold text-sm bg-[#1B2A4A] text-amber-400 px-3 py-1 rounded-md border border-[#243656] inline-block tracking-wider hover:border-amber-400 transition-all shadow-xs"
                        >
                          {v.registration}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {v.bodyType || "Sedan"} • {v.colour || "Standard"} • {v.fuelType || "Petrol"}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {v.vin && <div className="truncate max-w-[150px]"><span className="text-gray-400">VIN:</span> {v.vin}</div>}
                        {v.engineCapacity && <div className="text-gray-500">{v.engineCapacity}</div>}
                        {v.engineNumber && <div className="text-gray-400 text-[10px] truncate max-w-[150px]">Eng: {v.engineNumber}</div>}
                      </td>
                      <td className="py-3 px-4">
                        {owner ? (
                          <Link
                            href={`/clients/${owner.id}`}
                            className="font-medium text-gray-800 hover:text-[#E8920D] flex items-center gap-1"
                          >
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{ownerName}</span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                        {owner?.mobilePhone && (
                          <span className="text-[10px] text-gray-400 font-mono block">
                            {owner.mobilePhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                        {v.currentMileageKm ? `${v.currentMileageKm.toLocaleString()} km` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          {v.nextServiceKm ? (
                            <span className="font-mono font-bold text-xs text-gray-900 block">
                              {v.nextServiceKm.toLocaleString()} km
                            </span>
                          ) : (
                            <span className="text-gray-400 font-mono text-[11px] block">—</span>
                          )}
                          <span
                            className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                              isServiceOverdue
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {formatDateAU(v.nextServiceDue)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          {formatDateAU(v.pinkSlipExpiry)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/vehicles/${v.id}`}
                          className="inline-flex items-center text-[#E8920D] font-semibold hover:underline text-xs"
                        >
                          <span>Dossier</span>
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

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-[#1B2A4A] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#E8920D]" />
              Register New Vehicle
            </h2>
            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Registration Plate *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL88AA"
                    value={newVehicle.registration}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, registration: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold tracking-wider text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Body Type *</label>
                  <select
                    value={newVehicle.bodyType}
                    onChange={(e) => setNewVehicle({ ...newVehicle, bodyType: e.target.value })}
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
                  <label className="block text-gray-700 font-semibold mb-1">Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hilux SR5"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">VIN (Vehicle Identification Number)</label>
                  <input
                    type="text"
                    placeholder="17-character VIN"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Engine Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1KD-FTV-99281"
                    value={newVehicle.engineNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, engineNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Engine Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 2.8L Turbo Diesel"
                    value={newVehicle.engineCapacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, engineCapacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Fuel Type</label>
                  <select
                    value={newVehicle.fuelType}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value })}
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
                    placeholder="e.g. Glacier White"
                    value={newVehicle.colour}
                    onChange={(e) => setNewVehicle({ ...newVehicle, colour: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 68450"
                    value={newVehicle.currentMileageKm}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, currentMileageKm: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Next Service Due (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 78450"
                    value={newVehicle.nextServiceKm}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, nextServiceKm: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Client Owner Assignment / Creation */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">Assign to Client / Owner</label>
                  <button
                    type="button"
                    onClick={() => setIsNewClientMode(!isNewClientMode)}
                    className="text-[11px] text-[#E8920D] hover:underline font-semibold"
                  >
                    {isNewClientMode ? "← Select Existing Client" : "+ Register New Client Here"}
                  </button>
                </div>

                {isNewClientMode ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pb-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="vehClientType"
                          value="Individual"
                          checked={newClientData.clientType === "Individual"}
                          onChange={(e) => setNewClientData({ ...newClientData, clientType: e.target.value })}
                        />
                        <span>Individual</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="vehClientType"
                          value="Business"
                          checked={newClientData.clientType === "Business"}
                          onChange={(e) => setNewClientData({ ...newClientData, clientType: e.target.value })}
                        />
                        <span>Company / Fleet</span>
                      </label>
                    </div>

                    {newClientData.clientType === "Business" ? (
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Business / Company Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Logistics Pty Ltd"
                          value={newClientData.businessName}
                          onChange={(e) => setNewClientData({ ...newClientData, businessName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-medium"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-600 text-[10px] font-semibold">First Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="John"
                            value={newClientData.firstName}
                            onChange={(e) => setNewClientData({ ...newClientData, firstName: e.target.value })}
                            className="w-full px-2.5 py-1.5 border rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[10px] font-semibold">Last Name</label>
                          <input
                            type="text"
                            placeholder="Smith"
                            value={newClientData.lastName}
                            onChange={(e) => setNewClientData({ ...newClientData, lastName: e.target.value })}
                            className="w-full px-2.5 py-1.5 border rounded bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Mobile Phone *</label>
                        <input
                          type="text"
                          required
                          placeholder="0412 345 678"
                          value={newClientData.mobilePhone}
                          onChange={(e) => setNewClientData({ ...newClientData, mobilePhone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Email</label>
                        <input
                          type="email"
                          placeholder="client@example.com"
                          value={newClientData.email}
                          onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    value={newVehicle.clientId}
                    onChange={(e) => setNewVehicle({ ...newVehicle, clientId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">-- Select Client Owner (or Leave Unassigned) --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientType === "Business"
                          ? c.businessName
                          : `${c.firstName} ${c.lastName}`}{" "}
                        ({c.mobilePhone || "No phone"})
                      </option>
                    ))}
                  </select>
                )}
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
                  className="px-5 py-2 bg-[#E8920D] text-white rounded-lg font-bold hover:bg-[#d68307] shadow-sm"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
