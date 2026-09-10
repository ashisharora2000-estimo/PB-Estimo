import React, { useState, useMemo, useEffect } from 'react';
import {
  ProjectScenario,
  CalculatedProjectData,
  TShirtSize
} from '../../types';
import {
  DEFAULT_WBS_ACTIVITIES,
  DEFAULT_MODULE_INTRINSIC_CONFIGS,
  DEFAULT_RICEFW_PATTERNS,
  DEFAULT_SCALE_STEP_CURVES,
  DEFAULT_ROLE_RATE_CARDS,
  DEFAULT_DELIVERY_PYRAMIDS,
  DEFAULT_PHASE_STAFFING_RULES,
  DEFAULT_WORKSTREAM_STAFFING_RULES,
  DEFAULT_COMMERCIAL_GOVERNANCE,
  CALIBRATION_PROFILES,
  EstimationBenchmarkMasterConfig,
  RoleRateCardItem,
  PhaseStaffingMixRule,
  WorkstreamStaffingMixRule,
  CommercialGovernanceConfig,
  calculateWbsTotalHours,
  calculateModuleIntrinsicMultiplier,
  calculateRicefwUnitTotal,
  calculateStepCurveMarginalHours,
  calculateMasterBlendedRate
} from '../../data/benchmarkMasterData';
import { RateCardsTab } from '../benchmark/RateCardsTab';
import { DeliveryPyramidsTab } from '../benchmark/DeliveryPyramidsTab';
import { PhaseWorkstreamTab } from '../benchmark/PhaseWorkstreamTab';
import { CommercialGovernanceTab } from '../benchmark/CommercialGovernanceTab';
import { WbsSizingLayersTab } from '../benchmark/WbsSizingLayersTab';
import { TraceabilityMatrixTab } from '../benchmark/TraceabilityMatrixTab';
import {
  RotateCcw,
  Save,
  Layers,
  Sparkles,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  Target,
  Compass,
  ShieldCheck,
  Check,
  Sliders,
  GitBranch,
  Scale,
  FileCheck,
  Briefcase,
  Layers as LayersIcon
} from 'lucide-react';

interface BenchmarkMasterViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onNavigateTab?: (tab: any) => void;
}

export type BenchmarkMasterTab =
  | 'rates'
  | 'pyramids'
  | 'phases_workstreams'
  | 'commercials'
  | 'wbs_sizing'
  | 'traceability'
  // Backwards compatibility for any legacy callers
  | 'wbs'
  | 'complexity_modifier'
  | 'ricefw'
  | 'functional_modifier';

export type BenchmarkViewPerspective =
  | 'catalog'      // Full Master Benchmark Catalog (Baseline Calibration)
  | 'scope'        // As-of Active Project Scope (Applied to selected modules & physical drivers)
  | 'architect';   // As-of Solution Architect (Architectural sizing, ARB governance & cross-pillar blueprints)

