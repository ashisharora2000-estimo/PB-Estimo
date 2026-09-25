import * as XLSX from 'xlsx';
import { ProjectScenario, CalculatedProjectData, UploadedBaselineData, BaselinePhaseItem, BaselineModuleItem } from '../types';
import { IMPLEMENTATION_PHASES } from '../data/oraclePhases';

/**
 * Creates a realistic default Leadership Baseline Excel model
 * reflecting standard client SteerCo / Procurement baseline spreadsheets.
 */
export function createDefaultLeadershipBaseline(
  scenario: ProjectScenario,
  data: CalculatedProjectData
): UploadedBaselineData {
  const blendedRate = data.blendedCostRate || data.blendedBillRate || 145;
  const currentTotalHours = data.p50_BaselineHours || data.targetHours || 12000;

  // Stated AI savings target per phase as typically mandated in executive leadership proposals
  const defaultAiSavingsProfile: Record<string, { baselineFactor: number; aiSavingPct: number; notes: string }> = {
    phase_enablement: {
      baselineFactor: 1.10,
      aiSavingPct: 15,
      notes: 'Automated pod provisioning checklists & automated RACI matrix generation'
    },
    phase_design: {
      baselineFactor: 1.25,
      aiSavingPct: 20,
      notes: 'AI Modern Best Practice walkthrough synthesis & rapid requirement categorization'
    },
    phase_build: {
      baselineFactor: 1.30,
      aiSavingPct: 35,
      notes: 'AI-assisted Fast Formula coding, OIC integration mapping & report query generation'
    },
    phase_test_1: {
      baselineFactor: 1.20,
      aiSavingPct: 25,
      notes: 'Automated test script generation, synthetic test payload creation & defect triage'
    },
    phase_test_2: {
      baselineFactor: 1.12,
      aiSavingPct: 15,
      notes: 'Business simulation scenario authoring & automated UAT execution tracking'
    },
    phase_cutover: {
      baselineFactor: 1.15,
      aiSavingPct: 10,
      notes: 'Cutover runbook dry-run orchestration & automated checklist sign-offs'
    },
    phase_hypercare: {
      baselineFactor: 1.10,
      aiSavingPct: 15,
      notes: 'AI ticket categorization, duplicate incident detection & automated triage bot'
    }
  };

  const phases: BaselinePhaseItem[] = data.phaseHours.map((ph) => {
    const profile = defaultAiSavingsProfile[ph.id] || {
      baselineFactor: 1.20,
      aiSavingPct: 20,
      notes: 'Standard enterprise phase baseline'
    };

    // Baseline hours represent the historical manual baseline before AI acceleration
    const baselineHours = Math.round(ph.hours * profile.baselineFactor);
    const baselineDays = Math.round(baselineHours / 8);
    const aiSavingPct = profile.aiSavingPct;
    const netBaselineHours = Math.round(baselineHours * (1 - aiSavingPct / 100));
    const netBaselineDays = Math.round(netBaselineHours / 8);
    const baselineCost = Math.round(baselineHours * blendedRate);

    return {
      phaseId: ph.id,
      phaseName: ph.name,
      phaseCode: ph.code,
      durationWeeks: ph.durationWeeks,
      baselineHours,
      baselineDays,
      aiSavingPct,
      netBaselineHours,
      netBaselineDays,
      baselineCost,
      baselineFte: ph.durationWeeks > 0 ? Number((baselineHours / (ph.durationWeeks * 40)).toFixed(1)) : 1,
      notes: profile.notes
    };
  });

  const totalBaselineHours = phases.reduce((acc, p) => acc + p.baselineHours, 0);
  const totalBaselineDays = Math.round(totalBaselineHours / 8);
  const netBaselineHours = phases.reduce((acc, p) => acc + p.netBaselineHours, 0);
  const netBaselineDays = Math.round(netBaselineHours / 8);
  const totalBaselineCost = Math.round(totalBaselineHours * blendedRate);
  const overallAiSavingPct = totalBaselineHours > 0
    ? Number((((totalBaselineHours - netBaselineHours) / totalBaselineHours) * 100).toFixed(1))
    : 0;

  // Module baseline representation
  const modules: BaselineModuleItem[] = data.moduleEstimates.slice(0, 12).map((m) => {
    const baseHours = Math.round((m.finalP50Hours || m.baseHours || 100) * 1.18);
    return {
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      pillar: m.pillar,
      baselineHours: baseHours,
      baselineDays: Math.round(baseHours / 8),
      baselineTShirt: m.tShirtSize
    };
  });

  return {
    sourceFileName: 'Leadership_Oracle_Fusion_AI_Phase_Baseline.xlsx',
    uploadedAt: new Date().toISOString(),
    leadershipTitle: 'SteerCo Mandated Baseline & GenAI Acceleration Target',
    version: 'v2.4-SteerCo-Approved',
    totalBaselineHours,
    totalBaselineDays,
    totalBaselineCost,
    overallAiSavingPct,
    netBaselineHours,
    netBaselineDays,
    blendedHourlyRate: blendedRate,
    phases,
    modules,
    isCustomUploaded: false,
    notes: 'Generated from standard enterprise leadership benchmarks with phase-wise AI efficiency targets.'
  };
}

