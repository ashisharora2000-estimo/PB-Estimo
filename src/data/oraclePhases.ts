import {
  ModuleDefinition,
  ComplexityPillar,
  Question,
  PodCohort,
  PodCohortInfo,
  Workstream,
  ProjectMilestone,
  ImplementationPhase,
  RoleRate
} from '../types';

export const ORACLE_MODULE_CATALOG: ModuleDefinition[] = [
  // Financials
  { id: 'erp_gl', name: 'General Ledger & Financial Reporting', pillar: 'ERP', description: 'Multi-ledger COA, intercompany, allocations, FRS & smart view reporting', baseEffortHours: 420, complexityFactor: 1.2 },
  { id: 'erp_ap', name: 'Accounts Payable & Payments', pillar: 'ERP', description: 'Invoice imaging, OCR, 2/3-way matching, payment process requests, 1099', baseEffortHours: 360, complexityFactor: 1.1 },
  { id: 'erp_ar', name: 'Accounts Receivable & Collections', pillar: 'ERP', description: 'Auto-invoice, revenue management, receipt processing, customer statements', baseEffortHours: 380, complexityFactor: 1.15 },
  { id: 'erp_fa', name: 'Fixed Assets', pillar: 'ERP', description: 'Asset books, tax depreciation, CIP capitalization, mass additions, retirements', baseEffortHours: 240, complexityFactor: 1.0 },
  { id: 'erp_cm', name: 'Cash Management & Bank Connectivity', pillar: 'ERP', description: 'Bank statement auto-reconciliation, cash positioning, treasury feeds', baseEffortHours: 220, complexityFactor: 1.1 },
  { id: 'erp_tax', name: 'Oracle Fusion Tax (ZX)', pillar: 'ERP', description: 'Tax regimes, determination rules, Vertex/Avalara third-party tax engine adapters', baseEffortHours: 280, complexityFactor: 1.25 },
  { id: 'erp_ppm', name: 'Project Portfolio Management (PPM)', pillar: 'ERP', description: 'Project costing, billing, revenue recognition, resource management', baseEffortHours: 460, complexityFactor: 1.3 },
  { id: 'erp_proc', name: 'Procurement Cloud & Self-Service', pillar: 'ERP', description: 'Requisitions, PO approvals, PunchOut catalogs, Supplier Portal, Sourcing', baseEffortHours: 440, complexityFactor: 1.2 },

  // Supply Chain & Operations
  { id: 'scm_inv', name: 'Inventory & Cost Management', pillar: 'SCM', description: 'Item master, lot/serial control, sub-inventories, landed cost, cost accounting', baseEffortHours: 480, complexityFactor: 1.25 },
  { id: 'scm_om', name: 'Order Management & Orchestration (DOO)', pillar: 'SCM', description: 'Order promising, pricing rules, shipping execution, fulfillment lines, drop-ship', baseEffortHours: 520, complexityFactor: 1.35 },
  { id: 'scm_mfg', name: 'Manufacturing (Discrete / Process)', pillar: 'SCM', description: 'Work definitions, standard operations, dispatch lists, WIP costing, IoT apps', baseEffortHours: 580, complexityFactor: 1.4 },
  { id: 'scm_maint', name: 'Maintenance Cloud', pillar: 'SCM', description: 'Asset maintenance work orders, preventive schedules, meters, spare parts', baseEffortHours: 320, complexityFactor: 1.15 },
  { id: 'scm_plan', name: 'Supply Chain Planning & Demand Mgmt', pillar: 'SCM', description: 'Demand sensing, supply planning, constrained forecasting, S&OP', baseEffortHours: 460, complexityFactor: 1.3 },
  { id: 'scm_wms', name: 'Warehouse Management (WMS Cloud / LogFire)', pillar: 'SCM', description: 'RF gun scanning, wave management, cross-docking, yard management', baseEffortHours: 540, complexityFactor: 1.35 },
  { id: 'scm_gop', name: 'Global Order Promising (GOP)', pillar: 'SCM', description: 'Lead time ATP, supply allocation rules, real-time order scheduling', baseEffortHours: 260, complexityFactor: 1.2 },

  // HCM & Payroll
  { id: 'hcm_core', name: 'Core HR & Global Human Resources', pillar: 'HCM', description: 'Work structures, positions, employment models, journeys, person records', baseEffortHours: 400, complexityFactor: 1.15 },
  { id: 'hcm_payroll', name: 'Oracle Fusion Global Payroll', pillar: 'HCM', description: 'Gross-to-net calculation, element entries, retroactive pay, tax filing extracts', baseEffortHours: 650, complexityFactor: 1.5 },
  { id: 'hcm_absence', name: 'Absence Management', pillar: 'HCM', description: 'Accrual plans, compensatory time, qualification plans, fast formulas', baseEffortHours: 320, complexityFactor: 1.2 },
  { id: 'hcm_time', name: 'Time & Labor (OTL)', pillar: 'HCM', description: 'Web clock, time card approvals, shift differentials, payroll transfer rules', baseEffortHours: 380, complexityFactor: 1.3 },
  { id: 'hcm_benefits', name: 'Benefits Cloud', pillar: 'HCM', description: 'Open enrollment, life events, flex credits, eligibility profiles, carrier EDI 834', baseEffortHours: 420, complexityFactor: 1.3 },
  { id: 'hcm_talent', name: 'Talent Management & Performance', pillar: 'HCM', description: 'Goal setting, 360 performance reviews, talent reviews, succession planning', baseEffortHours: 260, complexityFactor: 1.1 },
  { id: 'hcm_orc', name: 'Oracle Recruiting Cloud (ORC)', pillar: 'HCM', description: 'Career sites, candidate pipelines, job requisitions, offer letter workflows', baseEffortHours: 340, complexityFactor: 1.2 },

  // EPM & CX
  { id: 'epm_fccs', name: 'Financial Consolidation & Close (FCCS)', pillar: 'EPM', description: 'Multi-GAAP consolidation, elimination rules, close calendar orchestrator', baseEffortHours: 450, complexityFactor: 1.3 },
  { id: 'epm_epbcs', name: 'Enterprise Planning & Budgeting (EPBCS)', pillar: 'EPM', description: 'Workforce planning, CAPEX, financial statement models, driver formulas', baseEffortHours: 480, complexityFactor: 1.35 },
  { id: 'epm_edm', name: 'Enterprise Data Management (EDMCS)', pillar: 'EPM', description: 'Master chart of accounts governance, cross-system hierarchy syncing', baseEffortHours: 280, complexityFactor: 1.2 },
  { id: 'cx_service', name: 'B2B Service & Helpdesk Cloud', pillar: 'CX', description: 'Service request routing, SLA management, knowledge base, omnichannel', baseEffortHours: 320, complexityFactor: 1.15 },
  { id: 'cx_cpq', name: 'Oracle CPQ Cloud (Configure, Price, Quote)', pillar: 'CX', description: 'Product rules engine, price books, quote generation, document designer', baseEffortHours: 500, complexityFactor: 1.4 },
];

