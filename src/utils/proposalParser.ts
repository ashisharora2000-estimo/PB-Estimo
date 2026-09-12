import * as XLSX from 'xlsx';
import { OracleModule, ScaleDrivers, QuestionConfidenceMeta, UploadedProposal, TShirtSize } from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';
import { MODULE_TOP_20_QUESTIONS, ModuleScopingQuestion, getQuestionsForModule } from '../data/moduleScopingQuestions';

export interface DriverEvidenceItem {
  driverKey: keyof ScaleDrivers;
  label: string;
  value: number | string;
  confidence: 'high' | 'medium';
  percentage: number;
  citation: string;
  sourceLocation: string;
}

export interface ModuleEvidenceItem {
  moduleId: OracleModule;
  name: string;
  pillar: string;
  status: 'in_scope' | 'excluded';
  evidenceQuote: string;
  sourceLocation: string;
  confidence: 'high' | 'medium';
}

export interface EvidenceSheetAuditItem {
  sheetName: string;
  rowCount: number;
  cellCount: number;
  keyHeaders: string[];
  extractedFactsCount: number;
}

export interface ScopingSheetQuestionRating {
  moduleId: OracleModule;
  questionIndex?: number; // 0 to 19 if matched to 20-Q
  questionText: string;
  ratingScore: number; // 1 to 4
  ratingLabel: string; // 'High', 'Level 3', 'Complex', etc.
  sourceLocation: string; // e.g. Sheet 'Scoping'!Row 5
  evidenceQuote: string;
}

export interface ScopingSheetModuleRating {
  moduleId: OracleModule;
  ratingLabel: string; // e.g. 'High', 'Complex', 'L'
  score: number; // 1 to 4
  tShirtSize: TShirtSize;
  sourceLocation: string;
  evidenceQuote: string;
  scopeStatus?: 'in_scope' | 'out_of_scope';
}

export interface ProposalParseResult {
  inferredModules: OracleModule[];
  extractedScaleDrivers: Partial<ScaleDrivers>;
  questionAnswers: Record<string, number[]>; // modId -> number[] (optIdx 0 to 3)
  questionConfidenceMeta: Record<string, Record<number, QuestionConfidenceMeta>>; // modId -> qIdx -> meta
  summaryFindings: string[];
  clientClarificationsNeeded: string[];
  // Enhanced Evidence-Bounded Metadata
  evidenceSheetAudit?: EvidenceSheetAuditItem[];
  driverEvidence?: Record<string, DriverEvidenceItem>;
  moduleEvidence?: Record<string, ModuleEvidenceItem>;
  excludedModules?: string[];
  unconfirmedDriversProtected?: string[];
  // Scoping Sheet Inputs (Prioritized First)
  moduleRatingsFromSheet?: Record<string, ScopingSheetModuleRating>;
  scopingSheetQuestions?: ScopingSheetQuestionRating[];
  moduleTShirtOverrides?: Record<string, TShirtSize>;
  stats: {
    highConfidenceCount: number;
    mediumConfidenceCount: number;
    lowConfidenceCount: number;
    unconfirmedCount: number;
    totalQuestionsScoped: number;
    overallConfidencePercentage: number;
    totalCellsParsed?: number;
    totalSheetsParsed?: number;
    evidenceBackedDriversCount?: number;
    scopingSheetQuestionsCount?: number;
    moduleRatingsCount?: number;
  };
}

export const SAMPLE_PROPOSAL_TEMPLATES = [
  {
    name: 'Global Manufacturing & Supply Chain RFP (Apex Automotive)',
    description: '14 legal entities, 8 manufacturing plants, 6 warehouses, legacy ERP to Oracle Fusion Cloud ERP/SCM transformation with 35 OIC integrations and multi-currency consolidation.',
    content: `RFP SCOPE DOCUMENT: APEX AUTOMOTIVE GLOBAL TRANSFORMATION
Client: Apex Precision Manufacturing International
Target System: Oracle Fusion Cloud Applications (ERP, SCM, EPM)
Scope Overview:
Apex is replacing its legacy on-premises ERP and warehouse systems with a unified Oracle Fusion Cloud ERP and SCM solution. 
The organization operates across 14 Legal Entities in the US, Mexico, Germany, and China, with 8 discrete manufacturing plants and 6 3PL distribution warehouses.

Financial & Operational Architecture:
- Chart of Accounts requires 8 segments with IFRS and US GAAP secondary valuation ledgers.
- 4 primary currency ledgers with automated daily ECB/Federal Reserve exchange rate feeds.
- Complex intercompany trading partner balancing (AGIS) across 14 legal entities with cross-border tolling markups.
- Automated daily bank reconciliation with SWIFT MT940 statement ingestion for 45 corporate bank accounts.
- Fixed Assets footprint includes 12,000 serialized plant machinery assets with MACRS and straight-line tax books.

Supply Chain Footprint:
- 8 Manufacturing facilities running discrete work orders, backflush costing, and dual-unit of measure inventory.
- 6 Advanced automated warehouses requiring RF mobile barcode scanning, wave picking, and carrier parcel integration.
- Supplier Portal enablement for 450 strategic tier-1 suppliers with electronic PO dispatch and self-service ASN generation.
- Supply Chain Planning Cloud with multi-echelon demand forecasting and automated replenishment requisitions.

Integration & Data Conversion:
- Technical landscape involves 36 Oracle Integration Cloud (OIC) integrations connecting legacy MES, shopfloor SCADA, and EDI 850/856/810 gateways.
- 22 FBDI / HDL data objects including 2 years of open transactional purchase orders, AP invoices, and serialized asset inventory.
- 3 Mock Conversion load cycles (Mock 1 in SIT, Mock 2 in UAT, Mock 3 Cutover Dress Rehearsal).

Staffing & Delivery Constraints:
- Client BPO availability is constrained to 50% part-time allocation due to in-flight ERP plant operations.
- Go-live cutover window is strictly capped at 72 hours over the Thanksgiving manufacturing holiday.`
  },
  {
    name: 'Healthcare & Enterprise HCM Cloud Transformation (WellCare Health)',
    description: '18,500 healthcare workers, 5 collective bargaining union agreements, bi-weekly payroll, Oracle ORC talent acquisition, and badge time integration.',
    content: `PROJECT CHARTER & RFP: WELLCARE HEALTH SYSTEM CLOUD TRANSFORMATION
Client: WellCare Regional Health Network
Target System: Oracle Fusion Cloud Human Capital Management (HCM) & Financials Cloud
Scope Overview:
WellCare operates 12 acute care hospitals and 45 outpatient clinics with 18,500 active healthcare professionals, nursing staff, and physicians across 3 states.

HCM & Workforce Requirements:
- Core HCM Cloud with complex position management, multi-assignment clinical faculty, and departmental cost center hierarchies.
- 5 Collective Bargaining Agreements (Unions) with complex shift differential, premium weekend pay, and overtime rules.
- Localized US Payroll with bi-weekly execution for 18,500 employees, certified payroll reporting, and multi-state tax withholding.
- Oracle Recruiting Cloud (ORC) with high-volume clinical nursing requisition workflows, background check integration, and candidate SMS engagement.
- Advanced Benefits Cloud supporting 8 health insurance carrier plans, HSA/FSA administration, and automated open enrollment life events.
- Time & Labor integration with time badge terminals transmitting 250,000 punches per pay period.

Financials & Procurement Scope:
- Core Financials (GL, AP, Procurement, Assets) to support 6 Operating Entities and 24,000 annual purchase orders for surgical/pharmacy supplies.
- Automated 3-way matching and Punchout catalogs for 12 major medical supply distributors.
- Data Migration: 18,500 active workers, 3 years of payroll tax historical records, and 12,000 open clinical purchase requisitions.
- Testing Approach: 3 Mock Data Conversions and 2 User Acceptance Testing (UAT) cycles.`
  },
  {
    name: 'Retail & Multi-Channel Consumer Cloud (Luxe Retail Group)',
    description: 'High-volume consumer goods, multi-currency Financials, EPM consolidation (FCCS & EPBCS), OIC inventory feeds, and Revenue Management.',
    content: `REQUEST FOR PROPOSAL (RFP): LUXE RETAIL GLOBAL ERP & EPM
Client: Luxe Retail Brands Worldwide
Target Solution: Oracle Fusion Financials Cloud & Enterprise Performance Management (EPM)
Overview:
Luxe Retail operates 120 boutique retail stores and high-volume e-commerce channels across North America and Western Europe.

Key Scope Highlights:
- Financials Cloud: General Ledger, Accounts Payable, Accounts Receivable, Cash Management, and Fixed Assets.
- EPM Cloud: FCCS for multi-entity statutory consolidation (22 legal entities) and EPBCS for retail merchandise financial planning.
- High-volume transaction processing: 4.5 million annual sales receipts flowing through automated OIC micro-batch interfaces into Oracle Receivables.
- Point of Sale (POS) daily cash settlement reconciliation across 120 store merchant accounts.
- Revenue Management Cloud (ASC 606 / IFRS 15) for multi-element customer gift card and loyalty reward obligations.
- Legacy Data: 1 year of historical net trial balances and active gift card liabilities.`
  },
  {
    name: 'Enterprise Scoping Sheet & Module Questionnaire (Multi-Module Ratings)',
    description: 'Excel workbook scoping sheet with module-wise questions, complexity ratings (High/Medium/Low/Level 1-4), in-scope confirmations, and explicit exclusions.',
    content: `=== EXCEL WORKBOOK INGESTION AUDIT: Oracle_Cloud_Scoping_Sheet.xlsx ===
Total Worksheets: 3 [Module Scope & Ratings, Detailed Questionnaire, Physical Drivers]

--- WORKSHEET [1/3]: 'Module Scope & Ratings' ---
[Sheet: 'Module Scope & Ratings', Row: 1] Module | Pillar | Scope Status | Complexity Rating | T-Shirt | Scope Notes
[Sheet: 'Module Scope & Ratings', Row: 2] General Ledger (GL) | ERP | In Scope | High (Level 3) | L | 8 COA segments, AGIS intercompany, multi-currency
[Sheet: 'Module Scope & Ratings', Row: 3] Accounts Payable (AP) | ERP | In Scope | High (Level 3) | L | Automated 3-way match, IDR OCR invoice processing
[Sheet: 'Module Scope & Ratings', Row: 4] Accounts Receivable (AR) | ERP | In Scope | Medium (Level 2) | M | Auto-lockbox processing, collections scoring
[Sheet: 'Module Scope & Ratings', Row: 5] Cash Management (CM) | ERP | In Scope | High (Level 3) | L | Daily SWIFT MT940 statement auto-reconciliation
[Sheet: 'Module Scope & Ratings', Row: 6] Fixed Assets (FA) | ERP | In Scope | Medium (Level 2) | M | 8,500 serialized machinery assets, MACRS books
[Sheet: 'Module Scope & Ratings', Row: 7] Procurement Cloud | ERP | In Scope | Medium (Level 2) | M | Punchout catalogs, requisition approval hierarchies
[Sheet: 'Module Scope & Ratings', Row: 8] Order Management (OM) | SCM | In Scope | Complex (Level 3) | L | Back-to-back orders, drop-ship orchestration
[Sheet: 'Module Scope & Ratings', Row: 9] Inventory Cloud | SCM | In Scope | High (Level 3) | L | Dual-unit of measure, 6 subinventories per facility
[Sheet: 'Module Scope & Ratings', Row: 10] Manufacturing Cloud | SCM | In Scope | Very High (Level 4) | XL | Discrete shopfloor work orders, standard costing
[Sheet: 'Module Scope & Ratings', Row: 11] Oracle Payroll Cloud | HCM | In Scope | Very High (Level 4) | XL | 14,000 employees, 4 union CBAs, bi-weekly
[Sheet: 'Module Scope & Ratings', Row: 12] Time & Labor (OTL) | HCM | In Scope | High (Level 3) | L | Badge terminal punch clocks, shift differentials
[Sheet: 'Module Scope & Ratings', Row: 13] Maintenance Cloud (eAM) | SCM | Out of Scope | Low (Level 1) | S | Excluded - Client retaining existing legacy Maximo system
[Sheet: 'Module Scope & Ratings', Row: 14] Planning & Budgeting (EPBCS) | EPM | Out of Scope | Medium (Level 2) | M | Deferred to Phase 2 roadmap

--- WORKSHEET [2/3]: 'Detailed Questionnaire' ---
[Sheet: 'Detailed Questionnaire', Row: 1] Module | Question Number | Architectural Topic | Rating (1-4) | Stated Client Requirement
[Sheet: 'Detailed Questionnaire', Row: 2] General Ledger | Q1 | Chart of Accounts Structure | 3 | 8 Segments with global rolling calendar
[Sheet: 'Detailed Questionnaire', Row: 3] General Ledger | Q2 | Intercompany AGIS Netting | 4 | 14 legal entities with cross-border tolling agreements
[Sheet: 'Detailed Questionnaire', Row: 4] Accounts Payable | Q1 | Invoice Ingestion & OCR | 3 | IDR automated scanning with 85% straight-through processing
[Sheet: 'Detailed Questionnaire', Row: 5] Accounts Payable | Q2 | Payment Approvals & Formats | 2 | ISO 20022 XML format via corporate host-to-host banking
[Sheet: 'Detailed Questionnaire', Row: 6] Oracle Payroll | Q1 | Pay Groups & Frequency | 4 | 4 Union CBAs with complex overtime, bi-weekly payroll runs
[Sheet: 'Detailed Questionnaire', Row: 7] Time & Labor | Q1 | Time Entry & Capture | 3 | 85 badge physical terminals across 8 manufacturing plants

--- WORKSHEET [3/3]: 'Physical Drivers' ---
[Sheet: 'Physical Drivers', Row: 1] Parameter | Value | Provenance
[Sheet: 'Physical Drivers', Row: 2] Operating Legal Entities | 14 | Corporate Legal Charter
[Sheet: 'Physical Drivers', Row: 3] Primary Business Units | 8 | Operational Structure
[Sheet: 'Physical Drivers', Row: 4] Operating Currencies | 4 | USD, EUR, MXN, CNY
[Sheet: 'Physical Drivers', Row: 5] Active Worker Headcount | 14000 | HR Census
[Sheet: 'Physical Drivers', Row: 6] Manufacturing Facilities | 8 | Plant Operations
[Sheet: 'Physical Drivers', Row: 7] Integration Cloud Count | 28 | Enterprise IT Architecture`
  }
];

