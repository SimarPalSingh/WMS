import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const C = { navy: "#1B2A4A", navyLight: "#243656", amber: "#E8920D", amberLight: "#FDF4E3", bg: "#F3F5F7", card: "#FFFFFF", border: "#E5E7EB", text: "#1F2937", textSec: "#6B7280", textMuted: "#9CA3AF", success: "#059669", successBg: "#ECFDF5", danger: "#DC2626", dangerBg: "#FEF2F2", warning: "#D97706", warningBg: "#FFFBEB", info: "#2563EB", infoBg: "#EFF6FF", purple: "#7C3AED", purpleBg: "#F5F3FF" };
const mono = "'JetBrains Mono','SF Mono',monospace", sans = "'DM Sans','Inter',system-ui,sans-serif";
const Badge = ({ children, color = "gray", style = {} }) => { const m = { green: { b: C.successBg, t: C.success }, red: { b: C.dangerBg, t: C.danger }, amber: { b: C.warningBg, t: C.warning }, blue: { b: C.infoBg, t: C.info }, purple: { b: C.purpleBg, t: C.purple }, gray: { b: "#F3F4F6", t: C.textSec } }; const c = m[color] || m.gray; return <span style={{ background: c.b, color: c.t, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", ...style }}>{children}</span>; };
const Card = ({ children, style = {} }) => <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>;
const Btn = ({ children, variant = "primary", style = {}, onClick, small }) => { const v = { primary: { background: C.amber, color: "#fff" }, secondary: { background: "#fff", color: C.text, border: `1px solid ${C.border}` }, navy: { background: C.navy, color: "#fff" }, danger: { background: C.dangerBg, color: C.danger } }; return <button onClick={onClick} style={{ border: "none", borderRadius: 8, fontFamily: sans, fontWeight: 600, cursor: "pointer", fontSize: small ? 12 : 13, padding: small ? "6px 12px" : "9px 18px", ...(v[variant] || v.primary), ...style }}>{children}</button>; };
const SectionTitle = ({ children, right }) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>{children}</h3>{right}</div>;
const ProgressBar = ({ pct, color = C.amber, h = 6 }) => <div style={{ background: "#E5E7EB", borderRadius: h, height: h, width: "100%" }}><div style={{ background: color, borderRadius: h, height: h, width: `${Math.min(pct, 100)}%` }} /></div>;
const sc = s => ({ Completed: "green", Paid: "green", InProgress: "amber", WaitingForParts: "red", QC: "purple", Booked: "blue", Confirmed: "green", Unpaid: "amber", Overdue: "red", Partial: "blue", Void: "gray", Waiting: "blue", ReadyForPickup: "green" }[s] || "gray");
const sl = s => ({ InProgress: "In Progress", WaitingForParts: "Parts", ReadyForPickup: "Ready" }[s] || s);

const clients = [
  { id: 1, name: "Peter Morrison", phone: "0435 791 593", email: "peter.m@gmail.com", type: "Individual", suburb: "Kingswood", postcode: "2747", address: "12 Main Street", since: "Mar 2019", visits: 14, spend: 4820, preferred: "SMS", notes: "Regular customer. Always books minor service + pink slip together. Prefers Saturday mornings. Pays cash or EFTPOS. Wife's car (DYZ42P) also services here — check if linked. Referred Tony Nguyen and Lisa Chen.", vehicles: [{ rego: "NSW-PL1", make: "Hyundai", model: "Tucson", year: 2017, fuel: "Diesel", trans: "Manual", km: 95200, vin: "KMHJ381CPHU123456", colour: "White", nextSvc: "12/10/2026", pink: "28/02/2027", lastSvc: "09/08/2026" }] },
  { id: 2, name: "Amit Patel", phone: "0401 340 890", email: "", type: "Individual", suburb: "Penrith", postcode: "2750", address: "", since: "Jun 2020", visits: 9, spend: 2940, preferred: "SMS", notes: "Quiet customer, always on time. Cash only.", vehicles: [{ rego: "YBI41V", make: "Toyota", model: "Camry", year: 2019, fuel: "Petrol", trans: "Auto", km: 62000, vin: "", colour: "Silver", nextSvc: "15/09/2026", pink: "—", lastSvc: "15/03/2026" }] },
  { id: 3, name: "Girish Naidu", phone: "0424 756 356", email: "", type: "Individual", suburb: "Werrington", postcode: "2747", address: "8 Parker St", since: "Jan 2021", visits: 8, spend: 3100, preferred: "Phone", notes: "Likes to wait while car is serviced. Bring from front.", vehicles: [{ rego: "CK66YW", make: "Mazda", model: "CX-5", year: 2020, fuel: "Petrol", trans: "Auto", km: 45230, vin: "JM3KFBDM0L0789012", colour: "Red", nextSvc: "09/02/2027", pink: "—", lastSvc: "09/08/2026" }] },
  { id: 4, name: "Ravinder Kaur", phone: "—", email: "", type: "Individual", suburb: "St Marys", postcode: "2760", address: "", since: "Aug 2020", visits: 6, spend: 1890, preferred: "Phone", notes: "⚠️ NO PHONE NUMBER. Husband drops car off. Need to get mobile.", vehicles: [{ rego: "BGX18S", make: "Subaru", model: "WRX", year: 2017, fuel: "Petrol", trans: "Manual", km: 78000, vin: "", colour: "Blue", nextSvc: "01/08/2026", pink: "15/11/2026", lastSvc: "01/02/2026" }] },
  { id: 5, name: "Neeran Singh", phone: "0421 565 468", email: "", type: "Individual", suburb: "Emu Plains", postcode: "2750", address: "42 River Rd", since: "Apr 2019", visits: 11, spend: 5230, preferred: "SMS", notes: "High-value customer. Had transmission rebuild last year ($2,800). Pays bank transfer, sometimes late — chase after 14 days.", vehicles: [{ rego: "BX53KO", make: "Holden", model: "Commodore", year: 2013, fuel: "Petrol", trans: "Auto", km: 145000, vin: "", colour: "Black", nextSvc: "25/05/2026", pink: "22/08/2026", lastSvc: "25/11/2025" }] },
  { id: 6, name: "Satnam Randhawa", phone: "0432 876 543", email: "satnam.r@outlook.com", type: "Individual", suburb: "Glenmore Park", postcode: "2745", address: "15 Clearview Cres", since: "Nov 2020", visits: 7, spend: 4200, preferred: "Email", notes: "Prefers email communication. Fleet manager at construction company.", vehicles: [{ rego: "YHU72U", make: "Toyota", model: "HiLux", year: 2020, fuel: "Diesel", trans: "Auto", km: 52000, vin: "", colour: "Grey", nextSvc: "01/11/2026", pink: "—", lastSvc: "18/06/2026" }] },
  { id: 7, name: "Sukhm Kamboj", phone: "0432 981 553", email: "", type: "Individual", suburb: "Cambridge Park", postcode: "2747", address: "", since: "Feb 2021", visits: 5, spend: 1560, preferred: "SMS", notes: "", vehicles: [{ rego: "ZLF882", make: "Mazda", model: "3", year: 2020, fuel: "Petrol", trans: "Auto", km: 38000, vin: "", colour: "White", nextSvc: "25/09/2026", pink: "—", lastSvc: "25/03/2026" }] },
  { id: 8, name: "Rajiv Kumar", phone: "0401 324 155", email: "", type: "Individual", suburb: "Penrith", postcode: "2750", address: "88 High St", since: "Jul 2019", visits: 12, spend: 6450, preferred: "SMS", notes: "Owns 2 Fords — this one and wife's Focus (not yet in system). Needs tow bar fitted — quote pending.", vehicles: [{ rego: "FCV93G", make: "Ford", model: "Ranger", year: 2018, fuel: "Diesel", trans: "Auto", km: 89000, vin: "MNAUMFF70HW567890", colour: "Silver", nextSvc: "05/09/2026", pink: "05/09/2026", lastSvc: "05/03/2026" }] },
  { id: 9, name: "Manmeet Singh", phone: "0468 312 445", email: "", type: "Individual", suburb: "Kingswood", postcode: "2747", address: "", since: "Sep 2020", visits: 6, spend: 2180, preferred: "SMS", notes: "Works FIFO — only available every 2nd week. Book accordingly.", vehicles: [{ rego: "CJO67Q", make: "Toyota", model: "HiLux", year: 2016, fuel: "Diesel", trans: "Manual", km: 120000, vin: "", colour: "White", nextSvc: "20/07/2026", pink: "14/12/2026", lastSvc: "20/01/2026" }] },
  { id: 10, name: "Kang & Gill Investments", phone: "0411 987 654", email: "admin@kanggill.com.au", type: "Business", suburb: "Penrith", postcode: "2750", address: "Suite 4, 120 Henry St", since: "Mar 2018", visits: 22, spend: 12400, preferred: "Email", notes: "Fleet account — 3 vehicles. Monthly invoicing. 14-day payment terms. Contact: Hardeep (accounts). Considering adding 2 more vehicles Q4 2026.", vehicles: [{ rego: "BX35DW", make: "Toyota", model: "Corolla", year: 2019, fuel: "Petrol", trans: "Auto", km: 55000, vin: "", colour: "White", nextSvc: "15/10/2026", pink: "—", lastSvc: "15/04/2026" }, { rego: "EHK91Z", make: "Toyota", model: "HiAce", year: 2018, fuel: "Diesel", trans: "Auto", km: 98000, vin: "", colour: "White", nextSvc: "01/09/2026", pink: "01/09/2026", lastSvc: "01/03/2026" }, { rego: "KG003", make: "Toyota", model: "Camry", year: 2020, fuel: "Hybrid", trans: "Auto", km: 41000, vin: "", colour: "Silver", nextSvc: "20/11/2026", pink: "—", lastSvc: "20/05/2026" }] },
  { id: 11, name: "Harpreet Gill", phone: "0423 111 222", email: "", type: "Individual", suburb: "Cranebrook", postcode: "2749", address: "", since: "May 2021", visits: 4, spend: 980, preferred: "SMS", notes: "", vehicles: [{ rego: "DRP44W", make: "Honda", model: "Civic", year: 2019, fuel: "Petrol", trans: "Auto", km: 42000, vin: "", colour: "Blue", nextSvc: "12/11/2026", pink: "—", lastSvc: "12/05/2026" }] },
  { id: 12, name: "Tony Nguyen", phone: "0412 555 678", email: "tony.n@gmail.com", type: "Individual", suburb: "Kingswood", postcode: "2747", address: "5 Cox Ave", since: "Jan 2020", visits: 10, spend: 3850, preferred: "SMS", notes: "Referred by Peter Morrison. Diesel specialist vehicles. Also has a VW Amarok not yet registered.", vehicles: [{ rego: "BYZ33K", make: "Nissan", model: "Navara", year: 2017, fuel: "Diesel", trans: "Auto", km: 112000, vin: "", colour: "Black", nextSvc: "20/08/2026", pink: "20/08/2026", lastSvc: "20/02/2026" }] },
  { id: 13, name: "Mohammed Ali", phone: "0434 222 333", email: "", type: "Individual", suburb: "Werrington", postcode: "2747", address: "", since: "Aug 2021", visits: 3, spend: 720, preferred: "SMS", notes: "New customer — drove past and walked in.", vehicles: [{ rego: "EAB19X", make: "Kia", model: "Cerato", year: 2021, fuel: "Petrol", trans: "Auto", km: 28000, vin: "", colour: "Grey", nextSvc: "05/12/2026", pink: "—", lastSvc: "05/06/2026" }] },
  { id: 14, name: "Lisa Chen", phone: "0445 888 999", email: "lisa.chen@yahoo.com", type: "Individual", suburb: "Emu Plains", postcode: "2750", address: "22 Wedmore Rd", since: "Apr 2020", visits: 8, spend: 2640, preferred: "Email", notes: "Referred by Peter. Very particular about cleanliness — put seat cover on before driving.", vehicles: [{ rego: "CWR55L", make: "Mazda", model: "CX-3", year: 2019, fuel: "Petrol", trans: "Auto", km: 51000, vin: "", colour: "Red", nextSvc: "18/09/2026", pink: "—", lastSvc: "18/03/2026" }] },
  { id: 15, name: "Jaspreet Dhillon", phone: "0456 777 111", email: "", type: "Individual", suburb: "Glenmore Park", postcode: "2745", address: "9 Lakewood Ct", since: "Feb 2019", visits: 15, spend: 5880, preferred: "SMS", notes: "BMW specialist requirements. Uses Castrol Edge 5W-30 only — do NOT use Penrite. Timing chain due at 120,000km.", vehicles: [{ rego: "BNM62P", make: "BMW", model: "320i", year: 2016, fuel: "Petrol", trans: "Auto", km: 105000, vin: "WBA8E1C50GK234567", colour: "Black", nextSvc: "30/08/2026", pink: "30/08/2026", lastSvc: "28/02/2026" }] },
  { id: 16, name: "Dhalla Fleet Services", phone: "0430 050 714", email: "fleet@dhalla.com.au", type: "Business", suburb: "Kingswood", postcode: "2747", address: "70A Cox Avenue", since: "Jan 2018", visits: 35, spend: 18900, preferred: "Phone", notes: "Internal fleet vehicles. Priority service — no wait. Tinku manages directly.", vehicles: [{ rego: "DHA001", make: "Toyota", model: "HiLux", year: 2021, fuel: "Diesel", trans: "Auto", km: 67000, vin: "", colour: "White", nextSvc: "01/10/2026", pink: "—", lastSvc: "01/04/2026" }, { rego: "DHA002", make: "Toyota", model: "Corolla", year: 2022, fuel: "Petrol", trans: "Auto", km: 32000, vin: "", colour: "Silver", nextSvc: "15/12/2026", pink: "—", lastSvc: "15/06/2026" }] },
  { id: 17, name: "Sam Kapoor", phone: "0467 333 444", email: "", type: "Individual", suburb: "St Marys", postcode: "2760", address: "", since: "Oct 2021", visits: 3, spend: 620, preferred: "SMS", notes: "Young driver — first car. Explain everything clearly.", vehicles: [{ rego: "FFG28R", make: "Suzuki", model: "Swift", year: 2020, fuel: "Petrol", trans: "Auto", km: 32000, vin: "", colour: "Yellow", nextSvc: "15/01/2027", pink: "—", lastSvc: "15/07/2026" }] },
  { id: 18, name: "Daniel Tran", phone: "0478 999 000", email: "d.tran@outlook.com", type: "Individual", suburb: "Penrith", postcode: "2750", address: "33 Station St", since: "Jun 2019", visits: 13, spend: 4120, preferred: "Email", notes: "Mechanic at another shop (retired). Knows his stuff — don't oversell. Does own brake pads.", vehicles: [{ rego: "CPZ81J", make: "Mitsubishi", model: "Triton", year: 2018, fuel: "Diesel", trans: "Manual", km: 96000, vin: "", colour: "Silver", nextSvc: "22/09/2026", pink: "22/09/2026", lastSvc: "22/03/2026" }] },
  { id: 19, name: "Gurpreet Bains", phone: "0489 444 555", email: "", type: "Individual", suburb: "Kingswood", postcode: "2747", address: "", since: "Mar 2022", visits: 2, spend: 384, preferred: "SMS", notes: "New car, still under warranty — check what's covered before quoting.", vehicles: [{ rego: "ENP05U", make: "Hyundai", model: "i30", year: 2022, fuel: "Petrol", trans: "Auto", km: 18000, vin: "KMHD841CPNU345678", colour: "White", nextSvc: "08/02/2027", pink: "—", lastSvc: "08/08/2026" }] },
  { id: 20, name: "Western Sydney Plumbing", phone: "0402 666 777", email: "ops@wsplumbing.com.au", type: "Business", suburb: "Penrith", postcode: "2750", address: "Unit 7, 45 Industrial Ave", since: "Sep 2019", visits: 18, spend: 9800, preferred: "Email", notes: "Fleet of 4 vans + 2 utes. Monthly PO arrangement. Contact: Steve (ops manager, 0402 666 777). 30-day terms. They're adding a new Ranger in September — book first service.", vehicles: [{ rego: "WSP100", make: "Ford", model: "Transit", year: 2019, fuel: "Diesel", trans: "Auto", km: 135000, vin: "", colour: "White", nextSvc: "10/09/2026", pink: "10/09/2026", lastSvc: "10/03/2026" }, { rego: "WSP101", make: "Ford", model: "Ranger", year: 2020, fuel: "Diesel", trans: "Auto", km: 87000, vin: "", colour: "White", nextSvc: "15/10/2026", pink: "—", lastSvc: "15/04/2026" }] },
  { id: 21, name: "Priya Sharma", phone: "0491 222 888", email: "priya.s@icloud.com", type: "Individual", suburb: "Leonay", postcode: "2750", address: "7 Valley View Rd", since: "Nov 2021", visits: 5, spend: 1450, preferred: "Email", notes: "Drives a lot for work (sales rep). High km — service every 4 months.", vehicles: [{ rego: "DXY77N", make: "Toyota", model: "RAV4", year: 2021, fuel: "Hybrid", trans: "Auto", km: 72000, vin: "", colour: "Grey", nextSvc: "15/09/2026", pink: "—", lastSvc: "15/05/2026" }] },
  { id: 22, name: "Chris O'Brien", phone: "0433 555 666", email: "", type: "Individual", suburb: "Kingswood", postcode: "2747", address: "3/18 Bringelly Rd", since: "Jul 2022", visits: 3, spend: 860, preferred: "SMS", notes: "Shift worker — only available Tue/Wed. Door handle loose on driver side.", vehicles: [{ rego: "EGH34M", make: "Volkswagen", model: "Golf", year: 2018, fuel: "Petrol", trans: "Auto", km: 68000, vin: "", colour: "White", nextSvc: "02/11/2026", pink: "02/02/2027", lastSvc: "02/05/2026" }] },
  { id: 23, name: "Amrit Constructions", phone: "0418 777 888", email: "fleet@amritconstruct.com.au", type: "Business", suburb: "Emu Plains", postcode: "2750", address: "22 Old Bathurst Rd", since: "May 2022", visits: 8, spend: 4600, preferred: "Email", notes: "Construction company — heavy-duty vehicles. Often muddy. Charge extra for detailing if needed. Contact: Amrit (owner).", vehicles: [{ rego: "AMR01", make: "Toyota", model: "LandCruiser", year: 2019, fuel: "Diesel", trans: "Auto", km: 110000, vin: "", colour: "White", nextSvc: "01/10/2026", pink: "01/10/2026", lastSvc: "01/04/2026" }] },
  { id: 24, name: "Jenny Williams", phone: "0455 111 333", email: "j.williams@bigpond.com", type: "Individual", suburb: "Glenmore Park", postcode: "2745", address: "28 Ridgeline Dr", since: "Jan 2023", visits: 2, spend: 338, preferred: "Phone", notes: "Elderly customer — husband used to bring car. Now drives herself. Be patient, explain clearly. Daughter's number as backup: 0412 999 000.", vehicles: [{ rego: "AZQ18H", make: "Honda", model: "Jazz", year: 2017, fuel: "Petrol", trans: "Auto", km: 48000, vin: "", colour: "Blue", nextSvc: "20/01/2027", pink: "20/07/2027", lastSvc: "20/07/2026" }] },
];

const histories = {
  "Peter Morrison": [
    { date: "09/08/2026", type: "Minor Service", rego: "NSW-PL1", amount: 169.40, status: "Paid", inv: "INV-0091", mechanic: "Baljit", bay: "Bay 1" },
    { date: "12/04/2026", type: "Minor Service + Pink Slip", rego: "NSW-PL1", amount: 226.60, status: "Paid", inv: "INV-0078", mechanic: "Baljit", bay: "Bay 1" },
    { date: "08/10/2025", type: "Front Brake Repl. + Tyre Rotation", rego: "NSW-PL1", amount: 462.00, status: "Paid", inv: "INV-0065", mechanic: "Harman", bay: "Bay 2" },
    { date: "15/04/2025", type: "Major Service", rego: "NSW-PL1", amount: 385.00, status: "Paid", inv: "INV-0051", mechanic: "Baljit", bay: "Bay 1" },
    { date: "02/11/2024", type: "Pink Slip + Minor Service", rego: "NSW-PL1", amount: 226.60, status: "Paid", inv: "INV-0038", mechanic: "Baljit", bay: "Bay 3" },
    { date: "18/04/2024", type: "Minor Service", rego: "NSW-PL1", amount: 169.40, status: "Paid", inv: "INV-0024", mechanic: "Manveer", bay: "Bay 1" },
    { date: "10/10/2023", type: "Clutch Replacement", rego: "NSW-PL1", amount: 1045.00, status: "Paid", inv: "INV-0015", mechanic: "Harman", bay: "Bay 2" },
    { date: "12/04/2023", type: "Major Service + Coolant Flush", rego: "NSW-PL1", amount: 517.00, status: "Paid", inv: "INV-0009", mechanic: "Baljit", bay: "Bay 1" },
    { date: "05/10/2022", type: "Minor Service", rego: "NSW-PL1", amount: 154.00, status: "Paid", inv: "INV-0005", mechanic: "Baljit", bay: "Bay 1" },
    { date: "20/03/2022", type: "Battery + Minor Service", rego: "NSW-PL1", amount: 334.00, status: "Paid", inv: "INV-0002", mechanic: "Baljit", bay: "Bay 1" },
  ],
  "default": [
    { date: "09/08/2026", type: "Minor Service", rego: "—", amount: 169.40, status: "Paid", inv: "INV-0090", mechanic: "Baljit", bay: "Bay 1" },
    { date: "05/02/2026", type: "Major Service", rego: "—", amount: 385.00, status: "Paid", inv: "INV-0070", mechanic: "Harman", bay: "Bay 2" },
    { date: "18/08/2025", type: "Minor Service + Pink Slip", rego: "—", amount: 226.60, status: "Paid", inv: "INV-0055", mechanic: "Baljit", bay: "Bay 1" },
  ],
};

const revenueData = [{ month: "May", rev: 24100 }, { month: "Jun", rev: 22600 }, { month: "Jul", rev: 26300 }, { month: "Aug", rev: 14200 }];
const bayData = [
  { bay: "Bay 1 — Hoist", rego: "CK66YW", vehicle: "2020 Mazda CX-5", job: "Major Service", mechanic: "Baljit Gugu", status: "InProgress", pct: 65, since: "09:00" },
  { bay: "Bay 2 — Hoist", rego: "BGX18S", vehicle: "2017 Subaru WRX", job: "Front Brake Repl.", mechanic: "Harman", status: "WaitingForParts", pct: 30, since: "09:30" },
  { bay: "Bay 3 — Ground", rego: "YBI41V", vehicle: "2019 Toyota Camry", job: "Pink Slip", mechanic: "Baljit Gugu", status: "QC", pct: 90, since: "10:00" },
  { bay: "Bay 4 — Tyre Bay", rego: "BNM62P", vehicle: "2016 BMW 320i", job: "Tyre Replace ×4", mechanic: "Ash", status: "InProgress", pct: 40, since: "10:00" },
];
const schedule = [
  { time: "07:30", client: "Peter Morrison", rego: "NSW-PL1", job: "Minor Service", bay: "Bay 1", mech: "Baljit", status: "Completed", amount: 169.40 },
  { time: "08:00", client: "Tony Nguyen", rego: "BYZ33K", job: "Diagnostic Scan", bay: "Bay 3", mech: "Manveer", status: "Completed", amount: 88.00 },
  { time: "08:30", client: "Daniel Tran", rego: "CPZ81J", job: "Coolant Flush", bay: "Bay 2", mech: "Harman", status: "Completed", amount: 132.00 },
  { time: "09:00", client: "Girish Naidu", rego: "CK66YW", job: "Major Service", bay: "Bay 1", mech: "Baljit", status: "InProgress", amount: 385.00 },
  { time: "09:30", client: "Ravinder Kaur", rego: "BGX18S", job: "Front Brake Repl.", bay: "Bay 2", mech: "Harman", status: "WaitingForParts", amount: 308.00 },
  { time: "10:00", client: "Amit Patel", rego: "YBI41V", job: "Pink Slip", bay: "Bay 3", mech: "Baljit", status: "QC", amount: 57.20 },
  { time: "10:00", client: "Jaspreet Dhillon", rego: "BNM62P", job: "Tyre Replace ×4", bay: "Bay 4", mech: "Ash", status: "InProgress", amount: 440.00 },
  { time: "11:00", client: "Priya Sharma", rego: "DXY77N", job: "Minor Service", bay: "Bay 3", mech: "Manveer", status: "Confirmed", amount: 169.40 },
  { time: "11:30", client: "Kang & Gill", rego: "EHK91Z", job: "Minor + AC Regas", bay: "Bay 1", mech: "Baljit", status: "Booked", amount: 367.40 },
  { time: "12:00", client: "Lisa Chen", rego: "CWR55L", job: "Minor Service", bay: "Bay 3", mech: "Manveer", status: "Booked", amount: 169.40 },
  { time: "13:00", client: "Neeran Singh", rego: "BX53KO", job: "Battery Replace", bay: "Bay 1", mech: "Baljit", status: "Booked", amount: 198.00 },
  { time: "13:30", client: "Rajiv Kumar", rego: "FCV93G", job: "Diagnostic + Pink Slip", bay: "Bay 3", mech: "Manveer", status: "Booked", amount: 145.20 },
  { time: "14:00", client: "Chris O'Brien", rego: "EGH34M", job: "Minor Service", bay: "Bay 2", mech: "Harman", status: "Booked", amount: 169.40 },
  { time: "14:30", client: "Sam Kapoor", rego: "FFG28R", job: "Minor Service", bay: "Bay 4", mech: "Ash", status: "Booked", amount: 169.40 },
  { time: "15:00", client: "W.S. Plumbing", rego: "WSP100", job: "Major Service", bay: "Bay 1", mech: "Baljit", status: "Booked", amount: 385.00 },
];
const recentInv = [
  { inv: "INV-0091", client: "Peter Morrison", rego: "NSW-PL1", amount: 169.40, status: "Paid", date: "09/08/2026", method: "EFTPOS" },
  { inv: "INV-0090", client: "Tony Nguyen", rego: "BYZ33K", amount: 88.00, status: "Paid", date: "09/08/2026", method: "Cash" },
  { inv: "INV-0089", client: "Girish Naidu", rego: "CK66YW", amount: 385.00, status: "Unpaid", date: "09/08/2026", method: "—" },
  { inv: "INV-0088", client: "Daniel Tran", rego: "CPZ81J", amount: 132.00, status: "Paid", date: "09/08/2026", method: "PayID" },
  { inv: "INV-0087", client: "Satnam Randhawa", rego: "YHU72U", amount: 280.00, status: "Paid", date: "08/08/2026", method: "Transfer" },
  { inv: "INV-0086", client: "Harpreet Gill", rego: "DRP44W", amount: 169.40, status: "Paid", date: "08/08/2026", method: "EFTPOS" },
  { inv: "INV-0085", client: "Neeran Singh", rego: "BX53KO", amount: 1400.00, status: "Overdue", date: "25/07/2026", method: "—" },
  { inv: "INV-0084", client: "Kang & Gill", rego: "BX35DW", amount: 234.00, status: "Paid", date: "06/08/2026", method: "Transfer" },
  { inv: "INV-0083", client: "Manmeet Singh", rego: "CJO67Q", amount: 350.00, status: "Paid", date: "05/08/2026", method: "EFTPOS" },
  { inv: "INV-0082", client: "Peter Morrison", rego: "NSW-PL1", amount: 420.00, status: "Overdue", date: "12/07/2026", method: "—" },
  { inv: "INV-0081", client: "W.S. Plumbing", rego: "WSP100", amount: 385.00, status: "Paid", date: "01/08/2026", method: "Transfer" },
  { inv: "INV-0080", client: "Amrit Construct.", rego: "AMR01", amount: 520.00, status: "Partial", date: "28/07/2026", method: "Transfer" },
];

const navItems = [ { icon: "📊", label: "Dashboard" }, { icon: "👥", label: "Clients" }, { icon: "🚗", label: "Vehicles" }, { icon: "🔧", label: "Job Cards", badge: 4 }, { icon: "📄", label: "Invoices", badge: 3 }, { icon: "🔔", label: "Reminders", badge: 12 }, { icon: "📈", label: "Reports" }, { icon: "⚙️", label: "Settings" } ];
const Sidebar = ({ active, onNav }) => <div style={{ width: 220, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}><div style={{ padding: "20px 16px 16px" }}><div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>MECHWISE</div><div style={{ fontSize: 11, color: C.amber, fontWeight: 500, marginTop: 2 }}>Workshop Management</div></div><div style={{ padding: "0 8px", flex: 1 }}>{navItems.map(n => <div key={n.label} onClick={() => onNav(n.label)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: active === n.label ? C.navyLight : "transparent" }}><span style={{ fontSize: 16 }}>{n.icon}</span><span style={{ fontSize: 13, fontWeight: active === n.label ? 600 : 400, color: active === n.label ? "#fff" : "rgba(255,255,255,0.7)", flex: 1 }}>{n.label}</span>{n.badge && <span style={{ background: C.amber, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{n.badge}</span>}</div>)}</div><div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>TD</div><div><div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Tinku Dhalla</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Owner · Dhalla Auto</div></div></div></div></div>;
const TopBar = ({ title }) => <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: C.card, borderBottom: `1px solid ${C.border}` }}><h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h1><div style={{ display: "flex", alignItems: "center", gap: 12 }}><input placeholder="Search rego, name, phone, invoice#..." style={{ width: 280, padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: sans, outline: "none" }} /><Btn small>＋ New Job</Btn><div style={{ position: "relative" }}><span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span><span style={{ position: "absolute", top: -4, right: -6, background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10 }}>5</span></div><div style={{ fontSize: 12, color: C.textSec }}>Sat 9 Aug 2026 · 10:42am</div></div></div>;

// DASHBOARD
const Dashboard = () => <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
  <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Good morning, Tinku 👋</h2><p style={{ fontSize: 13, color: C.textSec, margin: "4px 0 0" }}>Saturday 9 August 2026 · 4 bays active · 3 completed · 8 booked · $389.40 collected so far</p></div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
    {[{ l: "Today's Revenue", v: "$3,422", s: "3 paid · 1 pending · $389 collected", t: "+22% vs last Sat", u: true }, { l: "Active Jobs", v: "4", s: "Bay 1,2,3,4 occupied · 0 idle", t: "100% utilisation", u: true }, { l: "Outstanding", v: "$2,205", s: "2 overdue + 1 partial", t: "3 invoices", u: false }, { l: "Reminders Due", v: "12", s: "5 this week · 3 booked · 1 no phone", t: "2 overdue", u: false }].map((k, i) => <Card key={i}><div style={{ fontSize: 12, color: C.textSec, fontWeight: 500, marginBottom: 4 }}>{k.l}</div><div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 26, fontWeight: 700, fontFamily: mono }}>{k.v}</span><span style={{ fontSize: 11, fontWeight: 600, color: k.u ? C.success : C.danger }}>{k.t}</span></div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{k.s}</div></Card>)}
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
    <Card style={{ padding: 20 }}><SectionTitle right={<div style={{ display: "flex", gap: 6 }}><Badge color="amber">LIVE</Badge><Badge color="green">4/4 bays</Badge></div>}>Workshop Floor Board</SectionTitle>
      {bayData.map((b, i) => <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>{b.bay}</span><div style={{ display: "flex", gap: 6 }}><span style={{ fontSize: 10, color: C.textMuted }}>since {b.since}</span><Badge color={sc(b.status)}>{sl(b.status)}</Badge></div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.navy, letterSpacing: "0.04em" }}>{b.rego}</span><span style={{ fontSize: 12, color: C.textSec }}>{b.vehicle}</span></div>
        <div style={{ fontSize: 12, marginBottom: 6 }}>{b.job} · <span style={{ color: C.textSec }}>{b.mechanic}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><ProgressBar pct={b.pct} color={b.status === "WaitingForParts" ? C.danger : C.amber} h={6} /><span style={{ fontSize: 11, fontFamily: mono, color: C.textSec, whiteSpace: "nowrap" }}>{b.pct}%</span></div>
      </div>)}
    </Card>
    <Card style={{ padding: 20 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>{schedule.length} today · Est. ${schedule.reduce((s, x) => s + x.amount, 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>}>Schedule</SectionTitle>
      <div style={{ maxHeight: 340, overflowY: "auto" }}>{schedule.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.textSec, width: 36 }}>{s.time}</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{s.client}</div><div style={{ fontSize: 11, color: C.textSec }}>{s.job} · {s.bay} · {s.mech}</div></div>
        <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: C.navy, letterSpacing: "0.04em", width: 62 }}>{s.rego}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.textSec, width: 52, textAlign: "right" }}>${s.amount.toFixed(0)}</span>
        <Badge color={sc(s.status)} style={{ width: 52, textAlign: "center", fontSize: 10 }}>{sl(s.status)}</Badge>
      </div>)}</div>
    </Card>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.3fr", gap: 20 }}>
    <Card style={{ padding: 16 }}><SectionTitle>Alerts</SectionTitle>
      {[{ i: "⚠️", t: "INV-0082 — Peter Morrison — $420 (28d overdue)", c: C.danger }, { i: "⚠️", t: "INV-0085 — Neeran Singh — $1,400 (15d overdue)", c: C.danger }, { i: "💳", t: "INV-0080 — Amrit Construct. — $260 partial remaining", c: C.warning }, { i: "📋", t: "Pink slip: BX53KO expires in 13 days", c: C.warning }, { i: "📋", t: "Pink slip: BYZ33K expires in 11 days", c: C.warning }, { i: "📋", t: "Pink slip: FCV93G expires in 27 days", c: C.warning }, { i: "📋", t: "Pink slip: BNM62P expires in 21 days", c: C.warning }, { i: "🔔", t: "12 service reminders due — 2 overdue", c: C.info }, { i: "📱", t: "Ravinder Kaur — no phone number on file", c: C.danger }, { i: "📦", t: "Waiting for parts: BGX18S front brake pads (ordered 08/08)", c: C.warning }].map((a, i) => <div key={i} style={{ display: "flex", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 12 }}>{a.i}</span><span style={{ fontSize: 11, color: a.c, fontWeight: 500 }}>{a.t}</span></div>)}
    </Card>
    <Card style={{ padding: 16 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>12 invoices</span>}>Recent Invoices</SectionTitle>
      <div style={{ maxHeight: 260, overflowY: "auto" }}>{recentInv.map((inv, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: C.navy, width: 62 }}>{inv.inv}</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 11 }}>{inv.client}</div><div style={{ fontSize: 10, color: C.textMuted }}>{inv.date}{inv.method !== "—" ? ` · ${inv.method}` : ""}</div></div>
        <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, width: 55, textAlign: "right" }}>${inv.amount.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</span>
        <Badge color={sc(inv.status)} style={{ width: 48, textAlign: "center", fontSize: 10 }}>{inv.status}</Badge>
      </div>)}</div>
    </Card>
    <Card style={{ padding: 16 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>Target $25k/mo</span>}>Revenue — 4 Months</SectionTitle>
      <ResponsiveContainer width="100%" height={150}><BarChart data={revenueData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} /><YAxis tick={{ fontSize: 11, fill: C.textSec }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} /><Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} /><Bar dataKey="rev" fill={C.navy} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
      <div style={{ marginTop: 6 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: C.textSec }}>Aug progress (9 days)</span><span style={{ fontFamily: mono, fontWeight: 600 }}>$14,200 / $25,000</span></div><ProgressBar pct={56.8} color={C.amber} h={8} /><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted, marginTop: 4 }}><span>Daily avg: $1,578</span><span>Pace: $34,709 projected</span></div></div>
    </Card>
  </div>
