# Veille Reglementaire UX Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformer la page Veille d'un lecteur de flux RSS ephemere en un outil de veille structure avec sauvegarde d'articles, favoris, partage a l'organisation, resume IA persiste, onglets et Sheet de detail.

**Architecture:** Nouvelle table Supabase `saved_articles` avec RLS, nouveau hook `useSavedArticles` (TanStack Query), refonte complete de `VeillePage.tsx` avec onglets Tabs (Flux/Favoris/Org), cards compactes enrichies, et Sheet de detail pour les actions.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui (Tabs, Sheet, Badge, Card, Select, Textarea), TanStack React Query, Supabase PostgreSQL + RLS, i18next

---

## Task 1: Migration Supabase — table `saved_articles`

**Files:**
- Create: `supabase/migrations/20260306100000_create_saved_articles.sql`

**Step 1: Write the migration**

```sql
-- Saved articles for veille regulementaire
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
```

**Step 2: Apply the migration**

Run: `npx supabase db push`
Expected: Migration applied successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/20260306100000_create_saved_articles.sql
git commit -m "feat: migration saved_articles pour veille réglementaire"
```

---

## Task 2: Hook `useSavedArticles`

**Files:**
- Create: `src/hooks/useSavedArticles.ts`

**Step 1: Write the hook**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface SavedArticle {
  id: string;
  organization_id: string;
  saved_by: string;
  article_link: string;
  title: string;
  source: string | null;
  snippet: string | null;
  pub_date: string | null;
  jurisdiction: string | null;
  ai_summary: string | null;
  notes: string;
  is_favorite: boolean;
  shared_to_org: boolean;
  status: "unread" | "read" | "archived";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

/* ---- List saved articles (own + org-shared) ---- */

export function useSavedArticles() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["saved-articles", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("saved_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedArticle[];
    },
    enabled: !!orgId,
  });
}

/* ---- Save an article ---- */

export function useSaveArticle() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      article_link: string;
      title: string;
      source?: string;
      snippet?: string;
      pub_date?: string;
      jurisdiction?: string;
      ai_summary?: string;
      is_favorite?: boolean;
      shared_to_org?: boolean;
    }) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("saved_articles")
        .upsert(
          {
            ...input,
            organization_id: profile.organization_id,
            saved_by: user.id,
          },
          { onConflict: "saved_by,article_link" }
        )
        .select()
        .single();

      if (error) throw error;
      return data as SavedArticle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}

/* ---- Update a saved article (notes, status, assigned_to, etc.) ---- */

export function useUpdateSavedArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<SavedArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from("saved_articles")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as SavedArticle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}

/* ---- Delete a saved article ---- */

export function useDeleteSavedArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_articles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}
```

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/hooks/useSavedArticles.ts
git commit -m "feat: hook useSavedArticles — CRUD articles sauvegardés"
```

---

## Task 3: i18n — nouvelles cles FR + EN

**Files:**
- Modify: `src/i18n/locales/fr/veille.json` (full rewrite)
- Modify: `src/i18n/locales/en/veille.json` (full rewrite)

**Step 1: Write FR translations**

Replace entire content of `src/i18n/locales/fr/veille.json`:

```json
{
  "pageTitle": "Veille réglementaire",
  "pageDescription": "Suivez les dernières actualités en gouvernance de l'intelligence artificielle.",
  "tabs": {
    "feed": "Flux",
    "favorites": "Favoris",
    "organization": "Organisation"
  },
  "weeklySummary": {
    "title": "Résumé IA de la semaine",
    "subtitle": "Principales évolutions réglementaires et actualités en gouvernance IA",
    "loading": "Génération du résumé en cours…",
    "regenerate": "Régénérer",
    "generate": "Générer le résumé IA",
    "prompt": "Cliquez pour générer un résumé IA des actualités de la semaine.",
    "error": "Impossible de générer le résumé. Réessayez.",
    "empty": "Aucun article récent pour générer un résumé."
  },
  "articles": {
    "title": "Dernières actualités",
    "loading": "Chargement des actualités…",
    "error": "Impossible de charger le flux RSS. Réessayez.",
    "empty": "Aucune actualité disponible pour le moment.",
    "readArticle": "Lire l'article",
    "summarize": "Résumer",
    "summarizing": "Résumé en cours…",
    "summaryTitle": "Résumé IA",
    "close": "Fermer",
    "source": "Source",
    "published": "Publié le",
    "save": "Sauvegarder",
    "saved": "Sauvegardé",
    "unsave": "Retirer",
    "shareToOrg": "Partager à l'org",
    "sharedToOrg": "Partagé",
    "generateSummary": "Générer le résumé IA",
    "regenerateSummary": "Régénérer"
  },
  "sheet": {
    "originalSnippet": "Extrait original",
    "readOriginal": "Lire l'article original",
    "aiSummary": "Résumé IA",
    "notes": "Notes",
    "notesPlaceholder": "Ajoutez vos notes sur cet article…",
    "actions": "Actions",
    "favorite": "Favori",
    "shareOrg": "Partager à l'organisation",
    "assignTo": "Assigner à",
    "assignNone": "Non assigné",
    "status": "Statut",
    "saveFirst": "Sauvegardez l'article pour accéder aux notes et actions.",
    "sharedBy": "Partagé par"
  },
  "statuses": {
    "unread": "Non lu",
    "read": "Lu",
    "archived": "Archivé"
  },
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
    "noResults": "Aucun article ne correspond à vos filtres.",
    "allStatuses": "Tous les statuts"
  },
  "empty": {
    "favoritesTitle": "Aucun favori",
    "favoritesDescription": "Sauvegardez des articles depuis le flux pour les retrouver ici.",
    "orgTitle": "Aucun article partagé",
    "orgDescription": "Les articles partagés par les membres de votre organisation apparaîtront ici."
  },
  "toast": {
    "saved": "Article sauvegardé",
    "removed": "Article retiré des favoris",
    "shared": "Article partagé à l'organisation",
    "unshared": "Partage retiré",
    "updated": "Article mis à jour",
    "error": "Une erreur est survenue"
  },
  "help": {
    "title": "Comprendre : Veille réglementaire",
    "why": "La veille réglementaire vous permet de rester informé des dernières évolutions en matière de gouvernance de l'IA. Elle agrège automatiquement les actualités pertinentes et utilise l'IA pour vous fournir des résumés synthétiques.",
    "how": "1. Consultez le résumé IA en haut de page pour un aperçu hebdomadaire.\n2. Sauvegardez les articles importants dans vos favoris.\n3. Partagez les articles pertinents avec votre organisation.\n4. Ajoutez des notes et assignez un suivi aux articles partagés."
  }
}
```

**Step 2: Write EN translations**

Replace entire content of `src/i18n/locales/en/veille.json`:

```json
{
  "pageTitle": "Regulatory Watch",
  "pageDescription": "Follow the latest news on artificial intelligence governance.",
  "tabs": {
    "feed": "Feed",
    "favorites": "Favorites",
    "organization": "Organization"
  },
  "weeklySummary": {
    "title": "AI Weekly Summary",
    "subtitle": "Key regulatory developments and AI governance news",
    "loading": "Generating summary…",
    "regenerate": "Regenerate",
    "generate": "Generate AI summary",
    "prompt": "Click to generate an AI summary of this week's news.",
    "error": "Unable to generate summary. Please try again.",
    "empty": "No recent articles to generate a summary."
  },
  "articles": {
    "title": "Latest News",
    "loading": "Loading news…",
    "error": "Unable to load RSS feed. Please try again.",
    "empty": "No news available at the moment.",
    "readArticle": "Read article",
    "summarize": "Summarize",
    "summarizing": "Summarizing…",
    "summaryTitle": "AI Summary",
    "close": "Close",
    "source": "Source",
    "published": "Published on",
    "save": "Save",
    "saved": "Saved",
    "unsave": "Remove",
    "shareToOrg": "Share to org",
    "sharedToOrg": "Shared",
    "generateSummary": "Generate AI summary",
    "regenerateSummary": "Regenerate"
  },
  "sheet": {
    "originalSnippet": "Original excerpt",
    "readOriginal": "Read original article",
    "aiSummary": "AI Summary",
    "notes": "Notes",
    "notesPlaceholder": "Add your notes about this article…",
    "actions": "Actions",
    "favorite": "Favorite",
    "shareOrg": "Share with organization",
    "assignTo": "Assign to",
    "assignNone": "Unassigned",
    "status": "Status",
    "saveFirst": "Save the article to access notes and actions.",
    "sharedBy": "Shared by"
  },
  "statuses": {
    "unread": "Unread",
    "read": "Read",
    "archived": "Archived"
  },
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
    "noResults": "No articles match your filters.",
    "allStatuses": "All statuses"
  },
  "empty": {
    "favoritesTitle": "No favorites",
    "favoritesDescription": "Save articles from the feed to find them here.",
    "orgTitle": "No shared articles",
    "orgDescription": "Articles shared by your organization members will appear here."
  },
  "toast": {
    "saved": "Article saved",
    "removed": "Article removed from favorites",
    "shared": "Article shared with organization",
    "unshared": "Share removed",
    "updated": "Article updated",
    "error": "An error occurred"
  },
  "help": {
    "title": "Understanding: Regulatory Watch",
    "why": "Regulatory Watch keeps you informed of the latest developments in AI governance. It automatically aggregates relevant news and uses AI to provide concise summaries.",
    "how": "1. Check the AI summary at the top for a weekly overview.\n2. Save important articles to your favorites.\n3. Share relevant articles with your organization.\n4. Add notes and assign follow-up on shared articles."
  }
}
```

**Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/i18n/locales/fr/veille.json src/i18n/locales/en/veille.json
git commit -m "feat: i18n veille — nouvelles clés onglets, sheet, statuts, toasts"
```

