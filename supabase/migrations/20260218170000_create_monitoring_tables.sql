-- Module 10: Monitoring Post-Deploiement
-- Tables: monitoring_metrics, monitoring_data_points

/* ================================================================== */
/*  monitoring_metrics - Configuration of what to monitor per AI system */
/* ================================================================== */

CREATE TABLE IF NOT EXISTS public.monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance','latency','volume','errors','drift_data','drift_model','quality','feedback','custom')),
  unit TEXT,
  direction TEXT NOT NULL DEFAULT 'higher_is_better' CHECK (direction IN ('higher_is_better','lower_is_better','target_range')),
  target_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  acceptable_min NUMERIC,
  acceptable_max NUMERIC,
  collection_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (collection_frequency IN ('realtime','hourly','daily','weekly','monthly','on_demand')),
  source TEXT NOT NULL DEFAULT 'manual_input' CHECK (source IN ('manual_input','csv_import','api_webhook','scheduled_report')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_org ON public.monitoring_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_system ON public.monitoring_metrics(organization_id, ai_system_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_monitoring_metrics ON public.monitoring_metrics;
CREATE TRIGGER set_updated_at_monitoring_metrics
  BEFORE UPDATE ON public.monitoring_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org monitoring_metrics"
  ON public.monitoring_metrics FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org monitoring_metrics"
  ON public.monitoring_metrics FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org monitoring_metrics"
  ON public.monitoring_metrics FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org monitoring_metrics"
  ON public.monitoring_metrics FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Grant access
GRANT ALL ON public.monitoring_metrics TO authenticated;

/* ================================================================== */
/*  monitoring_data_points - Actual metric values over time            */
/* ================================================================== */

CREATE TABLE IF NOT EXISTS public.monitoring_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES public.monitoring_metrics(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  alert_level TEXT CHECK (alert_level IS NULL OR alert_level IN ('ok','warning','critical')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monitoring_data_points_org ON public.monitoring_data_points(organization_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_data_points_metric ON public.monitoring_data_points(metric_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_data_points_recorded ON public.monitoring_data_points(metric_id, recorded_at DESC);

-- RLS
ALTER TABLE public.monitoring_data_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org monitoring_data_points"
  ON public.monitoring_data_points FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can insert own org monitoring_data_points"
  ON public.monitoring_data_points FOR INSERT
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update own org monitoring_data_points"
  ON public.monitoring_data_points FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid)
  WITH CHECK (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can delete own org monitoring_data_points"
  ON public.monitoring_data_points FOR DELETE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Grant access
GRANT ALL ON public.monitoring_data_points TO authenticated;
