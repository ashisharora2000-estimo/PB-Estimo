import { OracleModule, ScaleDrivers, ProjectScenario } from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';

export type AttributionSource = 'direct' | 'inferred' | 'default';

export interface ExtractedModifier {
  key: keyof ProjectScenario['clientModifiers'];
  name: string;
  category: string;
  value: number;
  label: string;
  confidencePct: number;
  citation: string;
  reasoning: string;
  attribution: AttributionSource;
}

export interface ExtractedScaleDriver {
  key: keyof ScaleDrivers;
  name: string;
  category: 'FIN' | 'SCM' | 'HCM' | 'TECH';
  currentValue: number;
  extractedValue: number;
  clampedValue: number;
  unit: string;
  confidencePct: number;
  citation: string;
  attribution: AttributionSource;
}

export interface ExtractedModuleItem {
  id: OracleModule;
  name: string;
  pillar: string;
  confidencePct: number;
  citation: string;
  attribution: AttributionSource;
}

export interface UnmappedExclusionItem {
  item: string;
  note: string;
  category: 'Non-Oracle Infrastructure' | 'Third-Party BPO' | 'Legacy Hardware' | 'Custom On-Premises' | 'Excluded Workstream';
}

export interface BlueprintExtractionResult {
  clientName: string;
  industry: string;
  legacySystem: string;
  targetGoLiveMonths: number;
  overallConfidencePct: number;
  inferredModules: ExtractedModuleItem[];
  scaleDrivers: ExtractedScaleDriver[];
  modifiers: ExtractedModifier[];
  rawScaleDriversPayload: Partial<ScaleDrivers>;
  rawModifiersPayload: Partial<ProjectScenario['clientModifiers']>;
  unmappedExclusions: UnmappedExclusionItem[];
  summaryFindings: string[];
  keyRiskHighlights: string[];
  extractionSource?: 'live_ai' | 'heuristic_engine';
}

export interface BlueprintSample {
  id: string;
  name: string;
  industry: string;
  badge: string;
  description: string;
  rawText: string;
}

export const BLUEPRINT_SAMPLES: BlueprintSample[] = [
  {
    id: 'sample_mfg',
    name: 'Apex Precision Automotive & Discrete Mfg',
    industry: 'Automotive & Industrial Discrete Manufacturing',
    badge: 'Legacy On-Prem ERP • 14 Entities • 8 Plants',
    description: '14 legal entities, 8 manufacturing plants, 6 warehouses, legacy on-prem ERP to Oracle Fusion Cloud with 36 OIC integrations, 22 conversion objects, and moderate data debt.',
    rawText: `CLIENT INTELLIGENCE & SCOPING MEMORANDUM
Client: Apex Precision Manufacturing International
Industry: Tier-1 Automotive Components & Discrete Heavy Manufacturing
Legacy Landscape: Legacy On-Premises ERP (running for 18 years, highly customized Z-tables), proprietary warehouse system, custom shopfloor MES.
Footprint & Operations:
- 14 Legal Entities across US, Mexico, Germany, and China with dual-currency consolidation (USD, EUR, MXN, CNY).
- 8 Discrete Manufacturing Plants running work order execution, standard costing, and shop floor routings.
- 6 Distribution Warehouses with automated RF mobile barcode scanning and parcel dispatch.
- 6,800 active employees with localized payroll and 2 union collective bargaining agreements at US manufacturing plants.
- 36 Oracle Integration Cloud (OIC) integrations connecting legacy MES, shop floor SCADA, EDI 850/856/810 gateways, and banking.
- 22 FBDI / HDL data conversion objects with 3 Mock Data Rehearsal cycles and 3 years of legacy transactional history.
- Exclusions & Notes: Client IT will handle legacy mainframe database decommission and physical barcode scanner hardware procurement.
- Governance & Constraints: Client Decision Velocity is moderate (2-week review loops). High data debt from 18 years of unpurged legacy vendor/customer master records. Moderate cloud adoption mindset with strict USMCA & German GoBD tax compliance mandates. Target Go-Live in 18 months.`
  },
  {
    id: 'sample_health',
    name: 'WellCare Regional Health System',
    industry: 'Healthcare & Hospital Networks',
    badge: 'Legacy Healthcare ERP • 18.5k Staff • 12 Hospitals',
    description: '12 hospital entities, 18,500 healthcare workers, localized payroll, 5 union bargaining units, 28 OIC integrations, and high regulatory HIPAA/Joint Commission compliance.',
    rawText: `RFP SCOPE STATEMENT: WELLCARE HEALTH SYSTEM CLOUD TRANSFORMATION
Client: WellCare Regional Health Network
Industry: Healthcare & Hospital Care Network
Legacy System: Legacy On-Premises Healthcare Financials and Timekeeping System
Footprint & Operations:
- 12 Operating Hospital Entities and 45 outpatient clinics with single master ledger and statutory departmental reporting.
- 18,500 active healthcare professionals, clinical nurses, and physicians across 3 states.
- 5 Collective Bargaining Agreements (Unions) with complex shift differential, premium weekend pay, and overtime rules.
- Localized US Payroll with bi-weekly execution for 18,500 employees, certified payroll reporting, and multi-state tax withholding.
- Oracle Recruiting Cloud (ORC) with high-volume clinical nursing requisition workflows and candidate SMS engagement.
- Core Financials (GL, AP, Procurement, Assets) to support 12 hospital facilities and 24,000 annual purchase orders for surgical/pharmacy supplies.
- 28 OIC integrations connecting badge time clocks, EHR clinical billing feeds, and medical distributors.
- 18 Data conversion objects with 3 mock cycles and 2 years of open clinical records.
- Governance & Modifiers: Fast-track executive steering committee (rapid decision turnaround), low legacy data debt, but high regulatory compliance scrutiny and high change resistance among senior physician groups.`
  },
  {
    id: 'sample_retail',
    name: 'Luxe Retail Brands Worldwide',
    industry: 'Omnichannel Retail & Consumer Goods',
    badge: 'Legacy Mid-Market ERP • 22 Entities • 120 Stores',
    description: '22 legal entities, 120 boutique retail stores, high-volume e-commerce OIC feeds, 4.5M annual sales transactions, multi-currency Financials, EPM consolidation, and ASC 606 revenue management.',
    rawText: `PROJECT CHARTER: LUXE RETAIL GLOBAL ERP & EPM TRANSFORMATION
Client: Luxe Retail Brands Worldwide
Industry: Omnichannel Fashion, Apparel & Retail
Legacy Landscape: Legacy Distributed ERP and on-premise POS
Footprint & Operations:
- 22 Legal Entities across North America, UK, France, and Japan with automated daily ECB currency feeds.
- 120 Boutique Retail Stores with POS cash settlement and 4 regional 3PL fulfillment warehouses.
- Financials Cloud (GL, AP, AR, Cash Management, Fixed Assets) and EPM Cloud (FCCS consolidation, EPBCS retail merchandise planning).
- High transaction density: 4.5 million annual sales transactions flowing through 42 OIC integrations and micro-batch API feeds.
- Revenue Management Cloud (ASC 606 / IFRS 15) for multi-element gift card liabilities and customer loyalty rewards.
- 16 FBDI / REST data conversion objects with 2 mock conversion rehearsal cycles and 1 year of historical net trial balances.
- Governance & Modifiers: Very strong cloud-first mindset (SaaS standard), rapid decision velocity, moderate data debt, but extreme peak season blackout constraints (Q4 retail freeze).`
  },
  {
    id: 'sample_saas',
    name: 'CloudScale Enterprise SaaS & High-Tech',
    industry: 'Software & Technology Services',
    badge: 'Legacy Entry ERP to Fusion • 8 Entities • 4000 Headcount',
    description: '8 global entities, 4,000 employees, multi-currency subscription billing, Project Portfolio Management (PPM), and automated Revenue Recognition.',
    rawText: `EXECUTIVE RFP: CLOUDSCALE GLOBAL ERP & HCM DEPLOYMENT
Client: CloudScale Technologies Inc.
Industry: High-Tech SaaS & Digital Cloud Services
Legacy Landscape: Legacy Entry-Tier ERP and Disparate HR Silos
Footprint & Operations:
- 8 Legal Entities (US, UK, Ireland, Singapore, India, Australia, Canada, Germany).
- 4,000 global knowledge workers across 8 remote hubs with Oracle HCM Core, Talent Management, and Absence Management.
- Oracle Cloud ERP: GL, AP, AR, Cash Management, Procurement, and Project Portfolio Management (PPM) for R&D capitalization.
- Subscription billing and ASC 606 contract revenue management.
- 18 OIC integrations connecting CRM, merchant billing gateways, and engineering time tracking.
- 14 Data conversion objects with 2 mock cycles.
- Governance & Modifiers: Extremely high cloud mindset (100% out-of-the-box standard), rapid executive approvals (<48h), clean data quality, and dedicated full-time agile BPOs.`
  }
];

