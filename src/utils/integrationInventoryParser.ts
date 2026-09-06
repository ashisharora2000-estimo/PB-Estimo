import * as XLSX from 'xlsx';
import {
  TechnicalIntegrationItem,
  TechnicalIntegrationType,
  TechnicalComplexityTier,
  IntegrationQuestionAnswers
} from '../types';
import { calculateIntegrationEffort } from '../data/technicalScopingData';

export interface ParsedRicefwSummary {
  integrations: number;
  reports_bip: number;
  reports_otbi: number;
  conversions: number;
  paas: number;
  workflows: number;
  security_roles: number;
  fast_formulas: number;
}

export interface IntegrationInventoryParseResult {
  items: TechnicalIntegrationItem[];
  totalCount: number;
  totalHours: number;
  summaryByComplexity: {
    simple: number;
    medium: number;
    complex: number;
    extraLarge: number;
  };
  summaryByPillar: Record<string, number>;
  summaryByType: Record<string, number>;
  detectedFormat: 'excel' | 'csv' | 'tsv' | 'json' | 'markdown_table' | 'line_list';
  validationWarnings: string[];
  sheetNames?: string[];
  activeSheet?: string;
  ricefwCounts?: ParsedRicefwSummary;
  ricefwSmcOverrides?: Record<string, { simple: number; medium: number; complex: number }>;
}

