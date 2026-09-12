import React from 'react';
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Award,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Presentation,
  BarChart2,
  ListChecks,
  GitMerge,
  Calculator,
  Compass,
  Briefcase,
  Layers
} from 'lucide-react';
import { UserRolePreset } from './common/GuidedWorkflowFooter';

export type NavTabId =
  | 'dashboard'
  | 'framework_slider'
  | 'discovery'
  | 'benchmark_master'
  | 'multivendor'
  | 'estimation'
  | 'delivery_confidence'
  | 'schedule'
  | 'testing'
  | 'leadership'
  | 'commercial'
  | 'governance'
  | 'reports';

export type DiscoverySubSectionId =
  | 'modules'
  | 'technical'
  | 'testing'
  | 'modifiers'
  | 'rollout'
  | 'blackout'
  | 'topology'
  | 'traceability';

export const DISCOVERY_SUB_ITEMS: Array<{
  id: DiscoverySubSectionId;
  number: string;
  label: string;
}> = [
  { id: 'modules', number: '1', label: 'Modules & 20-Q Depth' },
  { id: 'technical', number: '2', label: 'Technical Estimation & RICEFW' },
  { id: 'testing', number: '3', label: 'Business Testing (SIT & UAT)' },
  { id: 'modifiers', number: '4', label: 'Program Modifiers (7 Risks)' },
  { id: 'rollout', number: '5', label: 'Rollout & Wave Architecture' },
  { id: 'blackout', number: '6', label: 'Blackout & Freeze Windows' },
  { id: 'topology', number: '7', label: 'Scale Drivers & Topology' },
  { id: 'traceability', number: '8', label: 'Traceability & Math' }
];

export type ReportSubSectionId =
  | 'sow_brief'
  | 'scoping_table'
  | 'matrix_20q'
  | 'catalog_scale'
  | 'tshirt_portfolio'
  | 'interview_view'
  | 'wbs_breakdown';

export const REPORT_SUB_ITEMS: Array<{
  id: ReportSubSectionId;
  number: string;
  label: string;
}> = [
  { id: 'sow_brief', number: '1', label: 'Executive RFP Brief' },
  { id: 'scoping_table', number: '2', label: 'Scoping Sheet Summary' },
  { id: 'matrix_20q', number: '3', label: '20-Question Matrix' },
  { id: 'catalog_scale', number: '4', label: 'Catalog & Scale Footprint' },
  { id: 'tshirt_portfolio', number: '5', label: 'T-Shirt Size Portfolio' },
  { id: 'interview_view', number: '6', label: 'Guided Interview Dossier' },
  { id: 'wbs_breakdown', number: '7', label: 'WBS & Workstream Spec' }
];

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  discoverySubSection?: DiscoverySubSectionId;
  onSelectDiscoverySubSection?: (sub: DiscoverySubSectionId) => void;
  reportSubSection?: ReportSubSectionId;
  onSelectReportSubSection?: (sub: ReportSubSectionId) => void;
  hasPatchConflict: boolean;
  doaTier: number;
  onOpenComplexityStudio?: () => void;
  onOpenNewProposal?: () => void;
  onOpenWhatIfSimulator?: () => void;
  onOpenDealDefense?: () => void;
  onOpenSlideDeck?: () => void;
  onOpenNotebookLmPodcast?: () => void;
  rolePreset?: UserRolePreset;
  onSelectRolePreset?: (role: UserRolePreset) => void;
}

export interface NavStageDefinition {
  id: string;
  stageNumber: number;
  title: string;
  tag: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    activeBg: string;
  };
  steps: Array<{
    id: NavTabId;
    stepNumber: string;
    label: string;
    sub: string;
    icon: React.ElementType;
    badge?: string;
    roles: UserRolePreset[];
  }>;
}

