import {
  DeliveryOwnerParty,
  MultiVendorPartyConfig,
  MultiVendorConfig,
  WorkstreamScopeDemarcation,
  ModuleScopeDemarcation,
  PhaseScopeDemarcation,
  OracleModule
} from '../types';
import { ORACLE_MODULE_CATALOG, IMPLEMENTATION_PHASES } from './oraclePhases';

export const DEFAULT_MULTI_VENDOR_PARTIES: MultiVendorPartyConfig[] = [
  {
    id: 'our_si',
    name: 'Our SI (Prime Delivery)',
    shortCode: 'OUR SI',
    roleType: 'Prime SI',
    color: '#0f172a', // Slate 900
    badgeClass: 'bg-slate-900 text-white border-slate-700',
    organizationName: 'Primary System Integrator',
    description: 'Responsible for end-to-end architecture, primary module configuration, core middleware integration, and primary delivery leadership.'
  },
  {
    id: 'other_si',
    name: 'Other SI / BI (Business Integrator)',
    shortCode: 'OTHER SI',
    roleType: 'Specialized SI / BI',
    color: '#2563eb', // Blue 600
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    organizationName: 'Secondary Partner / BI Vendor',
    description: 'Specialized vendor or Business Integrator delivering distinct functional pillars (e.g. HCM/Payroll), legacy co-existence adapters, or specialized PaaS extensions.'
  },
  {
    id: 'client',
    name: 'Client Internal Team',
    shortCode: 'CLIENT',
    roleType: 'Client Organization',
    color: '#059669', // Emerald 600
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    organizationName: 'Client Enterprise IT & Business SMEs',
    description: 'Client internal enterprise team owning legacy data extraction, data cleansing, user acceptance testing (UAT), business change management, and BAU backfill.'
  },
  {
    id: 'validation_si',
    name: 'Validation SI / IV&V Auditor',
    shortCode: 'IV&V',
    roleType: 'Independent IV&V / Auditor',
    color: '#d97706', // Amber 600
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    organizationName: 'Independent 3rd-Party Assurance',
    description: 'Independent Verification & Validation (IV&V) or 3rd-party consulting auditor providing phase-gate reviews, security audits, and independent code/architecture sign-off.'
  },
  {
    id: 'joint',
    name: 'Joint / Co-Delivery Workstream',
    shortCode: 'JOINT',
    roleType: 'Joint Delivery',
    color: '#7c3aed', // Purple 600
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    organizationName: 'Blended Multi-Party Working Group',
    description: 'Shared co-delivery workstream with explicit percentage distribution between Our SI, BI Partner, and Client.'
  }
];

