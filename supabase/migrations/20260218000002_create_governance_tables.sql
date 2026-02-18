-- ============================================
-- Migration: Create governance tables
-- Module 02 — Governance & Responsibilities
-- Tables: governance_policies, governance_roles, governance_committees
-- ============================================

-- --------------------------------------------------------
-- Table 1: governance_policies
-- Versioned policy documents with workflow
-- --------------------------------------------------------
CREATE TABLE public.governance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL CHECK (policy_type IN (
    'ai_usage', 'genai_usage', 'approval_procedure',
    'incident_procedure', 'complaint_procedure',
    'decommission_procedure', 'privacy_policy', 'ethics_charter',
    'custom'
  )),
  content TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES public.governance_policies(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'in_review', 'published', 'archived'
  )),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gov_policies_org ON public.governance_policies(organization_id);
CREATE INDEX idx_gov_policies_status ON public.governance_policies(organization_id, status);
CREATE INDEX idx_gov_policies_type ON public.governance_policies(organization_id, policy_type);
CREATE INDEX idx_gov_policies_parent ON public.governance_policies(parent_id) WHERE parent_id IS NOT NULL;

CREATE TRIGGER on_governance_policies_updated
  BEFORE UPDATE ON public.governance_policies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.governance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_governance_policies" ON public.governance_policies
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "insert_governance_policies" ON public.governance_policies
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'
    )
  );

CREATE POLICY "update_governance_policies" ON public.governance_policies
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'
    )
  );

-- --------------------------------------------------------
-- Table 2: governance_roles
-- Governance role assignments (sponsor, AI lead, etc.)
-- --------------------------------------------------------
CREATE TABLE public.governance_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN (
    'sponsor', 'ai_lead', 'privacy_officer', 'risk_officer',
    'security_officer', 'ethics_officer', 'legal_counsel',
    'model_owner', 'approver'
  )),
  user_id UUID REFERENCES auth.users(id),
  mandate TEXT,
  nominated_at DATE,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'per_system')),
  ai_system_id UUID REFERENCES public.ai_systems(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gov_roles_org ON public.governance_roles(organization_id);
CREATE INDEX idx_gov_roles_type ON public.governance_roles(organization_id, role_type);
CREATE INDEX idx_gov_roles_user ON public.governance_roles(user_id) WHERE user_id IS NOT NULL;

CREATE TRIGGER on_governance_roles_updated
  BEFORE UPDATE ON public.governance_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.governance_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_governance_roles" ON public.governance_roles
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "insert_governance_roles" ON public.governance_roles
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'
    )
  );

CREATE POLICY "update_governance_roles" ON public.governance_roles
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'
    )
  );

CREATE POLICY "delete_governance_roles" ON public.governance_roles
  FOR DELETE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin'
    )
  );

-- --------------------------------------------------------
-- Table 3: governance_committees
-- Governance committees with JSONB members
-- --------------------------------------------------------
CREATE TABLE public.governance_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mandate TEXT,
  meeting_frequency TEXT NOT NULL DEFAULT 'quarterly' CHECK (meeting_frequency IN (
    'weekly', 'monthly', 'quarterly', 'ad_hoc'
  )),
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gov_committees_org ON public.governance_committees(organization_id);

CREATE TRIGGER on_governance_committees_updated
  BEFORE UPDATE ON public.governance_committees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.governance_committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_governance_committees" ON public.governance_committees
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "insert_governance_committees" ON public.governance_committees
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'
    )
  );

CREATE POLICY "update_governance_committees" ON public.governance_committees
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'
    )
  );

CREATE POLICY "delete_governance_committees" ON public.governance_committees
  FOR DELETE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin'
    )
  );
