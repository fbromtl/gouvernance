/**
 * Domain constants for Incidents.
 *
 * Shared between IncidentListPage and IncidentReportPage.
 */

export const INCIDENT_STATUSES = [
  "reported",
  "triaged",
  "investigating",
  "resolving",
  "resolved",
  "post_mortem",
  "closed",
] as const;

export const INCIDENT_SEVERITIES = ["critical", "high", "medium", "low"] as const;

export const INCIDENT_CATEGORIES = ["ai", "privacy"] as const;

export const AI_INCIDENT_TYPES = [
  "performance",
  "security",
  "bias",
  "ethics",
  "availability",
  "compliance",
  "unauthorized_use",
] as const;

export const PRIVACY_INCIDENT_TYPES = [
  "unauthorized_access",
  "unauthorized_use_data",
  "unauthorized_disclosure",
  "data_loss",
  "data_theft",
  "other_breach",
] as const;

export const DETECTION_MODES = [
  "automated_monitoring",
  "user_report",
  "internal_audit",
  "external_report",
  "media",
  "regulatory",
] as const;
