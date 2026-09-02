import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck2,
  FileQuestion,
  Layers,
  Percent,
  Copy,
  ChevronRight,
  Database
} from 'lucide-react';
import { ProjectScenario, UploadedProposal, OracleModule } from '../../types';
import { parseProposalDocument, SAMPLE_PROPOSAL_TEMPLATES } from '../../utils/proposalParser';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';

interface ProposalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenClientQa?: () => void;
}

export const ProposalUploadModal: React.FC<ProposalUploadModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario,
  onOpenClientQa
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples' | 'history'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('Enterprise_RFP_Proposal.docx');
  const [fileSize, setFileSize] = useState('245 KB');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setPastedText(content || '');
      };
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_PROPOSAL_TEMPLATES[0]) => {
    setFileName(`${sample.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
    setFileSize('480 KB');
    setPastedText(sample.content);
    setActiveTab('paste');
  };

  const handleExecuteAiAnalysis = () => {
    const content = pastedText.trim() || SAMPLE_PROPOSAL_TEMPLATES[0].content;
    setIsParsing(true);

    setTimeout(() => {
      const parsed = parseProposalDocument(content);
      setParseResult(parsed);
      setIsParsing(false);
    }, 450);
  };

  const handleApplyToScenario = () => {
    if (!parseResult) return;

    onUpdateScenario(prev => {
      const currentScale = { ...prev.scaleDrivers, ...(parseResult.extractedScaleDrivers || {}) };
      const currentAnswers = { ...(prev.moduleQuestionAnswers || {}), ...(parseResult.questionAnswers || {}) };
      const currentMeta = { ...(prev.questionConfidenceMeta || {}), ...(parseResult.questionConfidenceMeta || {}) };

      const proposalRecord: UploadedProposal = {
        id: `prop_${Date.now()}`,
        fileName: fileName || 'Uploaded_Proposal.pdf',
        uploadedAt: new Date().toISOString(),
        fileSize: fileSize || '320 KB',
        rawText: pastedText.slice(0, 1000) + '...',
        analyzedStatus: 'analyzed',
        inferredModules: parseResult.inferredModules,
        highConfidenceCount: parseResult.stats.highConfidenceCount,
        mediumConfidenceCount: parseResult.stats.mediumConfidenceCount,
        lowConfidenceCount: parseResult.stats.lowConfidenceCount,
        extractedScaleDrivers: parseResult.extractedScaleDrivers,
        summaryFindings: parseResult.summaryFindings,
        clientClarificationsNeeded: parseResult.clientClarificationsNeeded
      };

      return {
        ...prev,
        selectedModules: Array.from(new Set([...prev.selectedModules, ...parseResult.inferredModules])),
        scaleDrivers: currentScale,
        moduleQuestionAnswers: currentAnswers,
        questionConfidenceMeta: currentMeta,
        uploadedProposals: [proposalRecord, ...(prev.uploadedProposals || []).slice(0, 4)]
      };
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-none border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  AI Proposal Ingestion & Discovery Engine
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-900/80 text-indigo-200 border border-indigo-700">
                  Confidence Scoring
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Upload Proposal / RFP to Auto-Derive Scoping & Confidence
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-none hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload size={14} />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>Paste RFP / Text</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'samples'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>Sample Industry RFPs</span>
          </button>

          {scenario.uploadedProposals && scenario.uploadedProposals.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 size={14} />
              <span>Uploaded History ({scenario.uploadedProposals.length})</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-none p-8 text-center bg-slate-50 hover:bg-indigo-50/30 transition">
                <input
                  type="file"
                  id="proposal-file-input"
                  accept=".pdf,.docx,.doc,.txt,.json,.md,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="proposal-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="p-3 bg-white border border-slate-200 shadow-xs text-indigo-600">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Click to upload Proposal / RFP or drag and drop
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Supports PDF, Word (.docx), Markdown, JSON, or Plain Text
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                    Browse Files
                  </span>
                </label>
              </div>

              {pastedText && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-900">
                      Loaded file: <strong>{fileName}</strong> ({fileSize})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('paste')}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    View Text
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Paste Client RFP / Architecture Text:
                </label>
                <button
                  onClick={() => setPastedText(SAMPLE_PROPOSAL_TEMPLATES[0].content)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  Insert Sample Text
                </button>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the RFP requirements, scope sections, business process scope, entities, or integration specs here..."
                rows={10}
                className="w-full p-3.5 text-xs font-mono border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_PROPOSAL_TEMPLATES.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="p-4 border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-400 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                      Preset {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Load & Inspect</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && scenario.uploadedProposals && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Previously Analyzed Proposal Dossiers
              </h4>
              <div className="space-y-2">
                {scenario.uploadedProposals.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-600" />
                        <span className="text-xs font-bold text-slate-900">{item.fileName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600">
                        <span>Modules: <strong>{item.inferredModules?.length || 0}</strong></span>
                        <span className="text-emerald-700">High Confidence: <strong>{item.highConfidenceCount}</strong></span>
                        <span className="text-amber-700">Med Confidence: <strong>{item.mediumConfidenceCount}</strong></span>
                        <span className="text-rose-700">Low (Q&A): <strong>{item.lowConfidenceCount}</strong></span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active In Baseline
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Trigger & Results */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  AI Scoping & Confidence Engine
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluates text against 20-point Oracle domain matrix to derive answers & tag confidence levels.
                </p>
              </div>

              <button
                onClick={handleExecuteAiAnalysis}
                disabled={isParsing || (!pastedText.trim() && activeTab !== 'samples')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isParsing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Run AI Scoping Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Results Preview */}
            {parseResult && (
              <div className="bg-slate-50 border border-indigo-200 p-5 space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>AI Extraction & Confidence Calibration Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">
                      Overall Match Confidence:
                    </span>
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-600 text-white">
                      {parseResult.stats.overallConfidencePercentage}%
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      In-Scope Modules
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {parseResult.inferredModules.length} Modules
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      High Confidence
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-800">
                      {parseResult.stats.highConfidenceCount} (90-95%)
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      Med Confidence
                    </span>
                    <span className="text-lg font-bold font-mono text-amber-800">
                      {parseResult.stats.mediumConfidenceCount} (65-75%)
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                      Flagged for Client Q&A
                    </span>
                    <span className="text-lg font-bold font-mono text-rose-800">
                      {parseResult.stats.lowConfidenceCount} (Low/Uncertain)
                    </span>
                  </div>
                </div>

                {/* Key Findings List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Extracted Architectural Drivers & Scale:
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc">
                    {parseResult.summaryFindings.map((finding: string, idx: number) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </div>

                {/* Low Confidence Action Banner */}
                {parseResult.stats.lowConfidenceCount > 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <FileQuestion size={18} className="text-amber-700 shrink-0" />
                      <div className="text-xs text-amber-900">
                        <strong>{parseResult.stats.lowConfidenceCount} questions</strong> require client clarification. They will be automatically packaged into the <strong>Client Q&A Exporter</strong>.
                      </div>
                    </div>
                    {onOpenClientQa && (
                      <button
                        onClick={() => {
                          handleApplyToScenario();
                          onOpenClientQa();
                        }}
                        className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-[11px] font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                      >
                        Review in Client Q&A
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyToScenario}
            disabled={!parseResult}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <CheckCircle2 size={15} />
            <span>Apply Sizing & Confidence Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
