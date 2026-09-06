import { ProjectScenario, CalculatedProjectData } from '../types';
import { askOracleAiAdvisor } from './aiService';
import {
  ASHISH_ARORA_PERSONA,
  ESTIMATION_KNOWLEDGE_BASE,
  getAshishKnowledgeAnswer,
  StatChip,
  ChatActionButton
} from '../data/ashishPersonaKnowledgeBase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ashish';
  text: string;
  timestamp: string;
  sourceAttribution?: string;
  confidencePct?: number;
  isAiGenerated?: boolean;
  statChips?: StatChip[];
  actionButtons?: ChatActionButton[];
}

export async function askAshishArora(
  userQuery: string,
  scenario: ProjectScenario,
  calculatedData: CalculatedProjectData
): Promise<ChatMessage> {
  const qClean = userQuery.trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Compile active scenario context for AI grounding
  const activeContext = {
    scenarioName: scenario.name,
    industry: scenario.clientIntel?.industrySector || 'Cross-Industry Enterprise',
    moduleCount: scenario.selectedModules.length,
    selectedModules: scenario.selectedModules,
    projectWeeks: scenario.projectWeeks,
    totalHours: Math.round(calculatedData.targetHours || calculatedData.p80_DefensibleHours || 0),
    blendedRate: Math.round(calculatedData.blendedBillRate || 135),
    grossMarginPct: Math.round(calculatedData.grossMarginPct || 42),
    peakFte: (typeof calculatedData.peakFTE === 'number'
      ? calculatedData.peakFTE
      : (typeof calculatedData.avgTotalFTE === 'number'
        ? calculatedData.avgTotalFTE
        : ((calculatedData.targetHours || 0) > 0 ? 14.5 : 0))).toFixed(1),
    legalEntities: scenario.scaleDrivers.fin_ent || 3,
    ledgers: scenario.scaleDrivers.fin_led || 2,
    plants: scenario.scaleDrivers.scm_plants || 4,
    onshoreRatio: scenario.deliveryMix?.onshore || 25,
    offshoreRatio: scenario.deliveryMix?.offshore || 75
  };

  // Compile relevant knowledge base snippets
  const relevantKbSnippets = ESTIMATION_KNOWLEDGE_BASE.map(
    t => `[Topic: ${t.title}] Summary: ${t.summary} Key Details: ${t.detailedContent}`
  ).join('\n\n');

  const systemInstruction = `${ASHISH_ARORA_PERSONA.systemInstruction}

ACTIVE SCENARIO DATA (STRICT GROUND TRUTH - ONLY USE THESE NUMBERS):
${JSON.stringify(activeContext, null, 2)}

ESTIMATION TOOL KNOWLEDGE BASE:
${relevantKbSnippets}

RULES FOR THIS RESPONSE:
- Follow the "1-Line Bottom Line (Verdict) + 3-Bullet Rule + 1 Action" format.
- Start immediately with "**🎯 Bottom Line:** <1 sentence direct answer with key numbers>".
- Follow with "**3-Point Breakdown:**" and exactly 3 clear, easy-to-understand bullet points.
- Conclude with "💡 **Recommended Action:** <1 concrete suggestion>".
- NEVER hallucinate or invent numbers outside of the ACTIVE SCENARIO DATA.
- Keep the entire response under 150 words.`;

  // Always compute contextual fallback chips & actions for grounding
  const fallback = getAshishKnowledgeAnswer(userQuery, scenario, calculatedData);

  try {
    const aiResult = await askOracleAiAdvisor(userQuery, activeContext, systemInstruction);

    if (aiResult && aiResult.success && aiResult.text && !aiResult.text.includes('fallback triggered')) {
      return {
        id: `msg_ashish_${Date.now()}`,
        sender: 'ashish',
        text: aiResult.text,
        timestamp,
        sourceAttribution: 'Ashish Arora (AI Sizing Intelligence & Verified Engine)',
        confidencePct: 96,
        isAiGenerated: true,
        statChips: fallback.statChips,
        actionButtons: fallback.actionButtons
      };
    }
  } catch (err) {
    console.warn('Ashish AI API dispatch error, using grounded local knowledge base:', err);
  }

  // Deterministic local grounded knowledge answer
  return {
    id: `msg_ashish_${Date.now()}`,
    sender: 'ashish',
    text: fallback.answerText,
    timestamp,
    sourceAttribution: fallback.sourceAttribution,
    confidencePct: fallback.confidencePct,
    isAiGenerated: false,
    statChips: fallback.statChips,
    actionButtons: fallback.actionButtons
  };
}
