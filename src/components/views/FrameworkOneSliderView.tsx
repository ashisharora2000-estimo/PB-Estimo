import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Cpu,
  Calendar,
  DollarSign,
  ShieldCheck,
  GitCompare,
  FileCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  Headphones,
  Sliders,
  Award,
  Zap,
  Users,
  Globe,
  Radio
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, NavTabId } from '../../types';
import { askOracleAiAdvisor } from '../../utils/aiService';

interface FrameworkOneSliderViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onNavigateTab?: (tab: NavTabId) => void;
  onNavigateStep?: (tab: NavTabId) => void;
}

interface ScriptSection {
  id: string;
  title: string;
  subtitle: string;
  pillarNum: string;
  narrationText: string;
  keyBullets: string[];
  icon: React.ElementType;
  badge: string;
  colorClass: string;
  bgLight: string;
}

const FRAMEWORK_SECTIONS: ScriptSection[] = [
  {
    id: 'sec_methodology',
    title: 'Oracle True Cloud Method (TCM) & OUM 7-Phase Protocol',
    subtitle: 'Stage-Gate Delivery Lifecycle',
    pillarNum: '01',
    badge: 'Core Lifecycle',
    colorClass: 'text-indigo-600 border-indigo-200 bg-indigo-50/50',
    bgLight: 'bg-indigo-500',
    icon: Layers,
    keyBullets: [
      '7 Sequential & Concurrency-enabled Phases: Enablement, Design, Build, Test 1 (SIT), Test 2 (UAT), Cutover, Hypercare',
      'Mandatory 2-week Client Enablement & Cloud Sandbox provisioning baseline',
      'Stage-gate milestone readiness gates (CRP1, CRP2, SIT sign-off, Go-Live authorization)'
    ],
    narrationText: 'Pillar one defines the delivery lifecycle. Our tool is anchored on the Oracle True Cloud Method and Oracle Unified Method Cloud protocol. It models a rigorous seven-phase stage-gate progression, beginning with a mandatory two-week client enablement, followed by iterative enterprise design, build sprints, System Integration Testing, User Acceptance Testing, dry-run cutover, and post-go-live hypercare.'
  },
  {
    id: 'sec_scoping',
    title: '20-Question Functional Depth & Multi-Pillar Scoping Engine',
    subtitle: 'ERP, SCM, HCM, EPM & CX Scope Matrix',
    pillarNum: '02',
    badge: 'Functional Sizing',
    colorClass: 'text-blue-600 border-blue-200 bg-blue-50/50',
    bgLight: 'bg-blue-500',
    icon: Cpu,
    keyBullets: [
      'Granular 20-question functional depth questionnaire per Oracle Cloud module',
      'Multi-pillar coverage across Financials, Procurement, SCM, HCM, EPM FCCS/EPBCS, and CX',
      'Dynamically scales base hours and complexity multipliers based on operational complexity'
    ],
    narrationText: 'Pillar two is the functional scoping depth engine. Rather than relying on high-level estimates, the framework evaluates projects through a twenty-question granular assessment across every selected Oracle Cloud module. This captures complex sub-processes such as intercompany eliminations, discrete manufacturing, multi-country payroll, and financial close automation.'
  },
  {
    id: 'sec_rollout',
    title: '12-Dimensional Multi-Wave Rollout & Regional Localization',
    subtitle: 'Global Architecture Phasing',
    pillarNum: '03',
    badge: 'Rollout Strategy',
    colorClass: 'text-emerald-600 border-emerald-200 bg-emerald-50/50',
    bgLight: 'bg-emerald-500',
    icon: Globe,
    keyBullets: [
      '12-Dimensional assessment covering Global Templates, Coexistence, and Statutory Localizations',
      'Supports Big-Bang, Phased-by-Geography, Phased-by-Function, and Pilot Rollouts',
      'Models wave overlap friction and inter-wave hypercare transition concurrency'
    ],
    narrationText: 'Pillar three governs enterprise rollout architecture. It assesses twelve distinct operational dimensions, including global core template design, legacy system coexistence, statutory tax compliance like e-invoicing and SAF-T, and multi-wave release scheduling with controlled wave overlaps.'
  },
  {
    id: 'sec_cemli',
    title: 'Physical CEMLI & Scale Driver Volumetric Modeler',
    subtitle: 'RICEFW & Technical Expansion',
    pillarNum: '04',
    badge: 'Technical Scale',
    colorClass: 'text-purple-600 border-purple-200 bg-purple-50/50',
    bgLight: 'bg-purple-500',
    icon: Sliders,
    keyBullets: [
      'Physical volumetric inputs: OIC interfaces, PaaS apps, Data migration objects, BIP & OTBI reports',
      'Headcount, legal entities, ledgers, operating plants, warehouses, and tax regimes',
      'Non-linear logarithmic and parametric effort curves calibrated to Tier-1 SI delivery rates'
    ],
    narrationText: 'Pillar four models technical CEMLI scale. The engine accepts direct volumetric parameters for Oracle Integration Cloud interfaces, custom PaaS visual builder extensions, data migration conversion objects, Fast Formulas, and complex BIP reports, converting physical volumes into defensible engineering hours.'
  },
  {
    id: 'sec_friction',
    title: '7 Strategic Client Friction & Co-Delivery Modifiers',
    subtitle: 'Behavioral & Readiness Calibration',
    pillarNum: '05',
    badge: 'Behavioral Risks',
    colorClass: 'text-amber-600 border-amber-200 bg-amber-50/50',
    bgLight: 'bg-amber-500',
    icon: ShieldCheck,
    keyBullets: [
      '7 Calibrated Modifiers: Data Debt, SME Dedication, Change Resistance, Cloud Mindset, Integration Volatility, Statutory Compliance, Decision SLA',
      'Calculates Net Client Risk Multiplier to prevent fixed-price delivery overruns',
      'Identifies the 5 critical leadership gaps between client expectations and delivery realities'
    ],
    narrationText: 'Pillar five measures client organizational friction. By evaluating seven strategic modifiers—such as legacy data quality debt, dedicated SME availability, SteerCo decision latency, and customization resistance—the tool applies a calibrated risk multiplier to protect delivery margins.'
  },
  {
    id: 'sec_schedule',
    title: 'Quarterly Pod Patching & Blackout Conflict Analyzer',
    subtitle: 'Cohort A/B/C vs Testing Freezes',
    pillarNum: '06',
    badge: 'Cloud Schedule',
    colorClass: 'text-cyan-600 border-cyan-200 bg-cyan-50/50',
    bgLight: 'bg-cyan-500',
    icon: Calendar,
    keyBullets: [
      'Automatic detection of Oracle quarterly update cycles (Cohorts A, B, C) across pods',
      'Cross-checks patch maintenance windows against SIT, UAT, Year-End, and Cutover blackouts',
      'Configurable 0% to 35% fast-track phase concurrency with schedule compression limits'
    ],
    narrationText: 'Pillar six provides schedule intelligence. Oracle Cloud environments receive mandatory quarterly updates. Our scheduler maps these updates across Cohorts A, B, and C, instantly flagging collisions where an Oracle patch would disrupt critical UAT or Go-Live cutover blackout windows.'
  },
  {
    id: 'sec_commercials',
    title: 'Global Delivery Pyramid & Governance Gates',
    subtitle: 'Staffing Pyramid & DoA Sign-Off',
    pillarNum: '07',
    badge: 'Staffing & Governance',
    colorClass: 'text-rose-600 border-rose-200 bg-rose-50/50',
    bgLight: 'bg-rose-500',
    icon: Users,
    keyBullets: [
      'Onshore, Nearshore, and Offshore delivery mix modeling with calibrated role ratios',
      'FTE peak load management and role-level staffing distribution',
      'Automated Delegation of Authority (DoA) escalation classification (Tier 1, Tier 2 VP, Tier 3 Deal Board)'
    ],
    narrationText: 'Pillar seven powers the delivery staffing and governance engine. It calibrates the global staffing pyramid across onshore, nearshore, and offshore resources, calculating required peak FTEs, role ratios, and assigning the required corporate Delegation of Authority governance approval tier.'
  }
];

