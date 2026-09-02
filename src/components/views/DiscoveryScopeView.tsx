import React, { useState, useMemo } from 'react';
import {
  Target,
  Factory,
  Building2,
  Users,
  Database,
  Layers,
  Cpu,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Info,
  Sparkles,
  Sliders,
  Calendar,
  AlertTriangle,
  Compass,
  FileCheck2,
  Plus,
  Trash2,
  HelpCircle,
  Play,
  ArrowLeft,
  ArrowRight,
  Grid,
  ListFilter,
  RotateCcw,
  BookOpen,
  CheckSquare,
  Globe,
  Workflow,
  ShieldCheck,
  CheckCheck,
  Clock,
  TrendingUp,
  MapPin,
  Upload,
  Download,
  Mail,
  FileQuestion,
  Search,
  ExternalLink,
  Tag,
  ListChecks
} from 'lucide-react';
import { ProjectScenario, ScaleDrivers, OracleModule, RolloutApproach, BlackoutPeriod, TShirtSize } from '../../types';
import {
  ORACLE_MODULE_CATALOG,
  COMPLEXITY_PILLARS
} from '../../data/oraclePhases';
import { getQuestionsForModule, ModuleScopingQuestion } from '../../data/moduleScopingQuestions';
import { ENTERPRISE_ROLLOUT_QUESTIONS, ROLLOUT_QUESTION_CATEGORIES } from '../../data/rolloutQuestions';
import { calculateProjectMetrics } from '../../utils/calculator';
import { TShirtBadge, T_SHIRT_CONFIG, TShirtSelect } from '../common/TShirtBadge';
import { ModuleTShirtMatrix } from '../common/ModuleTShirtMatrix';
import { AIScopingAgentModal, AgentInputMode } from '../modals/AIScopingAgentModal';
import { ClientQaModal } from '../modals/ClientQaModal';
import { AddCustomModuleModal } from '../modals/AddCustomModuleModal';
import { AddCustomQuestionModal } from '../modals/AddCustomQuestionModal';
import { Module20QuestionsModal } from '../modals/Module20QuestionsModal';
import { TechnicalInventoryManager } from '../technical/TechnicalInventoryManager';
import { TestingAssuranceView } from './TestingAssuranceView';
import { DEFAULT_TECHNICAL_INTEGRATIONS } from '../../data/technicalScopingData';
import { SmartBlueprintAutoFillDrawer } from '../ai/SmartBlueprintAutoFillDrawer';
import { CLIENT_FRICTION_FACTORS_DEF, calculateNetClientModifier } from '../../data/clientFrictionData';

interface DiscoveryScopeViewProps {
  scenario: ProjectScenario;
  onUpdateScenario: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
  onOpenComplexityStudio?: (tab?: 'complexity' | 'questions' | 'drivers' | 'ai_advisor') => void;
  onOpenTraceMath?: (target?: OracleModule | 'project_total') => void;
  activeSection?: 'modules' | 'technical' | 'testing' | 'modifiers' | 'rollout' | 'blackout' | 'topology' | 'traceability';
  onSectionChange?: (section: 'modules' | 'technical' | 'testing' | 'modifiers' | 'rollout' | 'blackout' | 'topology' | 'traceability') => void;
}

