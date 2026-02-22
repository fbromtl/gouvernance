import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Sparkles, Building2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { PLANS, type PlanId } from "@/lib/stripe";

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  key: string;
  interpolation?: Record<string, number>;
}

interface PlanCardConfig {
  id: PlanId;
  icon: typeof Zap;
  features: PlanFeature[];
  ctaTo: string;
  ctaLabel: string;
  secondaryCta?: { to: string; label: string };
}

/* ------------------------------------------------------------------ */
/*  PLAN CONFIGURATIONS                                                 */
/* ------------------------------------------------------------------ */

const FREE_FEATURES: PlanFeature[] = [
  { key: "dashboard" },
  { key: "ai_systems_limit", interpolation: { count: 3 } },
  { key: "lifecycle" },
  { key: "veille_read" },
  { key: "members", interpolation: { count: 1 } },
];

const PRO_FEATURES: PlanFeature[] = [
  { key: "dashboard" },
  { key: "ai_systems_unlimited" },
  { key: "lifecycle" },
  { key: "veille_read" },
  { key: "risk_assessments" },
  { key: "incidents" },
  { key: "compliance" },
  { key: "decisions" },
  { key: "bias" },
  { key: "transparency" },
  { key: "vendors" },
  { key: "documents" },
  { key: "ai_chat" },
  { key: "export_pdf" },
  { key: "support_email" },
  { key: "members_plural", interpolation: { count: 10 } },
];

const ENTERPRISE_FEATURES: PlanFeature[] = [
  { key: "dashboard" },
  { key: "ai_systems_unlimited" },
  { key: "lifecycle" },
  { key: "veille_read" },
  { key: "risk_assessments" },
  { key: "incidents" },
  { key: "compliance" },
  { key: "decisions" },
  { key: "bias" },
  { key: "transparency" },
  { key: "vendors" },
  { key: "documents" },
  { key: "ai_chat" },
  { key: "export_pdf" },
  { key: "support_dedicated" },
  { key: "members_unlimited" },
  { key: "monitoring" },
  { key: "data_catalog" },
  { key: "governance_structure" },
];

const PLAN_CONFIGS: PlanCardConfig[] = [
  {
    id: "free",
    icon: Zap,
    features: FREE_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "choosePlan",
  },
  {
    id: "pro",
    icon: Sparkles,
    features: PRO_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "choosePlan",
  },
  {
    id: "enterprise",
    icon: Building2,
    features: ENTERPRISE_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "choosePlan",
    secondaryCta: { to: "/contact", label: "contactUs" },
  },
];

/* ------------------------------------------------------------------ */
/*  COMPARISON TABLE DATA                                               */
/* ------------------------------------------------------------------ */

const ALL_FEATURE_KEYS = [
  "dashboard",
  "ai_systems",
  "lifecycle",
  "veille_read",
  "risk_assessments",
  "incidents",
  "compliance",
  "decisions",
  "bias",
  "transparency",
  "vendors",
  "documents",
  "ai_chat",
  "export_pdf",
  "monitoring",
  "data_catalog",
  "governance_structure",
  "support_community",
  "support_email",
  "support_dedicated",
] as const;

