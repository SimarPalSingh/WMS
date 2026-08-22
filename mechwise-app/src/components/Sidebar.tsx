"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  FileText,
  BellRing,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronRight,
  Package,
  Sparkles,
} from "lucide-react"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Floor Board", href: "/floor", icon: Wrench, badge: "3 Active" },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Job Cards", href: "/jobs", icon: Wrench },
  { label: "Quotations", href: "/quotations", icon: Sparkles },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Invoices", href: "/invoices", icon: FileText, badge: "1 Due" },
  { label: "Reminders", href: "/reminders", icon: BellRing, badge: "1 Overdue", badgeColor: "bg-red-500" },
  { label: "Reports & BAS", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#1B2A4A] text-white flex flex-col h-screen shrink-0 border-r border-[#243656]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#243656] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#E8920D] flex items-center justify-center font-black text-xl text-white shadow-md">
            M
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white">MECHWISE</h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-tight">WMS v2.0 • AU</p>
          </div>
        </div>
      </div>

      {/* Workshop Profile Pill */}
      <div className="mx-4 my-3 p-3 bg-[#243656] rounded-lg flex items-center justify-between text-xs">
        <div className="truncate">
          <p className="font-semibold text-gray-100 truncate">Dhalla Automotive</p>
          <p className="text-gray-400 text-[11px] font-mono">MVRL58941 • NSW</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#E8920D] text-white shadow-sm"
                  : "text-gray-300 hover:bg-[#243656] hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || "bg-[#243656] text-amber-300 border border-[#E8920D]/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-[#243656] bg-[#15223c] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#E8920D]/20 border border-[#E8920D] text-amber-400 font-bold flex items-center justify-center text-xs">
            TD
          </div>
          <div>
            <p className="text-xs font-medium text-white">Tinku Dhalla</p>
            <p className="text-[10px] text-emerald-400 font-mono">Owner (Certified)</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
