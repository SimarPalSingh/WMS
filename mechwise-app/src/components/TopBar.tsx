"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Bell, Calendar, Car, User, FileText, Wrench } from "lucide-react"

export default function TopBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [today, setToday] = useState("")

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-AU", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    )
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const [vRes, cRes, iRes] = await Promise.all([
          fetch(`/api/vehicles?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch(`/api/clients?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch(`/api/invoices?search=${encodeURIComponent(query)}`).then((r) => r.json()),
        ])

        setResults({
          vehicles: vRes.vehicles?.slice(0, 3) || [],
          clients: cRes.clients?.slice(0, 3) || [],
          invoices: iRes.invoices?.slice(0, 3) || [],
        })
        setIsOpen(true)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (url: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(url)
  }

  const hasResults =
    results &&
    (results.vehicles.length > 0 || results.clients.length > 0 || results.invoices.length > 0)

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between shrink-0 relative z-30">
      {/* Global Lookup Search Dropdown */}
      <div ref={searchRef} className="flex items-center w-96 relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Lookup Rego (e.g. DL88AA), Client, or Invoice#..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white font-mono placeholder:font-sans transition-all"
        />

        {isOpen && (
          <div className="absolute top-11 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden text-xs z-50 animate-in fade-in-50 duration-150">
            {searching ? (
              <div className="p-4 text-center text-gray-400 font-mono">Searching registry...</div>
            ) : hasResults ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {/* Vehicles Results */}
                {results.vehicles.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 px-2 block mb-1">
                      Vehicles
                    </span>
                    {results.vehicles.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => handleSelect(`/vehicles/${v.id}`)}
                        className="w-full text-left p-2 rounded-lg hover:bg-amber-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded text-[11px]">
                            {v.registration}
                          </span>
                          <span className="text-gray-800 font-semibold truncate">
                            {v.year} {v.make} {v.model}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Clients Results */}
                {results.clients.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 px-2 block mb-1">
                      Customers
                    </span>
                    {results.clients.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(`/clients/${c.id}`)}
                        className="w-full text-left p-2 rounded-lg hover:bg-amber-50 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.clientType === "Business"
                              ? c.businessName
                              : `${c.firstName} ${c.lastName}`}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">{c.mobilePhone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Invoices Results */}
                {results.invoices.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 px-2 block mb-1">
                      Tax Invoices
                    </span>
                    {results.invoices.map((inv: any) => (
                      <button
                        key={inv.id}
                        onClick={() => handleSelect(`/invoices/${inv.id}`)}
                        className="w-full text-left p-2 rounded-lg hover:bg-amber-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">
                            {inv.invoiceNumber}
                          </span>
                          <span className="font-mono text-gray-500">
                            ({inv.vehicle?.registration})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700">
                          ${inv.finalAmount?.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400 font-mono">No matching records</div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-gray-600 bg-[#F3F5F7] px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-mono">{today}</span>
        </div>

        <Link
          href="/reminders"
          className="relative p-2 text-gray-600 hover:text-gray-900 bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Link>
      </div>
    </header>
  )
}
