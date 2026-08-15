"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Printer,
  Download,
  CreditCard,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchInvoices = () => {
    setLoading(true)
    fetch(`/api/invoices?status=${statusFilter}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchInvoices()
  }

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)
  const totalUnpaid = invoices
    .filter((inv) => inv.paymentStatus !== "Paid")
    .reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#E8920D]" />
            Tax Invoices & Billing
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            ATO-compliant sequential invoicing with 10% Australian GST & payments collection
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">
              Outstanding Unpaid
            </span>
            <span className="font-mono font-bold text-sm text-red-600">
              {formatAUD(totalUnpaid)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Invoice # (INV-0088), Rego, or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white font-mono placeholder:font-sans transition-all"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", "Unpaid", "Paid", "Partial"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st
                  ? "bg-[#1B2A4A] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading tax invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No tax invoices found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date Issued</th>
                  <th className="py-3 px-4">Vehicle Rego</th>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Subtotal (Ex-GST)</th>
                  <th className="py-3 px-4 text-right">GST</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => {
                  const clientName = inv.client
                    ? inv.client.businessName || `${inv.client.firstName || ""} ${inv.client.lastName || ""}`
                    : "Unknown"

                  return (
                    <tr key={inv.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-mono font-bold text-gray-900 hover:text-[#E8920D]"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        {inv.isGstFree && (
                          <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border">
                            GST-Free
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {formatDateAU(inv.invoiceDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded border border-[#243656]">
                          {inv.vehicle?.registration}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{clientName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {inv.client?.mobilePhone}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.paymentStatus === "Partial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {formatAUD(inv.subtotalExGst)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-500">
                        {inv.isGstFree ? (
                          <span className="text-gray-400">$0.00</span>
                        ) : (
                          formatAUD(inv.gstAmount)
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        {formatAUD(inv.finalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="inline-flex items-center text-[#E8920D] font-semibold hover:underline text-xs"
                        >
                          <span>View Tax Invoice</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
