import React, { useState } from 'react';
import {
  Users,
  Building2,
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles,
  Upload,
  RotateCcw,
  Save,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Filter,
  FileText,
  Copy,
  Download,
  Info,
  Sliders,
  GitMerge,
  ShieldAlert,
  Zap,
  HelpCircle,
  TrendingDown,
  Check
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  MultiVendorConfig,
  DeliveryOwnerParty,
  ModuleScopeDemarcation,
  WorkstreamScopeDemarcation,
  PhaseScopeDemarcation,
  MultiVendorSnapshot,
  OracleModule
} from '../../types';
import {
  DEFAULT_MULTI_VENDOR_PARTIES,
  DEFAULT_WORKSTREAM_DEMARCATIONS,
  DEFAULT_PHASE_DEMARCATIONS,
  MULTI_VENDOR_PRESETS,
  generateDefaultModuleDemarcation,
  generateDefaultPhaseDemarcation
} from '../../data/multiVendorPresets';
import {
  SAMPLE_MULTI_VENDOR_DOCUMENTS,
  parseMultiVendorIntelWithAI,
  extractHeuristicMultiVendorConfig,
  MultiVendorAiExtractionResult
} from '../../utils/multiVendorAiExtractor';
import { ORACLE_MODULE_CATALOG, IMPLEMENTATION_PHASES } from '../../data/oraclePhases';
import { AttributionBadge } from '../common/AttributionBadge';

interface MultiVendorScopeViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenTraceMath?: () => void;
}

