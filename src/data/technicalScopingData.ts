import {
  TechnicalScopingQuestion,
  TechnicalIntegrationItem,
  TechnicalObjectSmcRow,
  IntegrationQuestionAnswers,
  TechnicalIntegrationType,
  TechnicalComplexityTier,
  TechnicalTShirtSize,
  TechnicalWorkstreamTShirtBenchmark,
  ConversionTShirtSize,
  ConversionTShirtBenchmark,
  ConversionEntityItem
} from '../types';

// 6 Core Technical Scoping Questions for OIC / Cloud Integrations
export const INTEGRATION_SCOPING_QUESTIONS: TechnicalScopingQuestion[] = [
  {
    id: 'patternDirection',
    title: '1. Integration Pattern & Flow Directionality',
    category: 'Architecture & Flow',
    description: 'Defines the structural interaction pattern, synchronicity, and event triggers.',
    options: [
      {
        label: 'Inbound 1-Way (Asynchronous / Batch / REST Endpoint)',
        score: 1,
        multiplier: 1.0,
        description: 'Single direction receiving payload from external system into Oracle Cloud with standard ACK response.',
        rationale: 'Baseline effort for standard single-way integration pipe.'
      },
      {
        label: 'Outbound 1-Way (BICC / BIP Extract / Webhook Push)',
        score: 2,
        multiplier: 1.15,
        description: 'Extracting data from Oracle Cloud SaaS, formatting, and dispatching to downstream endpoint or SFTP.',
        rationale: 'Requires BICC/BIP data model query design and endpoint delivery coordination.'
      },
      {
        label: 'Bidirectional Synchronous Real-Time (Request / Reply)',
        score: 3,
        multiplier: 1.55,
        description: 'Two-way real-time handshakes (e.g. CPQ pricing quote sync, credit check, real-time inventory ATP check).',
        rationale: 'Requires tight SLA timeout management, dual payload mapping, and rollback handling.'
      },
      {
        label: 'Event-Driven Pub/Sub & Business Event Triggers',
        score: 4,
        multiplier: 1.75,
        description: 'Oracle Fusion Business Events / Kafka / OCI Streaming subscription with stateful consumer management.',
        rationale: 'Requires event subscription configuration, idempotency tracking, and event deduplication.'
      }
    ]
  },
  {
    id: 'mappingComplexity',
    title: '2. Transformation & Data Mapping Complexity',
    category: 'Data Mapping',
    description: 'Field count, structural hierarchy transformations, lookups, and custom business rules.',
    options: [
      {
        label: 'Direct 1:1 Mapping (< 15 Fields, No Lookups)',
        score: 1,
        multiplier: 0.85,
        description: 'Simple passthrough mapping with minimal type conversion and zero domain value maps (DVMs).',
        rationale: 'Lightweight transformation footprint.'
      },
      {
        label: 'Standard Mapping (15–50 Fields, DVM Lookups & Format Rules)',
        score: 2,
        multiplier: 1.2,
        description: 'Standard enterprise payload with code cross-referencing, date/currency formatting, and conditional routing.',
        rationale: 'Typical enterprise integration mapping effort.'
      },
      {
        label: 'Complex Multi-Entity Hierarchy (50–120 Fields, Custom XSLT / JS)',
        score: 3,
        multiplier: 1.7,
        description: 'Nested master-detail relationships (Header/Lines/Distributions), custom JavaScript/XSLT functions, and multi-value lookups.',
        rationale: 'Requires complex schema transformation, custom looping, and extensive mapping regression testing.'
      },
      {
        label: 'Canonical Enterprise Model (> 120 Fields, Deep Multi-System Enriched)',
        score: 4,
        multiplier: 2.2,
        description: 'Multi-system data enrichment (aggregating from 3+ systems into a single payload), complex business logic, dynamic schema validation.',
        rationale: 'Heavy transformation overhead, custom microservice logic, and extreme testing permutations.'
      }
    ]
  },
  {
    id: 'connectivityProtocol',
    title: '3. Protocol, Middleware & Authentication',
    category: 'Connectivity & Security',
    description: 'Connection mechanism, security handshake, networking, and legacy middleware adapters.',
    options: [
      {
        label: 'Native Oracle Cloud Adapter (REST / SOAP w/ OAuth2)',
        score: 1,
        multiplier: 0.9,
        description: 'Pre-built Oracle Cloud ERP/HCM/SCM adapter with native schema discovery and managed session tokens.',
        rationale: 'Oracle native adapter accelerates connection and introspection.'
      },
      {
        label: 'Generic REST / Webhook API (API Key, JWT, Basic Auth)',
        score: 2,
        multiplier: 1.15,
        description: 'Standard HTTPS REST endpoint with token exchange or API key headers.',
        rationale: 'Requires standard HTTP client setup and header authentication orchestration.'
      },
      {
        label: 'Legacy SFTP / AS2 / mTLS / On-Premises Connectivity Agent',
        score: 3,
        multiplier: 1.45,
        description: 'On-premise network agent, SSH key management, PGP encryption/decryption, AS2 certificates, or firewall routing.',
        rationale: 'Involves infrastructure coordination, VPN/firewall clearance, and file system fault tolerance.'
      },
      {
        label: 'Legacy Proprietary / Mainframe / Direct DB Link / Custom Socket',
        score: 4,
        multiplier: 1.85,
        description: 'Raw database procedures, fixed-width EBCDIC files, proprietary RPC, or legacy bespoke middleware.',
        rationale: 'Substantial protocol bridge development and custom error parsing.'
      }
    ]
  },
  {
    id: 'dataVolume',
    title: '4. Data Volume, Frequency & Batching Strategy',
    category: 'Performance & Scale',
    description: 'Transaction throughput, batch window constraints, file splitting, and throttling.',
    options: [
      {
        label: 'Low Volume / Transactional (< 1,000 tx/day, Single Record)',
        score: 1,
        multiplier: 0.9,
        description: 'Low-frequency payload execution with minimal latency pressure or memory constraints.',
        rationale: 'Minimal performance tuning required.'
      },
      {
        label: 'Moderate Throughput (1,000–25,000 tx/day, Chunked Batches)',
        score: 2,
        multiplier: 1.15,
        description: 'Periodic scheduled batches or moderate transactional load requiring pagination and rate throttling.',
        rationale: 'Requires chunking pagination and buffer management.'
      },
      {
        label: 'High-Volume Batch FBDI (> 25,000 tx/day, ZIP Generation & File Splitting)',
        score: 3,
        multiplier: 1.5,
        description: 'Automated Oracle FBDI (File-Based Data Import) zip packaging, UCM upload, and ESS job trigger/polling orchestration.',
        rationale: 'Requires robust FBDI ZIP generation, ESS job status polling, and error file extraction.'
      },
      {
        label: 'Massive Streaming / Near Real-Time High-Throughput (> 100k tx/day)',
        score: 4,
        multiplier: 1.9,
        description: 'High-throughput stream requiring multi-threading, concurrency locks, partitioned queues, and load-balancer resilience.',
        rationale: 'Demands performance benchmarking, memory profiling, and high-concurrency stress testing.'
      }
    ]
  },
  {
    id: 'errorHandling',
    title: '5. Error Handling, Exception Replay & Audit Framework',
    category: 'Fault Tolerance',
    description: 'Exception containment, dead-letter queuing, automated notification, and self-healing replay.',
    options: [
      {
        label: 'Basic Alerting (Standard Email Notification on Fault)',
        score: 1,
        multiplier: 0.85,
        description: 'Default OIC global fault handler sending email alert with stack trace to technical admins.',
        rationale: 'Minimal custom exception framework.'
      },
      {
        label: 'Standard OIC Error Hospital & Dead Letter Queue with Retry',
        score: 2,
        multiplier: 1.2,
        description: 'Fault policies, structured error logs in OIC console, DLQ segregation, and 3-attempt automated retry logic.',
        rationale: 'Standard enterprise resilient integration framework.'
      },
      {
        label: 'Automated Exception Workbench & Resubmit Replay Framework',
        score: 3,
        multiplier: 1.6,
        description: 'Custom error table logging with business-user resubmit portal/VBCS screen, payload editing, and reprocessing without IT intervention.',
        rationale: 'Requires dedicated error repository schema, reprocessing triggers, and business workflow.'
      },
      {
        label: 'Full Compliance Audit Trail & Non-Repudiation Archival',
        score: 4,
        multiplier: 1.95,
        description: 'Cryptographic payload signing, immutable audit trail repository, automated business reconciliation, and statutory retention archival.',
        rationale: 'Demands specialized compliance middleware architecture and automated reconciliation engines.'
      }
    ]
  },
  {
    id: 'apiReadiness',
    title: '6. External System API Readiness & Maturity',
    category: 'Ecosystem Readiness',
    description: 'Maturity of the third-party endpoint, API specifications, and sandbox availability.',
    options: [
      {
        label: 'Mature Standard API (Documented OpenAPI / Swagger, Active Sandbox)',
        score: 1,
        multiplier: 0.9,
        description: '3rd party or commercial SaaS with published REST schemas, working test environments, and sample payloads.',
        rationale: 'Smooth developer onboarding with immediate contract testing.'
      },
      {
        label: 'Concurrent In-Flight Development (3rd Party Building API in Parallel)',
        score: 2,
        multiplier: 1.35,
        description: 'Third-party vendor or client team is building/updating their API concurrently during our implementation.',
        rationale: 'Causes requirement churn, mock server dependencies, and iterative refactoring.'
      },
      {
        label: 'Legacy / Poorly Documented / No Sandbox (Direct DB / Flat Files Only)',
        score: 3,
        multiplier: 1.7,
        description: 'Unreliable legacy system with missing documentation, no dedicated sandbox, or requiring reverse engineering.',
        rationale: 'High discovery uncertainty, manual reverse engineering, and high defect rates.'
      },
      {
        label: 'Bespoke Custom Protocol w/ Third-Party Vendor Dependencies & Strict SLAs',
        score: 4,
        multiplier: 2.1,
        description: 'Complex proprietary interface with stringent latency SLAs, custom encryption, and multi-party signoffs.',
        rationale: 'Extensive multi-party cross-vendor governance and heavy coordination tax.'
      }
    ]
  }
];

