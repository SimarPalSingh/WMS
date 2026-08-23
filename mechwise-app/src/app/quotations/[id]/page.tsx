"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import {
  Sparkles,
  Car,
  User,
  ArrowLeft,
  DollarSign,
  Printer,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Trash2,
  Calendar,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [quotation, setQuotation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const fetchQuotation = () => {
    fetch(`/api/quotations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.quotation) {
          setQuotation(data.quotation)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchQuotation()
  }, [id])

  const handleUpdateStatus = async (newStatus: string) => {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchQuotation()
      } else {
        alert("Failed to update status")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDeleteQuotation = async () => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/quotations")
      } else {
        const json = await res.json()
        alert(json.error || "Failed to delete quotation")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred while deleting quotation.")
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Loading formal quotation estimate...
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Quotation not found.
      </div>
    )
  }

  const isBusiness = quotation.client?.clientType === "Business"
  const workshop = quotation.workshop || {
    businessName: "DHALLA AUTOMOTIVE PTY LTD",
    abn: "95 611 566 888",
    mvrlNumber: "MVRL58941",
    address: "70A Cox Avenue, Kingswood NSW 2747",
    phone: "(02) 4732 1199",
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation & Actions (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Quotations</span>
        </Link>

        <div className="flex items-center space-x-3">
          {quotation.jobCard && (
            <Link
              href={`/jobs/${quotation.jobCard.id}?editQuote=true`}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-all"
              title="Edit repair line items in Job Card and re-sync Quote"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Edit in Job Card</span>
            </Link>
          )}

          {quotation.jobCard && (
            <Link
              href={`/jobs/${quotation.jobCard.id}`}
              className="flex items-center space-x-1.5 bg-[#1B2A4A] hover:bg-[#243656] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Go to Linked Job Card ({quotation.jobCard.jobCardNumber}) →</span>
            </Link>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Quote</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Quotation PDF</span>
          </button>
        </div>
      </div>

      {/* 2-Column: Printable Quotation on Left + Status & Job Details Panel on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Printable Official Quotation Document (Identical format to Tax Invoice) */}
        <div className="printable-document md:col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden print:border-none print:shadow-none">
          {/* Navy Quotation Header */}
          <div className="bg-[#1B2A4A] text-white p-6 flex items-center justify-between border-b border-[#243656]">
            <div>
              <h1 className="text-xl font-black tracking-wider text-white">
                {workshop.businessName || "DHALLA AUTOMOTIVE PTY LTD"}
              </h1>
              <p className="text-xs text-amber-400 font-mono mt-0.5">
                ABN: {workshop.abn || "95 611 566 888"} • MVRL:{" "}
                {workshop.mvrlNumber || "MVRL58941"}
              </p>
              <p className="text-[11px] text-gray-300 mt-1">
                {workshop.address || "70A Cox Avenue, Kingswood NSW 2747"} •{" "}
                {workshop.phone || "(02) 4732 1199"}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-white/10 rounded font-mono font-bold text-base tracking-widest border border-white/20">
                FORMAL QUOTATION
              </span>
              <p className="font-mono font-bold text-amber-400 text-sm mt-1">
                {quotation.quoteNumber}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Quotation Issued To & Vehicle Grid */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-gray-100 pb-5">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Quotation Prepared For:
                </span>
                <p className="font-bold text-gray-900 text-sm">
                  {isBusiness
                    ? quotation.client?.businessName
                    : `${quotation.client?.firstName} ${quotation.client?.lastName}`}
                </p>
                {isBusiness && quotation.client?.abn && (
                  <p className="font-mono text-gray-500">ABN: {quotation.client.abn}</p>
                )}
                <p className="text-gray-600 mt-0.5">{quotation.client?.address}</p>
                <p className="text-gray-600">
                  {quotation.client?.suburb} {quotation.client?.state} {quotation.client?.postcode}
                </p>
                <p className="font-mono text-gray-800 mt-1">{quotation.client?.mobilePhone}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Vehicle Target:
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-xs bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded border">
                    {quotation.vehicle?.registration}
                  </span>
                  <span className="font-bold text-gray-900">
                    {quotation.vehicle?.year} {quotation.vehicle?.make} {quotation.vehicle?.model}
                  </span>
                </div>
                <div className="space-y-0.5 text-gray-600 font-mono text-[11px]">
                  <p>Quote Date: {formatDateAU(quotation.quoteDate || quotation.createdAt)}</p>
                  <p>
                    Valid Until:{" "}
                    {quotation.expiryDate
                      ? formatDateAU(quotation.expiryDate)
                      : "30 Days from Issue"}
                  </p>
                  {quotation.jobCard && <p>Job Card: {quotation.jobCard.jobCardNumber}</p>}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-800 text-gray-800 font-bold">
                    <th className="py-2 px-1">Description</th>
                    <th className="py-2 px-1">Type</th>
                    <th className="py-2 px-1 text-center">Qty / Hrs</th>
                    <th className="py-2 px-1 text-right">Unit Ex-GST</th>
                    <th className="py-2 px-1 text-right">Total Ex-GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotation.lines?.map((line: any) => (
                    <tr key={line.id}>
                      <td className="py-2.5 px-1 font-medium text-gray-900">
                        {line.description}
                      </td>
                      <td className="py-2.5 px-1 text-gray-500">{line.lineType}</td>
                      <td className="py-2.5 px-1 text-center font-mono">{line.qty}</td>
                      <td className="py-2.5 px-1 text-right font-mono text-gray-700">
                        {formatAUD(line.unitPriceExGst)}
                      </td>
                      <td className="py-2.5 px-1 text-right font-mono font-semibold text-gray-900">
                        {formatAUD(line.lineTotalExGst)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="pt-4 border-t-2 border-gray-800 flex justify-end">
              <div className="w-72 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal (Ex-GST):</span>
                  <span className="font-semibold">{formatAUD(quotation.subtotalExGst)}</span>
                </div>
                {Boolean(quotation.discountExGst && quotation.discountExGst > 0) && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Discount (Ex-GST):</span>
                    <span>-{formatAUD(quotation.discountExGst)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Australian GST (10%):</span>
                  <span>{formatAUD(quotation.gstAmount)}</span>
                </div>
                <div className="pt-2 border-t border-gray-300 flex justify-between text-sm font-bold text-[#1B2A4A]">
                  <span>Total Estimated (Inc-GST):</span>
                  <span className="text-emerald-700 font-black">
                    {formatAUD(quotation.totalAmount || quotation.totalIncGst || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Notes / Recommendations / Scope of Work */}
            {quotation.notes && (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-gray-800 space-y-1">
                <p className="font-bold text-[#1B2A4A] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8920D]" />
                  Quotation Notes & Scope of Work:
                </p>
                <p className="whitespace-pre-wrap break-words text-gray-700 leading-relaxed font-sans text-xs">
                  {quotation.notes}
                </p>
              </div>
            )}

            {/* Australian Quotation Terms & EFT Details */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1 font-mono text-[11px]">
              <p className="font-bold text-gray-800 uppercase text-[10px]">
                Quotation Terms & Conditions:
              </p>
              <p>1. This formal quotation is valid for 30 days from the date of issue.</p>
              <p>2. Prices include standard parts and specified workshop labour (all prices in AUD).</p>
              <p>3. Additional repairs discovered during dismantling will require customer authorisation prior to proceeding.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Status Controls & Linked Job Summary (Hidden on Print) */}
        <div className="no-print space-y-4">
          {/* Quote Status Panel */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Quotation Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                <span className="font-semibold text-gray-700">Lifecycle Status</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    quotation.status === "Finalised"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {quotation.status}
                </span>
              </div>

              {quotation.status === "Finalised" ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Quotation Finalised & Invoiced
                  </p>
                  <p className="text-emerald-700">
                    This quotation was automatically finalised when the job card was marked Completed and the final tax invoice was generated.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                  <p className="font-semibold">
                    This quotation is currently <strong>Pending</strong>. It will be automatically finalised once the job is completed in the workshop.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linked Job Card & Invoice Action Card */}
          {quotation.jobCard && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E8920D]" />
                Linked Workflow
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed">
                This quotation is linked to active Job Card{" "}
                <strong className="font-mono text-gray-900">
                  {quotation.jobCard.jobCardNumber}
                </strong>
                {quotation.jobCard.invoice ? " and has an active Tax Invoice." : "."}
              </p>

              <div className="space-y-2">
                <Link
                  href={`/jobs/${quotation.jobCard.id}`}
                  className="w-full py-2.5 bg-[#1B2A4A] hover:bg-[#243656] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all block text-center"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Go to Job Card ({quotation.jobCard.jobCardNumber})</span>
                </Link>

                {quotation.jobCard.invoice && (
                  <Link
                    href={`/invoices/${quotation.jobCard.invoice.id}`}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all block text-center"
                  >
                    <span>View Tax Invoice ({quotation.jobCard.invoice.invoiceNumber}) →</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1-Step Safety Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Quotation"
        itemName={quotation.quoteNumber}
        itemType="Quotation"
        warningMessage="Deleting this quotation will remove the formal estimate document."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteQuotation}
      />
    </div>
  )
}
