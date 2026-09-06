import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Calculator,
  ShieldAlert,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';

interface ScheduleStaffingCapacityCardProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  compact?: boolean;
}

export const ScheduleStaffingCapacityCard: React.FC<ScheduleStaffingCapacityCardProps> = ({
  scenario,
  data,
  onUpdateScenario,
  compact = false
}) => {
  const [targetCapHeadcount, setTargetCapHeadcount] = useState<number>(
    Math.round((data.avgTotalFTE || (data.targetHours / Math.max(1, scenario.projectWeeks * 40))) * 10) / 10 || 10
  );
  const [activeViewMode, setActiveViewMode] = useState<'equation' | 'sensitivity' | 'phase_ramp'>('equation');

  const totalHours = Math.round(data.targetHours || 0);
  const currentWeeks = Math.max(16, scenario.projectWeeks || 32);
  const recWeeks = data.recommendedDurationWeeks || 32;
  const crashWeeks = data.scheduleFeasibility.crashDurationWeeks || Math.max(16, Math.round(recWeeks * 0.75));
  const benchWeeks = data.scheduleFeasibility.industryBenchmarkDurationWeeks || 36;
  const blendedRate = Math.round(data.blendedBillRate || 145);

  // Exact staffing calculations
  const totalCapacityPerFTE = currentWeeks * 40; // 40h standard work week
  const avgFTE = totalHours > 0 ? totalHours / totalCapacityPerFTE : 0;
  
  // Concurrency factor (Oracle TCM beta curve: peak is ~1.35x - 1.45x average during Build & SIT)
  const peakFTE = totalHours > 0 ? (data.peakFTE || avgFTE * 1.36) : 0;
  const weeklyHoursBurn = totalHours > 0 ? totalHours / currentWeeks : 0;
  const weeklyCostBurn = weeklyHoursBurn * blendedRate;

  // Reverse calculation: Given a capped squad size, what is the minimum required timeline?
  const calculatedDurationForCap = targetCapHeadcount > 0 && totalHours > 0
    ? Math.max(16, Math.round(totalHours / (targetCapHeadcount * 40)))
    : recWeeks;

  // Quick week updater
  const handleSetWeeks = (weeks: number) => {
    const clamped = Math.max(16, Math.min(104, Math.round(weeks)));
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: clamped
    }));
  };

  // 5 sensitivity scenarios for trade-off evaluation
  const sensitivityScenarios = [
    {
      id: 'compressed',
      name: 'Hyper-Compressed (Crash)',
      weeks: crashWeeks,
      label: 'Fast-Tracked Floor',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      risk: 'High Concurrency / Brooks\' Law Risk'
    },
    {
      id: 'accelerated',
      name: 'Accelerated Stream',
      weeks: Math.round((crashWeeks + recWeeks) / 2),
      label: 'Overlapping Gates',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      risk: 'Moderate Risk (Requires Senior SMEs)'
    },
    {
      id: 'recommended',
      name: 'Recommended Defensible',
      weeks: recWeeks,
      label: 'Sized by Scope & Scale',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      risk: 'Optimal Sizing (Balanced Run-Rate)'
    },
    {
      id: 'buffered',
      name: 'Buffered Lifecycle',
      weeks: recWeeks + 4,
      label: 'Contingency +4 Weeks',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      risk: 'Low Risk (Safe Change Adoption)'
    }
    // Industry Benchmark scenario hidden for tailored proposal workflows
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-sm bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
            <Calculator size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Schedule Generation & Staffing Capacity Model
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                Scientific Resource Sizing
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Mathematically links required scope hours to calendar timeline weeks and required squad headcount (40h/wk standard capacity), taking into account peak build concurrency.
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveViewMode('equation')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'equation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calculator size={13} />
            <span>Core Formula</span>
          </button>
          <button
            onClick={() => setActiveViewMode('sensitivity')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'sensitivity'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Sliders size={13} />
            <span>Sensitivity Matrix</span>
          </button>
          <button
            onClick={() => setActiveViewMode('phase_ramp')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'phase_ramp'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <TrendingUp size={13} />
            <span>Phase Ramp Curve</span>
          </button>
        </div>
      </div>

      {/* Primary Mathematical Formula & Capacity Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sized Effort */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Total Scope Effort</span>
            <Clock size={14} className="text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalHours.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">hours</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {Math.round(data.targetPersonMonths || totalHours / 160)} Person-Months (160h/mo)
          </div>
        </div>

        {/* Metric 2: Active Timeline & Direct Controls */}
        <div className="p-4 rounded-sm bg-indigo-50/70 border border-indigo-200 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-indigo-700">
            <span>Active Project Schedule</span>
            <Calendar size={14} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-indigo-950">
              {currentWeeks} <span className="text-xs font-sans text-indigo-700 font-semibold">weeks</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-800">
              ~{Math.round(currentWeeks / 4.33)} months
            </span>
          </div>

          {/* Inline Quick Steppers */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-indigo-200/60">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSetWeeks(currentWeeks - 4)}
                className="px-1.5 py-0.5 rounded-xs bg-white text-indigo-900 border border-indigo-300 hover:bg-indigo-100 text-[10px] font-bold cursor-pointer transition"
                title="Shorten by 4 weeks"
              >
                -4w
              </button>
              <button
                onClick={() => handleSetWeeks(currentWeeks - 1)}
                className="px-1.5 py-0.5 rounded-xs bg-white text-indigo-900 border border-indigo-300 hover:bg-indigo-100 text-[10px] font-bold cursor-pointer transition"
                title="Shorten by 1 week"
              >
                -1w
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSetWeeks(currentWeeks + 1)}
                className="px-1.5 py-0.5 rounded-xs bg-white text-indigo-900 border border-indigo-300 hover:bg-indigo-100 text-[10px] font-bold cursor-pointer transition"
                title="Extend by 1 week"
              >
                +1w
              </button>
              <button
                onClick={() => handleSetWeeks(currentWeeks + 4)}
                className="px-1.5 py-0.5 rounded-xs bg-white text-indigo-900 border border-indigo-300 hover:bg-indigo-100 text-[10px] font-bold cursor-pointer transition"
                title="Extend by 4 weeks"
              >
                +4w
              </button>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Squad Size */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Average Squad Headcount</span>
            <Users size={14} className="text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {avgFTE.toFixed(1)} <span className="text-xs font-sans text-slate-500 font-normal">FTEs</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>{Math.round(weeklyHoursBurn)} hrs/week burn</span>
            <span className="font-mono text-slate-700 font-semibold">${Math.round(weeklyCostBurn / 1000)}k/wk</span>
          </div>
        </div>

        {/* Metric 4: Peak Concurrency Headcount */}
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Peak Build Concurrency</span>
            <TrendingUp size={14} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {peakFTE.toFixed(1)} <span className="text-xs font-sans text-slate-500 font-normal">FTEs</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            1.36x Peak Multiplier (Build & SIT Phase)
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: THE CORE FORMULA & REVERSE SIZING ENGINE */}
      {activeViewMode === 'equation' && (
        <div className="space-y-4">
          {/* Mathematical Equation Presentation Box */}
          <div className="p-4.5 rounded-sm bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Calculator size={14} />
                Oracle Delivery Staffing Generation Formula
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Standard Work Capacity: 40.0 Hours / Week per FTE
              </span>
            </div>

            {/* Formula visualization */}
            <div className="flex flex-col md:flex-row md:items-center justify-around gap-4 py-2 font-mono text-center">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Required Avg Team</div>
                <div className="text-2xl font-bold text-amber-400">{avgFTE.toFixed(1)} FTE</div>
              </div>

              <div className="text-2xl text-slate-500 font-bold hidden md:block">=</div>

              <div className="flex flex-col items-center">
                <div className="text-sm font-bold text-slate-200 pb-1 border-b border-slate-600 px-4">
                  Total Scope Effort: <span className="text-white font-bold">{totalHours.toLocaleString()} Hours</span>
                </div>
                <div className="text-sm font-bold text-slate-300 pt-1 px-4">
                  Project Duration: <span className="text-white font-bold">{currentWeeks} Weeks</span> &times; Capacity: <span className="text-white font-bold">40 Hours/Wk</span>
                </div>
              </div>

              <div className="text-2xl text-slate-500 font-bold hidden md:block">&rarr;</div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Absorbed Capacity</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {(Math.round(currentWeeks * avgFTE * 40)).toLocaleString()} <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                💡 <strong>Project Manager Rule:</strong> Compressing timeline by 4 weeks increases average team size to{' '}
                <strong className="text-white">
                  {(totalHours / Math.max(1, (currentWeeks - 4) * 40)).toFixed(1)} FTEs (+{Math.round(((totalHours / ((currentWeeks - 4) * 40) - avgFTE) / avgFTE) * 100)}% headcount)
                </strong>.
              </span>
              {currentWeeks !== recWeeks && (
                <button
                  onClick={() => handleSetWeeks(recWeeks)}
                  className="px-2.5 py-1 rounded-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] cursor-pointer transition shrink-0 uppercase tracking-wider"
                >
                  ⚡ Align to Recommended ({recWeeks}w)
                </button>
              )}
            </div>
          </div>

          {/* Quick Schedule Presets Toolbar */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Direct Schedule Sizing Presets:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any preset to instantly re-calculate staffing
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sensitivityScenarios.map((sc) => {
                const isCurrent = currentWeeks === sc.weeks;
                const scAvgFte = (totalHours / (sc.weeks * 40)).toFixed(1);

                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSetWeeks(sc.weeks)}
                    className={`px-3 py-2 rounded-xs border text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>{sc.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-2xs font-mono text-[10px] ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {sc.weeks} Wks &bull; {scAvgFte} FTE
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reverse Sizing: Client Headcount Cap Calculator */}
          <div className="p-4 rounded-sm bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Users size={14} className="text-blue-700" />
                  Client Capped Headcount &rarr; Required Schedule Derivation
                </span>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  If the client or delivery partner caps your squad size, compute the exact calendar duration required to deliver the {totalHours.toLocaleString()} scope hours.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-blue-900">Cap Squad:</span>
                <input
                  type="number"
                  min={3}
                  max={50}
                  step={0.5}
                  value={targetCapHeadcount}
                  onChange={(e) => setTargetCapHeadcount(Math.max(3, parseFloat(e.target.value) || 3))}
                  className="w-20 bg-white border border-blue-300 text-xs font-bold text-slate-900 px-2 py-1 rounded-xs font-mono text-center focus:outline-none focus:border-blue-600"
                />
                <span className="text-xs font-bold text-blue-900 font-mono">FTEs</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-blue-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Mathematically Required Minimum Timeline:
                </span>
                <div className="text-base font-bold text-blue-950 font-mono">
                  {calculatedDurationForCap} Weeks ({Math.round(calculatedDurationForCap / 4.33)} Months)
                  <span className="text-xs font-normal text-slate-600 ml-2">
                    &bull; Weekly capacity = {Math.round(targetCapHeadcount * 40)} hrs/wk
                  </span>
                </div>
              </div>

              {calculatedDurationForCap !== currentWeeks && (
                <button
                  onClick={() => handleSetWeeks(calculatedDurationForCap)}
                  className="px-3 py-1.5 rounded-xs bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-xs shrink-0"
                >
                  <ArrowRight size={13} />
                  <span>Adopt {calculatedDurationForCap} Wks Timeline</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SENSITIVITY & TRADE-OFF MATRIX */}
      {activeViewMode === 'sensitivity' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-600">
            Compare how compressing or expanding the timeline impacts average headcount, peak build staffing, weekly financial run-rate, and Brooks&apos; Law concurrency risks.
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Timeline Scenario</th>
                  <th className="py-2.5 px-3 text-center">Duration</th>
                  <th className="py-2.5 px-3 text-right">Avg Squad</th>
                  <th className="py-2.5 px-3 text-right">Peak Squad</th>
                  <th className="py-2.5 px-3 text-right">Weekly Burn</th>
                  <th className="py-2.5 px-3">Delivery Feasibility Risk</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sensitivityScenarios.map((sc) => {
                  const isSelected = currentWeeks === sc.weeks;
                  const scAvgFte = totalHours / (sc.weeks * 40);
                  const scPeakFte = scAvgFte * 1.36;
                  const scWeeklyBurn = (totalHours / sc.weeks) * blendedRate;

                  return (
                    <tr
                      key={sc.id}
                      className={`transition ${isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                          <div>
                            <div>{sc.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{sc.label}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {sc.weeks} Wks
                        <div className="text-[10px] text-slate-400 font-normal">~{Math.round(sc.weeks / 4.33)} mo</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {scAvgFte.toFixed(1)} FTE
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {scPeakFte.toFixed(1)} FTE
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ${Math.round(scWeeklyBurn / 1000)}k/wk
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${sc.color}`}>
                          {sc.risk}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isSelected ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded-xs">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetWeeks(sc.weeks)}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xs cursor-pointer transition"
                          >
                            Adopt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: PHASE-BY-PHASE STAFFING RAMP CURVE */}
      {activeViewMode === 'phase_ramp' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            Effort in Oracle implementations is non-linear. The staffing model ramps up through Enterprise Design, peaks in Build & SIT, and tapers during Cutover and Hypercare AMS handover.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-1">
            {data.phaseHours.map((ph) => {
              const phDuration = Math.max(1, ph.endWeek - ph.startWeek + 1);
              const phFte = phDuration > 0 ? ph.hours / (phDuration * 40) : 0;
              const isPeak = ph.id === 'phase_build' || ph.id === 'phase_test_1';

              return (
                <div
                  key={ph.id}
                  className={`p-3 rounded-sm border space-y-2 flex flex-col justify-between transition ${
                    isPeak ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 truncate">
                      <span className="w-2.5 h-2.5 rounded-none shrink-0" style={{ backgroundColor: ph.color }} />
                      <span className="text-xs font-bold text-slate-900 truncate" title={ph.name}>
                        {ph.code || ph.name}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      W{ph.startWeek} &ndash; W{ph.endWeek} ({phDuration}w)
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {phFte.toFixed(1)} <span className="text-[10px] font-sans font-normal text-slate-500">FTE</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {Math.round(ph.hours).toLocaleString()} hrs
                    </div>
                    {isPeak && (
                      <span className="mt-1 inline-block text-[8px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-1 py-0.2 rounded-2xs">
                        Peak Ramp
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
