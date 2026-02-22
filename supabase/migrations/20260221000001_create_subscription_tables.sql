-- ============================================================
-- Migration: Subscription system tables
-- Stripe-based subscription with 3 plans (free, pro, enterprise)
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

-- Indexes for Stripe lookups
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- Updated_at trigger (reuses existing function from compliance migration)
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

  -- ENTERPRISE plan (all enabled)
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
-- Update organizations.plan CHECK constraint to accept 'free'
-- The original constraint only allows ('starter', 'pro', 'enterprise').
-- We need to add 'free' so the sync trigger can set plan = 'free'.
-- ============================================================

ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('starter', 'free', 'pro', 'enterprise'));

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

-- subscriptions: users can read their own org subscription
CREATE POLICY "Users can view own org subscription"
  ON public.subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- subscriptions: service role can manage all subscriptions
-- Note: service_role bypasses RLS by default, but this policy
-- ensures edge functions using the service key have explicit access.
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- plan_features: readable by all authenticated users
CREATE POLICY "Authenticated users can read plan features"
  ON public.plan_features FOR SELECT
  TO authenticated
  USING (true);
