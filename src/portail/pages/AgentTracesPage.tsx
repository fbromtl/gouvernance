import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Search,
  CheckCircle,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { useAgentTraces } from "@/hooks/useAgentTraces";
import type { AgentTrace } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const EVENT_TYPES = ["decision", "approval", "escalation"] as const;
const DECISION_TYPES = ["D1", "D2", "D3", "D4"] as const;
const RISK_LEVELS = ["R1", "R2", "R3", "R4"] as const;

const ALL = "__all__";

const EVENT_TYPE_COLORS: Record<string, string> = {
  decision: "bg-blue-100 text-blue-800 border-blue-200",
  approval: "bg-green-100 text-green-800 border-green-200",
  escalation: "bg-orange-100 text-orange-800 border-orange-200",
};

const DECISION_TYPE_COLORS: Record<string, string> = {
  D1: "bg-gray-100 text-gray-800",
  D2: "bg-blue-100 text-blue-800",
  D3: "bg-purple-100 text-purple-800",
  D4: "bg-red-100 text-red-800",
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  R1: "bg-blue-100 text-blue-800",
  R2: "bg-yellow-100 text-yellow-800",
  R3: "bg-orange-100 text-orange-800",
  R4: "bg-red-100 text-red-800",
};

const REVERSIBILITY_COLORS: Record<string, string> = {
  total: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  irreversible: "bg-red-100 text-red-800",
};

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function AgentTracesPage() {
  const { t } = useTranslation("agentTraces");

  const [eventTypeFilter, setEventTypeFilter] = useState(ALL);
  const [decisionTypeFilter, setDecisionTypeFilter] = useState(ALL);
  const [riskLevelFilter, setRiskLevelFilter] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingTrace, setViewingTrace] = useState<AgentTrace | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const { data: traces = [], isLoading } = useAgentTraces({
    event_type: eventTypeFilter === ALL ? undefined : eventTypeFilter,
    decision_type: decisionTypeFilter === ALL ? undefined : decisionTypeFilter,
    risk_level: riskLevelFilter === ALL ? undefined : riskLevelFilter,
  });

  /* ---- Client-side search filter ---- */
  const filteredTraces = traces.filter((trace) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      trace.agent_id.toLowerCase().includes(q) ||
      (trace.description ?? "").toLowerCase().includes(q) ||
      (trace.reasoning ?? "").toLowerCase().includes(q) ||
      trace.trace_id.toLowerCase().includes(q)
    );
  });

  /* ---- Hash chain indicator ---- */
  const getChainStatus = (trace: AgentTrace, index: number): "valid" | "broken" | "first" => {
    // Traces are ordered DESC (newest first).
    // For chain verification: trace[i].previous_hash should match trace[i+1].event_hash
    // (i+1 is the older/preceding entry in chronological order)
    if (trace.previous_hash === null) return "first";
    // If this is the last item in the list (oldest displayed), we can't verify
    if (index === filteredTraces.length - 1) return "valid";
    const olderTrace = filteredTraces[index + 1];
    if (trace.previous_hash === olderTrace.event_hash) return "valid";
    return "broken";
  };

  /* ---- Copy hash helper ---- */
  const handleCopyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success(t("copied"));
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filters.filterByEvent")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allEventTypes")}</SelectItem>
            {EVENT_TYPES.map((et) => (
              <SelectItem key={et} value={et}>
                {t(`eventTypes.${et}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={decisionTypeFilter} onValueChange={setDecisionTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filters.filterByDecision")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allDecisionTypes")}</SelectItem>
            {DECISION_TYPES.map((dt) => (
              <SelectItem key={dt} value={dt}>
                {t(`decisionTypes.${dt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("filters.filterByRisk")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allRiskLevels")}</SelectItem>
            {RISK_LEVELS.map((rl) => (
              <SelectItem key={rl} value={rl}>
                {t(`riskLevels.${rl}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filteredTraces.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noTraces")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {t("noTracesDescription")}
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">{t("table.traceId")}</TableHead>
                <TableHead className="w-[120px]">{t("table.agentId")}</TableHead>
                <TableHead className="w-[120px]">{t("table.eventType")}</TableHead>
                <TableHead className="w-[130px]">{t("table.classification")}</TableHead>
                <TableHead>{t("table.description")}</TableHead>
                <TableHead className="w-[70px]">{t("table.chain")}</TableHead>
                <TableHead className="w-[100px]">{t("table.timestamp")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTraces.map((trace, index) => {
                const chainStatus = getChainStatus(trace, index);
                return (
                  <TableRow key={trace.id}>
                    <TableCell>
                      <button
                        className="text-sm font-medium text-left hover:text-brand-purple transition-colors font-mono"
                        onClick={() => setViewingTrace(trace)}
                      >
                        {trace.trace_id.slice(0, 12)}...
                      </button>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {trace.agent_id}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${EVENT_TYPE_COLORS[trace.event_type] ?? ""}`}
                      >
                        {t(`eventTypes.${trace.event_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {trace.classification_code ? (
                        <span className="text-xs font-mono">
                          {trace.classification_code}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {trace.description
                        ? trace.description.length > 60
                          ? trace.description.slice(0, 60) + "..."
                          : trace.description
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {chainStatus === "valid" && (
                        <span title={t("chain.valid")}>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </span>
                      )}
                      {chainStatus === "broken" && (
                        <span title={t("chain.broken")}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </span>
                      )}
                      {chainStatus === "first" && (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(trace.created_at).toLocaleDateString("fr-CA")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!viewingTrace} onOpenChange={() => setViewingTrace(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {viewingTrace && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono text-base">
                  {viewingTrace.trace_id}
                </SheetTitle>
                <SheetDescription>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={EVENT_TYPE_COLORS[viewingTrace.event_type] ?? ""}
                    >
                      {t(`eventTypes.${viewingTrace.event_type}`)}
                    </Badge>
                    {viewingTrace.decision_type && (
                      <Badge
                        variant="outline"
                        className={DECISION_TYPE_COLORS[viewingTrace.decision_type] ?? ""}
                      >
                        {t(`decisionTypes.${viewingTrace.decision_type}`)}
                      </Badge>
                    )}
                    {viewingTrace.risk_level && (
                      <Badge
                        variant="outline"
                        className={RISK_LEVEL_COLORS[viewingTrace.risk_level] ?? ""}
                      >
                        {t(`riskLevels.${viewingTrace.risk_level}`)}
                      </Badge>
                    )}
                    {viewingTrace.reversibility && (
                      <Badge
                        variant="outline"
                        className={REVERSIBILITY_COLORS[viewingTrace.reversibility] ?? ""}
                      >
                        {t(`reversibility.${viewingTrace.reversibility}`)}
                      </Badge>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Agent ID */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("table.agentId")}
                  </h4>
                  <p className="text-sm font-mono">{viewingTrace.agent_id}</p>
                </div>

                {/* Classification */}
                {viewingTrace.classification_code && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.classification")}
                    </h4>
                    <p className="text-sm font-mono">{viewingTrace.classification_code}</p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("detail.description")}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {viewingTrace.description || t("detail.noContent")}
                  </p>
                </div>

                {/* Reasoning */}
                {viewingTrace.reasoning && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.reasoning")}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{viewingTrace.reasoning}</p>
                  </div>
                )}

                {/* Authorization */}
                {viewingTrace.authorization && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.authorization")}
                    </h4>
                    <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto font-mono">
                      {JSON.stringify(viewingTrace.authorization, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Event Hash */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("detail.eventHash")}
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted rounded px-3 py-2 font-mono break-all">
                      {viewingTrace.event_hash}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5 h-8"
                      onClick={() => handleCopyHash(viewingTrace.event_hash)}
                    >
                      {copiedHash === viewingTrace.event_hash ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {t("copyHash")}
                    </Button>
                  </div>
                </div>

                {/* Previous Hash */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("detail.previousHash")}
                  </h4>
                  {viewingTrace.previous_hash ? (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted rounded px-3 py-2 font-mono break-all">
                        {viewingTrace.previous_hash}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5 h-8"
                        onClick={() => handleCopyHash(viewingTrace.previous_hash!)}
                      >
                        {copiedHash === viewingTrace.previous_hash ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {t("copyHash")}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                {/* Context */}
                {viewingTrace.context && Object.keys(viewingTrace.context).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.context")}
                    </h4>
                    <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto font-mono">
                      {JSON.stringify(viewingTrace.context, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Footer metadata */}
                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>
                    {t("table.timestamp")}:{" "}
                    {new Date(viewingTrace.created_at).toLocaleString("fr-CA")}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