</div>;

// CLIENT DETAIL
const ClientScreen = () => {
  const [sel, setSel] = useState(0), [veh, setVeh] = useState(0), [list, setList] = useState(true);
  const c = clients[sel]; const v = c.vehicles[veh]; const hist = histories[c.name] || histories["default"].map(h => ({ ...h, rego: c.vehicles[0]?.rego || "—" }));
  if (list) return <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Clients <span style={{ fontWeight: 400, color: C.textSec }}>({clients.length})</span></h2><div style={{ display: "flex", gap: 8 }}><input placeholder="Search clients..." style={{ width: 220, padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: sans, outline: "none" }} /><Btn small>＋ Add Client</Btn></div></div>
    <Card style={{ padding: 0, overflow: "hidden" }}><div style={{ maxHeight: 560, overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ background: C.navy, position: "sticky", top: 0 }}>{["Name", "Phone", "Type", "Suburb", "Vehicles", "Visits", "Spend", "Last Visit", ""].map(h => <th key={h} style={{ padding: "10px 10px", fontSize: 11, fontWeight: 600, color: "#fff", textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{clients.map((cl, i) => <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }} onClick={() => { setSel(i); setVeh(0); setList(false); }}>
          <td style={{ padding: "9px 10px", fontSize: 13, fontWeight: 500 }}>{cl.name}</td>
          <td style={{ padding: "9px 10px", fontFamily: mono, fontSize: 12, color: cl.phone === "—" ? C.danger : C.text }}>{cl.phone}</td>
          <td style={{ padding: "9px 10px" }}><Badge color={cl.type === "Business" ? "purple" : "blue"}>{cl.type === "Business" ? "Business" : "Individual"}</Badge></td>
          <td style={{ padding: "9px 10px", fontSize: 12, color: C.textSec }}>{cl.suburb} {cl.postcode}</td>
          <td style={{ padding: "9px 10px" }}>{cl.vehicles.map(v => <span key={v.rego} style={{ fontFamily: mono, fontSize: 11, color: C.navy, fontWeight: 600, marginRight: 4, background: "#F0F4FF", padding: "1px 6px", borderRadius: 4 }}>{v.rego}</span>)}</td>
          <td style={{ padding: "9px 10px", fontFamily: mono, fontSize: 12, textAlign: "center" }}>{cl.visits}</td>
          <td style={{ padding: "9px 10px", fontFamily: mono, fontSize: 12, fontWeight: 600 }}>${cl.spend.toLocaleString()}</td>
          <td style={{ padding: "9px 10px", fontFamily: mono, fontSize: 11, color: C.textSec }}>{cl.vehicles[0]?.lastSvc || "—"}</td>
          <td style={{ padding: "9px 10px", color: C.amber }}>→</td>
        </tr>)}</tbody>
      </table>
    </div></Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 12, color: C.textSec }}><span>{clients.length} clients · {clients.filter(c => c.type === "Business").length} business · {clients.filter(c => c.phone === "—").length} missing phone</span><span>Total lifetime spend: ${clients.reduce((s, c) => s + c.spend, 0).toLocaleString()}</span></div>
  </div>;

  return <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><span onClick={() => setList(true)} style={{ fontSize: 13, color: C.amber, cursor: "pointer", fontWeight: 500 }}>← Clients</span><h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{c.name}</h2><Badge color={c.type === "Business" ? "purple" : "green"}>{c.type === "Business" ? "Business" : "Active"}</Badge>{c.phone === "—" && <Badge color="red">No Phone</Badge>}</div>
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div><div><div style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 12, color: C.textSec }}>Since {c.since} · {c.preferred} preferred</div></div></div>
          {[{ i: "📱", l: "Mobile", v: c.phone, m: true }, { i: "✉️", l: "Email", v: c.email || "Not provided" }, { i: "📍", l: "Address", v: c.address ? `${c.address}, ${c.suburb} ${c.postcode}` : `${c.suburb} ${c.postcode}` }].map((f, i) => <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderTop: `1px solid ${C.border}` }}><span style={{ fontSize: 13 }}>{f.i}</span><div><div style={{ fontSize: 11, color: C.textMuted }}>{f.l}</div><div style={{ fontSize: 13, fontFamily: f.m ? mono : sans, color: f.v === "—" || f.v === "Not provided" ? C.danger : C.text }}>{f.v}</div></div></div>)}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}><Btn small variant="secondary" style={{ flex: 1 }}>✏️ Edit</Btn><Btn small variant="secondary" style={{ flex: 1 }}>💬 SMS</Btn><Btn small style={{ flex: 1 }}>＋ New Job</Btn></div>
        </Card>
        <Card><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>{c.vehicles.length} vehicle{c.vehicles.length > 1 ? "s" : ""}</span>}>Vehicles</SectionTitle>
          {c.vehicles.map((vh, i) => <div key={i} onClick={() => setVeh(i)} style={{ border: `2px solid ${i === veh ? C.amber : C.border}`, borderRadius: 8, padding: 10, cursor: "pointer", background: i === veh ? C.amberLight : "#fff", marginBottom: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.navy, letterSpacing: "0.04em" }}>{vh.rego}</div>
            <div style={{ fontSize: 12 }}>{vh.year} {vh.make} {vh.model} {vh.colour && <span style={{ color: C.textSec }}>· {vh.colour}</span>}</div>
            <div style={{ fontSize: 11, color: C.textSec }}>{vh.fuel} · {vh.trans} · <span style={{ fontFamily: mono }}>{vh.km.toLocaleString()} km</span></div>
          </div>)}
        </Card>
        <Card><SectionTitle>Stats</SectionTitle><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{[{ l: "Total Spend", v: `$${c.spend.toLocaleString()}` }, { l: "Visits", v: c.visits }, { l: "Avg Spend", v: `$${Math.round(c.spend / Math.max(c.visits, 1))}` }, { l: "Avg Interval", v: c.visits > 2 ? `${(Math.round(((2026 - parseInt(c.since.split(" ")[1])) * 12 / c.visits) * 10) / 10)} mo` : "—" }].map((s, i) => <div key={i}><div style={{ fontSize: 11, color: C.textMuted }}>{s.l}</div><div style={{ fontSize: 18, fontWeight: 700, fontFamily: mono }}>{s.v}</div></div>)}</div></Card>
        {c.notes && <Card><SectionTitle>Notes</SectionTitle><div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{c.notes}</div></Card>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ padding: 20 }}><SectionTitle>Vehicle — <span style={{ fontFamily: mono, color: C.navy }}>{v.rego}</span> {v.colour && <Badge color="gray">{v.colour}</Badge>}</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>{[{ l: "Make / Model", v: `${v.make} ${v.model}` }, { l: "Year", v: v.year }, { l: "Fuel", v: v.fuel }, { l: "Trans.", v: v.trans }, { l: "Mileage", v: `${v.km.toLocaleString()} km`, m: true }, { l: "VIN", v: v.vin || "Not recorded", m: true }, { l: "Colour", v: v.colour || "—" }, { l: "Registered", v: "NSW" }].map((f, i) => <div key={i}><div style={{ fontSize: 11, color: C.textMuted }}>{f.l}</div><div style={{ fontSize: 13, fontWeight: 500, fontFamily: f.m ? mono : sans, color: f.v === "Not recorded" ? C.textMuted : C.text }}>{f.v}</div></div>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>{[{ l: "Next Service Due", v: v.nextSvc, c: C.info, i: "🔧" }, { l: "Pink Slip Expiry", v: v.pink, c: v.pink === "—" ? C.textMuted : C.success, i: "📋" }, { l: "Last Service", v: v.lastSvc, c: C.textSec, i: "✅" }].map((s, i) => <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, borderLeft: `3px solid ${s.c}` }}><div style={{ fontSize: 11, color: C.textMuted }}>{s.i} {s.l}</div><div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, marginTop: 4, color: s.v === "—" ? C.textMuted : C.text }}>{s.v}</div></div>)}</div>
        </Card>
        <Card style={{ padding: 20 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>{hist.length} records · ${hist.reduce((s, h) => s + h.amount, 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>}>Service History</SectionTitle>
          <div style={{ position: "relative", paddingLeft: 20 }}><div style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 2, background: C.border }} />
            {hist.map((h, i) => <div key={i} style={{ position: "relative", paddingBottom: 14, paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: -16, top: 8, width: 10, height: 10, borderRadius: "50%", background: i === 0 ? C.amber : h.type.includes("Clutch") || h.type.includes("Brake") ? C.info : C.border, border: "2px solid #fff" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{h.type}</div><div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}><span style={{ fontFamily: mono }}>{h.date}</span> · <span style={{ fontFamily: mono, color: C.navy }}>{h.rego}</span> · <span style={{ fontFamily: mono }}>{h.inv}</span> · {h.mechanic} · {h.bay}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600 }}>${h.amount.toFixed(2)}</div><Badge color={sc(h.status)}>{h.status}</Badge></div>
              </div>
            </div>)}
          </div>
        </Card>
      </div>
    </div>
  </div>;
};

