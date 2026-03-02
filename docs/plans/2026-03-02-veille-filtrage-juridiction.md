# Veille Filtrage par Juridiction — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add jurisdiction-based filtering (AI classification) and text search to the Veille regulatory watch portal page.

**Architecture:** The Edge Function `regulatory-watch` is enriched with batch AI classification that tags each article with a jurisdiction. A Supabase cache table stores classified articles (24h TTL). The frontend adds pill filter buttons + search input, filtering client-side from the enriched data.

**Tech Stack:** Deno Edge Functions, OpenAI `gpt-4o-mini`, Supabase PostgreSQL, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, i18next

**Design doc:** `docs/plans/2026-03-02-veille-filtrage-juridiction-design.md`

---

### Task 1: Create Supabase migration for veille_articles_cache table

**Files:**
- Create: `supabase/migrations/20260302000001_create_veille_articles_cache.sql`

**Step 1: Create migration file**

```sql
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
```

**Step 2: Apply migration to Supabase**

Run via Supabase Dashboard SQL Editor or CLI:
```bash
supabase db push
```

Expected: Table `veille_articles_cache` created with indexes and RLS policies.

**Step 3: Commit**

```bash
git add supabase/migrations/20260302000001_create_veille_articles_cache.sql
git commit -m "feat(veille): add veille_articles_cache migration for jurisdiction classification"
```

---

### Task 2: Create the regulatory-watch Edge Function locally

The `regulatory-watch` Edge Function currently exists only remotely. We create it locally in the repo so it can be version-controlled and updated.

**Files:**
- Create: `supabase/functions/regulatory-watch/index.ts`

**Step 1: Create the Edge Function with RSS fetch + AI classification + cache**

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/* ------------------------------------------------------------------ */
/*  CORS helpers                                                       */
/* ------------------------------------------------------------------ */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Jurisdiction = "quebec" | "canada" | "eu" | "france" | "usa" | "international";

interface RawArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

interface ClassifiedArticle extends RawArticle {
  jurisdiction: Jurisdiction;
}

/* ------------------------------------------------------------------ */
/*  RSS feeds config                                                   */
/* ------------------------------------------------------------------ */

const RSS_FEEDS = [
  { url: "https://www.cai.gouv.qc.ca/feed/", source: "CAI Québec" },
  { url: "https://www.priv.gc.ca/rss/news_f.xml", source: "CPVP Canada" },
  { url: "https://artificialintelligenceact.eu/feed/", source: "EU AI Act" },
  { url: "https://www.cnil.fr/fr/rss.xml", source: "CNIL France" },
  { url: "https://www.nist.gov/blogs/cybersecurity-insights/rss.xml", source: "NIST USA" },
];

/* ------------------------------------------------------------------ */
/*  Parse RSS XML → RawArticle[]                                       */
/* ------------------------------------------------------------------ */

function parseRSSItems(xml: string, source: string): RawArticle[] {
  const items: RawArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ??
      block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const snippet =
      block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
      block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "";

    if (title && link) {
      items.push({ title: title.trim(), link: link.trim(), pubDate, source, snippet: snippet.trim() });
    }
  }
  return items;
}

/* ------------------------------------------------------------------ */
/*  Fetch all RSS feeds                                                */
/* ------------------------------------------------------------------ */

async function fetchAllFeeds(): Promise<RawArticle[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "GouvernanceIA-Veille/1.0" },
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRSSItems(xml, feed.source);
    })
  );

  const articles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  // Sort by date descending, limit to 50
  articles.sort((a, b) => {
    const da = new Date(a.pubDate).getTime() || 0;
    const db = new Date(b.pubDate).getTime() || 0;
    return db - da;
  });

  return articles.slice(0, 50);
}

/* ------------------------------------------------------------------ */
/*  Check cache for existing classifications                           */
/* ------------------------------------------------------------------ */