// Calculation Logic for a Single Technical Integration
export function calculateIntegrationEffort(
  answers: IntegrationQuestionAnswers,
  type: TechnicalIntegrationType
): {
  calculatedHours: number;
  complexity: TechnicalComplexityTier;
  calculationFormula: string;
  compositeScore: number;
  rationale: string;
} {
  const baseHours = 45; // Baseline for an enterprise integration

  const q1 = INTEGRATION_SCOPING_QUESTIONS[0].options[answers.patternDirection] || INTEGRATION_SCOPING_QUESTIONS[0].options[0];
  const q2 = INTEGRATION_SCOPING_QUESTIONS[1].options[answers.mappingComplexity] || INTEGRATION_SCOPING_QUESTIONS[1].options[1];
  const q3 = INTEGRATION_SCOPING_QUESTIONS[2].options[answers.connectivityProtocol] || INTEGRATION_SCOPING_QUESTIONS[2].options[0];
  const q4 = INTEGRATION_SCOPING_QUESTIONS[3].options[answers.dataVolume] || INTEGRATION_SCOPING_QUESTIONS[3].options[0];
  const q5 = INTEGRATION_SCOPING_QUESTIONS[4].options[answers.errorHandling] || INTEGRATION_SCOPING_QUESTIONS[4].options[1];
  const q6 = INTEGRATION_SCOPING_QUESTIONS[5].options[answers.apiReadiness] || INTEGRATION_SCOPING_QUESTIONS[5].options[0];

  const typeBaseMultiplier = 
    type === 'inbound_rest' ? 1.0 :
    type === 'outbound_extract' ? 1.1 :
    type === 'bidirectional_sync' ? 1.4 :
    type === 'batch_fbdi' ? 1.3 :
    type === 'event_driven' ? 1.5 : 1.0;

  const totalMultiplier = 
    typeBaseMultiplier *
    q1.multiplier *
    q2.multiplier *
    q3.multiplier *
    q4.multiplier *
    q5.multiplier *
    q6.multiplier;

  const calculatedHours = Math.max(24, Math.round(baseHours * totalMultiplier));

  // Determine Complexity Tier
  let complexity: TechnicalComplexityTier = 'M';
  if (calculatedHours <= 65) {
    complexity = 'S';
  } else if (calculatedHours <= 135) {
    complexity = 'M';
  } else if (calculatedHours <= 240) {
    complexity = 'C';
  } else {
    complexity = 'XL';
  }

  const avgScore = (q1.score + q2.score + q3.score + q4.score + q5.score + q6.score) / 6;

  const calculationFormula = `${baseHours}h (Base) × ${typeBaseMultiplier.toFixed(2)} (Type) × ${q1.multiplier.toFixed(2)} (Flow) × ${q2.multiplier.toFixed(2)} (Mapping) × ${q3.multiplier.toFixed(2)} (Protocol) × ${q4.multiplier.toFixed(2)} (Volume) × ${q5.multiplier.toFixed(2)} (Error) × ${q6.multiplier.toFixed(2)} (API) = ${calculatedHours}h`;

  const rationale = `${complexity === 'S' ? 'Simple' : complexity === 'M' ? 'Standard/Medium' : complexity === 'C' ? 'Complex' : 'Extra Large'} footprint (${calculatedHours} hrs, Score ${avgScore.toFixed(1)}/4.0). Driven by ${q2.label.split('(')[0].trim()} and ${q3.label.split('(')[0].trim()}.`;

  return {
    calculatedHours,
    complexity,
    calculationFormula,
    compositeScore: parseFloat(avgScore.toFixed(2)),
    rationale
  };
}

