export type NavTabId =
  | 'dashboard'
  | 'framework_slider'
  | 'podcast'
  | 'discovery'
  | 'benchmark_master'
  | 'multivendor'
  | 'estimation'
  | 'schedule'
  | 'leadership'
  | 'commercial'
  | 'governance'
  | 'reports';

export type OracleModule = string;
export type OraclePillar = 'ERP' | 'SCM' | 'HCM' | 'EPM' | 'CX' | string;

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ModuleEffortEstimate {
  moduleId: OracleModule;
  moduleName: string;
  pillar: string;
  tShirtSize: TShirtSize;
  calculatedTShirtSize?: TShirtSize;
  isDownsized?: boolean;
  downsizedDeltaHours?: number;
  tShirtScore: number; // 1.0 (XS) to 6.0 (XXL)
  baseHours: number;
  scopingHours: number; // hours from questionnaire
  scaleAttributedHours: number; // hours from scale drivers allocated to this module
  rawModuleHours: number; // base + scoping + scale
  netComplexityMultiplier: number; // compound complexity factor
  finalP50Hours: number; // baseline staffing hours for this module
  finalP80Hours: number; // defensible contract hours with contingency
  personMonths: number; // P80 / 160
  estimatedWeeks: number;
  avgFTE: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  questionnaireAvgScore: number; // 1.0 to 4.0
  totalQuestionsAnswered: number;
  keyComplexityDrivers: string[];
}

export interface ModuleDefinition {
  id: string;
  name: string;
  pillar: string;
  description: string;
  baseEffortHours: number;
  complexityFactor: number;
  isCustom?: boolean;
}

export interface ScaleDrivers {
  // SCM & Operations
  scm_plants: number;
  scm_wh: number;
  scm_inv: number;
  // Financials & Org Structure
  fin_ent: number;
  fin_led: number;
  fin_bu?: number;                 // Business Units (BUs) & Shared Services Centralization (default 2)
  fin_cur: number;
  fin_tax: number;
  fin_coa_segments: number;
  fin_secondary_ledgers?: number;  // Secondary Statutory / Local GAAP Ledgers (default 0)
  fin_sla_rules?: number;          // Custom Subledger Accounting (SLA) Derivation Rules (default 2)
  fin_intercompany_pairs?: number; // AGIS Intercompany Transacting Entity Pairs (default 1)
  // Senior Finance Leader Surgical Architecture & Schedule Bottlenecks
  fin_einvoicing_countries?: number; // Statutory E-Invoicing & Government Clearance Footprint (0: None/Domestic, 1: 1-2 Mandated e.g. KSeF/ZATCA, 2: 3-5 Mandated, 3: 6+ High-Frequency)
  fin_bank_cert_weeks?: number;      // External Bank Connectivity & Certification Lead-Time Window (weeks: 4, 8, 12, 16)
  fin_cutover_strategy?: 'day1_fiscal' | 'quarter_end' | 'mid_year_fa_catchup' | 'complex_multi_gaap'; // Financial Cutover & Fiscal Year-End Alignment Strategy
  // HCM & Workforce
  hcm_hc: number;
  hcm_pay_countries: number;
  hcm_union_groups: number;
  // Technical, Integrations & Data (CEMLI / RICEFW)
  tech_oic: number;
  tech_paas: number;
  tech_data_objects: number;
  tech_conversion_cycles?: number; // Number of Mock Data Conversion Load iterations (1 to 6, default 3)
  tech_historical_years?: number;  // Years of legacy transactional history (0 = Open Balances Only, 1, 2, 3+ yrs)
  tech_reports_bip: number;
  tech_reports_otbi: number;
  tech_fast_formulas: number;
  tech_workflows: number;
  tech_bpm_approval_groups?: number; // Advanced BPM / AME Matrix Approval Workflows (default 3)
  tech_security_roles?: number;    // Custom Security Job/Duty Roles & SOD Matrices
  tech_cutover_dr_runs?: number;   // Cutover Dress Rehearsals / Mock Dry Runs
  // Testing & Quality Assurance Workstream
  test_sit_cycles?: number;        // Business Testing 1 - SIT Cycles (1, 2, 3, default 2)
  test_uat_cycles?: number;        // Business Testing 2 - UAT Cycles (1, 2, default 1)
  test_scripts_count?: number;     // Total Scenarios & Test Scripts (e.g. 150 - 600)
  test_automation_pct?: number;    // Automated Regression Coverage (0% - 80%)
  test_perf_runs?: number;         // Performance / High-Volume Stress Runs (0 - 3)
  test_payroll_parallels?: number; // Payroll Parallel Test Runs (0 - 3)
  test_lead_model?: 'si_turnkey' | 'joint_50_50' | 'client_led';
  test_defect_retest_factor?: number; // 1.1x to 1.4x (default 1.25x)
}

export interface ComplexityPillar {
  id: 'functional' | 'technical' | 'data' | 'ocm' | 'governance';
  label: string;
  leadRole: string;
  weight: number;
  description: string;
}

export interface Question {
  text: string;
  options: { label: string; score: number; desc: string }[];
}

export type PodCohort = 'A' | 'B' | 'C';

export interface PodCohortInfo {
  name: string;
  months: number[]; // 0-indexed: [1,4,7,10] = Feb, May, Aug, Nov
  description: string;
  typicalCadence: string;
}

export type RolloutApproach = 'big_bang' | 'phased_geo' | 'phased_functional' | 'pilot_rollout';

export interface RolloutQuestionOption {
  label: string;
  score: number; // 1 to 4
  scheduleWeeks: number; // Impact on schedule in weeks (-N compression or +N expansion)
  hoursImpact: number; // Impact on base effort in hours
  desc: string;
  rationale: string;
}

export interface CustomScopingQuestion {
  id: string;
  category: string;
  title: string;
  description: string;
  options: {
    label: string;
    score: number; // 1 to 4
    scheduleWeeks: number;
    hoursImpact: number;
    desc: string;
    rationale: string;
  }[];
  selectedOptionIndex?: number;
}

export interface CustomScaleDriver {
  id: string;
  name: string;
  category: string;
  value: number;
  hoursPerUnit: number;
  description?: string;
}

export interface RolloutQuestion {
  id: string;
  category: 'Global Template & Governance' | 'Legacy Coexistence & Technical' | 'Regional Localization & Statutory' | 'Wave Execution & Cutover';
  title: string;
  description: string;
  options: RolloutQuestionOption[];
}