export const COMPLEXITY_PILLARS: ComplexityPillar[] = [
  {
    id: 'functional',
    label: 'Functional & Business Process Alignment',
    leadRole: 'Lead Enterprise Solution Architect',
    weight: 0.30,
    description: 'Adherence to Oracle Modern Best Practice vs customization/legacy process replication.'
  },
  {
    id: 'technical',
    label: 'Technical, OIC & CEMLI Architecture',
    leadRole: 'Principal Technical Architect',
    weight: 0.25,
    description: 'Integration density, real-time REST APIs, VBCS PaaS extensions, and custom Fast Formulas.'
  },
  {
    id: 'data',
    label: 'Data Debt & Conversion Complexity',
    leadRole: 'Data Migration Architect',
    weight: 0.20,
    description: 'Source legacy landscape, cleansing readiness, historical year depth, and FBDI/HDL volume.'
  },
  {
    id: 'ocm',
    label: 'OCM, SME Availability & Readiness',
    leadRole: 'Change Management Lead',
    weight: 0.15,
    description: 'Organizational change appetite, business SME dedication, and training readiness.'
  },
  {
    id: 'governance',
    label: 'Decision Velocity & Program Governance',
    leadRole: 'Program Director / PMO Lead',
    weight: 0.10,
    description: 'Executive sponsorship, speed of design sign-off, and strict change control cadence.'
  },
];

