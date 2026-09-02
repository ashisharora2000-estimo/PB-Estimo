import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  HelpCircle,
  Cpu,
  Layers,
  Check,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  X,
  FileQuestion,
  TrendingUp
} from 'lucide-react';
import { ProjectScenario, CustomScopingQuestion, CustomScaleDriver } from '../../types';
import { generateDynamicScopingQuestions, askOracleAiAdvisor } from '../../utils/aiService';

interface AiComplexityStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  onUpdateScenario: (updated: Partial<ProjectScenario>) => void;
  initialTab?: 'complexity' | 'questions' | 'drivers' | 'ai_advisor';
  initialAiPrompt?: string;
}

const INDUSTRY_PRESETS = [
  'Manufacturing & Automotive',
  'Healthcare & Pharmaceuticals',
  'Financial Services & Banking',
  'Retail & Consumer Goods (CPG)',
  'Energy, Utilities & Mining',
  'Public Sector & Education',
  'High-Tech & Telecommunications'
];

export const AiComplexityStudioModal: React.FC<AiComplexityStudioModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario,
  initialTab = 'complexity',
  initialAiPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'complexity' | 'questions' | 'drivers' | 'ai_advisor'>(initialTab);
  
  // Complexity Dial
  const currentMultiplier = scenario.globalComplexityMultiplier || 1.0;
  const [complexityVal, setComplexityVal] = useState<number>(currentMultiplier);

  // Dynamic Questions
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Manufacturing & Automotive');
  const [targetFocus, setTargetFocus] = useState<string>('CEMLI & Integration Volatility');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Manual Question Form
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('Global Template & Governance');
  const [newQuestionDesc, setNewQuestionDesc] = useState('');
  const [optLowLabel, setOptLowLabel] = useState('Standard Vanilla MBP (Low)');
  const [optLowHours, setOptLowHours] = useState(0);
  const [optMedLabel, setOptMedLabel] = useState('Moderate Customization (Medium)');
  const [optMedHours, setOptMedHours] = useState(250);
  const [optHighLabel, setOptHighLabel] = useState('Complex Multi-Entity Divergence (High)');
  const [optHighHours, setOptHighHours] = useState(600);
  const [optExtLabel, setOptExtLabel] = useState('Extreme Bespoke PaaS / Global (Extreme)');
  const [optExtHours, setOptExtHours] = useState(1100);

  // Custom Scale Driver Form
  const [driverName, setDriverName] = useState('');
  const [driverCategory, setDriverCategory] = useState('Technical CEMLI');
  const [driverValue, setDriverValue] = useState(1);
  const [driverHoursPerUnit, setDriverHoursPerUnit] = useState(60);

  // AI Advisor Chat
  const [aiPrompt, setAiPrompt] = useState(initialAiPrompt || '');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyComplexity = (val: number) => {
    setComplexityVal(val);
    onUpdateScenario({ globalComplexityMultiplier: val });
  };

  const handleGenerateAiQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      // Guardrail 5: Auto-capture state snapshot prior to dynamic AI question generation
      try {
        const stored = localStorage.getItem(`fusion_snapshots_${scenario.id}`);
        const existingSnaps = stored ? JSON.parse(stored) : [];
        const newSnap = {
          id: `snap_ai_${Date.now()}`,
          name: `Pre-AI Dynamic Scoping: ${selectedIndustry}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
          actionSource: 'ai_ingest',
          scenarioState: JSON.parse(JSON.stringify(scenario)),
          summary: `Auto-saved prior to AI question generation (${targetFocus})`,
          metrics: {
            totalHours: 0,
            timelineWeeks: scenario.projectWeeks,
            moduleCount: scenario.selectedModules.length
          }
        };
        localStorage.setItem(`fusion_snapshots_${scenario.id}`, JSON.stringify([newSnap, ...existingSnaps].slice(0, 15)));
      } catch {
        // ignore
      }

      const res = await generateDynamicScopingQuestions(
        selectedIndustry,
        scenario.selectedModules,
        scenario.scaleDrivers,
        targetFocus
      );

      if (res.questions && res.questions.length > 0) {
        const existing = scenario.customQuestions || [];
        const formattedNew: CustomScopingQuestion[] = res.questions.map((q: any, idx: number) => ({
          id: q.id || `dyn_q_${Date.now()}_${idx}`,
          category: q.category || 'Global Template & Governance',
          title: q.title,
          description: q.description || '',
          options: q.options || [
            { label: 'C1: Standard', score: 1, scheduleWeeks: 0, hoursImpact: 0, desc: 'Low', rationale: 'Low' },
            { label: 'C2: Moderate', score: 2, scheduleWeeks: 1.5, hoursImpact: 250, desc: 'Med', rationale: 'Med' },
            { label: 'C3: High', score: 3, scheduleWeeks: 3.0, hoursImpact: 500, desc: 'High', rationale: 'High' },
            { label: 'C4: Extreme', score: 4, scheduleWeeks: 5.0, hoursImpact: 900, desc: 'Ext', rationale: 'Ext' }
          ],
          selectedOptionIndex: 1
        }));

        onUpdateScenario({
          customQuestions: [...existing, ...formattedNew]
        });
      }
    } catch (e) {
      console.error('Failed to generate dynamic questions:', e);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAddManualQuestion = () => {
    if (!newQuestionTitle.trim()) return;

    const newQ: CustomScopingQuestion = {
      id: `custom_q_${Date.now()}`,
      category: newQuestionCategory,
      title: newQuestionTitle.trim(),
      description: newQuestionDesc.trim() || 'User defined scoping assessment question.',
      options: [
        { label: optLowLabel, score: 1, scheduleWeeks: 0, hoursImpact: Number(optLowHours), desc: 'Low friction', rationale: 'Standard' },
        { label: optMedLabel, score: 2, scheduleWeeks: 1.5, hoursImpact: Number(optMedHours), desc: 'Moderate friction', rationale: 'Moderate variance' },
        { label: optHighLabel, score: 3, scheduleWeeks: 3.0, hoursImpact: Number(optHighHours), desc: 'High friction', rationale: 'High complexity' },
        { label: optExtLabel, score: 4, scheduleWeeks: 5.0, hoursImpact: Number(optExtHours), desc: 'Extreme bespoke', rationale: 'Maximum complexity' }
      ],
      selectedOptionIndex: 1
    };

    const existing = scenario.customQuestions || [];
    onUpdateScenario({
      customQuestions: [...existing, newQ]
    });

    setNewQuestionTitle('');
    setNewQuestionDesc('');
  };

  const handleDeleteQuestion = (id: string) => {
    const existing = scenario.customQuestions || [];
    onUpdateScenario({
      customQuestions: existing.filter(q => q.id !== id)
    });
  };

  const handleAddScaleDriver = () => {
    if (!driverName.trim()) return;

    const newDriver: CustomScaleDriver = {
      id: `driver_${Date.now()}`,
      name: driverName.trim(),
      category: driverCategory,
      value: Number(driverValue) || 1,
      hoursPerUnit: Number(driverHoursPerUnit) || 50
    };

    const existing = scenario.customScaleDrivers || [];
    onUpdateScenario({
      customScaleDrivers: [...existing, newDriver]
    });

    setDriverName('');
  };

  const handleDeleteDriver = (id: string) => {
    const existing = scenario.customScaleDrivers || [];
    onUpdateScenario({
      customScaleDrivers: existing.filter(d => d.id !== id)
    });
  };

  const handleAskAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await askOracleAiAdvisor(aiPrompt, {
        scenarioName: scenario.name,
        modules: scenario.selectedModules,
        scaleDrivers: scenario.scaleDrivers,
        complexityMultiplier: complexityVal,
        rolloutApproach: scenario.rolloutApproach
      });
      setAiResponse(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-indigo-600 text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Project Complexity, Questions & AI Co-Pilot Studio
              </h2>
              <p className="text-xs text-slate-500">
                Adjust global complexity multipliers, generate AI scoping questions, and calibrate custom drivers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('complexity')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'complexity'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Global Complexity Dial ({((complexityVal - 1) * 100).toFixed(0)}%)
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            Custom Scoping Questions ({(scenario.customQuestions || []).length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'drivers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Custom Scale Drivers ({(scenario.customScaleDrivers || []).length})
          </button>
          <button
            onClick={() => setActiveTab('ai_advisor')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ai_advisor'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Enterprise Co-Pilot
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GLOBAL COMPLEXITY DIAL */}
          {activeTab === 'complexity' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950">
                      Global Project Complexity Multiplier ({complexityVal.toFixed(2)}x)
                    </h3>
                    <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                      Scale the entire project baseline effort (P50, P80, P95) by an overarching complexity factor.
                      This dynamically calibrates cross-pillar friction without requiring manual edits to individual module answers.
                    </p>
                  </div>
                  <span className="text-xl font-extrabold text-indigo-700 font-mono bg-white px-3 py-1.5 rounded border border-indigo-200 shadow-xs shrink-0">
                    {complexityVal >= 1.0 ? `+${((complexityVal - 1) * 100).toFixed(0)}%` : `-${((1 - complexityVal) * 100).toFixed(0)}%`}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>0.80x (-20% Lean)</span>
                    <span>1.00x (TCM Baseline)</span>
                    <span>1.50x (+50% High)</span>
                    <span>2.00x (+100% Extreme)</span>
                    <span>3.00x (+200% Max)</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="3.00"
                    step="0.05"
                    value={complexityVal}
                    onChange={(e) => handleApplyComplexity(parseFloat(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Quick Complexity Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  One-Click Enterprise Complexity Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: 'Standard TCM Baseline', val: 1.0, sub: 'No overarching multiplier (+0%)', desc: 'Standard Oracle Modern Best Practice delivery' },
                    { label: 'Regulated / Strict Compliance', val: 1.2, sub: '+20% Regulatory Overhead', desc: 'FDA 21 CFR Part 11, GxP, SOX, or Banking audit scrutiny' },
                    { label: 'Legacy Data Debt & Heavy PaaS', val: 1.35, sub: '+35% Integration Friction', desc: 'High legacy ERP fragmentation with custom ETL pipelines' },
                    { label: 'Global Multi-Entity Matrix', val: 1.5, sub: '+50% Global Enterprise', desc: 'Cross-border statutory tax, multi-currency & 4+ operating lines' },
                    { label: 'M&A Carve-Out & Divestiture', val: 1.75, sub: '+75% Time-Critical Carve-Out', desc: 'TSA deadlines with concurrent legacy extraction & dual-run' },
                    { label: 'Extreme Global Conglomerate', val: 2.0, sub: '+100% Double Baseline', desc: 'Full custom PaaS ecosystem across 20+ countries' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleApplyComplexity(preset.val)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        Math.abs(complexityVal - preset.val) < 0.01
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{preset.label}</span>
                        <span className="text-xs font-mono font-bold text-indigo-600">{preset.val.toFixed(2)}x</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{preset.sub}</div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM SCOPING QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* AI Auto-Generate Questions Box */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold">
                      AI Dynamic Industry Scoping Questions Generator
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-indigo-300 bg-indigo-900/80 px-2 py-0.5 rounded border border-indigo-700">
                    Gemini 3.7 Flash Engine
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Select your target vertical and functional focus to auto-generate 3-5 tailored, high-depth scoping questions with pre-calibrated schedule and hours impacts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Target Industry</label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:ring-1 focus:ring-indigo-500"
                    >
                      {INDUSTRY_PRESETS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Focus Area</label>
                    <select
                      value={targetFocus}
                      onChange={(e) => setTargetFocus(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="CEMLI & Integration Volatility">CEMLI & Integration Volatility</option>
                      <option value="Statutory Tax & Multi-Country Localization">Statutory Tax & Multi-Country Localization</option>
                      <option value="Legacy Coexistence & Data Cleansing">Legacy Coexistence & Data Cleansing</option>
                      <option value="Operating Model & Chart of Accounts">Operating Model & Chart of Accounts</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAiQuestions}
                  disabled={isGeneratingQuestions}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {isGeneratingQuestions ? 'Generating Industry Questions via Gemini...' : 'Generate 3 Industry Scoping Questions'}
                </button>
              </div>

              {/* Existing Custom Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Active Custom Questions ({(scenario.customQuestions || []).length})
                  </h4>
                  <span className="text-xs text-slate-500">
                    Answers contribute directly to total base hours and schedule duration
                  </span>
                </div>

                {(scenario.customQuestions || []).length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    No custom scoping questions added yet. Use the AI generator above or add one manually below.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(scenario.customQuestions || []).map((q, idx) => {
                      const currentAnsIdx = (scenario.customQuestionAnswers && scenario.customQuestionAnswers[q.id] !== undefined)
                        ? scenario.customQuestionAnswers[q.id]
                        : (q.selectedOptionIndex !== undefined ? q.selectedOptionIndex : 1);

                      return (
                        <div key={q.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-3 shadow-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                {q.category}
                              </span>
                              <h5 className="text-sm font-bold text-slate-900 mt-1">{q.title}</h5>
                              <p className="text-xs text-slate-500 mt-0.5">{q.description}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Options selector */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = currentAnsIdx === oIdx;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => {
                                    const updatedAnswers = { ...(scenario.customQuestionAnswers || {}) };
                                    updatedAnswers[q.id] = oIdx;
                                    onUpdateScenario({ customQuestionAnswers: updatedAnswers });
                                  }}
                                  className={`p-2.5 text-left rounded border transition-all text-xs ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500 text-indigo-950 font-semibold'
                                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold truncate">{opt.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                                    <span>+{opt.hoursImpact} hrs</span>
                                    <span>+{opt.scheduleWeeks} wks</span>
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
              </div>

              {/* Add Manual Question Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Add Custom Scoping Question Manually
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-600 block mb-1">Question Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Degree of PaaS Visual Builder Extensions Needed"
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Category</label>
                    <select
                      value={newQuestionCategory}
                      onChange={(e) => setNewQuestionCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-2 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Global Template & Governance">Global Template & Governance</option>
                      <option value="Legacy Coexistence & Technical">Legacy Coexistence & Technical</option>
                      <option value="Regional Localization & Statutory">Regional Localization & Statutory</option>
                      <option value="Wave Execution & Cutover">Wave Execution & Cutover</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-600 block mb-1">Description / Context</label>
                  <input
                    type="text"
                    placeholder="Brief description of the operational impact..."
                    value={newQuestionDesc}
                    onChange={(e) => setNewQuestionDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded text-xs p-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Option 1 (Low)</span>
                    <input
                      type="text"
                      value={optLowLabel}
                      onChange={(e) => setOptLowLabel(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1"
                    />
                    <input
                      type="number"
                      placeholder="Hours (e.g. 0)"
                      value={optLowHours}
                      onChange={(e) => setOptLowHours(Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 rounded p-1 font-mono"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Option 2 (Medium)</span>
                    <input
                      type="text"
                      value={optMedLabel}
                      onChange={(e) => setOptMedLabel(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1"
                    />
                    <input
                      type="number"
                      placeholder="Hours (e.g. 250)"
                      value={optMedHours}
                      onChange={(e) => setOptMedHours(Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 rounded p-1 font-mono"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Option 3 (High)</span>
                    <input
                      type="text"
                      value={optHighLabel}
                      onChange={(e) => setOptHighLabel(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1"
                    />
                    <input
                      type="number"
                      placeholder="Hours (e.g. 600)"
                      value={optHighHours}
                      onChange={(e) => setOptHighHours(Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 rounded p-1 font-mono"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Option 4 (Extreme)</span>
                    <input
                      type="text"
                      value={optExtLabel}
                      onChange={(e) => setOptExtLabel(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1"
                    />
                    <input
                      type="number"
                      placeholder="Hours (e.g. 1100)"
                      value={optExtHours}
                      onChange={(e) => setOptExtHours(Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 rounded p-1 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddManualQuestion}
                  disabled={!newQuestionTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Question to Active Questionnaire
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM SCALE DRIVERS */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Add Custom Physical CEMLI / Scale Driver
                </h4>
                <p className="text-xs text-slate-500">
                  Add bespoke volumetric scale drivers (such as Custom AI Agents, Legacy EDI Feeds, or Autonomous Warehouses) with fixed hours-per-unit parametric sizing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-600 block mb-1">Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Custom GenAI Workflow Agents"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Unit Count (Qty)</label>
                    <input
                      type="number"
                      min="1"
                      value={driverValue}
                      onChange={(e) => setDriverValue(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Hours per Unit</label>
                    <input
                      type="number"
                      min="1"
                      value={driverHoursPerUnit}
                      onChange={(e) => setDriverHoursPerUnit(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-2 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddScaleDriver}
                  disabled={!driverName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Scale Driver
                </button>
              </div>

              {/* Active Custom Drivers List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Custom Drivers ({(scenario.customScaleDrivers || []).length})
                </h4>

                {(scenario.customScaleDrivers || []).length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    No custom scale drivers added yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(scenario.customScaleDrivers || []).map((d) => (
                      <div key={d.id} className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-xs">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {d.value} units × {d.hoursPerUnit} hrs/unit = <span className="font-mono font-bold text-indigo-600">{d.value * d.hoursPerUnit} hrs</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDriver(d.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AI ADVISOR ASSISTANT */}
          {activeTab === 'ai_advisor' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Ask Oracle Global Cloud Transformation Architect
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., How should we structure the commercial pricing and delivery risk buffers for a 4-wave SCM & Financials transformation with 30 OIC interfaces?"
                  className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                />

                <div className="flex flex-wrap gap-2">
                  {[
                    'Optimize Gross Margin to 48%',
                    'Audit Pod Patching & UAT Conflict Risk',
                    'Draft RFP Governance & Risk Defenses',
                    'Recommend Phased Wave Strategy'
                  ].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => setAiPrompt(quick)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded text-[11px] text-slate-700 transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAskAi}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {isAiLoading ? 'Synthesizing Strategic Advisory...' : 'Ask AI Transformation Advisor'}
                </button>
              </div>

              {aiResponse && (
                <div className="bg-white border border-indigo-200 rounded-lg p-5 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Architect Synthesis:
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100 font-sans">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Active Multiplier: <strong>{complexityVal.toFixed(2)}x</strong> | Custom Questions: <strong>{(scenario.customQuestions || []).length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded shadow-xs"
          >
            Apply & Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
