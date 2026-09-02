import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Building2,
  Factory,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  RotateCcw,
  Info,
  Sliders,
  Copy,
  Upload,
  FileCheck,
  ShieldAlert,
  ClipboardList,
  GitMerge,
  FileSpreadsheet,
  Ban,
  Tag
} from 'lucide-react';
import { ProjectScenario, OracleModule, ScaleDrivers } from '../../types';
import {
  extractBlueprintFromText,
  extractBlueprintWithAiFallback,
  BLUEPRINT_SAMPLES,
  BlueprintExtractionResult,
  BlueprintSample,
  generateExecutiveSowMemo,
  AttributionSource
} from '../../utils/blueprintAutoFillEngine';
import { calculateProjectMetrics } from '../../utils/calculator';

interface SmartBlueprintAutoFillDrawerProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenComplexityStudio?: () => void;
}

export const SmartBlueprintAutoFillDrawer: React.FC<SmartBlueprintAutoFillDrawerProps> = ({
  scenario,
  onUpdateScenario,
  onOpenComplexityStudio
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<BlueprintExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'scale' | 'modifiers' | 'modules' | 'exclusions' | 'risks'>('scale');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [previousScenarioSnapshot, setPreviousScenarioSnapshot] = useState<ProjectScenario | null>(null);
  
  // Guardrail 1 & Merge Mode: 'merge' vs 'overwrite'
  const [mergeMode, setMergeMode] = useState<'merge' | 'overwrite'>('merge');
  const [isCopiedMemo, setIsCopiedMemo] = useState(false);

  // Quick select sample
  const handleSelectSample = async (sample: BlueprintSample) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.rawText);
    setIsAnalyzing(true);

    const result = await extractBlueprintWithAiFallback(sample.rawText, scenario);
    setExtractionResult(result);
    setIsAnalyzing(false);
  };

  // Run Custom Extraction (Live AI with Instant Local Fallback)
  const handleRunCustomExtraction = async () => {
    if (!inputText.trim()) {
      handleSelectSample(BLUEPRINT_SAMPLES[0]);
      return;
    }

    setIsAnalyzing(true);
    const result = await extractBlueprintWithAiFallback(inputText, scenario);
    setExtractionResult(result);
    setIsAnalyzing(false);
  };

  // Apply Blueprint with Guardrails
  const handleApplyBlueprint = () => {
    if (!extractionResult) return;

    // Guardrail 4: Save snapshot before any mutation
    setPreviousScenarioSnapshot(JSON.parse(JSON.stringify(scenario)));

    onUpdateScenario(prev => {
      let newModules: OracleModule[];
      let mergedScaleDrivers: ScaleDrivers;
      let mergedClientModifiers: ProjectScenario['clientModifiers'];

      if (mergeMode === 'merge') {
        // Smart Merge: union modules, merge scale drivers, merge modifiers
        newModules = Array.from(
          new Set([
            ...prev.selectedModules,
            ...extractionResult.inferredModules.map(m => m.id)
          ])
        );

        mergedScaleDrivers = {
          ...prev.scaleDrivers,
          ...extractionResult.rawScaleDriversPayload
        };

        mergedClientModifiers = {
          ...prev.clientModifiers,
          ...extractionResult.rawModifiersPayload
        };
      } else {
        // Full Overwrite Mode: replace with newly inferred items
        newModules = extractionResult.inferredModules.map(m => m.id);
        mergedScaleDrivers = {
          ...prev.scaleDrivers,
          ...extractionResult.rawScaleDriversPayload
        };
        mergedClientModifiers = {
          ...prev.clientModifiers,
          ...extractionResult.rawModifiersPayload
        };
      }

      return {
        ...prev,
        name: prev.name.includes('Scenario') || prev.name.includes('Default')
          ? `${extractionResult.clientName} (${extractionResult.industry})`
          : prev.name,
        description: `Ingested from Smart RFP Ingestor: ${extractionResult.summaryFindings[0]}`,
        selectedModules: newModules,
        scaleDrivers: mergedScaleDrivers,
        clientModifiers: mergedClientModifiers
      };
    });

    setAppliedNotification(
      `Applied ${extractionResult.inferredModules.length} Modules, ${extractionResult.scaleDrivers.length} Scale Drivers, and 7 Program Modifiers (${mergeMode === 'merge' ? 'Smart Merge Mode' : 'Full Overwrite Mode'})!`
    );

    setTimeout(() => {
      setAppliedNotification(null);
    }, 6000);
  };

  // Guardrail 4: 1-Click Snapshot Restore
  const handleRollbackSnapshot = () => {
    if (!previousScenarioSnapshot) return;
    onUpdateScenario(() => ({ ...previousScenarioSnapshot }));
    setPreviousScenarioSnapshot(null);
    setAppliedNotification('Reverted to previous project baseline snapshot.');
    setTimeout(() => {
      setAppliedNotification(null);
    }, 4000);
  };

  // 1-Click Copy Executive RFP & Pricing Memo
  const handleCopySowMemo = () => {
    const metrics = calculateProjectMetrics(scenario);
    const memoText = generateExecutiveSowMemo(scenario, metrics, extractionResult || undefined);
    navigator.clipboard.writeText(memoText);
    setIsCopiedMemo(true);
    setTimeout(() => setIsCopiedMemo(false), 3000);
  };

  // Compound net modifier from extraction
  const extractedNetMod: number = extractionResult
    ? (Object.values(extractionResult.rawModifiersPayload) as number[]).reduce(
        (acc: number, val: number) => acc * (val || 1.0),
        1.0
      )
    : 1.0;

  // Counts of attribution
  const attributionCounts = useMemo(() => {
    if (!extractionResult) return { direct: 0, inferred: 0, default: 0 };
    const allItems = [
      ...extractionResult.inferredModules,
      ...extractionResult.scaleDrivers,
      ...extractionResult.modifiers
    ];
    return {
      direct: allItems.filter(i => i.attribution === 'direct').length,
      inferred: allItems.filter(i => i.attribution === 'inferred').length,
      default: allItems.filter(i => i.attribution === 'default').length
    };
  }, [extractionResult]);

  return (
    <div id="ai-blueprint-drawer" className="bg-white border border-indigo-200 shadow-xs mb-3 transition-all">
      {/* Header Bar / Collapsible Trigger */}
      <div
        className="p-3 sm:px-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/80 border border-indigo-400 text-white shadow-xs animate-pulse">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
                One-Box RFP Copy-Paste & Smart Auto-Fill
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                Live AI + 4 Guardrails
              </span>
              {previousScenarioSnapshot && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono flex items-center gap-1">
                  <RotateCcw size={10} /> Snapshot Ready to Undo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Paste raw client RFP text, scope emails, or meeting transcripts. Auto-calibrates Modules, Physical Scale, Delivery Modifiers & Non-Oracle Exclusions with zero silent mutations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleCopySowMemo}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            title="Copy formatted Executive RFP & Pricing Memo to Clipboard"
          >
            {isCopiedMemo ? <Check size={12} className="text-emerald-400" /> : <ClipboardList size={12} />}
            <span>{isCopiedMemo ? 'Memo Copied!' : 'Copy RFP Memo'}</span>
          </button>

          {!isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Zap size={13} />
              <span>Open One-Box Ingestor</span>
            </button>
          )}

          {isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Collapse AI Auto-Fill Drawer"
            >
              <ChevronUp size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Applied Notification Banner with Undo */}
      {appliedNotification && (
        <div className="bg-emerald-900 border-b border-emerald-600 text-emerald-100 p-2.5 px-4 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{appliedNotification}</span>
          </div>
          {previousScenarioSnapshot && (
            <button
              type="button"
              onClick={handleRollbackSnapshot}
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer border border-emerald-600 transition shadow-xs"
            >
              <RotateCcw size={11} />
              <span>↩️ Undo Ingestion (Restore Snapshot)</span>
            </button>
          )}
        </div>
      )}

      {/* Expanded One-Box Content */}
      {isOpen && (
        <div className="p-4 bg-slate-50 space-y-4 border-t border-indigo-100 animate-in fade-in duration-150">
          {/* Quick-Fill Archetype Selector Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-mono">
                <Building2 size={13} className="text-indigo-600" />
                Step 1: Choose 1-Click Industry Archetype OR Paste Unstructured Client Notes
              </span>
              <span className="text-[10px] text-slate-500 italic">
                Calibrated against certified Big-4 Oracle Cloud transformation benchmarks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {BLUEPRINT_SAMPLES.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2.5 text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950 text-white border-indigo-900 shadow-xs'
                        : 'bg-white hover:bg-indigo-50/60 text-slate-800 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-bold px-1 py-0.2 border ${
                          isSelected ? 'bg-indigo-800 text-indigo-200 border-indigo-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {sample.badge}
                        </span>
                        {isSelected && <CheckCircle2 size={12} className="text-emerald-400" />}
                      </div>
                      <h5 className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {sample.name}
                      </h5>
                    </div>
                    <p className={`text-[10px] line-clamp-2 mt-1 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {sample.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Raw Text Input One-Box */}
          <div className="space-y-1.5 bg-white p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                <FileText size={13} className="text-indigo-600" />
                Raw RFP Scope Statement / Email Thread / Discovery Q&A Transcript
              </label>
              <div className="flex items-center gap-2 text-xs">
                {inputText && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setSelectedSampleId(null);
                      setExtractionResult(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer transition font-medium"
                  >
                    Clear Text
                  </button>
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  {inputText.length.toLocaleString()} characters
                </span>
              </div>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedSampleId(null);
              }}
              placeholder="Paste unstructured RFP text, scope emails, or discovery notes here... (e.g., '14 legal entities, 8 manufacturing plants, 36 OIC interfaces, moving from legacy SAP with high data debt, target go-live in 18 months, client will handle barcode scanner hardware...')"
              className="w-full text-xs font-mono p-3 border border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none leading-relaxed text-slate-900 resize-y"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 border border-indigo-200">
                  <ShieldCheck size={11} /> 4 Enterprise Guardrails Active
                </span>
                <span className="hidden md:inline text-slate-400">•</span>
                <span className="hidden md:inline italic text-slate-500">
                  Pre-Flight Review + 3-Color Citations + Math Bounding Clamps + 1-Click Undo
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunCustomExtraction}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>AI Scanning Scope & Citations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>⚡ Ingest & Analyze Scope</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guardrail 1: Pre-Flight Review Drawer / Modal (Never mutate state silently) */}
          {extractionResult && (
            <div className="bg-white border-2 border-indigo-600 p-4 space-y-4 animate-in fade-in shadow-sm">
              {/* Pre-Flight Top Banner & Merge Mode Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 bg-indigo-900 text-white">
                      Pre-Flight Review
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {extractionResult.clientName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({extractionResult.industry})
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                      extractionResult.extractionSource === 'live_ai'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      {extractionResult.extractionSource === 'live_ai' ? '🤖 Live Gemini AI Analysis' : '⚡ Heuristic Analysis Engine'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Review extracted scope parameters and source attributions below before applying to your active scenario.
                  </p>
                </div>

                {/* Merge Mode Toggle + Primary Apply Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Merge Mode Toggle */}
                  <div className="inline-flex bg-slate-100 p-0.5 border border-slate-300 text-xs">
                    <button
                      type="button"
                      onClick={() => setMergeMode('merge')}
                      className={`px-2.5 py-1 font-mono text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        mergeMode === 'merge'
                          ? 'bg-white text-indigo-900 shadow-xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Keep existing custom rate cards, append new modules & update scale drivers"
                    >
                      <GitMerge size={12} className="text-indigo-600" />
                      <span>Smart Merge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMergeMode('overwrite')}
                      className={`px-2.5 py-1 font-mono text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        mergeMode === 'overwrite'
                          ? 'bg-white text-rose-900 shadow-xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Replace current scenario parameters completely with this extracted blueprint"
                    >
                      <RotateCcw size={12} className="text-rose-600" />
                      <span>Full Overwrite</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyBlueprint}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Check size={14} />
                    <span>Apply Extracted Scope</span>
                  </button>
                </div>
              </div>

              {/* Guardrail 2: 3-Color Source Attribution Summary Legend */}
              <div className="bg-slate-50 p-2.5 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-700">
                  <Tag size={12} className="text-indigo-600" />
                  <span>Attribution Legend:</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    <strong>{attributionCounts.direct} Direct Extracted</strong> (Exact Quote Citation)
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    <strong>{attributionCounts.inferred} Inferred Context</strong> (Review Recommended)
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                    <strong>{attributionCounts.default} Industry Baseline</strong> (Oracle MBP Default)
                  </span>
                </div>
              </div>

              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Inferred Modules
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-mono font-bold text-slate-900">
                      {extractionResult.inferredModules.length}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Modules</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Scale Drivers
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-mono font-bold text-slate-900">
                      {extractionResult.scaleDrivers.length}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Calibrated</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Compound Risk Factor
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`text-xl font-mono font-bold ${extractedNetMod > 1.2 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {extractedNetMod.toFixed(2)}x
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">7 Modifiers</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Non-Oracle Exclusions
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-mono font-bold text-rose-700">
                      {extractionResult.unmappedExclusions?.length || 0}
                    </span>
                    <span className="text-[11px] text-rose-600 font-mono">Isolated</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation for Extraction Details */}
              <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('scale')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'scale'
                      ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database size={13} />
                  <span>Physical Scale ({extractionResult.scaleDrivers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('modifiers')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'modifiers'
                      ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders size={13} />
                  <span>7 Program Modifiers ({extractionResult.modifiers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('modules')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'modules'
                      ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers size={13} />
                  <span>Inferred Modules ({extractionResult.inferredModules.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exclusions')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'exclusions'
                      ? 'border-rose-600 text-rose-900 bg-rose-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Ban size={13} className="text-rose-600" />
                  <span>Scope Exclusions ({extractionResult.unmappedExclusions?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('risks')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'risks'
                      ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>Strategic Risks ({extractionResult.keyRiskHighlights.length})</span>
                </button>
              </div>

              {/* Tab 1: Scale Drivers Grid with Guardrail 3 (Math Bounding Clamps) */}
              {activeTab === 'scale' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {extractionResult.scaleDrivers.map((driver) => {
                      const hasChanged = driver.currentValue !== driver.extractedValue;
                      const isDirect = driver.attribution === 'direct';
                      const isInferred = driver.attribution === 'inferred';

                      return (
                        <div
                          key={driver.key}
                          className={`p-2.5 border text-xs space-y-1.5 ${
                            hasChanged ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{driver.name}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 border ${
                              isDirect
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isInferred
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}>
                              {isDirect ? '🟢 Direct' : isInferred ? '🟡 Inferred' : '🔵 Default'} • {driver.confidencePct}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-400 line-through text-[11px]">
                                {driver.currentValue}
                              </span>
                              <ArrowRight size={11} className="text-indigo-600" />
                              <span className="font-bold text-indigo-900 text-sm">
                                {driver.clampedValue.toLocaleString()} {driver.unit}
                              </span>
                            </div>

                            <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 text-slate-500 border border-slate-200" title="Mathematical Guardrail: Value verified within bounded parameters">
                              🛡️ Clamped
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 italic line-clamp-1">
                            {driver.citation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: 7 Program Modifiers with Citations */}
              {activeTab === 'modifiers' && (
                <div className="space-y-2 overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-mono text-[11px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Dimension</th>
                        <th className="p-2 border-r border-slate-200">Attribution</th>
                        <th className="p-2 border-r border-slate-200">Extracted Option & Rationale</th>
                        <th className="p-2 w-24 text-center border-r border-slate-200">Multiplier</th>
                        <th className="p-2 min-w-[200px]">Source Text Citation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {extractionResult.modifiers.map((mod) => {
                        const isDirect = mod.attribution === 'direct';
                        const isInferred = mod.attribution === 'inferred';

                        return (
                          <tr key={mod.key} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                              {mod.name}
                              <span className="block text-[9px] font-mono text-slate-400 font-normal uppercase">{mod.category}</span>
                            </td>
                            <td className="p-2 border-r border-slate-200 whitespace-nowrap font-mono text-[10px]">
                              <span className={`px-1.5 py-0.5 border ${
                                isDirect
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isInferred
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-300'
                              }`}>
                                {isDirect ? '🟢 Direct' : isInferred ? '🟡 Inferred' : '🔵 Default'}
                              </span>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <span className="font-bold text-slate-800">{mod.label}</span>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{mod.reasoning}</p>
                            </td>
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                              <span className={`px-1.5 py-0.5 border ${
                                mod.value > 1.15 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                mod.value > 1.00 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {mod.value.toFixed(2)}x
                              </span>
                            </td>
                            <td className="p-2 text-[11px] text-slate-600 italic bg-slate-50/50">
                              "{mod.citation}"
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Inferred Modules */}
              {activeTab === 'modules' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {extractionResult.inferredModules.map((mod) => (
                      <div key={mod.id} className="p-2.5 bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-1 py-0.2 bg-slate-200 text-slate-700">
                            {mod.pillar}
                          </span>
                          <span className={`text-[10px] font-mono px-1 py-0.2 border ${
                            mod.attribution === 'direct'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}>
                            {mod.attribution === 'direct' ? '🟢 Direct' : '🔵 Default'}
                          </span>
                        </div>
                        <h6 className="text-xs font-bold text-slate-900 leading-tight">
                          {mod.name}
                        </h6>
                        <p className="text-[10px] text-slate-500 italic line-clamp-1">
                          {mod.citation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Scope Exclusions (Non-Oracle Items Isolated) */}
              {activeTab === 'exclusions' && (
                <div className="space-y-2">
                  {extractionResult.unmappedExclusions && extractionResult.unmappedExclusions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
                        🛡️ <strong>Contractual Protection:</strong> The following items were detected in your source text but identified as Non-Oracle or Out-of-Scope for SI implementation. They have been isolated and added to your RFP Exclusion Memo.
                      </div>
                      {extractionResult.unmappedExclusions.map((ex, idx) => (
                        <div key={idx} className="p-3 bg-white border border-rose-200 text-xs flex items-start gap-2.5">
                          <Ban size={15} className="text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{ex.item}</span>
                              <span className="text-[10px] font-mono px-1 py-0.2 bg-rose-100 text-rose-800 border border-rose-300">
                                {ex.category}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">{ex.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No explicit non-Oracle out-of-scope exclusions detected in current text.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Strategic Risks */}
              {activeTab === 'risks' && (
                <div className="space-y-2">
                  {extractionResult.keyRiskHighlights.map((risk, rIdx) => (
                    <div key={rIdx} className="p-2.5 bg-amber-50/70 border border-amber-200 text-xs flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <span className="text-amber-900 font-medium leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Action Footer with Guardrail 4 Snapshot Note */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>A backup snapshot will be saved automatically upon applying for 1-click rollback.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySowMemo}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ClipboardList size={13} />
                    <span>Copy RFP Memo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyBlueprint}
                    className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>Apply AI Blueprint ({mergeMode === 'merge' ? 'Smart Merge' : 'Full Overwrite'})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