export const DEFAULT_WORKSTREAM_DEMARCATIONS: Record<string, WorkstreamScopeDemarcation> = {
  pmo_governance: {
    workstreamId: 'pmo_governance',
    workstreamName: 'Program Management & SteerCo Governance',
    category: 'Management',
    primaryOwner: 'our_si',
    ourSiSharePct: 70,
    otherSiSharePct: 15,
    clientSharePct: 10,
    validationSiPct: 5,
    coordinationBufferHours: 160,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'client',
      consulted: ['other_si', 'validation_si'],
      informed: ['client']
    },
    notes: 'Our SI acts as Lead PMO managing Integrated Master Schedule (IMS). Other SI runs stream PM.'
  },
  functional_config: {
    workstreamId: 'functional_config',
    workstreamName: 'Functional Setup, Multi-Org & Business Flows',
    category: 'Functional',
    primaryOwner: 'our_si',
    ourSiSharePct: 75,
    otherSiSharePct: 20,
    clientSharePct: 5,
    validationSiPct: 0,
    coordinationBufferHours: 120,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'our_si',
      consulted: ['other_si', 'client'],
      informed: ['validation_si']
    },
    notes: 'Configured by pillar owners based on module demarcation matrix.'
  },
  integrations_oic: {
    workstreamId: 'integrations_oic',
    workstreamName: 'OIC Cloud Middleware, REST/SOAP APIs & Feeds',
    category: 'Technical',
    primaryOwner: 'our_si',
    ourSiSharePct: 65,
    otherSiSharePct: 25,
    clientSharePct: 10,
    validationSiPct: 0,
    coordinationBufferHours: 180,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'our_si',
      consulted: ['other_si', 'client'],
      informed: ['validation_si']
    },
    notes: 'Cross-vendor API contract definitions and joint endpoint mocking required.'
  },
  data_migration: {
    workstreamId: 'data_migration',
    workstreamName: 'Data Cleansing, Extraction, Transformation & FBDI',
    category: 'Data',
    primaryOwner: 'client',
    ourSiSharePct: 40,
    otherSiSharePct: 15,
    clientSharePct: 45,
    validationSiPct: 0,
    coordinationBufferHours: 140,
    raciMatrix: {
      responsible: 'client',
      accountable: 'client',
      consulted: ['our_si', 'other_si'],
      informed: ['validation_si']
    },
    notes: 'Client owns legacy source extraction and data cleansing; Our SI provides FBDI templates and staging orchestration.'
  },
  reporting_analytics: {
    workstreamId: 'reporting_analytics',
    workstreamName: 'Reporting & Analytics (OTBI, BIP, FRS & FAW)',
    category: 'Technical',
    primaryOwner: 'our_si',
    ourSiSharePct: 60,
    otherSiSharePct: 30,
    clientSharePct: 10,
    validationSiPct: 0,
    coordinationBufferHours: 90,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'our_si',
      consulted: ['other_si', 'client'],
      informed: ['validation_si']
    },
    notes: 'Divided according to functional pillar ownership.'
  },
  testing_qa: {
    workstreamId: 'testing_qa',
    workstreamName: 'Testing Management (SIT, UAT, Perf & Defect Triage)',
    category: 'Testing',
    primaryOwner: 'joint',
    ourSiSharePct: 45,
    otherSiSharePct: 25,
    clientSharePct: 20,
    validationSiPct: 10,
    coordinationBufferHours: 200,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'client',
      consulted: ['other_si'],
      informed: ['validation_si']
    },
    notes: 'Cross-vendor SIT requires joint defect triage war room. Validation SI audits test results.'
  },
  security_roles: {
    workstreamId: 'security_roles',
    workstreamName: 'Security Role Design, Data Access & SOD Controls',
    category: 'Technical',
    primaryOwner: 'our_si',
    ourSiSharePct: 60,
    otherSiSharePct: 15,
    clientSharePct: 10,
    validationSiPct: 15,
    coordinationBufferHours: 80,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'client',
      consulted: ['other_si', 'client'],
      informed: ['validation_si']
    },
    notes: 'Validation SI / Auditor conducts mandatory independent SOD conflict review.'
  },
  ocm_training: {
    workstreamId: 'ocm_training',
    workstreamName: 'Organizational Change Management & End-User Training',
    category: 'Change',
    primaryOwner: 'client',
    ourSiSharePct: 25,
    otherSiSharePct: 10,
    clientSharePct: 65,
    validationSiPct: 0,
    coordinationBufferHours: 60,
    raciMatrix: {
      responsible: 'client',
      accountable: 'client',
      consulted: ['our_si', 'other_si'],
      informed: ['validation_si']
    },
    notes: 'Client leads business adoption and end-user SOP delivery; SIs provide train-the-trainer assets.'
  },
  cutover_hypercare: {
    workstreamId: 'cutover_hypercare',
    workstreamName: 'Cutover Runbook, Rehearsals & Hypercare Support',
    category: 'Management',
    primaryOwner: 'our_si',
    ourSiSharePct: 60,
    otherSiSharePct: 25,
    clientSharePct: 15,
    validationSiPct: 0,
    coordinationBufferHours: 100,
    raciMatrix: {
      responsible: 'our_si',
      accountable: 'our_si',
      consulted: ['other_si', 'client'],
      informed: ['validation_si']
    },
    notes: 'Unified 24/7 Command Center led by Our SI with assigned on-call shifts across all vendors.'
  }
};

