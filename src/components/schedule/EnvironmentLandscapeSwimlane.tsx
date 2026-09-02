import React, { useState } from 'react';
import {
  Server,
  Database,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Zap,
  Calendar,
  Lock,
  GitBranch,
  ArrowRight,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  HardDrive,
  Network,
  Key
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  PodCohort,
  EnvironmentInstance,
  EnvironmentP2TEvent,
  EnvironmentPatchEvent,
  EnvironmentReadinessCheckItem
} from '../../types';
import { ORACLE_PATCH_COHORTS } from '../../data/oraclePhases';

interface EnvironmentLandscapeSwimlaneProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  isCompactView?: boolean;
}

export const EnvironmentLandscapeSwimlane: React.FC<EnvironmentLandscapeSwimlaneProps> = ({
  scenario,
  data,
  onUpdateScenario,
  isCompactView = false
}) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('env_test');
  const [activeSubView, setActiveSubView] = useState<'swimlane' | 'p2t_runbook' | 'patch_matrix' | 'readiness_audit'>('swimlane');

  const envData = data.environmentStrategy;
  const totalWeeks = scenario.projectWeeks;
  const weekList = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const startDateObj = new Date(scenario.targetStartDate || '2026-09-01');

  const getWeekDate = (w: number) => {
    return new Date(startDateObj.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
  };

  const updatePodCohort = (cohort: PodCohort) => {
    onUpdateScenario(prev => ({
      ...prev,
      podCohort: cohort
    }));
  };

  const updateEnvLeadTime = (weeks: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scheduleModifiers: {
        ...(prev.scheduleModifiers || {
          methodology: 'hybrid_oum',
          fastTrackingOverlapPct: 15,
          clientDecisionSLA: 'standard_5d',
          envReadinessLeadWeeks: 2,
          dataReadinessScore: 2,
          sprintCadenceWeeks: 3
        }),
        envReadinessLeadWeeks: weeks
      }
    }));
  };

  const selectedInstance = envData?.instances.find(i => i.id === selectedInstanceId) || envData?.instances[0];

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
      {/* 1. Solution Architect Environment Strategy Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
              <Server size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Solution Architect Technical Blueprint
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-100 text-indigo-900 font-bold uppercase rounded-none border border-indigo-200">
              5-Tier Cloud Pod Architecture
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Environment & Pod Instance Strategy (P2T & Patch Mapping)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Synchronized lifecycle map connecting DEV, TEST, STAGE, and PROD pods with P2T data clone schedules, Oracle quarterly release windows, and environment readiness gates.
          </p>
        </div>

        {/* Top Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pod Cohort</span>
            <div className="flex items-center gap-1 mt-0.5">
              {(['A', 'B', 'C'] as PodCohort[]).map(c => (
                <button
                  key={c}
                  onClick={() => updatePodCohort(c)}
                  className={`w-6 h-6 rounded-xs text-xs font-bold transition cursor-pointer ${
                    scenario.podCohort === c
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Oracle Patch Cohort ${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">P2T Refreshes</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {envData?.p2tEvents.length || 0} Golden Refreshes
            </span>
          </div>

          <div className={`p-2.5 rounded-sm border text-xs ${
            (envData?.patchConflictCount || 0) > 0
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block">Patch Health</span>
            <span className="font-mono font-bold text-sm flex items-center gap-1">
              {(envData?.patchConflictCount || 0) > 0 ? (
                <>
                  <AlertTriangle size={14} className="text-amber-700" />
                  <span>{envData?.patchConflictCount} Window Alerts</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span>Zero Collisions</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Pills for Solution Architect View */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubView('swimlane')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubView === 'swimlane'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Interactive Visual Swimlane</span>
          </button>

          <button
            onClick={() => setActiveSubView('p2t_runbook')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubView === 'p2t_runbook'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <RefreshCw size={13} />
            <span>P2T Refresh & Cutover Staging ({envData?.p2tEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('patch_matrix')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubView === 'patch_matrix'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calendar size={13} />
            <span>Oracle Release Patch Matrix ({envData?.patchEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('readiness_audit')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeSubView === 'readiness_audit'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Environment Readiness & Lead-Time ({envData?.readinessChecks.length})</span>
          </button>
        </div>

        {/* Client Lead Time Delay Simulator Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm text-xs">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Client Tenancy & SSO Lead Time:</span>
          <div className="flex items-center gap-1">
            {[2, 4, 6].map(w => (
              <button
                key={w}
                onClick={() => updateEnvLeadTime(w)}
                className={`px-2 py-0.5 rounded-2xs text-[11px] font-mono font-bold transition cursor-pointer ${
                  (scenario.scheduleModifiers?.envReadinessLeadWeeks ?? 2) === w
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {w} Wks {w === 2 ? '(Nominal)' : `(+${w - 2}w Risk)`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lead-Time Risk Warning Banner (if client provisioning takes >2 weeks) */}
      {(envData?.leadTimeRiskWeeks || 0) > 0 && (
        <div className="p-4 rounded-sm bg-rose-50 border border-rose-300 text-rose-950 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-sm bg-rose-100 text-rose-700 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                CRITICAL ENVIRONMENT LEAD-TIME LAG (+{envData?.leadTimeRiskWeeks} WEEKS)
              </div>
              <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">
                Client Tenancy & Single Sign-On provisioning requires <strong>{scenario.scheduleModifiers?.envReadinessLeadWeeks} weeks</strong> (2 weeks above standard baseline). Without immediate temporary sandbox bypass or accelerated IdP federation, <strong>Client Enablement & Design CRP1</strong> will experience a direct {envData?.leadTimeRiskWeeks}-week start delay.
              </p>
            </div>
          </div>
          <button
            onClick={() => updateEnvLeadTime(2)}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold rounded-xs cursor-pointer shrink-0 transition"
          >
            Reset to 2-Week Baseline
          </button>
        </div>
      )}

      {/* SUB-VIEW 1: Interactive Visual Swimlane */}
      {activeSubView === 'swimlane' && (
        <div className="space-y-5">
          {/* Visual Legend & Guidance */}
          <div className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-sm border border-slate-200 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-600 rounded-none inline-block" />
                <span>Active Pod Lifecycle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded-none inline-block" />
                <span>P2T Data Refresh Window</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-500 rounded-none inline-block" />
                <span>Oracle Quarterly Patch Weekend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-500" />
                <span>Freeze / Strict Change Control</span>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              Total Project Duration: <strong>{totalWeeks} Weeks</strong>
            </span>
          </div>

          {/* Scrollable Gantt-Synchronized Swimlane Canvas */}
          <div className="overflow-x-auto pb-4 pt-1">
            <div style={{ minWidth: `${Math.max(900, totalWeeks * 38 + 240)}px` }}>
              {/* Header: Weeks & Dates */}
              <div className="flex items-center border-b border-slate-200 pb-2 mb-3">
                <div className="w-60 shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Pod Instance / Landscape Tier
                </div>

                <div className="flex flex-1">
                  {weekList.map((w) => {
                    const weekDate = getWeekDate(w);
                    const patchEvent = envData?.patchEvents.find(p => p.week === w);
                    const p2tEvent = envData?.p2tEvents.find(p => p.week === w);

                    return (
                      <div
                        key={w}
                        className={`w-[38px] shrink-0 text-center text-[10px] font-mono border-l border-slate-200 py-1 transition ${
                          patchEvent?.hasConflict
                            ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                            : patchEvent
                            ? 'bg-rose-50 text-rose-700'
                            : p2tEvent
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'text-slate-600'
                        }`}
                        title={`Week ${w} (${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})${
                          patchEvent ? `\nOracle ${patchEvent.quarter} Patch (${patchEvent.isProdPatch ? 'PROD 3rd Fri' : 'Non-Prod 1st Fri'})` : ''
                        }${p2tEvent ? `\n${p2tEvent.name}` : ''}`}
                      >
                        <div className="font-bold">{w}</div>
                        <div className="text-[8px] text-slate-400 truncate">{weekDate.toLocaleDateString('en-US', { month: 'narrow' })}</div>
                        {patchEvent ? (
                          <div className={`text-[7px] font-black uppercase tracking-tighter ${patchEvent.hasConflict ? 'text-rose-700' : 'text-rose-600'}`}>
                            {patchEvent.quarter}
                          </div>
                        ) : p2tEvent ? (
                          <div className="text-[7px] font-black uppercase tracking-tighter text-amber-700">
                            P2T
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Landscape Swimlane Bars */}
              <div className="space-y-3 mb-6">
                {envData?.instances.map((inst) => {
                  const duration = Math.max(1, inst.endWeek - inst.startWeek + 1);
                  const offsetWeeks = inst.startWeek - 1;
                  const isSelected = selectedInstanceId === inst.id;

                  // Find P2T events targeting this instance
                  const incomingP2T = envData.p2tEvents.filter(p => p.targetInstance.includes(inst.code));
                  const outgoingP2T = envData.p2tEvents.filter(p => p.sourceInstance.includes(inst.code));

                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstanceId(inst.id)}
                      className={`flex items-center h-12 rounded-none p-1 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 ring-1 ring-blue-400' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Left Header Column */}
                      <div className="w-60 shrink-0 pr-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: inst.color }} />
                            <span className="text-xs font-bold text-slate-900 truncate">{inst.code}</span>
                            {inst.isLocked && (
                              <Lock size={11} className="text-slate-400 shrink-0" title={inst.lockedPhaseName} />
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                            W{inst.startWeek}–W{inst.endWeek}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{inst.name.split('(')[1]?.replace(')', '') || inst.purpose}</div>
                      </div>

                      {/* Right Timeline Grid Row */}
                      <div className="flex-1 relative h-8 bg-slate-100 rounded-none overflow-hidden">
                        {/* Instance Active Bar */}
                        <div
                          className="absolute top-1 h-6 rounded-xs flex items-center justify-between px-2 text-white shadow-2xs transition"
                          style={{
                            left: `${offsetWeeks * 38}px`,
                            width: `${duration * 38}px`,
                            backgroundColor: inst.color,
                            borderLeft: `4px solid ${inst.color}`
                          }}
                        >
                          <span className="text-[10px] font-bold truncate flex items-center gap-1">
                            <span>{inst.name}</span>
                            {inst.isLocked && (
                              <span className="text-[8px] bg-black/25 px-1 py-0.2 rounded-2xs font-mono uppercase">
                                Locked
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] font-mono opacity-90 shrink-0 font-bold">
                            {duration} Wks
                          </span>
                        </div>

                        {/* P2T Markers overlay */}
                        {incomingP2T.map(p => {
                          const pOffset = (p.week - 1) * 38;
                          return (
                            <div
                              key={p.id}
                              className="absolute top-0 bottom-0 w-2 bg-amber-500 z-10 animate-pulse"
                              style={{ left: `${pOffset + 14}px` }}
                              title={`P2T Clone: ${p.name} in Week ${p.week}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Dedicated Oracle Release & Patch Track */}
                <div className="flex items-center h-10 bg-rose-50/50 rounded-none p-1 border-t border-rose-200 mt-2">
                  <div className="w-60 shrink-0 pr-3">
                    <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <Calendar size={13} className="text-rose-600" />
                      <span>Oracle Quarterly Patch Releases</span>
                    </div>
                    <div className="text-[10px] text-rose-700 truncate">Cohort {scenario.podCohort} (Non-Prod W1 / Prod W3)</div>
                  </div>

                  <div className="flex-1 relative h-6 bg-rose-100/50 rounded-none">
                    {envData?.patchEvents.map((p, idx) => {
                      const pOffset = (p.week - 1) * 38;
                      return (
                        <div
                          key={idx}
                          className={`absolute top-0 h-6 px-1.5 flex items-center justify-center text-[9px] font-mono font-bold rounded-2xs shadow-2xs border ${
                            p.hasConflict
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                              : 'bg-white text-rose-900 border-rose-300'
                          }`}
                          style={{ left: `${pOffset}px`, width: '38px' }}
                          title={`Oracle ${p.quarter} (${p.isProdPatch ? 'PROD Pod' : 'Non-Prod Pods'}) - Week ${p.week}\n${p.hasConflict ? '⚠️ COLLISION: ' + p.actionRequired : 'Normal maintenance'}`}
                        >
                          {p.quarter}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Instance Deep-Dive Detail Card */}
              {selectedInstance && (
                <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: selectedInstance.color }} />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {selectedInstance.name} (Tier: {selectedInstance.tier})
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Active: Week {selectedInstance.startWeek} to Week {selectedInstance.endWeek} ({selectedInstance.endWeek - selectedInstance.startWeek + 1} Weeks)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Architectural Role:</strong> {selectedInstance.purpose}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xs bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Workstreams</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedInstance.activeWorkstreams.map((ws, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-800 rounded-2xs font-medium">
                            {ws}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xs bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Key Milestones & Gates</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedInstance.keyMilestones.map((km, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-2xs font-mono font-bold">
                            {km}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: P2T Refreshes & Cutover Staging Runbook */}
      {activeSubView === 'p2t_runbook' && (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-blue-50/50 border border-blue-200 text-xs space-y-1">
            <span className="font-bold text-blue-950 uppercase tracking-wider block">
              Production-to-Test (P2T) Refresh Strategy & Freeze Policy
            </span>
            <p className="text-slate-700 leading-relaxed">
              P2T refreshes synchronize Gold Configuration, lookup codes, and converted master data across environments. Once testing begins, environments enter strict change freeze to prevent defect invalidation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {envData?.p2tEvents.map((p2t, idx) => (
              <div key={p2t.id} className="p-4 rounded-sm bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-xs">
                    Week {p2t.week} ({p2t.durationDays} Days SLA)
                  </span>
                  <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
                    Step {idx + 1}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{p2t.name}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1 font-mono">
                    <span className="font-bold text-slate-800">{p2t.sourceInstance}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="font-bold text-blue-800">{p2t.targetInstance}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {p2t.description}
                </p>

                <div className="p-2 rounded-xs bg-slate-50 text-[10px] text-slate-700 border border-slate-200">
                  <strong>CAB Booking:</strong> Requires Oracle Cloud Service Request (SR) submitted 2 weeks prior.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Oracle Release Patch Matrix */}
      {activeSubView === 'patch_matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                Oracle Quarterly Patch Cadence (Cohort {scenario.podCohort})
              </span>
              <span className="text-slate-600 text-[11px]">
                {ORACLE_PATCH_COHORTS[scenario.podCohort].typicalCadence} &bull; {ORACLE_PATCH_COHORTS[scenario.podCohort].description}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(['A', 'B', 'C'] as PodCohort[]).map(c => (
                <button
                  key={c}
                  onClick={() => updatePodCohort(c)}
                  className={`px-3 py-1 rounded-xs text-xs font-bold transition cursor-pointer ${
                    scenario.podCohort === c
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cohort {c}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Patch Releases across Timeline */}
          <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Quarter</th>
                  <th className="p-3">Scheduled Date</th>
                  <th className="p-3">Timeline Week</th>
                  <th className="p-3">Target Pods</th>
                  <th className="p-3">Collision & Action Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {envData?.patchEvents.map((pe, idx) => (
                  <tr key={idx} className={pe.hasConflict ? 'bg-rose-50/70' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {pe.quarter}
                    </td>
                    <td className="p-3 text-slate-600">
                      {pe.dateStr}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      Week {pe.week}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-2xs font-mono text-[10px]">
                        {pe.isProdPatch ? 'PROD (3rd Friday)' : 'DEV1, DEV2, TEST, STAGE (1st Friday)'}
                      </span>
                    </td>
                    <td className="p-3">
                      {pe.hasConflict ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-900 font-bold rounded-2xs text-[10px] border border-rose-300">
                            <AlertTriangle size={11} />
                            <span>Conflict: {pe.conflictPhaseName}</span>
                          </span>
                          <p className="text-[11px] text-rose-950">{pe.actionRequired}</p>
                        </div>
                      ) : (
                        <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Standard 4-hour maintenance window</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Environment Readiness & Lead-Time Audit */}
      {activeSubView === 'readiness_audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                Solution Architect 6-Point Environment Readiness Audit
              </span>
              <span className="text-slate-600 text-[11px]">
                Pre-requisite gates that must be signed off prior to Client Enablement and Design Phase kickoff.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-xs bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
              6 Gates Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {envData?.readinessChecks.map((chk) => (
              <div key={chk.id} className="p-4 rounded-sm bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      chk.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-xs font-bold text-slate-900">{chk.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-none border ${
                    chk.status === 'ready'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {chk.status === 'ready' ? 'READY' : 'IN-PROGRESS'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span><strong>Lead Time:</strong> {chk.leadTimeWeeks} Weeks</span>
                  <span><strong>Owner:</strong> {chk.assignedRole}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                  {chk.guidance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
