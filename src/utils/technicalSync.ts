import {
  ProjectScenario,
  ScaleDrivers,
  TechnicalIntegrationItem,
  TechnicalObjectSmcRow,
  TechnicalComplexityTier,
  TechnicalIntegrationType,
  RolloutApproach,
  PodCohort
} from '../types';
import {
  TECHNICAL_OBJECT_SMC_CATALOG,
  calculateIntegrationEffort
} from '../data/technicalScopingData';

/**
 * Master Enterprise Catalog mapping standard interface codes to realistic,
 * production-grade descriptions, endpoints, and rationales (guaranteed 0% placeholder text).
 */
export const STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG: Record<string, {
  name: string;
  sourceSystem: string;
  targetSystem: string;
  pillar: 'ERP' | 'SCM' | 'HCM' | 'CX' | 'EPM';
  type: TechnicalIntegrationType;
  complexity: TechnicalComplexityTier;
  rationale: string;
}> = {
  'INT-01': {
    name: 'Salesforce CRM Customer & Sales Order Sync',
    sourceSystem: 'Salesforce Sales Cloud',
    targetSystem: 'Oracle Order Management Cloud',
    pillar: 'CX',
    type: 'bidirectional_sync',
    complexity: 'M',
    rationale: 'Bi-directional customer account master synchronization and real-time sales order submission.'
  },
  'INT-02': {
    name: 'Workday Core HCM Worker Master & Cost Center Ingestion',
    sourceSystem: 'Workday HCM',
    targetSystem: 'Oracle Core Financials & Procurement Cloud',
    pillar: 'ERP',
    type: 'inbound_rest',
    complexity: 'M',
    rationale: 'Daily worker profile, department assignments, and cost center hierarchy synchronization.'
  },
  'INT-03': {
    name: 'Global Bank SWIFT MT940 / CAMT.053 Statement Feed',
    sourceSystem: 'SWIFT Network / JPMorgan Chase / Citi Host-to-Host',
    targetSystem: 'Oracle Cash Management Cloud',
    pillar: 'ERP',
    type: 'inbound_rest',
    complexity: 'C',
    rationale: 'Automated end-of-day electronic bank statement feed and automated cash reconciliation.'
  },
  'INT-04': {
    name: 'ISO 20022 XML Payment Dispatch & Acknowledgement',
    sourceSystem: 'Oracle Accounts Payable & Cash Management',
    targetSystem: 'Global Commercial Banking Hosts',
    pillar: 'ERP',
    type: 'outbound_extract',
    complexity: 'C',
    rationale: 'Encrypted pain.001 credit transfer dispatch and pain.002 status confirmation processing.'
  },
  'INT-05': {
    name: 'SAP Concur Travel & Expense Report to AP Invoices',
    sourceSystem: 'SAP Concur Expense',
    targetSystem: 'Oracle Accounts Payable Cloud',
    pillar: 'ERP',
    type: 'inbound_rest',
    complexity: 'M',
    rationale: 'Scheduled ingestion of approved employee expense reports into AP invoice open interface.'
  },
  'INT-06': {
    name: 'Coupa Inbound PO Requisition & Supplier Master Sync',
    sourceSystem: 'Coupa Procurement Cloud',
    targetSystem: 'Oracle Purchasing & Payables Cloud',
    pillar: 'ERP',
    type: 'bidirectional_sync',
    complexity: 'M',
    rationale: 'Real-time requisition sync, purchase order orchestration, and supplier bank master replication.'
  },
  'INT-07': {
    name: 'Avalara AvaTax / Vertex Real-Time Indirect Tax Engine',
    sourceSystem: 'Oracle Receivables, Purchasing & Order Management',
    targetSystem: 'Vertex O Series / Avalara AvaTax Engine',
    pillar: 'ERP',
    type: 'bidirectional_sync',
    complexity: 'S',
    rationale: 'Pre-certified real-time line-level tax calculation and automated tax reporting compliance.'
  },
  'INT-08': {
    name: 'BlackLine Balance Sheet Reconciliation Journal Feed',
    sourceSystem: 'BlackLine Account Reconciliation',
    targetSystem: 'Oracle General Ledger Cloud',
    pillar: 'ERP',
    type: 'inbound_rest',
    complexity: 'S',
    rationale: 'Automated period-end balance sheet variance adjustments and journal entry posting.'
  },
  'INT-09': {
    name: 'ADP GlobalView Payroll Summary Journal Inbound',
    sourceSystem: 'ADP GlobalView / Ceridian Dayforce',
    targetSystem: 'Oracle General Ledger & Cost Management Cloud',
    pillar: 'HCM',
    type: 'inbound_rest',
    complexity: 'M',
    rationale: 'Bi-weekly gross-to-net payroll summary GL journals with labor cost center allocations.'
  },
  'INT-10': {
    name: 'Enterprise Data Lake Outbound BICC Data Pipeline',
    sourceSystem: 'Oracle Cloud Financials & SCM',
    targetSystem: 'AWS S3 / Snowflake Enterprise Lakehouse',
    pillar: 'ERP',
    type: 'outbound_extract',
    complexity: 'M',
    rationale: 'Scheduled incremental BICC VO extracts to enterprise Snowflake data lakehouse.'
  },
  'INT-11': {
    name: 'Stripe / CyberSource Digital Commerce Payment Settlement & Clearing',
    sourceSystem: 'Stripe Payments / CyberSource Gateway',
    targetSystem: 'Oracle Accounts Receivable & Cash Management Cloud',
    pillar: 'ERP',
    type: 'inbound_rest',
    complexity: 'S',
    rationale: 'Real-time merchant payment webhook settlement, interchange fee reconciliation, and automated AR cash receipt clearing.'
  },
  'INT-12': {
    name: 'ServiceNow IT Asset Management & Fixed Asset Sync',
    sourceSystem: 'ServiceNow ITAM & CMDB',
    targetSystem: 'Oracle Fixed Assets & Maintenance Cloud',
    pillar: 'ERP',
    type: 'inbound_rest',
    complexity: 'S',
    rationale: 'Capitalized hardware asset tracking, lifecycle status updates, and retirement logging.'
  },
  'INT-13': {
    name: 'Intercompany AGIS Financial Trade Settlement Matrix',
    sourceSystem: 'Oracle Primary Operating Ledger',
    targetSystem: 'Secondary Statutory & Tax Ledgers',
    pillar: 'ERP',
    type: 'bidirectional_sync',
    complexity: 'C',
    rationale: 'Automated intercompany billing handshakes, transfer pricing margin adjustments, and currency revaluation.'
  },
  'INT-14': {
    name: 'Statutory National Tax Authority SAF-T & E-Invoicing Extract',
    sourceSystem: 'Oracle Subledger Accounting & Tax',
    targetSystem: 'National Tax Authorities (SAF-T / Peppol Gateways)',
    pillar: 'ERP',
    type: 'outbound_extract',
    complexity: 'C',
    rationale: 'Multi-jurisdictional government-mandated XML audit extract with digital signatures and Peppol e-invoicing transmission.'
  },
  'INT-15': {
    name: '3PL Logistics Warehouse ASN & Shipping Confirmation (EDI 856 / 945)',
    sourceSystem: 'External 3PL Logistics Partner (DHL/FedEx/XPO)',
    targetSystem: 'Oracle Inventory Management & Shipping Cloud',
    pillar: 'SCM',
    type: 'batch_fbdi',
    complexity: 'C',
    rationale: 'Automated shipping notice ingestion with container tracking and inventory decrement.'
  },
  'INT-16': {
    name: 'B2B EDI 850 Purchase Order Dispatch to Global Suppliers',
    sourceSystem: 'Oracle Purchasing Cloud',
    targetSystem: 'SPS Commerce / OpenText EDI B2B Network',
    pillar: 'SCM',
    type: 'outbound_extract',
    complexity: 'M',
    rationale: 'Outbound purchase order dispatch formatted to ANSI X12 / EDIFACT standards.'
  },
  'INT-17': {
    name: 'Zebra / Honeywell Barcode RF Mobile Scanner Goods Receipt',
    sourceSystem: 'RF Handheld Mobile Barcode Scanners',
    targetSystem: 'Oracle Inventory & Warehouse Management Cloud',
    pillar: 'SCM',
    type: 'inbound_rest',
    complexity: 'S',
    rationale: 'Real-time warehouse purchase order receiving, putaway confirmation, and cycle count recording.'
  },
  'INT-18': {
    name: 'Blue Yonder / O9 Demand Planning Forecast & Consensus Plan',
    sourceSystem: 'Blue Yonder / O9 Solutions Planning',
    targetSystem: 'Oracle Supply Chain Planning Cloud',
    pillar: 'SCM',
    type: 'inbound_rest',
    complexity: 'M',
    rationale: 'Monthly consensus demand plan and statistical forecast ingestion into supply planning.'
  },
  'INT-19': {
    name: 'LabVantage / LIMS Quality Inspection Results & CoA',
    sourceSystem: 'Laboratory Information Management System (LIMS)',
    targetSystem: 'Oracle Quality Management Cloud',
    pillar: 'SCM',
    type: 'inbound_rest',
    complexity: 'M',
    rationale: 'Automated lot disposition and Certificate of Analysis (CoA) recording for released goods.'
  },
  'INT-20': {
    name: 'Shopify Plus / POS Sales Orders Ingestion & Fulfillment',
    sourceSystem: 'Shopify Plus / Retail POS Terminals',
    targetSystem: 'Oracle Order Management & Receivables Cloud',
    pillar: 'SCM',
    type: 'inbound_rest',
    complexity: 'M',
    rationale: 'High-volume multichannel sales order creation, tax line item allocation, and inventory reservations.'
  }
};

