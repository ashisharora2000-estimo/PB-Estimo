import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  Check,
  UserCheck
} from 'lucide-react';
import { NavTabId } from '../Sidebar';

export type UserRolePreset = 'all' | 'architect' | 'commercial' | 'executive';

export interface GuidedStep {
  id: NavTabId;
  stepNumber: number;
  stageNumber: number;
  stageName: string;
  label: string;
  sub: string;
  roles: UserRolePreset[];
}

export const WORKFLOW_STEPS: GuidedStep[] = [
  {
    id: 'dashboard',
    stepNumber: 0,
    stageNumber: 0,
    stageName: 'Executive Command',
    label: 'Command Hub',
    sub: 'Executive Overview',
    roles: ['all', 'executive']
  },
  {
    id: 'discovery',
    stepNumber: 1,
    stageNumber: 1,
    stageName: 'Stage 1: Scope & Demarcation',
    label: 'Scope & Architecture',
    sub: 'Modules & Footprint',
    roles: ['all', 'architect']
  },
  {
    id: 'multivendor',
    stepNumber: 2,
    stageNumber: 1,
    stageName: 'Stage 1: Scope & Demarcation',
    label: 'Multi-Vendor Split',
    sub: 'RACI & Demarcation',
    roles: ['all', 'architect']
  },
  {
    id: 'estimation',
    stepNumber: 3,
    stageNumber: 2,
    stageName: 'Stage 2: Effort & Timeline',
    label: 'Estimation Engine',
    sub: 'Complexity & Hours',
    roles: ['all', 'architect', 'commercial']
  },
  {
    id: 'schedule',
    stepNumber: 4,
    stageNumber: 2,
    stageName: 'Stage 2: Effort & Timeline',
    label: 'Schedule & Gantt',
    sub: '30-Col WBS & Waves',
    roles: ['all', 'architect']
  },
  {
    id: 'leadership',
    stepNumber: 5,
    stageNumber: 2,
    stageName: 'Stage 2: Effort & Timeline',
    label: 'Leadership Review',
    sub: '5 Delivery Gaps Audit',
    roles: ['all', 'executive']
  },
  {
    id: 'commercial',
    stepNumber: 6,
    stageNumber: 3,
    stageName: 'Stage 3: Pricing & Governance',
    label: 'Commercials & P&L',
    sub: 'Pyramid, Mix & Margin',
    roles: ['all', 'commercial']
  },
  {
    id: 'governance',
    stepNumber: 7,
    stageNumber: 3,
    stageName: 'Stage 3: Pricing & Governance',
    label: 'Governance & DoA',
    sub: 'Tier Sign-off & Audit',
    roles: ['all', 'commercial']
  },
  {
    id: 'reports',
    stepNumber: 8,
    stageNumber: 3,
    stageName: 'Stage 3: Pricing & Governance',
    label: 'Proposal Dossier & SOW',
    sub: 'Final SOW & Exports',
    roles: ['all', 'commercial', 'executive']
  }
];

interface GuidedWorkflowFooterProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  rolePreset?: UserRolePreset;
  onSelectRolePreset?: (role: UserRolePreset) => void;
}

export const GuidedWorkflowFooter: React.FC<GuidedWorkflowFooterProps> = ({
  activeTab,
  onSelectTab,
  rolePreset = 'all',
  onSelectRolePreset
}) => {
  // Filter steps by role preset if not 'all'
  const filteredSteps = React.useMemo(() => {
    if (rolePreset === 'all') return WORKFLOW_STEPS;
    return WORKFLOW_STEPS.filter(
      step => step.id === 'dashboard' || (step.roles as readonly string[]).includes(rolePreset)
    );
  }, [rolePreset]);

  const currentIndex = filteredSteps.findIndex(s => s.id === activeTab);
  const currentStep = currentIndex >= 0 ? filteredSteps[currentIndex] : null;

  const prevStep = currentIndex > 0 ? filteredSteps[currentIndex - 1] : null;
  const nextStep =
    currentIndex >= 0 && currentIndex < filteredSteps.length - 1
      ? filteredSteps[currentIndex + 1]
      : null;

  if (!currentStep) return null;

  return (
    <nav aria-label="Proposal Workflow Navigation" className="w-full bg-white border border-slate-200 rounded-sm shadow-xs p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-6 select-none">
      {/* Left: Previous Button */}
      <div className="w-full sm:w-auto flex items-center justify-start">
        {prevStep ? (
          <button
            type="button"
            onClick={() => onSelectTab(prevStep.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer border border-slate-200 group w-full sm:w-auto justify-center"
            title={`Go back to ${prevStep.label}`}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Previous</span>
              <span className="text-xs font-bold text-slate-900 truncate max-w-[140px] block">
                {prevStep.label}
              </span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-slate-50 text-slate-400 font-medium cursor-default border border-slate-100 w-full sm:w-auto justify-center"
            disabled
          >
            <LayoutDashboard size={14} />
            <span>Workflow Start</span>
          </button>
        )}
      </div>

      {/* Center: Stage Progress Tracker */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-xs font-mono font-bold text-[10px] uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {currentStep.stageName}
          </span>
          <span className="text-slate-400 font-mono text-[10px]">
            Step {currentIndex + 1} of {filteredSteps.length}
          </span>
        </div>

        {/* 3-Stage Visual Pipeline Bar */}
        <div className="flex items-center gap-1 mt-0.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              currentStep.stageNumber >= 1 ? 'w-12 bg-indigo-600' : 'w-6 bg-slate-200'
            }`}
            title="Stage 1: Scope & Demarcation"
          />
          <div
            className={`h-1.5 rounded-full transition-all ${
              currentStep.stageNumber >= 2 ? 'w-12 bg-amber-500' : 'w-6 bg-slate-200'
            }`}
            title="Stage 2: Effort & Timeline"
          />
          <div
            className={`h-1.5 rounded-full transition-all ${
              currentStep.stageNumber >= 3 ? 'w-12 bg-emerald-600' : 'w-6 bg-slate-200'
            }`}
            title="Stage 3: Pricing & Governance"
          />
        </div>

        {/* Active Tab Label */}
        <div className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
          <span>Active:</span>
          <span className="text-indigo-700 underline underline-offset-2 decoration-indigo-300">
            {currentStep.label}
          </span>
        </div>
      </div>

      {/* Right: Next Button */}
      <div className="w-full sm:w-auto flex items-center justify-end">
        {nextStep ? (
          <button
            type="button"
            onClick={() => onSelectTab(nextStep.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold transition-all shadow-xs cursor-pointer group w-full sm:w-auto justify-center"
            title={`Advance to ${nextStep.label}`}
          >
            <div className="text-right leading-tight">
              <span className="text-[10px] text-slate-300 font-mono block uppercase">
                Next Step &bull; {nextStep.stageName.split(':')[0]}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[160px] block">
                {nextStep.label}
              </span>
            </div>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-amber-400 stroke-[2.5]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs cursor-pointer w-full sm:w-auto justify-center"
            title="Proposal complete! Return to Executive Command Hub"
          >
            <CheckCircle2 size={15} className="text-emerald-300" />
            <span>Complete & Return to Hub</span>
          </button>
        )}
      </div>
    </nav>
  );
};
