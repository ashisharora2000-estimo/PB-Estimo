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
  List
} from 'lucide-react';
import {
  ProjectScenario,
  OracleModule,
  ModuleScopingQuestion,
  TShirtSize
} from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import { getQuestionsForModule } from '../../data/moduleScopingQuestions';
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  // Average score & T-shirt calculation
  const { avgScore, totalDeltaHours, calculatedTShirt } = useMemo(() => {
    if (questions.length === 0) return { avgScore: 2.0, totalDeltaHours: 0, calculatedTShirt: 'M' as TShirtSize };
    
    let sumScore = 0;
    let sumDelta = 0;
    questions.forEach((q, idx) => {
      const optIdx = currentAnswers[idx] !== undefined ? currentAnswers[idx] : 1;
      sumScore += (optIdx + 1);
      sumDelta += (q.options[optIdx]?.hoursImpact || 0);
    });

    const avg = sumScore / questions.length;
    let size: TShirtSize = 'M';
    if (avg <= 1.25) size = 'XS';
    else if (avg <= 1.85) size = 'S';
    else if (avg <= 2.65) size = 'M';
    else if (avg <= 3.35) size = 'L';
    else if (avg <= 3.80) size = 'XL';
    else size = 'XXL';

    return {
      avgScore: avg,
      totalDeltaHours: sumDelta,
      calculatedTShirt: size
    };
  }, [questions, currentAnswers]);

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

  const filteredQuestions = questions.filter(q => {
    const matchCat = categoryFilter === 'all' || q.category === categoryFilter;
    const matchSearch = !searchQuery || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.rationale?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()) || o.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const activeQuestion = questions[activeQuestionIdx] || questions[0];
  const activeQuestionAnswer = currentAnswers[activeQuestionIdx] !== undefined ? currentAnswers[activeQuestionIdx] : 1;
  const activeQuestionMeta = scenario.questionConfidenceMeta?.[moduleId]?.[activeQuestionIdx];

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
                  20-Question Scoping Worksheet
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono uppercase">
                  {moduleDef.pillar}
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
                title="View all 20 questions in full tabular worksheet"
              >
                <Grid size={12} />
                <span className="hidden sm:inline">All 20 Grid</span>
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

        {/* SUB-HEADER TOOLBAR: Category Pills & Batch Actions */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 text-xs">
          {/* Categories / Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All 20 Questions' : cat}
              </button>
            ))}
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
              {filteredQuestions.map((q) => {
                const originalIdx = questions.findIndex(item => item.id === q.id);
                const currentOpt = currentAnswers[originalIdx] !== undefined ? currentAnswers[originalIdx] : 1;
                const qMeta = scenario.questionConfidenceMeta?.[moduleId]?.[originalIdx];
                const isClarificationNeeded = qMeta?.clientClarificationNeeded;

                return (
                  <div 
                    key={q.id} 
                    className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5 transition hover:border-slate-300"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-xs bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          Q{originalIdx + 1}
                        </span>
                        <div>
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
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(q.category)}`}>
                          {q.category}
                        </span>
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
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: STEP-BY-STEP GUIDED INTERVIEW WIZARD (FOCUS SINGLE QUESTION)      */}
          {/* ========================================================================= */}
          {viewMode === 'wizard' && (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Question Number Pills Bar */}
              <div className="bg-white p-3 border border-slate-200 shadow-xs">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Question Progression (1 to 20):</span>
                  <span>{activeQuestionIdx + 1} of {questions.length}</span>
                </div>
                <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
                  {questions.map((q, idx) => {
                    const ans = (currentAnswers[idx] || 0) + 1;
                    const isCurrent = idx === activeQuestionIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`h-7 text-[10px] font-mono font-bold transition flex items-center justify-center cursor-pointer border ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-indigo-500 shadow-xs'
                            : ans === 1
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : ans === 2
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : ans === 3
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                        title={`Q${idx + 1}: Level C${ans}`}
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Focused Question Card */}
              <div className="bg-white border border-slate-300 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs">
                      Question {activeQuestionIdx + 1} of {questions.length}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${getCategoryColor(activeQuestion.category)}`}>
                      {activeQuestion.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFlag(activeQuestionIdx)}
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
                    {activeQuestion.question}
                  </h3>
                  {activeQuestion.rationale && (
                    <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200 text-xs text-blue-950 leading-relaxed">
                      <strong className="font-bold text-blue-900 block mb-0.5">Architectural Guidance:</strong>
                      {activeQuestion.rationale}
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
                  {activeQuestion.options.map((opt, optIdx) => {
                    const isSelected = activeQuestionAnswer === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(activeQuestionIdx, optIdx)}
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
                    <span>Previous Question</span>
                  </button>

                  <span className="text-xs font-mono text-slate-500 font-bold">
                    {activeQuestionIdx + 1} / {questions.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveQuestionIdx(Math.min(questions.length - 1, activeQuestionIdx + 1))}
                    disabled={activeQuestionIdx === questions.length - 1}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Next Question</span>
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
              20-Q Scoping Delta: <strong className="text-emerald-700 font-mono">+{totalDeltaHours} hrs</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Defensible Total: <strong className="text-indigo-700 font-mono font-bold">{(moduleDef.baseEffortHours || 400) + totalDeltaHours} hrs</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
            >
              Done / Close Worksheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