/**
 * Checks if an integration item has generic placeholder strings
 */
export function isIntegrationPlaceholder(item: TechnicalIntegrationItem): boolean {
  if (!item) return false;
  const n = (item.name || '').toLowerCase();
  const s = (item.sourceSystem || '').toLowerCase();
  const t = (item.targetSystem || '').toLowerCase();
  const r = (item.rationale || '').toLowerCase();

  return (
    n.includes('inbound rest api #') ||
    n.includes('batch fbdi data sync #') ||
    n.includes('outbound bicc extract #') ||
    n.includes('bidirectional real-time sync #') ||
    n.includes('custom integration endpoint #') ||
    n.includes('placeholder') ||
    n.includes('todo') ||
    n.includes('tbd') ||
    s.includes('external cloud') ||
    s.includes('legacy sftp') ||
    s.includes('external platform') ||
    s.includes('external enterprise system') ||
    s.includes('placeholder') ||
    t.includes('oracle fusion cloud') ||
    t.includes('enterprise lakehouse') ||
    t.includes('placeholder') ||
    r.includes('configured endpoint:')
  );
}

/**
 * Sanitizes an integration item, ensuring INT-11 and all items are 100% concrete enterprise specifications
 */
export function sanitizeIntegrationItem(item: TechnicalIntegrationItem): TechnicalIntegrationItem {
  const code = item.code || '';
  const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];

  if (code === 'INT-11' || isIntegrationPlaceholder(item)) {
    if (std) {
      return {
        ...item,
        name: std.name,
        sourceSystem: std.sourceSystem,
        targetSystem: std.targetSystem,
        pillar: std.pillar,
        rationale: std.rationale
      };
    }
    return {
      ...item,
      name: item.name && !isIntegrationPlaceholder(item) ? item.name : `Enterprise Middleware Interface (${code || 'API'})`,
      sourceSystem: item.sourceSystem && !item.sourceSystem.toLowerCase().includes('external cloud') ? item.sourceSystem : 'Enterprise Core Application',
      targetSystem: item.targetSystem && !item.targetSystem.toLowerCase().includes('oracle fusion cloud') ? item.targetSystem : 'Oracle Cloud ERP & Financials',
      rationale: item.rationale && !item.rationale.toLowerCase().includes('configured endpoint:') ? item.rationale : 'Standard production interface for automated data synchronization and transactional integrity.'
    };
  }

  return item;
}

