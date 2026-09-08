import {
  ProjectScenario,
  OracleModule,
  ScaleDrivers,
  QuestionConfidenceMeta,
  ClientIntelData,
  IndustryIntelData,
  SpecSheetIntelData,
  IntelSynthesisResult,
  TechnicalIntegrationItem,
  BlackoutPeriod,
  TechnicalTShirtSize
} from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';
import { MODULE_TOP_20_QUESTIONS, ModuleScopingQuestion } from '../data/moduleScopingQuestions';
import { DEFAULT_TECHNICAL_INTEGRATIONS, calculateIntegrationEffort } from '../data/technicalScopingData';

export interface IntelPackagePreset {
  id: string;
  name: string;
  industry: string;
  tagline: string;
  clientIntel: string;
  industryIntel: string;
  specSheet: string;
}

export interface ComprehensiveIntelParseResult {
  clientIntel: ClientIntelData;
  industryIntel: IndustryIntelData;
  specSheetIntel: SpecSheetIntelData;
  synthesis: IntelSynthesisResult;
  updatedScenarioPayload: {
    name?: string;
    description?: string;
    selectedModules: OracleModule[];
    scaleDrivers: Partial<ScaleDrivers>;
    clientModifiers: Partial<ProjectScenario['clientModifiers']>;
    moduleQuestionAnswers: Record<string, number[]>;
    questionConfidenceMeta: Record<string, Record<number, QuestionConfidenceMeta>>;
    technicalIntegrations: TechnicalIntegrationItem[];
    blackoutPeriods: BlackoutPeriod[];
    deliveryMix?: ProjectScenario['deliveryMix'];
    clientTargetGoLiveDate?: string;
  };
}

