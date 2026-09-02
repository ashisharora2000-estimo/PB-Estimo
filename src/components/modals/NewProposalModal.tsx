import React, { useState } from 'react';
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

  // Form Fields
  const [thorId, setThorId] = useState(activeScenario.thorId || '');
  const [thorIdError, setThorIdError] = useState<string | null>(null);
  const [proposalName, setProposalName] = useState('New Oracle Transformation Proposal');
  const [clientName, setClientName] = useState('Acme Corporation');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [targetStartDate, setTargetStartDate] = useState('2026-09-01');
  const [targetGoLiveDate, setTargetGoLiveDate] = useState('2027-06-30');
  const [rolloutApproach, setRolloutApproach] = useState<RolloutApproach>('phased_geo');
  const [selectedPillars, setSelectedPillars] = useState<string[]>(['ERP', 'SCM']);
  const [description, setDescription] = useState('Multi-entity Oracle Fusion Cloud digital transformation roadmap and implementation sizing.');

  if (!isOpen) return null;

  const togglePillar = (pillarId: string) => {
    if (selectedPillars.includes(pillarId)) {
      if (selectedPillars.length > 1) {
        setSelectedPillars(selectedPillars.filter(p => p !== pillarId));
      }
    } else {
      setSelectedPillars([...selectedPillars, pillarId]);
    }
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
      // From Scratch / Clean-Slate
      const selectedModules: string[] = [];
      PILLAR_CONFIGS.forEach(p => {
        if (selectedPillars.includes(p.id)) {
          selectedModules.push(...p.defaultModules);
        }
      });

      baseScenario = {
        id: newId,
        thorId: thorId.trim(),
        name: proposalName.trim() || `${clientName} Oracle Cloud Implementation`,
        description: description.trim() || `Oracle Fusion implementation proposal for ${clientName} (${industry}).`,
        selectedModules: selectedModules.length > 0 ? selectedModules : ['erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_proc'],
        scaleDrivers: {
          scm_plants: selectedPillars.includes('SCM') ? 4 : 0,
          scm_wh: selectedPillars.includes('SCM') ? 6 : 1,
          scm_inv: selectedPillars.includes('SCM') ? 10 : 2,
          fin_ent: 5,
          fin_led: 3,
          fin_cur: 4,
          fin_tax: 6,
          fin_coa_segments: 7,
          hcm_hc: selectedPillars.includes('HCM') ? 3500 : 0,
          hcm_pay_countries: selectedPillars.includes('HCM') ? 2 : 0,
          hcm_union_groups: 0,
          tech_oic: 18,
          tech_paas: 2,
          tech_data_objects: 14,
          tech_conversion_cycles: 3,
          tech_historical_years: 1,
          tech_reports_bip: 30,
          tech_reports_otbi: 25,
          tech_fast_formulas: 6,
          tech_workflows: 10
        },
        complexityAnswers: {
          functional: [1, 2],
          technical: [1, 2],
          data: [1, 2],
          ocm: [1, 1],
          governance: [1, 1]
        },
        confidence: 0.8,
        clientModifiers: {
          decisionVelocity: 1.0,
          dataDebt: 1.0,
          cloudMindset: 1.0,
          integrationVolatility: 1.0,
          smeAvailability: 1.0,
          regulatoryCompliance: 1.0,
          changeResistance: 1.0
        },
        rolloutApproach: rolloutApproach,
        rolloutWaves: rolloutApproach === 'big_bang' ? 1 : 2,
        waveDescriptions: rolloutApproach === 'big_bang' 
          ? ['Wave 1: Enterprise Single Go-Live']
          : ['Wave 1: Corporate HQ & Core Operations (Pilot)', 'Wave 2: Regional Operating Units & Extended Geographies'],
        rolloutOverlapWeeks: 4,
        blackoutPeriods: [],
        deliveryMix: {
          onshore: 35,
          nearshore: 25,
          offshore: 40
        },
        podCohort: 'B',
        projectWeeks: 48,
        targetStartDate: targetStartDate,
        clientTargetGoLiveDate: targetGoLiveDate,
        schedulingMode: 'forward',
        scheduleModifiers: {
          methodology: 'hybrid_oum',
          fastTrackingOverlapPct: 15,
          clientDecisionSLA: 'standard_5d',
          envReadinessLeadWeeks: 2,
          dataReadinessScore: 2,
          sprintCadenceWeeks: 3
        }
      };
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
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-sm bg-indigo-100 text-indigo-700">
                      <Sparkles size={16} />
                    </span>
                    {creationMode === 'scratch' && <CheckCircle2 size={16} className="text-indigo-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900">Blank Proposal</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Start from a clean slate and select your target pillars & scope in Discovery.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono font-bold text-indigo-700 uppercase">
                  Clean Baseline
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
                      setProposalName(`${e.target.value} Oracle Cloud Implementation`);
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

            {/* In Scratch Mode: Pillar Selector */}
            {creationMode === 'scratch' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Initial Solution Pillars to Include
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PILLAR_CONFIGS.map(pillar => {
                    const isSelected = selectedPillars.includes(pillar.id);
                    return (
                      <div
                        key={pillar.id}
                        onClick={() => togglePillar(pillar.id)}
                        className={`p-3 rounded-sm border transition cursor-pointer flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40'
                            : 'border-slate-200 hover:border-slate-300 bg-white opacity-60'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{pillar.label}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{pillar.desc}</div>
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
              <span>Create Proposal & Open Scope</span>
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