/**
 * Recalculates and synchronizes technical integrations, scaleDrivers.tech_oic,
 * and technicalSmcOverrides so that all screens are in 100% mathematical unison.
 */
export function syncIntegrationsFromInventory(
  items: TechnicalIntegrationItem[],
  prevScenario: ProjectScenario,
  ricefwCounts?: {
    integrations?: number;
    reports_bip?: number;
    reports_otbi?: number;
    conversions?: number;
    paas?: number;
    workflows?: number;
    security_roles?: number;
    fast_formulas?: number;
  },
  ricefwSmcOverrides?: Record<string, { simple: number; medium: number; complex: number }>
): ProjectScenario {
  const currentOverrides = prevScenario.technicalSmcOverrides || {};
  const cleanItems = (items || []).map(sanitizeIntegrationItem);

  // Count items by category and complexity
  const inboundItems = cleanItems.filter(i => i.type === 'inbound_rest');
  const batchFbdiItems = cleanItems.filter(i => i.type === 'batch_fbdi');
  const outboundItems = cleanItems.filter(i => i.type === 'outbound_extract');
  const bidirectionalItems = cleanItems.filter(i => i.type === 'bidirectional_sync' || i.type === 'event_driven');

  const getTierCounts = (subset: TechnicalIntegrationItem[]) => {
    let simple = 0;
    let medium = 0;
    let complex = 0;
    subset.forEach(i => {
      if (i.complexity === 'S') simple++;
      else if (i.complexity === 'M') medium++;
      else complex++; // C or XL
    });
    return { simple, medium, complex };
  };

  const updatedOverrides = {
    ...currentOverrides,
    int_inbound_rest: getTierCounts(inboundItems),
    int_batch_fbdi: getTierCounts(batchFbdiItems),
    int_outbound_extract: getTierCounts(outboundItems),
    int_bidirectional_sync: getTierCounts(bidirectionalItems),
    ...(ricefwSmcOverrides || {})
  };

  const currentScaleDrivers = prevScenario.scaleDrivers;
  const updatedScaleDrivers: ScaleDrivers = {
    ...currentScaleDrivers,
    tech_oic: items.length,
    ...(ricefwCounts?.reports_bip ? { tech_reports_bip: (currentScaleDrivers.tech_reports_bip || 0) + ricefwCounts.reports_bip } : {}),
    ...(ricefwCounts?.reports_otbi ? { tech_reports_otbi: (currentScaleDrivers.tech_reports_otbi || 0) + ricefwCounts.reports_otbi } : {}),
    ...(ricefwCounts?.conversions ? { tech_data_objects: (currentScaleDrivers.tech_data_objects || 0) + ricefwCounts.conversions } : {}),
    ...(ricefwCounts?.paas ? { tech_paas: (currentScaleDrivers.tech_paas || 0) + ricefwCounts.paas } : {}),
    ...(ricefwCounts?.workflows ? { tech_workflows: (currentScaleDrivers.tech_workflows || 0) + ricefwCounts.workflows } : {}),
    ...(ricefwCounts?.security_roles ? { tech_security_roles: (currentScaleDrivers.tech_security_roles || 0) + ricefwCounts.security_roles } : {}),
    ...(ricefwCounts?.fast_formulas ? { tech_fast_formulas: (currentScaleDrivers.tech_fast_formulas || 0) + ricefwCounts.fast_formulas } : {})
  };

  return {
    ...prevScenario,
    technicalIntegrations: items,
    technicalSmcOverrides: updatedOverrides,
    scaleDrivers: updatedScaleDrivers
  };
}

