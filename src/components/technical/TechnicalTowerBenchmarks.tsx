import React, { useState } from 'react';
import {
  Layers,
  Network,
  BarChart3,
  Bot,
  Shield,
  Server,
  Zap,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ProjectScenario,
  CalculatedProjectData,
  TechnicalTShirtSize,
  TechnicalWorkstreamTShirtBenchmark
} from '../../types';
import {
  INTEGRATION_TSHIRT_BENCHMARKS,
  REPORTING_TSHIRT_BENCHMARKS,
  REPORTING_CHAIN_LAYERS,
  PAAS_TOWER_BENCHMARKS
} from '../../data/technicalScopingData';

interface TechnicalTowerBenchmarksProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  data: CalculatedProjectData;
}

export const TechnicalTowerBenchmarks: React.FC<TechnicalTowerBenchmarksProps> = ({
  scenario,
  onUpdateScenario,
  data
}) => {
  const [activeTower, setActiveTower] = useState<'INT' | 'REP' | 'PAAS'>('INT');
  const [paasSubTower, setPaasSubTower] = useState<'Infra' | 'Security' | 'Agentic_AI'>('Infra');

  const tShirtSizes: TechnicalTShirtSize[] = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-none border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
              Whiteboard Image 3 & 6 Spec
            </span>
            <span className="text-slate-400 text-xs font-mono">
              TBD Technical Towers & Reporting Chain Engine
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="text-blue-400" size={20} />
            Technical Workstream T-Shirt Sizing & Reporting Chain
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
            Standardized benchmarks for Integrations (INT), Reporting Chain (Rep → FDI → AIDP → Dashboards → BIP → OTB), and the PaaS Technical Tower (Infra, Security & SOD, Agentic AI).
          </p>
        </div>

        {/* Tower Selector Switch */}
        <div className="flex rounded-none border border-slate-700 bg-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTower('INT')}
            className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTower === 'INT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Network size={14} />
            <span>Integrations (INT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTower('REP')}
            className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTower === 'REP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Reporting (REP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTower('PAAS')}
            className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTower === 'PAAS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bot size={14} />
            <span>PaaS & Agentic AI Tower</span>
          </button>
        </div>
      </div>

      {/* TOWER 1: Integrations (INT) Benchmark Table */}
      {activeTower === 'INT' && (
        <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-none shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Network size={16} className="text-blue-600" />
                Integration (INT) Workstream T-Shirt Matrix
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard baseline effort per interface broken down by lifecycle phase (Design, Build, and System Test).
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200">
              Whiteboard Image 6 Standard
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                  <th className="p-2.5 w-16 text-center border-r border-slate-200">T-Shirt</th>
                  <th className="p-2.5 border-r border-slate-200">Complexity Definition & Pattern</th>
                  <th className="p-2.5 w-24 text-center border-r border-slate-200">Design (h)</th>
                  <th className="p-2.5 w-24 text-center border-r border-slate-200">Build (h)</th>
                  <th className="p-2.5 w-24 text-center border-r border-slate-200">Test (h)</th>
                  <th className="p-2.5 w-28 text-center bg-blue-50/50">Total Effort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {tShirtSizes.map((size) => {
                  const item = INTEGRATION_TSHIRT_BENCHMARKS[size];
                  return (
                    <tr key={size} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-100">
                        <span className={`px-2 py-0.5 text-xs font-bold border inline-block ${
                          size === 'XS' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                          size === 'S' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          size === 'M' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          size === 'L' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {size}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-100">
                        <p className="font-bold text-slate-900 text-xs">{item.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.typicalScope}</p>
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.designHours}h</td>
                      <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.buildHours}h</td>
                      <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.testHours}h</td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                        {item.totalHours} hrs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOWER 2: Reporting (REP) Chain & Benchmarks */}
      {activeTower === 'REP' && (
        <div className="space-y-6">
          {/* Reporting Chain Hierarchy Sequence Strip */}
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={16} className="text-emerald-600" />
                  Reporting Chain Hierarchy (Whiteboard Image 3 Annotation)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Sequence: Rep &gt; FDI (Fusion Data Intelligence) &gt; AIDP (AI Data Platform) &gt; Dashboards &gt; BIP &gt; OTB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {REPORTING_CHAIN_LAYERS.map((layer) => (
                <div key={layer.id} className="p-3 bg-slate-50 border border-slate-200 rounded-none relative">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 mb-1">
                    <span>Tier {layer.level}</span>
                    <span className="px-1 bg-slate-200 text-slate-700">{layer.id}</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{layer.name}</h5>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{layer.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reporting T-Shirt Benchmark Table */}
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-slate-700" />
              Reporting & Analytics T-Shirt Benchmark Matrix
            </h4>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                    <th className="p-2.5 w-16 text-center border-r border-slate-200">T-Shirt</th>
                    <th className="p-2.5 border-r border-slate-200">Reporting Category & Scope</th>
                    <th className="p-2.5 w-24 text-center border-r border-slate-200">Design (h)</th>
                    <th className="p-2.5 w-24 text-center border-r border-slate-200">Build (h)</th>
                    <th className="p-2.5 w-24 text-center border-r border-slate-200">Test (h)</th>
                    <th className="p-2.5 w-28 text-center bg-emerald-50/50">Total Effort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {tShirtSizes.map((size) => {
                    const item = REPORTING_TSHIRT_BENCHMARKS[size];
                    return (
                      <tr key={size} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-100">
                          <span className={`px-2 py-0.5 text-xs font-bold border inline-block ${
                            size === 'XS' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            size === 'S' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            size === 'M' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            size === 'L' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {size}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <p className="font-bold text-slate-900 text-xs">{item.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.typicalScope}</p>
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.designHours}h</td>
                        <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.buildHours}h</td>
                        <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.testHours}h</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                          {item.totalHours} hrs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TOWER 3: PaaS Tower (Infra, Security, Agentic AI) */}
      {activeTower === 'PAAS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Bot size={16} className="text-purple-600" />
                  PaaS Tower Sizing (Infra / Security / Agentic AI - Image 6)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Populated enterprise T-shirt benchmark scales across all three critical PaaS pillars.
                </p>
              </div>

              {/* Sub-Tower Pill Switch */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaasSubTower('Infra')}
                  className={`px-3 py-1 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    paasSubTower === 'Infra'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Server size={12} />
                  <span>1. Infrastructure & OCI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaasSubTower('Security')}
                  className={`px-3 py-1 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    paasSubTower === 'Security'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield size={12} />
                  <span>2. Security & SOD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaasSubTower('Agentic_AI')}
                  className={`px-3 py-1 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    paasSubTower === 'Agentic_AI'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>3. Agentic AI & Workflows</span>
                </button>
              </div>
            </div>

            {/* Sub-Tower Table */}
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                    <th className="p-2.5 w-16 text-center border-r border-slate-200">T-Shirt</th>
                    <th className="p-2.5 border-r border-slate-200">PaaS Pillar Scope Definition</th>
                    <th className="p-2.5 w-24 text-center border-r border-slate-200">Design (h)</th>
                    <th className="p-2.5 w-24 text-center border-r border-slate-200">Build (h)</th>
                    <th className="p-2.5 w-24 text-center border-r border-slate-200">Test (h)</th>
                    <th className="p-2.5 w-28 text-center bg-purple-50/50">Total Effort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {tShirtSizes.map((size) => {
                    const item = PAAS_TOWER_BENCHMARKS[paasSubTower][size];
                    return (
                      <tr key={size} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-100">
                          <span className={`px-2 py-0.5 text-xs font-bold border inline-block ${
                            size === 'XS' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            size === 'S' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            size === 'M' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            size === 'L' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {size}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <p className="font-bold text-slate-900 text-xs">{item.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.typicalScope}</p>
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.designHours}h</td>
                        <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.buildHours}h</td>
                        <td className="p-2.5 text-center font-mono text-slate-700 border-r border-slate-100">{item.testHours}h</td>
                        <td className="p-2.5 text-center font-mono font-bold text-purple-700 bg-purple-50/30">
                          {item.totalHours} hrs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
