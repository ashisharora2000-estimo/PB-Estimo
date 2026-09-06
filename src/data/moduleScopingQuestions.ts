import { OracleModule, TShirtSize, ModuleScopingQuestion } from '../types';

export type { ModuleScopingQuestion };

export function isQuestionMandatory(q: ModuleScopingQuestion, idx?: number): boolean {
  if (q.isMandatory !== undefined) return q.isMandatory;
  if (idx !== undefined) return [0, 1, 5, 7, 9].includes(idx);
  return false;
}

export function getQuestionTag(q: ModuleScopingQuestion, idx?: number): string {
  if (q.tag) return q.tag;
  return isQuestionMandatory(q, idx) ? 'Core Topology Driver' : 'Optional Deep-Dive';
}

export function getQuestionWeight(q: ModuleScopingQuestion, idx?: number): number {
  if (q.weight !== undefined) return q.weight;
  return isQuestionMandatory(q, idx) ? 2.5 : 1.0;
}

export interface ModuleScopingMetrics {
  avgScore: number;
  calculatedTShirt: TShirtSize;
  tShirtScore: number;
  totalDeltaHours: number;
  mandatoryTotal: number;
  mandatoryAnswered: number;
  optionalTotal: number;
  optionalAnswered: number;
  isCoreComplete: boolean;
  completionPercentage: number;
  scopingMode: 'fast_track' | 'comprehensive';
  primaryDrivers: string[];
}

export function calculateModuleScopingMetrics(
  questions: ModuleScopingQuestion[],
  answers: number[] | undefined,
  overrides?: { tShirtOverride?: TShirtSize; modComplexityFactor?: number }
): ModuleScopingMetrics {
  if (!questions || questions.length === 0) {
    return {
      avgScore: 2.0,
      calculatedTShirt: 'M',
      tShirtScore: 3.0,
      totalDeltaHours: 0,
      mandatoryTotal: 0,
      mandatoryAnswered: 0,
      optionalTotal: 0,
      optionalAnswered: 0,
      isCoreComplete: true,
      completionPercentage: 100,
      scopingMode: 'fast_track',
      primaryDrivers: []
    };
  }

  let mandatoryWeightedScore = 0;
  let mandatoryTotalWeight = 0;
  let mandatoryTotalCount = 0;
  let mandatoryAnsweredCount = 0;

  let optionalWeightedScore = 0;
  let optionalTotalWeight = 0;
  let optionalTotalCount = 0;
  let optionalAnsweredCount = 0;

  let totalDeltaHours = 0;
  const primaryDrivers: string[] = [];

  questions.forEach((q, idx) => {
    const isMandatory = isQuestionMandatory(q, idx);
    const weight = getQuestionWeight(q, idx);
    const rawAnswer = answers ? answers[idx] : undefined;
    const isAnswered = rawAnswer !== undefined && rawAnswer !== null && rawAnswer >= 0;

    if (isMandatory) {
      mandatoryTotalCount++;
      const optIdx = isAnswered ? rawAnswer : 1; // Default to Level 2 (index 1) if not answered yet
      const opt = q.options[optIdx] || q.options[0];
      if (isAnswered) mandatoryAnsweredCount++;

      const score = opt.score || 2;
      mandatoryWeightedScore += score * weight;
      mandatoryTotalWeight += weight;
      totalDeltaHours += (opt.hoursImpact || 0);

      if (score >= 3 && primaryDrivers.length < 3) {
        primaryDrivers.push(`${q.question}: ${opt.label}`);
      }
    } else {
      optionalTotalCount++;
      if (isAnswered) {
        optionalAnsweredCount++;
        const opt = q.options[rawAnswer] || q.options[0];
        const score = opt.score || 1;
        optionalWeightedScore += score * weight;
        optionalTotalWeight += weight;
        totalDeltaHours += (opt.hoursImpact || 0);

        if (score >= 3 && primaryDrivers.length < 3) {
          primaryDrivers.push(`${q.question}: ${opt.label}`);
        }
      } else {
        // Optional question UNANSWERED:
        // By design, optional questions do not distort the score when unanswered.
        // They are assumed at Modern Best Practice (Fit-to-Standard / score 1) with 0 delta hours,
        // and do not dilute the mandatory questions' weighted score!
      }
    }
  });

  // Calculate composite average score
  // If no optional questions are answered, avgScore is governed 100% by the mandatory core questions!
  const totalWeight = mandatoryTotalWeight + optionalTotalWeight;
  const totalScore = mandatoryWeightedScore + optionalWeightedScore;
  const avgScore = totalWeight > 0 ? Number((totalScore / totalWeight).toFixed(2)) : 2.0;

  // Derived T-Shirt size from composite average score
  let calculatedTShirt: TShirtSize = 'M';
  let tShirtScore = 3.0;

  if (avgScore < 1.60) {
    calculatedTShirt = 'XS';
    tShirtScore = 1.0 + ((avgScore - 1.0) / 0.60) * 0.9;
  } else if (avgScore < 2.35) {
    calculatedTShirt = 'S';
    tShirtScore = 2.0 + ((avgScore - 1.60) / 0.75) * 0.9;
  } else if (avgScore < 3.05) {
    calculatedTShirt = 'M';
    tShirtScore = 3.0 + ((avgScore - 2.35) / 0.70) * 0.9;
  } else if (avgScore < 3.65) {
    calculatedTShirt = 'L';
    tShirtScore = 4.0 + ((avgScore - 3.05) / 0.60) * 0.9;
  } else if (avgScore < 3.90) {
    calculatedTShirt = 'XL';
    tShirtScore = 5.0 + ((avgScore - 3.65) / 0.25) * 0.9;
  } else {
    calculatedTShirt = 'XXL';
    tShirtScore = 6.0;
  }

  const isCoreComplete = mandatoryAnsweredCount >= mandatoryTotalCount;
  const scopingMode = optionalAnsweredCount > 0 ? 'comprehensive' : 'fast_track';
  const totalQuestions = mandatoryTotalCount + optionalTotalCount;
  const totalAnswered = mandatoryAnsweredCount + optionalAnsweredCount;
  const completionPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 100;

  return {
    avgScore,
    calculatedTShirt,
    tShirtScore,
    totalDeltaHours,
    mandatoryTotal: mandatoryTotalCount,
    mandatoryAnswered: mandatoryAnsweredCount,
    optionalTotal: optionalTotalCount,
    optionalAnswered: optionalAnsweredCount,
    isCoreComplete,
    completionPercentage,
    scopingMode,
    primaryDrivers
  };
}

