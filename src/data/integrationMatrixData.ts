import { IntegrationMatrixItem, IntegrationComplexityLevel } from '../types';

export const INTEGRATION_COMPLEXITY_CONFIG: Record<IntegrationComplexityLevel, {
  label: string;
  multiplier: number;
  baseHours: number;
  badgeClass: string;
  color: string;
  description: string;
}> = {
  Simple: {
    label: 'Simple (0.85x)',
    multiplier: 0.85,
    baseHours: 45,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    color: '#059669',
    description: '1:1 direct field mapping, standard REST/JSON adapter, point-to-point, minimal business logic.'
  },
  Medium: {
    label: 'Medium (1.20x)',
    multiplier: 1.20,
    baseHours: 85,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
    color: '#2563eb',
    description: 'Multi-entity orchestration, DVM cross-referencing, batch pagination, error hospital retry queue.'
  },
  Complex: {
    label: 'Complex (1.75x)',
    multiplier: 1.75,
    baseHours: 160,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300',
    color: '#7c3aed',
    description: 'Heavy bidirectional choreography, transactional locks, custom canonical schema, high throughput or legacy protocol bridging.'
  }
};

export const DEFAULT_INTEGRATION_MATRIX_ITEMS: IntegrationMatrixItem[] = [
  {
    id: 'mat_int_01',
    name: 'Salesforce CPQ & CRM to Oracle Order Management',
    complexity: 'Medium',
    oracleModuleId: 'scm_om',
    oracleModuleName: 'Order Management Cloud',
    direction: 'Bidirectional',
    connectedSystem: 'Salesforce Sales Cloud & CPQ',
    estimatedHours: 90,
    notes: 'Real-time CPQ booked quote sync, order validation, inventory reservation, and status back-propagation.'
  },
  {
    id: 'mat_int_02',
    name: 'Workday HCM to Oracle General Ledger Payroll Postings',
    complexity: 'Medium',
    oracleModuleId: 'erp_gl',
    oracleModuleName: 'General Ledger Cloud',
    direction: 'Inbound',
    connectedSystem: 'Workday HCM',
    estimatedHours: 85,
    notes: 'Bi-weekly payroll summary journals, labor cost allocations, and department segment derivations.'
  },
  {
    id: 'mat_int_03',
    name: 'ADP Global Payroll to Oracle Cash Management & Accounts Payable',
    complexity: 'Simple',
    oracleModuleId: 'erp_ap',
    oracleModuleName: 'Accounts Payable Cloud',
    direction: 'Inbound',
    connectedSystem: 'ADP Workforce Now',
    estimatedHours: 50,
    notes: 'Net pay disbursements, third-party garnishment liabilities, and tax authority payment batches.'
  },
  {
    id: 'mat_int_04',
    name: 'Bank ISO 20022 XML Host-to-Host Payments & MT940 Reconciliation',
    complexity: 'Complex',
    oracleModuleId: 'erp_cm',
    oracleModuleName: 'Cash Management Cloud',
    direction: 'Bidirectional',
    connectedSystem: 'J.P. Morgan / Citi H2H',
    estimatedHours: 175,
    notes: 'Encrypted SFTP AS2 gateway for pain.001 credit transfers, camt.053 bank statements, and MT940 daily reconciliations.'
  },
  {
    id: 'mat_int_05',
    name: 'Coupa Supplier Invoices & PO Synchronization',
    complexity: 'Medium',
    oracleModuleId: 'erp_proc',
    oracleModuleName: 'Procurement Cloud',
    direction: 'Inbound',
    connectedSystem: 'Coupa BSM',
    estimatedHours: 80,
    notes: '2-way and 3-way invoice matching, PO flip receipt confirmations, and supplier payment status sync.'
  },
  {
    id: 'mat_int_06',
    name: 'Shopify Plus Digital Commerce Orders & Inventory Sync',
    complexity: 'Medium',
    oracleModuleId: 'scm_om',
    oracleModuleName: 'Order Management Cloud',
    direction: 'Bidirectional',
    connectedSystem: 'Shopify Plus',
    estimatedHours: 90,
    notes: 'Web checkout order intake, merchant credit card settlements, and automated ATP inventory broadcast.'
  },
  {
    id: 'mat_int_07',
    name: '3PL WMS Shipment Confirmations & ASN Ingestion',
    complexity: 'Complex',
    oracleModuleId: 'scm_inv',
    oracleModuleName: 'Inventory & Cost Management',
    direction: 'Bidirectional',
    connectedSystem: 'Manhattan Associates WMS',
    estimatedHours: 165,
    notes: 'Outbound pick release orders, inbound ASN receipt confirmation, serial/lot tracking, and inventory cycle adjustments.'
  },
  {
    id: 'mat_int_08',
    name: 'Vertex O Series Real-Time Sales & Use Tax Calculation',
    complexity: 'Simple',
    oracleModuleId: 'erp_tax',
    oracleModuleName: 'Tax Cloud',
    direction: 'Bidirectional',
    connectedSystem: 'Vertex O Series',
    estimatedHours: 45,
    notes: 'Pre-certified Oracle Cloud Tax Partner adapter for sub-second sales, use, and VAT tax calculation.'
  },
  {
    id: 'mat_int_09',
    name: 'ServiceNow IT Asset Tracking to Oracle Fixed Assets',
    complexity: 'Simple',
    oracleModuleId: 'erp_fa',
    oracleModuleName: 'Fixed Assets Cloud',
    direction: 'Inbound',
    connectedSystem: 'ServiceNow ITAM',
    estimatedHours: 45,
    notes: 'Hardware capitalization, asset commissioning, custodian changes, and retirement tracking.'
  },
  {
    id: 'mat_int_10',
    name: 'Enterprise Snowflake Lakehouse Outbound BICC VO Extract',
    complexity: 'Medium',
    oracleModuleId: 'erp_gl',
    oracleModuleName: 'General Ledger Cloud',
    direction: 'Outbound',
    connectedSystem: 'Snowflake / AWS S3',
    estimatedHours: 85,
    notes: 'Scheduled incremental BICC View Object extracts to corporate analytics lakehouse.'
  },
  {
    id: 'mat_int_11',
    name: 'SAP Concur Employee Expenses to Oracle Accounts Payable',
    complexity: 'Simple',
    oracleModuleId: 'erp_ap',
    oracleModuleName: 'Accounts Payable Cloud',
    direction: 'Inbound',
    connectedSystem: 'SAP Concur',
    estimatedHours: 50,
    notes: 'Approved expense reports, mileage logs, and employee reimbursement payment requests.'
  },
  {
    id: 'mat_int_12',
    name: 'MES Factory Floor Execution to Oracle Discrete Manufacturing',
    complexity: 'Complex',
    oracleModuleId: 'scm_mfg',
    oracleModuleName: 'Manufacturing Cloud',
    direction: 'Bidirectional',
    connectedSystem: 'Rockwell FactoryTalk MES',
    estimatedHours: 170,
    notes: 'Work order dispatch, scrap recording, machine uptime telemetry, and finished goods completion.'
  }
];

