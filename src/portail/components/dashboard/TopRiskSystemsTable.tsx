import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopRiskSystemsTableProps {
  systems: {
    id: string;
    name: string;
    risk_score: number;
    risk_level: string;
    lifecycle_status: string;
  }[];
}

function scoreColorClass(score: number): string {
  if (score > 75) return "text-red-600";
  if (score > 50) return "text-orange-600";
  if (score > 25) return "text-amber-600";
  return "text-emerald-600";
}

export default function TopRiskSystemsTable({ systems }: TopRiskSystemsTableProps) {
  const { t } = useTranslation("dashboard");
  const { t: tSystems } = useTranslation("aiSystems");

  const top5 = useMemo(
    () =>
      [...systems]
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5),
    [systems],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          {t("widgets.topRiskSystems")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {top5.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-3">
              <ShieldAlert className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("widgets.noSystems")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {top5.map((system, index) => (
              <div
                key={system.id}
                className={`flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors ${
                  index < top5.length - 1 ? "border-b" : ""
                }`}
              >
                {/* Rank */}
                <span className="text-sm tabular-nums font-medium text-muted-foreground w-5 shrink-0 text-center">
                  {index + 1}
                </span>

                {/* System name */}
                <Link
                  to={`/ai-systems/${system.id}`}
                  className="font-medium text-sm truncate max-w-[180px] hover:underline underline-offset-4"
                >
                  {system.name}
                </Link>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Risk score */}
                <span
                  className={`text-sm font-bold tabular-nums shrink-0 ${scoreColorClass(system.risk_score)}`}
                >
                  {system.risk_score}
                </span>

                {/* Lifecycle status badge */}
                <Badge variant="secondary" className="text-xs shrink-0">
                  {tSystems(`lifecycleStatuses.${system.lifecycle_status}`)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
