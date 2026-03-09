/**
 * Domain constants for AI Systems.
 *
 * Shared between AiSystemsListPage and AiSystemWizardPage.
 */

export const SYSTEM_TYPES = [
  "predictive_ml",
  "rules_based",
  "genai_text",
  "genai_image",
  "genai_code",
  "genai_multimodal",
  "nlp",
  "computer_vision",
  "robotics",
  "recommendation",
  "other",
] as const;

export const LIFECYCLE_STATUSES = [
  "idea",
  "pilot",
  "development",
  "testing",
  "production",
  "suspended",
  "decommissioned",
] as const;

export const DEPARTMENTS = [
  "it",
  "hr",
  "finance",
  "marketing",
  "sales",
  "legal",
  "operations",
  "customer_service",
  "r_and_d",
  "executive",
] as const;

export const RISK_LEVELS = ["minimal", "limited", "high", "critical"] as const;

export const GENAI_SUBTYPES = [
  "chatbot",
  "content_generation",
  "code_assistant",
  "image_generation",
  "summarization",
  "translation",
  "other",
] as const;

export const AFFECTED_POPULATIONS = [
  "employees",
  "customers",
  "prospects",
  "public",
  "minors",
  "vulnerable",
] as const;

export const ESTIMATED_VOLUMES = [
  "under_100",
  "100_1000",
  "1000_10000",
  "10000_100000",
  "over_100000",
] as const;

export const AUTONOMY_LEVELS = [
  "human_in_command",
  "human_in_the_loop",
  "human_on_the_loop",
  "full_auto",
] as const;

export const SENSITIVE_DOMAINS = [
  "biometric_id",
  "justice",
  "migration",
  "critical_infra",
  "health",
  "employment",
  "credit",
  "education",
  "housing",
] as const;

export const DATA_TYPES = [
  "no_personal_data",
  "public_data",
  "synthetic_data",
  "personal_data",
  "financial_data",
  "sensitive_data",
] as const;

export const SYSTEM_SOURCES = ["internal", "vendor", "open_source", "hybrid"] as const;

export const DATA_LOCATIONS = [
  "canada",
  "usa",
  "eu",
  "uk",
  "other_international",
] as const;

export const REVIEW_FREQUENCIES = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
] as const;
