import {
  ProjectScenario,
  DeliveryAssuranceReport,
  DeliveryAssuranceWorkstreamScore,
  ScheduleFeasibility,
  OracleModule
} from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';

export function calculateDeliveryAssurance(
  scenario: ProjectScenario,
  scheduleFeasibility: ScheduleFeasibility,
  currentContingencyPct: number
): DeliveryAssuranceReport {
  const meta = scenario.questionConfidenceMeta || {};
  const selectedModules = scenario.selectedModules || [];

  // 1. Calculate Confidence by Functional Domain / Pillar
  const pillarMap: Record<string, { totalConfidence: number; count: number; lowConfCount: number; evidenceCount: number; modules: string[] }> = {
    FIN: { totalConfidence: 0, count: 0, lowConfCount: 0, evidenceCount: 0, modules: [] },
    SCM: { totalConfidence: 0, count: 0, lowConfCount: 0, evidenceCount: 0, modules: [] },
    HCM: { totalConfidence: 0, count: 0, lowConfCount: 0, evidenceCount: 0, modules: [] },
    TECH: { totalConfidence: 0, count: 0, lowConfCount: 0, evidenceCount: 0, modules: ['Integrations', 'Conversions', 'Reports'] },
    PMO: { totalConfidence: 0, count: 0, lowConfCount: 0, evidenceCount: 0, modules: ['Governance', 'Rollout Strategy'] }
  };

  selectedModules.forEach(modId => {
    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
    const pillar = modDef?.pillar || 'FIN';
    const key = pillar === 'SCM' ? 'SCM' : pillar === 'HCM' ? 'HCM' : 'FIN';
    pillarMap[key].modules.push(modDef?.name || modId);

    const modMeta = meta[modId] || {};
    const qCount = Object.keys(modMeta).length;

    if (qCount > 0) {
      Object.values(modMeta).forEach(q => {
        const pct = q.percentage || (q.confidence === 'high' ? 90 : q.confidence === 'medium' ? 70 : 45);
        pillarMap[key].totalConfidence += pct;
        pillarMap[key].count += 1;
        if (q.confidence === 'low' || q.clientClarificationNeeded) {
          pillarMap[key].lowConfCount += 1;
        }
        if (q.source === 'ai_proposal' || q.source === 'client_confirmed') {
          pillarMap[key].evidenceCount += 1;
        }
      });
    } else {
      // Default baseline assumption (70% standard)
      pillarMap[key].totalConfidence += 70 * 5;
      pillarMap[key].count += 5;
    }
  });

  // Rollout & Tech confidence
  const rolloutAnswers = scenario.rolloutQuestionAnswers || {};
  const rolloutCount = Object.keys(rolloutAnswers).length;
  pillarMap.PMO.totalConfidence += rolloutCount > 0 ? 80 * rolloutCount : 70 * 4;
  pillarMap.PMO.count += Math.max(4, rolloutCount);

  const integrationCount = (scenario.technicalIntegrations || []).length;
  pillarMap.TECH.totalConfidence += integrationCount > 0 ? 82 * integrationCount : 75 * 5;
  pillarMap.TECH.count += Math.max(5, integrationCount);

  // 2. Build Workstream Scores
  const workstreamScores: DeliveryAssuranceWorkstreamScore[] = [
    {
      workstreamId: 'ws_fin',
      workstreamName: 'Financials & Org Structure',
      category: 'Functional',
      confidenceScorePct: pillarMap.FIN.count > 0 ? Math.round(pillarMap.FIN.totalConfidence / pillarMap.FIN.count) : 75,
      assuranceRating: 'Moderate',
      recommendedContingencyPct: 15,
      extractedEvidenceCount: pillarMap.FIN.evidenceCount,
      lowConfidenceCount: pillarMap.FIN.lowConfCount,
      riskDrivers: ['Multi-GAAP secondary ledgers', 'Statutory tax localisation']
    },
    {
      workstreamId: 'ws_scm',
      workstreamName: 'Supply Chain & Manufacturing',
      category: 'Functional',
      confidenceScorePct: pillarMap.SCM.count > 0 ? Math.round(pillarMap.SCM.totalConfidence / pillarMap.SCM.count) : 72,
      assuranceRating: 'Moderate',
      recommendedContingencyPct: 18,
      extractedEvidenceCount: pillarMap.SCM.evidenceCount,
      lowConfidenceCount: pillarMap.SCM.lowConfCount,
      riskDrivers: ['Plant inventory density', 'BOM & routing conversion']
    },
    {
      workstreamId: 'ws_hcm',
      workstreamName: 'Human Capital & Global Payroll',
      category: 'Functional',
      confidenceScorePct: pillarMap.HCM.count > 0 ? Math.round(pillarMap.HCM.totalConfidence / pillarMap.HCM.count) : 78,
      assuranceRating: 'Moderate',
      recommendedContingencyPct: 15,
      extractedEvidenceCount: pillarMap.HCM.evidenceCount,
      lowConfidenceCount: pillarMap.HCM.lowConfCount,
      riskDrivers: ['Statutory country payrolls', 'Fast Formula retro taxes']
    },
    {
      workstreamId: 'ws_tech',
      workstreamName: 'Technical (OIC, CEMLI & Data Conversions)',
      category: 'Technical',
      confidenceScorePct: pillarMap.TECH.count > 0 ? Math.round(pillarMap.TECH.totalConfidence / pillarMap.TECH.count) : 70,
      assuranceRating: 'Moderate',
      recommendedContingencyPct: 20,
      extractedEvidenceCount: pillarMap.TECH.evidenceCount,
      lowConfidenceCount: pillarMap.TECH.lowConfCount,
      riskDrivers: ['Legacy API middleware readiness', 'FBDI conversion mock cleansing iterations']
    },
    {
      workstreamId: 'ws_pmo',
      workstreamName: 'Rollout, Transition & Governance',
      category: 'Management',
      confidenceScorePct: pillarMap.PMO.count > 0 ? Math.round(pillarMap.PMO.totalConfidence / pillarMap.PMO.count) : 80,
      assuranceRating: 'High',
      recommendedContingencyPct: 12,
      extractedEvidenceCount: pillarMap.PMO.evidenceCount,
      lowConfidenceCount: pillarMap.PMO.lowConfCount,
      riskDrivers: ['Multi-country wave overlap', 'Business blackout calendars']
    }
  ];

  // Calibrate individual workstream ratings & contingency
  workstreamScores.forEach(ws => {
    if (ws.confidenceScorePct >= 85) {
      ws.assuranceRating = 'High';
      ws.recommendedContingencyPct = 10;
    } else if (ws.confidenceScorePct >= 70) {
      ws.assuranceRating = 'Moderate';
      ws.recommendedContingencyPct = 15;
    } else if (ws.confidenceScorePct >= 55) {
      ws.assuranceRating = 'Low';
      ws.recommendedContingencyPct = 20;
    } else {
      ws.assuranceRating = 'Critical Uncertainty';
      ws.recommendedContingencyPct = 25;
    }
  });

  // 3. Overall Composite Calculation
  const totalRfpConfidence = workstreamScores.reduce((sum, ws) => sum + ws.confidenceScorePct, 0) / workstreamScores.length;
  
  // Schedule Penalty (if schedule compressed > 10%)
  const scheduleCompression = scheduleFeasibility?.compressionPct || 0;
  const scheduleCompressionPenalty = scheduleCompression > 20 ? 15 : scheduleCompression > 10 ? 8 : 0;

  // Data Debt Volatility
  const dataDebt = scenario.clientModifiers?.dataDebt || 1.0;
  const dataDebtPenalty = dataDebt > 1.2 ? 10 : dataDebt > 1.1 ? 5 : 0;

  // Delivery Model Risk (unbalanced offshore ratio > 85%)
  const offshorePct = scenario.deliveryMix?.offshore || 60;
  const deliveryModelPenalty = offshorePct > 85 ? 6 : 0;

  const rawAssuranceScore = Math.max(35, Math.min(98, Math.round(totalRfpConfidence - scheduleCompressionPenalty - dataDebtPenalty - deliveryModelPenalty)));

  let overallRating: 'High' | 'Moderate' | 'Low' | 'Critical Uncertainty' = 'Moderate';
  let recommendedContingency = 0.15; // 15% standard
  let rationale = '';

  if (rawAssuranceScore >= 82) {
    overallRating = 'High';
    recommendedContingency = 0.12;
    rationale = 'High RFP evidence clarity with stable schedule feasibility. 12% contingency is sufficient for standard delivery buffer.';
  } else if (rawAssuranceScore >= 68) {
    overallRating = 'Moderate';
    recommendedContingency = 0.18;
    rationale = 'Moderate certainty across scoping questions. Recommended 18% contingency uplift to absorb interface and data cleansing variances.';
  } else if (rawAssuranceScore >= 52) {
    overallRating = 'Low';
    recommendedContingency = 0.22;
    rationale = 'Multiple low-confidence scoping assumptions and data debt detected. Recommended 22% contingency uplift per TBD delivery assurance standard.';
  } else {
    overallRating = 'Critical Uncertainty';
    recommendedContingency = 0.28;
    rationale = 'High ambiguity in client RFP and significant schedule compression. Critical 28% contingency required until client clarification questions are completed.';
  }

  return {
    overallAssuranceScore: rawAssuranceScore,
    overallAssuranceRating: overallRating,
    recommendedContingencyPct: Math.round(recommendedContingency * 100),
    contingencyDeltaPct: Math.round((recommendedContingency - currentContingencyPct) * 100),
    contingencyRationale: rationale,
    factors: {
      rfpEvidenceConfidence: Math.round(totalRfpConfidence),
      scheduleCompressionPenalty,
      dataDebtVolatility: dataDebtPenalty,
      deliveryModelRisk: deliveryModelPenalty
    },
    workstreamScores
  };
}
