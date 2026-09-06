import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert,
  Zap,
  Sliders,
  GitBranch,
  Server,
  Database,
  Award,
  BarChart3,
  Cpu,
  FileText,
  RotateCcw,
  TrendingDown,
  Calculator,
  Users,
  Save
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, PodCohort } from '../../types';
import { ORACLE_PATCH_COHORTS, PROJECT_MILESTONES } from '../../data/oraclePhases';
import { ScheduleFeasibilityCard } from '../schedule/ScheduleFeasibilityCard';
import { DeliveryLeadMethodologyPanel } from '../schedule/DeliveryLeadMethodologyPanel';
import { PhaseSequencingOverridesPanel } from '../schedule/PhaseSequencingOverridesPanel';
import { ScheduleModifiersPanel } from '../schedule/ScheduleModifiersPanel';
import { SteerCoDefenseModal } from '../schedule/SteerCoDefenseModal';
import { EnvironmentLandscapeSwimlane } from '../schedule/EnvironmentLandscapeSwimlane';
import { SmartsheetExportModal } from '../governance/SmartsheetExportModal';
import { ScheduleStaffingCapacityCard } from '../schedule/ScheduleStaffingCapacityCard';

interface ScheduleGanttViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenComplexityStudio?: (tab?: 'complexity' | 'questions' | 'drivers' | 'ai_advisor') => void;
  onSaveScenario?: () => void;
}