// Initial Pre-Populated Realistic Enterprise Technical Integrations Catalog
export const DEFAULT_TECHNICAL_INTEGRATIONS: TechnicalIntegrationItem[] = [
  {
    id: 'int_01',
    code: 'INT-FIN-01',
    name: 'Bank Statement Auto-Reconciliation (MT940 / CAMT.053)',
    pillar: 'ERP',
    sourceSystem: 'Global Cash Management Host-to-Host (JPMorgan / Citi)',
    targetSystem: 'Oracle Cash Management Cloud',
    type: 'batch_fbdi',
    complexity: 'M',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 0, // Inbound 1-way (1.0x)
      mappingComplexity: 1, // Standard mapping (1.2x)
      connectivityProtocol: 2, // SFTP/mTLS Agent (1.45x)
      dataVolume: 1, // Moderate (1.15x)
      errorHandling: 1, // OIC Error hospital (1.2x)
      apiReadiness: 0 // Documented ISO standard (0.9x)
    },
    baseHours: 45,
    calculatedHours: 98,
    calculationFormula: '45h × 1.30 (Type) × 1.00 (Flow) × 1.20 (Mapping) × 1.45 (Protocol) × 1.15 (Volume) × 1.20 (Error) × 0.90 (API) = 98h',
    compositeScore: 1.83,
    rationale: 'Standard/Medium footprint (98 hrs). Secure SFTP bank connection with ISO20022 CAMT parsing and automated GL cash reconciliation.'
  },
  {
    id: 'int_02',
    code: 'INT-FIN-02',
    name: 'External Travel & Expense Reimbursement Ingestion',
    pillar: 'ERP',
    sourceSystem: 'External Expense Management System',
    targetSystem: 'Oracle Payables Cloud (AP Invoices)',
    type: 'inbound_rest',
    complexity: 'M',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 0, // Inbound (1.0x)
      mappingComplexity: 1, // Standard (1.2x)
      connectivityProtocol: 1, // Generic REST OAuth2 (1.15x)
      dataVolume: 1, // Moderate (1.15x)
      errorHandling: 1, // Standard OIC DLQ (1.2x)
      apiReadiness: 0 // Documented Expense API (0.9x)
    },
    baseHours: 45,
    calculatedHours: 78,
    calculationFormula: '45h × 1.00 (Type) × 1.00 (Flow) × 1.20 (Mapping) × 1.15 (Protocol) × 1.15 (Volume) × 1.20 (Error) × 0.90 (API) = 78h',
    compositeScore: 1.67,
    rationale: 'Standard/Medium footprint (78 hrs). REST API poll to import employee expense reports into AP invoice open interface.'
  },
  {
    id: 'int_03',
    code: 'INT-CX-01',
    name: 'External CRM Opportunity-to-Order Real-Time Sync',
    pillar: 'CX',
    sourceSystem: 'External CRM & Quoting System',
    targetSystem: 'Oracle Order Management Cloud',
    type: 'bidirectional_sync',
    complexity: 'C',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 2, // Bidirectional Sync (1.55x)
      mappingComplexity: 2, // Multi-object hierarchy (1.7x)
      connectivityProtocol: 0, // Oracle Cloud Adapter (0.9x)
      dataVolume: 1, // Moderate (1.15x)
      errorHandling: 2, // Custom Exception Workbench (1.6x)
      apiReadiness: 0 // Mature Cloud REST (0.9x)
    },
    baseHours: 45,
    calculatedHours: 195,
    calculationFormula: '45h × 1.40 (Type) × 1.55 (Flow) × 1.70 (Mapping) × 0.90 (Protocol) × 1.15 (Volume) × 1.60 (Error) × 0.90 (API) = 195h',
    compositeScore: 2.67,
    rationale: 'Complex footprint (195 hrs). Real-time quote synchronization, credit check handshakes, and bi-directional order status callbacks.'
  },
  {
    id: 'int_04',
    code: 'INT-SCM-01',
    name: '3PL Logistics Shipping Advice & ASN Confirmation (EDI 856 / 945)',
    pillar: 'SCM',
    sourceSystem: 'External 3PL Warehouse Management System',
    targetSystem: 'Oracle Inventory & Shipping Cloud',
    type: 'batch_fbdi',
    complexity: 'C',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 0, // Inbound (1.0x)
      mappingComplexity: 2, // Complex EDI multi-level (1.7x)
      connectivityProtocol: 2, // SFTP/AS2 (1.45x)
      dataVolume: 2, // High volume FBDI (1.5x)
      errorHandling: 2, // Exception workbench (1.6x)
      apiReadiness: 1 // In-flight 3PL specs (1.35x)
    },
    baseHours: 45,
    calculatedHours: 232,
    calculationFormula: '45h × 1.30 (Type) × 1.00 (Flow) × 1.70 (Mapping) × 1.45 (Protocol) × 1.50 (Volume) × 1.60 (Error) × 1.35 (API) = 232h',
    compositeScore: 2.83,
    rationale: 'Complex footprint (232 hrs). High-volume AS2 EDI 856 shipments with lot/serial tracking and automated FBDI shipping confirmation.'
  },
  {
    id: 'int_05',
    code: 'INT-HCM-01',
    name: 'External HRIS to Oracle Payroll & GL Journal Feeds',
    pillar: 'HCM',
    sourceSystem: 'External HRIS Platform',
    targetSystem: 'Oracle Cloud Payroll & General Ledger',
    type: 'inbound_rest',
    complexity: 'M',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 0, // Inbound (1.0x)
      mappingComplexity: 2, // Complex Worker/Position mapping (1.7x)
      connectivityProtocol: 1, // Generic REST/SOAP (1.15x)
      dataVolume: 1, // Moderate (1.15x)
      errorHandling: 1, // OIC Error hospital (1.2x)
      apiReadiness: 0 // Documented REST API (0.9x)
    },
    baseHours: 45,
    calculatedHours: 110,
    calculationFormula: '45h × 1.00 (Type) × 1.00 (Flow) × 1.70 (Mapping) × 1.15 (Protocol) × 1.15 (Volume) × 1.20 (Error) × 0.90 (API) = 110h',
    compositeScore: 2.00,
    rationale: 'Standard/Medium footprint (110 hrs). Automated worker hire/transfer changes transformed into Oracle HDL.'
  },
  {
    id: 'int_06',
    code: 'INT-FIN-03',
    name: 'Vertex / Avalara Real-Time Indirect Tax Calculation Engine',
    pillar: 'ERP',
    sourceSystem: 'Oracle Payables & Receivables Cloud',
    targetSystem: 'Vertex O Series / Avalara Cloud Tax',
    type: 'bidirectional_sync',
    complexity: 'S',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 2, // Bidirectional (1.55x)
      mappingComplexity: 0, // Direct 1:1 (<15 fields) (0.85x)
      connectivityProtocol: 0, // Oracle Native Tax Partner Adapter (0.9x)
      dataVolume: 0, // Low-latency single call (0.9x)
      errorHandling: 0, // Default fallback (0.85x)
      apiReadiness: 0 // Pre-certified tax partner (0.9x)
    },
    baseHours: 45,
    calculatedHours: 54,
    calculationFormula: '45h × 1.40 (Type) × 1.55 (Flow) × 0.85 (Mapping) × 0.90 (Protocol) × 0.90 (Volume) × 0.85 (Error) × 0.90 (API) = 54h',
    compositeScore: 1.33,
    rationale: 'Simple footprint (54 hrs). Pre-certified Oracle Tax Partner integration for real-time sales and use tax determination.'
  },
  {
    id: 'int_07',
    code: 'INT-SCM-02',
    name: 'Coupa Procurement Inbound Invoices & PO Synchronization',
    pillar: 'SCM',
    sourceSystem: 'Coupa BSM Cloud',
    targetSystem: 'Oracle Purchasing & Payables Cloud',
    type: 'inbound_rest',
    complexity: 'M',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 0, // Inbound (1.0x)
      mappingComplexity: 1, // Standard (1.2x)
      connectivityProtocol: 1, // Generic REST w/ API Key (1.15x)
      dataVolume: 1, // Moderate (1.15x)
      errorHandling: 1, // OIC Error hospital (1.2x)
      apiReadiness: 0 // Documented Coupa API (0.9x)
    },
    baseHours: 45,
    calculatedHours: 78,
    calculationFormula: '45h × 1.00 (Type) × 1.00 (Flow) × 1.20 (Mapping) × 1.15 (Protocol) × 1.15 (Volume) × 1.20 (Error) × 0.90 (API) = 78h',
    compositeScore: 1.67,
    rationale: 'Standard/Medium footprint (78 hrs). Webhook-driven PO flip and invoice creation with matching validation.'
  },
  {
    id: 'int_08',
    code: 'INT-HCM-02',
    name: 'ADP Benefits & 401(k) Provider Carrier Outbound Enrollment Feeds',
    pillar: 'HCM',
    sourceSystem: 'Oracle Benefits Cloud',
    targetSystem: 'ADP / Fidelity / Vanguard 834 Feeds',
    type: 'outbound_extract',
    complexity: 'M',
    isQuestionDriven: true,
    questionAnswers: {
      patternDirection: 1, // Outbound (1.15x)
      mappingComplexity: 2, // Multi-entity 834 EDI format (1.7x)
      connectivityProtocol: 2, // SFTP PGP encrypted (1.45x)
      dataVolume: 1, // Moderate (1.15x)
      errorHandling: 1, // Error hospital (1.2x)
      apiReadiness: 0 // HIPAA 834 specification (0.9x)
    },
    baseHours: 45,
    calculatedHours: 126,
    calculationFormula: '45h × 1.10 (Type) × 1.15 (Flow) × 1.70 (Mapping) × 1.45 (Protocol) × 1.15 (Volume) × 1.20 (Error) × 0.90 (API) = 126h',
    compositeScore: 2.17,
    rationale: 'Standard/Medium footprint (126 hrs). Weekly HIPAA 834 electronic data interchange (EDI) outbound extracts with PGP encryption.'
  }
];

