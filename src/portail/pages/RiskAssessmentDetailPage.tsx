import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  useRiskAssessment,
  useUpdateRiskAssessment,
} from "@/hooks/useRiskAssessments";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  Section definitions (same as wizard)                                */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { key: "A", questions: ["q1", "q2", "q3", "q4"] },
  { key: "B", questions: ["q5", "q6", "q7"] },
  { key: "C", questions: ["q8", "q9", "q10"] },
  { key: "D", questions: ["q11", "q12", "q13"] },
  { key: "E", questions: ["q14", "q15"] },
  { key: "F", questions: ["q16", "q17"] },
] as const;

/* ------------------------------------------------------------------ */
/*  Workflow statuses                                                    */
/* ------------------------------------------------------------------ */

const WORKFLOW = ["draft", "submitted", "in_review", "approved"] as const;

const NEXT_STATUS: Record<string, string> = {
  submitted: "in_review",
  in_review: "approved",
};

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function RiskAssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("riskAssessments");
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: assessment, isLoading } = useRiskAssessment(id);
  const updateMutation = useUpdateRiskAssessment();

  /* ---------- Status advance ---------------------------------------- */

  async function handleAdvanceStatus() {
    if (!assessment || !id) return;
    const nextStatus = NEXT_STATUS[assessment.status];
    if (!nextStatus) return;

    const payload: Record<string, unknown> = {
      id,
      status: nextStatus,
    };

    // When approving, record who approved and when
    if (nextStatus === "approved" && user) {
      payload.approved_by = user.id;
      payload.approved_at = new Date().toISOString();
    }

    try {
      await updateMutation.mutateAsync(payload as any);
      toast.success(
        nextStatus === "approved"
          ? t("toast.approved")
          : t("toast.updated"),
      );
    } catch {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  }

  /* ---------- Format helpers ---------------------------------------- */

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatAnswer(questionId: string, value: unknown): string {
    if (Array.isArray(value)) {
      if (value.length === 0) return "---";
      return value
        .map((v) => t(`questions.${questionId}.options.${v}`, v))
        .join(", ");
    }
    if (typeof value === "string" && value) {
      return t(`questions.${questionId}.options.${value}`, value);
    }
    return "---";
  }

  /* ---------- Loading skeleton -------------------------------------- */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {t("detail.notFound")}
      </div>
    );
  }

  const answers = (assessment.answers ?? {}) as Record<string, string | string[]>;
  const requirements = (assessment.requirements ?? []) as string[];
  const systemName = assessment.ai_systems?.name ?? "---";
  const isProhibited = assessment.risk_level === "prohibited";
  const currentIdx = WORKFLOW.indexOf(assessment.status as typeof WORKFLOW[number]);
  const canAdvance = !!NEXT_STATUS[assessment.status];

  /* ---------- Render ------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/risks")}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        {t("result.backToList")}
      </Button>

      {/* Header */}
      <PageHeader
        title={t("result.title")}
        description={`${t("columns.system")}: ${systemName}`}
        helpNs="riskAssessments"
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={assessment.risk_level}
              label={t(`riskLevels.${assessment.risk_level}`)}
            />
            <StatusBadge
              status={assessment.status}
              label={t(`statuses.${assessment.status}`)}
            />
          </div>
        }
      />

      {/* Workflow stepper */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center w-full overflow-x-auto">
            {WORKFLOW.map((status, idx) => {
              const isCompleted = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    {isCompleted ? (
                      <CheckCircle2 className="size-6 text-green-600 shrink-0" />
                    ) : isCurrent ? (
                      <div className="size-6 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                        <div className="size-3 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <div className="size-6 rounded-full border-2 border-muted-foreground/40 shrink-0" />
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
                  {idx < WORKFLOW.length - 1 && (
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
        </CardContent>
      </Card>

      {/* Action button */}
      {canAdvance && (
        <div>
          <Button
            onClick={handleAdvanceStatus}
            disabled={updateMutation.isPending}
          >
            {NEXT_STATUS[assessment.status] === "approved" ? (
              <>
                <ShieldCheck className="mr-2 size-4" />
                {t("detail.approve")}
              </>
            ) : (
              t("detail.startReview")
            )}
          </Button>
        </div>
      )}

      {/* Score + Risk Level + Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("result.score")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <RiskScoreGauge
              score={assessment.total_score}
              size="lg"
              showLabel
            />
          </CardContent>
        </Card>

        {/* Risk level card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("result.level")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <StatusBadge
              status={assessment.risk_level}
              label={t(`riskLevels.${assessment.risk_level}`)}
              className="text-base px-4 py-1"
            />
            {isProhibited && (
              <div className="flex items-center gap-2 text-red-600 mt-2">
                <AlertTriangle className="size-4" />
                <span className="text-xs font-medium">
                  {t("detail.prohibitedWarning")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("detail.dates")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("columns.createdAt")}</span>
              <span>{formatDate(assessment.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("detail.updatedAt")}</span>
              <span>{formatDate(assessment.updated_at)}</span>
            </div>
            {assessment.approved_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.approvedAt")}</span>
                <span>{formatDate(assessment.approved_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>{t("result.requirements")}</CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length > 0 ? (
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">---</p>
          )}
        </CardContent>
      </Card>

      {/* Questionnaire answers by section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.answersTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.key}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {t(`wizard.step${section.key}`)}
              </h3>
              <dl className="space-y-3">
                {section.questions.map((qId) => (
                  <div key={qId}>
                    <dt className="text-sm font-medium">
                      {t(`questions.${qId}.question`)}
                    </dt>
                    <dd className="text-sm text-muted-foreground mt-0.5">
                      {formatAnswer(qId, answers[qId])}
                    </dd>
                  </div>
                ))}
              </dl>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
