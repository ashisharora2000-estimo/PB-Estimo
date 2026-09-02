import React, { useState } from 'react';
import { TShirtSize } from '../../types';
import {
  WbsActivityItem,
  ModuleIntrinsicConfig,
  RicefwMasterConfig,
  ScaleDriverStepCurveItem,
  calculateWbsTotalHours,
  calculateModuleIntrinsicMultiplier,
  calculateRicefwUnitTotal,
  calculateStepCurveMarginalHours
} from '../../data/benchmarkMasterData';
import {
  Layers,
  Sparkles,
  Code2,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Target
} from 'lucide-react';

interface WbsSizingLayersTabProps {
  wbsActivities: WbsActivityItem[];
  moduleIntrinsicConfigs: Record<string, ModuleIntrinsicConfig>;
  ricefwConfig: RicefwMasterConfig;
  stepCurves: ScaleDriverStepCurveItem[];
  viewPerspective: 'catalog' | 'scope' | 'architect';
  scopedModuleList: any[];
  totalScopedWbsHours: number;
  scopedWbsPhaseBreakdown: any[];
  scopedRicefwInventory: { items: any[]; grandTotal: number };
  scopedStepCurves: {
    curvesWithSavings: any[];
    totalMarginalHours: number;
    totalLinearHours: number;
    totalEfficiencySavingsHours: number;
  };
  onWbsHourChange: (activityId: string, size: TShirtSize, newHours: number) => void;
  onToggleModuleFeature: (moduleId: string, featureId: string) => void;
  onFeatureWeightChange: (moduleId: string, featureId: string, newWeight: number) => void;
  onRicefwHourChange: (patternId: string, field: 'specDesignHours' | 'buildConfigHours' | 'testingHours' | 'cutoverRehearsalHours', newVal: number) => void;
}

