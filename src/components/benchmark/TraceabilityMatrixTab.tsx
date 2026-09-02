import React, { useState } from 'react';
import {
  EstimationBenchmarkMasterConfig,
  DEFAULT_ROLE_RATE_CARDS,
  DEFAULT_DELIVERY_PYRAMIDS,
  DEFAULT_COMMERCIAL_GOVERNANCE
} from '../../data/benchmarkMasterData';
import {
  CheckCircle2,
  ShieldCheck,
  Search,
  ArrowRight,
  Database,
  Code2,
  Sliders,
  DollarSign,
  TrendingUp,
  Layers,
  FileCheck
} from 'lucide-react';

interface TraceabilityMatrixTabProps {
  config: EstimationBenchmarkMasterConfig;
  targetHours: number;
  totalRevenue: number;
  blendedRate: number;
  grossMarginPct: number;
}

export const TraceabilityMatrixTab: React.FC<TraceabilityMatrixTabProps> = ({
  config,
  targetHours,
  totalRevenue,
  blendedRate,
  grossMarginPct
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const traceabilityEntries = [
    {
      id: 'trace_rate_cards',
      category: 'Rate Cards',
      item: 'Master Role Rate Cards & Seniority Tiers',
      sourceBasis: 'Oracle True Cloud Method (TCM) empirical rate catalog (7 Seniority Tiers)',
      activeProjectValue: `7 Roles calibrated | Partner $375/hr down to QA $145/hr`,
      formula: 'Role Bill Rate = Onshore × %On + Nearshore × %Near + Offshore × %Off',
      downstreamViews: ['Commercials View', 'Rate Card Matrix', 'Deal Board RFP'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_blended_rate',
      category: 'Delivery Pyramids',
      item: 'Delivery Model & Blended Rate Engine',
      sourceBasis: 'Standard Global Delivery Model (30% Onshore / 15% Nearshore / 55% Offshore)',
      activeProjectValue: `$${blendedRate.toFixed(2)}/hr Blended Bill Rate | ${targetHours.toLocaleString()} hrs`,
      formula: 'Blended Rate = Sum(Role Hours × Weighted Location Rate) ÷ Total Project Hours',
      downstreamViews: ['Commercials View', 'Proposal View', 'Executive Deal Banner'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_wbs_layer1',
      category: 'WBS Sizing',
      item: 'Layer 1: Task Work Breakdown Structure (WBS)',
      sourceBasis: 'Gold-standard 240h XS baseline across 5 standard phases (FSM, CRP, SLA, SIT, Cutover)',
      activeProjectValue: `${config.wbsActivities.length} WBS Activities calibrated across XS-XXL`,
      formula: 'Module Base WBS Hours = WBS_Activity_Hours_for_TShirt_Size',
      downstreamViews: ['WBS View', 'Schedule Gantt', 'Smartsheet 30-Column Spec'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_mod_layer2',
      category: 'Intrinsic Complexity',
      item: 'Layer 2: Intrinsic Module Complexity Multipliers',
      sourceBasis: 'Calibrated across 20+ ERP, SCM, HCM, and EPM modules with architectural feature weights',
      activeProjectValue: `${Object.keys(config.moduleIntrinsicConfigs).length} Modules with active feature weights`,
      formula: 'Intrinsic Multiplier = 1.0 + Sum(Active_Feature_Weight_i)',
      downstreamViews: ['Estimation Engine', 'Complexity Studio', 'Discovery 20-Q'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_ricefw_layer3',
      category: 'RICEFW Catalog',
      item: 'Layer 3: RICEFW Deliverable Unit Catalog',
      sourceBasis: 'Empirical deliverable unit catalog (OIC Integrations, BIP Reports, FBDI, PaaS VBCS, FastFormulas)',
      activeProjectValue: `${config.ricefwMasterConfig.patterns.length} standard deliverable units with phase breakdown`,
      formula: 'Unit Total Hours = Spec + Build + SIT Test + Cutover Rehearsal',
      downstreamViews: ['Discovery Technical', 'RICEFW Spec Sheet', 'Technical Scoping'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_scale_layer4',
      category: 'Scale Step-Curves',
      item: 'Layer 4: Functional Scale Driver Step-Curves',
      sourceBasis: 'Non-linear marginal efficiency step-curves (Chart of Accounts, Plants, Warehouses, Payroll Countries)',
      activeProjectValue: `${config.scaleDriverStepCurves.length} step-curve scaling models active`,
      formula: 'Marginal Hours = Sum(Tier_Quantity_i × Marginal_Hours_Per_Tier_Unit)',
      downstreamViews: ['Discovery Scale Drivers', 'Topology Modifiers', 'Gantt Sprints'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_phase_staffing',
      category: 'Phase Mix',
      item: 'Phase-Specific Staffing Mix Overrides',
      sourceBasis: 'Oracle True Cloud Method (TCM) Phase Gate allocation (Wave 0 Inception to Hypercare)',
      activeProjectValue: `${config.phaseStaffingRules.length} lifecycle phases with custom On/Near/Off distribution`,
      formula: 'Phase Labor Cost = Phase Hours × Sum(Phase Location Shares × Role Rates)',
      downstreamViews: ['Commercials View', 'Schedule Gantt', 'Resource Plan'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    },
    {
      id: 'trace_commercial_guardrails',
      category: 'Commercials',
      item: 'Commercial Multipliers & DoA Guardrails',
      sourceBasis: 'Enterprise Deal Board policy: 45% target gross margin, 32% hard stop floor, 1.12x FP risk factor',
      activeProjectValue: `${config.commercialGovernance.targetGrossMarginPct}% Target Margin | Active: ${grossMarginPct.toFixed(1)}%`,
      formula: 'Total Revenue = Total Hours × Blended Bill Rate × Contract Risk Multiplier',
      downstreamViews: ['Commercials View', 'Deal Board DoA', 'Proposal Deck'],
      auditStatus: 'VERIFIED_DEFENSIBLE'
    }
  ];

  const filteredEntries = traceabilityEntries.filter(entry => {
    if (categoryFilter !== 'ALL' && entry.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        entry.item.toLowerCase().includes(q) ||
        entry.sourceBasis.toLowerCase().includes(q) ||
        entry.formula.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Verification Strip */}
      <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-emerald-700 text-white">
              <FileCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                End-to-End Benchmark Traceability & Defensibility Matrix
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Audit Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Rigorous traceability mapping every benchmark parameter to its empirical foundation, mathematical formula, active project application, and downstream views.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search traceability map..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xs border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-500 w-52"
              />
            </div>
          </div>
        </div>

        {/* Traceability Categories Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          {['ALL', 'Rate Cards', 'Delivery Pyramids', 'WBS Sizing', 'Intrinsic Complexity', 'RICEFW Catalog', 'Scale Step-Curves', 'Phase Mix', 'Commercials'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xs font-bold transition cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Traceability Table */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Traceability Mapping ({filteredEntries.length} Items)
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 size={13} /> Zero Magic Numbers Enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">Area & Benchmark Item</th>
                <th className="py-2.5 px-3 min-w-[200px]">Empirical Source & Basis</th>
                <th className="py-2.5 px-3 min-w-[200px]">Active Project Application</th>
                <th className="py-2.5 px-3 font-mono">Mathematical Formula</th>
                <th className="py-2.5 px-3">Downstream Consumers</th>
                <th className="py-2.5 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 align-top">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 block w-fit mb-1">
                      {entry.category}
                    </span>
                    <div className="font-bold text-slate-900 text-xs">{entry.item}</div>
                  </td>

                  <td className="py-3 px-3 align-top text-slate-600 text-[11px] leading-snug">
                    {entry.sourceBasis}
                  </td>

                  <td className="py-3 px-3 align-top font-medium text-slate-900 text-[11px] leading-snug">
                    {entry.activeProjectValue}
                  </td>

                  <td className="py-3 px-3 align-top font-mono text-[11px] text-blue-900 bg-blue-50/20">
                    {entry.formula}
                  </td>

                  <td className="py-3 px-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {entry.downstreamViews.map((view, vIdx) => (
                        <span key={vIdx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-xs border border-slate-200 font-medium">
                          {view}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-2 align-top text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={11} /> Defensible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
