-- ============================================
-- Migration: Create user_roles, update profiles
-- RBAC foundation for gouvernance.ai
-- ============================================

-- Table user_roles (RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN (
    'super_admin', 'org_admin', 'compliance_officer', 'risk_manager',
    'data_scientist', 'ethics_officer', 'auditor', 'member'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE TRIGGER on_user_roles_updated
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add organization_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_user_roles_same_org" ON public.user_roles
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "manage_user_roles_admin" ON public.user_roles
  FOR ALL USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin')
  );

-- Update profiles RLS for multi-tenant
-- Drop existing policies (the project may have old ones)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_same_org" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can always see their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Users can see profiles of same org
CREATE POLICY "profiles_select_same_org" ON public.profiles
  FOR SELECT USING (
    organization_id IS NOT NULL
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile (on first login)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
