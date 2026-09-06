import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Download,
  Copy,
  Check,
  FastForward,
  FileText,
  Clock,
  Send,
  Sliders,
  SkipBack,
  SkipForward,
  Globe
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, PodcastEpisode, PodcastTurn, PodcastFocus, PodcastAccent } from '../../types';
import { generateLocalPodcastEpisode, generateNotebookLMPodcast } from '../../services/podcastService';
import { PODCAST_ACCENTS, findOptimalVoices } from '../../utils/podcastVoiceUtils';

interface PodcastViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onPlayStateChange?: (isPlaying: boolean, currentEpisode: PodcastEpisode | null, currentTurn: PodcastTurn | null) => void;
}

export const PodcastView: React.FC<PodcastViewProps> = ({
  scenario,
  data,
  onPlayStateChange
}) => {
  const [focus, setFocus] = useState<PodcastFocus>('deep_dive');
  const [selectedAccent, setSelectedAccent] = useState<PodcastAccent>('en-IN');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [episode, setEpisode] = useState<PodcastEpisode>(() =>
    generateLocalPodcastEpisode(scenario, data, 'deep_dive', undefined, 'en-IN')
  );
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [speakerFilter, setSpeakerFilter] = useState<'all' | 'Alex' | 'Jordan'>('all');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceAlex, setSelectedVoiceAlex] = useState<string>('');
  const [selectedVoiceJordan, setSelectedVoiceJordan] = useState<string>('');
  const [showVoiceDrawer, setShowVoiceDrawer] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeTurnRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentTurnIndexRef = useRef<number>(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const onPlayStateChangeRef = useRef(onPlayStateChange);
  onPlayStateChangeRef.current = onPlayStateChange;

  const lastReportedState = useRef<{ isPlaying: boolean; turnIndex: number; episodeId: string | null }>({
    isPlaying: false,
    turnIndex: -1,
    episodeId: null
  });

  useEffect(() => {
    currentTurnIndexRef.current = activeTurnIndex;
    // Only notify parent if currently playing or was playing (e.g. stopped/paused)
    if (!isPlaying && !lastReportedState.current.isPlaying) {
      return;
    }
    const currentEpisodeId = episode?.id || null;
    if (
      lastReportedState.current.isPlaying !== isPlaying ||
      lastReportedState.current.turnIndex !== activeTurnIndex ||
      lastReportedState.current.episodeId !== currentEpisodeId
    ) {
      lastReportedState.current = {
        isPlaying,
        turnIndex: activeTurnIndex,
        episodeId: currentEpisodeId
      };
      if (onPlayStateChangeRef.current) {
        const turn = episode?.dialogue?.[activeTurnIndex] || null;
        onPlayStateChangeRef.current(isPlaying, episode, turn);
      }
    }
  }, [activeTurnIndex, isPlaying, episode?.id]);

  // Load Speech Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);

          const { female, male } = findOptimalVoices(voices, selectedAccent);
          if (female) setSelectedVoiceAlex(female.name);
          if (male) setSelectedVoiceJordan(male.name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedAccent]);

  const handleAccentChange = (newAccent: PodcastAccent) => {
    setSelectedAccent(newAccent);
    if (availableVoices.length > 0) {
      const { female, male } = findOptimalVoices(availableVoices, newAccent);
      if (female) setSelectedVoiceAlex(female.name);
      if (male) setSelectedVoiceJordan(male.name);
    }
    if (!isPlayingRef.current) {
      handleGenerate(focus, newAccent);
    }
  };

  // Sync episode when scenario changes if not playing
  const prevScenarioKey = useRef(`${scenario.id}_${scenario.projectWeeks}_${data?.targetHours || 0}_${focus}_${selectedAccent}`);
  useEffect(() => {
    const key = `${scenario.id}_${scenario.projectWeeks}_${data?.targetHours || 0}_${focus}_${selectedAccent}`;
    if (prevScenarioKey.current !== key) {
      prevScenarioKey.current = key;
      if (!isPlayingRef.current) {
        setEpisode(generateLocalPodcastEpisode(scenario, data, focus, customPrompt, selectedAccent));
        setActiveTurnIndex(0);
      }
    }
  }, [scenario.id, scenario.projectWeeks, data?.targetHours, focus, selectedAccent]);

  // Smooth scroll
  useEffect(() => {
    if (activeTurnRef.current) {
      activeTurnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeTurnIndex]);

  const speakTurn = (index: number) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    if (!episode || !episode.dialogue || index >= episode.dialogue.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveTurnIndex(0);
      return;
    }

    setActiveTurnIndex(index);
    currentTurnIndexRef.current = index;

    const turn = episode.dialogue[index];
    const utterance = new SpeechSynthesisUtterance(turn.text);

    utterance.lang = selectedAccent;
    utterance.rate = playbackSpeed;
    utterance.volume = isMuted ? 0 : volume;

    const voices = availableVoices.length > 0 ? availableVoices : synthRef.current.getVoices();
    if (turn.speaker === 'Alex') {
      utterance.pitch = 1.08;
      const v =
        voices.find(x => x.name === selectedVoiceAlex) ||
        voices.find(x => x.lang === selectedAccent) ||
        voices.find(x => x.lang.startsWith(selectedAccent.slice(0, 2)));
      if (v) utterance.voice = v;
    } else {
      utterance.pitch = 0.92;
      const v =
        voices.find(x => x.name === selectedVoiceJordan) ||
        voices.find(x => x.lang === selectedAccent && x.name !== selectedVoiceAlex) ||
        voices.find(x => x.lang.startsWith(selectedAccent.slice(0, 2)) && x.name !== selectedVoiceAlex);
      if (v) utterance.voice = v;
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      if (index + 1 < episode.dialogue.length) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            speakTurn(index + 1);
          }
        }, 220);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveTurnIndex(0);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setIsPlaying(false);
        setIsPaused(false);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speakTurn(activeTurnIndex);
    }
  };

  const handleRestart = () => {
    if (synthRef.current) synthRef.current.cancel();
    setActiveTurnIndex(0);
    speakTurn(0);
  };

  const handleSkipForward = () => {
    if (!episode) return;
    const nextIdx = Math.min(episode.dialogue.length - 1, activeTurnIndex + 1);
    if (isPlaying) speakTurn(nextIdx);
    else setActiveTurnIndex(nextIdx);
  };

  const handleSkipBack = () => {
    if (!episode) return;
    const prevIdx = Math.max(0, activeTurnIndex - 1);
    if (isPlaying) speakTurn(prevIdx);
    else setActiveTurnIndex(prevIdx);
  };

  const handleJumpToTurn = (index: number) => {
    setActiveTurnIndex(index);
    speakTurn(index);
  };

  const handleGenerate = async (selectedFocus?: PodcastFocus, accentOverride?: PodcastAccent) => {
    const focusToUse = selectedFocus || focus;
    const accentToUse = accentOverride || selectedAccent;
    setIsGenerating(true);
    setNotice(`Synthesizing ${accentToUse === 'en-IN' ? 'Indian Accent ' : ''}episode via Gemini 3.8 Flash...`);

    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);

    try {
      const result = await generateNotebookLMPodcast(scenario, data, focusToUse, customPrompt, accentToUse);
      setEpisode(result.episode);
      setActiveTurnIndex(0);
      setNotice(
        result.isAiGenerated
          ? `Generated via Gemini 3.8 Flash (${accentToUse === 'en-IN' ? 'Indian Accent' : accentToUse})`
          : `Calibrated proposal synthesis loaded (${accentToUse === 'en-IN' ? 'Indian Accent' : accentToUse})`
      );
      setTimeout(() => setNotice(null), 3500);
    } catch (e) {
      setEpisode(generateLocalPodcastEpisode(scenario, data, focusToUse, customPrompt, accentToUse));
      setActiveTurnIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTranscript = () => {
    if (!episode) return;
    const lines = episode.dialogue.map(
      t => `[${t.timestamp || '0:00'}] ${t.speaker} (${t.speakerRole}):\n${t.text}\n`
    );
    const text = `# ${episode.title}\n## ${episode.subtitle}\n\nClient: ${episode.clientName}\nDuration: ~${episode.durationMinutes} min\n\nSummary:\n${episode.summary}\n\nKey Takeaways:\n${episode.keyTakeaways.map(k => `- ${k}`).join('\n')}\n\nTranscript:\n${lines.join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!episode) return;
    const lines = episode.dialogue.map(
      t => `[${t.timestamp || '0:00'}] **${t.speaker}** *(${t.speakerRole})*:\n${t.text}\n`
    );
    const content = `# ${episode.title}\n*${episode.subtitle}*\n\n- **Client:** ${episode.clientName}\n- **Duration:** ${scenario.projectWeeks} Weeks\n- **Hours:** ${Math.round(data.targetHours).toLocaleString()} Hours\n- **Margin:** ${Math.round(data.masterBlendedCalc.grossMarginPct)}%\n\n## Executive Summary\n${episode.summary}\n\n## Key Takeaways\n${episode.keyTakeaways.map(k => `- ${k}`).join('\n')}\n\n## Audio Overview Transcript\n\n${lines.join('\n')}`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(scenario.clientName || 'Proposal').replace(/\s+/g, '_')}_Podcast_Audio_Overview.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentTurn = episode?.dialogue?.[activeTurnIndex] || null;
  const filteredDialogue = useMemo(() => {
    if (!episode?.dialogue) return [];
    if (speakerFilter === 'all') return episode.dialogue;
    return episode.dialogue.filter(t => t.speaker === speakerFilter);
  }, [episode, speakerFilter]);

  const totalTurns = episode?.dialogue?.length || 1;
  const progressPct = Math.min(100, Math.round(((activeTurnIndex + 1) / totalTurns) * 100));

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-sm border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-2xs border border-indigo-400/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Listen Podcast • Audio Overview
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                Interactive 2-Host AI Podcast
              </span>
              {notice && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-2xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  {notice}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {episode.title}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              {episode.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowVoiceDrawer(!showVoiceDrawer)}
              className="p-2 rounded-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Configure Voice Profiles"
            >
              <Sliders size={14} />
              <span className="font-semibold text-xs">Voices</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTranscript}
              className="p-2 rounded-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Copy Full Transcript"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="font-semibold text-xs">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-2 rounded-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Export as Markdown"
            >
              <Download size={14} />
              <span className="font-semibold text-xs">Export .MD</span>
            </button>
          </div>
        </div>

        {/* Voice Customization Drawer */}
        {showVoiceDrawer && (
          <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col gap-3 text-xs">
            {/* Accent Selector Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe size={14} className="text-indigo-400" />
                  Voice Accent:
                </span>
                <div className="inline-flex rounded-xs border border-slate-700 bg-slate-800 p-0.5 shadow-2xs">
                  {PODCAST_ACCENTS.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccentChange(acc.id)}
                      className={`px-2.5 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 text-xs ${
                        selectedAccent === acc.id
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                      title={acc.description}
                    >
                      <span>{acc.flag}</span>
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/50">
                {selectedAccent === 'en-IN' ? '🇮🇳 Indian Accent Active (Alex: Priya / Jordan: Rohan)' : `Active: ${PODCAST_ACCENTS.find(a => a.id === selectedAccent)?.label}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">Alex {selectedAccent === 'en-IN' ? '(Priya)' : ''} Voice:</span>
                <select
                  value={selectedVoiceAlex}
                  onChange={e => setSelectedVoiceAlex(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-xs px-2 py-1 text-slate-100 font-mono text-[11px] max-w-xs"
                >
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">Jordan {selectedAccent === 'en-IN' ? '(Rohan)' : ''} Voice:</span>
                <select
                  value={selectedVoiceJordan}
                  onChange={e => setSelectedVoiceJordan(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-xs px-2 py-1 text-slate-100 font-mono text-[11px] max-w-xs"
                >
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Focus Mode & Prompt Bar */}
      <div className="bg-white p-3 rounded-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Episode Focus:</span>
          <div className="inline-flex rounded-xs border border-slate-300 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => {
                setFocus('deep_dive');
                handleGenerate('deep_dive');
              }}
              disabled={isGenerating}
              className={`px-3 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                focus === 'deep_dive' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Headphones size={13} />
              <span>Full Deep Dive</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFocus('commercials');
                handleGenerate('commercials');
              }}
              disabled={isGenerating}
              className={`px-3 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                focus === 'commercials' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={13} className="text-emerald-500" />
              <span>CFO Commercials</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFocus('architecture');
                handleGenerate('architecture');
              }}
              disabled={isGenerating}
              className={`px-3 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                focus === 'architecture' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Radio size={13} className="text-blue-500" />
              <span>Architecture & Risks</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFocus('executive');
                handleGenerate('executive');
              }}
              disabled={isGenerating}
              className={`px-3 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                focus === 'executive' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FastForward size={13} className="text-amber-500" />
              <span>2-Min Executive</span>
            </button>
          </div>

          {/* Quick Accent Switcher Pill */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-300">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Accent:</span>
            <div className="inline-flex rounded-xs border border-slate-300 bg-white p-0.5 shadow-2xs">
              {PODCAST_ACCENTS.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleAccentChange(acc.id)}
                  className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    selectedAccent === acc.id
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={acc.description}
                >
                  <span>{acc.flag}</span>
                  <span className="hidden sm:inline">{acc.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Direct the hosts (e.g., Focus on 20/80 offshore model...)"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleGenerate();
            }}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xs placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles size={12} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Dual Host Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div
          className={`p-3.5 rounded-sm border transition-all ${
            currentTurn?.speaker === 'Alex' && isPlaying
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                AL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {selectedAccent === 'en-IN' ? 'Alex (Priya)' : 'Alex'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-2xs bg-blue-100 text-blue-800 font-bold uppercase">
                    Inquisitive Co-Host
                  </span>
                </div>
                <div className="text-xs text-slate-500">Enterprise Technology Strategist</div>
              </div>
            </div>

            {currentTurn?.speaker === 'Alex' && isPlaying && (
              <div className="flex items-end gap-1 h-5 px-2">
                <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.6s_infinite_100ms] h-4" />
                <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.8s_infinite_200ms] h-5" />
                <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.5s_infinite_300ms] h-3" />
                <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.7s_infinite_150ms] h-5" />
              </div>
            )}
          </div>
        </div>

        <div
          className={`p-3.5 rounded-sm border transition-all ${
            currentTurn?.speaker === 'Jordan' && isPlaying
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                JD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {selectedAccent === 'en-IN' ? 'Jordan (Rohan)' : 'Jordan'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-2xs bg-emerald-100 text-emerald-800 font-bold uppercase">
                    Oracle Architect
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {selectedAccent === 'en-IN'
                    ? 'Oracle Practice Lead • India GDC COE'
                    : 'Principal Practice Leader & TCM Master'}
                </div>
              </div>
            </div>

            {currentTurn?.speaker === 'Jordan' && isPlaying && (
              <div className="flex items-end gap-1 h-5 px-2">
                <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.7s_infinite_150ms] h-5" />
                <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.5s_infinite_250ms] h-3" />
                <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.8s_infinite_100ms] h-4" />
                <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.6s_infinite_200ms] h-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player Card */}
      <div className="bg-slate-900 text-white p-4 rounded-sm border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400 text-xs w-10 text-right">
            {currentTurn?.timestamp || '0:00'}
          </span>
          <div
            className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const targetIdx = Math.min(
                episode.dialogue.length - 1,
                Math.floor(pct * episode.dialogue.length)
              );
              handleJumpToTurn(targetIdx);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-slate-400 text-xs w-10">
            ~{episode.durationMinutes}:00
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Currently Playing:</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTurn?.speaker === 'Alex' ? 'bg-blue-400' : 'bg-emerald-400'
                }`}
              />
              {currentTurn?.speaker}: "{currentTurn?.topicTag || 'Core Topic'}"
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              title="Restart"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleSkipBack}
              className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
              title="Previous Turn"
            >
              <SkipBack size={18} />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition cursor-pointer transform active:scale-95"
            >
              {isPlaying ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleSkipForward}
              className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
              title="Next Turn"
            >
              <SkipForward size={18} />
            </button>

            <div className="ml-2 inline-flex rounded-xs bg-slate-800 p-0.5 text-[11px] font-mono">
              {([0.75, 1.0, 1.25, 1.5] as const).map(spd => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    if (isPlaying) speakTurn(activeTurnIndex);
                  }}
                  className={`px-2 py-0.5 rounded-xs transition cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xs bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 hidden sm:flex items-center gap-1">
              <span>{selectedAccent === 'en-IN' ? '🇮🇳' : '🌐'}</span>
              <span>{PODCAST_ACCENTS.find(a => a.id === selectedAccent)?.label || 'Indian English'}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="text-xs font-mono text-slate-400">
              Turn {activeTurnIndex + 1} of {totalTurns}
            </span>
          </div>
        </div>
      </div>

      {/* Summary & Takeaways */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-sm space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
            <Sparkles size={16} className="text-indigo-600" />
            Strategic Proposal Thesis
          </span>
          <span className="text-[11px] font-mono text-indigo-700">
            ~{episode.durationMinutes} min • {episode.dialogue.length} dialogue turns
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed italic">{episode.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {episode.keyTakeaways.map((takeaway, i) => (
            <div key={i} className="p-2.5 bg-white rounded-xs border border-indigo-100 text-xs text-slate-700 shadow-2xs">
              <span className="font-bold text-indigo-900 mr-1">{i + 1}.</span> {takeaway}
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Filter & Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <FileText size={16} className="text-slate-600" />
            Full Synchronized Dialogue Transcript
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Filter:</span>
            <button
              type="button"
              onClick={() => setSpeakerFilter('all')}
              className={`px-2.5 py-0.5 rounded-xs transition cursor-pointer ${
                speakerFilter === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('Alex')}
              className={`px-2.5 py-0.5 rounded-xs transition cursor-pointer ${
                speakerFilter === 'Alex'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alex
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('Jordan')}
              className={`px-2.5 py-0.5 rounded-xs transition cursor-pointer ${
                speakerFilter === 'Jordan'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Jordan
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredDialogue.map(turn => {
            const actualIdx = episode.dialogue.findIndex(t => t.id === turn.id);
            const isCurrent = actualIdx === activeTurnIndex;
            const isAlex = turn.speaker === 'Alex';

            return (
              <div
                key={turn.id}
                ref={isCurrent ? activeTurnRef : null}
                onClick={() => handleJumpToTurn(actualIdx)}
                className={`p-4 rounded-sm border transition-all cursor-pointer group ${
                  isCurrent
                    ? isAlex
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300/50 shadow-sm'
                      : 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300/50 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-1.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAlex ? 'bg-blue-600' : 'bg-emerald-600'
                      } ${isCurrent && isPlaying ? 'animate-ping' : ''}`}
                    />
                    <span className="font-bold text-slate-900">{turn.speaker}</span>
                    <span className="text-[11px] text-slate-500">({turn.speakerRole})</span>
                    {turn.topicTag && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-2xs bg-slate-100 text-slate-600">
                        {turn.topicTag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{turn.timestamp || '0:00'}</span>
                    <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 font-semibold flex items-center gap-1 transition-opacity">
                      <Play size={11} /> Play line
                    </span>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed ${
                    isCurrent
                      ? isAlex
                        ? 'text-blue-950 font-medium'
                        : 'text-emerald-950 font-medium'
                      : 'text-slate-700'
                  }`}
                >
                  {turn.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
