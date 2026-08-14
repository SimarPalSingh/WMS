"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import {
  Car,
  Wrench,
  FileText,
  Calendar,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.client) {
          setClient(data.client)
          if (data.client.clientVehicles?.length > 0) {
            setSelectedVehicleId(data.client.clientVehicles[0].vehicle.id)
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center p-4">
        <div className="text-center font-mono text-xs text-gray-500">
          Loading your secure customer vehicle portal...
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-md">
          <h1 className="text-base font-bold text-gray-900 mb-2">Link Expired or Invalid</h1>
          <p className="text-xs text-gray-500">
            Please check the link sent to your SMS or contact Dhalla Automotive for assistance.
          </p>
        </div>
      </div>
    )
  }

  const selectedVehicle = client.clientVehicles?.find(
    (cv: any) => cv.vehicle.id === selectedVehicleId
  )?.vehicle

  const clientName = client.clientType === "Business"
    ? client.businessName
    : `${client.firstName} ${client.lastName}`

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#1F2937] pb-12">
      {/* Top Customer Header */}
      <header className="bg-[#1B2A4A] text-white py-6 px-4 sm:px-8 border-b border-[#243656] shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8920D] text-white font-black text-xl flex items-center justify-center shadow-md">
              M
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">
                {client.workshop?.businessName || "Dhalla Automotive Pty Ltd"}
              </h1>
              <p className="text-[11px] text-amber-300 font-mono">
                Customer Vehicle Health & Service Portal
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#243656] sm:pl-6 text-xs text-gray-300">
            <p className="font-semibold text-white">Welcome back, {clientName}</p>
            <p className="font-mono text-gray-400 text-[11px]">{client.mobilePhone}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* Vehicle Selector Tabs */}
        {client.clientVehicles?.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-500 font-semibold mr-2">Select Vehicle:</span>
            {client.clientVehicles.map((cv: any) => (
              <button
                key={cv.vehicle.id}
                onClick={() => setSelectedVehicleId(cv.vehicle.id)}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                  selectedVehicleId === cv.vehicle.id
                    ? "bg-[#1B2A4A] text-amber-400 shadow-sm border border-[#243656]"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cv.vehicle.registration} ({cv.vehicle.make} {cv.vehicle.model})
              </button>
            ))}
          </div>
        )}

        {/* Selected Vehicle Health Dashboard */}
        {selectedVehicle && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex items-center space-x-3">
                <div className="bg-[#1B2A4A] text-amber-400 px-3 py-1.5 rounded-lg font-mono font-black text-xl border border-[#243656] tracking-wider">
                  {selectedVehicle.registration}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedVehicle.colour || "Standard"} • {selectedVehicle.fuelType || "Petrol"}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${client.workshop?.phone || "0247321199"}`}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Book Next Service ({client.workshop?.phone || "(02) 4732 1199"})</span>
              </a>
            </div>

            {/* 3 Status Health Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Current Odometer
                </span>
                <p className="text-xl font-bold font-mono text-gray-900 mt-1">
                  {selectedVehicle.currentMileageKm
                    ? `${selectedVehicle.currentMileageKm.toLocaleString()} km`
                    : "Recorded at service"}
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Next Logbook Service Due
                </span>
                <p className="text-base font-bold font-mono text-emerald-900 mt-1">
                  {formatDateAU(selectedVehicle.nextServiceDue)}
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">Recommended interval</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">
                  NSW Pink Slip (e-Safety Check)
                </span>
                <p className="text-base font-bold font-mono text-purple-900 mt-1">
                  {formatDateAU(selectedVehicle.pinkSlipExpiry)}
                </p>
                <p className="text-[10px] text-purple-700 mt-0.5 font-mono">RMS Registration check</p>
              </div>
            </div>

            {/* Service & Logbook History Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E8920D]" />
                Official Logbook Service Records
              </h3>

              {selectedVehicle.jobCards?.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No service records recorded online yet.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {selectedVehicle.jobCards.map((job: any) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">
                            {job.jobCardNumber}
                          </span>
                          <span className="text-gray-400 font-mono">•</span>
                          <span className="font-semibold text-gray-800">
                            {job.customerNotes || "Standard Scheduled Service"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Date: {formatDateAU(job.dateIn)}
                        </p>
                      </div>

                      {job.invoice && (
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            {formatAUD(job.invoice.finalAmount)}
                          </span>
                          <Link
                            href={`/invoices/${job.invoice.id}`}
                            target="_blank"
                            className="inline-flex items-center space-x-1 text-xs text-[#E8920D] font-bold hover:underline"
                          >
                            <span>Download Tax Invoice</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-6 font-mono">
          Powered by MechWise WMS • {client.workshop?.businessName} (ABN: {client.workshop?.abn})
        </footer>
      </main>
    </div>
  )
}