// Mathematical Bounding Clamps (Guardrail 3)
export function clampScaleDriver(key: keyof ScaleDrivers, value: any): any {
  if (key === 'test_lead_model') {
    if (value === 'si_turnkey' || value === 'joint_50_50' || value === 'client_led') return value;
    return 'joint_50_50';
  }
  const num = typeof value === 'number' ? value : (Number(value) || 0);
  switch (key) {
    case 'fin_ent': return Math.max(1, Math.min(num, 150));
    case 'fin_led': return Math.max(1, Math.min(num, 40));
    case 'fin_cur': return Math.max(1, Math.min(num, 30));
    case 'fin_tax': return Math.max(1, Math.min(num, 20));
    case 'fin_coa_segments': return Math.max(4, Math.min(num, 12));
    case 'scm_plants': return Math.max(0, Math.min(num, 60));
    case 'scm_wh': return Math.max(0, Math.min(num, 80));
    case 'scm_inv': return Math.max(1, Math.min(num, 120));
    case 'hcm_hc': return Math.max(10, Math.min(num, 500000));
    case 'hcm_pay_countries': return Math.max(0, Math.min(num, 40));
    case 'hcm_union_groups': return Math.max(0, Math.min(num, 25));
    case 'tech_oic': return Math.max(0, Math.min(num, 120));
    case 'tech_paas': return Math.max(0, Math.min(num, 20));
    case 'tech_data_objects': return Math.max(1, Math.min(num, 60));
    case 'tech_conversion_cycles': return Math.max(1, Math.min(num, 6));
    case 'tech_historical_years': return Math.max(0, Math.min(num, 10));
    case 'tech_reports_bip': return Math.max(0, Math.min(num, 150));
    case 'tech_reports_otbi': return Math.max(0, Math.min(num, 150));
    case 'tech_fast_formulas': return Math.max(0, Math.min(num, 40));
    case 'tech_workflows': return Math.max(0, Math.min(num, 30));
    case 'tech_security_roles': return Math.max(0, Math.min(num, 60));
    case 'tech_cutover_dr_runs': return Math.max(1, Math.min(num, 5));
    case 'test_sit_cycles': return Math.max(1, Math.min(num, 5));
    case 'test_uat_cycles': return Math.max(1, Math.min(num, 4));
    case 'test_automation_pct': return Math.max(0, Math.min(num, 90));
    case 'test_defect_retest_factor': return Math.max(1.0, Math.min(num, 2.0));
    default: return num;
  }
}

