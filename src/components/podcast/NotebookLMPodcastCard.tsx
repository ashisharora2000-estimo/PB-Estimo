import React from 'react';
import { Headphones, Play, Sparkles, Radio, Clock, ArrowRight } from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';

interface NotebookLMPodcastCardProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onOpenPodcastStudio: () => void;
  className?: string;
}

export const NotebookLMPodcastCard: React.FC<NotebookLMPodcastCardProps> = ({
  scenario,
  data,
  onOpenPodcastStudio,
  className = ''
}) => {
  const clientName = scenario.clientName || scenario.name || 'Enterprise Client';
  const weeks = scenario.projectWeeks || 32;
  const hours = Math.round(data?.targetHours || 8500);
  const margin = Math.round(data?.masterBlendedCalc?.grossMarginPct ?? data?.grossMarginPct ?? 48);

  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-indigo-200 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 shadow-sm ${className}`}
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-gradient-to-r from-indigo-500/40 to-purple-500/40 text-indigo-200 px-2.5 py-0.5 rounded-2xs border border-indigo-400/30 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Listen Podcast • Audio Overview
            </span>
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Clock size={12} /> ~6 min Deep Dive
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            Listen to the 2-Host Deep Dive on {clientName}'s Proposal
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            AI co-hosts Alex & Jordan break down the {weeks}-week critical path, {hours.toLocaleString()}-hour sizing, 2-tier 20% Onshore / 80% Offshore GDC economics, and {margin}% gross margin defensibility in conversational audio.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                  AL
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                  JD
                </div>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">Alex & Jordan</span>
            </div>

            <div className="h-3 w-px bg-slate-700" />

            <span className="text-[11px] text-slate-400">
              Interactive timeline • Speech synthesis • Live transcript
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenPodcastStudio}
            className="w-full sm:w-auto px-4 py-2.5 rounded-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-indigo-500/25 cursor-pointer transform active:scale-95 group border border-indigo-400/40"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={12} className="fill-white ml-0.5" />
            </div>
            <span>Open Audio Overview</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
