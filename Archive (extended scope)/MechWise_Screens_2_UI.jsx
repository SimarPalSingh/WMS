import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Plus, Phone, Mail, Download, Printer, Send, Check, X, AlertTriangle, AlertCircle, Clock, Package, Filter, ArrowUpDown, Eye, Edit, Truck, BarChart3, Calendar as CalendarIcon, ChevronLeft, CreditCard, Banknote, Building2, Smartphone, RefreshCw, FileText, Users, Car, Wrench, Bell } from "lucide-react";

const C = {
  navy: "#1B2A4A", navyLight: "#243656", amber: "#E8920D", amberLight: "#FDF4E3", amberDark: "#B5710A",
  white: "#FFF", bg: "#F3F5F7", card: "#FFF", border: "#E5E7EB", borderStrong: "#D1D5DB",
  text: "#1F2937", textSec: "#6B7280", textMut: "#9CA3AF",
  success: "#059669", successBg: "#ECFDF5", danger: "#DC2626", dangerBg: "#FEF2F2",
  info: "#2563EB", infoBg: "#EFF6FF", warning: "#D97706", warningBg: "#FFFBEB",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
};
const mono = "'JetBrains Mono','SF Mono',monospace";
const sans = "'DM Sans','Inter',-apple-system,sans-serif";