// Standard S/M/C Breakdown Catalog for all 8 Technical Object Categories
export const TECHNICAL_OBJECT_SMC_CATALOG: TechnicalObjectSmcRow[] = [
  // 1. Integrations (OIC / APIs)
  {
    category: 'integrations',
    categoryLabel: '1. OIC & Cloud Integrations',
    typeId: 'int_inbound_rest',
    typeName: 'Inbound REST / Webhook APIs',
    simpleCount: 3,
    mediumCount: 4,
    complexCount: 1,
    simpleHours: 50,
    mediumHours: 90,
    complexHours: 180,
    totalCount: 8,
    totalHours: 690,
    description: 'Real-time JSON REST endpoints receiving master/transactional data from external clouds.'
  },
  {
    category: 'integrations',
    categoryLabel: '1. OIC & Cloud Integrations',
    typeId: 'int_outbound_extract',
    typeName: 'Outbound BICC / BIP Data Extracts',
    simpleCount: 2,
    mediumCount: 3,
    complexCount: 1,
    simpleHours: 45,
    mediumHours: 85,
    complexHours: 160,
    totalCount: 6,
    totalHours: 505,
    description: 'Scheduled batch extraction from Oracle Cloud dispatching to data lakes or third-party SFTPs.'
  },
  {
    category: 'integrations',
    categoryLabel: '1. OIC & Cloud Integrations',
    typeId: 'int_bidirectional_sync',
    typeName: 'Bidirectional Real-Time Sync Handshakes',
    simpleCount: 1,
    mediumCount: 2,
    complexCount: 2,
    simpleHours: 60,
    mediumHours: 120,
    complexHours: 220,
    totalCount: 5,
    totalHours: 740,
    description: 'Synchronous two-way workflows (e.g. CRM to Order Management, Pricing & Inventory lookups).'
  },
  {
    category: 'integrations',
    categoryLabel: '1. OIC & Cloud Integrations',
    typeId: 'int_batch_fbdi',
    typeName: 'Automated Batch FBDI File Handlers',
    simpleCount: 2,
    mediumCount: 2,
    complexCount: 1,
    simpleHours: 55,
    mediumHours: 105,
    complexHours: 200,
    totalCount: 5,
    totalHours: 520,
    description: 'Automated CSV-to-FBDI ZIP compression, UCM upload, and ESS import job triggering.'
  },

  // 2. PaaS / VBCS Custom Extensions
  {
    category: 'paas',
    categoryLabel: '2. PaaS & Visual Extensions (VBCS)',
    typeId: 'paas_vbcs_ui',
    typeName: 'VBCS Custom Web & Redwood UI Extensions',
    simpleCount: 1,
    mediumCount: 1,
    complexCount: 1,
    simpleHours: 180,
    mediumHours: 420,
    complexHours: 850,
    totalCount: 3,
    totalHours: 1450,
    description: 'Visual Builder Cloud Service apps embedded directly in Oracle Cloud navigation with SSO.'
  },
  {
    category: 'paas',
    categoryLabel: '2. PaaS & Visual Extensions (VBCS)',
    typeId: 'paas_atp_microservice',
    typeName: 'Autonomous Database (ATP) REST Microservices',
    simpleCount: 1,
    mediumCount: 1,
    complexCount: 0,
    simpleHours: 140,
    mediumHours: 320,
    complexHours: 650,
    totalCount: 2,
    totalHours: 460,
    description: 'Custom relational staging tables, ORDS APIs, and complex stored procedure business rules.'
  },

  // 3. BIP Pixel-Perfect Reports
  {
    category: 'reports_bip',
    categoryLabel: '3. BI Publisher Pixel-Perfect Documents',
    typeId: 'bip_customer_docs',
    typeName: 'Customer-Facing Documents (Invoices, POs, Checks)',
    simpleCount: 4,
    mediumCount: 6,
    complexCount: 2,
    simpleHours: 25,
    mediumHours: 45,
    complexHours: 90,
    totalCount: 12,
    totalHours: 550,
    description: 'RTF/eText layouts with sub-templates, dynamic barcodes, signatures, and burst distribution.'
  },
  {
    category: 'reports_bip',
    categoryLabel: '3. BI Publisher Pixel-Perfect Documents',
    typeId: 'bip_statutory_extracts',
    typeName: 'Statutory Tax & Regulatory Filing Extracts',
    simpleCount: 2,
    mediumCount: 4,
    complexCount: 2,
    simpleHours: 30,
    mediumHours: 55,
    complexHours: 110,
    totalCount: 8,
    totalHours: 500,
    description: 'Multi-table SQL data models generating government-mandated XML or fixed-length format.'
  },

  // 4. OTBI Analytical Dashboards
  {
    category: 'reports_otbi',
    categoryLabel: '4. OTBI Analyses & Executive Dashboards',
    typeId: 'otbi_single_analysis',
    typeName: 'Single Subject-Area Operational Analyses',
    simpleCount: 10,
    mediumCount: 12,
    complexCount: 3,
    simpleHours: 10,
    mediumHours: 20,
    complexHours: 45,
    totalCount: 25,
    totalHours: 475,
    description: 'Out-of-the-box Fusion Real-Time subject area queries with conditional formatting and prompts.'
  },
  {
    category: 'reports_otbi',
    categoryLabel: '4. OTBI Analyses & Executive Dashboards',
    typeId: 'otbi_cross_dashboard',
    typeName: 'Cross-Functional Executive Dashboards',
    simpleCount: 1,
    mediumCount: 3,
    complexCount: 2,
    simpleHours: 35,
    mediumHours: 70,
    complexHours: 140,
    totalCount: 6,
    totalHours: 525,
    description: 'Multi-tab executive dashboards blending Financials, SCM, and Workforce subject areas.'
  },

  // 5. Fast Formulas & Payroll Rules
  {
    category: 'fast_formulas',
    categoryLabel: '5. Fast Formulas & Calculation Rules',
    typeId: 'ff_absence_accrual',
    typeName: 'Absence Accrual, Carryover & Eligibility Rules',
    simpleCount: 4,
    mediumCount: 4,
    complexCount: 1,
    simpleHours: 25,
    mediumHours: 50,
    complexHours: 110,
    totalCount: 9,
    totalHours: 410,
    description: 'Formulas governing tenure-based vacation accrual, proration, and maximum roll-forward caps.'
  },
  {
    category: 'fast_formulas',
    categoryLabel: '5. Fast Formulas & Calculation Rules',
    typeId: 'ff_payroll_tax',
    typeName: 'Gross-to-Net Payroll & Statutory Deduction Rules',
    simpleCount: 2,
    mediumCount: 4,
    complexCount: 3,
    simpleHours: 35,
    mediumHours: 75,
    complexHours: 160,
    totalCount: 9,
    totalHours: 850,
    description: 'Complex earnings elements, overtime premium calculation, shift differentials, and retroactive tax.'
  },

  // 6. BPM Approval Workflows
  {
    category: 'workflows',
    categoryLabel: '6. BPM Approval Workflows',
    typeId: 'wf_financial_approvals',
    typeName: 'Financials Multi-Tier Approvals (AP, Journal, PO)',
    simpleCount: 3,
    mediumCount: 4,
    complexCount: 2,
    simpleHours: 20,
    mediumHours: 45,
    complexHours: 95,
    totalCount: 9,
    totalHours: 430,
    description: 'Approval Management Engine (AME/BPM) rules routing by cost center, ledger, and authorization limits.'
  },
  {
    category: 'workflows',
    categoryLabel: '6. BPM Approval Workflows',
    typeId: 'wf_hcm_approvals',
    typeName: 'HCM Transaction & Position Approvals (Hire, Transfer)',
    simpleCount: 2,
    mediumCount: 3,
    complexCount: 1,
    simpleHours: 20,
    mediumHours: 40,
    complexHours: 85,
    totalCount: 6,
    totalHours: 245,
    description: 'Managerial hierarchy approvals, HR Specialist notifications, and parallel group voting.'
  },

  // 7. Security Roles & SOD Governance
  {
    category: 'security_roles',
    categoryLabel: '7. Custom Security Roles & SOD Matrix',
    typeId: 'sec_custom_job_roles',
    typeName: 'Custom Job Roles (Stripped-Down Least-Privilege)',
    simpleCount: 5,
    mediumCount: 8,
    complexCount: 3,
    simpleHours: 15,
    mediumHours: 35,
    complexHours: 75,
    totalCount: 16,
    totalHours: 580,
    description: 'Cloned enterprise roles stripped of unneeded privileges to meet compliance audit requirements.'
  },
  {
    category: 'security_roles',
    categoryLabel: '7. Custom Security Roles & SOD Matrix',
    typeId: 'sec_sod_conflict_matrix',
    typeName: 'Segregation of Duties (SOD) Risk Governance Matrices',
    simpleCount: 1,
    mediumCount: 2,
    complexCount: 1,
    simpleHours: 40,
    mediumHours: 80,
    complexHours: 160,
    totalCount: 4,
    totalHours: 360,
    description: 'Formal SOD risk conflict rules preventing incompatible role combinations (e.g. AP Invoice Entry + Check Payment).'
  },

  // 8. Data Conversions
  {
    category: 'conversions',
    categoryLabel: '8. Data Conversions (FBDI & HDL)',
    typeId: 'conv_master_data',
    typeName: 'Master Entity Conversions (Suppliers, Items, Employees)',
    simpleCount: 3,
    mediumCount: 4,
    complexCount: 2,
    simpleHours: 35,
    mediumHours: 70,
    complexHours: 150,
    totalCount: 9,
    totalHours: 685,
    description: 'Data staging, cleansing, cross-reference mapping, and FBDI/HDL load cycle validation.'
  },
  {
    category: 'conversions',
    categoryLabel: '8. Data Conversions (FBDI & HDL)',
    typeId: 'conv_open_transactions',
    typeName: 'Open Transactional Balances (Open AP/AR, POs, GL Balances)',
    simpleCount: 2,
    mediumCount: 3,
    complexCount: 2,
    simpleHours: 45,
    mediumHours: 90,
    complexHours: 190,
    totalCount: 7,
    totalHours: 740,
    description: 'Open purchase orders, unpaid AP invoices, open AR invoices, inventory on-hand, and trial balance GL cutover.'
  }
];

