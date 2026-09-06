import React from 'react';
import {
  LayoutDashboard,
  Target,
  Scale,
  CalendarDays,
  Award,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Zap,
  GitCompare,
  Radio,
  Sliders,
  Sparkles,
  Headphones,
  GitMerge,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Presentation,
  BarChart2,
  ListChecks
} from 'lucide-react';

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
  onOpenSlideDeck?: () => void;
  onOpenNotebookLmPodcast?: () => void;
}

// 4 Core Pursuit Steps for streamlined Bid Management
const CORE_PURSUIT_STEPS: Array<{ id: NavTabId; stepNumber: string; label: string; sub: string; icon: React.ElementType; badge?: string; badgeColor?: string }> = [
  { id: 'discovery', stepNumber: '1', label: 'Deal Setup & Scope', sub: 'Thor ID, Modules & RICEFW', icon: Target },
  { id: 'schedule', stepNumber: '2', label: 'Effort & Schedule', sub: 'Wave Timelines & Smartsheet WBS', icon: CalendarDays, badge: 'Sizing' },
  { id: 'commercial', stepNumber: '3', label: 'Commercials & Staffing', sub: 'Pyramid, Sourcing & Margins', icon: Users },
  { id: 'reports', stepNumber: '4', label: 'Proposal Dossier', sub: 'RFP Brief & Executive Exports', icon: FileText }
];

// Advanced Insights, Governance & Quality Assurance
const ADVANCED_INSIGHT_ITEMS: Array<{ id: NavTabId; label: string; sub: string; icon: React.ElementType; badge?: string; badgeColor?: string }> = [
  { id: 'dashboard', label: 'Executive Command', sub: 'KPIs, Health & Footprint', icon: LayoutDashboard },
  { id: 'testing', label: 'Business Testing & QA', sub: 'Testing 1 (SIT) & 2 (UAT)', icon: ListChecks, badge: 'SIT/UAT' },
  { id: 'delivery_confidence', label: 'Delivery Confidence', sub: 'P80 Risk Buffer & Contingency', icon: BarChart2, badge: 'P80' },
  { id: 'estimation', label: 'Estimation Engine', sub: '3-Point P10/P50/P80 Ranges', icon: Scale },
  { id: 'leadership', label: 'Leadership Review', sub: '5 Scheduling/Sizing Gaps', icon: Award, badge: '5 Gaps' },
  { id: 'governance', label: 'Governance & DoA', sub: 'Tiered DoA Sign-off & Audit', icon: ShieldCheck },
  // Benchmark Master hidden for future enablement as standard loading is not preferred for proposals
  { id: 'multivendor', label: 'Multi-Vendor Split', sub: 'SI Demarcation Matrix', icon: GitMerge, badge: 'Multi-SI' },
  { id: 'framework_slider', label: 'Framework One-Slider', sub: 'TCM Protocol + Audio', icon: Headphones, badge: 'Voice' }
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
  onOpenSlideDeck,
  onOpenNotebookLmPodcast
}) => {
  const [advancedExpanded, setAdvancedExpanded] = React.useState<boolean>(
    ['testing', 'delivery_confidence', 'estimation', 'governance', 'multivendor', 'leadership', 'framework_slider'].includes(activeTab)
  );

  return (
    <aside className="w-64 shrink-0 hidden md:block select-none">
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

          {onOpenSlideDeck && (
            <button
              type="button"
              onClick={onOpenSlideDeck}
              className="w-full flex items-center justify-between p-2.5 rounded-sm bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 hover:from-indigo-800 hover:to-indigo-700 active:from-indigo-950 text-white font-bold text-xs transition shadow-xs cursor-pointer border border-indigo-500/50 group"
              title="Open Executive 5-Slide PowerPoint Deck Modal"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xs bg-white/20 text-white group-hover:scale-110 transition-transform">
                  <Presentation size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Executive Slide Deck</div>
                  <div className="text-[10px] text-indigo-200 font-normal leading-tight">5-Slide PPTX presentation</div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-950 text-indigo-200 border border-indigo-400/30 rounded-xs uppercase">
                PPTX
              </span>
            </button>
          )}

          {onOpenNotebookLmPodcast && (
            <button
              type="button"
              onClick={onOpenNotebookLmPodcast}
              className="w-full flex items-center justify-between p-2.5 rounded-sm bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-bold text-xs transition shadow-xs cursor-pointer border border-indigo-500/40 group"
              title="Listen Podcast - 2-Host Audio Overview & Deep Dive"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xs bg-indigo-500/30 text-indigo-200 group-hover:scale-110 transition-transform">
                  <Headphones size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>Listen Podcast</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">2-Host Audio Overview</div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/40 rounded-xs uppercase">
                Audio
              </span>
            </button>
          )}
        </div>

        {/* SECTION 1: 4-Step Bid Pursuit Lifecycle */}
        <div className="space-y-1 bg-white p-2 rounded-sm border border-slate-200 shadow-xs">
          <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50/60 rounded-xs flex items-center justify-between">
            <span>Bid Pursuit Lifecycle</span>
            <span className="text-[9px] font-mono text-indigo-500">4 Steps</span>
          </div>

          <nav className="space-y-1 mt-1">
            {CORE_PURSUIT_STEPS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDiscovery = item.id === 'discovery';
              const isReports = item.id === 'reports';

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-left transition-colors duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                          isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        {item.stepNumber}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{item.label}</div>
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

        {/* SECTION 2: Advanced Insights & Assurance (Collapsible) */}
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
              <span className="text-[9px] font-mono text-slate-400">{ADVANCED_INSIGHT_ITEMS.length} Tools</span>
              {advancedExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {advancedExpanded && (
            <nav className="space-y-1 mt-1 animate-in fade-in duration-150">
              {ADVANCED_INSIGHT_ITEMS.map((item) => {
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
                      {item.id === 'governance' && doaTier === 3 && (
                        <span className="px-1 py-0.2 rounded-2xs text-[8px] font-black uppercase bg-rose-100 text-rose-700">
                          Tier 3
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Oracle Cloud Method Card - Hidden per user request */}
      </div>
    </aside>
  );
};
