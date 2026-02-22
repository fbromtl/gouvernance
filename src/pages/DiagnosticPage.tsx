import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  X,
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

const ANSWER_OPTIONS = [
  { key: "not_at_all", value: 0 },
  { key: "considering", value: 1 },
  { key: "partially", value: 2 },
  { key: "fully_implemented", value: 3 },
] as const;

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

function getMaturityLevel(score: number): string {
  if (score <= 6) return "debutant";
  if (score <= 12) return "emergent";
  if (score <= 18) return "intermediaire";
  if (score <= 24) return "avance";
  return "exemplaire";
}

// ── Component ──────────────────────────────────────────────
export function DiagnosticPage() {
  const { t } = useTranslation("diagnostic");
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const totalQuestions = QUESTION_KEYS.length;
  const currentKey = QUESTION_KEYS[currentIndex];
  const Icon = DOMAIN_ICONS[currentKey];
  const progress = ((currentIndex + (answers[currentKey] !== undefined ? 1 : 0)) / totalQuestions) * 100;

  const handleAnswer = useCallback(
    (value: number) => {
      setSelectedAnswer(value);

      const newAnswers = { ...answers, [currentKey]: value };
      setAnswers(newAnswers);

      // Save progress to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers: newAnswers, timestamp: Date.now() })
      );

      // Auto-advance after short delay
      setTimeout(() => {
        setSelectedAnswer(null);
        if (currentIndex < totalQuestions - 1) {
          setDirection(1);
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Last question — save full result and navigate
          const score = Object.values(newAnswers).reduce((a, b) => a + b, 0);
          const level = getMaturityLevel(score);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              answers: newAnswers,
              score,
              level,
              completedAt: new Date().toISOString(),
            })
          );
          navigate("/diagnostic/resultats");
        }
      }, 400);
    },
    [answers, currentIndex, currentKey, totalQuestions, navigate]
  );

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]">
      {/* ── Top Bar ────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white disabled:invisible"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("previousButton")}
        </button>

        <span className="text-sm font-medium text-white/70">
          {t("questionOf", { current: currentIndex + 1, total: totalQuestions })}
        </span>

        <button
          onClick={goHome}
          className="text-white/60 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Progress Bar ───────────────────────────────── */}
      <div className="mx-4 mt-3 sm:mx-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[#ab54f3]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ── Question Area ──────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-2xl"
          >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ab54f3]/20 sm:h-20 sm:w-20">
                <Icon className="h-8 w-8 text-[#ab54f3] sm:h-10 sm:w-10" />
              </div>
            </div>

            {/* Question */}
            <h2 className="mb-3 text-center text-xl font-bold text-white sm:text-2xl lg:text-3xl">
              {t(`questions.${currentKey}.question`)}
            </h2>
            <p className="mb-10 text-center text-sm text-white/60 sm:text-base">
              {t(`questions.${currentKey}.description`)}
            </p>

            {/* Answer Buttons */}
            <div className="mx-auto grid max-w-lg gap-3">
              {ANSWER_OPTIONS.map((option) => {
                const isSelected = selectedAnswer === option.value;
                const wasPreviouslySelected = answers[currentKey] === option.value && selectedAnswer === null;

                return (
                  <button
                    key={option.key}
                    onClick={() => handleAnswer(option.value)}
                    className={`group relative w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#ab54f3] bg-[#ab54f3]/20 text-white"
                        : wasPreviouslySelected
                          ? "border-[#ab54f3]/50 bg-[#ab54f3]/10 text-white"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                          isSelected
                            ? "bg-[#ab54f3] text-white"
                            : wasPreviouslySelected
                              ? "bg-[#ab54f3]/60 text-white"
                              : "bg-white/10 text-white/60 group-hover:bg-white/20"
                        }`}
                      >
                        {option.value}
                      </span>
                      <span className="text-sm font-medium sm:text-base">
                        {t(`answers.${option.key}`)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Keyboard hint ──────────────────────────────── */}
      <div className="pb-6 text-center">
        <p className="text-xs text-white/30">
          gouvernance.ai
        </p>
      </div>
    </div>
  );
}

export default DiagnosticPage;
