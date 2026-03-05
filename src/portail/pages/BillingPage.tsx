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
import { PLANS, PURCHASABLE_PLANS, type PlanId } from "@/lib/stripe";
import { PageHeader } from "@/components/shared/PageHeader";
import type { BillingPeriod } from "@/types/database";

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

const PLAN_LABELS: Record<PlanId, string> = {
  observer: "Observateur",
  member: "Membre",
  expert: "Expert",
  honorary: "Honoraire",
};

const PLAN_ICONS: Record<PlanId, typeof Eye> = {
  observer: Eye,
  member: Users,
  expert: Crown,
  honorary: Crown,
};

const PLAN_ICON_COLORS: Record<PlanId, string> = {
  observer: "bg-gray-100 text-gray-600",
  member: "bg-[#57886c]/10 text-[#57886c]",
  expert: "bg-amber-100 text-amber-600",
  honorary: "bg-slate-100 text-slate-600",
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
    label: "Annul\u00e9",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  unpaid: {
    label: "Impay\u00e9",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  incomplete: {
    label: "Incomplet",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
};

const PLAN_FEATURES: Record<PlanId, string[]> = {
  observer: [
    "1 membre",
    "3 syst\u00e8mes IA",
    "Tableau de bord basique",
    "Registre IA",
  ],
  member: [
    "Jusqu'\u00e0 10 membres",
    "Syst\u00e8mes IA illimit\u00e9s",
    "\u00c9valuations de risques",
    "Rapports de conformit\u00e9",
    "Support prioritaire",
  ],
  expert: [
    "Membres illimit\u00e9s",
    "Syst\u00e8mes IA illimit\u00e9s",
    "Toutes les fonctionnalit\u00e9s",
    "SSO / SAML",
    "Support d\u00e9di\u00e9",
    "SLA garanti",
  ],
  honorary: [
    "Membres illimit\u00e9s",
    "Syst\u00e8mes IA illimit\u00e9s",
    "Toutes les fonctionnalit\u00e9s",
    "Acc\u00e8s Expert complet",
  ],
};

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
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const plansSectionRef = useRef<HTMLDivElement>(null);

  /* ---- URL params toast on mount ---- */
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (toastShownRef.current) return;
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toastShownRef.current = true;
      toast.success(t("toastSuccess", "Abonnement mis \u00e0 jour avec succ\u00e8s !"));
      setSearchParams({}, { replace: true });
    } else if (canceled === "true") {
      toastShownRef.current = true;
      toast.info(t("toastCanceled", "Paiement annul\u00e9."));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

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

  const scrollToPlans = () => {
    plansSectionRef.current?.scrollIntoView({ behavior: "smooth" });
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
          description={t("pageDescription", "G\u00e9rez votre abonnement et vos paiements")}
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
              "Vous devez rejoindre ou cr\u00e9er une organisation pour g\u00e9rer la facturation."
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
          description={t("pageDescription", "G\u00e9rez votre abonnement et vos paiements")}
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
        <div className="grid gap-6 md:grid-cols-3">
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
        description={t("pageDescription", "G\u00e9rez votre abonnement et vos paiements")}
        icon={CreditCard}
        helpNs="billing"
      />

      {/* ---- Current Plan Card ---- */}
      {currentPlan === "observer" ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-muted-foreground">
          <span>{t("currentPlan.title", "Forfait actuel")} :</span>
          <Badge variant="outline" className={PLAN_BADGE_COLORS.observer}>
            {PLAN_LABELS.observer}
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
                  {PLAN_LABELS[currentPlan]}
                </Badge>
                <Badge variant="outline" className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </div>

              {subscription?.billing_period && (
                <p className="text-sm text-muted-foreground">
                  {t("currentPlan.period", "P\u00e9riode de facturation :")}{" "}
                  <span className="font-medium text-foreground">
                    {subscription.billing_period === "monthly"
                      ? t("period.monthly", "Mensuel")
                      : t("period.yearly", "Annuel")}
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
                      "Votre abonnement sera annul\u00e9 \u00e0 la fin de la p\u00e9riode en cours."
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
                  : t("actions.manageBilling", "G\u00e9rer les paiements")}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ---- Plans Section ---- */}
      <div ref={plansSectionRef} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {t("plans.title", "Choisir un forfait")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("plans.description", "S\u00e9lectionnez le forfait adapt\u00e9 \u00e0 vos besoins")}
            </p>
          </div>

          {/* Monthly / Yearly pill toggle */}
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t("period.monthly", "Mensuel")}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5 ${
                billingPeriod === "yearly"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t("period.yearly", "Annuel")}
              <span className="rounded-full bg-[#57886c]/10 text-[#57886c] px-2 py-0.5 text-xs font-semibold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards grid — always 3 columns */}
        <div className="grid gap-6 md:grid-cols-3">
          {PURCHASABLE_PLANS.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = currentPlan === planId;
            const price =
              billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const features = PLAN_FEATURES[planId];
            const Icon = PLAN_ICONS[planId];
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={planId}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  isHighlighted
                    ? "border-[#57886c] ring-1 ring-[#57886c]/20 shadow-md"
                    : "border-neutral-200"
                } ${isCurrent ? "bg-neutral-50" : "bg-white"}`}
              >
                {/* Top badge */}
                {isHighlighted && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#57886c] px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                      Recommand\u00e9
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Forfait actuel
                    </span>
                  </div>
                )}

                <div className="space-y-5 flex-1">
                  {/* Icon + plan name */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${PLAN_ICON_COLORS[planId]}`}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {PLAN_LABELS[planId]}
                    </h3>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-neutral-900">
                        {price === 0
                          ? t("plans.free", "Gratuit")
                          : `${price.toLocaleString("fr-CA")}\u00a0$`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-neutral-500">
                          /{" "}
                          {billingPeriod === "monthly"
                            ? t("plans.perMonth", "mois")
                            : t("plans.perYear", "an")}
                        </span>
                      )}
                    </div>
                    {price > 0 && billingPeriod === "yearly" && (
                      <p className="mt-1 text-xs text-neutral-400">
                        soit {Math.round(price / 12).toLocaleString("fr-CA")}$ / mois
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-sm">
                    {features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#57886c]/10">
                          <Check className="size-3 text-[#57886c]" />
                        </div>
                        <span className="text-neutral-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <div className="mt-6 space-y-2">
                  {isCurrent ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-6 py-2.5 text-sm font-semibold text-neutral-400 cursor-default"
                    >
                      Forfait actuel
                    </button>
                  ) : planId === "observer" ? (
                    <button
                      onClick={handleManageBilling}
                      disabled={customerPortal.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                      {t("plans.downgrade", "R\u00e9trograder")}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChoosePlan(planId)}
                      disabled={createCheckout.isPending}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                        planId === "member"
                          ? "bg-[#57886c] hover:bg-[#466060]"
                          : "bg-neutral-900 hover:bg-neutral-800"
                      }`}
                    >
                      {createCheckout.isPending
                        ? t("plans.processing", "Traitement...")
                        : t("plans.choose", "Choisir ce forfait")}
                      <ArrowRight className="size-4" />
                    </button>
                  )}

                  {planId === "expert" && !isCurrent && (
                    <a
                      href="mailto:contact@gouvernanceai.ca"
                      className="flex w-full items-center justify-center text-xs text-neutral-500 hover:text-neutral-700 transition-colors py-1"
                    >
                      {t("plans.contactUs", "Contactez-nous")}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA for observers */}
        {currentPlan === "observer" && (
          <div className="text-center pt-2">
            <button
              onClick={scrollToPlans}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#57886c] hover:text-[#466060] transition-colors"
            >
              Comparer les fonctionnalit\u00e9s en d\u00e9tail
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
