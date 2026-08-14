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
} from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

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

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.workshop) {
          setSettings(data)
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
  }, [])

  const handleSave = async (e: React.FormEvent) => {
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
            Workshop Settings & Compliance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure ABN, MVRL/ARC licenses, default hourly labour rates, and ACMA SMS settings
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings Updated Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
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
    </div>
  )
}
