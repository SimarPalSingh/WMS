"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Wrench,
  Car,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  ArrowRightLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  Layers,
  Sparkles,
  Phone,
  Filter
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

interface Bay {
  id: string
  name: string
  bayType: string
  isActive: boolean
  displayOrder: number
}

interface Staff {
  id: string
  firstName: string
  lastName?: string | null
  role: string
  isMvrlCertified: boolean
  isArcCertified: boolean
}

interface JobCardLine {
  id: string
  description: string
  lineType: string
  qty: number
  unitPriceExGst: number
  isCompleted: boolean
}

interface JobCard {
  id: string
  jobCardNumber: string
  status: string
  priority: string
  bayId: string | null
  staffId: string | null
  dateIn: string
  dateDue?: string | null
  customerNotes?: string | null
  internalNotes?: string | null
  totalExGst: number
  client?: {
    id: string
    firstName?: string | null
    lastName?: string | null
    businessName?: string | null
    mobilePhone?: string | null
  }
  vehicle?: {
    id: string
    registration: string
    make: string
    model: string
    year: number
    bodyType?: string | null
  }
  staff?: Staff | null
  bay?: Bay | null
  lines: JobCardLine[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Booked: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Waiting: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  InProgress: { bg: "bg-amber-500 text-white", text: "text-white", border: "border-amber-600" },
  WaitingForParts: { bg: "bg-red-50 text-red-700", text: "text-red-700", border: "border-red-300" },
  QC: { bg: "bg-purple-100 text-purple-800", text: "text-purple-800", border: "border-purple-200" },
  ReadyForPickup: { bg: "bg-emerald-500 text-white", text: "text-white", border: "border-emerald-600" },
  Completed: { bg: "bg-gray-200 text-gray-800", text: "text-gray-800", border: "border-gray-400" },
}

export default function FloorBoardPage() {
  const [bays, setBays] = useState<Bay[]>([])
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [fullscreen, setFullscreen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string>("All")
  const [selectedBayType, setSelectedBayType] = useState<string>("All")
  
  // Assign Modal
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; bayId: string; bayName: string }>({
    isOpen: false,
    bayId: "",
    bayName: "",
  })

  // Live time ticker
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setRefreshing(true)
    try {
      const res = await fetch("/api/jobs")
      if (res.ok) {
        const data = await res.json()
        setBays(data.bays || [])
        setJobCards(data.jobCards || [])
        setStaffList(data.staff || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Failed to load floor board data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 30-second Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchData(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Update Job Status
  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchData(true)
      }
    } catch (err) {
      console.error("Failed to update status:", err)
    }
  }

  // Assign Job to Bay
  const handleAssignToBay = async (jobId: string, bayId: string | null) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bayId }),
      })
      if (res.ok) {
        setAssignModal({ isOpen: false, bayId: "", bayName: "" })
        fetchData(true)
      }
    } catch (err) {
      console.error("Failed to assign bay:", err)
    }
  }

  // Toggle Line Task Completion
  const handleToggleLine = async (job: JobCard, lineIndex: number) => {
    const updatedLines = [...job.lines]
    updatedLines[lineIndex] = {
      ...updatedLines[lineIndex],
      isCompleted: !updatedLines[lineIndex].isCompleted,
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: updatedLines }),
      })
      if (res.ok) {
        fetchData(true)
      }
    } catch (err) {
      console.error("Failed to toggle task:", err)
    }
  }

  // Filtered Bays
  const filteredBays = useMemo(() => {
    return bays.filter((bay) => {
      if (selectedBayType !== "All" && bay.bayType !== selectedBayType) return false
      return true
    })
  }, [bays, selectedBayType])

  // Active jobs in bays
  const activeBayJobs = useMemo(() => {
    return jobCards.filter((j) => j.bayId && j.status !== "Completed" && j.status !== "Cancelled")
  }, [jobCards])

  // Unassigned / Yard Jobs
  const unassignedJobs = useMemo(() => {
    return jobCards.filter(
      (j) => (!j.bayId || j.bay?.bayType === "Yard") && j.status !== "Completed" && j.status !== "Cancelled"
    )
  }, [jobCards])

  // Calculate metrics
  const occupiedCount = bays.filter((b) => activeBayJobs.some((j) => j.bayId === b.id)).length
  const totalBays = bays.length || 4
  const occupancyPct = Math.round((occupiedCount / totalBays) * 100)
  const inProgressCount = jobCards.filter((j) => j.status === "InProgress").length
  const waitingPartsCount = jobCards.filter((j) => j.status === "WaitingForParts").length
  const readyPickupCount = jobCards.filter((j) => j.status === "ReadyForPickup").length

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e))
      setFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setFullscreen(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-mono text-sm space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#E8920D]" />
        <p>Loading Workshop Floor Board Live State...</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${fullscreen ? "p-6 bg-[#0F172A] text-white min-h-screen" : "max-w-7xl mx-auto"}`}>
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#1B2A4A] text-amber-400 flex items-center justify-center shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-[#1B2A4A] tracking-tight">Workshop Floor Live Board</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              <span>Dhalla Automotive • Penrith NSW</span>
              <span>•</span>
              <span className="font-mono text-gray-700 font-semibold">{currentTime}</span>
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              autoRefresh
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-gray-100 border-gray-300 text-gray-600"
            }`}
            title="Toggle 30s Auto Refresh"
          >
            {autoRefresh ? <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-gray-500" />}
            Auto-Sync {autoRefresh ? "30s" : "Off"}
          </button>

          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#E8920D]" : "text-gray-500"}`} />
            Refresh
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B2A4A] text-white hover:bg-[#243656] shadow-xs flex items-center gap-1.5 transition-all"
            title="Wall Screen Display Mode"
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {fullscreen ? "Exit Wall Mode" : "Wall Screen Mode"}
          </button>

          <Link
            href="/jobs"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E8920D] text-white hover:bg-[#d0830b] shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Job Card
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Bay Utilization</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-gray-900">{occupancyPct}%</span>
            <span className="text-xs text-gray-500 font-mono">{occupiedCount}/{totalBays} Bays</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${occupancyPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${occupancyPct}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">In Progress</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-amber-600">{inProgressCount}</span>
            <span className="text-[11px] text-amber-600 font-medium">On Hoist/Floor</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Waiting Parts</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-red-600">{waitingPartsCount}</span>
            <span className="text-[11px] text-red-500 font-medium">On Hold</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Ready for Pickup</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600">{readyPickupCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">QC Passed</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Yard Queue</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-blue-600">{unassignedJobs.length}</span>
            <span className="text-[11px] text-blue-500 font-medium">Awaiting Bay</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Staff</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-gray-900">{staffList.length}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Tinku • Baljit</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-700">Filter Bays:</span>
          {["All", "Hoist", "Ground Level", "Tyre Bay", "Yard"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedBayType(type)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedBayType === type
                  ? "bg-[#1B2A4A] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="text-gray-400 font-mono text-[11px]">
          Last sync: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Main Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredBays.map((bay) => {
          const activeJob = jobCards.find(
            (j) => j.bayId === bay.id && j.status !== "Completed" && j.status !== "Cancelled"
          )

          const totalLines = activeJob?.lines?.length || 0
          const completedLines = activeJob?.lines?.filter((l) => l.isCompleted)?.length || 0
          const progressPct = totalLines > 0 ? Math.round((completedLines / totalLines) * 100) : 0

          const isOverdue = activeJob?.dateDue && new Date(activeJob.dateDue) < new Date() && activeJob.status !== "ReadyForPickup"

          return (
            <div
              key={bay.id}
              className={`flex flex-col rounded-2xl border transition-all overflow-hidden ${
                activeJob
                  ? activeJob.status === "WaitingForParts"
                    ? "border-red-300 bg-white ring-2 ring-red-100"
                    : activeJob.status === "ReadyForPickup"
                    ? "border-emerald-300 bg-white ring-2 ring-emerald-100"
                    : isOverdue
                    ? "border-red-400 bg-white ring-2 ring-red-200"
                    : "border-amber-300 bg-white shadow-md ring-1 ring-amber-100"
                  : "border-dashed border-gray-300 bg-gray-50/70 hover:bg-gray-50"
              }`}
            >
              {/* Bay Header */}
              <div className="px-4 py-3 bg-[#1B2A4A] text-white flex items-center justify-between border-b border-[#243656]">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8920D]"></div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white">{bay.name}</h3>
                    <p className="text-[10px] text-gray-300 font-mono">{bay.bayType}</p>
                  </div>
                </div>

                {activeJob ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      activeJob.status === "InProgress"
                        ? "bg-[#E8920D] text-white"
                        : activeJob.status === "WaitingForParts"
                        ? "bg-red-500 text-white animate-pulse"
                        : activeJob.status === "ReadyForPickup"
                        ? "bg-emerald-500 text-white"
                        : activeJob.status === "QC"
                        ? "bg-purple-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {activeJob.status === "InProgress"
                      ? "In Progress"
                      : activeJob.status === "WaitingForParts"
                      ? "Waiting Parts"
                      : activeJob.status === "ReadyForPickup"
                      ? "Ready for Pickup"
                      : activeJob.status}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-700 text-gray-300">
                    Empty Bay
                  </span>
                )}
              </div>

              {/* Bay Content */}
              {activeJob ? (
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Vehicle & Rego Plate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {/* Aussie Number Plate Style */}
                      <Link href={`/vehicles/${activeJob.vehicle?.id || ""}`}>
                        <div className="inline-flex items-center px-3 py-1 rounded-md bg-[#1B2A4A] text-amber-400 font-mono font-black text-sm tracking-widest border-2 border-[#243656] shadow-inner hover:border-amber-400 transition-colors">
                          <span className="text-[9px] text-gray-400 mr-1.5 font-sans font-normal">NSW</span>
                          {activeJob.vehicle?.registration}
                        </div>
                      </Link>

                      <Link
                        href={`/jobs/${activeJob.id}`}
                        className="text-xs font-mono font-bold text-[#1B2A4A] hover:text-[#E8920D] bg-gray-100 px-2 py-1 rounded"
                      >
                        {activeJob.jobCardNumber}
                      </Link>
                    </div>

                    <p className="font-bold text-sm text-gray-900 truncate">
                      {activeJob.vehicle?.year} {activeJob.vehicle?.make} {activeJob.vehicle?.model}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {activeJob.customerNotes || "General Mechanical Service"}
                    </p>
                  </div>

                  {/* Client & Mechanic Info */}
                  <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs border border-gray-100">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {activeJob.client?.businessName || `${activeJob.client?.firstName || ""} ${activeJob.client?.lastName || ""}`}
                      </span>
                      {activeJob.client?.mobilePhone && (
                        <a
                          href={`tel:${activeJob.client.mobilePhone}`}
                          className="text-[#E8920D] hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          {activeJob.client.mobilePhone}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[11px]">
                      <span className="text-gray-500">Assigned Tech:</span>
                      <span className="font-semibold text-[#1B2A4A] flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-[#E8920D]" />
                        {activeJob.staff?.firstName || "Unassigned"}
                        {activeJob.staff?.isMvrlCertified && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono font-bold">
                            MVRL
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Task Progress & Checklist Items */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Progress ({completedLines}/{totalLines || 0})
                      </span>
                      <span className="font-mono font-bold text-gray-900">{progressPct}%</span>
                    </div>

                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPct === 100
                            ? "bg-emerald-500"
                            : progressPct > 50
                            ? "bg-[#E8920D]"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    {/* Checklist snippets */}
                    {activeJob.lines && activeJob.lines.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {activeJob.lines.slice(0, 3).map((line, idx) => (
                          <div
                            key={line.id || idx}
                            onClick={() => handleToggleLine(activeJob, idx)}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 hover:bg-amber-50/50 cursor-pointer text-[11px] border border-gray-100 transition-colors"
                          >
                            <span
                              className={`truncate flex-1 ${
                                line.isCompleted ? "line-through text-gray-400" : "text-gray-700 font-medium"
                              }`}
                            >
                              {line.description}
                            </span>
                            <input
                              type="checkbox"
                              checked={line.isCompleted || false}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-[#E8920D] focus:ring-[#E8920D] ml-2 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Status Action Dropdown & Yard Reassignment */}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={activeJob.status}
                        onChange={(e) => handleUpdateStatus(activeJob.id, e.target.value)}
                        className="flex-1 bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-[#E8920D]"
                      >
                        <option value="Booked">Booked</option>
                        <option value="Waiting">Waiting</option>
                        <option value="InProgress">In Progress</option>
                        <option value="WaitingForParts">Waiting For Parts</option>
                        <option value="QC">Quality Check (QC)</option>
                        <option value="ReadyForPickup">Ready for Pickup</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        onClick={() => handleAssignToBay(activeJob.id, null)}
                        title="Move to Yard / Free Bay"
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      href={`/jobs/${activeJob.id}`}
                      className="block text-center w-full py-1.5 rounded-lg bg-gray-100 hover:bg-[#1B2A4A] hover:text-white text-gray-700 font-semibold text-xs transition-colors"
                    >
                      Open Full Job Card →
                    </Link>
                  </div>
                </div>
              ) : (
                /* Empty Bay State */
                <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Bay Available</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Ready for vehicle allocation</p>
                  </div>

                  <button
                    onClick={() =>
                      setAssignModal({
                        isOpen: true,
                        bayId: bay.id,
                        bayName: bay.name,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-[#E8920D] text-white hover:bg-[#d0830b] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Assign Vehicle
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Yard & Unassigned Staging Area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#E8920D]" />
            <div>
              <h2 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
                Yard & Holding Area (Unallocated Queue)
              </h2>
              <p className="text-xs text-gray-500">
                Vehicles parked outside, waiting for hoist availability, parts arrival, or customer pickup
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
            {unassignedJobs.length} Vehicles in Yard
          </span>
        </div>

        {unassignedJobs.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No vehicles currently waiting in the yard or queue. All active jobs are assigned to bays!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-amber-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#1B2A4A] text-amber-400 font-mono font-bold text-xs tracking-wider">
                    {job.vehicle?.registration}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.status === "WaitingForParts"
                        ? "bg-red-100 text-red-800"
                        : job.status === "ReadyForPickup"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {job.customerNotes || "Standard Service"}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {job.staff?.firstName || "No Tech"}
                  </span>

                  <div className="flex items-center space-x-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAssignToBay(job.id, e.target.value)
                      }}
                      defaultValue=""
                      className="bg-white border border-gray-300 text-xs rounded-lg px-2 py-1 font-medium focus:ring-1 focus:ring-[#E8920D]"
                    >
                      <option value="" disabled>
                        Pull into Bay...
                      </option>
                      {bays.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="p-1 rounded-md bg-gray-200 hover:bg-[#1B2A4A] hover:text-white transition-colors"
                      title="Open Job"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Job Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-[#1B2A4A]">Assign Vehicle to {assignModal.bayName}</h3>
                <p className="text-xs text-gray-500">Select an unallocated or queued job card</p>
              </div>
              <button
                onClick={() => setAssignModal({ isOpen: false, bayId: "", bayName: "" })}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {jobCards.filter((j) => j.status !== "Completed" && j.status !== "Cancelled").length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No active jobs found in pipeline.</p>
              ) : (
                jobCards
                  .filter((j) => j.status !== "Completed" && j.status !== "Cancelled")
                  .map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleAssignToBay(job.id, assignModal.bayId)}
                      className="p-3 rounded-xl border border-gray-200 hover:border-[#E8920D] hover:bg-amber-50/30 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded">
                            {job.vehicle?.registration}
                          </span>
                          <span className="text-xs font-semibold text-gray-900">
                            {job.vehicle?.make} {job.vehicle?.model}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 truncate">
                          {job.customerNotes || "General Service"} • {job.jobCardNumber}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#E8920D] flex items-center gap-1">
                        Select <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setAssignModal({ isOpen: false, bayId: "", bayName: "" })}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
