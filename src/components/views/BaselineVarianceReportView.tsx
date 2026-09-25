import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Edit3,
  Check,
  X,
  FileText,
  Sliders,
  DollarSign,
  Clock,
  Layers,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Printer,
  Info,
  Save,
  RotateCcw
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, UploadedBaselineData, BaselinePhaseItem } from '../../types';
import {
  createDefaultLeadershipBaseline,
  parseUploadedBaselineFile,
  exportBaselineTemplateCsv,
  exportBaselineVarianceReportCsv,
  getPhaseVarianceRationale
} from '../../utils/baselineParser';

interface BaselineVarianceReportViewProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onSaveScenario?: () => void;
}

export const BaselineVarianceReportView: React.FC<BaselineVarianceReportViewProps> = ({
  scenario,
  data,
  onUpdateScenario,
  onSaveScenario
}) => {
  // Use scenario's stored baseline or generate realistic default leadership baseline
  const activeBaseline = useMemo<UploadedBaselineData>(() => {
    if (scenario.uploadedBaseline && scenario.uploadedBaseline.phases.length > 0) {
      return scenario.uploadedBaseline;
    }
    return createDefaultLeadershipBaseline(scenario, data);
  }, [scenario.uploadedBaseline, scenario, data]);

  // Local state for interactive editing and display
  const [unitMode, setUnitMode] = useState<'hours' | 'days'>('hours');
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editAiSaving, setEditAiSaving] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [selectedPhaseDetail, setSelectedPhaseDetail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'visualizer' | 'steerco_defense'>('matrix');

  // Multiplier for display
  const unitFactor = unitMode === 'hours' ? 1 : 1 / 8;
  const unitLabel = unitMode === 'hours' ? 'hrs' : 'days';

  // Metrics
  const totalBaselineEffort = activeBaseline.totalBaselineHours * unitFactor;
  const totalNetBaselineEffort = activeBaseline.netBaselineHours * unitFactor;
  const engineP50Effort = (data.p50_BaselineHours || data.targetHours || 0) * unitFactor;
  const engineP80Effort = (data.p80_DefensibleHours || data.targetHours * 1.15) * unitFactor;

  // Variances vs Raw Baseline
  const deltaRawEffort = engineP50Effort - totalBaselineEffort;
  const deltaRawPct = totalBaselineEffort > 0 ? (deltaRawEffort / totalBaselineEffort) * 100 : 0;

  // Variances vs Net Target (Post-AI Excel)
  const deltaNetEffort = engineP50Effort - totalNetBaselineEffort;
  const deltaNetPct = totalNetBaselineEffort > 0 ? (deltaNetEffort / totalNetBaselineEffort) * 100 : 0;

  // Commercial variance
  const blendedRate = data.blendedCostRate || data.blendedBillRate || 145;
  const baselineCost = activeBaseline.totalBaselineCost || (activeBaseline.totalBaselineHours * blendedRate);
  const engineCost = data.deliveryCost || (engineP50Effort * blendedRate);
  const costSavings = baselineCost - engineCost;
  const costSavingsPct = baselineCost > 0 ? (costSavings / baselineCost) * 100 : 0;

  // Handler: Upload File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsedBaseline = await parseUploadedBaselineFile(buffer, file.name, data);

      if (onUpdateScenario) {
        onUpdateScenario(prev => ({
          ...prev,
          uploadedBaseline: parsedBaseline
        }));
      }
      setUploadSuccessMessage(`Successfully ingested "${file.name}" (${parsedBaseline.phases.length} phases reconciled).`);
    } catch (err: any) {
      console.error('Error parsing baseline file:', err);
      setUploadError(err.message || 'Failed to parse Excel file. Ensure valid headers for phases and hours.');
    } finally {
      setIsUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  // Handler: Reset to default leadership baseline
  const handleResetToDefault = () => {
    const defaultBaseline = createDefaultLeadershipBaseline(scenario, data);
    if (onUpdateScenario) {
      onUpdateScenario(prev => ({
        ...prev,
        uploadedBaseline: defaultBaseline
      }));
    }
    setUploadSuccessMessage('Reverted to SteerCo Mandated Baseline Model.');
    setUploadError(null);
  };

  // Handler: Download baseline template
  const handleDownloadTemplate = () => {
    const csvContent = exportBaselineTemplateCsv(scenario, data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Oracle_Fusion_Baseline_Template_${scenario.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler: Export variance report
  const handleExportVarianceReport = () => {
    const csvContent = exportBaselineVarianceReportCsv(activeBaseline, data, scenario);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Baseline_Variance_Report_${scenario.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler: Start Editing Phase
  const handleStartEdit = (phase: BaselinePhaseItem) => {
    setEditingPhaseId(phase.phaseId);
    setEditHours(phase.baselineHours);
    setEditAiSaving(phase.aiSavingPct);
  };

  // Handler: Save Edited Phase
  const handleSaveEdit = (phaseId: string) => {
    if (!onUpdateScenario) return;

    onUpdateScenario(prev => {
      const current = prev.uploadedBaseline || activeBaseline;
      const updatedPhases = current.phases.map(p => {
        if (p.phaseId === phaseId) {
          const newHours = Math.max(0, editHours);
          const newDays = Math.round(newHours / 8);
          const newSaving = Math.min(100, Math.max(0, editAiSaving));
          const netHours = Math.round(newHours * (1 - newSaving / 100));
          const netDays = Math.round(netHours / 8);
          return {
            ...p,
            baselineHours: newHours,
            baselineDays: newDays,
            aiSavingPct: newSaving,
            netBaselineHours: netHours,
            netBaselineDays: netDays
          };
        }
        return p;
      });

      const totalHours = updatedPhases.reduce((acc, p) => acc + p.baselineHours, 0);
      const totalDays = Math.round(totalHours / 8);
      const netHours = updatedPhases.reduce((acc, p) => acc + p.netBaselineHours, 0);
      const netDays = Math.round(netHours / 8);
      const overallAiSaving = totalHours > 0 ? Number((((totalHours - netHours) / totalHours) * 100).toFixed(1)) : 0;

      return {
        ...prev,
        uploadedBaseline: {
          ...current,
          totalBaselineHours: totalHours,
          totalBaselineDays: totalDays,
          netBaselineHours: netHours,
          netBaselineDays: netDays,
          overallAiSavingPct: overallAiSaving,
          phases: updatedPhases
        }
      };
    });

    setEditingPhaseId(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / Ingestion Control Bar */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xs bg-indigo-900 text-white shadow-xs">
              <FileSpreadsheet size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5">
              Phase-Wise Baseline & AI Savings Reconciliation
            </span>
            {activeBaseline.isCustomUploaded ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 flex items-center gap-1">
                <CheckCircle2 size={11} /> User Uploaded Excel
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 flex items-center gap-1">
                <Info size={11} /> SteerCo Baseline Preset
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Baseline Variance Report (AI Estimations vs Excel Baseline)
          </h2>
          <p className="text-xs text-slate-500 max-w-3xl">
            Visualizes and audits the mathematical variance between the AI-synthesized estimation model (PB-Estimo)
            and the leadership-stipulated or client-uploaded baseline spreadsheet, comparing raw effort, stated AI efficiency targets, and post-AI net effort.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <label className="relative inline-flex items-center justify-center px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs border border-indigo-600">
            <Upload size={13} className="mr-1.5" />
            <span>{isUploading ? 'Ingesting...' : 'Upload Baseline Excel'}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              disabled={isUploading}
            />
          </label>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
            title="Reload realistic SteerCo benchmark baseline"
          >
            <RotateCcw size={13} />
            <span>Reset Sample</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
            title="Download blank CSV template with current project phases"
          >
            <Download size={13} />
            <span>Blank Template</span>
          </button>

          <button
            type="button"
            onClick={handleExportVarianceReport}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-emerald-500 cursor-pointer shadow-xs"
            title="Export full variance audit ledger as CSV"
          >
            <FileText size={13} />
            <span>Export CSV Report</span>
          </button>

          {onSaveScenario && (
            <button
              type="button"
              onClick={onSaveScenario}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-800 cursor-pointer"
              title="Persist this baseline to cloud proposal"
            >
              <Save size={13} />
              <span>Save Scenario</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {uploadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xs text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span><strong>Upload Error:</strong> {uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {uploadSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xs text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{uploadSuccessMessage}</span>
          </div>
          <button onClick={() => setUploadSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Baseline Metadata Strip */}
      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="font-semibold text-slate-800">Source Document:</span>{' '}
            <span className="font-mono text-indigo-700 font-bold">{activeBaseline.sourceFileName}</span>
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div>
            <span className="font-semibold text-slate-800">Baseline Version:</span>{' '}
            <span className="font-mono text-slate-700">{activeBaseline.version || 'v2.4'}</span>
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div>
            <span className="font-semibold text-slate-800">Reconciled Proposal:</span>{' '}
            <span className="font-bold text-slate-900">{scenario.name}</span>
          </div>
        </div>

        {/* Units Toggle */}
        <div className="flex items-center gap-1 bg-white border border-slate-300 p-0.5">
          <button
            type="button"
            onClick={() => setUnitMode('hours')}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
              unitMode === 'hours' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hours (hrs)
          </button>
          <button
            type="button"
            onClick={() => setUnitMode('days')}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
              unitMode === 'days' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Person Days (8h)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 EXECUTIVE VARIANCE KPI CARDS                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Uploaded Raw Baseline */}
        <div className="bg-white border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span>1. Excel Raw Baseline</span>
              <FileSpreadsheet size={13} className="text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {Math.round(totalBaselineEffort).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Estimated Baseline Cost:{' '}
              <span className="font-mono font-bold text-slate-800">${(baselineCost / 1000).toFixed(0)}k</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Uncompressed historical baseline
          </div>
        </div>

        {/* Card 2: Stated AI Savings Target */}
        <div className="bg-white border border-indigo-200 p-4 shadow-2xs flex flex-col justify-between bg-indigo-50/20">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center justify-between">
              <span>2. Excel Stated AI Target</span>
              <Sparkles size={13} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-900">
              {Math.round(totalNetBaselineEffort).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
            </div>
            <div className="text-[11px] text-indigo-700 font-bold mt-1 flex items-center gap-1">
              <TrendingDown size={12} />
              <span>Stated Discount: -{activeBaseline.overallAiSavingPct}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-indigo-100 text-[10px] text-slate-500">
            Target after spreadsheet AI discount
          </div>
        </div>

        {/* Card 3: AI Engine Estimation (PB-Estimo) */}
        <div className="bg-white border border-emerald-200 p-4 shadow-2xs flex flex-col justify-between bg-emerald-50/20">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center justify-between">
              <span>3. AI Engine Estimate (P50)</span>
              <ShieldCheck size={13} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-900">
              {Math.round(engineP50Effort).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">{unitLabel}</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Defensible P80 Floor:{' '}
              <span className="font-mono font-bold text-slate-800">
                {Math.round(engineP80Effort).toLocaleString()} {unitLabel}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-100 text-[10px] text-slate-500">
            Staffed bottom-up WBS delivery
          </div>
        </div>

        {/* Card 4: Net Variance vs Raw Baseline */}
        <div className="bg-white border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
              <span>4. Variance vs Raw</span>
              {deltaRawEffort <= 0 ? (
                <TrendingDown size={13} className="text-emerald-600" />
              ) : (
                <TrendingUp size={13} className="text-amber-600" />
              )}
            </div>
            <div className={`text-2xl font-bold font-mono ${deltaRawEffort <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {deltaRawEffort > 0 ? '+' : ''}{Math.round(deltaRawEffort).toLocaleString()}{' '}
              <span className="text-xs font-normal">({deltaRawPct > 0 ? '+' : ''}{deltaRawPct.toFixed(1)}%)</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              {deltaRawEffort <= 0 ? (
                <span className="text-emerald-700 font-bold">Engine Accelerated vs Baseline</span>
              ) : (
                <span className="text-amber-700 font-bold">Engine Buffers Added</span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Delta from Excel baseline
          </div>
        </div>

        {/* Card 5: Net Variance vs AI Stated Target */}
        <div className="bg-white border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
              <span>5. Target Alignment</span>
              <DollarSign size={13} className="text-indigo-600" />
            </div>
            <div className={`text-2xl font-bold font-mono ${Math.abs(deltaNetPct) <= 8 ? 'text-indigo-700' : (deltaNetEffort < 0 ? 'text-emerald-700' : 'text-amber-700')}`}>
              {deltaNetEffort > 0 ? '+' : ''}{Math.round(deltaNetEffort).toLocaleString()}{' '}
              <span className="text-xs font-normal">({deltaNetPct > 0 ? '+' : ''}{deltaNetPct.toFixed(1)}%)</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Cost Variance:{' '}
              <span className={`font-mono font-bold ${costSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {costSavings >= 0 ? '-' : '+'}${Math.abs(Math.round(costSavings / 1000)).toLocaleString()}k
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            Reconciliation with leadership target
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>Phase Variance Audit Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visualizer')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'visualizer'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingDown size={14} />
            <span>Visual Delta & AI Waterfall</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steerco_defense')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'steerco_defense'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Leadership & SteerCo Defense Brief</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-2">
          <span>Click any cell to edit baseline inputs directly</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DETAILED PHASE-WISE VARIANCE AUDIT LEDGER                          */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Phase-by-Phase Estimation & AI Variance Audit Ledger
              </h3>
              <p className="text-[11px] text-slate-500">
                Shows exact differences between Excel baseline hours, stated AI discount %, and PB-Estimo staffed P50/P80 calculations.
              </p>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-600">
              Total Duration: <strong>{scenario.projectWeeks} Weeks</strong> | Delivery Model:{' '}
              <strong className="uppercase">{scenario.phaseDeliveryModel || 'sequential'}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3">Phase Code & Name</th>
                  <th className="p-3 text-right">Timeline</th>
                  <th className="p-3 text-right">Excel Baseline</th>
                  <th className="p-3 text-right">Excel AI Saving %</th>
                  <th className="p-3 text-right">Excel Net Target</th>
                  <th className="p-3 text-right text-emerald-300">Engine P50</th>
                  <th className="p-3 text-right text-indigo-300">Engine P80</th>
                  <th className="p-3 text-right">Variance vs Raw</th>
                  <th className="p-3 text-right">Variance vs Net</th>
                  <th className="p-3 text-center">Variance Health</th>
                  <th className="p-3">Architectural Rationale</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeBaseline.phases.map((bp, idx) => {
                  const enginePhase = data.phaseHours.find(p => p.id === bp.phaseId || p.code === bp.phaseCode);
                  const engineHours = enginePhase ? enginePhase.hours : 0;
                  const engineEffort = engineHours * unitFactor;
                  const engineP80 = engineEffort * 1.15;

                  const baselineEffort = (unitMode === 'hours' ? bp.baselineHours : bp.baselineDays);
                  const netBaselineEffort = (unitMode === 'hours' ? bp.netBaselineHours : bp.netBaselineDays);

                  const deltaRaw = engineEffort - baselineEffort;
                  const deltaRawPercentage = baselineEffort > 0 ? (deltaRaw / baselineEffort) * 100 : 0;

                  const deltaNet = engineEffort - netBaselineEffort;
                  const deltaNetPercentage = netBaselineEffort > 0 ? (deltaNet / netBaselineEffort) * 100 : 0;

                  const isEditing = editingPhaseId === bp.phaseId;

                  // Health classification
                  let healthLabel = 'ALIGNED';
                  let healthColor = 'bg-blue-100 text-blue-800 border-blue-200';
                  if (deltaRawPercentage <= -10) {
                    healthLabel = 'ACCELERATED';
                    healthColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  } else if (deltaRawPercentage >= 10) {
                    healthLabel = 'EXPANSION / RISK';
                    healthColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  }

                  const rationale = getPhaseVarianceRationale(bp.phaseId || bp.phaseCode, deltaRawPercentage, scenario);

                  return (
                    <tr
                      key={bp.phaseId || idx}
                      className={`hover:bg-slate-50/80 transition ${
                        selectedPhaseDetail === bp.phaseId ? 'bg-indigo-50/40' : (idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white')
                      }`}
                    >
                      {/* Phase Name */}
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-indigo-600" />
                        <div>
                          <div className="font-bold">{bp.phaseName}</div>
                          <div className="font-mono text-[10px] text-slate-400 font-normal">{bp.phaseCode}</div>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="p-3 text-right font-mono text-slate-600">
                        {enginePhase ? `Wk ${enginePhase.startWeek}-${enginePhase.endWeek}` : `${bp.durationWeeks || 4} wks`}
                      </td>

                      {/* Excel Baseline */}
                      <td className="p-3 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={unitMode === 'hours' ? editHours : Math.round(editHours / 8)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditHours(unitMode === 'hours' ? val : val * 8);
                            }}
                            className="w-20 px-1.5 py-0.5 border border-indigo-500 font-mono text-xs text-right bg-white"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">
                            {Math.round(baselineEffort).toLocaleString()} {unitLabel}
                          </span>
                        )}
                      </td>

                      {/* Stated AI Saving % */}
                      <td className="p-3 text-right font-mono">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editAiSaving}
                              onChange={(e) => setEditAiSaving(parseFloat(e.target.value) || 0)}
                              className="w-14 px-1.5 py-0.5 border border-indigo-500 font-mono text-xs text-right bg-white"
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 text-[11px]">
                            -{bp.aiSavingPct}%
                          </span>
                        )}
                      </td>

                      {/* Excel Net Target */}
                      <td className="p-3 text-right font-mono font-bold text-indigo-900">
                        {Math.round(netBaselineEffort).toLocaleString()} {unitLabel}
                      </td>

                      {/* Engine P50 */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                        {Math.round(engineEffort).toLocaleString()} {unitLabel}
                      </td>

                      {/* Engine P80 */}
                      <td className="p-3 text-right font-mono text-slate-600 bg-slate-50/50">
                        {Math.round(engineP80).toLocaleString()} {unitLabel}
                      </td>

                      {/* Delta vs Raw */}
                      <td className="p-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            deltaRaw <= 0 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {deltaRaw > 0 ? '+' : ''}
                          {Math.round(deltaRaw).toLocaleString()} ({deltaRawPercentage > 0 ? '+' : ''}
                          {deltaRawPercentage.toFixed(1)}%)
                        </span>
                      </td>

                      {/* Delta vs Net Target */}
                      <td className="p-3 text-right font-mono">
                        <span
                          className={`text-[11px] ${
                            Math.abs(deltaNetPercentage) <= 5
                              ? 'text-indigo-700 font-bold'
                              : deltaNet <= 0
                              ? 'text-emerald-700 font-bold'
                              : 'text-amber-700 font-bold'
                          }`}
                        >
                          {deltaNet > 0 ? '+' : ''}
                          {Math.round(deltaNet).toLocaleString()} ({deltaNetPercentage > 0 ? '+' : ''}
                          {deltaNetPercentage.toFixed(1)}%)
                        </span>
                      </td>

                      {/* Health */}
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-xs ${healthColor}`}>
                          {healthLabel}
                        </span>
                      </td>

                      {/* Architectural Rationale */}
                      <td className="p-3 text-[11px] text-slate-600 max-w-xs leading-relaxed">
                        {rationale}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center shrink-0">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(bp.phaseId)}
                              className="p-1 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Save changes"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPhaseId(null)}
                              className="p-1 rounded-xs bg-slate-300 hover:bg-slate-400 text-slate-800 cursor-pointer"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(bp)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xs cursor-pointer transition"
                            title="Edit baseline hours and AI savings %"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Total Footer Row */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono text-xs font-bold">
                  <td className="p-3">TOTAL RECONCILIATION</td>
                  <td className="p-3 text-right">{scenario.projectWeeks} Wks</td>
                  <td className="p-3 text-right">
                    {Math.round(totalBaselineEffort).toLocaleString()} {unitLabel}
                  </td>
                  <td className="p-3 text-right text-indigo-300">
                    -{activeBaseline.overallAiSavingPct}%
                  </td>
                  <td className="p-3 text-right text-indigo-300">
                    {Math.round(totalNetBaselineEffort).toLocaleString()} {unitLabel}
                  </td>
                  <td className="p-3 text-right text-amber-300 text-sm">
                    {Math.round(engineP50Effort).toLocaleString()} {unitLabel}
                  </td>
                  <td className="p-3 text-right text-slate-300">
                    {Math.round(engineP80Effort).toLocaleString()} {unitLabel}
                  </td>
                  <td className={`p-3 text-right ${deltaRawEffort <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {deltaRawEffort > 0 ? '+' : ''}
                    {Math.round(deltaRawEffort).toLocaleString()} ({deltaRawPct.toFixed(1)}%)
                  </td>
                  <td className={`p-3 text-right ${deltaNetEffort <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {deltaNetEffort > 0 ? '+' : ''}
                    {Math.round(deltaNetEffort).toLocaleString()} ({deltaNetPct.toFixed(1)}%)
                  </td>
                  <td className="p-3 text-center text-[10px] text-emerald-300">
                    {deltaRawPct <= 0 ? 'ACCELERATED' : 'EXPANSION'}
                  </td>
                  <td colSpan={2} className="p-3 text-[10px] text-slate-400 font-sans font-normal">
                    Reconciled across {activeBaseline.phases.length} project phases
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VISUAL DELTA & AI WATERFALL                                        */}
      {/* ========================================================================= */}
      {activeTab === 'visualizer' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Phase-by-Phase Comparison: Excel Baseline vs Net Target vs AI Engine
              </h3>
              <p className="text-xs text-slate-500">
                Bar height demonstrates relative effort per phase across the raw Excel baseline (slate), net Excel target after stated AI discount (purple), and the actual PB-Estimo engine calculation (emerald).
              </p>
            </div>

            {/* Visual Bars */}
            <div className="space-y-4 pt-2">
              {activeBaseline.phases.map((bp) => {
                const enginePhase = data.phaseHours.find(p => p.id === bp.phaseId || p.code === bp.phaseCode);
                const engineHours = enginePhase ? enginePhase.hours : 0;
                const engineEffort = engineHours * unitFactor;
                const baselineEffort = unitMode === 'hours' ? bp.baselineHours : bp.baselineDays;
                const netBaselineEffort = unitMode === 'hours' ? bp.netBaselineHours : bp.netBaselineDays;

                const maxEffort = Math.max(baselineEffort, engineEffort, netBaselineEffort, 1);
                const baselineBarWidth = Math.round((baselineEffort / maxEffort) * 100);
                const netBarWidth = Math.round((netBaselineEffort / maxEffort) * 100);
                const engineBarWidth = Math.round((engineEffort / maxEffort) * 100);

                const deltaRawPct = baselineEffort > 0 ? ((engineEffort - baselineEffort) / baselineEffort) * 100 : 0;

                return (
                  <div key={bp.phaseId} className="border-b border-slate-100 pb-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{bp.phaseName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({bp.phaseCode})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-500">
                          Base: <strong>{Math.round(baselineEffort).toLocaleString()} {unitLabel}</strong>
                        </span>
                        <span className="text-indigo-700">
                          Net Target: <strong>{Math.round(netBaselineEffort).toLocaleString()} {unitLabel}</strong>
                        </span>
                        <span className="text-emerald-700 font-bold">
                          Engine: {Math.round(engineEffort).toLocaleString()} {unitLabel}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                          deltaRawPct <= -10 ? 'bg-emerald-100 text-emerald-800' : (deltaRawPct >= 10 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')
                        }`}>
                          {deltaRawPct > 0 ? '+' : ''}{deltaRawPct.toFixed(1)}% vs Base
                        </span>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-1">
                      {/* Raw Baseline Bar */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="w-20 text-slate-500 shrink-0">1. Excel Base</span>
                        <div className="flex-1 bg-slate-100 h-3 rounded-none overflow-hidden">
                          <div
                            className="bg-slate-400 h-full transition-all duration-500"
                            style={{ width: `${baselineBarWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* Net Target Bar */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="w-20 text-indigo-700 shrink-0">2. Excel Net</span>
                        <div className="flex-1 bg-slate-100 h-3 rounded-none overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full transition-all duration-500"
                            style={{ width: `${netBarWidth}%` }}
                          />
                        </div>
                      </div>

                      {/* AI Engine Bar */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="w-20 text-emerald-700 font-bold shrink-0">3. AI Engine</span>
                        <div className="flex-1 bg-slate-100 h-3 rounded-none overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full transition-all duration-500"
                            style={{ width: `${engineBarWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEADERSHIP & STEERCO DEFENSE BRIEF                                */}
      {/* ========================================================================= */}
      {activeTab === 'steerco_defense' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">
                Executive Synthesis & Negotiation Dossier
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                SteerCo Defense: Reconciling AI Acceleration vs Defensive Quality Floors
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Use these evidence-grounded talking points when presenting this estimate to the Client Steering Committee or internal Deal Review Board.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1 */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-none space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <TrendingDown size={15} />
                  <span>Where GenAI Yields High Savings</span>
                </div>
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p>
                    <strong>Build & Unit Configuration:</strong> The engine demonstrates legitimate savings in Phase 3 (Build) through pre-compiled OIC integration recipes, auto-generated BIP SQL extract templates, and Fast Formula logic scaffolds.
                  </p>
                  <p>
                    <strong>SIT Automation:</strong> Test script generation and automated synthetic payload generation significantly compress the first testing cycle.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-none space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle size={15} />
                  <span>Where Human Quality Floors Apply</span>
                </div>
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p>
                    <strong>UAT & Business Sign-off:</strong> The engine intentionally prevents excessive compression in Phase 5 (UAT). Business SME availability and Day-in-the-Life simulation require real human calendar time that AI cannot replace.
                  </p>
                  <p>
                    <strong>Bank & Regulatory Clearance:</strong> Statutory ISO 20022 bank testing and local tax engine certifications require fixed testing windows governed by external banking partners.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-200 rounded-none space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={15} />
                  <span>Commercial & Governance Strategy</span>
                </div>
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p>
                    <strong>Fixed Price Guardrails:</strong> While the spreadsheet baseline targets an aggressive {activeBaseline.overallAiSavingPct}% discount, PB-Estimo provides a defensible P50/P80 corridor to ensure contractual commitments protect project margin.
                  </p>
                  <p>
                    <strong>Net Value Dividend:</strong> Net variance yields ${(costSavings / 1000).toFixed(0)}k in demonstrable commercial optimization while eliminating delivery distress risks.
                  </p>
                </div>
              </div>
            </div>

            {/* SteerCo Summary Script */}
            <div className="p-4 bg-slate-900 text-white rounded-none space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
                Recommended Solution Director Soundbite:
              </div>
              <p className="text-xs leading-relaxed text-slate-200 italic">
                &ldquo;Our PB-Estimo analysis confirms {activeBaseline.overallAiSavingPct}% AI acceleration across core Build and SIT testing tracks, delivering a net reduction of {Math.abs(Math.round(deltaRawEffort)).toLocaleString()} {unitLabel} from the raw historical baseline. However, to guarantee zero post go-live business disruption, we have held firm on mandatory human testing floors in UAT and multi-entity cutover rehearsals.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
