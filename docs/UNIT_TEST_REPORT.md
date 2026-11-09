# Vehicle Parking System (VPS) â€” Unit Test Execution Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Unit Test Execution Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026 (Execution Window: 2nd Nov â€“ 6th Nov 2026)  
**Status:** **100% PASSED (142 of 142 Tests Passing, 0 Failures)**  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) â€” QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) â€” Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) â€” Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) â€” Security Tester, Developer, Test Engineer

---

## 1. Executive Summary

This report documents the execution of the automated unit test suite for the Vehicle Parking System (VPS). The test suite comprises **12 distinct test suites** and **142 test cases**, executed via Jest v30.5.2 with Supertest in an isolated in-memory test environment.

### Summary Metrics
| Metric | Value | Compliance Status |
| :--- | :---: | :--- |
| **Total Test Suites** | **12** | 12 Passed, 0 Failed, 0 Skipped |
| **Total Test Cases** | **142** | 142 Passed, 0 Failed (100% Pass Rate) |
| **Execution Duration** | **11.06 s** | Meets < 60s CI performance target |
| **Snapshot Tests** | **0** | No UI snapshot drift |
| **Failures / Errors** | **0** | Zero critical or high-severity defects |
| **Exit Quality Gate** | **PASSED** | 100% Criteria Met for Production Release |

---

## 2. Test Suite Breakdown

| # | Test Suite | Target Requirements | Tests | Duration | Result |
| :-: | :--- | :--- | :-: | :-: | :-: |
| 1 | `audit.test.js` | VPS-F-017, VPS-SR-005, VPS-NF-006 | 15 | 2.95s | **PASS** |
| 2 | `auth.test.js` | VPS-F-001, VPS-F-002, VPS-SR-004 | 12 | 1.60s | **PASS** |
| 3 | `rbac-matrix.test.js` | VPS-SR-001, VPS-SR-002, VPS-NF-003 | 50 | 0.92s | **PASS** |
| 4 | `https.test.js` | VPS-SR-003 | 7 | 0.49s | **PASS** |
| 5 | `vehicle.test.js` | VPS-F-003, VPS-F-004 | 21 | 0.81s | **PASS** |
| 6 | `occupancy.test.js` | VPS-F-005, VPS-F-006, VPS-F-007, VPS-F-016 | 5 | 0.60s | **PASS** |
| 7 | `health.test.js` | VPS-NF-002 | 4 | 0.65s | **PASS** |
| 8 | `auth-rbac.test.js` | VPS-SR-001, VPS-SR-002 | 7 | 0.72s | **PASS** |
| 9 | `error-messages.test.js` | VPS-NF-005 | 6 | 0.57s | **PASS** |
| 10 | `parking-active.test.js` | VPS-F-011, VPS-F-012, VPS-F-018 | 5 | 0.78s | **PASS** |
| 11 | `parking-session.test.js` | VPS-F-009, VPS-F-010, VPS-F-013, VPS-F-014 | 3 | 0.44s | **PASS** |
| 12 | `uptime-monitor.test.js` | VPS-NF-002 | 7 | 0.12s | **PASS** |

---

## 3. Detailed Results by Module

### 3.1 Authentication & User Management (`tests/auth.test.js`)
- **Requirements Covered:** `VPS-F-001`, `VPS-F-002`, `VPS-SR-004` (TC-F-001, TC-F-002, TC-S-004)
- **Tests Executed:** 12 | **Status:** PASSED (1.60s)
- **Key Assertions:**
  - Owner account successfully registered with bcrypt hashed password.
  - Password and passwordHash are omitted from registration and login responses.
  - Duplicate email registration is rejected with HTTP 409 Conflict.
  - Invalid registration payloads (missing email, invalid phone format) return HTTP 400.
  - Valid login returns signed JWT containing userId and role.
  - Invalid credentials return HTTP 401 with generic error (no account enumeration).

