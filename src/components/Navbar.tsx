import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Database,
  BarChart3,
  CalendarDays,
  Download,
  Upload,
  Layers,
  Sparkles,
  Printer,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calculator,
  History,
  Plus,
  Trash2,
  FileText,
  Presentation,
  Copy,
  Check,
  Lock,
  ShieldCheck,
  Headphones,
  Cloud
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule } from '../types';
import { PRESET_SCENARIOS } from '../data/templates';
import { exportWbsToCsv, exportCommercialsToCsv, exportProjectJson } from '../utils/exporter';
import { generateExecutiveSlideDeck } from '../utils/executivePptxGenerator';
import { UniversalSnapshotManager } from './common/UniversalSnapshotManager';
import { CloudDatabaseSyncModal } from './modals/CloudDatabaseSyncModal';

interface NavbarProps {
  scenario: ProjectScenario;
  onSelectScenario: (s: ProjectScenario) => void;
  onRestoreScenario?: (restored: ProjectScenario) => void;
  calculatedData: CalculatedProjectData;
  onOpenCompare: () => void;
  onOpenAudit: () => void;
  onOpenPrint: () => void;
  onImportJson: (imported: ProjectScenario) => void;
  onOpenFrameworkSlider?: () => void;
  onOpenComplexityStudio?: () => void;
  onOpenIntelHub?: () => void;
  onOpenTraceMath?: (target?: OracleModule | 'project_total') => void;
  onOpenAshishCopilot?: () => void;
  onOpenNewProposal?: () => void;
  onOpenSmartsheetExport?: () => void;
  onOpenSlideDeck?: () => void;
  onOpenNotebookLmPodcast?: () => void;
  isPodcastPlaying?: boolean;
  customScenarios?: ProjectScenario[];
  onDeleteCustomScenario?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenario,
  onSelectScenario,
  onRestoreScenario,
  calculatedData,
  onOpenCompare,
  onOpenAudit,
  onOpenPrint,
  onImportJson,
  onOpenFrameworkSlider,
  onOpenComplexityStudio,
  onOpenIntelHub,
  onOpenTraceMath,
  onOpenAshishCopilot,
  onOpenNewProposal,
  onOpenSmartsheetExport,
  onOpenSlideDeck,
  onOpenNotebookLmPodcast,
  isPodcastPlaying,
  customScenarios = [],
  onDeleteCustomScenario
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [cloudSyncOpen, setCloudSyncOpen] = useState(false);
  const [riskPopoverOpen, setRiskPopoverOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scenarioDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const riskPopoverRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownOpen && scenarioDropdownRef.current && !scenarioDropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (toolsOpen && toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setToolsOpen(false);
      }
      if (exportOpen && exportDropdownRef.current && !exportDropdownRef.current.contains(target)) {
        setExportOpen(false);
      }
      if (riskPopoverOpen && riskPopoverRef.current && !riskPopoverRef.current.contains(target)) {
        setRiskPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen, toolsOpen, exportOpen, riskPopoverOpen]);

