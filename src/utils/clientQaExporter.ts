import { ProjectScenario, CalculatedProjectData, ClientQuestionItem, OracleModule } from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';
import { MODULE_TOP_20_QUESTIONS } from '../data/moduleScopingQuestions';

export function buildClientQuestionList(
  scenario: ProjectScenario,
  filterConfidence?: 'all' | 'low_only' | 'medium_low'
): ClientQuestionItem[] {
  const items: ClientQuestionItem[] = [];
  const selectedModIds = scenario.selectedModules;
  const answersMap = scenario.moduleQuestionAnswers || {};
  const metaMap = scenario.questionConfidenceMeta || {};

  selectedModIds.forEach(modId => {
    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
    const qList = MODULE_TOP_20_QUESTIONS[modId] || [];
    const modAnswers = answersMap[modId] || Array(20).fill(1);
    const modMeta = metaMap[modId] || {};

    qList.forEach((q, qIdx) => {
      const optIdx = modAnswers[qIdx] !== undefined ? modAnswers[qIdx] : 1;
      const opt = q.options[optIdx] || q.options[0];
      const meta = modMeta[qIdx] || {
        confidence: 'medium',
        percentage: 70,
        source: 'default_benchmark',
        proposalCitation: undefined,
        clientClarificationNeeded: false,
        clientNotes: undefined
      };

      if (filterConfidence === 'low_only' && meta.confidence !== 'low' && meta.confidence !== 'unconfirmed' && !meta.clientClarificationNeeded) {
        return;
      }
      if (filterConfidence === 'medium_low' && meta.confidence === 'high') {
        return;
      }

      items.push({
        id: `${modId}_q${qIdx + 1}`,
        moduleId: modId,
        moduleName: modDef?.name || modId,
        pillar: modDef?.pillar || 'ERP',
        questionIndex: qIdx + 1,
        questionText: q.question,
        category: q.category,
        rationale: q.rationale || 'Key architectural scoping determinant for effort & risk.',
        currentOptionSelected: opt.label,
        confidence: meta.confidence,
        confidencePercentage: meta.percentage,
        proposalCitation: meta.proposalCitation,
        clientClarificationNeeded: !!meta.clientClarificationNeeded,
        clientResponseNotes: meta.clientNotes
      });
    });
  });

  return items;
}

export function exportClientQaToCsv(
  scenario: ProjectScenario,
  items: ClientQuestionItem[],
  filenamePrefix = 'Oracle_Cloud_Scoping_Client_QA'
) {
  const headers = [
    'Question ID',
    'Pillar',
    'Oracle Module',
    'Category',
    'Scoping Question',
    'Business / Technical Rationale',
    'Current Inferred Assumption',
    'AI Confidence %',
    'AI Confidence Rating',
    'Proposal Document Citation / Source',
    'Client Clarification Required?',
    'Client Response / Stakeholder Notes',
    'Status'
  ];

  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = items.map(item => [
    escapeCsv(item.id),
    escapeCsv(item.pillar),
    escapeCsv(item.moduleName),
    escapeCsv(item.category),
    escapeCsv(item.questionText),
    escapeCsv(item.rationale),
    escapeCsv(item.currentOptionSelected),
    escapeCsv(`${item.confidencePercentage}%`),
    escapeCsv(item.confidence.toUpperCase()),
    escapeCsv(item.proposalCitation || 'Benchmark Assumption'),
    escapeCsv(item.clientClarificationNeeded ? 'YES - ACTION REQUIRED' : 'NO - INFERRED'),
    escapeCsv(item.clientResponseNotes || ''),
    escapeCsv(item.clientClarificationNeeded ? 'Pending Client Q&A' : 'Assumed / Confirmed')
  ]);

  const csvContent = [headers.map(escapeCsv).join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${scenario.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateFormattedEmailText(
  scenario: ProjectScenario,
  items: ClientQuestionItem[]
): string {
  const lowConfidenceOnly = items.filter(i => i.confidence === 'low' || i.clientClarificationNeeded);
  const targetList = lowConfidenceOnly.length > 0 ? lowConfidenceOnly : items;

  let text = `Subject: Oracle Fusion Cloud Implementation — Scoping & Architectural Clarification Questionnaire (${scenario.name})\n\n`;
  text += `Dear Client Project Team,\n\n`;
  text += `In order to finalize the Oracle True Cloud Method implementation effort sizing, resource allocations, and stage-gate delivery roadmap for ${scenario.name}, our Solution Architecture team has reviewed the available proposal documentation.\n\n`;
  text += `We have compiled the following ${targetList.length} scoping clarification questions across our in-scope modules to confirm your target operating model requirements.\n\n`;
  text += `--------------------------------------------------------------------------------\n`;

  // Group by module
  const byModule: Record<string, ClientQuestionItem[]> = {};
  targetList.forEach(item => {
    if (!byModule[item.moduleName]) byModule[item.moduleName] = [];
    byModule[item.moduleName].push(item);
  });

  Object.entries(byModule).forEach(([modName, qArr]) => {
    text += `\n📦 MODULE: ${modName.toUpperCase()} (${qArr[0].pillar})\n`;
    text += `================================================================================\n`;
    qArr.forEach((q, idx) => {
      text += `\n${idx + 1}. [${q.id}] ${q.questionText}\n`;
      text += `   • Category: ${q.category}\n`;
      text += `   • Architectural Rationale: ${q.rationale}\n`;
      text += `   • Current Working Assumption: ${q.currentOptionSelected}\n`;
      text += `   • AI Proposal Confidence: ${q.confidencePercentage}% (${q.confidence.toUpperCase()})\n`;
      if (q.proposalCitation) {
        text += `   • Reference Citation: ${q.proposalCitation}\n`;
      }
      text += `   • Client Clarification Request: Please confirm if the current working assumption meets your business requirements or specify any divergent custom needs.\n`;
      text += `   • Client Response: [______________________________________________________]\n`;
    });
  });

  text += `\n--------------------------------------------------------------------------------\n`;
  text += `Please feel free to provide your inputs directly in this thread or via the attached Excel Scoping Matrix.\n\n`;
  text += `Best regards,\n`;
  text += `Oracle Cloud Transformation Delivery Team`;

  return text;
}
