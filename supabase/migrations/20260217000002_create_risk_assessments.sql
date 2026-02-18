CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  risk_level TEXT DEFAULT 'minimal' CHECK (risk_level IN (
    'minimal', 'limited', 'high', 'critical', 'prohibited'
  )),
  answers JSONB DEFAULT '{}'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  probability TEXT CHECK (probability IN ('rare', 'unlikely', 'possible', 'likely', 'almost_certain')),
  impact TEXT CHECK (impact IN ('negligible', 'minor', 'moderate', 'major', 'catastrophic')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'archived')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_risk_assessments_org ON public.risk_assessments(organization_id);
CREATE INDEX idx_risk_assessments_system ON public.risk_assessments(ai_system_id);
CREATE INDEX idx_risk_assessments_level ON public.risk_assessments(risk_level);

CREATE TRIGGER on_risk_assessments_updated
  BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_risk_assessments" ON public.risk_assessments
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "insert_risk_assessments" ON public.risk_assessments
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );

CREATE POLICY "update_risk_assessments" ON public.risk_assessments
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );
