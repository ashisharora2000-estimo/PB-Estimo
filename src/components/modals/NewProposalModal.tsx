import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Copy,
  Sparkles,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  Globe,
  Upload,
  Zap
} from 'lucide-react';
import { ProjectScenario, OraclePillar, RolloutApproach } from '../../types';
import { PRESET_SCENARIOS } from '../../data/templates';
import { AIScopingAgentModal } from './AIScopingAgentModal';
import { generateBlankSlateScenario } from '../../utils/technicalSync';

interface NewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ProjectScenario;
  onCreateProposal: (newScenario: ProjectScenario) => void;
}

const INDUSTRY_OPTIONS = [
  'Discrete & Process Manufacturing',
  'Retail, Wholesale & Omnichannel',
  'Banking, Insurance & Financial Services',
  'Healthcare, BioTech & Life Sciences',
  'Energy, Utilities & Natural Resources',
  'Logistics, Transportation & 3PL',
  'Professional Services, Media & Tech',
  'Public Sector, Education & Non-Profit',
  'General Enterprise'
];

const PILLAR_CONFIGS: { id: OraclePillar; label: string; defaultModules: string[]; desc: string }[] = [
  {
    id: 'ERP',
    label: 'Financials & Procurement (ERP)',
    defaultModules: ['erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_cm', 'erp_proc'],
    desc: 'Core Ledgers, AP/AR, Assets, Cash Mgmt, Purchasing'
  },
  {
    id: 'SCM',
    label: 'Supply Chain & Manufacturing (SCM)',
    defaultModules: ['scm_inv', 'scm_om', 'scm_mfg', 'scm_maint', 'scm_plan'],
    desc: 'Inventory, Order Mgmt, Discrete Mfg, Maintenance'
  },
  {
    id: 'HCM',
    label: 'Human Capital Management (HCM)',
    defaultModules: ['hcm_core', 'hcm_pay', 'hcm_absence', 'hcm_talent'],
    desc: 'Global HR, Payroll, Absence & Talent Mgmt'
  },
  {
    id: 'EPM',
    label: 'Enterprise Performance Mgmt (EPM)',
    defaultModules: ['epm_fccs', 'epm_epbcs', 'epm_arcss'],
    desc: 'Financial Consolidation, Budgeting & Planning'
  },
  {
    id: 'CX',
    label: 'Customer Experience & CRM (CX)',
    defaultModules: ['cx_sales', 'cx_service', 'cx_cpq'],
    desc: 'B2B Sales, Service Cloud & CPQ'
  }
];

