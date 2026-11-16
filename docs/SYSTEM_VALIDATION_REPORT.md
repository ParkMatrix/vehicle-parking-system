# Vehicle Parking System (VPS) — System Validation Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: System Validation Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026 (Execution Window: 2nd Nov – 6th Nov 2026); updated 16th November 2026  
**Status:** **All 29 requirements verified (VPS-NF-002 partially, see section 1)**  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) — QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) — Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) — Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) — Security Tester, Developer, Test Engineer

---

## 1. Executive Summary

This System Validation Report provides formal verification and acceptance evidence for the Vehicle Parking System (VPS). Validation was conducted between 2nd November and 6th November 2026 in accordance with the Software Test Plan (STP v1.0 / v3.0) and baselined Software Requirements Specification (SRS v1.0).

All **29 baselined requirements** (18 Functional, 6 Non-Functional, 5 Security) were implemented and verified using the automated suite (13 suites, 148 tests, all passing), the performance script (VPS-NF-001), and manual checks through the UI recorded in the Sprint 1 and Sprint 2 demo videos (slot management, vehicle entry/exit, owner view of VPS-F-012, browser part of VPS-NF-005). VPS-NF-002 (99.5% monthly availability) is partially verified, because a full month cannot be measured inside the test window.

---

## 2. Requirements Traceability & Validation Matrix (RTM)

| Req ID | Priority | Summary / Feature | Test ID | Test / evidence | Outcome |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `VPS-F-001` | High | User registration (Owner) | `TC-F-001` | Jest/Supertest (`auth.test.js`) | **PASS** |
| `VPS-F-002` | High | User login (JWT generation) | `TC-F-002` | Jest/Supertest (`auth.test.js`) | **PASS** |
| `VPS-F-003` | High | Register vehicle (unique plate) | `TC-F-003` | Jest/Supertest (`vehicle.test.js`) | **PASS** |
| `VPS-F-004` | Medium | View/update permitted vehicles | `TC-F-004` | Jest/Supertest (`vehicle.test.js`), horizontal access checks | **PASS** |
| `VPS-F-005` | High | Admin creates parking slot | `TC-F-005` | `rbac-matrix.test.js` (Admin only); manual (demo) | **PASS** |
| `VPS-F-006` | High | Admin updates slot status | `TC-F-006` | `audit.test.js`, `rbac-matrix.test.js`; manual (demo) | **PASS** |
| `VPS-F-007` | High | Slot status grid view | `TC-F-007` | `rbac-matrix.test.js` (all roles); manual (demo) | **PASS** |
| `VPS-F-008` | High | Available-slot picker on entry | `TC-F-008` | Manual (entry page, demo) | **PASS** |
| `VPS-F-009` | High | Record vehicle entry (session) | `TC-F-009` | `rbac-matrix.test.js` (Staff/Admin only); manual (demo) | **PASS** |
| `VPS-F-010` | High | Mark slot occupied on entry | `TC-F-010` | Manual (demo); `slot-session-consistency.test.js` | **PASS** |
| `VPS-F-011` | High | Search active parked vehicle | `TC-F-011` | Jest/Supertest (`parking-active.test.js`) | **PASS** |
| `VPS-F-012` | High | Show current slot of vehicle | `TC-F-012` | `parking-active.test.js`; owner view manual (demo) | **PASS** |
| `VPS-F-013` | High | Record vehicle exit | `TC-F-013` | `rbac-matrix.test.js` (Staff/Admin only); manual (demo) | **PASS** |
| `VPS-F-014` | High | Free slot on exit (available) | `TC-F-014` | Manual (demo); `slot-session-consistency.test.js` | **PASS** |
| `VPS-F-015` | Medium | View own parking history | `TC-F-015` | Jest/Supertest (`vehicle.test.js`) | **PASS** |
| `VPS-F-016` | Medium | Admin occupancy dashboard | `TC-F-016` | Jest/Supertest (`occupancy.test.js`) | **PASS** |
| `VPS-F-017` | High | Audit log sensitive events | `TC-F-017` | Jest/Supertest (`audit.test.js`) | **PASS** |
| `VPS-F-018` | High | Single active session per car | `TC-F-018` | `parking-session.test.js` (unique index); manual (demo) | **PASS** |
| `VPS-NF-001` | High | P95 response time <= 2s | `TC-N-001` | `scripts/performance-test.js` (200 requests, manual run) | **PASS** |
| `VPS-NF-002` | High | Monthly availability >= 99.5% | `TC-N-002` | `health.test.js`, `uptime-monitor.test.js` (partial: monthly figure needs production monitoring) | **PASS** |
| `VPS-NF-003` | High | RBAC verification (50 routes) | `TC-N-003` | `rbac-matrix.test.js` (50 cases) | **PASS** |
| `VPS-NF-004` | High | Slot-session consistency | `TC-N-004` | `slot-session-consistency.test.js` + checker script | **PASS** |
| `VPS-NF-005` | Medium | Browser compat & JSON errors | `TC-N-005` | `error-messages.test.js`; manual browser check | **PASS** |
| `VPS-NF-006` | Medium | Audit retention >= 1 year | `TC-N-006` | `audit.test.js` (TTL 365 days, back-dated records) | **PASS** |
| `VPS-SR-001` | High | Authentication on protected APIs | `TC-S-001` | `auth-rbac.test.js`, `rbac-matrix.test.js` | **PASS** |
| `VPS-SR-002` | High | RBAC authorization checks | `TC-S-002` | `rbac-matrix.test.js`, `auth-rbac.test.js` | **PASS** |
| `VPS-SR-003` | High | HTTPS/TLS; no plain credentials | `TC-S-003` | `https.test.js` | **PASS** |
| `VPS-SR-004` | High | Bcrypt password hashing (salted) | `TC-S-004` | `auth.test.js` | **PASS** |
| `VPS-SR-005` | High | Audit sanitizer (no secrets) | `TC-S-005` | `audit.test.js` | **PASS** |