// JOB CARD
const jobItems = [
  { desc: "Engine oil change (Penrite 10W-40 Semi-Synth 5L)", type: "Labour + Part", part: "PEN-10W40-5", est: 0.3, actual: 0.3, price: 74.00, done: true },
  { desc: "Oil filter replacement (Z432)", type: "Part", part: "Z432", est: 0.1, actual: 0.1, price: 18.00, done: true },
  { desc: "Engine flush additive (EF-500)", type: "Part", part: "EF-500", est: 0.1, actual: 0.1, price: 28.00, done: true },
  { desc: "Air filter replacement (A1215)", type: "Part", part: "A1215", est: 0.15, actual: 0.2, price: 55.00, done: true },
  { desc: "Cabin/pollen filter replacement", type: "Part", part: "CF-CX5", est: 0.15, actual: 0.0, price: 40.00, done: false },
  { desc: "Spark plug replacement ×4 (SP-3924)", type: "Labour + Part", part: "SP-3924", est: 0.5, actual: 0.0, price: 32.00, done: false },
  { desc: "Brake fluid top-up & partial bleed", type: "Labour + Part", part: "BF-DOT4", est: 0.3, actual: 0.0, price: 63.00, done: false },
  { desc: "25-point safety inspection", type: "Labour", part: "—", est: 0.5, actual: 0.0, price: 40.00, done: false },
  { desc: "Coolant level check & top-up", type: "Labour + Part", part: "CLT-RED", est: 0.1, actual: 0.0, price: 15.00, done: false },
  { desc: "Battery load test & terminal clean", type: "Labour", part: "—", est: 0.1, actual: 0.0, price: 0.00, done: false },
  { desc: "Reset service indicator (OBD2)", type: "Labour", part: "—", est: 0.05, actual: 0.0, price: 0.00, done: false },
  { desc: "Top-up washer fluid", type: "Part", part: "WF-1L", est: 0.02, actual: 0.0, price: 5.00, done: false },
];
const statuses = ["Booked","Waiting","InProgress","WaitingForParts","QC","ReadyForPickup","Completed"];

