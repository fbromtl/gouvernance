import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Bot,
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldAlert,
  Plus,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { useAiSystem, useDeleteAiSystem } from "@/hooks/useAiSystems";

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function AiSystemDetailPage() {
  const { t } = useTranslation("aiSystems");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: system, isLoading } = useAiSystem(id);
  const deleteMutation = useDeleteAiSystem();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ----- Delete handler -----
  async function handleDelete() {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("detail.deleteSuccess"));
      navigate("/ai-systems");
    } catch {
      toast.error(t("detail.deleteError"));
    }
  }

  // ----- Format helpers -----
  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("fr-CA");
  }

  function renderArrayBadges(items: string[] | undefined, ns: string) {
    if (!items || items.length === 0) {
      return <span className="text-muted-foreground">---</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">
            {t(`${ns}.${item}`, item)}
          </Badge>
        ))}
      </div>
    );
  }

  // ----- Loading skeleton -----
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <EmptyState
        icon={Bot}
        title={t("detail.notFound")}
        description={t("detail.notFoundDescription")}
        actionLabel={t("detail.backToList")}
        onAction={() => navigate("/ai-systems")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/ai-systems"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        {t("detail.backToList")}
      </Link>

      {/* Header */}
      <PageHeader
        title={system.name}
        description={system.internal_ref ? `Ref: ${system.internal_ref}` : undefined}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(`/ai-systems/${id}/edit`)}
            >
              <Pencil className="mr-2 size-4" />
              {t("detail.edit")}
            </Button>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 size-4" />
                  {t("detail.delete")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("detail.deleteConfirmTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("detail.deleteConfirmDescription", {
                      name: system.name,
                    })}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t("detail.cancel")}</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending
                      ? t("detail.deleting")
                      : t("detail.confirmDelete")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">{t("detail.tabs.summary")}</TabsTrigger>
          <TabsTrigger value="risks">{t("detail.tabs.risks")}</TabsTrigger>
          <TabsTrigger value="incidents">
            {t("detail.tabs.incidents")}
          </TabsTrigger>
          <TabsTrigger value="history">{t("detail.tabs.history")}</TabsTrigger>
        </TabsList>

        {/* ---- Summary Tab ---- */}
        <TabsContent value="summary" className="space-y-6 mt-4">
          {/* Key info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Risk Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.riskScore")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <RiskScoreGauge
                  score={system.risk_score ?? 0}
                  size="lg"
                  showLabel
                />
              </CardContent>
            </Card>

            {/* System type */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.systemType")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {t(`systemTypes.${system.system_type}`)}
                </p>
                {system.genai_subtype && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`genaiSubtypes.${system.genai_subtype}`)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Lifecycle status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.lifecycleStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBadge
                  status={system.lifecycle_status}
                  label={t(`lifecycleStatuses.${system.lifecycle_status}`)}
                  className="text-sm"
                />
                {system.production_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("detail.productionDate")}: {formatDate(system.production_date)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Departments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.departments")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderArrayBadges(system.departments, "departments")}
              </CardContent>
            </Card>

            {/* Vendor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.vendor")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {system.vendor_name || "---"}
                </p>
                {system.model_version && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("detail.modelVersion")}: {system.model_version}
                  </p>
                )}
                {system.system_source && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(`systemSources.${system.system_source}`)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Autonomy level */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.autonomyLevel")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {system.autonomy_level
                    ? t(`autonomyLevels.${system.autonomy_level}`)
                    : "---"}
                </p>
              </CardContent>
            </Card>

            {/* Data types */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.dataTypes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderArrayBadges(system.data_types, "dataTypes")}
              </CardContent>
            </Card>

            {/* Affected population */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.affectedPopulation")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderArrayBadges(
                  system.affected_population,
                  "affectedPopulations",
                )}
              </CardContent>
            </Card>

            {/* Sensitive domains */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("detail.sensitiveDomains")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderArrayBadges(
                  system.sensitive_domains,
                  "sensitiveDomains",
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("detail.description")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {system.description}
              </p>
              {system.purpose && (
                <>
                  <h4 className="text-sm font-medium mt-4 mb-1">
                    {t("detail.purpose")}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {system.purpose}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Owners */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("detail.owners")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.businessOwner")}
                  </p>
                  <p className="text-sm font-medium">
                    {system.business_owner_id || "---"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.techOwner")}
                  </p>
                  <p className="text-sm font-medium">
                    {system.tech_owner_id || "---"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.privacyOwner")}
                  </p>
                  <p className="text-sm font-medium">
                    {system.privacy_owner_id || "---"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.riskOwner")}
                  </p>
                  <p className="text-sm font-medium">
                    {system.risk_owner_id || "---"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.approver")}
                  </p>
                  <p className="text-sm font-medium">
                    {system.approver_id || "---"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("detail.review")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.nextReviewDate")}
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(system.next_review_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.reviewFrequency")}
                  </p>
                  <p className="text-sm font-medium">
                    {t(`reviewFrequencies.${system.review_frequency}`)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("detail.createdAt")}
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(system.created_at)}
                  </p>
                </div>
              </div>
              {system.notes && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("fields.notes")}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {system.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Risks Tab ---- */}
        <TabsContent value="risks" className="mt-4">
          <EmptyState
            icon={ShieldAlert}
            title={t("detail.noRisks")}
            description={t("detail.noRisksDescription")}
            actionLabel={t("detail.newRiskAssessment")}
            onAction={() =>
              navigate(`/risks/new?ai_system_id=${system.id}`)
            }
          />
        </TabsContent>

        {/* ---- Incidents Tab ---- */}
        <TabsContent value="incidents" className="mt-4">
          <EmptyState
            icon={AlertCircle}
            title={t("detail.noIncidents")}
            description={t("detail.noIncidentsDescription")}
            actionLabel={t("detail.reportIncident")}
            onAction={() =>
              navigate(`/incidents/new?ai_system_id=${system.id}`)
            }
          />
        </TabsContent>

        {/* ---- History Tab ---- */}
        <TabsContent value="history" className="mt-4">
          <EmptyState
            icon={Clock}
            title={t("detail.noHistory")}
            description={t("detail.noHistoryDescription")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