/**
 * Parses an uploaded Excel or CSV file into UploadedBaselineData
 */
export async function parseUploadedBaselineFile(
  buffer: ArrayBuffer,
  fileName: string,
  currentData: CalculatedProjectData
): Promise<UploadedBaselineData> {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    throw new Error('The uploaded spreadsheet contains no worksheets.');
  }

  // Look for relevant sheet or use first sheet
  const targetSheetName = sheetNames.find(n => 
    /baseline|phase|estimation|variance|ai saving|effort/i.test(n)
  ) || sheetNames[0];

  const ws = workbook.Sheets[targetSheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('Spreadsheet has insufficient rows to detect baseline data.');
  }

  // Find header row
  let headerRowIndex = -1;
  let headerRow: string[] = [];

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r].map((cell: any) => String(cell).toLowerCase().trim());
    const hasPhase = row.some(c => /phase|stage|workstream|lifecycle|step/i.test(c));
    const hasHoursOrDays = row.some(c => /hour|day|effort|baseline|net|cost|fte/i.test(c));
    if (hasPhase && hasHoursOrDays) {
      headerRowIndex = r;
      headerRow = row;
      break;
    }
  }

  // Column index finders
  let phaseCol = -1;
  let hoursCol = -1;
  let daysCol = -1;
  let aiSavingCol = -1;
  let netHoursCol = -1;
  let costCol = -1;
  let fteCol = -1;
  let notesCol = -1;

  if (headerRowIndex >= 0) {
    headerRow.forEach((col, idx) => {
      if (/phase.*code|code/i.test(col) && phaseCol === -1) phaseCol = idx;
      else if (/phase|stage|lifecycle|activity|workstream|name/i.test(col) && phaseCol === -1) phaseCol = idx;
      
      if (/baseline.*hour|base.*hour|orig.*hour/i.test(col)) hoursCol = idx;
      else if (/hour/i.test(col) && !/net|post|saving/i.test(col) && hoursCol === -1) hoursCol = idx;

      if (/baseline.*day|base.*day|orig.*day/i.test(col)) daysCol = idx;
      else if (/day/i.test(col) && !/net|post/i.test(col) && daysCol === -1) daysCol = idx;

      if (/ai.*saving|saving|genai|discount|reduction|efficiency/i.test(col)) aiSavingCol = idx;
      if (/net.*hour|ai.*hour|post.*hour|target.*hour/i.test(col)) netHoursCol = idx;
      if (/cost|price|budget|spend|amount/i.test(col)) costCol = idx;
      if (/fte|headcount|resource/i.test(col)) fteCol = idx;
      if (/note|comment|description|rationale/i.test(col)) notesCol = idx;
    });
  }

  // Fallbacks if header mapping didn't find specific columns
  if (phaseCol === -1) phaseCol = 0;
  if (hoursCol === -1 && daysCol === -1) {
    // Try to locate numeric columns
    for (let c = 1; c < (rawRows[0]?.length || 5); c++) {
      const sampleVal = parseFloat(String(rawRows[headerRowIndex + 1]?.[c] || ''));
      if (!isNaN(sampleVal) && sampleVal > 10) {
        hoursCol = c;
        break;
      }
    }
  }

  const parsedPhases: BaselinePhaseItem[] = [];

  // Map known phases
  const defaultPhases = currentData.phaseHours.length > 0
    ? currentData.phaseHours
    : IMPLEMENTATION_PHASES.map((p, i) => ({
        ...p,
        hours: 1200,
        startWeek: i * 4 + 1,
        endWeek: (i + 1) * 4,
        durationWeeks: 4
      }));

  for (let r = (headerRowIndex >= 0 ? headerRowIndex + 1 : 1); r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawPhaseText = String(row[phaseCol] || '').trim();
    if (!rawPhaseText || /total|grand total|summary/i.test(rawPhaseText)) continue;

    // Determine hours / days
    let rawHours = hoursCol >= 0 ? parseFloat(String(row[hoursCol]).replace(/[^0-9.-]/g, '')) : 0;
    let rawDays = daysCol >= 0 ? parseFloat(String(row[daysCol]).replace(/[^0-9.-]/g, '')) : 0;

    if (isNaN(rawHours)) rawHours = 0;
    if (isNaN(rawDays)) rawDays = 0;

    if (rawHours === 0 && rawDays > 0) {
      rawHours = Math.round(rawDays * 8);
    } else if (rawDays === 0 && rawHours > 0) {
      rawDays = Math.round(rawHours / 8);
    }

    if (rawHours === 0) continue;

    // AI savings percentage
    let aiSaving = 0;
    if (aiSavingCol >= 0 && row[aiSavingCol] !== undefined) {
      const cleanVal = String(row[aiSavingCol]).replace(/[^0-9.-]/g, '');
      const parsedVal = parseFloat(cleanVal);
      if (!isNaN(parsedVal)) {
        // If entered as 0.25 -> convert to 25
        aiSaving = parsedVal <= 1 && parsedVal > 0 ? parsedVal * 100 : parsedVal;
      }
    }

    // Net hours
    let netHours = 0;
    if (netHoursCol >= 0 && row[netHoursCol] !== undefined) {
      const cleanNet = parseFloat(String(row[netHoursCol]).replace(/[^0-9.-]/g, ''));
      if (!isNaN(cleanNet) && cleanNet > 0) {
        netHours = Math.round(cleanNet);
        if (aiSaving === 0 && rawHours > 0) {
          aiSaving = Math.max(0, Number((((rawHours - netHours) / rawHours) * 100).toFixed(1)));
        }
      }
    }

    if (netHours === 0 && rawHours > 0) {
      netHours = Math.round(rawHours * (1 - (aiSaving / 100)));
    }

    const netDays = Math.round(netHours / 8);
    const cost = costCol >= 0 ? parseFloat(String(row[costCol]).replace(/[^0-9.-]/g, '')) || undefined : undefined;
    const fte = fteCol >= 0 ? parseFloat(String(row[fteCol]).replace(/[^0-9.-]/g, '')) || undefined : undefined;
    const notes = notesCol >= 0 ? String(row[notesCol] || '').trim() : '';

    // Match to existing phase by keywords
    const matchedPhase = defaultPhases.find(p => {
      const name = p.name.toLowerCase();
      const code = p.code.toLowerCase();
      const text = rawPhaseText.toLowerCase();
      return text.includes(code) || 
             (text.includes('enable') && name.includes('enable')) ||
             (text.includes('mobil') && name.includes('enable')) ||
             (text.includes('design') && name.includes('design')) ||
             (text.includes('build') && name.includes('build')) ||
             (text.includes('config') && name.includes('build')) ||
             (text.includes('sit') && name.includes('sit')) ||
             (text.includes('uat') && name.includes('uat')) ||
             (text.includes('cutover') && name.includes('cutover')) ||
             (text.includes('hyper') && name.includes('hyper'));
    });

    const phaseId = matchedPhase ? matchedPhase.id : `phase_custom_${parsedPhases.length + 1}`;
    const phaseName = matchedPhase ? matchedPhase.name : rawPhaseText;
    const phaseCode = matchedPhase ? matchedPhase.code : `PHASE-${parsedPhases.length + 1}`;
    const durationWeeks = matchedPhase ? matchedPhase.durationWeeks : 4;

    parsedPhases.push({
      phaseId,
      phaseName,
      phaseCode,
      durationWeeks,
      baselineHours: Math.round(rawHours),
      baselineDays: Math.round(rawDays),
      aiSavingPct: aiSaving,
      netBaselineHours: Math.round(netHours),
      netBaselineDays: netDays,
      baselineCost: cost,
      baselineFte: fte,
      notes: notes || `Extracted from sheet: ${targetSheetName}`
    });
  }

  // If no rows parsed into phases, build structured phases from the current project
  if (parsedPhases.length === 0) {
    return createDefaultLeadershipBaseline(currentData as any, currentData);
  }

  const totalBaselineHours = parsedPhases.reduce((acc, p) => acc + p.baselineHours, 0);
  const totalBaselineDays = Math.round(totalBaselineHours / 8);
  const netBaselineHours = parsedPhases.reduce((acc, p) => acc + p.netBaselineHours, 0);
  const netBaselineDays = Math.round(netBaselineHours / 8);
  const totalBaselineCost = parsedPhases.reduce((acc, p) => acc + (p.baselineCost || 0), 0) || (totalBaselineHours * 145);
  const overallAiSavingPct = totalBaselineHours > 0
    ? Number((((totalBaselineHours - netBaselineHours) / totalBaselineHours) * 100).toFixed(1))
    : 0;

  return {
    sourceFileName: fileName,
    uploadedAt: new Date().toISOString(),
    leadershipTitle: `Uploaded Baseline Data (${fileName})`,
    version: 'Uploaded-v1.0',
    totalBaselineHours,
    totalBaselineDays,
    totalBaselineCost,
    overallAiSavingPct,
    netBaselineHours,
    netBaselineDays,
    blendedHourlyRate: 145,
    phases: parsedPhases,
    isCustomUploaded: true,
    notes: `Successfully ingested from ${fileName} (Worksheet: ${targetSheetName}, ${parsedPhases.length} phase records).`
  };
}

