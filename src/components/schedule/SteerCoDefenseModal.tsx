import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  TrendingDown,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ProjectScenario, CalculatedProjectData } from '../../types';

interface SteerCoDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ProjectScenario;
  data: CalculatedProjectData;
  onApplyRecommendedDuration?: () => void;
}

export const SteerCoDefenseModal: React.FC<SteerCoDefenseModalProps> = ({
  isOpen,
  onClose,
  scenario,
  data,
  onApplyRecommendedDuration
}) => {
  const [copied, setCopied] = useState(false);
  const sf = data.scheduleFeasibility;

  if (!isOpen) return null;

  const handleCopyNarrative = () => {
    const text = `
EXECUTIVE SCHEDULE DEFENSE BRIEFING (STEERCO / CIO)
Project: ${scenario.name || 'Oracle Cloud Transformation'}
Scope: ${scenario.selectedModules.length} Modules across ${scenario.rolloutWaves || 1} Wave(s)
Recommended Defensible Duration: ${data.recommendedDurationWeeks} Weeks (${Math.round(data.recommendedDurationWeeks / 4.33)} Months)
Target Go-Live: ${new Date(sf.calculatedGoLiveDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

METHODOLOGICAL DURATION SIZING:
1. Base Lifecycle Footprint: Mandatory 2-week Client Enablement + Core Process Design & CRP Sprints
2. Technical & Data Complexity: Sized for ${(scenario.scaleDrivers.tech_oic || 0)} OIC Integrations and ${(scenario.scaleDrivers.tech_conversion_cycles || 3)} FBDI Mock Conversion Cycles
3. Quality Testing Rigor: End-to-End Business Test 1 (SIT) & Business Test 2 (UAT) with Cutover Gold Run Dress Rehearsal
4. Concurrency Optimization: ${scenario.scheduleModifiers?.fastTrackingOverlapPct || 15}% Fast-tracking overlap applied

CRITICAL PATH & FEASIBILITY:
- Feasibility Rating: ${sf.feasibilityRating} (${sf.varianceWeeks >= 0 ? `+${sf.varianceWeeks} Weeks Buffer` : `${sf.varianceWeeks} Weeks Schedule Deficit`})
- Critical Path Float: ${data.leadershipGaps.criticalPath.criticalPathLengthWeeks} Weeks with ${data.leadershipGaps.criticalPath.zeroFloatActivitiesCount} zero-float gating milestones
- Oracle Pod Cohort: Cohort ${scenario.podCohort} (Quarterly updates avoided during cutover gates)

DELIVERY LEAD DIRECTIVES:
${sf.recommendations.map(r => `• ${r}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-300 rounded-sm shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Senior Delivery Lead Executive Defense Briefing
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400 text-slate-950 rounded-none font-bold uppercase">
                  SteerCo Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Explainable, defensible rationale to justify project duration to C-suite and SteerCo leadership.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-sm transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Top 30-Second Elevator Pitch */}
          <div className="p-4 rounded-sm bg-slate-50 border-l-4 border-slate-900 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              30-Second Executive Pitch
            </span>
            <p className="text-xs font-medium text-slate-900 leading-relaxed">
              "This implementation is sized at <strong>{scenario.projectWeeks} weeks ({Math.round(scenario.projectWeeks / 4.33)} months)</strong> using the standard 4-pillar methodology: our scope footprint requires 2 CRP design cycles, {scenario.scaleDrivers.tech_conversion_cycles || 3} mock data conversion cycles to de-risk legacy data, and dedicated SIT/UAT testing gates. This timeline maintains a <strong>{sf.varianceWeeks >= 0 ? `+${sf.varianceWeeks}-week buffer` : `${sf.varianceWeeks}-week deficit`}</strong> against the target go-live while protecting Day-1 operational continuity."
            </p>
          </div>

          {/* 4-Step Explainable Method Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-amber-600" />
              <span>The 4-Step Duration Sizing Derivation</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">1. Base Lifecycle & Build Floor</span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 border border-slate-200">
                    {data.buildDurationBreakdown.recommendedBuildWeeks} Wks Build
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {data.buildDurationBreakdown.baseConfigWeeks}w functional configuration + {data.buildDurationBreakdown.totalTechnicalDevDays} Technical Person-Days ({scenario.scaleDrivers.tech_oic || 0} OIC flows, {((scenario.scaleDrivers.tech_reports_bip || 0) + (scenario.scaleDrivers.tech_reports_otbi || 0))} reports) + 2w Mock 1 + 2w string test.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">2. Technical & Data Drivers</span>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 border border-blue-200">
                    +{Math.round((scenario.scaleDrivers.tech_oic || 0) > 10 ? 4 : 2) + Math.round((scenario.scaleDrivers.tech_conversion_cycles || 3) >= 4 ? 3 : 1)} Wks
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Integration density ({scenario.scaleDrivers.tech_oic || 0} OIC flows) and {scenario.scaleDrivers.tech_conversion_cycles || 3} Mock Conversion Loads across {scenario.scaleDrivers.tech_data_objects || 12} data objects drive SIT duration.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">3. Phasing & Multi-Wave</span>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 border border-purple-200">
                    +{scenario.rolloutWaves > 1 ? `${(scenario.rolloutWaves - 1) * 8} Wks` : '0 Wks (Big Bang)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {scenario.rolloutApproach === 'big_bang'
                    ? 'Single-wave deployment with simultaneous go-live across all entities.'
                    : `Multi-wave rollout across ${scenario.rolloutWaves} waves with staggered deployment & hypercare transition.`}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">4. Fast-Tracking Overlap</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                    -{Math.round(data.recommendedDurationWeeks * ((scenario.scheduleModifiers?.fastTrackingOverlapPct || 15) / 100) * 0.3)} Wks
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {scenario.scheduleModifiers?.fastTrackingOverlapPct || 15}% concurrency between Design CRP2 and Build sprint starts saves calendar weeks without compromising gating reviews.
                </p>
              </div>
            </div>
          </div>

          {/* SteerCo Key FAQs / Defense Talking Points */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle size={14} className="text-slate-500" />
              <span>Key Executive FAQs & Objections Handled</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  Q: "Why can't we complete technical build and development in 8 weeks?"
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Senior Delivery Lead Answer:</strong> An 8-week build only works for 100% standard out-of-the-box configuration with zero integrations. This scope has <strong>{data.buildDurationBreakdown.totalTechnicalDevDays} Technical Person-Days</strong> across {scenario.scaleDrivers.tech_oic || 0} OIC interfaces, custom BIP financial reports, and Mock 1 FBDI data load. Compressing this into 8 weeks requires over {Math.round(data.buildDurationBreakdown.totalTechnicalDevDays / 20)} simultaneous developers, violating Brooks' Law and guaranteeing integration failures when entering SIT. Sizing at <strong>{data.buildDurationBreakdown.recommendedBuildWeeks} weeks</strong> ensures all endpoints and Mock 1 datasets are verified.
                </p>
              </div>

              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  Q: "Can we compress testing to hit an earlier date?"
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Senior Delivery Lead Answer:</strong> Compressing SIT or UAT below 8 combined weeks removes the second mock conversion load, which is where 80% of legacy data exceptions and interface transaction reconciliation failures occur. We recommend maintaining the full testing runway to avoid Day-1 business disruption.
                </p>
              </div>

              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  Q: "How are we handling Oracle quarterly patching and environment refreshes without disrupting UAT and Go-Live?"
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Senior Solution Architect Answer:</strong> We have mapped the 5-Tier pod landscape (DEV1, DEV2, TEST, STAGE, PROD) against <strong>Cohort {scenario.podCohort}</strong>. Non-prod pods receive updates on the 1st Friday of release months while PROD updates on the 3rd Friday. Our plan schedules {data.environmentStrategy?.p2tEvents.length || 3} P2T Golden Refreshes with freeze gates prior to SIT and UAT. If a patch release falls inside Cutover or UAT, we execute automated 2-day regression scripts or submit a formal Oracle Maintenance Exemption to protect the critical path.
                </p>
              </div>

              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  Q: "How does this compare to industry benchmarks?"
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Senior Delivery Lead Answer:</strong> The Oracle True Cloud Method (TCM) benchmark for this scope tier ({sf.industryBenchmarkLabel}) is <strong>{sf.industryBenchmarkDurationWeeks} weeks</strong>. Our {data.recommendedDurationWeeks}-week sizing aligns tightly with Tier-1 SI delivery averages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyNarrative}
            className="px-3.5 py-2 rounded-sm bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy SteerCo Briefing'}</span>
          </button>

          <div className="flex items-center gap-2">
            {scenario.projectWeeks !== data.recommendedDurationWeeks && onApplyRecommendedDuration && (
              <button
                onClick={() => {
                  onApplyRecommendedDuration();
                  onClose();
                }}
                className="px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Zap size={14} />
                <span>Adopt Recommended ({data.recommendedDurationWeeks} Wks)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
