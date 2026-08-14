# MechWise — AI Builder Specification v2

> **What this is:** A self-contained specification for an AI coding agent to build the MechWise workshop management platform. Paste this entire document as your prompt or project instructions.

> **What to build:** A full-stack SaaS web application for Australian mechanical workshops. 8 screens. Job card workflow. SMS reminders. Customer portal. Australian GST/BAS compliance.

> **First client:** Dhalla Automotive Pty Ltd, 70A Cox Avenue, Kingswood NSW 2747, ABN 95611566888.

---

## TECH STACK

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **CSS:** Tailwind CSS 3
- **Components:** shadcn/ui + Radix primitives
- **ORM:** Prisma 5
- **Database:** PostgreSQL 15
- **Auth:** JWT via jose library (httpOnly cookies)
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts
- **Hosting:** Vercel (frontend) + Railway or Supabase (database)

---

## DESIGN SYSTEM

### Colors
```
Primary navy:     #1B2A4A  (sidebar, headers, invoice headers)
Navy light:       #243656  (sidebar active states)
Accent amber:     #E8920D  (CTAs, active tabs, highlights)
Amber light:      #FDF4E3  (selected states)
Background:       #F3F5F7  (page background)
Card:             #FFFFFF  (card surfaces)
Border:           #E5E7EB  (card borders)
Text primary:     #1F2937
Text secondary:   #6B7280
Success:          #059669  (paid, confirmed)
Danger:           #DC2626  (overdue, critical)
Warning:          #D97706  (in progress, unconfirmed)
Info:             #2563EB  (booked)
Purple:           #7C3AED  (margin display)
```

### Typography
- **Body:** DM Sans or Inter
- **Monospace:** JetBrains Mono — for ALL identifiers: regos, invoice#, job card#, part#, prices, phone numbers, VINs, ABNs