// Preset Inventories for Rapid Enterprise Scoping
export const PRESET_INTEGRATION_INVENTORIES = [
  {
    id: 'erp_ecosystem_14',
    name: 'Oracle ERP Cloud Enterprise Footprint (14 Interfaces)',
    description: 'Comprehensive financial, treasury, procurement, and HR inbound/outbound middleware inventory.',
    rawContent: `ID,Interface Name,Source System,Target System,Pillar,Pattern,Complexity,Protocol
INT-01,Salesforce CRM Customer & Order Sync,Salesforce Sales Cloud,Oracle Order Management,ERP,bidirectional_sync,M,REST OAuth2
INT-02,Workday Worker Master & Cost Center Ingestion,Workday HCM,Oracle Core Financials & Procurement,ERP,inbound_rest,M,REST OAuth2
INT-03,Global Bank SWIFT MT940 / CAMT.053 Statement Feed,SWIFT Network / Citi / JPM,Oracle Cash Management,ERP,inbound_rest,C,SFTP PGP
INT-04,ISO 20022 XML Payment Dispatch & Ack,Oracle Cash Management & AP,Global Banking Hosts,ERP,outbound_extract,C,SFTP AS2
INT-05,Concur Expense Report to AP Invoices,SAP Concur Expense,Oracle Accounts Payable,ERP,inbound_rest,M,REST Webhook
INT-06,Coupa Inbound PO Requisition & Vendor Master,Coupa Procurement,Oracle Purchasing & AP,ERP,bidirectional_sync,M,REST OAuth2
INT-07,Avalara / Vertex Real-Time Tax Determination,Oracle AR & Order Management,Avalara AvaTax Engine,ERP,bidirectional_sync,S,REST Cloud Adapter
INT-08,BlackLine Balance Sheet Reconciliation Journal Feed,BlackLine Reconciliation,Oracle General Ledger,ERP,inbound_rest,S,REST API
INT-09,ADP / External Payroll Summary Journal Inbound,ADP GlobalView / Ceridian,Oracle General Ledger,ERP,inbound_rest,M,SFTP Batch
INT-10,Enterprise Data Lake Outbound BICC Extract,Oracle Cloud Financials,AWS S3 / Snowflake Lakehouse,ERP,outbound_extract,M,BICC REST
INT-11,Stripe / CyberSource Merchant Payment Settlement,Stripe Payments,Oracle Accounts Receivable & Cash,ERP,inbound_rest,S,REST Webhook
INT-12,ServiceNow Fixed Asset & IT Equipment Sync,ServiceNow ITAM,Oracle Fixed Assets,ERP,inbound_rest,S,REST OAuth2
INT-13,Intercompany AGIS Financial Trade Matrix,Oracle Primary Ledger,Secondary Statutory Ledgers,ERP,bidirectional_sync,C,Direct REST
INT-14,External Regulatory Audit Trail Extract,Oracle Subledger Accounting,National Tax Authorities (SAF-T),ERP,outbound_extract,C,BICC XML`
  },
  {
    id: 'scm_mfg_hub_20',
    name: 'Oracle SCM & Discrete Manufacturing Hub (20 Interfaces)',
    description: 'Shop floor MES, SCADA, 3PL warehouse, B2B EDI 850/856/810, and IoT telemetry interfaces.',
    rawContent: `ID,Interface Name,Source System,Target System,Pillar,Pattern,Complexity,Protocol
INT-01,Shopfloor MES Work Order Dispatch & Release,Oracle Cloud Manufacturing,Siemens Opcenter MES,SCM,outbound_extract,C,REST Webhook
INT-02,MES Assembly Completion & Scrap Telemetry,Siemens Opcenter MES,Oracle Cloud Manufacturing,SCM,inbound_rest,C,REST OAuth2
INT-03,SCADA Equipment Machine Downtime & Yield Feed,Rockwell Automation SCADA,Oracle Maintenance Cloud,SCM,inbound_rest,C,OPC-UA Agent
INT-04,3PL Warehouse Ship Confirm & Tracking Handshake,Oracle Order Management,Kuehne+Nagel 3PL WMS,SCM,bidirectional_sync,C,AS2 EDI
INT-05,B2B EDI 850 Purchase Order Transmission,Oracle Procurement Cloud,Tier-1 Suppliers EDI Hub,SCM,outbound_extract,M,EDI AS2
INT-06,B2B EDI 856 Advanced Ship Notice (ASN) Feed,Supplier OpenText Network,Oracle Receiving Cloud,SCM,inbound_rest,M,EDI AS2
INT-07,B2B EDI 810 Electronic Supplier Invoice Ingestion,Supplier EDI Network,Oracle Accounts Payable,SCM,inbound_rest,M,EDI AS2
INT-08,Carrier Transportation Freight Cost & Tracking,FedEx / UPS / DHL APIs,Oracle Order Management,SCM,bidirectional_sync,M,REST OAuth2
INT-09,IoT Cold Chain Temperature & Geolocation Feed,Oracle IoT Fleet Monitoring,Oracle Inventory Cloud,SCM,inbound_rest,M,MQTT Broker
INT-10,PLM Engineering Item & Bill of Materials Release,PTC Windchill PLM,Oracle Product Master Data (PDH),SCM,inbound_rest,C,REST OAuth2
INT-11,Shopify Plus / POS Sales Orders Ingestion,Shopify Plus / Retail POS,Oracle Order Management,SCM,inbound_rest,M,REST Webhook
INT-12,Demand Planning Historical Shipment Forecast Extract,Oracle Inventory & OM,Blue Yonder / O9 Planning,SCM,outbound_extract,M,BICC Extract
INT-13,Barcode RF Scanning Gun Direct Inventory Move,Zebra RF Handheld Scanners,Oracle Inventory Cloud,SCM,inbound_rest,S,REST Mobile
INT-14,Customs Broker Export Clearance Documentation,Oracle Global Trade Mgmt,Descartes Customs Broker,SCM,outbound_extract,M,SFTP XML
INT-15,Freight Pay & Audit Invoice Settlement,Cass Information Systems,Oracle Accounts Payable,SCM,inbound_rest,M,SFTP Batch
INT-16,Vendor Portal Direct RFQ & Quotation Sync,Oracle Sourcing Cloud,Supplier Self-Service Portal,SCM,bidirectional_sync,M,REST OAuth2
INT-17,Quality Inspection & Laboratory Sample Results,LabVantage LIMS,Oracle Quality Management,SCM,inbound_rest,S,REST API
INT-18,Co-Packer Contract Manufacturer Inventory Balance,Contract Manufacturing Partner,Oracle Inventory Cloud,SCM,bidirectional_sync,M,SFTP Batch
INT-19,Customer Return Authorization (RMA) Inbound,Zendesk / Salesforce Service,Oracle Order Management,SCM,inbound_rest,S,REST API
INT-20,Hazardous Material SDS Safety Datasheet Feed,Chemical Data Safety Hub,Oracle Inventory & Shipping,SCM,inbound_rest,S,REST API`
  },
  {
    id: 'lean_financials_6',
    name: 'Lean Core Financials Foundation (6 Interfaces)',
    description: 'Standard foundational interfaces for bank statements, payments, AR receipts, and general ledger.',
    rawContent: `ID,Interface Name,Source System,Target System,Pillar,Pattern,Complexity,Protocol
INT-01,Global Bank MT940 Daily Statement Ingestion,Bank Host (Citi / JPM / HSBC),Oracle Cash Management,ERP,inbound_rest,M,SFTP PGP
INT-02,Electronic AP Payment File Dispatch,Oracle Accounts Payable,Bank Gateway,ERP,outbound_extract,M,SFTP AS2
INT-03,Customer Master & Invoices Inbound REST,Legacy Billing System,Oracle Accounts Receivable,ERP,inbound_rest,S,REST OAuth2
INT-04,Fixed Asset Register Annual Asset Balance,Asset Depreciation Tool,Oracle Fixed Assets,ERP,batch_fbdi,S,FBDI Automation
INT-05,External Payroll GL Journal Summary Ingestion,Payroll Provider (ADP / Workday),Oracle General Ledger,ERP,inbound_rest,M,REST API
INT-06,Intercompany AGIS Monthly Netting Feed,Regional Subledger,Oracle Intercompany Balancing,ERP,bidirectional_sync,M,REST OAuth2`
  }
];

