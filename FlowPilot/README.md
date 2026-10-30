# FlowPilot
### Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System
**Smart India Hackathon (SIH) Prototype • Non-Statutory Demonstration Platform**

---

## 1. Project Overview & Problem Statement

Technical education institutions across India submit hundreds of annual approval applications to the All India Council for Technical Education (AICTE) for Extension of Approval (EoA), introduction of new emerging courses (such as AI, Machine Learning, Data Science), increases in approved seat intake, and institutional infrastructure clearances.

### Challenges Addressed:
1. **Multi-Stage Processing Friction:** Tracking applications across Scrutiny, Expert Visit Committees (EVC), and Standing Appellate/Hearing Committees (SAC/SHC).
2. **Compliance Expiration Risks:** Difficulty monitoring expiring Fire Safety NOCs, Building Stability Certificates, and Faculty Cadre ratio disclosures.
3. **Communication & Deadline Gaps:** Lack of a centralized notification hub for imminent deadlines and inspection visits.
4. **Auditability & Discretionary Integrity:** Need for an immutable, role-enforced workflow history ensuring that approval decisions remain strictly under human official control.

**FlowPilot** delivers a centralized, role-based platform that automates approval stages, tracks regulatory compliance, coordinates on-site/virtual EVC schedules, and maintains a strict audit trail.

> **Important Prototype Notice:** This application is an educational hackathon demonstration prototype. It uses fictional demonstration records and configurable workflow stages. It does not connect to internal statutory government databases. Approval, rejection, and verification decisions remain under authorized human control.

---

## 2. Technology Stack

- **Frontend:**
  - React 18 + Vite
  - React Router DOM v6
  - Lucide React (feather-style modern icons)
  - Custom CSS3 Design System (Deep Navy `#0f172a`, Crisp Light `#f8fafc`, Primary Blue `#2563eb`, Subtle Teal `#0d9488`)
- **Backend:**
  - Node.js (v18+) & Express.js
  - RESTful API Architecture
  - JWT Authentication (`jsonwebtoken`)
  - Password Hashing with `bcryptjs`
  - CORS & Rate Limiting (`express-rate-limit`)
- **Database:**
  - MySQL Server (v8.0 / v9.x)
  - Relational Schema with Foreign Keys & Cascading Guards (`mysql2/promise`)
  - Parameterized Queries preventing SQL injection

---

## 3. Project Directory Structure

```
AICTE-FlowGuard/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Alerts.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── AuditTrail.jsx
│   │   │   ├── Compliance.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DocumentCheck.jsx
│   │   │   ├── EVCScheduling.jsx
│   │   │   ├── Institutions.jsx
│   │   │   ├── Login.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   │   ├── alertController.js
│   │   ├── applicationController.js
│   │   ├── auditController.js
│   │   ├── authController.js
│   │   ├── complianceController.js
│   │   ├── dashboardController.js
│   │   ├── documentController.js
│   │   ├── evcController.js
│   │   ├── institutionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── complianceRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── evcRoutes.js
│   │   ├── institutionRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   ├── init-db.js
│   │   ├── seed-db.js
│   │   └── test-backend.js
│   ├── services/
│   │   └── auditService.js
│   ├── auth.js
│   ├── db.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── .gitignore
└── README.md
```

---

## 4. Demo Accounts & Credentials

The system provides pre-configured fictional accounts for testing role boundaries:

| Role | Name | Email Address | Password | Permissions & Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Dr. Rajesh Sharma | `admin@flowguard.aicte.gov.in` | `Admin@1234` | Full system access, all institutions, workflow decisions, user management, audit logs |
| **OFFICIAL** | Dr. Sunita Deshmukh | `official@flowguard.aicte.gov.in` | `Official@1234` | Regional Scrutiny Officer: stage transitions, EVC scheduling, compliance verification |
| **INSTITUTION** | Dr. K. S. Ramanujam | `principal@apextech.edu.in` | `Apex@1234` | Apex Institute Principal: strictly isolated to Institution #1, submits applications & evidence |
| **INSTITUTION** | Dr. Meenakshi Rao | `director@karnatakatrust.edu.in` | `KTech@1234` | Karnataka Technical Academy Director: strictly isolated to Institution #2 |

*Tip: The Login page includes one-click buttons to automatically load any of these demo presets.*

---

## 5. Prerequisites & Environment Setup

### Prerequisites:
1. **Node.js** (v18.0.0 or higher recommended)
2. **npm** (v9.0.0 or higher)
3. **MySQL Server** (v8.0+ or v9.x running on localhost port 3306)

---

## 6. Database Initialization & Seeding

1. Open MySQL Command Line or Workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS aicte_flowguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Initialize the schema:
   ```bash
   cd backend
   npm run db:init
   ```
   *Or apply directly via MySQL CLI:*
   ```bash
   mysql -u root -p aicte_flowguard < ../database/schema.sql
   ```

3. Populate baseline demonstration records:
   ```bash
   npm run db:seed
   ```
   *Or apply directly via MySQL CLI:*
   ```bash
   mysql -u root -p aicte_flowguard < ../database/seed.sql
   ```

---

## 7. Starting Backend & Frontend

