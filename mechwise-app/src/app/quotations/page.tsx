"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Calendar,
  User,
  Car
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

const STATUS_TABS = ["All", "Pending", "Finalised", "Accepted", "Declined"]

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchQuotations = () => {
    setLoading(true)
    fetch(`/api/quotations?status=${statusFilter}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotations(data.quotations || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchQuotations()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Quotations & Estimates
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Formal price estimates generated from Job Cards, auto-finalised on job completion and invoicing
          </p>
        </div>

        <Link
          href="/jobs"
          className="flex items-center space-x-2 bg-[#1B2A4A] hover:bg-[#243656] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <span>Open New Job / Quote</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Quote # (QT-0001), Rego, or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white font-mono placeholder:font-sans transition-all"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {STATUS_TABS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading formal quotations...
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No quotations found matching your criteria. You can generate one directly inside any Job Card.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Vehicle Rego</th>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Subtotal (Ex-GST)</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">GST</th>
                  <th className="py-3 px-4 text-right">Estimated Total</th>
                  <th className="py-3 px-4 text-right">Linked Job Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => {
                  const clientName = q.client
                    ? q.client.businessName || `${q.client.firstName || ""} ${q.client.lastName || ""}`
                    : "Unknown"

                  return (
                    <tr key={q.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {q.quoteNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {formatDateAU(q.quoteDate || q.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded border border-[#243656]">
                          {q.vehicle?.registration}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{clientName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {q.client?.mobilePhone}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            q.status === "Finalised"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.status === "Accepted"
                              ? "bg-blue-100 text-blue-800"
                              : q.status === "Declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {formatAUD(q.subtotalExGst)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600">
                        {q.discountExGst ? `-${formatAUD(q.discountExGst)}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-500">
                        {formatAUD(q.gstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        {formatAUD(q.totalAmount || q.totalIncGst || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {q.jobCard ? (
                          <Link
                            href={`/jobs/${q.jobCard.id}`}
                            className="inline-flex items-center text-purple-700 font-semibold hover:underline font-mono text-xs"
                          >
                            <span>{q.jobCard.jobCardNumber}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Direct</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
