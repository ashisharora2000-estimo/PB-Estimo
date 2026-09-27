import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  RotateCcw,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cloud,
  CloudCheck,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { ProjectScenario } from '../../types';
import { ScenarioSnapshotItem } from '../common/UniversalSnapshotManager';
import {
  fetchSnapshots,
  captureManualBackup,
  deleteSnapshot,
  calculateScenarioDiff,
  hasDailyBackupForToday,
  hasSessionBackup,
  getTodayDateString
} from '../../services/backupService';
import { subscribeToCloudSnapshots } from '../../services/firestoreService';

interface VersionHistoryPanelProps {
  scenario: ProjectScenario;
  totalEffortHours?: number;
  onRestoreScenario: (restored: ProjectScenario) => void;
  onClose?: () => void;
}

type FilterType = 'all' | 'automated_daily' | 'automated_session' | 'manual';

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  scenario,
  totalEffortHours = 0,
  onRestoreScenario,
  onClose
}) => {
  const [snapshots, setSnapshots] = useState<ScenarioSnapshotItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [customName, setCustomName] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // Load snapshots & subscribe to cloud updates
  useEffect(() => {
    let isMounted = true;

    // Initial load
    fetchSnapshots(scenario.id).then((items) => {
      if (isMounted) setSnapshots(items);
    });

    // Real-time listener from Cloud Firestore
    const unsubscribe = subscribeToCloudSnapshots(
      scenario.id,
      (cloudItems) => {
        if (isMounted) {
          // Merge with any local items
          setSnapshots((prev) => {
            const map = new Map<string, ScenarioSnapshotItem>();
            prev.forEach((s) => map.set(s.id, s));
            cloudItems.forEach((s) => map.set(s.id, s));
            const merged = Array.from(map.values());
            merged.sort((a, b) => b.id.localeCompare(a.id));
            return merged;
          });
        }
      },
      (err) => {
        console.warn('Version history cloud sync notice:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [scenario.id]);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const snap = await captureManualBackup(scenario, customName.trim(), totalEffortHours);
      setSnapshots((prev) => [snap, ...prev.filter((s) => s.id !== snap.id)]);
      setCustomName('');
      showNotification(`Saved version: "${snap.name}"`);
    } catch (err) {
      showNotification('Failed to save snapshot to cloud', 'error');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRestore = (item: ScenarioSnapshotItem) => {
    try {
      const cloned = JSON.parse(JSON.stringify(item.scenarioState)) as ProjectScenario;
      onRestoreScenario(cloned);
      setConfirmRestoreId(null);
      showNotification(`Successfully restored scenario to: "${item.name}"`);
    } catch (err) {
      showNotification('Failed to restore snapshot', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSnapshot(id, scenario.id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      showNotification(`Deleted snapshot "${name}"`, 'info');
    } catch (err) {
      showNotification('Failed to delete snapshot', 'error');
    }
  };

  // Filter items
  const filteredSnapshots = useMemo(() => {
    if (filter === 'all') return snapshots;
    if (filter === 'automated_daily') {
      return snapshots.filter((s) => s.actionSource === 'automated_daily' || s.id.includes('daily'));
    }
    if (filter === 'automated_session') {
      return snapshots.filter((s) => s.actionSource === 'automated_session' || s.id.includes('sess'));
    }
    if (filter === 'manual') {
      return snapshots.filter(
        (s) =>
          s.actionSource === 'manual_save' ||
          s.actionSource === 'ai_ingest' ||
          s.actionSource === 'pre_flight_apply'
      );
    }
    return snapshots;
  }, [snapshots, filter]);

  // Counts for tabs
  const dailyCount = snapshots.filter((s) => s.actionSource === 'automated_daily' || s.id.includes('daily')).length;
  const sessionCount = snapshots.filter((s) => s.actionSource === 'automated_session' || s.id.includes('sess')).length;
  const manualCount = snapshots.filter(
    (s) =>
      s.actionSource === 'manual_save' ||
      s.actionSource === 'ai_ingest' ||
      s.actionSource === 'pre_flight_apply'
  ).length;

  const dailyActiveToday = hasDailyBackupForToday(scenario.id);
  const sessionActiveNow = hasSessionBackup(scenario.id);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-sm shadow-xl p-5 mb-6 animate-in fade-in slide-in-from-top-3 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <History size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Scenario Version History & Cloud Backups
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Firestore Auto-Backup Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated daily & session snapshots backed up to Cloud Firestore. Inspect diffs and restore to any version with 1 click.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-100 rounded-sm cursor-pointer transition"
            >
              ✕ Close Panel
            </button>
          )}
        </div>
      </div>

      {/* Auto Backup Status Strip */}
      <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dailyActiveToday ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <div>
            <span className="font-bold text-slate-800 block">Daily Cloud Backup:</span>
            <span className="text-[11px] text-slate-500 font-mono">
              {dailyActiveToday ? `Captured for ${getTodayDateString()}` : 'Syncing today’s checkpoint...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${sessionActiveNow ? 'bg-emerald-500' : 'bg-sky-500'}`} />
          <div>
            <span className="font-bold text-slate-800 block">Session Checkpoint:</span>
            <span className="text-[11px] text-slate-500 font-mono">
              {sessionActiveNow ? 'Active session saved to cloud' : 'Recording session state...'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-1.5">
          <span className="text-[11px] text-slate-500 font-mono">
            {snapshots.length} total snapshots in Firestore
          </span>
        </div>
      </div>

      {/* Quick Capture Input */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Label a new snapshot (e.g., Pre-SteerCo Final Scope, Draft Wave 1)..."
            className="w-full text-xs p-2 pl-3 pr-8 border border-slate-300 rounded-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCapture();
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleCapture}
          disabled={isCapturing}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-sm cursor-pointer transition shadow-xs whitespace-nowrap"
        >
          {isCapturing ? <RefreshCw size={13} className="animate-spin" /> : <Camera size={13} />}
          <span>Capture Snapshot</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`mt-3 p-2.5 rounded-sm text-xs font-semibold flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition flex items-center gap-1.5 ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span>All Versions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/20">
            {snapshots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('automated_daily')}
          className={`px-3 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition flex items-center gap-1.5 ${
            filter === 'automated_daily'
              ? 'bg-emerald-700 text-white'
              : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Calendar size={13} />
          <span>Daily Backups</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-200 text-emerald-900">
            {dailyCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('automated_session')}
          className={`px-3 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition flex items-center gap-1.5 ${
            filter === 'automated_session'
              ? 'bg-sky-700 text-white'
              : 'text-sky-800 hover:bg-sky-50'
          }`}
        >
          <Clock size={13} />
          <span>Session Checkpoints</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-sky-200 text-sky-900">
            {sessionCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('manual')}
          className={`px-3 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition flex items-center gap-1.5 ${
            filter === 'manual'
              ? 'bg-purple-700 text-white'
              : 'text-purple-800 hover:bg-purple-50'
          }`}
        >
          <Camera size={13} />
          <span>Manual Snapshots</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-purple-200 text-purple-900">
            {manualCount}
          </span>
        </button>
      </div>

      {/* Snapshots List */}
      <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
        {filteredSnapshots.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-sm bg-slate-50 text-slate-500 text-xs space-y-1">
            <History size={24} className="mx-auto text-slate-400 mb-1" />
            <p className="font-semibold text-slate-700">No version snapshots found in this category.</p>
            <p className="text-[11px] text-slate-500">
              Automated daily backups occur once per day, and session checkpoints are recorded when editing starts.
            </p>
          </div>
        ) : (
          filteredSnapshots.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            const diff = calculateScenarioDiff(scenario, item.scenarioState);
            const isConfirming = confirmRestoreId === item.id;

            return (
              <div
                key={item.id}
                className={`border rounded-sm transition p-3 ${
                  idx === 0
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900 text-xs tracking-tight">
                        {item.name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-amber-200 text-amber-900 font-bold uppercase">
                          Latest
                        </span>
                      )}

                      {/* Source Badge */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-xs font-bold uppercase border ${
                          item.actionSource === 'automated_daily'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.actionSource === 'automated_session'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : item.actionSource === 'ai_ingest'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : item.actionSource === 'pre_flight_apply'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            : 'bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                      >
                        {item.actionSource === 'automated_daily' && '📅 Daily Cloud Backup'}
                        {item.actionSource === 'automated_session' && '⏱️ Session Checkpoint'}
                        {item.actionSource === 'manual_save' && '📸 Manual Snapshot'}
                        {item.actionSource === 'ai_ingest' && '🤖 AI Ingest Baseline'}
                        {item.actionSource === 'pre_flight_apply' && '⚡ Pre-Flight'}
                        {item.actionSource === 'custom_calibration' && '⚙️ Custom Calibration'}
                        {item.actionSource === 'multi_vendor' && '🏢 Multi-Vendor'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {item.timestamp}
                      </span>
                      <span>•</span>
                      <span>{item.metrics?.moduleCount || item.scenarioState.selectedModules?.length || 0} Modules</span>
                      <span>•</span>
                      <span>{item.metrics?.timelineWeeks || item.scenarioState.projectWeeks || 32}w Timeline</span>
                      {item.metrics?.totalHours ? (
                        <>
                          <span>•</span>
                          <span>{item.metrics.totalHours.toLocaleString()} hrs</span>
                        </>
                      ) : null}
                    </div>

                    {/* Diff Pill */}
                    <div className="mt-1.5 flex items-center gap-2">
                      {!diff.hasChanges ? (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200">
                          ✓ Identical to active configuration
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded-xs border border-amber-300">
                          Δ Variance: {diff.moduleDiff !== 0 && `${diff.moduleDiff > 0 ? '+' : ''}${diff.moduleDiff} modules `}
                          {diff.weeksDiff !== 0 && `${diff.weeksDiff > 0 ? '+' : ''}${diff.weeksDiff} weeks `}
                          {diff.entitiesDiff !== 0 && `${diff.entitiesDiff > 0 ? '+' : ''}${diff.entitiesDiff} entities`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-300 rounded-sm hover:bg-slate-200 text-xs transition cursor-pointer"
                      title="Inspect snapshot details"
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {isConfirming ? (
                      <div className="flex items-center gap-1 bg-amber-100 p-1 rounded-sm border border-amber-300">
                        <span className="text-[10px] font-bold text-amber-900 px-1">Restore this?</span>
                        <button
                          type="button"
                          onClick={() => handleRestore(item)}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer shadow-xs"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRestoreId(null)}
                          className="px-1.5 py-1 text-slate-600 hover:text-slate-900 text-[10px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRestoreId(item.id)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-sm cursor-pointer shadow-xs transition"
                        title="Restore scenario to this snapshot state"
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition cursor-pointer"
                      title="Delete snapshot"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in duration-150 bg-white p-3 rounded-sm border border-slate-200">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Scenario ID:</span>
                        <span className="font-bold truncate block">{item.scenarioState.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Client:</span>
                        <span className="font-bold">{item.scenarioState.clientName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Legal Entities:</span>
                        <span className="font-bold">{item.scenarioState.scaleDrivers?.fin_ent || 1}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">External Flows:</span>
                        <span className="font-bold">{item.scenarioState.integrationMatrixItems?.length || item.scenarioState.scaleDrivers?.tech_external_integrations_count || 0}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Selected Modules:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.scenarioState.selectedModules?.map((mod) => (
                          <span key={mod} className="px-1.5 py-0.5 rounded-xs bg-slate-100 border border-slate-200 font-mono text-[10px]">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
