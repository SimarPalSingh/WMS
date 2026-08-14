-- ═══════════════════════════════════════════════════════════════
-- MechWise WMS — Full Database Schema
-- Version: 2.0
-- Target: PostgreSQL 15+ (compatible with MySQL 8+ with minor adjustments)
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. CORE ENTITIES
-- ───────────────────────────────────────────────────────────────

CREATE TABLE workshops (
    workshop_id     VARCHAR(10)   PRIMARY KEY,
    business_name   VARCHAR(200)  NOT NULL,
    abn             VARCHAR(20),
    mvrl_no         VARCHAR(20),
    arc_no          VARCHAR(20),
    address         VARCHAR(200),
    suburb          VARCHAR(100),
    state           VARCHAR(10)   DEFAULT 'NSW',
    postcode        VARCHAR(10),
    phone           VARCHAR(20),
    mobile          VARCHAR(20),
    landline        VARCHAR(20),
    email           VARCHAR(150),
    website         VARCHAR(200),
    owner_name      VARCHAR(100),
    hours_weekday   VARCHAR(100),
    hours_saturday  VARCHAR(100),
    logo_url        VARCHAR(500),
    timezone        VARCHAR(50)   DEFAULT 'Australia/Sydney',
    date_registered DATE,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    staff_id          VARCHAR(10)   PRIMARY KEY,
    workshop_id       VARCHAR(10)   REFERENCES workshops(workshop_id),
    first_name        VARCHAR(50),
    last_name         VARCHAR(50),
    role              VARCHAR(30)   CHECK (role IN ('Owner/Mechanic','Manager','Mechanic','Apprentice','Front Desk','Read-Only')),
    mobile            VARCHAR(20),
    email             VARCHAR(150),
    specialty         VARCHAR(100),
    certifications    VARCHAR(200),
    hourly_rate       DECIMAL(8,2),
    employment_type   VARCHAR(20)   CHECK (employment_type IN ('Full-Time','Part-Time','Casual','Contractor')),
    start_date        DATE,
    availability_days VARCHAR(50),
    availability_hrs  VARCHAR(50),
    emergency_contact VARCHAR(100),
    emergency_phone   VARCHAR(20),
    is_active         BOOLEAN       DEFAULT TRUE,
    notes             TEXT,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id              VARCHAR(10)  PRIMARY KEY,
    staff_id             VARCHAR(10)  REFERENCES staff(staff_id),
    workshop_id          VARCHAR(10)  REFERENCES workshops(workshop_id),
    username             VARCHAR(50)  UNIQUE NOT NULL,
    email                VARCHAR(150),
    password_hash        VARCHAR(255) NOT NULL,
    role                 VARCHAR(30)  CHECK (role IN ('Owner','Manager','Front Desk','Mechanic','Apprentice','Read-Only')),
    can_view_financials  BOOLEAN DEFAULT FALSE,
    can_edit_pricing     BOOLEAN DEFAULT FALSE,
    can_delete_records   BOOLEAN DEFAULT FALSE,
    can_manage_users     BOOLEAN DEFAULT FALSE,
    can_export_data      BOOLEAN DEFAULT FALSE,
    last_login           TIMESTAMP,
    is_active            BOOLEAN DEFAULT TRUE,
    notes                TEXT,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    client_id         VARCHAR(10)  PRIMARY KEY,
    workshop_id       VARCHAR(10)  REFERENCES workshops(workshop_id),
    client_type       VARCHAR(20)  CHECK (client_type IN ('Individual','Business')),
    business_name     VARCHAR(200),
    first_name        VARCHAR(50),
    last_name         VARCHAR(50),
    mobile            VARCHAR(20),
    landline          VARCHAR(20),
    email             VARCHAR(150),
    abn               VARCHAR(20),
    address           VARCHAR(200),
    suburb            VARCHAR(100),
    state             VARCHAR(10)  DEFAULT 'NSW',
    postcode          VARCHAR(10),
    preferred_contact VARCHAR(20)  CHECK (preferred_contact IN ('SMS','Email','Phone','WhatsApp')),
    notes             TEXT,
    created_date      DATE         DEFAULT CURRENT_DATE,
    is_active         BOOLEAN      DEFAULT TRUE,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_makes (
    make_id           VARCHAR(10)  PRIMARY KEY,
    brand             VARCHAR(50)  NOT NULL,
    country_of_origin VARCHAR(50),
    is_active         BOOLEAN      DEFAULT TRUE
);

CREATE TABLE vehicles (
    vehicle_id         VARCHAR(10)  PRIMARY KEY,
    workshop_id        VARCHAR(10)  REFERENCES workshops(workshop_id),
    registration_no    VARCHAR(20)  NOT NULL,
    state              VARCHAR(10)  DEFAULT 'NSW',
    make_id            VARCHAR(10)  REFERENCES vehicle_makes(make_id),
    vehicle_model      VARCHAR(50),
    vehicle_year       INTEGER,
    vehicle_color      VARCHAR(30),
    body_type          VARCHAR(30)  CHECK (body_type IN ('Sedan','SUV','Hatch','Ute','Van','Wagon','Coupe','Convertible','Truck','Bus','Trailer',NULL)),
    vin                VARCHAR(20),
    engine_no          VARCHAR(30),
    engine_capacity    VARCHAR(20),
    fuel_type          VARCHAR(20)  CHECK (fuel_type IN ('Petrol','Diesel','LPG','LPG/Petrol','Electric','Hybrid','Hydrogen',NULL)),
    transmission       VARCHAR(10)  CHECK (transmission IN ('Auto','Manual','CVT','DCT',NULL)),
    current_mileage_km INTEGER,
    last_mileage_update DATE,
    pink_slip_expiry   DATE,
    next_service_due   DATE,
    next_service_km    INTEGER,
    insurance_company  VARCHAR(100),
    insurance_policy   VARCHAR(50),
    notes              TEXT,
    is_active          BOOLEAN      DEFAULT TRUE,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_vehicles (
    link_id           VARCHAR(10)  PRIMARY KEY,
    client_id         VARCHAR(10)  NOT NULL REFERENCES clients(client_id),
    vehicle_id        VARCHAR(10)  NOT NULL REFERENCES vehicles(vehicle_id),
    ownership_start   DATE,
    ownership_end     DATE,
    is_primary_owner  BOOLEAN      DEFAULT TRUE,
    relationship      VARCHAR(30)  CHECK (relationship IN ('Owner','Authorised Driver','Fleet Manager','Family Member')),
    notes             TEXT,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, vehicle_id, ownership_start)
);


-- ───────────────────────────────────────────────────────────────
-- 2. SERVICE CATALOGUE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE job_categories (
    category_id   VARCHAR(10)  PRIMARY KEY,
    category_name VARCHAR(50)  NOT NULL,
    description   VARCHAR(200),
    display_order INTEGER      DEFAULT 0,
    is_active     BOOLEAN      DEFAULT TRUE
);

CREATE TABLE jobs (
    job_id               VARCHAR(10)  PRIMARY KEY,
    job_name             VARCHAR(100) NOT NULL,
    category_id          VARCHAR(10)  REFERENCES job_categories(category_id),
    description          TEXT,
    standard_total_price DECIMAL(10,2),
    estimated_duration   DECIMAL(4,2),  -- hours
    is_active            BOOLEAN       DEFAULT TRUE,
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_sub_items (
    sub_item_id    VARCHAR(10)  PRIMARY KEY,
    sub_item_name  VARCHAR(150) NOT NULL,
    job_id         VARCHAR(10)  REFERENCES jobs(job_id),
    category_id    VARCHAR(10)  REFERENCES job_categories(category_id),
    part_cost      DECIMAL(10,2) DEFAULT 0,
    labour_time    DECIMAL(4,2)  DEFAULT 0,  -- hours
    labour_rate    DECIMAL(8,2)  DEFAULT 80, -- $/hr
    labour_cost    DECIMAL(10,2) DEFAULT 0,
    standard_price DECIMAL(10,2) DEFAULT 0,
    is_active      BOOLEAN       DEFAULT TRUE,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE part_categories (
    category_id   VARCHAR(10)  PRIMARY KEY,
    category_name VARCHAR(50)  NOT NULL,
    description   VARCHAR(200),
    display_order INTEGER      DEFAULT 0
);

CREATE TABLE parts (
    part_id             VARCHAR(10)   PRIMARY KEY,
    workshop_id         VARCHAR(10)   REFERENCES workshops(workshop_id),
    item_name           VARCHAR(200)  NOT NULL,
    part_number         VARCHAR(50),
    category_id         VARCHAR(10)   REFERENCES part_categories(category_id),
    unit_of_measure     VARCHAR(20)   DEFAULT 'Each',
    cost_price_ex_gst   DECIMAL(10,2),
    sell_price_ex_gst   DECIMAL(10,2),
    gst_rate            DECIMAL(4,2)  DEFAULT 0.10,
    sell_price_inc_gst  DECIMAL(10,2),
    qty_in_stock        INTEGER       DEFAULT 0,
    reorder_level       INTEGER       DEFAULT 0,
    reorder_qty         INTEGER       DEFAULT 0,
    primary_supplier_id VARCHAR(10)   REFERENCES suppliers(supplier_id),
    barcode_sku         VARCHAR(50),
    location            VARCHAR(50),
    last_ordered        DATE,
    lead_time_days      INTEGER,
    notes               TEXT,
    is_active           BOOLEAN       DEFAULT TRUE,
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 3. SUPPLIERS & PURCHASING
-- ───────────────────────────────────────────────────────────────

CREATE TABLE suppliers (
    supplier_id      VARCHAR(10)  PRIMARY KEY,
    business_name    VARCHAR(200) NOT NULL,
    contact_person   VARCHAR(100),
    phone            VARCHAR(20),
    email            VARCHAR(150),
    abn              VARCHAR(20),
    address          VARCHAR(200),
    suburb           VARCHAR(100),
    state            VARCHAR(10),
    postcode         VARCHAR(10),
    order_method     VARCHAR(30)  CHECK (order_method IN ('Phone','Email','Online Portal','In-Person')),
    account_number   VARCHAR(50),
    credit_terms     INTEGER      DEFAULT 30,  -- days
    delivery_lead    INTEGER,                   -- days
    notes            TEXT,
    is_active        BOOLEAN      DEFAULT TRUE,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    po_id             VARCHAR(10)   PRIMARY KEY,
    supplier_id       VARCHAR(10)   NOT NULL REFERENCES suppliers(supplier_id),
    workshop_id       VARCHAR(10)   REFERENCES workshops(workshop_id),
    order_date        DATE          DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    total_ex_gst      DECIMAL(10,2),
    gst_amount        DECIMAL(10,2),
    total_inc_gst     DECIMAL(10,2),
    status            VARCHAR(30)   CHECK (status IN ('Draft','Ordered','Partially Received','Received','Cancelled')) DEFAULT 'Draft',
    ordered_by        VARCHAR(10)   REFERENCES staff(staff_id),
    notes             TEXT,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE po_lines (
    line_id          VARCHAR(10)   PRIMARY KEY,
    po_id            VARCHAR(10)   NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    part_id          VARCHAR(10)   NOT NULL REFERENCES parts(part_id),
    description      VARCHAR(200),
    qty_ordered      INTEGER       NOT NULL DEFAULT 1,
    qty_received     INTEGER       DEFAULT 0,
    unit_cost_ex_gst DECIMAL(10,2),
    line_total       DECIMAL(10,2),
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 4. WORKFLOW: QUOTATIONS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE quotations (
    quote_id        VARCHAR(10)   PRIMARY KEY,
    workshop_id     VARCHAR(10)   REFERENCES workshops(workshop_id),
    client_id       VARCHAR(10)   NOT NULL REFERENCES clients(client_id),
    vehicle_id      VARCHAR(10)   NOT NULL REFERENCES vehicles(vehicle_id),
    quote_date      DATE          DEFAULT CURRENT_DATE,
    valid_until     DATE,
    total_ex_gst    DECIMAL(10,2),
    gst_amount      DECIMAL(10,2),
    total_inc_gst   DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount    DECIMAL(10,2),
    status          VARCHAR(30)   CHECK (status IN ('Draft','Sent','Approved','Declined','Expired','Converted')) DEFAULT 'Draft',
    approved_date   DATE,
    approved_method VARCHAR(30)   CHECK (approved_method IN ('SMS','Email','In-Person','Phone','Digital Signature',NULL)),
    created_by      VARCHAR(10)   REFERENCES staff(staff_id),
    notes           TEXT,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quote_lines (
    line_id           VARCHAR(10)   PRIMARY KEY,
    quote_id          VARCHAR(10)   NOT NULL REFERENCES quotations(quote_id) ON DELETE CASCADE,
    line_type         VARCHAR(20)   CHECK (line_type IN ('Labour','Part','Subcontract','Sundry')),
    job_sub_item_id   VARCHAR(10)   REFERENCES job_sub_items(sub_item_id),
    part_id           VARCHAR(10)   REFERENCES parts(part_id),
    description       VARCHAR(200),
    qty               INTEGER       DEFAULT 1,
    unit_price_ex_gst DECIMAL(10,2),
    line_total_ex_gst DECIMAL(10,2),
    gst_amount        DECIMAL(10,2),
    line_total_inc    DECIMAL(10,2),
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 5. WORKFLOW: JOB CARDS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE job_cards (
    jobcard_id     VARCHAR(10)   PRIMARY KEY,
    workshop_id    VARCHAR(10)   REFERENCES workshops(workshop_id),
    quote_id       VARCHAR(10)   REFERENCES quotations(quote_id),
    client_id      VARCHAR(10)   NOT NULL REFERENCES clients(client_id),
    vehicle_id     VARCHAR(10)   NOT NULL REFERENCES vehicles(vehicle_id),
    staff_id       VARCHAR(10)   REFERENCES staff(staff_id),
    date_in        DATE          DEFAULT CURRENT_DATE,
    date_due       DATE,
    date_completed DATE,
    mileage_in     INTEGER,
    bay_number     VARCHAR(20),
    status         VARCHAR(30)   CHECK (status IN ('Booked','Waiting','In Progress','Waiting for Parts','Quality Check','Ready for Pickup','Completed','Cancelled')) DEFAULT 'Booked',
    priority       VARCHAR(10)   CHECK (priority IN ('Urgent','Normal','Low')) DEFAULT 'Normal',
    total_ex_gst   DECIMAL(10,2),
    gst_amount     DECIMAL(10,2),
    total_inc_gst  DECIMAL(10,2),
    internal_notes TEXT,
    customer_notes TEXT,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_card_lines (
    line_id           VARCHAR(10)   PRIMARY KEY,
    jobcard_id        VARCHAR(10)   NOT NULL REFERENCES job_cards(jobcard_id) ON DELETE CASCADE,
    line_type         VARCHAR(20)   CHECK (line_type IN ('Labour','Part','Subcontract','Sundry')),
    job_sub_item_id   VARCHAR(10)   REFERENCES job_sub_items(sub_item_id),
    part_id           VARCHAR(10)   REFERENCES parts(part_id),
    description       VARCHAR(200),
    qty               INTEGER       DEFAULT 1,
    unit_price_ex_gst DECIMAL(10,2),
    line_total_ex_gst DECIMAL(10,2),
    actual_labour_hrs DECIMAL(4,2),
    staff_id          VARCHAR(10)   REFERENCES staff(staff_id),
    completed         BOOLEAN       DEFAULT FALSE,
    notes             TEXT,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 6. WORKFLOW: INVOICES & PAYMENTS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE invoices (
    invoice_id       VARCHAR(10)   PRIMARY KEY,
    workshop_id      VARCHAR(10)   REFERENCES workshops(workshop_id),
    jobcard_id       VARCHAR(10)   REFERENCES job_cards(jobcard_id),
    client_id        VARCHAR(10)   NOT NULL REFERENCES clients(client_id),
    vehicle_id       VARCHAR(10)   NOT NULL REFERENCES vehicles(vehicle_id),
    invoice_date     DATE          DEFAULT CURRENT_DATE,
    due_date         DATE,
    tax_type         VARCHAR(20)   DEFAULT 'GST Inclusive',
    subtotal_ex_gst  DECIMAL(10,2),
    gst_amount       DECIMAL(10,2),
    total_inc_gst    DECIMAL(10,2),
    discount_type    VARCHAR(20)   CHECK (discount_type IN ('Percentage','Fixed Amount','None')) DEFAULT 'None',
    discount_value   DECIMAL(10,2) DEFAULT 0,
    discount_amount  DECIMAL(10,2) DEFAULT 0,
    final_amount     DECIMAL(10,2),
    payment_status   VARCHAR(20)   CHECK (payment_status IN ('Paid','Unpaid','Overdue','Partial','Refunded','Void')) DEFAULT 'Unpaid',
    payment_method   VARCHAR(30)   CHECK (payment_method IN ('Cash','Credit Card','Debit Card','EFTPOS','PayID','Direct Debit','BPay','Bank Transfer',NULL)),
    payment_date     DATE,
    payment_ref      VARCHAR(100),
    created_by       VARCHAR(10)   REFERENCES staff(staff_id),
    emailed          BOOLEAN       DEFAULT FALSE,
    pdf_generated    BOOLEAN       DEFAULT FALSE,
    next_service_due DATE,
    next_service_km  INTEGER,
    notes            TEXT,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_lines (
    line_id           VARCHAR(10)   PRIMARY KEY,
    invoice_id        VARCHAR(10)   NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    line_type         VARCHAR(20)   CHECK (line_type IN ('Labour','Part','Subcontract','Sundry')),
    job_sub_item_id   VARCHAR(10)   REFERENCES job_sub_items(sub_item_id),
    part_id           VARCHAR(10)   REFERENCES parts(part_id),
    description       VARCHAR(200),
    qty               INTEGER       DEFAULT 1,
    unit_price_ex_gst DECIMAL(10,2),
    line_total_ex_gst DECIMAL(10,2),
    gst_rate          DECIMAL(4,2)  DEFAULT 0.10,
    gst_amount        DECIMAL(10,2),
    line_total_inc    DECIMAL(10,2),
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    payment_id       VARCHAR(10)   PRIMARY KEY,
    workshop_id      VARCHAR(10)   REFERENCES workshops(workshop_id),
    payment_type     VARCHAR(20)   CHECK (payment_type IN ('Customer','Supplier','Refund','Expense')),
    invoice_id       VARCHAR(10)   REFERENCES invoices(invoice_id),
    supplier_inv_id  VARCHAR(20),
    client_id        VARCHAR(10)   REFERENCES clients(client_id),
    supplier_id      VARCHAR(10)   REFERENCES suppliers(supplier_id),
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   VARCHAR(30)   CHECK (payment_method IN ('Cash','Credit Card','Debit Card','EFTPOS','PayID','Direct Debit','BPay','Bank Transfer')),
    payment_date     DATE          DEFAULT CURRENT_DATE,
    payment_ref      VARCHAR(100),
    received_by      VARCHAR(10)   REFERENCES staff(staff_id),
    notes            TEXT,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 7. SCHEDULING & REMINDERS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE appointments (
    appointment_id  VARCHAR(10)   PRIMARY KEY,
    workshop_id     VARCHAR(10)   REFERENCES workshops(workshop_id),
    client_id       VARCHAR(10)   NOT NULL REFERENCES clients(client_id),
    vehicle_id      VARCHAR(10)   NOT NULL REFERENCES vehicles(vehicle_id),
    booking_date    DATE          NOT NULL,
    booking_time    TIME,
    estimated_hrs   DECIMAL(4,2),
    bay_number      VARCHAR(20),
    staff_id        VARCHAR(10)   REFERENCES staff(staff_id),
    services        TEXT,
    source          VARCHAR(30)   CHECK (source IN ('Phone','Walk-in','SMS Reply','Customer Portal','Website','Repeat Booking')),
    status          VARCHAR(20)   CHECK (status IN ('Booked','Confirmed','In Progress','Completed','No Show','Cancelled','Rescheduled')) DEFAULT 'Booked',
    reminder_sent   BOOLEAN       DEFAULT FALSE,
    confirmed       BOOLEAN       DEFAULT FALSE,
    created_date    DATE          DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_reminders (
    reminder_id     VARCHAR(10)   PRIMARY KEY,
    workshop_id     VARCHAR(10)   REFERENCES workshops(workshop_id),
    vehicle_id      VARCHAR(10)   NOT NULL REFERENCES vehicles(vehicle_id),
    client_id       VARCHAR(10)   NOT NULL REFERENCES clients(client_id),
    reminder_type   VARCHAR(30)   CHECK (reminder_type IN ('Next Service','Pink Slip','Tyre Rotation','Timing Belt','Warranty Expiry')),
    due_date        DATE,
    due_mileage_km  INTEGER,
    last_service    DATE,
    last_invoice_id VARCHAR(10)   REFERENCES invoices(invoice_id),
    status          VARCHAR(20)   CHECK (status IN ('Pending','Sent','Booked','Completed','Declined','Expired')) DEFAULT 'Pending',
    sms_sent_date   DATE,
    email_sent_date DATE,
    client_response VARCHAR(30)   CHECK (client_response IN ('Booked','Not Interested','No Reply','Call Back',NULL)),
    booking_created BOOLEAN       DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_history (
    record_id       VARCHAR(10)   PRIMARY KEY,
    vehicle_id      VARCHAR(10)   NOT NULL REFERENCES vehicles(vehicle_id),
    jobcard_id      VARCHAR(10)   REFERENCES job_cards(jobcard_id),
    service_date    DATE          NOT NULL,
    service_type    VARCHAR(100),
    description     TEXT,
    staff_id        VARCHAR(10)   REFERENCES staff(staff_id),
    mileage         INTEGER,
    total_cost      DECIMAL(10,2),
    invoice_id      VARCHAR(10)   REFERENCES invoices(invoice_id),
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 8. ACCOUNTING LEDGER
-- ───────────────────────────────────────────────────────────────

CREATE TABLE accounting_ledger (
    transaction_id   VARCHAR(20)   PRIMARY KEY,
    workshop_id      VARCHAR(10)   REFERENCES workshops(workshop_id),
    transaction_date DATE          NOT NULL,
    bas_period       VARCHAR(20),  -- e.g. 'Q1 2025-26'
    entity_type      VARCHAR(20)   CHECK (entity_type IN ('Customer','Supplier','Expense','Refund')),
    entity_id        VARCHAR(10),
    entity_name      VARCHAR(200),
    transaction_type VARCHAR(20)   CHECK (transaction_type IN ('Invoice','Payment','Purchase','Refund','Expense')),
    direction        VARCHAR(10)   CHECK (direction IN ('Incoming','Outgoing')),
    related_doc_type VARCHAR(20),  -- 'Invoice', 'PO', 'Payment'
    related_doc_id   VARCHAR(20),
    description      TEXT,
    amount_ex_gst    DECIMAL(10,2),
    gst_amount       DECIMAL(10,2),
    amount_inc_gst   DECIMAL(10,2),
    payment_status   VARCHAR(20),
    payment_method   VARCHAR(30),
    entered_by       VARCHAR(10)   REFERENCES staff(staff_id),
    notes            TEXT,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ───────────────────────────────────────────────────────────────
-- 9. INDEXES FOR PERFORMANCE
-- ───────────────────────────────────────────────────────────────

-- Client lookups
CREATE INDEX idx_clients_mobile    ON clients(mobile);
CREATE INDEX idx_clients_email     ON clients(email);
CREATE INDEX idx_clients_name      ON clients(first_name, last_name);
CREATE INDEX idx_clients_business  ON clients(business_name);

-- Vehicle lookups
CREATE INDEX idx_vehicles_rego     ON vehicles(registration_no);
CREATE INDEX idx_vehicles_vin      ON vehicles(vin);
CREATE INDEX idx_vehicles_service  ON vehicles(next_service_due);
CREATE INDEX idx_vehicles_pinkslip ON vehicles(pink_slip_expiry);

-- Junction table
CREATE INDEX idx_cv_client         ON client_vehicles(client_id);
CREATE INDEX idx_cv_vehicle        ON client_vehicles(vehicle_id);

-- Workflow pipeline
CREATE INDEX idx_quotes_client     ON quotations(client_id);
CREATE INDEX idx_quotes_status     ON quotations(status);
CREATE INDEX idx_jobcards_status   ON job_cards(status);
CREATE INDEX idx_jobcards_client   ON job_cards(client_id);
CREATE INDEX idx_jobcards_vehicle  ON job_cards(vehicle_id);
CREATE INDEX idx_invoices_client   ON invoices(client_id);
CREATE INDEX idx_invoices_status   ON invoices(payment_status);
CREATE INDEX idx_invoices_date     ON invoices(invoice_date);

-- Inventory
CREATE INDEX idx_parts_category    ON parts(category_id);
CREATE INDEX idx_parts_supplier    ON parts(primary_supplier_id);
CREATE INDEX idx_parts_stock       ON parts(qty_in_stock, reorder_level);

-- Reminders
CREATE INDEX idx_reminders_due     ON service_reminders(due_date);
CREATE INDEX idx_reminders_status  ON service_reminders(status);
CREATE INDEX idx_reminders_vehicle ON service_reminders(vehicle_id);

-- Accounting
CREATE INDEX idx_ledger_date       ON accounting_ledger(transaction_date);
CREATE INDEX idx_ledger_bas        ON accounting_ledger(bas_period);
CREATE INDEX idx_ledger_entity     ON accounting_ledger(entity_type, entity_id);

-- Appointments
CREATE INDEX idx_appt_date         ON appointments(booking_date);
CREATE INDEX idx_appt_status       ON appointments(status);


-- ───────────────────────────────────────────────────────────────
-- 10. VIEWS FOR COMMON QUERIES
-- ───────────────────────────────────────────────────────────────

-- Dashboard: vehicles due for service in next 30 days
CREATE VIEW vw_upcoming_services AS
SELECT
    v.vehicle_id,
    v.registration_no,
    c.client_id,
    COALESCE(c.business_name, c.first_name || ' ' || c.last_name) AS client_name,
    c.mobile,
    c.email,
    v.next_service_due,
    v.next_service_km,
    r.status AS reminder_status
FROM vehicles v
JOIN client_vehicles cv ON v.vehicle_id = cv.vehicle_id AND cv.is_primary_owner = TRUE
JOIN clients c ON cv.client_id = c.client_id
LEFT JOIN service_reminders r ON v.vehicle_id = r.vehicle_id AND r.reminder_type = 'Next Service'
WHERE v.next_service_due BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND v.is_active = TRUE;

-- Dashboard: pink slips expiring in next 30 days
CREATE VIEW vw_upcoming_pinkslips AS
SELECT
    v.vehicle_id,
    v.registration_no,
    c.client_id,
    COALESCE(c.business_name, c.first_name || ' ' || c.last_name) AS client_name,
    c.mobile,
    v.pink_slip_expiry
FROM vehicles v
JOIN client_vehicles cv ON v.vehicle_id = cv.vehicle_id AND cv.is_primary_owner = TRUE
JOIN clients c ON cv.client_id = c.client_id
WHERE v.pink_slip_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND v.is_active = TRUE;

-- Dashboard: outstanding invoices
CREATE VIEW vw_outstanding_invoices AS
SELECT
    i.invoice_id,
    i.invoice_date,
    i.due_date,
    i.final_amount,
    i.payment_status,
    COALESCE(c.business_name, c.first_name || ' ' || c.last_name) AS client_name,
    c.mobile,
    v.registration_no,
    CURRENT_DATE - i.due_date AS days_overdue
FROM invoices i
JOIN clients c ON i.client_id = c.client_id
JOIN vehicles v ON i.vehicle_id = v.vehicle_id
WHERE i.payment_status IN ('Unpaid','Overdue','Partial')
ORDER BY i.due_date;

-- Dashboard: low stock parts
CREATE VIEW vw_low_stock AS
SELECT
    p.part_id,
    p.item_name,
    p.qty_in_stock,
    p.reorder_level,
    p.reorder_qty,
    p.sell_price_ex_gst,
    s.business_name AS supplier,
    s.phone AS supplier_phone
FROM parts p
LEFT JOIN suppliers s ON p.primary_supplier_id = s.supplier_id
WHERE p.qty_in_stock <= p.reorder_level
  AND p.is_active = TRUE
  AND p.reorder_level > 0
ORDER BY (p.qty_in_stock - p.reorder_level);

-- BAS reporting: GST summary by quarter
CREATE VIEW vw_bas_summary AS
SELECT
    bas_period,
    SUM(CASE WHEN direction = 'Incoming' THEN gst_amount ELSE 0 END) AS gst_collected,
    SUM(CASE WHEN direction = 'Outgoing' THEN gst_amount ELSE 0 END) AS gst_paid,
    SUM(CASE WHEN direction = 'Incoming' THEN gst_amount ELSE 0 END)
  - SUM(CASE WHEN direction = 'Outgoing' THEN gst_amount ELSE 0 END) AS net_gst_payable,
    SUM(CASE WHEN direction = 'Incoming' THEN amount_ex_gst ELSE 0 END) AS total_revenue_ex_gst,
    SUM(CASE WHEN direction = 'Outgoing' THEN amount_ex_gst ELSE 0 END) AS total_expenses_ex_gst
FROM accounting_ledger
GROUP BY bas_period
ORDER BY bas_period;

-- Workshop floor: active jobs board
CREATE VIEW vw_active_jobs AS
SELECT
    jc.jobcard_id,
    jc.bay_number,
    jc.status,
    jc.priority,
    jc.date_in,
    jc.date_due,
    v.registration_no,
    COALESCE(c.business_name, c.first_name || ' ' || c.last_name) AS client_name,
    s.first_name || ' ' || COALESCE(s.last_name, '') AS mechanic,
    jc.total_inc_gst
FROM job_cards jc
JOIN vehicles v ON jc.vehicle_id = v.vehicle_id
JOIN clients c ON jc.client_id = c.client_id
LEFT JOIN staff s ON jc.staff_id = s.staff_id
WHERE jc.status NOT IN ('Completed','Cancelled')
ORDER BY
    CASE jc.priority WHEN 'Urgent' THEN 1 WHEN 'Normal' THEN 2 ELSE 3 END,
    jc.date_due;
