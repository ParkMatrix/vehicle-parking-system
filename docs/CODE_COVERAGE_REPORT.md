# Vehicle Parking System (VPS) — Code Coverage Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Code Coverage Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026; numbers re-checked on `main` on 16th November 2026  
**Tool:** Jest 30.5.2 with the built-in Istanbul coverage (`npx jest --coverage`)  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) — QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) — Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) — Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) — Security Tester, Developer, Test Engineer

---

## 1. Summary (backend, `server/`)

| Metric | Covered / Total | Coverage | Target | Status |
| :--- | :---: | :---: | :---: | :---: |
| Statements | 474/595 | **79.66%** | ≥ 75% | Met |
| Branches | 265/393 | **67.43%** | ≥ 60% | Met |
| Functions | 61/71 | **85.91%** | ≥ 85% | Met |
| Lines | 450/558 | **80.64%** | ≥ 75% | Met |

Correction: the first version of this report quoted 81.78% lines / 80.76% statements / 89.39% functions / 66.39% branches; the table above is a fresh run of `main`.

The React client (`client/`) is not unit tested; it is covered by lint + build in CI and by manual UI checks (see `documents/BROWSER_COMPATIBILITY.md`).

## 2. Coverage per file

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered lines |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `scripts/check-slot-session-consistency.js` | 65.9% | 79.16% | 40% | 66.66% | 48-68,73-78 |
| `scripts/uptime-monitor.js` | 51.61% | 48.64% | 75% | 52.63% | 66-95,99-101 |
| `src/app.js` | 91.3% | 66.66% | 100% | 100% | 9,14 |
| `src/controllers/auth.controller.js` | 100% | 100% | 100% | 100% | — |
| `src/controllers/slot.controller.js` | 68.88% | 45.83% | 100% | 68.88% | 13-16,20,33,39,46-51,55,67,73,83 |
| `src/controllers/vehicle.controller.js` | 83.33% | 100% | 80% | 83.33% | 26-31 |
| `src/createServer.js` | 76.47% | 53.33% | 50% | 76.47% | 17-19,25 |
| `src/middleware/auth.js` | 92.3% | 83.33% | 100% | 92.3% | 14 |
| `src/middleware/errorHandler.js` | 92.3% | 65.11% | 100% | 91.3% | 9,29 |
| `src/middleware/https.js` | 100% | 100% | 100% | 100% | — |
| `src/middleware/rbac.js` | 100% | 100% | 100% | 100% | — |
| `src/models/AuditLog.js` | 87.87% | 78.26% | 66.66% | 90.32% | 41,72-73 |
| `src/models/ParkingSession.js` | 100% | 100% | 100% | 100% | — |
| `src/models/ParkingSlot.js` | 100% | 100% | 100% | 100% | — |
| `src/models/User.js` | 100% | 100% | 100% | 100% | — |
| `src/models/Vehicle.js` | 100% | 100% | 100% | 100% | — |
| `src/models/index.js` | 100% | 100% | 100% | 100% | — |
| `src/routes/admin.routes.js` | 92.3% | 100% | 100% | 92.3% | 22 |
| `src/routes/auth.routes.js` | 100% | 100% | 100% | 100% | — |
| `src/routes/health.routes.js` | 100% | 83.33% | 100% | 100% | 16 |
| `src/routes/occupancy.routes.js` | 100% | 100% | 100% | 100% | — |
| `src/routes/parking.routes.js` | 53.57% | 34.61% | 100% | 53.57% | 19,55,66,75-120,136,145-171 |
| `src/routes/slot.routes.js` | 100% | 100% | 100% | 100% | — |
| `src/routes/vehicle.routes.js` | 100% | 100% | 100% | 100% | — |
| `src/services/audit.service.js` | 87.03% | 72.3% | 100% | 93.47% | 28,74,84 |
| `src/services/auth.service.js` | 97.05% | 83.87% | 100% | 100% | 22-24,41,51 |
| `src/services/occupancy.service.js` | 100% | 63.63% | 100% | 100% | 17,26-28 |
| `src/services/vehicle.service.js` | 78.57% | 73.77% | 88.88% | 78.43% | 116-143 |
| **All files** | **79.66%** | **67.43%** | **85.91%** | **80.64%** | |

## 3. Notes on uncovered code

- `scripts/uptime-monitor.js`, `scripts/check-slot-session-consistency.js`: the command-line entry parts (connecting to a real server or database, printing, `process.exit`) are not run by unit tests; the calculation functions are tested. Both scripts were run manually against the local setup.
- `src/createServer.js`: the branch that loads a TLS certificate from disk is only used in production.
- `src/services/vehicle.service.js` (lines 116-143): the owner "current slot" lookup is checked manually through the UI, not by a unit test.
- `src/middleware/errorHandler.js`: fallback branches for unusual error shapes.
- `src/routes/parking.routes.js` (53.57% lines): the entry and exit handlers are only reached by the access-control tests, so their success and error paths are not covered by unit tests; the flow was verified manually and in the demo videos.
- `src/controllers/slot.controller.js` (68.88% lines): validation errors (400/404/409) of slot create and update are not unit tested; access rules and the audited status change are.

## How to reproduce

```
cd server
npm ci
npm test                      # 13 suites, 148 tests
npx jest --runInBand --coverage
```
Tests mock the Mongoose models, so no MongoDB instance is needed. The same `npm test` runs in GitHub Actions (`.github/workflows/ci.yml`) on every pull request.
