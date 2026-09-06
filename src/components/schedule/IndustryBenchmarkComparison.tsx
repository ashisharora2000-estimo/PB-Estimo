import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
  TrendingDown
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { IMPLEMENTATION_PHASES } from '../../data/oraclePhases';

interface IndustryBenchmarkComparisonProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const IndustryBenchmarkComparison: React.FC<IndustryBenchmarkComparisonProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  const sf = data.scheduleFeasibility;

  const handleApplyIndustryDuration = () => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: sf.industryBenchmarkDurationWeeks
    }));
  };

  const handleApplyCrashDuration = () => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: sf.crashDurationWeeks,
      scheduleModifiers: {
        ...(prev.scheduleModifiers || {
          methodology: 'agile_iterative',
          fastTrackingOverlapPct: 25,
          clientDecisionSLA: 'rapid_3d',
          envReadinessLeadWeeks: 0,
          dataReadinessScore: 1,
          sprintCadenceWeeks: 2
        }),
        fastTrackingOverlapPct: 30,
        methodology: 'agile_iterative',
        clientDecisionSLA: 'rapid_3d'
      }
    }));
  };

  const durationOptions = [
    {
      title: 'Current Project Plan',
      weeks: scenario.projectWeeks,
      subtitle: `${scenario.projectWeeks} Total Delivery Weeks`,
      badge: 'Active Baseline',
      badgeColor: 'bg-slate-900 text-white',
      accent: 'border-slate-900',
      description: 'The actively selected delivery schedule used for resource loading, staffing and Gantt sequencing.'
    },
    {
      title: 'Complexity-Driven Sizing',
      weeks: data.recommendedDurationWeeks,
      subtitle: `Sized for ${scenario.selectedModules.length} Modules & CEMLI Scope`,
      badge: 'Engine Recommended',
      badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300',
      accent: 'border-blue-500',
      description: 'Calculated using exact scale drivers (OIC, Ledgers, COA, Data Objects) and client velocity modifiers.'
    },
    {
      title: 'Industry Standard Benchmark',
      weeks: sf.industryBenchmarkDurationWeeks,
      subtitle: sf.industryBenchmarkLabel,
      badge: 'Oracle True Cloud Standard',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      accent: 'border-emerald-500',
      description: 'Benchmark empirical timeline established by Oracle TCM and Global System Integrators for similar scope tiers.'
    },
    {
      title: 'Crash Limit (Fast-Tracked Min)',
      weeks: sf.crashDurationWeeks,
      subtitle: 'Max Concurrency & Dedicated SMEs',
      badge: 'Maximum Fast-Track',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
      accent: 'border-amber-500',
      description: 'The theoretical minimum compressed duration possible before introducing catastrophic testing quality risks.'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Award size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Empirical Benchmarks & Oracle True Cloud Method (TCM)
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Industry Standard Schedule Duration & Benchmark Sizing
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare active delivery plan against Tier-1 SI benchmark models and Oracle True Cloud Method delivery standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Adopt Industry Standard hidden for proposal customization */}
          {scenario.projectWeeks > sf.crashDurationWeeks && (
            <button
              onClick={handleApplyCrashDuration}
              className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-300 transition"
            >
              <TrendingDown size={14} />
              <span>Apply Crash Schedule ({sf.crashDurationWeeks} Wks)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Card Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {durationOptions.map((opt, idx) => {
          const isSelected = scenario.projectWeeks === opt.weeks;
          return (
            <div
              key={idx}
              className={`p-4 rounded-sm border transition relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-50 border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none ${opt.badgeColor}`}>
                    {opt.badge}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-slate-900" /> Active
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-800">{opt.title}</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {opt.weeks} <span className="text-xs font-sans font-semibold text-slate-500">Weeks</span>
                </div>
                <div className="text-[11px] font-medium text-slate-600 mt-0.5">{opt.subtitle}</div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {!isSelected && (
                <button
                  onClick={() => onUpdateScenario(prev => ({ ...prev, projectWeeks: opt.weeks }))}
                  className="mt-4 w-full py-1.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider border border-slate-300 transition cursor-pointer"
                >
                  Select {opt.weeks} Weeks
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Phase-by-Phase Benchmark Distribution Table */}
      <div className="pt-2">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Lifecycle Phase Duration Comparison (Industry Standard vs Active Model)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Implementation Phase</th>
                <th className="py-2.5 px-3">Standard %</th>
                <th className="py-2.5 px-3">Industry Standard (TCM)</th>
                <th className="py-2.5 px-3">Complexity Sized</th>
                <th className="py-2.5 px-3">Active Plan</th>
                <th className="py-2.5 px-3">Primary Complexity Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.phaseHours.map((ph) => {
                const benchmarkWeeks = sf.industryBenchmarkBreakdown[ph.id] || 4;
                const standardPctMap: Record<string, string> = {
                  phase_enablement: '5% (Mandatory)',
                  phase_design: '20%',
                  phase_build: '32%',
                  phase_test_1: '18%',
                  phase_test_2: '15%',
                  phase_cutover: '5%',
                  phase_hypercare: '5%'
                };

                const driverExplanationMap: Record<string, string> = {
                  phase_enablement: 'Mandatory 2 weeks + Sandbox Ingress lead',
                  phase_design: `${scenario.scaleDrivers.fin_led || 1} Ledgers, ${scenario.scaleDrivers.fin_coa_segments || 4} COA Segments & Decision SLA`,
                  phase_build: `${scenario.scaleDrivers.tech_oic || 0} OIC Integrations, ${scenario.scaleDrivers.tech_paas || 0} PaaS Extensions & Fast Formulas`,
                  phase_test_1: `OIC Integration Density + Data Readiness Score (${scenario.scheduleModifiers?.dataReadinessScore || 2})`,
                  phase_test_2: `${(scenario.scaleDrivers.hcm_hc || 0).toLocaleString()} HC, ${scenario.scaleDrivers.hcm_pay_countries || 0} Countries & Change Resistance`,
                  phase_cutover: `${scenario.scaleDrivers.tech_data_objects || 0} Data Objects & 72-Hour Weekend Window`,
                  phase_hypercare: `${scenario.scaleDrivers.scm_plants || 0} Manufacturing Plants & 1st/2nd Month Close`
                };

                return (
                  <tr key={ph.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: ph.color }} />
                      <span>{ph.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {standardPctMap[ph.id]}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                      {benchmarkWeeks} Weeks
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                      {ph.durationWeeks} Weeks
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {ph.durationWeeks} Weeks
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {driverExplanationMap[ph.id]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
