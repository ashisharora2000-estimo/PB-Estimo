import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Play,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  Users,
  ShieldAlert,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { CalculatedProjectData, ModuleEffortEstimate, OracleModule, TShirtSize } from '../../types';
import { TShirtBadge, T_SHIRT_CONFIG } from './TShirtBadge';

interface ModuleTShirtMatrixProps {
  data: CalculatedProjectData;
  onOpenModuleInterview?: (moduleId: OracleModule) => void;
  onOpenTraceMath?: (target?: OracleModule | 'project_total') => void;
  showTitle?: boolean;
}

export const ModuleTShirtMatrix: React.FC<ModuleTShirtMatrixProps> = ({
  data,
  onOpenModuleInterview,
  onOpenTraceMath,
  showTitle = true
}) => {
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [tShirtFilter, setTShirtFilter] = useState<TShirtSize | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'p80' | 'tShirt' | 'score' | 'base' | 'fte'>('p80');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const moduleEstimates = data.moduleEstimates || [];
  const tShirtSummary = data.tShirtSizeSummary || {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  };

  const filteredEstimates = useMemo(() => {
    return moduleEstimates
      .filter((item) => {
        if (pillarFilter !== 'all' && item.pillar !== pillarFilter) return false;
        if (tShirtFilter !== 'all' && item.tShirtSize !== tShirtFilter) return false;
        if (
          searchQuery &&
          !item.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.keyComplexityDrivers.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'p80') diff = a.finalP80Hours - b.finalP80Hours;
        else if (sortField === 'tShirt') diff = a.tShirtScore - b.tShirtScore;
        else if (sortField === 'score') diff = a.questionnaireAvgScore - b.questionnaireAvgScore;
        else if (sortField === 'base') diff = a.baseHours - b.baseHours;
        else if (sortField === 'fte') diff = a.avgFTE - b.avgFTE;

        return sortDirection === 'desc' ? -diff : diff;
      });
  }, [moduleEstimates, pillarFilter, tShirtFilter, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: 'p80' | 'tShirt' | 'score' | 'base' | 'fte') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const totalFilteredP80Hours = filteredEstimates.reduce((sum, item) => sum + item.finalP80Hours, 0);
  const totalFilteredPM = filteredEstimates.reduce((sum, item) => sum + item.personMonths, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
      {/* Header & Description */}
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-sm bg-slate-900 text-white">
                <Sparkles size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Module-Level Scoping & Effort Architecture
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Module T-Shirt Sizing & Granular Effort Breakdown
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
              Each module's effort is derived directly from its <strong>20-Question Functional Depth Interview</strong>,
              attributed <strong>Enterprise Scale Drivers</strong>, and compounded by the <strong>Client Friction Multiplier ({data.netClientModifier.toFixed(2)}x)</strong> and <strong>Rollout Strategy ({data.rolloutMultiplier.toFixed(2)}x)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTraceMath ? (
              <button
                type="button"
                onClick={() => onOpenTraceMath('project_total')}
                className="text-right p-2 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition cursor-pointer group"
                title="Click to Trace Project Total Math"
              >
                <div className="flex items-center justify-end gap-1 mb-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 block">Scope Total (P80)</span>
                  <Calculator size={11} className="text-slate-400 group-hover:text-amber-600" />
                </div>
                <span className="text-base font-mono font-bold text-slate-900 group-hover:text-amber-700 block underline decoration-dotted decoration-slate-400 underline-offset-2">
                  {(totalFilteredP80Hours || 0).toLocaleString()} hrs
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  {totalFilteredPM.toFixed(1)} Person-Months
                </span>
              </button>
            ) : (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Scope Total (P80)</span>
                <span className="text-base font-mono font-bold text-slate-900">
                  {(totalFilteredP80Hours || 0).toLocaleString()} hrs
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  {totalFilteredPM.toFixed(1)} Person-Months
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* T-Shirt Size Distribution Summary Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            T-Shirt Size Portfolio Distribution:
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Click any T-shirt size pill to filter the portfolio
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as TShirtSize[]).map((size) => {
            const count = tShirtSummary[size] || 0;
            const isSelected = tShirtFilter === size;
            const cfg = T_SHIRT_CONFIG[size];
            const sizeModules = moduleEstimates.filter(m => m.tShirtSize === size);
            const sizeHours = sizeModules.reduce((s, m) => s + m.finalP80Hours, 0);

            return (
              <button
                key={size}
                type="button"
                onClick={() => setTShirtFilter(isSelected ? 'all' : size)}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${cfg.colorClass} shadow-xs ring-2 ring-slate-900 ring-offset-1`
                    : count > 0
                      ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                      : 'bg-slate-50/40 border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-sm">{size}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-none ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count} {count === 1 ? 'Mod' : 'Mods'}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] font-mono block ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                    {cfg.typicalHours}
                  </span>
                  <span className={`text-xs font-mono font-bold block mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {sizeHours > 0 ? `${(sizeHours || 0).toLocaleString()}h` : '-'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Filters, Search, View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-t border-slate-100">
        {/* Pillar Filter Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Pillars' },
            { id: 'ERP', label: 'ERP Financials' },
            { id: 'SCM', label: 'SCM Supply Chain' },
            { id: 'HCM', label: 'HCM Human Capital' },
            { id: 'EPM', label: 'EPM Planning' },
            { id: 'CX', label: 'CX & Service' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPillarFilter(tab.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                pillarFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search module or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-sm pl-7 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 w-48 sm:w-56"
            />
          </div>

          {tShirtFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setTShirtFilter('all')}
              className="text-xs text-blue-600 font-bold hover:underline px-1 cursor-pointer"
            >
              Reset Size
            </button>
          )}

          <div className="flex border border-slate-300 rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              title="Table View"
            >
              <TableIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-200 rounded-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider select-none">
                <th className="py-3 px-3">Module & Pillar</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('tShirt')}
                >
                  <div className="flex items-center gap-1">
                    <span>T-Shirt Size</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('score')}
                >
                  <div className="flex items-center gap-1">
                    <span>20-Q Depth</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('base')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>T-Shirt Base (h)</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Scale Drivers (h)</th>
                <th className="py-3 px-3 text-right">Multiplier</th>
                <th className="py-3 px-3 text-right">P50 Base (h)</th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('p80')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>P80 Target (h)</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Person-Mo</th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('fte')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg FTE</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3 px-3">Key Complexity Drivers</th>
                {onOpenModuleInterview && <th className="py-3 px-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 italic">
                    No modules match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((item) => (
                  <tr key={item.moduleId} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.moduleName}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {item.pillar} &bull; {item.moduleId}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col items-start gap-1">
                        <TShirtBadge size={item.tShirtSize} score={item.tShirtScore} showScore />
                        {item.isDownsized && item.calculatedTShirtSize && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-2xs bg-amber-500/15 text-amber-900 border border-amber-500/40 text-[9px] font-bold font-mono tracking-tight"
                            title={`Manually downsized from ${item.calculatedTShirtSize} to ${item.tShirtSize} (-${(item.downsizedDeltaHours || 0).toLocaleString()} base hrs)`}
                          >
                            <AlertTriangle size={8} className="text-amber-700 shrink-0 stroke-[2.5]" />
                            <span>Downsized from {item.calculatedTShirtSize}</span>
                            {item.downsizedDeltaHours ? <span>(-{item.downsizedDeltaHours}h)</span> : null}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-slate-900">
                            {item.questionnaireAvgScore.toFixed(2)}/4.0
                          </span>
                        </div>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.questionnaireAvgScore > 2.8
                                ? 'bg-amber-600'
                                : item.questionnaireAvgScore > 2.0
                                  ? 'bg-blue-600'
                                  : 'bg-slate-600'
                            }`}
                            style={{ width: `${(item.questionnaireAvgScore / 4.0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {(item.baseHours || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {item.scaleAttributedHours > 0 ? (
                        <span className="text-blue-700 font-bold">+{item.scaleAttributedHours}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {item.netComplexityMultiplier.toFixed(2)}x
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {(item.finalP50Hours || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {onOpenTraceMath ? (
                        <button
                          type="button"
                          onClick={() => onOpenTraceMath(item.moduleId)}
                          className="hover:text-amber-700 underline decoration-dotted decoration-slate-400 hover:decoration-amber-600 underline-offset-2 transition cursor-pointer inline-flex items-center gap-1 group font-bold"
                          title="Click to Trace Math for this module"
                        >
                          <span>{(item.finalP80Hours || 0).toLocaleString()}</span>
                          <Calculator size={11} className="text-slate-400 group-hover:text-amber-600" />
                        </button>
                      ) : (
                        <span>{(item.finalP80Hours || 0).toLocaleString()}</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {item.personMonths.toFixed(1)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                      {item.avgFTE.toFixed(1)}
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.keyComplexityDrivers.map((driver, idx) => (
                          <span
                            key={idx}
                            className="inline-block text-[9px] font-sans px-1.5 py-0.5 rounded-none bg-slate-100 border border-slate-200 text-slate-700 truncate max-w-[200px]"
                            title={driver}
                          >
                            {driver}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onOpenTraceMath && (
                          <button
                            type="button"
                            onClick={() => onOpenTraceMath(item.moduleId)}
                            className="p-1.5 rounded-sm bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-700 border border-slate-200 transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                            title="Trace Arithmetic Math & Modifiers"
                          >
                            <Calculator size={11} />
                            <span>Math</span>
                          </button>
                        )}
                        {onOpenModuleInterview && (
                          <button
                            type="button"
                            onClick={() => onOpenModuleInterview(item.moduleId)}
                            className="p-1.5 rounded-sm bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-300 transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                            title="Open 20-Question Scoping Interview"
                          >
                            <Play size={10} />
                            <span>20-Q</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CARD GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEstimates.map((item) => (
            <div
              key={item.moduleId}
              className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-3 hover:border-slate-400 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    {item.pillar} &bull; {item.moduleId}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {item.moduleName}
                  </h4>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <TShirtBadge size={item.tShirtSize} score={item.tShirtScore} showScore />
                  {item.isDownsized && item.calculatedTShirtSize && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-2xs bg-amber-500/15 text-amber-900 border border-amber-500/40 text-[8px] font-bold font-mono">
                      <AlertTriangle size={8} className="text-amber-700 shrink-0" />
                      <span>from {item.calculatedTShirtSize}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Effort Breakdown Stack */}
              <div className="p-3 bg-white border border-slate-200 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">P80 Defensible Effort:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {(item.finalP80Hours || 0).toLocaleString()} hrs
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block">Base:</span>
                    <span className="font-bold text-slate-700">{item.baseHours}h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">20-Q Addl:</span>
                    <span className="font-bold text-amber-700">+{item.scopingHours}h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Scale:</span>
                    <span className="font-bold text-blue-700">+{item.scaleAttributedHours}h</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500 border-t border-slate-100">
                  <span>Net Multiplier: <strong>{item.netComplexityMultiplier.toFixed(2)}x</strong></span>
                  <span><strong>{item.personMonths.toFixed(1)} PM</strong> &bull; <strong>{item.avgFTE.toFixed(1)} FTE</strong></span>
                </div>
              </div>

              {/* 20-Q Scoping Depth */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">20-Question Complexity Depth:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {item.questionnaireAvgScore.toFixed(2)} / 4.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.questionnaireAvgScore > 2.8
                        ? 'bg-amber-600'
                        : item.questionnaireAvgScore > 2.0
                          ? 'bg-blue-600'
                          : 'bg-slate-600'
                    }`}
                    style={{ width: `${(item.questionnaireAvgScore / 4.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Drivers */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Key Complexity Drivers:
                </span>
                <div className="space-y-1">
                  {item.keyComplexityDrivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] text-slate-600 bg-white p-1.5 rounded-none border border-slate-200 leading-tight"
                    >
                      &bull; {driver}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {onOpenTraceMath && (
                  <button
                    type="button"
                    onClick={() => onOpenTraceMath(item.moduleId)}
                    className="flex-1 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Trace Module Arithmetic & Modifiers"
                  >
                    <Calculator size={12} className="text-amber-600" />
                    <span>Trace Math</span>
                  </button>
                )}
                {onOpenModuleInterview && (
                  <button
                    type="button"
                    onClick={() => onOpenModuleInterview(item.moduleId)}
                    className="flex-1 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Play size={12} />
                    <span>20-Q Scope</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
