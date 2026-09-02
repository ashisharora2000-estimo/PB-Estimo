import React, { useState, useMemo } from 'react';
import {
  FileQuestion,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Send,
  Zap,
  Sliders,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  ProjectScenario,
  OracleModule,
  ClientClarificationItem,
  ConfidenceLevel,
  ModuleScopingQuestion
} from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import { getQuestionsForModule } from '../../data/moduleScopingQuestions';
import { exportClientQaToCsv } from '../../utils/exporter';
import { AttributionBadge } from '../common/AttributionBadge';

interface ClientQaModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const ClientQaModal: React.FC<ClientQaModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'low_only' | 'medium_low' | 'threshold'>('low_only');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'hitl_cards' | 'tabular' | 'email_preview'>('hitl_cards');
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);

  // Extract all questions for all in-scope modules
  const allQuestions: ClientClarificationItem[] = useMemo(() => {
    const items: ClientClarificationItem[] = [];

    scenario.selectedModules.forEach(modId => {
      const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
      if (!modDef) return;

      const questionsList = scenario.customModuleQuestions?.[modId] || getQuestionsForModule(modId);
      const answers = scenario.moduleQuestionAnswers?.[modId] || Array(questionsList.length).fill(1);
      const confidenceMeta = scenario.questionConfidenceMeta?.[modId] || {};

      questionsList.forEach((q, qIdx) => {
        const answerIdx = answers[qIdx] !== undefined ? answers[qIdx] : 1;
        const currentOption = q.options[answerIdx] || q.options[0] || 'C2: Standard Configuration';
        const meta = confidenceMeta[qIdx];

        const confidence: ConfidenceLevel = meta?.confidence || (scenario.uploadedProposal ? 'unconfirmed' : 'medium');
        const percentage = meta?.percentage !== undefined ? meta.percentage : (scenario.uploadedProposal ? 40 : 70);
        const citation = meta?.proposalCitation;
        const clarificationNeeded = meta?.clientClarificationNeeded !== undefined
          ? meta.clientClarificationNeeded
          : (percentage < 70);

        items.push({
          id: `${modId}_q${qIdx + 1}`,
          moduleId: modId,
          moduleName: modDef.name,
          pillar: modDef.pillar,
          questionIndex: qIdx + 1,
          questionText: q.question,
          category: q.category,
          currentOptionIndex: answerIdx,
          currentOptionSelected: currentOption,
          suggestedQuestionForClient: generateClientQuestion(q.question, modDef.name, currentOption),
          confidence,
          confidencePercentage: percentage,
          proposalCitation: citation,
          rationale: meta?.rationale || `Assumed ${currentOption} based on standard enterprise baseline. Client SME confirmation recommended.`,
          clientClarificationNeeded: clarificationNeeded,
          clientResponseNotes: meta?.clientNotes
        });
      });
    });

    return items;
  }, [scenario.selectedModules, scenario.moduleQuestionAnswers, scenario.questionConfidenceMeta, scenario.uploadedProposal, scenario.customModuleQuestions]);

  // Filter questions based on controls
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(item => {
      // Confidence filter
      if (filterConfidence === 'low_only') {
        if (item.confidencePercentage >= 70 && !item.clientClarificationNeeded) return false;
      } else if (filterConfidence === 'medium_low') {
        if (item.confidencePercentage >= 85) return false;
      } else if (filterConfidence === 'threshold') {
        if (item.confidencePercentage > confidenceThreshold) return false;
      }

      // Pillar filter
      if (selectedPillar !== 'all' && item.pillar !== selectedPillar) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.questionText.toLowerCase().includes(query) ||
          item.moduleName.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.proposalCitation && item.proposalCitation.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [allQuestions, filterConfidence, confidenceThreshold, selectedPillar, searchQuery]);

  // Confidence statistics
  const stats = useMemo(() => {
    let high = 0;
    let med = 0;
    let low = 0;
    let needsClarification = 0;
    allQuestions.forEach(q => {
      if (q.confidencePercentage >= 85) high++;
      else if (q.confidencePercentage >= 70) med++;
      else low++;
      if (q.confidencePercentage < 70 || q.clientClarificationNeeded) needsClarification++;
    });
    return { high, med, low, needsClarification, total: allQuestions.length };
  }, [allQuestions]);

  if (!isOpen) return null;

  // Level Options for C1-C4
  const LEVEL_SHORT_TAGS = [
    { idx: 0, label: 'C1: MBP', desc: 'Out-of-the-box standard' },
    { idx: 1, label: 'C2: Moderate', desc: 'Standard extensions' },
    { idx: 2, label: 'C3: Complex', desc: 'Heavy customization' },
    { idx: 3, label: 'C4: Extreme', desc: 'Custom core rebuild' }
  ];

  const handleUpdateItemNote = (modId: OracleModule, qIdx: number, note: string) => {
    onUpdateScenario(prev => {
      const currentMeta = prev.questionConfidenceMeta || {};
      const modMeta = currentMeta[modId] || {};
      const currentQMeta = modMeta[qIdx - 1] || {
        confidence: 'medium',
        percentage: 70,
        source: 'default_benchmark',
        clientClarificationNeeded: true
      };

      return {
        ...prev,
        questionConfidenceMeta: {
          ...currentMeta,
          [modId]: {
            ...modMeta,
            [qIdx - 1]: {
              ...currentQMeta,
              clientNotes: note,
              clientClarificationNeeded: true
            }
          }
        }
      };
    });
  };

  const handleSelectOptionIndex = (modId: OracleModule, qIdx: number, optIdx: number) => {
    onUpdateScenario(prev => {
      const currentAnswers = prev.moduleQuestionAnswers?.[modId] || [];
      const updatedAnswers = [...currentAnswers];
      updatedAnswers[qIdx - 1] = optIdx;

      const currentMeta = prev.questionConfidenceMeta || {};
      const modMeta = currentMeta[modId] || {};
      const currentQMeta = modMeta[qIdx - 1] || {};

      return {
        ...prev,
        moduleQuestionAnswers: {
          ...(prev.moduleQuestionAnswers || {}),
          [modId]: updatedAnswers
        },
        questionConfidenceMeta: {
          ...currentMeta,
          [modId]: {
            ...modMeta,
            [qIdx - 1]: {
              ...currentQMeta,
              percentage: 95,
              confidence: 'high',
              clientClarificationNeeded: false,
              source: 'hitl_expert_calibrated'
            }
          }
        }
      };
    });
  };

  const handleAcceptAndVerify = (modId: OracleModule, qIdx: number) => {
    onUpdateScenario(prev => {
      const currentMeta = prev.questionConfidenceMeta || {};
      const modMeta = currentMeta[modId] || {};
      const currentQMeta = modMeta[qIdx - 1] || {};

      return {
        ...prev,
        questionConfidenceMeta: {
          ...currentMeta,
          [modId]: {
            ...modMeta,
            [qIdx - 1]: {
              ...currentQMeta,
              percentage: 95,
              confidence: 'high',
              clientClarificationNeeded: false,
              source: 'hitl_expert_verified'
            }
          }
        }
      };
    });
  };

  const handleBatchVerifyDisplayed = () => {
    onUpdateScenario(prev => {
      const currentMeta = { ...(prev.questionConfidenceMeta || {}) };

      filteredQuestions.forEach(item => {
        const modMeta = currentMeta[item.moduleId] ? { ...currentMeta[item.moduleId] } : {};
        const qMeta = modMeta[item.questionIndex - 1] || {};
        modMeta[item.questionIndex - 1] = {
          ...qMeta,
          percentage: 95,
          confidence: 'high',
          clientClarificationNeeded: false,
          source: 'hitl_batch_verified'
        };
        currentMeta[item.moduleId] = modMeta;
      });

      return {
        ...prev,
        questionConfidenceMeta: currentMeta
      };
    });
  };

  const handleCopyEmail = () => {
    const text = generateFormattedEmailText(scenario, filteredQuestions);
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyMarkdown = () => {
    let md = `# Oracle Program Scoping — Client Q&A Clarification Register\n\n`;
    md += `**Program:** ${scenario.name || 'Oracle Cloud Transformation'}\n`;
    md += `**In-Scope Modules:** ${scenario.selectedModules.length} Modules\n`;
    md += `**Clarification Questions:** ${filteredQuestions.length}\n\n`;
    md += `| Pillar | Module | Question # | Functional Question | Inferred Level | Confidence | Action Required / Suggested Client Question |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    filteredQuestions.forEach(q => {
      md += `| ${q.pillar} | ${q.moduleName} | Q${q.questionIndex} | ${q.questionText} | ${q.currentOptionSelected} | ${q.confidencePercentage}% | ${q.suggestedQuestionForClient} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-none border border-slate-300 shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-none bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                HITL Scoping Loop & Clarification Engine
              </span>
              <span className="px-2 py-0.5 rounded-none bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono">
                {filteredQuestions.length} Questions in Active View
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileQuestion className="text-amber-400" size={22} />
              AI Customer Clarification Generator (HITL Loop)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              1-click filter questions with low AI extraction confidence (&lt; 70%), calibrate C1–C4 complexity answers, and export formal RFP question registers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleBatchVerifyDisplayed}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Promote all visible questions to 95% Verified"
            >
              <ShieldCheck size={14} />
              <span>Verify All Visible (95%)</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
            >
              {copiedMarkdown ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedMarkdown ? 'Copied MD Table!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-400 hover:text-white transition cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Confidence Stats & Filter Bar */}
        <div className="bg-slate-100 p-4 px-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Metrics */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-600" />
              <span className="text-xs text-slate-600 font-semibold">
                Low (&lt;70%): <strong className="text-rose-700 font-mono">{stats.low}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600" />
              <span className="text-xs text-slate-600 font-semibold">
                Moderate (70–84%): <strong className="text-blue-700 font-mono">{stats.med}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-600" />
              <span className="text-xs text-slate-600 font-semibold">
                High (&ge;85%): <strong className="text-emerald-700 font-mono">{stats.high}</strong>
              </span>
            </div>
            <div className="h-4 w-px bg-slate-300 hidden md:block" />
            <span className="text-xs text-slate-500 font-mono">
              Total Questions: <strong>{stats.total}</strong> across {scenario.selectedModules.length} Modules
            </span>
          </div>

          {/* Filtering Tabs & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Toggle */}
            <div className="flex bg-white border border-slate-300 rounded-none p-0.5 text-xs font-bold">
              <button
                onClick={() => setFilterConfidence('low_only')}
                className={`px-3 py-1 cursor-pointer transition ${
                  filterConfidence === 'low_only' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Low Confidence (&lt;70%)
              </button>
              <button
                onClick={() => setFilterConfidence('medium_low')}
                className={`px-3 py-1 cursor-pointer transition ${
                  filterConfidence === 'medium_low' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt; 85%
              </button>
              <button
                onClick={() => setFilterConfidence('all')}
                className={`px-3 py-1 cursor-pointer transition ${
                  filterConfidence === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allQuestions.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions or citations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-slate-900 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('hitl_cards')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'hitl_cards'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap size={14} className={activeTab === 'hitl_cards' ? 'text-amber-600' : 'text-slate-400'} />
            <span>1. Interactive HITL Clarification Cards ({filteredQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tabular')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'tabular'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} className={activeTab === 'tabular' ? 'text-blue-600' : 'text-slate-400'} />
            <span>2. Scoping Register Table</span>
          </button>

          <button
            onClick={() => setActiveTab('email_preview')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'email_preview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send size={14} className={activeTab === 'email_preview' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>3. Client Email / RFP Register Draft</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
          {/* TAB 1: INTERACTIVE HITL CARDS */}
          {activeTab === 'hitl_cards' && (
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 text-slate-500">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-sm text-slate-800">All questions verified!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    No questions below the selected confidence threshold need client clarification.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredQuestions.map((item) => {
                    const isLow = item.confidencePercentage < 70;
                    const isHigh = item.confidencePercentage >= 85;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-none p-5 shadow-xs transition-all ${
                          isLow ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Left: Question details */}
                          <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold text-[10px] uppercase border border-slate-200">
                                {item.pillar}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-900 font-bold text-[11px] border border-slate-200">
                                {item.moduleName} (Q{item.questionIndex})
                              </span>
                              <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-mono">
                                Category: {item.category}
                              </span>

                              {/* Confidence badge & Guardrail 1 Grounded Citation Attribution */}
                              <AttributionBadge
                                type={item.proposalCitation ? 'direct' : isLow ? 'inferred' : 'default'}
                                citation={item.proposalCitation}
                                confidencePct={item.confidencePercentage}
                              />
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                {item.questionText}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {item.rationale}
                              </p>
                            </div>

                            {/* Client Follow-Up Question Prompt */}
                            <div className="p-3 bg-amber-50/70 border border-amber-200 text-xs text-slate-800">
                              <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider mb-0.5">
                                Recommended Client Clarification Question:
                              </span>
                              <p className="font-medium text-slate-900">
                                "{item.suggestedQuestionForClient}"
                              </p>
                            </div>

                            {/* Citation */}
                            {item.proposalCitation && (
                              <div className="p-2 bg-slate-50 border-l-2 border-indigo-500 text-[11px] text-slate-700 italic font-serif">
                                <strong>RFP Reference:</strong> {item.proposalCitation}
                              </div>
                            )}
                          </div>

                          {/* Right: Interactive C1-C4 Selector & Action buttons */}
                          <div className="lg:w-80 shrink-0 bg-slate-50 p-4 border border-slate-200 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                                Select Complexity Tier (C1–C4):
                              </span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {LEVEL_SHORT_TAGS.map((lvl) => {
                                  const isSelected = item.currentOptionIndex === lvl.idx;
                                  return (
                                    <button
                                      key={lvl.idx}
                                      type="button"
                                      onClick={() => handleSelectOptionIndex(item.moduleId, item.questionIndex, lvl.idx)}
                                      className={`p-2 text-left border rounded-none transition cursor-pointer ${
                                        isSelected
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                      }`}
                                    >
                                      <div className="font-bold text-xs">{lvl.label}</div>
                                      <div className={`text-[9px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                        {lvl.desc}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Client SME Notes Input */}
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Client SME Feedback / Notes:
                              </span>
                              <input
                                type="text"
                                placeholder="Enter SME response..."
                                defaultValue={item.clientResponseNotes || ''}
                                onBlur={(e) => handleUpdateItemNote(item.moduleId, item.questionIndex, e.target.value)}
                                className="w-full p-1.5 text-xs border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                              />
                            </div>

                            {/* 1-Click Accept & Upgrade to Verified */}
                            <button
                              type="button"
                              onClick={() => handleAcceptAndVerify(item.moduleId, item.questionIndex)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 size={12} />
                              <span>Verify & Lock (95%)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TABULAR VIEW */}
          {activeTab === 'tabular' && (
            <div className="bg-white border border-slate-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Pillar & Module</th>
                    <th className="py-3 px-3">Question Text</th>
                    <th className="py-3 px-3 text-center">Selected Tier</th>
                    <th className="py-3 px-3 text-center">AI Confidence</th>
                    <th className="py-3 px-3">Follow-Up Question For Client</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredQuestions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.moduleName}</div>
                        <div className="text-[10px] text-slate-500">{item.pillar} | Q{item.questionIndex}</div>
                      </td>
                      <td className="py-3 px-3 max-w-sm">
                        <div className="font-medium text-slate-800 line-clamp-2">{item.questionText}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {item.currentOptionSelected.split(':')[0]}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <span className={item.confidencePercentage >= 85 ? 'text-emerald-700' : 'text-amber-700'}>
                          {item.confidencePercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 max-w-md">
                        {item.suggestedQuestionForClient}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleAcceptAndVerify(item.moduleId, item.questionIndex)}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold uppercase transition cursor-pointer"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: EMAIL PREVIEW */}
          {activeTab === 'email_preview' && (
            <div className="space-y-3 bg-white p-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Client RFP Clarification Email Draft
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-formatted formal register ready to send to client project sponsors.
                  </p>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Full Email Text'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                {generateFormattedEmailText(scenario, filteredQuestions)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Showing <strong>{filteredQuestions.length}</strong> questions across <strong>{scenario.selectedModules.length}</strong> in-scope Oracle modules.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => exportClientQaToCsv(scenario, filteredQuestions)}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download size={14} />
              <span>Export CSV Question Workbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateClientQuestion(question: string, moduleName: string, assumedOption: string): string {
  return `For ${moduleName}, can you confirm if the operational requirement aligns with '${assumedOption}', or if specific organizational complexities require custom extensions? (${question})`;
}

function generateFormattedEmailText(scenario: ProjectScenario, items: ClientClarificationItem[]): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const projectName = scenario.name || 'Oracle Cloud Transformation';

  let email = `Subject: Clarification Questions: ${projectName} — Scoping & Architectural Validation\n\n`;
  email += `Dear Project Leadership & Solution Architecture Team,\n\n`;
  email += `As part of our defensible scoping and estimation process for the ${projectName} program, we have conducted an automated and expert review of the RFP documentation and technical architecture.\n\n`;
  email += `To ensure that our delivery timeline, resource staffing, and commercial baseline are fully aligned with your business processes, we have identified ${items.length} key operational items requiring clarification from your functional process leads.\n\n`;
  email += `Please review the specific questions below and provide guidance on the intended operational approach:\n\n`;
  email += `--------------------------------------------------------------------------------\n`;

  const groupedByPillar: Record<string, ClientClarificationItem[]> = {};
  items.forEach(item => {
    if (!groupedByPillar[item.pillar]) groupedByPillar[item.pillar] = [];
    groupedByPillar[item.pillar].push(item);
  });

  Object.entries(groupedByPillar).forEach(([pillar, questions]) => {
    email += `\n[PILLAR: ${pillar.toUpperCase()}]\n`;
    questions.forEach((q, idx) => {
      email += `\n${idx + 1}. [${q.moduleName}] ${q.questionText}\n`;
      email += `   - Inferred Baseline: ${q.currentOptionSelected}\n`;
      email += `   - AI Extraction Confidence: ${q.confidencePercentage}%\n`;
      if (q.proposalCitation) {
        email += `   - RFP Reference: "${q.proposalCitation}"\n`;
      }
      email += `   - Action Required: ${q.suggestedQuestionForClient}\n`;
      if (q.clientResponseNotes) {
        email += `   - Client Notes: ${q.clientResponseNotes}\n`;
      }
    });
  });

  email += `\n--------------------------------------------------------------------------------\n\n`;
  email += `We would appreciate the opportunity to review these items in a brief working session at your earliest convenience.\n\n`;
  email += `Sincerely,\n`;
  email += `Oracle Cloud Solutions Architecture Practice\n`;

  return email;
}