/**
 * Synchronizes technicalIntegrations and scaleDrivers from technicalSmcOverrides
 * WITHOUT clobbering or overwriting the user's explicit S/M/C counts.
 * Guarantees that when a user customizes Simple, Medium, or Complex counts
 * in the RICEFW / SMC table, their changes are permanently preserved.
 */
export function syncIntegrationsFromOverrides(
  scenario: ProjectScenario
): ProjectScenario {
  const overrides = scenario.technicalSmcOverrides || {};
  const currentList = scenario.technicalIntegrations !== undefined ? scenario.technicalIntegrations : [];

  const integrationCatalogConfigs = [
    {
      typeId: 'int_inbound_rest',
      type: 'inbound_rest' as const,
      defaultName: 'Inbound REST API',
      source: 'External Cloud',
      target: 'Oracle Fusion Cloud'
    },
    {
      typeId: 'int_batch_fbdi',
      type: 'batch_fbdi' as const,
      defaultName: 'Batch FBDI Data Sync',
      source: 'Legacy SFTP',
      target: 'Oracle Fusion Cloud'
    },
    {
      typeId: 'int_outbound_extract',
      type: 'outbound_extract' as const,
      defaultName: 'Outbound BICC Extract',
      source: 'Oracle Fusion Cloud',
      target: 'Enterprise Lakehouse'
    },
    {
      typeId: 'int_bidirectional_sync',
      type: 'bidirectional_sync' as const,
      defaultName: 'Bidirectional Real-Time Sync',
      source: 'External Platform',
      target: 'Oracle Fusion Cloud'
    }
  ];

  let totalSimple = 0;
  let totalMedium = 0;
  let totalComplex = 0;
  const newItemsList: TechnicalIntegrationItem[] = [];
  let itemCodeCounter = 1;

  integrationCatalogConfigs.forEach(config => {
    const row = TECHNICAL_OBJECT_SMC_CATALOG.find(r => r.typeId === config.typeId);
    const eff = row ? getEffectiveSmcCounts(row, scenario) : { simple: 0, medium: 0, complex: 0, totalCount: 0, totalHours: 0 };
    const ov = overrides[config.typeId];
    const simple = ov?.simple !== undefined ? ov.simple : eff.simple;
    const medium = ov?.medium !== undefined ? ov.medium : eff.medium;
    const complex = ov?.complex !== undefined ? ov.complex : eff.complex;

    totalSimple += simple;
    totalMedium += medium;
    totalComplex += complex;

    const existingMatchingItems = currentList.filter(it => it.type === config.type);

    const targetTiers: TechnicalComplexityTier[] = [
      ...Array(simple).fill('S' as TechnicalComplexityTier),
      ...Array(medium).fill('M' as TechnicalComplexityTier),
      ...Array(complex).fill('C' as TechnicalComplexityTier)
    ];

    targetTiers.forEach((tier, idx) => {
      const existing = existingMatchingItems[idx];
      const qAnswers = {
        patternDirection: config.type === 'bidirectional_sync' ? 2 : (config.type === 'outbound_extract' ? 1 : 0),
        mappingComplexity: tier === 'S' ? 0 : (tier === 'C' ? 2 : 1),
        connectivityProtocol: tier === 'C' ? 2 : (tier === 'M' ? 1 : 0),
        dataVolume: tier === 'C' ? 2 : 1,
        errorHandling: tier === 'C' ? 2 : (tier === 'M' ? 1 : 0),
        apiReadiness: 0
      };
      const effort = calculateIntegrationEffort(qAnswers, config.type);
      const hours = tier === 'S' ? (row?.simpleHours || 50) : (tier === 'M' ? (row?.mediumHours || 90) : (row?.complexHours || 180));

      if (existing) {
        newItemsList.push(sanitizeIntegrationItem({
          ...existing,
          complexity: tier,
          calculatedHours: hours,
          questionAnswers: qAnswers,
          compositeScore: effort.compositeScore,
          calculationFormula: effort.calculationFormula
        }));
      } else {
        const code = `INT-${String(itemCodeCounter++).padStart(2, '0')}`;
        const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];
        newItemsList.push(sanitizeIntegrationItem({
          id: `int_${config.type}_${Date.now()}_${idx + 1}`,
          code,
          name: std ? std.name : `${config.defaultName} (${code})`,
          pillar: std ? std.pillar : 'ERP',
          sourceSystem: std ? std.sourceSystem : config.source,
          targetSystem: std ? std.targetSystem : config.target,
          type: config.type,
          complexity: tier,
          isQuestionDriven: true,
          questionAnswers: qAnswers,
          baseHours: 45,
          calculatedHours: hours,
          calculationFormula: effort.calculationFormula,
          compositeScore: effort.compositeScore,
          rationale: std ? std.rationale : `Enterprise endpoint: ${std?.sourceSystem || config.source} → ${std?.targetSystem || config.target} (${tier})`
        }));
      }
    });
  });

  const totalOic = newItemsList.length;

  return {
    ...scenario,
    technicalIntegrations: newItemsList,
    technicalSmcOverrides: overrides,
    scaleDrivers: {
      ...scenario.scaleDrivers,
      tech_oic: totalOic
    },
    integrationScopingOptions: {
      ...scenario.integrationScopingOptions,
      simpleCount: totalSimple,
      mediumCount: totalMedium,
      complexCount: totalComplex,
      extraLargeCount: 0
    }
  };
}

