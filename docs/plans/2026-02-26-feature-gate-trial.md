# FeatureGate Free Trial — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the FeatureGate modal into a conversion modal with 15-day free trial of the Membre plan, monthly/yearly toggle, and direct Stripe Checkout.

**Architecture:** Enrich the existing `FeatureGate.tsx` component with trial UI (features list, period toggle, pricing, CTA). The CTA calls `useCreateCheckout` which hits the `stripe-checkout` edge function — both extended to accept `trialDays` / `trial_period_days`. No DB migration needed (`trialing` status already exists).

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Stripe Checkout Sessions, Supabase Edge Functions (Deno), react-i18next

---

### Task 1: Add i18n keys (FR + EN)

**Files:**
- Modify: `src/i18n/locales/fr/billing.json` (gate block, lines 92-98)
- Modify: `src/i18n/locales/en/billing.json` (gate block, lines 92-96)

**Step 1: Add new keys to FR billing.json**

Replace the `gate` block (lines 92-98) with:

```json
"gate": {
  "title": "Réservé aux Membres",
  "description": "Cette fonctionnalité est disponible avec le niveau {{plan}} ou supérieur.",
  "upgrade": "Devenir Membre",
  "preview": "Aperçu — Cette fonctionnalité est réservée aux Membres",
  "unlock": "Débloquer cette fonctionnalité",
  "trialSubtitle": "Débloquez toutes les fonctionnalités pendant 15 jours",
  "trialFeature1": "Évaluations de risques",
  "trialFeature2": "Conformité & audits",
  "trialFeature3": "Gestion des incidents",
  "trialFeature4": "Export PDF & chat IA",
  "trialCta": "Essayer gratuitement 15 jours",
  "trialReassurance": "Aucun paiement avant 15 jours · Annulez à tout moment",
  "priceMonthly": "{{price}} $ / mois",
  "priceYearly": "{{price}} $ / an",
  "afterTrial": "après l'essai gratuit",
  "discount": "-17 %",
  "toggleMonthly": "Mensuel",
  "toggleYearly": "Annuel"
}
```

**Step 2: Add new keys to EN billing.json**

Replace the `gate` block (lines 92-96) with:

```json
"gate": {
  "title": "Members only",
  "description": "This feature is available with the {{plan}} level or higher.",
  "upgrade": "Become a Member",
  "preview": "Preview — This feature is reserved for Members",
  "unlock": "Unlock this feature",
  "trialSubtitle": "Unlock all features for 15 days",
  "trialFeature1": "Risk assessments",
  "trialFeature2": "Compliance & audits",
  "trialFeature3": "Incident management",
  "trialFeature4": "PDF exports & AI chat",
  "trialCta": "Try free for 15 days",
  "trialReassurance": "No charge for 15 days · Cancel anytime",
  "priceMonthly": "{{price}} $ / month",
  "priceYearly": "{{price}} $ / year",
  "afterTrial": "after free trial",
  "discount": "-17%",
  "toggleMonthly": "Monthly",
  "toggleYearly": "Yearly"
}
```

**Step 3: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/fr/billing.json','utf8')); console.log('FR OK')" && node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en/billing.json','utf8')); console.log('EN OK')"`

Expected: `FR OK` then `EN OK`

**Step 4: Commit**

```bash
git add src/i18n/locales/fr/billing.json src/i18n/locales/en/billing.json
git commit -m "feat(i18n): add FeatureGate trial keys (FR + EN)"
```

---

### Task 2: Add `trialDays` param to `useCreateCheckout`

**Files:**
- Modify: `src/hooks/useSubscription.ts` (lines 55-92)

**Step 1: Add `trialDays` to the mutation params type and body**

In `useCreateCheckout` (line 55-92), add `trialDays?: number` to the params type, and include it in the fetch body as `trial_period_days`.

Replace lines 57-61:
```ts
    mutationFn: async (params: {
      plan: SubscriptionPlan;
      period: BillingPeriod;
      organizationId: string;
    }) => {
```

With:
```ts
    mutationFn: async (params: {
      plan: SubscriptionPlan;
      period: BillingPeriod;
      organizationId: string;
      trialDays?: number;
    }) => {
```

Then replace lines 74-80 (the `body: JSON.stringify({...})` block):
```ts
        body: JSON.stringify({
          plan: params.plan,
          period: params.period,
          organization_id: params.organizationId,
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        }),
```

With:
```ts
        body: JSON.stringify({
          plan: params.plan,
          period: params.period,
          organization_id: params.organizationId,
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
          ...(params.trialDays ? { trial_period_days: params.trialDays } : {}),
        }),
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 3: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat(billing): add trialDays param to useCreateCheckout"
```

---

### Task 3: Accept `trial_period_days` in stripe-checkout edge function

**Files:**
- Modify: `supabase/functions/stripe-checkout/index.ts` (lines 128-142, 216-227)

**Step 1: Parse `trial_period_days` from body**

