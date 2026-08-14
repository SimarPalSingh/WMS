import { useState } from "react";
import { Search, Bell, ChevronDown, ChevronRight, Plus, ArrowUpRight, ArrowDownRight, Minus, Menu, X, LogOut, User, Settings as SettingsIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// MechWise — Workshop Management System UI
// Main dashboard with full navigation structure
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  navy: "#1B2A4A",
  navyLight: "#243656",
  navyDark: "#131E35",
  amber: "#E8920D",
  amberLight: "#FDF4E3",
  amberDark: "#B5710A",
  white: "#FFFFFF",
  bg: "#F3F5F7",
  card: "#FFFFFF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  success: "#059669",
  successBg: "#ECFDF5",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  info: "#2563EB",
  infoBg: "#EFF6FF",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  purple: "#7C3AED",
  purpleBg: "#F5F3FF",
};

// ── NAV ITEMS ──
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "clients", label: "Clients", icon: "👤", badge: 300 },
  { id: "vehicles", label: "Vehicles", icon: "🚗", badge: 323 },
  { id: "quotes", label: "Quotations", icon: "📝" },
  { id: "jobcards", label: "Job Cards", icon: "🔧", badge: 6 },
  { id: "invoices", label: "Invoices", icon: "🧾" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "inventory", label: "Inventory", icon: "📦", badge: 3, badgeColor: COLORS.danger },
  { id: "suppliers", label: "Suppliers", icon: "🏭" },
  { id: "catalogue", label: "Service Catalogue", icon: "📂" },
  { id: "calendar", label: "Calendar", icon: "📅", badge: 6, badgeColor: COLORS.info },
  { id: "reminders", label: "Reminders", icon: "🔔", badge: 12, badgeColor: COLORS.warning },
  { id: "reports", label: "Reports", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

// ── KPI DATA ──
const KPIS = [
  { label: "Today's revenue", value: "$1,840", delta: "+$320", direction: "up", color: COLORS.success },
  { label: "Jobs active", value: "6", delta: "3 bays in use", direction: "neutral", color: COLORS.info },
  { label: "Overdue invoices", value: "3", delta: "$1,240", direction: "down", color: COLORS.danger },
  { label: "Reminders sent", value: "8", delta: "2 replies ✓", direction: "up", color: COLORS.purple },
];

// ── BAY DATA ──
const BAYS = [
  { name: "Bay 1 — Hoist", status: "In progress", statusColor: COLORS.warning, rego: "BX35DW", vehicle: "Toyota Corolla 2019", job: "Minor service", mechanic: "Baljit", progress: 75, time: "8:15am — est. 9:15am" },
  { name: "Bay 2 — Hoist", status: "Waiting for parts", statusColor: COLORS.danger, rego: "CIM29R", vehicle: "Hyundai i30 2018", job: "Front brake replacement", mechanic: "Tinku", progress: 25, time: "On hold — ETA tomorrow" },
  { name: "Bay 3 — Ground", status: "Ready for pickup", statusColor: COLORS.success, rego: "ZLF882", vehicle: "Mazda 3 2020", job: "Major service + AC", mechanic: "Harman", progress: 100, time: "Done 10:45am — $380" },
  { name: "Bay 4 — Tyre bay", status: "Waiting", statusColor: COLORS.info, rego: "BGX18S", vehicle: "Subaru WRX 2017", job: "Tyre replacement × 4", mechanic: "Unassigned", progress: 0, time: "Arrived 11:00am" },
];

// ── SCHEDULE ──
const SCHEDULE = [
  { time: "7:30", client: "Ravinder Kaur", rego: "BGX18S", job: "Tyre replacement × 4", bay: "Bay 4", mechanic: "Harman", status: "Confirmed", statusColor: COLORS.success },
  { time: "8:00", client: "Peter", rego: "NSW-PL1", job: "Minor service", bay: "Bay 2", mechanic: "Tinku", status: "Confirmed", statusColor: COLORS.success },
  { time: "8:30", client: "Amit", rego: "YBI41V", job: "Pink slip", bay: "Bay 1", mechanic: "Baljit", status: "Unconfirmed", statusColor: COLORS.warning },
  { time: "9:00", client: "Kang & Gill Investments", rego: "FCV93G", job: "Major service", bay: "Bay 1", mechanic: "Baljit", status: "Confirmed", statusColor: COLORS.success },
  { time: "10:30", client: "Girish", rego: "CK66YW", job: "Brake pads + fluid", bay: "Bay 3", mechanic: "Tinku", status: "Booked", statusColor: COLORS.info },
  { time: "1:00", client: "Neeran", rego: "BX53KO", job: "Diagnostic scan", bay: "—", mechanic: "—", status: "Booked", statusColor: COLORS.info },
];

// ── ALERTS ──
const ALERTS = [
  { type: "danger", icon: "⚠", text: "Oil filter Z456 — below reorder level (4 remaining)", action: "View draft PO" },
  { type: "warning", icon: "⏰", text: "INV-0081 overdue 9 days — Sandeep Kaur — $234", action: "Send reminder" },
  { type: "warning", icon: "📞", text: "Amit (8:30am) hasn't confirmed booking", action: "Call" },
  { type: "success", icon: "💬", text: "2 customers replied BOOK overnight — draft appointments ready", action: "Review" },
  { type: "info", icon: "🚗", text: "CIM29R (Bay 2) waiting for brake pads — PO-0032 ETA tomorrow", action: "Track PO" },
];

// ── RECENT INVOICES ──
const RECENT_INVOICES = [
  { id: "INV-0089", client: "Peter", rego: "NSW-PL1", amount: "$194.00", status: "Paid", statusColor: COLORS.success, date: "Today" },
  { id: "INV-0088", client: "Satnam Randhawa", rego: "YHU72U", amount: "$520.00", status: "Paid", statusColor: COLORS.success, date: "Yesterday" },
  { id: "INV-0087", client: "Sukhm Kamboj", rego: "ZLF882", amount: "$380.00", status: "Unpaid", statusColor: COLORS.warning, date: "Yesterday" },
  { id: "INV-0086", client: "Neeran", rego: "BX53KO", amount: "$80.00", status: "Paid", statusColor: COLORS.success, date: "Mon" },
  { id: "INV-0081", client: "Sandeep Kaur", rego: "CU04WU", amount: "$234.00", status: "Overdue", statusColor: COLORS.danger, date: "29 Sep" },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function KPICard({ label, value, delta, direction, color }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 12, padding: "18px 20px", border: `1px solid ${COLORS.border}`, flex: "1 1 160px", minWidth: 160 }}>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.text, lineHeight: 1.1, marginBottom: 4, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12, color, display: "flex", alignItems: "center", gap: 4 }}>
        {direction === "up" && <ArrowUpRight size={14} />}
        {direction === "down" && <ArrowDownRight size={14} />}
        {direction === "neutral" && <Minus size={14} />}
        {delta}
      </div>
    </div>
  );
}

