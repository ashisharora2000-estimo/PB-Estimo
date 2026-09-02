import {
  DeliveryOwnerParty,
  MultiVendorConfig,
  OracleModule,
  ModuleScopeDemarcation,
  WorkstreamScopeDemarcation
} from '../types';
import {
  DEFAULT_MULTI_VENDOR_PARTIES,
  DEFAULT_WORKSTREAM_DEMARCATIONS,
  generateDefaultModuleDemarcation
} from '../data/multiVendorPresets';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';

export interface MultiVendorAiExtractionResult {
  documentTitle: string;
  sourceType: 'rfp' | 'scopesheet' | 'email' | 'mom' | 'notes';
  executiveSummary: string;
  confidenceScore: number; // 0 to 100
  partiesIdentified: Array<{
    name: string;
    role: string;
    partyType: DeliveryOwnerParty;
    assignedScope: string[];
    confidence: 'High' | 'Medium' | 'Low';
    citation: string;
  }>;
  detectedDemarcations: Array<{
    area: string;
    assignedParty: DeliveryOwnerParty;
    confidence: 'High' | 'Medium' | 'Low';
    citation: string;
    rationale: string;
  }>;
  identifiedCoordinationRisks: Array<{
    risk: string;
    boundary: string;
    severity: 'High' | 'Medium' | 'Low';
    suggestedMitigation: string;
  }>;
  suggestedConfig: MultiVendorConfig;
}

export const SAMPLE_MULTI_VENDOR_DOCUMENTS: Array<{
  id: string;
  title: string;
  type: 'rfp' | 'scopesheet' | 'email' | 'mom' | 'notes';
  description: string;
  content: string;
}> = [
  {
    id: 'rfp_split_erp_hcm',
    title: '1. Global Retail RFP: Section 4.2 (Multi-Vendor Demarcation)',
    type: 'rfp',
    description: 'RFP stating Our SI delivers Core ERP & SCM, specialized BI Vendor delivers HCM & Payroll, and Client owns Data Cleansing.',
    content: `REQUEST FOR PROPOSAL (RFP) - ORACLE CLOUD TRANSFORMATION
Section 4.2 - Multi-Party Delivery Ecosystem & Responsibilities:

1. System Integrator 1 (Our Prime SI):
The Prime System Integrator shall be responsible for end-to-end delivery of Oracle Cloud ERP Financials (General Ledger, Payables, Receivables, Cash Management, Fixed Assets), Oracle Procurement Cloud, and Supply Chain Management (Inventory, Order Management). Prime SI shall also own the central Oracle Integration Cloud (OIC) orchestration framework and Lead PMO governance.

2. Business Integrator 2 (HCM Specialist Partner / BI):
A separate specialized vendor (BI Vendor) has been contracted directly by Client to deliver Oracle HCM Cloud (Core HR, Benefits, US/UK Payroll, and Absence Management). BI Vendor will develop all HCM fast formulas and internal payroll interfaces.

3. Client Internal Responsibilities:
The Client enterprise team will retain 100% accountability for extracting legacy data from Mainframe and SAP, executing deduplication and data cleansing prior to FBDI ingestion. Client business SMEs will also lead User Acceptance Testing (UAT) and write end-user standard operating procedures (SOPs).

4. Interface & Testing Alignment:
Prime SI and BI Vendor must participate in weekly Joint Defect Triage meetings. The SLA journal entry feed from BI Payroll into Prime SI General Ledger represents a critical milestone boundary.`
  },
  {
    id: 'mom_triparty_ivv',
    title: '2. SteerCo MoM: Tri-Party IV&V & Security Audit Mandate',
    type: 'mom',
    description: 'Minutes of Meeting confirming Our SI builds the system, 3rd-Party PwC performs IV&V validation, and Client does UAT.',
    content: `MINUTES OF MEETING (MoM) - EXECUTIVE STEERING COMMITTEE
Date: August 14, 2026
Subject: Implementation Governance & Validation Partner Mandate

Key Agreements & Scope Split:
- Delivery Prime: Our SI is confirmed as the Turnkey System Integrator responsible for full functional build across ERP, SCM, and OIC integrations.
- Validation SI (IV&V): The Board has appointed an Independent Verification & Validation (IV&V) partner (PwC Advisory) to conduct mandatory stage-gate architecture reviews, assess SOX/SOD segregation-of-duties role matrices, and perform independent code reviews of complex integrations prior to CRP3 and Go-Live.
- Client Team: Client Project Director confirmed Client will dedicate 12 full-time SMEs to lead UAT execution, training delivery, and business sign-off.
- Multi-Vendor Governance: Our SI will provide weekly status artifacts to the IV&V team and coordinate Joint Gate Sign-Off sessions before production cutover.`
  },
  {
    id: 'email_client_codelivery',
    title: '3. VP of IT Email: Client Co-Delivery & Report Authoring',
    type: 'email',
    description: 'Client VP confirming Client IT will build 70% of OTBI reports and handle all legacy AS400 ETL scripts to lower SI fees.',
    content: `From: vp_it@enterprise-client.com
To: lead_partner@oursi-consulting.com
Subject: RE: Scope Demarcation & Co-Delivery Agreement

Hi Team,

Following up on our commercial alignment session yesterday, we have agreed to the following scope demarcation to optimize the overall project budget:

1. Architecture & Core Build: Your team (Our SI) will provide the Solution Architects and lead all functional setup for Financials and Procurement, plus complex BIP/FRS statutory financial statements.
2. Reporting Co-Delivery: Our internal BI team will take ownership of developing 70% of the operational OTBI reports and dashboards under your architectural guidelines.
3. Data Migration Split: We will handle all legacy AS400 ETL, cleansing, and validation tie-out. Your team is only responsible for providing FBDI templates and staging load orchestration.
4. Validation & Assurance: We are engaging our internal Enterprise Architecture review board to validate your security design and quarterly patch governance framework.

Please update the commercial estimation model and RFP Responsibility Matrix accordingly.`
  }
];

