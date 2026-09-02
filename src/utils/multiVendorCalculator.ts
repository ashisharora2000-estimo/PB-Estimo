import {
  ProjectScenario,
  MultiVendorConfig,
  MultiVendorMetrics,
  ModuleEffortEstimate,
  Workstream,
  DeliveryOwnerParty
} from '../types';
import {
  DEFAULT_MULTI_VENDOR_PARTIES,
  DEFAULT_WORKSTREAM_DEMARCATIONS,
  DEFAULT_PHASE_DEMARCATIONS,
  generateDefaultModuleDemarcation,
  generateDefaultPhaseDemarcation
} from '../data/multiVendorPresets';
import { IMPLEMENTATION_PHASES } from '../data/oraclePhases';

export function calculateMultiVendorMetrics(
  scenario: ProjectScenario,
  totalBaseHours: number,
  p80Hours: number,
  moduleEstimates: ModuleEffortEstimate[],
  workstreamHours: Array<Workstream & { hours: number }>,
  blendedBillRate: number,
  blendedCostRate: number
): MultiVendorMetrics {
  const mvConfig = scenario.multiVendor;

  // Phase baseline distribution weights
  const phaseEffortWeights: Record<string, number> = {
    phase_enablement: 0.05,
    phase_design: 0.22,
    phase_build: 0.35,
    phase_test_1: 0.16,
    phase_test_2: 0.10,
    phase_cutover: 0.06,
    phase_hypercare: 0.06
  };

  // If multi-vendor is disabled or not configured, return single-vendor metrics (100% Our SI)
  if (!mvConfig || !mvConfig.isEnabled) {
    const totalDurationWeeks = scenario.projectWeeks || 24;
    const phaseBreakdown = IMPLEMENTATION_PHASES.map(ph => {
      const weight = phaseEffortWeights[ph.id] ?? 0.14;
      const phHours = Math.round(p80Hours * weight);
      const startWeek = Math.max(1, Math.round(totalDurationWeeks * ph.startWeekPct));
      const endWeek = Math.max(startWeek + 1, Math.round(totalDurationWeeks * ph.endWeekPct));

      return {
        phaseId: ph.id,
        phaseName: ph.name,
        code: ph.code,
        startWeek,
        endWeek,
        totalHours: phHours,
        ourSiHours: phHours,
        otherSiHours: 0,
        clientHours: 0,
        validationSiHours: 0,
        primaryOwner: 'our_si' as DeliveryOwnerParty
      };
    });

    return {
      isEnabled: false,
      totalEcosystemHours: p80Hours,
      ourSiBillableHours: p80Hours,
      ourSiHandshakeOverheadHours: 0,
      ourSiTotalDefensibleHours: p80Hours,
      otherSiHours: 0,
      clientInternalHours: 0,
      validationSiHours: 0,
      ourSiSharePercentage: 100,
      clientSharePercentage: 0,
      otherSiSharePercentage: 0,
      validationSiSharePercentage: 0,
      ourSiCommercials: {
        revenue: Math.round(p80Hours * blendedBillRate),
        cost: Math.round(p80Hours * blendedCostRate),
        grossProfit: Math.round((p80Hours * blendedBillRate) - (p80Hours * blendedCostRate)),
        grossMarginPct: blendedBillRate > 0 ? Number(((((p80Hours * blendedBillRate) - (p80Hours * blendedCostRate)) / (p80Hours * blendedBillRate)) * 100).toFixed(1)) : 35.0
      },
      handshakeOverheadBreakdown: [],
      boundaryTouchpoints: [],
      workstreamHoursBreakdown: workstreamHours.map(ws => ({
        workstreamId: ws.id,
        workstreamName: ws.name,
        category: ws.category,
        totalHours: Math.round(ws.hours),
        ourSiHours: Math.round(ws.hours),
        otherSiHours: 0,
        clientHours: 0,
        validationSiHours: 0,
        primaryOwner: 'our_si' as DeliveryOwnerParty
      })),
      phaseHoursBreakdown: phaseBreakdown
    };
  }

  // Multi-vendor mode is ENABLED!
  const moduleDemarcation = mvConfig.moduleDemarcation || generateDefaultModuleDemarcation(scenario.selectedModules, 'our_si');
  const workstreamDemarcation = mvConfig.workstreamDemarcation || DEFAULT_WORKSTREAM_DEMARCATIONS;
  const phaseDemarcation = mvConfig.phaseDemarcation || DEFAULT_PHASE_DEMARCATIONS;
  const handshakeSettings = mvConfig.handshakeSettings || {
    autoCalculateCoordinationHours: true,
    crossVendorFrictionFactor: 1.10,
    jointSitTriageHours: 140,
    jointSteerCoHours: 100,
    interfaceAlignmentHoursPerBoundary: 35,
    ivvAuditReviewPct: 0
  };

  // 1. Calculate Module-Level Effort Splits
  let rawModuleOurSiHours = 0;
  let rawModuleOtherSiHours = 0;
  let rawModuleClientHours = 0;
  let rawModuleValidationHours = 0;

  const activePillarsWithOwners: Record<string, Set<DeliveryOwnerParty>> = {};

  moduleEstimates.forEach(mEst => {
    const modDem = moduleDemarcation[mEst.moduleId] || {
      moduleId: mEst.moduleId,
      primaryOwner: 'our_si',
      ourSiSharePct: 100,
      otherSiSharePct: 0,
      clientSharePct: 0,
      validationSiPct: 0,
      handshakeComplexity: 'Medium'
    };

    const modP80 = mEst.finalP80Hours || mEst.rawModuleHours || 500;
    const ourPct = (modDem.ourSiSharePct ?? 100) / 100;
    const otherPct = (modDem.otherSiSharePct ?? 0) / 100;
    const clientPct = (modDem.clientSharePct ?? 0) / 100;
    const valPct = (modDem.validationSiPct ?? 0) / 100;

    rawModuleOurSiHours += modP80 * ourPct;
    rawModuleOtherSiHours += modP80 * otherPct;
    rawModuleClientHours += modP80 * clientPct;
    rawModuleValidationHours += modP80 * valPct;

    const pillar = mEst.pillar || 'ERP';
    if (!activePillarsWithOwners[pillar]) {
      activePillarsWithOwners[pillar] = new Set();
    }
    activePillarsWithOwners[pillar].add(modDem.primaryOwner);
  });

  // 2. Calculate Workstream-Level Effort Splits
  let wsOurSiHours = 0;
  let wsOtherSiHours = 0;
  let wsClientHours = 0;
  let wsValidationHours = 0;

  const workstreamHoursBreakdown = workstreamHours.map(ws => {
    const dem = workstreamDemarcation[ws.id] || {
      workstreamId: ws.id,
      workstreamName: ws.name,
      category: ws.category,
      primaryOwner: 'our_si',
      ourSiSharePct: 100,
      otherSiSharePct: 0,
      clientSharePct: 0,
      validationSiPct: 0,
      coordinationBufferHours: 0,
      raciMatrix: { responsible: 'our_si', accountable: 'our_si', consulted: [], informed: [] }
    };

    const totalWsHrs = ws.hours;
    const ourHours = Math.round(totalWsHrs * ((dem.ourSiSharePct ?? 100) / 100));
    const otherHours = Math.round(totalWsHrs * ((dem.otherSiSharePct ?? 0) / 100));
    const clientHours = Math.round(totalWsHrs * ((dem.clientSharePct ?? 0) / 100));
    const valHours = Math.round(totalWsHrs * ((dem.validationSiPct ?? 0) / 100));

    wsOurSiHours += ourHours;
    wsOtherSiHours += otherHours;
    wsClientHours += clientHours;
    wsValidationHours += valHours;

    return {
      workstreamId: ws.id,
      workstreamName: ws.name,
      category: ws.category,
      totalHours: Math.round(totalWsHrs),
      ourSiHours: ourHours,
      otherSiHours: otherHours,
      clientHours: clientHours,
      validationSiHours: valHours,
      primaryOwner: dem.primaryOwner
    };
  });

  // 3. Calculate Phase-Level Effort Splits & Sizing
  const totalDurationWeeks = scenario.projectWeeks || 24;
  let phOurSiHours = 0;
  let phOtherSiHours = 0;
  let phClientHours = 0;
  let phValidationHours = 0;

  const phaseHoursBreakdown = IMPLEMENTATION_PHASES.map(ph => {
    const weight = phaseEffortWeights[ph.id] ?? 0.14;
    const phTotalHours = Math.round(p80Hours * weight);
    const startWeek = Math.max(1, Math.round(totalDurationWeeks * ph.startWeekPct));
    const endWeek = Math.max(startWeek + 1, Math.round(totalDurationWeeks * ph.endWeekPct));

    const pDem = phaseDemarcation[ph.id] || DEFAULT_PHASE_DEMARCATIONS[ph.id] || {
      phaseId: ph.id,
      phaseName: ph.name,
      code: ph.code,
      primaryOwner: 'our_si',
      ourSiSharePct: 100,
      otherSiSharePct: 0,
      clientSharePct: 0,
      validationSiPct: 0,
      handshakeComplexity: 'Medium'
    };

    const ourPhHours = Math.round(phTotalHours * ((pDem.ourSiSharePct ?? 100) / 100));
    const otherPhHours = Math.round(phTotalHours * ((pDem.otherSiSharePct ?? 0) / 100));
    const clientPhHours = Math.round(phTotalHours * ((pDem.clientSharePct ?? 0) / 100));
    const valPhHours = Math.round(phTotalHours * ((pDem.validationSiPct ?? 0) / 100));

    phOurSiHours += ourPhHours;
    phOtherSiHours += otherPhHours;
    phClientHours += clientPhHours;
    phValidationHours += valPhHours;

    return {
      phaseId: ph.id,
      phaseName: ph.name,
      code: ph.code,
      startWeek,
      endWeek,
      totalHours: phTotalHours,
      ourSiHours: ourPhHours,
      otherSiHours: otherPhHours,
      clientHours: clientPhHours,
      validationSiHours: valPhHours,
      primaryOwner: pDem.primaryOwner
    };
  });

  // 4. Compute Boundary Touchpoints & Handshake Interfaces
  const boundaryTouchpoints: Array<{
    sourcePillar: string;
    targetPillar: string;
    ourOwner: string;
    otherOwner: string;
    interfaceFlow: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    coordinationHours: number;
  }> = [];

  const modules = Object.values(moduleDemarcation);
  const hasHcmOther = modules.some(m => m.pillar === 'HCM' && m.primaryOwner === 'other_si');
  const hasErpOur = modules.some(m => m.pillar === 'ERP' && (m.primaryOwner === 'our_si' || m.primaryOwner === 'joint'));
  const hasScmOther = modules.some(m => m.pillar === 'SCM' && m.primaryOwner === 'other_si');
  const hasScmOur = modules.some(m => m.pillar === 'SCM' && (m.primaryOwner === 'our_si' || m.primaryOwner === 'joint'));
  const hasClientData = (workstreamDemarcation.data_migration?.clientSharePct ?? 0) >= 30;

  // Check if Enterprise Design phase is owned by Other SI / BI
  const designPhaseOwner = phaseDemarcation.phase_design?.primaryOwner;
  const isDesignDoneByOtherBI = designPhaseOwner === 'other_si' || (phaseDemarcation.phase_design?.otherSiSharePct ?? 0) >= 50;

  if (isDesignDoneByOtherBI) {
    boundaryTouchpoints.push({
      sourcePillar: 'Enterprise Design & Solution Blueprints (Strategy BI Partner)',
      targetPillar: 'Build, CRP & Execution Track (Our SI)',
      ourOwner: 'Our SI (Lead Solution Architect & Technical Lead)',
      otherOwner: 'Strategy BI Partner (Global Design Lead)',
      interfaceFlow: 'Design Handover Blueprint, CEMLI Functional Specs & Feasibility Defect Triage',
      riskLevel: 'High',
      coordinationHours: 120
    });
  }

  if (hasHcmOther && hasErpOur) {
    boundaryTouchpoints.push({
      sourcePillar: 'HCM (Other SI / BI)',
      targetPillar: 'ERP Financials (Our SI)',
      ourOwner: 'Our SI (General Ledger / SLA)',
      otherOwner: 'BI Vendor (Payroll / Costing)',
      interfaceFlow: 'Payroll Costing Journal Feeds & Subledger Accounting (SLA) Mapping',
      riskLevel: 'High',
      coordinationHours: 80
    });
  }

  if (hasScmOther && hasErpOur) {
    boundaryTouchpoints.push({
      sourcePillar: 'SCM Inventory & OM (Other SI / BI)',
      targetPillar: 'ERP AP / AR (Our SI)',
      ourOwner: 'Our SI (AP Invoice Matching / AR Invoicing)',
      otherOwner: 'BI Vendor (PO Receiving / Shipments)',
      interfaceFlow: '3-Way PO Matching, Consigned Inventory & Intercompany Transfer Accruals',
      riskLevel: 'High',
      coordinationHours: 90
    });
  }

  if (hasScmOur && hasHcmOther) {
    boundaryTouchpoints.push({
      sourcePillar: 'HCM Employee Records (Other SI / BI)',
      targetPillar: 'SCM Procurement & Approvals (Our SI)',
      ourOwner: 'Our SI (Purchasing / Requisitions)',
      otherOwner: 'BI Vendor (Core HR / Supervisor Hierarchy)',
      interfaceFlow: 'HR Position / Supervisor Sync to Oracle Approval Management (AME/BPM)',
      riskLevel: 'Medium',
      coordinationHours: 50
    });
  }

  if (hasClientData) {
    boundaryTouchpoints.push({
      sourcePillar: 'Legacy Source DBs (Client Internal)',
      targetPillar: 'Oracle Fusion Staging (Our SI)',
      ourOwner: 'Our SI (FBDI Staging / Error Hospital)',
      otherOwner: 'Client Data Lead (Extraction / Cleansing)',
      interfaceFlow: 'Legacy Source Data Extract -> Scrubbing -> FBDI Load -> Mock Tie-Out Reconciliation',
      riskLevel: 'Medium',
      coordinationHours: 70
    });
  }

  // 5. Calculate Cross-Vendor Coordination Overhead ("Multi-Vendor Tax")
  const handshakeOverheadBreakdown: Array<{
    category: string;
    hours: number;
    rationale: string;
  }> = [];

  let totalHandshakeOverheadHours = 0;

  if (handshakeSettings.autoCalculateCoordinationHours) {
    // A. Boundary Interface Handshake Hours
    const boundaryHours = boundaryTouchpoints.reduce((acc, b) => acc + b.coordinationHours, 0);
    if (boundaryHours > 0) {
      handshakeOverheadBreakdown.push({
        category: 'Cross-Vendor & Phase Handoff Alignment',
        hours: boundaryHours,
        rationale: `Effort to define, review, mock, and jointly test ${boundaryTouchpoints.length} boundary touchpoints across partner systems and phase gates.`
      });
      totalHandshakeOverheadHours += boundaryHours;
    }

    // B. Joint SIT Defect Triage & War Room
    const sitHours = handshakeSettings.jointSitTriageHours || 140;
    handshakeOverheadBreakdown.push({
      category: 'Joint SIT Defect Triage & Root-Cause War Room',
      hours: sitHours,
      rationale: 'Cross-vendor defect management to prevent finger-pointing and isolate cross-module transactional failures.'
    });
    totalHandshakeOverheadHours += sitHours;

    // C. Integrated Master Schedule (IMS) & SteerCo Sync
    const steerCoHours = handshakeSettings.jointSteerCoHours || 100;
    handshakeOverheadBreakdown.push({
      category: 'Multi-Vendor PMO & Integrated Master Schedule (IMS) Alignment',
      hours: steerCoHours,
      rationale: 'Weekly dependency tracking, release synchronization, and unified SteerCo reporting across all delivery entities.'
    });
    totalHandshakeOverheadHours += steerCoHours;
  }

  // 6. Aggregate Direct Hours
  const totalEcosystemHours = Math.round(p80Hours);

  // If model is phase split, we blend phase and workstream distributions
  const isPhaseDrivenModel = mvConfig.modelType === 'design_bi_split';
  
  const ourSiDirectHours = isPhaseDrivenModel 
    ? Math.round((phOurSiHours * 0.7) + (wsOurSiHours * 0.3))
    : Math.round(wsOurSiHours);

  const otherSiHours = isPhaseDrivenModel
    ? Math.round((phOtherSiHours * 0.7) + (wsOtherSiHours * 0.3))
    : Math.round(wsOtherSiHours);

  const clientInternalHours = isPhaseDrivenModel
    ? Math.round((phClientHours * 0.7) + (wsClientHours * 0.3))
    : Math.round(wsClientHours);

  const validationSiHours = isPhaseDrivenModel
    ? Math.round((phValidationHours * 0.7) + (wsValidationHours * 0.3))
    : Math.round(wsValidationHours);

  // Our SI Total Defensible Hours = Direct + Multi-Vendor Coordination Overhead
  const ourSiTotalDefensibleHours = ourSiDirectHours + totalHandshakeOverheadHours;

  const totalProgramRef = ourSiDirectHours + otherSiHours + clientInternalHours + validationSiHours || 1;
  const ourSiSharePercentage = Number(((ourSiDirectHours / totalProgramRef) * 100).toFixed(1));
  const otherSiSharePercentage = Number(((otherSiHours / totalProgramRef) * 100).toFixed(1));
  const clientSharePercentage = Number(((clientInternalHours / totalProgramRef) * 100).toFixed(1));
  const validationSiSharePercentage = Number(((validationSiHours / totalProgramRef) * 100).toFixed(1));

  // Our SI Commercials
  const ourRevenue = Math.round(ourSiTotalDefensibleHours * blendedBillRate);
  const ourCost = Math.round(ourSiTotalDefensibleHours * blendedCostRate);
  const ourProfit = ourRevenue - ourCost;
  const ourMarginPct = ourRevenue > 0 ? Number(((ourProfit / ourRevenue) * 100).toFixed(1)) : 35.0;

  return {
    isEnabled: true,
    totalEcosystemHours,
    ourSiBillableHours: ourSiDirectHours,
    ourSiHandshakeOverheadHours: totalHandshakeOverheadHours,
    ourSiTotalDefensibleHours,
    otherSiHours,
    clientInternalHours,
    validationSiHours,
    ourSiSharePercentage,
    clientSharePercentage,
    otherSiSharePercentage,
    validationSiSharePercentage,
    ourSiCommercials: {
      revenue: ourRevenue,
      cost: ourCost,
      grossProfit: ourProfit,
      grossMarginPct: ourMarginPct
    },
    handshakeOverheadBreakdown,
    boundaryTouchpoints,
    workstreamHoursBreakdown,
    phaseHoursBreakdown
  };
}