export const SAMPLE_CSV_TEMPLATE = `ID,Interface Name,Source System,Target System,Pillar,Pattern,Complexity,Protocol
INT-01,Salesforce CRM Customer & Order Sync,Salesforce Sales Cloud,Oracle Order Management,ERP,bidirectional_sync,M,REST OAuth2
INT-02,Workday Worker Master Ingestion,Workday HCM,Oracle Core Financials & Procurement,ERP,inbound_rest,M,REST OAuth2
INT-03,Global Bank SWIFT MT940 Statement Feed,SWIFT Network,Oracle Cash Management,ERP,inbound_rest,C,SFTP PGP
INT-04,Concur Expense Report to AP Invoices,SAP Concur,Oracle Accounts Payable,ERP,inbound_rest,S,REST Webhook`;

/**
 * Normalizes complexity strings to valid TechnicalComplexityTier
 */
export function normalizeComplexity(raw: string | number): TechnicalComplexityTier {
  const clean = String(raw || '').trim().toUpperCase();
  if (clean === 'S' || clean === 'SIMPLE' || clean === '1' || clean === 'LOW' || clean === 'EASY' || clean.includes('PASS-THROUGH')) return 'S';
  if (clean === 'C' || clean === 'COMPLEX' || clean === '3' || clean === 'HIGH' || clean === 'HARD') return 'C';
  if (clean === 'XL' || clean === 'EXTRA' || clean === 'EXTRA LARGE' || clean === 'EXTRA-LARGE' || clean === '4' || clean === 'VERY HIGH' || clean === 'EXTREME') return 'XL';
  return 'M'; // Default standard medium
}

/**
 * Normalizes integration type / pattern
 */
export function normalizeType(raw: string): TechnicalIntegrationType {
  const clean = (raw || '').toLowerCase().trim();
  if (clean.includes('sync') || clean.includes('bidirectional') || clean.includes('two-way') || clean.includes('2-way') || clean.includes('round-trip')) {
    return 'bidirectional_sync';
  }
  if (clean.includes('extract') || clean.includes('outbound') || clean.includes('dispatch') || clean.includes('bicc') || clean.includes('export')) {
    return 'outbound_extract';
  }
  if (clean.includes('fbdi') || clean.includes('batch') || clean.includes('file') || clean.includes('hdl') || clean.includes('bulk')) {
    return 'batch_fbdi';
  }
  if (clean.includes('event') || clean.includes('kafka') || clean.includes('message') || clean.includes('queue') || clean.includes('webhook') || clean.includes('pubsub') || clean.includes('stream')) {
    return 'event_driven';
  }
  return 'inbound_rest';
}

/**
 * Normalizes pillar / domain
 */
export function normalizePillar(raw: string): 'ERP' | 'SCM' | 'HCM' | 'EPM' | 'CX' | 'Cross-Pillar' {
  const clean = (raw || '').toUpperCase().trim();
  if (clean.includes('SCM') || clean.includes('SUPPLY') || clean.includes('MFG') || clean.includes('INV') || clean.includes('LOG') || clean.includes('WAREHOUSE') || clean.includes('PLANT')) return 'SCM';
  if (clean.includes('HCM') || clean.includes('HR') || clean.includes('PAYROLL') || clean.includes('BENEFIT') || clean.includes('TALENT') || clean.includes('WORKFORCE')) return 'HCM';
  if (clean.includes('EPM') || clean.includes('PLANNING') || clean.includes('CONSOL') || clean.includes('FCCS') || clean.includes('EPBCS')) return 'EPM';
  if (clean.includes('CX') || clean.includes('CRM') || clean.includes('SALES') || clean.includes('CPQ') || clean.includes('SERVICE')) return 'CX';
  if (clean.includes('CROSS') || clean.includes('ENTERPRISE') || clean.includes('CORE')) return 'Cross-Pillar';
  return 'ERP';
}