export const MultiVendorScopeView: React.FC<MultiVendorScopeViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onOpenTraceMath
}) => {
  const mvMetrics = data.multiVendor;
  const mvConfig = scenario.multiVendor || MULTI_VENDOR_PRESETS[0].setup(scenario.selectedModules) as MultiVendorConfig;

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'phases' | 'workstreams' | 'handshake' | 'ai_ingest' | 'snapshots' | 'sow_contract'>('matrix');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('ALL');
  const [copiedContract, setCopiedContract] = useState(false);
  
  // AI Ingest Modal State
  const [aiDocInput, setAiDocInput] = useState('');
  const [aiIsAnalyzing, setAiIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<MultiVendorAiExtractionResult | null>(null);

  // Snapshot Creation State
  const [snapshotNameInput, setSnapshotNameInput] = useState('');
  const [snapshotSuccessMsg, setSnapshotSuccessMsg] = useState('');

  // 1. Toggle Multi-Vendor Mode
  const handleToggleEnabled = (enabled: boolean) => {
    onUpdateScenario(prev => {
      const current = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      return {
        ...prev,
        multiVendor: {
          ...current,
          isEnabled: enabled
        }
      };
    });
  };

  // 2. Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = MULTI_VENDOR_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    onUpdateScenario(prev => {
      const currentSnapshots = prev.multiVendor?.snapshots || [];
      const newConfig = preset.setup(prev.selectedModules) as MultiVendorConfig;
      
      // Auto-save a snapshot of current state if enabled
      const newSnapshot: MultiVendorSnapshot = {
        id: `snap_${Date.now()}`,
        versionNumber: (currentSnapshots.length || 0) + 1,
        name: `Applied Preset: ${preset.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        source: 'preset',
        summary: preset.description,
        config: JSON.parse(JSON.stringify(newConfig))
      };

      return {
        ...prev,
        multiVendor: {
          ...newConfig,
          snapshots: [newSnapshot, ...currentSnapshots],
          activeSnapshotId: newSnapshot.id
        }
      };
    });
  };

  // 3. Update Single Module Demarcation
  const handleUpdateModuleOwner = (moduleId: OracleModule, owner: DeliveryOwnerParty) => {
    onUpdateScenario(prev => {
      const currentMv = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      const modMap = { ...(currentMv.moduleDemarcation || {}) };
      const prevMod = modMap[moduleId] || {
        moduleId,
        primaryOwner: 'our_si',
        ourSiSharePct: 100,
        otherSiSharePct: 0,
        clientSharePct: 0,
        validationSiPct: 0,
        handshakeComplexity: 'Medium'
      };

      let ourPct = 100;
      let otherPct = 0;
      let clientPct = 0;
      let valPct = 0;

      if (owner === 'other_si') {
        ourPct = 10; // 10% handshake retained
        otherPct = 90;
      } else if (owner === 'client') {
        ourPct = 10;
        clientPct = 90;
      } else if (owner === 'validation_si') {
        ourPct = 85;
        valPct = 15;
      } else if (owner === 'joint') {
        ourPct = 50;
        otherPct = 50;
      }

      modMap[moduleId] = {
        ...prevMod,
        primaryOwner: owner,
        ourSiSharePct: ourPct,
        otherSiSharePct: otherPct,
        clientSharePct: clientPct,
        validationSiPct: valPct
      };

      return {
        ...prev,
        multiVendor: {
          ...currentMv,
          isEnabled: true,
          moduleDemarcation: modMap
        }
      };
    });
  };

  // 4. Batch Update Modules
  const handleBatchUpdatePillar = (pillar: string, owner: DeliveryOwnerParty) => {
    onUpdateScenario(prev => {
      const currentMv = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      const modMap = { ...(currentMv.moduleDemarcation || {}) };

      prev.selectedModules.forEach(modId => {
        const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
        const mPillar = modDef?.pillar || 'ERP';

        if (pillar === 'ALL' || mPillar === pillar) {
          let ourPct = 100;
          let otherPct = 0;
          let clientPct = 0;
          let valPct = 0;

          if (owner === 'other_si') {
            ourPct = 10;
            otherPct = 90;
          } else if (owner === 'client') {
            ourPct = 10;
            clientPct = 90;
          } else if (owner === 'validation_si') {
            ourPct = 85;
            valPct = 15;
          } else if (owner === 'joint') {
            ourPct = 50;
            otherPct = 50;
          }

          modMap[modId] = {
            ...(modMap[modId] || { moduleId: modId, handshakeComplexity: 'Medium' }),
            primaryOwner: owner,
            ourSiSharePct: ourPct,
            otherSiSharePct: otherPct,
            clientSharePct: clientPct,
            validationSiPct: valPct
          };
        }
      });

      return {
        ...prev,
        multiVendor: {
          ...currentMv,
          isEnabled: true,
          moduleDemarcation: modMap
        }
      };
    });
  };

  // 5. Update Workstream Share
  const handleUpdateWorkstreamShare = (
    wsId: string,
    field: 'ourSiSharePct' | 'otherSiSharePct' | 'clientSharePct' | 'validationSiPct',
    val: number
  ) => {
    onUpdateScenario(prev => {
      const currentMv = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      const wsMap = { ...(currentMv.workstreamDemarcation || DEFAULT_WORKSTREAM_DEMARCATIONS) };
      const currentWs = wsMap[wsId] || DEFAULT_WORKSTREAM_DEMARCATIONS[wsId];

      const updatedWs = {
        ...currentWs,
        [field]: Math.max(0, Math.min(100, val))
      };

      // Determine primary owner based on largest share
      if (updatedWs.ourSiSharePct >= 60) updatedWs.primaryOwner = 'our_si';
      else if (updatedWs.otherSiSharePct >= 50) updatedWs.primaryOwner = 'other_si';
      else if (updatedWs.clientSharePct >= 50) updatedWs.primaryOwner = 'client';
      else if (updatedWs.validationSiPct >= 40) updatedWs.primaryOwner = 'validation_si';
      else updatedWs.primaryOwner = 'joint';

      wsMap[wsId] = updatedWs;

      return {
        ...prev,
        multiVendor: {
          ...currentMv,
          isEnabled: true,
          workstreamDemarcation: wsMap
        }
      };
    });
  };

  // 5b. Update Phase Demarcation Share & Owner
  const handleUpdatePhaseShare = (
    phaseId: string,
    field: 'ourSiSharePct' | 'otherSiSharePct' | 'clientSharePct' | 'validationSiPct',
    val: number
  ) => {
    onUpdateScenario(prev => {
      const currentMv = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      const phMap = { ...(currentMv.phaseDemarcation || DEFAULT_PHASE_DEMARCATIONS) };
      const currentPh = phMap[phaseId] || DEFAULT_PHASE_DEMARCATIONS[phaseId];

      const updatedPh = {
        ...currentPh,
        [field]: Math.max(0, Math.min(100, val))
      };

      // Determine primary owner based on largest share
      if (updatedPh.ourSiSharePct >= 60) updatedPh.primaryOwner = 'our_si';
      else if (updatedPh.otherSiSharePct >= 50) updatedPh.primaryOwner = 'other_si';
      else if (updatedPh.clientSharePct >= 50) updatedPh.primaryOwner = 'client';
      else if (updatedPh.validationSiPct >= 40) updatedPh.primaryOwner = 'validation_si';
      else updatedPh.primaryOwner = 'joint';

      phMap[phaseId] = updatedPh;

      return {
        ...prev,
        multiVendor: {
          ...currentMv,
          isEnabled: true,
          phaseDemarcation: phMap
        }
      };
    });
  };

  const handleUpdatePhaseOwner = (phaseId: string, owner: DeliveryOwnerParty) => {
    onUpdateScenario(prev => {
      const currentMv = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      const phMap = { ...(currentMv.phaseDemarcation || DEFAULT_PHASE_DEMARCATIONS) };
      const currentPh = phMap[phaseId] || DEFAULT_PHASE_DEMARCATIONS[phaseId];

      let ourPct = 100;
      let otherPct = 0;
      let clientPct = 0;
      let valPct = 0;

      if (owner === 'other_si') {
        ourPct = 15; // 15% handshake retained
        otherPct = 85;
      } else if (owner === 'client') {
        ourPct = 20;
        clientPct = 80;
      } else if (owner === 'validation_si') {
        ourPct = 70;
        valPct = 30;
      } else if (owner === 'joint') {
        ourPct = 50;
        otherPct = 50;
      }

      phMap[phaseId] = {
        ...currentPh,
        primaryOwner: owner,
        ourSiSharePct: ourPct,
        otherSiSharePct: otherPct,
        clientSharePct: clientPct,
        validationSiPct: valPct
      };

      return {
        ...prev,
        multiVendor: {
          ...currentMv,
          isEnabled: true,
          phaseDemarcation: phMap
        }
      };
    });
  };

  // 6. Save Snapshot
  const handleSaveSnapshot = () => {
    const name = snapshotNameInput.trim() || `Demarcation Snapshot v${(mvConfig.snapshots?.length || 0) + 1}`;
    const newSnapshot: MultiVendorSnapshot = {
      id: `snap_${Date.now()}`,
      versionNumber: (mvConfig.snapshots?.length || 0) + 1,
      name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      source: 'manual',
      summary: `Manual snapshot: Our SI ${mvMetrics?.ourSiSharePercentage || 100}% | Other BI ${mvMetrics?.otherSiSharePercentage || 0}% | Client ${mvMetrics?.clientSharePercentage || 0}%`,
      config: JSON.parse(JSON.stringify(mvConfig))
    };

    onUpdateScenario(prev => {
      const current = prev.multiVendor || (MULTI_VENDOR_PRESETS[0].setup(prev.selectedModules) as MultiVendorConfig);
      return {
        ...prev,
        multiVendor: {
          ...current,
          snapshots: [newSnapshot, ...(current.snapshots || [])],
          activeSnapshotId: newSnapshot.id
        }
      };
    });

    setSnapshotNameInput('');
    setSnapshotSuccessMsg(`Saved snapshot: "${name}"`);
    setTimeout(() => setSnapshotSuccessMsg(''), 3000);
  };

  // 7. Revert to Snapshot
  const handleRevertToSnapshot = (snap: MultiVendorSnapshot) => {
    onUpdateScenario(prev => {
      return {
        ...prev,
        multiVendor: {
          ...snap.config,
          activeSnapshotId: snap.id,
          snapshots: prev.multiVendor?.snapshots || []
        }
      };
    });
    setSnapshotSuccessMsg(`Reverted back to snapshot: "${snap.name}"`);
    setTimeout(() => setSnapshotSuccessMsg(''), 3000);
  };

  // 8. Reset to 100% Single-Vendor
  const handleResetToSingleVendor = () => {
    handleApplyPreset('single_turnkey');
  };

  // 9. AI Ingestion Analysis
  const handleRunAiAnalysis = async () => {
    if (!aiDocInput.trim()) return;
    setAiIsAnalyzing(true);

    try {
      const result = await parseMultiVendorIntelWithAI(aiDocInput, scenario.selectedModules);
      setAiResult(result);
    } catch (e) {
      console.error('AI Ingestion error:', e);
      const fallback = extractHeuristicMultiVendorConfig(aiDocInput, scenario.selectedModules);
      setAiResult(fallback);
    } finally {
      setAiIsAnalyzing(false);
    }
  };

  // 10. Apply AI Extraction Result
  const handleApplyAiResult = () => {
    if (!aiResult) return;

    onUpdateScenario(prev => {
      const currentSnapshots = prev.multiVendor?.snapshots || [];
      const newConfig = aiResult.suggestedConfig;

      const newSnapshot: MultiVendorSnapshot = {
        id: `snap_${Date.now()}`,
        versionNumber: (currentSnapshots.length || 0) + 1,
        name: `AI Extracted: ${aiResult.documentTitle}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        source: aiResult.sourceType === 'mom' ? 'ai_mom_extraction' : 'ai_rfp_extraction',
        summary: aiResult.executiveSummary,
        config: JSON.parse(JSON.stringify(newConfig))
      };

      return {
        ...prev,
        multiVendor: {
          ...newConfig,
          snapshots: [newSnapshot, ...currentSnapshots],
          activeSnapshotId: newSnapshot.id
        }
      };
    });

    setActiveSubTab('matrix');
    setSnapshotSuccessMsg(`Successfully applied AI Demarcation from ${aiResult.documentTitle}`);
    setTimeout(() => setSnapshotSuccessMsg(''), 3500);
  };

  // 11. Copy RFP Responsibility Demarcation
  const handleCopyContract = () => {
    const text = generateSowContractText();
    navigator.clipboard.writeText(text);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  const generateSowContractText = () => {
    return `=======================================================================
RFP SCHEDULE A: MULTI-PARTY SCOPE DEMARCATION
Project: ${scenario.name}
Model Type: ${mvConfig.modelType.toUpperCase()}
Generated: ${new Date().toLocaleDateString()}
=======================================================================

1. EXECUTIVE EFFORT & COMMERCIAL ENVELOPE
-----------------------------------------------------------------------
- Total Program Effort (All Parties): ${(mvMetrics?.totalEcosystemHours || 0).toLocaleString()} hrs
- Our SI Billable Defensible Target:  ${(mvMetrics?.ourSiTotalDefensibleHours || 0).toLocaleString()} hrs (${mvMetrics?.ourSiSharePercentage || 100}%)
  * Direct Module & Build Scope:     ${(mvMetrics?.ourSiBillableHours || 0).toLocaleString()} hrs
  * Multi-Vendor Coordination Buffer:${(mvMetrics?.ourSiHandshakeOverheadHours || 0).toLocaleString()} hrs
- Other SI / BI Partner Scope:       ${(mvMetrics?.otherSiHours || 0).toLocaleString()} hrs (${mvMetrics?.otherSiSharePercentage || 0}%)
- Client Internal Team Scope:        ${(mvMetrics?.clientInternalHours || 0).toLocaleString()} hrs (${mvMetrics?.clientSharePercentage || 0}%)
- Independent Validation SI (IV&V):  ${(mvMetrics?.validationSiHours || 0).toLocaleString()} hrs (${mvMetrics?.validationSiSharePercentage || 0}%)

2. MODULE OWNERSHIP DEMARCATION
-----------------------------------------------------------------------
${scenario.selectedModules.map(modId => {
  const mDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
  const dem = mvConfig.moduleDemarcation?.[modId];
  return `- ${mDef?.name || modId} (${mDef?.pillar || 'ERP'}): Primary Lead [${dem?.primaryOwner?.toUpperCase() || 'OUR_SI'}] -> Our SI: ${dem?.ourSiSharePct || 100}%, Other SI: ${dem?.otherSiSharePct || 0}%, Client: ${dem?.clientSharePct || 0}%, IV&V: ${dem?.validationSiPct || 0}%`;
}).join('\n')}

3. CROSS-VENDOR HANDSHAKE DEPENDENCIES & COORDINATION BUFFER
-----------------------------------------------------------------------
${(mvMetrics?.handshakeOverheadBreakdown || []).map(h => `- ${h.category}: +${h.hours} hrs (${h.rationale})`).join('\n')}

4. CONTRACTUAL CLIENT PREREQUISITES & SLA MANDATES
-----------------------------------------------------------------------
- Client shall provide cleansed legacy source data in approved FBDI format minimum 5 business days prior to each Mock Conversion cycle.
- Cross-vendor defect triage meetings shall occur weekly; defect turnaround SLA is 48 hours for blocking items.
- Independent Validation SI shall provide stage-gate sign-off within 5 business days of test cycle completion.
=======================================================================`;
  };

  // Filter modules
  const filteredModules = scenario.selectedModules.filter(modId => {
    if (selectedPillarFilter === 'ALL') return true;
    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
    return modDef?.pillar === selectedPillarFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Ecosystem Mode Controller */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm bg-blue-100 text-blue-900 border border-blue-300">
              Multi-Vendor Ecosystem
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Prime SI vs. Other BI vs. Client Internal vs. Validation SI (IV&V)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Multi-Vendor & SI Scope Demarcation Studio</span>
            {mvConfig.isEnabled ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={12} /> Active Demarcation
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Single-Vendor (100% Our SI)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Model real-world delivery splits where multiple system integrators (e.g. specialized HCM/Payroll BI), client internal SMEs (data cleansing & OCM), and 3rd-party validation auditors (IV&V) co-deliver the Oracle Cloud transformation.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleToggleEnabled(!mvConfig.isEnabled)}
            className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              mvConfig.isEnabled
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Zap size={14} />
            <span>{mvConfig.isEnabled ? 'Switch to Single SI' : 'Enable Multi-Vendor Split'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai_ingest')}
            className="px-3.5 py-2 rounded-sm bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={14} className="text-purple-600" />
            <span>AI Ingest (RFP / MoM / Email)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('snapshots')}
            className="px-3 py-2 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            title="View Snapshots & Revert History"
          >
            <RotateCcw size={14} />
            <span>History ({mvConfig.snapshots?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {snapshotSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{snapshotSuccessMsg}</span>
        </div>
      )}

      {/* Quick Preset Selector Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-sm p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Quick Ecosystem Blueprints:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MULTI_VENDOR_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer border ${
                mvConfig.modelType === preset.modelType && (mvConfig.isEnabled || preset.id === 'single_turnkey')
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ecosystem Allocation Ring & KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Total Program Ecosystem Hours */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Program Scope</span>
            <Building2 size={15} className="text-slate-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {(mvMetrics?.totalEcosystemHours || 0).toLocaleString()}
            <span className="text-xs font-sans font-normal text-slate-400 ml-1">hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>100% Total Project Envelope</span>
          </div>
        </div>

        {/* 2. Our SI Defensible Scope (Billable Target) */}
        <div className="bg-white border-2 border-slate-900 rounded-sm p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Our SI Billable Target</span>
            <Briefcase size={15} className="text-slate-900" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {(mvMetrics?.ourSiTotalDefensibleHours || 0).toLocaleString()}
            <span className="text-xs font-sans font-bold text-emerald-700 ml-1.5">
              ({mvMetrics?.ourSiSharePercentage || 100}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Includes +{mvMetrics?.ourSiHandshakeOverheadHours || 0}h Coordination Tax</span>
          </div>
        </div>

        {/* 3. Other SI / BI Scope */}
        <div className="bg-white border border-blue-200 rounded-sm p-4 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">Other SI / BI Vendor</span>
            <Users size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-blue-900">
            {(mvMetrics?.otherSiHours || 0).toLocaleString()}
            <span className="text-xs font-sans font-bold text-blue-700 ml-1.5">
              ({mvMetrics?.otherSiSharePercentage || 0}%)
            </span>
          </div>
          <div className="text-[11px] text-blue-700 mt-2 pt-2 border-t border-blue-100 flex items-center justify-between">
            <span>Specialized Partner / HCM Scope</span>
          </div>
        </div>

        {/* 4. Client Internal Team Scope */}
        <div className="bg-white border border-emerald-200 rounded-sm p-4 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">Client Internal Scope</span>
            <ShieldCheck size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-900">
            {(mvMetrics?.clientInternalHours || 0).toLocaleString()}
            <span className="text-xs font-sans font-bold text-emerald-700 ml-1.5">
              ({mvMetrics?.clientSharePercentage || 0}%)
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between">
            <span>Data Cleansing & Business Testing</span>
          </div>
        </div>

        {/* 5. Independent Validation SI (IV&V) */}
        <div className="bg-white border border-amber-200 rounded-sm p-4 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Validation SI / IV&V</span>
            <ShieldAlert size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-900">
            {(mvMetrics?.validationSiHours || 0).toLocaleString()}
            <span className="text-xs font-sans font-bold text-amber-700 ml-1.5">
              ({mvMetrics?.validationSiSharePercentage || 0}%)
            </span>
          </div>
          <div className="text-[11px] text-amber-700 mt-2 pt-2 border-t border-amber-100 flex items-center justify-between">
            <span>Audit & Independent Assurance</span>
          </div>
        </div>
      </div>

      {/* Visual Proportional Effort Distribution Bar */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 uppercase tracking-wider">Multi-Party Scope Footprint:</span>
          <span className="font-mono text-slate-900">
            Our SI: {mvMetrics?.ourSiSharePercentage || 100}% | Other BI: {mvMetrics?.otherSiSharePercentage || 0}% | Client: {mvMetrics?.clientSharePercentage || 0}% | IV&V: {mvMetrics?.validationSiSharePercentage || 0}%
          </span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-sm overflow-hidden flex">
          <div
            style={{ width: `${mvMetrics?.ourSiSharePercentage || 100}%` }}
            className="h-full bg-slate-900 transition-all duration-300"
            title={`Our SI: ${(mvMetrics?.ourSiBillableHours || 0).toLocaleString()} hrs (${mvMetrics?.ourSiSharePercentage || 100}%)`}
          />
          <div
            style={{ width: `${mvMetrics?.otherSiSharePercentage || 0}%` }}
            className="h-full bg-blue-600 transition-all duration-300"
            title={`Other SI / BI: ${(mvMetrics?.otherSiHours || 0).toLocaleString()} hrs (${mvMetrics?.otherSiSharePercentage || 0}%)`}
          />
          <div
            style={{ width: `${mvMetrics?.clientSharePercentage || 0}%` }}
            className="h-full bg-emerald-500 transition-all duration-300"
            title={`Client Internal: ${(mvMetrics?.clientInternalHours || 0).toLocaleString()} hrs (${mvMetrics?.clientSharePercentage || 0}%)`}
          />
          <div
            style={{ width: `${mvMetrics?.validationSiSharePercentage || 0}%` }}
            className="h-full bg-amber-500 transition-all duration-300"
            title={`Validation SI / IV&V: ${(mvMetrics?.validationSiHours || 0).toLocaleString()} hrs (${mvMetrics?.validationSiSharePercentage || 0}%)`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-slate-900 inline-block" /> Our SI (Prime)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" /> Other SI / BI Partner</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Client Internal Team</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Validation SI / IV&V</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Module Demarcation
        </button>
        <button
          onClick={() => setActiveSubTab('phases')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'phases'
              ? 'border-blue-600 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-blue-900'
          }`}
        >
          <span>2. Phase & Lifecycle Split</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-xs">Design vs Build</span>
        </button>
        <button
          onClick={() => setActiveSubTab('workstreams')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeSubTab === 'workstreams'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          3. Workstream & RACI
        </button>
        <button
          onClick={() => setActiveSubTab('handshake')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeSubTab === 'handshake'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          4. Coordination Tax ({mvMetrics?.ourSiHandshakeOverheadHours || 0} hrs)
        </button>
        <button
          onClick={() => setActiveSubTab('ai_ingest')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeSubTab === 'ai_ingest'
              ? 'border-purple-600 text-purple-900 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-purple-900'
          }`}
        >
          5. AI Ingest (RFP / MoM)
        </button>
        <button
          onClick={() => setActiveSubTab('snapshots')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeSubTab === 'snapshots'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          6. Snapshot History & Revert
        </button>
        <button
          onClick={() => setActiveSubTab('sow_contract')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeSubTab === 'sow_contract'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          7. RFP Schedule A Demarcation
        </button>
      </div>

      {/* Sub-Tab 1: Module-by-Module Demarcation Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filter & Batch Actions */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Pillar Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center gap-1">
                <Filter size={13} /> Filter:
              </span>
              {['ALL', 'ERP', 'SCM', 'HCM', 'EPM', 'CX'].map(pillar => (
                <button
                  key={pillar}
                  onClick={() => setSelectedPillarFilter(pillar)}
                  className={`px-3 py-1 rounded-sm text-xs font-semibold transition cursor-pointer ${
                    selectedPillarFilter === pillar
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pillar}
                </button>
              ))}
            </div>

            {/* Batch Assign Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase mr-1">Batch Assign ({selectedPillarFilter}):</span>
              <button
                onClick={() => handleBatchUpdatePillar(selectedPillarFilter, 'our_si')}
                className="px-2.5 py-1 rounded-sm bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                All Our SI
              </button>
              <button
                onClick={() => handleBatchUpdatePillar(selectedPillarFilter, 'other_si')}
                className="px-2.5 py-1 rounded-sm bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold hover:bg-blue-200 transition"
              >
                All Other BI
              </button>
              <button
                onClick={() => handleBatchUpdatePillar(selectedPillarFilter, 'client')}
                className="px-2.5 py-1 rounded-sm bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-200 transition"
              >
                All Client
              </button>
            </div>
          </div>

          {/* Module Demarcation Table */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Oracle Module</th>
                    <th className="py-3 px-3">Pillar</th>
                    <th className="py-3 px-3 text-right">P80 Total</th>
                    <th className="py-3 px-4">Primary Delivery Lead</th>
                    <th className="py-3 px-3 text-center">Our SI %</th>
                    <th className="py-3 px-3 text-center">Other BI %</th>
                    <th className="py-3 px-3 text-center">Client %</th>
                    <th className="py-3 px-3 text-center">IV&V %</th>
                    <th className="py-3 px-4">Demarcation Rationale & Boundaries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredModules.map(modId => {
                    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
                    const modEst = data.moduleEstimates.find(e => e.moduleId === modId);
                    const dem = mvConfig.moduleDemarcation?.[modId] || {
                      moduleId: modId,
                      primaryOwner: 'our_si',
                      ourSiSharePct: 100,
                      otherSiSharePct: 0,
                      clientSharePct: 0,
                      validationSiPct: 0,
                      handshakeComplexity: 'Medium'
                    };

                    const totalModHours = modEst?.finalP80Hours || modDef?.baseEffortHours || 500;

                    return (
                      <tr key={modId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{modDef?.name || modId}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{modId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-xs font-bold text-[10px] bg-slate-100 text-slate-700">
                            {modDef?.pillar || 'ERP'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {totalModHours.toLocaleString()} hrs
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {(['our_si', 'other_si', 'client', 'joint'] as DeliveryOwnerParty[]).map(party => (
                              <button
                                key={party}
                                onClick={() => handleUpdateModuleOwner(modId, party)}
                                className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition cursor-pointer ${
                                  dem.primaryOwner === party
                                    ? party === 'our_si'
                                      ? 'bg-slate-900 text-white'
                                      : party === 'other_si'
                                      ? 'bg-blue-600 text-white'
                                      : party === 'client'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-purple-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {party === 'our_si' ? 'Our SI' : party === 'other_si' ? 'Other BI' : party === 'client' ? 'Client' : 'Joint'}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {dem.ourSiSharePct}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-blue-700 font-bold">
                          {dem.otherSiSharePct}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">
                          {dem.clientSharePct}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-700 font-bold">
                          {dem.validationSiPct}%
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 max-w-xs truncate" title={dem.notes || ''}>
                          {dem.notes || (dem.primaryOwner === 'our_si' ? 'Core build delivered by Our SI' : `Delivered by ${dem.primaryOwner.toUpperCase()}`)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Phase & Lifecycle Split Demarcation */}
      {activeSubTab === 'phases' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Oracle Implementation Phase & Lifecycle Split</h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                    Phase Demarcation Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure vendor assignments per implementation phase (e.g. Enterprise Design executed by Business Integrator / Strategy Partner, while Build, CRP, SIT, and Cutover are executed by Our SI).
                </p>
              </div>

              {/* Quick Preset Action for Design Split */}
              <button
                onClick={() => handleApplyPreset('design_bi_split')}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start md:self-auto"
              >
                <Sparkles size={13} className="text-blue-600" />
                <span>Apply "Design by BI, Build by SI" Preset</span>
              </button>
            </div>

            {/* Visual Phase Timeline Bar */}
            <div className="mb-6 bg-slate-50 border border-slate-200 p-3 rounded-xs">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Phase Timeline & Ownership Alignment</span>
                <span className="font-mono text-slate-500">Duration: {scenario.durationWeeks || 24} Weeks</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {IMPLEMENTATION_PHASES.map(ph => {
                  const pDem = mvConfig.phaseDemarcation?.[ph.id] || DEFAULT_PHASE_DEMARCATIONS[ph.id];
                  const owner = pDem?.primaryOwner || 'our_si';
                  const phHours = mvMetrics?.phaseHoursBreakdown?.find(p => p.phaseId === ph.id)?.totalHours || 0;

                  return (
                    <div
                      key={ph.id}
                      className={`p-2 rounded-xs border text-center transition ${
                        owner === 'other_si'
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : owner === 'client'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : owner === 'validation_si'
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-slate-900 border-slate-900 text-white'
                      }`}
                    >
                      <div className="text-[10px] font-bold truncate">{ph.code}</div>
                      <div className={`text-[9px] font-semibold uppercase mt-0.5 truncate ${
                        owner === 'our_si' ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {owner === 'our_si' ? 'Our SI' : owner === 'other_si' ? 'BI Partner' : owner === 'client' ? 'Client' : 'IV&V'}
                      </div>
                      <div className="text-[10px] font-mono font-bold mt-1">
                        {phHours.toLocaleString()}h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Phase Demarcation Cards */}
            <div className="space-y-4 divide-y divide-slate-100">
              {IMPLEMENTATION_PHASES.map(ph => {
                const pDem = mvConfig.phaseDemarcation?.[ph.id] || DEFAULT_PHASE_DEMARCATIONS[ph.id] || {
                  phaseId: ph.id,
                  phaseName: ph.name,
                  code: ph.code,
                  primaryOwner: 'our_si',
                  ourSiSharePct: 100,
                  otherSiSharePct: 0,
                  clientSharePct: 0,
                  validationSiPct: 0,
                  handshakeComplexity: 'Medium'
                };

                const phMetrics = mvMetrics?.phaseHoursBreakdown?.find(p => p.phaseId === ph.id);
                const totalPhHours = phMetrics?.totalHours || 800;
                const ourHrs = phMetrics?.ourSiHours ?? Math.round(totalPhHours * (pDem.ourSiSharePct / 100));
                const otherHrs = phMetrics?.otherSiHours ?? Math.round(totalPhHours * (pDem.otherSiSharePct / 100));
                const clientHrs = phMetrics?.clientHours ?? Math.round(totalPhHours * (pDem.clientSharePct / 100));
                const valHrs = phMetrics?.validationSiHours ?? Math.round(totalPhHours * (pDem.validationSiPct / 100));

                return (
                  <div key={ph.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{ph.name}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700">
                            W{phMetrics?.startWeek || 1} - W{phMetrics?.endWeek || 4}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${
                            pDem.primaryOwner === 'our_si'
                              ? 'bg-slate-900 text-white'
                              : pDem.primaryOwner === 'other_si'
                              ? 'bg-blue-100 text-blue-900'
                              : pDem.primaryOwner === 'client'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            Lead: {pDem.primaryOwner.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ph.description}</p>
                        {pDem.notes && (
                          <p className="text-[11px] font-semibold text-blue-700 mt-0.5 bg-blue-50/70 px-2 py-0.5 rounded-xs inline-block">
                            Demarcation: {pDem.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-bold">
                        <span className="text-slate-900">Total: {totalPhHours.toLocaleString()} hrs</span>
                        <span className="text-emerald-700">Our SI: {ourHrs}h</span>
                        {otherHrs > 0 && <span className="text-blue-700">Other BI: {otherHrs}h</span>}
                        {clientHrs > 0 && <span className="text-emerald-600">Client: {clientHrs}h</span>}
                        {valHrs > 0 && <span className="text-amber-600">IV&V: {valHrs}h</span>}
                      </div>
                    </div>

                    {/* Ownership Quick Selectors */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Primary Lead:</span>
                      {(['our_si', 'other_si', 'client', 'joint'] as DeliveryOwnerParty[]).map(party => (
                        <button
                          key={party}
                          onClick={() => handleUpdatePhaseOwner(ph.id, party)}
                          className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition cursor-pointer ${
                            pDem.primaryOwner === party
                              ? party === 'our_si'
                                ? 'bg-slate-900 text-white'
                                : party === 'other_si'
                                ? 'bg-blue-700 text-white'
                                : party === 'client'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-purple-700 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {party === 'our_si' ? 'Our SI' : party === 'other_si' ? 'Other BI' : party === 'client' ? 'Client' : 'Joint / Shared'}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Percentage Sliders */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xs border border-slate-200">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Our SI Share:</span>
                          <span className="font-mono font-bold text-slate-900">{pDem.ourSiSharePct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={pDem.ourSiSharePct}
                          onChange={(e) => handleUpdatePhaseShare(ph.id, 'ourSiSharePct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Other BI Share:</span>
                          <span className="font-mono font-bold text-blue-700">{pDem.otherSiSharePct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={pDem.otherSiSharePct}
                          onChange={(e) => handleUpdatePhaseShare(ph.id, 'otherSiSharePct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Client Team Share:</span>
                          <span className="font-mono font-bold text-emerald-700">{pDem.clientSharePct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={pDem.clientSharePct}
                          onChange={(e) => handleUpdatePhaseShare(ph.id, 'clientSharePct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Validation SI / IV&V:</span>
                          <span className="font-mono font-bold text-amber-700">{pDem.validationSiPct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={pDem.validationSiPct}
                          onChange={(e) => handleUpdatePhaseShare(ph.id, 'validationSiPct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Workstream & RACI Responsibility Matrix */}
      {activeSubTab === 'workstreams' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workstream Ownership & RACI Responsibility Matrix</h3>
                <p className="text-xs text-slate-500">Assign delivery effort shares across PMO, Functional, Integrations, Data Migration, Testing, and Change Management.</p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {Object.keys(DEFAULT_WORKSTREAM_DEMARCATIONS).map(wsId => {
                const dem = mvConfig.workstreamDemarcation?.[wsId] || DEFAULT_WORKSTREAM_DEMARCATIONS[wsId];
                const wsHoursRef = data.workstreamHours.find(w => w.id === wsId)?.hours || 800;

                const ourHrs = Math.round(wsHoursRef * ((dem.ourSiSharePct || 100) / 100));
                const otherHrs = Math.round(wsHoursRef * ((dem.otherSiSharePct || 0) / 100));
                const clientHrs = Math.round(wsHoursRef * ((dem.clientSharePct || 0) / 100));
                const valHrs = Math.round(wsHoursRef * ((dem.validationSiPct || 0) / 100));

                return (
                  <div key={wsId} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{dem.workstreamName}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700">
                            {dem.category}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs ${
                            dem.primaryOwner === 'our_si' ? 'bg-slate-900 text-white' : dem.primaryOwner === 'other_si' ? 'bg-blue-100 text-blue-900' : dem.primaryOwner === 'client' ? 'bg-emerald-100 text-emerald-900' : 'bg-purple-100 text-purple-900'
                          }`}>
                            Lead: {dem.primaryOwner.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{dem.notes}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono font-bold">
                        <span className="text-slate-900">Total: {Math.round(wsHoursRef).toLocaleString()} hrs</span>
                        <span className="text-emerald-700">Our SI: {ourHrs}h</span>
                        {otherHrs > 0 && <span className="text-blue-700">Other BI: {otherHrs}h</span>}
                        {clientHrs > 0 && <span className="text-emerald-600">Client: {clientHrs}h</span>}
                      </div>
                    </div>

                    {/* Interactive Percentage Sliders */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xs border border-slate-200">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Our SI Share:</span>
                          <span className="font-mono font-bold text-slate-900">{dem.ourSiSharePct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={dem.ourSiSharePct}
                          onChange={(e) => handleUpdateWorkstreamShare(wsId, 'ourSiSharePct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Other BI Share:</span>
                          <span className="font-mono font-bold text-blue-700">{dem.otherSiSharePct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={dem.otherSiSharePct}
                          onChange={(e) => handleUpdateWorkstreamShare(wsId, 'otherSiSharePct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Client Team Share:</span>
                          <span className="font-mono font-bold text-emerald-700">{dem.clientSharePct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={dem.clientSharePct}
                          onChange={(e) => handleUpdateWorkstreamShare(wsId, 'clientSharePct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span className="font-bold">Validation SI / IV&V:</span>
                          <span className="font-mono font-bold text-amber-700">{dem.validationSiPct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={dem.validationSiPct}
                          onChange={(e) => handleUpdateWorkstreamShare(wsId, 'validationSiPct', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Coordination Tax & Handshake Engine */}
      {activeSubTab === 'handshake' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Risk & Governance Tax</span>
                <h3 className="text-base font-bold text-slate-900">Multi-Vendor Coordination Overhead & Boundary Interfaces</h3>
                <p className="text-xs text-slate-500">
                  When scope is split across multiple vendors and client teams, project risk increases. We calculate the required coordination buffer to cover joint SIT defect triage, API contract mocking, and SteerCo synchronization.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Coordination Buffer:</span>
                <div className="text-2xl font-mono font-bold text-amber-600">
                  +{mvMetrics?.ourSiHandshakeOverheadHours || 0} <span className="text-xs font-sans text-slate-400">hrs</span>
                </div>
              </div>
            </div>

            {/* Boundary Touchpoint Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Detected Cross-Vendor Boundary Touchpoints:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(mvMetrics?.boundaryTouchpoints || []).map((b, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{b.interfaceFlow}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-300">
                        {b.riskLevel} Risk (+{b.coordinationHours}h)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-900">{b.sourcePillar}</span>
                      <ArrowRight size={13} className="text-slate-400" />
                      <span className="font-semibold text-slate-900">{b.targetPillar}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Handshake Overhead Breakdown List */}
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Calculated Coordination Hour Drivers:</h4>
              <div className="space-y-2">
                {(mvMetrics?.handshakeOverheadBreakdown || []).map((h, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-sm flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{h.category}</div>
                      <div className="text-[11px] text-slate-500">{h.rationale}</div>
                    </div>
                    <div className="text-sm font-mono font-bold text-amber-700 shrink-0">
                      +{h.hours} hrs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: AI Ingest (RFP / MoM / Email / Notes) */}
      {activeSubTab === 'ai_ingest' && (
        <div className="space-y-4">
          <div className="bg-white border border-purple-200 rounded-sm p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-900 border border-purple-300">
                    AI Scope Parser
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Extracts multi-vendor demarcation from RFP, MoM, email, or notes</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">AI Multi-Vendor Ingestion Hub</h3>
              </div>
            </div>

            {/* Quick Sample Document Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-500">Load Realistic Enterprise Sample:</span>
              {SAMPLE_MULTI_VENDOR_DOCUMENTS.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setAiDocInput(sample.content);
                    setAiResult(null);
                  }}
                  className="px-3 py-1 rounded-sm text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Paste Document Text, Email, MoM or RFP Section:</label>
              <textarea
                value={aiDocInput}
                onChange={(e) => setAiDocInput(e.target.value)}
                placeholder="Paste RFP scope text, SteerCo meeting minutes, or client email defining the split between Our SI, BI Vendor, Client, and Validation auditor..."
                rows={8}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Execute Button */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleRunAiAnalysis}
                disabled={aiIsAnalyzing || !aiDocInput.trim()}
                className="px-5 py-2.5 rounded-sm bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {aiIsAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Scope & Demarcations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Extract Multi-Vendor Demarcation</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Result Card */}
            {aiResult && (
              <div className="mt-4 p-4 bg-purple-50/50 border border-purple-200 rounded-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-600" />
                      <span>{aiResult.documentTitle}</span>
                    </h4>
                    <p className="text-xs text-purple-800 mt-0.5">{aiResult.executiveSummary}</p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-sm bg-purple-200 text-purple-900">
                    {aiResult.confidenceScore}% Confidence
                  </span>
                </div>

                {/* Detected Demarcation List */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900">Detected Scope Demarcations:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiResult.detectedDemarcations.map((d, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-purple-200 rounded-xs text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{d.area}</span>
                          <div className="flex items-center gap-1.5">
                            <AttributionBadge
                              type={d.citation ? 'direct' : 'inferred'}
                              citation={d.citation}
                              compact
                            />
                            <span className={`px-2 py-0.5 rounded-xs font-bold text-[10px] ${
                              d.assignedParty === 'our_si' ? 'bg-slate-900 text-white' : d.assignedParty === 'other_si' ? 'bg-blue-100 text-blue-900' : d.assignedParty === 'client' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {d.assignedParty.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 border border-slate-200 font-mono">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Source Quote:</span>
                          "{d.citation || 'Extracted via structural heuristic pattern'}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex items-center justify-end pt-2 border-t border-purple-200">
                  <button
                    onClick={handleApplyAiResult}
                    className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Apply Extracted Demarcation to Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Snapshot History & 1-Click Revert */}
      {activeSubTab === 'snapshots' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Demarcation Snapshot History & Version Control</h3>
                <p className="text-xs text-slate-500">Save checkpoints or instantly revert to any previous multi-vendor split or 100% single-vendor baseline.</p>
              </div>

              {/* Create Snapshot Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Post-SteerCo Negotiation Baseline"
                  value={snapshotNameInput}
                  onChange={(e) => setSnapshotNameInput(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-sm w-64"
                />
                <button
                  onClick={handleSaveSnapshot}
                  className="px-3.5 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Save Snapshot</span>
                </button>
              </div>
            </div>

            {/* Snapshot List */}
            <div className="space-y-3">
              {(mvConfig.snapshots && mvConfig.snapshots.length > 0) ? (
                mvConfig.snapshots.map((snap) => (
                  <div key={snap.id} className="p-4 bg-slate-50 border border-slate-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{snap.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-slate-200 text-slate-700">
                          {snap.timestamp}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs bg-purple-100 text-purple-900">
                          {snap.source}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{snap.summary}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRevertToSnapshot(snap)}
                        className="px-3.5 py-1.5 rounded-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw size={13} />
                        <span>Revert to This Version</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No snapshots recorded yet. Create a snapshot above or apply a preset to generate historical versions.
                </div>
              )}
            </div>

            {/* Danger Zone: Reset */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Want to start over?</span>
              <button
                onClick={handleResetToSingleVendor}
                className="px-3 py-1.5 rounded-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition cursor-pointer"
              >
                Reset to 100% Single-Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: RFP Schedule A Demarcation Text */}
      {activeSubTab === 'sow_contract' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">RFP Schedule A: Contractual Scope Demarcation</h3>
                <p className="text-xs text-slate-500">Pre-formatted contractual clause text ready to attach directly to RFPs.</p>
              </div>
              <button
                onClick={handleCopyContract}
                className="px-3.5 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {copiedContract ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedContract ? 'Copied to Clipboard!' : 'Copy RFP Text'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-sm text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] custom-scrollbar">
              {generateSowContractText()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
