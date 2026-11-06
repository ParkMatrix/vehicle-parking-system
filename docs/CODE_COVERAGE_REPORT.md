# Vehicle Parking System (VPS) â€” Code Coverage Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Code Coverage Report  
**Organization:** ParkMatrix (Team 5)  
**Date:** 5th November 2026 (Execution Window: 2nd Nov â€“ 6th Nov 2026)  
**Engine:** Jest v30.5.2 & Istanbul Code Coverage Runner  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) â€” QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) â€” Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) â€” Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) â€” Security Tester, Developer, Test Engineer

---

## 1. Executive Summary

This report establishes the automated test code coverage for the backend server of the Vehicle Parking System (VPS).

| Metric | Total | Covered | Coverage Percentage | Target Threshold | Quality Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Lines** | **516** | **422** | **81.78%** | $>=$ 75.0% | **EXCEEDED** |
| **Statements** | **551** | **445** | **80.76%** | $>=$ 75.0% | **EXCEEDED** |
| **Functions** | **66** | **59** | **89.39%** | $>=$ 85.0% | **EXCEEDED** |
| **Branches** | **369** | **245** | **66.39%** | $>=$ 60.0% | **MET** |

---

## 2. Detailed Module Breakdown

| Module / File Path | % Lines | % Stmts | % Funcs | % Branch | Uncovered Info |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `scripts/uptime-monitor.js` | 52.63% | 51.61% | 75% | 45.94% | 27 lines |
| `src/app.js` | 100% | 91.3% | 100% | 66.66% | None (100%) |
| `src/createServer.js` | 76.47% | 76.47% | 50% | 53.33% | 4 lines |
| `src/controllers/auth.controller.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/controllers/slot.controller.js` | 68.88% | 68.88% | 100% | 45.83% | 14 lines |
| `src/controllers/vehicle.controller.js` | 83.33% | 83.33% | 80% | 100% | 2 lines |
| `src/middleware/auth.js` | 92.3% | 92.3% | 100% | 83.33% | 1 lines |
| `src/middleware/errorHandler.js` | 91.3% | 92.3% | 100% | 65.11% | 2 lines |
| `src/middleware/https.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/middleware/rbac.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/models/AuditLog.js` | 90.32% | 87.87% | 66.66% | 78.26% | 3 lines |
| `src/models/ParkingSession.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/models/ParkingSlot.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/models/User.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/models/Vehicle.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/models/index.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/routes/admin.routes.js` | 92.3% | 92.3% | 100% | 100% | 1 lines |
| `src/routes/auth.routes.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/routes/health.routes.js` | 100% | 100% | 100% | 83.33% | None (100%) |
| `src/routes/occupancy.routes.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/routes/parking.routes.js` | 53.57% | 53.57% | 100% | 34.61% | 26 lines |
| `src/routes/slot.routes.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/routes/vehicle.routes.js` | 100% | 100% | 100% | 100% | None (100%) |
| `src/services/audit.service.js` | 93.47% | 87.03% | 100% | 72.3% | 3 lines |
| `src/services/auth.service.js` | 100% | 97.05% | 100% | 83.87% | None (100%) |
| `src/services/occupancy.service.js` | 100% | 100% | 100% | 63.63% | None (100%) |
| `src/services/vehicle.service.js` | 78.43% | 78.57% | 88.88% | 73.77% | 11 lines |

---

## 3. Coverage Analysis by Layer

### 3.1 Security & Middleware Layer
- `middleware/https.js`: **100% Lines**, **100% Branches**, **100% Funcs**. Validates production HTTPS redirection, HSTS headers, plain HTTP credential rejection, and reverse proxy trust.
- `middleware/rbac.js`: **100% Across All Metrics**. Verifies Owner, Staff, and Admin role gating.
- `middleware/auth.js`: **92.3% Lines**, **83.33% Branches**. Verifies JWT presence, format, and signature verification.
- `middleware/errorHandler.js`: **91.3% Lines**, **65.11% Branches**. Handles error normalization and prevents sensitive stack leaks.

### 3.2 Models Layer
- `models/User.js`, `models/Vehicle.js`, `models/ParkingSlot.js`, `models/ParkingSession.js`, `models/index.js`: **100% Across All Metrics**. All Mongoose schemas and indexes are fully exercised.
- `models/AuditLog.js`: **90.32% Lines**, **78.26% Branches**. Validates recursive secret redaction and schema persistence.

### 3.3 Services Layer
- `services/auth.service.js`: **100% Lines**, **97.05% Stmts**, **83.87% Branches**. Core authentication, JWT generation, and password verification.
- `services/occupancy.service.js`: **100% Lines**, **100% Stmts**, **100% Funcs**. Live aggregation and slot counting.
- `services/audit.service.js`: **93.47% Lines**, **100% Funcs**, **72.3% Branches**. Audit event queries, pagination, and redaction.
- `services/vehicle.service.js`: **78.43% Lines**, **88.88% Funcs**, **73.77% Branches**. Fleet CRUD and registration checks.

### 3.4 Routes Layer
- `routes/auth.routes.js`, `routes/slot.routes.js`, `routes/vehicle.routes.js`, `routes/occupancy.routes.js`, `routes/health.routes.js`: **100% Line Coverage**.
- `routes/admin.routes.js`: **92.3% Lines**. Admin metrics and audit viewing.
- `routes/parking.routes.js`: **53.57% Lines**. Legacy endpoints retained for backward compatibility.