/**
 * Detects RICEFW category from row text, code, or description
 */
export function detectRicefwCategory(
  categoryStr: string,
  codeStr: string,
  nameStr: string
): 'integrations' | 'reports_bip' | 'reports_otbi' | 'conversions' | 'paas' | 'workflows' | 'security_roles' | 'fast_formulas' {
  const combined = `${categoryStr} ${codeStr} ${nameStr}`.toLowerCase();

  if (combined.includes('otbi') || combined.includes('dashboard') || combined.includes('subject area') || combined.includes('analysis')) {
    return 'reports_otbi';
  }
  if (combined.includes('bip') || combined.includes('publisher') || combined.includes('statutory extract') || combined.includes('pixel-perfect') || combined.includes('check print') || combined.includes('payment format')) {
    return 'reports_bip';
  }
  if (combined.includes('report') && !combined.includes('integration') && !combined.includes('interface')) {
    return 'reports_bip';
  }
  if (combined.includes('conv') || combined.includes('migration') || combined.includes('data load') || combined.includes('legacy conversion') || combined.includes('open item')) {
    return 'conversions';
  }
  if (combined.includes('paas') || combined.includes('vbcs') || combined.includes('extension') || combined.includes('apex') || combined.includes('microservice') || combined.includes('custom ui')) {
    return 'paas';
  }
  if (combined.includes('workflow') || combined.includes('bpm') || combined.includes('approval hierarchy') || combined.includes('escalation')) {
    return 'workflows';
  }
  if (combined.includes('security') || combined.includes('custom role') || combined.includes('sod') || combined.includes('privilege') || combined.includes('job role')) {
    return 'security_roles';
  }
  if (combined.includes('fast formula') || combined.includes('payroll formula') || combined.includes('accrual formula')) {
    return 'fast_formulas';
  }
  return 'integrations';
}

/**
 * Generates 6-Q question answers aligned with target complexity, pattern, protocol, and volume
 */
export function generateQuestionAnswersForComplexity(
  complexity: TechnicalComplexityTier,
  type: TechnicalIntegrationType,
  protocolStr: string = '',
  volumeStr: string = ''
): IntegrationQuestionAnswers {
  const protLower = (protocolStr || '').toLowerCase();
  let connectivityProtocol = 0; // Native cloud adapter
  if (protLower.includes('sftp') || protLower.includes('as2') || protLower.includes('pgp') || protLower.includes('agent') || protLower.includes('on-prem')) {
    connectivityProtocol = 2; // Legacy SFTP/AS2/Agent
  } else if (protLower.includes('db') || protLower.includes('mainframe') || protLower.includes('socket') || protLower.includes('jdbc') || protLower.includes('sql')) {
    connectivityProtocol = 3; // Legacy proprietary DB / Mainframe
  } else if (protLower.includes('webhook') || protLower.includes('rest') || protLower.includes('api key') || protLower.includes('soap') || protLower.includes('oauth')) {
    connectivityProtocol = 1; // Generic REST/SOAP
  }

  const volLower = (volumeStr || '').toLowerCase();
  let dataVolume = 1; // Moderate default
  if (volLower.includes('stream') || volLower.includes('continuous') || volLower.includes('real-time') || volLower.includes('>500k')) {
    dataVolume = 3;
  } else if (volLower.includes('high') || volLower.includes('fbdi') || volLower.includes('batch') || volLower.includes('50k')) {
    dataVolume = 2;
  } else if (volLower.includes('low') || volLower.includes('<1') || volLower.includes('monthly') || volLower.includes('lookup')) {
    dataVolume = 0;
  }

  const patternDirection = type === 'bidirectional_sync' ? 2 : (type === 'outbound_extract' ? 1 : (type === 'event_driven' ? 3 : 0));

  if (complexity === 'S') {
    return {
      patternDirection,
      mappingComplexity: 0, // Pass-Through / Direct Flat (1-to-1)
      connectivityProtocol: Math.min(1, connectivityProtocol),
      dataVolume: Math.min(1, dataVolume),
      errorHandling: 0, // Standard OIC Native Error Alert
      apiReadiness: 0 // Documented OpenAPI / Sandbox
    };
  }

  if (complexity === 'C') {
    return {
      patternDirection,
      mappingComplexity: 2, // Complex Multi-Entity Hierarchy (50-120 fields)
      connectivityProtocol: Math.max(1, connectivityProtocol),
      dataVolume: Math.max(1, dataVolume),
      errorHandling: 2, // Enterprise Compensation Workflow
      apiReadiness: 1 // Concurrent in-flight development
    };
  }

  if (complexity === 'XL') {
    return {
      patternDirection: 2, // Bidirectional canonical
      mappingComplexity: 3, // Canonical Enterprise Model (>120 fields)
      connectivityProtocol: Math.max(2, connectivityProtocol),
      dataVolume: Math.max(2, dataVolume),
      errorHandling: 3, // Fully Custom Dead-Letter & Resubmit Service
      apiReadiness: 2 // Legacy DB / No OpenAPI
    };
  }

  // Medium (Default)
  return {
    patternDirection,
    mappingComplexity: 1, // Standard Enterprise Mapping (15-50 fields)
    connectivityProtocol: connectivityProtocol > 0 ? connectivityProtocol : 1,
    dataVolume: dataVolume,
    errorHandling: 1, // Custom Alerting & Retry Queue
    apiReadiness: 0
  };
}