// Local Heuristic Fallback Engine (Extremely fast & 100% offline reliable)
export function extractBlueprintFromText(
  inputText: string,
  currentScenario: ProjectScenario
): BlueprintExtractionResult {
  const text = inputText.toLowerCase();
  const raw = inputText;

  // 1. Identify Client Profile
  let clientName = 'Enterprise Client';
  const nameMatch = raw.match(/Client:\s*([^\n\r]+)/i) || raw.match(/Company:\s*([^\n\r]+)/i);
  if (nameMatch) {
    clientName = nameMatch[1].trim();
  }

  let industry = 'Enterprise Cross-Industry';
  if (text.includes('automotive') || text.includes('discrete manufacturing') || text.includes('plant') || text.includes('mfg')) {
    industry = 'Automotive & Discrete Manufacturing';
  } else if (text.includes('health') || text.includes('hospital') || text.includes('clinical') || text.includes('nursing')) {
    industry = 'Healthcare & Life Sciences';
  } else if (text.includes('retail') || text.includes('store') || text.includes('boutique') || text.includes('pos') || text.includes('merchandise')) {
    industry = 'Omnichannel Retail & Consumer Goods';
  } else if (text.includes('saas') || text.includes('software') || text.includes('high-tech') || text.includes('digital')) {
    industry = 'High-Tech SaaS & Professional Services';
  } else if (text.includes('financial service') || text.includes('banking') || text.includes('insurance')) {
    industry = 'Banking & Financial Services';
  }

  let legacySystem = 'Legacy ERP / On-Premises Landscape';
  if (text.includes('legacy on-prem') || text.includes('custom z-tables') || text.includes('legacy core')) legacySystem = 'Legacy On-Premises ERP';
  else if (text.includes('healthcare financials') || text.includes('clinical billing')) legacySystem = 'Legacy Healthcare Financials';
  else if (text.includes('distributed erp')) legacySystem = 'Legacy Distributed ERP';
  else if (text.includes('entry-tier') || text.includes('disparate hr')) legacySystem = 'Legacy Entry ERP & Disparate HR';
  else if (text.includes('on-premise') || text.includes('legacy')) legacySystem = 'Legacy On-Premises Core ERP';

  // Target Go-Live Months
  let targetGoLiveMonths = 18;
  const monthMatch = text.match(/(\d+)\s*months?\s*(?:to\s*go[- ]live|timeline|duration|deployment)/i);
  if (monthMatch) targetGoLiveMonths = parseInt(monthMatch[1], 10);

  // 2. Inferred Modules
  const inferredModules: ExtractedModuleItem[] = [];
  const addMod = (id: OracleModule, conf: number, citation: string, attribution: AttributionSource = 'direct') => {
    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === id);
    if (modDef && !inferredModules.some(m => m.id === id)) {
      inferredModules.push({
        id,
        name: modDef.name,
        pillar: modDef.pillar,
        confidencePct: conf,
        citation,
        attribution
      });
    }
  };

  // ERP Detection
  if (text.includes('general ledger') || text.includes('chart of accounts') || text.includes('gl') || text.includes('financial') || text.includes('ledger')) {
    addMod('erp_gl', 98, 'Detected General Ledger & Chart of Accounts architectural references.', 'direct');
  }
  if (text.includes('accounts payable') || text.includes('ap') || text.includes('invoice') || text.includes('3-way match') || text.includes('payment')) {
    addMod('erp_ap', 96, 'Identified Accounts Payable, invoice ingestion, and payment processing.', 'direct');
  }
  if (text.includes('accounts receivable') || text.includes('ar') || text.includes('billing') || text.includes('receipt') || text.includes('collection')) {
    addMod('erp_ar', 94, 'Identified Accounts Receivable, billing, and customer collection requirements.', 'direct');
  }
  if (text.includes('cash management') || text.includes('bank rec') || text.includes('bank account') || text.includes('swift') || text.includes('treasury')) {
    addMod('erp_cm', 95, 'Identified Cash Management and SWIFT MT940 bank statement reconciliation.', 'direct');
  }
  if (text.includes('fixed asset') || text.includes('asset book') || text.includes('depreciation') || text.includes('macrs')) {
    addMod('erp_fa', 92, 'Identified Fixed Assets and plant machinery depreciation books.', 'direct');
  }
  if (text.includes('procurement') || text.includes('purchase order') || text.includes('supplier portal') || text.includes('requisition') || text.includes('sourcing')) {
    addMod('erp_proc', 95, 'Identified Purchasing, Self-Service Requisitioning, and Supplier Portal.', 'direct');
  }
  if (text.includes('project financial') || text.includes('ppm') || text.includes('project billing') || text.includes('project costing') || text.includes('r&d capitalization')) {
    addMod('erp_ppm', 90, 'Identified Project Portfolio Management (PPM) & Costing.', 'direct');
  }
  if (text.includes('tax engine') || text.includes('statutory tax') || text.includes('vertex') || text.includes('avalara') || text.includes('gobd') || text.includes('cfdi')) {
    addMod('erp_tax', 93, 'Identified Financial Statutory Tax Engine and localized tax compliance.', 'direct');
  }

  // SCM Detection
  if (text.includes('order management') || text.includes('sales order') || text.includes('om') || text.includes('drop ship')) {
    addMod('scm_om', 94, 'Identified Order Management and sales order fulfillment flows.', 'direct');
  }
  if (text.includes('inventory') || text.includes('warehouse') || text.includes('inv org') || text.includes('stock') || text.includes('wip')) {
    addMod('scm_inv', 96, 'Identified Inventory Management and multi-facility stocking.', 'direct');
  }
  if (text.includes('manufacturing') || text.includes('discrete') || text.includes('work order') || text.includes('routing') || text.includes('plant')) {
    addMod('scm_mfg', 95, 'Identified Discrete Manufacturing and work order shopfloor execution.', 'direct');
  }
  if (text.includes('maintenance') || text.includes('plant maintenance') || text.includes('work center') || text.includes('eam')) {
    addMod('scm_maint', 88, 'Identified Maintenance Cloud and plant asset servicing.', 'direct');
  }
  if (text.includes('supply chain planning') || text.includes('demand plan') || text.includes('mrp') || text.includes('replenishment') || text.includes('forecasting')) {
    addMod('scm_plan', 92, 'Identified Supply Chain Planning Cloud and multi-echelon MRP.', 'direct');
  }
  if (text.includes('wms') || text.includes('advanced warehouse') || text.includes('rf mobile') || text.includes('barcode') || text.includes('wave pick')) {
    addMod('scm_wms', 93, 'Identified Warehouse Management (WMS) & RF Barcode mobile scanning.', 'direct');
  }
  if (text.includes('global order promising') || text.includes('gop') || text.includes('atp')) {
    addMod('scm_gop', 89, 'Identified Global Order Promising (GOP) & ATP rules.', 'direct');
  }

  // HCM Detection
  if (text.includes('human capital') || text.includes('hcm') || text.includes('core hr') || text.includes('employee') || text.includes('worker') || text.includes('staff')) {
    addMod('hcm_core', 96, 'Identified Global Core Human Resources & Position Management.', 'direct');
  }
  if (text.includes('payroll') || text.includes('bi-weekly') || text.includes('wage') || text.includes('tax withholding')) {
    addMod('hcm_payroll', 95, 'Identified Localized US/Global Payroll & Wage Withholding.', 'direct');
  }
  if (text.includes('time & labor') || text.includes('time card') || text.includes('punch') || text.includes('kronos') || text.includes('shift')) {
    addMod('hcm_time', 93, 'Identified Time & Labor and badge clock terminal integration.', 'direct');
  }
  if (text.includes('absence') || text.includes('pto') || text.includes('sick leave') || text.includes('leave')) {
    addMod('hcm_absence', 90, 'Identified Absence Management & Statutory PTO.', 'direct');
  }
  if (text.includes('recruiting') || text.includes('orc') || text.includes('requisition') || text.includes('applicant')) {
    addMod('hcm_orc', 91, 'Identified Oracle Recruiting Cloud (ORC) talent acquisition.', 'direct');
  }
  if (text.includes('talent') || text.includes('performance') || text.includes('goal') || text.includes('succession')) {
    addMod('hcm_talent', 88, 'Identified Talent Management & Annual Performance Reviews.', 'direct');
  }
  if (text.includes('benefits') || text.includes('open enrollment') || text.includes('insurance') || text.includes('hsa')) {
    addMod('hcm_benefits', 92, 'Identified Advanced Benefits Cloud & Health Plan Carrier Feeds.', 'direct');
  }

  // EPM & CX
  if (text.includes('fccs') || text.includes('consolidation') || text.includes('intercompany elimination')) {
    addMod('epm_fccs', 94, 'Identified Financial Consolidation & Close Cloud (FCCS).', 'direct');
  }
  if (text.includes('epbcs') || text.includes('planning & budgeting') || text.includes('merchandise planning') || text.includes('financial planning')) {
    addMod('epm_epbcs', 92, 'Identified Planning & Budgeting Cloud (EPBCS).', 'direct');
  }
  if (text.includes('edm') || text.includes('enterprise data management') || text.includes('master data')) {
    addMod('epm_edm', 89, 'Identified Enterprise Data Management (EDM).', 'direct');
  }
  if (text.includes('cx service') || text.includes('b2b service') || text.includes('service cloud') || text.includes('ticketing')) {
    addMod('cx_service', 88, 'Identified B2B Service Cloud & Customer Case Management.', 'direct');
  }
  if (text.includes('cpq') || text.includes('configure price quote') || text.includes('quote to cash')) {
    addMod('cx_cpq', 90, 'Identified Configure, Price, Quote (CPQ) Cloud.', 'direct');
  }

  // Default core if none detected
  if (inferredModules.length === 0) {
    addMod('erp_gl', 75, 'Standard default ERP Foundation module applied.', 'default');
    addMod('erp_ap', 75, 'Standard default Financials Accounts Payable applied.', 'default');
    addMod('erp_ar', 75, 'Standard default Financials Accounts Receivable applied.', 'default');
    addMod('erp_cm', 75, 'Standard default Financials Cash Management applied.', 'default');
    addMod('erp_proc', 75, 'Standard default Financials Procurement applied.', 'default');
  }

  // 3. Extract Scale Drivers
  const scaleDrivers: ExtractedScaleDriver[] = [];
  const rawScaleDriversPayload: Partial<ScaleDrivers> = {};

  const checkDriver = (
    key: keyof ScaleDrivers,
    name: string,
    category: 'FIN' | 'SCM' | 'HCM' | 'TECH',
    unit: string,
    regex: RegExp,
    defaultFallback: number,
    citationKeyword: string
  ) => {
    const match = raw.match(regex);
    const curr = typeof currentScenario.scaleDrivers[key] === 'number'
      ? (currentScenario.scaleDrivers[key] as number)
      : defaultFallback;
    let extractedVal = curr;
    let conf = 70;
    let citation = `Inherited standard baseline default (${curr} ${unit}).`;
    let attribution: AttributionSource = 'default';

    if (match) {
      const num = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 0) {
        extractedVal = num;
        conf = 95;
        citation = `Extracted from text: "${match[0].trim()}"`;
        attribution = 'direct';
      }
    } else if (text.includes(citationKeyword)) {
      conf = 80;
      attribution = 'inferred';
      citation = `Inferred from presence of '${citationKeyword}' in context.`;
    }

    const clampedVal = clampScaleDriver(key, extractedVal);

    scaleDrivers.push({
      key,
      name,
      category,
      currentValue: curr,
      extractedValue: extractedVal,
      clampedValue: clampedVal,
      unit,
      confidencePct: conf,
      citation,
      attribution
    });

    (rawScaleDriversPayload as any)[key] = clampedVal;
  };

  checkDriver('fin_ent', 'Legal Entities', 'FIN', 'entities', /(\d+)\s*(?:legal\s*entities|operating\s*entities|entities|companies)/i, 4, 'legal entit');
  checkDriver('fin_led', 'Primary/Secondary Ledgers', 'FIN', 'ledgers', /(\d+)\s*(?:ledgers?|secondary\s*ledgers?|valuation\s*ledgers?)/i, 2, 'ledger');
  checkDriver('fin_coa_segments', 'Chart of Accounts Segments', 'FIN', 'segments', /(\d+)\s*(?:coa\s*segments?|segments?|account\s*segments?)/i, 8, 'segment');
  checkDriver('scm_plants', 'Manufacturing Plants', 'SCM', 'plants', /(\d+)\s*(?:manufacturing\s*plants|plants|factories|facilities|mills)/i, 0, 'plant');
  checkDriver('scm_wh', 'Distribution Warehouses', 'SCM', 'warehouses', /(\d+)\s*(?:distribution\s*warehouses|warehouses|3pl\s*hubs|hubs|dc[s]?)/i, 2, 'warehouse');
  checkDriver('scm_inv', 'Inventory Organizations', 'SCM', 'orgs', /(\d+)\s*(?:inventory\s*orgs?|inv\s*orgs?|organizations?)/i, 4, 'inv org');
  checkDriver('hcm_hc', 'Employee Headcount', 'HCM', 'workers', /(\d[\d,]*)\s*(?:employees|workers|headcount|professionals|staff)/i, 2500, 'employee');
  checkDriver('hcm_union_groups', 'Union / CBA Groups', 'HCM', 'unions', /(\d+)\s*(?:collective\s*bargaining|unions|bargaining\s*agreements|cba[s]?)/i, 0, 'union');
  checkDriver('tech_oic', 'OIC Integrations', 'TECH', 'interfaces', /(\d+)\s*(?:oic|integrations|interfaces|api\s*flows|middleware)/i, 18, 'integration');
  checkDriver('tech_data_objects', 'Data Conversion Objects', 'TECH', 'objects', /(\d+)\s*(?:fbdi|data\s*objects|conversion\s*objects|entities\s*to\s*migrate)/i, 14, 'fbdi');
  checkDriver('tech_conversion_cycles', 'Mock Load Cycles', 'TECH', 'mock cycles', /(\d+)\s*(?:mock|rehearsal|conversion\s*cycle|load\s*cycle)/i, 3, 'mock');
  checkDriver('tech_historical_years', 'Historical History Depth', 'TECH', 'years', /(\d+)\s*(?:years?\s*(?:of\s*)?(?:legacy\s*)?(?:historical|history|data|records))/i, 2, 'history');

  // 4. Extract 7 Program Delivery Modifiers
  const modifiers: ExtractedModifier[] = [];
  const rawModifiersPayload: Partial<ProjectScenario['clientModifiers']> = {};

  // Decision Velocity
  let dvVal = 1.00;
  let dvLabel = 'Standard 1-2 Weeks (SteerCo Cadence)';
  let dvConf = 80;
  let dvCit = 'Default standard 1-2 week SteerCo approval cadence.';
  let dvReason = 'Standard governance expected without explicit escalation protocol.';
  let dvAttr: AttributionSource = 'default';

  if (text.includes('rapid decision') || text.includes('<48h') || text.includes('fast-track executive') || text.includes('agile decision')) {
    dvVal = 0.90;
    dvLabel = 'Rapid (<48h Turnaround)';
    dvConf = 95;
    dvCit = 'Found explicit rapid decision / executive empowerment references in text.';
    dvReason = 'Empowered core team and executive sponsor allows 10% velocity acceleration.';
    dvAttr = 'direct';
  } else if (text.includes('executive gridlock') || text.includes('multi-tiered') || text.includes('consensus driven') || text.includes('slow decision')) {
    dvVal = 1.35;
    dvLabel = 'Executive Gridlock (>4 Weeks)';
    dvConf = 92;
    dvCit = 'Detected multi-tiered bureaucratic committee loops and approval friction.';
    dvReason = 'Significant delays in design authority approvals require 35% risk multiplier.';
    dvAttr = 'direct';
  } else if (text.includes('moderate review') || text.includes('2-week review') || text.includes('part-time decision')) {
    dvVal = 1.15;
    dvLabel = 'Slow (2-4 Weeks Multi-tiered)';
    dvConf = 88;
    dvCit = 'Detected 2-4 week review loops mentioned in governance text.';
    dvReason = 'Iterative sign-offs introduce 15% delivery friction.';
    dvAttr = 'direct';
  }

  modifiers.push({
    key: 'decisionVelocity',
    name: 'Decision Velocity',
    category: 'Governance',
    value: dvVal,
    label: dvLabel,
    confidencePct: dvConf,
    citation: dvCit,
    reasoning: dvReason,
    attribution: dvAttr
  });
  rawModifiersPayload.decisionVelocity = dvVal;

  // Data Debt
  let ddVal = 1.00;
  let ddLabel = 'Standard Cleansing Required';
  let ddConf = 80;
  let ddCit = 'Assumed standard clean legacy extraction.';
  let ddReason = 'Moderate data cleansing and standard FBDI tie-out required.';
  let ddAttr: AttributionSource = 'default';

  if (text.includes('clean data') || text.includes('pristine') || text.includes('recent mdm') || text.includes('low legacy data debt')) {
    ddVal = 0.90;
    ddLabel = 'Pristine / Recent MDM';
    ddConf = 95;
    ddCit = 'Detected active MDM / clean master data posture.';
    ddReason = 'Clean master data reduces conversion mapping and reconciliation cycles by 10%.';
    ddAttr = 'direct';
  } else if (text.includes('18 years') || text.includes('unpurged') || text.includes('high data debt') || text.includes('heavy data debt') || text.includes('custom z-tables') || text.includes('duplicate vendor')) {
    ddVal = 1.25;
    ddLabel = 'Heavy (Duplicates, No MDM, Custom Z-tables)';
    ddConf = 96;
    ddCit = 'Detected unpurged legacy master data, duplicate records, or custom legacy tables.';
    ddReason = 'Heavy data cleansing, address standardization, and duplicate de-duping adds 25% effort.';
    ddAttr = 'direct';
  } else if (text.includes('moderate data debt') || text.includes('legacy sap') || text.includes('as400')) {
    ddVal = 1.10;
    ddLabel = 'Moderate (Minor Inconsistencies)';
    ddConf = 90;
    ddCit = 'Detected multi-system legacy footprint with moderate cleansing required.';
    ddReason = 'Cross-system reconciliation requires 10% conversion effort uplift.';
    ddAttr = 'inferred';
  }

  modifiers.push({
    key: 'dataDebt',
    name: 'Data Debt & Legacy Quality',
    category: 'Architecture',
    value: ddVal,
    label: ddLabel,
    confidencePct: ddConf,
    citation: ddCit,
    reasoning: ddReason,
    attribution: ddAttr
  });
  rawModifiersPayload.dataDebt = ddVal;

  // Cloud Mindset
  let cmVal = 1.00;
  let cmLabel = 'Standard Adoption';
  let cmConf = 80;
  let cmCit = 'Assumed standard Modern Best Practice adoption.';
  let cmReason = 'Client agrees to standard Cloud out-of-the-box configurations.';
  let cmAttr: AttributionSource = 'default';

  if (text.includes('100% out-of-the-box') || text.includes('zero customization') || text.includes('cloud-first') || text.includes('high cloud adoption')) {
    cmVal = 0.90;
    cmLabel = 'Zero Customization (100% MBP Out-of-Box)';
    cmConf = 95;
    cmCit = 'Identified strong commitment to Oracle Modern Best Practice (MBP) out-of-box.';
    cmReason = 'Adhering strictly to SaaS standard reduces functional design workshop time by 10%.';
    cmAttr = 'direct';
  } else if (text.includes('recreate legacy') || text.includes('high customization') || text.includes('heavy customizations') || text.includes('bespoke ui')) {
    cmVal = 1.30;
    cmLabel = 'Hostile to SaaS (Desire to Recreate Legacy)';
    cmConf = 94;
    cmCit = 'Found requests to recreate legacy bespoke workflows or resist SaaS standards.';
    cmReason = 'Extensive CEMLI extensions, PaaS VBCS wrappers, and exception handling adds 30% effort.';
    cmAttr = 'direct';
  } else if (text.includes('moderate cloud') || text.includes('some paas') || text.includes('industry extensions')) {
    cmVal = 1.15;
    cmLabel = 'Moderate Extension Appetite';
    cmConf = 85;
    cmCit = 'Detected some industry specific PaaS extensions required.';
    cmReason = 'PaaS extension governance adds 15% design effort.';
    cmAttr = 'inferred';
  }

  modifiers.push({
    key: 'cloudMindset',
    name: 'Cloud Mindset & SaaS Discipline',
    category: 'Culture & Mindset',
    value: cmVal,
    label: cmLabel,
    confidencePct: cmConf,
    citation: cmCit,
    reasoning: cmReason,
    attribution: cmAttr
  });
  rawModifiersPayload.cloudMindset = cmVal;

  // Integration Volatility
  let ivVal = 1.00;
  let ivLabel = 'Stable OIC / Standard Adapters';
  let ivConf = 80;
  let ivCit = 'Standard OIC pre-built recipes assumed.';
  let ivReason = 'Standard webhooks and REST integrations with mature endpoints.';
  let ivAttr: AttributionSource = 'default';

  if (text.includes('pre-built oic recipes') || text.includes('stable endpoints') || text.includes('certified adapters')) {
    ivVal = 0.90;
    ivLabel = 'Pre-built Recipes & Certified Adapters';
    ivConf = 92;
    ivCit = 'Detected pre-built Oracle OIC adapter recipes.';
    ivReason = 'Certified Oracle adapters accelerate technical interface build by 10%.';
    ivAttr = 'direct';
  } else if (text.includes('scada') || text.includes('mes') || text.includes('undocumented legacy') || text.includes('micro-batch') || text.includes('high transaction density') || text.includes('36 oic') || text.includes('42 oic')) {
    ivVal = 1.25;
    ivLabel = 'Volatile (Undocumented APIs, In-flight Changes)';
    ivConf = 95;
    ivCit = 'Detected legacy shopfloor SCADA/MES, high-density transaction feeds, or complex 3rd party APIs.';
    ivReason = 'Complex transformation payloads and asynchronous exception queues add 25% technical effort.';
    ivAttr = 'direct';
  } else if (text.includes('moderate interfaces') || text.includes('28 oic') || text.includes('edi')) {
    ivVal = 1.10;
    ivLabel = 'Moderate Interface Complexity';
    ivConf = 85;
    ivCit = 'Detected EDI and standard external partner integrations.';
    ivReason = 'EDI transaction testing requires 10% technical buffer.';
    ivAttr = 'inferred';
  }

  modifiers.push({
    key: 'integrationVolatility',
    name: 'Integration Volatility & Architecture',
    category: 'Architecture',
    value: ivVal,
    label: ivLabel,
    confidencePct: ivConf,
    citation: ivCit,
    reasoning: ivReason,
    attribution: ivAttr
  });
  rawModifiersPayload.integrationVolatility = ivVal;

  // SME Availability
  let smeVal = 1.00;
  let smeLabel = 'Standard 50% Allocation';
  let smeConf = 80;
  let smeCit = 'Assumed standard part-time BPO allocation.';
  let smeReason = 'Business process owners available for core design and testing workshops.';
  let smeAttr: AttributionSource = 'default';

  if (text.includes('100% dedicated') || text.includes('full-time bpo') || text.includes('dedicated full-time')) {
    smeVal = 0.90;
    smeLabel = '100% Dedicated Full-Time BPOs';
    smeConf = 95;
    smeCit = 'Confirmed full-time dedicated client Business Process Owners.';
    smeReason = 'Zero bottleneck during design sign-offs and UAT test execution saves 10% effort.';
    smeAttr = 'direct';
  } else if (text.includes('part-time') || text.includes('constrained') || text.includes('50%') || text.includes('65%') || text.includes('in-flight plant operations')) {
    smeVal = 1.15;
    smeLabel = 'Constrained (<25% Availability, Firefighting)';
    smeConf = 93;
    smeCit = 'Found client SME allocation constraints due to in-flight plant/hospital operations.';
    smeReason = 'Delayed workshop reviews and prolonged test execution cycles add 15% friction.';
    smeAttr = 'direct';
  }

  modifiers.push({
    key: 'smeAvailability',
    name: 'SME & BPO Availability',
    category: 'Resourcing',
    value: smeVal,
    label: smeLabel,
    confidencePct: smeConf,
    citation: smeCit,
    reasoning: smeReason,
    attribution: smeAttr
  });
  rawModifiersPayload.smeAvailability = smeVal;

  // Regulatory Compliance
  let rcVal = 1.00;
  let rcLabel = 'Standard Corporate Compliance';
  let rcConf = 80;
  let rcCit = 'Standard corporate accounting and statutory reporting assumed.';
  let rcReason = 'Single GAAP and standard tax reporting.';
  let rcAttr: AttributionSource = 'default';

  if (text.includes('usmca') || text.includes('gobd') || text.includes('hipaa') || text.includes('joint commission') || text.includes('cfdi') || text.includes('statutory compliance') || text.includes('dual-reporting') || text.includes('ifrs & us gaap')) {
    rcVal = 1.25;
    rcLabel = 'Heavy (Multi-Statutory, FDA / USMCA / GoBD / HIPAA)';
    rcConf = 96;
    rcCit = 'Detected USMCA origin tracking, German GoBD, Mexican CFDI, or healthcare HIPAA compliance.';
    rcReason = 'Dual-ledger accounting, localized statutory reporting, and validation audits add 25% effort.';
    rcAttr = 'direct';
  }

  modifiers.push({
    key: 'regulatoryCompliance',
    name: 'Regulatory & Statutory Compliance',
    category: 'Compliance',
    value: rcVal,
    label: rcLabel,
    confidencePct: rcConf,
    citation: rcCit,
    reasoning: rcReason,
    attribution: rcAttr
  });
  rawModifiersPayload.regulatoryCompliance = rcVal;

  // Change Resistance
  let crVal = 1.00;
  let crLabel = 'Moderate / Neutral Adoption';
  let crConf = 80;
  let crCit = 'Standard organizational change management assumed.';
  let crReason = 'Standard end-user training and communication plan.';
  let crAttr: AttributionSource = 'default';

  if (text.includes('union') || text.includes('high change resistance') || text.includes('physician') || text.includes('18 years') || text.includes('legacy culture')) {
    crVal = 1.20;
    crLabel = 'High Resistance (Entrenched Habits, Union Agreements)';
    crConf = 94;
    crCit = 'Identified union collective bargaining agreements, entrenched legacy habits, or change resistance.';
    crReason = 'Comprehensive OCM, union stakeholder alignment, and extended super-user training add 20% effort.';
    crAttr = 'direct';
  } else if (text.includes('high cloud mindset') || text.includes('enthusiastic leadership') || text.includes('modern workforce')) {
    crVal = 0.90;
    crLabel = 'High Readiness & Executive Sponsorship';
    crConf = 90;
    crCit = 'Detected enthusiastic leadership and high change readiness.';
    crReason = 'Rapid user adoption and minimal retraining friction save 10% effort.';
    crAttr = 'direct';
  }

  modifiers.push({
    key: 'changeResistance',
    name: 'Change Resistance & OCM Footprint',
    category: 'Culture & Mindset',
    value: crVal,
    label: crLabel,
    confidencePct: crConf,
    citation: crCit,
    reasoning: crReason,
    attribution: crAttr
  });
  rawModifiersPayload.changeResistance = crVal;

  // 5. Unmapped Non-Oracle Scope Exclusions
  const unmappedExclusions: UnmappedExclusionItem[] = [];
  if (text.includes('hardware') || text.includes('scanner hardware') || text.includes('rf gun procurement')) {
    unmappedExclusions.push({
      item: 'Physical RF Barcode Scanner & Mobile Hardware Procurement',
      note: 'Hardware supply and physical cabling is excluded from Oracle SaaS SI scope.',
      category: 'Legacy Hardware'
    });
  }
  if (text.includes('mainframe') || text.includes('decommission') || text.includes('as400 server')) {
    unmappedExclusions.push({
      item: 'Legacy Mainframe & Server Decommissioning',
      note: 'Legacy infrastructure teardown to be executed directly by Client IT / Hosting vendor.',
      category: 'Non-Oracle Infrastructure'
    });
  }
  if (text.includes('bpo') || text.includes('managed payroll service') || text.includes('third-party bpo')) {
    unmappedExclusions.push({
      item: 'Operational Payroll BPO / Call Center Operations',
      note: 'Third-party ongoing operations excluded; SI responsibility limited to Cloud implementation & hypercare.',
      category: 'Third-Party BPO'
    });
  }

  // Overall Confidence Score
  const allConfs = [
    ...inferredModules.map(m => m.confidencePct),
    ...scaleDrivers.map(s => s.confidencePct),
    ...modifiers.map(m => m.confidencePct)
  ];
  const overallConfidencePct = Math.round(allConfs.reduce((a, b) => a + b, 0) / (allConfs.length || 1));

  // Summary Findings
  const directCount = [...inferredModules, ...scaleDrivers, ...modifiers].filter(x => x.attribution === 'direct').length;
  const inferredCount = [...inferredModules, ...scaleDrivers, ...modifiers].filter(x => x.attribution === 'inferred').length;
  const defaultCount = [...inferredModules, ...scaleDrivers, ...modifiers].filter(x => x.attribution === 'default').length;

  const summaryFindings = [
    `Extracted ${inferredModules.length} In-Scope Oracle Fusion Cloud Modules across ${Array.from(new Set(inferredModules.map(m => m.pillar))).join(', ')}.`,
    `Calibrated ${scaleDrivers.length} Enterprise Physical Scale Drivers (${directCount} Direct 🟢, ${inferredCount} Inferred 🟡, ${defaultCount} Baseline 🔵).`,
    `Synthesized 7 Program Delivery Modifiers for friction profiling with mathematical bounding clamps applied.`,
    `Identified ${unmappedExclusions.length} Non-Oracle scope items isolated for contract exclusion protection.`
  ];

  const keyRiskHighlights = [];
  if (ddVal > 1.1) keyRiskHighlights.push('Heavy legacy data debt detected: Recommend allocating dedicated Mock 0 cleansing cycles.');
  if (rcVal > 1.1) keyRiskHighlights.push('Multi-statutory dual-ledger compliance detected: Secondary ledger configurations and statutory tax localization required.');
  if (ivVal > 1.1) keyRiskHighlights.push('High integration density (OIC / Legacy SCADA / MES): Recommend early OIC sandbox provisioning.');
  if (crVal > 1.1) keyRiskHighlights.push('Union collective bargaining & entrenched user habits: Comprehensive OCM and train-the-trainer strategy required.');

  return {
    clientName,
    industry,
    legacySystem,
    targetGoLiveMonths,
    overallConfidencePct,
    inferredModules,
    scaleDrivers,
    modifiers,
    rawScaleDriversPayload,
    rawModifiersPayload,
    unmappedExclusions,
    summaryFindings,
    keyRiskHighlights,
    extractionSource: 'heuristic_engine'
  };
}