export const BID_LIFECYCLE_STAGES: NavStageDefinition[] = [
  {
    id: 'stage_1',
    stageNumber: 1,
    title: 'Scope & Demarcation',
    tag: 'Step 1-2',
    colorClass: {
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      activeBg: 'bg-indigo-600'
    },
    steps: [
      {
        id: 'discovery',
        stepNumber: '1',
        label: 'Scope & Architecture',
        sub: 'Modules, 20-Q & RICEFW',
        icon: Target,
        roles: ['all', 'architect']
      },
      {
        id: 'multivendor',
        stepNumber: '2',
        label: 'Multi-Vendor Split',
        sub: 'SI Demarcation Matrix',
        icon: GitMerge,
        badge: 'RACI',
        roles: ['all', 'architect']
      }
    ]
  },
  {
    id: 'stage_2',
    stageNumber: 2,
    title: 'Effort & Timeline',
    tag: 'Step 3-5',
    colorClass: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-900',
      border: 'border-amber-200',
      activeBg: 'bg-amber-600'
    },
    steps: [
      {
        id: 'estimation',
        stepNumber: '3',
        label: 'Estimation Engine',
        sub: 'Complexity & Workstream Hrs',
        icon: Calculator,
        badge: 'Effort',
        roles: ['all', 'architect', 'commercial']
      },
      {
        id: 'schedule',
        stepNumber: '4',
        label: 'Schedule & Gantt',
        sub: 'Wave Timelines & 30-Col WBS',
        icon: CalendarDays,
        badge: 'Gantt',
        roles: ['all', 'architect']
      },
      {
        id: 'leadership',
        stepNumber: '5',
        label: 'Leadership Review',
        sub: '5 Delivery Gaps Audit',
        icon: Award,
        badge: '5 Gaps',
        roles: ['all', 'executive']
      }
    ]
  },
  {
    id: 'stage_3',
    stageNumber: 3,
    title: 'Pricing & Governance',
    tag: 'Step 6-8',
    colorClass: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      activeBg: 'bg-emerald-600'
    },
    steps: [
      {
        id: 'commercial',
        stepNumber: '6',
        label: 'Commercials & P&L',
        sub: 'Pyramid, Sourcing & Margins',
        icon: Users,
        roles: ['all', 'commercial']
      },
      {
        id: 'governance',
        stepNumber: '7',
        label: 'Governance & DoA',
        sub: 'Tiered DoA Sign-off & Audit',
        icon: ShieldCheck,
        roles: ['all', 'commercial']
      },
      {
        id: 'reports',
        stepNumber: '8',
        label: 'Proposal Dossier',
        sub: 'RFP Brief & SOW Exports',
        icon: FileText,
        roles: ['all', 'commercial', 'executive']
      }
    ]
  }
];

