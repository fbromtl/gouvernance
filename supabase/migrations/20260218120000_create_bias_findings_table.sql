-- Module 05: Registre des Biais et Remediations

CREATE TABLE IF NOT EXISTS public.bias_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bias_type TEXT NOT NULL CHECK (bias_type IN ('disparate_impact', 'representation', 'measurement', 'historical', 'aggregation', 'evaluation', 'toxicity', 'hallucination', 'stereotyping', 'other')),
  detection_method TEXT NOT NULL CHECK (detection_method IN ('automated_test', 'manual_audit', 'user_complaint', 'monitoring', 'external_audit', 'regulatory_review')),
  protected_dimensions TEXT[] NOT NULL DEFAULT '{}',
  affected_groups TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  likelihood TEXT CHECK (likelihood IN ('certain', 'likely', 'possible', 'unlikely', 'rare')),
  estimated_impact TEXT,
  affected_count INTEGER,
  fairness_metric TEXT,
  measured_value NUMERIC,
  acceptable_threshold NUMERIC,
  remediation_measures TEXT[] NOT NULL DEFAULT '{}',
  remediation_description TEXT,
  remediation_responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  remediation_target_date DATE,
  remediation_retest_result TEXT,
  remediation_resolved_at DATE,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'in_remediation', 'retest_pending', 'resolved', 'accepted_risk')),
  decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
  detected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  detected_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bias_findings_org ON public.bias_findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bias_findings_system ON public.bias_findings(organization_id, ai_system_id);
CREATE INDEX IF NOT EXISTS idx_bias_findings_status ON public.bias_findings(organization_id, status);

DROP TRIGGER IF EXISTS set_updated_at_bias_findings ON public.bias_findings;
CREATE TRIGGER set_updated_at_bias_findings
  BEFORE UPDATE ON public.bias_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bias_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org bias findings"
  ON public.bias_findings FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org bias findings"
  ON public.bias_findings FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org bias findings"
  ON public.bias_findings FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org bias findings"
  ON public.bias_findings FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

GRANT ALL ON public.bias_findings TO authenticated;
