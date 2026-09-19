import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Save,
  Target,
  CalendarDays,
  Users,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Cloud,
  Check,
  Zap,
  Layers,
  Database,
  Presentation
} from 'lucide-react';
import { NavTabId } from '../Sidebar';

export interface TourStep {
  id: string;
  stepNumber: number;
  stageName: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconColor: string;
  targetTab: NavTabId;
  targetElementDescription: string;
  bullets: Array<{
    title: string;
    description: string;
  }>;
  proTip?: string;
  actionHint?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: 1,
    stageName: 'Introduction & Overview',
    title: 'Welcome to PB-Estimo Oracle Cloud Engine',
    subtitle: 'The enterprise scoping, estimation, scheduling, and governance platform for Oracle Cloud transformations.',
    badge: 'Platform Overview',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    icon: Sparkles,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    targetTab: 'dashboard',
    targetElementDescription: 'Top Navigation Bar & Executive Command Hub',
    bullets: [
      {
        title: 'Unified Project Pipeline',
        description: 'Covers the full bid lifecycle from initial RFP scoping and 20-Q module depth to 30-column Smartsheet WBS and P&L commercials.'
      },
      {
        title: 'Deterministic Methodology',
        description: 'Strictly aligned with the Oracle Project Plan Generation Standard (Wave 0 Mobilization, 7 mandatory phases, no invented tasks).'
      },
      {
        title: 'Role-Based Navigation',
        description: 'Structured into 3 progressive delivery stages: Scope, Effort & Timeline, and Pricing & Governance.'
      }
    ],
    proTip: 'You can launch this guided walkthrough at any time by clicking the "Guided Tour" button in the top navigation bar.',
    actionHint: 'Click "Next Step" to learn about the essential Save & Persistence feature.'
  },
  {
    id: 'save_persistence',
    stepNumber: 2,
    stageName: 'Data Safety & Persistence',
    title: 'The Universal Save & Sync Engine',
    subtitle: 'Ensure your proposals, custom hours, and configuration overrides are never lost.',
    badge: 'Crucial Feature',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: Save,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-300',
    targetTab: 'dashboard',
    targetElementDescription: 'Top Executive Deal Banner & Cloud DB Sync',
    bullets: [
      {
        title: 'Save Proposal Changes',
        description: 'Click the green "Save Changes" button in the top dark Executive Deal Banner to instantly persist your active scenario to browser local storage.'
      },
      {
        title: 'Cloud Database Synchronization',
        description: 'Use the "Cloud DB Sync" button in the top navigation to store and retrieve complete project plans across systems and team members via Cloud Firestore.'
      },
      {
        title: 'Synchronized Derived Metrics',
        description: 'Saving triggers recalculation of all derived outputs: P50/P80 hours, timeline durations, peak FTEs, blended rates, and DoA sign-off tiers.'
      }
    ],
    proTip: 'Whenever you adjust sliders, module depths, or staffing pyramids, click "Save Changes" to record a timestamped revision.',
    actionHint: 'Look at the top dark banner above to see the green "Save Changes" button.'
  },
  {
    id: 'scope_demarcation',
    stepNumber: 3,
    stageName: 'Stage 1: Scope & Demarcation',
    title: 'Scope, 20-Question Depth & Multi-Vendor RACI',
    subtitle: 'Define functional boundaries, size technical complexity, and allocate vendor responsibilities.',
    badge: 'Step 1 - 2',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    icon: Target,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    targetTab: 'discovery',
    targetElementDescription: 'Scope & Architecture &bull; Multi-Vendor Split',
    bullets: [
      {
        title: '23 In-Scope Modules & 20-Q Depth',
        description: 'Select modules across ERP, SCM, HCM, EPM, and CX. Expand any module to complete the 20-Question questionnaire which dynamically adjusts T-Shirt sizing.'
      },
      {
        title: 'Technical CEMLI & RICEFW Sizing',
        description: 'Quantify OIC interfaces, BIP/OTBI reports, PaaS extensions, Fast Formulas, and workflow approvals using standard SMC complexity weights.'
      },
      {
        title: 'Multi-Vendor RACI Split',
        description: 'Demarcate delivery ownership between Prime SI, Client Core Team, and 3rd-party vendors across 12 lifecycle workstreams.'
      }
    ],
    proTip: 'The 7 Program Modifiers allow you to factor in client decision velocity, data debt, and cloud mindset risks with mathematical transparency.'
  },
  {
    id: 'schedule_timeline',
    stepNumber: 4,
    stageName: 'Stage 2: Effort & Timeline',
    title: 'Schedule, 30-Col WBS & Resource Loading',
    subtitle: 'Plan project timelines, detect pod patch freezes, and model role-specific ramp-down curves.',
    badge: 'Step 3 - 5',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: CalendarDays,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-300',
    targetTab: 'schedule',
    targetElementDescription: 'Schedule & Gantt Roadmap &bull; Phase Resource Loading Plan',
    bullets: [
      {
        title: 'Interactive 7-Phase Gantt Roadmap',
        description: 'Visualizes all mandatory phases from Client Enablement (2 weeks) to Hypercare, highlighting stage gates, CRP milestones, and blackout freeze dates.'
      },
      {
        title: 'Single-Screen Resource Loading Plan',
        description: 'Features realistic role lifecycle curves: Technical developers peak in Build (~55%) and ramp down in SIT/UAT; QA surges in SIT (+140%); Data specialists surge across Mocks and Cutover.'
      },
      {
        title: 'Brooks\' Law Staffing Math',
        description: 'Validates whether aggressive timeline compression will cause team coordination overhead penalties.'
      }
    ],
    proTip: 'Check the Environment Strategy tab to verify that Oracle Quarterly Pod Patches (26A, 26B, 26C, 26D) do not collide with active UAT or Cutover.'
  },
  {
    id: 'commercials_governance',
    stepNumber: 5,
    stageName: 'Stage 3: Pricing & Governance',
    title: 'Sourcing Pyramid, Commercials & DoA Audit',
    subtitle: 'Configure delivery pyramids, evaluate P&L gross margins, and check executive sign-off tiers.',
    badge: 'Step 6 - 7',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: Users,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-300',
    targetTab: 'commercial',
    targetElementDescription: 'Commercials & P&L &bull; Governance & DoA Approval Hub',
    bullets: [
      {
        title: '7-Tier Sourcing Pyramid & Delivery Mix',
        description: 'Configure Onshore, Nearshore, and Offshore delivery ratios (e.g. 20/0/80) to optimize blended bill rates and project delivery margin.'
      },
      {
        title: 'Commercial P&L Statement',
        description: 'Real-time calculation of Revenue TCV, Cost TCV, Blended Bill Rate, and Gross Margin % with instant profitability alerts.'
      },
      {
        title: 'Automated DoA Approval Tier',
        description: 'Classifies proposals into Tier 1 (Account Lead), Tier 2 (Practice VP), or Tier 3 (Executive Board) based on deal size and risk profile.'
      }
    ],
    proTip: 'The Governance view includes the complete 30-column Smartsheet WBS specification ready for enterprise PMO synchronization.'
  },
  {
    id: 'exports_deliverables',
    stepNumber: 6,
    stageName: 'Final Stage: Client Deliverables',
    title: 'One-Click Client Deliverables & Slide Decks',
    subtitle: 'Generate professional executive presentations, spreadsheets, and RFP briefs in seconds.',
    badge: 'Deliverables',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    icon: Presentation,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    targetTab: 'reports',
    targetElementDescription: 'Proposal Dossier &bull; Export Menu',
    bullets: [
      {
        title: 'Executive PowerPoint Deck (.pptx)',
        description: 'Generates a 10-slide executive presentation covering project overview, architecture, milestone roadmap, staffing pyramids, and risk governance.'
      },
      {
        title: '30-Column Smartsheet Master CSV',
        description: 'Exports the full WBS hierarchy with exact Smartsheet columns: Task Name, Assigned Role, Status, Dates, Predecessors, and WBS IDs.'
      },
      {
        title: 'SOW Scoping Sheet & 20-Q Dossier',
        description: 'Produces printable RFP Statement of Work documentation and 20-Question audit trails for contracting.'
      }
    ],
    proTip: 'You have completed the guided tour! Start by clicking "+ New Proposal" or configuring your active deal.',
    actionHint: 'Click "Finish Tour" to begin using Estimo.'
  }
];