export const INTEL_PACKAGE_PRESETS: IntelPackagePreset[] = [
  {
    id: 'preset_auto_mfg',
    name: 'Apex Precision Automotive & Discrete Manufacturing',
    industry: 'Automotive & Industrial Discrete Manufacturing',
    tagline: '14 Legal Entities, 8 Plants, 6 Warehouses, Legacy On-Prem to Oracle Cloud, 36 OIC Integrations',
    clientIntel: `CLIENT INTELLIGENCE DOSSIER:
Company: Apex Precision Manufacturing International
Global Footprint: 14 Legal Entities operating across United States, Mexico, Germany, and China.
Operational Scale: 8 discrete manufacturing plants, 6 3PL distribution warehouses, and 45 corporate bank accounts.
Workforce: 6,800 active employees, 2 union collective bargaining agreements at US plants.
Legacy Landscape: Legacy On-Premises ERP (customized over 18 years), proprietary warehouse legacy, custom shop floor MES.
Pain Points: 
- 18-day financial close cycle due to complex cross-border intercompany tolling and currency recalculations.
- High inventory carrying cost ($42M excess WIP) due to fragmented demand planning across legacy plants.
- Manual paper-based receiving and shopfloor dispatching leading to 3.2% stock discrepancies.
Client Readiness & Governance:
- BPO availability: Client Steering Committee committed to 65% dedicated business process owner allocation.
- IT Maturity: Strong central architecture team; high cloud adoption mindset.
- Target Go-Live: 18 months from kickoff; strictly constrained by Thanksgiving holiday 72-hour cutover window.`,
    industryIntel: `INDUSTRY BENCHMARKS & COMPLIANCE INTEL:
Industry Sector: Automotive OEM Tier-1 & Industrial Discrete Manufacturing
Standard COA Architecture: 8 segments (Entity, Cost Center, Natural Account, Intercompany, Product Line, Plant, Project, Future).
Regulatory Mandates:
- IFRS & US GAAP dual-reporting secondary ledgers for EU and North American statutory compliance.
- USMCA automotive content origin tracking and localized Mexican electronic CFDI 4.0 invoicing.
- German GoBD tax compliance and audit trails.
Supply Chain Characteristics:
- Dual-unit of measure for raw sheet steel and precision stamping components.
- High EDI transaction density (EDI 850 Purchase Orders, EDI 856 Advanced Shipping Notices, EDI 810 Invoices).
- Supplier Portal enablement required for 450 active tier-1 automotive suppliers.
- Strict JIT / KanBan replenishment directly to assembly work stations.`,
    specSheet: `TECHNICAL SPEC SHEET & SCOPE MANIFEST:
Offerings In Scope: Oracle Fusion Cloud ERP (Financials), SCM (Manufacturing & Inventory), HCM (Core HR), and OCI PaaS.
Modules Required:
- Financials: General Ledger (GL), Accounts Payable (AP), Accounts Receivable (AR), Fixed Assets (FA), Cash Management (CM), Procurement Cloud (PO), Fusion Tax (ZX).
- Supply Chain: Order Management (OM), Inventory Management (INV), Manufacturing Discrete (MFG), Maintenance Cloud (MAINT), Supply Chain Planning (PLAN), Warehouse Management (WMS Cloud), Global Order Promising (GOP).
- HCM: Core HR (Global HR), Absence Management.
Scale Parameters:
- Legal Entities: 14 | Ledgers: 4 Primary + 2 Secondary | Banks: 45
- Manufacturing Plants: 8 | Warehouses: 6 | Inventory Orgs: 18
- Total Headcount: 6,800 | Countries: 4 | Unions: 2
Technical Interfaces & Migration:
- 36 Oracle Integration Cloud (OIC) interfaces connecting legacy MES, Shopfloor SCADA, Banks (SWIFT MT940), and EDI Gateways.
- 22 FBDI Data Conversion Entities with 2 years of legacy historical ledger balances and open purchase orders.
- 4 Mock Data Load Cycles (Mock 1 in SIT, Mock 2 in UAT, Mock 3 Performance Load, Mock 4 Cutover Rehearsal).
- 45 Custom BIP / OTBI operational reports and statutory tax documents.
- PaaS Tower: OCI Container Engine, IPSec VPN to on-prem MES, and Segregation of Duties (SOD) matrix.`
  },
  {
    id: 'preset_life_sciences',
    name: 'BioVance Therapeutics (Life Sciences & FDA 21 CFR Part 11)',
    industry: 'Life Sciences, Biotechnology & Pharmaceuticals',
    tagline: 'GAMP 5 Validation, FDA 21 CFR Part 11 Electronic Signatures, Cold-Chain Lot Genealogy, Clinical PPM',
    clientIntel: `CLIENT INTELLIGENCE DOSSIER:
Company: BioVance Global Therapeutics Inc.
Corporate Structure: 6 Legal Entities (US, Ireland, Switzerland, Singapore).
Operational Scale: 2 GMP certified bio-manufacturing cleanrooms, 3 temperature-controlled cold-chain distribution hubs.
Workforce: 2,400 specialized scientific and operational staff across 4 countries.
Legacy Landscape: Legacy Core ERP and stand-alone LIMS / Clinical trial tracking systems.
Pain Points:
- Stringent regulatory validation documentation requirements slowing down ERP releases.
- Cold-chain batch expiration tracking and potency degradation tracking done in error-prone spreadsheets.
- Clinical trial project cost tracking disconnected from general ledger accounting.
Client Readiness:
- BPO availability: High quality-assurance involvement (75% SME dedication).
- Strict change control and computerized system validation (CSV) protocols required at every phase.
- Target Go-Live: 14 months; zero tolerance for production downtime or audit non-compliance.`,
    industryIntel: `INDUSTRY BENCHMARKS & COMPLIANCE INTEL:
Industry Sector: Pharmaceuticals & Bio-Technology
Regulatory Mandates:
- FDA 21 CFR Part 11 Compliance: Electronic signatures, dual-authorization sign-offs, and immutable audit logs.
- GAMP 5 (Good Automated Manufacturing Practice) category 4/5 computerized system validation.
- Serialization and Drug Supply Chain Security Act (DSCSA) track-and-trace compliance.
- Temperature excursion logs and cold-chain quarantine holds.
Chart of Accounts: 7 segments with dedicated clinical trial and NIH grant tracking dimensions.`,
    specSheet: `TECHNICAL SPEC SHEET & SCOPE MANIFEST:
Offerings In Scope: Oracle Fusion Cloud ERP, SCM (Process Mfg & Cold-Chain), Project Portfolio Management (PPM).
Modules Required:
- Financials: GL, AP, AR, Fixed Assets, Cash Management, Procurement, PPM (Project Costing & Billing), Fusion Tax.
- SCM: Inventory Management, Process Manufacturing (MFG), Supply Chain Planning, Quality Management, Order Management.
- HCM: Core HR.
Scale Parameters:
- Legal Entities: 6 | Ledgers: 4 | Bank Accounts: 18
- Manufacturing Cleanrooms: 2 | Cold-Chain Hubs: 3 | Inventory Orgs: 8
- Headcount: 2,400 | Countries: 4 | Unions: 0
Technical Interfaces & Migration:
- 18 OIC Integrations (LIMS, TrackWise QMS, Electronic Batch Record MES, Bank SWIFT).
- 16 FBDI Conversion Entities with 3 years of lot genealogy records and active stability testing data.
- 3 Mock Conversion cycles with 100% IQ/OQ/PQ validation script execution.
- 30 BIP FDA compliant certificate of analysis (CoA) templates and electronic batch summary reports.`
  },
  {
    id: 'preset_healthcare',
    name: 'WellCare Regional Health System (Healthcare & Multi-Union HCM)',
    industry: 'Healthcare, Hospital Systems & Union Workforce',
    tagline: '18,500 Workers, 12 Acute Hospitals, 5 Union CBAs, Bi-Weekly Payroll, Time Punch Ingestion',
    clientIntel: `CLIENT INTELLIGENCE DOSSIER:
Company: WellCare Health Network
Operating Model: 12 acute care hospitals and 45 outpatient clinics across 3 states (6 Operating Entities).
Workforce: 18,500 active healthcare workers, clinical faculty, nurses, physicians, and per-diem contractors.
Labor Relations: 5 Collective Bargaining Agreements (Unions) with complex shift differential, weekend premium, and mandatory overtime rules.
Legacy Systems: Legacy Healthcare ERP, Electronic Timekeeping, legacy homegrown credentialing system.
Pain Points:
- High nurse turnover and manual recruitment pipeline causing $14M in annual agency staffing surge costs.
- Frequent retroactive payroll recalculations due to complex union shift differentials.
- Surgical supply replenishment stockouts in operating room suites.
Client Readiness:
- BPO availability: 50% part-time SME capacity due to in-flight clinical operations.
- Strong union steward oversight requiring parallel payroll run precision of 99.98%.
- Target Go-Live: 16 months with 2 parallel payroll testing runs.`,
    industryIntel: `INDUSTRY BENCHMARKS & COMPLIANCE INTEL:
Industry Sector: Healthcare Systems & Hospital Networks
Regulatory Mandates:
- HIPAA privacy regulations and strict role-based data masking on patient and staff records.
- Joint Commission hospital accreditation standards.
- Multi-state certified payroll tax reporting and union pension contribution remittances.
- Medical supply 3-way matching with GS1 barcode standards and FDA UDI implantable device tracking.`,
    specSheet: `TECHNICAL SPEC SHEET & SCOPE MANIFEST:
Offerings In Scope: Oracle Fusion Cloud HCM, Global Payroll, Financials Cloud, Procurement Cloud.
Modules Required:
- HCM: Core HR, Global Payroll (US), Time & Labor (OTL), Absence Management, Oracle Recruiting Cloud (ORC), Benefits Cloud, Talent Management.
- Financials: General Ledger, Accounts Payable, Cash Management, Fixed Assets, Procurement Cloud (Self-Service & PunchOut).
Scale Parameters:
- Operating Entities: 6 | Bank Accounts: 28 | Ledgers: 2
- Hospitals: 12 | Outpatient Clinics: 45 | Inventory Orgs: 14
- Total Headcount: 18,500 | Union Groups: 5 | Countries: 1
Technical Interfaces & Migration:
- 24 OIC Integrations (Badge clock terminals, EHR hospital billing feeds, Benefits EDI 834 carrier feeds, background screening).
- 20 Data Conversion Entities (18,500 active workers, 3 years of gross-to-net payroll tax balances, 12,000 open surgical POs).
- 4 Mock Data Load Cycles including 2 live parallel payroll comparison cycles.
- 55 Custom Reports (Joint Commission audit logs, nursing credential expiration notices, departmental overtime utilization dashboards).`
  },
  {
    id: 'preset_retail',
    name: 'Luxe Retail Brands Worldwide (Omnichannel Retail & E-Commerce)',
    industry: 'Retail, Omnichannel Consumer Goods & E-Commerce',
    tagline: '120 Boutique Stores, E-Commerce, FCCS/EPBCS EPM, ASC 606 Revenue Management, Q4 Freeze',
    clientIntel: `CLIENT INTELLIGENCE DOSSIER:
Company: Luxe Retail Brands International
Operating Scale: 120 boutique retail locations in North America & Europe, high-volume digital e-commerce web stores.
Transaction Volume: 4.5 Million annual customer sales receipts; $650M annual revenue.
Legacy Landscape: Legacy Distributed Retail ERP, custom POS in retail stores, multiple online digital store instances.
Pain Points:
- Inventory visibility lag of 48 hours between retail stores and e-commerce fulfillment hubs causing customer cancellations.
- Laborious monthly financial consolidation across 22 multi-currency retail subsidiaries.
- Customer loyalty point and gift card revenue recognition reconciliation takes 12 business days.
Client Governance & Blackout:
- STRICT Q4 BLACKOUT: Absolute development and deployment freeze between October 15 and January 10 (Holiday shopping peak).
- Target Go-Live: Spring cutover window (April 1).`,
    industryIntel: `INDUSTRY BENCHMARKS & COMPLIANCE INTEL:
Industry Sector: Retail & Omnichannel Consumer Products
Regulatory & Accounting Mandates:
- ASC 606 / IFRS 15 Multi-Element Revenue Recognition for gift cards, return reserves, and loyalty points.
- PCI-DSS Level 1 compliance for credit card tokenization and POS gateway reconciliation.
- Multi-currency retail pricing and VAT/sales tax automation across 12 European countries.`,
    specSheet: `TECHNICAL SPEC SHEET & SCOPE MANIFEST:
Offerings In Scope: Oracle Fusion Cloud Financials, Enterprise Performance Management (EPM), SCM (Inventory & OM).
Modules Required:
- Financials: General Ledger, Accounts Payable, Accounts Receivable, Cash Management, Fixed Assets, Fusion Tax.
- EPM: Financial Consolidation & Close (FCCS), Enterprise Planning & Budgeting (EPBCS), Enterprise Data Management (EDM).
- SCM: Inventory Management, Order Management, Global Order Promising (GOP).
Scale Parameters:
- Legal Entities: 22 | Ledgers: 6 | Bank Accounts: 65 | Currencies: 8
- Retail Stores: 120 | Fulfillment Warehouses: 4 | Inventory Orgs: 26
- Headcount: 4,200 | Countries: 12 | Unions: 0
Technical Interfaces & Migration:
- 28 OIC Integrations (E-Commerce webhook listener, POS transaction polling, payment merchant settlement, 3PL logistics).
- 18 Data Conversion Objects with 1 year of historical net trial balances and active gift card liability records.
- 3 Mock Conversion Cycles.
- 40 Reports (Daily store sales flash reports, merchandise inventory turn analysis, ASC 606 waterfall schedules).`
  }
];

