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
  Package,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useSidebar } from "@/context/SidebarContext"

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
  const { isOpen, isCollapsed, toggleCollapse, closeSidebar } = useSidebar()

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#1B2A4A] text-white flex flex-col h-screen shrink-0 border-r border-[#243656] transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#243656] flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-lg bg-[#E8920D] flex items-center justify-center font-black text-xl text-white shadow-md shrink-0">
              M
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-bold text-base tracking-wider text-white">MECHWISE</h1>
                <p className="text-[10px] text-gray-400 font-mono tracking-tight">WMS v2.0 • AU</p>
              </div>
            )}
          </div>

          {/* Close Button on Mobile Drawer */}
          <button
            onClick={closeSidebar}
            className="p-1 text-gray-400 hover:text-white lg:hidden rounded-lg hover:bg-[#243656]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workshop Profile Pill */}
        {!isCollapsed ? (
          <div className="mx-3 my-3 p-3 bg-[#243656] rounded-lg flex items-center justify-between text-xs transition-all">
            <div className="truncate">
              <p className="font-semibold text-gray-100 truncate">Dhalla Automotive</p>
              <p className="text-gray-400 text-[10px] font-mono">MVRL58941 • NSW</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          </div>
        ) : (
          <div className="mx-auto my-3 p-2 bg-[#243656] rounded-lg flex items-center justify-center text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Dhalla Automotive (Online)"></span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar()
                }}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2.5"
                } rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#E8920D] text-white shadow-sm"
                    : "text-gray-300 hover:bg-[#243656] hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
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

        {/* Desktop Collapse Arrow Button */}
        <div className="hidden lg:flex px-3 py-2 border-t border-[#243656]/60 justify-end">
          <button
            onClick={toggleCollapse}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#243656] rounded-lg transition-colors w-full flex items-center justify-center gap-1.5 text-[11px]"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-gray-400 font-mono text-[10px]">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-[#243656] bg-[#15223c] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-[#E8920D]/20 border border-[#E8920D] text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
              TD
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">Tinku Dhalla</p>
                <p className="text-[10px] text-emerald-400 font-mono">Owner (Certified)</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

