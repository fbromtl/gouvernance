import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ClipboardCheck, Inbox, Scale } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BiasFinding, Decision } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingActionsWidgetProps {
  decisions: Decision[];
  biasFindings: BiasFinding[];
}

interface PendingAction {
  id: string;
  type: "decision" | "bias";
  title: string;
  badge: string;
  badgeClassName?: string;
  createdAt: string;
  link: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-transparent dark:bg-red-950 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 border-transparent dark:bg-orange-950 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-700 border-transparent dark:bg-amber-950 dark:text-amber-400",
  low: "bg-green-100 text-green-700 border-transparent dark:bg-green-950 dark:text-green-400",
};

const MAX_ITEMS = 8;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PendingActionsWidget({
  decisions,
  biasFindings,
}: PendingActionsWidgetProps) {
  const { t, i18n } = useTranslation("dashboard");

  const locale = i18n.language === "fr" ? fr : undefined;

  const pendingActions = useMemo(() => {
    const items: PendingAction[] = [];

    for (const d of decisions) {
      if (d.status === "submitted" || d.status === "in_review") {
        items.push({
          id: d.id,
          type: "decision",
          title: d.title,
          badge: d.decision_type,
          createdAt: d.created_at,
          link: "/decisions",
        });
      }
    }

    for (const bf of biasFindings) {
      if (bf.status === "identified" || bf.status === "in_remediation") {
        items.push({
          id: bf.id,
          type: "bias",
          title: bf.title,
          badge: bf.severity,
          badgeClassName: SEVERITY_BADGE_CLASSES[bf.severity] ?? "",
          createdAt: bf.created_at,
          link: "/bias",
        });
      }
    }

    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return items.slice(0, MAX_ITEMS);
  }, [decisions, biasFindings]);

  const count = pendingActions.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t("widgets.pendingActions")}
          </CardTitle>
          {count > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {count}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("widgets.noPendingActions")}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {pendingActions.map((action) => (
              <Link
                key={`${action.type}-${action.id}`}
                to={action.link}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                {action.type === "decision" ? (
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                ) : (
                  <Scale className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                )}

                <span className="flex-1 truncate text-sm">{action.title}</span>

                {action.type === "bias" ? (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${action.badgeClassName}`}
                  >
                    {action.badge}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    {action.badge}
                  </Badge>
                )}

                <span className="shrink-0 text-[11px] text-muted-foreground/50">
                  {formatDistanceToNow(parseISO(action.createdAt), {
                    addSuffix: true,
                    locale,
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
