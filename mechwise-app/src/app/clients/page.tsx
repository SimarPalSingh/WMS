"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  Search,
  Plus,
  Car,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  ChevronRight,
  Filter,
} from "lucide-react"
import { formatAUD } from "@/lib/utils"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [newClient, setNewClient] = useState({
    clientType: "Individual",
    firstName: "",
    lastName: "",
    businessName: "",
    mobilePhone: "",
    email: "",
    abn: "",
    address: "",
    suburb: "Kingswood",
    postcode: "2747",
    notes: "",
  })

  const fetchClients = () => {
    setLoading(true)
    const url = `/api/clients?search=${encodeURIComponent(search)}&type=${filterType}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setClients(data.clients || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchClients()
  }, [filterType])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchClients()
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      })
      if (res.ok) {
        setShowModal(false)
        setNewClient({
          clientType: "Individual",
          firstName: "",
          lastName: "",
          businessName: "",
          mobilePhone: "",
          email: "",
          abn: "",
          address: "",
          suburb: "Kingswood",
          postcode: "2747",
          notes: "",
        })
        fetchClients()
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
            <Users className="w-6 h-6 text-[#E8920D]" />
            Clients & Accounts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage individual and fleet vehicle owners registered with Dhalla Automotive
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-[#E8920D] hover:bg-[#d68307] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Client</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or rego..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white transition-all"
          />
        </form>

        {/* Client Type Pills */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {["All", "Individual", "Business"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === type
                  ? "bg-[#1B2A4A] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading clients database...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No clients found matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                  <th className="py-3 px-4">Client Name / Business</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Vehicles Linked</th>
                  <th className="py-3 px-4">Subtotal Spend</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => {
                  const isBusiness = client.clientType === "Business"
                  const displayName = isBusiness
                    ? client.businessName
                    : `${client.firstName || ""} ${client.lastName || ""}`
                  const totalSpend = client.invoices?.reduce(
                    (acc: number, inv: any) => acc + (inv.finalAmount || 0),
                    0
                  )

                  return (
                    <tr key={client.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-bold text-gray-900 hover:text-[#E8920D] flex items-center gap-2"
                        >
                          {isBusiness ? (
                            <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span>{displayName}</span>
                        </Link>
                        {isBusiness && client.abn && (
                          <span className="text-[10px] text-gray-400 font-mono block ml-6">
                            ABN: {client.abn}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isBusiness
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {client.clientType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-mono text-gray-800 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {client.mobilePhone || "-"}
                          </p>
                          {client.email && (
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {client.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {client.clientVehicles?.map((cv: any) => (
                            <Link
                              key={cv.vehicle?.id}
                              href={`/vehicles/${cv.vehicle?.id}`}
                              className="font-mono font-bold text-[11px] bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded border border-[#243656] hover:border-amber-400 transition-colors"
                            >
                              {cv.vehicle?.registration}
                            </Link>
                          ))}
                          {(!client.clientVehicles || client.clientVehicles.length === 0) && (
                            <span className="text-gray-400 text-[11px] italic">No vehicle</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                        {formatAUD(totalSpend)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/clients/${client.id}`}
                          className="inline-flex items-center text-[#E8920D] font-semibold hover:underline text-xs"
                        >
                          <span>View Profile</span>
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

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Add New Customer</h2>
            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Customer Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      value="Individual"
                      checked={newClient.clientType === "Individual"}
                      onChange={(e) => setNewClient({ ...newClient, clientType: e.target.value })}
                    />
                    <span>Individual Customer</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      value="Business"
                      checked={newClient.clientType === "Business"}
                      onChange={(e) => setNewClient({ ...newClient, clientType: e.target.value })}
                    />
                    <span>Fleet / Business (ABN)</span>
                  </label>
                </div>
              </div>

              {newClient.clientType === "Business" ? (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nepean Plumbing & Gas Pty Ltd"
                    value={newClient.businessName}
                    onChange={(e) => setNewClient({ ...newClient, businessName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <div className="mt-2">
                    <label className="block text-gray-700 font-semibold mb-1">Australian ABN</label>
                    <input
                      type="text"
                      placeholder="e.g. 33 129 845 761"
                      value={newClient.abn}
                      onChange={(e) => setNewClient({ ...newClient, abn: e.target.value })}
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
                      placeholder="e.g. David"
                      value={newClient.firstName}
                      onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Miller"
                      value={newClient.lastName}
                      onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
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
                    placeholder="04XX XXX XXX"
                    value={newClient.mobilePhone}
                    onChange={(e) => setNewClient({ ...newClient, mobilePhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@example.com.au"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Derby St"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Suburb</label>
                  <input
                    type="text"
                    value={newClient.suburb}
                    onChange={(e) => setNewClient({ ...newClient, suburb: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