export interface RolloutComplexityBreakdownItem {
  questionId: string;
  category: string;
  title: string;
  selectedOptionLabel: string;
  score: number; // 1 to 4
  scheduleWeeks: number;
  hours: number;
  rationale: string;
}

export interface BlackoutPeriod {
  id: string;
  name: string;
  type: 'fiscal_yearend' | 'peak_trading' | 'inventory_count' | 'pod_patch' | 'statutory_tax' | 'custom';
  startDate: string;
  endDate: string;
  severity: 'hard_freeze' | 'soft_freeze';
  impact: string;
}

export interface Workstream {
  id: string;
  name: string;
  category: 'Functional' | 'Technical' | 'Data' | 'Testing' | 'Change' | 'Management';
  startPct: number;
  endPct: number;
  color: string;
  leadRole: string;
  effortShare: number;
  deliverables: string[];
  isParallel?: boolean;
}

export type PhaseDeliveryModel = 
  | 'sequential'                 // Classic sequential phase-gate
  | 'hypercare_overlap'          // Next Wave/Phase starts during Hypercare of prior phase
  | 'fast_tracked_parallel'     // Concurrency with parallel Discovery/Build streams
  | 'custom_non_sequential';     // Custom user-defined start weeks & sequence overrides

export interface PhaseOverride {
  phaseId: string;
  customStartWeek?: number;
  customDurationWeeks?: number;
  startDuringHypercare?: boolean;
  hypercareOffsetWeeks?: number; // e.g. 1 = 1st week of hypercare
  isParallel?: boolean;
  notes?: string;
}

export interface WaveScheduleItem {
  waveNumber: number;
  name: string;
  scopeSummary: string;
  startWeek: number;
  endWeek: number;
  goLiveWeek: number;
  hypercareStartWeek: number;
  hypercareEndWeek: number;
  durationWeeks: number;
  startsDuringPriorHypercare: boolean;
  overlapWeeks: number;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  code: string;
  weekOffsetPct: number;
  type: 'gate' | 'crp' | 'test' | 'cutover' | 'golive';
  description: string;
}

export interface ImplementationPhase {
  id: string;
  name: string;
  code: string;
  startWeekPct: number;
  endWeekPct: number;
  color: string;
  description: string;
  deliverables: string[];
  mandatoryWeeks?: number;
}

export interface DeliveryMix {
  onshore: number;
  nearshore: number;
  offshore: number;
}

export interface RoleRate {
  role: string;
  category: 'Strategic' | 'Functional' | 'Technical' | 'Support';
  onshoreBill: number;
  onshoreCost: number;
  nearshoreBill: number;
  nearshoreCost: number;
  offshoreBill: number;
  offshoreCost: number;
  defaultMixShare: number; // Percentage of total project hours
}

export interface EnvironmentP2TEvent {
  id: string;
  week: number;
  name: string;
  sourceInstance: string;
  targetInstance: string;
  durationDays: number;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  isBlackoutRisk?: boolean;
}

export interface EnvironmentPatchEvent {
  week: number;
  quarter: string; // e.g. "26A", "26B", "26C", "26D"
  podCohort: PodCohort;
  isProdPatch: boolean;
  dateStr: string;
  affectedInstances: string[];
  hasConflict: boolean;
  conflictSeverity?: 'critical' | 'warning' | 'none';
  conflictPhaseName?: string;
  actionRequired?: string;
}

export interface EnvironmentReadinessCheckItem {
  id: string;
  title: string;
  leadTimeWeeks: number;
  assignedRole: string;
  status: 'ready' | 'in_progress' | 'pending';
  isCriticalPath: boolean;
  guidance: string;
}

export interface EnvironmentInstance {
  id: string;
  code: string;
  name: string;
  tier: 'DEV1' | 'DEV2' | 'TEST' | 'STAGE' | 'PROD';
  purpose: string;
  startWeek: number;
  endWeek: number;
  color: string;
  isLocked?: boolean;
  lockedPhaseName?: string;
  activeWorkstreams: string[];
  keyMilestones: string[];
}

export interface EnvironmentStrategyData {
  instances: EnvironmentInstance[];
  p2tEvents: EnvironmentP2TEvent[];
  patchEvents: EnvironmentPatchEvent[];
  readinessChecks: EnvironmentReadinessCheckItem[];
  leadTimeRiskWeeks: number;
  p2tConflictCount: number;
  patchConflictCount: number;
  isEnvironmentClean: boolean;
}

export type ImplementationMethodology = 'agile_iterative' | 'hybrid_oum' | 'waterfall';
export type ClientDecisionSLA = 'rapid_3d' | 'standard_5d' | 'delayed_10d';

export interface ScheduleModifiers {
  methodology: ImplementationMethodology;
  fastTrackingOverlapPct: number; // 0 to 35%
  clientDecisionSLA: ClientDecisionSLA;
  envReadinessLeadWeeks: number; // 0, 2, 4
  dataReadinessScore: 1 | 2 | 3; // 1 = Clean Golden Records, 2 = In-Flight Cleansing, 3 = Severe Legacy Debt
  sprintCadenceWeeks: 2 | 3 | 4;
}

export interface ScheduleFeasibility {
  schedulingMode: 'forward' | 'backward';
  clientTargetGoLiveDate: string;
  calculatedGoLiveDate: string;
  requiredKickoffDate: string;
  varianceWeeks: number; // positive = buffer ahead of client ask, negative = schedule deficit
  compressionPct: number; // % compressed if client target is tighter than calculated
  isFeasible: boolean;
  feasibilityRating: 'Optimal' | 'Manageable' | 'Aggressive' | 'Critical Deficit';
  industryBenchmarkDurationWeeks: number;
  industryBenchmarkLabel: string;
  industryBenchmarkBreakdown: Record<string, number>;
  crashDurationWeeks: number;
  velocityMultiplier: number;
  complexityDriversBreakdown: Array<{
    name: string;
    impactWeeks: number;
    rationale: string;
  }>;
  recommendations: string[];
}

