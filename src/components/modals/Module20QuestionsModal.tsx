import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Play,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileQuestion,
  Info,
  Check,
  Zap,
  Sliders,
  Filter,
  Search,
  Grid,
  List,
  Star,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import {
  ProjectScenario,
  OracleModule,
  ModuleScopingQuestion,
  TShirtSize
} from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import {
  getQuestionsForModule,
  calculateModuleScopingMetrics,
  isQuestionMandatory,
  getQuestionTag,
  getQuestionWeight
} from '../../data/moduleScopingQuestions';
import { TShirtBadge, T_SHIRT_CONFIG } from '../common/TShirtBadge';

interface Module20QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: OracleModule;
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  initialMode?: 'worksheet' | 'wizard';
  initialQuestionIndex?: number;
  onSelectModule?: (modId: OracleModule) => void;
}

export const Module20QuestionsModal: React.FC<Module20QuestionsModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  scenario,
  onUpdateScenario,
  initialMode = 'worksheet',
  initialQuestionIndex = 0,
  onSelectModule
}) => {
  const [viewMode, setViewMode] = useState<'worksheet' | 'wizard'>(initialMode);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(initialQuestionIndex);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mandatory' | 'optional' | 'flagged'>(
    scenario.scopingInputMode === 'fast_track' ? 'mandatory' : 'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [wizardOnlyMandatory, setWizardOnlyMandatory] = useState<boolean>(true);

  // Synchronize view mode if initialMode changes
  React.useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  // Synchronize question index if initialQuestionIndex changes
  React.useEffect(() => {
    setActiveQuestionIdx(initialQuestionIndex);
  }, [initialQuestionIndex]);

  // Combined catalog + custom modules
  const combinedModules = useMemo(() => {
    return [...ORACLE_MODULE_CATALOG, ...(scenario.customModules || [])];
  }, [scenario.customModules]);

  const moduleDef = useMemo(() => {
    return combinedModules.find(m => m.id === moduleId) || {
      id: moduleId,
      name: moduleId,
      pillar: 'ERP',
      description: 'Oracle Cloud Module Scoping',
      baseEffortHours: 400
    };
  }, [combinedModules, moduleId]);

  // Questions for this module
  const questions: ModuleScopingQuestion[] = useMemo(() => {
    const customList = scenario.customModuleQuestions?.[moduleId];
    if (customList && customList.length > 0) return customList;
    return getQuestionsForModule(moduleId);
  }, [scenario.customModuleQuestions, moduleId]);

  // Current answers
  const currentAnswers = useMemo(() => {
    return scenario.moduleQuestionAnswers?.[moduleId] || Array(questions.length).fill(1);
  }, [scenario.moduleQuestionAnswers, moduleId, questions.length]);

  // Metrics calculated using deterministic weighted mandatory/optional logic
  const metrics = useMemo(() => {
    return calculateModuleScopingMetrics(questions, currentAnswers, {
      tShirtOverride: scenario.moduleTShirtOverrides?.[moduleId]
    });
  }, [questions, currentAnswers, scenario.moduleTShirtOverrides, moduleId]);

  const { avgScore, totalDeltaHours, calculatedTShirt, mandatoryTotal, mandatoryAnswered, optionalTotal, optionalAnswered, isCoreComplete } = metrics;

  // Answer updater
  const handleSelectOption = (qIdx: number, optIdx: number) => {
    onUpdateScenario(prev => {
      const currentMap = prev.moduleQuestionAnswers || {};
      const currentModAnswers = currentMap[moduleId] || Array(questions.length).fill(1);
      const nextAnswers = currentModAnswers.map((v, i) => (i === qIdx ? optIdx : v));

      return {
        ...prev,
        moduleQuestionAnswers: {
          ...currentMap,
          [moduleId]: nextAnswers
        }
      };
    });
  };

  // Batch preset
  const handleApplyPreset = (levelIdx: number) => {
    onUpdateScenario(prev => {
      const currentMap = prev.moduleQuestionAnswers || {};
      return {
        ...prev,
        moduleQuestionAnswers: {
          ...currentMap,
          [moduleId]: Array(questions.length).fill(levelIdx)
        }
      };
    });
  };

  // Fast-track one-click: Set mandatory to Standard (Level 2) and optional to MBP (Level 1)
  const handleFastTrackStandard = () => {
    onUpdateScenario(prev => {
      const currentMap = prev.moduleQuestionAnswers || {};
      const updated = questions.map((q, idx) => {
        const isMandatory = isQuestionMandatory(q, idx);
        const existingAns = currentMap[moduleId]?.[idx];
        if (isMandatory) {
          return existingAns !== undefined ? existingAns : 1; // Preserve if answered or set to C2 Std
        }
        return existingAns !== undefined ? existingAns : 0; // Default optional to MBP Level 1 (C1)
      });

      return {
        ...prev,
        moduleQuestionAnswers: {
          ...currentMap,
          [moduleId]: updated
        }
      };
    });
  };

  // Toggle Client Clarification flag
  const toggleFlag = (qIdx: number) => {
    onUpdateScenario(prev => {
      const currentMeta = prev.questionConfidenceMeta || {};
      const modMeta = currentMeta[moduleId] || {};
      const currentQMeta = modMeta[qIdx] || {
        confidence: 'medium',
        percentage: 70,
        source: 'default_benchmark',
        clientClarificationNeeded: false
      };

      const nextVal = !currentQMeta.clientClarificationNeeded;

      return {
        ...prev,
        questionConfidenceMeta: {
          ...currentMeta,
          [moduleId]: {
            ...modMeta,
            [qIdx]: {
              ...currentQMeta,
              clientClarificationNeeded: nextVal,
              confidence: nextVal ? 'low' : currentQMeta.confidence
            }
          }
        }
      };
    });
  };

  if (!isOpen) return null;

  const categories = [
    'all',
    'Process Scope',
    'Integrations & Feeds',
    'Data & Conversions',
    'Approvals & Workflows',
    'Reporting & Analytics',
    'Compliance & Security'
  ];

  const filteredQuestions = questions.filter((q, originalIdx) => {
    const isMandatory = isQuestionMandatory(q, originalIdx);
    const qMeta = scenario.questionConfidenceMeta?.[moduleId]?.[originalIdx];
    const isFlagged = !!qMeta?.clientClarificationNeeded;

    // Scope Filter
    if (scopeFilter === 'mandatory' && !isMandatory) return false;
    if (scopeFilter === 'optional' && isMandatory) return false;
    if (scopeFilter === 'flagged' && !isFlagged) return false;

    // Category Filter
    const matchCat = categoryFilter === 'all' || q.category === categoryFilter;
    
    // Search Query
    const matchSearch = !searchQuery || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.rationale?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()) || o.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchCat && matchSearch;
  });

  // Wizard Questions List
  const wizardQuestions = useMemo(() => {
    if (!wizardOnlyMandatory) return questions;
    return questions.filter((q, idx) => isQuestionMandatory(q, idx));
  }, [questions, wizardOnlyMandatory]);

  const activeWizardQuestion = wizardQuestions[activeQuestionIdx] || wizardQuestions[0] || questions[0];
  const activeOriginalIdx = questions.findIndex(q => q.id === activeWizardQuestion?.id);
  const activeQuestionAnswer = currentAnswers[activeOriginalIdx] !== undefined ? currentAnswers[activeOriginalIdx] : 1;
  const activeQuestionMeta = scenario.questionConfidenceMeta?.[moduleId]?.[activeOriginalIdx];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Process Scope': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Integrations & Feeds': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Data & Conversions': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Approvals & Workflows': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Reporting & Analytics': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Compliance & Security': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`bg-white border border-slate-300 shadow-2xl flex flex-col transition-all duration-200 ${
          isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-6xl max-h-[92vh] rounded-xs'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-3.5 sm:px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-sm bg-indigo-600 text-white shadow-xs">
              <Sliders size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
                  Oracle Module Scoping Engine
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono uppercase">
                  {moduleDef.pillar}
                </span>
                <span className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                  isCoreComplete ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                }`}>
                  {isCoreComplete ? <CheckCircle2 size={10} /> : <Zap size={10} />}
                  {isCoreComplete ? `Core Complete (${mandatoryAnswered}/${mandatoryTotal})` : `Core Incomplete (${mandatoryAnswered}/${mandatoryTotal})`}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                {moduleDef.name}
                {onSelectModule && scenario.selectedModules.length > 1 && (
                  <select
                    value={moduleId}
                    onChange={(e) => onSelectModule(e.target.value as OracleModule)}
                    className="ml-2 text-xs bg-slate-800 border border-slate-700 text-white px-2 py-0.5 font-sans font-normal cursor-pointer focus:outline-none"
                  >
                    {scenario.selectedModules.map(id => {
                      const d = combinedModules.find(m => m.id === id);
                      return <option key={id} value={id}>{d?.name || id}</option>;
                    })}
                  </select>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Metrics Header Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/90 border border-slate-700 text-xs font-mono">
              <span className="text-slate-400">Score:</span>
              <strong className="text-indigo-400">{avgScore.toFixed(2)}/4.0</strong>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">T-Shirt:</span>
              <span className="font-bold text-amber-300">{calculatedTShirt}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Delta:</span>
              <strong className="text-emerald-400">+{totalDeltaHours}h</strong>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-700 bg-slate-800 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('worksheet')}
                className={`px-2 py-1 flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'worksheet' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="View all questions in worksheet view"
              >
                <Grid size={12} />
                <span className="hidden sm:inline">Worksheet Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-2 py-1 flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'wizard' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Guided Step-by-Step Question Wizard"
              >
                <Play size={12} />
                <span className="hidden sm:inline">Step Wizard</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/60 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FAST-TRACK BANNER: Explaining Mandatory vs Optional Question Math */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2.5 border-b border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Zap size={14} />
            </span>
            <div>
              <div className="font-bold flex items-center gap-1.5 text-amber-200">
                <span>Fast-Track Scoping Architecture:</span>
                <span className="font-normal text-slate-300">
                  Only the <strong className="text-white">{mandatoryTotal} Mandatory Core Drivers</strong> decide fundamental sizing. Optional questions ({optionalTotal}) gracefully default to Modern Best Practice (Fit-to-Standard) without inflating hours.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleFastTrackStandard}
              className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 flex items-center gap-1 cursor-pointer transition shadow-xs"
              title="Ensure all mandatory questions are set to Standard and optional to Fit-to-Standard"
            >
              <CheckCheck size={12} />
              <span>⚡ Lock Fast-Track Baseline</span>
            </button>
          </div>
        </div>

        {/* SUB-HEADER TOOLBAR: Scope Filters & Presets */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 text-xs">
          {/* Scope Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              type="button"
              onClick={() => setScopeFilter('mandatory')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                scopeFilter === 'mandatory'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                  : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Star size={11} className={scopeFilter === 'mandatory' ? 'text-amber-200 fill-amber-200' : 'text-amber-600'} />
              <span>⚡ Mandatory Core ({mandatoryTotal} Qs)</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                scopeFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All 20 Questions ({questions.length})
            </button>

            <button
              type="button"
              onClick={() => setScopeFilter('optional')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                scopeFilter === 'optional'
                  ? 'bg-slate-700 text-white border-slate-800 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Optional Deep-Dives ({optionalTotal})
            </button>

            <button
              type="button"
              onClick={() => setScopeFilter('flagged')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border flex items-center gap-1 ${
                scopeFilter === 'flagged'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                  : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
              }`}
            >
              <FileQuestion size={11} />
              <span>Flagged Q&A</span>
            </button>
          </div>

          {/* Quick Presets & Search */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {viewMode === 'worksheet' && (
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter question text..."
                  className="pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-300 w-36 sm:w-44 focus:outline-none focus:border-slate-900"
                />
              </div>
            )}

            <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Set All:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(0)}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                title="Set all questions to Level 1 (Modern Best Practice)"
              >
                C1 MBP
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1)}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                title="Set all questions to Level 2 (Standard Cloud)"
              >
                C2 Std
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(2)}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                title="Set all questions to Level 3 (Complex / Multi-Entity)"
              >
                C3 Comp
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(3)}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                title="Set all questions to Level 4 (Bespoke / Custom Extensions)"
              >
                C4 Cust
              </button>
            </div>
          </div>
        </div>

        {/* MODAL BODY CONTAINER WITH HORIZONTAL & VERTICAL SCROLLBARS */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 bg-slate-100/60 scrollbar-thin scrollbar-thumb-slate-300">
          
          {/* ========================================================================= */}
          {/* VIEW 1: FULL 20-QUESTION WORKSHEET GRID (ALL DETAILS FULLY DISPLAYED)     */}
          {/* ========================================================================= */}
          {viewMode === 'worksheet' && (
            <div className="space-y-4 min-w-[760px]">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">No questions match the current filter.</p>
                  <button
                    type="button"
                    onClick={() => { setScopeFilter('all'); setCategoryFilter('all'); setSearchQuery(''); }}
                    className="mt-2 text-xs text-indigo-600 underline font-bold cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const originalIdx = questions.findIndex(item => item.id === q.id);
                  const isMandatory = isQuestionMandatory(q, originalIdx);
                  const tag = getQuestionTag(q, originalIdx);
                  const currentOpt = currentAnswers[originalIdx] !== undefined ? currentAnswers[originalIdx] : 1;
                  const qMeta = scenario.questionConfidenceMeta?.[moduleId]?.[originalIdx];
                  const isClarificationNeeded = qMeta?.clientClarificationNeeded;

                  return (
                    <div 
                      key={q.id} 
                      className={`bg-white border shadow-xs space-y-3.5 transition hover:border-slate-300 p-4 sm:p-5 ${
                        isMandatory
                          ? 'border-l-4 border-l-amber-500 border-slate-200'
                          : 'border-l-4 border-l-slate-300 border-slate-200'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className={`w-7 h-7 rounded-xs font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isMandatory ? 'bg-amber-600 text-white' : 'bg-slate-800 text-white'
                          }`}>
                            Q{originalIdx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {isMandatory ? (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Star size={10} className="fill-amber-600 text-amber-600" />
                                  ⭐ MANDATORY • {tag.toUpperCase()}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                  OPTIONAL • {tag.toUpperCase()}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(q.category)}`}>
                                {q.category}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {q.question}
                            </h4>
                            {q.rationale && (
                              <p className="text-xs text-slate-600 mt-1 italic bg-slate-50 p-2 border-l-2 border-slate-400">
                                <strong className="font-semibold text-slate-800 not-italic">Architectural Context:</strong> {q.rationale}
                              </p>
                            )}
                            {qMeta?.proposalCitation && (
                              <div className="text-xs text-indigo-800 font-serif italic bg-indigo-50/70 p-2 border-l-2 border-indigo-500 mt-1.5">
                                Proposal Evidence: &ldquo;{qMeta.proposalCitation}&rdquo;
                              </div>
                            )}
                            {qMeta && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                                  qMeta.confidence === 'high'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : qMeta.confidence === 'medium'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                  {qMeta.percentage}% {qMeta.confidence.toUpperCase()} ({
                                    qMeta.source === 'scoping_sheet'
                                      ? 'Scoping Sheet (Priority)'
                                      : qMeta.source === 'ai_proposal'
                                      ? 'AI Ingested'
                                      : qMeta.source === 'bid_default'
                                      ? 'Bid Default'
                                      : qMeta.source === 'manual_override'
                                      ? 'User Set'
                                      : 'Default Benchmark'
                                  })
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFlag(originalIdx)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border flex items-center gap-1 font-mono ${
                              isClarificationNeeded
                                ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                            title="Flag this question for client clarification Q&A"
                          >
                            <FileQuestion size={12} />
                            <span>{isClarificationNeeded ? 'Flagged Q&A' : '+ Flag'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 Complexity Options (1-Click Selection Cards with Full Description) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = currentOpt === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(originalIdx, optIdx)}
                              className={`p-3 text-left border transition cursor-pointer flex flex-col justify-between rounded-xs ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-900'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border ${
                                    isSelected ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
                                  }`}>
                                    Level {opt.score} (C{opt.score})
                                  </span>
                                  {isSelected ? (
                                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                                      <Check size={12} /> Selected
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      +{opt.hoursImpact || 0}h
                                    </span>
                                  )}
                                </div>
                                <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                  {opt.label}
                                </div>
                                <p className={`text-[11px] leading-relaxed break-words ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {opt.desc}
                                </p>
                              </div>

                              <div className={`mt-2.5 pt-1.5 border-t text-[10px] font-mono flex items-center justify-between ${
                                isSelected ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-400'
                              }`}>
                                <span>{opt.score === 1 ? 'Fit-to-Standard' : opt.score === 2 ? 'Configured Cloud' : opt.score === 3 ? 'Complex Tier' : 'Bespoke Custom'}</span>
                                <span className={isSelected ? 'text-amber-300 font-bold' : ''}>+{opt.hoursImpact || 0} hrs</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: STEP-BY-STEP GUIDED INTERVIEW WIZARD (FOCUS SINGLE QUESTION)      */}
          {/* ========================================================================= */}
          {viewMode === 'wizard' && (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Wizard Scope Switch */}
              <div className="flex items-center justify-between bg-white p-3 border border-slate-200 shadow-xs text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Interview Mode:</span>
                  <button
                    type="button"
                    onClick={() => { setWizardOnlyMandatory(true); setActiveQuestionIdx(0); }}
                    className={`px-2.5 py-1 text-xs font-bold transition cursor-pointer border ${
                      wizardOnlyMandatory
                        ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⚡ Fast-Track Core Only ({mandatoryTotal} Qs)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWizardOnlyMandatory(false); setActiveQuestionIdx(0); }}
                    className={`px-2.5 py-1 text-xs font-bold transition cursor-pointer border ${
                      !wizardOnlyMandatory
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All 20 Questions
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Question {activeQuestionIdx + 1} of {wizardQuestions.length}
                </div>
              </div>

              {/* Question Number Pills Bar */}
              <div className="bg-white p-3 border border-slate-200 shadow-xs">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {wizardQuestions.map((q, idx) => {
                    const origIdx = questions.findIndex(item => item.id === q.id);
                    const ans = (currentAnswers[origIdx] || 0) + 1;
                    const isCurrent = idx === activeQuestionIdx;
                    const isMandatory = isQuestionMandatory(q, origIdx);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`h-8 text-[10px] font-mono font-bold transition flex items-center justify-center cursor-pointer border ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-indigo-500 shadow-xs'
                            : isMandatory
                            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        title={`Q${origIdx + 1}: Level C${ans}`}
                      >
                        Q{origIdx + 1} {isMandatory && '⭐'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Focused Question Card */}
              <div className="bg-white border border-slate-300 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-white font-mono font-bold text-xs ${
                      isQuestionMandatory(activeWizardQuestion, activeOriginalIdx) ? 'bg-amber-600' : 'bg-slate-900'
                    }`}>
                      Q{activeOriginalIdx + 1} of {questions.length}
                    </span>
                    {isQuestionMandatory(activeWizardQuestion, activeOriginalIdx) && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        ⭐ MANDATORY DRIVER
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${getCategoryColor(activeWizardQuestion.category)}`}>
                      {activeWizardQuestion.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFlag(activeOriginalIdx)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition cursor-pointer border flex items-center gap-1.5 font-mono ${
                      activeQuestionMeta?.clientClarificationNeeded
                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <FileQuestion size={13} />
                    <span>{activeQuestionMeta?.clientClarificationNeeded ? 'Flagged for Client' : 'Flag Question'}</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {activeWizardQuestion.question}
                  </h3>
                  {activeWizardQuestion.rationale && (
                    <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200 text-xs text-blue-950 leading-relaxed">
                      <strong className="font-bold text-blue-900 block mb-0.5">Architectural Guidance:</strong>
                      {activeWizardQuestion.rationale}
                    </div>
                  )}
                  {activeQuestionMeta?.proposalCitation && (
                    <div className="mt-2.5 p-3 bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 italic font-serif">
                      Proposal Reference: &ldquo;{activeQuestionMeta.proposalCitation}&rdquo;
                    </div>
                  )}
                </div>

                {/* 4 Option Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {activeWizardQuestion.options.map((opt, optIdx) => {
                    const isSelected = activeQuestionAnswer === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(activeOriginalIdx, optIdx)}
                        className={`p-4 text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-1 ring-slate-900'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 text-xs font-mono font-bold border ${
                              isSelected ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                            }`}>
                              C{opt.score} - {opt.score === 1 ? 'MBP' : opt.score === 2 ? 'Standard' : opt.score === 3 ? 'Complex' : 'Custom'}
                            </span>
                            {isSelected ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                <CheckCircle2 size={15} /> Selected
                              </span>
                            ) : (
                              <span className="text-xs font-mono text-slate-400">+{opt.hoursImpact || 0}h</span>
                            )}
                          </div>
                          <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {opt.label}
                          </h4>
                          <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                            {opt.desc}
                          </p>
                        </div>

                        <div className={`mt-3 pt-2 border-t text-[11px] font-mono flex items-center justify-between ${
                          isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'
                        }`}>
                          <span>Effort Impact:</span>
                          <strong className={isSelected ? 'text-amber-300' : 'text-slate-800'}>+{opt.hoursImpact || 0} hours</strong>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Wizard Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1))}
                    disabled={activeQuestionIdx === 0}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs font-mono text-slate-500 font-bold">
                    {activeQuestionIdx + 1} / {wizardQuestions.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveQuestionIdx(Math.min(wizardQuestions.length - 1, activeQuestionIdx + 1))}
                    disabled={activeQuestionIdx === wizardQuestions.length - 1}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER BAR */}
        <div className="bg-white p-3.5 sm:px-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-3 text-slate-600 flex-wrap">
            <span>
              Base Effort: <strong className="text-slate-900 font-mono">{moduleDef.baseEffortHours || 400} hrs</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Scoping Delta: <strong className="text-emerald-700 font-mono">+{totalDeltaHours} hrs</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Derived T-Shirt: <strong className="text-amber-700 font-mono font-bold">{calculatedTShirt}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Scoping Status: <strong className={isCoreComplete ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                {isCoreComplete ? "⚡ Core Validated" : "⚠️ Needs Mandatory Answers"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
            >
              Done / Close Scoping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
