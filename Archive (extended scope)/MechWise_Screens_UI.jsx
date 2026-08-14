import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Plus, Phone, Mail, MapPin, Car, Clock, FileText, CreditCard, Edit, MoreHorizontal, Check, X, AlertTriangle, ArrowRight, Wrench, User, Calendar, Package, Hash, Send } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// COLORS & TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  navy: "#1B2A4A", navyLight: "#243656", amber: "#E8920D", amberLight: "#FDF4E3",
  white: "#FFF", bg: "#F3F5F7", card: "#FFF", border: "#E5E7EB", borderStrong: "#D1D5DB",
  text: "#1F2937", textSec: "#6B7280", textMut: "#9CA3AF",
  success: "#059669", successBg: "#ECFDF5", danger: "#DC2626", dangerBg: "#FEF2F2",
  info: "#2563EB", infoBg: "#EFF6FF", warning: "#D97706", warningBg: "#FFFBEB",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
};
const mono = "'JetBrains Mono','SF Mono',monospace";
const sans = "'DM Sans','Inter',-apple-system,sans-serif";

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════
const CLIENT = {
  id: "CL-005", type: "Individual", firstName: "Peter", lastName: "Morrison", mobile: "0435 791 593",
  email: "peter.m@gmail.com", address: "12 Main Street, Kingswood NSW 2747", preferred: "SMS",
  created: "15 Jan 2020", notes: "Regular customer — prefers morning appointments", active: true, completeness: 85,
};

const VEHICLES = [
  { id: "VH-001", rego: "NSW-PL1", make: "Hyundai", model: "Tucson", year: 2017, color: "White", fuel: "Diesel", trans: "Manual", mileage: 95200, nextService: "7 Apr 2026", nextKm: "105,200", pinkSlip: "10 Apr 2026", vin: "KM8J33A42HU123456", active: true },
  { id: "VH-042", rego: "DFG45Z", make: "Toyota", model: "Corolla", year: 2021, color: "Silver", fuel: "Petrol", trans: "Auto", mileage: 38400, nextService: "12 Jun 2026", nextKm: "48,400", pinkSlip: "N/A — under 5 years", vin: "JTDKN3DU5M5123456", active: true },
];

const HISTORY = [
  { id: "MH-0034", date: "8 Oct 2025", type: "Minor service + wipers", mileage: "95,200", cost: "$194.00", mechanic: "Tinku", invoice: "INV-0089", vehicle: "NSW-PL1", notes: "Monitor transmission — slight shudder on cold start" },
  { id: "MH-0028", date: "10 Apr 2025", type: "Pink slip — passed", mileage: "92,500", cost: "$52.00", mechanic: "Tinku", invoice: "INV-0072", vehicle: "NSW-PL1", notes: "" },
  { id: "MH-0027", date: "8 Apr 2025", type: "Minor service", mileage: "92,500", cost: "$154.00", mechanic: "Tinku", invoice: "INV-0071", vehicle: "NSW-PL1", notes: "" },
  { id: "MH-0019", date: "15 Oct 2024", type: "Front brake replacement", mileage: "85,100", cost: "$280.00", mechanic: "Baljit", invoice: "INV-0048", vehicle: "NSW-PL1", notes: "Rear pads at 40% — will need replacing in ~15,000km" },
  { id: "MH-0011", date: "12 Apr 2024", type: "Major service", mileage: "75,300", cost: "$350.00", mechanic: "Tinku", invoice: "INV-0029", vehicle: "NSW-PL1", notes: "" },
];

