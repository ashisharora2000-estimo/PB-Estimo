import { ProjectScenario, BidDefaultsConfig, ScopingInputMode, FieldConfidenceMeta, QuestionConfidenceMeta, OracleModule } from '../types';
import { MODULE_TOP_20_QUESTIONS, isQuestionMandatory } from '../data/moduleScopingQuestions';

// Standard Predefined Bid Baseline Profiles
export const BID_DEFAULT_PROFILES: Record<string, BidDefaultsConfig> = {
  fast_track: {
    inputMode: 'fast_track',
    profileName: '⚡ Fast-Track / Minimal Inputs (Fit-to-Standard MBP)',
    defaultTShirtSize: 'S',
    defaultQuestionOptionIdx: 0, // Option 0 = MBP Fit-to-Standard (Score 1)
    defaultScaleDrivers: {
      fin_ent: 2,
      fin_led: 1,
      fin_cur: 1,
      fin_coa_segments: 6,
      scm_plants: 1,
      scm_wh: 1,
      scm_inv: 2,
      hcm_hc: 2500,
      tech_oic: 10,
      tech_data_objects: 8,
      tech_conversion_cycles: 2,
      tech_historical_years: 1,
      tech_reports_bip: 15,
      tech_reports_otbi: 10,
      tech_paas: 1,
      tech_workflows: 4,
      tech_security_roles: 8
    },
    defaultClientModifiers: {
      decisionVelocity: 1.0,
      dataDebt: 0.95,
      cloudMindset: 0.95,
      integrationVolatility: 1.0,
      smeAvailability: 1.0,
      regulatoryCompliance: 1.0,
      changeResistance: 1.0
    },
    confidenceScoreForDefaults: 80,
    aiConfidenceThreshold: 70,
    autoApplyDefaultsOnIngestion: true
  },
  standard: {
    inputMode: 'standard',
    profileName: '🏢 Standard Enterprise Cloud (Balanced Inputs)',
    defaultTShirtSize: 'M',
    defaultQuestionOptionIdx: 1, // Option 1 = Standard Enterprise (Score 2)
    defaultScaleDrivers: {
      fin_ent: 4,
      fin_led: 2,
      fin_cur: 3,
      fin_coa_segments: 8,
      scm_plants: 3,
      scm_wh: 4,
      scm_inv: 8,
      hcm_hc: 8000,
      tech_oic: 24,
      tech_data_objects: 16,
      tech_conversion_cycles: 3,
      tech_historical_years: 2,
      tech_reports_bip: 35,
      tech_reports_otbi: 25,
      tech_paas: 3,
      tech_workflows: 8,
      tech_security_roles: 16
    },
    defaultClientModifiers: {
      decisionVelocity: 1.05,
      dataDebt: 1.10,
      cloudMindset: 1.0,
      integrationVolatility: 1.05,
      smeAvailability: 1.05,
      regulatoryCompliance: 1.05,
      changeResistance: 1.05
    },
    confidenceScoreForDefaults: 75,
    aiConfidenceThreshold: 70,
    autoApplyDefaultsOnIngestion: true
  },
  comprehensive: {
    inputMode: 'comprehensive',
    profileName: '🌐 Complex Global Transformation (Full Depth)',
    defaultTShirtSize: 'L',
    defaultQuestionOptionIdx: 2, // Option 2 = Multi-Entity Complex (Score 3)
    defaultScaleDrivers: {
      fin_ent: 10,
      fin_led: 4,
      fin_cur: 6,
      fin_coa_segments: 10,
      scm_plants: 8,
      scm_wh: 8,
      scm_inv: 18,
      hcm_hc: 20000,
      tech_oic: 40,
      tech_data_objects: 26,
      tech_conversion_cycles: 4,
      tech_historical_years: 3,
      tech_reports_bip: 65,
      tech_reports_otbi: 45,
      tech_paas: 6,
      tech_workflows: 16,
      tech_security_roles: 28
    },
    defaultClientModifiers: {
      decisionVelocity: 1.15,
      dataDebt: 1.25,
      cloudMindset: 1.15,
      integrationVolatility: 1.15,
      smeAvailability: 1.15,
      regulatoryCompliance: 1.25,
      changeResistance: 1.20
    },
    confidenceScoreForDefaults: 70,
    aiConfidenceThreshold: 70,
    autoApplyDefaultsOnIngestion: true
  }
};

/**
 * Returns the active bid's defaults configuration, falling back to standard profile if unset.
 */
export function getScenarioBidDefaults(scenario: ProjectScenario): BidDefaultsConfig {
  if (scenario.bidDefaultsConfig) {
    return scenario.bidDefaultsConfig;
  }
  const mode = scenario.scopingInputMode || 'standard';
  return BID_DEFAULT_PROFILES[mode] || BID_DEFAULT_PROFILES.standard;
}

/**
 * Applies bid-specific defaults to any unanswered questions, unset scale drivers, and unstated modifiers.
 * Stamping each with confidence scores, source: 'bid_default', and clear citations.
 * Completely isolated to this scenario!
 */
