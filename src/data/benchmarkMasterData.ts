import { TShirtSize } from '../types';

// ============================================================================
// LAYER 1: TASK WORK BREAKDOWN STRUCTURE (WBS)
// ============================================================================

export interface WbsActivityItem {
  id: string;
  name: string;
  phaseCode: string; // e.g. 'FSM', 'CRP', 'SLA', 'SIT', 'CUTOVER'
  phaseName: string;
  description: string;
  deliverables: string[];
  hoursByTShirt: Record<TShirtSize, number>;
}

export const DEFAULT_WBS_ACTIVITIES: WbsActivityItem[] = [
  {
    id: 'wbs_fsm_setup',
    name: 'Foundation FSM Setup & Rapid Implementation',
    phaseCode: 'FSM',
    phaseName: 'Functional Setup Manager',
    description: 'COA instances, calendars, currency definitions, security roles, reference data sets, and standard business unit mappings.',
    deliverables: ['Enterprise Structure Config', 'Rapid Implementation Sheets', 'Role Security Mapping'],
    hoursByTShirt: {
      XS: 60,
      S: 90,
      M: 140,
      L: 210,
      XL: 320,
      XXL: 450
    }
  },
  {
    id: 'wbs_crp_playbacks',
    name: 'CRP1 & CRP2 Interactive Playback Sessions',
    phaseCode: 'CRP',
    phaseName: 'Conference Room Pilot',
    description: 'Standard modern best practice process walk-throughs, design sign-offs, delta gap validation, and user acceptance scripts.',
    deliverables: ['CRP1 Playback Deck', 'Delta Gap Register', 'CRP2 Approval Sign-Off'],
    hoursByTShirt: {
      XS: 50,
      S: 80,
      M: 130,
      L: 200,
      XL: 300,
      XXL: 420
    }
  },
  {
    id: 'wbs_sla_journal_rules',
    name: 'Subledger Accounting (SLA) & Custom Accounting Rules',
    phaseCode: 'SLA',
    phaseName: 'SLA Rules & Controls',
    description: 'Accounting method definitions, journal line rules, mapping sets, description rules, and statutory multi-currency tax postings.',
    deliverables: ['SLA Rule Definition Document', 'Posting Mapping Matrix', 'Custom Account Derivation Rules'],
    hoursByTShirt: {
      XS: 40,
      S: 65,
      M: 110,
      L: 175,
      XL: 260,
      XXL: 380
    }
  },
  {
    id: 'wbs_sit_testing',
    name: 'System Integration Testing (SIT) & E2E Validation',
    phaseCode: 'SIT',
    phaseName: 'Testing & Quality',
    description: 'Cross-module integration runs, boundary test case execution, automated script verification, defect triage, and sign-off.',
    deliverables: ['SIT Execution Logs', 'Defect Remediation Register', 'Cross-Pillar Sign-Off'],
    hoursByTShirt: {
      XS: 50,
      S: 75,
      M: 120,
      L: 185,
      XL: 280,
      XXL: 390
    }
  },
  {
    id: 'wbs_cutover_reconciliations',
    name: 'Cutover Execution & Opening Balance Reconciliations',
    phaseCode: 'CUTOVER',
    phaseName: 'Deployment & Cutover',
    description: 'Blackout orchestration, open AP/AR ledger balancing, asset subledger transfer, trial balance sign-off, and go-live hypercare prep.',
    deliverables: ['Cutover Runbook (Minute-by-Minute)', 'Trial Balance Reconciliation', 'Go-Live Authorization'],
    hoursByTShirt: {
      XS: 40,
      S: 60,
      M: 100,
      L: 150,
      XL: 240,
      XXL: 360
    }
  }
];

export function calculateWbsTotalHours(activities: WbsActivityItem[]): Record<TShirtSize, number> {
  const totals: Record<TShirtSize, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  activities.forEach(act => {
    (Object.keys(totals) as TShirtSize[]).forEach(size => {
      totals[size] += act.hoursByTShirt[size] || 0;
    });
  });
  return totals;
}

// ============================================================================
// LAYER 2: COMPLEXITY MODIFIER (INTRINSIC MULTIPLIERS)
// ============================================================================

export interface ModuleIntrinsicFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  weightPct: number; // e.g. 5 = +0.05x to base
  isEnabled: boolean;
  rationale: string;
}

export interface ModuleIntrinsicConfig {
  moduleId: string;
  moduleName: string;
  pillar: string;
  baseMultiplier: number; // default 1.00
  features: ModuleIntrinsicFeature[];
}