export const DiscoveryScopeView: React.FC<DiscoveryScopeViewProps> = ({
  scenario,
  onUpdateScenario,
  onOpenComplexityStudio,
  onOpenTraceMath,
  activeSection: controlledActiveSection,
  onSectionChange
}) => {
  const [internalActiveSection, setInternalActiveSection] = useState<'modules' | 'technical' | 'testing' | 'modifiers' | 'rollout' | 'blackout' | 'topology' | 'traceability'>('modules');
  const activeSection = controlledActiveSection ?? internalActiveSection;

  const setActiveSection = (section: 'modules' | 'technical' | 'testing' | 'modifiers' | 'rollout' | 'blackout' | 'topology' | 'traceability') => {
    setInternalActiveSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };
  const [activePillarTab, setActivePillarTab] = useState<string>('ALL');
  const [scopingSearchQuery, setScopingSearchQuery] = useState<string>('');
  const [scopingScopeFilter, setScopingScopeFilter] = useState<'all' | 'in_scope' | 'out_of_scope'>('all');
  const [expandedQuestionModules, setExpandedQuestionModules] = useState<Record<string, boolean>>({});
  
  // Custom Module & Question Modal States
  const [isAddCustomModuleOpen, setIsAddCustomModuleOpen] = useState<boolean>(false);
  const [addQuestionTargetModule, setAddQuestionTargetModule] = useState<{ id: string; name: string } | null>(null);

  // Dynamic list of all available modules (standard catalog + user-added custom modules)
  const combinedModules = useMemo(() => {
    return [...ORACLE_MODULE_CATALOG, ...(scenario.customModules || [])];
  }, [scenario.customModules]);

  // Dynamic list of all pillars/domains (ERP, SCM, HCM, EPM, CX + any custom pillars created)
  const availablePillars = useMemo(() => {
    const defaultPillars = ['ALL', 'ERP', 'SCM', 'HCM', 'EPM', 'CX'];
    const customPillarsFromMods = (scenario.customModules || []).map(m => m.pillar);
    const customExplicitPillars = scenario.customPillars || [];
    const allUnique = Array.from(new Set([...defaultPillars, ...customPillarsFromMods, ...customExplicitPillars]));
    return allUnique;
  }, [scenario.customModules, scenario.customPillars]);

  // Helper to fetch module questions (checking customModuleQuestions override first)
  const getModuleQuestionsList = (modId: string): ModuleScopingQuestion[] => {
    const customList = scenario.customModuleQuestions?.[modId];
    if (customList && customList.length > 0) return customList;
    return getQuestionsForModule(modId);
  };
  
  // Scoping Question View Modes: 'simple_tshirt' (Tabular Scoping Sheet), 'catalog' (module list), 'interview' (step-by-step interactive questions), 'matrix' (all 20 in grid), 'tshirt_matrix' (T-shirt portfolio)
  const [scopingMode, setScopingMode] = useState<'simple_tshirt' | 'catalog' | 'interview' | 'matrix' | 'tshirt_matrix'>('simple_tshirt');
  const [activeInterviewModuleId, setActiveInterviewModuleId] = useState<OracleModule>('erp_gl');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [expandedModuleId, setExpandedModuleId] = useState<OracleModule | null>(null);

  // 20-Question Dedicated Scoping Studio / Wizard Modal
  const [is20QModalOpen, setIs20QModalOpen] = useState<boolean>(false);
  const [selected20QModuleId, setSelected20QModuleId] = useState<OracleModule>('erp_gl');
  const [modal20QMode, setModal20QMode] = useState<'worksheet' | 'wizard'>('worksheet');
  const [modal20QQuestionIndex, setModal20QQuestionIndex] = useState<number>(0);

  const open20QModal = (modId: OracleModule, mode: 'worksheet' | 'wizard' = 'worksheet', qIdx = 0) => {
    setSelected20QModuleId(modId);
    setModal20QMode(mode);
    setModal20QQuestionIndex(qIdx);
    setIs20QModalOpen(true);
  };

  // Unified AI Scoping Agent & Client Q&A Modals
  const [isScopingAgentModalOpen, setIsScopingAgentModalOpen] = useState<boolean>(false);
  const [scopingAgentInitialMode, setScopingAgentInitialMode] = useState<AgentInputMode>('upload_rfp');
  const [isClientQaModalOpen, setIsClientQaModalOpen] = useState<boolean>(false);

  // SteerCo Baseline Blackout Freeze & Governance Audit Modal (Whiteboard Feature 4)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [unlockReasonInput, setUnlockReasonInput] = useState<string>('');

  const handleToggleBaselineFreeze = () => {
    if (scenario.isBlackoutLocked) {
      setIsUnlockModalOpen(true);
    } else {
      const now = new Date().toISOString();
      const auditEntry = {
        id: `audit_${Date.now()}`,
        timestamp: now,
        user: 'Lead Solution Architect',
        action: 'BASELINE_FREEZE_LOCKED',
        details: 'Spec Sheet baseline locked & approved by Program SteerCo. Scoping questions frozen.',
        isDuringBlackout: true
      };
      onUpdateScenario(prev => ({
        ...prev,
        isBlackoutLocked: true,
        blackoutLockedAt: now,
        blackoutLockedBy: 'Lead Solution Architect',
        auditLog: [...(prev.auditLog || []), auditEntry]
      }));
    }
  };

  const handleConfirmUnlock = () => {
    const reason = unlockReasonInput.trim() || 'SteerCo authorized scoping revision';
    const now = new Date().toISOString();
    const auditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      user: 'Lead Solution Architect',
      action: 'BASELINE_FREEZE_UNLOCKED',
      details: `Spec Sheet baseline unlocked. Reason: ${reason}`,
      isDuringBlackout: false
    };
    onUpdateScenario(prev => ({
      ...prev,
      isBlackoutLocked: false,
      blackoutReason: reason,
      auditLog: [...(prev.auditLog || []), auditEntry]
    }));
    setIsUnlockModalOpen(false);
    setUnlockReasonInput('');
  };

  // Rollout Questionnaire state
  const [rolloutCategoryFilter, setRolloutCategoryFilter] = useState<string>('all');
  const [rolloutViewTab, setRolloutViewTab] = useState<'questionnaire' | 'traceability' | 'architecture'>('questionnaire');

  // Reactive calculated metrics for live feedback
  const projectData = useMemo(() => calculateProjectMetrics(scenario), [scenario]);

  const toggleRowExpanded = (modId: string) => {
    setExpandedQuestionModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const exportScopingSheetCsv = () => {
    const headers = [
      'Pillar',
      'Module ID',
      'Module Name',
      'Scope Status',
      'T-Shirt Size',
      'Typical Hours Range',
      'Base Hours',
      '20-Q Factor',
      'P80 Total Hours',
      'Person Months',
      'Average FTE',
      'Avg 20-Q Score (1-4)',
      'AI Confidence (%)',
      'Client Clarification Needed'
    ];

    const rows = combinedModules.map(mod => {
      const isInScope = scenario.selectedModules.includes(mod.id);
      const estimate = projectData.moduleEstimates?.find(e => e.moduleId === mod.id);
      const currentSize: TShirtSize = scenario.moduleTShirtOverrides?.[mod.id] || estimate?.tShirtSize || 'M';
      const cfg = T_SHIRT_CONFIG[currentSize];
      
      const questions = getModuleQuestionsList(mod.id);
      const qAnswers = scenario.moduleQuestionAnswers?.[mod.id] || Array(questions.length).fill(1);
      const avgScore = questions.length > 0
        ? (qAnswers.slice(0, questions.length).reduce((s, v) => s + (v + 1), 0) / questions.length).toFixed(2)
        : '2.00';

      const modMeta = scenario.questionConfidenceMeta?.[mod.id];
      let avgConf = 75;
      let needsClarification = false;
      if (modMeta) {
        const vals = Object.values(modMeta) as Array<{ percentage?: number; clientClarificationNeeded?: boolean; confidence?: string }>;
        if (vals.length > 0) {
          avgConf = Math.round(vals.reduce((sum, v) => sum + (v.percentage || 70), 0) / vals.length);
          needsClarification = vals.some(v => v.clientClarificationNeeded || v.confidence === 'low');
        }
      }

      return [
        `"${mod.pillar}"`,
        `"${mod.id}"`,
        `"${mod.name.replace(/"/g, '""')}"`,
        isInScope ? 'IN_SCOPE' : 'OUT_OF_SCOPE',
        `"${currentSize}"`,
        `"${cfg.typicalHours}"`,
        estimate?.baseHours || 0,
        estimate?.complexityMultiplier?.toFixed(2) || '1.00',
        isInScope ? (estimate?.finalP80Hours || 0) : 0,
        isInScope ? (estimate?.personMonths || 0) : 0,
        isInScope ? (estimate?.avgFTE || 0) : 0,
        avgScore,
        `${avgConf}%`,
        needsClarification ? 'YES' : 'NO'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Oracle_Scoping_Sheet_${scenario.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Count questions flagged for client Q&A
  const clientClarificationCount = useMemo(() => {
    let count = 0;
    const meta = scenario.questionConfidenceMeta || {};
    Object.values(meta).forEach(modMeta => {
      Object.values(modMeta).forEach(qMeta => {
        if (qMeta.clientClarificationNeeded || qMeta.confidence === 'low') count++;
      });
    });
    return count;
  }, [scenario.questionConfidenceMeta]);

  // Fast 1-click T-Shirt Sizing for any module
  const setModuleTShirtSize = (modId: OracleModule, size: TShirtSize) => {
    const sizeLevelMap: Record<TShirtSize, number> = {
      XS: 0,
      S: 0,
      M: 1,
      L: 2,
      XL: 2,
      XXL: 3
    };
    const levelIdx = sizeLevelMap[size];

    onUpdateScenario(prev => {
      const currentOverrides = prev.moduleTShirtOverrides || {};
      const currentMap = prev.moduleQuestionAnswers || {};
      return {
        ...prev,
        moduleTShirtOverrides: {
          ...currentOverrides,
          [modId]: size
        },
        moduleQuestionAnswers: {
          ...currentMap,
          [modId]: Array(20).fill(levelIdx)
        }
      };
    });
  };

  // Toggle Client Clarification Q&A flag on a specific question
  const toggleQuestionClientFlag = (modId: OracleModule, qIdx: number) => {
    onUpdateScenario(prev => {
      const currentMeta = prev.questionConfidenceMeta || {};
      const modMeta = currentMeta[modId] || {};
      const currentQMeta = modMeta[qIdx] || {
        confidence: 'medium',
        percentage: 70,
        source: 'default_benchmark',
        clientClarificationNeeded: false
      };

      const nextVal = !currentQMeta.clientClarificationNeeded;

      return {
        ...prev,
        questionConfidenceMeta: {
          ...currentMeta,
          [modId]: {
            ...modMeta,
            [qIdx]: {
              ...currentQMeta,
              clientClarificationNeeded: nextVal,
              confidence: nextVal ? 'low' : currentQMeta.confidence
            }
          }
        }
      };
    });
  };

  // Apply quick simple presets to all in-scope modules
  const applyGlobalTShirtPreset = (size: TShirtSize) => {
    const sizeLevelMap: Record<TShirtSize, number> = {
      XS: 0,
      S: 0,
      M: 1,
      L: 2,
      XL: 2,
      XXL: 3
    };
    const levelIdx = sizeLevelMap[size];

    onUpdateScenario(prev => {
      const overrides: Record<string, TShirtSize> = {};
      const answers: Record<string, number[]> = {};

      prev.selectedModules.forEach(modId => {
        overrides[modId] = size;
        answers[modId] = Array(20).fill(levelIdx);
      });

      return {
        ...prev,
        moduleTShirtOverrides: overrides,
        moduleQuestionAnswers: answers
      };
    });
  };

  // Rollout Questionnaire Answer Updater
  const setRolloutQuestionAnswer = (qId: string, optIdx: number) => {
    onUpdateScenario(prev => {
      const current = prev.rolloutQuestionAnswers || {};
      return {
        ...prev,
        rolloutQuestionAnswers: {
          ...current,
          [qId]: optIdx
        }
      };
    });
  };

  // Rollout Batch Preset
  const applyRolloutLevelToAll = (levelIdx: number) => {
    onUpdateScenario(prev => {
      const newAnswers: Record<string, number> = {};
      ENTERPRISE_ROLLOUT_QUESTIONS.forEach(q => {
        newAnswers[q.id] = levelIdx;
      });
      return {
        ...prev,
        rolloutQuestionAnswers: newAnswers
      };
    });
  };

  // Module toggle
  const toggleModule = (modId: OracleModule) => {
    onUpdateScenario(prev => {
      const exists = prev.selectedModules.includes(modId);
      const nextModules = exists
        ? prev.selectedModules.filter(id => id !== modId)
        : [...prev.selectedModules, modId];
      return { ...prev, selectedModules: nextModules };
    });
  };

  const selectAllInPillar = (pillar: string) => {
    if (pillar === 'ALL') {
      const allIds = combinedModules.map(m => m.id);
      onUpdateScenario(prev => ({ ...prev, selectedModules: allIds }));
      return;
    }
    const pillarModIds = combinedModules.filter(m => m.pillar === pillar).map(m => m.id);
    onUpdateScenario(prev => {
      const otherModules = prev.selectedModules.filter(id => {
        const def = combinedModules.find(m => m.id === id);
        return def?.pillar !== pillar;
      });
      return { ...prev, selectedModules: [...otherModules, ...pillarModIds] };
    });
  };

  const clearAllInPillar = (pillar: string) => {
    if (pillar === 'ALL') {
      onUpdateScenario(prev => ({ ...prev, selectedModules: [] }));
      return;
    }
    onUpdateScenario(prev => {
      const nextModules = prev.selectedModules.filter(id => {
        const def = combinedModules.find(m => m.id === id);
        return def?.pillar !== pillar;
      });
      return { ...prev, selectedModules: nextModules };
    });
  };

  // Add new dynamic custom module
  const handleAddCustomModule = (newMod: any, shouldSelect: boolean) => {
    onUpdateScenario(prev => {
      const currentCustom = prev.customModules || [];
      const updatedCustom = [...currentCustom, newMod];
      const nextSelected = shouldSelect && !prev.selectedModules.includes(newMod.id)
        ? [...prev.selectedModules, newMod.id]
        : prev.selectedModules;
      
      const customPillars = prev.customPillars || [];
      const updatedPillars = !customPillars.includes(newMod.pillar) && !['ERP', 'SCM', 'HCM', 'EPM', 'CX'].includes(newMod.pillar)
        ? [...customPillars, newMod.pillar]
        : customPillars;

      return {
        ...prev,
        customModules: updatedCustom,
        selectedModules: nextSelected,
        customPillars: updatedPillars
      };
    });
  };

  // Delete dynamic custom module
  const handleDeleteCustomModule = (modId: string) => {
    onUpdateScenario(prev => {
      const nextCustom = (prev.customModules || []).filter(m => m.id !== modId);
      const nextSelected = prev.selectedModules.filter(id => id !== modId);
      return {
        ...prev,
        customModules: nextCustom,
        selectedModules: nextSelected
      };
    });
  };

  // Add custom question to a module's 20-Q list
  const handleAddCustomQuestion = (modId: string, newQ: ModuleScopingQuestion) => {
    onUpdateScenario(prev => {
      const currentQuestionsMap = prev.customModuleQuestions || {};
      const existingQuestions = currentQuestionsMap[modId] || getQuestionsForModule(modId);
      const updatedQuestions = [...existingQuestions, newQ];

      // Expand answers array if needed
      const currentAnswersMap = prev.moduleQuestionAnswers || {};
      const existingAnswers = currentAnswersMap[modId] || Array(existingQuestions.length).fill(1);
      const updatedAnswers = [...existingAnswers, 1]; // Default to Level 2

      return {
        ...prev,
        customModuleQuestions: {
          ...currentQuestionsMap,
          [modId]: updatedQuestions
        },
        moduleQuestionAnswers: {
          ...currentAnswersMap,
          [modId]: updatedAnswers
        }
      };
    });
  };

  const updateScaleDriver = (key: keyof ScaleDrivers, value: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      scaleDrivers: {
        ...prev.scaleDrivers,
        [key]: Math.max(0, value)
      }
    }));
  };

  // Module question answer
  const setModuleQuestionAnswer = (modId: OracleModule, qIdx: number, optIdx: number) => {
    onUpdateScenario(prev => {
      const currentMap = prev.moduleQuestionAnswers || {};
      const currentAnswers = currentMap[modId] || Array(20).fill(1);
      const nextAnswers = currentAnswers.map((v, i) => (i === qIdx ? optIdx : v));
      return {
        ...prev,
        moduleQuestionAnswers: {
          ...currentMap,
          [modId]: nextAnswers
        }
      };
    });
  };

  // Batch preset for a module's 20 questions
  const applyPresetToModule = (modId: OracleModule, levelIdx: number) => {
    onUpdateScenario(prev => {
      const currentMap = prev.moduleQuestionAnswers || {};
      return {
        ...prev,
        moduleQuestionAnswers: {
          ...currentMap,
          [modId]: Array(20).fill(levelIdx)
        }
      };
    });
  };

  // Start guided interview for a specific module
  const startInterview = (modId: OracleModule, startQIdx = 0) => {
    if (!scenario.selectedModules.includes(modId)) {
      toggleModule(modId);
    }
    setActiveInterviewModuleId(modId);
    setActiveQuestionIndex(startQIdx);
    open20QModal(modId, 'wizard', startQIdx);
  };

  // Program modifiers updater
  const updateModifier = (key: keyof ProjectScenario['clientModifiers'], value: number) => {
    onUpdateScenario(prev => ({
      ...prev,
      clientModifiers: {
        ...prev.clientModifiers,
        [key]: value
      }
    }));
  };

  // Rollout approach updater
  const updateRollout = (approach: RolloutApproach, waves: number) => {
    onUpdateScenario(prev => {
      let defaultDescriptions = prev.waveDescriptions || [];
      if (approach === 'big_bang') {
        defaultDescriptions = ['Single Global Big Bang Cutover'];
      } else if (approach === 'phased_geo') {
        defaultDescriptions = [
          'Wave 1: Corporate HQ & Primary Operations (Pilot)',
          'Wave 2: Regional Operating Entities (EMEA & APAC)',
          'Wave 3: LATAM & Rest of World Subsidiaries'
        ].slice(0, waves);
      } else if (approach === 'phased_functional') {
        defaultDescriptions = [
          'Wave 1: Core Financials & Procurement Cloud',
          'Wave 2: Supply Chain, Manufacturing & WMS',
          'Wave 3: Global HR, Payroll & Workforce Management'
        ].slice(0, waves);
      } else {
        defaultDescriptions = [
          'Wave 1: Global Reference Template & Pilot Plant',
          'Wave 2: Secondary Manufacturing & Logistics Hubs',
          'Wave 3: Commercial & Branch Network Rapid Rollout'
        ].slice(0, waves);
      }

      return {
        ...prev,
        rolloutApproach: approach,
        rolloutWaves: waves,
        waveDescriptions: defaultDescriptions
      };
    });
  };

  // Blackout period management
  const addBlackoutPeriod = () => {
    const newId = 'bo_' + Date.now();
    const newPeriod: BlackoutPeriod = {
      id: newId,
      name: 'New Operational Freeze Window',
      type: 'custom',
      startDate: '2026-11-01',
      endDate: '2026-11-20',
      severity: 'hard_freeze',
      impact: 'Restricted business SME testing & data loads during this operational window.'
    };
    onUpdateScenario(prev => ({
      ...prev,
      blackoutPeriods: [...(prev.blackoutPeriods || []), newPeriod]
    }));
  };

  const removeBlackoutPeriod = (id: string) => {
    onUpdateScenario(prev => ({
      ...prev,
      blackoutPeriods: (prev.blackoutPeriods || []).filter(b => b.id !== id)
    }));
  };

  const updateBlackoutField = (id: string, field: keyof BlackoutPeriod, value: any) => {
    onUpdateScenario(prev => ({
      ...prev,
      blackoutPeriods: (prev.blackoutPeriods || []).map(b => (b.id === id ? { ...b, [field]: value } : b))
    }));
  };

  // Pillar modules
  const pillarModules = ORACLE_MODULE_CATALOG.filter(m => m.pillar === activePillarTab);

  // Calculate net modifier
  const netMod = calculateNetClientModifier(scenario.clientModifiers);

  // Active module interview questions
  const interviewQuestions = useMemo(() => {
    return getQuestionsForModule(activeInterviewModuleId);
  }, [activeInterviewModuleId]);

  const currentQuestion = interviewQuestions[activeQuestionIndex] || interviewQuestions[0];
  const currentModuleAnswers = scenario.moduleQuestionAnswers?.[activeInterviewModuleId] || Array(20).fill(1);
  const currentSelectedOption = currentModuleAnswers[activeQuestionIndex] !== undefined ? currentModuleAnswers[activeQuestionIndex] : 1;

  // Active module def
  const activeModuleDef = ORACLE_MODULE_CATALOG.find(m => m.id === activeInterviewModuleId) || ORACLE_MODULE_CATALOG[0];

  // Category Color Map
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Process Scope': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Integrations & Feeds': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Data & Conversions': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approvals & Workflows': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Reporting & Analytics': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Compliance & Security': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Consolidated Enterprise Scoping Command & KPI Header */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs divide-y divide-slate-200">
        {/* Top Row: Title, Badges & Action Controls */}
        <div className="p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-gradient-to-r from-white via-slate-50/40 to-white">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-1.5 rounded-sm bg-slate-900 text-white shrink-0 shadow-2xs">
                <Target size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Enterprise Scoping & Complexity Architecture
              </span>
              {scenario.isBlackoutLocked && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck size={11} className="text-rose-600" />
                  <span>Locked Baseline</span>
                </span>
              )}
              {scenario.uploadedProposal && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Proposal: {scenario.uploadedProposal.title}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Scope Discovery & Complexity Architecture
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddCustomModuleOpen(true)}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-2xs font-mono"
              title="Add a custom Oracle module or define a new domain / pillar"
            >
              <Plus size={13} className="text-indigo-600" />
              <span>+ Add Custom Module</span>
            </button>

            <button
              type="button"
              onClick={handleToggleBaselineFreeze}
              className={`px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border ${
                scenario.isBlackoutLocked
                  ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
              }`}
              title={scenario.isBlackoutLocked ? 'Click to request SteerCo baseline unlock' : 'Lock questionnaire as SteerCo Approved Baseline'}
            >
              <ShieldCheck size={13} className={scenario.isBlackoutLocked ? 'text-rose-200' : 'text-slate-300'} />
              <span>{scenario.isBlackoutLocked ? '🔒 Baseline Frozen' : 'Freeze Baseline'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScopingAgentInitialMode('upload_rfp');
                setIsScopingAgentModalOpen(true);
              }}
              className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-indigo-700 font-mono"
              title="One-Stop AI Scoping Agent: RFP Document Upload, RFP Memo & Intel Ingestion"
            >
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <span>✨ AI Scoping Agent</span>
            </button>

            <button
              type="button"
              onClick={() => setIsClientQaModalOpen(true)}
              className={`px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border font-mono ${
                clientClarificationCount > 0
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Export client questions for low-confidence areas"
            >
              <FileQuestion size={13} className={clientClarificationCount > 0 ? 'text-amber-600' : 'text-slate-500'} />
              <span>Client Q&A ({clientClarificationCount})</span>
            </button>

            <button
              type="button"
              onClick={exportScopingSheetCsv}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer font-mono"
              title="Export complete Scoping Sheet with T-Shirt sizes and 20-Q scores to CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Live KPI Metrics & T-Shirt Distribution Bar */}
        <div className="p-2.5 sm:px-4 bg-slate-50/80 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-slate-900 text-white shadow-2xs">
              {scenario.selectedModules.length} of {combinedModules.length} In-Scope
            </span>
            <div className="flex items-center gap-2 text-slate-600 flex-wrap">
              <span>
                Net Mod: <strong className={`font-mono font-bold ${netMod > 1.2 ? 'text-amber-700' : 'text-emerald-700'}`}>{netMod.toFixed(2)}x</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                P80 Effort: <strong className="text-slate-900 font-mono font-bold">{(projectData.p80_DefensibleHours || projectData.targetHours || 0).toLocaleString()} hrs</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Staffing: <strong className="text-indigo-700 font-mono font-bold">{(projectData.targetPersonMonths || 0).toFixed(1)} PM ({((projectData.p80_DefensibleHours || projectData.targetHours || 0) / ((projectData.recommendedDurationWeeks || 26) * 40)).toFixed(1)} FTE)</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1">
              {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as TShirtSize[]).map((size) => {
                const cfg = T_SHIRT_CONFIG[size];
                const count = (projectData.moduleEstimates || []).filter(m => m.tShirtSize === size && scenario.selectedModules.includes(m.moduleId)).length;

                return (
                  <div
                    key={size}
                    className={`px-1.5 py-0.5 border text-center transition flex items-center gap-1 ${
                      count > 0 ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60'
                    }`}
                    title={`${size} (${cfg.typicalHours}): ${count} modules`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.colorClass.split(' ')[0]}`} />
                    <span className="font-bold text-[10px] font-mono">{size}</span>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">({count})</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">All:</span>
              {(['S', 'M', 'L', 'XL'] as TShirtSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => applyGlobalTShirtPreset(sz)}
                  className="px-1.5 py-0.5 text-[10px] font-bold font-mono bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer shadow-2xs"
                  title={`Apply ${sz} to all in-scope modules`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Client Blueprint Auto-Fill Drawer (1-Click RFP & Context Ingestion) */}
      <SmartBlueprintAutoFillDrawer
        scenario={scenario}
        onUpdateScenario={onUpdateScenario}
        onOpenComplexityStudio={onOpenComplexityStudio}
      />

      {/* SteerCo Baseline Freeze Notice Banner */}
      {scenario.isBlackoutLocked && (
        <div className="bg-rose-950 border border-rose-600 text-white p-3.5 px-4 rounded-none shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-rose-800 text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                  🔒 SteerCo Approved Baseline Active (Locked)
                </span>
                <span className="text-[10px] text-rose-200 font-mono">
                  Frozen {scenario.blackoutLockedAt ? new Date(scenario.blackoutLockedAt).toLocaleDateString() : 'Active'} by {scenario.blackoutLockedBy || 'SteerCo'}
                </span>
              </div>
              <p className="text-[11px] text-rose-100 mt-0.5">
                Module footprint, 20-question functional answers, and delivery modifiers are locked in read-only governance mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUnlockModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
          >
            Request SteerCo Unlock
          </button>
        </div>
      )}

      {/* In-Page Sub-Section Navigation Bar */}
      <div className="bg-white border border-slate-200 p-1.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            {
              id: 'modules' as const,
              num: '1',
              label: 'Modules & 20-Q Scope',
              icon: Target,
              badge: `${scenario.selectedModules.length} Modules`
            },
            {
              id: 'technical' as const,
              num: '2',
              label: 'Technical Estimation & RICEFW',
              icon: Cpu,
              badge: `${scenario.scaleDrivers.tech_oic ?? (scenario.technicalIntegrations || DEFAULT_TECHNICAL_INTEGRATIONS).length} Integrations`
            },
            {
              id: 'testing' as const,
              num: '3',
              label: 'Business Testing (SIT & UAT)',
              icon: ListChecks,
              badge: `${scenario.scaleDrivers.test_sit_cycles || 2} SIT / ${scenario.scaleDrivers.test_uat_cycles || 1} UAT`
            },
            {
              id: 'modifiers' as const,
              num: '4',
              label: 'Program Modifiers (7 Risks)',
              icon: Sliders,
              badge: `${netMod.toFixed(2)}x`
            },
            {
              id: 'rollout' as const,
              num: '5',
              label: 'Rollout & Waves',
              icon: Workflow,
              badge: `${scenario.rolloutWaves || 3} Waves`
            },
            {
              id: 'blackout' as const,
              num: '6',
              label: 'Freeze Windows',
              icon: Calendar,
              badge: `${(scenario.blackoutPeriods || []).length} Windows`
            },
            {
              id: 'topology' as const,
              num: '7',
              label: 'Scale Drivers & Topology',
              icon: Building2,
              badge: `${scenario.scaleDrivers.fin_ent} Ent / ${scenario.scaleDrivers.tech_oic} OIC`
            },
            {
              id: 'traceability' as const,
              num: '8',
              label: 'Traceability & Math',
              icon: Compass,
              badge: 'Audit'
            }
          ].map((item) => {
            const isSelected = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.num}
                  </span>
                  <Icon size={14} className={isSelected ? 'text-blue-300' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none font-bold ${
                  isSelected ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Module Footprint & Granular 20-Question Scoping */}
      {activeSection === 'modules' && (
        <div className="space-y-3">
          {/* TABULAR SCOPING SHEET (Clean, High-Density Professional Table) */}
          <div className="space-y-3 animate-in fade-in duration-150">

              {/* Table Filter Controls & Pillar Selector */}
              <div className="bg-white border border-slate-200 p-2.5 space-y-2.5 shadow-2xs">
                {/* Pillar Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Pillar:</span>
                    {availablePillars.map((p) => {
                      const pMods = p === 'ALL' ? combinedModules : combinedModules.filter(m => m.pillar === p);
                      const inScopeCount = pMods.filter(m => scenario.selectedModules.includes(m.id)).length;

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setActivePillarTab(p)}
                          className={`px-2.5 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                            activePillarTab === p
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{p === 'ALL' ? 'All Pillars' : p}</span>
                          <span className={`text-[10px] font-mono px-1 py-0.2 ${activePillarTab === p ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-600 border border-slate-200'}`}>
                            {inScopeCount}/{pMods.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectAllInPillar(activePillarTab)}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
                    >
                      Select All {activePillarTab === 'ALL' ? 'Modules' : activePillarTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => clearAllInPillar(activePillarTab)}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-300 transition cursor-pointer"
                    >
                      Clear {activePillarTab === 'ALL' ? 'All' : activePillarTab}
                    </button>
                  </div>
                </div>

                {/* Search & Scope Status Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1 max-w-md">
                    <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search module name, key code, or description..."
                      value={scopingSearchQuery}
                      onChange={(e) => setScopingSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
                    />
                    {scopingSearchQuery && (
                      <button
                        onClick={() => setScopingSearchQuery('')}
                        className="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {/* Scope filter tabs */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>
                    <button
                      type="button"
                      onClick={() => setScopingScopeFilter('all')}
                      className={`px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer border ${
                        scopingScopeFilter === 'all'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopingScopeFilter('in_scope')}
                      className={`px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer border ${
                        scopingScopeFilter === 'in_scope'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      In-Scope Only ({scenario.selectedModules.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopingScopeFilter('out_of_scope')}
                      className={`px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer border ${
                        scopingScopeFilter === 'out_of_scope'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Out-of-Scope ({ORACLE_MODULE_CATALOG.length - scenario.selectedModules.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* TABULAR SCOPING SHEET TABLE                                   */}
              {/* ============================================================= */}
              <div className="border border-slate-200 bg-white overflow-x-auto shadow-xs custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[740px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                      <th className="p-2 w-8 text-center border-r border-slate-800">
                        <span className="sr-only">In Scope</span>
                        #
                      </th>
                      <th className="p-2 w-16 text-center border-r border-slate-800">Pillar</th>
                      <th className="p-2 min-w-[180px] border-r border-slate-800">Module Scope & Name</th>
                      <th className="p-2 w-28 text-center border-r border-slate-800">
                        T-Shirt
                      </th>
                      <th className="p-2 w-28 text-right border-r border-slate-800">Effort</th>
                      <th className="p-2 w-24 text-center border-r border-slate-800">Confidence</th>
                      <th className="p-2 w-28 text-center">20-Q Scoping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {(() => {
                      const filteredMods = combinedModules.filter(mod => {
                        if (activePillarTab !== 'ALL' && mod.pillar !== activePillarTab) return false;
                        const isInScope = scenario.selectedModules.includes(mod.id);
                        if (scopingScopeFilter === 'in_scope' && !isInScope) return false;
                        if (scopingScopeFilter === 'out_of_scope' && isInScope) return false;
                        if (scopingSearchQuery.trim()) {
                          const q = scopingSearchQuery.toLowerCase();
                          const matchName = mod.name.toLowerCase().includes(q);
                          const matchId = mod.id.toLowerCase().includes(q);
                          const matchDesc = mod.description.toLowerCase().includes(q);
                          const matchPillar = mod.pillar.toLowerCase().includes(q);
                          if (!matchName && !matchId && !matchDesc && !matchPillar) return false;
                        }
                        return true;
                      });

                      if (filteredMods.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              <p className="font-bold text-sm text-slate-700">No modules match your current filter.</p>
                              <p className="text-xs text-slate-400 mt-1">Try changing the pillar tab or clearing search keywords.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filteredMods.map((mod, rowIdx) => {
                        const isInScope = scenario.selectedModules.includes(mod.id);
                        const isCustomModule = !!(scenario.customModules || []).find(m => m.id === mod.id);
                        const estimate = projectData.moduleEstimates?.find(e => e.moduleId === mod.id);
                        const currentSize: TShirtSize = scenario.moduleTShirtOverrides?.[mod.id] || estimate?.tShirtSize || 'M';
                        const cfg = T_SHIRT_CONFIG[currentSize];
                        const isExpanded = !!expandedQuestionModules[mod.id];
                        const questions = getModuleQuestionsList(mod.id);
                        const currentAnswers = scenario.moduleQuestionAnswers?.[mod.id] || Array(questions.length).fill(1);
                        const avgScore = questions.length > 0 
                          ? currentAnswers.slice(0, questions.length).reduce((s, v) => s + (v + 1), 0) / questions.length 
                          : 2.0;

                        // Inferred confidence metadata
                        const modConfidenceMeta = scenario.questionConfidenceMeta?.[mod.id];
                        let avgConfidence = 75;
                        let hasLowConfidence = false;
                        let citationSnippet = '';

                        if (modConfidenceMeta) {
                          const vals = Object.values(modConfidenceMeta) as Array<{
                            confidence?: string;
                            percentage?: number;
                            source?: string;
                            clientClarificationNeeded?: boolean;
                            proposalCitation?: string;
                          }>;
                          if (vals.length > 0) {
                            const totalPct = vals.reduce((sum, v) => sum + (v.percentage || 70), 0);
                            avgConfidence = Math.round(totalPct / vals.length);
                            hasLowConfidence = vals.some(v => v.confidence === 'low' || v.clientClarificationNeeded);
                            const withCitation = vals.find(v => v.proposalCitation);
                            if (withCitation?.proposalCitation) {
                              citationSnippet = withCitation.proposalCitation;
                            }
                          }
                        }

                        // Pillar color classes
                        const pillarColors: Record<string, string> = {
                          ERP: 'bg-blue-50 text-blue-700 border-blue-200',
                          SCM: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          HCM: 'bg-purple-50 text-purple-700 border-purple-200',
                          EPM: 'bg-amber-50 text-amber-800 border-amber-200',
                          CX: 'bg-rose-50 text-rose-700 border-rose-200'
                        };

                        return (
                          <React.Fragment key={mod.id}>
                            <tr
                              className={`transition-colors ${
                                isInScope
                                  ? isExpanded
                                    ? 'bg-slate-50'
                                    : rowIdx % 2 === 0
                                    ? 'bg-white hover:bg-slate-50/80'
                                    : 'bg-slate-50/40 hover:bg-slate-50'
                                  : 'bg-slate-100/50 text-slate-400 opacity-60 hover:opacity-100'
                              }`}
                            >
                              {/* Checkbox Column */}
                              <td className="p-2 text-center border-r border-slate-100">
                                <input
                                  type="checkbox"
                                  checked={isInScope}
                                  onChange={() => toggleModule(mod.id)}
                                  className="w-3.5 h-3.5 rounded-none border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                  title={isInScope ? 'Click to deselect from scope' : 'Click to add to scope'}
                                />
                              </td>

                              {/* Pillar & Code Column - Compact */}
                              <td className="p-2 border-r border-slate-100 font-mono text-center">
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border rounded-none text-center ${pillarColors[mod.pillar] || 'bg-slate-100 text-slate-700'}`}>
                                    {mod.pillar}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {mod.id}
                                  </span>
                                </div>
                              </td>

                              {/* Module Name & Scope Description */}
                              <td className="p-2 border-r border-slate-100">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => toggleModule(mod.id)}
                                      className="font-bold text-slate-900 hover:text-indigo-600 text-left text-xs transition cursor-pointer"
                                    >
                                      {mod.name}
                                    </button>
                                    {isCustomModule && (
                                      <span className="text-[8px] font-mono px-1 py-0.2 bg-indigo-100 text-indigo-700 font-bold uppercase border border-indigo-200">
                                        Custom
                                      </span>
                                    )}
                                    {!isInScope && (
                                      <span className="text-[8px] font-mono px-1 py-0.2 bg-slate-200 text-slate-600 uppercase">
                                        Out
                                      </span>
                                    )}
                                    {isCustomModule && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Remove custom module "${mod.name}"?`)) {
                                            handleDeleteCustomModule(mod.id);
                                          }
                                        }}
                                        className="text-slate-400 hover:text-rose-600 text-[9px] underline ml-auto transition cursor-pointer"
                                        title="Delete custom module"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                                    {mod.description}
                                  </p>
                                  {isInScope && citationSnippet && (
                                    <div className="text-[9px] text-indigo-700 font-serif italic mt-0.5 line-clamp-1">
                                      &ldquo;{citationSnippet}&rdquo;
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Interactive T-Shirt Size Dropdown Selector */}
                              <td className="p-2 border-r border-slate-100 text-center">
                                {isInScope ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <TShirtSelect
                                      value={currentSize}
                                      onChange={(size) => setModuleTShirtSize(mod.id, size)}
                                    />
                                    {estimate?.isDownsized && estimate.calculatedTShirtSize && (
                                      <span
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-2xs bg-amber-500/15 text-amber-900 border border-amber-500/40 text-[9px] font-bold font-mono tracking-tight"
                                        title={`Override Risk Flag: Manually downsized from benchmark/calculated ${estimate.calculatedTShirtSize} to ${currentSize} (-${(estimate.downsizedDeltaHours || 0).toLocaleString()} base hrs)`}
                                      >
                                        <AlertTriangle size={9} className="text-amber-700 shrink-0 stroke-[2.5]" />
                                        <span>Downsized from {estimate.calculatedTShirtSize}</span>
                                        {estimate.downsizedDeltaHours ? (
                                          <span className="text-amber-800 font-normal">(-{estimate.downsizedDeltaHours}h)</span>
                                        ) : null}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs italic font-mono">—</span>
                                )}
                              </td>

                              {/* Defensible Effort (P80 Hours & Staffing) */}
                              <td className="p-2 border-r border-slate-100 text-right font-mono">
                                {isInScope && estimate ? (
                                  <div>
                                    {onOpenTraceMath ? (
                                      <button
                                        type="button"
                                        onClick={() => onOpenTraceMath(mod.id)}
                                        className="text-xs font-bold text-slate-900 hover:text-amber-700 underline decoration-dotted decoration-slate-300 hover:decoration-amber-500 underline-offset-2 transition cursor-pointer"
                                        title={`Trace calculation math for ${mod.name}`}
                                      >
                                        {(estimate?.finalP80Hours || 0).toLocaleString()} <span className="text-[9px] font-normal text-slate-500">hrs</span>
                                      </button>
                                    ) : (
                                      <div className="text-xs font-bold text-slate-900">
                                        {(estimate?.finalP80Hours || 0).toLocaleString()} <span className="text-[9px] font-normal text-slate-500">hrs</span>
                                      </div>
                                    )}
                                    <div className="text-[9px] text-slate-500 font-sans leading-none mt-0.5">
                                      {estimate.personMonths} PM &bull; {estimate.avgFTE} FTE
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs font-mono">—</span>
                                )}
                              </td>

                              {/* AI Confidence / Q&A Badge */}
                              <td className="p-2 border-r border-slate-100 text-center">
                                {isInScope ? (
                                  <div className="space-y-0.5 flex flex-col items-center">
                                    <span
                                      className={`px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider border rounded-none flex items-center gap-0.5 ${
                                        hasLowConfidence
                                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                                          : avgConfidence >= 80
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-amber-50 text-amber-800 border-amber-200'
                                      }`}
                                    >
                                      {hasLowConfidence && <AlertTriangle size={9} />}
                                      <span>{avgConfidence}% {hasLowConfidence ? 'Flag' : 'Conf'}</span>
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => toggleQuestionClientFlag(mod.id, 0)}
                                      className={`text-[8px] font-bold uppercase tracking-wider transition cursor-pointer px-1 py-0.2 border ${
                                        hasLowConfidence
                                          ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                      }`}
                                      title="Toggle flag for client scoping clarification questionnaire"
                                    >
                                      {hasLowConfidence ? 'Client Q&A' : '+ Flag Q&A'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>

                              {/* 20-Q Scoping Toggle & Score */}
                              <td className="p-2 text-center">
                                {isInScope ? (
                                  <div className="space-y-0.5 flex flex-col items-center">
                                    <div className="text-[9px] font-mono font-bold text-slate-700 leading-none">
                                      Score: <span className="text-indigo-600 font-bold">{avgScore.toFixed(1)}</span>/4.0
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleRowExpanded(mod.id)}
                                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer border ${
                                        isExpanded
                                          ? 'bg-indigo-600 text-white border-indigo-700'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                      }`}
                                      title="Expand or collapse granular 20-question questionnaire for this module"
                                    >
                                      <span>{isExpanded ? 'Close' : '20-Q Sheet'}</span>
                                      {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleModule(mod.id)}
                                    className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
                                  >
                                    + Add
                                  </button>
                                )}
                              </td>
                            </tr>

                            {/* ========================================================================= */}
                            {/* EXPANDED INLINE 20-QUESTION SCOPING SUB-TABLE                             */}
                            {/* ========================================================================= */}
                            {isInScope && isExpanded && (
                              <tr className="bg-slate-50/90 border-b-2 border-indigo-500">
                                <td colSpan={7} className="p-3 sm:p-4">
                                  <div className="bg-white border border-slate-200 rounded-none p-4 shadow-sm space-y-3">
                                    {/* 20-Q Header Toolbar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 font-mono">
                                            20-Question Scoping Worksheet:
                                          </span>
                                          <strong className="text-sm font-bold text-slate-900">{mod.name}</strong>
                                          <span className="text-xs px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono font-bold">
                                            Avg Score: {avgScore.toFixed(2)}/4.0
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                          Tune specific scope complexity levels below. Average score updates T-shirt size and defensible hours immediately.
                                        </p>
                                      </div>

                                      {/* Presets and Modal Openers for this module */}
                                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Quick Set:</span>
                                        <button
                                          type="button"
                                          onClick={() => applyPresetToModule(mod.id, 0)}
                                          className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                                        >
                                          All MBP (C1)
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => applyPresetToModule(mod.id, 1)}
                                          className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                                        >
                                          All Standard (C2)
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => applyPresetToModule(mod.id, 2)}
                                          className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                                        >
                                          All Complex (C3)
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAddQuestionTargetModule({ id: mod.id, name: mod.name });
                                          }}
                                          className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 cursor-pointer font-mono"
                                          title="Add a custom scoping question to this module"
                                        >
                                          <Plus size={10} />
                                          <span>+ Add Question</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => open20QModal(mod.id, 'wizard', 0)}
                                          className="px-2.5 py-1 text-[10px] font-bold uppercase bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 cursor-pointer font-mono"
                                          title="Open step-by-step interview wizard modal"
                                        >
                                          <Play size={10} />
                                          <span>Step Wizard</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => open20QModal(mod.id, 'worksheet', 0)}
                                          className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 flex items-center gap-1 cursor-pointer font-mono shadow-2xs"
                                          title="Open dedicated Fullscreen 20-Question Matrix modal"
                                        >
                                          <Layers size={10} />
                                          <span>Fullscreen 20-Q</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* 20 Question Table Grid with robust horizontal scroll and fully visible questions & options */}
                                    <div className="overflow-x-auto border border-slate-200 pb-2">
                                      <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                                        <thead>
                                          <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                                            <th className="p-2.5 w-12 text-center border-r border-slate-200">#</th>
                                            <th className="p-2.5 w-36 border-r border-slate-200">Category</th>
                                            <th className="p-2.5 min-w-[300px] border-r border-slate-200">Scoping Question & Architectural Rationale</th>
                                            <th className="p-2.5 min-w-[500px] text-center border-r border-slate-200">
                                              Complexity Option (1-Click Selection)
                                            </th>
                                            <th className="p-2.5 w-24 text-center">Q&A Flag</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                          {questions.map((q, qIdx) => {
                                            const currentOpt = currentAnswers[qIdx] !== undefined ? currentAnswers[qIdx] : 1;
                                            const qMeta = scenario.questionConfidenceMeta?.[mod.id]?.[qIdx];
                                            const isClarificationNeeded = qMeta?.clientClarificationNeeded;

                                            return (
                                              <tr key={qIdx} className={`hover:bg-slate-50/80 transition-colors ${qIdx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                                                <td className="p-2.5 text-center font-mono font-bold text-slate-500 border-r border-slate-100 align-top">
                                                  Q{qIdx + 1}
                                                </td>
                                                <td className="p-2.5 border-r border-slate-100 font-mono align-top">
                                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 block text-center">
                                                    {q.category}
                                                  </span>
                                                </td>
                                                <td className="p-2.5 border-r border-slate-100 align-top">
                                                  <div className="space-y-1">
                                                    <p className="font-bold text-slate-900 text-xs leading-snug">
                                                      {q.question}
                                                    </p>
                                                    {q.rationale && (
                                                      <p className="text-[11px] text-slate-500 leading-tight">
                                                        <span className="font-semibold text-slate-600">Rationale:</span> {q.rationale}
                                                      </p>
                                                    )}
                                                    {qMeta?.proposalCitation && (
                                                      <div className="text-[10px] text-indigo-700 font-serif italic bg-indigo-50/70 p-1.5 border-l-2 border-indigo-500 mt-1">
                                                        Proposal Reference: &ldquo;{qMeta.proposalCitation}&rdquo;
                                                      </div>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="p-2.5 border-r border-slate-100 align-top">
                                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                                    {q.options.map((opt, optIdx) => {
                                                      const isSelected = currentOpt === optIdx;
                                                      return (
                                                        <button
                                                          key={optIdx}
                                                          type="button"
                                                          onClick={() => setModuleQuestionAnswer(mod.id, qIdx, optIdx)}
                                                          className={`p-2 text-left rounded-none text-[10px] transition cursor-pointer border flex flex-col justify-between ${
                                                            isSelected
                                                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                                          }`}
                                                        >
                                                          <div>
                                                            <div className="flex items-center justify-between w-full pb-1 mb-1 border-b border-slate-200/40">
                                                              <span className="font-mono font-bold">C{opt.score}</span>
                                                              <span className={`text-[9px] font-bold font-mono ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                                                                {opt.score === 1 ? 'MBP' : opt.score === 2 ? 'Std' : opt.score === 3 ? 'Comp' : 'Cust'}
                                                              </span>
                                                            </div>
                                                            <div className={`font-bold text-[10px] leading-tight mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                              {opt.label}
                                                            </div>
                                                            <p className={`text-[9.5px] leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                                              {opt.desc}
                                                            </p>
                                                          </div>
                                                          {opt.hoursImpact !== undefined && (
                                                            <div className={`text-[9px] font-mono mt-1.5 pt-1 border-t border-slate-200/20 text-right ${isSelected ? 'text-emerald-300' : 'text-emerald-700 font-semibold'}`}>
                                                              +{opt.hoursImpact}h
                                                            </div>
                                                          )}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </td>
                                                <td className="p-2.5 text-center align-top">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleQuestionClientFlag(mod.id, qIdx)}
                                                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition cursor-pointer border ${
                                                      isClarificationNeeded
                                                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                                    }`}
                                                    title="Flag this specific question for export in the Client Q&A sheet"
                                                  >
                                                    {isClarificationNeeded ? 'Flagged' : '+ Flag'}
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </tbody>
                  {/* Table Footer Totals */}
                  <tfoot>
                    <tr className="bg-slate-900 text-white text-xs font-mono font-bold">
                      <td colSpan={3} className="p-3 text-left">
                        Total In-Scope: {scenario.selectedModules.length} Modules
                      </td>
                      <td className="p-3 text-center text-slate-300 text-[11px]">
                        Overall Staffing: {(projectData.targetPersonMonths || 0).toFixed(1)} PM
                      </td>
                      <td className="p-3 text-right text-amber-300 text-sm">
                        {(projectData.p80_DefensibleHours || projectData.targetHours || 0).toLocaleString()} hrs
                      </td>
                      <td colSpan={2} className="p-3 text-center text-slate-300 text-[11px]">
                        {clientClarificationCount} Clarification Items
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
      )}

      {/* SECTION 2: Technical Objects & S/M/C Matrix */}
      {activeSection === 'technical' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <TechnicalInventoryManager
            scenario={scenario}
            onUpdateScenario={onUpdateScenario}
            data={projectData}
          />
        </div>
      )}

      {/* SECTION 3: Business Testing 1 (SIT) & Business Testing 2 (UAT) Quality Assurance */}
      {activeSection === 'testing' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <TestingAssuranceView
            scenario={scenario}
            data={projectData}
            onUpdateScenario={onUpdateScenario}
            onOpenTraceMath={onOpenTraceMath}
          />
        </div>
      )}

      {/* SECTION 4: Minimum 5+ Modifier Type Questions */}
      {activeSection === 'modifiers' && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                4. Program Delivery Modifiers & Strategic Risk Multipliers (7 Core Dimensions)
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Organizational, architectural, and governance multipliers that compound overall delivery hours and contingency reserves.
              </p>
            </div>
            <div className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Compounded Multiplier</span>
              <span className={`text-base font-mono font-bold ${netMod > 1.2 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {netMod.toFixed(2)}x
              </span>
            </div>
          </div>

          {/* Tabular Delivery Modifiers Matrix */}
          <div className="overflow-x-auto border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                  <th className="p-2.5 w-10 text-center border-r border-slate-200">#</th>
                  <th className="p-2.5 w-36 border-r border-slate-200">Category</th>
                  <th className="p-2.5 min-w-[260px] border-r border-slate-200">Modifier Dimension & Scope Risk</th>
                  <th className="p-2.5 min-w-[280px] border-r border-slate-200">Delivery Modifier Option (Dropdown Selection)</th>
                  <th className="p-2.5 w-24 text-center border-r border-slate-200">Multiplier</th>
                  <th className="p-2.5 w-28 text-center">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {CLIENT_FRICTION_FACTORS_DEF.map((modItem, modIdx) => {
                  const val = scenario.clientModifiers[modItem.id] ?? 1.0;
                  const isHighRisk = val > 1.20;
                  const isModerateRisk = val > 1.00 && val <= 1.20;
                  const selectedOption = modItem.options.find(opt => Math.abs(val - opt.value) < 0.01) || modItem.options[1];

                  return (
                    <tr key={modItem.id} className={`hover:bg-slate-50/80 transition-colors ${modIdx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-500 border-r border-slate-100">
                        M{modItem.num}
                      </td>
                      <td className="p-2.5 border-r border-slate-100 font-mono">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {modItem.category}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-100">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-xs leading-snug">
                            {modItem.title}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            {modItem.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-100">
                        <div className="space-y-1.5">
                          <select
                            value={val}
                            onChange={(e) => updateModifier(modItem.id, parseFloat(e.target.value))}
                            className="w-full text-xs font-mono font-bold p-1.5 border border-slate-300 bg-white rounded-none text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none cursor-pointer"
                          >
                            {modItem.options.map((opt, optIdx) => (
                              <option key={optIdx} value={opt.value}>
                                {opt.value.toFixed(2)}x — {opt.label}
                              </option>
                            ))}
                          </select>
                          {selectedOption && (
                            <p className="text-[11px] text-slate-600 italic leading-snug bg-slate-50 p-1.5 border border-slate-200">
                              {selectedOption.desc}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center">
                        <span className={`px-2 py-1 text-xs font-mono font-bold border inline-block ${
                          isHighRisk
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isModerateRisk
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {val.toFixed(2)}x
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          isHighRisk
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isModerateRisk
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isHighRisk ? 'High Risk' : isModerateRisk ? 'Moderate' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white text-xs font-mono font-bold">
                  <td colSpan={3} className="p-3 text-left">
                    7 Core Organizational & Architecture Delivery Modifiers
                  </td>
                  <td className="p-3 text-center text-slate-300 text-[11px]">
                    Compound Delivery Multiplier
                  </td>
                  <td className="p-3 text-center text-amber-300 text-sm">
                    {netMod.toFixed(2)}x
                  </td>
                  <td className="p-3 text-center text-slate-300 text-[11px]">
                    {netMod > 1.25 ? 'High Contingency' : netMod > 1.05 ? 'Moderate' : 'Lean Delivery'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Rollout Strategy & Enterprise Questionnaire */}
      {activeSection === 'rollout' && (
        <div className="space-y-6">
          {/* Rollout HUD Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-sm shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-none bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Enterprise Wave Architecture
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  12 Scoping Dimensions Driving Complexity & Schedule Impact
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Rollout Complexity Questionnaire & Multi-Wave Schedule Engine
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Configure regional localization, legacy coexistence bridging, cutover concurrency, and wave execution strategy. 
                Answers dynamically modulate schedule duration, base CEMLI hours, and delivery multipliers.
              </p>
            </div>

            {/* Metric Scorecard Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700/80 min-w-[125px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Rollout Friction
                </span>
                <div className={`text-xl font-mono font-bold mt-0.5 ${
                  projectData.rolloutComplexityScore > 65
                    ? 'text-rose-400'
                    : projectData.rolloutComplexityScore > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {projectData.rolloutComplexityScore}%
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {projectData.rolloutAvgScore} / 4.0 Avg Score
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700/80 min-w-[125px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Schedule Variance
                </span>
                <div className={`text-xl font-mono font-bold mt-0.5 ${
                  projectData.rolloutScheduleImpactWeeks > 0
                    ? 'text-amber-400'
                    : projectData.rolloutScheduleImpactWeeks < 0
                    ? 'text-emerald-400'
                    : 'text-slate-200'
                }`}>
                  {projectData.rolloutScheduleImpactWeeks > 0 ? `+${projectData.rolloutScheduleImpactWeeks.toFixed(1)}` : projectData.rolloutScheduleImpactWeeks.toFixed(1)} <span className="text-xs font-normal">wks</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Net Duration Delta
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700/80 min-w-[125px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Scoping Effort
                </span>
                <div className="text-xl font-mono font-bold text-blue-400 mt-0.5">
                  +{(projectData?.rolloutScopingHours || 0).toLocaleString()} <span className="text-xs font-normal">hrs</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Factory & Bridges
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-800/90 border border-slate-700/80 min-w-[125px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Rollout Multiplier
                </span>
                <div className="text-xl font-mono font-bold text-purple-300 mt-0.5">
                  {projectData.rolloutMultiplier.toFixed(2)}x
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {scenario.rolloutWaves || 1} Configured Wave{scenario.rolloutWaves > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-View Mode Selector & Action Bar */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-sm border border-slate-200 overflow-x-auto">
              {[
                { id: 'questionnaire', label: '12-Question Strategy Questionnaire', icon: CheckSquare },
                { id: 'architecture', label: 'Deployment Waves & Release Sequence', icon: Workflow },
                { id: 'traceability', label: 'Rollout Schedule & Hours Lineage Table', icon: FileCheck2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = rolloutViewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRolloutViewTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {rolloutViewTab === 'questionnaire' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Batch Presets:
                </span>
                {[
                  { level: 0, label: 'C1 Vanilla', tag: 'Minimal Friction' },
                  { level: 1, label: 'C2 Standard', tag: 'Standard Multi-Site' },
                  { level: 2, label: 'C3 Global', tag: 'Complex Multi-Country' },
                  { level: 3, label: 'C4 Extreme', tag: 'High Debt Friction' }
                ].map((preset) => (
                  <button
                    key={preset.level}
                    type="button"
                    onClick={() => applyRolloutLevelToAll(preset.level)}
                    className="px-2.5 py-1 rounded-sm text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                    title={preset.tag}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW TAB 1: 12-Question Strategy Questionnaire (Tabular Format) */}
          {rolloutViewTab === 'questionnaire' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setRolloutCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                    rolloutCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  All Dimensions (12)
                </button>
                {ROLLOUT_QUESTION_CATEGORIES.map((cat) => {
                  const isSelected = rolloutCategoryFilter === cat;
                  const count = ENTERPRISE_ROLLOUT_QUESTIONS.filter(q => q.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setRolloutCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* 12-Question Strategy Table Grid */}
              <div className="overflow-x-auto border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono border-b border-slate-200">
                      <th className="p-2.5 w-12 text-center border-r border-slate-200">ID</th>
                      <th className="p-2.5 w-36 border-r border-slate-200">Category</th>
                      <th className="p-2.5 min-w-[260px] border-r border-slate-200">Rollout Dimension & Strategy Details</th>
                      <th className="p-2.5 min-w-[440px] border-r border-slate-200 text-center">
                        Complexity Tier Options (1-Click Selection)
                      </th>
                      <th className="p-2.5 w-24 text-center border-r border-slate-200">Selected Score</th>
                      <th className="p-2.5 w-28 text-center">Schedule Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {ENTERPRISE_ROLLOUT_QUESTIONS
                      .filter(q => rolloutCategoryFilter === 'all' || q.category === rolloutCategoryFilter)
                      .map((q, qIdx) => {
                        const currentAnswers = scenario.rolloutQuestionAnswers || {};
                        const defaultIdx = scenario.rolloutApproach === 'big_bang' ? 0 : 1;
                        const selectedIdx = currentAnswers[q.id] !== undefined ? currentAnswers[q.id] : defaultIdx;
                        const activeOption = q.options[selectedIdx] || q.options[0];

                        return (
                          <tr key={q.id} className={`hover:bg-slate-50/80 transition-colors ${qIdx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-500 border-r border-slate-100">
                              {q.id}
                            </td>
                            <td className="p-2.5 border-r border-slate-100 font-mono">
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                {q.category}
                              </span>
                            </td>
                            <td className="p-2.5 border-r border-slate-100">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 text-xs leading-snug">
                                  {q.title}
                                </p>
                                <p className="text-[11px] text-slate-500 leading-normal">
                                  {q.description}
                                </p>
                              </div>
                            </td>
                            <td className="p-2.5 border-r border-slate-100">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = selectedIdx === optIdx;
                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      onClick={() => setRolloutQuestionAnswer(q.id, optIdx)}
                                      className={`p-1.5 text-left rounded-none text-[10px] transition cursor-pointer border flex flex-col justify-between ${
                                        isSelected
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                      title={opt.rationale}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-mono font-bold">C{opt.score}</span>
                                        <span className={`text-[9px] font-mono ${
                                          isSelected ? 'text-amber-300' : 'text-slate-400'
                                        }`}>
                                          {opt.scheduleWeeks > 0 ? `+${opt.scheduleWeeks}w` : opt.scheduleWeeks < 0 ? `${opt.scheduleWeeks}w` : '0w'}
                                        </span>
                                      </div>
                                      <span className="line-clamp-1 text-[10px] mt-0.5">
                                        {opt.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-2.5 border-r border-slate-100 text-center font-mono">
                              <span className={`px-2 py-1 text-xs font-bold border inline-block ${
                                activeOption.score >= 3
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : activeOption.score === 2
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {activeOption.score} / 4
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-mono">
                              <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                                activeOption.scheduleWeeks > 0
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : activeOption.scheduleWeeks < 0
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {activeOption.scheduleWeeks > 0 ? `+${activeOption.scheduleWeeks} wks` : activeOption.scheduleWeeks < 0 ? `${activeOption.scheduleWeeks} wks` : '0 wks'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white text-xs font-mono font-bold">
                      <td colSpan={3} className="p-3 text-left">
                        Total Enterprise Rollout Dimensions: {ENTERPRISE_ROLLOUT_QUESTIONS.length}
                      </td>
                      <td className="p-3 text-center text-slate-300 text-[11px]">
                        Average Rollout Complexity: {projectData.rolloutAvgScore} / 4.0 ({projectData.rolloutComplexityScore}%)
                      </td>
                      <td className="p-3 text-center text-amber-300 text-sm">
                        {projectData.rolloutAvgScore.toFixed(2)}
                      </td>
                      <td className="p-3 text-center text-amber-300 text-sm">
                        {projectData.rolloutScheduleImpactWeeks > 0 ? `+${projectData.rolloutScheduleImpactWeeks.toFixed(1)} wks` : `${projectData.rolloutScheduleImpactWeeks.toFixed(1)} wks`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: Deployment Waves & Release Sequence */}
          {rolloutViewTab === 'architecture' && (
            <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Enterprise Deployment Architecture Archetypes
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Select deployment architecture and configure release waves, pilot sites, and regional sequence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    id: 'big_bang',
                    label: 'Big Bang Single Cutover',
                    desc: 'All entities, modules, and geographies go live simultaneously on a single cutover date.',
                    waves: 1,
                    tag: 'High Risk / Fast ROI'
                  },
                  {
                    id: 'phased_geo',
                    label: 'Phased by Geography',
                    desc: 'Sequential regional deployments (e.g. Wave 1 HQ/US, Wave 2 EMEA, Wave 3 APAC/LATAM).',
                    waves: 3,
                    tag: 'Recommended Global'
                  },
                  {
                    id: 'phased_functional',
                    label: 'Phased by Functional Domain',
                    desc: 'Core Financials live first, followed by SCM/Manufacturing in Wave 2, HCM/Payroll in Wave 3.',
                    waves: 3,
                    tag: 'Lower Operational Shock'
                  },
                  {
                    id: 'pilot_rollout',
                    label: 'Pilot Plant & Global Template',
                    desc: 'Build global baseline template on single pilot site; iterate and deploy rapid rollout waves.',
                    waves: 4,
                    tag: 'Best for Complex SCM'
                  }
                ].map((approach) => {
                  const isSelected = scenario.rolloutApproach === approach.id;
                  return (
                    <div
                      key={approach.id}
                      onClick={() => updateRollout(approach.id as RolloutApproach, approach.waves)}
                      className={`p-4 rounded-sm border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none ${
                            isSelected ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {approach.tag}
                          </span>
                          {isSelected && <CheckCircle2 size={15} className="text-white" />}
                        </div>
                        <h4 className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {approach.label}
                        </h4>
                        <p className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {approach.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-200/30 text-[11px] font-mono">
                        <span>Default Waves: {approach.waves}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wave Count & Wave Descriptions Customizer */}
              <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Configured Deployment Waves:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => updateRollout(scenario.rolloutApproach || 'phased_geo', num)}
                          className={`w-7 h-7 rounded-none text-xs font-mono font-bold transition cursor-pointer border ${
                            (scenario.rolloutWaves || 1) === num
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Multi-wave implementations include wave regression testing and transition cutover windows.
                  </div>
                </div>

                {/* Wave Detail Inputs */}
                <div className="space-y-2.5">
                  {Array.from({ length: scenario.rolloutWaves || 1 }).map((_, idx) => {
                    const desc = scenario.waveDescriptions?.[idx] || `Wave ${idx + 1} Deployment`;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-sm bg-white border border-slate-200">
                        <span className="px-2 py-1 rounded-none text-xs font-mono font-bold bg-slate-900 text-white shrink-0">
                          Wave {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => {
                            const nextVal = e.target.value;
                            onUpdateScenario(prev => {
                              const list = [...(prev.waveDescriptions || [])];
                              list[idx] = nextVal;
                              return { ...prev, waveDescriptions: list };
                            });
                          }}
                          className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
                          placeholder={`Enter scope description for Wave ${idx + 1}...`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 3: Rollout Schedule & Hours Lineage Table */}
          {rolloutViewTab === 'traceability' && (
            <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Rollout Questionnaire Mathematical Lineage & Audit Trail
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Full lineage showing how each question selection impacts project duration and base hours.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Dimension Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Selected Option</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-right">Schedule Variance</th>
                      <th className="py-2.5 px-3 text-right">Effort Hours</th>
                      <th className="py-2.5 px-3">Technical Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {projectData.rolloutComplexityBreakdown?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs">{item.title}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.selectedOptionLabel}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{item.score}/4</td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                          item.scheduleWeeks > 0 ? 'text-amber-700' : item.scheduleWeeks < 0 ? 'text-emerald-700' : 'text-slate-500'
                        }`}>
                          {item.scheduleWeeks > 0 ? `+${item.scheduleWeeks.toFixed(1)} wks` : item.scheduleWeeks < 0 ? `${item.scheduleWeeks.toFixed(1)} wks` : '0 wks'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          {item.hours > 0 ? `+${item.hours} hrs` : '0 hrs'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-sm truncate">{item.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                      <td colSpan={3} className="py-3 px-3 uppercase text-[10px] tracking-wider">
                        Total Rollout Questionnaire Lineage Variance:
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {projectData.rolloutAvgScore} / 4.0
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-amber-800">
                        {projectData.rolloutScheduleImpactWeeks > 0 ? `+${projectData.rolloutScheduleImpactWeeks.toFixed(1)} wks` : `${projectData.rolloutScheduleImpactWeeks.toFixed(1)} wks`}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-blue-800">
                        +{(projectData?.rolloutScopingHours || 0).toLocaleString()} hrs
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 font-normal">
                        Calibrates schedule duration and base CEMLI factory effort.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: Blackout Calendar & Operational Freeze Management */}
      {activeSection === 'blackout' && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                4. Operational Blackout Calendar & Quarterly Oracle Pod Freezes
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Define business freeze windows (e.g. Fiscal Year-End Close, Peak Retail Peak, Physical Inventory) and Oracle Cloud Update Maintenance Windows (Cohorts A, B, C).
              </p>
            </div>
            <button
              onClick={addBlackoutPeriod}
              className="px-3 py-1.5 rounded-sm bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 shadow-xs"
            >
              <Plus size={14} />
              <span>Add Freeze Window</span>
            </button>
          </div>

          <div className="space-y-3">
            {(scenario.blackoutPeriods || []).length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-sm">
                <Calendar size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  No blackout windows defined. Add year-end closes or retail freezes to prevent test/cutover conflicts.
                </p>
                <button
                  onClick={addBlackoutPeriod}
                  className="mt-3 px-3 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-300"
                >
                  Add First Freeze Window
                </button>
              </div>
            ) : (
              (scenario.blackoutPeriods || []).map((bo) => (
                <div key={bo.id} className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Freeze Event Name</label>
                      <input
                        type="text"
                        value={bo.name}
                        onChange={(e) => updateBlackoutField(bo.id, 'name', e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Category</label>
                      <select
                        value={bo.type}
                        onChange={(e) => updateBlackoutField(bo.id, 'type', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-sm px-2 py-1.5 text-slate-700 focus:outline-none"
                      >
                        <option value="financial_close">Financial Year-End</option>
                        <option value="peak_retail">Peak Retail / Cyber Week</option>
                        <option value="oracle_quarterly_patch">Oracle Cloud Update (Cohort A/B/C)</option>
                        <option value="physical_inventory">Physical Stock Count</option>
                        <option value="custom">Custom Freeze</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={bo.startDate}
                        onChange={(e) => updateBlackoutField(bo.id, 'startDate', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-sm px-2 py-1 text-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={bo.endDate}
                        onChange={(e) => updateBlackoutField(bo.id, 'endDate', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-sm px-2 py-1 text-slate-700 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Severity</label>
                      <select
                        value={bo.severity}
                        onChange={(e) => updateBlackoutField(bo.id, 'severity', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-sm px-1.5 py-1.5 text-slate-700 focus:outline-none"
                      >
                        <option value="hard_freeze">Hard Freeze</option>
                        <option value="soft_freeze">Soft Advisory</option>
                      </select>
                    </div>

                    <div className="md:col-span-1 flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => removeBlackoutPeriod(bo.id)}
                        className="p-1.5 rounded-sm bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-300 cursor-pointer"
                        title="Delete blackout window"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                    <input
                      type="text"
                      value={bo.impact}
                      onChange={(e) => updateBlackoutField(bo.id, 'impact', e.target.value)}
                      placeholder="Describe testing/cutover restriction impact..."
                      className="w-full text-[11px] text-slate-600 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: Physical Scale Drivers & Topology Counters */}
      {activeSection === 'topology' && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              5. Physical Scale Drivers & CEMLI Footprint
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Calibrate operational volume drivers, legal entities, Ledgers, OIC interfaces, and custom conversions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Financials Category */}
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                <Building2 size={15} className="text-blue-600" />
                <span>Financials & Legal Topology</span>
              </div>

              <NumericCounter
                label="Legal Entities"
                sub="Statutory corporate entities"
                value={scenario.scaleDrivers.fin_ent}
                onChange={(v) => updateScaleDriver('fin_ent', v)}
              />
              <NumericCounter
                label="Primary Ledgers"
                sub="Main corporate accounting books"
                value={scenario.scaleDrivers.fin_led}
                onChange={(v) => updateScaleDriver('fin_led', v)}
              />
              <NumericCounter
                label="Secondary Ledgers"
                sub="Statutory / Local GAAP books"
                value={scenario.scaleDrivers.fin_secondary_ledgers ?? 0}
                onChange={(v) => updateScaleDriver('fin_secondary_ledgers', v)}
              />
              <NumericCounter
                label="Business Units (BUs)"
                sub="Operating & shared service hubs"
                value={scenario.scaleDrivers.fin_bu ?? 2}
                min={1}
                onChange={(v) => updateScaleDriver('fin_bu', v)}
              />
              <NumericCounter
                label="Intercompany (AGIS) Pairs"
                sub="Transacting entity trading pairs"
                value={scenario.scaleDrivers.fin_intercompany_pairs ?? 1}
                onChange={(v) => updateScaleDriver('fin_intercompany_pairs', v)}
              />
              <NumericCounter
                label="SLA Customization Rules"
                sub="Custom accounting derivations"
                value={scenario.scaleDrivers.fin_sla_rules ?? 2}
                onChange={(v) => updateScaleDriver('fin_sla_rules', v)}
              />
              <NumericCounter
                label="Tax Jurisdictions"
                sub="State/Country VAT rules"
                value={scenario.scaleDrivers.fin_tax}
                onChange={(v) => updateScaleDriver('fin_tax', v)}
              />
              <NumericCounter
                label="COA Segments"
                sub="Chart of account depth"
                value={scenario.scaleDrivers.fin_coa_segments}
                min={4}
                onChange={(v) => updateScaleDriver('fin_coa_segments', v)}
              />
            </div>

            {/* HCM & Payroll Category */}
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                <Users size={15} className="text-purple-600" />
                <span>Workforce & Payroll</span>
              </div>

              <NumericCounter
                label="Total Headcount"
                sub="Active employee base"
                step={250}
                value={scenario.scaleDrivers.hcm_hc}
                onChange={(v) => updateScaleDriver('hcm_hc', v)}
              />
              <NumericCounter
                label="Payroll Countries"
                sub="Gross-to-net statutory rules"
                value={scenario.scaleDrivers.hcm_pay_countries}
                onChange={(v) => updateScaleDriver('hcm_pay_countries', v)}
              />
              <NumericCounter
                label="Union Bargaining Units"
                sub="Collective agreements"
                value={scenario.scaleDrivers.hcm_union_groups}
                onChange={(v) => updateScaleDriver('hcm_union_groups', v)}
              />
              <NumericCounter
                label="Fast Formulas"
                sub="Payroll & absence logic"
                value={scenario.scaleDrivers.tech_fast_formulas}
                onChange={(v) => updateScaleDriver('tech_fast_formulas', v)}
              />
            </div>

            {/* Technical & CEMLI Category */}
            <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                <Database size={15} className="text-amber-600" />
                <span>Technical & OIC</span>
              </div>

              <NumericCounter
                label="OIC Integrations"
                sub="REST/SOAP API endpoints"
                value={scenario.scaleDrivers.tech_oic}
                onChange={(v) => updateScaleDriver('tech_oic', v)}
              />
              <NumericCounter
                label="PaaS / VBCS Apps"
                sub="Custom visual extensions"
                value={scenario.scaleDrivers.tech_paas}
                onChange={(v) => updateScaleDriver('tech_paas', v)}
              />
              <NumericCounter
                label="Conversion Data Objects"
                sub="FBDI & HDL master entities"
                value={scenario.scaleDrivers.tech_data_objects}
                onChange={(v) => updateScaleDriver('tech_data_objects', v)}
              />
              <NumericCounter
                label="BPM Approval Workflows"
                sub="Advanced matrix approval hierarchies"
                value={scenario.scaleDrivers.tech_bpm_approval_groups ?? 3}
                onChange={(v) => updateScaleDriver('tech_bpm_approval_groups', v)}
              />
              <NumericCounter
                label="BIP Custom Reports"
                sub="Data models & pixel perfect"
                value={scenario.scaleDrivers.tech_reports_bip}
                onChange={(v) => updateScaleDriver('tech_reports_bip', v)}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: Leadership Scoping Traceability & Mathematical Audit */}
      {activeSection === 'traceability' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-sm p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Compass size={16} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Executive Scoping Audit & Lineage
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                {scenario.selectedModules.length} In-Scope Modules
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Scoping Lineage & Mathematical Base Effort Proof
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every scoping choice directly translates into transparent functional units. Below is the full mathematical derivation across Catalog Base, 20-Question Depth, and Physical CEMLI Drivers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-6">
            <div className="p-4 rounded-sm bg-slate-900 text-amber-300 font-mono text-xs leading-relaxed">
              <strong>Base Hours Formula:</strong> H_base = ∑(Module_Base × Complexity_Factor) + ∑(20Q_Scoping_Delta) + ∑(Physical_Scale_Drivers) + ∑(Rollout_Questionnaire_Hours)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Catalog Base Hours</span>
                <div className="text-2xl font-mono font-bold text-slate-900">
                  {scenario.selectedModules.reduce((acc, mId) => {
                    const def = ORACLE_MODULE_CATALOG.find(m => m.id === mId);
                    return acc + ((def?.baseEffortHours || 0) * (def?.complexityFactor || 1));
                  }, 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                </div>
                <p className="text-[11px] text-slate-500">Out-of-the-box Oracle Modern Best Practice (MBP) effort.</p>
              </div>

              <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">20-Question Scoping Delta</span>
                <div className="text-2xl font-mono font-bold text-blue-700">
                  +{scenario.selectedModules.reduce((acc, mId) => {
                    const qList = getQuestionsForModule(mId);
                    const answers = scenario.moduleQuestionAnswers?.[mId] || Array(20).fill(1);
                    return acc + qList.reduce((sum, q, idx) => {
                      const optIdx = answers[idx] !== undefined ? answers[idx] : 1;
                      return sum + (q.options[optIdx]?.hoursImpact || 0);
                    }, 0);
                  }, 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                </div>
                <p className="text-[11px] text-slate-500">Granular domain variance across approvals, data, and workflows.</p>
              </div>

              <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Physical Scale & CEMLI</span>
                <div className="text-2xl font-mono font-bold text-emerald-700">
                  +{(
                    (scenario.scaleDrivers.scm_plants || 0) * 450 +
                    (scenario.scaleDrivers.scm_wh || 0) * 250 +
                    (scenario.scaleDrivers.fin_ent || 0) * 180 +
                    (scenario.scaleDrivers.fin_led || 0) * 350 +
                    (scenario.scaleDrivers.tech_oic || 0) * 120 +
                    (scenario.scaleDrivers.tech_paas || 0) * 650 +
                    (scenario.scaleDrivers.tech_data_objects || 0) * 90
                  ).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                </div>
                <p className="text-[11px] text-slate-500">Entities, ledgers, OIC interfaces, and PaaS custom builds.</p>
              </div>

              <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rollout Questionnaire Delta</span>
                <div className="text-2xl font-mono font-bold text-purple-700">
                  +{(projectData?.rolloutScopingHours || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">hrs</span>
                </div>
                <p className="text-[11px] text-slate-500">Legacy coexistence bridging, data cutover factory & statutory builds.</p>
              </div>
            </div>

            {/* In-Scope Module Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                In-Scope Module Detail & Complexity Score Breakdown
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Module Name</th>
                      <th className="py-2.5 px-3">Pillar</th>
                      <th className="py-2.5 px-3 text-right">Catalog Base</th>
                      <th className="py-2.5 px-3 text-right">20-Q Avg Score</th>
                      <th className="py-2.5 px-3 text-right">Scoping Delta</th>
                      <th className="py-2.5 px-3">Primary Complexity Driver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {scenario.selectedModules.map((modId) => {
                      const def = combinedModules.find(m => m.id === modId);
                      const qList = getModuleQuestionsList(modId);
                      const answers = scenario.moduleQuestionAnswers?.[modId] || Array(qList.length).fill(1);
                      const totalScore = answers.slice(0, qList.length).reduce((s, v) => s + (v + 1), 0);
                      const avg = qList.length > 0 ? totalScore / qList.length : 2.0;
                      const delta = qList.reduce((sum, q, idx) => {
                        const optIdx = answers[idx] !== undefined ? answers[idx] : 1;
                        return sum + (q.options[optIdx]?.hoursImpact || 0);
                      }, 0);

                      return (
                        <tr key={modId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{def?.name || modId}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                              {def?.pillar}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">{def?.baseEffortHours || 400} hrs</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">{avg.toFixed(2)} / 4.0</td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-700">+{delta} hrs</td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">{def?.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified AI Scoping & Ingestion Agent Modal */}
      <AIScopingAgentModal
        isOpen={isScopingAgentModalOpen}
        onClose={() => setIsScopingAgentModalOpen(false)}
        scenario={scenario}
        onUpdateScenario={onUpdateScenario}
        onOpenClientQa={() => setIsClientQaModalOpen(true)}
        onOpenComplexityStudio={onOpenComplexityStudio}
        initialMode={scopingAgentInitialMode}
      />

      {/* Client Q&A & Scoping Clarification Modal */}
      <ClientQaModal
        isOpen={isClientQaModalOpen}
        onClose={() => setIsClientQaModalOpen(false)}
        scenario={scenario}
        onUpdateScenario={onUpdateScenario}
      />

      {/* Add Custom Oracle Module / Domain Modal */}
      <AddCustomModuleModal
        isOpen={isAddCustomModuleOpen}
        onClose={() => setIsAddCustomModuleOpen(false)}
        existingPillars={availablePillars.filter(p => p !== 'ALL')}
        onAddModule={handleAddCustomModule}
      />

      {/* Add Custom Scoping Question Modal */}
      {addQuestionTargetModule && (
        <AddCustomQuestionModal
          isOpen={!!addQuestionTargetModule}
          onClose={() => setAddQuestionTargetModule(null)}
          moduleId={addQuestionTargetModule.id}
          moduleName={addQuestionTargetModule.name}
          onAddQuestion={(q) => handleAddCustomQuestion(addQuestionTargetModule.id, q)}
        />
      )}

      {/* 20-Question Dedicated Scoping Studio & Interactive Step Wizard Modal */}
      <Module20QuestionsModal
        isOpen={is20QModalOpen}
        onClose={() => setIs20QModalOpen(false)}
        moduleId={selected20QModuleId}
        initialMode={modal20QMode}
        initialQuestionIndex={modal20QQuestionIndex}
        scenario={scenario}
        onUpdateScenario={onUpdateScenario}
        onOpenAddQuestion={(modId, modName) => {
          setAddQuestionTargetModule({ id: modId, name: modName });
        }}
        onOpenClientQa={() => setIsClientQaModalOpen(true)}
      />
      {/* SteerCo Baseline Unlock Reason Modal */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-none border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Request SteerCo Baseline Unlock
                </h3>
              </div>
              <button
                onClick={() => setIsUnlockModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <p>
                This scoping baseline was approved and locked by the Program SteerCo. Unlocking the questionnaire will allow editing of module answers and will record a permanent entry in the project audit log.
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                  Reason for Revision / Change Request (CR) Reference:
                </label>
                <textarea
                  rows={3}
                  value={unlockReasonInput}
                  onChange={(e) => setUnlockReasonInput(e.target.value)}
                  placeholder="e.g., Client requested CR-04 adding SCM Maintenance Cloud and 2 additional interfaces..."
                  className="w-full p-2.5 border border-slate-300 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnlock}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Confirm Unlock & Log Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ModifierCardProps {
  title: string;
  category: string;
  value: number;
  options: { label: string; value: number; desc: string }[];
  onChange: (v: number) => void;
}

const ModifierCard: React.FC<ModifierCardProps> = ({
  title,
  category,
  value,
  options,
  onChange
}) => {
  const selectedOpt = options.find(opt => Math.abs(value - opt.value) < 0.01) || options[1];

  return (
    <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-900 leading-tight">{title}</h4>
          <span className="text-[10px] uppercase font-bold text-slate-400">{category}</span>
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-none ${
          value > 1.1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-800'
        }`}>
          {value.toFixed(2)}x
        </span>
      </div>

      <div className="space-y-1.5">
        <select
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full text-xs font-mono font-bold p-1.5 border border-slate-300 bg-white rounded-none text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none cursor-pointer"
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.value.toFixed(2)}x — {opt.label}
            </option>
          ))}
        </select>
        {selectedOpt && (
          <p className="text-[11px] text-slate-500 italic leading-snug bg-white p-1.5 border border-slate-200">
            {selectedOpt.desc}
          </p>
        )}
      </div>
    </div>
  );
};

interface NumericCounterProps {
  label: string;
  sub: string;
  value: number;
  step?: number;
  min?: number;
  onChange: (val: number) => void;
}

const NumericCounter: React.FC<NumericCounterProps> = ({
  label,
  sub,
  value,
  step = 1,
  min = 0,
  onChange
}) => (
  <div className="flex items-center justify-between gap-2 p-2.5 rounded-sm bg-white border border-slate-200 shadow-2xs">
    <div className="min-w-0 pr-2">
      <div className="text-xs font-bold text-slate-900 truncate">{label}</div>
      <div className="text-[10px] text-slate-500 truncate">{sub}</div>
    </div>
    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-1 rounded-sm border border-slate-200 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-5 h-5 rounded-none flex items-center justify-center bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 cursor-pointer"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-10 text-center bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="w-5 h-5 rounded-none flex items-center justify-center bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 cursor-pointer"
      >
        +
      </button>
    </div>
  </div>
);
