"use client"

import { useEffect, useState } from "react"
import {
  Settings,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  DollarSign,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Award,
  AlertCircle,
  X
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"workshop" | "staff">("workshop")
  const [settings, setSettings] = useState<any>(null)
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    role: "Mechanic",
    mobile: "",
    email: "",
    hourlyRate: "95.00",
    isMvrlCertified: false,
    isArcCertified: false,
    isActive: true,
  })

  const [form, setForm] = useState({
    businessName: "",
    abn: "",
    mvrlNumber: "",
    arcNumber: "",
    phone: "",
    mobile: "",
    email: "",
    address: "",
    suburb: "",
    postcode: "",
    defaultLabourRate: "95.00",
    smsSenderName: "DHALLA-AUTO",
    smsWindowStart: "09:00",
    smsWindowEnd: "20:00",
  })

  const loadSettings = () => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.workshop) {
          setSettings(data)
          setStaffList(data.staff || [])
          setForm({
            businessName: data.workshop.businessName || "",
            abn: data.workshop.abn || "",
            mvrlNumber: data.workshop.mvrlNumber || "",
            arcNumber: data.workshop.arcNumber || "",
            phone: data.workshop.phone || "",
            mobile: data.workshop.mobile || "",
            email: data.workshop.email || "",
            address: data.workshop.address || "",
            suburb: data.workshop.suburb || "",
            postcode: data.workshop.postcode || "",
            defaultLabourRate: String(data.workshop.defaultLabourRate || "95.00"),
            smsSenderName: data.workshop.smsSenderName || "DHALLA-AUTO",
            smsWindowStart: data.workshop.smsWindowStart || "09:00",
            smsWindowEnd: data.workshop.smsWindowEnd || "20:00",
          })
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenStaffModal = (staff?: any) => {
    if (staff) {
      setEditingStaff(staff)
      setStaffForm({
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        role: staff.role || "Mechanic",
        mobile: staff.mobile || "",
        email: staff.email || "",
        hourlyRate: String(staff.hourlyRate || "95.00"),
        isMvrlCertified: Boolean(staff.isMvrlCertified),
        isArcCertified: Boolean(staff.isArcCertified),
        isActive: staff.isActive !== undefined ? staff.isActive : true,
      })
    } else {
      setEditingStaff(null)
      setStaffForm({
        firstName: "",
        lastName: "",
        role: "Mechanic",
        mobile: "",
        email: "",
        hourlyRate: "95.00",
        isMvrlCertified: false,
        isArcCertified: false,
        isActive: true,
      })
    }
    setShowStaffModal(true)
  }

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingStaff) {
        await fetch("/api/settings/staff", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingStaff.id, ...staffForm }),
        })
      } else {
        await fetch("/api/settings/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(staffForm),
        })
      }
      setShowStaffModal(false)
      loadSettings()
    } catch (err) {
      console.error("Error saving staff:", err)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return
    try {
      await fetch(`/api/settings/staff?id=${id}`, { method: "DELETE" })
      loadSettings()
    } catch (err) {
      console.error("Error deleting staff:", err)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Loading workshop configurations...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#E8920D]" />
            Workshop Settings & Administration
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure workshop legal credentials, staff certifications, labour pricing, and ACMA compliance rules
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings Updated Successfully!
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("workshop")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "workshop"
              ? "border-[#E8920D] text-[#E8920D]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Workshop Profile & Rules
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "staff"
              ? "border-[#E8920D] text-[#E8920D]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          Staff & Mechanics ({staffList.length})
        </button>
      </div>

      {/* Tab Content: Workshop */}
      {activeTab === "workshop" && (
        <form onSubmit={handleSaveWorkshop} className="space-y-6 text-xs">
          {/* Business & Legal Identifiers */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-4 h-4 text-[#E8920D]" />
              Australian Business & Regulatory Licenses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Workshop Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Australian Business Number (ABN) *
                </label>
                <input
                  type="text"
                  required
                  value={form.abn}
                  onChange={(e) => setForm({ ...form, abn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Motor Vehicle Repairer Licence (MVRL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MVRL58941"
                  value={form.mvrlNumber}
                  onChange={(e) => setForm({ ...form, mvrlNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  ARC Refrigerant Handling Licence
                </label>
                <input
                  type="text"
                  placeholder="e.g. AU49120"
                  value={form.arcNumber}
                  onChange={(e) => setForm({ ...form, arcNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <Phone className="w-4 h-4 text-[#E8920D]" />
              Workshop Location & Contact Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mobile</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Suburb & Postcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Suburb"
                    value={form.suburb}
                    onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                    className="w-2/3 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    className="w-1/3 px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Labour Rates */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <DollarSign className="w-4 h-4 text-[#E8920D]" />
              Default Workshop Pricing & Labour Rates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Standard Hourly Labour Rate ($ AUD / hr ex-GST)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={form.defaultLabourRate}
                  onChange={(e) => setForm({ ...form, defaultLabourRate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Applied as default to new Labour work items on Job Cards.
                </p>
              </div>
            </div>
          </div>

          {/* SMS & ACMA Compliance */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <MessageSquare className="w-4 h-4 text-[#E8920D]" />
              SMS Reminders & ACMA Spam Act 2003 Rules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  SMS Sender Alphanumeric ID
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={form.smsSenderName}
                  onChange={(e) => setForm({ ...form, smsSenderName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Dispatch Window Start (AEST)
                </label>
                <input
                  type="text"
                  value={form.smsWindowStart}
                  onChange={(e) => setForm({ ...form, smsWindowStart: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Dispatch Window End (AEST)
                </label>
                <input
                  type="text"
                  value={form.smsWindowEnd}
                  onChange={(e) => setForm({ ...form, smsWindowEnd: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs">
              <strong>ACMA Compliance Note:</strong> Outbound promotional and service reminder SMS
              messages are automatically suffixed with "Reply STOP to opt out" and restricted to the
              9:00 AM – 8:00 PM AEST regulatory window.
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? "Saving Configuration..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      {/* Tab Content: Staff */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-[#1B2A4A]">Workshop Mechanics & Staff</h2>
              <p className="text-[11px] text-gray-500">
                Manage roles, hourly pay rates, and NSW MVRL / ARC certification flags for safety signoffs
              </p>
            </div>
            <button
              onClick={() => handleOpenStaffModal()}
              className="px-3.5 py-2 bg-[#1B2A4A] hover:bg-[#243656] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E8920D]" />
              Add Staff Member
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">NSW MVRL Certified</th>
                  <th className="py-3 px-4 text-center">ARC Certified (AC)</th>
                  <th className="py-3 px-4">Hourly Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {s.firstName} {s.lastName}
                      {!s.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-mono">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-medium text-[11px]">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 text-[11px]">
                      <div>{s.mobile || "—"}</div>
                      <div className="text-gray-400">{s.email || ""}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.isMvrlCertified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">
                          <Award className="w-3 h-3 text-emerald-600" /> MVRL
                        </span>
                      ) : (
                        <span className="text-gray-300 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.isArcCertified ? (
                        <span className="inline-flex items-center gap-1 text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded font-bold text-[10px] border border-cyan-200">
                          <ShieldCheck className="w-3 h-3 text-cyan-600" /> ARC
                        </span>
                      ) : (
                        <span className="text-gray-300 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {s.hourlyRate ? `$${s.hourlyRate.toFixed(2)}/hr` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenStaffModal(s)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit Staff"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm">
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.firstName}
                    onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={staffForm.lastName}
                    onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Role *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Apprentice">Apprentice</option>
                    <option value="Front Desk">Front Desk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={staffForm.hourlyRate}
                    onChange={(e) => setStaffForm({ ...staffForm, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="04xx xxx xxx"
                    value={staffForm.mobile}
                    onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Certifications Checkboxes */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <p className="font-bold text-gray-800 text-[11px]">NSW Compliance Certifications</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffForm.isMvrlCertified}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, isMvrlCertified: e.target.checked })
                    }
                    className="rounded text-[#E8920D] focus:ring-[#E8920D]"
                  />
                  <span className="text-gray-700 font-medium text-[11px]">
                    NSW MVRL Certified (Authorized for Pink Slip / Safety Signoff)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffForm.isArcCertified}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, isArcCertified: e.target.checked })
                    }
                    className="rounded text-[#E8920D] focus:ring-[#E8920D]"
                  />
                  <span className="text-gray-700 font-medium text-[11px]">
                    ARC Certified (Authorized for Automotive Air Conditioning & Gas)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm"
                >
                  {editingStaff ? "Update Staff" : "Add Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