export function parseComprehensiveIntel(
  clientText: string,
  industryText: string,
  specText: string
): ComprehensiveIntelParseResult {
  const combined = `${clientText}\n\n${industryText}\n\n${specText}`;
  const lower = combined.toLowerCase();

  // 1. Inferred Modules (Offerings SCM, ERP, HCM, EPM, CX)
  const inferredModules: OracleModule[] = [];

  // ERP
  if (lower.includes('general ledger') || lower.includes('chart of account') || lower.includes('gl') || lower.includes('financial') || lower.includes('journal')) inferredModules.push('erp_gl');
  if (lower.includes('accounts payable') || lower.includes('invoice') || lower.includes('ap') || lower.includes('payment') || lower.includes('3-way match')) inferredModules.push('erp_ap');
  if (lower.includes('accounts receivable') || lower.includes('billing') || lower.includes('ar') || lower.includes('receipt') || lower.includes('collection')) inferredModules.push('erp_ar');
  if (lower.includes('fixed asset') || lower.includes('depreciation') || lower.includes('fa') || lower.includes('asset book')) inferredModules.push('erp_fa');
  if (lower.includes('cash management') || lower.includes('bank rec') || lower.includes('treasury') || lower.includes('swift') || lower.includes('cm')) inferredModules.push('erp_cm');
  if (lower.includes('procurement') || lower.includes('purchase order') || lower.includes('supplier portal') || lower.includes('sourcing') || lower.includes('punchout')) inferredModules.push('erp_proc');
  if (lower.includes('tax engine') || lower.includes('statutory tax') || lower.includes('vertex') || lower.includes('avalara') || lower.includes('zx')) inferredModules.push('erp_tax');
  if (lower.includes('project financial') || lower.includes('ppm') || lower.includes('project costing') || lower.includes('project billing') || lower.includes('clinical trial')) inferredModules.push('erp_ppm');

  // SCM
  if (lower.includes('inventory') || lower.includes('warehouse') || lower.includes('inv org') || lower.includes('stock') || lower.includes('sub-inventories')) inferredModules.push('scm_inv');
  if (lower.includes('order management') || lower.includes('sales order') || lower.includes('om') || lower.includes('drop-ship') || lower.includes('fulfillment')) inferredModules.push('scm_om');
  if (lower.includes('manufacturing') || lower.includes('discrete') || lower.includes('process mfg') || lower.includes('work order') || lower.includes('cleanroom')) inferredModules.push('scm_mfg');
  if (lower.includes('maintenance') || lower.includes('plant maintenance') || lower.includes('work center') || lower.includes('eam')) inferredModules.push('scm_maint');
  if (lower.includes('supply chain planning') || lower.includes('demand plan') || lower.includes('mrp') || lower.includes('replenishment') || lower.includes('s&op')) inferredModules.push('scm_plan');
  if (lower.includes('wms') || lower.includes('advanced warehouse') || lower.includes('rf mobile') || lower.includes('barcode') || lower.includes('logfire')) inferredModules.push('scm_wms');
  if (lower.includes('global order promising') || lower.includes('gop') || lower.includes('atp')) inferredModules.push('scm_gop');

  // HCM
  if (lower.includes('human capital') || lower.includes('hcm') || lower.includes('core hr') || lower.includes('global hr') || lower.includes('employee record')) inferredModules.push('hcm_core');
  if (lower.includes('payroll') || lower.includes('bi-weekly') || lower.includes('wage') || lower.includes('tax withholding') || lower.includes('w-2')) inferredModules.push('hcm_payroll');
  if (lower.includes('time & labor') || lower.includes('time card') || lower.includes('punch') || lower.includes('kronos') || lower.includes('otl')) inferredModules.push('hcm_time');
  if (lower.includes('absence') || lower.includes('pto') || lower.includes('sick leave') || lower.includes('vacation')) inferredModules.push('hcm_absence');
  if (lower.includes('recruiting') || lower.includes('orc') || lower.includes('applicant') || lower.includes('requisition')) inferredModules.push('hcm_orc');
  if (lower.includes('benefits') || lower.includes('open enrollment') || lower.includes('hsa') || lower.includes('fsa') || lower.includes('edi 834')) inferredModules.push('hcm_benefits');
  if (lower.includes('talent') || lower.includes('performance review') || lower.includes('succession')) inferredModules.push('hcm_talent');

  // EPM & CX
  if (lower.includes('fccs') || lower.includes('financial consolidation') || lower.includes('statutory consolidation') || lower.includes('elimination')) inferredModules.push('epm_fccs');
  if (lower.includes('epbcs') || lower.includes('planning & budgeting') || lower.includes('financial planning')) inferredModules.push('epm_epbcs');
  if (lower.includes('edm') || lower.includes('enterprise data management') || lower.includes('coa governance')) inferredModules.push('epm_edm');
  if (lower.includes('cx service') || lower.includes('b2b service') || lower.includes('helpdesk')) inferredModules.push('cx_service');
  if (lower.includes('cpq') || lower.includes('configure price quote') || lower.includes('quote to cash')) inferredModules.push('cx_cpq');

  // Fallback defaults if none detected
  if (inferredModules.length === 0) {
    inferredModules.push('erp_gl', 'erp_ap', 'erp_ar', 'erp_cm', 'erp_proc', 'scm_inv', 'hcm_core');
  }

  // 2. Extract Physical Scale Drivers
  const scaleDrivers: Partial<ScaleDrivers> = {};

  const entMatch = combined.match(/(\d+)\s*(?:legal\s*entities|operating\s*entities|entities|companies|subsidiaries)/i);
  if (entMatch) scaleDrivers.fin_ent = parseInt(entMatch[1], 10);

  const ledgersMatch = combined.match(/(\d+)\s*(?:primary\s*ledgers|ledgers|currency\s*ledgers)/i);
  if (ledgersMatch) scaleDrivers.fin_led = parseInt(ledgersMatch[1], 10);

  const curMatch = combined.match(/(\d+)\s*(?:currencies|currency\s*types)/i);
  if (curMatch) scaleDrivers.fin_cur = parseInt(curMatch[1], 10);

  const plantsMatch = combined.match(/(\d+)\s*(?:discrete\s*manufacturing\s*plants|manufacturing\s*plants|plants|factories|cleanrooms|facilities)/i);
  if (plantsMatch) scaleDrivers.scm_plants = parseInt(plantsMatch[1], 10);

  const whMatch = combined.match(/(\d+)\s*(?:distribution\s*warehouses|warehouses|3pl\s*hubs|hubs|distribution\s*centers)/i);
  if (whMatch) scaleDrivers.scm_wh = parseInt(whMatch[1], 10);

  const invOrgsMatch = combined.match(/(\d+)\s*(?:inventory\s*orgs|inv\s*orgs|stocking\s*locations)/i);
  if (invOrgsMatch) scaleDrivers.scm_inv = parseInt(invOrgsMatch[1], 10);

  const hcMatch = combined.match(/(\d[\d,]*)\s*(?:employees|workers|headcount|professionals|staff)/i);
  if (hcMatch) scaleDrivers.hcm_hc = parseInt(hcMatch[1].replace(/,/g, ''), 10);

  const countriesMatch = combined.match(/(\d+)\s*(?:countries|geographies|regions|operating\s*countries)/i);
  if (countriesMatch) scaleDrivers.hcm_pay_countries = parseInt(countriesMatch[1], 10);

  const unionMatch = combined.match(/(\d+)\s*(?:collective\s*bargaining|unions|bargaining\s*agreements|cba[s]?)/i);
  if (unionMatch) scaleDrivers.hcm_union_groups = parseInt(unionMatch[1], 10);

  // --- RICEFW Scope Regex Expansion ---
  // Integrations (OIC / APIs / Interfaces)
  const oicMatch = combined.match(/(\d+)\s*(?:oic(?:\s*integrations?)?|integrations?|interfaces?|api\s*flows?|middleware\s*flows?|integration\s*flows?)/i);
  if (oicMatch) scaleDrivers.tech_oic = parseInt(oicMatch[1], 10);

  // Data Conversion Objects (FBDI / HDL)
  const dataObjMatch = combined.match(/(\d+)\s*(?:fbdi|data\s*objects?|conversion\s*entities|entities\s*to\s*migrate|conversion\s*objects?|migration\s*objects?)/i);
  if (dataObjMatch) scaleDrivers.tech_data_objects = parseInt(dataObjMatch[1], 10);

  // Mock Cycles
  const mockCycleMatch = combined.match(/(\d+)\s*(?:mock(?:\s*data)?\s*(?:load|conversion)?\s*cycles?|rehearsals?|conversion\s*cycles?|load\s*cycles?)/i);
  if (mockCycleMatch) scaleDrivers.tech_conversion_cycles = parseInt(mockCycleMatch[1], 10);

  // Historical Years
  const histYearsMatch = combined.match(/(\d+)\s*(?:years?\s*(?:of\s*)?(?:legacy\s*)?(?:historical|history|data|records))/i);
  if (histYearsMatch) scaleDrivers.tech_historical_years = parseInt(histYearsMatch[1], 10);

  // Reports (BIP & OTBI)
  const reportsMatch = combined.match(/(\d+)\s*(?:custom\s*reports?|bip\s*reports?|otbi\s*reports?|analytics\s*reports?|reports?\s*(?:and|&)\s*dashboards?|reports?)/i);
  if (reportsMatch) {
    const rCount = parseInt(reportsMatch[1], 10);
    scaleDrivers.tech_reports_bip = Math.round(rCount * 0.6);
    scaleDrivers.tech_reports_otbi = Math.round(rCount * 0.4);
  }
  const bipMatch = combined.match(/(\d+)\s*(?:bip|bi\s*publisher|pixel\s*perfect)\s*reports?/i);
  if (bipMatch) scaleDrivers.tech_reports_bip = parseInt(bipMatch[1], 10);
  const otbiMatch = combined.match(/(\d+)\s*(?:otbi|analytics|subject\s*area)\s*reports?/i);
  if (otbiMatch) scaleDrivers.tech_reports_otbi = parseInt(otbiMatch[1], 10);

  // Extensions / PaaS
  const paasMatch = combined.match(/(\d+)\s*(?:paas\s*extensions?|vbcs\s*apps?|custom\s*applications?|extensions?)/i);
  if (paasMatch) scaleDrivers.tech_paas = parseInt(paasMatch[1], 10);

  // Workflows (BPM)
  const workflowMatch = combined.match(/(\d+)\s*(?:approval\s*workflows?|bpm\s*workflows?|custom\s*workflows?|workflows?)/i);
  if (workflowMatch) scaleDrivers.tech_workflows = parseInt(workflowMatch[1], 10);

  // Fast Formulas
  const ffMatch = combined.match(/(\d+)\s*(?:fast\s*formulas?|payroll\s*formulas?|custom\s*formulas?)/i);
  if (ffMatch) scaleDrivers.tech_fast_formulas = parseInt(ffMatch[1], 10);

  // Security Roles
  const secMatch = combined.match(/(\d+)\s*(?:custom\s*security\s*roles?|job\s*roles?|duty\s*roles?|security\s*roles?)/i);
  if (secMatch) scaleDrivers.tech_security_roles = parseInt(secMatch[1], 10);

  // 3. Extract Client Modifiers
  const clientModifiers: Partial<ProjectScenario['clientModifiers']> = {};

  if (lower.includes('65% dedicated') || lower.includes('dedicated bpo') || lower.includes('full-time')) {
    clientModifiers.smeAvailability = 0.90; // High availability
  } else if (lower.includes('50% part-time') || lower.includes('constrained')) {
    clientModifiers.smeAvailability = 1.15; // Resource constraint penalty
  }

  if (lower.includes('18 years') || lower.includes('high data debt') || lower.includes('legacy sap ecc') || lower.includes('as400')) {
    clientModifiers.dataDebt = 1.20;
  } else if (lower.includes('clean legacy') || lower.includes('standardized')) {
    clientModifiers.dataDebt = 0.95;
  }

  if (lower.includes('high cloud adoption') || lower.includes('modern best practice') || lower.includes('standard mbp')) {
    clientModifiers.cloudMindset = 0.90;
  } else if (lower.includes('heavy customization') || lower.includes('replicate legacy')) {
    clientModifiers.cloudMindset = 1.25;
  }

  if (lower.includes('fda 21 cfr') || lower.includes('gamp 5') || lower.includes('ifrs') || lower.includes('usmca') || lower.includes('hipaa')) {
    clientModifiers.regulatoryCompliance = 1.25;
  }

  // 4. Extract Blackout Windows
  const blackoutPeriods: BlackoutPeriod[] = [];
  if (lower.includes('thanksgiving') || lower.includes('holiday')) {
    blackoutPeriods.push({
      id: `blk_${Date.now()}_1`,
      name: 'Holiday Freeze Window',
      type: 'peak_trading',
      startDate: '2026-11-20',
      endDate: '2026-11-30',
      severity: 'hard_freeze',
      impact: 'Strict manufacturing / retail cutover freeze during holiday peak volume.'
    });
  }
  if (lower.includes('october 15') || lower.includes('q4 blackout') || lower.includes('peak season')) {
    blackoutPeriods.push({
      id: `blk_${Date.now()}_2`,
      name: 'Retail Q4 Peak Season Freeze',
      type: 'peak_trading',
      startDate: '2026-10-15',
      endDate: '2027-01-10',
      severity: 'hard_freeze',
      impact: 'No core ERP/SCM production deployments during highest sales peak.'
    });
  }

  // 5. Generate Dynamic Technical Integrations Catalog
  const technicalIntegrations: TechnicalIntegrationItem[] = [];
  let intIdCounter = 1;

  if (lower.includes('mes') || lower.includes('siemens') || lower.includes('shop floor') || lower.includes('scada')) {
    const qAnswers = { patternDirection: 2, mappingComplexity: 2, connectivityProtocol: 2, dataVolume: 3, errorHandling: 2, apiReadiness: 1 };
    const effort = calculateIntegrationEffort(qAnswers, 'bidirectional_sync');
    technicalIntegrations.push({
      id: `int_auto_${intIdCounter}`,
      code: `INT-${String(intIdCounter++).padStart(2, '0')}`,
      name: 'Shopfloor MES / SCADA Work Order & Completion Sync',
      pillar: 'SCM',
      type: 'bidirectional_sync',
      sourceSystem: 'Siemens Opcenter / Legacy MES',
      targetSystem: 'Oracle Fusion Cloud Manufacturing & Inventory',
      complexity: effort.complexity,
      isQuestionDriven: true,
      questionAnswers: qAnswers,
      baseHours: 45,
      calculatedHours: effort.calculatedHours,
      calculationFormula: effort.calculationFormula,
      compositeScore: effort.compositeScore,
      rationale: 'Real-time MES shop floor execution with custom payload mapping.'
    });
  }

  if (lower.includes('swift') || lower.includes('mt940') || lower.includes('bank') || lower.includes('treasury')) {
    const qAnswers = { patternDirection: 2, mappingComplexity: 1, connectivityProtocol: 2, dataVolume: 1, errorHandling: 1, apiReadiness: 0 };
    const effort = calculateIntegrationEffort(qAnswers, 'bidirectional_sync');
    technicalIntegrations.push({
      id: `int_auto_${intIdCounter}`,
      code: `INT-${String(intIdCounter++).padStart(2, '0')}`,
      name: 'Global Bank SWIFT MT940 / CAMT.053 Statement & Payment Connector',
      pillar: 'ERP',
      type: 'bidirectional_sync',
      sourceSystem: 'Global Cash Management Host (SWIFT / JPM / Citi)',
      targetSystem: 'Oracle Cash Management & AP Payments',
      complexity: effort.complexity,
      isQuestionDriven: true,
      questionAnswers: qAnswers,
      baseHours: 45,
      calculatedHours: effort.calculatedHours,
      calculationFormula: effort.calculationFormula,
      compositeScore: effort.compositeScore,
      rationale: 'Daily MT940 bank statement ingestion and ISO 20022 payment files.'
    });
  }

  if (lower.includes('edi') || lower.includes('850') || lower.includes('856') || lower.includes('supplier portal')) {
    const qAnswers = { patternDirection: 2, mappingComplexity: 2, connectivityProtocol: 2, dataVolume: 2, errorHandling: 2, apiReadiness: 1 };
    const effort = calculateIntegrationEffort(qAnswers, 'bidirectional_sync');
    technicalIntegrations.push({
      id: `int_auto_${intIdCounter}`,
      code: `INT-${String(intIdCounter++).padStart(2, '0')}`,
      name: 'B2B EDI Gateway (EDI 850 PO, 856 ASN, 810 Invoice)',
      pillar: 'SCM',
      type: 'bidirectional_sync',
      sourceSystem: 'OpenText / Sterling EDI Gateway',
      targetSystem: 'Oracle Order Management & Procurement',
      complexity: effort.complexity,
      isQuestionDriven: true,
      questionAnswers: qAnswers,
      baseHours: 45,
      calculatedHours: effort.calculatedHours,
      calculationFormula: effort.calculationFormula,
      compositeScore: effort.compositeScore,
      rationale: 'B2B supply chain EDI transaction processing and ASN dispatch.'
    });
  }

  if (lower.includes('badge') || lower.includes('time & labor') || lower.includes('timekeeping')) {
    const qAnswers = { patternDirection: 0, mappingComplexity: 1, connectivityProtocol: 1, dataVolume: 2, errorHandling: 1, apiReadiness: 0 };
    const effort = calculateIntegrationEffort(qAnswers, 'inbound_rest');
    technicalIntegrations.push({
      id: `int_auto_${intIdCounter}`,
      code: `INT-${String(intIdCounter++).padStart(2, '0')}`,
      name: 'Time Badge Terminal Punch & Shift Differential Ingestion',
      pillar: 'HCM',
      type: 'inbound_rest',
      sourceSystem: 'Electronic Time & Clock Terminals',
      targetSystem: 'Oracle Time & Labor (OTL) / Payroll',
      complexity: effort.complexity,
      isQuestionDriven: true,
      questionAnswers: qAnswers,
      baseHours: 45,
      calculatedHours: effort.calculatedHours,
      calculationFormula: effort.calculationFormula,
      compositeScore: effort.compositeScore,
      rationale: 'Shift differential and timecard punch batch ingestion for payroll.'
    });
  }

  if (lower.includes('e-commerce') || lower.includes('pos') || lower.includes('sales receipt')) {
    const qAnswers = { patternDirection: 0, mappingComplexity: 1, connectivityProtocol: 1, dataVolume: 3, errorHandling: 1, apiReadiness: 0 };
    const effort = calculateIntegrationEffort(qAnswers, 'inbound_rest');
    technicalIntegrations.push({
      id: `int_auto_${intIdCounter}`,
      code: `INT-${String(intIdCounter++).padStart(2, '0')}`,
      name: 'Shopify Plus / POS High-Volume Sales Order & Cash Settlement Feed',
      pillar: 'SCM',
      type: 'inbound_rest',
      sourceSystem: 'Shopify Plus / Retail POS Terminals',
      targetSystem: 'Oracle Receivables & Order Orchestration',
      complexity: effort.complexity,
      isQuestionDriven: true,
      questionAnswers: qAnswers,
      baseHours: 45,
      calculatedHours: effort.calculatedHours,
      calculationFormula: effort.calculationFormula,
      compositeScore: effort.compositeScore,
      rationale: 'High-volume e-commerce order webhooks and daily retail cash settlement.'
    });
  }

  // Fallback defaults if none detected
  if (technicalIntegrations.length === 0) {
    technicalIntegrations.push(...DEFAULT_TECHNICAL_INTEGRATIONS.slice(0, 5));
  }

  // 6. Question Answering & Confidence Derivation (Module Top 20 Qs)
  const questionAnswers: Record<string, number[]> = {};
  const questionConfidenceMeta: Record<string, Record<number, QuestionConfidenceMeta>> = {};
  const highPriorityClarifications: string[] = [];

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let totalScopedCount = 0;
  let totalScoreSum = 0;

  inferredModules.forEach(modId => {
    const qList = MODULE_TOP_20_QUESTIONS[modId] || [];
    const answersArr: number[] = [];
    const metaMap: Record<number, QuestionConfidenceMeta> = {};

    qList.forEach((q, qIdx) => {
      totalScopedCount++;
      const inference = evaluateQuestionWithIntel(q, combined, modId);
      answersArr.push(inference.optIdx);
      metaMap[qIdx] = {
        confidence: inference.confidence,
        percentage: inference.percentage,
        source: inference.confidence === 'high' || inference.confidence === 'medium' ? 'ai_proposal' : 'default_benchmark',
        proposalCitation: inference.citation,
        clientClarificationNeeded: inference.clarificationNeeded,
        clientNotes: inference.notes
      };

      totalScoreSum += inference.percentage;

      if (inference.confidence === 'high') highCount++;
      else if (inference.confidence === 'medium') mediumCount++;
      else {
        lowCount++;
        if (inference.clarificationNeeded) {
          const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
          highPriorityClarifications.push(`[${modDef?.name || modId}] Q${qIdx + 1}: ${q.question} — ${inference.notes || 'Ambiguous or unstated in intel.'}`);
        }
      }
    });

    questionAnswers[modId] = answersArr;
    questionConfidenceMeta[modId] = metaMap;
  });

  const overallScore = totalScopedCount > 0 ? Math.round(totalScoreSum / totalScopedCount) : 80;

  // 7. Structured Intel & Synthesis
  const clientIntelData: ClientIntelData = {
    clientName: extractCompanyName(clientText) || 'Enterprise Client',
    industrySector: extractSectorName(industryText || combined) || 'Enterprise Services',
    annualRevenue: extractRevenue(clientText),
    totalHeadcount: scaleDrivers.hcm_hc || 5000,
    operatingRegions: ['North America', 'EMEA', 'APAC'],
    legacyLandscape: extractLegacySystems(clientText),
    keyPainPoints: extractBulletPoints(clientText, 'pain points'),
    bpoAvailabilityRating: clientModifiers.smeAvailability && clientModifiers.smeAvailability < 1.0 ? 4 : 2,
    changeReadinessScore: clientModifiers.cloudMindset && clientModifiers.cloudMindset < 1.0 ? 4 : 2,
    targetGoLiveDate: '2027-10-01',
    blackoutWindows: blackoutPeriods.map(b => `${b.name} (${b.startDate} to ${b.endDate})`),
    rawText: clientText,
    lastUpdated: new Date().toISOString()
  };

  const industryIntelData: IndustryIntelData = {
    sector: clientIntelData.industrySector || 'Industrial Manufacturing',
    regulatoryMandates: extractBulletPoints(industryText, 'regulatory') || ['IFRS / US GAAP', 'SOX 404 Internal Controls'],
    standardCoaSegments: 8,
    averagePlantDensity: scaleDrivers.scm_plants ? `${scaleDrivers.scm_plants} Sites` : 'Medium Density',
    integrationDensityRating: (scaleDrivers.tech_oic || 0) > 30 ? 'Very High' : (scaleDrivers.tech_oic || 0) > 15 ? 'High' : 'Medium',
    complianceDrivers: ['Multi-currency statutory ledgers', 'Electronic invoice tax filing', 'Data sovereignty & audit trails'],
    industryBenchmarkNotes: ['Standard modern best practice templates applied', 'Sliding scale 4-tier mock data migration enabled'],
    rawText: industryText,
    lastUpdated: new Date().toISOString()
  };

  const specSheetIntelData: SpecSheetIntelData = {
    offeringsDetected: Array.from(new Set(inferredModules.map(m => ORACLE_MODULE_CATALOG.find(cat => cat.id === m)?.pillar || 'ERP'))),
    modulesDetected: inferredModules,
    scaleDriversDetected: scaleDrivers,
    integrationCount: scaleDrivers.tech_oic || technicalIntegrations.length,
    conversionObjectsCount: scaleDrivers.tech_data_objects || 18,
    conversionMockCycles: scaleDrivers.tech_conversion_cycles || 3,
    customReportsCount: ((scaleDrivers.tech_reports_bip || 20) + (scaleDrivers.tech_reports_otbi || 15)),
    paasRequirements: ['OCI Container Engine', 'Segregation of Duties (SOD) Matrix', 'FastConnect IPSec VPN'],
    rawText: specText,
    lastUpdated: new Date().toISOString()
  };

  // Pros, Cons, and Risk Matrix Synthesis
  const pros: string[] = [
    `Comprehensive scope covering ${inferredModules.length} Oracle Cloud modules across ${specSheetIntelData.offeringsDetected.join(', ')}.`,
    `Standardized integration architecture scoped with ${technicalIntegrations.length} key middleware interfaces on Oracle Integration Cloud (OIC).`,
    `Multi-tier 4-cycle mock conversion approach with calibrated sliding scale multipliers for data cleansing and cutover rehearsals.`,
    `Strong governance alignment with dedicated steering committee and business process owner involvement.`
  ];

  const cons: string[] = [
    `High legacy custom code and data debt in source systems requiring intensive pre-migration profiling.`,
    `Tight cutover window constraints requiring strict rehearsals during Mock 3 and Mock 4 dry-runs.`,
    `Complex multi-currency and multi-GAAP secondary ledger requirements requiring automated daily rate feeds.`
  ];

  const riskFactors = [
    {
      risk: 'Legacy Data Debt & Cleansing Volatility',
      severity: (clientModifiers.dataDebt || 1) > 1.1 ? 'High' as const : 'Medium' as const,
      mitigation: 'Enforce TBD 4-tier mock conversion sliding scale with early extraction profiling in Mock 1 (100% effort).'
    },
    {
      risk: 'Third-Party API & Shopfloor Connectivity',
      severity: 'Medium' as const,
      mitigation: 'Implement OIC standard retry hospital queues and pre-packaged Oracle Integration recipes.'
    },
    {
      risk: 'Peak Season / Holiday Cutover Freeze',
      severity: blackoutPeriods.length > 0 ? 'High' as const : 'Low' as const,
      mitigation: 'Align master Gantt schedule milestones around blackout dates with mandatory 4-week hypercare buffer.'
    }
  ];

  const synthesis: IntelSynthesisResult = {
    clientSummary: `Synthesized intel for ${clientIntelData.clientName} operating ${scaleDrivers.fin_ent || 6} legal entities and ${scaleDrivers.hcm_hc || 4000} employees.`,
    industryContext: `Configured for ${industryIntelData.sector} with strict compliance rules and modern best practice alignment.`,
    scopeSummary: `Active footprint spans ${inferredModules.length} modules, ${scaleDrivers.tech_oic || 20} OIC interfaces, and ${scaleDrivers.tech_data_objects || 16} conversion entities across ${scaleDrivers.tech_conversion_cycles || 3} mock cycles.`,
    pros,
    cons,
    riskFactors,
    highPriorityClarifications: highPriorityClarifications.slice(0, 8),
    confidenceSummary: {
      overallScore,
      highConfidenceCount: highCount,
      mediumConfidenceCount: mediumCount,
      lowConfidenceCount: lowCount,
      clarificationsRequiredCount: highPriorityClarifications.length
    },
    fieldUpdatesApplied: [
      'Project Title & Scope Description',
      `Offerings & In-Scope Modules (${inferredModules.length} detected)`,
      'Physical Scale Drivers (Entities, Plants, Headcount, Ledgers, Orgs)',
      'Client Operational & Cultural Modifiers (Data Debt, SME Availability)',
      'Top 20 Scoping Questions per Module with Evidence Citations',
      'Technical Integrations Catalog with Protocols & Complexity Tiers',
      'Data Conversion Mock Cycles & Historical Depth',
      'Project Blackout Periods & Deployment Freeze Windows'
    ]
  };

  return {
    clientIntel: clientIntelData,
    industryIntel: industryIntelData,
    specSheetIntel: specSheetIntelData,
    synthesis,
    updatedScenarioPayload: {
      name: `${clientIntelData.clientName} Oracle Cloud Transformation`,
      description: `${industryIntelData.sector} transformation across ${scaleDrivers.fin_ent || 8} Legal Entities, ${inferredModules.length} Oracle Fusion Cloud modules, and ${scaleDrivers.tech_oic || 24} OIC integrations.`,
      selectedModules: inferredModules,
      scaleDrivers,
      clientModifiers,
      moduleQuestionAnswers: questionAnswers,
      questionConfidenceMeta,
      technicalIntegrations,
      blackoutPeriods,
      clientTargetGoLiveDate: '2027-10-01'
    }
  };
}

