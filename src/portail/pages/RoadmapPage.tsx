import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Shield,
  AlertTriangle,
  Scale,
  FileText,
  BarChart3,
  Eye,
  Recycle,
  Building2,
  FolderOpen,
  Activity,
  Database,
  CheckCircle,
  Clock,
  Send,
  Archive,
  Cpu,
  ArrowRight,
  Sparkles,
  BookOpenCheck,
  Newspaper,
  BookOpen,
  Library,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const availableModules: { icon: LucideIcon; key: string }[] = [
  { icon: Bot, key: "aiSystems" },
  { icon: Shield, key: "risks" },
  { icon: AlertTriangle, key: "incidents" },
  { icon: Scale, key: "governance" },
  { icon: FileText, key: "decisions" },
  { icon: CheckCircle, key: "compliance" },
  { icon: BarChart3, key: "bias" },
  { icon: Eye, key: "transparency" },
  { icon: Recycle, key: "lifecycle" },
  { icon: Building2, key: "vendors" },
  { icon: FolderOpen, key: "documents" },
  { icon: Activity, key: "monitoring" },
  { icon: Database, key: "data" },
  { icon: Newspaper, key: "veille" },
  { icon: BookOpen, key: "bibliotheque" },
  { icon: Library, key: "modeles" },
  { icon: Cpu, key: "agents" },
];

const upcomingFeatures: {
  icon: LucideIcon;
  key: string;
  color: string;
  bgColor: string;
  borderAccent: string;
}[] = [
  {
    icon: Send,
    key: "vendorQuestionnaire",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderAccent: "hover:border-blue-200",
  },
  {
    icon: Archive,
    key: "documentDrive",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderAccent: "hover:border-amber-200",
  },
  {
    icon: BookOpenCheck,
    key: "legalChat",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderAccent: "hover:border-teal-200",
  },
  {
    icon: Cpu,
    key: "mcpServer",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderAccent: "hover:border-emerald-200",
  },
];

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function RoadmapPage() {
  const { t } = useTranslation("roadmap");

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-forest/10">
          <Sparkles className="h-5 w-5 text-brand-forest" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("pageSubtitle")}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 1 — Already available                                */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t("available.title")}</h2>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            {t("available.badge", { count: availableModules.length })}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {availableModules.map((mod) => (
            <Card key={mod.key} className="group border-border/60 hover:shadow-sm hover:border-emerald-200/60 transition-all duration-300">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <mod.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{t(`modules.${mod.key}.title`)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(`modules.${mod.key}.description`)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — Coming soon                                      */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest/10">
            <Clock className="h-4 w-4 text-brand-forest" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t("upcoming.title")}</h2>
          <Badge variant="secondary" className="bg-brand-forest/10 text-brand-forest border-brand-forest/20 text-xs">
            {t("upcoming.badge")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {upcomingFeatures.map((feature) => (
            <Card
              key={feature.key}
              className={`group border-2 border-dashed border-border/60 ${feature.borderAccent} transition-all duration-300 relative overflow-hidden`}
            >
              <CardHeader className="pb-3">
                <Badge variant="outline" className="absolute top-4 right-4 text-[11px] font-medium">
                  {t("upcoming.tag")}
                </Badge>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color} mb-3`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base pr-16 leading-snug">{t(`features.${feature.key}.title`)}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-5">
                <ul className="space-y-2.5">
                  {[1, 2, 3, 4].map((n) => (
                    <li key={n} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand-forest/50" />
                      <span className="leading-tight">{t(`features.${feature.key}.bullet${n}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — CTA                                              */}
      {/* ============================================================ */}
      <Card className="bg-muted/40 border-dashed border-border/60">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold text-foreground">{t("cta.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("cta.subtitle")}
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2 shadow-sm">
            <Link to="/contact">
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