const CATALOGUE_JOBS = [
  { id: "JB-001", name: "Minor Service", cat: "Engine Service", price: 154, duration: "1.0 hr", items: [
    { id: "JS-001", name: "Engine oil change (10W-40 semi-synthetic 5L)", type: "Labour", partCost: 50, labourCost: 24, total: 74 },
    { id: "JS-002", name: "Oil filter replacement", type: "Labour", partCost: 10, labourCost: 8, total: 18 },
    { id: "JS-003", name: "Engine flush", type: "Labour", partCost: 20, labourCost: 8, total: 28 },
    { id: "JS-004", name: "25-point safety check", type: "Labour", partCost: 0, labourCost: 40, total: 40 },
  ]},
  { id: "JB-002", name: "Major Service", cat: "Engine Service", price: 350, duration: "2.5 hrs", items: [] },
  { id: "JB-004", name: "Front Brake Replacement", cat: "Brakes", price: 280, duration: "1.5 hrs", items: [] },
  { id: "JB-005", name: "Rear Brake Replacement", cat: "Brakes", price: 240, duration: "1.5 hrs", items: [] },
  { id: "JB-009", name: "Coolant Flush", cat: "Cooling", price: 120, duration: "1.0 hr", items: [] },
  { id: "JB-011", name: "Battery Replacement", cat: "Electrical", price: 180, duration: "0.5 hr", items: [] },
  { id: "JB-015", name: "Tyre Replacement (×4)", cat: "Tyres", price: 400, duration: "1.0 hr", items: [] },
  { id: "JB-018", name: "Pink Slip / E-Safety", cat: "Inspections", price: 52, duration: "0.5 hr", items: [] },
  { id: "JB-020", name: "Diagnostic Scan", cat: "General", price: 80, duration: "0.5 hr", items: [] },
  { id: "JB-022", name: "AC Regas", cat: "HVAC", price: 180, duration: "1.0 hr", items: [] },
];

const JOB_STATUSES = [
  { key: "booked", label: "Booked", color: C.textSec },
  { key: "waiting", label: "Waiting", color: C.info },
  { key: "progress", label: "In Progress", color: C.warning },
  { key: "parts", label: "Waiting for Parts", color: C.danger },
  { key: "qc", label: "Quality Check", color: C.purple },
  { key: "ready", label: "Ready for Pickup", color: C.success },
  { key: "completed", label: "Completed", color: C.success },
];

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
const Badge = ({ children, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, color: color, background: bg || (color + "15"), whiteSpace: "nowrap" }}>{children}</span>
);

const Btn = ({ children, primary, small, onClick, style: s }) => (
  <button onClick={onClick} style={{
    padding: small ? "6px 12px" : "9px 18px", borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 600,
    border: primary ? "none" : `1px solid ${C.border}`, cursor: "pointer", fontFamily: sans,
    background: primary ? C.amber : C.card, color: primary ? C.white : C.text,
    display: "inline-flex", alignItems: "center", gap: 6, ...s,
  }}>{children}</button>
);

const SectionHeader = ({ title, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{title}</div>
    {right}
  </div>
);

const Card = ({ children, style: s }) => (
  <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", ...s }}>{children}</div>
);

const FieldRow = ({ label, value, mono: isMono }) => (
  <div style={{ display: "flex", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
    <div style={{ width: 140, color: C.textSec, fontWeight: 500, flexShrink: 0 }}>{label}</div>
    <div style={{ color: C.text, fontWeight: isMono ? 500 : 400, fontFamily: isMono ? mono : "inherit", letterSpacing: isMono ? "0.03em" : 0 }}>{value || <span style={{ color: C.textMut, fontStyle: "italic" }}>Not set</span>}</div>
  </div>
);

const TopBar = ({ title, subtitle, onBack, actions }) => (
  <div style={{ height: 56, background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0 }}>
    {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textSec, display: "flex" }}><ChevronLeft size={20} /></button>}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.textSec }}>{subtitle}</div>}
    </div>
    <div style={{ display: "flex", gap: 8 }}>{actions}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: CLIENT DETAIL