/**
 * Resizes the itemized integrations list and synchronizes technicalSmcOverrides
 * when a user alters the aggregate integration count (e.g. via scale driver slider or direct input).
 * Fully preserves any existing manual complexity overrides.
 */
export function syncIntegrationsFromCount(
  targetCount: number,
  prevScenario: ProjectScenario
): ProjectScenario {
  const safeCount = Math.max(0, targetCount);

  if (safeCount === 0) {
    const zeroOverrides = {
      ...(prevScenario.technicalSmcOverrides || {}),
      int_inbound_rest: { simple: 0, medium: 0, complex: 0 },
      int_batch_fbdi: { simple: 0, medium: 0, complex: 0 },
      int_outbound_extract: { simple: 0, medium: 0, complex: 0 },
      int_bidirectional_sync: { simple: 0, medium: 0, complex: 0 }
    };
    return {
      ...prevScenario,
      technicalIntegrations: [],
      technicalSmcOverrides: zeroOverrides,
      scaleDrivers: {
        ...prevScenario.scaleDrivers,
        tech_oic: 0
      },
      integrationScopingOptions: {
        ...prevScenario.integrationScopingOptions,
        simpleCount: 0,
        mediumCount: 0,
        complexCount: 0,
        extraLargeCount: 0
      }
    };
  }

  // Check if existing overrides sum matches safeCount
  const intCatalog = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'integrations');
  const currentOverrides = prevScenario.technicalSmcOverrides || {};
  let currentTotalFromOverrides = 0;
  intCatalog.forEach(r => {
    const ov = currentOverrides[r.typeId];
    if (ov) {
      currentTotalFromOverrides += (ov.simple || 0) + (ov.medium || 0) + (ov.complex || 0);
    }
  });

  // If overrides already match safeCount, synchronize item list directly from overrides
  if (currentTotalFromOverrides === safeCount && currentTotalFromOverrides > 0) {
    return syncIntegrationsFromOverrides(prevScenario);
  }

  // Otherwise, distribute safeCount into industry-standard Oracle Cloud baseline:
  // Inbound REST: ~50%, Outbound: ~25%, Bidirectional: ~25%
  const inboundCount = Math.ceil(safeCount * 0.50);
  const remaining = safeCount - inboundCount;
  const outboundCount = Math.ceil(remaining * 0.50);
  const bidirectionalCount = safeCount - inboundCount - outboundCount;

  const toTiers = (count: number) => {
    const simple = Math.round(count * 0.20);
    const complex = Math.round(count * 0.20);
    const medium = Math.max(0, count - simple - complex);
    return { simple, medium, complex };
  };

  const updatedOverrides = {
    ...currentOverrides,
    int_inbound_rest: toTiers(inboundCount),
    int_batch_fbdi: { simple: 0, medium: 0, complex: 0 },
    int_outbound_extract: toTiers(outboundCount),
    int_bidirectional_sync: toTiers(bidirectionalCount)
  };

  const scenarioWithOverrides = {
    ...prevScenario,
    technicalSmcOverrides: updatedOverrides
  };

  return syncIntegrationsFromOverrides(scenarioWithOverrides);
}

/**
 * Returns the effective SMC counts for a specific row in the SMC Matrix or RICEFW summary.
 * Crucially, honors scenario's scale drivers and clean slate states rather than
 * blind-falling back to default counts when counts are explicitly 0.
 */