export const DEFAULT_MODULE_INTRINSIC_CONFIGS: Record<string, ModuleIntrinsicConfig> = {
  erp_gl: {
    moduleId: 'erp_gl',
    moduleName: 'General Ledger & Financial Reporting',
    pillar: 'ERP',
    baseMultiplier: 1.0,
    features: [
      {
        id: 'feat_gl_multi_currency',
        name: 'Multi-Currency Revaluation & Daily Rate Feeds',
        category: 'Statutory',
        description: 'Automated European Central Bank (ECB) daily rate ingestion, cumulative translation adjustments (CTA), and revaluation rules.',
        weightPct: 5,
        isEnabled: true,
        rationale: 'Requires additional SLA mapping sets and daily currency feed testing.'
      },
      {
        id: 'feat_gl_allocations',
        name: 'Calculation Manager Dynamic Allocations',
        category: 'Management',
        description: 'Complex multi-step cost pool distributions, step-down corporate allocations, and statistical ledger metrics.',
        weightPct: 6,
        isEnabled: true,
        rationale: 'EPM Calculation Manager scripting and iterative testing cycles.'
      },
      {
        id: 'feat_gl_secondary_ledgers',
        name: 'Secondary Ledgers & Dual Chart of Accounts (COA)',
        category: 'Statutory',
        description: 'Parallel GAAP to IFRS conversion subledger accounting rules and local statutory balance sheet mapping.',
        weightPct: 5,
        isEnabled: true,
        rationale: 'Doubles journal line conversion validation and reconciliation effort.'
      },
      {
        id: 'feat_gl_intercompany',
        name: 'Intercompany Balancing & AGIS Settlement',
        category: 'Statutory',
        description: 'Advanced Global Intercompany System (AGIS) transaction matching, automated elimination journals, and cross-entity invoicing.',
        weightPct: 4,
        isEnabled: true,
        rationale: 'Requires matrix trading partner rules and intercompany clearing balancing.'
      }
    ]
  },
  erp_ap: {
    moduleId: 'erp_ap',
    moduleName: 'Accounts Payable & Payments',
    pillar: 'ERP',
    baseMultiplier: 1.0,
    features: [
      {
        id: 'feat_ap_idr',
        name: 'Intelligent Document Recognition (IDR) & AI OCR',
        category: 'Automation',
        description: 'Automated machine-learning invoice header & line extraction, email routing, and adaptive training.',
        weightPct: 5,
        isEnabled: true,
        rationale: 'Requires continuous sample training sets and OCR confidence threshold tuning.'
      },
      {
        id: 'feat_ap_complex_approvals',
        name: 'BPM Multi-Tier Approval Matrix with Limits & Delegation',
        category: 'Governance',
        description: 'Hierarchical approval rules based on cost center, project code, amount thresholds, and exception routing.',
        weightPct: 5,
        isEnabled: true,
        rationale: 'Complex Oracle BPM rule tree authoring and boundary condition test cases.'
      },
      {
        id: 'feat_ap_iso20022',
        name: 'ISO 20022 XML & Host-to-Host (H2H) Bank Rails',
        category: 'Banking',
        description: 'Direct corporate banking transmission (pain.001 / pain.002), PGP encryption, and MT940 bank statement reconciliation.',
        weightPct: 5,
        isEnabled: true,
        rationale: 'Mandatory external bank test rehearsals and certificate handshakes.'
      }
    ]
  },
  erp_ar: {
    moduleId: 'erp_ar',
    moduleName: 'Accounts Receivable & Revenue Management',
    pillar: 'ERP',
    baseMultiplier: 1.0,
    features: [
      {
        id: 'feat_ar_asc606',
        name: 'ASC 606 / IFRS 15 Revenue Management Standalone Contracts',
        category: 'Statutory',
        description: 'Performance obligations, variable consideration allocation, contract modifications, and amortization schedules.',
        weightPct: 8,
        isEnabled: true,
        rationale: 'High accounting complexity requiring revenue contract modeling.'
      },
      {
        id: 'feat_ar_lockbox',
        name: 'Automated BAI2 Lockbox & Auto-Match Algorithms',
        category: 'Automation',
        description: 'Daily automated bank clearing file processing, MICR matching, and unapplied cash queue rules.',
        weightPct: 4,
        isEnabled: true,
        rationale: 'Extensive bank transmission testing and lockbox error handling.'
      },
      {
        id: 'feat_ar_collections',
        name: 'Advanced Collections Strategy & Dunning Scoring',
        category: 'Operations',
        description: 'Aging bucket aging matrix, automated dispute workflows, promise-to-pay tracking, and dunning letter tiers.',
        weightPct: 3,
        isEnabled: true,
        rationale: 'Collector workbench setup and customer communication strategy.'
      }
    ]
  },
  scm_inv: {
    moduleId: 'scm_inv',
    moduleName: 'Inventory Management & Costing',
    pillar: 'SCM',
    baseMultiplier: 1.0,
    features: [
      {
        id: 'feat_inv_dual_uom',
        name: 'Catch-Weight & Dual Unit of Measure (UOM)',
        category: 'Manufacturing',
        description: 'Tracking physical stock in secondary transactional units with dynamic lot conversion factors.',
        weightPct: 5,
        isEnabled: true,
        rationale: 'Adds extensive validation across purchasing, warehousing, and cost accounting.'
      },
      {
        id: 'feat_inv_actual_costing',
        name: 'Perpetual Actual & Landed Costing Multi-Element Ledgers',
        category: 'Costing',
        description: 'Third-party freight/customs allocations, cost variance tracking, and FIFO/LIFO layer valuation.',
        weightPct: 7,
        isEnabled: true,
        rationale: 'Subledger accounting rule generation for landed cost trade operations.'
      },
      {
        id: 'feat_inv_lot_serial',
        name: 'Genealogy & Lot/Serial Forward-Backward Traceability',
        category: 'Quality',
        description: 'Regulatory pharmaceutical/aerospace material tracking from supplier lot to finished goods dispatch.',
        weightPct: 4,
        isEnabled: true,
        rationale: 'Complex inventory transaction controls and mobile barcoding flows.'
      }
    ]
  },
  hcm_payroll: {
    moduleId: 'hcm_payroll',
    moduleName: 'Global Payroll & FastFormulas',
    pillar: 'HCM',
    baseMultiplier: 1.0,
    features: [
      {
        id: 'feat_pay_statutory_localization',
        name: 'Statutory Country Localization (Tax, Social Security, Pension)',
        category: 'Statutory',
        description: 'Year-end statutory returns, pre-tax salary sacrifice deductions, and local banking clearing formats.',
        weightPct: 9,
        isEnabled: true,
        rationale: 'Critical compliance testing against national taxation frameworks.'
      },
      {
        id: 'feat_pay_fastformulas',
        name: 'Complex FastFormula Retroactive Pay Calculation Rules',
        category: 'Technical',
        description: 'Custom PL/SQL-like payroll calculation scripts, overtime blended rates, and retroactive back-pay processing.',
        weightPct: 7,
        isEnabled: true,
        rationale: 'Requires dedicated compensation formula engineering and parallel run reconciliations.'
      },
      {
        id: 'feat_pay_parallel_runs',
        name: '3-Cycle Parallel Payroll Rehearsal Runs (0.01% Variance Gate)',
        category: 'Assurance',
        description: 'Full historical wage comparison between legacy payroll and Oracle Cloud with automated gross-to-net diffing.',
        weightPct: 6,
        isEnabled: true,
        rationale: 'Mandatory 3-month parallel run audit reconciliation.'
      }
    ]
  }
};

export function calculateModuleIntrinsicMultiplier(config: ModuleIntrinsicConfig): number {
  let total = config.baseMultiplier || 1.0;
  config.features.forEach(feat => {
    if (feat.isEnabled) {
      total += (feat.weightPct || 0) / 100;
    }
  });
  return parseFloat(total.toFixed(2));
}

// ============================================================================
// LAYER 3: RICEFW UNIT CATALOG
// ============================================================================

export interface RicefwPatternItem {
  id: string;
  name: string;
  category: 'Report' | 'Interface' | 'Conversion' | 'Extension' | 'Workflow';
  complexityTier: 'Simple' | 'Medium' | 'Complex';
  techStack: string;
  specDesignHours: number;
  buildConfigHours: number;
  testingHours: number;
  cutoverRehearsalHours: number;
  totalUnitHours: number;
  tcmRationale: string;
  typicalDeliverables: string[];
}

export interface RicefwMasterConfig {
  patterns: RicefwPatternItem[];
  oicAcceleratorDiscountPct: number; // e.g. 35%
  legacyDataDirtyPenaltyPct: number; // e.g. 25%
}