// Top 20 Detailed Domain Questions for Oracle Fusion Modules
export const MODULE_TOP_20_QUESTIONS: Record<string, ModuleScopingQuestion[]> = {
  // GENERAL LEDGER (GL)
  erp_gl: [
    {
      id: 'gl_1',
      category: 'Process Scope',
      question: 'Chart of Accounts (COA) Structure & Segment Depth',
      rationale: 'Governs financial dimensionality, cross-validation rules, summary accounts, and posting performance.',
      options: [
        { label: 'Standard 4-6 Segments (MBP)', score: 1, desc: 'Company, Cost Center, Account, Intercompany, Sub-Account.', hoursImpact: 0 },
        { label: '7-8 Segments with Secondary Ledger', score: 2, desc: 'Adds Product Line, Location, Project segment with IFRS mapping.', hoursImpact: 35 },
        { label: '9-10 Segments with Multi-GAAP Ledgers', score: 3, desc: 'Statutory, Management, and Tax valuation secondary ledgers with SLA mappings.', hoursImpact: 75 },
        { label: 'Complex 11+ Segments with Dynamic Insertion', score: 4, desc: 'Heavy cross-validation rules (CVRs) and dynamic segment qualification logic.', hoursImpact: 120 }
      ]
    },
    {
      id: 'gl_2',
      category: 'Process Scope',
      question: 'Intercompany Balancing & Elimination Engine (AGIS)',
      rationale: 'Drives cross-entity trading partner balancing, automated eliminations, and settlement accounts.',
      options: [
        { label: 'Single Legal Entity / No Intercompany', score: 1, desc: 'No cross-entity balancing required.', hoursImpact: 0 },
        { label: 'Standard Automatic Journal Lines', score: 2, desc: 'Single-tier balancing on standard receivables/payables accounts.', hoursImpact: 25 },
        { label: 'Multi-Tier AGIS Invoicing & Netting', score: 3, desc: 'Intercompany invoicing, dispute workflow, multi-currency settlement.', hoursImpact: 60 },
        { label: 'Complex Cross-Border Bilateral Netting & Tolling', score: 4, desc: 'Transfer pricing markups, withholding tax, and cross-currency settlement matrices.', hoursImpact: 100 }
      ]
    },
    {
      id: 'gl_3',
      category: 'Process Scope',
      question: 'Foreign Currency Revaluation & Balance Sheet Translation',
      rationale: 'Impacts daily exchange rate feeds, cumulative translation adjustments (CTA), and dual-currency ledgers.',
      options: [
        { label: 'Single Domestic Operating Currency', score: 1, desc: 'No foreign currency revaluation needed.', hoursImpact: 0 },
        { label: 'Standard Daily Rates & Monthly Revaluation', score: 2, desc: 'Automated daily FX feeds and month-end unrealized gain/loss runs.', hoursImpact: 20 },
        { label: 'Multi-Currency Balance Sheet Translation (CTA)', score: 3, desc: 'CTA equity accounts for global consolidation under ASC 830 / IAS 21.', hoursImpact: 45 },
        { label: 'Complex Historical Rates & Remeasurement', score: 4, desc: 'Dual-reporting currencies, hyper-inflationary accounting, and historical rate overrides.', hoursImpact: 85 }
      ]
    },
    {
      id: 'gl_4',
      category: 'Process Scope',
      question: 'Financial Allocations & Calculation Manager Rules',
      rationale: 'Configures Essbase multi-step cascading cost allocations based on headcount, square footage, or revenue.',
      options: [
        { label: 'Manual Journal Entries Only', score: 1, desc: 'No automated allocation engine required.', hoursImpact: 0 },
        { label: 'Standard Formula-Based Recurring Journals', score: 2, desc: 'Spreadsheet-based recurring entries (<15 templates).', hoursImpact: 20 },
        { label: 'Calculation Manager (Essbase) Complex Allocations', score: 3, desc: 'Multi-step cascading cost allocations across corporate cost pools.', hoursImpact: 55 },
        { label: 'Dynamic Multi-Dimensional Shared-Service Models', score: 4, desc: 'Iterative circular allocation rules across hundreds of global business units.', hoursImpact: 95 }
      ]
    },
    {
      id: 'gl_5',
      category: 'Process Scope',
      question: 'Period-End Close Orchestration & Task Manager',
      rationale: 'Controls close dependencies, subledger sweeps, SLA validation, and automated fast-close milestones.',
      options: [
        { label: 'Decentralized Manual Close', score: 1, desc: 'Standard GL open/close period control.', hoursImpact: 0 },
        { label: 'Standard Subledger Close Sequence', score: 2, desc: 'AP, AR, FA, CM subledger sweep prior to GL close.', hoursImpact: 25 },
        { label: 'Financial Close Automation with Task Manager', score: 3, desc: 'Structured close schedules, role-based task assignments, automated validation.', hoursImpact: 50 },
        { label: 'Real-Time Continuous Accounting & Automated Close', score: 4, desc: 'Custom SLA accounting events, auto-reconciliation, and continuous close pipeline.', hoursImpact: 85 }
      ]
    },
    {
      id: 'gl_6',
      category: 'Integrations & Feeds',
      question: 'External Subledger Inbound Journal Ingestion',
      rationale: 'Determines OIC/FBDI journal import pipelines, suspense account routing, and pre-posting validation.',
      options: [
        { label: 'Oracle Cloud Native Subledgers Only', score: 1, desc: 'Zero external journal feeds.', hoursImpact: 0 },
        { label: 'Batch SFTP / FBDI Monthly Feeds (<3 systems)', score: 2, desc: 'Automated daily or weekly summary GL interface with automated error alerts.', hoursImpact: 35 },
        { label: 'Real-Time REST APIs with Subledger Validation', score: 3, desc: '4-7 legacy subsystems streaming journal batches into GL Interface with custom validation.', hoursImpact: 75 },
        { label: 'High-Volume Streaming Engine (>8 systems)', score: 4, desc: 'Tens of thousands of lines/sec, complex transformation, automated duplicate rejection.', hoursImpact: 125 }
      ]
    },
    {
      id: 'gl_7',
      category: 'Integrations & Feeds',
      question: 'Automated Daily Exchange Rate Feeds (FX Gateways)',
      rationale: 'Integrates corporate treasury or central bank rates (e.g. Reuters, Bloomberg, OANDA, ECB) into Oracle Daily Rates.',
      options: [
        { label: 'Manual Rate Entry / Spreadsheet Upload', score: 1, desc: 'Rates entered manually per period.', hoursImpact: 0 },
        { label: 'Standard Central Bank Automated Feed (ECB/Fed)', score: 2, desc: 'OIC scheduled orchestration pulling daily spot rates.', hoursImpact: 20 },
        { label: 'Multi-Source FX Vendor Integration (OANDA/Bloomberg)', score: 3, desc: 'Direct API integration with fallback providers, spot, corporate, and triangulation rates.', hoursImpact: 45 },
        { label: 'Treasury System Bi-Directional Rate & Forward Curve Sync', score: 4, desc: 'Kyriba/Reval automated two-way sync of spot, forward, and custom contract rates.', hoursImpact: 75 }
      ]
    },
    {
      id: 'gl_8',
      category: 'Data & Conversions',
      question: 'Historical GL Balances & Open Detail Migration',
      rationale: 'Impacts FBDI journal load complexity, opening trial balance reconciliation, and multi-year comparative reporting.',
      options: [
        { label: 'Opening Net Trial Balance Only (1 Period)', score: 1, desc: 'Single period opening balance per ledger.', hoursImpact: 15 },
        { label: '1 Year Monthly Historical Net Balances', score: 2, desc: '12 monthly historical TBs for prior year comparative reporting.', hoursImpact: 40 },
        { label: '2-3 Years Monthly Historical Balances + Open Items', score: 3, desc: 'Multi-year historical balances with legacy COA cross-reference mapping.', hoursImpact: 80 },
        { label: '5+ Years Historical Balances with Subledger Drilldown', score: 4, desc: 'Deep multi-year history, historical currency translation conversion, full audit trail.', hoursImpact: 130 }
      ]
    },
    {
      id: 'gl_9',
      category: 'Data & Conversions',
      question: 'Chart of Accounts Legacy-to-Target Mapping Complexity',
      rationale: 'Determines COA cross-validation rules, 1-to-many segment derivations, and automated transform tables.',
      options: [
        { label: 'Direct 1-to-1 Segment Mapping', score: 1, desc: 'Legacy COA cleanly maps into new Fusion segments.', hoursImpact: 10 },
        { label: 'Standard Multi-Company Normalization', score: 2, desc: 'Harmonizing 2-3 legacy charts into a unified global COA.', hoursImpact: 35 },
        { label: 'Complex 1-to-Many Split Logic & Hierarchy Reshaping', score: 3, desc: 'Conditional derivation based on cost center, project, and product attributes.', hoursImpact: 75 },
        { label: 'Mass M&A Multi-System Disparate COA Overhaul', score: 4, desc: 'Consolidating 6+ heterogeneous legacy ERP charts of accounts with historical restatement.', hoursImpact: 120 }
      ]
    },
    {
      id: 'gl_10',
      category: 'Approvals & Workflows',
      question: 'Journal Approval Workflow (BPM) Hierarchy Rules',
      rationale: 'Drives BPM Worklist rule sets, supervisory limits, cost center owner approvals, and routing escalations.',
      options: [
        { label: 'No Workflow / Direct Posting by Authorized Roles', score: 1, desc: 'Direct journal posting with audit logging.', hoursImpact: 0 },
        { label: 'Standard Supervisory Approval Limit Hierarchy', score: 2, desc: 'Single-tier approval based on journal batch monetary threshold.', hoursImpact: 25 },
        { label: 'Multi-Dimensional Approval Matrix (Entity + Value + Source)', score: 3, desc: 'Dynamic routing to Cost Center Owners, Legal Entity Controllers, and Intercompany Leads.', hoursImpact: 60 },
        { label: 'Complex Matrix with Parallel Sign-Off & SLA Escalation', score: 4, desc: 'Multi-layer conditional routing, group votes, out-of-office delegation, strict SOX SLA audit.', hoursImpact: 95 }
      ]
    },
    {
      id: 'gl_11',
      category: 'Approvals & Workflows',
      question: 'Statistical & Non-Financial Journal Entry Controls',
      rationale: 'Tracks non-financial metrics (headcount, square footage, units produced) for allocation drivers.',
      options: [
        { label: 'Financial Amounts Only (No Statistical Tracking)', score: 1, desc: 'Standard monetary currency journals.', hoursImpact: 0 },
        { label: 'Basic Statistical Units for Cost Allocation', score: 2, desc: 'Manual statistical journals for monthly allocation drivers.', hoursImpact: 15 },
        { label: 'Automated Statistical Ingestion from Operational Feeds', score: 3, desc: 'Automated feeds from HR/Operations or MES into statistical accounts.', hoursImpact: 40 },
        { label: 'Dual-Currency and Real-Time Operational KPI Ledger', score: 4, desc: 'Integrated ESG carbon footprint, sustainability units, and operational yield tracking in GL.', hoursImpact: 70 }
      ]
    },
    {
      id: 'gl_12',
      category: 'Reporting & Analytics',
      question: 'Financial Reporting Studio (FRS) & Board Report Depth',
      rationale: 'Configures executive P&L, Balance Sheet, Cash Flow, and multidimensional Essbase financial reports.',
      options: [
        { label: 'Standard Out-of-the-Box FRS Templates (<5 reports)', score: 1, desc: 'Standard P&L and Balance Sheet with minimal formatting.', hoursImpact: 20 },
        { label: 'Custom Corporate FRS Financial Pack (6-15 reports)', score: 2, desc: 'Executive P&L by LOB, Balance Sheet by Legal Entity, Cash Flow, Variance to Budget.', hoursImpact: 50 },
        { label: 'Extensive Multi-GAAP / Multi-Entity Pack (16-30 reports)', score: 3, desc: 'Statutory filing packs, segment reporting (IFRS 8), interactive drill-through grids.', hoursImpact: 95 },
        { label: 'Enterprise Complex Board Deck & Regulatory Filing Suite (30+)', score: 4, desc: 'Pixel-perfect formatted financial packages, XBRL tagging, dynamic currency translation.', hoursImpact: 150 }
      ]
    },
    {
      id: 'gl_13',
      category: 'Reporting & Analytics',
      question: 'Smart View Excel Add-in & Ad-Hoc Financial Analysis',
      rationale: 'Enables finance power-users to query Essbase GL balances directly within Microsoft Excel.',
      options: [
        { label: 'Standard Web Inquiry & Basic Smart View', score: 1, desc: 'Standard pre-built Smart View connections.', hoursImpact: 10 },
        { label: 'Curated Smart View Executive Templates (<10 workbooks)', score: 2, desc: 'Standardized monthly review sheets with dynamic member selection.', hoursImpact: 25 },
        { label: 'Enterprise Ad-Hoc Smart View Library & Flash Reporting', score: 3, desc: 'Multi-cube drill-downs, dynamic asymmetric queries, automated email burst packages.', hoursImpact: 55 },
        { label: 'Complex Hybrid Model with EPM / PBCS Integrated Sheets', score: 4, desc: 'Bi-directional Smart View workbooks syncing GL actuals, budget forecasts, and cash plans.', hoursImpact: 90 }
      ]
    },
    {
      id: 'gl_14',
      category: 'Reporting & Analytics',
      question: 'OTBI Real-Time Subledger Reconciliation Analytics',
      rationale: 'Automates subledger-to-GL balance reconciliation across AP, AR, Inventory, and Fixed Assets.',
      options: [
        { label: 'Standard Oracle Pre-Built OTBI Dashboard', score: 1, desc: 'Out-of-the-box reconciliation reports.', hoursImpact: 15 },
        { label: 'Customized Subledger-to-GL Discrepancy Reports', score: 2, desc: 'Automated exception highlighting for unposted subledger lines.', hoursImpact: 35 },
        { label: 'Enterprise Automated Reconciliation Dashboard Hub', score: 3, desc: 'Real-time drill-down to invoice/payment detail with variance tracking.', hoursImpact: 65 },
        { label: 'AI-Powered Anomaly Detection & Continuous Audit Reports', score: 4, desc: 'Automated pattern recognition for unusual journal postings, duplicate entries, and CVR breaches.', hoursImpact: 100 }
      ]
    },
    {
      id: 'gl_15',
      category: 'Compliance & Security',
      question: 'Subledger Accounting (SLA) Custom Accounting Rules',
      rationale: 'Customizes accounting event models, journal entry rule sets (JERS), and account derivation rules (ADR).',
      options: [
        { label: 'Standard Out-of-the-Box SLA Rules (Zero Customization)', score: 1, desc: 'Default Oracle subledger accounting logic across all subledgers.', hoursImpact: 0 },
        { label: 'Minor SLA Account Derivations (1-3 Rules per Subledger)', score: 2, desc: 'Custom cost center or project derivation from item categories or supplier sites.', hoursImpact: 40 },
        { label: 'Advanced Multi-Condition SLA Rules & Custom Sources', score: 3, desc: 'Custom SLA mapping sets, description rules, multi-attribute balancing across AP/AR/INV.', hoursImpact: 85 },
        { label: 'Extreme SLA Overhaul with Third-Party Accounting Event Capture', score: 4, desc: 'Bespoke subledger accounting engine for custom legacy billing/trading platforms.', hoursImpact: 140 }
      ]
    },
    {
      id: 'gl_16',
      category: 'Compliance & Security',
      question: 'Data Access Sets & Segment Value Security (SVS)',
      rationale: 'Restricts user visibility to specific legal entities, cost centers, or confidential management accounts.',
      options: [
        { label: 'Full Ledger Access for Finance Team', score: 1, desc: 'Standard role-based ledger access without row-level restrictions.', hoursImpact: 10 },
        { label: 'Data Access Sets Restricted by Legal Entity / Ledger', score: 2, desc: 'Users segregated by country/entity operating units.', hoursImpact: 25 },
        { label: 'Segment Value Security (SVS) on Confidential Cost Centers', score: 3, desc: 'Restricting executive payroll or R&D cost centers to privileged roles.', hoursImpact: 50 },
        { label: 'Complex Cross-Segment Multi-Tier Security Matrix', score: 4, desc: 'Dynamic data security policies combining Entity, Cost Center, and Intercompany dimension security.', hoursImpact: 85 }
      ]
    },
    {
      id: 'gl_17',
      category: 'Compliance & Security',
      question: 'SOX 404 Audit Logging & Journal Sequence Compliance',
      rationale: 'Enforces gapless journal sequence numbering, audit trail policies, and segregation of duties (SOD).',
      options: [
        { label: 'Standard System Journal Tracking', score: 1, desc: 'Default created-by / last-updated-by audit fields.', hoursImpact: 10 },
        { label: 'Document & Accounting Sequencing by Ledger', score: 2, desc: 'Gapless sequence numbers for statutory journal compliance.', hoursImpact: 25 },
        { label: 'Comprehensive SOX Audit Trail with Change Logging', score: 3, desc: 'Audit history tracking on COA hierarchies, cross-validation rules, and approval limits.', hoursImpact: 45 },
        { label: 'Strict Multi-Country Statutory Compliance with External Cryptographic Signing', score: 4, desc: 'Automated SAF-T export, cryptographic journal chaining for European/LATAM audit authorities.', hoursImpact: 80 }
      ]
    },
    {
      id: 'gl_18',
      category: 'Integrations & Feeds',
      question: 'Consolidation Cloud (EPM FCCS) Bi-Directional Integration',
      rationale: 'Automates data sync between Oracle Fusion GL and Oracle Enterprise Financial Consolidation & Close (FCCS).',
      options: [
        { label: 'No Consolidation Cloud Integration / Single Ledger', score: 1, desc: 'Consolidation performed directly in GL.', hoursImpact: 0 },
        { label: 'Standard Data Management Direct Connector', score: 2, desc: 'Scheduled batch extraction of monthly actual trial balance into FCCS.', hoursImpact: 25 },
        { label: 'Drill-Through from FCCS to Fusion GL Subledger Detail', score: 3, desc: 'Enabling seamless drill-through from consolidated balance sheet to Fusion subledger transactions.', hoursImpact: 55 },
        { label: 'Automated Real-Time Triggered Consolidation with Write-Back', score: 4, desc: 'Event-driven trial balance extract with automated elimination journal write-back to GL.', hoursImpact: 95 }
      ]
    },
    {
      id: 'gl_19',
      category: 'Data & Conversions',
      question: 'Cross-Validation Rules (CVR) & Value Set Maintenance',
      rationale: 'Defines invalid segment combination filters to prevent improper postings at time of transaction entry.',
      options: [
        { label: 'Minimal CVRs (<10 standard rules)', score: 1, desc: 'Basic restrictions (e.g., BS accounts cannot have product codes).', hoursImpact: 10 },
        { label: 'Moderate CVR Suite (10-30 rules)', score: 2, desc: 'Cost center vs natural account compatibility rules.', hoursImpact: 25 },
        { label: 'Extensive Enterprise CVR Library (30-75 rules)', score: 3, desc: 'Multi-segment dependency rules across Entity, Cost Center, Product, and Project.', hoursImpact: 60 },
        { label: 'Complex Automated Governance with EDM (Enterprise Data Management)', score: 4, desc: 'Automated value set request workflow, CVR testing harness, and real-time dimension syndication.', hoursImpact: 100 }
      ]
    },
    {
      id: 'gl_20',
      category: 'Process Scope',
      question: 'Budgetary Control & Encumbrance Accounting Requirements',
      rationale: 'Enforces real-time funds checking, reservation, and commitment accounting for public sector/enterprise.',
      options: [
        { label: 'Advisory Financial Budgeting in GL (No Hard Stops)', score: 1, desc: 'Standard budget vs actual reporting without transaction blocking.', hoursImpact: 15 },
        { label: 'Standard Budgetary Control on Requisitions & AP', score: 2, desc: 'Advisory and absolute funds checks on purchase requisitions and supplier invoices.', hoursImpact: 45 },
        { label: 'Comprehensive Encumbrance Accounting & Fund Hierarchy', score: 3, desc: 'Commitment and obligation accounting, multi-level control budgets, carry-forward close rules.', hoursImpact: 90 },
        { label: 'Complex Public Sector / Grant-Funded Multi-Year Budget Control', score: 4, desc: 'Cascading budget structures, project budget integration, real-time override delegation matrix.', hoursImpact: 140 }
      ]
    }
  ],

  // ACCOUNTS PAYABLE (AP)
  erp_ap: [
    {
      id: 'ap_1',
      category: 'Process Scope',
      question: 'Invoice Ingestion & IDR (Intelligent Document Recognition) OCR Footprint',
      rationale: 'Determines automated optical character recognition, machine-learning email ingestion, and PO matching efficiency.',
      options: [
        { label: 'Manual Entry / Standard Spreadsheet Upload', score: 1, desc: 'Standard AP clerk data entry with basic spreadsheet templates.', hoursImpact: 0 },
        { label: 'Standard IDR Cloud (Single Mailbox, Standard Invoices)', score: 2, desc: 'Automated extraction for standard PO & Non-PO invoices in primary language.', hoursImpact: 30 },
        { label: 'Multi-Mailbox Global IDR with Machine Learning Routing', score: 3, desc: 'Multiple language mailboxes, automated line-level PO matching, and confidence thresholds.', hoursImpact: 65 },
        { label: 'Enterprise Third-Party OCR / Kofax / Basware / Tungsten Integration', score: 4, desc: 'Complex external OCR gateway, electronic invoice validation, and custom pre-clearing rules.', hoursImpact: 110 }
      ]
    },
    {
      id: 'ap_2',
      category: 'Process Scope',
      question: 'PO Matching Tolerances & 2-Way / 3-Way / 4-Way Matching Rules',
      rationale: 'Governs automated price/quantity tolerance holds, receipt accruals, and inspection holds.',
      options: [
        { label: 'Standard 2-Way & 3-Way Matching with Global Tolerances', score: 1, desc: 'Standard quantity and percentage price tolerance checks.', hoursImpact: 15 },
        { label: 'Item-Category Level Matching Tolerances & Freight Apportionment', score: 2, desc: 'Differential tolerances for CAPEX vs OPEX, automated landed cost freight matching.', hoursImpact: 35 },
        { label: 'Complex 4-Way Matching with Quality Inspection & Lot Control', score: 3, desc: 'Integration with Quality inspection acceptance hold release and serialization.', hoursImpact: 70 },
        { label: 'Dynamic Multi-Entity Matching Matrix with Retainage & Progress Payments', score: 4, desc: 'Complex milestone billing matching, construction retainage release, and complex service POs.', hoursImpact: 105 }
      ]
    },
    {
      id: 'ap_3',
      category: 'Process Scope',
      question: 'Supplier Master Data Structure & Bank Account Security Governance',
      rationale: 'Impacts supplier classification, parent-child site hierarchy, bank change approval, and fraud prevention.',
      options: [
        { label: 'Single-Site Domestic Vendors with Standard Entry', score: 1, desc: 'Standard supplier and site configuration.', hoursImpact: 15 },
        { label: 'Multi-Site Global Vendors with Separation of Duties', score: 2, desc: 'Purchasing vs Payment sites, dual-control on bank account changes.', hoursImpact: 35 },
        { label: 'Supplier Portal Self-Service Onboarding & Bank Verification', score: 3, desc: 'Suppliers update profile via portal; automated internal validation and tax ID checks.', hoursImpact: 75 },
        { label: 'Integrated Master Data Governance (MDM) with Real-Time Sanctions Screening', score: 4, desc: 'Automated D&B integration, real-time OFAC/sanctions screening, and automated IBAN validation.', hoursImpact: 120 }
      ]
    },
    {
      id: 'ap_4',
      category: 'Approvals & Workflows',
      question: 'Invoice Approval Workflow (BPM) Hierarchy Depth',
      rationale: 'Configures non-PO invoice routing, requester approvals, variance tolerances, and financial authority matrix.',
      options: [
        { label: 'Auto-Approval on Valid Invoices / No Routing', score: 1, desc: 'Invoices approved upon validation by authorized AP clerks.', hoursImpact: 10 },
        { label: 'Standard Supervisory Approval Hierarchy by Amount', score: 2, desc: 'Single-chain approval based on invoice gross amount.', hoursImpact: 30 },
        { label: 'Multi-Dimensional Routing (Cost Center + Project + Department + Amount)', score: 3, desc: 'Dynamic routing based on accounting distribution segments and requisition requester.', hoursImpact: 65 },
        { label: 'Complex Matrix with Parallel Sign-Off, Out-of-Office & Escalation Timers', score: 4, desc: 'Multi-stage parallel review (Legal, Tax, Business, Controller) with strict SOX SLA.', hoursImpact: 110 }
      ]
    },
    {
      id: 'ap_5',
      category: 'Process Scope',
      question: 'Payment Processing & Global Payment Method Footprint',
      rationale: 'Drives Payment Process Profiles (PPP), ISO20022 XML formats, Positive Pay, and host-to-host bank connectivity.',
      options: [
        { label: 'Standard Domestic ACH & Check Printing (1-2 Formats)', score: 1, desc: 'Standard NACHA file and pre-printed check formatting.', hoursImpact: 25 },
        { label: 'Multi-Bank Domestic & Wire (3-5 Payment Process Profiles)', score: 2, desc: 'ACH, Wire, Check, and Positive Pay across 2-3 house banks.', hoursImpact: 50 },
        { label: 'Global Payment Engine (SEPA, BACS, Cross-Border Wire, ISO20022 XML)', score: 3, desc: 'Multi-country payment formats with PGP encryption and automated bank transmission.', hoursImpact: 95 },
        { label: 'Complex Multi-Entity Payment Factory / In-House Bank & Virtual Cards', score: 4, desc: 'Centralized shared-service payment engine, credit card rebate integration, supply chain financing.', hoursImpact: 150 }
      ]
    },
    {
      id: 'ap_6',
      category: 'Integrations & Feeds',
      question: 'Inbound Invoices from External Expense Management / Invoicing Hubs',
      rationale: 'Builds automated interface pipelines for external AP invoice sources, expense reports, and credit card feeds.',
      options: [
        { label: 'Native Oracle Procurement & Expenses Only', score: 1, desc: 'Zero external invoice interfaces.', hoursImpact: 0 },
        { label: 'External Expense Management Standard Interface', score: 2, desc: 'OIC scheduled extraction of employee expense reimbursements.', hoursImpact: 35 },
        { label: 'External Invoice Hub Full Two-Way Inbound Invoice & Status Sync', score: 3, desc: 'Real-time REST ingestion with payment status callback and tax validation.', hoursImpact: 80 },
        { label: 'High-Volume Multi-Billing Integration (5+ Subsystems)', score: 4, desc: 'Thousands of daily vendor bills from legacy logistics, freight, and utility billing systems.', hoursImpact: 135 }
      ]
    },
    {
      id: 'ap_7',
      category: 'Data & Conversions',
      question: 'Legacy AP Supplier & Open Item Historical Conversion',
      rationale: 'Impacts supplier master extraction, active bank accounts, open unpaid invoices, and historical paid detail.',
      options: [
        { label: 'Clean Supplier Master + Open Unpaid Invoices Only', score: 1, desc: 'Deduplicated supplier list and current unpaid liability.', hoursImpact: 25 },
        { label: 'Suppliers with Multi-Sites + Open Invoices + 1 Year Paid Summary', score: 2, desc: 'Multi-site mapping and recent 1099 payment history.', hoursImpact: 55 },
        { label: 'Complex Vendor Master Cleansing + Open Invoices + 2-3 Years 1099 History', score: 3, desc: 'De-duplicating disparate vendor databases and matching legacy PO balances.', hoursImpact: 95 },
        { label: 'Mass Multi-ERP Historical AP Line-Level Conversion with Images', score: 4, desc: 'Historical line item conversion with attached PDF invoice archive migration.', hoursImpact: 160 }
      ]
    },
    {
      id: 'ap_8',
      category: 'Reporting & Analytics',
      question: 'AP Aging, Cash Requirement & Payment Discount Analytics',
      rationale: 'Configures OTBI supplier aging, early-payment discount capture, DPO (Days Payable Outstanding), and hold resolution.',
      options: [
        { label: 'Standard Out-of-the-Box AP OTBI Reports', score: 1, desc: 'Standard AP Aging and Payment Register.', hoursImpact: 15 },
        { label: 'Custom Cash Forecasting & Working Capital Dashboards', score: 2, desc: 'Dynamic aging by payment term, discount capture loss analysis.', hoursImpact: 35 },
        { label: 'Supplier Performance & Invoice Processing SLA Hub', score: 3, desc: 'AP clerk throughput, first-time match rate, invoice hold lifecycle analysis.', hoursImpact: 65 },
        { label: 'Predictive Working Capital & Dynamic Discounting AI Analytics', score: 4, desc: 'Automated early payment ROI optimization and vendor risk anomaly detection.', hoursImpact: 105 }
      ]
    },
    {
      id: 'ap_9',
      category: 'Compliance & Security',
      question: 'Withholding Tax (WHT), 1099-MISC/NEC & Statutory e-Invoicing',
      rationale: 'Configures mandatory legal withholding tax regimes, annual 1099/1042 filings, and government e-invoicing portals.',
      options: [
        { label: 'Standard US 1099 Reporting Only', score: 1, desc: 'Standard 1099-MISC/NEC annual file generation.', hoursImpact: 20 },
        { label: 'Multi-State 1099 with Basic Withholding Tax Regimes', score: 2, desc: 'State-specific reporting and backup withholding rules.', hoursImpact: 45 },
        { label: 'Global Withholding Tax (WHT) with Statutory Certificates', score: 3, desc: 'Multi-country statutory withholding calculations and automated vendor certificates.', hoursImpact: 85 },
        { label: 'Real-Time Mandatory Tax Authority Pre-Clearance (SDI, KSeF, Brazil)', score: 4, desc: 'Automated digital invoice submission to government tax portals prior to payment approval.', hoursImpact: 140 }
      ]
    },
    {
      id: 'ap_10',
      category: 'Integrations & Feeds',
      question: 'Bank Host-to-Host Automated SFTP & Encryption Setup',
      rationale: 'Configures secure PGP encrypted SFTP channels with corporate cash management banks for automated payment transmission.',
      options: [
        { label: 'Manual File Download / Web Portal Upload', score: 1, desc: 'Clerk uploads payment batch via bank web browser.', hoursImpact: 10 },
        { label: 'Automated SFTP for Primary House Bank', score: 2, desc: 'Scheduled transmission with PGP encryption for 1 bank.', hoursImpact: 30 },
        { label: 'Multi-Bank Global SFTP with Automated Acknowledgments (pain.002)', score: 3, desc: '3-5 global banks with automated transmission status tracking and error handling.', hoursImpact: 70 },
        { label: 'SWIFT Alliance Gateway / Financial Messaging Hub', score: 4, desc: 'Direct SWIFT network integration with hardware security modules (HSM).', hoursImpact: 120 }
      ]
    }
  ],

  // ACCOUNTS RECEIVABLE (AR) & BILLING
  erp_ar: [
    {
      id: 'ar_1',
      category: 'Process Scope',
      question: 'Customer Billing Architecture & Transaction Type Matrix',
      rationale: 'Defines auto-invoicing rules, credit memos, debit memos, chargebacks, and billing revenue scheduling.',
      options: [
        { label: 'Standard Commercial Invoicing (<5 Transaction Types)', score: 1, desc: 'Standard debit/credit billing with basic revenue accounts.', hoursImpact: 20 },
        { label: 'Multi-Line Business Billing (6-15 Transaction Types)', score: 2, desc: 'Product vs Service billing, freight lines, deposit accounting, progressive invoicing.', hoursImpact: 45 },
        { label: 'Complex Multi-Entity Global Billing with Rules Engine', score: 3, desc: 'Intercompany billing, deferred revenue scheduling, complex discount rules.', hoursImpact: 85 },
        { label: 'High-Volume Telecom / Utility / Subscription Billing Engine', score: 4, desc: 'Millions of monthly billing lines, micro-transactions, automated dispute write-offs.', hoursImpact: 140 }
      ]
    },
    {
      id: 'ar_2',
      category: 'Process Scope',
      question: 'Receipt Processing & AutoLockbox Bank Ingestion',
      rationale: 'Configures electronic bank lockbox files (BAI2, EDI 823), automated customer identification, and invoice matching.',
      options: [
        { label: 'Manual Cash Receipt Entry', score: 1, desc: 'Standard manual entry of check/wire receipts.', hoursImpact: 15 },
        { label: 'Standard BAI2 Lockbox for Single Bank', score: 2, desc: 'Automated receipt creation and matching against single invoice number.', hoursImpact: 40 },
        { label: 'Multi-Bank Lockbox with Cross-Currency Matching & Remittance Advice', score: 3, desc: 'Multiple bank lockbox files, automated unearned discount calculation, short-pay handling.', hoursImpact: 80 },
        { label: 'AI-Powered Smart Lockbox with OCR Remittance Reconciliation', score: 4, desc: 'Machine learning remittance extraction, multi-invoice bundle matching, automated dispute routing.', hoursImpact: 125 }
      ]
    },
    {
      id: 'ar_3',
      category: 'Process Scope',
      question: 'Customer Master Data & Centralized Credit Management',
      rationale: 'Manages customer account/site/bill-to hierarchy, credit limit checks, scoring models, and credit holds.',
      options: [
        { label: 'Standard Customer Structure (Single Bill-To/Ship-To)', score: 1, desc: 'Simple customer account model.', hoursImpact: 15 },
        { label: 'Parent-Child Account Hierarchies with Departmental Bill-To Sites', score: 2, desc: 'Global parent accounts with localized billing addresses and consolidated statements.', hoursImpact: 40 },
        { label: 'Advanced Credit Management with Automated Scoring & Risk Limits', score: 3, desc: 'Credit scoring models, automated credit hold release workflow, D&B score sync.', hoursImpact: 75 },
        { label: 'Enterprise Global Customer Hub with Multi-Currency Credit Pool', score: 4, desc: 'Consolidated cross-entity credit exposure, collateral tracking, and letter of credit engine.', hoursImpact: 115 }
      ]
    },
    {
      id: 'ar_4',
      category: 'Integrations & Feeds',
      question: 'AutoInvoice Interface from External CRM / CPQ / Billing Subsystems',
      rationale: 'Builds OIC pipelines to ingest sales orders, contract milestones, and usage-based billing lines into Fusion AR.',
      options: [
        { label: 'Oracle Fusion Order Management Native Only', score: 1, desc: 'No external billing feeds.', hoursImpact: 0 },
        { label: 'Single External Billing Inbound Feed (Batch SFTP)', score: 2, desc: 'Daily batch invoice import with standard error notification.', hoursImpact: 35 },
        { label: 'External CRM / Billing Real-Time Integration', score: 3, desc: 'Real-time REST creation of AR invoices with tax validation and payment sync.', hoursImpact: 85 },
        { label: 'High-Volume Heterogeneous Billing Hub (4+ Systems)', score: 4, desc: 'Complex staging tables, automated error correction interface, multi-currency aggregation.', hoursImpact: 145 }
      ]
    },
    {
      id: 'ar_5',
      category: 'Approvals & Workflows',
      question: 'Credit Memo & Dispute Approval Workflow (BPM)',
      rationale: 'Configures dispute reasons, supervisory thresholds for write-offs, credit memo generation, and tax adjustments.',
      options: [
        { label: 'Direct Credit Memo Entry by AR Specialist', score: 1, desc: 'No workflow routing.', hoursImpact: 10 },
        { label: 'Standard Supervisory Approval Hierarchy by Amount', score: 2, desc: 'Credit memo sign-off based on dollar thresholds.', hoursImpact: 25 },
        { label: 'Multi-Level Dispute Workflow (Sales + Billing + Finance Controller)', score: 3, desc: 'Automated invoice dispute routing, partial credit generation, inventory return sync.', hoursImpact: 60 },
        { label: 'Complex Matrix with Automated Chargeback & Restocking Governance', score: 4, desc: 'Dynamic routing with customer contractual penalty verification and SOX audit trails.', hoursImpact: 95 }
      ]
    },
    {
      id: 'ar_6',
      category: 'Reporting & Analytics',
      question: 'Advanced Collections & Customer Dunning Strategies',
      rationale: 'Configures collector work queues, automated dunning letter email campaigns, broken promise tracking, and aging.',
      options: [
        { label: 'Standard AR Aging Reports Only (No Collections Module)', score: 1, desc: 'Basic aging reports used for manual calling.', hoursImpact: 10 },
        { label: 'Oracle Advanced Collections with Standard Dunning Letters', score: 2, desc: 'Automated dunning templates triggered by aging brackets (30, 60, 90 days).', hoursImpact: 40 },
        { label: 'Collector Work Queues with Scoring & Customer Segmentation', score: 3, desc: 'Dynamic collector assignment, promise-to-pay tracking, dispute logging.', hoursImpact: 75 },
        { label: 'Enterprise Automated Credit-to-Cash AI Recovery Suite', score: 4, desc: 'AI cash forecasting, customer default probability modeling, integrated legal dunning.', hoursImpact: 120 }
      ]
    },
    {
      id: 'ar_7',
      category: 'Data & Conversions',
      question: 'Legacy Customer & Open Receivable Item Migration',
      rationale: 'Migrates customer master accounts, contacts, bank mandates, open invoices, debit memos, and unapplied cash.',
      options: [
        { label: 'Clean Active Customers + Open Invoices Only', score: 1, desc: 'Direct FBDI conversion of active open debt.', hoursImpact: 25 },
        { label: 'Customers + Open Invoices + Unapplied Cash & Deposits', score: 2, desc: 'Reconciling open invoices against unapplied customer advance balances.', hoursImpact: 50 },
        { label: 'Multi-Entity Customer Cleansing + Open Invoices + 2 Years Historical Summary', score: 3, desc: 'Deduplicating disparate customer databases across regional legacy ERPs.', hoursImpact: 90 },
        { label: 'Mass Multi-Source Conversion with Attached Billing Documents', score: 4, desc: 'Historical line item conversion with attached PDF invoice repository migration.', hoursImpact: 150 }
      ]
    },
    {
      id: 'ar_8',
      category: 'Compliance & Security',
      question: 'Revenue Recognition (IFRS 15 / ASC 606 - RMCS) Requirements',
      rationale: 'Determines standalone selling price (SSP) allocation, performance obligations, and contract asset/liability accounting.',
      options: [
        { label: 'Standard Immediate Invoicing Revenue Recognition (No RMCS)', score: 1, desc: 'Revenue recognized immediately upon AR invoice generation.', hoursImpact: 0 },
        { label: 'Basic Straight-Line Deferred Revenue Rules in AR', score: 2, desc: 'Monthly amortization schedules on standard service invoices.', hoursImpact: 35 },
        { label: 'Oracle Revenue Management Cloud Service (RMCS - Full IFRS 15)', score: 3, desc: 'SSP allocations, performance obligations, contract modification accounting.', hoursImpact: 95 },
        { label: 'Complex Hybrid Bundled Contracts (Hardware + Software + Service + Usage)', score: 4, desc: 'Multi-element arrangements, variable consideration, dynamic contract re-evaluations.', hoursImpact: 160 }
      ]
    }
  ],

  // SUPPLY CHAIN & INVENTORY (SCM)
  scm_inv: [
    {
      id: 'inv_1',
      category: 'Process Scope',
      question: 'Item Master Structure & Multi-Organization Inventory Hierarchy',
      rationale: 'Establishes master item org, inventory organizations, subinventories, locators, and item lifecycle stages.',
      options: [
        { label: 'Single Master Org + 1-3 Inventory Orgs', score: 1, desc: 'Simple inventory structure with basic locators.', hoursImpact: 20 },
        { label: '4-10 Inventory Organizations with Subinventory Matrix', score: 2, desc: 'Manufacturing, distribution, and consignment inventory orgs.', hoursImpact: 50 },
        { label: 'Global Multi-Tier Inventory Network (11-25 Orgs)', score: 3, desc: 'Inter-org transit routing, drop-ship orgs, 3PL inventory nodes.', hoursImpact: 95 },
        { label: 'Complex Global Supply Chain Topology (>25 Orgs)', score: 4, desc: 'Internal sales orders, global transfer pricing, multi-tier consignment hubs.', hoursImpact: 150 }
      ]
    },
    {
      id: 'inv_2',
      category: 'Process Scope',
      question: 'Cost Accounting Engine & Valuation Methods (Perpetual / FIFO / Standard)',
      rationale: 'Configures cost orgs, cost books (GAAP vs Tax), cost elements, overhead absorption, and standard cost updates.',
      options: [
        { label: 'Standard Costing across Single Cost Org', score: 1, desc: 'Single cost book with annual standard cost rollup.', hoursImpact: 25 },
        { label: 'Average Costing / Actual FIFO with Multi-Cost Books', score: 2, desc: 'Primary GAAP cost book + Secondary management cost book.', hoursImpact: 60 },
        { label: 'Complex Landed Cost Management (LCM) with Overhead Pools', score: 3, desc: 'Automated estimated vs actual freight/customs duty absorption into item valuation.', hoursImpact: 105 },
        { label: 'Multi-Entity Global Transfer Pricing & Dual-Valuation Books', score: 4, desc: 'Arm-length intercompany markups, tax valuation books, continuous variance analysis.', hoursImpact: 160 }
      ]
    },
    {
      id: 'inv_3',
      category: 'Process Scope',
      question: 'Lot & Serial Number Tracking & Genealogies',
      rationale: 'Governs lot expiration, shelf-life control, lot status holds, dual-unit of measure (UOM), and serial tracking.',
      options: [
        { label: 'No Lot / Serial Control (Standard Quantity Only)', score: 1, desc: 'Standard stocking by quantity.', hoursImpact: 0 },
        { label: 'Basic Lot Control with Expiration Dates', score: 2, desc: 'Lot expiration, shelf life tracking, standard pick allocation.', hoursImpact: 35 },
        { label: 'Full Lot & Serial Genealogy with Status Controls', score: 3, desc: 'Complete trace from receipt through manufacturing to customer shipment, lot hold rules.', hoursImpact: 75 },
        { label: 'Life Sciences / Aerospace Regulated Genealogy (Dual UOM + FDA 21 CFR)', score: 4, desc: 'Dynamic dual UOM potency tracking, electronic batch records, parent-child lot split/merge.', hoursImpact: 125 }
      ]
    },
    {
      id: 'inv_4',
      category: 'Integrations & Feeds',
      question: 'Third-Party Logistics (3PL) / WMS Automated Interfaces',
      rationale: 'Builds OIC bidirectional integration for inbound shipments, pick confirmations, stock adjustments, and cycle counts.',
      options: [
        { label: 'All Inventory Managed Directly in Fusion Cloud', score: 1, desc: 'Zero external 3PL integrations.', hoursImpact: 0 },
        { label: 'Single 3PL Facility (Batch SFTP Receipts & Shipments)', score: 2, desc: 'Scheduled sync of warehouse movements.', hoursImpact: 45 },
        { label: 'Multi-3PL Network (3-5 Warehouses with Real-Time REST APIs)', score: 3, desc: 'Real-time inventory sync, ASN feeds, shipping confirmations, and inventory sync.', hoursImpact: 95 },
        { label: 'Enterprise Global Logistics Grid (6+ 3PL Partners / Manhattan / Blue Yonder)', score: 4, desc: 'High-speed automated event streaming, real-time container tracking, exception dashboard.', hoursImpact: 160 }
      ]
    },
    {
      id: 'inv_5',
      category: 'Data & Conversions',
      question: 'Item Master, BOMs & On-Hand Inventory Conversion',
      rationale: 'Extracts, cleanses, and loads item catalogs, categories, unit-of-measure conversions, and physical on-hand counts.',
      options: [
        { label: 'Clean Item Master (<2,000 SKUs) + Current On-Hand', score: 1, desc: 'Standard item template load and opening inventory balances.', hoursImpact: 30 },
        { label: 'Moderate Item Catalog (5,000-15,000 SKUs) with Lot Balances', score: 2, desc: 'Multiple item classes, UOM conversions, lot balances, open PO balances.', hoursImpact: 65 },
        { label: 'Large Item Catalog (15,000-50,000 SKUs) with Structures & Multi-Orgs', score: 3, desc: 'Complex item attributes, cross-references, catalog hierarchy cleansing, multi-org on-hand.', hoursImpact: 110 },
        { label: 'Mass Multi-System Overhaul (50,000+ SKUs) with Historical Serial Trace', score: 4, desc: 'Mass deduplication across legacy ERPs, complex attribute mapping, physical inventory cutover.', hoursImpact: 175 }
      ]
    }
  ],

  // HUMAN CAPITAL MANAGEMENT (HCM)
  hcm_core: [
    {
      id: 'hcm_1',
      category: 'Process Scope',
      question: 'Enterprise Structure & Global Organization Tree Hierarchy',
      rationale: 'Defines Enterprise, Legal Employers, Business Units, Divisions, Departments, and Tree Node versioning.',
      options: [
        { label: 'Single Country Enterprise (<3 Legal Employers)', score: 1, desc: 'Standard single-tier organization model.', hoursImpact: 20 },
        { label: 'Multi-State / Multi-Company Structure (4-8 Legal Employers)', score: 2, desc: 'Departmental hierarchies, cost center cross-mapping, legal employer policies.', hoursImpact: 45 },
        { label: 'Global Multi-Country Organization Structure (9-20 Countries)', score: 3, desc: 'Localized legislative data groups (LDGs), matrix reporting trees, multi-currency salary basis.', hoursImpact: 95 },
        { label: 'Complex Global Matrix Organization (20+ Countries)', score: 4, desc: 'Multiple legal employers per country, complex collective bargaining entities, matrix tree security.', hoursImpact: 155 }
      ]
    },
    {
      id: 'hcm_2',
      category: 'Process Scope',
      question: 'Position Management vs Job-Based Workforce Model',
      rationale: 'Establishes single-incumbent positions, pooled positions, FTE tracking, and automated vacancy management.',
      options: [
        { label: 'Pure Job-Based Model (No Position Management)', score: 1, desc: 'Workers assigned directly to jobs and departments.', hoursImpact: 15 },
        { label: 'Hybrid Position Management for Key Leadership Roles', score: 2, desc: 'Positions used only for executive and headcount-controlled positions.', hoursImpact: 40 },
        { label: 'Strict Full Position Management (FTE & Headcount Controlled)', score: 3, desc: 'Every employee assigned to budgeted position with automated overlap and vacancy tracking.', hoursImpact: 85 },
        { label: 'Global Position Control with Automated Requisition Triggering', score: 4, desc: 'Integration with Recruiting Cloud (ORC), position synchronization across all international entities.', hoursImpact: 130 }
      ]
    },
    {
      id: 'hcm_3',
      category: 'Approvals & Workflows',
      question: 'HCM Transaction Design Studio & Approval Rule Sets',
      rationale: 'Customizes employee self-service (ESS), manager self-service (MSS), guided journeys, and approval routing.',
      options: [
        { label: 'Standard Out-of-the-Box ESS / MSS Workflows', score: 1, desc: 'Default single-level manager approval for promotions, transfers, and terminations.', hoursImpact: 20 },
        { label: 'Customized Approval Matrix by Action Reason & Grade', score: 2, desc: 'Multi-step approvals (Manager + HR Business Partner) based on worker grade.', hoursImpact: 50 },
        { label: 'Advanced Transaction Design Studio with Guided Journeys', score: 3, desc: 'Personalized onboarding/offboarding journeys, conditional field masking, multi-level routing.', hoursImpact: 95 },
        { label: 'Enterprise Complex Global Governance Matrix', score: 4, desc: 'Works council review, multi-country statutory sign-offs, parallel executive compensation boards.', hoursImpact: 150 }
      ]
    },
    {
      id: 'hcm_4',
      category: 'Integrations & Feeds',
      question: 'Inbound & Outbound Payroll / Benefits / Active Directory Feeds',
      rationale: 'Builds HCM Extracts, OIC orchestrations, and single sign-on (SSO) automated identity provisioning.',
      options: [
        { label: 'Basic Outbound AD Sync + Single Third-Party Payroll Extract', score: 1, desc: 'Scheduled export of employee changes to ADP/local payroll.', hoursImpact: 30 },
        { label: '2-4 Outbound Provider Interfaces (Payroll, 401k, Medical)', score: 2, desc: 'HCM Extract pipelines with change-only delivery and automated PGP encryption.', hoursImpact: 65 },
        { label: 'Global Integration Hub (5-10 Inbound/Outbound Feeds)', score: 3, desc: 'Active Directory bi-directional sync, background checks, learning platforms, external payrolls.', hoursImpact: 115 },
        { label: 'Enterprise Real-Time Event Hub (>10 Systems)', score: 4, desc: 'Atom feed event listeners, REST APIs, continuous identity lifecycle automation across enterprise.', hoursImpact: 175 }
      ]
    },
    {
      id: 'hcm_5',
      category: 'Data & Conversions',
      question: 'Worker History & Person Master Data Migration',
      rationale: 'Loads active workers, job history, compensation, dependents, emergency contacts, and historical assignments via HDL.',
      options: [
        { label: 'Active Employees Only (Single Snapshot, Current Job)', score: 1, desc: 'Standard HDL worker load for active headcount.', hoursImpact: 25 },
        { label: 'Active Employees + Dependents + 1 Year Job/Salary History', score: 2, desc: 'Loads past promotions, compensation history, and contact details.', hoursImpact: 55 },
        { label: 'Active + Terminated Workers (3 Years History) with Multi-Assignments', score: 3, desc: 'Historical assignments, contingent workers, previous employment records.', hoursImpact: 100 },
        { label: 'Mass Multi-Country Disparate HR System Migration (5+ Years History)', score: 4, desc: 'Consolidating 5+ international HR databases, complex job code normalization, compliance audit.', hoursImpact: 165 }
      ]
    }
  ]
};

