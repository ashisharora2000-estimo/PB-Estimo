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
  ClipboardList,
  Check,
  Plus
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { ORACLE_MODULE_CATALOG, ORACLE_PATCH_COHORTS } from '../../data/oraclePhases';
import { exportWbsToCsv, exportCommercialsToCsv } from '../../utils/exporter';
import { generateExecutiveSowMemo } from '../../utils/blueprintAutoFillEngine';

interface ProposalViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onOpenNewProposal?: () => void;
}

export const ProposalView: React.FC<ProposalViewProps> = ({
  scenario,
  data,
  onOpenNewProposal
}) => {
  const [isCopiedMemo, setIsCopiedMemo] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMemo = () => {
    const text = generateExecutiveSowMemo(scenario, data);
    navigator.clipboard.writeText(text);
    setIsCopiedMemo(true);
    setTimeout(() => setIsCopiedMemo(false), 3000);
  };

  const selectedModObjects = ORACLE_MODULE_CATALOG.filter(m => scenario.selectedModules.includes(m.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
              <FileText size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Proposal Brief & Executive RFP Scope
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Client-Ready Implementation Dossier
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Formatted executive proposal brief ready for print, PDF export, or steering committee review.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenNewProposal && (
            <button
              onClick={onOpenNewProposal}
              className="px-3.5 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Create a new implementation proposal"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>New Proposal</span>
            </button>
          )}
          <button
            onClick={handleCopyMemo}
            className="px-3.5 py-2 rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Copy formatted Executive RFP Scope & Pricing Memo to Clipboard"
          >
            {isCopiedMemo ? <Check size={14} className="text-emerald-600" /> : <ClipboardList size={14} className="text-indigo-600" />}
            <span>{isCopiedMemo ? 'Memo Copied!' : 'Copy RFP Memo'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
          >
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={() => exportWbsToCsv(scenario, data)}
            className="px-3.5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export WBS</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Dossier Document */}
      <div className="bg-white text-slate-900 rounded-sm p-8 sm:p-12 shadow-xs max-w-4xl mx-auto space-y-8 font-sans border border-slate-200">
        {/* Cover Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Oracle Cloud Transformation Proposal Brief
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {scenario.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Oracle Fusion Cloud Implementation Schedule, Effort Estimation & Commercial Delivery Blueprint
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 rounded-none text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Oracle True Cloud Method (OUM)
            </span>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Executive Highlights Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-sm border border-slate-200">
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
              <div key={mod.id} className="p-2.5 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between">
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
            <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Supply Chain Footprint</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {scenario.scaleDrivers.scm_plants} Plants / {scenario.scaleDrivers.scm_wh} 3PL Hubs / {scenario.scaleDrivers.scm_inv} Orgs
              </strong>
            </div>
            <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Financial Hierarchy</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {scenario.scaleDrivers.fin_ent} Legal Entities / {scenario.scaleDrivers.fin_led} Ledgers
              </strong>
            </div>
            <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Technical / OIC</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {scenario.scaleDrivers.tech_oic} Integrations / {scenario.scaleDrivers.tech_paas} PaaS Apps
              </strong>
            </div>
            <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Data & Reports</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {scenario.scaleDrivers.tech_data_objects} Data Objects / {(scenario.scaleDrivers.tech_reports_bip || 0) + (scenario.scaleDrivers.tech_reports_otbi || 0)} Reports ({scenario.scaleDrivers.tech_reports_bip} BIP + {scenario.scaleDrivers.tech_reports_otbi || 0} OTBI)
              </strong>
            </div>
            <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Oracle Pod Cohort</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {ORACLE_PATCH_COHORTS[scenario.podCohort].name.split(' ')[0]} {ORACLE_PATCH_COHORTS[scenario.podCohort].name.split(' ')[1]}
              </strong>
            </div>
            <div className="p-3 rounded-sm bg-slate-50 border border-slate-200">
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

        {/* Section 5: Senior Leadership Review - 5 Scheduling & Sizing Gaps */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center justify-between">
            <span>5. Senior Leadership Oversight & Feasibility Brief (5 Gaps)</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded-xs">
              Score: {data.leadershipGaps.executiveSummary.scheduleFeasibilityScore}/100
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                1. Critical Path (CPM) Float
              </div>
              <p className="text-slate-600">
                <strong>{data.leadershipGaps.criticalPath.zeroFloatActivitiesCount} Zero-Float Tasks</strong> on the deterministic critical path. Total buffer of {data.leadershipGaps.criticalPath.totalBufferDays} days distributed across non-critical training and reporting streams.
              </p>
            </div>

            <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                2. Pod Landscape & Patch Cohort
              </div>
              <p className="text-slate-600">
                <strong>5 Isolated Pods</strong> (DEV1, DEV2, TEST, STAGE, PROD) with {data.leadershipGaps.environmentLandscape.totalP2TRefreshes} scheduled P2T refreshes aligned with Oracle Cohort {scenario.podCohort} maintenance.
              </p>
            </div>

            <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                3. 72-Hour Cutover Weekend
              </div>
              <p className="text-slate-600">
                <strong>{data.leadershipGaps.dataCutover.cutoverEstimatedTotalHours}h Estimated Execution</strong> against the 72.0h weekend SLA window (<strong>+{data.leadershipGaps.dataCutover.cutoverContingencyBufferHours}h contingency buffer</strong>) proven through 3 mandatory mock cycles.
              </p>
            </div>

            <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                4. Risk-Adjusted Contingency (P80 Baseline)
              </div>
              <p className="text-slate-600">
                Calibrated 4-factor risk model establishes <strong>P80 Defensible Target of {(data?.leadershipGaps?.monteCarlo?.p80_DefensibleTarget?.hours || 0).toLocaleString()} hrs</strong> with +{(data?.leadershipGaps?.monteCarlo?.recommendedReserveHours || 0).toLocaleString()}h (+{((data.leadershipGaps.monteCarlo.recommendedReserveHours) / 160).toFixed(1)} PM) contingency reserve protecting against legacy data debt and client review latency.
              </p>
            </div>
          </div>

          {/* SME Backfill Banner */}
          <div className="p-3.5 rounded-sm bg-purple-50 border border-purple-200 text-xs text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="block text-purple-900 font-bold uppercase text-[10px]">
                5. Client SME Operational Backfill Demand
              </strong>
              <span>
                Peak Client SME commitment reaches <strong>{data.leadershipGaps.coStaffing.peakClientFTE} FTEs (80% dedication)</strong> during Business Test 2 (UAT).
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">Total Client Co-Staffing</span>
              <span className="font-mono font-bold text-purple-950 text-sm">
                {(data?.leadershipGaps?.coStaffing?.totalClientEffortHours || 0).toLocaleString()} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Section 6: Delivery Mix & Staffing Model */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
            6. Global Delivery Architecture & Staffing Model
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Staffing leverage is achieved through a balanced delivery pyramid consisting of <strong>{scenario.deliveryMix.onshore}% Onshore</strong> (Solution Architects and PMO), <strong>{scenario.deliveryMix.nearshore}% Nearshore</strong> (Functional Leads), and <strong>{scenario.deliveryMix.offshore}% Offshore</strong> (OIC Developers, Data Specialists, and Test Automation).
          </p>
          <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 text-xs text-slate-800 flex justify-between items-center">
            <div>
              <strong>Staffing Concurrency Model:</strong> {scenario.deliveryModel || 'Global Blended (30/70)'}
            </div>
            <div className="text-right">
              <strong>Peak Delivery Staffing:</strong> <span className="font-mono font-bold text-blue-700">{data.totalFTE.toFixed(1)} FTEs</span>
            </div>
          </div>
        </div>

        {/* Signatures Block */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-4">
            <div className="font-bold text-slate-900">Submitted on behalf of Delivery Practice:</div>
            <div className="h-12 border-b border-slate-300 flex items-end font-serif italic text-slate-600">
              Enterprise Solution Architect
            </div>
            <div className="text-[10px] text-slate-500">Signature / Date</div>
          </div>

          <div className="space-y-4">
            <div className="font-bold text-slate-900">Accepted & Authorized by Client Sponsor:</div>
            <div className="h-12 border-b border-slate-300 flex items-end font-serif italic text-slate-600">
              Executive Project Sponsor
            </div>
            <div className="text-[10px] text-slate-500">Signature / Date</div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100 font-mono">
          PB-Estimo Oracle Implementation Platform &bull; Confidential &bull; Generated Document
        </div>
      </div>
    </div>
  );
};
