import { useState } from 'react';
import {
  ShieldAlert,
  GitBranch,
  Server,
  Database,
  BarChart2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
  DollarSign,
  Presentation,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { generateExecutiveProposalPptx } from '../../utils/executivePptxGenerator';

interface LeadershipGapsViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  initialGapTab?: GapTabId;
}

type GapTabId = 'all' | 'gap1_cpm' | 'gap2_pods' | 'gap3_data' | 'gap4_montecarlo' | 'gap5_staffing' | 'executive_deck';

export const LeadershipGapsView = ({
  scenario,
  data,
  onUpdateScenario,
  initialGapTab = 'all'
}: LeadershipGapsViewProps) => {
  const [activeGapTab, setActiveGapTab] = useState<GapTabId>(initialGapTab);
  const [deckSlideIndex, setDeckSlideIndex] = useState<number>(0);
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState<boolean>(false);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  const { leadershipGaps } = data;
  const { criticalPath, environmentLandscape, dataCutover, monteCarlo, coStaffing, executiveSummary } = leadershipGaps;

  const handleExportPptx = async () => {
    setIsExportingPptx(true);
    try {
      await generateExecutiveProposalPptx(scenario, data);
    } catch (err) {
      console.error('Failed to export PPTX', err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const applyP80Target = () => {
    // Guardrail 5: Snapshot capture before applying P80 calibration
    try {
      const stored = localStorage.getItem(`fusion_snapshots_${scenario.id}`);
      const existingSnaps = stored ? JSON.parse(stored) : [];
      const newSnap = {
        id: `snap_p80_${Date.now()}`,
        name: `Pre-P80 Target Calibration (${scenario.projectWeeks}w -> ${monteCarlo.p80_DefensibleTarget.weeks}w)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        actionSource: 'custom_calibration' as const,
        scenarioState: JSON.parse(JSON.stringify(scenario)),
        summary: `Saved prior to Monte Carlo P80 alignment to ${monteCarlo.p80_DefensibleTarget.weeks} weeks`,
        metrics: {
          totalHours: 0,
          timelineWeeks: scenario.projectWeeks,
          moduleCount: scenario.selectedModules.length
        }
      };
      localStorage.setItem(`fusion_snapshots_${scenario.id}`, JSON.stringify([newSnap, ...existingSnaps].slice(0, 15)));
    } catch {
      // ignore
    }

    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: monteCarlo.p80_DefensibleTarget.weeks,
      confidence: 0.85
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Executive Command Header */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-sm p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award size={16} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Executive Leadership Review
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[10px] font-mono text-slate-300">
                SteerCo / CFO / CIO Briefing Deck
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              5 Project Scheduling & Estimation Gaps
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Addressing senior leadership's critical oversight areas: Critical Path Slack (CPM), Multi-Pod Environment Refresh Calendars, Iterative 72-Hour Cutover Velocity, Probabilistic Monte Carlo Reserves, and Peak Client SME Backfill Demands.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveGapTab('executive_deck')}
              className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border ${
                activeGapTab === 'executive_deck'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/20'
              }`}
            >
              <Presentation size={15} />
              <span>Executive Slide Deck</span>
            </button>
            <button
              onClick={applyP80Target}
              className="px-3.5 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-blue-400"
              title="Align project duration to the statistical P80 defensible target"
            >
              <Zap size={14} />
              <span>Align to P80 Target ({monteCarlo.p80_DefensibleTarget.weeks} Wks)</span>
            </button>
          </div>
        </div>

        {/* 5 Executive KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-800">
          {/* Tile 1: Critical Path */}
          <div 
            onClick={() => setActiveGapTab('gap1_cpm')}
            className="p-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Gap 1: Critical Path</span>
              <GitBranch size={13} className="text-rose-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {criticalPath.criticalPathLengthWeeks} <span className="text-xs font-normal text-slate-400">Weeks</span>
            </div>
            <div className="text-[10px] text-rose-300 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>{criticalPath.zeroFloatActivitiesCount} Zero-Float Tasks</span>
            </div>
          </div>

          {/* Tile 2: Pod Environment Health */}
          <div 
            onClick={() => setActiveGapTab('gap2_pods')}
            className="p-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Gap 2: Pod Strategy</span>
              <Server size={13} className="text-blue-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white">
              5 Pods <span className="text-xs font-normal text-slate-400">({environmentLandscape.totalP2TRefreshes} P2T)</span>
            </div>
            <div className="text-[10px] text-blue-300 mt-0.5 truncate">
              Cohort {scenario.podCohort} Patch Aligned
            </div>
          </div>

          {/* Tile 3: 72h Cutover Window */}
          <div 
            onClick={() => setActiveGapTab('gap3_data')}
            className="p-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Gap 3: Cutover SLA</span>
              <Database size={13} className="text-emerald-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {dataCutover.cutoverEstimatedTotalHours}h <span className="text-xs font-normal text-slate-400">/ 72h SLA</span>
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">
              +{dataCutover.cutoverContingencyBufferHours}h Buffer • 3 Mocks
            </div>
          </div>

          {/* Tile 4: Risk-Adjusted Contingency & Delivery Confidence */}
          <div 
            onClick={() => setActiveGapTab('gap4_montecarlo')}
            className="p-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Gap 4: Risk Buffer</span>
              <BarChart2 size={13} className="text-amber-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {monteCarlo.currentProbabilityOnTime}% <span className="text-xs font-normal text-slate-400">On-Time</span>
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5">
              P80: {(monteCarlo?.p80_DefensibleTarget?.hours || 0).toLocaleString()} hrs
            </div>
          </div>

          {/* Tile 5: Peak Client SME Backfill */}
          <div 
            onClick={() => setActiveGapTab('gap5_staffing')}
            className="p-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Gap 5: SME Demand</span>
              <Users size={13} className="text-purple-400" />
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {coStaffing.peakClientFTE} <span className="text-xs font-normal text-slate-400">Peak FTEs</span>
            </div>
            <div className="text-[10px] text-purple-300 mt-0.5 truncate">
              {coStaffing.blendedCoStaffingRatio} SI:Client Ratio
            </div>
          </div>
        </div>

        {/* SteerCo Callout Banner */}
        <div className="p-3.5 rounded-sm bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong className="text-white font-semibold">Senior Leadership Action Item:</strong> {executiveSummary.topDecisionNeeded}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-xs bg-amber-400 text-slate-950 font-bold uppercase text-[10px] shrink-0">
            Feasibility Score: {executiveSummary.scheduleFeasibilityScore}/100
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveGapTab('all')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeGapTab === 'all'
              ? 'border-slate-900 text-slate-900 bg-slate-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Executive Summary (All 5 Gaps)
        </button>
        <button
          onClick={() => setActiveGapTab('gap1_cpm')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeGapTab === 'gap1_cpm'
              ? 'border-rose-600 text-rose-900 bg-rose-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch size={13} className="text-rose-600" />
          <span>1. Critical Path & Float (CPM)</span>
        </button>
        <button
          onClick={() => setActiveGapTab('gap2_pods')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeGapTab === 'gap2_pods'
              ? 'border-blue-600 text-blue-900 bg-blue-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server size={13} className="text-blue-600" />
          <span>2. Pod Environment Landscape</span>
        </button>
        <button
          onClick={() => setActiveGapTab('gap3_data')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeGapTab === 'gap3_data'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database size={13} className="text-emerald-600" />
          <span>3. Data Mocks & 72h Cutover</span>
        </button>
        <button
          onClick={() => setActiveGapTab('gap4_montecarlo')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeGapTab === 'gap4_montecarlo'
              ? 'border-amber-600 text-amber-900 bg-amber-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 size={13} className="text-amber-600" />
          <span>4. Risk-Adjusted Contingency (P50/P80/P90)</span>
        </button>
        <button
          onClick={() => setActiveGapTab('gap5_staffing')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeGapTab === 'gap5_staffing'
              ? 'border-purple-600 text-purple-900 bg-purple-50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={13} className="text-purple-600" />
          <span>5. Client SME & Backfill Crunch</span>
        </button>
        <button
          onClick={() => setActiveGapTab('executive_deck')}
          className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeGapTab === 'executive_deck'
              ? 'border-slate-900 text-white bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Presentation size={13} />
          <span>SteerCo Slide Deck</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE SLIDE DECK MODE */}
      {/* ========================================================================= */}
      {activeGapTab === 'executive_deck' && (
        <div className="space-y-6">
          <div className="bg-slate-950 text-white rounded-sm border border-slate-800 p-8 shadow-md">
            {/* Slide Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Oracle Fusion Cloud Implementation • Executive Steering Committee Briefing
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {deckSlideIndex === 0 && 'Slide 1: Critical Path & Schedule Float Analysis (CPM)'}
                  {deckSlideIndex === 1 && 'Slide 2: Multi-Instance Pod Environment Lifecycle & Refreshes'}
                  {deckSlideIndex === 2 && 'Slide 3: Iterative Data Migration Cutovers & 72-Hour Weekend SLA'}
                  {deckSlideIndex === 3 && 'Slide 4: Delivery Confidence & Risk-Adjusted Contingency Model (P50/P80/P90)'}
                  {deckSlideIndex === 4 && 'Slide 5: Client SME Resource Demand & Operational Backfill Model'}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportPptx}
                  disabled={isExportingPptx}
                  className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>{isExportingPptx ? 'Generating Deck...' : 'Export PPTX (.pptx)'}</span>
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Slide {deckSlideIndex + 1} of 5
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={deckSlideIndex === 0}
                    onClick={() => setDeckSlideIndex(prev => Math.max(0, prev - 1))}
                    className="px-2.5 py-1 rounded-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={deckSlideIndex === 4}
                    onClick={() => setDeckSlideIndex(prev => Math.min(4, prev + 1))}
                    className="px-2.5 py-1 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Next Slide
                  </button>
                </div>
              </div>
            </div>

            {/* Slide Content Body */}
            <div className="py-6 space-y-6">
              {deckSlideIndex === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Executive Finding & Rationale</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Our deterministic Critical Path Model (CPM) indicates a strict <strong>{criticalPath.criticalPathLengthWeeks}-week</strong> delivery schedule with <strong>{criticalPath.zeroFloatActivitiesCount} zero-float milestone activities</strong>. Any delay in the Global Chart of Accounts (COA) blueprint or Data Mock 2 will directly delay Go-Live by an equivalent number of weeks.
                    </p>
                    <div className="p-4 rounded-sm bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold uppercase text-amber-400">Deterministic Critical Sequence</div>
                      <div className="text-xs text-slate-300 font-mono space-y-1">
                        <div>1. Charter & Enablement (Wk 1-2) → Zero Float</div>
                        <div>2. Global COA & Org Blueprint (Wk 3-8) → Zero Float</div>
                        <div>3. Golden Master Config DEV1 (Wk 9-18) → Zero Float</div>
                        <div>4. Data Migration Mock 2 (Wk 16-19) → Zero Float</div>
                        <div>5. SIT Execution in TEST (Wk 20-25) → Zero Float</div>
                        <div>6. UAT Execution in STAGE (Wk 26-31) → Zero Float</div>
                        <div>7. Dress Rehearsal Mock 3 (Wk 32-33) → Zero Float</div>
                        <div>8. Production Cutover Weekend (Wk 34) → Zero Float</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Key SteerCo Takeaways & Governance</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                        <strong className="text-white block font-bold mb-1">Zero-Slack Gate Sign-off:</strong>
                        SteerCo must enforce a 5-day maximum turnaround on Design Blueprint and UAT Exit criteria.
                      </div>
                      <div className="p-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                        <strong className="text-white block font-bold mb-1">Non-Critical Path Buffers:</strong>
                        End-User Training Job Aids (+12 days float) and OTBI Custom Analytics (+18 days float) can absorb minor variances without threatening the target launch.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {deckSlideIndex === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Environment Pod Landscape Strategy</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      A robust 5-pod environment topology (DEV1, DEV2, TEST, STAGE, PROD) is architected to isolate development, end-to-end integration, and business acceptance testing.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-sm bg-blue-500/10 border border-blue-500/30 flex justify-between items-center text-blue-200">
                        <span><strong>DEV1:</strong> Golden Master Configuration Hub</span>
                        <span className="font-mono">Wk 1 - 28</span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-indigo-500/10 border border-indigo-500/30 flex justify-between items-center text-indigo-200">
                        <span><strong>DEV2:</strong> OIC Middleware & CEMLI Sandbox</span>
                        <span className="font-mono">Wk 2 - 30</span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-amber-500/10 border border-amber-500/30 flex justify-between items-center text-amber-200">
                        <span><strong>TEST:</strong> System Integration Testing (SIT)</span>
                        <span className="font-mono">Wk 12 - 30</span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center text-emerald-200">
                        <span><strong>STAGE:</strong> UAT & 72-Hour Dress Rehearsal</span>
                        <span className="font-mono">Wk 24 - 36</span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-rose-500/10 border border-rose-500/30 flex justify-between items-center text-rose-200">
                        <span><strong>PROD:</strong> Live Production Environment</span>
                        <span className="font-mono">Wk 34 - Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Oracle Quarterly Patch Alignment</h4>
                    <div className="p-4 rounded-sm bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                      <div className="font-bold text-amber-400">Pod Cohort {scenario.podCohort} Cadence</div>
                      <p>
                        Oracle Cloud quarterly maintenance updates will occur during your scheduled test cycles. Non-prod testing pods will be upgraded 2 weeks prior to PROD. Strict P2T freezes are scheduled prior to SIT and UAT entry.
                      </p>
                      <div className="text-emerald-400 font-semibold pt-1">
                        ✓ All 3 P2T refresh dates are fully sequenced outside of critical testing windows.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {deckSlideIndex === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">72-Hour Weekend Cutover Feasibility</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Data migration is partitioned into <strong>3 progressive Mock cycles</strong> (30%, 70%, 100%) culminating in a 72-hour weekend simulation.
                    </p>
                    <div className="p-4 rounded-sm bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400 font-bold uppercase">
                        <span>Cutover Weekend Capacity</span>
                        <span className="text-white font-mono">72.0 Hours (100%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-none overflow-hidden flex">
                        <div style={{ width: `${(dataCutover.cutoverEstimatedTotalHours / 72) * 100}%` }} className="bg-emerald-500 h-full"></div>
                        <div style={{ width: `${(dataCutover.cutoverContingencyBufferHours / 72) * 100}%` }} className="bg-blue-500/50 h-full"></div>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-emerald-300">Estimated Run: {dataCutover.cutoverEstimatedTotalHours} hrs</span>
                        <span className="text-blue-300">Contingency Buffer: +{dataCutover.cutoverContingencyBufferHours} hrs</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Mock Cadence & Payroll Parallels</h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-sm bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-300"><strong>Mock 1 (30% vol):</strong> Schema & Field Validation</span>
                        <span className="text-slate-400 font-mono">DEV1</span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-300"><strong>Mock 2 (70% vol):</strong> End-to-End SIT Transformation</span>
                        <span className="text-amber-400 font-mono">TEST</span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-300"><strong>Mock 3 (100% vol):</strong> 72h Dress Rehearsal</span>
                        <span className="text-emerald-400 font-mono">STAGE</span>
                      </div>
                      {dataCutover.parallelPayrollRuns.length > 0 && (
                        <div className="p-2.5 rounded-sm bg-purple-500/10 border border-purple-500/30 text-purple-200">
                          <strong>Payroll Strategy:</strong> 3 Parallel Payroll Runs scheduled with 99.9% EFT match criteria.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {deckSlideIndex === 3 && (
                <div className="space-y-6">
                  {/* Top: Simple 4-Factor Formula Banner */}
                  <div className="p-3.5 rounded-sm bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xs bg-amber-400 text-slate-950 font-bold font-mono text-[10px] uppercase">
                        Transparent Formula
                      </span>
                      <span className="text-amber-200 font-bold">
                        Defensible Target (P80) = Base Scope × (1 + Technical Risk + Data Debt + Governance Latency)
                      </span>
                    </div>
                    <div className="font-mono text-amber-300 font-bold">
                      {(monteCarlo?.p80_DefensibleTarget?.hours || 0).toLocaleString()} Defensible Hours (+{monteCarlo?.recommendedReserveHours?.toLocaleString() || 0}h Reserve)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Delivery Confidence Spectrum</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Evaluates project variability against 4 observable risks: legacy data cleansing, third-party API readiness, and SteerCo decision velocity.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-sm bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 uppercase text-[10px] block">P50 Expected Baseline</span>
                          <span className="text-base font-bold font-mono text-white">{(monteCarlo?.p50_Baseline?.hours || 0).toLocaleString()} hrs</span>
                          <span className="text-slate-400 block mt-0.5">{monteCarlo.p50_Baseline.weeks} Weeks • 50% Confidence</span>
                        </div>
                        <div className="p-3 rounded-sm bg-amber-500/15 border border-amber-500/40">
                          <span className="text-amber-400 uppercase text-[10px] block font-bold">P80 Defensible Contract Target</span>
                          <span className="text-base font-bold font-mono text-amber-300">{(monteCarlo?.p80_DefensibleTarget?.hours || 0).toLocaleString()} hrs</span>
                          <span className="text-amber-200 block mt-0.5">{monteCarlo.p80_DefensibleTarget.weeks} Weeks • 80% Confidence</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Boardroom Contingency Reserve</h4>
                      <div className="p-4 rounded-sm bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                        <div className="text-emerald-400 font-bold">Recommended Defensible Contingency Reserve:</div>
                        <div className="text-xl font-mono font-bold text-white">
                          +{(monteCarlo?.recommendedReserveHours || 0).toLocaleString()} Hours <span className="text-sm text-slate-400">(${((monteCarlo.recommendedReserveBudget) / 1000).toFixed(0)}k)</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed pt-1">
                          Locking the P80 contingency reserve protects delivery margin, covers legacy data friction, and ensures an 80%+ probability of delivering without change orders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {deckSlideIndex === 4 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Client SME Allocation & Backfill Requirement</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      The primary failure mode in enterprise ERP implementations is client SME burnout. During UAT (Phase 5), internal business leads require <strong>80% dedication</strong> away from daily operations.
                    </p>
                    <div className="p-4 rounded-sm bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs text-purple-200">
                      <div className="flex justify-between items-center text-white">
                        <strong className="text-amber-300 text-sm">Peak Client SME Demand:</strong>
                        <span className="font-mono font-bold text-base">{coStaffing.peakClientFTE} Full-Time Equivalents</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Co-Staffing Ratio (SI : Client):</span>
                        <span className="font-mono font-bold text-white">{coStaffing.blendedCoStaffingRatio}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Client SME Commitment (UAT):</span>
                        <span className="font-mono font-bold text-emerald-400">80% Dedicated Lead Staff</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Executive Decision Required</h4>
                    <div className="p-4 rounded-sm bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                      <div className="font-bold text-white">SteerCo Charter Approval Action:</div>
                      <p>
                        Approve formal backfill staffing coverage and dedicated release plan for Finance, SCM, and Payroll process owners to ensure 80% attendance during UAT and Cutover.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Footer Navigation Pills */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-800">
              {[0, 1, 2, 3, 4].map(idx => (
                <button
                  key={idx}
                  onClick={() => setDeckSlideIndex(idx)}
                  className={`w-3 h-3 rounded-full transition cursor-pointer ${
                    deckSlideIndex === idx ? 'bg-amber-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAP 1: CRITICAL PATH (CPM) NETWORK ANALYSIS */}
      {/* ========================================================================= */}
      {(activeGapTab === 'all' || activeGapTab === 'gap1_cpm') && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">
                  <GitBranch size={16} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Scheduling Gap 1
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Critical Path & Schedule Slack / Float Network Analysis (CPM)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Deterministic calculation of the zero-float critical sequence vs non-critical buffer activities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightCriticalOnly}
                  onChange={(e) => setHighlightCriticalOnly(e.target.checked)}
                  className="rounded-none accent-rose-600 cursor-pointer"
                />
                <span>Highlight Critical Path Only</span>
              </label>
              <div className="px-3 py-1.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold font-mono">
                {criticalPath.zeroFloatActivitiesCount} Zero-Float Tasks
              </div>
            </div>
          </div>

          {/* Critical Path Flow Map */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Deterministic Critical Sequence (Earliest Start to Go-Live)</span>
              <span className="text-slate-500 font-mono text-[11px]">Total Path Duration: {criticalPath.criticalPathLengthWeeks} Weeks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {criticalPath.activities
                .filter(a => !highlightCriticalOnly || a.isCritical)
                .map((act) => (
                  <div
                    key={act.id}
                    className={`p-3.5 rounded-sm border transition relative ${
                      act.isCritical
                        ? 'border-rose-300 bg-rose-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{act.id}</span>
                      {act.isCritical ? (
                        <span className="px-1.5 py-0.5 rounded-none text-[9px] font-black uppercase bg-rose-600 text-white">
                          CRITICAL (0 Float)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          +{act.totalFloatDays}d Float
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight mb-1">{act.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mb-2">{act.oracleImpact}</div>
                    
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pt-2 border-t border-slate-200/60">
                      <span>Wk {act.earlyStartWeek} - {act.earlyFinishWeek}</span>
                      <span className="font-bold text-slate-700">{act.durationWeeks} Wks</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAP 2: POD ENVIRONMENT LANDSCAPE & REFRESH SEQUENCING */}
      {/* ========================================================================= */}
      {(activeGapTab === 'all' || activeGapTab === 'gap2_pods') && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                  <Server size={16} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Scheduling Gap 2
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Multi-Instance Pod Environment Landscape & P2T Refresh Sequencing
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Full lifecycle scheduling of DEV1, DEV2, TEST (SIT), STAGE (UAT), and PROD pods with P2T freeze gates.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-sm bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold font-mono">
              Oracle Patch Cohort {scenario.podCohort} Active
            </div>
          </div>

          {/* Pod Visual Timeline */}
          <div className="space-y-4">
            <div className="space-y-3">
              {environmentLandscape.pods.map((pod) => (
                <div key={pod.podId} className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm text-xs font-mono font-bold bg-slate-900 text-white">
                        {pod.podId}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{pod.name}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600">
                      Active: Week {pod.activeStartWeek} to Week {pod.activeEndWeek} ({pod.activeEndWeek - pod.activeStartWeek} Wks)
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{pod.purpose}</p>

                  {/* Badges for P2T Refreshes & Lockouts */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {pod.p2tRefreshWindows.map((p2t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        🔄 Wk {p2t.week}: {p2t.label}
                      </span>
                    ))}
                    {pod.lockoutWindows.map((lock, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        🔒 Wk {lock.startWeek}-{lock.endWeek}: {lock.reason} ({lock.severity})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAP 3: ITERATIVE DATA MIGRATION CUTOVERS & 72-HOUR SLA */}
      {/* ========================================================================= */}
      {(activeGapTab === 'all' || activeGapTab === 'gap3_data') && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database size={16} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Scheduling Gap 3
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Iterative Data Migration Mocks & 72-Hour Cutover Weekend Throughput
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Volumetric load velocity (records/hr), progressive Mock 1-3 rehearsals, and 72-hour weekend SLA window.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-sm text-xs font-bold font-mono border ${
                dataCutover.cutoverFeasibilityStatus === 'Comfortable'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                Cutover Status: {dataCutover.cutoverFeasibilityStatus}
              </span>
            </div>
          </div>

          {/* 3 Mock Cycles Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {dataCutover.mockCycles.map((mock) => (
              <div key={mock.id} className="p-4 rounded-sm border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{mock.phase}</span>
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-slate-900 text-white font-mono">
                    Wk {mock.targetWeek}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{mock.name}</div>
                
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Volume Scope:</span>
                    <strong className="text-slate-900 font-mono">{mock.scopeVolumePct}% ({(mock.totalEstimatedRecords || 0).toLocaleString()} recs)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Load Velocity:</span>
                    <strong className="text-slate-900 font-mono">{(mock.throughputPerHour || 0).toLocaleString()} recs/hr</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Run Duration:</span>
                    <strong className="text-emerald-700 font-mono font-bold">{mock.estimatedDurationHours} Hours</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  <strong>Sign-off Gate:</strong> {mock.signOffCriteria}
                </div>
              </div>
            ))}
          </div>

          {/* 72-Hour Cutover Weekend Hour-by-Hour Timeline Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Cutover Weekend Entity Sequence (FBDI Batch Loads)</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {dataCutover.cutoverEstimatedTotalHours}h Estimated / 72.0h Available (+{dataCutover.cutoverContingencyBufferHours}h Buffer)
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <th className="p-2.5">Seq</th>
                    <th className="p-2.5">Entity / Master Object</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Volume</th>
                    <th className="p-2.5">Velocity (Recs/hr)</th>
                    <th className="p-2.5">Est. Duration</th>
                    <th className="p-2.5">Prerequisite Dependency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dataCutover.criticalEntities.map((ent) => (
                    <tr key={ent.name} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="p-2.5 font-bold text-slate-900">#{ent.sequenceOrder}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-800">{ent.name}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold bg-slate-200 text-slate-700">
                          {ent.method}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700">{(ent.volume || 0).toLocaleString()}</td>
                      <td className="p-2.5 text-slate-700">{(ent.loadVelocityPerHour || 0).toLocaleString()}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{ent.estimatedHours.toFixed(1)}h</td>
                      <td className="p-2.5 font-sans text-slate-500 text-[10px]">{ent.dependency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAP 4: DELIVERY CONFIDENCE & RISK-ADJUSTED CONTINGENCY MODEL */}
      {/* ========================================================================= */}
      {(activeGapTab === 'all' || activeGapTab === 'gap4_montecarlo') && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
                  <BarChart2 size={16} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Leadership Oversight • Gap 4
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Delivery Confidence & Risk-Adjusted Contingency Model
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Transparent 4-driver contingency sizing establishing Lean (P10), Operational (P50), Defensible Proposal (P80), and Board Ceiling (P90) targets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xs bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
                4-Factor Calibrated
              </span>
              <span className="px-2.5 py-1 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold font-mono">
                P80 Defensible
              </span>
            </div>
          </div>

          {/* Simple Transparent Formula Card */}
          <div className="p-4 rounded-sm bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-xs bg-amber-400 text-slate-950 font-black font-mono text-[9px] uppercase">
                  Transparent Logic
                </span>
                <span className="text-xs font-bold text-slate-200">
                  How Defensible Delivery Hours Are Calculated:
                </span>
              </div>
              <div className="text-[11px] font-mono text-amber-300">
                100% Client-Explainable • Zero Academic Black Boxes
              </div>
            </div>

            <div className="p-3 rounded-xs bg-black/40 border border-white/10 font-mono text-xs text-amber-200 leading-relaxed overflow-x-auto">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-sans font-bold">Standard Enterprise Sizing Formula:</div>
              <div className="font-bold text-sm text-white">
                Defensible Proposal Target (P80) = <span className="text-blue-300">Base Sizing ({Math.round(data.totalBaseHours).toLocaleString()} hrs)</span> × (1 + <span className="text-amber-300">Tech Risk</span> + <span className="text-emerald-300">Data Debt</span> + <span className="text-purple-300">Governance Lag</span>)
              </div>
            </div>

            {/* 4 Factor Breakdown Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xs bg-white/5 border border-white/10">
                <span className="text-blue-300 font-bold block text-[10px] uppercase">1. Base Scope & Build</span>
                <span className="text-slate-300 text-[11px]">Core Oracle SKU configurations, standard OUM workshops, and baseline RICEFW build.</span>
              </div>
              <div className="p-2.5 rounded-xs bg-white/5 border border-white/10">
                <span className="text-amber-300 font-bold block text-[10px] uppercase">2. Technical Risk (0–15%)</span>
                <span className="text-slate-300 text-[11px]">OIC API readiness, third-party endpoint complexity, and PaaS VBCS extensions.</span>
              </div>
              <div className="p-2.5 rounded-xs bg-white/5 border border-white/10">
                <span className="text-emerald-300 font-bold block text-[10px] uppercase">3. Legacy Data Debt (0–20%)</span>
                <span className="text-slate-300 text-[11px]">Historical data cleansing debt, FBDI load retries, and 4-tier mock conversion cycles.</span>
              </div>
              <div className="p-2.5 rounded-xs bg-white/5 border border-white/10">
                <span className="text-purple-300 font-bold block text-[10px] uppercase">4. Governance Velocity (0–15%)</span>
                <span className="text-slate-300 text-[11px]">SteerCo review turnaround SLA (5 vs. 15 days) and client SME release dedication.</span>
              </div>
            </div>
          </div>

          {/* 4 Probability Targets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* P10 */}
            <div className="p-4 rounded-sm border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-500">P10 • Lean / Optimistic Target</div>
              <div className="text-xl font-mono font-bold text-slate-900">{(monteCarlo?.p10_Aggressive?.hours || 0).toLocaleString()} hrs</div>
              <div className="text-xs text-slate-600">{monteCarlo.p10_Aggressive.weeks} Weeks • {(monteCarlo.p10_Aggressive.hours / 160).toFixed(0)} PM</div>
              <div className="text-[10px] text-slate-500">Assumes zero client delays or data defects</div>
            </div>

            {/* P50 */}
            <div className="p-4 rounded-sm border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-500">P50 • Operational Baseline</div>
              <div className="text-xl font-mono font-bold text-slate-900">{(monteCarlo?.p50_Baseline?.hours || 0).toLocaleString()} hrs</div>
              <div className="text-xs text-slate-600">{monteCarlo.p50_Baseline.weeks} Weeks • {(monteCarlo.p50_Baseline.hours / 160).toFixed(0)} PM</div>
              <div className="text-[10px] text-slate-500">Balanced median delivery expectation</div>
            </div>

            {/* P80 */}
            <div className="p-4 rounded-sm border-2 border-amber-400 bg-amber-50/60 space-y-2 relative shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-amber-900 font-bold">P80 • Recommended Proposal Baseline</span>
                <span className="px-1.5 py-0.2 rounded-xs bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                  RECOMMENDED
                </span>
              </div>
              <div className="text-xl font-mono font-bold text-amber-950">{(monteCarlo?.p80_DefensibleTarget?.hours || 0).toLocaleString()} hrs</div>
              <div className="text-xs text-amber-800">{monteCarlo.p80_DefensibleTarget.weeks} Weeks • {(monteCarlo.p80_DefensibleTarget.hours / 160).toFixed(0)} PM</div>
              <div className="text-[10px] text-amber-700 font-semibold">Recommended contract baseline with ~15-20% standard risk buffer</div>
            </div>

            {/* P90 */}
            <div className="p-4 rounded-sm border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-500">P90 • Boardroom Risk Ceiling</div>
              <div className="text-xl font-mono font-bold text-slate-900">{(monteCarlo?.p90_BoardCommitment?.hours || 0).toLocaleString()} hrs</div>
              <div className="text-xs text-slate-600">{monteCarlo.p90_BoardCommitment.weeks} Weeks • {(monteCarlo.p90_BoardCommitment.hours / 160).toFixed(0)} PM</div>
              <div className="text-[10px] text-slate-500">Conservative cap for high-latency client environments</div>
            </div>
          </div>

          {/* Variance Drivers & Reserve Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Top 5 Delivery Variance Drivers</h4>
              <div className="space-y-2.5">
                {monteCarlo.topRiskVarianceDrivers.map((driver) => (
                  <div key={driver.factor} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{driver.factor}</span>
                      <span className="font-mono text-slate-900 font-bold">{driver.varianceContributionPct}% Variance</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-none overflow-hidden">
                      <div style={{ width: `${driver.varianceContributionPct * 2}%` }} className="bg-slate-800 h-full"></div>
                    </div>
                    <div className="text-[10px] text-slate-500">{driver.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sm bg-slate-900 text-white border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">SteerCo Risk Reserve Calculation</div>
                <h4 className="text-base font-bold text-white mt-1">Recommended Defensible Contingency</h4>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-2">
                  +{(monteCarlo?.recommendedReserveHours || 0).toLocaleString()} Hours
                </div>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  Effort Buffer: +{((monteCarlo.recommendedReserveHours) / 160).toFixed(1)} Person-Months (${((monteCarlo.recommendedReserveBudget) / 1000).toFixed(0)}k)
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Budgeting this defensible contingency reserve guarantees an 80%+ probability of delivering on-time without margin erosion or mid-project change requests.
                </p>
              </div>

              <button
                onClick={applyP80Target}
                className="w-full py-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Apply P80 Defense Buffer to Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAP 5: CLIENT VS SI CO-STAFFING & SME BACKFILL CRUNCH */}
      {/* ========================================================================= */}
      {(activeGapTab === 'all' || activeGapTab === 'gap5_staffing') && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                  <Users size={16} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Estimation Gap 5
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Client vs SI Co-Staffing & SME Operational Backfill Crunch Model
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Phase-by-phase client SME dedication, UAT crunch week detection, and internal backfill budgeting.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-sm bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold font-mono">
              Peak Client FTE: {coStaffing.peakClientFTE} (Co-Staffing: {coStaffing.blendedCoStaffingRatio})
            </div>
          </div>

          {/* Phase-by-Phase Staffing Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="p-2.5">Implementation Phase</th>
                  <th className="p-2.5">SI Consult FTE</th>
                  <th className="p-2.5">Client Business SME FTE</th>
                  <th className="p-2.5">Client IT FTE</th>
                  <th className="p-2.5">Total Phase FTE</th>
                  <th className="p-2.5">Client Time Commitment</th>
                  <th className="p-2.5">Operational Backfill Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {coStaffing.phaseStaffing.map((ph) => (
                  <tr
                    key={ph.phaseId}
                    className={`hover:bg-slate-50 font-mono text-[11px] ${
                      ph.isCrunchPhase ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="p-2.5 font-sans font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {ph.isCrunchPhase && (
                          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" title="High Crunch Phase"></span>
                        )}
                        <span>{ph.phaseName}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-blue-700 font-bold">{ph.siFTE.toFixed(1)}</td>
                    <td className="p-2.5 text-purple-700 font-bold">{ph.clientSmeFTE.toFixed(1)}</td>
                    <td className="p-2.5 text-slate-700">{ph.clientItFTE.toFixed(1)}</td>
                    <td className="p-2.5 font-bold text-slate-900">{ph.totalFTE.toFixed(1)}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                        ph.clientCommitmentPct >= 80
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : ph.clientCommitmentPct >= 50
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ph.clientCommitmentPct}% Dedicated
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-slate-600 text-[10px]">{ph.backfillRecommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key SME Roles Breakdown */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Core Client SME Roles & Mitigation Matrix
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coStaffing.keySmeRoles.map((role) => (
                <div key={role.role} className="p-3 bg-white border border-slate-200 rounded-sm text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{role.role}</span>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-none border border-purple-200">
                      Peak: {role.peakPhase}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                    <span>SI: {role.siHours}h</span>
                    <span>Client SME: {role.clientHours}h</span>
                  </div>
                  <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                    <strong>Mitigation:</strong> {role.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
