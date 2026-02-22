# Stripe Subscription System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a complete Stripe-based subscription system with 3 plans (Free, Pro $99/mo, Enterprise $499+/mo), a public pricing page, portal billing management, and feature gating across the entire platform.

**Architecture:** Stripe Checkout Sessions (hosted) for payment collection, Supabase Edge Functions for backend (checkout creation, webhook handling, customer portal), PostgreSQL tables for subscription state, React Query hooks for frontend data fetching, and a `<FeatureGate>` component for plan-based access control.

**Tech Stack:** Stripe Checkout Sessions API, Supabase Edge Functions (Deno), PostgreSQL + RLS, React 19, TypeScript, shadcn/ui, React Query, i18next, Tailwind CSS 4

---

## Task 1: Database Migration — Subscription Tables

**Files:**
- Create: `supabase/migrations/20260221000001_create_subscription_tables.sql`

**Step 1: Write the migration SQL**

```sql
-- ============================================================
-- Subscription system tables
-- ============================================================

-- Plan type enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'enterprise');

-- Billing period enum
CREATE TYPE public.billing_period AS ENUM ('monthly', 'yearly');

-- Subscription status enum
CREATE TYPE public.subscription_status AS ENUM (
  'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete'
);

-- ============================================================
-- subscriptions table
-- ============================================================

CREATE TABLE public.subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan             public.subscription_plan NOT NULL DEFAULT 'free',
  billing_period   public.billing_period DEFAULT 'monthly',
  status           public.subscription_status NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_organization_id_key UNIQUE (organization_id)
);

-- Index for Stripe lookups
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- Updated_at trigger
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- plan_features table (config — which features each plan gets)
-- ============================================================

CREATE TABLE public.plan_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan        public.subscription_plan NOT NULL,
  feature_key text NOT NULL,
  enabled     boolean NOT NULL DEFAULT false,

  CONSTRAINT plan_features_plan_feature_key UNIQUE (plan, feature_key)
);

-- ============================================================
-- Seed plan_features with initial data
-- ============================================================

INSERT INTO public.plan_features (plan, feature_key, enabled) VALUES
  -- FREE plan
  ('free', 'dashboard', true),
  ('free', 'ai_systems', true),
  ('free', 'lifecycle', true),
  ('free', 'veille_read', true),
  ('free', 'risk_assessments', false),
  ('free', 'incidents', false),
  ('free', 'compliance', false),
  ('free', 'decisions', false),
  ('free', 'bias', false),
  ('free', 'transparency', false),
  ('free', 'vendors', false),
  ('free', 'documents', false),
  ('free', 'monitoring', false),
  ('free', 'data_catalog', false),
  ('free', 'governance_structure', false),
  ('free', 'ai_chat', false),
  ('free', 'export_pdf', false),

  -- PRO plan
  ('pro', 'dashboard', true),
  ('pro', 'ai_systems', true),
  ('pro', 'lifecycle', true),
  ('pro', 'veille_read', true),
  ('pro', 'risk_assessments', true),
  ('pro', 'incidents', true),
  ('pro', 'compliance', true),
  ('pro', 'decisions', true),
  ('pro', 'bias', true),
  ('pro', 'transparency', true),
  ('pro', 'vendors', true),
  ('pro', 'documents', true),
  ('pro', 'monitoring', false),
  ('pro', 'data_catalog', false),
  ('pro', 'governance_structure', false),
  ('pro', 'ai_chat', true),
  ('pro', 'export_pdf', true),

  -- ENTERPRISE plan
  ('enterprise', 'dashboard', true),
  ('enterprise', 'ai_systems', true),
  ('enterprise', 'lifecycle', true),
  ('enterprise', 'veille_read', true),
  ('enterprise', 'risk_assessments', true),
  ('enterprise', 'incidents', true),
  ('enterprise', 'compliance', true),
  ('enterprise', 'decisions', true),
  ('enterprise', 'bias', true),
  ('enterprise', 'transparency', true),
  ('enterprise', 'vendors', true),
  ('enterprise', 'documents', true),
  ('enterprise', 'monitoring', true),
  ('enterprise', 'data_catalog', true),
  ('enterprise', 'governance_structure', true),
  ('enterprise', 'ai_chat', true),
  ('enterprise', 'export_pdf', true);

-- ============================================================
-- Trigger: sync organizations.plan from subscriptions
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_org_plan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.organizations
  SET plan = NEW.plan::text, updated_at = now()
  WHERE id = NEW.organization_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_org_plan
  AFTER INSERT OR UPDATE OF plan ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_org_plan();

-- ============================================================
-- Auto-create free subscription for existing orgs without one
-- ============================================================

INSERT INTO public.subscriptions (organization_id, plan, status)
SELECT id, 'free', 'active'
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.subscriptions);

-- ============================================================
-- RLS policies
-- ============================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- subscriptions: org admins can read their own org subscription
CREATE POLICY "Users can view own org subscription"
  ON public.subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- subscriptions: only org_admin / super_admin can update (via edge functions with service key)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- plan_features: readable by all authenticated users
CREATE POLICY "Authenticated users can read plan features"
  ON public.plan_features FOR SELECT
  TO authenticated
  USING (true);
```

