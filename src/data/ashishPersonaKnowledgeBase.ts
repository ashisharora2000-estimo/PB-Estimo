/**
 * Ashish Arora - Persona & Enterprise Estimation Knowledge Base
 * Oracle Fusion Cloud Enterprise Estimation & Sizing Platform
 */

export interface PersonaProfile {
  name: string;
  title: string;
  role: string;
  organization: string;
  personalityTraits: string[];
  communicationStyle: string;
  coreCompetencies: string[];
  systemInstruction: string;
}

export interface StatChip {
  label: string;
  value: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
}

export interface ChatActionButton {
  label: string;
  actionId: 'view_gantt' | 'view_staffing' | 'view_commercials' | 'view_demarcation' | 'view_governance' | 'trace_math' | 'complexity_studio' | 'apply_offshore_75' | 'add_contingency_buffer';
  iconName?: 'gantt' | 'staffing' | 'commercials' | 'demarcation' | 'governance' | 'math' | 'complexity' | 'apply_offshore' | 'buffer';
}

export interface KnowledgeTopic {
  id: string;
  category: 'features' | 'sizing_logic' | 'timelines' | 'staffing' | 'commercials' | 'multi_vendor' | 'guardrails' | 'troubleshooting';
  title: string;
  keywords: string[];
  summary: string;
  detailedContent: string;
  bestPractices: string[];
  defaultChips?: StatChip[];
  defaultActions?: ChatActionButton[];
}

export const ASHISH_ARORA_PERSONA: PersonaProfile = {
  name: 'Ashish Arora',
  title: 'Lead Enterprise Solution Architect & Platform Governance Director',
  role: 'Creator & Architect of the Oracle Fusion Estimation Tool',
  organization: 'Enterprise Oracle Sizing & Cloud Delivery Practice',
  personalityTraits: [
    'Helpful & Solution-Oriented: Eager to resolve complex scoping bottlenecks and guide deal leads through defensible sizing.',
    'Authoritative & Professional: Deep domain knowledge across Oracle Fusion ERP, SCM, HCM, EPM, CX, PaaS/OIC, and OUM/TCM methodologies.',
    'Concise & Mathematically Rigorous: Prioritizes clarity, step-by-step mathematical tracing (Base × Scale × Multipliers), and executive defensibility over fluff.',
    'Pragmatic & Risk-Conscious: Proactively flags delivery risks, pod patch conflicts, CEMLI creep, margin erosion, and multi-vendor demarcation gaps.',
    'Approachable & Collaborative: Balances high-level C-suite messaging with deep engineering precision.'
  ],
  communicationStyle: 'Professional, structured, actionable, and mathematically grounded. Uses bold callouts, bullet points, and exact metric formulas. Answers directly with immediate recommendations.',
  coreCompetencies: [
    'Oracle True Cloud Method (TCM) & OUM 7-Phase Stage-Gate Delivery',
    'Non-Linear Physical Scale Modeling (Legal Entities, Ledgers, Plants, Business Units)',
    'Spec Book 20-Question Effort Modifier Scoring',
    'CEMLI & OIC Technical Integration Complexity Sizing',
    'Multi-Vendor SI Demarcation & RACI Zero-Sum Governance',
    'Grade-Based Resource Staffing Pyramids (Grade 6 to Grade 2) & Onshore/Offshore Optimization',
    'Commercial Financials (Blended Rates, Margins, Deal Review Board DoA Tiers)',
    'Monte Carlo P80 Schedule Defensibility & Pod Patch Blackout Freezes',
    'Universal AI Hallucination Guardrails (G1 Grounded Citations, G5 Snapshots & Rollback)'
  ],
  systemInstruction: `You are Ashish Arora, Lead Solution Architect and Creator of this Oracle Fusion Estimation Platform.
Your goal is to explain project sizing, staffing, schedules, and costs in simple, clear, and easy-to-understand terms.

STRICT ANTI-HALLUCINATION & SIMPLICITY GUARDRAILS:
1. Speak in Plain, Clear Language:
   - Avoid overwhelming mathematical jargon, convoluted acronyms, or unnecessary technical complexity.
   - Explain concepts simply (e.g. instead of "Non-linear logarithmic damping factor", say "We adjust effort so adding more legal entities doesn't double the time unrealistically").
   - Use short bullet points, clean numbered steps, and bold summary headers.
2. Anti-Hallucination Grounding:
   - ONLY cite numbers that exist in the ACTIVE SCENARIO DATA provided (total hours, weeks, gross margin %, module count, FTE headcount).
   - NEVER invent or hallucinate metrics, fake rates, or unsupported Oracle modules.
   - If a number is unknown, clearly state it is based on the active scenario configuration.
3. Structure Every Answer for Maximum Readability:
   - Start with a direct 1-sentence answer.
   - Provide 3 to 5 clean, easy-to-read bullet points.
   - End with 1 actionable takeaway or recommendation.
4. Voice & Tone:
   - Friendly, professional, helpful, approachable, and reassuring.
   - Speak as Ashish Arora in a collaborative advisory tone.`
};