export const DEFAULT_RICEFW_PATTERNS: RicefwPatternItem[] = [
  {
    id: 'ricefw_rep_otbi_simple',
    name: 'OTBI Standard Operational Dashboard',
    category: 'Report',
    complexityTier: 'Simple',
    techStack: 'Oracle Transactional Business Intelligence (OTBI)',
    specDesignHours: 6,
    buildConfigHours: 12,
    testingHours: 8,
    cutoverRehearsalHours: 4,
    totalUnitHours: 30,
    tcmRationale: 'Single subject area view with standard parameters and basic drill-down graphs.',
    typicalDeliverables: ['MD070 Tech Spec', 'Catalog XML Definition', 'Unit Test Script']
  },
  {
    id: 'ricefw_rep_bip_complex',
    name: 'BIP Customer-Facing Statutory Form (Invoice / Cheque)',
    category: 'Report',
    complexityTier: 'Complex',
    techStack: 'BI Publisher (RTF / XSL-FO + Data Model)',
    specDesignHours: 16,
    buildConfigHours: 36,
    testingHours: 24,
    cutoverRehearsalHours: 14,
    totalUnitHours: 90,
    tcmRationale: 'Pixel-perfect multi-page layout, subledger burst routing, barcode fonts, and multilingual labels.',
    typicalDeliverables: ['Data Template XML', 'RTF Form Layout', 'Bursting Table Config']
  },
  {
    id: 'ricefw_int_oic_rest',
    name: 'OIC Real-Time Bidirectional REST Integration Flow',
    category: 'Interface',
    complexityTier: 'Medium',
    techStack: 'Oracle Integration Cloud (OIC Gen3)',
    specDesignHours: 18,
    buildConfigHours: 42,
    testingHours: 32,
    cutoverRehearsalHours: 18,
    totalUnitHours: 110,
    tcmRationale: 'OAuth2 authentication handshake, JSON payload transformation, fault handler catch, and notification alerts.',
    typicalDeliverables: ['IAR Archive Package', 'Fault Resiliency Specs', 'Postman Test Suite']
  },
  {
    id: 'ricefw_int_fbdi_batch',
    name: 'Automated High-Volume FBDI / HDL Batch Ingestion',
    category: 'Interface',
    complexityTier: 'Complex',
    techStack: 'OIC + UCM WebCenter + ERP Integration Service',
    specDesignHours: 22,
    buildConfigHours: 54,
    testingHours: 40,
    cutoverRehearsalHours: 24,
    totalUnitHours: 140,
    tcmRationale: 'ZIP payload compression, UCM check-in, ESS job callback tracking, and bad-record notification routing.',
    typicalDeliverables: ['Automated ESS Trigger', 'Pre-Validation Staging Script', 'Reconciliation Dashboard']
  },
  {
    id: 'ricefw_conv_master_data',
    name: 'FBDI Master Data Object (Customer / Supplier / Item)',
    category: 'Conversion',
    complexityTier: 'Medium',
    techStack: 'Oracle FBDI / HDL + Python Cleaning Scripts',
    specDesignHours: 14,
    buildConfigHours: 32,
    testingHours: 28,
    cutoverRehearsalHours: 26,
    totalUnitHours: 100,
    tcmRationale: 'Source-to-target field mapping, cleansing rules, cross-reference tables, and Mock 1/2 load cycles.',
    typicalDeliverables: ['CV040 Mapping Spec', 'Data Migration Validator', 'Mock Load Sign-Off']
  },
  {
    id: 'ricefw_ext_vbcs_paas',
    name: 'Visual Builder (VBCS) Custom Portal / Extension',
    category: 'Extension',
    complexityTier: 'Complex',
    techStack: 'Visual Builder Cloud Service (VBCS) + Redwood UI',
    specDesignHours: 30,
    buildConfigHours: 85,
    testingHours: 55,
    cutoverRehearsalHours: 30,
    totalUnitHours: 200,
    tcmRationale: 'Full custom responsive UI, Redwood design system components, business objects, and security role binding.',
    typicalDeliverables: ['UX Wireframes', 'VBCS Application Bundle', 'REST Service Connections']
  },
  {
    id: 'ricefw_wf_bpm_approval',
    name: 'BPM Approval Task Routing with Multi-Level Rules',
    category: 'Workflow',
    complexityTier: 'Medium',
    techStack: 'Oracle BPM Human Tasks & AMX Rules Engine',
    specDesignHours: 12,
    buildConfigHours: 28,
    testingHours: 22,
    cutoverRehearsalHours: 13,
    totalUnitHours: 75,
    tcmRationale: 'Configuring approver group lookups, escalation timers, notification email templates, and mobile approvals.',
    typicalDeliverables: ['Approval Matrix Document', 'BPM Rule Sets', 'Notification Templates']
  }
];

export function calculateRicefwUnitTotal(item: RicefwPatternItem): number {
  return (
    (item.specDesignHours || 0) +
    (item.buildConfigHours || 0) +
    (item.testingHours || 0) +
    (item.cutoverRehearsalHours || 0)
  );
}

// ============================================================================
// LAYER 4: FUNCTIONAL MODIFIER (SCALE DRIVER STEP-CURVES)
// ============================================================================

export interface StepTierRule {
  minQty: number;
  maxQty: number; // 9999 for infinity
  incrementalHoursPerUnit: number;
  marginalEfficiencyPct: number; // e.g. 0% for tier 1, 30% for tier 2, 50% for tier 3
  description: string;
}

export interface ScaleDriverStepCurveItem {
  driverKey: string;
  name: string;
  unitLabel: string;
  baseIncludedQty: number; // included in baseline T-shirt
  stepTiers: StepTierRule[];
  sharedServicesDiscountPct: number; // e.g. 25% discount if centralized SSC
  description: string;
}

