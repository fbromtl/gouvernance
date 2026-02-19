-- Module 08: Cycle de vie et changements
-- Table: lifecycle_events

CREATE TABLE IF NOT EXISTS public.lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('model_update','data_change','prompt_change','threshold_change','vendor_change','infra_change','scope_extension','scope_reduction','suspension','resumption','decommission','bugfix')),
  title TEXT NOT NULL,
  description TEXT,
  components_modified TEXT[] NOT NULL DEFAULT '{}',
  previous_version TEXT,
  new_version TEXT,
  change_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  impact TEXT NOT NULL DEFAULT 'low' CHECK (impact IN ('none','low','medium','high','critical')),
  is_substantial BOOLEAN NOT NULL DEFAULT false,
  risk_reassessment_required BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_org ON public.lifecycle_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_system ON public.lifecycle_events(organization_id, ai_system_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_lifecycle_events ON public.lifecycle_events;
CREATE TRIGGER set_updated_at_lifecycle_events
  BEFORE UPDATE ON public.lifecycle_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org lifecycle_events"
  ON public.lifecycle_events FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org lifecycle_events"
  ON public.lifecycle_events FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org lifecycle_events"
  ON public.lifecycle_events FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org lifecycle_events"
  ON public.lifecycle_events FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Grant access
GRANT ALL ON public.lifecycle_events TO authenticated;
