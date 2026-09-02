import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTabId, DiscoverySubSectionId, ReportSubSectionId } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { DiscoveryScopeView } from './components/views/DiscoveryScopeView';
import { EstimationEngineView } from './components/views/EstimationEngineView';
import { ScheduleGanttView } from './components/views/ScheduleGanttView';
import { CommercialsView } from './components/views/CommercialsView';
import { GovernanceView } from './components/views/GovernanceView';
import { ProposalView } from './components/views/ProposalView';
import { ReportsView } from './components/views/ReportsView';
import { LeadershipGapsView } from './components/views/LeadershipGapsView';
import { FrameworkOneSliderView } from './components/views/FrameworkOneSliderView';
import { MultiVendorScopeView } from './components/views/MultiVendorScopeView';
import { BenchmarkMasterView } from './components/views/BenchmarkMasterView';
import { TestingAssuranceView } from './components/views/TestingAssuranceView';
import { AiComplexityStudioModal } from './components/modals/AiComplexityStudioModal';
import { AIScopingAgentModal } from './components/modals/AIScopingAgentModal';
import { ScenarioCompareModal } from './components/views/ScenarioCompareModal';
import { LeadershipAuditModal } from './components/views/LeadershipAuditModal';
import { TraceTheMathModal } from './components/modals/TraceTheMathModal';
import { AshishAroraChatbotModal } from './components/ai/AshishAroraChatbotModal';
import { NewProposalModal } from './components/modals/NewProposalModal';
import { SmartsheetExportModal } from './components/governance/SmartsheetExportModal';
import { ExecutiveSlideDeckModal } from './components/modals/ExecutiveSlideDeckModal';
import { ExecutiveDealBanner } from './components/common/ExecutiveDealBanner';
import { PRESET_SCENARIOS } from './data/templates';
import { ProjectScenario, OracleModule } from './types';
import { calculateProjectMetrics } from './utils/calculator';
import { Menu, X, Database, Sparkles } from 'lucide-react';

const STORAGE_CUSTOM_PROPOSALS_KEY = 'pb_estimo_custom_proposals';

