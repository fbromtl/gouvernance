-- Module 09: Documentation & Evidence

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID REFERENCES public.ai_systems(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('system_card','monitoring_plan','risk_summary','decisions_report','incidents_report','bias_report','eu_ai_act_annex_iv','compliance_report','fria_report','efvp_report','manual_upload')),
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','archived')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_org ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_system ON public.documents(organization_id, ai_system_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(organization_id, document_type);

DROP TRIGGER IF EXISTS set_updated_at_documents ON public.documents;
CREATE TRIGGER set_updated_at_documents
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org documents"
  ON public.documents FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org documents"
  ON public.documents FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org documents"
  ON public.documents FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org documents"
  ON public.documents FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

GRANT ALL ON public.documents TO authenticated;