export const ScheduleGanttView: React.FC<ScheduleGanttViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onOpenComplexityStudio,
  onSaveScenario
}) => {
  const [zoomScale, setZoomScale] = useState<'weeks' | 'months'>('weeks');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'capacity' | 'environments' | 'methodology' | 'sequencing' | 'modifiers'>('roadmap');
  const [showSteerCoModal, setShowSteerCoModal] = useState<boolean>(false);
  const [showSmartsheetModal, setShowSmartsheetModal] = useState<boolean>(false);

  const sf = data.scheduleFeasibility;

  const updateWeeks = (weeks: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: Math.max(20, Math.min(104, weeks))
    }));
  };

  const updateStartDate = (dateStr: string) => {
    onUpdateScenario(prev => ({
      ...prev,
      targetStartDate: dateStr
    }));
  };

  const updatePodCohort = (cohort: PodCohort) => {
    onUpdateScenario(prev => ({
      ...prev,
      podCohort: cohort
    }));
  };

  const applyRecommendedDuration = () => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: data.recommendedDurationWeeks
    }));
  };

  const totalWeeks = scenario.projectWeeks;
  const weekList = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const patchMonths = ORACLE_PATCH_COHORTS[scenario.podCohort].months;
  const startDateObj = new Date(scenario.targetStartDate || '2026-09-01');

  const getWeekDate = (w: number) => {
    return new Date(startDateObj.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
  };

  const isPatchMonthWeek = (w: number) => {
    const d = getWeekDate(w);
    return patchMonths.includes(d.getMonth());
  };

  const isConflictWeek = (w: number) => data.patchConflictWeeks.includes(w);

  // Check if a week falls into any client blackout period
  const getWeekBlackout = (w: number) => {
    const weekStart = getWeekDate(w);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    return (scenario.blackoutPeriods || []).find(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return weekStart <= bEnd && weekEnd >= bStart;
    });
  };

  // Filtered workstreams
  const filteredWorkstreams = data.workstreamHours.filter(ws => {
    if (selectedTrackFilter === 'all') return true;
    return ws.category.toLowerCase() === selectedTrackFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Senior Delivery Lead Executive Duration Sizing & Feasibility Header */}
      <ScheduleFeasibilityCard
        scenario={scenario}
        data={data}
        onUpdateScenario={onUpdateScenario}
      />

      {/* 2. Streamlined Navigation Sub-Tabs (Clean 4 Core Modules) */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 overflow-x-auto">
          {/* Tab 1: Gantt Roadmap */}
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'roadmap'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <CalendarDays size={14} />
            <span>Interactive Gantt Roadmap</span>
          </button>

          {/* Tab 2: Staffing vs Schedule Math */}
          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'capacity'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calculator size={14} className={activeTab === 'capacity' ? 'text-indigo-600' : 'text-indigo-500'} />
            <span>Staffing vs Schedule Math</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full font-bold">
              {(data.targetHours / (scenario.projectWeeks * 40)).toFixed(1)} FTE
            </span>
          </button>

          {/* Tab 3: Environment & Pod Strategy */}
          <button
            onClick={() => setActiveTab('environments')}
            className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'environments'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Server size={14} className={activeTab === 'environments' ? 'text-blue-600' : 'text-blue-500'} />
            <span>Environment & Pod Strategy</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              (data.environmentStrategy?.patchConflictCount || 0) > 0
                ? 'bg-amber-100 text-amber-900'
                : 'bg-emerald-100 text-emerald-900'
            }`}>
              {(data.environmentStrategy?.patchConflictCount || 0) > 0
                ? `${data.environmentStrategy?.patchConflictCount} Patch Conflicts`
                : '5-Tier Pods'}
            </span>
          </button>

          {/* Tab 3: Delivery Lead Methodology & Defense */}
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'methodology'
                ? 'bg-slate-900 text-white shadow-xs border border-slate-900'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Award size={14} className={activeTab === 'methodology' ? 'text-amber-400' : 'text-amber-600'} />
            <span>Duration Methodology & SteerCo Defense</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'methodology' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
            }`}>
              {data.recommendedDurationWeeks} Wks Sizing
            </span>
          </button>

          {/* Tab 4: Phase Sequencing */}
          <button
            onClick={() => setActiveTab('sequencing')}
            className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'sequencing'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <GitBranch size={14} />
            <span>Phase Sequencing & Overrides</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full font-bold">
              {scenario.phaseDeliveryModel === 'hypercare_overlap'
                ? 'Hypercare Overlap'
                : scenario.phaseDeliveryModel === 'fast_tracked_parallel'
                ? 'Parallel Streams'
                : Object.keys(scenario.phaseOverrides || {}).length > 0
                ? `${Object.keys(scenario.phaseOverrides || {}).length} Overrides`
                : 'Sequential'}
            </span>
          </button>

          {/* Tab 5: Modifiers & Blackouts */}
          <button
            onClick={() => setActiveTab('modifiers')}
            className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'modifiers'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>Velocity Modifiers & Risks</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full font-bold">
              {data.scheduleFeasibility.velocityMultiplier.toFixed(2)}x
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSaveScenario && (
            <button
              onClick={onSaveScenario}
              className="px-3.5 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
              title="Save all changes to proposal and refresh data across all screens"
            >
              <Save size={13} />
              <span>Save & Refresh All Screens</span>
            </button>
          )}

          {/* Smartsheet Direct Trigger Button */}
          <button
            onClick={() => setShowSmartsheetModal(true)}
            className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 ${
              scenario.isScheduleFrozen
                ? 'bg-gradient-to-r from-[#002A54] to-[#0073EA] hover:from-[#001D3D] hover:to-[#004A8F] text-white shadow-md'
                : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300'
            }`}
          >
            <Sparkles size={13} className={scenario.isScheduleFrozen ? 'text-sky-300 animate-pulse' : 'text-[#0073EA]'} />
            <span>Trigger Smartsheet Plan</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              scenario.isScheduleFrozen
                ? 'bg-emerald-400 text-emerald-950'
                : 'bg-amber-200 text-amber-950'
            }`}>
              {scenario.isScheduleFrozen ? 'LOCKED' : 'FREEZE REQ'}
            </span>
          </button>

          {/* SteerCo Defense Quick Launcher */}
          <button
            onClick={() => setShowSteerCoModal(true)}
            className="px-3.5 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
          >
            <FileText size={13} className="text-amber-400" />
            <span>SteerCo Executive Defense</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 0: Staffing vs Schedule Mathematical Engine */}
      {activeTab === 'capacity' && (
        <ScheduleStaffingCapacityCard
          scenario={scenario}
          data={data}
          onUpdateScenario={onUpdateScenario}
        />
      )}

      {/* Sub-Tab 1: Environment & Pod Strategy Panel */}
      {activeTab === 'environments' && (
        <EnvironmentLandscapeSwimlane
          scenario={scenario}
          data={data}
          onUpdateScenario={onUpdateScenario}
        />
      )}

      {/* Sub-Tab 1: Senior Delivery Lead Duration Methodology & Defense */}
      {activeTab === 'methodology' && (
        <DeliveryLeadMethodologyPanel
          scenario={scenario}
          data={data}
          onUpdateScenario={onUpdateScenario}
        />
      )}

      {/* Sub-Tab 2: Phase Sequencing & Overrides Panel */}
      {activeTab === 'sequencing' && (
        <PhaseSequencingOverridesPanel
          scenario={scenario}
          data={data}
          onUpdateScenario={onUpdateScenario}
        />
      )}

      {/* Sub-Tab 3: Modifiers Panel */}
      {activeTab === 'modifiers' && (
        <ScheduleModifiersPanel
          scenario={scenario}
          data={data}
          onUpdateScenario={onUpdateScenario}
        />
      )}

      {/* Sub-Tab 4: Primary Gantt Roadmap View */}
      {activeTab === 'roadmap' && (
        <>
          {/* Header & Controls */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                    <CalendarDays size={16} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Oracle True Cloud Method Roadmap & Lifecycle
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Enterprise Schedule, Lifecycle Gates & Blackout Alignment
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Mandatory 2-week Client Enablement phase, followed by Enterprise Design, Build, Business Test 1 (SIT), Business Test 2 (UAT), Cutover & Go-Live, and Hypercare. Automated blackout collision & pod patch alerts.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {scenario.projectWeeks !== data.recommendedDurationWeeks && (
                  <button
                    onClick={applyRecommendedDuration}
                    className="px-3 py-1.5 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                  >
                    <Zap size={14} className="text-blue-600" />
                    <span>Auto-Align: {data.recommendedDurationWeeks} Wks</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('sequencing')}
                  className="px-3 py-1.5 rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                  title="Customize Build, Design, Test durations and sequencing"
                >
                  <GitBranch size={14} className="text-indigo-600" />
                  <span>Phase Overrides & Durations</span>
                </button>
                <button
                  onClick={() => setZoomScale(zoomScale === 'weeks' ? 'months' : 'weeks')}
                  className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-300 transition cursor-pointer"
                >
                  Zoom: {zoomScale === 'weeks' ? 'Week View' : 'Month View'}
                </button>
              </div>
            </div>

            {/* Schedule Configuration Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              {/* Duration in Weeks */}
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Duration</span>
                  <div className="flex items-center gap-1 bg-white px-1 py-0.5 rounded-none border border-slate-300">
                    <button
                      onClick={() => updateWeeks(totalWeeks - 4)}
                      className="px-1 py-0.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-200 cursor-pointer"
                      title="Decrease by 4 weeks"
                    >
                      -4w
                    </button>
                    <button
                      onClick={() => updateWeeks(totalWeeks - 1)}
                      className="px-1 py-0.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-200 cursor-pointer"
                      title="Decrease by 1 week"
                    >
                      -1w
                    </button>
                    <input
                      type="number"
                      min={16}
                      max={104}
                      value={totalWeeks}
                      onChange={(e) => updateWeeks(parseInt(e.target.value) || 24)}
                      className="w-10 text-center text-xs font-mono font-bold text-slate-900 focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={() => updateWeeks(totalWeeks + 1)}
                      className="px-1 py-0.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-200 cursor-pointer"
                      title="Increase by 1 week"
                    >
                      +1w
                    </button>
                    <button
                      onClick={() => updateWeeks(totalWeeks + 4)}
                      className="px-1 py-0.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-200 cursor-pointer"
                      title="Increase by 4 weeks"
                    >
                      +4w
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={16}
                    max={72}
                    value={totalWeeks}
                    onChange={(e) => updateWeeks(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{totalWeeks}w</span>
                </div>
              </div>

              {/* Target Start Date */}
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Target Start Date</span>
                  <span className="text-xs font-bold text-slate-800">
                    {new Date(scenario.targetStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <input
                  type="date"
                  value={scenario.targetStartDate}
                  onChange={(e) => updateStartDate(e.target.value)}
                  className="bg-white border border-slate-300 text-xs text-slate-900 px-2 py-1 rounded-sm focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Rollout Approach */}
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Rollout Approach</span>
                  <span className="text-xs font-bold text-slate-900 capitalize">
                    {scenario.rolloutApproach.replace('_', ' ')} ({scenario.rolloutWaves || 1}W)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700">
                  {data.rolloutMultiplier.toFixed(2)}x
                </span>
              </div>

              {/* Oracle Pod Patch Cohort */}
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Patch Cohort</span>
                  <span className="text-xs font-bold text-slate-900">
                    Cohort {scenario.podCohort}
                  </span>
                </div>
                <div className="flex gap-1">
                  {(['A', 'B', 'C'] as PodCohort[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => updatePodCohort(c)}
                      className={`w-6 h-6 rounded-sm text-xs font-bold transition cursor-pointer ${
                        scenario.podCohort === c
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Timeline Presets & Staffing Generation Strip */}
            <div className="p-3 rounded-sm bg-slate-100 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Quick Sizing Presets:</span>
                <button
                  onClick={() => updateWeeks(data.recommendedDurationWeeks)}
                  className={`px-2 py-1 rounded-xs font-mono font-bold text-[11px] transition cursor-pointer border ${
                    totalWeeks === data.recommendedDurationWeeks
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Adopt recommended duration from 4-Step Methodology"
                >
                  ⭐ Recommended ({data.recommendedDurationWeeks}w)
                </button>
                <button
                  onClick={() => updateWeeks(data.scheduleFeasibility.crashDurationWeeks || 24)}
                  className={`px-2 py-1 rounded-xs font-mono font-bold text-[11px] transition cursor-pointer border ${
                    totalWeeks === (data.scheduleFeasibility.crashDurationWeeks || 24)
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Adopt compressed/crash schedule"
                >
                  ⚡ Compressed ({data.scheduleFeasibility.crashDurationWeeks || 24}w)
                </button>
                <button
                  onClick={() => updateWeeks(data.recommendedDurationWeeks + 4)}
                  className={`px-2 py-1 rounded-xs font-mono font-bold text-[11px] transition cursor-pointer border ${
                    totalWeeks === data.recommendedDurationWeeks + 4
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Adopt buffered schedule with risk contingency"
                >
                  🛡️ Buffered ({data.recommendedDurationWeeks + 4}w)
                </button>
                {/* Industry Benchmark duration button hidden for proposal customization */}
              </div>

              {/* Staffing Generation Math Formula */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-600">
                  Staffing: <strong className="font-mono text-slate-900">{Math.round(data.targetHours || 0).toLocaleString()}h</strong> ÷ (<strong className="font-mono text-slate-900">{totalWeeks}w</strong> × 40h) = <strong className="font-mono text-emerald-700">{(data.targetHours / (totalWeeks * 40)).toFixed(1)} FTEs</strong>
                </span>
                <button
                  onClick={() => setActiveTab('capacity')}
                  className="px-2 py-1 rounded-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                >
                  <Calculator size={11} />
                  <span>Full Capacity Model</span>
                </button>
              </div>
            </div>

            {/* Senior Leadership Gaps Oversight Summary Strip */}
            <div className="pt-4 border-t border-slate-200">
              <div className="p-3.5 rounded-sm bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-1 rounded-sm bg-amber-400/20 text-amber-400 border border-amber-400/30 shrink-0">
                    <Award size={16} />
                  </span>
                  <div>
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                      Senior Delivery Lead Schedule Verification
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      Methodology Sizing: <strong className="text-amber-400">{data.recommendedDurationWeeks} Weeks</strong> • Critical Float: <strong className="text-blue-300">{data.leadershipGaps.criticalPath.zeroFloatActivitiesCount} Zero-Float Gates</strong> • Pod Strategy: <strong className="text-emerald-300">Cohort {scenario.podCohort} Clean</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-xs bg-white/10 text-slate-200 font-mono text-[10px]">
                    Feasibility: {data.leadershipGaps.executiveSummary.scheduleFeasibilityScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Blackout Collisions & Pod Patch Advisory Banner */}
          {(data.blackoutCollisions.length > 0 || data.patchConflictWeeks.length > 0) ? (
            <div className="space-y-2">
              {data.blackoutCollisions.map((col, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-sm border shadow-xs flex items-start justify-between gap-4 ${
                    col.severity === 'hard_freeze'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-sm shrink-0 ${col.severity === 'hard_freeze' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {col.severity === 'hard_freeze' ? 'CRITICAL BLACKOUT COLLISION' : 'BLACKOUT ADVISORY'}: {col.blackoutName}
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-0.5">
                        Overlaps with <strong>{col.collidingPhase}</strong> during window ({col.period}). {col.impact}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-none border shrink-0 ${
                    col.severity === 'hard_freeze' ? 'bg-rose-100 border-rose-300 text-rose-900' : 'bg-amber-100 border-amber-300 text-amber-900'
                  }`}>
                    {col.severity === 'hard_freeze' ? 'Hard Freeze' : 'Soft Freeze'}
                  </span>
                </div>
              ))}

              {data.patchConflictWeeks.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm flex items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-700 shrink-0" />
                    <span>
                      <strong>Oracle Pod Patch Maintenance Conflict:</strong> Quarterly updates fall in Weeks: {data.patchConflictWeeks.join(', ')} during critical testing or cutover gates.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest shrink-0">
                    Pod Cohort {scenario.podCohort}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span className="font-medium">
                  <strong>Schedule Verified:</strong> No critical collisions between client blackout freezes, Oracle quarterly patching windows, and testing/cutover gates.
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Clear Flight Path</span>
            </div>
          )}

          {/* Phase Overflow Warning if any phase extends beyond current project timeline */}
          {(() => {
            const maxPhaseEndWeek = Math.max(...(data.phaseHours || []).map(p => p.endWeek || 0), totalWeeks);
            if (maxPhaseEndWeek > totalWeeks) {
              return (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-sm text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-sm bg-amber-200 text-amber-900 shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[11px] tracking-wider block">
                        Phase Overflow Detected
                      </span>
                      <span className="text-slate-700">
                        One or more phase durations extend to <strong>Week {maxPhaseEndWeek}</strong>, which exceeds the active schedule ({totalWeeks} weeks).
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateWeeks(maxPhaseEndWeek)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xs font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-xs transition flex items-center gap-1.5"
                  >
                    <Zap size={13} />
                    <span>Auto-Align Schedule to {maxPhaseEndWeek} Wks</span>
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {/* Interactive Gantt Chart Container */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
            {/* Track Category Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 flex-wrap">
                <Filter size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filter Tracks:</span>
                <div className="flex gap-1 overflow-x-auto">
                  {['all', 'Functional', 'Technical', 'Data', 'Testing', 'Change', 'Management'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedTrackFilter(cat)}
                      className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                        selectedTrackFilter === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Workstreams' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Mandatory Enablement: <strong>2 Wks</strong></span>
                <span>&bull;</span>
                <span>Go-Live: <strong>W{data.goLiveWeek}</strong></span>
              </div>
            </div>

            {/* Scrollable Gantt Canvas */}
            <div className="overflow-x-auto pb-4 pt-2">
              <div style={{ minWidth: `${Math.max(900, totalWeeks * 38 + 240)}px` }}>
                {/* Header: Weeks & Dates */}
                <div className="flex items-center border-b border-slate-200 pb-2 mb-3">
                  <div className="w-60 shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Phase / Workstream Track
                  </div>

                  <div className="flex flex-1">
                    {weekList.map((w) => {
                      const isPatch = isPatchMonthWeek(w);
                      const isConflict = isConflictWeek(w);
                      const isHyper = w >= data.hypercareStartWeek;
                      const isEnablement = w <= 2;
                      const weekBlackout = getWeekBlackout(w);
                      const weekDate = getWeekDate(w);

                      return (
                        <div
                          key={w}
                          className={`w-[38px] shrink-0 text-center text-[10px] font-mono border-l border-slate-200 py-1 transition ${
                            weekBlackout
                              ? weekBlackout.severity === 'hard_freeze'
                                ? 'bg-rose-100 text-rose-950 font-bold border-rose-300'
                                : 'bg-amber-100 text-amber-950 font-bold border-amber-300'
                              : isConflict
                              ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                              : isPatch
                              ? 'bg-rose-50 text-rose-700'
                              : isEnablement
                              ? 'bg-indigo-50 text-indigo-900'
                              : isHyper
                              ? 'bg-purple-50 text-purple-900'
                              : 'text-slate-600'
                          }`}
                          title={`Week ${w} (${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}) ${
                            weekBlackout ? `\nBLACKOUT: ${weekBlackout.name}` : ''
                          } ${isConflict ? '\nCRITICAL PATCH CONFLICT' : isPatch ? '\nOracle Patch Month' : ''}`}
                        >
                          <div className="font-bold">{w}</div>
                          <div className="text-[8px] text-slate-400 truncate">{weekDate.toLocaleDateString('en-US', { month: 'narrow' })}</div>
                          {weekBlackout ? (
                            <div className="text-[7px] font-black uppercase text-rose-700 tracking-tighter truncate px-0.5">
                              FREEZE
                            </div>
                          ) : isPatch ? (
                            <div className="text-[7px] font-black uppercase text-rose-700 tracking-tighter">
                              PATCH
                            </div>
                          ) : isEnablement ? (
                            <div className="text-[7px] font-black uppercase text-indigo-700 tracking-tighter">
                              INIT
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Implementation Phases Bands (The 7 Mandated Phases) */}
                <div className="space-y-1.5 mb-5 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Oracle Implementation Lifecycle (7 Dedicated Phases)
                    </div>
                    {scenario.phaseDeliveryModel === 'hypercare_overlap' && (
                      <span className="text-[9px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200">
                        ⚡ Staggered Wave Overlap Active (Wave 2 starts in W{data.hypercareStartWeek} Hypercare)
                      </span>
                    )}
                  </div>
                  {data.phaseHours.map((ph) => {
                    const duration = Math.max(1, ph.endWeek - ph.startWeek + 1);
                    const offsetWeeks = ph.startWeek - 1;
                    const override = (scenario.phaseOverrides || {})[ph.id];
                    const isHypercareLinked = override?.startDuringHypercare;
                    const isOverridden = override && (override.customStartWeek !== undefined || override.customDurationWeeks !== undefined || isHypercareLinked);

                    const phaseDem = scenario.multiVendor?.isEnabled && scenario.multiVendor?.phaseDemarcation?.[ph.id];
                    const ownerParty = phaseDem?.primaryOwner || 'our_si';
                    const isMultiVendorActive = scenario.multiVendor?.isEnabled;

                    return (
                      <div key={ph.id} className="flex items-center h-7 hover:bg-slate-50 rounded-none group">
                        <div className="w-68 shrink-0 pr-3 truncate text-xs font-bold text-slate-800 flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-none shrink-0" style={{ backgroundColor: ph.color }} />
                            <span className="truncate" title={ph.name}>{ph.name}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Inline week stepper */}
                            <div className="flex items-center bg-slate-100 px-1 py-0.5 rounded-xs border border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const current = override?.customDurationWeeks ?? duration;
                                  const nextVal = Math.max(1, current - 1);
                                  onUpdateScenario(prev => ({
                                    ...prev,
                                    phaseOverrides: {
                                      ...(prev.phaseOverrides || {}),
                                      [ph.id]: {
                                        ...(prev.phaseOverrides?.[ph.id] || { phaseId: ph.id }),
                                        customDurationWeeks: nextVal
                                      }
                                    }
                                  }));
                                }}
                                className="w-3.5 h-3.5 rounded-none bg-white hover:bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center cursor-pointer border border-slate-300"
                                title={`Decrease ${ph.name} duration (-1 wk)`}
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-[10px] text-slate-900 px-1" title="Duration in weeks">{duration}w</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const current = override?.customDurationWeeks ?? duration;
                                  const nextVal = current + 1;
                                  const projectedEnd = (ph.startWeek || 1) + nextVal - 1;
                                  onUpdateScenario(prev => ({
                                    ...prev,
                                    projectWeeks: Math.max(prev.projectWeeks, projectedEnd),
                                    phaseOverrides: {
                                      ...(prev.phaseOverrides || {}),
                                      [ph.id]: {
                                        ...(prev.phaseOverrides?.[ph.id] || { phaseId: ph.id }),
                                        customDurationWeeks: nextVal
                                      }
                                    }
                                  }));
                                }}
                                className="w-3.5 h-3.5 rounded-none bg-white hover:bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center cursor-pointer border border-slate-300"
                                title={`Increase ${ph.name} duration (+1 wk)`}
                              >
                                +
                              </button>
                            </div>
                            {isMultiVendorActive && (
                              <span className={`text-[8px] font-mono font-bold px-1 rounded-none shrink-0 uppercase ${
                                ownerParty === 'other_si'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ownerParty === 'client'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ownerParty === 'validation_si'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {ownerParty === 'our_si' ? 'OUR SI' : ownerParty === 'other_si' ? 'OTHER BI' : ownerParty === 'client' ? 'CLIENT' : 'IV&V'}
                              </span>
                            )}
                            {isHypercareLinked ? (
                              <span className="text-[8px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1 rounded-none shrink-0">
                                HYPERCARE
                              </span>
                            ) : isOverridden ? (
                              <span className="text-[8px] font-mono font-bold bg-amber-100 text-amber-800 px-1 rounded-none shrink-0">
                                OVERRIDE
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex-1 relative h-5 bg-slate-100 rounded-none">
                          <div
                            className="absolute top-0 h-5 rounded-none flex items-center px-2 shadow-2xs"
                            style={{
                              left: `${offsetWeeks * 38}px`,
                              width: `${duration * 38}px`,
                              backgroundColor: `${ph.color}33`,
                              borderLeft: `4px solid ${ph.color}`
                            }}
                          >
                            <span className="text-[10px] font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{ph.code} &bull; {duration} wks ({(Math.round(ph.hours || 0)).toLocaleString()} hrs) {isHypercareLinked ? '⚡ Linked to Hypercare' : ''}</span>
                              {isMultiVendorActive && (
                                <span className={`text-[9px] font-semibold px-1 rounded-2xs ${
                                  ownerParty === 'other_si'
                                    ? 'bg-blue-200 text-blue-900'
                                    : ownerParty === 'client'
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : ownerParty === 'validation_si'
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-slate-200 text-slate-800'
                                }`}>
                                  [{ownerParty === 'our_si' ? 'Our SI' : ownerParty === 'other_si' ? 'Other BI' : ownerParty === 'client' ? 'Client' : 'IV&V'}]
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Workstream Tracks */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Functional & Technical Tracks (Phase Schedule & Governance)
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      Governance, PMO & OCM run continuously in parallel
                    </span>
                  </div>
                  {filteredWorkstreams.map((ws) => {
                    const duration = Math.max(1, ws.endWeek - ws.startWeek + 1);
                    const offsetWeeks = ws.startWeek - 1;
                    const isParallel = ws.isParallel || ws.id === 'ws_gov_steerco' || ws.id === 'ws_pmo_gov' || ws.id === 'ws_ocm_train';

                    return (
                      <div key={ws.id} className="flex items-center h-8 hover:bg-slate-50 rounded-none group">
                        <div className="w-60 shrink-0 pr-3">
                          <div className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                            <span className="truncate">{ws.name}</span>
                            {isParallel && (
                              <span className="text-[8px] font-mono font-bold bg-slate-200 text-slate-800 px-1 rounded-none shrink-0 ml-1">
                                PARALLEL
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{ws.leadRole}</div>
                        </div>

                        <div className="flex-1 relative h-6 bg-slate-100 rounded-none">
                          <div
                            className="absolute top-0 h-6 rounded-none flex items-center justify-between px-2 text-white shadow-2xs transition"
                            style={{
                              left: `${offsetWeeks * 38}px`,
                              width: `${duration * 38}px`,
                              backgroundColor: ws.color,
                              borderLeft: isParallel ? '3px solid #f59e0b' : undefined
                            }}
                          >
                            <span className="text-[10px] font-bold truncate">
                              {(Math.round(ws.hours || 0)).toLocaleString()} hrs {isParallel ? '(Parallel W1-End)' : ''}
                            </span>
                            <span className="text-[9px] font-mono opacity-90 shrink-0 font-bold">
                              {ws.avgFTE.toFixed(1)} FTE
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Key Milestone Markers */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Key Quality Gates & Milestones
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {data.milestoneDates.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-slate-900">W{m.week}</span>
                          <span className="text-slate-500 font-semibold">{m.calendarDate}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate" title={m.name}>
                          {m.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{m.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environment & Pod Strategy Integrated Swimlane */}
          <EnvironmentLandscapeSwimlane
            scenario={scenario}
            data={data}
            onUpdateScenario={onUpdateScenario}
          />
        </>
      )}

      {/* SteerCo Defense Briefing Modal */}
      <SteerCoDefenseModal
        isOpen={showSteerCoModal}
        onClose={() => setShowSteerCoModal(false)}
        scenario={scenario}
        data={data}
        onApplyRecommendedDuration={applyRecommendedDuration}
      />

      {/* Smartsheet Enterprise PMO Plan Initiation Modal */}
      <SmartsheetExportModal
        isOpen={showSmartsheetModal}
        onClose={() => setShowSmartsheetModal(false)}
        scenario={scenario}
        data={data}
        onUpdateScenario={onUpdateScenario}
      />
    </div>
  );
};