export function getEffectiveSmcCounts(
  row: TechnicalObjectSmcRow,
  scenario: ProjectScenario
): { simple: number; medium: number; complex: number; totalCount: number; totalHours: number } {
  const override = scenario.technicalSmcOverrides?.[row.typeId];

  if (override !== undefined) {
    const simple = override.simple !== undefined ? override.simple : 0;
    const medium = override.medium !== undefined ? override.medium : 0;
    const complex = override.complex !== undefined ? override.complex : 0;
    const totalCount = simple + medium + complex;
    const totalHours = (simple * row.simpleHours) + (medium * row.mediumHours) + (complex * row.complexHours);
    return { simple, medium, complex, totalCount, totalHours };
  }

  // If no override exists, determine if this category is explicitly 0 in scaleDrivers
  const sd: any = scenario.scaleDrivers || {};
  let categoryIsZero = false;

  if (row.category === 'integrations') {
    if (scenario.technicalIntegrations !== undefined && scenario.technicalIntegrations.length === 0) {
      categoryIsZero = true;
    } else if (sd.tech_oic === 0) {
      categoryIsZero = true;
    }
  } else if (row.category === 'paas') {
    categoryIsZero = sd.tech_paas === 0;
  } else if (row.category === 'reports_bip') {
    categoryIsZero = sd.tech_reports_bip === 0;
  } else if (row.category === 'reports_otbi') {
    categoryIsZero = sd.tech_reports_otbi === 0;
  } else if (row.category === 'fast_formulas') {
    categoryIsZero = sd.tech_fast_formulas === 0;
  } else if (row.category === 'workflows') {
    categoryIsZero = sd.tech_workflows === 0;
  } else if (row.category === 'security_roles') {
    categoryIsZero = sd.tech_security_roles === 0;
  } else if (row.category === 'conversions') {
    categoryIsZero = sd.tech_data_objects === 0;
  }

  // If the scenario has no modules and no scale drivers (Clean Slate), default to 0
  const isCleanSlate = (scenario.selectedModules || []).length === 0 && (sd.tech_oic === 0 || sd.tech_oic === undefined);
  if (categoryIsZero || isCleanSlate) {
    return { simple: 0, medium: 0, complex: 0, totalCount: 0, totalHours: 0 };
  }

  // Otherwise fallback to the benchmark default catalog counts
  const simple = row.simpleCount;
  const medium = row.mediumCount;
  const complex = row.complexCount;
  const totalCount = simple + medium + complex;
  const totalHours = (simple * row.simpleHours) + (medium * row.mediumHours) + (complex * row.complexHours);
  return { simple, medium, complex, totalCount, totalHours };
}

/**
 * Creates a 100% pristine Blank Slate Scenario with zero residual defaults,
 * zero modules, zero integrations, zero conversions, and clean drivers.
 */