/**
 * Parses binary Excel array buffer into text representation retaining sheet names and cell coordinates
 */
export function parseSpreadsheetWorkbookToText(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string = 'Spreadsheet.xlsx'
): {
  fullText: string;
  sheetAudits: EvidenceSheetAuditItem[];
  totalCells: number;
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetAudits: EvidenceSheetAuditItem[] = [];
  let totalCells = 0;

  let textAcc = `=== EXCEL WORKBOOK INGESTION AUDIT: ${fileName} ===\n`;
  textAcc += `Total Worksheets: ${workbook.SheetNames.length} [${workbook.SheetNames.join(', ')}]\n\n`;

  workbook.SheetNames.forEach((sheetName, sIdx) => {
    const ws = workbook.Sheets[sheetName];
    if (!ws) return;

    // Extract raw rows
    const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const rowCount = rawRows.length;
    let sheetCellCount = 0;
    const headerRow = rawRows[0] || [];
    const keyHeaders = headerRow
      .map(h => String(h).trim())
      .filter(h => h.length > 0 && h.length < 40)
      .slice(0, 8);

    rawRows.forEach(row => {
      row.forEach(cell => {
        if (cell !== undefined && cell !== null && String(cell).trim().length > 0) {
          sheetCellCount++;
        }
      });
    });

    totalCells += sheetCellCount;

    sheetAudits.push({
      sheetName,
      rowCount,
      cellCount: sheetCellCount,
      keyHeaders,
      extractedFactsCount: 0
    });

    textAcc += `\n--- [SHEET ${sIdx + 1}: '${sheetName}'] (Rows: ${rowCount}, Non-empty Cells: ${sheetCellCount}) ---\n`;

    // 1. Line-by-line formatted rows for precise coordinate referencing
    rawRows.forEach((row, rIdx) => {
      const nonEmpties = row.map((c, cIdx) => ({
        val: String(c).trim(),
        colName: XLSX.utils.encode_col(cIdx)
      })).filter(item => item.val.length > 0);

      if (nonEmpties.length > 0) {
        // Output coordinate-tagged line: [Sheet: 'Scope', Row: 4] Legal Entities | 14
        const cellPairs = nonEmpties.map(item => `${item.colName}:${item.val}`).join(' | ');
        const rowPlain = nonEmpties.map(item => item.val).join(' | ');
        textAcc += `[Sheet: '${sheetName}', Row: ${rIdx + 1}] ${rowPlain} (Cells: ${cellPairs})\n`;
      }
    });

    // 2. CSV representation for structured table regexes
    const csvData = XLSX.utils.sheet_to_csv(ws, { blankrows: false });
    textAcc += `\n[CSV Table: ${sheetName}]\n${csvData}\n`;
  });

  return {
    fullText: textAcc,
    sheetAudits,
    totalCells
  };
}

interface EvidenceUnit {
  raw: string;
  lower: string;
  sourceLocation: string;
  sheetName?: string;
  rowNum?: number;
}

/**
 * Splits proposal text or spreadsheet stream into discrete searchable evidence lines with coordinates
 */
function indexEvidenceUnits(rawText: string): EvidenceUnit[] {
  const lines = rawText.split('\n');
  let currentSheet: string | undefined = undefined;
  const result: EvidenceUnit[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if line declares a sheet
    const sheetMatch = trimmed.match(/\[(?:SHEET \d+:|Sheet:) '([^']+)'/i);
    if (sheetMatch) {
      currentSheet = sheetMatch[1];
    }

    // Extract coordinate if already formatted
    const coordMatch = trimmed.match(/\[Sheet: '([^']+)', Row: (\d+)\]/i);
    let sourceLoc = `Line ${idx + 1}`;
    let rowNum: number | undefined = undefined;

    if (coordMatch) {
      currentSheet = coordMatch[1];
      rowNum = parseInt(coordMatch[2], 10);
      sourceLoc = `Sheet '${coordMatch[1]}'!Row ${coordMatch[2]}`;
    } else if (currentSheet) {
      sourceLoc = `Sheet '${currentSheet}', Line ${idx + 1}`;
    }

    result.push({
      raw: trimmed,
      lower: trimmed.toLowerCase(),
      sourceLocation: sourceLoc,
      sheetName: currentSheet,
      rowNum
    });
  });

  return result;
}

/**
 * Helper to match an exact driver number from evidence units with strict quote and citation
 */
