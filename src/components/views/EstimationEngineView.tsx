import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  HelpCircle,
  BarChart3,
  Download,
  Cpu,
  TestTube2,
  Code2,
  Database,
  Workflow,
  CheckCircle2,
  Zap,
  Settings2,
  FileCode2,
  Calculator,
  Save,
  Network,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule, NavTabId } from '../../types';
import { exportWbsToCsv } from '../../utils/exporter';
import { ModuleTShirtMatrix } from '../common/ModuleTShirtMatrix';
import { TShirtBadge } from '../common/TShirtBadge';
import { CLIENT_FRICTION_FACTORS_DEF } from '../../data/clientFrictionData';
import { getMockCumulativeMultiplier } from '../../data/technicalScopingData';

interface EstimationEngineViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenComplexityStudio?: (tab?: 'complexity' | 'questions' | 'drivers' | 'ai_advisor') => void;
  onOpenTraceMath?: (target?: OracleModule | 'project_total') => void;
  onSaveScenario?: () => void;
  onNavigateTab?: (tab: NavTabId, subSection?: string) => void;
}

export const EstimationEngineView: React.FC<EstimationEngineViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onOpenComplexityStudio,
  onOpenTraceMath,
  onSaveScenario,
  onNavigateTab
}) => {
  const [showDriverCalibration, setShowDriverCalibration] = useState<boolean>(false);
  const [showAllFrictionFactors, setShowAllFrictionFactors] = useState<boolean>(false);

  // External Integrations Dynamic Scaling Modifier State
  const initialExtCount = scenario.scaleDrivers.tech_external_integrations_count ?? scenario.scaleDrivers.tech_oic ?? 12;
  const initialExtComplexity = scenario.scaleDrivers.tech_external_integrations_complexity ?? 'medium';
  const initialExtMultiplier = scenario.scaleDrivers.tech_external_integrations_multiplier ??
    (initialExtComplexity === 'simple' ? 0.85 : initialExtComplexity === 'complex' ? 1.75 : 1.20);

  const [externalIntegrationsCount, setExternalIntegrationsCount] = useState<number>(initialExtCount);
  const [integrationComplexity, setIntegrationComplexity] = useState<'simple' | 'medium' | 'complex'>(initialExtComplexity);
  const [integrationMultiplier, setIntegrationMultiplier] = useState<number>(initialExtMultiplier);

  // Sync state if scenario updates from external modals/screens
  useEffect(() => {
    if (scenario.scaleDrivers.tech_external_integrations_count !== undefined) {
      setExternalIntegrationsCount(scenario.scaleDrivers.tech_external_integrations_count);
    }
    if (scenario.scaleDrivers.tech_external_integrations_complexity !== undefined) {
      setIntegrationComplexity(scenario.scaleDrivers.tech_external_integrations_complexity);
    }
    if (scenario.scaleDrivers.tech_external_integrations_multiplier !== undefined) {
      setIntegrationMultiplier(scenario.scaleDrivers.tech_external_integrations_multiplier);
    }
  }, [
    scenario.scaleDrivers.tech_external_integrations_count,
    scenario.scaleDrivers.tech_external_integrations_complexity,
    scenario.scaleDrivers.tech_external_integrations_multiplier
  ]);

  const updateConfidence = (val: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      confidence: Math.max(0.4, Math.min(0.95, val))
    }));
  };

  const updateScaleDriver = (key: keyof ProjectScenario['scaleDrivers'], val: number) => {
    onUpdateScenario(prev => {
      const clamped = Math.max(0, val);
      const nextScaleDrivers = {
        ...prev.scaleDrivers,
        [key]: clamped
      };
      if (key === 'tech_conversion_cycles' || key === 'conv_runs') {
        nextScaleDrivers.tech_conversion_cycles = Math.max(1, clamped);
        nextScaleDrivers.conv_runs = Math.max(1, clamped);
      }
      if (key === 'tech_data_objects' || key === 'conv_objects') {
        nextScaleDrivers.tech_data_objects = clamped;
        nextScaleDrivers.conv_objects = clamped;
      }
      if (key === 'tech_oic' || key === 'tech_external_integrations_count') {
        nextScaleDrivers.tech_oic = clamped;
        nextScaleDrivers.tech_external_integrations_count = clamped;
      }
      return {
        ...prev,
        scaleDrivers: nextScaleDrivers
      };
    });
  };

  const updateModifier = (key: keyof ProjectScenario['clientModifiers'], val: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      clientModifiers: {
        ...prev.clientModifiers,
        [key]: val
      }
    }));
  };

  // External Integrations Modifier Handler
  const handleUpdateExternalIntegrations = (
    newCount: number,
    newComplexity: 'simple' | 'medium' | 'complex' = integrationComplexity,
    customMult?: number
  ) => {
    const validCount = Math.max(0, newCount);
    const defaultMult = newComplexity === 'simple' ? 0.85 : newComplexity === 'complex' ? 1.75 : 1.20;
    const finalMult = customMult !== undefined ? customMult : defaultMult;

    setExternalIntegrationsCount(validCount);
    setIntegrationComplexity(newComplexity);
    setIntegrationMultiplier(finalMult);

    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_external_integrations_count: validCount,
        tech_external_integrations_complexity: newComplexity,
        tech_external_integrations_multiplier: finalMult,
        tech_oic: validCount
      }
    }));
  };

  // Conversion Mock Rehearsals Handler (supporting 1, 2, 3, 4 Mocks)
  const currentConversionCycles = scenario.scaleDrivers.tech_conversion_cycles ?? scenario.scaleDrivers.conv_runs ?? 3;
  const currentDataObjects = scenario.scaleDrivers.tech_data_objects ?? scenario.scaleDrivers.conv_objects ?? 12;

  const handleUpdateConversionCycles = (cycles: number) => {
    const validCycles = Math.max(1, cycles);
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_conversion_cycles: validCycles,
        conv_runs: validCycles
      }
    }));
  };

  const handleUpdateDataObjects = (objects: number) => {
    const validObjects = Math.max(0, objects);
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_data_objects: validObjects,
        conv_objects: validObjects
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
              <Scale size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Estimation Mathematics & Sizing Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            3-Point Effort Ranges & WBS Work Breakdown
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Calibrate statistical contingency buffers, client friction multipliers, and analyze phase & track effort consumption.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSaveScenario && (
            <button
              onClick={onSaveScenario}
              className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
              title="Save all changes to proposal and refresh data across all screens"
            >
              <Save size={14} />
              <span>Save & Refresh All Screens</span>
            </button>
          )}
          <button
            onClick={() => exportWbsToCsv(scenario, data)}
            className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} className="text-slate-700" />
            <span>Export WBS (CSV)</span>
          </button>
        </div>
      </div>

      {/* 3-Point Ranges & Confidence Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confidence & Contingency Calibration */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Project Confidence & Contingency</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Deal stage readiness determines defensive buffer</p>
            </div>
            <span className="px-2.5 py-1 rounded-sm text-xs font-mono font-bold bg-slate-900 text-white">
              {Math.round(scenario.confidence * 100)}% Confidence
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Indicative (40%)</span>
                <span>Due Diligence (75%)</span>
                <span>Final RFP (95%)</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.95}
                step={0.01}
                value={scenario.confidence}
                onChange={(e) => updateConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-none appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Calculated Defensible Contingency:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                +{(data.contingencyPct * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Client Delivery Friction Multipliers */}
          <div className="pt-3 border-t border-slate-200 space-y-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>Client Delivery Friction</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
                  {CLIENT_FRICTION_FACTORS_DEF.length} Dimensions
                </span>
              </div>
              <span className={`font-mono font-bold px-2 py-0.5 text-xs border ${
                data.netClientModifier > 1.20
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : data.netClientModifier > 1.00
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Net: {data.netClientModifier.toFixed(2)}x
              </span>
            </div>

            <div className="space-y-2.5">
              {(showAllFrictionFactors ? CLIENT_FRICTION_FACTORS_DEF : CLIENT_FRICTION_FACTORS_DEF.slice(0, 3)).map((factor) => {
                const val = scenario.clientModifiers[factor.id] ?? 1.0;
                return (
                  <div key={factor.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-700 truncate max-w-[200px]" title={factor.title}>
                        {factor.title.replace(/^\d+\.\s*/, '')}
                      </label>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-none border ${
                        val > 1.20
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : val > 1.00
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {val.toFixed(2)}x
                      </span>
                    </div>
                    <select
                      value={val}
                      onChange={(e) => updateModifier(factor.id, parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-sm bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                    >
                      {factor.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.value.toFixed(2)}x — {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowAllFrictionFactors(!showAllFrictionFactors)}
                className="w-full py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>{showAllFrictionFactors ? 'Show Core 3 Factors' : `View All ${CLIENT_FRICTION_FACTORS_DEF.length} Delivery Dimensions (+4)`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Point Estimate Cards */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Statistical Sizing Spectrum (PERT)</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Range distribution based on scale drivers, complexity, and contingency</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Base: {(Math.round(data.totalBaseHours || 0)).toLocaleString()} hrs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* P10 Best Case */}
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">P10 (Best Case)</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-none border border-emerald-200">
                  Optimistic
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-700">
                {(Math.round(data.p10_BestCaseHours || 0)).toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-slate-500">hrs</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {Math.round(data.p10_BestCaseHours / 160)} Person-Months @ 100% adoption
              </div>
            </div>

            {/* P50 Baseline Staffing */}
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">P50 (Staffing Baseline)</span>
                <span className="text-[10px] uppercase font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-none border border-slate-200">
                  Target Staffing
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900">
                {(Math.round(data.p50_BaselineHours || 0)).toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-slate-500">hrs</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {Math.round(data.p50_BaselineHours / 160)} Person-Months base capacity
              </div>
            </div>

            {/* P80 Defensible Contract Quote (Primary Target) */}
            <div className="p-4 rounded-sm bg-slate-900 text-white border border-slate-900 shadow-sm space-y-1 relative">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={14} className="text-white" />
                  <span>P80 (Defensible Quote)</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-900 bg-white px-2 py-0.5 rounded-none">
                  Contract Basis
                </span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {(Math.round(data.p80_DefensibleHours || 0)).toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-slate-300">hrs</span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                {Math.round(data.p80_DefensibleHours / 160)} PMs with ${(data.contingencyPct * 100).toFixed(0)}% buffer
              </div>
            </div>

            {/* P95 Conservative */}
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">P95 (Conservative Cap)</span>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-none border border-amber-200">
                  Upper Bound
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-amber-700">
                {(Math.round(data.p95_ConservativeHours || 0)).toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-slate-500">hrs</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {Math.round(data.p95_ConservativeHours / 160)} PMs for high-risk fixed price
              </div>
            </div>
          </div>

          {/* Mathematical Multiplier Breakdown Callout */}
          <div className="p-4 rounded-sm bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Leadership Estimation Formula & Statistical Lineage</span>
              </span>
              {onOpenTraceMath ? (
                <button
                  type="button"
                  onClick={() => onOpenTraceMath('project_total')}
                  className="px-2.5 py-1 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                >
                  <Calculator size={11} />
                  <span>Trace The Math</span>
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-300">
                  100% Deterministic & Auditable
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-sm bg-white/10 font-mono text-xs text-amber-300">
              H_P80 = H_base ({(Math.round(data.totalBaseHours || 0)).toLocaleString()}) × Complexity ({data.complexMultiplier.toFixed(2)}) × Friction ({data.netClientModifier.toFixed(2)}) × Rollout ({data.rolloutMultiplier.toFixed(2)}) × (1 + {(data.contingencyPct).toFixed(3)}) = {(Math.round(data.p80_DefensibleHours || 0)).toLocaleString()} hrs
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[9px] uppercase">Base Effort</span>
                <span className="font-mono font-bold text-white">{(Math.round(data.totalBaseHours || 0)).toLocaleString()}h</span>
              </div>
              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[9px] uppercase">Net Modifiers</span>
                <span className="font-mono font-bold text-amber-300">{(data.complexMultiplier * data.netClientModifier * data.rolloutMultiplier).toFixed(2)}x</span>
              </div>
              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[9px] uppercase">Defensible Buffer</span>
                <span className="font-mono font-bold text-emerald-400">+{(data.contingencyPct * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[9px] uppercase">Contract Basis</span>
                <span className="font-mono font-bold text-white">{(Math.round(data.targetHours || 0)).toLocaleString()}h</span>
              </div>
            </div>
          </div>

          {/* Senior Leadership Governance & Risk Buffer Callout */}
          <div className="p-4 rounded-sm bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Leadership Governance & Buffer
              </span>
              <span className="text-[10px] font-mono text-slate-300">
                Risk-Adjusted Contingency & Co-Staffing
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-sm bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase">Defensible P80 Risk Reserve</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  +{(data.leadershipGaps?.monteCarlo?.recommendedReserveHours || 0).toLocaleString()} hrs
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ${(data.leadershipGaps.monteCarlo.recommendedReserveBudget / 1000).toFixed(0)}k SteerCo Buffer
                </span>
              </div>
              <div className="p-2.5 rounded-sm bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase">Peak Client SME Demand</span>
                <span className="font-mono font-bold text-purple-300 text-sm">
                  {data.leadershipGaps.coStaffing.peakClientFTE} Peak FTEs
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ${(data.leadershipGaps.coStaffing.estimatedClientBackfillCost / 1000).toFixed(0)}k Est. Backfill
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Module-Level T-Shirt Sizing & Effort Breakdown Matrix */}
      <ModuleTShirtMatrix data={data} onOpenTraceMath={onOpenTraceMath} />

      {/* Technical & Testing Workstream Estimation Breakdown */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-sm bg-slate-900 text-white">
                <Cpu size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Technical Architecture & Quality Assurance Workstreams
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Technical & Testing Workstream Estimation
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
              Defensible T-shirt sizing and granular mathematical effort breakdown for <strong>Technical Integrations & CEMLI Architecture</strong> and <strong>Testing, QA & Validation</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDriverCalibration(prev => !prev)}
            className="px-3.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-slate-300 self-start md:self-auto"
          >
            <Settings2 size={13} />
            <span>{showDriverCalibration ? 'Hide Driver Sliders' : 'Calibrate Scale Drivers'}</span>
          </button>
        </div>

        {/* Quick Driver Calibration Drawer if toggled */}
        {/* Quick Driver Calibration Drawer if toggled */}
        {showDriverCalibration && (
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-sm space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders size={14} className="text-blue-600" />
                <span>Technical & Testing Scale Driver Calibration</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Adjust counts to instantly recalibrate workstream sizing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Ext. Integrations</label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={externalIntegrationsCount}
                  onChange={(e) => handleUpdateExternalIntegrations(parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">{integrationComplexity.toUpperCase()} ({integrationMultiplier.toFixed(2)}x)</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Int. Complexity</label>
                <select
                  value={integrationComplexity}
                  onChange={(e) => handleUpdateExternalIntegrations(externalIntegrationsCount, e.target.value as 'simple' | 'medium' | 'complex')}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-1 py-1 text-xs"
                >
                  <option value="simple">Simple (0.85x)</option>
                  <option value="medium">Medium (1.20x)</option>
                  <option value="complex">Complex (1.75x)</option>
                </select>
                <span className="text-[9px] text-slate-400 block">Effort Multiplier</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Data Objects</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={currentDataObjects}
                  onChange={(e) => handleUpdateDataObjects(parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">FBDI / HDL Entities</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Mock Cycles</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdateConversionCycles(c)}
                      className={`flex-1 py-1 text-center font-mono font-bold text-xs border ${
                        currentConversionCycles === c
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 block">{currentConversionCycles === 4 ? '4 Mocks (2.80x)' : `${currentConversionCycles} Mocks`}</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">PaaS / VBCS Apps</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={scenario.scaleDrivers.tech_paas || 0}
                  onChange={(e) => updateScaleDriver('tech_paas', parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">Custom UI Apps</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">BIP Reports</label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={scenario.scaleDrivers.tech_reports_bip || 0}
                  onChange={(e) => updateScaleDriver('tech_reports_bip', parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">Pixel-Perfect Docs</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">SIT Test Cycles</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={scenario.scaleDrivers.test_sit_cycles || 2}
                  onChange={(e) => updateScaleDriver('test_sit_cycles', parseInt(e.target.value) || 1)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">E2E Iterations</span>
              </div>

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Test Automation %</label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  step={5}
                  value={scenario.scaleDrivers.test_automation_pct || 0}
                  onChange={(e) => updateScaleDriver('test_automation_pct', parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">ACCELQ / OATS %</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Modifiers & Scaling Engine (External Integrations & 4-Mock Conversion) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
          {/* Card A: External Integrations Dynamic Modifier */}
          <div className="bg-blue-50/50 border-2 border-blue-200 rounded-sm p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-blue-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-blue-600 text-white shadow-xs">
                  <Network size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      External Integrations Dynamic Modifier
                    </h4>
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                      Technical Scaler
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Input count of external integrations to dynamically scale technical effort based on interface complexity.
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xl font-mono font-bold text-blue-900 block">
                  {externalIntegrationsCount} Flows
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase bg-blue-100 px-1.5 py-0.5 border border-blue-200">
                  {integrationComplexity} ({integrationMultiplier.toFixed(2)}x)
                </span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('discovery', 'integration_matrix')}
                    className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer mt-0.5"
                  >
                    <span>View Matrix Catalog</span>
                    <ArrowRight size={10} />
                  </button>
                )}
              </div>
            </div>

            {/* Integration Count Input & Quick Preset Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>Count of External Integrations:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateExternalIntegrations(externalIntegrationsCount - 1)}
                    disabled={externalIntegrationsCount <= 0}
                    className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                    title="Decrement count"
                  >
                    <Minus size={13} />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={150}
                    value={externalIntegrationsCount}
                    onChange={(e) => handleUpdateExternalIntegrations(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-none text-sm focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateExternalIntegrations(externalIntegrationsCount + 1)}
                    className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition shadow-2xs"
                    title="Increment count"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Quick Count Presets */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Presets:</span>
                {[
                  { count: 6, label: '6 Low' },
                  { count: 12, label: '12 Standard' },
                  { count: 18, label: '18 Enterprise' },
                  { count: 24, label: '24 Multi-Cloud' }
                ].map(preset => (
                  <button
                    key={preset.count}
                    type="button"
                    onClick={() => handleUpdateExternalIntegrations(preset.count)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold transition border cursor-pointer ${
                      externalIntegrationsCount === preset.count
                        ? 'bg-blue-700 text-white border-blue-800 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity Level Selector Cards (Simple / Medium / Complex) */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Integration Complexity Tier & Multiplier:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Simple */}
                <button
                  type="button"
                  onClick={() => handleUpdateExternalIntegrations(externalIntegrationsCount, 'simple', 0.85)}
                  className={`p-2.5 text-left border transition cursor-pointer flex flex-col justify-between ${
                    integrationComplexity === 'simple'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950">Simple</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300">
                      0.85x
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold mt-1">
                    ~68h / interface
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight line-clamp-2">
                    1-way batch / standard REST pass-through, pre-built schemas
                  </p>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => handleUpdateExternalIntegrations(externalIntegrationsCount, 'medium', 1.20)}
                  className={`p-2.5 text-left border transition cursor-pointer flex flex-col justify-between ${
                    integrationComplexity === 'medium'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-950">Medium</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 border border-blue-300">
                      1.20x
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 font-semibold mt-1">
                    ~96h / interface
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight line-clamp-2">
                    Standard 2-way sync, DVM lookups, token auth & field mapping
                  </p>
                </button>

                {/* Complex */}
                <button
                  type="button"
                  onClick={() => handleUpdateExternalIntegrations(externalIntegrationsCount, 'complex', 1.75)}
                  className={`p-2.5 text-left border transition cursor-pointer flex flex-col justify-between ${
                    integrationComplexity === 'complex'
                      ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-600/30 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-950">Complex</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-purple-100 text-purple-800 border border-purple-300">
                      1.75x
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-700 font-semibold mt-1">
                    ~140h / interface
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight line-clamp-2">
                    Bi-directional real-time, multi-entity hierarchy, custom XSLT / pub-sub
                  </p>
                </button>
              </div>
            </div>

            {/* Live Calculation Lineage & Trace Badge */}
            <div className="p-2.5 rounded-sm bg-blue-900 text-white font-mono text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-blue-200">
                <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Calculator size={12} />
                  <span>Dynamic Mathematical Formula:</span>
                </span>
                <span className="text-[10px] text-blue-300">
                  Direct Workstream Scaler
                </span>
              </div>
              <div className="text-[11px] text-white">
                {externalIntegrationsCount} External Integrations × 80h Base × {integrationMultiplier.toFixed(2)}x ({integrationComplexity.toUpperCase()}) = <span className="font-bold text-amber-300">{Math.round(externalIntegrationsCount * 80 * integrationMultiplier).toLocaleString()}h</span> Baseline
              </div>
              <div className="text-[10px] text-blue-200 border-t border-blue-800/80 pt-1 flex items-center justify-between">
                <span>Scaled Defensible Quote (w/ Friction & Contingency):</span>
                <span className="font-bold text-emerald-300 text-xs">
                  {(Math.round(data.technicalWorkstreamEstimate?.integrationsHours || 0)).toLocaleString()} hrs
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Data Conversion Scope & 4-Mock Rehearsal Engine Card */}
          <div className="bg-emerald-50/40 border-2 border-emerald-200 rounded-sm p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-emerald-600 text-white shadow-xs">
                  <Database size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Data Conversion Scope & 4-Mock Engine
                    </h4>
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      TBD Sliding Scale
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Iterative mock rehearsals reduce exception rates. Select <strong>4 Mocks</strong> for complete cutover dress rehearsal defense.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-mono font-bold text-emerald-900 block">
                  {currentDataObjects} Objects
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 border border-emerald-200">
                  {currentConversionCycles} {currentConversionCycles === 1 ? 'Mock Cycle' : 'Mock Cycles'}
                </span>
              </div>
            </div>

            {/* Data Objects Stepper */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Legacy Data Objects (FBDI / HDL):
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdateDataObjects(currentDataObjects - 1)}
                  disabled={currentDataObjects <= 0}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                  title="Decrement objects"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={currentDataObjects}
                  onChange={(e) => handleUpdateDataObjects(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-none text-sm focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateDataObjects(currentDataObjects + 1)}
                  className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold flex items-center justify-center cursor-pointer transition shadow-2xs"
                  title="Increment objects"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Mock Cycles Selector (1 to 4 Mocks with explicit 4th Mock) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Mock Rehearsal Cycles (Including 4 Mocks Option):
                </label>
                <span className="text-[10px] font-mono text-emerald-800 font-bold">
                  Multiplier: {getMockCumulativeMultiplier(currentConversionCycles).toFixed(2)}x
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { cycles: 1, label: '1 Mock', pct: '1.00x', desc: 'Baseline load' },
                  { cycles: 2, label: '2 Mocks', pct: '1.80x', desc: 'SIT cycle' },
                  { cycles: 3, label: '3 Mocks', pct: '2.40x', desc: 'UAT volume' },
                  { cycles: 4, label: '4 Mocks', pct: '2.80x', desc: 'Cutover Dress Rehearsal' }
                ].map(opt => (
                  <button
                    key={opt.cycles}
                    type="button"
                    onClick={() => handleUpdateConversionCycles(opt.cycles)}
                    className={`p-2 text-center border transition cursor-pointer flex flex-col justify-between ${
                      currentConversionCycles === opt.cycles
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold text-xs">{opt.label}</span>
                      {opt.cycles === 4 && (
                        <Sparkles size={11} className={currentConversionCycles === 4 ? 'text-amber-300' : 'text-emerald-600'} />
                      )}
                    </div>
                    <span className={`text-[10px] font-mono font-bold mt-1 ${currentConversionCycles === opt.cycles ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      {opt.pct}
                    </span>
                    <span className={`text-[8.5px] mt-0.5 ${currentConversionCycles === opt.cycles ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Conversion Calculation Readout */}
            <div className="p-2.5 rounded-sm bg-emerald-950 text-white font-mono text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-emerald-200">
                <span className="font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                  <Calculator size={12} />
                  <span>Conversion Mathematics Lineage:</span>
                </span>
                <span className="text-[10px] text-emerald-300">
                  {currentConversionCycles >= 4 ? '4-Mock Fixed Price Protected' : `${currentConversionCycles}-Mock Configuration`}
                </span>
              </div>
              <div className="text-[11px] text-white">
                {currentDataObjects} Objects × 45h/Mock × {getMockCumulativeMultiplier(currentConversionCycles).toFixed(2)}x ({currentConversionCycles} Mocks) = <span className="font-bold text-emerald-300">{Math.round(currentDataObjects * 45 * getMockCumulativeMultiplier(currentConversionCycles)).toLocaleString()}h</span> Base Conversion
              </div>
              <div className="text-[10px] text-emerald-200 border-t border-emerald-900 pt-1 flex items-center justify-between">
                <span>Total Defensible P80 Conversion Effort:</span>
                <span className="font-bold text-amber-300 text-xs">
                  {(Math.round(data.conversionMetrics?.totalConversionP80Hours || 0)).toLocaleString()} hrs ({((data.conversionMetrics?.totalConversionP80Hours || 0) / 160).toFixed(1)} PM)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Big Workstream Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Technical & CEMLI Architecture Workstream */}
          {data.technicalWorkstreamEstimate && (
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-4 hover:border-slate-300 transition">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                    <Code2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Technical Architecture & CEMLI Track
                      </h4>
                      <TShirtBadge size={data.technicalWorkstreamEstimate.tShirtSize} />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      OIC, PaaS, BIP Reports, Custom Security & Fast Formulas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-blue-700 block">
                    {(Math.round(data.technicalWorkstreamEstimate.totalHours || 0)).toLocaleString()} hrs
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {data.technicalWorkstreamEstimate.personMonths.toFixed(1)} PM &bull; {data.technicalWorkstreamEstimate.avgFTE.toFixed(1)} FTE
                  </span>
                </div>
              </div>

              {/* Sub-component Hours Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Effort Component Allocation:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Ext. Integrations</span>
                      <span className="font-mono font-bold">{externalIntegrationsCount} ({integrationComplexity.toUpperCase()} @ {integrationMultiplier.toFixed(2)}x)</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.technicalWorkstreamEstimate.integrationsHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>PaaS / VBCS Apps</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.tech_paas || 0}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.technicalWorkstreamEstimate.paasHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>BIP & OTBI Reports</span>
                      <span className="font-mono font-bold">{(scenario.scaleDrivers.tech_reports_bip || 0) + (scenario.scaleDrivers.tech_reports_otbi || 0)}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.technicalWorkstreamEstimate.reportsHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Fast Formulas</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.tech_fast_formulas || 0}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.technicalWorkstreamEstimate.fastFormulasHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>BPM Workflows</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.tech_workflows || 0}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.technicalWorkstreamEstimate.workflowsHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Security Roles</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.tech_security_roles || 0}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.technicalWorkstreamEstimate.securityRolesHours || 0)).toLocaleString()}h
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Deliverables */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Track Deliverables & Scope:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.technicalWorkstreamEstimate.deliverables.map((deliv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-none bg-blue-50/80 border border-blue-200 text-blue-900 text-[10px] font-medium flex items-center gap-1"
                    >
                      <CheckCircle2 size={10} className="text-blue-600 shrink-0" />
                      <span>{deliv}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Testing, Quality Assurance & Validation Workstream */}
          {data.testingWorkstreamEstimate && (
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-4 hover:border-slate-300 transition">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                    <TestTube2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Testing & Quality Assurance Track
                      </h4>
                      <TShirtBadge size={data.testingWorkstreamEstimate.tShirtSize} />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Strategy, SIT Cycles, UAT Support, Automation & Performance
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-purple-700 block">
                    {(Math.round(data.testingWorkstreamEstimate.totalHours || 0)).toLocaleString()} hrs
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {data.testingWorkstreamEstimate.personMonths.toFixed(1)} PM &bull; {data.testingWorkstreamEstimate.avgFTE.toFixed(1)} FTE
                  </span>
                </div>
              </div>

              {/* Sub-component Hours Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Effort Component Allocation:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Test Strategy</span>
                      <span className="font-mono font-bold">Gov</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.testingWorkstreamEstimate.strategyHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>SIT Cycles</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.test_sit_cycles || 2} Cycles</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.testingWorkstreamEstimate.sitHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>UAT Defect Support</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.test_uat_cycles || 1} Run</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.testingWorkstreamEstimate.uatHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Regression Auto</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.test_automation_pct || 0}%</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.testingWorkstreamEstimate.automationHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Performance / Load</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.test_perf_testing ? 'Active' : 'Off'}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.testingWorkstreamEstimate.performanceHours || 0)).toLocaleString()}h
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-sm border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Payroll Parallels</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.test_payroll_parallels || 0} Runs</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {(Math.round(data.testingWorkstreamEstimate.payrollParallelHours || 0)).toLocaleString()}h
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Deliverables */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Track Deliverables & Scope:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.testingWorkstreamEstimate.deliverables.map((deliv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-none bg-purple-50/80 border border-purple-200 text-purple-900 text-[10px] font-medium flex items-center gap-1"
                    >
                      <CheckCircle2 size={10} className="text-purple-600 shrink-0" />
                      <span>{deliv}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive WBS Table by Workstream & Phase */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Workstream Track & Staffing Matrix</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Detailed effort distribution, staffing run-rate, and lead role accountability</p>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Total Target: <span className="font-mono text-slate-900 font-bold">{(Math.round(data.targetHours || 0)).toLocaleString()} hrs</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Workstream Track</th>
                <th className="py-3 px-3">Lead Role</th>
                <th className="py-3 px-3">Timeline</th>
                <th className="py-3 px-3 text-right">Effort (Hrs)</th>
                <th className="py-3 px-3 text-right">Person-Months</th>
                <th className="py-3 px-3 text-right">Avg FTE</th>
                <th className="py-3 px-3">Key Deliverables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.workstreamHours.map((ws) => {
                const isParallel = ws.isParallel || ws.id === 'ws_gov_steerco' || ws.id === 'ws_pmo_gov' || ws.id === 'ws_ocm_train';

                return (
                  <tr key={ws.id} className={`hover:bg-slate-50/80 transition ${isParallel ? 'bg-slate-50/40' : ''}`}>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-none shrink-0" style={{ backgroundColor: ws.color }} />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{ws.name}</span>
                            {isParallel && (
                              <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-none">
                                PARALLEL
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{ws.category} Track</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600">{ws.leadRole}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      W{ws.startWeek} - W{ws.endWeek}
                      {isParallel && <span className="block text-[9px] text-slate-400 font-sans">Full Lifecycle</span>}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {(Math.round(ws.hours || 0)).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {ws.personMonths.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-700">
                      {ws.avgFTE.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 text-[11px] max-w-xs truncate" title={ws.deliverables.join(', ')}>
                      {ws.deliverables.join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

