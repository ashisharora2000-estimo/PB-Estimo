import pptxgen from 'pptxgenjs';
import { ProjectScenario, CalculatedProjectData } from '../types';
import { ORACLE_MODULE_CATALOG } from '../data/oraclePhases';

export interface PptxGenerationOptions {
  author?: string;
  company?: string;
  title?: string;
}

/**
 * Generates an executive 5-slide PowerPoint deck compliant with client delivery standards.
 * Guaranteed maximum 5 slides with:
 * Slide 1: Executive Deal Summary & Program Thesis
 * Slide 2: Solution Architecture & Functional Scope
 * Slide 3: Scope Demarcation: Explicit In-Scope vs. Out-of-Scope Boundaries
 * Slide 4: Technical Objects & Complexity Inventory (RICEFW)
 * Slide 5: Delivery Roadmap, Phased Gantt & Effort Breakdown
 */
export async function generateExecutiveSlideDeck(
  scenario: ProjectScenario,
  data: CalculatedProjectData,
  options?: PptxGenerationOptions
): Promise<void> {
  const pptx = new pptxgen();

  // Configure Presentation
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = options?.author || 'Oracle Practice Executive Lead';
  pptx.company = options?.company || 'Oracle Cloud Practice';
  pptx.title = options?.title || `${scenario.name} - Executive Proposal Dossier`;

  // Design Tokens (Executive Navy & Slate Theme)
  const COLOR_NAVY_DARK = '0F172A'; // Slate 900
  const COLOR_NAVY_MEDIUM = '1E293B'; // Slate 800
  const COLOR_INDIGO = '4338CA'; // Indigo 700
  const COLOR_INDIGO_LIGHT = 'EEF2FF'; // Indigo 50
  const COLOR_EMERALD = '059669'; // Emerald 600
  const COLOR_EMERALD_LIGHT = 'ECFDF5'; // Emerald 50
  const COLOR_ROSE = 'BE123C'; // Rose 700
  const COLOR_ROSE_LIGHT = 'FFF1F2'; // Rose 50
  const COLOR_CARD_BG = 'F8FAFC'; // Slate 50
  const COLOR_BORDER = 'CBD5E1'; // Slate 300
  const COLOR_TEXT_MUTED = '64748B'; // Slate 500
  const COLOR_TEXT_DARK = '0F172A'; // Slate 900

  // Derived Metrics & Calculations with Safe Fallbacks
  const thorId = scenario.thorId && scenario.thorId.trim() !== '' ? scenario.thorId : 'PROP-2026-001';
  const totalHours = Math.round(data.targetHours ?? data.p80_DefensibleHours ?? 0);
  const totalDays = Math.round(totalHours / 8);
  const totalMonths = Math.round(data.targetPersonMonths || totalHours / 160);
  const durationWeeks = typeof data.recommendedDurationWeeks === 'number'
    ? data.recommendedDurationWeeks
    : (typeof scenario.projectWeeks === 'number' ? scenario.projectWeeks : 0);
  const deliveryModel = scenario.deliveryModel || 'Global Delivery (30% Onshore / 70% Offshore)';
  const tcvFormatted = data.deliveryRevenue 
    ? `$${(Math.round(data.deliveryRevenue / 1000) * 1000).toLocaleString()}`
    : `$${(Math.round((totalHours * 115) / 1000) * 1000).toLocaleString()}`;
  const blendedRate = data.blendedBillRate ? `$${Math.round(data.blendedBillRate)}/hr` : '$115/hr';
  const peakFTE = data.peakFTE || (durationWeeks > 0 ? Math.max(4, Math.round(totalHours / (durationWeeks * 40))) : 0);
  const avgFTE = data.avgTotalFTE ?? (durationWeeks > 0 ? Math.round((totalHours / (durationWeeks * 40)) * 10) / 10 : 0);
  const industry = (scenario as any).industry || (scenario as any).scaleDrivers?.industry || 'Enterprise Cross-Industry';

  // Selected Modules Breakdown
  const selectedModObjs = ORACLE_MODULE_CATALOG.filter(m => scenario.selectedModules.includes(m.id));
  const erpMods = selectedModObjs.filter(m => m.pillar === 'ERP').map(m => m.name);
  const scmMods = selectedModObjs.filter(m => m.pillar === 'SCM').map(m => m.name);
  const hcmMods = selectedModObjs.filter(m => m.pillar === 'HCM').map(m => m.name);
  const otherMods = selectedModObjs.filter(m => !['ERP', 'SCM', 'HCM'].includes(m.pillar)).map(m => m.name);

  // Technical Objects Counts (RICEFW)
  const integrationsCount = scenario.technicalIntegrations?.length || scenario.scaleDrivers?.tech_oic || 8;
  const conversionsCount = scenario.scaleDrivers?.tech_data_objects || 12;
  const mockCycles = scenario.scaleDrivers?.tech_conversion_cycles || 3;
  const reportsCount = (scenario.scaleDrivers?.tech_reports_bip || 10) + (scenario.scaleDrivers?.tech_reports_otbi || 15);
  const extensionsCount = scenario.scaleDrivers?.tech_paas || 2;
  const workflowsCount = scenario.scaleDrivers?.tech_bpm_approval_groups || 4;

  // Technical & Functional Scope Breakdown from Calculation Engine
  const functionalHours = (data.moduleEstimates || []).reduce((sum, m) => sum + m.finalP80Hours, 0);
  const crossWorkstreamHours = Math.max(0, totalHours - functionalHours);

  // RICEFW Exact Hours & Complexity Distributions from Calculation Engine
  const actualIntegrationHours = Math.round(data.technicalWorkstreamEstimate?.integrationsHours ?? (data.workstreamHours?.find(w => w.id === 'ws_tech_oic')?.hours ? data.workstreamHours.find(w => w.id === 'ws_tech_oic')!.hours * 0.55 : integrationsCount * 80 * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualConversionHours = Math.round(data.conversionMetrics?.totalConversionP80Hours ?? (data.workstreamHours?.find(w => w.id === 'ws_data_conv')?.hours || conversionsCount * 45 * (data.complexMultiplier || 1) * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualReportsHours = Math.round(data.technicalWorkstreamEstimate?.reportsHours ?? (((scenario.scaleDrivers?.tech_reports_bip || 0) * 45 + (scenario.scaleDrivers?.tech_reports_otbi || 0) * 18) * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualExtensionsHours = Math.round(data.technicalWorkstreamEstimate?.paasHours ?? ((scenario.scaleDrivers?.tech_paas || 0) * 550 * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));
  const actualWorkflowsHours = Math.round(((data.technicalWorkstreamEstimate?.workflowsHours || 0) + (data.technicalWorkstreamEstimate?.securityRolesHours || 0)) || (((scenario.scaleDrivers?.tech_workflows || 0) * 55 + (scenario.scaleDrivers?.tech_security_roles || 0) * 35) * (data.netClientModifier || 1) * (1 + (data.contingencyPct || 0.15))));

  const sInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'S').length ?? 0;
  const mInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'M').length ?? 0;
  const cInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'C').length ?? 0;
  const xlInt = scenario.technicalIntegrations?.filter(i => i.complexity === 'XL').length ?? 0;
  const intComplexityLabel = (sInt + mInt + cInt + xlInt > 0)
    ? `S: ${sInt} | M: ${mInt} | C: ${cInt}${xlInt > 0 ? ` | XL: ${xlInt}` : ''}`
    : 'Simple / Med / Complex';

  const bipCount = scenario.scaleDrivers?.tech_reports_bip || 0;
  const otbiCount = scenario.scaleDrivers?.tech_reports_otbi || 0;
  const reportsComplexityLabel = (bipCount + otbiCount > 0)
    ? `BIP: ${bipCount} | OTBI: ${otbiCount}`
    : 'BIP & OTBI';

  const actualTechFactoryHours = Math.round((data.technicalWorkstreamEstimate?.totalHours || 0) + (data.conversionMetrics?.totalConversionP80Hours || 0)) || Math.round(totalHours * 0.35);

  // Helper function to add consistent Header and Footer on every slide
  const applyHeaderFooter = (slide: any, slideNumber: number, title: string, category: string) => {
    // Top Bar Background
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.85,
      fill: { color: COLOR_NAVY_DARK }
    });

    // Category Eyebrow
    slide.addText(category.toUpperCase(), {
      x: 0.6,
      y: 0.12,
      w: 8.0,
      h: 0.2,
      fontSize: 9,
      bold: true,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    // Slide Title
    slide.addText(title, {
      x: 0.6,
      y: 0.32,
      w: 8.5,
      h: 0.45,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    // Thor ID Badge on Top Right
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 10.2,
      y: 0.2,
      w: 2.5,
      h: 0.45,
      rectRadius: 0.05,
      fill: { color: '1E293B' },
      line: { color: '475569', width: 1 }
    });
    slide.addText(`THOR ID: ${thorId}`, {
      x: 10.2,
      y: 0.2,
      w: 2.5,
      h: 0.45,
      fontSize: 10,
      bold: true,
      color: '38BDF8',
      align: 'center',
      valign: 'middle',
      fontFace: 'Courier New'
    });

    // Bottom Footer Bar
    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 7.0,
      w: 12.1,
      h: 0,
      line: { color: COLOR_BORDER, width: 1 }
    });

    slide.addText(`Confidential | ${scenario.name} - Oracle Cloud True Cloud Method (OUM) Proposal Dossier`, {
      x: 0.6,
      y: 7.05,
      w: 9.0,
      h: 0.3,
      fontSize: 8.5,
      color: COLOR_TEXT_MUTED,
      fontFace: 'Arial'
    });

    slide.addText(`Slide ${slideNumber} of 5`, {
      x: 11.2,
      y: 7.05,
      w: 1.5,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: COLOR_NAVY_DARK,
      align: 'right',
      fontFace: 'Arial'
    });
  };

  // =========================================================================
  // SLIDE 1: EXECUTIVE DEAL SUMMARY & PROGRAM THESIS
  // =========================================================================
  const slide1 = pptx.addSlide();
  applyHeaderFooter(slide1, 1, 'Executive Deal Summary & Delivery Thesis', 'Proposal Dossier • Step 1');

  // Left Overview Box
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.1,
    w: 5.8,
    h: 5.65,
    rectRadius: 0.08,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide1.addText('Executive Engagement Overview', {
    x: 0.9,
    y: 1.3,
    w: 5.2,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: COLOR_NAVY_DARK,
    fontFace: 'Arial'
  });

  slide1.addText([
    { text: 'Proposal / Deal: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `${scenario.name}\n`, options: { color: COLOR_TEXT_DARK } },
    { text: 'Industry Sector: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `${industry}\n`, options: { color: COLOR_TEXT_DARK } },
    { text: 'Target Start Date: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `${scenario.targetStartDate || 'Immediate'}\n`, options: { color: COLOR_TEXT_DARK } },
    { text: 'Target Go-Live: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `${scenario.clientTargetGoLiveDate || 'Aligned with Standard Schedule'}\n\n`, options: { color: COLOR_TEXT_DARK } },
    { text: 'Scope Architecture & Effort Composition:\n', options: { bold: true, color: COLOR_INDIGO } },
    { text: `• In-Scope Functional Modules: ${selectedModObjs.length} modules (${functionalHours.toLocaleString()} P80 hrs / ${Math.round(functionalHours / 160)} PM).\n`, options: { color: COLOR_TEXT_DARK } },
    { text: `• Cross-Cutting Technical & Governance: ${crossWorkstreamHours.toLocaleString()} P80 hrs (OIC, Mock Cycles, QA, PMO).\n`, options: { color: COLOR_TEXT_DARK } },
    { text: `• Total Program Turnkey Effort: ${totalHours.toLocaleString()} P80 hrs (${totalMonths} PM).\n`, options: { color: COLOR_TEXT_DARK, bold: true } },
    { text: '• Guaranteed delivery alignment with Oracle True Cloud Method (OUM) standards.', options: { color: COLOR_TEXT_DARK } }
  ], {
    x: 0.9,
    y: 1.7,
    w: 5.2,
    h: 4.8,
    fontSize: 10.5,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.2
  });

  // Right Top: 4 Key Executive Metrics
  const metrics = [
    { label: 'TOTAL PROGRAM EFFORT', value: `${totalHours.toLocaleString()} hrs`, sub: `${totalDays} Person-Days (${totalMonths} PM)`, color: COLOR_INDIGO },
    { label: 'PROGRAM DURATION', value: `${durationWeeks} Weeks`, sub: `Wave 0 ED + Wave Execution`, color: COLOR_NAVY_DARK },
    { label: 'ESTIMATED TCV & RATE', value: tcvFormatted, sub: `Blended Bill Rate: ${blendedRate}`, color: COLOR_EMERALD },
    { label: 'PEAK SQUAD SIZE', value: `${peakFTE} FTEs`, sub: `Avg: ${avgFTE} FTE | ${deliveryModel}`, color: COLOR_NAVY_DARK }
  ];

  metrics.forEach((m, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = 6.6 + col * 3.0;
    const y = 1.1 + row * 1.5;

    slide1.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 2.85,
      h: 1.35,
      rectRadius: 0.06,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 }
    });

    slide1.addText(m.label, {
      x: x + 0.15,
      y: y + 0.12,
      w: 2.55,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: COLOR_TEXT_MUTED,
      fontFace: 'Arial'
    });

    slide1.addText(m.value, {
      x: x + 0.15,
      y: y + 0.35,
      w: 2.55,
      h: 0.5,
      fontSize: 17,
      bold: true,
      color: m.color,
      fontFace: 'Arial'
    });

    slide1.addText(m.sub, {
      x: x + 0.15,
      y: y + 0.88,
      w: 2.55,
      h: 0.35,
      fontSize: 8.5,
      color: COLOR_TEXT_MUTED,
      fontFace: 'Arial'
    });
  });

  // Right Bottom: Delivery Model & Governance Banner
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 6.6,
    y: 4.3,
    w: 5.85,
    h: 2.45,
    rectRadius: 0.08,
    fill: { color: COLOR_INDIGO_LIGHT },
    line: { color: 'C7D2FE', width: 1 }
  });

  slide1.addText('Delivery Assurance & Governance Commitments', {
    x: 6.85,
    y: 4.45,
    w: 5.35,
    h: 0.28,
    fontSize: 11.5,
    bold: true,
    color: COLOR_INDIGO,
    fontFace: 'Arial'
  });

  slide1.addText([
    { text: '• Sourcing Model: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `${deliveryModel} leveraging Oracle Certified COE.\n`, options: { color: COLOR_TEXT_DARK } },
    { text: '• Stage Gate Rigor: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `Formal tollgates at Foundation Design, CRP1/2, SIT, and UAT Sign-Off.\n`, options: { color: COLOR_TEXT_DARK } },
    { text: '• Oracle Quarterly Patch Alignment: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `Scheduled blackout windows synchronized with Oracle Cohort updates.\n`, options: { color: COLOR_TEXT_DARK } },
    { text: '• Governance DoA Tier: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `Tier ${data.doaTier || 1} Steering Committee reporting cadence.`, options: { color: COLOR_TEXT_DARK } }
  ], {
    x: 6.85,
    y: 4.8,
    w: 5.35,
    h: 1.8,
    fontSize: 9.5,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.15
  });

  // =========================================================================
  // SLIDE 2: SOLUTION ARCHITECTURE & FUNCTIONAL SCOPE
  // =========================================================================
  const slide2 = pptx.addSlide();
  applyHeaderFooter(slide2, 2, 'Solution Architecture & Multi-Pillar Functional Scope', 'Proposal Dossier • Step 2');

  // Pillar Grid Cards (4 Cards across)
  const getPillarHours = (pillarKey: string) => {
    return (data.moduleEstimates || [])
      .filter(m => {
        if (pillarKey === 'ERP') return m.pillar === 'ERP';
        if (pillarKey === 'SCM') return m.pillar === 'SCM';
        if (pillarKey === 'HCM') return m.pillar === 'HCM';
        return m.pillar !== 'ERP' && m.pillar !== 'SCM' && m.pillar !== 'HCM';
      })
      .reduce((sum, m) => sum + m.finalP80Hours, 0);
  };

  const pillars = [
    { name: 'Financials (ERP)', count: erpMods.length, hours: getPillarHours('ERP'), modules: erpMods, color: '1E3A8A', bg: 'EFF6FF', line: 'BFDBFE' },
    { name: 'Supply Chain (SCM)', count: scmMods.length, hours: getPillarHours('SCM'), modules: scmMods, color: '065F46', bg: 'ECFDF5', line: 'A7F3D0' },
    { name: 'Human Capital (HCM)', count: hcmMods.length, hours: getPillarHours('HCM'), modules: hcmMods, color: '831843', bg: 'FDF2F8', line: 'FBCFE8' },
    { name: 'EPM / CX & Other', count: otherMods.length, hours: getPillarHours('OTHER'), modules: otherMods, color: '4C1D95', bg: 'F5F3FF', line: 'DDD6FE' }
  ];

  pillars.forEach((p, idx) => {
    const x = 0.6 + idx * 3.05;
    const y = 1.1;
    const w = 2.95;
    const h = 3.1;

    slide2.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.06,
      fill: { color: p.bg },
      line: { color: p.line, width: 1 }
    });

    slide2.addText(p.name, {
      x: x + 0.15,
      y: y + 0.12,
      w: w - 0.3,
      h: 0.25,
      fontSize: 11,
      bold: true,
      color: p.color,
      fontFace: 'Arial'
    });

    slide2.addText(`${p.count} In-Scope Modules • ${p.hours.toLocaleString()} hrs`, {
      x: x + 0.15,
      y: y + 0.37,
      w: w - 0.3,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: COLOR_TEXT_MUTED,
      fontFace: 'Arial'
    });

    const modListText = p.modules.length > 0
      ? p.modules.slice(0, 6).map(m => `• ${m}`).join('\n') + (p.modules.length > 6 ? `\n• +${p.modules.length - 6} more modules...` : '')
      : '• No modules in active scope for this pillar';

    slide2.addText(modListText, {
      x: x + 0.15,
      y: y + 0.65,
      w: w - 0.3,
      h: 2.3,
      fontSize: 8.5,
      color: COLOR_TEXT_DARK,
      fontFace: 'Arial',
      lineSpacingMultiple: 1.15
    });
  });

  // Bottom Layer: Architecture & Integration Blueprint
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 4.35,
    w: 12.1,
    h: 2.4,
    rectRadius: 0.08,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide2.addText('Target Solution Architecture Topology & Integration Fabric', {
    x: 0.85,
    y: 4.5,
    w: 8.0,
    h: 0.25,
    fontSize: 12,
    bold: true,
    color: COLOR_NAVY_DARK,
    fontFace: 'Arial'
  });

  const archBlocks = [
    { title: '1. Fusion SaaS Core', desc: 'Standard business flows, Multi-GAAP ledgers, Modern Best Practice configuration.' },
    { title: '2. Integration Layer (OIC)', desc: `Oracle Integration Cloud (${integrationsCount} interfaces), REST/SOAP APIs, FBDI batch queues.` },
    { title: '3. Data & Conversion Scale', desc: `${conversionsCount} conversion objects across ${mockCycles} rigorous mock rehearsal cycles.` },
    { title: '4. Security & Governance', desc: 'Single Sign-On (SSO), Segregation of Duties (SOD), RBAC job roles, BPM workflows.' }
  ];

  archBlocks.forEach((ab, idx) => {
    const x = 0.85 + idx * 2.95;
    const y = 4.85;
    const w = 2.8;
    const h = 1.7;

    slide2.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.05,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 }
    });

    slide2.addText(ab.title, {
      x: x + 0.12,
      y: y + 0.12,
      w: w - 0.24,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: COLOR_INDIGO,
      fontFace: 'Arial'
    });

    slide2.addText(ab.desc, {
      x: x + 0.12,
      y: y + 0.42,
      w: w - 0.24,
      h: 1.15,
      fontSize: 8.5,
      color: COLOR_TEXT_DARK,
      fontFace: 'Arial',
      lineSpacingMultiple: 1.15
    });
  });

  // =========================================================================
  // SLIDE 3: SCOPE DEMARCATION (IN-SCOPE VS OUT-OF-SCOPE)
  // =========================================================================
  const slide3 = pptx.addSlide();
  applyHeaderFooter(slide3, 3, 'Scope Demarcation: Explicit In-Scope vs. Out-of-Scope Boundaries', 'Proposal Dossier • Step 3');

  // Left: IN-SCOPE PANEL
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.1,
    w: 5.9,
    h: 5.65,
    rectRadius: 0.08,
    fill: { color: COLOR_EMERALD_LIGHT },
    line: { color: 'A7F3D0', width: 1.5 }
  });

  slide3.addText('✓ EXPLICIT IN-SCOPE DELIVERABLES', {
    x: 0.9,
    y: 1.3,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: COLOR_EMERALD,
    fontFace: 'Arial'
  });

  slide3.addText([
    { text: '• Wave 0 Enterprise Design: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Core foundation design, Chart of Accounts (COA) structure, Enterprise Org model, and Global Data Architecture.\n\n', options: { color: COLOR_TEXT_DARK } },
    { text: '• Functional Configuration: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `Configuration and CRP iterations for ${selectedModObjs.length} selected Oracle Fusion Cloud modules.\n\n`, options: { color: COLOR_TEXT_DARK } },
    { text: '• Technical Objects (RICEFW): ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: `Design, build, and test of ${integrationsCount} integrations, ${conversionsCount} data objects, and ${reportsCount} BI reports.\n\n`, options: { color: COLOR_TEXT_DARK } },
    { text: '• Testing & Verification: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'End-to-End System Integration Testing (SIT) and formal UAT enablement & support.\n\n', options: { color: COLOR_TEXT_DARK } },
    { text: '• Cutover & Hypercare: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Production Cutover execution, dry-run rehearsal, and post-go-live Hypercare warranty.', options: { color: COLOR_TEXT_DARK } }
  ], {
    x: 0.9,
    y: 1.7,
    w: 5.3,
    h: 4.8,
    fontSize: 9.5,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.15
  });

  // Right: OUT-OF-SCOPE & ASSUMPTIONS PANEL
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.1,
    w: 5.9,
    h: 5.65,
    rectRadius: 0.08,
    fill: { color: COLOR_ROSE_LIGHT },
    line: { color: 'FECDD3', width: 1.5 }
  });

  slide3.addText('✕ EXPLICIT OUT-OF-SCOPE BOUNDARIES & ASSUMPTIONS', {
    x: 7.1,
    y: 1.3,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: COLOR_ROSE,
    fontFace: 'Arial'
  });

  slide3.addText([
    { text: '• Core SaaS Code Modifications: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Zero modifications to underlying Oracle base code or database schema (Strict Clean-Core adherence).\n\n', options: { color: COLOR_TEXT_DARK } },
    { text: '• Legacy Data Cleansing: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Client is responsible for legacy data source extraction, deduplication, and cleansing before mock staging.\n\n', options: { color: COLOR_TEXT_DARK } },
    { text: '• Manual Historical Transactions: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Historical transactional data is limited to open balances and in-flight transactions as defined in conversion specs.\n\n', options: { color: COLOR_TEXT_DARK } },
    { text: '• 3rd Party Legacy Custom Systems: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Remediation, hosting, or upgrades of non-Oracle third-party peripheral legacy systems.\n\n', options: { color: COLOR_TEXT_DARK } },
    { text: '• Client SME Availability: ', options: { bold: true, color: COLOR_NAVY_DARK } },
    { text: 'Assumes dedicated client business process owners are available (>50% allocation during CRP and UAT).', options: { color: COLOR_TEXT_DARK } }
  ], {
    x: 7.1,
    y: 1.7,
    w: 5.3,
    h: 4.8,
    fontSize: 9.5,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.15
  });

  // =========================================================================
  // SLIDE 4: TECHNICAL OBJECTS & RICEFW INVENTORY
  // =========================================================================
  const slide4 = pptx.addSlide();
  applyHeaderFooter(slide4, 4, 'Technical Objects, RICEFW Inventory & Mock Scale', 'Proposal Dossier • Step 4');

  // Technical Summary Table
  const tableRows: any[][] = [
    [
      { text: 'RICEFW CATEGORY', options: { bold: true, fill: { color: COLOR_NAVY_DARK }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'SCOPE DESCRIPTION', options: { bold: true, fill: { color: COLOR_NAVY_DARK }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'QTY', options: { bold: true, fill: { color: COLOR_NAVY_DARK }, color: 'FFFFFF', fontSize: 9, align: 'center' } },
      { text: 'COMPLEXITY', options: { bold: true, fill: { color: COLOR_NAVY_DARK }, color: 'FFFFFF', fontSize: 9, align: 'center' } },
      { text: 'DEV EFFORT', options: { bold: true, fill: { color: COLOR_NAVY_DARK }, color: 'FFFFFF', fontSize: 9, align: 'right' } }
    ],
    [
      { text: 'Interfaces (OIC)', options: { bold: true, fontSize: 8.5 } },
      { text: 'OIC Cloud Connectors, Inbound/Outbound REST/SOAP, FBDI pipelines', options: { fontSize: 8 } },
      { text: `${integrationsCount}`, options: { fontSize: 8.5, bold: true, align: 'center' } },
      { text: intComplexityLabel, options: { fontSize: 8, align: 'center' } },
      { text: `${actualIntegrationHours.toLocaleString()} hrs`, options: { fontSize: 8.5, bold: true, align: 'right' } }
    ],
    [
      { text: 'Conversions', options: { bold: true, fontSize: 8.5 } },
      { text: `Data objects scaled across ${mockCycles} mock load iterations (FBDI/HDL/ADFdi)`, options: { fontSize: 8 } },
      { text: `${conversionsCount}`, options: { fontSize: 8.5, bold: true, align: 'center' } },
      { text: `${mockCycles} Mock Cycles`, options: { fontSize: 8, align: 'center' } },
      { text: `${actualConversionHours.toLocaleString()} hrs`, options: { fontSize: 8.5, bold: true, align: 'right' } }
    ],
    [
      { text: 'Reports & Analytics', options: { bold: true, fontSize: 8.5 } },
      { text: 'BI Publisher operational forms, OTBI real-time dashboards & analytics', options: { fontSize: 8 } },
      { text: `${reportsCount}`, options: { fontSize: 8.5, bold: true, align: 'center' } },
      { text: reportsComplexityLabel, options: { fontSize: 8, align: 'center' } },
      { text: `${actualReportsHours.toLocaleString()} hrs`, options: { fontSize: 8.5, bold: true, align: 'right' } }
    ],
    [
      { text: 'Extensions (PaaS)', options: { bold: true, fontSize: 8.5 } },
      { text: 'Visual Builder (VBCS) apps, OCI functions, external portals', options: { fontSize: 8 } },
      { text: `${extensionsCount}`, options: { fontSize: 8.5, bold: true, align: 'center' } },
      { text: 'PaaS / Low-Code', options: { fontSize: 8, align: 'center' } },
      { text: `${actualExtensionsHours.toLocaleString()} hrs`, options: { fontSize: 8.5, bold: true, align: 'right' } }
    ],
    [
      { text: 'Workflows & Rules', options: { bold: true, fontSize: 8.5 } },
      { text: 'BPM approval hierarchies, SLA accounting rules, Fast Formulas', options: { fontSize: 8 } },
      { text: `${workflowsCount}`, options: { fontSize: 8.5, bold: true, align: 'center' } },
      { text: 'Multi-tiered AME', options: { fontSize: 8, align: 'center' } },
      { text: `${actualWorkflowsHours.toLocaleString()} hrs`, options: { fontSize: 8.5, bold: true, align: 'right' } }
    ]
  ];

  slide4.addTable(tableRows, {
    x: 0.6,
    y: 1.1,
    w: 12.1,
    h: 2.8,
    colW: [2.2, 5.2, 1.0, 2.2, 1.5],
    border: { pt: 0.5, color: COLOR_BORDER },
    fill: { color: 'FFFFFF' },
    fontFace: 'Arial'
  });

  // Bottom 3 Callout Cards for Technical Factory
  const techCards = [
    {
      title: '4-Tier Mock Conversion Cycle',
      desc: '• Mock 1: Schema validation & field mapping\n• Mock 2: Volume load & transformation rules\n• Mock 3 (SIT): Integrated end-to-end data run\n• Cutover Mock: Dress rehearsal & timed load',
      color: COLOR_INDIGO,
      bg: COLOR_INDIGO_LIGHT
    },
    {
      title: 'Integration Factory Pattern',
      desc: `• Pre-built canonical OIC patterns\n• Standard automated error-handling queues\n• End-to-end payload logging & replay capability\n• String testing across DEV1 and TEST environments`,
      color: COLOR_NAVY_DARK,
      bg: COLOR_CARD_BG
    },
    {
      title: 'Technical Factory Sizing',
      desc: `• Total Tech Effort: ~${actualTechFactoryHours.toLocaleString()} hrs\n• Dev Squad FTE: ~${Math.max(2, Math.round(peakFTE * 0.45))} Offshore Tech FTEs\n• Lead Tech Architect: Onshore oversight\n• String & Unit Test Completion: Phase Gate 3`,
      color: COLOR_EMERALD,
      bg: COLOR_EMERALD_LIGHT
    }
  ];

  techCards.forEach((tc, idx) => {
    const x = 0.6 + idx * 4.1;
    const y = 4.15;
    const w = 3.9;
    const h = 2.6;

    slide4.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.06,
      fill: { color: tc.bg },
      line: { color: COLOR_BORDER, width: 1 }
    });

    slide4.addText(tc.title, {
      x: x + 0.15,
      y: y + 0.15,
      w: w - 0.3,
      h: 0.25,
      fontSize: 10.5,
      bold: true,
      color: tc.color,
      fontFace: 'Arial'
    });

    slide4.addText(tc.desc, {
      x: x + 0.15,
      y: y + 0.45,
      w: w - 0.3,
      h: 1.95,
      fontSize: 8.5,
      color: COLOR_TEXT_DARK,
      fontFace: 'Arial',
      lineSpacingMultiple: 1.15
    });
  });

  // =========================================================================
  // SLIDE 5: DELIVERY ROADMAP, PHASED GANTT & EFFORT ALLOCATION
  // =========================================================================
  const slide5 = pptx.addSlide();
  applyHeaderFooter(slide5, 5, 'Delivery Roadmap, Phased Gantt & Effort Breakdown', 'Proposal Dossier • Step 5');

  const totalWeeks = Math.max(1, durationWeeks || scenario.projectWeeks || 28);

  // Visual Gantt Phases representation (Derived from project calculation engine)
  const ganttPhases = (data.phaseHours && data.phaseHours.length > 0)
    ? data.phaseHours.map((ph) => {
        const pct = totalHours > 0 ? Math.round((ph.hours / totalHours) * 100) : 0;
        let color = '334155';
        if (ph.id.includes('design')) color = '1E3A8A';
        else if (ph.id.includes('build')) color = '4338CA';
        else if (ph.id.includes('test') || ph.id.includes('sit')) color = '0D9488';
        else if (ph.id.includes('uat')) color = '059669';
        else if (ph.id.includes('cutover') || ph.id.includes('hypercare')) color = 'D97706';
        return {
          id: ph.id,
          name: ph.name,
          startWeek: ph.startWeek,
          endWeek: ph.endWeek,
          duration: Math.max(1, ph.endWeek - ph.startWeek + 1),
          weeks: `W${ph.startWeek} - W${ph.endWeek}`,
          pct: `${pct}%`,
          color,
          fill: color,
          textColor: 'FFFFFF'
        };
      })
    : [
        { id: 'p1', name: 'Wave 0: Mobilize & Enterprise Design', startWeek: 1, endWeek: 8, duration: 8, weeks: 'W1 - W8', pct: '25%', color: '334155', fill: '334155', textColor: 'FFFFFF' },
        { id: 'p2', name: 'Detailed Design & CRP Iterations', startWeek: 9, endWeek: 14, duration: 6, weeks: 'W9 - W14', pct: '15%', color: '1E3A8A', fill: '1E3A8A', textColor: 'FFFFFF' },
        { id: 'p3', name: 'Build, Integrations & Mock Loads', startWeek: 13, endWeek: 20, duration: 8, weeks: 'W13 - W20', pct: '30%', color: '4338CA', fill: '4338CA', textColor: 'FFFFFF' },
        { id: 'p4', name: 'System Integration Testing (SIT)', startWeek: 19, endWeek: 22, duration: 4, weeks: 'W19 - W22', pct: '12%', color: '0D9488', fill: '0D9488', textColor: 'FFFFFF' },
        { id: 'p5', name: 'User Acceptance Testing (UAT)', startWeek: 22, endWeek: 24, duration: 3, weeks: 'W22 - W24', pct: '8%', color: '059669', fill: '059669', textColor: 'FFFFFF' },
        { id: 'p6', name: 'Cutover, Go-Live & Hypercare', startWeek: 24, endWeek: 28, duration: 5, weeks: 'W24 - W28', pct: '10%', color: 'D97706', fill: 'D97706', textColor: 'FFFFFF' }
      ];

  // Timeline geometry
  const timelineX = 4.2;
  const timelineW = 8.5;
  const numPhases = ganttPhases.length;
  const rowHeight = Math.min(0.48, 2.9 / Math.max(1, numPhases));
  const timelineBottomY = 1.32 + numPhases * rowHeight;

  // Timeline Header Ruler background
  slide5.addShape(pptx.ShapeType.rect, {
    x: timelineX,
    y: 1.05,
    w: timelineW,
    h: 0.22,
    fill: { color: 'F1F5F9' },
    line: { color: 'CBD5E1', width: 0.5 }
  });

  // Timeline Ruler Ticks and Vertical Grid Lines
  const tickFractions = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  tickFractions.forEach((frac, fIdx) => {
    const tickX = timelineX + frac * timelineW;
    const weekNum = fIdx === 0 ? 1 : Math.round(totalWeeks * frac);

    // Week Label in ruler
    slide5.addText(`W${weekNum}`, {
      x: Math.max(timelineX, tickX - 0.25),
      y: 1.05,
      w: 0.5,
      h: 0.22,
      fontSize: 7.5,
      bold: true,
      color: '64748B',
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial'
    });

    // Vertical dashed guideline running down the chart
    slide5.addShape(pptx.ShapeType.line, {
      x: tickX,
      y: 1.28,
      w: 0,
      h: timelineBottomY - 1.28,
      line: { color: 'E2E8F0', dashType: 'dash', width: 0.5 }
    });
  });

  // Render each Gantt Phase row
  ganttPhases.forEach((gp, idx) => {
    const y = 1.32 + idx * rowHeight;

    // Phase Label on left
    slide5.addText(gp.name, {
      x: 0.6,
      y,
      w: 3.5,
      h: rowHeight,
      fontSize: 8.5,
      bold: true,
      color: COLOR_NAVY_DARK,
      fontFace: 'Arial',
      valign: 'middle'
    });

    // Background track lane
    slide5.addShape(pptx.ShapeType.rect, {
      x: timelineX,
      y: y + 0.04,
      w: timelineW,
      h: rowHeight - 0.08,
      fill: { color: idx % 2 === 0 ? 'FAFAFA' : 'FFFFFF' },
      line: { color: 'F1F5F9', width: 0.5 }
    });

    // True proportional Gantt Bar positioning
    const startFrac = Math.max(0, Math.min(0.96, (gp.startWeek - 1) / totalWeeks));
    const endFrac = Math.max(startFrac + 0.04, Math.min(1.0, gp.endWeek / totalWeeks));
    const barX = timelineX + (startFrac * timelineW);
    const barW = Math.max(0.7, (endFrac - startFrac) * timelineW);

    slide5.addShape(pptx.ShapeType.roundRect, {
      x: barX,
      y: y + 0.05,
      w: barW,
      h: rowHeight - 0.1,
      rectRadius: 0.04,
      fill: { color: gp.fill }
    });

    slide5.addText(`${gp.weeks} (${gp.pct})`, {
      x: barX,
      y: y + 0.05,
      w: barW,
      h: rowHeight - 0.1,
      fontSize: 7.5,
      bold: true,
      color: gp.textColor,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial'
    });
  });

  // Stage Gate Milestones Row
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 4.4,
    w: 12.1,
    h: 2.35,
    rectRadius: 0.08,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide5.addText('Critical Delivery Stage Gates & Defensible Effort Ledger', {
    x: 0.85,
    y: 4.55,
    w: 8.0,
    h: 0.25,
    fontSize: 11.5,
    bold: true,
    color: COLOR_NAVY_DARK,
    fontFace: 'Arial'
  });

  const gates = [
    { title: 'Gate 1: Enterprise Design Sign-off', desc: 'COA freeze, org architecture, process flows approved.' },
    { title: 'Gate 2: CRP2 & Build Exit', desc: 'Configuration locked, unit testing & mock 2 complete.' },
    { title: 'Gate 3: SIT Exit & UAT Readiness', desc: 'P1/P2 defect resolution, mock 3 data validated.' },
    { title: 'Gate 4: Production Go-Live Tollgate', desc: 'UAT sign-off, dress rehearsal complete, Cutover Go.' }
  ];

  gates.forEach((g, idx) => {
    const x = 0.85 + idx * 2.95;
    const y = 4.9;
    const w = 2.8;
    const h = 1.6;

    slide5.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.05,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 }
    });

    slide5.addText(g.title, {
      x: x + 0.1,
      y: y + 0.1,
      w: w - 0.2,
      h: 0.35,
      fontSize: 9,
      bold: true,
      color: COLOR_INDIGO,
      fontFace: 'Arial'
    });

    slide5.addText(g.desc, {
      x: x + 0.1,
      y: y + 0.45,
      w: w - 0.2,
      h: 1.0,
      fontSize: 8.5,
      color: COLOR_TEXT_DARK,
      fontFace: 'Arial',
      lineSpacingMultiple: 1.15
    });
  });

  // Save / Trigger Download
  const filename = `${scenario.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Executive_Proposal_5Slides.pptx`;
  await pptx.writeFile({ fileName: filename });
}

export const generateExecutiveProposalPptx = generateExecutiveSlideDeck;
