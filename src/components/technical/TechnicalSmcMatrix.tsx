import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Code2,
  Database,
  FileCode2,
  Workflow,
  ShieldCheck,
  Zap,
  HelpCircle,
  Calculator,
  ArrowUpDown,
  CheckCircle2,
  Info,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, TechnicalObjectSmcRow } from '../../types';
import { TECHNICAL_OBJECT_SMC_CATALOG } from '../../data/technicalScopingData';
import { getEffectiveSmcCounts, syncIntegrationsFromCount, syncIntegrationsFromOverrides } from '../../utils/technicalSync';

interface TechnicalSmcMatrixProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  data: CalculatedProjectData;
}

export const TechnicalSmcMatrix: React.FC<TechnicalSmcMatrixProps> = ({
  scenario,
  onUpdateScenario,
  data
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get current SMC counts for a specific typeId honoring clean-slate & dynamic scale drivers
  const getCountsForType = (row: TechnicalObjectSmcRow) => {
    return getEffectiveSmcCounts(row, scenario);
  };

  const handleUpdateCount = (typeId: string, complexity: 'simple' | 'medium' | 'complex', value: number) => {
    const clamped = Math.max(0, value);
    onUpdateScenario(prev => {
      const currentOverrides = prev.technicalSmcOverrides || {};
      const currentTypeOverride = currentOverrides[typeId] || {};
      const defaultRow = TECHNICAL_OBJECT_SMC_CATALOG.find(r => r.typeId === typeId);
      const effectiveDefaults = defaultRow ? getEffectiveSmcCounts(defaultRow, prev) : { simple: 0, medium: 0, complex: 0 };
      
      const newOverride = {
        simple: currentTypeOverride.simple !== undefined ? currentTypeOverride.simple : effectiveDefaults.simple,
        medium: currentTypeOverride.medium !== undefined ? currentTypeOverride.medium : effectiveDefaults.medium,
        complex: currentTypeOverride.complex !== undefined ? currentTypeOverride.complex : effectiveDefaults.complex,
        [complexity]: clamped
      };

      const updatedOverrides = {
        ...currentOverrides,
        [typeId]: newOverride
      };

      // Also compute sync updates for scaleDrivers
      // e.g. sum of all integration types -> tech_oic
      const intRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'integrations');
      const totalOicCount = intRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const paasRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'paas');
      const totalPaasCount = paasRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const bipRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'reports_bip');
      const totalBipCount = bipRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const otbiRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'reports_otbi');
      const totalOtbiCount = otbiRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const ffRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'fast_formulas');
      const totalFfCount = ffRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const wfRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'workflows');
      const totalWfCount = wfRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const secRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'security_roles');
      const totalSecCount = secRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const convRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === 'conversions');
      const totalConvCount = convRows.reduce((sum, r) => {
        const ov = updatedOverrides[r.typeId];
        const eff = getEffectiveSmcCounts(r, prev);
        const s = ov?.simple !== undefined ? ov.simple : eff.simple;
        const m = ov?.medium !== undefined ? ov.medium : eff.medium;
        const c = ov?.complex !== undefined ? ov.complex : eff.complex;
        return sum + s + m + c;
      }, 0);

      const intermediateScenario: ProjectScenario = {
        ...prev,
        technicalSmcOverrides: updatedOverrides,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: totalOicCount,
          tech_paas: totalPaasCount,
          tech_reports_bip: totalBipCount,
          tech_reports_otbi: totalOtbiCount,
          tech_fast_formulas: totalFfCount,
          tech_workflows: totalWfCount,
          tech_security_roles: totalSecCount,
          tech_data_objects: totalConvCount
        }
      };

      // If an integration category was edited, synchronize technicalIntegrations list preserving overrides
      const isIntegrationRow = intRows.some(r => r.typeId === typeId);
      if (isIntegrationRow) {
        return syncIntegrationsFromOverrides(intermediateScenario);
      }

      return intermediateScenario;
    });
  };

  const handleResetToDefaults = () => {
    onUpdateScenario(prev => {
      const isCleanSlate = prev.selectedModules.length === 0;
      if (isCleanSlate) {
        const zeroSmcOverrides: Record<string, { simple: number; medium: number; complex: number }> = {};
        TECHNICAL_OBJECT_SMC_CATALOG.forEach(r => {
          zeroSmcOverrides[r.typeId] = { simple: 0, medium: 0, complex: 0 };
        });
        return {
          ...prev,
          technicalSmcOverrides: zeroSmcOverrides,
          scaleDrivers: {
            ...prev.scaleDrivers,
            tech_oic: 0
          },
          technicalIntegrations: []
        };
      }
      return {
        ...prev,
        technicalSmcOverrides: undefined
      };
    });
  };

  // Compute category totals
  const categoriesList = [
    { id: 'all', label: 'All Technical Objects' },
    { id: 'integrations', label: '1. OIC Integrations' },
    { id: 'paas', label: '2. PaaS / VBCS Apps' },
    { id: 'reports_bip', label: '3. BIP Documents' },
    { id: 'reports_otbi', label: '4. OTBI Dashboards' },
    { id: 'fast_formulas', label: '5. Fast Formulas' },
    { id: 'workflows', label: '6. BPM Workflows' },
    { id: 'security_roles', label: '7. Security SOD' },
    { id: 'conversions', label: '8. Conversions' }
  ];

  const filteredRows = TECHNICAL_OBJECT_SMC_CATALOG.filter(row => {
    const matchesCat = activeCategoryFilter === 'all' || row.category === activeCategoryFilter;
    const matchesSearch = searchQuery === '' ||
      row.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate grand totals across all rows
  const grandTotals = TECHNICAL_OBJECT_SMC_CATALOG.reduce((acc, row) => {
    const { simple, medium, complex, totalCount, totalHours } = getCountsForType(row);
    return {
      simpleCount: acc.simpleCount + simple,
      mediumCount: acc.mediumCount + medium,
      complexCount: acc.complexCount + complex,
      totalCount: acc.totalCount + totalCount,
      simpleHours: acc.simpleHours + (simple * row.simpleHours),
      mediumHours: acc.mediumHours + (medium * row.mediumHours),
      complexHours: acc.complexHours + (complex * row.complexHours),
      totalHours: acc.totalHours + totalHours
    };
  }, {
    simpleCount: 0,
    mediumCount: 0,
    complexCount: 0,
    totalCount: 0,
    simpleHours: 0,
    mediumHours: 0,
    complexHours: 0,
    totalHours: 0
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Summary Strip */}
      <div className="bg-slate-900 text-white p-5 rounded-none border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-none bg-blue-600 text-white">
              <Cpu size={16} />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
              Technical Scope Architecture (CEMLI / RICEFW)
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Technical Object S / M / C Breakup & Effort Matrix
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Enter <strong>Simple (S)</strong>, <strong>Medium (M)</strong>, and <strong>Complex (C)</strong> inventory counts per technical object type with explicit unit hour benchmarks and live mathematical effort aggregation.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold uppercase tracking-wider rounded-none border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Technical Objects
          </span>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {grandTotals.totalCount} <span className="text-xs font-normal text-slate-500">objects</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {grandTotals.simpleCount} S &bull; {grandTotals.mediumCount} M &bull; {grandTotals.complexCount} C
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Simple (S) Tier Effort
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-700">
            {(grandTotals.simpleHours || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {grandTotals.simpleCount} objects ({grandTotals.totalCount > 0 ? Math.round((grandTotals.simpleCount / grandTotals.totalCount) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Medium (M) Tier Effort
          </span>
          <div className="text-2xl font-mono font-bold text-blue-700">
            {(grandTotals.mediumHours || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {grandTotals.mediumCount} objects ({grandTotals.totalCount > 0 ? Math.round((grandTotals.mediumCount / grandTotals.totalCount) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
            Complex (C) Tier Effort
          </span>
          <div className="text-2xl font-mono font-bold text-purple-700">
            {(grandTotals.complexHours || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {grandTotals.complexCount} objects ({grandTotals.totalCount > 0 ? Math.round((grandTotals.complexCount / grandTotals.totalCount) * 100) : 0}%)
          </div>
        </div>
      </div>

      {/* Search & Category Filter Strip */}
      <div className="bg-white p-4 border border-slate-200 rounded-none shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-none whitespace-nowrap transition cursor-pointer border ${
                  activeCategoryFilter === cat.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technical objects..."
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 rounded-none focus:bg-white focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* Detailed S/M/C Table */}
        <div className="overflow-x-auto border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-900 text-white uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Technical Category & Type</th>
                <th className="py-3 px-3 text-center bg-emerald-950/60 border-l border-r border-slate-800 text-emerald-300">
                  Simple (S) Count
                </th>
                <th className="py-3 px-3 text-center bg-blue-950/60 border-r border-slate-800 text-blue-300">
                  Medium (M) Count
                </th>
                <th className="py-3 px-3 text-center bg-purple-950/60 border-r border-slate-800 text-purple-300">
                  Complex (C) Count
                </th>
                <th className="py-3 px-3 text-right">Total Count</th>
                <th className="py-3 px-3 text-right">Unit Benchmarks</th>
                <th className="py-3 px-3 text-right">Total Base Effort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredRows.map((row) => {
                const { simple, medium, complex, totalCount, totalHours } = getCountsForType(row);
                return (
                  <tr key={row.typeId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{row.typeName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200">
                          {row.categoryLabel}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-sm">
                          {row.description}
                        </span>
                      </div>
                    </td>

                    {/* Simple Counter */}
                    <td className="py-2.5 px-3 bg-emerald-50/30 border-l border-r border-slate-200 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(row.typeId, 'simple', simple - 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={simple}
                          onChange={(e) => handleUpdateCount(row.typeId, 'simple', parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-white border border-slate-300 font-mono font-bold text-xs py-0.5 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(row.typeId, 'simple', simple + 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-700 font-medium block mt-0.5">
                        @{row.simpleHours}h = {simple * row.simpleHours}h
                      </span>
                    </td>

                    {/* Medium Counter */}
                    <td className="py-2.5 px-3 bg-blue-50/30 border-r border-slate-200 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(row.typeId, 'medium', medium - 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={medium}
                          onChange={(e) => handleUpdateCount(row.typeId, 'medium', parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-white border border-slate-300 font-mono font-bold text-xs py-0.5 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(row.typeId, 'medium', medium + 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[9px] font-mono text-blue-700 font-medium block mt-0.5">
                        @{row.mediumHours}h = {medium * row.mediumHours}h
                      </span>
                    </td>

                    {/* Complex Counter */}
                    <td className="py-2.5 px-3 bg-purple-50/30 border-r border-slate-200 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(row.typeId, 'complex', complex - 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={complex}
                          onChange={(e) => handleUpdateCount(row.typeId, 'complex', parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-white border border-slate-300 font-mono font-bold text-xs py-0.5 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCount(row.typeId, 'complex', complex + 1)}
                          className="w-5 h-5 bg-white border border-slate-300 hover:bg-slate-100 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[9px] font-mono text-purple-700 font-medium block mt-0.5">
                        @{row.complexHours}h = {complex * row.complexHours}h
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {totalCount}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[10px] text-slate-500">
                      {row.simpleHours}h / {row.mediumHours}h / {row.complexHours}h
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                      {(totalHours || 0).toLocaleString()} hrs
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                <td className="py-3 px-3 uppercase text-[10px] tracking-wider">
                  Grand Total (Filtered Items)
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-800 border-l border-r border-slate-200">
                  {grandTotals.simpleCount} ({(grandTotals.simpleHours || 0).toLocaleString()}h)
                </td>
                <td className="py-3 px-3 text-center font-mono text-blue-800 border-r border-slate-200">
                  {grandTotals.mediumCount} ({(grandTotals.mediumHours || 0).toLocaleString()}h)
                </td>
                <td className="py-3 px-3 text-center font-mono text-purple-800 border-r border-slate-200">
                  {grandTotals.complexCount} ({(grandTotals.complexHours || 0).toLocaleString()}h)
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {grandTotals.totalCount}
                </td>
                <td className="py-3 px-3 text-right text-[10px] text-slate-500">
                  &mdash;
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-800 text-sm">
                  {(grandTotals.totalHours || 0).toLocaleString()} hrs
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