// ── Shared components ──
const Badge = ({ children, color }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, color, background: color + "15", whiteSpace: "nowrap" }}>{children}</span>
);
const Btn = ({ children, primary, small, danger, ghost, onClick, style: s }) => (
  <button onClick={onClick} style={{
    padding: small ? "6px 12px" : "9px 18px", borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 600,
    border: ghost ? "none" : primary || danger ? "none" : `1px solid ${C.border}`, cursor: "pointer", fontFamily: sans,
    background: primary ? C.amber : danger ? C.danger : ghost ? "transparent" : C.card,
    color: primary || danger ? C.white : ghost ? C.amber : C.text,
    display: "inline-flex", alignItems: "center", gap: 6, ...s,
  }}>{children}</button>
);
const Card = ({ children, style: s }) => (
  <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", ...s }}>{children}</div>
);
const SH = ({ title, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{title}</div>
    {right}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: INVOICE VIEW + PAYMENT
// ═══════════════════════════════════════════════════════════════
function InvoiceScreen() {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("eftpos");
  const [paid, setPaid] = useState(false);

  const lines = [
    { desc: "Engine oil change (10W-40 semi-synthetic 5L)", type: "Labour + Parts", qty: 1, unit: 74, total: 74 },
    { desc: "Oil filter replacement (Z456)", type: "Labour + Parts", qty: 1, unit: 18, total: 18 },
    { desc: "Engine flush", type: "Labour + Parts", qty: 1, unit: 28, total: 28 },
    { desc: "25-point safety check", type: "Labour", qty: 1, unit: 40, total: 40 },
    { desc: "Front wiper blade replacement", type: "Parts + Labour", qty: 1, unit: 36.36, total: 36.36 },
  ];
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: mono, letterSpacing: "-0.01em" }}>INV-0089</div>
          <div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>Invoice date: 8 Oct 2025 · Due: 8 Oct 2025 · From job card JC-0089</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small><Printer size={14} /> Print</Btn>
          <Btn small><Download size={14} /> PDF</Btn>
          <Btn small><Send size={14} /> Email</Btn>
          {!paid && <Btn small primary onClick={() => setPayModalOpen(true)}><CreditCard size={14} /> Record payment</Btn>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Invoice body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header block mimicking PDF */}
          <Card>
            <div style={{ padding: 24, background: C.navy, color: C.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>DHALLA AUTOMOTIVE PTY LTD</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, lineHeight: 1.6 }}>70A Cox Avenue, Kingswood NSW 2747<br/>Ph: 0247 082 717 · Mob: 0430 050 714<br/>dhallaautomotive@yahoo.com.au</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>TAX INVOICE</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>ABN: 95611566888<br/>MVRL No: 54657<br/>ARC: AU44775</div>
                </div>
              </div>
            </div>

            {/* Customer + vehicle block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ padding: "14px 24px", borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textSec, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Bill to</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Peter Morrison</div>
                <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6, marginTop: 2 }}>12 Main Street, Kingswood NSW 2747<br/>Ph: 0435 791 593<br/>peter.m@gmail.com</div>
              </div>
              <div style={{ padding: "14px 24px" }}>
                <div style={{ fontSize: 11, color: C.textSec, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Vehicle</div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, letterSpacing: "0.04em" }}>NSW-PL1</div>
                <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6, marginTop: 2 }}>2017 Hyundai Tucson · Diesel · Manual<br/>VIN: KM8J33A42HU123456<br/>Odometer: 95,200 km</div>
              </div>
            </div>

            {/* Line items table */}
            <div style={{ padding: "0 24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.navy}` }}>
                    <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 600, color: C.navy, width: 30 }}>#</th>
                    <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 600, color: C.navy }}>Description</th>
                    <th style={{ textAlign: "center", padding: "12px 0", fontWeight: 600, color: C.navy, width: 60 }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "12px 0", fontWeight: 600, color: C.navy, width: 90 }}>Unit price</th>
                    <th style={{ textAlign: "right", padding: "12px 0", fontWeight: 600, color: C.navy, width: 90 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 0", color: C.textMut }}>{i + 1}</td>
                      <td style={{ padding: "10px 0" }}>
                        <div style={{ fontWeight: 500 }}>{l.desc}</div>
                        <div style={{ fontSize: 11, color: C.textMut }}>{l.type}</div>
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "center", fontFamily: mono }}>{l.qty}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontFamily: mono }}>${l.unit.toFixed(2)}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontFamily: mono, fontWeight: 600 }}>${l.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 240 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>Subtotal (ex-GST)</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>GST (10%)</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>${gst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", borderTop: `2px solid ${C.navy}`, marginTop: 6, fontSize: 18 }}>
                  <span style={{ fontWeight: 700, color: C.navy }}>Total</span>
                  <span style={{ fontWeight: 700, fontFamily: mono, color: C.navy }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 24px", background: C.bg, borderTop: `1px solid ${C.border}`, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ color: C.textSec }}>Next service due: <span style={{ fontWeight: 600, color: C.text }}>7 Apr 2026</span> or at <span style={{ fontWeight: 600, color: C.text }}>105,200 km</span></div>
                <div style={{ color: C.textSec }}>Thank you for choosing Dhalla Automotive.</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Payment status */}
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>Payment</div>
                <Badge color={paid ? C.success : C.warning}>{paid ? "Paid" : "Unpaid"}</Badge>
              </div>
              {paid ? (
                <div style={{ background: C.successBg, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.success, marginBottom: 6 }}>Payment received</div>
                  <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>
                    Amount: <span style={{ fontFamily: mono, fontWeight: 500 }}>${total.toFixed(2)}</span><br/>
                    Method: EFTPOS<br/>
                    Date: 8 Oct 2025<br/>
                    Ref: VISA ****4521<br/>
                    Received by: Tinku Dhalla
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
                    <span style={{ color: C.textSec }}>Amount due</span>
                    <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: C.danger }}>${total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: C.textMut }}>
                    <span>Due date</span><span>8 Oct 2025 (today)</span>
                  </div>
                  <Btn primary onClick={() => setPayModalOpen(true)} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                    <CreditCard size={16} /> Record payment
                  </Btn>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Actions</div>
              <Btn small style={{ width: "100%", justifyContent: "flex-start" }}><Send size={14} /> SMS pickup notification</Btn>
              <Btn small style={{ width: "100%", justifyContent: "flex-start" }}><Mail size={14} /> Email invoice</Btn>
              <Btn small style={{ width: "100%", justifyContent: "flex-start" }}><Download size={14} /> Download PDF</Btn>
              <Btn small style={{ width: "100%", justifyContent: "flex-start" }}><RefreshCw size={14} /> Void and re-issue</Btn>
            </div>
          </Card>

          {/* Linked records */}
          <Card>
            <div style={{ padding: "12px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Linked records</div>
              {[
                { label: "Quote", value: "QT-0042", icon: <FileText size={14} /> },
                { label: "Job card", value: "JC-0089", icon: <Wrench size={14} /> },
                { label: "Client", value: "CL-005 — Peter", icon: <Users size={14} /> },
                { label: "Vehicle", value: "VH-001 — NSW-PL1", icon: <Car size={14} /> },
                { label: "Reminder", value: "REM-301 — Pending", icon: <Bell size={14} /> },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
                  <span style={{ color: C.textMut }}>{r.icon}</span>
                  <span style={{ color: C.textSec, width: 65 }}>{r.label}</span>
                  <span style={{ fontWeight: 500, color: C.amber, fontFamily: mono, fontSize: 11 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Payment modal */}
      {payModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setPayModalOpen(false)}>
          <div style={{ background: C.card, borderRadius: 16, width: 420, maxHeight: "80vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Record payment</div>
              <button onClick={() => setPayModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMut }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>Invoice INV-0089 · Peter Morrison</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: mono, color: C.navy, marginBottom: 20 }}>${total.toFixed(2)}</div>

              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment method</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
                {[
                  { id: "eftpos", label: "EFTPOS", icon: <CreditCard size={18} /> },
                  { id: "cash", label: "Cash", icon: <Banknote size={18} /> },
                  { id: "card", label: "Credit card", icon: <CreditCard size={18} /> },
                  { id: "payid", label: "PayID", icon: <Smartphone size={18} /> },
                  { id: "transfer", label: "Bank transfer", icon: <Building2 size={18} /> },
                  { id: "bpay", label: "BPay", icon: <CreditCard size={18} /> },
                ].map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)} style={{
                    padding: "12px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                    border: payMethod === m.id ? `2px solid ${C.amber}` : `1px solid ${C.border}`,
                    background: payMethod === m.id ? C.amberLight : C.card,
                    color: payMethod === m.id ? C.amber : C.textSec,
                  }}>
                    <div style={{ marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{m.label}</div>
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.textSec, display: "block", marginBottom: 4 }}>Reference (optional)</label>
                <input placeholder="e.g. VISA ****4521" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: sans, boxSizing: "border-box" }} />
              </div>

              <Btn primary onClick={() => { setPaid(true); setPayModalOpen(false); }} style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
                <Check size={16} /> Confirm payment — ${total.toFixed(2)}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2: INVENTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function InventoryScreen() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "All items", count: 123 },
    { id: "PC-01", name: "Fluids & lubricants", count: 25 },
    { id: "PC-02", name: "Filters", count: 30 },
    { id: "PC-03", name: "Engine parts", count: 15 },
    { id: "PC-04", name: "Brake & suspension", count: 12 },
    { id: "PC-05", name: "Electrical", count: 10 },
    { id: "PC-08", name: "Tyres", count: 8 },
    { id: "PC-10", name: "Consumables", count: 8 },
  ];

  const parts = [
    { id: "PT-001", name: "Penrite 10W-40 semi-synthetic 5L", partNo: "PEN-10W40-5", cat: "Fluids", cost: 38, sell: 50, stock: 12, reorder: 5, location: "Shelf A1", supplier: "Penrite", status: "ok" },
    { id: "PT-002", name: "Penrite 5W-30 fully synthetic 6L", partNo: "PEN-5W30-6", cat: "Fluids", cost: 45, sell: 60, stock: 8, reorder: 5, location: "Shelf A1", supplier: "Penrite", status: "ok" },
    { id: "PT-003", name: "Penrite 0W-20 fully synthetic 5L", partNo: "PEN-0W20-5", cat: "Fluids", cost: 48, sell: 65, stock: 4, reorder: 5, location: "Shelf A1", supplier: "Penrite", status: "low" },
    { id: "PT-008", name: "Oil filter Z432", partNo: "Z432", cat: "Filters", cost: 5, sell: 10, stock: 5, reorder: 5, location: "Shelf B1", supplier: "CoolDrive", status: "reorder" },
    { id: "PT-010", name: "Oil filter Z456", partNo: "Z456", cat: "Filters", cost: 5, sell: 10, stock: 4, reorder: 5, location: "Shelf B1", supplier: "CoolDrive", status: "low" },
    { id: "PT-014", name: "Air filter A1215", partNo: "A1215", cat: "Filters", cost: 20, sell: 45, stock: 1, reorder: 1, location: "Shelf B2", supplier: "CoolDrive", status: "critical" },
    { id: "PT-018", name: "Front brake pads — generic", partNo: "BP-FG", cat: "Brakes", cost: 40, sell: 90, stock: 3, reorder: 2, location: "Shelf C1", supplier: "National Tyre", status: "ok" },
    { id: "PT-021", name: "Spark plug 3924", partNo: "SP-3924", cat: "Engine", cost: 4, sell: 8, stock: 16, reorder: 8, location: "Shelf D1", supplier: "CoolDrive", status: "ok" },
    { id: "PT-023", name: "Battery NS40ZL SMF", partNo: "BAT-NS40", cat: "Electrical", cost: 90, sell: 150, stock: 2, reorder: 1, location: "Shelf E1", supplier: "AutoGuru", status: "ok" },
    { id: "PT-024", name: "Alternator — reconditioned", partNo: "ALT-RECON", cat: "Electrical", cost: 150, sell: 230, stock: 0, reorder: 0, location: "On demand", supplier: "AutoGuru", status: "ondemand" },
    { id: "PT-025", name: "Tyre 205/55R16", partNo: "T-2055R16", cat: "Tyres", cost: 55, sell: 90, stock: 0, reorder: 2, location: "Tyre rack", supplier: "Newbee Tyre", status: "out" },
    { id: "PT-027", name: "Brake cleaner 500ml", partNo: "BC-500", cat: "Consumables", cost: 5, sell: 12, stock: 6, reorder: 3, location: "Shelf F1", supplier: "CoolDrive", status: "ok" },
  ];

  const statusConfig = {
    ok: { label: "In stock", color: C.success },
    low: { label: "Getting low", color: C.warning },
    reorder: { label: "Reorder now", color: C.warning },
    critical: { label: "Critical", color: C.danger },
    out: { label: "Out of stock", color: C.danger },
    ondemand: { label: "On demand", color: C.textMut },
  };

  const filteredParts = parts.filter(p =>
    (searchTerm === "" || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.partNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const alertCount = parts.filter(p => ["low", "reorder", "critical", "out"].includes(p.status)).length;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>Inventory</div>
          <div style={{ fontSize: 13, color: C.textSec }}>123 items · Stock value: $4,280 · {alertCount} alerts</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small><BarChart3 size={14} /> Stocktake</Btn>
          <Btn small><Truck size={14} /> New PO</Btn>
          <Btn small primary><Plus size={14} /> Add item</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
        {/* Category sidebar */}
        <Card>
          <div style={{ padding: 8 }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
                background: selectedCat === cat.id ? C.amberLight : "transparent",
                color: selectedCat === cat.id ? C.amber : C.textSec,
                fontSize: 13, fontWeight: selectedCat === cat.id ? 600 : 400, marginBottom: 1,
              }}>
                <span>{cat.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 20, background: selectedCat === cat.id ? C.amber + "20" : C.bg }}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Quick alerts */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.danger, marginBottom: 8 }}>
              <AlertCircle size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{alertCount} items need attention
            </div>
            {parts.filter(p => ["critical", "out"].includes(p.status)).map(p => (
              <div key={p.id} style={{ fontSize: 11, padding: "4px 0", color: C.danger }}>
                {p.name.split(" ").slice(0, 3).join(" ")} — {statusConfig[p.status].label}
              </div>
            ))}
          </div>
        </Card>

        {/* Parts table */}
        <Card>
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textMut }} />
              <input placeholder="Search parts by name or part number…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: sans, boxSizing: "border-box" }} />
            </div>
            <Btn small><Filter size={14} /> Filter</Btn>
            <Btn small><ArrowUpDown size={14} /> Sort</Btn>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ textAlign: "left", padding: "10px 20px", fontWeight: 500, color: C.textSec, fontSize: 12 }}>Item</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 80 }}>Part #</th>
                <th style={{ textAlign: "right", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 70 }}>Cost</th>
                <th style={{ textAlign: "right", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 70 }}>Sell</th>
                <th style={{ textAlign: "right", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 55 }}>Margin</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 60 }}>Stock</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 80 }}>Location</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 500, color: C.textSec, fontSize: 12, width: 90 }}>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map(p => {
                const margin = p.cost > 0 ? Math.round(((p.sell - p.cost) / p.sell) * 100) : 0;
                const sc = statusConfig[p.status];
                const stockRatio = p.reorder > 0 ? p.stock / (p.reorder * 2) : 1;
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
                    <td style={{ padding: "10px 20px" }}>
                      <div style={{ fontWeight: 500, color: C.text }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.textMut }}>{p.supplier}</div>
                    </td>
                    <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12, letterSpacing: "0.03em", color: C.navy }}>{p.partNo}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: mono, fontSize: 12 }}>${p.cost}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: mono, fontSize: 12, fontWeight: 600 }}>${p.sell}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontSize: 12, fontWeight: 600, color: margin > 40 ? C.success : margin > 20 ? C.text : C.danger }}>{margin > 0 ? `${margin}%` : "—"}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: p.stock === 0 ? C.danger : C.text }}>{p.stock}</div>
                      {p.reorder > 0 && (
                        <div style={{ height: 3, borderRadius: 2, background: C.bg, marginTop: 3, width: 40, margin: "3px auto 0" }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, stockRatio * 100)}%`, background: stockRatio > 0.5 ? C.success : stockRatio > 0.25 ? C.warning : C.danger }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: 11, color: C.textSec }}>{p.location}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}><Badge color={sc.color}>{sc.label}</Badge></td>
                    <td style={{ padding: "10px 8px" }}><button style={{ background: "none", border: "none", cursor: "pointer", color: C.textMut, padding: 4 }}><Eye size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3: CALENDAR / SCHEDULING
// ═══════════════════════════════════════════════════════════════
function CalendarScreen() {
  const [viewMode, setViewMode] = useState("day");

  const hours = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00"];
  const bays = ["Bay 1 — Hoist", "Bay 2 — Hoist", "Bay 3 — Ground", "Bay 4 — Tyre"];

  const appointments = [
    { bay: 0, startHour: 1, duration: 1.5, client: "Amit", rego: "YBI41V", job: "Pink slip", status: "unconfirmed", color: C.warningBg, borderColor: C.warning },
    { bay: 0, startHour: 2.5, duration: 2.5, client: "Kang & Gill", rego: "FCV93G", job: "Major service", status: "confirmed", color: C.successBg, borderColor: C.success },
    { bay: 1, startHour: 1, duration: 1, client: "Peter", rego: "NSW-PL1", job: "Minor service", status: "in-progress", color: C.amberLight, borderColor: C.amber },
    { bay: 1, startHour: 2.5, duration: 4, client: "CIM29R", rego: "CIM29R", job: "Front brakes — waiting parts", status: "waiting-parts", color: C.dangerBg, borderColor: C.danger },
    { bay: 2, startHour: 0, duration: 3, client: "ZLF882", rego: "ZLF882", job: "Major service + AC — DONE", status: "ready", color: C.successBg, borderColor: C.success },
    { bay: 2, startHour: 3.5, duration: 2, client: "Girish", rego: "CK66YW", job: "Brake pads + fluid", status: "confirmed", color: C.infoBg, borderColor: C.info },
    { bay: 3, startHour: 0.5, duration: 1, client: "Ravinder Kaur", rego: "BGX18S", job: "Tyres × 4", status: "in-progress", color: C.amberLight, borderColor: C.amber },
    { bay: 3, startHour: 6, duration: 1, client: "Neeran", rego: "BX53KO", job: "Diagnostic", status: "booked", color: C.infoBg, borderColor: C.info },
  ];

  const hourHeight = 64;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Calendar toolbar */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.card, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, padding: 4 }}><ChevronLeft size={20} /></button>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Tuesday 8 October 2025</div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, padding: 4 }}><ChevronRight size={20} /></button>
          <Btn small ghost>Today</Btn>
        </div>
        <div style={{ display: "flex", gap: 2, background: C.bg, borderRadius: 8, padding: 2 }}>
          {["day", "week", "month"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
              border: "none", fontFamily: sans,
              background: viewMode === m ? C.card : "transparent",
              color: viewMode === m ? C.navy : C.textSec,
              boxShadow: viewMode === m ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
            }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11, color: C.textSec }}>
            <span><span style={{ width: 8, height: 8, borderRadius: 4, background: C.success, display: "inline-block", marginRight: 4 }} />Confirmed</span>
            <span><span style={{ width: 8, height: 8, borderRadius: 4, background: C.warning, display: "inline-block", marginRight: 4 }} />Unconfirmed</span>
            <span><span style={{ width: 8, height: 8, borderRadius: 4, background: C.amber, display: "inline-block", marginRight: 4 }} />In progress</span>
            <span><span style={{ width: 8, height: 8, borderRadius: 4, background: C.danger, display: "inline-block", marginRight: 4 }} />Blocked</span>
          </div>
          <Btn small primary><Plus size={14} /> New booking</Btn>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${bays.length}, 1fr)`, minHeight: hours.length * hourHeight }}>
          {/* Bay headers */}
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg, borderBottom: `1px solid ${C.border}` }} />
          {bays.map((bay, i) => (
            <div key={i} style={{
              position: "sticky", top: 0, zIndex: 10, padding: "10px 12px",
              background: C.bg, borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`,
              fontSize: 13, fontWeight: 600, color: C.navy,
            }}>{bay}</div>
          ))}

          {/* Time column */}
          <div style={{ position: "relative" }}>
            {hours.map((h, i) => (
              <div key={i} style={{ height: hourHeight, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 0, fontSize: 11, color: C.textMut, fontFamily: mono, borderBottom: `1px solid ${C.border}` }}>{h}</div>
            ))}
          </div>

          {/* Bay columns */}
          {bays.map((_, bayIdx) => (
            <div key={bayIdx} style={{ position: "relative", borderLeft: `1px solid ${C.border}` }}>
              {hours.map((_, i) => (
                <div key={i} style={{ height: hourHeight, borderBottom: `1px solid ${C.border}` }} />
              ))}
              {/* Appointment blocks */}
              {appointments.filter(a => a.bay === bayIdx).map((appt, i) => (
                <div key={i} style={{
                  position: "absolute", top: appt.startHour * hourHeight + 2, left: 4, right: 4,
                  height: appt.duration * hourHeight - 4,
                  background: appt.color, borderLeft: `3px solid ${appt.borderColor}`,
                  borderRadius: 6, padding: "6px 8px", overflow: "hidden", cursor: "pointer",
                  fontSize: 11, lineHeight: 1.4,
                }}>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 12 }}>{appt.client}</div>
                  <div style={{ fontFamily: mono, fontWeight: 600, letterSpacing: "0.04em", color: C.navy, fontSize: 11 }}>{appt.rego}</div>
                  <div style={{ color: C.textSec, marginTop: 1 }}>{appt.job}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom summary bar */}
      <div style={{ padding: "10px 24px", background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 20, color: C.textSec }}>
          <span><span style={{ fontWeight: 600, color: C.text }}>8</span> appointments today</span>
          <span><span style={{ fontWeight: 600, color: C.text }}>28.5</span> of 38 bay-hours used</span>
          <span><span style={{ fontWeight: 600, color: C.success }}>75%</span> utilisation</span>
        </div>
        <div style={{ display: "flex", gap: 10, color: C.textSec }}>
          <span>Est revenue: <span style={{ fontWeight: 600, color: C.navy }}>${(154 + 52 + 350 + 380 + 280 + 80 + 400 + 194).toLocaleString()}</span></span>
          <span>1 unconfirmed</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function MechWiseScreens2() {
  const [screen, setScreen] = useState("invoice");

  return (
    <div style={{ height: "100vh", fontFamily: sans, background: C.bg, color: C.text, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", background: C.navy, padding: "0 16px", gap: 2, flexShrink: 0 }}>
        {[
          { id: "invoice", label: "Invoice + Payment" },
          { id: "inventory", label: "Inventory" },
          { id: "calendar", label: "Calendar / Scheduling" },
        ].map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} style={{
            padding: "10px 18px", fontSize: 13, fontWeight: screen === s.id ? 600 : 400,
            color: screen === s.id ? C.white : "#8899B3",
            background: screen === s.id ? C.navyLight : "transparent",
            border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", fontFamily: sans,
          }}>{s.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {screen === "invoice" && <InvoiceScreen />}
        {screen === "inventory" && <InventoryScreen />}
        {screen === "calendar" && <CalendarScreen />}
      </div>
    </div>
  );
}
