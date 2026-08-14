# MechWise — Build Specification for Google Gemini / AI Studio

> **Instructions for Gemini:** You are building a complete full-stack SaaS web application called MechWise — a workshop management system for Australian mechanical workshops. Build this as a React frontend with a Node.js backend. Use Firebase Auth for authentication, Firestore or Supabase for the database, and deploy to Google Cloud Run. Follow every specification below exactly. Do not skip any screen or business rule.

> **First client:** Dhalla Automotive Pty Ltd, 70A Cox Avenue, Kingswood NSW 2747, ABN 95611566888.

> **Important context:** This is an AUSTRALIAN business application. All currency is AUD ($). All display dates are DD/MM/YYYY. Timezone is Australia/Sydney. Registration numbers (regos) are the primary identifier mechanics use — always show them prominently in monospace font.

---

## TECH STACK

Use these technologies:
- **Frontend:** React 18 with TypeScript
- **Routing:** React Router v6 (or Next.js if available)
- **CSS:** Tailwind CSS 3
- **UI Components:** shadcn/ui or Radix primitives
- **Backend:** Node.js with Express (or Next.js API routes)
- **Database:** Firestore (preferred in Google ecosystem) OR Supabase PostgreSQL
- **Authentication:** Firebase Auth with email/password
- **PDF Generation:** jsPDF or @react-pdf/renderer for invoice PDFs
- **Charts:** Recharts for dashboard and reports
- **SMS:** Twilio API (configure via Secrets panel)
- **Deployment:** Google Cloud Run

---

## DESIGN SYSTEM — follow these exactly

### Color palette (use these exact hex values everywhere)
- Primary navy: `#1B2A4A` — sidebar background, headers, invoice header, primary emphasis
- Navy light: `#243656` — sidebar active item background, hover states
- Accent amber: `#E8920D` — all CTA buttons, active tabs, highlights, links, badges
- Amber light: `#FDF4E3` — amber background tints, selected states
- Page background: `#F3F5F7` — the background behind all cards
- Card white: `#FFFFFF` — card surfaces, modal backgrounds
- Border: `#E5E7EB` — card borders, table row dividers, input borders
- Text primary: `#1F2937` — main body text
- Text secondary: `#6B7280` — supporting text, labels
- Text muted: `#9CA3AF` — placeholders, hints
- Success green: `#059669` — Paid, Completed, Confirmed, healthy stock
- Success background: `#ECFDF5`
- Danger red: `#DC2626` — Overdue, Critical, Out of stock
- Danger background: `#FEF2F2`
- Warning amber: `#D97706` — In Progress, Unconfirmed, Getting low
- Warning background: `#FFFBEB`
- Info blue: `#2563EB` — Booked, informational
- Info background: `#EFF6FF`
- Purple: `#7C3AED` — margin display, pink slip badges

### Typography
- Body font: `'DM Sans', 'Inter', system-ui, sans-serif`
- Monospace font: `'JetBrains Mono', 'SF Mono', monospace`
- Import from Google Fonts: DM Sans (400, 500, 600, 700) and JetBrains Mono (400, 500, 600, 700)
- Use monospace font for ALL of these: registration numbers, invoice numbers (INV-0089), job card numbers (JC-0089), part numbers (Z432), prices ($154.00), phone numbers (0435 791 593), VINs, ABNs, dates in data displays
- Add letter-spacing: 0.04em on registration numbers specifically