export const NewProposalModal: React.FC<NewProposalModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  onCreateProposal
}) => {
  const [creationMode, setCreationMode] = useState<'scratch' | 'template' | 'clone' | 'ai_agent'>('scratch');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [isAiAgentModalOpen, setIsAiAgentModalOpen] = useState(false);

  // Form Fields - Defaulting to pure Blank Slate (0 modules)
  const [thorId, setThorId] = useState('');
  const [thorIdError, setThorIdError] = useState<string | null>(null);
  const [proposalName, setProposalName] = useState('New Oracle Implementation Proposal (Clean Slate)');
  const [clientName, setClientName] = useState('Acme Corporation');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [targetStartDate, setTargetStartDate] = useState('2026-09-01');
  const [targetGoLiveDate, setTargetGoLiveDate] = useState('2027-06-30');
  const [rolloutApproach, setRolloutApproach] = useState<RolloutApproach>('phased_geo');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]); // Clean slate: 0 modules selected by default
  const [description, setDescription] = useState('Clean slate Oracle Cloud digital transformation roadmap and implementation sizing.');

  // Reset to pristine Blank Slate whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCreationMode('scratch');
      setSelectedPillars([]); // Clean slate: 0 modules
      setThorId(activeScenario.thorId ? `${activeScenario.thorId}-NEW` : '');
      setThorIdError(null);
      setProposalName('New Oracle Implementation Proposal (Clean Slate)');
      setClientName('Acme Corporation');
      setIndustry(INDUSTRY_OPTIONS[0]);
      setTargetStartDate('2026-09-01');
      setTargetGoLiveDate('2027-06-30');
      setRolloutApproach('phased_geo');
      setDescription('Clean slate Oracle Cloud digital transformation roadmap and implementation sizing.');
    }
  }, [isOpen, activeScenario.thorId]);

  if (!isOpen) return null;

  const selectedModulesCount = PILLAR_CONFIGS.reduce((count, p) => {
    return selectedPillars.includes(p.id) ? count + p.defaultModules.length : count;
  }, 0);

  const togglePillar = (pillarId: string) => {
    setSelectedPillars(prev =>
      prev.includes(pillarId) ? prev.filter(p => p !== pillarId) : [...prev, pillarId]
    );
  };

  const handleCreate = () => {
    if (!thorId.trim()) {
      setThorIdError('Thor ID is mandatory. Please enter a valid Thor ID.');
      return;
    }

    const newId = 'custom_deal_' + Date.now();
    let baseScenario: ProjectScenario;

    if (creationMode === 'clone') {
      baseScenario = JSON.parse(JSON.stringify(activeScenario));
      baseScenario.id = newId;
      baseScenario.thorId = thorId.trim();
      baseScenario.name = proposalName.trim() || `${activeScenario.name} (Copy)`;
      baseScenario.description = description.trim() || activeScenario.description;
      baseScenario.targetStartDate = targetStartDate;
      baseScenario.clientTargetGoLiveDate = targetGoLiveDate;
    } else if (creationMode === 'template') {
      const template = PRESET_SCENARIOS.find(p => p.id === selectedTemplateId) || PRESET_SCENARIOS[0];
      baseScenario = JSON.parse(JSON.stringify(template));
      baseScenario.id = newId;
      baseScenario.thorId = thorId.trim();
      baseScenario.name = proposalName.trim() || `${template.name} - ${clientName}`;
      baseScenario.description = description.trim() || template.description;
      baseScenario.targetStartDate = targetStartDate;
      baseScenario.clientTargetGoLiveDate = targetGoLiveDate;
    } else {
      // From Scratch / Clean-Slate (Blank Slate)
      const selectedModules: string[] = [];
      PILLAR_CONFIGS.forEach(p => {
        if (selectedPillars.includes(p.id)) {
          selectedModules.push(...p.defaultModules);
        }
      });

      const isCleanSlate = selectedModules.length === 0;

      // Use the authoritative generateBlankSlateScenario to guarantee 100% clean baseline
      baseScenario = generateBlankSlateScenario({
        proposalName: proposalName.trim() || (isCleanSlate 
          ? `${clientName} Oracle Implementation (Clean Slate)` 
          : `${clientName} Oracle Cloud Implementation`),
        thorId: thorId.trim() || 'THOR-PROPOSAL-001',
        clientName: clientName.trim() || 'Acme Corporation',
        industry: industry,
        targetStartDate: targetStartDate,
        clientTargetGoLiveDate: targetGoLiveDate,
        description: description.trim() || (isCleanSlate
          ? `Clean slate Oracle Cloud implementation proposal for ${clientName} (${industry}). Pristine zero-module baseline ready for custom scoping or integrations.`
          : `Oracle Fusion implementation proposal for ${clientName} (${industry}).`),
        rolloutApproach: rolloutApproach,
        projectWeeks: isCleanSlate ? 0 : 36
      });

      baseScenario.id = newId;

      if (!isCleanSlate) {
        baseScenario.selectedModules = selectedModules;
        baseScenario.rolloutWaves = rolloutApproach === 'big_bang' ? 1 : 2;
        baseScenario.waveDescriptions = rolloutApproach === 'big_bang'
          ? ['Wave 1: Enterprise Initial Cutover']
          : ['Wave 1: Corporate HQ & Core Operations (Pilot)', 'Wave 2: Regional Operating Units & Extended Geographies'];
        baseScenario.scaleDrivers = {
          ...baseScenario.scaleDrivers,
          scm_plants: selectedPillars.includes('SCM') ? 4 : 0,
          scm_wh: selectedPillars.includes('SCM') ? 6 : 0,
          scm_inv: selectedPillars.includes('SCM') ? 10 : 0,
          fin_ent: selectedPillars.includes('ERP') ? 5 : 0,
          fin_led: selectedPillars.includes('ERP') ? 3 : 0,
          fin_bu: selectedPillars.includes('ERP') ? 4 : 0,
          fin_cur: selectedPillars.includes('ERP') ? 4 : 0,
          fin_tax: selectedPillars.includes('ERP') ? 6 : 0,
          fin_coa_segments: selectedPillars.includes('ERP') ? 6 : 0,
          hcm_hc: selectedPillars.includes('HCM') ? 3500 : 0,
          hcm_pay_countries: selectedPillars.includes('HCM') ? 2 : 0
        };
      }
    }

    onCreateProposal(baseScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Plus size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">Create New Implementation Proposal</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-400 text-slate-950 uppercase rounded-xs">
                  PB-Estimo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Configure a new deal proposal, estimate hours, timeline, and commercial rates.
              </p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Creation Strategy Mode Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Select Proposal Baseline
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option 1: Clean Slate */}
              <button
                type="button"
                onClick={() => setCreationMode('scratch')}
                className={`p-3.5 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
                  creationMode === 'scratch'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1.5 rounded-sm ${creationMode === 'scratch' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                      <Sparkles size={16} />
                    </span>
                    {creationMode === 'scratch' && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900">Blank Slate (Clean Start)</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Pristine zero-module baseline. Ideal for custom scoping, integrations-only, or ground-up architecture.
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                    Clean Slate • 0 Modules
                  </span>
                </div>
              </button>

              {/* Option 2: AI Ingestion & Scoping Agent (Unified RFP + Intel + Blueprint) */}
              <button
                type="button"
                onClick={() => {
                  setCreationMode('ai_agent');
                  setIsAiAgentModalOpen(true);
                }}
                className={`p-3.5 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
                  creationMode === 'ai_agent'
                    ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 ring-2 ring-indigo-600 shadow-xs'
                    : 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-sm bg-indigo-600 text-white shadow-2xs">
                      <Zap size={16} className="text-amber-300 animate-pulse" />
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-xs uppercase">
                      AI Agent
                    </span>
                  </div>
                  <div className="font-bold text-xs text-indigo-950">AI Scoping Agent</div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Auto-ingest RFP document, copy-paste RFP memo, or prompt Smart Blueprint.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono font-bold text-indigo-700 uppercase flex items-center gap-1">
                  <span>✨ 1-Click Ingestion</span>
                  <ArrowRight size={10} />
                </div>
              </button>

              {/* Option 3: Industry Blueprint */}
              <button
                type="button"
                onClick={() => setCreationMode('template')}
                className={`p-3.5 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
                  creationMode === 'template'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-sm bg-blue-100 text-blue-700">
                      <Building2 size={16} />
                    </span>
                    {creationMode === 'template' && <CheckCircle2 size={16} className="text-indigo-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900">Industry Blueprint</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Use pre-calibrated enterprise templates (Mfg, Retail, Financials, SCM).
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono font-bold text-blue-700 uppercase">
                  {PRESET_SCENARIOS.length} Templates
                </div>
              </button>

              {/* Option 4: Duplicate Active */}
              <button
                type="button"
                onClick={() => {
                  setCreationMode('clone');
                  setProposalName(`${activeScenario.name} (Copy)`);
                }}
                className={`p-3.5 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between ${
                  creationMode === 'clone'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-sm bg-amber-100 text-amber-700">
                      <Copy size={16} />
                    </span>
                    {creationMode === 'clone' && <CheckCircle2 size={16} className="text-indigo-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900">Clone Active</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Duplicate active scenario with current modules & modifier values.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono font-bold text-amber-700 uppercase truncate">
                  Active: {activeScenario.name}
                </div>
              </button>
            </div>
          </div>

          {/* Template Selection Dropdown if in Template Mode */}
          {creationMode === 'template' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Choose Industry Blueprint Template:
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  const selected = PRESET_SCENARIOS.find(p => p.id === e.target.value);
                  if (selected) {
                    setProposalName(`${clientName} - ${selected.name}`);
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                {PRESET_SCENARIOS.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.selectedModules.length} Modules • {preset.projectWeeks} Wks)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Core Proposal Details Form */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Thor ID <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">varchar (Mandatory)</span>
                </label>
                <input
                  type="text"
                  value={thorId}
                  onChange={(e) => {
                    setThorId(e.target.value);
                    if (e.target.value.trim()) setThorIdError(null);
                  }}
                  placeholder="e.g. THOR-89241"
                  required
                  className={`w-full px-3 py-2 bg-white border rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden ${
                    thorIdError
                      ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {thorIdError && (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1">
                    <ShieldAlert size={12} className="shrink-0" />
                    {thorIdError}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposal / Project Title *
                </label>
                <input
                  type="text"
                  value={proposalName}
                  onChange={(e) => setProposalName(e.target.value)}
                  placeholder="e.g. Apex Global ERP & SCM Modernization"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client / Enterprise Account *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (creationMode === 'scratch') {
                      setProposalName(
                        selectedPillars.length === 0
                          ? `${e.target.value} Oracle Implementation (Clean Slate)`
                          : `${e.target.value} Oracle Cloud Implementation`
                      );
                    }
                  }}
                  placeholder="e.g. Apex Global Industries"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Industry Vertical
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  {INDUSTRY_OPTIONS.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Project Kickoff
                </label>
                <input
                  type="date"
                  value={targetStartDate}
                  onChange={(e) => setTargetStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Go-Live Date
                </label>
                <input
                  type="date"
                  value={targetGoLiveDate}
                  onChange={(e) => setTargetGoLiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* In Scratch Mode: Pillar Selector & Clean Slate Footprint */}
            {creationMode === 'scratch' && (
              <div className="bg-slate-50/80 p-4 rounded-sm border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-600" />
                      <span>Scope Footprint Configuration</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase ${
                        selectedPillars.length === 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        {selectedPillars.length === 0
                          ? '✨ Blank Slate Active (0 Modules)'
                          : `${selectedModulesCount} Modules In Scope`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedPillars.length === 0
                        ? 'Clean slate active with 0 modules & zero baseline. Perfect for integrations-only proposals or custom scoping in Discovery.'
                        : 'Pre-seeding selected solution pillars. You can adjust module-by-module in Discovery.'}
                    </p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedPillars([])}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition cursor-pointer border flex items-center gap-1 ${
                        selectedPillars.length === 0
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Reset to a 100% clean slate with 0 modules"
                    >
                      {selectedPillars.length === 0 && <CheckCircle2 size={11} />}
                      <span>Blank Slate (0 Mods)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPillars(['ERP'])}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition cursor-pointer border ${
                        selectedPillars.length === 1 && selectedPillars[0] === 'ERP'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Pre-populate Core Financials & Procurement"
                    >
                      Core ERP
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPillars(['ERP', 'SCM'])}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition cursor-pointer border ${
                        selectedPillars.length === 2 && selectedPillars.includes('ERP') && selectedPillars.includes('SCM')
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Pre-populate ERP + SCM Suite"
                    >
                      ERP + SCM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPillars(PILLAR_CONFIGS.map(p => p.id))}
                      className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xs transition cursor-pointer"
                      title="Select all pillars"
                    >
                      All Pillars
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PILLAR_CONFIGS.map(pillar => {
                    const isSelected = selectedPillars.includes(pillar.id);
                    return (
                      <div
                        key={pillar.id}
                        onClick={() => togglePillar(pillar.id)}
                        className={`p-3 rounded-sm border transition cursor-pointer flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'border-indigo-500 bg-white ring-1 ring-indigo-400 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white/70'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{pillar.label}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({pillar.defaultModules.length} mods)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{pillar.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded-xs text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Executive Notes & Scope Objectives
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="High-level background or key commercial parameters..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAiAgentModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-sm text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Zap size={14} className="text-indigo-600" />
              <span>Launch Ingestion Agent</span>
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus size={15} />
              <span>
                {creationMode === 'scratch'
                  ? selectedPillars.length === 0
                    ? 'Create Blank Slate (Clean Start • 0 Modules)'
                    : `Create Proposal (${selectedModulesCount} Modules & Open Scope)`
                  : creationMode === 'clone'
                  ? 'Clone Proposal & Open Scope'
                  : 'Create Proposal & Open Scope'}
              </span>
              <ArrowRight size={14} className="text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Unified AI Scoping Agent Modal */}
      {isAiAgentModalOpen && (
        <AIScopingAgentModal
          isOpen={isAiAgentModalOpen}
          onClose={() => setIsAiAgentModalOpen(false)}
          scenario={activeScenario}
          onUpdateScenario={(updater) => {
            const updated = updater(activeScenario);
            const newScenario = {
              ...updated,
              id: 'custom_deal_' + Date.now(),
              thorId: thorId.trim() || updated.thorId || `THOR-${Math.floor(10000 + Math.random() * 90000)}`,
              name: proposalName.trim() || updated.name,
              description: description.trim() || updated.description
            };
            onCreateProposal(newScenario);
            setIsAiAgentModalOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
