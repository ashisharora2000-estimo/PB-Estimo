import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Zap,
  Check,
  Copy,
  Save,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Clock,
  Calendar,
  Layers,
  X,
  Percent,
  Sparkles,
  Target,
  FileText,
  AlertTriangle,
  Building,
  CheckCircle2
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule } from '../../types';
import { calculateProjectMetrics } from '../../utils/calculator';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';

interface WhatIfTradeoffSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  calculatedData: CalculatedProjectData;
  onApplyScenario: (updated: ProjectScenario) => void;
  onSaveAsVariantScenario?: (variant: ProjectScenario) => void;
}

export const WhatIfTradeoffSimulatorModal: React.FC<WhatIfTradeoffSimulatorModalProps> = ({
  isOpen,
  onClose,
  scenario,
  calculatedData,
  onApplyScenario,
  onSaveAsVariantScenario
}) => {
  if (!isOpen) return null;

  // Baseline scenario values
  const baselineCutover = scenario.scaleDrivers.fin_cutover_strategy || 'day1_fiscal';
  const baselineEinvoicing = scenario.scaleDrivers.fin_einvoicing_countries ?? 0;
  const baselineBankWeeks = scenario.scaleDrivers.fin_bank_cert_weeks ?? 8;
  const baselineSecondaryLedgers = scenario.scaleDrivers.fin_secondary_ledgers ?? 0;
  const baselineMockCycles = scenario.scaleDrivers.tech_conversion_cycles ?? 3;
  const baselineHistYears = scenario.scaleDrivers.tech_historical_years ?? 1;
  const baselineOic = scenario.scaleDrivers.tech_oic ?? 0;
  const baselineBip = scenario.scaleDrivers.tech_reports_bip ?? 0;
  const baselinePaas = scenario.scaleDrivers.tech_paas ?? 0;
  const baselineOnshore = scenario.deliveryMix?.onshore ?? 20;
  const baselineOffshore = scenario.deliveryMix?.offshore ?? 80;
  const baselineContingency = Math.round(
    scenario.contingencyPctOverride !== undefined
      ? scenario.contingencyPctOverride * 100
      : (calculatedData.contingencyPct ?? 15)
  );

  // Target Budget State (Default: 88% of current price rounded to $25k)
  const defaultTargetBudget = Math.max(
    500000,
    Math.round((calculatedData.deliveryRevenue * 0.88) / 25000) * 25000
  );
  const [targetBudget, setTargetBudget] = useState<number>(defaultTargetBudget);

  // Lever States
  const [cutoverStrategy, setCutoverStrategy] = useState<typeof baselineCutover>(baselineCutover);
  const [einvoicingCountries, setEinvoicingCountries] = useState<number>(baselineEinvoicing);
  const [bankCertWeeks, setBankCertWeeks] = useState<number>(baselineBankWeeks);
  const [secondaryLedgers, setSecondaryLedgers] = useState<number>(baselineSecondaryLedgers);
  const [conversionCycles, setConversionCycles] = useState<number>(baselineMockCycles);
  const [historicalYears, setHistoricalYears] = useState<number>(baselineHistYears);
  const [oicReductionPct, setOicReductionPct] = useState<number>(0);
  const [bipReductionPct, setBipReductionPct] = useState<number>(0);
  const [paasReductionPct, setPaasReductionPct] = useState<number>(0);
  const [deferredModuleIds, setDeferredModuleIds] = useState<string[]>([]);
  const [downsizeNonCoreComplexity, setDownsizeNonCoreComplexity] = useState<boolean>(false);
  const [onshorePct, setOnshorePct] = useState<number>(baselineOnshore);
  const [contingencyPct, setContingencyPct] = useState<number>(baselineContingency);

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Handle onshore/offshore blend
  const handleOnshoreSlider = (val: number) => {
    const on = Math.max(10, Math.min(60, val));
    setOnshorePct(on);
  };
  const offshorePct = 100 - onshorePct;

  // Construct simulated scenario
  const simulatedScenario: ProjectScenario = useMemo(() => {
    const updatedScale = {
      ...scenario.scaleDrivers,
      fin_cutover_strategy: cutoverStrategy,
      fin_einvoicing_countries: einvoicingCountries,
      fin_bank_cert_weeks: bankCertWeeks,
      fin_secondary_ledgers: secondaryLedgers,
      tech_conversion_cycles: conversionCycles,
      tech_historical_years: historicalYears,
      tech_oic: Math.max(0, Math.round(baselineOic * (1 - oicReductionPct / 100))),
      tech_reports_bip: Math.max(0, Math.round(baselineBip * (1 - bipReductionPct / 100))),
      tech_paas: Math.max(0, Math.round(baselinePaas * (1 - paasReductionPct / 100)))
    };

    // Filter modules
    const activeModules = scenario.selectedModules.filter(m => !deferredModuleIds.includes(m));

    // Downsize complexity overrides
    const moduleTShirtOverrides = { ...(scenario.moduleTShirtOverrides || {}) };
    if (downsizeNonCoreComplexity) {
      activeModules.forEach(mId => {
        // Leave core GL/AP untouched, downsize peripheral modules to S or M
        if (!['erp_gl', 'erp_ap', 'scm_inv'].includes(mId)) {
          moduleTShirtOverrides[mId] = 'M';
        }
      });
    }

    return {
      ...scenario,
      scaleDrivers: updatedScale,
      selectedModules: activeModules,
      moduleTShirtOverrides,
      deliveryMix: {
        onshore: onshorePct,
        nearshore: 0,
        offshore: offshorePct
      },
      contingencyPctOverride: contingencyPct / 100
    };
  }, [
    scenario,
    cutoverStrategy,
    einvoicingCountries,
    bankCertWeeks,
    secondaryLedgers,
    conversionCycles,
    historicalYears,
    oicReductionPct,
    bipReductionPct,
    paasReductionPct,
    deferredModuleIds,
    downsizeNonCoreComplexity,
    onshorePct,
    offshorePct,
    contingencyPct,
    baselineOic,
    baselineBip,
    baselinePaas
  ]);

  // Recalculate metrics on the fly!
  const simMetrics = useMemo(() => {
    return calculateProjectMetrics(simulatedScenario);
  }, [simulatedScenario]);

  // Delta calculations
  const baselinePrice = calculatedData.deliveryRevenue;
  const simPrice = simMetrics.deliveryRevenue;
  const deltaPrice = simPrice - baselinePrice;
  const pctPriceChange = baselinePrice > 0 ? (deltaPrice / baselinePrice) * 100 : 0;

  const baselineHours = calculatedData.targetHours;
  const simHours = simMetrics.targetHours;
  const deltaHours = simHours - baselineHours;

  const baselineWeeks = calculatedData.scheduleFeasibility.totalWeeks || scenario.projectWeeks;
  const simWeeks = simMetrics.scheduleFeasibility.totalWeeks || simulatedScenario.projectWeeks;
  const deltaWeeks = simWeeks - baselineWeeks;

  const baselineMargin = calculatedData.grossMarginPct;
  const simMargin = simMetrics.grossMarginPct;
  const deltaMargin = simMargin - baselineMargin;

  const baselineBillRate = calculatedData.blendedBillRate;
  const simBillRate = simMetrics.blendedBillRate;
  const deltaBillRate = simBillRate - baselineBillRate;

  const budgetGap = simPrice - targetBudget;

  // Itemized Trade-Off Ledger
  const tradeOffItems = useMemo(() => {
    const items: Array<{ category: string; title: string; savingHours: number; desc: string; type: 'scope' | 'commercial' | 'schedule' }> = [];

    if (cutoverStrategy !== baselineCutover) {
      const isDay1 = cutoverStrategy === 'day1_fiscal';
      items.push({
        category: 'Cutover & Accounting',
        title: isDay1 ? 'Day 1 Fiscal Clean Cutover' : `Cutover set to ${cutoverStrategy}`,
        savingHours: 220,
        desc: isDay1
          ? 'Eliminates mid-year asset life-to-date depreciation catch-up and open PO/AP GR-IR reconciliation debt (-2 weeks duration).'
          : 'Adjusted cutover timing model.',
        type: 'schedule'
      });
    }

    if (einvoicingCountries < baselineEinvoicing) {
      const diff = baselineEinvoicing - einvoicingCountries;
      items.push({
        category: 'Statutory E-Invoicing',
        title: `Defer ${diff} E-Invoicing Jurisdiction${diff > 1 ? 's' : ''} to Phase 2`,
        savingHours: diff * 160,
        desc: `Postpones real-time tax authority sandbox testing (ZATCA/KSeF/SDI) to post-go-live wave (-${Math.round(diff * 0.75 * 10) / 10}w SIT).`,
        type: 'scope'
      });
    }

    if (bankCertWeeks < baselineBankWeeks) {
      const diff = baselineBankWeeks - bankCertWeeks;
      items.push({
        category: 'Treasury & Banking',
        title: `Fast-Track Bank Testing Window (${bankCertWeeks}w vs ${baselineBankWeeks}w)`,
        savingHours: 80,
        desc: `Standardizes on domestic ACH/NACHA and pre-tested ISO 20022 formats, removing external bank certification queues.`,
        type: 'schedule'
      });
    }

    if (secondaryLedgers < baselineSecondaryLedgers) {
      const diff = baselineSecondaryLedgers - secondaryLedgers;
      items.push({
        category: 'GL Architecture',
        title: `Defer ${diff} Secondary Statutory Ledger${diff > 1 ? 's' : ''} to Wave 2`,
        savingHours: diff * 140,
        desc: `Consolidates initial go-live onto primary corporate ledger; local statutory adjustments handled via reporting ledgers.`,
        type: 'scope'
      });
    }

    if (conversionCycles < baselineMockCycles) {
      const diff = baselineMockCycles - conversionCycles;
      items.push({
        category: 'Data Migration',
        title: `Streamline Mock Cycles (${conversionCycles} Mocks vs ${baselineMockCycles})`,
        savingHours: Math.round(diff * 350),
        desc: `Enforces strict client pre-load data cleansing gate; eliminates redundant dry-run iterations.`,
        type: 'scope'
      });
    }

    if (historicalYears < baselineHistYears) {
      items.push({
        category: 'Data Conversion Depth',
        title: `Historical Data Scoping (${historicalYears} yr vs ${baselineHistYears} yrs)`,
        savingHours: Math.round((baselineHistYears - historicalYears) * 280),
        desc: `Limits legacy conversion to open balances and in-flight transactions, archiving dormant historical records.`,
        type: 'scope'
      });
    }

    if (oicReductionPct > 0) {
      const deferredCount = Math.round(baselineOic * (oicReductionPct / 100));
      items.push({
        category: 'Integration CEMLI',
        title: `Rationalize ${oicReductionPct}% OIC Batch Interfaces (~${deferredCount} APIs)`,
        savingHours: deferredCount * 65,
        desc: `Replaces automated batch feeds with standard FBDI scheduled file uploads for low-frequency external systems.`,
        type: 'scope'
      });
    }

    if (bipReductionPct > 0) {
      const count = Math.round(baselineBip * (bipReductionPct / 100));
      items.push({
        category: 'Reports & Analytics',
        title: `Convert ${bipReductionPct}% Custom BIP Reports to OTBI (~${count} Reports)`,
        savingHours: count * 35,
        desc: `Substitutes pixel-perfect custom data models with seeded Oracle Cloud Subject Areas and standard OTBI dashboards.`,
        type: 'scope'
      });
    }

    if (paasReductionPct > 0) {
      const count = Math.round(baselinePaas * (paasReductionPct / 100));
      items.push({
        category: 'PaaS Extensions',
        title: `Defer ${count} PaaS Extension${count > 1 ? 's' : ''} to Wave 2`,
        savingHours: count * 240,
        desc: `Leverages native Oracle Redwood Visual Builder Studio express rules instead of full custom OCI PaaS web applications.`,
        type: 'scope'
      });
    }

    if (deferredModuleIds.length > 0) {
      deferredModuleIds.forEach(mId => {
        const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === mId);
        items.push({
          category: 'Module Footprint Phasing',
          title: `Defer ${modDef?.name || mId} to Phase 2 Wave`,
          savingHours: 480,
          desc: `Removes peripheral module from initial cutover; isolates core transaction backbone for day-one stabilization.`,
          type: 'scope'
        });
      });
    }

    if (downsizeNonCoreComplexity) {
      items.push({
        category: '20-Question Complexity',
        title: 'Downsize Non-Core Modules to Standard (M)',
        savingHours: 520,
        desc: 'Enforces standard Vanilla Oracle modern best practice workflows; eliminates custom approval matrices and complex SLA rules.',
        type: 'scope'
      });
    }

    if (onshorePct !== baselineOnshore) {
      const diff = baselineOnshore - onshorePct;
      items.push({
        category: 'Global Staffing Pyramid',
        title: `Shift Delivery Mix to ${onshorePct}% Onshore / ${offshorePct}% Offshore`,
        savingHours: 0,
        desc: `Increases Global Delivery Center (GDC) build factory leverage, reducing blended bill rate from $${Math.round(baselineBillRate)}/h to $${Math.round(simBillRate)}/h.`,
        type: 'commercial'
      });
    }

    if (contingencyPct !== baselineContingency) {
      items.push({
        category: 'Risk Buffer',
        title: `Adjust Contingency Reserve to ${contingencyPct}% (from ${baselineContingency}%)`,
        savingHours: 0,
        desc: `Calibrates commercial contingency buffer to target client pricing appetite.`,
        type: 'commercial'
      });
    }

    return items;
  }, [
    cutoverStrategy,
    baselineCutover,
    einvoicingCountries,
    baselineEinvoicing,
    bankCertWeeks,
    baselineBankWeeks,
    secondaryLedgers,
    baselineSecondaryLedgers,
    conversionCycles,
    baselineMockCycles,
    historicalYears,
    baselineHistYears,
    oicReductionPct,
    bipReductionPct,
    paasReductionPct,
    baselineOic,
    baselineBip,
    baselinePaas,
    deferredModuleIds,
    downsizeNonCoreComplexity,
    onshorePct,
    offshorePct,
    baselineOnshore,
    baselineBillRate,
    simBillRate,
    contingencyPct,
    baselineContingency
  ]);

  // Quick Preset Handlers
  const handleReset = () => {
    setCutoverStrategy(baselineCutover);
    setEinvoicingCountries(baselineEinvoicing);
    setBankCertWeeks(baselineBankWeeks);
    setSecondaryLedgers(baselineSecondaryLedgers);
    setConversionCycles(baselineMockCycles);
    setHistoricalYears(baselineHistYears);
    setOicReductionPct(0);
    setBipReductionPct(0);
    setPaasReductionPct(0);
    setDeferredModuleIds([]);
    setDownsizeNonCoreComplexity(false);
    setOnshorePct(baselineOnshore);
    setContingencyPct(baselineContingency);
    setAppliedNotification('Reset all simulator levers to baseline.');
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  const handleApplyFastTrackPreset = () => {
    setCutoverStrategy('day1_fiscal');
    setBankCertWeeks(4);
    setConversionCycles(2);
    setHistoricalYears(0);
    setSecondaryLedgers(0);
    if (einvoicingCountries > 0) setEinvoicingCountries(0);
    setOicReductionPct(25);
    setBipReductionPct(30);
    setAppliedNotification('Applied "Fast-Track Core Go-Live" Preset: Clean cutover, 2 mocks, fast-track bank & reports.');
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  const handleApplyMarginProtectionPreset = () => {
    setOnshorePct(15);
    setContingencyPct(12);
    setBipReductionPct(35);
    setDownsizeNonCoreComplexity(true);
    setAppliedNotification('Applied "Margin & Rate Optimization" Preset: 85% Offshore, 12% Contingency, OTBI analytics.');
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  const handleAutoCloseBudgetGap = () => {
    // Intelligently configure levers to hit target budget
    setCutoverStrategy('day1_fiscal');
    setBankCertWeeks(4);
    setConversionCycles(2);
    setHistoricalYears(1);
    setOicReductionPct(20);
    setBipReductionPct(25);
    setOnshorePct(15);
    setContingencyPct(10);
    setAppliedNotification(`Auto-engineered trade-offs to close budget gap toward $${targetBudget.toLocaleString()}.`);
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  // Copy Oral Defense Executive Brief
  const handleCopyDefenseScript = () => {
    const savingsFormatted = Math.abs(deltaPrice).toLocaleString();
    const weeksFormatted = Math.abs(deltaWeeks);
    const clientName = scenario.clientName || 'Client';

    const script = [
      `📢 ORAL DEFENSE / STEERCO TRADE-OFF BRIEF: ${scenario.name.toUpperCase()}`,
      `══════════════════════════════════════════════════════════════════════════`,
      `EXECUTIVE VALUE PROPOSITION:`,
      `"To meet ${clientName}'s target investment of $${targetBudget.toLocaleString()}, we engineered a defensible Scope & Sourcing Variant (Option B) that reduces fixed-fee price by $${savingsFormatted} (${Math.abs(pctPriceChange).toFixed(1)}%) while accelerating go-live by ${weeksFormatted} weeks, without compromising day-one transaction integrity."`,
      ``,
      `COMMERCIAL & DELIVERY COMPARISON:`,
      `• Fixed-Fee Commercials: $${baselinePrice.toLocaleString()} ➔ $${simPrice.toLocaleString()} (Saving: $${savingsFormatted})`,
      `• Implementation Runway: ${baselineWeeks} weeks ➔ ${simWeeks} weeks (${deltaWeeks <= 0 ? `-${Math.abs(deltaWeeks)} weeks faster` : `+${deltaWeeks} weeks`})`,
      `• Total Labor Effort: ${baselineHours.toLocaleString()}h ➔ ${simHours.toLocaleString()}h (Net delta: ${deltaHours.toLocaleString()}h)`,
      `• Blended Rate: $${Math.round(baselineBillRate)}/h ➔ $${Math.round(simBillRate)}/h (via optimized ${onshorePct}/${offshorePct} delivery pyramid)`,
      `• Delivery Assurance & DoA: ${simMetrics.doaClassification} | Confidence: ${simMetrics.deliveryAssurance.overallConfidenceRating}%`,
      ``,
      `ITEMIZED VALUE TRADE-OFFS & CONCESSIONS (${tradeOffItems.length} LEVERS):`,
      ...tradeOffItems.map((item, idx) => `  ${idx + 1}. [${item.category}] ${item.title}: ${item.desc}`),
      `══════════════════════════════════════════════════════════════════════════`,
      `Generated by PB-Estimo Live Oral Defense & Margin Trade-Off Simulator`
    ].join('\n');

    navigator.clipboard.writeText(script);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Apply directly to active scenario
  const handleApplyToActive = () => {
    onApplyScenario(simulatedScenario);
    onClose();
  };

  // Save as Variant Proposal
  const handleSaveAsVariant = () => {
    if (onSaveAsVariantScenario) {
      const variant: ProjectScenario = {
        ...simulatedScenario,
        id: `proposal-variant-${Date.now()}`,
        name: `${scenario.name} (Budget Optimized Option B)`,
        description: `Client negotiation variant optimized for $${targetBudget.toLocaleString()} budget with ${tradeOffItems.length} strategic scope/sourcing trade-offs.`,
        proposalCreatedAt: new Date().toISOString()
      };
      onSaveAsVariantScenario(variant);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-6xl rounded-sm shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-amber-500 text-slate-950 flex items-center justify-center">
              <SlidersHorizontal size={17} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  "What-If" Margin & Scope Trade-off Simulator
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Live Oral Defense
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive sensitivity modeling for oral defenses: adjust cutover, CEMLI, and delivery mix to defend margin & hit client budget.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Reset all levers to current baseline"
            >
              <RotateCcw size={13} />
              <span>Reset Levers</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Applied Notification Banner */}
        {appliedNotification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{appliedNotification}</span>
          </div>
        )}

        {/* Target Budget & Quick Recipe Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Target size={14} className="text-indigo-600" />
              <span>Client Budget Target:</span>
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
              <input
                type="number"
                step={25000}
                value={targetBudget}
                onChange={(e) => setTargetBudget(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="pl-6 pr-3 py-1 bg-white border border-slate-300 rounded-sm text-xs font-mono font-bold text-slate-900 w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Budget Gap Badge */}
            <div className={`px-2.5 py-1 rounded-sm text-xs font-mono font-bold flex items-center gap-1.5 ${
              budgetGap <= 0
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {budgetGap <= 0 ? (
                <>
                  <Check size={13} className="text-emerald-700 stroke-[3]" />
                  <span>Budget Achieved (${Math.abs(budgetGap).toLocaleString()} under target)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={13} className="text-rose-700" />
                  <span>Gap to Target: +${budgetGap.toLocaleString()}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Recipe Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Oral Recipes:</span>
            <button
              onClick={handleAutoCloseBudgetGap}
              className="px-2.5 py-1 rounded-sm bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Intelligently toggle levers to close budget gap"
            >
              <Zap size={12} className="text-indigo-600" />
              <span>Hit Target Budget</span>
            </button>
            <button
              onClick={handleApplyFastTrackPreset}
              className="px-2.5 py-1 rounded-sm bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Clean cutover, 2 mocks, fast-track bank & reports"
            >
              <Clock size={12} className="text-emerald-600" />
              <span>Fast-Track Timeline</span>
            </button>
            <button
              onClick={handleApplyMarginProtectionPreset}
              className="px-2.5 py-1 rounded-sm bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="85% offshore mix with 12% contingency"
            >
              <DollarSign size={12} className="text-amber-600" />
              <span>Optimize Blended Rate</span>
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Left: Levers, Right: Live Comparison & Trade-off Ledger) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 custom-scrollbar">
          
          {/* LEFT: 4 Lever Categories (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Financial Architecture & Cutover Bottlenecks */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-xs bg-indigo-100 text-indigo-800 font-bold text-xs">A</div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Financial Architecture & Cutover Bottlenecks
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">SIT & Cutover schedule floors</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Cutover Strategy */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Financial Cutover Strategy</span>
                    {cutoverStrategy !== baselineCutover && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-xs">Modified</span>
                    )}
                  </div>
                  <select
                    value={cutoverStrategy}
                    onChange={(e) => setCutoverStrategy(e.target.value as any)}
                    className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="day1_fiscal">Day 1 Fiscal (Clean - No interim catch-up)</option>
                    <option value="quarter_end">Quarter-End Cutover (+60h)</option>
                    <option value="mid_year_fa_catchup">Mid-Year (+220h FA catchup & GR-IR)</option>
                    <option value="complex_multi_gaap">Multi-GAAP Restatement (+380h)</option>
                  </select>
                </div>

                {/* Bank Cert Window */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Bank Testing Window (Weeks)</span>
                    <span className="font-mono font-bold text-indigo-700">{bankCertWeeks} wks</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={16}
                    step={2}
                    value={bankCertWeeks}
                    onChange={(e) => setBankCertWeeks(parseInt(e.target.value, 10))}
                    className="accent-indigo-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>4w Domestic ACH</span>
                    <span>8w Tier-1 Bank</span>
                    <span>12w Global SWIFT</span>
                  </div>
                </div>

                {/* Statutory E-Invoicing Regimes */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">E-Invoicing Mandates</span>
                    <span className="font-mono font-bold text-indigo-700">{einvoicingCountries} regimes</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(4, baselineEinvoicing)}
                    step={1}
                    value={einvoicingCountries}
                    onChange={(e) => setEinvoicingCountries(parseInt(e.target.value, 10))}
                    className="accent-indigo-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 (Defer to Phase 2)</span>
                    <span>{baselineEinvoicing} Baseline</span>
                  </div>
                </div>

                {/* Secondary Ledgers */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Secondary Statutory Ledgers</span>
                    <span className="font-mono font-bold text-indigo-700">{secondaryLedgers} ledgers</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(3, baselineSecondaryLedgers)}
                    step={1}
                    value={secondaryLedgers}
                    onChange={(e) => setSecondaryLedgers(parseInt(e.target.value, 10))}
                    className="accent-indigo-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 (Single Ledger)</span>
                    <span>{baselineSecondaryLedgers} Baseline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Technical CEMLI & Data Conversion De-Scoping */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-xs bg-amber-100 text-amber-800 font-bold text-xs">B</div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Technical CEMLI & Data Conversion De-Scoping
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Data cycles & interface rationalization</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Mock Cycles */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Conversion Mock Cycles</span>
                    <span className="font-mono font-bold text-amber-700">{conversionCycles} Mocks</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setConversionCycles(cycle)}
                        className={`py-1 text-xs font-bold rounded-xs border transition cursor-pointer ${
                          conversionCycles === cycle
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cycle} Mock{cycle > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Historical Data Years */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Historical Data Depth</span>
                    <span className="font-mono font-bold text-amber-700">
                      {historicalYears === 0 ? 'Open Balances Only' : `${historicalYears} Yr${historicalYears > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setHistoricalYears(yr)}
                        className={`py-1 text-xs font-bold rounded-xs border transition cursor-pointer ${
                          historicalYears === yr
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {yr === 0 ? 'Open Only' : `${yr} Yr${yr > 1 ? 's' : ''}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OIC Reduction */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">OIC Interfaces Deferred</span>
                    <span className="font-mono font-bold text-amber-700">
                      {oicReductionPct}% ({Math.round(baselineOic * (oicReductionPct / 100))} APIs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={10}
                    value={oicReductionPct}
                    onChange={(e) => setOicReductionPct(parseInt(e.target.value, 10))}
                    className="accent-amber-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (All {baselineOic})</span>
                    <span>25% Defer</span>
                    <span>50% Defer</span>
                  </div>
                </div>

                {/* BIP Reports to OTBI */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Custom Reports to OTBI</span>
                    <span className="font-mono font-bold text-amber-700">
                      {bipReductionPct}% ({Math.round(baselineBip * (bipReductionPct / 100))} Reports)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={10}
                    value={bipReductionPct}
                    onChange={(e) => setBipReductionPct(parseInt(e.target.value, 10))}
                    className="accent-amber-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% Custom</span>
                    <span>30% OTBI</span>
                    <span>60% Seeded</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Module Scope & Phasing (Wave 2 Deferral) */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-xs bg-emerald-100 text-emerald-800 font-bold text-xs">C</div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Module Footprint & Phasing (Wave Deferral)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDownsizeNonCoreComplexity(!downsizeNonCoreComplexity)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                      downsizeNonCoreComplexity
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {downsizeNonCoreComplexity ? '✓ Non-Core Complexity Standard (M)' : 'Downsize Non-Core to M'}
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {scenario.selectedModules.length - deferredModuleIds.length}/{scenario.selectedModules.length} In-Scope
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500">
                  Select peripheral modules to defer to a subsequent Phase 2 wave to de-risk core go-live:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {scenario.selectedModules.map(mId => {
                    const modDef = ORACLE_MODULE_CATALOG.find(m => m.id === mId);
                    const isDeferred = deferredModuleIds.includes(mId);
                    const isCore = ['erp_gl', 'erp_ap', 'scm_inv'].includes(mId);

                    return (
                      <button
                        key={mId}
                        type="button"
                        disabled={isCore}
                        onClick={() => {
                          if (isDeferred) {
                            setDeferredModuleIds(deferredModuleIds.filter(id => id !== mId));
                          } else {
                            setDeferredModuleIds([...deferredModuleIds, mId]);
                          }
                        }}
                        className={`p-1.5 rounded-xs border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                          isCore
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : isDeferred
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                        title={isCore ? 'Core foundation module - cannot be deferred' : 'Click to toggle deferral to Phase 2'}
                      >
                        <div className="truncate pr-1">
                          <span className="font-semibold block truncate">{modDef?.name || mId}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{mId.toUpperCase()}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1 rounded-xs uppercase shrink-0 ${
                          isCore ? 'bg-slate-200 text-slate-600' : isDeferred ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isCore ? 'Core' : isDeferred ? 'Wave 2' : 'Wave 1'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Commercial & Global Staffing Levers */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-xs bg-purple-100 text-purple-800 font-bold text-xs">D</div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Commercial & Global Staffing Levers
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Pyramid & contingency tuning</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Onshore / Offshore Blend */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Global Delivery Blend</span>
                    <span className="font-mono font-bold text-purple-700">
                      {onshorePct}% On / {offshorePct}% Off
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={onshorePct}
                    onChange={(e) => handleOnshoreSlider(parseInt(e.target.value, 10))}
                    className="accent-purple-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10/90 (High GDC)</span>
                    <span>20/80 (Standard)</span>
                    <span>40/60 (Onsite Heavy)</span>
                  </div>
                </div>

                {/* Contingency Buffer */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Risk Contingency Buffer</span>
                    <span className="font-mono font-bold text-purple-700">{contingencyPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    step={1}
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(parseInt(e.target.value, 10))}
                    className="accent-purple-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5% Lean</span>
                    <span>15% Standard</span>
                    <span>25% High Risk</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Live Impact Matrix & Itemized Trade-Off Ledger (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Real-time Side-by-Side Comparison Card */}
            <div className="bg-slate-900 text-white rounded-sm p-4 shadow-md space-y-3.5 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Side-by-Side Impact Matrix
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase ${
                  deltaPrice <= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {deltaPrice <= 0 ? `-$${Math.abs(deltaPrice).toLocaleString()} (-${Math.abs(pctPriceChange).toFixed(1)}%)` : `+$${deltaPrice.toLocaleString()}`}
                </span>
              </div>

              {/* 4 Metric Comparison Rows */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Fixed Fee Price */}
                <div className="bg-slate-800/80 p-2.5 rounded-xs border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Fixed-Fee Price</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs font-mono text-slate-400 line-through">
                      ${Math.round(baselinePrice / 1000)}k
                    </span>
                    <span className={`text-base font-mono font-bold ${deltaPrice <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${Math.round(simPrice / 1000)}k
                    </span>
                  </div>
                </div>

                {/* Calendar Duration */}
                <div className="bg-slate-800/80 p-2.5 rounded-xs border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Duration (Weeks)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs font-mono text-slate-400 line-through">
                      {baselineWeeks}w
                    </span>
                    <span className={`text-base font-mono font-bold ${deltaWeeks <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {simWeeks}w {deltaWeeks !== 0 && `(${deltaWeeks > 0 ? `+${deltaWeeks}` : deltaWeeks}w)`}
                    </span>
                  </div>
                </div>

                {/* Labor Hours */}
                <div className="bg-slate-800/80 p-2.5 rounded-xs border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Labor Effort (P80)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs font-mono text-slate-400 line-through">
                      {Math.round(baselineHours).toLocaleString()}h
                    </span>
                    <span className={`text-sm font-mono font-bold ${deltaHours <= 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {Math.round(simHours).toLocaleString()}h
                    </span>
                  </div>
                </div>

                {/* Blended Rate & Margin */}
                <div className="bg-slate-800/80 p-2.5 rounded-xs border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Rate & Margin</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs font-mono text-slate-300">
                      ${Math.round(simBillRate)}/h
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300">
                      {simMargin.toFixed(1)}% GM
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Assurance & DoA */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-slate-300 font-semibold">{simMetrics.doaClassification}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Confidence: <strong className="text-white">{simMetrics.deliveryAssurance.overallConfidenceRating}%</strong>
                </span>
              </div>
            </div>

            {/* Itemized Trade-Off Ledger (What Changed) */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Trade-Off Ledger ({tradeOffItems.length} Levers)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDefenseScript}
                  className="px-2 py-1 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-300"
                  title="Copy full oral defense brief to clipboard"
                >
                  {copiedSummary ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copiedSummary ? 'Copied Brief' : 'Copy Oral Script'}</span>
                </button>
              </div>

              {tradeOffItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xs border border-dashed border-slate-200">
                  No levers modified. Adjust any sliders on the left or click an "Oral Recipe" above to model trade-offs.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {tradeOffItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xs bg-slate-50 border border-slate-200 text-xs space-y-0.5 hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        {item.savingHours > 0 && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-xs">
                            -{item.savingHours}h
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SteerCo Defense Script Preview Box */}
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-sm p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                <Sparkles size={13} className="text-indigo-600" />
                <span>SteerCo Oral Defense Talking Point</span>
              </div>
              <p className="text-[11px] text-indigo-950 italic leading-relaxed">
                "To achieve your target of <strong>${targetBudget.toLocaleString()}</strong>, Option B standardizes on a Day 1 fiscal cutover, defers secondary statutory mandates to Wave 2, and increases GDC offshore leverage to <strong>{offshorePct}%</strong>. This secures your fixed-price commitment while pulling go-live forward by <strong>{Math.abs(deltaWeeks)} weeks</strong>."
              </p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">{tradeOffItems.length} Trade-Offs Configured:</span>
            <span className="font-mono text-emerald-700 font-bold">
              {deltaPrice <= 0 ? `-$${Math.abs(deltaPrice).toLocaleString()}` : `+$${deltaPrice.toLocaleString()}`}
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-mono text-indigo-700 font-bold">
              {deltaWeeks <= 0 ? `-${Math.abs(deltaWeeks)} weeks` : `+${deltaWeeks} weeks`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDefenseScript}
              className="px-3 py-1.5 rounded-sm bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedSummary ? <Check size={13} className="text-emerald-600 stroke-[2.5]" /> : <Copy size={13} />}
              <span>{copiedSummary ? 'Copied Script!' : 'Copy Defense Script'}</span>
            </button>

            {onSaveAsVariantScenario && (
              <button
                type="button"
                onClick={handleSaveAsVariant}
                className="px-3.5 py-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Save as a separate proposal variant (Option B) keeping baseline proposal intact"
              >
                <Save size={13} />
                <span>Save as Option B Variant</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyToActive}
              className="px-4 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Apply these simulated parameters directly to the active proposal"
            >
              <Check size={14} className="stroke-[2.5]" />
              <span>Apply to Active Proposal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
