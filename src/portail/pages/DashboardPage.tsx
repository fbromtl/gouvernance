import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/hooks/useOrganization";
import { useAiSystems } from "@/hooks/useAiSystems";
import { useIncidents } from "@/hooks/useIncidents";
import { useComplianceScores } from "@/hooks/useCompliance";
import { useDecisions } from "@/hooks/useDecisions";
import { useBiasFindings } from "@/hooks/useBiasFindings";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHelpButton } from "@/components/shared/SectionHelpButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Building2,
  ShieldAlert,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  FlaskConical,
} from "lucide-react";

// Dashboard widgets
import DiagnosticResultWidget from "@/portail/components/dashboard/DiagnosticResultWidget";
import RiskDistributionChart from "@/portail/components/dashboard/RiskDistributionChart";
import { ComplianceRadarChart } from "@/portail/components/dashboard/ComplianceRadarChart";
import { IncidentTimelineChart } from "@/portail/components/dashboard/IncidentTimelineChart";
import SystemsByTypeChart from "@/portail/components/dashboard/SystemsByTypeChart";
import TopRiskSystemsTable from "@/portail/components/dashboard/TopRiskSystemsTable";
import PendingActionsWidget from "@/portail/components/dashboard/PendingActionsWidget";
import ReviewsDueWidget from "@/portail/components/dashboard/ReviewsDueWidget";
import RecentDecisionsWidget from "@/portail/components/dashboard/RecentDecisionsWidget";
import BiasDebtWidget from "@/portail/components/dashboard/BiasDebtWidget";

// Demo data
import {
  DEMO_AI_SYSTEMS,
  DEMO_INCIDENTS,
  DEMO_COMPLIANCE_SCORES,
  DEMO_DECISIONS,
  DEMO_BIAS_FINDINGS,
} from "@/portail/components/dashboard/demo-data";

/* ------------------------------------------------------------------ */
/*  Demo-mode persistence                                              */
/* ------------------------------------------------------------------ */
const DEMO_KEY = "gouvernance:dashboard:demo";