const ADVANCED_ASSURANCE_ITEMS: Array<{
  id: NavTabId;
  label: string;
  sub: string;
  icon: React.ElementType;
  badge?: string;
  roles: UserRolePreset[];
}> = [
  {
    id: 'framework_slider',
    label: 'Framework One-Slider',
    sub: 'Architecture Presentation',
    icon: Compass,
    badge: 'Voice',
    roles: ['all', 'executive']
  },
  {
    id: 'testing',
    label: 'Business Testing & QA',
    sub: 'Testing 1 (SIT) & 2 (UAT)',
    icon: ListChecks,
    badge: 'SIT/UAT',
    roles: ['all', 'architect']
  },
  {
    id: 'delivery_confidence',
    label: 'Delivery Confidence',
    sub: 'P80 Risk Buffer & Contingency',
    icon: BarChart2,
    badge: 'P80',
    roles: ['all', 'architect', 'commercial']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  discoverySubSection = 'modules',
  onSelectDiscoverySubSection,
  reportSubSection = 'sow_brief',
  onSelectReportSubSection,
  hasPatchConflict,
  doaTier,
  onOpenComplexityStudio,
  onOpenNewProposal,
  onOpenWhatIfSimulator,
  onOpenDealDefense,
  onOpenSlideDeck,
  onOpenNotebookLmPodcast,
  rolePreset = 'all',
  onSelectRolePreset
}) => {
  const [advancedExpanded, setAdvancedExpanded] = React.useState<boolean>(
    ['testing', 'delivery_confidence', 'framework_slider'].includes(activeTab)
  );

  const rolePills: Array<{ id: UserRolePreset; label: string; icon: string }> = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'architect', label: 'Architect', icon: '🏗️' },
    { id: 'commercial', label: 'Commercial', icon: '💼' },
    { id: 'executive', label: 'Executive', icon: '👔' }
  ];

  return (
    <aside className="w-68 shrink-0 hidden md:block select-none">
      <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1 pb-6 space-y-3 custom-scrollbar">
        
        {/* Quick Action: New Proposal Button & Slide Deck Button */}
        <div className="space-y-1.5">
          {onOpenNewProposal && (
            <button
              type="button"
              onClick={onOpenNewProposal}
              className="w-full flex items-center justify-between p-2.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs transition shadow-xs cursor-pointer border border-emerald-500 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xs bg-white/20 text-white group-hover:rotate-90 transition-transform">
                  <Plus size={14} className="stroke-[3]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">+ New Proposal</div>
                  <div className="text-[10px] text-emerald-100 font-normal leading-tight">Clean-slate or template</div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-800 text-emerald-100 rounded-xs uppercase">
                Deal
              </span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {onOpenSlideDeck && (
              <button
                type="button"
                onClick={onOpenSlideDeck}
                className="flex items-center justify-between p-2 rounded-sm bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition shadow-xs cursor-pointer border border-indigo-700 group"
                title="Open Executive 5-Slide PowerPoint Deck Modal"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Presentation size={13} className="text-indigo-300 shrink-0" />
                  <span className="text-[11px] font-bold truncate">Slide Deck</span>
                </div>
                <span className="text-[8px] font-mono px-1 py-0.2 bg-indigo-950 text-indigo-300 rounded-xs">
                  PPTX
                </span>
              </button>
            )}

            {onOpenWhatIfSimulator && (
              <button
                type="button"
                onClick={onOpenWhatIfSimulator}
                className="flex items-center justify-between p-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer border border-amber-400 group"
                title="Open What-If Margin & Scope Trade-off Simulator"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <SlidersHorizontal size={13} className="text-slate-950 shrink-0" />
                  <span className="text-[11px] font-bold truncate">What-If</span>
                </div>
                <span className="text-[8px] font-mono px-1 py-0.2 bg-slate-950 text-amber-300 rounded-xs">
                  Oral
                </span>
              </button>
            )}
          </div>

          {onOpenDealDefense && (
            <button
              type="button"
              onClick={onOpenDealDefense}
              className="w-full flex items-center justify-between p-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs cursor-pointer border border-slate-700 group"
              title="Open Deal Defense & SteerCo Justification Hub"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xs bg-indigo-500/30 text-indigo-300">
                  <Award size={13} className="stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold leading-tight">Deal Defense & SOW Shield</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-500 text-white rounded-xs uppercase">
                SteerCo
              </span>
            </button>
          )}
        </div>

        {/* ROLE-BASED PRESET SELECTOR (Suggestion 4) */}
        <div className="bg-white p-2 rounded-sm border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
              View Preset / Role
            </span>
            {rolePreset !== 'all' && onSelectRolePreset && (
              <button
                type="button"
                onClick={() => onSelectRolePreset('all')}
                className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer underline"
              >
                Reset to All
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {rolePills.map(role => {
              const isSelected = rolePreset === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => onSelectRolePreset && onSelectRolePreset(role.id)}
                  className={`py-1 px-1 rounded-xs text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`Filter navigation for ${role.label}`}
                >
                  <span className="mr-0.5">{role.icon}</span>
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HOME HUB: Executive Command */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-left transition-colors duration-150 group cursor-pointer border ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white border-slate-800 shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-1.5 rounded-sm ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <LayoutDashboard size={15} />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Executive Command Hub</div>
              <div className={`text-[10px] ${activeTab === 'dashboard' ? 'text-slate-300' : 'text-slate-500'}`}>
                KPIs, Health & Footprint
              </div>
            </div>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs ${
            activeTab === 'dashboard' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-100 text-slate-600'
          }`}>
            Hub
          </span>
        </button>

        {/* 3-STAGE BID LIFECYCLE (Suggestion 1) */}
        <div className="space-y-2">
          {BID_LIFECYCLE_STAGES.map((stage) => {
            // Filter steps for role preset
            const stageSteps = stage.steps.filter(
              step => rolePreset === 'all' || (step.roles as readonly string[]).includes(rolePreset)
            );

            if (stageSteps.length === 0) return null;

            return (
              <div
                key={stage.id}
                className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Stage Header */}
                <div className={`px-3 py-1.5 border-b border-slate-200 flex items-center justify-between ${stage.colorClass.bg}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-white ${stage.colorClass.activeBg}`}>
                      {stage.stageNumber}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${stage.colorClass.text}`}>
                      {stage.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-semibold">
                    {stage.tag}
                  </span>
                </div>

                {/* Steps in this stage */}
                <nav className="p-1 space-y-0.5">
                  {stageSteps.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isDiscovery = item.id === 'discovery';
                    const isReports = item.id === 'reports';

                    return (
                      <div key={item.id} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => onSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-left transition-colors duration-150 group cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                                isActive ? `${stage.colorClass.activeBg} text-white` : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                              }`}
                            >
                              {item.stepNumber}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                              <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                {item.sub}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {item.id === 'schedule' && hasPatchConflict && (
                              <span className="p-1 rounded-sm bg-rose-100 text-rose-700" title="Patch Conflict Detected">
                                <AlertTriangle size={12} className="stroke-[2.5]" />
                              </span>
                            )}
                            {item.badge && !isActive && (
                              <span className="text-[8px] font-bold font-mono px-1 py-0.2 rounded-2xs bg-slate-100 text-slate-600 border border-slate-200">
                                {item.badge}
                              </span>
                            )}
                            {item.id === 'governance' && doaTier === 3 && (
                              <span className="px-1 py-0.2 rounded-2xs text-[8px] font-black uppercase bg-rose-100 text-rose-700">
                                Tier 3
                              </span>
                            )}
                            {(isDiscovery || isReports) && (
                              <div className={isActive ? 'text-slate-300' : 'text-slate-400'}>
                                {isActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Submenu for Scope & Architecture */}
                        {isDiscovery && isActive && (
                          <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 ml-4.5 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            {DISCOVERY_SUB_ITEMS.map((sub) => {
                              const isSubActive = discoverySubSection === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectDiscoverySubSection) {
                                      onSelectDiscoverySubSection(sub.id);
                                    }
                                    if (activeTab !== 'discovery') {
                                      onSelectTab('discovery');
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-sm text-left text-xs transition-all cursor-pointer ${
                                    isSubActive
                                      ? 'bg-slate-100 font-bold text-slate-900 shadow-2xs border-l-2 border-slate-900'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                                      isSubActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                      {sub.number}
                                    </span>
                                    <span className="truncate text-[11px]">{sub.label}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Submenu for Reports & Portfolios */}
                        {isReports && isActive && (
                          <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 ml-4.5 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            {REPORT_SUB_ITEMS.map((sub) => {
                              const isSubActive = reportSubSection === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectReportSubSection) {
                                      onSelectReportSubSection(sub.id);
                                    }
                                    if (activeTab !== 'reports') {
                                      onSelectTab('reports');
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-sm text-left text-xs transition-all cursor-pointer ${
                                    isSubActive
                                      ? 'bg-slate-100 font-bold text-slate-900 shadow-2xs border-l-2 border-slate-900'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                                      isSubActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                      {sub.number}
                                    </span>
                                    <span className="truncate text-[11px]">{sub.label}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* SECTION 2: Advanced Assurance & Delivery Quality (Collapsible) */}
        <div className="space-y-1 bg-white p-2 rounded-sm border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="w-full px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xs flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={11} className="text-slate-500" />
              <span>Advanced & Assurance</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-400">{ADVANCED_ASSURANCE_ITEMS.length} Tools</span>
              {advancedExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {advancedExpanded && (
            <nav className="space-y-1 mt-1 animate-in fade-in duration-150">
              {ADVANCED_ASSURANCE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-left transition-colors duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1 rounded-sm transition-colors ${
                          isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        <Icon size={14} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{item.label}</div>
                        <div className={`text-[9px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {item.sub}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && !isActive && (
                        <span className="px-1.5 py-0.2 rounded-2xs text-[8px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
};