// ==========================================
// TBD CONVERSIONS T-SHIRT BENCHMARK MATRIX (From Whiteboard Image 6)
// ==========================================
export const CONVERSION_TSHIRT_BENCHMARKS: Record<ConversionTShirtSize, ConversionTShirtBenchmark> = {
  XS: {
    size: 'XS',
    label: 'Extra Small (Lookups / Simple Parameter Codes)',
    e2eHours: 9,
    loadHours: 4,
    totalPerMockHours: 13,
    typicalEntities: ['Payment Terms', 'Units of Measure (UOM)', 'Tax Regimes', 'Freight Terms']
  },
  S: {
    size: 'S',
    label: 'Small (Standard Single-Table Master <15 Fields)',
    e2eHours: 18,
    loadHours: 9,
    totalPerMockHours: 27,
    typicalEntities: ['Chart of Accounts Segment Values', 'Bank Branches', 'Buyers', 'Inventory Locations', 'Item Categories']
  },
  M: {
    size: 'M',
    label: 'Medium (Standard Master / Open Balances 15–50 Fields)',
    e2eHours: 27,
    loadHours: 18,
    totalPerMockHours: 45,
    typicalEntities: ['Suppliers & Sites', 'Customer Accounts', 'Item Master', 'Fixed Assets', 'Open AP Invoices', 'Open AR Invoices', 'GL Historical Balances']
  },
  L: {
    size: 'L',
    label: 'Large (Complex Multi-Entity / Nested Hierarchy 50–100 Fields)',
    e2eHours: 36,
    loadHours: 27,
    totalPerMockHours: 63,
    typicalEntities: ['Employee Workers & Assignments (HDL)', 'Open Purchase Orders (Header/Lines/Distributions)', 'Open Sales Orders', 'BOM & Routings', 'Price Books']
  },
  XL: {
    size: 'XL',
    label: 'Extra Large (Heavy Transactional / Multi-Year Subledgers >100 Fields)',
    e2eHours: 54,
    loadHours: 36,
    totalPerMockHours: 90,
    typicalEntities: ['Multi-Year Historical Payroll Balances', 'Complex Contract Lifecycle Balances', 'Historical Inventory Transactions & Serial Batches', 'Complex Intercompany Asset Books']
  }
};

// ==========================================
// TBD 4-TIER CONVERSION MOCK SLIDING SCALE (From Whiteboard Image 4)
// ==========================================
export const CONVERSION_MOCK_SLIDING_SCALE: { mock: number; name: string; percentage: number; label: string; description: string }[] = [
  {
    mock: 1,
    name: 'Mock 1',
    percentage: 1.00,
    label: '100% of Base Effort',
    description: 'Initial data extraction, field-by-field cross-referencing, FBDI/HDL template configuration & baseline reconciliation.'
  },
  {
    mock: 2,
    name: 'Mock 2',
    percentage: 0.80,
    label: '80% of Base Effort',
    description: 'SIT cycle data load, automated deduplication, exception resolution & post-cleansing validation.'
  },
  {
    mock: 3,
    name: 'Mock 3',
    percentage: 0.60,
    label: '60% of Base Effort',
    description: 'UAT volume load cycle, performance tuning, cutover sequencing & business stakeholder sign-off.'
  },
  {
    mock: 4,
    name: 'Mock 4 (Custom/Pre-Cutover)',
    percentage: 0.40,
    label: '40% of Base Effort',
    description: 'Final cutover dress rehearsal, timing dry-run, rollback testing & production deployment execution.'
  }
];

/**
 * Calculates cumulative mock multiplier based on TBD sliding percentage scale:
 * Mock 1: 100% (1.00)
 * Mock 2: 80% (cumulative = 1.80)
 * Mock 3: 60% (cumulative = 2.40)
 * Mock 4: 40% (cumulative = 2.80)
 * Additional Mocks (5+): +30% each
 */
export function getMockCumulativeMultiplier(cycles: number): number {
  if (cycles <= 0) return 0;
  if (cycles === 1) return 1.00;
  if (cycles === 2) return 1.80;
  if (cycles === 3) return 2.40;
  if (cycles === 4) return 2.80;
  return 2.80 + (cycles - 4) * 0.30;
}

