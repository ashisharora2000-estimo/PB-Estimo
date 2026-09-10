import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Layers,
  Building2,
  Factory,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Cpu,
  FileCheck
} from 'lucide-react';
import { ProjectScenario, BidDefaultsConfig, ScopingInputMode, TShirtSize } from '../../types';
import {
  BID_DEFAULT_PROFILES,
  getScenarioBidDefaults,
  applyBidDefaultsToScenario
} from '../../utils/bidDefaultsManager';

interface BidDefaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const BidDefaultsModal: React.FC<BidDefaultsModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario
}) => {
  if (!isOpen) return null;

  const currentDefaults = getScenarioBidDefaults(scenario);
  const [config, setConfig] = useState<BidDefaultsConfig>({ ...currentDefaults });
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);

  // Load a preset archetype
  const handleSelectPreset = (presetKey: string) => {
    const preset = BID_DEFAULT_PROFILES[presetKey];
    if (preset) {
      setConfig({ ...preset });
    }
  };

  // Save config directly to scenario (isolated to this bid)
  const handleSaveOnly = () => {
    onUpdateScenario(prev => ({
      ...prev,
      scopingInputMode: config.inputMode,
      bidDefaultsConfig: config
    }));
    setApplyFeedback('Bid defaults saved successfully for this bid.');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  // Apply defaults to all unfilled or un-answered fields in the active scenario
  const handleApplyDefaultsToScenario = () => {
    onUpdateScenario(prev => {
      return applyBidDefaultsToScenario(prev, config, { overwriteExisting });
    });

    setApplyFeedback(
      overwriteExisting
        ? 'All fields, questions, and drivers updated with bid defaults and confidence scores.'
        : 'Defaults populated into all unanswered questions and unstated drivers with confidence scores.'
    );

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Scale driver change helper
  const handleScaleDriverChange = (key: string, val: number) => {
    setConfig(prev => ({
      ...prev,
      defaultScaleDrivers: {
        ...prev.defaultScaleDrivers,
        [key]: Math.max(0, val)
      }
    }));
  };

  // Client modifier change helper
  const handleModifierChange = (key: keyof ProjectScenario['clientModifiers'], val: number) => {
    setConfig(prev => ({
      ...prev,
      defaultClientModifiers: {
        ...prev.defaultClientModifiers,
        [key]: val
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl rounded-sm overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 border border-indigo-400/40 rounded-xs text-indigo-200">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Bid Defaults & Input Reduction</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase">
                  Bid-Isolated
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Configure input depth and baseline defaults for <span className="font-semibold text-white">"{scenario.name}"</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800">
          {/* Feedback banner */}
          {applyFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{applyFeedback}</span>
            </div>
          )}

          {/* Section 1: Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                1. Select Bid Scoping Archetype Preset
              </label>
              <span className="text-[11px] text-slate-500">Presets auto-configure all underlying parameters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'fast_track',
                  name: '⚡ Fast-Track MVP',
                  desc: 'Minimal inputs (Core 5 Drivers). Fit-to-Standard MBP baseline with 80% default confidence.',
                  badge: 'Reduced Inputs'
                },
                {
                  id: 'standard',
                  name: '🏢 Standard Enterprise',
                  desc: 'Balanced input depth. Standard multi-ledger & 24 OIC baseline with 75% confidence.',
                  badge: 'Recommended'
                },
                {
                  id: 'comprehensive',
                  name: '🌐 Complex Global',
                  desc: 'Full deep-dive input depth. High-volume multi-entity, 40 OIC interfaces with 70% confidence.',
                  badge: 'Full Depth'
                }
              ].map(preset => {
                const isSelected = config.inputMode === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{preset.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 border font-bold uppercase ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{preset.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Input Reduction Mode Depth Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                2. Input Reduction Mode (Scoping Depth)
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Control how many questions and parameters estimators must fill out for this bid. Unshown secondary fields automatically draw from the calibrated Bid Defaults below with stamped confidence scores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  mode: 'fast_track' as ScopingInputMode,
                  title: '⚡ Fast-Track (Reduced Inputs)',
                  detail: 'Only 5 Core Mandatory Architectural Drivers visible per module. 15 secondary questions auto-drawn from MBP defaults.'
                },
                {
                  mode: 'standard' as ScopingInputMode,
                  title: 'Standard Inputs',
                  detail: 'Balanced view with primary process, integration, and reporting questions visible.'
                },
                {
                  mode: 'comprehensive' as ScopingInputMode,
                  title: 'Comprehensive (All 20-Q)',
                  detail: 'All 20 detailed scoping questions and full physical scale parameters exposed for exhaustive estimation.'
                }
              ].map(item => {
                const isActive = config.inputMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, inputMode: item.mode }))}
                    className={`p-3 text-left border transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1 flex items-center justify-between">
                      <span>{item.title}</span>
                      {isActive && <CheckCircle2 size={13} className="text-emerald-400" />}
                    </div>
                    <p className={`text-[10.5px] leading-snug ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.detail}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Default Module & Question Baselines */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              3. Default Module Complexity & Question Baseline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Default T-Shirt Size */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xs space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Default T-Shirt Size for Unrated Modules
                </label>
                <p className="text-[11px] text-slate-500">
                  Initial sizing applied to newly added or un-scored modules in this bid.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  {(['XS', 'S', 'M', 'L', 'XL'] as TShirtSize[]).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, defaultTShirtSize: sz }))}
                      className={`flex-1 py-1.5 text-xs font-bold font-mono border transition cursor-pointer ${
                        config.defaultTShirtSize === sz
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Question Option */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xs space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Default Question Complexity Option
                </label>
                <p className="text-[11px] text-slate-500">
                  Default selection assigned to questions not explicitly extracted from AI text.
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { idx: 0, label: 'C1: MBP (Score 1)' },
                    { idx: 1, label: 'C2: Std (Score 2)' },
                    { idx: 2, label: 'C3: Comp (Score 3)' }
                  ].map(opt => (
                    <button
                      key={opt.idx}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, defaultQuestionOptionIdx: opt.idx }))}
                      className={`py-1.5 px-1 text-center text-[10px] font-bold font-mono border transition cursor-pointer ${
                        config.defaultQuestionOptionIdx === opt.idx
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Physical Scale Drivers Baselines */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              4. Default Physical Scale Drivers for this Bid
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'fin_ent', label: 'Legal Entities', icon: Building2 },
                { key: 'fin_led', label: 'Primary Ledgers', icon: Layers },
                { key: 'scm_plants', label: 'Mfg Plants', icon: Factory },
                { key: 'scm_wh', label: 'Warehouses', icon: Building2 },
                { key: 'tech_oic', label: 'OIC Integrations', icon: Cpu },
                { key: 'tech_data_objects', label: 'Data Objects', icon: Database },
                { key: 'tech_conversion_cycles', label: 'Mock Cycles', icon: RotateCcw },
                { key: 'tech_reports_bip', label: 'BIP Reports', icon: FileCheck }
              ].map(driver => {
                const Icon = driver.icon;
                const val = (config.defaultScaleDrivers as any)[driver.key] || 0;
                return (
                  <div key={driver.key} className="p-2.5 bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <Icon size={12} className="text-slate-400" />
                      <span>{driver.label}</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={e => handleScaleDriverChange(driver.key, parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2 py-1 text-xs font-mono font-bold border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: AI Confidence Score & Threshold Calibration */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 font-mono">
                5. AI Confidence Scoring & Client Q&A Threshold
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Confidence Score Assigned to Defaults: <span className="text-indigo-700 font-mono font-bold">{config.confidenceScoreForDefaults}%</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  When questions or drivers are filled using bid defaults, this confidence score is stamped into their metadata.
                </p>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={config.confidenceScoreForDefaults}
                  onChange={e => setConfig(prev => ({ ...prev, confidenceScoreForDefaults: parseInt(e.target.value, 10) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Client Clarification Flag Threshold: <span className="text-amber-700 font-mono font-bold">{config.aiConfidenceThreshold}%</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Any field or question with confidence below this percentage will be automatically flagged for the Client Q&A export.
                </p>
                <input
                  type="range"
                  min={50}
                  max={85}
                  step={5}
                  value={config.aiConfidenceThreshold}
                  onChange={e => setConfig(prev => ({ ...prev, aiConfidenceThreshold: parseInt(e.target.value, 10) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Overwrite Toggle Option */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="overwriteExistingCheckbox"
                type="checkbox"
                checked={overwriteExisting}
                onChange={e => setOverwriteExisting(e.target.checked)}
                className="rounded-xs text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="overwriteExistingCheckbox" className="text-xs text-slate-700 cursor-pointer font-medium">
                <strong className="text-slate-900">Force Overwrite Existing Answers:</strong> Replace previously answered questions with these bid defaults.
              </label>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {overwriteExisting ? 'Caution: Overwrites all' : 'Safe: Unfilled fields only'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Bid Target: <strong className="text-slate-800">{scenario.name}</strong> • Isolation: <span className="text-emerald-700 font-bold">Guaranteed</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition cursor-pointer font-mono"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveOnly}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-200 hover:bg-slate-300 border border-slate-300 transition cursor-pointer font-mono"
              title="Save defaults configuration for this bid without altering current fields"
            >
              Save Config Only
            </button>

            <button
              type="button"
              onClick={handleApplyDefaultsToScenario}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-indigo-700 hover:bg-indigo-600 border border-indigo-800 transition cursor-pointer shadow-xs font-mono flex items-center justify-center gap-1.5"
              title="Apply these defaults to all unanswered questions & drivers with stamped confidence scores"
            >
              <CheckCircle2 size={14} className="text-emerald-300" />
              <span>Apply Defaults to Bid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
