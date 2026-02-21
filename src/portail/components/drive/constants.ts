import {
  Shield, FileCheck, ClipboardCheck, Truck, BarChart3,
  Database, GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Category / subcategory taxonomy for the document drive             */
/* ------------------------------------------------------------------ */

export interface SubCategory {
  key: string;
  labelKey: string;          // i18n key inside "drive.subcategories.*"
}

export interface Category {
  key: string;
  labelKey: string;          // i18n key inside "drive.categories.*"
  icon: LucideIcon;
  subcategories: SubCategory[];
}

export const DRIVE_CATEGORIES: Category[] = [
  {
    key: "policies",
    labelKey: "policies",
    icon: Shield,
    subcategories: [
      { key: "ai_governance",      labelKey: "ai_governance" },
      { key: "data_protection",    labelKey: "data_protection" },
      { key: "ai_ethics",          labelKey: "ai_ethics" },
      { key: "security",           labelKey: "security" },
      { key: "risk_management",    labelKey: "risk_management" },
    ],
  },
  {
    key: "compliance",
    labelKey: "compliance",
    icon: FileCheck,
    subcategories: [
      { key: "eu_ai_act",          labelKey: "eu_ai_act" },
      { key: "gdpr_law25",         labelKey: "gdpr_law25" },
      { key: "iso_27001",          labelKey: "iso_27001" },
      { key: "soc2",               labelKey: "soc2" },
      { key: "other_regulation",   labelKey: "other_regulation" },
    ],
  },
  {
    key: "assessments",
    labelKey: "assessments",
    icon: ClipboardCheck,
    subcategories: [
      { key: "risk_assessments",   labelKey: "risk_assessments" },
      { key: "internal_audits",    labelKey: "internal_audits" },
      { key: "external_audits",    labelKey: "external_audits" },
      { key: "efvp",               labelKey: "efvp" },
      { key: "bias_tests",         labelKey: "bias_tests" },
    ],
  },
  {
    key: "vendors",
    labelKey: "vendors",
    icon: Truck,
    subcategories: [
      { key: "contracts",          labelKey: "contracts" },
      { key: "certifications",     labelKey: "certifications" },
      { key: "security_questionnaires", labelKey: "security_questionnaires" },
      { key: "sla",                labelKey: "sla" },
    ],
  },
  {
    key: "reports",
    labelKey: "reports",
    icon: BarChart3,
    subcategories: [
      { key: "compliance_reports", labelKey: "compliance_reports" },
      { key: "incident_reports",   labelKey: "incident_reports" },
      { key: "monitoring_reports", labelKey: "monitoring_reports" },
      { key: "ai_system_cards",    labelKey: "ai_system_cards" },
    ],
  },
  {
    key: "data_privacy",
    labelKey: "data_privacy",
    icon: Database,
    subcategories: [
      { key: "processing_registry", labelKey: "processing_registry" },
      { key: "consents",            labelKey: "consents" },
      { key: "data_flows",          labelKey: "data_flows" },
      { key: "pia",                 labelKey: "pia" },
    ],
  },
  {
    key: "training",
    labelKey: "training",
    icon: GraduationCap,
    subcategories: [
      { key: "training_materials", labelKey: "training_materials" },
      { key: "employee_certs",     labelKey: "employee_certs" },
      { key: "user_guides",        labelKey: "user_guides" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Get a flat list of all category keys */
export const CATEGORY_KEYS = DRIVE_CATEGORIES.map((c) => c.key);

/** Get subcategory keys for a given category */
export function getSubcategories(categoryKey: string): SubCategory[] {
  return DRIVE_CATEGORIES.find((c) => c.key === categoryKey)?.subcategories ?? [];
}

/** Get category object by key */
export function getCategoryByKey(key: string): Category | undefined {
  return DRIVE_CATEGORIES.find((c) => c.key === key);
}

/* ------------------------------------------------------------------ */
/*  File type helpers                                                  */
/* ------------------------------------------------------------------ */

export const FILE_TYPE_ICONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
  "text/csv": "csv",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function getFileExtension(mimeType: string | null): string {
  if (!mimeType) return "file";
  return FILE_TYPE_ICONS[mimeType] ?? "file";
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