  // Delivery Confidence & Margin Risk Score
  const deliveryConfidence = useMemo(() => {
    let score = 95;
    const reasons: string[] = [];

    const downsizedCount = calculatedData.moduleEstimates?.filter(m => m.isDownsized).length || 0;
    if (downsizedCount > 0) {
      score -= downsizedCount * 5;
      reasons.push(`${downsizedCount} Downsized Module Override${downsizedCount > 1 ? 's' : ''}`);
    }

    const oic = scenario.scaleDrivers.tech_oic || 0;
    const paas = scenario.scaleDrivers.tech_paas || 0;
    if (oic > 15 || paas > 4) {
      score -= 8;
      reasons.push(`High CEMLI Inventory (${oic} OIC interfaces, ${paas} PaaS extensions)`);
    }

    const conversionCycles = scenario.scaleDrivers.tech_conversion_cycles || 3;
    const dataObjects = scenario.scaleDrivers.tech_data_objects || 0;
    if (dataObjects > 15 && conversionCycles < 3) {
      score -= 10;
      reasons.push(`High Data Volume (${dataObjects} objects) with compressed Mock Cycles (${conversionCycles})`);
    }

    if ((scenario.clientModifiers?.decisionVelocity || 1.0) > 1.1) {
      score -= 7;
      reasons.push('Client Decision Velocity SLA Lag');
    }

    if (scenario.projectWeeks < 28 && scenario.selectedModules.length > 8) {
      score -= 10;
      reasons.push('Compressed Delivery Runway (<28w for broad module footprint)');
    }

    const finalScore = Math.max(50, Math.min(98, score));
    const level: 'Low' | 'Medium' | 'High' = finalScore >= 85 ? 'Low' : finalScore >= 70 ? 'Medium' : 'High';
    return { score: finalScore, level, reasons, downsizedCount };
  }, [calculatedData, scenario]);

