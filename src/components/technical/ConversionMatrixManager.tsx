import React, { useState, useMemo } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  ShieldAlert,
  Server,
  FileCheck,
  Percent,
  Plus,
  Trash2,
  FileText,
  Workflow,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  ConversionTShirtSize,
  ConversionEntityItem,
  ConversionArchetype,
  ConversionLoadEngine
} from '../../types';
import {
  CONVERSION_TSHIRT_BENCHMARKS,
  CONVERSION_MOCK_SLIDING_SCALE,
  DEFAULT_CONVERSION_ENTITIES,
  getMockCumulativeMultiplier
} from '../../data/technicalScopingData';

interface ConversionMatrixManagerProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  data: CalculatedProjectData;
}

export const ConversionMatrixManager: React.FC<ConversionMatrixManagerProps> = ({
  scenario,
  onUpdateScenario,
  data
}) => {
  const [activeView, setActiveView] = useState<'lifecycle' | 'entities' | 'matrix' | 'raci'>('lifecycle');
  const [entities, setEntities] = useState<ConversionEntityItem[]>(DEFAULT_CONVERSION_ENTITIES);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<'ALL' | 'ERP' | 'SCM' | 'HCM'>('ALL');
  const [selectedArchetypeFilter, setSelectedArchetypeFilter] = useState<'ALL' | ConversionArchetype>('ALL');

  // Custom Accelerator Discount & Data Debt factors (default: 0% and 0%)
  const [acceleratorDiscountPct, setAcceleratorDiscountPct] = useState<number>(0);
  const [dataDebtUpliftPct, setDataDebtUpliftPct] = useState<number>(0);

  const currentCycles = scenario.scaleDrivers.tech_conversion_cycles !== undefined
    ? Math.max(1, scenario.scaleDrivers.tech_conversion_cycles)
    : 3;
  const currentHistoryYears = scenario.scaleDrivers.tech_historical_years !== undefined
    ? Math.max(0, scenario.scaleDrivers.tech_historical_years)
    : 1;
  const currentObjects = scenario.scaleDrivers.tech_data_objects || entities.length;

  const cumulativeMultiplier = getMockCumulativeMultiplier(currentCycles);
  const conversionMetrics = data.conversionMetrics;

  const handleUpdateCycles = (cycles: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_conversion_cycles: cycles
      }
    }));
  };

  const handleUpdateHistoryYears = (years: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_historical_years: years
      }
    }));
  };

  const handleUpdateObjectCount = (count: number) => {
    const clamped = Math.max(1, count);
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_data_objects: clamped
      }
    }));
  };

  const handleEntityTShirtChange = (entityId: string, size: ConversionTShirtSize) => {
    const benchmark = CONVERSION_TSHIRT_BENCHMARKS[size];
    const updated = entities.map(e => {
      if (e.id === entityId) {
        // Recalculate transparent 3-tier lifecycle baseline hours
        const specBuild = Math.round(benchmark.totalPerMockHours * 0.55);
        const mockCycle = Math.round(benchmark.totalPerMockHours * 0.30);
        const recon = Math.round(benchmark.totalPerMockHours * 0.20);
        return {
          ...e,
          tShirtSize: size,
          specAndBuildHours: specBuild,
          mockCycleHours: mockCycle,
          reconciliationHours: recon
        };
      }
      return e;
    });
    setEntities(updated);
  };

  const handleEntityEngineChange = (entityId: string, engine: ConversionLoadEngine) => {
    setEntities(prev => prev.map(e => e.id === entityId ? { ...e, loadEngine: engine } : e));
  };

  const handleEntityArchetypeChange = (entityId: string, archetype: ConversionArchetype) => {
    setEntities(prev => prev.map(e => e.id === entityId ? { ...e, archetype } : e));
  };

  const tShirtSizes: ConversionTShirtSize[] = ['XS', 'S', 'M', 'L', 'XL'];

  // Filtered entities for catalog
  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchPillar = selectedPillarFilter === 'ALL' || e.pillar === selectedPillarFilter;
      const matchArchetype = selectedArchetypeFilter === 'ALL' || e.archetype === selectedArchetypeFilter;
      return matchPillar && matchArchetype;
    });
  }, [entities, selectedPillarFilter, selectedArchetypeFilter]);

  // Transparent Itemized 3-Tier Lifecycle Computations
  const lifecycleSummary = useMemo(() => {
    let tier1BuildBase = 0;
    let tier2MockBase = 0;
    let tier3ReconBase = 0;

    entities.forEach(ent => {
      const bm = CONVERSION_TSHIRT_BENCHMARKS[ent.tShirtSize];
      const specBuild = ent.specAndBuildHours ?? Math.round(bm.totalPerMockHours * 0.55);
      const mockCycle = ent.mockCycleHours ?? Math.round(bm.totalPerMockHours * 0.30);
      const recon = ent.reconciliationHours ?? Math.round(bm.totalPerMockHours * 0.20);

      tier1BuildBase += specBuild;
      tier2MockBase += mockCycle;
      tier3ReconBase += recon;
    });

    // Apply scaling for mock iterations (Mock sliding scale applies strictly to Tier 2 execution)
    const tier2MockTotal = Math.round(tier2MockBase * cumulativeMultiplier);
    
    // Tier 1 and Tier 3 are one-time lifecycle gates
    const tier1Net = Math.round(tier1BuildBase * (1 - acceleratorDiscountPct / 100));
    const tier3Net = tier3ReconBase;

    // History multiplier: +12% per year
    const historyMultiplier = 1.0 + Math.min(0.50, currentHistoryYears * 0.12);
    
    // Data debt multiplier
    const dataDebtMultiplier = 1.0 + (dataDebtUpliftPct / 100);

    const subtotalRaw = (tier1Net + tier2MockTotal + tier3Net) * historyMultiplier * dataDebtMultiplier;
    const finalP80Estimate = Math.round(subtotalRaw);

    // Grouping by Archetype
    const archetypeBreakdown: Record<ConversionArchetype, { count: number; totalHours: number; buildHours: number; mockHours: number; reconHours: number }> = {
      'Foundation / Setup': { count: 0, totalHours: 0, buildHours: 0, mockHours: 0, reconHours: 0 },
      'Master Data': { count: 0, totalHours: 0, buildHours: 0, mockHours: 0, reconHours: 0 },
      'Open Balances': { count: 0, totalHours: 0, buildHours: 0, mockHours: 0, reconHours: 0 },
      'Transactional History': { count: 0, totalHours: 0, buildHours: 0, mockHours: 0, reconHours: 0 }
    };

    entities.forEach(ent => {
      const arch = ent.archetype || (ent.category === 'Master Data' ? 'Master Data' : ent.category === 'Open Balances' ? 'Open Balances' : 'Transactional History');
      const bm = CONVERSION_TSHIRT_BENCHMARKS[ent.tShirtSize];
      const spec = ent.specAndBuildHours ?? Math.round(bm.totalPerMockHours * 0.55);
      const mock = (ent.mockCycleHours ?? Math.round(bm.totalPerMockHours * 0.30)) * cumulativeMultiplier;
      const recon = ent.reconciliationHours ?? Math.round(bm.totalPerMockHours * 0.20);
      const objTotal = Math.round((spec * (1 - acceleratorDiscountPct / 100) + mock + recon) * historyMultiplier * dataDebtMultiplier);

      if (archetypeBreakdown[arch]) {
        archetypeBreakdown[arch].count += 1;
        archetypeBreakdown[arch].buildHours += Math.round(spec * (1 - acceleratorDiscountPct / 100));
        archetypeBreakdown[arch].mockHours += Math.round(mock);
        archetypeBreakdown[arch].reconHours += recon;
        archetypeBreakdown[arch].totalHours += objTotal;
      }
    });

    return {
      tier1BuildBase,
      tier1Net,
      tier2MockBase,
      tier2MockTotal,
      tier3ReconBase,
      tier3Net,
      historyMultiplier,
      dataDebtMultiplier,
      finalP80Estimate,
      personMonths: (finalP80Estimate / 160).toFixed(1),
      archetypeBreakdown
    };
  }, [entities, cumulativeMultiplier, currentHistoryYears, acceleratorDiscountPct, dataDebtUpliftPct]);

  return (
    <div className="space-y-6">
      {/* Header Banner with Clean Transparency Scope */}
      <div className="bg-slate-900 text-white p-5 rounded-none border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
              Decoupled 3-Tier Lifecycle Sizing
            </span>
            <span className="text-slate-400 text-xs font-mono">
              TBD Oracle Cloud Conversions Engine
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="text-amber-400" size={20} />
            Data Conversion Estimation Tracker
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
            Transparently isolates <strong className="text-white">Tier 1 (One-Time Build & Mapping)</strong> from <strong className="text-white">Tier 2 (Iterative Mock Cycles)</strong> and <strong className="text-white">Tier 3 (Validation & Cutover)</strong> with archetype categorization and clear RACI boundaries.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-none border border-slate-700 bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setActiveView('lifecycle')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'lifecycle'
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Activity size={13} />
              <span>3-Tier Lifecycle</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('entities')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'entities'
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={13} />
              <span>Entity Catalog ({entities.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('matrix')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'matrix'
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp size={13} />
              <span>Mock Sliding Scale</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('raci')}
              className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'raci'
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert size={13} />
              <span>RACI & Guardrails</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Transparent Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-none shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
            Data Objects
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {entities.length}
            </span>
            <span className="text-xs text-slate-500">Entities Sized</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            4 Archetypes (Master, Open, Setup, History)
          </p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-none shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block font-mono">
            Tier 1: Mapping & Build
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-indigo-900">
              {lifecycleSummary.tier1Net}h
            </span>
            <span className="text-xs text-indigo-600 font-mono">One-Time</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {acceleratorDiscountPct > 0 ? `-${acceleratorDiscountPct}% Accelerator Discount applied` : 'Source-to-target mapping & FBDI scripts'}
          </p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-none shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block font-mono">
            Tier 2: Mock Execution
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-blue-900">
              {lifecycleSummary.tier2MockTotal}h
            </span>
            <span className="text-xs text-blue-600 font-mono">{currentCycles} Mocks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sliding scale multiplier: {cumulativeMultiplier.toFixed(2)}x
          </p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-none shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block font-mono">
            Tier 3: Tie-Out & Cutover
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-900">
              {lifecycleSummary.tier3Net}h
            </span>
            <span className="text-xs text-emerald-600 font-mono">Sign-Off</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Reconciliation & production cutover runs
          </p>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-none shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-mono">
            Grand Total Conversion
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-950">
              {lifecycleSummary.finalP80Estimate}h
            </span>
            <span className="text-xs font-mono font-bold text-amber-800">
              ({lifecycleSummary.personMonths} PM)
            </span>
          </div>
          <p className="text-[11px] text-amber-900 mt-1">
            Includes history factor (x{lifecycleSummary.historyMultiplier.toFixed(2)})
          </p>
        </div>
      </div>

      {/* VIEW 1: 3-TIER LIFECYCLE BREAKDOWN & ARCHETYPE MATRIX */}
      {activeView === 'lifecycle' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Accelerator & Data Debt Adjusters */}
          <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                Estimation Levers & Transparency Calibration
              </span>
              <p className="text-xs text-slate-500">
                Adjust tooling accelerators or client data debt without obscuring baseline calculations.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Tooling Accelerator Discount */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-700">Tooling Accelerator:</span>
                {[0, 15, 25, 35].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setAcceleratorDiscountPct(pct)}
                    className={`px-2 py-0.5 text-xs font-mono font-bold transition cursor-pointer border ${
                      acceleratorDiscountPct === pct
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 0 ? '0%' : `-${pct}%`}
                  </button>
                ))}
              </div>

              {/* Data Debt Uplift */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-700">Data Debt Uplift:</span>
                {[0, 15, 30].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDataDebtUpliftPct(pct)}
                    className={`px-2 py-0.5 text-xs font-mono font-bold transition cursor-pointer border ${
                      dataDebtUpliftPct === pct
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 0 ? 'None' : `+${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Lifecycle Tiers Visual Decomposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TIER 1 */}
            <div className="bg-white border-2 border-indigo-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold uppercase border border-indigo-200">
                    Tier 1 • One-Time
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Mapping, FBDI Build & Transform Logic
                  </h4>
                </div>
                <span className="text-xl font-bold font-mono text-indigo-800">
                  {lifecycleSummary.tier1Net}h
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Executed once per entity. Covers Source-to-Target mapping specifications, legacy staging table creation, validation scripts, and custom data transformation routines.
              </p>
              <div className="bg-slate-50 p-2.5 border border-slate-200 text-[11px] space-y-1 font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Baseline:</span>
                  <span className="font-bold">{lifecycleSummary.tier1BuildBase} hrs</span>
                </div>
                {acceleratorDiscountPct > 0 && (
                  <div className="flex justify-between text-indigo-600 font-bold">
                    <span>Accelerator Discount (-{acceleratorDiscountPct}%):</span>
                    <span>-{lifecycleSummary.tier1BuildBase - lifecycleSummary.tier1Net} hrs</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Net Tier 1 Deliverable:</span>
                  <span>{lifecycleSummary.tier1Net} hrs</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-indigo-600" />
                <span>Does not repeat across mock cycles.</span>
              </div>
            </div>

            {/* TIER 2 */}
            <div className="bg-white border-2 border-blue-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[10px] font-bold uppercase border border-blue-200">
                    Tier 2 • Iterative
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Mock Staging & Rehearsal Runs
                  </h4>
                </div>
                <span className="text-xl font-bold font-mono text-blue-800">
                  {lifecycleSummary.tier2MockTotal}h
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scaled across <strong className="text-slate-900">{currentCycles} mock rehearsal cycles</strong>. Governed by the TBD 4-tier sliding scale as exception rates drop with each iteration.
              </p>
              <div className="bg-slate-50 p-2.5 border border-slate-200 text-[11px] space-y-1 font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Per-Mock Baseline:</span>
                  <span className="font-bold">{lifecycleSummary.tier2MockBase} hrs / run</span>
                </div>
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>Sliding Multiplier ({currentCycles} Mocks):</span>
                  <span>{cumulativeMultiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Total Tier 2 Effort:</span>
                  <span>{lifecycleSummary.tier2MockTotal} hrs</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-blue-600" />
                <span>Mock 1 (100%) → Mock 2 (80%) → Mock 3 (60%)</span>
              </div>
            </div>

            {/* TIER 3 */}
            <div className="bg-white border-2 border-emerald-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold uppercase border border-emerald-200">
                    Tier 3 • Governance
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Validation, Tie-Out & Cutover Runs
                  </h4>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-800">
                  {lifecycleSummary.tier3Net}h
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated database reconciliation tie-outs (record counts, debit/credit hashes, balance sheet cross-checks) and final production cutover dry-run execution.
              </p>
              <div className="bg-slate-50 p-2.5 border border-slate-200 text-[11px] space-y-1 font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Automated Tie-Outs:</span>
                  <span className="font-bold">{Math.round(lifecycleSummary.tier3Net * 0.6)} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Cutover Dry Run Support:</span>
                  <span className="font-bold">{Math.round(lifecycleSummary.tier3Net * 0.4)} hrs</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Total Tier 3 Effort:</span>
                  <span>{lifecycleSummary.tier3Net} hrs</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Provides auditable business sign-off.</span>
              </div>
            </div>
          </div>

          {/* Archetype Sizing Table */}
          <div className="bg-white border border-slate-200 rounded-none shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-slate-700" />
                  Conversion Effort by Data Archetype
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clear segmentation prevents lumping simple setup lookups with multi-year transactional ledger histories.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                    <th className="p-2.5 border-r border-slate-200">Data Archetype</th>
                    <th className="p-2.5 w-20 text-center border-r border-slate-200">Objects</th>
                    <th className="p-2.5 border-r border-slate-200">Typical Scope & Complexity Drivers</th>
                    <th className="p-2.5 w-28 text-center border-r border-slate-200">Tier 1: Build</th>
                    <th className="p-2.5 w-28 text-center border-r border-slate-200">Tier 2: Mocks</th>
                    <th className="p-2.5 w-28 text-center border-r border-slate-200">Tier 3: Tie-Out</th>
                    <th className="p-2.5 w-32 text-center font-bold text-slate-900">Total Defensible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(Object.keys(lifecycleSummary.archetypeBreakdown) as ConversionArchetype[]).map(archetype => {
                    const stats = lifecycleSummary.archetypeBreakdown[archetype];
                    return (
                      <tr key={archetype} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100 font-mono">
                          <span className={`px-2 py-0.5 text-xs border inline-block ${
                            archetype === 'Foundation / Setup' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            archetype === 'Master Data' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            archetype === 'Open Balances' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {archetype}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                          {stats.count}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">
                          {archetype === 'Foundation / Setup' && 'Lookups, payment terms, tax codes, COA values. Low mapping; rapid spreadsheet loader.'}
                          {archetype === 'Master Data' && 'Suppliers, Customers, Items, Fixed Assets, Employees. Hierarchical relations, deduplication.'}
                          {archetype === 'Open Balances' && 'Open AP/AR invoices, Open POs/SOs, Inventory on-hand. Multi-table cutover freeze dependencies.'}
                          {archetype === 'Transactional History' && 'Multi-year closed GL trial balances, subledger histories. Obsolete legacy COA mapping.'}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-700 border-r border-slate-100">
                          {stats.buildHours} hrs
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-700 border-r border-slate-100">
                          {stats.mockHours} hrs
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">
                          {stats.reconHours} hrs
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                          {stats.totalHours} hrs
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

      {/* VIEW 2: GRANULAR ENTITY CATALOG */}
      {activeView === 'entities' && (
        <div className="bg-white border border-slate-200 rounded-none shadow-xs p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-slate-700" />
                Data Entities Catalog & Transparent Lifecycle Sizing
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every entity displays its loading tool, archetype, and decoupled Tier 1, Tier 2, and Tier 3 hours.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-500 px-1.5 uppercase">Pillar:</span>
                {(['ALL', 'ERP', 'SCM', 'HCM'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPillarFilter(p)}
                    className={`px-2 py-0.5 text-xs font-mono font-bold transition cursor-pointer ${
                      selectedPillarFilter === p
                        ? 'bg-slate-900 text-white'
                        : 'bg-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setEntities(DEFAULT_CONVERSION_ENTITIES)}
                className="px-2.5 py-1 text-xs font-mono font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                  <th className="p-2.5 w-10 text-center border-r border-slate-200">#</th>
                  <th className="p-2.5 w-16 border-r border-slate-200">Pillar</th>
                  <th className="p-2.5 min-w-[220px] border-r border-slate-200">Entity & Target Oracle Loader</th>
                  <th className="p-2.5 w-36 border-r border-slate-200">Archetype</th>
                  <th className="p-2.5 w-28 border-r border-slate-200">Tool</th>
                  <th className="p-2.5 w-36 text-center border-r border-slate-200">T-Shirt</th>
                  <th className="p-2.5 w-20 text-center border-r border-slate-200 font-mono text-indigo-700">Tier 1 Build</th>
                  <th className="p-2.5 w-24 text-center border-r border-slate-200 font-mono text-blue-700">Tier 2 ({currentCycles} Mocks)</th>
                  <th className="p-2.5 w-20 text-center border-r border-slate-200 font-mono text-emerald-700">Tier 3 Recon</th>
                  <th className="p-2.5 w-24 text-center font-mono font-bold text-slate-900">Total Defensible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredEntities.map((entity, idx) => {
                  const benchmark = CONVERSION_TSHIRT_BENCHMARKS[entity.tShirtSize];
                  const tier1Hrs = Math.round((entity.specAndBuildHours ?? Math.round(benchmark.totalPerMockHours * 0.55)) * (1 - acceleratorDiscountPct / 100));
                  const tier2Single = entity.mockCycleHours ?? Math.round(benchmark.totalPerMockHours * 0.30);
                  const tier2Multi = Math.round(tier2Single * cumulativeMultiplier);
                  const tier3Hrs = entity.reconciliationHours ?? Math.round(benchmark.totalPerMockHours * 0.20);
                  const totalHrs = tier1Hrs + tier2Multi + tier3Hrs;

                  return (
                    <tr key={entity.id} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-400 border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 border-r border-slate-100 font-mono">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                          entity.pillar === 'ERP' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          entity.pillar === 'SCM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {entity.pillar}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {entity.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Target: {entity.targetFBDI}
                          </p>
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-100">
                        <select
                          value={entity.archetype || 'Master Data'}
                          onChange={(e) => handleEntityArchetypeChange(entity.id, e.target.value as ConversionArchetype)}
                          className="w-full text-[11px] p-1 border border-slate-200 bg-white font-mono rounded-none"
                        >
                          <option value="Foundation / Setup">Foundation / Setup</option>
                          <option value="Master Data">Master Data</option>
                          <option value="Open Balances">Open Balances</option>
                          <option value="Transactional History">Transactional History</option>
                        </select>
                      </td>
                      <td className="p-2.5 border-r border-slate-100">
                        <select
                          value={entity.loadEngine || 'FBDI'}
                          onChange={(e) => handleEntityEngineChange(entity.id, e.target.value as ConversionLoadEngine)}
                          className="w-full text-[11px] p-1 border border-slate-200 bg-white font-mono rounded-none"
                        >
                          <option value="FBDI">FBDI</option>
                          <option value="HDL">HDL</option>
                          <option value="HSDL">HSDL</option>
                          <option value="REST API / ADFdi">REST API / ADFdi</option>
                          <option value="Manual / CSV">Manual / CSV</option>
                        </select>
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {tShirtSizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleEntityTShirtChange(entity.id, sz)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold transition cursor-pointer border ${
                                entity.tShirtSize === sz
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center font-mono font-bold text-indigo-700">
                        {tier1Hrs}h
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center font-mono font-bold text-blue-700">
                        {tier2Multi}h
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center font-mono font-bold text-emerald-700">
                        {tier3Hrs}h
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                        {totalHrs}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: MOCK SLIDING SCALE & BENCHMARK MATRIX */}
      {activeView === 'matrix' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Mock Selector Strip */}
          <div className="bg-white border border-slate-200 rounded-none shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-600" />
                  TBD 4-Tier Mock Sliding Scale Progression
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Effort diminishes across iterative load cycles as mapping rules, cleansing routines, and data staging stabilize.
                </p>
              </div>

              {/* Mock Cycle Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 border border-slate-200">
                <span className="text-[10px] font-bold font-mono uppercase text-slate-600 px-2">Cycle Count:</span>
                {[1, 2, 3, 4, 5].map((cycles) => (
                  <button
                    key={cycles}
                    type="button"
                    onClick={() => handleUpdateCycles(cycles)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold transition cursor-pointer border ${
                      currentCycles === cycles
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cycles} {cycles === 1 ? 'Mock' : 'Mocks'}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Tier Visual Progression Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CONVERSION_MOCK_SLIDING_SCALE.map((scaleItem) => {
                const isActive = currentCycles >= scaleItem.mock;
                const isCurrentBoundary = currentCycles === scaleItem.mock;
                const mockHours = conversionMetrics?.mockSlidingBreakdown?.find(m => m.mockNumber === scaleItem.mock)?.hours || Math.round(currentObjects * 45 * scaleItem.percentage);

                return (
                  <div
                    key={scaleItem.mock}
                    className={`p-4 border transition-all relative ${
                      isActive
                        ? isCurrentBoundary
                          ? 'bg-amber-50/50 border-amber-400 ring-1 ring-amber-400'
                          : 'bg-slate-50 border-slate-300'
                        : 'bg-slate-50/30 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {scaleItem.name}
                      </span>
                      <span className={`text-xs font-mono font-bold ${
                        isActive ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {scaleItem.label}
                      </span>
                    </div>

                    <div className="my-2">
                      <span className="text-xl font-bold font-mono text-slate-900 block">
                        {mockHours} hrs
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ~{Math.round(mockHours / currentObjects)}h / object
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
                      {scaleItem.description}
                    </p>

                    {isActive && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Status: Included</span>
                        <CheckCircle2 size={12} className="text-emerald-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* History Depth Modifier */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Historical Data Depth Factor:</span>
                  <span className="text-slate-500 ml-1.5">
                    Adds +12% per year of historical ledger/transaction extraction.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 5].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => handleUpdateHistoryYears(years)}
                    className={`px-2 py-1 text-xs font-mono font-bold transition cursor-pointer border ${
                      currentHistoryYears === years
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {years === 0 ? 'Current Only' : `${years} Yr${years > 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: RACI BOUNDARIES & DATA GOVERNANCE GUARDRAILS */}
      {activeView === 'raci' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-none shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600" />
                Conversion RACI & Ownership Governance
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Clearly defined boundaries eliminate scope creep and protect implementation delivery timelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Responsibilities */}
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Client Core Responsibilities
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0 mt-0.5" />
                    <span><strong>Legacy Data Extraction:</strong> Extracting clean source files from legacy databases, ERPs, and spreadsheets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0 mt-0.5" />
                    <span><strong>Data Cleansing & Deduplication:</strong> Eliminating obsolete suppliers, duplicate customer sites, and inactive items prior to Mock 1.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0 mt-0.5" />
                    <span><strong>Business Exception Sign-Off:</strong> Reviewing and approving rejected records and error exception logs within 48 hours of mock completion.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0 mt-0.5" />
                    <span><strong>Post-Load Financial Reconciliation:</strong> Formally signing off on subledger balances and trial balance cutover totals.</span>
                  </li>
                </ul>
              </div>

              {/* SI Responsibilities */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 space-y-3">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Implementation Partner (SI) Responsibilities
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>FBDI / HDL Templates:</strong> Providing standardized, field-validated Oracle Cloud data collection templates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Transformation Staging Logic:</strong> Building automated transformation rules, cross-reference lookups, and load pipelines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Mock Execution & Exception Reporting:</strong> Running batch imports in DEV/TEST environments and publishing structured error logs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Cutover Execution Support:</strong> Executing production data loads during the cutover weekend according to the runbook.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