export interface ProjectScenario {
  id: string;
  name: string;
  thorId?: string;
  clientName?: string;
  industry?: string;
  description: string;
  proposalCreatedAt?: string;
  selectedModules: OracleModule[];
  scaleDrivers: ScaleDrivers;
  complexityAnswers: Record<string, number[]>;
  moduleQuestionAnswers?: Record<string, number[]>; // Stores answers to top 20 questions for each module
  confidence: number;
  clientModifiers: {
    decisionVelocity: number;      // Modifier 1: SteerCo & Sponsor turnaround
    dataDebt: number;              // Modifier 2: Legacy data cleansing & debt
    cloudMindset: number;          // Modifier 3: Standard MBP vs legacy customization
    integrationVolatility: number; // Modifier 4: Middleware & 3rd party API stability
    smeAvailability: number;       // Modifier 5: Dedicated client SME capacity
    regulatoryCompliance: number;  // Modifier 6: Multi-country statutory tax & e-invoicing
    changeResistance: number;      // Modifier 7: Change resistance & workforce adoption
    customizationPolicy?: number;  // Legacy support
  };
  rolloutApproach: RolloutApproach;
  rolloutWaves: number;
  waveDescriptions?: string[];
  rolloutOverlapWeeks: number;
  rolloutQuestionAnswers?: Record<string, number>; // Maps questionId (or index) to selected option index (0 to 3)
  blackoutPeriods: BlackoutPeriod[];
  deliveryMix: DeliveryMix;
  deliveryModel?: string;
  podCohort: PodCohort;
  projectWeeks: number;
  targetStartDate: string;
  clientTargetGoLiveDate?: string;
  schedulingMode?: 'forward' | 'backward';
  scheduleModifiers?: ScheduleModifiers;
  contingencyPctOverride?: number;
  phaseDeliveryModel?: PhaseDeliveryModel;
  phaseOverrides?: Record<string, PhaseOverride>;
  waveStartDuringHypercare?: boolean;
  globalComplexityMultiplier?: number; // 1.0 baseline, can be 1.15, 1.25, 1.5, 2.0, etc.
  customQuestions?: CustomScopingQuestion[];
  customScaleDrivers?: CustomScaleDriver[];
  customQuestionAnswers?: Record<string, number>;
  customModules?: ModuleDefinition[]; // Dynamic user-added modules
  customPillars?: string[]; // Dynamic user-added domains / pillars
  customModuleQuestions?: Record<string, any[]>; // Dynamic user-added or customized module 20-Q questions
  // Proposal Upload & AI Inferred Discovery
  uploadedProposals?: UploadedProposal[];
  questionConfidenceMeta?: Record<string, Record<number, QuestionConfidenceMeta>>; // moduleId -> questionIdx -> meta
  moduleTShirtOverrides?: Record<string, TShirtSize>; // Explicit user T-Shirt overrides
  // Technical Objects & Integration Scoping
  scopeMode?: ScopeMode;
  integrationScopingOptions?: IntegrationScopingOptions;
  technicalIntegrations?: TechnicalIntegrationItem[];
  technicalSmcOverrides?: Record<string, { simple?: number; medium?: number; complex?: number }>;
  // Comprehensive Intel & Spec Sheet Ingestion Engine
  clientIntel?: ClientIntelData;
  industryIntel?: IndustryIntelData;
  specSheetIntel?: SpecSheetIntelData;
  intelSynthesis?: IntelSynthesisResult;
  // Whiteboard Governance: Spec Sheet Blackout Freeze & Audit Trail
  isBlackoutLocked?: boolean;
  blackoutLockedAt?: string;
  blackoutLockedBy?: string;
  blackoutReason?: string;
  isScheduleFrozen?: boolean;
  scheduleFrozenAt?: string;
  scheduleFrozenBy?: string;
  auditLog?: Array<{
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    isDuringBlackout?: boolean;
  }>;
  // Resource Grade & Delivery Model Distribution
  gradeDistributionOverrides?: Record<string, number>; // Grade ID -> % Share
  deliverySourcingOverrides?: {
    inHousePct: number;
    subcontractorPct: number;
    gdcOffshorePct: number;
  };
  // Multi-Vendor & Multi-SI Ecosystem Scope Demarcation
  multiVendor?: MultiVendorConfig;
  // Benchmark Master Calibration & Intrinsic Modifiers
  benchmarkMasterConfig?: any;
  moduleMultipliers?: Record<string, number>;
  // Bid-Specific Defaults & Input Reduction Profile
  scopingInputMode?: ScopingInputMode;
  bidDefaultsConfig?: BidDefaultsConfig;
  fieldConfidenceMeta?: Record<string, FieldConfidenceMeta>;
}

export interface ClientIntelData {
  clientName?: string;
  industrySector?: string;
  annualRevenue?: string;
  totalHeadcount?: number;
  operatingRegions?: string[];
  legacyLandscape?: string[];
  keyPainPoints?: string[];
  bpoAvailabilityRating?: number; // 1 (constrained 25%) to 5 (dedicated 100%)
  changeReadinessScore?: number; // 1 (high resistance) to 5 (agile)
  targetGoLiveDate?: string;
  blackoutWindows?: string[];
  rawText?: string;
  lastUpdated?: string;
}

export interface IndustryIntelData {
  sector: string;
  subSector?: string;
  regulatoryMandates: string[];
  standardCoaSegments: number;
  averagePlantDensity: string;
  integrationDensityRating: 'Low' | 'Medium' | 'High' | 'Very High';
  complianceDrivers: string[];
  industryBenchmarkNotes: string[];
  rawText?: string;
  lastUpdated?: string;
}

export interface SpecSheetIntelData {
  offeringsDetected: string[];
  modulesDetected: OracleModule[];
  scaleDriversDetected: Partial<ScaleDrivers>;
  integrationCount: number;
  conversionObjectsCount: number;
  conversionMockCycles: number;
  customReportsCount: number;
  paasRequirements: string[];
  rawText?: string;
  lastUpdated?: string;
}

export interface IntelSynthesisResult {
  clientSummary: string;
  industryContext: string;
  scopeSummary: string;
  pros: string[];
  cons: string[];
  riskFactors: { risk: string; severity: 'High' | 'Medium' | 'Low'; mitigation: string }[];
  highPriorityClarifications: string[];
  confidenceSummary: {
    overallScore: number;
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
    clarificationsRequiredCount: number;
  };
  fieldUpdatesApplied: string[];
}

export type TechnicalComplexityTier = 'S' | 'M' | 'C' | 'XL';
export type TechnicalTShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ConversionTShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type TechnicalIntegrationType = 'inbound_rest' | 'outbound_extract' | 'bidirectional_sync' | 'batch_fbdi' | 'event_driven';

