import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type ColumnDef } from "@tanstack/react-table";
import { ShieldAlert, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, SortableHeader } from "@/components/shared/DataTable";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRiskAssessments } from "@/hooks/useRiskAssessments";
import type { RiskAssessment } from "@/types/database";

type AssessmentRow = RiskAssessment & { ai_systems: { name: string } | null };

export default function RiskAssessmentListPage() {
  const { t } = useTranslation("riskAssessments");
  const navigate = useNavigate();

  const { data: assessments = [], isLoading } = useRiskAssessments();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");

  const filtered = assessments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (riskLevelFilter !== "all" && a.risk_level !== riskLevelFilter) return false;
    return true;
  });

  const columns: ColumnDef<AssessmentRow, unknown>[] = [
    {
      accessorKey: "ai_systems",
      header: ({ column }) => (
        <SortableHeader column={column}>{t("columns.system")}</SortableHeader>
      ),
      cell: ({ row }) => {
        const system = row.original.ai_systems;
        return <span className="font-medium">{system?.name ?? "—"}</span>;
      },
    },
    {
      accessorKey: "total_score",
      header: ({ column }) => (
        <SortableHeader column={column}>{t("columns.score")}</SortableHeader>
      ),
      cell: ({ row }) => (
        <RiskScoreGauge score={row.original.total_score} size="sm" />
      ),
    },
    {
      accessorKey: "risk_level",
      header: ({ column }) => (
        <SortableHeader column={column}>{t("columns.riskLevel")}</SortableHeader>
      ),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.risk_level}
          label={t(`riskLevels.${row.original.risk_level}`)}
        />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>{t("columns.status")}</SortableHeader>
      ),
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          label={t(`statuses.${row.original.status}`)}
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortableHeader column={column}>{t("columns.createdAt")}</SortableHeader>
      ),
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleDateString("fr-CA"),
    },
  ];

  if (!isLoading && assessments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          helpNs="riskAssessments"
          description={t("description")}
          actions={
            <Button onClick={() => navigate("/risks/new")}>
              <Plus className="mr-2 size-4" />
              {t("newAssessment")}
            </Button>
          }
        />
        <EmptyState
          icon={ShieldAlert}
          title={t("empty.title")}
          description={t("empty.description")}
          actionLabel={t("empty.action")}
          onAction={() => navigate("/risks/new")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        helpNs="riskAssessments"
        description={t("description")}
        actions={
          <Button onClick={() => navigate("/risks/new")}>
            <Plus className="mr-2 size-4" />
            {t("newAssessment")}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("columns.status")}</SelectItem>
            <SelectItem value="draft">{t("statuses.draft")}</SelectItem>
            <SelectItem value="submitted">{t("statuses.submitted")}</SelectItem>
            <SelectItem value="in_review">{t("statuses.in_review")}</SelectItem>
            <SelectItem value="approved">{t("statuses.approved")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("columns.riskLevel")}</SelectItem>
            <SelectItem value="minimal">{t("riskLevels.minimal")}</SelectItem>
            <SelectItem value="limited">{t("riskLevels.limited")}</SelectItem>
            <SelectItem value="high">{t("riskLevels.high")}</SelectItem>
            <SelectItem value="critical">{t("riskLevels.critical")}</SelectItem>
            <SelectItem value="prohibited">{t("riskLevels.prohibited")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/risks/${row.id}`)}
      />
    </div>
  );
}
