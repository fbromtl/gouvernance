/**
 * Static framework definitions for Module 13 — Compliance Multi-Referentiels
 *
 * Requirements are defined as TypeScript constants, not stored in DB.
 * Only the assessment status per requirement is stored in `compliance_assessments`.
 */

export type FrameworkCode = "loi25" | "euai" | "nist_ai_rmf" | "iso42001" | "rgpd";

export interface FrameworkMeta {
  code: FrameworkCode;
  labelFr: string;
  labelEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

export interface FrameworkRequirement {
  code: string;
  framework: FrameworkCode;
  titleFr: string;
  titleEn: string;
  articleRef?: string;
  moduleSource: string;
}

/* ------------------------------------------------------------------ */
/*  FRAMEWORK META                                                     */
/* ------------------------------------------------------------------ */

export const FRAMEWORK_META: Record<FrameworkCode, FrameworkMeta> = {
  loi25: {
    code: "loi25",
    labelFr: "Loi 25 (Québec)",
    labelEn: "Law 25 (Quebec)",
    descriptionFr: "Protection des renseignements personnels dans le secteur privé",
    descriptionEn: "Private sector personal information protection",
  },
  euai: {
    code: "euai",
    labelFr: "EU AI Act",
    labelEn: "EU AI Act",
    descriptionFr: "Règlement européen sur l'intelligence artificielle",
    descriptionEn: "European regulation on artificial intelligence",
  },
  nist_ai_rmf: {
    code: "nist_ai_rmf",
    labelFr: "NIST AI RMF",
    labelEn: "NIST AI RMF",
    descriptionFr: "Cadre de gestion des risques IA du NIST",
    descriptionEn: "NIST AI Risk Management Framework",
  },
  iso42001: {
    code: "iso42001",
    labelFr: "ISO/IEC 42001",
    labelEn: "ISO/IEC 42001",
    descriptionFr: "Système de management de l'intelligence artificielle",
    descriptionEn: "AI Management System",
  },
  rgpd: {
    code: "rgpd",
    labelFr: "RGPD",
    labelEn: "GDPR",
    descriptionFr: "Règlement général sur la protection des données",
    descriptionEn: "General Data Protection Regulation",
  },
};

export const FRAMEWORK_CODES: FrameworkCode[] = ["loi25", "euai", "nist_ai_rmf", "iso42001", "rgpd"];

/* ------------------------------------------------------------------ */
/*  LOI 25 — 11 requirements                                          */
/* ------------------------------------------------------------------ */

const LOI25_REQUIREMENTS: FrameworkRequirement[] = [
  { code: "L25-01", framework: "loi25", titleFr: "Responsable de la protection des RP désigné", titleEn: "Privacy officer designated", articleRef: "Art. 3.1", moduleSource: "Module 02" },
  { code: "L25-02", framework: "loi25", titleFr: "Politiques et pratiques de gouvernance des RP publiées", titleEn: "Privacy governance policies published", articleRef: "Art. 3.2", moduleSource: "Module 02" },
  { code: "L25-03", framework: "loi25", titleFr: "EFVP réalisée pour les projets impliquant des RP", titleEn: "PIA conducted for projects involving PI", articleRef: "Art. 3.3", moduleSource: "Module 11" },
  { code: "L25-04", framework: "loi25", titleFr: "EFVP avant communication hors Québec", titleEn: "PIA before transfer outside Quebec", articleRef: "Art. 17", moduleSource: "Module 11" },
  { code: "L25-05", framework: "loi25", titleFr: "Registre des incidents de confidentialité tenu", titleEn: "Confidentiality incident registry maintained", articleRef: "Art. 3.5", moduleSource: "Module 06" },
  { code: "L25-06", framework: "loi25", titleFr: "Notification CAI si risque de préjudice sérieux", titleEn: "CAI notification if serious harm risk", articleRef: "Art. 3.5", moduleSource: "Module 06" },
  { code: "L25-07", framework: "loi25", titleFr: "Information des personnes pour décisions automatisées", titleEn: "Information for automated decisions", articleRef: "Art. 12.1", moduleSource: "Module 07" },
  { code: "L25-08", framework: "loi25", titleFr: "Droit d'explication et mécanisme de contestation", titleEn: "Right to explanation and contest mechanism", articleRef: "Art. 12.1", moduleSource: "Module 07" },
  { code: "L25-09", framework: "loi25", titleFr: "Consentement libre et éclairé", titleEn: "Free and informed consent", articleRef: "Art. 14", moduleSource: "Module 11" },
  { code: "L25-10", framework: "loi25", titleFr: "Conservation limitée et destruction documentée", titleEn: "Limited retention and documented destruction", articleRef: "Art. 23", moduleSource: "Module 11" },
  { code: "L25-11", framework: "loi25", titleFr: "Formation du personnel", titleEn: "Staff training", articleRef: "Art. 3.2", moduleSource: "Module 02" },
];

/* ------------------------------------------------------------------ */
/*  EU AI ACT — 13 requirements                                       */
/* ------------------------------------------------------------------ */

const EUAI_REQUIREMENTS: FrameworkRequirement[] = [
  { code: "EUAI-01", framework: "euai", titleFr: "Classification des systèmes par risque", titleEn: "System risk classification", articleRef: "Art. 6", moduleSource: "Module 03" },
  { code: "EUAI-02", framework: "euai", titleFr: "Système de gestion des risques", titleEn: "Risk management system", articleRef: "Art. 9", moduleSource: "Module 03" },
  { code: "EUAI-03", framework: "euai", titleFr: "Gouvernance des données", titleEn: "Data governance", articleRef: "Art. 10", moduleSource: "Module 11" },
  { code: "EUAI-04", framework: "euai", titleFr: "Documentation technique", titleEn: "Technical documentation", articleRef: "Art. 11, Annexe IV", moduleSource: "Module 09" },
  { code: "EUAI-05", framework: "euai", titleFr: "Tenue de logs automatiques", titleEn: "Automatic logging", articleRef: "Art. 12", moduleSource: "Module 04, 15" },
  { code: "EUAI-06", framework: "euai", titleFr: "Transparence et information", titleEn: "Transparency and information", articleRef: "Art. 13", moduleSource: "Module 07" },
  { code: "EUAI-07", framework: "euai", titleFr: "Surveillance humaine", titleEn: "Human oversight", articleRef: "Art. 14", moduleSource: "Module 04, 07" },
  { code: "EUAI-08", framework: "euai", titleFr: "Exactitude, robustesse, cybersécurité", titleEn: "Accuracy, robustness, cybersecurity", articleRef: "Art. 15", moduleSource: "Module 10" },
  { code: "EUAI-09", framework: "euai", titleFr: "Enregistrement dans la base de données UE", titleEn: "EU database registration", articleRef: "Art. 49", moduleSource: "Module 01" },
  { code: "EUAI-10", framework: "euai", titleFr: "Monitoring post-marché", titleEn: "Post-market monitoring", articleRef: "Art. 72", moduleSource: "Module 10" },
  { code: "EUAI-11", framework: "euai", titleFr: "Notification des incidents graves", titleEn: "Serious incident notification", articleRef: "Art. 62", moduleSource: "Module 06" },
  { code: "EUAI-12", framework: "euai", titleFr: "FRIA déployers", titleEn: "Deployer FRIA", articleRef: "Art. 27", moduleSource: "Module 03" },
  { code: "EUAI-13", framework: "euai", titleFr: "Obligations de transparence GenAI", titleEn: "GenAI transparency obligations", articleRef: "Art. 50", moduleSource: "Module 07" },
];

/* ------------------------------------------------------------------ */
/*  NIST AI RMF — 4 functions                                         */
/* ------------------------------------------------------------------ */

const NIST_REQUIREMENTS: FrameworkRequirement[] = [
  { code: "NIST-GOV", framework: "nist_ai_rmf", titleFr: "GOVERN — Politiques, rôles, culture, parties prenantes", titleEn: "GOVERN — Policies, roles, culture, stakeholders", moduleSource: "Module 02" },
  { code: "NIST-MAP", framework: "nist_ai_rmf", titleFr: "MAP — Contexte, exigences, risques, impacts", titleEn: "MAP — Context, requirements, risks, impacts", moduleSource: "Module 01, 03" },
  { code: "NIST-MEA", framework: "nist_ai_rmf", titleFr: "MEASURE — Méthodes, évaluation, surveillance", titleEn: "MEASURE — Methods, evaluation, monitoring", moduleSource: "Module 05, 10" },
  { code: "NIST-MAN", framework: "nist_ai_rmf", titleFr: "MANAGE — Allocation risques, planification, communication", titleEn: "MANAGE — Risk allocation, planning, communication", moduleSource: "Module 04, 06, 09" },
];

/* ------------------------------------------------------------------ */
/*  ISO/IEC 42001 — 7 clauses                                         */
/* ------------------------------------------------------------------ */

const ISO42001_REQUIREMENTS: FrameworkRequirement[] = [
  { code: "ISO-C4", framework: "iso42001", titleFr: "Contexte de l'organisation", titleEn: "Context of the organization", articleRef: "Clause 4", moduleSource: "Module 01" },
  { code: "ISO-C5", framework: "iso42001", titleFr: "Leadership et engagement", titleEn: "Leadership and commitment", articleRef: "Clause 5", moduleSource: "Module 02" },
  { code: "ISO-C6", framework: "iso42001", titleFr: "Planification (risques et objectifs)", titleEn: "Planning (risks and objectives)", articleRef: "Clause 6", moduleSource: "Module 03" },
  { code: "ISO-C7", framework: "iso42001", titleFr: "Support (ressources, compétences, communication)", titleEn: "Support (resources, competences, communication)", articleRef: "Clause 7", moduleSource: "Module 02" },
  { code: "ISO-C8", framework: "iso42001", titleFr: "Opérations (planification, évaluation d'impact)", titleEn: "Operations (planning, impact assessment)", articleRef: "Clause 8", moduleSource: "Module 03, 08, 11" },
  { code: "ISO-C9", framework: "iso42001", titleFr: "Évaluation des performances", titleEn: "Performance evaluation", articleRef: "Clause 9", moduleSource: "Module 10, 14" },
  { code: "ISO-C10", framework: "iso42001", titleFr: "Amélioration continue", titleEn: "Continual improvement", articleRef: "Clause 10", moduleSource: "Module 06, 08" },
];

/* ------------------------------------------------------------------ */
/*  RGPD/GDPR — 7 requirements                                        */
/* ------------------------------------------------------------------ */

const RGPD_REQUIREMENTS: FrameworkRequirement[] = [
  { code: "RGPD-01", framework: "rgpd", titleFr: "Base légale du traitement", titleEn: "Legal basis for processing", articleRef: "Art. 6", moduleSource: "Module 11" },
  { code: "RGPD-02", framework: "rgpd", titleFr: "Consentement", titleEn: "Consent", articleRef: "Art. 7", moduleSource: "Module 11" },
  { code: "RGPD-03", framework: "rgpd", titleFr: "Droits des personnes", titleEn: "Data subject rights", articleRef: "Art. 15-22", moduleSource: "Module 07" },
  { code: "RGPD-04", framework: "rgpd", titleFr: "DPIA", titleEn: "DPIA", articleRef: "Art. 35", moduleSource: "Module 11" },
  { code: "RGPD-05", framework: "rgpd", titleFr: "Notification de violation", titleEn: "Breach notification", articleRef: "Art. 33-34", moduleSource: "Module 06" },
  { code: "RGPD-06", framework: "rgpd", titleFr: "DPO désigné", titleEn: "DPO designated", articleRef: "Art. 37", moduleSource: "Module 02" },
  { code: "RGPD-07", framework: "rgpd", titleFr: "Transferts internationaux", titleEn: "International transfers", articleRef: "Art. 44-49", moduleSource: "Module 11" },
];

/* ------------------------------------------------------------------ */
/*  AGGREGATED                                                         */
/* ------------------------------------------------------------------ */

export const REQUIREMENTS_BY_FRAMEWORK: Record<FrameworkCode, FrameworkRequirement[]> = {
  loi25: LOI25_REQUIREMENTS,
  euai: EUAI_REQUIREMENTS,
  nist_ai_rmf: NIST_REQUIREMENTS,
  iso42001: ISO42001_REQUIREMENTS,
  rgpd: RGPD_REQUIREMENTS,
};

export const ALL_REQUIREMENTS: FrameworkRequirement[] = [
  ...LOI25_REQUIREMENTS,
  ...EUAI_REQUIREMENTS,
  ...NIST_REQUIREMENTS,
  ...ISO42001_REQUIREMENTS,
  ...RGPD_REQUIREMENTS,
];

/* ------------------------------------------------------------------ */
/*  SCORE COMPUTATION                                                  */
/* ------------------------------------------------------------------ */

export type ComplianceStatus = "compliant" | "partially_compliant" | "non_compliant" | "not_applicable";

export interface FrameworkScore {
  framework: FrameworkCode;
  score: number; // 0-100
  total: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  notApplicable: number;
}

export function computeFrameworkScore(
  statuses: ComplianceStatus[]
): FrameworkScore & { framework: FrameworkCode } {
  const total = statuses.length;
  const compliant = statuses.filter((s) => s === "compliant").length;
  const partial = statuses.filter((s) => s === "partially_compliant").length;
  const nonCompliant = statuses.filter((s) => s === "non_compliant").length;
  const notApplicable = statuses.filter((s) => s === "not_applicable").length;
  const applicable = total - notApplicable;

  const score = applicable > 0 ? Math.round(((compliant + partial * 0.5) / applicable) * 100) : 0;

  return {
    framework: "loi25", // placeholder, caller should set this
    score,
    total,
    compliant,
    partial,
    nonCompliant,
    notApplicable,
  };
}

export function computeGlobalScore(frameworkScores: FrameworkScore[]): number {
  const active = frameworkScores.filter((f) => f.total > 0);
  if (active.length === 0) return 0;
  const sum = active.reduce((acc, f) => acc + f.score, 0);
  return Math.round(sum / active.length);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 50) return "#eab308"; // yellow
  return "#ef4444"; // red
}

export function getScoreLabel(score: number, lang: "fr" | "en" = "fr"): string {
  if (lang === "en") {
    if (score >= 80) return "Compliant";
    if (score >= 50) return "Needs improvement";
    return "Critical";
  }
  if (score >= 80) return "Conforme";
  if (score >= 50) return "À améliorer";
  return "Critique";
}