In the body destructuring block (lines 130-142), add `trial_period_days` as an optional field.

Replace lines 130-142:
```ts
    const body = await req.json();
    const {
      plan,
      period,
      organization_id,
      success_url,
      cancel_url,
    }: {
      plan: string;
      period: string;
      organization_id: string;
      success_url: string;
      cancel_url: string;
    } = body;
```

With:
```ts
    const body = await req.json();
    const {
      plan,
      period,
      organization_id,
      success_url,
      cancel_url,
      trial_period_days,
    }: {
      plan: string;
      period: string;
      organization_id: string;
      success_url: string;
      cancel_url: string;
      trial_period_days?: number;
    } = body;
```

**Step 2: Pass `trial_period_days` to Stripe session params**

After line 227 (`sessionParams.append("subscription_data[metadata][plan]", plan);`), add:

```ts
    // Free trial
    if (trial_period_days && trial_period_days > 0) {
      sessionParams.append("subscription_data[trial_period_days]", String(trial_period_days));
    }
```

**Step 3: Verify TypeScript (Deno check)**

Run: `npx tsc --noEmit`
Expected: zero errors (edge functions may not be checked by frontend tsconfig — that's fine, the Deno types are separate)

**Step 4: Commit**

```bash
git add supabase/functions/stripe-checkout/index.ts
git commit -m "feat(stripe): accept trial_period_days in checkout edge function"
```

---

### Task 4: Rewrite FeatureGate.tsx as enriched trial modal

**Files:**
- Modify: `src/components/shared/FeatureGate.tsx` (full rewrite of the component)

**Step 1: Rewrite FeatureGate.tsx**

Replace the entire file content with:

```tsx
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { useCreateCheckout } from '@/hooks/useSubscription';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** When true, render nothing if feature is missing (for hiding UI fragments) */
  silent?: boolean;
}

const TRIAL_FEATURES = [
  'trialFeature1',
  'trialFeature2',
  'trialFeature3',
  'trialFeature4',
] as const;

const PRICES = { monthly: 99, yearly: 990 } as const;

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature } = usePlanFeatures();
  const { t } = useTranslation('billing');
  const { profile } = useAuth();
  const checkout = useCreateCheckout();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Feature is available → render children normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Silent mode → hide entirely
  if (silent) return null;

  const price = PRICES[period];

  const handleTrial = () => {
    if (!profile?.organization_id) return;
    checkout.mutate(
      {
        plan: 'member',
        period,
        organizationId: profile.organization_id,
        trialDays: 15,
      },
      {
        onSuccess: (url) => {
          window.location.href = url;
        },
      },
    );
  };

  // Preview mode → show children with blur + centered trial modal
  return (
    <div className="relative">
      {/* Content wrapper with blur overlay */}
      <div className="relative overflow-hidden select-none pointer-events-none">
        <div aria-hidden="true">
          {children}
        </div>

        {/* Full blur overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            background: 'rgba(255,255,255,0.4)',
          }}
        />
      </div>

      {/* Centered trial modal */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md mx-4 bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-neutral-200/50 p-8 text-center">
          {/* Lock icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ab54f3]/10">
            <Lock className="h-7 w-7 text-[#ab54f3]" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            {t('gate.title')}
          </h3>

          {/* Subtitle */}
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
            {t('gate.trialSubtitle')}
          </p>

          {/* Features list */}
          <ul className="mt-5 space-y-2 text-left">
            {TRIAL_FEATURES.map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {t(`gate.${key}`)}
              </li>
            ))}
          </ul>

          {/* Period toggle */}
          <div className="mt-6 inline-flex items-center rounded-full bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                period === 'monthly'
                  ? 'bg-[#ab54f3] text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t('gate.toggleMonthly')}
            </button>
            <button
              type="button"
              onClick={() => setPeriod('yearly')}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                period === 'yearly'
                  ? 'bg-[#ab54f3] text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t('gate.toggleYearly')}
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                {t('gate.discount')}
              </span>
            </button>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="text-2xl font-bold text-neutral-900">
              {period === 'monthly'
                ? t('gate.priceMonthly', { price })
                : t('gate.priceYearly', { price })}
            </span>
            <p className="mt-1 text-xs text-neutral-400">{t('gate.afterTrial')}</p>
          </div>

          {/* CTA button */}
          <Button
            className="mt-6 w-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] text-white rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all font-semibold"
            onClick={handleTrial}
            disabled={checkout.isPending}
          >
            {checkout.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t('gate.trialCta')}
          </Button>

          {/* Reassurance */}
          <p className="mt-3 text-[11px] text-neutral-400">
            {t('gate.trialReassurance')}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 3: Commit**

```bash
git add src/components/shared/FeatureGate.tsx
git commit -m "feat(gate): enriched trial modal with period toggle and Stripe checkout"
```

---

### Task 5: Final verification and push

**Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 2: Push**

Run: `git push`