// ==========================================
// TBD INTEGRATION (INT) T-SHIRT BENCHMARK MATRIX (From Whiteboard Image 6)
// ==========================================
export const INTEGRATION_TSHIRT_BENCHMARKS: Record<TechnicalTShirtSize, TechnicalWorkstreamTShirtBenchmark> = {
  XS: {
    workstreamId: 'INT',
    workstreamName: 'Integrations (OIC / APIs)',
    category: 'Integration',
    size: 'XS',
    label: 'XS: 1:1 Pass-through / Outbound Webhook',
    designHours: 8,
    buildHours: 16,
    testHours: 12,
    totalHours: 36,
    typicalScope: 'Simple 1:1 REST notification, direct parameter pass-through, or single-entity webhook alert.'
  },
  S: {
    workstreamId: 'INT',
    workstreamName: 'Integrations (OIC / APIs)',
    category: 'Integration',
    size: 'S',
    label: 'S: Standard Batch Extract / FBDI File Handler',
    designHours: 14,
    buildHours: 28,
    testHours: 18,
    totalHours: 60,
    typicalScope: 'Standard scheduled BICC extract or CSV-to-FBDI zip packaging with single-domain DVM lookup.'
  },
  M: {
    workstreamId: 'INT',
    workstreamName: 'Integrations (OIC / APIs)',
    category: 'Integration',
    size: 'M',
    label: 'M: Bidirectional Sync / Standard Middleware API',
    designHours: 24,
    buildHours: 48,
    testHours: 28,
    totalHours: 100,
    typicalScope: 'Real-time REST synchronous handshakes (e.g. Concur Expense, Bank MT940, Coupa PO flip) with error hospital.'
  },
  L: {
    workstreamId: 'INT',
    workstreamName: 'Integrations (OIC / APIs)',
    category: 'Integration',
    size: 'L',
    label: 'L: Complex Multi-Object / SFTP PGP / EDI 834',
    designHours: 40,
    buildHours: 85,
    testHours: 45,
    totalHours: 170,
    typicalScope: 'Multi-table nested schemas, complex XSLT transformation, EDI 834/850 translation, PGP encryption, and retry workbench.'
  },
  XL: {
    workstreamId: 'INT',
    workstreamName: 'Integrations (OIC / APIs)',
    category: 'Integration',
    size: 'XL',
    label: 'XL: Mission-Critical Legacy / High-Throughput Stream',
    designHours: 60,
    buildHours: 140,
    testHours: 70,
    totalHours: 270,
    typicalScope: 'High-volume pub/sub event mesh, multi-node mainframe ESB connection, distributed 2-phase commits, and custom replay portal.'
  }
};

// ==========================================
// TBD REPORTING (REP) CHAIN & T-SHIRT BENCHMARK MATRIX (From Whiteboard Image 3 & 6)
// Sequence: Rep > FDI > AIDP > Dashboards > BIP > OTB
// ==========================================
export const REPORTING_CHAIN_LAYERS = [
  { id: 'OTB', name: 'Out of the Box (OTB)', level: 1, description: 'Standard seeded Oracle Cloud transaction reports & infolets (Zero build).' },
  { id: 'BIP', name: 'BI Publisher (BIP)', level: 2, description: 'Pixel-perfect customer-facing operational PDFs, checks, and statutory eText extracts.' },
  { id: 'OTBI', name: 'OTBI Operational Analyses', level: 3, description: 'Subject-area drag-and-drop queries, drill-downs, and real-time operational views.' },
  { id: 'DASH', name: 'Executive Dashboards', level: 4, description: 'Cross-functional blended KPI executive management dashboards.' },
  { id: 'AIDP', name: 'AI Data Platform (AIDP)', level: 5, description: 'Unified data ingestion pipeline, feature store, and semantic models in OCI.' },
  { id: 'FDI', name: 'Fusion Data Intelligence (FDI)', level: 6, description: 'Pre-built cloud analytical warehouse, cross-pillar KPIs, and machine-learning predictive insights.' }
];

export const REPORTING_TSHIRT_BENCHMARKS: Record<TechnicalTShirtSize, TechnicalWorkstreamTShirtBenchmark> = {
  XS: {
    workstreamId: 'REP',
    workstreamName: 'Reports & Analytics',
    category: 'Reporting & Analytics',
    size: 'XS',
    label: 'XS: Simple OTBI Query / Minor RTF Layout Tweak',
    designHours: 4,
    buildHours: 8,
    testHours: 4,
    totalHours: 16,
    typicalScope: 'Single subject area tabular view, minor field additions to seeded RTF, or basic operational filter.'
  },
  S: {
    workstreamId: 'REP',
    workstreamName: 'Reports & Analytics',
    category: 'Reporting & Analytics',
    size: 'S',
    label: 'S: Standard BIP Document / Multi-Prompt Analysis',
    designHours: 8,
    buildHours: 18,
    testHours: 8,
    totalHours: 34,
    typicalScope: 'Customer-facing invoice/PO layout with company logo, sub-template, dynamic barcodes, or multi-prompt OTBI report.'
  },
  M: {
    workstreamId: 'REP',
    workstreamName: 'Reports & Analytics',
    category: 'Reporting & Analytics',
    size: 'M',
    label: 'M: Complex BIP Regulatory Extract / Management Dashboard',
    designHours: 14,
    buildHours: 32,
    testHours: 16,
    totalHours: 62,
    typicalScope: 'Statutory tax XML filing extract, check payment burst document, or multi-subject area analytical dashboard.'
  },
  L: {
    workstreamId: 'REP',
    workstreamName: 'Reports & Analytics',
    category: 'Reporting & Analytics',
    size: 'L',
    label: 'L: Fusion Data Intelligence (FDI) Custom KPI / AIDP Model',
    designHours: 24,
    buildHours: 56,
    testHours: 28,
    totalHours: 108,
    typicalScope: 'Custom FDI pipeline data augmentation, bespoke data mart dimension modeling, or cross-pillar analytical data model.'
  },
  XL: {
    workstreamId: 'REP',
    workstreamName: 'Reports & Analytics',
    category: 'Reporting & Analytics',
    size: 'XL',
    label: 'XL: Enterprise AI Predictive Analytics / Data Lakehouse',
    designHours: 40,
    buildHours: 95,
    testHours: 45,
    totalHours: 180,
    typicalScope: 'Enterprise OCI Lakehouse curation, advanced AI/ML forecasting model, AIDP pipeline orchestration, and multi-tenant security modeling.'
  }
};

