import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Eye, Users, Crown, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO, JsonLd } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { PLANS, CURRENCY_PRICES, type PlanId, type Currency, currencySymbol, detectCurrency } from "@/lib/stripe";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  key: string;
  interpolation?: Record<string, number>;
}

interface PlanCardConfig {
  id: PlanId;
  icon: typeof Eye;
  features: PlanFeature[];
  ctaTo: string;
  ctaLabel: string;
  secondaryCta?: { to: string; label: string };
}

/* ------------------------------------------------------------------ */
/*  PLAN CONFIGURATIONS                                                 */
/* ------------------------------------------------------------------ */

const OBSERVER_FEATURES: PlanFeature[] = [
  { key: "dashboard" },
  { key: "ai_systems_limit", interpolation: { count: 3 } },
  { key: "lifecycle" },
  { key: "veille_read" },
  { key: "members", interpolation: { count: 1 } },
];

const MEMBER_FEATURES: PlanFeature[] = [
  { key: "ai_systems_unlimited" },
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
  { key: "member_directory" },
  { key: "public_profile" },
  { key: "linkedin_badge" },
];

const EXPERT_FEATURES: PlanFeature[] = [
  { key: "monitoring" },
  { key: "data_catalog" },
  { key: "governance_structure" },
  { key: "support_dedicated" },
  { key: "members_unlimited" },
  { key: "priority_visibility" },
];

const PLAN_CONFIGS: PlanCardConfig[] = [
  {
    id: "observer",
    icon: Eye,
    features: OBSERVER_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "choosePlan",
  },
  {
    id: "member",
    icon: Users,
    features: MEMBER_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "becomeMember",
  },
  {
    id: "expert",
    icon: Crown,
    features: EXPERT_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "becomeExpert",
    secondaryCta: { to: "/contact", label: "contactUs" },
  },
];

/* ------------------------------------------------------------------ */
/*  COMPARISON TABLE DATA                                               */
/* ------------------------------------------------------------------ */

type ComparisonRow =
  | { type: "feature"; key: string }
  | { type: "section"; labelKey: string };

const COMPARISON_ROWS: ComparisonRow[] = [
  { type: "feature", key: "dashboard" },
  { type: "feature", key: "ai_systems" },
  { type: "feature", key: "lifecycle" },
  { type: "feature", key: "veille_read" },
  { type: "feature", key: "risk_assessments" },
  { type: "feature", key: "incidents" },
  { type: "feature", key: "compliance" },
  { type: "feature", key: "decisions" },
  { type: "feature", key: "bias" },
  { type: "feature", key: "transparency" },
  { type: "feature", key: "vendors" },
  { type: "feature", key: "documents" },
  { type: "feature", key: "ai_chat" },
  { type: "feature", key: "export_pdf" },
  { type: "feature", key: "monitoring" },
  { type: "feature", key: "data_catalog" },
  { type: "feature", key: "governance_structure" },
  { type: "feature", key: "support_community" },
  { type: "feature", key: "support_email" },
  { type: "feature", key: "support_dedicated" },
  { type: "section", labelKey: "communityLabel" },
  { type: "feature", key: "member_directory" },
  { type: "feature", key: "public_profile" },
  { type: "feature", key: "linkedin_badge" },
  { type: "feature", key: "priority_visibility" },
];

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
  member_directory:      [false, true,  true],
  public_profile:        [false, true,  true],
  linkedin_badge:        [false, true,  true],
  priority_visibility:   [false, false, true],
};

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                  */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ------------------------------------------------------------------ */
/*  PLAN ORDER FOR HIERARCHY                                            */
/* ------------------------------------------------------------------ */

