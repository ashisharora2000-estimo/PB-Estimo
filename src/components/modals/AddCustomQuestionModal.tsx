import React, { useState } from 'react';
import { X, Plus, HelpCircle, Save, Sliders } from 'lucide-react';
import { ModuleScopingQuestion } from '../../data/moduleScopingQuestions';

interface AddCustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  onAddQuestion: (newQuestion: ModuleScopingQuestion) => void;
}

export const AddCustomQuestionModal: React.FC<AddCustomQuestionModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  moduleName,
  onAddQuestion
}) => {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState<ModuleScopingQuestion['category']>('Process Scope');
  const [rationale, setRationale] = useState('');
  const [opt1Label, setOpt1Label] = useState('Standard Out-of-the-Box (MBP)');
  const [opt1Desc, setOpt1Desc] = useState('Standard vanilla modern best practices with zero customization');
  const [opt1Hours, setOpt1Hours] = useState(0);

  const [opt2Label, setOpt2Label] = useState('Moderate Variations (2-3 Rules)');
  const [opt2Desc, setOpt2Desc] = useState('Moderate deviations with minor workflow tweaks');
  const [opt2Hours, setOpt2Hours] = useState(30);

  const [opt3Label, setOpt3Label] = useState('Advanced Multi-Entity / Complex Rules');
  const [opt3Desc, setOpt3Desc] = useState('Multi-country requirements and custom validation logic');
  const [opt3Hours, setOpt3Hours] = useState(65);

  const [opt4Label, setOpt4Label] = useState('Complex / Highly Customized');
  const [opt4Desc, setOpt4Desc] = useState('High-density custom extensions, mission-critical processing');
  const [opt4Hours, setOpt4Hours] = useState(120);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQuestion: ModuleScopingQuestion = {
      id: `${moduleId}_q_custom_${Date.now().toString(36)}`,
      category,
      question: questionText.trim(),
      rationale: rationale.trim() || `Assesses complexity factor for ${moduleName}`,
      options: [
        { label: opt1Label, score: 1, desc: opt1Desc, hoursImpact: Number(opt1Hours) || 0 },
        { label: opt2Label, score: 2, desc: opt2Desc, hoursImpact: Number(opt2Hours) || 30 },
        { label: opt3Label, score: 3, desc: opt3Desc, hoursImpact: Number(opt3Hours) || 65 },
        { label: opt4Label, score: 4, desc: opt4Desc, hoursImpact: Number(opt4Hours) || 120 }
      ]
    };

    onAddQuestion(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 w-full max-w-2xl shadow-2xl rounded-none flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-amber-400" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">Add Scoping Question</h3>
              <p className="text-[10px] text-slate-300 font-mono">Module: {moduleName} ({moduleId})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[82vh]">
          {/* Question Title */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-700 block">
              Question Title / Scope Dimension <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Multi-Currency Hedging Engine, Legacy Data Migration Cycles, Custom OIC Middleware Protocol"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 text-xs font-semibold"
            />
          </div>

          {/* Category & Rationale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-700 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 text-xs cursor-pointer font-medium"
              >
                <option value="Process Scope">Process Scope</option>
                <option value="Integrations & Feeds">Integrations & Feeds</option>
                <option value="Data & Conversions">Data & Conversions</option>
                <option value="Approvals & Workflows">Approvals & Workflows</option>
                <option value="Reporting & Analytics">Reporting & Analytics</option>
                <option value="Compliance & Security">Compliance & Security</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-slate-700 block">
                Architectural Rationale
              </label>
              <input
                type="text"
                placeholder="Why this dimension drives labor effort or design complexity..."
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 text-xs"
              />
            </div>
          </div>

          {/* 4-Tier Complexity Options */}
          <div className="space-y-3 pt-2">
            <label className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b pb-1">
              <Sliders size={13} className="text-slate-500" />
              <span>4-Tier Maturity & Hours Impact Options</span>
            </label>

            {/* C1 */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-200 px-1.5 py-0.5">C1 (Standard)</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">Hours Impact:</span>
                  <input
                    type="number"
                    min={0}
                    value={opt1Hours}
                    onChange={(e) => setOpt1Hours(Number(e.target.value))}
                    className="w-16 p-1 text-right font-mono bg-white border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">hrs</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="C1 Option Label"
                value={opt1Label}
                onChange={(e) => setOpt1Label(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="C1 Details/Description"
                value={opt1Desc}
                onChange={(e) => setOpt1Desc(e.target.value)}
                className="w-full p-1 bg-white border border-slate-200 text-[11px] text-slate-600"
              />
            </div>

            {/* C2 */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-200 px-1.5 py-0.5">C2 (Moderate)</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">Hours Impact:</span>
                  <input
                    type="number"
                    min={0}
                    value={opt2Hours}
                    onChange={(e) => setOpt2Hours(Number(e.target.value))}
                    className="w-16 p-1 text-right font-mono bg-white border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">hrs</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="C2 Option Label"
                value={opt2Label}
                onChange={(e) => setOpt2Label(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="C2 Details/Description"
                value={opt2Desc}
                onChange={(e) => setOpt2Desc(e.target.value)}
                className="w-full p-1 bg-white border border-slate-200 text-[11px] text-slate-600"
              />
            </div>

            {/* C3 */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-200 px-1.5 py-0.5">C3 (Complex)</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">Hours Impact:</span>
                  <input
                    type="number"
                    min={0}
                    value={opt3Hours}
                    onChange={(e) => setOpt3Hours(Number(e.target.value))}
                    className="w-16 p-1 text-right font-mono bg-white border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">hrs</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="C3 Option Label"
                value={opt3Label}
                onChange={(e) => setOpt3Label(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="C3 Details/Description"
                value={opt3Desc}
                onChange={(e) => setOpt3Desc(e.target.value)}
                className="w-full p-1 bg-white border border-slate-200 text-[11px] text-slate-600"
              />
            </div>

            {/* C4 */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-200 px-1.5 py-0.5">C4 (High Custom)</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">Hours Impact:</span>
                  <input
                    type="number"
                    min={0}
                    value={opt4Hours}
                    onChange={(e) => setOpt4Hours(Number(e.target.value))}
                    className="w-16 p-1 text-right font-mono bg-white border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">hrs</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="C4 Option Label"
                value={opt4Label}
                onChange={(e) => setOpt4Label(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="C4 Details/Description"
                value={opt4Desc}
                onChange={(e) => setOpt4Desc(e.target.value)}
                className="w-full p-1 bg-white border border-slate-200 text-[11px] text-slate-600"
              />
            </div>
          </div>

          {/* Footer */}
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
              <Save size={14} />
              <span>Save Scoping Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