export async function parseMultiVendorIntelWithAI(
  inputText: string,
  selectedModules: OracleModule[]
): Promise<MultiVendorAiExtractionResult> {
  // First, run deterministic rule-based heuristic extraction
  const heuristicResult = extractHeuristicMultiVendorConfig(inputText, selectedModules);

  // If server has Gemini API available, attempt structured AI refinement
  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Analyze the following RFP/Scope/MoM document and extract the multi-vendor scope demarcation for an Oracle Cloud SaaS project.
Identify:
1. What Our SI (Prime) delivers.
2. What the Other SI / BI partner delivers (e.g. HCM, Payroll, or specialized modules).
3. What the Client internal team is responsible for (e.g. Data Cleansing, OCM, UAT, SOPs).
4. What the Independent Validation SI / IV&V auditor reviews.
5. Handshake risk points and coordination overhead.

Document Content:
"""
${inputText.slice(0, 4000)}
"""

Provide a structured, precise executive breakdown.`,
        systemInstruction: 'You are an elite Oracle Cloud Global Commercial Director and Big-4 RFP Contract Specialist. Analyze multi-vendor delivery splits with high accuracy.'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        heuristicResult.executiveSummary = data.text.slice(0, 500) + '...';
        heuristicResult.confidenceScore = Math.min(95, heuristicResult.confidenceScore + 10);
      }
    }
  } catch (err) {
    console.warn('Gemini API call skipped or offline, using heuristic extraction:', err);
  }

  return heuristicResult;
}

export function extractHeuristicMultiVendorConfig(
  text: string,
  selectedModules: OracleModule[]
): MultiVendorAiExtractionResult {
  const lower = text.toLowerCase();
  
  // 1. Detect Document Type
  let sourceType: 'rfp' | 'scopesheet' | 'email' | 'mom' | 'notes' = 'notes';
  let documentTitle = 'Ingested Multi-Vendor Scope Document';

  if (lower.includes('request for proposal') || lower.includes('rfp') || lower.includes('section 4.')) {
    sourceType = 'rfp';
    documentTitle = 'RFP Section 4 - Scope & Demarcation';
  } else if (lower.includes('minutes of meeting') || lower.includes('mom') || lower.includes('steerco')) {
    sourceType = 'mom';
    documentTitle = 'Steering Committee MoM - Delivery Demarcation';
  } else if (lower.includes('from:') || lower.includes('subject:') || lower.includes('hi team')) {
    sourceType = 'email';
    documentTitle = 'Executive Scope Demarcation Email';
  } else if (lower.includes('spec sheet') || lower.includes('scope matrix')) {
    sourceType = 'scopesheet';
    documentTitle = 'Technical Scope Demarcation Sheet';
  }

  // 2. Identify Patterns
  const hasHcmBi = lower.includes('hcm') || lower.includes('payroll') || lower.includes('business integrator') || lower.includes('bi vendor') || lower.includes('si 2') || lower.includes('second vendor');
  const hasClientData = lower.includes('cleansing') || lower.includes('deduplication') || lower.includes('legacy extraction') || lower.includes('client will retain') || lower.includes('client team will extract');
  const hasValidationSi = lower.includes('validation si') || lower.includes('iv&v') || lower.includes('independent verification') || lower.includes('pwc') || lower.includes('auditor') || lower.includes('assurance partner');
  const hasClientReports = lower.includes('otbi reports') || lower.includes('co-delivery') || lower.includes('client report author');

  // 3. Build Module Demarcation
  const moduleDemarcation: Record<string, ModuleScopeDemarcation> = {};
  const detectedDemarcations: MultiVendorAiExtractionResult['detectedDemarcations'] = [];

  selectedModules.forEach(modId => {
    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
    const pillar = modDef?.pillar || 'ERP';
    const isHcm = pillar === 'HCM' || modId.toLowerCase().includes('hcm') || modId.toLowerCase().includes('pay') || modId.toLowerCase().includes('talent');

    if (isHcm && hasHcmBi) {
      moduleDemarcation[modId] = {
        moduleId: modId,
        moduleName: modDef?.name || modId,
        pillar,
        primaryOwner: 'other_si',
        ourSiSharePct: 15,
        otherSiSharePct: 85,
        clientSharePct: 0,
        validationSiPct: hasValidationSi ? 10 : 0,
        handshakeComplexity: 'High',
        notes: 'Assigned to Other SI / BI Partner based on document text.'
      };
      detectedDemarcations.push({
        area: `${modDef?.name || modId} (HCM)`,
        assignedParty: 'other_si',
        confidence: 'High',
        citation: 'Document states HCM / Payroll is contracted to specialized BI vendor.',
        rationale: 'Other SI delivers build; Our SI retains 15% SLA costing interface handshake.'
      });
    } else {
      moduleDemarcation[modId] = {
        moduleId: modId,
        moduleName: modDef?.name || modId,
        pillar,
        primaryOwner: 'our_si',
        ourSiSharePct: hasValidationSi ? 85 : 100,
        otherSiSharePct: 0,
        clientSharePct: 0,
        validationSiPct: hasValidationSi ? 15 : 0,
        handshakeComplexity: 'Low',
        notes: 'Delivered by Our SI (Prime).'
      };
      detectedDemarcations.push({
        area: `${modDef?.name || modId} (${pillar})`,
        assignedParty: 'our_si',
        confidence: 'High',
        citation: 'Core Financials, Procurement & SCM designated under Prime SI scope.',
        rationale: 'Primary build and OIC integration owned by Our SI.'
      });
    }
  });

  // 4. Build Workstream Demarcation
  const workstreamDemarcation: Record<string, WorkstreamScopeDemarcation> = { ...DEFAULT_WORKSTREAM_DEMARCATIONS };

  if (hasClientData) {
    workstreamDemarcation.data_migration = {
      ...workstreamDemarcation.data_migration,
      primaryOwner: 'client',
      ourSiSharePct: 35,
      clientSharePct: 65,
      notes: 'Client extracts and cleanses legacy source data; Our SI loads FBDI staging.'
    };
    detectedDemarcations.push({
      area: 'Data Migration & Extraction',
      assignedParty: 'client',
      confidence: 'High',
      citation: 'Client enterprise team retains responsibility for extraction and cleansing.',
      rationale: 'Reduces SI effort while establishing clear client prerequisite SLAs.'
    });
  }

  if (hasValidationSi) {
    workstreamDemarcation.security_roles = {
      ...workstreamDemarcation.security_roles,
      primaryOwner: 'validation_si',
      ourSiSharePct: 40,
      validationSiPct: 50,
      clientSharePct: 10,
      notes: 'Independent Validation SI (IV&V) audits SOD and security matrices.'
    };
    detectedDemarcations.push({
      area: 'Security & SOD Audit',
      assignedParty: 'validation_si',
      confidence: 'High',
      citation: 'Independent Verification & Validation (IV&V) auditor performs stage-gate sign-offs.',
      rationale: 'Third-party assurance layer for SOX compliance.'
    });
  }

  if (hasClientReports) {
    workstreamDemarcation.reporting_analytics = {
      ...workstreamDemarcation.reporting_analytics,
      primaryOwner: 'client',
      ourSiSharePct: 30,
      clientSharePct: 70,
      notes: 'Client report authors build standard OTBI reports.'
    };
  }

  // 5. Parties Identified
  const partiesIdentified: MultiVendorAiExtractionResult['partiesIdentified'] = [
    {
      name: 'Our SI (Prime Delivery)',
      role: 'Prime Turnkey Integrator',
      partyType: 'our_si',
      assignedScope: ['ERP Financials', 'Procurement', 'OIC Middleware', 'Lead PMO'],
      confidence: 'High',
      citation: 'Primary contractor responsible for architecture and core solution delivery.'
    },
    {
      name: hasHcmBi ? 'BI Partner / HCM Specialist' : 'Secondary Partner',
      role: 'Specialized Business Integrator',
      partyType: 'other_si',
      assignedScope: hasHcmBi ? ['Core HR', 'Payroll', 'Fast Formulas'] : ['Specialized Cloud Scope'],
      confidence: hasHcmBi ? 'High' : 'Low',
      citation: hasHcmBi ? 'Directly contracted by client for HCM / Payroll.' : 'Not explicitly active in document.'
    },
    {
      name: 'Client Enterprise Team',
      role: 'Client Organization & SMEs',
      partyType: 'client',
      assignedScope: hasClientData ? ['Legacy Data Extraction', 'Cleansing', 'UAT', 'SOPs'] : ['Business Testing & UAT'],
      confidence: 'High',
      citation: 'Client team owns data readiness and business process sign-off.'
    }
  ];

  if (hasValidationSi) {
    partiesIdentified.push({
      name: 'Validation SI (PwC / IV&V Auditor)',
      role: 'Independent Verification & Validation',
      partyType: 'validation_si',
      assignedScope: ['Security & SOD Audit', 'Stage-Gate Sign-Off', 'Integration Code Review'],
      confidence: 'High',
      citation: 'Independent audit firm appointed for regulatory and SOX oversight.'
    });
  }

  // 6. Risks
  const identifiedCoordinationRisks: MultiVendorAiExtractionResult['identifiedCoordinationRisks'] = [];
  if (hasHcmBi) {
    identifiedCoordinationRisks.push({
      risk: 'Payroll SLA to General Ledger Interface Dependency',
      boundary: 'HCM (BI Partner) <-> ERP GL (Our SI)',
      severity: 'High',
      suggestedMitigation: 'Freeze SLA journal payload specification by CRP1 and require joint mock test runs.'
    });
  }
  if (hasClientData) {
    identifiedCoordinationRisks.push({
      risk: 'Client Legacy Data Extraction Delay',
      boundary: 'Legacy AS400/SAP <-> Oracle FBDI Staging',
      severity: 'High',
      suggestedMitigation: 'Establish a strict 5-day SLA for cleansed file submission prior to each Mock Conversion cycle.'
    });
  }

  // 7. Model Type
  let modelType: MultiVendorConfig['modelType'] = 'prime_with_bi';
  if (hasValidationSi) modelType = 'tri_party_ivv';
  else if (hasClientReports) modelType = 'client_augmented';

  const suggestedConfig: MultiVendorConfig = {
    isEnabled: true,
    modelType,
    parties: DEFAULT_MULTI_VENDOR_PARTIES,
    moduleDemarcation,
    workstreamDemarcation,
    handshakeSettings: {
      autoCalculateCoordinationHours: true,
      crossVendorFrictionFactor: 1.12,
      jointSitTriageHours: 160,
      jointSteerCoHours: 110,
      interfaceAlignmentHoursPerBoundary: 35,
      ivvAuditReviewPct: hasValidationSi ? 12 : 0
    },
    aiExtractionMeta: {
      sourceDocumentType: sourceType,
      documentTitle,
      extractedAt: new Date().toISOString(),
      confidenceScore: 88,
      extractedEntitiesCount: detectedDemarcations.length,
      detectedDemarcations,
      rawText: text
    }
  };

  return {
    documentTitle,
    sourceType,
    executiveSummary: `Successfully extracted multi-vendor demarcation: Our SI owns core ERP & SCM, ${hasHcmBi ? 'BI Partner delivers HCM/Payroll, ' : ''}${hasClientData ? 'Client leads data cleansing, ' : ''}${hasValidationSi ? 'and Independent Validation SI performs IV&V audit.' : ''}`,
    confidenceScore: 88,
    partiesIdentified,
    detectedDemarcations,
    identifiedCoordinationRisks,
    suggestedConfig
  };
}
