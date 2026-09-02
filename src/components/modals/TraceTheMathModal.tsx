import React, { useState, useMemo } from 'react';
import {
  Calculator,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Layers,
  Users,
  Copy,
  Check,
  ArrowRight,
  Info,
  Scale,
  Percent,
  Cpu,
  Database,
  Building,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  ModuleEffortEstimate,
  OracleModule,
  TShirtSize
} from '../../types';
import { T_SHIRT_BASE_HOURS } from '../../utils/calculator';
import { ORACLE_MODULE_CATALOG, IMPLEMENTATION_PHASES } from '../../data/oraclePhases';
import { T_SHIRT_CONFIG } from '../common/TShirtBadge';

interface TraceTheMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  initialTarget?: OracleModule | 'project_total';
}

export const TraceTheMathModal: React.FC<TraceTheMathModalProps> = ({
  isOpen,
  onClose,
  scenario,
  data,
  initialTarget = 'project_total'
}) => {
  const [activeTarget, setActiveTarget] = useState<OracleModule | 'project_total'>(initialTarget);
  const [activeTab, setActiveTab] = useState<'equation' | 'waterfall' | 'rolemix'>('equation');
  const [copied, setCopied] = useState(false);

  // Sync initial target if it changes when modal opens
  React.useEffect(() => {
    if (initialTarget) {
      setActiveTarget(initialTarget);
    }
  }, [initialTarget, isOpen]);

  const isProjectTotal = activeTarget === 'project_total';
  const selectedEstimate: ModuleEffortEstimate | undefined = !isProjectTotal
    ? (data.moduleEstimates || []).find(m => m.moduleId === activeTarget)
    : undefined;

  const selectedModDef = !isProjectTotal
    ? ORACLE_MODULE_CATALOG.find(m => m.id === activeTarget) || scenario.customModules?.find(m => m.id === activeTarget)
    : undefined;

  // Modifiers breakdown
  const complexMultiplier = data.complexMultiplier || 1.0;
  const netClientModifier = data.netClientModifier || 1.0;
  const rolloutMultiplier = data.rolloutMultiplier || 1.0;
  const globalMultiplier = scenario.globalComplexityMultiplier || 1.0;
  const contingencyPct = data.contingencyPct || 0.15;

  const compoundMultiplier = Number((complexMultiplier * netClientModifier * rolloutMultiplier * globalMultiplier).toFixed(3));

  // Module specific values
  const modTShirt = selectedEstimate?.tShirtSize || 'M';
  const modBaseTShirtHours = T_SHIRT_BASE_HOURS[modTShirt] || 640;
  const modComplexityFactor = selectedModDef?.complexityFactor || 1.0;
  const modBaseHours = selectedEstimate?.baseHours || Math.round(modBaseTShirtHours * modComplexityFactor);
  const modScaleHours = selectedEstimate?.scaleAttributedHours || 0;
  const modRawHours = selectedEstimate?.rawModuleHours || (modBaseHours + modScaleHours);
  const modP50 = selectedEstimate?.finalP50Hours || Math.round(modRawHours * compoundMultiplier);
  const modP80 = selectedEstimate?.finalP80Hours || Math.round(modP50 * (1 + contingencyPct));

  // Project total values
  const projBaseHours = Math.round(data.totalBaseHours || 0);
  const projModuleBaseHours = Math.round(data.moduleBaseHours || 0);
  const projScaleBaseHours = Math.round(data.scaleBaseHours || 0);
  const projP50 = Math.round(data.p50_BaselineHours || 0);
  const projP80 = Math.round(data.p80_DefensibleHours || data.targetHours || 0);

  // Copy formula text
  const formulaString = isProjectTotal
    ? `H_P80 = [Base_Hours (${projBaseHours}h)] × Complexity (${complexMultiplier.toFixed(2)}) × Client_Friction (${netClientModifier.toFixed(2)}) × Rollout (${rolloutMultiplier.toFixed(2)}) × (1 + Contingency (${(contingencyPct * 100).toFixed(1)}%)) = ${projP80.toLocaleString()} hrs`
    : `${selectedEstimate?.moduleName || activeTarget} P80 = [Base (${modBaseHours}h) + Scale (${modScaleHours}h)] × Compound_Modifier (${compoundMultiplier.toFixed(2)}x) × (1 + ${(contingencyPct * 100).toFixed(1)}%) = ${modP80.toLocaleString()} hrs`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formulaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Waterfall steps calculation
  const waterfallSteps = useMemo(() => {
    const baseVal = isProjectTotal ? projBaseHours : modRawHours;
    
    // Step 1: Base
    const step1 = {
      name: isProjectTotal ? 'Base Configuration Pool' : 'Raw Module Base & Scale',
      hours: baseVal,
      delta: 0,
      factor: 1.0,
      description: isProjectTotal 
        ? `Sum of ${scenario.selectedModules.length} in-scope module baseline configurations & scale drivers`
        : `T-Shirt ${modTShirt} (${modBaseHours}h) + Attributed scale drivers (${modScaleHours}h)`,
      type: 'base'
    };

    // Step 2: Strategic Complexity Multiplier
    const afterStrategic = Math.round(baseVal * complexMultiplier);
    const deltaStrategic = afterStrategic - baseVal;
    const step2 = {
      name: 'Strategic Pillar Complexity Uplift',
      hours: afterStrategic,
      delta: deltaStrategic,
      factor: complexMultiplier,
      description: `Weighted score across ERP, SCM, HCM and Technical footprint (${complexMultiplier.toFixed(2)}x)`,
      type: 'multiplier'
    };

    // Step 3: Client Friction Factors (individual itemized contribution)
    const cm = scenario.clientModifiers;
    const frictionFactors = [
      { name: 'Decision Velocity SLA', val: cm.decisionVelocity, default: 1.0 },
      { name: 'Legacy Data Debt & Cleansing', val: cm.dataDebt, default: 1.0 },
      { name: 'Cloud Mindset vs Customization', val: cm.cloudMindset, default: 1.0 },
      { name: 'Client SME Dedicated Availability', val: cm.smeAvailability, default: 1.0 },
      { name: 'Middleware & Integration Volatility', val: cm.integrationVolatility, default: 1.0 },
      { name: 'Statutory Tax & Regulatory Burden', val: cm.regulatoryCompliance, default: 1.0 },
      { name: 'Workforce Change Resistance', val: cm.changeResistance, default: 1.0 }
    ];

    let currentFrictionTotal = afterStrategic;
    const frictionSteps = frictionFactors
      .filter(f => f.val !== 1.0)
      .map(f => {
        const nextVal = Math.round(currentFrictionTotal * f.val);
        const delta = nextVal - currentFrictionTotal;
        currentFrictionTotal = nextVal;
        return {
          name: `Client Friction: ${f.name}`,
          hours: currentFrictionTotal,
          delta,
          factor: f.val,
          description: f.val > 1.0 ? `Adds friction overhead (${f.val.toFixed(2)}x)` : `Efficiency accelerator (${f.val.toFixed(2)}x)`,
          type: 'friction'
        };
      });

    // Rollout Strategy Multiplier
    const afterRollout = Math.round(currentFrictionTotal * rolloutMultiplier);
    const deltaRollout = afterRollout - currentFrictionTotal;
    const stepRollout = {
      name: `Rollout Architecture (${scenario.rolloutApproach === 'big_bang' ? 'Single Wave' : `${scenario.rolloutWaves || 2} Waves`})`,
      hours: afterRollout,
      delta: deltaRollout,
      factor: rolloutMultiplier,
      description: `Legacy coexistence, wave staging & synchronization overhead (${rolloutMultiplier.toFixed(2)}x)`,
      type: 'multiplier'
    };

    // P50 Baseline
    const finalP50 = afterRollout;

    // Contingency Buffer (P80)
    const finalP80 = Math.round(finalP50 * (1 + contingencyPct));
    const deltaContingency = finalP80 - finalP50;
    const stepContingency = {
      name: `Statistical Contingency Buffer (+${(contingencyPct * 100).toFixed(1)}%)`,
      hours: finalP80,
      delta: deltaContingency,
      factor: 1 + contingencyPct,
      description: `Defensible risk protection based on ${Math.round(scenario.confidence * 100)}% project confidence rating`,
      type: 'buffer'
    };

    return [step1, step2, ...frictionSteps, stepRollout, stepContingency];
  }, [
    isProjectTotal,
    projBaseHours,
    modRawHours,
    modTShirt,
    modBaseHours,
    modScaleHours,
    scenario.selectedModules.length,
    scenario.clientModifiers,
    scenario.rolloutApproach,
    scenario.rolloutWaves,
    scenario.confidence,
    complexMultiplier,
    rolloutMultiplier,
    contingencyPct
  ]);

  // Delivery Mix Role Split calculation
  const deliveryMix = scenario.deliveryMix || { onshore: 0.35, nearshore: 0.15, offshore: 0.50 };
  const targetHourPool = isProjectTotal ? projP80 : modP80;

  const onshoreHours = Math.round(targetHourPool * deliveryMix.onshore);
  const nearshoreHours = Math.round(targetHourPool * deliveryMix.nearshore);
  const offshoreHours = Math.round(targetHourPool * deliveryMix.offshore);

  // Phase allocation breakdown
  const phaseBreakdown = IMPLEMENTATION_PHASES.map(phase => {
    const durationPct = (phase.endWeekPct - phase.startWeekPct);
    const approxHours = Math.round(targetHourPool * durationPct);
    return {
      name: phase.name,
      code: phase.code,
      pct: Math.round(durationPct * 100),
      hours: approxHours,
      color: phase.color
    };
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-sm bg-white/10 text-amber-400 border border-white/15">
              <Calculator size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Estimation Engine Transparency
                </span>
                <span className="px-1.5 py-0.5 rounded-none bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  100% Deterministic Lineage
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Trace the Math: Arithmetic Calculation & Modifiers Audit
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close Math Trace"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Switcher Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Layers size={13} />
              <span>Scoping Target:</span>
            </span>

            <select
              value={activeTarget}
              onChange={(e) => setActiveTarget(e.target.value as OracleModule | 'project_total')}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-xs font-bold text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="project_total">Full Project Total ({projP80.toLocaleString()} P80 hrs)</option>
              <optgroup label="In-Scope Oracle Modules">
                {(data.moduleEstimates || []).map(m => (
                  <option key={m.moduleId} value={m.moduleId}>
                    {m.pillar} &bull; {m.moduleName} ({m.tShirtSize} &bull; {m.finalP80Hours.toLocaleString()} hrs)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-sm">
            <button
              onClick={() => setActiveTab('equation')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'equation'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Scale size={13} />
              <span>1. Equation Trace</span>
            </button>

            <button
              onClick={() => setActiveTab('waterfall')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'waterfall'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={13} />
              <span>2. Modifier Waterfall</span>
            </button>

            <button
              onClick={() => setActiveTab('rolemix')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rolemix'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              <span>3. Role & Phase Mix</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Formula Card */}
          <div className="p-4 rounded-sm bg-slate-900 text-white space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {isProjectTotal ? 'Global Program Master Formula' : `Module Scoping Equation: ${selectedEstimate?.moduleName}`}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  PERT Defensible Standard (P80)
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                title="Copy Formula String"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-white/10 rounded-sm font-mono text-sm sm:text-base text-amber-300 overflow-x-auto whitespace-pre">
              {formulaString}
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase">Base Effort Pool</span>
                <span className="text-white font-bold">
                  {(isProjectTotal ? projBaseHours : modRawHours).toLocaleString()} hrs
                </span>
              </div>

              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase">Compound Factor</span>
                <span className="text-amber-300 font-bold">
                  {compoundMultiplier.toFixed(2)}x
                </span>
              </div>

              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase">Staffing Baseline (P50)</span>
                <span className="text-slate-200 font-bold">
                  {(isProjectTotal ? projP50 : modP50).toLocaleString()} hrs
                </span>
              </div>

              <div className="p-2 rounded-sm bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase">Contract Target (P80)</span>
                <span className="text-emerald-400 font-bold">
                  {(isProjectTotal ? projP80 : modP80).toLocaleString()} hrs
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: EQUATION & STEP-BY-STEP ARITHMETIC TRACE */}
          {activeTab === 'equation' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border border-slate-200 rounded-sm divide-y divide-slate-200 bg-white shadow-xs">
                {/* STEP 1 */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-sm bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isProjectTotal ? 'Baseline Module Configuration Pool' : `T-Shirt Size Baseline: ${selectedEstimate?.tShirtSize}`}
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {(isProjectTotal ? projModuleBaseHours : modBaseHours).toLocaleString()} hrs
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {isProjectTotal ? (
                      <>
                        Combined baseline configuration hours for all <strong>{scenario.selectedModules.length} selected modules</strong> based on their intrinsic Modern Best Practice configuration workbooks.
                      </>
                    ) : (
                      <>
                        Tiered baseline effort derived from 20-Question functional interview (Average Score:{' '}
                        <strong>{selectedEstimate?.questionnaireAvgScore.toFixed(2)} / 4.00</strong>). T-Shirt size{' '}
                        <strong>{modTShirt}</strong> benchmark is {modBaseTShirtHours}h &times; {modComplexityFactor}x module complexity factor ={' '}
                        <strong>{modBaseHours} hrs</strong>.
                      </>
                    )}
                  </p>
                </div>

                {/* STEP 2 */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-sm bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isProjectTotal ? 'Enterprise Scale Drivers & Technical Footprint' : 'Attributed Physical Scale Footprint'}
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-sm text-blue-700">
                      +{(isProjectTotal ? projScaleBaseHours : modScaleHours).toLocaleString()} hrs
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {isProjectTotal ? (
                      <>
                        Effort increments driven by physical enterprise topology (Plants, Warehouses, Ledgers, Legal Entities, Currencies, Tax Regimes) and CEMLI technical objects (FBDI data conversions, OIC integrations, reports).
                      </>
                    ) : (
                      <>
                        Scale drivers directly attributed to this functional domain:{' '}
                        <strong>
                          {selectedEstimate?.keyComplexityDrivers && selectedEstimate.keyComplexityDrivers.length > 0
                            ? selectedEstimate.keyComplexityDrivers.join(', ')
                            : 'Standard MBP Footprint'}
                        </strong>.
                      </>
                    )}
                  </p>
                </div>

                {/* STEP 3 */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-sm bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        Compound Delivery Multipliers
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-sm text-amber-700">
                      &times; {compoundMultiplier.toFixed(2)}x
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Pillar Complexity</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{complexMultiplier.toFixed(2)}x</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Domain functional depth</span>
                    </div>

                    <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Client Friction</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{netClientModifier.toFixed(2)}x</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Data debt, velocity, SMEs</span>
                    </div>

                    <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Rollout Architecture</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{rolloutMultiplier.toFixed(2)}x</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Coexistence & waves</span>
                    </div>
                  </div>
                </div>

                {/* STEP 4 */}
                <div className="p-5 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-sm bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        4
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        Statistical Contingency & Defensible RFP Buffer
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      +{(contingencyPct * 100).toFixed(1)}% (+{(Math.round((isProjectTotal ? projP80 - projP50 : modP80 - modP50))).toLocaleString()} hrs)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Converts P50 baseline staffing ({(isProjectTotal ? projP50 : modP50).toLocaleString()} hrs) into defensible contract quote (P80: {(isProjectTotal ? projP80 : modP80).toLocaleString()} hrs). Protects against unexpected discovery gaps, scope drift, and extended testing iterations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE MODIFIER COMPOUND WATERFALL */}
          {activeTab === 'waterfall' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Live Modifier Compound Waterfall
                  </h4>
                  <p className="text-xs text-slate-600">
                    Visual progression from raw engineering base effort to final contract basis.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Baseline: {(isProjectTotal ? projBaseHours : modRawHours).toLocaleString()}h &rarr; Final: {(isProjectTotal ? projP80 : modP80).toLocaleString()}h
                </span>
              </div>

              <div className="space-y-2">
                {waterfallSteps.map((step, idx) => {
                  const pctOfFinal = Math.min(100, Math.round((step.hours / (isProjectTotal ? projP80 : modP80)) * 100));
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-slate-200 rounded-sm shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            step.type === 'base'
                              ? 'bg-blue-600'
                              : step.type === 'multiplier'
                              ? 'bg-indigo-600'
                              : step.type === 'friction'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`} />
                          <span className="text-xs font-bold text-slate-900">{step.name}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono">
                          {step.delta !== 0 && (
                            <span className={`font-bold ${step.delta > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {step.delta > 0 ? `+${step.delta.toLocaleString()}h` : `${step.delta.toLocaleString()}h`}
                            </span>
                          )}
                          <span className="text-slate-400">|</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {step.hours.toLocaleString()} hrs
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden mb-1.5">
                        <div
                          className={`h-full transition-all duration-300 ${
                            step.type === 'base'
                              ? 'bg-blue-600'
                              : step.type === 'multiplier'
                              ? 'bg-indigo-600'
                              : step.type === 'friction'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${pctOfFinal}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ROLE-HOUR & DELIVERY MIX MAPPING */}
          {activeTab === 'rolemix' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Delivery Mix Pyramid */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Global Delivery Model & Regional Mix
                  </h4>
                  <p className="text-xs text-slate-600">
                    Resource distribution across Onsite Lead, Nearshore Hub, and Offshore Global Delivery Center (GDC).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Onsite Lead & Arch</span>
                      <span className="font-mono text-slate-900">{Math.round(deliveryMix.onshore * 100)}%</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-slate-900">
                      {onshoreHours.toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Solution design, governance, client workshops & cutover leads
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Nearshore Hub</span>
                      <span className="font-mono text-slate-900">{Math.round(deliveryMix.nearshore * 100)}%</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-slate-900">
                      {nearshoreHours.toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Timezone-aligned technical leads & functional consultants
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Offshore Delivery (GDC)</span>
                      <span className="font-mono text-slate-900">{Math.round(deliveryMix.offshore * 100)}%</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-slate-900">
                      {offshoreHours.toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Build, test execution, FBDI scripts, OIC transforms & reports
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Phase Allocation */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Phase-by-Phase Effort Distribution
                    </h4>
                    <p className="text-xs text-slate-600">
                      Mapped directly against Oracle Implementation methodology phases.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Total: {targetHourPool.toLocaleString()} hrs
                  </span>
                </div>

                <div className="space-y-2.5">
                  {phaseBreakdown.map((ph, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{ph.name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-500">{ph.pct}%</span>
                          <span className="font-bold text-slate-900">{ph.hours.toLocaleString()} hrs</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${ph.pct}%`, backgroundColor: ph.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Info size={14} className="text-slate-400" />
            <span>Auditable for Solution Review Boards & SteerCo approvals</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Close Math Trace
          </button>
        </div>
      </div>
    </div>
  );
};
