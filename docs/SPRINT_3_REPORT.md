# Vehicle Parking System (VPS) — Sprint-3 Execution Report

**Project:** Vehicle Parking System (MERN Stack)  
**Deliverable:** Part-3: Sprint-3 Execution & Finalization Report  
**Organization:** ParkMatrix (Team 5)  
**Sprint Period:** 2nd November 2026 – 6th November 2026  
**Date:** 5th November 2026  
**Status:** **COMPLETED & SIGNED OFF**  
**Authors / Team 5:**
- Preksha C M (`Preksha-a11y`) — QA Lead, Test Engineer
- Nishant H (`Nishant-Hegde`) — Product Owner, Developer, Test Engineer
- Siddesh V S (`siddeshvs351`) — Dev Lead, Developer, Test Engineer
- Salasha V (`salashav`) — Security Tester, Developer, Test Engineer

---

## 1. Executive Summary

In accordance with **Software Engineering Mini-Project Deliverables Part-3**:
> *"3. Optional Sprint-3 - Parallel Activity [2nd Nov to 6th Nov]: If there is another Sprint required due to spill overs then complete the development during this week and call it as Sprint-3. Parallelly complete the testing and generate the reports also."*

### Assessment of Spill-Overs
A comprehensive backlog review confirmed that **all 29 baselined user stories (88 Story Points)** across Sprint 1 and Sprint 2 were 100% completed, tested, and merged into `main` with **zero functional spill-overs**.

Therefore, the team designated **Sprint-3 (2nd Nov – 6th Nov 2026)** as a dedicated **Quality Hardening, Test Suite Optimization, Coverage Analysis, and Deliverable Packaging Sprint**.

---

## 2. Sprint-3 Work Breakdown & Parallel Activities

| Category | Planned Activity | Execution & Verification | Outcome |
| :--- | :--- | :--- | :---: |
| **Testing** | Execute full Jest unit test suite | 13 test suites, 148 tests executed; 0 failures. | **100% PASS** |
| **Validation** | Verify all 29 SRS requirements | Validated via RTM and 6 end-to-end operational workflows. | **100% VERIFIED** |
| **Coverage** | Measure Code & Branch coverage | 80.64% lines, 79.66% statements, 85.91% functions, 67.43% branches. | **COMPLIANT** |
| **Performance** | Verify P95 latency under load | Tested 200 requests (concurrency: 10); P95 = 65.15 ms (< 2000 ms SLA). | **SLA MET** |
| **Documentation** | Update Test Cases & Test Plan | `docs/UPDATED_TEST_PLAN_AND_CASES.md` (v3.0) and `documents/Test_plan.docx` (v2.0, Appendix B results); `documents/DEVIATIONS.md` completed. | **UPDATED** |
| **Delivery** | Upload all reports to repo `docs/` | Placed all 4 reports + STP v3.0 + Sprint-3 report in `docs/`. | **UPLOADED** |

---

## 3. Team Member Task Allocation in Sprint-3

- **Preksha C M (QA Lead):** Executed full test runner, documented the passing tests, compiled the Unit Test Report, and validated the RTM against acceptance criteria.
- **Nishant H (Product Owner):** Conducted acceptance criteria sign-off, audited RBAC permission matrix (50 routes), and validated HTTPS/TLS compliance.
- **Siddesh V S (Dev Lead):** Configured Istanbul coverage reporters, generated Code Coverage and Branch Coverage reports, and evaluated uncovered lines.
- **Salasha V (Security Tester):** Verified audit trail sanitization, compound session uniqueness constraints, and updated the Test Plan to v3.0.

---

## 4. Final Deliverables Catalog (in `docs/`)

The following files have been generated, formatted, and placed into `vehicle-parking-system/docs/`:

1. `UNIT_TEST_REPORT.md`: Execution results for all 13 test suites (148 tests).
2. `SYSTEM_VALIDATION_REPORT.md`: Traceability matrix (RTM) and end-to-end scenario validation for all 29 requirements.
3. `CODE_COVERAGE_REPORT.md`: Module-by-module line, statement, and function coverage breakdown.
4. `BRANCH_COVERAGE_REPORT.md`: Critical decision path analysis and branch coverage report.
5. `UPDATED_TEST_PLAN_AND_CASES.md`: Software Test Plan (STP) v3.0 with updated test procedures for all 29 test cases.
6. `SPRINT_3_REPORT.md`: Sprint-3 retrospective, parallel activities log, and sign-off.

---

## 5. Final fixes (16th November 2026)

Before the final evaluation the team re-checked the deliverables against the evaluator checklist and fixed the gaps:
- Re-ran the suite and coverage on `main` and corrected the numbers in all reports.
- Corrected endpoints and test references in the System Validation Report.
- Completed `documents/DEVIATIONS.md` and updated `documents/Test_plan.docx` to v2.0.

## 6. Sprint-3 Retrospective & Sign-Off

The team completed all Part-3 deliverable mandates ahead of the 6th November deadline. The Vehicle Parking System codebase is fully tested, thoroughly verified, well-documented, and ready for final project demonstration and academic evaluation.
