"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import {
  Users,
  Car,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Wrench,
  FileText,
  BellRing,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  Trash2
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Edit Client Profile State
  const [showEditModal, setShowEditModal] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({
    clientType: "Individual",
    firstName: "",
    lastName: "",
    businessName: "",
    abn: "",
    mobilePhone: "",
    email: "",
    address: "",
    suburb: "",
    state: "NSW",
    postcode: "",
    notes: ""
  })

  // Link Vehicle State
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkingVehicle, setLinkingVehicle] = useState(false)
  const [workshopVehicles, setWorkshopVehicles] = useState<any[]>([])
  const [isNewVehicleMode, setIsNewVehicleMode] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [newVehicleData, setNewVehicleData] = useState<any>({
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
  })

  const fetchClient = () => {
    fetch(`/api/clients/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.client) {
          setClient(data.client)
          setEditFormData({
            clientType: data.client.clientType || "Individual",
            firstName: data.client.firstName || "",
            lastName: data.client.lastName || "",
            businessName: data.client.businessName || "",
            abn: data.client.abn || "",
            mobilePhone: data.client.mobilePhone || "",
            email: data.client.email || "",
            address: data.client.address || "",
            suburb: data.client.suburb || "Kingswood",
            state: data.client.state || "NSW",
            postcode: data.client.postcode || "2747",
            notes: data.client.notes || ""
          })
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchWorkshopVehicles = () => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        setWorkshopVehicles(data.vehicles || [])
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchClient()
  }, [id])

  const handleOpenEdit = () => {
    if (client) {
      setEditFormData({
        clientType: client.clientType || "Individual",
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        businessName: client.businessName || "",
        abn: client.abn || "",
        mobilePhone: client.mobilePhone || "",
        email: client.email || "",
        address: client.address || "",
        suburb: client.suburb || "Kingswood",
        state: client.state || "NSW",
        postcode: client.postcode || "2747",
        notes: client.notes || ""
      })
    }
    setShowEditModal(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        setShowEditModal(false)
        fetchClient()
      } else {
        const json = await res.json()
        alert(json.error || "Failed to update client profile")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleOpenLinkVehicle = () => {
    fetchWorkshopVehicles()
    setIsNewVehicleMode(false)
    setSelectedVehicleId("")
    setNewVehicleData({
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
    })
    setShowLinkModal(true)
  }

  const handleLinkVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkingVehicle(true)
    try {
      const payload = {
        isNewVehicle: isNewVehicleMode,
        vehicleId: isNewVehicleMode ? null : selectedVehicleId,
        newVehicleData: isNewVehicleMode ? newVehicleData : null,
      }

      const res = await fetch(`/api/clients/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowLinkModal(false)
        fetchClient()
      } else {
        const json = await res.json()
        alert(json.error || "Failed to link vehicle to client")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLinkingVehicle(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Loading client profile...
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Client not found.
      </div>
    )
  }

  const isBusiness = client.clientType === "Business"
  const displayName = isBusiness
    ? client.businessName
    : `${client.firstName || ""} ${client.lastName || ""}`

  const totalSpend = (client.invoices || []).reduce(
    (acc: number, inv: any) => acc + (inv.finalAmount || 0),
    0
  )

  const handleDeleteClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/clients")
      } else {
        const json = await res.json()
        alert(json.error || "Failed to delete client")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred while deleting client.")
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Clients</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Edit Client Profile Button */}
          <button
            onClick={handleOpenEdit}
            className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <span>Edit Profile</span>
          </button>

          {/* Delete Client Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Client</span>
          </button>

          {/* Link Vehicle Button */}
          <button
            onClick={handleOpenLinkVehicle}
            className="flex items-center space-x-1.5 bg-[#E8920D] hover:bg-[#d68307] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Link Vehicle</span>
          </button>
        </div>
      </div>

      {/* Customer Header Summary Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#1B2A4A] text-amber-400 flex items-center justify-center font-bold text-lg">
              {isBusiness ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1B2A4A]">{displayName}</h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isBusiness ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {client.clientType} Account
                </span>
              </div>
              {isBusiness && client.abn && (
                <p className="text-xs text-gray-500 font-mono mt-0.5">ABN: {client.abn}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {client.mobilePhone || "-"}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {client.email}
                  </span>
                )}
                {client.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {client.address}, {client.suburb} {client.state} {client.postcode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6">
            <div>
              <p className="text-[10px] uppercase font-semibold text-gray-400">Total Lifetime Spend</p>
              <p className="text-xl font-bold font-mono text-emerald-700">{formatAUD(totalSpend)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-gray-400">Registered Vehicles</p>
              <p className="text-xl font-bold font-mono text-[#1B2A4A]">
                {client.clientVehicles?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Vehicles & Service Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Registered Vehicles & Health */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#E8920D]" />
              Vehicles ({client.clientVehicles?.length || 0})
            </h2>

            <div className="space-y-3">
              {client.clientVehicles?.map((cv: any) => {
                const veh = cv.vehicle
                return (
                  <div
                    key={veh.id}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-amber-400 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/vehicles/${veh.id}`}
                        className="font-mono font-bold text-sm bg-[#1B2A4A] text-amber-400 px-2.5 py-1 rounded border border-[#243656] hover:underline"
                      >
                        {veh.registration}
                      </Link>
                      <span className="text-[10px] font-bold text-gray-500 font-mono">
                        {veh.year} {veh.make}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-900">{veh.model}</p>

                    <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-600 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Odometer:</span>
                        <span className="font-semibold text-gray-800">
                          {veh.currentMileageKm?.toLocaleString() || "-"} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Service:</span>
                        <span className="font-semibold text-gray-800">
                          {formatDateAU(veh.nextServiceDue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pink Slip Expiry:</span>
                        <span className="font-semibold text-purple-700">
                          {formatDateAU(veh.pinkSlipExpiry)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Split Job Cards & Historical Records */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Workshop Job Cards */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E8920D]" />
                Workshop Job Cards ({client.jobCards?.length || 0})
              </h2>
              <span className="text-[11px] text-gray-400 font-mono">Current & pipeline repair orders</span>
            </div>

            {client.jobCards?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                No active or recorded job cards for this client.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-medium">
                      <th className="py-2.5 px-3">Job Card #</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Date In</th>
                      <th className="py-2.5 px-3">Mechanic</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount (Ex-GST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {client.jobCards?.map((job: any) => (
                      <tr key={job.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-gray-900">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="hover:text-[#E8920D] transition-colors"
                          >
                            {job.jobCardNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <Link href={`/vehicles/${job.vehicle?.id || ""}`}>
                            <span className="font-mono font-bold bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded border border-[#243656] hover:opacity-90">
                              {job.vehicle?.registration}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600">
                          {formatDateAU(job.dateIn)}
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
                        <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">
                          {formatAUD(job.totalExGst)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card 2: Completed Service History & Invoices Log */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Service History & Tax Invoices ({client.invoices?.length || 0})
              </h2>
              <span className="text-[11px] text-gray-400 font-mono">Billed transactions & payment audit</span>
            </div>

            {client.invoices?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                No past invoices or completed service records found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-medium">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Payment Status</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (Ex-GST)</th>
                      <th className="py-2.5 px-3 text-right">GST</th>
                      <th className="py-2.5 px-3 text-right">Total Paid (Inc-GST)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {client.invoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">
                          <Link href={`/invoices/${inv.id}`} className="hover:text-[#E8920D]">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600">
                          {formatDateAU(inv.invoiceDate)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inv.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">
                          {formatAUD(inv.subtotalExGst)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-500">
                          {formatAUD(inv.gstAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                          {formatAUD(inv.finalAmount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-[#E8920D] font-semibold hover:underline text-[11px]"
                          >
                            View Invoice
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            <h3 className="font-bold text-[#1B2A4A] text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E8920D]" />
              Edit Client Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Account Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="editClientType"
                      value="Individual"
                      checked={editFormData.clientType === "Individual"}
                      onChange={(e) => setEditFormData({ ...editFormData, clientType: e.target.value })}
                      className="text-[#E8920D]"
                    />
                    Individual
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="editClientType"
                      value="Business"
                      checked={editFormData.clientType === "Business"}
                      onChange={(e) => setEditFormData({ ...editFormData, clientType: e.target.value })}
                      className="text-[#E8920D]"
                    />
                    Company / Fleet
                  </label>
                </div>
              </div>

              {editFormData.clientType === "Business" ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Business / Company Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.businessName}
                      onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">ABN (Australian Business Number)</label>
                    <input
                      type="text"
                      placeholder="e.g. 51 824 753 556"
                      value={editFormData.abn}
                      onChange={(e) => setEditFormData({ ...editFormData, abn: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.mobilePhone}
                    onChange={(e) => setEditFormData({ ...editFormData, mobilePhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 12 High Street"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Suburb</label>
                  <input
                    type="text"
                    value={editFormData.suburb}
                    onChange={(e) => setEditFormData({ ...editFormData, suburb: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">State</label>
                  <select
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editFormData.postcode}
                    onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Customer Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions, preferences, etc."
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
                  disabled={savingProfile}
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link / Register Vehicle Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-[#E8920D]" />
                Link Vehicle to {displayName}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewVehicleMode(!isNewVehicleMode)}
                className="text-xs text-[#E8920D] hover:underline font-semibold"
              >
                {isNewVehicleMode ? "← Link Existing Fleet Vehicle" : "+ Register Brand New Vehicle"}
              </button>
            </div>

            <form onSubmit={handleLinkVehicleSubmit} className="space-y-4 text-xs">
              {isNewVehicleMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Registration Plate *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL88AA"
                        value={newVehicleData.registration}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
                            registration: e.target.value.toUpperCase()
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Body Type *</label>
                      <select
                        value={newVehicleData.bodyType}
                        onChange={(e) =>
                          setNewVehicleData({ ...newVehicleData, bodyType: e.target.value })
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
                      <label className="block text-gray-700 font-semibold mb-1">Make *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Toyota"
                        value={newVehicleData.make}
                        onChange={(e) =>
                          setNewVehicleData({ ...newVehicleData, make: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Model *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hilux SR5"
                        value={newVehicleData.model}
                        onChange={(e) =>
                          setNewVehicleData({ ...newVehicleData, model: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Year</label>
                      <input
                        type="number"
                        value={newVehicleData.year}
                        onChange={(e) =>
                          setNewVehicleData({ ...newVehicleData, year: e.target.value })
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
                        placeholder="17-character VIN"
                        value={newVehicleData.vin}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
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
                        placeholder="e.g. 1KD-FTV-99281"
                        value={newVehicleData.engineNumber}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
                            engineNumber: e.target.value.toUpperCase()
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Current Odometer (km)</label>
                      <input
                        type="number"
                        placeholder="e.g. 68450"
                        value={newVehicleData.currentMileageKm}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
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
                        placeholder="e.g. 78450"
                        value={newVehicleData.nextServiceKm}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
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
                        value={newVehicleData.nextServiceDue}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
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
                        value={newVehicleData.pinkSlipExpiry}
                        onChange={(e) =>
                          setNewVehicleData({
                            ...newVehicleData,
                            pinkSlipExpiry: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Select Existing Vehicle from Fleet *
                    </label>
                    <select
                      required
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white text-gray-900"
                    >
                      <option value="">-- Choose Vehicle (Rego Plate) --</option>
                      {workshopVehicles
                        .filter(
                          (v) => !client.clientVehicles?.some((cv: any) => cv.vehicle?.id === v.id)
                        )
                        .map((v) => {
                          const currentOwner = v.clientVehicles?.[0]?.client
                          const ownerTag = currentOwner
                            ? ` [Currently with: ${currentOwner.businessName || `${currentOwner.firstName || ""} ${currentOwner.lastName || ""}`.trim()}]`
                            : " [Unassigned]"
                          return (
                            <option key={v.id} value={v.id}>
                              {v.registration} — {v.year} {v.make} {v.model}{ownerTag}
                            </option>
                          )
                        })}
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Linking will add this vehicle to {displayName}'s profile and update primary ownership records.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingVehicle}
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                >
                  {linkingVehicle
                    ? "Linking..."
                    : isNewVehicleMode
                    ? "Register & Link Vehicle"
                    : "Link Vehicle to Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2-Step Safety Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Client Account"
        itemName={displayName || "Client Profile"}
        itemType="Client"
        warningMessage="Deleting this client will remove their profile and decouple all related vehicle assignments, reminders, invoices, and job histories."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteClient}
      />
    </div>
  )
}
