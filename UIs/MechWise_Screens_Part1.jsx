import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  navy: "#1B2A4A", navyLight: "#243656", navyDark: "#131E35",
  amber: "#E8920D", amberLight: "#FDF4E3", amberDark: "#B5710A",
  bg: "#F3F5F7", card: "#FFFFFF", border: "#E5E7EB", borderStrong: "#D1D5DB",
  text: "#1F2937", textSec: "#6B7280", textMuted: "#9CA3AF",
  success: "#059669", successBg: "#ECFDF5",
  danger: "#DC2626", dangerBg: "#FEF2F2",
  warning: "#D97706", warningBg: "#FFFBEB",
  info: "#2563EB", infoBg: "#EFF6FF",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
};
const mono = "'JetBrains Mono', 'SF Mono', monospace";
const sans = "'DM Sans', 'Inter', system-ui, sans-serif";

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
const Badge = ({ children, color = "gray", style = {} }) => {
  const colors = {
    green: { bg: C.successBg, text: C.success },
    red: { bg: C.dangerBg, text: C.danger },
    amber: { bg: C.warningBg, text: C.warning },
    blue: { bg: C.infoBg, text: C.info },
    purple: { bg: C.purpleBg, text: C.purple },
    gray: { bg: "#F3F4F6", text: C.textSec },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", ...style }}>{children}</span>
  );
};

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", style = {}, onClick, small }) => {
  const base = { border: "none", borderRadius: 8, fontFamily: sans, fontWeight: 600, cursor: "pointer", fontSize: small ? 12 : 13, padding: small ? "6px 12px" : "9px 18px" };
  const variants = {
    primary: { ...base, background: C.amber, color: "#fff" },
    secondary: { ...base, background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    ghost: { ...base, background: "transparent", color: C.textSec },
    danger: { ...base, background: C.dangerBg, color: C.danger },
    navy: { ...base, background: C.navy, color: "#fff" },
  };
  return <button onClick={onClick} style={{ ...variants[variant], ...style }}>{children}</button>;
};