export const DEFAULT_PHASE_DEMARCATIONS: Record<string, PhaseScopeDemarcation> = {
  phase_enablement: {
    phaseId: 'phase_enablement',
    phaseName: '1. Client Enablement',
    code: 'ENABLE',
    primaryOwner: 'joint',
    ourSiSharePct: 60,
    otherSiSharePct: 20,
    clientSharePct: 20,
    validationSiPct: 0,
    notes: 'Joint pod provisioning, initial PMO alignment, and client core team onboarding.',
    handshakeComplexity: 'Medium'
  },
  phase_design: {
    phaseId: 'phase_design',
    phaseName: '2. Enterprise Design',
    code: 'DESIGN',
    primaryOwner: 'our_si',
    ourSiSharePct: 80,
    otherSiSharePct: 15,
    clientSharePct: 5,
    validationSiPct: 0,
    notes: 'Modern Best Practice walkthroughs, Enterprise COA/structure design, and CEMLI specs.',
    handshakeComplexity: 'High'
  },
  phase_build: {
    phaseId: 'phase_build',
    phaseName: '3. Build, Configure & Unit Iterations',
    code: 'BUILD',
    primaryOwner: 'our_si',
    ourSiSharePct: 80,
    otherSiSharePct: 20,
    clientSharePct: 0,
    validationSiPct: 0,
    notes: 'Gold configurations, OIC middleware builds, BIP reporting, and CRP1 execution.',
    handshakeComplexity: 'Medium'
  },
  phase_test_1: {
    phaseId: 'phase_test_1',
    phaseName: '4. Business Test 1 (SIT & End-to-End)',
    code: 'TEST-1',
    primaryOwner: 'joint',
    ourSiSharePct: 60,
    otherSiSharePct: 25,
    clientSharePct: 10,
    validationSiPct: 5,
    notes: 'Cross-vendor integrated system testing, boundary API validation, and CRP2 sign-off.',
    handshakeComplexity: 'High'
  },
  phase_test_2: {
    phaseId: 'phase_test_2',
    phaseName: '5. Business Test 2 (UAT & Dress Rehearsal)',
    code: 'TEST-2',
    primaryOwner: 'client',
    ourSiSharePct: 40,
    otherSiSharePct: 15,
    clientSharePct: 40,
    validationSiPct: 5,
    notes: 'Client-led user acceptance testing, mock dress rehearsal, and operational sign-off.',
    handshakeComplexity: 'Medium'
  },
  phase_cutover: {
    phaseId: 'phase_cutover',
    phaseName: '6. Cutover & Go-Live Production Switch',
    code: 'CUTOVER',
    primaryOwner: 'our_si',
    ourSiSharePct: 70,
    otherSiSharePct: 20,
    clientSharePct: 10,
    validationSiPct: 0,
    notes: 'Production cutover window execution, delta conversion, and DNS/SSO switch.',
    handshakeComplexity: 'High'
  },
  phase_hypercare: {
    phaseId: 'phase_hypercare',
    phaseName: '7. Hypercare & Transition to Operations',
    code: 'HYPER',
    primaryOwner: 'our_si',
    ourSiSharePct: 65,
    otherSiSharePct: 20,
    clientSharePct: 15,
    validationSiPct: 0,
    notes: 'Post go-live stabilization, 1st period-end financial close, and AMS operational handover.',
    handshakeComplexity: 'Medium'
  }
};

