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
  Sparkles,
} from "lucide-react";

import {
  useLatestDiagnostic,
  useSaveDiagnostic,
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
      return "bg-gray-500";
  }
}

// ── Component ──────────────────────────────────────────────
export default function DiagnosticResultWidget() {
  const { t } = useTranslation("diagnostic");
  const { data: latestDiagnostic, isLoading } = useLatestDiagnostic();
  const saveMutation = useSaveDiagnostic();
  const [consumed, setConsumed] = useState(false);

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
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="text-sm text-muted-foreground">Enregistrement de votre diagnostic...</span>
        </div>
      </div>
    );
  }

  const diagnostic = latestDiagnostic;
  if (!diagnostic) return null;

  const color = getLevelColor(diagnostic.maturity_level);
  const percentage = (diagnostic.total_score / 30) * 100;

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t("widget.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("widget.completedOn", {
                  date: new Date(diagnostic.completed_at).toLocaleDateString("fr-CA"),
                })}
              </p>
            </div>
          </div>
          <Link
            to="/diagnostic"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            {t("widget.retake")}
          </Link>
        </div>

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
                stroke="currentColor"
                strokeWidth="5"
                className="text-muted/30"
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
              <span className="text-lg font-bold text-foreground">{diagnostic.total_score}</span>
            </div>
          </div>
          <div>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {t(`levels.${diagnostic.maturity_level}`)}
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
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
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs text-muted-foreground">
                  {t(`results.domains.${key}`)}
                </span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 w-4 rounded-full ${
                        step <= value - 1 ? getScoreBarColor(value) : "bg-muted/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-6 text-right text-xs font-medium text-muted-foreground">
                  {value}/3
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
