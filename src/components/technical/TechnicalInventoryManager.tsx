import React, { useState, useMemo } from 'react';
import {
  Layers,
  Cpu,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Calculator,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  TableProperties,
  Database,
  Upload,
  Workflow,
  ShieldCheck,
  Check,
  Network,
  Server,
  Building2,
  CreditCard,
  BarChart3,
  Users2,
  Boxes,
  ArrowRight,
  Info,
  Sliders,
  Globe
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  TechnicalIntegrationItem,
  TechnicalComplexityTier
} from '../../types';
import { DEFAULT_TECHNICAL_INTEGRATIONS } from '../../data/technicalScopingData';
import { IntegrationScopingCalculatorModal } from './IntegrationScopingCalculatorModal';
import { TechnicalSmcMatrix } from './TechnicalSmcMatrix';
import { ConversionMatrixManager } from './ConversionMatrixManager';
import { TechnicalTowerBenchmarks } from './TechnicalTowerBenchmarks';
import { UnifiedRicefwSummaryGrid } from './UnifiedRicefwSummaryGrid';
import { IntelUploadHubModal } from '../modals/IntelUploadHubModal';
import { IntegrationInventoryIngestModal } from './IntegrationInventoryIngestModal';
import { IntegrationInventoryParseResult } from '../../utils/integrationInventoryParser';
import {
  syncIntegrationsFromInventory,
  sanitizeIntegrationItem,
  STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG
} from '../../utils/technicalSync';

interface TechnicalInventoryManagerProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  data: CalculatedProjectData;
}

// Canonical external boundary system detector
const getCanonicalEndpoint = (item: TechnicalIntegrationItem): { name: string; category: string } => {
  const combined = `${item.sourceSystem} ${item.targetSystem} ${item.name}`.toLowerCase();

  if (combined.includes('bank') || combined.includes('swift') || combined.includes('mt940') || combined.includes('jpmorgan') || combined.includes('citi') || combined.includes('pain.001')) {
    return { name: 'Commercial Banking & Treasury (Host-to-Host)', category: 'Banking & Treasury' };
  }
  if (combined.includes('salesforce') || combined.includes('crm') || combined.includes('opportunity')) {
    return { name: 'Salesforce CRM & Quoting', category: 'Customer Experience' };
  }
  if (combined.includes('workday') || combined.includes('adp') || combined.includes('ceridian') || combined.includes('kronos') || combined.includes('payroll') || combined.includes('worker master')) {
    return { name: 'ADP / Workday Core HR & Payroll', category: 'Human Capital' };
  }
  if (combined.includes('coupa') || combined.includes('ariba') || combined.includes('procurement') || combined.includes('requisition')) {
    return { name: 'Coupa / External Procurement Cloud', category: 'Procurement' };
  }
  if (combined.includes('3pl') || combined.includes('warehouse') || combined.includes('asn') || combined.includes('shipping') || combined.includes('edi 856')) {
    return { name: '3PL Logistics & WMS Partner', category: 'Supply Chain' };
  }
  if (combined.includes('concur') || combined.includes('expense')) {
    return { name: 'SAP Concur Expense Management', category: 'Spend Management' };
  }
  if (combined.includes('snowflake') || combined.includes('data lake') || combined.includes('aws s3') || combined.includes('bicc')) {
    return { name: 'Snowflake / AWS Enterprise Data Lake', category: 'Analytics & Data' };
  }
  if (combined.includes('stripe') || combined.includes('cybersource') || combined.includes('payment gateway') || combined.includes('settlement')) {
    return { name: 'Stripe / CyberSource Payment Gateway', category: 'FinTech & Payments' };
  }
  if (combined.includes('servicenow') || combined.includes('cmdb') || combined.includes('itam')) {
    return { name: 'ServiceNow IT Service Management', category: 'IT Operations' };
  }
  if (combined.includes('vertex') || combined.includes('avalara') || combined.includes('tax engine') || combined.includes('saf-t') || combined.includes('peppol')) {
    return { name: 'Vertex / Avalara & Tax Authorities', category: 'Statutory & Tax' };
  }
  if (combined.includes('blackline') || combined.includes('reconciliation') || combined.includes('agis') || combined.includes('intercompany')) {
    return { name: 'BlackLine / Financial Close Platform', category: 'Record to Report' };
  }
  if (combined.includes('edi') || combined.includes('sps commerce') || combined.includes('opentext') || combined.includes('850')) {
    return { name: 'Global B2B EDI Supplier Network', category: 'B2B EDI' };
  }
  if (combined.includes('zebra') || combined.includes('honeywell') || combined.includes('rf scanner') || combined.includes('barcode')) {
    return { name: 'Handheld RF Scanners & Shopfloor', category: 'Operations' };
  }
  if (combined.includes('blue yonder') || combined.includes('o9') || combined.includes('demand plan')) {
    return { name: 'Blue Yonder / O9 Demand Planning', category: 'Supply Planning' };
  }
  if (combined.includes('lims') || combined.includes('labvantage') || combined.includes('quality')) {
    return { name: 'LIMS Quality Management System', category: 'Quality & Lab' };
  }

  // Fallback: check if source or target is external (not Oracle)
  const s = item.sourceSystem || '';
  const t = item.targetSystem || '';
  if (s.toLowerCase().includes('oracle') && t && !t.toLowerCase().includes('oracle')) {
    return { name: t, category: 'External Boundary System' };
  }
  if (!s.toLowerCase().includes('oracle') && s) {
    return { name: s, category: 'External Boundary System' };
  }
  return { name: 'Enterprise External System', category: 'Custom Integration' };
};