**Step 2: Apply the migration**

Run: `cd C:\Users\fbrom\OneDrive\Documents\gouvernance\gouvernance && npx supabase db push`
Or apply via Supabase MCP tool `apply_migration`.

**Step 3: Commit**

```bash
git add supabase/migrations/20260221000001_create_subscription_tables.sql
git commit -m "feat(db): add subscription and plan_features tables with RLS"
```

---

## Task 2: Update TypeScript Database Types

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Add subscription types to database.ts**

Add the following types after the existing table definitions inside `Database > public > Tables`:

```typescript
// --- Add these types ---

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

// Add inside Database > public > Tables:
subscriptions: {
  Row: {
    id: string;
    organization_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan: SubscriptionPlan;
    billing_period: BillingPeriod | null;
    status: SubscriptionStatus;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    organization_id: string;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    plan?: SubscriptionPlan;
    billing_period?: BillingPeriod | null;
    status?: SubscriptionStatus;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
  };
  Update: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    plan?: SubscriptionPlan;
    billing_period?: BillingPeriod | null;
    status?: SubscriptionStatus;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
  };
  Relationships: [];
};
plan_features: {
  Row: {
    id: string;
    plan: SubscriptionPlan;
    feature_key: string;
    enabled: boolean;
  };
  Insert: {
    id?: string;
    plan: SubscriptionPlan;
    feature_key: string;
    enabled?: boolean;
  };
  Update: {
    enabled?: boolean;
  };
  Relationships: [];
};
```

**Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): add subscription and plan_features types"
```

---

## Task 3: Add manage_billing Permission

**Files:**
- Modify: `src/lib/permissions.ts`

**Step 1: Add the permission**

Add to `PERMISSIONS` object:

```typescript
manage_billing: ['super_admin', 'org_admin'],
```

**Step 2: Commit**

```bash
git add src/lib/permissions.ts
git commit -m "feat(permissions): add manage_billing permission"
```

---

## Task 4: Install Stripe Frontend SDK

**Step 1: Install @stripe/stripe-js**

Run: `cd C:\Users\fbrom\OneDrive\Documents\gouvernance\gouvernance && npm install @stripe/stripe-js`

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(deps): add @stripe/stripe-js"
```

---

## Task 5: Create Stripe Config Utility

**Files:**
- Create: `src/lib/stripe.ts`

**Step 1: Write the stripe config module**

```typescript
import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise ?? Promise.resolve(null);
}

export const stripeConfigured = Boolean(stripePublishableKey);

/* ------------------------------------------------------------------ */
/*  Plan definitions (shared between pricing page & billing page)      */
/* ------------------------------------------------------------------ */

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PlanDefinition {
  id: PlanId;
  monthlyPrice: number;       // in dollars, 0 for free
  yearlyPrice: number;        // in dollars (total per year)
  monthlyPriceId?: string;    // Stripe Price ID — set via env or hardcode after Stripe setup
  yearlyPriceId?: string;     // Stripe Price ID
  maxMembers: number | null;  // null = unlimited
  maxAiSystems: number | null;
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxMembers: 1,
    maxAiSystems: 3,
  },
  pro: {
    id: 'pro',
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free (10 × 99)
    maxMembers: 10,
    maxAiSystems: null,
    highlighted: true,
  },
  enterprise: {
    id: 'enterprise',
    monthlyPrice: 499,
    yearlyPrice: 4990, // 2 months free (10 × 499)
    maxMembers: null,
    maxAiSystems: null,
  },
};
```

