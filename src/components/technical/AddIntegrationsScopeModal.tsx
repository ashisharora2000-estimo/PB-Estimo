import React, { useState } from 'react';
import {
  X,
  Plus,
  Network,
  Workflow,
  Sparkles,
  Layers,
  CheckCircle2,
  Sliders,
  Server,
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { TechnicalIntegrationItem, TechnicalComplexityTier } from '../../types';
import { STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG } from '../../utils/technicalSync';

interface AddIntegrationsScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIntegrations: TechnicalIntegrationItem[];
  onAddIntegrations: (newItems: TechnicalIntegrationItem[], targetTotalCount?: number) => void;
  totalProgramHours: number;
}

export const AddIntegrationsScopeModal: React.FC<AddIntegrationsScopeModalProps> = ({
  isOpen,
  onClose,
  currentIntegrations,
  onAddIntegrations,
  totalProgramHours
}) => {
  const [activeTab, setActiveTab] = useState<'quick_count' | 'multiplier' | 'system_template'>('quick_count');

  // Quick Count State
  const [countToAdd, setCountToAdd] = useState<number>(5);
  const [complexityMix, setComplexityMix] = useState<'balanced' | 'simple' | 'medium' | 'complex'>('balanced');
  const [selectedPillar, setSelectedPillar] = useState<'ERP' | 'SCM' | 'HCM' | 'CX' | 'Cross-Pillar'>('ERP');

  // Multiplier State
  const [targetEndpoints, setTargetEndpoints] = useState<number>(6);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(3.0);

  // System Template State
  const [selectedSystemTemplate, setSelectedSystemTemplate] = useState<string>('salesforce');

  if (!isOpen) return null;

  // Calculations for Quick Count
  const getAverageHoursForComplexity = () => {
    if (complexityMix === 'simple') return 40;
    if (complexityMix === 'medium') return 80;
    if (complexityMix === 'complex') return 140;
    return 82; // Balanced mix
  };

  const currentCount = currentIntegrations.length;
  const currentHours = currentIntegrations.reduce((sum, item) => sum + (item.calculatedHours || 80), 0);
  const avgHoursPerNew = getAverageHoursForComplexity();
  const addedHours = countToAdd * avgHoursPerNew;
  const newTotalCount = currentCount + countToAdd;
  const newTotalHours = currentHours + addedHours;

  // System templates catalog
  const SYSTEM_TEMPLATES: Record<string, {
    name: string;
    description: string;
    flows: Array<{ name: string; type: string; complexity: TechnicalComplexityTier; hours: number }>;
  }> = {
    salesforce: {
      name: 'Salesforce CRM & Quoting',
      description: 'Customer master, real-time quote-to-order sync, and shipment status callback.',
      flows: [
        { name: 'Salesforce Customer Account Master Sync', type: 'inbound_rest', complexity: 'M', hours: 78 },
        { name: 'Opportunity Win to Order Real-Time Handshake', type: 'bidirectional_sync', complexity: 'C', hours: 195 },
        { name: 'Shipment & Invoice Status Callback', type: 'outbound_extract', complexity: 'S', hours: 55 }
      ]
    },
    banking: {
      name: 'Commercial Banking Host-to-Host (JPMorgan / Citi / SWIFT)',
      description: 'Automated bank statement reconciliation, ISO 20022 payments, and Positive Pay.',
      flows: [
        { name: 'Bank Statement Auto-Reconciliation (MT940 / CAMT.053)', type: 'batch_fbdi', complexity: 'M', hours: 98 },
        { name: 'ISO 20022 XML Payment Dispatch (pain.001)', type: 'outbound_extract', complexity: 'C', hours: 140 },
        { name: 'Positive Pay Fraud Check Dispatch', type: 'outbound_extract', complexity: 'S', hours: 45 }
      ]
    },
    hcm_adp: {
      name: 'ADP GlobalView / Ceridian Payroll & HR',
      description: 'Worker assignments, cost center hierarchy, and bi-weekly payroll GL summary journals.',
      flows: [
        { name: 'ADP Worker Master & Cost Center Ingestion', type: 'inbound_rest', complexity: 'M', hours: 80 },
        { name: 'Payroll Summary Gross-to-Net GL Journal Inbound', type: 'inbound_rest', complexity: 'M', hours: 78 }
      ]
    },
    coupa: {
      name: 'Coupa Procurement Cloud',
      description: 'Requisition sync, supplier bank details, and purchase order status orchestration.',
      flows: [
        { name: 'Coupa Requisition to Purchase Order Sync', type: 'bidirectional_sync', complexity: 'M', hours: 95 },
        { name: 'Supplier Master & Bank Account Replication', type: 'inbound_rest', complexity: 'M', hours: 75 }
      ]
    },
    logistics_3pl: {
      name: '3PL Logistics & Warehouse Management (EDI / AS2)',
      description: 'Shipping advice EDI 856, container receipt confirmations, and inventory sync.',
      flows: [
        { name: '3PL Logistics ASN Shipping Notice (EDI 856 / 945)', type: 'batch_fbdi', complexity: 'C', hours: 232 },
        { name: 'Daily Inventory Balance Snapshot Reconciliation', type: 'inbound_rest', complexity: 'M', hours: 78 }
      ]
    },
    snowflake: {
      name: 'Snowflake / AWS Enterprise Data Lakehouse',
      description: 'Scheduled incremental BICC View Object extracts to corporate analytics lakehouse.',
      flows: [
        { name: 'BICC Incremental Financials & SCM View Object Pipeline', type: 'outbound_extract', complexity: 'M', hours: 95 }
      ]
    }
  };

  // Handler 1: Apply Quick Count
  const handleApplyQuickCount = () => {
    const newItems: TechnicalIntegrationItem[] = [];
    const startIndex = currentCount + 1;

    for (let i = 0; i < countToAdd; i++) {
      const num = startIndex + i;
      const code = `INT-${String(num).padStart(2, '0')}`;
      const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];

      let t: TechnicalComplexityTier = 'M';
      if (complexityMix === 'simple') t = 'S';
      else if (complexityMix === 'medium') t = 'M';
      else if (complexityMix === 'complex') t = 'C';
      else {
        // Balanced
        t = i % 3 === 0 ? 'S' : i % 3 === 1 ? 'M' : 'C';
      }

      const h = t === 'S' ? 40 : t === 'M' ? 80 : 140;

      newItems.push({
        id: `int_added_${Date.now()}_${num}`,
        code,
        name: std ? std.name : `${selectedPillar} Integration Flow (${code})`,
        pillar: selectedPillar === 'Cross-Pillar' ? (num % 2 === 0 ? 'ERP' : 'SCM') : selectedPillar,
        sourceSystem: std ? std.sourceSystem : 'External Boundary Platform',
        targetSystem: std ? std.targetSystem : 'Oracle Cloud ERP & Financials',
        type: std ? std.type : 'inbound_rest',
        complexity: t,
        isQuestionDriven: true,
        questionAnswers: {
          patternDirection: 0,
          mappingComplexity: t === 'S' ? 0 : t === 'M' ? 1 : 2,
          connectivityProtocol: 0,
          dataVolume: 0,
          errorHandling: 1,
          apiReadiness: 0
        },
        baseHours: h,
        calculatedHours: h,
        calculationFormula: `${h}h standard tier allocation (${t})`,
        compositeScore: t === 'S' ? 1.0 : t === 'M' ? 1.5 : 2.2,
        rationale: std ? std.rationale : `Added to scope for ${selectedPillar} technical integration architecture.`
      });
    }

    onAddIntegrations([...currentIntegrations, ...newItems], newTotalCount);
    onClose();
  };

  // Handler 2: Apply Multiplier
  const handleApplyMultiplier = () => {
    const totalFlows = Math.max(1, Math.round(targetEndpoints * targetMultiplier));
    const newItems: TechnicalIntegrationItem[] = [];

    for (let i = 1; i <= totalFlows; i++) {
      const code = `INT-${String(i).padStart(2, '0')}`;
      const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];
      const complexity: TechnicalComplexityTier = i % 4 === 1 ? 'S' : i % 4 === 0 ? 'C' : 'M';
      const h = complexity === 'S' ? 40 : complexity === 'M' ? 80 : 140;

      newItems.push({
        id: `int_matrix_${Date.now()}_${i}`,
        code,
        name: std ? std.name : `Enterprise Integration Flow (${code})`,
        pillar: std ? std.pillar : (i % 2 === 0 ? 'ERP' : 'SCM'),
        sourceSystem: std ? std.sourceSystem : 'Enterprise Third-Party Platform',
        targetSystem: std ? std.targetSystem : 'Oracle Cloud ERP & Financials',
        type: std ? std.type : 'inbound_rest',
        complexity,
        isQuestionDriven: true,
        questionAnswers: {
          patternDirection: 0,
          mappingComplexity: complexity === 'S' ? 0 : complexity === 'M' ? 1 : 2,
          connectivityProtocol: 0,
          dataVolume: 0,
          errorHandling: 1,
          apiReadiness: 0
        },
        baseHours: h,
        calculatedHours: h,
        calculationFormula: `${h}h standard tier (${targetEndpoints} Endpoints × ${targetMultiplier} flows/endpoint)`,
        compositeScore: complexity === 'S' ? 1.0 : complexity === 'M' ? 1.5 : 2.2,
        rationale: std ? std.rationale : `Sized from ${targetEndpoints} external endpoints with ~${targetMultiplier} flows/endpoint benchmark.`
      });
    }

    onAddIntegrations(newItems, totalFlows);
    onClose();
  };

  // Handler 3: Apply System Template
  const handleApplySystemTemplate = () => {
    const tmpl = SYSTEM_TEMPLATES[selectedSystemTemplate];
    if (!tmpl) return;

    const startIndex = currentCount + 1;
    const newItems: TechnicalIntegrationItem[] = tmpl.flows.map((flow, idx) => {
      const num = startIndex + idx;
      const code = `INT-${String(num).padStart(2, '0')}`;
      return {
        id: `int_tmpl_${Date.now()}_${num}`,
        code,
        name: flow.name,
        pillar: selectedSystemTemplate === 'salesforce' ? 'CX' : selectedSystemTemplate === 'logistics_3pl' ? 'SCM' : selectedSystemTemplate === 'hcm_adp' ? 'HCM' : 'ERP',
        sourceSystem: tmpl.name,
        targetSystem: 'Oracle Cloud SaaS',
        type: flow.type as any,
        complexity: flow.complexity,
        isQuestionDriven: true,
        questionAnswers: {
          patternDirection: 0,
          mappingComplexity: flow.complexity === 'S' ? 0 : flow.complexity === 'M' ? 1 : 2,
          connectivityProtocol: 0,
          dataVolume: 0,
          errorHandling: 1,
          apiReadiness: 0
        },
        baseHours: flow.hours,
        calculatedHours: flow.hours,
        calculationFormula: `${flow.hours}h standard template allocation (${flow.complexity})`,
        compositeScore: flow.complexity === 'S' ? 1.0 : flow.complexity === 'M' ? 1.5 : 2.2,
        rationale: `Enterprise integration flow connecting ${tmpl.name} to Oracle Fusion.`
      };
    });

    onAddIntegrations([...currentIntegrations, ...newItems], currentCount + newItems.length);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-300 w-full max-w-2xl shadow-2xl rounded-xs overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Workflow size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-mono tracking-tight text-white flex items-center gap-2">
                <span>Add Integrations to Technical Scope</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 uppercase">
                  Effort Sizing Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Current Scope: {currentCount} Integrations ({currentHours.toLocaleString()}h)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer rounded-xs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('quick_count')}
            className={`px-3 py-2 text-xs font-mono font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quick_count'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus size={13} />
            <span>1. Quick Add by Count</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('multiplier')}
            className={`px-3 py-2 text-xs font-mono font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'multiplier'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders size={13} />
            <span>2. Endpoints × Flows Multiplier</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system_template')}
            className={`px-3 py-2 text-xs font-mono font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'system_template'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server size={13} />
            <span>3. Add Connected System</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: QUICK ADD BY COUNT */}
          {activeTab === 'quick_count' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xs text-slate-700 space-y-1">
                <p className="font-bold text-blue-950 font-mono text-[11px] uppercase tracking-wider">
                  Direct Integration Count Expansion
                </p>
                <p className="text-xs leading-relaxed text-blue-900">
                  Select how many integration flows to add to your scope. Each integration generates an itemized flow in your technical inventory and recalculates your total technical and commercial hours.
                </p>
              </div>

              {/* Step 1: How many to add */}
              <div className="space-y-2">
                <label className="font-mono font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
                  1. How Many Integrations to Add?
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 3, 5, 8, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCountToAdd(num)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold border transition cursor-pointer rounded-xs ${
                        countToAdd === num
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      +{num} {num === 1 ? 'Flow' : 'Flows'}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-slate-500 font-mono text-[11px]">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={countToAdd}
                      onChange={(e) => setCountToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 p-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-none focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Complexity Mix */}
              <div className="space-y-2">
                <label className="font-mono font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
                  2. Complexity Tier Allocation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced Mix', desc: '35% S, 45% M, 20% C (~82h avg)' },
                    { id: 'simple', label: 'Simple (S)', desc: '1:1 Passthrough (40h each)' },
                    { id: 'medium', label: 'Medium (M)', desc: 'Standard DVMs (80h each)' },
                    { id: 'complex', label: 'Complex (C)', desc: 'Multi-entity / EDI (140h each)' }
                  ].map((mix) => (
                    <button
                      key={mix.id}
                      type="button"
                      onClick={() => setComplexityMix(mix.id as any)}
                      className={`p-2 border text-left rounded-xs transition cursor-pointer ${
                        complexityMix === mix.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <p className="font-mono font-bold text-[11px]">{mix.label}</p>
                      <p className={`text-[10px] mt-0.5 ${complexityMix === mix.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {mix.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Domain Pillar */}
              <div className="space-y-2">
                <label className="font-mono font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
                  3. Target Oracle Functional Pillar
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['ERP', 'SCM', 'HCM', 'CX', 'Cross-Pillar'] as const).map((pillar) => (
                    <button
                      key={pillar}
                      type="button"
                      onClick={() => setSelectedPillar(pillar)}
                      className={`px-3 py-1 font-mono font-bold text-xs border rounded-xs transition cursor-pointer ${
                        selectedPillar === pillar
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE EFFORT IMPACT BOX */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xs space-y-2 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                    Calculated Overall Effort Impact
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    +{addedHours.toLocaleString()} Tech Hours
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Current Scope</span>
                    <span className="text-sm font-mono font-bold text-slate-200">{currentCount} Integrations</span>
                    <span className="text-[10px] text-slate-400 block">{currentHours.toLocaleString()}h</span>
                  </div>
                  <div className="text-amber-400 font-mono font-extrabold flex items-center justify-center text-lg">
                    +
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300 font-mono uppercase block">New Total Scope</span>
                    <span className="text-sm font-mono font-bold text-white">{newTotalCount} Integrations</span>
                    <span className="text-[10px] text-amber-400 block font-bold">{newTotalHours.toLocaleString()}h</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center pt-1 font-mono">
                  Adding {countToAdd} integrations increases technical workstream by {addedHours.toLocaleString()} hours across Design, Build, SIT, and Deployment.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold text-xs rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyQuickCount}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add {countToAdd} Integrations (+{addedHours.toLocaleString()}h)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MULTIPLIER (ENDPOINTS × FLOWS/ENDPOINT) */}
          {activeTab === 'multiplier' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xs text-indigo-950 space-y-1">
                <p className="font-bold font-mono text-[11px] uppercase tracking-wider text-indigo-900">
                  Top-Down Architecture Multiplier Rule
                </p>
                <p className="text-xs leading-relaxed text-indigo-900">
                  In enterprise architecture, <strong>1 Boundary System ≠ 1 Integration</strong>. A client connecting to 6 systems typically requires <strong>2 to 4 integration flows per system</strong> (e.g. Inbound, Outbound, Sync, Callbacks).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs space-y-2">
                  <label className="font-mono font-bold text-slate-800 text-[11px] uppercase block">
                    1. Connected Endpoints / Systems
                  </label>
                  <div className="flex items-center gap-2">
                    {[4, 6, 8, 10, 12, 16].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTargetEndpoints(num)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold border rounded-xs transition cursor-pointer ${
                          targetEndpoints === num
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Number of external platforms (Salesforce, Banking, ADP, Coupa, etc.)
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs space-y-2">
                  <label className="font-mono font-bold text-slate-800 text-[11px] uppercase block">
                    2. Integrations per Endpoint
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { label: '1.5x (Lean)', val: 1.5 },
                      { label: '2.5x (Standard)', val: 2.5 },
                      { label: '3.0x (Robust)', val: 3.0 },
                      { label: '4.0x (Heavy)', val: 4.0 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTargetMultiplier(opt.val)}
                        className={`px-2 py-1 text-xs font-mono font-bold border rounded-xs transition cursor-pointer ${
                          targetMultiplier === opt.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Average transaction touchpoints per boundary system.
                  </p>
                </div>
              </div>

              {/* Multiplier Calculation Result */}
              <div className="bg-slate-900 text-white p-4 rounded-xs border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
                  <span className="text-xs uppercase text-slate-400 font-bold">Calculated Total Integrations</span>
                  <span className="text-xl font-extrabold text-amber-400">
                    {Math.round(targetEndpoints * targetMultiplier)} Flows
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-300">
                  <span>
                    Formula: {targetEndpoints} Endpoints × {targetMultiplier} Flows/Endpoint
                  </span>
                  <span className="text-blue-300 font-bold">
                    ~{(Math.round(targetEndpoints * targetMultiplier) * 82).toLocaleString()} Estimated Tech Hours
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold text-xs rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyMultiplier}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Sliders size={14} />
                  <span>Apply {Math.round(targetEndpoints * targetMultiplier)} Integrations Matrix</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADD PRE-BUILT CONNECTED SYSTEM TEMPLATE */}
          {activeTab === 'system_template' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xs text-emerald-950 space-y-1">
                <p className="font-bold font-mono text-[11px] uppercase tracking-wider text-emerald-900">
                  Add Enterprise System with Pre-Configured Integration Flows
                </p>
                <p className="text-xs leading-relaxed text-emerald-900">
                  Select a common boundary platform to automatically add all its standard integration flows into your scope at once.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(SYSTEM_TEMPLATES).map(([key, tmpl]) => {
                  const totalTmplHours = tmpl.flows.reduce((sum, f) => sum + f.hours, 0);
                  const isSelected = selectedSystemTemplate === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSystemTemplate(key)}
                      className={`p-3 border text-left rounded-xs transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/60'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-xs">{tmpl.name}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs border ${
                            isSelected ? 'bg-emerald-400 text-slate-950 border-emerald-400' : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {tmpl.flows.length} Flows
                          </span>
                        </div>
                        <p className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {tmpl.description}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[10px] font-mono">
                        <span className={isSelected ? 'text-emerald-300' : 'text-slate-600'}>
                          Includes: {tmpl.flows.map(f => f.complexity).join('/')}
                        </span>
                        <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                          {totalTmplHours} hrs
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold text-xs rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplySystemTemplate}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>
                    Add {SYSTEM_TEMPLATES[selectedSystemTemplate]?.name.split('(')[0].trim()} ({SYSTEM_TEMPLATES[selectedSystemTemplate]?.flows.length} Flows)
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
