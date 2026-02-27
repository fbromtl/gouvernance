-- Public document library: metadata visible to all, files are static assets
CREATE TABLE public.public_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('quebec', 'canada', 'europe', 'france', 'usa')),
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  category_description TEXT NOT NULL DEFAULT '',
  category_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'html')),
  file_url TEXT NOT NULL,
  summary_purpose TEXT NOT NULL DEFAULT '',
  summary_content TEXT NOT NULL DEFAULT '',
  summary_governance TEXT NOT NULL DEFAULT '',
  document_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for the main query pattern: list by jurisdiction
CREATE INDEX idx_public_documents_jurisdiction ON public.public_documents(jurisdiction, category_order, document_order);

-- Unique constraint for upsert by file_url
ALTER TABLE public.public_documents ADD CONSTRAINT public_documents_file_url_key UNIQUE (file_url);

-- RLS: anyone can read published documents metadata
ALTER TABLE public.public_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published public documents"
  ON public.public_documents
  FOR SELECT
  USING (is_published = true);

-- Only service role can insert/update/delete (admin scripts)
CREATE POLICY "Service role full access"
  ON public.public_documents
  FOR ALL
  USING (auth.role() = 'service_role');
