import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Bot, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, SortableHeader } from "@/components/shared/DataTable";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiSystems, type AiSystemFilters } from "@/hooks/useAiSystems";
import type { AiSystem } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Option constants                                                    */
/* ------------------------------------------------------------------ */

const LIFECYCLE_STATUSES = [
  "idea",
  "pilot",
  "development",
  "testing",
  "production",
  "suspended",
  "decommissioned",
] as const;

const RISK_LEVELS = ["minimal", "limited", "high", "critical"] as const;

const SYSTEM_TYPES = [
  "predictive_ml",
  "rules_based",
  "genai_text",
  "genai_image",
  "genai_code",
  "genai_multimodal",
  "nlp",
  "computer_vision",
  "robotics",
  "recommendation",
  "other",
] as const;

/* ------------------------------------------------------------------ */
/*  Sentinel value for "all" selects                                    */
/* ------------------------------------------------------------------ */

const ALL = "__all__";

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function AiSystemsListPage() {
  const { t } = useTranslation("aiSystems");
  const navigate = useNavigate();

  // ----- Filter state -----
  const [search, setSearch] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState<string>(ALL);
  const [riskLevel, setRiskLevel] = useState<string>(ALL);
  const [systemType, setSystemType] = useState<string>(ALL);

  const filters: AiSystemFilters = useMemo(
    () => ({
      search: search || undefined,
      lifecycle_status: lifecycleStatus === ALL ? undefined : lifecycleStatus,
      risk_level: riskLevel === ALL ? undefined : riskLevel,
      system_type: systemType === ALL ? undefined : systemType,
    }),
    [search, lifecycleStatus, riskLevel, systemType],
  );

  const { data: systems, isLoading, isError } = useAiSystems(filters);

  // ----- Format helpers -----
  function formatDate(dateStr: string | null) {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("fr-CA");
  }

  // ----- Column definitions -----
  const columns = useMemo<ColumnDef<AiSystem, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column}>
            {t("columns.name")}
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "system_type",
        header: t("columns.systemType"),
        cell: ({ row }) => (
          <span className="text-sm">
            {t(`systemTypes.${row.original.system_type}`)}
          </span>
        ),
      },
      {
        accessorKey: "departments",
        header: t("columns.departments"),
        cell: ({ row }) => {
          const depts = row.original.departments ?? [];
          if (depts.length === 0) return <span className="text-muted-foreground">---</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {depts.map((d) => (
                <Badge key={d} variant="secondary" className="text-xs">
                  {t(`departments.${d}`, d)}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "risk_level",
        header: t("columns.riskLevel"),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.risk_level}
            label={t(`riskLevels.${row.original.risk_level}`)}
          />
        ),
      },
      {
        accessorKey: "lifecycle_status",
        header: t("columns.lifecycleStatus"),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.lifecycle_status}
            label={t(`lifecycleStatuses.${row.original.lifecycle_status}`)}
          />
        ),
      },
      {
        accessorKey: "next_review_date",
        header: t("columns.nextReviewDate"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.next_review_date)}
          </span>
        ),
      },
      {
        accessorKey: "risk_score",
        header: t("columns.riskScore"),
        cell: ({ row }) => (
          <RiskScoreGauge score={row.original.risk_score ?? 0} size="sm" />
        ),
      },
    ],
    [t],
  );

  // ----- Loading skeleton -----
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-44" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ----- Error state -----
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="size-10 text-destructive mb-4" />
        <p className="text-muted-foreground">{t("errors.loadFailed", { defaultValue: "Erreur lors du chargement des données." })}</p>
      </div>
    );
  }

  // ----- Empty state -----
  const isEmpty = !systems || systems.length === 0;
  const hasActiveFilters =
    search || lifecycleStatus !== ALL || riskLevel !== ALL || systemType !== ALL;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t("title")}
        helpNs="aiSystems"
        description={t("description")}
        actions={
          <Button onClick={() => navigate("/ai-systems/new")}>
            <Plus className="mr-2 size-4" />
            {t("newSystem")}
          </Button>
        }
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={lifecycleStatus} onValueChange={setLifecycleStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.lifecycleStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.all")}</SelectItem>
            {LIFECYCLE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`lifecycleStatuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={riskLevel} onValueChange={setRiskLevel}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.riskLevel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.all")}</SelectItem>
            {RISK_LEVELS.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`riskLevels.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={systemType} onValueChange={setSystemType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.systemType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.all")}</SelectItem>
            {SYSTEM_TYPES.map((st) => (
              <SelectItem key={st} value={st}>
                {t(`systemTypes.${st}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={Bot}
          title={
            hasActiveFilters
              ? t("emptyFiltered.title")
              : t("empty.title")
          }
          description={
            hasActiveFilters
              ? t("emptyFiltered.description")
              : t("empty.description")
          }
          actionLabel={hasActiveFilters ? undefined : t("newSystem")}
          onAction={
            hasActiveFilters ? undefined : () => navigate("/ai-systems/new")
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={systems}
          onRowClick={(row) => navigate(`/ai-systems/${row.id}`)}
          pageSize={10}
        />
      )}
    </div>
  );
}
