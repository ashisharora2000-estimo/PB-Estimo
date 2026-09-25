export interface KnowledgeFile {
  name: string;
  filename: string;
  content: string;
}

export const CLAUDE_KNOWLEDGE_FILES: KnowledgeFile[] = [
  {
    name: 'Oracle True Cloud Method (OUM) Standard',
    filename: '01-oracle-true-cloud-methodology.md',
    content: `# Oracle True Cloud Method (OUM) Implementation Standard

## 1. Executive Overview
The Oracle Cloud Project Planning Engine enforces strict adherence to the Oracle True Cloud Method (OUM) and the standard specified in oracle-project-plan-standard.yaml. All project schedules, WBS activities, durations, and Smartsheet deliverables must strictly follow this methodology.

---

## 2. Mandatory Wave Structure & Stage Gates

### Wave 0: Mobilize & Enterprise Design (Mandatory)
- Team Mobilization (Core): Executive sponsor kickoff, core delivery team onboarding, project charter, governance setup.
- Kick-off Activities: Stakeholder engagement, working cadences, environment readiness (Oracle Cloud POD provisioning).
- Business Onboarding: Key business process owner workshops, RACI assignment.
- Foundation Design: Global chart of accounts (COA) architecture, enterprise structure, ledgers, legal entities, business units.
- Workstream Design (~50% of Wave 0): Level 2 / Level 3 business process review across in-scope pillars (ERP, SCM, HCM, EPM, CX).
- Re-Baseline Project: Stage Gate milestone locking scope, budget, and wave sequencing before proceeding to build.

### Post-Enterprise Design Waves (Waves 1 through 5)
Every subsequent implementation wave follows deterministic sub-phase allocations:
- Detailed Design (11% of phase duration): Process workflows, configuration workbooks, functional design specs (CEMLI).
- Build / Configuration (50% of phase duration): Oracle Fusion configuration, OIC interface development, BI Publisher/OTBI reports, HDL/FBDI data conversion scripts.
- System Integration Testing - SIT (21% of phase duration): End-to-end integration and boundary testing, cross-module orchestration.
- User Acceptance Testing - UAT (21% of phase duration): Business user validation, test scenario sign-off, parallel testing.
- Cutover & Deployment (7% of phase duration): Gold configuration migration, production mock cutover, blackout/freeze window synchronization, Go-Live.
- Hypercare (21% of phase duration): Post-go-live command center, defect resolution, period-close stabilization (P1/P2 resolution SLAs).
- Transition to Run (9% of phase duration): Knowledge transfer, operational handover to AMS/Client CoE, project closure.

---

## 3. Mandatory Cross-Workstreams
Never omit cross-workstreams from the plan:
1. GOVERNANCE: Steering committee cadence, risk & issue management, escalation paths.
2. PMO: Program office, status reporting, Smartsheet synchronization, deliverables sign-off.
3. ARCHITECTURE: Enterprise integration patterns, security architecture, environment management.
4. SECURITY: Role-based access control (RBAC), segregated duties (SoD), custom data roles.
5. TESTING: Test management, defect triaging, SIT/UAT sign-offs.
6. DATA: Extraction, transformation, cleansing, FBDI/HDL load cycles (Mock 1, 2, 3, Gold Cutover).
7. OCM (Organizational Change Management): Stakeholder impact analysis, communications, resistance mitigation.
8. TRAINING: Train-the-trainer, super-user training, end-user quick reference cards (QRC).
9. DEPLOYMENT & CUTOVER: Readiness checkpoints, Go/No-Go steerco criteria, dress rehearsals.
10. HYPERCARE & TRANSITION: Early life support, hypercare exit criteria, handover to Run.

---

## 4. Smartsheet 30-Column Output Specification
When exporting or synchronizing to Smartsheet, generate all 30 columns in exact order:
1. Task Name | 2. ASSIGNED TO ROLE | 3. Status | 4. Start Date | 5. End Date
6. Task Progress | 7. Predecessors | 8. Duration | 9. Type | 10. Workstream
11. Comments | 12. Allocation | 13. LEVEL-ID | 14. Complete | 15. TASK_NUMBER
16. CATEGORY | 17. WBS-ID | 18. TEMPLATE-ID | 19. Parent WBS ID | 20. Wave
21. Phase | 22. Sub-Phase | 23. Domain | 24. Module Code | 25. Module Name
26. Component ID | 27. Component Name | 28. Schedule Method | 29. Anomaly Flag | 30. Anomaly Reason
`
  },
  {
    name: 'Commercial Governance & DoA',
    filename: '02-commercial-governance-and-doa.md',
    content: `# Commercial Governance, Staffing Pyramids & Delegation of Authority (DoA)

## 1. Commercial Pricing Model
- Standard Blended Cost Rate: Default at $145 / billable hour (~$1,160 / 8-hour person-day).
- Delivery Model: Global Blended Delivery standard:
  - Onsite (30%): Solution Architects, Lead Functional Consultants, PMO/Change leads, UAT coordinators.
  - Offshore (70%): Developers, Configuration Specialists, Data Conversion engineers, Integration coders, Automation testers.

---

## 2. Resource Ramp-Down Engine Logic
- Build Phase: Peak staffing (100% capacity).
- SIT Phase: 15%-25% ramp-down from Build peak.
- UAT Phase: 40%-50% ramp-down from Build peak.
- Cutover / Deployment: Specialized cutover strike-team.
- Hypercare / Transition: Dedicated hypercare stabilization team.

---

## 3. Delegation of Authority (DoA) Tiers & Risk Triggers
- Tier 1 (Green) - Practice Lead: Gross Margin >= 38%, Standard Duration (>= 32 weeks for >8 modules), normal CEMLI (<12 OIC, <3 PaaS).
- Tier 2 (Amber) - VP / Solution Director: Gross Margin between 32% and 38%, compressed runway (<28 weeks), CEMLI 12-18 OIC.
- Tier 3 (Red) - Executive Committee / Deal Desk: Gross Margin < 32%, compressed runway (<24 weeks), high custom (>18 OIC, >4 PaaS), >=3 downsized module overrides.
`
  },
  {
    name: 'AI Savings & Baseline Variance Policy',
    filename: '03-ai-savings-and-baseline-variance-policy.md',
    content: `# AI Acceleration & Baseline Variance Policy

## 1. Context & Purpose
Evaluates AI-calculated project estimates against user-uploaded client or leadership baseline spreadsheets.

---

## 2. Phase-Wise AI Productivity Savings Standard
- Enterprise Design / Discovery: 15% - 20%
- Build & Configuration: 30% - 35%
- System Integration Testing (SIT): 20% - 25%
- User Acceptance Testing (UAT): 5% - 10% (Quality Floor: Never compress UAT by >10%)
- Cutover & Hypercare: 5% - 10% (Quality Floor: Human-in-the-loop validation mandatory)

---

## 3. Variance Metrics & Formulas
- Raw Delta = Engine Hours - Client Baseline Hours
- Net AI Delta = Engine Hours - Net AI Baseline Target Hours
- Variance Classification:
  - Favorable (Savings / Optimization): Engine is lower than Baseline.
  - On Track (+/- 5%): Engine matches within normal Monte Carlo variance.
  - Expansion / Scope Risk: Engine exceeds Baseline due to complex CEMLI, punchout catalogs, or multi-entity topology.
`
  },
  {
    name: 'Indirect Procurement & SCM Scoping',
    filename: '04-indirect-procurement-and-scm-scoping.md',
    content: `# Oracle Fusion Indirect Procurement & SCM Architecture

## 1. Pillar Scope & Architecture
- Purchasing (PO): Standard POs, Blanket & Contract agreements, 2-way and 3-way matching.
- Self-Service Procurement (SSP): Requisitioning portal, punchout catalogs (cXML), approval routing.
- Sourcing: RFx events, online supplier bidding, two-stage evaluation.
- Procurement Contracts: Clause library, contract terms authoring, digital signatures.
- Supplier Qualification Management (SQM): Questionnaires, assessments, automated risk scoring.
- Supplier Portal: Vendor self-service order acknowledgment, ASN, direct invoice submission.

---

## 2. Key Scoping Dimensions & Multipliers
- Punchout Catalogs: 1-3 punchouts (Low, +40h), 4-10 punchouts (Medium, +120h), >10 punchouts (High, +250h).
- Approval Matrices: Standard supervisory (1.0x), Multi-tier matrix (1.35x).
`
  },
  {
    name: 'System Architecture & Estimation Math',
    filename: '05-system-architecture-and-estimation-math.md',
    content: `# System Architecture, Estimation Math & Heuristics

## 1. Estimation Mathematical Model
Base Hours = Module Benchmark Hours * 20-Q Scoping Multiplier
- Sizing categories: XS (~60-120h), S (~150-250h), M (~300-450h), L (~500-750h), XL (~800-1,200h), XXL (>1,200h).

## 2. Technical Scale Drivers
- Integrations (OIC): Simple ~40h, Medium ~90h, Complex ~160h.
- Reports (OTBI / BIP): Standard OTBI ~16h, Complex BIP layout ~48h.
- Data Conversions (FBDI / HDL): Standard ~60h, Complex transactional ~110h per mock cycle.

## 3. Statistical Confidence Levels
- P50 (Median Baseline): Expected delivery effort under nominal conditions.
- P80 (Target Commercial Commitment): 80th percentile risk-weighted commitment.
- Management Reserve / Contingency = P80 Target Hours - P50 Base Hours.
`
  }
];

export function downloadSingleKnowledgeFile(file: KnowledgeFile) {
  const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllKnowledgeFiles() {
  CLAUDE_KNOWLEDGE_FILES.forEach((file, index) => {
    setTimeout(() => {
      downloadSingleKnowledgeFile(file);
    }, index * 250);
  });
}