### Backend Service (Express.js on Port 5000)
1. Configure `backend/.env` (see `backend/.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=aicte_flowguard
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:5173
   ```
2. Install dependencies & start server:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Verify backend:* `http://localhost:5000/api/health`

### Frontend Service (React + Vite on Port 5173)
1. Install dependencies & start Vite:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open in browser: `http://localhost:5173`

---

## 8. REST API Reference Summary

### Authentication & Profiles
- `POST /api/auth/login` - User authentication, JWT issuance, audit event
- `GET /api/auth/me` - Authenticated profile & institution association
- `POST /api/auth/logout` - Session invalidation & audit logging

### Dashboard & Analytics
- `GET /api/dashboard` - Live KPI counts, status distributions, overdue tasks, EVC schedules

### Application Management
- `GET /api/applications` - Search, filter by stage, status, priority, due date
- `POST /api/applications` - Create technical approval filing
- `GET /api/applications/:id` - Full application details, history, EVC visits, and compliance
- `PATCH /api/applications/:id` - Advance workflow stage, status, and commit remarks (Transaction-safe)
- `GET /api/applications/:id/history` - Chronological stage transition timeline

### Institutional Registry
- `GET /api/institutions` - Directory of technical colleges
- `POST /api/institutions` - Register new institution (Admin/Official)
- `GET /api/institutions/:id` - Institution dossier with associated applications & compliance
- `PATCH /api/institutions/:id` - Update institutional details

### Statutory Compliance Monitoring
- `GET /api/compliance` - List compliance requirements, search, filter overdue
- `POST /api/compliance` - Issue compliance mandate (Fire NOC, Cadre Ratio, etc.)
- `GET /api/compliance/:id` - Detailed requirement status
- `PATCH /api/compliance/:id` - Submit evidence reference (Institution) or verify (Official)

### Expert Visit Committee (EVC) Scheduling
- `GET /api/evc` - List inspection visits with status and upcoming filter
- `POST /api/evc` - Schedule on-site/virtual EVC inspection with expert panel
- `PATCH /api/evc/:id` - Update inspection status, reschedule, or record panel report

### Centralized Alerts
- `GET /api/alerts` - Deadline alerts, overdue items, pending actions
- `GET /api/alerts/unread-count` - Unread badge count
- `PATCH /api/alerts/:id/read` - Acknowledge alert
- `POST /api/alerts/mark-all-read` - Acknowledge all alerts

### Audit & Governance
- `GET /api/audit` - Immutable audit log of all system events (Admin & Official)
- `GET /api/users` - User directory (Admin only)
- `POST /api/users` - Provision user account (Admin only)
- `PATCH /api/users/:id/toggle-status` - Activate / deactivate user account

### Document Scrutiny Assistant
- `POST /api/document-check/check` - Rule-based verification (Cadre ratio 1:2:6, Land norms, Fire NOC)
- `GET /api/document-check` - History of past document scrutiny evaluations

---

## 9. Automated Test Suite Results

An end-to-end automated verification script (`backend/scripts/test-backend.js`) validates all core operations:

```
> node scripts/test-backend.js

Running backend automated verification tests...

[PASS] Health check endpoint returns 200 UP
[PASS] Invalid login rejected with 401
[PASS] Admin login successful with valid JWT
[PASS] Official login successful with valid JWT
[PASS] Institution login successful with valid institution binding
[PASS] GET /api/auth/me verifies valid session
[PASS] Admin dashboard receives aggregated database metrics
[PASS] Institution dashboard is isolated strictly to institution 1 (Apex Institute)
[PASS] Institution application query only returns records belonging to institution 1
[PASS] Institution user is blocked (403) from accessing another institution application
[PASS] Institution successfully submits new application
[PASS] Institution blocked (403) from approving their own application
[PASS] Official successfully advances workflow stage to Scrutiny
[PASS] Workflow history accurately records all stage and status changes
[PASS] Official creates institutional compliance item
[PASS] Institution records compliance evidence
[PASS] Authorized official marks compliance as Verified
[PASS] Official schedules EVC inspection visit
[PASS] Centralized alerts generated and retrieved
[PASS] Audit trail logs all critical actions with user, timestamp and description
[PASS] Rule-based document check completes with transparent checklist

=========================================
Test Execution Summary: 21 PASSED, 0 FAILED
=========================================
```

Additionally, `npm run build` inside `frontend/` executes with zero errors:
- `dist/index.html` (1.2 kB)
- `dist/assets/index-*.css` (11.5 kB)
- `dist/assets/index-*.js` (298 kB)

---

## 10. Security & Architectural Highlights

1. **Server-Side Authorization Enforcement:** Institution users are restricted from viewing or altering other institutions' applications or compliance records at the SQL and middleware layer, not merely by hiding UI buttons.
2. **Human Decision Control:** Final approvals, rejections, and compliance verifications strictly require authorized official or administrator intervention.
3. **Database Transactions:** Stage and status transitions use atomic MySQL transactions (`connection.beginTransaction()`, `connection.commit()`) ensuring that status updates, workflow timeline records, and audit events succeed together or roll back cleanly.
4. **Credential Safety:** Passwords hashed with `bcryptjs` (salt rounds = 10). Password hashes, secrets, and raw stack traces are never exposed in API payloads.

---

## 11. Known Prototype Limitations & Future Enhancements

- **Direct Document Uploads:** In this prototype, evidence is captured via document reference identifiers and notarized text descriptions. Direct PDF object store uploads (e.g. S3/MinIO) can be attached via pre-signed URLs.
- **SMS / Email Gateways:** Alert notifications are delivered in-app; external SMS/email dispatch requires an authorized NIC / SMS gateway configuration.
- **Biometric Aadhaar Authentication:** Faculty cadre validation currently uses rule-based checklist checks and can be extended to integrate live UIDAI / DigiLocker APIs in a statutory deployment.
