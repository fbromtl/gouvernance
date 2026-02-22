import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Lock as LockIcon,
  ArrowRight,
  RotateCcw,
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
  Sparkles,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = "gouvernance:diagnostic:pending";

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

interface DiagnosticResult {
  answers: Record<string, number>;
  score: number;
  level: string;
  completedAt: string;
}

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

// ── Circular Gauge Component ──────────────────────────────
function ScoreGauge({ score, level, color }: { score: number; level: string; color: string }) {
  const { t } = useTranslation("diagnostic");
  const percentage = (score / 30) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-48 w-48 -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-white/50">/ 30</span>
        </div>
      </div>

      {/* Level badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-4 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
        style={{ backgroundColor: color + "33", border: `1px solid ${color}` }}
      >
        {t(`levels.${level}`)}
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export function DiagnosticResultsPage() {
  const { t } = useTranslation("diagnostic");
  const navigate = useNavigate();
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      navigate("/diagnostic");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.completedAt) {
        navigate("/diagnostic");
        return;
      }
      setResult(parsed);
    } catch {
      navigate("/diagnostic");
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ab54f3]" />
      </div>
    );
  }

  const color = getLevelColor(result.level);
  const VISIBLE_COUNT = 3; // Show only first 3 domains, blur the rest

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ab54f3]/10 px-4 py-1.5 text-sm font-medium text-[#ab54f3]">
            <Sparkles className="h-4 w-4" />
            {t("results.subtitle")}
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {t("results.title")}
          </h1>
        </motion.div>

        {/* ── Score Gauge ────────────────────────────── */}
        <div className="my-8 flex justify-center">
          <ScoreGauge score={result.score} level={result.level} color={color} />
        </div>

        {/* ── Domain Breakdown ───────────────────────── */}
        <div className="relative mt-10">
          <div className="space-y-3">
            {QUESTION_KEYS.map((key, index) => {
              const Icon = DOMAIN_ICONS[key];
              const value = result.answers[key] ?? 0;
              const isVisible = index < VISIBLE_COUNT;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isVisible ? 1 : 0.4, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.08 }}
                  className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 ${
                    !isVisible ? "select-none" : ""
                  }`}
                  style={!isVisible ? { filter: "blur(4px)" } : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0 text-white/50" />
                  <span className="flex-1 text-sm text-white/80">
                    {t(`results.domains.${key}`)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-2 w-6 rounded-full ${
                            step <= value - 1 ? getScoreBarColor(value) : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="w-8 text-right text-sm font-bold text-white/70">
                      {value}/3
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Blur Overlay + CTA ───────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="absolute inset-x-0 bottom-0 flex flex-col items-center rounded-2xl bg-gradient-to-t from-[#1e1a30] via-[#1e1a30]/95 to-transparent px-6 pb-6 pt-24"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <LockIcon className="h-6 w-6 text-white/60" />
            </div>
            <p className="mb-6 max-w-md text-center text-sm text-white/60">
              {t("results.detailsLocked")}
            </p>
            <Link
              to="/connexion"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#ab54f3] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ab54f3]/25 transition-all hover:bg-[#9b3fe3] hover:shadow-[#ab54f3]/40"
            >
              {t("results.ctaButton")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-xs text-white/40">
              {t("results.ctaSubtext")}
            </p>
          </motion.div>
        </div>

        {/* ── Bottom Actions ─────────────────────────── */}
        <div className="mt-32 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              navigate("/diagnostic");
            }}
            className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
          >
            <RotateCcw className="h-4 w-4" />
            {t("widget.retake")}
          </button>
          <Link to="/" className="text-xs text-white/30 hover:text-white/50">
            gouvernance.ai
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticResultsPage;
