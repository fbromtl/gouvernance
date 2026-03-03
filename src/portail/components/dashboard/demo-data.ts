/**
 * Demo data for the dashboard "Demo Mode" toggle.
 * These are realistic fake records that showcase all dashboard widgets
 * with diverse values so every chart / table / list is populated.
 */

import type { Database } from "@/types/database";

type AiSystem = Database["public"]["Tables"]["ai_systems"]["Row"];
type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type Decision = Database["public"]["Tables"]["decisions"]["Row"];
type BiasFinding = Database["public"]["Tables"]["bias_findings"]["Row"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ORG_ID = "demo-org-00000000-0000-0000-0000-000000000000";

function demoId(n: number) {
  return `demo-${String(n).padStart(4, "0")}-0000-0000-0000-000000000000`;
}

function monthsAgo(m: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  return d.toISOString();
}

function daysFromNow(d: number) {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString().split("T")[0];
}

function daysAgo(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

/* ------------------------------------------------------------------ */
/*  AI Systems (10)                                                    */
/* ------------------------------------------------------------------ */

const systemBase = {
  organization_id: ORG_ID,
  internal_ref: null,
  genai_subtype: null,
  departments: [],
  purpose: null,
  affected_population: [],
  estimated_volume: null,
  autonomy_level: null,
  sensitive_domains: [],
  data_types: [],
  system_source: null,
  vendor_name: null,
  model_version: null,
  data_locations: [],
  business_owner_id: null,
  tech_owner_id: null,
  privacy_owner_id: null,
  risk_owner_id: null,
  approver_id: null,
  review_frequency: "quarterly",
  notes: null,
  status: "active",
  created_by: null,
  updated_by: null,
  deleted_at: null,
} satisfies Partial<AiSystem>;

export const DEMO_AI_SYSTEMS: AiSystem[] = [
  {
    ...systemBase,
    id: demoId(1),
    name: "Moteur de scoring crédit",
    description: "ML prédictif pour l'évaluation de risque crédit des demandeurs",
    system_type: "predictive_ml",
    lifecycle_status: "production",
    production_date: monthsAgo(8),
    next_review_date: daysFromNow(15),
    risk_score: 85,
    risk_level: "critical",
    created_at: monthsAgo(12),
    updated_at: daysAgo(3),
  },
  {
    ...systemBase,
    id: demoId(2),
    name: "Assistant RH conversationnel",
    description: "GenAI texte pour le support interne des employés",
    system_type: "genai_text",
    lifecycle_status: "production",
    production_date: monthsAgo(4),
    next_review_date: daysFromNow(45),
    risk_score: 62,
    risk_level: "high",
    created_at: monthsAgo(6),
    updated_at: daysAgo(7),
  },
  {
    ...systemBase,
    id: demoId(3),
    name: "Détection de fraude en temps réel",
    description: "Système de détection d'anomalies transactionnelles",
    system_type: "predictive_ml",
    lifecycle_status: "production",
    production_date: monthsAgo(14),
    next_review_date: daysFromNow(-10),
    risk_score: 78,
    risk_level: "high",
    created_at: monthsAgo(18),
    updated_at: daysAgo(1),
  },
  {
    ...systemBase,
    id: demoId(4),
    name: "Classification documents juridiques",
    description: "NLP pour le classement automatique de documents",
    system_type: "nlp",
    lifecycle_status: "production",
    production_date: monthsAgo(6),
    next_review_date: daysFromNow(80),
    risk_score: 45,
    risk_level: "limited",
    created_at: monthsAgo(10),
    updated_at: daysAgo(14),
  },
  {
    ...systemBase,
    id: demoId(5),
    name: "Recommandation produits e-commerce",
    description: "Moteur de recommandation collaborative",
    system_type: "recommendation",
    lifecycle_status: "production",
    production_date: monthsAgo(10),
    next_review_date: daysFromNow(120),
    risk_score: 30,
    risk_level: "minimal",
    created_at: monthsAgo(14),
    updated_at: daysAgo(20),
  },
  {
    ...systemBase,
    id: demoId(6),
    name: "Analyse sentiments réseaux sociaux",
    description: "NLP pour le monitoring de la perception de marque",
    system_type: "nlp",
    lifecycle_status: "production",
    production_date: monthsAgo(3),
    next_review_date: daysFromNow(60),
    risk_score: 35,
    risk_level: "limited",
    created_at: monthsAgo(5),
    updated_at: daysAgo(5),
  },
  {
    ...systemBase,
    id: demoId(7),
    name: "Inspection qualité visuelle",
    description: "Computer vision pour le contrôle qualité en production",
    system_type: "computer_vision",
    lifecycle_status: "production",
    production_date: monthsAgo(2),
    next_review_date: daysFromNow(85),
    risk_score: 52,
    risk_level: "limited",
    created_at: monthsAgo(4),
    updated_at: daysAgo(10),
  },
  {
    ...systemBase,
    id: demoId(8),
    name: "Générateur de code interne",
    description: "GenAI code pour accélérer le développement logiciel",
    system_type: "genai_code",
    lifecycle_status: "development",
    production_date: null,
    next_review_date: daysFromNow(30),
    risk_score: 40,
    risk_level: "limited",
    created_at: monthsAgo(2),
    updated_at: daysAgo(2),
  },
  {
    ...systemBase,
    id: demoId(9),
    name: "Chatbot service client",
    description: "GenAI multimodal pour le support client 24/7",
    system_type: "genai_multimodal",
    lifecycle_status: "testing",
    production_date: null,
    next_review_date: daysFromNow(20),
    risk_score: 58,
    risk_level: "high",
    created_at: monthsAgo(3),
    updated_at: daysAgo(1),
  },
  {
    ...systemBase,
    id: demoId(10),
    name: "Prédiction attrition employés",
    description: "ML prédictif pour anticiper les départs volontaires",
    system_type: "predictive_ml",
    lifecycle_status: "production",
    production_date: monthsAgo(5),
    next_review_date: daysFromNow(-5),
    risk_score: 72,
    risk_level: "high",
    created_at: monthsAgo(7),
    updated_at: daysAgo(4),
  },
];

/* ------------------------------------------------------------------ */
/*  Incidents (18) — spread over 6 months                              */
/* ------------------------------------------------------------------ */

const incidentBase = {
  organization_id: ORG_ID,
  ai_system_id: null,
  started_at: null,
  detection_mode: null,
  assigned_to: null,
  impact_description: null,
  affected_count: null,
  priority: null,
  serious_harm_risk: false,
  root_cause: null,
  contributing_factors: [],
  resolution_date: null,
  corrective_actions: null,
  post_mortem: null,
  lessons_learned: null,
  cai_notification_status: null,
  cai_notified_at: null,
  persons_notified: false,
  reported_by: null,
  created_by: null,
  updated_by: null,
  deleted_at: null,
} satisfies Partial<Incident>;

const incidentRows: { title: string; severity: string; status: string; month: number; category: string; incident_type: string }[] = [
  { title: "Biais détecté dans le scoring crédit", severity: "critical", status: "investigating", month: 0, category: "bias", incident_type: "bias_discrimination" },
  { title: "Fuite de données personnelles via chatbot", severity: "high", status: "mitigating", month: 0, category: "data_breach", incident_type: "data_leak" },
  { title: "Hallucination critique de l'assistant RH", severity: "high", status: "open", month: 0, category: "performance", incident_type: "model_error" },
  { title: "Temps de réponse dégradé moteur fraude", severity: "medium", status: "resolved", month: 1, category: "performance", incident_type: "performance_degradation" },
  { title: "Erreur de classification juridique", severity: "medium", status: "closed", month: 1, category: "performance", incident_type: "model_error" },
  { title: "Décision de crédit contestée par client", severity: "high", status: "closed", month: 1, category: "bias", incident_type: "unfair_outcome" },
  { title: "Indisponibilité du service de recommandation", severity: "low", status: "closed", month: 2, category: "availability", incident_type: "service_outage" },
  { title: "Dérive du modèle de fraude détectée", severity: "critical", status: "resolved", month: 2, category: "performance", incident_type: "model_drift" },
  { title: "Résultat inexact analyse sentiments", severity: "low", status: "closed", month: 2, category: "performance", incident_type: "model_error" },
  { title: "Accès non autorisé aux logs ML", severity: "high", status: "closed", month: 3, category: "security", incident_type: "unauthorized_access" },
  { title: "Données d'entraînement corrompues", severity: "medium", status: "closed", month: 3, category: "data_quality", incident_type: "data_corruption" },
  { title: "Violation RGPD dans le pipeline NLP", severity: "critical", status: "closed", month: 3, category: "compliance", incident_type: "regulatory_violation" },
  { title: "Panne du modèle de vision industrielle", severity: "medium", status: "closed", month: 4, category: "availability", incident_type: "service_outage" },
  { title: "Biais de genre détecté recommandation RH", severity: "high", status: "closed", month: 4, category: "bias", incident_type: "bias_discrimination" },
  { title: "Latence excessive chatbot client", severity: "low", status: "closed", month: 4, category: "performance", incident_type: "performance_degradation" },
  { title: "Faux positifs excessifs détection fraude", severity: "medium", status: "closed", month: 5, category: "performance", incident_type: "model_error" },
  { title: "Problème de consentement collecte données", severity: "high", status: "closed", month: 5, category: "compliance", incident_type: "regulatory_violation" },
  { title: "Défaillance du monitoring en production", severity: "low", status: "closed", month: 5, category: "availability", incident_type: "service_outage" },
];

export const DEMO_INCIDENTS: Incident[] = incidentRows.map((r, i) => ({
  ...incidentBase,
  id: demoId(100 + i),
  title: r.title,
  severity: r.severity,
  status: r.status,
  category: r.category,
  incident_type: r.incident_type,
  description: r.title,
  detected_at: monthsAgo(r.month),
  created_at: monthsAgo(r.month),
  updated_at: daysAgo(r.month * 5),
}));

/* ------------------------------------------------------------------ */
/*  Compliance Scores                                                  */
/* ------------------------------------------------------------------ */

export const DEMO_COMPLIANCE_SCORES = {
  frameworks: [
    { framework: "loi25" as const, score: 78, total: 45, compliant: 28, partial: 7, nonCompliant: 5, notApplicable: 5 },
    { framework: "euai" as const, score: 65, total: 62, compliant: 32, partial: 8, nonCompliant: 14, notApplicable: 8 },
    { framework: "nist_ai_rmf" as const, score: 72, total: 50, compliant: 30, partial: 6, nonCompliant: 8, notApplicable: 6 },
    { framework: "iso42001" as const, score: 58, total: 38, compliant: 18, partial: 4, nonCompliant: 10, notApplicable: 6 },
    { framework: "rgpd" as const, score: 85, total: 55, compliant: 40, partial: 7, nonCompliant: 3, notApplicable: 5 },
  ],
  global: 72,
};

/* ------------------------------------------------------------------ */
/*  Decisions (8)                                                      */
/* ------------------------------------------------------------------ */

const decisionBase = {
  organization_id: ORG_ID,
  ai_system_ids: [],
  context: null,
  options_considered: null,
  decision_made: null,
  justification: null,
  residual_risks: null,
  conditions: null,
  impact: null,
  effective_date: null,
  review_date: null,
  risk_assessment_id: null,
  incident_id: null,
  requester_id: null,
  approver_ids: [],
  rejection_reason: null,
  approved_at: null,
  implemented_at: null,
  created_by: null,
  updated_by: null,
} satisfies Partial<Decision>;

const decisionRows: { title: string; decision_type: string; status: string; daysAgo: number }[] = [
  { title: "Déploiement chatbot client en production", decision_type: "go_nogo", status: "submitted", daysAgo: 1 },
  { title: "Changement de fournisseur modèle NLP", decision_type: "vendor_change", status: "in_review", daysAgo: 3 },
  { title: "Suspension temporaire scoring crédit v2", decision_type: "suspension", status: "approved", daysAgo: 5 },
  { title: "Mise à l'échelle détection fraude", decision_type: "scale_deployment", status: "implemented", daysAgo: 10 },
  { title: "Exception RGPD pour pipeline analytique", decision_type: "exception", status: "approved", daysAgo: 15 },
  { title: "Arbitrage éthique — biais genre RH", decision_type: "ethical_arbitration", status: "approved", daysAgo: 20 },
  { title: "Ajustement politique de monitoring", decision_type: "policy_adjustment", status: "implemented", daysAgo: 30 },
  { title: "Changement substantiel modèle de fraude", decision_type: "substantial_change", status: "rejected", daysAgo: 35 },
];

export const DEMO_DECISIONS: Decision[] = decisionRows.map((r, i) => ({
  ...decisionBase,
  id: demoId(200 + i),
  title: r.title,
  decision_type: r.decision_type,
  status: r.status,
  created_at: daysAgo(r.daysAgo),
  updated_at: daysAgo(Math.max(0, r.daysAgo - 2)),
}));

/* ------------------------------------------------------------------ */
/*  Bias Findings (7)                                                  */
/* ------------------------------------------------------------------ */

const biasBase = {
  organization_id: ORG_ID,
  ai_system_id: demoId(1),
  detection_method: "statistical_test",
  protected_dimensions: [],
  affected_groups: null,
  likelihood: null,
  estimated_impact: null,
  affected_count: null,
  fairness_metric: null,
  measured_value: null,
  acceptable_threshold: null,
  remediation_measures: [],
  remediation_description: null,
  remediation_responsible_id: null,
  remediation_target_date: null,
  remediation_retest_result: null,
  remediation_resolved_at: null,
  decision_id: null,
  detected_by: null,
  created_by: null,
  updated_by: null,
} satisfies Partial<BiasFinding>;

const biasRows: { title: string; bias_type: string; severity: string; status: string; daysAgo: number }[] = [
  { title: "Discrimination âge dans le scoring crédit", bias_type: "age_discrimination", severity: "critical", status: "identified", daysAgo: 2 },
  { title: "Biais de genre dans recommandations RH", bias_type: "gender_bias", severity: "high", status: "in_remediation", daysAgo: 8 },
  { title: "Sous-représentation régionale dans le modèle NLP", bias_type: "geographic_bias", severity: "medium", status: "in_remediation", daysAgo: 15 },
  { title: "Biais socioéconomique détection fraude", bias_type: "socioeconomic_bias", severity: "high", status: "identified", daysAgo: 5 },
  { title: "Biais linguistique dans l'analyse sentiments", bias_type: "language_bias", severity: "low", status: "resolved", daysAgo: 30 },
  { title: "Disparité ethnique dans la vision industrielle", bias_type: "racial_bias", severity: "critical", status: "in_remediation", daysAgo: 10 },
  { title: "Biais de confirmation dans les recommandations", bias_type: "confirmation_bias", severity: "medium", status: "resolved", daysAgo: 45 },
];

export const DEMO_BIAS_FINDINGS: BiasFinding[] = biasRows.map((r, i) => ({
  ...biasBase,
  id: demoId(300 + i),
  title: r.title,
  bias_type: r.bias_type,
  severity: r.severity,
  status: r.status,
  detected_at: daysAgo(r.daysAgo),
  created_at: daysAgo(r.daysAgo),
  updated_at: daysAgo(Math.max(0, r.daysAgo - 1)),
}));
