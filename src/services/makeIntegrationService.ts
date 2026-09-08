import { ProjectScenario } from '../types';

const STORAGE_KEY_MAKE_WEBHOOK = 'oracle_impl_make_webhook_url';
const STORAGE_KEY_MAKE_AUTO_SYNC = 'oracle_impl_make_auto_sync';

export function getMakeWebhookUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_MAKE_WEBHOOK) || '';
}

export function setMakeWebhookUrl(url: string): void {
  if (typeof window === 'undefined') return;
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_MAKE_WEBHOOK);
  } else {
    localStorage.setItem(STORAGE_KEY_MAKE_WEBHOOK, url.trim());
  }
}

export function isMakeAutoSyncEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_MAKE_AUTO_SYNC) === 'true';
}

export function setMakeAutoSyncEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MAKE_AUTO_SYNC, enabled ? 'true' : 'false');
}

/**
 * Sends a scenario payload to Make (Integromat) Webhook to store in Make Data Store
 */
export async function sendScenarioToMakeDatabase(
  scenario: ProjectScenario,
  overrideWebhookUrl?: string
): Promise<{ success: boolean; message: string; statusCode?: number }> {
  const webhookUrl = overrideWebhookUrl || getMakeWebhookUrl();
  if (!webhookUrl) {
    return { success: false, message: 'No Make Webhook URL configured.' };
  }

  try {
    // Build a fully flattened representation so Make Data Store can bind directly to every individual column
    const scaleDrivers = scenario.scaleDrivers || {} as any;
    const clientModifiers = scenario.clientModifiers || {} as any;
    const deliveryMix = scenario.deliveryMix || { onshore: 20, nearshore: 0, offshore: 80 };

    const selectedModuleCodes = Array.isArray(scenario.selectedModules)
      ? scenario.selectedModules.map((m: any) => (typeof m === 'string' ? m : m.code || m.id || m.name)).filter(Boolean)
      : [];
    const selectedModuleNames = Array.isArray(scenario.selectedModules)
      ? scenario.selectedModules.map((m: any) => (typeof m === 'string' ? m : m.name || m.code || m.id)).filter(Boolean).join(', ')
      : '';

    const payload = {
      // 1. Core Top-Level Scenario Attributes
      id: scenario.id,
      name: scenario.name,
      clientName: scenario.clientName || '',
      industry: scenario.industry || 'General Services',
      description: scenario.description || '',
      projectWeeks: Number(scenario.projectWeeks) || 32,
      targetStartDate: scenario.targetStartDate || '',
      clientTargetGoLiveDate: scenario.clientTargetGoLiveDate || '',
      schedulingMode: scenario.schedulingMode || 'forward',
      rolloutApproach: scenario.rolloutApproach || 'phased_geo',
      rolloutWaves: Number(scenario.rolloutWaves) || 1,
      rolloutOverlapWeeks: Number(scenario.rolloutOverlapWeeks) || 0,
      phaseDeliveryModel: scenario.phaseDeliveryModel || 'hypercare_overlap',
      podCohort: scenario.podCohort || 'B',
      confidence: Number(scenario.confidence ?? 0.85),
      contingencyPctOverride: Number(scenario.contingencyPctOverride ?? 0.15),
      globalComplexityMultiplier: Number(scenario.globalComplexityMultiplier ?? 1),
      isBlackoutLocked: Boolean(scenario.isBlackoutLocked),
      isScheduleFrozen: Boolean(scenario.isScheduleFrozen),
      waveStartDuringHypercare: Boolean(scenario.waveStartDuringHypercare),

      // 2. Delivery Mix Breakdown
      deliveryMix_onshore: Number(deliveryMix.onshore ?? 20),
      deliveryMix_nearshore: Number(deliveryMix.nearshore ?? 0),
      deliveryMix_offshore: Number(deliveryMix.offshore ?? 80),

      // 3. Module Scope
      moduleCount: selectedModuleCodes.length,
      selectedModuleNames: selectedModuleNames,
      selectedModuleCodes: selectedModuleCodes.join(', '),

      // 4. Financials Scale Drivers
      scale_fin_ent: Number(scaleDrivers.fin_ent ?? 1),
      scale_fin_led: Number(scaleDrivers.fin_led ?? 1),
      scale_fin_cur: Number(scaleDrivers.fin_cur ?? 1),
      scale_fin_tax: Number(scaleDrivers.fin_tax ?? 1),
      scale_fin_coa_segments: Number(scaleDrivers.fin_coa_segments ?? 6),

      // 5. Supply Chain (SCM) Scale Drivers
      scale_scm_plants: Number(scaleDrivers.scm_plants ?? 0),
      scale_scm_wh: Number(scaleDrivers.scm_wh ?? 1),
      scale_scm_inv: Number(scaleDrivers.scm_inv ?? 1),

      // 6. HCM Scale Drivers
      scale_hcm_hc: Number(scaleDrivers.hcm_hc ?? 1000),
      scale_hcm_pay_countries: Number(scaleDrivers.hcm_pay_countries ?? 1),
      scale_hcm_union_groups: Number(scaleDrivers.hcm_union_groups ?? 0),

      // 7. Technical Scale Drivers
      scale_tech_oic: Number(scaleDrivers.tech_oic ?? 5),
      scale_tech_paas: Number(scaleDrivers.tech_paas ?? 0),
      scale_tech_data_objects: Number(scaleDrivers.tech_data_objects ?? 10),
      scale_tech_conversion_cycles: Number(scaleDrivers.tech_conversion_cycles ?? 3),
      scale_tech_historical_years: Number(scaleDrivers.tech_historical_years ?? 0),
      scale_tech_reports_bip: Number(scaleDrivers.tech_reports_bip ?? 15),
      scale_tech_reports_otbi: Number(scaleDrivers.tech_reports_otbi ?? 25),
      scale_tech_fast_formulas: Number(scaleDrivers.tech_fast_formulas ?? 0),
      scale_tech_workflows: Number(scaleDrivers.tech_workflows ?? 5),
      scale_tech_bpm_approval_groups: Number(scaleDrivers.tech_bpm_approval_groups ?? 3),
      scale_tech_security_roles: Number(scaleDrivers.tech_security_roles ?? 10),
      scale_tech_cutover_dr_runs: Number(scaleDrivers.tech_cutover_dr_runs ?? 2),

      // 8. Testing & Quality Assurance Drivers
      test_sit_cycles: Number(scaleDrivers.test_sit_cycles ?? 2),
      test_uat_cycles: Number(scaleDrivers.test_uat_cycles ?? 1),
      test_scripts_count: Number(scaleDrivers.test_scripts_count ?? 250),
      test_automation_pct: Number(scaleDrivers.test_automation_pct ?? 0),
      test_perf_runs: Number(scaleDrivers.test_perf_runs ?? 0),
      test_payroll_parallels: Number(scaleDrivers.test_payroll_parallels ?? 0),
      test_lead_model: scaleDrivers.test_lead_model || 'joint_50_50',
      test_defect_retest_factor: Number(scaleDrivers.test_defect_retest_factor ?? 1.25),

      // 9. Client Governance Modifiers
      clientModifier_decisionVelocity: Number(clientModifiers.decisionVelocity ?? 1.0),
      clientModifier_dataDebt: Number(clientModifiers.dataDebt ?? 1.0),
      clientModifier_cloudMindset: Number(clientModifiers.cloudMindset ?? 1.0),
      clientModifier_integrationVolatility: Number(clientModifiers.integrationVolatility ?? 1.0),
      clientModifier_smeAvailability: Number(clientModifiers.smeAvailability ?? 1.0),
      clientModifier_regulatoryCompliance: Number(clientModifiers.regulatoryCompliance ?? 1.0),
      clientModifier_changeResistance: Number(clientModifiers.changeResistance ?? 1.0),

      // 10. Metadata & Timestamps
      updatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      event: 'scenario_saved',
      source: 'Oracle Fusion Implementation Planner',

      // 11. Preserved Raw Objects & Full Complete Replica JSON
      deliveryMix,
      scaleDrivers,
      clientModifiers,
      selectedModules: scenario.selectedModules || [],
      customModules: scenario.customModules || [],
      customModuleQuestions: scenario.customModuleQuestions || {},
      moduleTShirtOverrides: scenario.moduleTShirtOverrides || {},
      moduleQuestionAnswers: scenario.moduleQuestionAnswers || {},
      rolloutQuestionAnswers: scenario.rolloutQuestionAnswers || {},
      complexityAnswers: scenario.complexityAnswers || {},
      blackoutPeriods: scenario.blackoutPeriods || [],
      waveDescriptions: scenario.waveDescriptions || [],
      technicalIntegrations: scenario.technicalIntegrations || [],
      technicalSmcOverrides: scenario.technicalSmcOverrides || {},
      phaseOverrides: scenario.phaseOverrides || {},
      scheduleModifiers: scenario.scheduleModifiers || {},
      scenarioDataJson: JSON.stringify(scenario)
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Successfully sent scenario to Make Database.',
        statusCode: response.status
      };
    } else {
      const text = await response.text().catch(() => '');
      return {
        success: false,
        message: `Make Webhook responded with HTTP ${response.status}: ${text.slice(0, 150)}`,
        statusCode: response.status
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to connect to Make Webhook: ${error.message || String(error)}`
    };
  }
}
