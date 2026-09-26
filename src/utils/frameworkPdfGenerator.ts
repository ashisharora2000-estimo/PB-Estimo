import { jsPDF } from 'jspdf';
import { ProjectScenario, CalculatedProjectData } from '../types';

/**
 * Generates and triggers download of a comprehensive, executive-grade
 * PDF document for the Oracle Cloud Project Planning & Estimation Engine Framework.
 * Fully compliant with the Oracle Project Plan Generation Standard (v1.0).
 */
export function generateFrameworkPdf(
  scenario?: ProjectScenario,
  data?: CalculatedProjectData
): void {
  const proposalName = scenario?.name || 'Apex Global Oracle Cloud Implementation Proposal';
  const thorId = scenario?.thorId || 'THOR-PROPOSAL-001';
  const clientName = scenario?.clientName || 'Apex Global Industries';
  const projectWeeks = scenario?.projectWeeks || 36;
  const totalHours = data?.targetHours || data?.p80_DefensibleHours || 14500;
  const personMonths = data?.targetPersonMonths || Math.round(totalHours / 160);
  const blendedMultiplier = scenario?.scaleDrivers?.tech_external_integrations_multiplier || 1.20;
  const extIntCount = scenario?.scaleDrivers?.tech_external_integrations_count ?? 12;
  const mockCycles = scenario?.scaleDrivers?.tech_conversion_cycles ?? 4;
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight; // 180mm
  let currentY = 20;

  // Running Header / Footer helper
  const addHeaderFooter = (pageNumber: number, totalPagesPlaceholder = false) => {
    // Header (skip on page 1 for cover feel)
    if (pageNumber > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('ORACLE CLOUD PROJECT PLAN GENERATION STANDARD (V1.0) — METHODOLOGY SPECIFICATION', marginLeft, 10);
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.3);
      doc.line(marginLeft, 12, pageWidth - marginRight, 12);
    }

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12);

    doc.text(
      `Confidential & Proprietary • ${clientName} • Proposal ID: ${thorId}`,
      marginLeft,
      pageHeight - 7
    );
    doc.text(
      `Page ${pageNumber}`,
      pageWidth - marginRight - 12,
      pageHeight - 7
    );
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      addHeaderFooter(doc.getNumberOfPages());
    }
  };

  // Section Heading Helper
  const addSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(18);
    // Dark slate banner bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(marginLeft, currentY, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), marginLeft + 3, currentY + 5.2);
    currentY += 10.5;

    if (subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(subtitle, marginLeft, currentY);
      currentY += 5;
    }
  };

  // Subheading Helper
  const addSubHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text(title, marginLeft, currentY);
    currentY += 5.5;
  };

  // Paragraph Helper
  const addParagraph = (text: string, spaceAfter = 4) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59); // slate-800
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4 + spaceAfter);
    doc.text(lines, marginLeft, currentY);
    currentY += lines.length * 4 + spaceAfter;
  };

  // Callout Box Helper
  const addCallout = (title: string, bodyText: string, borderColor = [37, 99, 235], bgColor = [241, 245, 249]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(bodyText, contentWidth - 8);
    const boxHeight = lines.length * 3.8 + 8;
    checkPageBreak(boxHeight + 4);

    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(marginLeft, currentY, contentWidth, boxHeight, 'F');

    // Colored left border
    doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.rect(marginLeft, currentY, 2, boxHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.text(title, marginLeft + 4, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, marginLeft + 4, currentY + 8.5);

    currentY += boxHeight + 4;
  };

  // Formula Box Helper
  const addFormulaBox = (title: string, formulaText: string) => {
    checkPageBreak(18);
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(marginLeft, currentY, contentWidth, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(title.toUpperCase(), marginLeft + 3, currentY + 4);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(253, 224, 71); // amber-300
    doc.text(formulaText, marginLeft + 3, currentY + 10);

    currentY += 17;
  };

  // Table Helper
  const addTable = (
    headers: string[],
    colWidths: number[],
    rows: (string | number)[][],
    alignments: ('left' | 'center' | 'right')[] = []
  ) => {
    const rowHeight = 6;
    checkPageBreak(rowHeight * (rows.length + 1) + 6);

    // Header Row
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(marginLeft, currentY, contentWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    let curX = marginLeft;
    headers.forEach((h, i) => {
      const w = colWidths[i] || (contentWidth / headers.length);
      const align = alignments[i] || 'left';
      const textX = align === 'right' ? curX + w - 2 : align === 'center' ? curX + w / 2 : curX + 2;
      doc.text(h, textX, currentY + 4.2, { align: align === 'center' ? 'center' : align === 'right' ? 'right' : 'left' });
      curX += w;
    });
    currentY += rowHeight;

    // Body Rows
    rows.forEach((row, rIdx) => {
      checkPageBreak(rowHeight + 2);
      if (rIdx % 2 === 0) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(marginLeft, currentY, contentWidth, rowHeight, 'F');
      }
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.2);
      doc.line(marginLeft, currentY + rowHeight, marginLeft + contentWidth, currentY + rowHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      let cellX = marginLeft;
      row.forEach((cell, cIdx) => {
        const w = colWidths[cIdx] || (contentWidth / headers.length);
        const align = alignments[cIdx] || 'left';
        const textVal = String(cell);
        const textX = align === 'right' ? cellX + w - 2 : align === 'center' ? cellX + w / 2 : cellX + 2;
        doc.text(textVal, textX, currentY + 4.1, { align: align === 'center' ? 'center' : align === 'right' ? 'right' : 'left' });
        cellX += w;
      });
      currentY += rowHeight;
    });
    currentY += 4;
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE METADATA
  // ==========================================
  addHeaderFooter(1);

  // Top Accent Stripe
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(marginLeft, currentY, contentWidth, 3, 'F');
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('ORACLE PRACTICE DELIVERY SPECIFICATION & METHODOLOGY STANDARD', marginLeft, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize('Oracle Cloud Transformation Planning & Estimation Framework', contentWidth);
  doc.text(titleLines, marginLeft, currentY);
  currentY += titleLines.length * 7 + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('Standard Operating Procedure, Mathematical Lineage & WBS Generation Architecture (v1.0)', marginLeft, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Authoritative Delivery Directive for Fixed-Price, Multi-Wave & Multi-Pillar Oracle Cloud Programs', marginLeft, currentY);
  currentY += 8;

  // Metadata Summary Card
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(marginLeft, currentY, contentWidth, 30, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginLeft, currentY, contentWidth, 30, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('DOCUMENT SPECIFICATION:', marginLeft + 4, currentY + 5);
  doc.text('TARGET PROPOSAL:', marginLeft + 4, currentY + 11);
  doc.text('CLIENT ORGANIZATION:', marginLeft + 4, currentY + 17);
  doc.text('ESTIMATED DURATION:', marginLeft + 4, currentY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Oracle Project Plan Standard v1.0', marginLeft + 45, currentY + 5);
  doc.text(`${proposalName} (${thorId})`, marginLeft + 45, currentY + 11);
  doc.text(clientName, marginLeft + 45, currentY + 17);
  doc.text(`${projectWeeks} Weeks (${Math.round(projectWeeks / 4.33)} Months)`, marginLeft + 45, currentY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PUBLICATION DATE:', marginLeft + 115, currentY + 5);
  doc.text('METHODOLOGY MODEL:', marginLeft + 115, currentY + 11);
  doc.text('P80 DEFENSIBLE HOURS:', marginLeft + 115, currentY + 17);
  doc.text('GOVERNANCE LEVEL:', marginLeft + 115, currentY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(currentDate, marginLeft + 155, currentY + 5);
  doc.text('7-Phase True Cloud', marginLeft + 155, currentY + 11);
  doc.text(`${totalHours.toLocaleString()} hrs (${personMonths} PM)`, marginLeft + 155, currentY + 17);
  doc.text('DoA Board Tier-1', marginLeft + 155, currentY + 23);

  currentY += 36;

  // SECTION 1: EXECUTIVE SUMMARY
  addSectionHeader('1. Executive Summary & Purpose', 'Standardization of Oracle Cloud Implementation Planning');
  addParagraph(
    'The Oracle Cloud Transformation Planning & Estimation Framework is the official standard for generating defensible, mathematically traceable, and execution-ready implementation proposals. It bridges commercial bid defense, functional depth scoping, technical RICEFW complexity, and stage-gate schedule generation into an authoritative, single source of truth.'
  );
  addParagraph(
    'Historically, enterprise Oracle Cloud proposals have suffered from three systemic vulnerabilities: (1) subjective spreadsheet estimation variance, (2) arbitrary schedule compression that creates unachievable testing windows, and (3) scope ambiguity around integrations and mock data conversions. This framework replaces discretionary guessing with deterministic mathematical models, proven industry benchmarks, and mandatory governance stage gates.'
  );
  addCallout(
    'Core Platform Objective',
    'Provide a fully auditable path from high-level RFP scope to granular Work Breakdown Structure (WBS), ensuring that every person-month quoted is directly backed by explicit architectural drivers, friction modifiers, and verified delivery capabilities.',
    [22, 163, 74],
    [240, 253, 244]
  );

  // SECTION 2: OPERATING PRINCIPLES
  addSectionHeader('2. Operating Principles & Non-Negotiables', 'Mandatory Directives Governed by oracle-project-plan-standard.yaml');
  addSubHeader('Directive 1: Methodology Determines Structure');
  addParagraph(
    'Project plan architecture is dictated exclusively by methodology rather than arbitrary calendar dates. Every plan must structure into two mandatory operational tiers:\n' +
    '• Wave 0 (Mandatory Foundation & Mobilization): Encompasses TEAM MOBILIZATION (CORE), KICK-OFF ACTIVITIES, BUSINESS ONBOARDING, and Enterprise Design (FOUNDATION DESIGN, WORKSTREAM DESIGN, RE-BASELINE PROJECT). Workstream Design occupies approximately 50% of Wave 0.\n' +
    '• Post-ED Waves (Waves 1 through 5): Dedicated execution cycles encompassing Detailed Design (11%), Build & Sprint Execution (50%), Business Testing 1 - SIT (21%), Business Testing 2 - UAT (21%), Cutover & Deployment (7%), Hypercare Support (21%), and Transition to Run (9%). Mandatory stage gates (CRP1, CRP2, SIT Sign-Off, UAT Sign-Off, Go-Live) cannot be removed.'
  );

  addSubHeader('Directive 2: Deterministic Scheduling & Calendar Normalization');
  addParagraph(
    'All program start dates must automatically normalize to the Monday of the target kickoff week. Weekend working is disabled by default, and statutory holidays and enterprise blackouts must be explicitly flagged rather than ignored. Predecessor lags, duration floats, and phase gates are computed deterministically.'
  );

  addSubHeader('Directive 3: 4-Tier Functional Scope Expansion');
  addParagraph('Scope expands deterministically: Oracle Module -> Process Area -> Epic -> Activity / WBS Task.');

  // SECTION 3: THE 7 CORE ARCHITECTURAL PILLARS
  addSectionHeader('3. The 7 Core Architectural Pillars', 'Synthesizing Project Complexity Across All Workstreams');
  addTable(
    ['Pillar #', 'Pillar Name', 'Analytical Mechanism', 'Primary Deliverable Output'],
    [22, 45, 68, 45],
    [
      ['Pillar 01', 'Delivery Lifecycle Architecture', '7-Phase Oracle True Cloud Method (TCM) with CRP1, CRP2, SIT, UAT gates', 'Baseline WBS & Stage Gate Schedule'],
      ['Pillar 02', 'Functional 20-Q Depth Engine', '20 granular scoping questions per module across ERP, SCM, HCM, EPM, CX', 'Module T-Shirt Sizing (XS to XXL)'],
      ['Pillar 03', 'Rollout & Wave Architecture', '12-dimensional rollout strategy model analyzing regional coexistence', 'Multi-Wave Release Roadmap'],
      ['Pillar 04', 'CEMLI & Technical Sizing', 'Visual Integration Complexity Matrix and 4-Mock conversion sliding scale', 'Defensible Technical Workstream Hours'],
      ['Pillar 05', 'Client Friction & Risk Modifiers', '7 behavioral friction dimensions (Data Debt, SME Dedication, SteerCo Latency)', 'Net Friction Multiplier (M_friction)'],
      ['Pillar 06', 'Quarterly Patch & Blackout Analyzer', 'Pod Cohort (A/B/C) calendar conflict detection against testing and cutover', 'Deconfliction & Exemption Strategy'],
      ['Pillar 07', 'Commercials & Governance', 'Global staffing pyramid (Onshore/Offshore), role margins, and DoA tiers', 'Contractual Deal Defense Dossier']
    ]
  );

  // SECTION 4: TECHNICAL SIZING ARCHITECTURE
  addSectionHeader('4. Technical CEMLI Sizing & Integration Complexity Matrix', 'Dynamic Sizing for Boundary Interfaces and Data Conversions');
  addSubHeader('4.1 Integration Complexity Matrix & Scaling Multiplier');
  addParagraph(
    'Rather than applying an arbitrary bulk multiplier, every connected system interface is itemized and categorized into three standardized technical tiers:'
  );
  addTable(
    ['Complexity Tier', 'Multiplier', 'Standard Hours', 'Technical Criteria & Archetype Scope'],
    [30, 22, 26, 102],
    [
      ['Simple', '0.85x', '45 – 50 hrs', 'Point-to-point 1:1 field mappings, standard pre-certified adapters (Vertex Tax, Concur), single-object JSON REST pass-through, minimal business transformation.'],
      ['Medium', '1.20x', '85 – 95 hrs', 'Multi-entity choreography, Domain Value Map (DVM) lookups, pagination, token exchange auth, OIC Error Hospital retry queue (Salesforce CPQ, Workday HCM, Coupa).'],
      ['Complex', '1.75x', '160 – 180 hrs', 'High-throughput streaming, transactional locking, custom canonical XSLT schemas, automated batch FBDI zip generation, host-to-host banking (ISO 20022 XML / camt.053), factory MES.']
    ]
  );

  addFormulaBox(
    'Dynamic Integration Sizing Formula',
    'Blended_Multiplier = [(N_Simple * 0.85) + (N_Medium * 1.20) + (N_Complex * 1.75)] / Total_Integrations\nH_Integration_Base = Total_Integrations * 80h * Blended_Multiplier'
  );
  addParagraph(
    `In this scenario, ${extIntCount} external integrations are mapped with an effective blended multiplier of ${blendedMultiplier.toFixed(2)}x, directly driving the Estimation Engine.`
  );

  addSubHeader('4.2 Data Conversion Sizing & The 4-Mock Sliding Scale');
  addParagraph(
    'Data conversion effort is modeled across iterative mock rehearsal cycles reflecting proven field yield efficiencies:'
  );
  addTable(
    ['Rehearsal Cycle', 'Relative Cycle Weight', 'Cumulative Multiplier', 'Operational Milestone & Stage Gate'],
    [32, 35, 35, 78],
    [
      ['Mock 1', '100% of Base Effort', '1.00x', 'Baseline extraction, template mapping, initial FBDI/HDL script build, core entity validation.'],
      ['Mock 2', '80% of Base Effort', '1.80x', 'SIT-ready cleansed load, automated deduplication, exception resolution, tie-out sign-off.'],
      ['Mock 3', '60% of Base Effort', '2.40x', 'UAT volume load, full historical subledgers, performance tuning, stakeholder sign-off.'],
      ['Mock 4 (Recommended)', '40% of Base Effort', '2.80x', 'Cutover dress rehearsal, production timing dry run, rollback testing, executive gate.']
    ]
  );
  addCallout(
    'Conversion Best Practice Directive',
    `For fixed-price implementations with legacy transactional history or >= 10 FBDI objects, 4 Mock Cycles (2.80x cumulative multiplier) must be configured to provide contractually defensible cutover defense. Current scenario is set to ${mockCycles} mock cycles.`,
    [217, 119, 6],
    [255, 251, 235]
  );

  // SECTION 5: MATHEMATICAL LINEAGE & EFFORT FORMULAS
  addSectionHeader('5. Mathematical Lineage & Effort Formulas', 'Five-Stage Parametric Derivation from RFP Scope to Defensible Quote');
  addSubHeader('Stage 1: Raw Functional & Scale Base Hours (H_base)');
  addFormulaBox(
    'Raw Base Effort Formula',
    'H_base = SUM(H_Module_Catalog * Module_Complexity_Factor) + H_Integrations + H_Conversions + H_PaaS + H_Reports + H_Workflows'
  );

  addSubHeader('Stage 2: 7-Modifier Compounded Friction Factor (M_friction)');
  addParagraph(
    'The net organizational friction multiplier compounds across seven calibrated client readiness dimensions:\n' +
    '• M1: Decision Velocity (0.90x Rapid <=3d, 1.00x Standard, 1.25x Delayed >=10d)\n' +
    '• M2: Legacy Data Debt (0.90x Golden Records, 1.00x Moderate, 1.30x Severe Legacy Debt)\n' +
    '• M3: Cloud Mindset & MBP (0.85x Fit-to-Standard, 1.00x Standard, 1.25x Bespoke Customization)\n' +
    '• M4: Integration Volatility (0.90x Stable APIs, 1.00x Standard, 1.30x Shifting Third-Party Specs)\n' +
    '• M5: Dedicated Client SME Availability (0.90x 100% Dedicated, 1.00x Shared BAU, 1.35x Severe Deficit)\n' +
    '• M6: Statutory & Regulatory Complexity (0.95x Domestic, 1.00x Standard, 1.25x Multi-Country E-Invoicing)\n' +
    '• M7: Organizational Change Resistance (0.90x Receptive, 1.00x Standard, 1.25x High Change Friction)'
  );
  addFormulaBox(
    'Compounded Friction Formula',
    'M_friction = M1 * M2 * M3 * M4 * M5 * M6 * M7   [Normal Range: 0.70x to 2.45x, Default Enterprise: ~1.12x]'
  );

  addSubHeader('Stage 3: Statistical Confidence Bands (P50, P80, P95)');
  addParagraph(
    '• P50 (Target Staffing Baseline): H_base * M_friction (Lean internal delivery baseline assuming on-time milestone sign-offs).\n' +
    '• P80 (Defensible Contractual Commitment): H_P50 * (1 + Contingency%) (Recommended 15%–25% contingency buffer, absorbing ordinary client delays and rework).\n' +
    '• P95 (Conservative Risk Ceiling): H_P80 * 1.15 (Maximum exposure reserve for deals with critical data debt or dual-SI governance friction).'
  );

  // SECTION 6: SMARTSHEET 30-COLUMN SPECIFICATION
  addSectionHeader('6. Smartsheet 30-Column Standard Interoperability Specification', 'Immutable 30-Column Sequence for Enterprise PMO Tools');
  addTable(
    ['#', 'Column Name', 'Type', 'Description & Validation Rule'],
    [10, 45, 25, 100],
    [
      [1, 'Task Name', 'String', 'Standardized task title from approved WBS library.'],
      [2, 'ASSIGNED TO ROLE', 'String', 'Named delivery role from standard rate card.'],
      [3, 'Status', 'Enum', 'Not Started, In Progress, Complete, On Hold.'],
      [4, 'Start Date', 'Date', 'Calculated calendar date (Monday normalized YYYY-MM-DD).'],
      [5, 'End Date', 'Date', 'Calculated milestone completion date.'],
      [6, 'Task Progress', 'Percentage', '0% to 100% completion tracking.'],
      [7, 'Predecessors', 'String', 'Comma-separated dependency task numbers (FS, SS, FF).'],
      [8, 'Duration', 'Integer', 'Duration in working days (excluding weekends/blackouts).'],
      [9, 'Type', 'Enum', 'Task, Summary, Milestone, Stage Gate.'],
      [10, 'Workstream', 'Enum', 'FUNCTIONAL, TECHNICAL, DATA, TESTING, PMO, OCM, etc.'],
      [11, 'Comments', 'String', 'Auditable sizing assumptions or boundary notes.'],
      [12, 'Allocation', 'Percentage', 'FTE staffing percentage assigned to task.'],
      [13, 'LEVEL-ID', 'Integer', 'WBS outline depth (Level 1 Phase to Level 4 Activity).'],
      [14, 'Complete', 'Boolean', 'Binary completion status checkbox.'],
      [15, 'TASK_NUMBER', 'String', 'Immutable unique identifier (e.g. TSK-BLD-014).'],
      [16, 'CATEGORY', 'String', 'Functional domain or technical workstream category.'],
      [17, 'WBS-ID', 'String', 'Hierarchical index (e.g. 3.2.1.4).'],
      [18, 'TEMPLATE-ID', 'String', 'Master standard template reference ID.'],
      [19, 'Parent WBS ID', 'String', 'Immediate parent WBS node identifier.'],
      [20, 'Wave', 'String', 'Wave 0, Wave 1, Wave 2, etc.'],
      [21, 'Phase', 'String', 'Enablement, Design, Build, Test, Deploy, Hypercare.'],
      [22, 'Sub-Phase', 'String', 'Specific sub-phase milestone grouping.'],
      [23, 'Domain', 'Enum', 'ERP, SCM, HCM, EPM, CX, CROSS_PILLAR.'],
      [24, 'Module Code', 'String', 'Standard Oracle module code (e.g. ERP_GL, SCM_OM).'],
      [25, 'Module Name', 'String', 'Full functional module title.'],
      [26, 'Component ID', 'String', 'Technical RICEFW asset ID (e.g. INT-01, CONV-04).'],
      [27, 'Component Name', 'String', 'Full title of connected integration or data object.'],
      [28, 'Schedule Method', 'Enum', 'CRITICAL_PATH, PARALLEL_STREAM, STAGE_GATE.'],
      [29, 'Anomaly Flag', 'Boolean', 'Automated audit flag for schedule risk or lead-time violation.'],
      [30, 'Anomaly Reason', 'String', 'Detailed diagnostic reason for flagged task.']
    ]
  );

  // SECTION 7: DEAL DEFENSE & GOVERNANCE PROTOCOL
  addSectionHeader('7. Deal Defense & SteerCo Governance Protocol', 'Pre-Submission Verification Checklist');
  addParagraph(
    'Before any proposal is submitted to a client or presented to corporate leadership, the proposal lead must complete the following six verification gates:\n' +
    '1. Calendar Normalization Check: Confirm project kickoff starts on a Monday with zero unapproved weekend shifts.\n' +
    '2. Blackout Collision Audit: Verify that no quarterly Oracle Cloud pod updates (Cohorts A/B/C) collide with SIT entry or Cutover dry-run windows.\n' +
    '3. Integration Matrix Sign-Off: Confirm all external boundary interfaces have verified complexity ratings (Simple/Medium/Complex) and assigned Oracle functional modules.\n' +
    '4. Conversion Mock Rehearsals: Confirm at least 3 Mock Cycles (4 recommended) are budgeted for all master data entities and open transaction cutover.\n' +
    '5. Client Friction Review: Verify that the 7 client delivery modifiers reflect realistic organizational assessments rather than best-case assumptions.\n' +
    '6. Delegation of Authority (DoA) Alignment: Verify that the overall contract value, gross margin (>= 35%), and contingency reserves align with corporate Deal Board thresholds.'
  );

  // Apply running header/footer across all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addHeaderFooter(p);
  }

  // Trigger instant client download
  doc.save(`Oracle_Cloud_Planning_Framework_Specification_${thorId}.pdf`);
}