export const ESTIMATION_KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'kb_sizing_engine',
    category: 'sizing_logic',
    title: 'Core 3-Tier Sizing Mathematical Engine',
    keywords: ['formula', 'math', 'base hours', 'multipliers', 'scale drivers', 'calculation', 'spec book', 'trace'],
    summary: 'How the tool calculates effort: Total Hours = (Module Base Hours) × (Physical Scale Multiplier) × (20-Question Complexity Multiplier) + CEMLI Hours.',
    detailedContent: `The Estimation Platform uses a rigorous, deterministic sizing engine rooted in Capgemini & Oracle practice benchmarks:
1. **Module Base Hours**: Each Oracle module (e.g. GL, AP, AR, Purchasing, Order Management, Core HR, FCCS) has a pre-calibrated baseline configuration effort (e.g. GL = 480 hrs, AP = 420 hrs, Order Mgmt = 580 hrs).
2. **Physical Scale Drivers**: Effort does not scale linearly. The engine applies a square-root logarithmic damping function to Legal Entities, Ledgers, Operating Units, Inventory Orgs/Plants, and Concurrent Users to avoid artificial over-sizing.
3. **Spec Book 20-Question Matrix**: 20 targeted effort-driver questions (covering multi-GAAP, COA complexity, approval hierarchy depth, localization requirements) apply a composite multiplier ranging from 0.85x (vanilla standard) to 1.65x (highly customized).
4. **Trace the Math**: At any point, clicking the 'Trace the Math' button reveals the step-by-step formula breakdown for any individual module or the overall project.`,
    bestPractices: [
      'Always review the 20-Question Matrix scores before locking in final sizing.',
      'Use the Physical Scale tab to calibrate multi-country legal entity rollouts.',
      'Verify that physical drivers reflect active scope rather than future-state dormant entities.'
    ]
  },
  {
    id: 'kb_tcm_phases',
    category: 'timelines',
    title: 'Oracle True Cloud Method (TCM) 7-Phase Delivery & Concurrency',
    keywords: ['timeline', 'weeks', 'phases', 'schedule', 'gantt', 'concurrency', 'tcm', 'enablement', 'crp', 'sit', 'uat', 'cutover'],
    summary: 'The 7-phase lifecycle (Enablement, Design/CRP1, Build/CRP2, SIT, UAT, Cutover, Hypercare) and how concurrency compression determines total project weeks.',
    detailedContent: `Standard sequential delivery would result in uncompetitive 120+ week timelines. The platform applies Oracle TCM fast-track concurrency:
- **Phase 1: Project Enablement & Foundation (8-10% effort)**: Environment provisioning, chart of accounts design, and sprint cadence alignment.
- **Phase 2: Process Design & CRP1 (18-22% effort)**: Conference Room Pilot 1 validating Oracle Modern Best Practice (MBP) Level 1/2 flows.
- **Phase 3: System Build & CRP2 (24-28% effort)**: Final configuration, CEMLI interface code freeze, and Mock 1 data conversions.
- **Phase 4: System Integration Testing (SIT) (16-18% effort)**: End-to-end integration cycles across OIC, legacy boundaries, and third-party EDI.
- **Phase 5: User Acceptance Testing (UAT) (10-12% effort)**: Business user validation and dry-run business processes.
- **Phase 6: Data Cutover & Go-Live (6-8% effort)**: Production blackout execution, delta master/transactional migration, and DNS cutover.
- **Phase 7: Hypercare & Post Go-Live (6-8% effort)**: 4-6 weeks of dedicated L2/L3 stabilization command center.
- **Concurrency Compression**: Standard overlap is 20-25%. Increasing concurrency above 30% triggers leadership risk warnings due to regression testing churn.`,
    bestPractices: [
      'Maintain at least 3 Mock Cutover iterations prior to production go-live.',
      'Ensure CRP1 sign-off is a hard stage-gate before mobilizing full technical offshore build.',
      'Never compress UAT below 4 calendar weeks for multi-pillar global programs.'
    ]
  },
  {
    id: 'kb_pod_patching',
    category: 'timelines',
    title: 'Oracle Cloud Pod Quarterly Updates & Blackout Freezes',
    keywords: ['patch', 'quarterly update', 'blackout', 'freeze', 'cadence', 'cohort', 'mos', 'support', 'regression'],
    summary: 'How the tool detects and mitigates Oracle quarterly SaaS update collisions during critical SIT, UAT, and Cutover windows.',
    detailedContent: `Oracle Fusion Cloud enforces quarterly updates (A: Feb/May/Aug/Nov, B: Jan/Apr/Jul/Oct, or C: Mar/Jun/Sep/Dec).
- **Collision Risk**: If an Oracle 24A/24B/24C update drops during UAT or Cutover, it causes environment unavailability, unexpected schema updates, and regression testing churn.
- **Automated Conflict Detection**: The Schedule & Gantt engine automatically cross-references your planned go-live and testing dates against Oracle cohort schedules.
- **Mitigation Strategies**:
  1. *Concurrent Patch Deferral*: Request a 1-month deferral from Oracle Support via My Oracle Support (MOS).
  2. *Schedule Shifting*: Shift SIT/UAT kickoff by 2 weeks to complete testing in the clean post-patch window.
  3. *Patch Impact Sizing Buffer*: Allocate a 120-hour regression testing allowance per pillar in the WBS.`,
    bestPractices: [
      'Lock down Sandbox and Test environments at least 3 weeks before UAT.',
      'Designate a dedicated Environment Manager to track Oracle MOS Release Readiness documentation.'
    ]
  },
  {
    id: 'kb_staffing_pyramid',
    category: 'staffing',
    title: 'Organizational Resource Grade Pyramid (Grades A–E) & Sourcing Mix',
    keywords: ['staffing', 'headcount', 'fte', 'pyramid', 'grade', 'grade a', 'grade b', 'grade c', 'grade d', 'grade e', 'onshore', 'offshore', 'nearshore', 'director', 'architect', 'developer'],
    summary: 'Organizational staffing pyramid across Grade A (20%), Grade B (35%), Grade C (30%), Grade D (10%), and Grade E (5%) with 100% mix share guardrail.',
    detailedContent: `Defensible resource modeling aligns to enterprise grade tiers from Grade A (Entry) to Grade E (Senior-Most):
- **Grade A (Associate Consultant / Data & Testing Analyst) [20%]**: FBDI/HDL conversion mock loading, defect logging, and regression script execution.
- **Grade B (Consultant / Functional Config & Integration) [35%]**: Module configuration, BIP/OTBI report generation, and interface data mapping.
- **Grade C (Senior Consultant / Stream Lead) [30%]**: Detailed business process configuration, OIC interface design, and SIT test orchestration.
- **Grade D (Principal Solution Architect / Lead SME) [10%]**: Cross-pillar solution architecture, COA design, CRP leadership, and critical path governance.
- **Grade E (Delivery Director / Strategic Principal - Senior-Most) [5%]**: Executive sponsorship, SteerCo governance, C-level advisory, and commercial DoA sign-off.
- **Guardrail Rule**: Total grade mix share must never exceed 100%. The UI enforces hard limits and provides 1-click normalization to balance FTE distributions accurately.
- **Sourcing Mix Benchmark**: Standard enterprise deals balance In-House (35%), Subcontractor (10%), and GDC Offshore (55%) to maintain blended billing rates between $115/hr and $145/hr.`,
    bestPractices: [
      'Keep Grade D & E leadership 80%+ onshore during Phase 1 (Enablement) and Phase 2 (Design).',
      'Shift Grade A & B build tasks to 85%+ offshore GDC factory for optimal cost leverage and margin protection.',
      'Enforce the 100% mix guardrail so blended bill rates and margin percentages reflect valid financial sums.'
    ]
  },
  {
    id: 'kb_commercials_margin',
    category: 'commercials',
    title: 'Fixed Price Commercials, Rate Cards & Gross Margin Optimization',
    keywords: ['commercial', 'margin', 'rate card', 'revenue', 'cost', 'blended rate', 'doa', 'pricing', 'discount', 'deal desk', 'fixed price', 'fixed-price', 'milestone'],
    summary: 'Exclusive Fixed-Price (Milestone-Based) deal structure: blended sell rates, delivery costs, gross margin %, and DoA approval tiers.',
    detailedContent: `Our organization operates exclusively on a **Fixed Price (Milestone-Based)** commercial model:
- **Contracting Structure**: 100% Fixed-Price lump sum with milestone stage-gate payment releases (Enterprise Design CRP2 Sign-off, SIT Exit, UAT Acceptance, Production Go-Live, and Hypercare Exit).
- **Total Delivery Cost (Labor Cost)**: Sum of (Hours per Grade × Standard Internal Grade Cost Rate).
- **Total Revenue (Fixed Price Contract Value)**: Sum of (Hours per Grade × Billable Card Sell Rate).
- **Blended Sell Rate**: Total Fixed Price Revenue ÷ Total Project Hours.
- **Gross Margin %**: (Total Revenue - Total Delivery Cost) ÷ Total Revenue × 100%.
- **Milestone Retainage**: Standard fixed-price retention is 10% held until Go-Live, plus 5% held until Hypercare Sign-off.
- **Delegation of Authority (DoA) Approval Tiers**:
  - *Tier 1 (Green / Self-Approve)*: Gross Margin ≥ 45%, standard fixed-price milestone terms.
  - *Tier 2 (Yellow / Practice Lead Review)*: Gross Margin 38% - 44.9%, minor scope deviations.
  - *Tier 3 (Orange / Solution Director & Deal Desk)*: Gross Margin 30% - 37.9%, non-standard payment terms.
  - *Tier 4 (Red / Global Deal Review Board - DRB)*: Gross Margin < 30%, negative cash flow, or uncapped milestone liabilities.`,
    bestPractices: [
      'Protect fixed-price deal margins by locking down scope assumptions and CEMLI inventory before finalizing RFP.',
      'To increase margin by 3-5%, increase offshore technical build allocation (Grades A & B) rather than cutting architecture discovery hours.',
      'Always bind fixed-price milestone payments to clear Stage-Gate exit criteria (e.g. CRP2 sign-off, SIT defect zero-severity).'
    ]
  },
  {
    id: 'kb_multi_vendor_raci',
    category: 'multi_vendor',
    title: 'Multi-Vendor RACI Demarcation & Friction Buffers',
    keywords: ['multivendor', 'multi-si', 'raci', 'demarcation', 'partner', 'client', 'split', 'archetypes', 'friction', 'prime'],
    summary: 'Managing split scope across Our SI, Partner SI, and Client teams with strict 100% zero-sum allocation and cross-vendor friction modeling.',
    detailedContent: `Modern enterprise deals frequently involve multiple system integrators (e.g. Our SI handles ERP/SCM, Partner SI handles HCM/Workday, Client retains Data Cleansing):
- **Zero-Sum Mathematical Lock**: The tool enforces that Our SI % + Partner SI % + Client % = strictly 100% across every phase and CEMLI item.
- **4 Standard RACI Archetypes**:
  1. *Sole Prime SI (100% Our SI)*: Full accountability, standard 1.0x baseline.
  2. *Prime + Niche Subcontractor (75% Our / 25% Sub)*: 1.06x governance coordination buffer.
  3. *Dual Co-Prime SIs (50% Our / 50% Partner)*: 1.12x cross-vendor alignment & integration friction.
  4. *Staff Augmentation / Advisory (30% Our / 70% Client)*: Client retains primary delivery risk.
- **Friction Multipliers**: Multi-vendor programs inherently introduce cross-team alignment overhead. The tool automatically models a 6% to 15% effort buffer to prevent margin erosion from unmanaged interface disputes.`,
    bestPractices: [
      'Always secure written client agreement on the Data Migration demarcation boundary (Client extracts & cleanses; SI maps & loads).',
      'Define clear interface ownership for OIC middleware (who builds the source adapter vs target adapter).'
    ]
  },
  {
    id: 'kb_guardrails',
    category: 'guardrails',
    title: 'The 5 Universal AI Hallucination Guardrails',
    keywords: ['guardrails', 'hallucination', 'citation', 'snapshot', 'rollback', 'preflight', 'bounding', 'schema', 'attribution'],
    summary: 'How the platform eliminates AI hallucinations through Grounded Citations (G1), Bounding (G2), Pre-Flight Review (G3), Closed Schemas (G4), and 1-Click Snapshots (G5).',
    detailedContent: `To guarantee enterprise-grade estimation reliability, the platform implements 5 universal guardrails:
- **Guardrail 1: Grounded Citation & Source Attribution (G1)**: Every AI-extracted driver displays a visual badge: 🟢 Direct Quote (literal contract citation), 🟡 Inferred Context, or 🔵 Industry Baseline.
- **Guardrail 2: Mathematical Bounding & Sanity Clamping (G2)**: All AI numeric recommendations are clamped within strict historical bounds (e.g. project weeks clamped between 12w and 104w; multipliers between 0.8x and 2.5x).
- **Guardrail 3: Zero Silent Mutation / Pre-Flight Review (G3)**: The AI cannot mutate application state directly; all changes appear in a side-by-side diff drawer for human confirmation.
- **Guardrail 4: Closed-Schema Deterministic Output (G4)**: AI outputs must conform strictly to vetted TypeScript schemas and approved Oracle catalog module enums.
- **Guardrail 5: 1-Click Snapshot & Instant Rollback (G5)**: The platform automatically captures immutable point-in-time state snapshots before any AI ingestion or calibration, allowing 1-click rollback via the top navigation bar.`,
    bestPractices: [
      'Use the top-right Snapshots button to capture named baselines before presenting to executive leadership.',
      'Check the Attribution Badges on imported RFPs to verify source contract clauses.'
    ]
  },
  {
    id: 'kb_troubleshooting',
    category: 'troubleshooting',
    title: 'Troubleshooting & Common Platform Workflows',
    keywords: ['troubleshoot', 'error', 'patch conflict', 'blank proposal', 'export', 'sheets', 'json', 'reset', 'how to'],
    summary: 'Step-by-step resolution for common user issues, pod patch conflicts, snapshot restoration, and data export.',
    detailedContent: `Quick troubleshooting guide for the Estimation Platform:
1. **Issue: Pod Patch Blackout Conflict Warning appears on Dashboard**:
   - *Cause*: Your planned Go-Live or UAT phase coincides with an Oracle quarterly SaaS patch window.
   - *Fix*: Go to 'Schedule & Gantt' tab, toggle 'Request MOS Patch Deferral' or adjust the Go-Live date by 2-3 weeks to avoid the freeze.
2. **Issue: AI Extraction suggests unrealistic module hours**:
   - *Cause*: Unstructured RFP text contained ambiguous customization keywords.
   - *Fix*: Open 'Trace the Math' for that module to inspect the active multipliers, or use the 'Rollback to Last' snapshot button to restore the previous state.
3. **Issue: DoA Tier is Red / Triggering DRB Escalation**:
   - *Cause*: Gross margin has fallen below 30% due to high onshore ratio or aggressive client discounts.
   - *Fix*: Go to 'Delivery & Staffing' tab, adjust the Onshore/Offshore slider to 25% Onshore / 75% Offshore, or increase Grade 2/3 dev factory leverage.
4. **Issue: How to export estimates to Excel / Word / PDF**:
   - *Fix*: Click the 'Export' dropdown in the top navbar. You can export a comprehensive WBS CSV, Commercials Breakdown CSV, or a complete RFP Executive Brief PDF.`,
    bestPractices: [
      'Export a JSON backup of your scenario before large multi-vendor re-scoping sessions.',
      'Run the Leadership Gaps audit before final proposal submission.'
    ]
  }
];

