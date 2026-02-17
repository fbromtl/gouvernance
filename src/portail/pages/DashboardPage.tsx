import {
  LayoutDashboard,
  Target,
  BookOpen,
  User,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  CARDS DATA                                                         */
/* ------------------------------------------------------------------ */

const quickActions = [
  {
    to: "/portail/diagnostic",
    icon: Target,
    titleKey: "actions.diagnostic.title",
    descriptionKey: "actions.diagnostic.description",
    color: "bg-violet-50 text-violet-600",
    borderColor: "border-violet-200",
  },
  {
    to: "/portail/resultats",
    icon: BookOpen,
    titleKey: "actions.results.title",
    descriptionKey: "actions.results.description",
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    to: "/portail/profil",
    icon: User,
    titleKey: "actions.profile.title",
    descriptionKey: "actions.profile.description",
    color: "bg-amber-50 text-amber-600",
    borderColor: "border-amber-200",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { t } = useTranslation("dashboard");

  const firstName =
    (profile?.full_name ?? user?.user_metadata?.full_name ?? "")
      .split(" ")[0] || t("welcomeFallback");

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1e1a30] p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-sm font-medium text-white/70">{t("title")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("welcome", { firstName })} 👋
          </h1>
          <p className="mt-2 text-white/70 max-w-xl">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("quickAccess")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`group flex flex-col rounded-2xl border ${action.borderColor} bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${action.color} mb-4`}
              >
                <action.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {t(action.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground flex-1">
                {t(action.descriptionKey)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-purple group-hover:gap-2 transition-all">
                {t("common:access")} <ArrowRight className="size-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder stats */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("statistics")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { labelKey: "stats.diagnosticsCompleted", value: "—" },
            { labelKey: "stats.averageScore", value: "—" },
            { labelKey: "stats.recommendations", value: "—" },
            { labelKey: "stats.resourcesViewed", value: "—" },
          ].map((stat) => (
            <div
              key={stat.labelKey}
              className="rounded-2xl border border-border/50 bg-card p-5"
            >
              <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
