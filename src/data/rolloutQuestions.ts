import { RolloutQuestion } from '../types';

export const ENTERPRISE_ROLLOUT_QUESTIONS: RolloutQuestion[] = [
  {
    id: 'rq_localization',
    category: 'Regional Localization & Statutory',
    title: '1. Regional Localization & Multi-Country Statutory Depth',
    description: 'Evaluates country-specific legal, statutory reporting, tax withholding, electronic invoicing, and regulatory reporting mandates across rollout geographies.',
    options: [
      {
        label: 'C1: Single Domestic Jurisdiction (Standard US GAAP / Local Tax)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Single country deployment with standard corporate chart of accounts and domestic tax schedule.',
        rationale: 'Baseline standard implementation with no statutory gap extensions.'
      },
      {
        label: 'C2: 2-3 Standard Countries (Standard Regional VAT / Localization)',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 160,
        desc: 'Standard European or North American entities requiring standard statutory VAT registers and periodic tax returns.',
        rationale: 'Requires localization testing and country-specific fiscal calendar configurations.'
      },
      {
        label: 'C3: 4-8 Multi-Jurisdiction Countries (Mandated e-Invoicing & SAF-T)',
        score: 3,
        scheduleWeeks: 2.5,
        hoursImpact: 420,
        desc: 'Multiple European/APAC countries with government clearance platforms (SDI Italy, KSeF Poland, SII Spain, SAF-T).',
        rationale: 'Adds 2.5 weeks to Design and SIT cycles for third-party tax engine (Vertex/Avalara) and clearance integration.'
      },
      {
        label: 'C4: 9+ Complex Global Jurisdictions (LATAM Nota Fiscal, India GST, Withholding)',
        score: 4,
        scheduleWeeks: 4.5,
        hoursImpact: 850,
        desc: 'Highly regulated markets with real-time statutory invoice transmission, strict withholding matrices, and localized banking files.',
        rationale: 'Requires dedicated localization sprints, statutory regression testing, and local fiscal certification.'
      }
    ]
  },
  {
    id: 'rq_template_divergence',
    category: 'Global Template & Governance',
    title: '2. Global Design Template Adherence vs Regional Divergence',
    description: 'Measures the enforcement of the 80/20 Global Template Rule vs the degree of regional and divisional business divergence.',
    options: [
      {
        label: 'C1: Strict Core Global Template (>90% Common MBP Standard)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Executive mandate enforces out-of-the-box standard processes across all operating units with zero custom variance.',
        rationale: 'Global core template is reused directly across waves with negligible delta design workshops.'
      },
      {
        label: 'C2: Core Template with Minor Operational Delta (<20% Local Variance)',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 180,
        desc: 'Core processes standard; minor local variations in approval hierarchies, payment terms, and document print templates.',
        rationale: 'Adds 1.0 week to Design for regional delta review and localized template signing.'
      },
      {
        label: 'C3: Moderate Regional Divergence (Separate Regional COA & Valuation)',
        score: 3,
        scheduleWeeks: 2.5,
        hoursImpact: 480,
        desc: 'Regional business units operate distinct supply chain models, separate costing methods (standard vs FIFO), and local ledgers.',
        rationale: 'Requires secondary ledger configuration, allocation rule development, and multi-GAAP reconciliation.'
      },
      {
        label: 'C4: Autonomous Business Units (Bespoke Regional Workflows & PaaS)',
        score: 4,
        scheduleWeeks: 4.0,
        hoursImpact: 920,
        desc: 'Acquired entities or disparate divisions demanding custom PaaS extensions, unique order entry workflows, and local customizations.',
        rationale: 'Requires iterative delta build cycles and custom extension regression testing for each rollout wave.'
      }
    ]
  },
  {
    id: 'rq_coexistence',
    category: 'Legacy Coexistence & Technical',
    title: '3. Legacy ERP Coexistence & Dual-Maintenance Architecture',
    description: 'Determines the synchronization and integration burden between live Oracle Cloud waves and non-live legacy systems.',
    options: [
      {
        label: 'C1: Clean Cutoff (Zero Coexistence / Self-Contained Waves)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Entities are fully independent; no transactional synchronization between new Oracle Cloud live units and legacy ERPs.',
        rationale: 'No temporary bridging interfaces or dual-maintenance reconciliation overhead.'
      },
      {
        label: 'C2: One-Way Master Data Broadcast (Cloud to Legacy)',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 220,
        desc: 'Oracle Cloud acts as golden master for Customers, Suppliers, and Items, broadcasting daily delta feeds to legacy systems.',
        rationale: 'Requires OIC broadcast pipelines and master data synchronization testing.'
      },
      {
        label: 'C3: Bidirectional Transactional Bridging (GL Journals, POs, Stock)',
        score: 3,
        scheduleWeeks: 3.0,
        hoursImpact: 650,
        desc: 'Two-way integration for financial consolidation journals, inter-company purchase orders, and plant inventory movements.',
        rationale: 'Adds 3.0 weeks to Build and SIT for bidirectional staging, reconciliation tables, and error replay mechanisms.'
      },
      {
        label: 'C4: Real-Time Multi-Tier Coexistence (Order Brokering & Global Inventory)',
        score: 4,
        scheduleWeeks: 5.0,
        hoursImpact: 1200,
        desc: 'Real-time global ATP check, cross-system order orchestration, distributed financial settlement, and legacy sub-ledger feed.',
        rationale: 'Complex temporary middleware architecture requiring extensive load testing and dual-run cutover rehearsals.'
      }
    ]
  },
  {
    id: 'rq_intercompany',
    category: 'Global Template & Governance',
    title: '4. Cross-Wave Intercompany & Supply Chain Trading Friction',
    description: 'Evaluates the intercompany transactions, drop-shipments, and transfer pricing flows occurring between live and un-rolled wave entities.',
    options: [
      {
        label: 'C1: Isolated Operating Units (No Cross-Entity Trade)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Entities operate in separate markets with independent balance sheets and zero intercompany inventory movements.',
        rationale: 'No intercompany clearing or cross-wave invoice matching.'
      },
      {
        label: 'C2: Standard Intercompany Trade (Periodic Month-End Billing)',
        score: 2,
        scheduleWeeks: 0.5,
        hoursImpact: 120,
        desc: 'Periodic monthly intercompany invoicing and manual reconciliation between live and non-live entities.',
        rationale: 'Minor testing of standard Oracle Financials intercompany journals and AP/AR netting.'
      },
      {
        label: 'C3: High-Frequency Intercompany Trade (Drop-Ship & Internal POs)',
        score: 3,
        scheduleWeeks: 2.0,
        hoursImpact: 400,
        desc: 'Daily internal sales orders, drop-shipment fulfillment, and automated transfer pricing markups between live and un-rolled plants.',
        rationale: 'Requires end-to-end supply chain intercompany orchestration testing across hybrid Cloud/legacy borders.'
      },
      {
        label: 'C4: Global Multi-Currency Supply Network (Automated Clearing & Consignment)',
        score: 4,
        scheduleWeeks: 3.5,
        hoursImpact: 750,
        desc: 'Continuous multi-tier intercompany billing, cross-border VAT adjustments, tolling manufacturing, and automated profit in inventory eliminations.',
        rationale: 'Adds 3.5 weeks to SIT/UAT for multi-tier trading partner reconciliation and tax clearing.'
      }
    ]
  },
  {
    id: 'rq_data_cutover_factory',
    category: 'Wave Execution & Cutover',
    title: '5. Multi-Wave Data Migration & Cutover Factory Model',
    description: 'Assesses the repeatable data extraction, transformation, cleansing, and multi-wave mock cutover factory capability.',
    options: [
      {
        label: 'C1: Centralized Single-Source Factory (Standard FBDI / HDL Reusable Templates)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Identical source ERP systems across all waves; 100% reusable data mapping scripts and automated validation.',
        rationale: 'Subsequent wave data loads execute smoothly with minimal ETL reconfiguration.'
      },
      {
        label: 'C2: Reusable Factory with Minor Regional Custom Fields',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 180,
        desc: 'Core FBDI scripts reused; 10-15% regional field mapping variance (tax IDs, local bank formats).',
        rationale: 'Requires 1.0 week per wave for localized data validation and delta cleansing sign-off.'
      },
      {
        label: 'C3: Disparate Regional Legacy Sources (Distinct Regional Data Models)',
        score: 3,
        scheduleWeeks: 2.5,
        hoursImpact: 520,
        desc: 'Each rollout wave migrates from different legacy platforms (proprietary on-prem in NA, older ERP in EMEA, local bespoke in APAC).',
        rationale: 'Requires separate data extraction tools, unique mapping workshops, and dedicated mock conversions per wave.'
      },
      {
        label: 'C4: High-Volume Continuous Delta Catch-Up (<24h Weekend Cutover SLA)',
        score: 4,
        scheduleWeeks: 4.0,
        hoursImpact: 890,
        desc: 'Multi-million transaction volumes, complex open order cutovers, continuous parallel payroll historical catch-up, and strict <24h downtime limits.',
        rationale: 'Requires 3+ progressive mock rehearsals and automated multi-threaded data load tooling.'
      }
    ]
  },
  {
    id: 'rq_change_readiness',
    category: 'Regional Localization & Statutory',
    title: '6. Regional Workforce Change Adoption, Language Packs & Works Councils',
    description: 'Measures organizational readiness, regional training localization, multilingual needs, and statutory European works council constraints.',
    options: [
      {
        label: 'C1: Unified Corporate Culture & Single Working Language',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Single primary business language (English), strong central change sponsorship, and mature digital adoption.',
        rationale: 'Standard training collateral and role-based training delivery.'
      },
      {
        label: 'C2: 2-3 Regional Language Packs & Regional Super-User Train-the-Trainer',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 150,
        desc: 'Localized training manuals in Spanish, German, French with dedicated regional champion networks.',
        rationale: 'Adds 1.0 week to UAT/Training for translated quick reference guides and user verification.'
      },
      {
        label: 'C3: 4-6 Regional Languages with Formal European Works Council Gates',
        score: 3,
        scheduleWeeks: 2.5,
        hoursImpact: 380,
        desc: 'Mandatory union / works council consultations (Germany Betriebsrat, France CSE), employee data privacy audits, and regional sign-offs.',
        rationale: 'Adds 2.5 weeks lead time for formal labor representative reviews and localized role security approvals.'
      },
      {
        label: 'C4: 8+ Multilingual Global Sites with High Strike/Veto Risk & Hostile Resistance',
        score: 4,
        scheduleWeeks: 4.0,
        hoursImpact: 720,
        desc: 'Extensive multi-country labor regulations, mandatory employee retraining certifications, and high change friction.',
        rationale: 'Requires dedicated change managers per region and extended end-user role validation workshops.'
      }
    ]
  },
  {
    id: 'rq_concurrency',
    category: 'Wave Execution & Cutover',
    title: '7. Wave Concurrency, Fast-Tracking & Overlap Strategy',
    description: 'Defines how aggressively rollout waves overlap in time (sequential phase-gates vs parallel concurrent execution).',
    options: [
      {
        label: 'C1: Pure Sequential Phase-Gate (Zero Wave Overlap / Maximum Safety)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Wave N+1 kicks off only after Wave N has achieved full Go-Live sign-off and 4 weeks of Hypercare stabilization.',
        rationale: 'Lowest operational risk; utilizes benchmark linear multi-wave timeline.'
      },
      {
        label: 'C2: Moderate Overlap (Wave N+1 Discovery starts during Wave N UAT)',
        score: 2,
        scheduleWeeks: -2.0,
        hoursImpact: 240,
        desc: 'Wave N+1 initiates Discovery & Requirements while Wave N is executing Business Test 2 / UAT.',
        rationale: 'Compresses program timeline by 2 weeks; requires partial core team dual-tasking.'
      },
      {
        label: 'C3: Aggressive Overlap (Wave N+1 Build & SIT runs during Wave N Cutover)',
        score: 3,
        scheduleWeeks: -4.0,
        hoursImpact: 480,
        desc: 'Wave N+1 Build phase runs concurrently with Wave N Mock Cutovers and Go-Live execution.',
        rationale: 'Compresses program by 4 weeks; requires separate dedicated stream leads to prevent burnout.'
      },
      {
        label: 'C4: Hyper-Concurrent Pipelining (3 Waves executing simultaneously in parallel)',
        score: 4,
        scheduleWeeks: -6.5,
        hoursImpact: 800,
        desc: 'Staggered parallel delivery factory with simultaneous CRP, SIT, and Cutover activities across 3 regional waves.',
        rationale: 'Maximum schedule compression (-6.5 wks); demands high-density PMO oversight and split-team governance.'
      }
    ]
  },
  {
    id: 'rq_shared_services',
    category: 'Global Template & Governance',
    title: '8. Global Process Owner (GPO) Governance & Decision Velocity',
    description: 'Evaluates whether business decisions and template sign-offs are governed centrally by GPOs or negotiated with local entities.',
    options: [
      {
        label: 'C1: Centralized Global Process Owners (GPO) with Absolute Authority',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Empowered GPOs for Record-to-Report, Order-to-Cash, Procure-to-Pay have sole authority to approve or reject process deviations.',
        rationale: 'Fast decision velocity (<48h turnaround); zero regional design stalls.'
      },
      {
        label: 'C2: Central GPO Council with Formal Regional Advisory Board',
        score: 2,
        scheduleWeeks: 0.5,
        hoursImpact: 110,
        desc: 'Central GPOs lead, but regional representatives have formal review period (3-5 days) before blueprint locking.',
        rationale: 'Standard consensus model with controlled escalation pathways.'
      },
      {
        label: 'C3: Decentralized Regional Operating Committees (Consensus Model)',
        score: 3,
        scheduleWeeks: 2.0,
        hoursImpact: 360,
        desc: 'Each region maintains local steering committees requiring extensive alignment workshops to approve global standards.',
        rationale: 'Adds 2.0 weeks to Design and CRP gates for multi-region committee consensus.'
      },
      {
        label: 'C4: Highly Fragmented Entities with Local Veto Authority',
        score: 4,
        scheduleWeeks: 3.5,
        hoursImpact: 700,
        desc: 'Local managing directors have authority to reject global design decisions, causing frequent design reopening.',
        rationale: 'Requires intensive executive mediation and extended stage-gate sign-off cycles.'
      }
    ]
  },
  {
    id: 'rq_pilot_fidelity',
    category: 'Global Template & Governance',
    title: '9. Pilot Site Scope Fidelity & Core Template Scalability',
    description: 'Measures how accurately the initial Pilot / Wave 1 deployment represents the operational complexity of subsequent waves.',
    options: [
      {
        label: 'C1: Comprehensive High-Fidelity Pilot (>85% Enterprise Process Coverage)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Wave 1 site includes all core manufacturing, distribution, financials, and procurement flows needed across the company.',
        rationale: 'Global core template is battle-tested in Wave 1 and rolls out seamlessly to remaining sites.'
      },
      {
        label: 'C2: Standard Representative Pilot (~70% Enterprise Process Coverage)',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 190,
        desc: 'Wave 1 covers primary business models; remaining waves introduce 15-20% new variants (e.g. outsourced manufacturing).',
        rationale: 'Adds 1.0 week to Wave 2 Design to incorporate secondary supply chain archetypes.'
      },
      {
        label: 'C3: Simplified Sub-Scale Pilot (Major Gaps in Wave 1 Scope)',
        score: 3,
        scheduleWeeks: 2.5,
        hoursImpact: 480,
        desc: 'Wave 1 is conducted at a small commercial sales entity; complex manufacturing plants arrive in Wave 2.',
        rationale: 'Wave 2 requires substantial re-engineering of the core global template (+2.5 weeks).'
      },
      {
        label: 'C4: Bespoke Non-Representative Outlier (Substantial Wave 2 Refactoring)',
        score: 4,
        scheduleWeeks: 4.5,
        hoursImpact: 850,
        desc: 'Pilot site is an atypical business unit with unique legacy systems that do not translate to core global plants.',
        rationale: 'Requires massive template refactoring, duplicate CRPs, and extensive regression testing in Wave 2.'
      }
    ]
  },
  {
    id: 'rq_environment_patch',
    category: 'Legacy Coexistence & Technical',
    title: '10. Multi-Pod Environment Strategy & Oracle Quarterly Update Alignment',
    description: 'Assesses cloud pod allocation, P2T clone schedules, and quarterly patch collision risks across overlapping rollout waves.',
    options: [
      {
        label: 'C1: Synchronized Single Pod Cohort (Zero In-Flight Patch Conflicts)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Single production tenancy; all wave project schedules aligned around standard quarterly maintenance windows.',
        rationale: 'Predictable maintenance schedule with zero environment blackout collisions.'
      },
      {
        label: 'C2: Standard 5-Pod Landscape with Managed 2-Week Patch Buffers',
        score: 2,
        scheduleWeeks: 0.5,
        hoursImpact: 120,
        desc: 'Standard non-prod (DEV1, DEV2, TEST, STAGE) and PROD landscape with planned P2T refreshes between waves.',
        rationale: 'Minor schedule coordination buffer for quarterly update regression testing.'
      },
      {
        label: 'C3: Overlapping Wave Collisions (Wave 1 Hypercare vs Wave 2 SIT in Same Pod)',
        score: 3,
        scheduleWeeks: 2.0,
        hoursImpact: 320,
        desc: 'Wave 1 production cutover and Wave 2 integration testing contend for the same test environments during patch updates.',
        rationale: 'Requires dedicated pod cloning cycles, golden configuration lockouts, and environment re-testing (+2.0 wks).'
      },
      {
        label: 'C4: Multi-Tenancy Segregated Pods with Conflicting Update Cohorts',
        score: 4,
        scheduleWeeks: 3.5,
        hoursImpact: 650,
        desc: 'Multiple Oracle Cloud tenancies across geographic regions on different quarterly update cadences (Cohort A vs B).',
        rationale: 'Requires dual-version testing, middleware version compatibility bridging, and complex pod governance.'
      }
    ]
  },
  {
    id: 'rq_stabilization_hypercare',
    category: 'Wave Execution & Cutover',
    title: '11. Post-Go-Live Hypercare Depth & BAU COE Transition Model',
    description: 'Determines the duration and intensity of on-site floor support, month-end financial closes, and support ticket triage per wave.',
    options: [
      {
        label: 'C1: Standard 4-Week Hypercare (Rapid Transition to Client Oracle COE)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'Client has mature in-house Oracle Center of Excellence ready to assume ticket triage from Day 15.',
        rationale: 'Standard 4-week stabilization with orderly handover to BAU support.'
      },
      {
        label: 'C2: 6-Week Extended Hypercare (Covers 1st Month-End Close & SI Tier-3)',
        score: 2,
        scheduleWeeks: 1.0,
        hoursImpact: 180,
        desc: 'SI provides dedicated on-site support through the first full monthly financial close and inventory reconciliation.',
        rationale: 'Adds 1.0 week to official wave closure for first month-end support and stabilization.'
      },
      {
        label: 'C3: 8-Week Intensive Stabilization (Covers Quarter-End & Plant Floor Walking)',
        score: 3,
        scheduleWeeks: 2.0,
        hoursImpact: 380,
        desc: 'SI provides full plant-floor shift support (24/7 during first 2 weeks) and guides the first quarterly financial close.',
        rationale: 'Adds 2.0 weeks to Wave hypercare duration; ensures plant floor throughput stabilization.'
      },
      {
        label: 'C4: 12-Week White-Glove Warranty & Global On-Site SWAT Teams',
        score: 4,
        scheduleWeeks: 4.0,
        hoursImpact: 750,
        desc: 'Extended warranty across multiple global manufacturing sites with SI team embedded until steady-state operational KPIs are met.',
        rationale: 'Adds 4.0 weeks to wave lifecycle; provides maximum executive risk mitigation for critical operations.'
      }
    ]
  },
  {
    id: 'rq_network_topology',
    category: 'Legacy Coexistence & Technical',
    title: '12. Global Network Latency, Plant-Floor Bandwidth & Data Sovereignty',
    description: 'Evaluates infrastructure latency, remote warehouse connectivity, barcode RF scanner response times, and in-country data residency.',
    options: [
      {
        label: 'C1: Enterprise Fiber & Low Latency Cloud Region (<40ms RTD)',
        score: 1,
        scheduleWeeks: 0,
        hoursImpact: 0,
        desc: 'All regional sites connected via high-speed low-latency corporate WAN directly to Oracle Cloud Data Center.',
        rationale: 'Zero latency concerns for mobile WMS, shop floor dispatch, or web applications.'
      },
      {
        label: 'C2: Standard Global SD-WAN with Minor Remote Plant Latency (40-90ms)',
        score: 2,
        scheduleWeeks: 0.5,
        hoursImpact: 90,
        desc: 'Standard global network; minor latency on mobile RF devices in remote warehouses requiring UI tuning.',
        rationale: 'Minor tuning of Redwood page layouts and mobile barcode scanning payload sizes.'
      },
      {
        label: 'C3: High Latency Remote Sites (>150ms) & Intermittent Network Drops',
        score: 3,
        scheduleWeeks: 1.5,
        hoursImpact: 280,
        desc: 'Manufacturing facilities in developing regions with intermittent WAN and mobile barcode latency bottlenecks.',
        rationale: 'Requires dedicated performance testing, Edge integration caching, and offline-capable mobile middleware.'
      },
      {
        label: 'C4: Strict National Data Residency Laws (China PIPL, Russia, UAE Cloud)',
        score: 4,
        scheduleWeeks: 3.0,
        hoursImpact: 580,
        desc: 'Statutory laws mandate that citizen personal data and accounting ledgers must reside on physical servers within national borders.',
        rationale: 'Requires multi-region segregated tenancy architecture and secure cross-border encrypted API tunnels.'
      }
    ]
  }
];

export const ROLLOUT_QUESTION_CATEGORIES = [
  'Global Template & Governance',
  'Legacy Coexistence & Technical',
  'Regional Localization & Statutory',
  'Wave Execution & Cutover'
] as const;

