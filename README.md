# MechWise WMS — Workshop Management System

> **Client:** Dhalla Automotive Pty Ltd (Kingswood NSW)  
> **Platform:** Full-Stack SaaS Workshop Management System for Australian Mechanical Workshops  

---

## 👋 Welcome! Quick Start Guide (For Non-Coders)

Follow these simple step-by-step instructions to get the **MechWise** application running on your computer.

---

### Step 1: Install Node.js (Only need to do this once)

1. Open your web browser and go to: **[https://nodejs.org](https://nodejs.org)**
2. Download and install the **LTS (Long Term Support)** version for your operating system (Mac or Windows).
3. Follow the standard on-screen installer prompts (click *Next* until finished).

---

### Step 2: Download or Clone this Project

#### If you use Git / GitHub:
Open your computer's **Terminal** (on Mac) or **Command Prompt / PowerShell** (on Windows) and type:
```bash
git clone https://github.com/SimarPalSingh/WMS.git
cd WMS
```

#### If you downloaded a ZIP folder:
1. Unzip the downloaded folder on your computer.
2. Open **Terminal** (Mac) or **Command Prompt** (Windows).
3. Navigate into the unzipped project folder:
   ```bash
   cd path/to/WMS
   ```

---

### Step 3: Run the One-Time Setup Commands

Inside your Terminal, enter the `mechwise-app` subfolder and run these 3 commands:

```bash
# 1. Enter the application directory
cd mechwise-app

# 2. Install dependencies (takes ~30-60 seconds)
npm install

# 3. Setup the database and load Dhalla Automotive seed data
npx prisma db push
npx tsx prisma/seed.ts
```

> **What just happened?** This created your local database and pre-loaded sample data for Dhalla Automotive (including sample vehicles, mechanics, workshop bays, and active job cards).

---

### Step 4: Start the Application

Start the local server by typing:
```bash
npm run dev
```

You will see a message saying:
```
▲ Next.js
- Local: http://localhost:3000 (or http://localhost:3001)
✓ Ready
```

---

### Step 5: View the App in Your Browser 🚀

Open Google Chrome, Safari, or any browser and visit:
👉 **[http://localhost:3000](http://localhost:3000)** *(or [http://localhost:3001](http://localhost:3001) if port 3000 is occupied)*

You are now ready to explore and test the entire workshop management system!

---

## 🧭 Application Feature Guide

Here is what you can test across the system:

| Module | What it does | How to test |
| :--- | :--- | :--- |
| **Workshop Floor Board** | Live Kanban view of all 4 workshop bays showing vehicle regos, mechanics, and job statuses. | Visit the homepage (`/`) |
| **Clients & Accounts** | Customer directory with Individual vs Fleet (ABN) filters and lifetime spend. | Click **Clients** in the sidebar |
| **Vehicle Fleet Registry** | Rego-first lookup, odometer tracking, and NSW Pink Slip / logbook service intervals. | Click **Vehicles** in the sidebar |
| **Job Cards Pipeline** | 8-stage workshop workflow from intake to parts, QC, and invoicing. | Click **Job Cards** in the sidebar |
| **Tax Invoices & Billing** | Official ATO-compliant Tax Invoices with 10% Australian GST and payment terminal. | Click **Invoices** in the sidebar |
| **SMS Reminders Engine** | Batch SMS campaign dispatcher with ACMA Spam Act 2003 compliance checks. | Click **Reminders** in the sidebar |
| **Reports & BAS Summary** | Quarterly Australian BAS (Box G1/1A GST calculation) and cash-flow graphs. | Click **Reports & BAS** in the sidebar |
| **Customer Portal** | Magic-link self-service portal for vehicle health and invoice downloads. | Visit `/portal/cli-01` in your browser |

---

## 🛑 How to Stop & Restart the App Later

- **To Stop the app:** In your Terminal window, press `Ctrl + C`.
- **To Start it again next time:** Open Terminal, navigate to the folder, and run:
  ```bash
  cd WMS/mechwise-app
  npm run dev
  ```

---

## ❓ Need Help?
If you encounter any issues or have questions about testing specific features, refer to the [Feature Verification Matrix](MechWise_Feature_Verification_Matrix.md) or [Incremental Implementation Plan](MechWise_Implementation_Plan.md).
