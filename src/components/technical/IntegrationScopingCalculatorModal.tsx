import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Calculator,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import {
  TechnicalIntegrationItem,
  IntegrationQuestionAnswers,
  TechnicalIntegrationType,
  TechnicalComplexityTier
} from '../../types';
import {
  INTEGRATION_SCOPING_QUESTIONS,
  calculateIntegrationEffort
} from '../../data/technicalScopingData';

interface IntegrationScopingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: TechnicalIntegrationItem | null;
  onSaveIntegration: (updated: TechnicalIntegrationItem) => void;
}

export const IntegrationScopingCalculatorModal: React.FC<IntegrationScopingCalculatorModalProps> = ({
  isOpen,
  onClose,
  integration,
  onSaveIntegration
}) => {
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [pillar, setPillar] = useState<'ERP' | 'SCM' | 'HCM' | 'EPM' | 'CX' | 'Cross-Pillar'>('ERP');
  const [sourceSystem, setSourceSystem] = useState<string>('');
  const [targetSystem, setTargetSystem] = useState<string>('');
  const [type, setType] = useState<TechnicalIntegrationType>('inbound_rest');
  const [answers, setAnswers] = useState<IntegrationQuestionAnswers>({
    patternDirection: 0,
    mappingComplexity: 1,
    connectivityProtocol: 0,
    dataVolume: 0,
    errorHandling: 1,
    apiReadiness: 0
  });
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (integration) {
      setName(integration.name || '');
      setCode(integration.code || '');
      setPillar(integration.pillar || 'ERP');
      setSourceSystem(integration.sourceSystem || '');
      setTargetSystem(integration.targetSystem || '');
      setType(integration.type || 'inbound_rest');
      setAnswers(integration.questionAnswers || {
        patternDirection: 0,
        mappingComplexity: 1,
        connectivityProtocol: 0,
        dataVolume: 0,
        errorHandling: 1,
        apiReadiness: 0
      });
      setNotes(integration.notes || '');
    }
  }, [integration]);

  if (!isOpen || !integration) return null;

  // Real-time calculation from current answers and type
  const calculation = calculateIntegrationEffort(answers, type);

  const handleUpdateAnswer = (questionId: keyof IntegrationQuestionAnswers, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSave = () => {
    const updated: TechnicalIntegrationItem = {
      ...integration,
      name,
      code,
      pillar,
      sourceSystem,
      targetSystem,
      type,
      isQuestionDriven: true,
      questionAnswers: answers,
      baseHours: 45,
      calculatedHours: calculation.calculatedHours,
      complexity: calculation.complexity,
      calculationFormula: calculation.calculationFormula,
      compositeScore: calculation.compositeScore,
      rationale: calculation.rationale,
      notes
    };
    onSaveIntegration(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 w-full max-w-4xl rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-none bg-blue-600 text-white shadow-xs">
              <Calculator size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
                  Integration Scoping & Calculation Logic
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-800 text-slate-300 rounded-none border border-slate-700">
                  {code || 'INT-NEW'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Question-Driven Effort Sizing: {name || 'Custom Integration'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-none hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Top Live Sizing Output Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-none border border-slate-700 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Mathematical Result & S/M/C Tier
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono font-black text-white">
                    {calculation.calculatedHours} <span className="text-xs font-normal text-slate-300">hrs</span>
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-mono font-black uppercase rounded-none border ${
                    calculation.complexity === 'S'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : calculation.complexity === 'M'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : calculation.complexity === 'C'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    Score {calculation.compositeScore} &bull; Tier {calculation.complexity} ({
                      calculation.complexity === 'S' ? 'Simple' :
                      calculation.complexity === 'M' ? 'Medium' :
                      calculation.complexity === 'C' ? 'Complex' : 'Extra Complex'
                    })
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-none border border-slate-700 font-mono text-[11px] text-amber-300 max-w-md">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5 font-sans font-bold">
                  Calculation Formula:
                </div>
                <div className="break-all">{calculation.calculationFormula}</div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700 text-[11px] text-slate-300 flex items-center gap-2">
              <Info size={13} className="text-blue-400 shrink-0" />
              <span>{calculation.rationale}</span>
            </div>
          </div>

          {/* Integration Metadata Inputs */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-none space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              1. Integration Object Identity & Systems
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Integration Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-mono text-xs text-slate-900 font-bold"
                  placeholder="INT-01"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Integration Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                  placeholder="Salesforce to Oracle OM Sync"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Pillar Domain</label>
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                >
                  <option value="ERP">ERP (Financials & Accounting)</option>
                  <option value="SCM">SCM (Supply Chain & Order Mgmt)</option>
                  <option value="HCM">HCM (Workforce & Payroll)</option>
                  <option value="CX">CX (CRM & CPQ)</option>
                  <option value="EPM">EPM (Planning & Consolidations)</option>
                  <option value="Cross-Pillar">Cross-Pillar Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Architecture Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 font-bold font-mono"
                >
                  <option value="inbound_rest">Inbound REST / API (1.00x)</option>
                  <option value="outbound_extract">Outbound BICC Extract (1.10x)</option>
                  <option value="bidirectional_sync">Bidirectional Real-Time (1.40x)</option>
                  <option value="batch_fbdi">Batch FBDI / File Handler (1.30x)</option>
                  <option value="event_driven">Event-Driven Pub/Sub (1.50x)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Source System</label>
                <input
                  type="text"
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  placeholder="Salesforce Sales Cloud / Workday / 3PL"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Target System</label>
                <input
                  type="text"
                  value={targetSystem}
                  onChange={(e) => setTargetSystem(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  placeholder="Oracle Cloud ERP / Payables / Order Mgmt"
                />
              </div>
            </div>
          </div>

          {/* 6 Technical Scoping Questions */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  2. Question-Driven Technical Complexity Dimensions
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Select the architectural parameters governing this integration
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                6 Standard Oracle OIC Factors
              </span>
            </div>

            <div className="space-y-4">
              {INTEGRATION_SCOPING_QUESTIONS.map((q, qIndex) => {
                const selectedOptionIdx = answers[q.id] !== undefined ? answers[q.id] : 0;
                return (
                  <div key={q.id} className="bg-white p-4 border border-slate-200 rounded-none space-y-2.5 shadow-2xs hover:border-slate-300 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded-none bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                            Q{qIndex + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">{q.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{q.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-none bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-bold shrink-0">
                        {q.options[selectedOptionIdx]?.multiplier.toFixed(2)}x factor
                      </span>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOptionIdx === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleUpdateAnswer(q.id, optIdx)}
                            className={`p-2.5 text-left border rounded-none transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`font-bold text-[11px] ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                  {opt.label}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-none shrink-0 ${
                                  isSelected ? 'bg-slate-800 text-emerald-400 font-bold' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {opt.multiplier.toFixed(2)}x &bull; C{opt.score}
                                </span>
                              </div>
                              <p className={`text-[10px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {opt.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-bold text-slate-900">Result:</span>
            <span className="font-mono font-bold text-blue-700">{calculation.calculatedHours} hrs</span>
            <span className="text-slate-400">&bull;</span>
            <span className="font-bold">Tier {calculation.complexity}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Apply Sizing ({calculation.calculatedHours}h)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