const JobCardScreen = () => {
  const [status, setStatus] = useState("InProgress");
  const [items, setItems] = useState(jobItems);
  const done = items.filter(l => l.done).length, pct = (done / items.length) * 100;
  const tot = items.reduce((s, l) => s + l.price, 0), gst = Math.round(tot * 10) / 100;
  return <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><span style={{ fontSize: 13, color: C.textSec }}>← Job Cards</span><span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy }}>JC-0089</span><Badge color={sc(status)}>{sl(status)}</Badge><Badge color="amber">Normal</Badge><div style={{ flex: 1 }} /><span style={{ fontSize: 12, color: C.textSec }}>Created: 09/08/2026 08:45am by Tinku</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ padding: 12 }}><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{statuses.map(s => <button key={s} onClick={() => setStatus(s)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, fontFamily: sans, cursor: "pointer", background: status === s ? ({ amber: C.warningBg, green: C.successBg, red: C.dangerBg, purple: C.purpleBg, blue: C.infoBg }[sc(s)] || "#F3F4F6") : "#F3F4F6", color: status === s ? ({ amber: C.warning, green: C.success, red: C.danger, purple: C.purple, blue: C.info }[sc(s)] || C.textMuted) : C.textMuted, border: status === s ? "2px solid currentColor" : "2px solid transparent" }}>{sl(s)}</button>)}</div></Card>
        <Card style={{ padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span><span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.amber }}>{done}/{items.length} items · {pct.toFixed(0)}%</span></div><ProgressBar pct={pct} color={C.amber} h={10} /></Card>
        <Card style={{ padding: 18 }}><SectionTitle right={<span style={{ fontSize: 12, color: C.textSec }}>Major Service — CK66YW — 2020 Mazda CX-5</span>}>Work Items</SectionTitle>
          {items.map((item, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
            <div onClick={() => { const n = [...items]; n[i] = { ...n[i], done: !n[i].done }; setItems(n); }} style={{ width: 28, height: 28, borderRadius: 6, border: `2px solid ${item.done ? C.success : C.border}`, background: item.done ? C.successBg : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.success, flexShrink: 0 }}>{item.done && "✓"}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: item.done ? C.textSec : C.text, textDecoration: item.done ? "line-through" : "none" }}>{item.desc}</div><div style={{ fontSize: 11, color: C.textMuted }}>{item.type} {item.part !== "—" && <span>· Part: <span style={{ fontFamily: mono }}>{item.part}</span></span>} · Est: {item.est}hr {item.done && <span>· Actual: <span style={{ fontFamily: mono, color: item.actual > item.est ? C.danger : C.success }}>{item.actual}hr</span></span>}</div></div>
            <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: item.price > 0 ? C.text : C.textMuted }}>{item.price > 0 ? `$${item.price.toFixed(2)}` : "incl."}</span>
          </div>)}
        </Card>
        <Card style={{ padding: 14 }}><SectionTitle>Internal Notes</SectionTitle><div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Rear brake pads ~40% remaining — recommend replacing within 10,000km. Minor oil seep at rocker cover gasket — monitor, not urgent. Customer waiting in reception. Cabin filter was heavily clogged with leaves — showed customer.</div></Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card><SectionTitle>Job Details</SectionTitle>{[["Quote", "QT-0042"], ["Client", "Girish Naidu"], ["Phone", "0424 756 356"], ["Vehicle", "CK66YW"], ["Make", "2020 Mazda CX-5 (Red)"], ["Mileage In", "45,230 km"], ["Mechanic", "Baljit Gugu (MVRL)"], ["Bay", "Bay 1 — Hoist"], ["Date In", "09/08/2026 09:00"], ["Due", "09/08/2026 12:00"]].map(([l, v], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 12, color: C.textSec }}>{l}</span><span style={{ fontSize: 12, fontWeight: 500, fontFamily: ["Quote", "Vehicle", "Mileage In", "Date In", "Due", "Phone"].includes(l) ? mono : sans, color: C.text }}>{v}</span></div>)}</Card>
        <Card><SectionTitle>Financials</SectionTitle>
          {[["Parts", `$${items.filter(i => i.type.includes("Part")).reduce((s, i) => s + i.price, 0).toFixed(2)}`], ["Labour", `$${items.filter(i => i.type === "Labour").reduce((s, i) => s + i.price, 0).toFixed(2)}`], ["Subtotal (ex-GST)", `$${tot.toFixed(2)}`], ["GST (10%)", `$${gst.toFixed(2)}`]].map(([l, v], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span style={{ color: C.textSec }}>{l}</span><span style={{ fontFamily: mono }}>{v}</span></div>)}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, paddingTop: 8, borderTop: `2px solid ${C.navy}` }}><span>Total</span><span style={{ fontFamily: mono, color: C.navy }}>${(tot + gst).toFixed(2)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSec, marginTop: 8 }}><span>Est. hours: 2.37</span><span>Actual: <span style={{ fontFamily: mono, color: C.warning }}>0.70</span></span></div>
        </Card>
        <Card><SectionTitle>Next Service</SectionTitle><div style={{ fontSize: 13 }}>📅 Due: <span style={{ fontFamily: mono }}>09/02/2027</span> (6 months)</div><div style={{ fontSize: 13, marginTop: 4 }}>📏 Or at: <span style={{ fontFamily: mono }}>55,230 km</span> (+10,000 km)</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Auto-created on completion</div></Card>
        <Card><SectionTitle>Customer Notes</SectionTitle><div style={{ fontSize: 13, color: C.textSec }}>Customer requested: "Check why steering feels slightly off at highway speed." Showed up in 25-point — tracking slightly out, recommend wheel alignment at next visit.</div></Card>
        <Btn variant="navy" style={{ width: "100%" }}>✓ Complete → Generate Invoice</Btn>
        <Btn variant="secondary" style={{ width: "100%" }}>Add Supplementary Quote</Btn>
      </div>
    </div>
  </div>;
};