// ═══════════════════════════════════════════════════════════════
function ClientDetail({ onNavigate }) {
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const v = VEHICLES[selectedVehicle];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={`${CLIENT.firstName} ${CLIENT.lastName}`} subtitle={`${CLIENT.id} · ${CLIENT.type} · Since ${CLIENT.created}`}
        onBack={() => onNavigate("dashboard")}
        actions={<>
          <Btn small onClick={() => onNavigate("quote")}><FileText size={14} /> New quote</Btn>
          <Btn small primary><Edit size={14} /> Edit client</Btn>
        </>}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>

          {/* Left column — client info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Contact card */}
            <Card>
              <SectionHeader title="Contact" right={<Badge color={C.success} bg={C.successBg}>Active</Badge>} />
              <div style={{ padding: "12px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: C.white }}>PM</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{CLIENT.firstName} {CLIENT.lastName}</div>
                    <div style={{ fontSize: 12, color: C.textSec }}>Preferred: {CLIENT.preferred}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Phone size={14} style={{ color: C.textMut }} /><span style={{ fontFamily: mono }}>{CLIENT.mobile}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><Mail size={14} style={{ color: C.textMut }} />{CLIENT.email}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><MapPin size={14} style={{ color: C.textMut }} />{CLIENT.address}</div>
                </div>
              </div>
              <div style={{ padding: "10px 20px", background: C.bg, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textSec }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Profile completeness</span><span style={{ fontWeight: 600 }}>{CLIENT.completeness}%</span></div>
                <div style={{ height: 4, borderRadius: 2, background: C.border }}><div style={{ height: "100%", borderRadius: 2, background: C.success, width: `${CLIENT.completeness}%` }} /></div>
              </div>
            </Card>

            {/* Vehicles list */}
            <Card>
              <SectionHeader title={`Vehicles (${VEHICLES.length})`} right={<Btn small><Plus size={14} /> Add</Btn>} />
              <div style={{ padding: 8 }}>
                {VEHICLES.map((vh, i) => (
                  <button key={vh.id} onClick={() => setSelectedVehicle(i)} style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: selectedVehicle === i ? C.amberLight : "transparent",
                    marginBottom: 2,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: selectedVehicle === i ? C.amber : C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Car size={18} style={{ color: selectedVehicle === i ? C.white : C.textMut }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: mono, letterSpacing: "0.04em", color: C.navy }}>{vh.rego}</div>
                      <div style={{ fontSize: 12, color: C.textSec }}>{vh.year} {vh.make} {vh.model}</div>
                    </div>
                    <ChevronRight size={16} style={{ color: C.textMut }} />
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick stats */}
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Customer summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Total spend", value: "$1,030" },
                    { label: "Visits", value: "5" },
                    { label: "Avg spend", value: "$206" },
                    { label: "Avg interval", value: "4.2 mo" },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.bg, borderRadius: 8, padding: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.textSec }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card>
              <div style={{ padding: "14px 20px", fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: C.navy, marginBottom: 6 }}>Notes</div>
                <div style={{ color: C.textSec, lineHeight: 1.6 }}>{CLIENT.notes}</div>
              </div>
            </Card>
          </div>

          {/* Right column — vehicle detail + history */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Vehicle detail */}
            <Card>
              <SectionHeader title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, letterSpacing: "0.04em", color: C.amber }}>{v.rego}</span>
                  <span style={{ fontSize: 15 }}>{v.year} {v.make} {v.model}</span>
                </div>
              } right={<Btn small><Edit size={14} /> Edit</Btn>} />
              <div style={{ padding: "8px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                  <FieldRow label="Registration" value={v.rego} mono />
                  <FieldRow label="VIN" value={v.vin} mono />
                  <FieldRow label="Make / Model" value={`${v.make} ${v.model}`} />
                  <FieldRow label="Year" value={v.year} />
                  <FieldRow label="Color" value={v.color} />
                  <FieldRow label="Body type" value="SUV" />
                  <FieldRow label="Fuel" value={v.fuel} />
                  <FieldRow label="Transmission" value={v.trans} />
                  <FieldRow label="Current mileage" value={`${v.mileage.toLocaleString()} km`} />
                  <FieldRow label="Engine capacity" value="2.0L" />
                </div>
              </div>
              {/* Service status bar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: "12px 20px", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 2 }}>Next service</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.success }}>{v.nextService}</div>
                  <div style={{ fontSize: 11, color: C.textMut }}>or at {v.nextKm} km</div>
                </div>
                <div style={{ padding: "12px 20px", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 2 }}>Pink slip expires</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: v.pinkSlip.includes("N/A") ? C.textMut : C.success }}>{v.pinkSlip}</div>
                </div>
                <div style={{ padding: "12px 20px" }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 2 }}>Last service</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>8 Oct 2025</div>
                  <div style={{ fontSize: 11, color: C.textMut }}>Minor service</div>
                </div>
              </div>
            </Card>

            {/* Service history timeline */}
            <Card>
              <SectionHeader title="Service history" right={<div style={{ fontSize: 12, color: C.textSec }}>{HISTORY.length} records</div>} />
              <div style={{ padding: "0 20px" }}>
                {HISTORY.map((h, i) => (
                  <div key={h.id} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < HISTORY.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    {/* Timeline dot */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, paddingTop: 4, flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 5, background: h.type.includes("Pink") ? C.info : h.type.includes("brake") ? C.warning : C.success, border: `2px solid ${C.card}`, boxShadow: `0 0 0 2px ${h.type.includes("Pink") ? C.info : h.type.includes("brake") ? C.warning : C.success}30` }} />
                      {i < HISTORY.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 4 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{h.type}</div>
                          <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{h.date} · {h.mileage} km · Mechanic: {h.mechanic}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: C.text }}>{h.cost}</div>
                          <div style={{ fontSize: 11, color: C.amber, cursor: "pointer", fontWeight: 500 }}>{h.invoice} →</div>
                        </div>
                      </div>
                      {h.notes && (
                        <div style={{ marginTop: 6, padding: "6px 10px", background: C.amberLight, borderRadius: 6, fontSize: 12, color: C.amberDark || C.warning }}>
                          💡 {h.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2: QUOTE BUILDER
// ═══════════════════════════════════════════════════════════════
function QuoteBuilder({ onNavigate }) {
  const [selectedJobs, setSelectedJobs] = useState([CATALOGUE_JOBS[0]]);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [discount, setDiscount] = useState(0);

  const subtotal = selectedJobs.reduce((sum, j) => sum + j.price, 0);
  const discountAmt = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmt;
  const gst = afterDiscount * 0.1;
  const total = afterDiscount + gst;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="New quotation" subtitle="QT-0042 · Draft"
        onBack={() => onNavigate("client")}
        actions={<>
          <Btn small>Save draft</Btn>
          <Btn small style={{ background: C.navy, color: C.white, border: "none" }}><Send size={14} /> Send to customer</Btn>
        </>}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

          {/* Left — line items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Customer & vehicle header */}
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ padding: "14px 20px", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.white }}>PM</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Peter Morrison</div>
                      <div style={{ fontSize: 12, color: C.textSec, fontFamily: mono }}>0435 791 593</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vehicle</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={16} style={{ color: C.amber }} /></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, letterSpacing: "0.04em" }}>NSW-PL1</div>
                      <div style={{ fontSize: 12, color: C.textSec }}>2017 Hyundai Tucson · 95,200 km</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Previous recommendation banner */}
              <div style={{ padding: "10px 20px", background: C.amberLight, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <AlertTriangle size={14} style={{ color: C.amber }} />
                <span style={{ color: C.amberDark || C.warning }}>Previous visit noted: "Rear pads at 40% — will need replacing in ~15,000km." Current: 95,200km (+10,100km since). Consider adding rear brakes to this quote.</span>
              </div>
            </Card>

            {/* Line items */}
            <Card>
              <SectionHeader title="Line items" right={
                <Btn small primary onClick={() => setShowCatalogue(!showCatalogue)}><Plus size={14} /> Add job</Btn>
              } />

              {/* Job catalogue dropdown */}
              {showCatalogue && (
                <div style={{ padding: "12px 20px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Select from service catalogue</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {CATALOGUE_JOBS.filter(j => !selectedJobs.find(s => s.id === j.id)).map(job => (
                      <button key={job.id} onClick={() => { setSelectedJobs([...selectedJobs, job]); setShowCatalogue(false); }}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", textAlign: "left", fontSize: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, color: C.text }}>{job.name}</div>
                          <div style={{ color: C.textSec, fontSize: 11 }}>{job.cat} · {job.duration}</div>
                        </div>
                        <div style={{ fontWeight: 600, fontFamily: mono, color: C.navy }}>${job.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected jobs */}
              <div style={{ padding: "0 20px" }}>
                {selectedJobs.map((job, ji) => (
                  <div key={job.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: job.items.length ? 10 : 0 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{job.name}</div>
                        <div style={{ fontSize: 12, color: C.textSec }}>{job.cat} · Est. {job.duration}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: mono, color: C.text }}>${job.price.toFixed(2)}</div>
                        <button onClick={() => setSelectedJobs(selectedJobs.filter((_, i) => i !== ji))} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, padding: 4 }}><X size={16} /></button>
                      </div>
                    </div>
                    {/* Sub-items */}
                    {job.items.length > 0 && (
                      <div style={{ background: C.bg, borderRadius: 8, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                              <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, color: C.textSec }}>Sub-item</th>
                              <th style={{ textAlign: "right", padding: "6px 10px", fontWeight: 500, color: C.textSec, width: 70 }}>Parts</th>
                              <th style={{ textAlign: "right", padding: "6px 10px", fontWeight: 500, color: C.textSec, width: 70 }}>Labour</th>
                              <th style={{ textAlign: "right", padding: "6px 10px", fontWeight: 500, color: C.textSec, width: 70 }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {job.items.map(item => (
                              <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                <td style={{ padding: "6px 10px", color: C.text }}>{item.name}</td>
                                <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, color: item.partCost ? C.text : C.textMut }}>{item.partCost ? `$${item.partCost}` : "—"}</td>
                                <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, color: C.text }}>${item.labourCost}</td>
                                <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: mono, fontWeight: 600, color: C.navy }}>${item.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right — quote summary */}
          <div>
            <Card style={{ position: "sticky", top: 0 }}>
              <SectionHeader title="Quote summary" />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>Subtotal (ex-GST)</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
                </div>

                {/* Discount */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>Discount</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="number" value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                      style={{ width: 48, padding: "3px 6px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, textAlign: "right", fontFamily: mono }} />
                    <span style={{ fontSize: 12, color: C.textMut }}>%</span>
                    {discountAmt > 0 && <span style={{ fontFamily: mono, fontWeight: 500, color: C.danger, marginLeft: 8 }}>−${discountAmt.toFixed(2)}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>GST (10%)</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>${gst.toFixed(2)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 6px", fontSize: 18, borderTop: `2px solid ${C.navy}`, marginTop: 8 }}>
                  <span style={{ fontWeight: 700, color: C.navy }}>Total inc GST</span>
                  <span style={{ fontWeight: 700, fontFamily: mono, color: C.navy }}>${total.toFixed(2)}</span>
                </div>

                {/* Margin (owner only) */}
                <div style={{ padding: "8px 10px", background: C.purpleBg, borderRadius: 6, marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: C.purple }}>Estimated margin</span>
                  <span style={{ fontWeight: 600, color: C.purple }}>47% · ${(afterDiscount * 0.47).toFixed(0)} profit</span>
                </div>
              </div>

              {/* Send options */}
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Delivery method</div>
                {["SMS with link", "Email with PDF", "Print"].map((m, i) => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13, cursor: "pointer" }}>
                    <input type="radio" name="delivery" defaultChecked={i === 0} style={{ accentColor: C.amber }} />
                    {m}
                  </label>
                ))}
                <div style={{ marginTop: 12 }}>
                  <Btn primary style={{ width: "100%", justifyContent: "center" }}><Send size={14} /> Send quote</Btn>
                </div>
                <div style={{ fontSize: 11, color: C.textMut, textAlign: "center", marginTop: 8 }}>Valid for 14 days · Customer can reply YES to approve</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3: JOB CARD
// ═══════════════════════════════════════════════════════════════
function JobCard({ onNavigate }) {
  const [status, setStatus] = useState("progress");
  const [completedItems, setCompletedItems] = useState([0, 1]);

  const items = [
    { name: "Engine oil change (10W-40 5L)", part: "PT-001: Penrite 10W-40", estHrs: 0.3, actualHrs: 0.25, price: 74 },
    { name: "Oil filter replacement", part: "PT-010: Z456 (Hyundai)", estHrs: 0.1, actualHrs: 0.1, price: 18 },
    { name: "Engine flush", part: "PT-029: Engine flush additive", estHrs: 0.1, actualHrs: null, price: 28 },
    { name: "25-point safety check", part: null, estHrs: 0.5, actualHrs: null, price: 40 },
  ];

  const progress = Math.round((completedItems.length / items.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Job Card JC-0089" subtitle="Minor Service · NSW-PL1 · Hyundai Tucson 2017"
        onBack={() => onNavigate("client")}
        actions={<>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8 }}>
            {JOB_STATUSES.map(s => (
              <button key={s.key} onClick={() => setStatus(s.key)} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: status === s.key ? `2px solid ${s.color}` : `1px solid ${C.border}`,
                background: status === s.key ? s.color + "15" : C.card,
                color: status === s.key ? s.color : C.textMut,
              }}>{s.label}</button>
            ))}
          </div>
        </>}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

          {/* Left — job details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Progress banner */}
            <Card>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{completedItems.length} of {items.length} items completed</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: progress === 100 ? C.success : C.amber }}>{progress}%</div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: C.bg }}>
                  <div style={{ height: "100%", borderRadius: 4, background: progress === 100 ? C.success : `linear-gradient(90deg, ${C.navy}, ${C.amber})`, width: `${progress}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            </Card>

            {/* Work items */}
            <Card>
              <SectionHeader title="Work items" right={<Btn small><Plus size={14} /> Add item</Btn>} />
              <div style={{ padding: "0 20px" }}>
                {items.map((item, i) => {
                  const done = completedItems.includes(i);
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none", opacity: done ? 0.7 : 1 }}>
                      {/* Checkbox */}
                      <button onClick={() => {
                        setCompletedItems(done ? completedItems.filter(x => x !== i) : [...completedItems, i]);
                      }} style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0, cursor: "pointer",
                        border: done ? "none" : `2px solid ${C.border}`,
                        background: done ? C.success : C.card,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {done && <Check size={16} style={{ color: C.white }} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: C.text, textDecoration: done ? "line-through" : "none" }}>{item.name}</div>
                        {item.part && (
                          <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>
                            <Package size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{item.part}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                          <div style={{ fontSize: 11, color: C.textMut }}>
                            <Clock size={11} style={{ marginRight: 3, verticalAlign: "middle" }} />
                            Est: {item.estHrs}hr
                          </div>
                          {item.actualHrs !== null && (
                            <div style={{ fontSize: 11, color: item.actualHrs <= item.estHrs ? C.success : C.danger }}>
                              Actual: {item.actualHrs}hr {item.actualHrs <= item.estHrs ? "✓" : "⚠"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: mono, color: C.navy }}>${item.price}</div>
                        <div style={{ fontSize: 11, color: C.textMut }}>ex-GST</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Internal notes */}
            <Card>
              <SectionHeader title="Notes" />
              <div style={{ padding: "12px 20px" }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer notes (visible on invoice and portal)</div>
                  <textarea placeholder="Recommendations for the customer…" defaultValue="Monitor transmission — slight shudder on cold start. Recommend transmission flush at next service."
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: sans, minHeight: 60, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Internal notes (staff only)</div>
                  <textarea placeholder="Internal observations…" defaultValue=""
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: sans, minHeight: 60, resize: "vertical", boxSizing: "border-box" }} />
                </div>
              </div>
            </Card>
          </div>

          {/* Right sidebar — job info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Job details</div>
                <FieldRow label="Job card" value="JC-0089" mono />
                <FieldRow label="Quote ref" value="QT-0042" mono />
                <FieldRow label="Client" value="Peter Morrison" />
                <FieldRow label="Vehicle" value="NSW-PL1" mono />
                <FieldRow label="Date in" value="8 Oct 2025" />
                <FieldRow label="Date due" value="8 Oct 2025" />
                <FieldRow label="Bay" value="Bay 2 — Hoist" />
                <FieldRow label="Mechanic" value="Tinku Dhalla" />
                <FieldRow label="Priority" value={<Badge color={C.info}>Normal</Badge>} />
                <FieldRow label="Mileage in" value="95,200 km" mono />
              </div>
            </Card>

            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Financial</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>Subtotal</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>$160.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>Package price</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>$140.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>GST</span>
                  <span style={{ fontFamily: mono, fontWeight: 500 }}>$14.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: `2px solid ${C.navy}`, marginTop: 6, fontSize: 16 }}>
                  <span style={{ fontWeight: 700, color: C.navy }}>Total</span>
                  <span style={{ fontWeight: 700, fontFamily: mono, color: C.navy }}>$154.00</span>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next service</div>
                <FieldRow label="Due date" value="7 Apr 2026" />
                <FieldRow label="Due mileage" value="105,200 km" mono />
                <FieldRow label="Interval" value="6 months / 10,000 km" />
              </div>
            </Card>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn primary style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
                <Check size={16} /> Complete job → Generate invoice
              </Btn>
              <Btn style={{ width: "100%", justifyContent: "center" }}>
                <FileText size={14} /> Add supplementary quote
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP — SCREEN ROUTER
// ═══════════════════════════════════════════════════════════════
export default function MechWiseScreens() {
  const [screen, setScreen] = useState("client");

  return (
    <div style={{ height: "100vh", fontFamily: sans, background: C.bg, color: C.text, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Screen nav tabs */}
      <div style={{ display: "flex", background: C.navy, padding: "0 16px", gap: 2, flexShrink: 0 }}>
        {[
          { id: "client", label: "Client detail" },
          { id: "quote", label: "Quote builder" },
          { id: "jobcard", label: "Job card" },
        ].map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} style={{
            padding: "10px 18px", fontSize: 13, fontWeight: screen === s.id ? 600 : 400,
            color: screen === s.id ? C.white : "#8899B3",
            background: screen === s.id ? C.navyLight : "transparent",
            border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0",
            fontFamily: sans,
          }}>{s.label}</button>
        ))}
      </div>

      {/* Screen content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {screen === "client" && <ClientDetail onNavigate={setScreen} />}
        {screen === "quote" && <QuoteBuilder onNavigate={setScreen} />}
        {screen === "jobcard" && <JobCard onNavigate={setScreen} />}
      </div>
    </div>
  );
}