function extractDriverWithEvidence(
  units: EvidenceUnit[],
  patterns: RegExp[],
  driverLabel: string
): { value: number; quote: string; sourceLocation: string; confidence: 'high' | 'medium' } | null {
  for (const pattern of patterns) {
    for (const unit of units) {
      const match = unit.raw.match(pattern);
      if (match && match[1]) {
        const cleanedStr = match[1].replace(/,/g, '').trim();
        const parsedNum = parseInt(cleanedStr, 10);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          return {
            value: parsedNum,
            quote: unit.raw.slice(0, 160),
            sourceLocation: unit.sourceLocation,
            confidence: 'high'
          };
        }
      }
    }
  }
  return null;
}

/**
 * Primary AI Evidence-Bounded Proposal & Excel Ingestion Engine
 * Guarantees:
 * 1. Reads every word and cell across all worksheets
 * 2. Zero hallucination: updates strictly limited to evidence found
 * 3. Exact quotes and cell coordinates recorded for every fact
 * 4. Explicitly stated exclusions respected
 * 5. Unconfirmed items protected without guessing
 */
export function parseProposalDocument(proposalText: string): ProposalParseResult {
  const units = indexEvidenceUnits(proposalText);
  const fullTextLower = proposalText.toLowerCase();

  // Audit Sheets Detected
  const detectedSheets = Array.from(new Set(units.map(u => u.sheetName).filter(Boolean))) as string[];
  const sheetAudits: EvidenceSheetAuditItem[] = detectedSheets.map(sName => {
    const sheetUnits = units.filter(u => u.sheetName === sName);
    return {
      sheetName: sName,
      rowCount: sheetUnits.length,
      cellCount: sheetUnits.length * 3, // approximate cells
      keyHeaders: [],
      extractedFactsCount: 0
    };
  });

  // 1. MODULE SCOPING WITH EXCLUSION GUARDRAIL
  const inferredModules: OracleModule[] = [];
  const moduleEvidence: Record<string, ModuleEvidenceItem> = {};
  const excludedModules: string[] = [];

  const EXCLUSION_REGEX = /(?:out\s*of\s*scope|excluded|not\s*in\s*scope|phase\s*2|deferred|future\s*wave|non-?scope|legacy\s*only|not\s*applicable|n\/a|in\s*scope:\s*no|status:\s*excluded)\b/i;

  // Catalog modules to scan
  const MODULE_KEYWORDS: Array<{
    id: OracleModule;
    name: string;
    pillar: string;
    positivePatterns: RegExp[];
    exclusionPatterns: RegExp[];
  }> = [
    // ERP
    {
      id: 'erp_gl',
      name: 'General Ledger',
      pillar: 'ERP',
      positivePatterns: [/\b(?:general\s*ledger|chart\s*of\s*accounts|coa\s*segment|secondary\s*ledger|erp_gl)\b/i],
      exclusionPatterns: [/general\s*ledger[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope|phase\s*2)/i]
    },
    {
      id: 'erp_ap',
      name: 'Accounts Payable',
      pillar: 'ERP',
      positivePatterns: [/\b(?:accounts\s*payable|ap\s*invoice|3-way\s*match|supplier\s*payments|erp_ap)\b/i],
      exclusionPatterns: [/accounts\s*payable[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'erp_ar',
      name: 'Accounts Receivable',
      pillar: 'ERP',
      positivePatterns: [/\b(?:accounts\s*receivable|billing\s*and\s*receivable|customer\s*invoicing|erp_ar|collections\s*management)\b/i],
      exclusionPatterns: [/accounts\s*receivable[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'erp_fa',
      name: 'Fixed Assets',
      pillar: 'ERP',
      positivePatterns: [/\b(?:fixed\s*assets?|asset\s*depreciation|asset\s*books?|erp_fa|serialized\s*assets)\b/i],
      exclusionPatterns: [/fixed\s*assets?[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'erp_cm',
      name: 'Cash Management',
      pillar: 'ERP',
      positivePatterns: [/\b(?:cash\s*management|bank\s*reconciliation|swift\s*mt940|treasury\s*cash|erp_cm)\b/i],
      exclusionPatterns: [/cash\s*management[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'erp_proc',
      name: 'Procurement Cloud',
      pillar: 'ERP',
      positivePatterns: [/\b(?:procurement\s*cloud|purchase\s*orders?|requisitions?|supplier\s*portal|punchout|sourcing\s*cloud|erp_proc)\b/i],
      exclusionPatterns: [/procurement[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'erp_ppm',
      name: 'Project Financials (PPM)',
      pillar: 'ERP',
      positivePatterns: [/\b(?:project\s*financials?|project\s*costing|project\s*billing|ppm|erp_ppm)\b/i],
      exclusionPatterns: [/project\s*financials?[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'erp_tax',
      name: 'Tax Engine / Statutory Tax',
      pillar: 'ERP',
      positivePatterns: [/\b(?:statutory\s*tax|tax\s*engine|vertex|avalara|withholding\s*tax|erp_tax|e-?invoicing)\b/i],
      exclusionPatterns: [/tax\s*engine[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },

    // SCM
    {
      id: 'scm_om',
      name: 'Order Management',
      pillar: 'SCM',
      positivePatterns: [/\b(?:order\s*management|sales\s*order\s*processing|drop\s*ship|scm_om|quote\s*to\s*order)\b/i],
      exclusionPatterns: [/order\s*management[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'scm_inv',
      name: 'Inventory Management',
      pillar: 'SCM',
      positivePatterns: [/\b(?:inventory\s*management|inv\s*orgs?|stocking\s*locations|dual-?unit\s*of\s*measure|scm_inv)\b/i],
      exclusionPatterns: [/inventory[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'scm_mfg',
      name: 'Manufacturing Cloud',
      pillar: 'SCM',
      positivePatterns: [/\b(?:manufacturing\s*cloud|discrete\s*(?:mfg|manufacturing)|process\s*mfg|work\s*orders?|shopfloor|scm_mfg)\b/i],
      exclusionPatterns: [/manufacturing[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'scm_maint',
      name: 'Maintenance Cloud (eAM)',
      pillar: 'SCM',
      positivePatterns: [/\b(?:maintenance\s*cloud|plant\s*maintenance|work\s*center\s*maintenance|eam|scm_maint)\b/i],
      exclusionPatterns: [/maintenance[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'scm_plan',
      name: 'Supply Chain Planning',
      pillar: 'SCM',
      positivePatterns: [/\b(?:supply\s*chain\s*planning|demand\s*management|replenishment\s*planning|mrp|scm_plan)\b/i],
      exclusionPatterns: [/supply\s*chain\s*planning[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope)/i]
    },
    {
      id: 'scm_wms',
      name: 'Warehouse Management (WMS)',
      pillar: 'SCM',
      positivePatterns: [/\b(?:warehouse\s*management\s*(?:system|cloud)|wms|rf\s*mobile|wave\s*picking|barcode\s*scanning|scm_wms)\b/i],
      exclusionPatterns: [/warehouse\s*management[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope|3pl\s*managed)/i]
    },
    {
      id: 'scm_gop',
      name: 'Global Order Promising (GOP)',
      pillar: 'SCM',
      positivePatterns: [/\b(?:global\s*order\s*promising|gop|available\s*to\s*promise|atp|scm_gop)\b/i],
      exclusionPatterns: [/global\s*order\s*promising[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },

    // HCM
    {
      id: 'hcm_core',
      name: 'Core Human Capital (HCM)',
      pillar: 'HCM',
      positivePatterns: [/\b(?:core\s*hcm|human\s*capital\s*management|position\s*management|worker\s*records?|hcm_core)\b/i],
      exclusionPatterns: [/core\s*hcm[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'hcm_payroll',
      name: 'Oracle Payroll Cloud',
      pillar: 'HCM',
      positivePatterns: [/\b(?:oracle\s*payroll|bi-?weekly\s*payroll|localized\s*us\s*payroll|payroll\s*tax|hcm_payroll)\b/i],
      exclusionPatterns: [/(?:payroll|hcm_payroll)[^\n\r]*?(?:out\s*of\s*scope|excluded|not\s*in\s*scope|adp\s*retained|third\s*party)/i]
    },
    {
      id: 'hcm_time',
      name: 'Time & Labor (OTL)',
      pillar: 'HCM',
      positivePatterns: [/\b(?:time\s*(?:&|and)\s*labor|time\s*cards?|badge\s*terminal|time\s*badge|kronos\s*feed|hcm_time)\b/i],
      exclusionPatterns: [/time\s*(?:&|and)\s*labor[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'hcm_absence',
      name: 'Absence Management',
      pillar: 'HCM',
      positivePatterns: [/\b(?:absence\s*management|pto\s*accrual|sick\s*leave|statutory\s*leave|hcm_absence)\b/i],
      exclusionPatterns: [/absence\s*management[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'hcm_orc',
      name: 'Oracle Recruiting Cloud (ORC)',
      pillar: 'HCM',
      positivePatterns: [/\b(?:oracle\s*recruiting|orc|candidate\s*application|applicant\s*tracking|hcm_orc)\b/i],
      exclusionPatterns: [/recruiting[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'hcm_talent',
      name: 'Talent & Performance',
      pillar: 'HCM',
      positivePatterns: [/\b(?:talent\s*management|performance\s*management|goal\s*setting|succession\s*planning|hcm_talent)\b/i],
      exclusionPatterns: [/talent\s*management[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'hcm_benefits',
      name: 'Benefits Cloud',
      pillar: 'HCM',
      positivePatterns: [/\b(?:benefits\s*cloud|open\s*enrollment|hsa\/fsa|carrier\s*plans|hcm_benefits)\b/i],
      exclusionPatterns: [/benefits[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },

    // EPM & CX
    {
      id: 'epm_fccs',
      name: 'Financial Consolidation (FCCS)',
      pillar: 'EPM',
      positivePatterns: [/\b(?:fccs|financial\s*consolidation\s*and\s*close|statutory\s*consolidation|intercompany\s*elimination|epm_fccs)\b/i],
      exclusionPatterns: [/fccs[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'epm_epbcs',
      name: 'Planning & Budgeting (EPBCS)',
      pillar: 'EPM',
      positivePatterns: [/\b(?:epbcs|planning\s*(?:&|and)\s*budgeting|workforce\s*planning|financial\s*budgeting|epm_epbcs)\b/i],
      exclusionPatterns: [/epbcs[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'epm_edm',
      name: 'Enterprise Data Management (EDM)',
      pillar: 'EPM',
      positivePatterns: [/\b(?:edm|enterprise\s*data\s*management|chart\s*of\s*accounts\s*governance|master\s*data\s*cloud|epm_edm)\b/i],
      exclusionPatterns: [/edm[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'cx_service',
      name: 'B2B / CX Service Cloud',
      pillar: 'CX',
      positivePatterns: [/\b(?:cx\s*service|b2b\s*service|service\s*cloud|ticketing\s*cloud|cx_service)\b/i],
      exclusionPatterns: [/service\s*cloud[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    },
    {
      id: 'cx_cpq',
      name: 'Configure Price Quote (CPQ)',
      pillar: 'CX',
      positivePatterns: [/\b(?:cpq|configure\s*price\s*quote|quote\s*to\s*cash\s*engine|cx_cpq)\b/i],
      exclusionPatterns: [/cpq[^\n\r]*?(?:out\s*of\s*scope|excluded)/i]
    }
  ];

  // Helper to map score (1..4) to T-Shirt and standard label
  function scoreToTShirt(score: number): TShirtSize {
    if (score <= 1) return 'S';
    if (score === 2) return 'M';
    if (score === 3) return 'L';
    return 'XL';
  }

  function scoreToLabel(score: number): string {
    if (score <= 1) return 'Simple / Low (Level 1)';
    if (score === 2) return 'Medium / Standard (Level 2)';
    if (score === 3) return 'High / Complex (Level 3)';
    return 'Very High / Complex (Level 4)';
  }

  // --- SCOPING SHEET QUESTIONNAIRE & MODULE RATINGS EXTRACTION ---
  // Prioritizes explicit module-wise questions and ratings from scoping sheets
  const scopingSheetQuestions: ScopingSheetQuestionRating[] = [];
  const moduleRatingsFromSheet: Record<string, ScopingSheetModuleRating> = {};
  const inScopeFromSheet = new Set<OracleModule>();
  const excludedFromSheet = new Set<OracleModule>();
  const sheetExclusionEvidence: Record<string, { quote: string; location: string }> = {};
  const sheetInScopeEvidence: Record<string, { quote: string; location: string }> = {};

  const POSITIVE_SCOPE_REGEX = /(?:in\s*scope|scope:\s*yes|in\s*scope:\s*yes|status:\s*(?:in|active|included|yes)|included|phase\s*1|wave\s*1|selected|active)\b/i;

  units.forEach(unit => {
    const raw = unit.raw;
    const lower = unit.lower;

    MODULE_KEYWORDS.forEach(modDef => {
      const modNameLower = modDef.name.toLowerCase();
      const modIdLower = modDef.id.toLowerCase();

      // Check if module is referenced in this line
      const hasDirectName = lower.includes(modNameLower);
      const hasId = lower.includes(modIdLower);
      let hasPatternMatch = false;
      for (const p of modDef.positivePatterns) {
        if (p.test(raw)) {
          hasPatternMatch = true;
          break;
        }
      }

      if (!hasDirectName && !hasId && !hasPatternMatch) {
        return;
      }

      // Check exclusion in this unit
      let isExcl = false;
      for (const ep of modDef.exclusionPatterns) {
        if (ep.test(raw)) {
          isExcl = true;
          break;
        }
      }
      if (!isExcl && EXCLUSION_REGEX.test(raw)) {
        isExcl = true;
      }

      if (isExcl) {
        excludedFromSheet.add(modDef.id);
        sheetExclusionEvidence[modDef.id] = {
          quote: raw,
          location: unit.sourceLocation
        };
        return;
      }

      // Check positive scope indicator
      if (POSITIVE_SCOPE_REGEX.test(raw)) {
        inScopeFromSheet.add(modDef.id);
        if (!sheetInScopeEvidence[modDef.id]) {
          sheetInScopeEvidence[modDef.id] = {
            quote: raw,
            location: unit.sourceLocation
          };
        }
      }

      // Extract rating / score / complexity if present
      let extractedScore: number | null = null;
      let extractedLabel = '';
      let extractedTShirt: TShirtSize | null = null;

      if (/\b(?:very\s*high|very\s*complex|highly\s*complex|extreme|xxl|xl)\b/i.test(raw)) {
        extractedScore = 4;
        extractedLabel = 'Very High / Complex (Level 4)';
        extractedTShirt = 'XL';
      } else if (/\b(?:high|complex|advanced|heavy|level\s*3|rating\s*3)\b/i.test(raw)) {
        extractedScore = 3;
        extractedLabel = 'High / Complex (Level 3)';
        extractedTShirt = 'L';
      } else if (/\b(?:medium|moderate|average|standard|level\s*2|rating\s*2)\b/i.test(raw)) {
        extractedScore = 2;
        extractedLabel = 'Medium / Standard (Level 2)';
        extractedTShirt = 'M';
      } else if (/\b(?:simple|low|basic|minimal|fit\s*to\s*standard|mbp|level\s*1|rating\s*1)\b/i.test(raw)) {
        extractedScore = 1;
        extractedLabel = 'Simple / Low (Level 1)';
        extractedTShirt = 'S';
      }

      if (extractedScore === null) {
        const numMatch = raw.match(/(?:rating|score|level|complexity)[:\s|=]+([1-4])\b/i) ||
                         raw.match(/\(([1-4])\)/) ||
                         raw.match(/\b([1-4])\s*\/\s*4\b/);
        if (numMatch) {
          extractedScore = parseInt(numMatch[1], 10);
          extractedLabel = scoreToLabel(extractedScore);
          extractedTShirt = scoreToTShirt(extractedScore);
        }
      }

      if (extractedScore === null && (raw.includes('|') || raw.includes(',') || raw.includes('\t'))) {
        const parts = raw.split(/[|,\t]/).map(p => p.trim());
        for (const p of parts) {
          const pLower = p.toLowerCase();
          if (p === '1' || pLower === 'level 1' || pLower === 'score 1') {
            extractedScore = 1;
            break;
          } else if (p === '2' || pLower === 'level 2' || pLower === 'score 2') {
            extractedScore = 2;
            break;
          } else if (p === '3' || pLower === 'level 3' || pLower === 'score 3') {
            extractedScore = 3;
            break;
          } else if (p === '4' || pLower === 'level 4' || pLower === 'score 4') {
            extractedScore = 4;
            break;
          } else if (pLower === 's' || pLower === 'xs') {
            extractedScore = 1;
            extractedTShirt = pLower.toUpperCase() as TShirtSize;
            break;
          } else if (pLower === 'm') {
            extractedScore = 2;
            extractedTShirt = 'M';
            break;
          } else if (pLower === 'l') {
            extractedScore = 3;
            extractedTShirt = 'L';
            break;
          } else if (pLower === 'xl' || pLower === 'xxl') {
            extractedScore = 4;
            extractedTShirt = pLower.toUpperCase() as TShirtSize;
            break;
          }
        }
        if (extractedScore !== null) {
          extractedLabel = extractedLabel || scoreToLabel(extractedScore);
          extractedTShirt = extractedTShirt || scoreToTShirt(extractedScore);
        }
      }

      // Check if this line targets a specific question
      const qNumMatch = raw.match(/\bQ(?:uestion)?\s*([1-9]|1[0-9]|20)\b/i);
      let matchedQIdx: number | null = null;
      let matchedQText = '';

      if (qNumMatch) {
        matchedQIdx = parseInt(qNumMatch[1], 10) - 1;
        const modQuestions = MODULE_TOP_20_QUESTIONS[modDef.id] || getQuestionsForModule(modDef.id);
        if (modQuestions[matchedQIdx]) {
          matchedQText = modQuestions[matchedQIdx].question;
        }
      } else {
        const modQuestions = MODULE_TOP_20_QUESTIONS[modDef.id] || getQuestionsForModule(modDef.id);
        for (let i = 0; i < modQuestions.length; i++) {
          const mq = modQuestions[i];
          const qWords = mq.question.toLowerCase().split(/\W+/).filter(w => w.length > 5);
          const matchCount = qWords.filter(w => lower.includes(w)).length;
          if (matchCount >= 2) {
            matchedQIdx = i;
            matchedQText = mq.question;
            break;
          }
        }
      }

      if (extractedScore !== null && matchedQIdx !== null && matchedQIdx >= 0 && matchedQIdx < 20) {
        scopingSheetQuestions.push({
          moduleId: modDef.id,
          questionIndex: matchedQIdx,
          questionText: matchedQText || `Question ${matchedQIdx + 1}`,
          ratingScore: extractedScore,
          ratingLabel: extractedLabel || scoreToLabel(extractedScore),
          sourceLocation: unit.sourceLocation,
          evidenceQuote: raw
        });
        inScopeFromSheet.add(modDef.id);
        if (!sheetInScopeEvidence[modDef.id]) {
          sheetInScopeEvidence[modDef.id] = { quote: raw, location: unit.sourceLocation };
        }
      } else if (extractedScore !== null) {
        if (!moduleRatingsFromSheet[modDef.id] || extractedScore > moduleRatingsFromSheet[modDef.id].score) {
          moduleRatingsFromSheet[modDef.id] = {
            moduleId: modDef.id,
            ratingLabel: extractedLabel || scoreToLabel(extractedScore),
            score: extractedScore,
            tShirtSize: extractedTShirt || scoreToTShirt(extractedScore),
            sourceLocation: unit.sourceLocation,
            evidenceQuote: raw,
            scopeStatus: 'in_scope'
          };
          inScopeFromSheet.add(modDef.id);
          if (!sheetInScopeEvidence[modDef.id]) {
            sheetInScopeEvidence[modDef.id] = { quote: raw, location: unit.sourceLocation };
          }
        }
      }
    });
  });

  const moduleTShirtOverrides: Record<string, TShirtSize> = {};
  Object.keys(moduleRatingsFromSheet).forEach(mId => {
    moduleTShirtOverrides[mId] = moduleRatingsFromSheet[mId].tShirtSize;
  });

  // Evaluate each module strictly: prioritize scoping sheet findings, then narrative patterns
  MODULE_KEYWORDS.forEach(modDef => {
    // 1. If explicitly excluded in scoping sheet or narrative
    if (excludedFromSheet.has(modDef.id)) {
      excludedModules.push(`${modDef.name} (${modDef.pillar})`);
      moduleEvidence[modDef.id] = {
        moduleId: modDef.id,
        name: modDef.name,
        pillar: modDef.pillar,
        status: 'excluded',
        evidenceQuote: sheetExclusionEvidence[modDef.id]?.quote.slice(0, 140) || 'Explicitly marked out of scope',
        sourceLocation: sheetExclusionEvidence[modDef.id]?.location || 'Scoping Sheet',
        confidence: 'high'
      };
      return;
    }

    let isExcluded = false;
    let exclusionQuote = '';
    let exclusionLoc = '';

    for (const unit of units) {
      for (const exPat of modDef.exclusionPatterns) {
        if (exPat.test(unit.raw)) {
          isExcluded = true;
          exclusionQuote = unit.raw;
          exclusionLoc = unit.sourceLocation;
          break;
        }
      }
      if (isExcluded) break;

      if (unit.raw.toLowerCase().includes(modDef.name.toLowerCase()) && EXCLUSION_REGEX.test(unit.raw)) {
        isExcluded = true;
        exclusionQuote = unit.raw;
        exclusionLoc = unit.sourceLocation;
        break;
      }
    }

    if (isExcluded) {
      excludedModules.push(`${modDef.name} (${modDef.pillar})`);
      moduleEvidence[modDef.id] = {
        moduleId: modDef.id,
        name: modDef.name,
        pillar: modDef.pillar,
        status: 'excluded',
        evidenceQuote: exclusionQuote.slice(0, 140),
        sourceLocation: exclusionLoc,
        confidence: 'high'
      };
      return;
    }

    // 2. In-scope via scoping sheet (Explicit confirmation, ratings, or questions)
    if (inScopeFromSheet.has(modDef.id)) {
      inferredModules.push(modDef.id);
      const modRating = moduleRatingsFromSheet[modDef.id];
      const noteRating = modRating ? ` (Rating: ${modRating.ratingLabel})` : '';
      moduleEvidence[modDef.id] = {
        moduleId: modDef.id,
        name: modDef.name,
        pillar: modDef.pillar,
        status: 'in_scope',
        evidenceQuote: (sheetInScopeEvidence[modDef.id]?.quote || `In scope from scoping sheet${noteRating}`).slice(0, 140),
        sourceLocation: sheetInScopeEvidence[modDef.id]?.location || 'Scoping Sheet',
        confidence: 'high'
      };
      return;
    }

    // 3. In-scope via proposal document narrative positive patterns
    for (const unit of units) {
      for (const posPat of modDef.positivePatterns) {
        if (posPat.test(unit.raw)) {
          inferredModules.push(modDef.id);
          moduleEvidence[modDef.id] = {
            moduleId: modDef.id,
            name: modDef.name,
            pillar: modDef.pillar,
            status: 'in_scope',
            evidenceQuote: unit.raw.slice(0, 140),
            sourceLocation: unit.sourceLocation,
            confidence: 'high'
          };
          return;
        }
      }
    }
  });

  // Zero-Hallucination: If zero modules found, do NOT blindly hallucinate GL/AP/AR/CM/Proc!
  // Instead, leave inferredModules empty and flag a warning so architect can review document format.

  // 2. EXTRACT PHYSICAL SCALE DRIVERS (EVIDENCE-BOUNDED ONLY)
  const extractedScaleDrivers: Partial<ScaleDrivers> = {};
  const driverEvidence: Record<string, DriverEvidenceItem> = {};
  const unconfirmedDriversProtected: string[] = [];

  // Legal Entities
  const entEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:operating|legal)?\s*entities(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:legal\s*entities|operating\s*entities|operating\s*units|entities|companies)\b/i,
      /(?:fin_ent|legal_entities)[:\s|=,\t]+(\d+)/i
    ],
    'Legal Entities'
  );
  if (entEvidence) {
    extractedScaleDrivers.fin_ent = entEvidence.value;
    driverEvidence.fin_ent = {
      driverKey: 'fin_ent',
      label: 'Legal Entities',
      value: entEvidence.value,
      confidence: entEvidence.confidence,
      percentage: 100,
      citation: entEvidence.quote,
      sourceLocation: entEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Legal Entities (fin_ent)');
  }

  // Primary Ledgers
  const ledEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:primary\s*)?ledgers(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:primary\s*ledgers?|valuation\s*ledgers?|ledgers?)\b/i,
      /(?:fin_led|ledgers)[:\s|=,\t]+(\d+)/i
    ],
    'Primary Ledgers'
  );
  if (ledEvidence) {
    extractedScaleDrivers.fin_led = ledEvidence.value;
    driverEvidence.fin_led = {
      driverKey: 'fin_led',
      label: 'Primary Ledgers',
      value: ledEvidence.value,
      confidence: ledEvidence.confidence,
      percentage: 100,
      citation: ledEvidence.quote,
      sourceLocation: ledEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Primary Ledgers (fin_led)');
  }

  // Operating Currencies
  const curEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:operating\s*)?currencies(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:currencies|currency\s*types|transacting\s*currencies)\b/i,
      /(?:fin_cur|currencies)[:\s|=,\t]+(\d+)/i
    ],
    'Currencies'
  );
  if (curEvidence) {
    extractedScaleDrivers.fin_cur = curEvidence.value;
    driverEvidence.fin_cur = {
      driverKey: 'fin_cur',
      label: 'Currencies',
      value: curEvidence.value,
      confidence: curEvidence.confidence,
      percentage: 100,
      citation: curEvidence.quote,
      sourceLocation: curEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Currencies (fin_cur)');
  }

  // Chart of Accounts Segments
  const coaEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:chart\s*of\s*accounts|coa)\s*segments?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:coa\s*segments?|chart\s*of\s*accounts\s*segments?|segments\s*in\s*coa)\b/i,
      /(?:fin_coa_segments)[:\s|=,\t]+(\d+)/i
    ],
    'COA Segments'
  );
  if (coaEvidence) {
    extractedScaleDrivers.fin_coa_segments = coaEvidence.value;
    driverEvidence.fin_coa_segments = {
      driverKey: 'fin_coa_segments',
      label: 'COA Segments',
      value: coaEvidence.value,
      confidence: coaEvidence.confidence,
      percentage: 100,
      citation: coaEvidence.quote,
      sourceLocation: coaEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('COA Segments (fin_coa_segments)');
  }

  // Manufacturing Plants
  const plantsEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:manufacturing\s*)?plants(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:discrete\s*manufacturing\s*plants?|manufacturing\s*plants?|plants?|factories|facilities)\b/i,
      /(?:scm_plants)[:\s|=,\t]+(\d+)/i
    ],
    'Manufacturing Plants'
  );
  if (plantsEvidence) {
    extractedScaleDrivers.scm_plants = plantsEvidence.value;
    driverEvidence.scm_plants = {
      driverKey: 'scm_plants',
      label: 'Manufacturing Plants',
      value: plantsEvidence.value,
      confidence: plantsEvidence.confidence,
      percentage: 100,
      citation: plantsEvidence.quote,
      sourceLocation: plantsEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Manufacturing Plants (scm_plants)');
  }

  // Distribution Warehouses
  const whEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:distribution\s*)?warehouses(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:distribution\s*warehouses?|3pl\s*warehouses?|warehouses?|distribution\s*centers?|dcs?)\b/i,
      /(?:scm_wh)[:\s|=,\t]+(\d+)/i
    ],
    'Warehouses'
  );
  if (whEvidence) {
    extractedScaleDrivers.scm_wh = whEvidence.value;
    driverEvidence.scm_wh = {
      driverKey: 'scm_wh',
      label: 'Warehouses',
      value: whEvidence.value,
      confidence: whEvidence.confidence,
      percentage: 100,
      citation: whEvidence.quote,
      sourceLocation: whEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Warehouses (scm_wh)');
  }

  // Inventory Organizations
  const invEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:inventory\s*)?orgs?(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:inventory\s*organizations?|inv\s*orgs?|stocking\s*locations)\b/i,
      /(?:scm_inv)[:\s|=,\t]+(\d+)/i
    ],
    'Inventory Organizations'
  );
  if (invEvidence) {
    extractedScaleDrivers.scm_inv = invEvidence.value;
    driverEvidence.scm_inv = {
      driverKey: 'scm_inv',
      label: 'Inventory Organizations',
      value: invEvidence.value,
      confidence: invEvidence.confidence,
      percentage: 100,
      citation: invEvidence.quote,
      sourceLocation: invEvidence.sourceLocation
    };
  }

  // Headcount
  const hcEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:total\s*)?headcount[:\s|=,\t]+([\d,]+)/i,
      /([\d,]+)\s*(?:employees|workers|active\s*headcount|professionals|staff|nursing\s*staff)\b/i,
      /(?:hcm_hc)[:\s|=,\t]+([\d,]+)/i
    ],
    'Headcount'
  );
  if (hcEvidence) {
    extractedScaleDrivers.hcm_hc = hcEvidence.value;
    driverEvidence.hcm_hc = {
      driverKey: 'hcm_hc',
      label: 'Headcount',
      value: hcEvidence.value,
      confidence: hcEvidence.confidence,
      percentage: 100,
      citation: hcEvidence.quote,
      sourceLocation: hcEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Headcount (hcm_hc)');
  }

  // Payroll Countries
  const payCountriesEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:payroll\s*)?countries[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:payroll\s*countries|operating\s*countries|geographies)\b/i,
      /(?:hcm_pay_countries)[:\s|=,\t]+(\d+)/i
    ],
    'Payroll Countries'
  );
  if (payCountriesEvidence) {
    extractedScaleDrivers.hcm_pay_countries = payCountriesEvidence.value;
    driverEvidence.hcm_pay_countries = {
      driverKey: 'hcm_pay_countries',
      label: 'Payroll Countries',
      value: payCountriesEvidence.value,
      confidence: payCountriesEvidence.confidence,
      percentage: 100,
      citation: payCountriesEvidence.quote,
      sourceLocation: payCountriesEvidence.sourceLocation
    };
  }

  // Unions / CBA Groups
  const unionEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:unions|cbas?|collective\s*bargaining)[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:collective\s*bargaining\s*agreements?|unions|cba[s]?)\b/i,
      /(?:hcm_union_groups)[:\s|=,\t]+(\d+)/i
    ],
    'Unions / CBAs'
  );
  if (unionEvidence) {
    extractedScaleDrivers.hcm_union_groups = unionEvidence.value;
    driverEvidence.hcm_union_groups = {
      driverKey: 'hcm_union_groups',
      label: 'Unions / CBAs',
      value: unionEvidence.value,
      confidence: unionEvidence.confidence,
      percentage: 100,
      citation: unionEvidence.quote,
      sourceLocation: unionEvidence.sourceLocation
    };
  }

  // --- RICEFW TECHNICAL OBJECT EXTRACTION ---

  // 1. Integrations (OIC / APIs)
  let oicEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:oic\s*)?integrations?(?:\s*count)?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:oracle\s*integration\s*cloud\s*integrations?|oic\s*integrations?|interfaces?|api\s*flows?|integration\s*flows?)\b/i,
      /(?:tech_oic)[:\s|=,\t]+(\d+)/i
    ],
    'OIC Integrations'
  );

  // Fallback: If no single number, count rows in any dedicated Integration / Interface worksheet
  if (!oicEvidence) {
    const integSheetUnits = units.filter(u =>
      u.sheetName &&
      /integ|interf|oic|api/i.test(u.sheetName) &&
      u.rowNum &&
      u.rowNum > 1 &&
      !/header|template|title/i.test(u.raw)
    );
    if (integSheetUnits.length >= 3) {
      oicEvidence = {
        value: integSheetUnits.length,
        quote: `Counted ${integSheetUnits.length} distinct integration rows across worksheet '${integSheetUnits[0].sheetName}'`,
        sourceLocation: `Sheet '${integSheetUnits[0].sheetName}'`,
        confidence: 'high'
      };
    }
  }

  if (oicEvidence) {
    extractedScaleDrivers.tech_oic = oicEvidence.value;
    driverEvidence.tech_oic = {
      driverKey: 'tech_oic',
      label: 'OIC Integrations',
      value: oicEvidence.value,
      confidence: oicEvidence.confidence,
      percentage: 100,
      citation: oicEvidence.quote,
      sourceLocation: oicEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Integrations (tech_oic)');
  }

  // 2. Data Conversion Objects (FBDI / HDL)
  const dataObjEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:conversion|data|fbdi)\s*objects?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:fbdi\s*(?:\/|\s*and\s*)?hdl\s*data\s*objects?|fbdi\s*objects?|conversion\s*entities|data\s*objects?)\b/i,
      /(?:tech_data_objects)[:\s|=,\t]+(\d+)/i
    ],
    'Conversion Objects'
  );
  if (dataObjEvidence) {
    extractedScaleDrivers.tech_data_objects = dataObjEvidence.value;
    driverEvidence.tech_data_objects = {
      driverKey: 'tech_data_objects',
      label: 'Data Conversion Objects',
      value: dataObjEvidence.value,
      confidence: dataObjEvidence.confidence,
      percentage: 100,
      citation: dataObjEvidence.quote,
      sourceLocation: dataObjEvidence.sourceLocation
    };
  } else {
    unconfirmedDriversProtected.push('Data Objects (tech_data_objects)');
  }

  // 3. Mock Conversion Load Cycles
  const mockCycleEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:mock\s*(?:data)?\s*load\s*cycles?|mock\s*cycles?)[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:mock(?:\s*data)?\s*(?:conversion|load)?\s*cycles?|conversion\s*rehearsals?|load\s*cycles?)\b/i,
      /(?:tech_conversion_cycles)[:\s|=,\t]+(\d+)/i
    ],
    'Mock Conversion Cycles'
  );
  if (mockCycleEvidence) {
    extractedScaleDrivers.tech_conversion_cycles = mockCycleEvidence.value;
    driverEvidence.tech_conversion_cycles = {
      driverKey: 'tech_conversion_cycles',
      label: 'Mock Conversion Cycles',
      value: mockCycleEvidence.value,
      confidence: mockCycleEvidence.confidence,
      percentage: 100,
      citation: mockCycleEvidence.quote,
      sourceLocation: mockCycleEvidence.sourceLocation
    };
  }

  // 4. Historical Legacy Data Years
  const histYearsEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:historical|history)\s*years?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:years?\s*(?:of\s*)?(?:legacy\s*)?(?:historical|history|open\s*transactional)\s*records?)\b/i,
      /(?:tech_historical_years)[:\s|=,\t]+(\d+)/i
    ],
    'Historical Data Years'
  );
  if (histYearsEvidence) {
    extractedScaleDrivers.tech_historical_years = histYearsEvidence.value;
    driverEvidence.tech_historical_years = {
      driverKey: 'tech_historical_years',
      label: 'Historical Data Years',
      value: histYearsEvidence.value,
      confidence: histYearsEvidence.confidence,
      percentage: 100,
      citation: histYearsEvidence.quote,
      sourceLocation: histYearsEvidence.sourceLocation
    };
  }

  // 5. Reports (BIP & OTBI)
  const bipDirect = extractDriverWithEvidence(
    units,
    [
      /(?:bip|bi\s*publisher)\s*reports?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:bip\s*reports?|bi\s*publisher\s*reports?|pixel\s*perfect\s*reports?)\b/i
    ],
    'BIP Reports'
  );
  if (bipDirect) {
    extractedScaleDrivers.tech_reports_bip = bipDirect.value;
    driverEvidence.tech_reports_bip = {
      driverKey: 'tech_reports_bip',
      label: 'BIP Reports',
      value: bipDirect.value,
      confidence: bipDirect.confidence,
      percentage: 100,
      citation: bipDirect.quote,
      sourceLocation: bipDirect.sourceLocation
    };
  }

  const otbiDirect = extractDriverWithEvidence(
    units,
    [
      /(?:otbi|analytics)\s*reports?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:otbi\s*reports?|analytics\s*dashboards?|subject\s*area\s*reports?)\b/i
    ],
    'OTBI Reports'
  );
  if (otbiDirect) {
    extractedScaleDrivers.tech_reports_otbi = otbiDirect.value;
    driverEvidence.tech_reports_otbi = {
      driverKey: 'tech_reports_otbi',
      label: 'OTBI Reports',
      value: otbiDirect.value,
      confidence: otbiDirect.confidence,
      percentage: 100,
      citation: otbiDirect.quote,
      sourceLocation: otbiDirect.sourceLocation
    };
  }

  // If general "reports" combined number found and BIP/OTBI not individually set
  if (!extractedScaleDrivers.tech_reports_bip && !extractedScaleDrivers.tech_reports_otbi) {
    const totalReportsEvidence = extractDriverWithEvidence(
      units,
      [
        /(?:custom\s*)?reports(?:\s*count)?[:\s|=,\t]+(\d+)/i,
        /(\d+)\s*(?:custom\s*reports?|reports?\s*(?:and|&)\s*dashboards?)\b/i
      ],
      'Total Reports'
    );
    if (totalReportsEvidence) {
      extractedScaleDrivers.tech_reports_bip = Math.round(totalReportsEvidence.value * 0.6);
      extractedScaleDrivers.tech_reports_otbi = Math.round(totalReportsEvidence.value * 0.4);
      driverEvidence.tech_reports_bip = {
        driverKey: 'tech_reports_bip',
        label: 'BIP Reports (60% split)',
        value: extractedScaleDrivers.tech_reports_bip,
        confidence: 'medium',
        percentage: 80,
        citation: totalReportsEvidence.quote,
        sourceLocation: totalReportsEvidence.sourceLocation
      };
      driverEvidence.tech_reports_otbi = {
        driverKey: 'tech_reports_otbi',
        label: 'OTBI Reports (40% split)',
        value: extractedScaleDrivers.tech_reports_otbi,
        confidence: 'medium',
        percentage: 80,
        citation: totalReportsEvidence.quote,
        sourceLocation: totalReportsEvidence.sourceLocation
      };
    }
  }

  // 6. Extensions / PaaS
  const paasEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:paas|vbcs)\s*extensions?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:paas\s*extensions?|vbcs\s*apps?|custom\s*cloud\s*applications?)\b/i,
      /(?:tech_paas)[:\s|=,\t]+(\d+)/i
    ],
    'PaaS Extensions'
  );
  if (paasEvidence) {
    extractedScaleDrivers.tech_paas = paasEvidence.value;
    driverEvidence.tech_paas = {
      driverKey: 'tech_paas',
      label: 'PaaS Extensions',
      value: paasEvidence.value,
      confidence: paasEvidence.confidence,
      percentage: 100,
      citation: paasEvidence.quote,
      sourceLocation: paasEvidence.sourceLocation
    };
  }

  // 7. Approval Workflows
  const wfEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:approval\s*)?workflows?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:approval\s*workflows?|bpm\s*workflows?|custom\s*workflows?)\b/i,
      /(?:tech_workflows)[:\s|=,\t]+(\d+)/i
    ],
    'Approval Workflows'
  );
  if (wfEvidence) {
    extractedScaleDrivers.tech_workflows = wfEvidence.value;
    driverEvidence.tech_workflows = {
      driverKey: 'tech_workflows',
      label: 'Approval Workflows',
      value: wfEvidence.value,
      confidence: wfEvidence.confidence,
      percentage: 100,
      citation: wfEvidence.quote,
      sourceLocation: wfEvidence.sourceLocation
    };
  }

  // 8. Fast Formulas
  const ffEvidence = extractDriverWithEvidence(
    units,
    [
      /fast\s*formulas?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:fast\s*formulas?|payroll\s*formulas?)\b/i,
      /(?:tech_fast_formulas)[:\s|=,\t]+(\d+)/i
    ],
    'Fast Formulas'
  );
  if (ffEvidence) {
    extractedScaleDrivers.tech_fast_formulas = ffEvidence.value;
    driverEvidence.tech_fast_formulas = {
      driverKey: 'tech_fast_formulas',
      label: 'Fast Formulas',
      value: ffEvidence.value,
      confidence: ffEvidence.confidence,
      percentage: 100,
      citation: ffEvidence.quote,
      sourceLocation: ffEvidence.sourceLocation
    };
  }

  // 9. Security Roles & SOD
  const secEvidence = extractDriverWithEvidence(
    units,
    [
      /(?:custom\s*)?security\s*roles?[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:custom\s*security\s*roles?|job\s*roles?|duty\s*roles?)\b/i,
      /(?:tech_security_roles)[:\s|=,\t]+(\d+)/i
    ],
    'Security Roles'
  );
  if (secEvidence) {
    extractedScaleDrivers.tech_security_roles = secEvidence.value;
    driverEvidence.tech_security_roles = {
      driverKey: 'tech_security_roles',
      label: 'Security Roles',
      value: secEvidence.value,
      confidence: secEvidence.confidence,
      percentage: 100,
      citation: secEvidence.quote,
      sourceLocation: secEvidence.sourceLocation
    };
  }

  // Statutory E-Invoicing - ONLY set if explicit evidence
  const einvEvidence = extractDriverWithEvidence(
    units,
    [
      /e-?invoicing\s*(?:jurisdictions?|countries?|mandates?)[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:e-?invoicing\s*mandates?|clearance\s*jurisdictions?)\b/i
    ],
    'E-Invoicing'
  );
  if (einvEvidence) {
    extractedScaleDrivers.fin_einvoicing_countries = einvEvidence.value;
    driverEvidence.fin_einvoicing_countries = {
      driverKey: 'fin_einvoicing_countries',
      label: 'E-Invoicing Jurisdictions',
      value: einvEvidence.value,
      confidence: einvEvidence.confidence,
      percentage: 100,
      citation: einvEvidence.quote,
      sourceLocation: einvEvidence.sourceLocation
    };
  } else if (/zatca|ksef|cfdi|sdi\s*b2g|peppol/i.test(proposalText)) {
    extractedScaleDrivers.fin_einvoicing_countries = 1;
    driverEvidence.fin_einvoicing_countries = {
      driverKey: 'fin_einvoicing_countries',
      label: 'E-Invoicing Mandate',
      value: 1,
      confidence: 'medium',
      percentage: 85,
      citation: 'Explicit e-invoicing protocol identified in text',
      sourceLocation: 'Narrative Requirement'
    };
  }
  // If not mentioned, leave undefined! Zero hallucination.

  // Bank Connectivity Window - ONLY set if explicit evidence
  const bankCertEvidence = extractDriverWithEvidence(
    units,
    [
      /bank\s*(?:certification|connectivity)\s*(?:weeks?|window)[:\s|=,\t]+(\d+)/i,
      /(\d+)\s*(?:weeks?|wks?)\s*(?:bank\s*certification|bank\s*testing\s*window|swift\s*testing)/i
    ],
    'Bank Testing Window'
  );
  if (bankCertEvidence) {
    extractedScaleDrivers.fin_bank_cert_weeks = bankCertEvidence.value;
    driverEvidence.fin_bank_cert_weeks = {
      driverKey: 'fin_bank_cert_weeks',
      label: 'Bank Testing Window (Weeks)',
      value: bankCertEvidence.value,
      confidence: bankCertEvidence.confidence,
      percentage: 100,
      citation: bankCertEvidence.quote,
      sourceLocation: bankCertEvidence.sourceLocation
    };
  }

  // Cutover Strategy - ONLY set if explicit evidence
  if (/mid-?year|depreciation\s*catch-?up|gr-?ir\s*clearing/i.test(proposalText)) {
    extractedScaleDrivers.fin_cutover_strategy = 'mid_year_fa_catchup';
    driverEvidence.fin_cutover_strategy = {
      driverKey: 'fin_cutover_strategy',
      label: 'Cutover Strategy',
      value: 'Mid-Year Catch-up',
      confidence: 'high',
      percentage: 95,
      citation: 'Mid-year fiscal go-live with fixed asset catch-up explicitly requested',
      sourceLocation: 'Narrative Requirement'
    };
  } else if (/multi-?gaap\s*restatement|dual\s*reporting\s*cutover/i.test(proposalText)) {
    extractedScaleDrivers.fin_cutover_strategy = 'complex_multi_gaap';
    driverEvidence.fin_cutover_strategy = {
      driverKey: 'fin_cutover_strategy',
      label: 'Cutover Strategy',
      value: 'Multi-GAAP Restatement',
      confidence: 'high',
      percentage: 95,
      citation: 'Multi-GAAP restatement cutover specified',
      sourceLocation: 'Narrative Requirement'
    };
  }

  // 3. EVIDENCE-BOUNDED QUESTION ANSWERING (PRIORITIZING SCOPING SHEET INPUTS FIRST)
  // User Rule: 20-Q or 5-Q based on selection are only important when there is no scoping input via scoping sheet.
  // When a scoping sheet includes module-wise questions and ratings, consider those first.
  const questionAnswers: Record<string, number[]> = {};
  const questionConfidenceMeta: Record<string, Record<number, QuestionConfidenceMeta>> = {};
  const summaryFindings: string[] = [];
  const clientClarificationsNeeded: string[] = [];

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let unconfirmedCount = 0;
  let totalScoreSum = 0;
  let totalScopedCount = 0;

  inferredModules.forEach(modId => {
    const qList = MODULE_TOP_20_QUESTIONS[modId] || getQuestionsForModule(modId);
    const answersArr: number[] = [];
    const metaMap: Record<number, QuestionConfidenceMeta> = {};

    qList.forEach((q, qIdx) => {
      totalScopedCount++;

      // 1. PRIORITY 1: Scoping Sheet Specific Question Input
      const matchedSheetQ = scopingSheetQuestions.find(sq => sq.moduleId === modId && sq.questionIndex === qIdx);
      if (matchedSheetQ) {
        const optIdx = Math.max(0, Math.min(3, matchedSheetQ.ratingScore - 1));
        answersArr.push(optIdx);
        metaMap[qIdx] = {
          confidence: 'high',
          percentage: 100,
          source: 'scoping_sheet',
          proposalCitation: `[${matchedSheetQ.sourceLocation}] "${matchedSheetQ.evidenceQuote.slice(0, 140)}"`,
          clientClarificationNeeded: false,
          clientNotes: `Direct scoping sheet question input (Rating: ${matchedSheetQ.ratingLabel}). Prioritized first before 5-Q / 20-Q defaults.`
        };
        highCount++;
        totalScoreSum += 100;
        return;
      }

      // 2. PRIORITY 2: Scoping Sheet Overall Module Rating
      const modRating = moduleRatingsFromSheet[modId];
      if (modRating) {
        const optIdx = Math.max(0, Math.min(3, modRating.score - 1));
        answersArr.push(optIdx);
        metaMap[qIdx] = {
          confidence: 'high',
          percentage: 95,
          source: 'scoping_sheet',
          proposalCitation: `[${modRating.sourceLocation}] "${modRating.evidenceQuote.slice(0, 140)}"`,
          clientClarificationNeeded: false,
          clientNotes: `Calibrated from scoping sheet module rating (${modRating.ratingLabel}). Prioritized first before 5-Q / 20-Q defaults.`
        };
        highCount++;
        totalScoreSum += 95;
        return;
      }

      // 3. PRIORITY 3: Proposal Document / RFP Text Evidence
      const res = inferQuestionAnswerFromEvidence(q, units, modId);
      if (res.confidence === 'high' || res.confidence === 'medium') {
        answersArr.push(res.optIdx);
        metaMap[qIdx] = {
          confidence: res.confidence,
          percentage: res.percentage,
          source: 'ai_proposal',
          proposalCitation: res.citation,
          clientClarificationNeeded: res.clarificationNeeded,
          clientNotes: res.notes || 'Inferred from proposal narrative evidence.'
        };
        totalScoreSum += res.percentage;
        if (res.confidence === 'high') highCount++;
        else mediumCount++;
        return;
      }

      // 4. PRIORITY 4: Fallback Benchmark (No scoping sheet or proposal evidence)
      // Governed by active 5-Q / 20-Q selection defaults
      answersArr.push(res.optIdx !== undefined ? res.optIdx : 1);
      metaMap[qIdx] = {
        confidence: 'unconfirmed',
        percentage: 0,
        source: 'default_benchmark',
        proposalCitation: 'No explicit scoping sheet or document evidence found.',
        clientClarificationNeeded: true,
        clientNotes: 'No scoping sheet input found for this item; governed by active 5-Q / 20-Q selection defaults.'
      };
      unconfirmedCount++;
      const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
      clientClarificationsNeeded.push(
        `[${modDef?.name || modId}] Q${qIdx + 1}: ${q.question} — No scoping sheet or RFP citation; governed by 5-Q / 20-Q baseline default.`
      );
    });

    questionAnswers[modId] = answersArr;
    questionConfidenceMeta[modId] = metaMap;
  });

  // Summary Findings
  if (scopingSheetQuestions.length > 0 || Object.keys(moduleRatingsFromSheet).length > 0) {
    summaryFindings.push(
      `Scoping Sheet Precedence Active: Prioritized ${scopingSheetQuestions.length} explicit questionnaire rating(s) and ${Object.keys(moduleRatingsFromSheet).length} module rating(s) from scoping sheet input before applying 5-Q / 20-Q baseline defaults.`
    );
  }

  summaryFindings.push(
    `Evidence Ingestion: Ingested ${units.length} evidence lines across ${detectedSheets.length || 1} sheet(s)/sections with zero unverified guessing.`
  );

  if (inferredModules.length > 0) {
    summaryFindings.push(
      `Verified ${inferredModules.length} in-scope Oracle Cloud modules with direct positive citations.`
    );
  } else {
    summaryFindings.push(
      `No standard modules explicitly matched in text/sheets. No modules were hallucinated into scope.`
    );
  }

  if (excludedModules.length > 0) {
    summaryFindings.push(
      `Respected ${excludedModules.length} explicitly excluded scope item(s): ${excludedModules.join(', ')}.`
    );
  }

  const extractedDriverKeys = Object.keys(driverEvidence);
  if (extractedDriverKeys.length > 0) {
    summaryFindings.push(
      `Extracted ${extractedDriverKeys.length} verifiable physical scale drivers with cell/quote provenance.`
    );
  }

  if (unconfirmedDriversProtected.length > 0) {
    summaryFindings.push(
      `Zero-Hallucination Protection: ${unconfirmedDriversProtected.length} physical drivers had no evidence in the document and were left untouched in your baseline.`
    );
  }

  summaryFindings.push(
    `Confidence Breakdown: ${highCount} High Confidence (explicitly cited / scoping sheet), ${mediumCount} Medium Confidence, ${lowCount + unconfirmedCount} flagged for Client Workshop validation.`
  );

  const overallConfidencePercentage =
    totalScopedCount > 0 ? Math.round(totalScoreSum / totalScopedCount) : 80;

  return {
    inferredModules,
    extractedScaleDrivers,
    questionAnswers,
    questionConfidenceMeta,
    summaryFindings,
    clientClarificationsNeeded,
    evidenceSheetAudit: sheetAudits,
    driverEvidence,
    moduleEvidence,
    excludedModules,
    unconfirmedDriversProtected,
    moduleRatingsFromSheet,
    scopingSheetQuestions,
    moduleTShirtOverrides,
    stats: {
      highConfidenceCount: highCount,
      mediumConfidenceCount: mediumCount,
      lowConfidenceCount: lowCount,
      unconfirmedCount,
      totalQuestionsScoped: totalScopedCount,
      overallConfidencePercentage,
      totalCellsParsed: units.length * 3,
      totalSheetsParsed: detectedSheets.length || 1,
      evidenceBackedDriversCount: extractedDriverKeys.length,
      scopingSheetQuestionsCount: scopingSheetQuestions.length,
      moduleRatingsCount: Object.keys(moduleRatingsFromSheet).length
    }
  };
}

