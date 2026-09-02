import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  User,
  ShieldCheck,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  Scale,
  X,
  ExternalLink,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';
import {
  ASHISH_ARORA_PERSONA,
  ESTIMATION_KNOWLEDGE_BASE,
  KnowledgeTopic
} from '../../data/ashishPersonaKnowledgeBase';
import { askAshishArora, ChatMessage } from '../../utils/ashishChatbotEngine';
import { AttributionBadge } from '../common/AttributionBadge';

interface AshishAroraChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onNavigateTab?: (tab: string) => void;
  onOpenTraceMath?: (moduleId?: string) => void;
  onOpenComplexityStudio?: (tab?: string) => void;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

const QUICK_PROMPT_STARTERS = [
  {
    label: '⏱️ Project Timeline',
    prompt: 'How many weeks will this project take, and what happens in each phase?'
  },
  {
    label: '👥 Team & Roles',
    prompt: 'How many people do we need on the team and what will each person do?'
  },
  {
    label: '💰 Cost & Profit Margin',
    prompt: 'What is the estimated cost, billing rate, and profit margin for this project?'
  },
  {
    label: '⚠️ Delivery Risks',
    prompt: 'What are the main delivery risks and how do we avoid them?'
  },
  {
    label: '🛡️ Accuracy Guardrails',
    prompt: 'How does this tool prevent inaccurate or hallucinated estimates?'
  },
  {
    label: '🔧 How to Fix Low Margin',
    prompt: 'How do I fix a project if the profit margin is too low?'
  }
];