### Components
- Cards: white bg, 1px border, 12px radius
- Primary buttons: amber bg + white text, 8px radius
- Badges: 20px radius pill, semi-transparent bg, 11px bold
- Tables: navy header row, monospace for IDs/numbers
- Sidebar: navy bg (#1B2A4A), 240px wide, collapsible

---

## DATABASE SCHEMA (Prisma)

Use the full 27-model Prisma schema. Every model with business data includes workshopId for multi-tenant isolation. Key models:

```prisma
model Workshop {
  id                String   @id @default(cuid())
  businessName      String
  abn               String
  mvrlNumber        String?
  arcNumber         String?
  address           String
  suburb            String
  state             String   @default("NSW")
  postcode          String
  phone             String
  mobile            String?
  email             String
  logoUrl           String?
  operatingHours    Json?
  defaultLabourRate Decimal  @default(80.00)
  maxDiscountPct    Int      @default(15)
  smsSenderName     String?
  smsWindowStart    String   @default("09:00")
  smsWindowEnd      String   @default("20:00")
  nextInvoiceNum    Int      @default(1)
  nextQuoteNum      Int      @default(1)
  nextJobCardNum    Int      @default(1)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  // ... all relations
}

model Client {
  id               String   @id @default(cuid())
  workshopId       String
  clientType       String   @default("Individual") // "Individual" or "Business"
  firstName        String?
  lastName         String?
  businessName     String?
  mobilePhone      String?
  email            String?
  address          String?
  suburb           String?
  preferredContact String   @default("SMS")
  notes            String?  @db.Text
  isActive         Boolean  @default(true)
  // ... relations
  @@index([workshopId])
}

model Vehicle {
  id               String   @id @default(cuid())
  workshopId       String
  registration     String   // PRIMARY lookup field
  makeId           String?
  model            String?
  year             Int?
  fuelType         String?
  transmission     String?
  currentMileageKm Int?
  nextServiceDue   DateTime?
  nextServiceKm    Int?
  pinkSlipExpiry   DateTime?
  isActive         Boolean  @default(true)
  @@unique([workshopId, registration])
}

model ClientVehicle {
  clientId       String
  vehicleId      String
  relationship   String   @default("Owner")
  isPrimaryOwner Boolean  @default(true)
  @@unique([clientId, vehicleId])
}

model Staff {
  id              String   @id @default(cuid())
  workshopId      String
  firstName       String
  lastName        String?
  role            String   // "Mechanic","Apprentice","Front Desk","Manager","Owner"
  hourlyRate      Decimal?
  isMvrlCertified Boolean  @default(false) // Can do pink slips
  isArcCertified  Boolean  @default(false) // Can do AC work
  isActive        Boolean  @default(true)
}

model User {
  id           String @id @default(cuid())
  workshopId   String
  email        String @unique
  passwordHash String
  displayName  String
  role         String // "Owner","Manager","FrontDesk","Mechanic","ReadOnly"
}

model Bay {
  id       String @id @default(cuid())
  workshopId String
  name     String // "Bay 1 — Hoist"
  bayType  String // "Hoist","Ground Level","Tyre Bay"
}

model JobCategory {
  id       String @id @default(cuid())
  workshopId String
  name     String
  jobs     Job[]
  @@unique([workshopId, name])
}

model Job {
  id                 String   @id @default(cuid())
  categoryId         String
  name               String
  standardTotalPrice Decimal?
  estimatedDuration  Decimal? // hours
  subItems           JobSubItem[]
}

model JobSubItem {
  id            String  @id @default(cuid())
  jobId         String
  name          String
  partCost      Decimal @default(0)
  labourTimeHrs Decimal @default(0)
  standardPrice Decimal?
  linkedParts   JobItemPart[]
}

model JobCard {
  id            String   @id @default(cuid())
  workshopId    String
  jobCardNumber String   // "JC-0001"
  clientId      String
  vehicleId     String
  staffId       String?  // assigned mechanic
  dateIn        DateTime @default(now())
  dateDue       DateTime?
  dateCompleted DateTime?
  mileageIn     Int?
  bayNumber     String?
  status        String   @default("Booked")
  // Statuses: Booked, Waiting, InProgress, WaitingForParts, QC, ReadyForPickup, Completed, Cancelled
  priority      String   @default("Normal")
  totalExGst    Decimal  @default(0)
  lines         JobCardLine[]
  invoice       Invoice?
  @@unique([workshopId, jobCardNumber])
}

model JobCardLine {
  id             String  @id @default(cuid())
  jobCardId      String
  lineType       String  // "Labour","Part","Subcontract","Sundry"
  description    String
  qty            Int     @default(1)
  unitPriceExGst Decimal
  lineTotalExGst Decimal
  actualLabourHrs Decimal?
  isCompleted    Boolean @default(false)
}

model Invoice {
  id            String   @id @default(cuid())
  workshopId    String
  invoiceNumber String   // "INV-0001" — NO GAPS (ATO requirement)
  jobCardId     String?  @unique
  clientId      String
  vehicleId     String
  invoiceDate   DateTime @default(now())
  dueDate       DateTime
  subtotalExGst Decimal  @default(0)
  gstAmount     Decimal  @default(0)
  finalAmount   Decimal  @default(0)
  paymentStatus String   @default("Unpaid")
  // Statuses: Paid, Unpaid, Overdue, Partial, Void
  lines         InvoiceLine[]
  payments      Payment[]
  @@unique([workshopId, invoiceNumber])
}

model InvoiceLine {
  id             String  @id @default(cuid())
  invoiceId      String
  lineType       String
  description    String
  qty            Int     @default(1)
  unitPriceExGst Decimal
  lineTotalExGst Decimal
  gstRate        Decimal @default(0.10)
  gstAmount      Decimal @default(0)
}

model Payment {
  id            String   @id @default(cuid())
  workshopId    String
  invoiceId     String?
  clientId      String?
  amount        Decimal
  paymentMethod String   // Cash, CreditCard, EFTPOS, PayID, BankTransfer, BPay
  paymentDate   DateTime @default(now())
  paymentRef    String?
}

model ServiceReminder {
  id           String   @id @default(cuid())
  workshopId   String
  vehicleId    String
  clientId     String
  reminderType String   // "NextService","PinkSlip"
  dueDate      DateTime
  status       String   @default("Pending") // Pending, Sent, Booked, Completed, Declined
  sendCount    Int      @default(0)
}

model MaintenanceHistory {
  id          String   @id @default(cuid())
  vehicleId   String
  serviceDate DateTime
  serviceType String
  description String?
  mileage     Int?
  totalCost   Decimal?
}

model LedgerEntry {
  id              String   @id @default(cuid())
  workshopId      String
  transactionDate DateTime
  basPeriod       String?  // "Q1 2025-26"
  entityName      String
  transactionType String   // Invoice, Payment, Purchase
  direction       String   // Incoming, Outgoing
  amountExGst     Decimal
  gstAmount       Decimal
  amountIncGst    Decimal
}

model AuditLog {
  id        String   @id @default(cuid())
  workshopId String
  timestamp DateTime @default(now())
  userId    String?
  action    String   // CREATE, UPDATE, DELETE
  tableName String
  recordId  String
  oldValue  String?
  newValue  String?
}
```

Also include: VehicleMake, PartCategory, Part, Supplier, Appointment, PurchaseOrder, PurchaseOrderLine, JobItemPart models (see full schema in scaffold).

---

## 8 SCREENS TO BUILD (in this order)

### 1. Layout shell
- Sidebar (navy #1B2A4A, 220px): MECHWISE logo, nav items (Dashboard, Clients, Vehicles, Job Cards, Invoices, Reminders, Reports, Settings), badge counts on active items, user avatar at bottom
- Top bar: search input, amber "New job" button, notification bell, date display
- Content area with page background #F3F5F7

### 2. Dashboard (`/dashboard`)
- Greeting: "Good morning, [name]" with date
- 4 KPI cards: today's revenue, active jobs, overdue invoices, reminders sent
- 2-column: workshop floor board (card per bay showing rego, vehicle, job, mechanic, status badge, progress bar) + today's schedule (time-sorted table)
- Bottom: action items list + revenue bar chart (7 months) with monthly target progress

### 3. Client Detail (`/clients/[id]`)
- Left: contact card, vehicle list (clickable), customer stats (total spend, visits, avg), notes
- Right: selected vehicle detail, service status bars (next service, pink slip, last service), service history timeline with dots

### 4. Job Card (`/jobs/[id]`)
- Status lifecycle: 7 clickable pills (Booked → Completed)
- Progress bar (X/Y items completed)
- Work items checklist: large checkboxes, description, est/actual hours, price
- Right sidebar: job details, financial summary (subtotal, GST, total), next service calc
- Actions: Complete → Generate Invoice, Add Supplementary Quote
- ON COMPLETION: auto-generate invoice, auto-deduct parts, auto-create maintenance history, auto-create service reminder, update vehicle mileage

### 5. Invoice (`/invoices/[id]`)
- PDF-style: navy header (workshop name, ABN, MVRL, ARC, "TAX INVOICE"), customer + vehicle blocks, line items table, totals (subtotal, GST, total inc GST), next service footer
- Right sidebar: payment status, linked records, auto-created reminder
- Actions: email, PDF download, record payment (inline form with 6 methods), void

### 6. Reminders (`/reminders`)
- 6 KPI tiles: due this week, due this month, overdue, awaiting reply, booked, no contact
- Filter tabs: Due Soon, Overdue, No Contact, Booked, All
- Table with checkboxes: client, phone, rego (monospace), type badge, due date, days (colour-coded), sends, status, action
- Bulk "Send to N selected" button

### 7. Reports (`/reports`)
- Period selector (week/month/quarter/year)
- 5 KPIs with trends: revenue, expenses, profit, jobs, avg invoice
- Revenue vs expenses bar chart
- Revenue by service type pie chart
- Mechanic productivity table
- Top customers table
- CSV export

### 8. Settings (`/settings`)
- Settings sidebar: Business Details, Invoicing, Pricing, SMS/Email, Reminder Cadence, Users, Subscription, Branding
- Business details: all workshop fields + operating hours grid
- SMS: sender name, send window, ACMA compliance notice, usage meter, message templates with variables

### 9. Customer Portal (`/portal/[token]`)
- Separate layout (no sidebar). Workshop branding header
- Vehicle selector, 3 status cards, "Book Now" CTA
- Recommendation banner from last visit
- Service history with invoice PDF downloads
- "Powered by MechWise" footer

---

## CRITICAL BUSINESS RULES

### GST: Store ex-GST. Calculate per line: amount × 0.10. Show inc-GST to customers.
### BAS: Australian FY Jul-Jun. Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun. Format: "Q1 2025-26".
### Invoice numbering: Sequential, NO GAPS EVER. Voided invoices keep their number. Use atomic counter.
### Job completion triggers: auto-generate invoice, auto-deduct parts, auto-create maintenance history, auto-create service reminder, update vehicle mileage.
### SMS (ACMA Spam Act 2003): Send 9am-8pm AEST only. Include "Reply STOP to opt out". Max 1/week/customer.
### Pink slips: Only isMvrlCertified staff can complete. Reminders start 60 days before expiry.
### User roles: Owner (full), Manager (no void/users), FrontDesk (no costs/reports), Mechanic (own jobs only), ReadOnly (view only).

---

## SEED DATA

Workshop: Dhalla Automotive, ABN 95611566888, 70A Cox Avenue Kingswood NSW 2747
Staff: Tinku Dhalla (Owner, MVRL), Baljit (Mechanic, MVRL), Harman (Mechanic), Ash (Apprentice), Manveer (Mechanic)
4 Bays, 10 clients with vehicles, 12 job categories with 14 jobs, 11 parts, 5 suppliers
Login: tinku@dhalla.com.au / admin123

---

## BUILD ORDER

1. Project setup + auth + database + Prisma migrations + seed
2. Layout shell (sidebar + top bar)
3. Clients CRUD (list + detail)
4. Vehicles CRUD (list + detail + link to clients)
5. Job card lifecycle (create, work items, status, complete)
6. Invoice generation (auto from job, PDF, payment recording)
7. Dashboard (KPIs, floor board, schedule, alerts, revenue)
8. Reminders (list, filter, bulk send)
9. Reports (charts, tables, export)
10. Settings (business details, SMS, templates)
11. Customer portal (magic-link, history, booking)

---

## IMPORTANT

- AUSTRALIAN app: AUD currency, DD/MM/YYYY display, Australia/Sydney timezone
- Regos are the PRIMARY identifier — always prominent, always monospace
- Workshop floor board is the SIGNATURE feature
- Invoice numbers must NEVER have gaps (ATO legal requirement)
- Every API query MUST filter by workshopId for multi-tenant isolation
- Navy (#1B2A4A) + amber (#E8920D) are the brand — use exactly as specified