export function generateDefaultPhaseDemarcation(
  primaryOwner: DeliveryOwnerParty = 'our_si'
): Record<string, PhaseScopeDemarcation> {
  const result: Record<string, PhaseScopeDemarcation> = {};

  IMPLEMENTATION_PHASES.forEach(ph => {
    result[ph.id] = {
      phaseId: ph.id,
      phaseName: ph.name,
      code: ph.code,
      primaryOwner,
      ourSiSharePct: primaryOwner === 'our_si' ? 100 : (primaryOwner === 'other_si' ? 0 : (primaryOwner === 'client' ? 0 : 50)),
      otherSiSharePct: primaryOwner === 'other_si' ? 100 : 0,
      clientSharePct: primaryOwner === 'client' ? 100 : 0,
      validationSiPct: 0,
      handshakeComplexity: ph.id === 'phase_design' || ph.id === 'phase_test_1' || ph.id === 'phase_cutover' ? 'High' : 'Medium',
      notes: `Phase delivery led by ${primaryOwner === 'our_si' ? 'Our SI' : (primaryOwner === 'other_si' ? 'Other SI / BI' : 'Client')}`
    };
  });

  return result;
}

export function generateDefaultModuleDemarcation(
  selectedModules: OracleModule[],
  primaryOwner: DeliveryOwnerParty = 'our_si'
): Record<string, ModuleScopeDemarcation> {
  const result: Record<string, ModuleScopeDemarcation> = {};

  selectedModules.forEach(modId => {
    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
    const pillar = modDef?.pillar || 'ERP';
    const name = modDef?.name || modId;

    result[modId] = {
      moduleId: modId,
      moduleName: name,
      pillar,
      primaryOwner,
      ourSiSharePct: primaryOwner === 'our_si' ? 100 : (primaryOwner === 'other_si' ? 0 : (primaryOwner === 'client' ? 0 : 50)),
      otherSiSharePct: primaryOwner === 'other_si' ? 100 : 0,
      clientSharePct: primaryOwner === 'client' ? 100 : 0,
      validationSiPct: 0,
      handshakeComplexity: 'Medium',
      notes: `Scope assigned to ${primaryOwner === 'our_si' ? 'Our SI' : (primaryOwner === 'other_si' ? 'Other SI / BI' : 'Client')}`
    };
  });

  return result;
}

export interface MultiVendorPresetItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  modelType: MultiVendorConfig['modelType'];
  setup: (currentModules: OracleModule[]) => Partial<MultiVendorConfig>;
}

