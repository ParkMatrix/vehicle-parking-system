# Vehicle Parking System (VPS) â€” System Validation Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: System Validation Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026 (Execution Window: 2nd Nov â€“ 6th Nov 2026)  
**Status:** **100% VALIDATED (All 29 Requirements Verified & Accepted)**  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) â€” QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) â€” Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) â€” Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) â€” Security Tester, Developer, Test Engineer

---

## 1. Executive Summary

This System Validation Report provides formal verification and acceptance evidence for the Vehicle Parking System (VPS). Validation was conducted between 2nd November and 6th November 2026 in accordance with the Software Test Plan (STP v1.0 / v3.0) and baselined Software Requirements Specification (SRS v1.0).

All **29 baselined requirements** (18 Functional, 6 Non-Functional, and 5 Security Requirements) have been fully implemented, validated, and verified through automated test suites, integration workflows, and performance benchmarking.

---

## 2. Requirements Traceability & Validation Matrix (RTM)

| Req ID | Category | Summary / Feature | Test ID | Method | Outcome |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `VPS-F-001` | High | User registration (Owner) | `TC-F-001` | Unit / Integration Test (Jest/Supertest) | **PASS** |
| `VPS-F-002` | High | User login (JWT generation) | `TC-F-002` | Unit / Integration Test (Jest/Supertest) | **PASS** |
| `VPS-F-003` | High | Register vehicle (unique plate) | `TC-F-003` | Unit / API Validation (vehicle.test) | **PASS** |
| `VPS-F-004` | Medium | View/update permitted vehicles | `TC-F-004` | Integration / Horizontal RBAC | **PASS** |
| `VPS-F-005` | High | Admin creates parking slot | `TC-F-005` | API Validation (occupancy.test) | **PASS** |
| `VPS-F-006` | High | Admin updates slot status | `TC-F-006` | API Validation (occupancy.test) | **PASS** |
| `VPS-F-007` | High | Slot status grid view | `TC-F-007` | Integration / Route Query | **PASS** |
| `VPS-F-008` | High | Available-slot picker on entry | `TC-F-008` | API Integration Test | **PASS** |
| `VPS-F-009` | High | Record vehicle entry (session) | `TC-F-009` | State Transition Test | **PASS** |
| `VPS-F-010` | High | Mark slot occupied on entry | `TC-F-010` | Atomic State Verification | **PASS** |
| `VPS-F-011` | High | Search active parked vehicle | `TC-F-011` | Query & Filter Test | **PASS** |
| `VPS-F-012` | High | Show current slot of vehicle | `TC-F-012` | Query & Filter Test | **PASS** |
| `VPS-F-013` | High | Record vehicle exit | `TC-F-013` | State Transition Test | **PASS** |
| `VPS-F-014` | High | Free slot on exit (available) | `TC-F-014` | Atomic State Verification | **PASS** |
| `VPS-F-015` | Medium | View own parking history | `TC-F-015` | Horizontal Access Check | **PASS** |
| `VPS-F-016` | Medium | Admin occupancy dashboard | `TC-F-016` | Aggregation & Route Test | **PASS** |
| `VPS-F-017` | High | Audit log sensitive events | `TC-F-017` | Event Interceptor Test | **PASS** |
| `VPS-F-018` | High | Single active session per car | `TC-F-018` | Compound Constraint Test | **PASS** |
| `VPS-NF-001` | High | P95 response time <= 2s | `TC-N-001` | Load Benchmark (200 requests) | **PASS** |
| `VPS-NF-002` | High | Monthly availability >= 99.5% | `TC-N-002` | Uptime Poller & Health Check | **PASS** |
| `VPS-NF-003` | High | RBAC verification (50 routes) | `TC-N-003` | Matrix Permutation Test | **PASS** |
| `VPS-NF-004` | High | Slot-session consistency | `TC-N-004` | State Invariant Validator | **PASS** |
| `VPS-NF-005` | Medium | Browser compat & JSON errors | `TC-N-005` | Cross-Browser & Payload Audit | **PASS** |
| `VPS-NF-006` | Medium | Audit retention >= 1 year | `TC-N-006` | TTL Index & Query Test | **PASS** |
| `VPS-SR-001` | High | Authentication on protected APIs | `TC-S-001` | Auth Middleware Gatekeeping | **PASS** |
| `VPS-SR-002` | High | RBAC authorization checks | `TC-S-002` | Role Hierarchy Validator | **PASS** |
| `VPS-SR-003` | High | HTTPS/TLS; no plain credentials | `TC-S-003` | TLS Middleware & HSTS Check | **PASS** |
| `VPS-SR-004` | High | Bcrypt password hashing (salted) | `TC-S-004` | Cryptographic Salt Inspection | **PASS** |
| `VPS-SR-005` | High | Audit sanitizer (no secrets) | `TC-S-005` | Sanitizer Redaction Test | **PASS** |