export interface TechnicalWorkstreamTShirtBenchmark {
  workstreamId: 'INT' | 'REP' | 'PAAS_INFRA' | 'PAAS_SEC' | 'PAAS_AI';
  workstreamName: string;
  category: 'Integration' | 'Reporting & Analytics' | 'PaaS & AI Platform';
  size: TechnicalTShirtSize;
  label: string;
  designHours: number;
  buildHours: number;
  testHours: number;
  totalHours: number;
  typicalScope: string;
}

export interface ConversionTShirtBenchmark {
  size: ConversionTShirtSize;
  label: string;
  e2eHours: number;
  loadHours: number;
  totalPerMockHours: number;
  typicalEntities: string[];
}

export type ConversionArchetype = 'Foundation / Setup' | 'Master Data' | 'Open Balances' | 'Transactional History';
export type ConversionLoadEngine = 'FBDI' | 'HDL' | 'HSDL' | 'REST API / ADFdi' | 'Manual / CSV';

export interface ConversionEntityItem {
  id: string;
  name: string;
  pillar: 'ERP' | 'SCM' | 'HCM' | 'EPM';
  category: 'Master Data' | 'Open Balances' | 'Transactional History';
  archetype?: ConversionArchetype;
  loadEngine?: ConversionLoadEngine;
  tShirtSize: ConversionTShirtSize;
  sourceSystem: string;
  targetFBDI: string;
  // Lifecycle Tier Sizing (Decoupled)
  specAndBuildHours?: number;   // Tier 1: Mapping, FBDI build, transform logic (one-time)
  mockCycleHours?: number;       // Tier 2: Per-mock staging & execution hours
  reconciliationHours?: number;  // Tier 3: Validation, tie-out & cutover dry-run
  notes?: string;
}

export interface ConversionMockScaleItem {
  mockNumber: number;
  name: string;
  percentage: number; // e.g. 1.0, 0.8, 0.6, 0.4
  percentageLabel: string;
  description: string;
  hours: number;
}

export type ScopeMode = 'full_implementation' | 'integrations_only';

export interface IntegrationScopingOptions {
  includeErrorFramework?: boolean;       // Standardized OIC Fault & Notification Framework (+160 hrs)
  includeCanonicalDataModel?: boolean;   // CDM / Common Business Object Model (+120 hrs)
  includePartnerCoTesting?: boolean;     // Joint End-to-End Testing with External 3rd-Party Systems (+25% test)
  includeB2BEdiSupport?: boolean;        // B2B / EDI X12 / EDIFACT Mapping & AS2 Gateway (+80 hrs)
  targetSystems?: string[];              // Selected connected endpoints (e.g. Salesforce, SAP, Banks)
  devSquadSize?: number;                 // Number of active OIC developers (default 4)
  simpleCount?: number;                  // Fast counter for Simple (35h)
  mediumCount?: number;                  // Fast counter for Medium (70h)
  complexCount?: number;                 // Fast counter for Complex (140h)
  extraLargeCount?: number;              // Fast counter for Extra Large (220h)
}

export interface IntegrationQuestionAnswers {
  patternDirection: number;    // 0: Inbound (1.0x), 1: Outbound (1.1x), 2: Bidirectional Sync (1.5x), 3: Event-Driven Pub/Sub (1.6x)
  mappingComplexity: number;   // 0: 1:1 Direct (<15 fields) (0.8x), 1: Standard (15-50 fields + DVM) (1.2x), 2: Multi-object / XSLT (1.7x), 3: Deep nested canonical (2.2x)
  connectivityProtocol: number;// 0: Oracle Cloud Adapter (0.9x), 1: Generic REST/SOAP (1.1x), 2: SFTP/AS2/On-Prem Agent (1.4x), 3: Legacy DB/Mainframe (1.8x)
  dataVolume: number;          // 0: Low Transactional (<1k/day) (0.9x), 1: Moderate (1k-50k/day) (1.1x), 2: High-Volume FBDI (>50k/day) (1.5x), 3: Continuous Streaming (1.9x)
  errorHandling: number;       // 0: Basic Email Alert (0.8x), 1: OIC Error Hospital & Retry (1.2x), 2: Custom Exception Replay & Workbench (1.6x)
  apiReadiness: number;        // 0: Documented OpenAPI / Sandbox (0.9x), 1: Concurrent in-flight dev (1.3x), 2: Legacy DB/No API (1.7x)
}

export interface TechnicalIntegrationItem {
  id: string;
  name: string;
  code: string;
  pillar: 'ERP' | 'SCM' | 'HCM' | 'EPM' | 'CX' | 'Cross-Pillar';
  sourceSystem: string;
  targetSystem: string;
  type: TechnicalIntegrationType;
  complexity: TechnicalComplexityTier;
  isQuestionDriven: boolean;
  questionAnswers: IntegrationQuestionAnswers;
  baseHours: number;
  calculatedHours: number;
  calculationFormula: string;
  compositeScore: number;
  rationale: string;
  notes?: string;
}

export interface TechnicalObjectSmcRow {
  typeId: string;
  typeName: string;
  category: 'integrations' | 'paas' | 'reports_bip' | 'reports_otbi' | 'fast_formulas' | 'workflows' | 'security_roles' | 'conversions';
  categoryLabel: string;
  simpleCount: number;
  mediumCount: number;
  complexCount: number;
  simpleHours: number;
  mediumHours: number;
  complexHours: number;
  totalCount: number;
  totalHours: number;
  description: string;
}

export interface TechnicalScopingQuestionOption {
  label: string;
  score: number;       // 1 to 4
  multiplier: number;  // 0.8x to 2.2x
  description: string;
  rationale: string;
}

export interface TechnicalScopingQuestion {
  id: keyof IntegrationQuestionAnswers;
  title: string;
  category: string;
  description: string;
  options: TechnicalScopingQuestionOption[];
}

export type ScopingInputMode = 'fast_track' | 'standard' | 'comprehensive';

export interface FieldConfidenceMeta {
  fieldName: string;
  confidence: 'high' | 'medium' | 'low' | 'unconfirmed';
  percentage: number; // 0 to 100
  source: 'ai_ingestion' | 'bid_default' | 'user_override' | 'default_benchmark';
  citation?: string;
  rationale?: string;
  lastUpdated?: string;
}