const LOCAL_STORAGE_TOUR_KEY = 'pb_estimo_guided_tour_completed';

interface GuidedTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onSaveScenario?: () => void;
}

export const GuidedTourOverlay: React.FC<GuidedTourOverlayProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onSaveScenario
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const totalSteps = TOUR_STEPS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  // Sync active tab with step target tab whenever step changes
  useEffect(() => {
    if (isOpen && step.targetTab && activeTab !== step.targetTab) {
      onSelectTab(step.targetTab);
    }
  }, [currentStepIndex, isOpen, step.targetTab, activeTab, onSelectTab]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStepIndex, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(LOCAL_STORAGE_TOUR_KEY, 'true');
      } catch (e) {
        // ignore
      }
    }
    onClose();
  }, [dontShowAgain, onClose]);

  const handleGoToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  };

  if (!isOpen) return null;

  const IconComponent = step.icon;

  return (
    <div
      id="guided-tour-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Application Guided Tour"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div
        id="guided-tour-card"
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-800"
      >
        {/* Top Progress Bar */}
        <div className="w-full bg-slate-100 h-1 relative shrink-0">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xs bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Compass size={16} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-2xs bg-slate-200 text-slate-800 border border-slate-300">
                  Step {step.stepNumber} of {totalSteps}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-2xs border ${step.badgeColor}`}>
                  {step.badge}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                {step.stageName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="guided-tour-close-btn"
            onClick={handleClose}
            className="p-1.5 rounded-xs text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer shrink-0"
            title="Close Tour (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* Step Title & Icon Banner */}
          <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
            <div className={`p-2.5 rounded-sm border shrink-0 ${step.iconColor}`}>
              <IconComponent size={22} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {step.title}
              </h3>
              <p className="text-slate-600 text-xs mt-0.5">
                {step.subtitle}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
                <span className="font-bold text-slate-700">Active Screen:</span>
                <span className="px-1.5 py-0.2 rounded-2xs bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px]">
                  {step.targetElementDescription}
                </span>
              </div>
            </div>
          </div>

          {/* Key Bullets */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              What you need to know:
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {step.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-sm bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 hover:bg-slate-100/60 transition"
                >
                  <div className="mt-0.5 shrink-0 text-indigo-600">
                    <CheckCircle2 size={14} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{bullet.title}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{bullet.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Spotlight for Step 2: Save Functionality */}
          {step.id === 'save_persistence' && (
            <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xs bg-emerald-600 text-white shrink-0">
                  <Save size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-950">Try It: Save Your Work Right Now</div>
                  <div className="text-[11px] text-emerald-800">
                    Saves current state to local storage & synchronizes all calculation metrics.
                  </div>
                </div>
              </div>
              {onSaveScenario && (
                <button
                  type="button"
                  id="guided-tour-save-action-btn"
                  onClick={() => {
                    onSaveScenario();
                  }}
                  className="px-3 py-1.5 rounded-xs bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5 border border-emerald-500"
                >
                  <Save size={13} className="stroke-[2.5]" />
                  <span>Click to Test Save</span>
                </button>
              )}
            </div>
          )}

          {/* Pro-Tip Callout */}
          {step.proTip && (
            <div className="p-3 rounded-sm bg-amber-50/70 border border-amber-200 text-amber-950 text-[11px] flex items-start gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded-2xs bg-amber-200 text-amber-900 shrink-0 font-mono">
                PRO-TIP
              </span>
              <span>{step.proTip}</span>
            </div>
          )}
        </div>

        {/* Step Navigation Dots (Interactive Pill Rail) */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                id={`guided-tour-step-dot-${idx}`}
                onClick={() => handleGoToStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-indigo-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Jump to Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              id="guided-tour-dont-show-checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded-2xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Don't show on start</span>
          </label>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Previous Button */}
          <div>
            {!isFirstStep ? (
              <button
                type="button"
                id="guided-tour-prev-btn"
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-300"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                id="guided-tour-skip-btn"
                onClick={handleClose}
                className="text-xs text-slate-500 hover:text-slate-800 transition font-semibold px-2 py-1 cursor-pointer"
              >
                Skip Tour
              </button>
            )}
          </div>

          {/* Right: Next / Finish Button */}
          <div className="flex items-center gap-2">
            {!isLastStep && (
              <button
                type="button"
                id="guided-tour-skip-text-btn"
                onClick={handleClose}
                className="text-xs text-slate-500 hover:text-slate-800 transition font-medium px-2 py-1 cursor-pointer hidden sm:inline"
              >
                Exit Tour
              </button>
            )}

            <button
              type="button"
              id="guided-tour-next-btn"
              onClick={handleNext}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xs text-xs font-bold transition cursor-pointer shadow-xs border ${
                isLastStep
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
            >
              <span>{isLastStep ? 'Finish Tour' : 'Next Step'}</span>
              {isLastStep ? <Check size={14} className="stroke-[3]" /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
