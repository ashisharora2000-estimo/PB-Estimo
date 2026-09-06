import { ProjectScenario, CalculatedProjectData, PodcastEpisode, PodcastTurn, PodcastFocus, PodcastAccent } from '../types';

/**
 * Generate a deterministic high-fidelity Listen Podcast episode for a given scenario.
 * Used as an instant baseline or when Gemini API is offline/rate-limited.
 */
export function generateLocalPodcastEpisode(
  scenario: ProjectScenario,
  data: CalculatedProjectData,
  focus: PodcastFocus = 'deep_dive',
  customPrompt?: string,
  accent: PodcastAccent = 'en-IN'
): PodcastEpisode {
  const client = scenario.clientName || scenario.name || 'Enterprise Client';
  const weeks = scenario.projectWeeks || 32;
  const hours = Math.round(data?.targetHours || 8500);
  const fte = (data?.avgTotalFTE ?? data?.totalFTE ?? (hours / (weeks * 40)) ?? 7.5).toFixed(1);
  const onshorePct = scenario.deliveryMix?.onshore ?? 20;
  const offshorePct = scenario.deliveryMix?.offshore ?? 80;
  const margin = Math.round(data?.masterBlendedCalc?.grossMarginPct ?? data?.grossMarginPct ?? 48);
  const revenue = Math.round(data?.masterBlendedCalc?.totalRevenue ?? (hours * 145) ?? 1250000);
  const cost = Math.round(data?.masterBlendedCalc?.totalCost ?? (revenue * (1 - margin / 100)));
  const blendedRate = Math.round(data?.masterBlendedCalc?.blendedBillRate ?? (revenue / hours));
  const modules = scenario.selectedModules || [];
  const oic = scenario.scaleDrivers?.tech_oic || 0;
  const paas = scenario.scaleDrivers?.tech_paas || 0;
  const dataObjects = scenario.scaleDrivers?.tech_data_objects || 0;
  const mockCycles = scenario.scaleDrivers?.tech_conversion_cycles || 3;

  const isIndianAccent = accent === 'en-IN';
  const host1Name = isIndianAccent ? 'Alex (Priya)' : 'Alex';
  const host2Name = isIndianAccent ? 'Jordan (Rohan)' : 'Jordan';

  let title = `Deep Dive: Inside ${client}'s ${weeks}-Week Oracle Cloud Transformation`;
  let subtitle = `Architecting a defensible ${hours.toLocaleString()}-hour delivery plan with 20/80 global leverage`;
  let summary = `${host1Name} and ${host2Name} break down the commercial architecture, timeline feasibility, and 2-tier global sourcing model for ${client}'s Oracle Fusion Cloud program.`;

  const keyTakeaways: string[] = [
    `Strict 2-Tier Delivery Model (${onshorePct}% Onshore / ${offshorePct}% Offshore GDC) unlocks a ${margin}% gross margin while keeping lead architects co-located with client executives.`,
    `Total defensible effort of ${hours.toLocaleString()} hours over ${weeks} weeks maintains peak concurrency at ~${fte} FTEs across CRP2 and SIT stages.`,
    `Technical debt and CEMLI inventory (${oic} OIC interfaces, ${dataObjects} conversion objects) are de-risked via ${mockCycles} structured mock conversion cycles and stage gates.`
  ];

  let turns: Omit<PodcastTurn, 'id' | 'timestamp'>[] = [];

  if (focus === 'commercials') {
    title = `Commercial Masterclass: Sourcing, Margins & Deal Economics for ${client}`;
    subtitle = `How the 20% Onshore / 80% Offshore pyramid achieves a ${margin}% margin at $${blendedRate}/h`;
    summary = `A targeted executive financial briefing on bill rates, offshore cost arbitrage, fixed fee guardrails, and risk-adjusted pricing.`;
    
    turns = [
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Welcome back to the Deep Dive. Today we are looking at the commercial rate card and staffing leverage for ${client}. Jordan, looking at the numbers—total revenue is around $${revenue.toLocaleString()} with a ${margin}% target gross margin. For a major enterprise transformation, how did the deal team construct that margin profile without pricing themselves out of the market?`,
        topicTag: 'Commercial Overview',
        highlight: true
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `It all comes down to the deliberate two-tier global delivery model. Instead of a bloated onshore footprint, this proposal locks in ${onshorePct}% Onshore and ${offshorePct}% Offshore Global Delivery Center execution. That brings the master blended bill rate to roughly $${blendedRate} an hour, against a blended delivery cost of around $${Math.round(cost / hours)} an hour. It gives the client an ultra-competitive blended rate while preserving healthy consulting profitability.`,
        topicTag: 'Rate Arbitrage'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Right. But when a CFO hears 'eighty percent offshore', their immediate reaction is: 'Are we going to suffer timezone lag? Will our business leads spend half their day on calls with people halfway around the world?' How does the delivery architecture address that fear?`,
        topicTag: 'Offshore Governance'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `That is the crucial distinction. That twenty percent onshore isn't junior staff—it consists entirely of Principal Enterprise Architects, PMO Leadership, and functional workstream leads who sit face-to-face with the client's Steering Committee. The eighty percent offshore team operates as a specialized technical factory for OIC integration development, FBDI data pipelines, and BIP reporting. High-touch governance on-site; industrial-scale development in the GDC.`,
        topicTag: 'Delivery Pyramid',
        highlight: true
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `That makes total sense. And looking at contract risk: is this structured as a Fixed-Fee or Time and Materials? Because with ${oic} integrations and ${dataObjects} data migration objects, scope creep could completely destroy that ${margin}% margin.`,
        topicTag: 'Contract Structure'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Exactly. The proposal includes a fifteen percent P80 risk buffer and an explicit Delegation of Authority tier. If scope expands beyond the agreed ${hours.toLocaleString()} baseline hours, stage-gate change controls kick in automatically before SIT entry. It protects both the client's budget and the delivery team's margin.`,
        topicTag: 'Risk Protection'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Bottom line: competitive pricing for the client, protected margins for the practice, and zero guesswork on governance. Brilliant summary, Jordan.`,
        topicTag: 'Executive Conclusion',
        highlight: true
      }
    ];
  } else if (focus === 'architecture') {
    title = `Architecture & Technical Reality: CEMLI, OIC & Data Migration for ${client}`;
    subtitle = `Unpacking ${oic} interfaces, ${dataObjects} FBDI conversions, and stage-gate testing`;
    summary = `A deep technical exploration into the integration architecture, conversion cycle rigors, and cutover de-risking.`;

    turns = [
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Welcome to our technical deep dive into ${client}'s Oracle Cloud architecture. Jordan, when you scan the technical inventory—we have ${oic} OIC integration endpoints, ${paas} custom PaaS extensions, and ${dataObjects} distinct FBDI data conversion objects. From a technical director's standpoint, where is the highest architectural risk on this board?`,
        topicTag: 'Technical Footprint',
        highlight: true
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Without a doubt, it's the interplay between data conversion and interface dependencies. People often assume OIC integrations are the bottleneck, but if your master data in FBDI isn't cleansed and mapped early, your integration payloads fail in System Integration Testing. That's why the plan enforces ${mockCycles} distinct mock conversion cycles before we ever cut over to UAT.`,
        topicTag: 'Data & Integration Coupling'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Walk me through those mock cycles. Mock One, Mock Two, Mock Three—what actually happens in each one, and why isn't two mocks enough for an enterprise of this size?`,
        topicTag: 'Mock Cycles'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Mock One is pure schema validation and extraction volume testing. In Mock Two, we load into the CRP2 sandbox and execute end-to-end integration flows with live OIC adapters. Mock Three is the full dress rehearsal with legacy delta loads and cutover blackout timing. If you skip Mock Three, you end up doing your rehearsal during production cutover weekend—which is how ERP disasters happen.`,
        topicTag: 'Cutover Rehearsal',
        highlight: true
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `And what about quarterly Oracle patch updates? In a ${weeks}-week project, the cloud environment is going to receive at least two mandatory quarterly maintenance releases. How does the plan prevent those from blowing up our testing cycle?`,
        topicTag: 'Patch Governance'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `We model a mandatory patch blackout freeze during the final four weeks of SIT and the entire UAT window. Regression test automation scripts are maintained in the GDC offshore factory, allowing us to validate quarterly updates in under seventy-two hours without halting functional testing.`,
        topicTag: 'Regression Automation'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `That is what I call a bulletproof technical strategy. Clear boundaries, strict mock disciplines, and automated regression shields.`,
        topicTag: 'Conclusion',
        highlight: true
      }
    ];
  } else if (focus === 'executive') {
    title = `2-Minute Executive Briefing: ${client} Oracle Cloud Proposal`;
    subtitle = `Key takeaways for Steering Committee, Boardroom & Bid Approval`;
    summary = `Fast, high-impact synthesis of the timeline, commercials, delivery leverage, and risk posture.`;

    turns = [
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Welcome to the executive speed-run on the ${client} Oracle Cloud proposal. Jordan, thirty seconds: what does this deal represent?`,
        topicTag: 'Executive Opening',
        highlight: true
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `It is a ${weeks}-week, fully defensible enterprise modernization program totaling ${hours.toLocaleString()} effort hours at an average concurrency of ${fte} full-time equivalents. It covers key pillars across ${modules.slice(0, 4).join(', ')}, governed by the Oracle True Cloud Method.`,
        topicTag: 'Core Metric'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `And on the commercial bottom line?`,
        topicTag: 'Financial Metric'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `A lean blended bill rate of $${blendedRate} an hour powered by twenty percent Onshore Solution Architects and eighty percent Offshore GDC factory execution, yielding a robust ${margin}% gross margin and board-level risk protection.`,
        topicTag: 'Financial Impact',
        highlight: true
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `And the single biggest reason the Steering Committee should sign off on this plan?`,
        topicTag: 'Final Verdict'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Because every single hour is tied deterministically to workstream deliverables, stage-gate testing, and realistic conversion mocks—not speculative spreadsheet estimates. It's ready to execute on Day One.`,
        topicTag: 'Steering Committee Sign-off',
        highlight: true
      }
    ];
  } else {
    // Full Program Deep Dive (Default)
    turns = [
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Welcome back to the Deep Dive. Today we are unpacking the complete Oracle Fusion Cloud transformation proposal for ${client}. And Jordan, what strikes me immediately is the sheer balance of this plan. We're looking at ${weeks} weeks on the critical path, ${hours.toLocaleString()} total defensible hours, and a peak concurrency of around ${fte} FTEs. Where do we start?`,
        topicTag: 'Program Introduction',
        highlight: true
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Let's start with the methodology. Too many enterprise programs fail because they treat cloud like on-premise custom ERP. This plan is built strictly on the Oracle True Cloud Method—TCM. That means we don't spend six months writing four-hundred-page functional specs. We stand up the cloud sandbox in Wave Zero, validate business processes against Modern Best Practice, and run rapid Conference Room Pilots.`,
        topicTag: 'True Cloud Method'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Right! But let's look at the scope footprint. The proposal covers ${modules.length} modules, including ${(modules.slice(0, 3)).join(', ')}, plus ${oic} OIC integration touchpoints and ${dataObjects} data migration objects. That's a serious enterprise footprint. How does the timeline avoid blowing out past ${weeks} weeks?`,
        topicTag: 'Scope Footprint'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `The secret is sub-phase concurrency. In our deterministic scheduling model, build sprints overlap cleanly with iterative data loading. While onshore architects are running CRP2 playbacks with business stakeholders, our offshore team in the Global Delivery Center is already pre-building OIC flows and running automated FBDI conversions. You don't serialize what can be run in parallel.`,
        topicTag: 'Concurrency & Pacing'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `Speaking of the offshore team—let's talk about the sourcing model. The plan commits to a strict two-tier architecture: ${onshorePct}% Onshore and ${offshorePct}% Offshore GDC. Some legacy stakeholders get nervous when they see eighty percent offshore. Why is this specific ratio the gold standard for Oracle Cloud?`,
        topicTag: '2-Tier Global Sourcing',
        highlight: true
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Because modern Oracle Cloud is modular and standardized. You don't need twenty developers sitting in the client's hallway writing custom code. You need high-caliber Principal Architects on-site to facilitate workshops, manage change, and steer governance. Meanwhile, your technical heavy lifting—reporting, integrations, regression test suites—runs twenty-four hours a day across the global timezones. It drives the master blended rate down to $${blendedRate} an hour while delivering a ${margin}% gross margin.`,
        topicTag: 'Economic Leverage'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `And what about testing and cutover? That's always where projects live or die. What are the guardrails in place?`,
        topicTag: 'Testing & Cutover'
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Two rigorous testing stages—SIT for technical and integration verification, followed by business-led UAT. And critically, ${mockCycles} full-volume mock conversion runs. Before the business ever logs into production, the cutover playbook has been rehearsed down to the minute.`,
        topicTag: 'Stage-Gate Assurance'
      },
      {
        speaker: 'Alex',
        speakerRole: 'Enterprise Strategist',
        text: `So to wrap up: A clear ${weeks}-week roadmap, mathematically justified hours, eighty percent offshore leverage delivering prime economics, and proven True Cloud Method governance. It's an airtight proposal. Jordan, thank you for breaking it down.`,
        topicTag: 'Closing Synthesis',
        highlight: true
      },
      {
        speaker: 'Jordan',
        speakerRole: 'Oracle Practice Lead',
        text: `Always a pleasure, Alex. When the math and methodology align, project success follows naturally.`,
        topicTag: 'Sign-off'
      }
    ];
  }

  // Calculate cumulative timestamps based on ~130 words per minute
  let accumulatedSeconds = 0;
  const dialogueWithTimestamps: PodcastTurn[] = turns.map((t, idx) => {
    const wordCount = t.text.split(/\s+/).length;
    const durationSeconds = Math.max(4, Math.round((wordCount / 135) * 60));
    
    const minutes = Math.floor(accumulatedSeconds / 60);
    const seconds = accumulatedSeconds % 60;
    const timestampStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    accumulatedSeconds += durationSeconds;

    return {
      id: `turn_${idx + 1}`,
      speaker: t.speaker,
      speakerRole: t.speakerRole,
      text: t.text,
      topicTag: t.topicTag,
      timestamp: timestampStr,
      highlight: t.highlight
    };
  });

  const totalMinutes = Math.max(2, Math.round(accumulatedSeconds / 60));

  return {
    id: `pod_local_${scenario.id}_${focus}_${accent}`,
    title,
    subtitle,
    focus,
    accent,
    createdAt: new Date().toISOString(),
    scenarioId: scenario.id,
    clientName: client,
    durationMinutes: totalMinutes,
    estimatedSeconds: accumulatedSeconds,
    summary,
    keyTakeaways,
    hosts: {
      host1: { name: host1Name, title: 'Enterprise Technology Strategist', avatarColor: 'blue', voiceType: 'female' },
      host2: { name: host2Name, title: isIndianAccent ? 'Oracle Practice Lead • India GDC COE' : 'Oracle Cloud Practice Lead', avatarColor: 'emerald', voiceType: 'male' }
    },
    dialogue: dialogueWithTimestamps
  };
}

