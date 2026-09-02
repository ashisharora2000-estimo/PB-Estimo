import React, { useState } from 'react';
import {
  GitBranch,
  Layers,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, PhaseDeliveryModel, PhaseOverride } from '../../types';
import { IMPLEMENTATION_PHASES } from '../../data/oraclePhases';

interface PhaseSequencingOverridesPanelProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const PhaseSequencingOverridesPanel: React.FC<PhaseSequencingOverridesPanelProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  const [isCustomExpanded, setIsCustomExpanded] = useState<boolean>(
    scenario.phaseDeliveryModel === 'custom_non_sequential' || Object.keys(scenario.phaseOverrides || {}).length > 0
  );

  const activeModel: PhaseDeliveryModel = scenario.phaseDeliveryModel || (scenario.rolloutWaves > 1 ? 'hypercare_overlap' : 'sequential');
  const phaseOverrides: Record<string, PhaseOverride> = scenario.phaseOverrides || {};

  const handleSelectModel = (model: PhaseDeliveryModel) => {
    onUpdateScenario(prev => ({
      ...prev,
      phaseDeliveryModel: model,
      waveStartDuringHypercare: model === 'hypercare_overlap'
    }));
    if (model === 'custom_non_sequential') {
      setIsCustomExpanded(true);
    }
  };

  const handleUpdatePhaseOverride = (phaseId: string, partial: Partial<PhaseOverride>) => {
    onUpdateScenario(prev => {
      const currentOverrides = prev.phaseOverrides || {};
      const existing = currentOverrides[phaseId] || { phaseId };
      const updated = { ...existing, ...partial };

      return {
        ...prev,
        phaseOverrides: {
          ...currentOverrides,
          [phaseId]: updated
        }
      };
    });
  };

  const handleToggleStartInHypercare = (phaseId: string) => {
    onUpdateScenario(prev => {
      const currentOverrides = prev.phaseOverrides || {};
      const existing = currentOverrides[phaseId] || { phaseId };
      const nextState = !existing.startDuringHypercare;

      return {
        ...prev,
        phaseOverrides: {
          ...currentOverrides,
          [phaseId]: {
            ...existing,
            startDuringHypercare: nextState,
            customStartWeek: nextState ? data.hypercareStartWeek : undefined
          }
        }
      };
    });
  };

  const handleResetOverrides = () => {
    onUpdateScenario(prev => ({
      ...prev,
      phaseOverrides: {},
      phaseDeliveryModel: 'sequential',
      waveStartDuringHypercare: false
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Concept Explanation */}
      <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
                <GitBranch size={16} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                Multi-Phase Delivery & Lifecycle Sequencing
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Phase Delivery Models & Sequence Overrides
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Configure how project waves and implementation phases are sequenced. Choose between standard sequential phase-gates, overlapping rollout waves that kick off during prior-phase Hypercare, fast-tracked parallel execution streams, or full custom phase start overrides.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(phaseOverrides).length > 0 && (
              <button
                onClick={handleResetOverrides}
                className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw size={13} />
                <span>Reset Overrides</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Delivery Model Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Option 1: Sequential Phase-Gate */}
          <button
            onClick={() => handleSelectModel('sequential')}
            className={`p-4 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
              activeModel === 'sequential'
                ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Model 1
                </span>
                {activeModel === 'sequential' && (
                  <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase bg-blue-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">Sequential Phase-Gate</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Linear waterfall gating. Subsequent phases or rollout waves wait for prior phase Hypercare completion before starting.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
              Zero concurrency risk &bull; Longest total schedule
            </div>
          </button>

          {/* Option 2: Staggered Wave Overlap (Start in Hypercare) */}
          <button
            onClick={() => handleSelectModel('hypercare_overlap')}
            className={`p-4 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
              activeModel === 'hypercare_overlap'
                ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-1">
                  <Sparkles size={11} /> Recommended
                </span>
                {activeModel === 'hypercare_overlap' && (
                  <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase bg-indigo-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">Start Wave 2 During Hypercare</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                As soon as Wave 1 goes live and enters Hypercare (W{data.hypercareStartWeek}), Wave 2 kicks off Enablement & Design in parallel.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-200/60 text-[10px] text-indigo-800 font-bold">
              ⚡ Slashes 4-8 weeks overall duration
            </div>
          </button>

          {/* Option 3: Fast-Tracked Parallel Stream */}
          <button
            onClick={() => handleSelectModel('fast_tracked_parallel')}
            className={`p-4 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
              activeModel === 'fast_tracked_parallel'
                ? 'bg-purple-50/70 border-purple-600 ring-1 ring-purple-600 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Model 3
                </span>
                {activeModel === 'fast_tracked_parallel' && (
                  <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase bg-purple-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">Fast-Tracked Parallel Streams</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Wave 2 or functional stream kicks off during Phase 1 SIT (Business Test 1), running architecture in parallel with technical testing.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
              High throughput &bull; Requires dedicated SME pods
            </div>
          </button>

          {/* Option 4: Custom Non-Sequential Overrides */}
          <button
            onClick={() => handleSelectModel('custom_non_sequential')}
            className={`p-4 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
              activeModel === 'custom_non_sequential'
                ? 'bg-amber-50/70 border-amber-600 ring-1 ring-amber-600 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Model 4
                </span>
                {activeModel === 'custom_non_sequential' && (
                  <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase bg-amber-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">Custom Sequence Overrides</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Manually adjust start week offsets, duration weeks, and hypercare alignment for individual lifecycle phases.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-amber-800 font-medium">
              Full manual control per phase
            </div>
          </button>
        </div>
      </div>

      {/* Multi-Wave Schedule Breakdown Visualizer */}
      {data.waveScheduleBreakdown && data.waveScheduleBreakdown.length > 1 && (
        <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                <Layers size={15} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Multi-Wave Rollout Timeline & Overlap Analysis ({data.waveScheduleBreakdown.length} Waves)
                </h4>
                <p className="text-xs text-slate-500">
                  Sequencing timeline showing when Wave 2 kicks off relative to Wave 1 Go-Live and Hypercare.
                </p>
              </div>
            </div>

            {activeModel === 'hypercare_overlap' && (
              <span className="px-2.5 py-1 rounded-none text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1.5">
                <Sparkles size={13} />
                Wave 2 Kicks Off During Wave 1 Hypercare
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {data.waveScheduleBreakdown.map((wave) => (
              <div
                key={wave.waveNumber}
                className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-3 relative overflow-hidden"
              >
                {wave.startsDuringPriorHypercare && (
                  <div className="inline-block px-2 py-0.5 rounded-none text-[9px] font-bold uppercase bg-indigo-600 text-white tracking-wider">
                    ⚡ Starts During Wave {wave.waveNumber - 1} Hypercare
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{wave.name}</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    W{wave.startWeek} &ndash; W{wave.endWeek} ({wave.durationWeeks} wks)
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {wave.scopeSummary}
                </p>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Target Go-Live Gate:</span>
                    <span className="font-mono font-bold text-slate-900">Week {wave.goLiveWeek}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Hypercare Window:</span>
                    <span className="font-mono font-bold text-purple-700">
                      W{wave.hypercareStartWeek} &ndash; W{wave.hypercareEndWeek}
                    </span>
                  </div>
                  {wave.overlapWeeks > 0 && (
                    <div className="flex items-center justify-between text-indigo-700 font-semibold">
                      <span>Parallel Overlap Saved:</span>
                      <span className="font-mono font-bold">{wave.overlapWeeks} Weeks Compression</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Phase Sequence Overrides Table */}
      <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-xs space-y-4">
        <button
          onClick={() => setIsCustomExpanded(!isCustomExpanded)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
              <Sliders size={15} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-2">
                <span>Phase-by-Phase Start & Duration Overrides</span>
                {Object.keys(phaseOverrides).length > 0 && (
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {Object.keys(phaseOverrides).length} Active Overrides
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500">
                Directly override start weeks, durations, or force phases to start during Hypercare of earlier tracks.
              </p>
            </div>
          </div>

          <span className="p-1 text-slate-400 group-hover:text-slate-700">
            {isCustomExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </button>

        {isCustomExpanded && (
          <div className="pt-3 border-t border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Implementation Phase</th>
                    <th className="py-2.5 px-3">Default Schedule</th>
                    <th className="py-2.5 px-3">Custom Start Week</th>
                    <th className="py-2.5 px-3">Custom Duration</th>
                    <th className="py-2.5 px-3">Hypercare Overlap Action</th>
                    <th className="py-2.5 px-3 text-right">Resulting Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.phaseHours.map((ph) => {
                    const override: PhaseOverride | undefined = phaseOverrides[ph.id];
                    const isHypercareLinked = Boolean(override?.startDuringHypercare);

                    return (
                      <tr key={ph.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-none shrink-0" style={{ backgroundColor: ph.color }} />
                            <div>
                              <div className="font-bold text-slate-900">{ph.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{ph.code}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600">
                          {ph.id === 'phase_enablement' ? 'W1 - W2 (2 wks)' : `W${ph.startWeek} - W${ph.endWeek}`}
                        </td>

                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            max={scenario.projectWeeks}
                            value={override?.customStartWeek ?? ph.startWeek}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                handleUpdatePhaseOverride(ph.id, {
                                  customStartWeek: val,
                                  startDuringHypercare: false
                                });
                              }
                            }}
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-sm font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max={scenario.projectWeeks}
                              value={override?.customDurationWeeks ?? ph.durationWeeks}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                  handleUpdatePhaseOverride(ph.id, {
                                    customDurationWeeks: val
                                  });
                                }
                              }}
                              className="w-18 px-2 py-1 bg-white border border-slate-300 rounded-sm font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                            />
                            <span className="text-[10px] text-slate-500">wks</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleStartInHypercare(ph.id)}
                            className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1.5 ${
                              isHypercareLinked
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            <Zap size={11} />
                            <span>
                              {isHypercareLinked ? `Linked to Hypercare (W${data.hypercareStartWeek})` : 'Start in Hypercare'}
                            </span>
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-none">
                            W{ph.startWeek} &ndash; W{ph.endWeek} ({ph.durationWeeks}w)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Governance & Parallel Oversight Notice */}
      <div className="p-4 rounded-sm bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-sm bg-slate-800 text-amber-400 border border-slate-700">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Parallel Program Governance & SteerCo Cadence
            </h5>
            <p className="text-xs text-slate-400 mt-0.5">
              Program Governance runs in parallel continuously (Week 1 &ndash; Week {scenario.projectWeeks}), supervising all stage-gate quality audits, DoA reviews, and cross-wave handoffs regardless of sequencing model.
            </p>
          </div>
        </div>

        <div className="shrink-0 font-mono text-xs font-bold text-amber-400 bg-slate-800 px-3 py-1.5 rounded-none border border-slate-700">
          Parallel: W1 &ndash; W{scenario.projectWeeks} (100% Coverage)
        </div>
      </div>
    </div>
  );
};
