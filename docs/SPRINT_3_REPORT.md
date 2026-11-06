# Vehicle Parking System (VPS) â€” Sprint-3 Execution Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Sprint-3 Execution & Finalization Report  
**Organization:** ParkMatrix (Team 5)  
**Sprint Period:** 2nd November 2026 â€“ 6th November 2026  
**Date:** 5th November 2026  
**Status:** **COMPLETED & SIGNED OFF**  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) â€” QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) â€” Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) â€” Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) â€” Security Tester, Developer, Test Engineer

---

## 1. Executive Summary

In accordance with **Software Engineering Mini-Project Deliverables Part-3**:
> *"3. Optional Sprint-3 - Parallel Activity [2nd Nov to 6th Nov]: If there is another Sprint required due to spill overs then complete the development during this week and call it as Sprint-3. Parallelly complete the testing and generate the reports also."*

### Assessment of Spill-Overs
A comprehensive backlog review confirmed that **all 29 baselined user stories (88 Story Points)** across Sprint 1 and Sprint 2 were 100% completed, tested, and merged into `main` with **zero functional spill-overs**.

Therefore, the team designated **Sprint-3 (2nd Nov â€“ 6th Nov 2026)** as a dedicated **Quality Hardening, Test Suite Optimization, Coverage Analysis, and Deliverable Packaging Sprint**.

---

## 2. Sprint-3 Work Breakdown & Parallel Activities

| Category | Planned Activity | Execution & Verification | Outcome |
| :--- | :--- | :--- | :---: |
| **Testing** | Execute full Jest unit test suite | 12 test suites, 142 assertions executed; 0 failures. | **100% PASS** |
| **Validation** | Verify all 29 SRS requirements | Validated via RTM and 6 end-to-end operational workflows. | **100% VERIFIED** |
| **Coverage** | Measure Code & Branch coverage | Achieved 81.78% lines, 80.76% stmts, 89.39% funcs, 66.39% branches. | **COMPLIANT** |
| **Performance** | Verify P95 latency under load | Tested 200 requests (concurrency: 10); P95 = 65.15 ms (< 2000 ms SLA). | **SLA MET** |
| **Documentation** | Update Test Cases & Test Plan | Baselined STP v3.0 with complete post-sprint test procedures. | **UPDATED** |
| **Delivery** | Upload all reports to repo `docs/` | Placed all 4 reports + STP v3.0 + Sprint-3 report in `docs/`. | **UPLOADED** |

---

## 3. Team Member Task Allocation in Sprint-3

- **Preksha C M (QA Lead):** Executed full test runner, documented 142 passing assertions, compiled the Unit Test Report, and validated the RTM against acceptance criteria.
- **Nishant H (Product Owner):** Conducted acceptance criteria sign-off, audited RBAC permission matrix (50 routes), and validated HTTPS/TLS compliance.
- **Siddesh V S (Dev Lead):** Configured Istanbul coverage reporters, generated Code Coverage and Branch Coverage reports, and evaluated uncovered lines.
- **Salasha V (Security Tester):** Verified audit trail sanitization, compound session uniqueness constraints, and updated the Test Plan to v3.0.

---

## 4. Final Deliverables Catalog (in `docs/`)

The following files have been generated, formatted, and placed into `vehicle-parking-system/docs/`:

1. `UNIT_TEST_REPORT.md` / `UNIT_TEST_REPORT.docx`: Full execution metrics and results for all 12 test suites.
2. `SYSTEM_VALIDATION_REPORT.md` / `SYSTEM_VALIDATION_REPORT.docx`: Traceability matrix (RTM) and end-to-end scenario validation for all 29 requirements.
3. `CODE_COVERAGE_REPORT.md` / `CODE_COVERAGE_REPORT.docx`: Module-by-module line, statement, and function coverage breakdown.
4. `BRANCH_COVERAGE_REPORT.md` / `BRANCH_COVERAGE_REPORT.docx`: Critical decision path analysis and branch coverage report.
5. `UPDATED_TEST_PLAN_AND_CASES.md` / `UPDATED_TEST_PLAN_AND_CASES.docx`: Software Test Plan (STP) v3.0 with updated test procedures for all 29 test cases.
6. `SPRINT_3_REPORT.md` / `SPRINT_3_REPORT.docx`: Sprint-3 retrospective, parallel activities log, and sign-off.

---

## 5. Sprint-3 Retrospective & Sign-Off

The team completed all Part-3 deliverable mandates ahead of the 6th November deadline. The Vehicle Parking System codebase is fully tested, thoroughly verified, well-documented, and ready for final project demonstration and academic evaluation.
