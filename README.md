# ParkMatrix - Vehicle Parking System

Web app for managing parking slots and tracking vehicles (SE Mini Project, Team 5).
Stack: **MongoDB, Express, React (Vite), Node.js**. Requirements, design and tests are in [`documents/`](documents/).

## Run it locally

You need Node.js 20+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. API server
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env  - then set MONGO_URI and JWT_SECRET
npm run dev                 # http://localhost:5000/api/health

# 2. Web client (second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

## Project structure

```
server/src/
  config/db.js          MongoDB connection
  models/               User, Vehicle, ParkingSlot, ParkingSession, AuditLog (SAD 4.2)
  routes/               one router per module (auth, vehicle, slot, parking, admin)
  controllers/          HTTP request/response handling
  services/             business rules
  repositories/         database access
  middleware/           auth (JWT), rbac (roles), errorHandler
  app.js, server.js
server/tests/           Jest + Supertest
client/src/
  pages/                one file per screen
  components/           shared UI (NavBar)
  api.js, auth.js       API client (sends JWT) and login session helpers
```

## Who owns what (Sprint 1)

| Module | Owner | Issues | Backend files | Pages |
| --- | --- | --- | --- | --- |
| Auth | Nishant | #24 #25 #26 | `routes/auth.routes.js`, `auth.*.js` | Login, Register |
| Auth middleware, RBAC, Vehicles | Preksha | #27 #30 #28 #29 | `middleware/auth.js`, `middleware/rbac.js`, `routes/vehicle.routes.js` | MyVehicles |
| Slots | Siddesh | #31 #32 #33 | `routes/slot.routes.js`, `slot.*.js` | SlotGrid, AdminSlots |
| Entry / Exit | Salasha | #34 #35 #36 #38 #39 | `routes/parking.routes.js`, `parking.*.js` | StaffEntry, StaffExit |

Edit only your own files where you can. Shared files (`models/`, `app.js`, `App.jsx`) - mention the change in your PR.

## How we work (Sprint rules)

1. Move your issue to **In progress** on the project board.
2. Branch from `main`: `git checkout main && git pull && git checkout -b VPS-F-009-vehicle-entry`
3. Commit, push, and **open the PR yourself**. The PR description must start with `Closes #<issue>`.
4. CI (GitHub Actions) must be green.
5. A repo owner reviews and merges. The issue closes and moves to **Done** automatically.
6. Any change from the SRS/SAD/Test Plan goes in [`documents/DEVIATIONS.md`](documents/DEVIATIONS.md).

API endpoints follow SAD section 4.3.2.
