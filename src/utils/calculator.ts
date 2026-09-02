import {
  ProjectScenario,
  CalculatedProjectData,
  Workstream,
  ImplementationPhase,
  OracleModule,
  ScheduleFeasibility,
  PhaseDeliveryModel,
  PhaseOverride,
  WaveScheduleItem,
  RolloutComplexityBreakdownItem,
  ModuleEffortEstimate,
  TShirtSize,
  ScaleDrivers,
  EnvironmentStrategyData,
  EnvironmentInstance,
  EnvironmentP2TEvent,
  EnvironmentPatchEvent,
  EnvironmentReadinessCheckItem
} from '../types';
import {
  ORACLE_MODULE_CATALOG,
  COMPLEXITY_PILLARS,
  PILLAR_QUESTIONS,
  IMPLEMENTATION_PHASES,
  WORKSTREAMS_CATALOG,
  PROJECT_MILESTONES,
  ROLE_RATES,
  ORACLE_PATCH_COHORTS
} from '../data/oraclePhases';
import { MODULE_TOP_20_QUESTIONS } from '../data/moduleScopingQuestions';
import { ENTERPRISE_ROLLOUT_QUESTIONS } from '../data/rolloutQuestions';
import { calculateLeadershipGaps } from '../data/leadershipGapsData';
import { calculateDeliveryAssurance } from './deliveryAssuranceCalculator';
import { calculateMultiVendorMetrics } from './multiVendorCalculator';
import {
  DEFAULT_TECHNICAL_INTEGRATIONS,
  TECHNICAL_OBJECT_SMC_CATALOG,
  calculateIntegrationEffort,
  CONVERSION_TSHIRT_BENCHMARKS,
  CONVERSION_MOCK_SLIDING_SCALE,
  getMockCumulativeMultiplier
} from '../data/technicalScopingData';
import {
  DEFAULT_ROLE_RATE_CARDS,
  calculateMasterBlendedRate
} from '../data/benchmarkMasterData';

export const T_SHIRT_BASE_HOURS: Record<TShirtSize, number> = {
  XS: 240,
  S: 400,
  M: 640,
  L: 980,
  XL: 1480,
  XXL: 2200
};

