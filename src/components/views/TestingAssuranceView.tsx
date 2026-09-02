import React, { useState } from 'react';
import {
  CheckCircle2,
  ListChecks,
  ShieldCheck,
  Zap,
  Sliders,
  Users,
  Calendar,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  TrendingUp,
  Cpu,
  FileText,
  Activity
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, ScaleDrivers } from '../../types';
import { TShirtBadge, T_SHIRT_CONFIG } from '../common/TShirtBadge';

interface TestingAssuranceViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenTraceMath?: () => void;
}

export const TestingAssuranceView: React.FC<TestingAssuranceViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onNavigateTab,
  onOpenTraceMath
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'traceability' | 'commercials' | 'wbs'>('architecture');
  const [strategyPreset, setStrategyPreset] = useState<'standard' | 'regulated' | 'lean' | 'custom'>('custom');

  const testing = data.testingWorkstreamEstimate || {
    totalHours: 2400,
    personMonths: 15.0,
    avgFTE: 2.2,
    tShirtSize: 'M',
    strategyHours: 140,
    businessTesting1Hours: 1250,
    sitHours: 1250,
    sitCycles: scenario.scaleDrivers.test_sit_cycles || 2,
    sitFunctionalScriptHours: 700,
    sitOicInterfaceHours: 280,
    sitMockDataVerifyHours: 120,
    sitDefectTriageHours: 150,
    businessTesting2Hours: 850,
    uatHours: 850,
    uatCycles: scenario.scaleDrivers.test_uat_cycles || 1,
    uatScenarioHours: 450,
    uatCrpSimulationHours: 220,
    uatTesterEnablementHours: 80,
    uatDefectRetestHours: 100,
    automationHours: 350,
    automationPct: scenario.scaleDrivers.test_automation_pct || 25,
    performanceHours: 160,
    perfRuns: scenario.scaleDrivers.test_perf_runs || 1,
    payrollParallelHours: scenario.scaleDrivers.test_payroll_parallels ? scenario.scaleDrivers.test_payroll_parallels * 240 : 0,
    payrollParallels: scenario.scaleDrivers.test_payroll_parallels || 0,
    blendedRate: 108.5,
    costRate: 52.0,
    revenue: 260400,
    cost: 124800,
    marginPct: 52.1,
    gradeBreakdown: {
      gradeA_OffshoreExecutionHours: 1440,
      gradeB_FunctionalLeadHours: 600,
      gradeC_TestManagerHours: 360
    },
    deliverables: [],
    wbsTasks: []
  };

  const scaleDrivers = scenario.scaleDrivers;
  const projectWeeks = scenario.projectWeeks || 32;
  const totalProjectHours = data.targetHours || 1;
  const testingPctOfProject = Math.round((testing.totalHours / totalProjectHours) * 100);

  // Update Scale Driver helper
  const updateDriver = (key: keyof ScaleDrivers, value: number) => {
    setStrategyPreset('custom');
    onUpdateScenario((prev) => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        [key]: value
      }
    }));
  };

  // Strategy Preset Applicator
  const applyPreset = (preset: 'standard' | 'regulated' | 'lean') => {
    setStrategyPreset(preset);
    onUpdateScenario((prev) => {
      let sit = 2;
      let uat = 1;
      let auto = 25;
      let perf = 1;
      let payroll = prev.selectedModules.some((m) => m.startsWith('hcm_')) ? 2 : 0;
      let scripts = Math.max(150, prev.selectedModules.length * 28);

      if (preset === 'regulated') {
        sit = 3;
        uat = 2;
        auto = 50;
        perf = 2;
        payroll = prev.selectedModules.some((m) => m.startsWith('hcm_')) ? 3 : 0;
        scripts = Math.max(250, prev.selectedModules.length * 36);
      } else if (preset === 'lean') {
        sit = 1;
        uat = 1;
        auto = 10;
        perf = 0;
        payroll = 0;
        scripts = Math.max(100, prev.selectedModules.length * 20);
      }

      return {
        ...prev,
        scaleDrivers: {
          ...prev.scaleDrivers,
          test_sit_cycles: sit,
          test_uat_cycles: uat,
          test_automation_pct: auto,
          test_perf_runs: perf,
          test_payroll_parallels: payroll,
          test_scripts_count: scripts
        }
      };
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner / Hero Command Card */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs divide-y divide-slate-200">
        <div className="p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-gradient-to-r from-white via-slate-50/50 to-white">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-1.5 rounded-sm bg-slate-900 text-white shrink-0 shadow-2xs">
                <ListChecks size={15} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Pillar 4 & 5 Quality Assurance
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck size={11} className="text-amber-700" />
                <span>Dual-Gate Testing Framework</span>
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold">
                WBS 4.0 & 5.0
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Business Testing & Quality Assurance Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent, deterministic engineering for <strong className="text-slate-700">Business Testing 1 - SIT</strong> and <strong className="text-slate-700">Business Testing 2 - UAT</strong>.
            </p>
          </div>

          {/* Quick Strategy Preset Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Preset:</span>
            {[
              { id: 'standard' as const, label: 'Standard Enterprise (2 SIT + 1 UAT)' },
              { id: 'regulated' as const, label: 'Regulated / Multi-Round (3 SIT + 2 UAT)' },
              { id: 'lean' as const, label: 'Lean Fast-Track (1 SIT + 1 UAT)' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-2.5 py-1.5 text-xs font-bold transition cursor-pointer border shadow-2xs ${
                  strategyPreset === p.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Core Hero Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/40">
          {/* 1. Total Testing Effort */}
          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Total Testing Sizing</span>
              <TShirtBadge size={testing.tShirtSize} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900">
                {Math.round(testing.totalHours).toLocaleString()}h
              </span>
              <span className="text-xs font-bold text-amber-700 font-mono">
                {testingPctOfProject}% of Deal
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {testing.personMonths} Person-Months &bull; {testing.avgFTE} Peak Testing FTE
            </div>
          </div>

          {/* 2. Business Testing 1 - SIT */}
          <div className="p-3.5 space-y-1 bg-amber-50/30">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-800">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-amber-600" />
                Business Testing 1 - SIT
              </span>
              <span className="font-mono px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-2xs font-bold">
                {scaleDrivers.test_sit_cycles || 2} Cycles
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-amber-950">
                {Math.round(testing.businessTesting1Hours).toLocaleString()}h
              </span>
              <span className="text-xs font-medium text-amber-700">
                ({Math.round((testing.businessTesting1Hours / testing.totalHours) * 100)}% of QA)
              </span>
            </div>
            <div className="text-[11px] text-amber-900 font-medium truncate">
              {scaleDrivers.test_scripts_count || Math.max(120, scenario.selectedModules.length * 26)} Scenarios &bull; {scaleDrivers.tech_oic || 8} OIC Interfaces
            </div>
          </div>

          {/* 3. Business Testing 2 - UAT */}
          <div className="p-3.5 space-y-1 bg-orange-50/30">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-orange-800">
              <span className="flex items-center gap-1">
                <Users size={12} className="text-orange-600" />
                Business Testing 2 - UAT
              </span>
              <span className="font-mono px-1.5 py-0.2 bg-orange-100 text-orange-900 rounded-2xs font-bold">
                {scaleDrivers.test_uat_cycles || 1} Cycle
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-orange-950">
                {Math.round(testing.businessTesting2Hours).toLocaleString()}h
              </span>
              <span className="text-xs font-medium text-orange-700">
                ({Math.round((testing.businessTesting2Hours / testing.totalHours) * 100)}% of QA)
              </span>
            </div>
            <div className="text-[11px] text-orange-900 font-medium truncate">
              Day-in-the-Life CRP &bull; Business Sign-Off Gate
            </div>
          </div>

          {/* 4. Automation & Commercials */}
          <div className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Automation & NFT</span>
              <span className="font-mono font-bold text-slate-700">
                {scaleDrivers.test_automation_pct || 25}% Auto
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-slate-900">
                ${testing.blendedRate.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {testing.marginPct}% Margin
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {testing.perfRuns} Perf Runs &bull; {testing.payrollParallels} Payroll Parallels
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border border-slate-200 p-1.5 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'architecture' as const, label: '1. Testing Cycles & Calibration', icon: Sliders },
            { id: 'traceability' as const, label: '2. Transparent Math Traceability', icon: Activity },
            { id: 'commercials' as const, label: '3. QA Grade Pyramid & Rates', icon: DollarSign },
            { id: 'wbs' as const, label: '4. Smartsheet WBS Tasks (30-Col)', icon: FileText }
          ].map((t) => {
            const isSelected = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-amber-400' : 'text-slate-500'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {onNavigateTab && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('schedule')}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-sm flex items-center gap-1 cursor-pointer"
            >
              <span>View in Schedule Gantt</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Architecture & Interactive Controls */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card: Business Testing 1 - SIT Calibration */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-sm bg-amber-500 text-white font-bold text-xs">
                    SIT
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Business Testing 1 - SIT Architecture
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      System Integration Testing, cross-module workflows & third-party interfaces
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-xs">
                  {Math.round(testing.businessTesting1Hours)} hrs
                </span>
              </div>

              {/* SIT Cycle Count Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">SIT Execution Cycles:</span>
                  <span className="font-mono font-bold text-amber-900">{scaleDrivers.test_sit_cycles || 2} Cycles</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((cycle) => {
                    const isSelected = (scaleDrivers.test_sit_cycles || 2) === cycle;
                    return (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => updateDriver('test_sit_cycles', cycle)}
                        className={`p-2 border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{cycle} {cycle === 1 ? 'Cycle' : 'Cycles'}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                          {cycle === 1 ? 'Lean Fast-Track' : cycle === 2 ? 'Standard Enterprise' : 'High-Regulated'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Test Scripts & Scenarios Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Test Scenarios & Script Volume:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {scaleDrivers.test_scripts_count || Math.max(120, scenario.selectedModules.length * 26)} Scenarios
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={600}
                  step={10}
                  value={scaleDrivers.test_scripts_count || Math.max(120, scenario.selectedModules.length * 26)}
                  onChange={(e) => updateDriver('test_scripts_count', parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>50 (Minimal)</span>
                  <span>250 (Mid-Market)</span>
                  <span>600+ (Tier-1 Global)</span>
                </div>
              </div>

              {/* SIT Scope Components Breakdown */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2 text-xs">
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span>SIT Component Decomposition:</span>
                  <span className="text-[10px] font-mono text-slate-500">Deterministic</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>&bull; Functional Scenario Execution ({scaleDrivers.test_sit_cycles || 2} cycles):</span>
                    <span className="font-bold text-slate-900">{testing.sitFunctionalScriptHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>&bull; OIC Interfaces Integration Handshake ({scaleDrivers.tech_oic || 8} endpoints):</span>
                    <span className="font-bold text-slate-900">{testing.sitOicInterfaceHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>&bull; Data Mock Conversion Validation ({scaleDrivers.tech_data_objects || 10} objects):</span>
                    <span className="font-bold text-slate-900">{testing.sitMockDataVerifyHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>&bull; Defect Triage & Retest Multiplier (25% buffer):</span>
                    <span className="font-bold text-amber-900">{testing.sitDefectTriageHours}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Business Testing 2 - UAT Calibration */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-sm bg-orange-600 text-white font-bold text-xs">
                    UAT
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Business Testing 2 - UAT Architecture
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      User Acceptance Testing, Business Simulation & Day-in-the-Life walkthroughs
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-orange-900 bg-orange-100 px-2 py-0.5 rounded-xs">
                  {Math.round(testing.businessTesting2Hours)} hrs
                </span>
              </div>

              {/* UAT Cycle Count Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">UAT Business Cycles:</span>
                  <span className="font-mono font-bold text-orange-900">{scaleDrivers.test_uat_cycles || 1} Cycle</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((cycle) => {
                    const isSelected = (scaleDrivers.test_uat_cycles || 1) === cycle;
                    return (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => updateDriver('test_uat_cycles', cycle)}
                        className={`p-2 border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-700 font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{cycle} {cycle === 1 ? 'Cycle' : 'Cycles'}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                          {cycle === 1 ? 'Standard Single UAT Round' : 'Dual-Round Business UAT'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HCM Payroll Parallel Runs (if applicable) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">HCM Payroll Parallel Runs:</span>
                  <span className="font-mono font-bold text-orange-900">
                    {scaleDrivers.test_payroll_parallels !== undefined ? scaleDrivers.test_payroll_parallels : (scenario.selectedModules.some(m => m.startsWith('hcm_')) ? 2 : 0)} Runs
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((runs) => {
                    const current = scaleDrivers.test_payroll_parallels !== undefined ? scaleDrivers.test_payroll_parallels : (scenario.selectedModules.some(m => m.startsWith('hcm_')) ? 2 : 0);
                    const isSelected = current === runs;
                    return (
                      <button
                        key={runs}
                        type="button"
                        onClick={() => updateDriver('test_payroll_parallels', runs)}
                        className={`p-1.5 border text-center transition cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {runs === 0 ? 'None (0)' : `${runs} Run${runs > 1 ? 's' : ''}`}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  Each parallel rehearsal sizes 240h for gross-to-net variance tie-out and retro-pay validations.
                </p>
              </div>

              {/* UAT Scope Components Decomposition */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2 text-xs">
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span>UAT Component Decomposition:</span>
                  <span className="text-[10px] font-mono text-slate-500">Deterministic</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>&bull; Business User Scenarios ({scaleDrivers.test_uat_cycles || 1} cycle):</span>
                    <span className="font-bold text-slate-900">{testing.uatScenarioHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>&bull; Day-in-the-Life CRP Simulation ({scenario.selectedModules.length} modules):</span>
                    <span className="font-bold text-slate-900">{testing.uatCrpSimulationHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>&bull; Client Tester Enablement & Data Prep:</span>
                    <span className="font-bold text-slate-900">{testing.uatTesterEnablementHours}h</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>&bull; Priority Defect Retest & Gate Sign-off:</span>
                    <span className="font-bold text-orange-900">{testing.uatDefectRetestHours}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Test Automation & Non-Functional Testing (NFT) */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-sm bg-indigo-600 text-white font-bold text-xs">
                  <Zap size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Test Automation & Non-Functional Testing (NFT) Engine
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Automated regression test suites (OATS / ACCELQ / Selenium) and stress performance runs
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-xs">
                {Math.round(testing.automationHours + testing.performanceHours + testing.payrollParallelHours)} hrs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Automated Regression Coverage */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Regression Automation %:</span>
                  <span className="font-mono font-bold text-indigo-700">{scaleDrivers.test_automation_pct || 25}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={scaleDrivers.test_automation_pct !== undefined ? scaleDrivers.test_automation_pct : 25}
                  onChange={(e) => updateDriver('test_automation_pct', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% Manual</span>
                  <span>25% Standard</span>
                  <span>80% Max</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Automation Effort:</span>
                  <span className="font-bold text-indigo-900">{testing.automationHours}h</span>
                </div>
              </div>

              {/* 2. Performance Stress Test Runs */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Performance / Load Stress Runs:</span>
                  <span className="font-mono font-bold text-indigo-700">{scaleDrivers.test_perf_runs || 1} Runs</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((runs) => {
                    const isSelected = (scaleDrivers.test_perf_runs || 1) === runs;
                    return (
                      <button
                        key={runs}
                        type="button"
                        onClick={() => updateDriver('test_perf_runs', runs)}
                        className={`p-1.5 border text-center transition cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {runs}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
                  <span>NFT Performance Effort:</span>
                  <span className="font-bold text-indigo-900">{testing.performanceHours}h</span>
                </div>
              </div>

              {/* 3. Overall Governance & Strategy */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Test Strategy & Governance:</span>
                  <span className="font-mono font-bold text-slate-900">120h Baseline</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Test strategy charter, RACI defect workflow, Jira/ALM traceability setup, and executive SteerCo exit criteria.
                </p>
                <div className="text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Strategy Effort:</span>
                  <span className="font-bold text-slate-900">{testing.strategyHours}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Transparent Math Traceability */}
      {activeTab === 'traceability' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Testing Workstream Mathematical Traceability
                </h3>
                <p className="text-[11px] text-slate-500">
                  Complete defensible formula step-by-step from raw script counts to P80 contingency
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenTraceMath}
                className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-sm flex items-center gap-1 cursor-pointer"
              >
                <Activity size={12} />
                <span>Open Full Math Modal</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Formula Step 1: Business Testing 1 - SIT */}
              <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">
                    Step 1: Business Testing 1 - SIT Calculation
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-900">
                    {testing.businessTesting1Hours} hrs
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-amber-200 font-mono text-xs text-slate-800 rounded-xs space-y-1">
                  <div>
                    SIT_Raw = (SIT_Cycles &times; Scripts &times; 0.70h) + (SIT_Cycles &times; OIC_Interfaces &times; 16h) + (Data_Objects &times; 8h) + Defect_Triage(25%)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    = ({scaleDrivers.test_sit_cycles || 2} &times; {scaleDrivers.test_scripts_count || Math.max(120, scenario.selectedModules.length * 26)} &times; 0.70) + ({scaleDrivers.test_sit_cycles || 2} &times; {scaleDrivers.tech_oic || 8} &times; 16) + ({scaleDrivers.tech_data_objects || 10} &times; 8) + 25% Retest
                  </div>
                  <div className="text-xs font-bold text-amber-950 pt-1 border-t border-amber-100">
                    = {testing.sitFunctionalScriptHours}h (Functional) + {testing.sitOicInterfaceHours}h (OIC) + {testing.sitMockDataVerifyHours}h (Mock Data) + {testing.sitDefectTriageHours}h (Triage)
                  </div>
                </div>
              </div>

              {/* Formula Step 2: Business Testing 2 - UAT */}
              <div className="p-3.5 bg-orange-50/50 border border-orange-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950">
                    Step 2: Business Testing 2 - UAT Calculation
                  </span>
                  <span className="font-mono text-xs font-bold text-orange-900">
                    {testing.businessTesting2Hours} hrs
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-orange-200 font-mono text-xs text-slate-800 rounded-xs space-y-1">
                  <div>
                    UAT_Raw = (UAT_Cycles &times; Scripts &times; 0.45h) + (UAT_Cycles &times; Modules &times; 28h CRP) + Tester_Enablement(80h) + Retest(20%)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    = ({scaleDrivers.test_uat_cycles || 1} &times; {scaleDrivers.test_scripts_count || Math.max(120, scenario.selectedModules.length * 26)} &times; 0.45) + ({scaleDrivers.test_uat_cycles || 1} &times; {scenario.selectedModules.length} &times; 28) + 80h + 20% Retest
                  </div>
                  <div className="text-xs font-bold text-orange-950 pt-1 border-t border-orange-100">
                    = {testing.uatScenarioHours}h (Business Scenarios) + {testing.uatCrpSimulationHours}h (Day-in-the-Life CRP) + {testing.uatTesterEnablementHours}h (Enablement) + {testing.uatDefectRetestHours}h (Gate Sign-off)
                  </div>
                </div>
              </div>

              {/* Formula Step 3: Automation, NFT & Rollup */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Step 3: Non-Functional Testing, Automation & Total Sizing
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {Math.round(testing.totalHours)} hrs (P80)
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 font-mono text-xs text-slate-800 rounded-xs space-y-1">
                  <div>
                    Testing_Total_P80 = (Strategy + SIT + UAT + Automation + Performance + Payroll_Parallels) &times; Net_Client_Modifier &times; (1 + Contingency)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    = ({testing.strategyHours} + {testing.businessTesting1Hours} + {testing.businessTesting2Hours} + {testing.automationHours} + {testing.performanceHours} + {testing.payrollParallelHours}) hrs
                  </div>
                  <div className="text-xs font-bold text-slate-950 pt-1 border-t border-slate-200 flex justify-between">
                    <span>Total Defensible Quality Assurance Effort:</span>
                    <span className="text-blue-900">{Math.round(testing.totalHours).toLocaleString()}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Commercials & QA Grade Pyramid */}
      {activeTab === 'commercials' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Quality Assurance Commercials & Grade Distribution Pyramid
                </h3>
                <p className="text-[11px] text-slate-500">
                  Role sourcing mix across Offshore execution, Functional QA leads, and Test Managers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 font-mono">
                  Blended Rate: <strong className="text-slate-900">${testing.blendedRate.toFixed(2)}/h</strong>
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-xs font-mono">
                  {testing.marginPct}% Margin
                </span>
              </div>
            </div>

            {/* QA Grade Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">QA Delivery Role</th>
                    <th className="py-2.5 px-3">Grade Level</th>
                    <th className="py-2.5 px-3">Sourcing Location</th>
                    <th className="py-2.5 px-3 text-right">Effort Share</th>
                    <th className="py-2.5 px-3 text-right">Hours</th>
                    <th className="py-2.5 px-3 text-right">Cost Rate</th>
                    <th className="py-2.5 px-3 text-right">Bill Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      Offshore Test Automation & Execution Specialist
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded-2xs font-bold">Grade A</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Global Delivery Center (India)</td>
                    <td className="py-2.5 px-3 text-right font-bold">60%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{testing.gradeBreakdown.gradeA_OffshoreExecutionHours}h</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$35.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$85.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${(testing.gradeBreakdown.gradeA_OffshoreExecutionHours * 85).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      Functional Business Scenario & SIT Lead
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-2xs font-bold">Grade B</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Nearshore / Hybrid Regional Hub</td>
                    <td className="py-2.5 px-3 text-right font-bold">25%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{testing.gradeBreakdown.gradeB_FunctionalLeadHours}h</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$65.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$145.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${(testing.gradeBreakdown.gradeB_FunctionalLeadHours * 145).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      QA Test Strategy Lead & Defect Manager
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 rounded-2xs font-bold">Grade C</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">Onshore Client-Facing Lead</td>
                    <td className="py-2.5 px-3 text-right font-bold">15%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{testing.gradeBreakdown.gradeC_TestManagerHours}h</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">$110.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">$220.00</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ${(testing.gradeBreakdown.gradeC_TestManagerHours * 220).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="py-2.5 px-3 font-sans text-slate-900" colSpan={3}>
                      Total Quality Assurance Delivery Commercials
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900">100%</td>
                    <td className="py-2.5 px-3 text-right text-slate-900">{Math.round(testing.totalHours).toLocaleString()}h</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">${testing.costRate.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900">${testing.blendedRate.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-900">
                      ${testing.revenue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Smartsheet WBS Tasks */}
      {activeTab === 'wbs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Smartsheet WBS Quality Assurance Deliverables
                </h3>
                <p className="text-[11px] text-slate-500">
                  Deterministic task expansion mapped to <strong className="text-slate-700">Business Testing 1 - SIT</strong> and <strong className="text-slate-700">Business Testing 2 - UAT</strong>
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs">
                {(testing.wbsTasks || []).length} WBS Tasks
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-mono">WBS ID</th>
                    <th className="py-2.5 px-3 font-mono">Task #</th>
                    <th className="py-2.5 px-3">Task Name</th>
                    <th className="py-2.5 px-3">Lifecycle Phase</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3 text-right">Duration</th>
                    <th className="py-2.5 px-3 text-right">Hours</th>
                    <th className="py-2.5 px-3 font-mono">Predecessors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(testing.wbsTasks || []).map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{t.wbsId}</td>
                      <td className="py-2.5 px-3 text-slate-500">{t.taskNumber}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{t.name}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-1.5 py-0.5 rounded-2xs text-[10px] font-bold ${
                          t.phase.includes('SIT')
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : t.phase.includes('UAT')
                            ? 'bg-orange-100 text-orange-900 border border-orange-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {t.phase}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{t.assignedRole}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{t.durationWeeks} wks</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-900">{t.hours}h</td>
                      <td className="py-2.5 px-3 text-slate-500">{t.predecessors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