export function applyBidDefaultsToScenario(
  scenario: ProjectScenario,
  config: BidDefaultsConfig,
  options: { overwriteExisting?: boolean } = {}
): ProjectScenario {
  const { overwriteExisting = false } = options;
  const now = new Date().toISOString();

  // 1. Update Scoping Questions and Question Confidence Meta
  const currentAnswers = { ...(scenario.moduleQuestionAnswers || {}) };
  const currentMeta = { ...(scenario.questionConfidenceMeta || {}) };

  scenario.selectedModules.forEach(modId => {
    const qList = MODULE_TOP_20_QUESTIONS[modId] || [];
    const modAnswers = currentAnswers[modId] ? [...currentAnswers[modId]] : [];
    const modMeta = currentMeta[modId] ? { ...currentMeta[modId] } : {};

    qList.forEach((q, qIdx) => {
      const existingAnswer = modAnswers[qIdx];
      const existingMeta = modMeta[qIdx];
      const isUnset = existingAnswer === undefined || existingAnswer === null;
      const isLowOrUnconfirmed = !existingMeta || existingMeta.confidence === 'unconfirmed' || existingMeta.source === 'default_benchmark';

      if (isUnset || (overwriteExisting && isLowOrUnconfirmed)) {
        modAnswers[qIdx] = config.defaultQuestionOptionIdx;
        const confLevel = config.confidenceScoreForDefaults >= 80 ? 'high' : config.confidenceScoreForDefaults >= 65 ? 'medium' : 'low';

        modMeta[qIdx] = {
          confidence: confLevel,
          percentage: config.confidenceScoreForDefaults,
          source: 'bid_default',
          proposalCitation: `Calibrated Bid Default: ${config.profileName}`,
          clientClarificationNeeded: config.confidenceScoreForDefaults < config.aiConfidenceThreshold,
          clientNotes: `Default baseline assumption applied (${q.options[config.defaultQuestionOptionIdx]?.label || 'Standard MBP'}).`
        };
      }
    });

    currentAnswers[modId] = modAnswers;
    currentMeta[modId] = modMeta;
  });

  // 2. Update Scale Drivers & Field Confidence Meta
  const currentScale = { ...scenario.scaleDrivers };
  const currentFieldMeta: Record<string, FieldConfidenceMeta> = { ...(scenario.fieldConfidenceMeta || {}) };

  Object.entries(config.defaultScaleDrivers).forEach(([k, defaultVal]) => {
    const key = k as keyof typeof currentScale;
    const existingVal = currentScale[key];
    const isUnset = existingVal === undefined || existingVal === 0;

    if (isUnset || overwriteExisting) {
      (currentScale as any)[key] = defaultVal;
      const confLevel = config.confidenceScoreForDefaults >= 80 ? 'high' : config.confidenceScoreForDefaults >= 65 ? 'medium' : 'low';
      currentFieldMeta[key] = {
        fieldName: key,
        confidence: confLevel,
        percentage: config.confidenceScoreForDefaults,
        source: 'bid_default',
        citation: `Calibrated Bid Default: ${config.profileName}`,
        rationale: `Set to baseline value of ${defaultVal} based on ${config.profileName}.`,
        lastUpdated: now
      };
    }
  });

  // 3. Update Client Modifiers
  const currentModifiers = { ...scenario.clientModifiers };
  Object.entries(config.defaultClientModifiers).forEach(([k, defaultVal]) => {
    const key = k as keyof typeof currentModifiers;
    const existingVal = currentModifiers[key];
    const isUnset = existingVal === undefined || existingVal === 1.0;

    if (isUnset || overwriteExisting) {
      if (defaultVal !== undefined) {
        (currentModifiers as any)[key] = defaultVal;
        const confLevel = config.confidenceScoreForDefaults >= 80 ? 'high' : config.confidenceScoreForDefaults >= 65 ? 'medium' : 'low';
        currentFieldMeta[`modifier_${key}`] = {
          fieldName: `Modifier: ${key}`,
          confidence: confLevel,
          percentage: config.confidenceScoreForDefaults,
          source: 'bid_default',
          citation: `Calibrated Bid Default: ${config.profileName}`,
          rationale: `Applied modifier value ${defaultVal}x from bid default profile.`,
          lastUpdated: now
        };
      }
    }
  });

  return {
    ...scenario,
    scopingInputMode: config.inputMode,
    bidDefaultsConfig: config,
    moduleQuestionAnswers: currentAnswers,
    questionConfidenceMeta: currentMeta,
    scaleDrivers: currentScale,
    clientModifiers: currentModifiers,
    fieldConfidenceMeta: currentFieldMeta
  };
}

/**
 * Changes the active input reduction mode (e.g. 'fast_track' vs 'standard' vs 'comprehensive')
 * and synchronizes the bid defaults accordingly without losing existing user inputs.
 */
export function setScenarioInputMode(scenario: ProjectScenario, mode: ScopingInputMode): ProjectScenario {
  const currentConfig = getScenarioBidDefaults(scenario);
  const updatedConfig: BidDefaultsConfig = {
    ...currentConfig,
    inputMode: mode,
    profileName: BID_DEFAULT_PROFILES[mode]?.profileName || currentConfig.profileName
  };

  return {
    ...scenario,
    scopingInputMode: mode,
    bidDefaultsConfig: updatedConfig
  };
}