export const WbsSizingLayersTab: React.FC<WbsSizingLayersTabProps> = ({
  wbsActivities,
  moduleIntrinsicConfigs,
  ricefwConfig,
  stepCurves,
  viewPerspective,
  scopedModuleList,
  totalScopedWbsHours,
  scopedWbsPhaseBreakdown,
  scopedRicefwInventory,
  scopedStepCurves,
  onWbsHourChange,
  onToggleModuleFeature,
  onFeatureWeightChange,
  onRicefwHourChange
}) => {
  const [activeLayer, setActiveLayer] = useState<'layer1_wbs' | 'layer2_complexity' | 'layer3_ricefw' | 'layer4_stepcurves'>('layer1_wbs');
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [selectedRicefwCategory, setSelectedRicefwCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ erp_gl: true, erp_ap: true, hcm_payroll: true });

  // Step curve simulator state
  const [simDriverKey, setSimDriverKey] = useState<string>('fin_led');
  const [simQty, setSimQty] = useState<number>(4);
  const [simIsSharedServices, setSimIsSharedServices] = useState<boolean>(true);

  const tShirtSizes: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const wbsTotals = calculateWbsTotalHours(wbsActivities);

  // Filter modules for Layer 2
  const moduleList: ModuleIntrinsicConfig[] = Object.values(moduleIntrinsicConfigs);
  const filteredModules = moduleList.filter(cfg => {
    if (!cfg) return false;
    if (selectedPillar !== 'ALL' && cfg.pillar !== selectedPillar) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return cfg.moduleName.toLowerCase().includes(q) || cfg.moduleId.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter RICEFW Patterns for Layer 3
  const filteredRicefw = ricefwConfig.patterns.filter(p => {
    if (selectedRicefwCategory !== 'ALL' && p.category !== selectedRicefwCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.techStack.toLowerCase().includes(q);
    }
    return true;
  });

  const currentSimCurve = stepCurves.find(c => c.driverKey === simDriverKey) || stepCurves[0];
  const simResult = calculateStepCurveMarginalHours(currentSimCurve, simQty, simIsSharedServices);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 4-Layer Sub-menu Header */}
      <div className="bg-white p-3.5 rounded-sm border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveLayer('layer1_wbs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xs transition cursor-pointer ${
              activeLayer === 'layer1_wbs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers size={14} />
            Layer 1: Task WBS Matrix
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('layer2_complexity')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xs transition cursor-pointer ${
              activeLayer === 'layer2_complexity'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles size={14} />
            Layer 2: Intrinsic Modifiers
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('layer3_ricefw')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xs transition cursor-pointer ${
              activeLayer === 'layer3_ricefw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code2 size={14} />
            Layer 3: RICEFW Catalog
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('layer4_stepcurves')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xs transition cursor-pointer ${
              activeLayer === 'layer4_stepcurves'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp size={14} />
            Layer 4: Step-Curves
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search layer items..."
              className="pl-8 pr-3 py-1 text-xs rounded-xs border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* LAYER 1: TASK WBS MATRIX                                               */}
      {/* ====================================================================== */}
      {activeLayer === 'layer1_wbs' && (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Task Work Breakdown Structure (WBS) Baseline Hours
              </h4>
              <p className="text-[11px] text-slate-500">
                Calibrate mandatory task hours across standard Oracle implementation phases for each T-shirt size.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-xs border border-slate-200">
              240h XS Gold-Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3">WBS Activity & Phase</th>
                  {tShirtSizes.map(sz => (
                    <th key={sz} className="py-2.5 px-2 text-right font-mono">
                      {sz} ({wbsTotals[sz]}h)
                    </th>
                  ))}
                  <th className="py-2.5 px-3 min-w-[200px]">Methodology Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {wbsActivities.map(act => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 align-top">
                      <div className="font-bold text-slate-900">{act.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{act.phaseName} ({act.phaseCode})</div>
                    </td>

                    {tShirtSizes.map(sz => (
                      <td key={sz} className="py-2.5 px-2 align-top text-right font-mono">
                        <input
                          type="number"
                          min={0}
                          value={act.hoursByTShirt[sz] || 0}
                          onChange={e => onWbsHourChange(act.id, sz, Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
                        />
                      </td>
                    ))}

                    <td className="py-2.5 px-3 align-top text-slate-600 text-[11px]">
                      {act.tcmRationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* LAYER 2: INTRINSIC COMPLEXITY MODIFIERS                                */}
      {/* ====================================================================== */}
      {activeLayer === 'layer2_complexity' && (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Module Intrinsic Multipliers & Architectural Features
              </h4>
              <p className="text-[11px] text-slate-500">
                Enable architectural features and adjust percentage weights to calibrate intrinsic complexity per module.
              </p>
            </div>

            <div className="flex items-center gap-1">
              {['ALL', 'ERP', 'SCM', 'HCM', 'EPM'].map(pil => (
                <button
                  key={pil}
                  type="button"
                  onClick={() => setSelectedPillar(pil)}
                  className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition cursor-pointer ${
                    selectedPillar === pil ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pil}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredModules.map(cfg => {
              const multiplier = calculateModuleIntrinsicMultiplier(cfg);
              const isExpanded = expandedModules[cfg.moduleId] ?? false;

              return (
                <div key={cfg.moduleId} className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setExpandedModules(prev => ({ ...prev, [cfg.moduleId]: !isExpanded }))}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
                      <div>
                        <span className="font-bold text-xs text-slate-900">{cfg.moduleName}</span>
                        <span className="ml-2 px-1.5 py-0.2 rounded-xs text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                          {cfg.pillar}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Intrinsic Multiplier:</span>
                      <span className="px-2 py-0.5 rounded-xs bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono font-bold text-xs">
                        {multiplier.toFixed(2)}x
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {cfg.features.map(feat => (
                          <div key={feat.id} className="p-2.5 rounded-xs bg-white border border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={feat.isEnabled}
                                onChange={() => onToggleModuleFeature(cfg.moduleId, feat.id)}
                                className="mt-0.5 rounded-xs border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-800">{feat.name}</div>
                                <div className="text-[10px] text-slate-400">{feat.description || feat.rationale}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 font-mono text-xs">
                              <input
                                type="number"
                                min={0}
                                max={50}
                                value={feat.weightPct}
                                onChange={e => onFeatureWeightChange(cfg.moduleId, feat.id, Number(e.target.value))}
                                className="w-12 px-1 py-0.5 text-right font-mono font-bold border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
                              />
                              <span className="text-slate-400 text-[11px]">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* LAYER 3: RICEFW DELIVERABLE UNIT CATALOG                               */}
      {/* ====================================================================== */}
      {activeLayer === 'layer3_ricefw' && (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                RICEFW Deliverable Unit Catalog & Phase Breakdown
              </h4>
              <p className="text-[11px] text-slate-500">
                Calibrate unit engineering hours across Spec & Design, Build & Config, SIT Testing, and Cutover Rehearsal.
              </p>
            </div>

            <div className="flex items-center gap-1">
              {['ALL', 'Interface', 'Report', 'Conversion', 'Extension', 'Workflow'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedRicefwCategory(cat)}
                  className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition cursor-pointer ${
                    selectedRicefwCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-3">Deliverable Unit & Tech Stack</th>
                  <th className="py-2.5 px-2 text-right">Spec (hrs)</th>
                  <th className="py-2.5 px-2 text-right">Build (hrs)</th>
                  <th className="py-2.5 px-2 text-right">SIT (hrs)</th>
                  <th className="py-2.5 px-2 text-right">Cutover (hrs)</th>
                  <th className="py-2.5 px-2 text-right font-mono">Total Unit Hours</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Technical Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRicefw.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 align-top">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.techStack} • {p.category}</div>
                    </td>

                    <td className="py-2.5 px-2 align-top text-right font-mono">
                      <input
                        type="number"
                        min={0}
                        value={p.specDesignHours}
                        onChange={e => onRicefwHourChange(p.id, 'specDesignHours', Number(e.target.value))}
                        className="w-14 px-1 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                      />
                    </td>

                    <td className="py-2.5 px-2 align-top text-right font-mono">
                      <input
                        type="number"
                        min={0}
                        value={p.buildConfigHours}
                        onChange={e => onRicefwHourChange(p.id, 'buildConfigHours', Number(e.target.value))}
                        className="w-14 px-1 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                      />
                    </td>

                    <td className="py-2.5 px-2 align-top text-right font-mono">
                      <input
                        type="number"
                        min={0}
                        value={p.testingHours}
                        onChange={e => onRicefwHourChange(p.id, 'testingHours', Number(e.target.value))}
                        className="w-14 px-1 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                      />
                    </td>

                    <td className="py-2.5 px-2 align-top text-right font-mono">
                      <input
                        type="number"
                        min={0}
                        value={p.cutoverRehearsalHours}
                        onChange={e => onRicefwHourChange(p.id, 'cutoverRehearsalHours', Number(e.target.value))}
                        className="w-14 px-1 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                      />
                    </td>

                    <td className="py-2.5 px-2 align-top text-right font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {p.totalUnitHours} hrs
                      </span>
                    </td>

                    <td className="py-2.5 px-3 align-top text-slate-600 text-[11px]">
                      {p.tcmRationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* LAYER 4: FUNCTIONAL SCALE STEP-CURVES                                  */}
      {/* ====================================================================== */}
      {activeLayer === 'layer4_stepcurves' && (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Functional Scale Driver Non-Linear Step-Curves
              </h4>
              <p className="text-[11px] text-slate-500">
                Calibrated marginal efficiency curves preventing linear over-estimation as physical volume scales.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-xs border border-amber-200">
              Diminishing Marginal Hours
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stepCurves.map(curve => (
              <div key={curve.driverKey} className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{curve.driverName}</span>
                  <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded-xs text-slate-700">
                    Base: {curve.baseIncludedQty} included
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{curve.rationale}</p>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tiers:</div>
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                    {curve.stepTiers.map((tier, tIdx) => (
                      <div key={tIdx} className="p-1.5 rounded-xs bg-white border border-slate-200 text-center">
                        <div className="text-slate-400 text-[10px]">Tier {tIdx + 1}</div>
                        <div className="font-bold text-slate-800">{tier.incrementalHoursPerUnit}h/unit</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