// Fallback generator for remaining modules so every module in the catalog always has 20 authentic questions
export function getQuestionsForModule(moduleId: string): ModuleScopingQuestion[] {
  if (MODULE_TOP_20_QUESTIONS[moduleId]) {
    const questions = MODULE_TOP_20_QUESTIONS[moduleId];
    // If exact 20 questions exist, return them; otherwise fill up to 20
    if (questions.length === 20) return questions;
    return [...questions, ...generateGenericQuestions(moduleId, questions.length + 1, 20)];
  }

  return generateGenericQuestions(moduleId, 1, 20);
}

function generateGenericQuestions(modId: string, startIdx: number, endIdx: number): ModuleScopingQuestion[] {
  const result: ModuleScopingQuestion[] = [];
  const modLabel = modId.replace(/_/g, ' ').toUpperCase();

  const domainThemes: Record<number, { title: string; category: ModuleScopingQuestion['category']; rationale: string }> = {
    1: { title: 'Core Enterprise Topology & Operational Framework', category: 'Process Scope', rationale: `Establishes fundamental operational hierarchy and configuration parameters for ${modLabel}.` },
    2: { title: 'Business Transaction Lifecycle & Execution Rules', category: 'Process Scope', rationale: `Defines primary transaction flow, status progressions, and execution rules in ${modLabel}.` },
    3: { title: 'Inter-Departmental & Subledger Automated Handshakes', category: 'Process Scope', rationale: `Configures integration points and accounting triggers connecting ${modLabel} to broader ERP/SCM.` },
    4: { title: 'Exception Management & Automated Error Triage', category: 'Process Scope', rationale: `Governs validation failures, automated alerts, and manual correction workflows.` },
    5: { title: 'Inbound Automated Feed Frequency & Protocol Complexity', category: 'Integrations & Feeds', rationale: `Determines OIC REST/SOAP/SFTP pipelines bringing external transactions into ${modLabel}.` },
    6: { title: 'Outbound Event Handlers & Webhook Broadcasts', category: 'Integrations & Feeds', rationale: `Configures real-time event notifications to downstream enterprise systems.` },
    7: { title: 'Middleware Transformation & OIC Orchestration Footprint', category: 'Integrations & Feeds', rationale: `Measures data transformation, schema mapping, and lookup tables required in OIC.` },
    8: { title: 'Legacy Master Data Cleansing & Deduplication Rules', category: 'Data & Conversions', rationale: `Cleanses disparate source systems, duplicate records, and obsolete data.` },
    9: { title: 'Historical Transactional Conversion Depth', category: 'Data & Conversions', rationale: `Determines volume and fidelity of historical transaction cutover into ${modLabel}.` },
    10: { title: 'Data Quality Validation & Reconciliation Pipelines', category: 'Data & Conversions', rationale: `Enforces automated pre-load reconciliation and balance verification scripts.` },
    11: { title: 'Approval Hierarchy (BPM) & Multi-Tier Signing Limits', category: 'Approvals & Workflows', rationale: `Configures BPM Worklist rules, delegated authorities, and supervisory signing thresholds.` },
    12: { title: 'Automated Status Progression & Escalation SLA Timers', category: 'Approvals & Workflows', rationale: `Enforces operational turnaround SLAs, reminder notifications, and fallback routing.` },
    13: { title: 'Policy Enforcement & Exception Delegation Rules', category: 'Approvals & Workflows', rationale: `Manages out-of-office delegation, emergency overrides, and compliance approval logs.` },
    14: { title: 'Operational Daily Dashboards & Supervisor Metrics', category: 'Reporting & Analytics', rationale: `Configures real-time OTBI dashboards for day-to-day operational visibility.` },
    15: { title: 'Executive Trend Analytics & Financial Ledger Reconciliation', category: 'Reporting & Analytics', rationale: `Builds high-level executive analytics and subledger-to-GL reconciliation reports.` },
    16: { title: 'Cross-Subject Area OTBI Analysis & Automated Bursts', category: 'Reporting & Analytics', rationale: `Creates multidimensional cross-module reports and automated scheduled email deliveries.` },
    17: { title: 'Role-Based Access Control (RBAC) & Privilege Hardening', category: 'Compliance & Security', rationale: `Customizes job roles, duties, and data security policies to enforce Segregation of Duties (SOD).` },
    18: { title: 'Data Privacy, Masking & Sensitive Field Governance (GDPR)', category: 'Compliance & Security', rationale: `Enforces field-level encryption, PII masking, and data access audit logging.` },
    19: { title: 'Quarterly Cloud Update Regression Testing & Automation', category: 'Compliance & Security', rationale: `Prepares test scripts and automated validation harnesses for Oracle quarterly patch cycles.` },
    20: { title: 'Cutover Dress Rehearsal & Production Go-Live Validation', category: 'Process Scope', rationale: `Defines critical operational checkpoints and business sign-off criteria for cutover.` }
  };

  for (let i = startIdx; i <= endIdx; i++) {
    const theme = domainThemes[i] || {
      title: `Domain Assessment Parameter ${i}`,
      category: 'Process Scope' as const,
      rationale: `Defines complexity evaluation factor ${i} for ${modLabel}.`
    };

    const isMandatory = [1, 2, 5, 8, 11].includes(i);
    let tag = 'Optional Deep-Dive';
    if (i === 1) tag = 'Core Topology Driver';
    else if (i === 2) tag = 'Lifecycle Engine';
    else if (i === 5) tag = 'Integration Feeds';
    else if (i === 8) tag = 'Data Conversion Depth';
    else if (i === 11) tag = 'Approval Governance';

    result.push({
      id: `${modId}_q${i}`,
      category: theme.category,
      question: theme.title,
      rationale: theme.rationale,
      isMandatory,
      tag,
      weight: isMandatory ? 2.5 : 1.0,
      options: [
        {
          label: 'C1: Out-of-the-Box Standard (MBP)',
          score: 1,
          desc: `Standard vanilla Oracle Modern Best Practice workflows with zero customization for ${modLabel}.`,
          hoursImpact: 0
        },
        {
          label: 'C2: Moderate Operational Variations',
          score: 2,
          desc: `Standard business adoption with 2-3 localized entity variations and standard interfaces for ${modLabel}.`,
          hoursImpact: 20 + (i * 2)
        },
        {
          label: 'C3: Advanced Multi-Entity / Complex Rules',
          score: 3,
          desc: `Multi-country requirements, custom derivation logic, and complex BPM approval matrices for ${modLabel}.`,
          hoursImpact: 45 + (i * 3)
        },
        {
          label: 'C4: Highly Customized / Mission-Critical Scale',
          score: 4,
          desc: `High-density integrations, custom PaaS extensions, and high-volume automated processing for ${modLabel}.`,
          hoursImpact: 80 + (i * 5)
        }
      ]
    });
  }

  return result;
}