export const DEFAULT_SCALE_STEP_CURVES: ScaleDriverStepCurveItem[] = [
  {
    driverKey: 'fin_led',
    name: 'Primary & Secondary Accounting Ledgers',
    unitLabel: 'Ledgers',
    baseIncludedQty: 1,
    sharedServicesDiscountPct: 25,
    description: 'COA calendar/currency instances, subledger accounting mappings, and period-end close schedules.',
    stepTiers: [
      {
        minQty: 2,
        maxQty: 3,
        incrementalHoursPerUnit: 350,
        marginalEfficiencyPct: 0,
        description: 'First incremental ledgers require distinct statutory calendars and local currency revaluation.'
      },
      {
        minQty: 4,
        maxQty: 8,
        incrementalHoursPerUnit: 240,
        marginalEfficiencyPct: 31,
        description: 'Standardized global chart of accounts templates leverage Rapid Implementation spreadsheets.'
      },
      {
        minQty: 9,
        maxQty: 9999,
        incrementalHoursPerUnit: 160,
        marginalEfficiencyPct: 54,
        description: 'Highly automated rollout factory with clone configuration scripts.'
      }
    ]
  },
  {
    driverKey: 'fin_ent',
    name: 'Legal Entities & Business Units',
    unitLabel: 'Entities',
    baseIncludedQty: 2,
    sharedServicesDiscountPct: 30,
    description: 'Statutory registration, intercompany balancing rules, and transaction partition definitions.',
    stepTiers: [
      {
        minQty: 3,
        maxQty: 5,
        incrementalHoursPerUnit: 180,
        marginalEfficiencyPct: 0,
        description: 'Dedicated tax regimes and local bank account setup.'
      },
      {
        minQty: 6,
        maxQty: 15,
        incrementalHoursPerUnit: 110,
        marginalEfficiencyPct: 39,
        description: 'Shared services processing centers with standard payment formats.'
      },
      {
        minQty: 16,
        maxQty: 9999,
        incrementalHoursPerUnit: 70,
        marginalEfficiencyPct: 61,
        description: 'High-volume cookie-cutter entity onboarding templates.'
      }
    ]
  },
  {
    driverKey: 'scm_wh',
    name: 'Warehouses & Distribution Centers',
    unitLabel: 'Warehouses',
    baseIncludedQty: 1,
    sharedServicesDiscountPct: 20,
    description: 'Subinventories, locators, pick-pack-ship rules, cycle count schedules, and barcode integrations.',
    stepTiers: [
      {
        minQty: 2,
        maxQty: 4,
        incrementalHoursPerUnit: 220,
        marginalEfficiencyPct: 0,
        description: 'Unique warehouse layouts and picking zone configurations.'
      },
      {
        minQty: 5,
        maxQty: 10,
        incrementalHoursPerUnit: 140,
        marginalEfficiencyPct: 36,
        description: 'Cloned standard distribution center templates.'
      },
      {
        minQty: 11,
        maxQty: 9999,
        incrementalHoursPerUnit: 85,
        marginalEfficiencyPct: 61,
        description: 'Regional hub replication with automated setup copy tools.'
      }
    ]
  },
  {
    driverKey: 'hcm_pay_countries',
    name: 'Payroll Statutory Countries',
    unitLabel: 'Countries',
    baseIncludedQty: 1,
    sharedServicesDiscountPct: 15,
    description: 'Country-specific legislative tax engines, social insurance rules, and local bank payment rails.',
    stepTiers: [
      {
        minQty: 2,
        maxQty: 3,
        incrementalHoursPerUnit: 480,
        marginalEfficiencyPct: 0,
        description: 'Distinct national statutory compliance and dual-cycle parallel runs.'
      },
      {
        minQty: 4,
        maxQty: 8,
        incrementalHoursPerUnit: 340,
        marginalEfficiencyPct: 29,
        description: 'Leverages standard Oracle Global Payroll regional templates.'
      },
      {
        minQty: 9,
        maxQty: 9999,
        incrementalHoursPerUnit: 230,
        marginalEfficiencyPct: 52,
        description: 'Global payroll shared services factory with offshore compliance team.'
      }
    ]
  },
  {
    driverKey: 'tech_data_objects',
    name: 'Legacy Data Migration Objects',
    unitLabel: 'Data Objects',
    baseIncludedQty: 4,
    sharedServicesDiscountPct: 25,
    description: 'FBDI / HDL extract, transform, load pipelines and reconciliation balances.',
    stepTiers: [
      {
        minQty: 5,
        maxQty: 10,
        incrementalHoursPerUnit: 90,
        marginalEfficiencyPct: 0,
        description: 'Core transactional objects (open AP invoices, open POs, AR balances).'
      },
      {
        minQty: 11,
        maxQty: 20,
        incrementalHoursPerUnit: 65,
        marginalEfficiencyPct: 28,
        description: 'Secondary historical data objects with standard mapping templates.'
      },
      {
        minQty: 21,
        maxQty: 9999,
        incrementalHoursPerUnit: 45,
        marginalEfficiencyPct: 50,
        description: 'Automated data migration pipelines with automated ETL scripts.'
      }
    ]
  }
];

export function calculateStepCurveMarginalHours(
  curve: ScaleDriverStepCurveItem,
  totalQty: number,
  isSharedServices: boolean = true
): { totalHours: number; breakdown: { tierDesc: string; qtyInTier: number; rate: number; hours: number }[] } {
  const incrementalQty = Math.max(0, totalQty - curve.baseIncludedQty);
  if (incrementalQty <= 0) {
    return { totalHours: 0, breakdown: [] };
  }

  let remaining = incrementalQty;
  let runningHours = 0;
  const breakdown: { tierDesc: string; qtyInTier: number; rate: number; hours: number }[] = [];

  for (const tier of curve.stepTiers) {
    if (remaining <= 0) break;
    const tierCapacity = tier.maxQty - tier.minQty + 1;
    const qtyInThisTier = Math.min(remaining, tierCapacity);

    let effectiveRate = tier.incrementalHoursPerUnit;
    if (isSharedServices && curve.sharedServicesDiscountPct > 0) {
      effectiveRate = effectiveRate * (1 - curve.sharedServicesDiscountPct / 100);
    }

    const tierHours = Math.round(qtyInThisTier * effectiveRate);
    runningHours += tierHours;
    breakdown.push({
      tierDesc: tier.description,
      qtyInTier: qtyInThisTier,
      rate: Math.round(effectiveRate),
      hours: tierHours
    });

    remaining -= qtyInThisTier;
  }

  return { totalHours: runningHours, breakdown };
}

// ============================================================================
// ROLE RATE CARDS & DELIVERY TIERS
// ============================================================================

export interface RoleRateCardItem {
  roleId: string;
  roleName: string;
  gradeCode: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';
  seniorityTier: 'Strategic' | 'Lead' | 'Senior' | 'Execution' | 'Specialist';
  // Location Bill Rates ($/hr)
  onshoreHourlyRate: number;    // US / EU / UK
  nearshoreHourlyRate: number;  // Mexico / Poland / Portugal
  offshoreHourlyRate: number;   // India / Philippines
  // Cost Rates ($/hr)
  onshoreCostRate: number;
  nearshoreCostRate: number;
  offshoreCostRate: number;
  // Sourcing Variants
  inHouseBillRate: number;
  subcontractorBillRate: number;
  gdcOffshoreBillRate: number;
  // Margins & Shares
  standardBlendedRate: number;
  expectedMarginPct: number;
  defaultMixSharePct: number;
  description: string;
  traceabilityNotes: string;
}