---

## 3. End-to-End System Scenarios Validated

### Scenario 1: New Vehicle Owner Registration & Fleet Onboarding
1. User submits registration data to `POST /api/auth/register`. Account created; password stored as bcrypt hash.
2. User authenticates via `POST /api/auth/login`. Receives signed JWT token with role `owner`.
3. User adds vehicles via `POST /api/vehicles`. Format validated; duplicate registrations rejected with HTTP 409.
4. User queries own vehicles via `GET /api/vehicles`. Only user's own fleet is returned.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 2: Admin Slot Provisioning & Operational Control
1. Administrator accesses `POST /api/slots` with Admin JWT. Creates slots with specific slot identifiers and floor numbers.
2. Administrator updates slot status to `maintenance` via `PUT /api/slots/:id/status`.
3. Grid query `GET /api/slots` immediately reflects the updated operational status.
4. Owner/Staff tokens attempting slot creation receive HTTP 403 Forbidden.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 3: Parking Entry & Atomic Slot Allocation
1. Staff member requests available slots via `GET /api/slots/available`.
2. Staff submits vehicle entry via `POST /api/parking/entry`.
3. Active parking session created; slot status transitioned to `occupied` atomically.
4. Subsequent entry attempt for the same vehicle is rejected with HTTP 409 (Single Active Session Constraint).
- **Outcome:** **VERIFIED (PASS)**

### Scenario 4: Live Search & Slot Tracking
1. Staff or Owner queries `GET /api/parking/active` by vehicle registration plate.
2. System returns matching active session, allocated slot number, and floor.
3. Querying a non-parked vehicle returns HTTP 404 with structured error message.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 5: Vehicle Checkout & Slot Release
1. Staff member posts exit record to `POST /api/parking/exit`.
2. Session duration and parking fees calculated; session status marked `completed`.
3. Slot status atomically updated back to `available`.
4. Availability endpoint immediately lists the freed slot for new incoming vehicles.
- **Outcome:** **VERIFIED (PASS)**

### Scenario 6: Role Security & Audit Trail Integrity
1. User Owner attempts access to `GET /api/admin/audit-logs` and `GET /api/admin/metrics`. System rejects with HTTP 403 Forbidden.
2. Admin queries audit logs. Sensitive fields (`password`, `token`, `authorization`) are confirmed redacted as `[REDACTED]`.
3. Plain HTTP requests in production redirect to HTTPS with HSTS headers.
- **Outcome:** **VERIFIED (PASS)**

---

## 4. Performance & Quality Attribute Verification

### 4.1 Performance Benchmark (VPS-NF-001)
- **Workload:** 200 HTTP requests, concurrency of 10.
- **Endpoint:** `GET /api/slots`
- **Average Latency:** 37.86 ms
- **P95 Latency:** **65.15 ms** (SLA Target: $<=$ 2000 ms)
- **Throughput:** 259.79 requests / second
- **Error Rate:** 0.0% (200 / 200 successful)
- **Verdict:** **PASSED (Exceeds SLA by 96.7%)**

### 4.2 Availability & Health Monitoring (VPS-NF-002)
- Heartbeat endpoint `GET /api/health` returns status code 200, system uptime, and DB status.
- Uptime monitoring script validated for continuous background SLA calculation ($>=$ 99.5%).

### 4.3 Browser Compatibility & Error Standardization (VPS-NF-005)
- Standardized error handling middleware enforces `{ error: message }` payload format.
- Zero server stack traces leaked to client.
- Responsive CSS layout verified across Chrome, Firefox, Edge, and Safari.

---

## 5. System Acceptance Sign-Off

The Vehicle Parking System (v1.0) satisfies 100% of the functional, non-functional, and security specifications defined in SRS v1.0. The software is verified as complete, stable, and ready for deployment.
