import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/hooks/useOrganization";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertTriangle, CheckCircle, AlertCircle, Building2 } from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { profile } = useAuth();
  const { data: org, isLoading } = useOrganization();

  const firstName = profile?.full_name?.split(" ")[0] ?? t("welcomeFallback");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile?.organization_id || !org) {
    return (
      <EmptyState
        icon={Building2}
        title={t("noOrg")}
        description={t("noOrgDescription")}
      />
    );
  }

  const statCards = [
    { key: "aiSystems", icon: Bot, value: "—", path: "/ai-systems" },
    { key: "complianceScore", icon: CheckCircle, value: "—", path: "/compliance" },
    { key: "activeIncidents", icon: AlertCircle, value: "—", path: "/incidents" },
    { key: "pendingAlerts", icon: AlertTriangle, value: "—", path: "/monitoring" },
  ];

  const quickModules = [
    { key: "aiSystems", icon: Bot, path: "/ai-systems" },
    { key: "risks", icon: AlertTriangle, path: "/risks" },
    { key: "compliance", icon: CheckCircle, path: "/compliance" },
    { key: "incidents", icon: AlertCircle, path: "/incidents" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("welcome", { firstName })}
        description={t("description")}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.key} to={stat.path}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{t(`stats.${stat.key}`)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{t("quickAccess")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.key} to={mod.path}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-purple" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm">{t(`modules.${mod.key}.title`)}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`modules.${mod.key}.description`)}
                    </p>
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