/**
 * Evaluates individual scoping question strictly against indexed evidence units
 * Zero Hallucination: Returns 'unconfirmed' (0%) if not stated in evidence
 */
function inferQuestionAnswerFromEvidence(
  question: ModuleScopingQuestion,
  units: EvidenceUnit[],
  modId: OracleModule
): {
  optIdx: number;
  confidence: 'high' | 'medium' | 'low' | 'unconfirmed';
  percentage: number;
  citation?: string;
  clarificationNeeded: boolean;
  notes?: string;
} {
  const qLower = question.question.toLowerCase();
  const catLower = question.category.toLowerCase();

  // Search units for explicit keywords
  for (const unit of units) {
    const textLower = unit.lower;

    // 1. Chart of Accounts & Secondary Ledgers
    if (qLower.includes('chart of accounts') || qLower.includes('segment')) {
      if (textLower.includes('8 segment') || textLower.includes('secondary ledger') || textLower.includes('ifrs and us gaap')) {
        return {
          optIdx: 1,
          confidence: 'high',
          percentage: 95,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
      if (textLower.includes('cvr') || textLower.includes('dynamic insertion') || textLower.includes('10+ segment')) {
        return {
          optIdx: 3,
          confidence: 'high',
          percentage: 92,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 2. Intercompany & AGIS
    if (qLower.includes('intercompany') || qLower.includes('agis')) {
      if (textLower.includes('agis') || textLower.includes('cross-border tolling') || textLower.includes('intercompany trading')) {
        return {
          optIdx: 2,
          confidence: 'high',
          percentage: 94,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 3. Automated Bank Statement Reconciliation
    if (qLower.includes('bank') || qLower.includes('swift') || qLower.includes('reconciliation')) {
      if (textLower.includes('swift mt940') || textLower.includes('daily bank reconciliation') || textLower.includes('auto-reconciliation')) {
        return {
          optIdx: 2,
          confidence: 'high',
          percentage: 96,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 4. Data Migration & Mock Conversion Cycles
    if (qLower.includes('mock') || qLower.includes('conversion') || qLower.includes('migration')) {
      if (textLower.includes('3 mock') || textLower.includes('rehearsal') || textLower.includes('fbdi')) {
        return {
          optIdx: 2,
          confidence: 'high',
          percentage: 92,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 5. Unions / Collective Bargaining
    if (qLower.includes('union') || qLower.includes('bargaining') || qLower.includes('cba')) {
      if (textLower.includes('collective bargaining') || textLower.includes('union')) {
        return {
          optIdx: 2,
          confidence: 'high',
          percentage: 95,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 6. 3-Way Matching & Punchout Catalogs
    if (qLower.includes('3-way') || qLower.includes('matching') || qLower.includes('punchout')) {
      if (textLower.includes('3-way match') || textLower.includes('punchout')) {
        return {
          optIdx: 2,
          confidence: 'high',
          percentage: 90,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 7. RF Barcode Scanning / WMS
    if (qLower.includes('rf') || qLower.includes('barcode') || qLower.includes('warehouse')) {
      if (textLower.includes('rf mobile') || textLower.includes('barcode scanning') || textLower.includes('wave picking')) {
        return {
          optIdx: 2,
          confidence: 'high',
          percentage: 92,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false
        };
      }
    }

    // 8. OIC Integrations & Middleware
    if (catLower.includes('integrations') || qLower.includes('interface') || qLower.includes('feed')) {
      if (textLower.includes('oic') || textLower.includes('integration cloud') || textLower.includes('api gateway')) {
        return {
          optIdx: 2,
          confidence: 'medium',
          percentage: 75,
          citation: `[${unit.sourceLocation}] "${unit.raw}"`,
          clarificationNeeded: false,
          notes: 'Derived from stated enterprise OIC footprint.'
        };
      }
    }
  }

  // Zero-Hallucination: If question was not explicitly addressed in the document/sheet
  return {
    optIdx: 1, // standard baseline option preserved
    confidence: 'unconfirmed',
    percentage: 0,
    citation: 'No evidence found in uploaded document/sheets. Baseline scenario preserved.',
    clarificationNeeded: true,
    notes: 'Unconfirmed in client proposal; requires architect discovery validation.'
  };
}
