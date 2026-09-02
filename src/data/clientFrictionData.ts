import { ProjectScenario } from '../types';

export interface ClientFrictionOption {
  label: string;
  value: number;
  desc: string;
}

export interface ClientFrictionFactorDef {
  id: keyof ProjectScenario['clientModifiers'];
  num: number;
  title: string;
  category: string;
  description: string;
  neutralValue: number;
  options: ClientFrictionOption[];
}

export const CLIENT_FRICTION_FACTORS_DEF: ClientFrictionFactorDef[] = [
  {
    id: 'decisionVelocity',
    num: 1,
    title: '1. Program Decision Velocity & Steering Committee Cadence',
    category: 'Governance & Sponsorship',
    description: 'Measures SLA for key architectural sign-offs, change control boards, and steering committee meeting frequency.',
    neutralValue: 1.0,
    options: [
      { label: 'Rapid (<48h Turnaround)', value: 0.90, desc: 'Empowered single executive sponsor; instant sign-offs with minimal friction.' },
      { label: 'Standard (3-5 Days)', value: 1.0, desc: 'Regular weekly steering committee review and consensus-based decisions.' },
      { label: 'Slow (1-2 Weeks)', value: 1.15, desc: 'Multi-layer approval boards causing design review stalls and open item backlog.' },
      { label: 'Paralysis (>2 Weeks)', value: 1.30, desc: 'Frequent reopening of previously approved design blueprints.' }
    ]
  },
  {
    id: 'dataDebt',
    num: 2,
    title: '2. Data Debt & Legacy Extraction Readiness',
    category: 'Data Migration & Cleansing',
    description: 'Evaluates data quality across legacy sources, deduplication needs, and legacy cleansing maturity.',
    neutralValue: 1.0,
    options: [
      { label: 'Clean Single Source', value: 0.90, desc: 'Pre-cleansed single ERP source; automated deduplication.' },
      { label: 'Moderate Cleansing', value: 1.0, desc: '2-3 legacy systems requiring standard customer/supplier deduplication.' },
      { label: 'High Data Debt', value: 1.15, desc: 'M&A silos, disparate legacy charts of accounts, corrupt tables.' },
      { label: 'Severe Data Crisis', value: 1.35, desc: 'Unstructured spreadsheets, missing primary keys, manual records.' }
    ]
  },
  {
    id: 'cloudMindset',
    num: 3,
    title: '3. Cloud Mindset & Modern Best Practice (MBP) Adoption',
    category: 'Business Fit-to-Standard',
    description: 'Alignment with standard Oracle out-of-the-box business flows vs demanding custom on-prem replica screens.',
    neutralValue: 1.0,
    options: [
      { label: 'Pure Fit-to-Standard (>95%)', value: 0.85, desc: 'Zero customization mandate; strict adoption of Oracle MBP.' },
      { label: 'Standard Cloud Pragmatist', value: 1.0, desc: 'Adopts standard cloud with minor localized configurations.' },
      { label: 'On-Premises Habituation', value: 1.20, desc: 'Demands replicating legacy custom EBS/SAP screens and reports.' },
      { label: 'Extreme Custom Mandate', value: 1.40, desc: 'Resistance to standard; demands heavy PaaS and bespoke extensions.' }
    ]
  },
  {
    id: 'integrationVolatility',
    num: 4,
    title: '4. Integration Volatility & Third-Party API Readiness',
    category: 'Technical Architecture & OIC',
    description: 'Stability, documentation, and sandbox availability of upstream/downstream third-party endpoint systems.',
    neutralValue: 1.0,
    options: [
      { label: 'Documented Modern REST APIs', value: 0.90, desc: 'Swagger/OpenAPI specs available, stable sandbox environments.' },
      { label: 'Standard Enterprise SOAP/REST', value: 1.0, desc: 'Standard Salesforce, Coupa, ADP endpoints with known schemas.' },
      { label: 'Legacy Mainframe / Flat Files', value: 1.20, desc: 'Undocumented proprietary flat files, batch SFTP drops, missing test beds.' },
      { label: 'Volatile In-Flight Re-Architecture', value: 1.35, desc: 'Third-party systems undergoing concurrent redesign during ERP build.' }
    ]
  },
  {
    id: 'smeAvailability',
    num: 5,
    title: '5. Client Business SME Dedicated Availability & Backfill',
    category: 'Resource Bandwidth',
    description: 'Availability of key business process owners for process design workshops, validation, and test sign-offs.',
    neutralValue: 1.0,
    options: [
      { label: '100% Dedicated & Backfilled', value: 0.85, desc: 'Full-time core business champions freed from day jobs.' },
      { label: '50% Allocated with Support', value: 1.0, desc: 'Dedicated 20 hrs/week per functional stream during workshops.' },
      { label: 'Part-Time Firefighters (<20%)', value: 1.25, desc: 'SMEs overwhelmed with operational firefighting; workshop no-shows.' },
      { label: 'Severely Constrained (<10%)', value: 1.45, desc: 'Single point of failure on critical SME; severe testing delays.' }
    ]
  },
  {
    id: 'regulatoryCompliance',
    num: 6,
    title: '6. Statutory Compliance & Government e-Invoicing Mandates',
    category: 'Legal & Tax Rigor',
    description: 'Complexity of statutory tax reporting, government real-time invoice clearance (e.g. SDI, KSeF, SII, SAF-T), and audit rules.',
    neutralValue: 1.0,
    options: [
      { label: 'Single Domestic Jurisdiction', value: 0.95, desc: 'US GAAP / standard sales tax with no statutory clearing.' },
      { label: 'Multi-State / Standard EU VAT', value: 1.0, desc: 'Standard tax reporting and monthly VAT returns.' },
      { label: 'Government Mandated Clearance', value: 1.20, desc: 'Real-time e-invoicing (SDI Italy, KSeF Poland, SII Spain, SAF-T).' },
      { label: 'Extreme Multi-Country LATAM / BR', value: 1.40, desc: 'Nota Fiscal (Brazil), complex withholding regimes, municipal tax.' }
    ]
  },
  {
    id: 'changeResistance',
    num: 7,
    title: '7. Organizational Change Resistance & Union Dynamics',
    category: 'Change Management (OCM)',
    description: 'Cultural readiness, user sentiment, and union / works council negotiation governance impact.',
    neutralValue: 1.0,
    options: [
      { label: 'High Alignment & Enthusiasm', value: 0.90, desc: 'Proactive leadership, eager user base, early champions network.' },
      { label: 'Neutral / Standard OCM', value: 1.0, desc: 'Standard training and role-readiness communications.' },
      { label: 'High Skepticism & Friction', value: 1.15, desc: 'Entrenched legacy habits, vocal union pushback, user anxiety.' },
      { label: 'Hostile Strike Risk / Walkout', value: 1.35, desc: 'Formal works council veto threat, mandatory re-negotiation gates.' }
    ]
  }
];

export const DEFAULT_CLIENT_MODIFIERS: ProjectScenario['clientModifiers'] = {
  decisionVelocity: 1.0,
  dataDebt: 1.0,
  cloudMindset: 1.0,
  integrationVolatility: 1.0,
  smeAvailability: 1.0,
  regulatoryCompliance: 1.0,
  changeResistance: 1.0
};

export function calculateNetClientModifier(modifiers?: Partial<ProjectScenario['clientModifiers']>): number {
  if (!modifiers) return 1.0;
  const dv = modifiers.decisionVelocity ?? 1.0;
  const dd = modifiers.dataDebt ?? 1.0;
  const cm = modifiers.cloudMindset ?? 1.0;
  const iv = modifiers.integrationVolatility ?? 1.0;
  const sa = modifiers.smeAvailability ?? 1.0;
  const rc = modifiers.regulatoryCompliance ?? 1.0;
  const cr = modifiers.changeResistance ?? 1.0;
  
  const product = dv * dd * cm * iv * sa * rc * cr;
  return Number(product.toFixed(3));
}