export const PILLAR_QUESTIONS: Record<string, Question[]> = {
  functional: [
    {
      text: 'Business Process Alignment to Oracle Modern Best Practice (MBP)',
      options: [
        { label: 'High Adoption (MBP Vanilla Standard)', score: 1, desc: '90%+ out-of-the-box standard processes, minimal variance' },
        { label: 'Minor Localized Variances', score: 2, desc: 'Adopt standard with isolated country/entity nuances (<15% variance)' },
        { label: 'Moderate Custom Workflows & Requirements', score: 3, desc: 'Significant policy variances requiring custom approvals & BPM logic' },
        { label: 'Heavy Legacy Process Replication', score: 4, desc: 'Insistence on cloning legacy on-prem custom screens and behaviors' }
      ]
    },
    {
      text: 'Multi-Entity, SCM & Intercompany Operating Model',
      options: [
        { label: 'Single Entity / Domestic Operations', score: 1, desc: 'One country, single operating currency, no intercompany trade' },
        { label: 'Multi-Entity Domestic with Light Intercompany', score: 2, desc: '2-5 entities, standard intercompany journal/invoicing' },
        { label: 'Global Multi-Currency with Supply Chain Transfers', score: 3, desc: 'Multi-country, internal drop-ships, transfer pricing rules' },
        { label: 'Complex Global Matrix, Multi-Tier 3PL & Contract Mfg', score: 4, desc: 'Complex global VAT/GST, multi-currency, outsourced tolling' }
      ]
    }
  ],
  technical: [
    {
      text: 'Integration Density & Oracle Integration Cloud (OIC) Footprint',
      options: [
        { label: 'Low (<8 simple batch integrations)', score: 1, desc: 'Standard pre-built adapters, file-based FTP exchanges' },
        { label: 'Moderate (8-20 mixed REST/Batch interfaces)', score: 2, desc: 'Mix of standard cloud endpoints, Banks, and third-party tools' },
        { label: 'High (21-45 real-time bidirectional endpoints)', score: 3, desc: 'OIC orchestrations, event subscriptions, custom error handlers' },
        { label: 'Mission-Critical (>45 legacy & ESB interfaces)', score: 4, desc: 'High-volume syncs, complex payload transforms, MQ/Kafka adapters' }
      ]
    },
    {
      text: 'Custom Extensions, Visual Builder (VBCS) & PaaS Scope',
      options: [
        { label: 'Standard Out-of-the-Box Config Only', score: 1, desc: 'Page Composer, DFFs, Sandboxes, Guided Journeys only' },
        { label: 'Minor Visual Builder Studio / Business Rules', score: 2, desc: 'Field-level visibility rules, autocomplete rules, branding' },
        { label: 'Dedicated Custom VBCS SaaS Extensions', score: 3, desc: 'Custom portal/apps embedded in Cloud ERP with REST callbacks' },
        { label: 'Extensive Autonomous PaaS / OCI Cloud Native Builds', score: 4, desc: 'Custom microservices, custom database schemas, external portals' }
      ]
    }
  ],
  data: [
    {
      text: 'Source Legacy Landscape & Data Cleanliness',
      options: [
        { label: 'Single Modern ERP (Clean, Structured Data)', score: 1, desc: 'Pre-cleansed master records, single source of truth' },
        { label: '2-3 Known Legacy Databases with Moderate Debt', score: 2, desc: 'Standard deduplication required for Suppliers and Items' },
        { label: 'Disparate Legacy Systems & Multiple M&A Silos', score: 3, desc: 'Conflicting customer/item masters, heavy ETL enrichment required' },
        { label: 'Severe Data Debt / Unstructured Legacy Archives', score: 4, desc: 'Spreadsheets, corrupted legacy tables, no standardized identifiers' }
      ]
    },
    {
      text: 'Historical Data Migration Scope & Depth',
      options: [
        { label: 'Opening Balances & Open Transactions Only', score: 1, desc: 'Trial balances, open POs, open AP/AR, inventory snapshot' },
        { label: 'Opening Balances + 1 Prior Year GL Summary', score: 2, desc: 'Monthly summary balances for comparative financial reporting' },
        { label: 'Full 2-Year Detailed Transactional History', score: 3, desc: 'Multi-year detail across AP, AR, and PO lines for audit tracking' },
        { label: 'Multi-Year Detailed History & Custom Data Lake Archive', score: 4, desc: '7-year historical conversion with custom retrieval portal' }
      ]
    }
  ],
  ocm: [
    {
      text: 'Organizational Change Appetite & Cultural Alignment',
      options: [
        { label: 'Proactive, Cloud-Forward Leadership & Culture', score: 1, desc: 'Eager user base, proactive executive communications' },
        { label: 'Supportive with Normal Resistance Pockets', score: 2, desc: 'Standard change management programs sufficient' },
        { label: 'High Skepticism & Entrenched Legacy Habits', score: 3, desc: 'Users protective of legacy screens; requires intensive enablement' },
        { label: 'Significant Resistance & Fragmented Stakeholders', score: 4, desc: 'Union/regional opposition, executive misalignment on scope' }
      ]
    },
    {
      text: 'Client Subject Matter Expert (SME) Dedication',
      options: [
        { label: 'Fully Dedicated Core Team (>80% allocation)', score: 1, desc: 'Backfilled positions, immediate design & testing availability' },
        { label: 'Adequately Available Core Team (50-80% allocation)', score: 2, desc: 'Dedicated during key workshops, CRPs, and UAT' },
        { label: 'Part-Time SMEs (25-50% allocation, dual-hatted)', score: 3, desc: 'Day jobs compete with project deliverables; scheduling delays' },
        { label: 'Severely Constrained SMEs (<25% availability)', score: 4, desc: 'No backfill, high burnout risk, frequent workshop cancellations' }
      ]
    }
  ],
  governance: [
    {
      text: 'Program Decision Velocity & Escalation Protocol',
      options: [
        { label: 'Rapid (<48 hours design decisions)', score: 1, desc: 'Empowered project sponsor, swift sign-off on design open items' },
        { label: 'Standard (3-5 business days)', score: 2, desc: 'Steering committee resolves escalations within weekly cadence' },
        { label: 'Slow (1-2 weeks per major decision)', score: 3, desc: 'Multiple review boards, consensus-seeking culture' },
        { label: 'Paralysis / Bureaucratic Delays (>2 weeks)', score: 4, desc: 'Frequent reopening of previously agreed design baselines' }
      ]
    },
    {
      text: 'Scope Control & PMO Baseline Maturity',
      options: [
        { label: 'Strict Scope Governance with Formal Change Control', score: 1, desc: 'Clear boundaries, any variance goes through contractual CR' },
        { label: 'Defined PMO Process with Moderate Flexibility', score: 2, desc: 'Balanced management of minor trade-offs vs change orders' },
        { label: 'Fluid Scope / Frequent Scope Creep Requests', score: 3, desc: 'Informal commitments made in workshops causing scope friction' },
        { label: 'Uncontrolled Scope / Continuous Baseline Shifts', score: 4, desc: 'No formal gating; baseline constantly moving during build' }
      ]
    }
  ]
};

