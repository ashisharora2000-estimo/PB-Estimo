import React, { useState, useMemo } from 'react';
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
  Check,
  Zap,
  Sliders,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Info,
  RotateCcw,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProjectScenario, OracleModule, UploadedProposal } from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import {
  extractBlueprintWithAiFallback,
  BLUEPRINT_SAMPLES,
  BlueprintSample,
  generateExecutiveSowMemo
} from '../../utils/blueprintAutoFillEngine';
import {
  parseComprehensiveIntel,
  INTEL_PACKAGE_PRESETS,
  IntelPackagePreset,
  ComprehensiveIntelParseResult
} from '../../utils/intelIngestionParser';
import {
  parseProposalDocument,
  parseSpreadsheetWorkbookToText,
  SAMPLE_PROPOSAL_TEMPLATES
} from '../../utils/proposalParser';
import {
  parseIntegrationInventory,
  parseExcelWorkbook,
  IntegrationInventoryParseResult
} from '../../utils/integrationInventoryParser';

export type AgentInputMode = 'upload_rfp' | 'paste_intel' | 'quick_blueprint' | 'presets';

interface AIScopingAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenClientQa?: () => void;
  onOpenComplexityStudio?: () => void;
  initialMode?: AgentInputMode;
}

export const AIScopingAgentModal: React.FC<AIScopingAgentModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario,
  onOpenClientQa,
  onOpenComplexityStudio,
  initialMode = 'upload_rfp'
}) => {
  const [activeMode, setActiveMode] = useState<AgentInputMode>(initialMode);
  
  // Shared State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mergeMode, setMergeMode] = useState<'merge' | 'overwrite'>('merge');
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Mode 1: Document Upload / RFP Text
  const [uploadedFileName, setUploadedFileName] = useState('Enterprise_RFP_Requirements.pdf');
  const [uploadedFileSize, setUploadedFileSize] = useState('340 KB');
  const [rfpText, setRfpText] = useState('');

  // Mode 2: Paste Intel / RFP Memo / 3-Stream Intel
  const [clientIntelText, setClientIntelText] = useState(scenario.clientIntel?.rawText || '');
  const [industryIntelText, setIndustryIntelText] = useState(scenario.industryIntel?.rawText || '');
  const [specSheetText, setSpecSheetText] = useState(scenario.specSheetIntel?.rawText || '');
  const [intelTab, setIntelTab] = useState<'client' | 'industry' | 'spec'>('client');

  // Mode 3: Quick Blueprint Prompt
  const [blueprintPrompt, setBlueprintPrompt] = useState('');
  const [selectedBlueprintSampleId, setSelectedBlueprintSampleId] = useState<string | null>(null);

  // Result Cache
  const [intelResult, setIntelResult] = useState<ComprehensiveIntelParseResult | null>(null);
  const [rfpResult, setRfpResult] = useState<any | null>(null);
  const [blueprintResult, setBlueprintResult] = useState<any | null>(null);
  const [parsedExcelInventory, setParsedExcelInventory] = useState<IntegrationInventoryParseResult | null>(null);

  if (!isOpen) return null;

  // Clear all pasted data & reset ingestion state
  const handleClearPastedData = () => {
    setRfpText('');
    setUploadedFileName('');
    setUploadedFileSize('');
    setParsedExcelInventory(null);
    setRfpResult(null);
    setClientIntelText('');
    setIndustryIntelText('');
    setSpecSheetText('');
    setIntelResult(null);
    setBlueprintPrompt('');
    setBlueprintResult(null);
    setSelectedBlueprintSampleId(null);
    setAppliedNotification('Pasted data and loaded files cleared.');
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  // Handler: RFP / Excel Inventory File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

      const isSpreadsheet = /\.(xlsx|xls|csv|tsv)$/i.test(file.name);

      if (isSpreadsheet) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const buffer = event.target?.result as ArrayBuffer;
            
            // 1. Attempt deep integration inventory parsing
            let invResult: IntegrationInventoryParseResult | null = null;
            try {
              const workbookParsed = parseExcelWorkbook(buffer);
              if (workbookParsed && workbookParsed.result && workbookParsed.result.items.length > 0) {
                invResult = workbookParsed.result;
              }
            } catch (invErr) {
              console.warn('Direct parseExcelWorkbook note:', invErr);
            }

            // 2. Read full workbook sheet rows into rich textual representation with cell coordinates
            const { fullText } = parseSpreadsheetWorkbookToText(buffer, file.name);

            setParsedExcelInventory(invResult && invResult.items.length > 0 ? invResult : null);
            setRfpText(fullText.trim());

            if (invResult && invResult.items.length > 0) {
              setAppliedNotification(
                `Successfully parsed Excel inventory: ${invResult.totalCount} items (${invResult.summaryByComplexity.simple}S / ${invResult.summaryByComplexity.medium}M / ${invResult.summaryByComplexity.complex}C / ${invResult.summaryByComplexity.extraLarge}XL).`
              );
              setTimeout(() => setAppliedNotification(null), 6000);
            }
          } catch (err) {
            console.error('Error processing spreadsheet file', err);
            setRfpText(`Error reading spreadsheet: ${(err as Error).message}`);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setRfpText(content || '');
          setParsedExcelInventory(null);
        };
        reader.readAsText(file);
      }
    }
  };

  // Handler: Analyze RFP
  const handleAnalyzeRfp = () => {
    const textToAnalyze = rfpText.trim() || SAMPLE_PROPOSAL_TEMPLATES[0].content;
    setIsAnalyzing(true);
    setTimeout(() => {
      const parsed = parseProposalDocument(textToAnalyze);
      setRfpResult(parsed);
      setIsAnalyzing(false);
    }, 400);
  };

  // Handler: Synthesize Intel
  const handleSynthesizeIntel = () => {
    const cText = clientIntelText.trim() || INTEL_PACKAGE_PRESETS[0].clientIntel;
    const iText = industryIntelText.trim() || INTEL_PACKAGE_PRESETS[0].industryIntel;
    const sText = specSheetText.trim() || INTEL_PACKAGE_PRESETS[0].specSheet;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = parseComprehensiveIntel(cText, iText, sText);
      setIntelResult(result);
      setIsAnalyzing(false);
    }, 400);
  };

  // Handler: Quick Blueprint Generation
  const handleGenerateBlueprint = async (customText?: string) => {
    const text = customText || blueprintPrompt.trim() || BLUEPRINT_SAMPLES[0].rawText;
    setIsAnalyzing(true);
    const result = await extractBlueprintWithAiFallback(text, scenario);
    setBlueprintResult(result);
    setIsAnalyzing(false);
  };

  // Handler: Preset Selection
  const handleSelectPreset = (preset: IntelPackagePreset) => {
    setClientIntelText(preset.clientIntel);
    setIndustryIntelText(preset.industryIntel);
    setSpecSheetText(preset.specSheet);
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = parseComprehensiveIntel(preset.clientIntel, preset.industryIntel, preset.specSheet);
      setIntelResult(result);
      setIsAnalyzing(false);
      setActiveMode('paste_intel');
    }, 350);
  };

  // Unified Snapshot Helper
  const captureSnapshot = (actionName: string) => {
    try {
      const stored = localStorage.getItem(`fusion_snapshots_${scenario.id}`);
      const existingSnaps = stored ? JSON.parse(stored) : [];
      const newSnap = {
        id: `snap_ai_${Date.now()}`,
        name: `Pre-Scoping Agent: ${actionName}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        actionSource: 'ai_ingest',
        scenarioState: JSON.parse(JSON.stringify(scenario)),
        summary: `Auto-captured before AI Scoping Ingestion (${scenario.selectedModules.length} modules, ${scenario.projectWeeks}w)`,
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
  };

  // Apply RFP Result
  const handleApplyRfp = () => {
    if (!rfpResult) return;
    captureSnapshot('RFP Ingestion');

    onUpdateScenario(prev => {
      // Evidence-bounded scale driver update (only update drivers that have extracted evidence)
      const currentScale = { ...prev.scaleDrivers };
      if (rfpResult.extractedScaleDrivers) {
        Object.entries(rfpResult.extractedScaleDrivers).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            (currentScale as any)[key] = val;
          }
        });
      }

      // Evidence-bounded question answers (only update questions where high or medium evidence was found, or scoping sheet input)
      const currentAnswers = { ...(prev.moduleQuestionAnswers || {}) };
      const currentMeta = { ...(prev.questionConfidenceMeta || {}) };

      if (rfpResult.questionAnswers && rfpResult.questionConfidenceMeta) {
        Object.keys(rfpResult.questionAnswers).forEach(modId => {
          const modAnswers = rfpResult.questionAnswers[modId] || [];
          const modMeta = rfpResult.questionConfidenceMeta[modId] || {};

          if (!currentAnswers[modId]) {
            currentAnswers[modId] = [...modAnswers];
          } else {
            // Update indices where confidence is high or medium, or directly sourced from scoping_sheet
            currentAnswers[modId] = currentAnswers[modId].map((oldAns, idx) => {
              const metaItem = modMeta[idx];
              if (
                metaItem &&
                (metaItem.source === 'scoping_sheet' ||
                 metaItem.confidence === 'high' ||
                 metaItem.confidence === 'medium')
              ) {
                return modAnswers[idx] ?? oldAns;
              }
              return oldAns;
            });
          }

          currentMeta[modId] = {
            ...(currentMeta[modId] || {}),
            ...modMeta
          };
        });
      }

      const proposalRecord: UploadedProposal = {
        id: `prop_${Date.now()}`,
        fileName: uploadedFileName,
        uploadedAt: new Date().toISOString(),
        fileSize: uploadedFileSize,
        rawText: rfpText.slice(0, 1000) + '...',
        analyzedStatus: 'analyzed',
        inferredModules: rfpResult.inferredModules,
        highConfidenceCount: rfpResult.stats.highConfidenceCount,
        mediumConfidenceCount: rfpResult.stats.mediumConfidenceCount,
        lowConfidenceCount: rfpResult.stats.lowConfidenceCount,
        scopingSheetQuestionsCount: rfpResult.stats.scopingSheetQuestionsCount || 0,
        moduleRatingsCount: rfpResult.stats.moduleRatingsCount || 0,
        extractedScaleDrivers: rfpResult.extractedScaleDrivers,
        summaryFindings: rfpResult.summaryFindings,
        clientClarificationsNeeded: rfpResult.clientClarificationsNeeded
      };

      // Deep Excel Inventory Synchronization
      let updatedScale = currentScale;
      let updatedIntegrations = prev.technicalIntegrations;
      let updatedSmc = prev.technicalSmcOverrides;
      let updatedIntegrationOpts = prev.integrationScopingOptions;

      if (parsedExcelInventory && parsedExcelInventory.items.length > 0) {
        updatedIntegrations = parsedExcelInventory.items;
        updatedScale = {
          ...currentScale,
          tech_oic: parsedExcelInventory.totalCount,
          tech_reports_bip: parsedExcelInventory.ricefwCounts?.reports_bip || currentScale.tech_reports_bip,
          tech_data_objects: parsedExcelInventory.ricefwCounts?.conversions || currentScale.tech_data_objects,
          test_scripts_count: parsedExcelInventory.totalCount * 6
        };

        if (parsedExcelInventory.ricefwSmcOverrides) {
          updatedSmc = {
            ...(prev.technicalSmcOverrides || {}),
            ...parsedExcelInventory.ricefwSmcOverrides
          };
        }

        updatedIntegrationOpts = {
          ...(prev.integrationScopingOptions || {
            includeErrorFramework: true,
            includeCanonicalDataModel: true,
            includePartnerCoTesting: true,
            includeB2BEdiSupport: false,
            targetSystems: ['Salesforce CRM', 'Workday HCM', 'SAP S/4HANA', 'SWIFT Banking', 'ServiceNow'],
            devSquadSize: 4
          }),
          simpleCount: parsedExcelInventory.summaryByComplexity.simple,
          mediumCount: parsedExcelInventory.summaryByComplexity.medium,
          complexCount: parsedExcelInventory.summaryByComplexity.complex,
          extraLargeCount: parsedExcelInventory.summaryByComplexity.extraLarge
        };
      }

      // Filter out explicitly excluded modules
      const excludedNamesLower = (rfpResult.excludedModules || []).map(m => m.toLowerCase());
      const selectedMods = (mergeMode === 'overwrite' 
        ? rfpResult.inferredModules 
        : Array.from(new Set([...prev.selectedModules, ...rfpResult.inferredModules]))
      ).filter(modId => {
        const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
        const nameMatch = modDef && excludedNamesLower.some(ex => ex.includes(modDef.name.toLowerCase()));
        const idMatch = excludedNamesLower.some(ex => ex.includes(modId.toLowerCase()));
        return !nameMatch && !idMatch;
      });

      return {
        ...prev,
        selectedModules: selectedMods,
        scaleDrivers: updatedScale,
        technicalIntegrations: updatedIntegrations,
        technicalSmcOverrides: updatedSmc,
        integrationScopingOptions: updatedIntegrationOpts,
        moduleQuestionAnswers: currentAnswers,
        questionConfidenceMeta: currentMeta,
        moduleTShirtOverrides: {
          ...(prev.moduleTShirtOverrides || {}),
          ...(rfpResult.moduleTShirtOverrides || {})
        },
        uploadedProposals: [proposalRecord, ...(prev.uploadedProposals || []).slice(0, 4)]
      };
    });

    onClose();
  };

  // Apply Intel Result
  const handleApplyIntel = () => {
    if (!intelResult) return;
    captureSnapshot('Intel Synthesis');

    onUpdateScenario(prev => {
      const payload = intelResult.updatedScenarioPayload;
      const mergedScale = { ...prev.scaleDrivers, ...(payload.scaleDrivers || {}) };
      const mergedModifiers = { ...prev.clientModifiers, ...(payload.clientModifiers || {}) };
      const mergedAnswers = { ...(prev.moduleQuestionAnswers || {}), ...(payload.moduleQuestionAnswers || {}) };
      const mergedMeta = { ...(prev.questionConfidenceMeta || {}), ...(payload.questionConfidenceMeta || {}) };

      return {
        ...prev,
        name: payload.name || prev.name,
        description: payload.description || prev.description,
        selectedModules: mergeMode === 'overwrite' 
          ? payload.selectedModules 
          : Array.from(new Set([...prev.selectedModules, ...payload.selectedModules])),
        scaleDrivers: mergedScale,
        clientModifiers: mergedModifiers,
        moduleQuestionAnswers: mergedAnswers,
        questionConfidenceMeta: mergedMeta,
        technicalIntegrations: payload.technicalIntegrations || prev.technicalIntegrations,
        blackoutPeriods: payload.blackoutPeriods?.length ? payload.blackoutPeriods : prev.blackoutPeriods,
        clientIntel: intelResult.clientIntel,
        industryIntel: intelResult.industryIntel,
        specSheetIntel: intelResult.specSheetIntel,
        intelSynthesis: intelResult.synthesis
      };
    });

    onClose();
  };

  // Apply Blueprint Result
  const handleApplyBlueprint = () => {
    if (!blueprintResult) return;
    captureSnapshot('Blueprint Ingestion');

    // Extract module IDs from inferredModules or detectedModules
    const extractedModuleIds: OracleModule[] = (blueprintResult.inferredModules || []).map((m: any) =>
      typeof m === 'string' ? m : m.id
    );
    if (extractedModuleIds.length === 0 && Array.isArray(blueprintResult.detectedModules)) {
      extractedModuleIds.push(...blueprintResult.detectedModules);
    }

    const newScaleDrivers = blueprintResult.rawScaleDriversPayload || blueprintResult.scaleDrivers || {};
    const newModifiers = blueprintResult.rawModifiersPayload || blueprintResult.clientModifiers || {};

    onUpdateScenario(prev => {
      let finalModules = prev.selectedModules;
      if (mergeMode === 'overwrite') {
        finalModules = extractedModuleIds.length > 0 ? extractedModuleIds : prev.selectedModules;
      } else {
        const set = new Set([...prev.selectedModules, ...extractedModuleIds]);
        (blueprintResult.excludedModules || []).forEach((ex: string) => set.delete(ex as any));
        finalModules = Array.from(set);
      }

      return {
        ...prev,
        name: blueprintResult.clientName && blueprintResult.clientName !== 'Enterprise Client'
          ? `${blueprintResult.clientName} Oracle Fusion Implementation`
          : prev.name,
        selectedModules: finalModules,
        scaleDrivers: { ...prev.scaleDrivers, ...newScaleDrivers },
        clientModifiers: { ...prev.clientModifiers, ...newModifiers },
        aiExtractionMeta: {
          lastExtractedAt: new Date().toISOString(),
          source: blueprintResult.extractionSource === 'live_ai' ? 'AI Scoping Agent (Gemini Live)' : 'AI Scoping Agent (Heuristic Engine)',
          rawInputLength: blueprintPrompt.length,
          detectedCount: extractedModuleIds.length,
          confidenceScore: blueprintResult.overallConfidencePct || blueprintResult.confidenceScore || 85,
          matchedAttributes: blueprintResult.summaryFindings || blueprintResult.attributes
        }
      };
    });

    onClose();
  };

  // Memo Copy Helper
  const handleCopySowMemo = () => {
    const memo = generateExecutiveSowMemo(scenario, blueprintResult || {
      detectedModules: scenario.selectedModules,
      excludedModules: [],
      scaleDrivers: scenario.scaleDrivers,
      clientModifiers: scenario.clientModifiers,
      rationaleNotes: ['Generated directly from active scoping scenario baseline.']
    });
    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-300 rounded-sm shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={20} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase rounded-xs">
                  Unified AI Agent
                </span>
                <h3 className="font-bold text-base text-white tracking-tight">
                  AI Scoping & Ingestion Agent
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                One-stop ingestion for RFPs, Client Notes, RFP Memos, and Intelligent Blueprint Auto-Fill.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearPastedData}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-200 hover:text-rose-200 text-xs font-semibold rounded-sm border border-slate-700 hover:border-rose-700 transition flex items-center gap-1.5 cursor-pointer font-mono"
              title="Clear all pasted text, reset loaded files, and clear extraction results"
            >
              <Trash2 size={13} className="text-slate-400 hover:text-rose-300" />
              <span>Clear Pasted Data</span>
            </button>

            <button
              type="button"
              onClick={handleCopySowMemo}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-sm border border-slate-700 transition flex items-center gap-1.5 cursor-pointer font-mono"
              title="Copy formatted Executive RFP Scope Memo to clipboard"
            >
              {copiedMemo ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedMemo ? 'Copied RFP Memo!' : 'Copy RFP Memo'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Navigation Bar */}
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex gap-1 overflow-x-auto py-2">
            <button
              type="button"
              onClick={() => setActiveMode('upload_rfp')}
              className={`px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 rounded-sm cursor-pointer ${
                activeMode === 'upload_rfp'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Upload size={14} />
              <span>1. Upload RFP / Proposal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('paste_intel')}
              className={`px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 rounded-sm cursor-pointer ${
                activeMode === 'paste_intel'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>2. Paste Intel & RFP Text</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('quick_blueprint')}
              className={`px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 rounded-sm cursor-pointer ${
                activeMode === 'quick_blueprint'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Zap size={14} />
              <span>3. Quick Blueprint Auto-Fill</span>
            </button>
            {/* Mode 4 Industry Presets hidden for simplified proposal scoping */}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Merge:</span>
            <div className="flex items-center bg-slate-200 p-0.5 rounded-sm">
              <button
                type="button"
                onClick={() => setMergeMode('merge')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer ${
                  mergeMode === 'merge' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Merge (Add)
              </button>
              <button
                type="button"
                onClick={() => setMergeMode('overwrite')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer ${
                  mergeMode === 'overwrite' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          
          {/* MODE 1: UPLOAD RFP / PROPOSAL */}
          {activeMode === 'upload_rfp' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-sm p-8 text-center bg-white hover:bg-indigo-50/30 transition">
                <input
                  type="file"
                  id="agent-rfp-upload"
                  accept=".xlsx,.xls,.csv,.tsv,.pdf,.docx,.doc,.txt,.json,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="agent-rfp-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="p-3 bg-indigo-50 rounded-full border border-indigo-200 text-indigo-600">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Drop client RFP / Excel Inventory (.xlsx, .csv) / Architecture PDF here or Browse
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Auto-detects Excel inventory rows, S/M/C complexity tiers, Oracle footprint, legal entities, and OIC endpoints.
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-sm">
                    Select Document or Spreadsheet (.xlsx, .csv)
                  </span>
                </label>
              </div>

              {/* Excel Inventory Detection Banner */}
              {parsedExcelInventory && parsedExcelInventory.items.length > 0 && (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={18} className="text-indigo-700" />
                      <span className="text-xs font-bold text-indigo-950">
                        Excel Inventory Detected: {parsedExcelInventory.totalCount} Integration Interfaces ({parsedExcelInventory.totalHours.toLocaleString()}h calculated)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-200 text-indigo-900">
                      {parsedExcelInventory.sheetNames?.join(', ') || 'Workbook'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold">
                      Simple: {parsedExcelInventory.summaryByComplexity.simple}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold">
                      Medium: {parsedExcelInventory.summaryByComplexity.medium}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold">
                      Complex: {parsedExcelInventory.summaryByComplexity.complex}
                    </span>
                    {parsedExcelInventory.summaryByComplexity.extraLarge > 0 && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold">
                        XL: {parsedExcelInventory.summaryByComplexity.extraLarge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    Applying this RFP analysis will directly populate your Technical Integration inventory and update OIC scale drivers based on the parsed spreadsheet complexity.
                  </p>
                </div>
              )}

              {rfpText && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-900">
                      Loaded file: <strong>{uploadedFileName}</strong> ({uploadedFileSize})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRfpText('');
                        setUploadedFileName('');
                        setUploadedFileSize('');
                        setParsedExcelInventory(null);
                        setRfpResult(null);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-sm transition cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <Trash2 size={12} className="text-slate-400" />
                      <span>Clear File Data</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAnalyzeRfp}
                      disabled={isAnalyzing}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isAnalyzing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>Run RFP Extraction</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RFP Extraction Results Preview */}
              {rfpResult && (
                <div className="bg-white border border-indigo-200 rounded-sm p-4 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>RFP Analysis Complete — {rfpResult.inferredModules.length} Modules Identified</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs">
                      {rfpResult.stats.overallConfidencePercentage}% Confidence
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {rfpResult.inferredModules.map((modId: string) => (
                      <span key={modId} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-xs">
                        {modId}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Extracted Findings:</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {rfpResult.summaryFindings.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: PASTE INTEL & RFP TEXT */}
          {activeMode === 'paste_intel' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setIntelTab('client')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer flex items-center gap-1.5 ${
                    intelTab === 'client' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Building2 size={13} />
                  <span>1. Client Notes {clientIntelText.trim() && '✓'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIntelTab('industry')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer flex items-center gap-1.5 ${
                    intelTab === 'industry' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Factory size={13} />
                  <span>2. Industry Mandates {industryIntelText.trim() && '✓'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIntelTab('spec')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer flex items-center gap-1.5 ${
                    intelTab === 'spec' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Database size={13} />
                  <span>3. Tech Spec / Scope Manifest {specSheetText.trim() && '✓'}</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {intelTab === 'client' && 'Client Background, Org Complexity & Objectives:'}
                    {intelTab === 'industry' && 'Industry Standards & Regulatory Requirements:'}
                    {intelTab === 'spec' && 'Technical Spec Sheet & Interface Inventories:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (intelTab === 'client') setClientIntelText('');
                        if (intelTab === 'industry') setIndustryIntelText('');
                        if (intelTab === 'spec') setSpecSheetText('');
                      }}
                      className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-1 font-mono"
                      title="Clear text for the active stream"
                    >
                      <Trash2 size={12} />
                      <span>Clear Text</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (intelTab === 'client') setClientIntelText(INTEL_PACKAGE_PRESETS[0].clientIntel);
                        if (intelTab === 'industry') setIndustryIntelText(INTEL_PACKAGE_PRESETS[0].industryIntel);
                        if (intelTab === 'spec') setSpecSheetText(INTEL_PACKAGE_PRESETS[0].specSheet);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Load Sample Text
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={intelTab === 'client' ? clientIntelText : intelTab === 'industry' ? industryIntelText : specSheetText}
                  onChange={(e) => {
                    if (intelTab === 'client') setClientIntelText(e.target.value);
                    if (intelTab === 'industry') setIndustryIntelText(e.target.value);
                    if (intelTab === 'spec') setSpecSheetText(e.target.value);
                  }}
                  placeholder="Paste discovery call transcripts, RFP clauses, or architecture notes..."
                  className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Streams populated: {(clientIntelText ? 1 : 0) + (industryIntelText ? 1 : 0) + (specSheetText ? 1 : 0)} of 3
                  </span>
                  <button
                    type="button"
                    onClick={handleSynthesizeIntel}
                    disabled={isAnalyzing}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isAnalyzing ? <RefreshCw className="animate-spin" size={13} /> : <Zap size={13} />}
                    <span>Synthesize Intel Streams</span>
                  </button>
                </div>
              </div>

              {/* Intel Synthesis Result */}
              {intelResult && (
                <div className="bg-white border border-indigo-200 rounded-sm p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="font-bold text-xs text-indigo-950 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>{intelResult.updatedScenarioPayload.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs">
                      {intelResult.synthesis.confidenceSummary.overallScore}% Conf.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                      <span className="text-slate-400 block text-[10px]">Modules</span>
                      <span className="font-bold text-slate-900">{intelResult.updatedScenarioPayload.selectedModules.length} Modules</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                      <span className="text-slate-400 block text-[10px]">Legal Entities</span>
                      <span className="font-bold text-slate-900">{intelResult.updatedScenarioPayload.scaleDrivers.fin_ent || 4} Entities</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                      <span className="text-slate-400 block text-[10px]">OIC Integrations</span>
                      <span className="font-bold text-indigo-700">{intelResult.updatedScenarioPayload.technicalIntegrations.length} Feeds</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                      <span className="text-slate-400 block text-[10px]">Conversions</span>
                      <span className="font-bold text-emerald-700">{intelResult.updatedScenarioPayload.scaleDrivers.tech_conversion_cycles || 3} Cycles</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: QUICK BLUEPRINT AUTO-FILL */}
          {activeMode === 'quick_blueprint' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Describe your client context in natural language:
                  </span>
                  <div className="flex items-center gap-2">
                    {blueprintPrompt && (
                      <button
                        type="button"
                        onClick={() => {
                          setBlueprintPrompt('');
                          setBlueprintResult(null);
                        }}
                        className="text-xs text-slate-500 hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-1 font-mono"
                      >
                        <Trash2 size={12} />
                        <span>Clear Prompt</span>
                      </button>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">One-Sentence Generator</span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={blueprintPrompt}
                  onChange={(e) => setBlueprintPrompt(e.target.value)}
                  placeholder="e.g. Mid-sized industrial discrete manufacturer in North America migrating from SAP ECC to Oracle Cloud ERP and SCM across 4 plants and 6 warehouses in 14 months."
                  className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Blueprints:</span>
                    {BLUEPRINT_SAMPLES.slice(0, 3).map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          setBlueprintPrompt(sample.rawText);
                          handleGenerateBlueprint(sample.rawText);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xs text-[10px] font-bold transition cursor-pointer"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateBlueprint()}
                    disabled={isAnalyzing}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isAnalyzing ? <RefreshCw className="animate-spin" size={13} /> : <Zap size={13} />}
                    <span>Generate Blueprint</span>
                  </button>
                </div>
              </div>

              {/* Blueprint Extraction Result */}
              {blueprintResult && (() => {
                const modulesList: Array<{ id: string; name?: string; pillar?: string; confidencePct?: number }> = 
                  (blueprintResult.inferredModules && blueprintResult.inferredModules.length > 0)
                    ? blueprintResult.inferredModules.map((m: any) => typeof m === 'string' ? { id: m } : m)
                    : (blueprintResult.detectedModules || []).map((m: string) => ({ id: m }));
                const confidence = blueprintResult.overallConfidencePct || blueprintResult.confidenceScore || 85;

                return (
                  <div className="bg-white border border-indigo-200 rounded-sm p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="font-bold text-xs text-indigo-950 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Blueprint Extraction: {blueprintResult.clientName || 'Enterprise Scope'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs ${
                          confidence >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          confidence >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {confidence}% Confidence
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-xs">
                          {modulesList.length} Modules Detected
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {modulesList.map((m) => {
                        const catalogItem = ORACLE_MODULE_CATALOG.find(c => c.id === m.id);
                        return (
                          <span key={m.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xs border border-indigo-200 flex items-center gap-1">
                            <span>{catalogItem?.name || m.name || m.id}</span>
                            {m.confidencePct && (
                              <span className="text-[10px] opacity-75 font-mono">({m.confidencePct}%)</span>
                            )}
                          </span>
                        );
                      })}
                    </div>

                    {blueprintResult.summaryFindings && blueprintResult.summaryFindings.length > 0 && (
                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                        {blueprintResult.summaryFindings.slice(0, 3).map((finding: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeMode === 'upload_rfp' && rfpResult && (
              <button
                type="button"
                onClick={handleApplyRfp}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Apply RFP Scoping Baseline</span>
              </button>
            )}

            {activeMode === 'paste_intel' && intelResult && (
              <button
                type="button"
                onClick={handleApplyIntel}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Apply Synthesized Intel Updates</span>
              </button>
            )}

            {activeMode === 'quick_blueprint' && blueprintResult && (
              <button
                type="button"
                onClick={handleApplyBlueprint}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Apply Blueprint Baseline</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
