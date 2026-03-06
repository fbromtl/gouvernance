-- Saved articles for veille réglementaire
CREATE TABLE public.saved_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  saved_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_link TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT,
  snippet TEXT,
  pub_date TIMESTAMPTZ,
  jurisdiction TEXT CHECK (jurisdiction IN ('quebec', 'canada', 'eu', 'france', 'usa', 'international')),
  ai_summary TEXT,
  notes TEXT DEFAULT '',
  is_favorite BOOLEAN DEFAULT true,
  shared_to_org BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(saved_by, article_link)
);

CREATE INDEX idx_saved_articles_org ON public.saved_articles(organization_id);
CREATE INDEX idx_saved_articles_user ON public.saved_articles(saved_by);
CREATE INDEX idx_saved_articles_shared ON public.saved_articles(organization_id, shared_to_org) WHERE shared_to_org = true;

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved articles + articles shared to their org
CREATE POLICY "Users can read own or org-shared articles"
  ON public.saved_articles FOR SELECT
  USING (
    saved_by = auth.uid()
    OR (
      shared_to_org = true
      AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can insert their own articles
CREATE POLICY "Users can insert own articles"
  ON public.saved_articles FOR INSERT
  WITH CHECK (saved_by = auth.uid());

-- Users can update their own articles
CREATE POLICY "Users can update own articles"
  ON public.saved_articles FOR UPDATE
  USING (saved_by = auth.uid());

-- Users can delete their own articles
CREATE POLICY "Users can delete own articles"
  ON public.saved_articles FOR DELETE
  USING (saved_by = auth.uid());

-- Org members can update status/assigned_to on shared articles
CREATE POLICY "Org members can update shared articles"
  ON public.saved_articles FOR UPDATE
  USING (
    shared_to_org = true
    AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );
