import {
  ProjectScenario,
  CriticalPathData,
  CriticalPathActivity,
  EnvironmentLandscapeData,
  PodEnvironment,
  DataCutoverData,
  DataMigrationMockCycle,
  CutoverWeekendEntity,
  MonteCarloSimulationData,
  MonteCarloCurvePoint,
  CoStaffingModel,
  CoStaffingPhase,
  LeadershipGapsReport
} from '../types';
import { ORACLE_PATCH_COHORTS } from './oraclePhases';

export function calculateLeadershipGaps(
  scenario: ProjectScenario,
  totalHours: number,
  contingencyPct: number,
  deliveryCost: number,
  deliveryRevenue: number,
  weightedComplexityScore: number,
  netClientModifier: number
): LeadershipGapsReport {
  const totalWeeks = scenario.projectWeeks;
  const startDate = new Date(scenario.targetStartDate || '2026-09-01');
  const hasPayroll = scenario.selectedModules.includes('hcm_payroll');
  const hasSCM = scenario.selectedModules.some(m => m.startsWith('scm_'));
  const hasERP = scenario.selectedModules.some(m => m.startsWith('erp_'));
  const oicCount = scenario.scaleDrivers.tech_oic || 4;
  const dataObjectsCount = scenario.scaleDrivers.tech_data_objects || 8;

  // ----------------------------------------------------
  // GAP 1: Critical Path & Slack/Float Network Analysis (CPM)
  // ----------------------------------------------------
  const activities: CriticalPathActivity[] = [
    {
      id: 'ACT-01',
      name: 'Client Enablement & Project Charter Sign-off',
      workstream: 'Management',
      phase: 'Client Enablement',
      durationWeeks: 2,
      earlyStartWeek: 1,
      earlyFinishWeek: 2,
      lateStartWeek: 1,
      lateFinishWeek: 2,
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: [],
      bottleneckRisk: 'Low',
      oracleImpact: 'Oracle True Cloud Method setup, SteerCo charter, Cloud instance credentials handshake.'
    },
    {
      id: 'ACT-02',
      name: 'Global Enterprise Structure & COA Design Blueprint',
      workstream: 'Functional',
      phase: 'Enterprise Design',
      durationWeeks: Math.max(3, Math.round(totalWeeks * 0.15)),
      earlyStartWeek: 3,
      earlyFinishWeek: 2 + Math.max(3, Math.round(totalWeeks * 0.15)),
      lateStartWeek: 3,
      lateFinishWeek: 2 + Math.max(3, Math.round(totalWeeks * 0.15)),
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-01'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'Chart of Accounts (COA) segment freeze, Ledgers, Legal Entities & Primary Book structure.'
    },
    {
      id: 'ACT-03',
      name: 'OCM Stakeholder Impact & Readiness Strategy',
      workstream: 'Change',
      phase: 'Enterprise Design',
      durationWeeks: Math.max(2, Math.round(totalWeeks * 0.10)),
      earlyStartWeek: 3,
      earlyFinishWeek: 2 + Math.max(2, Math.round(totalWeeks * 0.10)),
      lateStartWeek: 5,
      lateFinishWeek: 4 + Math.max(2, Math.round(totalWeeks * 0.10)),
      totalFloatDays: 14,
      freeFloatDays: 10,
      isCritical: false,
      dependencies: ['ACT-01'],
      bottleneckRisk: 'Low',
      oracleImpact: 'Change Champions network and department impact assessments.'
    },
    {
      id: 'ACT-04',
      name: 'Golden Master Configuration in DEV1',
      workstream: 'Functional',
      phase: 'Build & Unit Test',
      durationWeeks: Math.max(4, Math.round(totalWeeks * 0.22)),
      earlyStartWeek: 3 + Math.max(3, Math.round(totalWeeks * 0.15)),
      earlyFinishWeek: 2 + Math.max(3, Math.round(totalWeeks * 0.15)) + Math.max(4, Math.round(totalWeeks * 0.22)),
      lateStartWeek: 3 + Math.max(3, Math.round(totalWeeks * 0.15)),
      lateFinishWeek: 2 + Math.max(3, Math.round(totalWeeks * 0.15)) + Math.max(4, Math.round(totalWeeks * 0.22)),
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-02'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'Financials, SCM & HCM functional setups, BPM approval rules, and SLA accounting derivations.'
    },
    {
      id: 'ACT-05',
      name: 'OIC Integrations & CEMLI Extensions Build (DEV2)',
      workstream: 'Technical',
      phase: 'Build & Unit Test',
      durationWeeks: Math.max(4, Math.round(totalWeeks * 0.20)),
      earlyStartWeek: 3 + Math.max(3, Math.round(totalWeeks * 0.15)),
      earlyFinishWeek: 2 + Math.max(3, Math.round(totalWeeks * 0.15)) + Math.max(4, Math.round(totalWeeks * 0.20)),
      lateStartWeek: 4 + Math.max(3, Math.round(totalWeeks * 0.15)),
      lateFinishWeek: 3 + Math.max(3, Math.round(totalWeeks * 0.15)) + Math.max(4, Math.round(totalWeeks * 0.20)),
      totalFloatDays: 7,
      freeFloatDays: 5,
      isCritical: false,
      dependencies: ['ACT-02'],
      bottleneckRisk: 'Elevated',
      oracleImpact: 'Oracle Integration Cloud (OIC) adapters, REST/SOAP endpoints, and PaaS VBCS extensions.'
    },
    {
      id: 'ACT-06',
      name: 'Iterative Data Migration Mock 2 (70% Volume Transform)',
      workstream: 'Data',
      phase: 'Build & Unit Test',
      durationWeeks: 3,
      earlyStartWeek: Math.round(totalWeeks * 0.42),
      earlyFinishWeek: Math.round(totalWeeks * 0.42) + 3,
      lateStartWeek: Math.round(totalWeeks * 0.42),
      lateFinishWeek: Math.round(totalWeeks * 0.42) + 3,
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-04'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'FBDI / HDL data extraction, transformation, duplicate resolution, and load validation.'
    },
    {
      id: 'ACT-07',
      name: 'Custom OTBI & BIP Reports Development',
      workstream: 'Technical',
      phase: 'Build & Unit Test',
      durationWeeks: Math.max(3, Math.round(totalWeeks * 0.14)),
      earlyStartWeek: Math.round(totalWeeks * 0.35),
      earlyFinishWeek: Math.round(totalWeeks * 0.35) + Math.max(3, Math.round(totalWeeks * 0.14)),
      lateStartWeek: Math.round(totalWeeks * 0.40),
      lateFinishWeek: Math.round(totalWeeks * 0.40) + Math.max(3, Math.round(totalWeeks * 0.14)),
      totalFloatDays: 18,
      freeFloatDays: 14,
      isCritical: false,
      dependencies: ['ACT-04'],
      bottleneckRisk: 'Low',
      oracleImpact: 'Operational BI Publisher layouts, e-text payment templates, and management OTBI dashboards.'
    },
    {
      id: 'ACT-08',
      name: 'Business Test 1: System Integration Testing (SIT in TEST)',
      workstream: 'Testing',
      phase: 'Business Test 1 (SIT)',
      durationWeeks: Math.max(3, Math.round(totalWeeks * 0.14)),
      earlyStartWeek: Math.round(totalWeeks * 0.52),
      earlyFinishWeek: Math.round(totalWeeks * 0.52) + Math.max(3, Math.round(totalWeeks * 0.14)),
      lateStartWeek: Math.round(totalWeeks * 0.52),
      lateFinishWeek: Math.round(totalWeeks * 0.52) + Math.max(3, Math.round(totalWeeks * 0.14)),
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-04', 'ACT-05', 'ACT-06'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'Cross-module E2E transaction flow (O2C, P2P, R2R, H2R) and automated OIC interface handoffs.'
    },
    {
      id: 'ACT-09',
      name: 'Business Test 2: User Acceptance Testing (UAT in STAGE)',
      workstream: 'Testing',
      phase: 'Business Test 2 (UAT)',
      durationWeeks: Math.max(3, Math.round(totalWeeks * 0.14)),
      earlyStartWeek: Math.round(totalWeeks * 0.68),
      earlyFinishWeek: Math.round(totalWeeks * 0.68) + Math.max(3, Math.round(totalWeeks * 0.14)),
      lateStartWeek: Math.round(totalWeeks * 0.68),
      lateFinishWeek: Math.round(totalWeeks * 0.68) + Math.max(3, Math.round(totalWeeks * 0.14)),
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-08'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'Client business SME end-to-end execution, defect triage, and formal SteerCo sign-off.'
    },
    {
      id: 'ACT-10',
      name: 'Dress Rehearsal Mock 3 (100% Volumetric Cutover in STAGE)',
      workstream: 'Data',
      phase: 'Cutover & Go-Live',
      durationWeeks: 2,
      earlyStartWeek: Math.round(totalWeeks * 0.84),
      earlyFinishWeek: Math.round(totalWeeks * 0.84) + 2,
      lateStartWeek: Math.round(totalWeeks * 0.84),
      lateFinishWeek: Math.round(totalWeeks * 0.84) + 2,
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-09'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'Full-scale weekend dry-run matching the exact 72-hour cutover schedule and fallback criteria.'
    },
    {
      id: 'ACT-11',
      name: 'End-User Training & Job Aid Distribution',
      workstream: 'Change',
      phase: 'Cutover & Go-Live',
      durationWeeks: 3,
      earlyStartWeek: Math.round(totalWeeks * 0.80),
      earlyFinishWeek: Math.round(totalWeeks * 0.80) + 3,
      lateStartWeek: Math.round(totalWeeks * 0.83),
      lateFinishWeek: Math.round(totalWeeks * 0.83) + 3,
      totalFloatDays: 12,
      freeFloatDays: 8,
      isCritical: false,
      dependencies: ['ACT-09'],
      bottleneckRisk: 'Low',
      oracleImpact: 'Train-the-trainer delivery, Guided Learning (OGL) journeys, and quick reference cards.'
    },
    {
      id: 'ACT-12',
      name: 'Production Cutover Weekend Execution & Live Launch',
      workstream: 'Management',
      phase: 'Cutover & Go-Live',
      durationWeeks: 1,
      earlyStartWeek: Math.round(totalWeeks * 0.89),
      earlyFinishWeek: Math.round(totalWeeks * 0.89) + 1,
      lateStartWeek: Math.round(totalWeeks * 0.89),
      lateFinishWeek: Math.round(totalWeeks * 0.89) + 1,
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-10', 'ACT-11'],
      bottleneckRisk: 'Critical',
      oracleImpact: 'Production pod unlock, open balances load, interface endpoint switchover, and Day-1 ledger open.'
    },
    {
      id: 'ACT-13',
      name: 'First Month-End Financial Close & Post Go-Live Hypercare',
      workstream: 'Management',
      phase: 'Hypercare & Adoption',
      durationWeeks: Math.max(3, totalWeeks - Math.round(totalWeeks * 0.90)),
      earlyStartWeek: Math.round(totalWeeks * 0.90) + 1,
      earlyFinishWeek: totalWeeks,
      lateStartWeek: Math.round(totalWeeks * 0.90) + 1,
      lateFinishWeek: totalWeeks,
      totalFloatDays: 0,
      freeFloatDays: 0,
      isCritical: true,
      dependencies: ['ACT-12'],
      bottleneckRisk: 'Elevated',
      oracleImpact: 'First period-end reconciliation, SLA run, payroll disbursement, and transition to Oracle AMS support.'
    }
  ];

  const criticalActivities = activities.filter(a => a.isCritical);
  const criticalPathLengthWeeks = totalWeeks;
  const zeroFloatCount = criticalActivities.length;
  const nearCriticalCount = activities.filter(a => !a.isCritical && a.totalFloatDays <= 7).length;

  const criticalPath: CriticalPathData = {
    criticalPathLengthWeeks,
    zeroFloatActivitiesCount: zeroFloatCount,
    nearCriticalActivitiesCount: nearCriticalCount,
    totalBufferDays: activities.reduce((acc, a) => acc + a.totalFloatDays, 0),
    longestPathSequence: criticalActivities.map(a => a.name),
    activities,
    pathEfficiencyPct: Math.round((zeroFloatCount / activities.length) * 100)
  };

  // ----------------------------------------------------
  // GAP 2: Multi-Instance Pod Environment Landscape & Refresh Sequencing
  // ----------------------------------------------------
  const cohortMonths = ORACLE_PATCH_COHORTS[scenario.podCohort].months;
  const quarterlyPatchWeeks: number[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const d = new Date(startDate.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
    if (cohortMonths.includes(d.getMonth()) && d.getDate() <= 14) {
      quarterlyPatchWeeks.push(w);
    }
  }

  const pods: PodEnvironment[] = [
    {
      podId: 'DEV1',
      name: 'DEV1 - Golden Master Configuration',
      purpose: 'Core application setup, Functional Unit Testing, Fast Formulas, and baseline Master Data catalog.',
      provisionWeek: 1,
      activeStartWeek: 1,
      activeEndWeek: Math.round(totalWeeks * 0.70),
      color: 'border-blue-500 bg-blue-50/50',
      p2tRefreshWindows: [
        { week: Math.round(totalWeeks * 0.45), label: 'Config Sync', impact: 'Propagate Golden Config to DEV2 & TEST' }
      ],
      lockoutWindows: [
        { startWeek: Math.round(totalWeeks * 0.50), endWeek: Math.round(totalWeeks * 0.52), reason: 'SIT Baseline Config Freeze', severity: 'hard_freeze' }
      ],
      quarterlyPatchWeeks
    },
    {
      podId: 'DEV2',
      name: 'DEV2 - OIC & CEMLI Integration Sandbox',
      purpose: 'Oracle Integration Cloud (OIC) endpoint testing, VBCS PaaS development, and 3rd-party API handshakes.',
      provisionWeek: 1,
      activeStartWeek: 2,
      activeEndWeek: Math.round(totalWeeks * 0.75),
      color: 'border-indigo-500 bg-indigo-50/50',
      p2tRefreshWindows: [
        { week: Math.round(totalWeeks * 0.35), label: 'T2D Refresh', impact: 'Refresh sample test payloads from DEV1' }
      ],
      lockoutWindows: [
        { startWeek: Math.round(totalWeeks * 0.65), endWeek: Math.round(totalWeeks * 0.67), reason: 'UAT Integration Freeze', severity: 'soft_freeze' }
      ],
      quarterlyPatchWeeks
    },
    {
      podId: 'TEST',
      name: 'TEST - System Integration Testing (SIT / CRP2)',
      purpose: 'End-to-end multi-module transaction verification, batch job scheduling, and Mock 1 & 2 data loads.',
      provisionWeek: 2,
      activeStartWeek: Math.round(totalWeeks * 0.30),
      activeEndWeek: Math.round(totalWeeks * 0.75),
      color: 'border-amber-500 bg-amber-50/50',
      p2tRefreshWindows: [
        { week: Math.round(totalWeeks * 0.48), label: 'Pre-SIT Refresh', impact: 'Full baseline configuration & master data wipe' }
      ],
      lockoutWindows: [
        { startWeek: Math.round(totalWeeks * 0.52), endWeek: Math.round(totalWeeks * 0.66), reason: 'Strict SIT Execution Lock', severity: 'hard_freeze' }
      ],
      quarterlyPatchWeeks
    },
    {
      podId: 'STAGE',
      name: 'STAGE - UAT, Performance & Dress Rehearsal',
      purpose: 'Business SME UAT sign-off, volume performance load testing, and 72-Hour Dress Rehearsal Mock 3.',
      provisionWeek: Math.round(totalWeeks * 0.40),
      activeStartWeek: Math.round(totalWeeks * 0.60),
      activeEndWeek: Math.round(totalWeeks * 0.90),
      color: 'border-emerald-500 bg-emerald-50/50',
      p2tRefreshWindows: [
        { week: Math.round(totalWeeks * 0.66), label: 'Pre-UAT P2T Refresh', impact: 'Mirror production sizing & sanitize employee PII data' }
      ],
      lockoutWindows: [
        { startWeek: Math.round(totalWeeks * 0.68), endWeek: Math.round(totalWeeks * 0.82), reason: 'UAT Execution & Defect Freeze', severity: 'hard_freeze' },
        { startWeek: Math.round(totalWeeks * 0.84), endWeek: Math.round(totalWeeks * 0.86), reason: 'Mock 3 Cutover Rehearsal Lock', severity: 'hard_freeze' }
      ],
      quarterlyPatchWeeks
    },
    {
      podId: 'PROD',
      name: 'PROD - Production Live Instance',
      purpose: 'Go-Live cutover execution, historical open balance conversion, and Day-1 production operations.',
      provisionWeek: Math.round(totalWeeks * 0.50),
      activeStartWeek: Math.round(totalWeeks * 0.85),
      activeEndWeek: totalWeeks,
      color: 'border-rose-500 bg-rose-50/50',
      p2tRefreshWindows: [],
      lockoutWindows: [
        { startWeek: Math.round(totalWeeks * 0.88), endWeek: totalWeeks, reason: 'Strict Production Change Control Board (CCB)', severity: 'hard_freeze' }
      ],
      quarterlyPatchWeeks
    }
  ];

  const environmentLandscape: EnvironmentLandscapeData = {
    pods,
    goldenConfigPod: 'DEV1',
    totalP2TRefreshes: pods.reduce((acc, p) => acc + p.p2tRefreshWindows.length, 0),
    testingLockoutWeeksCount: pods.reduce((acc, p) => acc + p.lockoutWindows.length, 0),
    riskAlerts: [
      `Oracle Quarterly Patch Cohort ${scenario.podCohort} overlaps with non-prod testing in ${quarterlyPatchWeeks.length} designated patch weeks.`,
      'P2T data masking protocol must be executed prior to STAGE UAT refresh to satisfy GDPR/SOX compliance.'
    ]
  };

  // ----------------------------------------------------
  // GAP 3: Iterative Data Migration Cutovers & Mock Velocity
  // ----------------------------------------------------
  const baseEntitiesCount = Math.max(6, dataObjectsCount);
  const totalEstimatedRecords = Math.max(150000, 
    (scenario.scaleDrivers.hcm_hc || 2000) * 12 + 
    (scenario.scaleDrivers.scm_inv || 5000) * 8 + 
    (scenario.scaleDrivers.fin_ent || 4) * 25000
  );

  const mockCycles: DataMigrationMockCycle[] = [
    {
      id: 'MOCK-1',
      name: 'Mock 1: Data Profiling & Schema Validation',
      phase: 'Enterprise Design / Early Build',
      targetWeek: Math.round(totalWeeks * 0.38),
      targetEnvironment: 'DEV1 / TEST',
      scopeVolumePct: 30,
      totalEstimatedRecords: Math.round(totalEstimatedRecords * 0.30),
      throughputPerHour: 8500,
      estimatedDurationHours: Math.round((totalEstimatedRecords * 0.30) / 8500) + 12,
      keyDataEntities: ['Chart of Accounts Segment Values', 'Supplier Master', 'Customer Master', 'Item Master Catalog'],
      signOffCriteria: '100% Schema validation, 0 fatal FBDI errors on primary master data, field mapping approved.',
      readinessStatus: 'Planned'
    },
    {
      id: 'MOCK-2',
      name: 'Mock 2: End-to-End Transform & SIT Validation',
      phase: 'Build & Unit Test',
      targetWeek: Math.round(totalWeeks * 0.50),
      targetEnvironment: 'TEST (SIT Pod)',
      scopeVolumePct: 70,
      totalEstimatedRecords: Math.round(totalEstimatedRecords * 0.70),
      throughputPerHour: 14000,
      estimatedDurationHours: Math.round((totalEstimatedRecords * 0.70) / 14000) + 18,
      keyDataEntities: ['All Masters', 'Open AP Invoices', 'Open AR Invoices', 'Open POs', 'Item Costing', 'Worker Person History'],
      signOffCriteria: '98%+ load success rate, trial balance reconciled to within $0 variance, integration data keys verified.',
      readinessStatus: 'Critical Milestone'
    },
    {
      id: 'MOCK-3',
      name: 'Mock 3 / Dress Rehearsal: 100% Volumetric Cutover',
      phase: 'Cutover & Go-Live Prep',
      targetWeek: Math.round(totalWeeks * 0.84),
      targetEnvironment: 'STAGE (Prod-Sized Pod)',
      scopeVolumePct: 100,
      totalEstimatedRecords: totalEstimatedRecords,
      throughputPerHour: 22000,
      estimatedDurationHours: Math.round(totalEstimatedRecords / 22000) + 24,
      keyDataEntities: ['100% Full Production Volume Masters & Open Transactional Balances', 'Year-to-Date GL Balances', 'Fixed Assets NBV', 'Open Sales Orders'],
      signOffCriteria: '100% cutover script executed within strict 72-hour window, SteerCo Go/No-Go rehearsal sign-off.',
      readinessStatus: 'Go-Live Rehearsal'
    }
  ];

  const criticalEntities: CutoverWeekendEntity[] = [
    { name: 'Supplier Master & Bank Accounts', method: 'FBDI', volume: 15000, loadVelocityPerHour: 5000, estimatedHours: 3.0, sequenceOrder: 1, dependency: 'COA Golden Setup' },
    { name: 'Customer Master & Accounts/Sites', method: 'FBDI', volume: 45000, loadVelocityPerHour: 7500, estimatedHours: 6.0, sequenceOrder: 2, dependency: 'Payment Terms & Tax Regimes' },
    { name: 'Item Master & Sub-Inventory Orgs', method: 'FBDI', volume: 30000, loadVelocityPerHour: 6000, estimatedHours: 5.0, sequenceOrder: 3, dependency: 'Units of Measure & Categories' },
    { name: 'Fixed Assets Books & Additions', method: 'FBDI', volume: 12000, loadVelocityPerHour: 4000, estimatedHours: 3.0, sequenceOrder: 4, dependency: 'Asset Categories & Prorate Calendars' },
    { name: 'Open Purchase Orders & Blanket Agreements', method: 'FBDI', volume: 8000, loadVelocityPerHour: 2000, estimatedHours: 4.0, sequenceOrder: 5, dependency: 'Suppliers & Items Loaded' },
    { name: 'Open AP Invoices (Standard & Prepayments)', method: 'FBDI', volume: 18000, loadVelocityPerHour: 3500, estimatedHours: 5.2, sequenceOrder: 6, dependency: 'Suppliers & POs Loaded' },
    { name: 'Open AR Transactions & Line Items', method: 'FBDI', volume: 28000, loadVelocityPerHour: 4500, estimatedHours: 6.2, sequenceOrder: 7, dependency: 'Customers & Auto-Invoice Setup' },
    { name: 'Inventory On-Hand Balances & Lots', method: 'FBDI', volume: 22000, loadVelocityPerHour: 5500, estimatedHours: 4.0, sequenceOrder: 8, dependency: 'Items & Sub-Inventories Active' },
    { name: 'GL Historical Trial Balances & Period Balances', method: 'FBDI', volume: 95000, loadVelocityPerHour: 18000, estimatedHours: 5.3, sequenceOrder: 9, dependency: 'All Subledgers Closed' },
    { name: 'Post-Load Balance Verification & Subledger Recon', method: 'Manual Setup', volume: 1, loadVelocityPerHour: 1, estimatedHours: 8.0, sequenceOrder: 10, dependency: 'All Data Feeds Complete' }
  ];

  const cutoverWeekendHoursAvailable = 72; // Friday 18:00 to Monday 18:00
  const cutoverEstimatedTotalHours = criticalEntities.reduce((acc, e) => acc + e.estimatedHours, 0) + 6.5; // Include 6.5h for pod unlock and user provisioning
  const cutoverContingencyBufferHours = cutoverWeekendHoursAvailable - cutoverEstimatedTotalHours;

  const dataCutover: DataCutoverData = {
    mockCycles,
    cutoverWeekendHoursAvailable,
    cutoverEstimatedTotalHours: Math.round(cutoverEstimatedTotalHours * 10) / 10,
    cutoverContingencyBufferHours: Math.round(cutoverContingencyBufferHours * 10) / 10,
    cutoverFeasibilityStatus: cutoverContingencyBufferHours > 16 ? 'Comfortable' : cutoverContingencyBufferHours > 6 ? 'Tight (<12h Buffer)' : 'High Risk (Exceeds 72h)',
    parallelPayrollRuns: hasPayroll ? [
      { runNumber: 1, week: Math.round(totalWeeks * 0.72), description: 'Parallel Payroll Run 1 (PPR1) - Retroactive month comparison vs legacy gross-to-net', passThresholdPct: 95 },
      { runNumber: 2, week: Math.round(totalWeeks * 0.80), description: 'Parallel Payroll Run 2 (PPR2) - Live payroll cycle comparison with statutory tax slips', passThresholdPct: 99 },
      { runNumber: 3, week: Math.round(totalWeeks * 0.88), description: 'Dual Run / Final Parallel - Live cutover verification with 100% banking EFT match', passThresholdPct: 99.9 }
    ] : [],
    criticalEntities
  };

  // ----------------------------------------------------
  // GAP 4: Monte Carlo Schedule & Effort Confidence Simulation
  // ----------------------------------------------------
  const iterations = 10000;
  // Variance drivers: Complexity, Client Modifiers, Scale, Pod Patches
  const baseSimHours = totalHours / (1 + contingencyPct);
  const simStdDev = baseSimHours * (0.12 + (weightedComplexityScore / 100) * 0.08 + (netClientModifier - 1.0) * 0.06);

  // Approximate Normal / Lognormal percentiles
  const p10Hours = Math.round(baseSimHours - 1.28 * simStdDev);
  const p50Hours = Math.round(baseSimHours);
  const p80Hours = Math.round(baseSimHours + 0.84 * simStdDev);
  const p90Hours = Math.round(baseSimHours + 1.28 * simStdDev);
  const p95Hours = Math.round(baseSimHours + 1.64 * simStdDev);

  const blendedRate = deliveryRevenue / (totalHours || 1);
  const p10Weeks = Math.max(20, Math.round(totalWeeks * 0.88));
  const p50Weeks = totalWeeks;
  const p80Weeks = Math.round(totalWeeks * 1.15);
  const p90Weeks = Math.round(totalWeeks * 1.25);

  const simulationCurve: MonteCarloCurvePoint[] = [
    { percentile: 10, durationWeeks: p10Weeks, hours: p10Hours, cost: Math.round(p10Hours * blendedRate), probabilityDensity: 0.15, cumulativeProbability: 0.10 },
    { percentile: 25, durationWeeks: Math.round(totalWeeks * 0.94), hours: Math.round(baseSimHours - 0.67 * simStdDev), cost: Math.round((baseSimHours - 0.67 * simStdDev) * blendedRate), probabilityDensity: 0.28, cumulativeProbability: 0.25 },
    { percentile: 50, durationWeeks: p50Weeks, hours: p50Hours, cost: Math.round(p50Hours * blendedRate), probabilityDensity: 0.40, cumulativeProbability: 0.50 },
    { percentile: 75, durationWeeks: Math.round(totalWeeks * 1.10), hours: Math.round(baseSimHours + 0.67 * simStdDev), cost: Math.round((baseSimHours + 0.67 * simStdDev) * blendedRate), probabilityDensity: 0.28, cumulativeProbability: 0.75 },
    { percentile: 80, durationWeeks: p80Weeks, hours: p80Hours, cost: Math.round(p80Hours * blendedRate), probabilityDensity: 0.22, cumulativeProbability: 0.80 },
    { percentile: 90, durationWeeks: p90Weeks, hours: p90Hours, cost: Math.round(p90Hours * blendedRate), probabilityDensity: 0.14, cumulativeProbability: 0.90 },
    { percentile: 95, durationWeeks: Math.round(totalWeeks * 1.32), hours: p95Hours, cost: Math.round(p95Hours * blendedRate), probabilityDensity: 0.08, cumulativeProbability: 0.95 }
  ];

  // Calculate probability of meeting current target based on user confidence & contingency
  const currentProbabilityOnTime = Math.min(96, Math.max(35, Math.round(scenario.confidence * 100 * (1 + contingencyPct * 0.4))));
  const recommendedReserveHours = Math.max(0, p80Hours - totalHours);
  const recommendedReserveBudget = Math.round(recommendedReserveHours * blendedRate);

  const monteCarlo: MonteCarloSimulationData = {
    iterations,
    p10_Aggressive: { weeks: p10Weeks, hours: p10Hours, cost: Math.round(p10Hours * blendedRate) },
    p50_Baseline: { weeks: p50Weeks, hours: p50Hours, cost: Math.round(p50Hours * blendedRate) },
    p80_DefensibleTarget: { weeks: p80Weeks, hours: p80Hours, cost: Math.round(p80Hours * blendedRate) },
    p90_BoardCommitment: { weeks: p90Weeks, hours: p90Hours, cost: Math.round(p90Hours * blendedRate) },
    currentProbabilityOnTime,
    recommendedReserveBudget,
    recommendedReserveHours,
    simulationCurve,
    topRiskVarianceDrivers: [
      { factor: 'Legacy Data Cleansing & Extraction Velocity', varianceContributionPct: 32, recommendation: 'Deploy automated pre-validation FBDI templates in Sprint 1 to prevent UAT slip.' },
      { factor: 'Client Business SME Availability During UAT', varianceContributionPct: 26, recommendation: 'Mandate formal SME backfill budget approval before Design Gate sign-off.' },
      { factor: 'Third-Party Integration API Readiness (OIC)', varianceContributionPct: 21, recommendation: 'Establish mock API stubs in DEV2 during Week 4 to de-risk downstream SIT.' },
      { factor: 'Quarterly Cloud Update Patch Regression Cycle', varianceContributionPct: 12, recommendation: 'Align SIT execution to avoid Pod Cohort maintenance lockout windows.' },
      { factor: 'BPM Approval Hierarchies & SLA Customizations', varianceContributionPct: 9, recommendation: 'Enforce standard Oracle Modern Best Practice (MBP) approval workflows.' }
    ]
  };

  // ----------------------------------------------------
  // GAP 5: Client vs SI Co-Staffing & SME Backfill Crunch Model
  // ----------------------------------------------------
  const avgSiFTE = (totalHours / (totalWeeks * 40));
  
  const phaseStaffing: CoStaffingPhase[] = [
    {
      phaseId: 'phase_enablement',
      phaseName: 'Client Enablement & Project Mobilization',
      siFTE: Math.round((avgSiFTE * 0.70) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 0.35) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.25) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 1.30) * 10) / 10,
      clientCommitmentPct: 30,
      isCrunchPhase: false,
      backfillRecommendation: 'Core project team orientation; light initial commitment.'
    },
    {
      phaseId: 'phase_design',
      phaseName: 'Global Architecture & Enterprise Design',
      siFTE: Math.round((avgSiFTE * 1.15) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 0.65) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.40) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 2.20) * 10) / 10,
      clientCommitmentPct: 50,
      isCrunchPhase: false,
      crunchReason: 'Daily interactive design workshops & requirement validation',
      backfillRecommendation: 'Dedicate primary process owners 2.5 days per week to prevent design stalls.'
    },
    {
      phaseId: 'phase_build',
      phaseName: 'Configuration, OIC Integrations & Unit Test',
      siFTE: Math.round((avgSiFTE * 1.25) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 0.30) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.50) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 2.05) * 10) / 10,
      clientCommitmentPct: 25,
      isCrunchPhase: false,
      backfillRecommendation: 'IT Infrastructure team engaged for VPN/SSO and OIC endpoint testing.'
    },
    {
      phaseId: 'phase_test1',
      phaseName: 'Business Test 1: System Integration Testing (SIT)',
      siFTE: Math.round((avgSiFTE * 1.20) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 0.55) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.45) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 2.20) * 10) / 10,
      clientCommitmentPct: 45,
      isCrunchPhase: false,
      backfillRecommendation: 'SME validation of interface payloads and end-to-end accounting logic.'
    },
    {
      phaseId: 'phase_test2',
      phaseName: 'Business Test 2: User Acceptance Testing (UAT)',
      siFTE: Math.round((avgSiFTE * 1.10) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 1.05) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.40) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 2.55) * 10) / 10,
      clientCommitmentPct: 80,
      isCrunchPhase: true,
      crunchReason: 'CRITICAL CRUNCH: Business SMEs must execute 100% of test scripts and verify daily defect resolutions',
      backfillRecommendation: 'MANDATORY BACKFILL: Super-users require 80%+ relief from daily operational duties (BAU) for 4-6 weeks.'
    },
    {
      phaseId: 'phase_cutover',
      phaseName: 'Cutover Weekend, Dress Rehearsal & Live Go-Live',
      siFTE: Math.round((avgSiFTE * 1.30) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 0.95) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.60) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 2.85) * 10) / 10,
      clientCommitmentPct: 90,
      isCrunchPhase: true,
      crunchReason: 'HIGH CRUNCH: 72-hour weekend data migration validation, period opening, and Day-1 command center',
      backfillRecommendation: '24/7 all-hands roster for Finance, SCM, and IT leads with pre-approved overtime/shift cover.'
    },
    {
      phaseId: 'phase_hypercare',
      phaseName: 'Post Go-Live Hypercare & First Month-End Close',
      siFTE: Math.round((avgSiFTE * 0.75) * 10) / 10,
      clientSmeFTE: Math.round((avgSiFTE * 0.60) * 10) / 10,
      clientItFTE: Math.round((avgSiFTE * 0.35) * 10) / 10,
      totalFTE: Math.round((avgSiFTE * 1.70) * 10) / 10,
      clientCommitmentPct: 50,
      isCrunchPhase: false,
      backfillRecommendation: 'Dedicated floor support super-users aiding general business users.'
    }
  ];

  const totalSiPersonMonths = Math.round(totalHours / 168);
  const totalClientPersonMonths = Math.round(totalSiPersonMonths * 0.62);
  const peakClientFTE = Math.max(...phaseStaffing.map(p => p.clientSmeFTE + p.clientItFTE));
  const peakWeek = Math.round(totalWeeks * 0.72); // Peak during UAT
  const estimatedClientBackfillCost = Math.round(totalClientPersonMonths * 168 * 85); // $85/hr standard client SME blended backfill

  const coStaffing: CoStaffingModel = {
    totalSiPersonMonths,
    totalClientPersonMonths,
    blendedCoStaffingRatio: `1 : ${(totalClientPersonMonths / (totalSiPersonMonths || 1)).toFixed(2)}`,
    peakClientFTE: Math.round(peakClientFTE * 10) / 10,
    peakWeek,
    estimatedClientBackfillCost,
    phaseStaffing,
    keySmeRoles: [
      { role: 'Lead Finance SME / Controller', siHours: Math.round(totalHours * 0.18), clientHours: Math.round(totalHours * 0.12), peakPhase: 'Design & UAT', mitigation: 'Authorize temporary senior accounting contractor during UAT and first financial close.' },
      { role: 'Supply Chain & Inventory Super-user', siHours: Math.round(totalHours * 0.16), clientHours: Math.round(totalHours * 0.10), peakPhase: 'Build & Cutover', mitigation: 'Designate backup warehouse operations supervisor for physical inventory count.' },
      { role: 'Payroll Specialist & HR Admin', siHours: Math.round(totalHours * 0.14), clientHours: Math.round(totalHours * 0.11), peakPhase: 'Parallel Runs & UAT', mitigation: 'Engage external payroll bureau or temporary contractor for standard gross-to-net payroll operations.' },
      { role: 'Enterprise Integration & OIC Lead', siHours: Math.round(totalHours * 0.15), clientHours: Math.round(totalHours * 0.08), peakPhase: 'Build & SIT', mitigation: 'Prioritize internal middleware architect to ensure firewall & legacy API permissions.' }
    ]
  };

  // ----------------------------------------------------
  // EXECUTIVE SUMMARY & GOVERNANCE READINESS
  // ----------------------------------------------------
  const feasibilityScore = Math.round(
    Math.min(95, Math.max(40, 
      (currentProbabilityOnTime * 0.40) + 
      ((cutoverContingencyBufferHours / 24) * 20) + 
      ((criticalPath.totalBufferDays > 30 ? 25 : 15)) + 
      (scenario.confidence * 15)
    ))
  );

  return {
    criticalPath,
    environmentLandscape,
    dataCutover,
    monteCarlo,
    coStaffing,
    executiveSummary: {
      headline: feasibilityScore >= 75 
        ? 'Executive Schedule & Estimation Model is Defensible and Production-Ready'
        : 'Action Required: High-Risk Schedule Constraints Detected in UAT Buffer & Data Cutover Window',
      scheduleFeasibilityScore: feasibilityScore,
      topDecisionNeeded: `Formal SteerCo approval of the ${coStaffing.peakClientFTE} Peak Client SME Backfill FTE requirement before Design Blueprint freeze.`,
      recommendedSteerCoActions: [
        `Lock the ${totalWeeks}-Week schedule with a defensible P80 contingency reserve of +${Math.round((p80Hours - totalHours) / 100) * 100} hours (+${(((p80Hours - totalHours) || 0) / 160).toFixed(1)} PM).`,
        `Enforce strict 72-hour weekend Cutover SLA window with 3 mandatory Mock Migration dry-runs.`,
        `Mandate dedicated client SME allocation during UAT (Phase 5) with pre-budgeted operational backfills.`,
        `Align testing cycles with Oracle Quarterly Pod Patch Cohort ${scenario.podCohort} freeze windows.`
      ]
    }
  };
}