export default function App() {
  // Load initial custom proposals from localStorage if available
  const [customProposals, setCustomProposals] = useState<ProjectScenario[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_PROPOSALS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load custom proposals from storage', e);
    }
    return [];
  });

  const [activeScenario, setActiveScenario] = useState<ProjectScenario>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_PROPOSALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      // fallback
    }
    return PRESET_SCENARIOS[0];
  });

  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [discoverySubSection, setDiscoverySubSection] = useState<DiscoverySubSectionId>('modules');
  const [reportSubSection, setReportSubSection] = useState<ReportSubSectionId>('sow_brief');
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [intelModalOpen, setIntelModalOpen] = useState(false);
  const [complexityModalOpen, setComplexityModalOpen] = useState(false);
  const [complexityModalTab, setComplexityModalTab] = useState<'complexity' | 'questions' | 'drivers' | 'ai_advisor'>('complexity');
  const [traceMathModalOpen, setTraceMathModalOpen] = useState(false);
  const [traceMathTargetModule, setTraceMathTargetModule] = useState<OracleModule | 'project_total'>('project_total');
  const [ashishCopilotOpen, setAshishCopilotOpen] = useState(false);
  const [newProposalModalOpen, setNewProposalModalOpen] = useState(false);
  const [smartsheetExportModalOpen, setSmartsheetExportModalOpen] = useState(false);
  const [slideDeckModalOpen, setSlideDeckModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to save custom proposals
  const saveCustomProposals = (proposals: ProjectScenario[]) => {
    setCustomProposals(proposals);
    try {
      localStorage.setItem(STORAGE_CUSTOM_PROPOSALS_KEY, JSON.stringify(proposals));
    } catch (e) {
      console.error('Failed to save custom proposals to storage', e);
    }
  };

  const handleCreateProposal = (newScenario: ProjectScenario) => {
    const updated = [newScenario, ...customProposals.filter(p => p.id !== newScenario.id)];
    saveCustomProposals(updated);
    setActiveScenario(newScenario);
    setDiscoverySubSection('modules');
    setActiveTab('discovery');
  };

  const handleDeleteCustomProposal = (id: string) => {
    const updated = customProposals.filter(p => p.id !== id);
    saveCustomProposals(updated);
    if (activeScenario.id === id) {
      if (updated.length > 0) {
        setActiveScenario(updated[0]);
      } else {
        setActiveScenario(PRESET_SCENARIOS[0]);
      }
    }
  };

  // Reactive calculation engine memo
  const calculatedData = useMemo(() => {
    return calculateProjectMetrics(activeScenario);
  }, [activeScenario]);

  const handleSelectScenario = (scenario: ProjectScenario) => {
    setActiveScenario(scenario);
  };

  const handleImportJson = (imported: ProjectScenario) => {
    setActiveScenario(imported);
  };

  const handleOpenComplexityStudio = (tab: 'complexity' | 'questions' | 'drivers' | 'ai_advisor' = 'complexity') => {
    setComplexityModalTab(tab);
    setComplexityModalOpen(true);
  };

  const handleOpenTraceMath = (target: OracleModule | 'project_total' = 'project_total') => {
    setTraceMathTargetModule(target);
    setTraceMathModalOpen(true);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'framework_slider':
        return (
          <FrameworkOneSliderView
            scenario={activeScenario}
            data={calculatedData}
            onNavigateStep={(tab) => setActiveTab(tab)}
          />
        );
      case 'discovery':
        return (
          <DiscoveryScopeView
            scenario={activeScenario}
            onUpdateScenario={setActiveScenario}
            onOpenComplexityStudio={handleOpenComplexityStudio}
            onOpenTraceMath={handleOpenTraceMath}
            activeSection={discoverySubSection}
            onSectionChange={setDiscoverySubSection}
          />
        );
      case 'testing':
        return (
          <TestingAssuranceView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
            onOpenTraceMath={handleOpenTraceMath}
          />
        );
      case 'benchmark_master':
        return (
          <BenchmarkMasterView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'multivendor':
        return (
          <MultiVendorScopeView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
            onOpenTraceMath={handleOpenTraceMath}
          />
        );
      case 'estimation':
        return (
          <EstimationEngineView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
            onOpenComplexityStudio={handleOpenComplexityStudio}
            onOpenTraceMath={handleOpenTraceMath}
          />
        );
      case 'delivery_confidence':
        return (
          <LeadershipGapsView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
            initialGapTab="gap4_montecarlo"
          />
        );
      case 'schedule':
        return (
          <ScheduleGanttView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
            onOpenComplexityStudio={handleOpenComplexityStudio}
          />
        );
      case 'leadership':
        return (
          <LeadershipGapsView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
          />
        );
      case 'commercial':
        return (
          <CommercialsView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
          />
        );
      case 'governance':
        return (
          <GovernanceView
            scenario={activeScenario}
            data={calculatedData}
            onUpdateScenario={setActiveScenario}
          />
        );
      case 'reports':
        return (
          <ReportsView
            scenario={activeScenario}
            data={calculatedData}
            activeSubSection={reportSubSection}
            onSelectSubSection={setReportSubSection}
            onUpdateScenario={(updater) => setActiveScenario(updater)}
            onOpenNewProposal={() => setNewProposalModalOpen(true)}
            onOpenSlideDeck={() => setSlideDeckModalOpen(true)}
          />
        );
      default:
        return (
          <DashboardView
            scenario={activeScenario}
            data={calculatedData}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenTraceMath={handleOpenTraceMath}
            onOpenNewProposal={() => setNewProposalModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        scenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        onRestoreScenario={(restored) => setActiveScenario(restored)}
        calculatedData={calculatedData}
        onOpenCompare={() => setCompareModalOpen(true)}
        onOpenAudit={() => setAuditModalOpen(true)}
        onOpenPrint={() => {
          setReportSubSection('sow_brief');
          setActiveTab('reports');
        }}
        onImportJson={handleImportJson}
        onOpenFrameworkSlider={() => setActiveTab('framework_slider')}
        onOpenComplexityStudio={() => handleOpenComplexityStudio('complexity')}
        onOpenIntelHub={() => setIntelModalOpen(true)}
        onOpenTraceMath={handleOpenTraceMath}
        onOpenAshishCopilot={() => setAshishCopilotOpen(true)}
        onOpenNewProposal={() => setNewProposalModalOpen(true)}
        onOpenSmartsheetExport={() => setSmartsheetExportModalOpen(true)}
        onOpenSlideDeck={() => setSlideDeckModalOpen(true)}
        customScenarios={customProposals}
        onDeleteCustomScenario={handleDeleteCustomProposal}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          discoverySubSection={discoverySubSection}
          onSelectDiscoverySubSection={(sub) => {
            setDiscoverySubSection(sub);
            setActiveTab('discovery');
          }}
          reportSubSection={reportSubSection}
          onSelectReportSubSection={(sub) => {
            setReportSubSection(sub);
            setActiveTab('reports');
          }}
          hasPatchConflict={calculatedData.patchConflictWeeks.length > 0}
          doaTier={calculatedData.doaTier}
          onOpenComplexityStudio={() => handleOpenComplexityStudio('complexity')}
          onOpenNewProposal={() => setNewProposalModalOpen(true)}
          onOpenSlideDeck={() => setSlideDeckModalOpen(true)}
        />

        {/* Mobile Navigation Drawer Trigger */}
        <div className="md:hidden fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-3.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center justify-center transition cursor-pointer"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden flex justify-end animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-white border-l border-slate-200 h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Database size={18} className="text-slate-900" />
                    <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">Navigation</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-sm text-slate-400 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Executive Command' },
                    { id: 'framework_slider', label: 'Framework One-Slider (Voice)' },
                    { id: 'discovery', label: 'Scope & Architecture' },
                    { id: 'benchmark_master', label: 'Benchmark & Master Calibration' },
                    { id: 'multivendor', label: 'Multi-Vendor & BI Demarcation' },
                    { id: 'estimation', label: 'Estimation Engine' },
                    { id: 'schedule', label: 'Schedule & Gantt' },
                    { id: 'leadership', label: 'Leadership Review (5 Gaps)' },
                    { id: 'commercial', label: 'Commercials & P&L' },
                    { id: 'governance', label: 'Governance & DoA' },
                    { id: 'reports', label: 'Reports & Portfolios' },
                  ].map((item) => (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab(item.id as NavTabId);
                          if (item.id !== 'discovery' && item.id !== 'reports') {
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-between ${
                          activeTab === item.id
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>

                      {item.id === 'discovery' && activeTab === 'discovery' && (
                        <div className="pl-3 py-1 space-y-1 border-l-2 border-slate-300 ml-3">
                          {[
                            { id: 'modules', label: '1. Modules & Depth' },
                            { id: 'technical', label: '2. Technical Matrix' },
                            { id: 'modifiers', label: '3. Program Modifiers' },
                            { id: 'rollout', label: '4. Rollout Strategy' },
                            { id: 'blackout', label: '5. Blackout Freezes' },
                            { id: 'topology', label: '6. Architecture Topology' },
                            { id: 'traceability', label: '7. Traceability & Math' }
                          ].map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setDiscoverySubSection(sub.id as DiscoverySubSectionId);
                                setActiveTab('discovery');
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs transition cursor-pointer rounded-xs ${
                                discoverySubSection === sub.id
                                  ? 'bg-slate-100 text-slate-900 font-bold'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {item.id === 'reports' && activeTab === 'reports' && (
                        <div className="pl-3 py-1 space-y-1 border-l-2 border-slate-300 ml-3">
                          {[
                            { id: 'sow_brief', label: '1. Executive RFP Brief' },
                            { id: 'scoping_table', label: '2. Scoping Sheet Summary' },
                            { id: 'matrix_20q', label: '3. 20-Question Matrix' },
                            { id: 'catalog_scale', label: '4. Catalog & Scale Footprint' },
                            { id: 'tshirt_portfolio', label: '5. T-Shirt Size Portfolio' },
                            { id: 'interview_view', label: '6. Guided Interview Dossier' },
                            { id: 'wbs_breakdown', label: '7. WBS & Workstream Spec' }
                          ].map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setReportSubSection(sub.id as ReportSubSectionId);
                                setActiveTab('reports');
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1 text-xs transition cursor-pointer rounded-xs ${
                                reportSubSection === sub.id
                                  ? 'bg-slate-100 text-slate-900 font-bold'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleOpenComplexityStudio('complexity');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm text-center"
                >
                  Complexity & AI Studio
                </button>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                  Oracle Fusion Cloud Planning Platform
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 min-w-0 pb-12 space-y-4">
          <ExecutiveDealBanner
            scenario={activeScenario}
            data={calculatedData}
            onSelectTab={setActiveTab}
            onOpenNewProposal={() => setNewProposalModalOpen(true)}
            onOpenSlideDeck={() => setSlideDeckModalOpen(true)}
          />
          {renderActiveTabContent()}
        </main>
      </div>

      {/* Scenario Compare Modal */}
      <ScenarioCompareModal
        currentScenario={activeScenario}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Leadership Audit & Transparency Modal */}
      <LeadershipAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        scenario={activeScenario}
        data={calculatedData}
        onUpdateScenario={setActiveScenario}
      />

      {/* Unified AI Scoping & Ingestion Agent Modal */}
      <AIScopingAgentModal
        isOpen={intelModalOpen}
        onClose={() => setIntelModalOpen(false)}
        scenario={activeScenario}
        onUpdateScenario={setActiveScenario}
        onOpenComplexityStudio={() => setComplexityModalOpen(true)}
      />

      {/* AI Complexity & Custom Question Studio Modal */}
      <AiComplexityStudioModal
        isOpen={complexityModalOpen}
        onClose={() => setComplexityModalOpen(false)}
        scenario={activeScenario}
        data={calculatedData}
        onUpdateScenario={setActiveScenario}
        initialTab={complexityModalTab}
      />

      {/* Trace The Math Calculation Modal */}
      <TraceTheMathModal
        isOpen={traceMathModalOpen}
        onClose={() => setTraceMathModalOpen(false)}
        scenario={activeScenario}
        data={calculatedData}
        targetModuleId={traceMathTargetModule}
      />

      {/* Ashish Arora - AI Estimation Copilot & Knowledge Base Modal */}
      <AshishAroraChatbotModal
        isOpen={ashishCopilotOpen}
        onClose={() => setAshishCopilotOpen(false)}
        scenario={activeScenario}
        data={calculatedData}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
        onOpenTraceMath={handleOpenTraceMath}
        onOpenComplexityStudio={handleOpenComplexityStudio}
        onUpdateScenario={(updater) => setActiveScenario(updater)}
      />

      {/* New Proposal / Deal Creation Modal */}
      <NewProposalModal
        isOpen={newProposalModalOpen}
        onClose={() => setNewProposalModalOpen(false)}
        activeScenario={activeScenario}
        onCreateProposal={handleCreateProposal}
      />

      {/* Smartsheet Enterprise PMO Plan Initiation Modal */}
      <SmartsheetExportModal
        isOpen={smartsheetExportModalOpen}
        onClose={() => setSmartsheetExportModalOpen(false)}
        scenario={activeScenario}
        data={calculatedData}
        onUpdateScenario={setActiveScenario}
      />

      {/* Executive 5-Slide PowerPoint Deck Modal */}
      <ExecutiveSlideDeckModal
        isOpen={slideDeckModalOpen}
        onClose={() => setSlideDeckModalOpen(false)}
        scenario={activeScenario}
        data={calculatedData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-500 py-6 text-center text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-slate-600">
            <strong className="text-slate-900 font-bold">PB-Estimo</strong> &mdash; Oracle Fusion Cloud ERP/SCM/HCM Implementation Schedule & Efforts Estimation Platform
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Oracle Unified Method (OUM) &bull; Multi-Entity Enterprise Standards
          </div>
        </div>
      </footer>
    </div>
  );
}

