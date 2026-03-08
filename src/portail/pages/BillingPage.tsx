import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CreditCard,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  Check,
  Crown,
  Eye,
  Users,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  useSubscription,
  useCreateCheckout,
  useCustomerPortal,
} from "@/hooks/useSubscription";
import {
  PLANS,
  PURCHASABLE_PLANS,
  CURRENCY_PRICES,
  currencySymbol,
  detectCurrency,
  type PlanId,
  type Currency,
} from "@/lib/stripe";
import { PageHeader } from "@/components/shared/PageHeader";
import type { BillingPeriod } from "@/types/database";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PLAN_BADGE_COLORS: Record<PlanId, string> = {
  observer: "bg-gray-100 text-gray-700 border-gray-200",
  member: "bg-brand-forest/10 text-brand-forest border-brand-forest/20",
  expert: "bg-amber-100 text-amber-800 border-amber-200",
  honorary: "bg-slate-200 text-slate-700 border-slate-300",
};

const PLAN_ICONS: Record<PlanId, typeof Eye> = {
  observer: Eye,
  member: Users,
  expert: Crown,
  honorary: Crown,
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: {
    label: "Actif",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  trialing: {
    label: "Essai",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  past_due: {
    label: "Paiement en retard",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  canceled: {
    label: "Annulé",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  unpaid: {
    label: "Impayé",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  incomplete: {
    label: "Incomplet",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
};

/* ------------------------------------------------------------------ */
/*  Feature lists (mirrors TarifsPage)                                 */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  key: string;
  interpolation?: Record<string, number>;
}

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
  { key: "trust_mark" },
  { key: "dedicated_consultant" },
  { key: "monitoring" },
  { key: "data_catalog" },
  { key: "governance_structure" },
  { key: "support_dedicated" },
  { key: "members_unlimited" },
  { key: "priority_visibility" },
];

const PLAN_FEATURE_MAP: Record<PlanId, PlanFeature[]> = {
  observer: OBSERVER_FEATURES,
  member: MEMBER_FEATURES,
  expert: EXPERT_FEATURES,
  honorary: EXPERT_FEATURES,
};

/* ------------------------------------------------------------------ */
/*  Plan order for upgrade/downgrade logic                             */
/* ------------------------------------------------------------------ */

const PLAN_ORDER: PlanId[] = ["observer", "member", "expert", "honorary"];

/* ================================================================== */
/*  BILLING PAGE                                                       */
/* ================================================================== */

export default function BillingPage() {
  const { t } = useTranslation("billing");
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const { data: subscription, isLoading } = useSubscription();
  const createCheckout = useCreateCheckout();
  const customerPortal = useCustomerPortal();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isYearly, setIsYearly] = useState(true);
  const [currency, setCurrency] = useState<Currency>(detectCurrency);

  const billingPeriod: BillingPeriod = isYearly ? "yearly" : "monthly";

  /* ---- URL params toast on mount ---- */
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (toastShownRef.current) return;
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toastShownRef.current = true;
      toast.success(t("toastSuccess", "Abonnement mis à jour avec succès !"));
      setSearchParams({}, { replace: true });
    } else if (canceled === "true") {
      toastShownRef.current = true;
      toast.info(t("toastCanceled", "Paiement annulé."));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  /* ---- Helpers ---- */
  const formatPrice = (planId: PlanId) => {
    const prices = CURRENCY_PRICES[currency][planId];
    if (isYearly) {
      return prices.yearly > 0 ? Math.round(prices.yearly / 12) : 0;
    }
    return prices.monthly;
  };

  /* ---- Actions ---- */
  const handleManageBilling = async () => {
    if (!orgId) return;
    try {
      const url = await customerPortal.mutateAsync(orgId);
      window.location.href = url;
    } catch {
      toast.error(t("portalError", "Impossible d'ouvrir le portail de paiement."));
    }
  };

  const handleChoosePlan = async (plan: PlanId) => {
    if (!orgId) return;
    try {
      const url = await createCheckout.mutateAsync({
        plan,
        period: billingPeriod,
        organizationId: orgId,
      });
      window.location.href = url;
    } catch {
      toast.error(t("checkoutError", "Impossible de lancer le paiement."));
    }
  };

  const currentPlan = subscription?.plan ?? "observer";

  /* ================================================================ */
  /*  No org state                                                     */
  /* ================================================================ */

  if (!orgId) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title={t("pageTitle", "Facturation")}
          description={t("pageDescription", "Gérez votre abonnement et vos paiements")}
          icon={CreditCard}
          helpNs="billing"
        />
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            {t("noOrg.title", "Aucune organisation")}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {t(
              "noOrg.description",
              "Vous devez rejoindre ou créer une organisation pour gérer la facturation."
            )}
          </p>
        </Card>
      </div>
    );
  }

  /* ================================================================ */
  /*  Loading state                                                    */
  /* ================================================================ */

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title={t("pageTitle", "Facturation")}
          description={t("pageDescription", "Gérez votre abonnement et vos paiements")}
          icon={CreditCard}
          helpNs="billing"
        />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Main content                                                     */
  /* ================================================================ */

  const statusInfo = STATUS_BADGE[subscription?.status ?? "active"] ?? STATUS_BADGE.active;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* ---- Page header ---- */}
      <PageHeader
        title={t("pageTitle", "Facturation")}
        description={t("pageDescription", "Gérez votre abonnement et vos paiements")}
        icon={CreditCard}
        helpNs="billing"
      />

      {/* ---- Current Plan Card ---- */}
      {currentPlan === "observer" ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-muted-foreground">
          <span>{t("currentPlan.title", "Forfait actuel")} :</span>
          <Badge variant="outline" className={PLAN_BADGE_COLORS.observer}>
            {t("observer")}
          </Badge>
          <span className="text-xs">({t("plans.free", "Gratuit")})</span>
        </div>
      ) : (
        <Card className="p-6 rounded-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold">
                  {t("currentPlan.title", "Forfait actuel")}
                </h2>
                <Badge
                  variant="outline"
                  className={PLAN_BADGE_COLORS[currentPlan]}
                >
                  {t(currentPlan)}
                </Badge>
                <Badge variant="outline" className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </div>

              {subscription?.billing_period && (
                <p className="text-sm text-muted-foreground">
                  {t("currentPlan.period", "Période de facturation :")}{" "}
                  <span className="font-medium text-foreground">
                    {subscription.billing_period === "monthly"
                      ? t("monthly", "Mensuel")
                      : t("yearly", "Annuel")}
                  </span>
                </p>
              )}

              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  {t("currentPlan.nextBilling", "Prochaine facturation :")}{" "}
                  <span className="font-medium text-foreground">
                    {format(
                      new Date(subscription.current_period_end),
                      "d MMMM yyyy",
                      { locale: fr }
                    )}
                  </span>
                </p>
              )}

              {subscription?.cancel_at_period_end && (
                <div className="flex items-center gap-2 mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p>
                    {t(
                      "currentPlan.cancelWarning",
                      "Votre abonnement sera annulé à la fin de la période en cours."
                    )}
                  </p>
                </div>
              )}
            </div>

            {subscription?.stripe_customer_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={customerPortal.isPending}
                className="shrink-0"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {customerPortal.isPending
                  ? t("actions.loading", "Chargement...")
                  : t("actions.manageBilling", "Gérer les paiements")}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ---- Plans Section ---- */}
      <div className="space-y-6">
        {/* Header + Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {t("plans.title", "Choisir un forfait")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("plans.description", "Sélectionnez le forfait adapté à vos besoins")}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Monthly / Yearly toggle */}
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                  !isYearly
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {t("monthly", "Mensuel")}
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all flex items-center gap-1.5",
                  isYearly
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {t("yearly", "Annuel")}
                <Badge className="bg-brand-forest text-white text-[10px] px-2 py-0.5 rounded-full border-0 font-bold">
                  -20%
                </Badge>
              </button>
            </div>

            {/* Currency selector */}
            <div className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 border border-neutral-200 p-0.5">
              {(["CAD", "EUR", "USD"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    currency === c
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plan cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-4 items-start">
          {PURCHASABLE_PLANS.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = currentPlan === planId;
            const isHighlighted = plan.highlighted;
            const price = formatPrice(planId);
            const features = PLAN_FEATURE_MAP[planId];

            const currentIdx = PLAN_ORDER.indexOf(currentPlan);
            const targetIdx = PLAN_ORDER.indexOf(planId);
            const isUpgrade = targetIdx > currentIdx;
            const isDowngrade = targetIdx < currentIdx;

            const Icon = PLAN_ICONS[planId];

            return (
              <div
                key={planId}
                className={cn(
                  "relative group rounded-2xl transition-all duration-300",
                  isHighlighted ? "lg:-mt-3 lg:mb-[-12px]" : ""
                )}
              >
                {/* Gradient border for highlighted */}
                {isHighlighted && (
                  <div className="absolute -inset-[2px] rounded-2xl bg-brand-forest" />
                )}

                <div
                  className={cn(
                    "relative rounded-2xl bg-white border overflow-hidden transition-all duration-300",
                    "hover:shadow-xl hover:shadow-brand-forest/5 hover:-translate-y-0.5",
                    isHighlighted
                      ? "border-transparent shadow-2xl shadow-brand-forest/10"
                      : "border-border/60 shadow-lg shadow-black/5"
                  )}
                >
                  {/* Recommended badge */}
                  {isHighlighted && !isCurrent && (
                    <div className="bg-brand-forest py-2 text-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t("recommended")}
                      </span>
                    </div>
                  )}

                  <div className={cn("p-6 sm:p-7", isHighlighted && !isCurrent && "pt-5")}>
                    {/* Plan icon + name + current badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg",
                          isHighlighted
                            ? "bg-brand-forest/10 text-brand-forest"
                            : planId === "expert"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {t(planId)}
                      </h3>
                      {isCurrent && (
                        <Badge variant="secondary" className="ml-auto text-[10px] font-bold bg-brand-forest/10 text-brand-forest border-0">
                          {t("currentPlan")}
                        </Badge>
                      )}
                    </div>

                    {/* Subtitle */}
                    <p className="text-sm text-muted-foreground mb-5">
                      {t(`idealFor.${planId}`)}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {planId === "expert" && (
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
                            {t("perMonth")}
                          </span>
                        )}
                      </div>
                      {price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {isYearly
                            ? t("billedAnnually", {
                                price: CURRENCY_PRICES[currency][planId].yearly.toLocaleString(),
                                symbol: currencySymbol(currency),
                              })
                            : t("noCommitment")}
                        </p>
                      )}
                    </div>

                    {/* CTA buttons */}
                    <div className="space-y-2.5 mb-6">
                      {isCurrent ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full h-10 font-semibold text-sm pointer-events-none opacity-60"
                        >
                          {t("currentPlan")}
                        </Button>
                      ) : isDowngrade ? (
                        <Button
                          variant="outline"
                          className="w-full h-10 font-semibold text-sm"
                          onClick={handleManageBilling}
                          disabled={customerPortal.isPending}
                        >
                          {customerPortal.isPending
                            ? t("actions.loading", "Chargement...")
                            : t("downgrade")}
                        </Button>
                      ) : (
                        <Button
                          className={cn(
                            "w-full h-10 font-semibold text-sm transition-all duration-200",
                            isHighlighted
                              ? "bg-brand-forest hover:bg-brand-teal text-white shadow-md shadow-brand-forest/20"
                              : planId === "expert"
                                ? "bg-foreground hover:bg-foreground/90 text-white"
                                : ""
                          )}
                          onClick={() => handleChoosePlan(planId)}
                          disabled={createCheckout.isPending}
                        >
                          {createCheckout.isPending
                            ? t("actions.loading", "Chargement...")
                            : t("upgrade")}
                          {!createCheckout.isPending && <ArrowRight className="size-3.5 ml-1.5" />}
                        </Button>
                      )}
                      {planId === "expert" && !isCurrent && (
                        <Button asChild variant="outline" className="w-full h-10 font-semibold text-sm">
                          <a href="mailto:contact@gouvernanceai.ca">
                            {t("contactUs")}
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Features */}
                    <div className="border-t border-border/40 pt-5">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {planId === "observer"
                          ? t("included")
                          : planId === "member"
                            ? t("allFromObserver")
                            : t("allFromMember")}
                      </p>
                      <ul className="space-y-2.5">
                        {features.map((feat) => (
                          <li key={feat.key} className="flex items-start gap-2">
                            <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-brand-forest/10 mt-0.5">
                              <Check className="size-3 text-brand-forest" />
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