export const MULTI_VENDOR_PRESETS: MultiVendorPresetItem[] = [
  {
    id: 'single_turnkey',
    name: '1. Single-Vendor Turnkey (100% Our SI)',
    badge: 'Single SI',
    description: 'Traditional end-to-end delivery where Our SI owns all functional modules, integrations, data migration, testing, and cutover.',
    modelType: 'single_vendor',
    setup: (currentModules) => {
      const moduleDemarcation = generateDefaultModuleDemarcation(currentModules, 'our_si');
      const workstreamDemarcation: Record<string, WorkstreamScopeDemarcation> = {};
      
      Object.keys(DEFAULT_WORKSTREAM_DEMARCATIONS).forEach(wsId => {
        workstreamDemarcation[wsId] = {
          ...DEFAULT_WORKSTREAM_DEMARCATIONS[wsId],
          primaryOwner: 'our_si',
          ourSiSharePct: 100,
          otherSiSharePct: 0,
          clientSharePct: 0,
          validationSiPct: 0,
          coordinationBufferHours: 0
        };
      });

      return {
        isEnabled: false,
        modelType: 'single_vendor',
        parties: DEFAULT_MULTI_VENDOR_PARTIES,
        moduleDemarcation,
        workstreamDemarcation,
        phaseDemarcation: generateDefaultPhaseDemarcation('our_si'),
        handshakeSettings: {
          autoCalculateCoordinationHours: false,
          crossVendorFrictionFactor: 1.0,
          jointSitTriageHours: 0,
          jointSteerCoHours: 0,
          interfaceAlignmentHoursPerBoundary: 0,
          ivvAuditReviewPct: 0
        }
      };
    }
  },
  {
    id: 'design_bi_split',
    name: '2. Phase Split: Enterprise Design by BI / Strategy Partner & Build/SIT/Cutover by Our SI',
    badge: 'Phase Demarcation',
    description: 'Specialized Business Integrator (BI) / Strategy Advisor executes Enterprise Architecture & Design (Phase 2). Our SI takes over the design blueprint and delivers Build, SIT, UAT, Cutover & Hypercare (Phases 3-7) with design defect handshake buffer.',
    modelType: 'design_bi_split',
    setup: (currentModules) => {
      const moduleDemarcation = generateDefaultModuleDemarcation(currentModules, 'our_si');
      const workstreamDemarcation: Record<string, WorkstreamScopeDemarcation> = { ...DEFAULT_WORKSTREAM_DEMARCATIONS };
      
      const phaseDemarcation: Record<string, PhaseScopeDemarcation> = {
        phase_enablement: {
          phaseId: 'phase_enablement',
          phaseName: '1. Client Enablement',
          code: 'ENABLE',
          primaryOwner: 'joint',
          ourSiSharePct: 40,
          otherSiSharePct: 40,
          clientSharePct: 20,
          validationSiPct: 0,
          notes: 'Joint pod setup and kickoff involving Strategy BI and Execution SI.',
          handshakeComplexity: 'Medium'
        },
        phase_design: {
          phaseId: 'phase_design',
          phaseName: '2. Enterprise Design',
          code: 'DESIGN',
          primaryOwner: 'other_si',
          ourSiSharePct: 20, // 20% Our SI shadow architecture & design sign-off
          otherSiSharePct: 80, // 80% Delivered by Strategy BI partner
          clientSharePct: 0,
          validationSiPct: 0,
          notes: 'Strategy BI leads Target Operating Model & Global Design; Our SI conducts feasibility shadow review.',
          handshakeComplexity: 'High'
        },
        phase_build: {
          phaseId: 'phase_build',
          phaseName: '3. Build, Configure & Unit Iterations',
          code: 'BUILD',
          primaryOwner: 'our_si',
          ourSiSharePct: 90,
          otherSiSharePct: 10, // 10% BI design clarification support
          clientSharePct: 0,
          validationSiPct: 0,
          notes: 'Our SI executes Gold config, OIC builds, and BIP reports from BI blueprint.',
          handshakeComplexity: 'Medium'
        },
        phase_test_1: {
          phaseId: 'phase_test_1',
          phaseName: '4. Business Test 1 (SIT & End-to-End)',
          code: 'TEST-1',
          primaryOwner: 'our_si',
          ourSiSharePct: 85,
          otherSiSharePct: 10,
          clientSharePct: 5,
          validationSiPct: 0,
          notes: 'Our SI leads SIT execution; Strategy BI on standby for design defect triage.',
          handshakeComplexity: 'High'
        },
        phase_test_2: {
          phaseId: 'phase_test_2',
          phaseName: '5. Business Test 2 (UAT & Dress Rehearsal)',
          code: 'TEST-2',
          primaryOwner: 'joint',
          ourSiSharePct: 50,
          otherSiSharePct: 10,
          clientSharePct: 40,
          validationSiPct: 0,
          notes: 'Client executes UAT; Our SI provides technical fixes and environment support.',
          handshakeComplexity: 'Medium'
        },
        phase_cutover: {
          phaseId: 'phase_cutover',
          phaseName: '6. Cutover & Go-Live Production Switch',
          code: 'CUTOVER',
          primaryOwner: 'our_si',
          ourSiSharePct: 80,
          otherSiSharePct: 0,
          clientSharePct: 20,
          validationSiPct: 0,
          notes: 'Our SI manages cutover runbook execution and data delta loading.',
          handshakeComplexity: 'High'
        },
        phase_hypercare: {
          phaseId: 'phase_hypercare',
          phaseName: '7. Hypercare & Transition to Operations',
          code: 'HYPER',
          primaryOwner: 'our_si',
          ourSiSharePct: 80,
          otherSiSharePct: 0,
          clientSharePct: 20,
          validationSiPct: 0,
          notes: 'Our SI stabilizes production and supports 1st period close.',
          handshakeComplexity: 'Medium'
        }
      };

      return {
        isEnabled: true,
        modelType: 'design_bi_split',
        parties: DEFAULT_MULTI_VENDOR_PARTIES,
        moduleDemarcation,
        workstreamDemarcation,
        phaseDemarcation,
        handshakeSettings: {
          autoCalculateCoordinationHours: true,
          crossVendorFrictionFactor: 1.15,
          jointSitTriageHours: 160,
          jointSteerCoHours: 120,
          interfaceAlignmentHoursPerBoundary: 40,
          ivvAuditReviewPct: 0
        }
      };
    }
  },
  {
    id: 'prime_with_bi_split',
    name: '3. Our SI (ERP + SCM) & Other BI (HCM + Payroll) Split',
    badge: '2 SIs Split',
    description: 'Our SI leads Core Financials, Procurement & SCM. Other BI partner owns Core HR, Payroll & Talent. Client executes data cleansing.',
    modelType: 'prime_with_bi',
    setup: (currentModules) => {
      const moduleDemarcation: Record<string, ModuleScopeDemarcation> = {};

      currentModules.forEach(modId => {
        const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
        const pillar = modDef?.pillar || 'ERP';
        const isHcm = pillar === 'HCM' || modId.toLowerCase().includes('hcm') || modId.toLowerCase().includes('pay') || modId.toLowerCase().includes('talent');

        moduleDemarcation[modId] = {
          moduleId: modId,
          moduleName: modDef?.name || modId,
          pillar,
          primaryOwner: isHcm ? 'other_si' : 'our_si',
          ourSiSharePct: isHcm ? 10 : 90, // 10% integration handshake for Our SI on HCM
          otherSiSharePct: isHcm ? 90 : 10,
          clientSharePct: 0,
          validationSiPct: 0,
          handshakeComplexity: isHcm ? 'High' : 'Medium',
          notes: isHcm ? 'Delivered by BI Partner. Our SI supports Payroll SLA accounting feed.' : 'Delivered by Our SI.'
        };
      });

      const workstreamDemarcation: Record<string, WorkstreamScopeDemarcation> = { ...DEFAULT_WORKSTREAM_DEMARCATIONS };

      return {
        isEnabled: true,
        modelType: 'prime_with_bi',
        parties: DEFAULT_MULTI_VENDOR_PARTIES,
        moduleDemarcation,
        workstreamDemarcation,
        handshakeSettings: {
          autoCalculateCoordinationHours: true,
          crossVendorFrictionFactor: 1.12,
          jointSitTriageHours: 180,
          jointSteerCoHours: 120,
          interfaceAlignmentHoursPerBoundary: 40,
          ivvAuditReviewPct: 0
        }
      };
    }
  },
  {
    id: 'tri_party_ivv_assurance',
    name: '3. Tri-Party: Our SI (Prime) + Validation SI (IV&V Audit) + Client (OCM)',
    badge: 'Tri-Party + IV&V',
    description: 'Our SI delivers core build and integrations; Independent Validation SI conducts stage-gate audits and SOD sign-offs; Client internal team owns data cleansing and business change.',
    modelType: 'tri_party_ivv',
    setup: (currentModules) => {
      const moduleDemarcation: Record<string, ModuleScopeDemarcation> = {};

      currentModules.forEach(modId => {
        const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
        const pillar = modDef?.pillar || 'ERP';

        moduleDemarcation[modId] = {
          moduleId: modId,
          moduleName: modDef?.name || modId,
          pillar,
          primaryOwner: 'our_si',
          ourSiSharePct: 85,
          otherSiSharePct: 0,
          clientSharePct: 0,
          validationSiPct: 15,
          handshakeComplexity: 'Medium',
          notes: 'Build by Our SI; audited and validated independently by Validation SI (IV&V).'
        };
      });

      const workstreamDemarcation: Record<string, WorkstreamScopeDemarcation> = {
        ...DEFAULT_WORKSTREAM_DEMARCATIONS,
        security_roles: {
          ...DEFAULT_WORKSTREAM_DEMARCATIONS.security_roles,
          primaryOwner: 'validation_si',
          ourSiSharePct: 40,
          validationSiPct: 50,
          clientSharePct: 10,
          notes: 'Validation SI acts as Lead Auditor for SOD & SOX security controls.'
        },
        testing_qa: {
          ...DEFAULT_WORKSTREAM_DEMARCATIONS.testing_qa,
          primaryOwner: 'joint',
          ourSiSharePct: 60,
          validationSiPct: 25,
          clientSharePct: 15,
          notes: 'Our SI executes SIT; Validation SI provides independent defect audit.'
        }
      };

      return {
        isEnabled: true,
        modelType: 'tri_party_ivv',
        parties: DEFAULT_MULTI_VENDOR_PARTIES,
        moduleDemarcation,
        workstreamDemarcation,
        handshakeSettings: {
          autoCalculateCoordinationHours: true,
          crossVendorFrictionFactor: 1.08,
          jointSitTriageHours: 120,
          jointSteerCoHours: 90,
          interfaceAlignmentHoursPerBoundary: 30,
          ivvAuditReviewPct: 12
        }
      };
    }
  },
  {
    id: 'client_augmented_codelivery',
    name: '4. Client-Augmented Co-Delivery (Our SI Leads Architecture, Client Co-Builds)',
    badge: 'Co-Delivery',
    description: 'Our SI provides lead architects, core configuration & complex integrations. Client enterprise IT team builds 50% of reports, data loaders, and owns change.',
    modelType: 'client_augmented',
    setup: (currentModules) => {
      const moduleDemarcation: Record<string, ModuleScopeDemarcation> = {};

      currentModules.forEach(modId => {
        const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
        const pillar = modDef?.pillar || 'ERP';

        moduleDemarcation[modId] = {
          moduleId: modId,
          moduleName: modDef?.name || modId,
          pillar,
          primaryOwner: 'joint',
          ourSiSharePct: 65,
          otherSiSharePct: 0,
          clientSharePct: 35,
          validationSiPct: 0,
          handshakeComplexity: 'Medium',
          notes: 'Co-delivery model: Our SI designs and configures core; Client SMEs perform standard unit setup.'
        };
      });

      const workstreamDemarcation: Record<string, WorkstreamScopeDemarcation> = {
        ...DEFAULT_WORKSTREAM_DEMARCATIONS,
        reporting_analytics: {
          ...DEFAULT_WORKSTREAM_DEMARCATIONS.reporting_analytics,
          primaryOwner: 'client',
          ourSiSharePct: 30,
          clientSharePct: 70,
          notes: 'Client report authors build standard OTBI queries; Our SI builds complex BIP/FRS templates.'
        },
        data_migration: {
          ...DEFAULT_WORKSTREAM_DEMARCATIONS.data_migration,
          primaryOwner: 'client',
          ourSiSharePct: 30,
          clientSharePct: 70,
          notes: 'Client executes full data staging, extraction, and cleansing.'
        }
      };

      return {
        isEnabled: true,
        modelType: 'client_augmented',
        parties: DEFAULT_MULTI_VENDOR_PARTIES,
        moduleDemarcation,
        workstreamDemarcation,
        handshakeSettings: {
          autoCalculateCoordinationHours: true,
          crossVendorFrictionFactor: 1.15,
          jointSitTriageHours: 150,
          jointSteerCoHours: 100,
          interfaceAlignmentHoursPerBoundary: 25,
          ivvAuditReviewPct: 0
        }
      };
    }
  }
];