**Step 2: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "feat(stripe): add Stripe config and plan definitions"
```

---

## Task 6: Create useSubscription Hook

**Files:**
- Create: `src/hooks/useSubscription.ts`

**Step 1: Write the hook**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { SubscriptionPlan } from '@/types/database';

/* ------------------------------------------------------------------ */
/*  Fetch current org subscription                                     */
/* ------------------------------------------------------------------ */

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  billing_period: 'monthly' | 'yearly' | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ['subscription', orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Subscription) ?? null;
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  Create Stripe Checkout session                                     */
/* ------------------------------------------------------------------ */

export function useCreateCheckout() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      plan: SubscriptionPlan;
      period: 'monthly' | 'yearly';
      organizationId: string;
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: params.plan,
          period: params.period,
          organization_id: params.organizationId,
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create checkout');
      }

      const { url } = await res.json();
      return url as string;
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Open Stripe Customer Portal                                        */
/* ------------------------------------------------------------------ */

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_id: organizationId,
          return_url: `${window.location.origin}/billing`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to open portal');
      }

      const { url } = await res.json();
      return url as string;
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat(hooks): add useSubscription, useCreateCheckout, useCustomerPortal"
```

---

## Task 7: Create usePlanFeatures Hook & FeatureGate Component

**Files:**
- Create: `src/hooks/usePlanFeatures.ts`
- Create: `src/components/shared/FeatureGate.tsx`

**Step 1: Write usePlanFeatures hook**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSubscription } from './useSubscription';
import type { SubscriptionPlan } from '@/types/database';

interface PlanFeature {
  feature_key: string;
  enabled: boolean;
}

