import React, { useState } from 'react';
import {
  PhaseStaffingMixRule,
  WorkstreamStaffingMixRule,
  RoleRateCardItem,
  calculateMasterBlendedRate
} from '../../data/benchmarkMasterData';
import {
  CalendarDays,
  Layers,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';

interface PhaseWorkstreamTabProps {
  phaseRules: PhaseStaffingMixRule[];
  workstreamRules: WorkstreamStaffingMixRule[];
  roleRateCards: RoleRateCardItem[];
  onUpdatePhaseRule: (phaseId: string, field: keyof PhaseStaffingMixRule, value: any) => void;
  onUpdateWorkstreamRule: (wsId: string, field: keyof WorkstreamStaffingMixRule, value: any) => void;
  targetHours: number;
}

export const PhaseWorkstreamTab: React.FC<PhaseWorkstreamTabProps> = ({
  phaseRules,
  workstreamRules,
  roleRateCards,
  onUpdatePhaseRule,
  onUpdateWorkstreamRule,
  targetHours
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'phases' | 'workstreams'>('phases');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-navigation switcher */}
      <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <GitBranch size={17} className="text-indigo-600" />
            Phase & Workstream Staffing Mix Overrides
          </h3>
          <p className="text-xs text-slate-500">
            Define specialized location mixes and staffing factory leverage for individual lifecycle phases and functional tracks.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-sm border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('phases')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'phases'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays size={14} />
            Lifecycle Phases ({phaseRules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('workstreams')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'workstreams'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            Technical Workstreams ({workstreamRules.length})
          </button>
        </div>
      </div>

      {/* 1. Lifecycle Phases Table */}
      {activeSubTab === 'phases' && (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Phase-by-Phase Staffing Calibration & Blended Rate Impacts
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Wave 0 Inception &rarr; Cutover &rarr; Hypercare
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3">Lifecycle Phase</th>
                  <th className="py-2.5 px-2 text-center bg-blue-50/50">Onshore %</th>
                  <th className="py-2.5 px-2 text-center bg-emerald-50/50">Nearshore %</th>
                  <th className="py-2.5 px-2 text-center bg-amber-50/50">Offshore %</th>
                  <th className="py-2.5 px-2 text-right">Phase Blended Rate</th>
                  <th className="py-2.5 px-3">Seniority Emphasis</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Benchmark Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {phaseRules.map(p => {
                  const phaseBlended = calculateMasterBlendedRate(
                    1000,
                    { onshore: p.defaultOnshorePct, nearshore: p.defaultNearshorePct, offshore: p.defaultOffshorePct },
                    roleRateCards
                  );

                  return (
                    <tr key={p.phaseId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900 align-top">
                        {p.phaseName}
                      </td>

                      <td className="py-3 px-2 align-top text-center bg-blue-50/20 font-mono">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={p.defaultOnshorePct}
                            onChange={e => onUpdatePhaseRule(p.phaseId, 'defaultOnshorePct', Number(e.target.value))}
                            className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-white border border-blue-300 rounded-xs focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-slate-400 text-[11px]">%</span>
                        </div>
                      </td>

                      <td className="py-3 px-2 align-top text-center bg-emerald-50/20 font-mono">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={p.defaultNearshorePct}
                            onChange={e => onUpdatePhaseRule(p.phaseId, 'defaultNearshorePct', Number(e.target.value))}
                            className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-white border border-emerald-300 rounded-xs focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-slate-400 text-[11px]">%</span>
                        </div>
                      </td>

                      <td className="py-3 px-2 align-top text-center bg-amber-50/20 font-mono">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={p.defaultOffshorePct}
                            onChange={e => onUpdatePhaseRule(p.phaseId, 'defaultOffshorePct', Number(e.target.value))}
                            className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-white border border-amber-300 rounded-xs focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-slate-400 text-[11px]">%</span>
                        </div>
                      </td>

                      <td className="py-3 px-2 align-top text-right font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-800 border border-slate-200">
                          ${phaseBlended.blendedBillRate.toFixed(2)}/hr
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-slate-700 font-medium">
                        {p.seniorityEmphasis}
                      </td>

                      <td className="py-3 px-3 align-top text-slate-500 text-[11px] leading-snug">
                        {p.rationale}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Technical Workstreams Table */}
      {activeSubTab === 'workstreams' && (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Workstream Factory Leverage Ratios & Typical Role Compositions
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Functional, Technical, Data, QA, OCM, Management
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3">Workstream Name</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-center bg-blue-50/50">Onshore %</th>
                  <th className="py-2.5 px-2 text-center bg-emerald-50/50">Nearshore %</th>
                  <th className="py-2.5 px-2 text-center bg-amber-50/50">Offshore %</th>
                  <th className="py-2.5 px-2 text-center">Factory Leverage</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Typical Team Role Mix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workstreamRules.map(ws => (
                  <tr key={ws.workstreamId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 align-top">
                      {ws.workstreamName}
                    </td>

                    <td className="py-3 px-2 align-top">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {ws.category}
                      </span>
                    </td>

                    <td className="py-3 px-2 align-top text-center bg-blue-50/20 font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={ws.defaultOnshorePct}
                          onChange={e => onUpdateWorkstreamRule(ws.workstreamId, 'defaultOnshorePct', Number(e.target.value))}
                          className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-white border border-blue-300 rounded-xs focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 align-top text-center bg-emerald-50/20 font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={ws.defaultNearshorePct}
                          onChange={e => onUpdateWorkstreamRule(ws.workstreamId, 'defaultNearshorePct', Number(e.target.value))}
                          className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-white border border-emerald-300 rounded-xs focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 align-top text-center bg-amber-50/20 font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={ws.defaultOffshorePct}
                          onChange={e => onUpdateWorkstreamRule(ws.workstreamId, 'defaultOffshorePct', Number(e.target.value))}
                          className="w-12 px-1 py-0.5 text-center font-mono font-bold bg-white border border-amber-300 rounded-xs focus:ring-1 focus:ring-amber-500"
                        />
                        <span className="text-slate-400 text-[11px]">%</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 align-top text-center">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                        ws.factoryLeveragePotential === 'High'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : ws.factoryLeveragePotential === 'Medium'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {ws.factoryLeveragePotential} Leverage
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top text-slate-700 text-[11px]">
                      {ws.typicalRoleMix}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
