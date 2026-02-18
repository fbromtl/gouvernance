import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { useIncident, useUpdateIncident } from "@/hooks/useIncidents";

/* ------------------------------------------------------------------ */
/*  Workflow statuses                                                    */
/* ------------------------------------------------------------------ */

const WORKFLOW_STATUSES = [
  "reported",
  "triaged",
  "investigating",
  "resolving",
  "resolved",
  "post_mortem",
  "closed",
] as const;

const NEXT_STATUS: Record<string, string> = {
  reported: "triaged",
  triaged: "investigating",
  investigating: "resolving",
  resolving: "resolved",
  resolved: "post_mortem",
  post_mortem: "closed",
};

/* ------------------------------------------------------------------ */
/*  WorkflowStepper                                                     */
/* ------------------------------------------------------------------ */

function WorkflowStepper({
  currentStatus,
  t,
}: {
  currentStatus: string;
  t: (key: string) => string;
}) {
  const currentIdx = WORKFLOW_STATUSES.indexOf(
    currentStatus as (typeof WORKFLOW_STATUSES)[number],
  );

  return (
    <div className="flex items-center w-full overflow-x-auto">
      {WORKFLOW_STATUSES.map((status, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={status} className="flex items-center flex-1 last:flex-none">
            {/* Dot + label */}
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              {isCompleted ? (
                <CheckCircle2 className="size-6 text-green-600 shrink-0" />
              ) : isCurrent ? (
                <div className="size-6 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                  <Circle className="size-3 fill-primary text-primary" />
                </div>
              ) : (
                <Circle className="size-6 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={`text-xs text-center whitespace-nowrap ${
                  isCurrent
                    ? "font-semibold text-primary"
                    : isCompleted
                      ? "text-green-700"
                      : "text-muted-foreground"
                }`}
              >
                {t(`statuses.${status}`)}
              </span>
            </div>

            {/* Connector line */}
            {idx < WORKFLOW_STATUSES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  idx < currentIdx ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail field helper                                                  */
/* ------------------------------------------------------------------ */

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("incidents");
  const navigate = useNavigate();
  const { data: incident, isLoading } = useIncident(id);
  const updateIncident = useUpdateIncident();

  /* ---------- Format helpers ---------------------------------------- */

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* ---------- Status advance ---------------------------------------- */

  const handleAdvanceStatus = async () => {
    if (!incident || !id) return;
    const nextStatus = NEXT_STATUS[incident.status];
    if (!nextStatus) return;

    try {
      await updateIncident.mutateAsync({ id, status: nextStatus });
      toast.success(t("toast.statusChanged"));
    } catch {
      toast.error("Erreur lors de la mise a jour du statut.");
    }
  };

  /* ---------- Loading skeleton -------------------------------------- */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Incident introuvable.
      </div>
    );
  }

  const showLoi25Tab =
    incident.category === "privacy" && incident.serious_harm_risk;

  /* ---------- Render ------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/incidents")}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        {t("detail.backToList")}
      </Button>

      {/* Header */}
      <PageHeader
        title={incident.title}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={incident.severity}
              label={t(`severities.${incident.severity}`)}
            />
            <StatusBadge
              status={incident.status}
              label={t(`statuses.${incident.status}`)}
            />
          </div>
        }
      />

      {/* Workflow stepper */}
      <Card>
        <CardContent className="py-4">
          <WorkflowStepper currentStatus={incident.status} t={t} />
        </CardContent>
      </Card>

      {/* Status action button */}
      {NEXT_STATUS[incident.status] && (
        <div>
          <Button
            onClick={handleAdvanceStatus}
            disabled={updateIncident.isPending}
          >
            {t(`detail.statusAction.${incident.status}`)}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">{t("detail.tabs.summary")}</TabsTrigger>
          <TabsTrigger value="investigation">
            {t("detail.tabs.investigation")}
          </TabsTrigger>
          <TabsTrigger value="resolution">
            {t("detail.tabs.resolution")}
          </TabsTrigger>
          <TabsTrigger value="postMortem">
            {t("detail.tabs.postMortem")}
          </TabsTrigger>
          {showLoi25Tab && (
            <TabsTrigger value="loi25">{t("detail.tabs.loi25")}</TabsTrigger>
          )}
        </TabsList>

        {/* ----- Summary tab ----- */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.tabs.summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <DetailField label={t("detail.category")}>
                  <StatusBadge
                    status={incident.category === "ai" ? "pilot" : "development"}
                    label={t(`categories.${incident.category}`)}
                  />
                </DetailField>

                <DetailField label={t("detail.incidentType")}>
                  {t(
                    `incidentTypes.${incident.category}.${incident.incident_type}`,
                  )}
                </DetailField>

                <DetailField label={t("detail.severity")}>
                  <StatusBadge
                    status={incident.severity}
                    label={t(`severities.${incident.severity}`)}
                  />
                </DetailField>

                <DetailField label={t("detail.detectedAt")}>
                  {formatDate(incident.detected_at)}
                </DetailField>

                {incident.started_at && (
                  <DetailField label={t("detail.startedAt")}>
                    {formatDate(incident.started_at)}
                  </DetailField>
                )}

                {incident.detection_mode && (
                  <DetailField label={t("detail.detectionMode")}>
                    {t(`detectionModes.${incident.detection_mode}`)}
                  </DetailField>
                )}

                <DetailField label={t("detail.assignedTo")}>
                  {incident.assigned_to ?? t("detail.notSpecified")}
                </DetailField>

                <DetailField label={t("detail.priority")}>
                  {incident.priority
                    ? t(`priorities.${incident.priority}`)
                    : t("detail.notSpecified")}
                </DetailField>

                <DetailField label={t("detail.seriousHarmRisk")}>
                  {incident.serious_harm_risk
                    ? t("detail.yes")
                    : t("detail.no")}
                </DetailField>

                <DetailField label={t("detail.affectedCount")}>
                  {incident.affected_count ?? t("detail.notSpecified")}
                </DetailField>
              </dl>

              <Separator className="my-6" />

              <DetailField label={t("detail.description")}>
                <p className="whitespace-pre-wrap">{incident.description}</p>
              </DetailField>

              {incident.impact_description && (
                <div className="mt-4">
                  <DetailField label={t("detail.impactDescription")}>
                    <p className="whitespace-pre-wrap">
                      {incident.impact_description}
                    </p>
                  </DetailField>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----- Investigation tab ----- */}
        <TabsContent value="investigation">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.tabs.investigation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailField label={t("detail.rootCause")}>
                <p className="whitespace-pre-wrap">
                  {incident.root_cause ?? t("detail.notSpecified")}
                </p>
              </DetailField>

              <DetailField label={t("detail.contributingFactors")}>
                {incident.contributing_factors &&
                incident.contributing_factors.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {incident.contributing_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  t("detail.notSpecified")
                )}
              </DetailField>

              <Separator />
              <p className="text-sm text-muted-foreground italic">
                {t("detail.placeholder")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----- Resolution tab ----- */}
        <TabsContent value="resolution">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.tabs.resolution")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailField label={t("detail.correctiveActions")}>
                {incident.corrective_actions &&
                typeof incident.corrective_actions === "object" &&
                Array.isArray(incident.corrective_actions) &&
                (incident.corrective_actions as unknown[]).length > 0
                  ? JSON.stringify(incident.corrective_actions, null, 2)
                  : t("detail.notSpecified")}
              </DetailField>

              <DetailField label={t("detail.resolutionDate")}>
                {formatDate(incident.resolution_date)}
              </DetailField>

              <Separator />
              <p className="text-sm text-muted-foreground italic">
                {t("detail.placeholder")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----- Post-mortem tab ----- */}
        <TabsContent value="postMortem">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.tabs.postMortem")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailField label={t("detail.postMortem")}>
                {incident.post_mortem
                  ? JSON.stringify(incident.post_mortem, null, 2)
                  : t("detail.notSpecified")}
              </DetailField>

              <DetailField label={t("detail.lessonsLearned")}>
                <p className="whitespace-pre-wrap">
                  {incident.lessons_learned ?? t("detail.notSpecified")}
                </p>
              </DetailField>

              <Separator />
              <p className="text-sm text-muted-foreground italic">
                {t("detail.placeholder")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----- Loi 25 tab ----- */}
        {showLoi25Tab && (
          <TabsContent value="loi25">
            <Card>
              <CardHeader>
                <CardTitle>{t("loi25.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailField label={t("loi25.caiNotification")}>
                  {incident.cai_notification_status ? (
                    <StatusBadge
                      status={incident.cai_notification_status}
                      label={t(
                        `loi25.statuses.${incident.cai_notification_status}`,
                      )}
                    />
                  ) : (
                    <StatusBadge
                      status="to_notify"
                      label={t("loi25.statuses.to_notify")}
                    />
                  )}
                </DetailField>

                <DetailField label={t("loi25.caiNotifiedAt")}>
                  {formatDate(incident.cai_notified_at)}
                </DetailField>

                <DetailField label={t("loi25.personsNotified")}>
                  {incident.persons_notified
                    ? t("detail.yes")
                    : t("detail.no")}
                </DetailField>

                <Separator />
                <p className="text-sm text-muted-foreground italic">
                  {t("detail.placeholder")}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