export const TechnicalInventoryManager: React.FC<TechnicalInventoryManagerProps> = ({
  scenario,
  onUpdateScenario,
  data
}) => {
  // Collapsible section for deep dive (defaults to 'none' for ultra-simple cockpit)
  const [expandedSection, setExpandedSection] = useState<'none' | 'interfaces' | 'conversions' | 'ricefw' | 'benchmarks'>('none');
  const [benchmarkSubTab, setBenchmarkSubTab] = useState<'tshirt' | 'smc'>('tshirt');
  const [editingIntegration, setEditingIntegration] = useState<TechnicalIntegrationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isIntelModalOpen, setIsIntelModalOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [interfaceViewMode, setInterfaceViewMode] = useState<'itemized' | 'by_endpoint'>('itemized');
  const [showSizerHelper, setShowSizerHelper] = useState<boolean>(false);
  const [sizingEndpoints, setSizingEndpoints] = useState<number>(6);
  const [sizingRatio, setSizingRatio] = useState<number>(2.5);

  // Reliable integrations list honoring Clean Slate
  const rawIntegrations = scenario.technicalIntegrations !== undefined
    ? scenario.technicalIntegrations
    : (scenario.scaleDrivers?.tech_oic === 0 ? [] : DEFAULT_TECHNICAL_INTEGRATIONS);
  const integrations = rawIntegrations.map(sanitizeIntegrationItem);

  // Canonical endpoint categorization & grouping
  const endpointGroups = useMemo(() => {
    const groups: Record<string, {
      name: string;
      category: string;
      items: TechnicalIntegrationItem[];
      totalHours: number;
    }> = {};

    integrations.forEach(item => {
      const canonical = getCanonicalEndpoint(item);
      if (!groups[canonical.name]) {
        groups[canonical.name] = {
          name: canonical.name,
          category: canonical.category,
          items: [],
          totalHours: 0
        };
      }
      groups[canonical.name].items.push(item);
      groups[canonical.name].totalHours += (item.calculatedHours || 80);
    });

    return groups;
  }, [integrations]);

  const uniqueEndpointsList = useMemo(() => Object.values(endpointGroups), [endpointGroups]);
  const uniqueEndpointsCount = uniqueEndpointsList.length;
  const avgFlowsPerEndpoint = uniqueEndpointsCount > 0
    ? (integrations.length / uniqueEndpointsCount).toFixed(1)
    : '0.0';

  // Core metrics
  const totalIntegrationHours = integrations.reduce((sum, item) => sum + (item.calculatedHours || 80), 0);
  const simpleCount = integrations.filter(i => i.complexity === 'S').length;
  const mediumCount = integrations.filter(i => i.complexity === 'M').length;
  const complexCount = integrations.filter(i => i.complexity === 'C' || i.complexity === 'XL').length;
  const avgHours = integrations.length > 0 ? Math.round(totalIntegrationHours / integrations.length) : 0;

  // Driver metrics
  const convObjects = scenario.scaleDrivers?.conv_objects ?? 12;
  const convRuns = scenario.scaleDrivers?.conv_runs ?? 3;
  const reportsBip = scenario.scaleDrivers?.tech_reports_bip ?? 10;
  const reportsOtbi = scenario.scaleDrivers?.tech_reports_otbi ?? 10;
  const paasCount = scenario.scaleDrivers?.tech_paas ?? 1;
  const workflowsCount = scenario.scaleDrivers?.tech_workflows ?? 4;

  const convHours = data?.conversionMetrics?.totalConversionP80Hours || (convObjects * convRuns * 12);
  const reportsHours = (reportsBip * 45) + (reportsOtbi * 18);
  const extensionsHours = (paasCount * 550) + (workflowsCount * 55);

  const totalProgramHours = data?.p80_DefensibleHours || data?.targetHours || data?.p50_BaselineHours || data?.totalBaseHours || 0;
  const totalTechHours = data?.technicalWorkstreamEstimate?.totalHours || (totalIntegrationHours + convHours + reportsHours + extensionsHours);
  const techPercentOfProgram = totalProgramHours > 0 ? Math.round((totalTechHours / totalProgramHours) * 100) : 0;

  // Stepper handlers
  const updateInterfaceCount = (delta: number) => {
    onUpdateScenario(prev => {
      const currentList = prev.technicalIntegrations !== undefined
        ? prev.technicalIntegrations
        : (prev.scaleDrivers?.tech_oic === 0 ? [] : DEFAULT_TECHNICAL_INTEGRATIONS);

      if (delta > 0) {
        const nextIndex = currentList.length + 1;
        const code = `INT-${String(nextIndex).padStart(2, '0')}`;
        const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];
        const newItem: TechnicalIntegrationItem = {
          id: `int_step_${Date.now()}_${nextIndex}`,
          code,
          name: std ? std.name : `Enterprise Integration Flow (${code})`,
          pillar: std ? std.pillar : (nextIndex % 2 === 0 ? 'ERP' : 'SCM'),
          sourceSystem: std ? std.sourceSystem : 'Enterprise Third-Party Platform',
          targetSystem: std ? std.targetSystem : 'Oracle Cloud ERP & Financials',
          type: std ? std.type : 'inbound_rest',
          complexity: 'M',
          isQuestionDriven: true,
          questionAnswers: {
            patternDirection: 0,
            mappingComplexity: 1,
            connectivityProtocol: 0,
            dataVolume: 0,
            errorHandling: 1,
            apiReadiness: 0
          },
          baseHours: 80,
          calculatedHours: 80,
          calculationFormula: '80h standard tier allocation',
          compositeScore: 1.5,
          rationale: std ? std.rationale : 'Standard production interface flow.'
        };
        const updatedList = [...currentList, newItem];
        return syncIntegrationsFromInventory(updatedList, prev);
      } else if (delta < 0 && currentList.length > 0) {
        const updatedList = currentList.slice(0, currentList.length - 1);
        return syncIntegrationsFromInventory(updatedList, prev);
      }
      return prev;
    });
  };

  const updateConvObjects = (delta: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        conv_objects: Math.max(0, (prev.scaleDrivers?.conv_objects ?? 12) + delta)
      }
    }));
  };

  const updateConvRuns = (delta: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        conv_runs: Math.max(1, (prev.scaleDrivers?.conv_runs ?? 3) + delta)
      }
    }));
  };

  const updateReports = (delta: number) => {
    onUpdateScenario(prev => {
      const half = Math.round(delta / 2);
      return {
        ...prev,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_reports_bip: Math.max(0, (prev.scaleDrivers?.tech_reports_bip ?? 10) + half),
          tech_reports_otbi: Math.max(0, (prev.scaleDrivers?.tech_reports_otbi ?? 10) + (delta - half))
        }
      };
    });
  };

  const updateExtensions = (delta: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_workflows: Math.max(0, (prev.scaleDrivers?.tech_workflows ?? 4) + delta)
      }
    }));
  };

  // Size integrations using Endpoint Count × Flows per Endpoint ratio
  const applyEndpointFlowsMultiplier = (endpoints: number, ratio: number) => {
    const totalFlows = Math.max(1, Math.round(endpoints * ratio));
    const newItems: TechnicalIntegrationItem[] = [];

    // Distribution: roughly 35% S, 45% M, 20% C
    const sCount = Math.round(totalFlows * 0.35);
    const mCount = Math.round(totalFlows * 0.45);
    let sAdded = 0;
    let mAdded = 0;

    for (let i = 1; i <= totalFlows; i++) {
      const code = `INT-${String(i).padStart(2, '0')}`;
      const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];
      let t: TechnicalComplexityTier = 'M';
      if (sAdded < sCount) {
        t = 'S';
        sAdded++;
      } else if (mAdded < mCount) {
        t = 'M';
        mAdded++;
      } else {
        t = 'C';
      }
      const h = t === 'S' ? 40 : t === 'M' ? 80 : 140;

      newItems.push({
        id: `int_matrix_${Date.now()}_${i}`,
        code,
        name: std ? std.name : `Enterprise Integration Flow (${code})`,
        pillar: std ? std.pillar : (i % 2 === 0 ? 'ERP' : 'SCM'),
        sourceSystem: std ? std.sourceSystem : 'Enterprise Third-Party Platform',
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
        calculationFormula: `${h}h standard tier (${endpoints} Endpoints × ${ratio} flows/endpoint)`,
        compositeScore: t === 'S' ? 1.0 : t === 'M' ? 1.5 : 2.2,
        rationale: std ? std.rationale : `Sized from ${endpoints} external endpoints at ~${ratio} flows/endpoint benchmark.`
      });
    }

    onUpdateScenario(prev => {
      const updated = syncIntegrationsFromInventory(newItems, prev);
      return {
        ...updated,
        scaleDrivers: {
          ...updated.scaleDrivers,
          tech_oic: totalFlows
        }
      };
    });
    setExpandedSection('interfaces');
  };

  const handleAddFlowForEndpoint = (endpointName: string) => {
    onUpdateScenario(prev => {
      const currentList = prev.technicalIntegrations !== undefined
        ? prev.technicalIntegrations
        : (prev.scaleDrivers?.tech_oic === 0 ? [] : DEFAULT_TECHNICAL_INTEGRATIONS);

      const nextIndex = currentList.length + 1;
      const code = `INT-${String(nextIndex).padStart(2, '0')}`;
      const newItem: TechnicalIntegrationItem = {
        id: `int_flow_${Date.now()}_${nextIndex}`,
        code,
        name: `${endpointName} Data Pipe (${code})`,
        pillar: 'ERP',
        sourceSystem: endpointName,
        targetSystem: 'Oracle Cloud ERP & Financials',
        type: 'inbound_rest',
        complexity: 'M',
        isQuestionDriven: true,
        questionAnswers: {
          patternDirection: 0,
          mappingComplexity: 1,
          connectivityProtocol: 0,
          dataVolume: 0,
          errorHandling: 1,
          apiReadiness: 0
        },
        baseHours: 80,
        calculatedHours: 80,
        calculationFormula: '80h standard tier allocation',
        compositeScore: 1.5,
        rationale: `Dedicated integration flow connecting ${endpointName} to Oracle Fusion.`
      };
      const updatedList = [...currentList, newItem];
      return syncIntegrationsFromInventory(updatedList, prev);
    });
    setExpandedSection('interfaces');
  };

  // 1-Click Package Tier Presets
  const applyPackageTier = (tier: 'compact' | 'standard' | 'global') => {
    let intCount = 8;
    let sCount = 4;
    let mCount = 3;
    let cCount = 1;
    let convObj = 8;
    let convRun = 2;
    let repBip = 5;
    let repOtbi = 5;
    let paas = 0;
    let wf = 2;

    if (tier === 'standard') {
      intCount = 15;
      sCount = 5;
      mCount = 7;
      cCount = 3;
      convObj = 14;
      convRun = 3;
      repBip = 12;
      repOtbi = 13;
      paas = 1;
      wf = 5;
    } else if (tier === 'global') {
      intCount = 35;
      sCount = 10;
      mCount = 18;
      cCount = 7;
      convObj = 24;
      convRun = 4;
      repBip = 25;
      repOtbi = 25;
      paas = 3;
      wf = 12;
    }

    // Build standard integrations list
    const newItems: TechnicalIntegrationItem[] = [];
    let sAdded = 0;
    let mAdded = 0;

    for (let i = 1; i <= intCount; i++) {
      const code = `INT-${String(i).padStart(2, '0')}`;
      const std = STANDARD_ENTERPRISE_INTEGRATIONS_CATALOG[code];
      let t: TechnicalComplexityTier = 'M';
      if (sAdded < sCount) {
        t = 'S';
        sAdded++;
      } else if (mAdded < mCount) {
        t = 'M';
        mAdded++;
      } else {
        t = 'C';
      }

      const h = t === 'S' ? 40 : t === 'M' ? 80 : 140;

      newItems.push({
        id: `int_pkg_${tier}_${i}`,
        code,
        name: std ? std.name : `Enterprise Integration Flow (${code})`,
        pillar: std ? std.pillar : (i % 2 === 0 ? 'ERP' : 'SCM'),
        sourceSystem: std ? std.sourceSystem : 'Enterprise Third-Party Platform',
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
        calculationFormula: `${h}h standard tier allocation`,
        compositeScore: t === 'S' ? 1.0 : t === 'M' ? 1.5 : 2.2,
        rationale: std ? std.rationale : `${tier.toUpperCase()} tier package standard interface.`
      });
    }

    onUpdateScenario(prev => {
      const updated = syncIntegrationsFromInventory(newItems, prev);
      return {
        ...updated,
        scaleDrivers: {
          ...updated.scaleDrivers,
          tech_oic: intCount,
          conv_objects: convObj,
          conv_runs: convRun,
          tech_reports_bip: repBip,
          tech_reports_otbi: repOtbi,
          tech_paas: paas,
          tech_workflows: wf
        }
      };
    });
  };

  const handleOpenCalculator = (item: TechnicalIntegrationItem) => {
    setEditingIntegration(item);
    setIsModalOpen(true);
  };

  const handleAddNewIntegration = () => {
    updateInterfaceCount(1);
    setExpandedSection('interfaces');
  };

  const handleSaveIntegration = (updated: TechnicalIntegrationItem) => {
    onUpdateScenario(prev => {
      const currentList = prev.technicalIntegrations !== undefined
        ? prev.technicalIntegrations
        : (prev.scaleDrivers?.tech_oic === 0 ? [] : DEFAULT_TECHNICAL_INTEGRATIONS);
      const exists = currentList.some(i => i.id === updated.id);
      const newList = exists
        ? currentList.map(i => (i.id === updated.id ? updated : i))
        : [...currentList, updated];

      return syncIntegrationsFromInventory(newList, prev);
    });
  };

  const handleDeleteIntegration = (id: string) => {
    onUpdateScenario(prev => {
      const currentList = prev.technicalIntegrations !== undefined
        ? prev.technicalIntegrations
        : (prev.scaleDrivers?.tech_oic === 0 ? [] : DEFAULT_TECHNICAL_INTEGRATIONS);
      const newList = currentList.filter(i => i.id !== id);
      return syncIntegrationsFromInventory(newList, prev);
    });
  };

  const handleClearAllIntegrations = () => {
    if (window.confirm('Clear all integrations and reset to a clean zero integration baseline?')) {
      onUpdateScenario(prev => syncIntegrationsFromInventory([], prev));
    }
  };

  const handleApplyIngestedInventory = (
    newItems: TechnicalIntegrationItem[],
    replaceExisting: boolean,
    fullResult?: IntegrationInventoryParseResult
  ) => {
    onUpdateScenario(prev => {
      const existing = prev.technicalIntegrations !== undefined
        ? prev.technicalIntegrations
        : (prev.scaleDrivers?.tech_oic === 0 ? [] : DEFAULT_TECHNICAL_INTEGRATIONS);
      const combined = replaceExisting ? newItems : [...existing, ...newItems];
      return syncIntegrationsFromInventory(combined, prev, fullResult?.ricefwCounts, fullResult?.ricefwSmcOverrides);
    });
    setExpandedSection('interfaces');
  };

  // Filtered table view
  const filteredIntegrations = integrations.filter(item => {
    const matchesPillar = pillarFilter === 'all' || item.pillar === pillarFilter;
    const matchesTier = tierFilter === 'all' || item.complexity === tierFilter;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetSystem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* 1. EXECUTIVE TECHNICAL COCKPIT HEADER */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-xs border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
              Oracle True Cloud Method • CEMLI Cockpit
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Synchronized Technical Workstream Engine
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
              {totalTechHours.toLocaleString()} <span className="text-base text-slate-300 font-normal">hrs</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xs">
              {totalProgramHours > 0 ? `${techPercentOfProgram}% of Total Program (${totalProgramHours.toLocaleString()}h)` : 'Stand-Alone Technical Track'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            All 4 technical towers are synchronized in real time. Adjust any count below with the steppers or choose an enterprise package.
          </p>
        </div>

        {/* 1-Click Quick Package Tiers */}
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            1-Click Sizing Packages:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyPackageTier('compact')}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition cursor-pointer border rounded-xs ${
                integrations.length === 8
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              Compact (8 Flows • 4 Systems)
            </button>
            <button
              type="button"
              onClick={() => applyPackageTier('standard')}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition cursor-pointer border rounded-xs ${
                integrations.length === 15
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              Standard (15 Flows • 6 Systems)
            </button>
            <button
              type="button"
              onClick={() => applyPackageTier('global')}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition cursor-pointer border rounded-xs ${
                integrations.length === 35
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              Global (35 Flows • 12 Systems)
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE 4 INTERACTIVE CEMLI COCKPIT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* TOWER 1: INTERFACES & INTEGRATIONS (OIC) */}
        <div className="bg-white border-2 border-slate-200 hover:border-blue-400 transition shadow-xs rounded-xs p-3.5 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Workflow size={16} className="text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                  1. Interfaces & Flows (OIC)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700">
                {totalIntegrationHours.toLocaleString()}h
              </span>
            </div>

            {/* Stepper with Flows & Endpoints Context */}
            <div className="mt-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 p-1.5 rounded-xs">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 font-mono pl-1">
                  Total Flows:
                </span>
                <span className="text-[10px] text-slate-500 font-mono pl-1">
                  OIC Interfaces
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateInterfaceCount(-1)}
                  disabled={integrations.length === 0}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove 1 Integration Flow"
                >
                  <Minus size={13} />
                </button>
                <span className="w-12 text-center font-mono font-extrabold text-sm text-slate-900">
                  {integrations.length} <span className="text-[10px] text-slate-500 font-normal">flows</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateInterfaceCount(1)}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition"
                  title="Add 1 Integration Flow"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Endpoints & Architecture Ratio badge */}
            <div className="mt-1.5 bg-blue-50/70 border border-blue-200/80 px-2 py-1 rounded-xs flex items-center justify-between text-[10px] font-mono text-blue-900">
              <span className="flex items-center gap-1 font-semibold">
                <Network size={11} className="text-blue-600" />
                <span>{uniqueEndpointsCount} Boundary Endpoints</span>
              </span>
              <span className="font-bold bg-white px-1.5 py-0.5 border border-blue-200 text-blue-800 shadow-2xs">
                ~{avgFlowsPerEndpoint} flows/system
              </span>
            </div>

            {/* Complexity mix */}
            <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Payload Mix:</span>
              <span className="font-bold text-slate-800">{simpleCount}S • {mediumCount}M • {complexCount}C</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
              Point-to-point, batch lookups, and multi-system pub/sub flows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'interfaces' ? 'none' : 'interfaces')}
            className={`w-full py-1.5 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border cursor-pointer rounded-xs ${
              expandedSection === 'interfaces'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-blue-700 border-slate-200'
            }`}
          >
            <span>{expandedSection === 'interfaces' ? 'Hide Drawer' : `View ${integrations.length} Flows (${uniqueEndpointsCount} Endpoints)`}</span>
            {expandedSection === 'interfaces' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* TOWER 2: CONVERSIONS (FBDI / HDL) */}
        <div className="bg-white border-2 border-slate-200 hover:border-emerald-400 transition shadow-xs rounded-xs p-3.5 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Database size={16} className="text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                  2. Conversions (FBDI)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {convHours.toLocaleString()}h
              </span>
            </div>

            {/* Stepper for Objects */}
            <div className="mt-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 p-1.5 rounded-xs">
              <span className="text-xs font-bold text-slate-700 font-mono pl-1">
                Data Objects:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateConvObjects(-1)}
                  disabled={convObjects <= 0}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center font-mono font-extrabold text-base text-slate-900">
                  {convObjects}
                </span>
                <button
                  type="button"
                  onClick={() => updateConvObjects(1)}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Mock Runs Stepper */}
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-600">
              <span>Mock Rehearsals:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateConvRuns(-1)}
                  disabled={convRuns <= 1}
                  className="w-5 h-5 bg-white border border-slate-300 flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer disabled:opacity-30"
                >
                  -
                </button>
                <span className="font-bold text-slate-800 px-1">{convRuns} Runs</span>
                <button
                  type="button"
                  onClick={() => updateConvRuns(1)}
                  className="w-5 h-5 bg-white border border-slate-300 flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
              Master data, open balances, and rehearsal cleansing loads.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'conversions' ? 'none' : 'conversions')}
            className={`w-full py-1.5 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border cursor-pointer rounded-xs ${
              expandedSection === 'conversions'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-emerald-700 border-slate-200'
            }`}
          >
            <span>{expandedSection === 'conversions' ? 'Hide Matrix' : 'View Conversion Matrix'}</span>
            {expandedSection === 'conversions' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* TOWER 3: REPORTS & ANALYTICS (OTBI / BIP) */}
        <div className="bg-white border-2 border-slate-200 hover:border-purple-400 transition shadow-xs rounded-xs p-3.5 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <TableProperties size={16} className="text-purple-600" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                  3. Reports (BIP)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700">
                {reportsHours.toLocaleString()}h
              </span>
            </div>

            {/* Stepper */}
            <div className="mt-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 p-1.5 rounded-xs">
              <span className="text-xs font-bold text-slate-700 font-mono pl-1">
                Custom Reports:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateReports(-2)}
                  disabled={(reportsBip + reportsOtbi) <= 0}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center font-mono font-extrabold text-base text-slate-900">
                  {reportsBip + reportsOtbi}
                </span>
                <button
                  type="button"
                  onClick={() => updateReports(2)}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Architecture:</span>
              <span className="font-bold text-slate-800">{reportsBip} BIP • {reportsOtbi} OTBI</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
              BIP financial pixel-perfect extracts & OTBI dashboards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'ricefw' ? 'none' : 'ricefw')}
            className={`w-full py-1.5 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border cursor-pointer rounded-xs ${
              expandedSection === 'ricefw'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-purple-700 border-slate-200'
            }`}
          >
            <span>{expandedSection === 'ricefw' ? 'Hide RICEFW' : 'View Full RICEFW Grid'}</span>
            {expandedSection === 'ricefw' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* TOWER 4: EXTENSIONS & WORKFLOWS (VBCS / BPM) */}
        <div className="bg-white border-2 border-slate-200 hover:border-amber-400 transition shadow-xs rounded-xs p-3.5 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Cpu size={16} className="text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                  4. Extensions & BPM
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700">
                {extensionsHours.toLocaleString()}h
              </span>
            </div>

            {/* Stepper */}
            <div className="mt-2.5 flex items-center justify-between bg-slate-50 border border-slate-200 p-1.5 rounded-xs">
              <span className="text-xs font-bold text-slate-700 font-mono pl-1">
                Custom Objects:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateExtensions(-1)}
                  disabled={(paasCount + workflowsCount) <= 0}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center font-mono font-extrabold text-base text-slate-900">
                  {paasCount + workflowsCount}
                </span>
                <button
                  type="button"
                  onClick={() => updateExtensions(1)}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Components:</span>
              <span className="font-bold text-slate-800">{paasCount} PaaS UI • {workflowsCount} BPM</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
              Visual Builder (VBCS) apps & multi-tier approval rules.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'benchmarks' ? 'none' : 'benchmarks')}
            className={`w-full py-1.5 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border cursor-pointer rounded-xs ${
              expandedSection === 'benchmarks'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-amber-800 border-slate-200'
            }`}
          >
            <span>{expandedSection === 'benchmarks' ? 'Hide Benchmarks' : 'View Benchmarks & Rates'}</span>
            {expandedSection === 'benchmarks' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 3. COLLAPSIBLE DEEP-DIVE EXPANSION AREA */}
      {expandedSection !== 'none' && (
        <div className="bg-slate-50 border-2 border-slate-300 p-4 shadow-sm rounded-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                {expandedSection === 'interfaces' && `OIC Integration Architecture (${integrations.length} Flows • ${uniqueEndpointsCount} Boundary Endpoints)`}
                {expandedSection === 'conversions' && 'Data Conversion & Migration Rehearsal Matrix'}
                {expandedSection === 'ricefw' && 'Unified Enterprise CEMLI Grid (All Modules)'}
                {expandedSection === 'benchmarks' && 'Technical Architecture Benchmarks & S/M/C Rates'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {expandedSection === 'interfaces' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSizerHelper(!showSizerHelper)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-bold font-mono uppercase rounded-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  >
                    <Sliders size={12} />
                    <span>{showSizerHelper ? 'Hide Sizer' : 'Endpoint Sizer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsIngestModalOpen(true)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold font-mono uppercase rounded-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>Ingest CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsIntelModalOpen(true)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold font-mono uppercase rounded-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Ingest Intel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewIntegration}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold font-mono uppercase rounded-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>+ Add Flow</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setExpandedSection('none')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold font-mono uppercase rounded-xs transition cursor-pointer"
              >
                Close Drawer ▲
              </button>
            </div>
          </div>

          {/* Render Active Expanded Tower */}
          {expandedSection === 'interfaces' && (
            <div className="space-y-3.5">
              {/* ARCHITECTURAL RELATIONSHIP STRIP: ENDPOINTS VS FLOWS */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xs space-y-3 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                        Solution Architecture Principle
                      </span>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        1 Connected System ≠ 1 Integration
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                      Each external <strong>Boundary Endpoint</strong> (e.g. Salesforce, Workday, Coupa, JPMorgan, 3PL) typically requires <strong>2 to 4 distinct Integration Flows</strong> (e.g. Inbound Master Data, Real-Time Transactions, Outbound Status, and Error Callbacks).
                    </p>
                  </div>

                  {/* 4 Architectural Summary Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                    <div className="bg-slate-50 border border-slate-200 p-2 text-center rounded-xs min-w-[100px]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Endpoints</span>
                      <span className="text-base font-extrabold font-mono text-slate-900 block">{uniqueEndpointsCount}</span>
                      <span className="text-[9px] text-slate-500 font-mono">Boundary Systems</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2 text-center rounded-xs min-w-[100px]">
                      <span className="text-[10px] font-mono text-blue-700 uppercase block">Total Flows</span>
                      <span className="text-base font-extrabold font-mono text-blue-950 block">{integrations.length}</span>
                      <span className="text-[9px] text-blue-600 font-mono">OIC Interfaces</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-2 text-center rounded-xs min-w-[100px]">
                      <span className="text-[10px] font-mono text-emerald-700 uppercase block">Flow Ratio</span>
                      <span className="text-base font-extrabold font-mono text-emerald-950 block">~{avgFlowsPerEndpoint}</span>
                      <span className="text-[9px] text-emerald-600 font-mono">Flows/Endpoint</span>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-2 text-center rounded-xs min-w-[100px]">
                      <span className="text-[10px] font-mono text-purple-700 uppercase block">Total Tech Effort</span>
                      <span className="text-base font-extrabold font-mono text-purple-950 block">{totalIntegrationHours.toLocaleString()}h</span>
                      <span className="text-[9px] text-purple-600 font-mono">~{avgHours}h / flow</span>
                    </div>
                  </div>
                </div>

                {/* Optional Top-Down Sizing Helper (Endpoints × Flows/Endpoint) */}
                {showSizerHelper && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders size={13} className="text-blue-600" />
                        <span>Quick Sizing by Connected Endpoints × Average Flows Multiplier</span>
                      </span>
                      <span className="text-[11px] font-mono text-blue-800">
                        Formula: {sizingEndpoints} Endpoints × {sizingRatio} Flows = <strong>{Math.round(sizingEndpoints * sizingRatio)} Integrations</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-slate-700">1. Boundary Systems:</span>
                        <div className="flex items-center gap-1">
                          {[4, 6, 8, 10, 12, 16].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSizingEndpoints(num)}
                              className={`px-2 py-0.5 text-xs font-mono font-bold border rounded-xs cursor-pointer transition ${
                                sizingEndpoints === num
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-slate-700">2. Flows / System:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { label: '2.0 (Lean)', value: 2.0 },
                            { label: '2.5 (Standard)', value: 2.5 },
                            { label: '3.5 (Heavy)', value: 3.5 }
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSizingRatio(opt.value)}
                              className={`px-2 py-0.5 text-xs font-mono font-bold border rounded-xs cursor-pointer transition ${
                                sizingRatio === opt.value
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => applyEndpointFlowsMultiplier(sizingEndpoints, sizingRatio)}
                        className="ml-auto px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs border border-amber-500 rounded-xs transition cursor-pointer shadow-xs"
                      >
                        Apply {Math.round(sizingEndpoints * sizingRatio)} Flows Scope
                      </button>
                    </div>
                  </div>
                )}

                {/* View Mode Switcher */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setInterfaceViewMode('itemized')}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-xs transition cursor-pointer flex items-center gap-1.5 border ${
                        interfaceViewMode === 'itemized'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <TableProperties size={13} />
                      <span>Itemized Flows Table ({integrations.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterfaceViewMode('by_endpoint')}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-xs transition cursor-pointer flex items-center gap-1.5 border ${
                        interfaceViewMode === 'by_endpoint'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <Network size={13} />
                      <span>Grouped by Boundary Endpoint ({uniqueEndpointsCount})</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    {interfaceViewMode === 'itemized'
                      ? `Viewing ${filteredIntegrations.length} of ${integrations.length} total integration flows`
                      : `Viewing ${uniqueEndpointsCount} external boundary systems`}
                  </span>
                </div>
              </div>

              {/* VIEW 1: ITEMIZED FLOWS TABLE */}
              {interfaceViewMode === 'itemized' && (
                <div className="space-y-2.5">
                  {/* Search & Filter Bar */}
                  <div className="bg-white p-2.5 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1 max-w-sm">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search code, name, source or target..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Pillar:</span>
                      <select
                        value={pillarFilter}
                        onChange={(e) => setPillarFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-300 p-1 font-mono focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Pillars</option>
                        <option value="ERP">ERP Financials</option>
                        <option value="SCM">SCM Operations</option>
                        <option value="HCM">HCM People</option>
                        <option value="EPM">EPM Planning</option>
                        <option value="CX">CX Sales/Service</option>
                      </select>

                      <span className="text-[10px] font-bold uppercase text-slate-500 font-mono ml-2">Tier:</span>
                      <select
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-300 p-1 font-mono focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Tiers (S/M/C)</option>
                        <option value="S">Simple (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="C">Complex (C)</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                          <th className="p-2 w-14 text-center border-r border-slate-200">Code</th>
                          <th className="p-2 w-16 border-r border-slate-200">Pillar</th>
                          <th className="p-2 min-w-[200px] border-r border-slate-200">Integration Flow Name</th>
                          <th className="p-2 min-w-[130px] border-r border-slate-200">External Endpoint</th>
                          <th className="p-2 min-w-[130px] border-r border-slate-200">Oracle Target</th>
                          <th className="p-2 w-16 text-center border-r border-slate-200">Tier</th>
                          <th className="p-2 w-20 text-right border-r border-slate-200">Hours</th>
                          <th className="p-2 w-24 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredIntegrations.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-slate-500">
                              No integration flows match current filters.
                            </td>
                          </tr>
                        ) : (
                          filteredIntegrations.map((item, idx) => {
                            const tierColor =
                              item.complexity === 'S'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : item.complexity === 'M'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300';

                            return (
                              <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                                <td className="p-2 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                                  {item.code}
                                </td>
                                <td className="p-2 border-r border-slate-100 font-mono">
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                    {item.pillar}
                                  </span>
                                </td>
                                <td className="p-2 border-r border-slate-100">
                                  <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-sm">{item.calculationFormula}</p>
                                </td>
                                <td className="p-2 border-r border-slate-100 text-slate-700 text-xs">
                                  {item.sourceSystem}
                                </td>
                                <td className="p-2 border-r border-slate-100 text-slate-700 text-xs">
                                  {item.targetSystem}
                                </td>
                                <td className="p-2 text-center border-r border-slate-100">
                                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold border ${tierColor}`}>
                                    {item.complexity}
                                  </span>
                                </td>
                                <td className="p-2 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                                  {item.calculatedHours} hrs
                                </td>
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCalculator(item)}
                                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                                      title="Edit 6-Question Formula"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteIntegration(item.id)}
                                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                      title="Remove Integration Flow"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: GROUPED BY BOUNDARY ENDPOINT */}
              {interfaceViewMode === 'by_endpoint' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uniqueEndpointsList.map((endpoint) => (
                      <div
                        key={endpoint.name}
                        className="bg-white border-2 border-slate-200 hover:border-blue-400 transition rounded-xs p-3.5 space-y-2.5 flex flex-col justify-between shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Server size={14} className="text-blue-600" />
                                <h5 className="font-bold text-slate-900 text-xs">{endpoint.name}</h5>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                Category: {endpoint.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-mono font-bold border border-blue-200 rounded-xs">
                                {endpoint.items.length} {endpoint.items.length === 1 ? 'Flow' : 'Flows'}
                              </span>
                              <span className="text-[10px] text-slate-600 font-mono block mt-0.5">
                                {endpoint.totalHours} hrs
                              </span>
                            </div>
                          </div>

                          {/* List of flows under this endpoint */}
                          <div className="mt-2.5 space-y-1.5">
                            {endpoint.items.map((flow) => {
                              const tierColor =
                                flow.complexity === 'S'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : flow.complexity === 'M'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300';

                              return (
                                <div
                                  key={flow.id}
                                  className="bg-slate-50 border border-slate-200 p-2 rounded-xs flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono font-bold text-slate-700 text-[11px] shrink-0">
                                      {flow.code}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-900 text-[11px] truncate">
                                        {flow.name}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-mono truncate">
                                        {flow.sourceSystem} → {flow.targetSystem}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold border ${tierColor}`}>
                                      {flow.complexity}
                                    </span>
                                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                                      {flow.calculatedHours}h
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCalculator(flow)}
                                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                                      title="Edit Formula"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteIntegration(flow.id)}
                                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                      title="Remove Flow"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Add flow to this endpoint */}
                        <button
                          type="button"
                          onClick={() => handleAddFlowForEndpoint(endpoint.name)}
                          className="w-full mt-2 py-1 text-[11px] font-mono font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 transition cursor-pointer rounded-xs flex items-center justify-center gap-1"
                        >
                          <Plus size={11} />
                          <span>Add Flow for {endpoint.name.split('(')[0].trim()}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {expandedSection === 'conversions' && (
            <ConversionMatrixManager
              scenario={scenario}
              onUpdateScenario={onUpdateScenario}
              data={data}
            />
          )}

          {expandedSection === 'ricefw' && (
            <UnifiedRicefwSummaryGrid
              scenario={scenario}
              onUpdateScenario={onUpdateScenario}
              data={data}
              onIngestClick={() => setIsIngestModalOpen(true)}
            />
          )}

          {expandedSection === 'benchmarks' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setBenchmarkSubTab('tshirt')}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
                    benchmarkSubTab === 'tshirt'
                      ? 'bg-slate-800 text-white font-mono shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 font-mono border border-slate-300'
                  }`}
                >
                  T-Shirt Tower Benchmarks
                </button>
                <button
                  type="button"
                  onClick={() => setBenchmarkSubTab('smc')}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
                    benchmarkSubTab === 'smc'
                      ? 'bg-slate-800 text-white font-mono shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 font-mono border border-slate-300'
                  }`}
                >
                  S/M/C Complexity Multipliers
                </button>
              </div>
              {benchmarkSubTab === 'tshirt' ? (
                <TechnicalTowerBenchmarks
                  scenario={scenario}
                  onUpdateScenario={onUpdateScenario}
                  data={data}
                />
              ) : (
                <TechnicalSmcMatrix
                  scenario={scenario}
                  onUpdateScenario={onUpdateScenario}
                  data={data}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Individual Integration 6-Question Calculator */}
      {editingIntegration && (
        <IntegrationScopingCalculatorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIntegration(null);
          }}
          integration={editingIntegration}
          onSaveIntegration={handleSaveIntegration}
        />
      )}

      {/* MODAL 2: External Structured Table/CSV/JSON Ingest */}
      <IntegrationInventoryIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onApply={handleApplyIngestedInventory}
        currentInventoryCount={integrations.length}
      />

      {/* MODAL 3: Intel Hub Ingestion */}
      <IntelUploadHubModal
        isOpen={isIntelModalOpen}
        onClose={() => setIsIntelModalOpen(false)}
        scenario={scenario}
        onUpdateScenario={onUpdateScenario}
      />
    </div>
  );
};
