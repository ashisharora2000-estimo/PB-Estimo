import React from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { ProjectScenario } from '../../types';
import { PRESET_SCENARIOS } from '../../data/templates';
import { calculateProjectMetrics } from '../../utils/calculator';

interface ScenarioCompareModalProps {
  currentScenario: ProjectScenario;
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (s: ProjectScenario) => void;
}

export const ScenarioCompareModal: React.FC<ScenarioCompareModalProps> = ({
  currentScenario,
  isOpen,
  onClose,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  // Calculate metrics for all scenarios
  const scenariosWithData = [
    { ...currentScenario, name: `${currentScenario.name} (Active)` },
    ...PRESET_SCENARIOS.filter(s => s.id !== currentScenario.id)
  ].map(s => ({
    scenario: s,
    data: calculateProjectMetrics(s)
  }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-sm max-w-6xl w-full max-h-[90vh] flex flex-col shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Enterprise Scenario Benchmarking Matrix
              </h2>
              <p className="text-xs text-slate-600">
                Compare delivery timelines, staffing effort, and governance tiers across implementation archetypes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ minWidth: '800px' }}>
            {scenariosWithData.map(({ scenario, data }) => {
              const isCurrent = scenario.id === currentScenario.id;

              return (
                <div
                  key={scenario.id}
                  className={`p-5 rounded-sm border flex flex-col justify-between space-y-4 transition ${
                    isCurrent
                      ? 'bg-slate-50 border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none ${
                        isCurrent
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isCurrent ? 'Active Plan' : 'Preset Blueprint'}
                      </span>
                      <span className={`text-[11px] font-bold ${data.doaColor}`}>
                        Tier {data.doaTier}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-2">
                      {scenario.name}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Vitals */}
                  <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Duration:</span>
                      <strong className="text-slate-900 font-mono font-bold">{scenario.projectWeeks} wks</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Defensible Effort:</span>
                      <strong className="text-slate-900 font-mono font-bold">{(Math.round(data.targetHours || 0)).toLocaleString()} hrs</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Staffing Footprint:</span>
                      <strong className="text-slate-900 font-mono font-bold">{Math.round(data.targetPersonMonths)} Person-Months</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Peak Concurrency:</span>
                      <strong className="text-blue-700 font-mono font-bold">
                        {data.totalFTE.toFixed(1)} FTEs
                      </strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Complexity:</span>
                      <strong className="text-slate-900 font-mono font-bold">{data.weightedComplexityScore.toFixed(0)} / 100</strong>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Delivery Mix:</span>
                      <span className="text-slate-700 font-mono text-[10px]">
                        {scenario.deliveryMix.onshore}% On / {scenario.deliveryMix.offshore}% Off
                      </span>
                    </div>
                  </div>

                  {!isCurrent ? (
                    <button
                      onClick={() => {
                        onSelectScenario(scenario);
                        onClose();
                      }}
                      className="w-full py-2 px-3 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Load Scenario</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className="py-2 text-center text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      <span>Currently Loaded</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