export interface BidDefaultsConfig {
  inputMode: ScopingInputMode;
  defaultTShirtSize: TShirtSize;
  defaultQuestionOptionIdx: number; // 0 = Fit-to-Standard (MBP), 1 = Standard (C2), 2 = Complex (C3)
  defaultScaleDrivers: Partial<ScaleDrivers>;
  defaultClientModifiers: Partial<ProjectScenario['clientModifiers']>;
  confidenceScoreForDefaults: number; // e.g., 75
  aiConfidenceThreshold: number; // e.g., 70 (flag below this for client Q&A)
  autoApplyDefaultsOnIngestion: boolean;
  profileName?: string;
}

export interface QuestionConfidenceMeta {
  confidence: 'high' | 'medium' | 'low' | 'unconfirmed';
  percentage: number; // 0 to 100
  source: 'scoping_sheet' | 'ai_proposal' | 'manual_override' | 'default_benchmark' | 'client_confirmed' | 'bid_default';
  proposalCitation?: string;
  clientClarificationNeeded?: boolean;
  clientNotes?: string;
}

export interface UploadedProposal {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  rawText: string;
  analyzedStatus: 'analyzed' | 'parsing' | 'error';
  inferredModules: OracleModule[];
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  extractedScaleDrivers?: Partial<ScaleDrivers>;
  summaryFindings?: string[];
  clientClarificationsNeeded?: string[];
  scopingSheetQuestionsCount?: number;
  moduleRatingsCount?: number;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unconfirmed';

export interface ClientQuestionItem {
  id: string;
  moduleId: OracleModule;
  moduleName: string;
  pillar: string;
  questionIndex: number;
  questionText: string;
  category: string;
  rationale: string;
  currentOptionSelected: string;
  confidence: 'high' | 'medium' | 'low' | 'unconfirmed';
  confidencePercentage: number;
  proposalCitation?: string;
  clientClarificationNeeded: boolean;
  clientResponseNotes?: string;
}

export type ClientClarificationItem = ClientQuestionItem & {
  currentOptionIndex?: number;
  suggestedQuestionForClient?: string;
};

export interface ModuleScopingQuestionOption {
  label: string;
  score: number;
  desc: string;
  hoursImpact: number;
}

export interface ModuleScopingQuestion {
  id: string;
  category: 'Process Scope' | 'Integrations & Feeds' | 'Data & Conversions' | 'Approvals & Workflows' | 'Reporting & Analytics' | 'Compliance & Security' | string;
  question: string;
  rationale?: string;
  isMandatory?: boolean; // Core driver question deciding fundamental scoping & sizing
  tag?: string; // Descriptive badge, e.g. 'Core Topology Driver', 'Key Integration Flow'
  weight?: number; // Sizing weight (defaults to 2.5 for mandatory, 1.0 for optional)
  options: ModuleScopingQuestionOption[];
}

export interface CalculatedProjectData {
  // Complexity
  pillarScores: Record<string, number>;
  weightedComplexityScore: number;
  complexMultiplier: number;
  globalComplexityMultiplier: number;
  netClientModifier: number;
  moduleComplexityScores: Record<string, { avgScore: number; additionalHours: number }>;

  // Rollout & Sizing
  rolloutMultiplier: number;
  rolloutComplexityScore: number; // 0 to 100
  rolloutAvgScore: number; // 1.0 to 4.0
  rolloutScheduleImpactWeeks: number; // Net schedule variance driven by rollout questionnaire
  rolloutScopingHours: number; // Base hours added by rollout questionnaire
  customScopingHours: number; // Hours added by custom user/AI scoping questions
  customDriversHours: number; // Hours added by custom user/AI scale drivers
  rolloutComplexityBreakdown: RolloutComplexityBreakdownItem[];
  enablementWeeks: number; // Always 2 weeks mandatory
  recommendedDurationWeeks: number;

  // Dynamic Build Duration Derivation (Technical Inventory & Sprint Runway)
  buildDurationBreakdown: {
    baseConfigWeeks: number;
    oicIntegrationsWeeks: number;
    reportsWeeks: number;
    paasExtensionsWeeks: number;
    workflowsAndRulesWeeks: number;
    mock1ConversionWeeks: number;
    stringTestingWeeks: number;
    totalRawBuildWeeks: number;
    fastTrackingSavingsWeeks: number;
    recommendedBuildWeeks: number;
    totalTechnicalDevDays: number;
    recommendedDevSquadFTE: number;
    rationale: string;
  };

  // Effort Breakdown (Hours)
  moduleBaseHours: number;
  scaleBaseHours: number;
  moduleScopingHours: number;
  totalBaseHours: number;
  p10_BestCaseHours: number;
  p50_BaselineHours: number;
  p80_DefensibleHours: number;
  p95_ConservativeHours: number;
  targetHours: number;
  targetPersonMonths: number;
  totalFTE: number;
  avgTotalFTE: number;
  peakFTE: number;
  contingencyPct: number;

  // Data Conversion Sizing & Rehearsal Breakdown (TBD 5-Tier T-Shirt & 4-Mock Sliding Scale)
  conversionMetrics?: {
    dataObjects: number;
    conversionCycles: number;
    historicalYears: number;
    baseConversionHours: number;
    hoursPerCycle: number;
    totalConversionP80Hours: number;
    cycleMultiplier: number;
    historyMultiplier: number;
    mockSlidingBreakdown?: ConversionMockScaleItem[];
    tShirtCounts?: Record<ConversionTShirtSize, number>;
    e2eTotalHours?: number;
    loadTotalHours?: number;
    baseSingleMockHours?: number;
  };

