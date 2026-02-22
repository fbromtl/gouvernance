import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CreditCard,
  ExternalLink,
  ArrowUpRight,
  AlertTriangle,
  Check,
  Crown,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  useSubscription,
  useCreateCheckout,
  useCustomerPortal,
} from "@/hooks/useSubscription";
import { PLANS, type PlanId } from "@/lib/stripe";
import { PageHeader } from "@/components/shared/PageHeader";
import type { BillingPeriod } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PLAN_BADGE_COLORS: Record<PlanId, string> = {
  observer: "bg-gray-100 text-gray-700 border-gray-200",
  member: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
  expert: "bg-amber-100 text-amber-800 border-amber-200",
  honorary: "bg-slate-100 text-slate-600 border-slate-200",
};

const PLAN_LABELS: Record<PlanId, string> = {
  observer: "Observateur",
  member: "Membre",
  expert: "Expert",
  honorary: "Honoraire",
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
        {/* Current plan skeleton */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </Card>
        {/* Actions skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        {/* Plan cards skeleton */}
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
      <Card className="p-6">
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
              <div className="flex items-center gap-2 mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
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
        </div>
      </Card>

      {/* ---- Quick Actions ---- */}
      <div className="flex flex-wrap gap-3">
        {subscription?.stripe_customer_id && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={customerPortal.isPending}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {customerPortal.isPending
              ? t("actions.loading", "Chargement...")
              : t("actions.manageBilling", "G\u00e9rer les paiements")}
          </Button>
        )}

        {currentPlan !== "expert" && (
          <Button onClick={scrollToPlans} className="bg-brand-purple hover:bg-brand-purple-dark">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            {t("actions.upgrade", "Mettre \u00e0 niveau")}
          </Button>
        )}
      </div>

      <Separator />

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

          {/* Monthly / Yearly toggle */}
          <div className="flex items-center gap-3">
            <Label
              htmlFor="billing-toggle"
              className={
                billingPeriod === "monthly"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {t("period.monthly", "Mensuel")}
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingPeriod === "yearly"}
              onCheckedChange={(checked) =>
                setBillingPeriod(checked ? "yearly" : "monthly")
              }
            />
            <Label
              htmlFor="billing-toggle"
              className={
                billingPeriod === "yearly"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {t("period.yearly", "Annuel")}
              <Badge variant="secondary" className="ml-2 text-xs">
                -17%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Plan cards grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = currentPlan === planId;
            const price =
              billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const features = PLAN_FEATURES[planId];

            return (
              <Card
                key={planId}
                className={`relative flex flex-col p-6 ${
                  plan.highlighted
                    ? "border-brand-purple ring-1 ring-brand-purple/20"
                    : ""
                } ${isCurrent ? "bg-muted/30" : ""}`}
              >
                {/* Highlight badge */}
                {plan.highlighted && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-purple text-white">
                      {t("plans.popular", "Populaire")}
                    </Badge>
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">
                      <Check className="mr-1 h-3 w-3" />
                      {t("plans.current", "Forfait actuel")}
                    </Badge>
                  </div>
                )}

                <div className="space-y-4 flex-1">
                  {/* Plan name */}
                  <div className="flex items-center gap-2 pt-2">
                    {planId === "expert" && (
                      <Crown className="h-5 w-5 text-amber-500" />
                    )}
                    <h3 className="text-lg font-semibold">
                      {PLAN_LABELS[planId]}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {price === 0 ? t("plans.free", "Gratuit") : `${price}\u00a0\u20ac`}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        /{" "}
                        {billingPeriod === "monthly"
                          ? t("plans.perMonth", "mois")
                          : t("plans.perYear", "an")}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 text-sm">
                    {features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <div className="mt-6 space-y-2">
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      {t("plans.current", "Forfait actuel")}
                    </Button>
                  ) : planId === "observer" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageBilling}
                      disabled={customerPortal.isPending}
                    >
                      {t("plans.downgrade", "R\u00e9trograder")}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        planId === "member"
                          ? "bg-brand-purple hover:bg-brand-purple-dark"
                          : "bg-amber-600 hover:bg-amber-700"
                      }`}
                      onClick={() => handleChoosePlan(planId)}
                      disabled={createCheckout.isPending}
                    >
                      {createCheckout.isPending
                        ? t("plans.processing", "Traitement...")
                        : t("plans.choose", "Choisir")}
                    </Button>
                  )}

                  {planId === "expert" && !isCurrent && (
                    <Button variant="link" asChild className="w-full text-sm">
                      <a href="mailto:contact@gouvernanceai.ca">
                        {t("plans.contactUs", "Contactez-nous")}
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