export function calculateProjectMetrics(scenario: ProjectScenario): CalculatedProjectData {
  const {
    selectedModules,
    scaleDrivers,
    complexityAnswers,
    moduleQuestionAnswers = {},
    confidence,
    clientModifiers,
    rolloutApproach = 'big_bang',
    rolloutWaves = 1,
    rolloutOverlapWeeks = 4,
    blackoutPeriods = [],
    deliveryMix,
    podCohort,
    projectWeeks,
    targetStartDate,
    contingencyPctOverride
  } = scenario;

  // 1. Module Base Effort & Detailed 20-Question T-Shirt Complexity Calculation
  const allAvailableModules = [...ORACLE_MODULE_CATALOG, ...(scenario.customModules || [])];
  const selectedModDefs = allAvailableModules.filter(m => selectedModules.includes(m.id));

  const moduleComplexityScores: Record<string, { avgScore: number; additionalHours: number }> = {};
  let moduleBaseHours = 0;
  const moduleScopingHours = 0; // Question answers determine T-Shirt sizing directly rather than adding individual hour increments

  selectedModules.forEach(modId => {
    const modDef = allAvailableModules.find(m => m.id === modId) || {
      id: modId,
      name: modId,
      pillar: 'ERP',
      description: '',
      baseEffortHours: 400,
      complexityFactor: 1.0
    };

    const customQuestionsForMod = scenario.customModuleQuestions?.[modId];
    const qList = (customQuestionsForMod && customQuestionsForMod.length > 0)
      ? customQuestionsForMod
      : (MODULE_TOP_20_QUESTIONS[modId] || []);
    const answers = moduleQuestionAnswers[modId] || Array(qList.length > 0 ? qList.length : 20).fill(1); // Default Level 2 (index 1)
    let totalScore = 0;

    qList.forEach((q, qIdx) => {
      const optIdx = answers[qIdx] !== undefined ? answers[qIdx] : 1;
      const opt = q.options[optIdx] || q.options[0];
      totalScore += opt.score;
    });

    const avgScore = qList.length > 0 ? Number((totalScore / qList.length).toFixed(2)) : 2.0;

    // Derived T-Shirt size from 20-Question composite average score:
    let derivedSize: TShirtSize = 'M';
    if (avgScore < 1.60) derivedSize = 'XS';
    else if (avgScore < 2.35) derivedSize = 'S';
    else if (avgScore < 3.05) derivedSize = 'M';
    else if (avgScore < 3.65) derivedSize = 'L';
    else if (avgScore < 3.90) derivedSize = 'XL';
    else derivedSize = 'XXL';

    const activeSize = scenario.moduleTShirtOverrides?.[modId] || derivedSize;
    const baseTShirtHrs = T_SHIRT_BASE_HOURS[activeSize] || 640;
    const calculatedBase = Math.round(baseTShirtHrs * modDef.complexityFactor);

    moduleComplexityScores[modId] = { avgScore, additionalHours: 0 };
    moduleBaseHours += calculatedBase;
  });

  // 2. Physical Scale Drivers Effort & Data Conversion Sizing (TBD 5-Tier T-Shirt & 4-Mock Sliding Scale)
  const dataObjects = scaleDrivers.tech_data_objects || 0;
  const conversionCycles = scaleDrivers.tech_conversion_cycles !== undefined ? Math.max(1, scaleDrivers.tech_conversion_cycles) : 3;
  const historicalYears = scaleDrivers.tech_historical_years !== undefined ? Math.max(0, scaleDrivers.tech_historical_years) : 1;

  // TBD 4-Tier Mock Sliding Scale Cumulative Multiplier (Whiteboard Image 4)
  // Mock 1: 100% (1.00) | Mock 2: 80% (cum: 1.80) | Mock 3: 60% (cum: 2.40) | Mock 4: 40% (cum: 2.80)
  const cumulativeMockMultiplier = getMockCumulativeMultiplier(conversionCycles);

  // History depth multiplier: +12% per year of historical transactional data (0 = +0%, 1 = +12%, 2 = +24%, 3+ = +36%)
  const historyMultiplier = 1.0 + Math.min(0.50, historicalYears * 0.12);

  // Calculate object T-shirt distribution (default average is Medium = 27h E2E + 18h Load = 45h per single mock)
  const baseSingleMockHours = Math.round(dataObjects * CONVERSION_TSHIRT_BENCHMARKS.M.totalPerMockHours);
  const e2eTotalHours = Math.round(dataObjects * CONVERSION_TSHIRT_BENCHMARKS.M.e2eHours * cumulativeMockMultiplier);
  const loadTotalHours = Math.round(dataObjects * CONVERSION_TSHIRT_BENCHMARKS.M.loadHours * cumulativeMockMultiplier);

  // Total base conversion hours across all mock cycles with historical depth
  const baseConversionHours = Math.round(baseSingleMockHours * cumulativeMockMultiplier * historyMultiplier);
  const conversionHoursPerCycle = conversionCycles > 0 ? Math.round(baseConversionHours / conversionCycles) : 0;

  // Generate per-mock sliding scale breakdown array
  const mockSlidingBreakdown = Array.from({ length: conversionCycles }).map((_, idx) => {
    const mockNum = idx + 1;
    let pct = 0.30;
    let name = `Mock ${mockNum} (Additional Cycle)`;
    let desc = 'Additional load verification & cleansing iteration';
    if (mockNum === 1) {
      pct = 1.00;
      name = 'Mock 1 (Baseline Extraction & Cleansing)';
      desc = 'Initial data extraction, field cross-referencing, FBDI/HDL configuration & reconciliation';
    } else if (mockNum === 2) {
      pct = 0.80;
      name = 'Mock 2 (SIT Cleansed Cycle)';
      desc = 'SIT cycle data load, automated deduplication, exception resolution & post-cleansing validation';
    } else if (mockNum === 3) {
      pct = 0.60;
      name = 'Mock 3 (UAT Volume Cycle)';
      desc = 'UAT volume load cycle, performance tuning, cutover sequencing & business sign-off';
    } else if (mockNum === 4) {
      pct = 0.40;
      name = 'Mock 4 (Cutover Dress Rehearsal)';
      desc = 'Final cutover dress rehearsal, timing dry-run, rollback testing & production dry-run';
    }
    const mockHours = Math.round(baseSingleMockHours * pct * historyMultiplier);
    return {
      mockNumber: mockNum,
      name,
      percentage: pct,
      percentageLabel: `${Math.round(pct * 100)}%`,
      description: desc,
      hours: mockHours
    };
  });

  let scaleBaseHours = 0;
  // SCM
  scaleBaseHours += (scaleDrivers.scm_plants || 0) * 450;
  scaleBaseHours += (scaleDrivers.scm_wh || 0) * 250;
  scaleBaseHours += (scaleDrivers.scm_inv || 0) * 80;
  // Financials
  scaleBaseHours += (scaleDrivers.fin_ent || 0) * 180;
  scaleBaseHours += (scaleDrivers.fin_led || 0) * 350;
  scaleBaseHours += (scaleDrivers.fin_bu || 2) * 90; // Business Units & Shared Services configuration
  scaleBaseHours += (scaleDrivers.fin_cur || 0) * 60;
  scaleBaseHours += (scaleDrivers.fin_tax || 0) * 120;
  scaleBaseHours += Math.max(0, (scaleDrivers.fin_coa_segments || 0) - 4) * 60;
  scaleBaseHours += (scaleDrivers.fin_secondary_ledgers || 0) * 220; // Secondary Statutory / Multi-GAAP Ledgers
  scaleBaseHours += (scaleDrivers.fin_sla_rules || 0) * 85; // Custom Subledger Accounting Derivation Rules
  scaleBaseHours += (scaleDrivers.fin_intercompany_pairs || 0) * 110; // AGIS Intercompany Balancing & Trading Pairs
  // HCM
  const hc = scaleDrivers.hcm_hc || 0;
  scaleBaseHours += Math.min(2500, Math.sqrt(hc) * 22); // Damped sublinear scaling for headcount
  scaleBaseHours += (scaleDrivers.hcm_pay_countries || 0) * 380;
  scaleBaseHours += (scaleDrivers.hcm_union_groups || 0) * 220;
  // Tech & CEMLI
  scaleBaseHours += (scaleDrivers.tech_oic || 0) * 120;
  scaleBaseHours += (scaleDrivers.tech_paas || 0) * 650;
  scaleBaseHours += baseConversionHours; // Dynamic conversion hours driven by data objects, conversion mock cycles, and history depth
  scaleBaseHours += (scaleDrivers.tech_reports_bip || 0) * 45;
  scaleBaseHours += (scaleDrivers.tech_reports_otbi || 0) * 18;
  scaleBaseHours += (scaleDrivers.tech_fast_formulas || 0) * 75;
  scaleBaseHours += (scaleDrivers.tech_workflows || 0) * 65;
  scaleBaseHours += (scaleDrivers.tech_bpm_approval_groups || 0) * 55; // Advanced BPM / AME Matrix Approval Routing Groups

  // 2.5 Enterprise Rollout Questionnaire Complexity & Schedule Variance Calculation
  const rolloutQuestionAnswers = scenario.rolloutQuestionAnswers || {};
  let rolloutTotalScore = 0;
  let rolloutScheduleImpactWeeks = 0;
  const rolloutScopingHours = 0; // Efforts are driven by T-shirt sizing, multipliers, and scale drivers; questions drive workstream scoring
  const rolloutComplexityBreakdown: RolloutComplexityBreakdownItem[] = [];

  ENTERPRISE_ROLLOUT_QUESTIONS.forEach((q) => {
    // Default index: if scenario is big_bang default to Level 1 (0), else Level 2 (1) if not explicitly set
    const defaultIdx = rolloutApproach === 'big_bang' ? 0 : 1;
    const ansIdx = rolloutQuestionAnswers[q.id] !== undefined ? rolloutQuestionAnswers[q.id] : defaultIdx;
    const option = q.options[ansIdx] || q.options[0];

    rolloutTotalScore += option.score;
    rolloutScheduleImpactWeeks += option.scheduleWeeks;

    rolloutComplexityBreakdown.push({
      questionId: q.id,
      category: q.category,
      title: q.title,
      selectedOptionLabel: option.label,
      score: option.score,
      scheduleWeeks: option.scheduleWeeks,
      hours: 0,
      rationale: option.rationale
    });
  });

  const rolloutAvgScore = ENTERPRISE_ROLLOUT_QUESTIONS.length > 0
    ? Number((rolloutTotalScore / ENTERPRISE_ROLLOUT_QUESTIONS.length).toFixed(2))
    : 2.0;
  const rolloutComplexityScore = Math.max(0, Math.min(100, Math.round(((rolloutAvgScore - 1) / 3) * 100)));

  // Custom User/AI Scoping Questions schedule impact (efforts driven via workstream scoring & T-shirt sizing)
  const customScopingHours = 0;
  if (scenario.customQuestions && scenario.customQuestions.length > 0) {
    const customAnswers = scenario.customQuestionAnswers || {};
    scenario.customQuestions.forEach((cq) => {
      const ansIdx = customAnswers[cq.id] !== undefined ? customAnswers[cq.id] : 1;
      const opt = cq.options[ansIdx] || cq.options[0];
      if (opt) {
        rolloutScheduleImpactWeeks += (opt.scheduleWeeks || 0);
      }
    });
  }

  // Custom User/AI Scale Drivers
  let customDriversHours = 0;
  if (scenario.customScaleDrivers && scenario.customScaleDrivers.length > 0) {
    scenario.customScaleDrivers.forEach((cd) => {
      customDriversHours += (cd.value || 0) * (cd.hoursPerUnit || 50);
    });
  }

  const totalBaseHours = Math.max(800, moduleBaseHours + moduleScopingHours + scaleBaseHours + rolloutScopingHours + customScopingHours + customDriversHours);

  // 3. Complexity Scores per Strategic Pillar (0-100 scale)
  const pillarScores: Record<string, number> = {};
  COMPLEXITY_PILLARS.forEach(pillar => {
    const answers = complexityAnswers[pillar.id] || [1, 1];
    const questions = PILLAR_QUESTIONS[pillar.id] || [];
    let totalScore = 0;
    answers.forEach((ansIndex, qIdx) => {
      const q = questions[qIdx];
      const optScore = q && q.options[ansIndex] ? q.options[ansIndex].score : 2;
      totalScore += optScore; // 1 to 4
    });
    const avgScore = answers.length > 0 ? totalScore / answers.length : 2;
    pillarScores[pillar.id] = (avgScore / 4) * 100;
  });

  // Weighted overall complexity score
  const weightedComplexityScore = COMPLEXITY_PILLARS.reduce((sum, pillar) => {
    return sum + (pillarScores[pillar.id] * pillar.weight);
  }, 0);

  // Non-linear complexity multiplier: ranges from ~0.80 (very low) to ~1.85 (very high)
  const complexMultiplier = 0.75 + Math.pow(weightedComplexityScore / 100, 1.35) * 1.10;

  // 4. Net Client Modifier (7 Core Standardized Dimensions)
  const netClientModifier = Number((
    (clientModifiers.decisionVelocity || 1.0) *
    (clientModifiers.dataDebt || 1.0) *
    (clientModifiers.cloudMindset || 1.0) *
    (clientModifiers.integrationVolatility || 1.0) *
    (clientModifiers.smeAvailability || 1.0) *
    (clientModifiers.regulatoryCompliance || 1.0) *
    (clientModifiers.changeResistance || 1.0)
  ).toFixed(3));

  // 5. Rollout Strategy Multiplier (Combining Wave Architecture & Questionnaire Dynamics)
  let baseRolloutMultiplier = 1.0;
  if (rolloutApproach === 'phased_geo') {
    baseRolloutMultiplier = 1.0 + Math.max(0, rolloutWaves - 1) * 0.28;
  } else if (rolloutApproach === 'phased_functional') {
    baseRolloutMultiplier = 1.0 + Math.max(0, rolloutWaves - 1) * 0.22;
  } else if (rolloutApproach === 'pilot_rollout') {
    baseRolloutMultiplier = 1.0 + Math.max(0, rolloutWaves - 1) * 0.18;
  }

  // Dynamic rollout questionnaire calibration factor (ranges from 0.88 for simple to 1.25 for extreme multi-wave friction)
  const rolloutQuestionFactor = 0.88 + (rolloutComplexityScore / 100) * 0.37;
  const rolloutMultiplier = Number((baseRolloutMultiplier * rolloutQuestionFactor).toFixed(3));

  // 6. Schedule Modifiers, Methodology & Velocity Analysis
  const scheduleModifiers = scenario.scheduleModifiers || {
    methodology: 'hybrid_oum',
    fastTrackingOverlapPct: 15,
    clientDecisionSLA: 'standard_5d',
    envReadinessLeadWeeks: 2,
    dataReadinessScore: 2,
    sprintCadenceWeeks: 3
  };

  const schedulingMode = scenario.schedulingMode || 'forward';
  const targetStartDateStr = scenario.targetStartDate || '2026-09-01';
  const clientTargetGoLiveDateStr = scenario.clientTargetGoLiveDate || '2027-11-23';

  let velocityMultiplier = 1.0;
  if (scheduleModifiers.methodology === 'agile_iterative') velocityMultiplier *= 1.08;
  if (scheduleModifiers.methodology === 'waterfall') velocityMultiplier *= 0.88;

  if (scheduleModifiers.clientDecisionSLA === 'rapid_3d') velocityMultiplier *= 1.06;
  if (scheduleModifiers.clientDecisionSLA === 'delayed_10d') velocityMultiplier *= 0.88;

  // Granular Complexity-Driven Schedule Breakdown
  const complexityDriversBreakdown: Array<{ name: string; impactWeeks: number; rationale: string }> = [];

  // Phase 1: Enablement
  const envLead = scheduleModifiers.envReadinessLeadWeeks || 0;
  const enablementWeeks = 2 + (envLead > 2 ? 1 : 0);
  if (envLead > 0) {
    complexityDriversBreakdown.push({
      name: 'Environment & Sandbox Provisioning Lead',
      impactWeeks: envLead > 2 ? 1 : 0,
      rationale: `${envLead}-week cloud sandbox ingress lead time factored into Initial Enablement & PMO kickoff.`
    });
  }

  // Phase 2: Enterprise Design
  const ledgersImpact = Math.max(0, (scaleDrivers.fin_led || 1) - 1) * 0.5;
  const coaImpact = Math.max(0, (scaleDrivers.fin_coa_segments || 4) - 4) * 0.35;
  const entitiesImpact = Math.min(3, Math.max(0, (scaleDrivers.fin_ent || 1) - 1) * 0.25);
  const cloudMindsetImpact = (clientModifiers.cloudMindset > 1.05) ? 1.5 : 0;
  const decisionDelayImpact = (scheduleModifiers.clientDecisionSLA === 'delayed_10d') ? 2.0 : (scheduleModifiers.clientDecisionSLA === 'rapid_3d' ? -1.0 : 0);

  const baseDesignWeeks = Math.max(5, Math.round(
    (5 + (selectedModules.length * 0.35) + ledgersImpact + coaImpact + entitiesImpact + cloudMindsetImpact + decisionDelayImpact) / velocityMultiplier
  ));

  if (ledgersImpact > 0 || coaImpact > 0) {
    complexityDriversBreakdown.push({
      name: 'Financial Accounting Matrix (COA & Multi-Ledger)',
      impactWeeks: Math.round((ledgersImpact + coaImpact) * 10) / 10,
      rationale: `${scaleDrivers.fin_led} Ledgers & ${scaleDrivers.fin_coa_segments} COA Segments require comprehensive intercompany & allocation design.`
    });
  }

  // -------------------------------------------------------------
  // Phase 3: Build & Unit Iterations (Dynamic Technical Inventory Model)
  // -------------------------------------------------------------
  const oicCount = scaleDrivers.tech_oic || 0;
  const paasCount = scaleDrivers.tech_paas || 0;
  const fastFormulaCount = scaleDrivers.tech_fast_formulas || 0;
  const reportsCount = (scaleDrivers.tech_reports_bip || 0) + (scaleDrivers.tech_reports_otbi || 0);
  const workflowsCount = scaleDrivers.tech_workflows || 0;
  const bpmGroupsCount = scaleDrivers.tech_bpm_approval_groups || 2;
  const secRolesCount = scaleDrivers.tech_security_roles || 5;

  // 1. Base Functional Configuration Runway:
  // Standard foundation setups across ledgers, BUs, and core module business flows
  const baseConfigWeeks = Math.max(4, Math.round(4 + (selectedModules.length * 0.28)));

  // 2. Technical Object Effort (Person-Days of development)
  // OIC Interface: ~10 days per interface (design, mapping, exception handling, unit test)
  // PaaS / VBCS Extension: ~15 days per extension
  // BI Publisher / OTBI Complex Financial Reports: ~4 days per report
  // FastFormulas & Custom SLA Rules: ~5 days per formula/rule
  // BPM / AME Approval Matrices & Custom Security Roles: ~3 days per item
  const oicDevDays = oicCount * 10;
  const paasDevDays = paasCount * 15;
  const reportsDevDays = reportsCount * 4;
  const formulasDevDays = fastFormulaCount * 5;
  const workflowsDevDays = (workflowsCount + bpmGroupsCount + Math.round(secRolesCount * 0.5)) * 3;
  const totalTechnicalDevDays = oicDevDays + paasDevDays + reportsDevDays + formulasDevDays + workflowsDevDays;

  // Recommended technical developer squad concurrency (default 3-8 developers depending on scope)
  const recommendedDevSquadFTE = Math.max(3, Math.min(10, Math.round(3 + (totalTechnicalDevDays / 120))));
  
  // Working days per week = 5, developer productivity/efficiency factor = 0.75
  const effectiveWeeklyDevCapacityDays = Math.max(10, recommendedDevSquadFTE * 5 * 0.75);
  
  // Technical Build Runway (calendar weeks)
  const rawTechBuildWeeks = totalTechnicalDevDays > 0 ? (totalTechnicalDevDays / effectiveWeeklyDevCapacityDays) : 0;

  // Specific driver week contributions:
  const oicIntegrationsWeeks = Math.round((oicDevDays / effectiveWeeklyDevCapacityDays) * 10) / 10;
  const paasExtensionsWeeks = Math.round((paasDevDays / effectiveWeeklyDevCapacityDays) * 10) / 10;
  const reportsWeeks = Math.round((reportsDevDays / effectiveWeeklyDevCapacityDays) * 10) / 10;
  const workflowsAndRulesWeeks = Math.round(((formulasDevDays + workflowsDevDays) / effectiveWeeklyDevCapacityDays) * 10) / 10;

  // 3. Mock 1 Data Conversion Load & Error Burndown
  const mock1ConversionWeeks = 2.0;

  // 4. String Testing & SIT Entry Gateway
  const stringTestingWeeks = 2.0;

  // Total Derived Build Weeks (combining functional config sprints, technical dev runway, Mock 1, and string testing)
  const technicalBuildRunway = Math.max(baseConfigWeeks, Math.round(rawTechBuildWeeks));
  const totalRawBuildWeeks = technicalBuildRunway + stringTestingWeeks;
  
  // Fast-tracking concurrency overlap during design CRP2
  const buildFastTrackPct = scheduleModifiers.fastTrackingOverlapPct || 15;
  const buildFastTrackSavingsWeeks = Math.round(totalRawBuildWeeks * (buildFastTrackPct / 100) * 0.40);
  
  const recommendedBuildWeeks = Math.max(8, Math.round((totalRawBuildWeeks - buildFastTrackSavingsWeeks) / velocityMultiplier));
  const baseBuildWeeks = recommendedBuildWeeks;

  const buildDurationBreakdown = {
    baseConfigWeeks,
    oicIntegrationsWeeks: Math.round(oicIntegrationsWeeks * 10) / 10,
    reportsWeeks: Math.round(reportsWeeks * 10) / 10,
    paasExtensionsWeeks: Math.round(paasExtensionsWeeks * 10) / 10,
    workflowsAndRulesWeeks: Math.round(workflowsAndRulesWeeks * 10) / 10,
    mock1ConversionWeeks,
    stringTestingWeeks,
    totalRawBuildWeeks,
    fastTrackingSavingsWeeks: buildFastTrackSavingsWeeks,
    recommendedBuildWeeks,
    totalTechnicalDevDays,
    recommendedDevSquadFTE,
    rationale: `Derived from ${totalTechnicalDevDays} Technical Person-Days (${oicCount} OIC interfaces, ${reportsCount} reports, ${paasCount} PaaS extensions) + ${baseConfigWeeks}w functional configuration sprints + ${stringTestingWeeks}w string testing/SIT gateway, delivered by a ${recommendedDevSquadFTE}-FTE developer squad.`
  };

  if (totalTechnicalDevDays > 80 || recommendedBuildWeeks > 8) {
    complexityDriversBreakdown.push({
      name: `Technical Inventory Build Runway (${totalTechnicalDevDays} Person-Days across ${recommendedDevSquadFTE} Devs)`,
      impactWeeks: Math.max(0, recommendedBuildWeeks - 8),
      rationale: `${oicCount} OIC Interfaces (${oicDevDays}d) + ${reportsCount} Reports (${reportsDevDays}d) + ${paasCount} PaaS (${paasDevDays}d) + Mock 1 Conversion require a defensible ${recommendedBuildWeeks}-week build window rather than a standard 8-week vanilla floor.`
    });
  }

  // Phase 4: Business Test 1 (SIT & End-to-End)
  const dataDebtImpact = scheduleModifiers.dataReadinessScore === 3 ? 2.5 : (scheduleModifiers.dataReadinessScore === 2 ? 1.0 : 0);
  const conversionCyclesImpact = conversionCycles >= 4 ? (conversionCycles - 3) * 0.75 : (conversionCycles <= 1 ? -0.5 : 0);
  const sitOicImpact = oicCount > 15 ? (oicCount - 15) * 0.08 : 0;
  const baseTest1Weeks = Math.max(4, Math.round((4 + (selectedModules.length * 0.2) + sitOicImpact + dataDebtImpact + conversionCyclesImpact) / velocityMultiplier));

  if (dataDebtImpact > 0 || conversionCyclesImpact !== 0) {
    complexityDriversBreakdown.push({
      name: `Legacy Data Cleansing & ${conversionCycles} Mock Conversion Cycles`,
      impactWeeks: Math.round((dataDebtImpact + conversionCyclesImpact) * 10) / 10,
      rationale: `${conversionCycles} Mock Conversion Loads across ${dataObjects} FBDI/HDL Data Objects (${historicalYears} yrs history) require iterative validation & reconciliation in SIT.`
    });
  }

  // Phase 5: Business Test 2 (UAT & Dress Rehearsal)
  const hcCount = scaleDrivers.hcm_hc || 0;
  const payCountries = scaleDrivers.hcm_pay_countries || 0;
  const unionCount = scaleDrivers.hcm_union_groups || 0;
  const hcImpact = hcCount > 5000 ? Math.min(2.5, Math.log10(hcCount / 1000) * 1.2) : 0;
  const payImpact = payCountries > 1 ? (payCountries - 1) * 1.2 : 0;
  const unionImpact = unionCount > 1 ? unionCount * 0.4 : 0;
  const changeResistImpact = clientModifiers.changeResistance > 1.1 ? 1.5 : 0;

  const baseTest2Weeks = Math.max(4, Math.round((4 + (selectedModules.length * 0.15) + hcImpact + payImpact + unionImpact + changeResistImpact) / velocityMultiplier));

  if (payImpact > 0 || unionImpact > 0 || hcImpact > 0) {
    complexityDriversBreakdown.push({
      name: 'Workforce Scale, Payroll Parallel & Union Rules UAT',
      impactWeeks: Math.round((hcImpact + payImpact + unionImpact) * 10) / 10,
      rationale: `${(hcCount || 0).toLocaleString()} Headcount, ${payCountries} Payroll Countries, and ${unionCount} Unions require multi-cycle parallel payroll UAT.`
    });
  }

  // Phase 6: Cutover & Go-Live
  const dataObjectsCount = scaleDrivers.tech_data_objects || 0;
  const cutoverRehearsalWeeks = conversionCycles >= 4 ? 1 : 0;
  const baseCutoverWeeks = Math.max(2, Math.round(2 + (dataObjectsCount > 20 ? 1 : 0) + cutoverRehearsalWeeks + (rolloutWaves > 1 ? 1 : 0)));

  if (cutoverRehearsalWeeks > 0) {
    complexityDriversBreakdown.push({
      name: `Dedicated Cutover Dress Rehearsal (${conversionCycles} Total Mocks)`,
      impactWeeks: cutoverRehearsalWeeks,
      rationale: `Enterprise conversion profile with ${conversionCycles} mock cycles incorporates a full end-to-end Cutover Gold Run rehearsal.`
    });
  }

  // Phase 7: Hypercare
  const plantsCount = scaleDrivers.scm_plants || 0;
  const baseHypercareWeeks = Math.max(4, Math.round(4 + (weightedComplexityScore > 60 ? 2 : 0) + (plantsCount > 4 ? 1 : 0)));

  // Fast-tracking compression factor:
  const fastTrackOverlapPct = scheduleModifiers.fastTrackingOverlapPct || 15;
  const totalRawWeeks = enablementWeeks + baseDesignWeeks + baseBuildWeeks + baseTest1Weeks + baseTest2Weeks + baseCutoverWeeks + baseHypercareWeeks;
  const fastTrackSavingsWeeks = Math.round(totalRawWeeks * (fastTrackOverlapPct / 100) * 0.30);

  let coreCycleWeeks = totalRawWeeks - fastTrackSavingsWeeks + rolloutScheduleImpactWeeks;
  if (rolloutWaves > 1) {
    coreCycleWeeks += (rolloutWaves - 1) * Math.max(6, 12 - rolloutOverlapWeeks);
  }

  if (fastTrackSavingsWeeks > 0) {
    complexityDriversBreakdown.push({
      name: `Fast-Tracking & Stream Overlap (${fastTrackOverlapPct}%)`,
      impactWeeks: -fastTrackSavingsWeeks,
      rationale: `Concurrency between Build and Design CRPs compresses overall sequential duration by ${fastTrackSavingsWeeks} weeks.`
    });
  }

  // Rollout Questionnaire drivers impacting schedule
  rolloutComplexityBreakdown
    .filter(item => Math.abs(item.scheduleWeeks) >= 0.5)
    .forEach(item => {
      complexityDriversBreakdown.push({
        name: `Rollout Driver: ${item.title.replace(/^\d+\.\s*/, '')}`,
        impactWeeks: item.scheduleWeeks,
        rationale: `${item.selectedOptionLabel}. ${item.rationale}`
      });
    });

  const recommendedDurationWeeks = Math.max(20, Math.min(104, Math.round(coreCycleWeeks)));

  // --- Industry Benchmark Calculation (Oracle True Cloud Method & Tier-1 SI Data) ---
  let industryBenchmarkDurationWeeks = 32;
  let industryBenchmarkLabel = 'Core Financials & Procurement (Oracle MBP Standard)';
  if (selectedModules.some(m => m.startsWith('scm_')) && selectedModules.some(m => m.startsWith('erp_'))) {
    industryBenchmarkDurationWeeks = 44;
    industryBenchmarkLabel = 'Integrated ERP & Supply Chain (Discrete / WMS / Planning)';
  }
  if (selectedModules.some(m => m.startsWith('hcm_payroll')) || (scaleDrivers.hcm_pay_countries || 0) > 1) {
    industryBenchmarkDurationWeeks = 48;
    industryBenchmarkLabel = 'Global HCM, Multi-Country Payroll & Time Cloud';
  }
  if (selectedModules.length >= 14 || rolloutWaves >= 3 || (scaleDrivers.tech_oic || 0) >= 30) {
    industryBenchmarkDurationWeeks = 56;
    industryBenchmarkLabel = 'Global Multi-Wave Enterprise Transformation (Tier-1 SI Standard)';
  }

  const industryBenchmarkBreakdown: Record<string, number> = {
    phase_enablement: 2,
    phase_design: Math.round(industryBenchmarkDurationWeeks * 0.20),
    phase_build: Math.round(industryBenchmarkDurationWeeks * 0.32),
    phase_test_1: Math.round(industryBenchmarkDurationWeeks * 0.18),
    phase_test_2: Math.round(industryBenchmarkDurationWeeks * 0.15),
    phase_cutover: Math.max(2, Math.round(industryBenchmarkDurationWeeks * 0.05)),
    phase_hypercare: Math.max(4, Math.round(industryBenchmarkDurationWeeks * 0.08))
  };

  const crashDurationWeeks = Math.max(18, Math.round(recommendedDurationWeeks * 0.72));

  // --- Forward vs Backward Calculation from Go-Live Date ---
  const startDateObj = new Date(targetStartDateStr);
  const clientTargetGoLiveObj = new Date(clientTargetGoLiveDateStr);

  const goLiveWeekIndex = Math.round(projectWeeks * 0.90);
  const calculatedGoLiveObj = new Date(startDateObj.getTime() + (goLiveWeekIndex * 7 * 24 * 3600 * 1000));
  const calculatedGoLiveDate = calculatedGoLiveObj.toISOString().split('T')[0];

  const requiredKickoffObj = new Date(clientTargetGoLiveObj.getTime() - (goLiveWeekIndex * 7 * 24 * 3600 * 1000));
  const requiredKickoffDate = requiredKickoffObj.toISOString().split('T')[0];

  const varianceMs = clientTargetGoLiveObj.getTime() - calculatedGoLiveObj.getTime();
  const varianceWeeks = Math.round(varianceMs / (7 * 24 * 3600 * 1000));

  let isFeasible = varianceWeeks >= -2;
  let feasibilityRating: 'Optimal' | 'Manageable' | 'Aggressive' | 'Critical Deficit' = 'Optimal';
  let compressionPct = 0;

  if (varianceWeeks >= 3) {
    feasibilityRating = 'Optimal';
  } else if (varianceWeeks >= -2) {
    feasibilityRating = 'Manageable';
    compressionPct = Math.max(0, Math.round((Math.abs(varianceWeeks) / projectWeeks) * 100));
  } else if (varianceWeeks >= -6) {
    feasibilityRating = 'Aggressive';
    compressionPct = Math.round((Math.abs(varianceWeeks) / projectWeeks) * 100);
    isFeasible = false;
  } else {
    feasibilityRating = 'Critical Deficit';
    compressionPct = Math.round((Math.abs(varianceWeeks) / projectWeeks) * 100);
    isFeasible = false;
  }

  const recommendations: string[] = [];
  if (varianceWeeks < 0) {
    recommendations.push(`Back-date calculation reveals a ${Math.abs(varianceWeeks)}-week schedule deficit against client's ask Go-Live target of ${new Date(clientTargetGoLiveDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
    if (varianceWeeks >= -4) {
      recommendations.push(`Increase Fast-Tracking Overlap from ${fastTrackOverlapPct}% to 25% or advance Kickoff to ${new Date(requiredKickoffDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
    } else {
      recommendations.push(`Split scope into Multi-Wave rollout or adopt Vanilla MBP standards to protect Go-Live.`);
    }
  } else {
    recommendations.push(`Schedule maintains a defensible contingency buffer of +${varianceWeeks} weeks ahead of client's ask Go-Live date.`);
  }

  if (scheduleModifiers.clientDecisionSLA === 'delayed_10d') {
    recommendations.push('Establish Empowered Product Owners with 3-day decision SLAs to eliminate SteerCo gating delays.');
  }
  if (scheduleModifiers.dataReadinessScore === 3) {
    recommendations.push('Mobilize an early Data Cleansing Sprint during Client Enablement to prevent SIT conversion roadblocks.');
  }

  const scheduleFeasibility: ScheduleFeasibility = {
    schedulingMode,
    clientTargetGoLiveDate: clientTargetGoLiveDateStr,
    calculatedGoLiveDate,
    requiredKickoffDate,
    varianceWeeks,
    compressionPct,
    isFeasible,
    feasibilityRating,
    industryBenchmarkDurationWeeks,
    industryBenchmarkLabel,
    industryBenchmarkBreakdown,
    crashDurationWeeks,
    velocityMultiplier,
    complexityDriversBreakdown,
    recommendations
  };

  // 7. P50 Baseline (Staffing Target with Rollout Multiplier & Global Complexity Multiplier)
  const globalComplexityMultiplier = scenario.globalComplexityMultiplier !== undefined ? scenario.globalComplexityMultiplier : 1.0;
  const p50_BaselineHours = totalBaseHours * complexMultiplier * netClientModifier * rolloutMultiplier * globalComplexityMultiplier;

  // 8. Contingency calculation
  const calculatedContingencyPct = Math.max(0.05, Math.min(0.35, (1 - confidence) * 0.50));
  const contingencyPct = contingencyPctOverride !== undefined ? contingencyPctOverride : calculatedContingencyPct;

  // 3-Point Estimation Ranges
  const p10_BestCaseHours = p50_BaselineHours * (1 - contingencyPct * 0.65);
  const p80_DefensibleHours = p50_BaselineHours * (1 + contingencyPct);
  const p95_ConservativeHours = p50_BaselineHours * (1 + contingencyPct * 1.65);

  const targetHours = p80_DefensibleHours; // Defensible quote target
  const targetPersonMonths = targetHours / 160;

  // 8.5 Detailed Module-Level Effort & T-Shirt Sizing Engine (Questionnaire + Complexity Parameters)
  function getModuleScaleAttribution(modId: OracleModule, sd: ScaleDrivers): { hours: number; drivers: string[] } {
    let hours = 0;
    const drivers: string[] = [];

    switch (modId) {
      case 'erp_gl': {
        const ledgers = sd.fin_led || 1;
        const secLedgers = sd.fin_secondary_ledgers || 0;
        const coaSegs = sd.fin_coa_segments || 4;
        const currencies = sd.fin_cur || 1;
        const entities = sd.fin_ent || 1;
        const icPairs = sd.fin_intercompany_pairs || 0;
        hours += ledgers * 220 + secLedgers * 140 + Math.max(0, coaSegs - 4) * 60 + currencies * 40 + entities * 50 + icPairs * 75;
        if (ledgers > 1) drivers.push(`${ledgers} Primary Ledgers`);
        if (secLedgers > 0) drivers.push(`${secLedgers} Secondary Statutory Ledgers`);
        if (coaSegs > 6) drivers.push(`${coaSegs} COA Segments`);
        if (icPairs > 1) drivers.push(`${icPairs} AGIS Intercompany Balancing Pairs`);
        if (currencies > 3) drivers.push(`${currencies} Currencies`);
        break;
      }
      case 'erp_ap': {
        const ent = sd.fin_ent || 1;
        const bus = sd.fin_bu || 2;
        const tax = sd.fin_tax || 1;
        const wf = sd.tech_workflows || 0;
        const bpm = sd.tech_bpm_approval_groups || 0;
        const sla = sd.fin_sla_rules || 0;
        hours += ent * 45 + bus * 40 + tax * 40 + wf * 15 + bpm * 30 + sla * 45;
        if (bus > 2) drivers.push(`${bus} Business Units (Shared Services)`);
        if (tax > 2) drivers.push(`${tax} Tax Regimes`);
        if (bpm > 2) drivers.push(`${bpm} Tiered BPM Invoice Approval Matrices`);
        if (sla > 2) drivers.push(`${sla} Custom SLA Subledger Rules`);
        break;
      }
      case 'erp_ar': {
        const ent = sd.fin_ent || 1;
        const tax = sd.fin_tax || 1;
        const data = sd.tech_data_objects || 0;
        hours += ent * 45 + tax * 40 + data * 12;
        if (ent > 3) drivers.push(`${ent} Legal Entities`);
        break;
      }
      case 'erp_fa': {
        const ent = sd.fin_ent || 1;
        const ledgers = sd.fin_led || 1;
        hours += ent * 35 + ledgers * 60;
        if (ledgers > 1) drivers.push(`Multi-Book Asset Depreciation`);
        break;
      }
      case 'erp_cm': {
        const cur = sd.fin_cur || 1;
        const ent = sd.fin_ent || 1;
        hours += cur * 35 + ent * 35;
        if (cur > 2) drivers.push(`Multi-Currency Treasury Accounts`);
        break;
      }
      case 'erp_tax': {
        const tax = sd.fin_tax || 1;
        const ent = sd.fin_ent || 1;
        hours += tax * 100 + ent * 30;
        if (tax > 1) drivers.push(`${tax} Statutory Tax Regimes & E-Invoicing`);
        break;
      }
      case 'erp_ppm': {
        const ent = sd.fin_ent || 1;
        const wf = sd.tech_workflows || 0;
        hours += ent * 40 + wf * 25;
        break;
      }
      case 'erp_proc': {
        const wh = sd.scm_wh || 1;
        const ent = sd.fin_ent || 1;
        const wf = sd.tech_workflows || 0;
        hours += ent * 40 + wh * 30 + wf * 20;
        if (wh > 2) drivers.push(`${wh} Receiving Locations`);
        break;
      }
      case 'scm_om': {
        const wh = sd.scm_wh || 1;
        const oic = sd.tech_oic || 0;
        const wf = sd.tech_workflows || 0;
        hours += wh * 60 + oic * 20 + wf * 15;
        if (wh > 3) drivers.push(`${wh} Fulfillment Warehouses`);
        if (oic > 10) drivers.push(`High-Volume Order Integrations`);
        break;
      }
      case 'scm_inv': {
        const wh = sd.scm_wh || 1;
        const inv = sd.scm_inv || 1;
        const plants = sd.scm_plants || 1;
        hours += wh * 120 + inv * 45 + plants * 90;
        if (plants > 1) drivers.push(`${plants} Manufacturing Plants`);
        if (wh > 2) drivers.push(`${wh} Distribution Warehouses`);
        break;
      }
      case 'scm_mfg': {
        const plants = sd.scm_plants || 1;
        const inv = sd.scm_inv || 1;
        hours += plants * 280 + inv * 30;
        if (plants > 1) drivers.push(`${plants} Discrete/Process Plant Work Centers`);
        break;
      }
      case 'scm_maint': {
        const plants = sd.scm_plants || 1;
        hours += plants * 130;
        if (plants > 1) drivers.push(`${plants} Plant Asset Maintenance Sites`);
        break;
      }
      case 'scm_plan': {
        const plants = sd.scm_plants || 1;
        const wh = sd.scm_wh || 1;
        hours += plants * 80 + wh * 50;
        if (plants + wh > 4) drivers.push(`Multi-Echelon Supply Chain Nodes`);
        break;
      }
      case 'scm_wms': {
        const wh = sd.scm_wh || 1;
        const inv = sd.scm_inv || 1;
        hours += wh * 180 + inv * 30;
        if (wh > 1) drivers.push(`${wh} Advanced RF/Barcode Warehouses`);
        break;
      }
      case 'scm_gop': {
        const plants = sd.scm_plants || 1;
        const wh = sd.scm_wh || 1;
        hours += plants * 50 + wh * 40;
        break;
      }
      case 'hcm_core': {
        const hc = sd.hcm_hc || 1000;
        const countries = sd.hcm_pay_countries || 1;
        hours += Math.min(800, Math.sqrt(hc) * 12) + countries * 70;
        if (hc > 5000) drivers.push(`${(hc || 0).toLocaleString()} Total Headcount`);
        if (countries > 2) drivers.push(`${countries} Operating Geographies`);
        break;
      }
      case 'hcm_payroll': {
        const countries = sd.hcm_pay_countries || 1;
        const unions = sd.hcm_union_groups || 0;
        const hc = sd.hcm_hc || 1000;
        hours += countries * 280 + unions * 160 + Math.min(600, Math.sqrt(hc) * 8);
        if (countries > 1) drivers.push(`${countries} Localized Payroll Engines`);
        if (unions > 0) drivers.push(`${unions} Collective Bargaining Agreements`);
        break;
      }
      case 'hcm_time': {
        const unions = sd.hcm_union_groups || 0;
        const hc = sd.hcm_hc || 1000;
        hours += unions * 80 + Math.min(400, Math.sqrt(hc) * 5);
        if (unions > 0) drivers.push(`Union Shift & Overtime Rules`);
        break;
      }
      case 'hcm_absence': {
        const countries = sd.hcm_pay_countries || 1;
        hours += countries * 50;
        if (countries > 2) drivers.push(`${countries} Country Statutory Leave Plans`);
        break;
      }
      case 'hcm_talent':
      case 'hcm_orc':
      case 'hcm_benefits': {
        const hc = sd.hcm_hc || 1000;
        hours += Math.min(300, Math.sqrt(hc) * 4);
        break;
      }
      case 'epm_fccs': {
        const ent = sd.fin_ent || 1;
        const led = sd.fin_led || 1;
        hours += ent * 60 + led * 60;
        if (ent > 3) drivers.push(`${ent} Consolidation Entities`);
        break;
      }
      case 'epm_epbcs': {
        const ent = sd.fin_ent || 1;
        hours += ent * 50;
        break;
      }
      case 'epm_edm': {
        const ent = sd.fin_ent || 1;
        const data = sd.tech_data_objects || 0;
        hours += ent * 30 + data * 20;
        break;
      }
      case 'cx_service':
      case 'cx_cpq': {
        const oic = sd.tech_oic || 0;
        const wf = sd.tech_workflows || 0;
        hours += oic * 30 + wf * 25;
        break;
      }
    }

    return { hours, drivers };
  }

  const moduleEstimates: ModuleEffortEstimate[] = [];
  const tShirtSizeSummary: Record<TShirtSize, number> = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  };

  selectedModDefs.forEach(modDef => {
    const modId = modDef.id;
    const customQuestionsForMod = scenario.customModuleQuestions?.[modId];
    const qList = (customQuestionsForMod && customQuestionsForMod.length > 0)
      ? customQuestionsForMod
      : (MODULE_TOP_20_QUESTIONS[modId] || []);
    const answers = moduleQuestionAnswers[modId] || Array(qList.length > 0 ? qList.length : 20).fill(1);

    let totalScore = 0;
    const questionDrivers: string[] = [];

    qList.forEach((q, qIdx) => {
      const optIdx = answers[qIdx] !== undefined ? answers[qIdx] : 1;
      const opt = q.options[optIdx] || q.options[0];
      if (opt) {
        totalScore += opt.score;
        if (opt.score >= 3 && questionDrivers.length < 2) {
          questionDrivers.push(`${q.question}: ${opt.label}`);
        }
      }
    });

    const questionnaireAvgScore = qList.length > 0 ? Number((totalScore / qList.length).toFixed(2)) : 2.0;
    const { hours: scaleAttributedHours, drivers: scaleDriversList } = getModuleScaleAttribution(modId, scaleDrivers);

    // Direct T-Shirt Sizing from 20-Question Average Score (with user override support):
    let calculatedTShirtSize: TShirtSize = 'M';
    let tShirtScore = 3.0;

    if (questionnaireAvgScore < 1.60) {
      calculatedTShirtSize = 'XS';
      tShirtScore = 1.0 + ((questionnaireAvgScore - 1.0) / 0.60) * 0.9;
    } else if (questionnaireAvgScore < 2.35) {
      calculatedTShirtSize = 'S';
      tShirtScore = 2.0 + ((questionnaireAvgScore - 1.60) / 0.75) * 0.9;
    } else if (questionnaireAvgScore < 3.05) {
      calculatedTShirtSize = 'M';
      tShirtScore = 3.0 + ((questionnaireAvgScore - 2.35) / 0.70) * 0.9;
    } else if (questionnaireAvgScore < 3.65) {
      calculatedTShirtSize = 'L';
      tShirtScore = 4.0 + ((questionnaireAvgScore - 3.05) / 0.60) * 0.9;
    } else if (questionnaireAvgScore < 3.90) {
      calculatedTShirtSize = 'XL';
      tShirtScore = 5.0 + ((questionnaireAvgScore - 3.65) / 0.25) * 0.9;
    } else {
      calculatedTShirtSize = 'XXL';
      tShirtScore = 6.0;
    }

    const userOverride = scenario.moduleTShirtOverrides?.[modId];
    const tShirtSize: TShirtSize = userOverride || calculatedTShirtSize;
    if (userOverride) {
      const scoreMap: Record<TShirtSize, number> = { XS: 1.5, S: 2.5, M: 3.5, L: 4.5, XL: 5.5, XXL: 6.0 };
      tShirtScore = scoreMap[userOverride];
    }

    const TSHIRT_RANK: Record<TShirtSize, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 };
    const isDownsized = !!(userOverride && TSHIRT_RANK[userOverride] < TSHIRT_RANK[calculatedTShirtSize]);
    const origCalculatedBase = Math.round((T_SHIRT_BASE_HOURS[calculatedTShirtSize] || 640) * modDef.complexityFactor);

    // Module base effort is derived directly from its T-Shirt tier and intrinsic complexity
    const tShirtBaseHours = T_SHIRT_BASE_HOURS[tShirtSize] || 640;
    const baseHours = Math.round(tShirtBaseHours * modDef.complexityFactor);
    const downsizedDeltaHours = isDownsized ? Math.max(0, origCalculatedBase - baseHours) : 0;
    const rawModuleHours = baseHours + scaleAttributedHours;

    const netComplexityMultiplier = Number((
      complexMultiplier *
      netClientModifier *
      rolloutMultiplier *
      globalComplexityMultiplier
    ).toFixed(3));

    const finalP50Hours = Math.round(rawModuleHours * netComplexityMultiplier);
    const finalP80Hours = Math.round(finalP50Hours * (1 + contingencyPct));
    const personMonths = Number((finalP80Hours / 160).toFixed(1));
    const estimatedWeeks = Math.max(8, Math.min(projectWeeks, Math.round(projectWeeks * 0.70 + (finalP80Hours / 350))));
    const avgFTE = Number((finalP80Hours / (estimatedWeeks * 40)).toFixed(2));

    tShirtSizeSummary[tShirtSize] = (tShirtSizeSummary[tShirtSize] || 0) + 1;

    let confidenceLevel: 'High' | 'Medium' | 'Low' = 'High';
    if (questionnaireAvgScore > 3.0 || netComplexityMultiplier > 1.3) {
      confidenceLevel = 'Low';
    } else if (questionnaireAvgScore > 2.2 || netComplexityMultiplier > 1.1) {
      confidenceLevel = 'Medium';
    }

    const allDrivers = [...questionDrivers, ...scaleDriversList];
    if (allDrivers.length === 0) {
      allDrivers.push('Standard Oracle Modern Best Practice (MBP)');
    }

    moduleEstimates.push({
      moduleId: modId,
      moduleName: modDef.name,
      pillar: modDef.pillar,
      tShirtSize,
      calculatedTShirtSize,
      isDownsized,
      downsizedDeltaHours,
      tShirtScore: Number(tShirtScore.toFixed(1)),
      baseHours,
      scopingHours: 0,
      scaleAttributedHours,
      rawModuleHours,
      netComplexityMultiplier,
      finalP50Hours,
      finalP80Hours,
      personMonths,
      estimatedWeeks,
      avgFTE,
      confidenceLevel,
      questionnaireAvgScore,
      totalQuestionsAnswered: qList.length,
      keyComplexityDrivers: allDrivers.slice(0, 3)
    });
  });

  // Sort moduleEstimates by pillar and then by hours descending
  moduleEstimates.sort((a, b) => b.finalP80Hours - a.finalP80Hours);

  // 9. Dedicated Technical & Testing Workstreams Detailed Sizing
  const technicalIntegrations = scenario.technicalIntegrations || DEFAULT_TECHNICAL_INTEGRATIONS;
  const itemizedIntegrationHours = technicalIntegrations.reduce((sum, item) => sum + (item.calculatedHours || 80), 0);
  
  // If user calibrated tech_oic scale driver explicitly, blend with itemized list
  const effectiveOicCount = scenario.scaleDrivers.tech_oic !== undefined ? scenario.scaleDrivers.tech_oic : technicalIntegrations.length;
  const avgHoursPerIntegration = technicalIntegrations.length > 0 ? (itemizedIntegrationHours / technicalIntegrations.length) : 95;
  const techOicHours = effectiveOicCount > 0 ? Math.round(effectiveOicCount * avgHoursPerIntegration) : itemizedIntegrationHours;

  const techPaasHours = (scaleDrivers.tech_paas || 0) * 550;
  const techReportsBipHours = (scaleDrivers.tech_reports_bip || 0) * 45;
  const techReportsOtbiHours = (scaleDrivers.tech_reports_otbi || 0) * 18;
  const techFastFormulasHours = (scaleDrivers.tech_fast_formulas || 0) * 75;
  const techWorkflowsHours = (scaleDrivers.tech_workflows || 0) * 55;
  const techSecurityRolesHours = (scaleDrivers.tech_security_roles || 12) * 35;
  const techCutoverHours = 160 + (scaleDrivers.tech_cutover_dr_runs || 1) * 60;
  const rawTechnicalHours = techOicHours + techPaasHours + techReportsBipHours + techReportsOtbiHours + techFastFormulasHours + techWorkflowsHours + techSecurityRolesHours + techCutoverHours;
  const finalTechnicalP80Hours = Math.max(280, Math.round(rawTechnicalHours * netClientModifier * (1 + contingencyPct)));

  let techTShirt: TShirtSize = 'M';
  if (finalTechnicalP80Hours < 800) techTShirt = 'XS';
  else if (finalTechnicalP80Hours < 1600) techTShirt = 'S';
  else if (finalTechnicalP80Hours < 3000) techTShirt = 'M';
  else if (finalTechnicalP80Hours < 5000) techTShirt = 'L';
  else if (finalTechnicalP80Hours < 8000) techTShirt = 'XL';
  else techTShirt = 'XXL';

  const simpleIntCount = technicalIntegrations.filter(i => i.complexity === 'S').length;
  const mediumIntCount = technicalIntegrations.filter(i => i.complexity === 'M').length;
  const complexIntCount = technicalIntegrations.filter(i => i.complexity === 'C' || i.complexity === 'XL').length;

  const technicalWorkstreamEstimate = {
    totalHours: finalTechnicalP80Hours,
    personMonths: Number((finalTechnicalP80Hours / 160).toFixed(1)),
    avgFTE: Number((finalTechnicalP80Hours / (projectWeeks * 40)).toFixed(2)),
    tShirtSize: techTShirt,
    integrationsHours: Math.round(techOicHours * netClientModifier * (1 + contingencyPct)),
    paasHours: Math.round(techPaasHours * netClientModifier * (1 + contingencyPct)),
    reportsHours: Math.round((techReportsBipHours + techReportsOtbiHours) * netClientModifier * (1 + contingencyPct)),
    fastFormulasHours: Math.round(techFastFormulasHours * netClientModifier * (1 + contingencyPct)),
    workflowsHours: Math.round(techWorkflowsHours * netClientModifier * (1 + contingencyPct)),
    securityRolesHours: Math.round(techSecurityRolesHours * netClientModifier * (1 + contingencyPct)),
    deliverables: [
      `${effectiveOicCount} OIC Cloud Integrations (${simpleIntCount}S / ${mediumIntCount}M / ${complexIntCount}C)`,
      `${scaleDrivers.tech_paas || 0} PaaS / VBCS Custom Extensions`,
      `${(scaleDrivers.tech_reports_bip || 0) + (scaleDrivers.tech_reports_otbi || 0)} Operational BIP & OTBI Analytics Reports`,
      `${scaleDrivers.tech_security_roles || 12} Custom Security Roles & SOD Governance Matrices`,
      `${scaleDrivers.tech_workflows || 0} BPM Workflow Approval Hierarchies`
    ]
  };

  // Testing & Quality Assurance Workstream Sizing (Transparent SIT & UAT Engineering)
  const sitCycles = scaleDrivers.test_sit_cycles !== undefined ? Math.max(1, scaleDrivers.test_sit_cycles) : 2;
  const uatCycles = scaleDrivers.test_uat_cycles !== undefined ? Math.max(1, scaleDrivers.test_uat_cycles) : 1;
  const testScripts = scaleDrivers.test_scripts_count !== undefined ? Math.max(50, scaleDrivers.test_scripts_count) : Math.max(120, selectedModules.length * 26);
  const testAutoPct = scaleDrivers.test_automation_pct !== undefined ? scaleDrivers.test_automation_pct : 25;
  const perfRuns = scaleDrivers.test_perf_runs !== undefined ? scaleDrivers.test_perf_runs : 1;
  const payrollParallels = scaleDrivers.test_payroll_parallels !== undefined ? scaleDrivers.test_payroll_parallels : (selectedModules.some(m => m.startsWith('hcm_')) ? 2 : 0);

  // Business Testing 1 - SIT Arithmetic
  const sitFuncScriptHours = Math.round(sitCycles * testScripts * 0.70);
  const sitOicIntHours = Math.round(sitCycles * (scaleDrivers.tech_oic || 8) * 16);
  const sitMockDataHours = Math.round((scaleDrivers.tech_data_objects || 10) * 8 * (sitCycles >= 2 ? 1.5 : 1.0));
  const sitDefectTriageHours = Math.round((sitFuncScriptHours + sitOicIntHours + sitMockDataHours) * 0.25);
  const rawSitHours = sitFuncScriptHours + sitOicIntHours + sitMockDataHours + sitDefectTriageHours;

  // Business Testing 2 - UAT Arithmetic
  const uatScenarioHours = Math.round(uatCycles * testScripts * 0.45);
  const uatCrpSimHours = Math.round(uatCycles * selectedModules.length * 28);
  const uatEnablementHours = 80; // Tester training, environment orientation & test data prep
  const uatDefectRetestHours = Math.round((uatScenarioHours + uatCrpSimHours) * 0.20);
  const rawUatHours = uatScenarioHours + uatCrpSimHours + uatEnablementHours + uatDefectRetestHours;

  // Automation & Non-Functional Testing (NFT)
  const testStrategyHours = 120;
  const rawAutomationHours = Math.round((testAutoPct / 100) * testScripts * 10);
  const rawPerformanceHours = Math.round(perfRuns * 140);
  const rawPayrollParallelHours = Math.round(payrollParallels * 240);

  const rawTestingHours = testStrategyHours + rawSitHours + rawUatHours + rawAutomationHours + rawPerformanceHours + rawPayrollParallelHours;
  const finalTestingP80Hours = Math.max(240, Math.round(rawTestingHours * netClientModifier * (1 + contingencyPct)));

  const finalSitHours = Math.round(rawSitHours * netClientModifier * (1 + contingencyPct));
  const finalUatHours = Math.round(rawUatHours * netClientModifier * (1 + contingencyPct));
  const finalAutomationHours = Math.round(rawAutomationHours * netClientModifier * (1 + contingencyPct));
  const finalPerformanceHours = Math.round(rawPerformanceHours * netClientModifier * (1 + contingencyPct));
  const finalPayrollParallelHours = Math.round(rawPayrollParallelHours * netClientModifier * (1 + contingencyPct));
  const finalStrategyHours = Math.round(testStrategyHours * netClientModifier * (1 + contingencyPct));

  let testingTShirt: TShirtSize = 'M';
  if (finalTestingP80Hours < 600) testingTShirt = 'XS';
  else if (finalTestingP80Hours < 1200) testingTShirt = 'S';
  else if (finalTestingP80Hours < 2200) testingTShirt = 'M';
  else if (finalTestingP80Hours < 3800) testingTShirt = 'L';
  else if (finalTestingP80Hours < 5500) testingTShirt = 'XL';
  else testingTShirt = 'XXL';

  // QA Staffing Grade Mix (Grade A: 60% Offshore @ $85 bill / $35 cost, Grade B: 25% Functional QA @ $145 bill / $65 cost, Grade C: 15% QA Lead @ $220 bill / $110 cost)
  const gradeA_Hours = Math.round(finalTestingP80Hours * 0.60);
  const gradeB_Hours = Math.round(finalTestingP80Hours * 0.25);
  const gradeC_Hours = finalTestingP80Hours - gradeA_Hours - gradeB_Hours;

  const testingRevenue = (gradeA_Hours * 85) + (gradeB_Hours * 145) + (gradeC_Hours * 220);
  const testingCost = (gradeA_Hours * 35) + (gradeB_Hours * 65) + (gradeC_Hours * 110);
  const blendedRate = Number((testingRevenue / finalTestingP80Hours).toFixed(2));
  const costRate = Number((testingCost / finalTestingP80Hours).toFixed(2));
  const marginPct = Number((((testingRevenue - testingCost) / testingRevenue) * 100).toFixed(1));

  // WBS Standard Tasks for Testing Workstream
  const testingWbsTasks = [
    {
      wbsId: '3.1.1',
      taskNumber: 'TSK-TEST-001',
      name: 'End-to-End Enterprise Test Strategy & Governance Charter',
      phase: '2. Enterprise Design',
      durationWeeks: 3,
      hours: finalStrategyHours,
      assignedRole: 'Test Strategy Lead (Grade C)',
      predecessors: 'TSK-DES-008'
    },
    {
      wbsId: '4.1.1',
      taskNumber: 'TSK-TEST-002',
      name: `Business Testing 1 - SIT Cycle 1 Execution (${testScripts} Scenarios)`,
      phase: '4. Business Testing 1 - SIT',
      durationWeeks: Math.max(3, Math.round(projectWeeks * 0.10)),
      hours: Math.round(finalSitHours * 0.55),
      assignedRole: 'Offshore QA Squad (Grade A)',
      predecessors: 'TSK-BLD-040'
    },
    {
      wbsId: '4.1.2',
      taskNumber: 'TSK-TEST-003',
      name: `Business Testing 1 - SIT Cycle 2 Cross-Module & Interface Regression`,
      phase: '4. Business Testing 1 - SIT',
      durationWeeks: Math.max(2, Math.round(projectWeeks * 0.08)),
      hours: Math.round(finalSitHours * 0.45),
      assignedRole: 'Functional QA Lead (Grade B)',
      predecessors: 'TSK-TEST-002'
    },
    {
      wbsId: '5.1.1',
      taskNumber: 'TSK-TEST-004',
      name: 'Business Testing 2 - UAT SME Enablement & Test Data Staging',
      phase: '5. Business Testing 2 - UAT',
      durationWeeks: 2,
      hours: Math.round(finalUatHours * 0.20),
      assignedRole: 'Functional SME Lead (Grade B)',
      predecessors: 'TSK-TEST-003'
    },
    {
      wbsId: '5.1.2',
      taskNumber: 'TSK-TEST-005',
      name: `Business Testing 2 - UAT Business Simulation & Day-in-the-Life Walkthroughs`,
      phase: '5. Business Testing 2 - UAT',
      durationWeeks: Math.max(3, Math.round(projectWeeks * 0.10)),
      hours: Math.round(finalUatHours * 0.60),
      assignedRole: 'Client Business Testers & SI Facilitators',
      predecessors: 'TSK-TEST-004'
    },
    {
      wbsId: '5.1.3',
      taskNumber: 'TSK-TEST-006',
      name: 'Business Testing 2 - UAT Priority Defect Burn-Down & Executive Gate Sign-Off',
      phase: '5. Business Testing 2 - UAT',
      durationWeeks: 2,
      hours: Math.round(finalUatHours * 0.20),
      assignedRole: 'Test Lead & Project Sponsor',
      predecessors: 'TSK-TEST-005'
    },
    ...(finalAutomationHours > 0 ? [{
      wbsId: '4.2.1',
      taskNumber: 'TSK-TEST-007',
      name: `Automated Regression Suite Engineering (${testAutoPct}% Coverage via OATS/Selenium)`,
      phase: '4. Business Testing 1 - SIT',
      durationWeeks: 4,
      hours: finalAutomationHours,
      assignedRole: 'Automation Engineer (Grade A)',
      predecessors: 'TSK-TEST-001'
    }] : []),
    ...(finalPerformanceHours > 0 ? [{
      wbsId: '5.2.1',
      taskNumber: 'TSK-TEST-008',
      name: `High-Volume Non-Functional Performance & Stress Test Execution (${perfRuns} Runs)`,
      phase: '5. Business Testing 2 - UAT',
      durationWeeks: 2,
      hours: finalPerformanceHours,
      assignedRole: 'NFT Performance Specialist (Grade B)',
      predecessors: 'TSK-TEST-003'
    }] : []),
    ...(finalPayrollParallelHours > 0 ? [{
      wbsId: '5.3.1',
      taskNumber: 'TSK-TEST-009',
      name: `HCM Payroll Parallel Rehearsals & Gross-to-Net Variance Tie-Out (${payrollParallels} Runs)`,
      phase: '5. Business Testing 2 - UAT',
      durationWeeks: Math.max(3, payrollParallels * 2),
      hours: finalPayrollParallelHours,
      assignedRole: 'Payroll SME & Lead Consultant',
      predecessors: 'TSK-TEST-003'
    }] : [])
  ];

  const testingWorkstreamEstimate = {
    totalHours: finalTestingP80Hours,
    personMonths: Number((finalTestingP80Hours / 160).toFixed(1)),
    avgFTE: Number((finalTestingP80Hours / (projectWeeks * 40)).toFixed(2)),
    tShirtSize: testingTShirt,
    strategyHours: finalStrategyHours,
    // Business Testing 1 - SIT
    businessTesting1Hours: finalSitHours,
    sitHours: finalSitHours,
    sitCycles,
    sitFunctionalScriptHours: Math.round(sitFuncScriptHours * netClientModifier * (1 + contingencyPct)),
    sitOicInterfaceHours: Math.round(sitOicIntHours * netClientModifier * (1 + contingencyPct)),
    sitMockDataVerifyHours: Math.round(sitMockDataHours * netClientModifier * (1 + contingencyPct)),
    sitDefectTriageHours: Math.round(sitDefectTriageHours * netClientModifier * (1 + contingencyPct)),
    // Business Testing 2 - UAT
    businessTesting2Hours: finalUatHours,
    uatHours: finalUatHours,
    uatCycles,
    uatScenarioHours: Math.round(uatScenarioHours * netClientModifier * (1 + contingencyPct)),
    uatCrpSimulationHours: Math.round(uatCrpSimHours * netClientModifier * (1 + contingencyPct)),
    uatTesterEnablementHours: Math.round(uatEnablementHours * netClientModifier * (1 + contingencyPct)),
    uatDefectRetestHours: Math.round(uatDefectRetestHours * netClientModifier * (1 + contingencyPct)),
    // Automation & Non-Functional Testing (NFT)
    automationHours: finalAutomationHours,
    automationPct: testAutoPct,
    performanceHours: finalPerformanceHours,
    perfRuns,
    payrollParallelHours: finalPayrollParallelHours,
    payrollParallels,
    // Commercials & Grade Mix
    blendedRate,
    costRate,
    revenue: testingRevenue,
    cost: testingCost,
    marginPct,
    gradeBreakdown: {
      gradeA_OffshoreExecutionHours: gradeA_Hours,
      gradeB_FunctionalLeadHours: gradeB_Hours,
      gradeC_TestManagerHours: gradeC_Hours
    },
    deliverables: [
      `End-to-End Test Strategy & Defect Governance Protocol`,
      `Business Testing 1 - SIT: ${sitCycles} Cycles (${testScripts} Scenarios, ${(scaleDrivers.tech_oic || 8)} OIC Interfaces)`,
      `Business Testing 2 - UAT: ${uatCycles} Cycles (Business Day-in-the-Life Simulation)`,
      ...(testAutoPct > 0 ? [`${testAutoPct}% Regression Automation Suite (OATS / ACCELQ / Selenium)`] : []),
      ...(perfRuns > 0 ? [`${perfRuns} High-Volume Performance & Stress Test Runs`] : []),
      ...(payrollParallels > 0 ? [`${payrollParallels} Full HCM Payroll Parallel Runs & Gross-to-Net Tie-Outs`] : [])
    ],
    wbsTasks: testingWbsTasks
  };

  // 10. Workstreams & Track Hours Breakdown
  const activeHasERP = selectedModules.some(m => m.startsWith('erp_'));
  const activeHasSCM = selectedModules.some(m => m.startsWith('scm_'));
  const activeHasHCM = selectedModules.some(m => m.startsWith('hcm_'));

  let erpShare = activeHasERP ? 0.22 : 0.03;
  let scmShare = activeHasSCM ? 0.20 : 0.03;
  let hcmShare = activeHasHCM ? 0.18 : 0.03;
  let techShare = 0.15;
  let dataShare = Math.max(0.06, 0.11 + ((conversionCycles - 3) * 0.02) + (dataObjects > 18 ? 0.02 : 0));
  let qaShare = 0.08;
  let ocmShare = 0.06;
  let govShare = 0.07;
  let pmoShare = 0.05;

  const totalShares = erpShare + scmShare + hcmShare + techShare + dataShare + qaShare + ocmShare + govShare + pmoShare;

  const workstreamHours = WORKSTREAMS_CATALOG.map(ws => {
    let assignedShare = ws.effortShare;
    if (ws.id === 'ws_func_erp') assignedShare = erpShare / totalShares;
    if (ws.id === 'ws_func_scm') assignedShare = scmShare / totalShares;
    if (ws.id === 'ws_func_hcm') assignedShare = hcmShare / totalShares;
    if (ws.id === 'ws_tech_oic') assignedShare = techShare / totalShares;
    if (ws.id === 'ws_data_conv') assignedShare = dataShare / totalShares;
    if (ws.id === 'ws_test_qa') assignedShare = qaShare / totalShares;
    if (ws.id === 'ws_ocm_train') assignedShare = ocmShare / totalShares;
    if (ws.id === 'ws_gov_steerco') assignedShare = govShare / totalShares;
    if (ws.id === 'ws_pmo_gov') assignedShare = pmoShare / totalShares;

    const isParallelTrack = ws.isParallel || ws.id === 'ws_gov_steerco' || ws.id === 'ws_pmo_gov' || ws.id === 'ws_ocm_train';
    const startWeek = isParallelTrack ? 1 : Math.max(1, Math.round(ws.startPct * projectWeeks));
    const endWeek = isParallelTrack ? projectWeeks : Math.max(startWeek + 1, Math.round(ws.endPct * projectWeeks));
    const hours = targetHours * assignedShare;
    const durationWeeks = Math.max(1, endWeek - startWeek + 1);
    const avgFTE = hours / (durationWeeks * 40);

    return {
      ...ws,
      startWeek,
      endWeek,
      hours,
      personMonths: hours / 160,
      avgFTE,
      isParallel: isParallelTrack
    };
  });

  // 10. Explicit Phase Hours Breakdown & Multi-Phase Sequence Overrides
  const phaseDeliveryModel: PhaseDeliveryModel = scenario.phaseDeliveryModel || (rolloutWaves > 1 ? 'hypercare_overlap' : 'sequential');
  const phaseOverrides: Record<string, PhaseOverride> = scenario.phaseOverrides || {};

  const phaseEffortDistribution: Record<string, number> = {
    phase_enablement: 0.04,
    phase_design: 0.18,
    phase_build: 0.34,
    phase_test_1: 0.16,
    phase_test_2: 0.16,
    phase_cutover: 0.05,
    phase_hypercare: 0.07
  };

  const baselineHypercareStartWeek = Math.round(projectWeeks * 0.90);

  const phaseHours = IMPLEMENTATION_PHASES.map((ph) => {
    let startWeek = 1;
    let endWeek = 2;
    let durationWeeks = 2;

    if (ph.id === 'phase_enablement') {
      startWeek = 1;
      endWeek = 2;
      durationWeeks = 2;
    } else {
      // Scale remaining weeks (projectWeeks - 2)
      const remainingWeeks = Math.max(10, projectWeeks - 2);
      const startOffset = Math.round(ph.startWeekPct * remainingWeeks);
      const endOffset = Math.round(ph.endWeekPct * remainingWeeks);
      startWeek = 3 + startOffset;
      endWeek = Math.min(projectWeeks, 2 + endOffset);
      if (endWeek <= startWeek) endWeek = startWeek + 1;
      durationWeeks = endWeek - startWeek + 1;
    }

    // Apply manual or model-driven sequence overrides
    const override = phaseOverrides[ph.id];
    if (override) {
      if (override.startDuringHypercare) {
        startWeek = Math.max(1, baselineHypercareStartWeek + (override.hypercareOffsetWeeks || 0));
      } else if (override.customStartWeek !== undefined) {
        startWeek = Math.max(1, override.customStartWeek);
      }

      if (override.customDurationWeeks !== undefined) {
        durationWeeks = Math.max(1, override.customDurationWeeks);
        endWeek = startWeek + durationWeeks - 1;
      } else {
        endWeek = Math.max(startWeek + 1, startWeek + durationWeeks - 1);
      }
    }

    const share = phaseEffortDistribution[ph.id] || 0.14;
    const hours = targetHours * share;

    return {
      ...ph,
      startWeek,
      endWeek,
      hours,
      durationWeeks
    };
  });

  // Calculate Multi-Wave Phase Schedule Breakdown (Non-Sequential & Hypercare Overlap)
  const waveScheduleBreakdown: WaveScheduleItem[] = [];
  const wavesCount = Math.max(1, rolloutWaves);
  const waveDuration = Math.max(16, Math.round(projectWeeks / (wavesCount > 1 ? 1.6 : 1)));

  for (let w = 1; w <= wavesCount; w++) {
    const waveName = scenario.waveDescriptions && scenario.waveDescriptions[w - 1]
      ? scenario.waveDescriptions[w - 1]
      : `Wave ${w} (${w === 1 ? 'Core Financials & Foundation' : w === 2 ? 'SCM & Operations' : 'HCM & Global Payroll'})`;
    
    let waveStart = 1;
    let startsDuringPriorHypercare = false;
    let overlapWeeks = 0;

    if (w === 1) {
      waveStart = 1;
    } else {
      const priorWave = waveScheduleBreakdown[w - 2];
      if (phaseDeliveryModel === 'hypercare_overlap' || scenario.waveStartDuringHypercare) {
        // Next phase starts during Hypercare of prior phase
        waveStart = priorWave.hypercareStartWeek;
        startsDuringPriorHypercare = true;
        overlapWeeks = priorWave.endWeek - priorWave.hypercareStartWeek;
      } else if (phaseDeliveryModel === 'fast_tracked_parallel') {
        // Next phase starts in parallel during SIT of prior phase
        waveStart = Math.max(3, priorWave.startWeek + Math.round(priorWave.durationWeeks * 0.55));
        overlapWeeks = priorWave.endWeek - waveStart;
      } else if (phaseDeliveryModel === 'custom_non_sequential') {
        const customOffset = (w - 1) * Math.max(4, 12 - rolloutOverlapWeeks);
        waveStart = Math.max(1, 1 + customOffset);
        overlapWeeks = rolloutOverlapWeeks;
      } else {
        // Sequential: starts after prior wave completes hypercare
        waveStart = priorWave.endWeek + 1;
        overlapWeeks = 0;
      }
    }

    const currentWaveDuration = Math.round(waveDuration * (w === 1 ? 1.0 : 0.85));
    const waveEnd = waveStart + currentWaveDuration - 1;
    const waveGoLive = waveStart + Math.round(currentWaveDuration * 0.88);
    const waveHypercareStart = waveGoLive;
    const waveHypercareEnd = waveEnd;

    waveScheduleBreakdown.push({
      waveNumber: w,
      name: waveName,
      scopeSummary: w === 1 ? 'Core Enterprise Setup, GL/AP/AR, Base Master Data' : w === 2 ? 'Inventory, OM, Mfg, Logistics & OIC Integrations' : 'Global Payroll, Workforce Management & Advanced EPM',
      startWeek: waveStart,
      endWeek: waveEnd,
      goLiveWeek: waveGoLive,
      hypercareStartWeek: waveHypercareStart,
      hypercareEndWeek: waveHypercareEnd,
      durationWeeks: currentWaveDuration,
      startsDuringPriorHypercare,
      overlapWeeks
    });
  }

  // 11. Commercials, Role Staffing & P&L
  const activeRoleCards = scenario.benchmarkMasterConfig?.roleRateCards || DEFAULT_ROLE_RATE_CARDS;
  const masterBlendedCalc = calculateMasterBlendedRate(
    targetHours,
    deliveryMix,
    activeRoleCards
  );

  const hoursByRegion = {
    onshore: targetHours * (deliveryMix.onshore / 100),
    nearshore: targetHours * (deliveryMix.nearshore / 100),
    offshore: targetHours * (deliveryMix.offshore / 100)
  };

  const deliveryCost = masterBlendedCalc.cost;
  const deliveryRevenue = masterBlendedCalc.revenue;
  const grossProfitVal = masterBlendedCalc.grossProfit;
  const grossMarginPct = masterBlendedCalc.grossMarginPct;
  const blendedBillRate = masterBlendedCalc.blendedBillRate;
  const blendedCostRate = masterBlendedCalc.blendedCostRate;

  const costByRegion = {
    onshore: hoursByRegion.onshore * (masterBlendedCalc.blendedCostRate || 68),
    nearshore: hoursByRegion.nearshore * (masterBlendedCalc.blendedCostRate * 0.75 || 48),
    offshore: hoursByRegion.offshore * (masterBlendedCalc.blendedCostRate * 0.45 || 28)
  };

  const revenueByRegion = {
    onshore: hoursByRegion.onshore * (masterBlendedCalc.blendedBillRate * 1.5 || 240),
    nearshore: hoursByRegion.nearshore * (masterBlendedCalc.blendedBillRate * 0.95 || 145),
    offshore: hoursByRegion.offshore * (masterBlendedCalc.blendedBillRate * 0.55 || 85)
  };

  // 12. Governance & DoA Classification
  let doaTier: 1 | 2 | 3 = 1;
  let doaClassification = 'Tier 1 Standard Approval';
  let doaColor = 'text-emerald-700';

  if (deliveryRevenue > 6000000 || grossMarginPct < 30 || weightedComplexityScore > 65) {
    doaTier = 3;
    doaClassification = 'Tier 3 Executive Deal Board Review';
    doaColor = 'text-rose-700';
  } else if (deliveryRevenue > 2500000 || grossMarginPct < 35 || weightedComplexityScore > 50) {
    doaTier = 2;
    doaClassification = 'Tier 2 VP Practice Review';
    doaColor = 'text-amber-700';
  }

  // 12b. Commercial Model (Exclusively Fixed Price Milestone-Based)
  const commercialModel: 'Fixed Price (Milestone-Based)' = 'Fixed Price (Milestone-Based)';

  // 13. Identified Project Risks & Mitigations
  const identifiedRisks: Array<{ category: string; severity: 'High' | 'Medium' | 'Low'; title: string; impact: string; mitigation: string }> = [];

  if (pillarScores.data > 65 || scaleDrivers.tech_data_objects > 15 || clientModifiers.dataDebt > 1.15) {
    identifiedRisks.push({
      category: 'Data Migration',
      severity: 'High',
      title: 'Legacy Data Debt & Extraction Friction',
      impact: 'Mock conversion delays risk stalling Business Test 1 (SIT) and Business Test 2 (UAT) entry gates.',
      mitigation: 'Establish a Dedicated Data Cleansing Sprint in Enterprise Design; enforce Mock 1 reconciliation sign-off before CRP1.'
    });
  }

  if (scaleDrivers.tech_oic > 25 || pillarScores.technical > 60 || clientModifiers.integrationVolatility > 1.15) {
    identifiedRisks.push({
      category: 'Technical Architecture',
      severity: scaleDrivers.tech_oic > 35 ? 'High' : 'Medium',
      title: 'High-Density OIC Interface Payload Volatility',
      impact: 'Late schema changes in 3rd-party systems cause cascade rework in integration flows.',
      mitigation: 'Freeze interface contracts by Design Gate (Week ' + Math.round(projectWeeks * 0.28) + '); utilize OIC automated replay queues.'
    });
  }

  if (pillarScores.ocm > 60 || clientModifiers.smeAvailability > 1.15 || clientModifiers.changeResistance > 1.15) {
    identifiedRisks.push({
      category: 'Change & Adoption',
      severity: 'High',
      title: 'Client SME Capacity & User Adoption Headwinds',
      impact: 'Dual-hatted business SMEs struggle to execute UAT and Business Test 2 scenarios on schedule.',
      mitigation: 'Mandatory 2-week Client Enablement foundation with agreed backfill budget and super-user network setup.'
    });
  }

  if (rolloutWaves > 1) {
    identifiedRisks.push({
      category: 'Rollout & Multi-Wave Governance',
      severity: rolloutWaves >= 3 ? 'High' : 'Medium',
      title: `Multi-Wave (${rolloutWaves} Waves) Template Drift & Localization Friction`,
      impact: 'Regional entities requesting conflicting customizations compromise the global single-instance template.',
      mitigation: 'Establish Global Design Authority (GDA) to gate all localized extension requests; enforce 80/20 standard adoption.'
    });
  }

  if (grossMarginPct < 32) {
    identifiedRisks.push({
      category: 'Commercial / Delivery',
      severity: 'High',
      title: 'Compressed Delivery Gross Margin',
      impact: 'Financial risk of margin leakage if scope expands without contractual change control.',
      mitigation: 'Optimize Offshore mix to >40% and ensure strict adherence to change control log.'
    });
  }

  // 14. Schedule, Milestone Dates, Pod Patching & Blackout Calendar Collisions
  const cutoverPhase = phaseHours.find(p => p.id === 'phase_cutover');
  const hypercarePhase = phaseHours.find(p => p.id === 'phase_hypercare');
  const test1Phase = phaseHours.find(p => p.id === 'phase_test_1');
  const test2Phase = phaseHours.find(p => p.id === 'phase_test_2');

  const goLiveWeek = cutoverPhase ? cutoverPhase.endWeek : Math.round(projectWeeks * 0.92);
  const hypercareStartWeek = hypercarePhase ? hypercarePhase.startWeek : Math.round(projectWeeks * 0.90);
  const sitStartWeek = test1Phase ? test1Phase.startWeek : Math.round(projectWeeks * 0.54);

  const patchMonths = ORACLE_PATCH_COHORTS[podCohort].months;
  const patchConflictWeeks: number[] = [];
  const blackoutCollisions: Array<{
    blackoutName: string;
    period: string;
    collidingPhase: string;
    impact: string;
    severity: 'hard_freeze' | 'soft_freeze';
  }> = [];

  const milestoneDates = PROJECT_MILESTONES.map(m => {
    const week = Math.max(1, Math.round(m.weekOffsetPct * projectWeeks));
    const mDate = new Date(startDateObj.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const dateStr = mDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return {
      ...m,
      week,
      calendarDate: dateStr
    };
  });

  // Check week by week for patch months and blackout overlaps
  for (let w = 1; w <= projectWeeks; w++) {
    const weekStartDate = new Date(startDateObj.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const month = weekStartDate.getMonth();

    // Check patch conflict
    if (patchMonths.includes(month)) {
      const isCriticalWindow = (w >= sitStartWeek && w <= sitStartWeek + 4) || (w >= hypercareStartWeek - 2 && w <= projectWeeks);
      if (isCriticalWindow && !patchConflictWeeks.includes(w)) {
        patchConflictWeeks.push(w);
      }
    }

    // Check blackout periods
    blackoutPeriods.forEach(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      const overlaps = (weekStartDate <= bEnd && weekEndDate >= bStart);

      if (overlaps) {
        // Find which phase this week belongs to
        const activePhase = phaseHours.find(p => w >= p.startWeek && w <= p.endWeek);
        const isSensitivePhase = activePhase && ['phase_test_1', 'phase_test_2', 'phase_cutover', 'phase_hypercare'].includes(activePhase.id);

        if (isSensitivePhase && !blackoutCollisions.some(c => c.blackoutName === b.name && c.collidingPhase === activePhase.name)) {
          blackoutCollisions.push({
            blackoutName: b.name,
            period: `${b.startDate} to ${b.endDate}`,
            collidingPhase: activePhase.name,
            impact: b.impact || `Blackout freeze overlaps with ${activePhase.name} in Week ${w}. Testing or cutover activities will be restricted.`,
            severity: b.severity
          });
        }
      }
    });
  }

  // 15. Solution Architect Environment & Pod Instance Strategy (P2T & Patch Mapping)
  const environmentStrategy = calculateEnvironmentStrategy(scenario, phaseHours, startDateObj, projectWeeks);

  return {
    pillarScores,
    weightedComplexityScore,
    complexMultiplier,
    globalComplexityMultiplier,
    netClientModifier,
    moduleComplexityScores,
    rolloutMultiplier,
    rolloutComplexityScore,
    rolloutAvgScore,
    rolloutScheduleImpactWeeks,
    rolloutScopingHours,
    customScopingHours,
    customDriversHours,
    rolloutComplexityBreakdown,
    enablementWeeks,
    recommendedDurationWeeks,
    buildDurationBreakdown,
    moduleBaseHours,
    scaleBaseHours,
    moduleScopingHours,
    totalBaseHours,
    p10_BestCaseHours,
    p50_BaselineHours,
    p80_DefensibleHours,
    p95_ConservativeHours,
    targetHours,
    targetPersonMonths,
    totalFTE: targetHours / (projectWeeks * 40),
    avgTotalFTE: targetHours / (projectWeeks * 40),
    peakFTE: Math.max(...workstreamHours.map(w => w.avgFTE), targetHours / (projectWeeks * 40)),
    contingencyPct,
    conversionMetrics: {
      dataObjects,
      conversionCycles,
      historicalYears,
      baseConversionHours,
      hoursPerCycle: conversionHoursPerCycle,
      totalConversionP80Hours: Math.round(baseConversionHours * complexMultiplier * netClientModifier * rolloutMultiplier * globalComplexityMultiplier * (1 + contingencyPct)),
      cycleMultiplier: cumulativeMockMultiplier,
      historyMultiplier,
      mockSlidingBreakdown,
      baseSingleMockHours,
      e2eTotalHours,
      loadTotalHours
    },
    moduleEstimates,
    technicalWorkstreamEstimate,
    testingWorkstreamEstimate,
    tShirtSizeSummary,
    workstreamHours,
    phaseHours,
    deliveryRevenue,
    deliveryCost,
    grossProfitVal,
    grossMarginPct,
    blendedBillRate,
    blendedCostRate,
    hoursByRegion,
    costByRegion,
    revenueByRegion,
    doaTier,
    doaClassification,
    doaColor,
    commercialModel,
    identifiedRisks,
    hypercareStartWeek,
    goLiveWeek,
    patchConflictWeeks,
    blackoutCollisions,
    milestoneDates,
    scheduleFeasibility,
    phaseDeliveryModel,
    phaseOverrides,
    waveScheduleBreakdown,
    leadershipGaps: calculateLeadershipGaps(
      scenario,
      targetHours,
      contingencyPct,
      deliveryCost,
      deliveryRevenue,
      weightedComplexityScore,
      netClientModifier
    ),
    environmentStrategy,
    deliveryAssurance: calculateDeliveryAssurance(
      scenario,
      scheduleFeasibility,
      contingencyPct
    ),
    multiVendor: calculateMultiVendorMetrics(
      scenario,
      totalBaseHours,
      targetHours,
      moduleEstimates,
      workstreamHours,
      blendedBillRate,
      blendedCostRate
    )
  };
}

export function calculateEnvironmentStrategy(
  scenario: ProjectScenario,
  phaseHours: Array<ImplementationPhase & { startWeek: number; endWeek: number }>,
  startDateObj: Date,
  totalWeeks: number
): EnvironmentStrategyData {
  const podCohort = scenario.podCohort || 'B';
  const patchMonths = ORACLE_PATCH_COHORTS[podCohort]?.months || [0, 3, 6, 9];

  const buildPhase = phaseHours.find(p => p.id === 'phase_build');
  const test1Phase = phaseHours.find(p => p.id === 'phase_test_1');
  const test2Phase = phaseHours.find(p => p.id === 'phase_test_2');
  const cutoverPhase = phaseHours.find(p => p.id === 'phase_cutover');

  const buildStart = buildPhase?.startWeek || 3;
  const sitStart = test1Phase?.startWeek || Math.round(totalWeeks * 0.54);
  const sitEnd = test1Phase?.endWeek || Math.round(totalWeeks * 0.72);
  const uatStart = test2Phase?.startWeek || Math.round(totalWeeks * 0.70);
  const uatEnd = test2Phase?.endWeek || Math.round(totalWeeks * 0.86);
  const cutoverStart = cutoverPhase?.startWeek || Math.round(totalWeeks * 0.84);
  const cutoverEnd = cutoverPhase?.endWeek || Math.round(totalWeeks * 0.92);

  // 1. Environment Instances (5-Tier Enterprise Landscape)
  const instances: EnvironmentInstance[] = [
    {
      id: 'env_dev1',
      code: 'DEV1',
      name: 'DEV1 / Sandbox (Discovery & Rapid Prototyping)',
      tier: 'DEV1',
      purpose: 'Rapid prototyping, initial COA/Ledger validation, and Modern Best Practice exploration.',
      startWeek: 1,
      endWeek: totalWeeks,
      color: '#6366f1',
      activeWorkstreams: ['Functional Design', 'Technical Discovery', 'Security Setup'],
      keyMilestones: ['W2 Sandbox Access', 'W6 CRP1 Walkthrough']
    },
    {
      id: 'env_dev2',
      code: 'DEV2',
      name: 'DEV2 / Config (Gold Configuration & CEMLI Build)',
      tier: 'DEV2',
      purpose: 'Master configuration repository, OIC interface packaging, FastFormulas, and unit test sprints.',
      startWeek: buildStart,
      endWeek: sitEnd,
      color: '#0ea5e9',
      activeWorkstreams: ['Configuration Sprints', 'OIC Development', 'BIP Reports'],
      keyMilestones: [`W${buildStart} Gold Config Inception`, `W${Math.max(1, sitStart - 1)} Config Freeze`]
    },
    {
      id: 'env_test',
      code: 'TEST',
      name: 'TEST / SIT (System Integration Testing & Mock 1)',
      tier: 'TEST',
      purpose: 'Mock 1 FBDI data staging, cross-module end-to-end testing, third-party interface handshakes.',
      startWeek: Math.max(1, sitStart - 2),
      endWeek: sitEnd,
      color: '#f59e0b',
      isLocked: true,
      lockedPhaseName: 'SIT Code & Config Freeze (Zero-Ad-Hoc Change Policy)',
      activeWorkstreams: ['SIT Execution', 'Mock 1 FBDI Load', 'Interface Regression'],
      keyMilestones: [`W${Math.max(1, sitStart - 1)} Mock 1 Load`, `W${sitEnd} SIT Sign-Off`]
    },
    {
      id: 'env_stage',
      code: 'STAGE',
      name: 'STAGE / UAT (User Acceptance & Cutover Dress Rehearsal)',
      tier: 'STAGE',
      purpose: 'Production-like staging for UAT, Performance/Volume stress testing, and Mock 3 Gold Rehearsal.',
      startWeek: Math.max(1, uatStart - 1),
      endWeek: cutoverEnd,
      color: '#ea580c',
      isLocked: true,
      lockedPhaseName: 'UAT Lockdown & Cutover Rehearsal Sandbox',
      activeWorkstreams: ['UAT Business Scenarios', 'Load & Stress Testing', 'Mock 3 Dress Rehearsal'],
      keyMilestones: [`W${Math.max(1, uatStart - 1)} P2T Golden Clone`, `W${uatEnd} UAT Business Sign-Off`, `W${cutoverStart} Mock 3 Gold Run`]
    },
    {
      id: 'env_prod',
      code: 'PROD',
      name: 'PROD (Live Production Pod)',
      tier: 'PROD',
      purpose: 'Baseline provisioning, pre-cutover security locks, final Delta Data Conversion, Go-Live weekend switch, and Day-1 Hypercare.',
      startWeek: 2,
      endWeek: totalWeeks,
      color: '#ef4444',
      isLocked: true,
      lockedPhaseName: 'Production Strict Change Control & Cutover Lock',
      activeWorkstreams: ['Pre-Cutover Readiness', 'Delta Data Migration', 'Production Go-Live', 'Hypercare Support'],
      keyMilestones: ['W2 Account Provisioned', `W${cutoverStart} Go/No-Go Gate`, `W${cutoverEnd} Go-Live Switch`, `W${Math.min(totalWeeks, cutoverEnd + 4)} 1st Month-End Close`]
    }
  ];

  // 2. P2T Events
  const p2tEvents: EnvironmentP2TEvent[] = [
    {
      id: 'p2t_sit',
      week: Math.max(1, sitStart - 1),
      name: 'P2T Baseline Refresh #1 (Pre-SIT)',
      sourceInstance: 'DEV2 / Gold Config',
      targetInstance: 'TEST / SIT Pod',
      durationDays: 3,
      description: 'Clone verified gold configurations, lookup tables, and custom security roles into TEST prior to SIT entry.',
      status: 'planned'
    },
    {
      id: 'p2t_uat',
      week: Math.max(1, uatStart - 1),
      name: 'P2T Golden Snapshot #2 (Pre-UAT)',
      sourceInstance: 'TEST (Post-SIT Signed Off)',
      targetInstance: 'STAGE / UAT Pod',
      durationDays: 4,
      description: 'Full data and configuration clone into STAGE to establish clean baseline for Business UAT and Mock 3 Gold Rehearsal.',
      status: 'planned',
      isBlackoutRisk: false
    },
    {
      id: 'p2t_cutover',
      week: Math.max(1, cutoverStart - 1),
      name: 'Pre-Cutover Gold Config Extraction & Lockdown',
      sourceInstance: 'STAGE (Post-Mock 3)',
      targetInstance: 'PROD Live Pod',
      durationDays: 2,
      description: 'Final automated comparison of setup workbooks against PROD; freeze all administrative logins.',
      status: 'planned'
    }
  ];

  // 3. Patch Events
  const patchEvents: EnvironmentPatchEvent[] = [];
  const quarters = ['26A', '26B', '26C', '26D', '27A', '27B', '27C', '27D'];

  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = new Date(startDateObj.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
    const m = weekStart.getMonth();
    const isPatchMonth = patchMonths.includes(m);

    if (isPatchMonth) {
      const qIdx = patchMonths.indexOf(m);
      const qLabel = quarters[qIdx % quarters.length] || `Release-${m + 1}`;

      const dayOfMonth = weekStart.getDate();
      const isNonProdWeek = dayOfMonth <= 10;
      const isProdWeek = dayOfMonth >= 15 && dayOfMonth <= 24;

      if (isNonProdWeek || isProdWeek) {
        const isProdPatch = isProdWeek;
        const affected = isProdPatch ? ['PROD'] : ['DEV1', 'DEV2', 'TEST', 'STAGE'];
        
        const isSitOverlap = w >= sitStart && w <= sitEnd;
        const isUatOverlap = w >= uatStart && w <= uatEnd;
        const isCutoverOverlap = w >= cutoverStart && w <= cutoverEnd;

        const hasConflict = isSitOverlap || isUatOverlap || isCutoverOverlap;
        let conflictPhaseName: string | undefined;
        let actionRequired: string | undefined;
        let conflictSeverity: 'critical' | 'warning' | 'none' = 'none';

        if (isCutoverOverlap) {
          conflictSeverity = 'critical';
          conflictPhaseName = 'Cutover & Go-Live Window';
          actionRequired = 'CRITICAL: Must submit Oracle Patch Exemption to defer update until after Go-Live stabilization.';
        } else if (isUatOverlap) {
          conflictSeverity = 'warning';
          conflictPhaseName = 'Business Test 2 (UAT)';
          actionRequired = 'Execute 2-day automated regression test on STAGE post-patch before resuming client UAT test cases.';
        } else if (isSitOverlap) {
          conflictSeverity = 'warning';
          conflictPhaseName = 'Business Test 1 (SIT)';
          actionRequired = 'Validate OIC interfaces & payload schemas immediately following Friday evening release window.';
        }

        patchEvents.push({
          week: w,
          quarter: qLabel,
          podCohort,
          isProdPatch,
          dateStr: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          affectedInstances: affected,
          hasConflict,
          conflictSeverity,
          conflictPhaseName,
          actionRequired
        });
      }
    }
  }

  // 4. Solution Architect Readiness Checklist
  const clientLeadWeeks = scenario.scheduleModifiers?.envReadinessLeadWeeks ?? 2;
  const leadTimeRiskWeeks = Math.max(0, clientLeadWeeks - 2);

  const readinessChecks: EnvironmentReadinessCheckItem[] = [
    {
      id: 'chk_tenancy',
      title: 'Oracle Cloud Tenancy Activation & CSI Linking',
      leadTimeWeeks: 2,
      assignedRole: 'Client IT Director & Cloud Admin',
      status: 'ready',
      isCriticalPath: true,
      guidance: 'Ensure primary CSI is bound to the Cloud Console and service administrator credentials are assigned.'
    },
    {
      id: 'chk_sso',
      title: 'Identity Provider (IdP) SAML 2.0 / SSO & MFA Federation',
      leadTimeWeeks: clientLeadWeeks,
      assignedRole: 'Client Security / IAM Lead',
      status: clientLeadWeeks > 2 ? 'in_progress' : 'ready',
      isCriticalPath: true,
      guidance: 'Single Sign-On federation must be operational before Client Enablement (Week 1-2) to allow 100+ users access.'
    },
    {
      id: 'chk_oic_net',
      title: 'OIC Network Whitelisting, FastConnect / IPsec VPN & Certificates',
      leadTimeWeeks: 3,
      assignedRole: 'Principal Technical Architect & Network Lead',
      status: 'in_progress',
      isCriticalPath: true,
      guidance: 'Bi-directional network firewall rules between Oracle Cloud and on-premise banking/legacy endpoints.'
    },
    {
      id: 'chk_dual_pod',
      title: 'Dual-Pod Release Parity & Quarterly Patch Cohort Agreement',
      leadTimeWeeks: 1,
      assignedRole: 'Lead Enterprise Solution Architect',
      status: 'ready',
      isCriticalPath: false,
      guidance: `Confirmed Pod Cohort ${podCohort} maintenance window cadence with Oracle Cloud Operations.`
    },
    {
      id: 'chk_p2t_cab',
      title: 'P2T Environment Refresh SLA & Change Advisory Board (CAB) Approval',
      leadTimeWeeks: 2,
      assignedRole: 'Environment & Release Manager',
      status: 'ready',
      isCriticalPath: false,
      guidance: 'Formal booking of P2T maintenance windows with Oracle Cloud Support 2 weeks in advance.'
    },
    {
      id: 'chk_storage',
      title: 'Cutover Rehearsal Storage Quota & Performance Pod Sizing',
      leadTimeWeeks: 1,
      assignedRole: 'Data Migration Architect',
      status: 'ready',
      isCriticalPath: false,
      guidance: 'Verify test pod storage sizing accommodates high-volume FBDI conversion extracts without throttling.'
    }
  ];

  const patchConflictCount = patchEvents.filter(p => p.hasConflict).length;
  const p2tConflictCount = p2tEvents.filter(p => p.isBlackoutRisk).length;
  const isEnvironmentClean = patchConflictCount === 0 && p2tConflictCount === 0 && leadTimeRiskWeeks === 0;

  return {
    instances,
    p2tEvents,
    patchEvents,
    readinessChecks,
    leadTimeRiskWeeks,
    p2tConflictCount,
    patchConflictCount,
    isEnvironmentClean
  };
}

