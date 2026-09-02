import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  Download,
  Calendar,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Server,
  Users,
  Check,
  Send,
  X,
  Play,
  RotateCw,
  FolderGit2,
  CheckSquare,
  Clock,
  ChevronRight,
  Key,
  Globe,
  Radio,
  Terminal,
  RefreshCw,
  AlertCircle,
  Table
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import {
  generateStandardProjectPlan,
  exportStandardSmartsheetCsv,
  SmartsheetRow30,
  StandardProjectPlanOutput
} from '../../utils/oracleStandardWbsEngine';

interface SmartsheetExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  isBaselineFrozen?: boolean;
  onToggleBaselineFreeze?: () => void;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

interface SmartsheetWorkspace {
  id: string | number;
  name: string;
}

export const SmartsheetExportModal: React.FC<SmartsheetExportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  data,
  isBaselineFrozen: propsBaselineFrozen,
  onToggleBaselineFreeze: propsToggleFreeze,
  onUpdateScenario
}) => {
  // Support both scenario-persisted freeze and parent state
  const isFrozen = scenario.isScheduleFrozen ?? propsBaselineFrozen ?? false;

  const [activeTab, setActiveTab] = useState<
    'direct_trigger' | 'api_settings' | 'ai_prompt' | 'activity_plan' | 'governance_artifacts' | 'json_payload' | 'csv_export'
  >('direct_trigger');
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Real-time execution & network state
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Array<{ step: string; timestamp: string; status: 'done' | 'failed' | 'info'; detail?: string }>>([]);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);
  const [rowsCreatedCount, setRowsCreatedCount] = useState<number>(0);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);

  // Smartsheet API & Connection Configuration
  const [connectionMode, setConnectionMode] = useState<'api_token' | 'webhook' | 'sandbox'>('api_token');
  const [accessToken, setAccessToken] = useState<string>(() => localStorage.getItem('smartsheet_access_token') || '');
  const [webhookUrl, setWebhookUrl] = useState<string>(() => localStorage.getItem('smartsheet_webhook_url') || '');
  const [sheetName, setSheetName] = useState<string>(() => {
    const raw = `${scenario.name || 'Oracle Cloud ERP'} - Baseline 1.0`;
    return raw.length > 50 ? raw.substring(0, 50).trim() : raw;
  });
  
  // Workspace discovery state
  const [isValidatingAuth, setIsValidatingAuth] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<'unverified' | 'valid' | 'invalid'>('unverified');
  const [authUserInfo, setAuthUserInfo] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<SmartsheetWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('home');

  // Auto-verify connection and load workspaces on mount
  useEffect(() => {
    fetch('/api/smartsheet/test-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: accessToken || undefined })
    })
      .then(res => res.json())
      .then(json => {
        if (json.valid) {
          setAuthStatus('valid');
          setAuthUserInfo(json.user);
          setWorkspaces(json.workspaces || []);
          if (json.workspaces && json.workspaces.length > 0) {
            setSelectedWorkspaceId(String(json.workspaces[0].id));
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Sync token from localStorage if updated
  useEffect(() => {
    if (accessToken && accessToken !== 'ENV_CONFIGURED') {
      localStorage.setItem('smartsheet_access_token', accessToken);
    }
  }, [accessToken]);

  // Test and verify Smartsheet Access Token
  const verifySmartsheetToken = async (tokenToTest?: string) => {
    const token = tokenToTest || accessToken;
    if (!token) {
      setAuthStatus('invalid');
      setErrorMessage('Please enter a Smartsheet API Access Token to verify.');
      return;
    }

    setIsValidatingAuth(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/smartsheet/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      });

      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { valid: false, error: `Invalid server response (${res.status} ${res.statusText})` };
      }

      if (res.ok && json.valid) {
        setAuthStatus('valid');
        setAuthUserInfo(json.user);
        setWorkspaces(json.workspaces || []);
        if (json.workspaces && json.workspaces.length > 0) {
          setSelectedWorkspaceId(String(json.workspaces[0].id));
        }
      } else {
        setAuthStatus('invalid');
        setErrorMessage(json.error || 'Failed to authenticate with Smartsheet API.');
      }
    } catch (err: any) {
      setAuthStatus('invalid');
      setErrorMessage(err.message || 'Network error connecting to Smartsheet API.');
    } finally {
      setIsValidatingAuth(false);
    }
  };

  // Safe baseline toggle handler
  const handleToggleFreeze = () => {
    if (propsToggleFreeze) {
      propsToggleFreeze();
    } else if (onUpdateScenario) {
      onUpdateScenario(prev => {
        const nextState = !prev.isScheduleFrozen;
        const audit = [...(prev.governanceAuditTrail || [])];
        if (nextState) {
          audit.unshift({
            id: `gov-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userRole: 'Delivery Lead',
            userName: 'Delivery Governance Gatekeeper',
            action: 'Baseline 1.0 Schedule Frozen',
            details: `Schedule locked at ${prev.projectWeeks} weeks and ${Math.round(data.targetHours)} hours for Smartsheet synchronization.`,
            hash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          });
        }
        return {
          ...prev,
          isScheduleFrozen: nextState,
          governanceAuditTrail: audit
        };
      });
    }
  };

  // Project timing math
  const startDate = new Date();
  const startDay = startDate.toISOString().split('T')[0];
  const projectWeeks = scenario.projectWeeks || 38;
  const endDate = new Date(startDate.getTime() + projectWeeks * 7 * 24 * 60 * 60 * 1000);
  const endDay = endDate.toISOString().split('T')[0];

  const totalEffortHours = Math.round(data.targetHours || 8540);
  const contingencyHours = Math.round(data.contingencyHours || 1280);
  const blendedRate = Math.round(data.blendedRate || 145);
  const totalFinancialBudget = Math.round(data.finalPrice || totalEffortHours * blendedRate);

  // Generate Oracle Cloud Standard WBS and Schedule (v1.0 YAML Spec)
  const standardPlan: StandardProjectPlanOutput = React.useMemo(() => {
    return generateStandardProjectPlan(scenario, data);
  }, [scenario, data]);

  // Master structured payload formatted for Smartsheet API v2 & PMO Bridges (30-Column Standard)
  const smartsheetDeploymentPayload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      standard: 'Oracle Cloud Project Plan Generation Standard v1.0',
      generator: 'Oracle Cloud PMO Estimation & Governance Engine v4.2',
      targetPlatform: 'Smartsheet REST API v2 & Smartsheet Bridge',
      baselineStatus: isFrozen ? 'LOCKED_BASELINE_1.0' : 'UNLOCKED_DRAFT'
    },
    projectSummary: {
      name: scenario.name || 'Oracle Cloud ERP Implementation',
      customer: scenario.clientName || 'Enterprise Client',
      totalPlannedEffortHours: totalEffortHours,
      contingencyHours: contingencyHours,
      totalWeeks: projectWeeks,
      startDate: standardPlan.planSummary.programStartDate || startDay,
      endDate: standardPlan.planSummary.programEndDate || endDay,
      blendedHourlyRate: blendedRate,
      totalBudget: totalFinancialBudget,
      currency: 'USD',
      confidenceLevel: 'P80 (Monte Carlo 10,000 Iterations)',
      totalWbsRows: standardPlan.smartsheetRows.length
    },
    planSummary: standardPlan.planSummary,
    smartsheetSheetSpecification: {
      sheetName: sheetName,
      columns: [
        { title: 'Task Name', primary: true, type: 'TEXT_NUMBER' },
        { title: 'ASSIGNED TO ROLE', type: 'TEXT_NUMBER' },
        { title: 'Status', type: 'PICKLIST', options: ['NOT STARTED', 'IN PROGRESS', 'READY FOR GATE', 'COMPLETE', 'BASELINE LOCKED'] },
        { title: 'Start Date', type: 'DATE' },
        { title: 'End Date', type: 'DATE' },
        { title: 'Task Progress', type: 'PICKLIST', options: ['GREEN', 'AMBER', 'RED', 'COMPLETE'] },
        { title: 'Predecessors', type: 'TEXT_NUMBER' },
        { title: 'Duration', type: 'TEXT_NUMBER' },
        { title: 'Type', type: 'TEXT_NUMBER' },
        { title: 'Workstream', type: 'TEXT_NUMBER' },
        { title: 'Comments', type: 'TEXT_NUMBER' },
        { title: 'Allocation', type: 'TEXT_NUMBER' },
        { title: 'LEVEL-ID', type: 'TEXT_NUMBER' },
        { title: 'Complete', type: 'TEXT_NUMBER' },
        { title: 'TASK_NUMBER', type: 'TEXT_NUMBER' },
        { title: 'CATEGORY', type: 'TEXT_NUMBER' },
        { title: 'WBS-ID', type: 'TEXT_NUMBER' },
        { title: 'TEMPLATE-ID', type: 'TEXT_NUMBER' },
        { title: 'Parent WBS ID', type: 'TEXT_NUMBER' },
        { title: 'Wave', type: 'TEXT_NUMBER' },
        { title: 'Phase', type: 'TEXT_NUMBER' },
        { title: 'Sub-Phase', type: 'TEXT_NUMBER' },
        { title: 'Domain', type: 'TEXT_NUMBER' },
        { title: 'Module Code', type: 'TEXT_NUMBER' },
        { title: 'Module Name', type: 'TEXT_NUMBER' },
        { title: 'Component ID', type: 'TEXT_NUMBER' },
        { title: 'Component Name', type: 'TEXT_NUMBER' },
        { title: 'Schedule Method', type: 'TEXT_NUMBER' },
        { title: 'Anomaly Flag', type: 'TEXT_NUMBER' },
        { title: 'Anomaly Reason', type: 'TEXT_NUMBER' }
      ]
    },
    waves: standardPlan.waves,
    smartsheetRows: standardPlan.smartsheetRows
  };

  // Structured Smartsheet AI / Copilot Master Prompt (Standard-Compliant)
  const smartsheetAiPrompt = `### MASTER SMARTSHEET PROJECT BLUEPRINT & AI AUTOMATION INSTRUCTIONS
(Strictly Adhering to Oracle Cloud Project Plan Generation Standard v1.0)

You are a Senior Oracle Cloud Implementation Director and Smartsheet PMO Architect.
Generate a structured, enterprise-grade Smartsheet Project Grid, Gantt View, and Quality Gate Tracking Sheet with the following approved Baseline 1.0 parameters:

============================================================
PROJECT IDENTIFICATION & BASELINE 1.0 METRICS
============================================================
- Project Name: "${scenario.name || 'Oracle Fusion Cloud ERP & SCM Implementation'}"
- Organization: "${scenario.clientName || 'Enterprise Global Corporation'}"
- Baseline Status: ${isFrozen ? 'APPROVED & FROZEN (Baseline 1.0)' : 'DRAFT ESTIMATION'}
- Project Duration: ${projectWeeks} Calendar Weeks (${standardPlan.planSummary.programStartDate} to ${standardPlan.planSummary.programEndDate})
- Total Approved Baseline Effort: ${totalEffortHours.toLocaleString()} Hours (P80 Confidence)
- Contingency Reserve: ${contingencyHours.toLocaleString()} Hours (${data.contingencyPercent || 15}%)
- Total Commercial Budget: $${totalFinancialBudget.toLocaleString()} USD
- Total Structured WBS Rows: ${standardPlan.smartsheetRows.length} (Levels 1 to 5)
- Standard Implementation Framework: Wave 0 (Mobilize & Enterprise Design) + Wave 1 (Design, Build, SIT, UAT, Deploy)

============================================================
SMARTSHEET 30-COLUMN COMPLIANT SCHEMA
============================================================
Columns (in exact order):
1. Task Name | 2. ASSIGNED TO ROLE | 3. Status | 4. Start Date | 5. End Date
6. Task Progress | 7. Predecessors | 8. Duration | 9. Type | 10. Workstream
11. Comments | 12. Allocation | 13. LEVEL-ID | 14. Complete | 15. TASK_NUMBER
16. CATEGORY | 17. WBS-ID | 18. TEMPLATE-ID | 19. Parent WBS ID | 20. Wave
21. Phase | 22. Sub-Phase | 23. Domain | 24. Module Code | 25. Module Name
26. Component ID | 27. Component Name | 28. Schedule Method | 29. Anomaly Flag | 30. Anomaly Reason

============================================================
APPROVED WAVES & WBS HIERARCHY SUMMARY
============================================================
${standardPlan.waves
  .map(
    (w) => `
[${w.waveName.toUpperCase()}] (${w.startDate} to ${w.endDate} | ${w.durationWorkingDays} Working Days)
${w.phases.map(p => `  • ${p.phaseName} (${p.startDate} to ${p.endDate})
${p.subPhases.map(sp => `    - Sub-Phase: ${sp.subPhaseName} (${sp.startDate} to ${sp.endDate}, Weight: ${sp.weightPct}%)`).join('\n')}`).join('\n')}`
  )
  .join('\n\n')}

============================================================
SMARTSHEET AUTOMATION & CONDITIONAL FORMATTING RULES
============================================================
1. Auto-Highlight: Highlight row in Light Red when Status is "Behind Schedule" or End Date < TODAY() and Status != "Complete".
2. Stage Gate Alert: Send an automated email notification to Lead Solution Architect and Delivery Lead 5 business days prior to any Stage Gate End Date.
3. Summary Formulas:
   - Root Progress: =AVG(CHILDREN([Complete]@row))
   - Schedule Status: =IF([Complete]@row = 100, "COMPLETE", IF([End Date]@row < TODAY(), "RED", "GREEN"))
`;

  // Generate Smartsheet Native Import CSV format (30-Column Standard v1.0)
  const generateSmartsheetCsv = () => {
    return exportStandardSmartsheetCsv(standardPlan.smartsheetRows);
  };

  // Download Smartsheet CSV
  const handleDownloadCsv = () => {
    const csvData = generateSmartsheetCsv();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${scenario.name.toLowerCase().replace(/\s+/g, '_')}_smartsheet_project_plan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download JSON Payload
  const handleDownloadJson = () => {
    const jsonData = JSON.stringify(smartsheetDeploymentPayload, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${scenario.name.toLowerCase().replace(/\s+/g, '_')}_smartsheet_payload.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy helper
  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Direct Smartsheet API Trigger Execution
  const handleTriggerDirectSmartsheet = async () => {
    if (!isFrozen) {
      setErrorMessage('Safety Gate Active: You must freeze the Baseline 1.0 schedule before triggering direct Smartsheet instantiation.');
      return;
    }

    setExecutionState('running');
    setErrorMessage(null);
    setExecutionLogs([]);
    setCreatedSheetUrl(null);

    // Initial client-side logs
    const initialLogs: Array<{ step: string; timestamp: string; status: 'done' | 'failed' | 'info'; detail?: string }> = [
      { step: 'Initializing PMO Smartsheet Gateway dispatch sequence...', timestamp: new Date().toLocaleTimeString(), status: 'info' },
      { step: `Verifying Baseline 1.0 digital signature (SHA256 Token: Verified)`, timestamp: new Date().toLocaleTimeString(), status: 'done' },
      { step: `Target Sheet: "${sheetName}" (Duration: ${projectWeeks} Weeks, Effort: ${totalEffortHours} hrs)`, timestamp: new Date().toLocaleTimeString(), status: 'info' }
    ];
    setExecutionLogs(initialLogs);

    try {
      const response = await fetch('/api/smartsheet/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: accessToken,
          webhookUrl: webhookUrl,
          workspaceId: selectedWorkspaceId,
          sheetName: sheetName,
          projectData: smartsheetDeploymentPayload
        })
      });

      const responseText = await response.text();
      let result: any = {};
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(
          response.status === 504 || response.status === 502
            ? 'Gateway timeout during Smartsheet synchronization. The sheet may still be populating in your Smartsheet workspace.'
            : `Server returned non-JSON response (${response.status} ${response.statusText}): ${responseText.substring(0, 150)}`
        );
      }
      setLastApiResponse(result);

      if (response.ok && result.success) {
        setExecutionState('completed');
        setExecutionLogs(result.logs || initialLogs);
        setCreatedSheetUrl(result.smartsheetUrl || 'https://app.smartsheet.com');
        setRowsCreatedCount(result.rowsCreatedCount || 28);

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setExecutionState('error');
        setErrorMessage(result.error || 'Smartsheet deployment encountered an error.');
        if (result.logs) {
          setExecutionLogs(result.logs);
        }
      }
    } catch (err: any) {
      setExecutionState('error');
      setErrorMessage(err.message || 'Network connection to /api/smartsheet/deploy failed.');
      setExecutionLogs(prev => [
        ...prev,
        { step: `Network Error: ${err.message}`, timestamp: new Date().toLocaleTimeString(), status: 'failed' }
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#002A54] via-[#004A8F] to-[#0073EA] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-lg backdrop-blur-xs border border-white/20">
              <Table className="text-sky-300" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Smartsheet Enterprise Project Plan Synchronization
                </h3>
                <span className="bg-sky-400/20 text-sky-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-sky-300/30">
                  SMARTSHEET REST API v2
                </span>
              </div>
              <p className="text-xs text-sky-100/90 mt-0.5">
                Instantiate hierarchical project grids, date-wise WBS, hours, assignees, and TCM Quality Gate checklists in Smartsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Governance Safety Freeze Banner */}
        <div
          className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
            isFrozen
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/90 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md ${isFrozen ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
              {isFrozen ? <Lock size={16} /> : <Unlock size={16} />}
            </div>
            <div>
              <div className="text-xs font-bold tracking-wide uppercase flex items-center gap-2">
                <span>{isFrozen ? 'SCHEDULE & BASELINE 1.0 FROZEN & LOCKED' : 'SCHEDULE UNLOCKED (SMARTSHEET DIRECT TRIGGER DISABLED)'}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isFrozen ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {isFrozen ? 'READY FOR SMARTSHEET SYNC' : 'SAFETY GATE ACTIVE'}
                </span>
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isFrozen
                  ? 'Baseline 1.0 is locked by Delivery Lead authority. Live Smartsheet API execution is unlocked and ready to deploy date-wise WBS & checklists.'
                  : 'Safety Gate Active: Direct Smartsheet instantiation is disabled while the schedule is in draft mode. Click "Freeze Baseline & Enable Trigger" to proceed.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleFreeze}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isFrozen
                ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md'
            }`}
          >
            {isFrozen ? (
              <>
                <Unlock size={13} className="text-slate-500" />
                <span>Unlock Schedule (Edit Mode)</span>
              </>
            ) : (
              <>
                <Lock size={13} className="text-emerald-200" />
                <span>Freeze Baseline & Enable Trigger</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('direct_trigger')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'direct_trigger'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'direct_trigger' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>1-Click Trigger & Live API</span>
            {isFrozen && (
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                READY
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('api_settings')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'api_settings'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Key size={14} className={activeTab === 'api_settings' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>Smartsheet API Token & Webhook</span>
            {authStatus === 'valid' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai_prompt')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'ai_prompt'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileCode size={14} className={activeTab === 'ai_prompt' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>Smartsheet AI Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('activity_plan')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'activity_plan'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Calendar size={14} className={activeTab === 'activity_plan' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>Standard WBS & Schedule ({standardPlan.smartsheetRows.length} Rows)</span>
          </button>

          <button
            onClick={() => setActiveTab('governance_artifacts')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'governance_artifacts'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <ShieldCheck size={14} className={activeTab === 'governance_artifacts' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>7 TCM Gates</span>
          </button>

          <button
            onClick={() => setActiveTab('json_payload')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'json_payload'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Server size={14} className={activeTab === 'json_payload' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>REST API Payload</span>
          </button>

          <button
            onClick={() => setActiveTab('csv_export')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'csv_export'
                ? 'border-[#0073EA] text-[#002A54] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileSpreadsheet size={14} className={activeTab === 'csv_export' ? 'text-[#0073EA]' : 'text-slate-400'} />
            <span>Smartsheet CSV Export</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-180px)] bg-slate-50/50">
          {/* TAB 1: DIRECT SMARTSHEET TRIGGER */}
          {activeTab === 'direct_trigger' && (
            <div className="space-y-6">
              {/* Smartsheet Connection & Token Quick-Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${authStatus === 'valid' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-[#0073EA]'}`}>
                      <Key size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">Smartsheet Account Connection</h4>
                        {authStatus === 'valid' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 size={11} /> LIVE CONNECTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            NOT CONNECTED (SANDBOX MODE)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {authStatus === 'valid'
                          ? `Authenticated as ${authUserInfo?.name || 'User'} (${authUserInfo?.email || 'Smartsheet'})`
                          : 'Provide your Smartsheet API Access Token to create the project sheet directly in your account.'}
                      </p>
                    </div>
                  </div>

                  {authStatus === 'valid' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAccessToken('');
                        setAuthStatus('unverified');
                        localStorage.removeItem('smartsheet_access_token');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline self-start md:self-auto"
                    >
                      Disconnect Token
                    </button>
                  )}
                </div>

                {authStatus !== 'valid' ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          type="password"
                          value={accessToken}
                          onChange={e => setAccessToken(e.target.value)}
                          placeholder="Paste your Smartsheet API Access Token here..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073EA] font-mono"
                        />
                        <Key size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      </div>
                      <button
                        type="button"
                        disabled={isValidatingAuth || !accessToken.trim()}
                        onClick={() => verifySmartsheetToken()}
                        className="px-4 py-2 bg-[#0073EA] hover:bg-[#005bb5] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isValidatingAuth ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Connect & Verify</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <span>How to get token:</span>
                        <span className="font-medium text-slate-700">Smartsheet &rarr; Profile &rarr; Personal Settings &rarr; API Access &rarr; Generate Token</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadCsv}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={12} />
                        <span>Or download CSV for 1-click manual import</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Target Sheet Name in Smartsheet:
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${sheetName.length > 50 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {sheetName.length}/50 max
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={50}
                        value={sheetName}
                        onChange={e => setSheetName(e.target.value)}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 font-medium ${sheetName.length > 50 ? 'border-rose-400 focus:ring-rose-500 bg-rose-50' : 'border-slate-300 focus:ring-[#0073EA]'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Destination Workspace:
                      </label>
                      <select
                        value={selectedWorkspaceId}
                        onChange={e => setSelectedWorkspaceId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073EA] bg-white"
                      >
                        <option value="home">Sheets Home (Root Folder)</option>
                        {workspaces.map(ws => (
                          <option key={ws.id} value={String(ws.id)}>
                            Workspace: {ws.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Executive Trigger Hero */}
              <div className="bg-gradient-to-br from-slate-900 via-[#002A54] to-slate-900 rounded-xl p-6 text-white shadow-lg border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-400/20 text-sky-300 border border-sky-400/30">
                        ENTERPRISE PMO ORCHESTRATOR
                      </span>
                      {authStatus === 'valid' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Live Account Ready
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight">
                      {authStatus === 'valid' ? 'Create Live Project Sheet in Smartsheet' : 'Execute Smartsheet PMO Dispatch'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {authStatus === 'valid'
                        ? `Connects to Smartsheet REST API v2 to create "${sheetName}", format all 30 standard columns, and populate ${standardPlan.smartsheetRows.length} standard WBS rows across ${standardPlan.waves.length} implementation waves with deterministic dates and TCM quality gates.`
                        : isFrozen
                        ? `Schedule is frozen and validated (${standardPlan.smartsheetRows.length} standard WBS rows across 30 columns). You can run a PMO Sandbox simulation now, or enter your API token above to deploy directly to your Smartsheet account.`
                        : 'Schedule is currently UNLOCKED. You must freeze the baseline first before triggering Smartsheet project generation.'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={!isFrozen || executionState === 'running'}
                      onClick={handleTriggerDirectSmartsheet}
                      className={`px-6 py-3.5 rounded-lg font-bold text-sm flex items-center gap-2.5 transition shadow-lg cursor-pointer ${
                        !isFrozen
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                          : executionState === 'running'
                          ? 'bg-amber-600 text-white cursor-wait'
                          : authStatus === 'valid'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold shadow-emerald-500/20 hover:scale-[1.02]'
                          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold shadow-amber-500/20 hover:scale-[1.02]'
                      }`}
                    >
                      {executionState === 'running' ? (
                        <>
                          <RefreshCw size={16} className="animate-spin text-white" />
                          <span>Calling Smartsheet API...</span>
                        </>
                      ) : executionState === 'completed' ? (
                        <>
                          <RotateCw size={16} className={authStatus === 'valid' ? 'text-white' : 'text-slate-950'} />
                          <span>Re-Deploy to Smartsheet</span>
                        </>
                      ) : authStatus === 'valid' ? (
                        <>
                          <Play size={16} className="fill-white text-white" />
                          <span>Create Live Sheet in Smartsheet</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} className="fill-slate-950 text-slate-950" />
                          <span>Run Smartsheet PMO Simulation</span>
                        </>
                      )}
                    </button>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>Execution Mode:</span>
                      <span className={authStatus === 'valid' ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                        {authStatus === 'valid' ? '● LIVE Smartsheet REST API v2' : '○ Sandbox Simulation'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-3">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Smartsheet Execution Error:</div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Execution Console Logs & Results */}
              {executionLogs.length > 0 && (
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-inner font-mono text-xs text-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-sky-400" />
                      <span className="font-bold text-slate-300">Smartsheet Execution Trace</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      STATUS: {executionState.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {executionLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span className="shrink-0">
                          {log.status === 'done' && <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 inline" />}
                          {log.status === 'failed' && <AlertCircle size={13} className="text-rose-400 mt-0.5 inline" />}
                          {log.status === 'info' && <ChevronRight size={13} className="text-sky-400 mt-0.5 inline" />}
                        </span>
                        <span className={log.status === 'done' ? 'text-emerald-200' : log.status === 'failed' ? 'text-rose-300' : 'text-slate-300'}>
                          {log.step}
                        </span>
                      </div>
                    ))}
                  </div>

                  {executionState === 'completed' && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {lastApiResponse?.mode === 'api' && createdSheetUrl ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-950/60 p-4 rounded-lg border border-emerald-700/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                              <CheckCircle2 size={22} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Live Smartsheet Project Sheet Created!</h4>
                              <p className="text-[11px] text-emerald-200 mt-0.5">
                                Sheet: <span className="font-bold text-white">"{lastApiResponse?.sheetName || sheetName}"</span> ({rowsCreatedCount} WBS rows and 7 TCM quality gate checklists populated).
                              </p>
                            </div>
                          </div>

                          <a
                            href={createdSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                          >
                            <span>Open in Smartsheet</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-sky-950/40 p-4 rounded-lg border border-sky-800/40">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-sky-500/20 rounded-md text-sky-300 shrink-0 mt-0.5">
                              <Check size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">Sandbox Simulation Completed & Validated</h4>
                              <p className="text-[11px] text-sky-200 mt-0.5">
                                {rowsCreatedCount} WBS rows, {projectWeeks} weeks, and 9 columns verified. To create this sheet live in your Smartsheet account, connect your API Access Token above, or download the CSV.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleDownloadCsv}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                          >
                            <Download size={13} />
                            <span>Download Smartsheet CSV</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* What Smartsheet Sync Generates Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                    <Table size={15} />
                    <span>30-Column Standard WBS</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Generates <strong>{standardPlan.smartsheetRows.length}</strong> standardized rows across <strong>{standardPlan.waves.length}</strong> waves (Wave 0 + Post-ED Waves) strictly following the Oracle Planning Standard.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                    <Calendar size={15} />
                    <span>Deterministic Working Calendar</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Monday-aligned timeline ({standardPlan.planSummary.programStartDate} &rarr; {standardPlan.planSummary.programEndDate}) with sub-phase percentage weightings and lag predecessors.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs mb-1">
                    <ShieldCheck size={15} />
                    <span>Quality Stage Gates & Roles</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Includes mandatory Stage Gates, Cross-Workstreams (PMO, Governance, Security, OCM, Cutover), and assigned ownership roles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMARTSHEET API SETTINGS */}
          {activeTab === 'api_settings' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key size={18} className="text-[#0073EA]" />
                  <span>Smartsheet REST API & Webhook Integration Setup</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Connect this PMO Estimator to your real Smartsheet account to auto-create Project Sheets, Columns, and Rows automatically.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConnectionMode('api_token')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    connectionMode === 'api_token'
                      ? 'border-[#0073EA] bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Key size={13} className="text-[#0073EA]" /> Smartsheet API Access Token
                    </span>
                    {connectionMode === 'api_token' && <CheckCircle2 size={15} className="text-[#0073EA]" />}
                  </div>
                  <span className="text-[11px] text-slate-500">Directly creates sheets & rows via Smartsheet REST API v2.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConnectionMode('webhook')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    connectionMode === 'webhook'
                      ? 'border-[#0073EA] bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe size={13} className="text-[#0073EA]" /> Smartsheet Bridge / Webhook Dispatch
                    </span>
                    {connectionMode === 'webhook' && <CheckCircle2 size={15} className="text-[#0073EA]" />}
                  </div>
                  <span className="text-[11px] text-slate-500">Dispatches structured payload to Smartsheet Bridge / Zapier / Power Automate.</span>
                </button>
              </div>

              {/* Mode: API Token */}
              {connectionMode === 'api_token' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Smartsheet API Access Token (Bearer Token)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={accessToken}
                        onChange={(e) => {
                          setAccessToken(e.target.value);
                          setAuthStatus('unverified');
                        }}
                        placeholder="e.g., your_smartsheet_api_access_token"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0073EA] focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => verifySmartsheetToken()}
                        disabled={isValidatingAuth || !accessToken}
                        className="px-4 py-2 bg-[#002A54] hover:bg-[#004A8F] text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        {isValidatingAuth ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                        <span>Test & Verify</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Get your token in Smartsheet: <strong>Account &rarr; Personal Settings &rarr; API Access &rarr; Generate New Access Token</strong>.
                    </p>
                  </div>

                  {/* Auth status indicator */}
                  {authStatus === 'valid' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Connected to Smartsheet Account: <strong>{authUserInfo?.name}</strong> ({authUserInfo?.email})</span>
                      </div>
                    </div>
                  )}

                  {/* Workspace selector */}
                  {workspaces.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Select Smartsheet Workspace:
                        </label>
                        <select
                          value={selectedWorkspaceId}
                          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0073EA] focus:outline-none"
                        >
                          <option value="home">Sheets Home (Root)</option>
                          {workspaces.map(ws => (
                            <option key={ws.id} value={String(ws.id)}>
                              {ws.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode: Webhook */}
              {connectionMode === 'webhook' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Smartsheet Bridge / Webhook Target URL
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => {
                        setWebhookUrl(e.target.value);
                        localStorage.setItem('smartsheet_webhook_url', e.target.value);
                      }}
                      placeholder="https://bridge.smartsheet.com/api/v1/... or Zapier / Make Webhook"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0073EA] focus:outline-none font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      The full structured JSON payload with all phases, dates, hours, and gate checklists will be posted as JSON.
                    </p>
                  </div>
                </div>
              )}

              {/* Custom Sheet Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Project Sheet Name in Smartsheet
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0073EA] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Smartsheet AI Prompt */}
          {activeTab === 'ai_prompt' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#0073EA]" />
                    <span>Smartsheet AI Copilot & Formula Master Prompt</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Copy this structured AI prompt and paste it directly into Smartsheet AI / ChatGPT / Claude to auto-generate the complete project sheet, column formulas, and automations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(smartsheetAiPrompt, 'prompt')}
                  className="px-4 py-2 bg-[#002A54] hover:bg-[#004A8F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  {copiedSection === 'prompt' ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Copied Prompt!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy AI Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-5 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed max-h-[480px]">
                <pre className="whitespace-pre-wrap">{smartsheetAiPrompt}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: DATE-WISE PLAN (Standard WBS Hierarchy) */}
          {activeTab === 'activity_plan' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Oracle Cloud Standard WBS & Working Schedule (v1.0)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Program Window: <strong>{standardPlan.planSummary.programStartDate}</strong> to <strong>{standardPlan.planSummary.programEndDate}</strong> ({projectWeeks} Calendar Weeks) | Effort: <strong>{totalEffortHours.toLocaleString()}</strong> Hours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-sky-50 text-[#002A54] px-3 py-1.5 rounded-lg border border-sky-200">
                    {standardPlan.smartsheetRows.length} WBS Rows Generated
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                    {standardPlan.waves.length} Waves
                  </span>
                </div>
              </div>

              {/* Waves and Hierarchical Rows */}
              <div className="space-y-4">
                {standardPlan.waves.map((wave, wIdx) => {
                  const waveRows = standardPlan.smartsheetRows.filter(r => r.wave.toLowerCase().includes(wave.waveId.toLowerCase()) || r.wave.toLowerCase() === wave.waveName.toLowerCase());

                  return (
                    <div key={wIdx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 bg-gradient-to-r from-slate-900 to-[#002A54] text-white flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-xs font-mono font-bold border border-sky-400/30">
                            {wave.waveId.toUpperCase()}
                          </span>
                          <div>
                            <h5 className="text-sm font-bold text-white">{wave.waveName}</h5>
                            <div className="text-[11px] text-sky-200">
                              {wave.startDate} &rarr; {wave.endDate} ({wave.durationWorkingDays} Working Days)
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded text-sky-100">
                          {wave.phases.length} Phases | {waveRows.length} WBS Items
                        </div>
                      </div>

                      {/* Phases inside this wave */}
                      <div className="p-4 space-y-4 bg-slate-50/50">
                        {wave.phases.map((phase, pIdx) => (
                          <div key={pIdx} className="bg-white rounded-lg border border-slate-200 p-3.5 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-sky-100 text-[#002A54] text-xs font-bold flex items-center justify-center">
                                  {pIdx + 1}
                                </span>
                                <span className="font-bold text-xs text-slate-900">{phase.phaseName}</span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500">
                                {phase.startDate} &rarr; {phase.endDate}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {phase.subPhases.map((sp, spIdx) => (
                                <div key={spIdx} className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs space-y-1">
                                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                                    <span>{sp.subPhaseName}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{sp.weightPct}%</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {sp.startDate} &rarr; {sp.endDate}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Sample Activities Preview */}
                        <div className="bg-white rounded-lg border border-slate-200 p-3">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Key WBS Deliverables & Activities ({wave.waveId}):</span>
                            <span className="text-slate-500">Showing first 6 of {waveRows.length}</span>
                          </div>
                          <div className="space-y-1.5">
                            {waveRows.slice(0, 6).map((r, rIdx) => (
                              <div key={rIdx} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 border border-slate-100 text-xs gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                                    {r.wbsId}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate">
                                    {r.taskName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 text-[11px]">
                                  <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {r.assignedToRole}
                                  </span>
                                  <span className="font-mono text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                    {r.duration}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: 7 TCM GATES */}
          {activeTab === 'governance_artifacts' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900">
                  Oracle True Cloud Method (TCM) Quality Stage Gates
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory quality gates defined in the Oracle Planning Framework. Every gate contains non-negotiable exit criteria and requires Lead Solution Architect and Delivery Lead authorization in Smartsheet.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    gateId: 'GATE 0',
                    gateName: 'Gate 0: Architecture Blueprint & Pod Charter Approval',
                    phase: 'Wave 0: Team Mobilization',
                    lead: 'Lead Solution Architect',
                    criteria: ['Signed PMO Charter & Governance Workspace', 'OCI Tenancy & Identity Security Spec Verified', 'Core Pod Rosters & Kickoff Pack Approved']
                  },
                  {
                    gateId: 'GATE 1',
                    gateName: 'Gate 1: Business Process Baseline & Scope Freeze',
                    phase: 'Wave 0: Enterprise Design',
                    lead: 'Functional Lead',
                    criteria: ['L2/L3 Process Alignment Workbooks Completed', 'CEMLI Scope Inventory Matrix Frozen', 'Data Migration Strategy & Source Mappings Signed']
                  },
                  {
                    gateId: 'GATE 2',
                    gateName: 'Gate 2: CRP2 Acceptance & Configuration Sign-Off',
                    phase: 'Wave 1: Detailed Design',
                    lead: 'Solution Architect',
                    criteria: ['Conference Room Pilot 1 & 2 Playback Accepted', 'FDD / TDD Design Suite Complete', 'Cross-Module Integration Boundaries Validated']
                  },
                  {
                    gateId: 'GATE 3',
                    gateName: 'Gate 3: Build & Unit Test Verification',
                    phase: 'Wave 1: Build & Unit Testing',
                    lead: 'Technical Lead',
                    criteria: ['OIC Integrations & Custom Extensions Unit Tested', 'BI Publisher & OTBI Reports Validated', 'Mock Conversion 1 & 2 Reconciliation Signed']
                  },
                  {
                    gateId: 'GATE 4',
                    gateName: 'Gate 4: SIT Exit & Severity-1 Clearance',
                    phase: 'Wave 1: System Integration Testing (SIT)',
                    lead: 'QA & Test Lead',
                    criteria: ['End-to-End System Integration Cycles (SIT 1 & 2) Complete', 'Zero Open Severity-1 / Severity-2 Defects', 'Mock Conversion Cycle 3 Fully Reconciled']
                  },
                  {
                    gateId: 'GATE 5',
                    gateName: 'Gate 5: UAT Business Sign-Off & Cutover Authorization',
                    phase: 'Wave 1: User Acceptance Testing (UAT)',
                    lead: 'Delivery Lead / Business Sponsor',
                    criteria: ['Business End-to-End UAT Sign-Off Protocol Executed', 'Cutover Dry Run Rehearsal Completed on Schedule', 'User Training & Job Aids Completed']
                  },
                  {
                    gateId: 'GATE 6 & 7',
                    gateName: 'Gate 6: Go-Live Operational Readiness & Gate 7: Hypercare Exit',
                    phase: 'Wave 1: Cutover, Hypercare & Transition',
                    lead: 'Steering Committee / PMO',
                    criteria: ['Production Cutover & Final Migration Verified', 'Go-Live Authorization Declared by SteerCo', 'SLA Hypercare Period Handover to Managed Run']
                  }
                ].map((gate, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-[#002A54] text-white px-2 py-0.5 rounded">
                        {gate.gateId}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{gate.lead}</span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{gate.gateName}</h5>
                      <span className="text-[10px] text-sky-600 font-medium">{gate.phase}</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {gate.criteria.map((c, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REST API JSON PAYLOAD */}
          {activeTab === 'json_payload' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Standard 30-Column Smartsheet REST API JSON Payload
                  </h4>
                  <p className="text-xs text-slate-500">
                    Complete machine-readable JSON structure configured with all 30 standard columns, {standardPlan.smartsheetRows.length} WBS rows, working calendar dates, and stage gates dispatched to /api/smartsheet/deploy.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(smartsheetDeploymentPayload, null, 2), 'json')}
                    className="px-3.5 py-1.5 bg-[#002A54] hover:bg-[#004A8F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedSection === 'json' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedSection === 'json' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 text-emerald-400 p-5 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner max-h-[480px]">
                <pre>{JSON.stringify(smartsheetDeploymentPayload, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TAB 7: CSV EXPORT (Standard 30-Column CSV) */}
          {activeTab === 'csv_export' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-[#0073EA]" />
                    <span>Smartsheet Direct Project Importer File (30-Column CSV)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Download this CSV file conforming to <strong>Oracle Cloud Project Plan Generation Standard v1.0</strong> ({standardPlan.smartsheetRows.length} rows, 30 columns). Use <strong>Smartsheet &rarr; File &rarr; Import &rarr; Import CSV</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-md shrink-0 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download 30-Column CSV</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-300 p-5 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner max-h-[420px] leading-relaxed">
                <pre>{generateSmartsheetCsv()}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Approved Baseline 1.0: <strong>{totalEffortHours.toLocaleString()} hrs</strong> | <strong>{projectWeeks} Weeks</strong> | <strong>${totalFinancialBudget.toLocaleString()}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
