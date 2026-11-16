# Vehicle Parking System (VPS) — Unit Test Execution Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Unit Test Execution Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026; numbers re-checked on `main` on 16th November 2026  
**Status:** **148 of 148 tests passing, 0 failures**  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) — QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) — Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) — Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) — Security Tester, Developer, Test Engineer

---

## 1. Summary

The automated backend test suite was run with Jest 30.5.2 and Supertest. Models are mocked, so the tests run without a database.

| Metric | Value |
| :--- | :---: |
| Test suites | **13** (13 passed, 0 failed) |
| Test cases | **148** (148 passed, 0 failed, 0 skipped) |
| Run time (`npm test`, `--runInBand`) | about 5 s |
| Snapshot tests | 0 |

Correction: the first version of this report listed 12 suites and 142 tests; a run of `main` gives 13 suites and 148 tests (`slot-session-consistency.test.js`, 6 tests, was missing from the list).

## 2. Test suite breakdown

| # | Test suite | Requirements | Tests | Result |
| :-: | :--- | :--- | :-: | :-: |
| 1 | `audit.test.js` | VPS-F-017, VPS-SR-005, VPS-NF-006 (incl. slot status change) | 15 | PASS |
| 2 | `auth-rbac.test.js` | VPS-SR-001, VPS-SR-002 | 7 | PASS |
| 3 | `auth.test.js` | VPS-F-001, VPS-F-002, VPS-SR-004 | 12 | PASS |
| 4 | `error-messages.test.js` | VPS-NF-005 | 6 | PASS |
| 5 | `health.test.js` | VPS-NF-002 | 4 | PASS |
| 6 | `https.test.js` | VPS-SR-003 | 7 | PASS |
| 7 | `occupancy.test.js` | VPS-F-016 | 5 | PASS |
| 8 | `parking-active.test.js` | VPS-F-011, VPS-F-012 | 5 | PASS |
| 9 | `parking-session.test.js` | VPS-F-018 | 3 | PASS |
| 10 | `rbac-matrix.test.js` | VPS-NF-003, VPS-SR-001, VPS-SR-002 (incl. slot and entry/exit routes) | 50 | PASS |
| 11 | `slot-session-consistency.test.js` | VPS-NF-004 | 6 | PASS |
| 12 | `uptime-monitor.test.js` | VPS-NF-002 | 7 | PASS |
| 13 | `vehicle.test.js` | VPS-F-003, VPS-F-004, VPS-F-015 | 21 | PASS |
| | **Total** | | **148** | **PASS** |

## 3. Results by module

### 3.1 Authentication (`auth.test.js`, 12 tests)
- Owner registration stores a bcrypt hash; `password` / `passwordHash` never returned.
- Duplicate email → 409; missing or invalid fields → 400.
- Valid login → 200 with a JWT carrying `userId` and `role`; wrong password and unknown email → 401 with the same message.

### 3.2 Access control (`rbac-matrix.test.js` 50 tests, `auth-rbac.test.js` 7 tests)
- Every protected route checked for Owner, Staff and Admin: allowed roles pass, other roles get 403.
- Missing, malformed and expired tokens → 401.

### 3.3 Vehicles (`vehicle.test.js`, 21 tests)
- Register vehicle (201), duplicate registration (409), invalid format (400).
- Owners can only list, update and see history of their own vehicles; another owner's vehicle → 403/404.

### 3.4 Parking slots and vehicle entry / exit
- Slot create / status update / list and vehicle entry / exit are exercised through `rbac-matrix.test.js` (access rules for every role) and `audit.test.js` (slot status change is audited).
- The full entry and exit flow (slot Available → Occupied → Available, one active session per vehicle, error messages) was verified manually through the UI and shown in the Sprint 1 and Sprint 2 demo videos (`demo/`).

### 3.5 Active vehicle search and single session (`parking-active.test.js` 5, `parking-session.test.js` 3)
- `GET /api/parking/active/:registration` returns the session and current slot; unknown or not-parked vehicle → 404; Owner → 403.
- Unique partial index allows only one active session per vehicle.

### 3.6 Occupancy and consistency (`occupancy.test.js` 5, `slot-session-consistency.test.js` 6)
- `GET /api/admin/occupancy` returns slot counts, occupancy rate and active vehicles; handles an empty car park; non-admin blocked.
- Consistency checker detects occupied slots without a session, sessions on non-occupied or missing slots, and duplicate active sessions.

### 3.7 Audit (`audit.test.js`, 15 tests)
- Login success/failure and admin slot status changes are recorded; only Admin can read `/api/admin/audit`.
- Passwords, hashes, tokens and secrets are redacted, including nested fields.
- 365-day TTL index; 11-month-old records still retrievable; date filter and paging work.

### 3.8 HTTPS, errors, availability (`https.test.js` 7, `error-messages.test.js` 6, `health.test.js` 4, `uptime-monitor.test.js` 7)
- Production: HTTP → 301 to HTTPS, credentials over HTTP → 403, HSTS behind a trusted proxy; spoofed `X-Forwarded-Proto` ignored.
- Errors are `{ "error": message }` with no stack traces (400 / 409 / 500 cases).
- `/api/health` → 200 when the database is connected, 503 when it is down; the uptime monitor computes availability from these checks.

## 4. Conclusion

All 148 tests pass. Requirements without a dedicated automated test (slot management details, entry/exit flow, owner view of VPS-F-012, browser part of VPS-NF-005) were verified manually and in the demo videos; see the System Validation Report.

## How to reproduce

```
cd server
npm ci
npm test                      # 13 suites, 148 tests
npx jest --runInBand --coverage
```
Tests mock the Mongoose models, so no MongoDB instance is needed. The same `npm test` runs in GitHub Actions (`.github/workflows/ci.yml`) on every pull request.
