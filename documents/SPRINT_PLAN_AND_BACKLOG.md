# Vehicle Parking System (VPS) — Product Backlog & Sprint Execution Plan

**Project:** Vehicle Parking System (MERN Stack)  
**Organization:** ParkMatrix  
**Repository:** [ParkMatrix/vehicle-parking-system](https://github.com/ParkMatrix/vehicle-parking-system)  
**Deliverable:** Part-1 — Backlog Creation, Story Point Estimation & Sprint Planning  
**Baseline Date:** 11-Oct-2026 / 12-Oct-2026 (Part-1 Deadline: 12th Oct 2026)  
**Version:** 1.0  
**Authors / Team 5:**
- **Preksha C M** (`Preksha-a11y`) — QA Lead, Test Engineer
- **Nishant H** (`Nishant-Hegde`) — Product Owner, Developer, Test Engineer
- **Siddesh V S** (`siddeshvs351`) — Dev Lead, Developer, Test Engineer
- **Salasha V** (`salashav`) — Security Tester, Developer, Test Engineer

---

## 1. Executive Summary & Part-1 Status

This document establishes the official Product Backlog and Two-Sprint Agile Execution Plan for the **Vehicle Parking System (VPS)**, directly derived from the baselined **Software Requirements Specification (SRS v1.0)**, **Software Architecture and Design Specification (SAD v1.0)**, and **Software Test Plan (STP v1.0)**.

### Deliverable Checklist (Part 1 - ETA: 12th Oct 2026)
| Deliverable Item | Status | Verification & Evidence |
| :--- | :---: | :--- |
| **a. Create Project & link with mini-project repo** | In Progress / Configured | Repo `ParkMatrix/vehicle-parking-system` created; board columns & workflows mapped (`Todo`, `In Progress`, `In Review`, `Done`). |
| **b. Use FR & NFR in SRS to create backlogs in Git** | **COMPLETED** | All 29 requirements (18 FRs, 6 NFRs, 5 SRs) converted to GitHub Issues (#24 through #52) with structured User Stories & Acceptance Criteria. |
| **c. Assign Story Points to each backlog item** | **COMPLETED** | Fibonacci scale (1, 2, 3, 5, 8) assigned across all 29 issues; labeled with `sp: X` and documented in metadata headers. |
| **d. Assign stories to team members** | **COMPLETED** | 100% of issues assigned across 4 team members matching modular ownership in SAD & STP. |
| **e. Plan Two Sprints** | **COMPLETED** | Two 1-week sprints planned; GitHub Milestones created; 44 Story Points allocated per Sprint (88 SP total). |
| **f. Sprint Dry Run (12th Oct - 16th Oct)** | Scheduled | 1-week preparation for PR workflow, CI/CD pipelines, and MERN environment validation. |
| **g. Backlog Adjustment Window (until 19th Oct)** | Scheduled | Backlog refinement permitted through 19th Oct prior to Sprint 1 execution kickoff. |

---

## 2. Complete Product Backlog (29 Baselined Items)

Total Story Points: **88 SP** | Sprint 1: **44 SP (15 issues)** | Sprint 2: **44 SP (14 issues)**

| Issue # | Requirement ID | Title / Summary | Category | Priority | Assignee | Story Points | Target Sprint | Test Case Ref |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| #24 | `VPS-F-001` | User registration | Functional | High | Nishant-Hegde | 3 | Sprint 1 | `TC-F-001` |
| #25 | `VPS-F-002` | User login (JWT Token) | Functional | High | Nishant-Hegde | 3 | Sprint 1 | `TC-F-002` |
| #26 | `VPS-SR-004` | Secure password hashing (bcrypt) | Security | High | Nishant-Hegde | 2 | Sprint 1 | `TC-S-004` |
| #27 | `VPS-SR-001` | Authentication on protected APIs | Security | High | Preksha-a11y | 3 | Sprint 1 | `TC-S-001` |
| #28 | `VPS-F-003` | Register vehicle | Functional | High | Preksha-a11y | 3 | Sprint 1 | `TC-F-003` |
| #29 | `VPS-F-004` | View and update vehicle details | Functional | Medium | Preksha-a11y | 2 | Sprint 1 | `TC-F-004` |
| #30 | `VPS-SR-002` | Role-based access control (RBAC) | Security | High | Preksha-a11y | 3 | Sprint 1 | `TC-S-002` |
| #31 | `VPS-F-005` | Create parking slot | Functional | High | siddeshvs351 | 3 | Sprint 1 | `TC-F-005` |
| #32 | `VPS-F-006` | Update slot status | Functional | High | siddeshvs351 | 2 | Sprint 1 | `TC-F-006` |
| #33 | `VPS-F-007` | Slot status view (interactive grid) | Functional | High | siddeshvs351 | 5 | Sprint 1 | `TC-F-007` |
| #34 | `VPS-F-008` | Available-slot picker on entry | Functional | High | salashav | 3 | Sprint 1 | `TC-F-008` |
| #35 | `VPS-F-009` | Record vehicle entry (active session) | Functional | High | salashav | 5 | Sprint 1 | `TC-F-009` |
| #36 | `VPS-F-010` | Mark slot occupied on entry | Functional | High | salashav | 2 | Sprint 1 | `TC-F-010` |
| #38 | `VPS-F-013` | Record vehicle exit | Functional | High | salashav | 3 | Sprint 1 | `TC-F-013` |
| #39 | `VPS-F-014` | Free slot on exit | Functional | High | salashav | 2 | Sprint 1 | `TC-F-014` |
| #37 | `VPS-F-018` | One active session per vehicle | Functional | High | salashav | 3 | Sprint 2 | `TC-F-018` |
| #40 | `VPS-NF-003` | RBAC verification tests | Non-Functional | High | Nishant-Hegde | 3 | Sprint 2 | `TC-N-003` |
| #41 | `VPS-NF-004` | Slot-session consistency check | Non-Functional | High | salashav | 3 | Sprint 2 | `TC-N-004` |
| #42 | `VPS-F-011` | Search active vehicle | Functional | High | siddeshvs351 | 3 | Sprint 2 | `TC-F-011` |
| #43 | `VPS-F-012` | Show current slot of parked vehicle | Functional | High | siddeshvs351 | 2 | Sprint 2 | `TC-F-012` |
| #44 | `VPS-NF-001` | Performance test (p95 within 2 s) | Non-Functional | High | siddeshvs351 | 5 | Sprint 2 | `TC-N-001` |
| #45 | `VPS-NF-005` | Browser compatibility & error toasts | Non-Functional | Medium | Nishant-Hegde | 2 | Sprint 2 | `TC-N-005` |
| #46 | `VPS-F-015` | Parking history | Functional | Medium | Preksha-a11y | 3 | Sprint 2 | `TC-F-015` |
| #47 | `VPS-F-017` | Audit events for sensitive actions | Functional | High | Preksha-a11y | 5 | Sprint 2 | `TC-F-017` |
| #48 | `VPS-SR-005` | No secrets in audit log | Security | High | Preksha-a11y | 2 | Sprint 2 | `TC-S-005` |
| #49 | `VPS-NF-006` | Audit retention and retrieval | Non-Functional | Medium | Preksha-a11y | 3 | Sprint 2 | `TC-N-006` |
| #50 | `VPS-F-016` | Admin occupancy dashboard | Functional | Medium | Nishant-Hegde | 5 | Sprint 2 | `TC-F-016` |
| #51 | `VPS-NF-002` | Availability: health check & uptime | Non-Functional | High | Nishant-Hegde | 3 | Sprint 2 | `TC-N-002` |
| #52 | `VPS-SR-003` | HTTPS/TLS in production | Security | High | Nishant-Hegde | 2 | Sprint 2 | `TC-S-003` |

---

## 3. Sprint 1 Plan (19th Oct – 23rd Oct 2026)

### 3.1 Sprint Goal
Deliver an end-to-end working **Minimum Viable Product (MVP)** capable of executing the entire baseline operational cycle:
1. User registration & secure login (JWT authentication + password hashing).
2. Vehicle registration and profile management.
3. Administrator parking slot creation and status management.
4. Real-time visual Slot Grid UI.
5. Vehicle Entry workflow (slot picker, session generation, slot marked occupied).
6. Vehicle Exit workflow (session completion, duration calculation, slot freed to available).

### 3.2 Sprint 1 Work Breakdown (15 Items | 44 Story Points)
- **Nishant Hegde (8 SP):**
  - #24: User registration (`VPS-F-001`, 3 SP)
  - #25: User login (`VPS-F-002`, 3 SP)
  - #26: Password hashing with bcrypt (`VPS-SR-004`, 2 SP)
- **Preksha C M (11 SP):**
  - #27: JWT protected API middleware (`VPS-SR-001`, 3 SP)
  - #28: Vehicle registration (`VPS-F-003`, 3 SP)
  - #29: Vehicle details view and update (`VPS-F-004`, 2 SP)
  - #30: RBAC authorization middleware (`VPS-SR-002`, 3 SP)
- **Siddesh V S (10 SP):**
  - #31: Admin parking slot creation (`VPS-F-005`, 3 SP)
  - #32: Update parking slot operational status (`VPS-F-006`, 2 SP)
  - #33: Interactive Slot Grid status view component (`VPS-F-007`, 5 SP)
- **Salasha V (15 SP):**
  - #34: Available slot picker on entry (`VPS-F-008`, 3 SP)
  - #35: Record vehicle entry & start session (`VPS-F-009`, 5 SP)
  - #36: Atomic slot occupancy transition (`VPS-F-010`, 2 SP)
  - #38: Record vehicle exit & close session (`VPS-F-013`, 3 SP)
  - #39: Atomic slot release transition (`VPS-F-014`, 2 SP)

### 3.3 Sprint 1 Definition of Done (DoD)
- Code committed to feature branches and merged to `main` via approved Pull Requests.
- All acceptance criteria checkboxes in issues #24 through #39 checked.
- Postman/API tests and unit tests pass.
- End-to-end user workflow recorded in a **1-minute video demo** showing a fully working application and uploaded to the repository.

---

## 4. Sprint 2 Plan (26th Oct – 30th Oct 2026)

### 4.1 Sprint Goal
Complete all advanced features, security hardening, administrative dashboards, audit logging, and comprehensive Non-Functional Requirement (NFR) verification, culminating in the **Final Project Freeze**.

### 4.2 Sprint 2 Work Breakdown (14 Items | 44 Story Points)
- **Nishant Hegde (15 SP):**
  - #50: Admin occupancy & metrics dashboard (`VPS-F-016`, 5 SP)
  - #40: Automated RBAC verification test suite (`VPS-NF-003`, 3 SP)
  - #45: Browser compatibility & error message audit (`VPS-NF-005`, 2 SP)
  - #51: Availability, `/api/health` & uptime monitor (`VPS-NF-002`, 3 SP)
  - #52: HTTPS/TLS & secure cookie configuration (`VPS-SR-003`, 2 SP)
- **Preksha C M (13 SP):**
  - #46: User parking history view (`VPS-F-015`, 3 SP)
  - #47: Security audit event logging engine (`VPS-F-017`, 5 SP)
  - #48: Audit log sanitizer (no passwords/tokens) (`VPS-SR-005`, 2 SP)
  - #49: Audit record retention and retrieval UI (`VPS-NF-006`, 3 SP)
- **Siddesh V S (10 SP):**
  - #42: Search active vehicle by registration number (`VPS-F-011`, 3 SP)
  - #43: Show current slot of parked vehicle (`VPS-F-012`, 2 SP)
  - #44: Performance & load testing (p95 < 2s under load) (`VPS-NF-001`, 5 SP)
- **Salasha V (6 SP):**
  - #37: Compound uniqueness constraint: 1 active session per vehicle (`VPS-F-018`, 3 SP)
  - #41: Slot-session state consistency validator script (`VPS-NF-004`, 3 SP)

### 4.3 Sprint 2 Definition of Done (DoD) & Project Freeze
- All 29 issues completed, reviewed, and closed.
- Zero known high-severity bugs; security audit log redaction validated.
- Performance tests confirm p95 API response <= 2s under normal load.
- Record a **2-minute video demo** exhibiting full functionality and upload to repository.
- Final documentation frozen for assessment demo.

---

## 5. Team Capacity & Velocity Distribution

| Team Member | GitHub Username | Role & Modules | Sprint 1 SP | Sprint 2 SP | Total SP | Issue Count |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Nishant H** | `Nishant-Hegde` | Product Owner / Auth & Admin Dashboard | 8 | 15 | **23** | 8 |
| **Preksha C M** | `Preksha-a11y` | QA Lead / Vehicle, RBAC & Audit Engine | 11 | 13 | **24** | 8 |
| **Siddesh V S** | `siddeshvs351` | Dev Lead / Slots, Grid & Search & Perf | 10 | 10 | **20** | 6 |
| **Salasha V** | `salashav` | Security Tester / Entry/Exit & Integrity | 15 | 6 | **21** | 7 |
| **Total** | — | — | **44** | **44** | **88** | **29** |

---

## 6. Sprint Dry-Run Guidelines (12th Oct – 16th Oct 2026)

The week of 12th Oct to 16th Oct is dedicated to a **practice dry run** to eliminate operational friction before Sprint 1 begins:
1. **GitHub Flow Practice:** Each member creates a feature branch (`feature/VPS-F-001-auth`), raises a draft Pull Request, links the corresponding issue (`Fixes #24`), and requests a peer review.
2. **Review & Merge Verification:** Verify that repository owners can review, request changes, approve, and merge PRs.
3. **CI/CD Workflow Check:** Validate automated linting and tests triggered on PR and push.
4. **Environment Calibration:** Verify Node.js, Express, React, and MongoDB connectivity locally across all team laptops.
5. **Backlog Fine-Tuning:** On or before 19th October, the team may refine story point estimations or acceptance criteria prior to sprint execution lock.

---

## 7. GitHub Projects Automation Configuration

In accordance with the instructor guide (`GitHub_Projects Automation`), the GitHub Project board is structured as follows:

### Board Columns
1. **Todo** — Backlog items committed to the current sprint.
2. **In Progress** — Actively being implemented on a feature branch with an open Pull Request.
3. **In Review** — PR submitted and awaiting peer code review / QA verification.
4. **Done** — PR merged into `main`, automated tests passed, and issue auto-closed.

### Project Automation Rules
- **Auto-Add:** All newly opened issues with label `sprint-1` or `sprint-2` automatically route to `Todo`.
- **In Progress Trigger:** When a Pull Request contains keyword linking (e.g. `Fixes #24`), the card moves to `In Progress`.
- **Done Trigger:** When the Pull Request is merged into `main`, both the PR and linked issue move to `Done` and the issue is marked Closed.