// Helpers for intelligent text pattern extraction
function extractCompanyName(text: string): string {
  const match = text.match(/(?:Company|Client|Organization|Enterprise|Network):\s*([^\n\r,]+)/i);
  return match ? match[1].trim() : 'Enterprise Client';
}

function extractSectorName(text: string): string {
  const match = text.match(/(?:Industry|Sector|Domain):\s*([^\n\r,]+)/i);
  return match ? match[1].trim() : 'Industrial Manufacturing';
}

function extractRevenue(text: string): string {
  const match = text.match(/(\$[\d,.]+\s*(?:Million|Billion|M|B))/i);
  return match ? match[1] : '$750 Million';
}

function extractLegacySystems(text: string): string[] {
  const systems: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes('on-prem') || lower.includes('custom z-table') || lower.includes('mainframe')) systems.push('Legacy Core ERP');
  if (lower.includes('warehouse') || lower.includes('wms')) systems.push('Legacy Warehouse System');
  if (lower.includes('timekeeping') || lower.includes('badge')) systems.push('Legacy Time & Attendance');
  if (lower.includes('healthcare') || lower.includes('clinical')) systems.push('Legacy Healthcare Financials');
  if (lower.includes('pos') || lower.includes('retail')) systems.push('Legacy Retail POS');
  if (lower.includes('digital') || lower.includes('e-commerce')) systems.push('E-Commerce Order Hub');
  if (lower.includes('mes') || lower.includes('shop floor')) systems.push('Shop Floor MES');
  return systems.length > 0 ? systems : ['Legacy Core ERP'];
}

