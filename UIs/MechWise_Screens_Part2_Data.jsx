import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const C = { navy: "#1B2A4A", navyLight: "#243656", amber: "#E8920D", amberLight: "#FDF4E3", bg: "#F3F5F7", card: "#FFFFFF", border: "#E5E7EB", text: "#1F2937", textSec: "#6B7280", textMuted: "#9CA3AF", success: "#059669", successBg: "#ECFDF5", danger: "#DC2626", dangerBg: "#FEF2F2", warning: "#D97706", warningBg: "#FFFBEB", info: "#2563EB", infoBg: "#EFF6FF", purple: "#7C3AED", purpleBg: "#F5F3FF" };
const mono = "'JetBrains Mono','SF Mono',monospace";
const sans = "'DM Sans','Inter',system-ui,sans-serif";

const Badge = ({ children, color = "gray", style = {} }) => { const m = { green: { b: C.successBg, t: C.success }, red: { b: C.dangerBg, t: C.danger }, amber: { b: C.warningBg, t: C.warning }, blue: { b: C.infoBg, t: C.info }, purple: { b: C.purpleBg, t: C.purple }, gray: { b: "#F3F4F6", t: C.textSec } }; const c = m[color] || m.gray; return <span style={{ background: c.b, color: c.t, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", ...style }}>{children}</span>; };
const Card = ({ children, style = {} }) => <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>;
const Btn = ({ children, variant = "primary", style = {}, onClick, small }) => { const base = { border: "none", borderRadius: 8, fontFamily: sans, fontWeight: 600, cursor: "pointer", fontSize: small ? 12 : 13, padding: small ? "6px 12px" : "9px 18px" }; const v = { primary: { ...base, background: C.amber, color: "#fff" }, secondary: { ...base, background: "#fff", color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec } }; return <button onClick={onClick} style={{ ...(v[variant] || v.primary), ...style }}>{children}</button>; };
const SectionTitle = ({ children, right }) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>{children}</h3>{right}</div>;
const ProgressBar = ({ pct, color = C.amber, h = 6 }) => <div style={{ background: "#E5E7EB", borderRadius: h, height: h, width: "100%" }}><div style={{ background: color, borderRadius: h, height: h, width: `${Math.min(pct, 100)}%` }} /></div>;

const navItems = [ { icon: "📊", label: "Dashboard" }, { icon: "👥", label: "Clients" }, { icon: "🚗", label: "Vehicles" }, { icon: "🔧", label: "Job Cards", badge: 4 }, { icon: "📄", label: "Invoices", badge: 2 }, { icon: "🔔", label: "Reminders", badge: 12 }, { icon: "📈", label: "Reports" }, { icon: "⚙️", label: "Settings" } ];
const Sidebar = ({ active, onNav }) => ( <div style={{ width: 220, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}> <div style={{ padding: "20px 16px 16px" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>MECHWISE</div><div style={{ fontSize: 11, color: C.amber, fontWeight: 500, marginTop: 2 }}>Workshop Management</div></div> <div style={{ padding: "0 8px", flex: 1 }}>{navItems.map(n => <div key={n.label} onClick={() => onNav(n.label)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: active === n.label ? C.navyLight : "transparent" }}><span style={{ fontSize: 16 }}>{n.icon}</span><span style={{ fontSize: 13, fontWeight: active === n.label ? 600 : 400, color: active === n.label ? "#fff" : "rgba(255,255,255,0.7)", flex: 1 }}>{n.label}</span>{n.badge && <span style={{ background: C.amber, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{n.badge}</span>}</div>)}</div> <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>TD</div><div><div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Tinku Dhalla</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Owner</div></div></div></div></div>);
const TopBar = ({ title }) => <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: C.card, borderBottom: `1px solid ${C.border}` }}><h1 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h1><div style={{ display: "flex", alignItems: "center", gap: 12 }}><input placeholder="Search rego, name, phone..." style={{ width: 260, padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: sans, outline: "none" }} /><Btn small>＋ New job</Btn><div style={{ fontSize: 12, color: C.textSec }}>Sat 9 Aug 2026</div></div></div>;

// ═══════════════════════════════════════════════════════════
// RICH REMINDER DATA — 20 entries
// ═══════════════════════════════════════════════════════════
const reminders = [
  { client: "Peter Morrison", phone: "0435 791 593", rego: "NSW-PL1", vehicle: "2017 Hyundai Tucson", type: "NextService", due: "12/10/2026", sends: 0, status: "Pending", days: 64 },
  { client: "Amit Patel", phone: "0401 340 890", rego: "YBI41V", vehicle: "2019 Toyota Camry", type: "NextService", due: "15/09/2026", sends: 1, status: "Sent", days: 37 },
  { client: "Neeran Singh", phone: "0421 565 468", rego: "BX53KO", vehicle: "2013 Holden Commodore", type: "PinkSlip", due: "22/08/2026", sends: 2, status: "Sent", days: 13 },
  { client: "Ravinder Kaur", phone: "—", rego: "BGX18S", vehicle: "2017 Subaru WRX", type: "NextService", due: "01/08/2026", sends: 0, status: "Pending", days: -8 },
  { client: "Manmeet Singh", phone: "0468 312 445", rego: "CJO67Q", vehicle: "2016 Toyota HiLux", type: "NextService", due: "20/07/2026", sends: 3, status: "Sent", days: -20 },
  { client: "Satnam Randhawa", phone: "0432 876 543", rego: "YHU72U", vehicle: "2020 Toyota HiLux", type: "NextService", due: "01/11/2026", sends: 0, status: "Booked", days: 84 },
  { client: "Sukhm Kamboj", phone: "0432 981 553", rego: "ZLF882", vehicle: "2020 Mazda 3", type: "NextService", due: "25/09/2026", sends: 1, status: "Sent", days: 47 },
  { client: "Rajiv Kumar", phone: "0401 324 155", rego: "FCV93G", vehicle: "2018 Ford Ranger", type: "PinkSlip", due: "05/09/2026", sends: 0, status: "Pending", days: 27 },
  { client: "Tony Nguyen", phone: "0412 555 678", rego: "BYZ33K", vehicle: "2017 Nissan Navara", type: "PinkSlip", due: "20/08/2026", sends: 1, status: "Sent", days: 11 },
  { client: "Lisa Chen", phone: "0445 888 999", rego: "CWR55L", vehicle: "2019 Mazda CX-3", type: "NextService", due: "18/09/2026", sends: 0, status: "Pending", days: 40 },
  { client: "Jaspreet Dhillon", phone: "0456 777 111", rego: "BNM62P", vehicle: "2016 BMW 320i", type: "PinkSlip", due: "30/08/2026", sends: 1, status: "Sent", days: 21 },
  { client: "Kang & Gill", phone: "0411 987 654", rego: "EHK91Z", vehicle: "2018 Toyota HiAce", type: "PinkSlip", due: "01/09/2026", sends: 0, status: "Pending", days: 23 },
  { client: "Kang & Gill", phone: "0411 987 654", rego: "BX35DW", vehicle: "2019 Toyota Corolla", type: "NextService", due: "15/10/2026", sends: 0, status: "Pending", days: 67 },
  { client: "Daniel Tran", phone: "0478 999 000", rego: "CPZ81J", vehicle: "2018 Mitsubishi Triton", type: "PinkSlip", due: "22/09/2026", sends: 0, status: "Pending", days: 44 },
  { client: "Harpreet Gill", phone: "0423 111 222", rego: "DRP44W", vehicle: "2019 Honda Civic", type: "NextService", due: "12/11/2026", sends: 0, status: "Booked", days: 95 },
  { client: "W.S. Plumbing", phone: "0402 666 777", rego: "WSP100", vehicle: "2019 Ford Transit", type: "PinkSlip", due: "10/09/2026", sends: 1, status: "Sent", days: 32 },
  { client: "W.S. Plumbing", phone: "0402 666 777", rego: "WSP101", vehicle: "2020 Ford Ranger", type: "NextService", due: "15/10/2026", sends: 0, status: "Pending", days: 67 },
  { client: "Mohammed Ali", phone: "0434 222 333", rego: "EAB19X", vehicle: "2021 Kia Cerato", type: "NextService", due: "05/12/2026", sends: 0, status: "Pending", days: 118 },
  { client: "Dhalla Fleet", phone: "0430 050 714", rego: "DHA001", vehicle: "2021 Toyota HiLux", type: "NextService", due: "01/10/2026", sends: 0, status: "Booked", days: 53 },
  { client: "Gurpreet Bains", phone: "0489 444 555", rego: "ENP05U", vehicle: "2022 Hyundai i30", type: "NextService", due: "08/02/2027", sends: 0, status: "Pending", days: 183 },
];

const ReminderScreen = () => {
  const [tab, setTab] = useState("All");
  const [sel, setSel] = useState(new Set());
  const tabs = ["Due Soon", "Overdue", "No Contact", "Booked", "All"];
  const filtered = reminders.filter(r => { if (tab === "Due Soon") return r.days > 0 && r.days <= 60 && r.status !== "Booked"; if (tab === "Overdue") return r.days < 0; if (tab === "No Contact") return r.phone === "—"; if (tab === "Booked") return r.status === "Booked"; return true; });
  const toggle = i => { const n = new Set(sel); n.has(i) ? n.delete(i) : n.add(i); setSel(n); };
  const overdue = reminders.filter(r => r.days < 0).length; const booked = reminders.filter(r => r.status === "Booked").length;
  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Due This Week", v: "5", c: C.info }, { l: "Due This Month", v: "8", c: C.warning }, { l: "Overdue", v: String(overdue), c: C.danger }, { l: "Awaiting Reply", v: "7", c: C.textSec }, { l: "Booked", v: String(booked), c: C.success }, { l: "No Contact", v: "1", c: C.danger }].map((k, i) => <Card key={i} style={{ textAlign: "center", padding: 14 }}><div style={{ fontSize: 24, fontWeight: 700, fontFamily: mono, color: k.c }}>{k.v}</div><div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{k.l}</div></Card>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>{tabs.map(t => <button key={t} onClick={() => { setTab(t); setSel(new Set()); }} style={{ padding: "7px 14px", borderRadius: 6, fontSize: 13, fontWeight: tab === t ? 600 : 400, fontFamily: sans, background: tab === t ? C.card : "transparent", color: tab === t ? C.text : C.textSec, border: tab === t ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>{t}{t === "Overdue" ? ` (${overdue})` : t === "Booked" ? ` (${booked})` : t === "All" ? ` (${reminders.length})` : ""}</button>)}</div>
        {sel.size > 0 && <Btn small>📱 Send to {sel.size} selected</Btn>}
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ maxHeight: 480, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: C.navy }}><th style={{ padding: "10px 10px", width: 36 }}><input type="checkbox" style={{ accentColor: C.amber }} onChange={e => { if (e.target.checked) setSel(new Set(filtered.map((_, i) => i))); else setSel(new Set()); }} /></th>{["Client", "Vehicle", "Type", "Due", "Days", "Sends", "Status", "Action"].map(h => <th key={h} style={{ padding: "10px 10px", fontSize: 11, fontWeight: 600, color: "#fff", textAlign: "left" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: sel.has(i) ? C.amberLight : i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              <td style={{ padding: "8px 10px" }}><input type="checkbox" checked={sel.has(i)} onChange={() => toggle(i)} style={{ accentColor: C.amber }} /></td>
              <td style={{ padding: "8px 10px" }}><div style={{ fontSize: 13, fontWeight: 500 }}>{r.client}</div><div style={{ fontSize: 11, fontFamily: mono, color: r.phone === "—" ? C.danger : C.textSec }}>{r.phone}</div></td>
              <td style={{ padding: "8px 10px" }}><div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: C.navy, letterSpacing: "0.04em" }}>{r.rego}</div><div style={{ fontSize: 10, color: C.textSec }}>{r.vehicle}</div></td>
              <td style={{ padding: "8px 10px" }}><Badge color={r.type === "PinkSlip" ? "purple" : "blue"}>{r.type === "PinkSlip" ? "Pink Slip" : "Service"}</Badge></td>
              <td style={{ padding: "8px 10px", fontFamily: mono, fontSize: 11 }}>{r.due}</td>
              <td style={{ padding: "8px 10px" }}><span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: r.days < 0 ? C.danger : r.days <= 14 ? C.warning : C.text }}>{r.days < 0 ? `${Math.abs(r.days)}d over` : `${r.days}d`}</span></td>
              <td style={{ padding: "8px 10px", fontFamily: mono, fontSize: 11, color: C.textSec }}>{r.sends}×</td>
              <td style={{ padding: "8px 10px" }}><Badge color={r.status === "Booked" ? "green" : r.status === "Sent" ? "blue" : "gray"}>{r.status}</Badge></td>
              <td style={{ padding: "8px 10px" }}>{r.phone === "—" ? <Btn small variant="secondary">+ Phone</Btn> : r.status === "Booked" ? <span style={{ fontSize: 11, color: C.success }}>✓</span> : <Btn small variant="secondary">📱</Btn>}</td>
            </tr>))}</tbody>
        </table>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// REPORTS — 4 months data
// ═══════════════════════════════════════════════════════════
const revData = [{ m: "May", r: 24100, e: 9500 }, { m: "Jun", r: 22600, e: 8800 }, { m: "Jul", r: 26300, e: 10200 }, { m: "Aug", r: 14200, e: 5800 }];
const jobTypes = [{ name: "Minor Service", v: 32, rev: 21600, c: C.navy }, { name: "Major Service", v: 16, rev: 28000, c: C.amber }, { name: "Brake Replace", v: 14, rev: 19600, c: C.info }, { name: "Pink Slip", v: 11, rev: 2860, c: C.purple }, { name: "Tyre Replace", v: 9, rev: 18000, c: C.success }, { name: "Diagnostic", v: 8, rev: 3200, c: "#6B7280" }, { name: "Other", v: 10, rev: 5740, c: C.border }];
const mechData = [
  { name: "Baljit Gugu", jobs: 48, billed: 96, actual: 82, eff: 117, rev: 42800 },
  { name: "Harman", jobs: 38, billed: 72, actual: 69, eff: 104, rev: 31200 },
  { name: "Manveer Singh", jobs: 32, billed: 58, actual: 62, eff: 94, rev: 25600 },
  { name: "Ash (Apprentice)", jobs: 18, billed: 28, actual: 35, eff: 80, rev: 9800 },
];
const topCust = [
  { name: "Kang & Gill Investments", visits: 22, spend: 12400, last: "06/08/2026" },
  { name: "Western Sydney Plumbing", visits: 18, spend: 9800, last: "10/03/2026" },
  { name: "Dhalla Fleet Services", visits: 35, spend: 18900, last: "01/04/2026" },
  { name: "Rajiv Kumar", visits: 12, spend: 6450, last: "05/03/2026" },
  { name: "Jaspreet Dhillon", visits: 15, spend: 5880, last: "28/02/2026" },
  { name: "Neeran Singh", visits: 11, spend: 5230, last: "25/11/2025" },
  { name: "Peter Morrison", visits: 14, spend: 4820, last: "09/08/2026" },
  { name: "Satnam Randhawa", visits: 7, spend: 4200, last: "18/06/2026" },
  { name: "Daniel Tran", visits: 13, spend: 4120, last: "22/03/2026" },
  { name: "Tony Nguyen", visits: 10, spend: 3850, last: "09/08/2026" },
];

const ReportsScreen = () => {
  const [period, setPeriod] = useState("Month");
  const tRev = revData.reduce((s, r) => s + r.r, 0); const tExp = revData.reduce((s, r) => s + r.e, 0);
  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 2, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>{["Week", "Month", "Quarter", "Year"].map(p => <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: period === p ? 600 : 400, fontFamily: sans, background: period === p ? C.card : "transparent", color: period === p ? C.text : C.textSec, border: period === p ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>{p}</button>)}</div>
        <Btn small variant="secondary">⬇ Export CSV</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Revenue", v: `$${(tRev/1000).toFixed(1)}k`, t: "+16%", u: true }, { l: "Expenses", v: `$${(tExp/1000).toFixed(1)}k`, t: "+8%", u: false }, { l: "Gross Profit", v: `$${((tRev - tExp)/1000).toFixed(1)}k`, t: "+22%", u: true }, { l: "Jobs Done", v: "136", t: "+14", u: true }, { l: "Avg Invoice", v: "$342", t: "+$18", u: true }].map((k, i) => <Card key={i}><div style={{ fontSize: 12, color: C.textSec }}>{k.l}</div><div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, marginTop: 2 }}>{k.v}</div><div style={{ fontSize: 11, color: k.u ? C.success : C.danger, fontWeight: 600, marginTop: 2 }}>{k.u ? "↑" : "↓"} {k.t}</div></Card>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card style={{ padding: 20 }}><SectionTitle>Revenue vs Expenses — 4 Months</SectionTitle><ResponsiveContainer width="100%" height={200}><BarChart data={revData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="m" tick={{ fontSize: 11, fill: C.textSec }} /><YAxis tick={{ fontSize: 11, fill: C.textSec }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} /><Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} /><Bar dataKey="r" fill={C.navy} radius={[4,4,0,0]} name="Revenue" /><Bar dataKey="e" fill={C.border} radius={[4,4,0,0]} name="Expenses" /></BarChart></ResponsiveContainer></Card>
        <Card style={{ padding: 20 }}><SectionTitle>Revenue by Service Type</SectionTitle><div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 130, height: 130 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={jobTypes} dataKey="v" cx="50%" cy="50%" outerRadius={60} innerRadius={28}>{jobTypes.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart></ResponsiveContainer></div><div style={{ flex: 1 }}>{jobTypes.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: d.c, flexShrink: 0 }} /><span style={{ fontSize: 11, flex: 1 }}>{d.name}</span><span style={{ fontSize: 11, fontFamily: mono, color: C.textSec }}>{d.v}%</span></div>)}</div></div></Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 20 }}><SectionTitle>Mechanic Productivity</SectionTitle><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Mechanic", "Jobs", "Billed", "Actual", "Eff%", "Revenue"].map(h => <th key={h} style={{ padding: "8px 6px", fontSize: 11, fontWeight: 600, color: C.textSec, textAlign: "left", borderBottom: `2px solid ${C.border}` }}>{h}</th>)}</tr></thead><tbody>{mechData.map((m, i) => <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: "8px 6px", fontSize: 13, fontWeight: 500 }}>{m.name}</td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 12 }}>{m.jobs}</td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 12 }}>{m.billed}h</td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 12 }}>{m.actual}h</td><td style={{ padding: "8px 6px" }}><span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: m.eff >= 100 ? C.success : m.eff >= 90 ? C.warning : C.danger }}>{m.eff}%</span></td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 12, fontWeight: 600 }}>${m.rev.toLocaleString()}</td></tr>)}</tbody></table></Card>
        <Card style={{ padding: 20 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>Top 10</span>}>Top Customers</SectionTitle><div style={{ maxHeight: 280, overflowY: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Customer", "Visits", "Spend", "Last Visit"].map(h => <th key={h} style={{ padding: "8px 6px", fontSize: 11, fontWeight: 600, color: C.textSec, textAlign: "left", borderBottom: `2px solid ${C.border}` }}>{h}</th>)}</tr></thead><tbody>{topCust.map((c, i) => <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: "8px 6px", fontSize: 12, fontWeight: 500 }}>{c.name}</td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 12 }}>{c.visits}</td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 12, fontWeight: 600 }}>${c.spend.toLocaleString()}</td><td style={{ padding: "8px 6px", fontFamily: mono, fontSize: 11, color: C.textSec }}>{c.last}</td></tr>)}</tbody></table></div></Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
const settSections = ["Business Details", "Invoicing", "Pricing", "SMS / Email", "Reminders", "Users & Roles", "Subscription", "Branding"];
const SettingsScreen = () => {
  const [sec, setSec] = useState("Business Details");
  const Inp = ({ label, value, isMono }) => <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 500, color: C.textSec, marginBottom: 4, display: "block" }}>{label}</label><input defaultValue={value} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: isMono ? mono : sans, outline: "none" }} /></div>;
  return (
    <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        <Card style={{ padding: 8, alignSelf: "flex-start" }}>{settSections.map(s => <div key={s} onClick={() => setSec(s)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: sec === s ? 600 : 400, color: sec === s ? C.amber : C.text, background: sec === s ? C.amberLight : "transparent" }}>{s}</div>)}</Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sec === "Business Details" && <>
            <Card style={{ padding: 20 }}><SectionTitle>Workshop Information</SectionTitle><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><Inp label="Business Name" value="Dhalla Automotive Pty Ltd" /><Inp label="ABN" value="95 611 566 888" isMono /><Inp label="MVRL Number" value="54657" isMono /><Inp label="ARC Number" value="AU44775" isMono /><Inp label="Phone" value="0247 082 717" isMono /><Inp label="Mobile" value="0430 050 714" isMono /><Inp label="Email" value="dhallaautomotive@yahoo.com.au" /><Inp label="Website" value="" /></div><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}><Inp label="Address" value="70A Cox Avenue" /><Inp label="Suburb" value="Kingswood" /><Inp label="Postcode" value="2747" isMono /></div></Card>
            <Card style={{ padding: 20 }}><SectionTitle>Operating Hours</SectionTitle><div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>{[{ d: "Mon", o: "07:30", c: "17:00" }, { d: "Tue", o: "07:30", c: "17:00" }, { d: "Wed", o: "07:30", c: "17:00" }, { d: "Thu", o: "07:30", c: "17:00" }, { d: "Fri", o: "07:30", c: "17:00" }, { d: "Sat", o: "08:00", c: "13:00" }, { d: "Sun", o: "—", c: "—" }].map(d => <div key={d.d} style={{ textAlign: "center", padding: 8, background: d.o === "—" ? "#FAFAFA" : "#fff", borderRadius: 8, border: `1px solid ${C.border}` }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{d.d}</div><div style={{ fontSize: 11, fontFamily: mono, color: d.o === "—" ? C.textMuted : C.textSec }}>{d.o}</div>{d.o !== "—" && <><div style={{ fontSize: 9, color: C.textMuted }}>to</div><div style={{ fontSize: 11, fontFamily: mono, color: C.textSec }}>{d.c}</div></>}{d.o === "—" && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Closed</div>}</div>)}</div></Card>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><Btn variant="secondary">Cancel</Btn><Btn>Save Changes</Btn></div>
          </>}
          {sec === "SMS / Email" && <>
            <Card style={{ padding: 20 }}><SectionTitle right={<Badge color="green">Active</Badge>}>SMS Configuration</SectionTitle><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><Inp label="Sender Name (max 11 chars)" value="Dhalla Auto" /><div /><Inp label="Send Window Start" value="09:00" isMono /><Inp label="Send Window End" value="20:00" isMono /></div><div style={{ background: C.infoBg, border: `1px solid ${C.info}20`, borderRadius: 8, padding: 12, marginTop: 8 }}><div style={{ fontSize: 12, color: C.info, fontWeight: 600 }}>📋 ACMA Compliance (Spam Act 2003)</div><div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>All messages include "Reply STOP to opt out". Max 1 SMS per customer per week. Send only 9am-8pm AEST.</div></div><div style={{ marginTop: 16 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: C.textSec }}>SMS this month</span><span style={{ fontFamily: mono, fontWeight: 600 }}>187 / 500</span></div><ProgressBar pct={37.4} color={C.info} h={8} /></div></Card>
            <Card style={{ padding: 20 }}><SectionTitle>Message Templates</SectionTitle>{[{ n: "Service Reminder", t: "Hi {name}, your {vehicle} ({rego}) is due for a service on {date}. Book now at Dhalla Automotive: call 0247 082 717 or reply BOOK. Reply STOP to opt out." }, { n: "Pink Slip Reminder", t: "Hi {name}, the pink slip for {rego} expires {date}. Book your e-safety inspection at Dhalla Automotive — 0247 082 717 or reply BOOK. Reply STOP to opt out." }, { n: "Booking Confirmation", t: "Hi {name}, your booking at Dhalla Automotive is confirmed: {date} at {time} for {rego}. See you then! Reply C to confirm, R to reschedule. Reply STOP to opt out." }].map((t, i) => <div key={i} style={{ marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{t.n}</span><Btn small variant="ghost">Edit</Btn></div><div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, fontSize: 12, color: C.textSec, lineHeight: 1.6, fontFamily: mono }}>{t.t}</div></div>)}</Card>
          </>}
          {sec !== "Business Details" && sec !== "SMS / Email" && <Card style={{ padding: 40, textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div><div style={{ fontSize: 15, fontWeight: 600 }}>{sec}</div><div style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>Configuration for {sec.toLowerCase()}.</div></Card>}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CUSTOMER PORTAL — full history
// ═══════════════════════════════════════════════════════════
const portalHist = [
  { date: "09/08/2026", type: "Minor Service", items: "Oil change, oil filter, engine flush, safety check", cost: 169.40, inv: "INV-0091" },
  { date: "12/04/2026", type: "Minor Service + Pink Slip", items: "Oil change, filter, engine flush, e-safety inspection", cost: 226.60, inv: "INV-0078" },
  { date: "08/10/2025", type: "Front Brake Repl. + Tyre Rotation", items: "Front pads, disc machining, caliper clean, tyre rotation", cost: 462.00, inv: "INV-0065" },
  { date: "15/04/2025", type: "Major Service", items: "Full service inc spark plugs, all filters, brake fluid", cost: 385.00, inv: "INV-0051" },
  { date: "02/11/2024", type: "Pink Slip + Minor Service", items: "E-safety inspection, oil change, oil filter, safety check", cost: 226.60, inv: "INV-0038" },
  { date: "18/04/2024", type: "Minor Service", items: "Oil change, oil filter, engine flush, 25-point check", cost: 169.40, inv: "INV-0024" },
  { date: "10/10/2023", type: "Clutch Replacement", items: "Clutch kit, flywheel resurface, release bearing, slave cylinder", cost: 1045.00, inv: "INV-0015" },
  { date: "12/04/2023", type: "Major Service + Coolant Flush", items: "Full service, coolant drain and refill, thermostat check", cost: 517.00, inv: "INV-0009" },
  { date: "05/10/2022", type: "Minor Service", items: "Oil change, oil filter, safety check", cost: 154.00, inv: "INV-0005" },
  { date: "20/03/2022", type: "Battery + Minor Service", items: "NS40ZL battery, terminals cleaned, oil change, filter", cost: 334.00, inv: "INV-0002" },
];

const PortalScreen = () => (
  <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans }}>
    <div style={{ background: C.navy, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Dhalla Automotive Pty Ltd</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>70A Cox Avenue, Kingswood NSW 2747 · 0247 082 717</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Welcome, Peter</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Customer Portal</div></div></div>
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
      <Card style={{ padding: 16, marginBottom: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>Your vehicle:</div><div style={{ border: `2px solid ${C.amber}`, borderRadius: 8, padding: "8px 16px", background: C.amberLight }}><span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "0.04em" }}>NSW-PL1</span><span style={{ fontSize: 13, color: C.textSec, marginLeft: 12 }}>2017 Hyundai Tucson · Diesel · 95,200 km</span></div></div></Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>{[{ i: "🔧", l: "Next Service Due", v: "12/10/2026", s: "or at 105,200 km", c: C.info }, { i: "📋", l: "Pink Slip Expiry", v: "28/02/2027", s: "Valid — 6 months", c: C.success }, { i: "📅", l: "Total Visits", v: "14", s: "Since March 2019", c: C.purple }].map((s, i) => <Card key={i} style={{ borderLeft: `4px solid ${s.c}` }}><div style={{ fontSize: 12, color: C.textSec }}>{s.i} {s.l}</div><div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, marginTop: 4 }}>{s.v}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.s}</div></Card>)}</div>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, borderRadius: 12, padding: "24px 28px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Ready for your next service?</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Book online and we'll confirm within 2 hours.</div></div><button style={{ background: C.amber, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: sans }}>📅 Book Now</button></div>
      <Card style={{ padding: 16, marginBottom: 20, background: C.amberLight, borderColor: C.amber }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 20 }}>💡</span><div><div style={{ fontSize: 13, fontWeight: 600 }}>Recommendation from your last visit</div><div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Baljit noted: "Rear brake pads worn to ~40%. Recommend replacing within next 10,000 km or by October 2026. Also noticed minor oil seep around rocker cover gasket — monitor."</div></div></div></Card>
      <Card style={{ padding: 20 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>{portalHist.length} records · Total: $3,689.00</span>}>Service History</SectionTitle>
        {portalHist.map((h, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < portalHist.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: i === 0 ? C.amberLight : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{h.type.includes("Pink") || h.type.includes("Clutch") ? "🔩" : "🔧"}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{h.type}</div><div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{h.items}</div><div style={{ fontSize: 11, fontFamily: mono, color: C.textMuted, marginTop: 2 }}>{h.date} · {h.inv}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700 }}>${h.cost.toFixed(2)}</div><button style={{ fontSize: 12, color: C.info, background: "none", border: "none", cursor: "pointer", fontFamily: sans, fontWeight: 500, marginTop: 4 }}>⬇ Invoice PDF</button></div>
        </div>)}
      </Card>
      <div style={{ textAlign: "center", padding: "32px 0 16px" }}><div style={{ fontSize: 12, color: C.textMuted }}>Dhalla Automotive Pty Ltd · ABN 95 611 566 888 · 70A Cox Avenue, Kingswood NSW 2747</div><div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>📞 0247 082 717 · 📱 0430 050 714</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>Powered by <span style={{ fontWeight: 700, color: C.amber }}>MECHWISE</span></div></div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════
const screens = { Reminders: ReminderScreen, Reports: ReportsScreen, Settings: SettingsScreen, Portal: PortalScreen };

export default function MechWisePart2() {
  const [screen, setScreen] = useState("Reminders");
  if (screen === "Portal") return <PortalScreen />;
  const Screen = screens[screen] || ReminderScreen;
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: sans, background: C.bg }}>
      <Sidebar active={screen} onNav={s => setScreen(s === "Settings" ? "Settings" : s)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}><TopBar title={screen} /><Screen /></div>
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 100 }}><div style={{ display: "flex", gap: 4, background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>{["Reminders", "Reports", "Settings", "Portal"].map(s => <button key={s} onClick={() => setScreen(s)} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: screen === s ? 600 : 400, background: screen === s ? C.navy : "transparent", color: screen === s ? "#fff" : C.textSec, border: "none", cursor: "pointer", fontFamily: sans }}>{s}</button>)}</div></div>
    </div>
  );
}