export const DEFAULT_ROLE_RATE_CARDS: RoleRateCardItem[] = [
  {
    roleId: 'role_partner',
    roleName: 'Managing Director / Engagement Partner',
    gradeCode: 'Grade E',
    seniorityTier: 'Strategic',
    onshoreHourlyRate: 375,
    nearshoreHourlyRate: 260,
    offshoreHourlyRate: 140,
    onshoreCostRate: 180,
    nearshoreCostRate: 120,
    offshoreCostRate: 65,
    inHouseBillRate: 375,
    subcontractorBillRate: 330,
    gdcOffshoreBillRate: 140,
    standardBlendedRate: 310,
    expectedMarginPct: 52,
    defaultMixSharePct: 3,
    description: 'Executive sponsorship, SteerCo governance, C-level advisory & commercial DoA sign-off.',
    traceabilityNotes: 'Empirical benchmark: 3-5% project effort. Source: Oracle TCM Executive Governance model.'
  },
  {
    roleId: 'role_enterprise_architect',
    roleName: 'Enterprise Cloud Solution Architect (ESA)',
    gradeCode: 'Grade D',
    seniorityTier: 'Lead',
    onshoreHourlyRate: 265,
    nearshoreHourlyRate: 185,
    offshoreHourlyRate: 95,
    onshoreCostRate: 145,
    nearshoreCostRate: 98,
    offshoreCostRate: 48,
    inHouseBillRate: 265,
    subcontractorBillRate: 235,
    gdcOffshoreBillRate: 95,
    standardBlendedRate: 215,
    expectedMarginPct: 48,
    defaultMixSharePct: 8,
    description: 'Global COA architecture, Multi-Org topology, SLA rules governance & Architecture Review Board (ARB).',
    traceabilityNotes: 'Empirical benchmark: 8-12% project effort. Source: Oracle ARB Standard v2.4.'
  },
  {
    roleId: 'role_functional_lead',
    roleName: 'Principal Functional Lead (ERP/SCM/HCM)',
    gradeCode: 'Grade C',
    seniorityTier: 'Senior',
    onshoreHourlyRate: 210,
    nearshoreHourlyRate: 145,
    offshoreHourlyRate: 75,
    onshoreCostRate: 118,
    nearshoreCostRate: 78,
    offshoreCostRate: 36,
    inHouseBillRate: 210,
    subcontractorBillRate: 190,
    gdcOffshoreBillRate: 75,
    standardBlendedRate: 165,
    expectedMarginPct: 45,
    defaultMixSharePct: 24,
    description: 'Cross-module process flows (P2P, O2C, R2R), localization statutory compliance & CRP playback sign-off.',
    traceabilityNotes: 'Core functional track lead across design and validation phases.'
  },
  {
    roleId: 'role_technical_architect',
    roleName: 'Senior OIC / Integration Architect',
    gradeCode: 'Grade C',
    seniorityTier: 'Senior',
    onshoreHourlyRate: 220,
    nearshoreHourlyRate: 150,
    offshoreHourlyRate: 80,
    onshoreCostRate: 122,
    nearshoreCostRate: 82,
    offshoreCostRate: 38,
    inHouseBillRate: 220,
    subcontractorBillRate: 195,
    gdcOffshoreBillRate: 80,
    standardBlendedRate: 170,
    expectedMarginPct: 46,
    defaultMixSharePct: 15,
    description: 'OIC REST vs Event-driven pub/sub design, PaaS VBCS patterns, security tokens & global error framework.',
    traceabilityNotes: 'Technical workstream design authority and middleware topology lead.'
  },
  {
    roleId: 'role_senior_consultant',
    roleName: 'Senior Functional Consultant (Config & Specs)',
    gradeCode: 'Grade B',
    seniorityTier: 'Execution',
    onshoreHourlyRate: 185,
    nearshoreHourlyRate: 125,
    offshoreHourlyRate: 55,
    onshoreCostRate: 98,
    nearshoreCostRate: 64,
    offshoreCostRate: 24,
    inHouseBillRate: 185,
    subcontractorBillRate: 160,
    gdcOffshoreBillRate: 55,
    standardBlendedRate: 135,
    expectedMarginPct: 44,
    defaultMixSharePct: 28,
    description: 'Module configuration, Rapid Implementation spreadsheets, functional unit test execution & user stories.',
    traceabilityNotes: 'Primary execution tier for business configuration and sprint deliverables.'
  },
  {
    roleId: 'role_technical_developer',
    roleName: 'Technical Developer (OIC, BIP, FastFormulas)',
    gradeCode: 'Grade B',
    seniorityTier: 'Execution',
    onshoreHourlyRate: 165,
    nearshoreHourlyRate: 110,
    offshoreHourlyRate: 45,
    onshoreCostRate: 85,
    nearshoreCostRate: 55,
    offshoreCostRate: 18,
    inHouseBillRate: 165,
    subcontractorBillRate: 140,
    gdcOffshoreBillRate: 45,
    standardBlendedRate: 110,
    expectedMarginPct: 45,
    defaultMixSharePct: 14,
    description: 'RICEFW engineering: BIP layout formatting, OIC integration mapping, FastFormula scripts & FBDI pipelines.',
    traceabilityNotes: 'Factory delivery tier heavily leveraged in offshore centers (85% offshore mix).'
  },
  {
    roleId: 'role_test_cutover_lead',
    roleName: 'QA Automation, Data Load & Cutover Specialist',
    gradeCode: 'Grade A',
    seniorityTier: 'Specialist',
    onshoreHourlyRate: 145,
    nearshoreHourlyRate: 95,
    offshoreHourlyRate: 35,
    onshoreCostRate: 75,
    nearshoreCostRate: 48,
    offshoreCostRate: 14,
    inHouseBillRate: 145,
    subcontractorBillRate: 120,
    gdcOffshoreBillRate: 35,
    standardBlendedRate: 95,
    expectedMarginPct: 43,
    defaultMixSharePct: 8,
    description: 'Mock data loading, penny-rounding trial balance reconciliation, defect triage & regression test suites.',
    traceabilityNotes: 'Testing and data assurance specialist tier supporting mock runs and cutover rehearsal.'
  }
];

// ============================================================================
// DELIVERY MODEL PYRAMIDS & STAFFING PRESETS
// ============================================================================

export interface DeliveryModelPreset {
  id: string;
  name: string;
  description: string;
  isStandard: boolean;
  deliveryMix: {
    onshore: number;
    nearshore: number;
    offshore: number;
  };
  gradeShares: {
    'Grade A': number; // Specialist (QA/Data)
    'Grade B': number; // Execution (Consultant/Dev)
    'Grade C': number; // Senior (Functional/Tech Lead)
    'Grade D': number; // Lead (Solution Architect)
    'Grade E': number; // Strategic (Partner/Director)
  };
  targetBlendedBillRate: number;
  targetBlendedCostRate: number;
  targetGrossMarginPct: number;
  recommendedUseCases?: string[];
}