// INVOICE
const invLines = [
  { desc: "Engine oil change (Penrite 10W-40 Semi-Synth 5L)", qty: 1, unit: 74.00, type: "Labour + Part" },
  { desc: "Oil filter replacement (Z432)", qty: 1, unit: 18.00, type: "Part" },
  { desc: "Engine flush additive (EF-500)", qty: 1, unit: 28.00, type: "Part" },
  { desc: "Air filter replacement (A1215)", qty: 1, unit: 55.00, type: "Part" },
  { desc: "Cabin/pollen filter replacement", qty: 1, unit: 40.00, type: "Part" },
  { desc: "Spark plug replacement (SP-3924)", qty: 4, unit: 8.00, type: "Part" },
  { desc: "Brake fluid top-up & partial bleed", qty: 1, unit: 63.00, type: "Labour + Part" },
  { desc: "25-point safety inspection", qty: 1, unit: 40.00, type: "Labour" },
  { desc: "Coolant level check & top-up", qty: 1, unit: 15.00, type: "Labour + Part" },
  { desc: "Battery load test & terminal clean", qty: 1, unit: 0.00, type: "Labour" },
  { desc: "Reset service indicator (OBD2)", qty: 1, unit: 0.00, type: "Labour" },
  { desc: "Top-up washer fluid", qty: 1, unit: 5.00, type: "Part" },
];

