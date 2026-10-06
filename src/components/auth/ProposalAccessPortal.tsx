import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Plus,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  Building2,
  Calendar,
  Clock,
  Database,
  Briefcase,
  X,
  RotateCcw,
  Trash2,
  Upload
} from 'lucide-react';
import { ProjectScenario } from '../../types';

export const MASTER_MPIN = '1909';
export const DEFAULT_DEAL_MPIN = '0000';

interface ProposalAccessPortalProps {
  customProposals: ProjectScenario[];
  activeScenario: ProjectScenario;
  onUnlockProposal: (proposal: ProjectScenario) => void;
  onOpenNewProposal: () => void;
  onDeleteProposal?: (id: string) => void;
  onImportJson?: (imported: ProjectScenario) => void;
}

export const ProposalAccessPortal: React.FC<ProposalAccessPortalProps> = ({
  customProposals,
  activeScenario,
  onUnlockProposal,
  onOpenNewProposal,
  onDeleteProposal,
  onImportJson
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<ProjectScenario | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJson) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed && (parsed.id || parsed.name)) {
            onImportJson(parsed);
          } else {
            alert('Invalid proposal JSON structure.');
          }
        } catch (err) {
          alert('Failed to parse proposal JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Focus pin input when modal opens
  useEffect(() => {
    if (selectedProposal) {
      setEnteredPin('');
      setErrorMessage(null);
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [selectedProposal]);

  // All custom proposals (pure custom deals - no pre-configured industry baseline samples)
  const allProposals = useMemo(() => {
    const list: Array<{ scenario: ProjectScenario; isCustom: boolean }> = [];
    const seenIds = new Set<string>();

    // Custom/cloud proposals first
    customProposals.forEach((p) => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        list.push({ scenario: p, isCustom: true });
      }
    });

    // Make sure activeScenario is in the list if not already
    if (!seenIds.has(activeScenario.id)) {
      seenIds.add(activeScenario.id);
      list.push({ scenario: activeScenario, isCustom: true });
    }

    return list;
  }, [customProposals, activeScenario]);

  // Filtered proposals by search query
  const filteredList = useMemo(() => {
    return allProposals.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const s = item.scenario;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.clientName && s.clientName.toLowerCase().includes(q)) ||
        (s.industry && s.industry.toLowerCase().includes(q)) ||
        (s.thorId && s.thorId.toLowerCase().includes(q))
      );
    });
  }, [allProposals, searchQuery]);

  const handleSelectCard = (proposal: ProjectScenario) => {
    setSelectedProposal(proposal);
  };

  const handleKeypadPress = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setErrorMessage(null);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClearPin = () => {
    setEnteredPin('');
    setErrorMessage(null);
  };

  const verifyPin = (pinToTest?: string) => {
    const pin = pinToTest || enteredPin;
    if (!selectedProposal) return;

    if (pin.length !== 4) {
      setErrorMessage('Please enter all 4 digits of the MPIN.');
      triggerShake();
      return;
    }

    setIsVerifying(true);

    // Verification Rule: Master MPIN (1909) ALWAYS grants universal access
    const isMaster = pin === MASTER_MPIN;
    const proposalMpin = selectedProposal.mpin || DEFAULT_DEAL_MPIN;
    const isValid = isMaster || pin === proposalMpin;

    setTimeout(() => {
      setIsVerifying(false);
      if (isValid) {
        // Successfully unlocked!
        onUnlockProposal(selectedProposal);
        setSelectedProposal(null);
      } else {
        setErrorMessage(
          (selectedProposal.mpin && selectedProposal.mpin !== '0000')
            ? 'Invalid MPIN. Please enter the configured proposal MPIN or Master MPIN (1909).'
            : 'Invalid MPIN. Enter default MPIN (0000) or Master MPIN (1909).'
        );
        triggerShake();
        setEnteredPin('');
        pinInputRef.current?.focus();
      }
    }, 250);
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Security Banner / Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Database size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">PB-Estimo</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-slate-800 text-amber-400 border border-slate-700">
                  Proposal Security Gate
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Oracle Cloud Enterprise Implementation Sizing & Project Plan Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleJsonUpload}
              accept=".json"
              className="hidden"
            />

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
              <Key size={12} className="text-amber-400" />
              <span>Master MPIN: <strong className="text-amber-300 font-bold">1909</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Default: <strong className="text-slate-200">0000</strong></span>
            </div>

            {onImportJson && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                title="Import existing proposal JSON"
              >
                <Upload size={13} />
                <span className="hidden md:inline">Import JSON</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNewProposal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-emerald-500"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>New Proposal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-sm p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Role-Based Proposal Access Control Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Select Custom Deal to Authenticate & Unlock
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All client proposals in PB-Estimo are strictly custom deals secured by a 4-digit MPIN. Select your proposal below and enter its MPIN to launch the live sizing cockpit.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-sm space-y-2 text-xs font-mono shrink-0">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                Access Verification Rules:
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span>Custom Deal MPIN (set during creation)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-amber-400 shrink-0" />
                  <span>Universal Master MPIN: <strong className="text-amber-300">1909</strong> for all proposals</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                  <span>Auto-saved to Cloud Firestore & session ledger</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by custom deal title, client, industry, or Thor ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-sm text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Deal Count Badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 text-xs font-bold rounded-sm bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Custom Deals ({allProposals.length})</span>
            </div>
          </div>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-sm space-y-3">
              <AlertTriangle size={28} className="mx-auto text-amber-400" />
              <p className="text-sm font-bold text-slate-300">No matching custom proposals found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No custom deals match "{searchQuery}". Create a new proposal to get started.
              </p>
              <button
                type="button"
                onClick={onOpenNewProposal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-sm inline-flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Create New Custom Deal</span>
              </button>
            </div>
          ) : (
            filteredList.map((item) => {
              const p = item.scenario;
              const isCurrent = p.id === activeScenario.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectCard(p)}
                  className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/80 rounded-sm p-5 flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-md hover:shadow-xl hover:translate-y-[-1px]"
                >
                  <div className="space-y-3">
                    {/* Card Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                          Custom Deal
                        </span>
                        {p.status && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-800 text-slate-400">
                            {p.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isCustom && onDeleteProposal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete proposal "${p.name}"?`)) {
                                onDeleteProposal(p.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xs transition cursor-pointer"
                            title="Delete Proposal"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 group-hover:text-amber-300">
                          <Lock size={12} className="stroke-[2.5]" />
                          <span>{p.mpin && p.mpin !== '0000' ? 'Custom MPIN' : 'MPIN: 0000'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Proposal Title & Client */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">
                        <Building2 size={12} className="shrink-0 text-slate-500" />
                        <span className="truncate">{p.clientName || 'Enterprise Account'}</span>
                        {p.industry && (
                          <>
                            <span>&bull;</span>
                            <span className="truncate text-slate-500">{p.industry}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metrics Chips */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                      <div className="bg-slate-950/60 p-2 rounded-xs border border-slate-850">
                        <span className="text-[10px] text-slate-500 block uppercase">Scope</span>
                        <span className="font-bold text-slate-200">
                          {p.selectedModules?.length || 0} Modules
                        </span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xs border border-slate-850">
                        <span className="text-[10px] text-slate-500 block uppercase">Timeline</span>
                        <span className="font-bold text-slate-200">
                          {p.projectWeeks || 32} Weeks
                        </span>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      {p.thorId ? p.thorId : `ID: ${p.id.slice(0, 14)}`}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span>Unlock & Sizing</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MPIN Verification Modal Dialog */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`bg-slate-900 border-2 border-slate-700 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 ${
              shakeError ? 'animate-shake' : ''
            }`}
          >
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-sm bg-amber-500 text-slate-950 font-bold">
                  <Lock size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white tracking-tight">Security MPIN Verification</h3>
                  <span className="text-[10px] font-mono text-slate-400">Restricted Proposal Access</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-slate-200">
              {/* Proposal Summary Card */}
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-sm space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Target Proposal:
                </span>
                <div className="font-bold text-sm text-white line-clamp-1">
                  {selectedProposal.name}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{selectedProposal.clientName || 'Apex Global Industries'}</span>
                  <span>&bull;</span>
                  <span>{selectedProposal.selectedModules?.length || 0} Modules</span>
                  <span>&bull;</span>
                  <span>{selectedProposal.projectWeeks || 32}w</span>
                </div>
              </div>

              {/* Pin Entry Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Enter 4-Digit Security MPIN:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPin ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    ref={pinInputRef}
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={enteredPin}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setEnteredPin(clean);
                      setErrorMessage(null);
                      if (clean.length === 4) {
                        verifyPin(clean);
                      }
                    }}
                    placeholder="••••"
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold p-3 bg-slate-950 border border-slate-700 rounded-sm text-white focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') verifyPin();
                    }}
                  />
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div className="p-2.5 rounded-sm bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-1.5 animate-in fade-in">
                    <ShieldAlert size={14} className="shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Virtual Numeric Keypad for convenience */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-white font-mono font-bold text-base rounded-xs transition cursor-pointer border border-slate-750"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono font-bold rounded-xs transition cursor-pointer border border-slate-750"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-white font-mono font-bold text-base rounded-xs transition cursor-pointer border border-slate-750"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono font-bold rounded-xs transition cursor-pointer border border-slate-750"
                >
                  ⌫
                </button>
              </div>

              {/* Master PIN Notification Note */}
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xs text-[11px] text-amber-300 flex items-center justify-between">
                <span>Accepted MPIN:</span>
                <span className="font-mono text-[11px] flex items-center gap-1.5">
                  {(!selectedProposal.mpin || selectedProposal.mpin === '0000') ? (
                    <span className="px-1.5 py-0.2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xs font-bold">
                      Default: 0000
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 bg-indigo-900/80 text-indigo-200 border border-indigo-700 rounded-xs font-bold">
                      Deal MPIN
                    </span>
                  )}
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-xs font-bold">
                    Master: 1909
                  </span>
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => verifyPin()}
                disabled={enteredPin.length !== 4 || isVerifying}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Unlock size={13} className="stroke-[2.5]" />
                    <span>Unlock Proposal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
