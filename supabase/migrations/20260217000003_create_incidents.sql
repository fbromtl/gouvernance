CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'privacy')),
  incident_type TEXT NOT NULL,
  ai_system_id UUID REFERENCES public.ai_systems(id),
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  detection_mode TEXT CHECK (detection_mode IN (
    'automated_monitoring', 'user_report', 'internal_audit',
    'external_report', 'media', 'regulatory'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  assigned_to UUID REFERENCES auth.users(id),
  impact_description TEXT,
  affected_count INTEGER,
  priority TEXT CHECK (priority IN ('p1_immediate', 'p2_24h', 'p3_72h', 'p4_week')),
  serious_harm_risk BOOLEAN DEFAULT false,
  root_cause TEXT,
  contributing_factors TEXT[] DEFAULT '{}',
  resolution_date TIMESTAMPTZ,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  post_mortem JSONB,
  lessons_learned TEXT,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN (
    'reported', 'triaged', 'investigating', 'resolving', 'resolved', 'post_mortem', 'closed'
  )),
  cai_notification_status TEXT CHECK (cai_notification_status IN ('not_required', 'to_notify', 'notified', 'acknowledged')),
  cai_notified_at TIMESTAMPTZ,
  persons_notified BOOLEAN DEFAULT false,
  reported_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_incidents_org ON public.incidents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_status ON public.incidents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_severity ON public.incidents(severity) WHERE deleted_at IS NULL AND status NOT IN ('resolved', 'closed');
CREATE INDEX idx_incidents_system ON public.incidents(ai_system_id) WHERE deleted_at IS NULL;

CREATE TRIGGER on_incidents_updated
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_incidents" ON public.incidents
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND deleted_at IS NULL
  );

CREATE POLICY "insert_incidents" ON public.incidents
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "update_incidents" ON public.incidents
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer',
      'risk_manager', 'data_scientist', 'ethics_officer'
    )
  );