export const DEFAULT_DELIVERY_PYRAMIDS: DeliveryModelPreset[] = [
  {
    id: 'pyramid_gdm_standard',
    name: 'Standard Global Delivery Model (20/80)',
    description: 'Corporate benchmark 20% Onshore, 80% Offshore delivery factory model providing optimal cost efficiency.',
    isStandard: true,
    deliveryMix: { onshore: 20, nearshore: 0, offshore: 80 },
    gradeShares: {
      'Grade A': 20,
      'Grade B': 35,
      'Grade C': 30,
      'Grade D': 10,
      'Grade E': 5
    },
    targetBlendedBillRate: 98,
    targetBlendedCostRate: 54,
    targetGrossMarginPct: 44.9,
    recommendedUseCases: ['Standard Enterprise Cloud Transformations', 'Multi-Pillar Rollouts', 'Competitive Commercial Bids']
  },
  {
    id: 'pyramid_complex_onsite',
    name: 'Complex / Client-Facing Co-Creation Model (40/60)',
    description: 'High onshore presence with deep business interaction, executive change management, and agile co-design.',
    isStandard: false,
    deliveryMix: { onshore: 40, nearshore: 0, offshore: 60 },
    gradeShares: {
      'Grade A': 15,
      'Grade B': 30,
      'Grade C': 35,
      'Grade D': 14,
      'Grade E': 6
    },
    targetBlendedBillRate: 152,
    targetBlendedCostRate: 84,
    targetGrossMarginPct: 44.7,
    recommendedUseCases: ['Complex Operating Model Redesign', 'Heavy Executive Engagement', 'Agile Co-Design Sprints']
  },
  {
    id: 'pyramid_lean_factory',
    name: 'Lean / Cost-Optimized Build Factory (15/85)',
    description: 'Maximizes offshore delivery factory leverage for standardized technical components, migrations, and reporting.',
    isStandard: false,
    deliveryMix: { onshore: 15, nearshore: 0, offshore: 85 },
    gradeShares: {
      'Grade A': 28,
      'Grade B': 42,
      'Grade C': 22,
      'Grade D': 6,
      'Grade E': 2
    },
    targetBlendedBillRate: 86,
    targetBlendedCostRate: 45,
    targetGrossMarginPct: 47.7,
    recommendedUseCases: ['Technical Lift-and-Shift', 'RICEFW Offshore Factory', 'Low-Budget Fixed Price Programs']
  },
  {
    id: 'pyramid_onshore_gov',
    name: '100% Onshore / Sovereign & Defense Model',
    description: 'Zero offshore transmission for compliance with strict defense, public sector, and data residency regulations.',
    isStandard: false,
    deliveryMix: { onshore: 100, nearshore: 0, offshore: 0 },
    gradeShares: {
      'Grade A': 15,
      'Grade B': 35,
      'Grade C': 32,
      'Grade D': 12,
      'Grade E': 6
    },
    targetBlendedBillRate: 215,
    targetBlendedCostRate: 122,
    targetGrossMarginPct: 43.3,
    recommendedUseCases: ['Public Sector / FedRAMP / Defense', 'Strict Data Residency Mandates', 'High-Security Banking Core']
  },
  {
    id: 'pyramid_strategic_advisory',
    name: 'Senior Strategic Advisory & Architecture Oversight (70/30)',
    description: 'Partner-led and architect-heavy model for blueprinting, M&A due diligence, and enterprise Chart of Accounts redesign.',
    isStandard: false,
    deliveryMix: { onshore: 70, nearshore: 0, offshore: 30 },
    gradeShares: {
      'Grade A': 8,
      'Grade B': 18,
      'Grade C': 32,
      'Grade D': 30,
      'Grade E': 12
    },
    targetBlendedBillRate: 228,
    targetBlendedCostRate: 128,
    targetGrossMarginPct: 43.9,
    recommendedUseCases: ['Wave 0 Enterprise Blueprinting', 'COA Transformation', 'Client-Side Program Assurance']
  }
];

// ============================================================================
// PHASE & WORKSTREAM STAFFING MIX OVERRIDES
// ============================================================================

export interface PhaseStaffingMixRule {
  phaseId: string;
  phaseName: string;
  defaultOnshorePct: number;
  defaultNearshorePct: number;
  defaultOffshorePct: number;
  seniorityEmphasis: string;
  rationale: string;
}

export const DEFAULT_PHASE_STAFFING_RULES: PhaseStaffingMixRule[] = [
  {
    phaseId: 'phase_enablement',
    phaseName: 'Initial Enablement & Mobilization',
    defaultOnshorePct: 80,
    defaultNearshorePct: 15,
    defaultOffshorePct: 5,
    seniorityEmphasis: 'Partner & Principal Architect (Grades D & E)',
    rationale: 'High client executive facetime, charter sign-offs, and governance kick-off.'
  },
  {
    phaseId: 'phase_design',
    phaseName: 'Enterprise Design & CRP1/2 Playbacks',
    defaultOnshorePct: 65,
    defaultNearshorePct: 15,
    defaultOffshorePct: 20,
    seniorityEmphasis: 'Functional Leads & Solution Architects (Grades C & D)',
    rationale: 'Interactive business workshops, delta gap mapping, and COA architectural sign-off.'
  },
  {
    phaseId: 'phase_build',
    phaseName: 'Sprint Build & Technical Engineering',
    defaultOnshorePct: 15,
    defaultNearshorePct: 15,
    defaultOffshorePct: 70,
    seniorityEmphasis: 'Technical Developers & Consultants (Grades A & B)',
    rationale: 'Maximum offshore factory leverage for OIC, BIP reports, FastFormulas, and FBDI scripts.'
  },
  {
    phaseId: 'phase_test_1',
    phaseName: 'Business Testing 1 - SIT & Integrations',
    defaultOnshorePct: 35,
    defaultNearshorePct: 20,
    defaultOffshorePct: 45,
    seniorityEmphasis: 'Test Leads, QA Specialists & Integration Leads',
    rationale: 'Cross-module integration runs, defect triage orchestration, and boundary data validation.'
  },
  {
    phaseId: 'phase_test_2',
    phaseName: 'Business Testing 2 - UAT & Day-in-the-Life',
    defaultOnshorePct: 70,
    defaultNearshorePct: 15,
    defaultOffshorePct: 15,
    seniorityEmphasis: 'Functional Leads & Change Specialists (Grade C)',
    rationale: 'Direct business user hand-holding, scenario simulation, and sign-off governance.'
  },
  {
    phaseId: 'phase_cutover',
    phaseName: 'Cutover Execution & Rehearsals',
    defaultOnshorePct: 75,
    defaultNearshorePct: 15,
    defaultOffshorePct: 10,
    seniorityEmphasis: 'Cutover Director, Architects & Data Specialists',
    rationale: '24/7 Command Center orchestration, financial balancing sign-off, and go-live authorization.'
  },
  {
    phaseId: 'phase_hypercare',
    phaseName: 'Hypercare & Transition to Run',
    defaultOnshorePct: 20,
    defaultNearshorePct: 20,
    defaultOffshorePct: 60,
    seniorityEmphasis: 'Support Consultants & SME Escalations (Grades A & B)',
    rationale: 'Ticket burndown, period-end close support, and AMS operational handover.'
  }
];

export interface WorkstreamStaffingMixRule {
  workstreamId: string;
  workstreamName: string;
  category: string;
  defaultOnshorePct: number;
  defaultNearshorePct: number;
  defaultOffshorePct: number;
  factoryLeveragePotential: 'High' | 'Medium' | 'Low';
  typicalRoleMix: string;
}

