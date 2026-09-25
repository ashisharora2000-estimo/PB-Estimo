# Oracle True Cloud Method (OUM) Implementation Standard

## 1. Executive Overview
The Oracle Cloud Project Planning Engine enforces strict adherence to the **Oracle True Cloud Method (OUM)** and the standard specified in `oracle-project-plan-standard.yaml`. All project schedules, WBS activities, durations, and Smartsheet deliverables must strictly follow this methodology.

---

## 2. Mandatory Wave Structure & Stage Gates

### Wave 0: Mobilize & Enterprise Design (Mandatory)
* **Team Mobilization (Core)**: Executive sponsor kickoff, core delivery team onboarding, project charter, governance setup.
* **Kick-off Activities**: Stakeholder engagement, working cadences, environment readiness (Oracle Cloud POD provisioning).
* **Business Onboarding**: Key business process owner workshops, RACI assignment.
* **Foundation Design**: Global chart of accounts (COA) architecture, enterprise structure, ledgers, legal entities, business units.
* **Workstream Design (~50% of Wave 0)**: Level 2 / Level 3 business process review across in-scope pillars (ERP, SCM, HCM, EPM, CX).
* **Re-Baseline Project**: Stage Gate milestone locking scope, budget, and wave sequencing before proceeding to build.

### Post-Enterprise Design Waves (Waves 1 through 5)
Every subsequent implementation wave follows deterministic sub-phase allocations:
* **Detailed Design (11% of phase duration)**: Process workflows, configuration workbooks, functional design specs (CEMLI).
* **Build / Configuration (50% of phase duration)**: Oracle Fusion configuration, OIC interface development, BI Publisher/OTBI reports, HDL/FBDI data conversion scripts.
* **System Integration Testing - SIT (21% of phase duration)**: End-to-end integration and boundary testing, cross-module orchestration.
* **User Acceptance Testing - UAT (21% of phase duration)**: Business user validation, test scenario sign-off, parallel testing.
* **Cutover & Deployment (7% of phase duration)**: Gold configuration migration, production mock cutover, blackout/freeze window synchronization, Go-Live.
* **Hypercare (21% of phase duration)**: Post-go-live command center, defect resolution, period-close stabilization (P1/P2 resolution SLAs).
* **Transition to Run (9% of phase duration)**: Knowledge transfer, operational handover to AMS/Client CoE, project closure.

---

## 3. Mandatory Cross-Workstreams
Never omit cross-workstreams from the plan. Every valid proposal must include:
1. `GOVERNANCE`: Steering committee cadence, risk & issue management, escalation paths.
2. `PMO`: Program office, status reporting, Smartsheet synchronization, deliverables sign-off.
3. `ARCHITECTURE`: Enterprise integration patterns, security architecture, environment management.
4. `SECURITY`: Role-based access control (RBAC), segregated duties (SoD), custom data roles.
5. `TESTING`: Test management, defect triaging, SIT/UAT sign-offs.
6. `DATA`: Extraction, transformation, cleansing, FBDI/HDL load cycles (Mock 1, 2, 3, Gold Cutover).
7. `OCM (Organizational Change Management)`: Stakeholder impact analysis, communications, resistance mitigation.
8. `TRAINING`: Train-the-trainer, super-user training, end-user quick reference cards (QRC).
9. `DEPLOYMENT & CUTOVER`: Readiness checkpoints, Go/No-Go steerco criteria, dress rehearsals.
10. `HYPERCARE & TRANSITION`: Early life support, hypercare exit criteria, handover to Run.

---

## 4. Smartsheet 30-Column Output Specification
When exporting or synchronizing the project plan to Smartsheet, generate all **30 columns in exact order**:
1. `Task Name`
2. `ASSIGNED TO ROLE`
3. `Status`
4. `Start Date`
5. `End Date`
6. `Task Progress`
7. `Predecessors`
8. `Duration`
9. `Type`
10. `Workstream`
11. `Comments`
12. `Allocation`
13. `LEVEL-ID`
14. `Complete`
15. `TASK_NUMBER`
16. `CATEGORY`
17. `WBS-ID`
18. `TEMPLATE-ID`
19. `Parent WBS ID`
20. `Wave`
21. `Phase`
22. `Sub-Phase`
23. `Domain`
24. `Module Code`
25. `Module Name`
26. `Component ID`
27. `Component Name`
28. `Schedule Method`
29. `Anomaly Flag`
30. `Anomaly Reason`
