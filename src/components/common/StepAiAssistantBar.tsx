import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Cpu,
  Sliders
} from 'lucide-react';
import { askOracleAiAdvisor } from '../../utils/aiService';

interface StepAiAssistantBarProps {
  stepName: string;
  stepDescription: string;
  quickPrompts: string[];
  contextData?: any;
  onOpenComplexityStudio?: (tab?: 'complexity' | 'questions' | 'drivers' | 'ai_advisor') => void;
}

export const StepAiAssistantBar: React.FC<StepAiAssistantBarProps> = ({
  stepName,
  stepDescription,
  quickPrompts,
  contextData,
  onOpenComplexityStudio
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunPrompt = async (promptText: string) => {
    setActivePrompt(promptText);
    setIsExpanded(true);
    setLoading(true);
    try {
      const res = await askOracleAiAdvisor(promptText, {
        step: stepName,
        stepDetails: stepDescription,
        data: contextData
      });
      setAiOutput(res.text);
    } catch (e) {
      console.error('AI assistant error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-lg border border-indigo-900/60 shadow-xs overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                AI Architect Co-Pilot • {stepName}
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              {stepDescription}
            </p>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleRunPrompt(prompt)}
              disabled={loading}
              className="px-2.5 py-1 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/50 rounded text-[11px] font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{prompt}</span>
            </button>
          ))}

          {onOpenComplexityStudio && (
            <button
              onClick={() => onOpenComplexityStudio('complexity')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] font-medium text-slate-300 flex items-center gap-1 transition-colors"
              title="Adjust global complexity or add custom questions"
            >
              <Sliders className="w-3 h-3 text-indigo-400" />
              <span>Complexity Dial</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded AI Output Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Prompt: "{activePrompt || quickPrompts[0]}"</span>
            </div>
            <div className="flex items-center gap-2">
              {aiOutput && (
                <button
                  onClick={handleCopyOutput}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
              <button
                onClick={() => handleRunPrompt(activePrompt || quickPrompts[0])}
                disabled={loading}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Rerun
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Oracle Global Practice AI is synthesizing architectural and commercial guidance...</span>
              </div>
            ) : aiOutput ? (
              aiOutput
            ) : (
              <span className="text-slate-400">
                Click any of the AI prompt chips above to generate targeted strategic insights for this step.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