function readDemo(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { profile } = useAuth();
  const { data: org, isLoading } = useOrganization();

  // Demo mode state (persisted in localStorage)
  const [demo, setDemo] = useState(readDemo);
  const toggleDemo = useCallback((checked: boolean) => {
    setDemo(checked);
    try { localStorage.setItem(DEMO_KEY, checked ? "1" : "0"); } catch { /* noop */ }
  }, []);

  // Live data from all modules
  const { data: liveAiSystems = [] } = useAiSystems();
  const { data: liveIncidents = [] } = useIncidents();
  const { data: liveComplianceScores } = useComplianceScores();
  const { data: liveDecisions = [] } = useDecisions();
  const { data: liveBiasFindings = [] } = useBiasFindings();

  // Use demo data when toggle is ON
  const aiSystems = demo ? DEMO_AI_SYSTEMS : liveAiSystems;
  const incidents = demo ? DEMO_INCIDENTS : liveIncidents;
  const complianceScores = demo ? DEMO_COMPLIANCE_SCORES : liveComplianceScores;
  const decisions = demo ? DEMO_DECISIONS : liveDecisions;
  const biasFindings = demo ? DEMO_BIAS_FINDINGS : liveBiasFindings;

  const firstName = profile?.full_name?.split(" ")[0] ?? t("welcomeFallback");

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Skeleton header */}
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-72 bg-muted/60 animate-pulse rounded-lg" />
        </div>
        {/* Skeleton KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
          <div className="h-80 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
          <div className="h-64 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
        </div>
      </div>
    );
  }

  if (!demo && (!profile?.organization_id || !org)) {
    return (
      <EmptyState
        icon={Building2}
        title={t("noOrg")}
        description={t("noOrgDescription")}
      />
    );
  }

  // Compute KPIs from live data
  const productionSystems = aiSystems.filter((s) => s.lifecycle_status === "production").length;
  const activeIncidents = incidents.filter((i) => !["closed", "resolved", "post_mortem"].includes(i.status)).length;
  const highRiskSystems = aiSystems.filter((s) => s.risk_level === "critical" || s.risk_level === "high").length;
  const complianceValue = complianceScores ? complianceScores.global : null;

  const statCards = [
    {
      key: "aiSystems",
      icon: Bot,
      value: String(productionSystems),
      path: "/ai-systems",
      color: "text-brand-purple",
      bgColor: "bg-brand-purple/10",
      trend: null as null | "up" | "down" | "neutral",
    },
    {
      key: "complianceScore",
      icon: CheckCircle,
      value: complianceValue !== null ? `${complianceValue}%` : "\u2014",
      path: "/compliance",
      color: complianceValue !== null && complianceValue >= 70 ? "text-emerald-600" : "text-amber-600",
      bgColor: complianceValue !== null && complianceValue >= 70 ? "bg-emerald-50" : "bg-amber-50",
      trend: complianceValue !== null ? (complianceValue >= 70 ? ("up" as const) : ("down" as const)) : null,
    },
    {
      key: "activeIncidents",
      icon: AlertCircle,
      value: String(activeIncidents),
      path: "/incidents",
      color: activeIncidents > 0 ? "text-red-600" : "text-emerald-600",
      bgColor: activeIncidents > 0 ? "bg-red-50" : "bg-emerald-50",
      trend: activeIncidents > 0 ? ("down" as const) : ("neutral" as const),
    },
    {
      key: "pendingAlerts",
      icon: AlertTriangle,
      value: String(highRiskSystems),
      path: "/risks",
      color: highRiskSystems > 0 ? "text-amber-600" : "text-emerald-600",
      bgColor: highRiskSystems > 0 ? "bg-amber-50" : "bg-emerald-50",
      trend: null,
    },
  ];

  const TrendIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus };

  const quickModules = [
    { key: "aiSystems", icon: Bot, path: "/ai-systems", count: aiSystems.length, color: "text-brand-purple", bgColor: "bg-brand-purple/10" },
    { key: "risks", icon: ShieldAlert, path: "/risks", count: null, color: "text-amber-600", bgColor: "bg-amber-50" },
    { key: "incidents", icon: AlertCircle, path: "/incidents", count: incidents.length, color: "text-red-600", bgColor: "bg-red-50" },
    { key: "compliance", icon: FileText, path: "/compliance", count: null, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/*  Page Header + Demo Toggle                                       */}
      {/* ================================================================ */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("welcome", { firstName })}
            </h1>
            <SectionHelpButton ns="dashboard" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>

        {/* Demo mode toggle */}
        <div className="flex items-center gap-2.5 shrink-0 pt-1">
          {demo && (
            <Badge className="bg-brand-purple/15 text-brand-purple border-brand-purple/30 text-[10px] font-bold tracking-wider animate-pulse">
              {t("demoBadge")}
            </Badge>
          )}
          <label
            htmlFor="demo-toggle"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <FlaskConical className={`h-4 w-4 transition-colors ${demo ? "text-brand-purple" : "text-muted-foreground/50"}`} />
            <span className={`text-xs font-medium transition-colors ${demo ? "text-brand-purple" : "text-muted-foreground"}`}>
              {t("demoMode")}
            </span>
          </label>
          <Switch
            id="demo-toggle"
            checked={demo}
            onCheckedChange={toggleDemo}
            className="data-[state=checked]:bg-brand-purple"
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Diagnostic Widget (if pending or exists)                         */}
      {/* ================================================================ */}
      <DiagnosticResultWidget />

      {/* ================================================================ */}
      {/*  Row 1 — KPI Cards                                               */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TIcon = stat.trend ? TrendIcon[stat.trend] : null;
          return (
            <Link key={stat.key} to={stat.path}>
              <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    {TIcon && (
                      <TIcon className={`h-4 w-4 ${stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-500" : "text-muted-foreground/40"}`} />
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{t(`stats.${stat.key}`)}</p>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-purple/40 group-hover:w-full transition-all duration-500" />
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/*  Row 2 — Risk distribution + Bias debt + Systems by type         */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RiskDistributionChart data={aiSystems} />
        <BiasDebtWidget findings={biasFindings} />
        <SystemsByTypeChart systems={aiSystems} />
      </div>

      {/* ================================================================ */}
      {/*  Row 3 — Compliance radar (2/3) + Top risk systems (1/3)         */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ComplianceRadarChart frameworks={complianceScores?.frameworks ?? []} />
        </div>
        <TopRiskSystemsTable systems={aiSystems} />
      </div>

      {/* ================================================================ */}
      {/*  Row 4 — Incident timeline (2/3) + Recent decisions (1/3)        */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <IncidentTimelineChart incidents={incidents} />
        </div>
        <RecentDecisionsWidget decisions={decisions} />
      </div>

      {/* ================================================================ */}
      {/*  Row 5 — Pending actions (1/2) + Reviews due (1/2)               */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PendingActionsWidget decisions={decisions} biasFindings={biasFindings} />
        <ReviewsDueWidget systems={aiSystems} />
      </div>

      {/* ================================================================ */}
      {/*  Row 6 — Quick Access                                            */}
      {/* ================================================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{t("quickAccess")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.key} to={mod.path}>
                <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer border-border/60 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`h-10 w-10 rounded-xl ${mod.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${mod.color}`} />
                      </div>
                      {mod.count !== null && (
                        <span className="text-2xl font-bold text-foreground/15 group-hover:text-foreground/35 transition-colors duration-300">
                          {mod.count}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <CardTitle className="text-sm font-semibold">{t(`modules.${mod.key}.title`)}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t(`modules.${mod.key}.description`)}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>{t("viewModule", { defaultValue: "Ouvrir" })}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
