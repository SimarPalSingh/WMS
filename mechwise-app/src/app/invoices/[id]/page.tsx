"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import {
  FileText,
  Car,
  User,
  ArrowLeft,
  DollarSign,
  Printer,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Invoice discount & GST configuration
  const [discountExGst, setDiscountExGst] = useState<string | number>(0)
  const [isGstFree, setIsGstFree] = useState(false)
  const [futureNotes, setFutureNotes] = useState("")

  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("EFTPOS")
  const [paymentRef, setPaymentRef] = useState("")

  const fetchInvoice = () => {
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoice) {
          setInvoice(data.invoice)
          setDiscountExGst(data.invoice.discountExGst || 0)
          setIsGstFree(Boolean(data.invoice.isGstFree))
          setFutureNotes(data.invoice.futureNotes || "")
          const remaining =
            data.invoice.finalAmount -
            data.invoice.payments.reduce((acc: number, p: any) => acc + p.amount, 0)
          setPaymentAmount(remaining > 0 ? remaining.toFixed(2) : "0.00")
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const handleUpdateInvoiceSettings = async (newDiscount?: number | string, newGstFree?: boolean, newNotes?: string) => {
    setUpdatingSettings(true)
    try {
      const disc = newDiscount !== undefined ? parseFloat(String(newDiscount)) || 0 : (parseFloat(String(discountExGst)) || 0)
      const gstF = newGstFree !== undefined ? newGstFree : isGstFree
      const fNotes = newNotes !== undefined ? newNotes : futureNotes

      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountExGst: disc,
          isGstFree: gstF,
          futureNotes: fNotes
        })
      })

      if (res.ok) {
        const json = await res.json()
        if (json.invoice) {
          setInvoice(json.invoice)
          setDiscountExGst(json.invoice.discountExGst || 0)
          setIsGstFree(Boolean(json.invoice.isGstFree))
          setFutureNotes(json.invoice.futureNotes || "")
          const remaining =
            json.invoice.finalAmount -
            json.invoice.payments.reduce((acc: number, p: any) => acc + p.amount, 0)
          setPaymentAmount(remaining > 0 ? remaining.toFixed(2) : "0.00")
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaying(true)
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paymentMethod,
          paymentRef,
        }),
      })
      if (res.ok) {
        fetchInvoice()
        setPaymentRef("")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPaying(false)
    }
  }

  const handleDeleteInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/invoices")
      } else {
        const json = await res.json()
        alert(json.error || "Failed to delete invoice")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred while deleting invoice.")
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 font-mono">
        Loading Tax Invoice document...
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Invoice not found.
      </div>
    )
  }

  const totalPaid = invoice.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0
  const balanceDue = Math.max(0, invoice.finalAmount - totalPaid)
  const isBusiness = invoice.client?.clientType === "Business"

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation & Actions (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Invoices</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Invoice</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice PDF</span>
          </button>
        </div>
      </div>

      {/* 2-Column: Printable Tax Invoice on Left + Payment Panel on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Printable Official Australian Tax Invoice */}
        <div className="printable-document md:col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden print:border-none print:shadow-none">
          {/* Navy Tax Invoice Header */}
          <div className="bg-[#1B2A4A] text-white p-6 flex items-center justify-between border-b border-[#243656]">
            <div>
              <h1 className="text-xl font-black tracking-wider text-white">
                {invoice.workshop?.businessName || "DHALLA AUTOMOTIVE PTY LTD"}
              </h1>
              <p className="text-xs text-amber-400 font-mono mt-0.5">
                ABN: {invoice.workshop?.abn || "95 611 566 888"} • MVRL:{" "}
                {invoice.workshop?.mvrlNumber || "MVRL58941"}
              </p>
              <p className="text-[11px] text-gray-300 mt-1">
                {invoice.workshop?.address || "70A Cox Avenue, Kingswood NSW 2747"} •{" "}
                {invoice.workshop?.phone || "(02) 4732 1199"}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-white/10 rounded font-mono font-bold text-base tracking-widest border border-white/20">
                {invoice.isGstFree ? "INVOICE (GST-FREE)" : "TAX INVOICE"}
              </span>
              <p className="font-mono font-bold text-amber-400 text-sm mt-1">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Bill To & Vehicle Grid */}
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-gray-100 pb-5">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  {invoice.isGstFree ? "Invoice Issued To:" : "Tax Invoice Issued To:"}
                </span>
                <p className="font-bold text-gray-900 text-sm">
                  {isBusiness
                    ? invoice.client?.businessName
                    : `${invoice.client?.firstName} ${invoice.client?.lastName}`}
                </p>
                {isBusiness && invoice.client?.abn && (
                  <p className="font-mono text-gray-500">ABN: {invoice.client.abn}</p>
                )}
                <p className="text-gray-600 mt-0.5">{invoice.client?.address}</p>
                <p className="text-gray-600">
                  {invoice.client?.suburb} {invoice.client?.state} {invoice.client?.postcode}
                </p>
                <p className="font-mono text-gray-800 mt-1">{invoice.client?.mobilePhone}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Vehicle Serviced:
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-xs bg-[#1B2A4A] text-amber-400 px-2 py-0.5 rounded border">
                    {invoice.vehicle?.registration}
                  </span>
                  <span className="font-bold text-gray-900">
                    {invoice.vehicle?.year} {invoice.vehicle?.make} {invoice.vehicle?.model}
                  </span>
                </div>
                <div className="space-y-0.5 text-gray-600 font-mono text-[11px]">
                  <p>Issue Date: {formatDateAU(invoice.invoiceDate)}</p>
                  <p>Due Date: {formatDateAU(invoice.dueDate)}</p>
                  {invoice.jobCard && <p>Job Card: {invoice.jobCard.jobCardNumber}</p>}
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
                  {invoice.lines?.map((line: any) => (
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
                  <span className="font-semibold">{formatAUD(invoice.subtotalExGst)}</span>
                </div>
                {Boolean(invoice.discountExGst && invoice.discountExGst > 0) && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Discount (Ex-GST):</span>
                    <span>-{formatAUD(invoice.discountExGst)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>
                    Australian GST {invoice.isGstFree ? "(0% GST-Free):" : "(10%):"}
                  </span>
                  <span>{formatAUD(invoice.gstAmount)}</span>
                </div>
                <div className="pt-2 border-t border-gray-300 flex justify-between text-sm font-bold text-[#1B2A4A]">
                  <span>Total Payable {invoice.isGstFree ? "(GST-Free):" : "(Inc-GST):"}</span>
                  <span className="text-emerald-700">{formatAUD(invoice.finalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Total Paid:</span>
                  <span>{formatAUD(totalPaid)}</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 flex justify-between font-bold text-sm">
                  <span>Balance Due:</span>
                  <span className={balanceDue > 0 ? "text-red-600" : "text-emerald-600"}>
                    {formatAUD(balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Future Notes / Recommendations Section for Customer */}
            {invoice.futureNotes && (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-gray-800 space-y-1">
                <p className="font-bold text-[#1B2A4A] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8920D]" />
                  Workshop Recommendations & Future Service Notes:
                </p>
                <p className="whitespace-pre-wrap break-words text-gray-700 leading-relaxed font-sans text-xs">
                  {invoice.futureNotes}
                </p>
              </div>
            )}

            {/* Australian Payment Info Footer */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1 font-mono">
              <p className="font-bold text-gray-800 uppercase text-[10px]">
                Electronic Funds Transfer (EFT) Payment Details:
              </p>
              <p>Bank: Commonwealth Bank of Australia</p>
              <p>Account Name: Dhalla Automotive Pty Ltd</p>
              <p>BSB: 062-589 • Account No: 1048 9201</p>
              <p>Reference: {invoice.invoiceNumber} / {invoice.vehicle?.registration}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Adjustments & Payment Collection Panel (Hidden on Print) */}
        <div className="no-print space-y-4">
          {/* Invoice Adjustments (Discounts & GST Configuration) */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#E8920D]" />
                Invoice Adjustments
              </h3>
              {updatingSettings && (
                <span className="text-[10px] text-amber-600 font-semibold animate-pulse">
                  Updating...
                </span>
              )}
            </div>

            {/* GST-Free or Standard Australian 10% GST Toggle */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-800">
                  Include GST (10%)
                </span>
                <input
                  type="checkbox"
                  checked={!isGstFree}
                  onChange={(e) => {
                    const newGstFree = !e.target.checked
                    setIsGstFree(newGstFree)
                    handleUpdateInvoiceSettings(undefined, newGstFree)
                  }}
                  className="w-4 h-4 text-[#E8920D] rounded cursor-pointer"
                />
              </label>
              <p className="text-[10px] text-gray-500 mt-1">
                {isGstFree
                  ? "Marked as Australian GST-Free (0% GST)"
                  : "Standard Australian 10% GST applied"}
              </p>
            </div>

            {/* Dollar Discount Ex-GST Field */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-800">
                  Dollar Discount ($ Ex-GST)
                </label>
                <span className="text-[10px] text-amber-800 font-semibold">Applied before GST</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-gray-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={discountExGst}
                    onChange={(e) => setDiscountExGst(e.target.value)}
                    onBlur={() => handleUpdateInvoiceSettings(discountExGst)}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-xs text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateInvoiceSettings(discountExGst)}
                  disabled={updatingSettings}
                  className="px-3 py-1.5 bg-[#1B2A4A] hover:bg-[#243656] text-white rounded text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Future Recommendations Editor */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                Future Recommendations for Customer
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Brake pads low (replace next service)"
                value={futureNotes}
                onChange={(e) => setFutureNotes(e.target.value)}
                onBlur={() => handleUpdateInvoiceSettings(undefined, undefined, futureNotes)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#E8920D]" />
              Record Customer Payment
            </h3>

            {balanceDue <= 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">Invoice Fully Paid</p>
                <p className="text-[11px] text-emerald-700 font-mono">
                  Total {formatAUD(totalPaid)} received
                </p>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Amount Received ($ AUD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="EFTPOS">EFTPOS / Terminal</option>
                    <option value="CreditCard">Credit Card (Visa/Mastercard)</option>
                    <option value="Cash">Cash</option>
                    <option value="PayID">PayID</option>
                    <option value="BankTransfer">Bank Transfer (EFT)</option>
                    <option value="BPay">BPay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EFTPOS Auth #84920"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {paying ? "Recording..." : "Record Payment"}
                </button>
              </form>
            )}
          </div>

          {/* Payment Receipts History */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider mb-3">
              Payment Receipts ({invoice.payments?.length || 0})
            </h3>

            {invoice.payments?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {invoice.payments?.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{p.paymentMethod}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {formatDateAU(p.paymentDate)} {p.paymentRef && `• ${p.paymentRef}`}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {formatAUD(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Step Safety Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Tax Invoice"
        itemName={invoice.invoiceNumber}
        itemType="Invoice"
        warningMessage="Deleting this invoice will permanently delete payment receipt logs and decouple it from financial and job reports."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteInvoice}
      />
    </div>
  )
}
