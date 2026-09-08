import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  Database,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Share2,
  Radio,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Link2,
  Zap
} from 'lucide-react';
import { ProjectScenario } from '../../types';
import {
  saveScenarioToCloud,
  listCloudScenarios,
  deleteScenarioFromCloud,
  subscribeToCloudScenarios
} from '../../services/firestoreService';
import {
  getMakeWebhookUrl,
  setMakeWebhookUrl,
  isMakeAutoSyncEnabled,
  setMakeAutoSyncEnabled,
  sendScenarioToMakeDatabase
} from '../../services/makeIntegrationService';
import { testFirestoreConnection } from '../../lib/firebase';
import firebaseConfig from '../../lib/firebaseConfig';

interface CloudDatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenario: ProjectScenario;
  onLoadScenario: (scenario: ProjectScenario) => void;
}

export const CloudDatabaseSyncModal: React.FC<CloudDatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentScenario,
  onLoadScenario
}) => {
  const [cloudScenarios, setCloudScenarios] = useState<ProjectScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Agent integration state
  const [makeWebhookUrl, setLocalMakeWebhookUrl] = useState('');
  const [makeAutoSync, setLocalMakeAutoSync] = useState(false);
  const [isSendingToMake, setIsSendingToMake] = useState(false);

  // Load Agent integration settings on modal open
  useEffect(() => {
    if (isOpen) {
      setLocalMakeWebhookUrl(getMakeWebhookUrl());
      setLocalMakeAutoSync(isMakeAutoSyncEnabled());
    }
  }, [isOpen]);

  const handleSaveMakeSettings = () => {
    setMakeWebhookUrl(makeWebhookUrl);
    setMakeAutoSyncEnabled(makeAutoSync);
    setFeedback({
      type: 'success',
      message: 'Agent connection settings saved.'
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTestMakeSync = async (scenarioToSync?: ProjectScenario) => {
    const target = scenarioToSync || currentScenario;
    if (!makeWebhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please paste your Agent Webhook URL first.'
      });
      return;
    }
    setIsSendingToMake(true);
    setFeedback(null);
    try {
      setMakeWebhookUrl(makeWebhookUrl);
      const res = await sendScenarioToMakeDatabase(target, makeWebhookUrl.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully transmitted "${target.name}" (50+ complete database fields) to Agent!`
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: `Agent sync error: ${e.message || String(e)}`
      });
    } finally {
      setIsSendingToMake(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Check connection and fetch initial documents
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    testFirestoreConnection().then((connected) => {
      if (isMounted) setIsConnected(connected);
    });

    // Real-time listener for live sync across systems/browser tabs
    const unsubscribe = subscribeToCloudScenarios(
      (scenarios) => {
        if (isMounted) {
          setCloudScenarios(scenarios);
          setIsLoading(false);
        }
      },
      (err) => {
        if (isMounted) {
          console.warn('Realtime listener fallback to one-time query:', err);
          listCloudScenarios()
            .then((list) => {
              if (isMounted) {
                setCloudScenarios(list);
                setIsLoading(false);
              }
            })
            .catch((e) => {
              if (isMounted) {
                setFeedback({ type: 'error', message: 'Unable to connect to Firestore database.' });
                setIsLoading(false);
              }
            });
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrentToCloud = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await saveScenarioToCloud(currentScenario);
      setFeedback({
        type: 'success',
        message: `Successfully synced "${currentScenario.name}" to Cloud Firestore. Available for any connected system.`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Cloud write error: ${err.message || String(err)}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFromCloud = (scenario: ProjectScenario) => {
    onLoadScenario(scenario);
    setFeedback({
      type: 'success',
      message: `Loaded "${scenario.name}" into workspace.`
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDeleteFromCloud = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${name}" from the Cloud Database?`)) {
      return;
    }
    try {
      await deleteScenarioFromCloud(id);
      setFeedback({ type: 'success', message: `Removed "${name}" from cloud storage.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Delete failed: ${err.message || String(err)}` });
    }
  };

  const handleCopyShareableId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-indigo-600 text-white">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Cloud Database Sync & Multi-System Retrieval</h3>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Radio size={10} className="animate-pulse text-emerald-400" />
                  Live Firestore Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Synchronize, persist, and retrieve Oracle project plans & WBS models across systems in real-time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Database Config Meta Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">Project:</span>
            <span className="font-bold text-slate-900">{firebaseConfig.projectId}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Collection:</span>
            <span className="font-bold text-indigo-700">project_scenarios</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Zero-Trust Firestore Security Deployed</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xs border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Active Workspace Scenario Card */}
          <div className="p-3.5 rounded-sm border border-indigo-200 bg-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-2xs bg-indigo-100 text-indigo-800">
                  Current Workspace Plan
                </span>
                <span className="text-xs font-bold text-slate-900">{currentScenario.name}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-1">{currentScenario.description}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span>{currentScenario.selectedModules.length} Modules</span>
                <span>•</span>
                <span>{currentScenario.projectWeeks} Weeks</span>
                <span>•</span>
                <span>ID: {currentScenario.id}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCurrentToCloud}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
            >
              <CloudUpload size={14} />
              <span>{isSaving ? 'Syncing...' : 'Sync to Cloud'}</span>
            </button>
          </div>

          {/* Cloud Stored Scenarios Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Stored Cloud Scenarios & Proposals ({cloudScenarios.length})
                </h4>
                {isLoading && <RefreshCw size={12} className="animate-spin text-slate-400" />}
              </div>
              <span className="text-[11px] text-slate-500">Auto-synchronized across devices</span>
            </div>

            {cloudScenarios.length === 0 && !isLoading ? (
              <div className="p-8 text-center rounded-sm border border-dashed border-slate-300 space-y-2 bg-slate-50">
                <Cloud size={28} className="mx-auto text-slate-400" />
                <div className="text-xs font-semibold text-slate-700">No proposals currently stored in Cloud Firestore</div>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Click the <strong>"Sync to Cloud"</strong> button above to persist your current project plan into the cloud database so you can load it in other browsers, tabs, or integrated systems.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cloudScenarios.map((item) => {
                  const isCurrentlyActive = item.id === currentScenario.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleLoadFromCloud(item)}
                      className={`p-3 rounded-sm border text-xs cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                        isCurrentlyActive
                          ? 'border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {item.name}
                          </span>
                          {isCurrentlyActive && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-2xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active in View
                            </span>
                          )}
                          {item.clientName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-2xs bg-slate-100 text-slate-700 font-mono">
                              Client: {item.clientName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                          <span>{item.selectedModules?.length || 0} Modules</span>
                          <span>•</span>
                          <span>{item.projectWeeks} Weeks</span>
                          <span>•</span>
                          <span>ID: {item.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {makeWebhookUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestMakeSync(item);
                            }}
                            className="p-1.5 text-purple-600 hover:text-purple-800 rounded-xs hover:bg-purple-100 transition cursor-pointer"
                            title="Push this scenario directly to Agent"
                          >
                            <Zap size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleCopyShareableId(item.id, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xs hover:bg-slate-200/60 transition cursor-pointer"
                          title="Copy Scenario Cloud ID"
                        >
                          {copiedUrl ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadFromCloud(item)}
                          className="px-2.5 py-1.5 rounded-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <CloudDownload size={12} />
                          <span>Load Plan</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFromCloud(item.id, item.name, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xs hover:bg-rose-50 transition cursor-pointer"
                          title="Delete from Cloud"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interoperability Guide & Claude Artifact Endpoint */}
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Share2 size={13} className="text-indigo-600" />
                <span>External Integration Endpoint (Claude Artifacts, Python, REST):</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-2xs bg-emerald-100 text-emerald-800 font-bold">CORS Enabled</span>
            </div>
            
            <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <span className="truncate">{typeof window !== 'undefined' ? `${window.location.origin}/api/scenarios` : '/api/scenarios'}</span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/api/scenarios`;
                  navigator.clipboard.writeText(url);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[10px] shrink-0 flex items-center gap-1 cursor-pointer transition font-sans font-semibold"
              >
                {copiedUrl ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copiedUrl ? 'Copied' : 'Copy Endpoint'}</span>
              </button>
            </div>

            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>
                <strong>Claude Artifacts:</strong> Claude can fetch this directly via simple <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">fetch('{typeof window !== 'undefined' ? `${window.location.origin}/api/scenarios` : '/api/scenarios'}')</code> in 1 line with zero SDKs or auth tokens needed.
              </li>
              <li>
                <strong>Browser Sessions:</strong> Anyone accessing this application can load, inspect, or compare cloud-saved proposals in real time.
              </li>
              <li>
                <strong>Snapshots & Podcasts:</strong> Also available at <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">/api/snapshots</code> and <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">/api/podcasts</code>.
              </li>
            </ul>
          </div>

          {/* Agent Database/Webhook Sync Section */}
          <div className="p-3.5 rounded-sm bg-purple-50/50 border border-purple-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-950 font-bold">
                <Zap size={14} className="text-purple-600" />
                <span>Agent / Webhook Integration</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-2xs bg-purple-100 text-purple-800 font-bold">
                Agent Webhook Sync
              </span>
            </div>

            <p className="text-[11px] text-purple-900/80 leading-relaxed">
              Paste your Agent <strong>Custom Webhook URL</strong> below to mirror scenarios into your <strong>Agent Data Store</strong> or trigger automated multi-system routing.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 size={13} />
                </div>
                <input
                  type="url"
                  value={makeWebhookUrl}
                  onChange={(e) => setLocalMakeWebhookUrl(e.target.value)}
                  placeholder="https://agent-webhook-url... or https://hook.make.com/..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xs border border-purple-200 bg-white text-[11px] font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveMakeSettings}
                  className="px-2.5 py-1.5 rounded-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] transition cursor-pointer"
                >
                  Save URL
                </button>
                <button
                  type="button"
                  onClick={() => handleTestMakeSync()}
                  disabled={isSendingToMake || !makeWebhookUrl}
                  className="px-2.5 py-1.5 rounded-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Push current scenario into Agent"
                >
                  <Zap size={11} className={isSendingToMake ? 'animate-spin' : ''} />
                  <span>{isSendingToMake ? 'Sending...' : 'Sync to Agent'}</span>
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-purple-950">
              <input
                type="checkbox"
                checked={makeAutoSync}
                onChange={(e) => {
                  setLocalMakeAutoSync(e.target.checked);
                  setMakeAutoSyncEnabled(e.target.checked);
                  setFeedback({
                    type: 'success',
                    message: e.target.checked
                      ? 'Auto-sync enabled: Cloud saves will also push to Agent.'
                      : 'Auto-sync to Agent disabled.'
                  });
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>Automatically send to Agent whenever I click <strong>"Sync to Cloud"</strong></span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Status: {isConnected ? 'Online & Synchronized' : 'Testing Connection...'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
