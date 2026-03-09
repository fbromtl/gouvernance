/**
 * Centralized color maps for badge styling across the portal.
 *
 * Each value is a set of Tailwind CSS classes for badges.
 * Import via `@/portail/constants/colors` or `@/portail/constants`.
 */

/* ================================================================== */
/*  SEVERITY COLORS — risk, incidents, bias                            */
/* ================================================================== */

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

/* ================================================================== */
/*  STATUS COLORS — workflow statuses (decisions, documents, etc.)      */
/* ================================================================== */

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  in_review: "bg-emerald-100 text-emerald-800 border-emerald-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  implemented: "bg-emerald-100 text-emerald-800 border-emerald-200",
  published: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
};

/* ================================================================== */
/*  RISK COLORS — AI Act risk levels for systems, vendors              */
/* ================================================================== */

export const RISK_COLORS: Record<string, string> = {
  prohibited: "bg-black text-white border-black",
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  limited: "bg-yellow-100 text-yellow-800 border-yellow-200",
  minimal: "bg-green-100 text-green-800 border-green-200",
};

/* ================================================================== */
/*  IMPACT COLORS — decision impact levels                             */
/* ================================================================== */

export const IMPACT_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  significant: "bg-orange-100 text-orange-800 border-orange-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  minor: "bg-blue-100 text-blue-800 border-blue-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

/* ================================================================== */
/*  DECISION_TYPE_COLORS — for different decision types                */
/* ================================================================== */

export const DECISION_TYPE_COLORS: Record<string, string> = {
  go_nogo: "bg-green-100 text-green-800 border-green-200",
  substantial_change: "bg-orange-100 text-orange-800 border-orange-200",
  scale_deployment: "bg-blue-100 text-blue-800 border-blue-200",
  vendor_change: "bg-emerald-100 text-emerald-800 border-emerald-200",
  policy_adjustment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ethical_arbitration: "bg-pink-100 text-pink-800 border-pink-200",
  suspension: "bg-red-100 text-red-800 border-red-200",
  exception: "bg-gray-100 text-gray-800 border-gray-200",
};

/* ================================================================== */
/*  AUTONOMY COLORS — agent autonomy levels                            */
/* ================================================================== */

export const AUTONOMY_COLORS: Record<string, string> = {
  A1: "bg-gray-100 text-gray-800 border-gray-200",
  A2: "bg-blue-100 text-blue-800 border-blue-200",
  A3: "bg-emerald-100 text-emerald-800 border-emerald-200",
  A4: "bg-orange-100 text-orange-800 border-orange-200",
  A5: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  PRIORITY COLORS — compliance remediation priorities                */
/* ================================================================== */

export const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

/* ================================================================== */
/*  COMPLIANCE STATUS COLORS — for compliance assessments              */
/* ================================================================== */

export const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
  compliant: "bg-green-100 text-green-800 border-green-200",
  partially_compliant: "bg-yellow-100 text-yellow-800 border-yellow-200",
  non_compliant: "bg-red-100 text-red-800 border-red-200",
  not_applicable: "bg-gray-100 text-gray-600 border-gray-200",
};

/* ================================================================== */
/*  ACTION STATUS COLORS — remediation action statuses                 */
/* ================================================================== */

export const ACTION_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  deferred: "bg-orange-100 text-orange-800 border-orange-200",
};

/* ================================================================== */
/*  VENDOR RISK COLORS — vendor-specific risk levels                   */
/* ================================================================== */

export const VENDOR_RISK_COLORS: Record<string, string> = {
  low_risk: "bg-green-100 text-green-800 border-green-200",
  medium_risk: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high_risk: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  VENDOR STATUS COLORS — vendor lifecycle statuses                   */
/* ================================================================== */

export const VENDOR_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  under_evaluation: "bg-blue-100 text-blue-800 border-blue-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  AGENT STATUS COLORS — agent lifecycle statuses                     */
/* ================================================================== */

export const AGENT_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  revoked: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  AGENT RISK COLORS — agent risk classifications (R1-R4)             */
/* ================================================================== */

export const AGENT_RISK_COLORS: Record<string, string> = {
  R1: "bg-blue-100 text-blue-800 border-blue-200",
  R2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  R3: "bg-orange-100 text-orange-800 border-orange-200",
  R4: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  EVENT TYPE COLORS — agent trace event types                        */
/* ================================================================== */

export const EVENT_TYPE_COLORS: Record<string, string> = {
  decision: "bg-blue-100 text-blue-800 border-blue-200",
  approval: "bg-green-100 text-green-800 border-green-200",
  escalation: "bg-orange-100 text-orange-800 border-orange-200",
};

/* ================================================================== */
/*  TRACE DECISION TYPE COLORS — agent trace decision codes (D1-D4)    */
/* ================================================================== */

export const TRACE_DECISION_TYPE_COLORS: Record<string, string> = {
  D1: "bg-gray-100 text-gray-800",
  D2: "bg-blue-100 text-blue-800",
  D3: "bg-emerald-100 text-emerald-800",
  D4: "bg-red-100 text-red-800",
};

/* ================================================================== */
/*  TRACE RISK LEVEL COLORS — agent trace risk levels (R1-R4)          */
/* ================================================================== */

export const TRACE_RISK_LEVEL_COLORS: Record<string, string> = {
  R1: "bg-blue-100 text-blue-800",
  R2: "bg-yellow-100 text-yellow-800",
  R3: "bg-orange-100 text-orange-800",
  R4: "bg-red-100 text-red-800",
};

/* ================================================================== */
/*  REVERSIBILITY COLORS — agent trace reversibility                   */
/* ================================================================== */

export const REVERSIBILITY_COLORS: Record<string, string> = {
  total: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  irreversible: "bg-red-100 text-red-800",
};

/* ================================================================== */
/*  DATA STATUS COLORS — dataset and transfer statuses                 */
/* ================================================================== */

export const DATA_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
  pending_deletion: "bg-orange-100 text-orange-800 border-orange-200",
  suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  INCIDENT SEVERITY COLORS — styled for stat cards (text-xxx-700)    */
/* ================================================================== */

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  low: "text-green-700 bg-green-50 border-green-200",
};

/* ================================================================== */
/*  SEVERITY INDICATORS — solid background dots for forms              */
/* ================================================================== */

export const SEVERITY_INDICATORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

/* ================================================================== */
/*  BIAS STATUS COLORS — bias finding statuses (with dark mode)        */
/* ================================================================== */

export const BIAS_SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export const BIAS_STATUS_COLORS: Record<string, string> = {
  identified: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  in_remediation: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  retest_pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  accepted_risk: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

/* ================================================================== */
/*  TRANSPARENCY COLORS — impact and contestation statuses             */
/* ================================================================== */

export const TRANSPARENCY_IMPACT_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export const CONTESTATION_STATUS_COLORS: Record<string, string> = {
  received: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  assigned: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  under_review: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  decision_revised: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  decision_maintained: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  notified: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  closed: "bg-muted text-muted-foreground",
};

/* ================================================================== */
/*  MONITORING ALERT COLORS — alert levels for monitoring data points  */
/* ================================================================== */

export const ALERT_LEVEL_COLORS: Record<string, string> = {
  ok: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

/* ================================================================== */
/*  HELPER FUNCTION                                                    */
/* ================================================================== */

/**
 * Get color classes from a color map, returning a fallback for unknown keys.
 */
export function getColorClass(
  colorMap: Record<string, string>,
  key: string | null | undefined,
  fallback = "bg-muted text-muted-foreground",
): string {
  if (!key) return fallback;
  return colorMap[key] ?? fallback;
}