export const FrameworkOneSliderView: React.FC<FrameworkOneSliderViewProps> = ({
  scenario,
  data,
  onNavigateTab,
  onNavigateStep
}) => {
  const handleNav = (tab: NavTabId) => {
    if (onNavigateTab) onNavigateTab(tab);
    else if (onNavigateStep) onNavigateStep(tab);
  };
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US');
  const [scriptMode, setScriptMode] = useState<'full' | 'elevator' | 'tech'>('full');
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Handle Play/Stop speech
  const speakSection = (index: number) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    if (index >= FRAMEWORK_SECTIONS.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSectionIndex(0);
      return;
    }

    setActiveSectionIndex(index);
    const section = FRAMEWORK_SECTIONS[index];
    
    let textToSpeak = '';
    if (index === 0) {
      textToSpeak = `Welcome to the Oracle Cloud Enterprise Transformation Delivery and Estimation Framework. Here is our architectural walkthrough. ${section.narrationText}`;
    } else {
      textToSpeak = section.narrationText;
    }

    if (scriptMode === 'elevator') {
      textToSpeak = `${section.title}: ${section.keyBullets[0]}.`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Find suitable English voice
    const voices = synthRef.current.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith(selectedVoice)) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (engVoice) {
      utterance.voice = engVoice;
    }

    utterance.onend = () => {
      if (index + 1 < FRAMEWORK_SECTIONS.length) {
        speakSection(index + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSectionIndex(0);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      speakSection(activeSectionIndex);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSectionIndex(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      // Re-trigger current section with new speed
      speakSection(activeSectionIndex);
    }
  };

  const handleCopyScript = () => {
    const fullScript = `# ORACLE CLOUD ENTERPRISE TRANSFORMATION FRAMEWORK (OC-ETDEF)
**Executive Presentation & Architectural Methodology Reference**

${FRAMEWORK_SECTIONS.map((sec, idx) => `## Pillar ${sec.pillarNum}: ${sec.title}
*${sec.subtitle}*

${sec.narrationText}

**Key Methodological Safeguards:**
${sec.keyBullets.map(b => `- ${b}`).join('\n')}
`).join('\n---\n\n')}`;

    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAskAiForExecutivePitch = async () => {
    setAiLoading(true);
    try {
      const res = await askOracleAiAdvisor(
        `Generate a 3-minute high-impact executive Steering Committee (SteerCo) boardroom presentation script explaining the Oracle True Cloud Method (TCM) estimation framework we used for project "${scenario.name}".
Key Metrics: ${(data.targetHours || 0).toLocaleString()} target hours, ${data.recommendedDurationWeeks} weeks duration, ${(data.targetPersonMonths ?? (data.targetHours / 160) ?? 0).toFixed(1)} Person-Months (${(data.avgTotalFTE ?? data.totalFTE ?? 0).toFixed(1)} avg FTEs), DoA Tier ${data.doaTier}.
Structure into: 1. Executive Summary, 2. Methodological Rigor (TCM + CEMLI), 3. Risk Mitigation & Governance, 4. Recommendation for Board Sign-Off.`
      );
      setAiAnalysis(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. MASTER HERO SLIDER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-lg p-6 sm:p-8 shadow-md border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                Executive One-Slider
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Oracle TCM + OUM Standard
              </span>
              <span className="px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                8 Integrated Pillars
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Oracle Cloud Enterprise Transformation Delivery & Estimation Framework
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              A comprehensive, mathematically calibrated delivery and pricing architecture integrating 
              <strong> 7-Phase TCM Stage-Gates</strong>, <strong>20-Question Depth Sizing</strong>, 
              <strong> 12-Dimensional Rollout Models</strong>, <strong>Pod Patching Intelligence</strong>, 
              and <strong>Governance & DoA Tier Safeguards</strong>.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-end justify-start sm:justify-end gap-3 shrink-0">
            <button
              onClick={handleCopyScript}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Script Copied!' : 'Copy Narration Script'}
            </button>
            <button
              onClick={handleAskAiForExecutivePitch}
              disabled={aiLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {aiLoading ? 'Synthesizing...' : 'AI SteerCo Pitch Generator'}
            </button>
          </div>
        </div>

        {/* 2. AUDIO SPEAKER CONTROL BAR */}
        <div className="mt-6 pt-5 border-t border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-md border border-slate-800">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-transform active:scale-95 ${
                isPlaying && !isPaused
                  ? 'bg-amber-600 hover:bg-amber-500 ring-4 ring-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 ring-4 ring-indigo-500/20'
              }`}
              title={isPlaying && !isPaused ? 'Pause Audio Speaker' : 'Play English Audio Speaker'}
            >
              {isPlaying && !isPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Stop/Reset */}
            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-slate-700 transition-colors"
              title="Stop & Reset Audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speaker Status & Visualizer */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                  English Audio Speaker
                </span>
                {isPlaying && !isPaused && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Narrating Pillar {FRAMEWORK_SECTIONS[activeSectionIndex].pillarNum}
                  </span>
                )}
                {isPaused && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-700">
                    Paused
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {isPlaying
                  ? FRAMEWORK_SECTIONS[activeSectionIndex].title
                  : 'Press Play to hear the executive audio narration of all 8 framework pillars'}
              </p>
            </div>
          </div>

          {/* Speed & Accent Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            {/* Playback Mode */}
            <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setScriptMode('full')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  scriptMode === 'full' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive (3m)
              </button>
              <button
                onClick={() => setScriptMode('elevator')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  scriptMode === 'elevator' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Elevator (1m)
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-xs">
              {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-1 rounded transition-colors ${
                    playbackSpeed === speed ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Voice Accent */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="en-US">US English</option>
              <option value="en-GB">UK English</option>
              <option value="en-AU">AU English</option>
              <option value="en-IN">IN English</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. AI EXECUTIVE PITCH OVERLAY (If Generated) */}
      {aiAnalysis && (
        <div className="bg-white border border-indigo-200 rounded-lg p-6 shadow-sm space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Executive SteerCo Boardroom Presentation Pitch
            </div>
            <button
              onClick={() => setAiAnalysis(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100 font-sans">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* 4. THE 8 FRAMEWORK PILLARS (BENTO GRID ARCHITECTURE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Methodology Architecture: The 8 Delivery Pillars
          </h2>
          <span className="text-xs text-slate-500">
            Click any pillar card to play its dedicated audio narration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FRAMEWORK_SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            const isCurrentlyPlaying = isPlaying && activeSectionIndex === idx;

            return (
              <div
                key={section.id}
                onClick={() => speakSection(idx)}
                className={`cursor-pointer rounded-lg border transition-all duration-200 p-5 flex flex-col justify-between relative group ${
                  isCurrentlyPlaying
                    ? 'bg-indigo-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                {/* Header Badge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      PILLAR {section.pillarNum}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {section.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-md ${isCurrentlyPlaying ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'} transition-colors`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {section.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {section.keyBullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Audio Trigger */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-semibold flex items-center gap-1.5 ${isCurrentlyPlaying ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`}>
                    {isCurrentlyPlaying ? (
                      <>
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        Speaking Now...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Listen to Pillar {section.pillarNum}
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    TCM Standard
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SUMMARY SPECIFICATION & LIVE METRIC PROFILES */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Project Estimation Telemetry ({scenario.name})
            </h3>
            <p className="text-xs text-slate-500">
              Real-time calibration output from the 7-Pillar Framework
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav('discovery')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold flex items-center gap-1.5"
            >
              Scoping Wizard <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleNav('estimation')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              Estimation Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Program Effort</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {(data.targetHours || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
            <span className="text-[10px] text-slate-500">P80 Defensible Quote</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Critical Path Duration</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {data.recommendedDurationWeeks} <span className="text-xs font-normal text-slate-500">wks</span>
            </div>
            <span className="text-[10px] text-slate-500">7-Phase Stage-Gate</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Staffing Footprint</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {(data.targetPersonMonths ?? (data.targetHours / 160) ?? 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">PM</span>
            </div>
            <span className="text-[10px] text-slate-500">Total Person-Months</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Average Team Size</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {(data.avgTotalFTE ?? data.totalFTE ?? (data.targetHours / ((scenario.projectWeeks || 32) * 40)) ?? 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">FTE</span>
            </div>
            <span className="text-[10px] text-slate-500">Peak {(data.totalFTE || 0).toFixed(1)} FTEs</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Governance Gate</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              Tier {data.doaTier}
            </div>
            <span className="text-[10px] text-slate-500">{data.doaClassification}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Rollout Strategy</span>
            <div className="text-sm font-bold text-slate-900 truncate mt-1">
              {scenario.rolloutApproach === 'big_bang' ? 'Big-Bang' : `${scenario.rolloutWaves}-Wave Phased`}
            </div>
            <span className="text-[10px] text-slate-500">Cohort {scenario.podCohort} Pods</span>
          </div>
        </div>
      </div>
    </div>
  );
};
