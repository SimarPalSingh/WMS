import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

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

const Badge = ({ children, color = "gray", style = {} }) => {
  const colors = {
    green: { bg: C.successBg, text: C.success }, red: { bg: C.dangerBg, text: C.danger },
    amber: { bg: C.warningBg, text: C.warning }, blue: { bg: C.infoBg, text: C.info },
    purple: { bg: C.purpleBg, text: C.purple }, gray: { bg: "#F3F4F6", text: C.textSec },
  };
  const c = colors[color] || colors.gray;
  return <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", ...style }}>{children}</span>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>
);

const Btn = ({ children, variant = "primary", style = {}, onClick, small }) => {
  const base = { border: "none", borderRadius: 8, fontFamily: sans, fontWeight: 600, cursor: "pointer", fontSize: small ? 12 : 13, padding: small ? "6px 12px" : "9px 18px" };
  const variants = {
    primary: { ...base, background: C.amber, color: "#fff" },
    secondary: { ...base, background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    ghost: { ...base, background: "transparent", color: C.textSec },
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

// Sidebar + TopBar (compact for Part 2)
const navItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "👥", label: "Clients" }, { icon: "🚗", label: "Vehicles" },
  { icon: "🔧", label: "Job Cards", badge: 4 }, { icon: "📄", label: "Invoices", badge: 2 },
  { icon: "🔔", label: "Reminders", badge: 8 }, { icon: "📈", label: "Reports" }, { icon: "⚙️", label: "Settings" },
];

const Sidebar = ({ active, onNav }) => (
  <div style={{ width: 220, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}>
    <div style={{ padding: "20px 16px 16px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>MECHWISE</div>
      <div style={{ fontSize: 11, color: C.amber, fontWeight: 500, marginTop: 2 }}>Workshop Management</div>
    </div>
    <div style={{ padding: "0 8px", flex: 1 }}>
      {navItems.map(n => (
        <div key={n.label} onClick={() => onNav(n.label)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
          background: active === n.label ? C.navyLight : "transparent",
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
        <div><div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Tinku Dhalla</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Owner</div></div>
      </div>
    </div>
  </div>
);

const TopBar = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
    <h1 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h1>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input placeholder="Search rego, name, phone..." style={{ width: 260, padding: "8px 14px 8px 34px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: sans, outline: "none" }} />
      <Btn small>＋ New job</Btn>
      <div style={{ fontSize: 12, color: C.textSec }}>Sat 9 Aug 2026</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 5: REMINDERS
// ═══════════════════════════════════════════════════════════════
const reminderData = [
  { client: "Peter Morrison", phone: "0435 791 593", rego: "NSW-PL1", vehicle: "2017 Hyundai Tucson", type: "Next Service", due: "12/10/2026", sends: 0, status: "Pending", daysUntil: 64 },
  { client: "Amit", phone: "0401 340 890", rego: "YBI41V", vehicle: "2019 Toyota Camry", type: "Next Service", due: "15/09/2026", sends: 1, status: "Sent", daysUntil: 37 },
  { client: "Neeran", phone: "0421 565 468", rego: "BX53KO", vehicle: "2013 Holden Commodore", type: "Pink Slip", due: "22/08/2026", sends: 2, status: "Sent", daysUntil: 13 },
  { client: "Ravinder Kaur", phone: "—", rego: "BGX18S", vehicle: "2017 Subaru WRX", type: "Next Service", due: "01/08/2026", sends: 0, status: "Pending", daysUntil: -8 },
  { client: "Manmeet Singh", phone: "0468 312 445", rego: "CJO67Q", vehicle: "2016 Toyota HiLux", type: "Next Service", due: "20/07/2026", sends: 3, status: "Sent", daysUntil: -20 },
  { client: "Satnam Randhawa", phone: "0432 876 543", rego: "YHU72U", vehicle: "2020 Toyota HiLux", type: "Next Service", due: "01/11/2026", sends: 0, status: "Booked", daysUntil: 84 },
  { client: "Sukhm Kamboj", phone: "0432 981 553", rego: "ZLF882", vehicle: "2020 Mazda 3", type: "Next Service", due: "25/09/2026", sends: 1, status: "Sent", daysUntil: 47 },
  { client: "Rajiv", phone: "0401 324 155", rego: "FCV93G", vehicle: "2018 Ford Ranger", type: "Pink Slip", due: "05/09/2026", sends: 0, status: "Pending", daysUntil: 27 },
];

const ReminderScreen = () => {
  const [tab, setTab] = useState("Due Soon");
  const [selected, setSelected] = useState(new Set());
  const tabs = ["Due Soon", "Overdue", "No Contact", "Booked", "All"];

  const filtered = reminderData.filter(r => {
    if (tab === "Due Soon") return r.daysUntil > 0 && r.daysUntil <= 60 && r.status !== "Booked";
    if (tab === "Overdue") return r.daysUntil < 0;
    if (tab === "No Contact") return r.phone === "—";
    if (tab === "Booked") return r.status === "Booked";
    return true;
  });

  const toggleSelect = (i) => {
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      {/* KPI Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Due This Week", value: "3", color: C.info },
          { label: "Due This Month", value: "5", color: C.warning },
          { label: "Overdue", value: "2", color: C.danger },
          { label: "Awaiting Reply", value: "4", color: C.textSec },
          { label: "Booked", value: "1", color: C.success },
          { label: "No Contact", value: "1", color: C.danger },
        ].map((k, i) => (
          <Card key={i} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: mono, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs + bulk action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(new Set()); }} style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: tab === t ? 600 : 400, fontFamily: sans,
              background: tab === t ? C.card : "transparent", color: tab === t ? C.text : C.textSec,
              border: tab === t ? `1px solid ${C.border}` : "none", cursor: "pointer",
            }}>{t}{t === "Overdue" ? ` (2)` : t === "Booked" ? ` (1)` : ""}</button>
          ))}
        </div>
        {selected.size > 0 && (
          <Btn small>📱 Send to {selected.size} selected</Btn>
        )}
      </div>

      {/* Reminders Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.navy }}>
              <th style={{ padding: "10px 12px", textAlign: "left", width: 40 }}>
                <input type="checkbox" style={{ accentColor: C.amber }} onChange={e => {
                  if (e.target.checked) setSelected(new Set(filtered.map((_, i) => i)));
                  else setSelected(new Set());
                }} />
              </th>
              {["Client", "Vehicle", "Type", "Due Date", "Days", "Sends", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#fff", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: selected.has(i) ? C.amberLight : "#fff" }}>
                <td style={{ padding: "10px 12px" }}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ accentColor: C.amber }} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{r.client}</div>
                  <div style={{ fontSize: 11, fontFamily: mono, color: r.phone === "—" ? C.danger : C.textSec }}>{r.phone}</div>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.navy, letterSpacing: "0.04em" }}>{r.rego}</div>
                  <div style={{ fontSize: 11, color: C.textSec }}>{r.vehicle}</div>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge color={r.type === "Pink Slip" ? "purple" : "blue"}>{r.type}</Badge>
                </td>
                <td style={{ padding: "10px 12px", fontFamily: mono, fontSize: 12 }}>{r.due}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: r.daysUntil < 0 ? C.danger : r.daysUntil <= 14 ? C.warning : C.text }}>
                    {r.daysUntil < 0 ? `${Math.abs(r.daysUntil)}d overdue` : `${r.daysUntil}d`}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: C.textSec }}>{r.sends}×</span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge color={r.status === "Booked" ? "green" : r.status === "Sent" ? "blue" : "gray"}>{r.status}</Badge>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {r.phone === "—" ? (
                    <Btn small variant="secondary">+ Add phone</Btn>
                  ) : r.status === "Booked" ? (
                    <span style={{ fontSize: 12, color: C.success }}>✓ Booked</span>
                  ) : (
                    <Btn small variant="secondary">📱 Send</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 6: REPORTS
// ═══════════════════════════════════════════════════════════════
const revenueMonthly = [
  { month: "Jan", rev: 19200, exp: 8100 }, { month: "Feb", rev: 18200, exp: 7600 },
  { month: "Mar", rev: 21400, exp: 8900 }, { month: "Apr", rev: 19800, exp: 8200 },
  { month: "May", rev: 24100, exp: 9500 }, { month: "Jun", rev: 22600, exp: 8800 },
  { month: "Jul", rev: 26300, exp: 10200 },
];

const jobTypeData = [
  { name: "Minor Service", value: 35, revenue: 23100, color: C.navy },
  { name: "Major Service", value: 18, revenue: 31500, color: C.amber },
  { name: "Brake Replacement", value: 15, revenue: 21000, color: C.info },
  { name: "Pink Slip", value: 12, revenue: 3120, color: C.purple },
  { name: "Tyre Replacement", value: 8, revenue: 16000, color: C.success },
  { name: "Diagnostic", value: 7, revenue: 2800, color: C.textSec },
  { name: "Other", value: 5, revenue: 4580, color: C.border },
];

const mechanicData = [
  { name: "Baljit Gugu", jobs: 42, billedHrs: 84, actualHrs: 72, efficiency: 117, revenue: 38200 },
  { name: "Harman", jobs: 35, billedHrs: 68, actualHrs: 65, efficiency: 105, revenue: 29400 },
  { name: "Manveer Singh", jobs: 28, billedHrs: 52, actualHrs: 55, efficiency: 95, revenue: 22800 },
  { name: "Ash (Apprentice)", jobs: 15, billedHrs: 24, actualHrs: 30, efficiency: 80, revenue: 8600 },
];

const topCustomers = [
  { name: "Kang & Gill Investments", visits: 22, spend: 12400, last: "02/08/2026" },
  { name: "Peter Morrison", visits: 14, spend: 4820, last: "12/04/2026" },
  { name: "Satnam Randhawa", visits: 11, spend: 4200, last: "18/06/2026" },
  { name: "Neeran", visits: 9, spend: 3850, last: "25/05/2026" },
  { name: "Girish", visits: 8, spend: 3100, last: "09/08/2026" },
];

const ReportsScreen = () => {
  const [period, setPeriod] = useState("Month");
  const totalRev = revenueMonthly.reduce((s, r) => s + r.rev, 0);
  const totalExp = revenueMonthly.reduce((s, r) => s + r.exp, 0);

  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      {/* Period selector + KPIs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>
          {["Week", "Month", "Quarter", "Year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: period === p ? 600 : 400, fontFamily: sans,
              background: period === p ? C.card : "transparent", color: period === p ? C.text : C.textSec,
              border: period === p ? `1px solid ${C.border}` : "none", cursor: "pointer",
            }}>{p}</button>
          ))}
        </div>
        <Btn small variant="secondary">⬇ Export CSV</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Revenue", value: `$${(totalRev / 1000).toFixed(1)}k`, trend: "+16%", up: true },
          { label: "Expenses", value: `$${(totalExp / 1000).toFixed(1)}k`, trend: "+8%", up: false },
          { label: "Gross Profit", value: `$${((totalRev - totalExp) / 1000).toFixed(1)}k`, trend: "+22%", up: true },
          { label: "Jobs Completed", value: "120", trend: "+12", up: true },
          { label: "Avg Invoice", value: "$342", trend: "+$18", up: true },
        ].map((k, i) => (
          <Card key={i}>
            <div style={{ fontSize: 12, color: C.textSec }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: mono, color: C.text, marginTop: 2 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.up ? C.success : C.danger, fontWeight: 600, marginTop: 2 }}>{k.up ? "↑" : "↓"} {k.trend}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card style={{ padding: 20 }}>
          <SectionTitle>Revenue vs Expenses — Last 7 Months</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueMonthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} />
              <YAxis tick={{ fontSize: 11, fill: C.textSec }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="rev" fill={C.navy} radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="exp" fill={C.border} radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20 }}>
          <SectionTitle>Revenue by Service Type</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={jobTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                    {jobTypeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {jobTypeData.slice(0, 5).map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontFamily: mono, color: C.textSec }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Mechanic Productivity + Top Customers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 20 }}>
          <SectionTitle>Mechanic Productivity</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Mechanic", "Jobs", "Billed", "Actual", "Eff %", "Revenue"].map(h => (
                  <th key={h} style={{ padding: "8px 8px", fontSize: 11, fontWeight: 600, color: C.textSec, textAlign: "left", borderBottom: `2px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mechanicData.map((m, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 8px", fontSize: 13, fontWeight: 500 }}>{m.name}</td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12 }}>{m.jobs}</td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12 }}>{m.billedHrs}hr</td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12 }}>{m.actualHrs}hr</td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: m.efficiency >= 100 ? C.success : m.efficiency >= 90 ? C.warning : C.danger }}>
                      {m.efficiency}%
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12, fontWeight: 600 }}>${m.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card style={{ padding: 20 }}>
          <SectionTitle>Top Customers</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Customer", "Visits", "Total Spend", "Last Visit"].map(h => (
                  <th key={h} style={{ padding: "8px 8px", fontSize: 11, fontWeight: 600, color: C.textSec, textAlign: "left", borderBottom: `2px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 8px", fontSize: 13, fontWeight: 500, color: C.text }}>{c.name}</td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12 }}>{c.visits}</td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 12, fontWeight: 600 }}>${c.spend.toLocaleString()}</td>
                  <td style={{ padding: "10px 8px", fontFamily: mono, fontSize: 11, color: C.textSec }}>{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 7: SETTINGS
// ═══════════════════════════════════════════════════════════════
const settingsSections = ["Business Details", "Invoicing", "Pricing", "SMS / Email", "Reminder Cadence", "Users & Roles", "Subscription", "Branding"];

const SettingsScreen = () => {
  const [section, setSection] = useState("Business Details");

  const Input = ({ label, value, mono: isMono, wide }) => (
    <div style={{ marginBottom: 16, flex: wide ? 1 : undefined }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: C.textSec, marginBottom: 4, display: "block" }}>{label}</label>
      <input defaultValue={value} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: isMono ? mono : sans, outline: "none" }} />
    </div>
  );

  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        {/* Settings sidebar */}
        <Card style={{ padding: 8, alignSelf: "flex-start" }}>
          {settingsSections.map(s => (
            <div key={s} onClick={() => setSection(s)} style={{
              padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
              fontWeight: section === s ? 600 : 400, color: section === s ? C.amber : C.text,
              background: section === s ? C.amberLight : "transparent",
            }}>{s}</div>
          ))}
        </Card>

        {/* Settings content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {section === "Business Details" && (
            <>
              <Card style={{ padding: 20 }}>
                <SectionTitle>Workshop Information</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Input label="Business Name" value="Dhalla Automotive Pty Ltd" />
                  <Input label="ABN" value="95 611 566 888" mono />
                  <Input label="MVRL Number" value="54657" mono />
                  <Input label="ARC Number" value="AU44775" mono />
                  <Input label="Phone" value="0247 082 717" mono />
                  <Input label="Mobile" value="0430 050 714" mono />
                  <Input label="Email" value="dhallaautomotive@yahoo.com.au" />
                  <Input label="Website" value="" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginTop: 0 }}>
                  <Input label="Street Address" value="70A Cox Avenue" />
                  <Input label="Suburb" value="Kingswood" />
                  <Input label="Postcode" value="2747" mono />
                </div>
              </Card>
              <Card style={{ padding: 20 }}>
                <SectionTitle>Operating Hours</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
                  {[
                    { day: "Mon", open: "07:30", close: "17:00" }, { day: "Tue", open: "07:30", close: "17:00" },
                    { day: "Wed", open: "07:30", close: "17:00" }, { day: "Thu", open: "07:30", close: "17:00" },
                    { day: "Fri", open: "07:30", close: "17:00" }, { day: "Sat", open: "08:00", close: "13:00" },
                  ].map(d => (
                    <div key={d.day} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>{d.day}</div>
                      <div style={{ fontSize: 11, fontFamily: mono, color: C.textSec }}>{d.open}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>to</div>
                      <div style={{ fontSize: 11, fontFamily: mono, color: C.textSec }}>{d.close}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Btn variant="secondary">Cancel</Btn>
                <Btn>Save Changes</Btn>
              </div>
            </>
          )}
          {section === "SMS / Email" && (
            <>
              <Card style={{ padding: 20 }}>
                <SectionTitle right={<Badge color="green">Active</Badge>}>SMS Configuration</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Input label="SMS Sender Name (max 11 chars)" value="Dhalla Auto" />
                  <div />
                  <Input label="Send Window Start (ACMA 9am-8pm)" value="09:00" mono />
                  <Input label="Send Window End" value="20:00" mono />
                </div>
                <div style={{ background: C.infoBg, border: `1px solid ${C.info}20`, borderRadius: 8, padding: 12, marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: C.info, fontWeight: 600 }}>📋 ACMA Compliance</div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>All messages include "Reply STOP to opt out". Max 1 SMS per customer per week. Send only between configured hours.</div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.textSec }}>SMS usage this month</span>
                    <span style={{ fontFamily: mono, fontWeight: 600 }}>142 / 500</span>
                  </div>
                  <ProgressBar pct={28.4} color={C.info} h={8} />
                </div>
              </Card>
              <Card style={{ padding: 20 }}>
                <SectionTitle>Message Templates</SectionTitle>
                {[
                  { name: "Service Reminder", template: "Hi {name}, your {vehicle} ({rego}) is due for a service on {date}. Book now at Dhalla Automotive: {link}. Reply STOP to opt out." },
                  { name: "Pink Slip Reminder", template: "Hi {name}, the pink slip for {rego} expires on {date}. Book your e-safety inspection at Dhalla Automotive. Reply STOP to opt out." },
                  { name: "Appointment Confirmation", template: "Hi {name}, your booking is confirmed: {date} at {time} for {rego}. See you at Dhalla Automotive! Reply C to confirm, R to reschedule." },
                ].map((t, i) => (
                  <div key={i} style={{ marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</span>
                      <Btn small variant="ghost">Edit</Btn>
                    </div>
                    <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, fontSize: 12, color: C.textSec, lineHeight: 1.6, fontFamily: mono }}>{t.template}</div>
                  </div>
                ))}
              </Card>
            </>
          )}
          {section !== "Business Details" && section !== "SMS / Email" && (
            <Card style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{section}</div>
              <div style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>Configuration panel for {section.toLowerCase()}.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 8: CUSTOMER PORTAL
// ═══════════════════════════════════════════════════════════════
const portalHistory = [
  { date: "12/04/2026", type: "Minor Service", items: "Oil change, filter, safety check", cost: 169.40, inv: "INV-0078" },
  { date: "08/10/2025", type: "Front Brake Repl. + Tyre Rotation", items: "Front pads, disc machining, tyre rotation", cost: 462.00, inv: "INV-0065" },
  { date: "15/04/2025", type: "Major Service", items: "Full service, spark plugs, all filters", cost: 385.00, inv: "INV-0051" },
  { date: "02/11/2024", type: "Pink Slip + Minor Service", items: "E-safety inspection, oil change", cost: 226.60, inv: "INV-0038" },
];

const CustomerPortalScreen = () => (
  <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans }}>
    {/* Portal Header */}
    <div style={{ background: C.navy, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Dhalla Automotive Pty Ltd</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>70A Cox Avenue, Kingswood NSW 2747 · 0247 082 717</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Welcome, Peter</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Customer Portal</div>
      </div>
    </div>

    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
      {/* Vehicle selector */}
      <Card style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>Your vehicle:</div>
          <div style={{ border: `2px solid ${C.amber}`, borderRadius: 8, padding: "8px 16px", background: C.amberLight }}>
            <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "0.04em" }}>NSW-PL1</span>
            <span style={{ fontSize: 13, color: C.textSec, marginLeft: 12 }}>2017 Hyundai Tucson</span>
          </div>
        </div>
      </Card>

      {/* Status cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { icon: "🔧", label: "Next Service Due", value: "12/10/2026", sub: "or at 105,200 km", color: C.info },
          { icon: "📋", label: "Pink Slip Expiry", value: "28/02/2027", sub: "Valid for 6 months", color: C.success },
          { icon: "📅", label: "Total Visits", value: "14", sub: "Since March 2019", color: C.purple },
        ].map((s, i) => (
          <Card key={i} style={{ borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 12, color: C.textSec }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, color: C.text, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Book Now CTA */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 12, padding: "24px 28px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Ready for your next service?</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Book online and we'll confirm within 2 hours.</div>
        </div>
        <button style={{ background: C.amber, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: sans }}>📅 Book Now</button>
      </div>

      {/* Last visit recommendation */}
      <Card style={{ padding: 16, marginBottom: 20, background: C.amberLight, borderColor: C.amber }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Recommendation from your last visit</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Baljit noted: "Rear brake pads worn to ~40%. Will need replacing in the next 10,000 km or by October 2026."</div>
          </div>
        </div>
      </Card>

      {/* Service History */}
      <Card style={{ padding: 20 }}>
        <SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>{portalHistory.length} records</span>}>Service History</SectionTitle>
        {portalHistory.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: i < portalHistory.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: i === 0 ? C.amberLight : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {h.type.includes("Pink") ? "📋" : "🔧"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{h.type}</div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{h.items}</div>
              <div style={{ fontSize: 11, fontFamily: mono, color: C.textMuted, marginTop: 2 }}>{h.date} · {h.inv}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.text }}>${h.cost.toFixed(2)}</div>
              <button style={{ fontSize: 12, color: C.info, background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontWeight: 500, marginTop: 4 }}>⬇ Invoice PDF</button>
            </div>
          </div>
        ))}
      </Card>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
        <div style={{ fontSize: 12, color: C.textMuted }}>Dhalla Automotive Pty Ltd · ABN 95 611 566 888 · 70A Cox Avenue, Kingswood NSW 2747</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>📞 0247 082 717 · 📱 0430 050 714 · dhallaautomotive@yahoo.com.au</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>Powered by <span style={{ fontWeight: 700, color: C.amber }}>MECHWISE</span></div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════
const screens = { Reminders: ReminderScreen, Reports: ReportsScreen, Settings: SettingsScreen, Portal: CustomerPortalScreen };

export default function MechWisePart2() {
  const [screen, setScreen] = useState("Reminders");

  // Customer portal has its own layout
  if (screen === "Portal") return <CustomerPortalScreen />;

  const Screen = screens[screen] || ReminderScreen;
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: sans, background: C.bg }}>
      <Sidebar active={screen} onNav={s => setScreen(s === "Settings" ? "Settings" : s)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title={screen} />
        <Screen />
      </div>
      {/* Portal toggle */}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 100 }}>
        <div style={{ display: "flex", gap: 4, background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {["Reminders", "Reports", "Settings", "Portal"].map(s => (
            <button key={s} onClick={() => setScreen(s)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: screen === s ? 600 : 400,
              background: screen === s ? C.navy : "transparent", color: screen === s ? "#fff" : C.textSec,
              border: "none", cursor: "pointer", fontFamily: sans,
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
