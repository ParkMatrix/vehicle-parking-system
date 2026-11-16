# Vehicle Parking System (VPS) — Branch Coverage Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Branch Coverage Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026; numbers re-checked on `main` on 16th November 2026  
**Tool:** Jest 30.5.2 with the built-in Istanbul coverage (`npx jest --coverage`)  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) — QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) — Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) — Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) — Security Tester, Developer, Test Engineer

---

## 1. Summary

| Metric | Covered / Total | Coverage | Target |
| :--- | :---: | :---: | :---: |
| Branches (backend) | 265/393 | **67.43%** | ≥ 60% |

Correction: the first version of this report gave 245/369 = 66.39%; the numbers above are a fresh run of `main`.

## 2. Branches per file

| File | Covered / Total | % Branch | Notes |
| :--- | :---: | :---: | :--- |
| `scripts/check-slot-session-consistency.js` | 19/24 | 79.16% |  |
| `scripts/uptime-monitor.js` | 18/37 | 48.64% | Command-line part run manually |
| `src/app.js` | 4/6 | 66.66% |  |
| `src/controllers/slot.controller.js` | 11/24 | 45.83% | Validation errors not unit tested |
| `src/createServer.js` | 8/15 | 53.33% | Production certificate branch |
| `src/middleware/auth.js` | 5/6 | 83.33% |  |
| `src/middleware/errorHandler.js` | 28/43 | 65.11% | Fallbacks for unusual error shapes |
| `src/middleware/https.js` | 11/11 | 100% | All security decisions covered |
| `src/middleware/rbac.js` | 4/4 | 100% | All role decisions covered |
| `src/models/AuditLog.js` | 18/23 | 78.26% |  |
| `src/routes/health.routes.js` | 5/6 | 83.33% |  |
| `src/routes/parking.routes.js` | 9/26 | 34.61% | Entry/exit handlers only reached by access-control tests |
| `src/services/audit.service.js` | 47/65 | 72.3% |  |
| `src/services/auth.service.js` | 26/31 | 83.87% |  |
| `src/services/occupancy.service.js` | 7/11 | 63.63% |  |
| `src/services/vehicle.service.js` | 45/61 | 73.77% |  |
| **All files** | **265/393** | **67.43%** | |

Files with no branches (models, `auth.controller.js`, `vehicle.controller.js`, `admin.routes.js`, `auth.routes.js`, `occupancy.routes.js`, `slot.routes.js`, `vehicle.routes.js`) are left out of the table.

## 3. Key decision points tested

### 3.1 HTTPS (`https.js`, 11/11)
- Development → plain HTTP allowed.
- Production, plain HTTP page request → 301 redirect to `https://`.
- Production, credentials over plain HTTP → 403, no token issued.
- Behind a trusted proxy with `X-Forwarded-Proto: https` → allowed, HSTS header sent.
- Spoofed `X-Forwarded-Proto` with no trusted proxy → ignored.

### 3.2 Role check (`rbac.js`, 4/4)
- Role allowed → request continues.
- Role not allowed → 403.

### 3.3 Active vehicle search (`parking.routes.js`)
- Vehicle not found → 404.
- No active session → 404.
- Staff/Admin → session and slot returned; Owner → 403.

### 3.4 Slot status update (`slot.controller.js`)
- Admin changes status → saved and written to the audit log.
- Non-admin → 403 (role check).

### 3.5 Login (`auth.service.js`, 26/31)
- Email already registered → 409.
- User not found or wrong password → 401 with the same message.
- Valid credentials → JWT issued, user returned without the password hash.

### 3.6 Audit redaction (`AuditLog.js` 18/23, `audit.service.js` 47/65)
- Key is sensitive (`password`, `passwordHash`, `token`, `secret`, `authorization`) → `[REDACTED]`.
- Nested object → checked recursively.
- Other values → stored unchanged.

## How to reproduce

```
cd server
npm ci
npm test                      # 13 suites, 148 tests
npx jest --runInBand --coverage
```
Tests mock the Mongoose models, so no MongoDB instance is needed. The same `npm test` runs in GitHub Actions (`.github/workflows/ci.yml`) on every pull request.
