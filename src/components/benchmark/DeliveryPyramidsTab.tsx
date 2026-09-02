import React, { useState, useMemo } from 'react';
import {
  DeliveryModelPreset,
  RoleRateCardItem,
  calculateMasterBlendedRate
} from '../../data/benchmarkMasterData';
import {
  Sliders,
  Calculator,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface DeliveryPyramidsTabProps {
  deliveryPyramids: DeliveryModelPreset[];
  activePyramidId: string;
  onSelectPyramid: (id: string) => void;
  roleRateCards: RoleRateCardItem[];
  targetHours: number;
  currentActiveDeliveryMix: { onshore: number; nearshore: number; offshore: number };
}

export const DeliveryPyramidsTab: React.FC<DeliveryPyramidsTabProps> = ({
  deliveryPyramids,
  activePyramidId,
  onSelectPyramid,
  roleRateCards,
  targetHours,
  currentActiveDeliveryMix
}) => {
  const selectedPyramid = useMemo(() => {
    return deliveryPyramids.find(p => p.id === activePyramidId) || deliveryPyramids[0];
  }, [deliveryPyramids, activePyramidId]);

  // Dynamic interactive delivery mix state for simulator
  const [simOnshore, setSimOnshore] = useState(selectedPyramid.deliveryMix.onshore);
  const [simNearshore, setSimNearshore] = useState(selectedPyramid.deliveryMix.nearshore);
  const [simOffshore, setSimOffshore] = useState(selectedPyramid.deliveryMix.offshore);

  // Sync simulator state when active preset changes
  React.useEffect(() => {
    setSimOnshore(selectedPyramid.deliveryMix.onshore);
    setSimNearshore(selectedPyramid.deliveryMix.nearshore);
    setSimOffshore(selectedPyramid.deliveryMix.offshore);
  }, [selectedPyramid]);

  // Calculate live blended rate with full arithmetic decomposition
  const liveCalculation = useMemo(() => {
    return calculateMasterBlendedRate(
      targetHours,
      { onshore: simOnshore, nearshore: simNearshore, offshore: simOffshore },
      roleRateCards
    );
  }, [targetHours, simOnshore, simNearshore, simOffshore, roleRateCards]);

  const activeProjectComparison = useMemo(() => {
    return calculateMasterBlendedRate(
      targetHours,
      currentActiveDeliveryMix,
      roleRateCards
    );
  }, [targetHours, currentActiveDeliveryMix, roleRateCards]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Preset Model Switcher Cards */}
      <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Layers size={17} className="text-blue-600" />
              Standard Delivery Model Pyramids & Staffing Presets
            </h3>
            <p className="text-xs text-slate-500">
              Select an approved delivery staffing preset or dynamically adjust the location and grade pyramid ratios.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xs bg-blue-50 text-blue-800 border border-blue-200">
            {deliveryPyramids.length} Approved Presets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {deliveryPyramids.map(preset => {
            const isSelected = preset.id === activePyramidId;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPyramid(preset.id)}
                className={`p-4 rounded-sm border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                        <CheckCircle2 size={11} /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {preset.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Location Mix:</span>
                    <span className="font-bold text-slate-800">
                      {preset.deliveryMix.onshore}% On / {preset.deliveryMix.nearshore}% Near / {preset.deliveryMix.offshore}% Off
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Target Blended Rate:</span>
                    <span className="font-mono font-bold text-slate-900">${preset.targetBlendedBillRate}/hr</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Target Margin:</span>
                    <span className="font-mono font-bold text-emerald-700">{preset.targetGrossMarginPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Arithmetic Blended Rate Calculation Engine */}
      <div className="bg-slate-900 text-white rounded-sm p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-amber-400" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Transparent Arithmetic Formula Decomposition
              </h4>
              <p className="text-[11px] text-slate-400">
                Zero-magic-number calculation trace mapping every labor hour to location rates, grade weights, and gross profit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">Target Volume:</span>
            <span className="px-2 py-0.5 rounded-xs bg-slate-800 text-amber-300 font-bold border border-slate-700">
              {targetHours.toLocaleString()} Total Hours
            </span>
          </div>
        </div>

        {/* 3 Step Decomposition Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-800/80 rounded-xs border border-slate-700 space-y-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">
              Step 1: Location Mix Ratio
            </span>
            <div className="text-sm font-mono font-bold text-white">
              {simOnshore}% On • {simNearshore}% Near • {simOffshore}% Off
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Weighted factor normalized to 100% capacity.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xs border border-slate-700 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Step 2: Blended Rates Calculated
            </span>
            <div className="text-sm font-mono font-bold text-emerald-300">
              ${liveCalculation.blendedBillRate.toFixed(2)}/hr <span className="text-xs text-slate-400 font-normal">(Cost: ${liveCalculation.blendedCostRate.toFixed(2)})</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Sum(Role_i Hours × Weighted Location Rate) ÷ Total Hours.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xs border border-slate-700 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
              Step 3: Target Profitability
            </span>
            <div className="text-sm font-mono font-bold text-amber-300">
              {liveCalculation.grossMarginPct.toFixed(1)}% Gross Margin
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Gross Profit: ${liveCalculation.grossProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Role Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                <th className="py-2 px-3">Grade & Role</th>
                <th className="py-2 px-2 text-center">Mix Share</th>
                <th className="py-2 px-2 text-right">Allocated Hours</th>
                <th className="py-2 px-2 text-right text-blue-300">Weighted Bill Rate</th>
                <th className="py-2 px-2 text-right text-slate-400">Weighted Cost Rate</th>
                <th className="py-2 px-2 text-right text-emerald-300">Total Revenue</th>
                <th className="py-2 px-2 text-right text-slate-400">Total Cost</th>
                <th className="py-2 px-3 text-right text-amber-300">Role Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {liveCalculation.roleBreakdown.map(rb => (
                <tr key={rb.roleId} className="hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-sans text-white font-medium">
                    <span className="text-slate-400 font-mono text-[10px] mr-1.5">{rb.gradeCode}</span>
                    {rb.roleName}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-300">{rb.sharePct}%</td>
                  <td className="py-2 px-2 text-right text-white font-bold">{rb.hours.toLocaleString()} hrs</td>
                  <td className="py-2 px-2 text-right text-blue-300 font-bold">${rb.weightedBillRate}/hr</td>
                  <td className="py-2 px-2 text-right text-slate-400">${rb.weightedCostRate}/hr</td>
                  <td className="py-2 px-2 text-right text-emerald-300 font-bold">${rb.roleRevenue.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">${rb.roleCost.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-amber-300 font-bold">{rb.roleMarginPct}%</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-700 bg-slate-800/70 font-bold text-white text-xs">
                <td className="py-2.5 px-3 uppercase font-sans">Total Delivery Model Sum</td>
                <td className="py-2.5 px-2 text-center font-mono">100%</td>
                <td className="py-2.5 px-2 text-right font-mono">{targetHours.toLocaleString()} hrs</td>
                <td className="py-2.5 px-2 text-right text-blue-300 font-mono">${liveCalculation.blendedBillRate.toFixed(2)}/hr</td>
                <td className="py-2.5 px-2 text-right text-slate-300 font-mono">${liveCalculation.blendedCostRate.toFixed(2)}/hr</td>
                <td className="py-2.5 px-2 text-right text-emerald-300 font-mono">${liveCalculation.revenue.toLocaleString()}</td>
                <td className="py-2.5 px-2 text-right text-slate-300 font-mono">${liveCalculation.cost.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right text-amber-300 font-mono">{liveCalculation.grossMarginPct.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