export const ORACLE_PATCH_COHORTS: Record<PodCohort, PodCohortInfo> = {
  A: {
    name: 'Cohort A (Oracle Month 1)',
    months: [1, 4, 7, 10], // Feb, May, Aug, Nov
    description: 'Quarterly updates applied in February (24A), May (24B), August (24C), November (24D)',
    typicalCadence: 'Non-Prod 1st Friday, Prod 3rd Friday of Month 1'
  },
  B: {
    name: 'Cohort B (Oracle Month 2)',
    months: [0, 3, 6, 9], // Jan, Apr, Jul, Oct
    description: 'Quarterly updates applied in January (24A), April (24B), July (24C), October (24D)',
    typicalCadence: 'Non-Prod 1st Friday, Prod 3rd Friday of Month 2 (Most Common)'
  },
  C: {
    name: 'Cohort C (Oracle Month 3)',
    months: [2, 5, 8, 11], // Mar, Jun, Sep, Dec
    description: 'Quarterly updates applied in March (24A), June (24B), September (24C), December (24D)',
    typicalCadence: 'Non-Prod 1st Friday, Prod 3rd Friday of Month 3'
  }
};

// Explicit Oracle Implementation Phases (Starting with 2-week mandatory Client Enablement)
export const IMPLEMENTATION_PHASES: ImplementationPhase[] = [
  {
    id: 'phase_enablement',
    name: '1. Client Enablement',
    code: 'ENABLE',
    startWeekPct: 0.0,
    endWeekPct: 0.06,
    mandatoryWeeks: 2,
    color: '#6366f1',
    description: 'Mandatory 2-week client foundation: Pod provisioning, Baseline Security, PMO setup, Core team Oracle Cloud training, and environment release calendar agreement.',
    deliverables: ['Project Charter & RACI', 'Pod Environment Release Calendar', 'Client Core Team Enablement Training', 'Initial Sandbox Provisioning & Access']
  },
  {
    id: 'phase_design',
    name: '2. Enterprise Design',
    code: 'DESIGN',
    startWeekPct: 0.06,
    endWeekPct: 0.28,
    color: '#0ea5e9',
    description: 'Modern Best Practice walkthroughs, Enterprise Structure & COA definition, gap analysis, and Future State Solution Blueprints.',
    deliverables: ['Enterprise Structure & COA Design', 'Business Process Blueprints', 'CEMLI / RICEFW Inventory & Specs', 'Data Conversion Strategy']
  },
  {
    id: 'phase_build',
    name: '3. Build, Configure & Unit Iterations',
    code: 'BUILD',
    startWeekPct: 0.24,
    endWeekPct: 0.58,
    color: '#10b981',
    description: 'Gold configuration setup sprints, Conference Room Pilot 1, OIC integration development, BIP/OTBI reporting, Fast Formulas, and Mock Data Migration 1.',
    deliverables: ['Gold Config Workbook', 'CRP1 Execution & Sign-off', 'OIC Integration Builds', 'Mock Data Migration 1 Results']
  },
  {
    id: 'phase_test_1',
    name: '4. Business Testing 1 - SIT',
    code: 'TEST-1',
    startWeekPct: 0.54,
    endWeekPct: 0.72,
    color: '#f59e0b',
    description: 'System Integration Testing (SIT / CRP2), cross-module business process validation, third-party system interface tests, and Mock Data Migration 2.',
    deliverables: ['SIT Traceability Matrix & Sign-off', 'CRP2 Integrated Prototype Sign-off', 'Mock Data Migration 2 Report', 'Interface Regression Logs']
  },
  {
    id: 'phase_test_2',
    name: '5. Business Testing 2 - UAT',
    code: 'TEST-2',
    startWeekPct: 0.70,
    endWeekPct: 0.86,
    color: '#ea580c',
    description: 'User Acceptance Testing (UAT / CRP3), Business Simulation Day-in-the-Life, Performance & Volume Testing, and Mock Data Migration 3 Cutover Rehearsal.',
    deliverables: ['UAT Business Sign-off', 'Mock 3 Dress Rehearsal Runbook', 'Performance & Load Test Report', 'Operational Readiness Review']
  },
  {
    id: 'phase_cutover',
    name: '6. Cutover & Go-Live Production Switch',
    code: 'CUTOVER',
    startWeekPct: 0.84,
    endWeekPct: 0.92,
    color: '#ef4444',
    description: 'Go/No-Go Executive Gateway, Production environment freeze, final delta migration loads, DNS/Pod cutover, and production go-live switch.',
    deliverables: ['Go/No-Go Executive Decision Gate', 'Production Cutover Execution', 'Delta Conversion Sign-off', 'Production Go-Live Sign-off']
  },
  {
    id: 'phase_hypercare',
    name: '7. Hypercare & Transition to Operations',
    code: 'HYPER',
    startWeekPct: 0.90,
    endWeekPct: 1.0,
    color: '#8b5cf6',
    description: 'Command center stabilization, first period-end close support, priority defect triage, and formal handover to AMS / Operations.',
    deliverables: ['1st Period-End Close Support', 'Hypercare Incident Burn-Down', 'Operational Handover Dossier', 'Final Project Closeout']
  }
];

