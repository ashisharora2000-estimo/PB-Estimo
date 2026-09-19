import { ProjectScenario } from '../types';

const STORAGE_KEY_MAKE_WEBHOOK = 'oracle_impl_make_webhook_url';
const STORAGE_KEY_MAKE_AUTO_SYNC = 'oracle_impl_make_auto_sync';
const STORAGE_KEY_MAKE_DEFAULT_STATUS = 'oracle_impl_make_default_status';

export function getMakeDefaultStatus(): string {
  if (typeof window === 'undefined') return '200';
  return localStorage.getItem(STORAGE_KEY_MAKE_DEFAULT_STATUS) || '200';
}

export function setMakeDefaultStatus(status: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MAKE_DEFAULT_STATUS, status.trim() || '200');
}

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
 * Helper to enrich webhook URL with query parameters.
 * Make.com Custom Webhooks parse query parameters into top-level bundle variables
 * regardless of whether JSON pass-through is active or how data structures were inferred.
 */
export function buildWebhookUrlWithParams(
  rawUrl: string, 
  scenarioStatus: string, 
  scenarioId?: string, 
  scenarioName?: string
): string {
  if (!rawUrl) return '';
  const isNumericStatus = !isNaN(Number(scenarioStatus));
  const numericCode = isNumericStatus ? Number(scenarioStatus) : 200;

  try {
    const parsed = new URL(rawUrl);
    if (!parsed.searchParams.has('status')) {
      parsed.searchParams.set('status', scenarioStatus);
    }
    if (!parsed.searchParams.has('Status')) {
      parsed.searchParams.set('Status', scenarioStatus);
    }
    if (!parsed.searchParams.has('statusCode')) {
      parsed.searchParams.set('statusCode', String(numericCode));
    }
    if (!parsed.searchParams.has('code')) {
      parsed.searchParams.set('code', String(numericCode));
    }
    if (scenarioId && !parsed.searchParams.has('id')) {
      parsed.searchParams.set('id', scenarioId);
    }
    if (scenarioName && !parsed.searchParams.has('name')) {
      parsed.searchParams.set('name', scenarioName);
    }
    return parsed.toString();
  } catch {
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}status=${encodeURIComponent(scenarioStatus)}&Status=${encodeURIComponent(scenarioStatus)}&statusCode=${numericCode}`;
  }
}

/**
 * Sends a scenario payload to Make (Integromat) Webhook to store in Make Data Store
 */
export async function sendScenarioToMakeDatabase(
  scenario: ProjectScenario,
  overrideWebhookUrl?: string
): Promise<{ success: boolean; message: string; statusCode?: number; details?: any }> {
  const rawWebhookUrl = overrideWebhookUrl || getMakeWebhookUrl();
  if (!rawWebhookUrl) {
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

    const defaultStatusSetting = getMakeDefaultStatus() || 'ACTIVE';
    const scenarioStatus = scenario.status || 
      (scenario.isScheduleFrozen ? 'BASELINE LOCKED' : 
       scenario.isBlackoutLocked ? 'BLACKOUT LOCKED' : 
       defaultStatusSetting);

    const isNumericStatus = !isNaN(Number(scenarioStatus));
    const numericStatusCode = isNumericStatus ? Number(scenarioStatus) : 200;

    // Guaranteed status value: either primitive string or primitive number based on configuration
    const resolvedStatusValue: string | number = isNumericStatus ? numericStatusCode : scenarioStatus;

    // Enriched URL with query params
    const enrichedWebhookUrl = buildWebhookUrlWithParams(rawWebhookUrl, scenarioStatus, scenario.id, scenario.name);

    const payload = {
      // 1. Core Top-Level Scenario Attributes (Guaranteed status parameter for webhook data structure validation)
      status: resolvedStatusValue,
      Status: resolvedStatusValue,
      statusCode: numericStatusCode,
      status_code: numericStatusCode,
      httpStatus: numericStatusCode,
      code: numericStatusCode,
      state: scenarioStatus,
      statusValue: scenarioStatus,
      statusText: 'OK',
      result: 'success',
      success: true,

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
      metadata_status: scenarioStatus,
      updatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      event: 'scenario_saved',
      source: 'Oracle Fusion Implementation Planner',

      // 11. Nested Objects for Make / Integromat Modules
      project: {
        id: scenario.id,
        name: scenario.name,
        status: resolvedStatusValue,
        Status: resolvedStatusValue,
        statusCode: numericStatusCode,
        clientName: scenario.clientName || ''
      },
      scenario: {
        id: scenario.id,
        name: scenario.name,
        status: resolvedStatusValue,
        Status: resolvedStatusValue,
        statusCode: numericStatusCode
      },
      data: {
        id: scenario.id,
        name: scenario.name,
        status: resolvedStatusValue,
        Status: resolvedStatusValue,
        statusCode: numericStatusCode
      },
      fields: {
        status: resolvedStatusValue,
        Status: resolvedStatusValue,
        name: scenario.name,
        id: scenario.id
      },
      record: {
        status: resolvedStatusValue,
        Status: resolvedStatusValue,
        name: scenario.name,
        id: scenario.id
      },

      // 12. Preserved Raw Objects & Full Complete Replica JSON
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
      scenarioDataJson: JSON.stringify({ ...scenario, status: scenarioStatus })
    };

    // 1. Prefer Server Proxy with Automatic Status Parameter Healing
    try {
      const proxyRes = await fetch('/api/webhook/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: rawWebhookUrl,
          payload,
          status: scenarioStatus
        })
      });

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData.success) {
          if (proxyData.calibratedStatus) {
            setMakeDefaultStatus(String(proxyData.calibratedStatus));
          }
          return {
            success: true,
            message: proxyData.message || 'Successfully transmitted to Make Database.',
            statusCode: proxyData.statusCode || 200,
            details: proxyData.responseBody
          };
        } else {
          return {
            success: false,
            message: proxyData.message || 'Make Webhook rejected payload.',
            statusCode: proxyData.statusCode || 400,
            details: proxyData.responseBody
          };
        }
      }
    } catch (proxyErr) {
      console.warn('[Make Sync] Server proxy unreachable, attempting direct dispatch...', proxyErr);
    }

    // 2. Direct browser fetch fallback (clean headers without non-standard CORS triggers)
    try {
      const response = await fetch(enrichedWebhookUrl, {
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
          message: `Make Webhook responded with HTTP ${response.status}: ${text.slice(0, 200)}`,
          statusCode: response.status,
          details: text
        };
      }
    } catch (directErr: any) {
      return {
        success: false,
        message: `Failed to connect to Make Webhook: ${directErr.message || String(directErr)}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to connect to Make Webhook: ${error.message || String(error)}`
    };
  }
}

/**
 * Validates a webhook connection with a comprehensive multi-parameter validation test.
 */
export async function validateMakeWebhookConnection(
  webhookUrl: string,
  statusOption?: string
): Promise<{
  valid: boolean;
  message: string;
  statusCode?: number;
  responseBody?: string;
  recommendation?: string;
  calibratedStatus?: any;
  autoCalibrated?: boolean;
}> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { valid: false, message: 'Webhook URL is required.' };
  }

  const trimmedUrl = webhookUrl.trim();
  const candidateStatus = statusOption || getMakeDefaultStatus() || '200';

  const testPayload = {
    testOnly: true,
    event: 'ORACLE_CLOUD_WEBHOOK_VALIDATION_PING',
    status: candidateStatus,
    Status: candidateStatus,
    statusCode: !isNaN(Number(candidateStatus)) ? Number(candidateStatus) : 200,
    timestamp: new Date().toISOString(),
    sheetName: 'Oracle Cloud Project Baseline (Validation Ping)',
    workspaceId: 'home',
    name: 'Validation Test Ping',
    clientName: 'Validation Check',
    project: {
      status: candidateStatus,
      name: 'Validation Test Ping',
      clientName: 'Validation Check',
      totalWeeks: 32,
      modules: ['FIN-GL', 'FIN-AP', 'FIN-AR'],
      phases: ['Wave 0', 'Wave 1']
    },
    data: {
      status: candidateStatus,
      name: 'Validation Test Ping'
    },
    fields: {
      status: candidateStatus,
      sheetName: 'Oracle Cloud Project Baseline (Validation Ping)'
    }
  };

  try {
    const proxyRes = await fetch('/api/webhook/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: trimmedUrl,
        status: candidateStatus,
        payload: testPayload
      })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.success) {
        if (data.calibratedStatus) {
          setMakeDefaultStatus(String(data.calibratedStatus));
        }
        return {
          valid: true,
          message: data.message || `Webhook validated successfully! Received HTTP ${data.statusCode || 200} OK.`,
          statusCode: data.statusCode || 200,
          responseBody: data.responseBody,
          calibratedStatus: data.calibratedStatus,
          autoCalibrated: data.autoCalibrated
        };
      }

      const msg = data.message || '';
      let recommendation = '';
      if (msg.includes("required parameter 'status'") || msg.includes('parameter(s)')) {
        recommendation = "Make.com scenario requires status parameter. Our engine attempted auto-calibration with both numeric HTTP 200 and text 'ACTIVE'. Ensure your Make scenario's Webhook Response or Data Store module maps 'status' correctly or click 'Redetermine data structure' in Make.";
      } else if (msg.includes('500') || msg.includes('Scenario failed to complete')) {
        recommendation = "Make.com successfully received the webhook, but a downstream module inside your Make scenario threw an error before completing. Open Make.com > Scenarios > History, click the red execution log, and inspect which module failed (e.g. missing sheet, invalid token, or unhandled field).";
      } else if (msg.includes('404')) {
        recommendation = "Webhook endpoint not found (HTTP 404). Check if the Make.com scenario is turned ON (active).";
      } else if (msg.includes('401') || msg.includes('403')) {
        recommendation = "Webhook returned Unauthorized / Forbidden. Check IP whitelist or Make API key permissions.";
      }

      return {
        valid: false,
        message: data.message || 'Validation failed for webhook.',
        statusCode: data.statusCode,
        responseBody: data.responseBody,
        recommendation
      };
    }
  } catch (netErr: any) {
    console.warn('Proxy validation error, fallback to direct test:', netErr);
  }

  // Fallback test via scenario transmission
  const fallbackScenario = {
    id: 'validation-test-ping',
    name: 'Validation Test Ping',
    description: 'Validation check ping',
    clientName: 'Validation Check',
    industry: 'General Services',
    projectWeeks: 32,
    targetStartDate: '2026-10-05',
    schedulingMode: 'forward' as const,
    rolloutApproach: 'phased_geo' as const,
    rolloutWaves: 1,
    selectedModules: [],
    scaleDrivers: {},
    complexityAnswers: {},
    status: candidateStatus
  } as unknown as ProjectScenario;

  const result = await sendScenarioToMakeDatabase(fallbackScenario, trimmedUrl);

  return {
    valid: result.success,
    message: result.message,
    statusCode: result.statusCode || (result.success ? 200 : 400),
    responseBody: result.details
  };
}
