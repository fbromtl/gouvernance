/**
 * Domain constants for Decisions.
 *
 * Used by DecisionsPage.
 */

export const DECISION_TYPES = [
  "go_nogo",
  "substantial_change",
  "scale_deployment",
  "vendor_change",
  "policy_adjustment",
  "ethical_arbitration",
  "suspension",
  "exception",
] as const;

export const DECISION_STATUSES = [
  "draft",
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "implemented",
  "archived",
] as const;

export const DECISION_IMPACTS = ["low", "medium", "high", "critical"] as const;
