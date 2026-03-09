import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Plus,
  Search,
  Eye,
  ShieldOff,
  Ban,
} from "lucide-react";
import { PortalPage } from "@/portail/components/PortalPage";
import { toast } from "sonner";

import {
  useAgentRegistry,
  useUpdateAgent,
} from "@/hooks/useAgentRegistry";
import type { AgentRegistry } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import CreateAgentDialog from "@/portail/components/agents/CreateAgentDialog";
import {
  AUTONOMY_COLORS,
  AGENT_STATUS_COLORS,
  AGENT_RISK_COLORS,
} from "@/portail/constants/colors";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const AUTONOMY_LEVELS = ["A1", "A2", "A3", "A4", "A5"] as const;
const STATUSES = ["active", "suspended", "revoked"] as const;

const ALL = "__all__";

const STATUS_COLORS = AGENT_STATUS_COLORS;
const RISK_COLORS = AGENT_RISK_COLORS;

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function AgentsPage() {
  const { t } = useTranslation("agents");

  const [autonomyFilter, setAutonomyFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<AgentRegistry | null>(null);

  const { data: agents = [], isLoading } = useAgentRegistry();
  const updateAgent = useUpdateAgent();

  /* ---- Filtering ---- */
  const filteredAgents = agents.filter((a) => {
    if (autonomyFilter !== ALL && a.autonomy_level !== autonomyFilter) return false;
    if (statusFilter !== ALL && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !a.name.toLowerCase().includes(q) &&
        !a.agent_id.toLowerCase().includes(q) &&
        !(a.description ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  /* ---- Dialog helpers ---- */
  const openCreateDialog = () => setDialogOpen(true);

  const handleSuspend = (agent: AgentRegistry) => {
    updateAgent.mutate(
      { id: agent.id, status: "suspended" },
      { onSuccess: () => toast.success(t("messages.suspended")) }
    );
  };

  const handleRevoke = (agent: AgentRegistry) => {
    updateAgent.mutate(
      { id: agent.id, status: "revoked" },
      { onSuccess: () => toast.success(t("messages.revoked")) }
    );
  };

  const handleReactivate = (agent: AgentRegistry) => {
    updateAgent.mutate(
      { id: agent.id, status: "active" },
      { onSuccess: () => toast.success(t("messages.reactivated")) }
    );
  };

  return (
    <PortalPage
      icon={Bot}
      title={t("pageTitle")}
      description={t("pageDescription")}
      actions={
        <Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          {t("create")}
        </Button>
      }
    >

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

        <Select value={autonomyFilter} onValueChange={setAutonomyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filters.filterByAutonomy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allAutonomy")}</SelectItem>
            {AUTONOMY_LEVELS.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {t(`autonomyLevels.${lvl}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("filters.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`statuses.${s}`)}
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
      ) : filteredAgents.length === 0 ? (
        <Card className="p-8 text-center">
          <Bot className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noAgents")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {t("noAgentsDescription")}
          </p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            {t("create")}
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.agent_id")}</TableHead>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead className="w-[160px]">{t("table.autonomy")}</TableHead>
                <TableHead className="w-[110px]">{t("table.status")}</TableHead>
                <TableHead className="w-[180px]">{t("table.allowedTypes")}</TableHead>
                <TableHead className="w-[100px]">{t("table.maxRisk")}</TableHead>
                <TableHead className="w-[100px]">{t("table.createdAt")}</TableHead>
                <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <button
                      className="text-sm font-medium text-left hover:text-brand-forest transition-colors font-mono"
                      onClick={() => setViewingAgent(agent)}
                    >
                      {agent.agent_id}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">{agent.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${AUTONOMY_COLORS[agent.autonomy_level] ?? ""}`}
                    >
                      {t(`autonomyLevels.${agent.autonomy_level}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[agent.status] ?? ""}
                    >
                      {t(`statuses.${agent.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.allowed_types?.length > 0
                        ? agent.allowed_types.map((dt) => (
                            <Badge
                              key={dt}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {t(`decisionTypes.${dt}`)}
                            </Badge>
                          ))
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.max_risk ? (
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${RISK_COLORS[agent.max_risk] ?? ""}`}
                      >
                        {t(`riskLevels.${agent.max_risk}`)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(agent.created_at).toLocaleDateString("fr-CA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewingAgent(agent)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {agent.status === "active" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-yellow-600"
                          onClick={() => handleSuspend(agent)}
                          title={t("actions.suspend")}
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {(agent.status === "active" || agent.status === "suspended") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleRevoke(agent)}
                          title={t("actions.revoke")}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Dialog */}
      <CreateAgentDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Detail Sheet */}
      <Sheet open={!!viewingAgent} onOpenChange={() => setViewingAgent(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {viewingAgent && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{viewingAgent.agent_id}</SheetTitle>
                <SheetDescription>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={AUTONOMY_COLORS[viewingAgent.autonomy_level] ?? ""}
                    >
                      {t(`autonomyLevels.${viewingAgent.autonomy_level}`)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[viewingAgent.status] ?? ""}
                    >
                      {t(`statuses.${viewingAgent.status}`)}
                    </Badge>
                    {viewingAgent.max_risk && (
                      <Badge
                        variant="outline"
                        className={RISK_COLORS[viewingAgent.max_risk] ?? ""}
                      >
                        {t(`riskLevels.${viewingAgent.max_risk}`)}
                      </Badge>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("table.name")}
                  </h4>
                  <p className="text-sm">{viewingAgent.name}</p>
                </div>

                {viewingAgent.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.description")}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingAgent.description}
                    </p>
                  </div>
                )}

                {viewingAgent.allowed_types?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("table.allowedTypes")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingAgent.allowed_types.map((dt) => (
                        <Badge key={dt} variant="outline" className="text-[11px]">
                          {t(`decisionTypes.${dt}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(viewingAgent.owner_name || viewingAgent.owner_email) && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.owner")}
                    </h4>
                    <p className="text-sm">
                      {viewingAgent.owner_name}
                      {viewingAgent.owner_name && viewingAgent.owner_email && " — "}
                      {viewingAgent.owner_email && (
                        <span className="text-muted-foreground">
                          {viewingAgent.owner_email}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Status actions */}
                <div className="flex gap-2 pt-2">
                  {viewingAgent.status === "suspended" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => {
                        handleReactivate(viewingAgent);
                        setViewingAgent(null);
                      }}
                    >
                      {t("actions.reactivate")}
                    </Button>
                  )}
                  {viewingAgent.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                      onClick={() => {
                        handleSuspend(viewingAgent);
                        setViewingAgent(null);
                      }}
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                      {t("actions.suspend")}
                    </Button>
                  )}
                  {(viewingAgent.status === "active" || viewingAgent.status === "suspended") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        handleRevoke(viewingAgent);
                        setViewingAgent(null);
                      }}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      {t("actions.revoke")}
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>
                    {t("detail.createdAt")}:{" "}
                    {new Date(viewingAgent.created_at).toLocaleDateString("fr-CA")}
                  </p>
                  <p>
                    {t("detail.updatedAt")}:{" "}
                    {new Date(viewingAgent.updated_at).toLocaleDateString("fr-CA")}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalPage>
  );
}
