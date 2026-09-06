import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Camera,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProjectScenario } from '../../types';
import { saveSnapshotToCloud, deleteSnapshotFromCloud } from '../../services/firestoreService';

export interface ScenarioSnapshotItem {
  id: string;
  name: string;
  timestamp: string;
  actionSource: 'ai_ingest' | 'manual_save' | 'multi_vendor' | 'custom_calibration' | 'pre_flight_apply';
  scenarioState: ProjectScenario;
  summary: string;
  metrics: {
    totalHours: number;
    timelineWeeks: number;
    moduleCount: number;
    grossMarginPct?: number;
  };
}

interface UniversalSnapshotManagerProps {
  scenario: ProjectScenario;
  onRestoreScenario: (restored: ProjectScenario) => void;
  activeSnapshots?: ScenarioSnapshotItem[];
  onSaveSnapshot?: (name: string) => void;
}

export const UniversalSnapshotManager: React.FC<UniversalSnapshotManagerProps> = ({
  scenario,
  onRestoreScenario
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Local storage backed snapshots state for universal accessibility across tabs
  const [snapshots, setSnapshots] = useState<ScenarioSnapshotItem[]>(() => {
    try {
      const stored = localStorage.getItem(`fusion_snapshots_${scenario.id}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const saveSnapshotsToStorage = (items: ScenarioSnapshotItem[]) => {
    setSnapshots(items);
    try {
      localStorage.setItem(`fusion_snapshots_${scenario.id}`, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleCaptureSnapshot = (actionSource: ScenarioSnapshotItem['actionSource'] = 'manual_save', defaultName?: string) => {
    const name = defaultName || customName.trim() || `Baseline Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newSnapshot: ScenarioSnapshotItem = {
      id: `snap_${Date.now()}`,
      name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      actionSource,
      scenarioState: JSON.parse(JSON.stringify(scenario)),
      summary: `${scenario.selectedModules.length} Modules • ${scenario.scaleDrivers.legalEntities} Legal Entities • ${scenario.projectWeeks}w Timeline`,
      metrics: {
        totalHours: 0, // derived downstream
        timelineWeeks: scenario.projectWeeks,
        moduleCount: scenario.selectedModules.length
      }
    };

    const updated = [newSnapshot, ...snapshots].slice(0, 15); // keep last 15
    saveSnapshotsToStorage(updated);
    // Asynchronously replicate to Cloud Firestore
    saveSnapshotToCloud(newSnapshot, scenario.id).catch((e) => {
      console.warn('Snapshot cloud replication notice:', e);
    });
    setCustomName('');
    setNotification(`Saved snapshot: "${name}"`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRestore = (item: ScenarioSnapshotItem) => {
    onRestoreScenario(JSON.parse(JSON.stringify(item.scenarioState)));
    setNotification(`Restored baseline to: "${item.name}"`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = snapshots.filter(s => s.id !== id);
    saveSnapshotsToStorage(updated);
    deleteSnapshotFromCloud(id).catch(err => {
      console.warn('Snapshot cloud deletion notice:', err);
    });
  };

  const handleClearAll = () => {
    saveSnapshotsToStorage([]);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border rounded-sm transition cursor-pointer ${
            snapshots.length > 0
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title="Guardrail 5: Universal Snapshot & 1-Click Instant Rollback Rail"
        >
          <History size={13} className={snapshots.length > 0 ? 'text-amber-600' : 'text-slate-500'} />
          <span className="font-mono hidden sm:inline">Snapshots</span>
          <span className={`text-[10px] px-1 py-0.2 font-mono font-bold rounded-xs ${
            snapshots.length > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
          }`}>
            {snapshots.length}
          </span>
        </button>

        {snapshots.length > 0 && (
          <button
            type="button"
            onClick={() => handleRestore(snapshots[0])}
            className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center transition cursor-pointer border border-amber-700 rounded-sm shadow-xs"
            title={`1-Click Instant Rollback to last snapshot (${snapshots[0].name})`}
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border-2 border-slate-900 shadow-2xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span className="text-xs font-bold font-mono text-slate-900 uppercase">
                Guardrail 5: Snapshot & Rollback Ledger
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight">
            Immutable point-in-time state captures. Rollback instantly to any previous configuration if an AI auto-fill or calibration needs to be undone.
          </p>

          {/* Quick Capture Input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Label this snapshot (e.g. Pre-AI RFP Ingestion)..."
              className="flex-1 text-xs p-1.5 border border-slate-300 font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCaptureSnapshot('manual_save');
              }}
            />
            <button
              type="button"
              onClick={() => handleCaptureSnapshot('manual_save')}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Camera size={12} />
              <span>Capture</span>
            </button>
          </div>

          {notification && (
            <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Snapshot History List */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {snapshots.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                No snapshots captured yet. Snapshots are auto-captured before AI extractions or manually via the button above.
              </div>
            ) : (
              snapshots.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleRestore(item)}
                  className={`p-2 border text-xs cursor-pointer transition flex items-center justify-between group ${
                    idx === 0
                      ? 'bg-amber-50/50 border-amber-300 hover:bg-amber-100/70'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 truncate">{item.name}</span>
                      {idx === 0 && (
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-200 text-amber-900 font-bold uppercase">
                          Latest
                        </span>
                      )}
                      <span className={`text-[9px] font-mono px-1 py-0.2 border ${
                        item.actionSource === 'ai_ingest' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        item.actionSource === 'pre_flight_apply' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                        'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {item.actionSource === 'ai_ingest' ? '🤖 AI Ingest' :
                         item.actionSource === 'pre_flight_apply' ? '⚡ Pre-Flight' : '📸 Manual'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{item.summary}</p>
                    <span className="text-[9px] text-slate-400 font-mono block">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(item);
                      }}
                      className="px-2 py-1 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition"
                      title="Restore scenario to this state"
                    >
                      <RotateCcw size={10} />
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete snapshot"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {snapshots.length > 0 && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-mono">{snapshots.length} snapshots stored</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
              >
                Clear all snapshots
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
