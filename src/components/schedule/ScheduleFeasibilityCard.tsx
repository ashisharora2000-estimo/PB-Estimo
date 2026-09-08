import React from 'react';
import {
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  TrendingDown,
  Sparkles,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';

interface ScheduleFeasibilityCardProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const ScheduleFeasibilityCard: React.FC<ScheduleFeasibilityCardProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  const sf = data.scheduleFeasibility;

  const handleModeChange = (mode: 'forward' | 'backward') => {
    onUpdateScenario(prev => ({
      ...prev,
      schedulingMode: mode
    }));
  };

  const handleGoLiveDateChange = (dateStr: string) => {
    onUpdateScenario(prev => ({
      ...prev,
      clientTargetGoLiveDate: dateStr
    }));
  };

  const handleQuickQuarter = (quarterDate: string) => {
    onUpdateScenario(prev => ({
      ...prev,
      clientTargetGoLiveDate: quarterDate
    }));
  };

  const handleAdoptBackdatedKickoff = () => {
    onUpdateScenario(prev => ({
      ...prev,
      targetStartDate: sf.requiredKickoffDate
    }));
  };

  const handleAdoptRecommendedDuration = () => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: data.recommendedDurationWeeks
    }));
  };

  const handleApplyFastTracking = () => {
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
        fastTrackingOverlapPct: 25
      }
    }));
  };

  // Pre-calculated quarter target dates
  const currentYear = new Date().getFullYear();
  const quarterOptions = [
    { label: `Q1 ${currentYear + 1}`, date: `${currentYear + 1}-03-31` },
    { label: `Q2 ${currentYear + 1}`, date: `${currentYear + 1}-06-30` },
    { label: `Q3 ${currentYear + 1}`, date: `${currentYear + 1}-09-30` },
    { label: `Q4 ${currentYear + 1}`, date: `${currentYear + 1}-12-15` },
    { label: `Q1 ${currentYear + 2}`, date: `${currentYear + 2}-03-31` },
    { label: `Q2 ${currentYear + 2}`, date: `${currentYear + 2}-06-30` }
  ];

  const getFeasibilityBadge = () => {
    switch (sf.feasibilityRating) {
      case 'Optimal':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          indicator: 'bg-emerald-500',
          label: 'Optimal Feasibility (+ Buffer)'
        };
      case 'Manageable':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          indicator: 'bg-blue-500',
          label: 'Manageable with Fast-Tracking'
        };
      case 'Aggressive':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          indicator: 'bg-amber-500',
          label: 'Aggressive Timeline (High Compression)'
        };
      case 'Critical Deficit':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-300',
          indicator: 'bg-rose-500',
          label: 'Critical Schedule Deficit'
        };
    }
  };

  const badge = getFeasibilityBadge();

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
      {/* Top Header: Mode Selector & Feasibility Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-slate-900 text-white shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Client Target Go-Live & Back-Date Planning Engine
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border flex items-center gap-1.5 ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.indicator}`} />
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Anchor the project timeline to the executive Go-Live date or compute forward from planned kickoff.
            </p>
          </div>
        </div>

        {/* Scheduling Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 shrink-0">
          <button
            onClick={() => handleModeChange('backward')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              sf.schedulingMode === 'backward'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <RotateCcw size={13} />
            <span>Back-Date (Go-Live Driven)</span>
          </button>
          <button
            onClick={() => handleModeChange('forward')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer flex items-center gap-1.5 ${
              sf.schedulingMode === 'forward'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ArrowRight size={13} />
            <span>Forward (Kickoff Driven)</span>
          </button>
        </div>
      </div>

      {/* Inputs & Date Alignment Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Input 1: Client Target Go-Live Date */}
        <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Client Ask Go-Live Date
            </span>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 border border-blue-200">
              Anchor
            </span>
          </div>
          <input
            type="date"
            value={sf.clientTargetGoLiveDate}
            onChange={(e) => handleGoLiveDateChange(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-900 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-slate-900"
          />
          {/* Quick Quarter Buttons */}
          <div className="flex items-center gap-1 flex-wrap pt-1">
            {quarterOptions.map(q => (
              <button
                key={q.label}
                onClick={() => handleQuickQuarter(q.date)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs transition cursor-pointer border ${
                  sf.clientTargetGoLiveDate === q.date
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output 1: Required Kickoff Date (Back-Calculated) */}
        <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Required Kickoff (Back-Dated)
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              - {Math.round(scenario.projectWeeks * 0.90)} Wks
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono pt-1">
            {new Date(sf.requiredKickoffDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          {scenario.targetStartDate !== sf.requiredKickoffDate && (
            <button
              onClick={handleAdoptBackdatedKickoff}
              className="w-full text-[10px] font-bold uppercase tracking-wider py-1 rounded-xs bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw size={11} />
              <span>Adopt Kickoff Date</span>
            </button>
          )}
        </div>

        {/* Output 2: Calculated Go-Live Date (From Target Kickoff) */}
        <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Calculated Go-Live Date
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              W{data.goLiveWeek}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono pt-1">
            {new Date(sf.calculatedGoLiveDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-[10px] text-slate-500">
            Based on {scenario.projectWeeks}-week scope & kickoff {new Date(scenario.targetStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Output 3: Schedule Variance & Compression Gauge */}
        <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Schedule Variance
            </span>
            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-xs ${
              sf.varianceWeeks >= 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {sf.varianceWeeks >= 0 ? `+${sf.varianceWeeks} Wks Buffer` : `${sf.varianceWeeks} Wks Deficit`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {sf.compressionPct > 0 ? `${sf.compressionPct}%` : '0%'}
            </span>
            <span className="text-xs text-slate-500">
              {sf.compressionPct > 0 ? 'compression required' : 'uncompressed timeline'}
            </span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                sf.compressionPct > 25
                  ? 'bg-rose-500'
                  : sf.compressionPct > 10
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, 100 - sf.compressionPct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* SteerCo Recommendations & Quick Alignment Actions Strip */}
      <div className="p-4 rounded-sm bg-slate-900 text-white space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Executive Schedule Alignment Advisory
              </div>
              <div className="text-xs text-slate-300 mt-0.5 space-y-1">
                {sf.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {scenario.projectWeeks !== data.recommendedDurationWeeks && (
              <button
                onClick={handleAdoptRecommendedDuration}
                className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <Zap size={13} />
                <span>Adopt Complexity Sizing ({data.recommendedDurationWeeks} Wks)</span>
              </button>
            )}
            {/* Industry Standard button hidden for customized proposal workflow */}
            {sf.varianceWeeks < 0 && (scenario.scheduleModifiers?.fastTrackingOverlapPct || 15) < 25 && (
              <button
                onClick={handleApplyFastTracking}
                className="px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <TrendingDown size={13} />
                <span>Fast-Track Schedule (25% Overlap)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
