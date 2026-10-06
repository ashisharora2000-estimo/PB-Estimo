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
        setErrorMessage('Invalid Security MPIN. Please enter your valid 4-digit code.');
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Security Banner / Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Database size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">PB-Estimo</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  Proposal Security Gate
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
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

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
              <ShieldCheck size={12} className="text-amber-600" />
              <span>Confidential MPIN Gate</span>
            </div>

            {onImportJson && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-sm flex items-center gap-1.5 transition cursor-pointer border border-slate-200 shadow-xs"
                title="Import existing proposal JSON"
              >
                <Upload size={13} />
                <span className="hidden md:inline">Import JSON</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNewProposal}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-emerald-500"
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
        <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Role-Based Proposal Access Control Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Select Custom Deal to Authenticate & Unlock
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All client proposals in PB-Estimo are strictly custom deals secured by a 4-digit MPIN. Select your proposal below and enter its MPIN to launch the live sizing cockpit.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-2 text-xs font-mono shrink-0">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                Access Verification Rules:
              </div>
              <ul className="space-y-1.5 text-slate-700 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Custom Deal MPIN (set during creation)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                  <span>Universal Master Security MPIN override supported</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
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
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Deal Count Badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 text-xs font-bold rounded-sm bg-white border border-slate-200 text-slate-700 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Custom Deals ({allProposals.length})</span>
            </div>
          </div>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white border border-dashed border-slate-300 rounded-sm space-y-3 shadow-xs">
              <AlertTriangle size={28} className="mx-auto text-amber-500" />
              <p className="text-sm font-bold text-slate-800">No matching custom proposals found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No custom deals match "{searchQuery}". Create a new proposal to get started.
              </p>
              <button
                type="button"
                onClick={onOpenNewProposal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-sm inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Create New Custom Deal</span>
              </button>
            </div>
          ) : (
            filteredList.map((item) => {
              const p = item.scenario;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectCard(p)}
                  className="group bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-350 rounded-sm p-5 flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md hover:translate-y-[-1px]"
                >
                  <div className="space-y-3">
                    {/* Card Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Custom Deal
                        </span>
                        {p.status && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-600 border border-slate-200">
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
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xs transition cursor-pointer"
                            title="Delete Proposal"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 group-hover:text-slate-800">
                          <Lock size={12} className="stroke-[2.5]" />
                          <span>Protected</span>
                        </div>
                      </div>
                    </div>

                    {/* Proposal Title & Client */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <Building2 size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate">{p.clientName || 'Enterprise Account'}</span>
                        {p.industry && (
                          <>
                            <span>&bull;</span>
                            <span className="truncate text-slate-400">{p.industry}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metrics Chips */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                      <div className="bg-slate-50 p-2 rounded-xs border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase">Scope</span>
                        <span className="font-bold text-slate-800">
                          {p.selectedModules?.length || 0} Modules
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xs border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase">Timeline</span>
                        <span className="font-bold text-slate-800">
                          {p.projectWeeks || 32} Weeks
                        </span>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {p.thorId ? p.thorId : `ID: ${p.id.slice(0, 14)}`}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 group-hover:translate-x-1 transition-transform">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 ${
              shakeError ? 'animate-shake' : ''
            }`}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex items-center justify-between">
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
            <div className="p-6 space-y-5 text-slate-800">
              {/* Proposal Summary Card */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-sm space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold block">
                  Target Proposal:
                </span>
                <div className="font-bold text-sm text-slate-900 line-clamp-1">
                  {selectedProposal.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
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
                  <label className="text-xs font-bold text-slate-700">
                    Enter 4-Digit Security MPIN:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
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
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold p-3 bg-white border border-slate-300 rounded-sm text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') verifyPin();
                    }}
                  />
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div className="p-2.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 animate-in fade-in">
                    <ShieldAlert size={14} className="shrink-0 text-rose-600" />
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
                    className="py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-mono font-bold text-base rounded-xs transition cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-xs font-bold rounded-xs transition cursor-pointer border border-slate-200"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-mono font-bold text-base rounded-xs transition cursor-pointer border border-slate-200 shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-xs font-bold rounded-xs transition cursor-pointer border border-slate-200"
                >
                  ⌫
                </button>
              </div>

              {/* Confidential Security Verification Note */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs text-[11px] text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Lock size={12} className="text-amber-600" />
                  <span>Confidential Deal Access</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">4-Digit Security Code</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => verifyPin()}
                disabled={enteredPin.length !== 4 || isVerifying}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer shadow-xs transition"
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
