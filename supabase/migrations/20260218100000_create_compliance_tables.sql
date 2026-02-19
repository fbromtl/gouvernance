-- Module 13: Compliance Multi-Referentiels
-- Tables: compliance_assessments, remediation_actions, compliance_snapshots

-- 1. compliance_assessments
CREATE TABLE IF NOT EXISTS public.compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_code TEXT NOT NULL CHECK (framework_code IN ('loi25', 'euai', 'nist_ai_rmf', 'iso42001', 'rgpd')),
  requirement_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'non_compliant' CHECK (status IN ('compliant', 'partially_compliant', 'non_compliant', 'not_applicable')),
  responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comments TEXT,
  last_verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, framework_code, requirement_code)
);

-- 2. remediation_actions
CREATE TABLE IF NOT EXISTS public.remediation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.compliance_assessments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'deferred')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. compliance_snapshots (historical scores)
CREATE TABLE IF NOT EXISTS public.compliance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_code TEXT NOT NULL CHECK (framework_code IN ('loi25', 'euai', 'nist_ai_rmf', 'iso42001', 'rgpd')),
  score NUMERIC NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  compliant_count INT NOT NULL DEFAULT 0,
  partially_count INT NOT NULL DEFAULT 0,
  non_compliant_count INT NOT NULL DEFAULT 0,
  not_applicable_count INT NOT NULL DEFAULT 0,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_org ON public.compliance_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework ON public.compliance_assessments(organization_id, framework_code);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_org ON public.remediation_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_assessment ON public.remediation_actions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_org ON public.compliance_snapshots(organization_id, framework_code);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at_compliance_assessments ON public.compliance_assessments;
CREATE TRIGGER set_updated_at_compliance_assessments
  BEFORE UPDATE ON public.compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_remediation_actions ON public.remediation_actions;
CREATE TRIGGER set_updated_at_remediation_actions
  BEFORE UPDATE ON public.remediation_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remediation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_snapshots ENABLE ROW LEVEL SECURITY;

-- compliance_assessments policies
CREATE POLICY "Users can view own org compliance_assessments"
  ON public.compliance_assessments FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org compliance_assessments"
  ON public.compliance_assessments FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org compliance_assessments"
  ON public.compliance_assessments FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org compliance_assessments"
  ON public.compliance_assessments FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- remediation_actions policies
CREATE POLICY "Users can view own org remediation_actions"
  ON public.remediation_actions FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org remediation_actions"
  ON public.remediation_actions FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org remediation_actions"
  ON public.remediation_actions FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org remediation_actions"
  ON public.remediation_actions FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- compliance_snapshots policies
CREATE POLICY "Users can view own org compliance_snapshots"
  ON public.compliance_snapshots FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org compliance_snapshots"
  ON public.compliance_snapshots FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Grant access
GRANT ALL ON public.compliance_assessments TO authenticated;
GRANT ALL ON public.remediation_actions TO authenticated;
GRANT ALL ON public.compliance_snapshots TO authenticated;
