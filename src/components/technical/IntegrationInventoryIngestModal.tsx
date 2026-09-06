import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Copy,
  Trash2,
  Info,
  Clock,
  ShieldCheck,
  RotateCcw,
  FileUp,
  FileText,
  Sheet
} from 'lucide-react';
import {
  parseIntegrationInventory,
  parseExcelWorkbook,
  PRESET_INTEGRATION_INVENTORIES,
  SAMPLE_CSV_TEMPLATE,
  IntegrationInventoryParseResult
} from '../../utils/integrationInventoryParser';
import { TechnicalIntegrationItem } from '../../types';

interface IntegrationInventoryIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInventory?: (
    items: TechnicalIntegrationItem[],
    replaceExisting: boolean,
    fullResult?: IntegrationInventoryParseResult
  ) => void;
  onApply?: (
    items: TechnicalIntegrationItem[],
    replaceExisting: boolean,
    fullResult?: IntegrationInventoryParseResult
  ) => void;
  currentCount?: number;
  currentInventoryCount?: number;
}

export const IntegrationInventoryIngestModal: React.FC<IntegrationInventoryIngestModalProps> = ({
  isOpen,
  onClose,
  onApplyInventory,
  onApply,
  currentCount,
  currentInventoryCount
}) => {
  const effectiveCount = currentInventoryCount !== undefined ? currentInventoryCount : (currentCount || 0);
  const handleApplyCallback = onApply || onApplyInventory;

  // Raw text & parsed state
  const [inputText, setInputText] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [activePresetId, setActivePresetId] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  // Excel / File Attachment state
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [cachedArrayBuffer, setCachedArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'preview' | 'ricefw_summary' | 'raw_data'>('preview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute parsed inventory from current input
  const parseResult: IntegrationInventoryParseResult = useMemo(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      return {
        items: [],
        totalCount: 0,
        totalHours: 0,
        summaryByComplexity: { simple: 0, medium: 0, complex: 0, extraLarge: 0 },
        summaryByPillar: {},
        summaryByType: {},
        detectedFormat: uploadedFileName ? 'excel' : 'csv',
        validationWarnings: [],
        sheetNames: excelSheets,
        activeSheet
      };
    }
    const res = parseIntegrationInventory(trimmed);
    if (uploadedFileName) {
      res.detectedFormat = 'excel';
      res.sheetNames = excelSheets;
      res.activeSheet = activeSheet;
    }
    return res;
  }, [inputText, uploadedFileName, excelSheets, activeSheet]);

  // Clear pasted data & reset all uploaded files
  const handleClearPastedData = useCallback(() => {
    setInputText('');
    setActivePresetId('');
    setUploadedFileName('');
    setUploadedFileSize('');
    setExcelSheets([]);
    setActiveSheet('');
    setCachedArrayBuffer(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setClearMessage('All pasted inventory and attached files have been cleared.');
    setTimeout(() => setClearMessage(null), 3500);
  }, []);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_INTEGRATION_INVENTORIES.find(p => p.id === presetId);
    if (found) {
      setInputText(found.rawContent);
      setActivePresetId(presetId);
      setUploadedFileName('');
      setUploadedFileSize('');
      setExcelSheets([]);
      setActiveSheet('');
      setCachedArrayBuffer(null);
      setClearMessage(null);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_CSV_TEMPLATE);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Process selected or dropped file (Excel or text-based)
  const processFile = (file: File) => {
    const fileName = file.name;
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel');

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          try {
            setCachedArrayBuffer(buffer);
            const parsedExcel = parseExcelWorkbook(buffer);
            setUploadedFileName(fileName);
            setUploadedFileSize(formattedSize);
            setExcelSheets(parsedExcel.sheets);
            setActiveSheet(parsedExcel.activeSheet);
            setInputText(parsedExcel.csvText);
            setActivePresetId('');
            setClearMessage(null);
          } catch (err: any) {
            alert(`Error reading Excel workbook: ${err?.message || 'Unsupported format'}`);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Text, CSV, TSV, JSON
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
          setUploadedFileName(fileName);
          setUploadedFileSize(formattedSize);
          setExcelSheets([]);
          setActiveSheet('');
          setCachedArrayBuffer(null);
          setActivePresetId('');
          setClearMessage(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Switch between sheets in an Excel workbook
  const handleSelectSheet = (sheetName: string) => {
    if (!cachedArrayBuffer) return;
    try {
      const parsedExcel = parseExcelWorkbook(cachedArrayBuffer, sheetName);
      setActiveSheet(sheetName);
      setInputText(parsedExcel.csvText);
    } catch (err: any) {
      alert(`Error reading sheet "${sheetName}": ${err?.message || 'Failed'}`);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApply = () => {
    if (parseResult.items.length === 0) return;
    if (handleApplyCallback) {
      handleApplyCallback(parseResult.items, replaceExisting, parseResult);
    }
    onClose();
  };

  const hasPastedOrLoadedData = inputText.trim().length > 0 || uploadedFileName !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">AI Ingest Inventory & Spec Sheet</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-400 text-slate-950 uppercase rounded-xs">
                  Excel (.xlsx / .xls) & RICEFW Parser
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Attach an Excel workbook or paste inventory to extract complexity, patterns, and update scoping fields automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {/* Feedback banner after clearing */}
          {clearMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{clearMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setClearMessage(null)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Upload & Drag Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-sm p-4 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/70'
                : 'border-slate-300 hover:border-indigo-400 bg-white'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx,.xls,.csv,.tsv,.txt,.json"
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                <FileSpreadsheet size={24} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Attach Client Excel Inventory (.xlsx, .xls) or CSV / TSV</span>
                  <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-xs">
                    Multi-Sheet Supported
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Drag & drop your integration / RICEFW spreadsheet or click to browse. Automatically extracts ID, Name, Source, Target, Pattern, and Complexity.
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Upload size={13} />
                <span>Browse File</span>
              </button>
            </div>
          </div>

          {/* Attached File Status & Sheet Switcher */}
          {uploadedFileName && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-sm space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-indigo-950">
                      Loaded Excel File: <span className="font-mono text-indigo-800">{uploadedFileName}</span> ({uploadedFileSize})
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Parsed {parseResult.totalCount} technical items from sheet: <strong className="text-slate-900">{activeSheet || 'Default'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearPastedData}
                    className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Clear File & Data</span>
                  </button>
                </div>
              </div>

              {/* Multi-Sheet Selector Tabs if workbook has multiple sheets */}
              {excelSheets.length > 1 && (
                <div className="pt-2 border-t border-indigo-200 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                    <Sheet size={13} />
                    <span>Workbook Sheets:</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {excelSheets.map(sheet => (
                      <button
                        key={sheet}
                        type="button"
                        onClick={() => handleSelectSheet(sheet)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
                          activeSheet === sheet
                            ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        {sheet}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions & Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-sm shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Enterprise Presets:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {PRESET_INTEGRATION_INVENTORIES.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                      activePresetId === preset.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset.name.split('(')[0].trim()} ({preset.rawContent.trim().split('\n').length - 1})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-300"
                title="Copy sample CSV template headers"
              >
                <Copy size={13} />
                <span>{copiedMessage ? 'Copied!' : 'Copy Template'}</span>
              </button>

              {/* High-visibility Clear Pasted Data button */}
              <button
                type="button"
                onClick={handleClearPastedData}
                disabled={!hasPastedOrLoadedData}
                className={`px-3 py-1 text-xs font-bold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasPastedOrLoadedData
                    ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 shadow-2xs'
                    : 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed'
                }`}
                title="Wipe pasted inventory data and start clean"
              >
                <Trash2 size={13} className="text-rose-600" />
                <span>Clear Pasted Data</span>
              </button>
            </div>
          </div>

          {/* Raw Text / CSV Editor Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-600" />
                  <span>Pasted or Extracted Inventory Content</span>
                </label>
                {inputText.trim() && (
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-200 text-slate-800 rounded-xs">
                    {inputText.trim().split('\n').length} lines
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-mono">
                  Format: <strong className="text-slate-800 uppercase">{parseResult.detectedFormat}</strong> | Valid Items: <strong className="text-indigo-700">{parseResult.totalCount}</strong>
                </span>
                {hasPastedOrLoadedData && (
                  <button
                    type="button"
                    onClick={handleClearPastedData}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setActivePresetId('');
                setClearMessage(null);
              }}
              placeholder="Paste integration inventory here... e.g.&#10;ID, Interface Name, Source System, Target System, Pillar, Pattern, Complexity, Protocol&#10;INT-01, Salesforce CRM Sync, Salesforce, Oracle Order Management, ERP, bidirectional_sync, M, REST OAuth2"
              rows={6}
              className="w-full px-3 py-2.5 font-mono text-xs text-slate-800 bg-white border border-slate-300 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* Validation Warnings if any */}
          {parseResult.validationWarnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Notice:</strong> {parseResult.validationWarnings.join(' ')}
              </div>
            </div>
          )}

          {/* Diagnostic KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-sm shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Interfaces</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-indigo-700">{parseResult.totalCount}</span>
                <span className="text-xs text-slate-500 font-medium">endpoints</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Updates scaleDrivers.tech_oic
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-sm shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Complexity Breakdown</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-bold flex-wrap">
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs">S: {parseResult.summaryByComplexity.simple}</span>
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-xs">M: {parseResult.summaryByComplexity.medium}</span>
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-xs">C: {parseResult.summaryByComplexity.complex}</span>
                {parseResult.summaryByComplexity.extraLarge > 0 && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-xs">XL: {parseResult.summaryByComplexity.extraLarge}</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Updates SMC Matrix Overrides
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-sm shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Delivery Hours</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{parseResult.totalHours.toLocaleString()}</span>
                <span className="text-xs text-slate-500 font-medium">hrs</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Avg: {parseResult.totalCount > 0 ? Math.round(parseResult.totalHours / parseResult.totalCount) : 0}h / interface
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-sm shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Testing & Schedule Impact</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-700">
                  +{Math.round(parseResult.totalCount * 2 * 16)}
                </span>
                <span className="text-xs text-slate-500 font-medium">SIT hrs</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                2 SIT cycles × 16h regression
              </span>
            </div>
          </div>

          {/* RICEFW Category Summary if non-integration items detected */}
          {parseResult.ricefwCounts && Object.values(parseResult.ricefwCounts).reduce((a, b) => a + b, 0) > 0 && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-sm">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-600" />
                <span>Detected RICEFW Object Categorization:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xs font-medium">
                  Integrations: <strong>{parseResult.ricefwCounts.integrations}</strong>
                </span>
                {parseResult.ricefwCounts.reports_bip > 0 && (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs font-medium">
                    BIP Reports: <strong>{parseResult.ricefwCounts.reports_bip}</strong>
                  </span>
                )}
                {parseResult.ricefwCounts.reports_otbi > 0 && (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs font-medium">
                    OTBI Reports: <strong>{parseResult.ricefwCounts.reports_otbi}</strong>
                  </span>
                )}
                {parseResult.ricefwCounts.conversions > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs font-medium">
                    Conversions: <strong>{parseResult.ricefwCounts.conversions}</strong>
                  </span>
                )}
                {parseResult.ricefwCounts.paas > 0 && (
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xs font-medium">
                    PaaS/VBCS: <strong>{parseResult.ricefwCounts.paas}</strong>
                  </span>
                )}
                {parseResult.ricefwCounts.workflows > 0 && (
                  <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-xs font-medium">
                    Workflows: <strong>{parseResult.ricefwCounts.workflows}</strong>
                  </span>
                )}
                {parseResult.ricefwCounts.security_roles > 0 && (
                  <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xs font-medium">
                    Security Roles: <strong>{parseResult.ricefwCounts.security_roles}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interactive Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet size={15} className="text-indigo-600" />
                <span>Parsed Interface Preview ({parseResult.items.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                All 6-Q questions, formulas, and hours generated deterministically from complexity & inputs
              </span>
            </div>

            <div className="border border-slate-200 rounded-sm bg-white overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Interface Name</th>
                    <th className="py-2 px-3">Source → Target</th>
                    <th className="py-2 px-3">Pillar</th>
                    <th className="py-2 px-3">Pattern</th>
                    <th className="py-2 px-3">Tier</th>
                    <th className="py-2 px-3 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parseResult.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-indigo-700">{item.code}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2 px-3 text-slate-600">
                        <span className="text-slate-800 font-medium">{item.sourceSystem}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="text-slate-800 font-medium">{item.targetSystem}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-xs bg-slate-100 text-slate-700">
                          {item.pillar}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{item.type}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 text-[10px] font-black rounded-xs ${
                          item.complexity === 'S' ? 'bg-emerald-100 text-emerald-800' :
                          item.complexity === 'M' ? 'bg-blue-100 text-blue-800' :
                          item.complexity === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.complexity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {item.calculatedHours}h
                      </td>
                    </tr>
                  ))}
                  {parseResult.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No interfaces detected. Drop an Excel spreadsheet (.xlsx), paste inventory, or select an enterprise preset above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="radio"
                name="replaceMode"
                checked={replaceExisting}
                onChange={() => setReplaceExisting(true)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Replace current inventory ({effectiveCount} items)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="radio"
                name="replaceMode"
                checked={!replaceExisting}
                onChange={() => setReplaceExisting(false)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Append to existing inventory</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClearPastedData}
              disabled={!hasPastedOrLoadedData}
              className={`px-3 py-2 text-xs font-bold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasPastedOrLoadedData
                  ? 'text-rose-700 bg-white hover:bg-rose-50 border border-rose-300'
                  : 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <RotateCcw size={13} />
              <span>Clear Input</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-sm cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={parseResult.items.length === 0}
              className={`px-5 py-2 text-xs font-bold rounded-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors ${
                parseResult.items.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 size={15} />
              <span>Apply Inventory ({parseResult.items.length} Interfaces / {parseResult.totalHours} hrs)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