const SectionTitle = ({ children, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
    <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>{children}</h3>
    {right}
  </div>
);

const ProgressBar = ({ pct, color = C.amber, h = 6 }) => (
  <div style={{ background: "#E5E7EB", borderRadius: h, height: h, width: "100%" }}>
    <div style={{ background: color, borderRadius: h, height: h, width: `${Math.min(pct, 100)}%`, transition: "width 0.3s" }} />
  </div>
);

const TabBar = ({ tabs, active, onSelect }) => (
  <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>
    {tabs.map(t => (
      <button key={t} onClick={() => onSelect(t)} style={{
        padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: active === t ? 600 : 400, fontFamily: sans,
        background: active === t ? C.card : "transparent", color: active === t ? C.text : C.textSec,
        border: active === t ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "all 0.15s",
      }}>{t}</button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════
const navItems = [
  { icon: "📊", label: "Dashboard", badge: null },
  { icon: "👥", label: "Clients", badge: null },
  { icon: "🚗", label: "Vehicles", badge: null },
  { icon: "🔧", label: "Job Cards", badge: 4 },
  { icon: "📄", label: "Invoices", badge: 2 },
  { icon: "🔔", label: "Reminders", badge: 8 },
  { icon: "📈", label: "Reports", badge: null },
  { icon: "⚙️", label: "Settings", badge: null },
];

const Sidebar = ({ active, onNav }) => (
  <div style={{ width: 220, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}>
    <div style={{ padding: "20px 16px 16px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>MECHWISE</div>
      <div style={{ fontSize: 11, color: C.amber, fontWeight: 500, marginTop: 2 }}>Workshop Management</div>
    </div>
    <div style={{ padding: "0 8px", flex: 1 }}>
      {navItems.map(n => (
        <div key={n.label} onClick={() => onNav(n.label)}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
            background: active === n.label ? C.navyLight : "transparent", transition: "background 0.15s",
          }}>
          <span style={{ fontSize: 16 }}>{n.icon}</span>
          <span style={{ fontSize: 13, fontWeight: active === n.label ? 600 : 400, color: active === n.label ? "#fff" : "rgba(255,255,255,0.7)", flex: 1 }}>{n.label}</span>
          {n.badge && <span style={{ background: C.amber, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{n.badge}</span>}
        </div>
      ))}
    </div>
    <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>TD</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Tinku Dhalla</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Owner</div>
        </div>
      </div>
    </div>
  </div>
);

const TopBar = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
    <h1 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h1>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative" }}>
        <input placeholder="Search rego, name, phone..." style={{ width: 260, padding: "8px 14px 8px 34px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: sans, outline: "none" }} />
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
      </div>
      <Btn small>＋ New job</Btn>
      <div style={{ position: "relative", cursor: "pointer" }}>
        <span style={{ fontSize: 18 }}>🔔</span>
        <span style={{ position: "absolute", top: -4, right: -6, background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10 }}>3</span>
      </div>
      <div style={{ fontSize: 12, color: C.textSec }}>Sat 9 Aug 2026</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: DASHBOARD
// ═══════════════════════════════════════════════════════════════
const revenueData = [
  { month: "Feb", rev: 18200 }, { month: "Mar", rev: 21400 }, { month: "Apr", rev: 19800 },
  { month: "May", rev: 24100 }, { month: "Jun", rev: 22600 }, { month: "Jul", rev: 26300 }, { month: "Aug", rev: 11400 },
];

const bayData = [
  { bay: "Bay 1 — Hoist", rego: "CK66YW", vehicle: "2020 Mazda CX-5", job: "Major Service", mechanic: "Baljit", status: "InProgress", pct: 65 },
  { bay: "Bay 2 — Hoist", rego: "BGX18S", vehicle: "2017 Subaru WRX", job: "Front Brake Repl.", mechanic: "Harman", status: "WaitingForParts", pct: 30 },
  { bay: "Bay 3 — Ground", rego: "YBI41V", vehicle: "2019 Toyota Camry", job: "Pink Slip", mechanic: "Baljit", status: "QC", pct: 90 },
  { bay: "Bay 4 — Tyre bay", rego: "", vehicle: "", job: "", mechanic: "", status: "Empty", pct: 0 },
];

const todaySchedule = [
  { time: "07:30", client: "Peter Morrison", rego: "NSW-PL1", job: "Minor Service", bay: "Bay 1", status: "Completed" },
  { time: "09:00", client: "Girish", rego: "CK66YW", job: "Major Service", bay: "Bay 1", status: "InProgress" },
  { time: "09:30", client: "Ravinder Kaur", rego: "BGX18S", job: "Front Brake Repl.", bay: "Bay 2", status: "WaitingForParts" },
  { time: "10:00", client: "Amit", rego: "YBI41V", job: "Pink Slip", bay: "Bay 3", status: "QC" },
  { time: "13:00", client: "Neeran", rego: "BX53KO", job: "Battery Replacement", bay: "Bay 1", status: "Booked" },
  { time: "14:30", client: "Rajiv", rego: "FCV93G", job: "Diagnostic Scan", bay: "Bay 3", status: "Booked" },
];

const statusColor = (s) => {
  const m = { Completed: "green", InProgress: "amber", WaitingForParts: "red", QC: "purple", Booked: "blue", Empty: "gray", Paid: "green", Unpaid: "amber", Overdue: "red" };
  return m[s] || "gray";
};
const statusLabel = (s) => {
  const m = { InProgress: "In Progress", WaitingForParts: "Waiting for Parts", ReadyForPickup: "Ready for Pickup" };
  return m[s] || s;
};

const DashboardScreen = () => (
  <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>Good morning, Tinku 👋</h2>
      <p style={{ fontSize: 13, color: C.textSec, margin: "4px 0 0" }}>Saturday 9 August 2026 · 3 active jobs · 2 booked today</p>
    </div>

    {/* KPI Cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      {[
        { label: "Today's Revenue", value: "$1,246", sub: "3 invoices", trend: "+12%", trendUp: true },
        { label: "Active Jobs", value: "4", sub: "2 in progress", trend: "", trendUp: true },
        { label: "Overdue Invoices", value: "2", sub: "$1,820 outstanding", trend: "", trendUp: false },
        { label: "Reminders Sent", value: "8", sub: "This week", trend: "3 booked", trendUp: true },
      ].map((k, i) => (
        <Card key={i}>
          <div style={{ fontSize: 12, color: C.textSec, fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: mono }}>{k.value}</span>
            {k.trend && <span style={{ fontSize: 11, fontWeight: 600, color: k.trendUp ? C.success : C.danger }}>{k.trend}</span>}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{k.sub}</div>
        </Card>
      ))}
    </div>

    {/* Two columns: Floor Board + Schedule */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
      {/* Floor Board */}
      <Card style={{ padding: 20 }}>
        <SectionTitle right={<Badge color="amber">LIVE</Badge>}>Workshop Floor Board</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bayData.map((b, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, background: b.status === "Empty" ? "#FAFAFA" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>{b.bay}</span>
                <Badge color={statusColor(b.status)}>{statusLabel(b.status)}</Badge>
              </div>
              {b.rego ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.navy, letterSpacing: "0.04em" }}>{b.rego}</span>
                    <span style={{ fontSize: 12, color: C.textSec }}>{b.vehicle}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.text, marginBottom: 6 }}>{b.job} · <span style={{ color: C.textSec }}>{b.mechanic}</span></div>
                  <ProgressBar pct={b.pct} color={b.status === "WaitingForParts" ? C.danger : C.amber} />
                </>
              ) : (
                <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>Available</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card style={{ padding: 20 }}>
        <SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>6 appointments</span>}>Today's Schedule</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {todaySchedule.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < todaySchedule.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.textSec, width: 42 }}>{s.time}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{s.client}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>{s.job} · {s.bay}</div>
              </div>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.navy, letterSpacing: "0.04em" }}>{s.rego}</span>
              <Badge color={statusColor(s.status)}>{statusLabel(s.status)}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Bottom Row: Alerts + Revenue Chart */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>
      <Card style={{ padding: 20 }}>
        <SectionTitle>Action Items</SectionTitle>
        {[
          { icon: "⚠️", text: "INV-0082 overdue — Peter Morrison — $420", color: C.danger },
          { icon: "⚠️", text: "INV-0085 overdue — Neeran — $1,400", color: C.danger },
          { icon: "🔔", text: "8 service reminders due this week", color: C.warning },
          { icon: "📋", text: "Pink slip expiring: BX53KO (12 days)", color: C.warning },
          { icon: "✅", text: "Bay 4 available — no bookings after 12pm", color: C.success },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <span style={{ fontSize: 12, color: a.color, fontWeight: 500 }}>{a.text}</span>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>Monthly target: $25,000</span>}>Revenue — Last 7 Months</SectionTitle>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} />
            <YAxis tick={{ fontSize: 11, fill: C.textSec }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="rev" fill={C.navy} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: C.textSec }}>Aug progress</span>
            <span style={{ fontFamily: mono, fontWeight: 600, color: C.text }}>$11,400 / $25,000</span>
          </div>
          <ProgressBar pct={45.6} color={C.amber} h={8} />
        </div>
      </Card>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 2: CLIENT DETAIL
// ═══════════════════════════════════════════════════════════════
const clientData = {
  name: "Peter Morrison", type: "Individual", phone: "0435 791 593", email: "peter.m@gmail.com",
  address: "12 Main Street, Kingswood NSW 2747", preferred: "SMS", since: "Mar 2019",
  vehicles: [
    { rego: "NSW-PL1", make: "Hyundai", model: "Tucson", year: 2017, fuel: "Diesel", trans: "Manual", km: 95200, nextService: "12/10/2026", pinkSlip: "28/02/2027", lastService: "12/04/2026" },
  ],
  stats: { totalSpend: 4820, visits: 14, avgSpend: 344, avgInterval: "5.2 months" },
  history: [
    { date: "12/04/2026", type: "Minor Service", rego: "NSW-PL1", amount: 169.40, status: "Paid", inv: "INV-0078" },
    { date: "08/10/2025", type: "Front Brake Repl. + Tyre Rotation", rego: "NSW-PL1", amount: 462.00, status: "Paid", inv: "INV-0065" },
    { date: "15/04/2025", type: "Major Service", rego: "NSW-PL1", amount: 385.00, status: "Paid", inv: "INV-0051" },
    { date: "02/11/2024", type: "Pink Slip + Minor Service", rego: "NSW-PL1", amount: 226.60, status: "Paid", inv: "INV-0038" },
    { date: "18/04/2024", type: "Minor Service", rego: "NSW-PL1", amount: 169.40, status: "Paid", inv: "INV-0024" },
  ],
};

const ClientDetailScreen = () => {
  const [selVehicle] = useState(0);
  const v = clientData.vehicles[selVehicle];
  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: C.textSec, cursor: "pointer" }}>← Clients</span>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>{clientData.name}</h2>
        <Badge color="green">Active</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Contact Card */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>PM</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{clientData.name}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>Customer since {clientData.since}</div>
              </div>
            </div>
            {[
              { icon: "📱", label: "Mobile", value: clientData.phone, mono: true },
              { icon: "✉️", label: "Email", value: clientData.email },
              { icon: "📍", label: "Address", value: clientData.address },
              { icon: "💬", label: "Preferred", value: clientData.preferred },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: C.text, fontFamily: f.mono ? mono : sans, fontWeight: f.mono ? 500 : 400 }}>{f.value}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn small variant="secondary" style={{ flex: 1 }}>Edit</Btn>
              <Btn small variant="secondary" style={{ flex: 1 }}>SMS</Btn>
              <Btn small style={{ flex: 1 }}>New quote</Btn>
            </div>
          </Card>

          {/* Vehicles */}
          <Card>
            <SectionTitle right={<Btn small variant="secondary">+ Add</Btn>}>Vehicles</SectionTitle>
            {clientData.vehicles.map((vh, i) => (
              <div key={i} style={{ border: `2px solid ${i === selVehicle ? C.amber : C.border}`, borderRadius: 8, padding: 12, cursor: "pointer", background: i === selVehicle ? C.amberLight : "#fff" }}>
                <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "0.04em" }}>{vh.rego}</div>
                <div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{vh.year} {vh.make} {vh.model}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>{vh.fuel} · {vh.trans} · <span style={{ fontFamily: mono }}>{vh.km.toLocaleString()} km</span></div>
              </div>
            ))}
          </Card>

          {/* Stats */}
          <Card>
            <SectionTitle>Customer Stats</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Total Spend", value: `$${clientData.stats.totalSpend.toLocaleString()}` },
                { label: "Visits", value: clientData.stats.visits },
                { label: "Avg Spend", value: `$${clientData.stats.avgSpend}` },
                { label: "Avg Interval", value: clientData.stats.avgInterval },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: mono }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <SectionTitle>Notes</SectionTitle>
            <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>Regular customer, always books minor service + pink slip together. Prefers Saturday mornings. Pays cash or EFTPOS. Wife's car (DYZ42P) also services here — check if linked.</div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Selected Vehicle Detail */}
          <Card style={{ padding: 20 }}>
            <SectionTitle>Vehicle Detail — <span style={{ fontFamily: mono, color: C.navy, letterSpacing: "0.04em" }}>{v.rego}</span></SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
              {[
                { label: "Make / Model", value: `${v.make} ${v.model}` },
                { label: "Year", value: v.year },
                { label: "Fuel", value: v.fuel },
                { label: "Transmission", value: v.trans },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{f.value}</div>
                </div>
              ))}
            </div>
            {/* Service status bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Next Service Due", value: v.nextService, icon: "🔧", color: C.info },
                { label: "Pink Slip Expiry", value: v.pinkSlip, icon: "📋", color: C.success },
                { label: "Last Service", value: v.lastService, icon: "✅", color: C.textSec },
              ].map((s, i) => (
                <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: C.text, marginTop: 4 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Service History */}
          <Card style={{ padding: 20 }}>
            <SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>{clientData.history.length} records</span>}>Service History</SectionTitle>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 2, background: C.border }} />
              {clientData.history.map((h, i) => (
                <div key={i} style={{ position: "relative", paddingBottom: 20, paddingLeft: 20 }}>
                  <div style={{ position: "absolute", left: -16, top: 8, width: 10, height: 10, borderRadius: "50%", background: i === 0 ? C.amber : C.border, border: "2px solid #fff" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{h.type}</div>
                      <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>
                        <span style={{ fontFamily: mono, fontSize: 11 }}>{h.date}</span> · <span style={{ fontFamily: mono, fontSize: 11, color: C.navy }}>{h.rego}</span> · <span style={{ fontFamily: mono, fontSize: 11 }}>{h.inv}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600, color: C.text }}>${h.amount.toFixed(2)}</div>
                      <Badge color={statusColor(h.status)}>{h.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 3: JOB CARD
// ═══════════════════════════════════════════════════════════════
const jobStatuses = ["Booked", "Waiting", "InProgress", "WaitingForParts", "QC", "ReadyForPickup", "Completed"];
const jobLines = [
  { desc: "Engine oil change (10W-40 semi-synthetic 5L)", type: "Labour + Part", est: 0.3, actual: 0.3, price: 74.00, completed: true },
  { desc: "Oil filter replacement (Z432)", type: "Part", est: 0.1, actual: 0.1, price: 18.00, completed: true },
  { desc: "Engine flush additive", type: "Part", est: 0.1, actual: 0.1, price: 28.00, completed: true },
  { desc: "Air filter replacement (A1215)", type: "Part", est: 0.15, actual: 0.2, price: 55.00, completed: true },
  { desc: "Cabin filter replacement", type: "Part", est: 0.15, actual: 0.0, price: 40.00, completed: false },
  { desc: "Spark plug replacement (×4)", type: "Labour + Part", est: 0.5, actual: 0.0, price: 52.00, completed: false },
  { desc: "25-point safety inspection", type: "Labour", est: 0.5, actual: 0.0, price: 40.00, completed: false },
  { desc: "Brake fluid top-up & bleed", type: "Labour + Part", est: 0.3, actual: 0.0, price: 63.00, completed: false },
];

const JobCardScreen = () => {
  const [status, setStatus] = useState("InProgress");
  const [items, setItems] = useState(jobLines);
  const completedCount = items.filter(l => l.completed).length;
  const pct = (completedCount / items.length) * 100;
  const totalExGst = items.reduce((s, l) => s + l.price, 0);
  const gst = Math.round(totalExGst * 0.10 * 100) / 100;

  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: C.textSec, cursor: "pointer" }}>← Job Cards</span>
        <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy }}>JC-0089</span>
        <Badge color={statusColor(status)}>{statusLabel(status)}</Badge>
        <Badge color="amber">Normal Priority</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Status lifecycle */}
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {jobStatuses.map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, fontFamily: sans, cursor: "pointer",
                  background: status === s ? (statusColor(s) === "amber" ? C.warningBg : statusColor(s) === "green" ? C.successBg : statusColor(s) === "red" ? C.dangerBg : statusColor(s) === "purple" ? C.purpleBg : C.infoBg) : "#F3F4F6",
                  color: status === s ? (statusColor(s) === "amber" ? C.warning : statusColor(s) === "green" ? C.success : statusColor(s) === "red" ? C.danger : statusColor(s) === "purple" ? C.purple : C.info) : C.textMuted,
                  border: status === s ? `2px solid currentColor` : "2px solid transparent",
                }}>
                  {statusLabel(s)}
                </button>
              ))}
            </div>
          </Card>

          {/* Progress */}
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Work progress</span>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.amber }}>{completedCount}/{items.length} items</span>
            </div>
            <ProgressBar pct={pct} color={C.amber} h={10} />
          </Card>

          {/* Work Items Checklist */}
          <Card style={{ padding: 20 }}>
            <SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>Major Service</span>}>Work Items</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div onClick={() => {
                    const n = [...items]; n[i] = { ...n[i], completed: !n[i].completed }; setItems(n);
                  }} style={{
                    width: 28, height: 28, borderRadius: 6, border: `2px solid ${item.completed ? C.success : C.border}`,
                    background: item.completed ? C.successBg : "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.success, flexShrink: 0,
                  }}>
                    {item.completed && "✓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: item.completed ? C.textSec : C.text, textDecoration: item.completed ? "line-through" : "none" }}>{item.desc}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{item.type} · Est: {item.est}hr · Actual: <span style={{ fontFamily: mono, color: item.actual > item.est ? C.danger : C.text }}>{item.actual}hr</span></div>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 600, color: C.text }}>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Job Details</SectionTitle>
            {[
              { label: "Quote", value: "QT-0042", mono: true },
              { label: "Client", value: "Girish" },
              { label: "Vehicle", value: "CK66YW", mono: true },
              { label: "Make/Model", value: "2020 Mazda CX-5" },
              { label: "Mileage In", value: "45,230 km", mono: true },
              { label: "Mechanic", value: "Baljit Gugu" },
              { label: "Bay", value: "Bay 1 — Hoist" },
              { label: "Date In", value: "09/08/2026", mono: true },
              { label: "Due", value: "09/08/2026", mono: true },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.textSec }}>{f.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: f.mono ? mono : sans }}>{f.value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <SectionTitle>Financial Summary</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.textSec }}>Subtotal (ex-GST)</span>
                <span style={{ fontFamily: mono, fontWeight: 500 }}>${totalExGst.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.textSec }}>GST (10%)</span>
                <span style={{ fontFamily: mono, fontWeight: 500 }}>${gst.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, paddingTop: 8, borderTop: `2px solid ${C.navy}`, marginTop: 4 }}>
                <span>Total inc GST</span>
                <span style={{ fontFamily: mono, color: C.navy }}>${(totalExGst + gst).toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: C.textSec }}>
              <span>Est. hours</span>
              <span style={{ fontFamily: mono }}>2.1 hr</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSec }}>
              <span>Actual hours</span>
              <span style={{ fontFamily: mono, color: C.warning }}>0.7 hr</span>
            </div>
          </Card>

          <Card>
            <SectionTitle>Next Service</SectionTitle>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>Auto-calculated on completion:</div>
            <div style={{ fontSize: 13 }}>📅 <span style={{ fontFamily: mono }}>09/02/2027</span> (6 months)</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>📏 <span style={{ fontFamily: mono }}>55,230 km</span> (+10,000 km)</div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Btn variant="navy" style={{ width: "100%" }}>✓ Complete → Generate Invoice</Btn>
            <Btn variant="secondary" style={{ width: "100%" }}>Add Supplementary Quote</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 4: INVOICE