async function getCachedArticles(
  supabase: ReturnType<typeof createClient>,
  links: string[]
): Promise<Map<string, ClassifiedArticle>> {
  if (links.length === 0) return new Map();

  const { data } = await supabase
    .from("veille_articles_cache")
    .select("*")
    .in("link", links)
    .gt("expires_at", new Date().toISOString());

  const map = new Map<string, ClassifiedArticle>();
  if (data) {
    for (const row of data) {
      map.set(row.link, {
        title: row.title,
        link: row.link,
        pubDate: row.pub_date,
        source: row.source,
        snippet: row.snippet ?? "",
        jurisdiction: row.jurisdiction as Jurisdiction,
      });
    }
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Classify uncached articles via AI batch                            */
/* ------------------------------------------------------------------ */

const VALID_JURISDICTIONS: Jurisdiction[] = ["quebec", "canada", "eu", "france", "usa", "international"];

async function classifyArticles(
  articles: RawArticle[],
  openaiKey: string
): Promise<Jurisdiction[]> {
  if (articles.length === 0) return [];

  const articlesPayload = articles.map((a, i) => ({
    index: i,
    title: a.title,
    snippet: a.snippet.slice(0, 200),
  }));

  const prompt = `Tu es un classificateur de juridictions pour des articles de veille réglementaire en gouvernance de l'IA.

Pour chaque article ci-dessous, détermine la juridiction principale parmi :
- "quebec" : Loi 25, CAI, OBVIA, droit québécois
- "canada" : CPVP, C-27/LIAD, droit fédéral canadien
- "eu" : EU AI Act, RGPD, normes européennes (hors France spécifiquement)
- "france" : CNIL, droit français spécifique
- "usa" : NIST, Executive Orders, droit américain
- "international" : ISO, IEEE, UNESCO, OCDE, multi-juridictionnel

Retourne UNIQUEMENT un tableau JSON de strings, dans le même ordre que les articles.
Exemple: ["quebec","eu","usa"]

Articles :
${JSON.stringify(articlesPayload)}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI classification error:", await res.text());
    // Fallback: all "international"
    return articles.map(() => "international");
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "[]";

  try {
    // Extract JSON array from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return articles.map(() => "international");

    const parsed: string[] = JSON.parse(jsonMatch[0]);
    return parsed.map((j: string) =>
      VALID_JURISDICTIONS.includes(j as Jurisdiction) ? (j as Jurisdiction) : "international"
    );
  } catch {
    console.error("Failed to parse classification:", content);
    return articles.map(() => "international");
  }
}

/* ------------------------------------------------------------------ */
/*  Upsert classified articles into cache                              */
/* ------------------------------------------------------------------ */

async function cacheArticles(
  supabase: ReturnType<typeof createClient>,
  articles: ClassifiedArticle[]
): Promise<void> {
  if (articles.length === 0) return;

  const rows = articles.map((a) => ({
    link: a.link,
    title: a.title,
    source: a.source,
    snippet: a.snippet,
    pub_date: a.pubDate,
    jurisdiction: a.jurisdiction,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error } = await supabase
    .from("veille_articles_cache")
    .upsert(rows, { onConflict: "link" });

  if (error) {
    console.error("Cache upsert error:", error);
  }
}

/* ------------------------------------------------------------------ */
/*  Summarize action (POST)                                            */
/* ------------------------------------------------------------------ */

async function handleSummarize(
  body: Record<string, unknown>,
  openaiKey: string
): Promise<Response> {
  const action = body.action as string;
  const language = (body.language as string) || "fr";
  const lang = language === "en" ? "English" : "French";

  let prompt: string;

  if (action === "weekly-summary") {
    const articles = body.articles as RawArticle[];
    const titles = articles.map((a) => `- ${a.title} (${a.source})`).join("\n");
    prompt = `Voici les titres des articles de veille réglementaire de cette semaine :\n${titles}\n\nGénère un résumé synthétique des principales tendances et évolutions en ${lang}. Maximum 3 paragraphes courts.`;
  } else if (action === "summarize") {
    const title = body.title as string;
    const snippet = body.snippet as string;
    prompt = `Résume cet article de veille réglementaire en ${lang} :\nTitre: ${title}\nExtrait: ${snippet}\n\nRésumé en 3-5 points clés.`;
  } else {
    return jsonResponse({ error: "Unknown action" }, 400);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    return jsonResponse({ error: "AI service error" }, 502);
  }

  const data = await res.json();
  const summary = data.choices?.[0]?.message?.content ?? "";
  return jsonResponse({ summary });
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // ---- Verify JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      return jsonResponse({ error: "OpenAI API key not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    // ---- POST: summarize action ----
    if (req.method === "POST") {
      const body = await req.json();
      return await handleSummarize(body, openaiKey);
    }

    // ---- GET: fetch + classify articles ----
    if (req.method === "GET") {
      // 1. Fetch all RSS feeds
      const rawArticles = await fetchAllFeeds();

      // 2. Check cache
      const links = rawArticles.map((a) => a.link);
      const cached = await getCachedArticles(supabase, links);

      // 3. Separate cached vs uncached
      const uncachedArticles: RawArticle[] = [];
      const resultArticles: ClassifiedArticle[] = [];

      for (const article of rawArticles) {
        const cachedArticle = cached.get(article.link);
        if (cachedArticle) {
          resultArticles.push(cachedArticle);
        } else {
          uncachedArticles.push(article);
        }
      }

      // 4. Classify uncached articles via AI
      if (uncachedArticles.length > 0) {
        const jurisdictions = await classifyArticles(uncachedArticles, openaiKey);
        const newlyClassified: ClassifiedArticle[] = uncachedArticles.map((a, i) => ({
          ...a,
          jurisdiction: jurisdictions[i] ?? "international",
        }));

        // 5. Cache newly classified articles
        await cacheArticles(supabase, newlyClassified);

        resultArticles.push(...newlyClassified);
      }

      // 6. Re-sort by date
      resultArticles.sort((a, b) => {
        const da = new Date(a.pubDate).getTime() || 0;
        const db = new Date(b.pubDate).getTime() || 0;
        return db - da;
      });

      return jsonResponse({ articles: resultArticles });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/regulatory-watch/index.ts
git commit -m "feat(veille): add regulatory-watch edge function with AI jurisdiction classification"
```

---

### Task 3: Update i18n translation files

**Files:**
- Modify: `src/i18n/locales/fr/veille.json`
- Modify: `src/i18n/locales/en/veille.json`

**Step 1: Add filter keys to French translations**

Add the `"filters"` block to `src/i18n/locales/fr/veille.json` after the existing `"articles"` block:

```json
"filters": {
  "searchPlaceholder": "Rechercher un article...",
  "all": "Tous",
  "quebec": "Québec",
  "canada": "Canada",
  "eu": "UE",
  "france": "France",
  "usa": "USA",
  "international": "International",
  "resultsCount_one": "{{count}} résultat",
  "resultsCount_other": "{{count}} résultats",
  "noResults": "Aucun article ne correspond à vos filtres."
}
```

**Step 2: Add filter keys to English translations**

Add the `"filters"` block to `src/i18n/locales/en/veille.json` after the existing `"articles"` block:

```json
"filters": {
  "searchPlaceholder": "Search articles...",
  "all": "All",
  "quebec": "Quebec",
  "canada": "Canada",
  "eu": "EU",
  "france": "France",
  "usa": "USA",
  "international": "International",
  "resultsCount_one": "{{count}} result",
  "resultsCount_other": "{{count}} results",
  "noResults": "No articles match your filters."
}
```

**Step 3: Commit**

```bash
git add src/i18n/locales/fr/veille.json src/i18n/locales/en/veille.json
git commit -m "feat(veille): add i18n keys for jurisdiction filters and search"
```

---

### Task 4: Update VeillePage.tsx — Add Jurisdiction type and filter state

**Files:**
- Modify: `src/portail/pages/VeillePage.tsx`

**Step 1: Add Jurisdiction type and update Article interface**

At the top of the file, replace the `Article` interface with:

```ts
type Jurisdiction = "quebec" | "canada" | "eu" | "france" | "usa" | "international";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
  jurisdiction: Jurisdiction;
}
```

**Step 2: Add imports for new UI elements**

Add to the lucide-react import:
```ts
import { Search } from "lucide-react";
```

Add to the existing imports:
```ts
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
```

Update the `useState` import to include `useMemo`:
```ts
import { useState, useEffect, useCallback, useMemo } from "react";
```

**Step 3: Add filter state variables**

Inside the `VeillePage` component, after the existing state declarations, add:

```ts
// Filter state
const [activeJurisdiction, setActiveJurisdiction] = useState<Jurisdiction | "all">("all");
const [searchQuery, setSearchQuery] = useState("");
```

**Step 4: Add jurisdiction config and computed filtered articles**

After the filter state, add:

```ts
// Jurisdiction config
const JURISDICTIONS: { key: Jurisdiction | "all"; color: string }[] = [
  { key: "all", color: "" },
  { key: "quebec", color: "bg-blue-100 text-blue-700" },
  { key: "canada", color: "bg-red-100 text-red-700" },
  { key: "eu", color: "bg-indigo-100 text-indigo-700" },
  { key: "france", color: "bg-sky-100 text-sky-700" },
  { key: "usa", color: "bg-amber-100 text-amber-700" },
  { key: "international", color: "bg-neutral-100 text-neutral-700" },
];

const jurisdictionColor = (j: Jurisdiction): string =>
  JURISDICTIONS.find((jc) => jc.key === j)?.color ?? "bg-neutral-100 text-neutral-700";

// Filtered articles
const filteredArticles = useMemo(() => {
  return articles.filter((a) => {
    const matchJurisdiction =
      activeJurisdiction === "all" || a.jurisdiction === activeJurisdiction;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.snippet.toLowerCase().includes(q);
    return matchJurisdiction && matchSearch;
  });
}, [articles, activeJurisdiction, searchQuery]);

// Counts per jurisdiction
const jurisdictionCounts = useMemo(() => {
  const counts: Record<string, number> = { all: articles.length };
  for (const a of articles) {
    counts[a.jurisdiction] = (counts[a.jurisdiction] ?? 0) + 1;
  }
  return counts;
}, [articles]);
```

**Step 5: Commit**

```bash
git add src/portail/pages/VeillePage.tsx
git commit -m "feat(veille): add jurisdiction type, filter state, and computed filtered articles"
```

---

### Task 5: Update VeillePage.tsx — Add filter bar UI

**Files:**
- Modify: `src/portail/pages/VeillePage.tsx`

**Step 1: Add the filter bar between the header and the weekly summary card**

Insert this JSX block right after the closing `</div>` of the header section (after `{t("pageDescription")}`) and before the `{/* ---- Weekly AI Summary ---- */}` comment:

```tsx
{/* ---- Filter Bar ---- */}
<div className="space-y-3">
  {/* Search input */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={t("filters.searchPlaceholder")}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9 h-9"
    />
  </div>

  {/* Jurisdiction pills */}
  <div className="flex flex-wrap gap-2">
    {JURISDICTIONS.map(({ key }) => {
      const count = jurisdictionCounts[key] ?? 0;
      const isActive = activeJurisdiction === key;
      return (
        <button
          key={key}
          onClick={() => setActiveJurisdiction(key)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            isActive
              ? "bg-brand-purple text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {t(`filters.${key}`)}
          <span
            className={`text-[10px] ${
              isActive ? "text-white/70" : "text-neutral-400"
            }`}
          >
            ({count})
          </span>
        </button>
      );
    })}
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/portail/pages/VeillePage.tsx
git commit -m "feat(veille): add jurisdiction filter pills and search input UI"
```

---

### Task 6: Update VeillePage.tsx — Use filteredArticles in the article list + add jurisdiction badge

**Files:**
- Modify: `src/portail/pages/VeillePage.tsx`

**Step 1: Replace `articles` with `filteredArticles` in the article list render**

In the articles list section, replace all three occurrences of `articles.length` (inside the `{!loadingArticles && ...}` conditions for the list rendering) with `filteredArticles.length`, and replace `articles.map(...)` with `filteredArticles.map(...)`.

Specifically, change:

```tsx
{!loadingArticles && !articlesError && articles.length === 0 && (
```
to:
```tsx
{!loadingArticles && !articlesError && filteredArticles.length === 0 && (
```

And the empty state message should check if filters are active:
```tsx
{!loadingArticles && !articlesError && filteredArticles.length === 0 && (
  <Card>
    <CardContent className="py-8 text-center text-muted-foreground">
      <Newspaper className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
      <p className="text-sm">
        {articles.length > 0 ? t("filters.noResults") : t("articles.empty")}
      </p>
    </CardContent>
  </Card>
)}
```

Change:
```tsx
{!loadingArticles && !articlesError && articles.length > 0 && (
```
to:
```tsx
{!loadingArticles && !articlesError && filteredArticles.length > 0 && (
```

Change:
```tsx
{articles.map((article) => (
```
to:
```tsx
{filteredArticles.map((article) => (
```

**Step 2: Add jurisdiction badge to each article card**

Inside the article card's metadata area (the `<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">` section), add a jurisdiction badge right after the source badge:

```tsx
<Badge
  variant="outline"
  className={`text-[10px] font-normal px-1.5 py-0 border-0 ${jurisdictionColor(article.jurisdiction)}`}
>
  {t(`filters.${article.jurisdiction}`)}
</Badge>
```

The full metadata div becomes:
```tsx
<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
  <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
    {article.source}
  </Badge>
  <Badge
    variant="outline"
    className={`text-[10px] font-normal px-1.5 py-0 border-0 ${jurisdictionColor(article.jurisdiction)}`}
  >
    {t(`filters.${article.jurisdiction}`)}
  </Badge>
  <span>{formatDate(article.pubDate, lang)}</span>
</div>
```

**Step 3: Commit**

```bash
git add src/portail/pages/VeillePage.tsx
git commit -m "feat(veille): use filtered articles in list render + add jurisdiction badge"
```

---

### Task 7: Deploy Edge Function and verify

**Step 1: Deploy the updated regulatory-watch Edge Function**

```bash
cd supabase
supabase functions deploy regulatory-watch
```

Expected: Function deployed successfully.

**Step 2: Verify locally**

```bash
npm run dev
```

1. Navigate to `/veille` in the portal
2. Verify articles load with jurisdiction badges
3. Click jurisdiction pill buttons — articles should filter instantly
4. Type in search box — articles should filter by title/snippet
5. Combine filters — jurisdiction + text search should work together
6. Click "Tous" to reset — all articles should appear
7. Verify the empty state message when no articles match filters
8. Verify "Résumer" still works on individual articles
9. Verify "Générer le résumé IA" weekly summary still works

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(veille): complete jurisdiction filtering and search implementation"
```
