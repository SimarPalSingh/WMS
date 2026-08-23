"use client"

import { useEffect, useState, useRef } from "react"
import {
  Package,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Edit2,
  ArrowUpRight,
  TrendingDown,
  Building2,
  X
} from "lucide-react"
import * as XLSX from "xlsx"

export default function InventoryPage() {
  const [activeMainTab, setActiveMainTab] = useState<"parts" | "suppliers">("parts")
  const [parts, setParts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [suppSearch, setSuppSearch] = useState("")

  // Modals
  const [showPartModal, setShowPartModal] = useState(false)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [showSupplierEditModal, setShowSupplierEditModal] = useState(false)
  const [activePart, setActivePart] = useState<any>(null)
  const [activeSupplier, setActiveSupplier] = useState<any>(null)
  const [restockAmount, setRestockAmount] = useState("5")
  const [notification, setNotification] = useState<string | null>(null)

  // Category on-the-fly mode
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState("")

  // Part Form
  const [isNewSupplierMode, setIsNewSupplierMode] = useState(false)
  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    abn: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    accountNo: ""
  })

  const [partForm, setPartForm] = useState({
    partNumber: "",
    name: "",
    category: "Oils & Fluids",
    costPrice: "0.00",
    retailPrice: "0.00",
    availableStock: "10",
    maxStockQty: "50",
    minStockQty: "2",
    restockMinQty: "5",
    supplierId: ""
  })

  // Supplier Form for Edit/Create Supplier
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    abn: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    accountNo: ""
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadInventory = () => {
    let url = `/api/inventory?category=${encodeURIComponent(selectedCategory)}`
    if (search) url += `&search=${encodeURIComponent(search)}`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setParts(data.parts || [])
        setSuppliers(data.suppliers || [])
        setCategories(data.categories || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading inventory:", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadInventory()
  }, [selectedCategory, search])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3500)
  }

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = parts.map((p) => ({
      "Part Number": p.partNumber,
      "Item Name": p.name,
      "Category": p.category || "General",
      "Cost Price ($ ex-GST)": p.costPrice,
      "Retail Price ($ ex-GST)": p.retailPrice,
      "Available Stock": p.availableStock,
      "Minimum Stock Level": p.minStockQty,
      "Restock Min Quantity": p.restockMinQty,
      "Maximum Stock Level": p.maxStockQty,
      "Supplier": p.supplier ? p.supplier.name : "N/A"
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Parts")
    XLSX.writeFile(workbook, "Dhalla_Automotive_Inventory_Master.xlsx")
    showToast("Inventory exported to Excel successfully!")
  }

  // Import from Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data: any[] = XLSX.utils.sheet_to_json(ws)

        // Map imported rows to inventory fields
        const formattedItems = data.map((row) => ({
          partNumber: row["Part Number"] || row["partNumber"] || row["Part No"] || row["Code"],
          name: row["Item Name"] || row["name"] || row["Description"] || row["Part Name"],
          category: row["Category"] || row["category"] || "General",
          costPrice: parseFloat(row["Cost Price ($ ex-GST)"] || row["costPrice"] || row["Cost"] || 0),
          retailPrice: parseFloat(row["Retail Price ($ ex-GST)"] || row["retailPrice"] || row["Price"] || 0),
          availableStock: parseInt(row["Available Stock"] || row["availableStock"] || row["Qty"] || row["Stock"] || 0),
          minStockQty: parseInt(row["Minimum Stock Level"] || row["minStockQty"] || row["Min Stock"] || 2),
          restockMinQty: parseInt(row["Restock Min Quantity"] || row["restockMinQty"] || row["Restock Qty"] || 5),
          maxStockQty: parseInt(row["Maximum Stock Level"] || row["maxStockQty"] || row["Max Stock"] || 50),
        })).filter((item) => item.partNumber && item.name)

        if (formattedItems.length === 0) {
          alert("No valid part rows found in uploaded Excel file. Please ensure columns include Part Number and Item Name.")
          return
        }

        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedItems)
        })

        if (res.ok) {
          const json = await res.json()
          showToast(`Successfully imported/synced ${json.count} parts from Excel!`)
          loadInventory()
        }
      } catch (err) {
        console.error("Error processing Excel file:", err)
        alert("Failed to parse Excel file. Please check format.")
      }
    }
    reader.readAsBinaryString(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Save / Update Part
  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isNewSupplierMode && !newSupplierData.name) {
      alert("Please enter the supplier name.")
      return
    }

    const effectiveCategory = isCustomCategoryMode
      ? customCategoryInput.trim() || "General"
      : partForm.category || "General"

    try {
      const payload = {
        ...partForm,
        category: effectiveCategory,
        supplierId: isNewSupplierMode ? null : partForm.supplierId,
        isNewSupplier: isNewSupplierMode,
        newSupplierData: isNewSupplierMode ? newSupplierData : null
      }

      if (activePart) {
        await fetch("/api/inventory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activePart.id, ...payload })
        })
        showToast("Part updated successfully!")
      } else {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        showToast("New part added to inventory!")
      }
      setShowPartModal(false)
      setIsNewSupplierMode(false)
      setIsCustomCategoryMode(false)
      setCustomCategoryInput("")
      setNewSupplierData({
        name: "",
        abn: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        accountNo: ""
      })
      loadInventory()
    } catch (err) {
      console.error("Error saving part:", err)
    }
  }

  // Save / Update Supplier
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierForm.name) {
      alert("Please enter supplier name.")
      return
    }

    try {
      if (activeSupplier) {
        await fetch("/api/suppliers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeSupplier.id, ...supplierForm })
        })
        showToast("Supplier details updated successfully!")
      } else {
        await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(supplierForm)
        })
        showToast("New supplier registered successfully!")
      }
      setShowSupplierEditModal(false)
      setActiveSupplier(null)
      loadInventory()
    } catch (err) {
      console.error("Error saving supplier:", err)
    }
  }

  // Quick Restock Action
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePart) return
    try {
      await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activePart.id,
          restockAmount: parseInt(restockAmount)
        })
      })
      showToast(`Added +${restockAmount} units to stock for ${activePart.name}`)
      setShowRestockModal(false)
      loadInventory()
    } catch (err) {
      console.error("Error updating restock:", err)
    }
  }

  const openEditPart = (p: any) => {
    setActivePart(p)
    setIsNewSupplierMode(false)
    setIsCustomCategoryMode(false)
    setCustomCategoryInput("")
    setPartForm({
      partNumber: p.partNumber,
      name: p.name,
      category: p.category || "General",
      costPrice: String(p.costPrice || "0.00"),
      retailPrice: String(p.retailPrice || "0.00"),
      availableStock: String(p.availableStock || "0"),
      maxStockQty: String(p.maxStockQty || "50"),
      minStockQty: String(p.minStockQty || "2"),
      restockMinQty: String(p.restockMinQty || "5"),
      supplierId: p.supplierId || ""
    })
    setShowPartModal(true)
  }

  const openNewPart = () => {
    setActivePart(null)
    setIsNewSupplierMode(false)
    setIsCustomCategoryMode(false)
    setCustomCategoryInput("")
    setNewSupplierData({
      name: "",
      abn: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      accountNo: ""
    })
    setPartForm({
      partNumber: "",
      name: "",
      category: categories[0] || "Oils & Fluids",
      costPrice: "0.00",
      retailPrice: "0.00",
      availableStock: "10",
      maxStockQty: "50",
      minStockQty: "2",
      restockMinQty: "5",
      supplierId: suppliers[0]?.id || ""
    })
    setShowPartModal(true)
  }

  const openEditSupplier = (s: any) => {
    setActiveSupplier(s)
    setSupplierForm({
      name: s.name || "",
      abn: s.abn || "",
      contactName: s.contactName || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      accountNo: s.accountNo || ""
    })
    setShowSupplierEditModal(true)
  }

  const openNewSupplier = () => {
    setActiveSupplier(null)
    setSupplierForm({
      name: "",
      abn: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      accountNo: ""
    })
    setShowSupplierEditModal(true)
  }

  const filteredParts = parts.filter((p) => {
    if (filterLowStock && p.availableStock > p.minStockQty) return false
    return true
  })

  const filteredSuppliers = suppliers.filter((s) => {
    if (!suppSearch) return true
    const term = suppSearch.toLowerCase()
    return (
      s.name?.toLowerCase().includes(term) ||
      s.abn?.toLowerCase().includes(term) ||
      s.contactName?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term)
    )
  })

  const lowStockCount = parts.filter((p) => p.availableStock <= p.minStockQty).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#E8920D]" />
            Parts Inventory & Master Catalog
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage spare parts, stock levels, restocking triggers, suppliers, and synchronize master inventory via Excel
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Import Excel
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export Excel
          </button>

          {activeMainTab === "parts" ? (
            <button
              onClick={openNewPart}
              className="px-3.5 py-2 bg-[#1B2A4A] hover:bg-[#243656] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E8920D]" />
              Add New Part
            </button>
          ) : (
            <button
              onClick={openNewSupplier}
              className="px-3.5 py-2 bg-[#1B2A4A] hover:bg-[#243656] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E8920D]" />
              Register Supplier
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveMainTab("parts")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeMainTab === "parts"
              ? "border-[#E8920D] text-[#E8920D]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Package className="w-4 h-4" />
          Parts Catalog & Stock ({parts.length})
        </button>
        <button
          onClick={() => setActiveMainTab("suppliers")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeMainTab === "suppliers"
              ? "border-[#E8920D] text-[#E8920D]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Connected Suppliers ({suppliers.length})
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* TAB 1: PARTS INVENTORY */}
      {activeMainTab === "parts" && (
        <div className="space-y-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Part Lines</p>
                <p className="text-2xl font-bold font-mono text-[#1B2A4A] mt-1">{parts.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-bold font-mono text-[#1B2A4A] mt-1">{categories.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#E8920D]">
                <Filter className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
                <p className="text-2xl font-bold font-mono text-red-600 mt-1">{lowStockCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Connected Suppliers</p>
                <p className="text-2xl font-bold font-mono text-[#1B2A4A] mt-1">{suppliers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by part number or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg font-medium text-gray-900"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg font-medium text-gray-700 bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Toggle */}
            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all border ${
                filterLowStock
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Low Stock Only ({lowStockCount})
            </button>
          </div>

          {/* Parts Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Part # / Code</th>
                  <th className="py-3 px-4">Description / Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost (ex-GST)</th>
                  <th className="py-3 px-4 text-right">Retail (ex-GST)</th>
                  <th className="py-3 px-4 text-center">Available Stock</th>
                  <th className="py-3 px-4 text-center">Min / Max</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 font-mono">
                      Loading inventory parts catalog...
                    </td>
                  </tr>
                ) : filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 font-mono">
                      No parts found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map((p) => {
                    const isLow = p.availableStock <= p.minStockQty
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {p.partNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {p.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full font-medium text-[11px]">
                            {p.category || "General"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-600">
                          ${p.costPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                          ${p.retailPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono font-bold text-[11px] ${
                              isLow
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isLow && <AlertTriangle className="w-3 h-3 text-red-600" />}
                            {p.availableStock} in stock
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-gray-500">
                          Min: {p.minStockQty} | Max: {p.maxStockQty}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-[11px]">
                          {p.supplier ? (
                            <span className="font-medium text-gray-800">{p.supplier.name}</span>
                          ) : (
                            <span className="text-gray-400 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setActivePart(p)
                              setRestockAmount(String(p.restockMinQty || 5))
                              setShowRestockModal(true)
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[#E8920D] rounded font-bold text-[11px] transition-colors"
                            title="Stock Received / Restock"
                          >
                            + Restock
                          </button>
                          <button
                            onClick={() => openEditPart(p)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit Part"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS MANAGEMENT */}
      {activeMainTab === "suppliers" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search suppliers by name, ABN, contact or phone..."
                value={suppSearch}
                onChange={(e) => setSuppSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg font-medium text-gray-900"
              />
            </div>
            <button
              onClick={openNewSupplier}
              className="px-3.5 py-2 bg-[#1B2A4A] hover:bg-[#243656] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs self-start md:self-auto"
            >
              <Plus className="w-4 h-4 text-[#E8920D]" />
              + Add New Supplier
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">ABN</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone / Trade Desk</th>
                  <th className="py-3 px-4">Order / Accounts Email</th>
                  <th className="py-3 px-4">Address / Suburb</th>
                  <th className="py-3 px-4">Trade Account #</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 font-mono">
                      No suppliers found. Click "+ Add New Supplier" to register one.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {s.abn || "—"}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {s.contactName || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700">
                        {s.phone || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {s.email || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {s.address || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {s.accountNo || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditSupplier(s)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm">
                {activePart ? "Edit Inventory Part" : "Add New Inventory Part"}
              </h3>
              <button
                onClick={() => setShowPartModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePart} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Part Number / SKU *</label>
                  <input
                    type="text"
                    required
                    value={partForm.partNumber}
                    onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                    placeholder="e.g. CAS-5W40-7L"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-700 font-semibold">Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                      className="text-[10px] text-[#E8920D] hover:underline font-semibold"
                    >
                      {isCustomCategoryMode ? "← Choose Existing" : "+ Add Custom"}
                    </button>
                  </div>

                  {isCustomCategoryMode ? (
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. Exhaust & Emission"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8920D] rounded-lg font-medium bg-amber-50/30"
                    />
                  ) : (
                    <select
                      value={partForm.category}
                      onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-medium bg-white"
                    >
                      {Array.from(new Set([...categories, "Oils & Fluids", "Filters", "Brakes", "Ignition", "Tyres", "General"])).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Item Description / Name *</label>
                <input
                  type="text"
                  required
                  value={partForm.name}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                  placeholder="e.g. Castrol Magnatec Diesel 5W-40 7L"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Cost Price ($ ex-GST)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.costPrice}
                    onChange={(e) => setPartForm({ ...partForm, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Retail Price ($ ex-GST)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.retailPrice}
                    onChange={(e) => setPartForm({ ...partForm, retailPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-[#1B2A4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Available</label>
                  <input
                    type="number"
                    value={partForm.availableStock}
                    onChange={(e) => setPartForm({ ...partForm, availableStock: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={partForm.minStockQty}
                    onChange={(e) => setPartForm({ ...partForm, minStockQty: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Restock Min</label>
                  <input
                    type="number"
                    value={partForm.restockMinQty}
                    onChange={(e) => setPartForm({ ...partForm, restockMinQty: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Max Stock</label>
                  <input
                    type="number"
                    value={partForm.maxStockQty}
                    onChange={(e) => setPartForm({ ...partForm, maxStockQty: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Primary Supplier Selector / Creator */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800">Primary Supplier</label>
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
                        <label className="block text-gray-600 text-[10px] font-semibold">Supplier Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Repco Penrith"
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
                        <label className="block text-gray-600 text-[10px] font-semibold">Phone / Trade Desk</label>
                        <input
                          type="text"
                          placeholder="02 9821 4455"
                          value={newSupplierData.phone}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, phone: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-[10px] font-semibold">Accounts / Order Email</label>
                        <input
                          type="email"
                          placeholder="orders@repco.com.au"
                          value={newSupplierData.email}
                          onChange={(e) => setNewSupplierData({ ...newSupplierData, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 border rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    value={partForm.supplierId}
                    onChange={(e) => setPartForm({ ...partForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium bg-white"
                  >
                    <option value="">None / Direct Sourced</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.abn ? `(ABN: ${s.abn})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm"
                >
                  {activePart ? "Update Part" : "Add Part"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Edit / Create Modal */}
      {showSupplierEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#E8920D]" />
                {activeSupplier ? "Edit Supplier Record" : "Register New Supplier"}
              </h3>
              <button
                onClick={() => setShowSupplierEditModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Supplier Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Repco Auto Parts Penrith"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Australian ABN</label>
                  <input
                    type="text"
                    placeholder="43 004 180 515"
                    value={supplierForm.abn}
                    onChange={(e) => setSupplierForm({ ...supplierForm, abn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Mark Stevens"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(02) 4731 2200"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Order Email</label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com.au"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 22 Blaikie Rd, Jamisontown"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Trade Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DHALLA-001"
                    value={supplierForm.accountNo}
                    onChange={(e) => setSupplierForm({ ...supplierForm, accountNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSupplierEditModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8920D] hover:bg-[#d68307] text-white font-bold rounded-lg shadow-sm"
                >
                  {activeSupplier ? "Save Changes" : "Register Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && activePart && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#E8920D]" />
                Receive Stock Order
              </h3>
              <button
                onClick={() => setShowRestockModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-gray-800">{activePart.name}</p>
                <p className="text-[11px] font-mono text-gray-500">{activePart.partNumber}</p>
                <p className="mt-2 text-gray-600">
                  Current stock level: <span className="font-bold font-mono">{activePart.availableStock}</span>
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Quantity Received (Units to add) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-lg text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
