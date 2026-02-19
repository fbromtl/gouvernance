-- Module 11: Gestion des Donnees & EFVP

-- ============================================================
-- TABLE: datasets
-- ============================================================

CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ai_system_ids UUID[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL CHECK (source IN ('internal_db','client_provided','vendor_api','public_dataset','web_scraping','synthetic','third_party','other')),
  data_categories TEXT[] NOT NULL DEFAULT '{}',
  classification TEXT NOT NULL DEFAULT 'non_personal' CHECK (classification IN ('none','personal','sensitive')),
  volume TEXT CHECK (volume IS NULL OR volume IN ('lt_1k','1k_10k','10k_100k','100k_1m','gt_1m')),
  quality TEXT CHECK (quality IS NULL OR quality IN ('high','medium','low','unknown')),
  freshness TEXT CHECK (freshness IS NULL OR freshness IN ('realtime','daily','weekly','monthly','static')),
  storage_locations TEXT[] NOT NULL DEFAULT '{}',
  format TEXT CHECK (format IS NULL OR format IN ('structured_db','csv','json','images','text','audio','video','mixed')),
  representativeness TEXT,
  legal_basis TEXT CHECK (legal_basis IS NULL OR legal_basis IN ('consent','contract','legal_obligation','legitimate_interest','vital_interest','public_interest')),
  declared_purpose TEXT,
  consent_obtained BOOLEAN NOT NULL DEFAULT false,
  withdrawal_mechanism TEXT,
  retention_duration INTEGER,
  retention_unit TEXT CHECK (retention_unit IS NULL OR retention_unit IN ('days','months','years')),
  retention_justification TEXT,
  destruction_policy TEXT CHECK (destruction_policy IS NULL OR destruction_policy IN ('auto_delete','manual_review','anonymization','archival')),
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','pending_deletion')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datasets_org ON public.datasets(organization_id);
CREATE INDEX IF NOT EXISTS idx_datasets_source ON public.datasets(organization_id, source);
CREATE INDEX IF NOT EXISTS idx_datasets_classification ON public.datasets(organization_id, classification);

DROP TRIGGER IF EXISTS set_updated_at_datasets ON public.datasets;
CREATE TRIGGER set_updated_at_datasets
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org datasets"
  ON public.datasets FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org datasets"
  ON public.datasets FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org datasets"
  ON public.datasets FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org datasets"
  ON public.datasets FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

GRANT ALL ON public.datasets TO authenticated;

-- ============================================================
-- TABLE: data_transfers
-- ============================================================

CREATE TABLE IF NOT EXISTS public.data_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  destination_country TEXT NOT NULL,
  destination_entity TEXT,
  transfer_purpose TEXT NOT NULL,
  contractual_basis TEXT CHECK (contractual_basis IS NULL OR contractual_basis IN ('contractual_clause','compliance_commitment','consent')),
  efvp_completed BOOLEAN NOT NULL DEFAULT false,
  protection_measures TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','terminated')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_transfers_org ON public.data_transfers(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_transfers_dataset ON public.data_transfers(organization_id, dataset_id);
CREATE INDEX IF NOT EXISTS idx_data_transfers_status ON public.data_transfers(organization_id, status);

DROP TRIGGER IF EXISTS set_updated_at_data_transfers ON public.data_transfers;
CREATE TRIGGER set_updated_at_data_transfers
  BEFORE UPDATE ON public.data_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.data_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org data_transfers"
  ON public.data_transfers FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org data_transfers"
  ON public.data_transfers FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org data_transfers"
  ON public.data_transfers FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org data_transfers"
  ON public.data_transfers FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

GRANT ALL ON public.data_transfers TO authenticated;