// ═══════════════════════════════════════════════════════════════
const invoiceLines = [
  { desc: "Engine oil change (10W-40 semi-synthetic 5L)", qty: 1, unit: 74.00 },
  { desc: "Oil filter replacement (Z432)", qty: 1, unit: 18.00 },
  { desc: "Engine flush additive", qty: 1, unit: 28.00 },
  { desc: "Air filter replacement (A1215)", qty: 1, unit: 55.00 },
  { desc: "Cabin filter replacement", qty: 1, unit: 40.00 },
  { desc: "Spark plug replacement (×4)", qty: 4, unit: 8.00 },
  { desc: "25-point safety inspection", qty: 1, unit: 40.00 },
  { desc: "Brake fluid top-up & bleed", qty: 1, unit: 63.00 },
];

const InvoiceScreen = () => {
  const subtotal = invoiceLines.reduce((s, l) => s + l.qty * l.unit, 0);
  const gst = Math.round(subtotal * 0.10 * 100) / 100;
  const total = subtotal + gst;

  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: C.textSec, cursor: "pointer" }}>← Invoices</span>
        <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy }}>INV-0089</span>
        <Badge color="amber">Unpaid</Badge>
        <div style={{ flex: 1 }} />
        <Btn small variant="secondary">📧 Email</Btn>
        <Btn small variant="secondary">⬇ PDF</Btn>
        <Btn small>💳 Record Payment</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Invoice Document */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {/* Navy Header */}
          <div style={{ background: C.navy, padding: "24px 28px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Dhalla Automotive Pty Ltd</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>70A Cox Avenue, Kingswood NSW 2747</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Ph: 0247 082 717 · Mob: 0430 050 714</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>dhallaautomotive@yahoo.com.au</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>TAX INVOICE</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>ABN: <span style={{ fontFamily: mono }}>95 611 566 888</span></div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>MVRL: <span style={{ fontFamily: mono }}>54657</span></div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>ARC: <span style={{ fontFamily: mono }}>AU44775</span></div>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 28px" }}>
            {/* Invoice meta */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Bill to</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 4 }}>Girish</div>
                <div style={{ fontSize: 12, color: C.textSec }}>0424 756 356</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Vehicle</div>
                <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy, marginTop: 4, letterSpacing: "0.04em" }}>CK66YW</div>
                <div style={{ fontSize: 12, color: C.textSec }}>2020 Mazda CX-5 · Diesel · Auto</div>
                <div style={{ fontSize: 12, color: C.textSec }}>Odometer: <span style={{ fontFamily: mono }}>45,230 km</span></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: C.textSec }}>Invoice: <span style={{ fontFamily: mono, fontWeight: 600, color: C.text }}>INV-0089</span></div>
                <div style={{ fontSize: 12, color: C.textSec }}>Job Card: <span style={{ fontFamily: mono, fontWeight: 600, color: C.text }}>JC-0089</span></div>
                <div style={{ fontSize: 12, color: C.textSec }}>Date: <span style={{ fontFamily: mono }}>09/08/2026</span></div>
                <div style={{ fontSize: 12, color: C.textSec }}>Due: <span style={{ fontFamily: mono }}>23/08/2026</span></div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
              <thead>
                <tr style={{ background: C.navy }}>
                  {["#", "Description", "Qty", "Unit Price", "Amount"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#fff", textAlign: i > 1 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceLines.map((l, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: C.textSec }}>{i + 1}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: C.text }}>{l.desc}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "right", fontFamily: mono }}>{l.qty}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "right", fontFamily: mono }}>${l.unit.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "right", fontFamily: mono, fontWeight: 500 }}>${(l.qty * l.unit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 240 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>Subtotal (ex-GST)</span>
                  <span style={{ fontFamily: mono }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: C.textSec }}>GST (10%)</span>
                  <span style={{ fontFamily: mono }}>${gst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 18, fontWeight: 700, borderTop: `2px solid ${C.navy}`, marginTop: 4 }}>
                  <span>Total inc GST</span>
                  <span style={{ fontFamily: mono, color: C.navy }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16 }}>
              <div style={{ fontSize: 12, color: C.textSec }}>🔧 Next service due: <span style={{ fontFamily: mono, fontWeight: 500 }}>09/02/2027</span> or at <span style={{ fontFamily: mono, fontWeight: 500 }}>55,230 km</span></div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>Thank you for choosing Dhalla Automotive!</div>
            </div>
          </div>
        </Card>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Payment Status</SectionTitle>
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 32, fontFamily: mono, fontWeight: 700, color: C.warning }}>${total.toFixed(2)}</div>
              <Badge color="amber" style={{ marginTop: 8 }}>UNPAID</Badge>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 8 }}>Due: <span style={{ fontFamily: mono }}>23/08/2026</span></div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Linked Records</SectionTitle>
            {[
              { label: "Quote", value: "QT-0042" },
              { label: "Job Card", value: "JC-0089" },
              { label: "Client", value: "Girish" },
              { label: "Vehicle", value: "CK66YW" },
              { label: "Mechanic", value: "Baljit Gugu" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.textSec }}>{f.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.info, cursor: "pointer" }}>{f.value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <SectionTitle>Reminder</SectionTitle>
            <div style={{ fontSize: 12, color: C.textSec }}>Auto-created for <span style={{ fontFamily: mono }}>CK66YW</span></div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>Type: <Badge color="blue">Next Service</Badge></div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>Due: <span style={{ fontFamily: mono }}>09/02/2027</span></div>
          </Card>

          <Btn variant="danger" style={{ width: "100%" }}>Void Invoice</Btn>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════
const screens = { Dashboard: DashboardScreen, Clients: ClientDetailScreen, "Job Cards": JobCardScreen, Invoices: InvoiceScreen };
const screenTitles = { Dashboard: "Dashboard", Clients: "Client Detail", "Job Cards": "Job Card — JC-0089", Invoices: "Invoice — INV-0089" };

export default function MechWiseApp() {
  const [screen, setScreen] = useState("Dashboard");
  const Screen = screens[screen] || DashboardScreen;
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: sans, background: C.bg }}>
      <Sidebar active={screen} onNav={setScreen} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title={screenTitles[screen] || screen} />
        <Screen />
      </div>
    </div>
  );
}
