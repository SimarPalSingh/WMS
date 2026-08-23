"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
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
  Building2,
  Plus,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet,
  Upload,
  X,
  Trash2,
} from "lucide-react"
import { formatAUD, formatDateAU } from "@/lib/utils"
import * as XLSX from "xlsx"

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<"customer" | "supplier">("customer")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInvoiceToDelete, setSelectedInvoiceToDelete] = useState<any>(null)

  // Customer Invoices State
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([])
  const [custLoading, setCustLoading] = useState(true)
  const [custSearch, setCustSearch] = useState("")
  const [custStatusFilter, setCustStatusFilter] = useState("All")
  const [clientsList, setClientsList] = useState<any[]>([])
  const [vehiclesList, setVehiclesList] = useState<any[]>([])

  // New Direct Customer Invoice Modal
  const [showCustInvoiceModal, setShowCustInvoiceModal] = useState(false)
  const [isNewCustMode, setIsNewCustMode] = useState(false)
  const [isNewVehicleMode, setIsNewVehicleMode] = useState(false)

  const [newCustData, setNewCustData] = useState({
    clientType: "Individual",
    firstName: "",
    lastName: "",
    businessName: "",
    mobilePhone: "",
    email: "",
    address: "",
    suburb: "Kingswood",
    state: "NSW",
    postcode: "2747"
  })

  const [newVehicleData, setNewVehicleData] = useState({
    registration: "",
    make: "Toyota",
    model: "Hilux",
    year: "2021",
    bodyType: "Sedan",
    fuelType: "Petrol",
    vin: "",
    engineNumber: "",
    engineCapacity: ""
  })

  const [custForm, setCustForm] = useState({
    clientId: "",
    vehicleId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isGstFree: false,
    discountExGst: 0,
    paymentStatus: "Unpaid",
    notes: "",
    futureNotes: "",
    lines: [
      { lineType: "Labour", description: "General Mechanical Labour & Inspection", qty: 1, unitPriceExGst: 95.0 },
    ]
  })

  // Supplier Invoices State
  const [supplierInvoices, setSupplierInvoices] = useState<any[]>([])
  const [suppLoading, setSuppLoading] = useState(true)
  const [suppSearch, setSuppSearch] = useState("")
  const [suppStatusFilter, setSuppStatusFilter] = useState("All")
  const [suppliersList, setSuppliersList] = useState<any[]>([])

  // New Supplier Invoice Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [isNewSupplierMode, setIsNewSupplierMode] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState("")
  const [isGstInclusive, setIsGstInclusive] = useState(true)

  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    abn: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    accountNo: ""
  })

  const [suppForm, setSuppForm] = useState({
    supplierInvNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    totalAmount: "",
    paymentStatus: "Paid",
    notes: ""
  })

  // Selected Supplier Static Details
  const selectedSupplier = suppliersList.find((s) => s.id === selectedSupplierId)

  // Calculations for Add Supplier Invoice
  const rawAmount = parseFloat(suppForm.totalAmount || "0")
  let calcSubtotalExGst = 0
  let calcGstAmount = 0
  let calcTotalIncGst = 0

  if (isGstInclusive) {
    calcSubtotalExGst = Math.round((rawAmount / 1.10) * 100) / 100
    calcGstAmount = Math.round((rawAmount - calcSubtotalExGst) * 100) / 100
    calcTotalIncGst = rawAmount
  } else {
    calcSubtotalExGst = rawAmount
    calcGstAmount = Math.round((rawAmount * 0.10) * 100) / 100
    calcTotalIncGst = Math.round((calcSubtotalExGst + calcGstAmount) * 100) / 100
  }

  // File Ref for Supplier Excel Import
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCustomerInvoices = () => {
    setCustLoading(true)
    fetch(`/api/invoices?status=${custStatusFilter}&search=${encodeURIComponent(custSearch)}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomerInvoices(data.invoices || [])
        setCustLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setCustLoading(false)
      })
  }

  const fetchSupplierInvoices = () => {
    setSuppLoading(true)
    fetch(`/api/invoices/suppliers?status=${suppStatusFilter}&search=${encodeURIComponent(suppSearch)}`)
      .then((res) => res.json())
      .then((data) => {
        setSupplierInvoices(data.invoices || [])
        setSuppLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setSuppLoading(false)
      })
  }

  const fetchSuppliers = () => {
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((data) => {
        setSuppliersList(data.suppliers || [])
        if (data.suppliers?.length > 0 && !selectedSupplierId) {
          setSelectedSupplierId(data.suppliers[0].id)
        }
      })
      .catch((err) => console.error(err))
  }

  const fetchClientsAndVehicles = () => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((d) => {
        setClientsList(d.clients || [])
        if (d.clients?.length > 0 && !custForm.clientId) {
          setCustForm((prev) => ({ ...prev, clientId: d.clients[0].id }))
        }
      })
      .catch((err) => console.error(err))

    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((d) => {
        setVehiclesList(d.vehicles || [])
        if (d.vehicles?.length > 0 && !custForm.vehicleId) {
          setCustForm((prev) => ({ ...prev, vehicleId: d.vehicles[0].id }))
        }
      })
      .catch((err) => console.error(err))
  }

  const handleSelectCustInvoiceClient = (clientId: string) => {
    setCustForm((prev) => {
      const updated = { ...prev, clientId }
      if (clientId) {
        const clientObj = clientsList.find((c) => c.id === clientId)
        if (clientObj?.clientVehicles?.length && clientObj.clientVehicles.length > 0) {
          const firstVehicle = clientObj.clientVehicles[0].vehicle
          if (firstVehicle) {
            updated.vehicleId = firstVehicle.id
          }
        } else {
          updated.vehicleId = ""
        }
      }
      return updated
    })
  }

  const handleSelectCustInvoiceVehicle = (vehicleId: string) => {
    setCustForm((prev) => {
      const updated = { ...prev, vehicleId }
      if (vehicleId) {
        const vehicleObj = vehiclesList.find((v) => v.id === vehicleId)
        const primaryOwner = vehicleObj?.clientVehicles?.[0]?.client
        if (primaryOwner) {
          updated.clientId = primaryOwner.id
        }
      }
      return updated
    })
  }

  useEffect(() => {
    fetchCustomerInvoices()
    fetchSuppliers()
    fetchClientsAndVehicles()
  }, [custStatusFilter])

  useEffect(() => {
    if (activeTab === "supplier") {
      fetchSupplierInvoices()
    }
  }, [activeTab, suppStatusFilter])

  const handleSaveSupplierInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isNewSupplierMode && !selectedSupplierId) {
      alert("Please select a supplier.")
      return
    }
    if (isNewSupplierMode && !newSupplierData.name) {
      alert("Please enter the supplier name.")
      return
    }
    if (!suppForm.supplierInvNumber || !suppForm.totalAmount) {
      alert("Please fill in all required invoice fields.")
      return
    }

    try {
      const res = await fetch("/api/invoices/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: isNewSupplierMode ? null : selectedSupplierId,
          isNewSupplier: isNewSupplierMode,
          newSupplierData: isNewSupplierMode ? newSupplierData : null,
          supplierInvNumber: suppForm.supplierInvNumber,
          invoiceDate: suppForm.invoiceDate,
          dueDate: suppForm.dueDate || null,
          isGstInclusive,
          totalAmount: suppForm.totalAmount,
          paymentStatus: suppForm.paymentStatus,
          notes: suppForm.notes
        })
      })

      if (res.ok) {
        setShowSupplierModal(false)
        setIsNewSupplierMode(false)
        setNewSupplierData({
          name: "",
          abn: "",
          contactName: "",
          phone: "",
          email: "",
          address: "",
          accountNo: ""
        })
        setSuppForm({
          supplierInvNumber: "",
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          totalAmount: "",
          paymentStatus: "Paid",
          notes: ""
        })
        fetchSupplierInvoices()
        fetchSuppliers()
      } else {
        const errJson = await res.json()
        alert(errJson.error || "Failed to create supplier invoice")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveCustomerInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isNewCustMode && !custForm.clientId) {
      alert("Please select a Client.")
      return
    }
    if (isNewCustMode && !newCustData.firstName && !newCustData.businessName && !newCustData.mobilePhone) {
      alert("Please enter customer name and phone number.")
      return
    }
    if (!isNewVehicleMode && !custForm.vehicleId) {
      alert("Please select a Vehicle.")
      return
    }
    if (isNewVehicleMode && !newVehicleData.registration) {
      alert("Please enter the vehicle registration plate.")
      return
    }

    try {
      const payload = {
        ...custForm,
        clientId: isNewCustMode ? null : custForm.clientId,
        isNewClient: isNewCustMode,
        newClientData: isNewCustMode ? newCustData : null,
        vehicleId: isNewVehicleMode ? null : custForm.vehicleId,
        isNewVehicle: isNewVehicleMode,
        newVehicleData: isNewVehicleMode ? newVehicleData : null
      }

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowCustInvoiceModal(false)
        setIsNewCustMode(false)
        setIsNewVehicleMode(false)
        setNewCustData({
          clientType: "Individual",
          firstName: "",
          lastName: "",
          businessName: "",
          mobilePhone: "",
          email: "",
          address: "",
          suburb: "Kingswood",
          state: "NSW",
          postcode: "2747"
        })
        setNewVehicleData({
          registration: "",
          make: "Toyota",
          model: "Hilux",
          year: "2021",
          bodyType: "Sedan",
          fuelType: "Petrol",
          vin: "",
          engineNumber: "",
          engineCapacity: ""
        })
        setCustForm({
          clientId: clientsList[0]?.id || "",
          vehicleId: vehiclesList[0]?.id || "",
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          isGstFree: false,
          discountExGst: 0,
          paymentStatus: "Unpaid",
          notes: "",
          futureNotes: "",
          lines: [
            { lineType: "Labour", description: "General Mechanical Labour & Inspection", qty: 1, unitPriceExGst: 95.0 },
          ]
        })
        fetchCustomerInvoices()
        fetchClientsAndVehicles()
      } else {
        const errJson = await res.json()
        alert(errJson.error || "Failed to create customer invoice")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddCustLine = (type: "Labour" | "Part" | "Subcontract" | "Sundry") => {
    setCustForm({
      ...custForm,
      lines: [
        ...custForm.lines,
        { lineType: type, description: type === "Labour" ? "Workshop Labour" : "Service Parts & Supplies", qty: 1, unitPriceExGst: type === "Labour" ? 95 : 50 }
      ]
    })
  }

  const handleCustLineChange = (index: number, field: string, val: any) => {
    const updated = [...custForm.lines]
    ;(updated[index] as any)[field] = val
    setCustForm({ ...custForm, lines: updated })
  }

  const handleRemoveCustLine = (index: number) => {
    setCustForm({
      ...custForm,
      lines: custForm.lines.filter((_, i) => i !== index)
    })
  }

  // Calculations for Add Direct Customer Invoice
  const custLinesTotalExGst = custForm.lines.reduce((acc, l) => acc + ((parseFloat(String(l.qty)) || 0) * (parseFloat(String(l.unitPriceExGst)) || 0)), 0)
  const custDiscount = parseFloat(String(custForm.discountExGst)) || 0
  const custNetExGst = Math.max(0, custLinesTotalExGst - custDiscount)
  const custGst = custForm.isGstFree ? 0 : Math.round(custNetExGst * 0.10 * 100) / 100
  const custTotalPayable = custForm.isGstFree ? custNetExGst : Math.round((custNetExGst + custGst) * 100) / 100

  // Metrics
  const totalCustomerInvoiced = customerInvoices.reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)
  const totalCustomerUnpaid = customerInvoices
    .filter((inv) => inv.paymentStatus === "Unpaid" || inv.paymentStatus === "Overdue")
    .reduce((acc, inv) => acc + (inv.finalAmount || 0), 0)

  const totalSupplierExpenses = supplierInvoices.reduce((acc, inv) => acc + (inv.totalIncGst || 0), 0)
  const totalSupplierGstPaid = supplierInvoices.reduce((acc, inv) => acc + (inv.gstAmount || 0), 0)

  const handleDeleteInvoiceInList = async () => {
    if (!selectedInvoiceToDelete) return
    try {
      const res = await fetch(`/api/invoices/${selectedInvoiceToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setShowDeleteModal(false)
        setSelectedInvoiceToDelete(null)
        fetchCustomerInvoices()
      } else {
        const json = await res.json()
        alert(json.error || "Failed to delete invoice")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred while deleting invoice.")
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#E8920D]" />
            Invoices & Billing Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Customer tax invoicing, supplier outgoing expenses, and ATO-compliant Australian GST tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "customer" ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCustInvoiceModal(true)}
                className="px-3.5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Direct Tax Invoice</span>
              </button>
              <div className="text-right pl-2 border-l border-gray-200">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Outstanding Unpaid
                </span>
                <span className="font-mono font-bold text-sm text-red-600">
                  {formatAUD(totalCustomerUnpaid)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSupplierModal(true)}
                className="px-3.5 py-2 bg-[#1B2A4A] hover:bg-[#243656] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#E8920D]" />
                Record Supplier Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("customer")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "customer"
              ? "border-[#E8920D] text-[#E8920D]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          Customer Invoices ({customerInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab("supplier")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "supplier"
              ? "border-[#E8920D] text-[#E8920D]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Supplier Invoices & Expenses ({supplierInvoices.length})
        </button>
      </div>

      {/* TAB 1: CUSTOMER INVOICES */}
      {activeTab === "customer" && (
        <div className="space-y-4">
          {/* Filter Tabs & Search */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Invoice # (INV-0088), Rego, or Client..."
                value={custSearch}
                onChange={(e) => {
                  setCustSearch(e.target.value)
                  fetchCustomerInvoices()
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white font-mono placeholder:font-sans transition-all"
              />
            </div>

            {/* Status Tabs without 'Partial' and 'Overdue' */}
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {["All", "Unpaid", "Paid"].map((st) => (
                <button
                  key={st}
                  onClick={() => setCustStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    custStatusFilter === st
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
            {custLoading ? (
              <div className="p-12 text-center text-xs text-gray-400 font-mono">
                Loading customer tax invoices...
              </div>
            ) : customerInvoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                No customer invoices found matching your criteria.
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
                      <th className="py-3 px-4 text-right">GST (10%)</th>
                      <th className="py-3 px-4 text-right">Total Payable</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerInvoices.map((inv) => {
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
                                  : inv.paymentStatus === "Overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-700">
                            {formatAUD(inv.subtotalExGst)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-500">
                            {inv.isGstFree ? "$0.00" : formatAUD(inv.gstAmount)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                            {formatAUD(inv.finalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/invoices/${inv.id}`}
                                className="inline-flex items-center text-[#E8920D] font-semibold hover:underline text-xs"
                              >
                                <span>View Tax Invoice</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedInvoiceToDelete(inv)
                                  setShowDeleteModal(true)
                                }}
                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      )}

      {/* TAB 2: SUPPLIER INVOICES */}
      {activeTab === "supplier" && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Supplier Expenses</p>
              <p className="text-2xl font-bold font-mono text-[#1B2A4A] mt-1">{formatAUD(totalSupplierExpenses)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Total outgoings inc. GST</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Supplier GST Paid</p>
              <p className="text-2xl font-bold font-mono text-blue-700 mt-1">{formatAUD(totalSupplierGstPaid)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Claimable on Australian BAS Box 1B</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Recorded Invoices</p>
              <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{supplierInvoices.length}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Across {suppliersList.length} connected suppliers</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Supplier Inv # or Supplier Name..."
                value={suppSearch}
                onChange={(e) => {
                  setSuppSearch(e.target.value)
                  fetchSupplierInvoices()
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F5F7] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8920D] focus:bg-white font-mono placeholder:font-sans transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {["All", "Paid", "Unpaid"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSuppStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    suppStatusFilter === st
                      ? "bg-[#1B2A4A] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Invoices Table */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            {suppLoading ? (
              <div className="p-12 text-center text-xs text-gray-400 font-mono">
                Loading supplier invoices...
              </div>
            ) : supplierInvoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                No supplier invoices recorded yet. Click "Record Supplier Invoice" above to add one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#1B2A4A] text-white font-medium">
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Supplier Inv #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">ABN</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Subtotal (Ex-GST)</th>
                      <th className="py-3 px-4 text-right">GST Paid (10%)</th>
                      <th className="py-3 px-4 text-right">Total Paid (Inc-GST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {supplierInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {inv.supplier?.name}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {inv.supplierInvNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {formatDateAU(inv.invoiceDate)}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                          {inv.supplier?.abn || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inv.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">
                          {formatAUD(inv.subtotalExGst)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-blue-600 font-medium">
                          {formatAUD(inv.gstAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                          {formatAUD(inv.totalIncGst)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Supplier Invoice Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#E8920D]" />
                Record Supplier Outgoing Invoice
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierInvoice} className="space-y-4 text-xs">
              {/* Supplier Selection / Creation */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">Supplier *</label>
                  <button
                    type="button"
                    onClick={() => setIsNewSupplierMode(!isNewSupplierMode)}
                    className="text-[11px] text-[#E8920D] hover:underline font-semibold"
                  >
                    {isNewSupplierMode ? "← Select Existing Supplier" : "+ Register New Supplier Here"}
                  </button>
                </div>

                {isNewSupplierMode ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Supplier / Merchant Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Snap-on Tools NSW"
                          value={newSupplierData.name}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Supplier ABN</label>
                        <input
                          type="text"
                          placeholder="e.g. 51 824 753 556"
                          value={newSupplierData.abn}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, abn: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Contact Person / Sales Rep</label>
                        <input
                          type="text"
                          placeholder="e.g. Dave Mitchell"
                          value={newSupplierData.contactName}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, contactName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Phone / Trade Desk</label>
                        <input
                          type="text"
                          placeholder="02 9821 4455"
                          value={newSupplierData.phone}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, phone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Accounts Email</label>
                        <input
                          type="email"
                          placeholder="accounts@supplier.com.au"
                          value={newSupplierData.email}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Trade Account #</label>
                        <input
                          type="text"
                          placeholder="e.g. DHL-0092"
                          value={newSupplierData.accountNo}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, accountNo: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      required
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg font-medium text-gray-900 bg-white"
                    >
                      <option value="">-- Select Existing Supplier --</option>
                      {suppliersList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.abn ? `ABN: ${s.abn}` : "No ABN"})
                        </option>
                      ))}
                    </select>

                    {/* Pre-filled Static Details Card */}
                    {selectedSupplier && (
                      <div className="p-2.5 bg-white border border-gray-200 rounded text-[11px] space-y-1 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Supplier ABN:</span>
                          <span className="font-mono font-bold text-gray-800">{selectedSupplier.abn || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone / Email:</span>
                          <span className="font-mono text-gray-700">{selectedSupplier.phone || "—"} | {selectedSupplier.email || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Address:</span>
                          <span className="text-gray-700">{selectedSupplier.address || "—"}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Invoice Specifics */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Supplier Invoice # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REP-99824"
                    value={suppForm.supplierInvNumber}
                    onChange={(e) => setSuppForm({ ...suppForm, supplierInvNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={suppForm.invoiceDate}
                    onChange={(e) => setSuppForm({ ...suppForm, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Amount & Reverse GST Toggle */}
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-800 font-bold">Total Invoice Amount ($ AUD) *</label>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                      <input
                        type="radio"
                        name="gstToggle"
                        checked={isGstInclusive}
                        onChange={() => setIsGstInclusive(true)}
                        className="text-[#E8920D]"
                      />
                      GST Inclusive
                    </label>
                    <label className="text-[11px] font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                      <input
                        type="radio"
                        name="gstToggle"
                        checked={!isGstInclusive}
                        onChange={() => setIsGstInclusive(false)}
                        className="text-[#E8920D]"
                      />
                      GST Exclusive
                    </label>
                  </div>
                </div>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={suppForm.totalAmount}
                  onChange={(e) => setSuppForm({ ...suppForm, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-lg text-[#1B2A4A]"
                />

                {/* Live Reverse GST Breakdown */}
                {rawAmount > 0 && (
                  <div className="pt-2 border-t border-amber-200/60 grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <span className="text-[10px] text-gray-500 block">Ex-GST Subtotal</span>
                      <span className="font-bold text-gray-800">{formatAUD(calcSubtotalExGst)}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <span className="text-[10px] text-gray-500 block">10% GST Amount</span>
                      <span className="font-bold text-blue-700">{formatAUD(calcGstAmount)}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <span className="text-[10px] text-gray-500 block">Total Inc-GST</span>
                      <span className="font-bold text-[#1B2A4A]">{formatAUD(calcTotalIncGst)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={suppForm.paymentStatus}
                    onChange={(e) => setSuppForm({ ...suppForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid / On Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Optional Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Workshop brake pad restock"
                    value={suppForm.notes}
                    onChange={(e) => setSuppForm({ ...suppForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Supplier Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Customer Tax Invoice Modal */}
      {showCustInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E8920D]" />
                Create Direct Customer Tax Invoice
              </h3>
              <button
                onClick={() => setShowCustInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerInvoice} className="space-y-4 text-xs">
              {/* Customer / Client Selection / Creation */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">1. Customer / Client *</label>
                  <button
                    type="button"
                    onClick={() => setIsNewCustMode(!isNewCustMode)}
                    className="text-[11px] text-[#E8920D] hover:underline font-semibold"
                  >
                    {isNewCustMode ? "← Select Existing Client" : "+ Register New Client Here"}
                  </button>
                </div>

                {isNewCustMode ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pb-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="invClientType"
                          value="Individual"
                          checked={newCustData.clientType === "Individual"}
                          onChange={(e) => setNewCustData({ ...newCustData, clientType: e.target.value })}
                        />
                        <span>Individual</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="invClientType"
                          value="Business"
                          checked={newCustData.clientType === "Business"}
                          onChange={(e) => setNewCustData({ ...newCustData, clientType: e.target.value })}
                        />
                        <span>Company / Fleet</span>
                      </label>
                    </div>

                    {newCustData.clientType === "Business" ? (
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Business / Company Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Logistics Pty Ltd"
                          value={newCustData.businessName}
                          onChange={(e) => setNewCustData({ ...newCustData, businessName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-medium"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-600 text-[10px] font-semibold">First Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="John"
                            value={newCustData.firstName}
                            onChange={(e) => setNewCustData({ ...newCustData, firstName: e.target.value })}
                            className="w-full px-2.5 py-1.5 border rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[10px] font-semibold">Last Name</label>
                          <input
                            type="text"
                            placeholder="Smith"
                            value={newCustData.lastName}
                            onChange={(e) => setNewCustData({ ...newCustData, lastName: e.target.value })}
                            className="w-full px-2.5 py-1.5 border rounded bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Mobile Phone *</label>
                        <input
                          type="text"
                          required
                          placeholder="0412 345 678"
                          value={newCustData.mobilePhone}
                          onChange={(e) => setNewCustData({ ...newCustData, mobilePhone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Email</label>
                        <input
                          type="email"
                          placeholder="client@example.com"
                          value={newCustData.email}
                          onChange={(e) => setNewCustData({ ...newCustData, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    required
                    value={custForm.clientId}
                    onChange={(e) => handleSelectCustInvoiceClient(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                  >
                    <option value="">-- Select Existing Client --</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clientType === "Business" ? c.businessName : `${c.firstName} ${c.lastName}`} ({c.mobilePhone || "No Phone"}) {c.clientVehicles?.length ? `• ${c.clientVehicles.length} vehicle(s)` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vehicle Selection / Creation */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">2. Vehicle / Rego *</label>
                  <button
                    type="button"
                    onClick={() => setIsNewVehicleMode(!isNewVehicleMode)}
                    className="text-[11px] text-[#E8920D] hover:underline font-semibold"
                  >
                    {isNewVehicleMode ? "← Select Existing Vehicle" : "+ Register New Vehicle Here"}
                  </button>
                </div>

                {isNewVehicleMode ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Rego Plate *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DL88AA"
                          value={newVehicleData.registration}
                          onChange={(e) => setNewVehicleData({ ...newVehicleData, registration: e.target.value.toUpperCase() })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Make & Model *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Toyota Hilux"
                          value={newVehicleData.model}
                          onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Body Type</label>
                        <select
                          value={newVehicleData.bodyType}
                          onChange={(e) => setNewVehicleData({ ...newVehicleData, bodyType: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        >
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="Ute">Ute</option>
                          <option value="Van">Van</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">VIN (Optional)</label>
                        <input
                          type="text"
                          placeholder="17-character VIN"
                          value={newVehicleData.vin}
                          onChange={(e) => setNewVehicleData({ ...newVehicleData, vin: e.target.value.toUpperCase() })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Engine Number (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 1GD-FTV-9921"
                          value={newVehicleData.engineNumber}
                          onChange={(e) => setNewVehicleData({ ...newVehicleData, engineNumber: e.target.value.toUpperCase() })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(() => {
                      const selectedClient = clientsList.find((c) => c.id === custForm.clientId)
                      const clientVehiclesList = selectedClient?.clientVehicles?.map((cv: any) => cv.vehicle).filter(Boolean) || []
                      const hasClientVehicles = clientVehiclesList.length > 0

                      return (
                        <>
                          <select
                            required
                            value={custForm.vehicleId}
                            onChange={(e) => handleSelectCustInvoiceVehicle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-white font-mono font-bold"
                          >
                            <option value="">
                              {hasClientVehicles
                                ? `-- Select Vehicle for ${selectedClient?.firstName || selectedClient?.businessName} (${clientVehiclesList.length} registered) --`
                                : "-- Select Existing Vehicle --"}
                            </option>

                            {/* Client's vehicles */}
                            {hasClientVehicles ? (
                              <optgroup label={`Vehicles registered to ${selectedClient?.businessName || `${selectedClient?.firstName || ""} ${selectedClient?.lastName || ""}`.trim()}`}>
                                {clientVehiclesList.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.registration} ({v.year} {v.make} {v.model})
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}

                            {/* Other fleet vehicles */}
                            <optgroup label={hasClientVehicles ? "Other Fleet Vehicles" : "All Workshop Vehicles"}>
                              {vehiclesList
                                .filter((v) => !clientVehiclesList.some((cv: any) => cv.id === v.id))
                                .map((v) => {
                                  const owner = v.clientVehicles?.[0]?.client
                                  const ownerTag = owner ? ` [${owner.businessName || `${owner.firstName || ""} ${owner.lastName || ""}`.trim()}]` : ""
                                  return (
                                    <option key={v.id} value={v.id}>
                                      {v.registration} ({v.year} {v.make} {v.model}){ownerTag}
                                    </option>
                                  )
                                })}
                            </optgroup>
                          </select>

                          {custForm.clientId && hasClientVehicles && (
                            <p className="text-[10px] text-gray-500 font-mono">
                              Showing {clientVehiclesList.length} vehicle(s) linked to this client (first vehicle selected automatically).
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Dates & Payment Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Date Issued *</label>
                  <input
                    type="date"
                    required
                    value={custForm.invoiceDate}
                    onChange={(e) => setCustForm({ ...custForm, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={custForm.dueDate}
                    onChange={(e) => setCustForm({ ...custForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={custForm.paymentStatus}
                    onChange={(e) => setCustForm({ ...custForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  >
                    <option value="Unpaid">Unpaid / Awaiting Payment</option>
                    <option value="Paid">Paid in Full</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Line Items Section */}
              <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Invoice Line Items
                  </span>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => handleAddCustLine("Labour")}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-semibold"
                    >
                      + Add Labour
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustLine("Part")}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-semibold"
                    >
                      + Add Part
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {custForm.lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded border">
                      <div className="col-span-2">
                        <select
                          value={line.lineType}
                          onChange={(e) => handleCustLineChange(idx, "lineType", e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-[11px]"
                        >
                          <option value="Labour">Labour</option>
                          <option value="Part">Part</option>
                          <option value="Subcontract">Subcontract</option>
                          <option value="Sundry">Sundry</option>
                        </select>
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => handleCustLineChange(idx, "description", e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="Qty"
                          value={line.qty}
                          onChange={(e) => handleCustLineChange(idx, "qty", e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-center font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="Unit $"
                          value={line.unitPriceExGst}
                          onChange={(e) => handleCustLineChange(idx, "unitPriceExGst", e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded font-mono font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          disabled={custForm.lines.length <= 1}
                          onClick={() => handleRemoveCustLine(idx)}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-30 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown & Discounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Invoice Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Payment due in 14 days by EFT or Credit Card."
                      value={custForm.notes}
                      onChange={(e) => setCustForm({ ...custForm, notes: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Future Notes / Recommendations</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Front tyres recommended for replacement in 5,000 km."
                      value={custForm.futureNotes}
                      onChange={(e) => setCustForm({ ...custForm, futureNotes: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Items Subtotal (Ex-GST)</span>
                    <span className="font-mono font-bold text-gray-800">{formatAUD(custLinesTotalExGst)}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <label className="text-gray-700 font-semibold">Dollar Discount ($ Ex-GST)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={custForm.discountExGst}
                      onChange={(e) => setCustForm({ ...custForm, discountExGst: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-2 py-1 bg-white border border-amber-300 rounded font-mono font-bold text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-semibold">
                      <input
                        type="checkbox"
                        checked={custForm.isGstFree}
                        onChange={(e) => setCustForm({ ...custForm, isGstFree: e.target.checked })}
                        className="rounded text-[#E8920D]"
                      />
                      <span>GST-Free (0% GST)</span>
                    </label>
                    <span className="font-mono text-gray-600">
                      {custForm.isGstFree ? "$0.00" : formatAUD(custGst)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex justify-between text-sm font-bold text-[#1B2A4A]">
                    <span>Total Payable</span>
                    <span className="font-mono text-emerald-700">{formatAUD(custTotalPayable)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCustInvoiceModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2-Step Safety Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Tax Invoice"
        itemName={selectedInvoiceToDelete ? selectedInvoiceToDelete.invoiceNumber : "Invoice"}
        itemType="Invoice"
        warningMessage="Deleting this invoice will permanently delete payment receipt logs and decouple it from financial and job reports."
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedInvoiceToDelete(null)
        }}
        onConfirm={handleDeleteInvoiceInList}
      />
    </div>
  )
}

