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
} from "lucide-react"
import { formatDateAU } from "@/lib/utils"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  const [newVehicle, setNewVehicle] = useState({
    registration: "",
    make: "Toyota",
    model: "",
    year: "2021",
    colour: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    vin: "",
    currentMileageKm: "",
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
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicle),
      })
      if (res.ok) {
        setShowModal(false)
        setNewVehicle({
          registration: "",
          make: "Toyota",
          model: "",
          year: "2021",
          colour: "",
          fuelType: "Petrol",
          transmission: "Automatic",
          vin: "",
          currentMileageKm: "",
          clientId: "",
        })
        fetchVehicles()
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
            Rego-first vehicle search, logbook service tracker & NSW Pink Slip compliance
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
            placeholder="Lookup by Rego (e.g. DL88AA), Make, Model, or VIN..."
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
                          {v.colour || "Standard"} • {v.fuelType || "Petrol"}
                        </p>
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
                        <span
                          className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isServiceOverdue
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {formatDateAU(v.nextServiceDue)}
                        </span>
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
                          <span>History</span>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Register New Vehicle</h2>
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
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Make *</label>
                  <select
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {[
                      "Toyota",
                      "Hyundai",
                      "Mazda",
                      "Ford",
                      "Holden",
                      "Subaru",
                      "Honda",
                      "Nissan",
                      "Kia",
                      "Mitsubishi",
                      "Volkswagen",
                      "BMW",
                      "Mercedes-Benz",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hilux SR5 or i30"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
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

              <div className="grid grid-cols-3 gap-3">
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
                  <label className="block text-gray-700 font-semibold mb-1">Transmission</label>
                  <select
                    value={newVehicle.transmission}
                    onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Current Km</label>
                  <input
                    type="number"
                    placeholder="e.g. 68450"
                    value={newVehicle.currentMileageKm}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, currentMileageKm: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Assign to Client</label>
                <select
                  value={newVehicle.clientId}
                  onChange={(e) => setNewVehicle({ ...newVehicle, clientId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">-- Select Client Owner --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.clientType === "Business"
                        ? c.businessName
                        : `${c.firstName} ${c.lastName}`}{" "}
                      ({c.mobilePhone})
                    </option>
                  ))}
                </select>
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