function extractBulletPoints(text: string, sectionKeyword: string): string[] {
  const lines = text.split('\n');
  const results: string[] = [];
  let capture = false;

  for (const line of lines) {
    if (line.toLowerCase().includes(sectionKeyword.toLowerCase())) {
      capture = true;
      continue;
    }
    if (capture) {
      if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*')) {
        results.push(line.trim().replace(/^[-•*]\s*/, ''));
      } else if (line.trim().length === 0 || line.includes(':')) {
        if (results.length > 0) break;
      }
    }
  }

  return results.length > 0 ? results : ['Standard regulatory guidelines apply.'];
}

function evaluateQuestionWithIntel(
  question: ModuleScopingQuestion,
  text: string,
  modId: OracleModule
): {
  optIdx: number;
  confidence: 'high' | 'medium' | 'low' | 'unconfirmed';
  percentage: number;
  citation?: string;
  clarificationNeeded: boolean;
  notes?: string;
} {
  const textLower = text.toLowerCase();
  const qLower = question.question.toLowerCase();

  // Chart of Accounts / Segment match
  if (qLower.includes('chart of accounts') || qLower.includes('segment')) {
    if (textLower.includes('8 segment') || textLower.includes('secondary ledger') || textLower.includes('ifrs')) {
      return {
        optIdx: 1,
        confidence: 'high',
        percentage: 96,
        citation: '"Chart of Accounts requires 8 segments with IFRS and US GAAP secondary valuation ledgers."',
        clarificationNeeded: false
      };
    }
  }

  // Intercompany & AGIS
  if (qLower.includes('intercompany') || qLower.includes('agis')) {
    if (textLower.includes('intercompany') || textLower.includes('tolling') || textLower.includes('cross-border')) {
      return {
        optIdx: 2,
        confidence: 'high',
        percentage: 94,
        citation: '"Complex cross-border intercompany trading partner balancing (AGIS) and markups."',
        clarificationNeeded: false
      };
    }
  }

  // Banks & SWIFT
  if (qLower.includes('bank') || qLower.includes('swift') || qLower.includes('statement')) {
    if (textLower.includes('swift mt940') || textLower.includes('bank account') || textLower.includes('auto-reconciliation')) {
      return {
        optIdx: 2,
        confidence: 'high',
        percentage: 95,
        citation: '"Automated daily bank reconciliation with SWIFT MT940 statement ingestion."',
        clarificationNeeded: false
      };
    }
  }

  // Unions & Collective Bargaining
  if (qLower.includes('union') || qLower.includes('bargaining') || qLower.includes('cba')) {
    if (textLower.includes('union') || textLower.includes('collective bargaining')) {
      return {
        optIdx: 2,
        confidence: 'high',
        percentage: 95,
        citation: '"Collective Bargaining Agreements (Unions) with complex shift differentials."',
        clarificationNeeded: false
      };
    }
  }

  // Mock Cycles & Conversion
  if (qLower.includes('mock') || qLower.includes('conversion') || qLower.includes('migration')) {
    if (textLower.includes('mock') || textLower.includes('fbdi')) {
      return {
        optIdx: 2,
        confidence: 'high',
        percentage: 92,
        citation: '"Multi-mock conversion load cycles (SIT, UAT, Performance Load, Rehearsal)."',
        clarificationNeeded: false
      };
    }
  }

  // 3-Way Match & Procurement
  if (qLower.includes('3-way') || qLower.includes('matching') || qLower.includes('punchout')) {
    if (textLower.includes('3-way match') || textLower.includes('punchout') || textLower.includes('supplier portal')) {
      return {
        optIdx: 2,
        confidence: 'high',
        percentage: 90,
        citation: '"Automated 3-way matching and Punchout catalogs for strategic suppliers."',
        clarificationNeeded: false
      };
    }
  }

  // Default Fallback (Unconfirmed - source text silent)
  return {
    optIdx: 1, // Standard Modern Best Practice option
    confidence: 'low',
    percentage: 20,
    citation: 'Not explicitly documented in provided intel or spec sheet. Baseline MBP assumed.',
    clarificationNeeded: true,
    notes: 'Configured to standard Oracle Modern Best Practice (MBP); requires confirmation during workshop.'
  };
}
