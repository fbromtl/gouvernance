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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "GouvernanceIA-Veille/1.0" },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRSSItems(xml, feed.source);
      } catch {
        clearTimeout(timeout);
        return [];
      }
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
      max_tokens: 1024,
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