---

## Task 4: Refonte VeillePage — structure avec onglets

**Files:**
- Modify: `src/portail/pages/VeillePage.tsx` (full rewrite)

This is the largest task. The page is rewritten to use:
- `Tabs` (shadcn/ui) for Flux / Favoris / Organisation
- `Sheet` (shadcn/ui) for article detail panel
- `useSavedArticles` hook for persistence
- Compact enriched cards with inline actions (favorite star, save button)
- Weekly summary card (collapsible) on Flux tab only

**Step 1: Rewrite VeillePage.tsx**

```tsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Newspaper,
  Sparkles,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
  Star,
  Bookmark,
  BookmarkCheck,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useSavedArticles,
  useSaveArticle,
  useUpdateSavedArticle,
  useDeleteSavedArticle,
  type SavedArticle,
} from "@/hooks/useSavedArticles";
import { useOrgMembers } from "@/hooks/useOrgMembers";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Jurisdiction =
  | "quebec"
  | "canada"
  | "eu"
  | "france"
  | "usa"
  | "international";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
  jurisdiction: Jurisdiction;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

async function fetchRSS(): Promise<Article[]> {
  if (!supabaseConfigured) throw new Error("Supabase not configured");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/regulatory-watch`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const data = await res.json();
  return data.articles ?? [];
}