### 3.2 RBAC Authorization & 50-Route Matrix (`tests/rbac-matrix.test.js` & `tests/auth-rbac.test.js`)
- **Requirements Covered:** `VPS-SR-001`, `VPS-SR-002`, `VPS-NF-003` (TC-S-001, TC-S-002, TC-N-003)
- **Tests Executed:** 57 | **Status:** PASSED (1.64s)
- **Key Assertions:**
  - Complete matrix testing of 10 API route families across Owner, Staff, and Admin roles.
  - Unauthenticated requests to protected endpoints return HTTP 401 Unauthorized.
  - Unauthorized roles attempting admin-only routes return HTTP 403 Forbidden.
  - Malformed and expired tokens are rejected safely without server crashes.

### 3.3 Vehicle Fleet Management (`tests/vehicle.test.js`)
- **Requirements Covered:** `VPS-F-003`, `VPS-F-004` (TC-F-003, TC-F-004)
- **Tests Executed:** 21 | **Status:** PASSED (0.81s)
- **Key Assertions:**
  - Vehicle registration validates plate numbers against standard regex.
  - Duplicate registration numbers within active fleet are prevented (HTTP 409).
  - Horizontal Privilege Access Control: User A cannot update or delete User B's vehicle (HTTP 403/404).

### 3.4 Parking Slots & Occupancy (`tests/occupancy.test.js`)
- **Requirements Covered:** `VPS-F-005`, `VPS-F-006`, `VPS-F-007`, `VPS-F-016` (TC-F-005, TC-F-006, TC-F-007, TC-F-016)
- **Tests Executed:** 5 | **Status:** PASSED (0.60s)
- **Key Assertions:**
  - Admin creates slots with unique slot identifiers.
  - Slot status transitions between available, occupied, and maintenance.
  - Live occupancy dashboard calculates accurate real-time percentages and totals.

### 3.5 Parking Sessions & Active Tracking (`tests/parking-active.test.js` & `tests/parking-session.test.js`)
- **Requirements Covered:** `VPS-F-008`, `VPS-F-009`, `VPS-F-010`, `VPS-F-011`, `VPS-F-012`, `VPS-F-013`, `VPS-F-014`, `VPS-F-018`
- **Tests Executed:** 8 | **Status:** PASSED (1.22s)
- **Key Assertions:**
  - Vehicle entry allocates an available slot and transitions slot status to occupied.
  - Compound uniqueness constraint: Prevents multiple active sessions for the same vehicle (HTTP 409).
  - Search active vehicle returns allocated slot number and floor.
  - Exit recording calculates duration, archives session as completed, and atomically frees the slot.

### 3.6 Security Audit Trail & Sanitization (`tests/audit.test.js`)
- **Requirements Covered:** `VPS-F-017`, `VPS-SR-005`, `VPS-NF-006` (TC-F-017, TC-S-005, TC-N-006)
- **Tests Executed:** 15 | **Status:** PASSED (2.95s)
- **Key Assertions:**
  - Sensitive operations (login failures, slot modifications, user role adjustments) emit audit logs.
  - Sensitive fields (`password`, `token`, `authorization`) are redacted with `[REDACTED]` prior to persistence.
  - 1-year data retention queries and TTL indexing verified.

### 3.7 HTTPS Transport & Error Formatting (`tests/https.test.js` & `tests/error-messages.test.js`)
- **Requirements Covered:** `VPS-SR-003`, `VPS-NF-005` (TC-S-003, TC-N-005)
- **Tests Executed:** 13 | **Status:** PASSED (1.06s)
- **Key Assertions:**
  - HTTP requests in production redirect with HTTP 301 to HTTPS.
  - Strict-Transport-Security (HSTS) headers applied to all secure responses.
  - Error middleware returns uniform `{{ error: message }}` responses with zero stack-trace leaks.

### 3.8 Availability & Uptime Monitor (`tests/health.test.js` & `tests/uptime-monitor.test.js`)
- **Requirements Covered:** `VPS-NF-002` (TC-N-002)
- **Tests Executed:** 11 | **Status:** PASSED (0.77s)
- **Key Assertions:**
  - `/api/health` returns heartbeat status and uptime in milliseconds.
  - Uptime monitor periodically polls health endpoint and tracks SLA availability.

---

## 4. Test Conclusion

The unit test run achieved a **100% pass rate** across all 142 assertions. The application exhibits high reliability, strict authorization controls, and deterministic state transitions.
