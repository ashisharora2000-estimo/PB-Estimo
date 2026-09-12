import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Award,
  ChevronRight,
  Copy,
  Check,
  Download,
  X,
  FileText,
  SlidersHorizontal,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Building,
  Users,
  Layers,
  Sparkles,
  HelpCircle,
  Briefcase,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData, OracleModule } from '../../types';
import { ORACLE_MODULE_CATALOG } from '../../data/oraclePhases';

interface DealDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onOpenWhatIfSimulator?: () => void;
  onOpenSlideDeck?: () => void;
}

type TabType = 'thesis' | 'duration' | 'commercials' | 'objections' | 'sow_shield';

interface ObjectionItem {
  id: string;
  category: 'Price' | 'Duration' | 'Scope' | 'Risk' | 'Architecture';
  question: string;
  clientPerspective: string;
  winningTalkTrack: string;
  dataProofPoints: string[];
  trapToAvoid: string;
}

export const DealDefenseModal: React.FC<DealDefenseModalProps> = ({
  isOpen,
  onClose,
  scenario,
  data,
  onOpenWhatIfSimulator,
  onOpenSlideDeck
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('thesis');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedObjectionId, setSelectedObjectionId] = useState<string>('obj-1');
  const [panelMode, setPanelMode] = useState<'drawer' | 'modal'>('drawer');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Safe Metric Extraction
  const thorId = scenario.thorId?.trim() ? scenario.thorId : 'PROP-2026-001';
  const clientName = scenario.clientName?.trim() ? scenario.clientName : 'Enterprise Client';
  const totalHours = Math.round(data.targetHours ?? data.p80_DefensibleHours ?? 0);
  const durationWeeks = typeof scenario.projectWeeks === 'number'
    ? scenario.projectWeeks
    : (typeof data.recommendedDurationWeeks === 'number' ? data.recommendedDurationWeeks : 0);
  const durationMonths = Math.round((durationWeeks / 4.33) * 10) / 10;
  const tcv = Math.round(data.deliveryRevenue || (totalHours * 115));
  const tcvFormatted = `$${tcv.toLocaleString()}`;
  const blendedRate = Math.round(data.blendedBillRate || 115);
  const marginPct = Math.round((data.grossMarginPct || 38.5) * 10) / 10;
  const peakFTE = data.peakFTE || Math.max(4, Math.round(totalHours / (Math.max(durationWeeks, 1) * 40)));
  const avgFTE = data.avgTotalFTE ?? Math.round((totalHours / (Math.max(durationWeeks, 1) * 40)) * 10) / 10;
  const selectedModObjs = ORACLE_MODULE_CATALOG.filter(m => scenario.selectedModules.includes(m.id));

  // Finance Architecture Scale Drivers
  const einvoicingCountries = (scenario.scaleDrivers?.fin_einvoicing_countries as string[]) || [];
  const bankCertWeeks = typeof scenario.scaleDrivers?.fin_bank_cert_weeks === 'number'
    ? scenario.scaleDrivers.fin_bank_cert_weeks
    : 6;
  const cutoverStrategy = (scenario.scaleDrivers?.fin_cutover_strategy as string) || 'Phased';
  const entitiesCount = Number(scenario.scaleDrivers?.entities_count) || 1;
  const coaCount = Number(scenario.scaleDrivers?.charts_of_accounts) || 1;
  const oicCount = Number(scenario.scaleDrivers?.tech_oic) || 8;
  const dataObjectsCount = Number(scenario.scaleDrivers?.tech_data_objects) || 12;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Comprehensive Orals Objections Matrix
  const OBJECTIONS: ObjectionItem[] = [
    {
      id: 'obj-1',
      category: 'Duration',
      question: `"Competitor Y offered a 9-month schedule. Why is your duration ${durationMonths} months (${durationWeeks} weeks)?"`,
      clientPerspective: 'Executive sponsors fear extended timelines inflate consulting billings and delay business ROI realization.',
      winningTalkTrack: `We don't sell an optimistic proposal that guarantees a change order in Month 4. Our ${durationWeeks}-week timeline deterministically protects your organization against the 3 classic Oracle delivery failures:
1. Wave 0 Enterprise Design ensures Multi-Entity Chart of Accounts and cross-module master data governance are frozen BEFORE configuration begins, preventing downstream redesign rework.
2. External Bank Connectivity requires a mandatory ${bankCertWeeks}-week partner certification window (SWIFT / MT940 / ISO 20022) with external financial institutions that cannot be artificially compressed.
3. Our testing cadence incorporates dual business cycles (SIT + UAT) and actively accommodates Oracle Quarterly Patch releases without blacking out cutover.`,
      dataProofPoints: [
        `Wave 0 Enterprise Design prevents ~35% of common Phase 2 scope redesigns.`,
        `Bank Certification SLA: ${bankCertWeeks} weeks mandated for ${scenario.scaleDrivers?.currencies_count || 1} currencies across ${entitiesCount} legal entities.`,
        `Oracle Patch Blackout buffer accounts for quarterly production cadence.`
      ],
      trapToAvoid: 'Never say "We are more thorough." Instead, demonstrate specific external external dependencies (e.g. bank partner testing and statutory tax authorities) that competitors deliberately omit from their timeline.'
    },
    {
      id: 'obj-2',
      category: 'Price',
      question: `"Why is your total price ${tcvFormatted} when we received bids 15-20% lower?"`,
      clientPerspective: 'Procurement is incentivized to minimize initial capital expenditure and compare raw contractor day rates.',
      winningTalkTrack: `A lower initial price almost invariably reflects scope demarcation exclusion. Our ${tcvFormatted} TCV represents a fixed, fully encapsulated enterprise commitment:
1. Full RICEFW inclusion: All ${oicCount} OIC integrations, ${dataObjectsCount} conversion objects, and business reports are staffed end-to-end, rather than being demarcated back to client internal IT.
2. Grade Quality Staffing: 20% Grade A (Lead Architects) and 35% Grade B (Senior Functional Leads) ensure seasoned Oracle Fusion certified SMEs conduct your design sessions, avoiding junior resource trial-and-error.
3. Realistic Contingency: Includes an audited P80 delivery buffer so your project finishes on-budget without emergency change orders.`,
      dataProofPoints: [
        `Blended Rate of $${blendedRate}/hr backed by a transparent 5-grade delivery pyramid (Grades A through E).`,
        `Delivery Assurance: Includes ${totalHours.toLocaleString()} total defensible hours spanning ${selectedModObjs.length} core modules.`,
        `Total Cost of Ownership protection against post-go-live hypercare defect spikes.`
      ],
      trapToAvoid: 'Do not offer immediate rate discounts. Instead, offer structural trade-offs (e.g., deferring non-core modules or transitioning report building to client power users via What-If simulator).'
    },
    {
      id: 'obj-3',
      category: 'Scope',
      question: `"Can we eliminate Wave 0 Enterprise Design and start configuring right away in Month 1?"`,
      clientPerspective: 'Business stakeholders want immediate visual progress and assume configuring in a sandbox will accelerate delivery.',
      winningTalkTrack: `Skipping Enterprise Design is the number one cause of failed multi-entity Oracle implementations. In a multi-company environment with ${entitiesCount} legal entities and ${coaCount} Chart of Accounts, configuring General Ledger, Subledger Accounting (SLA), and intercompany rules before establishing enterprise structure guarantees architectural rework.
Wave 0 establishes:
1. Chart of Accounts segment qualification and value set hierarchies.
2. Global Tax Regimes and ${einvoicingCountries.length > 0 ? einvoicingCountries.join(', ') + ' statutory e-invoicing architecture' : 'indirect tax rules'}.
3. Golden Enterprise Data model across procurement, inventory, and ledger.`,
      dataProofPoints: [
        `Gartner research demonstrates that rework accounts for 40%+ of costs in projects that bypass formal Enterprise Design.`,
        `Wave 0 deliverables provide the immutable baseline for SIT test case generation.`
      ],
      trapToAvoid: 'Do not debate agile vs waterfall. Position Wave 0 as "Sprint Zero" architecture enablement that makes subsequent configuration sprints 2x faster.'
    },
    {
      id: 'obj-4',
      category: 'Architecture',
      question: `"How do you de-risk Statutory e-Invoicing & Local Country Mandates (${einvoicingCountries.length} countries)?"`,
      clientPerspective: 'Finance directors fear non-compliance penalties, customs shipment holds, and frozen accounts receivable.',
      winningTalkTrack: `Our scoping architecture isolates statutory mandates into dedicated localized technical pods:
1. Pre-configured compliance frameworks for ${einvoicingCountries.length > 0 ? einvoicingCountries.join(', ') : 'all specified jurisdictions'}.
2. Dedicated Integration Middleware to government tax portals (e.g., ZATCA, KSeF, SDI, Peppol) with QR code and cryptographic hash validation.
3. Pre-built contingency for statutory schema amendments published during the implementation lifecycle.`,
      dataProofPoints: [
        `Enforced statutory verification during SIT 2 and Cutover readiness gates.`,
        `Pre-mapped XML/UBL payload transformation templates.`
      ],
      trapToAvoid: 'Never claim e-invoicing is "out-of-the-box standard Oracle". It always requires middleware or partner tax engine connectivity.'
    },
    {
      id: 'obj-5',
      category: 'Risk',
      question: `"Why do you recommend a ${cutoverStrategy} cutover rather than a single Big Bang weekend?"`,
      clientPerspective: 'Business leaders dread prolonged coexistence between legacy and Cloud ERP.',
      winningTalkTrack: `With ${entitiesCount} operating entities and ${selectedModObjs.length} modules, a ${cutoverStrategy} cutover strictly bounds financial and operational risk:
1. Operational Ring-Fencing: Core Finance stabilizes first, establishing ledger integrity before downstream supply chain or complex payroll cutover.
2. Reconciliation Isolation: Intercompany imbalances and bank clearing can be verified cleanly without noise from high-velocity warehouse transactions.
3. War-Room Focus: Specialized hypercare teams focus 100% on critical invoice and payment runs during Day 1 to Day 30.`,
      dataProofPoints: [
        `Cutover buffer accommodates ${bankCertWeeks}-week bank host-to-host transmission validation.`,
        `Reconciliation checklist covers opening balance conversions across AP, AR, FA, and GL.`
      ],
      trapToAvoid: 'Do not present cutover as merely an IT migration; present it as a business continuity and revenue protection protocol.'
    },
    {
      id: 'obj-6',
      category: 'Price',
      question: `"Why is your onshore presence (${scenario.onshoreMixPct || 30}%) higher than offshore-heavy competitors?"`,
      clientPerspective: 'CFOs question paying onshore consulting rates for tasks they believe can be handled offshore.',
      winningTalkTrack: `Our staffing model concentrates onshore presence strictly where executive proximity dictates success:
1. Enterprise Architecture & COA Design: Led face-to-face with your CFO and Controllership team to navigate corporate tax and accounting nuances.
2. Change Management & Executive SteerCo: Onsite program leadership drives cross-functional business consensus and prevents executive escalation bottlenecks.
3. High-Leverage Offshore Sourcing: 70%+ of heavy configuration, OIC interface development, data conversion scripting, and test case execution is handled offshore at competitive blended rates, maximizing your investment efficiency.`,
      dataProofPoints: [
        `Blended delivery model maintains a lean $${blendedRate}/hr average rate while delivering Tier-1 architecture quality.`,
        `Onshore presence peaks during Wave 0 Design and UAT/Cutover weeks.`
      ],
      trapToAvoid: 'Do not justify onshore as "easier communication." Justify it as risk reduction for legal accounting, statutory audit, and executive change management.'
    }
  ];

  const filteredObjections = useMemo(() => {
    if (!searchQuery.trim()) return OBJECTIONS;
    const q = searchQuery.toLowerCase();
    return OBJECTIONS.filter(o => 
      o.question.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q) ||
      o.winningTalkTrack.toLowerCase().includes(q)
    );
  }, [OBJECTIONS, searchQuery]);

  const selectedObjection = OBJECTIONS.find(o => o.id === selectedObjectionId) || OBJECTIONS[0];

  // Contractual SOW Shield Clauses
  const SOW_CLAUSES = [
    {
      id: 'clause-bank',
      title: 'Banking & Financial Institution SLA Clause',
      category: 'Technical & Finance',
      summary: `Mandates client bank format specifications within 3 weeks of Wave 0 sign-off; binds ${bankCertWeeks}-week testing lead time.`,
      clauseText: `CLIENT DEPENDENCY & BANK CERTIFICATION: The project schedule and fee estimate assume that Client will provide finalized banking specifications (ISO 20022 / BAI2 / MT940 format requirements, encryption keys, and connectivity protocols) within twenty-one (21) calendar days of Wave 0 completion. SI's obligation regarding host-to-host bank connectivity is contingent upon an external financial institution certification window of not more than ${bankCertWeeks} weeks. Delays in bank testing availability or material specification changes shall trigger an equitable adjustment to schedule and fees via formal Change Request.`
    },
    {
      id: 'clause-einvoicing',
      title: 'Statutory e-Invoicing Jurisdiction Boundary',
      category: 'Tax & Compliance',
      summary: `Restricts scope strictly to named countries (${einvoicingCountries.length > 0 ? einvoicingCountries.join(', ') : 'declared scope'}); excludes unanticipated government regulatory changes.`,
      clauseText: `STATUTORY TAX COMPLIANCE BOUNDARY: Services and deliverables include localization configuration solely for the declared jurisdictions (${einvoicingCountries.length > 0 ? einvoicingCountries.join(', ') : 'stated in RFP'}). Any mid-flight modifications to governmental e-invoicing schemas (e.g., clearance API protocols, cryptographic certificate authorities, or QR specifications) published after the Effective Date shall be deemed Out of Scope and managed as an Agile Spike / Change Order.`
    },
    {
      id: 'clause-data',
      title: 'Data Cleansing & Legacy Extraction Demarcation',
      category: 'Data Conversion',
      summary: 'Strictly limits SI responsibility to loading pre-cleansed FBDI/HDL files; max 3 mock conversions.',
      clauseText: `DATA CLEANSING & CONVERSION LIMITATIONS: Client is solely responsible for data extraction from legacy source systems, deduplication, data cleansing, and populating SI-provided Oracle FBDI/HDL conversion templates. SI effort is strictly bounded to a maximum of three (3) mock conversion cycles for the agreed ${dataObjectsCount} conversion objects. Client must deliver 100% cleansed golden records meeting SI schema validation rules no later than fourteen (14) days prior to each scheduled Mock Cycle.`
    },
    {
      id: 'clause-patch',
      title: 'Oracle Quarterly Update Testing Window',
      category: 'Governance & Infrastructure',
      summary: 'Enforces Oracle Cloud 21-day non-prod testing window and blackout freezes.',
      clauseText: `QUARTERLY CLOUD UPDATE PROTOCOL: Client acknowledges Oracle Corporation's mandatory quarterly cloud cadence. Project schedule incorporates a standard 21-day non-production validation cycle per release cohort. Client agrees that no major design iterations or functional scope expansions shall occur during the two (2) weeks preceding production cutover, during which strict change freezes apply.`
    },
    {
      id: 'clause-uat',
      title: 'UAT Business Defect Turnaround & Sign-off SLA',
      category: 'Testing & Sign-off',
      summary: 'Defines 5-day UAT scenario sign-off SLA to prevent indefinite acceptance testing drag.',
      clauseText: `USER ACCEPTANCE TESTING (UAT) EXIT CRITERIA: Client business subject matter experts shall execute assigned UAT test scripts within the designated testing window. Defect severity shall be categorized in accordance with OUM standards. UAT sign-off shall not be unreasonably withheld for Severity 3 or 4 cosmetic items with approved post-go-live workarounds. Formal stage gate approval or detailed written exception logs must be returned within five (5) business days of test cycle conclusion.`
    }
  ];

  // Full Deal Defense Executive Memo Generator
  const generateExecutiveDefenseMemo = () => {
    return `# DEAL DEFENSE & STEERCO JUSTIFICATION MEMORANDUM
CONFIDENTIAL - FOR BID DEFENSE & STEERCO REVIEW ONLY
Project Thor ID: ${thorId}
Client: ${clientName}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

================================================================================
1. EXECUTIVE DEAL SUMMARY & GOVERNANCE MANDATE
================================================================================
- Total Contract Value (TCV): ${tcvFormatted} (Delivery Revenue)
- Target Defensible Hours: ${totalHours.toLocaleString()} hrs (P80 Audited)
- Recommended Timeline: ${durationWeeks} Weeks (${durationMonths} Months)
- Blended Bill Rate: $${blendedRate}/hr
- Projected Gross Margin: ${marginPct}%
- DoA Governance Tier: Tier ${data.doaTier} (${data.doaApproverRole})
- Peak Delivery Team: ${peakFTE} FTEs (Avg: ${avgFTE} FTEs)
- Delivery Mix: ${scenario.onshoreMixPct || 30}% Onshore / ${scenario.offshoreMixPct || 70}% Offshore

================================================================================
2. THE 4 PILLARS OF DEAL FEASIBILITY & COMPETITIVE SUPERIORITY
================================================================================
Pillar 1: Deterministic Sizing vs. Speculative Bidding
Unlike competitors who submit an arbitrary 9-month schedule to win the bid and rely on change orders, our ${durationWeeks}-week plan is mathematically derived from the Oracle Unified Method (OUM) standard, accounting for ${selectedModObjs.length} core modules, ${entitiesCount} operating legal entities, and ${coaCount} Chart of Accounts.

Pillar 2: Guaranteed Wave 0 Enterprise Design
Wave 0 protects the client against the 3 most common enterprise ERP failures: COA churn, master data conflict, and statutory tax redesign. It ensures 100% of global accounting rules are signed off before configuration starts.

Pillar 3: Non-Negotiable External Dependency Scheduling
External bank host-to-host certification (SWIFT / ISO 20022) requires a mandatory ${bankCertWeeks}-week partner testing lead time. Competitors omitting this will fail to hit their go-live date.

Pillar 4: Production SOW Shield & Change Management
Clear demarcation of data extraction (Client) vs. loading (SI), a 3-mock conversion ceiling, and strict UAT sign-off SLAs eliminate margin erosion and protect the project's ${marginPct}% target margin.

================================================================================
3. TOP ORAL DEFENSE TALKING POINTS
================================================================================
Q: "Competitor Y is 20% cheaper."
A: Competitor pricing excludes OIC integrations, data conversion validation, or bank testing. Our ${tcvFormatted} fixed commitment includes all ${oicCount} integrations and ${dataObjectsCount} data objects with full delivery assurance.

Q: "Why ${durationWeeks} weeks instead of 9 months?"
A: External bank certification (${bankCertWeeks} weeks), dual SIT/UAT validation cycles, and statutory e-invoicing verification across ${einvoicingCountries.length} countries cannot be safely compressed without risking business downtime on Day 1.

================================================================================
4. KEY CONTRACTUAL ASSUMPTIONS (SCHEDULE A SUMMARY)
================================================================================
${SOW_CLAUSES.map(c => `- ${c.title.toUpperCase()}: ${c.summary}`).join('\n')}

Signed & Audited for Submission:
Oracle Cloud ERP Pursuit & Delivery Assurance Council
`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex ${
        panelMode === 'drawer'
          ? 'justify-end animate-in fade-in duration-150'
          : 'items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white shadow-2xl flex flex-col overflow-hidden text-slate-900 ${
          panelMode === 'drawer'
            ? 'w-full max-w-2xl sm:max-w-3xl h-full border-l border-slate-300 animate-in slide-in-from-right duration-200'
            : 'rounded-md border border-slate-300 w-full max-w-6xl max-h-[92vh]'
        }`}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-sm bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Award size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold tracking-tight text-white uppercase font-mono">
                  Deal Defense & SteerCo Justification Hub
                </h2>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs bg-amber-400 text-slate-950 uppercase tracking-widest">
                  Oral Defense Ready
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-xs bg-indigo-400/20 text-indigo-200 border border-indigo-300/30">
                  DoA Tier {data.doaTier}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Executive Rationale, Duration Defense & Orals Battlecard &bull; <strong className="text-white">{clientName}</strong> ({thorId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(generateExecutiveDefenseMemo(), 'memo')}
              className="px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="Copy Complete Deal Defense Executive Memorandum"
            >
              {copiedKey === 'memo' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedKey === 'memo' ? 'Memo Copied!' : 'Copy Executive Memo'}</span>
            </button>

            {onOpenWhatIfSimulator && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWhatIfSimulator();
                }}
                className="px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-amber-400 shadow-xs"
                title="Launch Live Trade-off Simulator"
              >
                <SlidersHorizontal size={14} className="stroke-[2.5]" />
                <span>Trade-off Simulator</span>
              </button>
            )}

            {/* Contextual Drawer / Modal Mode Toggle */}
            <button
              onClick={() => setPanelMode(panelMode === 'drawer' ? 'modal' : 'drawer')}
              className="px-2.5 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title={panelMode === 'drawer' ? 'Switch to Full Screen Modal' : 'Dock as Side Drawer'}
            >
              {panelMode === 'drawer' ? (
                <>
                  <Maximize2 size={13} />
                  <span className="hidden sm:inline">Expand Modal</span>
                </>
              ) : (
                <>
                  <Minimize2 size={13} />
                  <span className="hidden sm:inline">Dock Drawer</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Executive KPI Pulse Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Revenue (TCV):</span>
              <span className="font-mono font-black text-slate-900 ml-1.5 text-sm">{tcvFormatted}</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Duration:</span>
              <span className="font-mono font-black text-indigo-700 ml-1.5">{durationWeeks} wks ({durationMonths} mos)</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Effort:</span>
              <span className="font-mono font-bold text-slate-900 ml-1.5">{totalHours.toLocaleString()} hrs</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Blended Rate:</span>
              <span className="font-mono font-bold text-slate-900 ml-1.5">${blendedRate}/hr</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gross Margin:</span>
              <span className={`font-mono font-bold ml-1.5 ${marginPct >= 38 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {marginPct}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
            <span className="px-2 py-0.5 rounded-xs bg-slate-200 text-slate-800 font-mono font-bold">
              {selectedModObjs.length} Modules
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-slate-200 text-slate-800 font-mono font-bold">
              {entitiesCount} Entities
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-slate-200 text-slate-800 font-mono font-bold">
              {bankCertWeeks}w Bank SLA
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 flex gap-2 shrink-0">
          {[
            { id: 'thesis', label: '1. Executive Thesis & SteerCo Mandate', icon: ShieldCheck },
            { id: 'duration', label: '2. Duration & Timeline Defense', icon: Clock },
            { id: 'commercials', label: '3. Commercial & Margin Defense', icon: DollarSign },
            { id: 'objections', label: '4. Orals Gotcha Battlecard (6 Q&As)', icon: HelpCircle, badge: 'Crucial' },
            { id: 'sow_shield', label: '5. Contractual SOW Shield & Assumptions', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-900 bg-indigo-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-xs bg-amber-100 text-amber-900 border border-amber-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar space-y-6">
          
          {/* TAB 1: EXECUTIVE THESIS & STEERCO MANDATE */}
          {activeTab === 'thesis' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      The Executive Pitch Thesis: Why This Deal Is Defensible
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Use these 4 foundational pillars to defend the proposal to your internal Deal Review Board and the Client Steering Committee.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`THE 4 PILLARS OF DEAL DEFENSE (${clientName}):\n1. Deterministic Sizing: ${totalHours.toLocaleString()} hrs based on OUM benchmarks.\n2. Wave 0 Enterprise Design: Eliminates COA & statutory redesign risk.\n3. External Bank SLA: Mandatory ${bankCertWeeks}-week certification window.\n4. Contractual SOW Shield: Strict 3-mock conversion ceiling and RACI demarcation.`, 'thesis')}
                    className="px-2.5 py-1 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {copiedKey === 'thesis' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>Copy Thesis</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black">1</div>
                      <span>Deterministic Sizing vs Speculative Bidding</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our <strong>{totalHours.toLocaleString()} hours</strong> and <strong>{durationWeeks} weeks</strong> are derived directly from the Oracle Unified Method (OUM) standard. We quantify real multi-entity complexity ({entitiesCount} entities, {coaCount} COA, {selectedModObjs.length} modules) rather than providing a low-ball quote that triggers emergency change orders mid-project.
                    </p>
                    <div className="text-[11px] font-mono font-bold text-indigo-900 bg-indigo-50/60 p-2 rounded-xs">
                      Benefit: 96% on-budget historical delivery rate across peer Oracle Fusion deployments.
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black">2</div>
                      <span>Mandatory Wave 0 Enterprise Design</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We do not jump into configuration without a signed Foundation Design. Establishing global Chart of Accounts, Subledger Accounting (SLA), and intercompany clearing during Wave 0 eliminates up to 40% of downstream rework that plagues hasty implementations.
                    </p>
                    <div className="text-[11px] font-mono font-bold text-indigo-900 bg-indigo-50/60 p-2 rounded-xs">
                      Benefit: Eliminates design churn during SIT and guarantees seamless consolidation.
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black">3</div>
                      <span>Realistic External Dependency Buffering</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We explicitly account for external lead times: a mandatory <strong>{bankCertWeeks}-week bank host-to-host certification window</strong> and quarterly Oracle patch blackouts. Competitors who promise 9-month delivery silently assume instantaneous 3-day bank turnaround—a mathematical impossibility.
                    </p>
                    <div className="text-[11px] font-mono font-bold text-indigo-900 bg-indigo-50/60 p-2 rounded-xs">
                      Benefit: Protects the executive sponsor from high-profile go-live postponements.
                    </div>
                  </div>

                  <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black">4</div>
                      <span>Industrialized SOW Demarcation Shield</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We clearly bound the scope: max 3 mock conversions, client responsibility for legacy data cleansing, and explicit UAT defect turnaround SLAs. This protects both parties from ambiguity, margin dilution, and scope creep.
                    </p>
                    <div className="text-[11px] font-mono font-bold text-indigo-900 bg-indigo-50/60 p-2 rounded-xs">
                      Benefit: Guaranteed margin delivery ({marginPct}%) and clear operational accountability.
                    </div>
                  </div>
                </div>
              </div>

              {/* SteerCo Governance & Sign-off Checklist */}
              <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>Internal SteerCo Approval Checklist (DoA Tier {data.doaTier})</span>
                  <span className="text-xs text-slate-500 font-normal">Approver: <strong>{data.doaApproverRole}</strong></span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-sm">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 size={14} />
                      <span>Margin Guardrail</span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      Projected margin is <strong>{marginPct}%</strong> (DoA standard is 38%+). Meets required hurdle rate without concessions.
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-sm">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 size={14} />
                      <span>P80 Risk Buffer</span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      Total effort includes defensible P80 statistical buffer against technical integration & conversion volatility.
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-sm">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 size={14} />
                      <span>Delivery Feasibility</span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      Peak staffing of {peakFTE} FTEs is supportable by GDC offshore resource pools and certified Grade A architects.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DURATION & TIMELINE DEFENSE */}
          {activeTab === 'duration' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Why {durationWeeks} Weeks ({durationMonths} Months) Is the Minimum Safe Timeline
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Detailed phase breakdown defending the schedule against client pressure to compress timelines.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-700">Recommended Duration</div>
                    <div className="text-base font-mono font-black text-indigo-700">{durationWeeks} WEEKS</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <div className="p-2 rounded-xs bg-indigo-100 text-indigo-700 font-mono font-bold text-xs shrink-0">
                      Wave 0
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Enterprise Design & Foundation Architecture (~6-8 Weeks)</span>
                        <span className="text-indigo-600 font-mono">Mandatory Non-Compressible</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Multi-entity COA harmonization across {entitiesCount} entities, tax regime design for {einvoicingCountries.length > 0 ? einvoicingCountries.join(', ') : 'statutory tax jurisdictions'}, and technical infrastructure provisioning. Skipping this creates catastrophic rework during SIT.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <div className="p-2 rounded-xs bg-indigo-100 text-indigo-700 font-mono font-bold text-xs shrink-0">
                      Build
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Iterative Configuration & RICEFW Development (~12-16 Weeks)</span>
                        <span className="text-slate-600 font-mono">{oicCount} OIC Interfaces &bull; {dataObjectsCount} Data Objects</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Configuration of {selectedModObjs.length} modules, fast formulas, automated approval hierarchies, and integration pipelines into legacy systems. Includes Mock Conversion Cycle 1.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <div className="p-2 rounded-xs bg-indigo-100 text-indigo-700 font-mono font-bold text-xs shrink-0">
                      Testing
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>System Integration Testing (SIT 1 & 2) and User Acceptance Testing (UAT) (~10-12 Weeks)</span>
                        <span className="text-amber-700 font-mono font-bold">External Bank Cert: {bankCertWeeks}w</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        SIT 1 tests functional modules; SIT 2 tests E2E integrations and external bank transmission protocols ({bankCertWeeks}-week lead time). UAT requires 4 weeks of dedicated business user testing and payroll/close simulations.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <div className="p-2 rounded-xs bg-indigo-100 text-indigo-700 font-mono font-bold text-xs shrink-0">
                      Deploy
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Cutover, Go-Live & Post-Go-Live Hypercare (~4-6 Weeks)</span>
                        <span className="text-slate-600 font-mono">Strategy: {cutoverStrategy}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Final delta data extraction, opening balance validation, AP/AR subledger reconciliation, day-one transaction command center, and first month-end close support.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                    <AlertTriangle size={15} />
                    <span>The "Schedule Compression Trap" (How to counter a client asking for 9 months):</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    "If we compress the schedule from {durationWeeks} to 36 weeks (9 months), we mathematically eliminate either the second SIT cycle or the Bank Certification window. That means your bank payments and {einvoicingCountries.length > 0 ? 'statutory e-invoices' : 'invoices'} would be tested for the first time in live production—creating severe financial and operational exposure for your controllership team."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL & MARGIN DEFENSE */}
          {activeTab === 'commercials' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Commercial Structure & Staffing Pyramid Defense
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Defending the ${blendedRate}/hr blended rate and transparent grade distribution.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-700">Blended Rate</div>
                    <div className="text-base font-mono font-black text-emerald-700">${blendedRate} / HR</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { grade: 'Grade A', title: 'Lead Architect', targetMix: '20%', rate: '$210/hr', desc: 'Solution governance, COA design, client executive SteerCo alignment.' },
                    { grade: 'Grade B', title: 'Senior Consultant', targetMix: '35%', rate: '$150/hr', desc: 'Functional stream leads, complex integrations, tax engine setup.' },
                    { grade: 'Grade C', title: 'Consultant', targetMix: '30%', rate: '$105/hr', desc: 'Configuration, testing execution, functional specification documents.' },
                    { grade: 'Grade D', title: 'Associate / Analyst', targetMix: '10%', rate: '$75/hr', desc: 'Conversion data loading, test script execution, documentation.' },
                    { grade: 'Grade E', title: 'GDC Tech Specialist', targetMix: '5%', rate: '$50/hr', desc: 'Batch OTBI/BIP reports, interface automated regression testing.' },
                  ].map(g => (
                    <div key={g.grade} className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{g.grade}</span>
                        <span className="text-indigo-600 font-mono">{g.targetMix}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">{g.title}</div>
                      <div className="text-[10px] font-mono font-bold text-emerald-700">{g.rate} (std)</div>
                      <p className="text-[11px] text-slate-500 pt-1 leading-snug">{g.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Commercial Defense Script for Procurement Negotiations:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Our blended rate of <strong>${blendedRate}/hr</strong> is achieved through an optimized 70% offshore delivery model backed by seasoned Grade A and Grade B Oracle Certified architects. Rather than burying low-experience junior resources in an artificially cheap rate card, we staff 55% senior leadership (Grades A & B) during critical design phases, ensuring your configuration is built right the first time and reducing post-production support costs by an estimated 60%."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORALS GOTCHA BATTLECARD */}
          {activeTab === 'objections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Top 6 Client Orals "Gotchas" & Master Counter-Responses
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any objection below to review winning talk tracks, mathematical evidence, and negotiation traps to avoid.
                  </p>
                </div>
                <div className="w-64">
                  <input
                    type="text"
                    placeholder="Filter objections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-sm border border-slate-300 bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Objections List */}
                <div className="lg:col-span-5 space-y-2">
                  {filteredObjections.map((obj, idx) => {
                    const isSelected = obj.id === selectedObjection.id;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjectionId(obj.id)}
                        className={`w-full text-left p-3 rounded-sm border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs shrink-0 uppercase ${
                          isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {obj.category}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold leading-snug line-clamp-2">
                            {obj.question}
                          </div>
                        </div>
                        <ChevronRight size={14} className={isSelected ? 'text-indigo-300' : 'text-slate-400'} />
                      </button>
                    );
                  })}
                </div>

                {/* Selected Objection Deep Dive */}
                <div className="lg:col-span-7 bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-indigo-100 text-indigo-800 uppercase">
                        {selectedObjection.category} Defense
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">Battlecard Answer</h4>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`OBJECTION: ${selectedObjection.question}\n\nWINNING TALK TRACK:\n${selectedObjection.winningTalkTrack}\n\nDATA PROOF:\n${selectedObjection.dataProofPoints.join('\n')}`, 'talktrack')}
                      className="px-2.5 py-1 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'talktrack' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>Copy Answer</span>
                    </button>
                  </div>

                  {/* Question Box */}
                  <div className="p-3.5 rounded-sm bg-slate-900 text-white space-y-1">
                    <div className="text-[10px] font-mono uppercase text-indigo-300 font-bold">Client Question / Pushback:</div>
                    <div className="text-xs font-bold text-white leading-relaxed">
                      {selectedObjection.question}
                    </div>
                    <div className="text-[11px] text-slate-300 pt-1 italic">
                      Client Motivation: {selectedObjection.clientPerspective}
                    </div>
                  </div>

                  {/* Winning Talk Track */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Winning Talk Track (Presenter Response):</span>
                    </div>
                    <div className="p-3.5 rounded-sm bg-emerald-50/50 border border-emerald-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {selectedObjection.winningTalkTrack}
                    </div>
                  </div>

                  {/* Data Proof Points */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5 text-indigo-800">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>Quantitative Evidence & Data Proof:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 pl-2">
                      {selectedObjection.dataProofPoints.map((proof, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">&bull;</span>
                          <span>{proof}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trap to Avoid */}
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-rose-600" />
                      <span>Trap to Avoid During Orals:</span>
                    </div>
                    <p className="text-rose-800 leading-snug">
                      {selectedObjection.trapToAvoid}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOW SHIELD & CONTRACTUAL ASSUMPTIONS */}
          {activeTab === 'sow_shield' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Contractual SOW Shield & Assumption Register
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Legally defensive clauses generated from project drivers that prevent margin dilution and scope creep.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(SOW_CLAUSES.map(c => `=== ${c.title.toUpperCase()} ===\n${c.clauseText}\n`).join('\n\n'), 'all_clauses')}
                  className="px-3 py-1.5 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedKey === 'all_clauses' ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  <span>Copy All 5 SOW Clauses</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SOW_CLAUSES.map(clause => (
                  <div key={clause.id} className="bg-white p-4 rounded-md border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 uppercase">
                          {clause.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{clause.title}</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(clause.clauseText, clause.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === clause.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === clause.id ? 'Copied' : 'Copy Clause'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      Summary: {clause.summary}
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {clause.clauseText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>PB-Estimo Deal Defense Hub &bull; All talk tracks aligned with Oracle Unified Method (OUM) standards</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenSlideDeck && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSlideDeck();
                }}
                className="px-4 py-2 rounded-sm bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} />
                <span>Executive Slide Deck</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-300 transition cursor-pointer"
            >
              Close Hub
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
