import React from 'react';
import { CommercialGovernanceConfig } from '../../data/benchmarkMasterData';
import {
  ShieldAlert,
  Percent,
  Sliders,
  DollarSign,
  TrendingUp,
  Scale,
  Plane,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface CommercialGovernanceTabProps {
  governanceConfig: CommercialGovernanceConfig;
  onUpdateGovernance: (field: keyof CommercialGovernanceConfig, value: any) => void;
  targetRevenue: number;
  grossMarginPct: number;
}

export const CommercialGovernanceTab: React.FC<CommercialGovernanceTabProps> = ({
  governanceConfig,
  onUpdateGovernance,
  targetRevenue,
  grossMarginPct
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-slate-900 text-white">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                Commercial Multipliers & Financial Governance Guardrails
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-200">
                  Deal Board Enforced
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure firm-wide margin floors, contract risk multipliers, Delegation of Authority (DoA) thresholds, and T&E factors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xs text-xs font-mono font-bold border ${
              grossMarginPct >= governanceConfig.targetGrossMarginPct
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : grossMarginPct >= governanceConfig.minimumFloorMarginPct
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              Active Deal Margin: {grossMarginPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 4 Commercial Multiplier Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Gross Margin */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Percent size={14} className="text-blue-600" />
                Target Margin
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-xs">
                Standard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={20}
                max={70}
                step={0.5}
                value={governanceConfig.targetGrossMarginPct}
                onChange={e => onUpdateGovernance('targetGrossMarginPct', Number(e.target.value))}
                className="w-20 px-2 py-1 text-base font-mono font-bold bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
              />
              <span className="text-xs text-slate-500 font-bold">% Gross Margin</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Standard firm target for all enterprise transformation deals.
            </p>
          </div>

          {/* Minimum Floor Margin (DoA Trigger) */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-600" />
                Floor Margin (DoA)
              </span>
              <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-xs">
                Hard Stop
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={15}
                max={50}
                step={0.5}
                value={governanceConfig.minimumFloorMarginPct}
                onChange={e => onUpdateGovernance('minimumFloorMarginPct', Number(e.target.value))}
                className="w-20 px-2 py-1 text-base font-mono font-bold bg-white border border-rose-300 rounded-xs focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-500 font-bold">% Floor</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Proposals below this margin require C-level Executive Deal Board sign-off.
            </p>
          </div>

          {/* Travel & Living (T&E) % */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Plane size={14} className="text-amber-600" />
                T&E Allowance
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-xs">
                Onshore %
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={25}
                step={0.5}
                value={governanceConfig.travelAndLivingPctOfOnshore}
                onChange={e => onUpdateGovernance('travelAndLivingPctOfOnshore', Number(e.target.value))}
                className="w-20 px-2 py-1 text-base font-mono font-bold bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
              />
              <span className="text-xs text-slate-500 font-bold">% Onshore</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Estimated travel expenses applied to onshore billable labor.
            </p>
          </div>

          {/* Annual COLA Escalator % */}
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600" />
                Annual COLA
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-xs">
                Per Year
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={governanceConfig.annualColaEscalatorPct}
                onChange={e => onUpdateGovernance('annualColaEscalatorPct', Number(e.target.value))}
                className="w-20 px-2 py-1 text-base font-mono font-bold bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
              />
              <span className="text-xs text-slate-500 font-bold">% Escalation</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Annual rate escalation factor applied for multi-year multi-wave programs.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Risk Multipliers & DoA Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contract Risk Multipliers */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Contract Risk & Pricing Type Multipliers
            </h4>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-xs">
              Risk Premium
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xs bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-xs text-slate-900">Fixed Price (FP) / Milestone</div>
                <div className="text-[11px] text-slate-500">Includes delivery risk contingency for fixed outcomes</div>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold">
                <input
                  type="number"
                  min={1.0}
                  max={1.5}
                  step={0.01}
                  value={governanceConfig.contractRiskMultipliers.fixedPrice}
                  onChange={e => onUpdateGovernance('contractRiskMultipliers', {
                    ...governanceConfig.contractRiskMultipliers,
                    fixedPrice: Number(e.target.value)
                  })}
                  className="w-16 px-1.5 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                />
                <span className="text-xs text-slate-400">x</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xs bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-xs text-slate-900">Hybrid / Capped Milestone</div>
                <div className="text-[11px] text-slate-500">Shared risk model with target milestones</div>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold">
                <input
                  type="number"
                  min={1.0}
                  max={1.3}
                  step={0.01}
                  value={governanceConfig.contractRiskMultipliers.hybridMilestone}
                  onChange={e => onUpdateGovernance('contractRiskMultipliers', {
                    ...governanceConfig.contractRiskMultipliers,
                    hybridMilestone: Number(e.target.value)
                  })}
                  className="w-16 px-1.5 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                />
                <span className="text-xs text-slate-400">x</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xs bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-xs text-slate-900">Time & Materials (T&M)</div>
                <div className="text-[11px] text-slate-500">Baseline multiplier for pure hourly billing</div>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold">
                <input
                  type="number"
                  min={0.9}
                  max={1.2}
                  step={0.01}
                  value={governanceConfig.contractRiskMultipliers.timeAndMaterials}
                  onChange={e => onUpdateGovernance('contractRiskMultipliers', {
                    ...governanceConfig.contractRiskMultipliers,
                    timeAndMaterials: Number(e.target.value)
                  })}
                  className="w-16 px-1.5 py-0.5 text-right font-mono font-bold bg-white border border-slate-300 rounded-xs"
                />
                <span className="text-xs text-slate-400">x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delegation of Authority (DoA) Deal Board Matrix */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              DoA Deal Governance Approval Matrix
            </h4>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-xs border border-indigo-200">
              3-Tier Approvals
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xs bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Tier 1: Standard Partner Sign-Off</div>
                <div className="text-[11px] text-slate-500">Deals under $2.5M with &gt; 35% margin</div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                Partner Approval
              </span>
            </div>

            <div className="p-3 rounded-xs bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Tier 2: Practice Leader Review</div>
                <div className="text-[11px] text-slate-500">Deals $2.5M – $6.0M or 32–35% margin</div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xs border border-blue-200">
                Practice Leader
              </span>
            </div>

            <div className="p-3 rounded-xs bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Tier 3: Executive Deal Review Board</div>
                <div className="text-[11px] text-slate-500">Deals &gt; $6.0M or &lt; 32% margin</div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xs border border-rose-200">
                Deal Review Board
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
