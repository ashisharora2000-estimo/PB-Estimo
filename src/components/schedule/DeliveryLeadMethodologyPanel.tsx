import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  TrendingDown,
  Layers,
  GitBranch,
  ShieldCheck,
  BarChart3,
  Sliders,
  Info,
  ArrowRight,
  RotateCcw,
  FileText
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { SteerCoDefenseModal } from './SteerCoDefenseModal';

interface DeliveryLeadMethodologyPanelProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const DeliveryLeadMethodologyPanel: React.FC<DeliveryLeadMethodologyPanelProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  const [showSteerCoModal, setShowSteerCoModal] = useState(false);
  const sf = data.scheduleFeasibility;

  // 4-Step Mathematical Calculation Breakdown
  const baseLifecycleWeeks = 22; // 2w Enablement + 6w Design + 8w Build + 6w Testing/Cutover floor
  const oicCount = scenario.scaleDrivers.tech_oic || 0;
  const mockCycles = scenario.scaleDrivers.tech_conversion_cycles || 3;
  const dataDebtImpact = (scenario.scheduleModifiers?.dataReadinessScore === 3 ? 2.5 : (scenario.scheduleModifiers?.dataReadinessScore === 2 ? 1.0 : 0));
  const conversionImpact = mockCycles >= 4 ? (mockCycles - 3) * 1.5 : 0;
  const oicImpact = oicCount > 15 ? Math.round((oicCount - 15) * 0.12 * 10) / 10 : (oicCount > 5 ? 1 : 0);
  const totalTechDataWeeks = Math.max(1, Math.round(oicImpact + conversionImpact + dataDebtImpact + (scenario.selectedModules.length > 10 ? 2 : 0)));

  const rolloutWaveWeeks = scenario.rolloutWaves > 1
    ? (scenario.rolloutWaves - 1) * (scenario.phaseDeliveryModel === 'hypercare_overlap' ? 6 : 8)
    : 0;

  const fastTrackOverlapPct = scenario.scheduleModifiers?.fastTrackingOverlapPct || 15;
  const rawTotal = baseLifecycleWeeks + totalTechDataWeeks + rolloutWaveWeeks;
  const fastTrackSavingsWeeks = Math.round(rawTotal * (fastTrackOverlapPct / 100) * 0.30);
  const calculatedRecommendedWeeks = data.recommendedDurationWeeks;

  const handleApplyRecommendedDuration = () => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: data.recommendedDurationWeeks
    }));
  };

  const handleApplyIndustryDuration = () => {
    onUpdateScenario(prev => ({
      ...prev,
      projectWeeks: sf.industryBenchmarkDurationWeeks
    }));
  };

  const handleApplyFastTracking = (overlapPct: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scheduleModifiers: {
        ...(prev.scheduleModifiers || {
          methodology: 'hybrid_oum',
          fastTrackingOverlapPct: 15,
          clientDecisionSLA: 'standard_5d',
          envReadinessLeadWeeks: 2,
          dataReadinessScore: 2,
          sprintCadenceWeeks: 3
        }),
        fastTrackingOverlapPct: overlapPct
      }
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Executive Defense Launcher */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-sm p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Senior Delivery Lead Duration Sizing Methodology
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400 text-slate-950 font-bold uppercase rounded-none">
                  Explainable Framework
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                A simple, defensible 4-step framework based on Oracle True Cloud Method (TCM) to justify delivery timelines to C-level stakeholders, SteerCo boards, and program auditors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSteerCoModal(true)}
              className="px-4 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <FileText size={14} />
              <span>SteerCo Executive Briefing</span>
            </button>
          </div>
        </div>

        {/* 2. Visual 4-Step Duration Sizing Equation Banner */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            The 4-Step Duration Equation:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-center">
            {/* Step 1 */}
            <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">1. Base Lifecycle</span>
              <span className="text-base font-bold text-white">{baseLifecycleWeeks} Wks</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">Scope Floor</span>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700">
              <span className="text-[9px] uppercase tracking-wider text-blue-400 block font-sans">2. Tech & Data Drivers</span>
              <span className="text-base font-bold text-blue-400">+{totalTechDataWeeks} Wks</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">OIC & Conversion Mocks</span>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700">
              <span className="text-[9px] uppercase tracking-wider text-purple-400 block font-sans">3. Phasing & Waves</span>
              <span className="text-base font-bold text-purple-400">+{rolloutWaveWeeks} Wks</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">{scenario.rolloutWaves || 1} Wave Staging</span>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 block font-sans">4. Fast-Tracking</span>
              <span className="text-base font-bold text-emerald-400">-{fastTrackSavingsWeeks} Wks</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">{fastTrackOverlapPct}% Concurrency</span>
            </div>

            {/* Result */}
            <div className="p-2.5 rounded-sm bg-amber-500/20 border border-amber-500/40 col-span-2 sm:col-span-1">
              <span className="text-[9px] uppercase tracking-wider text-amber-400 block font-sans font-bold">Defensible Sizing</span>
              <span className="text-lg font-bold text-amber-300">{calculatedRecommendedWeeks} Wks</span>
              <span className="text-[9px] text-slate-300 block mt-0.5 font-sans">
                {Math.round(calculatedRecommendedWeeks / 4.33)} Months Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Dive into the 4 Sizing Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 Deep Dive */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Base Lifecycle Floor (Core Scope Footprint)
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200">
              {baseLifecycleWeeks} Weeks
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The irreducible floor for an enterprise Oracle Cloud implementation according to Oracle True Cloud Method (TCM).
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Mandatory Client Enablement & Environment Bootstrap</span>
              <span className="font-mono font-bold text-slate-900">2.0 Wks</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Enterprise Process Design (CRP1 & CRP2 Cycles)</span>
              <span className="font-mono font-bold text-slate-900">6.0 Wks</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Derived CEMLI Build & Unit Testing Runway</span>
              <span className="font-mono font-bold text-blue-900 font-bold">{data.buildDurationBreakdown.recommendedBuildWeeks}.0 Wks</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Cutover Gating & Day-1 Hypercare Floor</span>
              <span className="font-mono font-bold text-slate-900">6.0 Wks</span>
            </div>
          </div>
        </div>

        {/* Step 2 Deep Dive */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Technical, Data & Integration Sizing
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
              +{totalTechDataWeeks} Weeks
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Specific complexity drivers that extend testing and conversion load cycles during SIT and UAT.
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">
                OIC Integration Density ({oicCount} Integrations)
              </span>
              <span className="font-mono font-bold text-slate-900">
                +{oicImpact} Wks
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">
                FBDI Data Conversion ({mockCycles} Mock Cycles across {scenario.scaleDrivers.tech_data_objects || 12} Objects)
              </span>
              <span className="font-mono font-bold text-slate-900">
                +{conversionImpact} Wks
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">
                Client Data Cleansing Debt (Level {scenario.scheduleModifiers?.dataReadinessScore || 2} Readiness)
              </span>
              <span className="font-mono font-bold text-slate-900">
                +{dataDebtImpact} Wks
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">
                Scope Volume ({scenario.selectedModules.length} Modules in footprint)
              </span>
              <span className="font-mono font-bold text-slate-900">
                +{scenario.selectedModules.length > 10 ? 2 : 0} Wks
              </span>
            </div>
          </div>
        </div>

        {/* Step 3 Deep Dive */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rollout Strategy & Phasing
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-200">
              +{rolloutWaveWeeks} Weeks
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Deployment topology impact based on big bang vs phased wave execution.
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Rollout Model</span>
              <span className="font-mono font-bold text-slate-900 capitalize">
                {scenario.rolloutApproach.replace('_', ' ')} ({scenario.rolloutWaves || 1} Waves)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Wave Staggering Method</span>
              <span className="font-mono font-bold text-slate-900">
                {scenario.phaseDeliveryModel === 'hypercare_overlap'
                  ? 'Hypercare Overlap (Optimized +6w/wave)'
                  : 'Sequential Full Lifecycles (+8w/wave)'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 border border-slate-200">
              <span className="text-slate-700">Rollout Effort Multiplier</span>
              <span className="font-mono font-bold text-slate-900">
                {data.rolloutMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {/* Step 4 Deep Dive */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                4
              </span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Fast-Tracking & Cross-Stream Concurrency
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
              -{fastTrackSavingsWeeks} Weeks
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Calendar weeks compressed by overlapping Build sprints into Design CRP2 and running OCM/PMO in parallel.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Fast-Tracking Overlap Level:</span>
              <span className="font-mono font-bold text-emerald-800">
                {fastTrackOverlapPct}% Concurrency
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1">
              {[10, 15, 25].map(pct => (
                <button
                  key={pct}
                  onClick={() => handleApplyFastTracking(pct)}
                  className={`py-1.5 px-2 rounded-xs text-[10px] font-bold uppercase transition cursor-pointer border ${
                    fastTrackOverlapPct === pct
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct}% {pct === 15 ? '(Standard)' : pct === 25 ? '(Aggressive)' : '(Conservative)'}
                </button>
              ))}
            </div>

            <div className="p-2 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              Saves <strong>{fastTrackSavingsWeeks} calendar weeks</strong> while preserving all required quality gate reviews.
            </div>
          </div>
        </div>
      </div>

      {/* 3b. Dedicated Deep-Dive: Build Duration Derivation & Leadership Defense */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Build Duration Derivation: Why Build is {data.buildDurationBreakdown.recommendedBuildWeeks} Weeks (and Not 8 Weeks)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-900 font-bold uppercase rounded-none border border-blue-200">
                  RICEFW / CEMLI Math
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Mathematical proof justifying why technical development cannot be compressed into an arbitrary 8-week vanilla box.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-slate-500">Total Tech Effort:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-xs border border-slate-200">
              {data.buildDurationBreakdown.totalTechnicalDevDays} Person-Days (~{data.buildDurationBreakdown.totalTechnicalDevDays * 8} Hours)
            </span>
          </div>
        </div>

        {/* Technical Object Sizing Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Functional Config */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Functional Config</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 border border-slate-200">
                {data.buildDurationBreakdown.baseConfigWeeks}.0 Wks
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Base configuration sprints across {scenario.selectedModules.length} modules, ledgers, BUs, and core business processes.
            </p>
          </div>

          {/* Card 2: OIC Integrations */}
          <div className="p-3.5 rounded-sm bg-blue-50 border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">2. OIC Interfaces</span>
              <span className="text-xs font-mono font-bold text-blue-900 bg-white px-1.5 py-0.5 border border-blue-200">
                +{data.buildDurationBreakdown.oicIntegrationsWeeks} Wks
              </span>
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              {scenario.scaleDrivers.tech_oic || 0} OIC flows @ ~10 days/flow ({((scenario.scaleDrivers.tech_oic || 0) * 10)} person-days) for endpoints, mappings & error handling.
            </p>
          </div>

          {/* Card 3: Reports & PaaS */}
          <div className="p-3.5 rounded-sm bg-purple-50 border border-purple-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">3. Reports & PaaS</span>
              <span className="text-xs font-mono font-bold text-purple-900 bg-white px-1.5 py-0.5 border border-purple-200">
                +{(Math.round((data.buildDurationBreakdown.reportsWeeks + data.buildDurationBreakdown.paasExtensionsWeeks) * 10) / 10)} Wks
              </span>
            </div>
            <p className="text-[11px] text-purple-900 leading-relaxed">
              {((scenario.scaleDrivers.tech_reports_bip || 0) + (scenario.scaleDrivers.tech_reports_otbi || 0))} BIP/OTBI Reports + {scenario.scaleDrivers.tech_paas || 0} PaaS Extensions & FastFormulas.
            </p>
          </div>

          {/* Card 4: Mock 1 & String Test */}
          <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">4. Mock 1 & String Test</span>
              <span className="text-xs font-mono font-bold text-emerald-900 bg-white px-1.5 py-0.5 border border-emerald-200">
                +{data.buildDurationBreakdown.mock1ConversionWeeks + data.buildDurationBreakdown.stringTestingWeeks}.0 Wks
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              2.0w Mock 1 FBDI data load validation + 2.0w cross-stream string testing & SIT entry quality gate.
            </p>
          </div>
        </div>

        {/* Leadership Talking Points Strip */}
        <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
          <div className="font-bold text-amber-950 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-700" />
            <span>Senior Delivery Lead Defense: Why Vanilla 8-Week Assumptions Fail</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            An <strong>8-week build</strong> is only valid for 100% out-of-the-box standard Oracle SaaS workflows with zero integrations and pre-cleansed data. For this project footprint ({data.buildDurationBreakdown.totalTechnicalDevDays} Technical Person-Days), compressing build into 8 weeks would require <strong>over {Math.round(data.buildDurationBreakdown.totalTechnicalDevDays / 20)} simultaneous developers</strong>, violating Brooks' Law and guaranteeing interface failure during SIT. Sizing the Build window at <strong>{data.buildDurationBreakdown.recommendedBuildWeeks} weeks</strong> ensures all OIC contracts, reports, and Mock 1 FBDI data loads are verified before SIT entry.
          </p>
        </div>
      </div>

      {/* 4. Industry Benchmark Comparison (Oracle TCM Standards) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart3 size={16} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Industry Benchmark Calibration (Oracle True Cloud Method Standards)
              </h4>
              <p className="text-[11px] text-slate-500">
                Empirical delivery durations observed across Global Tier-1 SI ERP implementations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Active Baseline */}
          <div className="p-3.5 rounded-sm bg-slate-900 text-white space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
              Active Project Plan
            </span>
            <div className="text-2xl font-mono font-bold text-white">
              {scenario.projectWeeks} Wks
            </div>
            <p className="text-[10px] text-slate-300">
              Current baseline used for resource loading and Gantt roadmap.
            </p>
          </div>

          {/* Complexity Sizing Rec */}
          <div className="p-3.5 rounded-sm bg-blue-50 border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-700 block">
                Delivery Lead Sizing
              </span>
              <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1 rounded-2xs">
                Recommended
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-900">
              {data.recommendedDurationWeeks} Wks
            </div>
            {scenario.projectWeeks !== data.recommendedDurationWeeks && (
              <button
                onClick={handleApplyRecommendedDuration}
                className="w-full text-[10px] font-bold uppercase py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xs transition cursor-pointer shadow-2xs"
              >
                Adopt {data.recommendedDurationWeeks} Wks
              </button>
            )}
          </div>

          {/* Industry Benchmark */}
          <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 block">
                Oracle TCM Benchmark
              </span>
              <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1 rounded-2xs">
                Tier-1 SI
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-900">
              {sf.industryBenchmarkDurationWeeks} Wks
            </div>
            <p className="text-[10px] text-emerald-800 truncate" title={sf.industryBenchmarkLabel}>
              {sf.industryBenchmarkLabel}
            </p>
            {scenario.projectWeeks !== sf.industryBenchmarkDurationWeeks && (
              <button
                onClick={handleApplyIndustryDuration}
                className="w-full text-[10px] font-bold uppercase py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs transition cursor-pointer"
              >
                Adopt Benchmark
              </button>
            )}
          </div>

          {/* Crash Limit */}
          <div className="p-3.5 rounded-sm bg-amber-50 border border-amber-200 space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-800 block">
              Crash Limit (Max Concurrency)
            </span>
            <div className="text-2xl font-mono font-bold text-amber-900">
              {sf.crashDurationWeeks} Wks
            </div>
            <p className="text-[10px] text-amber-700 leading-tight">
              Theoretical compressed floor before severe testing failure risk.
            </p>
          </div>
        </div>
      </div>

      {/* SteerCo Defense Briefing Modal */}
      <SteerCoDefenseModal
        isOpen={showSteerCoModal}
        onClose={() => setShowSteerCoModal(false)}
        scenario={scenario}
        data={data}
        onApplyRecommendedDuration={handleApplyRecommendedDuration}
      />
    </div>
  );
};
