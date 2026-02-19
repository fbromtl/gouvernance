import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ------------------------------------------------------------------ */
/*  Static map : route segment → i18n namespace                        */
/* ------------------------------------------------------------------ */

const ROUTE_NS_MAP: Record<string, string> = {
  dashboard: "dashboard",
  "ai-systems": "aiSystems",
  risks: "riskAssessments",
  incidents: "incidents",
  governance: "governance",
  decisions: "decisions",
  compliance: "compliance",
  bias: "bias",
  transparency: "transparency",
  lifecycle: "lifecycle",
  vendors: "vendors",
  documents: "documents",
  monitoring: "monitoring",
  data: "data",
  admin: "admin",
  profile: "profil",
};

export interface PageContext {
  namespace: string;
  pageTitle: string;
  pageDescription: string;
  pathname: string;
  language: string;
}

/**
 * Detects the current portal page and returns its i18n context.
 * Handles both `pageTitle`/`pageDescription` and `title`/`description` patterns.
 */
export function usePageContext(): PageContext {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  // Extract first path segment after /
  const segments = pathname.replace(/^\/+/, "").split("/");
  const firstSegment = segments[0] ?? "dashboard";
  const namespace = ROUTE_NS_MAP[firstSegment] ?? "dashboard";

  // Try both i18n key patterns used across modules
  const pageTitle =
    i18n.t(`${namespace}:pageTitle`, { defaultValue: "" }) ||
    i18n.t(`${namespace}:title`, { defaultValue: "" }) ||
    firstSegment;

  const pageDescription =
    i18n.t(`${namespace}:pageDescription`, { defaultValue: "" }) ||
    i18n.t(`${namespace}:description`, { defaultValue: "" }) ||
    "";

  return {
    namespace,
    pageTitle,
    pageDescription,
    pathname,
    language: i18n.language,
  };
}
