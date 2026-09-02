import React, { useState } from 'react';
import { X, Plus, Layers, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { ModuleDefinition, OraclePillar } from '../../types';

interface AddCustomModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPillars: string[];
  onAddModule: (newModule: ModuleDefinition, shouldSelect: boolean) => void;
}

export const AddCustomModuleModal: React.FC<AddCustomModuleModalProps> = ({
  isOpen,
  onClose,
  existingPillars,
  onAddModule
}) => {
  const [moduleId, setModuleId] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [pillar, setPillar] = useState('ERP');
  const [customPillarInput, setCustomPillarInput] = useState('');
  const [isCreatingNewPillar, setIsCreatingNewPillar] = useState(false);
  const [description, setDescription] = useState('');
  const [baseHours, setBaseHours] = useState<number>(350);
  const [complexityFactor, setComplexityFactor] = useState<number>(1.2);
  const [autoSelectInScope, setAutoSelectInScope] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setModuleName(val);
    if (!moduleId || moduleId.startsWith('custom_') || moduleId.includes('_')) {
      const generated = 'custom_' + val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 24);
      setModuleId(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!moduleName.trim()) {
      setErrorMessage('Please enter a valid module name.');
      return;
    }

    const finalPillar = isCreatingNewPillar ? customPillarInput.trim().toUpperCase() : pillar;
    if (!finalPillar) {
      setErrorMessage('Please select or specify a domain/pillar.');
      return;
    }

    const finalId = moduleId.trim() || ('mod_' + Date.now().toString(36));

    const newMod: ModuleDefinition = {
      id: finalId,
      name: moduleName.trim(),
      pillar: finalPillar,
      description: description.trim() || `Custom module for ${moduleName.trim()}`,
      baseEffortHours: Number(baseHours) || 350,
      complexityFactor: Number(complexityFactor) || 1.2,
      isCustom: true
    };

    onAddModule(newMod, autoSelectInScope);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 w-full max-w-xl shadow-2xl rounded-none flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Add Custom Module or Domain</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-600 text-rose-800 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Module Name */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-700 block">
              Module Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Treasury & Risk Management, Trade Management, PLM Cloud"
              value={moduleName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium text-xs"
            />
          </div>

          {/* Unique Identifier / Code */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-700 block">
              Unique Module Code / ID
            </label>
            <input
              type="text"
              placeholder="e.g. erp_treasury, scm_plm, custom_trade"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 font-mono text-xs"
            />
            <p className="text-[10px] text-slate-400 font-mono">Internal unique key for calculation rules & questionnaires.</p>
          </div>

          {/* Domain / Pillar Selector */}
          <div className="space-y-2 pt-1">
            <label className="font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Domain / Pillar</span>
              <button
                type="button"
                onClick={() => setIsCreatingNewPillar(!isCreatingNewPillar)}
                className="text-indigo-600 hover:text-indigo-800 font-bold uppercase text-[10px] cursor-pointer"
              >
                {isCreatingNewPillar ? 'Choose Existing Pillar' : '+ Create New Domain/Pillar'}
              </button>
            </label>

            {isCreatingNewPillar ? (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Enter new Domain Name (e.g. TREASURY, ANALYTICS, PLM, CUSTOM)"
                  value={customPillarInput}
                  onChange={(e) => setCustomPillarInput(e.target.value)}
                  className="w-full p-2 bg-amber-50/60 border border-amber-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-bold text-xs uppercase"
                />
                <p className="text-[10px] text-slate-500">This will automatically create a new domain filter tab in the scoping sheet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {Array.from(new Set(['ERP', 'SCM', 'HCM', 'EPM', 'CX', ...existingPillars])).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPillar(p)}
                    className={`py-2 px-1 text-center font-bold text-xs transition cursor-pointer border ${
                      pillar === p
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-700 block">
              Scope Summary / Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of key capabilities, operational scope, and standard sub-processes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 text-xs"
            />
          </div>

          {/* Base Effort & Complexity Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-700 block">
                Base Effort (Hours)
              </label>
              <input
                type="number"
                min={50}
                max={5000}
                step={10}
                value={baseHours}
                onChange={(e) => setBaseHours(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400">Baseline effort before 20-Q questionnaire.</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-700 block">
                Complexity Factor
              </label>
              <select
                value={complexityFactor}
                onChange={(e) => setComplexityFactor(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium text-xs cursor-pointer"
              >
                <option value={1.0}>1.0x - Standard / Low Friction</option>
                <option value={1.15}>1.15x - Moderate Complexity</option>
                <option value={1.25}>1.25x - High Complexity</option>
                <option value={1.4}>1.40x - Very High / Regulated</option>
                <option value={1.6}>1.60x - Complex Mission Critical</option>
              </select>
              <p className="text-[10px] text-slate-400">Base multiplier applied to module hours.</p>
            </div>
          </div>

          {/* Auto Include in Scope Checkbox */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSelectInScope}
                onChange={(e) => setAutoSelectInScope(e.target.checked)}
                className="w-4 h-4 rounded-none border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="font-bold text-slate-800 text-xs">
                Immediately include in active project scope
              </span>
            </label>
            <p className="text-[10px] text-slate-500 ml-6">
              A full 20-question scoping sheet will be generated automatically for this module, ready for live sizing.
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Module</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