async function callAI(
  action: string,
  payload: Record<string, unknown>,
): Promise<string> {
  if (!supabaseConfigured) throw new Error("Supabase not configured");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/regulatory-watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...payload }),
    },
  );
  if (!res.ok) throw new Error(`AI call failed: ${res.status}`);
  const data = await res.json();
  return data.summary ?? "";
}

function formatDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function stripHtml(html: string): string {
  const decoded = html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ");
  return decoded.replace(/<[^>]*>/g, "").trim();
}

/* ------------------------------------------------------------------ */
/*  Jurisdiction config                                                */
/* ------------------------------------------------------------------ */

const JURISDICTIONS: { key: Jurisdiction | "all"; color: string }[] = [
  { key: "all", color: "" },
  { key: "quebec", color: "bg-blue-100 text-blue-700" },
  { key: "canada", color: "bg-red-100 text-red-700" },
  { key: "eu", color: "bg-indigo-100 text-indigo-700" },
  { key: "france", color: "bg-sky-100 text-sky-700" },
  { key: "usa", color: "bg-amber-100 text-amber-700" },
  { key: "international", color: "bg-neutral-100 text-neutral-700" },
];

const jurisdictionColor = (j: string): string =>
  JURISDICTIONS.find((jc) => jc.key === j)?.color ??
  "bg-neutral-100 text-neutral-700";

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function VeillePage() {
  const { t, i18n } = useTranslation("veille");
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";
  const { user } = useAuth();

  // RSS articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articlesError, setArticlesError] = useState("");

  // Weekly summary
  const [weeklySummary, setWeeklySummary] = useState("");
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [weeklyError, setWeeklyError] = useState("");
  const [weeklyCollapsed, setWeeklyCollapsed] = useState(false);

  // Filters
  const [activeJurisdiction, setActiveJurisdiction] = useState<
    Jurisdiction | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Sheet
  const [sheetArticle, setSheetArticle] = useState<{
    article: Article;
    saved?: SavedArticle;
  } | null>(null);
  const [sheetSummaryLoading, setSheetSummaryLoading] = useState(false);
  const [sheetNotes, setSheetNotes] = useState("");
  const notesTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Saved articles
  const { data: savedArticles = [] } = useSavedArticles();
  const saveMutation = useSaveArticle();
  const updateMutation = useUpdateSavedArticle();
  const deleteMutation = useDeleteSavedArticle();
  const { data: orgMembers = [] } = useOrgMembers();

  // Lookup: article_link -> SavedArticle
  const savedByLink = useMemo(() => {
    const map = new Map<string, SavedArticle>();
    for (const s of savedArticles) map.set(s.article_link, s);
    return map;
  }, [savedArticles]);

  // Derived lists
  const myFavorites = useMemo(
    () => savedArticles.filter((a) => a.saved_by === user?.id && a.is_favorite),
    [savedArticles, user],
  );

  const orgShared = useMemo(
    () => savedArticles.filter((a) => a.shared_to_org),
    [savedArticles],
  );

  // Filtered RSS articles
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

  // Filtered favorites
  const filteredFavorites = useMemo(() => {
    return myFavorites.filter((a) => {
      const matchJurisdiction =
        activeJurisdiction === "all" ||
        a.jurisdiction === activeJurisdiction;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.snippet ?? "").toLowerCase().includes(q);
      return matchJurisdiction && matchSearch;
    });
  }, [myFavorites, activeJurisdiction, searchQuery]);

  // Filtered org articles
  const filteredOrg = useMemo(() => {
    return orgShared.filter((a) => {
      const matchJurisdiction =
        activeJurisdiction === "all" ||
        a.jurisdiction === activeJurisdiction;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.snippet ?? "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || a.status === statusFilter;
      return matchJurisdiction && matchSearch && matchStatus;
    });
  }, [orgShared, activeJurisdiction, searchQuery, statusFilter]);

  // Jurisdiction counts (for RSS feed tab)
  const jurisdictionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: articles.length };
    for (const a of articles) {
      counts[a.jurisdiction] = (counts[a.jurisdiction] ?? 0) + 1;
    }
    return counts;
  }, [articles]);

  /* ------ Fetch articles ------ */
  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    setArticlesError("");
    try {
      const arts = await fetchRSS();
      setArticles(arts);
      return arts;
    } catch (err) {
      console.error("RSS error:", err);
      setArticlesError(t("articles.error"));
      return [];
    } finally {
      setLoadingArticles(false);
    }
  }, [t]);

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------ Weekly summary ------ */
  const generateWeeklySummary = useCallback(
    async (arts: Article[]) => {
      if (arts.length === 0) return;
      setLoadingWeekly(true);
      setWeeklyError("");
      try {
        const summary = await callAI("weekly-summary", {
          articles: arts,
          language: lang,
        });
        setWeeklySummary(summary);
        setWeeklyCollapsed(false);
      } catch (err) {
        console.error("Weekly summary error:", err);
        setWeeklyError(t("weeklySummary.error"));
      } finally {
        setLoadingWeekly(false);
      }
    },
    [lang, t],
  );

  /* ------ Save / unsave article ------ */
  const handleSave = async (article: Article) => {
    const existing = savedByLink.get(article.link);
    if (existing) {
      try {
        await deleteMutation.mutateAsync(existing.id);
        toast.success(t("toast.removed"));
      } catch {
        toast.error(t("toast.error"));
      }
    } else {
      try {
        await saveMutation.mutateAsync({
          article_link: article.link,
          title: article.title,
          source: article.source,
          snippet: article.snippet,
          pub_date: article.pubDate,
          jurisdiction: article.jurisdiction,
        });
        toast.success(t("toast.saved"));
      } catch {
        toast.error(t("toast.error"));
      }
    }
  };

  /* ------ Open sheet ------ */
  const openSheet = (article: Article) => {
    const saved = savedByLink.get(article.link);
    setSheetArticle({ article, saved });
    setSheetNotes(saved?.notes ?? "");
  };

  const openSheetFromSaved = (saved: SavedArticle) => {
    const article: Article = {
      title: saved.title,
      link: saved.article_link,
      pubDate: saved.pub_date ?? "",
      source: saved.source ?? "",
      snippet: saved.snippet ?? "",
      jurisdiction: (saved.jurisdiction as Jurisdiction) ?? "international",
    };
    setSheetArticle({ article, saved });
    setSheetNotes(saved.notes ?? "");
  };

  /* ------ Sheet: generate AI summary ------ */
  const handleSheetSummarize = async () => {
    if (!sheetArticle) return;
    setSheetSummaryLoading(true);
    try {
      const summary = await callAI("summarize", {
        title: sheetArticle.article.title,
        url: sheetArticle.article.link,
        snippet: sheetArticle.article.snippet,
        language: lang,
      });
      // If saved, persist the summary
      if (sheetArticle.saved) {
        await updateMutation.mutateAsync({
          id: sheetArticle.saved.id,
          ai_summary: summary,
        });
        setSheetArticle((prev) =>
          prev
            ? { ...prev, saved: { ...prev.saved!, ai_summary: summary } }
            : null,
        );
      } else {
        // Save the article with summary
        const saved = await saveMutation.mutateAsync({
          article_link: sheetArticle.article.link,
          title: sheetArticle.article.title,
          source: sheetArticle.article.source,
          snippet: sheetArticle.article.snippet,
          pub_date: sheetArticle.article.pubDate,
          jurisdiction: sheetArticle.article.jurisdiction,
          ai_summary: summary,
        });
        setSheetArticle((prev) =>
          prev ? { ...prev, saved } : null,
        );
        toast.success(t("toast.saved"));
      }
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setSheetSummaryLoading(false);
    }
  };

  /* ------ Sheet: auto-save notes ------ */
  const handleNotesChange = (value: string) => {
    setSheetNotes(value);
    if (!sheetArticle?.saved) return;
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(async () => {
      try {
        await updateMutation.mutateAsync({
          id: sheetArticle.saved!.id,
          notes: value,
        });
      } catch {
        /* silent */
      }
    }, 1000);
  };

  /* ------ Sheet: toggle share to org ------ */
  const handleToggleShare = async (shared: boolean) => {
    if (!sheetArticle?.saved) return;
    try {
      await updateMutation.mutateAsync({
        id: sheetArticle.saved.id,
        shared_to_org: shared,
      });
      setSheetArticle((prev) =>
        prev && prev.saved
          ? { ...prev, saved: { ...prev.saved, shared_to_org: shared } }
          : null,
      );
      toast.success(shared ? t("toast.shared") : t("toast.unshared"));
    } catch {
      toast.error(t("toast.error"));
    }
  };

  /* ------ Sheet: update status ------ */
  const handleStatusChange = async (status: string) => {
    if (!sheetArticle?.saved) return;
    try {
      await updateMutation.mutateAsync({
        id: sheetArticle.saved.id,
        status: status as SavedArticle["status"],
      });
      setSheetArticle((prev) =>
        prev && prev.saved
          ? {
              ...prev,
              saved: {
                ...prev.saved,
                status: status as SavedArticle["status"],
              },
            }
          : null,
      );
    } catch {
      toast.error(t("toast.error"));
    }
  };

  /* ------ Sheet: assign member ------ */
  const handleAssign = async (userId: string) => {
    if (!sheetArticle?.saved) return;
    try {
      await updateMutation.mutateAsync({
        id: sheetArticle.saved.id,
        assigned_to: userId === "__none__" ? null : userId,
      });
      setSheetArticle((prev) =>
        prev && prev.saved
          ? {
              ...prev,
              saved: {
                ...prev.saved,
                assigned_to: userId === "__none__" ? null : userId,
              },
            }
          : null,
      );
    } catch {
      toast.error(t("toast.error"));
    }
  };

  /* ------ Sync sheet with saved articles data ------ */
  useEffect(() => {
    if (!sheetArticle) return;
    const fresh = savedByLink.get(sheetArticle.article.link);
    if (fresh && fresh.id !== sheetArticle.saved?.id) {
      setSheetArticle((prev) =>
        prev ? { ...prev, saved: fresh } : null,
      );
    }
  }, [savedByLink, sheetArticle]);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  const renderJurisdictionPills = () => (
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
                ? "bg-brand-forest text-white"
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
  );

  /* ------ Feed article card ------ */
  const renderFeedCard = (article: Article) => {
    const saved = savedByLink.get(article.link);
    const isSaved = !!saved;
    return (
      <Card
        key={article.link}
        className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onClick={() => openSheet(article)}
      >
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            {/* Favorite star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave(article);
              }}
              className="mt-0.5 shrink-0"
            >
              <Star
                className={`h-4 w-4 transition-colors ${
                  isSaved
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-300 hover:text-amber-400"
                }`}
              />
            </button>

            <div className="flex-1 min-w-0">
              {/* Meta row */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-normal px-1.5 py-0 border-0 ${jurisdictionColor(article.jurisdiction)}`}
                >
                  {t(`filters.${article.jurisdiction}`)}
                </Badge>
                <span>{article.source}</span>
                <span className="ml-auto shrink-0">
                  {formatDate(article.pubDate, lang)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-medium text-sm leading-snug mb-1 group-hover:text-brand-forest transition-colors line-clamp-2">
                {article.title}
              </h3>

              {/* Snippet */}
              {article.snippet && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                  {stripHtml(article.snippet)}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSheet(article);
                    // Will trigger summarize in sheet
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {t("articles.summarize")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(article);
                  }}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-3 w-3 text-brand-forest" />
                  ) : (
                    <Bookmark className="h-3 w-3" />
                  )}
                  {isSaved ? t("articles.saved") : t("articles.save")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7 ml-auto"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t("articles.readArticle")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /* ------ Saved article card (favorites + org) ------ */
  const renderSavedCard = (saved: SavedArticle, showOrgInfo = false) => {
    const assignedMember = orgMembers.find(
      (m) => m.user_id === saved.assigned_to,
    );
    const sharedByMember = orgMembers.find(
      (m) => m.user_id === saved.saved_by,
    );

    return (
      <Card
        key={saved.id}
        className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onClick={() => openSheetFromSaved(saved)}
      >
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Star className="h-4 w-4 mt-0.5 shrink-0 fill-amber-400 text-amber-400" />
            <div className="flex-1 min-w-0">
              {/* Meta row */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {saved.jurisdiction && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-normal px-1.5 py-0 border-0 ${jurisdictionColor(saved.jurisdiction)}`}
                  >
                    {t(`filters.${saved.jurisdiction}`)}
                  </Badge>
                )}
                {saved.source && <span>{saved.source}</span>}
                <span className="ml-auto shrink-0">
                  {saved.pub_date ? formatDate(saved.pub_date, lang) : ""}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-medium text-sm leading-snug mb-1 group-hover:text-brand-forest transition-colors line-clamp-2">
                {saved.title}
              </h3>

              {/* Snippet */}
              {saved.snippet && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                  {stripHtml(saved.snippet)}
                </p>
              )}

              {/* Org info line */}
              {showOrgInfo && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {sharedByMember && (
                    <span>
                      {t("sheet.sharedBy")}{" "}
                      {sharedByMember.full_name || sharedByMember.email}
                    </span>
                  )}
                  {assignedMember && (
                    <>
                      <span>•</span>
                      <span>
                        {t("sheet.assignTo")}:{" "}
                        {assignedMember.full_name || assignedMember.email}
                      </span>
                    </>
                  )}
                  <span className="ml-auto">
                    <StatusBadge
                      status={saved.status}
                      label={t(`statuses.${saved.status}`)}
                    />
                  </span>
                </div>
              )}

              {/* Indicators */}
              {!showOrgInfo && saved.shared_to_org && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {t("articles.sharedToOrg")}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        helpNs="veille"
        badge="IA"
      />

      {/* Tabs */}
      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">
            {t("tabs.feed")} ({articles.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            {t("tabs.favorites")} ({myFavorites.length})
          </TabsTrigger>
          <TabsTrigger value="organization">
            {t("tabs.organization")} ({orgShared.length})
          </TabsTrigger>
        </TabsList>

        {/* ---- Filters (shared across tabs) ---- */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("filters.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
          {renderJurisdictionPills()}
        </div>

        {/* ============ FLUX TAB ============ */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {/* Weekly summary (collapsible) */}
          <Card className="border-brand-forest/20 bg-brand-forest/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-forest/10">
                    <Sparkles className="h-4 w-4 text-brand-forest" />
                  </div>
                  {t("weeklySummary.title")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {weeklySummary && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateWeeklySummary(articles)}
                        disabled={loadingWeekly || articles.length === 0}
                        className="gap-1.5"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${loadingWeekly ? "animate-spin" : ""}`}
                        />
                        {t("weeklySummary.regenerate")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setWeeklyCollapsed(!weeklyCollapsed)}
                      >
                        {weeklyCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {!weeklyCollapsed && (
                <p className="text-sm text-muted-foreground">
                  {t("weeklySummary.subtitle")}
                </p>
              )}
            </CardHeader>
            {!weeklyCollapsed && (
              <CardContent>
                {loadingWeekly && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("weeklySummary.loading")}
                  </div>
                )}
                {weeklyError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {weeklyError}
                  </div>
                )}
                {!loadingWeekly && !weeklyError && weeklySummary && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {weeklySummary.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-foreground/85"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                {!loadingWeekly &&
                  !weeklyError &&
                  !weeklySummary &&
                  articles.length > 0 && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <p className="text-sm text-muted-foreground text-center">
                        {t("weeklySummary.prompt")}
                      </p>
                      <Button
                        onClick={() => generateWeeklySummary(articles)}
                        className="gap-2 bg-brand-forest hover:bg-brand-forest/90"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t("weeklySummary.generate")}
                      </Button>
                    </div>
                  )}
                {!loadingWeekly &&
                  !weeklyError &&
                  !weeklySummary &&
                  articles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("weeklySummary.empty")}
                    </p>
                  )}
              </CardContent>
            )}
          </Card>

          {/* Articles list */}
          {loadingArticles && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {articlesError && (
            <Card>
              <CardContent className="py-6 flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive/60" />
                <p className="text-sm text-destructive">{articlesError}</p>
                <Button variant="outline" size="sm" onClick={loadArticles}>
                  {t("weeklySummary.regenerate")}
                </Button>
              </CardContent>
            </Card>
          )}

          {!loadingArticles &&
            !articlesError &&
            filteredArticles.length === 0 && (
              <EmptyState
                icon={Newspaper}
                title={
                  articles.length > 0
                    ? t("filters.noResults")
                    : t("articles.empty")
                }
              />
            )}

          {!loadingArticles && !articlesError && filteredArticles.length > 0 && (
            <div className="space-y-3">
              {filteredArticles.map(renderFeedCard)}
            </div>
          )}
        </TabsContent>

        {/* ============ FAVORITES TAB ============ */}
        <TabsContent value="favorites" className="space-y-4 mt-4">
          {myFavorites.length === 0 ? (
            <EmptyState
              icon={Star}
              title={t("empty.favoritesTitle")}
              description={t("empty.favoritesDescription")}
            />
          ) : filteredFavorites.length === 0 ? (
            <EmptyState icon={Star} title={t("filters.noResults")} />
          ) : (
            <div className="space-y-3">
              {filteredFavorites.map((s) => renderSavedCard(s))}
            </div>
          )}
        </TabsContent>

        {/* ============ ORGANIZATION TAB ============ */}
        <TabsContent value="organization" className="space-y-4 mt-4">
          {/* Status filter (org tab only) */}
          <div className="flex flex-wrap gap-2">
            {["all", "unread", "read", "archived"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-brand-forest text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {s === "all"
                  ? t("filters.allStatuses")
                  : t(`statuses.${s}`)}
              </button>
            ))}
          </div>

          {orgShared.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("empty.orgTitle")}
              description={t("empty.orgDescription")}
            />
          ) : filteredOrg.length === 0 ? (
            <EmptyState icon={Users} title={t("filters.noResults")} />
          ) : (
            <div className="space-y-3">
              {filteredOrg.map((s) => renderSavedCard(s, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ============ ARTICLE DETAIL SHEET ============ */}
      <Sheet
        open={!!sheetArticle}
        onOpenChange={() => setSheetArticle(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {sheetArticle && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-normal px-1.5 py-0 border-0 ${jurisdictionColor(sheetArticle.article.jurisdiction)}`}
                  >
                    {t(
                      `filters.${sheetArticle.article.jurisdiction}`,
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {sheetArticle.article.source}
                  </span>
                </div>
                <SheetTitle className="text-base leading-snug">
                  {sheetArticle.article.title}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {sheetArticle.article.pubDate
                    ? formatDate(sheetArticle.article.pubDate, lang)
                    : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 mt-4">
                {/* Original snippet */}
                {sheetArticle.article.snippet && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t("sheet.originalSnippet")}
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {stripHtml(sheetArticle.article.snippet)}
                    </p>
                  </div>
                )}

                {/* Read original */}
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href={sheetArticle.article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("sheet.readOriginal")}
                  </a>
                </Button>

                <Separator />

                {/* AI Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-forest" />
                    {t("sheet.aiSummary")}
                  </h4>
                  {sheetArticle.saved?.ai_summary ? (
                    <div className="space-y-2">
                      {sheetArticle.saved.ai_summary
                        .split("\n")
                        .map((line, i) => (
                          <p
                            key={i}
                            className="text-sm text-foreground/80 leading-relaxed"
                          >
                            {line}
                          </p>
                        ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={handleSheetSummarize}
                        disabled={sheetSummaryLoading}
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${sheetSummaryLoading ? "animate-spin" : ""}`}
                        />
                        {t("articles.regenerateSummary")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleSheetSummarize}
                      disabled={sheetSummaryLoading}
                    >
                      {sheetSummaryLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {sheetSummaryLoading
                        ? t("articles.summarizing")
                        : t("articles.generateSummary")}
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Notes + Actions (only if saved) */}
                {sheetArticle.saved ? (
                  <>
                    {/* Notes */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("sheet.notes")}
                      </h4>
                      <Textarea
                        value={sheetNotes}
                        onChange={(e) =>
                          handleNotesChange(e.target.value)
                        }
                        placeholder={t("sheet.notesPlaceholder")}
                        rows={3}
                      />
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("sheet.actions")}
                      </h4>

                      {/* Share to org toggle */}
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="share-org"
                          className="text-sm"
                        >
                          {t("sheet.shareOrg")}
                        </Label>
                        <Switch
                          id="share-org"
                          checked={
                            sheetArticle.saved.shared_to_org
                          }
                          onCheckedChange={handleToggleShare}
                        />
                      </div>

                      {/* Status + Assign (only if shared) */}
                      {sheetArticle.saved.shared_to_org && (
                        <>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">
                              {t("sheet.status")}
                            </Label>
                            <Select
                              value={
                                sheetArticle.saved.status
                              }
                              onValueChange={
                                handleStatusChange
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unread">
                                  {t("statuses.unread")}
                                </SelectItem>
                                <SelectItem value="read">
                                  {t("statuses.read")}
                                </SelectItem>
                                <SelectItem value="archived">
                                  {t("statuses.archived")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-sm">
                              {t("sheet.assignTo")}
                            </Label>
                            <Select
                              value={
                                sheetArticle.saved
                                  .assigned_to ?? "__none__"
                              }
                              onValueChange={handleAssign}
                            >
                              <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {t("sheet.assignNone")}
                                </SelectItem>
                                {orgMembers.map((m) => (
                                  <SelectItem
                                    key={m.user_id}
                                    value={m.user_id}
                                  >
                                    {m.full_name ||
                                      m.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("sheet.saveFirst")}
                    </p>
                    <Button
                      className="gap-2 bg-brand-forest hover:bg-brand-forest/90"
                      onClick={() =>
                        handleSave(sheetArticle.article)
                      }
                    >
                      <Bookmark className="h-4 w-4" />
                      {t("articles.save")}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors. If `PageHeader` does not accept `badge` prop, add it or fall back to the old header pattern.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build completes without errors.

**Step 4: Commit**

```bash
git add src/portail/pages/VeillePage.tsx
git commit -m "feat: refonte VeillePage — onglets, cards enrichies, Sheet détail, sauvegarde articles"
```

---

## Task 5: PageHeader badge prop (if needed)

**Files:**
- Modify: `src/components/shared/PageHeader.tsx`

Check if `PageHeader` already accepts a `badge` prop. If not, add it:

**Step 1: Check the component**

Read `src/components/shared/PageHeader.tsx` and look for `badge` in the interface.

**Step 2: If missing, add badge prop**

Add to the interface:
```typescript
badge?: string;
```

Add to the render, after the title:
```tsx
{badge && (
  <Badge className="bg-brand-forest/15 text-brand-forest border-brand-forest/30 text-[10px] font-bold tracking-wider">
    {badge}
  </Badge>
)}
```

**Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit (if changed)**

```bash
git add src/components/shared/PageHeader.tsx
git commit -m "feat: PageHeader — ajout prop badge optionnelle"
```

---

## Task 6: Apply migration to production Supabase

**Step 1: Apply the migration**

Run: `npx supabase db push --project-ref tpaqkfuwiihesjmguqne`

Or apply manually via the Supabase dashboard SQL editor using the content of `supabase/migrations/20260306100000_create_saved_articles.sql`.

**Step 2: Verify table exists**

Run in Supabase SQL editor:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'saved_articles';
```
Expected: One row returned.

---

## Task 7: Final verification & push

**Step 1: Full build check**

Run: `npm run build`
Expected: Build completes without errors.

**Step 2: Push all commits**

```bash
git push
```

**Step 3: Verify deployment**

After Netlify auto-deploys, check https://gouvernance.ai/veille and verify:
- Three tabs appear (Flux / Favoris / Organisation)
- Articles load with star and save buttons
- Clicking an article opens the Sheet
- AI summary can be generated and is persisted
- Saving and sharing works
