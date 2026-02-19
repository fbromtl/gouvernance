-- Module 12: Gestion des tiers / Vendors

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_types TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  country TEXT,
  region TEXT,
  known_subcontractors TEXT,
  ai_system_ids UUID[] NOT NULL DEFAULT '{}',
  contract_start_date DATE,
  contract_end_date DATE,
  contract_type TEXT CHECK (contract_type IS NULL OR contract_type IN ('subscription','per_use','license','custom')),
  contract_amount NUMERIC,
  contract_clauses TEXT,
  sla_details TEXT,
  risk_level TEXT CHECK (risk_level IS NULL OR risk_level IN ('low_risk','medium_risk','high_risk')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','under_evaluation','suspended','terminated')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_org ON public.vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(organization_id, status);

DROP TRIGGER IF EXISTS set_updated_at_vendors ON public.vendors;
CREATE TRIGGER set_updated_at_vendors
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org vendors"
  ON public.vendors FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org vendors"
  ON public.vendors FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org vendors"
  ON public.vendors FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

GRANT ALL ON public.vendors TO authenticated;