const PLAN_AVAILABILITY: Record<string, [boolean, boolean, boolean]> = {
  dashboard:             [true,  true,  true],
  ai_systems:            [true,  true,  true],
  lifecycle:             [true,  true,  true],
  veille_read:           [true,  true,  true],
  risk_assessments:      [false, true,  true],
  incidents:             [false, true,  true],
  compliance:            [false, true,  true],
  decisions:             [false, true,  true],
  bias:                  [false, true,  true],
  transparency:          [false, true,  true],
  vendors:               [false, true,  true],
  documents:             [false, true,  true],
  ai_chat:               [false, true,  true],
  export_pdf:            [false, true,  true],
  monitoring:            [false, false, true],
  data_catalog:          [false, false, true],
  governance_structure:  [false, false, true],
  support_community:     [true,  false, false],
  support_email:         [false, true,  false],
  support_dedicated:     [false, false, true],
};

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                  */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export function TarifsPage() {
  const { t } = useTranslation("billing");
  const [isYearly, setIsYearly] = useState(false);

  const formatPrice = (plan: PlanId) => {
    const p = PLANS[plan];
    return isYearly ? p.yearlyPrice : p.monthlyPrice;
  };

  const periodLabel = isYearly ? t("year") : t("month");

  return (
    <>
      <SEO
        title="Tarifs"
        description="Découvrez les forfaits gouvernance.ai : gratuit, pro et entreprise. Choisissez le plan adapté à la gouvernance IA de votre organisation."
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0b1a] via-[#1e1a30] to-[#2d1f4e] pt-40 pb-24 sm:pt-44 sm:pb-28">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-purple/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-80 rounded-full bg-brand-purple-dark/15 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight"
          >
            {t("pricingTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            {t("pricingSubtitle")}
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 inline-flex items-center gap-4 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 px-2 py-2"
          >
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
                !isYearly
                  ? "bg-white text-[#1e1a30] shadow-lg"
                  : "text-white/60 hover:text-white"
              )}
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                isYearly
                  ? "bg-white text-[#1e1a30] shadow-lg"
                  : "text-white/60 hover:text-white"
              )}
            >
              {t("yearly")}
              <Badge className="bg-brand-purple text-white text-[10px] px-2 py-0.5 rounded-full border-0 font-semibold">
                {t("yearlyDiscount")}
              </Badge>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PLAN CARDS                                                    */}
      {/* ============================================================ */}
      <section className="relative -mt-12 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-start"
          >
            {PLAN_CONFIGS.map((config) => {
              const plan = PLANS[config.id];
              const isHighlighted = plan.highlighted;

              return (
                <motion.div
                  key={config.id}
                  variants={cardVariants}
                  className={cn(
                    "relative group rounded-2xl transition-all duration-300",
                    isHighlighted
                      ? "lg:-mt-4 lg:mb-[-16px]"
                      : ""
                  )}
                >
                  {/* Gradient border for highlighted */}
                  {isHighlighted && (
                    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-brand-purple via-brand-purple-light to-brand-purple-dark opacity-100" />
                  )}

                  <div
                    className={cn(
                      "relative rounded-2xl bg-white border overflow-hidden transition-all duration-300",
                      "hover:shadow-xl hover:shadow-brand-purple/5 hover:-translate-y-1",
                      isHighlighted
                        ? "border-transparent shadow-2xl shadow-brand-purple/10"
                        : "border-border/60 shadow-lg shadow-black/5"
                    )}
                  >
                    {/* Recommended badge */}
                    {isHighlighted && (
                      <div className="bg-gradient-to-r from-brand-purple to-brand-purple-dark py-2 text-center">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {t("recommended")}
                        </span>
                      </div>
                    )}

                    <div className={cn("p-6 sm:p-8", isHighlighted && "pt-6")}>
                      {/* Plan icon + name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-xl",
                            isHighlighted
                              ? "bg-brand-purple/10 text-brand-purple"
                              : config.id === "enterprise"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          <config.icon className="size-5" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {t(config.id)}
                        </h3>
                      </div>

                      {/* Subtitle */}
                      <p className="text-sm text-muted-foreground mb-6">
                        {t(`idealFor.${config.id}`)}
                      </p>

                      {/* Price */}
                      <div className="mb-8">
                        {config.id === "enterprise" && (
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t("startingAt")}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                            {formatPrice(config.id) === 0
                              ? "$0"
                              : `$${formatPrice(config.id)}`}
                          </span>
                          {formatPrice(config.id) > 0 && (
                            <span className="text-base text-muted-foreground font-medium">
                              {periodLabel}
                            </span>
                          )}
                        </div>
                        {isYearly && formatPrice(config.id) > 0 && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {t("yearlyDiscount")}
                          </p>
                        )}
                      </div>

                      {/* CTA buttons */}
                      <div className="space-y-3 mb-8">
                        <Button
                          asChild
                          className={cn(
                            "w-full h-11 font-semibold text-sm",
                            isHighlighted
                              ? "bg-brand-purple hover:bg-brand-purple-dark text-white shadow-lg shadow-brand-purple/25"
                              : config.id === "enterprise"
                                ? "bg-foreground hover:bg-foreground/90 text-white"
                                : ""
                          )}
                          variant={!isHighlighted && config.id === "free" ? "outline" : "default"}
                        >
                          <Link to={config.ctaTo}>
                            {t(config.ctaLabel)}
                            <ArrowRight className="size-4 ml-2" />
                          </Link>
                        </Button>
                        {config.secondaryCta && (
                          <Button asChild variant="outline" className="w-full h-11 font-semibold text-sm">
                            <Link to={config.secondaryCta.to}>
                              {t(config.secondaryCta.label)}
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Features */}
                      <div className="border-t border-border/40 pt-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          {config.id === "free"
                            ? t("features.dashboard") && "Inclus"
                            : config.id === "pro"
                              ? "Tout du Gratuit, plus :"
                              : "Tout du Pro, plus :"}
                        </p>
                        <ul className="space-y-3">
                          {config.features.map((feat) => (
                            <li key={feat.key} className="flex items-start gap-2.5">
                              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                                <Check className="size-3 text-emerald-600" />
                              </div>
                              <span className="text-sm text-foreground/80 leading-snug">
                                {t(`features.${feat.key}`, feat.interpolation ?? {})}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURE COMPARISON TABLE                                      */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Comparaison des forfaits
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Toutes les fonctionnalites en un coup d&apos;oeil
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl border border-border/60 bg-white shadow-lg overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-4 gap-0 border-b border-border/40 bg-muted/20">
              <div className="p-4 sm:p-5 text-sm font-semibold text-muted-foreground">
                Fonctionnalites
              </div>
              {(["free", "pro", "enterprise"] as const).map((planId) => (
                <div
                  key={planId}
                  className={cn(
                    "p-4 sm:p-5 text-center text-sm font-bold",
                    planId === "pro"
                      ? "text-brand-purple bg-brand-purple/5"
                      : "text-foreground"
                  )}
                >
                  {t(planId)}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {ALL_FEATURE_KEYS.map((key, i) => {
              const avail = PLAN_AVAILABILITY[key];
              return (
                <div
                  key={key}
                  className={cn(
                    "grid grid-cols-4 gap-0 border-b border-border/20 last:border-b-0",
                    i % 2 === 0 ? "bg-white" : "bg-muted/10"
                  )}
                >
                  <div className="p-3 sm:p-4 text-sm text-foreground/80 flex items-center">
                    {t(`features.${key}`)}
                  </div>
                  {avail.map((has, colIdx) => (
                    <div
                      key={colIdx}
                      className={cn(
                        "p-3 sm:p-4 flex items-center justify-center",
                        colIdx === 1 && "bg-brand-purple/[0.02]"
                      )}
                    >
                      {has ? (
                        <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="size-3.5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted">
                          <X className="size-3.5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                    */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0b1a] via-[#1e1a30] to-[#2d1f4e] py-20 sm:py-28">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-brand-purple/10 blur-[150px]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Pret a commencer ?
          </h2>
          <p className="mt-5 text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Inscrivez-vous gratuitement et explorez la plateforme. Aucune carte de credit requise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-brand-purple hover:bg-brand-purple-dark text-white shadow-xl shadow-brand-purple/30 px-8 h-12 text-base font-semibold"
            >
              <Link to="/inscription">
                Commencer gratuitement
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 h-12 text-base font-semibold"
            >
              <Link to="/contact">
                {t("contactUs")}
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
