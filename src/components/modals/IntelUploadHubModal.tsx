import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Building2,
  Factory,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  X,
  Copy,
  ChevronRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Percent,
  Sliders,
  Calendar,
  Zap,
  BookOpen,
  Info
} from 'lucide-react';
import { ProjectScenario } from '../../types';
import {
  parseComprehensiveIntel,
  INTEL_PACKAGE_PRESETS,
  IntelPackagePreset,
  ComprehensiveIntelParseResult
} from '../../utils/intelIngestionParser';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import { AttributionBadge } from '../common/AttributionBadge';

interface IntelUploadHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenClientQa?: () => void;
}

export const IntelUploadHubModal: React.FC<IntelUploadHubModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario,
  onOpenClientQa
}) => {
  const [activeTab, setActiveTab] = useState<'upload_all' | 'presets' | 'results'>('presets');
  
  // 3 Independent Intel Streams
  const [clientIntelText, setClientIntelText] = useState(scenario.clientIntel?.rawText || '');
  const [industryIntelText, setIndustryIntelText] = useState(scenario.industryIntel?.rawText || '');
  const [specSheetText, setSpecSheetText] = useState(scenario.specSheetIntel?.rawText || '');

  const [activeStreamTab, setActiveStreamTab] = useState<'client' | 'industry' | 'spec'>('client');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ComprehensiveIntelParseResult | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: IntelPackagePreset) => {
    setClientIntelText(preset.clientIntel);
    setIndustryIntelText(preset.industryIntel);
    setSpecSheetText(preset.specSheet);
    
    // Auto-parse on preset selection
    setIsParsing(true);
    setTimeout(() => {
      const result = parseComprehensiveIntel(preset.clientIntel, preset.industryIntel, preset.specSheet);
      setParseResult(result);
      setIsParsing(false);
      setActiveTab('results');
    }, 350);
  };

  const handleExecuteSynthesizer = () => {
    // If all are empty, fall back to first preset
    const cText = clientIntelText.trim() || INTEL_PACKAGE_PRESETS[0].clientIntel;
    const iText = industryIntelText.trim() || INTEL_PACKAGE_PRESETS[0].industryIntel;
    const sText = specSheetText.trim() || INTEL_PACKAGE_PRESETS[0].specSheet;

    setIsParsing(true);
    setTimeout(() => {
      const result = parseComprehensiveIntel(cText, iText, sText);
      setParseResult(result);
      setIsParsing(false);
      setActiveTab('results');
    }, 450);
  };

  const handleApplyToScenario = () => {
    if (!parseResult) return;

    // Guardrail 5: Auto-capture immutable snapshot prior to applying AI/Intel updates
    try {
      const stored = localStorage.getItem(`fusion_snapshots_${scenario.id}`);
      const existingSnaps = stored ? JSON.parse(stored) : [];
      const newSnap = {
        id: `snap_ai_${Date.now()}`,
        name: `Pre-Intel Ingestion: ${parseResult.updatedScenarioPayload.name || 'AI Sync'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        actionSource: 'ai_ingest',
        scenarioState: JSON.parse(JSON.stringify(scenario)),
        summary: `Auto-saved prior to Intel Ingestion (${scenario.selectedModules.length} modules, ${scenario.projectWeeks}w)`,
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

    onUpdateScenario(prev => {
      const payload = parseResult.updatedScenarioPayload;

      const mergedScaleDrivers = {
        ...prev.scaleDrivers,
        ...(payload.scaleDrivers || {})
      };

      const mergedClientModifiers = {
        ...prev.clientModifiers,
        ...(payload.clientModifiers || {})
      };

      const mergedAnswers = {
        ...(prev.moduleQuestionAnswers || {}),
        ...(payload.moduleQuestionAnswers || {})
      };

      const mergedMeta = {
        ...(prev.questionConfidenceMeta || {}),
        ...(payload.questionConfidenceMeta || {})
      };

      return {
        ...prev,
        name: payload.name || prev.name,
        description: payload.description || prev.description,
        selectedModules: Array.from(new Set([...prev.selectedModules, ...payload.selectedModules])),
        scaleDrivers: mergedScaleDrivers,
        clientModifiers: mergedClientModifiers,
        moduleQuestionAnswers: mergedAnswers,
        questionConfidenceMeta: mergedMeta,
        technicalIntegrations: payload.technicalIntegrations || prev.technicalIntegrations,
        blackoutPeriods: payload.blackoutPeriods.length > 0 ? payload.blackoutPeriods : prev.blackoutPeriods,
        clientIntel: parseResult.clientIntel,
        industryIntel: parseResult.industryIntel,
        specSheetIntel: parseResult.specSheetIntel,
        intelSynthesis: parseResult.synthesis
      };
    });

    onClose();
  };

  const handleFileUploadForStream = (
    e: React.ChangeEvent<HTMLInputElement>,
    streamType: 'client' | 'industry' | 'spec'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        if (streamType === 'client') setClientIntelText(text);
        else if (streamType === 'industry') setIndustryIntelText(text);
        else if (streamType === 'spec') setSpecSheetText(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-none border border-slate-300 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  Universal Intel & Scope Ingestion Engine
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-900/80 text-blue-200 border border-blue-700">
                  Client Intel + Industry Intel + Spec Sheet
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Ingest Client Intel, Industry Intel & Technical Spec Sheets
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`py-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} />
              <span>1. Industry Preset Packages ({INTEL_PACKAGE_PRESETS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload_all')}
              className={`py-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'upload_all'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Upload size={14} />
              <span>2. Custom Intel & Spec Upload / Paste</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!parseResult) handleExecuteSynthesizer();
                setActiveTab('results');
              }}
              className={`py-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'results'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap size={14} />
              <span>3. Synthesized Field Updates & Matrix</span>
              {parseResult && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  {parseResult.synthesis.confidenceSummary.overallScore}% Conf.
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Auto-Updates All Scenario Fields
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 flex items-start gap-2.5">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold">Select an Industry Dossier & Spec Package:</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Click any preset below to instantly load and synthesize the complete Client Intelligence, Industry Benchmarks & Technical Spec Sheet. All modules, scale drivers, question answers, and technical matrices will be mapped automatically.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTEL_PACKAGE_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-500 transition-all rounded-none shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase border border-slate-200">
                          {preset.industry}
                        </span>
                        <span className="text-[10px] font-mono text-blue-600 font-bold group-hover:underline">
                          3 Streams Included
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{preset.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{preset.tagline}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span>• Client Intel</span>
                        <span>• Industry Intel</span>
                        <span>• Spec Sheet</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Load & Synthesize</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM UPLOAD / PASTE */}
          {activeTab === 'upload_all' && (
            <div className="space-y-4">
              {/* Stream Sub-Pills */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveStreamTab('client')}
                  className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeStreamTab === 'client'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 size={13} />
                  <span>1. Client Intel {clientIntelText.trim().length > 0 && '✓'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStreamTab('industry')}
                  className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeStreamTab === 'industry'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Factory size={13} />
                  <span>2. Industry Intel {industryIntelText.trim().length > 0 && '✓'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStreamTab('spec')}
                  className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeStreamTab === 'spec'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Database size={13} />
                  <span>3. Spec Sheet / Scope Manifest {specSheetText.trim().length > 0 && '✓'}</span>
                </button>
              </div>

              {/* Stream Editor Container */}
              <div className="bg-white border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                    {activeStreamTab === 'client' && 'Client Context, Pain Points, Org Scale & BPO Capacity'}
                    {activeStreamTab === 'industry' && 'Industry Mandates, Standards, Chart of Accounts & Compliance'}
                    {activeStreamTab === 'spec' && 'Technical Spec Sheet, Modules, OIC Interfaces & Conversion Mock Cycles'}
                  </span>

                  <label className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer flex items-center gap-1">
                    <Upload size={12} />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".txt,.doc,.docx,.pdf,.json"
                      className="hidden"
                      onChange={(e) => handleFileUploadForStream(e, activeStreamTab)}
                    />
                  </label>
                </div>

                <textarea
                  rows={10}
                  value={
                    activeStreamTab === 'client'
                      ? clientIntelText
                      : activeStreamTab === 'industry'
                      ? industryIntelText
                      : specSheetText
                  }
                  onChange={(e) => {
                    if (activeStreamTab === 'client') setClientIntelText(e.target.value);
                    else if (activeStreamTab === 'industry') setIndustryIntelText(e.target.value);
                    else if (activeStreamTab === 'spec') setSpecSheetText(e.target.value);
                  }}
                  placeholder={`Paste or type ${activeStreamTab} intelligence here...`}
                  className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-none focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white resize-y"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Streams populated: {(clientIntelText ? 1 : 0) + (industryIntelText ? 1 : 0) + (specSheetText ? 1 : 0)} of 3
                  </span>
                  <button
                    type="button"
                    onClick={handleExecuteSynthesizer}
                    disabled={isParsing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isParsing ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                    <span>Synthesize & Preview Updates</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYNTHESIZED RESULTS & PREVIEW */}
          {activeTab === 'results' && parseResult && (
            <div className="space-y-6">
              {/* Executive Overview Card */}
              <div className="bg-slate-900 text-white p-5 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                      Intel Synthesis Complete
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {parseResult.updatedScenarioPayload.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Overall Confidence</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {parseResult.synthesis.confidenceSummary.overallScore}%
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Modules Detected</span>
                      <span className="text-lg font-bold text-blue-400 font-mono">
                        {parseResult.updatedScenarioPayload.selectedModules.length}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {parseResult.updatedScenarioPayload.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                  <div className="bg-slate-800/80 p-2 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Legal Entities</span>
                    <span className="font-bold text-white">{parseResult.updatedScenarioPayload.scaleDrivers.fin_ent || 6} Entities</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Plants / Hubs</span>
                    <span className="font-bold text-white">{parseResult.updatedScenarioPayload.scaleDrivers.scm_plants || 0} Plants / {parseResult.updatedScenarioPayload.scaleDrivers.scm_wh || 0} WH</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">OIC Integrations</span>
                    <span className="font-bold text-blue-300">{parseResult.updatedScenarioPayload.technicalIntegrations.length} Interfaces</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Mock Conversions</span>
                    <span className="font-bold text-emerald-300">{parseResult.updatedScenarioPayload.scaleDrivers.tech_conversion_cycles || 3} Cycles</span>
                  </div>
                </div>
              </div>

              {/* Detected In-Scope Modules */}
              <div className="bg-white border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-600" />
                    <span>In-Scope Offerings & Modules ({parseResult.updatedScenarioPayload.selectedModules.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Auto-Derived from Spec Sheet</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {parseResult.updatedScenarioPayload.selectedModules.map(modId => {
                    const mod = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
                    return (
                      <span
                        key={modId}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1"
                      >
                        <span className="px-1 bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                          {mod?.pillar || 'ERP'}
                        </span>
                        <span>{mod?.name || modId}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Pros, Cons, and Risk Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase font-mono flex items-center gap-1.5">
                    <ThumbsUp size={14} />
                    <span>Architectural Pros & Synergies</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {parseResult.synthesis.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase font-mono flex items-center gap-1.5">
                    <ThumbsDown size={14} />
                    <span>Delivery Constraints & Risk Watch</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {parseResult.synthesis.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* High-Priority Human-in-the-Loop Clarifications */}
              {parseResult.synthesis.highPriorityClarifications.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 uppercase font-mono flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-amber-700" />
                      <span>Human-in-the-Loop Clarifications Flagged ({parseResult.synthesis.highPriorityClarifications.length})</span>
                    </h4>
                    <span className="text-[10px] font-mono text-amber-800">Low-Confidence Intel Flags</span>
                  </div>
                  <div className="space-y-1 text-xs text-amber-900">
                    {parseResult.synthesis.highPriorityClarifications.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white/80 border border-amber-200/60 text-[11px] font-mono">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parseResult ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Ready to commit changes across all scenario tabs
              </span>
            ) : (
              <span>Select a preset or upload custom intel to begin.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!parseResult}
              onClick={handleApplyToScenario}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs ${
                parseResult
                  ? 'bg-slate-900 hover:bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Apply & Update All Scenario Fields</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
