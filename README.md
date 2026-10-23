# AuraHealth — Premium 3D Doctor Appointment Booking Platform

A complete, production-grade doctor appointment booking platform featuring immersive 3D Three.js/React Three Fiber visualizations, refined GSAP motion design, an accessible patient booking workflow, and a protected hospital operations dashboard with transactional double-booking prevention.

---

## 1. System Architecture & Tech Stack

### Frontend (`/client`)
- **Framework & Tooling:** React 18, TypeScript, Vite, Tailwind CSS
- **3D Graphics & Canvas:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Motion & Interactions:** GSAP, ScrollTrigger, CSS 3D perspective transforms
- **Component & State Architecture:** Context API (`AuthContext`), React Hook Form, Lucide React icons
- **Reliability & Accessibility:** WebGL context detection with fallback (`WebGLFallback.tsx`), `prefers-reduced-motion` compliance, mobile responsive layout

### Backend (`/server`)
- **Runtime & API:** Node.js, Express, TypeScript, REST API architecture
- **Database & ORM:** SQLite (configured for local zero-dependency demo portability) with Prisma ORM
- **Security & Authorization:** JWT authentication, bcryptjs password hashing, Role-Based Access Control (RBAC: `PATIENT`, `STAFF`, `ADMIN`), rate limiting, security headers (`nosniff`, `DENY`, `XSS`)
- **Concurrency & Transactions:** ACID Prisma `$transaction` guarantees that prevent double booking of doctors and clinic rooms
- **Validation:** Strict runtime validation using Zod for all requests, auth, approvals, and queries

---

## 2. Core Functional Highlights

### Patient Experience
1. **Interactive 3D Hero Scene:** Procedural double-helix DNA, gyroscopic translucent medical rings, ambient bio-particles, and subtle pointer parallax.
2. **Medical Specialty Discovery:** Filterable departments (Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, General Medicine, Gynecology).
3. **Doctor Faculty Roster:** Searchable by doctor name, qualifications, specialty, and languages. Includes a live slot availability inspector querying real schedule data.
4. **Multi-Step Appointment Booking Form:**
   - **Step 1:** Patient contact and demographic information.
   - **Step 2:** Chief health concern, detailed symptoms, and urgent care disclaimers.
   - **Step 3:** Preferences for doctor, date, time-of-day, and visit mode.
   - **Step 4:** Summary review and mandatory privacy consent.
   - **Result:** Generates an unguessable private reference (e.g. `REQ-2026-XXXX-XXXX`) with initial status **Pending Review**.
5. **Security-Verified Status Tracker:**
   - Requires both the **Reference Code** AND matching **Phone Number or Email** on file to prevent unauthorized brute-force disclosure of medical complaints.
   - Renders live status: **Pending Review**, **Confirmed** (shows real assigned physician, doctor ID, room number, department, arrival instructions, and cancellation option), **Rejected** (with triage explanation), or **Cancelled**.

### Hospital Staff & Administration Dashboard
1. **Real-time Metrics:** Derived directly from the relational database (Total Requests, Pending Review, Confirmed, Rejected, Today's Visits, Active Doctors, Configured Rooms).
2. **Appointment Triage Queue:** Filter by status, search, and launch the allocation modal.
3. **Transactional Allocation Modal:**
   - Evaluates doctor schedules and existing bookings in real time.
   - Restricts room selection to rooms verified free during that exact window.
   - Enforces transactional concurrency protection against double booking.
4. **Clinical Governance & Audit Trail:** Immutable logging of actor, role, entity, action, and JSON metadata.
5. **Doctor & Room Roster Management:** Register and toggle doctors, schedules, and clinic suites.

---

## 3. Quick Start & Installation

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher

### Step-by-Step Setup

1. **Clone or navigate to the repository:**
   ```bash
   cd c:\Users\aravi\OneDrive\Desktop\doctor
   ```

2. **Install all dependencies across client and server:**
   ```bash
   npm install
   ```

3. **Generate Prisma Client and Push Database Schema:**
   ```bash
   npm run prisma:generate --workspace=server
   npm run prisma:push --workspace=server
   ```

4. **Seed the Database with realistic clinical data:**
   ```bash
   npm run seed
   ```

5. **Start Both Backend and Frontend Concurrently:**
   ```bash
   npm run dev
   ```
   - Frontend application: **`http://localhost:3000`**
   - Backend REST API: **`http://localhost:5000`** (Health check: `/api/health`)

---

## 4. Demo Accounts & Sample Records

The application includes clearly labeled sample data for immediate evaluation:

### Staff Portal Credentials
- **Admin Access:** `admin@aurahealth.demo` / `AdminPassword123!` (Role: `ADMIN`)
- **Triage Staff Access:** `staff@aurahealth.demo` / `StaffPassword123!` (Role: `STAFF`)
- *A 1-click quick-fill button is available directly on the Staff Sign In modal.*

### Sample Patient Reference Records for Status Verification
- **Pending Review Record:**
  - Reference: `REQ-2026-A1B2-C3D4`
  - Contact Verification: `sophia.montgomery@example.com` or `+1 (555) 349-8812`
- **Confirmed Record:**
  - Reference: `REQ-2026-CONF-9821`
  - Contact Verification: `david.vance@example.com` or `+1 (555) 782-9900`
- **Rejected Record:**
  - Reference: `REQ-2026-REJ-4411`
  - Contact Verification: `j.davis@example.com` or `+1 (555) 231-7788`

---

## 5. Automated Testing

Automated integration tests verify both backend API concurrency/validation and frontend UI components:

```bash
# Run all tests across server and client:
npm run test

# Or run separately:
npm run test:server
npm run test:client
```

### Verified Test Suites:
- `server/tests/api.test.ts`: Health check, active specialties, doctor availability calculation, request creation strictly initialized to `PENDING_REVIEW`, status lookup requiring phone/email verification, DB-derived metrics, and transactional double-booking prevention.
- `client/src/tests/booking.test.tsx`: WebGL fallback accessibility rendering and booking success modal reference display.

---

## 6. Production Build & Deployment

To compile and bundle both backend and frontend for production:

```bash
npm run build
```

- **Backend:** Emitted to `server/dist/` via `tsc`.
- **Frontend:** Emitted to `client/dist/` via `vite build` (minified HTML, CSS, JS assets).

### Switching to PostgreSQL in Production
To use PostgreSQL instead of SQLite in production:
1. Update `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL="postgresql://user:password@hostname:5432/aurahealth?schema=public"` in `server/.env`.
3. Run `npx prisma migrate deploy --schema=prisma/schema.prisma`.

---

## 7. Known Limitations & Extensibility

- **External Communication Gateways:** In demo mode, email and SMS notifications log safely to the application console via `NotificationService`. To dispatch real SMS/emails, supply `EMAIL_PROVIDER_API_KEY` (e.g. Resend, SendGrid) and `SMS_PROVIDER_API_KEY` (e.g. Twilio) in `server/.env`.
- **Teleconsultation Video Engine:** The "Teleconsultation" option records the patient's visit mode; integration with WebRTC or a video provider (e.g. Daily.co, Agora, Zoom SDK) can be hooked up to the generated appointment ID.