/**
 * Generates an editable CSV template pre-populated with the current project's phase structure
 */
export function exportBaselineTemplateCsv(
  scenario: ProjectScenario,
  data: CalculatedProjectData
): string {
  const headers = [
    'Phase Code',
    'Phase Name',
    'Duration (Weeks)',
    'Engine Calculated Hours',
    'Baseline Effort (Hours)',
    'Baseline Effort (Days)',
    'Stated AI Saving %',
    'Net Effort (Hours)',
    'Baseline Cost ($)',
    'Notes / Assumptions'
  ];

  const rows = data.phaseHours.map((ph) => {
    const baseHours = Math.round(ph.hours * 1.25);
    const baseDays = Math.round(baseHours / 8);
    const defaultAiSaving = ph.id === 'phase_build' ? 35 : (ph.id === 'phase_test_1' ? 25 : 20);
    const netHours = Math.round(baseHours * (1 - defaultAiSaving / 100));
    const cost = Math.round(baseHours * (data.blendedCostRate || 145));

    return [
      `"${ph.code}"`,
      `"${ph.name}"`,
      ph.durationWeeks,
      Math.round(ph.hours),
      baseHours,
      baseDays,
      defaultAiSaving,
      netHours,
      cost,
      `"SteerCo target baseline for ${ph.name}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates a comprehensive Baseline Variance Audit Report in CSV format
 */
export function exportBaselineVarianceReportCsv(
  baseline: UploadedBaselineData,
  data: CalculatedProjectData,
  scenario: ProjectScenario
): string {
  const headers = [
    'Phase Code',
    'Phase Name',
    'Duration (Weeks)',
    'Excel Baseline Hours',
    'Excel Baseline Days',
    'Excel AI Saving %',
    'Excel Net Hours (Post-AI)',
    'Engine Calculated P50 Hours',
    'Engine Defensible P80 Hours',
    'Variance vs Raw Baseline (Hours)',
    'Variance vs Raw Baseline (%)',
    'Variance vs Net AI Baseline (Hours)',
    'Variance vs Net AI Baseline (%)',
    'Variance Health Status',
    'Architectural Rationale & Root Cause'
  ];

  const rows = baseline.phases.map((bp) => {
    const enginePhase = data.phaseHours.find(p => p.id === bp.phaseId || p.code === bp.phaseCode);
    const engineP50 = enginePhase ? Math.round(enginePhase.hours) : 0;
    const engineP80 = Math.round(engineP50 * 1.15);

    const deltaRawHours = engineP50 - bp.baselineHours;
    const deltaRawPct = bp.baselineHours > 0 ? Number(((deltaRawHours / bp.baselineHours) * 100).toFixed(1)) : 0;

    const deltaNetHours = engineP50 - bp.netBaselineHours;
    const deltaNetPct = bp.netBaselineHours > 0 ? Number(((deltaNetHours / bp.netBaselineHours) * 100).toFixed(1)) : 0;

    let status = 'ALIGNED';
    if (deltaRawPct <= -10) status = 'ACCELERATED';
    else if (deltaRawPct >= 10) status = 'EXPANSION / RISK';

    const rationale = getPhaseVarianceRationale(bp.phaseId || bp.phaseCode, deltaRawPct, scenario);

    return [
      `"${bp.phaseCode}"`,
      `"${bp.phaseName}"`,
      bp.durationWeeks || 4,
      bp.baselineHours,
      bp.baselineDays,
      `${bp.aiSavingPct}%`,
      bp.netBaselineHours,
      engineP50,
      engineP80,
      deltaRawHours,
      `${deltaRawPct}%`,
      deltaNetHours,
      `${deltaNetPct}%`,
      `"${status}"`,
      `"${rationale.replace(/"/g, '""')}"`
    ].join(',');
  });

  // Summary Row
  const totalEngineP50 = Math.round(data.p50_BaselineHours || data.targetHours || 0);
  const totalDeltaRaw = totalEngineP50 - baseline.totalBaselineHours;
  const totalDeltaRawPct = baseline.totalBaselineHours > 0 
    ? Number(((totalDeltaRaw / baseline.totalBaselineHours) * 100).toFixed(1)) 
    : 0;
  const totalDeltaNet = totalEngineP50 - baseline.netBaselineHours;
  const totalDeltaNetPct = baseline.netBaselineHours > 0 
    ? Number(((totalDeltaNet / baseline.netBaselineHours) * 100).toFixed(1)) 
    : 0;

  const summaryRow = [
    '"TOTAL"',
    '"Program Total Summary"',
    scenario.projectWeeks,
    baseline.totalBaselineHours,
    baseline.totalBaselineDays,
    `${baseline.overallAiSavingPct}%`,
    baseline.netBaselineHours,
    totalEngineP50,
    Math.round(data.p80_DefensibleHours || totalEngineP50 * 1.15),
    totalDeltaRaw,
    `${totalDeltaRawPct}%`,
    totalDeltaNet,
    `${totalDeltaNetPct}%`,
    totalDeltaRawPct < 0 ? '"OVERALL ACCELERATION"' : '"OVERALL DEFENSIVE"',
    '"Comprehensive reconciliation between user-uploaded baseline and AI-synthesized estimation model."'
  ].join(',');

  return [
    `# Oracle Fusion Cloud - Baseline Variance Audit Report`,
    `# Proposal: ${scenario.name}`,
    `# Baseline Source: ${baseline.sourceFileName} (${baseline.version || 'v1.0'})`,
    `# Ingested At: ${baseline.uploadedAt}`,
    headers.join(','),
    ...rows,
    summaryRow
  ].join('\n');
}

