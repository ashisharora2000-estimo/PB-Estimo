import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  FileCheck,
  Users,
  Award,
  Sparkles,
  Download,
  Calendar,
  Send,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import { SmartsheetExportModal } from '../governance/SmartsheetExportModal';

interface GovernanceViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export const GovernanceView: React.FC<GovernanceViewProps> = ({
  scenario,
  data,
  onUpdateScenario
}) => {
  const [signoffs, setSignoffs] = useState<Record<string, boolean>>({
    'Enterprise Solution Architect': true,
    'Oracle Practice Director': false,
    'Global Delivery VP': false,
    'Commercial & Legal Counsel': false,
    'Executive Deal Review Board': false
  });

  const isBaselineFrozen = scenario.isScheduleFrozen || false;
  const [smartsheetModalOpen, setSmartsheetModalOpen] = useState<boolean>(false);

  const toggleSignoff = (role: string) => {
    const next = { ...signoffs, [role]: !signoffs[role] };
    setSignoffs(next);

    // If all are approved, fire confetti!
    const allApproved = Object.values(next).every(Boolean);
    if (allApproved) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const toggleBaselineFreeze = () => {
    const nextState = !isBaselineFrozen;
    if (onUpdateScenario) {
      onUpdateScenario(prev => ({
        ...prev,
        isScheduleFrozen: nextState,
        scheduleFrozenAt: nextState ? new Date().toISOString() : undefined,
        scheduleFrozenBy: nextState ? 'Senior Delivery Lead & Deal Board' : undefined,
        auditLog: [
          ...(prev.auditLog || []),
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: 'Delivery Lead / SA',
            action: nextState ? 'BASELINE_FROZEN' : 'BASELINE_UNLOCKED',
            details: nextState
              ? `Schedule locked at ${prev.projectWeeks} weeks and ${Math.round(data.targetHours)} hours for Smartsheet initiation.`
              : 'Schedule unlocked for editing and revision.'
          }
        ]
      }));
    }
    if (nextState) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 }
      });
    }
  };

  const approvedCount = Object.values(signoffs).filter(Boolean).length;
  const totalCount = Object.keys(signoffs).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Governance & Delegation of Authority (DoA)
            </span>
            <span className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase rounded-none border ${
              isBaselineFrozen
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {isBaselineFrozen ? 'Baseline 1.0 Locked' : 'Draft / Editable'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Deal Classification, Risk Log & Approval Chain
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Evaluate corporate gating requirements, mitigate high-impact implementation risks, freeze project baselines, and enforce governance controls.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Trigger Smartsheet Plan - Hidden for future release */}

          <button
            onClick={toggleBaselineFreeze}
            className={`px-4 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border ${
              isBaselineFrozen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            {isBaselineFrozen ? (
              <>
                <Lock size={15} className="text-emerald-700" />
                <span>Baseline Locked</span>
              </>
            ) : (
              <>
                <Unlock size={15} />
                <span>Freeze Baseline 1.0</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DoA Tier & Commercial Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DoA Tier Classifier */}
        <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Contract Authority Level
            </span>
            <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold bg-slate-100 border border-slate-200 ${data.doaColor}`}>
              Tier {data.doaTier} Deal
            </span>
          </div>

          <div>
            <h3 className={`text-2xl font-bold tracking-tight ${data.doaColor}`}>
              {data.doaClassification}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {data.doaTier === 3
                ? 'High-impact enterprise transformation requiring Executive Deal Review Board approval due to effort scale (>15,000 hrs), high scale footprint, or elevated data debt complexity.'
                : data.doaTier === 2
                ? 'Mid-tier enterprise engagement requiring Practice VP sign-off and delivery risk review.'
                : 'Standard delivery blueprint adhering to standard risk tolerance and staffing thresholds.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block">Total Effort (P80)</span>
              <span className="font-mono font-bold text-slate-900">{(Math.round(data.targetHours || 0)).toLocaleString()} hrs</span>
            </div>
            <div className="p-2 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block">Staffing Footprint</span>
              <span className="font-mono font-bold text-blue-700">{Math.round(data.targetPersonMonths)} PM</span>
            </div>
            <div className="p-2 rounded-sm bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block">Complexity Score</span>
              <span className="font-mono font-bold text-slate-900">{data.weightedComplexityScore.toFixed(0)}/100</span>
            </div>
          </div>
        </div>

        {/* Recommended Contracting Model */}
        <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Recommended Contracting Structure
              </span>
              <Award size={18} className="text-slate-700" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {data.commercialModel}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Standard fixed-price milestone billing aligned to Oracle True Cloud Method (TCM) quality stage-gates (Enterprise Design CRP2 Sign-off, SIT Exit, UAT Acceptance, and Production Go-Live).
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-medium">Contract Type & Milestone Retention:</span>
            <strong className="text-slate-900 font-mono font-bold">Fixed Price (10% Go-Live + 5% Hypercare Exit Holdback)</strong>
          </div>
        </div>
      </div>

      {/* Dedicated Governance Workstream & Parallel Delivery Integration */}
      {(() => {
        const govWs = data.workstreamHours.find(w => w.id === 'ws_gov_steerco');
        const pmoWs = data.workstreamHours.find(w => w.id === 'ws_pmo_gov');

        return (
          <div className="p-6 rounded-sm bg-slate-900 text-white border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 rounded-sm bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <ShieldCheck size={15} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    Continuous Parallel Workstream Track
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Program Governance & SteerCo Oversight Track
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Executes in parallel continuously across the full lifecycle (Week 1 through Week {scenario.projectWeeks}), establishing executive SteerCo controls, Stage-Gate audit sign-offs, Change Control Board (CCB), and multi-wave sequencing handoffs.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-sm bg-white/5 border border-white/10 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Governance Allocation</span>
                  <span className="text-base font-mono font-bold text-amber-400">
                    {govWs ? (Math.round(govWs.hours || 0)).toLocaleString() : '0'} hrs
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {govWs ? govWs.avgFTE.toFixed(1) : '0'} FTE Parallel Run-Rate
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-sm bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Role Accountability</span>
                <span className="text-xs font-bold text-white block">Program Director / Engagement Lead</span>
                <span className="text-[10px] text-slate-400 block">Executive oversight & partner review</span>
              </div>

              <div className="p-3 rounded-sm bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Parallel Cadence</span>
                <span className="text-xs font-bold text-amber-300 block">Week 1 &ndash; Week {scenario.projectWeeks}</span>
                <span className="text-[10px] text-slate-400 block">Covers All Phases & Hypercare Overlaps</span>
              </div>

              <div className="p-3 rounded-sm bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage-Gate Audit Sign-Offs</span>
                <span className="text-xs font-bold text-emerald-400 block">7 Mandatory TCM Quality Gates</span>
                <span className="text-[10px] text-slate-400 block">Enablement, Design, CRP2, SIT, UAT, Cutover, Handover</span>
              </div>

              <div className="p-3 rounded-sm bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Multi-Wave Sequencing Control</span>
                <span className="text-xs font-bold text-indigo-300 block">
                  {scenario.phaseDeliveryModel === 'hypercare_overlap' ? 'Hypercare Overlap Active' : 'Sequential / Custom'}
                </span>
                <span className="text-[10px] text-slate-400 block">Supervises cross-wave handoffs & entry criteria</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Program Risk Matrix */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Program Risk Assessment & Mitigation Matrix</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Identified delivery failure modes and mandatory pre-emptive controls</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {data.identifiedRisks.length} Risk Vectors Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.identifiedRisks.map((r, i) => (
            <div key={i} className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{r.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none uppercase ${
                  r.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {r.severity} Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                <strong className="text-slate-700 font-semibold">Impact:</strong> {r.impact}
              </p>
              <div className="p-2.5 rounded-sm bg-white border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Mitigation:</strong> {r.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Approval Chain */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Digital Governance Sign-off Chain</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Capture internal stakeholder authorizations prior to commercial bid submission</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
            <Sparkles size={15} />
            <span>Interactive Governance Gate</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(signoffs).map(([role, isApproved]) => (
            <button
              key={role}
              onClick={() => toggleSignoff(role)}
              className={`p-4 rounded-sm border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                isApproved
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <span className={`text-xs font-bold block truncate ${isApproved ? 'text-emerald-900' : 'text-slate-900'}`}>
                  {role}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isApproved ? 'Authorized for Submission' : 'Pending Formal Sign-off'}
                </span>
              </div>

              <div
                className={`p-2 rounded-sm shrink-0 ${
                  isApproved ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isApproved ? <CheckCircle2 size={16} /> : <Lock size={16} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Program Baseline Freeze & Delivery Lead Change Request Policy */}
      <div className="p-6 rounded-sm bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-slate-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Baseline Freeze Policy & Change Request (CR) Gating Protocol
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xs bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              1. Proposal / Bid Freeze Gate
            </span>
            <h4 className="font-bold text-slate-900">Commercial Baseline 1.0</h4>
            <p className="text-slate-600 leading-relaxed">
              Occurs upon Executive Deal Review Board & Solution Architect sign-off. Sizing hours ({Math.round(data.targetHours).toLocaleString()} hrs), duration ({scenario.projectWeeks} wks), and commercial price are locked for RFP inclusion.
            </p>
          </div>

          <div className="p-4 rounded-xs bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              2. Design Freeze Gate (CRP2)
            </span>
            <h4 className="font-bold text-slate-900">TCM Gate 3 Scope Lock</h4>
            <p className="text-slate-600 leading-relaxed">
              At the end of Design CRP2, all MD050 functional designs, RICEFW inventory, and setup workbooks are signed. <strong>Zero ad-hoc changes</strong> are permitted without Delivery Lead & SteerCo ECR approval.
            </p>
          </div>

          <div className="p-4 rounded-xs bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
              3. Baseline Plan Initiation
            </span>
            <h4 className="font-bold text-slate-900">Project Plan Baseline Lock</h4>
            <p className="text-slate-600 leading-relaxed">
              Once frozen, the deterministic date-wise WBS, activity task plans, stage gates, risk logs, and pod runbooks are baseline locked directly with designated owners, milestones, and dependencies.
            </p>
          </div>
        </div>
      </div>

      {/* Smartsheet Export & Project Plan Initiation Modal */}
      <SmartsheetExportModal
        isOpen={smartsheetModalOpen}
        onClose={() => setSmartsheetModalOpen(false)}
        scenario={scenario}
        data={data}
        isBaselineFrozen={isBaselineFrozen}
        onToggleBaselineFreeze={toggleBaselineFreeze}
        onUpdateScenario={onUpdateScenario}
      />
    </div>
  );
};
