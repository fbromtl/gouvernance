-- Module: Transparence et Decisions Automatisees
-- Tables: automated_decisions, contestations

-- 1. automated_decisions
CREATE TABLE IF NOT EXISTS public.automated_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  automation_level TEXT NOT NULL CHECK (automation_level IN ('fully_automated', 'semi_automated', 'assisted')),
  affected_persons TEXT[] NOT NULL DEFAULT '{}',
  decision_impact TEXT NOT NULL CHECK (decision_impact IN ('high', 'medium', 'low')),
  information_channel TEXT,
  explanation_enabled BOOLEAN NOT NULL DEFAULT false,
  contestation_enabled BOOLEAN NOT NULL DEFAULT false,
  legal_basis TEXT CHECK (legal_basis IS NULL OR legal_basis IN ('consent', 'legitimate_interest', 'legal_obligation', 'contract')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'decommissioned')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. contestations
CREATE TABLE IF NOT EXISTS public.contestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  requester_phone TEXT,
  received_at DATE NOT NULL DEFAULT CURRENT_DATE,
  reception_channel TEXT NOT NULL CHECK (reception_channel IN ('email', 'web_form', 'mail', 'phone', 'in_person')),
  contested_decision_description TEXT NOT NULL,
  contestation_reason TEXT NOT NULL,
  requester_observations TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis TEXT,
  review_outcome TEXT CHECK (review_outcome IS NULL OR review_outcome IN ('maintained', 'revised')),
  justification TEXT,
  revised_decision TEXT,
  decision_date DATE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'assigned', 'under_review', 'decision_revised', 'decision_maintained', 'notified', 'closed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, case_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_automated_decisions_org ON public.automated_decisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_automated_decisions_system ON public.automated_decisions(organization_id, ai_system_id);
CREATE INDEX IF NOT EXISTS idx_contestations_org ON public.contestations(organization_id);
CREATE INDEX IF NOT EXISTS idx_contestations_status ON public.contestations(organization_id, status);

-- Updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_automated_decisions ON public.automated_decisions;
CREATE TRIGGER set_updated_at_automated_decisions
  BEFORE UPDATE ON public.automated_decisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_contestations ON public.contestations;
CREATE TRIGGER set_updated_at_contestations
  BEFORE UPDATE ON public.contestations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.automated_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contestations ENABLE ROW LEVEL SECURITY;

-- automated_decisions policies
CREATE POLICY "Users can view own org automated_decisions"
  ON public.automated_decisions FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org automated_decisions"
  ON public.automated_decisions FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org automated_decisions"
  ON public.automated_decisions FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org automated_decisions"
  ON public.automated_decisions FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- contestations policies
CREATE POLICY "Users can view own org contestations"
  ON public.contestations FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org contestations"
  ON public.contestations FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org contestations"
  ON public.contestations FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org contestations"
  ON public.contestations FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Grant access
GRANT ALL ON public.automated_decisions TO authenticated;
GRANT ALL ON public.contestations TO authenticated;