### Component styles
- Cards: white background, 1px solid #E5E7EB border, border-radius 12px, padding 16-20px
- Primary buttons: background #E8920D, white text, border-radius 8px, font-weight 600
- Secondary buttons: white background, 1px border, dark text, border-radius 8px
- Status badges: border-radius 20px, padding 2px 10px, font-size 11px, font-weight 600, semi-transparent background
- Status badge colors: Paid/Completed/Confirmed = green. Unpaid/Booked = blue. Overdue/Critical = red. In Progress = amber. Draft/Pending = gray. Cancelled = muted gray
- Tables: font-size 13px, navy header row (#1B2A4A) with white text, 1px bottom border per row
- Sidebar navigation: navy background #1B2A4A, width 220-240px, collapsible. Active item = lighter navy background. Each item has an icon + label. Show badge counts for items with active alerts

---

## DATABASE SCHEMA

Create these collections/tables. If using Firestore, use subcollections where noted. If using PostgreSQL/Supabase, create these as relational tables. Every collection with business data must include a `workshopId` field for multi-tenant filtering.

### workshops
```
id, businessName, abn, mvrlNumber, arcNumber, address, suburb, state (default "NSW"),
postcode, phone, mobile, email, website, logoUrl, operatingHours (JSON),
defaultLabourRate (default 80.00), maxDiscountPct (default 15),
smsSenderName, smsWindowStart (default "09:00"), smsWindowEnd (default "20:00"),
nextInvoiceNum (default 1), nextQuoteNum (default 1), nextJobCardNum (default 1),
createdAt, updatedAt
```

### clients
```
id, workshopId, clientType (default "Individual" — or "Business"),
firstName, lastName, businessName, mobilePhone, homePhone, email,
address, suburb, state, postcode, preferredContact (default "SMS"),
notes (text), isActive (default true), createdAt, updatedAt
```

### vehicles
```
id, workshopId, registration (UNIQUE per workshop — this is the primary lookup field),
makeId, model, year, colour, fuelType, transmission, engineCapacity, vin,
currentMileageKm, nextServiceDue, nextServiceKm, pinkSlipExpiry,
isActive (default true), createdAt, updatedAt
```

### vehicleMakes
```
id, name (unique) — pre-populate with: Toyota, Hyundai, Mazda, Subaru, Holden, Ford,
Honda, Nissan, BMW, Mercedes-Benz, Kia, Mitsubishi, Volkswagen, Audi, Suzuki
```

### clientVehicles (junction — links clients to vehicles, many-to-many)
```
id, clientId, vehicleId, relationship (default "Owner"), isPrimaryOwner (default true),
ownershipStart, ownershipEnd
```

### staff
```
id, workshopId, firstName, lastName, mobilePhone, email,
role ("Mechanic"/"Apprentice"/"Front Desk"/"Manager"/"Owner"),
hourlyRate, isMvrlCertified (default false), isArcCertified (default false),
isActive (default true), createdAt
```

### users (login accounts)
```
id, workshopId, email (unique), passwordHash, displayName,
role ("Owner"/"Manager"/"FrontDesk"/"Mechanic"/"ReadOnly"),
staffId, isActive (default true), lastLoginAt, createdAt
```

### bays
```
id, workshopId, name ("Bay 1 — Hoist"), bayType ("Hoist"/"Ground Level"/"Tyre Bay"),
isActive (default true), displayOrder
```

### jobCategories
```
id, workshopId, name (unique per workshop), description, displayOrder, isActive
```

### jobs
```
id, categoryId, name, description, standardTotalPrice, estimatedDuration (hours),
isLocked (default false), isActive
```

### jobSubItems
```
id, jobId, name, partCost, labourTimeHrs, labourRateHr, labourCost,
standardPrice, isActive
```

### jobCards
```
id, workshopId, jobCardNumber ("JC-0001" — sequential per workshop),
clientId, vehicleId, staffId (assigned mechanic), dateIn, dateDue, dateCompleted,
mileageIn, bayNumber,
status (default "Booked" — values: Booked/Waiting/InProgress/WaitingForParts/QC/ReadyForPickup/Completed/Cancelled),
priority (default "Normal" — Urgent/Normal/Low),
totalExGst, internalNotes, customerNotes, createdAt
```

### jobCardLines
```
id, jobCardId, lineType ("Labour"/"Part"/"Subcontract"/"Sundry"),
description, qty (default 1), unitPriceExGst, lineTotalExGst,
actualLabourHrs, staffId, isCompleted (default false), sortOrder
```

### invoices
```
id, workshopId, invoiceNumber ("INV-0001" — sequential, NO GAPS EVER — ATO legal requirement),
jobCardId (unique), clientId, vehicleId, invoiceDate, dueDate,
subtotalExGst, gstAmount, discountAmount, finalAmount,
paymentStatus (default "Unpaid" — Paid/Unpaid/Overdue/Partial/Void),
nextServiceDue, nextServiceKm, createdAt
```

### invoiceLines
```
id, invoiceId, lineType, description, qty, unitPriceExGst, lineTotalExGst,
gstRate (default 0.10), gstAmount, sortOrder
```

### payments
```
id, workshopId, invoiceId, clientId, amount,
paymentMethod ("Cash"/"CreditCard"/"EFTPOS"/"PayID"/"BankTransfer"/"BPay"),
paymentDate, paymentRef ("VISA ****4521"), notes, createdAt
```

### serviceReminders
```
id, workshopId, vehicleId, clientId,
reminderType ("NextService"/"PinkSlip"),
dueDate, dueMileageKm, lastServiceDate,
status (default "Pending" — Pending/Sent/Booked/Completed/Declined),
smsSentDate, sendCount (default 0), clientResponse, createdAt
```

### maintenanceHistory
```
id, vehicleId, jobCardId, invoiceId, serviceDate, serviceType,
description, staffId, mileage, totalCost, customerNotes, internalNotes, createdAt
```

### ledgerEntries
```
id, workshopId, transactionDate, basPeriod ("Q1 2025-26"),
entityType, entityName, transactionType ("Invoice"/"Payment"/"Purchase"),
direction ("Incoming"/"Outgoing"), amountExGst, gstAmount, amountIncGst, createdAt
```

### auditLog
```
id, workshopId, timestamp, userId, action ("CREATE"/"UPDATE"/"DELETE"),
tableName, recordId, fieldName, oldValue, newValue
```

---

## 8 SCREENS TO BUILD

Build these screens in this exact order. Each screen description tells you exactly what to display and how it should look.

### Screen 1: Login page (`/login`)
- Full-screen navy (#1B2A4A) background
- Centered white card with: MechWise logo (or "MECHWISE" text in large bold white), workshop name below, email input, password input, amber "Sign In" button
- Error message in red if login fails
- After successful login, redirect to /dashboard

### Screen 2: Layout shell (wraps all screens except login and portal)
- Left sidebar (navy, 220px wide):
  - Top: "MECHWISE" in white bold, "Workshop Management" in amber below
  - Nav items with icons: 📊 Dashboard, 👥 Clients, 🚗 Vehicles, 🔧 Job Cards (badge: active count), 📄 Invoices (badge: unpaid count), 🔔 Reminders (badge: due count), 📈 Reports, ⚙️ Settings
  - Active item has lighter navy background (#243656)
  - Bottom: user avatar circle (initials, amber bg), name, role
- Top bar:
  - Left: page title (h1, 18px, bold)
  - Right: search input with placeholder "Search rego, name, phone...", amber "＋ New job" button, notification bell with red count badge, current date
- Content area: scrollable, #F3F5F7 background, 24px padding

### Screen 3: Dashboard (`/dashboard`)
- Greeting: "Good morning, [user name] 👋" with date and summary line
- 4 KPI cards in a row: Today's Revenue (monospace, large number), Active Jobs, Overdue Invoices, Reminders Sent. Each has a label, large value, sub-text, and optional trend indicator
- 2-column layout below:
  - LEFT — Workshop Floor Board: card per bay showing bay name, rego (large monospace, navy, letter-spacing 0.04em), vehicle make/model, job type, mechanic name, status badge, progress bar. Empty bays show "Available" in muted italic
  - RIGHT — Today's Schedule: time-sorted list. Each row: time (monospace), client name, job type, bay, rego (monospace), status badge
- Bottom row:
  - LEFT — Action Items: list of alerts (overdue invoices in red, expiring pink slips in amber, available bays in green)
  - RIGHT — Revenue chart: Recharts BarChart showing last 7 months revenue with navy bars. Below: monthly target progress bar with amber fill and current/target amounts in monospace

### Screen 4: Client Detail (`/clients/[id]`)
- Back link "← Clients", client name (h2), Active badge
- 2-column layout: left sidebar (320px) + right main area
- LEFT column (stacked cards):
  - Contact card: avatar circle with initials, name, "Customer since [date]". Fields: 📱 Mobile (monospace), ✉️ Email, 📍 Address, 💬 Preferred contact. Buttons: Edit, SMS, New quote
  - Vehicles card: list of vehicles. Each shows rego (large monospace, navy), make/model/year, fuel, transmission, mileage (monospace). Selected vehicle has amber border + amber light background
  - Customer Stats card: 2×2 grid showing Total Spend, Visits, Avg Spend, Avg Interval (all values in monospace)
  - Notes card: free text
- RIGHT column:
  - Vehicle Detail card: selected vehicle's full info in 4-column grid, plus 3 service status bars (Next Service Due, Pink Slip Expiry, Last Service) with coloured left borders
  - Service History: timeline with vertical line, coloured dots (amber for most recent, gray for older). Each entry: date (monospace), service type, rego (monospace), invoice number (monospace), amount (monospace), payment badge

### Screen 5: Job Card (`/jobs/[id]`)
- Back link, job card number (large monospace, navy, "JC-0089"), status badge, priority badge
- 2-column: main (wide) + sidebar (300px)
- MAIN column:
  - Status lifecycle: 7 horizontal pill buttons (Booked → Waiting → InProgress → WaitingForParts → QC → ReadyForPickup → Completed). Active pill has coloured background + border matching its status colour. Clicking changes status
  - Progress card: "Work progress" label, "X/Y items" in monospace amber, full-width progress bar
  - Work Items checklist: each item has a large (28px) tap-friendly checkbox (green border + background when checked, checkmark). Description (strikethrough when done), type label, est/actual hours (monospace, red if actual > estimated), price (monospace). Items separated by 1px border
- SIDEBAR:
  - Job Details card: key-value pairs (Quote, Client, Vehicle, Make/Model, Mileage In, Mechanic, Bay, Date In, Due) — monospace for IDs and numbers
  - Financial Summary card: Subtotal (ex-GST), GST (10%), Total inc GST (large, bold, navy, monospace, with 2px navy top border)
  - Next Service card: auto-calculated date and km
  - Action buttons: navy "✓ Complete → Generate Invoice" (full width), secondary "Add Supplementary Quote"
- CRITICAL LOGIC: When "Complete" is clicked and all items are checked: (1) auto-generate invoice from job card lines, (2) auto-create maintenance history record, (3) auto-create service reminder for 6 months / 10,000km later, (4) update vehicle mileage

### Screen 6: Invoice (`/invoices/[id]`)
- Back link, invoice number (large monospace navy, "INV-0089"), payment status badge, action buttons (📧 Email, ⬇ PDF, 💳 Record Payment)
- 2-column: invoice document (wide) + sidebar (280px)
- INVOICE DOCUMENT (card, no padding on header):
  - Navy header block (#1B2A4A, white text): Left = workshop name (large), address, phone, mobile, email. Right = "TAX INVOICE" in amber (#E8920D), ABN (monospace), MVRL, ARC
  - Below header (padded): "Bill to" block (client name, phone), "Vehicle" block (rego in large monospace navy, make/model, fuel, odometer in monospace), invoice meta (invoice#, job card#, date, due date — all monospace)
  - Line items table: navy header row (#/Description/Qty/Unit Price/Amount), data rows with monospace numbers, 1px bottom borders
  - Totals (right-aligned, 240px wide): Subtotal (ex-GST), GST (10%), Total inc GST (large bold navy monospace, 2px navy top border)
  - Footer: "🔧 Next service due: [date] or at [km]", "Thank you for choosing [workshop name]!"
- SIDEBAR:
  - Payment Status card: large monospace amount, status badge, due date
  - Linked Records card: Quote#, Job Card#, Client, Vehicle, Mechanic — each clickable in blue
  - Reminder card: auto-created reminder type and due date
  - "Void Invoice" danger button at bottom

### Screen 7: Reminders (`/reminders`)
- 6 KPI tiles in a row: Due This Week, Due This Month, Overdue (red), Awaiting Reply, Booked (green), No Contact (red). Large monospace number, small label
- Filter tabs: Due Soon, Overdue (count), No Contact, Booked (count), All
- Table with checkbox column for bulk selection:
  - Columns: ☐, Client (name + phone), Vehicle (rego monospace + make/model), Type (badge: "Next Service" blue, "Pink Slip" purple), Due Date (monospace), Days (monospace, red if overdue, amber if <14 days), Sends (count), Status (badge), Action (Send button or "Add phone")
  - Navy header row
  - Selected rows get amber light background
- Bulk action bar appears when items selected: amber "📱 Send to N selected" button

### Screen 8: Reports (`/reports`)
- Period selector tabs: Week, Month, Quarter, Year
- 5 KPI cards with trend arrows: Revenue, Expenses, Gross Profit, Jobs Completed, Avg Invoice
- 2-column chart row:
  - Revenue vs Expenses bar chart (navy bars = revenue, gray bars = expenses, 7 months)
  - Revenue by Service Type pie chart with legend (navy, amber, blue, purple, green, gray segments)
- 2-column table row:
  - Mechanic Productivity table: Name, Jobs, Billed Hrs, Actual Hrs, Efficiency % (green if ≥100%, amber if ≥90%, red if <90%), Revenue (monospace)
  - Top Customers table: Name, Visits, Total Spend (monospace), Last Visit (monospace)
- CSV Export button

### Screen 9: Settings (`/settings`)
- Left sidebar (200px): 8 clickable sections (Business Details, Invoicing, Pricing, SMS/Email, Reminder Cadence, Users & Roles, Subscription, Branding). Active section = amber text + amber light background
- Right content area:
  - Business Details: form fields for all workshop info (name, ABN monospace, MVRL, ARC, phone, email, address). Operating hours grid (Mon-Sat, open/close times)
  - SMS/Email: sender name, send window (09:00-20:00), ACMA compliance info box (blue background), SMS usage progress bar (X/500), message templates (service reminder, pink slip, appointment confirmation) with template variable syntax ({name}, {rego}, {date})

### Screen 10: Customer Portal (`/portal/[token]`)
- SEPARATE LAYOUT — no sidebar, no top bar
- Navy header: workshop name (large, white), address and phone (small, semi-transparent)
- Welcome message with customer name
- Vehicle selector card: rego in large monospace navy + make/model. Amber border on selected
- 3 status cards with coloured left borders: Next Service Due (blue), Pink Slip Expiry (green), Total Visits (purple)
- "Book Now" CTA: full-width card with gradient navy background, large white text "Ready for your next service?", amber button "📅 Book Now"
- Recommendation banner: amber light background, lightbulb icon, mechanic's note from last visit
- Service history list: each entry has icon (🔧 or 📋), service type (bold), items list, date + invoice# (monospace), price (large monospace), "⬇ Invoice PDF" link
- Footer: workshop details, ABN, phone, email, "Powered by MECHWISE" in amber

---

## CRITICAL BUSINESS RULES — implement all of these

### GST calculation (Australian tax)
- Store ALL prices ex-GST (excluding tax) in the database
- Calculate GST per line item: line_total_ex_gst × 0.10 = gst_amount
- Display to customers: subtotal (ex-GST) + GST + total (inc-GST)
- Apply discounts BEFORE calculating GST

### BAS periods (Australian financial year runs July to June)
- Q1 = July-September, Q2 = October-December, Q3 = January-March, Q4 = April-June
- Format: "Q1 2025-26" (where 2025-26 is the financial year starting July 2025)
- Auto-assign basPeriod on every ledger entry based on the transaction date

### Sequential document numbering (ATO LEGAL REQUIREMENT)
- Invoice numbers: INV-0001, INV-0002, INV-0003... NO GAPS EVER. If an invoice is voided, it keeps its number (status = "Void") and the next invoice gets the next number
- Job card numbers: JC-0001, JC-0002...
- Use an atomic counter on the workshop record to prevent race conditions

### Job completion cascade (when "Complete" is clicked)
1. Set job card status to "Completed", set dateCompleted
2. Auto-generate invoice: copy all job card lines to invoice lines, calculate GST per line, set sequential invoice number
3. Auto-create maintenance history record for the vehicle
4. Auto-create service reminder: due date = today + 6 months, due km = current mileage + 10,000
5. Update vehicle record: currentMileageKm = mileageIn from job card, nextServiceDue and nextServiceKm from step 4
6. Auto-create ledger entry: direction = "Incoming", amounts from invoice totals

### SMS rules (ACMA Spam Act 2003 — Australian law)
- Send ONLY between 9:00am and 8:00pm AEST
- Every message MUST include "Reply STOP to opt out"
- Maximum 1 SMS per customer per week
- Pink slip reminders start at 60 days before expiry (not 30)
- Service reminders at 30, 14, 7 days before due

### Pink slip enforcement
- Only staff with isMvrlCertified = true can complete pink slip job cards
- Block the "Complete" action if assigned mechanic is not certified

### User role permissions
- Owner: full access to everything
- Manager: everything except void invoices and manage users
- FrontDesk: clients, job cards, invoices, payments, reminders. NO cost prices, NO reports
- Mechanic: only their own assigned job cards. NO financial data
- ReadOnly: view only, no create/edit/delete

---

## SEED DATA — pre-populate the database with this

### Workshop
- Dhalla Automotive Pty Ltd, ABN 95611566888, MVRL 54657, ARC AU44775
- 70A Cox Avenue, Kingswood NSW 2747
- Phone: 0247 082 717, Mobile: 0430 050 714, Email: dhallaautomotive@yahoo.com.au
- Hours: Mon-Fri 7:30am-5:00pm, Sat 8:00am-1:00pm, Sun Closed
- Default labour rate: $80/hr

### Login account
- Email: tinku@dhalla.com.au, Password: admin123, Role: Owner, Name: Tinku Dhalla

### 4 Bays
Bay 1 — Hoist, Bay 2 — Hoist, Bay 3 — Ground Level, Bay 4 — Tyre Bay

### 5 Staff
Tinku Dhalla (Owner, MVRL+ARC certified), Baljit Gugu (Mechanic, MVRL certified, $35/hr), Harman (Mechanic, $32/hr), Ash (Apprentice, $18/hr), Manveer Singh (Mechanic, $30/hr)

### 10 Clients with vehicles
1. Peter Morrison (0435 791 593) → NSW-PL1, 2017 Hyundai Tucson, Diesel, Manual, 95,200km
2. Amit (0401 340 890) → YBI41V, 2019 Toyota Camry, Petrol, Auto, 62,000km
3. Girish (0424 756 356) → CK66YW, 2020 Mazda CX-5, Petrol, Auto, 45,000km
4. Ravinder Kaur → BGX18S, 2017 Subaru WRX, Petrol, Manual, 78,000km
5. Neeran (0421 565 468) → BX53KO, 2013 Holden Commodore, Petrol, Auto, 145,000km
6. Satnam Randhawa (0432 876 543) → YHU72U, 2020 Toyota HiLux, Diesel, Auto, 52,000km
7. Sukhm Kamboj (0432 981 553) → ZLF882, 2020 Mazda 3, Petrol, Auto, 38,000km
8. Rajiv (0401 324 155) → FCV93G, 2018 Ford Ranger, Diesel, Auto, 89,000km
9. Manmeet Singh (0468 312 445) → CJO67Q, 2016 Toyota HiLux, Diesel, Manual, 120,000km
10. Kang & Gill Investments (Business, 0411 987 654) → BX35DW, 2019 Toyota Corolla, Petrol, Auto, 55,000km

### 12 Job categories with jobs
Engine Service: Minor Service ($154, 1hr), Major Service ($350, 2.5hr)
Brake System: Front Brake Replacement ($280, 1.5hr), Rear Brake Replacement ($240, 1.5hr)
Transmission: Clutch Replacement ($950, 4hr)
Cooling System: Coolant Flush ($120, 1hr)
Electrical: Battery Replacement ($180, 0.5hr)
Suspension: Wheel Alignment ($80, 0.5hr)
Tyres: Tyre Replacement ×4 ($400, 1hr)
Exhaust: Exhaust Repair ($200, 1hr)
HVAC: AC Regas ($180, 1hr)
Inspections: Pink Slip / E-Safety ($52, 0.5hr)
General: Diagnostic Scan ($80, 0.5hr)
Body: Wiper Blade Replacement ($40, 0.25hr)

### 5 Suppliers
Penrite Oil, CoolDrive Auto Parts, National Tyre Group, AutoGuru Parts, Newbee Tyre

---

## BUILD ORDER — follow this sequence

1. Set up project: React + TypeScript + Tailwind + Firebase Auth + Database
2. Create database schema and seed with all data above
3. Build login page and authentication flow
4. Build layout shell (sidebar + top bar)
5. Build Dashboard with KPIs, floor board, schedule, alerts, revenue chart
6. Build Client Detail with contact card, vehicles, stats, service history
7. Build Job Card with status lifecycle, work items checklist, completion cascade
8. Build Invoice with PDF-style layout, GST breakdown, payment recording
9. Build Reminders with filter tabs, bulk SMS, KPI tiles
10. Build Reports with charts and tables
11. Build Settings with business details and SMS config
12. Build Customer Portal with separate layout and magic-link access

---

## FINAL REMINDERS

- Navy (#1B2A4A) + amber (#E8920D) are the brand colours — use them consistently
- JetBrains Mono for ALL identifiers (regos, invoice numbers, prices, phones, dates in data)
- The workshop floor board showing live bay status is the SIGNATURE feature — make it visually impressive
- Every database query MUST filter by workshopId — this is a multi-tenant application
- Invoice numbers MUST be sequential with NO GAPS — this is Australian tax law
- All SMS must comply with ACMA: 9am-8pm only, include opt-out text, max 1 per week per customer
- Dates display as DD/MM/YYYY (Australian format), store as ISO 8601
- Currency is AUD ($), format as $1,234.56