/**
 * Returns tailored architectural justification for why PB-Estimo diverges from or aligns with the baseline
 */
export function getPhaseVarianceRationale(
  phaseKey: string,
  deltaPct: number,
  scenario: ProjectScenario
): string {
  const key = phaseKey.toLowerCase();

  if (key.includes('enable') || key.includes('mobil')) {
    if (deltaPct < 0) {
      return 'AI pod provisioning accelerators and pre-configured tenant access runbooks compress foundational mobilization.';
    }
    return 'Client multi-pod release synchronization and mandatory security federation require dedicated setup runway.';
  }

  if (key.includes('design')) {
    if (deltaPct < 0) {
      return 'Rapid Modern Best Practice (MBP) interactive walkthroughs and automated COA segment mapping reduce workshop cycle times.';
    }
    return 'Multi-entity statutory requirements and complex subledger accounting (SLA) rules warrant comprehensive blueprint validation.';
  }

  if (key.includes('build') || key.includes('config')) {
    if (deltaPct < 0) {
      return 'High GenAI acceleration: Automated OIC integration payload schemas, BIP SQL query generators, and Fast Formula code templates reduce build effort.';
    }
    return 'High volume of custom RICEFW objects and third-party bank integration certifications exceed standard baseline allowances.';
  }

  if (key.includes('test_1') || key.includes('sit')) {
    if (deltaPct < 0) {
      return 'Automated test script generation and synthetic test data staging reduce integration testing cycle duration.';
    }
    return 'Multi-system end-to-end interface regression testing and external bank certifications require rigorous multi-cycle execution.';
  }

  if (key.includes('test_2') || key.includes('uat')) {
    if (deltaPct < 0) {
      return 'Guided User Journeys and automated defect deduplication accelerate business simulation cycles.';
    }
    return 'Defensible testing floor: Business user availability and end-to-end Day-in-the-Life simulation cannot be fully replaced by automated tools.';
  }

  if (key.includes('cutover')) {
    if (deltaPct < 0) {
      return 'Automated mock data migration dry-runs and automated reconciliation queries compress cutover duration.';
    }
    return 'Conservative weekend cutover window with strict rollback decision gates and multi-entity balance reconciliation.';
  }

  if (key.includes('hyper')) {
    if (deltaPct < 0) {
      return 'Predictive incident clustering and automated triage bot minimize tier-1 post go-live ticket volume.';
    }
    return 'First period-end close support and multi-country local user adoption coaching require sustained on-site presence.';
  }

  return deltaPct < 0
    ? 'AI-enabled asset reusability and automated accelerators drive measurable effort reduction.'
    : 'Risk-weighted adjustments reflect enterprise scale drivers and non-negotiable quality gates.';
}