/**
 * Universal tabular parser that converts raw 2D string/cell arrays into structured inventory items
 */
export function parseTabularRows(
  rows: any[][],
  detectedFormat: 'excel' | 'csv' | 'tsv' | 'markdown_table' | 'line_list' | 'json',
  activeSheetName?: string,
  allSheets?: string[]
): IntegrationInventoryParseResult {
  const validationWarnings: string[] = [];
  const items: TechnicalIntegrationItem[] = [];

  if (!rows || rows.length === 0) {
    return {
      items: [],
      totalCount: 0,
      totalHours: 0,
      summaryByComplexity: { simple: 0, medium: 0, complex: 0, extraLarge: 0 },
      summaryByPillar: {},
      summaryByType: {},
      detectedFormat,
      validationWarnings: ['No tabular data rows detected in input.'],
      sheetNames: allSheets,
      activeSheet: activeSheetName
    };
  }

  // 1. Locate the true header row (scan first 15 rows)
  let headerRowIdx = -1;
  let colId = -1;
  let colName = -1;
  let colCategory = -1;
  let colSource = -1;
  let colTarget = -1;
  let colPillar = -1;
  let colPattern = -1;
  let colComplexity = -1;
  let colProtocol = -1;
  let colVolume = -1;
  let colHours = -1;
  let colNotes = -1;

  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r] || [];
    const tokens = row.map(cell => String(cell || '').trim().toLowerCase());
    
    // Check if row has header-like signals
    const hasHeaderSignals = tokens.some(t =>
      t.includes('name') || t.includes('interface') || t.includes('id') || t.includes('code') ||
      t.includes('source') || t.includes('target') || t.includes('complexity') || t.includes('pattern') ||
      t.includes('protocol') || t.includes('type') || t.includes('ricefw') || t.includes('hours')
    );

    if (hasHeaderSignals) {
      headerRowIdx = r;
      tokens.forEach((tok, idx) => {
        if (tok === 'id' || tok === 'code' || tok === 'interface #' || tok === 'interface id' || tok === 'item' || tok === 'ref' || tok === 'no' || tok === '#') {
          if (colId === -1) colId = idx;
        } else if (tok.includes('name') || tok.includes('interface name') || tok.includes('title') || tok.includes('description') || tok.includes('summary')) {
          if (colName === -1) colName = idx;
        } else if (tok.includes('ricefw') || tok === 'category' || tok.includes('object type') || tok === 'classification') {
          if (colCategory === -1) colCategory = idx;
        } else if (tok.includes('source') || tok === 'from' || tok.includes('sender') || tok.includes('origin')) {
          if (colSource === -1) colSource = idx;
        } else if (tok.includes('target') || tok === 'to' || tok.includes('receiver') || tok.includes('dest') || tok.includes('endpoint')) {
          if (colTarget === -1) colTarget = idx;
        } else if (tok.includes('pillar') || tok.includes('domain') || tok.includes('module') || tok.includes('track')) {
          if (colPillar === -1) colPillar = idx;
        } else if (tok.includes('pattern') || tok.includes('direction') || tok.includes('flow') || tok.includes('integration type') || tok === 'type') {
          if (colPattern === -1) colPattern = idx;
        } else if (tok.includes('complexity') || tok.includes('tier') || tok.includes('size') || tok.includes('t-shirt') || tok.includes('level')) {
          if (colComplexity === -1) colComplexity = idx;
        } else if (tok.includes('protocol') || tok.includes('tech') || tok.includes('adapter') || tok.includes('transport') || tok.includes('method')) {
          if (colProtocol === -1) colProtocol = idx;
        } else if (tok.includes('volume') || tok.includes('frequency') || tok.includes('tx/day') || tok.includes('schedule')) {
          if (colVolume === -1) colVolume = idx;
        } else if (tok.includes('hour') || tok.includes('effort') || tok.includes('manday') || tok.includes('est') || tok.includes('day')) {
          if (colHours === -1) colHours = idx;
        } else if (tok.includes('note') || tok.includes('comment') || tok.includes('assumption') || tok.includes('status')) {
          if (colNotes === -1) colNotes = idx;
        }
      });
      break;
    }
  }

  const dataRows = headerRowIdx !== -1 ? rows.slice(headerRowIdx + 1) : rows;

  // Track RICEFW summary counts and SMC overrides
  const ricefwCounts: ParsedRicefwSummary = {
    integrations: 0,
    reports_bip: 0,
    reports_otbi: 0,
    conversions: 0,
    paas: 0,
    workflows: 0,
    security_roles: 0,
    fast_formulas: 0
  };

  const ricefwSmcOverrides: Record<string, { simple: number; medium: number; complex: number }> = {};

  const bumpOverride = (typeId: string, tier: TechnicalComplexityTier) => {
    if (!ricefwSmcOverrides[typeId]) {
      ricefwSmcOverrides[typeId] = { simple: 0, medium: 0, complex: 0 };
    }
    if (tier === 'S') ricefwSmcOverrides[typeId].simple++;
    else if (tier === 'M') ricefwSmcOverrides[typeId].medium++;
    else ricefwSmcOverrides[typeId].complex++;
  };

  dataRows.forEach((row, rowIdx) => {
    if (!row || row.length === 0) return;
    const cleanCells = row.map(c => String(c !== undefined && c !== null ? c : '').trim());
    const rowJoined = cleanCells.join(' ');
    if (rowJoined.length === 0) return;

    // Skip markdown table dividers like |---|---|
    if (cleanCells.every(c => c.startsWith('-') || c === '')) return;

    const rawId = (colId !== -1 && cleanCells[colId]) ? cleanCells[colId] : '';
    const rawName = (colName !== -1 && cleanCells[colName]) ? cleanCells[colName] : (cleanCells[1] || cleanCells[0] || `Interface #${rowIdx + 1}`);
    const rawCategory = (colCategory !== -1 && cleanCells[colCategory]) ? cleanCells[colCategory] : '';
    const rawSource = (colSource !== -1 && cleanCells[colSource]) ? cleanCells[colSource] : (cleanCells[2] || 'External Enterprise Host');
    const rawTarget = (colTarget !== -1 && cleanCells[colTarget]) ? cleanCells[colTarget] : (cleanCells[3] || 'Oracle Cloud ERP');
    const rawPillar = (colPillar !== -1 && cleanCells[colPillar]) ? cleanCells[colPillar] : (cleanCells[4] || 'ERP');
    const rawPattern = (colPattern !== -1 && cleanCells[colPattern]) ? cleanCells[colPattern] : (cleanCells[5] || 'inbound_rest');
    const rawComplexity = (colComplexity !== -1 && cleanCells[colComplexity]) ? cleanCells[colComplexity] : (cleanCells[6] || 'M');
    const rawProtocol = (colProtocol !== -1 && cleanCells[colProtocol]) ? cleanCells[colProtocol] : (cleanCells[7] || 'REST OAuth2');
    const rawVolume = (colVolume !== -1 && cleanCells[colVolume]) ? cleanCells[colVolume] : '';
    const rawHours = (colHours !== -1 && cleanCells[colHours]) ? parseFloat(cleanCells[colHours]) : NaN;
    const rawNotes = (colNotes !== -1 && cleanCells[colNotes]) ? cleanCells[colNotes] : '';

    const code = rawId || `INT-${String(rowIdx + 1).padStart(2, '0')}`;
    const name = rawName;
    const pillar = normalizePillar(rawPillar);
    const type = normalizeType(rawPattern);
    const complexity = normalizeComplexity(rawComplexity);
    const category = detectRicefwCategory(rawCategory, code, name);

    // Update RICEFW count
    ricefwCounts[category] = (ricefwCounts[category] || 0) + 1;

    // Update specific RICEFW catalog SMC overrides based on detected category & complexity
    if (category === 'reports_bip') {
      const typeId = name.toLowerCase().includes('statutory') || name.toLowerCase().includes('extract') ? 'bip_statutory_extracts' : 'bip_customer_docs';
      bumpOverride(typeId, complexity);
    } else if (category === 'reports_otbi') {
      const typeId = name.toLowerCase().includes('cross') || name.toLowerCase().includes('dashboard') ? 'otbi_cross_dashboard' : 'otbi_single_analysis';
      bumpOverride(typeId, complexity);
    } else if (category === 'conversions') {
      const typeId = name.toLowerCase().includes('open') || name.toLowerCase().includes('transaction') ? 'conv_open_transactions' : 'conv_master_data';
      bumpOverride(typeId, complexity);
    } else if (category === 'paas') {
      const typeId = name.toLowerCase().includes('atp') || name.toLowerCase().includes('service') || name.toLowerCase().includes('api') ? 'paas_atp_microservice' : 'paas_vbcs_ui';
      bumpOverride(typeId, complexity);
    } else if (category === 'workflows') {
      const typeId = pillar === 'HCM' ? 'wf_hcm_approvals' : 'wf_financial_approvals';
      bumpOverride(typeId, complexity);
    } else if (category === 'security_roles') {
      const typeId = name.toLowerCase().includes('sod') ? 'sec_sod_conflict_matrix' : 'sec_custom_job_roles';
      bumpOverride(typeId, complexity);
    } else if (category === 'fast_formulas') {
      const typeId = name.toLowerCase().includes('absence') || name.toLowerCase().includes('accrual') ? 'ff_absence_accrual' : 'ff_payroll_tax';
      bumpOverride(typeId, complexity);
    }

    // Build the 6-Q question answers aligned with this item's complexity and inputs
    const qAnswers = generateQuestionAnswersForComplexity(complexity, type, rawProtocol, rawVolume);
    const effort = calculateIntegrationEffort(qAnswers, type);

    // If explicit numeric hours were supplied in the Excel/CSV sheet, honor them!
    const calculatedHours = (!isNaN(rawHours) && rawHours > 0) ? Math.round(rawHours) : effort.calculatedHours;
    const rationale = (!isNaN(rawHours) && rawHours > 0)
      ? `Explicit estimate from inventory file: ${rawHours} hrs (${code} ${complexity} tier)`
      : effort.rationale || `Calculated 6-Q effort: ${complexity} tier ${type} w/ ${rawProtocol || 'REST'}`;

    items.push({
      id: `int_ingest_${Date.now()}_${rowIdx + 1}`,
      code,
      name,
      pillar,
      sourceSystem: rawSource,
      targetSystem: rawTarget,
      type,
      complexity: effort.complexity || complexity,
      isQuestionDriven: true,
      questionAnswers: qAnswers,
      baseHours: 45,
      calculatedHours,
      calculationFormula: effort.calculationFormula,
      compositeScore: effort.compositeScore,
      rationale: rawNotes ? `${rationale} [Note: ${rawNotes}]` : rationale
    });
  });

  // Calculate summary metrics
  const summaryByComplexity = { simple: 0, medium: 0, complex: 0, extraLarge: 0 };
  const summaryByPillar: Record<string, number> = {};
  const summaryByType: Record<string, number> = {};
  let totalHours = 0;

  items.forEach(item => {
    totalHours += item.calculatedHours;
    if (item.complexity === 'S') summaryByComplexity.simple++;
    else if (item.complexity === 'M') summaryByComplexity.medium++;
    else if (item.complexity === 'C') summaryByComplexity.complex++;
    else if (item.complexity === 'XL') summaryByComplexity.extraLarge++;

    summaryByPillar[item.pillar] = (summaryByPillar[item.pillar] || 0) + 1;
    summaryByType[item.type] = (summaryByType[item.type] || 0) + 1;
  });

  return {
    items,
    totalCount: items.length,
    totalHours,
    summaryByComplexity,
    summaryByPillar,
    summaryByType,
    detectedFormat,
    validationWarnings,
    sheetNames: allSheets,
    activeSheet: activeSheetName,
    ricefwCounts,
    ricefwSmcOverrides
  };
}