/**
 * Client service to request podcast generation via server /api/gemini/podcast
 * with transparent fallback to local deterministic generation.
 */
export async function generateNotebookLMPodcast(
  scenario: ProjectScenario,
  data: CalculatedProjectData,
  focus: PodcastFocus = 'deep_dive',
  customPrompt?: string,
  accent: PodcastAccent = 'en-IN'
): Promise<{ episode: PodcastEpisode; isAiGenerated: boolean; error?: string }> {
  try {
    const response = await fetch('/api/gemini/podcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, data, focus, accent, customPrompt })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.episode && Array.isArray(result.episode.dialogue) && result.episode.dialogue.length > 0) {
        // Recalculate timestamps if missing
        let runningSeconds = 0;
        const dialogue = result.episode.dialogue.map((turn: PodcastTurn, idx: number) => {
          const wordCount = (turn.text || '').split(/\s+/).length;
          const turnDuration = Math.max(4, Math.round((wordCount / 135) * 60));
          const mins = Math.floor(runningSeconds / 60);
          const secs = runningSeconds % 60;
          const timestamp = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
          runningSeconds += turnDuration;
          return {
            ...turn,
            id: turn.id || `turn_${idx + 1}`,
            timestamp,
            speaker: turn.speaker === 'Jordan' ? 'Jordan' : 'Alex',
            speakerRole: turn.speakerRole || (turn.speaker === 'Jordan' ? 'Oracle Practice Lead' : 'Enterprise Strategist')
          };
        });

        result.episode.dialogue = dialogue;
        result.episode.estimatedSeconds = runningSeconds;
        result.episode.durationMinutes = Math.max(2, Math.round(runningSeconds / 60));
        result.episode.accent = accent;
        return { episode: result.episode, isAiGenerated: true };
      }
    }
  } catch (err: any) {
    console.warn('Network call to /api/gemini/podcast failed, activating deterministic generator', err);
  }

  // Deterministic fallback
  const fallbackEpisode = generateLocalPodcastEpisode(scenario, data, focus, customPrompt, accent);
  return { episode: fallbackEpisode, isAiGenerated: false };
}
