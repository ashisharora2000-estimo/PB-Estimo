import { ResourceGradeItem } from '../types';

export interface EnterpriseGradeDefinition {
  gradeCode: string;
  gradeName: string;
  category: 'Strategic' | 'Lead' | 'Execution' | 'Specialist';
  defaultSharePct: number;
  inHouseRate: { bill: number; cost: number };
  subcontractorRate: { bill: number; cost: number };
  gdcOffshoreRate: { bill: number; cost: number };
  description: string;
}

export const ENTERPRISE_GRADES_CATALOG: EnterpriseGradeDefinition[] = [
  {
    gradeCode: 'Grade A',
    gradeName: 'Associate Consultant (Data Conversion & Testing Analyst)',
    category: 'Specialist',
    defaultSharePct: 20,
    inHouseRate: { bill: 105, cost: 65 },
    subcontractorRate: { bill: 95, cost: 70 },
    gdcOffshoreRate: { bill: 28, cost: 12 },
    description: 'Entry-level: FBDI/HDL conversion mock loading, defect logging, and automated test regression execution.'
  },
  {
    gradeCode: 'Grade B',
    gradeName: 'Consultant (Functional Config & Integration Specialist)',
    category: 'Execution',
    defaultSharePct: 35,
    inHouseRate: { bill: 140, cost: 85 },
    subcontractorRate: { bill: 130, cost: 95 },
    gdcOffshoreRate: { bill: 40, cost: 18 },
    description: 'Core delivery: Module configuration, BIP/OTBI report generation, and interface data mapping.'
  },
  {
    gradeCode: 'Grade C',
    gradeName: 'Senior Consultant (Functional & Technical Stream Lead)',
    category: 'Execution',
    defaultSharePct: 30,
    inHouseRate: { bill: 175, cost: 110 },
    subcontractorRate: { bill: 165, cost: 120 },
    gdcOffshoreRate: { bill: 55, cost: 26 },
    description: 'Lead delivery: Detailed business process configuration, OIC interface design, and SIT test orchestration.'
  },
  {
    gradeCode: 'Grade D',
    gradeName: 'Principal Solution Architect / Lead SME',
    category: 'Lead',
    defaultSharePct: 10,
    inHouseRate: { bill: 215, cost: 135 },
    subcontractorRate: { bill: 200, cost: 145 },
    gdcOffshoreRate: { bill: 85, cost: 42 },
    description: 'Solution leadership: Cross-pillar solution architecture, COA design, CRP leadership, and critical path governance.'
  },
  {
    gradeCode: 'Grade E',
    gradeName: 'Delivery Director / Strategic Principal (Senior-Most)',
    category: 'Strategic',
    defaultSharePct: 5,
    inHouseRate: { bill: 260, cost: 160 },
    subcontractorRate: { bill: 240, cost: 175 },
    gdcOffshoreRate: { bill: 110, cost: 55 },
    description: 'Senior-most executive: Executive sponsorship, SteerCo governance, C-level advisory, and commercial DoA sign-off.'
  }
];

export function calculateGradeDistribution(
  totalTargetHours: number,
  projectWeeks: number,
  gradeOverrides?: Record<string, number>,
  sourcingOverrides?: { inHousePct: number; subcontractorPct: number; gdcOffshorePct: number }
): {
  grades: ResourceGradeItem[];
  blendedBillRate: number;
  blendedCostRate: number;
  totalCost: number;
  totalRevenue: number;
  grossMarginPct: number;
  sourcing: { inHousePct: number; subcontractorPct: number; gdcOffshorePct: number };
} {
  const sourcing = sourcingOverrides || {
    inHousePct: 35,
    subcontractorPct: 10,
    gdcOffshorePct: 55
  };

  const inHouseFrac = (sourcing.inHousePct || 35) / 100;
  const subFrac = (sourcing.subcontractorPct || 10) / 100;
  const gdcFrac = (sourcing.gdcOffshorePct || 55) / 100;

  let totalCost = 0;
  let totalRevenue = 0;

  const grades: ResourceGradeItem[] = ENTERPRISE_GRADES_CATALOG.map((def, idx) => {
    const sharePct = gradeOverrides?.[def.gradeCode] !== undefined
      ? gradeOverrides[def.gradeCode]
      : def.defaultSharePct;

    const hours = Math.round(totalTargetHours * (sharePct / 100));
    const fte = parseFloat((hours / (projectWeeks * 40)).toFixed(2));

    const blendedBill = (
      def.inHouseRate.bill * inHouseFrac +
      def.subcontractorRate.bill * subFrac +
      def.gdcOffshoreRate.bill * gdcFrac
    );

    const blendedCost = (
      def.inHouseRate.cost * inHouseFrac +
      def.subcontractorRate.cost * subFrac +
      def.gdcOffshoreRate.cost * gdcFrac
    );

    totalRevenue += hours * blendedBill;
    totalCost += hours * blendedCost;

    return {
      id: `grade_${idx}`,
      gradeCode: def.gradeCode,
      gradeName: def.gradeName,
      category: def.category,
      defaultMixSharePct: sharePct,
      hours,
      fte,
      blendedBillRate: Math.round(blendedBill),
      blendedCostRate: Math.round(blendedCost),
      sourcing: {
        inHousePct: sourcing.inHousePct,
        subcontractorPct: sourcing.subcontractorPct,
        gdcOffshorePct: sourcing.gdcOffshorePct
      }
    };
  });

  const overallBlendedBillRate = totalTargetHours > 0 ? Math.round(totalRevenue / totalTargetHours) : 120;
  const overallBlendedCostRate = totalTargetHours > 0 ? Math.round(totalCost / totalTargetHours) : 65;
  const grossProfit = totalRevenue - totalCost;
  const grossMarginPct = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 45;

  return {
    grades,
    blendedBillRate: overallBlendedBillRate,
    blendedCostRate: overallBlendedCostRate,
    totalCost,
    totalRevenue,
    grossMarginPct,
    sourcing
  };
}
