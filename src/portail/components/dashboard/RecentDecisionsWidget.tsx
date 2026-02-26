import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
import { STATUS_COLORS } from "./chart-theme";

interface RecentDecisionsWidgetProps {
  decisions: {
    id: string;
    title: string;
    decision_type: string;
    status: string;
    created_at: string;
  }[];
}

export default function RecentDecisionsWidget({ decisions }: RecentDecisionsWidgetProps) {
  const { t } = useTranslation("dashboard");

  const recent = useMemo(
    () =>
      [...decisions]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [decisions],
  );

  return (
    <PortalCard>
      <PortalCardHeader>
        {t("widgets.recentDecisions")}
      </PortalCardHeader>
      <div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
              <ClipboardList className="h-5 w-5 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500">
              {t("widgets.noDecisions")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {recent.map((decision, index) => {
              const dotColor =
                STATUS_COLORS[decision.status] ?? STATUS_COLORS.draft;
              const isLast = index === recent.length - 1;
              const relativeTime = formatDistanceToNow(
                parseISO(decision.created_at),
                { addSuffix: true, locale: fr },
              );

              return (
                <div key={decision.id} className="flex gap-3">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center pt-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    {!isLast && (
                      <span className="w-px flex-1 bg-neutral-100" />
                    )}
                  </div>

                  {/* Content */}
                  <Link
                    to="/decisions"
                    className="flex-1 min-w-0 pb-4 group"
                  >
                    <p className="text-sm font-medium truncate group-hover:underline underline-offset-4">
                      {decision.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {t(`decisionTypes.${decision.decision_type}`, {
                          defaultValue: decision.decision_type,
                        })}
                      </Badge>
                      <span className="text-[11px] text-neutral-500">
                        {relativeTime}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalCard>
  );
}
