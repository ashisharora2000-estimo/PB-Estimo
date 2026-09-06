import React, { useState } from 'react';
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
  Save
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule } from '../../types';
import { exportWbsToCsv } from '../../utils/exporter';
import { ModuleTShirtMatrix } from '../common/ModuleTShirtMatrix';
import { TShirtBadge } from '../common/TShirtBadge';
import { CLIENT_FRICTION_FACTORS_DEF } from '../../data/clientFrictionData';

interface EstimationEngineViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenComplexityStudio?: (tab?: 'complexity' | 'questions' | 'drivers' | 'ai_advisor') => void;
  onOpenTraceMath?: (target?: OracleModule | 'project_total') => void;
  onSaveScenario?: () => void;
}

export const EstimationEngineView: React.FC<EstimationEngineViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onOpenComplexityStudio,
  onOpenTraceMath,
  onSaveScenario
}) => {
  const [showDriverCalibration, setShowDriverCalibration] = useState<boolean>(false);
  const [showAllFrictionFactors, setShowAllFrictionFactors] = useState<boolean>(false);

  const updateConfidence = (val: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      confidence: Math.max(0.4, Math.min(0.95, val))
    }));
  };

  const updateScaleDriver = (key: keyof ProjectScenario['scaleDrivers'], val: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        [key]: Math.max(0, val)
      }
    }));
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">OIC Integrations</label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={scenario.scaleDrivers.tech_oic || 0}
                  onChange={(e) => updateScaleDriver('tech_oic', parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">Endpoints / APIs</span>
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

              <div className="bg-white p-2.5 rounded-sm border border-slate-200 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Payroll Parallels</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={scenario.scaleDrivers.test_payroll_parallels || 0}
                  onChange={(e) => updateScaleDriver('test_payroll_parallels', parseInt(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 border border-slate-300 px-2 py-1 text-xs"
                />
                <span className="text-[9px] text-slate-400 block">Parallel Runs</span>
              </div>
            </div>
          </div>
        )}

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
                      <span>OIC Integrations</span>
                      <span className="font-mono font-bold">{scenario.scaleDrivers.tech_oic || 0}</span>
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