  // Detailed Workstream Estimates
  technicalWorkstreamEstimate?: {
    totalHours: number;
    personMonths: number;
    avgFTE: number;
    tShirtSize: TShirtSize;
    integrationsHours: number;
    paasHours: number;
    reportsHours: number;
    fastFormulasHours: number;
    workflowsHours: number;
    securityRolesHours: number;
    deliverables: string[];
  };
  testingWorkstreamEstimate?: {
    totalHours: number;
    personMonths: number;
    avgFTE: number;
    tShirtSize: TShirtSize;
    strategyHours: number;
    // Business Testing 1 - SIT
    businessTesting1Hours: number;
    sitHours: number;
    sitCycles: number;
    sitFunctionalScriptHours: number;
    sitOicInterfaceHours: number;
    sitMockDataVerifyHours: number;
    sitDefectTriageHours: number;
    // Business Testing 2 - UAT
    businessTesting2Hours: number;
    uatHours: number;
    uatCycles: number;
    uatScenarioHours: number;
    uatCrpSimulationHours: number;
    uatTesterEnablementHours: number;
    uatDefectRetestHours: number;
    // Automation & Non-Functional Testing (NFT)
    automationHours: number;
    automationPct: number;
    performanceHours: number;
    perfRuns: number;
    payrollParallelHours: number;
    payrollParallels: number;
    // Commercials & Grade Mix
    blendedRate: number;
    costRate: number;
    revenue: number;
    cost: number;
    marginPct: number;
    gradeBreakdown: {
      gradeA_OffshoreExecutionHours: number;
      gradeB_FunctionalLeadHours: number;
      gradeC_TestManagerHours: number;
    };
    deliverables: string[];
    wbsTasks?: Array<{
      wbsId: string;
      taskNumber: string;
      name: string;
      phase: string;
      durationWeeks: number;
      hours: number;
      assignedRole: string;
      predecessors: string;
    }>;
  };

  // Module-Level T-Shirt Sizing & Effort Breakdown
  moduleEstimates: ModuleEffortEstimate[];
  tShirtSizeSummary: Record<TShirtSize, number>;

  // Track & Phase Hours
  workstreamHours: Array<Workstream & {
    startWeek: number;
    endWeek: number;
    hours: number;
    personMonths: number;
    avgFTE: number;
  }>;
  phaseHours: Array<ImplementationPhase & {
    startWeek: number;
    endWeek: number;
    hours: number;
    durationWeeks: number;
  }>;

  // Financials & Commercials
  deliveryRevenue: number;
  deliveryCost: number;
  grossProfitVal: number;
  grossMarginPct: number;
  blendedBillRate: number;
  blendedCostRate: number;
  hoursByRegion: {
    onshore: number;
    nearshore: number;
    offshore: number;
  };
  costByRegion: {
    onshore: number;
    nearshore: number;
    offshore: number;
  };
  revenueByRegion: {
    onshore: number;
    nearshore: number;
    offshore: number;
  };
  masterBlendedCalc?: any;

  // Governance & Risks
  doaTier: 1 | 2 | 3;
  doaClassification: string;
  doaColor: string;
  commercialModel: 'Fixed Price (Milestone-Based)';
  identifiedRisks: Array<{
    category: string;
    severity: 'High' | 'Medium' | 'Low';
    title: string;
    impact: string;
    mitigation: string;
  }>;

  // Schedule & Patch Conflict Detection
  hypercareStartWeek: number;
  goLiveWeek: number;
  patchConflictWeeks: number[];
  blackoutCollisions: Array<{
    blackoutName: string;
    period: string;
    collidingPhase: string;
    impact: string;
    severity: 'hard_freeze' | 'soft_freeze';
  }>;
  milestoneDates: Array<ProjectMilestone & { week: number; calendarDate: string }>;

  // Schedule Feasibility, Back-Date Planning & Industry Benchmarks
  scheduleFeasibility: ScheduleFeasibility;

  // Multi-Phase Non-Sequential & Phase Sequence Overrides
  phaseDeliveryModel: PhaseDeliveryModel;
  phaseOverrides: Record<string, PhaseOverride>;
  waveScheduleBreakdown: WaveScheduleItem[];

  // Senior Leadership Scheduling & Estimation Gaps
  leadershipGaps: LeadershipGapsReport;

  // Environment & Pod Instance Strategy (P2T Refreshes & Patch Mapping)
  environmentStrategy: EnvironmentStrategyData;

  // Delivery Assurance Confidence & Dynamic Contingency Recommendation (Whiteboard Images 1, 3 & 5)
  deliveryAssurance: DeliveryAssuranceReport;

  // Multi-Vendor & Multi-SI Ecosystem Scope Demarcation Metrics
  multiVendor?: MultiVendorMetrics;