export const DEFAULT_WORKSTREAM_STAFFING_RULES: WorkstreamStaffingMixRule[] = [
  {
    workstreamId: 'ws_func_erp',
    workstreamName: 'Financials Core & Statutory (ERP)',
    category: 'Functional',
    defaultOnshorePct: 40,
    defaultNearshorePct: 20,
    defaultOffshorePct: 40,
    factoryLeveragePotential: 'Medium',
    typicalRoleMix: '1 Lead Architect + 2 Senior Functional + 2 Config Consultants'
  },
  {
    workstreamId: 'ws_func_scm',
    workstreamName: 'Supply Chain & Manufacturing (SCM)',
    category: 'Functional',
    defaultOnshorePct: 45,
    defaultNearshorePct: 20,
    defaultOffshorePct: 35,
    factoryLeveragePotential: 'Medium',
    typicalRoleMix: '1 SCM Lead + 2 Senior Functional + 2 Warehouse Config Specialists'
  },
  {
    workstreamId: 'ws_func_hcm',
    workstreamName: 'Human Capital & Global Payroll (HCM)',
    category: 'Functional',
    defaultOnshorePct: 40,
    defaultNearshorePct: 20,
    defaultOffshorePct: 40,
    factoryLeveragePotential: 'Medium',
    typicalRoleMix: '1 HCM Lead + 2 Payroll Specialists + 1 FastFormula Developer'
  },
  {
    workstreamId: 'ws_tech_oic',
    workstreamName: 'Technical & OIC Integrations',
    category: 'Technical',
    defaultOnshorePct: 20,
    defaultNearshorePct: 15,
    defaultOffshorePct: 65,
    factoryLeveragePotential: 'High',
    typicalRoleMix: '1 Tech Architect (Onshore) + 4 OIC Developers (Offshore)'
  },
  {
    workstreamId: 'ws_data_conv',
    workstreamName: 'Data Migration & Conversions (FBDI)',
    category: 'Data',
    defaultOnshorePct: 25,
    defaultNearshorePct: 15,
    defaultOffshorePct: 60,
    factoryLeveragePotential: 'High',
    typicalRoleMix: '1 Data Lead + 3 ETL / Cleansing Specialists'
  },
  {
    workstreamId: 'ws_test_qa',
    workstreamName: 'Quality Assurance & Automated Testing',
    category: 'Testing',
    defaultOnshorePct: 25,
    defaultNearshorePct: 20,
    defaultOffshorePct: 55,
    factoryLeveragePotential: 'High',
    typicalRoleMix: '1 Test Manager + 3 Automation / Execution Analysts'
  },
  {
    workstreamId: 'ws_ocm_train',
    workstreamName: 'Change Management & End-User Training',
    category: 'Change',
    defaultOnshorePct: 80,
    defaultNearshorePct: 10,
    defaultOffshorePct: 10,
    factoryLeveragePotential: 'Low',
    typicalRoleMix: '1 OCM Lead + 2 Instructional Designers'
  },
  {
    workstreamId: 'ws_gov_steerco',
    workstreamName: 'Program Governance, PMO & SteerCo',
    category: 'Management',
    defaultOnshorePct: 85,
    defaultNearshorePct: 10,
    defaultOffshorePct: 5,
    factoryLeveragePotential: 'Low',
    typicalRoleMix: '1 Engagement Partner + 1 PMO Director'
  }
];

// ============================================================================
// COMMERCIAL & FINANCIAL GOVERNANCE MULTIPLIERS
// ============================================================================

export interface CommercialGovernanceConfig {
  targetGrossMarginPct: number;       // e.g. 42.0%
  minimumFloorMarginPct: number;      // e.g. 32.0% (DoA trigger below this)
  contractRiskMultipliers: {
    fixedPrice: number;               // e.g. 1.12x (risk contingency baked in)
    timeAndMaterials: number;         // e.g. 1.00x
    hybridMilestone: number;          // e.g. 1.06x
  };
  doaThresholds: {
    tier1StandardMaxRevenue: number;  // e.g. $2,500,000
    tier2PracticeMaxRevenue: number;  // e.g. $6,000,000
    tier3DealBoardRevenue: number;    // e.g. > $6,000,000
  };
  travelAndLivingPctOfOnshore: number;// e.g. 8.0%
  annualColaEscalatorPct: number;     // e.g. 3.5% per year
  volumeDiscountTiers: {
    tier1Hours: number;               // e.g. 10,000 hrs
    tier1DiscountPct: number;         // e.g. 3.0%
    tier2Hours: number;               // e.g. 20,000 hrs
    tier2DiscountPct: number;         // e.g. 6.0%
  };
  contingencyP80DefaultPct: number;   // e.g. 15.0%
}

export const DEFAULT_COMMERCIAL_GOVERNANCE: CommercialGovernanceConfig = {
  targetGrossMarginPct: 45.0,
  minimumFloorMarginPct: 32.0,
  contractRiskMultipliers: {
    fixedPrice: 1.12,
    timeAndMaterials: 1.00,
    hybridMilestone: 1.06
  },
  doaThresholds: {
    tier1StandardMaxRevenue: 2500000,
    tier2PracticeMaxRevenue: 6000000,
    tier3DealBoardRevenue: 6000001
  },
  travelAndLivingPctOfOnshore: 8.0,
  annualColaEscalatorPct: 3.5,
  volumeDiscountTiers: {
    tier1Hours: 10000,
    tier1DiscountPct: 3.0,
    tier2Hours: 20000,
    tier2DiscountPct: 6.0
  },
  contingencyP80DefaultPct: 15.0
};

// ============================================================================
// ESTIMATION BENCHMARK MASTER CONFIG INTERFACE
// ============================================================================

export interface EstimationBenchmarkMasterConfig {
  profileId: string;
  profileName: string;
  description: string;
  lastCalibratedAt: string;
  // Sizing Layers 1 to 4
  wbsActivities: WbsActivityItem[];
  moduleIntrinsicConfigs: Record<string, ModuleIntrinsicConfig>;
  ricefwMasterConfig: RicefwMasterConfig;
  scaleDriverStepCurves: ScaleDriverStepCurveItem[];
  // Rates & Delivery
  roleRateCards: RoleRateCardItem[];
  deliveryPyramids: DeliveryModelPreset[];
  activeDeliveryPyramidId: string;
  phaseStaffingRules: PhaseStaffingMixRule[];
  workstreamStaffingRules: WorkstreamStaffingMixRule[];
  commercialGovernance: CommercialGovernanceConfig;
  // Feature flags
  enableStepCurveScaling: boolean;
  enableRicefwCatalogPricing: boolean;
}

export const CALIBRATION_PROFILES: Record<string, EstimationBenchmarkMasterConfig> = {
  oracle_tcm_standard: {
    profileId: 'oracle_tcm_standard',
    profileName: 'Oracle True Cloud Method (TCM) Standard',
    description: 'Gold-standard empirical benchmark calibrated across 120+ Oracle Cloud implementations. 240h XS baseline with balanced GDM staffing.',
    lastCalibratedAt: '2026-08-01',
    wbsActivities: DEFAULT_WBS_ACTIVITIES,
    moduleIntrinsicConfigs: DEFAULT_MODULE_INTRINSIC_CONFIGS,
    ricefwMasterConfig: {
      patterns: DEFAULT_RICEFW_PATTERNS,
      oicAcceleratorDiscountPct: 35,
      legacyDataDirtyPenaltyPct: 25
    },
    scaleDriverStepCurves: DEFAULT_SCALE_STEP_CURVES,
    roleRateCards: DEFAULT_ROLE_RATE_CARDS,
    deliveryPyramids: DEFAULT_DELIVERY_PYRAMIDS,
    activeDeliveryPyramidId: 'pyramid_gdm_standard',
    phaseStaffingRules: DEFAULT_PHASE_STAFFING_RULES,
    workstreamStaffingRules: DEFAULT_WORKSTREAM_STAFFING_RULES,
    commercialGovernance: DEFAULT_COMMERCIAL_GOVERNANCE,
    enableStepCurveScaling: true,
    enableRicefwCatalogPricing: true
  }
};

