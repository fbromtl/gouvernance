import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  ShieldAlert,
  Lock,
  Scale,
  Eye,
  UserCheck,
  Gavel,
  AlertTriangle,
  Building2,
  GraduationCap,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";

import {
  useLatestDiagnostic,
  useSaveDiagnostic,
  useDeleteDiagnostic,
  getPendingDiagnostic,
  clearPendingDiagnostic,
} from "@/hooks/useDiagnostic";

// ── Constants ──────────────────────────────────────────────
const QUESTION_KEYS = [
  "inventory",
  "risk_assessment",
  "data_protection",
  "bias_fairness",
  "transparency",
  "human_oversight",
  "regulatory_compliance",
  "incident_management",
  "organizational_governance",
  "training_awareness",
] as const;

type QuestionKey = (typeof QUESTION_KEYS)[number];

const DOMAIN_ICONS: Record<QuestionKey, React.ElementType> = {
  inventory: ClipboardList,
  risk_assessment: ShieldAlert,
  data_protection: Lock,
  bias_fairness: Scale,
  transparency: Eye,
  human_oversight: UserCheck,
  regulatory_compliance: Gavel,
  incident_management: AlertTriangle,
  organizational_governance: Building2,
  training_awareness: GraduationCap,
};

function getLevelColor(level: string): string {
  switch (level) {
    case "debutant":
      return "#ef4444";
    case "emergent":
      return "#f97316";
    case "intermediaire":
      return "#eab308";
    case "avance":
      return "#22c55e";
    case "exemplaire":
      return "#ab54f3";
    default:
      return "#6b7280";
  }
}

function getScoreBarColor(value: number): string {
  switch (value) {
    case 0:
      return "bg-red-500";
    case 1:
      return "bg-orange-500";
    case 2:
      return "bg-yellow-500";
    case 3:
      return "bg-green-500";
    default:
      return "bg-neutral-500";
  }
}

// ── Component ──────────────────────────────────────────────
export default function DiagnosticResultWidget() {
  const { t } = useTranslation("diagnostic");
  const { data: latestDiagnostic, isLoading } = useLatestDiagnostic();
  const saveMutation = useSaveDiagnostic();
  const deleteMutation = useDeleteDiagnostic();
  const [consumed, setConsumed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // On mount: check for pending diagnostic in localStorage and save it
  useEffect(() => {
    if (consumed) return;
    const pending = getPendingDiagnostic();
    if (pending && !saveMutation.isPending) {
      saveMutation.mutate(pending, {
        onSuccess: () => {
          clearPendingDiagnostic();
          setConsumed(true);
        },
      });
    }
  }, [consumed, saveMutation]);

  // Nothing to show
  if (isLoading) return null;
  if (!latestDiagnostic && !saveMutation.isPending && !getPendingDiagnostic()) return null;

  // Still saving
  if (saveMutation.isPending) {
    return (
      <PortalCard hoverable={false} className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-100 border-t-primary" />
          <span className="text-sm text-neutral-500">Enregistrement de votre diagnostic...</span>
        </div>
      </PortalCard>
    );
  }

  const diagnostic = latestDiagnostic;
  if (!diagnostic) return null;

  const color = getLevelColor(diagnostic.maturity_level);
  const percentage = (diagnostic.total_score / 30) * 100;

  return (
    <div
      className="rounded-xl border border-neutral-100 bg-white overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="p-6">
        {/* Header */}
        <PortalCardHeader
          action={
            <div className="flex items-center gap-2">
              <Link
                to="/diagnostic"
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                {t("widget.retake")}
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center rounded-md p-1 text-neutral-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={t("widget.delete")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          }
        >
          {t("widget.title")}
        </PortalCardHeader>
        <p className="text-xs text-neutral-500 -mt-3 mb-4">
          {t("widget.completedOn", {
            date: new Date(diagnostic.completed_at).toLocaleDateString("fr-CA"),
          })}
        </p>

        {/* Score + Level */}
        <div className="flex items-center gap-4 mb-6">
          {/* Compact gauge */}
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#e5e5e5"
                strokeWidth="5"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - percentage / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-neutral-900">{diagnostic.total_score}</span>
            </div>
          </div>
          <div>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {t(`levels.${diagnostic.maturity_level}`)}
            </span>
            <p className="mt-1 text-sm text-neutral-500">
              {diagnostic.total_score} / 30
            </p>
          </div>
        </div>

        {/* Domain breakdown */}
        <div className="space-y-2">
          {QUESTION_KEYS.map((key) => {
            const Icon = DOMAIN_ICONS[key];
            const value = (diagnostic.answers as Record<string, number>)[key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
                <span className="flex-1 truncate text-xs text-neutral-500">
                  {t(`results.domains.${key}`)}
                </span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 w-4 rounded-full ${
                        step <= value - 1 ? getScoreBarColor(value) : "bg-neutral-100"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-6 text-right text-xs font-medium text-neutral-500">
                  {value}/3
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("widget.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("widget.deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t("widget.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(undefined, {
                  onSuccess: () => setShowDeleteConfirm(false),
                });
              }}
            >
              {deleteMutation.isPending
                ? t("widget.deleting")
                : t("widget.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