export function usePlanFeatures() {
  const { data: subscription } = useSubscription();
  const plan: SubscriptionPlan = subscription?.plan ?? 'free';

  const query = useQuery({
    queryKey: ['plan-features', plan],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_features')
        .select('feature_key, enabled')
        .eq('plan', plan);

      if (error) throw error;

      const map: Record<string, boolean> = {};
      for (const f of (data ?? []) as PlanFeature[]) {
        map[f.feature_key] = f.enabled;
      }
      return map;
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  const hasFeature = (featureKey: string): boolean => {
    if (!query.data) return plan === 'enterprise'; // fallback: enterprise gets all
    return query.data[featureKey] ?? false;
  };

  return { ...query, plan, hasFeature };
}
```

**Step 2: Write FeatureGate component**

```tsx
import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** If true, renders nothing instead of the upgrade prompt */
  silent?: boolean;
}

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature, plan } = usePlanFeatures();
  const navigate = useNavigate();
  const { t } = useTranslation('billing');

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (silent) return null;

  const requiredPlan = plan === 'free' ? 'Pro' : 'Entreprise';

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-xl font-semibold">{t('gate.title')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('gate.description', { plan: requiredPlan })}
          </p>
          <Button
            onClick={() => navigate('/billing')}
            className="bg-brand-purple hover:bg-brand-purple-dark text-white"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            {t('gate.upgrade')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/hooks/usePlanFeatures.ts src/components/shared/FeatureGate.tsx
git commit -m "feat(billing): add usePlanFeatures hook and FeatureGate component"
```

---

## Task 8: Create Supabase Edge Function — stripe-checkout

**Files:**
- Create: `supabase/functions/stripe-checkout/index.ts`

**Step 1: Write the edge function**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

// Stripe Price IDs — configure these in Supabase Dashboard > Edge Functions > Secrets
const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "",
    yearly: Deno.env.get("STRIPE_PRICE_PRO_YEARLY") || "",
  },
  enterprise: {
    monthly: Deno.env.get("STRIPE_PRICE_ENTERPRISE_MONTHLY") || "",
    yearly: Deno.env.get("STRIPE_PRICE_ENTERPRISE_YEARLY") || "",
  },
};

async function stripeRequest(endpoint: string, params: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(STRIPE_SECRET_KEY + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

async function stripeGet(endpoint: string) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    headers: {
      Authorization: `Basic ${btoa(STRIPE_SECRET_KEY + ":")}`,
    },
  });
  return await res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // 1. Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 2. Parse body
    const { plan, period, organization_id, success_url, cancel_url } = await req.json();

    if (!plan || !period || !organization_id) {
      return new Response(JSON.stringify({ error: "Missing plan, period, or organization_id" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const priceId = PRICE_IDS[plan]?.[period];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan/period combination" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 3. Check if org already has a Stripe customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", organization_id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // 4. Get org & user info for Stripe customer
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organization_id)
      .single();

    // 5. Create or reuse Stripe customer
    if (!customerId) {
      const customer = await stripeRequest("/customers", {
        email: user.email || "",
        name: org?.name || "",
        "metadata[organization_id]": organization_id,
        "metadata[supabase_user_id]": user.id,
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from("subscriptions")
        .upsert({
          organization_id,
          stripe_customer_id: customerId,
          plan: "free",
          status: "active",
        }, { onConflict: "organization_id" });
    }

    // 6. Create Checkout Session
    const session = await stripeRequest("/checkout/sessions", {
      customer: customerId!,
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: success_url || `${req.headers.get("origin")}/billing?success=true`,
      cancel_url: cancel_url || `${req.headers.get("origin")}/billing?canceled=true`,
      "metadata[organization_id]": organization_id,
      "metadata[plan]": plan,
      "metadata[period]": period,
      "subscription_data[metadata][organization_id]": organization_id,
      "subscription_data[metadata][plan]": plan,
      allow_promotion_codes: "true",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-checkout error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/stripe-checkout/index.ts
git commit -m "feat(edge): add stripe-checkout edge function"
```

---

## Task 9: Create Supabase Edge Function — stripe-webhooks

**Files:**
- Create: `supabase/functions/stripe-webhooks/index.ts`

**Step 1: Write the webhook handler**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Minimal Stripe signature verification (HMAC-SHA256)
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const sig = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === sig;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Verify webhook signature
    const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("Invalid Stripe signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = session.metadata?.organization_id;
        const plan = session.metadata?.plan;
        const period = session.metadata?.period;

        if (!orgId || !plan) break;

        // Fetch the subscription from Stripe for period dates
        const subId = session.subscription;

        let periodStart = null;
        let periodEnd = null;
        if (subId) {
          const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
            headers: { Authorization: `Basic ${btoa(STRIPE_SECRET_KEY + ":")}` },
          });
          const sub = await res.json();
          periodStart = sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null;
          periodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null;
        }

        await supabase
          .from("subscriptions")
          .upsert({
            organization_id: orgId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subId,
            plan,
            billing_period: period || "monthly",
            status: "active",
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
          }, { onConflict: "organization_id" });

        console.log(`Subscription activated: org=${orgId} plan=${plan}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const orgId = sub.metadata?.organization_id;
        if (!orgId) break;

        const plan = sub.metadata?.plan || "pro";

        await supabase
          .from("subscriptions")
          .update({
            plan,
            status: sub.status,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          })
          .eq("organization_id", orgId);

        console.log(`Subscription updated: org=${orgId} status=${sub.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const orgId = sub.metadata?.organization_id;
        if (!orgId) break;

        // Downgrade to free
        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            billing_period: null,
            current_period_start: null,
            current_period_end: null,
          })
          .eq("organization_id", orgId);

        console.log(`Subscription canceled → free: org=${orgId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (!subId) break;

        // Mark as past_due
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subId);

        console.log(`Payment failed for subscription: ${subId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/stripe-webhooks/index.ts
git commit -m "feat(edge): add stripe-webhooks edge function with signature verification"
```

---

## Task 10: Create Supabase Edge Function — stripe-portal

**Files:**
- Create: `supabase/functions/stripe-portal/index.ts`

**Step 1: Write the edge function**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // 1. Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 2. Get customer ID
    const { organization_id, return_url } = await req.json();
    if (!organization_id) {
      return new Response(JSON.stringify({ error: "Missing organization_id" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", organization_id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: "No Stripe customer found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 3. Create portal session
    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(STRIPE_SECRET_KEY + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: subscription.stripe_customer_id,
        return_url: return_url || `${req.headers.get("origin")}/billing`,
      }).toString(),
    });

    const session = await res.json();
    if (session.error) throw new Error(session.error.message);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-portal error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/stripe-portal/index.ts
git commit -m "feat(edge): add stripe-portal edge function"
```

---

## Task 11: Create i18n Translation Files for Billing

**Files:**
- Create: `src/i18n/locales/fr/billing.json`
- Create: `src/i18n/locales/en/billing.json`
- Modify: `src/i18n/index.ts`

**Step 1: Write French translations**

```json
{
  "pageTitle": "Abonnement",
  "pageDescription": "Gérez votre forfait et votre facturation",
  "pricingTitle": "Tarifs",
  "pricingSubtitle": "Choisissez le forfait adapté à votre organisation",
  "monthly": "Mensuel",
  "yearly": "Annuel",
  "yearlyDiscount": "2 mois offerts",
  "month": "/ mois",
  "year": "/ an",
  "free": "Gratuit",
  "pro": "Pro",
  "enterprise": "Entreprise",
  "currentPlan": "Forfait actuel",
  "choosePlan": "Choisir ce forfait",
  "upgrade": "Passer au forfait supérieur",
  "downgrade": "Rétrograder",
  "contactUs": "Contactez-nous",
  "startingAt": "À partir de",
  "recommended": "Recommandé",
  "idealFor": {
    "free": "Pour découvrir la plateforme",
    "pro": "Idéal pour les PME",
    "enterprise": "Pour les grandes organisations"
  },
  "features": {
    "dashboard": "Tableau de bord",
    "ai_systems": "Inventaire systèmes IA",
    "ai_systems_limit": "Jusqu'à {{count}} systèmes IA",
    "ai_systems_unlimited": "Systèmes IA illimités",
    "lifecycle": "Cycle de vie",
    "veille_read": "Veille réglementaire",
    "risk_assessments": "Évaluation des risques",
    "incidents": "Gestion des incidents",
    "compliance": "Conformité",
    "decisions": "Registre des décisions",
    "bias": "Détection des biais",
    "transparency": "Rapports de transparence",
    "vendors": "Gestion des fournisseurs",
    "documents": "Gestion documentaire",
    "monitoring": "Monitoring avancé",
    "data_catalog": "Catalogue de données",
    "governance_structure": "Structure de gouvernance",
    "ai_chat": "Assistant IA",
    "export_pdf": "Exports PDF",
    "support_community": "Support communautaire",
    "support_email": "Support email prioritaire",
    "support_dedicated": "Support dédié + SLA",
    "members": "{{count}} membre",
    "members_plural": "{{count}} membres",
    "members_unlimited": "Membres illimités"
  },
  "billing": {
    "title": "Facturation",
    "currentPlan": "Forfait actuel",
    "status": "Statut",
    "period": "Période",
    "nextBilling": "Prochaine facturation",
    "manageBilling": "Gérer la facturation",
    "managePayment": "Gérer les paiements",
    "cancelSubscription": "Annuler l'abonnement",
    "cancelConfirm": "Votre abonnement restera actif jusqu'à la fin de la période en cours.",
    "reactivate": "Réactiver l'abonnement",
    "statusActive": "Actif",
    "statusCanceled": "Annulé",
    "statusPastDue": "Paiement en retard",
    "successMessage": "Votre abonnement a été activé avec succès !",
    "canceledMessage": "Le paiement a été annulé."
  },
  "gate": {
    "title": "Fonctionnalité Premium",
    "description": "Cette fonctionnalité est disponible avec le forfait {{plan}} ou supérieur.",
    "upgrade": "Mettre à niveau"
  }
}
```

**Step 2: Write English translations**

```json
{
  "pageTitle": "Subscription",
  "pageDescription": "Manage your plan and billing",
  "pricingTitle": "Pricing",
  "pricingSubtitle": "Choose the plan that fits your organization",
  "monthly": "Monthly",
  "yearly": "Yearly",
  "yearlyDiscount": "2 months free",
  "month": "/ month",
  "year": "/ year",
  "free": "Free",
  "pro": "Pro",
  "enterprise": "Enterprise",
  "currentPlan": "Current plan",
  "choosePlan": "Choose this plan",
  "upgrade": "Upgrade",
  "downgrade": "Downgrade",
  "contactUs": "Contact us",
  "startingAt": "Starting at",
  "recommended": "Recommended",
  "idealFor": {
    "free": "To discover the platform",
    "pro": "Ideal for SMBs",
    "enterprise": "For large organizations"
  },
  "features": {
    "dashboard": "Dashboard",
    "ai_systems": "AI Systems inventory",
    "ai_systems_limit": "Up to {{count}} AI systems",
    "ai_systems_unlimited": "Unlimited AI systems",
    "lifecycle": "Lifecycle management",
    "veille_read": "Regulatory watch",
    "risk_assessments": "Risk assessments",
    "incidents": "Incident management",
    "compliance": "Compliance",
    "decisions": "Decision registry",
    "bias": "Bias detection",
    "transparency": "Transparency reports",
    "vendors": "Vendor management",
    "documents": "Document management",
    "monitoring": "Advanced monitoring",
    "data_catalog": "Data catalog",
    "governance_structure": "Governance structure",
    "ai_chat": "AI Assistant",
    "export_pdf": "PDF exports",
    "support_community": "Community support",
    "support_email": "Priority email support",
    "support_dedicated": "Dedicated support + SLA",
    "members": "{{count}} member",
    "members_plural": "{{count}} members",
    "members_unlimited": "Unlimited members"
  },
  "billing": {
    "title": "Billing",
    "currentPlan": "Current plan",
    "status": "Status",
    "period": "Period",
    "nextBilling": "Next billing",
    "manageBilling": "Manage billing",
    "managePayment": "Manage payments",
    "cancelSubscription": "Cancel subscription",
    "cancelConfirm": "Your subscription will remain active until the end of the current period.",
    "reactivate": "Reactivate subscription",
    "statusActive": "Active",
    "statusCanceled": "Canceled",
    "statusPastDue": "Past due",
    "successMessage": "Your subscription has been activated!",
    "canceledMessage": "Payment was canceled."
  },
  "gate": {
    "title": "Premium Feature",
    "description": "This feature is available with the {{plan}} plan or higher.",
    "upgrade": "Upgrade"
  }
}
```

**Step 3: Register billing namespace in i18n/index.ts**

Add imports:
```typescript
import frBilling from './locales/fr/billing.json'
import enBilling from './locales/en/billing.json'
```

Add to resources:
```typescript
fr: { ..., billing: frBilling },
en: { ..., billing: enBilling },
```

Add `'billing'` to the `ns` array.

**Step 4: Commit**

```bash
git add src/i18n/locales/fr/billing.json src/i18n/locales/en/billing.json src/i18n/index.ts
git commit -m "feat(i18n): add billing translations FR/EN"
```

---

## Task 12: Create Public Pricing Page (TarifsPage)

**Files:**
- Create: `src/pages/TarifsPage.tsx`

**Step 1: Write the pricing page**

Full pricing page with 3 plan cards, monthly/yearly toggle, feature lists, CTA buttons. Uses the brand-purple theme. Enterprise card has both self-service and "Contactez-nous" buttons. Toggle animates with Framer Motion. Responsive grid (1 col mobile, 3 col desktop). Pro card is highlighted with gradient border.

Features to show per plan card drawn from i18n `billing.features.*` keys.

**Step 2: Add route in App.tsx**

```typescript
import { TarifsPage } from "@/pages/TarifsPage";
// Inside <Route element={<Layout />}> (site vitrine):
<Route path="/tarifs" element={<TarifsPage />} />
```

**Step 3: Add "Tarifs" link in Header.tsx navigation**

**Step 4: Commit**

```bash
git add src/pages/TarifsPage.tsx src/App.tsx src/components/layout/Header.tsx
git commit -m "feat(pricing): add public pricing page with 3 plans"
```

---

## Task 13: Create Portal Billing Page (BillingPage)

**Files:**
- Create: `src/portail/pages/BillingPage.tsx`

**Step 1: Write the billing page**

Sections:
1. Current plan card (name, status badge, period, next billing date)
2. Usage summary (systems count vs limit, members count vs limit)
3. Action buttons (Upgrade, Manage Payments via Stripe Portal, Cancel)
4. Success/canceled toast messages from URL params
5. Plan comparison cards (same as pricing page but with "Current" badge)

Uses `useSubscription()`, `useCreateCheckout()`, `useCustomerPortal()` hooks.

**Step 2: Add route in App.tsx**

```typescript
import BillingPage from "@/portail/pages/BillingPage";
// Inside PortailLayout protected routes:
<Route path="/billing" element={<BillingPage />} />
```

**Step 3: Add nav link in portail.json translations**

```json
"nav": { ..., "billing": "Abonnement" }
```

**Step 4: Add to AppSidebar.tsx settingsItems**

```typescript
{
  key: "billing",
  path: "/billing",
  icon: CreditCard, // import from lucide-react
  permission: "manage_billing",
  ready: true,
},
```

**Step 5: Commit**

```bash
git add src/portail/pages/BillingPage.tsx src/App.tsx src/portail/layout/AppSidebar.tsx
git commit -m "feat(billing): add portal billing page with subscription management"
```

---

## Task 14: Integrate FeatureGate into Existing Portal Pages

**Files:**
- Modify: Multiple portail pages

**Step 1: Wrap gated pages with FeatureGate**

For each gated module, wrap the page content:

| Page file | Feature key |
|---|---|
| `RiskAssessmentListPage.tsx` | `risk_assessments` |
| `IncidentListPage.tsx` | `incidents` |
| `CompliancePage.tsx` | `compliance` |
| `DecisionsPage.tsx` | `decisions` |
| `BiasPage.tsx` | `bias` |
| `TransparencyPage.tsx` | `transparency` |
| `VendorsPage.tsx` | `vendors` |
| `DocumentsPage.tsx` | `documents` |
| `MonitoringPage.tsx` | `monitoring` |
| `DataPage.tsx` | `data_catalog` |
| `GovernancePage.tsx` | `governance_structure` |

Pattern for each page:
```tsx
import { FeatureGate } from '@/components/shared/FeatureGate';

// Wrap the return JSX:
return (
  <FeatureGate feature="risk_assessments">
    {/* existing page content */}
  </FeatureGate>
);
```

**Step 2: Commit**

```bash
git add src/portail/pages/*.tsx
git commit -m "feat(billing): integrate FeatureGate into all portal modules"
```

---

## Task 15: Update CSP & Environment Config

**Files:**
- Modify: `netlify.toml`
- Modify/Create: `.env.example`

**Step 1: Update CSP in netlify.toml**

Add `https://js.stripe.com` to script-src and frame-src, add `https://api.stripe.com` to connect-src:

```
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co https://*.stripe.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://auth.gouvernance.ai https://*.gouvernance.ai https://accounts.google.com https://www.googleapis.com https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'"
```

**Step 2: Update .env.example**

```
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
```

**Step 3: Commit**

```bash
git add netlify.toml .env.example
git commit -m "feat(config): update CSP for Stripe and add env vars"
```

---

## Task 16: Add billing nav entry to portail.json (FR + EN)

**Files:**
- Modify: `src/i18n/locales/fr/portail.json`
- Modify: `src/i18n/locales/en/portail.json`

**Step 1: Add nav.billing key to both files**

FR: `"billing": "Abonnement"`
EN: `"billing": "Subscription"`

**Step 2: Commit**

```bash
git add src/i18n/locales/fr/portail.json src/i18n/locales/en/portail.json
git commit -m "feat(i18n): add billing nav label to portail translations"
```

---

## Post-Implementation Checklist

### Stripe Dashboard Setup (manual)
1. Create Products & Prices in Stripe Dashboard:
   - Product: "Pro" → Price: $99/mo (monthly), $990/yr (yearly)
   - Product: "Enterprise" → Price: $499/mo (monthly), $4990/yr (yearly)
2. Copy Price IDs to Supabase Edge Function secrets:
   - `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
   - `STRIPE_PRICE_ENTERPRISE_MONTHLY`, `STRIPE_PRICE_ENTERPRISE_YEARLY`
3. Set up Webhook endpoint in Stripe Dashboard:
   - URL: `https://<supabase-project>.supabase.co/functions/v1/stripe-webhooks`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy Webhook signing secret to `STRIPE_WEBHOOK_SECRET`
5. Configure Customer Portal in Stripe Dashboard
6. Set `VITE_STRIPE_PUBLISHABLE_KEY` in Netlify env vars

### Environment Variables Summary
| Variable | Where | Value |
|---|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Netlify env + `.env` | `pk_test_...` / `pk_live_...` |
| `STRIPE_SECRET_KEY` | Supabase Edge Function secrets | `sk_test_...` / `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function secrets | `whsec_...` |
| `STRIPE_PRICE_PRO_MONTHLY` | Supabase Edge Function secrets | `price_...` |
| `STRIPE_PRICE_PRO_YEARLY` | Supabase Edge Function secrets | `price_...` |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Supabase Edge Function secrets | `price_...` |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | Supabase Edge Function secrets | `price_...` |
