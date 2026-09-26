import { ProjectScenario, CalculatedProjectData } from '../types';

/**
 * Generates and triggers download of a comprehensive, executive-grade
 * Word Document (.doc format with full Word-compliant HTML/XML styling)
 * for the Oracle Cloud Project Planning & Estimation Engine Framework.
 */
export function generateFrameworkWordDoc(
  scenario?: ProjectScenario,
  data?: CalculatedProjectData
): void {
  const proposalName = scenario?.name || 'Apex Global Oracle Cloud Implementation';
  const thorId = scenario?.thorId || 'THOR-PROPOSAL-001';
  const clientName = scenario?.clientName || 'Apex Global Industries';
  const projectWeeks = scenario?.projectWeeks || 36;
  const totalHours = data?.targetHours || data?.p80_DefensibleHours || 14500;
  const personMonths = data?.targetPersonMonths || Math.round(totalHours / 160);
  const blendedMultiplier = scenario?.scaleDrivers?.tech_external_integrations_multiplier || 1.20;
  const extIntCount = scenario?.scaleDrivers?.tech_external_integrations_count ?? 12;
  const mockCycles = scenario?.scaleDrivers?.tech_conversion_cycles ?? 3;
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const docHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Oracle Cloud Project Planning & Estimation Framework Specification</title>
<style>
  @page {
    size: 8.5in 11in;
    margin: 1.0in 1.0in 1.0in 1.0in;
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
  }
  body {
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1e293b;
    background-color: #ffffff;
  }
  h1 {
    font-family: 'Calibri', Arial, sans-serif;
    font-size: 24pt;
    font-weight: bold;
    color: #0f172a;
    border-bottom: 2pt solid #0f172a;
    padding-bottom: 6pt;
    margin-top: 24pt;
    margin-bottom: 12pt;
  }
  h2 {
    font-family: 'Calibri', Arial, sans-serif;
    font-size: 16pt;
    font-weight: bold;
    color: #1e3a8a;
    border-bottom: 1pt solid #cbd5e1;
    padding-bottom: 4pt;
    margin-top: 18pt;
    margin-bottom: 8pt;
  }
  h3 {
    font-family: 'Calibri', Arial, sans-serif;
    font-size: 13pt;
    font-weight: bold;
    color: #334155;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }
  h4 {
    font-family: 'Calibri', Arial, sans-serif;
    font-size: 11pt;
    font-weight: bold;
    color: #475569;
    margin-top: 10pt;
    margin-bottom: 4pt;
  }
  p {
    margin-top: 0;
    margin-bottom: 8pt;
    text-align: justify;
  }
  .lead {
    font-size: 12pt;
    color: #334155;
    font-weight: 500;
  }
  .callout {
    background-color: #f1f5f9;
    border-left: 4pt solid #2563eb;
    padding: 10pt 14pt;
    margin: 12pt 0;
    font-size: 10.5pt;
  }
  .callout-warning {
    background-color: #fffbeb;
    border-left: 4pt solid #d97706;
    padding: 10pt 14pt;
    margin: 12pt 0;
    font-size: 10.5pt;
  }
  .callout-success {
    background-color: #f0fdf4;
    border-left: 4pt solid #16a34a;
    padding: 10pt 14pt;
    margin: 12pt 0;
    font-size: 10.5pt;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 10pt;
  }
  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: bold;
    text-align: left;
    padding: 6pt 8pt;
    border: 1pt solid #0f172a;
  }
  td {
    padding: 6pt 8pt;
    border: 1pt solid #cbd5e1;
    vertical-align: top;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  code {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9.5pt;
    background-color: #f1f5f9;
    padding: 1pt 3pt;
    border: 1pt solid #e2e8f0;
    color: #0f172a;
  }
  .formula-box {
    background-color: #0f172a;
    color: #fde047;
    font-family: 'Consolas', monospace;
    font-size: 10pt;
    padding: 10pt 12pt;
    margin: 10pt 0;
    border-radius: 2pt;
  }
  .meta-table {
    margin-bottom: 20pt;
  }
  .meta-table td {
    border: none;
    padding: 3pt 6pt;
  }
  .badge {
    font-family: 'Consolas', monospace;
    font-weight: bold;
    padding: 2pt 5pt;
    border-radius: 2pt;
    font-size: 8.5pt;
    text-transform: uppercase;
  }
  .badge-blue { background-color: #dbeafe; color: #1e40af; }
  .badge-green { background-color: #dcfce7; color: #166534; }
  .badge-purple { background-color: #f3e8ff; color: #6b21a8; }
  .badge-amber { background-color: #fef3c7; color: #92400e; }
  ul, ol {
    margin-top: 0;
    margin-bottom: 8pt;
    padding-left: 20pt;
  }
  li {
    margin-bottom: 4pt;
  }
</style>
</head>
<body>

<!-- DOCUMENT COVER & HEADER METADATA -->
<div style="text-align: center; margin-bottom: 24pt; border-bottom: 3pt double #0f172a; padding-bottom: 16pt;">
  <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 2pt;">
    ORACLE PRACTICE DELIVERY SPECIFICATION & METHODOLOGY STANDARD
  </div>
  <h1 style="border-bottom: none; margin-top: 8pt; margin-bottom: 4pt; font-size: 26pt; color: #0f172a;">
    Oracle Cloud Transformation Planning & Estimation Framework
  </h1>
  <div style="font-size: 13pt; color: #1e3a8a; font-weight: 600; margin-bottom: 12pt;">
    Standard Operating Procedure, Mathematical Lineage & WBS Generation Architecture (v1.0)
  </div>
  <div style="font-size: 10pt; color: #475569;">
    Authoritative Delivery Directive for Fixed-Price, Multi-Wave & Multi-Pillar Cloud Implementations
  </div>
</div>

<table class="meta-table" style="background-color: #f8fafc; border: 1pt solid #cbd5e1; width: 100%;">
  <tr>
    <td style="width: 25%; font-weight: bold; color: #475569;">Document Standard:</td>
    <td style="width: 25%;">Oracle Project Plan Standard v1.0</td>
    <td style="width: 25%; font-weight: bold; color: #475569;">Publication Date:</td>
    <td style="width: 25%;">${currentDate}</td>
  </tr>
  <tr>
    <td style="font-weight: bold; color: #475569;">Target Program:</td>
    <td>${proposalName}</td>
    <td style="font-weight: bold; color: #475569;">Proposal ID / Tracking:</td>
    <td><code>${thorId}</code></td>
  </tr>
  <tr>
    <td style="font-weight: bold; color: #475569;">Client Organization:</td>
    <td>${clientName}</td>
    <td style="font-weight: bold; color: #475569;">Delivery Lifecycle Model:</td>
    <td>7-Phase Oracle TCM / OUM Cloud</td>
  </tr>
  <tr>
    <td style="font-weight: bold; color: #475569;">Program Duration:</td>
    <td>${projectWeeks} Weeks (${Math.round(projectWeeks / 4.33)} Months)</td>
    <td style="font-weight: bold; color: #475569;">P80 Defensible Effort:</td>
    <td><strong>${totalHours.toLocaleString()} Hours</strong> (${personMonths} PM)</td>
  </tr>
</table>

<!-- SECTION 1: EXECUTIVE OVERVIEW -->
<h1>1. Executive Summary & Purpose</h1>
<p class="lead">
The Oracle Cloud Transformation Planning & Estimation Framework is the official standard for generating defensible, mathematically traceable, and execution-ready implementation proposals. It bridges commercial bid defense, functional depth scoping, technical RICEFW complexity, and stage-gate schedule generation into an authoritative, single source of truth.
</p>
<p>
Historically, enterprise Oracle Cloud proposals have suffered from three systemic vulnerabilities: (1) subjective spreadsheet estimation variance, (2) arbitrary schedule compression that creates unachievable testing windows, and (3) scope ambiguity around integrations and mock data conversions. This framework replaces discretionary guessing with deterministic mathematical models, proven industry benchmarks, and mandatory governance stage gates.
</p>

<div class="callout-success">
  <strong>Core Platform Objective:</strong> Provide a fully auditable path from high-level RFP scope to granular Work Breakdown Structure (WBS), ensuring that every person-month quoted is directly backed by explicit architectural drivers, friction modifiers, and verified delivery capabilities.
</div>

<!-- SECTION 2: OPERATING PRINCIPLES & GOVERNANCE DIRECTIVES -->
<h1>2. Operating Principles & Non-Negotiables</h1>
<p>
The application engines and planning assistants must strictly adhere to the six immutable directives established in the <code>oracle-project-plan-standard.yaml</code> specification:
</p>

<h3>Directive 1: Methodology Determines Structure</h3>
<p>
Project plan architecture is dictated exclusively by methodology rather than arbitrary calendar dates. Every plan must structure into two mandatory operational tiers:
</p>
<ul>
  <li><strong>Wave 0 (Mandatory Foundation & Mobilization)</strong>: Encompasses <code>TEAM MOBILIZATION (CORE)</code>, <code>KICK-OFF ACTIVITIES</code>, <code>BUSINESS ONBOARDING</code>, and Enterprise Design (<code>FOUNDATION DESIGN</code>, <code>WORKSTREAM DESIGN</code>, <code>RE-BASELINE PROJECT</code>). Workstream Design occupies approximately 50% of Wave 0.</li>
  <li><strong>Post-ED Waves (Waves 1 through 5)</strong>: Dedicated execution cycles encompassing Detailed Design (11%), Build & Sprint Execution (50%), Business Testing 1 - SIT (21%), Business Testing 2 - UAT (21%), Cutover & Deployment (7%), Hypercare Support (21%), and Transition to Run (9%).</li>
</ul>

<h3>Directive 2: Deterministic Scheduling & Calendar Normalization</h3>
<p>
All program start dates must automatically normalize to the Monday of the target kickoff week. Weekend working is disabled by default, and statutory holidays and enterprise blackouts must be explicitly flagged rather than ignored. Predecessor lags, duration floats, and phase gates are computed deterministically.
</p>

<h3>Directive 3: 4-Tier Functional Scope Expansion</h3>
<p>
Scope is never modeled as flat line items. It expands through a deterministic four-tier hierarchy:
<br>
<code>Oracle Module &rarr; Process Area &rarr; Epic &rarr; Activity / WBS Task</code>
</p>

<h3>Directive 4: Standard Technical Component Expansion</h3>
<p>
Technical assets must follow standardized delivery lifecycles:
</p>
<ul>
  <li><strong>Integrations (OIC / Boundary)</strong>: Design & Specification &rarr; Build & Orchestration &rarr; Unit/SIT Testing &rarr; Cutover Activation.</li>
  <li><strong>Data Conversions</strong>: Field Mapping & Specification &rarr; Extraction Scripting &rarr; Transformation Logic &rarr; Mock Load Iterations (M1-M4) &rarr; Cutover Tie-Out.</li>
  <li><strong>Reports (BIP / OTBI)</strong>: Catalog Audit &rarr; Data Model Design &rarr; Layout Engineering & Bursting &rarr; Reconciliation Sign-off.</li>
  <li><strong>Extensions (PaaS / VBCS)</strong>: UI Wireframing & UX &rarr; Autonomous DB / ORDS Services &rarr; Security Integration &rarr; End-to-End Validation.</li>
</ul>

<h3>Directive 5: Smartsheet 30-Column Standard Compliance</h3>
<p>
All plan outputs generated for project management synchronization must format into the exact 30-column Smartsheet specification in immutable sequence, from <code>Task Name</code> down to <code>Anomaly Reason</code>.
</p>

<h3>Directive 6: Zero Task Invention & Anti-Hallucination Discipline</h3>
<p>
No arbitrary or improvised tasks are permitted outside the approved WBS master data library. Cross-cutting mandatory tracks (<code>GOVERNANCE</code>, <code>PMO</code>, <code>ARCHITECTURE</code>, <code>SECURITY</code>, <code>TESTING</code>, <code>DATA</code>, <code>OCM</code>, <code>TRAINING</code>, <code>DEPLOYMENT</code>, <code>HYPERCARE</code>, <code>TRANSITION</code>) must be preserved in every proposal.
</p>

<!-- SECTION 3: THE 7 CORE ARCHITECTURAL PILLARS -->
<h1>3. The 7 Core Architectural Pillars</h1>
<p>
The platform is organized around seven integrated pillars that evaluate and synthesize project reality:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">Pillar</th>
      <th style="width: 25%;">Pillar Name</th>
      <th style="width: 35%;">Core Analytical Mechanism</th>
      <th style="width: 25%;">Primary Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Pillar 01</strong></td>
      <td><strong>Delivery Lifecycle Architecture</strong></td>
      <td>7-Phase Oracle True Cloud Method (TCM) with stage gates (CRP1, CRP2, SIT, UAT, Cutover).</td>
      <td>Baseline Schedule & Stage Gate Network</td>
    </tr>
    <tr>
      <td><strong>Pillar 02</strong></td>
      <td><strong>Functional 20-Q Depth Engine</strong></td>
      <td>20 granular scoping questions per module across ERP, SCM, HCM, EPM, and CX.</td>
      <td>Module T-Shirt Sizing (XS to XXL)</td>
    </tr>
    <tr>
      <td><strong>Pillar 03</strong></td>
      <td><strong>Rollout & Wave Architecture</strong></td>
      <td>12-dimensional rollout strategy model analyzing regional localization and concurrency.</td>
      <td>Multi-Wave Release Roadmap</td>
    </tr>
    <tr>
      <td><strong>Pillar 04</strong></td>
      <td><strong>CEMLI & Technical Sizing</strong></td>
      <td>Visual Integration Complexity Matrix and 4-Mock conversion sliding scale.</td>
      <td>Defensible Technical Workstream Hours</td>
    </tr>
    <tr>
      <td><strong>Pillar 05</strong></td>
      <td><strong>Client Friction & Risk Modifiers</strong></td>
      <td>7 behavioral friction dimensions (Data Debt, SME Dedication, SteerCo Latency, etc.).</td>
      <td>Compounded Net Friction Multiplier</td>
    </tr>
    <tr>
      <td><strong>Pillar 06</strong></td>
      <td><strong>Quarterly Patch & Blackout Analyzer</strong></td>
      <td>Pod Cohort (A/B/C) calendar conflict detection against testing and cutover freezes.</td>
      <td>Deconfliction & Mitigation Strategy</td>
    </tr>
    <tr>
      <td><strong>Pillar 07</strong></td>
      <td><strong>Commercials & Delivery Governance</strong></td>
      <td>Global staffing pyramid (Onshore/Offshore), role margins, and DoA escalation tiers.</td>
      <td>Contractual Deal Defense Dossier</td>
    </tr>
  </tbody>
</table>

<!-- SECTION 4: TECHNICAL SIZING & INTEGRATION COMPLEXITY MATRIX -->
<h1>4. Technical CEMLI Sizing & Integration Complexity Matrix</h1>
<p>
Technical scope represents the single greatest driver of budget variance in Oracle Cloud implementations. This framework establishes two rigorous, transparent sizing mechanisms: the <strong>Integration Complexity Matrix</strong> and the <strong>4-Tier Conversion Mock Sliding Scale</strong>.
</p>

<h3>4.1 Integration Complexity Matrix & Scaling Multiplier</h3>
<p>
Rather than applying an arbitrary bulk multiplier, every connected system interface is itemized and categorized into three standardized technical tiers:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">Complexity Tier</th>
      <th style="width: 15%;">Effort Multiplier</th>
      <th style="width: 15%;">Standard Hours</th>
      <th style="width: 55%;">Technical Criteria & Archetype Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="badge badge-green">Simple</span></td>
      <td><strong>0.85x</strong></td>
      <td><strong>45 – 50 hrs</strong></td>
      <td>Point-to-point 1:1 field mappings, standard pre-certified adapters (e.g., Vertex Tax, SAP Concur), single-object JSON REST pass-through, low-frequency execution, minimal business transformation.</td>
    </tr>
    <tr>
      <td><span class="badge badge-blue">Medium</span></td>
      <td><strong>1.20x</strong></td>
      <td><strong>85 – 95 hrs</strong></td>
      <td>Multi-entity choreography, Domain Value Map (DVM) lookups, pagination, token exchange authentication, OIC Error Hospital dead-letter queue, standard webhook listeners (e.g., Salesforce CPQ, Workday HCM, Coupa).</td>
    </tr>
    <tr>
      <td><span class="badge badge-purple">Complex</span></td>
      <td><strong>1.75x</strong></td>
      <td><strong>160 – 180 hrs</strong></td>
      <td>High-throughput streaming, transactional locking, custom canonical XSLT schemas, automated batch FBDI zip generation, host-to-host banking (ISO 20022 XML / camt.053), factory floor MES, or legacy SFTP/mTLS bridging.</td>
    </tr>
  </tbody>
</table>

<div class="formula-box">
  <strong>Dynamic Integration Sizing Formula:</strong><br>
  Blended_Multiplier = [(N_Simple &times; 0.85) + (N_Medium &times; 1.20) + (N_Complex &times; 1.75)] / Total_Integrations<br>
  H_Integration_Base = Total_Integrations &times; 80h &times; Blended_Multiplier
</div>

<p>
In the current project scenario, <strong>${extIntCount} external integrations</strong> are mapped with an effective blended multiplier of <strong>${blendedMultiplier.toFixed(2)}x</strong>, feeding directly into the Estimation Engine.
</p>

<h3>4.2 Data Conversion Sizing & The 4-Mock Sliding Scale</h3>
<p>
Data conversion effort is modeled across iterative mock rehearsal cycles. Successive loads demonstrate significant yield efficiencies as field cross-references and extraction scripts stabilize:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">Rehearsal Cycle</th>
      <th style="width: 20%;">Relative Cycle Weight</th>
      <th style="width: 20%;">Cumulative Multiplier</th>
      <th style="width: 45%;">Operational Objective & Stage Gate</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Mock 1</strong></td>
      <td>100% of Base</td>
      <td><strong>1.00x</strong></td>
      <td>Baseline extraction, template mapping, initial FBDI/HDL script build, core entity validation.</td>
    </tr>
    <tr>
      <td><strong>Mock 2</strong></td>
      <td>80% of Base</td>
      <td><strong>1.80x</strong></td>
      <td>SIT-ready cleansed load, automated deduplication, exception resolution, reconciliation sign-off.</td>
    </tr>
    <tr>
      <td><strong>Mock 3</strong></td>
      <td>60% of Base</td>
      <td><strong>2.40x</strong></td>
      <td>UAT volume load, full historical subledgers, performance tuning, business stakeholder tie-out.</td>
    </tr>
    <tr>
      <td><strong>Mock 4 (Recommended)</strong></td>
      <td>40% of Base</td>
      <td><strong>2.80x</strong></td>
      <td>Cutover dress rehearsal, production timing dry run, rollback simulation, executive go-live gate.</td>
    </tr>
  </tbody>
</table>

<div class="callout">
  <strong>Best Practice Directive:</strong> For fixed-price implementations with legacy transactional history (&ge; 2 years) or more than 10 FBDI objects, <strong>4 Mock Cycles (2.80x cumulative multiplier)</strong> must be configured to provide contractually defensible cutover defense.
</div>

<!-- SECTION 5: MATHEMATICAL DERIVATION & ESTIMATION FORMULAS -->
<h1>5. Mathematical Lineage & Effort Formulas</h1>
<p>
The Estimation Engine calculates total defensible project hours through a transparent five-stage parametric derivation:
</p>

<h3>Stage 1: Raw Functional & Scale Base Hours (H_base)</h3>
<div class="formula-box">
  H_base = &sum;(H_Module_Catalog &times; Module_Complexity_Factor) + H_Integrations + H_Conversions + H_PaaS + H_Reports + H_Workflows
</div>

<h3>Stage 2: 7-Modifier Compounded Friction Factor (M_friction)</h3>
<p>
The net organizational friction multiplier compounds across seven calibrated client readiness dimensions:
</p>
<ul>
  <li><code>M1: Decision Velocity</code> (0.90x Rapid &le;3d, 1.00x Standard, 1.25x Delayed &ge;10d)</li>
  <li><code>M2: Legacy Data Debt</code> (0.90x Golden Records, 1.00x Moderate, 1.30x Severe Legacy Debt)</li>
  <li><code>M3: Cloud Mindset & MBP</code> (0.85x Pure Fit-to-Standard, 1.00x Standard, 1.25x Customization-Heavy)</li>
  <li><code>M4: Integration Volatility</code> (0.90x Stable APIs, 1.00x Standard, 1.30x Shifting Third-Party Specs)</li>
  <li><code>M5: Dedicated Client SME Availability</code> (0.90x 100% Dedicated, 1.00x Shared, 1.35x Severe SME Backfill Deficit)</li>
  <li><code>M6: Statutory & Regulatory Complexity</code> (0.95x Domestic, 1.00x Standard, 1.25x Multi-Country E-Invoicing)</li>
  <li><code>M7: Organizational Change Resistance</code> (0.90x Receptive, 1.00x Standard, 1.25x High Change Friction)</li>
</ul>

<div class="formula-box">
  M_friction = &prod; (Modifier_i) &nbsp;&nbsp;[Range: 0.70x to 2.45x, Default Enterprise: ~1.12x]
</div>

<h3>Stage 3: Statistical Confidence Bands (P50, P80, P95)</h3>
<p>
Hours are expressed across statistically defensible confidence distributions:
</p>
<ul>
  <li><strong>P50 (Target Operational Baseline)</strong>: Lean, unbuffered staffing baseline assuming on-time milestone sign-offs.</li>
  <li><strong>P80 (Defensible Contractual Commitment)</strong>: Commercial proposal quote with calibrated contingency buffer (10%–25%), absorbing ordinary client delays and rework.</li>
  <li><strong>P95 (Conservative Risk Ceiling)</strong>: Maximum exposure reserve for deals with critical data debt or dual-SI governance friction.</li>
</ul>

<!-- SECTION 6: SMARTSHEET 30-COLUMN SPECIFICATION -->
<h1>6. Smartsheet 30-Column Interoperability Specification</h1>
<p>
To guarantee automated ingestion into enterprise PMO tooling (Smartsheet, Microsoft Project, Oracle Primavera), every generated plan outputs all thirty standard columns in immutable sequence:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 10%;">Col #</th>
      <th style="width: 25%;">Column Name</th>
      <th style="width: 15%;">Data Type</th>
      <th style="width: 50%;">Description & Permitted Values</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td><code>Task Name</code></td><td>String</td><td>Standardized task title from approved WBS library.</td></tr>
    <tr><td>2</td><td><code>ASSIGNED TO ROLE</code></td><td>String</td><td>Named delivery role from standard rate card.</td></tr>
    <tr><td>3</td><td><code>Status</code></td><td>Enum</td><td>Not Started, In Progress, Complete, On Hold.</td></tr>
    <tr><td>4</td><td><code>Start Date</code></td><td>Date</td><td>Calculated calendar date (Monday normalized).</td></tr>
    <tr><td>5</td><td><code>End Date</code></td><td>Date</td><td>Calculated milestone completion date.</td></tr>
    <tr><td>6</td><td><code>Task Progress</code></td><td>Percentage</td><td>0% to 100% completion tracking.</td></tr>
    <tr><td>7</td><td><code>Predecessors</code></td><td>String</td><td>Comma-separated dependency task numbers (FS, SS, FF).</td></tr>
    <tr><td>8</td><td><code>Duration</code></td><td>Integer</td><td>Duration in working days (excluding weekends/blackouts).</td></tr>
    <tr><td>9</td><td><code>Type</code></td><td>Enum</td><td>Task, Summary, Milestone, Stage Gate.</td></tr>
    <tr><td>10</td><td><code>Workstream</code></td><td>Enum</td><td>FUNCTIONAL, TECHNICAL, DATA, TESTING, PMO, OCM, etc.</td></tr>
    <tr><td>11</td><td><code>Comments</code></td><td>String</td><td>Auditable sizing assumptions or boundary notes.</td></tr>
    <tr><td>12</td><td><code>Allocation</code></td><td>Percentage</td><td>FTE staffing percentage assigned to task.</td></tr>
    <tr><td>13</td><td><code>LEVEL-ID</code></td><td>Integer</td><td>WBS outline depth (Level 1 Phase to Level 4 Activity).</td></tr>
    <tr><td>14</td><td><code>Complete</code></td><td>Boolean</td><td>Binary completion status checkbox.</td></tr>
    <tr><td>15</td><td><code>TASK_NUMBER</code></td><td>String</td><td>Immutable unique identifier (e.g., TSK-BLD-014).</td></tr>
    <tr><td>16</td><td><code>CATEGORY</code></td><td>String</td><td>Functional domain or technical workstream category.</td></tr>
    <tr><td>17</td><td><code>WBS-ID</code></td><td>String</td><td>Hierarchical index (e.g., 3.2.1.4).</td></tr>
    <tr><td>18</td><td><code>TEMPLATE-ID</code></td><td>String</td><td>Master standard template reference ID.</td></tr>
    <tr><td>19</td><td><code>Parent WBS ID</code></td><td>String</td><td>Immediate parent WBS node identifier.</td></tr>
    <tr><td>20</td><td><code>Wave</code></td><td>String</td><td>Wave 0, Wave 1, Wave 2, etc.</td></tr>
    <tr><td>21</td><td><code>Phase</code></td><td>String</td><td>Enablement, Design, Build, Test, Deploy, Hypercare.</td></tr>
    <tr><td>22</td><td><code>Sub-Phase</code></td><td>String</td><td>Specific sub-phase milestone grouping.</td></tr>
    <tr><td>23</td><td><code>Domain</code></td><td>Enum</td><td>ERP, SCM, HCM, EPM, CX, CROSS_PILLAR.</td></tr>
    <tr><td>24</td><td><code>Module Code</code></td><td>String</td><td>Standard Oracle module code (e.g., ERP_GL, SCM_OM).</td></tr>
    <tr><td>25</td><td><code>Module Name</code></td><td>String</td><td>Full functional module title.</td></tr>
    <tr><td>26</td><td><code>Component ID</code></td><td>String</td><td>Technical RICEFW asset ID (e.g., INT-01, CONV-04).</td></tr>
    <tr><td>27</td><td><code>Component Name</code></td><td>String</td><td>Full title of connected integration or data object.</td></tr>
    <tr><td>28</td><td><code>Schedule Method</code></td><td>Enum</td><td>CRITICAL_PATH, PARALLEL_STREAM, STAGE_GATE.</td></tr>
    <tr><td>29</td><td><code>Anomaly Flag</code></td><td>Boolean</td><td>Automated audit flag for schedule risk.</td></tr>
    <tr><td>30</td><td><code>Anomaly Reason</code></td><td>String</td><td>Detailed diagnostic reason for flagged task.</td></tr>
  </tbody>
</table>

<!-- SECTION 7: DEAL DEFENSE & GOVERNANCE CHECKLIST -->
<h1>7. Deal Defense & Governance Sign-Off Protocol</h1>
<p>
Before any proposal is submitted to a client or presented to corporate leadership, the proposal lead must complete the following six verification gates:
</p>
<ol>
  <li><strong>Calendar Normalization Check</strong>: Confirm project kickoff starts on a Monday with zero unapproved weekend shifts.</li>
  <li><strong>Blackout Collision Audit</strong>: Verify that no quarterly Oracle Cloud pod updates (Cohorts A/B/C) collide with SIT entry or Cutover dry-run windows.</li>
  <li><strong>Integration Matrix Sign-Off</strong>: Confirm all ${extIntCount} boundary interfaces have verified complexity ratings (Simple/Medium/Complex) and assigned Oracle functional modules.</li>
  <li><strong>Conversion Mock Rehearsals</strong>: Confirm at least 3 Mock Cycles (4 recommended) are budgeted for all master data entities and open transaction cutover.</li>
  <li><strong>Client Friction Review</strong>: Verify that the 7 client delivery modifiers reflect realistic organizational assessments rather than best-case assumptions.</li>
  <li><strong>Delegation of Authority (DoA) Alignment</strong>: Verify that the overall contract value, gross margin (&ge; 35%), and contingency reserves align with corporate Deal Board thresholds.</li>
</ol>

<div style="margin-top: 30pt; padding-top: 10pt; border-top: 1pt solid #cbd5e1; font-size: 9pt; color: #64748b; text-align: center;">
  <em>Oracle Cloud Project Planning & Estimation Engine &bull; Standard Specification Document &bull; Confirmed Compliant with oracle-project-plan-standard.yaml</em>
</div>

</body>
</html>
  `;

  // Create a Blob with Word-compatible HTML format
  const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Oracle_Cloud_Planning_Framework_Specification_${thorId}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
