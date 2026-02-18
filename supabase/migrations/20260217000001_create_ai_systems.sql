CREATE TABLE public.ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  internal_ref TEXT,
  system_type TEXT NOT NULL CHECK (system_type IN (
    'predictive', 'recommendation', 'classification', 'nlp', 'genai_llm',
    'computer_vision', 'biometric', 'robotic_process', 'decision_support',
    'autonomous_agent', 'other'
  )),
  genai_subtype TEXT CHECK (genai_subtype IN (
    'chatbot', 'content_generation', 'code_generation', 'summarization',
    'translation', 'image_generation', 'other_genai'
  )),
  departments TEXT[] DEFAULT '{}',
  purpose TEXT,
  affected_population TEXT[] DEFAULT '{}',
  estimated_volume TEXT,
  autonomy_level TEXT CHECK (autonomy_level IN (
    'full_auto', 'human_in_the_loop', 'human_on_the_loop', 'human_in_command'
  )),
  sensitive_domains TEXT[] DEFAULT '{}',
  data_types TEXT[] DEFAULT '{}',
  system_source TEXT CHECK (system_source IN (
    'internal', 'vendor_saas', 'vendor_onprem', 'open_source', 'hybrid'
  )),
  vendor_name TEXT,
  model_version TEXT,
  data_locations TEXT[] DEFAULT '{}',
  business_owner_id UUID REFERENCES auth.users(id),
  tech_owner_id UUID REFERENCES auth.users(id),
  privacy_owner_id UUID REFERENCES auth.users(id),
  risk_owner_id UUID REFERENCES auth.users(id),
  approver_id UUID REFERENCES auth.users(id),
  lifecycle_status TEXT NOT NULL DEFAULT 'idea' CHECK (lifecycle_status IN (
    'idea', 'pilot', 'development', 'testing', 'production', 'suspended', 'decommissioned'
  )),
  production_date DATE,
  next_review_date DATE,
  review_frequency TEXT DEFAULT 'semi_annual' CHECK (review_frequency IN (
    'monthly', 'quarterly', 'semi_annual', 'annual'
  )),
  notes TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT DEFAULT 'minimal' CHECK (risk_level IN (
    'minimal', 'limited', 'high', 'critical', 'prohibited'
  )),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_ai_systems_org ON public.ai_systems(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_systems_risk ON public.ai_systems(risk_level, risk_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_systems_lifecycle ON public.ai_systems(lifecycle_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_systems_review ON public.ai_systems(next_review_date) WHERE deleted_at IS NULL AND lifecycle_status = 'production';

CREATE TRIGGER on_ai_systems_updated
  BEFORE UPDATE ON public.ai_systems
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.ai_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_ai_systems_member" ON public.ai_systems
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND deleted_at IS NULL
  );

CREATE POLICY "insert_ai_systems_authorized" ON public.ai_systems
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );

CREATE POLICY "update_ai_systems_authorized" ON public.ai_systems
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );

CREATE OR REPLACE FUNCTION public.calculate_risk_score(p_system_id UUID)
RETURNS INTEGER AS $$
DECLARE
  sys RECORD;
  score INTEGER := 0;
BEGIN
  SELECT * INTO sys FROM public.ai_systems WHERE id = p_system_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  IF sys.autonomy_level = 'full_auto' THEN score := score + 30;
  ELSIF sys.autonomy_level = 'human_in_the_loop' THEN score := score + 15;
  ELSIF sys.autonomy_level = 'human_on_the_loop' THEN score := score + 10;
  ELSIF sys.autonomy_level = 'human_in_command' THEN score := score + 5;
  END IF;

  IF 'sensitive_data' = ANY(sys.data_types) THEN score := score + 25;
  ELSIF 'personal_data' = ANY(sys.data_types) THEN score := score + 15;
  END IF;
  IF 'financial_data' = ANY(sys.data_types) THEN score := score + 10; END IF;

  IF 'minors' = ANY(sys.affected_population) THEN score := score + 20;
  ELSIF 'vulnerable' = ANY(sys.affected_population) THEN score := score + 15;
  END IF;
  IF sys.estimated_volume IN ('10000-100000', '> 100000') THEN score := score + 10; END IF;

  IF array_length(sys.sensitive_domains, 1) >= 2 THEN score := score + 25;
  ELSIF array_length(sys.sensitive_domains, 1) >= 1 THEN score := score + 15;
  END IF;

  score := LEAST(score, 100);

  UPDATE public.ai_systems SET
    risk_score = score,
    risk_level = CASE
      WHEN score >= 76 THEN 'critical'
      WHEN score >= 51 THEN 'high'
      WHEN score >= 26 THEN 'limited'
      ELSE 'minimal'
    END
  WHERE id = p_system_id;

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
