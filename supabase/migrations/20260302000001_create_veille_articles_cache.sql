-- Cache for AI-classified regulatory watch articles
CREATE TABLE public.veille_articles_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  snippet TEXT,
  pub_date TIMESTAMPTZ NOT NULL,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('quebec', 'canada', 'eu', 'france', 'usa', 'international')),
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '24 hours'
);

CREATE INDEX idx_veille_cache_jurisdiction ON public.veille_articles_cache(jurisdiction);
CREATE INDEX idx_veille_cache_expires ON public.veille_articles_cache(expires_at);
CREATE INDEX idx_veille_cache_link ON public.veille_articles_cache(link);

ALTER TABLE public.veille_articles_cache ENABLE ROW LEVEL SECURITY;

-- Service role only (Edge Functions use service role key)
CREATE POLICY "Service role full access on veille cache"
  ON public.veille_articles_cache
  FOR ALL
  USING (auth.role() = 'service_role');
