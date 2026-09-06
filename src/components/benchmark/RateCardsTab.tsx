import React, { useState } from 'react';
import { RoleRateCardItem } from '../../data/benchmarkMasterData';
import {
  DollarSign,
  Globe,
  Briefcase,
  ShieldCheck,
  Building,
  Info,
  Sliders,
  TrendingUp,
  Search,
  CheckCircle2
} from 'lucide-react';

interface RateCardsTabProps {
  roleRateCards: RoleRateCardItem[];
  onUpdateRoleRate: (roleId: string, field: keyof RoleRateCardItem, value: any) => void;
  targetHours: number;
}

export const RateCardsTab: React.FC<RateCardsTabProps> = ({
  roleRateCards,
  onUpdateRoleRate,
  targetHours
}) => {
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'onshore' | 'nearshore' | 'offshore'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = roleRateCards.filter(r => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      r.roleName.toLowerCase().includes(q) ||
      r.gradeCode.toLowerCase().includes(q) ||
      r.seniorityTier.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Metric Strip */}
      <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-slate-900 text-white">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                Master Delivery Tier Rate Cards & Roles Catalog
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Defensible & Traceable
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Calibrate enterprise bill and cost rates across 5 Seniority Grades, 3 Global Delivery Locations, and 3 Sourcing Models.
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
                placeholder="Search roles or grades..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xs border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Global Delivery Location Multiplier Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          <div className="p-3.5 bg-blue-50/40 rounded-xs border border-blue-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building size={14} className="text-blue-600" />
                Onshore Delivery Tier
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-xs">
                US / UK / West Europe
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Client co-location, steering governance, executive change & lead architect authority.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/40 rounded-xs border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-600" />
                Offshore Delivery Tier
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-xs">
                India / Global Centers (GDC)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Scalable technical factory: OIC development, BIP reporting, data conversion & QA automation.
            </p>
          </div>
        </div>
      </div>

      {/* Master Rate Card Table */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-slate-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Configurable Role Master Matrix ({filteredRoles.length} Roles)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter View:</span>
            <div className="inline-flex rounded-xs border border-slate-300 bg-white p-0.5">
              {(['all', 'onshore', 'offshore'] as const).map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-xs capitalize transition cursor-pointer ${
                    selectedLocation === loc ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">Grade & Seniority</th>
                <th className="py-2.5 px-3 min-w-[220px]">Role Title & Scope</th>
                <th className="py-2.5 px-2 text-center">Standard Share %</th>
                {(selectedLocation === 'all' || selectedLocation === 'onshore') && (
                  <>
                    <th className="py-2.5 px-2 text-right bg-blue-50/50">Onshore Bill ($/hr)</th>
                    <th className="py-2.5 px-2 text-right bg-blue-50/30">Onshore Cost</th>
                  </>
                )}
                {(selectedLocation === 'all' || selectedLocation === 'offshore') && (
                  <>
                    <th className="py-2.5 px-2 text-right bg-emerald-50/50">Offshore Bill ($/hr)</th>
                    <th className="py-2.5 px-2 text-right bg-emerald-50/30">Offshore Cost</th>
                  </>
                )}
                <th className="py-2.5 px-2 text-right">Target Margin</th>
                <th className="py-2.5 px-3 min-w-[200px]">Traceability & Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredRoles.map(role => (
                <tr key={role.roleId} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold w-fit ${
                        role.gradeCode === 'Grade E' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        role.gradeCode === 'Grade D' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                        role.gradeCode === 'Grade C' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                        role.gradeCode === 'Grade B' ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                        'bg-teal-100 text-teal-900 border border-teal-200'
                      }`}>
                        {role.gradeCode}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{role.seniorityTier}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    <div className="font-bold text-slate-900 text-xs">{role.roleName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{role.description}</div>
                  </td>

                  <td className="py-2.5 px-2 align-top text-center font-mono font-bold">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={role.defaultMixSharePct}
                        onChange={e => onUpdateRoleRate(role.roleId, 'defaultMixSharePct', Number(e.target.value))}
                        className="w-14 px-1.5 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
                      />
                      <span className="text-slate-400 text-[11px]">%</span>
                    </div>
                  </td>

                  {(selectedLocation === 'all' || selectedLocation === 'onshore') && (
                    <>
                      <td className="py-2.5 px-2 align-top text-right bg-blue-50/20 font-mono">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-[11px]">$</span>
                          <input
                            type="number"
                            min={0}
                            value={role.onshoreHourlyRate}
                            onChange={e => onUpdateRoleRate(role.roleId, 'onshoreHourlyRate', Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-right font-mono font-bold bg-white border border-blue-300 rounded-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-2 align-top text-right bg-blue-50/10 font-mono text-slate-600">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-[11px]">$</span>
                          <input
                            type="number"
                            min={0}
                            value={role.onshoreCostRate}
                            onChange={e => onUpdateRoleRate(role.roleId, 'onshoreCostRate', Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-right font-mono text-slate-600 bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
                          />
                        </div>
                      </td>
                    </>
                  )}

                  {(selectedLocation === 'all' || selectedLocation === 'offshore') && (
                    <>
                      <td className="py-2.5 px-2 align-top text-right bg-emerald-50/20 font-mono">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-[11px]">$</span>
                          <input
                            type="number"
                            min={0}
                            value={role.offshoreHourlyRate}
                            onChange={e => onUpdateRoleRate(role.roleId, 'offshoreHourlyRate', Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-right font-mono font-bold bg-white border border-emerald-300 rounded-xs focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-2 align-top text-right bg-emerald-50/10 font-mono text-slate-600">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-[11px]">$</span>
                          <input
                            type="number"
                            min={0}
                            value={role.offshoreCostRate}
                            onChange={e => onUpdateRoleRate(role.roleId, 'offshoreCostRate', Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-right font-mono text-slate-600 bg-white border border-slate-300 rounded-xs focus:ring-1 focus:ring-slate-500"
                          />
                        </div>
                      </td>
                    </>
                  )}

                  <td className="py-2.5 px-2 align-top text-right font-mono font-bold">
                    <span className={`px-1.5 py-0.5 rounded-xs text-[11px] ${
                      role.expectedMarginPct >= 50 ? 'bg-emerald-100 text-emerald-900' :
                      role.expectedMarginPct >= 40 ? 'bg-blue-100 text-blue-900' :
                      'bg-amber-100 text-amber-900'
                    }`}>
                      {role.expectedMarginPct}%
                    </span>
                  </td>

                  <td className="py-2.5 px-3 align-top">
                    <div className="text-[11px] text-slate-600 italic leading-snug">
                      {role.traceabilityNotes}
                    </div>
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
