import React, { useState } from 'react';
import {
  X,
  Download,
  Presentation,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  Building2,
  Sliders,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  XCircle,
  FileText,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Loader2
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';
import { generateExecutiveSlideDeck } from '../../utils/executivePptxGenerator';

interface ExecutiveSlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  data: CalculatedProjectData;
}

export const ExecutiveSlideDeckModal: React.FC<ExecutiveSlideDeckModalProps> = ({
  isOpen,
  onClose,
  scenario,
  data
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Key Calculations with Safe Fallbacks
  const thorId = scenario.thorId && scenario.thorId.trim() !== '' ? scenario.thorId : 'PROP-2026-001';
  const totalHours = Math.round(data.targetHours ?? data.p80_DefensibleHours ?? 0);
  const totalDays = Math.round(totalHours / 8);
  const totalMonths = Math.round(data.targetPersonMonths || totalHours / 160);
  const durationWeeks = typeof scenario.projectWeeks === 'number'
    ? scenario.projectWeeks
    : (typeof data.recommendedDurationWeeks === 'number' ? data.recommendedDurationWeeks : 0);
  const deliveryModel = scenario.deliveryModel || 'Global Delivery (30% Onshore / 70% Offshore)';
  const tcvFormatted = data.deliveryRevenue 
    ? `$${(Math.round(data.deliveryRevenue / 1000) * 1000).toLocaleString()}`
    : `$${(Math.round((totalHours * 115) / 1000) * 1000).toLocaleString()}`;
  const blendedRate = data.blendedBillRate ? `$${Math.round(data.blendedBillRate)}/hr` : '$115/hr';
  const peakFTE = data.peakFTE || (durationWeeks > 0 ? Math.max(4, Math.round(totalHours / (durationWeeks * 40))) : 0);
  const avgFTE = data.avgTotalFTE ?? (durationWeeks > 0 ? Math.round((totalHours / (durationWeeks * 40)) * 10) / 10 : 0);
  const industry = scenario.scaleDrivers?.industry || 'Enterprise Commercial';

  // Module Breakdown
  const selectedModObjs = ORACLE_MODULE_CATALOG.filter(m => scenario.selectedModules.includes(m.id));
  const erpMods = selectedModObjs.filter(m => m.pillar === 'ERP').map(m => m.name);
  const scmMods = selectedModObjs.filter(m => m.pillar === 'SCM').map(m => m.name);
  const hcmMods = selectedModObjs.filter(m => m.pillar === 'HCM').map(m => m.name);
  const otherMods = selectedModObjs.filter(m => !['ERP', 'SCM', 'HCM'].includes(m.pillar)).map(m => m.name);

  // Technical Objects Counts (RICEFW)
  const integrationsCount = scenario.technicalIntegrations?.length || scenario.scaleDrivers?.tech_oic || 8;
  const conversionsCount = scenario.scaleDrivers?.tech_data_objects || 12;
  const mockCycles = scenario.scaleDrivers?.tech_conversion_cycles || 3;
  const reportsCount = (scenario.scaleDrivers?.tech_reports_bip || 10) + (scenario.scaleDrivers?.tech_reports_otbi || 15);
  const extensionsCount = scenario.scaleDrivers?.tech_paas || 2;
  const workflowsCount = scenario.scaleDrivers?.tech_bpm_approval_groups || 4;

  // Technical & Functional Scope Breakdown from Calculation Engine
  const functionalHours = (data.moduleEstimates || []).reduce((sum, m) => sum + m.finalP80Hours, 0);
  const crossWorkstreamHours = Math.max(0, totalHours - functionalHours);

  // RICEFW Exact Hours & Complexity Distributions from Calculation Engine
  const actualIntegrationHours = Math.round(data.technicalWorkstreamEstimate?.integrationsHours ?? (data.workstreamHours?.find(w => w.id === 'ws_tech_oic')?.hours ? data.workstreamHours.find(w => w.id === 'ws_tech_oic')!.hours * 0.55 : integrationsCount * 80 * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualConversionHours = Math.round(data.conversionMetrics?.totalConversionP80Hours ?? (data.workstreamHours?.find(w => w.id === 'ws_data_conv')?.hours || conversionsCount * 45 * (data.complexMultiplier || 1) * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualReportsHours = Math.round(data.technicalWorkstreamEstimate?.reportsHours ?? (((scenario.scaleDrivers?.tech_reports_bip || 0) * 45 + (scenario.scaleDrivers?.tech_reports_otbi || 0) * 18) * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualExtensionsHours = Math.round(data.technicalWorkstreamEstimate?.paasHours ?? ((scenario.scaleDrivers?.tech_paas || 0) * 550 * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualWorkflowsHours = Math.round(((data.technicalWorkstreamEstimate?.workflowsHours || 0) + (data.technicalWorkstreamEstimate?.securityRolesHours || 0)) || (((scenario.scaleDrivers?.tech_workflows || 0) * 55 + (scenario.scaleDrivers?.tech_security_roles || 0) * 35) * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));

  const sInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'S').length ?? 0;
  const mInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'M').length ?? 0;
  const cInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'C').length ?? 0;
  const xlInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'XL').length ?? 0;
  const intComplexityLabel = (sInt + mInt + cInt + xlInt > 0)
    ? `S: ${sInt} | M: ${mInt} | C: ${cInt}${xlInt > 0 ? ` | XL: ${xlInt}` : ''}`
    : 'Simple / Med / Complex';

  const bipCount = scenario.scaleDrivers?.tech_reports_bip || 0;
  const otbiCount = scenario.scaleDrivers?.tech_reports_otbi || 0;
  const reportsComplexityLabel = (bipCount + otbiCount > 0)
    ? `BIP: ${bipCount} | OTBI: ${otbiCount}`
    : 'BIP & OTBI';

  const actualTechFactoryHours = Math.round((data.technicalWorkstreamEstimate?.totalHours || 0) + (data.conversionMetrics?.totalConversionP80Hours || 0)) || Math.round(totalHours * 0.35);

  const getPillarHours = (pillarKey: string) => {
    return (data.moduleEstimates || [])
      .filter(m => {
        if (pillarKey === 'ERP') return m.pillar === 'ERP';
        if (pillarKey === 'SCM') return m.pillar === 'SCM';
        if (pillarKey === 'HCM') return m.pillar === 'HCM';
        return m.pillar !== 'ERP' && m.pillar !== 'SCM' && m.pillar !== 'HCM';
      })
      .reduce((sum, m) => sum + m.finalP80Hours, 0);
  };

  const handleDownloadPptx = async () => {
    try {
      setIsGenerating(true);
      await generateExecutiveSlideDeck(scenario, data);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PowerPoint deck:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const slideTabs = [
    { id: 0, title: '1. Executive Summary', sub: 'Program Thesis & KPIs' },
    { id: 1, title: '2. Solution Architecture', sub: 'Multi-Pillar Scope' },
    { id: 2, title: '3. Scope Demarcation', sub: 'In-Scope vs. Out-of-Scope' },
    { id: 3, title: '4. Technical Objects', sub: 'RICEFW & Mock Scale' },
    { id: 4, title: '5. Gantt & Effort Ledger', sub: 'Roadmap & Stage Gates' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border-2 border-slate-900 shadow-2xl rounded-sm w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-sm bg-indigo-600 text-white shadow-xs">
              <Presentation size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Executive Presentation Deck</h3>
                <span className="px-2 py-0.5 rounded-xs font-mono font-black text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
                  {thorId}
                </span>
                <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  Max 5 Slides Strictly
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct client-ready PowerPoint presentation • Verified True Cloud Method (OUM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPptx}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating .PPTX...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>Downloaded .PPTX!</span>
                </>
              ) : (
                <>
                  <Download size={14} className="stroke-[2.5]" />
                  <span>Download .PPTX (PowerPoint)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Selection Bar / Thumbnails */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            {slideTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentSlide(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-left transition cursor-pointer flex flex-col ${
                  currentSlide === tab.id
                    ? 'bg-white text-indigo-900 border border-indigo-400/80 shadow-xs font-bold ring-1 ring-indigo-500/20'
                    : 'bg-slate-200/70 hover:bg-slate-200 text-slate-700 border border-transparent'
                }`}
              >
                <span className="text-xs font-bold leading-tight">{tab.title}</span>
                <span className="text-[9px] text-slate-500 leading-tight">{tab.sub}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="p-1 rounded-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono font-bold text-slate-600 px-1.5">
              {currentSlide + 1} / 5
            </span>
            <button
              type="button"
              disabled={currentSlide === 4}
              onClick={() => setCurrentSlide(prev => Math.min(4, prev + 1))}
              className="p-1 rounded-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Slide Stage / Live Presentation Preview Canvas (16:9 Aspect Ratio Container) */}
        <div className="flex-1 p-4 sm:p-6 bg-slate-200/60 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-md border-2 border-slate-300 shadow-xl w-full max-w-4xl min-h-[480px] flex flex-col justify-between overflow-hidden">
            
            {/* Slide Header inside Canvas */}
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  {currentSlide === 0 && 'STEP 1: EXECUTIVE THESIS & HIGH-LEVEL COMMERCIALS'}
                  {currentSlide === 1 && 'STEP 2: TARGET ARCHITECTURE & PILLAR SCOPE'}
                  {currentSlide === 2 && 'STEP 3: SCOPE DEMARCATION & CLIENT RESPONSIBILITIES'}
                  {currentSlide === 3 && 'STEP 4: RICEFW INVENTORY & MOCK CONVERSION SCALE'}
                  {currentSlide === 4 && 'STEP 5: PHASED GANTT TIMELINE & EFFORT LEDGER'}
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {currentSlide === 0 && 'Executive Deal Summary & Delivery Thesis'}
                  {currentSlide === 1 && 'Solution Architecture & Multi-Pillar Functional Scope'}
                  {currentSlide === 2 && 'Scope Demarcation: Explicit In-Scope vs. Out-of-Scope Boundaries'}
                  {currentSlide === 3 && 'Technical Objects, RICEFW Inventory & Mock Scale'}
                  {currentSlide === 4 && 'Delivery Roadmap, Phased Gantt & Effort Breakdown'}
                </h4>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-sky-400 bg-slate-800 px-2 py-0.5 rounded-xs border border-slate-700">
                  THOR: {thorId}
                </span>
              </div>
            </div>

            {/* Slide Content Body */}
            <div className="p-6 flex-1 bg-white">
              
              {/* ========================================================================= */}
              {/* SLIDE 1 PREVIEW: Executive Summary                                       */}
              {/* ========================================================================= */}
              {currentSlide === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
                  <div className="space-y-3 bg-slate-50 p-4 rounded-sm border border-slate-200">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span>Engagement Profile</span>
                      <span className="text-[10px] text-indigo-600 font-mono">OUM True Cloud</span>
                    </h5>
                    <div className="space-y-1.5 text-xs">
                      <div><span className="text-slate-500 font-bold">Proposal Name:</span> <span className="font-bold text-slate-900">{scenario.name}</span></div>
                      <div><span className="text-slate-500 font-bold">Industry Sector:</span> <span className="text-slate-800">{industry}</span></div>
                      <div><span className="text-slate-500 font-bold">Target Start:</span> <span className="text-slate-800">{scenario.targetStartDate || 'Immediate Kickoff'}</span></div>
                      <div><span className="text-slate-500 font-bold">Target Go-Live:</span> <span className="text-slate-800">{scenario.clientTargetGoLiveDate || 'Aligned with Standard Schedule'}</span></div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                      <div className="font-bold text-indigo-900 text-[11px]">Scope Breakdown & Architecture:</div>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                        <li><strong>In-Scope Functional Modules:</strong> {selectedModObjs.length} modules ({functionalHours.toLocaleString()} P80 hrs).</li>
                        <li><strong>Cross-Cutting Technical & Governance:</strong> {crossWorkstreamHours.toLocaleString()} P80 hrs.</li>
                        <li><strong>Turnkey Program Total (P80):</strong> {totalHours.toLocaleString()} P80 hrs ({totalMonths} PM).</li>
                        <li>Global blended delivery model with Oracle Certified COE oversight.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-sm">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Total Program Effort</div>
                        <div className="text-xl font-bold font-mono text-indigo-950 mt-0.5">{totalHours.toLocaleString()} hrs</div>
                        <div className="text-[10px] text-indigo-600 mt-0.5">{totalDays} Person-Days ({totalMonths} PM)</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">Project Duration</div>
                        <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{durationWeeks} wks</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Wave 0 ED + Execution</div>
                      </div>
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-sm">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Estimated TCV</div>
                        <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">{tcvFormatted}</div>
                        <div className="text-[10px] text-emerald-600 mt-0.5">Blended Rate: {blendedRate}</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">Peak Squad FTE</div>
                        <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{peakFTE} FTEs</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Avg: {avgFTE} FTE | {deliveryModel}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 text-white rounded-sm space-y-1 text-xs">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>Delivery Assurance & Governance Tier {data.doaTier || 1}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Formal SteerCo cadence, CRP tollgates, and synchronized Oracle quarterly patch freeze windows.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SLIDE 2 PREVIEW: Architecture & Scope                                     */}
              {/* ========================================================================= */}
              {currentSlide === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm text-xs space-y-1">
                      <div className="font-bold text-blue-900 flex items-center justify-between">
                        <span>ERP Financials</span>
                        <span className="font-mono text-[10px] bg-blue-200 px-1 rounded-xs">{erpMods.length} ({getPillarHours('ERP').toLocaleString()}h)</span>
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        {erpMods.length > 0 ? erpMods.slice(0, 4).map((m, i) => <div key={i} className="truncate">• {m}</div>) : 'No modules'}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span>Supply Chain (SCM)</span>
                        <span className="font-mono text-[10px] bg-emerald-200 px-1 rounded-xs">{scmMods.length} ({getPillarHours('SCM').toLocaleString()}h)</span>
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        {scmMods.length > 0 ? scmMods.slice(0, 4).map((m, i) => <div key={i} className="truncate">• {m}</div>) : 'No modules'}
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-sm text-xs space-y-1">
                      <div className="font-bold text-purple-900 flex items-center justify-between">
                        <span>HCM Workforce</span>
                        <span className="font-mono text-[10px] bg-purple-200 px-1 rounded-xs">{hcmMods.length} ({getPillarHours('HCM').toLocaleString()}h)</span>
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        {hcmMods.length > 0 ? hcmMods.slice(0, 4).map((m, i) => <div key={i} className="truncate">• {m}</div>) : 'No modules'}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center justify-between">
                        <span>EPM / CX / Other</span>
                        <span className="font-mono text-[10px] bg-amber-200 px-1 rounded-xs">{otherMods.length} ({getPillarHours('OTHER').toLocaleString()}h)</span>
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        {otherMods.length > 0 ? otherMods.slice(0, 4).map((m, i) => <div key={i} className="truncate">• {m}</div>) : 'Standard Scope'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
                    <div className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Target Solution Architecture & Clean Core Integration Layer
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-indigo-900 text-[11px]">1. Fusion SaaS Core</div>
                        <div className="text-[10px] text-slate-600 mt-1">Multi-GAAP financial ledgers, clean core business flows.</div>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-indigo-900 text-[11px]">2. OIC Integration Fabric</div>
                        <div className="text-[10px] text-slate-600 mt-1">{integrationsCount} interfaces with standard canonical error queues.</div>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-indigo-900 text-[11px]">3. Data & Conversions</div>
                        <div className="text-[10px] text-slate-600 mt-1">{conversionsCount} data objects across {mockCycles} mock load rehearsals.</div>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xs">
                        <div className="font-bold text-indigo-900 text-[11px]">4. Identity & SOD</div>
                        <div className="text-[10px] text-slate-600 mt-1">SSO integration, RBAC duty roles, and BPM approval matrices.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SLIDE 3 PREVIEW: In-Scope vs. Out-of-Scope                                 */}
              {/* ========================================================================= */}
              {currentSlide === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-sm space-y-2 text-xs">
                    <div className="font-extrabold text-emerald-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 size={15} />
                      <span>Explicit In-Scope Deliverables</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-800">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>Wave 0 Enterprise Design:</strong> Chart of accounts (COA) freeze, global enterprise structure, foundation sign-off.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>Functional Configuration:</strong> Complete configuration & CRP iterations for {selectedModObjs.length} Oracle Fusion modules.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>RICEFW Technical Objects:</strong> Build and test of {integrationsCount} integrations, {conversionsCount} conversion objects, and {reportsCount} BI reports.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span><strong>Testing & Go-Live:</strong> Formal SIT cycles, UAT facilitation, cutover execution, and post-go-live hypercare support.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-rose-50/70 border-2 border-rose-300 rounded-sm space-y-2 text-xs">
                    <div className="font-extrabold text-rose-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <XCircle size={15} />
                      <span>Explicit Out-of-Scope & Client Assumptions</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-800">
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✕</span>
                        <span><strong>Zero Core Modifications:</strong> No custom code altering Oracle standard SaaS schema (Clean Core policy).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✕</span>
                        <span><strong>Legacy Data Cleansing:</strong> Source extraction, de-duplication, and cleansing owned by Client prior to staging.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✕</span>
                        <span><strong>Historical Transactions:</strong> Data conversion restricted to opening balances and in-flight records per spec.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✕</span>
                        <span><strong>Client SME Capacity:</strong> Requires dedicated business process owners available at least 50% during CRP and UAT.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SLIDE 4 PREVIEW: Technical Objects (RICEFW)                                */}
              {/* ========================================================================= */}
              {currentSlide === 3 && (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                          <th className="p-2 border border-slate-800 font-bold">RICEFW Category</th>
                          <th className="p-2 border border-slate-800 font-bold">Scope Description</th>
                          <th className="p-2 border border-slate-800 font-bold text-center">Qty</th>
                          <th className="p-2 border border-slate-800 font-bold text-center">Complexity</th>
                          <th className="p-2 border border-slate-800 font-bold text-right">Dev Effort</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-indigo-950">Interfaces (OIC)</td>
                          <td className="p-2 text-slate-700">OIC Cloud Connectors, REST/SOAP APIs, FBDI batch queues</td>
                          <td className="p-2 text-center font-bold font-mono">{integrationsCount}</td>
                          <td className="p-2 text-center text-slate-600 text-[11px]">{intComplexityLabel}</td>
                          <td className="p-2 text-right font-bold font-mono text-slate-900">{actualIntegrationHours.toLocaleString()} hrs</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-indigo-950">Conversions</td>
                          <td className="p-2 text-slate-700">Data objects scaled across {mockCycles} mock load iterations (FBDI / HDL)</td>
                          <td className="p-2 text-center font-bold font-mono">{conversionsCount}</td>
                          <td className="p-2 text-center text-slate-600 text-[11px]">{mockCycles} Mock Cycles</td>
                          <td className="p-2 text-right font-bold font-mono text-slate-900">{actualConversionHours.toLocaleString()} hrs</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-indigo-950">Reports & Analytics</td>
                          <td className="p-2 text-slate-700">BI Publisher operational templates, OTBI real-time dashboards</td>
                          <td className="p-2 text-center font-bold font-mono">{reportsCount}</td>
                          <td className="p-2 text-center text-slate-600 text-[11px]">{reportsComplexityLabel}</td>
                          <td className="p-2 text-right font-bold font-mono text-slate-900">{actualReportsHours.toLocaleString()} hrs</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-indigo-950">Extensions (PaaS)</td>
                          <td className="p-2 text-slate-700">Visual Builder (VBCS) apps, OCI functions, external portals</td>
                          <td className="p-2 text-center font-bold font-mono">{extensionsCount}</td>
                          <td className="p-2 text-center text-slate-600 text-[11px]">Low-Code PaaS</td>
                          <td className="p-2 text-right font-bold font-mono text-slate-900">{actualExtensionsHours.toLocaleString()} hrs</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-indigo-950">Workflows & Rules</td>
                          <td className="p-2 text-slate-700">BPM approval hierarchies, SLA accounting rules, Fast Formulas</td>
                          <td className="p-2 text-center font-bold font-mono">{workflowsCount}</td>
                          <td className="p-2 text-center text-slate-600 text-[11px]">Multi-tiered AME</td>
                          <td className="p-2 text-right font-bold font-mono text-slate-900">{actualWorkflowsHours.toLocaleString()} hrs</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-sm">
                      <div className="font-bold text-indigo-900 text-[11px]">4-Tier Mock Scale</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">Mock 1 schema, Mock 2 volume, Mock 3 SIT, Mock 4 cutover dress rehearsal.</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
                      <div className="font-bold text-slate-900 text-[11px]">Factory Automation</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">Pre-built OIC patterns with automated error replay and string testing.</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm">
                      <div className="font-bold text-emerald-900 text-[11px]">Tech Factory Effort</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">~{actualTechFactoryHours.toLocaleString()} hrs technical effort under Lead Architect.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SLIDE 5 PREVIEW: Gantt Roadmap & Effort Breakdown                         */}
              {/* ========================================================================= */}
              {currentSlide === 4 && (() => {
                const totalWeeksForGantt = Math.max(1, durationWeeks || 28);
                const previewGanttPhases = (data.phaseHours && data.phaseHours.length > 0)
                  ? data.phaseHours.map(ph => {
                      const pct = totalHours > 0 ? Math.round((ph.hours / totalHours) * 100) : 0;
                      let color = 'bg-slate-700';
                      let hexColor = '#334155';
                      if (ph.id.includes('design')) { color = 'bg-blue-800'; hexColor = '#1e3a8a'; }
                      else if (ph.id.includes('build')) { color = 'bg-indigo-700'; hexColor = '#4338ca'; }
                      else if (ph.id.includes('test') || ph.id.includes('sit')) { color = 'bg-teal-700'; hexColor = '#0f766e'; }
                      else if (ph.id.includes('uat')) { color = 'bg-emerald-700'; hexColor = '#047857'; }
                      else if (ph.id.includes('cutover') || ph.id.includes('hypercare')) { color = 'bg-amber-600'; hexColor = '#d97706'; }
                      return {
                        id: ph.id,
                        name: ph.name,
                        startWeek: ph.startWeek,
                        endWeek: ph.endWeek,
                        duration: Math.max(1, ph.endWeek - ph.startWeek + 1),
                        weeks: `W${ph.startWeek} - W${ph.endWeek}`,
                        pct,
                        color,
                        hexColor
                      };
                    })
                  : [
                      { id: 'p1', name: 'Wave 0: Mobilize & Enterprise Design', startWeek: 1, endWeek: 8, duration: 8, weeks: 'W1 - W8', pct: 25, color: 'bg-slate-700', hexColor: '#334155' },
                      { id: 'p2', name: 'Detailed Design & CRP Iterations', startWeek: 9, endWeek: 14, duration: 6, weeks: 'W9 - W14', pct: 15, color: 'bg-blue-800', hexColor: '#1e3a8a' },
                      { id: 'p3', name: 'Build, Integrations & Mock Loads', startWeek: 13, endWeek: 20, duration: 8, weeks: 'W13 - W20', pct: 30, color: 'bg-indigo-700', hexColor: '#4338ca' },
                      { id: 'p4', name: 'System Integration Testing (SIT)', startWeek: 19, endWeek: 22, duration: 4, weeks: 'W19 - W22', pct: 12, color: 'bg-teal-700', hexColor: '#0f766e' },
                      { id: 'p5', name: 'User Acceptance Testing (UAT)', startWeek: 22, endWeek: 24, duration: 3, weeks: 'W22 - W24', pct: 8, color: 'bg-emerald-700', hexColor: '#047857' },
                      { id: 'p6', name: 'Cutover, Go-Live & Hypercare', startWeek: 24, endWeek: 28, duration: 5, weeks: 'W24 - W28', pct: 10, color: 'bg-amber-600', hexColor: '#d97706' }
                    ];

                const rulerFractions = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

                return (
                  <div className="space-y-3.5">
                    <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px] mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Phased Wave Roadmap & Alignment</span>
                          <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-xs">
                            Gantt Chart
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{totalWeeksForGantt} Total Weeks</span>
                      </div>

                      {/* Timeline Ruler Header */}
                      <div className="flex items-center gap-3 mb-2 pb-1.5 border-b border-slate-200">
                        <div className="w-56 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Phase / Workstream Track
                        </div>
                        <div className="flex-1 relative h-5">
                          {rulerFractions.map((frac, fIdx) => {
                            const wNum = fIdx === 0 ? 1 : Math.round(totalWeeksForGantt * frac);
                            return (
                              <div
                                key={fIdx}
                                className="absolute -translate-x-1/2 flex flex-col items-center"
                                style={{ left: `${frac * 100}%` }}
                              >
                                <span className="text-[9px] font-mono font-bold text-slate-600">W{wNum}</span>
                                <div className="w-px h-1.5 bg-slate-300 mt-0.5" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Phase Gantt Rows */}
                      <div className="space-y-2">
                        {previewGanttPhases.map((phase, idx) => {
                          const startFrac = Math.max(0, Math.min(0.96, (phase.startWeek - 1) / totalWeeksForGantt));
                          const endFrac = Math.max(startFrac + 0.04, Math.min(1.0, phase.endWeek / totalWeeksForGantt));
                          const leftPct = startFrac * 100;
                          const widthPct = (endFrac - startFrac) * 100;

                          return (
                            <div key={idx} className="flex items-center gap-3 group">
                              {/* Phase Name & Details */}
                              <div className="w-56 shrink-0 truncate flex items-center justify-between pr-2">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: phase.hexColor }} />
                                  <span className="text-[11px] font-bold text-slate-800 truncate" title={phase.name}>
                                    {phase.name}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-500 shrink-0 font-semibold">
                                  {phase.duration}w
                                </span>
                              </div>

                              {/* Gantt Timeline Track */}
                              <div className="flex-1 relative h-6 bg-slate-100 rounded-xs border border-slate-200/90 overflow-hidden">
                                {/* Vertical Grid Lines */}
                                {[0.2, 0.4, 0.6, 0.8].map((frac, gIdx) => (
                                  <div
                                    key={gIdx}
                                    className="absolute top-0 bottom-0 w-px border-r border-dashed border-slate-200 pointer-events-none"
                                    style={{ left: `${frac * 100}%` }}
                                  />
                                ))}

                                {/* Gantt Bar with Proportional Left Offset & Width */}
                                <div
                                  className={`absolute top-0.5 bottom-0.5 ${phase.color} text-white text-[10px] font-bold px-2 rounded-xs shadow-xs flex items-center justify-center whitespace-nowrap overflow-hidden transition-all group-hover:brightness-110`}
                                  style={{
                                    left: `${leftPct}%`,
                                    width: `${Math.max(widthPct, 5)}%`,
                                    minWidth: '55px'
                                  }}
                                  title={`${phase.name}: Week ${phase.startWeek} to Week ${phase.endWeek} (${phase.duration} weeks • ${phase.pct}% of total program effort)`}
                                >
                                  <span className="truncate">{phase.weeks} ({phase.pct}%)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stage Gate Milestones Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-white border border-slate-200 rounded-xs shadow-2xs">
                        <div className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          Gate 1: ED Sign-Off
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">COA freeze & architecture approved.</div>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-xs shadow-2xs">
                        <div className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          Gate 2: Build Exit
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">Configuration locked & mock 2 verified.</div>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-xs shadow-2xs">
                        <div className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          Gate 3: SIT Exit
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">P1/P2 defect exit criteria met.</div>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-xs shadow-2xs">
                        <div className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          Gate 4: Go-Live
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">UAT signed off & Cutover Go.</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Slide Canvas Footer */}
            <div className="bg-slate-100 px-6 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <div>
                Confidential | {scenario.name} • Oracle True Cloud Method (OUM) Proposal Dossier
              </div>
              <div className="font-bold text-slate-800">
                Slide {currentSlide + 1} of 5
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Validated against Oracle True Cloud standard • 16:9 Widescreen Presentation format
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadPptx}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>Download .PPTX Slide Deck</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