export function generateBlankSlateScenario(
  proposalNameOrOptions?: string | {
    proposalName?: string;
    thorId?: string;
    clientName?: string;
    industry?: string;
    targetStartDate?: string;
    clientTargetGoLiveDate?: string;
    description?: string;
    rolloutApproach?: RolloutApproach;
    projectWeeks?: number;
  },
  thorIdArg?: string,
  clientNameArg?: string,
  industryArg?: string
): ProjectScenario {
  const opts = typeof proposalNameOrOptions === 'object' && proposalNameOrOptions !== null
    ? proposalNameOrOptions
    : {
        proposalName: typeof proposalNameOrOptions === 'string' ? proposalNameOrOptions : 'Clean Slate Proposal',
        thorId: thorIdArg || 'THOR-PROPOSAL-001',
        clientName: clientNameArg || 'New Enterprise Client',
        industry: industryArg || 'Cross-Industry Standard'
      };

  const finalProposalName = opts.proposalName || 'Clean Slate Proposal';
  const finalThorId = opts.thorId || 'THOR-PROPOSAL-001';
  const finalClientName = opts.clientName || 'New Enterprise Client';
  const finalIndustry = opts.industry || 'Cross-Industry Standard';
  const finalStartDate = opts.targetStartDate || new Date().toISOString().split('T')[0];
  const finalWeeks = typeof opts.projectWeeks === 'number' ? opts.projectWeeks : 0;
  const finalGoLiveDate = opts.clientTargetGoLiveDate || (finalWeeks > 0 ? new Date(Date.now() + finalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : finalStartDate);
  const finalDescription = opts.description || `Clean slate Oracle Cloud implementation proposal for ${finalClientName} (${finalIndustry}). Pristine zero-module baseline ready for custom scoping or integrations.`;
  const finalRollout = opts.rolloutApproach || 'big_bang';

  // Explicitly clear all SMC catalog overrides to 0 so no ghost counts leak through
  const zeroSmcOverrides: Record<string, { simple: number; medium: number; complex: number }> = {};
  TECHNICAL_OBJECT_SMC_CATALOG.forEach(r => {
    zeroSmcOverrides[r.typeId] = { simple: 0, medium: 0, complex: 0 };
  });

  return {
    id: `proposal_clean_${Date.now()}`,
    name: finalProposalName,
    thorId: finalThorId,
    clientName: finalClientName,
    industry: finalIndustry,
    description: finalDescription,
    selectedModules: [],
    customModules: [],
    customModuleQuestions: {},
    moduleTShirtOverrides: {},
    moduleQuestionAnswers: {},
    rolloutQuestionAnswers: {},
    scaleDrivers: {
      scm_plants: 0,
      scm_wh: 0,
      scm_inv: 0,
      fin_ent: 0,
      fin_led: 0,
      fin_bu: 0,
      fin_cur: 0,
      fin_tax: 0,
      fin_coa_segments: 0,
      fin_secondary_ledgers: 0,
      fin_sla_rules: 0,
      fin_intercompany_pairs: 0,
      fin_einvoicing_countries: 0,
      fin_bank_cert_weeks: 8,
      fin_cutover_strategy: 'day1_fiscal',
      hcm_hc: 0,
      hcm_pay_countries: 0,
      hcm_union_groups: 0,
      tech_oic: 0,
      tech_paas: 0,
      tech_data_objects: 0,
      tech_conversion_cycles: 0,
      tech_historical_years: 0,
      tech_reports_bip: 0,
      tech_reports_otbi: 0,
      tech_fast_formulas: 0,
      tech_workflows: 0,
      tech_bpm_approval_groups: 0,
      tech_security_roles: 0,
      tech_cutover_dr_runs: 0,
      test_sit_cycles: 0,
      test_uat_cycles: 0,
      test_scripts_count: 0,
      test_automation_pct: 0,
      test_perf_runs: 0,
      test_payroll_parallels: 0
    },
    complexityAnswers: {
      functional: [0, 0],
      technical: [0, 0],
      data: [0, 0],
      ocm: [0, 0],
      governance: [0, 0]
    },
    clientModifiers: {
      decisionVelocity: 1.0,
      dataDebt: 1.0,
      cloudMindset: 1.0,
      integrationVolatility: 1.0,
      smeAvailability: 1.0,
      regulatoryCompliance: 1.0,
      changeResistance: 1.0
    },
    deliveryMix: {
      onshore: 20,
      nearshore: 0,
      offshore: 80
    },
    podCohort: 'B' as PodCohort,
    rolloutApproach: finalRollout,
    rolloutWaves: 1,
    rolloutOverlapWeeks: 0,
    blackoutPeriods: [],
    phaseDeliveryModel: 'sequential',
    waveDescriptions: ['Wave 1: Initial Implementation'],
    projectWeeks: finalWeeks,
    targetStartDate: finalStartDate,
    clientTargetGoLiveDate: finalGoLiveDate,
    confidence: 0.85,
    contingencyPctOverride: 0.15,
    globalComplexityMultiplier: 1.0,
    technicalIntegrations: [],
    technicalSmcOverrides: zeroSmcOverrides,
    clientIntel: undefined,
    industryIntel: undefined,
    specSheetIntel: undefined,
    intelSynthesis: undefined,
    isBlackoutLocked: false,
    isScheduleFrozen: false,
    auditLog: []
  };
}

export function generateIntegrationsOnlyScenario(opts?: {
  proposalName?: string;
  thorId?: string;
  clientName?: string;
  industry?: string;
  targetStartDate?: string;
  projectWeeks?: number;
  clientTargetGoLiveDate?: string;
  tier?: 'small' | 'medium' | 'large';
  simpleCount?: number;
  mediumCount?: number;
  complexCount?: number;
  extraLargeCount?: number;
  includeErrorFramework?: boolean;
  includeCanonicalDataModel?: boolean;
  includePartnerCoTesting?: boolean;
  includeB2BEdiSupport?: boolean;
  targetSystems?: string[];
}): ProjectScenario {
  const finalProposalName = opts?.proposalName || 'OIC Middleware & Integration Scope';
  const finalThorId = opts?.thorId || 'THOR-INT-001';
  const finalClientName = opts?.clientName || 'Enterprise Integration Program';
  const finalIndustry = opts?.industry || 'Cross-Industry Standard';
  const finalStartDate = opts?.targetStartDate || new Date().toISOString().split('T')[0];
  const finalWeeks = typeof opts?.projectWeeks === 'number' ? opts.projectWeeks : 20;
  const finalGoLiveDate = opts?.clientTargetGoLiveDate || new Date(Date.now() + finalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const tier = opts?.tier || 'medium';
  const s = opts?.simpleCount ?? (tier === 'small' ? 4 : tier === 'medium' ? 8 : 15);
  const m = opts?.mediumCount ?? (tier === 'small' ? 5 : tier === 'medium' ? 12 : 22);
  const c = opts?.complexCount ?? (tier === 'small' ? 1 : tier === 'medium' ? 5 : 10);
  const xl = opts?.extraLargeCount ?? (tier === 'small' ? 0 : tier === 'medium' ? 0 : 3);
  const totalCount = s + m + c + xl;

  const targetSystems = opts?.targetSystems || ['Salesforce CRM', 'Workday Core', 'SAP S/4HANA', 'JPMorgan Chase / SWIFT Banking', 'ServiceNow'];

  const zeroSmcOverrides: Record<string, { simple: number; medium: number; complex: number }> = {};
  TECHNICAL_OBJECT_SMC_CATALOG.forEach(r => {
    zeroSmcOverrides[r.typeId] = { simple: 0, medium: 0, complex: 0 };
  });

  return {
    id: `proposal_int_${Date.now()}`,
    name: finalProposalName,
    thorId: finalThorId,
    clientName: finalClientName,
    industry: finalIndustry,
    description: `Dedicated Oracle Integration Cloud (OIC) standalone middleware implementation for ${finalClientName}. Scope covers ${totalCount} interfaces (${s} Simple, ${m} Medium, ${c} Complex${xl > 0 ? `, ${xl} Extra Large` : ''}), enterprise exception framework, and joint endpoint testing.`,
    scopeMode: 'integrations_only',
    integrationScopingOptions: {
      includeErrorFramework: opts?.includeErrorFramework !== undefined ? opts.includeErrorFramework : true,
      includeCanonicalDataModel: opts?.includeCanonicalDataModel !== undefined ? opts.includeCanonicalDataModel : true,
      includePartnerCoTesting: opts?.includePartnerCoTesting !== undefined ? opts.includePartnerCoTesting : true,
      includeB2BEdiSupport: opts?.includeB2BEdiSupport !== undefined ? opts.includeB2BEdiSupport : false,
      targetSystems,
      devSquadSize: 4,
      simpleCount: s,
      mediumCount: m,
      complexCount: c,
      extraLargeCount: xl
    },
    selectedModules: [],
    customModules: [],
    customModuleQuestions: {},
    moduleTShirtOverrides: {},
    moduleQuestionAnswers: {},
    rolloutQuestionAnswers: {},
    scaleDrivers: {
      scm_plants: 0,
      scm_wh: 0,
      scm_inv: 0,
      fin_ent: 0,
      fin_led: 0,
      fin_bu: 0,
      fin_cur: 0,
      fin_tax: 0,
      fin_coa_segments: 0,
      fin_secondary_ledgers: 0,
      fin_sla_rules: 0,
      fin_intercompany_pairs: 0,
      fin_einvoicing_countries: 0,
      fin_bank_cert_weeks: 8,
      fin_cutover_strategy: 'day1_fiscal',
      hcm_hc: 0,
      hcm_pay_countries: 0,
      hcm_union_groups: 0,
      tech_oic: totalCount,
      tech_paas: 0,
      tech_data_objects: 0,
      tech_conversion_cycles: 0,
      tech_historical_years: 0,
      tech_reports_bip: 0,
      tech_reports_otbi: 0,
      tech_fast_formulas: 0,
      tech_workflows: 0,
      tech_bpm_approval_groups: 0,
      tech_security_roles: 4,
      tech_cutover_dr_runs: 1,
      test_sit_cycles: 2,
      test_uat_cycles: 1,
      test_scripts_count: totalCount * 6,
      test_automation_pct: 20,
      test_perf_runs: 1,
      test_payroll_parallels: 0
    },
    complexityAnswers: {
      functional: [0, 0],
      technical: [2, 2],
      data: [0, 0],
      ocm: [0, 0],
      governance: [1, 1]
    },
    clientModifiers: {
      decisionVelocity: 1.0,
      dataDebt: 1.0,
      cloudMindset: 1.0,
      integrationVolatility: 1.05,
      smeAvailability: 1.0,
      regulatoryCompliance: 1.0,
      changeResistance: 1.0
    },
    deliveryMix: {
      onshore: 25,
      nearshore: 25,
      offshore: 50
    },
    podCohort: 'B' as PodCohort,
    rolloutApproach: 'big_bang',
    rolloutWaves: 1,
    rolloutOverlapWeeks: 0,
    blackoutPeriods: [],
    phaseDeliveryModel: 'sequential',
    waveDescriptions: ['Wave 1: Enterprise Integration Rollout'],
    projectWeeks: finalWeeks,
    targetStartDate: finalStartDate,
    clientTargetGoLiveDate: finalGoLiveDate,
    confidence: 0.85,
    contingencyPctOverride: 0.15,
    globalComplexityMultiplier: 1.0,
    technicalIntegrations: [],
    technicalSmcOverrides: zeroSmcOverrides,
    clientIntel: undefined,
    industryIntel: undefined,
    specSheetIntel: undefined,
    intelSynthesis: undefined,
    isBlackoutLocked: false,
    isScheduleFrozen: false,
    auditLog: []
  };
}
