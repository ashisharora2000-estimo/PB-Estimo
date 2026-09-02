import { ProjectScenario, CalculatedProjectData } from '../types';
import { calculateGradeDistribution } from '../data/gradeRatesData';

export function exportWbsToCsv(scenario: ProjectScenario, data: CalculatedProjectData) {
  const rows: string[][] = [
    ['Oracle Fusion Implementation - WBS & Effort Breakdown'],
    ['Project Scenario', scenario.name],
    ['Duration (Weeks)', scenario.projectWeeks.toString()],
    ['Target Defensible Hours (P80)', Math.round(data.targetHours).toString()],
    ['Target Person-Months', Math.round(data.targetPersonMonths).toString()],
    ['Peak Staffing Concurrency', `${data.totalFTE.toFixed(1)} FTEs`],
    ['Contingency Buffer', `${(data.contingencyPct * 100).toFixed(1)}%`],
    [''],
    ['Workstream / Track', 'Lead Role', 'Category', 'Start Week', 'End Week', 'Effort Hours', 'Person-Months', 'Avg FTE', 'Key Deliverables'],
  ];

  data.workstreamHours.forEach(ws => {
    rows.push([
      `"${ws.name}"`,
      `"${ws.leadRole}"`,
      ws.category,
      ws.startWeek.toString(),
      ws.endWeek.toString(),
      Math.round(ws.hours).toString(),
      ws.personMonths.toFixed(1),
      ws.avgFTE.toFixed(2),
      `"${ws.deliverables.join('; ')}"`
    ]);
  });

  rows.push(['']);
  rows.push(['Module Scoping & T-Shirt Sizing Breakdown', 'Pillar', 'T-Shirt Size', 'Base Hours', 'Scoping Qs (hrs)', 'Scale Drivers (hrs)', 'P50 Baseline (hrs)', 'P80 Defensible (hrs)', 'Person-Months', 'Avg FTE', 'Complexity Drivers']);
  (data.moduleEstimates || []).forEach(m => {
    rows.push([
      `"${m.moduleName}"`,
      m.pillar,
      m.tShirtSize,
      m.baseHours.toString(),
      m.scopingHours.toString(),
      m.scaleAttributedHours.toString(),
      m.finalP50Hours.toString(),
      m.finalP80Hours.toString(),
      m.personMonths.toString(),
      m.avgFTE.toString(),
      `"${m.keyComplexityDrivers.join('; ')}"`
    ]);
  });

  rows.push(['']);
  rows.push(['Implementation Phase (Oracle True Cloud Method)', 'Code', 'Start Week', 'End Week', 'Hours Share', 'Deliverables']);
  data.phaseHours.forEach(ph => {
    rows.push([
      `"${ph.name}"`,
      ph.code,
      ph.startWeek.toString(),
      ph.endWeek.toString(),
      Math.round(ph.hours).toString(),
      `"${ph.deliverables.join('; ')}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Oracle_Fusion_WBS_${scenario.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCommercialsToCsv(scenario: ProjectScenario, data: CalculatedProjectData) {
  const gradeDist = calculateGradeDistribution(
    data.targetHours,
    scenario.projectWeeks,
    scenario.gradeDistributionOverrides,
    scenario.deliverySourcingOverrides
  );

  const rows: string[][] = [
    ['Oracle Fusion Implementation - Staffing & Delivery Mix Breakdown'],
    ['Project Scenario', scenario.name],
    ['Confidence Level', `${Math.round(scenario.confidence * 100)}%`],
    ['Delivery Model', scenario.deliveryModel || 'Global Blended'],
    ['DoA Governance Tier', `Tier ${data.doaTier}`],
    ['Blended Sell Rate', `$${gradeDist.blendedBillRate}/hr`],
    ['Blended Cost Rate', `$${gradeDist.blendedCostRate}/hr`],
    ['Gross Margin %', `${gradeDist.grossMarginPct}%`],
    [''],
    ['Metric', 'Value', 'Unit / Details'],
    ['Total Hours (P80 Target)', Math.round(data.targetHours).toString(), 'Hours'],
    ['Total Person-Months', Math.round(data.targetPersonMonths).toString(), 'PM'],
    ['Critical Path Duration', scenario.projectWeeks.toString(), 'Weeks'],
    ['Peak Staffing Concurrency', `${data.totalFTE.toFixed(1)}`, 'FTEs'],
    ['Onsite Delivery Share', `${scenario.deliveryMix.onshore}%`, `${Math.round(data.hoursByRegion.onshore)} Hours`],
    ['Nearshore Delivery Share', `${scenario.deliveryMix.nearshore}%`, `${Math.round(data.hoursByRegion.nearshore)} Hours`],
    ['Offshore Delivery Share', `${scenario.deliveryMix.offshore}%`, `${Math.round(data.hoursByRegion.offshore)} Hours`],
    [''],
    ['Regional Delivery Breakdown', 'Hours', 'Hours Share', 'Person-Months', 'Average FTE'],
    ['Onshore', Math.round(data.hoursByRegion.onshore).toString(), `${scenario.deliveryMix.onshore}%`, (data.hoursByRegion.onshore / 160).toFixed(1), (data.hoursByRegion.onshore / (scenario.projectWeeks * 40)).toFixed(2)],
    ['Nearshore', Math.round(data.hoursByRegion.nearshore).toString(), `${scenario.deliveryMix.nearshore}%`, (data.hoursByRegion.nearshore / 160).toFixed(1), (data.hoursByRegion.nearshore / (scenario.projectWeeks * 40)).toFixed(2)],
    ['Offshore', Math.round(data.hoursByRegion.offshore).toString(), `${scenario.deliveryMix.offshore}%`, (data.hoursByRegion.offshore / 160).toFixed(1), (data.hoursByRegion.offshore / (scenario.projectWeeks * 40)).toFixed(2)],
    [''],
    ['Organizational Grade Staffing Pyramid (Grades A to E)', 'Mix Share (%)', 'Hours Allocated', 'FTE Concurrency', 'Blended Sell Rate ($/hr)', 'Blended Cost Rate ($/hr)', 'Primary Scope & Responsibilities']
  ];

  gradeDist.grades.forEach(g => {
    rows.push([
      `"${g.gradeCode} - ${g.gradeName}"`,
      `${g.defaultMixSharePct}%`,
      g.hours.toString(),
      g.fte.toString(),
      `$${g.blendedBillRate}`,
      `$${g.blendedCostRate}`,
      `"${g.category}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Oracle_Fusion_Staffing_${scenario.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProjectJson(scenario: ProjectScenario) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scenario, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Oracle_Fusion_Plan_${scenario.name.replace(/\s+/g, '_')}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportClientQaToCsv(scenario: ProjectScenario, items: any[]) {
  const rows: string[][] = [
    ['Oracle Fusion Implementation - Client Scoping Clarification Register'],
    ['Project Scenario', scenario.name],
    ['Total Questions', items.length.toString()],
    ['Generated At', new Date().toISOString()],
    [''],
    ['Pillar', 'Module ID', 'Module Name', 'Question #', 'Scoping Question', 'Category', 'Inferred Option', 'AI Confidence (%)', 'Citation / Evidence', 'Recommended Client Follow-Up Question', 'Client Response Notes']
  ];

  items.forEach(q => {
    rows.push([
      `"${q.pillar || ''}"`,
      `"${q.moduleId || ''}"`,
      `"${q.moduleName || ''}"`,
      `"Q${q.questionIndex || ''}"`,
      `"${(q.questionText || '').replace(/"/g, '""')}"`,
      `"${q.category || ''}"`,
      `"${(q.currentOptionSelected || '').replace(/"/g, '""')}"`,
      (q.confidencePercentage || 70).toString(),
      `"${(q.proposalCitation || '').replace(/"/g, '""')}"`,
      `"${(q.suggestedQuestionForClient || '').replace(/"/g, '""')}"`,
      `"${(q.clientResponseNotes || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Oracle_Fusion_Client_QA_${scenario.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportScopingSummaryCsv(scenario: ProjectScenario, data: CalculatedProjectData) {
  const rows: string[][] = [
    ['Oracle Fusion Implementation - Scoping Sheet & 20-Question Summary'],
    ['Project Scenario', scenario.name],
    ['Total In-Scope Modules', scenario.selectedModules.length.toString()],
    ['Target Defensible Hours (P80)', Math.round(data.p80_DefensibleHours || data.targetHours).toString()],
    ['Target Person-Months', (data.targetPersonMonths || 0).toFixed(1)],
    [''],
    ['Module Name', 'Pillar', 'T-Shirt Size', 'Base Hours', '20-Q Depth (Avg)', '20-Q Scoping Hours', 'Scale Hours', 'P80 Hours', 'Person Months', 'FTE', 'Key Complexity Drivers']
  ];

  (data.moduleEstimates || []).forEach(m => {
    rows.push([
      `"${m.moduleName}"`,
      m.pillar,
      m.tShirtSize,
      m.baseHours.toString(),
      m.questionnaireAvgScore.toFixed(2),
      m.scopingHours.toString(),
      m.scaleAttributedHours.toString(),
      m.finalP80Hours.toString(),
      m.personMonths.toString(),
      m.avgFTE.toString(),
      `"${m.keyComplexityDrivers.join('; ')}"`
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Oracle_Fusion_Scoping_${scenario.name.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

