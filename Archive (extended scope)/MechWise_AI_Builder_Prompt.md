# MechWise — Complete AI Builder Specification

> **What this document is:** A single, self-contained specification for an AI coding agent to build the MechWise workshop management platform. Paste this entire document as your prompt or project instructions. It contains the database schema, business logic, UI design system, and build instructions.

> **What to build:** A full-stack SaaS web application for Australian mechanical workshops. Multi-tenant. Quote-to-invoice workflow. SMS automation. Inventory management. Customer portal. Australian GST/BAS compliance.

> **First client:** Dhalla Automotive Pty Ltd, 70A Cox Avenue, Kingswood NSW 2747, ABN 95611566888.

---

## TECH STACK (use exactly these)

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **CSS:** Tailwind CSS 3
- **Components:** shadcn/ui + Radix primitives
- **State:** Zustand (UI state) + TanStack React Query (server state)
- **Backend API:** Next.js API routes (or Fastify if separate backend)
- **ORM:** Prisma 5
- **Database:** PostgreSQL 15
- **Auth:** NextAuth.js v5 with credentials provider + JWT
- **PDF:** @react-pdf/renderer (server-side invoice generation)
- **Charts:** Recharts
- **Hosting:** Vercel (frontend) + Railway or Supabase (database)

---

## DESIGN SYSTEM

### Color palette
```
Primary navy:     #1B2A4A  (sidebar, headers, invoice headers)
Navy light:       #243656  (sidebar active states)
Accent amber:     #E8920D  (CTAs, active tabs, highlights, links)
Amber light:      #FDF4E3  (amber backgrounds, selected states)
Background:       #F3F5F7  (page background)
Card:             #FFFFFF  (card surfaces)
Border:           #E5E7EB  (card borders, table dividers)
Text primary:     #1F2937  (body text)
Text secondary:   #6B7280  (supporting text)
Text muted:       #9CA3AF  (placeholders)
Success:          #059669  (paid, confirmed, healthy)
Danger:           #DC2626  (overdue, critical, out of stock)
Warning:          #D97706  (unconfirmed, getting low, in progress)
Info:             #2563EB  (booked, informational)
Purple:           #7C3AED  (margin display, pro features)
```

### Typography
- **Body font:** DM Sans or Inter (system-ui fallback)
- **Monospace font:** JetBrains Mono — used for ALL identifiers: registration numbers, invoice IDs (INV-0089), job card numbers (JC-0089), quote numbers (QT-0042), part numbers (Z432), payment references (VISA ****4521), prices ($154.00), phone numbers, VINs, ABNs
- **Letter spacing:** 0.04em on monospace registration numbers