export const WORKSTREAMS_CATALOG: Workstream[] = [
  {
    id: 'ws_func_erp',
    name: 'ERP Financials Track',
    category: 'Functional',
    startPct: 0.04,
    endPct: 0.88,
    color: '#2563eb',
    leadRole: 'Lead Financials Architect',
    effortShare: 0.22,
    deliverables: ['Chart of Accounts', 'AP/AR/GL Setup', 'Financial Reporting / FRS', 'Tax Engine Rules']
  },
  {
    id: 'ws_func_scm',
    name: 'SCM & Operations Track',
    category: 'Functional',
    startPct: 0.04,
    endPct: 0.88,
    color: '#0284c7',
    leadRole: 'Principal SCM Architect',
    effortShare: 0.20,
    deliverables: ['Item Master & Orgs', 'Order Orchestration', 'Cost Management', 'Mfg Work Definitions']
  },
  {
    id: 'ws_func_hcm',
    name: 'HCM & Payroll Track',
    category: 'Functional',
    startPct: 0.04,
    endPct: 0.88,
    color: '#059669',
    leadRole: 'HCM & Payroll Lead',
    effortShare: 0.16,
    deliverables: ['Work Structures', 'Payroll Element Architecture', 'Fast Formulas', 'Absence Accruals']
  },
  {
    id: 'ws_tech_oic',
    name: 'Technical, OIC & Extensions',
    category: 'Technical',
    startPct: 0.12,
    endPct: 0.86,
    color: '#7c3aed',
    leadRole: 'OIC Integration Lead',
    effortShare: 0.15,
    deliverables: ['OIC Integrations', 'BIP Reports & Extracts', 'VBCS Extensions', 'BPM Workflow Approvals']
  },
  {
    id: 'ws_data_conv',
    name: 'Data Migration & Quality',
    category: 'Data',
    startPct: 0.06,
    endPct: 0.92,
    color: '#d97706',
    leadRole: 'Data Migration Lead',
    effortShare: 0.11,
    deliverables: ['FBDI/HDL Data Specs', 'Mock 1, 2 & 3 Conversions', 'Reconciliation Reports', 'Final Cutover Loads']
  },
  {
    id: 'ws_test_qa',
    name: 'Testing & QA Assurance',
    category: 'Testing',
    startPct: 0.32,
    endPct: 0.90,
    color: '#ea580c',
    leadRole: 'QA Test Lead',
    effortShare: 0.06,
    deliverables: ['SIT Scenarios', 'UAT Test Scripts', 'Defect Management', 'Perf & Volume Tests']
  },
  {
    id: 'ws_ocm_train',
    name: 'Change Enablement & Training',
    category: 'Change',
    startPct: 0.0,
    endPct: 1.0,
    isParallel: true,
    color: '#db2777',
    leadRole: 'OCM Lead',
    effortShare: 0.05,
    deliverables: ['Client Enablement Bootcamps', 'Change Impact Assessment', 'Role-Based Training Modules', 'Super User Network']
  },
  {
    id: 'ws_gov_steerco',
    name: 'Program Governance & SteerCo Oversight',
    category: 'Management',
    startPct: 0.0,
    endPct: 1.0,
    isParallel: true,
    color: '#0f172a',
    leadRole: 'Program Director / Engagement Lead',
    effortShare: 0.06,
    deliverables: [
      'Executive SteerCo Decision Packs',
      'Delegation of Authority (DoA) Controls',
      'Stage-Gate Audit Sign-Offs',
      'Program Change Control Board (CCB)',
      'Executive Escalation Resolution Engine'
    ]
  },
  {
    id: 'ws_pmo_gov',
    name: 'PMO & Pod Environment Operations',
    category: 'Management',
    startPct: 0.0,
    endPct: 1.0,
    isParallel: true,
    color: '#475569',
    leadRole: 'Senior PMO / Release Manager',
    effortShare: 0.05,
    deliverables: ['Project Master Schedule (IMS)', 'Quarterly Patch Cadence Management', 'RAID Risk Register', 'Blackout & Cutover Runbook']
  }
];

