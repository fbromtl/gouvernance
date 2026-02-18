import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, SortableHeader } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncidents, type IncidentFilters } from "@/hooks/useIncidents";
import type { Incident } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUSES = [
  "reported",
  "triaged",
  "investigating",
  "resolving",
  "resolved",
  "post_mortem",
  "closed",
] as const;

const SEVERITIES = ["critical", "high", "medium", "low"] as const;

const CATEGORIES = ["ai", "privacy"] as const;

const ALL = "__all__";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  low: "text-green-700 bg-green-50 border-green-200",
};

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function IncidentListPage() {
  const { t } = useTranslation("incidents");
  const navigate = useNavigate();

  // ----- Filter state -----
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [severity, setSeverity] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);

  const filters: IncidentFilters = useMemo(
    () => ({
      search: search || undefined,
      status: status === ALL ? undefined : status,
      severity: severity === ALL ? undefined : severity,
      category: category === ALL ? undefined : category,
    }),
    [search, status, severity, category],
  );

  const { data: incidents, isLoading } = useIncidents(filters);

  // ----- Severity stats -----
  const severityStats = useMemo(() => {
    if (!incidents) return { critical: 0, high: 0, medium: 0, low: 0 };
    return {
      critical: incidents.filter((i) => i.severity === "critical").length,
      high: incidents.filter((i) => i.severity === "high").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      low: incidents.filter((i) => i.severity === "low").length,
    };
  }, [incidents]);

  // ----- Format helpers -----
  function formatDate(dateStr: string | null) {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("fr-CA");
  }

  // ----- Column definitions -----
  const columns = useMemo<ColumnDef<Incident, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortableHeader column={column}>
            {t("columns.title")}
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "category",
        header: t("columns.category"),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.category === "ai" ? "pilot" : "development"}
            label={t(`categories.${row.original.category}`)}
          />
        ),
      },
      {
        accessorKey: "incident_type",
        header: t("columns.incidentType"),
        cell: ({ row }) => (
          <span className="text-sm">
            {t(`incidentTypes.${row.original.category}.${row.original.incident_type}`)}
          </span>
        ),
      },
      {
        accessorKey: "severity",
        header: t("columns.severity"),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.severity}
            label={t(`severities.${row.original.severity}`)}
          />
        ),
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            label={t(`statuses.${row.original.status}`)}
          />
        ),
      },
      {
        accessorKey: "detected_at",
        header: t("columns.detectedAt"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.detected_at)}
          </span>
        ),
      },
      {
        accessorKey: "assigned_to",
        header: t("columns.assignedTo"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.assigned_to ?? "---"}
          </span>
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
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
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

  // ----- Empty / data state -----
  const isEmpty = !incidents || incidents.length === 0;
  const hasActiveFilters =
    search || status !== ALL || severity !== ALL || category !== ALL;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button onClick={() => navigate("/incidents/new")}>
            <Plus className="mr-2 size-4" />
            {t("newIncident")}
          </Button>
        }
      />

      {/* Severity stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {SEVERITIES.map((sev) => (
          <Card key={sev} className={`border ${SEVERITY_COLORS[sev]}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{t(`stats.${sev}`)}</p>
                <p className="text-2xl font-bold">{severityStats[sev]}</p>
              </div>
              <AlertTriangle className="size-8 opacity-20" />
            </CardContent>
          </Card>
        ))}
      </div>

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

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.allStatuses")} />
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

        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.allSeverities")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allSeverities")}</SelectItem>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`severities.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {t(`categories.${c}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("empty.title")}
          description={t("empty.description")}
          actionLabel={hasActiveFilters ? undefined : t("empty.action")}
          onAction={
            hasActiveFilters ? undefined : () => navigate("/incidents/new")
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={incidents}
          onRowClick={(row) => navigate(`/incidents/${row.id}`)}
          pageSize={10}
        />
      )}
    </div>
  );
}
