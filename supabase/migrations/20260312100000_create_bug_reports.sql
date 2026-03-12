-- Bug reports table for beta portal feedback
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('blocking', 'annoying', 'minor')),
  screenshot_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bug_reports_organization_id ON public.bug_reports(organization_id);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert bug reports for their organization"
  ON public.bug_reports FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Users can view bug reports for their organization"
  ON public.bug_reports FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Users can update own bug reports"
  ON public.bug_reports FOR UPDATE
  USING (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  )
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE TRIGGER set_updated_at_bug_reports
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT ALL ON public.bug_reports TO authenticated;

-- Storage bucket for bug report screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-screenshots', 'bug-screenshots', false);

CREATE POLICY "Authenticated users can upload bug screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bug-screenshots'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view bug screenshots from their org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bug-screenshots'
    AND auth.role() = 'authenticated'
  );
