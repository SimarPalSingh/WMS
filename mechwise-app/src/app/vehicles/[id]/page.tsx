"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
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
  Plus
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicle(data.vehicle)
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
        Loading vehicle dossier...
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

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-1.5 bg-[#E8920D] hover:bg-[#d68307] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Job Card for this Vehicle</span>
          </button>
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
                ) : (
                  <span className="text-xs text-gray-400 italic">Unassigned</span>
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
    </div>
  )
}
