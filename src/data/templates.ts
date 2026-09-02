import { ProjectScenario } from '../types';

export const PRESET_SCENARIOS: ProjectScenario[] = [
  {
    id: 'global_mfg',
    name: 'Global Manufacturing Enterprise (ERP + SCM + OIC)',
    description: 'Multi-plant discrete manufacturing, multi-currency global ledgers, high-density OIC interfaces, and WMS integration.',
    selectedModules: [
      'erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_cm', 'erp_tax', 'erp_ppm', 'erp_proc',
      'scm_inv', 'scm_om', 'scm_mfg', 'scm_maint', 'scm_plan', 'scm_wms', 'scm_gop'
    ],
    scaleDrivers: {
      scm_plants: 6,
      scm_wh: 12,
      scm_inv: 24,
      fin_ent: 8,
      fin_led: 4,
      fin_bu: 6,
      fin_cur: 6,
      fin_tax: 12,
      fin_coa_segments: 8,
      fin_secondary_ledgers: 2,
      fin_sla_rules: 4,
      fin_intercompany_pairs: 5,
      hcm_hc: 6500,
      hcm_pay_countries: 4,
      hcm_union_groups: 3,
      tech_oic: 36,
      tech_paas: 5,
      tech_data_objects: 24,
      tech_conversion_cycles: 3,
      tech_historical_years: 2,
      tech_reports_bip: 55,
      tech_reports_otbi: 35,
      tech_fast_formulas: 12,
      tech_workflows: 18,
      tech_bpm_approval_groups: 6,
      tech_security_roles: 20
    },
    complexityAnswers: {
      functional: [2, 3], // Moderate Custom, Complex Global Matrix
      technical: [2, 2],  // High OIC, Dedicated VBCS
      data: [2, 2],       // Disparate legacy, 2-year history
      ocm: [1, 1],        // Supportive, Adequate allocation
      governance: [1, 1]  // Standard velocity, defined PMO
    },
    moduleQuestionAnswers: {
      erp_gl: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      erp_ap: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    },
    confidence: 0.75,
    clientModifiers: {
      decisionVelocity: 1.0,
      dataDebt: 1.0,
      cloudMindset: 1.0,
      integrationVolatility: 1.0,
      smeAvailability: 1.0,
      regulatoryCompliance: 1.0,
      changeResistance: 1.0,
      customizationPolicy: 1.0
    },
    rolloutApproach: 'phased_geo',
    rolloutWaves: 3,
    rolloutQuestionAnswers: {
      rq_localization: 2, // C3: 4-8 Multi-Jurisdiction
      rq_template_divergence: 1, // C2: Core Template with Minor Operational Delta
      rq_coexistence: 2, // C3: Bidirectional Transactional Bridging
      rq_intercompany: 2, // C3: High-Frequency Intercompany Trade
      rq_data_cutover_factory: 2, // C3: Disparate Regional Legacy Sources
      rq_change_readiness: 1, // C2: 2-3 Regional Language Packs
      rq_concurrency: 1, // C2: Moderate Overlap (-2 wks)
      rq_shared_services: 1, // C2: Central GPO Council
      rq_pilot_fidelity: 0, // C1: High-Fidelity Pilot
      rq_environment_patch: 2, // C3: Overlapping Wave Collisions
      rq_stabilization_hypercare: 1, // C2: 6-Week Extended Hypercare
      rq_network_topology: 1 // C2: Standard Global SD-WAN
    },
    waveDescriptions: [
      'Wave 1: North America Headquarters & Primary Discrete Plant (Pilot)',
      'Wave 2: EMEA Operations (UK, Germany, France) & Distribution Hubs',
      'Wave 3: APAC & LATAM Regional Legal Entities'
    ],
    rolloutOverlapWeeks: 6,
    blackoutPeriods: [
      {
        id: 'bo_yearend_2026',
        name: 'Corporate Fiscal Year-End Financial Freeze',
        type: 'fiscal_yearend',
        startDate: '2026-12-15',
        endDate: '2027-01-10',
        severity: 'hard_freeze',
        impact: 'No configuration changes, production data loads, or testing cutovers permitted during year-end close.'
      },
      {
        id: 'bo_q4_peak_mfg',
        name: 'Q4 Peak Manufacturing & Holiday Trading Freeze',
        type: 'peak_trading',
        startDate: '2026-11-15',
        endDate: '2026-12-05',
        severity: 'soft_freeze',
        impact: 'Plant floor shop operations at 100% capacity; factory SME availability restricted.'
      },
      {
        id: 'bo_inv_count',
        name: 'Annual Physical Inventory Stock Count',
        type: 'inventory_count',
        startDate: '2027-06-25',
        endDate: '2027-07-02',
        severity: 'hard_freeze',
        impact: 'All inventory adjustments and warehouse movements frozen for physical stock count reconciliation.'
      }
    ],
    deliveryMix: {
      onshore: 35,
      nearshore: 25,
      offshore: 40
    },
    podCohort: 'B',
    projectWeeks: 64,
    targetStartDate: '2026-09-01',
    clientTargetGoLiveDate: '2027-11-23',
    schedulingMode: 'forward',
    scheduleModifiers: {
      methodology: 'hybrid_oum',
      fastTrackingOverlapPct: 15,
      clientDecisionSLA: 'standard_5d',
      envReadinessLeadWeeks: 2,
      dataReadinessScore: 2,
      sprintCadenceWeeks: 3
    }
  },
  {
    id: 'fast_track_erp',
    name: 'Mid-Market ERP & Procurement Fast-Track (Big Bang)',
    description: 'Rapid deployment for modern financials and procurement adopting 90%+ Oracle Modern Best Practice (MBP).',
    selectedModules: [
      'erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_cm', 'erp_proc'
    ],
    scaleDrivers: {
      scm_plants: 0,
      scm_wh: 2,
      scm_inv: 4,
      fin_ent: 3,
      fin_led: 1,
      fin_bu: 2,
      fin_cur: 2,
      fin_tax: 3,
      fin_coa_segments: 6,
      fin_secondary_ledgers: 0,
      fin_sla_rules: 1,
      fin_intercompany_pairs: 1,
      hcm_hc: 1200,
      hcm_pay_countries: 1,
      hcm_union_groups: 0,
      tech_oic: 12,
      tech_paas: 1,
      tech_data_objects: 10,
      tech_conversion_cycles: 2,
      tech_historical_years: 0,
      tech_reports_bip: 20,
      tech_reports_otbi: 25,
      tech_fast_formulas: 2,
      tech_workflows: 8,
      tech_bpm_approval_groups: 2,
      tech_security_roles: 8
    },
    complexityAnswers: {
      functional: [0, 0], // MBP standard, single/domestic
      technical: [1, 0],  // Moderate OIC, OOTB config
      data: [0, 0],       // Single ERP, opening balances
      ocm: [0, 0],        // Proactive, dedicated team
      governance: [0, 0]  // Rapid velocity, strict scope
    },
    moduleQuestionAnswers: {
      erp_gl: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      erp_ap: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    confidence: 0.85,
    clientModifiers: {
      decisionVelocity: 0.95,
      dataDebt: 0.95,
      cloudMindset: 0.95,
      integrationVolatility: 0.95,
      smeAvailability: 0.95,
      regulatoryCompliance: 1.0,
      changeResistance: 0.95,
      customizationPolicy: 0.95
    },
    rolloutApproach: 'big_bang',
    rolloutWaves: 1,
    rolloutQuestionAnswers: {
      rq_localization: 0,
      rq_template_divergence: 0,
      rq_coexistence: 0,
      rq_intercompany: 0,
      rq_data_cutover_factory: 0,
      rq_change_readiness: 0,
      rq_concurrency: 0,
      rq_shared_services: 0,
      rq_pilot_fidelity: 0,
      rq_environment_patch: 0,
      rq_stabilization_hypercare: 0,
      rq_network_topology: 0
    },
    waveDescriptions: ['Single Global Big Bang Cutover'],
    rolloutOverlapWeeks: 0,
    blackoutPeriods: [
      {
        id: 'bo_yearend_2026_fast',
        name: 'Year-End Financial Audit Freeze',
        type: 'fiscal_yearend',
        startDate: '2026-12-20',
        endDate: '2027-01-05',
        severity: 'hard_freeze',
        impact: 'Finance team closed to testing during annual audit finalization.'
      }
    ],
    deliveryMix: {
      onshore: 45,
      nearshore: 20,
      offshore: 35
    },
    podCohort: 'B',
    projectWeeks: 36,
    targetStartDate: '2026-10-01',
    clientTargetGoLiveDate: '2027-06-08',
    schedulingMode: 'forward',
    scheduleModifiers: {
      methodology: 'agile_iterative',
      fastTrackingOverlapPct: 20,
      clientDecisionSLA: 'rapid_3d',
      envReadinessLeadWeeks: 0,
      dataReadinessScore: 1,
      sprintCadenceWeeks: 2
    }
  },
  {
    id: 'healthcare_hcm',
    name: 'Enterprise Healthcare & Union Payroll Cloud',
    description: 'Complex multi-state health system with complex union rules, time card differentials, benefits open enrollment, and ORC.',
    selectedModules: [
      'hcm_core', 'hcm_payroll', 'hcm_absence', 'hcm_time', 'hcm_benefits', 'hcm_talent', 'hcm_orc'
    ],
    scaleDrivers: {
      scm_plants: 0,
      scm_wh: 0,
      scm_inv: 2,
      fin_ent: 4,
      fin_led: 2,
      fin_bu: 3,
      fin_cur: 1,
      fin_tax: 8,
      fin_coa_segments: 6,
      fin_secondary_ledgers: 0,
      fin_sla_rules: 2,
      fin_intercompany_pairs: 2,
      hcm_hc: 18500,
      hcm_pay_countries: 1,
      hcm_union_groups: 6,
      tech_oic: 22,
      tech_paas: 3,
      tech_data_objects: 16,
      tech_conversion_cycles: 3,
      tech_historical_years: 1,
      tech_reports_bip: 40,
      tech_reports_otbi: 45,
      tech_fast_formulas: 35,
      tech_workflows: 16,
      tech_bpm_approval_groups: 4,
      tech_security_roles: 16
    },
    complexityAnswers: {
      functional: [2, 1], // Moderate custom rules, Domestic multi-entity
      technical: [2, 1],  // High OIC, Minor VB Studio
      data: [1, 1],       // 2-3 sources, 1 year history
      ocm: [2, 2],        // High skepticism, Part-time SMEs
      governance: [1, 1]  // Standard velocity, defined PMO
    },
    moduleQuestionAnswers: {},
    confidence: 0.70,
    clientModifiers: {
      decisionVelocity: 1.05,
      dataDebt: 1.15,
      cloudMindset: 1.10,
      integrationVolatility: 1.10,
      smeAvailability: 1.20,
      regulatoryCompliance: 1.25,
      changeResistance: 1.20,
      customizationPolicy: 1.15
    },
    rolloutApproach: 'phased_functional',
    rolloutWaves: 2,
    rolloutQuestionAnswers: {
      rq_localization: 0,
      rq_template_divergence: 1,
      rq_coexistence: 1,
      rq_intercompany: 0,
      rq_data_cutover_factory: 2,
      rq_change_readiness: 2,
      rq_concurrency: 1,
      rq_shared_services: 1,
      rq_pilot_fidelity: 1,
      rq_environment_patch: 1,
      rq_stabilization_hypercare: 2,
      rq_network_topology: 0
    },
    waveDescriptions: [
      'Wave 1: Core HR, Talent & Recruiting Cloud',
      'Wave 2: Global Payroll, Time & Labor, and Benefits Open Enrollment'
    ],
    rolloutOverlapWeeks: 6,
    blackoutPeriods: [
      {
        id: 'bo_benefits_oe',
        name: 'Annual Benefits Open Enrollment Window',
        type: 'custom',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        severity: 'hard_freeze',
        impact: 'Employee self-service and carrier feeds frozen for annual benefits plan selections.'
      }
    ],
    deliveryMix: {
      onshore: 40,
      nearshore: 20,
      offshore: 40
    },
    podCohort: 'A',
    projectWeeks: 48,
    targetStartDate: '2026-09-15',
    clientTargetGoLiveDate: '2027-08-17',
    schedulingMode: 'forward',
    scheduleModifiers: {
      methodology: 'hybrid_oum',
      fastTrackingOverlapPct: 10,
      clientDecisionSLA: 'standard_5d',
      envReadinessLeadWeeks: 2,
      dataReadinessScore: 3,
      sprintCadenceWeeks: 3
    }
  },
  {
    id: 'retail_sc_epm',
    name: 'Omnichannel Retail SCM, Planning & EPM',
    description: 'Fast-moving consumer goods and retail with high-frequency replenishment, order promising, and corporate financial consolidation.',
    selectedModules: [
      'erp_gl', 'erp_ap', 'erp_ar', 'erp_cm', 'erp_proc',
      'scm_inv', 'scm_om', 'scm_plan', 'scm_wms', 'scm_gop',
      'epm_fccs', 'epm_epbcs', 'epm_edm'
    ],
    scaleDrivers: {
      scm_plants: 2,
      scm_wh: 8,
      scm_inv: 18,
      fin_ent: 5,
      fin_led: 2,
      fin_bu: 4,
      fin_cur: 3,
      fin_tax: 6,
      fin_coa_segments: 7,
      fin_secondary_ledgers: 1,
      fin_sla_rules: 2,
      fin_intercompany_pairs: 3,
      hcm_hc: 4200,
      hcm_pay_countries: 2,
      hcm_union_groups: 1,
      tech_oic: 28,
      tech_paas: 4,
      tech_data_objects: 18,
      tech_conversion_cycles: 3,
      tech_historical_years: 1,
      tech_reports_bip: 42,
      tech_reports_otbi: 38,
      tech_fast_formulas: 8,
      tech_workflows: 14,
      tech_bpm_approval_groups: 4,
      tech_security_roles: 14
    },
    complexityAnswers: {
      functional: [1, 2], // Minor variances, Global multi-currency
      technical: [2, 2],  // High OIC, Dedicated VBCS
      data: [1, 1],       // 2-3 sources, 1 year history
      ocm: [1, 1],        // Supportive, Adequate core team
      governance: [0, 1]  // Rapid velocity, Defined PMO
    },
    moduleQuestionAnswers: {},
    confidence: 0.78,
    clientModifiers: {
      decisionVelocity: 1.0,
      dataDebt: 1.05,
      cloudMindset: 1.0,
      integrationVolatility: 1.10,
      smeAvailability: 1.0,
      regulatoryCompliance: 1.05,
      changeResistance: 1.05,
      customizationPolicy: 1.05
    },
    rolloutApproach: 'pilot_rollout',
    rolloutWaves: 3,
    rolloutQuestionAnswers: {
      rq_localization: 1,
      rq_template_divergence: 1,
      rq_coexistence: 2,
      rq_intercompany: 2,
      rq_data_cutover_factory: 1,
      rq_change_readiness: 1,
      rq_concurrency: 1,
      rq_shared_services: 1,
      rq_pilot_fidelity: 1,
      rq_environment_patch: 1,
      rq_stabilization_hypercare: 1,
      rq_network_topology: 1
    },
    waveDescriptions: [
      'Wave 1: Flagship Distribution Centers & Corporate Financials (Pilot)',
      'Wave 2: Regional Retail Store Network & Replenishment',
      'Wave 3: E-Commerce Fulfillment & Corporate EPM Consolidation'
    ],
    rolloutOverlapWeeks: 5,
    blackoutPeriods: [
      {
        id: 'bo_black_friday_retail',
        name: 'Peak Holiday Trading & Black Friday Freeze',
        type: 'peak_trading',
        startDate: '2026-11-10',
        endDate: '2027-01-05',
        severity: 'hard_freeze',
        impact: 'Retail POS and order orchestration absolute change freeze during peak shopping season.'
      }
    ],
    deliveryMix: {
      onshore: 35,
      nearshore: 30,
      offshore: 35
    },
    podCohort: 'C',
    projectWeeks: 52,
    targetStartDate: '2026-09-01',
    clientTargetGoLiveDate: '2027-08-31',
    schedulingMode: 'forward',
    scheduleModifiers: {
      methodology: 'hybrid_oum',
      fastTrackingOverlapPct: 15,
      clientDecisionSLA: 'standard_5d',
      envReadinessLeadWeeks: 0,
      dataReadinessScore: 2,
      sprintCadenceWeeks: 2
    }
  }
];
