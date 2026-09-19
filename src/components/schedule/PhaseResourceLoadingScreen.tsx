import React, { useState, useMemo } from 'react';
import {
  Users,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  BarChart3,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, ModuleEffortEstimate } from '../../types';

interface PhaseResourceLoadingScreenProps {
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onUpdateScenario?: (updater: (prev: ProjectScenario) => ProjectScenario) => void;
}

export type ViewDisplayMode = 'fte' | 'hours';
export type TimeGroupingMode = 'monthly' | 'phase';

interface PhaseRoleAllocationProfile {
  roleId: string;
  roleName: string;
  category: 'Strategic' | 'Functional' | 'Technical' | 'Data' | 'Testing' | 'Change';
  streamName: string;
  moduleCode?: string;
  totalHours: number;
  phaseSplitPcts: {
    phase_enablement: number;
    phase_design: number;
    phase_build: number;
    phase_test_1: number;
    phase_test_2: number;
    phase_cutover: number;
    phase_hypercare: number;
  };
}

export const PhaseResourceLoadingScreen: React.FC<PhaseResourceLoadingScreenProps> = ({
  scenario,
  data
}) => {
  const [displayMode, setDisplayMode] = useState<ViewDisplayMode>('fte');
  const [timeMode, setTimeMode] = useState<TimeGroupingMode>('monthly');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedStreams, setExpandedStreams] = useState<Record<string, boolean>>({
    'Functional': true,
    'Technical': true,
    'Data': true,
    'Testing': true,
    'Change': true,
    'Strategic': true
  });
  const [selectedModuleDetail, setSelectedModuleDetail] = useState<string | null>(null);

  const toggleStream = (stream: string) => {
    setExpandedStreams(prev => ({ ...prev, [stream]: !prev[stream] }));
  };

  const projectWeeks = Math.max(16, scenario.projectWeeks || 32);
  const startDateStr = scenario.targetStartDate || '2026-09-01';
  const startDateObj = useMemo(() => new Date(startDateStr + 'T00:00:00'), [startDateStr]);

  // Phase metadata with durations and weeks
  const phases = useMemo(() => {
    return data.phaseHours.map(ph => {
      const durationWeeks = Math.max(1, ph.endWeek - ph.startWeek + 1);
      return {
        id: ph.id as 'phase_enablement' | 'phase_design' | 'phase_build' | 'phase_test_1' | 'phase_test_2' | 'phase_cutover' | 'phase_hypercare',
        code: ph.code,
        name: ph.name,
        color: ph.color,
        startWeek: ph.startWeek,
        endWeek: ph.endWeek,
        durationWeeks,
        hours: ph.hours
      };
    });
  }, [data.phaseHours]);

  // Derive Monthly Calendar Timeline
  const months = useMemo(() => {
    const totalMonths = Math.max(4, Math.ceil(projectWeeks / 4.333));
    const result: Array<{
      monthIndex: number;
      label: string;
      startWeek: number;
      endWeek: number;
      workingHours: number; // typically 160h or 173.3h
      primaryPhaseName: string;
      primaryPhaseColor: string;
      phaseWeights: Record<string, number>; // fraction of month belonging to each phase
    }> = [];

    for (let m = 0; m < totalMonths; m++) {
      const monthStartWeek = Math.round(m * 4.333) + 1;
      const monthEndWeek = Math.min(projectWeeks, Math.round((m + 1) * 4.333));
      
      // Approximate month label
      const d = new Date(startDateObj);
      d.setDate(d.getDate() + (monthStartWeek - 1) * 7);
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      // Determine phase weights for this month
      const phaseWeights: Record<string, number> = {};
      let maxPhaseOverlap = 0;
      let primaryPhase = phases[0];

      const monthWeeksCount = Math.max(1, monthEndWeek - monthStartWeek + 1);

      phases.forEach(ph => {
        const overlapStart = Math.max(monthStartWeek, ph.startWeek);
        const overlapEnd = Math.min(monthEndWeek, ph.endWeek);
        if (overlapEnd >= overlapStart) {
          const overlapWeeks = overlapEnd - overlapStart + 1;
          const weight = overlapWeeks / monthWeeksCount;
          phaseWeights[ph.id] = weight;
          if (weight > maxPhaseOverlap) {
            maxPhaseOverlap = weight;
            primaryPhase = ph;
          }
        }
      });

      result.push({
        monthIndex: m + 1,
        label: `M${m + 1} (${monthLabel})`,
        startWeek: monthStartWeek,
        endWeek: monthEndWeek,
        workingHours: monthWeeksCount * 40,
        primaryPhaseName: primaryPhase.code || primaryPhase.name,
        primaryPhaseColor: primaryPhase.color,
        phaseWeights
      });
    }

    return result;
  }, [projectWeeks, startDateObj, phases]);

  // Construct Role Profiles directly from the selected modules and specific workstream estimates
  const roleProfiles: PhaseRoleAllocationProfile[] = useMemo(() => {
    const profiles: PhaseRoleAllocationProfile[] = [];

    // 1. STRATEGIC & LEADERSHIP
    const pmoHours = data.workstreamHours.find(w => w.category === 'Management')?.hours || Math.round(data.targetHours * 0.10);
    profiles.push({
      roleId: 'role_pmo_dir',
      roleName: 'Program Engagement Director & PMO Lead',
      category: 'Strategic',
      streamName: 'Program Leadership & PMO',
      totalHours: Math.round(pmoHours * 0.6),
      phaseSplitPcts: {
        phase_enablement: 0.12,
        phase_design: 0.22,
        phase_build: 0.24,
        phase_test_1: 0.18,
        phase_test_2: 0.14,
        phase_cutover: 0.06,
        phase_hypercare: 0.04
      }
    });

    profiles.push({
      roleId: 'role_arch_lead',
      roleName: 'Lead Enterprise Solution Architect',
      category: 'Strategic',
      streamName: 'Program Leadership & PMO',
      totalHours: Math.round(pmoHours * 0.4),
      phaseSplitPcts: {
        phase_enablement: 0.15,
        phase_design: 0.35,
        phase_build: 0.20,
        phase_test_1: 0.14,
        phase_test_2: 0.10,
        phase_cutover: 0.04,
        phase_hypercare: 0.02
      }
    });

    // 2. FUNCTIONAL MODULES (DYNAMICALLY DERIVED FROM EACH SELECTED MODULE!)
    data.moduleEstimates.forEach((mod: ModuleEffortEstimate) => {
      const modHours = Math.round(mod.finalP80Hours || mod.finalP50Hours || mod.baseHours);
      profiles.push({
        roleId: `func_${mod.moduleId}`,
        roleName: `${mod.pillar}: ${mod.moduleName}`,
        category: 'Functional',
        streamName: `Functional Workstream (${mod.pillar})`,
        moduleCode: mod.moduleId,
        totalHours: modHours,
        // Functional profile: High in Design workshops, steady in Build configuration & CRP, support in SIT, high in UAT business guidance, ramp-down in cutover
        phaseSplitPcts: {
          phase_enablement: 0.03,
          phase_design: 0.32,
          phase_build: 0.32,
          phase_test_1: 0.14,
          phase_test_2: 0.14,
          phase_cutover: 0.03,
          phase_hypercare: 0.02
        }
      });
    });

    // 3. TECHNICAL & INTEGRATION (PEAK IN BUILD, SHARP RAMP DOWN IN SIT & UAT)
    const techHours = data.technicalWorkstreamEstimate?.totalHours || 
      (data.workstreamHours.find(w => w.category === 'Technical')?.hours || Math.round(data.targetHours * 0.22));
    
    const integrationsHours = data.technicalWorkstreamEstimate?.integrationsHours || Math.round(techHours * 0.45);
    const reportsHours = data.technicalWorkstreamEstimate?.reportsHours || Math.round(techHours * 0.25);
    const paasHours = (data.technicalWorkstreamEstimate?.paasHours || 0) + (data.technicalWorkstreamEstimate?.fastFormulasHours || 0) + (data.technicalWorkstreamEstimate?.workflowsHours || 0) || Math.round(techHours * 0.30);

    // Peak Build Profile for Technical: Build = 55%, SIT = 20% (Ramp down starts!), UAT = 10% (Further ramp down!), Cutover = 3%
    profiles.push({
      roleId: 'tech_oic_lead',
      roleName: 'Oracle Integration Cloud (OIC) Engineers',
      category: 'Technical',
      streamName: 'Technical & CEMLI Engineering',
      totalHours: integrationsHours,
      phaseSplitPcts: {
        phase_enablement: 0.02,
        phase_design: 0.08,
        phase_build: 0.55,  // PEAK BUILD!
        phase_test_1: 0.20, // RAMP DOWN STARTS (-64%)
        phase_test_2: 0.10, // FURTHER RAMP DOWN (-50%)
        phase_cutover: 0.03,
        phase_hypercare: 0.02
      }
    });

    profiles.push({
      roleId: 'tech_reports_lead',
      roleName: 'BI Publisher & OTBI Analytics Developers',
      category: 'Technical',
      streamName: 'Technical & CEMLI Engineering',
      totalHours: reportsHours,
      phaseSplitPcts: {
        phase_enablement: 0.02,
        phase_design: 0.10,
        phase_build: 0.53,  // PEAK BUILD!
        phase_test_1: 0.20, // RAMP DOWN
        phase_test_2: 0.11, // FURTHER RAMP DOWN
        phase_cutover: 0.02,
        phase_hypercare: 0.02
      }
    });

    profiles.push({
      roleId: 'tech_paas_lead',
      roleName: 'PaaS Extensions, Rules & Workflow Developers',
      category: 'Technical',
      streamName: 'Technical & CEMLI Engineering',
      totalHours: paasHours,
      phaseSplitPcts: {
        phase_enablement: 0.02,
        phase_design: 0.08,
        phase_build: 0.55,  // PEAK BUILD!
        phase_test_1: 0.20, // RAMP DOWN
        phase_test_2: 0.10, // FURTHER RAMP DOWN
        phase_cutover: 0.03,
        phase_hypercare: 0.02
      }
    });

    // 4. DATA CONVERSION & REHEARSAL (RAMPS UP TO PEAK AT CUTOVER WEEKEND)
    const dataHours = data.conversionMetrics?.totalConversionP80Hours || 
      (data.workstreamHours.find(w => w.category === 'Data')?.hours || Math.round(data.targetHours * 0.14));
    
    profiles.push({
      roleId: 'data_lead',
      roleName: 'Data Conversion Lead & FBDI Engineers',
      category: 'Data',
      streamName: 'Data Migration & Quality',
      totalHours: dataHours,
      // Data ramps up: Mock 1 in Build, Mock 2 in SIT, Mock 3 in UAT, Peak cutover weekend in Cutover
      phaseSplitPcts: {
        phase_enablement: 0.03,
        phase_design: 0.09,
        phase_build: 0.24,
        phase_test_1: 0.24,
        phase_test_2: 0.20,
        phase_cutover: 0.15, // PEAK INTENSITY CUTOVER WEEKEND
        phase_hypercare: 0.05
      }
    });

    // 5. TESTING & QUALITY ASSURANCE (PEAK AT SIT EXECUTION!)
    const testingHours = data.testingWorkstreamEstimate?.totalHours || 
      (data.workstreamHours.find(w => w.category === 'Testing')?.hours || Math.round(data.targetHours * 0.16));

    profiles.push({
      roleId: 'test_manager',
      roleName: 'Quality Assurance & Test Management Lead',
      category: 'Testing',
      streamName: 'Testing & Verification',
      totalHours: Math.round(testingHours * 0.35),
      phaseSplitPcts: {
        phase_enablement: 0.04,
        phase_design: 0.08,
        phase_build: 0.20,
        phase_test_1: 0.38, // PEAK SIT
        phase_test_2: 0.22, // UAT GATE DEFECT MANAGEMENT
        phase_cutover: 0.05,
        phase_hypercare: 0.03
      }
    });

    profiles.push({
      roleId: 'test_engineers',
      roleName: 'SIT / Automation & UAT Test Engineers',
      category: 'Testing',
      streamName: 'Testing & Verification',
      totalHours: Math.round(testingHours * 0.65),
      phaseSplitPcts: {
        phase_enablement: 0.01,
        phase_design: 0.04,
        phase_build: 0.20,  // Script authoring & test data
        phase_test_1: 0.48, // PEAK TEST EXECUTION (SIT Cycle 1 & 2)
        phase_test_2: 0.21, // UAT defect retesting & regression
        phase_cutover: 0.04,
        phase_hypercare: 0.02
      }
    });

    // 6. OCM & TRAINING (PEAK AT UAT END-USER TRAINING)
    const ocmHours = data.workstreamHours.find(w => w.category === 'Change')?.hours || Math.round(data.targetHours * 0.08);

    profiles.push({
      roleId: 'ocm_lead',
      roleName: 'Change Management & Enablement Lead',
      category: 'Change',
      streamName: 'Change Management & Training',
      totalHours: Math.round(ocmHours * 0.45),
      phaseSplitPcts: {
        phase_enablement: 0.06,
        phase_design: 0.12,
        phase_build: 0.20,
        phase_test_1: 0.20,
        phase_test_2: 0.30, // UAT & Super User Readiness
        phase_cutover: 0.08,
        phase_hypercare: 0.04
      }
    });

    profiles.push({
      roleId: 'training_specialist',
      roleName: 'Instructional Designers & Training Specialists',
      category: 'Change',
      streamName: 'Change Management & Training',
      totalHours: Math.round(ocmHours * 0.55),
      phaseSplitPcts: {
        phase_enablement: 0.02,
        phase_design: 0.06,
        phase_build: 0.18,  // Curriculum design
        phase_test_1: 0.20, // Train-the-trainer
        phase_test_2: 0.42, // PEAK BROAD END-USER CLASSROOM TRAINING
        phase_cutover: 0.08,
        phase_hypercare: 0.04
      }
    });

    return profiles;
  }, [data]);

  // Filter profiles based on selected category
  const filteredProfiles = useMemo(() => {
    if (categoryFilter === 'all') return roleProfiles;
    return roleProfiles.filter(p => p.category === categoryFilter);
  }, [roleProfiles, categoryFilter]);

  // Group filtered profiles by Stream Name
  const groupedProfiles = useMemo(() => {
    const map: Record<string, PhaseRoleAllocationProfile[]> = {};
    filteredProfiles.forEach(p => {
      if (!map[p.streamName]) map[p.streamName] = [];
      map[p.streamName].push(p);
    });
    return map;
  }, [filteredProfiles]);

  // Phase Loading Calculations:
  // For each phase and role, calculate Hours and FTE
  const phaseGridData = useMemo(() => {
    return phases.map(ph => {
      let phaseTotalHours = 0;
      const roleAllocations: Record<string, { hours: number; fte: number }> = {};

      roleProfiles.forEach(role => {
        const pct = role.phaseSplitPcts[ph.id] || 0;
        const hours = role.totalHours * pct;
        const fte = ph.durationWeeks > 0 ? hours / (ph.durationWeeks * 40) : 0;
        roleAllocations[role.roleId] = { hours, fte };
        phaseTotalHours += hours;
      });

      const totalFte = ph.durationWeeks > 0 ? phaseTotalHours / (ph.durationWeeks * 40) : 0;

      return {
        phaseId: ph.id,
        phaseCode: ph.code,
        phaseName: ph.name,
        color: ph.color,
        durationWeeks: ph.durationWeeks,
        startWeek: ph.startWeek,
        endWeek: ph.endWeek,
        totalHours: phaseTotalHours,
        totalFte,
        roleAllocations
      };
    });
  }, [phases, roleProfiles]);

  // Monthly Loading Calculations:
  // Convert phase hours to calendar months deterministically
  const monthlyGridData = useMemo(() => {
    return months.map(m => {
      let monthTotalHours = 0;
      const roleAllocations: Record<string, { hours: number; fte: number }> = {};

      roleProfiles.forEach(role => {
        // Calculate role hours in this month based on phase weights
        let roleMonthHours = 0;
        (Object.entries(m.phaseWeights) as [string, number][]).forEach(([phId, weight]) => {
          const ph = phases.find(p => p.id === phId);
          if (ph && ph.durationWeeks > 0) {
            const rolePhaseHours = role.totalHours * (role.phaseSplitPcts[phId as keyof typeof role.phaseSplitPcts] || 0);
            const hoursPerWeek = rolePhaseHours / ph.durationWeeks;
            roleMonthHours += hoursPerWeek * Math.max(0.5, (m.endWeek - m.startWeek + 1) * weight);
          }
        });

        // Normalize to prevent mathematical drift
        const roleMonthFte = m.workingHours > 0 ? roleMonthHours / m.workingHours : 0;
        roleAllocations[role.roleId] = { hours: roleMonthHours, fte: roleMonthFte };
        monthTotalHours += roleMonthHours;
      });

      const totalFte = m.workingHours > 0 ? monthTotalHours / m.workingHours : 0;

      return {
        monthIndex: m.monthIndex,
        label: m.label,
        startWeek: m.startWeek,
        endWeek: m.endWeek,
        workingHours: m.workingHours,
        primaryPhaseName: m.primaryPhaseName,
        primaryPhaseColor: m.primaryPhaseColor,
        totalHours: monthTotalHours,
        totalFte,
        roleAllocations
      };
    });
  }, [months, roleProfiles, phases]);

  // Key KPI Metrics & Ramp-Down Intelligence
  const kpiMetrics = useMemo(() => {
    const buildPhase = phaseGridData.find(p => p.phaseId === 'phase_build');
    const sitPhase = phaseGridData.find(p => p.phaseId === 'phase_test_1');
    const uatPhase = phaseGridData.find(p => p.phaseId === 'phase_test_2');
    const cutoverPhase = phaseGridData.find(p => p.phaseId === 'phase_cutover');
    const hypercarePhase = phaseGridData.find(p => p.phaseId === 'phase_hypercare');

    // Peak Month
    let peakMonthFte = 0;
    let peakMonthLabel = '';
    monthlyGridData.forEach(m => {
      if (m.totalFte > peakMonthFte) {
        peakMonthFte = m.totalFte;
        peakMonthLabel = m.label;
      }
    });

    // Technical stream specific ramp down
    const techRoles = roleProfiles.filter(r => r.category === 'Technical');
    const techBuildFte = techRoles.reduce((acc, r) => acc + (buildPhase?.roleAllocations[r.roleId]?.fte || 0), 0);
    const techSitFte = techRoles.reduce((acc, r) => acc + (sitPhase?.roleAllocations[r.roleId]?.fte || 0), 0);
    const techUatFte = techRoles.reduce((acc, r) => acc + (uatPhase?.roleAllocations[r.roleId]?.fte || 0), 0);
    const techRampDownPct = techBuildFte > 0 ? Math.round(((techBuildFte - techSitFte) / techBuildFte) * 100) : 0;

    // QA stream peak in SIT
    const qaRoles = roleProfiles.filter(r => r.category === 'Testing');
    const qaBuildFte = qaRoles.reduce((acc, r) => acc + (buildPhase?.roleAllocations[r.roleId]?.fte || 0), 0);
    const qaSitFte = qaRoles.reduce((acc, r) => acc + (sitPhase?.roleAllocations[r.roleId]?.fte || 0), 0);

    // Total Project Hours
    const totalProgramHours = roleProfiles.reduce((acc, r) => acc + r.totalHours, 0);
    const avgFte = totalProgramHours / (projectWeeks * 40);

    return {
      totalProgramHours,
      avgFte,
      peakMonthFte,
      peakMonthLabel,
      buildFte: buildPhase?.totalFte || 0,
      sitFte: sitPhase?.totalFte || 0,
      uatFte: uatPhase?.totalFte || 0,
      cutoverFte: cutoverPhase?.totalFte || 0,
      hypercareFte: hypercarePhase?.totalFte || 0,
      techBuildFte,
      techSitFte,
      techUatFte,
      techRampDownPct,
      qaBuildFte,
      qaSitFte
    };
  }, [phaseGridData, monthlyGridData, roleProfiles, projectWeeks]);

  // CSV Export Generator
  const handleExportCsv = () => {
    const headers = [
      'Workstream',
      'Role / Module Code',
      'Category',
      'Total Scope Hours',
      ...(timeMode === 'monthly'
        ? months.map(m => `${m.label} (${displayMode.toUpperCase()})`)
        : phases.map(p => `${p.code} (${displayMode.toUpperCase()})`)),
      'Avg FTE',
      'Peak Period FTE'
    ];

    const rows: string[][] = [];

    roleProfiles.forEach(role => {
      let peakPeriodFte = 0;
      const periodValues = timeMode === 'monthly'
        ? monthlyGridData.map(m => {
            const val = m.roleAllocations[role.roleId] || { hours: 0, fte: 0 };
            if (val.fte > peakPeriodFte) peakPeriodFte = val.fte;
            return displayMode === 'fte' ? val.fte.toFixed(1) : Math.round(val.hours).toString();
          })
        : phaseGridData.map(p => {
            const val = p.roleAllocations[role.roleId] || { hours: 0, fte: 0 };
            if (val.fte > peakPeriodFte) peakPeriodFte = val.fte;
            return displayMode === 'fte' ? val.fte.toFixed(1) : Math.round(val.hours).toString();
          });

      const avgRoleFte = (role.totalHours / (projectWeeks * 40)).toFixed(1);

      rows.push([
        `"${role.streamName}"`,
        `"${role.roleName}"`,
        role.category,
        role.totalHours.toString(),
        ...periodValues,
        avgRoleFte,
        peakPeriodFte.toFixed(1)
      ]);
    });

    // Total Row
    const totalPeriods = timeMode === 'monthly'
      ? monthlyGridData.map(m => displayMode === 'fte' ? m.totalFte.toFixed(1) : Math.round(m.totalHours).toString())
      : phaseGridData.map(p => displayMode === 'fte' ? p.totalFte.toFixed(1) : Math.round(p.totalHours).toString());

    rows.push([
      '"TOTAL PROGRAM LOAD"',
      '"ALL ROLES COMBINED"',
      'Summary',
      kpiMetrics.totalProgramHours.toString(),
      ...totalPeriods,
      kpiMetrics.avgFte.toFixed(1),
      kpiMetrics.peakMonthFte.toFixed(1)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Oracle_Cloud_Resource_Loading_Plan_${scenario.thorId || 'Proposal'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="resource-loading-screen" className="space-y-6">
      {/* 1. Executive Intelligence & Ramp-Down Overview */}
      <div className="p-5 rounded-sm bg-slate-900 text-white shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-2xs text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-950">
                Deterministic Sizing Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {scenario.selectedModules.length} Selected Modules &bull; {projectWeeks} Weeks Duration
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users size={22} className="text-amber-400" />
              Phase-Wise Resource Loading & Role Ramp-Down Plan
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Derived dynamically from module-by-module configuration, technical CEMLI inventory, and data rehearsal hours.
              Reflects distinct role lifecycle curves: technical build surges to peak, QA surges in SIT, and developers ramp down into UAT.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              id="export-resource-plan-csv"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xs bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Export complete time-phased grid to CSV"
            >
              <Download size={14} />
              <span>Export Loading Grid (CSV)</span>
            </button>
          </div>
        </div>

        {/* Intelligence Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-800">
          <div className="p-3 bg-slate-800/80 rounded-xs border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Program Scope</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {kpiMetrics.totalProgramHours.toLocaleString()} <span className="text-xs font-normal text-slate-400">hrs</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">P80 Defensible Baseline</div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xs border border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400">Average Team Size</div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">
              {kpiMetrics.avgFte.toFixed(1)} <span className="text-xs font-normal text-slate-400">FTE</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{Math.round(kpiMetrics.avgFte * 40)} hrs/wk burn</div>
          </div>

          <div className="p-3 bg-amber-950/40 rounded-xs border border-amber-600/40">
            <div className="text-[10px] uppercase font-bold text-amber-300">Peak Build Squad</div>
            <div className="text-lg font-bold text-amber-200 font-mono mt-0.5">
              {kpiMetrics.buildFte.toFixed(1)} <span className="text-xs font-normal text-amber-400">FTE</span>
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5">Build & Config Phase</div>
          </div>

          <div className="p-3 bg-indigo-950/40 rounded-xs border border-indigo-600/40">
            <div className="text-[10px] uppercase font-bold text-indigo-300">SIT Testing Squad</div>
            <div className="text-lg font-bold text-indigo-200 font-mono mt-0.5">
              {kpiMetrics.sitFte.toFixed(1)} <span className="text-xs font-normal text-indigo-400">FTE</span>
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">QA Peak ({kpiMetrics.qaSitFte.toFixed(1)} QA FTE)</div>
          </div>

          <div className="p-3 bg-blue-950/40 rounded-xs border border-blue-600/40">
            <div className="text-[10px] uppercase font-bold text-blue-300">UAT & Training Squad</div>
            <div className="text-lg font-bold text-blue-200 font-mono mt-0.5">
              {kpiMetrics.uatFte.toFixed(1)} <span className="text-xs font-normal text-blue-400">FTE</span>
            </div>
            <div className="text-[10px] text-blue-300 mt-0.5">Business User Guidance</div>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xs border border-emerald-600/40">
            <div className="text-[10px] uppercase font-bold text-emerald-300">Cutover & Go-Live</div>
            <div className="text-lg font-bold text-emerald-200 font-mono mt-0.5">
              {kpiMetrics.cutoverFte.toFixed(1)} <span className="text-xs font-normal text-emerald-400">FTE</span>
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Command Center & Data</div>
          </div>
        </div>

        {/* Super Intelligence Ramp-Down Callout Banner */}
        <div className="p-3 bg-slate-950 rounded-xs border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Role-Specific Lifecycle Mechanics:</strong>{' '}
              Technical Developers ramp down by <span className="text-amber-300 font-bold font-mono">-{kpiMetrics.techRampDownPct}%</span> immediately after Build ({kpiMetrics.techBuildFte.toFixed(1)} FTE in Build &rarr; {kpiMetrics.techSitFte.toFixed(1)} FTE in SIT &rarr; {kpiMetrics.techUatFte.toFixed(1)} FTE in UAT).
              Meanwhile, QA resources surge <span className="text-indigo-300 font-bold font-mono">+{Math.round(((kpiMetrics.qaSitFte - kpiMetrics.qaBuildFte) / Math.max(0.1, kpiMetrics.qaBuildFte)) * 100)}%</span> to lead SIT execution, and Data Engineers concentrate on Mock conversion iterations.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Staffing Histogram (CSS/SVG Responsive Ramp Curve) */}
      <div className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={16} className="text-slate-700" />
              Resource Loading Ramp Curve ({timeMode === 'monthly' ? 'Monthly Headcount' : 'Phase-by-Phase Headcount'})
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing the peak staffing surge during Build and the controlled phased ramp-downs across SIT, UAT, and Go-Live.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-2xs inline-block" />
              <span className="text-slate-600 font-medium">Build Peak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-500 rounded-2xs inline-block" />
              <span className="text-slate-600 font-medium">SIT Testing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-500 rounded-2xs inline-block" />
              <span className="text-slate-600 font-medium">UAT & Training</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-2xs inline-block" />
              <span className="text-slate-600 font-medium">Cutover / Live</span>
            </div>
          </div>
        </div>

        {/* Stacked Visual Bar Display */}
        <div className="pt-2 pb-1">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${timeMode === 'monthly' ? months.length : phases.length}, minmax(0, 1fr))` }}>
            {(timeMode === 'monthly' ? monthlyGridData : phaseGridData).map((col, idx) => {
              const maxFte = Math.max(1, kpiMetrics.peakMonthFte * 1.15);
              const heightPct = Math.min(100, Math.max(12, Math.round((col.totalFte / maxFte) * 100)));
              const isPeak = col.totalFte >= (kpiMetrics.peakMonthFte * 0.95);

              return (
                <div key={idx} className="flex flex-col items-center justify-end h-40 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[11px] px-2 py-1 rounded-xs pointer-events-none whitespace-nowrap shadow-lg">
                    <strong>{timeMode === 'monthly' ? col.label : (col as any).phaseName}</strong>: {col.totalFte.toFixed(1)} FTE ({Math.round(col.totalHours).toLocaleString()} hrs)
                  </div>

                  {/* FTE Label */}
                  <span className="text-[11px] font-bold font-mono text-slate-700 mb-1">
                    {col.totalFte.toFixed(1)}
                  </span>

                  {/* Bar Container */}
                  <div className="w-full bg-slate-100 rounded-2xs flex flex-col justify-end overflow-hidden h-28 border border-slate-200">
                    <div
                      className={`w-full transition-all rounded-t-2xs ${
                        isPeak
                          ? 'bg-amber-500 group-hover:bg-amber-600'
                          : (col as any).phaseId === 'phase_test_1'
                          ? 'bg-indigo-500 group-hover:bg-indigo-600'
                          : (col as any).phaseId === 'phase_test_2'
                          ? 'bg-blue-500 group-hover:bg-blue-600'
                          : (col as any).phaseId === 'phase_cutover'
                          ? 'bg-emerald-500 group-hover:bg-emerald-600'
                          : 'bg-slate-700 group-hover:bg-slate-800'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Column Label */}
                  <div className="text-center mt-1.5 w-full">
                    <div className="text-[10px] font-bold text-slate-800 truncate" title={col.label || (col as any).phaseName}>
                      {timeMode === 'monthly' ? `M${idx + 1}` : (col as any).phaseCode}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">
                      {timeMode === 'monthly' ? (col as any).primaryPhaseName : `W${(col as any).startWeek}-W${(col as any).endWeek}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Controls & View Toggles Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
        {/* Left: Time & Unit Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time View Mode */}
          <div className="inline-flex rounded-xs border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              id="toggle-time-monthly"
              onClick={() => setTimeMode('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-2xs transition cursor-pointer ${
                timeMode === 'monthly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar Months (M1&ndash;M{months.length})
            </button>
            <button
              id="toggle-time-phase"
              onClick={() => setTimeMode('phase')}
              className={`px-3 py-1.5 text-xs font-bold rounded-2xs transition cursor-pointer ${
                timeMode === 'phase'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Implementation Phases (1&ndash;7)
            </button>
          </div>

          {/* Display Units */}
          <div className="inline-flex rounded-xs border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              id="toggle-display-fte"
              onClick={() => setDisplayMode('fte')}
              className={`px-3 py-1.5 text-xs font-bold rounded-2xs transition cursor-pointer ${
                displayMode === 'fte'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FTEs (Headcount)
            </button>
            <button
              id="toggle-display-hours"
              onClick={() => setDisplayMode('hours')}
              className={`px-3 py-1.5 text-xs font-bold rounded-2xs transition cursor-pointer ${
                displayMode === 'hours'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Effort (Hours)
            </button>
          </div>
        </div>

        {/* Right: Role Stream Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Workstream:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-600 cursor-pointer"
          >
            <option value="all">All Workstreams ({roleProfiles.length} Roles)</option>
            <option value="Strategic">Program Leadership & PMO</option>
            <option value="Functional">Functional Modules ({data.moduleEstimates.length} Modules)</option>
            <option value="Technical">Technical CEMLI / RICEFW (Peak in Build)</option>
            <option value="Data">Data Migration (Mocks 1-3 & Cutover)</option>
            <option value="Testing">Testing & QA (Peak in SIT)</option>
            <option value="Change">Change Management & Training</option>
          </select>
        </div>
      </div>

      {/* 4. The Time-Phased Resource Loading Grid */}
      <div className="border border-slate-200 rounded-sm bg-white shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-slate-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {timeMode === 'monthly' ? 'Month-by-Month Calendar Staffing Matrix' : 'Phase-by-Phase Staffing Matrix'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Values displayed in: <strong className="text-slate-900">{displayMode === 'fte' ? 'Full-Time Equivalents (FTEs)' : 'Total Work Hours'}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 w-72 border-r border-slate-200">
                  Role & Module Track
                </th>
                <th className="py-2.5 px-2.5 text-right w-24">Total Hrs</th>
                {timeMode === 'monthly' ? (
                  months.map(m => (
                    <th key={m.monthIndex} className="py-2.5 px-2 text-right min-w-[70px]">
                      <div>{m.label.split(' ')[0]}</div>
                      <div className="text-[8px] text-slate-400 font-normal font-sans">
                        {m.primaryPhaseName}
                      </div>
                    </th>
                  ))
                ) : (
                  phases.map(p => (
                    <th key={p.id} className="py-2.5 px-2 text-right min-w-[80px]">
                      <div>{p.code}</div>
                      <div className="text-[8px] text-slate-400 font-normal font-sans">
                        {p.durationWeeks} Wks
                      </div>
                    </th>
                  ))
                )}
                <th className="py-2.5 px-2.5 text-right w-20 border-l border-slate-200 bg-slate-100">Avg FTE</th>
                <th className="py-2.5 px-2.5 text-right w-20 bg-slate-100">Peak FTE</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {(Object.entries(groupedProfiles) as [string, PhaseRoleAllocationProfile[]][]).map(([streamName, roles]) => {
                const isExpanded = expandedStreams[streamName] ?? true;
                const streamTotalHours = roles.reduce((acc, r) => acc + r.totalHours, 0);
                const streamAvgFte = streamTotalHours / (projectWeeks * 40);

                return (
                  <React.Fragment key={streamName}>
                    {/* Stream Header Row */}
                    <tr
                      onClick={() => toggleStream(streamName)}
                      className="bg-slate-100/90 hover:bg-slate-200/80 cursor-pointer font-bold transition border-t border-b border-slate-300 select-none"
                    >
                      <td className="py-2 px-3 sticky left-0 bg-slate-100/90 z-10 border-r border-slate-200 flex items-center gap-1.5">
                        {isExpanded ? <ChevronDown size={14} className="text-slate-600" /> : <ChevronRight size={14} className="text-slate-600" />}
                        <span className="text-slate-900 text-xs tracking-wide">{streamName}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">({roles.length} roles)</span>
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-900">
                        {streamTotalHours.toLocaleString()}
                      </td>

                      {/* Stream Monthly / Phase Totals */}
                      {timeMode === 'monthly' ? (
                        monthlyGridData.map(m => {
                          const streamMonthHours = roles.reduce((acc, r) => acc + (m.roleAllocations[r.roleId]?.hours || 0), 0);
                          const streamMonthFte = roles.reduce((acc, r) => acc + (m.roleAllocations[r.roleId]?.fte || 0), 0);
                          return (
                            <td key={m.monthIndex} className="py-2 px-2 text-right font-mono text-slate-900">
                              {displayMode === 'fte' ? streamMonthFte.toFixed(1) : Math.round(streamMonthHours).toLocaleString()}
                            </td>
                          );
                        })
                      ) : (
                        phaseGridData.map(p => {
                          const streamPhaseHours = roles.reduce((acc, r) => acc + (p.roleAllocations[r.roleId]?.hours || 0), 0);
                          const streamPhaseFte = roles.reduce((acc, r) => acc + (p.roleAllocations[r.roleId]?.fte || 0), 0);
                          return (
                            <td key={p.phaseId} className="py-2 px-2 text-right font-mono text-slate-900">
                              {displayMode === 'fte' ? streamPhaseFte.toFixed(1) : Math.round(streamPhaseHours).toLocaleString()}
                            </td>
                          );
                        })
                      )}

                      <td className="py-2 px-2.5 text-right font-mono text-slate-900 border-l border-slate-200 bg-slate-100">
                        {streamAvgFte.toFixed(1)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-900 bg-slate-100">
                        {(streamAvgFte * 1.35).toFixed(1)}
                      </td>
                    </tr>

                    {/* Individual Roles in this Stream */}
                    {isExpanded && roles.map(role => {
                      let rolePeakFte = 0;
                      const avgRoleFte = role.totalHours / (projectWeeks * 40);

                      return (
                        <tr key={role.roleId} className="hover:bg-slate-50/80 transition">
                          <td className="py-2 px-3 pl-7 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800 truncate" title={role.roleName}>
                                {role.roleName}
                              </span>
                              {role.moduleCode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedModuleDetail(selectedModuleDetail === role.moduleCode ? null : role.moduleCode!);
                                  }}
                                  className="text-[9px] font-mono px-1 py-0.2 rounded-2xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold ml-1 shrink-0"
                                  title="View Module Calculation Details"
                                >
                                  {role.moduleCode}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                            {role.totalHours.toLocaleString()}
                          </td>

                          {timeMode === 'monthly' ? (
                            monthlyGridData.map(m => {
                              const alloc = m.roleAllocations[role.roleId] || { hours: 0, fte: 0 };
                              if (alloc.fte > rolePeakFte) rolePeakFte = alloc.fte;
                              const isSubstantial = alloc.fte >= 0.5;

                              return (
                                <td
                                  key={m.monthIndex}
                                  className={`py-2 px-2 text-right font-mono text-xs ${
                                    isSubstantial ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'
                                  }`}
                                >
                                  {displayMode === 'fte'
                                    ? alloc.fte > 0 ? alloc.fte.toFixed(1) : '-'
                                    : alloc.hours > 0 ? Math.round(alloc.hours).toString() : '-'}
                                </td>
                              );
                            })
                          ) : (
                            phaseGridData.map(p => {
                              const alloc = p.roleAllocations[role.roleId] || { hours: 0, fte: 0 };
                              if (alloc.fte > rolePeakFte) rolePeakFte = alloc.fte;
                              const isSubstantial = alloc.fte >= 0.5;

                              return (
                                <td
                                  key={p.phaseId}
                                  className={`py-2 px-2 text-right font-mono text-xs ${
                                    isSubstantial ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'
                                  }`}
                                >
                                  {displayMode === 'fte'
                                    ? alloc.fte > 0 ? alloc.fte.toFixed(1) : '-'
                                    : alloc.hours > 0 ? Math.round(alloc.hours).toString() : '-'}
                                </td>
                              );
                            })
                          )}

                          <td className="py-2 px-2.5 text-right font-mono text-slate-800 border-l border-slate-200 bg-slate-50/50">
                            {avgRoleFte.toFixed(1)}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-slate-800 bg-slate-50/50">
                            {rolePeakFte.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Bottom Total Row */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-950">
                <td className="py-3 px-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                  <div className="uppercase tracking-wider font-extrabold text-amber-400">
                    Total Loaded Squad
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {displayMode === 'fte' ? 'Active Concurrent Headcount' : 'Total Monthly Work Hours'}
                  </div>
                </td>
                <td className="py-3 px-2.5 text-right font-mono text-amber-300 text-sm">
                  {kpiMetrics.totalProgramHours.toLocaleString()}
                </td>

                {timeMode === 'monthly' ? (
                  monthlyGridData.map(m => (
                    <td key={m.monthIndex} className="py-3 px-2 text-right font-mono text-white font-bold">
                      {displayMode === 'fte' ? m.totalFte.toFixed(1) : Math.round(m.totalHours).toLocaleString()}
                    </td>
                  ))
                ) : (
                  phaseGridData.map(p => (
                    <td key={p.phaseId} className="py-3 px-2 text-right font-mono text-white font-bold">
                      {displayMode === 'fte' ? p.totalFte.toFixed(1) : Math.round(p.totalHours).toLocaleString()}
                    </td>
                  ))
                )}

                <td className="py-3 px-2.5 text-right font-mono text-amber-300 border-l border-slate-800 bg-slate-950">
                  {kpiMetrics.avgFte.toFixed(1)}
                </td>
                <td className="py-3 px-2.5 text-right font-mono text-amber-300 bg-slate-950">
                  {kpiMetrics.peakMonthFte.toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Module-Wise Effort Inspector (Shows exact module effort derivation) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={15} className="text-indigo-600" />
              Module-Wise Effort Derivation ({data.moduleEstimates.length} Selected Modules)
            </h3>
            <p className="text-[11px] text-slate-600">
              Each module&apos;s functional effort feeds directly into the resource loading matrix without arbitrary industry templates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {data.moduleEstimates.map(mod => {
            const hours = Math.round(mod.finalP80Hours || mod.finalP50Hours);
            const isSelected = selectedModuleDetail === mod.moduleId;
            const pctOfTotal = ((hours / Math.max(1, kpiMetrics.totalProgramHours)) * 100).toFixed(1);

            return (
              <div
                key={mod.moduleId}
                onClick={() => setSelectedModuleDetail(isSelected ? null : mod.moduleId)}
                className={`p-3 rounded-xs border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                    : 'bg-white hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-2xs font-bold bg-slate-100 text-slate-700">
                    {mod.pillar}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 font-mono">
                    {pctOfTotal}% of scope
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs mt-1 truncate" title={mod.moduleName}>
                  {mod.moduleName}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-xs">
                  <span className="font-mono font-bold text-slate-800">
                    {hours.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">hrs</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {(hours / (projectWeeks * 40)).toFixed(1)} avg FTE
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Module Detail Breakdown */}
        {selectedModuleDetail && (() => {
          const mod = data.moduleEstimates.find(m => m.moduleId === selectedModuleDetail);
          if (!mod) return null;
          const hours = Math.round(mod.finalP80Hours || mod.finalP50Hours);

          return (
            <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Info size={14} className="text-indigo-600" />
                  Phase Breakdown for {mod.moduleName} ({hours.toLocaleString()} Scope Hours)
                </span>
                <button
                  onClick={() => setSelectedModuleDetail(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  &times; Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                {phases.map(ph => {
                  const pct = ph.id === 'phase_enablement' ? 0.03
                    : ph.id === 'phase_design' ? 0.32
                    : ph.id === 'phase_build' ? 0.32
                    : ph.id === 'phase_test_1' ? 0.14
                    : ph.id === 'phase_test_2' ? 0.14
                    : ph.id === 'phase_cutover' ? 0.03 : 0.02;

                  const phHours = Math.round(hours * pct);
                  const phFte = ph.durationWeeks > 0 ? (phHours / (ph.durationWeeks * 40)).toFixed(1) : '0.0';

                  return (
                    <div key={ph.id} className="p-2 rounded-2xs bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[9px] font-bold uppercase text-slate-500">{ph.code}</div>
                      <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">{phHours} hrs</div>
                      <div className="text-[10px] text-indigo-600 font-mono font-semibold">{phFte} FTE</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