const InvoiceScreen = () => {
  const sub = invLines.reduce((s, l) => s + l.qty * l.unit, 0), gst = Math.round(sub * 10) / 100, total = sub + gst;
  return <div style={{ padding: 24, background: C.bg, overflowY: "auto", flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><span style={{ fontSize: 13, color: C.textSec }}>← Invoices</span><span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy }}>INV-0089</span><Badge color="amber">Unpaid</Badge><div style={{ flex: 1 }} /><Btn small variant="secondary">📧 Email</Btn><Btn small variant="secondary">🖨 Print</Btn><Btn small variant="secondary">⬇ PDF</Btn><Btn small>💳 Record Payment</Btn></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "24px 28px", color: "#fff" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 20, fontWeight: 700 }}>Dhalla Automotive Pty Ltd</div><div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>70A Cox Avenue, Kingswood NSW 2747</div><div style={{ fontSize: 12, opacity: 0.8 }}>Ph: 0247 082 717 · Mob: 0430 050 714</div><div style={{ fontSize: 12, opacity: 0.8 }}>dhallaautomotive@yahoo.com.au</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>TAX INVOICE</div><div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>ABN: <span style={{ fontFamily: mono }}>95 611 566 888</span></div><div style={{ fontSize: 12, opacity: 0.8 }}>MVRL: <span style={{ fontFamily: mono }}>54657</span></div><div style={{ fontSize: 12, opacity: 0.8 }}>ARC: <span style={{ fontFamily: mono }}>AU44775</span></div></div></div></div>
        <div style={{ padding: "20px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div><div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Bill to</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Girish Naidu</div><div style={{ fontSize: 12, color: C.textSec }}>8 Parker St, Werrington NSW 2747</div><div style={{ fontSize: 12, color: C.textSec, fontFamily: mono }}>0424 756 356</div></div>
            <div><div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Vehicle</div><div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.navy, marginTop: 4, letterSpacing: "0.04em" }}>CK66YW</div><div style={{ fontSize: 12, color: C.textSec }}>2020 Mazda CX-5 · Petrol · Auto · Red</div><div style={{ fontSize: 12, color: C.textSec }}>VIN: <span style={{ fontFamily: mono }}>JM3KFBDM0L0789012</span></div><div style={{ fontSize: 12, color: C.textSec }}>Odometer: <span style={{ fontFamily: mono }}>45,230 km</span></div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: C.textSec }}>Invoice: <span style={{ fontFamily: mono, fontWeight: 600, color: C.text }}>INV-0089</span></div><div style={{ fontSize: 12, color: C.textSec }}>Job Card: <span style={{ fontFamily: mono, fontWeight: 600, color: C.text }}>JC-0089</span></div><div style={{ fontSize: 12, color: C.textSec }}>Quote: <span style={{ fontFamily: mono, fontWeight: 600, color: C.text }}>QT-0042</span></div><div style={{ fontSize: 12, color: C.textSec }}>Date: <span style={{ fontFamily: mono }}>09/08/2026</span></div><div style={{ fontSize: 12, color: C.textSec }}>Due: <span style={{ fontFamily: mono }}>23/08/2026</span></div><div style={{ fontSize: 12, color: C.textSec }}>Mechanic: Baljit Gugu</div></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}><thead><tr style={{ background: C.navy }}>{["#", "Description", "Type", "Qty", "Unit", "Amount"].map((h, i) => <th key={i} style={{ padding: "8px 10px", fontSize: 11, fontWeight: 600, color: "#fff", textAlign: i > 2 ? "right" : "left" }}>{h}</th>)}</tr></thead>
            <tbody>{invLines.map((l, i) => <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: l.unit === 0 ? "#FAFAFA" : "#fff" }}><td style={{ padding: "7px 10px", fontSize: 12, color: C.textSec }}>{i + 1}</td><td style={{ padding: "7px 10px", fontSize: 13 }}>{l.desc}</td><td style={{ padding: "7px 10px", fontSize: 11, color: C.textSec }}>{l.type}</td><td style={{ padding: "7px 10px", fontSize: 12, textAlign: "right", fontFamily: mono }}>{l.qty}</td><td style={{ padding: "7px 10px", fontSize: 12, textAlign: "right", fontFamily: mono }}>{l.unit > 0 ? `$${l.unit.toFixed(2)}` : "—"}</td><td style={{ padding: "7px 10px", fontSize: 12, textAlign: "right", fontFamily: mono, fontWeight: 500 }}>{l.qty * l.unit > 0 ? `$${(l.qty * l.unit).toFixed(2)}` : "incl."}</td></tr>)}</tbody></table>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ width: 260 }}>{[["Subtotal (ex-GST)", `$${sub.toFixed(2)}`], ["GST (10%)", `$${gst.toFixed(2)}`]].map(([l, v], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}><span style={{ color: C.textSec }}>{l}</span><span style={{ fontFamily: mono }}>{v}</span></div>)}<div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 18, fontWeight: 700, borderTop: `2px solid ${C.navy}`, marginTop: 4 }}><span>Total inc GST</span><span style={{ fontFamily: mono, color: C.navy }}>${total.toFixed(2)}</span></div></div></div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16 }}><div style={{ fontSize: 12, color: C.textSec }}>🔧 Next service due: <span style={{ fontFamily: mono, fontWeight: 500 }}>09/02/2027</span> or at <span style={{ fontFamily: mono, fontWeight: 500 }}>55,230 km</span></div><div style={{ fontSize: 12, color: C.amber, fontWeight: 500, marginTop: 4 }}>💡 Recommendation: Rear brake pads ~40%. Wheel alignment suggested at next visit.</div><div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>Thank you for choosing Dhalla Automotive! 🙏</div></div>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card><SectionTitle>Payment</SectionTitle><div style={{ textAlign: "center", padding: "12px 0" }}><div style={{ fontSize: 32, fontFamily: mono, fontWeight: 700, color: C.warning }}>${total.toFixed(2)}</div><Badge color="amber" style={{ marginTop: 8 }}>UNPAID</Badge><div style={{ fontSize: 12, color: C.textSec, marginTop: 8 }}>Due: <span style={{ fontFamily: mono }}>23/08/2026</span> (14 days)</div></div><div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 8 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Payment methods:</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["EFTPOS", "Cash", "Credit Card", "PayID", "Transfer", "BPay"].map(m => <span key={m} style={{ fontSize: 11, padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", color: C.textSec }}>{m}</span>)}</div></div></Card>
        <Card><SectionTitle>Linked Records</SectionTitle>{[["Quote", "QT-0042"], ["Job Card", "JC-0089"], ["Client", "Girish Naidu"], ["Vehicle", "CK66YW"], ["Mechanic", "Baljit Gugu"]].map(([l, v], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 12, color: C.textSec }}>{l}</span><span style={{ fontSize: 12, fontWeight: 500, color: C.info, cursor: "pointer" }}>{v}</span></div>)}</Card>
        <Card><SectionTitle>Auto-created</SectionTitle><div style={{ fontSize: 12, marginBottom: 6 }}>📋 Maintenance history record</div><div style={{ fontSize: 12, marginBottom: 6 }}>🔔 Reminder: <Badge color="blue">Next Service</Badge></div><div style={{ fontSize: 12, color: C.textSec }}>Due: <span style={{ fontFamily: mono }}>09/02/2027</span></div><div style={{ fontSize: 12, color: C.textSec }}>Km: <span style={{ fontFamily: mono }}>55,230</span></div></Card>
        <Card><SectionTitle>BAS Period</SectionTitle><div style={{ fontSize: 13, fontFamily: mono, color: C.navy }}>Q1 2026-27</div><div style={{ fontSize: 12, color: C.textSec }}>Jul - Sep 2026</div></Card>
        <Btn variant="danger" style={{ width: "100%" }}>Void Invoice</Btn>
      </div>
    </div>
  </div>;
};

// APP
const screens = { Dashboard, Clients: ClientScreen, "Job Cards": JobCardScreen, Invoices: InvoiceScreen };
const titles = { Dashboard: "Dashboard", Clients: "Clients", "Job Cards": "Job Card — JC-0089", Invoices: "Invoice — INV-0089" };

export default function MechWise() {
  const [screen, setScreen] = useState("Dashboard");
  const Screen = screens[screen] || Dashboard;
  return <div style={{ display: "flex", height: "100vh", fontFamily: sans, background: C.bg }}><Sidebar active={screen} onNav={setScreen} /><div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}><TopBar title={titles[screen] || screen} /><Screen /></div></div>;
}
