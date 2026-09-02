import { ProjectScenario, CalculatedProjectData } from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';
import { DEFAULT_TECHNICAL_INTEGRATIONS } from '../data/technicalScopingData';

/**
 * Oracle Cloud Project Plan Generation Standard (v1.0)
 * Proposal-Aligned WBS & Master PMO Schedule Engine
 * 
 * Generates all 30 specification columns strictly in order:
 * 1. Task Name
 * 2. ASSIGNED TO ROLE
 * 3. Status
 * 4. Start Date
 * 5. End Date
 * 6. Task Progress
 * 7. Predecessors
 * 8. Duration
 * 9. Type
 * 10. Workstream
 * 11. Comments
 * 12. Allocation
 * 13. LEVEL-ID
 * 14. Complete
 * 15. TASK_NUMBER
 * 16. CATEGORY
 * 17. WBS-ID
 * 18. TEMPLATE-ID
 * 19. Parent WBS ID
 * 20. Wave
 * 21. Phase
 * 22. Sub-Phase
 * 23. Domain
 * 24. Module Code
 * 25. Module Name
 * 26. Component ID
 * 27. Component Name
 * 28. Schedule Method
 * 29. Anomaly Flag
 * 30. Anomaly Reason
 */

export interface SmartsheetRow30 {
  taskName: string;
  assignedToRole: string;
  status: 'NOT STARTED' | 'IN PROGRESS' | 'READY FOR GATE' | 'COMPLETE' | 'BASELINE LOCKED';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  taskProgress: 'GREEN' | 'AMBER' | 'RED' | 'COMPLETE';
  predecessors: string;
  duration: string; // e.g. "10d"
  type: 'Wave' | 'Phase' | 'Sub-Phase' | 'Activity' | 'Deliverable' | 'Milestone' | 'Gate' | 'Workshop' | 'Internal Activity' | 'Internal Deliverable' | 'Template' | 'Internal Template' | 'Client Activity' | 'Client Deliverable';
  workstream: string;
  comments: string;
  allocation: string;
  levelId: number; // 1 to 6
  complete: number; // 0 to 100
  taskNumber: number;
  category: string;
  wbsId: string;
  templateId: string;
  parentWbsId: string;
  wave: string;
  phase: string;
  subPhase: string;
  domain: string;
  moduleCode: string;
  moduleName: string;
  componentId: string;
  componentName: string;
  scheduleMethod: string;
  anomalyFlag: 'NONE' | 'TASK_START_BEFORE_SUBPHASE' | 'TASK_END_AFTER_SUBPHASE' | 'BOTH';
  anomalyReason: string;
}

export interface WbsPlanSummary {
  programStartDate: string;
  programEndDate: string;
  requestedTenureMonths: number;
  generatedTenureDays: number;
  tenureGapDays: number;
  numberOfIncludedWaves: number;
  totalGeneratedRows: number;
  validationStatus: 'VALID' | 'WARNINGS' | 'BLOCKED';
  validationMessages: {
    severity: 'INFO' | 'WARNING' | 'ERROR';
    ruleId: string;
    message: string;
    affectedTaskIdOrWaveId: string;
    suggestedCorrection: string;
  }[];
}

export interface StandardProjectPlanOutput {
  planSummary: WbsPlanSummary;
  smartsheetRows: SmartsheetRow30[];
  waves: {
    waveId: string;
    waveName: string;
    startDate: string;
    endDate: string;
    durationWorkingDays: number;
    phases: {
      phaseName: string;
      startDate: string;
      endDate: string;
      subPhases: {
        subPhaseName: string;
        startDate: string;
        endDate: string;
        weightPct: number;
      }[];
    }[];
  }[];
}

// Working calendar helpers (Monday to Friday)
export function normalizeToMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  if (day === 1) return dateStr;
  
  const diff = day === 0 ? 1 : 8 - day; // Move forward to next Monday
  const monday = new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
  return monday.toISOString().split('T')[0];
}