const PLAN_ORDER: PlanId[] = ["observer", "member", "expert", "honorary"];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export function TarifsPage() {
  const { t } = useTranslation("billing");
  const [isYearly, setIsYearly] = useState(true);
  const [currency, setCurrency] = useState<Currency>(detectCurrency);
  const { user } = useAuth();
  const { data: subscription } = useSubscription();

  const currentPlan = subscription?.plan ?? null;
  const isLoggedIn = !!user;

  const formatPrice = (plan: PlanId) => {
    const prices = CURRENCY_PRICES[currency][plan];
    if (isYearly) {
      return prices.yearly > 0 ? Math.round(prices.yearly / 12) : 0;
    }
    return prices.monthly;
  };

  const getCtaInfo = (config: PlanCardConfig) => {
    const planId = config.id;
    if (!isLoggedIn) {
      return { label: t(config.ctaLabel), variant: "default" as const, to: config.ctaTo };
    }
    if (currentPlan === planId) {
      return { label: t("currentPlan"), variant: "outline" as const, to: "/billing" };
    }
    const currentIdx = currentPlan ? PLAN_ORDER.indexOf(currentPlan as PlanId) : -1;
    const targetIdx = PLAN_ORDER.indexOf(planId);
    if (targetIdx > currentIdx) {
      return { label: t("upgrade"), variant: "default" as const, to: "/billing" };
    }
    return { label: t(config.ctaLabel), variant: "outline" as const, to: "/billing" };
  };

  return (
    <>
      <SEO
        title="Tarifs"
        description="Rejoignez le Cercle gouvernance.ai : Observateur, Membre ou Expert. Choisissez le niveau d'adhésion adapté à votre gouvernance IA."
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Membership — Cercle de Gouvernance de l'IA",
        "description": "Accédez aux ressources, événements et au réseau d'experts en gouvernance de l'IA.",
        "brand": {
          "@type": "Organization",
          "name": "Cercle de Gouvernance de l'IA",
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Observateur",
            "price": "0",
            "priceCurrency": "CAD",
            "availability": "https://schema.org/InStock",
            "description": "Accès gratuit aux ressources de base",
          },
          {
            "@type": "Offer",
            "name": "Membre",
            "price": "149",
            "priceCurrency": "CAD",
            "availability": "https://schema.org/InStock",
            "description": "Accès complet aux ressources et événements",
          },
          {
            "@type": "Offer",
            "name": "Expert",
            "price": "499",
            "priceCurrency": "CAD",
            "availability": "https://schema.org/InStock",
            "description": "Accès premium avec accompagnement personnalisé",
          },
        ],
      }} />

      {/* ============================================================ */}
      {/*  HERO — compact, everything above the fold                    */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0b1a] via-[#1e1a30] to-[#2d1f4e] pt-32 pb-20 sm:pt-36 sm:pb-24">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-purple/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-64 rounded-full bg-brand-purple-dark/15 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-6 border border-white/10"
          >
            <Shield className="size-3.5 text-brand-purple-light" />
            <span className="text-xs font-medium text-white/70 tracking-wide">
              {t("yearlyDiscount")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            {t("pricingTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed"
          >
            {t("pricingSubtitle")}
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 inline-flex items-center gap-1 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 p-1"
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
              <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full border-0 font-bold">
                -20%
              </Badge>
            </button>
          </motion.div>

          {/* Currency Selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 inline-flex items-center gap-0.5 rounded-full bg-white/5 border border-white/10 p-0.5"
          >
            {(["CAD", "EUR", "USD"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                  currency === c
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {c}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PLAN CARDS                                                    */}
      {/* ============================================================ */}
      <section className="relative -mt-10 pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-4 items-start"
          >
            {PLAN_CONFIGS.map((config) => {
              const plan = PLANS[config.id];
              const isHighlighted = plan.highlighted;
              const isCurrentPlan = currentPlan === config.id;
              const cta = getCtaInfo(config);
              const price = formatPrice(config.id);

              return (
                <motion.div
                  key={config.id}
                  variants={cardVariants}
                  className={cn(
                    "relative group rounded-2xl transition-all duration-300",
                    isHighlighted ? "lg:-mt-3 lg:mb-[-12px]" : ""
                  )}
                >
                  {/* Gradient border for highlighted */}
                  {isHighlighted && (
                    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-brand-purple via-brand-purple-light to-brand-purple-dark" />
                  )}

                  <div
                    className={cn(
                      "relative rounded-2xl bg-white border overflow-hidden transition-all duration-300",
                      "hover:shadow-xl hover:shadow-brand-purple/5 hover:-translate-y-0.5",
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

                    <div className={cn("p-6 sm:p-7", isHighlighted && "pt-5")}>
                      {/* Plan icon + name + current badge */}
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg",
                            isHighlighted
                              ? "bg-brand-purple/10 text-brand-purple"
                              : config.id === "expert"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          <config.icon className="size-4.5" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          {t(config.id)}
                        </h3>
                        {isCurrentPlan && (
                          <Badge variant="secondary" className="ml-auto text-[10px] font-bold bg-brand-purple/10 text-brand-purple border-0">
                            {t("currentPlan")}
                          </Badge>
                        )}
                      </div>

                      {/* Subtitle */}
                      <p className="text-sm text-muted-foreground mb-5">
                        {t(`idealFor.${config.id}`)}
                      </p>

                      {/* Price */}
                      <div className="mb-6">
                        {config.id === "expert" && (
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {t("startingAt")}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-4xl font-extrabold text-foreground tracking-tight">
                            {price === 0 ? `${currencySymbol(currency)}0` : `${currencySymbol(currency)}${price}`}
                          </span>
                          {price > 0 && (
                            <span className="text-sm text-muted-foreground font-medium">
                              {t("month")}
                            </span>
                          )}
                        </div>
                        {price > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {isYearly
                              ? t("billedAnnually", { price: CURRENCY_PRICES[currency][config.id].yearly.toLocaleString(), symbol: currencySymbol(currency) })
                              : t("noCommitment")}
                          </p>
                        )}
                      </div>

                      {/* CTA buttons */}
                      <div className="space-y-2.5 mb-6">
                        <Button
                          asChild
                          className={cn(
                            "w-full h-10 font-semibold text-sm transition-all duration-200",
                            isCurrentPlan
                              ? "pointer-events-none opacity-60"
                              : isHighlighted
                                ? "bg-brand-purple hover:bg-brand-purple-dark text-white shadow-md shadow-brand-purple/20"
                                : config.id === "expert"
                                  ? "bg-foreground hover:bg-foreground/90 text-white"
                                  : ""
                          )}
                          variant={cta.variant === "outline" ? "outline" : "default"}
                        >
                          <Link to={cta.to}>
                            {cta.label}
                            {!isCurrentPlan && <ArrowRight className="size-3.5 ml-1.5" />}
                          </Link>
                        </Button>
                        {config.secondaryCta && (
                          <Button asChild variant="outline" className="w-full h-10 font-semibold text-sm">
                            <Link to={config.secondaryCta.to}>
                              {t(config.secondaryCta.label)}
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Features */}
                      <div className="border-t border-border/40 pt-5">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {config.id === "observer"
                            ? t("included")
                            : config.id === "member"
                              ? t("allFromObserver")
                              : t("allFromMember")}
                        </p>
                        <ul className="space-y-2.5">
                          {config.features.map((feat) => (
                            <li key={feat.key} className="flex items-start gap-2">
                              <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                                <Check className="size-3 text-emerald-600" />
                              </div>
                              <span className="text-[13px] text-foreground/80 leading-snug">
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
      {/*  HONORARY MEMBERS BANNER                                       */}
      {/* ============================================================ */}
      <section className="pb-10 sm:pb-14">
        <div className="mx-auto max-w-3xl text-center py-6 px-8 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-muted-foreground">
            {t("honoraryBanner")}
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURE COMPARISON TABLE                                      */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {t("comparisonTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground text-base max-w-xl mx-auto">
              {t("comparisonSubtitle")}
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
            <div className="grid grid-cols-4 gap-0 border-b border-border/40 bg-muted/30">
              <div className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("featuresLabel")}
              </div>
              {(["observer", "member", "expert"] as const).map((planId) => (
                <div
                  key={planId}
                  className={cn(
                    "p-4 text-center text-sm font-bold",
                    planId === "member"
                      ? "text-brand-purple bg-brand-purple/5"
                      : "text-foreground"
                  )}
                >
                  {t(planId)}
                  {currentPlan === planId && (
                    <span className="block text-[10px] font-medium text-muted-foreground mt-0.5">
                      ({t("currentPlan")})
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {COMPARISON_ROWS.map((row, i) => {
              if (row.type === "section") {
                return (
                  <div
                    key={row.labelKey}
                    className="grid grid-cols-4 gap-0 border-b border-border/40 bg-muted/30"
                  >
                    <div className="col-span-4 p-3 sm:p-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t(row.labelKey)}
                    </div>
                  </div>
                );
              }

              const avail = PLAN_AVAILABILITY[row.key];
              return (
                <div
                  key={row.key}
                  className={cn(
                    "grid grid-cols-4 gap-0 border-b border-border/15 last:border-b-0 transition-colors",
                    "hover:bg-muted/20",
                    i % 2 === 0 ? "bg-white" : "bg-muted/5"
                  )}
                >
                  <div className="p-3 sm:p-3.5 text-sm text-foreground/80 flex items-center">
                    {t(`features.${row.key}`)}
                  </div>
                  {avail.map((has, colIdx) => (
                    <div
                      key={colIdx}
                      className={cn(
                        "p-3 sm:p-3.5 flex items-center justify-center",
                        colIdx === 1 && "bg-brand-purple/[0.02]"
                      )}
                    >
                      {has ? (
                        <div className="flex size-5.5 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="size-3 text-emerald-600" />
                        </div>
                      ) : (
                        <X className="size-3.5 text-muted-foreground/25" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0b1a] via-[#1e1a30] to-[#2d1f4e] py-16 sm:py-24">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-brand-purple/10 blur-[120px]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {t("readyTitle")}
          </h2>
          <p className="mt-4 text-base text-white/65 max-w-xl mx-auto leading-relaxed">
            {t("readySubtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-purple hover:bg-brand-purple-dark text-white shadow-xl shadow-brand-purple/25 px-7 h-11 text-sm font-semibold"
            >
              <Link to="/inscription">
                {t("startFree")}
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-7 h-11 text-sm font-semibold"
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