// ============================================================================
// DETERMINISTIC BLENDED RATE & COMMERCIAL CALCULATION UTILITIES
// ============================================================================

export interface BlendedRateCalculationResult {
  blendedBillRate: number;
  blendedCostRate: number;
  grossMarginPct: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  onshoreShare: number;
  nearshoreShare: number;
  offshoreShare: number;
  revenueByRegion: {
    onshore: number;
    nearshore: number;
    offshore: number;
  };
  costByRegion: {
    onshore: number;
    nearshore: number;
    offshore: number;
  };
  roleBreakdown: Array<{
    roleId: string;
    roleName: string;
    gradeCode: string;
    sharePct: number;
    hours: number;
    weightedBillRate: number;
    weightedCostRate: number;
    roleRevenue: number;
    roleCost: number;
    roleMarginPct: number;
  }>;
  formulaDecomposition: {
    step1LocationWeights: string;
    step2RoleWeights: string;
    step3Summary: string;
  };
}

export function calculateMasterBlendedRate(
  targetHours: number,
  deliveryMix: { onshore: number; nearshore: number; offshore: number },
  roleRateCards: RoleRateCardItem[] = DEFAULT_ROLE_RATE_CARDS,
  gradeOverrides?: Record<string, number>
): BlendedRateCalculationResult {
  const normOnshore = (deliveryMix.onshore ?? 20) / 100;
  const normNearshore = (deliveryMix.nearshore ?? 0) / 100;
  const normOffshore = (deliveryMix.offshore ?? 80) / 100;

  let totalRevenue = 0;
  let totalCost = 0;
  let onshoreRevenue = 0;
  let nearshoreRevenue = 0;
  let offshoreRevenue = 0;
  let onshoreCost = 0;
  let nearshoreCost = 0;
  let offshoreCost = 0;

  // Calculate role level breakdown
  const roleBreakdown = roleRateCards.map(role => {
    // If user provided grade share overrides, map to role's grade
    let roleShare = role.defaultMixSharePct;
    if (gradeOverrides && gradeOverrides[role.gradeCode] !== undefined) {
      // Scale proportionally within that grade
      roleShare = gradeOverrides[role.gradeCode] / 2; // approximation for 2 roles per grade
    }

    const roleFraction = roleShare / 100;
    const roleHours = Math.round(targetHours * roleFraction);

    // Location-blended bill & cost rate for this role
    const roleWeightedBill = (
      role.onshoreHourlyRate * normOnshore +
      role.nearshoreHourlyRate * normNearshore +
      role.offshoreHourlyRate * normOffshore
    );

    const roleWeightedCost = (
      role.onshoreCostRate * normOnshore +
      role.nearshoreCostRate * normNearshore +
      role.offshoreCostRate * normOffshore
    );

    const roleRevenue = roleHours * roleWeightedBill;
    const roleCost = roleHours * roleWeightedCost;
    const roleProfit = roleRevenue - roleCost;
    const roleMarginPct = roleRevenue > 0 ? (roleProfit / roleRevenue) * 100 : 0;

    totalRevenue += roleRevenue;
    totalCost += roleCost;

    onshoreRevenue += roleHours * normOnshore * role.onshoreHourlyRate;
    nearshoreRevenue += roleHours * normNearshore * role.nearshoreHourlyRate;
    offshoreRevenue += roleHours * normOffshore * role.offshoreHourlyRate;

    onshoreCost += roleHours * normOnshore * role.onshoreCostRate;
    nearshoreCost += roleHours * normNearshore * role.nearshoreCostRate;
    offshoreCost += roleHours * normOffshore * role.offshoreCostRate;

    return {
      roleId: role.roleId,
      roleName: role.roleName,
      gradeCode: role.gradeCode,
      sharePct: roleShare,
      hours: roleHours,
      weightedBillRate: Math.round(roleWeightedBill),
      weightedCostRate: Math.round(roleWeightedCost),
      roleRevenue: Math.round(roleRevenue),
      roleCost: Math.round(roleCost),
      roleMarginPct: Number(roleMarginPct.toFixed(1))
    };
  });

  const grossProfit = totalRevenue - totalCost;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const blendedBillRate = targetHours > 0 ? totalRevenue / targetHours : 0;
  const blendedCostRate = targetHours > 0 ? totalCost / targetHours : 0;

  const roundedTotalRev = Math.round(totalRevenue);
  const roundedTotalCost = Math.round(totalCost);
  const roundedOnshoreRev = Math.round(onshoreRevenue);
  const roundedNearshoreRev = Math.round(nearshoreRevenue);
  // Absorb any minor 1-dollar rounding discrepancy into offshore to ensure exact equality
  const roundedOffshoreRev = roundedTotalRev - roundedOnshoreRev - roundedNearshoreRev;

  const roundedOnshoreCost = Math.round(onshoreCost);
  const roundedNearshoreCost = Math.round(nearshoreCost);
  const roundedOffshoreCost = roundedTotalCost - roundedOnshoreCost - roundedNearshoreCost;

  return {
    blendedBillRate: Number(blendedBillRate.toFixed(2)),
    blendedCostRate: Number(blendedCostRate.toFixed(2)),
    grossMarginPct: Number(grossMarginPct.toFixed(1)),
    revenue: roundedTotalRev,
    cost: roundedTotalCost,
    grossProfit: Math.round(grossProfit),
    onshoreShare: deliveryMix.onshore,
    nearshoreShare: deliveryMix.nearshore,
    offshoreShare: deliveryMix.offshore,
    revenueByRegion: {
      onshore: roundedOnshoreRev,
      nearshore: roundedNearshoreRev,
      offshore: roundedOffshoreRev
    },
    costByRegion: {
      onshore: roundedOnshoreCost,
      nearshore: roundedNearshoreCost,
      offshore: roundedOffshoreCost
    },
    roleBreakdown,
    formulaDecomposition: {
      step1LocationWeights: `Location Weighted Mix = (${deliveryMix.onshore}% Onshore + ${deliveryMix.nearshore}% Nearshore + ${deliveryMix.offshore}% Offshore)`,
      step2RoleWeights: `Role Weighted Mix across 7 Grade Roles = Sum(Role_i Hours * WeightedRate_i)`,
      step3Summary: `Blended Rate = $${blendedBillRate.toFixed(2)}/hr | Cost = $${blendedCostRate.toFixed(2)}/hr | Margin = ${grossMarginPct.toFixed(1)}%`
    }
  };
}