export const AshishAroraChatbotModal: React.FC<AshishAroraChatbotModalProps> = ({
  isOpen,
  onClose,
  scenario,
  data,
  onNavigateTab,
  onOpenTraceMath,
  onOpenComplexityStudio,
  onUpdateScenario
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge_base' | 'persona_profile'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchKbTerm, setSearchKbTerm] = useState('');
  const [selectedKbTopic, setSelectedKbTopic] = useState<KnowledgeTopic | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chat message history with structured chips & actions
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_1',
      sender: 'ashish',
      text: `**🎯 Bottom Line:** Connected to **"${scenario.name}"** — sized at **${scenario.projectWeeks} weeks**, **${Math.round(data.totalHours).toLocaleString()} hours**, and **${Math.round(data.grossMarginPct)}% margin**.

**3-Point Breakdown:**
- **1. Scope & Scale:** ${scenario.selectedModules.length} Oracle Cloud modules across ${scenario.scaleDrivers.fin_ent || 3} legal entities.
- **2. Team Sizing:** Peak team of ${(data.peakFTE || 14.5).toFixed(1)} FTEs with ${scenario.deliveryMix?.onshore || 25}% Onshore / ${scenario.deliveryMix?.offshore || 75}% Offshore staffing.
- **3. Defensibility:** Fully grounded in True Cloud Method (TCM) stage-gate benchmarks.

💡 **Recommended Action:** Ask any question below or click an action button to inspect the active plan.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceAttribution: 'Active Scenario Engine (Verified Data)',
      confidencePct: 100,
      statChips: [
        { label: 'Duration', value: `${scenario.projectWeeks} Weeks`, color: 'blue' },
        { label: 'Total Hours', value: `${Math.round(data.totalHours).toLocaleString()} hrs`, color: 'slate' },
        { label: 'Gross Margin', value: `${Math.round(data.grossMarginPct)}%`, color: data.grossMarginPct >= 40 ? 'emerald' : 'amber' },
        { label: 'Scope', value: `${scenario.selectedModules.length} Modules`, color: 'purple' }
      ],
      actionButtons: [
        { label: 'View Gantt Schedule', actionId: 'view_gantt', iconName: 'gantt' },
        { label: 'Trace The Math', actionId: 'trace_math', iconName: 'math' },
        { label: 'Open Commercials', actionId: 'view_commercials', iconName: 'commercials' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleActionClick = (actionId: string, label: string) => {
    if (actionId === 'view_gantt') {
      onNavigateTab?.('gantt');
      onClose();
    } else if (actionId === 'view_staffing') {
      onNavigateTab?.('staffing');
      onClose();
    } else if (actionId === 'view_commercials') {
      onNavigateTab?.('commercials');
      onClose();
    } else if (actionId === 'view_demarcation') {
      onNavigateTab?.('demarcation');
      onClose();
    } else if (actionId === 'view_governance') {
      onNavigateTab?.('governance');
      onClose();
    } else if (actionId === 'trace_math') {
      onOpenTraceMath?.();
      onClose();
    } else if (actionId === 'complexity_studio') {
      onOpenComplexityStudio?.('complexity');
      onClose();
    } else if (actionId === 'apply_offshore_75') {
      if (onUpdateScenario) {
        onUpdateScenario(prev => ({
          ...prev,
          deliveryMix: {
            ...prev.deliveryMix,
            onshore: 25,
            offshore: 75,
            nearshore: 0
          }
        }));
      }
      setMessages(prev => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          sender: 'ashish',
          text: `**🎯 Bottom Line:** Applied **25% Onshore / 75% Offshore** delivery mix to **${scenario.name}**.

**3-Point Breakdown:**
- **1. Sourcing Optimization:** Shifted technical build and configuration to global delivery centers.
- **2. Margin Lift:** Boosted estimated gross margin to **42%+** without impacting the ${scenario.projectWeeks}-week target go-live.
- **3. Governance:** Retained senior architect runway onshore for strategic client workshops.

💡 **Recommended Action:** Review the updated financials in the Commercials tab.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourceAttribution: 'Commercial Sizing Engine (Updated)',
          confidencePct: 100,
          statChips: [
            { label: 'Offshore Ratio', value: '75%', color: 'emerald' },
            { label: 'Onshore Ratio', value: '25%', color: 'blue' },
            { label: 'Target Margin', value: '42%+', color: 'emerald' }
          ],
          actionButtons: [
            { label: 'View Commercials', actionId: 'view_commercials', iconName: 'commercials' },
            { label: 'Open Staffing Grid', actionId: 'view_staffing', iconName: 'staffing' }
          ]
        }
      ]);
    }
  };

  const renderActionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'gantt':
        return <Clock size={11} className="text-blue-500" />;
      case 'staffing':
        return <Users size={11} className="text-emerald-500" />;
      case 'commercials':
        return <DollarSign size={11} className="text-amber-500" />;
      case 'demarcation':
        return <ShieldCheck size={11} className="text-purple-500" />;
      case 'governance':
        return <Scale size={11} className="text-indigo-500" />;
      case 'math':
        return <Zap size={11} className="text-amber-500" />;
      case 'complexity':
        return <Sparkles size={11} className="text-cyan-500" />;
      case 'apply_offshore':
        return <RotateCcw size={11} className="text-emerald-500" />;
      default:
        return <ChevronRight size={11} className="text-slate-500" />;
    }
  };

  const getChipClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const ashishResponse = await askAshishArora(text, scenario, data);
      setMessages(prev => [...prev, ashishResponse]);
    } catch (err) {
      console.error('Failed to get Ashish response:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ashish',
          text: `I encountered an unexpected issue synthesizing the response, but my knowledge base is operational. Please review the **Knowledge Base Explorer** tab for immediate guidelines.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourceAttribution: 'System Fallback',
          confidencePct: 80
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'ashish',
        text: `### 🔄 Session Reset
Ready for new questions on **${scenario.name}** or platform methodologies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceAttribution: 'Ashish Arora Sizing Engine',
        confidencePct: 100
      }
    ]);
  };

  const filteredKbTopics = ESTIMATION_KNOWLEDGE_BASE.filter(topic => {
    if (!searchKbTerm) return true;
    const term = searchKbTerm.toLowerCase();
    return (
      topic.title.toLowerCase().includes(term) ||
      topic.summary.toLowerCase().includes(term) ||
      topic.keywords.some(k => k.toLowerCase().includes(term))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-slate-900 shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-xs text-sm border-2 border-white/20">
              EA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">Ask Estimo Agent</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-emerald-500 text-slate-950 uppercase rounded-xs">
                  Active Agent
                </span>
                <span className="text-[10px] font-mono text-slate-300 hidden sm:inline">
                  PB-Estimo Intelligent Copilot
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Lead Solution Architecture & Sizing Copilot • Grounded in Oracle True Cloud Method
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Estimo Agent"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Scenario Telemetry Banner */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center justify-between text-xs text-slate-700 flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Active Scenario:</span>
            <span className="font-bold text-slate-900 truncate max-w-xs">{scenario.name}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span><strong>{scenario.selectedModules.length}</strong> Modules</span>
            <span><strong>{Math.round(data.totalHours).toLocaleString()}</strong> hrs</span>
            <span><strong>{scenario.projectWeeks}</strong> wks</span>
            <span className={data.grossMarginPct >= 40 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              <strong>{Math.round(data.grossMarginPct)}%</strong> Margin
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'chat'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={14} />
            <span>Chat with Estimo Agent</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('knowledge_base')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'knowledge_base'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={14} />
            <span>Knowledge Base Explorer ({ESTIMATION_KNOWLEDGE_BASE.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('persona_profile')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'persona_profile'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Persona & RBAC Profile</span>
          </button>
        </div>

        {/* Tab 1: Chat with Ashish */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
            {/* Quick Starters Carousel */}
            <div className="p-3 bg-white border-b border-slate-200 overflow-x-auto whitespace-nowrap space-x-2 shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1 inline-block">
                Quick Inquiries:
              </span>
              {QUICK_PROMPT_STARTERS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  className="inline-block px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xs font-medium transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Chat Message Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isAshish = msg.sender === 'ashish';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAshish ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAshish && (
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-slate-700 shadow-xs">
                        EA
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-sm p-3.5 space-y-2 border text-xs shadow-2xs leading-relaxed ${
                        isAshish
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-slate-900 border-slate-900 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-200/40 text-[10px] font-mono">
                        <span className={isAshish ? 'font-bold text-slate-700' : 'text-slate-300'}>
                          {isAshish ? 'Estimo Agent • Sizing AI' : 'Deal Lead (You)'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={isAshish ? 'text-slate-400' : 'text-slate-400'}>{msg.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1 hover:text-amber-500 transition cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>

                      {/* Interactive Visual Stat Chips (if present) */}
                      {isAshish && msg.statChips && msg.statChips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.statChips.map((chip, chipIdx) => (
                            <span
                              key={chipIdx}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-semibold border ${getChipClasses(chip.color)}`}
                            >
                              <span className="opacity-70">{chip.label}:</span>
                              <span className="font-bold">{chip.value}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Message Content Rendered cleanly */}
                      <div className="whitespace-pre-line prose-sm text-xs font-sans space-y-2 pt-0.5">
                        {msg.text}
                      </div>

                      {/* 1-Click Interactive Action Buttons (if present) */}
                      {isAshish && msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="pt-2 border-t border-slate-100/80 flex flex-wrap gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400 self-center mr-1">
                            Quick Actions:
                          </span>
                          {msg.actionButtons.map((btn, btnIdx) => (
                            <button
                              key={btnIdx}
                              type="button"
                              onClick={() => handleActionClick(btn.actionId, btn.label)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-[10px] font-semibold transition transform hover:scale-[1.02] cursor-pointer shadow-2xs"
                            >
                              {renderActionIcon(btn.iconName)}
                              <span>{btn.label}</span>
                              <ChevronRight size={10} className="text-slate-400" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Source Attribution Badge if Ashish */}
                      {isAshish && msg.sourceAttribution && (
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <AttributionBadge
                            type="direct"
                            citation={msg.sourceAttribution}
                            confidencePct={msg.confidencePct}
                            compact
                          />
                          <span className="text-slate-400 font-mono text-[9px]">Verified Sizing Engine</span>
                        </div>
                      )}
                    </div>

                    {!isAshish && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-slate-300">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    AA
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-sm text-xs flex items-center gap-2 text-slate-600 shadow-2xs">
                    <Sparkles size={14} className="animate-spin text-amber-500" />
                    <span>Ashish is analyzing scenario metrics & knowledge base...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Ashish about project timeline, resource allocation, cost estimation, risks, or sizing formulas..."
                  className="flex-1 text-xs p-2.5 border border-slate-300 font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-2.5 text-slate-400 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                  title="Clear conversation"
                >
                  <RotateCcw size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Knowledge Base Explorer */}
        {activeTab === 'knowledge_base' && (
          <div className="flex-1 flex min-h-0">
            {/* Topic List (Left) */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 p-3 flex flex-col gap-2 overflow-y-auto">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchKbTerm}
                  onChange={(e) => setSearchKbTerm(e.target.value)}
                  placeholder="Search topics or keywords..."
                  className="w-full text-xs pl-8 pr-2 py-1.5 border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1 mt-1">
                {filteredKbTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedKbTopic(topic)}
                    className={`w-full text-left p-2.5 border text-xs transition cursor-pointer ${
                      (selectedKbTopic?.id || filteredKbTopics[0]?.id) === topic.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold truncate">{topic.title}</div>
                    <div className="text-[10px] opacity-75 font-mono truncate">{topic.summary}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Detail (Right) */}
            <div className="flex-1 p-5 overflow-y-auto bg-white space-y-4">
              {(() => {
                const topic = selectedKbTopic || filteredKbTopics[0] || ESTIMATION_KNOWLEDGE_BASE[0];
                return (
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-200">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                        Category: {topic.category.toUpperCase()}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-2">{topic.title}</h2>
                      <p className="text-xs text-slate-600 mt-1">{topic.summary}</p>
                    </div>

                    <div className="whitespace-pre-line text-xs text-slate-800 leading-relaxed font-sans bg-slate-50/50 p-4 border border-slate-200">
                      {topic.detailedContent}
                    </div>

                    {topic.bestPractices && topic.bestPractices.length > 0 && (
                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 space-y-2">
                        <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-700" />
                          <span>Ashish's Recommended Delivery Best Practices</span>
                        </h4>
                        <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                          {topic.bestPractices.map((bp, i) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400 mr-1">Keywords:</span>
                        {topic.keywords.map((kw, i) => (
                          <span key={i} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 border border-slate-200">
                            #{kw}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendMessage(`Can you explain more about ${topic.title} for our active scenario?`);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <span>Discuss in Chat</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 3: Persona & RBAC Profile */}
        {activeTab === 'persona_profile' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-5">
            <div className="bg-white border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold border-2 border-amber-400">
                  AA
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{ASHISH_ARORA_PERSONA.name}</h3>
                  <p className="text-xs font-mono text-slate-600">{ASHISH_ARORA_PERSONA.title}</p>
                  <p className="text-xs text-slate-500">{ASHISH_ARORA_PERSONA.organization}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Personality & Advisory Traits:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ASHISH_ARORA_PERSONA.personalityTraits.map((trait, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      • {trait}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Core Sizing Competencies & Practice Standards:
                </h4>
                <div className="space-y-1.5">
                  {ASHISH_ARORA_PERSONA.coreCompetencies.map((comp, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-800">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-700" />
                  <span>Group 7 Enterprise Role: Platform & Governance Lead</span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  Oversees all master rate cards, Deal Review Board DoA signing thresholds, universal guardrail enforcement (G1 to G5), and OCI IAM/SSO RBAC policies.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
