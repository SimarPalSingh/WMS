"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
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
  Plus
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data.client)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

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
  const totalSpend = client.invoices?.reduce(
    (acc: number, inv: any) => acc + (inv.finalAmount || 0),
    0
  )

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

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-1.5 bg-[#E8920D] hover:bg-[#d68307] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs">
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
    </div>
  )
}