export const PROJECT_MILESTONES: ProjectMilestone[] = [
  { id: 'm0', name: 'Client Enablement & Kickoff', code: 'M0-ENABLEMENT', weekOffsetPct: 0.03, type: 'gate', description: 'Mandatory 2-wk enablement complete, sandbox provisioned.' },
  { id: 'm1', name: 'Enterprise Design & COA Sign-off', code: 'M1-DESIGN-GATE', weekOffsetPct: 0.28, type: 'gate', description: 'Solution architecture & COA baseline frozen.' },
  { id: 'm2', name: 'Conference Room Pilot 1 (CRP1)', code: 'M2-CRP1', weekOffsetPct: 0.44, type: 'crp', description: 'Core functional prototype validation.' },
  { id: 'm3', name: 'Business Test 1 (SIT / CRP2) Exit', code: 'M3-BT1-SIT', weekOffsetPct: 0.70, type: 'test', description: 'All end-to-end interface flows & SIT passed.' },
  { id: 'm4', name: 'Business Test 2 (UAT Sign-off)', code: 'M4-BT2-UAT', weekOffsetPct: 0.84, type: 'test', description: 'Business SMEs accept system in UAT.' },
  { id: 'm5', name: 'Cutover Dress Rehearsal (Mock 3)', code: 'M5-MOCK3', weekOffsetPct: 0.88, type: 'cutover', description: 'Timed rehearsal of production cutover.' },
  { id: 'm6', name: 'Go / No-Go Executive Gate', code: 'M6-GO-NOGO', weekOffsetPct: 0.91, type: 'gate', description: 'Final leadership approval for production switch.' },
  { id: 'm7', name: 'GO-LIVE Production Switch', code: 'M7-GOLIVE', weekOffsetPct: 0.92, type: 'golive', description: 'Production operational for business.' },
  { id: 'm8', name: 'Hypercare Exit & AMS Handover', code: 'M8-HANDOVER', weekOffsetPct: 1.0, type: 'gate', description: 'Period 1 close completed, transition to AMS.' }
];

