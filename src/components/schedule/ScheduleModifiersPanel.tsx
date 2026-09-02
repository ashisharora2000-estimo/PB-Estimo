import React from 'react';
import {
  Sliders,
  Zap,
  GitBranch,
  Clock,
  Database,
  Layers,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  ImplementationMethodology,
  ClientDecisionSLA
} from '../../types';

interface ScheduleModifiersPanelProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const ScheduleModifiersPanel: React.FC<ScheduleModifiersPanelProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  const sm = scenario.scheduleModifiers || {
    methodology: 'hybrid_oum',
    fastTrackingOverlapPct: 15,
    clientDecisionSLA: 'standard_5d',
    envReadinessLeadWeeks: 2,
    dataReadinessScore: 2,
    sprintCadenceWeeks: 3
  };

  const updateModifiers = (updater: (prevMod: typeof sm) => typeof sm) => {
    onUpdateScenario(prev => {
      const currentMod = prev.scheduleModifiers || {
        methodology: 'hybrid_oum',
        fastTrackingOverlapPct: 15,
        clientDecisionSLA: 'standard_5d',
        envReadinessLeadWeeks: 2,
        dataReadinessScore: 2,
        sprintCadenceWeeks: 3
      };
      return {
        ...prev,
        scheduleModifiers: updater(currentMod)
      };
    });
  };

  const handleResetToBaseline = () => {
    updateModifiers(() => ({
      methodology: 'hybrid_oum',
      fastTrackingOverlapPct: 15,
      clientDecisionSLA: 'standard_5d',
      envReadinessLeadWeeks: 2,
      dataReadinessScore: 2,
      sprintCadenceWeeks: 3
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
              <Sliders size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Schedule Velocity & Execution Drivers
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Schedule & Velocity Modifier Inputs
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Calibrate delivery methodology, fast-tracking concurrency, client turnaround velocity, and environment/data readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xs border border-slate-200">
            Net Velocity: <strong>{data.scheduleFeasibility.velocityMultiplier.toFixed(2)}x</strong>
          </span>
          <button
            onClick={handleResetToBaseline}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Key Schedule Modifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Modifier 1: Implementation Methodology */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <GitBranch size={14} className="text-blue-600" />
              <span>Delivery Methodology</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              {sm.methodology === 'agile_iterative' ? '+8% Velocity' : sm.methodology === 'waterfall' ? '-12% Velocity' : 'Baseline'}
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              {
                id: 'agile_iterative' as ImplementationMethodology,
                label: 'Oracle True Cloud (Agile-Iterative Sprints)',
                sub: 'Bi-weekly sprint show & tells, early continuous CRPs, 1.08x velocity'
              },
              {
                id: 'hybrid_oum' as ImplementationMethodology,
                label: 'Hybrid OUM (Iterative Design + Waterfall Cutover)',
                sub: 'Standard industry baseline, balanced risk and stage gating'
              },
              {
                id: 'waterfall' as ImplementationMethodology,
                label: 'Classic Phase-Gate Waterfall',
                sub: 'Rigid documentation sign-offs, longer governance lag (-12% velocity)'
              }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => updateModifiers(prev => ({ ...prev, methodology: item.id }))}
                className={`w-full text-left p-2.5 rounded-xs border transition cursor-pointer ${
                  sm.methodology === item.id
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modifier 2: Fast-Tracking & Concurrency Overlap */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-600" />
              <span>Fast-Tracking Stream Overlap</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-xs">
              {sm.fastTrackingOverlapPct}% Concurrency
            </span>
          </div>

          <p className="text-[11px] text-slate-600">
            Overlaps Build sprints with Design sign-offs and SIT cycles to compress critical path duration.
          </p>

          <div className="space-y-2 pt-2">
            <input
              type="range"
              min="0"
              max="35"
              step="5"
              value={sm.fastTrackingOverlapPct}
              onChange={(e) => updateModifiers(prev => ({ ...prev, fastTrackingOverlapPct: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Strict Sequential)</span>
              <span>15% (Standard)</span>
              <span>35% (Aggressive)</span>
            </div>
          </div>

          <div className="p-2 bg-white rounded-xs border border-slate-200 text-[10px] text-slate-600">
            <strong>Schedule Impact:</strong> Compresses overall timeline by approximately <strong>{Math.round(scenario.projectWeeks * (sm.fastTrackingOverlapPct / 100) * 0.30)} weeks</strong>.
          </div>
        </div>

        {/* Modifier 3: Client Decision Turnaround SLA */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-600" />
              <span>Client Decision SLA</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              SteerCo Gating
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              {
                id: 'rapid_3d' as ClientDecisionSLA,
                label: 'Rapid SLA (< 3 Business Days)',
                sub: 'Empowered Product Owners, prevents design freeze bottlenecks (+6% velocity)'
              },
              {
                id: 'standard_5d' as ClientDecisionSLA,
                label: 'Standard SLA (5-7 Business Days)',
                sub: 'Standard committee cadence, manageable stage reviews'
              },
              {
                id: 'delayed_10d' as ClientDecisionSLA,
                label: 'Delayed SLA (> 10 Business Days)',
                sub: 'Multi-layer approval chain, adds 2-4 weeks to design and gates (-12% velocity)'
              }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => updateModifiers(prev => ({ ...prev, clientDecisionSLA: item.id }))}
                className={`w-full text-left p-2.5 rounded-xs border transition cursor-pointer ${
                  sm.clientDecisionSLA === item.id
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modifier 4: Cloud Environment Readiness & Ingress Lead */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-600" />
              <span>Cloud Sandbox Ingress Lead</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              {sm.envReadinessLeadWeeks} Wks Lead
            </span>
          </div>

          <p className="text-[11px] text-slate-600">
            Lead time for Oracle Cloud tenant provisioning, SSO/IDCS federation, and network VPN whitelist.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { weeks: 0, label: 'Day-1 Ready', sub: '0 Wks' },
              { weeks: 2, label: 'Standard Ingress', sub: '+2 Wks' },
              { weeks: 4, label: 'Security Delay', sub: '+4 Wks' }
            ].map(opt => (
              <button
                key={opt.weeks}
                onClick={() => updateModifiers(prev => ({ ...prev, envReadinessLeadWeeks: opt.weeks }))}
                className={`p-2 rounded-xs border text-center transition cursor-pointer ${
                  sm.envReadinessLeadWeeks === opt.weeks
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] text-slate-500">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modifier 5: Legacy Data Cleansing & Mock Readiness */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Database size={14} className="text-purple-600" />
              <span>Data Cleansing & Mock Readiness</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              Score: {sm.dataReadinessScore}/3
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              {
                score: 1 as const,
                label: 'Tier 1: Pre-Cleansed Golden Records',
                sub: 'Pre-validated extractors, optimal mock reconciliation velocity'
              },
              {
                score: 2 as const,
                label: 'Tier 2: In-Flight Cleansing (Standard)',
                sub: 'Standard cleansing during sprints, 3 full mock cycles (+1 wk SIT)'
              },
              {
                score: 3 as const,
                label: 'Tier 3: Severe Legacy Debt & Disparate Sources',
                sub: 'Requires 4 mock cycles + deep field reconciliation (+2.5 wks SIT)'
              }
            ].map(item => (
              <button
                key={item.score}
                onClick={() => updateModifiers(prev => ({ ...prev, dataReadinessScore: item.score }))}
                className={`w-full text-left p-2 rounded-xs border transition cursor-pointer ${
                  sm.dataReadinessScore === item.score
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modifier 6: Sprint Cadence */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock size={14} className="text-rose-600" />
              <span>Sprint Iteration Cadence</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              {sm.sprintCadenceWeeks}-Week Cycles
            </span>
          </div>

          <p className="text-[11px] text-slate-600">
            Length of continuous build sprints and CRP feedback loops. Shorter cycles increase agility.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { weeks: 2 as const, label: '2 Weeks', sub: 'High Agility' },
              { weeks: 3 as const, label: '3 Weeks', sub: 'Balanced' },
              { weeks: 4 as const, label: '4 Weeks', sub: 'Enterprise' }
            ].map(opt => (
              <button
                key={opt.weeks}
                onClick={() => updateModifiers(prev => ({ ...prev, sprintCadenceWeeks: opt.weeks }))}
                className={`p-2.5 rounded-xs border text-center transition cursor-pointer ${
                  sm.sprintCadenceWeeks === opt.weeks
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] text-slate-500">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