/**
 * Parses an Excel Workbook binary ArrayBuffer directly using SheetJS (xlsx)
 */
export function parseExcelWorkbook(
  data: ArrayBuffer | Uint8Array,
  sheetIndexOrName?: number | string
): {
  sheets: string[];
  activeSheet: string;
  csvText: string;
  result: IntegrationInventoryParseResult;
} {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheets = workbook.SheetNames || [];
  if (sheets.length === 0) {
    throw new Error('Excel file contains no worksheets.');
  }

  let selectedSheetName = sheets[0];
  if (typeof sheetIndexOrName === 'string' && sheets.includes(sheetIndexOrName)) {
    selectedSheetName = sheetIndexOrName;
  } else if (typeof sheetIndexOrName === 'number' && sheets[sheetIndexOrName]) {
    selectedSheetName = sheets[sheetIndexOrName];
  } else {
    // Intelligently select sheet containing 'integ', 'interf', 'ricefw', 'invent'
    const bestSheet = sheets.find(s => {
      const lower = s.toLowerCase();
      return lower.includes('integ') || lower.includes('interf') || lower.includes('ricefw') || lower.includes('invent') || lower.includes('scope');
    });
    if (bestSheet) selectedSheetName = bestSheet;
  }

  const worksheet = workbook.Sheets[selectedSheetName];
  // Convert worksheet to CSV string for review & editing
  const csvText = XLSX.utils.sheet_to_csv(worksheet, { blankrows: false });
  // Convert worksheet to 2D array
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const result = parseTabularRows(rawRows, 'excel', selectedSheetName, sheets);

  return {
    sheets,
    activeSheet: selectedSheetName,
    csvText,
    result
  };
}

