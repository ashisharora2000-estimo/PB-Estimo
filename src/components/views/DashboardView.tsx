import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  HelpCircle,
  Award,
  Presentation,
  ArrowRight,
  GitCompare,
  Calculator,
  Plus,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  BarChart3,
  Globe,
  Database,
  Briefcase,
  TrendingUp,
  Save,
  RotateCcw
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule } from '../../types';
import { COMPLEXITY_PILLARS, ORACLE_PATCH_COHORTS } from '../../data/oraclePhases';
import { ScheduleStaffingCapacityCard } from '../schedule/ScheduleStaffingCapacityCard';
import { NotebookLMPodcastCard } from '../podcast/NotebookLMPodcastCard';

interface DashboardViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onNavigateTab: (tab: any) => void;
  onOpenTraceMath?: (target?: OracleModule | 'project_total') => void;
  onOpenNewProposal?: () => void;
  onOpenWhatIfSimulator?: () => void;
  onOpenDealDefense?: () => void;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onSaveScenario?: () => void;
  onResetDefaults?: () => void;
  onOpenNotebookLmPodcast?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scenario,
  data,
  onNavigateTab,
  onOpenTraceMath,
  onOpenNewProposal,
  onOpenWhatIfSimulator,
  onOpenDealDefense,
  onUpdateScenario,
  onSaveScenario,
  onResetDefaults,
  onOpenNotebookLmPodcast
}) => {
  const [showStaffingModel, setShowStaffingModel] = useState(false);

  const handleAdjustWeeks = (delta: number) => {
    if (!onUpdateScenario) return;
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: Math.max(16, Math.min(104, (prev.projectWeeks || 32) + delta))
    }));
  };

  const handleSyncToRecommended = () => {
    if (!onUpdateScenario || !data.recommendedDurationWeeks) return;
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: data.recommendedDurationWeeks
    }));
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Scenario Meta */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white">
                {data.commercialModel}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {scenario.selectedModules.length} Fusion Modules Selected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {scenario.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {scenario.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSaveScenario && (
              <button
                onClick={onSaveScenario}
                className="px-3.5 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Save all changes to proposal and refresh data across all screens"
              >
                <Save size={14} />
                <span>Save & Refresh</span>
              </button>
            )}
            {onResetDefaults && (
              <button
                onClick={() => {
                  if (window.confirm('Reset this scenario back to standard baseline defaults?')) {
                    onResetDefaults();
                  }
                }}
                className="px-3 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                title="Reset to baseline numbers"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            )}
            {onOpenNewProposal && (
              <button
                onClick={onOpenNewProposal}
                className="px-3.5 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Create a new implementation proposal"
              >
                <Plus size={14} className="stroke-[2.5]" />
                <span>New Proposal</span>
              </button>
            )}
            {onOpenWhatIfSimulator && (
              <button
                onClick={onOpenWhatIfSimulator}
                className="px-3.5 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-amber-400"
                title="Open Live What-If Margin & Scope Trade-off Simulator"
              >
                <SlidersHorizontal size={14} className="stroke-[2.5]" />
                <span>What-If Simulator</span>
              </button>
            )}
            {onOpenDealDefense && (
              <button
                onClick={onOpenDealDefense}
                className="px-3.5 py-2 rounded-sm bg-indigo-950 hover:bg-indigo-900 active:bg-slate-950 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-700/50"
                title="Open Deal Defense & SteerCo Justification Hub"
              >
                <Award size={14} className="text-amber-300 stroke-[2.5]" />
                <span>Deal Defense</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('discovery')}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Tune Scope</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Gantt</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* NotebookLM Audio Overview Banner Card - Hidden for future release */}


      {/* KPI Cards Grid (Geometric Balance - Schedule & Efforts Focus) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Target Defensible Effort */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition">
          <div>
            <div className="flex items-center justify-between gap-2 text-slate-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">P80 Defensible Effort</span>
              {onOpenTraceMath ? (
                <button
                  type="button"
                  onClick={() => onOpenTraceMath('project_total')}
                  className="p-1.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition cursor-pointer flex items-center gap-1"
                  title="Click to Trace the Math Calculation"
                >
                  <Calculator size={14} />
                  <span className="text-[9px] font-bold uppercase">Trace</span>
                </button>
              ) : (
                <div className="p-1.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                  <Clock size={15} />
                </div>
              )}
            </div>
            {onOpenTraceMath ? (
              <button
                type="button"
                onClick={() => onOpenTraceMath('project_total')}
                className="text-left text-3xl font-mono font-bold text-slate-900 tracking-tight hover:text-amber-700 cursor-pointer block"
                title="Click to Trace the Math Calculation"
              >
                {(Math.round(data.targetHours || 0)).toLocaleString()}
                <span className="text-xs font-sans font-normal text-slate-400 ml-1">hrs</span>
              </button>
            ) : (
              <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">
                {(Math.round(data.targetHours || 0)).toLocaleString()}
                <span className="text-xs font-sans font-normal text-slate-400 ml-1">hrs</span>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Staffing Target (P50):</span>
            <span className="text-slate-800 font-mono font-bold">{(Math.round(data.p50_BaselineHours || 0)).toLocaleString()} hrs</span>
          </div>
        </div>

        {/* 2. Schedule Duration & Phasing */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-slate-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Schedule Duration</span>
              <div className="p-1.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                <Calendar size={15} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">
                {scenario.projectWeeks}
                <span className="text-xs font-sans font-normal text-slate-400 ml-1">weeks</span>
              </div>
              <span className="text-xs font-mono text-purple-700 font-semibold">
                ~{Math.round(scenario.projectWeeks / 4.33)} months
              </span>
            </div>

            {/* Quick Week Steppers */}
            {onUpdateScenario && (
              <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustWeeks(-4)}
                    className="px-1.5 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                    title="Decrease by 4 weeks"
                  >
                    -4w
                  </button>
                  <button
                    onClick={() => handleAdjustWeeks(-1)}
                    className="px-1.5 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                    title="Decrease by 1 week"
                  >
                    -1w
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustWeeks(1)}
                    className="px-1.5 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                    title="Increase by 1 week"
                  >
                    +1w
                  </button>
                  <button
                    onClick={() => handleAdjustWeeks(4)}
                    className="px-1.5 py-0.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                    title="Increase by 4 weeks"
                  >
                    +4w
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Staffing Capacity:</span>
            <span className="text-slate-800 font-mono font-bold">
              {Math.round(data.targetHours || 0).toLocaleString()}h / {(scenario.projectWeeks * 40)}h = {(data.targetHours / (scenario.projectWeeks * 40)).toFixed(1)} FTE
            </span>
          </div>
        </div>

        {/* 3. Staffing Footprint & Capacity */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-slate-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Staffing Footprint</span>
              <div className="p-1.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Users size={15} />
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">
              {(data.targetPersonMonths ?? (data.targetHours / 160) ?? 0).toFixed(1)}
              <span className="text-xs font-sans font-normal text-slate-400 ml-1">PM</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Average Team Size:</span>
            <span className="text-slate-800 font-mono font-bold">{(data.avgTotalFTE ?? data.totalFTE ?? (data.targetHours / ((scenario.projectWeeks || 32) * 40)) ?? 0).toFixed(1)} FTEs</span>
          </div>
        </div>

        {/* 4. Governance & DoA Tier */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-slate-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Governance & Risk</span>
              <div className="p-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                <ShieldCheck size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-mono font-bold ${data.doaColor}`}>
                Tier {data.doaTier}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                Score {data.weightedComplexityScore.toFixed(0)}/100
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Classification:</span>
            <span className="text-slate-800 font-mono font-bold truncate max-w-[130px]">{data.doaClassification}</span>
          </div>
        </div>
      </div>

      {/* Senior Delivery Lead Duration Sizing Methodology Banner */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-sm bg-amber-500/10 text-amber-700 border border-amber-500/20 shrink-0 mt-0.5">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-2 py-0.5 rounded-xs border border-amber-200">
                  Senior Delivery Lead Methodology
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Defensible Duration: {data.recommendedDurationWeeks} Weeks ({Math.round(data.recommendedDurationWeeks / 4.33)} Months)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Oracle TCM 4-Step Duration Sizing & Schedule Feasibility
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                Derives timeline scientifically from Base Lifecycle (22w floor) + Technical Integration & Conversion ({scenario.scaleDrivers.tech_oic || 0} OIC flows, {scenario.scaleDrivers.tech_conversion_cycles || 3} mock loads) + Multi-Wave Phasing ({scenario.rolloutWaves || 1}W) - Fast-Tracking concurrency ({scenario.scheduleModifiers?.fastTrackingOverlapPct || 15}%).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onUpdateScenario && scenario.projectWeeks !== data.recommendedDurationWeeks && (
              <button
                onClick={handleSyncToRecommended}
                className="px-3 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={`Sync active project timeline from ${scenario.projectWeeks}w to recommended ${data.recommendedDurationWeeks}w`}
              >
                <Zap size={13} />
                <span>Adopt {data.recommendedDurationWeeks} Wks</span>
              </button>
            )}

            <button
              onClick={() => setShowStaffingModel(!showStaffingModel)}
              className={`px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border ${
                showStaffingModel
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <Calculator size={13} />
              <span>{showStaffingModel ? 'Hide Staffing Model' : 'Staffing vs Schedule Math'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('schedule')}
              className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Explore 4-Step Sizing & Gantt</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 4-Step Quick Formula Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 font-mono text-center text-xs">
          <div className="p-2 rounded-xs bg-slate-50 border border-slate-200">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-sans">1. Base Scope Floor</span>
            <span className="font-bold text-slate-900">22 Wks</span>
          </div>
          <div className="p-2 rounded-xs bg-blue-50 border border-blue-200">
            <span className="text-[9px] uppercase tracking-wider text-blue-700 block font-sans">2. Tech & Data Drivers</span>
            <span className="font-bold text-blue-900">+{Math.max(1, Math.round(((scenario.scaleDrivers.tech_oic || 0) > 10 ? 3 : 1) + ((scenario.scaleDrivers.tech_conversion_cycles || 3) >= 4 ? 2 : 1)))} Wks</span>
          </div>
          <div className="p-2 rounded-xs bg-purple-50 border border-purple-200">
            <span className="text-[9px] uppercase tracking-wider text-purple-700 block font-sans">3. Wave Phasing</span>
            <span className="font-bold text-purple-900">+{scenario.rolloutWaves > 1 ? (scenario.rolloutWaves - 1) * 8 : 0} Wks</span>
          </div>
          <div className="p-2 rounded-xs bg-emerald-50 border border-emerald-200">
            <span className="text-[9px] uppercase tracking-wider text-emerald-700 block font-sans">4. Fast-Tracking</span>
            <span className="font-bold text-emerald-900">-{Math.round(data.recommendedDurationWeeks * ((scenario.scheduleModifiers?.fastTrackingOverlapPct || 15) / 100) * 0.3)} Wks</span>
          </div>
          <div className="p-2 rounded-xs bg-amber-100 border border-amber-300 col-span-2 sm:col-span-4 lg:col-span-1">
            <span className="text-[9px] uppercase tracking-wider text-amber-900 block font-sans font-bold">Recommended Duration</span>
            <span className="font-bold text-amber-950 text-sm">{data.recommendedDurationWeeks} Wks</span>
          </div>
        </div>
      </div>

      {/* Staffing vs Schedule Mathematical Engine (Toggled by Button or always viewable) */}
      {showStaffingModel && onUpdateScenario && (
        <ScheduleStaffingCapacityCard
          scenario={scenario}
          data={data}
          onUpdateScenario={onUpdateScenario}
        />
      )}

      {/* Oracle Pod Patching Advisory (Geometric Callout) */}
      <div className={`rounded-sm p-5 border shadow-xs ${
        data.patchConflictWeeks.length > 0
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-sm mt-0.5 ${
              data.patchConflictWeeks.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {data.patchConflictWeeks.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>Oracle Quarterly Pod Patching Advisory</span>
                <span className="px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold bg-white text-slate-800 border border-slate-200">
                  {ORACLE_PATCH_COHORTS[scenario.podCohort].name}
                </span>
              </div>
              {data.patchConflictWeeks.length > 0 ? (
                <p className="text-xs text-rose-900/90 mt-1 leading-relaxed">
                  <strong className="font-bold">Potential Release Collision:</strong> Quarterly maintenance cadence hits during sensitive SIT or Go-Live / Hypercare in project weeks:{' '}
                  <span className="font-mono font-bold text-rose-800 underline">
                    {data.patchConflictWeeks.join(', ')}
                  </span>
                  . Consider freezing non-prod pod patch updates or shifting the Go-Live cutover window.
                </p>
              ) : (
                <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
                  <strong>Optimal Release Alignment:</strong> No Oracle quarterly update maintenance windows conflict with SIT freeze, UAT sign-off, or Go-Live hypercare.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="px-3.5 py-1.5 rounded-sm bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 shrink-0 cursor-pointer"
          >
            Review Calendar
          </button>
        </div>
      </div>

      {/* Senior Leadership 5 Gaps Review Hub */}
      <div className="bg-slate-900 text-white rounded-sm p-5 border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-sm bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0 mt-0.5">
            <Award size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Senior Leadership Oversight Report
              </span>
              <span className="px-1.5 py-0.5 bg-white/10 text-slate-200 text-[10px] font-mono rounded-xs">
                5 Gaps Calibrated
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Feasibility & Risk Clearance: {data.leadershipGaps.executiveSummary.scheduleFeasibilityScore}/100 Score
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              CPM Critical Float ({data.leadershipGaps.criticalPath.zeroFloatActivitiesCount} Zero-Float) • 5 Pods ({data.leadershipGaps.environmentLandscape.totalP2TRefreshes} P2T Refreshes) • 72h Cutover (+{data.leadershipGaps.dataCutover.cutoverContingencyBufferHours}h Contingency) • Risk-Adjusted P80 Reserve (+{data.leadershipGaps.monteCarlo.recommendedReserveHours}h) • Peak Client SME Backfill (${(data.leadershipGaps.coStaffing.estimatedClientBackfillCost / 1000).toFixed(0)}k).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('leadership')}
            className="px-4 py-2.5 rounded-sm bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Presentation size={14} />
            <span>Open Leadership Deck</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Multi-Vendor & Multi-SI Ecosystem Delivery Status Card */}
      <div className="bg-white rounded-sm p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 shrink-0 mt-0.5">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-100 px-2 py-0.5 rounded-xs border border-blue-200">
                Multi-Party Scope Demarcation
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {data.multiVendor?.isEnabled
                  ? `Active Split: Our SI (${data.multiVendor.ourSiSharePercentage}%) • Other BI (${data.multiVendor.otherSiSharePercentage}%) • Client (${data.multiVendor.clientSharePercentage}%)`
                  : 'Turnkey Single SI Delivery (100% Our SI)'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>Delivery Ownership: {data.multiVendor?.isEnabled ? `${(data.multiVendor.ourSiTotalDefensibleHours).toLocaleString()} hrs Our SI Scope` : `${(data.targetHours || 0).toLocaleString()} hrs Turnkey Scope`}</span>
              {data.multiVendor?.isEnabled && (data.multiVendor?.ourSiHandshakeOverheadHours || 0) > 0 && (
                <span className="text-xs font-semibold text-amber-700 font-mono">
                  (+{data.multiVendor?.ourSiHandshakeOverheadHours}h Coordination Tax)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {data.multiVendor?.isEnabled
                ? `Demarcation active across ${scenario.selectedModules.length} modules. Client absorbs ${(data.multiVendor.clientInternalHours || 0).toLocaleString()} hrs; Other BI delivers ${(data.multiVendor.otherSiHours || 0).toLocaleString()} hrs.`
                : 'Project currently configured for 100% single-vendor execution. Switch to multi-vendor mode to assign HCM to a BI partner, client data cleansing, or 3rd-party IV&V.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('multivendor')}
          className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>Manage Multi-Vendor & BI</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Executive Delivery Complexity Footprint Cockpit (High Visibility Single-Screen Architecture) */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-slate-900 text-white shadow-xs">
              <Sliders size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
                  Delivery Complexity Footprint & Drag Diagnostics
                </h3>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold ${
                  data.weightedComplexityScore > 65
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : data.weightedComplexityScore > 40
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  Score {data.weightedComplexityScore.toFixed(0)}/100 • Tier {data.doaTier} ({data.doaClassification})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Executive radar scoring across 5 architectural pillars • Net multiplier drag: <strong className="font-mono text-slate-800">{((0.75 + Math.pow(data.weightedComplexityScore / 100, 1.35) * 1.10)).toFixed(2)}x</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('discovery')}
              className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title="Adjust scale sizing drivers, legal entities, and CEMLI footprint"
            >
              <Sliders size={13} />
              <span>Tune Drivers</span>
            </button>
            <button
              onClick={() => onNavigateTab('governance')}
              className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open full 20-question Complexity Studio"
            >
              <span>Complexity Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* 5-Pillar Executive Cockpit Cards (Horizontal 5-Col Grid in 1 Screen) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Pillar 1: Functional & ERP/SCM Process */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Briefcase size={12} className="text-blue-600" />
                  <span>Process Alignment</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                  (data.pillarScores['functional'] || 50) > 65
                    ? 'bg-rose-100 text-rose-700'
                    : (data.pillarScores['functional'] || 50) > 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {(data.pillarScores['functional'] || 50).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {(data.pillarScores['functional'] || 50) > 65
                  ? 'Heavy Custom / Multi-GAAP'
                  : (data.pillarScores['functional'] || 50) > 40
                  ? 'Moderate Custom Workflows'
                  : 'Standard MBP Vanilla'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {scenario.scaleDrivers.fin_ent || 1} Legal Entities, {scenario.scaleDrivers.fin_bu ?? 2} BUs, {scenario.scaleDrivers.fin_led || 1} Ledgers ({scenario.scaleDrivers.fin_secondary_ledgers ?? 0} Secondary)
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                <div
                  className={`h-full ${
                    (data.pillarScores['functional'] || 50) > 65 ? 'bg-rose-500' : (data.pillarScores['functional'] || 50) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, data.pillarScores['functional'] || 50))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                <span>Weight: 30%</span>
                <span>Drag: {((data.pillarScores['functional'] || 50) * 0.30).toFixed(1)} pts</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Technical & CEMLI Density */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Zap size={12} className="text-amber-600" />
                  <span>Technical & CEMLI</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                  (data.pillarScores['technical'] || 50) > 65
                    ? 'bg-rose-100 text-rose-700'
                    : (data.pillarScores['technical'] || 50) > 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {(data.pillarScores['technical'] || 50).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {scenario.scaleDrivers.tech_oic || 0} OIC / {scenario.scaleDrivers.tech_paas || 0} PaaS VBCS
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {(scenario.scaleDrivers.tech_reports_bip || 0) + (scenario.scaleDrivers.tech_reports_otbi || 0)} Reports • {scenario.scaleDrivers.tech_fast_formulas || 0} Fast Formulas • {scenario.scaleDrivers.tech_bpm_approval_groups ?? 3} BPM Matrices
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                <div
                  className={`h-full ${
                    (data.pillarScores['technical'] || 50) > 65 ? 'bg-rose-500' : (data.pillarScores['technical'] || 50) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, data.pillarScores['technical'] || 50))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                <span>Weight: 25%</span>
                <span>Drag: {((data.pillarScores['technical'] || 50) * 0.25).toFixed(1)} pts</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Data Migration & Cleansing Debt */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Database size={12} className="text-purple-600" />
                  <span>Data Migration</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                  (data.pillarScores['data'] || 50) > 65
                    ? 'bg-rose-100 text-rose-700'
                    : (data.pillarScores['data'] || 50) > 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {(data.pillarScores['data'] || 50).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {scenario.scaleDrivers.tech_data_objects || 12} Core FBDI/HDL Objects
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {scenario.scaleDrivers.tech_conversion_cycles ?? 3} Mock Dry Runs • {scenario.scaleDrivers.tech_historical_years ?? 1} Yrs History Depth
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                <div
                  className={`h-full ${
                    (data.pillarScores['data'] || 50) > 65 ? 'bg-rose-500' : (data.pillarScores['data'] || 50) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, data.pillarScores['data'] || 50))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                <span>Weight: 20%</span>
                <span>Drag: {((data.pillarScores['data'] || 50) * 0.20).toFixed(1)} pts</span>
              </div>
            </div>
          </div>

          {/* Pillar 4: OCM & Workforce Scaling */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Users size={12} className="text-emerald-600" />
                  <span>OCM & Workforce</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                  (data.pillarScores['ocm'] || 50) > 65
                    ? 'bg-rose-100 text-rose-700'
                    : (data.pillarScores['ocm'] || 50) > 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {(data.pillarScores['ocm'] || 50).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {(scenario.scaleDrivers.hcm_hc || 0).toLocaleString()} Headcount
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {scenario.scaleDrivers.hcm_pay_countries || 1} Payroll Countries • {scenario.scaleDrivers.hcm_union_groups || 0} CBAs / Union Bargaining Groups
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                <div
                  className={`h-full ${
                    (data.pillarScores['ocm'] || 50) > 65 ? 'bg-rose-500' : (data.pillarScores['ocm'] || 50) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, data.pillarScores['ocm'] || 50))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                <span>Weight: 15%</span>
                <span>Drag: {((data.pillarScores['ocm'] || 50) * 0.15).toFixed(1)} pts</span>
              </div>
            </div>
          </div>

          {/* Pillar 5: Governance & Rollout Dynamics */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-indigo-600" />
                  <span>Program Governance</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                  (data.pillarScores['governance'] || 50) > 65
                    ? 'bg-rose-100 text-rose-700'
                    : (data.pillarScores['governance'] || 50) > 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {(data.pillarScores['governance'] || 50).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {scenario.rolloutApproach === 'big_bang'
                  ? 'Big Bang Execution'
                  : `${scenario.rolloutWaves || 2} Implementation Waves (${(scenario.rolloutApproach || 'phased_functional').replace('_', ' ')})`}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {(scenario.scheduleModifiers?.methodology || 'hybrid_oum').replace('_', ' ').toUpperCase()} • SLA: {(scenario.scheduleModifiers?.clientDecisionSLA || 'standard_5d').replace('_', ' ')}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                <div
                  className={`h-full ${
                    (data.pillarScores['governance'] || 50) > 65 ? 'bg-rose-500' : (data.pillarScores['governance'] || 50) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, data.pillarScores['governance'] || 50))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                <span>Weight: 10%</span>
                <span>Drag: {((data.pillarScores['governance'] || 50) * 0.10).toFixed(1)} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compound Multiplier & Delivery Drag Visualizer Bar (Single Row Executive Math) */}
        <div className="bg-slate-900 text-white p-3.5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xs bg-slate-800 text-amber-400 border border-slate-700">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Compounded Effort Build-up (Base Scope → P80 Target)
              </div>
              <div className="text-xs text-slate-200 font-medium mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Base Baseline: <strong className="font-mono text-white">{Math.round(data.targetHours / (0.75 + Math.pow(data.weightedComplexityScore / 100, 1.35) * 1.10)).toLocaleString()} hrs</strong></span>
                <span className="text-slate-500">•</span>
                <span>Complexity Multiplier: <strong className="font-mono text-amber-400">{((0.75 + Math.pow(data.weightedComplexityScore / 100, 1.35) * 1.10)).toFixed(2)}x</strong></span>
                <span className="text-slate-500">•</span>
                <span>Delivery Buffer: <strong className="font-mono text-emerald-400">P80 Contingency Included</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Defensible Delivery</div>
              <div className="text-lg font-mono font-bold text-white">
                {(Math.round(data.targetHours || 0)).toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">hrs</span>
              </div>
            </div>
            {onOpenTraceMath && (
              <button
                type="button"
                onClick={() => onOpenTraceMath('project_total')}
                className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                title="View step-by-step mathematical breakdown"
              >
                <Calculator size={13} />
                <span>Audit Math</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Lifecycle Phase Effort Breakdown & Sourcing */}
      <div className="grid grid-cols-1 gap-6">
        {/* Implementation Phase Hours Distribution */}
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Lifecycle Phase Effort Breakdown</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Effort consumption profile across 6 implementation phases</p>
            </div>
            <button
              onClick={() => onNavigateTab('estimation')}
              className="text-xs text-slate-900 hover:text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>WBS Matrix</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {data.phaseHours.map((ph) => {
              const pct = data.targetHours > 0 ? (ph.hours / data.targetHours) * 100 : 0;
              return (
                <div key={ph.id} className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 shrink-0 rounded-none" style={{ backgroundColor: ph.color }} />
                      <span className="font-bold text-slate-900 truncate">{ph.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">W{ph.startWeek}-W{ph.endWeek}</span>
                  </div>
                  {/* Geometric Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 border border-slate-200 rounded-none overflow-hidden">
                    <div
                      className="h-full rounded-none transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: ph.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 font-mono">
                    <span className="text-slate-500">Defensible Effort:</span>
                    <span className="font-bold text-slate-900">{(Math.round(ph.hours || 0)).toLocaleString()} hrs ({pct.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Mix Breakdown Snapshot */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Delivery Sourcing Model:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-none" /> Onshore: <strong className="font-mono text-slate-900">{scenario.deliveryMix.onshore}%</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-none" /> Offshore: <strong className="font-mono text-slate-900">{scenario.deliveryMix.offshore}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Identified High-Priority Risks Card */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Key Program Risk Mitigations</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Automated risk radar based on physical drivers & complexity responses</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('governance')}
            className="text-xs text-slate-900 hover:text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <span>Full Risk Log</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.identifiedRisks.slice(0, 4).map((risk, i) => (
            <div key={i} className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">{risk.title}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                  risk.severity === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {risk.severity}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold">Mitigation:</strong> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
