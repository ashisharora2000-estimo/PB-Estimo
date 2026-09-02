import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Plus,
  Trash2,
  Edit3,
  Calculator,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  TableProperties,
  Database,
  Grid
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  TechnicalIntegrationItem,
  TechnicalIntegrationType,
  TechnicalComplexityTier
} from '../../types';
import { DEFAULT_TECHNICAL_INTEGRATIONS, calculateIntegrationEffort } from '../../data/technicalScopingData';
import { IntegrationScopingCalculatorModal } from './IntegrationScopingCalculatorModal';
import { TechnicalSmcMatrix } from './TechnicalSmcMatrix';
import { ConversionMatrixManager } from './ConversionMatrixManager';
import { TechnicalTowerBenchmarks } from './TechnicalTowerBenchmarks';
import { UnifiedRicefwSummaryGrid } from './UnifiedRicefwSummaryGrid';
import { IntelUploadHubModal } from '../modals/IntelUploadHubModal';

interface TechnicalInventoryManagerProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  data: CalculatedProjectData;
}

export const TechnicalInventoryManager: React.FC<TechnicalInventoryManagerProps> = ({
  scenario,
  onUpdateScenario,
  data
}) => {
  const [activeTab, setActiveTab] = useState<'ricefw_unified' | 'integrations' | 'conversions' | 'benchmarks' | 'smc_matrix'>('ricefw_unified');
  const [editingIntegration, setEditingIntegration] = useState<TechnicalIntegrationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isIntelModalOpen, setIsIntelModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const integrations = scenario.technicalIntegrations || DEFAULT_TECHNICAL_INTEGRATIONS;

  const handleOpenCalculator = (item: TechnicalIntegrationItem) => {
    setEditingIntegration(item);
    setIsModalOpen(true);
  };

  const handleAddNewIntegration = () => {
    const nextIndex = integrations.length + 1;
    const newId = `int_custom_${Date.now()}`;
    const newItem: TechnicalIntegrationItem = {
      id: newId,
      code: `INT-CUST-${String(nextIndex).padStart(2, '0')}`,
      name: `Custom Integration Endpoint #${nextIndex}`,
      pillar: 'ERP',
      sourceSystem: 'External Enterprise System',
      targetSystem: 'Oracle Cloud ERP',
      type: 'inbound_rest',
      complexity: 'M',
      isQuestionDriven: true,
      questionAnswers: {
        patternDirection: 0,
        mappingComplexity: 1,
        connectivityProtocol: 0,
        dataVolume: 0,
        errorHandling: 1,
        apiReadiness: 0
      },
      baseHours: 45,
      calculatedHours: 78,
      calculationFormula: '45h × 1.00 (Type) × 1.00 (Flow) × 1.20 (Mapping) × 1.15 (Protocol) × 1.00 (Volume) × 1.20 (Error) × 0.90 (API) = 78h',
      compositeScore: 1.67,
      rationale: 'Standard/Medium footprint. Direct question-driven baseline calculation.'
    };

    setEditingIntegration(newItem);
    setIsModalOpen(true);
  };

  const handleSaveIntegration = (updated: TechnicalIntegrationItem) => {
    onUpdateScenario(prev => {
      const currentList = prev.technicalIntegrations || DEFAULT_TECHNICAL_INTEGRATIONS;
      const exists = currentList.some(i => i.id === updated.id);
      const newList = exists
        ? currentList.map(i => (i.id === updated.id ? updated : i))
        : [...currentList, updated];

      return {
        ...prev,
        technicalIntegrations: newList,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: newList.length
        }
      };
    });
  };

  const handleDeleteIntegration = (id: string) => {
    onUpdateScenario(prev => {
      const currentList = prev.technicalIntegrations || DEFAULT_TECHNICAL_INTEGRATIONS;
      const newList = currentList.filter(i => i.id !== id);
      return {
        ...prev,
        technicalIntegrations: newList,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: newList.length
        }
      };
    });
  };

  // Filtered integrations
  const filteredIntegrations = integrations.filter(item => {
    const matchesPillar = pillarFilter === 'all' || item.pillar === pillarFilter;
    const matchesTier = tierFilter === 'all' || item.complexity === tierFilter;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetSystem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesTier && matchesSearch;
  });

  const totalIntegrationHours = integrations.reduce((sum, item) => sum + (item.calculatedHours || 80), 0);
  const simpleCount = integrations.filter(i => i.complexity === 'S').length;
  const mediumCount = integrations.filter(i => i.complexity === 'M').length;
  const complexCount = integrations.filter(i => i.complexity === 'C' || i.complexity === 'XL').length;
  const avgHours = integrations.length > 0 ? Math.round(totalIntegrationHours / integrations.length) : 0;

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('ricefw_unified')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'ricefw_unified'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TableProperties size={14} className="text-indigo-400" />
            <span>Unified RICEFW Scoping Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calculator size={14} />
            <span>Deep 6-Q Integrations ({integrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conversions')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'conversions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Database size={14} />
            <span>Conversions & Mock Scale</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers size={14} />
            <span>T-Shirt Benchmark Tower</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsIntelModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Ingest Spec Sheet, Interfaces & Conversion Matrix"
          >
            <Sparkles size={14} />
            <span>Ingest Spec Sheet / Intel</span>
          </button>

          {activeTab === 'integrations' && (
            <button
              type="button"
              onClick={handleAddNewIntegration}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Custom Integration</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'ricefw_unified' ? (
        <UnifiedRicefwSummaryGrid
          scenario={scenario}
          onUpdateScenario={onUpdateScenario}
          data={data}
          onIngestClick={() => setIsIntelModalOpen(true)}
        />
      ) : activeTab === 'conversions' ? (
        <ConversionMatrixManager
          scenario={scenario}
          onUpdateScenario={onUpdateScenario}
          data={data}
        />
      ) : activeTab === 'benchmarks' ? (
        <TechnicalTowerBenchmarks
          scenario={scenario}
          onUpdateScenario={onUpdateScenario}
          data={data}
        />
      ) : activeTab === 'smc_matrix' ? (
        <TechnicalSmcMatrix
          scenario={scenario}
          onUpdateScenario={onUpdateScenario}
          data={data}
        />
      ) : (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-none border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-none bg-blue-600 text-white">
                  <Calculator size={15} />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
                  Question-Driven Integration Scoping Engine
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Itemized Technical Integrations Scope & Calculation Logic
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Effort is calculated dynamically for every integration object from answers to 6 enterprise scoping questions (Flow Pattern, Mapping Complexity, Protocol, Data Volume, Error Handling, and API Readiness) with complete mathematical formulas.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <div className="bg-slate-800 p-3 rounded-none border border-slate-700 text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                  Total Integration Effort
                </span>
                <span className="text-2xl font-bold text-emerald-400">
                  {(totalIntegrationHours || 0).toLocaleString()} <span className="text-xs text-slate-300 font-normal">hrs</span>
                </span>
                <div className="text-[10px] text-slate-400">
                  Avg {avgHours} hrs / integration
                </div>
              </div>
            </div>
          </div>

          {/* 3 Tier Pills Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-none flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Simple Tier (S &le; 65h)
                </span>
                <span className="text-xl font-mono font-bold text-emerald-900">
                  {simpleCount} <span className="text-xs font-normal text-emerald-700">Integrations</span>
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-800 text-[10px] font-mono font-bold rounded-none">
                {integrations.length > 0 ? Math.round((simpleCount / integrations.length) * 100) : 0}% of scope
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-none flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Medium Tier (M: 66–135h)
                </span>
                <span className="text-xl font-mono font-bold text-blue-900">
                  {mediumCount} <span className="text-xs font-normal text-blue-700">Integrations</span>
                </span>
              </div>
              <span className="px-2 py-0.5 bg-blue-200/60 text-blue-800 text-[10px] font-mono font-bold rounded-none">
                {integrations.length > 0 ? Math.round((mediumCount / integrations.length) * 100) : 0}% of scope
              </span>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-none flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Complex Tier (C &gt; 135h)
                </span>
                <span className="text-xl font-mono font-bold text-purple-900">
                  {complexCount} <span className="text-xs font-normal text-purple-700">Integrations</span>
                </span>
              </div>
              <span className="px-2 py-0.5 bg-purple-200/60 text-purple-800 text-[10px] font-mono font-bold rounded-none">
                {integrations.length > 0 ? Math.round((complexCount / integrations.length) * 100) : 0}% of scope
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Filter size={13} />
                <span className="font-bold text-slate-700">Pillar:</span>
              </div>
              <select
                value={pillarFilter}
                onChange={(e) => setPillarFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 rounded-none"
              >
                <option value="all">All Pillars</option>
                <option value="ERP">ERP</option>
                <option value="SCM">SCM</option>
                <option value="HCM">HCM</option>
                <option value="CX">CX</option>
                <option value="EPM">EPM</option>
              </select>

              <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
                <span className="font-bold text-slate-700">Tier:</span>
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 rounded-none"
              >
                <option value="all">All Sizing Tiers</option>
                <option value="S">Simple (S)</option>
                <option value="M">Medium (M)</option>
                <option value="C">Complex (C)</option>
              </select>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integration, source or target..."
                className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 rounded-none focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Integrations Table */}
          <div className="overflow-x-auto border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-900 text-white uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Integration Name & Flow Direction</th>
                  <th className="py-3 px-3">Source &rarr; Target Systems</th>
                  <th className="py-3 px-3 text-center">S/M/C Tier</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-right">Calculated Effort</th>
                  <th className="py-3 px-3 text-center">Scoping Logic</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredIntegrations.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.code}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200">
                            {item.pillar}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {item.type === 'inbound_rest' ? 'Inbound REST API' :
                             item.type === 'outbound_extract' ? 'Outbound BICC Extract' :
                             item.type === 'bidirectional_sync' ? 'Bidirectional Real-Time Sync' :
                             item.type === 'batch_fbdi' ? 'Batch FBDI File Handler' : 'Event Pub/Sub'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        <div className="truncate max-w-xs">{item.sourceSystem}</div>
                        <div className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5">
                          <span>&rarr;</span>
                          <span className="truncate max-w-xs">{item.targetSystem}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-none border ${
                          item.complexity === 'S'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.complexity === 'M'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                        }`}>
                          Tier {item.complexity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-600">
                        {item.compositeScore ? item.compositeScore.toFixed(2) : '1.80'} / 4.0
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-sm text-blue-700">
                          {item.calculatedHours} <span className="text-[10px] text-slate-500 font-normal">hrs</span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 truncate max-w-[180px] ml-auto" title={item.calculationFormula}>
                          {item.calculationFormula}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenCalculator(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded-none border border-slate-200 flex items-center gap-1 mx-auto transition cursor-pointer"
                        >
                          <Calculator size={11} />
                          <span>6 Questions</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenCalculator(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-none hover:bg-slate-100 transition cursor-pointer"
                            title="Edit Scoping Parameters"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIntegration(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-none hover:bg-slate-100 transition cursor-pointer"
                            title="Remove Integration"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                  <td colSpan={3} className="py-3 px-3 uppercase text-[10px] tracking-wider">
                    Total In-Scope Integrations ({filteredIntegrations.length} Items)
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-700">
                    {simpleCount}S / {mediumCount}M / {complexCount}C
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[10px] text-slate-500">
                    &mdash;
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-800 text-sm">
                    {(totalIntegrationHours || 0).toLocaleString()} hrs
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-right text-[10px] text-slate-500 font-sans">
                    Synced to Estimation Engine
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Universal Intel & Spec Sheet Hub */}
      <IntelUploadHubModal
        isOpen={isIntelModalOpen}
        onClose={() => setIsIntelModalOpen(false)}
        scenario={scenario}
        onUpdateScenario={onUpdateScenario}
      />

      {/* Integration Scoping Calculator Modal */}
      <IntegrationScopingCalculatorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIntegration(null);
        }}
        integration={editingIntegration}
        onSaveIntegration={handleSaveIntegration}
      />
    </div>
  );
};