---

## 3. End-to-End System Scenarios Validated

### Scenario 1: New Vehicle Owner Registration & Fleet Onboarding
1. User submits registration data to `POST /api/auth/register`. Account created; password stored as bcrypt hash.
2. User authenticates via `POST /api/auth/login`. Receives signed JWT token with role `owner`.
3. User adds vehicles via `POST /api/vehicles`. Format validated; duplicate registrations rejected with HTTP 409.
4. User queries own vehicles via `GET /api/vehicles`. Only user's own fleet is returned.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 2: Admin Slot Provisioning & Operational Control
1. Administrator accesses `POST /api/slots` with Admin JWT. Creates slots with unique slot IDs (e.g. A1).
2. Administrator updates slot status to `Unavailable` via `PATCH /api/slots/:id/status`; a slot used by an active session cannot be changed (409).
3. Grid query `GET /api/slots` immediately reflects the updated operational status.
4. Owner/Staff tokens attempting slot creation receive HTTP 403 Forbidden.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 3: Parking Entry & Atomic Slot Allocation
1. Staff member requests available slots via `GET /api/slots?status=Available`.
2. Staff submits vehicle entry (registration number + slot) via `POST /api/parking/entry`.
3. Slot is reserved Available → Occupied with a conditional update and an active session is created; if the session cannot be saved, the slot is released again.
4. Subsequent entry attempt for the same vehicle is rejected with HTTP 409 (Single Active Session Constraint).
- **Outcome:** **VERIFIED (PASS)**

### Scenario 4: Live Search & Slot Tracking
1. Staff or Admin queries `GET /api/parking/active/:registration`.
2. System returns the active session and the allocated slot.
3. Querying a non-parked vehicle returns HTTP 404 with structured error message.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 5: Vehicle Checkout & Slot Release
1. Staff member posts exit record to `POST /api/parking/exit`.
2. Exit time recorded and session status set to `complete` (payment is out of scope, SRS 1.2).
3. Slot status updated back to `Available` with a conditional update.
4. `GET /api/slots?status=Available` lists the freed slot for new vehicles.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 6: Role Security & Audit Trail Integrity
1. Owner attempts `GET /api/admin/audit` and `GET /api/admin/occupancy`. System rejects with HTTP 403 Forbidden.
2. Admin queries audit logs. Sensitive fields (`password`, `token`, `authorization`) are confirmed redacted as `[REDACTED]`.
3. Plain HTTP requests in production redirect to HTTPS with HSTS headers.
- **Outcome:** **VERIFIED (PASS)**

---

## 4. Performance & Quality Attribute Verification

### 4.1 Performance Benchmark (VPS-NF-001)
- **Workload:** 200 HTTP requests, concurrency of 10.
- **Endpoint:** `GET /api/slots`
- **Average Latency:** 37.86 ms
- **P95 Latency:** **65.15 ms** (SLA Target: ≤ 2000 ms)
- **Throughput:** 259.79 requests / second
- **Error Rate:** 0.0% (200 / 200 successful)
- **Verdict:** **PASSED (Exceeds SLA by 96.7%)**

### 4.2 Availability & Health Monitoring (VPS-NF-002)
- Heartbeat endpoint `GET /api/health` returns status code 200, system uptime, and DB status.
- Uptime monitor script computes availability from health checks; the ≥ 99.5% monthly target needs production monitoring over a full month (see `documents/AVAILABILITY.md`).

### 4.3 Browser Compatibility & Error Standardization (VPS-NF-005)
- Standardized error handling middleware enforces `{ error: message }` payload format.
- Zero server stack traces leaked to client.
- UI checked manually in Chrome, Edge and Firefox (`documents/BROWSER_COMPATIBILITY.md`).

---

## 5. System Acceptance Sign-Off

The Vehicle Parking System (v1.0) meets the functional, non-functional and security requirements of SRS v1.0, with VPS-NF-002 partially verified. Differences between the implementation and the SRS/SAD are listed in `documents/DEVIATIONS.md`.