/**
 * Parses raw integration inventory from CSV, TSV, JSON, Markdown tables, or Line Lists
 */
export function parseIntegrationInventory(rawInput: string): IntegrationInventoryParseResult {
  const trimmed = rawInput.trim();
  const validationWarnings: string[] = [];

  if (!trimmed) {
    return {
      items: [],
      totalCount: 0,
      totalHours: 0,
      summaryByComplexity: { simple: 0, medium: 0, complex: 0, extraLarge: 0 },
      summaryByPillar: {},
      summaryByType: {},
      detectedFormat: 'csv',
      validationWarnings: ['Input inventory text is empty.']
    };
  }

  // 1. Check for JSON Array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const rows: any[][] = [
          ['ID', 'Interface Name', 'Source System', 'Target System', 'Pillar', 'Pattern', 'Complexity', 'Protocol', 'Hours']
        ];
        parsed.forEach((obj, idx) => {
          rows.push([
            obj.id || obj.code || `INT-${String(idx + 1).padStart(2, '0')}`,
            obj.name || obj.title || obj.description || `Interface #${idx + 1}`,
            obj.sourceSystem || obj.source || 'External System',
            obj.targetSystem || obj.target || 'Oracle Cloud ERP',
            obj.pillar || obj.domain || 'ERP',
            obj.type || obj.pattern || 'inbound_rest',
            obj.complexity || obj.size || 'M',
            obj.protocol || obj.technology || 'REST OAuth2',
            obj.hours || obj.calculatedHours || ''
          ]);
        });
        return parseTabularRows(rows, 'json');
      }
    } catch {
      validationWarnings.push('Attempted JSON parse failed; falling back to tabular parsing.');
    }
  }

  // 2. Tabular parsing (CSV, TSV, Semicolon, Markdown table)
  const rawLines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const firstLine = rawLines[0] || '';
  let delimiter = ',';
  let detectedFormat: 'csv' | 'tsv' | 'markdown_table' | 'line_list' = 'csv';

  if (firstLine.includes('\t')) {
    delimiter = '\t';
    detectedFormat = 'tsv';
  } else if (firstLine.startsWith('|') && firstLine.endsWith('|')) {
    delimiter = '|';
    detectedFormat = 'markdown_table';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
    detectedFormat = 'csv';
  }

  // Helper to split row respecting quotes
  const splitRow = (rowStr: string): string[] => {
    if (delimiter === '|') {
      return rowStr
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim());
    }

    if (delimiter === '\t') {
      return rowStr.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''));
    }

    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const rows2D = rawLines.map(splitRow);
  return parseTabularRows(rows2D, detectedFormat);
}