// ==========================================
// TBD PaaS TOWER (INFRA / SECURITY / AGENTIC AI) T-SHIRT BENCHMARK MATRIX (From Whiteboard Image 6)
// ==========================================
export const PAAS_TOWER_BENCHMARKS: Record<'Infra' | 'Security' | 'Agentic_AI', Record<TechnicalTShirtSize, TechnicalWorkstreamTShirtBenchmark>> = {
  Infra: {
    XS: {
      workstreamId: 'PAAS_INFRA',
      workstreamName: 'PaaS Infrastructure & DevOps',
      category: 'PaaS & AI Platform',
      size: 'XS',
      label: 'XS: Single OCI Compartment & VCN Setup',
      designHours: 8,
      buildHours: 16,
      testHours: 8,
      totalHours: 32,
      typicalScope: 'Basic OCI compartment isolation, subnet routing, and standard DNS resolution.'
    },
    S: {
      workstreamId: 'PAAS_INFRA',
      workstreamName: 'PaaS Infrastructure & DevOps',
      category: 'PaaS & AI Platform',
      size: 'S',
      label: 'S: Multi-Tier OCI Network, IPSec VPN & CI/CD Pipeline',
      designHours: 16,
      buildHours: 34,
      testHours: 16,
      totalHours: 66,
      typicalScope: 'Site-to-site IPSec VPN tunnel, private subnets, bastion host, and automated Terraform/Ansible baseline.'
    },
    M: {
      workstreamId: 'PAAS_INFRA',
      workstreamName: 'PaaS Infrastructure & DevOps',
      category: 'PaaS & AI Platform',
      size: 'M',
      label: 'M: FastConnect Direct Link, HA Autonomous Database & OKE',
      designHours: 28,
      buildHours: 64,
      testHours: 28,
      totalHours: 120,
      typicalScope: 'Dedicated FastConnect redundant circuits, Autonomous Transaction Processing (ATP) cluster, and OCI Container Engine (OKE).'
    },
    L: {
      workstreamId: 'PAAS_INFRA',
      workstreamName: 'PaaS Infrastructure & DevOps',
      category: 'PaaS & AI Platform',
      size: 'L',
      label: 'L: Multi-Region DR Replication & Zero-Trust Mesh',
      designHours: 45,
      buildHours: 110,
      testHours: 45,
      totalHours: 200,
      typicalScope: 'Active-passive cross-region disaster recovery, automated RTO/RPO failover, OCI Data Safe, and zero-trust service mesh.'
    },
    XL: {
      workstreamId: 'PAAS_INFRA',
      workstreamName: 'PaaS Infrastructure & DevOps',
      category: 'PaaS & AI Platform',
      size: 'XL',
      label: 'XL: Sovereign Multi-Cloud Global Landing Zone',
      designHours: 70,
      buildHours: 180,
      testHours: 70,
      totalHours: 320,
      typicalScope: 'Multi-cloud interconnect (OCI-Azure/AWS), Sovereign Cloud regulatory compliance isolation, automated SIEM SOC ingestion.'
    }
  },
  Security: {
    XS: {
      workstreamId: 'PAAS_SEC',
      workstreamName: 'Security, IAM & SOD Governance',
      category: 'PaaS & AI Platform',
      size: 'XS',
      label: 'XS: Standard IdP Federation (Okta/Azure AD SSO)',
      designHours: 6,
      buildHours: 14,
      testHours: 8,
      totalHours: 28,
      typicalScope: 'SAML 2.0 / OIDC single sign-on with Azure AD or Okta and basic user synchronization.'
    },
    S: {
      workstreamId: 'PAAS_SEC',
      workstreamName: 'Security, IAM & SOD Governance',
      category: 'PaaS & AI Platform',
      size: 'S',
      label: 'S: Custom Role Cloning & Data Security Policies',
      designHours: 14,
      buildHours: 32,
      testHours: 18,
      totalHours: 64,
      typicalScope: 'Stripping seeded roles to least-privilege, Business Unit data access set restrictions, and ledger security.'
    },
    M: {
      workstreamId: 'PAAS_SEC',
      workstreamName: 'Security, IAM & SOD Governance',
      category: 'PaaS & AI Platform',
      size: 'M',
      label: 'M: Enterprise SOD Matrix & Access Certification Rules',
      designHours: 25,
      buildHours: 60,
      testHours: 30,
      totalHours: 115,
      typicalScope: 'Cross-module Segregation of Duties (SOD) conflict matrix, mitigating control workflows, and quarterly access review rules.'
    },
    L: {
      workstreamId: 'PAAS_SEC',
      workstreamName: 'Security, IAM & SOD Governance',
      category: 'PaaS & AI Platform',
      size: 'L',
      label: 'L: Advanced Access Controls (AAC) & Transaction Monitoring',
      designHours: 40,
      buildHours: 95,
      testHours: 45,
      totalHours: 180,
      typicalScope: 'Oracle Risk Management Cloud (AAC/TCG) models, automated suspicious journal/vendor payment anomaly rules, and GDPR masking.'
    },
    XL: {
      workstreamId: 'PAAS_SEC',
      workstreamName: 'Security, IAM & SOD Governance',
      category: 'PaaS & AI Platform',
      size: 'XL',
      label: 'XL: Defense-in-Depth Sovereign Cryptographic Key Management',
      designHours: 60,
      buildHours: 150,
      testHours: 60,
      totalHours: 270,
      typicalScope: 'Bring-Your-Own-Key (BYOK) HSM encryption, continuous privileged access monitoring, automated multi-subsidiary SOD certification.'
    }
  },
  Agentic_AI: {
    XS: {
      workstreamId: 'PAAS_AI',
      workstreamName: 'Agentic AI & GenAI Workflows',
      category: 'PaaS & AI Platform',
      size: 'XS',
      label: 'XS: Seeded Generative AI Assistant & Assisted Authoring',
      designHours: 8,
      buildHours: 16,
      testHours: 8,
      totalHours: 32,
      typicalScope: 'Enabling Oracle Cloud embedded GenAI for job descriptions, performance feedback, and executive email summaries.'
    },
    S: {
      workstreamId: 'PAAS_AI',
      workstreamName: 'Agentic AI & GenAI Workflows',
      category: 'PaaS & AI Platform',
      size: 'S',
      label: 'S: Custom OCI GenAI Prompt Agent & RAG Document Bot',
      designHours: 18,
      buildHours: 42,
      testHours: 20,
      totalHours: 80,
      typicalScope: 'Enterprise policy Q&A assistant indexing company handbook/SOPs with Retrieval-Augmented Generation (RAG) in OCI.'
    },
    M: {
      workstreamId: 'PAAS_AI',
      workstreamName: 'Agentic AI & GenAI Workflows',
      category: 'PaaS & AI Platform',
      size: 'M',
      label: 'M: Multi-Step Autonomous Agent for Invoicing & Approvals',
      designHours: 32,
      buildHours: 75,
      testHours: 35,
      totalHours: 142,
      typicalScope: 'Multi-agent orchestration analyzing invoice discrepancies, triggering supplier email inquiries, and auto-clearing minor variances.'
    },
    L: {
      workstreamId: 'PAAS_AI',
      workstreamName: 'Agentic AI & GenAI Workflows',
      category: 'PaaS & AI Platform',
      size: 'L',
      label: 'L: Cross-System Cognitive Supply Chain & Inventory Agent',
      designHours: 50,
      buildHours: 120,
      testHours: 55,
      totalHours: 225,
      typicalScope: 'Autonomous agent evaluating weather/shipping delays, proposing PO re-routing, and orchestrating supplier order updates.'
    },
    XL: {
      workstreamId: 'PAAS_AI',
      workstreamName: 'Agentic AI & GenAI Workflows',
      category: 'PaaS & AI Platform',
      size: 'XL',
      label: 'XL: Enterprise Agentic Ecosystem with Self-Healing Operations',
      designHours: 75,
      buildHours: 190,
      testHours: 85,
      totalHours: 350,
      typicalScope: 'Full swarm of autonomous agents with fine-tuned LLMs, automated ERP error remediation, proactive finance close acceleration.'
    }
  }
};

