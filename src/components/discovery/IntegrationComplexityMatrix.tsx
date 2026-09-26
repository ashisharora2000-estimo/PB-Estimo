import React, { useState, useMemo } from 'react';
import {
  ProjectScenario,
  IntegrationMatrixItem,
  IntegrationComplexityLevel,
  OracleModule
} from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import {
  INTEGRATION_COMPLEXITY_CONFIG,
  DEFAULT_INTEGRATION_MATRIX_ITEMS,
  calculateMatrixMetrics
} from '../../data/integrationMatrixData';
import {
  Network,
  Plus,
  Trash2,
  Filter,
  Search,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Layers,
  Calculator,
  Download,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';

interface IntegrationComplexityMatrixProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onNavigateToEstimation?: () => void;
}

export const IntegrationComplexityMatrix: React.FC<IntegrationComplexityMatrixProps> = ({
  scenario,
  onUpdateScenario,
  onNavigateToEstimation
}) => {
  // Use existing scenario integrationMatrixItems or initialize with defaults
  const items: IntegrationMatrixItem[] = useMemo(() => {
    if (scenario.integrationMatrixItems && scenario.integrationMatrixItems.length > 0) {
      return scenario.integrationMatrixItems;
    }
    // If not set, use default seed items
    return DEFAULT_INTEGRATION_MATRIX_ITEMS;
  }, [scenario.integrationMatrixItems]);

  // Combined module options (standard catalog + custom modules)
  const allModules = useMemo(() => {
    return [...ORACLE_MODULE_CATALOG, ...(scenario.customModules || [])];
  }, [scenario.customModules]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<'ALL' | IntegrationComplexityLevel>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  // New Integration Form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newComplexity, setNewComplexity] = useState<IntegrationComplexityLevel>('Medium');
  const [newModuleId, setNewModuleId] = useState<OracleModule>('erp_gl');
  const [newConnectedSystem, setNewConnectedSystem] = useState('');
  const [newDirection, setNewDirection] = useState<'Inbound' | 'Outbound' | 'Bidirectional'>('Bidirectional');
  const [newNotes, setNewNotes] = useState('');

  // Live Metrics
  const metrics = useMemo(() => calculateMatrixMetrics(items), [items]);

  // Sync helper that updates both matrix items and scale drivers in scenario
  const syncMatrixToScenario = (updatedItems: IntegrationMatrixItem[]) => {
    const updatedMetrics = calculateMatrixMetrics(updatedItems);
    onUpdateScenario(prev => ({
      ...prev,
      integrationMatrixItems: updatedItems,
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_external_integrations_count: updatedMetrics.totalCount,
        tech_external_integrations_complexity: updatedMetrics.dominantComplexity,
        tech_external_integrations_multiplier: updatedMetrics.blendedMultiplier,
        tech_oic: updatedMetrics.totalCount
      }
    }));
  };

  // Add Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const modDef = allModules.find(m => m.id === newModuleId);
    const newItem: IntegrationMatrixItem = {
      id: `mat_int_${Date.now()}`,
      name: newName.trim(),
      complexity: newComplexity,
      oracleModuleId: newModuleId,
      oracleModuleName: modDef?.name || newModuleId,
      direction: newDirection,
      connectedSystem: newConnectedSystem.trim() || 'External Third-Party Platform',
      estimatedHours: INTEGRATION_COMPLEXITY_CONFIG[newComplexity].baseHours,
      notes: newNotes.trim()
    };

    const nextItems = [newItem, ...items];
    syncMatrixToScenario(nextItems);

    // Reset Form
    setNewName('');
    setNewConnectedSystem('');
    setNewNotes('');
    setIsAddingNew(false);
  };

  // Update Item Property
  const handleUpdateItem = (id: string, updates: Partial<IntegrationMatrixItem>) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        const next = { ...item, ...updates };
        if (updates.complexity) {
          next.estimatedHours = INTEGRATION_COMPLEXITY_CONFIG[updates.complexity].baseHours;
        }
        if (updates.oracleModuleId) {
          const modDef = allModules.find(m => m.id === updates.oracleModuleId);
          next.oracleModuleName = modDef?.name || updates.oracleModuleId;
        }
        return next;
      }
      return item;
    });
    syncMatrixToScenario(nextItems);
  };

  // Delete Item Handler
  const handleDeleteItem = (id: string) => {
    const nextItems = items.filter(i => i.id !== id);
    syncMatrixToScenario(nextItems);
  };

  // Reset to Default Matrix
  const handleResetToDefaults = () => {
    syncMatrixToScenario(DEFAULT_INTEGRATION_MATRIX_ITEMS);
  };

  // Export Matrix to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Integration Name', 'Complexity', 'Multiplier', 'Estimated Hours', 'Oracle Module ID', 'Oracle Module Name', 'Direction', 'Connected System', 'Notes'];
    const rows = items.map(item => {
      const cfg = INTEGRATION_COMPLEXITY_CONFIG[item.complexity];
      return [
        `"${item.id}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.complexity}"`,
        `"${cfg.multiplier.toFixed(2)}x"`,
        `"${item.estimatedHours || cfg.baseHours}"`,
        `"${item.oracleModuleId}"`,
        `"${(item.oracleModuleName || '').replace(/"/g, '""')}"`,
        `"${item.direction || 'Bidirectional'}"`,
        `"${(item.connectedSystem || '').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Integration_Complexity_Matrix_${scenario.thorId || 'Proposal'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (complexityFilter !== 'ALL' && item.complexity !== complexityFilter) return false;
      if (moduleFilter !== 'ALL' && item.oracleModuleId !== moduleFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSystem = (item.connectedSystem || '').toLowerCase().includes(query);
        const matchesMod = (item.oracleModuleName || '').toLowerCase().includes(query);
        if (!matchesName && !matchesSystem && !matchesMod) return false;
      }
      return true;
    });
  }, [items, complexityFilter, moduleFilter, searchQuery]);

  // Pillar mapping helper
  const getModulePillar = (modId: string): string => {
    const found = allModules.find(m => m.id === modId);
    return found?.pillar || 'ERP';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HUD Header Banner */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-sm p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Network size={16} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Discovery & Architecture Sub-Section 3
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Feed to Estimation Engine
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Integration Complexity Matrix
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Itemize each external boundary interface, classify its technical complexity (Simple, Medium, Complex), and bind it to its corresponding Oracle Cloud functional module. 
              This granular catalog dynamically drives the <strong>Estimation Engine Scaling Multiplier ({metrics.blendedMultiplier.toFixed(2)}x)</strong> and technical workstream hours in real time.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700 min-w-[110px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Integrations
              </span>
              <div className="text-2xl font-mono font-bold text-white mt-0.5">
                {metrics.totalCount}
              </div>
              <span className="text-[10px] text-slate-400">Connected Flows</span>
            </div>

            <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700 min-w-[125px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Blended Multiplier
              </span>
              <div className="text-2xl font-mono font-bold text-amber-300 mt-0.5">
                {metrics.blendedMultiplier.toFixed(2)}x
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {metrics.dominantComplexity} Dominant
              </span>
            </div>

            <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700 min-w-[120px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Tech Hours
              </span>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
                {metrics.totalEstimatedHours.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Design & Build</span>
            </div>
          </div>
        </div>

        {/* Dynamic Proportion Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Complexity Distribution</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Simple: {metrics.simpleCount} ({metrics.totalCount > 0 ? Math.round((metrics.simpleCount / metrics.totalCount) * 100) : 0}%)
                </span>
                <span className="text-blue-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Medium: {metrics.mediumCount} ({metrics.totalCount > 0 ? Math.round((metrics.mediumCount / metrics.totalCount) * 100) : 0}%)
                </span>
                <span className="text-purple-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  Complex: {metrics.complexCount} ({metrics.totalCount > 0 ? Math.round((metrics.complexCount / metrics.totalCount) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              {metrics.totalCount > 0 ? (
                <>
                  <div
                    style={{ width: `${(metrics.simpleCount / metrics.totalCount) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all duration-300"
                    title={`Simple: ${metrics.simpleCount}`}
                  />
                  <div
                    style={{ width: `${(metrics.mediumCount / metrics.totalCount) * 100}%` }}
                    className="bg-blue-500 h-full transition-all duration-300"
                    title={`Medium: ${metrics.mediumCount}`}
                  />
                  <div
                    style={{ width: `${(metrics.complexCount / metrics.totalCount) * 100}%` }}
                    className="bg-purple-500 h-full transition-all duration-300"
                    title={`Complex: ${metrics.complexCount}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-700 h-full" />
              )}
            </div>
          </div>

          {onNavigateToEstimation && (
            <button
              type="button"
              onClick={onNavigateToEstimation}
              className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Calculator size={13} />
              <span>Verify in Estimation Engine</span>
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Feedback Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-3.5 flex items-start gap-3 text-xs text-blue-900">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-blue-950">
            Estimation Engine Continuous Synchronization:
          </p>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            The external integration count (<strong>{metrics.totalCount} flows</strong>), dominant tier (<strong>{metrics.dominantComplexity.toUpperCase()}</strong>), and effective blended multiplier (<strong>{metrics.blendedMultiplier.toFixed(2)}x</strong>) are wired into <code className="bg-blue-100 px-1 py-0.5 font-mono text-blue-900 font-bold">scaleDrivers.tech_external_integrations_multiplier</code> and <code className="bg-blue-100 px-1 py-0.5 font-mono text-blue-900 font-bold">tech_external_integrations_count</code>.
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integration or system..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Complexity Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 px-1.5 flex items-center gap-1">
              <Filter size={11} />
              Tier:
            </span>
            {(['ALL', 'Simple', 'Medium', 'Complex'] as const).map(tier => (
              <button
                key={tier}
                type="button"
                onClick={() => setComplexityFilter(tier)}
                className={`px-2 py-0.5 text-xs font-bold rounded-none transition cursor-pointer ${
                  complexityFilter === tier
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-none px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium cursor-pointer"
          >
            <option value="ALL">All Oracle Modules ({allModules.length})</option>
            {allModules.map(m => (
              <option key={m.id} value={m.id}>
                [{m.pillar}] {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingNew(prev => !prev)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Plus size={13} />
            <span>{isAddingNew ? 'Close Form' : 'Add Integration'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            title="Download matrix as CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            title="Reset to 12 standard enterprise integrations"
          >
            <RotateCcw size={13} />
            <span>Seed Standard</span>
          </button>
        </div>
      </div>

      {/* Add New Integration Drawer/Form */}
      {isAddingNew && (
        <form onSubmit={handleAddItem} className="bg-slate-50 border-2 border-emerald-500 rounded-sm p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              <span>Register New External Integration</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Assigned complexity immediately recalibrates Estimation Engine multiplier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Name */}
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Integration Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Workday HR to Oracle General Ledger Payroll Postings"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Complexity Tier */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Complexity Tier *</label>
              <select
                value={newComplexity}
                onChange={(e) => setNewComplexity(e.target.value as IntegrationComplexityLevel)}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="Simple">Simple (0.85x / ~45 hrs)</option>
                <option value="Medium">Medium (1.20x / ~85 hrs)</option>
                <option value="Complex">Complex (1.75x / ~160 hrs)</option>
              </select>
            </div>

            {/* Oracle Module Assignment */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Assigned Oracle Module *</label>
              <select
                value={newModuleId}
                onChange={(e) => setNewModuleId(e.target.value)}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {allModules.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.pillar}] {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Connected External System */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Connected System / Platform</label>
              <input
                type="text"
                value={newConnectedSystem}
                onChange={(e) => setNewConnectedSystem(e.target.value)}
                placeholder="e.g. Salesforce CRM, SAP, Coupa, ADP"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Direction */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Flow Direction</label>
              <select
                value={newDirection}
                onChange={(e) => setNewDirection(e.target.value as any)}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="Bidirectional">Bidirectional (Two-Way Sync)</option>
                <option value="Inbound">Inbound (External to Oracle)</option>
                <option value="Outbound">Outbound (Oracle to External)</option>
              </select>
            </div>

            {/* Technical Notes / Description */}
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Scope Details & Payload Description</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Real-time REST webhook, error hospital retry, high-volume batch FBDI"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Save & Register to Matrix</span>
            </button>
          </div>
        </form>
      )}

      {/* Visual Table Matrix */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                <th className="p-3 w-12 text-center border-r border-slate-200">#</th>
                <th className="p-3 min-w-[240px] border-r border-slate-200">Integration Name</th>
                <th className="p-3 w-40 border-r border-slate-200">Connected System</th>
                <th className="p-3 w-32 border-r border-slate-200 text-center">Direction</th>
                <th className="p-3 min-w-[200px] border-r border-slate-200">Assigned Oracle Module</th>
                <th className="p-3 w-44 border-r border-slate-200 text-center">Complexity Tier</th>
                <th className="p-3 w-28 text-right border-r border-slate-200">Est. Hours</th>
                <th className="p-3 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Layers size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No integrations match current filter.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or click &quot;Seed Standard&quot; to restore defaults.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const cfg = INTEGRATION_COMPLEXITY_CONFIG[item.complexity];
                  const pillar = getModulePillar(item.oracleModuleId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Index */}
                      <td className="p-3 text-center font-mono font-bold text-slate-400 border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* Name & Notes */}
                      <td className="p-3 border-r border-slate-100">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            className="w-full font-bold text-slate-900 text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none"
                          />
                          {item.notes && (
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 hover:line-clamp-none">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Connected System */}
                      <td className="p-3 border-r border-slate-100">
                        <input
                          type="text"
                          value={item.connectedSystem || ''}
                          onChange={(e) => handleUpdateItem(item.id, { connectedSystem: e.target.value })}
                          placeholder="e.g. Salesforce CRM"
                          className="w-full text-xs font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none"
                        />
                      </td>

                      {/* Direction */}
                      <td className="p-3 border-r border-slate-100 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.direction === 'Inbound' ? (
                            <ArrowDownLeft size={11} className="text-emerald-600" />
                          ) : item.direction === 'Outbound' ? (
                            <ArrowUpRight size={11} className="text-blue-600" />
                          ) : (
                            <ArrowRightLeft size={11} className="text-purple-600" />
                          )}
                          <span>{item.direction || 'Bidirectional'}</span>
                        </div>
                      </td>

                      {/* Assigned Oracle Module Dropdown */}
                      <td className="p-3 border-r border-slate-100">
                        <div className="space-y-1">
                          <select
                            value={item.oracleModuleId}
                            onChange={(e) => handleUpdateItem(item.id, { oracleModuleId: e.target.value })}
                            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-none px-2 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                          >
                            {allModules.map(m => (
                              <option key={m.id} value={m.id}>
                                [{m.pillar}] {m.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase ${
                              pillar === 'ERP' ? 'bg-blue-100 text-blue-800' :
                              pillar === 'SCM' ? 'bg-amber-100 text-amber-800' :
                              pillar === 'HCM' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {pillar}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {item.oracleModuleId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Complexity Categorization Dropdown */}
                      <td className="p-3 border-r border-slate-100 text-center">
                        <select
                          value={item.complexity}
                          onChange={(e) => handleUpdateItem(item.id, { complexity: e.target.value as IntegrationComplexityLevel })}
                          className={`w-full text-xs font-mono font-bold px-2 py-1 rounded-none border cursor-pointer ${cfg.badgeClass}`}
                        >
                          <option value="Simple">Simple (0.85x)</option>
                          <option value="Medium">Medium (1.20x)</option>
                          <option value="Complex">Complex (1.75x)</option>
                        </select>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {cfg.multiplier.toFixed(2)}x factor
                        </span>
                      </td>

                      {/* Estimated Hours */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                        <span className="text-sm">{(item.estimatedHours || cfg.baseHours)}</span>
                        <span className="text-[10px] font-normal text-slate-500 ml-1">hrs</span>
                      </td>

                      {/* Delete Action */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded-none text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove integration from matrix"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-slate-900 text-white text-xs font-mono font-bold">
                <td colSpan={3} className="p-3 text-left">
                  Total Matrix Footprint: {filteredItems.length} of {items.length} Integrations Active
                </td>
                <td colSpan={2} className="p-3 text-center text-amber-300">
                  Blended Multiplier: {metrics.blendedMultiplier.toFixed(2)}x ({metrics.dominantComplexity.toUpperCase()} Tier)
                </td>
                <td className="p-3 text-center text-slate-300 text-[11px]">
                  {metrics.simpleCount}S / {metrics.mediumCount}M / {metrics.complexCount}C
                </td>
                <td className="p-3 text-right text-emerald-400 text-sm">
                  {metrics.totalEstimatedHours.toLocaleString()} hrs
                </td>
                <td className="p-3 text-center text-slate-400">
                  <CheckCircle2 size={14} className="mx-auto text-emerald-400" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Methodology & Calculation Guidance Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Calculator size={13} className="text-blue-600" />
          <span>Integration Complexity Multiplier Math & Methodology</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-white border border-slate-200 rounded-sm space-y-1">
            <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px] uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Simple Footprint (0.85x Multiplier)
            </span>
            <p className="text-[11px] text-slate-500">
              Low-frequency single-object feeds, pre-certified partner adapters (e.g. Vertex Tax, Concur), 1:1 direct schema mapping, and standard REST JSON payloads without transformation middleware.
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-sm space-y-1">
            <span className="font-bold text-blue-800 flex items-center gap-1 text-[11px] uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Medium Footprint (1.20x Multiplier)
            </span>
            <p className="text-[11px] text-slate-500">
              Standard cross-application orchestration (e.g. Salesforce CPQ, Workday HCM, Coupa), Domain Value Map (DVM) lookups, pagination, token auth, and OIC Error Hospital retry queues.
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-sm space-y-1">
            <span className="font-bold text-purple-800 flex items-center gap-1 text-[11px] uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Complex Footprint (1.75x Multiplier)
            </span>
            <p className="text-[11px] text-slate-500">
              Mission-critical banking host-to-host (ISO 20022/camt.053), factory floor MES, 3PL WMS serial-tracking, high-throughput batch FBDI zip generation, or legacy SFTP/mTLS bridging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