// Async API wrapper with seamless local fallback
export async function extractBlueprintWithAiFallback(
  inputText: string,
  currentScenario: ProjectScenario
): Promise<BlueprintExtractionResult> {
  try {
    const response = await fetch('/api/gemini/parse-rfp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: inputText })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.result) {
        const res = data.result;
        // Clamp raw scale drivers
        const clampedDrivers: Partial<ScaleDrivers> = {};
        if (res.rawScaleDriversPayload) {
          Object.keys(res.rawScaleDriversPayload).forEach((k) => {
            const key = k as keyof ScaleDrivers;
            (clampedDrivers as any)[key] = clampScaleDriver(key, res.rawScaleDriversPayload[key]);
          });
        }

        return {
          clientName: res.clientName || 'Enterprise Client',
          industry: res.industry || 'Enterprise Cross-Industry',
          legacySystem: res.legacySystem || 'Legacy On-Premises ERP',
          targetGoLiveMonths: res.targetGoLiveMonths || 18,
          overallConfidencePct: res.overallConfidencePct || 94,
          inferredModules: res.inferredModules || [],
          scaleDrivers: res.scaleDrivers || [],
          modifiers: res.modifiers || [],
          rawScaleDriversPayload: clampedDrivers,
          rawModifiersPayload: res.rawModifiersPayload || {},
          unmappedExclusions: res.unmappedExclusions || [],
          summaryFindings: res.summaryFindings || ['Successfully extracted scope parameters from unstructured RFP text.'],
          keyRiskHighlights: res.keyRiskHighlights || [],
          extractionSource: 'live_ai'
        };
      }
    }
  } catch (err) {
    console.warn('Backend live AI parser unavailable, using local high-speed heuristic engine:', err);
  }

  // Seamless fallback to deterministic local rules engine
  return extractBlueprintFromText(inputText, currentScenario);
}

