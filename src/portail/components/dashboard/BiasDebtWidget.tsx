import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
import { SEVERITY_COLORS } from "./chart-theme";
import type { BiasFinding } from "@/types/database";

interface BiasDebtWidgetProps {
  findings: BiasFinding[];
}

type Severity = "critical" | "high" | "medium" | "low";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

const CLOSED_STATUSES = new Set(["resolved", "accepted_risk"]);

export default function BiasDebtWidget({ findings }: BiasDebtWidgetProps) {
  const { t } = useTranslation("dashboard");

  const { total, bySeverity } = useMemo(() => {
    const counts: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    let openCount = 0;

    for (const f of findings) {
      if (CLOSED_STATUSES.has(f.status)) continue;
      openCount++;
      const sev = f.severity as Severity;
      if (sev in counts) {
        counts[sev]++;
      }
    }

    return { total: openCount, bySeverity: counts };
  }, [findings]);

  return (
    <PortalCard>
      <PortalCardHeader>
        {t("widgets.biasDebt")}
      </PortalCardHeader>
      <div>
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-4xl font-bold text-neutral-900">0</p>
            <p className="text-sm text-neutral-500 mt-1">
              Aucun biais ouvert
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Large total count */}
            <div className="text-center">
              <p className="text-4xl font-bold text-neutral-900">{total}</p>
              <p className="text-sm text-neutral-500 mt-1">
                {t("widgets.openFindings")}
              </p>
            </div>

            {/* Severity pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SEVERITY_ORDER.map((sev) => (
                <div
                  key={sev}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[sev] }}
                  />
                  <span className="text-neutral-500">
                    {SEVERITY_LABELS[sev]}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {bySeverity[sev]}
                  </span>
                </div>
              ))}
            </div>

            {/* Stacked bar */}
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              {SEVERITY_ORDER.map((sev) => {
                const count = bySeverity[sev];
                if (count === 0) return null;
                const pct = (count / total) * 100;

                return (
                  <div
                    key={sev}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: SEVERITY_COLORS[sev],
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PortalCard>
  );
}