### Component patterns
- **Cards:** white bg, 1px border, 12px radius, 16-20px padding
- **Primary buttons:** amber bg (#E8920D) + white text, 8px radius
- **Secondary buttons:** white bg + 1px border + dark text
- **Badges:** 20px radius pill, semi-transparent bg (color + 15% opacity), 11px bold text
- **Status colors:** Paid/Completed = green. Unpaid/Booked = blue. Overdue/Critical = red. In Progress/Unconfirmed = amber. Draft/Pending = gray
- **Tables:** 13px font, navy header row with white text, 1px row borders
- **Sidebar:** navy bg (#1B2A4A), 240px wide, collapsible. Active = lighter navy

---

## DATABASE SCHEMA (Prisma)

### Core entities

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
  website           String?
  logoUrl           String?
  operatingHours    Json?
  defaultLabourRate Decimal  @default(80.00)
  defaultQuoteValidDays Int  @default(14)
  defaultServiceIntervalMonths Int @default(6)
  defaultServiceIntervalKm Int @default(10000)
  maxDiscountPct    Int      @default(15)
  accountingMethod  String   @default("cash")
  timezone          String   @default("Australia/Sydney")
  smsSenderName     String?
  smsWindowStart    String   @default("09:00")
  smsWindowEnd      String   @default("20:00")
  createdAt         DateTime @default(now())
  clients           Client[]
  vehicles          Vehicle[]
  staff             Staff[]
  users             User[]
  jobCategories     JobCategory[]
  partCategories    PartCategory[]
  suppliers         Supplier[]
  quotations        Quotation[]
  jobCards          JobCard[]
  invoices          Invoice[]
  payments          Payment[]
  appointments      Appointment[]
  serviceReminders  ServiceReminder[]
  parts             Part[]
  purchaseOrders    PurchaseOrder[]
  ledgerEntries     LedgerEntry[]
  auditLogs         AuditLog[]
  bays              Bay[]
}

model Client {
  id                String   @id @default(cuid())
  workshopId        String
  workshop          Workshop @relation(fields: [workshopId], references: [id])
  clientType        String   @default("Individual")
  firstName         String?
  lastName          String?
  businessName      String?
  mobilePhone       String?
  homePhone         String?
  email             String?
  address           String?
  suburb            String?
  state             String?
  postcode          String?
  preferredContact  String   @default("SMS")
  notes             String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  clientVehicles    ClientVehicle[]
  quotations        Quotation[]
  jobCards          JobCard[]
  invoices          Invoice[]
  payments          Payment[]
  serviceReminders  ServiceReminder[]
  appointments      Appointment[]
  @@index([workshopId])
  @@index([workshopId, mobilePhone])
}

model Vehicle {
  id                String   @id @default(cuid())
  workshopId        String
  workshop          Workshop @relation(fields: [workshopId], references: [id])
  registration      String
  makeId            String?
  make              VehicleMake? @relation(fields: [makeId], references: [id])
  model             String?
  year              Int?
  colour            String?
  bodyType          String?
  fuelType          String?
  transmission      String?
  engineCapacity    String?
  vin               String?
  currentMileageKm  Int?
  nextServiceDue    DateTime?
  nextServiceKm     Int?
  pinkSlipExpiry    DateTime?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  clientVehicles    ClientVehicle[]
  quotations        Quotation[]
  jobCards          JobCard[]
  invoices          Invoice[]
  serviceReminders  ServiceReminder[]
  appointments      Appointment[]
  maintenanceHistory MaintenanceHistory[]
  @@unique([workshopId, registration])
  @@index([workshopId])
}

model VehicleMake {
  id       String    @id @default(cuid())
  name     String    @unique
  vehicles Vehicle[]
}

model ClientVehicle {
  id              String   @id @default(cuid())
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  relationship    String   @default("Owner")
  isPrimaryOwner  Boolean  @default(true)
  ownershipStart  DateTime @default(now())
  ownershipEnd    DateTime?
  @@unique([clientId, vehicleId])
}

model Staff {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  firstName       String
  lastName        String?
  mobilePhone     String?
  email           String?
  role            String
  hourlyRate      Decimal?
  isMvrlCertified Boolean  @default(false)
  isArcCertified  Boolean  @default(false)
  availabilityDays Json?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  jobCards        JobCard[]
  jobCardLines    JobCardLine[]
  appointments    Appointment[]
  @@index([workshopId])
}

model User {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  email           String   @unique
  passwordHash    String
  displayName     String
  role            String
  staffId         String?
  isActive        Boolean  @default(true)
  lastLoginAt     DateTime?
  createdAt       DateTime @default(now())
  @@index([workshopId])
}

model Bay {
  id          String   @id @default(cuid())
  workshopId  String
  workshop    Workshop @relation(fields: [workshopId], references: [id])
  name        String
  bayType     String
  isActive    Boolean  @default(true)
  displayOrder Int     @default(0)
}
```

### Service catalogue

```prisma
model JobCategory {
  id           String   @id @default(cuid())
  workshopId   String
  workshop     Workshop @relation(fields: [workshopId], references: [id])
  name         String
  description  String?
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  jobs         Job[]
  @@unique([workshopId, name])
}

model Job {
  id                 String      @id @default(cuid())
  categoryId         String
  category           JobCategory @relation(fields: [categoryId], references: [id])
  name               String
  description        String?
  standardTotalPrice Decimal?
  estimatedDuration  Decimal?
  isLocked           Boolean     @default(false)
  isActive           Boolean     @default(true)
  subItems           JobSubItem[]
}

model JobSubItem {
  id             String  @id @default(cuid())
  jobId          String
  job            Job     @relation(fields: [jobId], references: [id])
  name           String
  partCost       Decimal @default(0)
  labourTimeHrs  Decimal @default(0)
  labourRateHr   Decimal?
  labourCost     Decimal?
  standardPrice  Decimal?
  isActive       Boolean @default(true)
  linkedParts    JobItemPart[]
}

model JobItemPart {
  id          String     @id @default(cuid())
  subItemId   String
  subItem     JobSubItem @relation(fields: [subItemId], references: [id])
  partId      String
  part        Part       @relation(fields: [partId], references: [id])
  defaultQty  Int        @default(1)
  isRequired  Boolean    @default(true)
  notes       String?
}
```

### Parts and inventory

```prisma
model PartCategory {
  id           String   @id @default(cuid())
  workshopId   String
  workshop     Workshop @relation(fields: [workshopId], references: [id])
  name         String
  description  String?
  displayOrder Int      @default(0)
  parts        Part[]
  @@unique([workshopId, name])
}

model Part {
  id               String       @id @default(cuid())
  workshopId       String
  workshop         Workshop     @relation(fields: [workshopId], references: [id])
  itemName         String
  partNumber       String?
  categoryId       String
  category         PartCategory @relation(fields: [categoryId], references: [id])
  unitOfMeasure    String       @default("Each")
  costPriceExGst   Decimal?
  sellPriceExGst   Decimal
  gstRate          Decimal      @default(0.10)
  qtyInStock       Int          @default(0)
  reorderLevel     Int          @default(0)
  reorderQty       Int          @default(0)
  primarySupplierId String?
  primarySupplier  Supplier?    @relation(fields: [primarySupplierId], references: [id])
  barcodeSku       String?
  location         String?
  leadTimeDays     Int?
  lastOrdered      DateTime?
  isActive         Boolean      @default(true)
  jobItemParts     JobItemPart[]
  @@index([workshopId])
}

model Supplier {
  id             String   @id @default(cuid())
  workshopId     String
  workshop       Workshop @relation(fields: [workshopId], references: [id])
  businessName   String
  contactPerson  String?
  phone          String?
  email          String?
  abn            String?
  orderMethod    String?
  accountNumber  String?
  creditTermsDays Int     @default(30)
  deliveryLeadDays Int?
  parts          Part[]
  purchaseOrders PurchaseOrder[]
  @@index([workshopId])
}
```

### Workflow pipeline

```prisma
model Quotation {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  quoteNumber     String
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  quoteDate       DateTime @default(now())
  validUntil      DateTime
  totalExGst      Decimal  @default(0)
  gstAmount       Decimal  @default(0)
  discountType    String?
  discountValue   Decimal?
  discountAmount  Decimal  @default(0)
  finalAmount     Decimal  @default(0)
  status          String   @default("Draft")
  approvedDate    DateTime?
  approvedMethod  String?
  createdById     String?
  notes           String?
  createdAt       DateTime @default(now())
  lines           QuoteLine[]
  jobCard         JobCard?
  @@unique([workshopId, quoteNumber])
  @@index([workshopId, status])
}

model QuoteLine {
  id              String    @id @default(cuid())
  quotationId     String
  quotation       Quotation @relation(fields: [quotationId], references: [id])
  lineType        String
  subItemId       String?
  partId          String?
  description     String
  qty             Int       @default(1)
  unitPriceExGst  Decimal
  lineTotalExGst  Decimal
  gstAmount       Decimal   @default(0)
  sortOrder       Int       @default(0)
}

model JobCard {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  jobCardNumber   String
  quotationId     String?  @unique
  quotation       Quotation? @relation(fields: [quotationId], references: [id])
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  staffId         String?
  staff           Staff?   @relation(fields: [staffId], references: [id])
  dateIn          DateTime @default(now())
  dateDue         DateTime?
  dateCompleted   DateTime?
  mileageIn       Int?
  bayNumber       String?
  status          String   @default("Booked")
  priority        String   @default("Normal")
  totalExGst      Decimal  @default(0)
  internalNotes   String?
  customerNotes   String?
  createdAt       DateTime @default(now())
  lines           JobCardLine[]
  invoice         Invoice?
  @@unique([workshopId, jobCardNumber])
  @@index([workshopId, status])
}

model JobCardLine {
  id              String  @id @default(cuid())
  jobCardId       String
  jobCard         JobCard @relation(fields: [jobCardId], references: [id])
  lineType        String
  subItemId       String?
  partId          String?
  description     String
  qty             Int     @default(1)
  unitPriceExGst  Decimal
  lineTotalExGst  Decimal
  actualLabourHrs Decimal?
  staffId         String?
  staff           Staff?  @relation(fields: [staffId], references: [id])
  isCompleted     Boolean @default(false)
  sortOrder       Int     @default(0)
}

model Invoice {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  invoiceNumber   String
  jobCardId       String?  @unique
  jobCard         JobCard? @relation(fields: [jobCardId], references: [id])
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  invoiceDate     DateTime @default(now())
  dueDate         DateTime
  taxType         String   @default("GST Inclusive")
  subtotalExGst   Decimal  @default(0)
  gstAmount       Decimal  @default(0)
  discountType    String?
  discountValue   Decimal?
  discountAmount  Decimal  @default(0)
  finalAmount     Decimal  @default(0)
  paymentStatus   String   @default("Unpaid")
  nextServiceDue  DateTime?
  nextServiceKm   Int?
  createdAt       DateTime @default(now())
  lines           InvoiceLine[]
  payments        Payment[]
  @@unique([workshopId, invoiceNumber])
  @@index([workshopId, paymentStatus])
}

model InvoiceLine {
  id              String  @id @default(cuid())
  invoiceId       String
  invoice         Invoice @relation(fields: [invoiceId], references: [id])
  lineType        String
  subItemId       String?
  partId          String?
  description     String
  qty             Int     @default(1)
  unitPriceExGst  Decimal
  lineTotalExGst  Decimal
  gstRate         Decimal @default(0.10)
  gstAmount       Decimal @default(0)
  sortOrder       Int     @default(0)
}

model Payment {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  paymentType     String
  invoiceId       String?
  invoice         Invoice? @relation(fields: [invoiceId], references: [id])
  clientId        String?
  client          Client?  @relation(fields: [clientId], references: [id])
  supplierId      String?
  amount          Decimal
  paymentMethod   String
  paymentDate     DateTime @default(now())
  paymentRef      String?
  receivedById    String?
  notes           String?
  createdAt       DateTime @default(now())
  @@index([workshopId])
}
```

### Operations

```prisma
model Appointment {
  id                   String   @id @default(cuid())
  workshopId           String
  workshop             Workshop @relation(fields: [workshopId], references: [id])
  clientId             String
  client               Client   @relation(fields: [clientId], references: [id])
  vehicleId            String
  vehicle              Vehicle  @relation(fields: [vehicleId], references: [id])
  bookingDate          DateTime
  bookingTime          String?
  estimatedDurationHrs Decimal?
  bayNumber            String?
  staffId              String?
  staff                Staff?   @relation(fields: [staffId], references: [id])
  servicesRequested    String?
  source               String   @default("Phone")
  status               String   @default("Booked")
  reminderSent         Boolean  @default(false)
  confirmed            Boolean  @default(false)
  createdAt            DateTime @default(now())
  @@index([workshopId, bookingDate])
}

model ServiceReminder {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  reminderType    String
  dueDate         DateTime
  dueMileageKm    Int?
  lastServiceDate DateTime?
  lastInvoiceId   String?
  status          String   @default("Pending")
  smsSentDate     DateTime?
  sendCount       Int      @default(0)
  clientResponse  String?
  bookingCreated  Boolean  @default(false)
  createdAt       DateTime @default(now())
  @@index([workshopId, status])
  @@index([workshopId, dueDate])
}

model MaintenanceHistory {
  id              String   @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  jobCardId       String?
  invoiceId       String?
  serviceDate     DateTime
  serviceType     String
  description     String?
  staffId         String?
  mileage         Int?
  totalCost       Decimal?
  customerNotes   String?
  internalNotes   String?
  createdAt       DateTime @default(now())
  @@index([vehicleId, serviceDate])
}

model PurchaseOrder {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  poNumber        String
  supplierId      String
  supplier        Supplier @relation(fields: [supplierId], references: [id])
  orderDate       DateTime @default(now())
  expectedDelivery DateTime?
  totalExGst      Decimal  @default(0)
  gstAmount       Decimal  @default(0)
  status          String   @default("Draft")
  notes           String?
  createdAt       DateTime @default(now())
  lines           PurchaseOrderLine[]
  @@unique([workshopId, poNumber])
}

model PurchaseOrderLine {
  id              String        @id @default(cuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  partId          String
  qtyOrdered      Int
  qtyReceived     Int           @default(0)
  unitCostExGst   Decimal
  lineTotal       Decimal
}

model LedgerEntry {
  id              String   @id @default(cuid())
  workshopId      String
  workshop        Workshop @relation(fields: [workshopId], references: [id])
  transactionDate DateTime
  basPeriod       String?
  entityType      String
  entityId        String?
  entityName      String
  transactionType String
  direction       String
  relatedDocType  String?
  relatedDocId    String?
  description     String?
  amountExGst     Decimal
  gstAmount       Decimal
  amountIncGst    Decimal
  paymentStatus   String?
  paymentMethod   String?
  createdAt       DateTime @default(now())
  @@index([workshopId, basPeriod])
}

model AuditLog {
  id          String   @id @default(cuid())
  workshopId  String
  workshop    Workshop @relation(fields: [workshopId], references: [id])
  timestamp   DateTime @default(now())
  userId      String?
  action      String
  tableName   String
  recordId    String
  fieldName   String?
  oldValue    String?
  newValue    String?
  ipAddress   String?
  @@index([workshopId, timestamp])
}
```

---

## PAGES TO BUILD (in this order)

### 1. Auth
- `/login` — email + password. Navy background with MechWise logo
- Middleware protecting all routes except login and customer portal

### 2. Layout shell
- Sidebar (navy, 240px, collapsible) with nav items: Dashboard, Clients, Vehicles, Quotations, Job Cards, Invoices, Payments, Inventory, Suppliers, Service Catalogue, Calendar, Reminders, Reports, Settings
- Top bar: search input (accepts rego, name, phone, invoice#), amber "New job" button, notification bell with count, date/time
- Workshop switcher dropdown in sidebar header
- User avatar + name + role at sidebar bottom

### 3. Dashboard (`/dashboard`)
- Greeting with date. 4 KPI cards (today's revenue, active jobs, overdue invoices, reminders sent)
- 2-column: workshop floor board (bay cards with rego, vehicle, job, mechanic, status, progress bar) + today's schedule (time-sorted appointments table)
- Bottom: action items (alerts) + recent invoices + monthly revenue progress bar

### 4. Clients (`/clients`, `/clients/[id]`)
- List: searchable table. Detail: contact card + vehicle list + stats + service history timeline

### 5. Vehicles (`/vehicles`, `/vehicles/[id]`)
- List: searchable by rego. Detail: full vehicle info + colour-coded service timeline

### 6. Quotations (`/quotes`, `/quotes/new`, `/quotes/[id]`)
- List. Builder: select client → vehicle → add jobs from catalogue → live total with GST + discount + margin. Send via SMS/email/print. Detail: status actions (send, approve, convert to job card)

### 7. Job Cards (`/jobs`, `/jobs/[id]`)
- List. Detail: progress bar, checklist with checkboxes, status lifecycle pills, time tracking, notes. Complete → auto-generates invoice + deducts stock + creates reminder + creates history

### 8. Invoices (`/invoices`, `/invoices/[id]`)
- List. Detail: PDF-style layout (navy header, ABN, line items, GST). Payment modal (6 methods). Actions: email, PDF download, void

### 9. Inventory (`/inventory`)
- Category sidebar + parts table with cost, sell, margin%, stock level bars, status badges, search

### 10. Calendar (`/calendar`)
- Day view: time column + bay columns. Appointment blocks colored by status. Utilisation bar

### 11. Reminders (`/reminders`)
- 6 KPI tiles. Filter tabs (Due Soon, Overdue, No Contact, Booked, All). Bulk SMS actions

### 12. Reports (`/reports`)
- Revenue chart, job-type breakdown, mechanic productivity table, top customers, BAS summary

### 13. Settings (`/settings`)
- Sidebar: Business details, Invoicing, Pricing, Scheduling, SMS/Email, Reminders, Users, Subscription, Integrations, Branding

### 14. Customer Portal (`/portal/[token]`)
- No sidebar. Workshop branding header. Vehicle selector. Status cards. "Book now" CTA. Service history with invoice PDF downloads

---

## CRITICAL BUSINESS RULES

### GST calculation
- Store all prices ex-GST in database
- Calculate GST per line item: line_total × 0.10
- Show inc-GST total to customers
- Discount applied before GST calculation

### BAS periods (Australian financial year July–June)
- Q1 = Jul-Sep, Q2 = Oct-Dec, Q3 = Jan-Mar, Q4 = Apr-Jun
- Format: "Q1 2025-26"
- Auto-assign on every ledger entry

### Sequential numbering (CRITICAL — ATO legal requirement)
- Invoice numbers: INV-0001, INV-0002... NO GAPS EVER. Voided invoices keep their number
- Quote numbers: QT-0001, QT-0002...
- Job card numbers: JC-0001, JC-0002...
- Use atomic counter per workshop to prevent race conditions

### Quote-to-cash pipeline (THE CORE WORKFLOW)
1. Quote created (Draft) → sent to customer (Sent) → customer approves (Approved)
2. Convert to job card → COPY line items (don't move, quote preserved)
3. Mechanic works → ticks items, logs actual hours
4. Complete job → auto: deduct parts from inventory, generate invoice, create maintenance history, create service reminder, update vehicle mileage
5. Record payment → update invoice status, create ledger entry

### SMS rules (ACMA Spam Act 2003 — Australian law)
- Send only between 9:00am–8:00pm AEST
- Every message must include "Reply STOP to opt out"
- Max 1 SMS per customer per week
- Keyword parsing: YES/BOOK → create appointment. STOP → opt out. C → confirm. R → callback

### Pink slip enforcement (NSW)
- Only staff with isMvrlCertified = true can complete pink slip job cards
- Reminders start at 60 days before expiry (not 30 like service reminders)

### User role permissions
- Owner: full access to everything
- Manager: everything except user management, invoice voiding, settings restricted
- Front Desk: clients, quotes, invoices, payments, appointments. No cost prices or reports
- Mechanic: own job cards only. No financial data
- Read-Only: view only, no create/edit

---

## SEED DATA

Workshop: Dhalla Automotive, ABN 95611566888, 70A Cox Avenue Kingswood NSW 2747, Ph 0247 082 717
Staff: Tinku Dhalla (Owner, MVRL), Baljit (Mechanic, MVRL), Harman (Mechanic), Ash (Apprentice), Manveer (Mechanic)
Bays: Bay 1 Hoist, Bay 2 Hoist, Bay 3 Ground, Bay 4 Tyre bay
10 clients with vehicles, 12 job categories, 5 parent jobs with sub-items, 15 parts, 5 suppliers (see full seed data in technical spec document)

---

## IMPORTANT NOTES

- AUSTRALIAN application: AUD currency, DD/MM/YYYY display dates, Australia/Sydney timezone
- Registration numbers (regos) are the PRIMARY identifier — always prominent, always monospace
- The workshop floor board is the SIGNATURE feature — real-time bay status kanban
- Invoice numbers must NEVER have gaps (Australian Tax Office legal requirement)
- Monospace font for ALL identifiers: regos, invoice#, part#, VIN, ABN, prices, phones
- Use the navy (#1B2A4A) + amber (#E8920D) brand colors exactly as specified
- Every API query MUST filter by workshopId for multi-tenant isolation