export const BenchmarkMasterView: React.FC<BenchmarkMasterViewProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  // Local active master configuration
  const initialConfig: EstimationBenchmarkMasterConfig = useMemo(() => {
    const base = scenario.benchmarkMasterConfig || CALIBRATION_PROFILES.oracle_tcm_standard;
    return {
      ...base,
      wbsActivities: base.wbsActivities || DEFAULT_WBS_ACTIVITIES,
      moduleIntrinsicConfigs: base.moduleIntrinsicConfigs || DEFAULT_MODULE_INTRINSIC_CONFIGS,
      ricefwMasterConfig: base.ricefwMasterConfig || {
        patterns: DEFAULT_RICEFW_PATTERNS,
        oicAcceleratorDiscountPct: 35,
        legacyDataDirtyPenaltyPct: 25
      },
      scaleDriverStepCurves: base.scaleDriverStepCurves || DEFAULT_SCALE_STEP_CURVES,
      roleRateCards: base.roleRateCards || DEFAULT_ROLE_RATE_CARDS,
      deliveryPyramids: base.deliveryPyramids || DEFAULT_DELIVERY_PYRAMIDS,
      activeDeliveryPyramidId: base.activeDeliveryPyramidId || 'pyramid_gdm_standard',
      phaseStaffingRules: base.phaseStaffingRules || DEFAULT_PHASE_STAFFING_RULES,
      workstreamStaffingRules: base.workstreamStaffingRules || DEFAULT_WORKSTREAM_STAFFING_RULES,
      commercialGovernance: base.commercialGovernance || DEFAULT_COMMERCIAL_GOVERNANCE,
      enableStepCurveScaling: base.enableStepCurveScaling !== false,
      enableRicefwCatalogPricing: base.enableRicefwCatalogPricing !== false
    };
  }, [scenario.benchmarkMasterConfig]);

  const [activeConfig, setActiveConfig] = useState<EstimationBenchmarkMasterConfig>(initialConfig);
  const [selectedTab, setSelectedTab] = useState<BenchmarkMasterTab>('rates');
  const [viewPerspective, setViewPerspective] = useState<BenchmarkViewPerspective>('catalog');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Synchronize activeConfig whenever scenario or its master configuration changes (e.g., switching bids)
  useEffect(() => {
    setActiveConfig(initialConfig);
  }, [initialConfig]);

  // Derived WBS totals across T-Shirt sizes
  const wbsTotals = useMemo(() => {
    return calculateWbsTotalHours(activeConfig.wbsActivities);
  }, [activeConfig.wbsActivities]);

  // Derived Active Scope Data
  const inScopeModuleIds = useMemo(() => new Set(scenario.selectedModules || []), [scenario.selectedModules]);

  const scopedModuleList = useMemo(() => {
    return (scenario.selectedModules || []).map(mId => {
      const estimate = data.moduleEstimates?.find(e => e.moduleId === mId);
      const modConfig = activeConfig.moduleIntrinsicConfigs[mId] || DEFAULT_MODULE_INTRINSIC_CONFIGS[mId];
      const intrinsicMultiplier = modConfig ? calculateModuleIntrinsicMultiplier(modConfig) : 1.0;
      const tShirt = estimate?.tShirtSize || 'M';
      const baseWbsForSize = wbsTotals[tShirt] || 600;
      const adjustedHours = Math.round(baseWbsForSize * intrinsicMultiplier);

      return {
        moduleId: mId,
        moduleName: estimate?.moduleName || mId.toUpperCase().replace('_', ' '),
        pillar: estimate?.pillar || 'ERP',
        tShirtSize: tShirt,
        baseWbsHours: baseWbsForSize,
        intrinsicMultiplier,
        activeFeaturesCount: modConfig ? modConfig.features.filter(f => f.isEnabled).length : 0,
        totalFeaturesCount: modConfig ? modConfig.features.length : 0,
        adjustedHours,
        finalP80Hours: estimate?.finalP80Hours || adjustedHours
      };
    });
  }, [scenario.selectedModules, data.moduleEstimates, activeConfig.moduleIntrinsicConfigs, wbsTotals]);

  const totalScopedWbsHours = useMemo(() => {
    return scopedModuleList.reduce((acc, m) => acc + m.baseWbsHours, 0);
  }, [scopedModuleList]);

  const scopedWbsPhaseBreakdown = useMemo(() => {
    return activeConfig.wbsActivities.map(act => {
      let phaseTotalHours = 0;
      scopedModuleList.forEach(mod => {
        const sizeHours = act.hoursByTShirt[mod.tShirtSize] || 0;
        phaseTotalHours += sizeHours;
      });

      return {
        id: act.id,
        name: act.name,
        phaseCode: act.phaseCode,
        phaseName: act.phaseName,
        totalScopedHours: phaseTotalHours,
        pctOfWbs: scopedModuleList.length > 0 ? (phaseTotalHours / Math.max(1, totalScopedWbsHours)) * 100 : 0
      };
    });
  }, [activeConfig.wbsActivities, scopedModuleList, totalScopedWbsHours]);

  const scopedRicefwInventory = useMemo(() => {
    const s = scenario.scaleDrivers;
    const items = [
      {
        category: 'Interface',
        name: 'OIC Cloud Integrations',
        techStack: 'Oracle Integration Cloud (OIC Gen3)',
        qty: s.tech_oic || 0,
        unitHours: 115,
        totalHours: (s.tech_oic || 0) * 115,
        desc: 'Inbound REST APIs, Outbound BICC extracts & Bi-directional real-time feeds'
      },
      {
        category: 'Extension',
        name: 'PaaS VBCS Extensions',
        techStack: 'Visual Builder (VBCS) / OCI Functions',
        qty: s.tech_paas || 0,
        unitHours: 170,
        totalHours: (s.tech_paas || 0) * 170,
        desc: 'Custom UI extensions, Redwood lookups & complex validation business rules'
      },
      {
        category: 'Report',
        name: 'BI Publisher (BIP) Reports',
        techStack: 'Pixel-Perfect BI Publisher / Data Models',
        qty: (s as any).tech_reports_bip ?? 12,
        unitHours: 48,
        totalHours: ((s as any).tech_reports_bip ?? 12) * 48,
        desc: 'Statutory financial printouts, check templates, PO PDFs & compliance schedules'
      },
      {
        category: 'Report',
        name: 'OTBI Strategic Dashboards',
        techStack: 'Oracle Transactional BI Subject Areas',
        qty: (s as any).tech_reports_otbi ?? 25,
        unitHours: 24,
        totalHours: ((s as any).tech_reports_otbi ?? 25) * 24,
        desc: 'Interactive operational dashboards, aging analyses & real-time drilldowns'
      },
      {
        category: 'Workflow',
        name: 'Fast Formulas & Rules',
        techStack: 'FastFormula & Accounting Derivations',
        qty: (s as any).tech_fast_formulas ?? 8,
        unitHours: 42,
        totalHours: ((s as any).tech_fast_formulas ?? 8) * 42,
        desc: 'Custom payroll calculation formulas, SLA journal derivation & bonus rules'
      },
      {
        category: 'Workflow',
        name: 'BPM Approval Matrices',
        techStack: 'BPM Workflow Rules & Approval Groups',
        qty: (s as any).tech_bpm_approval_groups ?? 4,
        unitHours: 55,
        totalHours: ((s as any).tech_bpm_approval_groups ?? 4) * 55,
        desc: 'Multi-tiered supervisory approvals, PO sign-offs & journal voucher routes'
      },
      {
        category: 'Conversion',
        name: 'Legacy Data Migration Objects',
        techStack: 'FBDI / HDL Pipelines & Reconciliation',
        qty: s.tech_data_objects || 12,
        unitHours: 120,
        totalHours: (s.tech_data_objects || 12) * 120,
        desc: 'Automated data migration pipelines across 3 mock dry runs with reconciliation'
      }
    ];

    const grandTotal = items.reduce((acc, it) => acc + it.totalHours, 0);
    return { items, grandTotal };
  }, [scenario.scaleDrivers]);

  const scopedStepCurves = useMemo(() => {
    const s = scenario.scaleDrivers;
    const curves = activeConfig.scaleDriverStepCurves || DEFAULT_SCALE_STEP_CURVES;

    const driversMap: Record<string, number> = {
      fin_ent: s.fin_ent || 1,
      fin_led: s.fin_led || 1,
      fin_bu: (s as any).fin_bu ?? 2,
      fin_secondary_ledgers: (s as any).fin_secondary_ledgers ?? 0,
      scm_plants: s.scm_plants || 1,
      scm_wh: s.scm_wh || 2,
      scm_inv: s.scm_inv || 3,
      hcm_hc: s.hcm_hc || 2500,
      hcm_pay_countries: s.hcm_pay_countries || 1,
      tech_data_objects: s.tech_data_objects || 12
    };

    let totalMarginal = 0;
    let totalLinear = 0;

    const curvesWithSavings = curves.map(c => {
      const projectQty = driversMap[c.driverKey] ?? c.baseIncludedQty;
      const res = calculateStepCurveMarginalHours(c, projectQty, true);
      const uncalibratedLinear = Math.max(0, projectQty - c.baseIncludedQty) * (c.stepTiers[0]?.incrementalHoursPerUnit || 300);
      const savings = Math.max(0, uncalibratedLinear - res.totalHours);

      totalMarginal += res.totalHours;
      totalLinear += uncalibratedLinear;

      return {
        curve: c,
        projectQty,
        result: res,
        uncalibratedLinear,
        savings
      };
    });

    return {
      curvesWithSavings,
      totalMarginalHours: totalMarginal,
      totalLinearHours: totalLinear,
      totalEfficiencySavingsHours: Math.max(0, totalLinear - totalMarginal)
    };
  }, [scenario.scaleDrivers, activeConfig.scaleDriverStepCurves]);

  // Master Blended Rate Calculation
  const activeBlendedRateResult = useMemo(() => {
    return calculateMasterBlendedRate(
      data.targetHours,
      scenario.deliveryMix,
      activeConfig.roleRateCards
    );
  }, [data.targetHours, scenario.deliveryMix, activeConfig.roleRateCards]);

  // Handlers for state updates
  const handleUpdateRoleRate = (roleId: string, field: keyof RoleRateCardItem, value: any) => {
    setActiveConfig(prev => {
      const next = {
        ...prev,
        roleRateCards: prev.roleRateCards.map(r => r.roleId === roleId ? { ...r, [field]: value } : r)
      };
      onUpdateScenario(s => ({ ...s, benchmarkMasterConfig: next }));
      return next;
    });
  };

  const handleSelectPyramid = (id: string) => {
    const selected = activeConfig.deliveryPyramids.find(p => p.id === id);
    if (selected) {
      setActiveConfig(prev => {
        const next = { ...prev, activeDeliveryPyramidId: id };
        onUpdateScenario(s => ({
          ...s,
          benchmarkMasterConfig: next,
          deliveryMix: selected.deliveryMix
        }));
        return next;
      });
    }
  };

  const handleUpdatePhaseRule = (phaseId: string, field: keyof PhaseStaffingMixRule, value: any) => {
    setActiveConfig(prev => {
      const next = {
        ...prev,
        phaseStaffingRules: prev.phaseStaffingRules.map(p => p.phaseId === phaseId ? { ...p, [field]: value } : p)
      };
      onUpdateScenario(s => ({ ...s, benchmarkMasterConfig: next }));
      return next;
    });
  };

  const handleUpdateWorkstreamRule = (wsId: string, field: keyof WorkstreamStaffingMixRule, value: any) => {
    setActiveConfig(prev => {
      const next = {
        ...prev,
        workstreamStaffingRules: prev.workstreamStaffingRules.map(w => w.workstreamId === wsId ? { ...w, [field]: value } : w)
      };
      onUpdateScenario(s => ({ ...s, benchmarkMasterConfig: next }));
      return next;
    });
  };

  const handleUpdateCommercialGovernance = (field: keyof CommercialGovernanceConfig, value: any) => {
    setActiveConfig(prev => {
      const next = {
        ...prev,
        commercialGovernance: {
          ...prev.commercialGovernance,
          [field]: value
        }
      };
      onUpdateScenario(s => ({ ...s, benchmarkMasterConfig: next }));
      return next;
    });
  };

  const handleWbsHourChange = (activityId: string, size: TShirtSize, newHours: number) => {
    const validHours = Math.max(0, isNaN(newHours) ? 0 : newHours);
    setActiveConfig(prev => {
      const next = {
        ...prev,
        wbsActivities: prev.wbsActivities.map(act => {
          if (act.id === activityId) {
            return {
              ...act,
              hoursByTShirt: {
                ...act.hoursByTShirt,
                [size]: validHours
              }
            };
          }
          return act;
        })
      };
      onUpdateScenario(s => ({ ...s, benchmarkMasterConfig: next }));
      return next;
    });
  };

  const handleToggleModuleFeature = (modId: string, featureId: string) => {
    setActiveConfig(prev => {
      const currentModConfig = prev.moduleIntrinsicConfigs[modId] || DEFAULT_MODULE_INTRINSIC_CONFIGS[modId];
      if (!currentModConfig) return prev;

      const updatedFeatures = currentModConfig.features.map(f => {
        if (f.id === featureId) {
          return { ...f, isEnabled: !f.isEnabled };
        }
        return f;
      });

      return {
        ...prev,
        moduleIntrinsicConfigs: {
          ...prev.moduleIntrinsicConfigs,
          [modId]: {
            ...currentModConfig,
            features: updatedFeatures
          }
        }
      };
    });
  };

  const handleFeatureWeightChange = (modId: string, featureId: string, newWeight: number) => {
    const validWeight = Math.max(0, Math.min(50, isNaN(newWeight) ? 0 : newWeight));
    setActiveConfig(prev => {
      const currentModConfig = prev.moduleIntrinsicConfigs[modId] || DEFAULT_MODULE_INTRINSIC_CONFIGS[modId];
      if (!currentModConfig) return prev;

      const updatedFeatures = currentModConfig.features.map(f => {
        if (f.id === featureId) {
          return { ...f, weightPct: validWeight };
        }
        return f;
      });

      return {
        ...prev,
        moduleIntrinsicConfigs: {
          ...prev.moduleIntrinsicConfigs,
          [modId]: {
            ...currentModConfig,
            features: updatedFeatures
          }
        }
      };
    });
  };

  const handleRicefwHourChange = (
    patternId: string,
    field: 'specDesignHours' | 'buildConfigHours' | 'testingHours' | 'cutoverRehearsalHours',
    newVal: number
  ) => {
    const validHours = Math.max(0, isNaN(newVal) ? 0 : newVal);
    setActiveConfig(prev => {
      const patterns = prev.ricefwMasterConfig.patterns;
      const updatedPatterns = patterns.map(p => {
        if (p.id === patternId) {
          const updated = { ...p, [field]: validHours };
          updated.totalUnitHours = calculateRicefwUnitTotal(updated);
          return updated;
        }
        return p;
      });

      return {
        ...prev,
        ricefwMasterConfig: {
          ...prev.ricefwMasterConfig,
          patterns: updatedPatterns
        }
      };
    });
  };

  const handleResetToStandard = () => {
    const standard = CALIBRATION_PROFILES.oracle_tcm_standard;
    setActiveConfig(standard);
    onUpdateScenario(prev => ({
      ...prev,
      benchmarkMasterConfig: standard
    }));
    setSaveSuccessNotice('Reset all calibration settings to Oracle TCM Standard defaults.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleApplyToActiveScenario = () => {
    onUpdateScenario(prev => {
      const updatedMultipliers = { ...(prev.moduleMultipliers || {}) };
      Object.keys(activeConfig.moduleIntrinsicConfigs).forEach(modId => {
        const modCfg = activeConfig.moduleIntrinsicConfigs[modId];
        if (modCfg) {
          updatedMultipliers[modId] = calculateModuleIntrinsicMultiplier(modCfg);
        }
      });

      return {
        ...prev,
        benchmarkMasterConfig: activeConfig,
        moduleMultipliers: updatedMultipliers
      };
    });

    setSaveSuccessNotice('Successfully saved calibrated benchmark settings to active scenario.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ====================================================================== */}
      {/* TOP BAR: ACTIONS & SCOPE / ARCHITECT METRIC STRIP                       */}
      {/* ====================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-slate-700" />
              Benchmark Master & Calibration Center
            </h2>
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Oracle True Cloud Method (TCM)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Source of Truth for Role Rate Cards, Delivery Pyramids, Blended Rates, Staffing Mixes, Commercial Guardrails, and Sizing Benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToStandard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            title="Reset to Oracle Gold-Standard TCM Benchmark Values"
          >
            <RotateCcw size={13} />
            Reset Baseline
          </button>
          <button
            type="button"
            onClick={handleApplyToActiveScenario}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Save custom calibrated values to active project scenario"
          >
            <Save size={14} />
            Save & Apply
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3-WAY PERSPECTIVE SWITCHER: CATALOG vs. AS-OF SCOPE vs. AS-OF ARCHITECT */}
      {/* ====================================================================== */}
      <div className="bg-slate-900 text-white p-3.5 rounded-sm shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xs bg-slate-800 text-amber-400 border border-slate-700">
              <Sliders size={16} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Master Evaluation Perspective
              </div>
              <div className="text-[11px] text-slate-400">
                Switch between empirical benchmark catalog, active project scope applied, and solution architecture governance.
              </div>
            </div>
          </div>

          <div className="flex items-center bg-slate-800 p-1 rounded-sm border border-slate-700">
            <button
              type="button"
              onClick={() => setViewPerspective('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition cursor-pointer ${
                viewPerspective === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayersIcon size={13} />
              <span>1. Master Benchmark Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => setViewPerspective('scope')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition cursor-pointer ${
                viewPerspective === 'scope'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Target size={13} />
              <span>2. As-of Active Scope ({scenario.selectedModules.length} Modules)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewPerspective('architect')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition cursor-pointer ${
                viewPerspective === 'architect'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass size={13} />
              <span>3. As-of Solution Architect</span>
            </button>
          </div>
        </div>

        {/* Perspective Quick Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className={`p-2 rounded-xs border transition ${
            viewPerspective === 'catalog'
              ? 'bg-slate-800/90 border-slate-600 text-white'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span>Empirical Baseline Catalog</span>
              <span className="font-mono text-[10px]">7 Roles • 5 Presets</span>
            </div>
            <p className="text-[10px] mt-0.5 leading-snug">
              Standard TCM rate cards, balanced delivery pyramids, phase mix rules, and 240h XS baseline.
            </p>
          </div>

          <div className={`p-2 rounded-xs border transition ${
            viewPerspective === 'scope'
              ? 'bg-blue-950/80 border-blue-600 text-blue-100'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className="font-bold flex items-center justify-between text-blue-300">
              <span>Active Project Applied Scope</span>
              <span className="font-mono text-[10px] text-white">${activeBlendedRateResult.blendedBillRate.toFixed(2)}/hr Rate</span>
            </div>
            <p className="text-[10px] mt-0.5 leading-snug">
              {data.targetHours.toLocaleString()} hrs across {scenario.selectedModules.length} modules at {scenario.deliveryMix.onshore}/{scenario.deliveryMix.nearshore}/{scenario.deliveryMix.offshore} mix.
            </p>
          </div>

          <div className={`p-2 rounded-xs border transition ${
            viewPerspective === 'architect'
              ? 'bg-amber-950/80 border-amber-500 text-amber-100'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
          }`}>
            <div className="font-bold flex items-center justify-between text-amber-300">
              <span>Solution Architecture & Governance</span>
              <span className="font-mono text-[10px] text-white">5 ARB Gates</span>
            </div>
            <p className="text-[10px] mt-0.5 leading-snug">
              Enterprise Solution Architecture oversight, cross-pillar blueprints, and risk-adjusted governance.
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PRIMARY BENCHMARK MASTER MENU BAR (6 CLEAR AREAS)                      */}
      {/* ====================================================================== */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2 rounded-t-sm overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1">
          {/* Tab 1: Rate Cards */}
          <button
            type="button"
            onClick={() => setSelectedTab('rates')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              selectedTab === 'rates'
                ? 'border-slate-900 text-slate-900 bg-slate-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign size={15} />
            <span>1. Role & Location Rate Cards</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-xs">
              {activeConfig.roleRateCards.length} Roles
            </span>
          </button>

          {/* Tab 2: Delivery Pyramids */}
          <button
            type="button"
            onClick={() => setSelectedTab('pyramids')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              selectedTab === 'pyramids'
                ? 'border-slate-900 text-slate-900 bg-slate-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={15} />
            <span>2. Delivery Pyramids & Blended Rates</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-xs">
              ${activeBlendedRateResult.blendedBillRate.toFixed(0)}/hr
            </span>
          </button>

          {/* Tab 3: Phase & Workstream Mix */}
          <button
            type="button"
            onClick={() => setSelectedTab('phases_workstreams')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              selectedTab === 'phases_workstreams'
                ? 'border-slate-900 text-slate-900 bg-slate-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch size={15} />
            <span>3. Phase & Workstream Mix</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-xs">
              {activeConfig.phaseStaffingRules.length} Phases
            </span>
          </button>

          {/* Tab 4: Commercial Multipliers */}
          <button
            type="button"
            onClick={() => setSelectedTab('commercials')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              selectedTab === 'commercials'
                ? 'border-slate-900 text-slate-900 bg-slate-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale size={15} />
            <span>4. Commercials & Financial Levers</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-xs">
              {activeConfig.commercialGovernance.targetGrossMarginPct}% Margin
            </span>
          </button>

          {/* Tab 5: WBS & Sizing Benchmarks */}
          <button
            type="button"
            onClick={() => setSelectedTab('wbs_sizing')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              selectedTab === 'wbs_sizing' || selectedTab === 'wbs' || selectedTab === 'complexity_modifier' || selectedTab === 'ricefw' || selectedTab === 'functional_modifier'
                ? 'border-slate-900 text-slate-900 bg-slate-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={15} />
            <span>5. WBS & Sizing Benchmarks (Layers 1–4)</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-xs">
              4 Layers
            </span>
          </button>

          {/* Tab 6: Traceability Matrix */}
          <button
            type="button"
            onClick={() => setSelectedTab('traceability')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              selectedTab === 'traceability'
                ? 'border-slate-900 text-slate-900 bg-slate-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck size={15} />
            <span>6. Traceability Matrix & Audit Map</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-xs">
              Defensible
            </span>
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* ACTIVE TAB CONTENT ROUTING                                             */}
      {/* ====================================================================== */}
      {selectedTab === 'rates' && (
        <RateCardsTab
          roleRateCards={activeConfig.roleRateCards}
          onUpdateRoleRate={handleUpdateRoleRate}
          targetHours={data.targetHours}
        />
      )}

      {selectedTab === 'pyramids' && (
        <DeliveryPyramidsTab
          deliveryPyramids={activeConfig.deliveryPyramids}
          activePyramidId={activeConfig.activeDeliveryPyramidId}
          onSelectPyramid={handleSelectPyramid}
          roleRateCards={activeConfig.roleRateCards}
          targetHours={data.targetHours}
          currentActiveDeliveryMix={scenario.deliveryMix}
        />
      )}

      {selectedTab === 'phases_workstreams' && (
        <PhaseWorkstreamTab
          phaseRules={activeConfig.phaseStaffingRules}
          workstreamRules={activeConfig.workstreamStaffingRules}
          roleRateCards={activeConfig.roleRateCards}
          onUpdatePhaseRule={handleUpdatePhaseRule}
          onUpdateWorkstreamRule={handleUpdateWorkstreamRule}
          targetHours={data.targetHours}
        />
      )}

      {selectedTab === 'commercials' && (
        <CommercialGovernanceTab
          governanceConfig={activeConfig.commercialGovernance}
          onUpdateGovernance={handleUpdateCommercialGovernance}
          targetRevenue={activeBlendedRateResult.revenue}
          grossMarginPct={activeBlendedRateResult.grossMarginPct}
        />
      )}

      {(selectedTab === 'wbs_sizing' || selectedTab === 'wbs' || selectedTab === 'complexity_modifier' || selectedTab === 'ricefw' || selectedTab === 'functional_modifier') && (
        <WbsSizingLayersTab
          wbsActivities={activeConfig.wbsActivities}
          moduleIntrinsicConfigs={activeConfig.moduleIntrinsicConfigs}
          ricefwConfig={activeConfig.ricefwMasterConfig}
          stepCurves={activeConfig.scaleDriverStepCurves}
          viewPerspective={viewPerspective}
          scopedModuleList={scopedModuleList}
          totalScopedWbsHours={totalScopedWbsHours}
          scopedWbsPhaseBreakdown={scopedWbsPhaseBreakdown}
          scopedRicefwInventory={scopedRicefwInventory}
          scopedStepCurves={scopedStepCurves}
          onWbsHourChange={handleWbsHourChange}
          onToggleModuleFeature={handleToggleModuleFeature}
          onFeatureWeightChange={handleFeatureWeightChange}
          onRicefwHourChange={handleRicefwHourChange}
        />
      )}

      {selectedTab === 'traceability' && (
        <TraceabilityMatrixTab
          config={activeConfig}
          targetHours={data.targetHours}
          totalRevenue={activeBlendedRateResult.revenue}
          blendedRate={activeBlendedRateResult.blendedBillRate}
          grossMarginPct={activeBlendedRateResult.grossMarginPct}
        />
      )}
    </div>
  );
};
