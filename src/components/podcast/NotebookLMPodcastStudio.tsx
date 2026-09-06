import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  Radio,
  Download,
  Copy,
  Check,
  Share2,
  SkipBack,
  SkipForward,
  FastForward,
  FileText,
  Clock,
  Sparkle,
  Send,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  X,
  Maximize2,
  Minimize2,
  ListFilter,
  Globe
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, PodcastEpisode, PodcastTurn, PodcastFocus, PodcastAccent } from '../../types';
import { generateLocalPodcastEpisode, generateNotebookLMPodcast } from '../../services/podcastService';
import { PODCAST_ACCENTS, findOptimalVoices } from '../../utils/podcastVoiceUtils';
import { savePodcastEpisodeToCloud } from '../../services/firestoreService';

interface NotebookLMPodcastStudioProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  isOpen: boolean;
  onClose: () => void;
  onPlayStateChange?: (isPlaying: boolean, currentEpisode: PodcastEpisode | null, currentTurn: PodcastTurn | null) => void;
}

export const NotebookLMPodcastStudio: React.FC<NotebookLMPodcastStudioProps> = ({
  scenario,
  data,
  isOpen,
  onClose,
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
  const [activeSpeakerFilter, setActiveSpeakerFilter] = useState<'all' | 'Alex' | 'Jordan'>('all');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceAlex, setSelectedVoiceAlex] = useState<string>('');
  const [selectedVoiceJordan, setSelectedVoiceJordan] = useState<string>('');
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeTurnRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentTurnIndexRef = useRef<number>(0);

  // Keep refs in sync
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

  // SpeechSynthesis Voice Initialization
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
      handleGenerateEpisode(focus, newAccent);
    }
  };

  // When scenario changes, refresh baseline episode if not playing
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

  // Scroll active dialogue turn into view smoothly
  useEffect(() => {
    if (activeTurnRef.current && transcriptContainerRef.current) {
      activeTurnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeTurnIndex]);

  // Audio Speech Function
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

    // Apply distinctive character pitch & voice profile
    const voices = availableVoices.length > 0 ? availableVoices : synthRef.current.getVoices();
    if (turn.speaker === 'Alex') {
      utterance.pitch = 1.08; // slightly higher, energetic
      const v =
        voices.find(x => x.name === selectedVoiceAlex) ||
        voices.find(x => x.lang === selectedAccent) ||
        voices.find(x => x.lang.startsWith(selectedAccent.slice(0, 2)));
      if (v) utterance.voice = v;
    } else {
      utterance.pitch = 0.92; // deeper, authoritative
      const v =
        voices.find(x => x.name === selectedVoiceJordan) ||
        voices.find(x => x.lang === selectedAccent && x.name !== selectedVoiceAlex) ||
        voices.find(x => x.lang.startsWith(selectedAccent.slice(0, 2)) && x.name !== selectedVoiceAlex);
      if (v) utterance.voice = v;
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      if (index + 1 < episode.dialogue.length) {
        // Natural conversational pause between hosts (~220ms)
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
      console.warn('Speech synthesis playback error:', e);
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

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speakTurn(activeTurnIndex);
    }
  };

  const handlePause = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleRestart = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setActiveTurnIndex(0);
    speakTurn(0);
  };

  const handleSkipForward = () => {
    if (!episode) return;
    const nextIdx = Math.min(episode.dialogue.length - 1, activeTurnIndex + 1);
    if (isPlaying) {
      speakTurn(nextIdx);
    } else {
      setActiveTurnIndex(nextIdx);
    }
  };

  const handleSkipBack = () => {
    if (!episode) return;
    const prevIdx = Math.max(0, activeTurnIndex - 1);
    if (isPlaying) {
      speakTurn(prevIdx);
    } else {
      setActiveTurnIndex(prevIdx);
    }
  };

  const handleJumpToTurn = (index: number) => {
    setActiveTurnIndex(index);
    speakTurn(index);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    if (isPlaying) {
      // Re-trigger current turn with new speed
      speakTurn(activeTurnIndex);
    }
  };

  const handleGenerateEpisode = async (selectedFocus?: PodcastFocus, accentOverride?: PodcastAccent) => {
    const focusToUse = selectedFocus || focus;
    const accentToUse = accentOverride || selectedAccent;
    setIsGenerating(true);
    setGenerationNotice(`Generating ${accentToUse === 'en-IN' ? 'Indian Accent ' : ''}audio overview with Gemini...`);

    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);

    try {
      const result = await generateNotebookLMPodcast(scenario, data, focusToUse, customPrompt, accentToUse);
      setEpisode(result.episode);
      setActiveTurnIndex(0);
      // Asynchronously persist to Cloud Firestore for cross-system podcast retrieval
      savePodcastEpisodeToCloud(result.episode).catch(e => {
        console.warn('Podcast episode cloud persistence notice:', e);
      });
      setGenerationNotice(
        result.isAiGenerated
          ? `Generated bespoke episode via Gemini 3.8 Flash (${accentToUse === 'en-IN' ? 'Indian Accent' : accentToUse})!`
          : `Synthesized high-fidelity calibrated episode (${accentToUse === 'en-IN' ? 'Indian Accent' : accentToUse}).`
      );
      setTimeout(() => setGenerationNotice(null), 4000);
    } catch (err: any) {
      console.error('Failed to generate episode:', err);
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
    const fullText = `# ${episode.title}\n## ${episode.subtitle}\n\nClient: ${episode.clientName}\nFormat: ${episode.focus}\nDuration: ~${episode.durationMinutes} minutes\n\n### Summary\n${episode.summary}\n\n### Key Takeaways\n${episode.keyTakeaways.map(k => `- ${k}`).join('\n')}\n\n### Transcript\n\n${lines.join('\n')}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTranscript = () => {
    if (!episode) return;
    const lines = episode.dialogue.map(
      t => `[${t.timestamp || '0:00'}] **${t.speaker}** *(${t.speakerRole})*:\n${t.text}\n`
    );
    const mdContent = `# ${episode.title}
*${episode.subtitle}*

- **Client:** ${episode.clientName}
- **Program Duration:** ${scenario.projectWeeks} Weeks
- **Total Sizing:** ${Math.round(data.targetHours).toLocaleString()} Hours
- **Sourcing Mix:** ${scenario.deliveryMix.onshore}% Onshore / ${scenario.deliveryMix.offshore}% Offshore GDC
- **Gross Margin Target:** ${Math.round(data.masterBlendedCalc.grossMarginPct)}%

## Executive Summary
${episode.summary}

## Key Takeaways
${episode.keyTakeaways.map(k => `- ${k}`).join('\n')}

---

## Audio Overview Transcript

${lines.join('\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(scenario.clientName || 'Oracle_Cloud').replace(/\s+/g, '_')}_Podcast_Audio_Overview.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTurn = episode?.dialogue?.[activeTurnIndex] || null;

  // Filter dialogue turns if speaker filter is active
  const filteredDialogue = useMemo(() => {
    if (!episode?.dialogue) return [];
    if (activeSpeakerFilter === 'all') return episode.dialogue;
    return episode.dialogue.filter(t => t.speaker === activeSpeakerFilter);
  }, [episode, activeSpeakerFilter]);

  // Current progress calculation
  const totalTurns = episode?.dialogue?.length || 1;
  const progressPct = Math.min(100, Math.round(((activeTurnIndex + 1) / totalTurns) * 100));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header: Listen Podcast Audio Overview Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
              <Headphones size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-2xs border border-indigo-400/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Listen Podcast
                </span>
                <span className="text-[11px] font-semibold text-slate-300">Audio Overview & Deep Dive</span>
                {generationNotice && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-2xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    {generationNotice}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate max-w-xl">
                {episode.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`p-1.5 rounded-xs transition cursor-pointer text-xs flex items-center gap-1 border ${
                showVoiceSettings
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Voice Settings & Speech Synthesis"
            >
              <Sliders size={14} />
              <span className="hidden sm:inline text-[11px] font-semibold">Voices</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTranscript}
              className="p-1.5 rounded-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer text-xs flex items-center gap-1"
              title="Copy Full Transcript"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline text-[11px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTranscript}
              className="p-1.5 rounded-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer text-xs flex items-center gap-1"
              title="Download Transcript as Markdown"
            >
              <Download size={14} />
              <span className="hidden sm:inline text-[11px] font-semibold">Export</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (synthRef.current) synthRef.current.cancel();
                setIsPlaying(false);
                onClose();
              }}
              className="p-1.5 rounded-xs hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer ml-1"
              title="Close Audio Overview Studio"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Voice Customization Drawer (Collapsible) */}
        {showVoiceSettings && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 text-xs flex flex-col gap-3 animate-in slide-in-from-top-1 duration-150">
            {/* Accent Selection Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe size={14} className="text-indigo-600" />
                  Voice Accent:
                </span>
                <div className="inline-flex rounded-xs border border-slate-300 bg-white p-0.5 shadow-2xs">
                  {PODCAST_ACCENTS.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccentChange(acc.id)}
                      className={`px-2.5 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 text-xs ${
                        selectedAccent === acc.id
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      title={acc.description}
                    >
                      <span>{acc.flag}</span>
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedAccent === 'en-IN' ? '🇮🇳 Indian Accent Active (Alex: Priya / Jordan: Rohan)' : `Active: ${PODCAST_ACCENTS.find(a => a.id === selectedAccent)?.label}`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Alex {selectedAccent === 'en-IN' ? '(Priya)' : ''} Voice:
                  </span>
                  <select
                    value={selectedVoiceAlex}
                    onChange={e => setSelectedVoiceAlex(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xs px-2 py-1 text-slate-900 font-mono text-[11px] focus:ring-1 focus:ring-indigo-500 max-w-xs"
                  >
                    {availableVoices.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Jordan {selectedAccent === 'en-IN' ? '(Rohan)' : ''} Voice:
                  </span>
                  <select
                    value={selectedVoiceJordan}
                    onChange={e => setSelectedVoiceJordan(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xs px-2 py-1 text-slate-900 font-mono text-[11px] focus:ring-1 focus:ring-indigo-500 max-w-xs"
                  >
                    {availableVoices.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 italic">
                Browser Web Speech synthesis with dual host character and accent modulation.
              </span>
            </div>
          </div>
        )}

        {/* Format Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Episode Focus:</span>
            <div className="inline-flex rounded-xs border border-slate-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setFocus('deep_dive');
                  handleGenerateEpisode('deep_dive');
                }}
                disabled={isGenerating}
                className={`px-2.5 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  focus === 'deep_dive' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Headphones size={12} />
                <span>Full Deep Dive</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFocus('commercials');
                  handleGenerateEpisode('commercials');
                }}
                disabled={isGenerating}
                className={`px-2.5 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  focus === 'commercials' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles size={12} className="text-emerald-500" />
                <span>CFO Commercials</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFocus('architecture');
                  handleGenerateEpisode('architecture');
                }}
                disabled={isGenerating}
                className={`px-2.5 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  focus === 'architecture' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Radio size={12} className="text-blue-500" />
                <span>Architecture & Risks</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFocus('executive');
                  handleGenerateEpisode('executive');
                }}
                disabled={isGenerating}
                className={`px-2.5 py-1 rounded-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  focus === 'executive' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FastForward size={12} className="text-amber-500" />
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

          {/* Quick Regenerate Action */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Custom direction (e.g., Focus on 20/80 offshore leverage...)"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleGenerateEpisode();
              }}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-xs placeholder:text-slate-400 w-48 sm:w-64 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleGenerateEpisode()}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
              title="Generate new podcast with custom prompt"
            >
              <Sparkles size={12} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Dual Host Profile Cards with Real-Time Audio Equalizer */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Host 1: Alex */}
          <div
            className={`p-3 rounded-sm border transition-all ${
              currentTurn?.speaker === 'Alex' && isPlaying
                ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  AL
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      {selectedAccent === 'en-IN' ? 'Alex (Priya)' : 'Alex'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-2xs bg-blue-100 text-blue-800 font-bold uppercase">
                      Inquisitive Co-Host
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Enterprise Technology Strategist</div>
                </div>
              </div>

              {/* Active Soundwave Visualizer */}
              {currentTurn?.speaker === 'Alex' && isPlaying && (
                <div className="flex items-end gap-0.5 h-4 px-2">
                  <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
                  <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.8s_infinite_200ms] h-4" />
                  <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.5s_infinite_300ms] h-2" />
                  <span className="w-1 bg-blue-600 rounded-full animate-[bounce_0.7s_infinite_150ms] h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Host 2: Jordan */}
          <div
            className={`p-3 rounded-sm border transition-all ${
              currentTurn?.speaker === 'Jordan' && isPlaying
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300/40 shadow-xs'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  JD
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      {selectedAccent === 'en-IN' ? 'Jordan (Rohan)' : 'Jordan'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-2xs bg-emerald-100 text-emerald-800 font-bold uppercase">
                      Oracle Architect
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedAccent === 'en-IN'
                      ? 'Oracle Practice Lead • India GDC COE'
                      : 'Principal Practice Leader & TCM Master'}
                  </div>
                </div>
              </div>

              {/* Active Soundwave Visualizer */}
              {currentTurn?.speaker === 'Jordan' && isPlaying && (
                <div className="flex items-end gap-0.5 h-4 px-2">
                  <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.7s_infinite_150ms] h-4" />
                  <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.5s_infinite_250ms] h-2" />
                  <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3.5" />
                  <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.6s_infinite_200ms] h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Content Area: Synchronized Transcript with Timestamp scrubbing */}
        <div
          ref={transcriptContainerRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40 custom-scrollbar"
        >
          {/* Key Takeaways Card */}
          <div className="p-3.5 bg-indigo-50/40 border border-indigo-200 rounded-sm text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                Listen Podcast Core Insights & Thesis
              </span>
              <span className="text-[10px] font-mono text-indigo-700 font-semibold">
                ~{episode.durationMinutes} min runtime • {episode.dialogue.length} dialogue turns
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed italic">{episode.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
              {episode.keyTakeaways.map((takeaway, i) => (
                <div key={i} className="p-2 bg-white rounded-xs border border-indigo-100 text-[11px] text-slate-700">
                  <span className="font-bold text-indigo-900 mr-1">{i + 1}.</span> {takeaway}
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Filter Header */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-500" />
              Full Synchronized Dialogue Transcript
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400">Filter:</span>
              <button
                type="button"
                onClick={() => setActiveSpeakerFilter('all')}
                className={`px-2 py-0.5 rounded-xs transition cursor-pointer ${
                  activeSpeakerFilter === 'all'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveSpeakerFilter('Alex')}
                className={`px-2 py-0.5 rounded-xs transition cursor-pointer ${
                  activeSpeakerFilter === 'Alex'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Alex Only
              </button>
              <button
                type="button"
                onClick={() => setActiveSpeakerFilter('Jordan')}
                className={`px-2 py-0.5 rounded-xs transition cursor-pointer ${
                  activeSpeakerFilter === 'Jordan'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Jordan Only
              </button>
            </div>
          </div>

          {/* Dialogue Turns */}
          <div className="space-y-3">
            {filteredDialogue.map((turn, i) => {
              const actualIdx = episode.dialogue.findIndex(t => t.id === turn.id);
              const isCurrent = actualIdx === activeTurnIndex;
              const isAlex = turn.speaker === 'Alex';

              return (
                <div
                  key={turn.id}
                  ref={isCurrent ? activeTurnRef : null}
                  onClick={() => handleJumpToTurn(actualIdx)}
                  className={`p-3.5 rounded-sm border transition-all cursor-pointer group ${
                    isCurrent
                      ? isAlex
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300/50 shadow-sm'
                        : 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300/50 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs pb-1.5 mb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAlex ? 'bg-blue-600' : 'bg-emerald-600'
                        } ${isCurrent && isPlaying ? 'animate-ping' : ''}`}
                      />
                      <span className="font-bold text-slate-900">{turn.speaker}</span>
                      <span className="text-[10px] text-slate-500">({turn.speakerRole})</span>
                      {turn.topicTag && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-2xs bg-slate-100 text-slate-600">
                          {turn.topicTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{turn.timestamp || '0:00'}</span>
                      <span className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 font-semibold flex items-center gap-0.5 transition-opacity">
                        <Play size={10} /> Play from here
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
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

        {/* Master Audio Playback Controls (NotebookLM Style Footer) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white border-t border-slate-800 space-y-2.5">
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400 text-[11px] w-10 text-right">
              {currentTurn?.timestamp || '0:00'}
            </span>
            <div
              className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                const targetIdx = Math.min(
                  episode.dialogue.length - 1,
                  Math.floor(pct * episode.dialogue.length)
                );
                handleJumpToTurn(targetIdx);
              }}
              title="Click to jump timeline"
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-slate-400 text-[11px] w-10">
              ~{episode.durationMinutes}:00
            </span>
          </div>

          {/* Main Control Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Active speaker indicator */}
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="text-slate-400">Now Discussing:</span>
              <span className="font-bold text-white truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentTurn?.speaker === 'Alex' ? 'bg-blue-400' : 'bg-emerald-400'
                  }`}
                />
                {currentTurn?.speaker}: "{currentTurn?.topicTag || 'Architecture'}"
              </span>
            </div>

            {/* Center: Play, Pause, Skip, Restart Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestart}
                className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                title="Restart from beginning"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={handleSkipBack}
                className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                title="Previous turn"
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg transition cursor-pointer transform active:scale-95"
                title={isPlaying ? 'Pause Audio Overview' : 'Play Audio Overview'}
              >
                {isPlaying ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleSkipForward}
                className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                title="Next turn"
              >
                <SkipForward size={18} />
              </button>

              {/* Speed Multiplier Pill */}
              <div className="ml-2 inline-flex rounded-xs bg-slate-800 p-0.5 text-[10px] font-mono">
                {([0.75, 1.0, 1.25, 1.5] as const).map(spd => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-1.5 py-0.5 rounded-xs transition cursor-pointer ${
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

            {/* Right: Accent Indicator, Volume & Turn Count */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xs bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 hidden sm:flex items-center gap-1">
                <span>{selectedAccent === 'en-IN' ? '🇮🇳' : '🌐'}</span>
                <span>{PODCAST_ACCENTS.find(a => a.id === selectedAccent)?.label || 'Indian English'}</span>
              </span>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                Turn {activeTurnIndex + 1} of {totalTurns}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