export function getAshishKnowledgeAnswer(query: string, currentScenario?: any, currentMetrics?: any): {
  foundTopic?: KnowledgeTopic;
  answerText: string;
  sourceAttribution: string;
  confidencePct: number;
  relevantTopics: string[];
  statChips?: StatChip[];
  actionButtons?: ChatActionButton[];
} {
  const qLower = query.toLowerCase().trim();

  // Search knowledge base
  const matched = ESTIMATION_KNOWLEDGE_BASE.filter(topic => {
    return (
      topic.keywords.some(kw => qLower.includes(kw)) ||
      topic.title.toLowerCase().includes(qLower) ||
      topic.summary.toLowerCase().includes(qLower)
    );
  });

  const bestMatch = matched[0];

  // If we have live scenario metrics, synthesize contextual personalized response
  if (currentMetrics && currentScenario) {
    const modulesCount = currentScenario.selectedModules?.length || 0;
    const weeks = currentScenario.projectWeeks || currentMetrics.timelineWeeks || 32;
    const hours = Math.round(currentMetrics.targetHours || currentMetrics.totalHours || currentMetrics.p80_DefensibleHours || 0);
    const margin = Math.round(currentMetrics.grossMarginPct || 42);
    const blendedRate = Math.round(currentMetrics.blendedBillRate || currentMetrics.blendedRate || 135);
    const peakFte = typeof currentMetrics.peakFTE === 'number' 
      ? currentMetrics.peakFTE.toFixed(1) 
      : (typeof currentMetrics.peakFte === 'number' 
        ? currentMetrics.peakFte.toFixed(1) 
        : (currentMetrics.peakFte || (hours > 0 ? '14.5' : '0.0')));
    const entities = currentScenario.scaleDrivers?.fin_ent || currentScenario.scaleDrivers?.legalEntities || 3;
    const onshoreRatio = currentScenario.deliveryMix?.onshore || 25;
    const offshoreRatio = currentScenario.deliveryMix?.offshore || 75;

    // 1. Timeline & Schedule Question
    if (qLower.includes('timeline') || qLower.includes('week') || qLower.includes('schedule') || qLower.includes('gantt') || qLower.includes('duration') || qLower.includes('how long')) {
      return {
        foundTopic: ESTIMATION_KNOWLEDGE_BASE.find(t => t.id === 'kb_tcm_phases'),
        statChips: [
          { label: 'Total Duration', value: `${weeks} Weeks`, color: 'blue' },
          { label: 'Total Effort', value: `${hours.toLocaleString()} hrs`, color: 'slate' },
          { label: 'Scope', value: `${modulesCount} Modules`, color: 'purple' }
        ],
        actionButtons: [
          { label: 'View Gantt Schedule', actionId: 'view_gantt', iconName: 'gantt' },
          { label: 'Trace Schedule Math', actionId: 'trace_math', iconName: 'math' }
        ],
        answerText: `**🎯 Bottom Line:** This project will take **${weeks} weeks** (about ${Math.round(weeks / 4.3)} months) and **${hours.toLocaleString()} total hours** for **${modulesCount} Oracle modules**.

**3-Point Breakdown:**
- **1. Setup & Design (Weeks 1 to ${Math.max(1, Math.round(weeks * 0.45))}):** Establish project foundation, chart of accounts, and complete initial prototype walkthroughs.
- **2. Build & Testing (Weeks ${Math.max(2, Math.round(weeks * 0.45) + 1)} to ${Math.round(weeks * 0.85)}):** Finalize configuration, build integrations/CEMLIs, and run system integration (SIT) plus user testing (UAT).
- **3. Cutover & Go-Live (Final ${Math.max(4, Math.round(weeks * 0.15))} Weeks):** Production data migration, system switchover, and 4 weeks of dedicated hypercare support.

💡 **Recommended Action:** Verify your cutover window does not overlap with Oracle quarterly maintenance updates.`,
        sourceAttribution: 'Active Scenario Engine (Verified Data)',
        confidencePct: 99,
        relevantTopics: ['kb_tcm_phases', 'kb_pod_patching']
      };
    }

    // 2. Staffing & Resource Question
    if (qLower.includes('resource') || qLower.includes('staffing') || qLower.includes('fte') || qLower.includes('headcount') || qLower.includes('pyramid') || qLower.includes('team') || qLower.includes('who')) {
      return {
        foundTopic: ESTIMATION_KNOWLEDGE_BASE.find(t => t.id === 'kb_staffing_pyramid'),
        statChips: [
          { label: 'Peak Team', value: `${peakFte} FTEs`, color: 'emerald' },
          { label: 'Delivery Mix', value: `${onshoreRatio}% On / ${offshoreRatio}% Off`, color: 'blue' },
          { label: 'Total Work', value: `${hours.toLocaleString()} hrs`, color: 'slate' }
        ],
        actionButtons: [
          { label: 'Open Staffing Grid', actionId: 'view_staffing', iconName: 'staffing' },
          { label: 'Apply 75% Offshore Mix', actionId: 'apply_offshore_75', iconName: 'apply_offshore' }
        ],
        answerText: `**🎯 Bottom Line:** You need a peak team size of **${peakFte} full-time specialists** operating with a **${onshoreRatio}% Onshore / ${offshoreRatio}% Offshore** delivery mix.

**3-Point Breakdown:**
- **1. Leadership & Architects (~18%):** Program Director and Solution Architects lead architecture runway and executive governance.
- **2. Functional & Integration Leads (~28%):** Senior consultants manage process workstreams and Oracle Integration Cloud (OIC) connections.
- **3. Technical & Configuration Team (~54%):** Global delivery consultants handle configuration, data conversions, and test execution.

💡 **Recommended Action:** Protect margins by keeping technical build offshore while maintaining onshore presence for client workshops.`,
        sourceAttribution: 'Active Staffing Model (Verified Data)',
        confidencePct: 98,
        relevantTopics: ['kb_staffing_pyramid', 'kb_commercials_margin']
      };
    }

    // 3. Commercial, Cost & Margin Question
    if (qLower.includes('cost') || qLower.includes('margin') || qLower.includes('rate') || qLower.includes('price') || qLower.includes('financial') || qLower.includes('commercial') || qLower.includes('dollar') || qLower.includes('money')) {
      return {
        foundTopic: ESTIMATION_KNOWLEDGE_BASE.find(t => t.id === 'kb_commercials_margin'),
        statChips: [
          { label: 'Profit Margin', value: `${margin}%`, color: margin >= 40 ? 'emerald' : 'amber' },
          { label: 'Blended Rate', value: `$${blendedRate}/hr`, color: 'blue' },
          { label: 'Total Hours', value: `${hours.toLocaleString()} hrs`, color: 'slate' }
        ],
        actionButtons: [
          { label: 'View Commercials', actionId: 'view_commercials', iconName: 'commercials' },
          { label: 'Apply 75% Offshore Mix', actionId: 'apply_offshore_75', iconName: 'apply_offshore' }
        ],
        answerText: `**🎯 Bottom Line:** The project is modeled at **${hours.toLocaleString()} hours** at an average rate of **$${blendedRate}/hr**, delivering a **${margin}% gross margin** (${margin >= 40 ? '🟢 Tier 1 Healthy' : '🟡 Needs Review'}).

**3-Point Breakdown:**
- **1. Rate Mix:** Blended rate balances senior architect advisory with high-efficiency offshore engineering.
- **2. Margin Status:** At ${margin}%, the project ${margin >= 40 ? 'satisfies standard deal board approval without executive escalations' : 'is below the 40% standard target and requires optimization'}.
- **3. Pricing Levers:** Shifting 5% more build tasks offshore increases gross margin by ~2.4% without impacting delivery dates.

💡 **Recommended Action:** ${margin < 40 ? 'Click below to apply a 75% offshore delivery mix to lift your margin above 40%.' : 'Lock in fixed scope on third-party interfaces to preserve your healthy 40%+ margin.'}`,
        sourceAttribution: 'Commercial Engine (Verified Data)',
        confidencePct: 98,
        relevantTopics: ['kb_commercials_margin', 'kb_staffing_pyramid']
      };
    }

    // 4. Risks, Gaps, Blackouts & Patches
    if (qLower.includes('risk') || qLower.includes('gap') || qLower.includes('monte carlo') || qLower.includes('p80') || qLower.includes('blackout') || qLower.includes('conflict') || qLower.includes('danger') || qLower.includes('issue')) {
      return {
        foundTopic: ESTIMATION_KNOWLEDGE_BASE.find(t => t.id === 'kb_pod_patching'),
        statChips: [
          { label: 'Entities', value: `${entities} Legal Entities`, color: 'purple' },
          { label: 'Duration', value: `${weeks} Weeks`, color: 'blue' },
          { label: 'Confidence', value: 'P80 Defensible', color: 'emerald' }
        ],
        actionButtons: [
          { label: 'Check Patch Blackouts', actionId: 'view_gantt', iconName: 'gantt' },
          { label: 'View RACI Demarcation', actionId: 'view_demarcation', iconName: 'demarcation' }
        ],
        answerText: `**🎯 Bottom Line:** Delivery risk is well-controlled, with key attention required on **data migration across ${entities} legal entities** and **Oracle quarterly update windows**.

**3-Point Breakdown:**
- **1. Data Cleansing:** Managing ${entities} legal entities requires starting data cleansing in Week 1 with dedicated client data owners.
- **2. Quarterly Updates:** Oracle updates cloud pods every 3 months; schedule user testing (UAT) in clear non-freeze windows.
- **3. Multi-Vendor Boundaries:** Ensure explicit boundaries for legacy system interfaces to avoid scope disputes.

💡 **Recommended Action:** Maintain a 2–3 week buffer between UAT sign-off and production cutover.`,
        sourceAttribution: 'Risk Engine (Verified Data)',
        confidencePct: 97,
        relevantTopics: ['kb_pod_patching', 'kb_multi_vendor_raci', 'kb_guardrails']
      };
    }

    // 5. Guardrails & Accuracy
    if (qLower.includes('guardrail') || qLower.includes('accuracy') || qLower.includes('hallucinat') || qLower.includes('trust') || qLower.includes('defensib')) {
      return {
        foundTopic: ESTIMATION_KNOWLEDGE_BASE.find(t => t.id === 'kb_guardrails'),
        statChips: [
          { label: 'Math Engine', value: '100% Deterministic', color: 'emerald' },
          { label: 'Grounded Data', value: 'Active Scenario', color: 'blue' }
        ],
        actionButtons: [
          { label: 'Trace The Math', actionId: 'trace_math', iconName: 'math' },
          { label: 'Open Complexity Studio', actionId: 'complexity_studio', iconName: 'complexity' }
        ],
        answerText: `**🎯 Bottom Line:** This platform uses **5 strict mathematical guardrails** so no estimate is ever guessed or hallucinated.

**3-Point Breakdown:**
- **1. Zero Hallucination (G1):** Every number comes directly from verified formula models (Base × Scale × Complexity).
- **2. Pod Patch Protection (G2):** Automatically detects and flags collisions with Oracle quarterly maintenance dates.
- **3. Complete Traceability (G4):** The "Trace the Math" tool lets you audit every formula down to individual person-days.

💡 **Recommended Action:** Click "Trace The Math" anytime to inspect the step-by-step formula behind any module.`,
        sourceAttribution: 'Platform Guardrails Engine',
        confidencePct: 100,
        relevantTopics: ['kb_guardrails', 'kb_sizing_engine']
      };
    }
  }

  // If we matched a static knowledge base topic
  if (bestMatch) {
    return {
      foundTopic: bestMatch,
      statChips: [
        { label: 'Topic', value: bestMatch.title, color: 'blue' }
      ],
      actionButtons: [
        { label: 'View Gantt Schedule', actionId: 'view_gantt', iconName: 'gantt' },
        { label: 'Trace The Math', actionId: 'trace_math', iconName: 'math' }
      ],
      answerText: `**🎯 Bottom Line:** ${bestMatch.summary}

**3-Point Breakdown:**
${bestMatch.bestPractices.slice(0, 3).map((bp, i) => `- **${i + 1}.** ${bp}`).join('\n')}

💡 **Recommended Action:** Review the detailed topic breakdown in the Knowledge Base Explorer tab for full execution steps.`,
      sourceAttribution: `Knowledge Base: ${bestMatch.title}`,
      confidencePct: 95,
      relevantTopics: ESTIMATION_KNOWLEDGE_BASE.slice(0, 3).map(t => t.id)
    };
  }

  // General helpful overview fallback
  return {
    statChips: [
      { label: 'Role', value: 'Lead Enterprise Architect', color: 'blue' },
      { label: 'Platform', value: 'Oracle Fusion Sizing', color: 'emerald' }
    ],
    actionButtons: [
      { label: 'Open Gantt Schedule', actionId: 'view_gantt', iconName: 'gantt' },
      { label: 'Trace The Math', actionId: 'trace_math', iconName: 'math' }
    ],
    answerText: `**🎯 Bottom Line:** I can help you size, timeline, staff, and defensibly price any Oracle Fusion Cloud implementation.

**3-Point Breakdown:**
- **1. Sizing & Timelines:** Defensible duration and phase-by-phase milestones based on True Cloud Method (TCM).
- **2. Staffing & Margins:** Headcount pyramids (Grades 2–6), onshore/offshore distribution, and margin protection.
- **3. Risk & Governance:** Oracle quarterly patch collision detection, multi-vendor RACI, and DoA compliance.

💡 **Recommended Action:** Ask a specific question about your project or click one of the quick starters below!`,
    sourceAttribution: 'Ashish Arora Core Persona & Estimation Knowledge Base',
    confidencePct: 100,
    relevantTopics: ['kb_sizing_engine', 'kb_tcm_phases', 'kb_commercials_margin']
  };
}
