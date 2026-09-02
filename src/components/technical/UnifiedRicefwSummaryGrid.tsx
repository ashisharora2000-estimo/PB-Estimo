import React, { useState, useMemo } from 'react';
import {
  TableProperties,
  Layers,
  Cpu,
  Database,
  FileCode2,
  Workflow,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calculator
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, TechnicalObjectSmcRow } from '../../types';
import { TECHNICAL_OBJECT_SMC_CATALOG } from '../../data/technicalScopingData';

interface UnifiedRicefwSummaryGridProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  data: CalculatedProjectData;
  onIngestClick?: () => void;
}

export const UnifiedRicefwSummaryGrid: React.FC<UnifiedRicefwSummaryGridProps> = ({
  scenario,
  onUpdateScenario,
  data,
  onIngestClick
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Categories definition
  const categories = [
    { id: 'all', label: 'All RICEFW Objects' },
    { id: 'integrations', label: 'Integrations (OIC)' },
    { id: 'reports_bip', label: 'Reports (BIP)' },
    { id: 'reports_otbi', label: 'Reports (OTBI)' },
    { id: 'conversions', label: 'Conversions (FBDI/HDL)' },
    { id: 'paas', label: 'Extensions (PaaS/VBCS)' },
    { id: 'workflows', label: 'Workflows (BPM)' },
    { id: 'security_roles', label: 'Security & Roles' },
    { id: 'fast_formulas', label: 'Fast Formulas' }
  ];

  // Helper to fetch current counts and hours for a row
  const getRowStats = (row: TechnicalObjectSmcRow) => {
    const override = scenario.technicalSmcOverrides?.[row.typeId];
    const simple = override?.simple !== undefined ? override.simple : row.simpleCount;
    const medium = override?.medium !== undefined ? override.medium : row.mediumCount;
    const complex = override?.complex !== undefined ? override.complex : row.complexCount;
    const totalCount = simple + medium + complex;
    const totalHours = (simple * row.simpleHours) + (medium * row.mediumHours) + (complex * row.complexHours);
    return { simple, medium, complex, totalCount, totalHours };
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return TECHNICAL_OBJECT_SMC_CATALOG.filter(row => {
      const matchCat = activeCategory === 'all' || row.category === activeCategory;
      const matchSearch = searchQuery === '' || 
        row.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Overall totals across all catalog rows
  const overallStats = useMemo(() => {
    let totalItems = 0;
    let totalHours = 0;
    let simpleItems = 0;
    let mediumItems = 0;
    let complexItems = 0;

    // By RICEFW category
    const catHours: Record<string, number> = {};
    const catCounts: Record<string, number> = {};

    TECHNICAL_OBJECT_SMC_CATALOG.forEach(row => {
      const stats = getRowStats(row);
      totalItems += stats.totalCount;
      totalHours += stats.totalHours;
      simpleItems += stats.simple;
      mediumItems += stats.medium;
      complexItems += stats.complex;

      catHours[row.category] = (catHours[row.category] || 0) + stats.totalHours;
      catCounts[row.category] = (catCounts[row.category] || 0) + stats.totalCount;
    });

    return { totalItems, totalHours, simpleItems, mediumItems, complexItems, catHours, catCounts };
  }, [scenario.technicalSmcOverrides]);

  // Update handler for cell changes
  const handleUpdateCount = (typeId: string, complexity: 'simple' | 'medium' | 'complex', value: number) => {
    const clamped = Math.max(0, value);
    onUpdateScenario(prev => {
      const currentOverrides = prev.technicalSmcOverrides || {};
      const currentTypeOverride = currentOverrides[typeId] || {};
      const defaultRow = TECHNICAL_OBJECT_SMC_CATALOG.find(r => r.typeId === typeId);
      
      const newOverride = {
        simple: currentTypeOverride.simple !== undefined ? currentTypeOverride.simple : (defaultRow?.simpleCount || 0),
        medium: currentTypeOverride.medium !== undefined ? currentTypeOverride.medium : (defaultRow?.mediumCount || 0),
        complex: currentTypeOverride.complex !== undefined ? currentTypeOverride.complex : (defaultRow?.complexCount || 0),
        [complexity]: clamped
      };

      const updatedOverrides = {
        ...currentOverrides,
        [typeId]: newOverride
      };

      // Recalculate synced scaleDrivers counts
      const getSumForCategory = (cat: string) => {
        const rows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === cat);
        return rows.reduce((sum, r) => {
          const ov = updatedOverrides[r.typeId];
          const s = ov?.simple !== undefined ? ov.simple : r.simpleCount;
          const m = ov?.medium !== undefined ? ov.medium : r.mediumCount;
          const c = ov?.complex !== undefined ? ov.complex : r.complexCount;
          return sum + s + m + c;
        }, 0);
      };

      return {
        ...prev,
        technicalSmcOverrides: updatedOverrides,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: getSumForCategory('integrations'),
          tech_paas: getSumForCategory('paas'),
          tech_reports_bip: getSumForCategory('reports_bip'),
          tech_reports_otbi: getSumForCategory('reports_otbi'),
          tech_fast_formulas: getSumForCategory('fast_formulas'),
          tech_workflows: getSumForCategory('workflows'),
          tech_security_roles: getSumForCategory('security_roles'),
          tech_data_objects: getSumForCategory('conversions')
        }
      };
    });
  };

  // Quick preset loader
  const handleApplyPreset = (preset: 'lean' | 'standard' | 'enterprise') => {
    const multipliers = {
      lean: 0.6,
      standard: 1.0,
      enterprise: 1.5
    };
    const mult = multipliers[preset];

    onUpdateScenario(prev => {
      const updatedOverrides: Record<string, { simple: number; medium: number; complex: number }> = {};
      
      TECHNICAL_OBJECT_SMC_CATALOG.forEach(r => {
        updatedOverrides[r.typeId] = {
          simple: Math.round(r.simpleCount * mult),
          medium: Math.round(r.mediumCount * mult),
          complex: Math.round(r.complexCount * mult)
        };
      });

      const getSumForCategory = (cat: string) => {
        const rows = TECHNICAL_OBJECT_SMC_CATALOG.filter(r => r.category === cat);
        return rows.reduce((sum, r) => {
          const ov = updatedOverrides[r.typeId];
          return sum + ov.simple + ov.medium + ov.complex;
        }, 0);
      };

      return {
        ...prev,
        technicalSmcOverrides: updatedOverrides,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: getSumForCategory('integrations'),
          tech_paas: getSumForCategory('paas'),
          tech_reports_bip: getSumForCategory('reports_bip'),
          tech_reports_otbi: getSumForCategory('reports_otbi'),
          tech_fast_formulas: getSumForCategory('fast_formulas'),
          tech_workflows: getSumForCategory('workflows'),
          tech_security_roles: getSumForCategory('security_roles'),
          tech_data_objects: getSumForCategory('conversions')
        }
      };
    });
  };

  const handleResetDefaults = () => {
    onUpdateScenario(prev => ({
      ...prev,
      technicalSmcOverrides: {},
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_oic: 18,
        tech_paas: 5,
        tech_reports_bip: 20,
        tech_reports_otbi: 31,
        tech_fast_formulas: 18,
        tech_workflows: 15,
        tech_security_roles: 20,
        tech_data_objects: 14
      }
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Consolidated Executive Summary Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-sm border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-sm bg-indigo-600 text-white font-mono font-bold text-xs">
              RICEFW
            </span>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Unified Technical Scoping Grid
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Single-table management for all Reports, Interfaces, Conversions, Extensions, Fast Formulas, and Security Roles with standard Simple, Medium, and Complex sizing.
          </p>
        </div>

        {/* Global RICEFW Metrics & Action Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-2.5 rounded-sm border border-slate-700/60">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Objects</div>
              <div className="text-lg font-black text-white font-mono">{overallStats.totalItems}</div>
            </div>
            <div className="text-center px-2 border-x border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Hours</div>
              <div className="text-lg font-black text-indigo-400 font-mono">{overallStats.totalHours.toLocaleString()}h</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Person-Days</div>
              <div className="text-lg font-black text-emerald-400 font-mono">{Math.round(overallStats.totalHours / 8)}d</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {onIngestClick && (
              <button
                type="button"
                onClick={onIngestClick}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Sparkles size={13} />
                <span>AI Ingest Spec Sheet</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-sm flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Standards</span>
            </button>
          </div>
        </div>
      </div>

      {/* RICEFW Category Pill Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { key: 'integrations', label: 'Interfaces', icon: Cpu, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { key: 'reports_bip', label: 'BIP Reports', icon: FileCode2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { key: 'reports_otbi', label: 'OTBI Dashboards', icon: TableProperties, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
          { key: 'conversions', label: 'Conversions', icon: Database, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { key: 'paas', label: 'PaaS / VBCS', icon: Layers, color: 'text-purple-600 bg-purple-50 border-purple-200' },
          { key: 'workflows', label: 'BPM Workflows', icon: Workflow, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { key: 'security_roles', label: 'Security & SOD', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' },
          { key: 'fast_formulas', label: 'Fast Formulas', icon: Zap, color: 'text-violet-600 bg-violet-50 border-violet-200' }
        ].map(cat => {
          const count = overallStats.catCounts[cat.key] || 0;
          const hours = overallStats.catHours[cat.key] || 0;
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat.key ? 'all' : cat.key)}
              className={`p-2 rounded-sm border text-left transition cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 truncate">{cat.label}</span>
                <Icon size={12} className={isSelected ? 'text-indigo-300' : 'text-slate-500'} />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-mono font-black text-sm">{count}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{hours}h</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Control Toolbar: Quick Presets, Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sliders size={12} />
            Presets:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('lean')}
            className="px-2.5 py-1 text-xs font-semibold rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Calibrate counts to 60% lean footprint"
          >
            Lean (60%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('standard')}
            className="px-2.5 py-1 text-xs font-semibold rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
            title="Standard enterprise Oracle baseline"
          >
            Standard (100%)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('enterprise')}
            className="px-2.5 py-1 text-xs font-semibold rounded-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
            title="Complex multi-pillar footprint (150%)"
          >
            Enterprise (150%)
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RICEFW objects..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs focus:outline-hidden focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Single RICEFW Table */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5 w-1/4">Technical Object & Scope Definition</th>
                <th className="py-3 px-3 text-center w-28 bg-slate-800">
                  <div className="text-emerald-300">Simple</div>
                  <div className="text-[9px] text-slate-400 font-normal">Count / Hrs each</div>
                </th>
                <th className="py-3 px-3 text-center w-28 bg-slate-800 border-x border-slate-700">
                  <div className="text-amber-300">Medium</div>
                  <div className="text-[9px] text-slate-400 font-normal">Count / Hrs each</div>
                </th>
                <th className="py-3 px-3 text-center w-28 bg-slate-800">
                  <div className="text-rose-300">Complex</div>
                  <div className="text-[9px] text-slate-400 font-normal">Count / Hrs each</div>
                </th>
                <th className="py-3 px-3.5 text-center w-24">Total Items</th>
                <th className="py-3 px-3.5 text-right w-28">Total Hours</th>
                <th className="py-3 px-3.5 text-right w-28 bg-slate-800">Person-Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.map((row, idx) => {
                const stats = getRowStats(row);
                const isOverridden = !!scenario.technicalSmcOverrides?.[row.typeId];

                return (
                  <tr key={row.typeId} className={`hover:bg-slate-50/80 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    {/* Object Name & Details */}
                    <td className="py-3 px-3.5 align-top">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{row.typeName}</span>
                        {isOverridden && (
                          <span className="px-1 py-0.2 rounded-2xs text-[9px] font-mono bg-indigo-100 text-indigo-800 border border-indigo-200 font-normal">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {row.description}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                        {row.categoryLabel}
                      </div>
                    </td>

                    {/* Simple Column (Editable Count) */}
                    <td className="py-2.5 px-3 text-center align-middle bg-slate-50/50">
                      <div className="inline-flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={stats.simple}
                          onChange={(e) => handleUpdateCount(row.typeId, 'simple', parseInt(e.target.value) || 0)}
                          className="w-12 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-sm focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        @{row.simpleHours}h = <span className="font-semibold text-slate-700">{stats.simple * row.simpleHours}h</span>
                      </div>
                    </td>

                    {/* Medium Column (Editable Count) */}
                    <td className="py-2.5 px-3 text-center align-middle bg-slate-50/50 border-x border-slate-200">
                      <div className="inline-flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={stats.medium}
                          onChange={(e) => handleUpdateCount(row.typeId, 'medium', parseInt(e.target.value) || 0)}
                          className="w-12 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-sm focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        @{row.mediumHours}h = <span className="font-semibold text-slate-700">{stats.medium * row.mediumHours}h</span>
                      </div>
                    </td>

                    {/* Complex Column (Editable Count) */}
                    <td className="py-2.5 px-3 text-center align-middle bg-slate-50/50">
                      <div className="inline-flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={stats.complex}
                          onChange={(e) => handleUpdateCount(row.typeId, 'complex', parseInt(e.target.value) || 0)}
                          className="w-12 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-sm focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        @{row.complexHours}h = <span className="font-semibold text-slate-700">{stats.complex * row.complexHours}h</span>
                      </div>
                    </td>

                    {/* Total Objects */}
                    <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800 text-xs">
                      {stats.totalCount}
                    </td>

                    {/* Total Hours */}
                    <td className="py-3 px-3.5 text-right font-mono font-black text-indigo-600 text-xs">
                      {stats.totalHours.toLocaleString()}h
                    </td>

                    {/* Person-Days */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 bg-slate-50/80 text-xs">
                      {Math.round(stats.totalHours / 8)}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs">
                <td className="py-3 px-3.5 uppercase tracking-wider">
                  Total Technical Footprint ({filteredRows.length} Object Types)
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-400">
                  {filteredRows.reduce((sum, r) => sum + getRowStats(r).simple, 0)} Simple
                </td>
                <td className="py-3 px-3 text-center font-mono text-amber-400 border-x border-slate-800">
                  {filteredRows.reduce((sum, r) => sum + getRowStats(r).medium, 0)} Medium
                </td>
                <td className="py-3 px-3 text-center font-mono text-rose-400">
                  {filteredRows.reduce((sum, r) => sum + getRowStats(r).complex, 0)} Complex
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-white">
                  {filteredRows.reduce((sum, r) => sum + getRowStats(r).totalCount, 0)}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-indigo-300">
                  {filteredRows.reduce((sum, r) => sum + getRowStats(r).totalHours, 0).toLocaleString()}h
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-emerald-300 bg-slate-800">
                  {Math.round(filteredRows.reduce((sum, r) => sum + getRowStats(r).totalHours, 0) / 8)}d
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
