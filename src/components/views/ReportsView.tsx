import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  DollarSign,
  ShieldCheck,
  Building2,
  Grid,
  Sparkles,
  Tag,
  Play,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Sliders,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  Plus,
  Presentation
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule, TShirtSize } from '../../types';
import { ORACLE_MODULE_CATALOG, ORACLE_PATCH_COHORTS } from '../../data/oraclePhases';
import { exportWbsToCsv, exportCommercialsToCsv, exportScopingSummaryCsv } from '../../utils/exporter';
import { generateExecutiveSlideDeck } from '../../utils/executivePptxGenerator';
import { TShirtBadge, T_SHIRT_CONFIG } from '../common/TShirtBadge';
import { ModuleTShirtMatrix } from '../common/ModuleTShirtMatrix';
import { getQuestionsForModule, ModuleScopingQuestion } from '../../data/moduleScopingQuestions';
import { ReportSubSectionId, REPORT_SUB_ITEMS } from '../Sidebar';

interface ReportsViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  activeSubSection?: ReportSubSectionId;
  onSelectSubSection?: (sub: ReportSubSectionId) => void;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenNewProposal?: () => void;
  onOpenSlideDeck?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  scenario,
  data,
  activeSubSection = 'sow_brief',
  onSelectSubSection,
  onUpdateScenario,
  onOpenNewProposal,
  onOpenSlideDeck
}) => {
  // Local state for 20-Q Matrix and Interview views
  const [selectedModId, setSelectedModId] = useState<OracleModule>(
    (scenario.selectedModules[0] as OracleModule) || 'erp_gl'
  );
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('all');
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState<number>(0);
  const [catalogPillarTab, setCatalogPillarTab] = useState<'ALL' | 'ERP' | 'SCM' | 'HCM' | 'EPM' | 'CX'>('ALL');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  const selectedModObjects = ORACLE_MODULE_CATALOG.filter(m => scenario.selectedModules.includes(m.id));

  // Category Color Helper
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Process Scope':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Integrations & Feeds':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Data & Conversions':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approvals & Workflows':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Reporting & Analytics':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Compliance & Security':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const currentQuestions = getQuestionsForModule(selectedModId);
  const currentAnswers = scenario.moduleQuestionAnswers?.[selectedModId] || Array(20).fill(1);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Header & Export Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="p-1 rounded-sm bg-slate-900 text-white">
              <FileText size={14} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Executive Reports & Portfolio Dossier
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {activeSubSection === 'sow_brief' && '1. Executive RFP Brief'}
            {activeSubSection === 'scoping_table' && '2. Scoping Sheet Summary & Effort Ledger'}
            {activeSubSection === 'matrix_20q' && '3. 20-Question Functional Scoping Matrix'}
            {activeSubSection === 'catalog_scale' && '4. Module Catalog & Scale Topology Footprint'}
            {activeSubSection === 'tshirt_portfolio' && '5. Enterprise T-Shirt Sizing Portfolio'}
            {activeSubSection === 'interview_view' && '6. Guided 20-Q Scoping Interview Dossier'}
            {activeSubSection === 'wbs_breakdown' && '7. Work Breakdown Structure (WBS) Spec'}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSlideDeck ? (
            <button
              type="button"
              onClick={onOpenSlideDeck}
              className="px-3.5 py-1.5 rounded-none bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-500"
              title="Open / Download Executive 5-Slide PowerPoint Deck"
            >
              <Presentation size={14} className="stroke-[2.5]" />
              <span>Executive Slide Deck (PPTX)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => generateExecutiveSlideDeck(scenario, data)}
              className="px-3.5 py-1.5 rounded-none bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-500"
              title="Download Executive 5-Slide PowerPoint Deck"
            >
              <Presentation size={14} className="stroke-[2.5]" />
              <span>Executive Slide Deck (PPTX)</span>
            </button>
          )}
          {onOpenNewProposal && (
            <button
              type="button"
              onClick={onOpenNewProposal}
              className="px-3.5 py-1.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Create a new implementation proposal"
            >
              <Plus size={13} className="stroke-[2.5]" />
              <span>New Proposal</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer size={13} />
            <span>Print / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => exportWbsToCsv(scenario, data)}
            className="px-3 py-1.5 rounded-none bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <Download size={13} />
            <span>Export WBS</span>
          </button>
          <button
            type="button"
            onClick={() => exportCommercialsToCsv(scenario, data)}
            className="px-3 py-1.5 rounded-none bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <DollarSign size={13} />
            <span>Export Commercials</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-SECTION 1: EXECUTIVE RFP BRIEF (Printable Dossier)                    */}
      {/* ========================================================================= */}
      {activeSubSection === 'sow_brief' && (
        <div className="bg-white text-slate-900 rounded-sm p-6 sm:p-10 shadow-xs max-w-4xl mx-auto space-y-8 font-sans border border-slate-200">
          {/* Cover Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Oracle Cloud Transformation Proposal Brief
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {scenario.name}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Oracle Fusion Cloud Implementation Schedule, Effort Estimation & Commercial Delivery Blueprint
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-none text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Oracle True Cloud Method (OUM)
              </span>
              <div className="text-xs text-slate-500 mt-2 font-mono">
                Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Executive Highlights Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-none border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Program Effort</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{Math.round(data.targetPersonMonths)} <span className="text-xs font-normal text-slate-500">PM</span></span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Target Effort (P80)</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{(Math.round(data.targetHours || 0)).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span></span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Project Duration</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{scenario.projectWeeks} <span className="text-xs font-normal text-slate-500">wks</span></span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Delivery Model</span>
              <span className="text-sm font-bold text-slate-900 block mt-1">{scenario.deliveryModel || 'Global Blended (30/70)'}</span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              1. Executive Summary & Solution Architecture
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              This proposal outlines the delivery architecture for <strong>{scenario.name}</strong> utilizing the Oracle True Cloud Method. The engagement scope spans <strong>{scenario.selectedModules.length} Oracle Fusion Cloud modules</strong> across Financials, Supply Chain, Human Capital, EPM, and technical integration layers.
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              Based on scale sizing drivers and a comprehensive 5-pillar risk evaluation (Complexity Score: <strong>{data.weightedComplexityScore.toFixed(0)}/100</strong>), the defensible P80 delivery effort is estimated at <strong>{(Math.round(data.targetHours || 0)).toLocaleString()} hours ({Math.round(data.targetPersonMonths)} person-months)</strong> with a target project duration of <strong>{scenario.projectWeeks} weeks</strong>.
            </p>
          </div>

          {/* Section 2: Module Footprint & Scope */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              2. In-Scope Oracle Fusion Module Catalog
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
              {selectedModObjects.map((mod) => (
                <div key={mod.id} className="p-2.5 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{mod.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{mod.pillar}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Physical Scale Baseline */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              3. Operational Scale & Complexity Topology
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Supply Chain Footprint</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  {scenario.scaleDrivers.scm_plants} Plants / {scenario.scaleDrivers.scm_wh} 3PL Hubs / {scenario.scaleDrivers.scm_inv} Orgs
                </strong>
              </div>
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Financial Hierarchy</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  {scenario.scaleDrivers.fin_ent} Legal Entities / {scenario.scaleDrivers.fin_led} Ledgers
                </strong>
              </div>
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Technical / OIC</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  {scenario.scaleDrivers.tech_oic} Integrations / {scenario.scaleDrivers.tech_paas} PaaS Apps
                </strong>
              </div>
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Data & Reports</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  {scenario.scaleDrivers.tech_data_objects} Data Objects / {(scenario.scaleDrivers.tech_reports_bip || 0) + (scenario.scaleDrivers.tech_reports_otbi || 0)} Reports ({scenario.scaleDrivers.tech_reports_bip} BIP + {scenario.scaleDrivers.tech_reports_otbi || 0} OTBI)
                </strong>
              </div>
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Oracle Pod Cohort</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  {ORACLE_PATCH_COHORTS[scenario.podCohort].name.split(' ')[0]} {ORACLE_PATCH_COHORTS[scenario.podCohort].name.split(' ')[1]}
                </strong>
              </div>
              <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Governance Tier</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  Tier {data.doaTier} Deal ({data.doaClassification})
                </strong>
              </div>
            </div>
          </div>

          {/* Section 4: Implementation Schedule & Phases */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              4. Lifecycle Phase & Milestone Roadmap
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-2">Phase</th>
                    <th className="py-2.5 px-2">Timeline</th>
                    <th className="py-2.5 px-2 text-right">Target Effort</th>
                    <th className="py-2.5 px-2">Key Quality Deliverables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.phaseHours.map((ph) => (
                    <tr key={ph.id}>
                      <td className="py-2.5 px-2 font-semibold text-slate-900">{ph.name}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600">Week {ph.startWeek} - {ph.endWeek}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900">{(Math.round(ph.hours || 0)).toLocaleString()} hrs</td>
                      <td className="py-2.5 px-2 text-[11px] text-slate-600">{ph.deliverables.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 2: SCOPING SHEET SUMMARY & EFFORT LEDGER                      */}
      {/* ========================================================================= */}
      {activeSubSection === 'scoping_table' && (
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                In-Scope Module Scoping & T-Shirt Ledger
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete audit breakdown of module base hours, 20-question scoping effort, scale drivers, and P80 defensible estimates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-none w-48 focus:outline-none"
              />
            </div>
          </div>

          {/* Module Table */}
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2.5">Module Name</th>
                  <th className="p-2.5">Pillar</th>
                  <th className="p-2.5 text-center">T-Shirt Size</th>
                  <th className="p-2.5 text-center">20-Q Depth</th>
                  <th className="p-2.5 text-right">Base Hrs</th>
                  <th className="p-2.5 text-right">Scoping Hrs</th>
                  <th className="p-2.5 text-right">Scale Hrs</th>
                  <th className="p-2.5 text-right">P80 Defensible</th>
                  <th className="p-2.5 text-center">Staffing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {(data.moduleEstimates || [])
                  .filter(m => scenario.selectedModules.includes(m.moduleId))
                  .filter(m => !tableSearchQuery || m.moduleName.toLowerCase().includes(tableSearchQuery.toLowerCase()) || m.pillar.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                  .map((m, idx) => (
                    <tr key={m.moduleId} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                      <td className="p-2.5 font-bold text-slate-900">{m.moduleName}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{m.pillar}</td>
                      <td className="p-2.5 text-center">
                        <TShirtBadge size={m.tShirtSize} score={m.tShirtScore} showScore />
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                        {m.questionnaireAvgScore.toFixed(2)}/4.0
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-600">{m.baseHours}h</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">+{m.scopingHours}h</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">+{m.scaleAttributedHours}h</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {(m.finalP80Hours || 0).toLocaleString()} hrs
                      </td>
                      <td className="p-2.5 text-center font-mono text-[11px] text-indigo-700 font-bold">
                        {m.personMonths} PM ({m.avgFTE} FTE)
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-bold text-xs">
                  <td colSpan={7} className="p-3 text-left">
                    Total: {scenario.selectedModules.length} Modules in Scope
                  </td>
                  <td className="p-3 text-right text-amber-300 text-sm">
                    {(data.p80_DefensibleHours || data.targetHours || 0).toLocaleString()} hrs
                  </td>
                  <td className="p-3 text-center text-slate-200">
                    {(data.targetPersonMonths || 0).toFixed(1)} PM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 3: 20-QUESTION FUNCTIONAL SCOPING MATRIX                      */}
      {/* ========================================================================= */}
      {activeSubSection === 'matrix_20q' && (
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                20-Question Functional Scoping Matrix
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Comprehensive 20-point architectural deep-dive across all 6 core functional categories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Module:</span>
              <select
                value={selectedModId}
                onChange={(e) => setSelectedModId(e.target.value as OracleModule)}
                className="text-xs font-bold bg-white border border-slate-300 rounded-none px-3 py-1.5 text-slate-900 focus:outline-none"
              >
                {scenario.selectedModules.map(modId => {
                  const def = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
                  return <option key={modId} value={modId}>{def?.name || modId}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
            {[
              'all',
              'Process Scope',
              'Integrations & Feeds',
              'Data & Conversions',
              'Approvals & Workflows',
              'Reporting & Analytics',
              'Compliance & Security'
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setMatrixCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  matrixCategoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All 20 Questions' : cat}
              </button>
            ))}
          </div>

          {/* Questions Grid */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {currentQuestions
              .filter(q => matrixCategoryFilter === 'all' || q.category === matrixCategoryFilter)
              .map((q) => {
                const originalIdx = currentQuestions.findIndex(item => item.id === q.id);
                const selectedOptIdx = currentAnswers[originalIdx] !== undefined ? currentAnswers[originalIdx] : 1;
                const qMeta = scenario.questionConfidenceMeta?.[selectedModId]?.[originalIdx];

                return (
                  <div key={q.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {originalIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {q.question}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getCategoryColor(q.category)}`}>
                        {q.category}
                      </span>
                    </div>

                    {q.rationale && (
                      <p className="text-[11px] text-slate-600 italic pl-7">
                        Architectural Rationale: {q.rationale}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOptIdx === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 border text-left flex flex-col justify-between ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                  {opt.label}
                                </span>
                                {isSelected && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
                              </div>
                              <p className={`text-[10px] leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {opt.desc}
                              </p>
                            </div>
                            <div className="mt-2 pt-1 border-t border-slate-200/30 flex items-center justify-between text-[9px] font-mono">
                              <span>C{opt.score}</span>
                              <span className={isSelected ? 'text-amber-300' : 'text-slate-500'}>
                                {opt.score === 1 ? 'MBP (C1)' : opt.score === 2 ? 'Std (C2)' : opt.score === 3 ? 'Comp (C3)' : 'Cust (C4)'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 4: MODULE CATALOG & SCALE TOPOLOGY FOOTPRINT                  */}
      {/* ========================================================================= */}
      {activeSubSection === 'catalog_scale' && (
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Oracle Fusion Module Catalog & Scale Topology
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Full enterprise catalog across ERP, SCM, HCM, EPM, and CX with baseline hours and scope status.
              </p>
            </div>
            <div className="flex items-center gap-1">
              {(['ALL', 'ERP', 'SCM', 'HCM', 'EPM', 'CX'] as const).map((pillar) => (
                <button
                  key={pillar}
                  type="button"
                  onClick={() => setCatalogPillarTab(pillar)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    catalogPillarTab === pillar
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pillar}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ORACLE_MODULE_CATALOG
              .filter(m => catalogPillarTab === 'ALL' || m.pillar === catalogPillarTab)
              .map((mod) => {
                const isInScope = scenario.selectedModules.includes(mod.id);
                const estimate = data.moduleEstimates?.find(m => m.moduleId === mod.id);

                return (
                  <div
                    key={mod.id}
                    className={`p-3.5 border rounded-none flex flex-col justify-between ${
                      isInScope
                        ? 'bg-slate-50 border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-slate-900">{mod.name}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-200 text-slate-700">
                          {mod.pillar}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mb-2">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-slate-500">Base: {mod.baseEffortHours}h</span>
                      {isInScope && estimate ? (
                        <div className="flex items-center gap-1.5">
                          <TShirtBadge size={estimate.tShirtSize} score={estimate.tShirtScore} showScore />
                          <span className="font-bold text-slate-900">{(estimate.finalP80Hours || 0).toLocaleString()}h</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 uppercase font-sans">Out of Scope</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 5: ENTERPRISE T-SHIRT SIZING PORTFOLIO                        */}
      {/* ========================================================================= */}
      {activeSubSection === 'tshirt_portfolio' && (
        <div className="space-y-4">
          <ModuleTShirtMatrix
            data={data}
            onOpenModuleInterview={(modId) => {
              setSelectedModId(modId as OracleModule);
              if (onSelectSubSection) {
                onSelectSubSection('interview_view');
              }
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 6: GUIDED 20-Q SCOPING INTERVIEW DOSSIER                      */}
      {/* ========================================================================= */}
      {activeSubSection === 'interview_view' && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Guided 20-Question Scoping Interview Walkthrough
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Review specific scoping responses, confidence benchmarks, and rationale for any module.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Module:</span>
              <select
                value={selectedModId}
                onChange={(e) => {
                  setSelectedModId(e.target.value as OracleModule);
                  setInterviewQuestionIndex(0);
                }}
                className="text-xs font-bold bg-white border border-slate-300 px-3 py-1.5 text-slate-900 focus:outline-none"
              >
                {scenario.selectedModules.map(modId => {
                  const def = ORACLE_MODULE_CATALOG.find(m => m.id === modId);
                  return <option key={modId} value={modId}>{def?.name || modId}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Question Index Pills */}
          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
            {currentQuestions.map((q, idx) => {
              const ans = (currentAnswers[idx] || 0) + 1;
              const isCurrent = idx === interviewQuestionIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInterviewQuestionIndex(idx)}
                  className={`h-7 text-[10px] font-mono font-bold transition flex items-center justify-center cursor-pointer border ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400'
                      : ans === 1
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : ans === 2
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : ans === 3
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  Q{idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Focus Display */}
          {(() => {
            const q = currentQuestions[interviewQuestionIndex] || currentQuestions[0];
            const currentSelectedOpt = currentAnswers[interviewQuestionIndex] !== undefined ? currentAnswers[interviewQuestionIndex] : 1;

            return (
              <div className="bg-slate-50 border border-slate-300 p-6 space-y-4 rounded-none">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(q.category)}`}>
                    {q.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Question {interviewQuestionIndex + 1} of 20
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">
                  {q.question}
                </h4>

                {q.rationale && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900 rounded-none">
                    <strong>Architectural Rationale:</strong> {q.rationale}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = currentSelectedOpt === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`p-4 border text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs">{opt.label}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              C{opt.score}
                            </span>
                          </div>
                          <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={interviewQuestionIndex === 0}
                    onClick={() => setInterviewQuestionIndex(prev => Math.max(0, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    Previous Question
                  </button>
                  <button
                    type="button"
                    disabled={interviewQuestionIndex === 19}
                    onClick={() => setInterviewQuestionIndex(prev => Math.min(19, prev + 1))}
                    className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 7: WORK BREAKDOWN STRUCTURE (WBS) SPEC                        */}
      {/* ========================================================================= */}
      {activeSubSection === 'wbs_breakdown' && (
        <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Phase-by-Phase Work Breakdown Structure (WBS)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Lifecycle phases, deliverable catalogs, duration timelines, and resource effort allocations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportWbsToCsv(scenario, data)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <Download size={13} />
              <span>Export WBS CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2.5">Phase Code & Name</th>
                  <th className="p-2.5">Timeline</th>
                  <th className="p-2.5 text-right">Target Effort</th>
                  <th className="p-2.5 text-right">Person Months</th>
                  <th className="p-2.5">Key Deliverables</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.phaseHours.map((ph, idx) => (
                  <tr key={ph.id} className={`hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                    <td className="p-2.5 font-bold text-slate-900">{ph.name}</td>
                    <td className="p-2.5 font-mono text-slate-600">Week {ph.startWeek} - {ph.endWeek}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {(Math.round(ph.hours || 0)).toLocaleString()} hrs
                    </td>
                    <td className="p-2.5 text-right font-mono text-indigo-700 font-bold">
                      {((ph.hours || 0) / 160).toFixed(1)} PM
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-600">{ph.deliverables.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-bold text-xs">
                  <td colSpan={2} className="p-3 text-left">
                    Total Project Duration: {scenario.projectWeeks} Weeks
                  </td>
                  <td className="p-3 text-right text-amber-300 text-sm">
                    {(data.p80_DefensibleHours || data.targetHours || 0).toLocaleString()} hrs
                  </td>
                  <td className="p-3 text-right text-indigo-300">
                    {(data.targetPersonMonths || 0).toFixed(1)} PM
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