  const handleCopyExecSummary = () => {
    const effortP80 = Math.round(calculatedData.targetHours || 0).toLocaleString();
    const effortP50 = Math.round(calculatedData.p50_StandardHours || (calculatedData.targetHours * 0.85)).toLocaleString();
    const contingencyHrs = Math.round(calculatedData.contingencyHours || (calculatedData.targetHours * 0.15)).toLocaleString();
    const contingencyPct = calculatedData.contingencyPct || 15;
    const peakFTE = (calculatedData.avgTotalFTE ?? calculatedData.totalFTE ?? (calculatedData.targetHours / ((scenario.projectWeeks || 32) * 40)) ?? 0).toFixed(1);
    const totalPM = (calculatedData.targetPersonMonths || 0).toFixed(1);
    const modCount = scenario.selectedModules.length;
    const pillars = Array.from(new Set(calculatedData.moduleEstimates?.map(m => m.pillar) || [])).join(', ') || 'ERP/SCM';
    const oic = scenario.scaleDrivers.tech_oic || 0;
    const paas = scenario.scaleDrivers.tech_paas || 0;
    const dataObjs = scenario.scaleDrivers.tech_data_objects || 0;
    const mocks = scenario.scaleDrivers.tech_conversion_cycles || 3;
    const isLocked = scenario.isScheduleFrozen || scenario.isBlackoutLocked;

    const summaryText = [
      `📋 ORACLE CLOUD EXECUTIVE DEAL SUMMARY: ${scenario.name.toUpperCase()}`,
      `═══════════════════════════════════════════════════════════════════`,
      `• Scope: ${modCount} In-Scope Modules across ${pillars}`,
      `• Total Defensible Effort: ${effortP80} hrs (P80) | Baseline P50: ${effortP50} hrs`,
      `• Margin & Contingency: ${contingencyHrs} hrs buffer (${contingencyPct}% Contingency)`,
      `• Duration & Concurrency: ${scenario.projectWeeks} Weeks (${scenario.rolloutWaves || 1} Waves, ${scenario.rolloutApproach.replace('_', ' ').toUpperCase()})`,
      `• Staffing Runway: ${peakFTE} Peak FTE | ${totalPM} Total Person-Months`,
      `• Technical Inventory: ${oic} OIC Integrations | ${paas} PaaS Extensions | ${dataObjs} Data Objects (${mocks} Mock Cycles)`,
      `• Delivery Confidence: ${deliveryConfidence.score}% Rating (${deliveryConfidence.level} Risk)${deliveryConfidence.downsizedCount > 0 ? ` | ⚠️ ${deliveryConfidence.downsizedCount} Downsized Module(s)` : ''}`,
      `• SteerCo Baseline: ${isLocked ? '🔒 LOCKED (Changes require formal CR)' : '📝 Active Working Draft'}`,
      `• Deterministic WBS: 30-Column Deterministic WBS (Aligned to Oracle Standard)`,
      `═══════════════════════════════════════════════════════════════════`,
      `Generated by PB-Estimo Oracle Cloud Delivery & Sizing Engine`
    ].join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.selectedModules && parsed.scaleDrivers) {
          onImportJson(parsed);
        }
      } catch (err) {
        console.error('Invalid JSON project file', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: Brand Logo, Title & Proposal Selectors */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-sm bg-slate-900 text-white flex items-center justify-center">
              <Database size={16} className="stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">PB-Estimo</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline">
                Oracle Cloud
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0 mx-0.5" />

          {/* New Proposal & Scenario Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct + New Proposal Button */}
            {onOpenNewProposal && (
              <button
                type="button"
                onClick={onOpenNewProposal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 border border-emerald-500"
                title="Create a new implementation proposal / clean slate"
              >
                <Plus size={13} className="stroke-[3]" />
                <span className="font-bold tracking-tight">New Proposal</span>
              </button>
            )}

            {/* Scenario Dropdown */}
            <div ref={scenarioDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setToolsOpen(false);
                  setExportOpen(false);
                  setRiskPopoverOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer max-w-[120px] sm:max-w-[160px]"
              >
                <Sparkles size={12} className="text-indigo-600 shrink-0" />
                <span className="truncate">{scenario.name}</span>
                <ChevronDown size={12} className="text-slate-400 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-sm shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
                  {/* Action Card: Create New Proposal */}
                  {onOpenNewProposal && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenNewProposal();
                      }}
                      className="w-full text-left p-2 rounded-sm bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-sm bg-emerald-600 text-white">
                          <Plus size={12} className="stroke-[3]" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-emerald-950">+ New Proposal / Deal</div>
                          <div className="text-[10px] text-emerald-700">Clean-slate, template, or clone</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-xs uppercase">
                        Create
                      </span>
                    </button>
                  )}

                  {/* Custom User Proposals */}
                  {customScenarios.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        My Custom Proposals ({customScenarios.length})
                      </div>
                      <div className="space-y-1">
                        {customScenarios.map((custom) => (
                          <div
                            key={custom.id}
                            className={`w-full flex items-center justify-between p-2 rounded-sm text-xs transition ${
                              scenario.id === custom.id
                                ? 'bg-slate-900 text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onSelectScenario(custom);
                                setDropdownOpen(false);
                              }}
                              className="text-left flex-1 min-w-0 pr-2 cursor-pointer"
                            >
                              <div className="font-bold flex items-center gap-1.5 truncate">
                                <span className="truncate">{custom.name}</span>
                                {scenario.id === custom.id && <CheckCircle2 size={13} className="text-white shrink-0" />}
                              </div>
                              <div className={`text-[10px] line-clamp-1 ${scenario.id === custom.id ? 'text-slate-300' : 'text-slate-500'}`}>
                                {custom.selectedModules.length} Modules &bull; {custom.projectWeeks} Wks
                              </div>
                            </button>
                            {onDeleteCustomScenario && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete custom proposal "${custom.name}"?`)) {
                                    onDeleteCustomScenario(custom.id);
                                  }
                                }}
                                className={`p-1 rounded-xs transition cursor-pointer ${
                                  scenario.id === custom.id
                                    ? 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-slate-200'
                                }`}
                                title="Delete proposal"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Proposal Card */}
                  <div className="border-t border-slate-100 pt-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Active Proposal
                    </div>
                    <div className="p-2 rounded-sm bg-slate-900 text-white font-bold text-xs flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 truncate font-bold">
                          <span className="truncate">{scenario.name}</span>
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-slate-300 font-normal truncate mt-0.5">
                          {scenario.selectedModules.length} Modules &bull; {scenario.projectWeeks} Wks &bull; {scenario.clientName || 'Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deal Tools & Studios Dropdown - Always Visible */}
            <div ref={toolsDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setToolsOpen(!toolsOpen);
                  setDropdownOpen(false);
                  setExportOpen(false);
                  setRiskPopoverOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                title="Open Estimation Tools, AI Ingestion & Leadership Audit Hubs"
              >
                <Layers size={13} className="text-slate-600" />
                <span>Deal Tools</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 mt-1.5 w-68 bg-white border border-slate-200 rounded-sm shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Advanced Deal Tools
                  </div>

                  {/* Listen Podcast - Hidden for future release */}


                  {onOpenComplexityStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenComplexityStudio();
                        setToolsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2 transition"
                    >
                      <Sparkles size={13} className="text-purple-600" />
                      <div>
                        <div className="font-bold">Complexity & AI Studio</div>
                        <div className="text-[10px] text-slate-500 font-normal">Custom drivers & risk sliders</div>
                      </div>
                    </button>
                  )}

                  {onOpenIntelHub && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenIntelHub();
                        setToolsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2 transition"
                    >
                      <Sparkles size={13} className="text-indigo-600" />
                      <div>
                        <div className="font-bold">AI Scoping & Ingestion Agent</div>
                        <div className="text-[10px] text-slate-500 font-normal">RFP upload, RFP memo & intel synthesis</div>
                      </div>
                    </button>
                  )}

                  {/* Framework Slider hidden */}

                  {onOpenSlideDeck && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSlideDeck();
                        setToolsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2 transition"
                    >
                      <Presentation size={13} className="text-indigo-600" />
                      <div>
                        <div className="font-bold">Executive Slide Deck (PPTX)</div>
                        <div className="text-[10px] text-slate-500 font-normal">5-Slide client presentation</div>
                      </div>
                    </button>
                  )}

                  {/* Compare Blueprints hidden */}

                  <button
                    type="button"
                    onClick={() => {
                      onOpenAudit();
                      setToolsOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition"
                  >
                    <Sparkles size={13} className="text-amber-600" />
                    <div>
                      <div className="font-bold">Leadership Audit Hub</div>
                      <div className="text-[10px] text-slate-500 font-normal">Full formula transparency & trace math</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Vitals, Ask Agent, Snapshot & Export */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Header Vitals (Compact Display) */}
          <div className="hidden xl:flex items-center gap-2.5 text-right pr-1 shrink-0">
            {onOpenTraceMath ? (
              <button
                type="button"
                onClick={() => onOpenTraceMath('project_total')}
                className="text-right group p-0.5 rounded-xs hover:bg-slate-100 transition cursor-pointer"
                title="Click to Trace Effort Math"
              >
                <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none">
                  Effort
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-amber-700 underline decoration-dotted decoration-slate-300">
                  {(Math.round(calculatedData.targetHours || 0)).toLocaleString()}h
                </span>
              </button>
            ) : (
              <div className="text-right">
                <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none">Effort</span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {(Math.round(calculatedData.targetHours || 0)).toLocaleString()}h
                </span>
              </div>
            )}

            <div className="h-3.5 w-px bg-slate-200" />

            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none">Duration</span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {scenario.projectWeeks}w
              </span>
            </div>

            <div className="h-3.5 w-px bg-slate-200" />

            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none">Staffing</span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {(calculatedData.avgTotalFTE ?? calculatedData.totalFTE ?? (calculatedData.targetHours / ((scenario.projectWeeks || 32) * 40)) ?? 0).toFixed(1)} FTE
              </span>
            </div>
          </div>

          {/* Universal Guardrail Snapshot */}
          {onRestoreScenario && (
            <UniversalSnapshotManager
              scenario={scenario}
              onRestoreScenario={onRestoreScenario}
            />
          )}

          {/* Ask Estimo Agent Trigger - Hidden to avoid token usage */}
          {/* Note: Kept hidden per requirement to prevent external token consumption */}

          {/* Direct Smartsheet Plan Trigger in Top Bar - Hidden for future release */}

          {/* Listen Podcast Button in Top Bar - Hidden for future release */}


          {/* Cloud Database Sync & Multi-System Retrieval Trigger */}
          <button
            type="button"
            onClick={() => setCloudSyncOpen(true)}
            className="px-2.5 py-1.5 rounded-sm text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs border shrink-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-300 group"
            title="Cloud Database Sync: Persist and retrieve Oracle project plans across systems via Cloud Firestore"
          >
            <Cloud size={13} className="text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight">Cloud DB</span>
            <span className="text-[8px] font-mono px-1 py-0.2 rounded-2xs font-bold uppercase bg-indigo-200/80 text-indigo-900">
              SYNC
            </span>
          </button>

          {/* Point 1: Executive Risk Score & Margin Guard Pill */}
          <div ref={riskPopoverRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setRiskPopoverOpen(!riskPopoverOpen);
                setExportOpen(false);
                setToolsOpen(false);
                setDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-sm border text-xs font-mono font-bold transition cursor-pointer shrink-0 shadow-2xs ${
                deliveryConfidence.level === 'High'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300'
                  : deliveryConfidence.level === 'Medium'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
              title="SVP Margin Guard: Click to inspect Delivery Confidence Score & Risk Triggers"
            >
              <div className={`w-2 h-2 rounded-full ${
                deliveryConfidence.level === 'High'
                  ? 'bg-rose-600 animate-pulse'
                  : deliveryConfidence.level === 'Medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`} />
              <span>{deliveryConfidence.score}%</span>
              <span className="text-[10px] font-sans text-slate-500 uppercase hidden lg:inline font-semibold">
                ({deliveryConfidence.level} Risk)
              </span>
              {deliveryConfidence.downsizedCount > 0 && (
                <span className="bg-amber-200 text-amber-950 text-[9px] px-1 py-0.2 rounded-2xs font-bold">
                  {deliveryConfidence.downsizedCount} Downsized
                </span>
              )}
            </button>

            {/* Risk Guard Popover */}
            {riskPopoverOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-300 rounded-sm shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                      SVP Delivery Confidence & Margin Guard
                    </div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2 mt-0.5">
                      <span>{deliveryConfidence.score}% Confidence</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-2xs uppercase font-bold ${
                        deliveryConfidence.level === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : deliveryConfidence.level === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {deliveryConfidence.level} Risk
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRiskPopoverOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-mono font-bold cursor-pointer p-1"
                  >
                    &times;
                  </button>
                </div>

                {/* Margin & Effort Stats */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500">Margin Buffer (P80 Buffer):</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(calculatedData.contingencyHours || (calculatedData.targetHours * 0.15)).toLocaleString()}h ({calculatedData.contingencyPct || 15}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500">P50 Baseline Target:</span>
                    <span className="font-bold text-slate-700">
                      {Math.round(calculatedData.p50_StandardHours || (calculatedData.targetHours * 0.85)).toLocaleString()}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-mono pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Total Defensible P80:</span>
                    <span className="font-bold text-blue-900">
                      {Math.round(calculatedData.targetHours || 0).toLocaleString()}h
                    </span>
                  </div>
                </div>

                {/* Risk Drivers */}
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Active Risk Evaluation Drivers:</span>
                    <span className="font-mono text-slate-400 font-normal">{deliveryConfidence.reasons.length} active</span>
                  </div>
                  {deliveryConfidence.reasons.length === 0 ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                      <span>Clean deal parameters. Minimal deviation from Oracle benchmark standards.</span>
                    </div>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-slate-700 max-h-36 overflow-y-auto pr-1">
                      {deliveryConfidence.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 p-1 bg-amber-50/70 border border-amber-200/60 rounded-2xs">
                          <AlertTriangle size={11} className="text-amber-700 shrink-0 mt-0.5" />
                          <span className="leading-tight">{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setRiskPopoverOpen(false);
                    handleCopyExecSummary();
                  }}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Copy size={12} />
                  <span>Copy Deal Summary Brief</span>
                </button>
              </div>
            )}
          </div>

          {/* Point 2: 1-Click Executive Deal Summary Clipboard Copy */}
          <button
            type="button"
            onClick={handleCopyExecSummary}
            className={`px-2.5 py-1.5 rounded-sm border text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs ${
              copiedSummary
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
            title="1-Click Copy Executive Deal Brief (formatted for SteerCo, Practice Leaders & Email/Slack)"
          >
            {copiedSummary ? (
              <>
                <Check size={13} className="text-white stroke-[3]" />
                <span className="text-white">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-slate-600" />
                <span className="hidden sm:inline">Deal Brief</span>
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div ref={exportDropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setExportOpen(!exportOpen);
                setDropdownOpen(false);
                setToolsOpen(false);
                setRiskPopoverOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={11} />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-sm shadow-xl z-50 p-1.5 space-y-1">
                {/* Trigger Smartsheet Plan - Hidden for future release */}

                {onOpenSlideDeck ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSlideDeck();
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2 border border-indigo-200 cursor-pointer"
                  >
                    <Presentation size={13} className="text-indigo-600 shrink-0" />
                    <div>
                      <div>Executive Slide Deck (PPTX)</div>
                      <div className="text-[9px] text-indigo-700 font-normal">Max 5-slide client presentation</div>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      generateExecutiveSlideDeck(scenario, calculatedData);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2 border border-indigo-200 cursor-pointer"
                  >
                    <Presentation size={13} className="text-indigo-600 shrink-0" />
                    <div>
                      <div>Download .PPTX Slide Deck</div>
                      <div className="text-[9px] text-indigo-700 font-normal">Max 5-slide client presentation</div>
                    </div>
                  </button>
                )}
                <div className="h-px bg-slate-200 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    handleCopyExecSummary();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <Copy size={13} className="text-slate-600" />
                  <span>Copy Deal Summary (Text)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportWbsToCsv(scenario, calculatedData);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <BarChart3 size={13} className="text-blue-600" />
                  <span>Export WBS (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportCommercialsToCsv(scenario, calculatedData);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Users size={13} className="text-emerald-600" />
                  <span>Export Staffing (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportProjectJson(scenario);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Download size={13} className="text-slate-600" />
                  <span>Save Plan JSON</span>
                </button>
                <div className="h-px bg-slate-200 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Upload size={13} className="text-orange-600" />
                  <span>Load Plan JSON...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenPrint();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Printer size={13} className="text-teal-600" />
                  <span>Print RFP Brief</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Cloud Database Sync Modal */}
          <CloudDatabaseSyncModal
            isOpen={cloudSyncOpen}
            onClose={() => setCloudSyncOpen(false)}
            currentScenario={scenario}
            onLoadScenario={onSelectScenario}
          />
        </div>
      </div>

      {/* Point 5: SteerCo Baseline Blackout & Scope Freeze Prominence Banner */}
      {(scenario.isScheduleFrozen || scenario.isBlackoutLocked) && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-rose-100 border-t border-rose-800/60 px-3 sm:px-4 py-1.5 text-xs font-mono flex items-center shadow-inner">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-5 h-5 rounded-xs bg-rose-600 text-white font-bold shrink-0 shadow-xs">
                <Lock size={12} className="stroke-[2.5]" />
              </span>
              <span className="font-bold text-white tracking-tight shrink-0">
                SteerCo Baseline Locked:
              </span>
              <span className="text-rose-200 text-[11px] truncate hidden md:inline">
                Scope, sizing baselines, and milestone dates are locked for governance. Any scope or tier changes require a formal Change Request (CR).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-2xs bg-rose-900/90 border border-rose-600/60 text-rose-200">
                CR Protocol Enforced
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
