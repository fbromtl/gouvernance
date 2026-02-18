-- ============================================
-- Migration: Create organizations table
-- Multi-tenant foundation for gouvernance.ai
-- ============================================

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table organizations (tenant principal)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sector TEXT,
  size TEXT CHECK (size IN ('1-50', '51-200', '201-1000', '1001-5000', '5000+')),
  country TEXT DEFAULT 'Canada',
  province TEXT DEFAULT 'Québec',
  logo_url TEXT,
  settings JSONB DEFAULT '{
    "enabled_frameworks": ["loi_25"],
    "default_language": "fr",
    "review_frequency_default": "semi_annual",
    "notification_preferences": {}
  }'::jsonb,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER on_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Members of an org can view it
CREATE POLICY "select_own_organization" ON public.organizations
  FOR SELECT USING (
    id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Only org_admin / super_admin can update
CREATE POLICY "update_own_organization" ON public.organizations
  FOR UPDATE USING (
    id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin')
  );

-- Allow insert for creating new orgs (during onboarding)
CREATE POLICY "insert_organization" ON public.organizations
  FOR INSERT WITH CHECK (true);