function BayCard({ bay }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{bay.name}</div>
        <div style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, color: bay.statusColor, background: bay.statusColor + "15" }}>{bay.status}</div>
      </div>
      <div style={{ fontSize: 13, marginBottom: 2 }}>
        <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", color: COLORS.navy, letterSpacing: "0.04em" }}>{bay.rego}</span>
        <span style={{ color: COLORS.textSecondary }}> · {bay.vehicle}</span>
      </div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>{bay.job}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>
        {bay.mechanic} · {bay.time}
      </div>
      <div style={{ height: 5, borderRadius: 3, background: COLORS.bg, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, background: bay.progress === 100 ? COLORS.success : bay.progress > 0 ? COLORS.amber : COLORS.borderStrong, width: `${bay.progress}%`, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  const bgMap = { danger: COLORS.dangerBg, warning: COLORS.warningBg, success: COLORS.successBg, info: COLORS.infoBg };
  const colorMap = { danger: COLORS.danger, warning: COLORS.warning, success: COLORS.success, info: COLORS.info };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bgMap[alert.type], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{alert.icon}</div>
      <div style={{ flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{alert.text}</div>
      <button style={{ fontSize: 11, fontWeight: 600, color: colorMap[alert.type], background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", padding: "4px 0" }}>{alert.action} →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function MechWiseApp() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: COLORS.bg, color: COLORS.text, overflow: "hidden" }}>
      
      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? 240 : 0,
        background: COLORS.navy,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.25s ease",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${COLORS.navyLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.amber, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: COLORS.white }}>M</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, letterSpacing: "-0.02em" }}>MechWise</div>
              <div style={{ fontSize: 10, color: "#8899B3", letterSpacing: "0.06em", textTransform: "uppercase" }}>Workshop Management</div>
            </div>
          </div>
        </div>

        {/* Workshop selector */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.navyLight}` }}>
          <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: COLORS.navyLight, border: "none", cursor: "pointer", color: COLORS.white, fontSize: 13, fontWeight: 500 }}>
            <span>Dhalla Automotive</span>
            <ChevronDown size={14} style={{ opacity: 0.5 }} />
          </button>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: activeNav === item.id ? COLORS.navyLight : "transparent",
                color: activeNav === item.id ? COLORS.white : "#8899B3",
                fontSize: 13,
                fontWeight: activeNav === item.id ? 600 : 400,
                marginBottom: 1,
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 20,
                  background: item.badgeColor || COLORS.navyLight,
                  color: item.badgeColor ? COLORS.white : "#8899B3",
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.navyLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: COLORS.white }}>TD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>Tinku Dhalla</div>
              <div style={{ fontSize: 11, color: "#8899B3" }}>Owner</div>
            </div>
            <LogOut size={16} style={{ color: "#8899B3", cursor: "pointer" }} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Top bar */}
        <div style={{ height: 56, background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: COLORS.textSecondary }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Search */}
          <div style={{
            flex: 1,
            maxWidth: 480,
            position: "relative",
          }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted }} />
            <input
              placeholder="Search by rego, client name, phone, invoice…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 8,
                border: `1px solid ${searchFocused ? COLORS.amber : COLORS.border}`,
                outline: "none",
                fontSize: 13,
                fontFamily: "inherit",
                background: COLORS.bg,
                color: COLORS.text,
                transition: "border-color 0.15s ease",
              }}
            />
          </div>

          {/* Quick actions */}
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: COLORS.amber, color: COLORS.white,
            border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            <Plus size={16} /> New job
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={20} style={{ color: COLORS.textSecondary }} />
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, background: COLORS.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: COLORS.white }}>5</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: "right" }}>
            <div style={{ fontWeight: 500, color: COLORS.text }}>Tue 8 Oct 2025</div>
            <div>11:30 AM</div>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          
          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, letterSpacing: "-0.02em" }}>Good morning, Tinku</div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>6 jobs today · 3 bays active · BAS Q2 due in 143 days</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, cursor: "pointer", fontSize: 12, fontWeight: 500, color: COLORS.text }}>Export report</button>
              <button style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: COLORS.navy, color: COLORS.white, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>+ New quote</button>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {KPIS.map((kpi, i) => <KPICard key={i} {...kpi} />)}
          </div>

          {/* Two column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            
            {/* Workshop floor board */}
            <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>Workshop floor</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>3 of 4 bays active</div>
              </div>
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {BAYS.map((bay, i) => <BayCard key={i} bay={bay} />)}
              </div>
            </div>

            {/* Today's schedule */}
            <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>Today's schedule</div>
                <button style={{ fontSize: 12, color: COLORS.amber, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View calendar →</button>
              </div>
              <div style={{ padding: "0 18px" }}>
                {SCHEDULE.map((appt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < SCHEDULE.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div style={{ width: 48, fontSize: 13, fontWeight: 600, color: COLORS.navy, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", flexShrink: 0 }}>{appt.time}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.client}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                        <span style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontWeight: 500, letterSpacing: "0.03em" }}>{appt.rego}</span>
                        <span> · {appt.job}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "right", flexShrink: 0 }}>
                      <div>{appt.mechanic}</div>
                      <div>{appt.bay}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: appt.statusColor, background: appt.statusColor + "15", flexShrink: 0 }}>{appt.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            
            {/* Alerts */}
            <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>Action items</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.danger, background: COLORS.dangerBg, padding: "2px 10px", borderRadius: 20 }}>5 items</div>
              </div>
              <div style={{ padding: "4px 18px 8px" }}>
                {ALERTS.map((alert, i) => <AlertRow key={i} alert={alert} />)}
              </div>
            </div>

            {/* Recent invoices */}
            <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>Recent invoices</div>
                <button style={{ fontSize: 12, color: COLORS.amber, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
              </div>
              <div style={{ padding: "0 18px" }}>
                {RECENT_INVOICES.map((inv, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < RECENT_INVOICES.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", color: COLORS.navy, letterSpacing: "0.03em", width: 72, flexShrink: 0 }}>{inv.id}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{inv.client}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                        <span style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{inv.rego}</span>
                        <span> · {inv.date}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{inv.amount}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 20, color: inv.statusColor, background: inv.statusColor + "15", width: 60, textAlign: "center" }}>{inv.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly revenue tracker */}
          <div style={{ marginTop: 16, background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>October revenue</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>8 working days remaining</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text }}>$8,240 <span style={{ fontSize: 14, fontWeight: 400, color: COLORS.textSecondary }}>/ $12,500 target</span></div>
                <div style={{ fontSize: 12, color: COLORS.success }}>↑ Tracking 8% ahead of last month</div>
              </div>
            </div>
            <div style={{ height: 10, borderRadius: 6, background: COLORS.bg, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.amber})`, width: "66%" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: COLORS.textMuted }}>
              <span>$0</span>
              <span style={{ color: COLORS.amber, fontWeight: 600 }}>66% of target</span>
              <span>$12,500</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