export function addWorkingDays(startDateStr: string, workingDays: number): string {
  if (workingDays <= 0) return startDateStr;
  const d = new Date(startDateStr + 'T00:00:00');
  let added = 0;
  
  while (added < workingDays) {
    d.setDate(d.getDate() + 1);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return d.toISOString().split('T')[0];
}

export function getWorkingDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (end < start) return 0;
  
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export interface StandardPlanCustomOptions {
  projectName?: string;
  programStartDate?: string;
  wave0Weeks?: number;
  postEdWaves?: {
    waveId: string;
    waveName: string;
    durationWeeks: number;
    modules: string[];
    domain?: string;
    scheduleAdjustmentType?: 'NONE' | 'START_EARLY' | 'START_LATE';
    scheduleAdjustmentWeeks?: number;
  }[];
  technicalComponents?: {
    integrationsCount?: number;
    reportsCount?: number;
    conversionObjects?: string[];
    extensionsCount?: number;
  };
}

/**
 * Raw Template Definition for Master Proposal Catalog Items
 */
interface ProposalCatalogItem {
  planLine: string;
  role: string;
  level: number;
  category: string;
  workstream?: string;
  type?: SmartsheetRow30['type'];
  templateId?: string;
  comments?: string;
  durationDays?: number;
}

/**
 * Master Proposal Activity Catalog (Extracted from Proposal Spec)
 */
const PROPOSAL_WAVE0_MOBILIZE_KICKOFF: ProposalCatalogItem[] = [
  { planLine: 'Sales to Delivery Handover', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Review & Finalise Initial Resource Plan', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Verify availability of approved RFP / PO to start project', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Review Scope and Financials (Revenues & Margins)', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Proposal Review (Scope & Solution Overview / Schedule)', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Finalise initial Milestone Dates with Client', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'TDW Review (Scope/Schedule/Risks/Dependencies)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Review Commercial Deliverables with Delivery Team & Client Teams', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Align with Tech Track Lead on OPAx / OPAv / assumptions etc.', role: 'Program Solution Architect', level: 5, category: 'Internal Activity' },
  { planLine: 'Re-Baseline Project Financials (if applicable)', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Re-confirm Capgemini PM roles & responsibilities', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Recorded Sessions & News-letter distribution (Internal On-Boardable)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Document Project specific Governance Framework (Charter, terms, assumptions, etc.)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Guideline for Instance access and login credentials for project team', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Guidelines for internal storage (GDrive / Box)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Setup communications (e.g. guidelines on protocols, raised camera etc. for team)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Identify "Mentor" role responsible on-boarding (buddy)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Finalise on-boarded Capgemini resources', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Finalise list of partners on the program (Capgemini, 3rd Party, Client)', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Conduct internal Kick-off meeting', role: 'Engagement Manager', level: 4, category: 'Internal Activity' },
  { planLine: 'Formalise Internal Partner Engagement', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Procure required tools / applications for other partners (JIRA/GBS/IDEAL + ATE)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Setup GPS+ WBS as applicable', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Set-up SCW1 as applicable', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Setup Project in GPS', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'G-Monitoring Setup', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Setup and access of Smartsheet', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Engage 5th/8th Rapid Start Team', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Review Project Demand in Fieldglass / Beeline', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Demand Creation', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Review & Align project demands', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Resource Allocation', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Set-up Communication CEL for Capgemini team', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Set-up Communication Channel for Program (INTERNAL) TEAMS Channel', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Asset Setup (Client Side)', role: 'PMO Lead', level: 4, category: 'Activity' },
  { planLine: 'Asset Setup for Capgemini Team (Capgemini Client)', role: 'PMO Lead', level: 5, category: 'Internal Activity' },
  { planLine: 'Establish PMO / Governance Charter', role: 'PMO Lead', level: 4, category: 'Activity' },
  { planLine: 'Templates Identification / Finalization / Socialisation with Business and Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Project Charter', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Project Organization Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Project Scope - Slide', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Project Objectives & KPIs - Slide', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Project Org Chart - Slide', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Roles & Responsibilities Summary - Slide', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Project Plan (Smartsheet)', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Staffing Plan (High Level Plan)', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Issue Log & Risk Management Plan (RAID)', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'RAID Log - Slide', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Change Management Template', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Team Holiday Calendar - Slide', role: 'PMO Lead', level: 5, category: 'Template' },
  { planLine: 'Risk & Issue Management Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Steering Committee Deck', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Status Reporting Deck', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Client onboarding Deck / Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Walkthrough Standard Exit Criteria for Project Phases (Stage Gates)', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Walkthrough Standard Deliverable Templates across Phases (Folder Structure, Naming Conv., Etc.)', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'ICT - Capgemini Hybrid Agile Methodology', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Walkthrough Communication Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Communication Plan Template', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Standard Deliverables Templates (Capgemini Internal)', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Project Governance Plan', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Quality Assurance & Peer Review', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Weekly Time Writing Guideline', role: 'PMO Lead', level: 5, category: 'Internal Template' },
  { planLine: 'PM Report Deck', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Project RACI (Capgemini Internal)', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Financial Burn Report (Effort Burn, Budget vs. Actual, Invoicing)', role: 'Engagement Manager', level: 5, category: 'Internal Template' },
  { planLine: 'Defect Management Deck', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Tools Assessment, Finalization, Procurement & Setup', role: 'PMO Lead', level: 4, category: 'Activity' },
  { planLine: 'JIRA Tool Setup & Workflow Configuration', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Smartsheet (if Applicable - Client Side)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'TRAMS (if Applicable - Client Side)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'MS Project (if Applicable - Client Side)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Config Snapshot (if Applicable - Client Side)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'OUM Quick Start (if Applicable - Capgemini)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Data Migration Tool (if Applicable - Client Side)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Testing Tool (if Applicable - Client Side)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Oracle Cloud Demo Instance Availability', role: 'PMO Lead', level: 4, category: 'Activity' },
  { planLine: 'Initiate Project Start Up Stage Gate', role: 'PMO Lead', level: 4, category: 'Gate' },
  { planLine: 'Draft Project Plan in Smartsheet', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Complete Project Plan', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Baseline 0.0 of Project Plan in Smartsheet', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Weekly WSR', role: 'PMO Lead', level: 5, category: 'Deliverable' },
  { planLine: 'Prepare and Publish WSR agenda, Setup WSR Meeting, Publish WSR 24 hrs in advance', role: 'PMO Lead', level: 6, category: 'Activity' },
  { planLine: 'Mobilization Status Summary', role: 'PMO Lead', level: 6, category: 'Deliverable' },
  { planLine: 'Weekly Action Items Log', role: 'PMO Lead', level: 6, category: 'Deliverable' },
  { planLine: 'Update and Publish Action Items', role: 'PMO Lead', level: 6, category: 'Activity' },
  { planLine: 'Initiate OH log on weekly basis in WSR without Financials', role: 'PMO Lead', level: 6, category: 'Deliverable' },
  { planLine: 'Publish Next Week Key Priorities', role: 'Engagement Manager', level: 6, category: 'Activity' },
  { planLine: 'Initiate Steerco with Client Exec Team', role: 'Engagement Manager', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Steerco Members', role: 'Engagement Manager', level: 5, category: 'Activity' },
  { planLine: 'Publish Steerco Deck and Conduct Meeting', role: 'Engagement Manager', level: 5, category: 'Activity' },
  { planLine: 'Publish Steerco Mom and Action Items', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Finalise & Publish Invoicing & Approvals Process with Client (Client Side)', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Review OR Approval Template / Process for CPs', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Setup Monthly Delivery Health Review Meeting (DHR)', role: 'Engagement Manager', level: 4, category: 'Internal Activity' },
  { planLine: 'Project Governance Setup (Capgemini Internal)', role: 'Engagement Manager', level: 4, category: 'Internal Activity' },
  { planLine: 'Review Overall Project Status', role: 'Engagement Manager', level: 5, category: 'Internal Activity' },
  { planLine: 'Publish Monthly CM analysis', role: 'Engagement Manager', level: 5, category: 'Internal Deliverable' }
];

const PROPOSAL_WAVE0_MOBILIZE_CORE: ProposalCatalogItem[] = [
  { planLine: 'Core Team Onboarding / Mobilisation', role: 'PMO Lead', level: 4, category: 'Activity' },
  { planLine: 'Resource Allocation - Core Team', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Enable Accesses at Capgemini End (E.g. TRAMS Folders, ICT project etc.)', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Onboarding Training through Success Factors', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Onboarding Training through Account Academy', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Account Overview', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Capgemini Core Team Kick-Off', role: 'PMO Lead', level: 4, category: 'Activity' }
];

const PROPOSAL_WAVE0_MOBILIZE_BUSINESS: ProposalCatalogItem[] = [
  { planLine: 'Client Business Onboarding / Mobilisation', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Client Kick-Off Meetings', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Resource Mobilisation Plan (Leverage Standard Template)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Include client as-is & to-be resource requirements / involvement required in various phases or activities', role: 'Engagement Manager', level: 6, category: 'Deliverable' },
  { planLine: 'Include slide on assets / tools / licenses to be procured by client and lead time', role: 'Engagement Manager', level: 6, category: 'Deliverable' },
  { planLine: 'Identify key business stakeholders for Mobilization (Steerco, Core Team, Client OCM)', role: 'Engagement Manager', level: 5, category: 'Activity' },
  { planLine: 'Finalise Kick-Off Meeting Logistics (Attendees, Room)', role: 'Engagement Manager', level: 5, category: 'Activity' },
  { planLine: 'Prepare Kick-Off Meeting Slide Deck (Draft Agenda, Team, Timetable)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Conduct Client Kick-Off Meeting & Share Deck, Minutes of Meeting', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Finalise Client core team and their roles & responsibilities (Alignment)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Conduct Client Functional Track Leads & Capgemini Kick-Off Meeting & Share Deck, Minutes of Meeting', role: 'Engagement Manager', level: 5, category: 'Client Activity' },
  { planLine: 'Conduct any additional Kick-Off Meetings at Client End (E.g. Data Team etc.) & Share Deck, Minutes', role: 'Engagement Manager', level: 5, category: 'Client Activity' },
  { planLine: 'Project Governance Presentation', role: 'Engagement Manager', level: 4, category: 'Deliverable' },
  { planLine: 'RACI Stakeholder Map (Leverage Standard Template)', role: 'PMO Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Program RACI for Core Team Roles', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Document in email with all stakeholders (Business / IT / Executive Team)', role: 'Engagement Manager', level: 5, category: 'Activity' },
  { planLine: 'Project Onboarding & Ways of Working Presentation', role: 'Engagement Manager', level: 4, category: 'Deliverable' },
  { planLine: 'Walkthrough Project Plan (Smartsheet)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Walkthrough Entry / Exit Criteria for Project Phases (Stage Gates)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Walkthrough Standard Deliverable Templates across Phases (Folder Structure, Naming Conv., Etc.)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Walkthrough ICT - Capgemini Hybrid Agile Methodology', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Walkthrough Communication Plan', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Ways of Working Signed-Off Slide', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
];

const PROPOSAL_WAVE0_ED_FOUNDATION: ProposalCatalogItem[] = [
  { planLine: 'ENTERPRISE DESIGN - Daily Flash', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'IDT - (Daily Flash - IDT - DP)', role: 'Engagement Manager', level: 6, category: 'Template' },
  { planLine: 'IDT - (Daily Flash - IDT - OPAv)', role: 'Engagement Manager', level: 6, category: 'Template' },
  { planLine: 'Key Design Decisions (KDD)', role: 'Program Solution Architect', level: 5, category: 'Template' },
  { planLine: 'Gap Tracker / Decision', role: 'Program Solution Architect', level: 5, category: 'Template' },
  { planLine: 'Configuration Tracker', role: 'Technical Track Lead', level: 5, category: 'Template' },
  { planLine: 'Enterprise Structure (COA etc.)', role: 'Program Solution Architect', level: 5, category: 'Template' },
  { planLine: 'Report Functional Specification', role: 'Program Solution Architect', level: 5, category: 'Template' },
  { planLine: 'Requirements Traceability Matrix (RTM)', role: 'Program Solution Architect', level: 5, category: 'Template' },
  { planLine: 'Foundation Design', role: 'Program Solution Architect', level: 4, category: 'Activity' },
  { planLine: 'Additional WBS Ideas for ED Execution', role: 'PMO Lead', level: 5, category: 'Activity' },
  { planLine: 'Foundation Design Workshop', role: 'Program Solution Architect', level: 5, category: 'Workshops' },
  { planLine: 'Enterprise Design Strategy', role: 'Program Solution Architect', level: 4, category: 'Deliverable' },
  { planLine: 'Business Process Flows', role: 'Functional Track Lead', level: 5, category: 'Template' },
  { planLine: 'Integration Strategy', role: 'Technical Track Lead', level: 5, category: 'Template' },
  { planLine: 'Technical Architecture Strategy', role: 'Technical Track Lead', level: 5, category: 'Template' },
  { planLine: 'Report Strategy', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
  { planLine: 'Finalized list of Reports', role: 'Technical Track Lead', level: 5, category: 'Deliverable' },
  { planLine: 'Extensions Strategy', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
  { planLine: 'Finalized list of Extensions', role: 'Technical Workstream Lead', level: 5, category: 'Deliverable' },
  { planLine: 'Data Strategy', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
  { planLine: 'Finalized list of Conversions', role: 'Technical Workstream Lead', level: 5, category: 'Deliverable' },
  { planLine: 'Conversion Status Tracker', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
  { planLine: 'Security Strategy', role: 'Functional Track Lead', level: 5, category: 'Template' },
  { planLine: 'UAM (User Accessibility Matrix)', role: 'Functional Track Lead', level: 5, category: 'Template' },
  { planLine: 'Testing Strategy', role: 'QA & Test Lead', level: 5, category: 'Template' },
  { planLine: 'Environment Management Plan', role: 'Program Technical Architect', level: 5, category: 'Template' },
  { planLine: 'OCM Strategy', role: 'OCM Lead', level: 5, category: 'Template' },
  { planLine: 'Stakeholder Analysis / RACI', role: 'OCM Lead', level: 5, category: 'Template' },
  { planLine: 'Agile Readiness & Maturity Assessment for clients', role: 'OCM Lead', level: 5, category: 'Template' },
  { planLine: 'Client Core Team Enablement Training (Oracle Recorded Session)', role: 'Oracle Lead Instructor', level: 5, category: 'Template' },
  { planLine: 'Knowledge Transition & Handover Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
  { planLine: 'Integrations Tracker', role: 'Technical Track Lead', level: 5, category: 'Template' },
  { planLine: 'Reports Tracker', role: 'Technical Track Lead', level: 5, category: 'Template' },
  { planLine: 'Extensions Tracker', role: 'Technical Track Lead', level: 5, category: 'Template' },
  { planLine: 'Re-confirm Capgemini PMO (Integrations)', role: 'Technical Workstream Lead', level: 5, category: 'Internal Activity' }
];

const PROPOSAL_WAVE0_ED_WORKSTREAM: ProposalCatalogItem[] = [
  { planLine: 'Kick-Off ED Workshops', role: 'Engagement Manager', level: 4, category: 'Activity' },
  { planLine: 'Include Client as-is & to-be resource requirements / involvement required in phase', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Finalise ED Workshop Schedule (To be tracked in ICT)', role: 'Functional Track Lead', level: 5, category: 'Deliverable' },
  { planLine: 'Include Client Track Leads & Project Managers to finalise schedule', role: 'Engagement Manager', level: 6, category: 'Activity' },
  { planLine: 'Setup Workshop Meeting Requests', role: 'PMO Consultant', level: 5, category: 'Internal Deliverable' },
  { planLine: 'Additional WBS Ideas for ED Execution (More Stories to Backlog)', role: 'Functional Track Lead', level: 5, category: 'Activity' },
  { planLine: 'Prepare and Publish WSR including add-on slides for ED', role: 'Engagement Manager', level: 5, category: 'Activity' },
  { planLine: 'Update Daily Flash Format for ED', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Identifying Daily Flash Recipients', role: 'Engagement Manager', level: 6, category: 'Activity' },
  { planLine: 'Include in flash only percentage of stories required / completed', role: 'Functional Track Lead', level: 6, category: 'Activity' },
  { planLine: 'Conduct Functional Workshops - Architecture & Scoping', role: 'Program Technical Architect', level: 4, category: 'Workshops' },
  { planLine: 'Finalise License, Sizing & Testing Requirements (with drop-dead-date)', role: 'Program Technical Architect', level: 5, category: 'Deliverable' },
  { planLine: 'Reminders for Accesses required to conversions peripheral systems etc. (if applicable)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
  { planLine: 'Reminders for Accesses required to integrations peripheral systems etc. (if applicable)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
  { planLine: 'Oracle Cloud Instance Availability Demo', role: 'Technical Workstream Lead', level: 4, category: 'Client Deliverable' },
  { planLine: 'Conduct Functional Workshops - Process Blueprinting', role: 'Functional Track Lead', level: 4, category: 'Workshops' },
  { planLine: 'Process Area Alignment - Business Blueprint Review', role: 'Functional Track Lead', level: 4, category: 'Workshops' },
  { planLine: 'List of Epics (Functional Epics Inventory)', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Epics Backlog (Strategy, User Story Backlog, Solution gaps)', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Overall Solution Architecture', role: 'Program Solution Architect', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Enterprise Structure / Org Structure / Inventory Org - (Based on Mandate)', role: 'Program Solution Architect', level: 5, category: 'Deliverable' },
  { planLine: 'Finalise KDDs (Key Design Decisions)', role: 'Program Solution Architect', level: 5, category: 'Deliverable' },
  { planLine: 'Finalise Personas', role: 'Program Solution Architect', level: 5, category: 'Deliverable' },
  { planLine: 'Finalise Business Process Flows (L2/L3)', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Maintain Solution Gap Tracker', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Update Epics Backlog through Workshops (Process Flows, User Story Backlog, Solution gaps)', role: 'Functional Track Lead', level: 4, category: 'Activity' },
  { planLine: 'Conduct Security Workshops', role: 'Technical Track Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise Security Strategy', role: 'Technical Track Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Security Roles Matrix (UAM)', role: 'Technical Track Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Security Design Readout Workshop (Strategy, UAM)', role: 'Technical Track Lead', level: 4, category: 'Workshops' },
  { planLine: 'Conduct Integration Workshops', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise Integration Strategy', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise List of Integrations', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Create Integrations Story Backlog', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'List of Integrations (Integration Feeds Portfolio)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Integration Design Readout Workshop (Strategy, Integration List, User Story Backlog)', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Document Integration Strategy Document (Publish "Final Integration Strategy" & set perimeter)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Conduct Reports Workshops', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise Reports Strategy', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise List of Reports', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Create Reports Story Backlog', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'List of Reports (BI Publisher / OTBI Inventory)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Reports Design Readout Workshop (Strategy, Report List, User Story Backlog)', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Document Reports Strategy Document (Publish "Final Reports Strategy" & set perimeter)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Conduct Conversion Workshops', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise List of Conversion Objects', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Conversion Strategy Document (Publish "Final Strategy", Conversion Object List)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Include all peripheral tools/3P/DCS and strobe "Finalize all MC2 Conversion" to set perimeter', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Conduct Extensions Workshops', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise List of Extensions', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Extensions Design Readout Workshop (Strategy, Extension List, User Story Backlog)', role: 'Technical Workstream Lead', level: 4, category: 'Workshops' },
  { planLine: 'Document Extensions Strategy Document (Publish "Final Extensions Strategy" & set perimeter)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Conduct Testing Workshops', role: 'Test Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise Testing Strategy', role: 'Test Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Finalise Tool for Testing (TB of logs)', role: 'Test Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Testing Strategy Readout Workshop', role: 'Test Lead', level: 4, category: 'Workshops' },
  { planLine: 'Conduct OCM Workshops', role: 'OCM Lead', level: 4, category: 'Workshops' },
  { planLine: 'Finalise Stakeholder Analysis - RACI', role: 'OCM Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Discuss User Training Strategy', role: 'OCM Lead', level: 5, category: 'Client Deliverable' },
  { planLine: 'Finalise Training Delivery Model (Live/Recorded Session)', role: 'OCM Lead', level: 5, category: 'Client Deliverable' },
  { planLine: 'OCM Readiness Assessment', role: 'OCM Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Agile Readiness & Maturity Assessment for Client', role: 'OCM Lead', level: 4, category: 'Deliverable' },
  { planLine: 'Client Core Team Enablement Training (Oracle Recorded Session)', role: 'Oracle Lead Instructor', level: 4, category: 'Deliverable' },
  { planLine: 'Basic OCM Strategy Document', role: 'OCM Lead', level: 4, category: 'Deliverable' },
  { planLine: 'OCM Strategy Readout (Strategy, Agile Readiness)', role: 'OCM Lead', level: 4, category: 'Workshops' },
  { planLine: 'Enterprise Design Stage Gate', role: 'Engagement Manager', level: 4, category: 'Gate' },
  { planLine: 'Initiate Enterprise Design Stage Gate Approval', role: 'Engagement Manager', level: 5, category: 'Gate' }
];

const PROPOSAL_WAVE0_ED_REBASELINE: ProposalCatalogItem[] = [
  { planLine: 'Re-Baseline Project (Smartsheet)', role: 'Engagement Manager', level: 4, category: 'Deliverable' },
  { planLine: 'Re-Estimate Project (including approved CRs)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Re-Baseline the Plan for Remaining Phases', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Submit Change Request (if applicable)', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
  { planLine: 'Review and obtain approvals for CRs (Commercial Impacts / Plan)', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
];

/**
 * Core Standard Engine: Generates the 30-Column Smartsheet Plan
 * Aligned strictly with the Proposal Plan Structure & Master Table Specification
 */
export function generateStandardProjectPlan(
  scenario: ProjectScenario,
  data?: CalculatedProjectData,
  customOptions?: StandardPlanCustomOptions
): StandardProjectPlanOutput {
  const validationMessages: WbsPlanSummary['validationMessages'] = [];

  // 1. Validate & Normalize Program Inputs
  const rawStartDate = customOptions?.programStartDate || scenario.targetStartDate || '2026-10-05';
  const programStartDate = normalizeToMonday(rawStartDate);
  if (rawStartDate !== programStartDate) {
    validationMessages.push({
      severity: 'INFO',
      ruleId: 'START_DATE_NORMALIZED',
      message: `Program start date ${rawStartDate} normalized to Monday ${programStartDate} per proposal calendar policy.`,
      affectedTaskIdOrWaveId: 'WAVE-0',
      suggestedCorrection: 'Calendar normalization applied automatically.'
    });
  }

  const wave0Weeks = customOptions?.wave0Weeks ?? (scenario.projectWeeks ? Math.max(8, Math.min(14, Math.round(scenario.projectWeeks * 0.28))) : 10);
  
  // Wave configurations
  const configuredPostEdWaves = customOptions?.postEdWaves || (
    scenario.rolloutWaves && scenario.rolloutWaves > 1
      ? [
          {
            waveId: 'WAVE-1',
            waveName: 'Wave 1: Financials & Procurement',
            durationWeeks: 24,
            modules: ['erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_cm', 'erp_po', 'erp_exp'],
            domain: 'ERP'
          },
          {
            waveId: 'WAVE-2',
            waveName: 'Wave 2: Supply Chain & Manufacturing',
            durationWeeks: 20,
            modules: ['scm_om', 'scm_inv', 'scm_mfg', 'scm_cst'],
            domain: 'SCM'
          }
        ]
      : [
          {
            waveId: 'WAVE-1',
            waveName: 'Wave 1: Core Implementation & Deployment',
            durationWeeks: Math.max(16, (scenario.projectWeeks || 38) - wave0Weeks),
            modules: scenario.selectedModules || ['erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_cm', 'erp_po', 'erp_exp'],
            domain: 'ERP'
          }
        ]
  );

  const sitRounds = scenario.scaleDrivers?.test_sit_cycles || 2;
  const uatRounds = scenario.scaleDrivers?.test_uat_cycles || 1;

  // 2. Generate Wave Schedule
  const wave0Start = programStartDate;
  const wave0WorkingDays = wave0Weeks * 5;
  const wave0End = addWorkingDays(wave0Start, wave0WorkingDays - 1);

  // Sub-phase distributions
  const wave0Subphases = [
    // MOBILIZE Phase
    { phase: 'MOBILIZE', name: 'KICK-OFF ACTIVITIES', pct: 15, role: 'PMO Lead', workstream: 'GOVERNANCE' },
    { phase: 'MOBILIZE', name: 'TEAM MOBILIZATION (CORE)', pct: 10, role: 'PMO Lead', workstream: 'PMO' },
    { phase: 'MOBILIZE', name: 'BUSINESS ONBOARDING', pct: 10, role: 'Engagement Manager', workstream: 'OCM' },
    // ENTERPRISE DESIGN Phase
    { phase: 'ENTERPRISE DESIGN', name: 'FOUNDATION DESIGN', pct: 15, role: 'Program Solution Architect', workstream: 'ARCHITECTURE' },
    { phase: 'ENTERPRISE DESIGN', name: 'WORKSTREAM DESIGN', pct: 45, role: 'Functional Track Lead', workstream: 'FINANCIALS' },
    { phase: 'ENTERPRISE DESIGN', name: 'RE-BASELINE PROJECT', pct: 5, role: 'Engagement Manager', workstream: 'PMO' }
  ];

  const postEdSubphasesTemplate = [
    // TRANSFORM - DETAILED DESIGN
    { phase: 'TRANSFORM - DETAILED DESIGN', name: 'TEAM MOBILIZATION (WAVE)', pct: 4, role: 'Engagement Manager', workstream: 'PMO' },
    { phase: 'TRANSFORM - DETAILED DESIGN', name: 'DESIGN DOCUMENTATION', pct: 11, role: 'Program Solution Architect', workstream: 'ARCHITECTURE' },
    // TRANSFORM - BUILD
    { phase: 'TRANSFORM - BUILD', name: 'BUILD PLANNING', pct: 5, role: 'Engagement Manager', workstream: 'PMO' },
    { phase: 'TRANSFORM - BUILD', name: 'BUILD PREPARATION', pct: 5, role: 'Program Technical Architect', workstream: 'ARCHITECTURE' },
    { phase: 'TRANSFORM - BUILD', name: 'BUILD EXECUTION', pct: 50, role: 'Technical Consultant', workstream: 'TECHNICAL' },
    // VALIDATE - SIT
    { phase: 'VALIDATE - SIT', name: 'SIT PLANNING', pct: 5, role: 'Engagement Manager', workstream: 'TESTING' },
    { phase: 'VALIDATE - SIT', name: 'SIT PREPARATION', pct: 5, role: 'Program Technical Architect', workstream: 'TESTING' },
    { phase: 'VALIDATE - SIT', name: 'SIT EXECUTION', pct: 11, role: 'Test Lead', workstream: 'TESTING' },
    // VALIDATE - UAT
    { phase: 'VALIDATE - UAT', name: 'UAT PLANNING', pct: 5, role: 'Engagement Manager', workstream: 'TESTING' },
    { phase: 'VALIDATE - UAT', name: 'UAT PREPARATION', pct: 5, role: 'Program Technical Architect', workstream: 'DATA' },
    { phase: 'VALIDATE - UAT', name: 'UAT EXECUTION', pct: 11, role: 'Functional Track Lead', workstream: 'TESTING' },
    // DEPLOY
    { phase: 'DEPLOY', name: 'CUTOVER PLANNING', pct: 4, role: 'Engagement Manager', workstream: 'DEPLOYMENT' },
    { phase: 'DEPLOY', name: 'CUTOVER PREPARATION', pct: 3, role: 'Program Technical Architect', workstream: 'DEPLOYMENT' },
    { phase: 'DEPLOY', name: 'CUTOVER EXECUTION', pct: 5, role: 'Technical Workstream Lead', workstream: 'DEPLOYMENT' },
    { phase: 'DEPLOY', name: 'HYPERCARE PLANNING', pct: 3, role: 'Engagement Manager', workstream: 'HYPERCARE' },
    { phase: 'DEPLOY', name: 'HYPERCARE PREPARATION', pct: 3, role: 'Engagement Manager', workstream: 'HYPERCARE' },
    { phase: 'DEPLOY', name: 'HYPERCARE EXECUTION', pct: 10, role: 'Functional Track Lead', workstream: 'HYPERCARE' },
    { phase: 'DEPLOY', name: 'TRANSITION PLANNING', pct: 2, role: 'Engagement Manager', workstream: 'TRANSITION' },
    { phase: 'DEPLOY', name: 'TRANSITION TO RUN TEAM', pct: 4, role: 'Technical Track Lead', workstream: 'TRANSITION' }
  ];

  // Calculate dates for Wave 0 Sub-phases
  let currentWave0Offset = 0;
  const calculatedWave0Subphases = wave0Subphases.map(sp => {
    const days = Math.max(3, Math.round((sp.pct / 100) * wave0WorkingDays));
    const start = addWorkingDays(wave0Start, currentWave0Offset);
    const end = addWorkingDays(start, days - 1);
    currentWave0Offset += Math.round(days * 0.65); // standard delivery overlap
    return { ...sp, startDate: start, endDate: end, days };
  });

  // Calculate dates for each Post-ED wave
  let priorWaveEnd = wave0End;
  const calculatedWaves = configuredPostEdWaves.map((waveConfig) => {
    const waveStart = addWorkingDays(priorWaveEnd, 1);
    const waveWorkingDays = waveConfig.durationWeeks * 5;
    const waveEnd = addWorkingDays(waveStart, waveWorkingDays - 1);
    priorWaveEnd = waveEnd;

    let offset = 0;
    const waveSubphases = postEdSubphasesTemplate.map(sp => {
      const days = Math.max(3, Math.round((sp.pct / 100) * waveWorkingDays));
      const start = addWorkingDays(waveStart, offset);
      const end = addWorkingDays(start, days - 1);
      offset += Math.round(days * 0.55);
      return { ...sp, startDate: start, endDate: end, days };
    });

    return {
      ...waveConfig,
      waveStart,
      waveEnd,
      waveWorkingDays,
      waveSubphases
    };
  });

  const finalProgramEnd = calculatedWaves.length > 0 ? calculatedWaves[calculatedWaves.length - 1].waveEnd : wave0End;
  const generatedTenureDays = getWorkingDaysBetween(programStartDate, finalProgramEnd);
  const totalWeeks = Math.ceil(generatedTenureDays / 5);
  const requestedTenureMonths = Math.round(totalWeeks / 4.33);

  // 4. Generate all 30-Column WBS Rows
  const rows: SmartsheetRow30[] = [];
  let taskCounter = 1;

  const addRow = (row: Omit<SmartsheetRow30, 'taskNumber' | 'complete' | 'status' | 'taskProgress' | 'anomalyFlag' | 'anomalyReason'> & {
    complete?: number;
    status?: SmartsheetRow30['status'];
    taskProgress?: SmartsheetRow30['taskProgress'];
    anomalyFlag?: SmartsheetRow30['anomalyFlag'];
    anomalyReason?: string;
  }) => {
    const workingDays = getWorkingDaysBetween(row.startDate, row.endDate);
    const duration = row.duration || `${workingDays}d`;
    
    rows.push({
      taskNumber: taskCounter++,
      complete: row.complete ?? (scenario.isScheduleFrozen ? 100 : 0),
      status: row.status ?? (scenario.isScheduleFrozen ? 'BASELINE LOCKED' : 'NOT STARTED'),
      taskProgress: row.taskProgress ?? 'GREEN',
      anomalyFlag: row.anomalyFlag ?? 'NONE',
      anomalyReason: row.anomalyReason ?? '',
      ...row,
      duration
    });
  };

  // Helper to map category to standard Smartsheet row type
  const deriveType = (cat: string, planLine: string): SmartsheetRow30['type'] => {
    const c = cat.toLowerCase();
    const l = planLine.toLowerCase();
    if (l.startsWith('stage gate') || l.includes('gate') || c === 'gate') return 'Gate';
    if (c.includes('workshop') || l.includes('workshop')) return 'Workshop';
    if (c.includes('deliverable')) return 'Deliverable';
    if (c.includes('template')) return 'Template';
    if (c.includes('internal activity')) return 'Internal Activity';
    if (c.includes('internal deliverable')) return 'Internal Deliverable';
    if (c.includes('client deliverable')) return 'Client Deliverable';
    if (c.includes('client activity')) return 'Client Activity';
    return 'Activity';
  };

  // ==========================================
  // LEVEL 1: Program Root
  // ==========================================
  const projectName = customOptions?.projectName || scenario.name || 'Oracle Cloud ERP & SCM Transformation';
  addRow({
    taskName: projectName,
    assignedToRole: 'Program Executive Sponsor',
    startDate: programStartDate,
    endDate: finalProgramEnd,
    predecessors: '',
    duration: `${generatedTenureDays}d`,
    type: 'Wave',
    workstream: 'GOVERNANCE',
    comments: 'Proposal Baseline 1.0 Program Root Node (oracle-project-plan-standard.yaml)',
    allocation: '100%',
    levelId: 1,
    category: 'Governance',
    wbsId: 'PRG-00',
    templateId: 'ORCL-PROP-V1',
    parentWbsId: '',
    wave: 'All Waves',
    phase: 'All Phases',
    subPhase: 'Program Backbone',
    domain: 'CROSS',
    moduleCode: 'ALL',
    moduleName: 'Full Implementation Scope',
    componentId: '',
    componentName: '',
    scheduleMethod: 'BLANK_FOR_ROLLUP'
  });

  // ==========================================
  // WAVE 0: Mandatory Foundation & Enterprise Design
  // ==========================================
  addRow({
    taskName: 'WAVE 0: Mobilize & Enterprise Design',
    assignedToRole: 'Engagement Manager',
    startDate: wave0Start,
    endDate: wave0End,
    predecessors: '',
    duration: `${wave0WorkingDays}d`,
    type: 'Wave',
    workstream: 'GOVERNANCE',
    comments: 'Proposal Wave 0 - Delivery Foundation & Enterprise Blueprints',
    allocation: '100%',
    levelId: 2,
    category: 'Mandatory',
    wbsId: 'W0-ROOT',
    templateId: 'W0-TEMPLATE',
    parentWbsId: 'PRG-00',
    wave: 'WAVE 0',
    phase: 'MOBILIZE / ENTERPRISE DESIGN',
    subPhase: 'All Wave 0 Sub-Phases',
    domain: 'CROSS',
    moduleCode: '',
    moduleName: '',
    componentId: '',
    componentName: '',
    scheduleMethod: 'BLANK_FOR_ROLLUP'
  });

  // PHASE 1: MOBILIZE
  const spKickoff = calculatedWave0Subphases[0];
  const spMobCore = calculatedWave0Subphases[1];
  const spBusOnb = calculatedWave0Subphases[2];
  const mobStart = spKickoff.startDate;
  const mobEnd = spBusOnb.endDate;

  addRow({
    taskName: 'PHASE: MOBILIZE',
    assignedToRole: 'PMO Lead',
    startDate: mobStart,
    endDate: mobEnd,
    predecessors: '',
    duration: `${getWorkingDaysBetween(mobStart, mobEnd)}d`,
    type: 'Phase',
    workstream: 'PMO',
    comments: 'Proposal Mobilize Phase: Kick-Off, Core Mobilization & Business Onboarding',
    allocation: '100%',
    levelId: 3,
    category: 'Mandatory',
    wbsId: 'W0-PH-MOB',
    templateId: 'PH-MOB',
    parentWbsId: 'W0-ROOT',
    wave: 'WAVE 0',
    phase: 'MOBILIZE',
    subPhase: 'Mobilize Tracks',
    domain: 'PMO',
    moduleCode: '',
    moduleName: '',
    componentId: '',
    componentName: '',
    scheduleMethod: 'BLANK_FOR_ROLLUP'
  });

  // Helper to add a batch of proposal catalog items into a sub-phase
  const addProposalBatch = (
    items: ProposalCatalogItem[],
    subPhaseConfig: { phase: string; name: string; startDate: string; endDate: string; days: number; role: string; workstream: string },
    subWbsPrefix: string,
    subWbsId: string
  ) => {
    // Add Sub-Phase Level 4 Node
    addRow({
      taskName: `SUB PHASE: ${subPhaseConfig.name}`,
      assignedToRole: subPhaseConfig.role,
      startDate: subPhaseConfig.startDate,
      endDate: subPhaseConfig.endDate,
      predecessors: '',
      duration: `${subPhaseConfig.days}d`,
      type: 'Sub-Phase',
      workstream: subPhaseConfig.workstream,
      comments: `Proposal Sub-Phase: ${subPhaseConfig.name}`,
      allocation: '100%',
      levelId: 4,
      category: 'Mandatory',
      wbsId: subWbsId,
      templateId: `SUB-${subWbsPrefix}`,
      parentWbsId: subPhaseConfig.phase === 'MOBILIZE' ? 'W0-PH-MOB' : 'W0-PH-ED',
      wave: 'WAVE 0',
      phase: subPhaseConfig.phase,
      subPhase: subPhaseConfig.name,
      domain: subPhaseConfig.workstream,
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'PERCENT_POSITION_ALIGN'
    });

    // Populate each catalog activity
    const totalItems = items.length;
    items.forEach((item, idx) => {
      // Calculate distributed start and end dates within the sub-phase window
      const itemProgress = idx / Math.max(1, totalItems - 1);
      const startOffset = Math.round(itemProgress * Math.max(0, subPhaseConfig.days - 3));
      const itemDuration = item.durationDays || (item.category.includes('Gate') ? 1 : Math.max(2, Math.min(8, Math.round(subPhaseConfig.days * 0.35))));
      const itemStart = addWorkingDays(subPhaseConfig.startDate, startOffset);
      const itemEnd = addWorkingDays(itemStart, Math.min(subPhaseConfig.days - startOffset - 1, itemDuration - 1));

      const itemIdStr = `${subWbsPrefix}-${String(idx + 1).padStart(3, '0')}`;
      const rowType = item.type || deriveType(item.category, item.planLine);

      addRow({
        taskName: item.planLine,
        assignedToRole: item.role,
        startDate: itemStart,
        endDate: itemEnd < itemStart ? itemStart : itemEnd,
        predecessors: idx === 0 ? '' : `${subWbsPrefix}-${String(idx).padStart(3, '0')}`,
        duration: `${Math.max(1, getWorkingDaysBetween(itemStart, itemEnd))}d`,
        type: rowType,
        workstream: item.workstream || subPhaseConfig.workstream,
        comments: item.comments || `Proposal standard activity under ${subPhaseConfig.name}`,
        allocation: '100%',
        levelId: item.level || 5,
        category: item.category,
        wbsId: itemIdStr,
        templateId: item.templateId || `ACT-${itemIdStr}`,
        parentWbsId: subWbsId,
        wave: 'WAVE 0',
        phase: subPhaseConfig.phase,
        subPhase: subPhaseConfig.name,
        domain: subPhaseConfig.workstream,
        moduleCode: '',
        moduleName: '',
        componentId: '',
        componentName: '',
        scheduleMethod: 'ALIGN_TO_SUBPHASE'
      });
    });
  };

  // 1. KICK-OFF ACTIVITIES
  addProposalBatch(PROPOSAL_WAVE0_MOBILIZE_KICKOFF, spKickoff, 'W0-KICK', 'W0-SUB-KICK');
  // 2. TEAM MOBILIZATION (CORE)
  addProposalBatch(PROPOSAL_WAVE0_MOBILIZE_CORE, spMobCore, 'W0-MOB-CORE', 'W0-SUB-MOB-CORE');
  // 3. BUSINESS ONBOARDING
  addProposalBatch(PROPOSAL_WAVE0_MOBILIZE_BUSINESS, spBusOnb, 'W0-ONB', 'W0-SUB-ONB');

  // PHASE 2: ENTERPRISE DESIGN
  const spFdn = calculatedWave0Subphases[3];
  const spWsDesign = calculatedWave0Subphases[4];
  const spRebaseline = calculatedWave0Subphases[5];
  const edStart = spFdn.startDate;
  const edEnd = spRebaseline.endDate;

  addRow({
    taskName: 'PHASE: ENTERPRISE DESIGN',
    assignedToRole: 'Program Solution Architect',
    startDate: edStart,
    endDate: edEnd,
    predecessors: 'W0-PH-MOB',
    duration: `${getWorkingDaysBetween(edStart, edEnd)}d`,
    type: 'Phase',
    workstream: 'ARCHITECTURE',
    comments: 'Foundation Design, Workstream Design Workshops & Baseline 1.0 Re-baselining',
    allocation: '100%',
    levelId: 3,
    category: 'Mandatory',
    wbsId: 'W0-PH-ED',
    templateId: 'PH-ED',
    parentWbsId: 'W0-ROOT',
    wave: 'WAVE 0',
    phase: 'ENTERPRISE DESIGN',
    subPhase: 'Enterprise Design Tracks',
    domain: 'ARCHITECTURE',
    moduleCode: '',
    moduleName: '',
    componentId: '',
    componentName: '',
    scheduleMethod: 'BLANK_FOR_ROLLUP'
  });

  // 4. FOUNDATION DESIGN
  addProposalBatch(PROPOSAL_WAVE0_ED_FOUNDATION, spFdn, 'W0-FDN', 'W0-SUB-FDN');
  // 5. WORKSTREAM DESIGN
  addProposalBatch(PROPOSAL_WAVE0_ED_WORKSTREAM, spWsDesign, 'W0-WSD', 'W0-SUB-WSD');
  // 6. RE-BASELINE PROJECT
  addProposalBatch(PROPOSAL_WAVE0_ED_REBASELINE, spRebaseline, 'W0-REB', 'W0-SUB-REB');

  // ==========================================
  // POST-ED WAVES EXECUTION (Waves 1..N)
  // ==========================================
  calculatedWaves.forEach((wave, wIdx) => {
    const waveNum = wIdx + 1;
    const wavePrefix = `W${waveNum}`;
    const priorGate = wIdx === 0 ? 'W0-SUB-REB' : `W${wIdx}-GATE-07`;

    addRow({
      taskName: `WAVE ${waveNum}: ${wave.waveName}`,
      assignedToRole: 'Engagement Manager',
      startDate: wave.waveStart,
      endDate: wave.waveEnd,
      predecessors: priorGate,
      duration: `${wave.waveWorkingDays}d`,
      type: 'Wave',
      workstream: 'GOVERNANCE',
      comments: `Proposal Wave ${waveNum}: Detailed Design, Build, SIT, UAT, Cutover & Hypercare`,
      allocation: '100%',
      levelId: 2,
      category: 'Mandatory',
      wbsId: `${wavePrefix}-ROOT`,
      templateId: `${wavePrefix}-TEMPLATE`,
      parentWbsId: 'PRG-00',
      wave: `WAVE ${waveNum}`,
      phase: 'TRANSFORM / VALIDATE / DEPLOY',
      subPhase: `All Wave ${waveNum} Sub-Phases`,
      domain: wave.domain || 'CROSS',
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'BLANK_FOR_ROLLUP'
    });

    // Helper for wave sub-phases
    const addWaveSubPhase = (
      spDef: typeof postEdSubphasesTemplate[0] & { startDate: string; endDate: string; days: number },
      subWbsId: string,
      parentPhaseId: string,
      catalogItems: ProposalCatalogItem[]
    ) => {
      addRow({
        taskName: `SUB PHASE: ${spDef.name}`,
        assignedToRole: spDef.role,
        startDate: spDef.startDate,
        endDate: spDef.endDate,
        predecessors: '',
        duration: `${spDef.days}d`,
        type: 'Sub-Phase',
        workstream: spDef.workstream,
        comments: `Proposal Sub-Phase: ${spDef.name}`,
        allocation: '100%',
        levelId: 4,
        category: 'Mandatory',
        wbsId: subWbsId,
        templateId: `SUB-${subWbsId}`,
        parentWbsId: parentPhaseId,
        wave: `WAVE ${waveNum}`,
        phase: spDef.phase,
        subPhase: spDef.name,
        domain: spDef.workstream,
        moduleCode: '',
        moduleName: '',
        componentId: '',
        componentName: '',
        scheduleMethod: 'PERCENT_POSITION_ALIGN'
      });

      const totalItems = catalogItems.length;
      catalogItems.forEach((item, idx) => {
        const itemProgress = idx / Math.max(1, totalItems - 1);
        const startOffset = Math.round(itemProgress * Math.max(0, spDef.days - 3));
        const itemDuration = item.durationDays || (item.category.includes('Gate') ? 1 : Math.max(2, Math.min(8, Math.round(spDef.days * 0.35))));
        const itemStart = addWorkingDays(spDef.startDate, startOffset);
        const itemEnd = addWorkingDays(itemStart, Math.min(spDef.days - startOffset - 1, itemDuration - 1));

        const itemIdStr = `${subWbsId}-ACT-${String(idx + 1).padStart(2, '0')}`;
        const rowType = item.type || deriveType(item.category, item.planLine);

        addRow({
          taskName: item.planLine,
          assignedToRole: item.role,
          startDate: itemStart,
          endDate: itemEnd < itemStart ? itemStart : itemEnd,
          predecessors: idx === 0 ? '' : `${subWbsId}-ACT-${String(idx).padStart(2, '0')}`,
          duration: `${Math.max(1, getWorkingDaysBetween(itemStart, itemEnd))}d`,
          type: rowType,
          workstream: item.workstream || spDef.workstream,
          comments: item.comments || `Proposal standard activity under ${spDef.name}`,
          allocation: '100%',
          levelId: item.level || 5,
          category: item.category,
          wbsId: itemIdStr,
          templateId: item.templateId || `ACT-${itemIdStr}`,
          parentWbsId: subWbsId,
          wave: `WAVE ${waveNum}`,
          phase: spDef.phase,
          subPhase: spDef.name,
          domain: spDef.workstream,
          moduleCode: '',
          moduleName: '',
          componentId: '',
          componentName: '',
          scheduleMethod: 'ALIGN_TO_SUBPHASE'
        });
      });
    };

    // 1. TRANSFORM - DETAILED DESIGN
    const spDdMob = wave.waveSubphases[0];
    const spDdDoc = wave.waveSubphases[1];
    addRow({
      taskName: `PHASE: TRANSFORM - DETAILED DESIGN`,
      assignedToRole: 'Program Solution Architect',
      startDate: spDdMob.startDate,
      endDate: spDdDoc.endDate,
      predecessors: priorGate,
      duration: `${getWorkingDaysBetween(spDdMob.startDate, spDdDoc.endDate)}d`,
      type: 'Phase',
      workstream: 'ARCHITECTURE',
      comments: 'Functional & Technical detailed design authoring, validation and sign-off',
      allocation: '100%',
      levelId: 3,
      category: 'Mandatory',
      wbsId: `${wavePrefix}-PH-DD`,
      templateId: 'PH-DD',
      parentWbsId: `${wavePrefix}-ROOT`,
      wave: `WAVE ${waveNum}`,
      phase: 'TRANSFORM - DETAILED DESIGN',
      subPhase: 'Detailed Design Tracks',
      domain: 'ARCHITECTURE',
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'BLANK_FOR_ROLLUP'
    });

    addWaveSubPhase(spDdMob, `${wavePrefix}-SUB-DD-MOB`, `${wavePrefix}-PH-DD`, [
      { planLine: 'Onboard Capgemini and Partner Build Teams', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Templates Identification / Finalization / Socialisation with Business and Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Functional Design Documentation Status (Slide in WSR)', role: 'Engagement Manager', level: 5, category: 'Template' },
      { planLine: 'Detailed Design Documentation Status (Slide in WSR)', role: 'Engagement Manager', level: 5, category: 'Template' },
      { planLine: 'FDD Template', role: 'Program Solution Architect', level: 5, category: 'Template' },
      { planLine: 'KDD Template', role: 'Program Solution Architect', level: 5, category: 'Template' },
      { planLine: 'Unit Test Template', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'SIT Test Scenarios', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'UAT Test Scenarios', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Cutover Checklist', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Hypercare Exit Criteria', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Integration Functional Specification - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Integration Technical Specification - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Integration Terms of Specification - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Integration Data Mapping Sheet', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Reports Specification', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Reports Functional Specification - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Reports Data Mapping Sheet - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Conversion Functional Section - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Conversion Tech Spec Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Conversion Data Mapping Sheet', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Extension Specification', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Extension Functional Specification - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Extension Technical Specification - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Extension and Unit Test Results - Section', role: 'Technical Workstream Lead', level: 5, category: 'Template' },
      { planLine: 'Security Design Doc (Fine Grain)', role: 'Functional Track Lead', level: 5, category: 'Template' },
      { planLine: 'Environment Setup Guide (Rapid Tool - if applicable)', role: 'Program Technical Architect', level: 5, category: 'Internal Template' },
      { planLine: 'Project Governance', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Prepare and Publish WSR including add-on slides for Detailed Design', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Update Daily Flash Format for DETAILED DESIGN Progress', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Include Client as-is & to-be resource requirements / involvement required in phase', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spDdDoc, `${wavePrefix}-SUB-DD-DOC`, `${wavePrefix}-PH-DD`, [
      { planLine: 'Document Config Workbook', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Scope Epics Detailed Design & Process Validation', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Conduct Functional Detailed Design Workshops', role: 'Functional Track Lead', level: 4, category: 'Workshops' },
      { planLine: 'Document Functional Specification for Integrations', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'List of Integrations (Integration FDD Portfolio)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Technical Specification for Integrations', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Data Mapping for Integrations', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Functional Specification for Reports', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'List of Reports (BI Publisher / OTBI Specification Portfolio)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Technical Specification for Reports', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Data Mapping for Reports', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Functional Specification for Conversions (FDD)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document SIT Test Scenarios for Conversions', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'List of Conversion Objects (FBDI / HDL Data Mapping Portfolio)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Technical Specification for Conversions', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Data Mapping for Conversions', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Functional Specification for Extensions', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'List of Extensions (PaaS Custom Applet Portfolio)', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Technical Specification for Extensions', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Document Unit Test Scenarios for Extensions', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Review & Sign-Off Solution Architecture Document', role: 'Program Solution Architect', level: 4, category: 'Deliverable' },
      { planLine: 'Sign-off on FDD / TDD for Modules / Scope', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Collect additional / updated UAT Test Scenarios from Business', role: 'Test Lead', level: 4, category: 'Client Deliverable' },
      { planLine: 'Update Functional / Technical Design Documents', role: 'Functional Track Lead', level: 4, category: 'Activity' },
      { planLine: 'Update Traceability Matrix with Functional & Technical Design Attributes', role: 'Program Solution Architect', level: 4, category: 'Activity' },
      { planLine: 'Sign-off User Story Backlog (Sprint 1 to N)', role: 'Scrum Master', level: 4, category: 'Deliverable' },
      { planLine: 'Sprint 1 Stories (Epics in Sprint)', role: 'Scrum Master', level: 5, category: 'Activity' },
      { planLine: 'Sprint 2 Stories (Epics in Sprint)', role: 'Scrum Master', level: 5, category: 'Activity' },
      { planLine: 'Sprint 3 Stories (Epics in Sprint)', role: 'Scrum Master', level: 5, category: 'Activity' },
      { planLine: 'Detailed Design Stage Gate', role: 'Engagement Manager', level: 4, category: 'Gate' },
      { planLine: 'Finalise Stage Gate Exit Criteria', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
    ]);

    // 2. TRANSFORM - BUILD
    const spBldPlan = wave.waveSubphases[2];
    const spBldPrep = wave.waveSubphases[3];
    const spBldExec = wave.waveSubphases[4];
    addRow({
      taskName: `PHASE: TRANSFORM - BUILD`,
      assignedToRole: 'Technical Workstream Lead',
      startDate: spBldPlan.startDate,
      endDate: spBldExec.endDate,
      predecessors: `${wavePrefix}-SUB-DD-DOC`,
      duration: `${getWorkingDaysBetween(spBldPlan.startDate, spBldExec.endDate)}d`,
      type: 'Phase',
      workstream: 'TECHNICAL',
      comments: 'Build planning, environment preparation, configuration, development & mock data conversions',
      allocation: '100%',
      levelId: 3,
      category: 'Mandatory',
      wbsId: `${wavePrefix}-PH-BLD`,
      templateId: 'PH-BLD',
      parentWbsId: `${wavePrefix}-ROOT`,
      wave: `WAVE ${waveNum}`,
      phase: 'TRANSFORM - BUILD',
      subPhase: 'Build Tracks',
      domain: 'TECHNICAL',
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'BLANK_FOR_ROLLUP'
    });

    addWaveSubPhase(spBldPlan, `${wavePrefix}-SUB-BLD-PLAN`, `${wavePrefix}-PH-BLD`, [
      { planLine: 'Templates Identification / Finalization / Socialisation with Business and Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Sprint Status (Slide in WSR)', role: 'Scrum Master', level: 5, category: 'Template' },
      { planLine: 'Sprint Dashboard', role: 'Scrum Master', level: 5, category: 'Template' },
      { planLine: 'Burndown Chart - Slide', role: 'Scrum Master', level: 5, category: 'Template' },
      { planLine: 'SIT Readiness Checklist', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Train the Trainer / User Training Plan', role: 'OCM Lead', level: 5, category: 'Template' },
      { planLine: 'Train the Trainer Deck', role: 'OCM Lead', level: 5, category: 'Template' },
      { planLine: 'UAT Readiness Checklist', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Mock 1 Cutover Checklist', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'SIT Security Test Cases and Results', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Runbook Guide', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Deployment Runbook', role: 'Test Lead', level: 5, category: 'Template' },
      { planLine: 'Instance Readiness Checklist', role: 'Program Technical Architect', level: 5, category: 'Template' },
      { planLine: 'Environment Management Plan', role: 'Program Technical Architect', level: 5, category: 'Template' },
      { planLine: 'Cutover Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
      { planLine: 'Hypercare Plan', role: 'Engagement Manager', level: 5, category: 'Template' },
      { planLine: 'BUILD Guides (for ICT)', role: 'Technical Track Lead', level: 5, category: 'Internal Template' },
      { planLine: 'Reports / Extraction Guide', role: 'Technical Workstream Lead', level: 6, category: 'Internal Template' },
      { planLine: 'Integrations Guide', role: 'Technical Workstream Lead', level: 6, category: 'Internal Template' },
      { planLine: 'Conversion Guide', role: 'Technical Workstream Lead', level: 6, category: 'Internal Template' },
      { planLine: 'Securities Guide', role: 'Technical Track Lead', level: 6, category: 'Internal Template' },
      { planLine: 'Extensions Guide', role: 'Technical Workstream Lead', level: 6, category: 'Internal Template' },
      { planLine: 'Configuration / Setup Guide', role: 'Functional Track Lead', level: 6, category: 'Internal Template' },
      { planLine: 'INFRA Guide', role: 'Program Technical Architect', level: 6, category: 'Internal Template' },
      { planLine: 'Project Governance', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Test JIRA-Smartsheet Data Integration', role: 'PMO Lead', level: 4, category: 'Activity' }
    ]);

    addWaveSubPhase(spBldPrep, `${wavePrefix}-SUB-BLD-PREP`, `${wavePrefix}-PH-BLD`, [
      { planLine: 'Environment Setup / Readiness for Build', role: 'Program Technical Architect', level: 4, category: 'Activity' },
      { planLine: 'Prepare and Publish WSR including add-on slides for BUILD', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Update Daily Flash Format for BUILD Progress', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Reminders for Accesses required to conversions peripheral systems etc. (DEV Instances)', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Reminders for Accesses required to integrations peripheral systems etc. (DEV Instances)', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Instance Provisioning on OCI', role: 'Client Activity', level: 4, category: 'Client Deliverable' },
      { planLine: 'Reminders for OCS Instance and Connectivity peripheral systems - Integrations (DEV Instances)', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Instance Readiness Check', role: 'Program Technical Architect', level: 4, category: 'Deliverable' },
      { planLine: 'Setup Sandbox Environment', role: 'Program Technical Architect', level: 5, category: 'Activity' },
      { planLine: 'Load Balance, Storage & DB provisioning', role: 'Technical Consultant', level: 5, category: 'Activity' },
      { planLine: 'SSO, Whitelisting Setup', role: 'Technical Consultant', level: 5, category: 'Activity' },
      { planLine: 'Pre-Requisites for Build Execution', role: 'Functional Track Lead', level: 4, category: 'Activity' },
      { planLine: 'Update Conversion Tracker', role: 'Technical Track Lead', level: 5, category: 'Deliverable' },
      { planLine: 'Update Reports Tracker', role: 'Technical Track Lead', level: 5, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spBldExec, `${wavePrefix}-SUB-BLD-EXEC`, `${wavePrefix}-PH-BLD`, [
      { planLine: 'Scope Modules Configuration & Gold Instance Setup', role: 'Technical Consultant', level: 5, category: 'Deliverable' },
      { planLine: 'Build Sprint Execution (S1..SN)', role: 'Scrum Master', level: 4, category: 'Activity' },
      { planLine: 'Security Unit Test', role: 'Functional Consultant', level: 4, category: 'Activity' },
      { planLine: 'Integrations Build & Unit Test Execution', role: 'Technical Consultant', level: 5, category: 'Deliverable' },
      { planLine: 'Reports Build Execution & Extraction Validation', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'List of Reports Build Packages', role: 'Technical Consultant', level: 5, category: 'Deliverable' },
      { planLine: 'Conversion Build Execution & Staging Tables Setup', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Plan Mock Conversion 1: 50% Loading & Reconciliation', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Plan Mock Conversion 2: 75% Loading & Variance Resolution', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Data Conversion Pipelines & Reconciliation Matrix', role: 'Technical Workstream Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Extensions Build Execution (PaaS Applet Components)', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Unit Testing Execution across Config, Integrations & Reports', role: 'Functional Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Perform Unit Testing for Auto-created Test cases', role: 'Testing Consultant', level: 5, category: 'Activity' },
      { planLine: 'Build Stage Gate Approval', role: 'Engagement Manager', level: 4, category: 'Gate' }
    ]);

    // 3. VALIDATE - SIT
    const spSitPlan = wave.waveSubphases[5];
    const spSitPrep = wave.waveSubphases[6];
    const spSitExec = wave.waveSubphases[7];
    addRow({
      taskName: `PHASE: VALIDATE - SIT (${sitRounds} Testing Cycles)`,
      assignedToRole: 'QA & Test Lead',
      startDate: spSitPlan.startDate,
      endDate: spSitExec.endDate,
      predecessors: `${wavePrefix}-SUB-BLD-EXEC`,
      duration: `${getWorkingDaysBetween(spSitPlan.startDate, spSitExec.endDate)}d`,
      type: 'Phase',
      workstream: 'TESTING',
      comments: 'System Integration Testing: Cycle 1 Functional, Cycle 2 Regression & High-Volume Handshake',
      allocation: '100%',
      levelId: 3,
      category: 'Testing',
      wbsId: `${wavePrefix}-PH-SIT`,
      templateId: 'PH-SIT',
      parentWbsId: `${wavePrefix}-ROOT`,
      wave: `WAVE ${waveNum}`,
      phase: 'VALIDATE - SIT',
      subPhase: 'SIT Tracks',
      domain: 'TESTING',
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'BLANK_FOR_ROLLUP'
    });

    addWaveSubPhase(spSitPlan, `${wavePrefix}-SUB-SIT-PLAN`, `${wavePrefix}-PH-SIT`, [
      { planLine: 'Templates Identification / Finalization / Socialisation with Business and Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'SIT Planning', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Finalise / Update / Finalise SIT Scope', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Finalise SIT Users / 3rd Party Contacts required for SIT', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Finalise Test Scenarios with IT / Business', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Finalise Test Schedule with IT, Test Scenarios by dates and users', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spSitPrep, `${wavePrefix}-SUB-SIT-PREP`, `${wavePrefix}-PH-SIT`, [
      { planLine: 'Reminders for Accesses required to conversions peripheral systems etc. (SIT Instances)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
      { planLine: 'Reminders for Accesses required to integrations peripheral systems etc. (SIT Instances)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
      { planLine: 'OCI / Instance Readiness for SIT', role: 'Program Technical Architect', level: 4, category: 'Deliverable' },
      { planLine: 'Environment Setup (SIT)', role: 'Program Technical Architect', level: 5, category: 'Activity' }
    ]);

    addWaveSubPhase(spSitExec, `${wavePrefix}-SUB-SIT-EXEC`, `${wavePrefix}-PH-SIT`, [
      { planLine: 'Plan Mock Conversion 3: 70% Volume Load', role: 'Technical Workstream Lead', level: 4, category: 'Activity' },
      { planLine: 'Execute Data Cleansing & FBDI extraction - Cleansing - Loading', role: 'Technical Workstream Lead', level: 4, category: 'Activity' },
      { planLine: 'Execute SIT Cycle 1 (Functional & Integration)', role: 'Test Lead', level: 4, category: 'Activity' },
      { planLine: 'Module & Cross-Functional SIT Test Execution', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Execute SIT Cycle 2 (Regression & High Volume)', role: 'Test Lead', level: 4, category: 'Activity' },
      { planLine: 'Integrations End-to-End SIT Testing', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'BI Reports End-to-End SIT Testing', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Extensions End-to-End SIT Testing', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Review Training Readiness & Train the Trainer Program', role: 'OCM Lead', level: 4, category: 'Activity' },
      { planLine: 'Maintain SIT Defect Tracker / Log', role: 'Test Lead', level: 4, category: 'Deliverable' },
      { planLine: 'SIT Stage Gate (Gate 4 Approval)', role: 'Engagement Manager', level: 4, category: 'Gate' }
    ]);

    // 4. VALIDATE - UAT
    const spUatPlan = wave.waveSubphases[8];
    const spUatPrep = wave.waveSubphases[9];
    const spUatExec = wave.waveSubphases[10];
    addRow({
      taskName: `PHASE: VALIDATE - UAT (${uatRounds} Acceptance Cycles)`,
      assignedToRole: 'Functional Track Lead',
      startDate: spUatPlan.startDate,
      endDate: spUatExec.endDate,
      predecessors: `${wavePrefix}-SUB-SIT-EXEC`,
      duration: `${getWorkingDaysBetween(spUatPlan.startDate, spUatExec.endDate)}d`,
      type: 'Phase',
      workstream: 'TESTING',
      comments: 'User Acceptance Testing: End-to-end business scenarios, Mock Conversion 4 cutover rehearsal & sign-off',
      allocation: '100%',
      levelId: 3,
      category: 'Testing',
      wbsId: `${wavePrefix}-PH-UAT`,
      templateId: 'PH-UAT',
      parentWbsId: `${wavePrefix}-ROOT`,
      wave: `WAVE ${waveNum}`,
      phase: 'VALIDATE - UAT',
      subPhase: 'UAT Tracks',
      domain: 'TESTING',
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'BLANK_FOR_ROLLUP'
    });

    addWaveSubPhase(spUatPlan, `${wavePrefix}-SUB-UAT-PLAN`, `${wavePrefix}-PH-UAT`, [
      { planLine: 'Templates Identification / Finalization / Socialisation with Business and Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'UAT Planning', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Finalise / Update / Finalise UAT Scope', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Review UAT Entrance Criteria', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Finalise Test Scenarios with IT / Business', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Finalise Test Schedule with IT, Test Scenarios by dates and users', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spUatPrep, `${wavePrefix}-SUB-UAT-PREP`, `${wavePrefix}-PH-UAT`, [
      { planLine: 'Reminders for Accesses required to conversions peripheral systems etc. (UAT Instances)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
      { planLine: 'Reminders for Accesses required to integrations peripheral systems etc. (UAT Instances)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
      { planLine: 'OCI / Instance Readiness for UAT', role: 'Program Technical Architect', level: 4, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spUatExec, `${wavePrefix}-SUB-UAT-EXEC`, `${wavePrefix}-PH-UAT`, [
      { planLine: 'Plan Mock Conversion 4: 90% (Final Cutover Rehearsal)', role: 'Technical Workstream Lead', level: 4, category: 'Activity' },
      { planLine: 'Execute UAT Cycle (Business Scenario Execution)', role: 'Functional Track Lead', level: 4, category: 'Activity' },
      { planLine: 'Business Process UAT Test Cases Execution', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Execute UAT - Reports Testing (Run / Extract)', role: 'Client Activity', level: 4, category: 'Client Activity' },
      { planLine: 'Integrations UAT Verification & Edge Case Sign-Off', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Reports UAT Verification & Data Alignment', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Extensions UAT Verification & User Acceptance', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Maintain UAT Defect Tracker / Log', role: 'Test Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Obtain Business Acceptance Sign-Off', role: 'Engagement Manager', level: 4, category: 'Deliverable' },
      { planLine: 'UAT Stage Gate (Gate 5 Approval)', role: 'Engagement Manager', level: 4, category: 'Gate' }
    ]);

    // 5. DEPLOY
    const spCutPlan = wave.waveSubphases[11];
    const spTransRun = wave.waveSubphases[18];
    addRow({
      taskName: `PHASE: DEPLOY (Cutover, Hypercare & Run Handover)`,
      assignedToRole: 'Engagement Manager',
      startDate: spCutPlan.startDate,
      endDate: spTransRun.endDate,
      predecessors: `${wavePrefix}-SUB-UAT-EXEC`,
      duration: `${getWorkingDaysBetween(spCutPlan.startDate, spTransRun.endDate)}d`,
      type: 'Phase',
      workstream: 'DEPLOYMENT',
      comments: 'Cutover execution, Gold production go-live, hypercare stabilization & transition to run',
      allocation: '100%',
      levelId: 3,
      category: 'Deployment',
      wbsId: `${wavePrefix}-PH-DEP`,
      templateId: 'PH-DEPLOY',
      parentWbsId: `${wavePrefix}-ROOT`,
      wave: `WAVE ${waveNum}`,
      phase: 'DEPLOY',
      subPhase: 'Deployment Tracks',
      domain: 'DEPLOYMENT',
      moduleCode: '',
      moduleName: '',
      componentId: '',
      componentName: '',
      scheduleMethod: 'BLANK_FOR_ROLLUP'
    });

    const spCutPrep = wave.waveSubphases[12];
    const spCutExec = wave.waveSubphases[13];
    const spHypPlan = wave.waveSubphases[14];
    const spHypPrep = wave.waveSubphases[15];
    const spHypExec = wave.waveSubphases[16];
    const spTrnPlan = wave.waveSubphases[17];

    addWaveSubPhase(spCutPlan, `${wavePrefix}-SUB-CUT-PLAN`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Templates Identification / Finalization / Socialisation with Business and Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Cutover Planning', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Finalise Cutover Plan & Hour-by-Hour Runbook', role: 'Engagement Manager', level: 5, category: 'Deliverable' },
      { planLine: 'Go / No-Go Decision Framework & Criteria', role: 'Engagement Manager', level: 5, category: 'Activity' },
      { planLine: 'Setup Cutover Command Center & War Room', role: 'Engagement Manager', level: 5, category: 'Activity' }
    ]);

    addWaveSubPhase(spCutPrep, `${wavePrefix}-SUB-CUT-PREP`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Reminders for Accesses required to peripheral systems etc. (PROD Instances)', role: 'Technical Workstream Lead', level: 5, category: 'Activity' },
      { planLine: 'OCI / Instance Readiness for PROD', role: 'Program Technical Architect', level: 4, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spCutExec, `${wavePrefix}-SUB-CUT-EXEC`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Execute Cutover Plan (Data Conversion 100%, Config, Integrations to PROD)', role: 'Technical Workstream Lead', level: 4, category: 'Activity' },
      { planLine: 'Production Configuration & Gold Instance Cutover', role: 'Functional Track Lead', level: 4, category: 'Deliverable' },
      { planLine: 'Production Integrations Cutover & Smoke Testing', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Production Reports Deployment & Smoke Testing', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Production Extensions Cutover', role: 'Technical Consultant', level: 4, category: 'Deliverable' },
      { planLine: 'Go-Live Authorization & Communication', role: 'Engagement Manager', level: 4, category: 'Gate' }
    ]);

    addWaveSubPhase(spHypPlan, `${wavePrefix}-SUB-HYP-PLAN`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Finalise Hypercare Support Model & SLA Roster', role: 'Engagement Manager', level: 5, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spHypPrep, `${wavePrefix}-SUB-HYP-PREP`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Hypercare Command Center Infrastructure & Bridge Setup', role: 'Engagement Manager', level: 5, category: 'Activity' }
    ]);

    addWaveSubPhase(spHypExec, `${wavePrefix}-SUB-HYP-EXEC`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Hypercare Support Execution', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Daily Hypercare Incident Triage & Resolution', role: 'Functional Track Lead', level: 5, category: 'Activity' },
      { planLine: 'Hypercare Exit Sign-Off (Gate 6)', role: 'Engagement Manager', level: 4, category: 'Gate' }
    ]);

    addWaveSubPhase(spTrnPlan, `${wavePrefix}-SUB-TRN-PLAN`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Handover Documentation & Operational Runbooks', role: 'Technical Track Lead', level: 5, category: 'Deliverable' }
    ]);

    addWaveSubPhase(spTransRun, `${wavePrefix}-SUB-TRN-RUN`, `${wavePrefix}-PH-DEP`, [
      { planLine: 'Transition to Run / AMS Team', role: 'Engagement Manager', level: 4, category: 'Activity' },
      { planLine: 'Transition Sign-Off (Gate 7 - Program Close)', role: 'Engagement Manager', level: 4, category: 'Gate' }
    ]);
  });

  // 5. Structure Wave hierarchy summary
  const wavesOutput: StandardProjectPlanOutput['waves'] = [
    {
      waveId: 'WAVE-0',
      waveName: 'Wave 0: Mobilize & Enterprise Design',
      startDate: wave0Start,
      endDate: wave0End,
      durationWorkingDays: wave0WorkingDays,
      phases: [
        {
          phaseName: 'MOBILIZE',
          startDate: mobStart,
          endDate: mobEnd,
          subPhases: calculatedWave0Subphases.slice(0, 3).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        },
        {
          phaseName: 'ENTERPRISE DESIGN',
          startDate: edStart,
          endDate: edEnd,
          subPhases: calculatedWave0Subphases.slice(3, 6).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        }
      ]
    },
    ...calculatedWaves.map((wave, idx) => ({
      waveId: `WAVE-${idx + 1}`,
      waveName: wave.waveName,
      startDate: wave.waveStart,
      endDate: wave.waveEnd,
      durationWorkingDays: wave.waveWorkingDays,
      phases: [
        {
          phaseName: 'TRANSFORM - DETAILED DESIGN',
          startDate: wave.waveSubphases[0].startDate,
          endDate: wave.waveSubphases[1].endDate,
          subPhases: wave.waveSubphases.slice(0, 2).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        },
        {
          phaseName: 'TRANSFORM - BUILD',
          startDate: wave.waveSubphases[2].startDate,
          endDate: wave.waveSubphases[4].endDate,
          subPhases: wave.waveSubphases.slice(2, 5).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        },
        {
          phaseName: 'VALIDATE - SIT',
          startDate: wave.waveSubphases[5].startDate,
          endDate: wave.waveSubphases[7].endDate,
          subPhases: wave.waveSubphases.slice(5, 8).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        },
        {
          phaseName: 'VALIDATE - UAT',
          startDate: wave.waveSubphases[8].startDate,
          endDate: wave.waveSubphases[10].endDate,
          subPhases: wave.waveSubphases.slice(8, 11).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        },
        {
          phaseName: 'DEPLOY',
          startDate: wave.waveSubphases[11].startDate,
          endDate: wave.waveSubphases[18].endDate,
          subPhases: wave.waveSubphases.slice(11, 19).map(sp => ({
            subPhaseName: sp.name,
            startDate: sp.startDate,
            endDate: sp.endDate,
            weightPct: sp.pct
          }))
        }
      ]
    }))
  ];

  return {
    planSummary: {
      programStartDate,
      programEndDate: finalProgramEnd,
      requestedTenureMonths,
      generatedTenureDays,
      tenureGapDays: 0,
      numberOfIncludedWaves: calculatedWaves.length + 1,
      totalGeneratedRows: rows.length,
      validationStatus: validationMessages.some(v => v.severity === 'ERROR')
        ? 'BLOCKED'
        : validationMessages.length > 0
        ? 'WARNINGS'
        : 'VALID',
      validationMessages
    },
    smartsheetRows: rows,
    waves: wavesOutput
  };
}

/**
 * Generate standard CSV with all 30 Columns strictly in order
 */
export function exportStandardSmartsheetCsv(rows: SmartsheetRow30[]): string {
  const headers = [
    'Task Name',
    'ASSIGNED TO ROLE',
    'Status',
    'Start Date',
    'End Date',
    'Task Progress',
    'Predecessors',
    'Duration',
    'Type',
    'Workstream',
    'Comments',
    'Allocation',
    'LEVEL-ID',
    'Complete',
    'TASK_NUMBER',
    'CATEGORY',
    'WBS-ID',
    'TEMPLATE-ID',
    'Parent WBS ID',
    'Wave',
    'Phase',
    'Sub-Phase',
    'Domain',
    'Module Code',
    'Module Name',
    'Component ID',
    'Component Name',
    'Schedule Method',
    'Anomaly Flag',
    'Anomaly Reason'
  ];

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [headers.join(',')];

  rows.forEach(r => {
    // Indent task name visually according to Level-ID
    const indent = '  '.repeat(Math.max(0, r.levelId - 1));
    const formattedTaskName = `${indent}${r.taskName}`;

    const line = [
      escapeCsv(formattedTaskName),
      escapeCsv(r.assignedToRole),
      escapeCsv(r.status),
      escapeCsv(r.startDate),
      escapeCsv(r.endDate),
      escapeCsv(r.taskProgress),
      escapeCsv(r.predecessors),
      escapeCsv(r.duration),
      escapeCsv(r.type),
      escapeCsv(r.workstream),
      escapeCsv(r.comments),
      escapeCsv(r.allocation),
      escapeCsv(r.levelId),
      escapeCsv(r.complete),
      escapeCsv(r.taskNumber),
      escapeCsv(r.category),
      escapeCsv(r.wbsId),
      escapeCsv(r.templateId),
      escapeCsv(r.parentWbsId),
      escapeCsv(r.wave),
      escapeCsv(r.phase),
      escapeCsv(r.subPhase),
      escapeCsv(r.domain),
      escapeCsv(r.moduleCode),
      escapeCsv(r.moduleName),
      escapeCsv(r.componentId),
      escapeCsv(r.componentName),
      escapeCsv(r.scheduleMethod),
      escapeCsv(r.anomalyFlag),
      escapeCsv(r.anomalyReason)
    ];

    csvRows.push(line.join(','));
  });

  return csvRows.join('\n');
}