// Default Oracle Fusion Conversion Objects with Archetype and Lifecycle Breakdown (24 Enterprise Objects)
export const DEFAULT_CONVERSION_ENTITIES: ConversionEntityItem[] = [
  { id: 'conv_setup_terms', name: 'Payment Terms, Currencies & Tax Regimes', pillar: 'ERP', category: 'Master Data', archetype: 'Foundation / Setup', loadEngine: 'Manual / CSV', tShirtSize: 'XS', sourceSystem: 'Legacy Config / Excel', targetFBDI: 'Spreadsheet Loader / ADFdi', specAndBuildHours: 8, mockCycleHours: 4, reconciliationHours: 4 },
  { id: 'conv_coa_segs', name: 'Chart of Accounts Segment Values & Hierarchies', pillar: 'ERP', category: 'Master Data', archetype: 'Foundation / Setup', loadEngine: 'FBDI', tShirtSize: 'S', sourceSystem: 'Legacy GL Chart', targetFBDI: 'ChartOfAccountsSegmentValues.xlsm', specAndBuildHours: 14, mockCycleHours: 8, reconciliationHours: 6 },
  { id: 'conv_sup', name: 'Suppliers, Sites, Bank Accounts & Contacts', pillar: 'ERP', category: 'Master Data', archetype: 'Master Data', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy Core ERP', targetFBDI: 'SupplierImportTemplate.xlsm', specAndBuildHours: 24, mockCycleHours: 14, reconciliationHours: 10 },
  { id: 'conv_cust', name: 'Customer Accounts, Sites, Profiles & Contacts', pillar: 'ERP', category: 'Master Data', archetype: 'Master Data', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy CRM / ERP', targetFBDI: 'CustomerImportTemplate.xlsm', specAndBuildHours: 24, mockCycleHours: 14, reconciliationHours: 10 },
  { id: 'conv_items', name: 'Item Master, Catalogs & Inventory Orgs', pillar: 'SCM', category: 'Master Data', archetype: 'Master Data', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy WMS / ERP', targetFBDI: 'ItemImportTemplate.xlsm', specAndBuildHours: 26, mockCycleHours: 14, reconciliationHours: 10 },
  { id: 'conv_bom', name: 'Bills of Material (BOM) & Work Definitions / Routings', pillar: 'SCM', category: 'Master Data', archetype: 'Master Data', loadEngine: 'FBDI', tShirtSize: 'L', sourceSystem: 'Legacy MES / PLM', targetFBDI: 'WorkDefinitionImportTemplate.xlsm', specAndBuildHours: 32, mockCycleHours: 18, reconciliationHours: 12 },
  { id: 'conv_fa', name: 'Fixed Assets, Tax Books & Depreciation Setup', pillar: 'ERP', category: 'Master Data', archetype: 'Master Data', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy Fixed Assets', targetFBDI: 'FixedAssetImportTemplate.xlsm', specAndBuildHours: 22, mockCycleHours: 12, reconciliationHours: 8 },
  { id: 'conv_emp', name: 'Employees, Jobs, Positions & Assignments', pillar: 'HCM', category: 'Master Data', archetype: 'Master Data', loadEngine: 'HDL', tShirtSize: 'L', sourceSystem: 'Legacy HRIS / Payroll', targetFBDI: 'Worker.dat (HDL)', specAndBuildHours: 36, mockCycleHours: 20, reconciliationHours: 14 },
  { id: 'conv_salary', name: 'Salary History, Recurring Elements & Compensation', pillar: 'HCM', category: 'Master Data', archetype: 'Master Data', loadEngine: 'HDL', tShirtSize: 'M', sourceSystem: 'Legacy Payroll / Comp', targetFBDI: 'Salary.dat / ElementEntry.dat (HDL)', specAndBuildHours: 26, mockCycleHours: 16, reconciliationHours: 10 },
  { id: 'conv_absence_bal', name: 'Accrual & Leave Balances (PTO, Sick, Vacation)', pillar: 'HCM', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'HDL', tShirtSize: 'S', sourceSystem: 'Legacy Time & Absence', targetFBDI: 'PersonAccrualDetail.dat (HDL)', specAndBuildHours: 18, mockCycleHours: 10, reconciliationHours: 8 },
  { id: 'conv_benefits', name: 'Benefits Participant Enrollments & Covered Dependents', pillar: 'HCM', category: 'Master Data', archetype: 'Master Data', loadEngine: 'HDL', tShirtSize: 'M', sourceSystem: 'Legacy Benefits Carrier', targetFBDI: 'ParticipantEnrollment.dat (HDL)', specAndBuildHours: 26, mockCycleHours: 14, reconciliationHours: 10 },
  { id: 'conv_projects', name: 'Project Master, Tasks, Agreements & Funding Budgets', pillar: 'ERP', category: 'Master Data', archetype: 'Master Data', loadEngine: 'FBDI', tShirtSize: 'L', sourceSystem: 'Legacy PPM', targetFBDI: 'ProjectImportTemplate.xlsm', specAndBuildHours: 32, mockCycleHours: 18, reconciliationHours: 12 },
  { id: 'conv_ap_inv', name: 'Open AP Invoices, Holds & Partial Payments', pillar: 'ERP', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy AP Subledger', targetFBDI: 'PayablesStandardInvoiceImportTemplate.xlsm', specAndBuildHours: 22, mockCycleHours: 16, reconciliationHours: 12 },
  { id: 'conv_ar_inv', name: 'Open AR Invoices, Debit Memos & Unapplied Cash', pillar: 'ERP', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy AR Subledger', targetFBDI: 'AutoInvoiceImportTemplate.xlsm', specAndBuildHours: 22, mockCycleHours: 16, reconciliationHours: 12 },
  { id: 'conv_po', name: 'Open Purchase Orders, Lines, Schedules & Distributions', pillar: 'SCM', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'L', sourceSystem: 'Legacy Purchasing', targetFBDI: 'POImportTemplate.xlsm', specAndBuildHours: 32, mockCycleHours: 22, reconciliationHours: 14 },
  { id: 'conv_req', name: 'Approved Open Requisitions & Blanket Purchase Agreements', pillar: 'SCM', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy eProcurement', targetFBDI: 'RequisitionImportTemplate.xlsm', specAndBuildHours: 22, mockCycleHours: 14, reconciliationHours: 10 },
  { id: 'conv_so', name: 'Open Sales Orders, Schedules & Price Overrides', pillar: 'SCM', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'L', sourceSystem: 'Legacy OMS', targetFBDI: 'OrderImportTemplate.xlsm', specAndBuildHours: 32, mockCycleHours: 22, reconciliationHours: 14 },
  { id: 'conv_inv_bal', name: 'Inventory On-Hand Balances, Lots & Serial Numbers', pillar: 'SCM', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'S', sourceSystem: 'Legacy WMS', targetFBDI: 'InventoryBalanceImportTemplate.xlsm', specAndBuildHours: 16, mockCycleHours: 10, reconciliationHours: 8 },
  { id: 'conv_contracts', name: 'Active Customer Contracts & Revenue Schedules (RMCS)', pillar: 'ERP', category: 'Open Balances', archetype: 'Open Balances', loadEngine: 'FBDI', tShirtSize: 'L', sourceSystem: 'Legacy Revenue Mgmt', targetFBDI: 'VRMContractsImportTemplate.xlsm', specAndBuildHours: 34, mockCycleHours: 20, reconciliationHours: 14 },
  { id: 'conv_gl_bal', name: 'Historical GL Trial Balances & Multi-Year Period History', pillar: 'ERP', category: 'Transactional History', archetype: 'Transactional History', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy General Ledger', targetFBDI: 'GLInterface.xlsm', specAndBuildHours: 28, mockCycleHours: 18, reconciliationHours: 16 },
  { id: 'conv_ap_hist', name: 'Closed AP Paid Invoices (Historical Tax / 1099 Audit)', pillar: 'ERP', category: 'Transactional History', archetype: 'Transactional History', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy AP Archive', targetFBDI: 'PayablesHistoricalInvoices.xlsm', specAndBuildHours: 24, mockCycleHours: 16, reconciliationHours: 12 },
  { id: 'conv_ar_hist', name: 'Historical Closed AR Transactions & Receipts', pillar: 'ERP', category: 'Transactional History', archetype: 'Transactional History', loadEngine: 'FBDI', tShirtSize: 'M', sourceSystem: 'Legacy AR Archive', targetFBDI: 'AutoInvoiceHistorical.xlsm', specAndBuildHours: 24, mockCycleHours: 16, reconciliationHours: 12 },
  { id: 'conv_sales_hist', name: 'Historical 2-Year Sales Shipments (Demand Planning)', pillar: 'SCM', category: 'Transactional History', archetype: 'Transactional History', loadEngine: 'FBDI', tShirtSize: 'L', sourceSystem: 'Legacy ERP / Planning', targetFBDI: 'ScpShipmentHistoryImportTemplate.xlsm', specAndBuildHours: 30, mockCycleHours: 18, reconciliationHours: 14 },
  { id: 'conv_payroll_hist', name: 'Prior Year Gross-to-Net Payroll History & W-2 Accumulators', pillar: 'HCM', category: 'Transactional History', archetype: 'Transactional History', loadEngine: 'HDL', tShirtSize: 'L', sourceSystem: 'Legacy Payroll Tax DB', targetFBDI: 'PayrollBalanceBatch.dat (HDL)', specAndBuildHours: 34, mockCycleHours: 22, reconciliationHours: 16 }
];