// 1-Click Executive RFP & Pricing Memo Formatter
export function generateExecutiveSowMemo(
  scenario: ProjectScenario,
  data: any,
  extraction?: BlueprintExtractionResult
): string {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const hours = Math.round(data?.targetHours || 5200);
  const pm = (hours / 160).toFixed(1);
  const weeks = scenario.projectWeeks || 32;
  const blendedRate = Math.round(data?.commercials?.blendedRate || 165);
  const totalCost = Math.round(data?.commercials?.totalCost || hours * 95);
  const totalPrice = Math.round(data?.commercials?.totalPrice || hours * blendedRate);
  const gmPct = ((totalPrice - totalCost) / (totalPrice || 1) * 100).toFixed(1);

  const modulesList = scenario.selectedModules.map(m => {
    const mod = ORACLE_MODULE_CATALOG.find(x => x.id === m);
    return `  • ${mod?.name || m} (${mod?.pillar || 'ERP'})`;
  }).join('\n');

  const exclusionsText = extraction?.unmappedExclusions?.length
    ? extraction.unmappedExclusions.map(e => `  • [EXCLUDED] ${e.item} - ${e.note}`).join('\n')
    : '  • Hardware procurement, cabling, and physical site installation.\n  • Legacy mainframe decommissioning and archival database hosting.\n  • Ongoing operational payroll execution post-hypercare.';

  return `================================================================================
EXECUTIVE RFP & COMMERCIAL ESTIMATION MEMO
================================================================================
Date: ${dateStr}
Project / Client: ${scenario.name}
Program Duration: ${weeks} Calendar Weeks (7-Phase Oracle True Cloud Method)
Delivery Baseline: Defensible Target (P80 Confidence)

1. EXECUTIVE SUMMARY & ARCHITECTURE SCOPE
--------------------------------------------------------------------------------
Scope Footprint (${scenario.selectedModules.length} Oracle Cloud Modules):
${modulesList}

Operating Scale:
  • Legal Entities: ${scenario.scaleDrivers.fin_ent} | Ledgers: ${scenario.scaleDrivers.fin_led} | COA Segments: ${scenario.scaleDrivers.fin_coa_segments}
  • Manufacturing Plants: ${scenario.scaleDrivers.scm_plants} | Warehouses: ${scenario.scaleDrivers.scm_wh}
  • Employee Headcount: ${scenario.scaleDrivers.hcm_hc?.toLocaleString()} workers
  • Integrations (OIC): ${scenario.scaleDrivers.tech_oic} interfaces | Data Objects: ${scenario.scaleDrivers.tech_data_objects} FBDI entities

2. RESOURCE STAFFING & CONCURRENCY
--------------------------------------------------------------------------------
Total Defensible Effort: ${hours.toLocaleString()} Hours (~${pm} Person-Months)
Peak FTE Concurrency: ${(hours / (weeks * 40) * 1.35).toFixed(1)} FTEs (Build / CRP2 & SIT)
Average FTE Concurrency: ${(hours / (weeks * 40)).toFixed(1)} FTEs
Sourcing Mix: ${scenario.deliveryMix.onshore}% Onshore / ${scenario.deliveryMix.nearshore}% Nearshore / ${scenario.deliveryMix.offshore}% GDC Offshore

3. COMMERCIAL & PRICING SUMMARY (BOARD-READY)
--------------------------------------------------------------------------------
Total Contract Value (Price): $${totalPrice.toLocaleString()} USD
Total Delivery Cost: $${totalCost.toLocaleString()} USD
Projected Gross Margin: ${gmPct}%
Blended Bill Rate: $${blendedRate}/Hour

4. CONTRACTUAL ASSUMPTIONS & CLIENT DEPENDENCIES
--------------------------------------------------------------------------------
  1. Client will provide dedicated Business Process Owners (BPOs) with min 50% allocation.
  2. Legacy data extraction into Oracle FBDI templates is owned by Client IT.
  3. Steering Committee turnaround SLA for design decisions capped at 5 business days.
  4. Oracle quarterly pod updates to follow standard 2-week validation cadence.

5. EXPLICIT OUT-OF-SCOPE EXCLUSIONS
--------------------------------------------------------------------------------
${exclusionsText}

================================================================================
Generated via Oracle Fusion Cloud Sizing & Estimation Engine (HITL Certified)
================================================================================`;
}
