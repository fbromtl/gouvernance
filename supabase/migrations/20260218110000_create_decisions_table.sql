-- Module 04: Journal de Decision Algorithmique

CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('go_nogo', 'substantial_change', 'scale_deployment', 'vendor_change', 'policy_adjustment', 'ethical_arbitration', 'suspension', 'exception')),
  ai_system_ids UUID[] NOT NULL DEFAULT '{}',
  context TEXT,
  options_considered TEXT,
  decision_made TEXT,
  justification TEXT,
  residual_risks TEXT,
  conditions TEXT,
  impact TEXT CHECK (impact IS NULL OR impact IN ('low', 'medium', 'high', 'critical')),
  effective_date DATE,
  review_date DATE,
  risk_assessment_id UUID REFERENCES public.risk_assessments(id) ON DELETE SET NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approver_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'implemented', 'archived')),
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_org ON public.decisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON public.decisions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_decisions_type ON public.decisions(organization_id, decision_type);

DROP TRIGGER IF EXISTS set_updated_at_decisions ON public.decisions;
CREATE TRIGGER set_updated_at_decisions
  BEFORE UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org decisions"
  ON public.decisions FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org decisions"
  ON public.decisions FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org decisions"
  ON public.decisions FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org decisions"
  ON public.decisions FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

GRANT ALL ON public.decisions TO authenticated;