export const ROLE_RATES: RoleRate[] = [
  {
    role: 'Program Director / Engagement Lead',
    category: 'Strategic',
    onshoreBill: 240,
    onshoreCost: 145,
    nearshoreBill: 160,
    nearshoreCost: 95,
    offshoreBill: 90,
    offshoreCost: 45,
    defaultMixShare: 0.06
  },
  {
    role: 'Lead Enterprise Solution Architect',
    category: 'Strategic',
    onshoreBill: 210,
    onshoreCost: 130,
    nearshoreBill: 140,
    nearshoreCost: 80,
    offshoreBill: 75,
    offshoreCost: 35,
    defaultMixShare: 0.10
  },
  {
    role: 'Senior Functional Consultant (ERP/SCM/HCM)',
    category: 'Functional',
    onshoreBill: 175,
    onshoreCost: 110,
    nearshoreBill: 105,
    nearshoreCost: 60,
    offshoreBill: 45,
    offshoreCost: 20,
    defaultMixShare: 0.34
  },
  {
    role: 'Principal Technical Architect (OIC/PaaS)',
    category: 'Technical',
    onshoreBill: 190,
    onshoreCost: 120,
    nearshoreBill: 120,
    nearshoreCost: 70,
    offshoreBill: 55,
    offshoreCost: 25,
    defaultMixShare: 0.12
  },
  {
    role: 'Technical Developer (OIC/BIP/VBCS)',
    category: 'Technical',
    onshoreBill: 140,
    onshoreCost: 85,
    nearshoreBill: 85,
    nearshoreCost: 48,
    offshoreBill: 38,
    offshoreCost: 16,
    defaultMixShare: 0.18
  },
  {
    role: 'Data Migration & ETL Specialist',
    category: 'Technical',
    onshoreBill: 145,
    onshoreCost: 90,
    nearshoreBill: 88,
    nearshoreCost: 50,
    offshoreBill: 36,
    offshoreCost: 15,
    defaultMixShare: 0.10
  },
  {
    role: 'Change Management & Training Consultant',
    category: 'Support',
    onshoreBill: 150,
    onshoreCost: 95,
    nearshoreBill: 90,
    nearshoreCost: 52,
    offshoreBill: 40,
    offshoreCost: 18,
    defaultMixShare: 0.05
  },
  {
    role: 'QA & Test Automation Specialist',
    category: 'Support',
    onshoreBill: 130,
    onshoreCost: 80,
    nearshoreBill: 75,
    nearshoreCost: 42,
    offshoreBill: 32,
    offshoreCost: 14,
    defaultMixShare: 0.05
  }
];
