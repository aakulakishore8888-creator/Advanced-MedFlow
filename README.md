<div align="center">

# 🏥 MedFlow HMS
### Premium Hospital Management System

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python_3-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**A modern, responsive, full-stack Hospital Management System designed for hospitals, clinics, and healthcare centres.**

[Live Demo](#-quick-start) • [Features](#-features) • [Architecture](#-system-architecture) • [Setup](#-installation--setup) • [API Docs](#-api-reference)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [User Roles & Credentials](#-user-roles--credentials)
- [API Reference](#-api-reference)
- [Module Guide](#-module-guide)
- [Design System](#-design-system)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MedFlow HMS** is a production-quality, single-page web application simulating a complete hospital management ecosystem. It features role-based access control across five user types, a REST API backend, a JSON file-based persistent database, interactive Chart.js analytics, Bootstrap 5 responsive layouts, and a Light/Dark theme toggle.

The project was built as a **field practicum** submission demonstrating full-stack web development with a premium SaaS-grade UI/UX comparable to Apollo Hospitals, Practo, or modern medical ERP platforms.

> **Two backend options are provided:**
> - **Node.js / Express** (`server.js`) — primary backend
> - **Python 3** (`server.py`) — fallback backend, no additional packages needed

---

## ✨ Features

### 🌐 Public Landing Page
- Animated hero section with hospital statistics counter
- Services showcase (6 medical service cards)
- Clinical departments gallery (Cardiology, Pediatrics, Neurology, Dermatology)
- Doctor team section with styled initials avatars
- Patient testimonials with star ratings
- Google Maps integration (Contact page)
- Footer with newsletter subscription and social media links
- Emergency Call button
- Light / Dark mode toggle

### 🔐 Authentication
- Role-based login portal for **5 user types**
- "Autofill" credentials helper for demo/evaluation
- Forgot Password modal
- Patient self-registration form
- Session persistence via `localStorage`
- Demo Control Bar for instant role switching (evaluation tool)

### 📊 Admin Dashboard
- Live statistics cards: Total Doctors, Patients, Appointments, Available Beds, Revenue
- Financial Analytics line chart (Chart.js)
- Patient Demographics doughnut chart
- Active doctor staff table
- Recent activity logs panel
- Notifications dropdown (badge count)

### 👨‍⚕️ Doctor Dashboard
- Today's appointment queue with patient actions
- Patient medical history inspector (select patient → view history, allergies, labs)
- Prescription writer modal
- Schedule/availability management dropdown
- Telehealth video consultation simulator (live call timer)

### 🙋 Patient Dashboard
- Book appointment CTA card
- Appointment history table (reschedule / cancel actions)
- Prescriptions list
- Lab diagnostics list with PDF download trigger
- Billing & pending invoices widget (Pay Now button)
- Profile details widget with inline edit

### 💊 Pharmacist Dashboard
- Stock overview statistics (total units, low stock alerts, processed today)
- Medicine inventory table
- Dispense prescription form

### 🗂️ Receptionist Dashboard
- Patient count, appointment count, bed availability stats
- Quick-action links (Book Appointment, Register Patient)

### 📅 Appointment Management
- Interactive calendar view (July 2026, appointment dot indicators)
- Physician availability checklist
- Scheduled consultations list with status badges
- Book / Reschedule / Cancel appointment modals

### 🧑‍🤝‍🧑 Patient Management
- Searchable patient database table
- Add / Edit / Delete patient records
- Full patient profile: blood group, allergies, emergency contact, clinical history

### 👩‍⚕️ Doctor Management
- Doctor profile cards with specialization badge, hours, consultation fee
- Register new doctor modal
- Availability status toggle (live API sync)

### 🏪 Pharmacy Module
- Full medicine stock catalog table with status indicators
- Low-stock notification panel
- Add medicine modal (persisted to database)
- Process prescription / dispense modal (auto-bills patient)

### 🔬 Laboratory Module
- Diagnostics test request table
- Collect sample → mark Completed action
- PDF report download trigger
- Request new lab test modal

### 💳 Billing & Payments
- Full invoice ledger table (Invoice ID, Patient, Description, Amount, Insurance, Status)
- Insurance integration panel (provider + policy number)
- Credit Card / PayPal payment gateway modal
- Supported payment methods: Visa, Mastercard, Amex, PayPal

### 📞 Contact Page
- Google Maps embed
- Emergency hotline + ambulance dispatch contacts
- Hospital address and operating hours
- Contact form with toast confirmation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Bootstrap 5.3 |
| **Markup** | HTML5 (Semantic) |
| **Styling** | CSS3 (Custom properties, Glassmorphism, Animations) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Charts** | Chart.js |
| **Icons** | Font Awesome 6 |
| **Fonts** | Google Fonts — Outfit (headings), Inter (body) |
| **Backend (Primary)** | Node.js + Express 4 |
| **Backend (Fallback)** | Python 3 (stdlib only — `http.server`, `json`, `re`) |
| **Database** | JSON flat-file (`database.json`) |
| **Auth** | Mock JWT token + `localStorage` session |
| **Routing** | Single Page Application (SPA) — client-side section toggling |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │ index.html │  │  styles.css  │  │       app.js          │   │
│  │            │  │              │  │                       │   │
│  │ 12 Sections│  │ CSS Variables│  │  State Management     │   │
│  │ 11 Modals  │  │ Glassmorphism│  │  SPA Router           │   │
│  │ Bootstrap 5│  │ Animations   │  │  REST API Fetch calls │   │
│  │ Font Awesome│  │ Dark Mode    │  │  Chart.js rendering   │   │
│  └────────────┘  └──────────────┘  └───────────┬───────────┘   │
└────────────────────────────────────────────────│────────────────┘
                                                 │ HTTP/JSON
                         ┌───────────────────────▼───────────────────────┐
                         │              Backend Server                    │
                         │                                               │
                         │   server.js (Node/Express)                    │
                         │   ── OR ──                                    │
                         │   server.py (Python 3 stdlib)                 │
                         │                                               │
                         │   Routes:                                     │
                         │   POST /api/auth/login                        │
                         │   GET|POST|PUT|DELETE /api/appointments        │
                         │   GET|POST|PUT|DELETE /api/patients           │
                         │   GET|POST|PUT        /api/doctors            │
                         │   GET|POST            /api/pharmacy           │
                         │   POST                /api/pharmacy/dispense  │
                         │   GET|POST|PUT        /api/laboratory         │
                         │   GET                 /api/billing            │
                         │   POST                /api/billing/pay        │
                         │   GET|POST            /api/prescriptions      │
                         │                                               │
                         │   Static file serving → /public/             │
                         │   SPA fallback       → /public/index.html    │
                         └───────────────────────┬───────────────────────┘
                                                 │ Read / Write
                                   ┌─────────────▼────────────┐
                                   │      database.json        │
                                   │                          │
                                   │  { users,                │
                                   │    doctors,              │
                                   │    patients,             │
                                   │    appointments,         │
                                   │    pharmacy,             │
                                   │    laboratory,           │
                                   │    billing,              │
                                   │    prescriptions }       │
                                   └──────────────────────────┘
```

### Data Flow

```
User Action (click/form submit)
        │
        ▼
app.js handler function
        │
        ├─── UI-only? ──► Update DOM directly
        │
        └─── API call? ──► fetch('/api/...', { method, body })
                                    │
                                    ▼
                          server.js / server.py
                                    │
                                    ├── readDB()  ──► database.json
                                    ├── mutate data
                                    └── writeDB() ──► database.json
                                                │
                                                ▼
                                      JSON response { success, data }
                                                │
                                                ▼
                                    showToast() + loadAllPortalData()
                                    (re-fetches all data & re-renders)
```

### Role-Based Access Control

```
                    ┌──────────────────────────┐
                    │        /api/auth/login        │
                    │  username + password + role  │
                    └─────────────┬────────────────┘
                                  │
              ┌───────────────────┼──────────────────────┐
              │                   │                      │
         role=admin          role=doctor           role=patient
              │                   │                      │
    ┌─────────▼────────┐ ┌────────▼──────────┐ ┌────────▼────────────┐
    │ Admin Dashboard  │ │ Doctor Dashboard  │ │ Patient Dashboard   │
    │ + All Modules    │ │ + Appointments    │ │ + Appointments      │
    │                  │ │ + Patients (view) │ │ + Lab Reports       │
    │                  │ │ + Lab Module      │ │ + Prescriptions     │
    │                  │ │ + Prescriptions   │ │ + Billing           │
    └──────────────────┘ └───────────────────┘ └─────────────────────┘

         role=pharmacist            role=receptionist
              │                              │
    ┌─────────▼────────────┐   ┌─────────────▼────────────┐
    │ Pharmacist Dashboard │   │ Receptionist Dashboard   │
    │ + Pharmacy Module    │   │ + Appointments           │
    │                      │   │ + Patients               │
    │                      │   │ + Lab Module             │
    │                      │   │ + Billing                │
    └──────────────────────┘   └──────────────────────────┘
```

---

## 📁 Project Structure

```
field practiculum sip/
│
├── 📄 README.md                  ← You are here
├── 📄 package.json               ← Node.js dependencies (express, nodemon)
├── 📄 server.js                  ← Node.js / Express REST API server
├── 📄 server.py                  ← Python 3 fallback REST API server
├── 📄 database.json              ← Auto-generated flat-file JSON database
│
└── 📁 public/                    ← Static frontend assets
    │
    ├── 📄 index.html             ← Single-page application entry point
    │                               (2000+ lines, 12 sections, 11 modals)
    │
    ├── 📁 css/
    │   └── 📄 styles.css         ← Custom stylesheet
    │                               (CSS variables, glassmorphism,
    │                                animations, dark mode, responsive)
    │
    └── 📁 js/
        └── 📄 app.js             ← Core application logic
                                    (state management, SPA routing,
                                     API calls, DOM rendering,
                                     Chart.js, auth, modals)
```

---

## 🚀 Installation & Setup

### Prerequisites

Choose **one** of the following backend options:

| Option | Requirement |
|--------|------------|
| **Node.js** (recommended) | Node.js ≥ 16 + npm |
| **Python 3** (fallback) | Python 3.6+ (no extra packages needed) |

### Option A — Node.js Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/medflow-hms.git
cd medflow-hms

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# or for development with auto-reload:
npm run dev

# 4. Open your browser
# Navigate to: http://localhost:3000
```

### Option B — Python 3 Setup (no dependencies)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/medflow-hms.git
cd medflow-hms

# 2. Start the Python server (no pip install needed)
python server.py

# 3. Open your browser
# Navigate to: http://localhost:3000
```

### Port Configuration

The server defaults to **port 3000**. To change the port:

**Node.js:**
```bash
PORT=8080 npm start
```

**Python:**
Edit `server.py` line:
```python
PORT = 8080   # change to your preferred port
```

### Database Reset

The `database.json` file is automatically created on first run from built-in seed data. To reset to initial state, simply delete the file:

```bash
# Windows
del database.json

# macOS / Linux
rm database.json
```

---

## 👤 User Roles & Credentials

> All demo accounts share the password: **`password123`**

| Role | Username | Dashboard Access |
|------|----------|-----------------|
| 🔴 **Admin** | `admin` | Full system access — all modules, analytics, revenue |
| 🟢 **Doctor** | `doctor` | Appointments, patient history, prescriptions, lab, video call |
| 🔵 **Patient** | `patient` | Own appointments, prescriptions, lab reports, billing |
| 🟡 **Pharmacist** | `pharmacist` | Pharmacy stock catalog, dispense prescriptions |
| ⚪ **Receptionist** | `receptionist` | Appointments, patient registration, billing |

> 💡 **Tip:** Use the **Demo Control Bar** at the top of the page to switch roles instantly without logging in.

---

## 📡 API Reference

All endpoints return JSON. The base URL is `http://localhost:3000`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate user, returns mock JWT token |

**Request body:**
```json
{
  "username": "patient",
  "password": "password123",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "token": "mock-jwt-token-xyz-patient",
  "user": { "id": 3, "name": "John Doe", "role": "patient" }
}
```

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/appointments` | Get all appointments |
| `POST` | `/api/appointments` | Book a new appointment |
| `PUT` | `/api/appointments/:id` | Update status / reschedule |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | Get all patients |
| `POST` | `/api/patients` | Register a new patient |
| `PUT` | `/api/patients/:id` | Update patient profile |
| `DELETE` | `/api/patients/:id` | Remove patient record |

### Doctors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctors` | Get all doctors |
| `POST` | `/api/doctors` | Add a new doctor |
| `PUT` | `/api/doctors/:id` | Update availability / profile |

### Pharmacy

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pharmacy` | Get medicine inventory |
| `POST` | `/api/pharmacy` | Add new medicine stock |
| `POST` | `/api/pharmacy/dispense` | Dispense prescription (reduces stock, creates bill) |

### Laboratory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/laboratory` | Get all lab test requests |
| `POST` | `/api/laboratory` | Request a new diagnostic test |
| `PUT` | `/api/laboratory/:id` | Update test status and results |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/billing` | Get all invoices |
| `POST` | `/api/billing/pay` | Mark invoice as paid |

### Prescriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prescriptions` | Get all prescriptions |
| `POST` | `/api/prescriptions` | Issue a new prescription |

---

## 📖 Module Guide

### Booking an Appointment
1. Click **Book Appointment** from landing page, patient dashboard, or receptionist panel.
2. Enter patient name, select doctor (only available doctors shown), choose date & time, select In-person or Video.
3. Submit — appointment is saved to `database.json` and reflected immediately.

### Dispensing Medicine (Pharmacist)
1. Log in as **Pharmacist**.
2. Click **Dispense Prescription** → fill patient name, medicine, quantity.
3. Stock is reduced in the database; a billing entry is automatically created.

### Completing a Lab Test
1. Log in as **Doctor**, **Admin**, or **Receptionist**.
2. Navigate to **Diagnostic Labs**.
3. Click **Collect Sample** on a Pending test → status changes to Completed.
4. Patient can then download the report from their dashboard.

### Processing a Payment
1. Any role with billing access navigates to **Billing & Invoices**.
2. Click **Pay Invoice** on an Unpaid bill.
3. Enter card details in the payment modal → invoice status changes to Paid.

---

## 🎨 Design System

### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--med-blue` | `#0284c7` | `#38bdf8` | Primary actions, links |
| `--med-green` | `#0d9488` | `#2dd4bf` | Success, available status |
| `--med-amber` | `#d97706` | `#fbbf24` | Warnings, pending |
| `--med-rose` | `#e11d48` | `#fda4af` | Danger, emergency |
| `--bg-primary` | `#ffffff` | `#0b0f19` | Cards, modals |
| `--bg-secondary` | `#f8fafc` | `#05070c` | Page background |

### Typography

| Font | Usage | Weights |
|------|-------|---------|
| **Outfit** | Headings, labels, badges | 400, 500, 600, 700, 800 |
| **Inter** | Body text, table data | 300, 400, 500, 600, 700 |

### Key CSS Classes

| Class | Effect |
|-------|--------|
| `.hover-lift` | Card lifts on hover (`translateY(-4px) scale(1.01)`) |
| `.text-gradient` | Blue→teal gradient text fill |
| `.avatar-circle` | Gradient initials avatar circle |
| `.bg-soft-primary/success/warning/danger` | Soft tinted backgrounds |
| `.animate-bounce` | Floating bounce animation |
| `.animate-pulse` | Opacity pulse animation |

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**

### Contribution Ideas
- [ ] Replace JSON flat-file with MySQL / PostgreSQL
- [ ] Add real JWT authentication with bcrypt password hashing
- [ ] Implement actual PDF report generation
- [ ] Add email notification system (nodemailer)
- [ ] Implement real-time updates with Socket.io
- [ ] Add unit tests (Jest / pytest)
- [ ] Add Docker support (`Dockerfile` + `docker-compose.yml`)
- [ ] Improve calendar with full month navigation

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ as a Field Practicum Project**

*MedFlow HMS — Premium Healthcare ERP | © 2026*

</div>