  // Standalone Integrations-Only Sizing
  scopeMode?: ScopeMode;
  isIntegrationsOnly?: boolean;
}

export interface DeliveryAssuranceWorkstreamScore {
  workstreamId: string;
  workstreamName: string;
  category: string;
  confidenceScorePct: number; // 0 - 100%
  assuranceRating: 'High' | 'Moderate' | 'Low' | 'Critical Uncertainty';
  recommendedContingencyPct: number; // e.g. 10%, 15%, 20%, 25%
  extractedEvidenceCount: number;
  lowConfidenceCount: number;
  riskDrivers: string[];
}

export interface DeliveryAssuranceReport {
  overallAssuranceScore: number; // 0 - 100%
  overallAssuranceRating: 'High' | 'Moderate' | 'Low' | 'Critical Uncertainty';
  recommendedContingencyPct: number; // 10% to 30%
  contingencyDeltaPct: number; // recommended vs current scenario contingency
  contingencyRationale: string;
  factors: {
    rfpEvidenceConfidence: number;
    scheduleCompressionPenalty: number;
    dataDebtVolatility: number;
    deliveryModelRisk: number;
  };
  workstreamScores: DeliveryAssuranceWorkstreamScore[];
}

export interface ResourceGradeItem {
  id: string;
  gradeCode: string;
  gradeName: string;
  category: 'Strategic' | 'Lead' | 'Execution' | 'Specialist';
  defaultMixSharePct: number;
  hours: number;
  fte: number;
  blendedBillRate: number;
  blendedCostRate: number;
  sourcing: {
    inHousePct: number;
    subcontractorPct: number;
    gdcOffshorePct: number;
  };
}

// ----------------------------------------------------
// 5 SENIOR LEADERSHIP GAPS SPECIFIC TO SCHEDULING & ESTIMATION
// ----------------------------------------------------

// GAP 1: Critical Path & Slack/Float Network Analysis (CPM)
export interface CriticalPathActivity {
  id: string;
  name: string;
  workstream: string;
  phase: string;
  durationWeeks: number;
  earlyStartWeek: number;
  earlyFinishWeek: number;
  lateStartWeek: number;
  lateFinishWeek: number;
  totalFloatDays: number;
  freeFloatDays: number;
  isCritical: boolean;
  dependencies: string[];
  bottleneckRisk: 'Critical' | 'Elevated' | 'Low';
  oracleImpact: string;
}

export interface CriticalPathData {
  criticalPathLengthWeeks: number;
  zeroFloatActivitiesCount: number;
  nearCriticalActivitiesCount: number;
  totalBufferDays: number;
  longestPathSequence: string[];
  activities: CriticalPathActivity[];
  pathEfficiencyPct: number;
}

// GAP 2: Multi-Instance Pod Environment Landscape & Refresh Sequencing
export interface PodEnvironment {
  podId: 'DEV1' | 'DEV2' | 'TEST' | 'STAGE' | 'PROD';
  name: string;
  purpose: string;
  provisionWeek: number;
  activeStartWeek: number;
  activeEndWeek: number;
  color: string;
  p2tRefreshWindows: Array<{ week: number; label: string; impact: string }>;
  lockoutWindows: Array<{ startWeek: number; endWeek: number; reason: string; severity: 'hard_freeze' | 'soft_freeze' }>;
  quarterlyPatchWeeks: number[];
}

export interface EnvironmentLandscapeData {
  pods: PodEnvironment[];
  goldenConfigPod: string;
  totalP2TRefreshes: number;
  testingLockoutWeeksCount: number;
  riskAlerts: string[];
}

// GAP 3: Iterative Data Migration Cutovers & Mock Velocity
export interface DataMigrationMockCycle {
  id: string;
  name: string;
  phase: string;
  targetWeek: number;
  targetEnvironment: string;
  scopeVolumePct: number;
  totalEstimatedRecords: number;
  throughputPerHour: number;
  estimatedDurationHours: number;
  keyDataEntities: string[];
  signOffCriteria: string;
  readinessStatus: 'Planned' | 'Critical Milestone' | 'Go-Live Rehearsal';
}

export interface CutoverWeekendEntity {
  name: string;
  method: 'FBDI' | 'HDL' | 'ADFdi' | 'REST API' | 'Manual Setup';
  volume: number;
  loadVelocityPerHour: number;
  estimatedHours: number;
  sequenceOrder: number;
  dependency: string;
}

export interface DataCutoverData {
  mockCycles: DataMigrationMockCycle[];
  cutoverWeekendHoursAvailable: number; // e.g. 72h Friday 18:00 to Monday 18:00
  cutoverEstimatedTotalHours: number;
  cutoverContingencyBufferHours: number;
  cutoverFeasibilityStatus: 'Comfortable' | 'Tight (<12h Buffer)' | 'High Risk (Exceeds 72h)';
  parallelPayrollRuns: Array<{ runNumber: number; week: number; description: string; passThresholdPct: number }>;
  criticalEntities: CutoverWeekendEntity[];
}

// GAP 4: Monte Carlo Schedule & Effort Confidence Simulation
export interface MonteCarloCurvePoint {
  percentile: number; // e.g. 10, 25, 50, 75, 80, 90, 95
  durationWeeks: number;
  hours: number;
  cost: number;
  probabilityDensity: number;
  cumulativeProbability: number;
}

export interface MonteCarloSimulationData {
  iterations: number;
  p10_Aggressive: { weeks: number; hours: number; cost: number };
  p50_Baseline: { weeks: number; hours: number; cost: number };
  p80_DefensibleTarget: { weeks: number; hours: number; cost: number };
  p90_BoardCommitment: { weeks: number; hours: number; cost: number };
  currentProbabilityOnTime: number; // % chance of meeting current projectWeeks
  recommendedReserveBudget: number;
  recommendedReserveHours: number;
  simulationCurve: MonteCarloCurvePoint[];
  topRiskVarianceDrivers: Array<{ factor: string; varianceContributionPct: number; recommendation: string }>;
}

// GAP 5: Client vs SI Co-Staffing & SME Backfill Crunch Model
export interface CoStaffingPhase {
  phaseId: string;
  phaseName: string;
  siFTE: number;
  clientSmeFTE: number;
  clientItFTE: number;
  totalFTE: number;
  clientCommitmentPct: number; // % of FTE dedicated to project vs BAU
  isCrunchPhase: boolean;
  crunchReason?: string;
  backfillRecommendation: string;
}

export interface CoStaffingModel {
  totalSiPersonMonths: number;
  totalClientPersonMonths: number;
  blendedCoStaffingRatio: string;
  peakClientFTE: number;
  peakWeek: number;
  estimatedClientBackfillCost: number;
  phaseStaffing: CoStaffingPhase[];
  keySmeRoles: Array<{ role: string; siHours: number; clientHours: number; peakPhase: string; mitigation: string }>;
}

export interface LeadershipGapsReport {
  criticalPath: CriticalPathData;
  environmentLandscape: EnvironmentLandscapeData;
  dataCutover: DataCutoverData;
  monteCarlo: MonteCarloSimulationData;
  coStaffing: CoStaffingModel;
  executiveSummary: {
    headline: string;
    scheduleFeasibilityScore: number; // 0-100
    topDecisionNeeded: string;
    recommendedSteerCoActions: string[];
  };
}

// Multi-Vendor & Multi-SI Ecosystem Scope Demarcation Types
export type DeliveryOwnerParty = 
  | 'our_si'        // Our SI (Prime Delivery / Turnkey)
  | 'other_si'      // Other SI / BI (Business Integrator / Specialized Partner)
  | 'client'        // Client Internal Team
  | 'validation_si' // Validation SI / IV&V (Independent Verification & Validation)
  | 'joint';        // Joint / Co-Delivery (split %)

export interface MultiVendorPartyConfig {
  id: DeliveryOwnerParty;
  name: string;
  shortCode: string;
  roleType: 'Prime SI' | 'Specialized SI / BI' | 'Client Organization' | 'Independent IV&V / Auditor' | 'Joint Delivery';
  color: string;
  badgeClass: string;
  contactPerson?: string;
  organizationName?: string;
  description: string;
}

export interface ModuleScopeDemarcation {
  moduleId: OracleModule;
  moduleName?: string;
  pillar?: string;
  primaryOwner: DeliveryOwnerParty;
  ourSiSharePct: number;       // 0 to 100%
  otherSiSharePct: number;     // 0 to 100%
  clientSharePct: number;      // 0 to 100%
  validationSiPct: number;     // 0 to 100% (e.g. 10-20% for IV&V review)
  leadRoleTitle?: string;
  notes?: string;
  handshakeComplexity: 'Low' | 'Medium' | 'High';
}

export interface PhaseScopeDemarcation {
  phaseId: string;
  phaseName: string;
  code: string;
  primaryOwner: DeliveryOwnerParty;
  ourSiSharePct: number;       // 0 to 100%
  otherSiSharePct: number;     // 0 to 100%
  clientSharePct: number;      // 0 to 100%
  validationSiPct: number;     // 0 to 100% (e.g. 15-20% for IV&V stage-gate)
  notes?: string;
  handshakeComplexity: 'Low' | 'Medium' | 'High';
}

export interface WorkstreamScopeDemarcation {
  workstreamId: string;
  workstreamName: string;
  category: 'Functional' | 'Technical' | 'Data' | 'Testing' | 'Change' | 'Management';
  primaryOwner: DeliveryOwnerParty;
  ourSiSharePct: number;
  otherSiSharePct: number;
  clientSharePct: number;
  validationSiPct: number;
  coordinationBufferHours: number;
  raciMatrix: {
    responsible: DeliveryOwnerParty;
    accountable: DeliveryOwnerParty;
    consulted: DeliveryOwnerParty[];
    informed: DeliveryOwnerParty[];
  };
  notes?: string;
}

export interface MultiVendorSnapshot {
  id: string;
  versionNumber: number;
  name: string;
  timestamp: string;
  author?: string;
  source: 'manual' | 'ai_rfp_extraction' | 'ai_mom_extraction' | 'preset' | 'revert';
  summary: string;
  config: MultiVendorConfig;
}

export interface MultiVendorConfig {
  isEnabled: boolean; // toggle multi-vendor ecosystem mode
  modelType: 'single_vendor' | 'prime_with_bi' | 'tri_party_ivv' | 'client_augmented' | 'design_bi_split' | 'custom_federated';
  parties: MultiVendorPartyConfig[];
  moduleDemarcation: Record<string, ModuleScopeDemarcation>;
  workstreamDemarcation: Record<string, WorkstreamScopeDemarcation>;
  phaseDemarcation?: Record<string, PhaseScopeDemarcation>;
  // Cross-Vendor Coordination & Handshake Settings ("Multi-Vendor Tax")
  handshakeSettings: {
    autoCalculateCoordinationHours: boolean;
    crossVendorFrictionFactor: number; // e.g. 1.05 to 1.25 (5% to 25% overhead on shared handoffs)
    jointSitTriageHours: number;
    jointSteerCoHours: number;
    interfaceAlignmentHoursPerBoundary: number;
    ivvAuditReviewPct: number; // e.g. 10% to 15% effort for validation SI
  };
  // Versioning & Snapshot History
  snapshots?: MultiVendorSnapshot[];
  activeSnapshotId?: string;
  // AI Extraction Metadata
  aiExtractionMeta?: {
    sourceDocumentType?: 'rfp' | 'scopesheet' | 'email' | 'mom' | 'notes';
    documentTitle?: string;
    extractedAt?: string;
    confidenceScore?: number;
    extractedEntitiesCount?: number;
    detectedDemarcations?: Array<{
      area: string;
      assignedParty: DeliveryOwnerParty;
      confidence: 'High' | 'Medium' | 'Low';
      citation: string;
      rationale: string;
    }>;
    rawText?: string;
  };
}

export interface MultiVendorMetrics {
  isEnabled: boolean;
  totalEcosystemHours: number;        // 100% program hours across all vendors
  ourSiBillableHours: number;         // Our SI net direct delivery hours
  ourSiHandshakeOverheadHours: number; // Multi-vendor coordination/friction hours added to our scope
  ourSiTotalDefensibleHours: number;   // ourSiBillableHours + ourSiHandshakeOverheadHours
  otherSiHours: number;               // Hours allocated to Other SI / BI
  clientInternalHours: number;        // Hours absorbed by Client internal team
  validationSiHours: number;          // Hours allocated to Validation SI / IV&V
  ourSiSharePercentage: number;       // e.g. 62.5% of total program
  clientSharePercentage: number;      // e.g. 15.0%
  otherSiSharePercentage: number;     // e.g. 18.5%
  validationSiSharePercentage: number;// e.g. 4.0%
  ourSiCommercials: {
    revenue: number;
    cost: number;
    grossProfit: number;
    grossMarginPct: number;
  };
  handshakeOverheadBreakdown: Array<{
    category: string;
    hours: number;
    rationale: string;
  }>;
  boundaryTouchpoints: Array<{
    sourcePillar: string;
    targetPillar: string;
    ourOwner: string;
    otherOwner: string;
    interfaceFlow: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    coordinationHours: number;
  }>;
  workstreamHoursBreakdown: Array<{
    workstreamId: string;
    workstreamName: string;
    category: string;
    totalHours: number;
    ourSiHours: number;
    otherSiHours: number;
    clientHours: number;
    validationSiHours: number;
    primaryOwner: DeliveryOwnerParty;
  }>;
  phaseHoursBreakdown: Array<{
    phaseId: string;
    phaseName: string;
    code: string;
    startWeek: number;
    endWeek: number;
    totalHours: number;
    ourSiHours: number;
    otherSiHours: number;
    clientHours: number;
    validationSiHours: number;
    primaryOwner: DeliveryOwnerParty;
  }>;
}

// ---------------------------------------------------------------------------
// Listen Podcast & Audio Overview Types
// ---------------------------------------------------------------------------
export type PodcastFocus = 'deep_dive' | 'commercials' | 'architecture' | 'executive';
export type PodcastAccent = 'en-IN' | 'en-US' | 'en-GB' | 'en-AU';

export interface PodcastTurn {
  id: string;
  speaker: 'Alex' | 'Jordan';
  speakerRole: string;
  text: string;
  topicTag?: string;
  timestamp?: string;
  highlight?: boolean;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  subtitle: string;
  focus: PodcastFocus;
  accent?: PodcastAccent;
  createdAt: string;
  scenarioId: string;
  clientName: string;
  durationMinutes: number;
  estimatedSeconds: number;
  summary: string;
  keyTakeaways: string[];
  hosts: {
    host1: { name: string; title: string; avatarColor: string; voiceType: 'female' | 'male' };
    host2: { name: string; title: string; avatarColor: string; voiceType: 'female' | 'male' };
  };
  dialogue: PodcastTurn[];
}

