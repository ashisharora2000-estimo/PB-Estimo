import React, { useState } from 'react';
import {
  Workflow,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  Clock,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  RotateCcw,
  ArrowRight,
  Info,
  ExternalLink,
  Check
} from 'lucide-react';
import { ProjectScenario, IntegrationScopingOptions } from '../../types';
import { calculateProjectMetrics } from '../../utils/calculator';

interface IntegrationScopeStudioProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onSwitchToFullScope?: () => void;
}

export const IntegrationScopeStudio: React.FC<IntegrationScopeStudioProps> = ({
  scenario,
  onUpdateScenario,
  onSwitchToFullScope
}) => {
  const isIntegrationsOnly = scenario.scopeMode === 'integrations_only';

  const defaultOptions: IntegrationScopingOptions = {
    includeErrorFramework: true,
    includeCanonicalDataModel: true,
    includePartnerCoTesting: true,
    includeB2BEdiSupport: false,
    targetSystems: ['Salesforce CRM', 'Workday HCM', 'SAP S/4HANA', 'SWIFT Banking', 'ServiceNow'],
    devSquadSize: 4,
    simpleCount: 8,
    mediumCount: 12,
    complexCount: 5,
    extraLargeCount: 0
  };

  const options = scenario.integrationScopingOptions || defaultOptions;

  const [newSystemInput, setNewSystemInput] = useState('');

  // Sizing tiers
  const applyTierPreset = (tier: 'small' | 'medium' | 'large') => {
    let s = 4;
    let m = 5;
    let c = 1;
    let xl = 0;

    if (tier === 'medium') {
      s = 8;
      m = 12;
      c = 5;
      xl = 0;
    } else if (tier === 'large') {
      s = 15;
      m = 22;
      c = 10;
      xl = 3;
    }

    const totalCount = s + m + c + xl;

    onUpdateScenario(prev => ({
      ...prev,
      integrationScopingOptions: {
        ...(prev.integrationScopingOptions || defaultOptions),
        simpleCount: s,
        mediumCount: m,
        complexCount: c,
        extraLargeCount: xl
      },
      scaleDrivers: {
        ...prev.scaleDrivers,
        tech_oic: totalCount,
        test_sit_cycles: prev.scaleDrivers.test_sit_cycles || 2,
        test_uat_cycles: prev.scaleDrivers.test_uat_cycles || 1,
        test_scripts_count: totalCount * 6
      }
    }));
  };

  const updateCount = (key: 'simpleCount' | 'mediumCount' | 'complexCount' | 'extraLargeCount', delta: number) => {
    onUpdateScenario(prev => {
      const currentOpts = prev.integrationScopingOptions || defaultOptions;
      const currentVal = currentOpts[key] || 0;
      const nextVal = Math.max(0, currentVal + delta);

      const nextOpts = {
        ...currentOpts,
        [key]: nextVal
      };

      const totalCount = (nextOpts.simpleCount || 0) + (nextOpts.mediumCount || 0) + (nextOpts.complexCount || 0) + (nextOpts.extraLargeCount || 0);

      return {
        ...prev,
        integrationScopingOptions: nextOpts,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: totalCount,
          test_scripts_count: totalCount * 6
        }
      };
    });
  };

  const setCountDirect = (key: 'simpleCount' | 'mediumCount' | 'complexCount' | 'extraLargeCount', val: number) => {
    const cleanVal = Math.max(0, isNaN(val) ? 0 : val);
    onUpdateScenario(prev => {
      const currentOpts = prev.integrationScopingOptions || defaultOptions;
      const nextOpts = {
        ...currentOpts,
        [key]: cleanVal
      };
      const totalCount = (nextOpts.simpleCount || 0) + (nextOpts.mediumCount || 0) + (nextOpts.complexCount || 0) + (nextOpts.extraLargeCount || 0);

      return {
        ...prev,
        integrationScopingOptions: nextOpts,
        scaleDrivers: {
          ...prev.scaleDrivers,
          tech_oic: totalCount,
          test_scripts_count: totalCount * 6
        }
      };
    });
  };

  const toggleAccelerator = (key: 'includeErrorFramework' | 'includeCanonicalDataModel' | 'includePartnerCoTesting' | 'includeB2BEdiSupport') => {
    onUpdateScenario(prev => {
      const currentOpts = prev.integrationScopingOptions || defaultOptions;
      return {
        ...prev,
        integrationScopingOptions: {
          ...currentOpts,
          [key]: !currentOpts[key]
        }
      };
    });
  };

  const updateSquadSize = (delta: number) => {
    onUpdateScenario(prev => {
      const currentOpts = prev.integrationScopingOptions || defaultOptions;
      const currentSquad = currentOpts.devSquadSize || 4;
      const nextSquad = Math.max(2, Math.min(12, currentSquad + delta));

      return {
        ...prev,
        integrationScopingOptions: {
          ...currentOpts,
          devSquadSize: nextSquad
        }
      };
    });
  };

  const addTargetSystem = () => {
    if (!newSystemInput.trim()) return;
    const name = newSystemInput.trim();
    onUpdateScenario(prev => {
      const currentOpts = prev.integrationScopingOptions || defaultOptions;
      const existing = currentOpts.targetSystems || [];
      if (existing.includes(name)) return prev;

      return {
        ...prev,
        integrationScopingOptions: {
          ...currentOpts,
          targetSystems: [...existing, name]
        }
      };
    });
    setNewSystemInput('');
  };

  const removeTargetSystem = (systemName: string) => {
    onUpdateScenario(prev => {
      const currentOpts = prev.integrationScopingOptions || defaultOptions;
      const existing = currentOpts.targetSystems || [];
      return {
        ...prev,
        integrationScopingOptions: {
          ...currentOpts,
          targetSystems: existing.filter(s => s !== systemName)
        }
      };
    });
  };

  // Calculate live metrics
  const projectMetrics = calculateProjectMetrics(scenario);
  const simpleC = options.simpleCount || 0;
  const mediumC = options.mediumCount || 0;
  const complexC = options.complexCount || 0;
  const xlC = options.extraLargeCount || 0;
  const totalInterfaces = simpleC + mediumC + complexC + xlC;

  const baseInterfaceHours = (simpleC * 40) + (mediumC * 80) + (complexC * 140) + (xlC * 240);
  const acceleratorHours = 
    (options.includeErrorFramework ? 160 : 0) +
    (options.includeCanonicalDataModel ? 120 : 0) +
    (options.includePartnerCoTesting ? 80 : 0) +
    (options.includeB2BEdiSupport ? 80 : 0);

  const squadSize = options.devSquadSize || 4;

  return (
    <div className="bg-white border border-indigo-200 shadow-sm p-4 sm:p-5 space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-900 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <Workflow size={13} className="text-indigo-300" />
              <span>Technical Track: Integrations</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Oracle Integration Cloud (OIC) & Middleware Inventory
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            Oracle Integration Cloud (OIC) Sizing Studio
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Calculates defensible technical development and joint endpoint testing effort based on interface payload complexity, canonical data model schemas, and external third-party end-to-end handshakes.
          </p>
        </div>
      </div>

      {/* Quick Sizing Presets */}
      <div className="bg-slate-50 border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
            Quick Sizing Presets:
          </span>
          <span className="text-[11px] text-slate-500">
            One-click tier selection based on enterprise footprint
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => applyTierPreset('small')}
            className={`px-2.5 py-1 text-xs font-mono font-bold transition cursor-pointer border ${
              totalInterfaces === 10
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Small (10 Interfaces)
          </button>
          <button
            type="button"
            onClick={() => applyTierPreset('medium')}
            className={`px-2.5 py-1 text-xs font-mono font-bold transition cursor-pointer border ${
              totalInterfaces === 25
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Medium (25 Interfaces)
          </button>
          <button
            type="button"
            onClick={() => applyTierPreset('large')}
            className={`px-2.5 py-1 text-xs font-mono font-bold transition cursor-pointer border ${
              totalInterfaces === 50
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Large (50 Interfaces)
          </button>
        </div>
      </div>

      {/* Interface Complexity Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <Cpu size={14} className="text-indigo-600" />
            <span>1. Integration Volume by Complexity Tier</span>
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Total Interfaces: <strong className="text-indigo-900 font-bold">{totalInterfaces}</strong> | Base Build: <strong className="text-slate-900">{baseInterfaceHours.toLocaleString()}h</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Simple */}
          <div className="bg-slate-50/70 border border-slate-200 p-3 relative">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                Simple (S)
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">40h / each</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-snug min-h-[34px]">
              Point-to-point pass-through, standard REST/Webhook, 1:1 mapping, no custom lookup tables.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-mono text-slate-500">Count</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateCount('simpleCount', -1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={simpleC}
                  onChange={(e) => setCountDirect('simpleCount', parseInt(e.target.value, 10))}
                  className="w-12 h-7 text-center font-mono font-bold text-sm bg-white border border-slate-300 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => updateCount('simpleCount', 1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-1 text-right text-[10px] font-mono text-slate-500">
              Subtotal: {(simpleC * 40).toLocaleString()}h
            </div>
          </div>

          {/* Medium */}
          <div className="bg-slate-50/70 border border-slate-200 p-3 relative">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold uppercase">
                Medium (M)
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">80h / each</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-snug min-h-[34px]">
              Batch scheduled orchestration, DVM lookups, standard error notification queues, REST/SOAP.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-mono text-slate-500">Count</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateCount('mediumCount', -1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={mediumC}
                  onChange={(e) => setCountDirect('mediumCount', parseInt(e.target.value, 10))}
                  className="w-12 h-7 text-center font-mono font-bold text-sm bg-white border border-slate-300 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => updateCount('mediumCount', 1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-1 text-right text-[10px] font-mono text-slate-500">
              Subtotal: {(mediumC * 80).toLocaleString()}h
            </div>
          </div>

          {/* Complex */}
          <div className="bg-slate-50/70 border border-slate-200 p-3 relative">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-mono text-[10px] font-bold uppercase">
                Complex (C)
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">140h / each</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-snug min-h-[34px]">
              Multi-system pub/sub, protocol conversion (SFTP/AS2/REST), payload enrichment, complex XSLT.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-mono text-slate-500">Count</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateCount('complexCount', -1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={complexC}
                  onChange={(e) => setCountDirect('complexCount', parseInt(e.target.value, 10))}
                  className="w-12 h-7 text-center font-mono font-bold text-sm bg-white border border-slate-300 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => updateCount('complexCount', 1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-1 text-right text-[10px] font-mono text-slate-500">
              Subtotal: {(complexC * 140).toLocaleString()}h
            </div>
          </div>

          {/* Extra Large */}
          <div className="bg-slate-50/70 border border-slate-200 p-3 relative">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-mono text-[10px] font-bold uppercase">
                Extra Large (XL)
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">240h / each</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-snug min-h-[34px]">
              High-frequency bi-directional sync, custom security handshake, multi-entity transactional rollback.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-mono text-slate-500">Count</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateCount('extraLargeCount', -1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={xlC}
                  onChange={(e) => setCountDirect('extraLargeCount', parseInt(e.target.value, 10))}
                  className="w-12 h-7 text-center font-mono font-bold text-sm bg-white border border-slate-300 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => updateCount('extraLargeCount', 1)}
                  className="w-7 h-7 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-1 text-right text-[10px] font-mono text-slate-500">
              Subtotal: {(xlC * 240).toLocaleString()}h
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Middleware Accelerators & Frameworks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-600" />
            <span>2. Middleware Frameworks & Accelerators</span>
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Accelerator Effort: <strong className="text-indigo-900">{acceleratorHours}h</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Error Framework */}
          <div
            onClick={() => toggleAccelerator('includeErrorFramework')}
            className={`p-3 border cursor-pointer transition select-none ${
              options.includeErrorFramework
                ? 'bg-indigo-50/70 border-indigo-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="font-bold text-xs text-slate-900">
                Global Error Handling & Alert Framework
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                options.includeErrorFramework ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {options.includeErrorFramework && <Check size={10} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Standardized OIC fault policies, dead-letter hospital, replay orchestration & alerts.
            </p>
            <div className="mt-2 text-right text-[10px] font-mono font-bold text-indigo-700">
              +160 hours
            </div>
          </div>

          {/* Canonical Data Model */}
          <div
            onClick={() => toggleAccelerator('includeCanonicalDataModel')}
            className={`p-3 border cursor-pointer transition select-none ${
              options.includeCanonicalDataModel
                ? 'bg-indigo-50/70 border-indigo-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="font-bold text-xs text-slate-900">
                Canonical Data Model (CDM) Standards
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                options.includeCanonicalDataModel ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {options.includeCanonicalDataModel && <Check size={10} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Shared schema definitions for Customer, Supplier, Order, and Employee payloads.
            </p>
            <div className="mt-2 text-right text-[10px] font-mono font-bold text-indigo-700">
              +120 hours
            </div>
          </div>

          {/* Joint Partner Testing */}
          <div
            onClick={() => toggleAccelerator('includePartnerCoTesting')}
            className={`p-3 border cursor-pointer transition select-none ${
              options.includePartnerCoTesting
                ? 'bg-indigo-50/70 border-indigo-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="font-bold text-xs text-slate-900">
                Joint 3rd-Party Endpoint Co-Testing
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                options.includePartnerCoTesting ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {options.includePartnerCoTesting && <Check size={10} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Dedicated test harness execution and multi-vendor defect triage for external endpoints.
            </p>
            <div className="mt-2 text-right text-[10px] font-mono font-bold text-indigo-700">
              +80 hours
            </div>
          </div>

          {/* B2B / EDI Support */}
          <div
            onClick={() => toggleAccelerator('includeB2BEdiSupport')}
            className={`p-3 border cursor-pointer transition select-none ${
              options.includeB2BEdiSupport
                ? 'bg-indigo-50/70 border-indigo-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="font-bold text-xs text-slate-900">
                B2B Trading Partner AS2 & EDI Support
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                options.includeB2BEdiSupport ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {options.includeB2BEdiSupport && <Check size={10} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              B2B document editor, AS2 endpoint configuration, and standard EDI X12/EDIFACT envelopes.
            </p>
            <div className="mt-2 text-right text-[10px] font-mono font-bold text-indigo-700">
              +80 hours
            </div>
          </div>
        </div>
      </div>

      {/* Target Systems & Endpoints */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5 mb-2">
          <Layers size={14} className="text-indigo-600" />
          <span>3. Connected Systems & External Endpoints</span>
        </h4>

        <div className="flex flex-wrap items-center gap-2">
          {(options.targetSystems || []).map((system) => (
            <span
              key={system}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-mono"
            >
              <span>{system}</span>
              <button
                type="button"
                onClick={() => removeTargetSystem(system)}
                className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title={`Remove ${system}`}
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))}

          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="+ Add external system..."
              value={newSystemInput}
              onChange={(e) => setNewSystemInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTargetSystem();
                }
              }}
              className="h-7 px-2 text-xs font-mono bg-white border border-slate-300 text-slate-800 placeholder-slate-400 w-44"
            />
            <button
              type="button"
              onClick={addTargetSystem}
              className="h-7 px-2 bg-slate-900 text-white text-xs font-bold uppercase transition hover:bg-slate-800 cursor-pointer font-mono"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Summary & Live Velocity Metrics */}
      <div className="bg-slate-900 text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5 flex-wrap">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Interfaces</div>
            <div className="text-xl font-bold font-mono text-amber-400">{totalInterfaces} OIC Flows</div>
          </div>
          <div className="w-px h-8 bg-slate-700 hidden sm:block" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Defensible Effort (P80)</div>
            <div className="text-xl font-bold font-mono text-white">
              {(projectMetrics.p80_DefensibleHours || projectMetrics.targetHours || 0).toLocaleString()} hrs
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700 hidden sm:block" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Staffing Capacity</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {(projectMetrics.targetPersonMonths || 0).toFixed(1)} Person-Months
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700 hidden sm:block" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Estimated Duration</div>
            <div className="text-xl font-bold font-mono text-indigo-300">
              {projectMetrics.recommendedDurationWeeks || 16} Weeks
            </div>
          </div>
        </div>

        {/* Squad Capacity Slider */}
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 border border-slate-700">
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase text-slate-300">Dev Squad Size</div>
            <div className="text-xs text-slate-400">OIC Specialists</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateSquadSize(-1)}
              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-white">
              {squadSize}
            </span>
            <button
              type="button"
              onClick={() => updateSquadSize(1)}
              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
