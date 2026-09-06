import React from 'react';
import {
  Sparkles,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Plus,
  Presentation,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';

interface ExecutiveDealBannerProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onSelectTab?: (tab: any) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenNewProposal?: () => void;
  onOpenSlideDeck?: () => void;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onSaveScenario?: () => void;
  onResetDefaults?: () => void;
  lastSavedTimestamp?: string | null;
}

export const ExecutiveDealBanner: React.FC<ExecutiveDealBannerProps> = ({
  scenario,
  data,
  onSelectTab,
  onNavigateTab,
  onOpenNewProposal,
  onOpenSlideDeck,
  onUpdateScenario,
  onSaveScenario,
  onResetDefaults,
  lastSavedTimestamp
}) => {
  const [justSaved, setJustSaved] = React.useState(false);

  const handleTriggerSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveScenario) {
      onSaveScenario();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  };
  const handleNav = onSelectTab || onNavigateTab;
  const totalDays = Math.round((data.targetHours || 0) / 8);
  const totalHours = Math.round(data.targetHours || 0);
  const durationWeeks = typeof scenario.projectWeeks === 'number'
    ? scenario.projectWeeks
    : (typeof data.recommendedDurationWeeks === 'number' ? data.recommendedDurationWeeks : 32);
  const blendedRate = Math.round(data.blendedBillRate || 145);
  const estimatedTcv = data.deliveryRevenue || (totalHours * blendedRate);
  const goLiveDate = scenario.clientTargetGoLiveDate || 'Q3 2026';
  const thorId = scenario.thorId || 'N/A';
  const peakFte = typeof data.peakFTE === 'number'
    ? data.peakFTE
    : (totalHours > 0 && durationWeeks > 0 ? (totalHours / (durationWeeks * 40)) * 1.3 : 0);
  const avgFte = data.avgTotalFTE ?? (durationWeeks > 0 ? totalHours / (durationWeeks * 40) : 0);
  const isOutOfSyncWithRecommended = typeof data.recommendedDurationWeeks === 'number' && durationWeeks !== data.recommendedDurationWeeks;

  const handleAdjustWeeks = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateScenario) return;
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: Math.max(16, Math.min(104, (prev.projectWeeks || 32) + delta))
    }));
  };

  const handleSyncToRecommended = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateScenario || !data.recommendedDurationWeeks) return;
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: data.recommendedDurationWeeks
    }));
  };

  // Format currency in compact format ($1.25M or $850k)
  const formatCompactCurrency = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `$${Math.round(val / 1000)}k`;
    }
    return `$${Math.round(val)}`;
  };

  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Deal Identity: Thor ID & Client / Scenario + Quick Actions */}
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-xs font-mono font-black text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 tracking-wider shrink-0">
              {thorId !== 'N/A' ? thorId : 'NO THOR ID'}
            </span>
            <div className="min-w-0">
              <div className="font-bold text-slate-100 truncate text-xs sm:text-sm flex items-center gap-1.5">
                <span className="truncate">{scenario.name}</span>
                {scenario.scaleDrivers?.industry && (
                  <span className="text-[10px] text-slate-400 font-normal hidden lg:inline truncate">
                    • {scenario.scaleDrivers.industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          {onSaveScenario && (
            <button
              type="button"
              onClick={handleTriggerSave}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[11px] font-bold transition-all cursor-pointer border shrink-0 ${
                justSaved
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-xs'
              }`}
              title="Save all changes to proposal and synchronize calculated metrics across all screens"
            >
              {justSaved ? <Check size={12} className="stroke-[3]" /> : <Save size={12} className="stroke-[2.5]" />}
              <span>{justSaved ? 'Saved & Synced!' : (lastSavedTimestamp ? `Save (${lastSavedTimestamp})` : 'Save Changes')}</span>
            </button>
          )}

          {onResetDefaults && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Reset this scenario back to standard defaults (20/0/80 regional mix, recommended duration, standard catalog)?')) {
                  onResetDefaults();
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer border border-slate-700 shrink-0"
              title="Reset numbers to baseline defaults"
            >
              <RotateCcw size={11} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          )}

          {onOpenNewProposal && (
            <button
              type="button"
              onClick={onOpenNewProposal}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer border border-emerald-400/40 shrink-0"
              title="Start a new proposal / blank slate or clone"
            >
              <Plus size={12} className="stroke-[3]" />
              <span>New Deal</span>
            </button>
          )}

          {onOpenSlideDeck && (
            <button
              type="button"
              onClick={onOpenSlideDeck}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors cursor-pointer border border-indigo-400/40 shrink-0 shadow-2xs"
              title="Open / Download Executive 5-Slide PowerPoint Deck"
            >
              <Presentation size={12} className="stroke-[2.5]" />
              <span>Executive Slide Deck</span>
            </button>
          )}
        </div>

        {/* 4 Core Bid Executive Metrics */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          {/* 1. Total Effort */}
          <div 
            onClick={() => handleNav && handleNav('estimation')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition group"
            title="Total target baseline effort (Hours / Person-Days)"
          >
            <div className="p-1 rounded-xs bg-slate-800 text-indigo-400 group-hover:bg-indigo-950">
              <Clock size={13} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Effort</div>
              <div className="font-bold text-slate-100 font-mono">
                {totalHours.toLocaleString()}h <span className="text-[10px] text-slate-400 font-normal">({totalDays.toLocaleString()}d)</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* 2. Program Duration & Schedule Quick Controller */}
          <div 
            onClick={() => handleNav && handleNav('schedule')}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/60 p-1 rounded-xs transition group"
            title="Total program duration, target Go-Live, and staffing sync. Click to open Gantt."
          >
            <div className="p-1 rounded-xs bg-slate-800 text-amber-400 group-hover:bg-amber-950">
              <Calendar size={13} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Duration</span>
                {isOutOfSyncWithRecommended && onUpdateScenario && (
                  <button
                    type="button"
                    onClick={handleSyncToRecommended}
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded-2xs bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
                    title={`Complexity Sizing recommends ${data.recommendedDurationWeeks}w. Click to sync.`}
                  >
                    Sync {data.recommendedDurationWeeks}w
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 font-mono">
                  {durationWeeks} Wks
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  &bull; {avgFte.toFixed(1)} FTE
                </span>

                {onUpdateScenario && (
                  <div className="inline-flex items-center gap-0.5 ml-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleAdjustWeeks(-1, e)}
                      className="w-4 h-4 rounded-2xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-mono cursor-pointer border border-slate-700"
                      title="Decrease schedule by 1 week"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleAdjustWeeks(1, e)}
                      className="w-4 h-4 rounded-2xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-mono cursor-pointer border border-slate-700"
                      title="Increase schedule by 1 week"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* 3. Est. TCV & Blended Rate */}
          <div 
            onClick={() => handleNav && handleNav('commercial')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition group"
            title="Estimated Total Contract Value & Blended Bill Rate"
          >
            <div className="p-1 rounded-xs bg-slate-800 text-emerald-400 group-hover:bg-emerald-950">
              <DollarSign size={13} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Est. TCV (Blended)</div>
              <div className="font-bold text-emerald-400 font-mono">
                {formatCompactCurrency(estimatedTcv)} <span className="text-[10px] text-slate-400 font-normal">(${blendedRate}/h)</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* 4. Peak Team Size & RFP Quick Link */}
          <div 
            onClick={() => handleNav && handleNav('reports')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition group"
            title="Peak FTE headcount and quick access to RFP Dossier"
          >
            <div className="p-1 rounded-xs bg-slate-800 text-purple-400 group-hover:bg-purple-950">
              <Users size={13} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Peak Squad</div>
              <div className="font-bold text-slate-100 font-mono flex items-center gap-1">
                <span>{peakFte > 0 ? `${peakFte.toFixed(1)} FTE` : '0.0 FTE'}</span>
                <ChevronRight size={12} className="text-slate-400 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
