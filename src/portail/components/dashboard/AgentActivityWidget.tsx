import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, ArrowRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
import { useRecentAgentTraces } from "@/hooks/useAgentTraces";
import CreateAgentDialog from "@/portail/components/agents/CreateAgentDialog";

const DOT_COLORS: Record<string, string> = {
  decision: "#22c55e",   // green
  approval: "#3b82f6",   // blue
  escalation: "#f97316", // orange
};

export default function AgentActivityWidget() {
  const { t } = useTranslation("dashboard");
  const { data: traces = [] } = useRecentAgentTraces(3);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <PortalCard>
        <PortalCardHeader
          action={
            <div className="flex items-center gap-2">
              {traces.length > 0 && (
                <span className="text-xs text-neutral-500">
                  {traces.length} {t("widgets.agentActivity.traces")}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-7 text-xs"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("widgets.agentActivity.connectAgent")}
              </Button>
            </div>
          }
        >
          {t("widgets.agentActivity.title")}
        </PortalCardHeader>
        <div>
          {traces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <Activity className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500">
                {t("widgets.agentActivity.noTraces")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {traces.map((trace, index) => {
                const dotColor =
                  DOT_COLORS[trace.event_type] ?? "#94a3b8"; // slate fallback
                const isLast = index === traces.length - 1;
                const relativeTime = formatDistanceToNow(
                  parseISO(trace.created_at),
                  { addSuffix: true, locale: fr },
                );

                return (
                  <div key={trace.id} className="flex gap-3">
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
                      to="/agent-traces"
                      className="flex-1 min-w-0 pb-4 group"
                    >
                      <p className="text-sm font-medium truncate group-hover:underline underline-offset-4">
                        {trace.agent_id}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {trace.classification_code && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {trace.classification_code}
                          </Badge>
                        )}
                        <span className="text-[11px] text-neutral-500">
                          {relativeTime}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* Footer link */}
              <Link
                to="/agent-traces"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-purple hover:underline mt-1"
              >
                {t("widgets.agentActivity.viewJournal")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </PortalCard>

      <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
