import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Percent,
  Download,
  ShieldAlert,
  ArrowUpDown,
  Sparkles,
  Globe2,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Award,
  ChevronRight,
  Briefcase,
  Save
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { ROLE_RATES } from '../../data/oraclePhases';
import { ENTERPRISE_GRADES_CATALOG, calculateGradeDistribution } from '../../data/gradeRatesData';
import { exportCommercialsToCsv } from '../../utils/exporter';

interface CommercialsViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onSaveScenario?: () => void;
}

export const CommercialsView: React.FC<CommercialsViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onSaveScenario
}) => {
  const [activeCommercialTab, setActiveCommercialTab] = useState<'regional_mix' | 'grades_matrix' | 'assurance'>('grades_matrix');

  const handleOnshoreChange = (val: number) => {
    const onshore = Math.max(10, Math.min(80, Math.round(val)));
    const offshore = 100 - onshore;
    onUpdateScenario(prev => ({
      ...prev,
      deliveryMix: {
        onshore,
        nearshore: 0,
        offshore
      }
    }));
  };

  const handleOffshoreChange = (val: number) => {
    const offshore = Math.max(20, Math.min(90, Math.round(val)));
    const onshore = 100 - offshore;
    onUpdateScenario(prev => ({
      ...prev,
      deliveryMix: {
        onshore,
        nearshore: 0,
        offshore
      }
    }));
  };

  const handleSetDeliveryMix = (onshore: number, offshore: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      deliveryMix: { onshore, nearshore: 0, offshore }
    }));
  };

  // Grade share updater with Guardrail: mix share total cannot cross 100%
  const handleGradeShareChange = (gradeCode: string, newShare: number) => {
    const requested = Math.max(0, Math.min(100, Math.round(newShare)));
    onUpdateScenario(prev => {
      const currentOverrides = { ...(prev.gradeDistributionOverrides || {}) };
      
      // Calculate sum of all other grades
      let otherGradesSum = 0;
      ENTERPRISE_GRADES_CATALOG.forEach(g => {
        if (g.gradeCode !== gradeCode) {
          const share = currentOverrides[g.gradeCode] !== undefined ? currentOverrides[g.gradeCode] : g.defaultSharePct;
          otherGradesSum += share;
        }
      });

      // Guardrail: Clamp new share so total sum does not exceed 100%
      const maxAllowed = Math.max(0, 100 - otherGradesSum);
      const clampedShare = Math.min(requested, maxAllowed);

      return {
        ...prev,
        gradeDistributionOverrides: {
          ...currentOverrides,
          [gradeCode]: clampedShare
        }
      };
    });
  };

  // Reset to default Organizational Grade Mix (A=20%, B=35%, C=30%, D=10%, E=5%)
  const handleResetToStandardGradeMix = () => {
    onUpdateScenario(prev => ({
      ...prev,
      gradeDistributionOverrides: {
        'Grade A': 20,
        'Grade B': 35,
        'Grade C': 30,
        'Grade D': 10,
        'Grade E': 5
      }
    }));
  };

  // Auto-normalize grade shares to exactly 100%
  const handleNormalizeGradeMix = () => {
    onUpdateScenario(prev => {
      const currentOverrides = prev.gradeDistributionOverrides || {};
      const currentValues = ENTERPRISE_GRADES_CATALOG.map(g => ({
        code: g.gradeCode,
        val: currentOverrides[g.gradeCode] !== undefined ? currentOverrides[g.gradeCode] : g.defaultSharePct
      }));
      const currentTotal = currentValues.reduce((sum, item) => sum + item.val, 0);
      if (currentTotal === 0) return prev;

      let runningSum = 0;
      const normalizedMap: Record<string, number> = {};
      currentValues.forEach((item, idx) => {
        if (idx === currentValues.length - 1) {
          normalizedMap[item.code] = Math.max(0, 100 - runningSum);
        } else {
          const norm = Math.round((item.val / currentTotal) * 100);
          normalizedMap[item.code] = norm;
          runningSum += norm;
        }
      });

      return {
        ...prev,
        gradeDistributionOverrides: normalizedMap
      };
    });
  };

  // Sourcing Channel updater (In-House vs Subcontractor vs GDC)
  const handleSourcingChange = (channel: 'inHousePct' | 'subcontractorPct' | 'gdcOffshorePct', val: number) => {
    const value = Math.max(0, Math.min(100, Math.round(val)));
    onUpdateScenario(prev => {
      const current = prev.deliverySourcingOverrides || { inHousePct: 35, subcontractorPct: 10, gdcOffshorePct: 55 };
      const others = (['inHousePct', 'subcontractorPct', 'gdcOffshorePct'] as const).filter(k => k !== channel);
      const remaining = current[others[0]] + current[others[1]];

      if (remaining === 0) {
        return {
          ...prev,
          deliverySourcingOverrides: {
            [channel]: value,
            [others[0]]: Math.floor((100 - value) / 2),
            [others[1]]: 100 - value - Math.floor((100 - value) / 2)
          } as any
        };
      }

      const ratio = (100 - value) / remaining;
      const newOther0 = Math.round(current[others[0]] * ratio);
      const newOther1 = 100 - value - newOther0;

      return {
        ...prev,
        deliverySourcingOverrides: {
          [channel]: value,
          [others[0]]: Math.max(0, newOther0),
          [others[1]]: Math.max(0, newOther1)
        } as any
      };
    });
  };

  // 1-Click Apply Recommended Contingency
  const handleApplyRecommendedContingency = () => {
    const rec = data.deliveryAssurance?.recommendedContingencyPct || 15;
    onUpdateScenario(prev => ({
      ...prev,
      contingencyPctOverride: rec / 100
    }));
  };

  const projectWeeks = scenario.projectWeeks || 32;

  // Compute Grade distribution
  const gradeDistribution = calculateGradeDistribution(
    data.targetHours,
    projectWeeks,
    scenario.gradeDistributionOverrides,
    scenario.deliverySourcingOverrides
  );

  const deliveryAssurance = data.deliveryAssurance;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
              <Users size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Global Delivery, Grades & Assurance Architecture
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Enterprise Grade Pyramid & Delivery Assurance Model
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Configure Grade A to Grade E organizational staffing mix (A=20%, B=35%, C=30%, D=10%, E=5% with 100% total mix guardrail), balance In-House vs Subcontractor vs GDC sourcing channels, and audit Delivery Assurance confidence.
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
            onClick={() => exportCommercialsToCsv(scenario, data)}
            className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download size={14} className="text-slate-700" />
            <span>Export Staffing Plan (CSV)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-3 rounded-t-sm gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveCommercialTab('grades_matrix')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCommercialTab === 'grades_matrix'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award size={14} className={activeCommercialTab === 'grades_matrix' ? 'text-blue-600' : 'text-slate-400'} />
          <span>1. Resource Grade & Sourcing Matrix (Grades A–E)</span>
          <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
            ${Math.round(data.blendedBillRate)}/h
          </span>
        </button>

        <button
          onClick={() => setActiveCommercialTab('assurance')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCommercialTab === 'assurance'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={14} className={activeCommercialTab === 'assurance' ? 'text-emerald-600' : 'text-slate-400'} />
          <span>2. Delivery Assurance & Dynamic Contingency</span>
          <span className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono font-bold ${
            deliveryAssurance?.overallAssuranceScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {deliveryAssurance?.overallAssuranceScore}% Assurance
          </span>
        </button>

        <button
          onClick={() => setActiveCommercialTab('regional_mix')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCommercialTab === 'regional_mix'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe2 size={14} className={activeCommercialTab === 'regional_mix' ? 'text-slate-700' : 'text-slate-400'} />
          <span>3. Regional Delivery Mix (Onshore & Offshore)</span>
        </button>
      </div>

      {/* TAB 1: RESOURCE GRADE & SOURCING MATRIX (FEATURE 5) */}
      {activeCommercialTab === 'grades_matrix' && (
        <div className="space-y-6">
          {/* Top Sourcing Channels & Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Delivery Sourcing Channel Sliders */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Delivery Sourcing Channel Mix
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    In-House Core vs Subcontractor vs Global Delivery Center (GDC)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600">
                  Total: {gradeDistribution.sourcing.inHousePct + gradeDistribution.sourcing.subcontractorPct + gradeDistribution.sourcing.gdcOffshorePct}%
                </span>
              </div>

              <div className="space-y-4">
                {/* In-House Practice */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-600" />
                      <span className="font-bold text-slate-900">In-House Practice (Core TBD Team)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {gradeDistribution.sourcing.inHousePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={gradeDistribution.sourcing.inHousePct}
                    onChange={(e) => handleSourcingChange('inHousePct', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Strategic Quality Anchor</span>
                    <span>100% Billable Standard</span>
                  </div>
                </div>

                {/* Subcontractor / Niche SME */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-purple-600" />
                      <span className="font-bold text-slate-900">Subcontractor / Specialized Niche SME</span>
                    </div>
                    <span className="font-mono font-bold text-purple-700 text-sm">
                      {gradeDistribution.sourcing.subcontractorPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={gradeDistribution.sourcing.subcontractorPct}
                    onChange={(e) => handleSourcingChange('subcontractorPct', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Third-Party Specialists</span>
                    <span>Higher Cost Pass-Through</span>
                  </div>
                </div>

                {/* GDC / Offshore Center */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-600" />
                      <span className="font-bold text-slate-900">Global Delivery Center (GDC / Offshore Scale)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {gradeDistribution.sourcing.gdcOffshorePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={gradeDistribution.sourcing.gdcOffshorePct}
                    onChange={(e) => handleSourcingChange('gdcOffshorePct', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Execution Scale & Conversions</span>
                    <span>High Margin Leverage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary & Key Yields */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-sm p-6 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    Blended Commercials & Margin Yield (Program Master)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {data.grossMarginPct}% Target Gross Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Blended Bill Rate</span>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">
                      ${Math.round(data.blendedBillRate)}
                      <span className="text-xs font-normal text-slate-400"> / hr</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Client Realized Billing</span>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Blended Cost Rate</span>
                    <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                      ${Math.round(data.blendedCostRate)}
                      <span className="text-xs font-normal text-slate-400"> / hr</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Fully Loaded Delivery Cost</span>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Total Delivery Revenue (TCV)</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                      ${(Math.round(data.deliveryRevenue || 0)).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{(Math.round(data.targetHours || 0)).toLocaleString()} Defensible Hours</span>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Gross Margin Value</span>
                    <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">
                      ${(Math.round(data.grossProfitVal || (data.deliveryRevenue - data.deliveryCost) || 0)).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{data.grossMarginPct}% Profit Contribution</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>
                    Staffing model calibrated for <strong className="text-white font-mono">{projectWeeks} weeks</strong>:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.round(data.targetHours || 0).toLocaleString()}h ÷ ({projectWeeks}w × 40h) = {(data.targetHours / (projectWeeks * 40)).toFixed(1)} FTEs
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    (Peak: {(data.peakFTE || ((data.targetHours / (projectWeeks * 40)) * 1.36)).toFixed(1)} FTE)
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateScenario(prev => ({
                      ...prev,
                      projectWeeks: Math.max(16, (prev.projectWeeks || 32) - 4)
                    }))}
                    className="px-1.5 py-0.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    title="Decrease duration by 4 weeks"
                  >
                    -4w
                  </button>
                  <button
                    onClick={() => onUpdateScenario(prev => ({
                      ...prev,
                      projectWeeks: Math.max(16, (prev.projectWeeks || 32) - 1)
                    }))}
                    className="px-1.5 py-0.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    title="Decrease duration by 1 week"
                  >
                    -1w
                  </button>
                  <span className="px-2 py-0.5 font-mono text-xs font-bold text-amber-300 bg-slate-950 border border-slate-700">
                    {projectWeeks}w
                  </span>
                  <button
                    onClick={() => onUpdateScenario(prev => ({
                      ...prev,
                      projectWeeks: Math.min(104, (prev.projectWeeks || 32) + 1)
                    }))}
                    className="px-1.5 py-0.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    title="Increase duration by 1 week"
                  >
                    +1w
                  </button>
                  <button
                    onClick={() => onUpdateScenario(prev => ({
                      ...prev,
                      projectWeeks: Math.min(104, (prev.projectWeeks || 32) + 4)
                    }))}
                    className="px-1.5 py-0.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    title="Increase duration by 4 weeks"
                  >
                    +4w
                  </button>

                  {projectWeeks !== data.recommendedDurationWeeks && (
                    <button
                      onClick={() => onUpdateScenario(prev => ({
                        ...prev,
                        projectWeeks: data.recommendedDurationWeeks
                      }))}
                      className="ml-1 px-2 py-0.5 rounded-none bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      title="Adopt recommended duration"
                    >
                      Sync ({data.recommendedDurationWeeks}w)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Grade Distribution Table (Grade A to E) */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Role Grade Staffing Pyramid (Grades A to E)
                  </h3>
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Guardrail: Max 100%
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Organizational baseline: Grade A (20%), Grade B (35%), Grade C (30%), Grade D (10%), Grade E (5%)
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Total Mix Guardrail Badge */}
                {(() => {
                  const totalShare = gradeDistribution.grades.reduce((sum, g) => sum + g.defaultMixSharePct, 0);
                  const is100 = totalShare === 100;
                  return (
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 text-xs font-mono font-bold border flex items-center gap-1.5 ${
                        is100
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : totalShare > 100
                          ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        <span>Mix Total: {totalShare}%</span>
                        {is100 ? (
                          <span className="text-[10px] font-sans font-bold text-emerald-700">✓ Valid</span>
                        ) : totalShare > 100 ? (
                          <span className="text-[10px] font-sans font-bold text-rose-700">⚠ Exceeds 100%</span>
                        ) : (
                          <span className="text-[10px] font-sans font-bold text-amber-700">({100 - totalShare}% unallocated)</span>
                        )}
                      </div>

                      <button
                        onClick={handleResetToStandardGradeMix}
                        title="Reset to organizational default (A=20%, B=35%, C=30%, D=10%, E=5%)"
                        className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                      >
                        Reset Standard Mix
                      </button>

                      {!is100 && (
                        <button
                          onClick={handleNormalizeGradeMix}
                          title="Auto-normalize shares to equal 100%"
                          className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                        >
                          Auto-Scale to 100%
                        </button>
                      )}
                    </div>
                  );
                })()}

                <span className="text-xs font-mono font-bold text-slate-500 hidden md:inline">
                  {(Math.round(data.targetHours || 0)).toLocaleString()} hrs ({data.totalFTE.toFixed(1)} FTEs)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Grade Tier & Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 w-36 text-center">Mix Share (%)</th>
                    <th className="py-3 px-3 text-right">Allocated Hours</th>
                    <th className="py-3 px-3 text-right">FTE Concurrency</th>
                    <th className="py-3 px-3 text-right">Blended Bill</th>
                    <th className="py-3 px-3 text-right">Blended Cost</th>
                    <th className="py-3 px-3">Primary Grade Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {gradeDistribution.grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{grade.gradeCode}</div>
                        <div className="text-[11px] text-slate-500">{grade.gradeName}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold border ${
                          grade.category === 'Strategic'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : grade.category === 'Lead'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : grade.category === 'Execution'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {grade.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={grade.defaultMixSharePct}
                            onChange={(e) => handleGradeShareChange(grade.gradeCode, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded-none text-center font-mono font-bold text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
                          />
                          <span className="font-mono text-slate-400 text-xs">%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-700 text-sm">
                        {(grade.hours || 0).toLocaleString()} hrs
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-800 font-semibold">
                        {grade.fte} FTE
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${grade.blendedBillRate}/h
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        ${grade.blendedCostRate}/h
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-500 max-w-xs">
                        {ENTERPRISE_GRADES_CATALOG.find(g => g.gradeCode === grade.gradeCode)?.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERY ASSURANCE & DYNAMIC CONTINGENCY (FEATURE 3) */}
      {activeCommercialTab === 'assurance' && (
        <div className="space-y-6">
          {/* Top Assurance Index Card */}
          <div className="bg-slate-900 text-white rounded-sm p-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  TBD Delivery Assurance Standard
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                  deliveryAssurance.overallAssuranceRating === 'High'
                    ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400'
                    : deliveryAssurance.overallAssuranceRating === 'Moderate'
                    ? 'bg-blue-500/30 text-blue-200 border-blue-400'
                    : 'bg-rose-500/30 text-rose-200 border-rose-400'
                }`}>
                  {deliveryAssurance.overallAssuranceRating} Assurance
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={22} />
                Workstream Delivery Assurance Index: {deliveryAssurance.overallAssuranceScore}%
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {deliveryAssurance.contingencyRationale}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div className="p-3.5 bg-slate-800 border border-slate-700 text-center w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Recommended Contingency</span>
                <span className="text-3xl font-bold font-mono text-emerald-400 block mt-0.5">
                  {deliveryAssurance.recommendedContingencyPct}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Current: {Math.round(data.contingencyPct * 100)}%
                </span>
              </div>

              <button
                onClick={handleApplyRecommendedContingency}
                className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles size={14} />
                <span>Apply {deliveryAssurance.recommendedContingencyPct}% Contingency</span>
              </button>
            </div>
          </div>

          {/* Workstream Confidence Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Workstream Assurance Scores & Risk Drivers
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Granular confidence ratings mapped to client RFP evidence and schedule tension
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Workstream Domain</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Confidence Index</th>
                    <th className="py-3 px-3 text-center">Assurance Level</th>
                    <th className="py-3 px-3 text-right">Recommended Buffer</th>
                    <th className="py-3 px-3">Primary Risk Drivers & Scope Gaps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {deliveryAssurance.workstreamScores.map((ws) => (
                    <tr key={ws.workstreamId} className="hover:bg-slate-50">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {ws.workstreamName}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-none bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                          {ws.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold">
                          <span className={`text-sm ${
                            ws.confidenceScorePct >= 80 ? 'text-emerald-700' : ws.confidenceScorePct >= 65 ? 'text-blue-700' : 'text-rose-700'
                          }`}>
                            {ws.confidenceScorePct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          ws.assuranceRating === 'High'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ws.assuranceRating === 'Moderate'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {ws.assuranceRating}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {ws.recommendedContingencyPct}%
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ws.riskDrivers.map((driver, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                              {driver}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGIONAL SOURCING PYRAMID (ONSHORE & OFFSHORE ONLY) */}
      {activeCommercialTab === 'regional_mix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Sliders Box */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Resource Delivery Mix</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Adjust staffing distribution between Onshore and Offshore delivery tiers</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xs border border-slate-200">
                  Total: {scenario.deliveryMix.onshore + scenario.deliveryMix.offshore}% (100% Balanced)
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Delivery Mix Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSetDeliveryMix(20, 80)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xs cursor-pointer border transition flex items-center gap-1.5 ${
                      scenario.deliveryMix.onshore === 20 && scenario.deliveryMix.offshore === 80
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>⭐ 20% Onshore / 80% Offshore (Oracle GDM Standard)</span>
                  </button>
                  <button
                    onClick={() => handleSetDeliveryMix(30, 70)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-xs cursor-pointer border transition ${
                      scenario.deliveryMix.onshore === 30 && scenario.deliveryMix.offshore === 70
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    30 / 70 Balanced
                  </button>
                  <button
                    onClick={() => handleSetDeliveryMix(40, 60)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-xs cursor-pointer border transition ${
                      scenario.deliveryMix.onshore === 40 && scenario.deliveryMix.offshore === 60
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    40 / 60 Co-Creation
                  </button>
                  <button
                    onClick={() => handleSetDeliveryMix(15, 85)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-xs cursor-pointer border transition ${
                      scenario.deliveryMix.onshore === 15 && scenario.deliveryMix.offshore === 85
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    15 / 85 High Leverage
                  </button>
                </div>
              </div>

              <div className="space-y-5 pt-2">
                {/* Onshore */}
                <div className="space-y-1.5 p-3.5 bg-blue-50/30 rounded-xs border border-blue-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-600 rounded-none" />
                      <span className="font-bold text-slate-900">Onshore (Client Site / Local)</span>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Lead Architects, PMO & Functional Leads</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-slate-600 font-semibold text-xs">
                        {(Math.round(data.hoursByRegion.onshore || 0)).toLocaleString()} hrs
                      </span>
                      <span className="font-mono font-bold text-blue-700 text-sm w-12 text-right bg-white px-1.5 py-0.5 border border-blue-200 rounded-xs">
                        {scenario.deliveryMix.onshore}%
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={scenario.deliveryMix.onshore}
                    onChange={(e) => handleOnshoreChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10% (Min Onshore)</span>
                    <span>50%</span>
                    <span>80% (Max Onshore)</span>
                  </div>
                </div>

                {/* Offshore */}
                <div className="space-y-1.5 p-3.5 bg-emerald-50/30 rounded-xs border border-emerald-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-600 rounded-none" />
                      <span className="font-bold text-slate-900">Offshore (Global Delivery Centers / GDC)</span>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Technical Build, FBDI, Integrations & Reports</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-slate-600 font-semibold text-xs">
                        {(Math.round(data.hoursByRegion.offshore || 0)).toLocaleString()} hrs
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-sm w-12 text-right bg-white px-1.5 py-0.5 border border-emerald-200 rounded-xs">
                        {scenario.deliveryMix.offshore}%
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={90}
                    value={scenario.deliveryMix.offshore}
                    onChange={(e) => handleOffshoreChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>20% (Min Offshore)</span>
                    <span>50%</span>
                    <span>90% (Max Offshore)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Delivery Pyramid Card */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-sm p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Delivery Sourcing Ratio
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {scenario.deliveryMix.onshore}% Onshore : {scenario.deliveryMix.offshore}% Offshore
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-600/30 border border-blue-500/50 p-4 text-center rounded-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-200">Onsite / Onshore</span>
                    <span className="text-sm font-mono font-bold text-white">{scenario.deliveryMix.onshore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>Hours:</span>
                    <span>{(Math.round(data.hoursByRegion.onshore || 0)).toLocaleString()} hrs</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-blue-500/20 mt-1">
                    <span>Revenue:</span>
                    <span>${(Math.round(data.revenueByRegion?.onshore || 0)).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-emerald-600/20 border border-emerald-500/40 p-4 text-center rounded-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-200">Offshore Global Delivery Center</span>
                    <span className="text-sm font-mono font-bold text-white">{scenario.deliveryMix.offshore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>Hours:</span>
                    <span>{(Math.round(data.hoursByRegion.offshore || 0)).toLocaleString()} hrs</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-emerald-500/20 mt-1">
                    <span>Revenue:</span>
                    <span>${(Math.round(data.revenueByRegion?.offshore || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xs text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Blended Sell Rate:</span>
                  <span className="font-bold text-white">${Math.round(data.blendedBillRate)}/hr</span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Blended Cost Rate:</span>
                  <span className="font-bold text-white">${Math.round(data.blendedCostRate)}/hr</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-mono text-[11px] pt-1 border-t border-slate-700">
                  <span>Gross Margin:</span>
                  <span className="font-bold">{data.grossMarginPct?.toFixed(1) || '44.8'}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
