import React from 'react';
import { Play, Pause, Headphones, Maximize2, SkipForward, X } from 'lucide-react';
import { PodcastEpisode, PodcastTurn } from '../../types';

interface FloatingPodcastBarProps {
  episode: PodcastEpisode | null;
  currentTurn: PodcastTurn | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenStudio: () => void;
  onStop: () => void;
}

export const FloatingPodcastBar: React.FC<FloatingPodcastBarProps> = ({
  episode,
  currentTurn,
  isPlaying,
  onTogglePlay,
  onOpenStudio,
  onStop
}) => {
  if (!episode) return null;

  const isAlex = currentTurn?.speaker === 'Alex';

  return (
    <aside
      aria-label="Floating Podcast Player"
      className="fixed bottom-4 right-4 z-40 bg-slate-900/95 text-white border border-slate-700 rounded-sm shadow-2xl p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 backdrop-blur-md max-w-lg w-full animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer" onClick={onOpenStudio}>
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <Headphones size={16} />
          </div>
          {isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-2xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase">
              Listen Podcast
            </span>
            {episode.accent === 'en-IN' && (
              <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded-2xs bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                🇮🇳 IN
              </span>
            )}
            <span className="text-[10px] text-slate-400 truncate">
              {currentTurn?.speaker
                ? episode.accent === 'en-IN'
                  ? currentTurn.speaker === 'Alex'
                    ? 'Priya'
                    : 'Rohan'
                  : currentTurn.speaker
                : episode.accent === 'en-IN'
                ? 'Priya & Rohan'
                : 'Alex & Jordan'}{' '}
              • {currentTurn?.topicTag || 'Deep Dive'}
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate hover:text-indigo-200 transition">
            {currentTurn?.text || episode.title}
          </div>
        </div>
      </div>

      {/* Mini Equalizer animation */}
      {isPlaying && (
        <div className="hidden sm:flex items-end gap-0.5 h-4 px-1 shrink-0">
          <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
          <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-4" />
          <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.5s_infinite_300ms] h-2" />
          <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite_150ms] h-3.5" />
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={onOpenStudio}
          className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          title="Open Full Podcast Studio"
        >
          <Maximize2 size={15} />
        </button>

        <button
          type="button"
          onClick={onStop}
          className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          title="Close player"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};