export interface MatrixMetricsResult {
  totalCount: number;
  simpleCount: number;
  mediumCount: number;
  complexCount: number;
  blendedMultiplier: number;
  dominantComplexity: 'simple' | 'medium' | 'complex';
  totalEstimatedHours: number;
  moduleCounts: Record<string, number>;
}

export function calculateMatrixMetrics(items: IntegrationMatrixItem[]): MatrixMetricsResult {
  const totalCount = items.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      simpleCount: 0,
      mediumCount: 0,
      complexCount: 0,
      blendedMultiplier: 1.20,
      dominantComplexity: 'medium',
      totalEstimatedHours: 0,
      moduleCounts: {}
    };
  }

  let simpleCount = 0;
  let mediumCount = 0;
  let complexCount = 0;
  let totalHours = 0;
  const moduleCounts: Record<string, number> = {};

  items.forEach(item => {
    if (item.complexity === 'Simple') {
      simpleCount++;
      totalHours += item.estimatedHours || INTEGRATION_COMPLEXITY_CONFIG.Simple.baseHours;
    } else if (item.complexity === 'Complex') {
      complexCount++;
      totalHours += item.estimatedHours || INTEGRATION_COMPLEXITY_CONFIG.Complex.baseHours;
    } else {
      mediumCount++;
      totalHours += item.estimatedHours || INTEGRATION_COMPLEXITY_CONFIG.Medium.baseHours;
    }

    const modKey = item.oracleModuleId || 'other';
    moduleCounts[modKey] = (moduleCounts[modKey] || 0) + 1;
  });

  // Calculate weighted blended multiplier:
  // Simple: 0.85, Medium: 1.20, Complex: 1.75
  const weightedSum = (simpleCount * 0.85) + (mediumCount * 1.20) + (complexCount * 1.75);
  const blendedMultiplier = Number((weightedSum / totalCount).toFixed(2));

  // Determine dominant complexity level
  let dominantComplexity: 'simple' | 'medium' | 'complex' = 'medium';
  if (complexCount >= mediumCount && complexCount >= simpleCount && complexCount > 0) {
    dominantComplexity = 'complex';
  } else if (simpleCount > mediumCount && simpleCount > complexCount) {
    dominantComplexity = 'simple';
  } else {
    dominantComplexity = 'medium';
  }

  return {
    totalCount,
    simpleCount,
    mediumCount,
    complexCount,
    blendedMultiplier,
    dominantComplexity,
    totalEstimatedHours: Math.round(totalHours),
    moduleCounts
  };
}
