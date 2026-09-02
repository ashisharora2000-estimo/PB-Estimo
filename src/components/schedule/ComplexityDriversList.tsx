import React from 'react';
import {
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info,
  Sliders,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';

interface ComplexityDriversListProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
}

export const ComplexityDriversList: React.FC<ComplexityDriversListProps> = ({
  scenario,
  data
}) => {
  const sf = data.scheduleFeasibility;

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
              <Cpu size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Complexity Sizing Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Complexity-Driven Schedule Impact Breakdown
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent mathematical justification explaining the exact week additions and fast-tracking savings across lifecycle phases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xs border border-slate-200">
            Base Core Lifecycle: <strong>{data.recommendedDurationWeeks} Weeks</strong>
          </span>
        </div>
      </div>

      {/* Grid of Complexity Breakdown Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sf.complexityDriversBreakdown.map((driver, idx) => {
          const isReduction = driver.impactWeeks < 0;
          return (
            <div
              key={idx}
              className={`p-4 rounded-sm border flex flex-col justify-between ${
                isReduction
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {driver.name}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xs shrink-0 flex items-center gap-0.5 ${
                      isReduction
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {isReduction ? (
                      <>
                        <TrendingDown size={12} />
                        <span>{driver.impactWeeks} Wks</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight size={12} />
                        <span>+{driver.impactWeeks} Wks</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  {driver.rationale}
                </p>
              </div>
            </div>
          );
        })}

        {/* Module Scope Sizing Factor */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-900 truncate">
                Active Module Breadth ({scenario.selectedModules.length} Modules)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-900 text-white shrink-0">
                Core Baseline
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
              Core module baseline spans {scenario.selectedModules.join(', ')} requiring coordinated Design, Build & SIT tracks.
            </p>
          </div>
        </div>

        {/* Multi-Wave Rollout Expansion */}
        {scenario.rolloutWaves > 1 && (
          <div className="p-4 rounded-sm bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-blue-950 truncate">
                  Multi-Wave Phased Deployment ({scenario.rolloutWaves} Waves)
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-blue-900 text-white shrink-0">
                  +{(scenario.rolloutWaves - 1) * Math.max(6, 12 - scenario.rolloutOverlapWeeks)} Wks
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                Sequencing {scenario.rolloutWaves} deployment waves with {scenario.rolloutOverlapWeeks}-week overlap between consecutive waves.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rollout Questionnaire Dimensional Impact for Leadership */}
      {data.rolloutComplexityBreakdown && data.rolloutComplexityBreakdown.length > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Enterprise Rollout Strategy Questionnaire Lineage (12 Scoping Dimensions)
              </h4>
              <p className="text-[11px] text-slate-500">
                Score: {data.rolloutComplexityScore}% Friction | Net Schedule Delta: {data.rolloutScheduleImpactWeeks > 0 ? `+${data.rolloutScheduleImpactWeeks.toFixed(1)}` : data.rolloutScheduleImpactWeeks.toFixed(1)} Weeks | Scoping Effort: +{(data?.rolloutScopingHours || 0).toLocaleString()} Hours
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
              Avg Score {data.rolloutAvgScore} / 4.0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2 px-3">Dimension</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Selected Architecture</th>
                  <th className="py-2 px-3 text-center">Score</th>
                  <th className="py-2 px-3 text-right">Schedule Impact</th>
                  <th className="py-2 px-3 text-right">Scoping Effort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.rolloutComplexityBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{item.title}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">{item.selectedOptionLabel}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">{item.score}/4</td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${
                      item.scheduleWeeks > 0 ? 'text-amber-700' : item.scheduleWeeks < 0 ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      {item.scheduleWeeks > 0 ? `+${item.scheduleWeeks.toFixed(1)} wks` : item.scheduleWeeks < 0 ? `${item.scheduleWeeks.toFixed(1)} wks` : '0 wks'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                      {item.hours > 0 ? `+${item.hours} hrs` : '0 hrs'}
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
