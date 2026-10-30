# 🚀 FlowPilot – AICTE Approval Workflow Automation & Compliance Monitoring System

**FlowPilot** is a centralized web-based platform designed to streamline AICTE institutional approval workflows, automate compliance monitoring, manage inspection schedules, and provide real-time alerts.

Developed as a **Smart India Hackathon (SIH) prototype**, FlowPilot helps administrators, officials, and educational institutions manage approval applications through a structured, transparent, and role-based digital system.

> **Prototype Notice:** FlowPilot is an educational hackathon demonstration platform. It uses fictional demonstration data and does not connect to internal statutory AICTE databases. Final approval and verification decisions remain under authorized human control.

## 🎯 Problem Statement

Technical institutions across India need to manage various AICTE approval processes, including Extension of Approval (EoA), introduction of new courses, seat intake increases, and infrastructure compliance.

Traditional workflows can create several challenges:

- Difficulty tracking applications across multiple approval stages.
- Delays in identifying expired compliance documents.
- Lack of centralized inspection scheduling.
- Difficulty monitoring pending applications and deadlines.
- Limited transparency and accountability in workflow activities.

**FlowPilot addresses these challenges** through a centralized approval workflow automation and compliance monitoring platform.

## ✨ Key Features

### 📊 1. Interactive Dashboard
- Monitor total applications and their statuses.
- View pending and overdue activities.
- Track compliance statistics.
- Monitor upcoming EVC inspections.

### 📝 2. Application Management
- Create and manage approval applications.
- Track application progress across different stages.
- Filter applications by status, stage, priority, and due date.
- Maintain application workflow history.

### 🏫 3. Institution Management
- Maintain institutional records.
- Register and manage technical institutions.
- View institution-related applications and compliance details.
- Enforce institution-specific data access.

### 📋 4. Compliance Monitoring
- Track institutional compliance requirements.
- Monitor Fire Safety NOCs.
- Check Building Stability Certificates.
- Monitor Faculty Cadre Ratio.
- Track Land Title and Encumbrance requirements.
- Identify overdue compliance submissions.

### 🔍 5. Document Scrutiny Assistant
- Perform rule-based document verification.
- Check faculty cadre ratios.
- Validate configured land requirements.
- Check Fire Safety NOC validity.
- Generate transparent compliance checklists.
- Maintain document scrutiny history.

### 📅 6. Expert Visit Committee (EVC) Scheduling
- Schedule institutional inspection visits.
- Manage expert panel information.
- Support physical and virtual inspections.
- Track proposed, confirmed, completed, rescheduled, and cancelled visits.

### 🔔 7. Centralized Alerts
- Monitor upcoming deadlines.
- Identify overdue activities.
- Track pending actions.
- Manage unread notifications.
- Acknowledge individual or all alerts.

### 📜 8. Audit Trail & Workflow History
- Record important system activities.
- Track application status changes.
- Maintain user activity records.
- Improve transparency and accountability.

### 👥 9. Role-Based Access Control
- **Admin:** Manage users, institutions, applications, and system activities.
- **Official:** Handle scrutiny workflows, compliance verification, and EVC scheduling.
- **Institution:** Submit applications and compliance evidence and monitor institution-specific records.

## 🛠️ Technology Stack

### Frontend
- React.js 18
- JavaScript
- React Router DOM
- HTML5
- CSS3
- Vite
- Lucide React Icons

### Backend
- Node.js
- Express.js
- RESTful APIs
- JSON Web Token (JWT)
- Bcrypt.js
- Express Rate Limit
- Multer

### Database
- MySQL 8.0+
- MySQL2
- SQL
- Relational Database Design

### Development Tools
- Visual Studio Code
- Git
- GitHub
- MySQL Workbench
- npm

## 🏗️ System Architecture

FlowPilot follows a client-server architecture.

1. **Frontend Layer:** React.js provides the interactive user interface and dashboard.
2. **Backend Layer:** Node.js and Express.js process API requests, authentication, and business logic.
3. **Database Layer:** MySQL stores institutional information, applications, compliance records, users, and workflow history.
4. **Security Layer:** JWT authentication and role-based authorization protect application resources.
5. **Monitoring Layer:** Alerts, document scrutiny, EVC scheduling, and audit services support workflow monitoring.

## 📂 Project Structure

```text
FlowPilot/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
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
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── auth.js
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

Follow these steps to run FlowPilot on your local machine.

### 1. Prerequisites

Install the following:

- Node.js (v18 or higher)
- npm
- MySQL Server (v8.0 or higher)
- Visual Studio Code

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/FlowPilot.git
```

### 3. Navigate to the Project

```bash
cd FlowPilot
```

### 4. Configure the MySQL Database

Open MySQL Workbench or MySQL Command Line and execute:

```sql
CREATE DATABASE IF NOT EXISTS aicte_flowguard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 5. Initialize the Database

Navigate to the backend folder:

```bash
cd backend
npm install
```

Initialize the database schema:

```bash
npm run db:init
```

Insert demonstration data:

```bash
npm run db:seed
```

### 6. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=aicte_flowguard
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

Replace the database password and JWT secret with your own values.

### 7. Start the Backend Server

Inside the backend directory:

```bash
npm run dev
```

Backend API:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 8. Install Frontend Dependencies

Open another terminal:

```bash
cd FlowPilot/frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 9. Start the Frontend

```bash
npm run dev
```

### 10. Access the Application

Open your browser:

```text
http://localhost:5173
```

## 🔗 REST API Modules

| Module | Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Dashboard | `/api/dashboard` |
| Applications | `/api/applications` |
| Institutions | `/api/institutions` |
| Compliance | `/api/compliance` |
| EVC Scheduling | `/api/evc` |
| Alerts | `/api/alerts` |
| Audit Trail | `/api/audit` |
| User Management | `/api/users` |
| Document Scrutiny | `/api/document-check` |

All API modules are implemented using Express.js routes and controllers.

## 🔐 Security Features

- JWT-based user authentication.
- Password hashing using Bcrypt.js.
- Role-based authorization.
- Institution-specific data access restrictions.
- API rate limiting for login requests.
- Parameterized SQL queries.
- Protected API endpoints.
- Centralized error handling.
- Transaction-based application workflow updates.

## 🧪 Testing & Validation

The project includes an automated backend verification script.

Run the tests from the backend directory:

```bash
node scripts/test-backend.js
```

The existing prototype test results report:

- 21 test cases passed.
- 0 test cases failed.
- Frontend production build completed successfully.

The tests cover authentication, dashboard access, institution isolation, application workflows, compliance verification, EVC scheduling, alerts, audit logging, and document scrutiny.

## 🚀 Future Enhancements

- AI-powered application document analysis.
- Intelligent compliance risk prediction.
- Automated email and SMS notifications.
- Advanced document upload and verification.
- Integration with authorized government platforms.
- Real-time workflow notifications.
- Advanced analytics and reporting.
- Digital document verification integration.

## 🎯 Project Objective

To simplify and modernize AICTE institutional approval processes through workflow automation, centralized compliance monitoring, transparent inspection scheduling, and efficient alert management.

## 👨‍💻 Project Information

**Project Name:** FlowPilot

**Event:** Smart India Hackathon (SIH)

**Domain:** AICTE Approval Workflow Automation

**Category:** Web Application / Software Solution

**Purpose:** Integrated Approval Workflow, Compliance Monitoring and Alert Management System

---

⭐ If you find this project interesting, consider giving this repository a star!

**FlowPilot – Streamlining Approvals, Simplifying Compliance, Strengthening Transparency.**
