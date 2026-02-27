# Blog/Actualites Strapi Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded articles on `/actualites` with dynamic content fetched from Strapi CMS, and add individual article pages at `/actualites/:slug`.

**Architecture:** Frontend fetches articles directly from Strapi REST API (`https://srv799120.hstgr.cloud/api/articles`) via React Query. No backend proxy. 100% public access.

**Tech Stack:** React 19, React Router v7, React Query, react-markdown, Strapi v5 REST API, Tailwind CSS 4

---

### Task 1: Install react-markdown dependency

**Step 1: Install**

Run: `npm install react-markdown`

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-markdown for Strapi article rendering"
```

---

### Task 2: Add VITE_STRAPI_URL env var

**Files:**
- Modify: `/.env` (add line)
- Modify: `/.env.example` (add line)

**Step 1: Add env var to .env**

Append to `.env`:
```
VITE_STRAPI_URL=https://srv799120.hstgr.cloud
```

**Step 2: Add to .env.example**

Append to `.env.example`:
```
VITE_STRAPI_URL=https://your-strapi-url-here
```

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add VITE_STRAPI_URL env var"
```

Note: `.env` is gitignored — only `.env.example` is committed.

---

### Task 3: Create Strapi client (`src/lib/strapi.ts`)

**Files:**
- Create: `src/lib/strapi.ts`

**Step 1: Write the Strapi client**

```typescript
/* ------------------------------------------------------------------ */
/*  Strapi CMS client                                                  */
/* ------------------------------------------------------------------ */

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL as string;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ArticleCategory =
  | 'communique'
  | 'analyse'
  | 'veille'
  | 'opinion'
  | 'nomination'
  | 'evenement';

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  publishedAt: string;
  cover: StrapiMedia | null;
}

export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
}

interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: StrapiPagination };
}

interface StrapiSingleResponse<T> {
  data: T;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Resolve a Strapi media URL (may be relative or absolute). */
export function strapiMediaUrl(media: StrapiMedia | null | undefined): string | null {
  if (!media?.url) return null;
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function fetchArticles(
  page = 1,
  pageSize = 9,
  category?: ArticleCategory,
): Promise<{ articles: StrapiArticle[]; pagination: StrapiPagination }> {
  const params = new URLSearchParams();
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));
  params.set('sort', 'publishedAt:desc');
  params.set('populate', 'cover');

  if (category) {
    params.set('filters[category][$eq]', category);
  }

  // Only return published articles
  params.set('publicationState', 'live');

  const res = await fetch(`${STRAPI_URL}/api/articles?${params}`);
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);

  const json: StrapiListResponse<StrapiArticle> = await res.json();
  return { articles: json.data, pagination: json.meta.pagination };
}

export async function fetchArticleBySlug(
  slug: string,
): Promise<StrapiArticle | null> {
  const params = new URLSearchParams();
  params.set('filters[slug][$eq]', slug);
  params.set('populate', 'cover');
  params.set('publicationState', 'live');

  const res = await fetch(`${STRAPI_URL}/api/articles?${params}`);
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);

  const json: StrapiListResponse<StrapiArticle> = await res.json();
  return json.data[0] ?? null;
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/strapi.ts
git commit -m "feat(strapi): add Strapi CMS client with article fetching"
```

---

### Task 4: Create React Query hooks (`src/hooks/useArticles.ts`)

**Files:**
- Create: `src/hooks/useArticles.ts`

**Step 1: Write the hooks**

```typescript
import { useQuery } from '@tanstack/react-query';
import {
  fetchArticles,
  fetchArticleBySlug,
  type ArticleCategory,
} from '@/lib/strapi';

export function useArticles(page = 1, category?: ArticleCategory) {
  return useQuery({
    queryKey: ['articles', page, category],
    queryFn: () => fetchArticles(page, 9, category),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug),
    enabled: !!slug,
  });
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/hooks/useArticles.ts
git commit -m "feat(strapi): add useArticles and useArticle React Query hooks"
```

---

### Task 5: Rewrite ActualitesPage to fetch from Strapi

**Files:**
- Modify: `src/pages/ActualitesPage.tsx` (full rewrite)

**Step 1: Rewrite the page**

Replace the entire file content with:

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { useArticles } from '@/hooks/useArticles';
import { strapiMediaUrl, type ArticleCategory } from '@/lib/strapi';

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'communique', label: 'Communiqué' },
  { value: 'analyse', label: 'Analyse' },
  { value: 'veille', label: 'Veille' },
  { value: 'opinion', label: 'Opinion' },
  { value: 'nomination', label: 'Nomination' },
  { value: 'evenement', label: 'Événement' },
];

const badgeColors: Record<string, string> = {
  communique: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  analyse: 'bg-primary/15 text-primary border-primary/30',
  veille: 'border-muted-foreground text-muted-foreground',
  opinion: 'bg-primary/15 text-primary border-primary/30',
  nomination: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  evenement: 'bg-primary/15 text-primary border-primary/30',
};

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ActualitesPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<ArticleCategory | undefined>();
  const { data, isLoading, isError } = useArticles(page, category);

  const articles = data?.articles ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <SEO
        title="Actualités"
        description="Suivez les dernières actualités en gouvernance de l'intelligence artificielle : réglementation, technologies, événements et publications."
      />
      <div className="overflow-x-hidden">
        {/* HERO */}
        <section
          className="overflow-hidden pt-32 pb-20 relative"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: `
              radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%),
              radial-gradient(at 100% 0%, hsla(280,100%,95%,1) 0, transparent 50%),
              radial-gradient(at 100% 100%, hsla(250,100%,92%,1) 0, transparent 50%),
              radial-gradient(at 0% 100%, hsla(220,100%,96%,1) 0, transparent 50%)
            `,
          }}
        >
          <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight mb-6">
              Actualités
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
              Nouvelles du Cercle, veille stratégique et prises de position sur la gouvernance de
              l&apos;IA.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="pt-12 pb-4 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory(undefined);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                !category
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
              )}
            >
              Tous
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                  category === cat.value
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* NEWS GRID */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-neutral-400" />
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-neutral-500">
                Impossible de charger les articles. Veuillez réessayer plus tard.
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                Aucun article pour le moment.
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => {
                    const coverUrl = strapiMediaUrl(article.cover);
                    return (
                      <Card
                        key={article.documentId}
                        className="group rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden"
                      >
                        {coverUrl && (
                          <Link to={`/actualites/${article.slug}`}>
                            <img
                              src={coverUrl}
                              alt={article.cover?.alternativeText ?? article.title}
                              className="w-full h-48 object-cover"
                            />
                          </Link>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={article.category === 'veille' ? 'outline' : 'secondary'}
                              className={cn(
                                'text-xs rounded-full',
                                badgeColors[article.category],
                              )}
                            >
                              {categoryLabel(article.category)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleDateString('fr-CA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <h2 className="text-lg font-semibold leading-tight">
                            <Link
                              to={`/actualites/${article.slug}`}
                              className="text-foreground hover:text-primary transition-colors line-clamp-2"
                            >
                              {article.title}
                            </Link>
                          </h2>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {article.excerpt}
                          </p>
                          <Link
                            to={`/actualites/${article.slug}`}
                            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 group/link"
                          >
                            Lire la suite
                            <ArrowRight className="size-4 group-hover/link:translate-x-0.5 transition-transform" />
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.pageCount > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Précédent
                    </Button>
                    <span className="flex items-center px-3 text-sm text-neutral-500">
                      {page} / {pagination.pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page >= pagination.pageCount}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* NEWSLETTER CTA */}
        <section className="py-24 sm:py-32 bg-neutral-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Newspaper className="size-10 text-purple-400 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Restez informé
            </h2>
            <p className="text-neutral-400 text-lg mb-8">
              Abonnez-vous à notre infolettre pour ne rien manquer.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
            >
              Nous contacter
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/ActualitesPage.tsx
git commit -m "feat(actualites): fetch articles from Strapi with category filter and pagination"
```

---

### Task 6: Create ArticlePage (`src/pages/ArticlePage.tsx`) and add route

**Files:**
- Create: `src/pages/ArticlePage.tsx`
- Modify: `src/App.tsx` (add route + import)

**Step 1: Create ArticlePage**

```tsx
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { useArticle } from '@/hooks/useArticles';
import { strapiMediaUrl } from '@/lib/strapi';

/* ------------------------------------------------------------------ */
/*  Category config (shared with ActualitesPage)                       */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  communique: 'Communiqué',
  analyse: 'Analyse',
  veille: 'Veille',
  opinion: 'Opinion',
  nomination: 'Nomination',
  evenement: 'Événement',
};

const badgeColors: Record<string, string> = {
  communique: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  analyse: 'bg-primary/15 text-primary border-primary/30',
  veille: 'border-muted-foreground text-muted-foreground',
  opinion: 'bg-primary/15 text-primary border-primary/30',
  nomination: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  evenement: 'bg-primary/15 text-primary border-primary/30',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useArticle(slug ?? '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="text-center py-32">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Article introuvable</h1>
        <p className="text-neutral-500 mb-6">Cet article n'existe pas ou a été retiré.</p>
        <Link
          to="/actualites"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Retour aux actualités
        </Link>
      </div>
    );
  }

  const coverUrl = strapiMediaUrl(article.cover);

  return (
    <>
      <SEO title={article.title} description={article.excerpt} />
      <div className="overflow-x-hidden">
        {/* Hero with cover */}
        <section
          className="overflow-hidden pt-32 pb-16 relative"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: `
              radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%),
              radial-gradient(at 100% 0%, hsla(280,100%,95%,1) 0, transparent 50%),
              radial-gradient(at 100% 100%, hsla(250,100%,92%,1) 0, transparent 50%),
              radial-gradient(at 0% 100%, hsla(220,100%,96%,1) 0, transparent 50%)
            `,
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              to="/actualites"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
            >
              <ArrowLeft className="size-4" />
              Actualités
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant={article.category === 'veille' ? 'outline' : 'secondary'}
                className={cn('text-xs rounded-full', badgeColors[article.category])}
              >
                {CATEGORY_LABELS[article.category] ?? article.category}
              </Badge>
              <time className="text-sm text-neutral-500">
                {new Date(article.publishedAt).toLocaleDateString('fr-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              {article.title}
            </h1>
          </div>
        </section>

        {/* Cover image */}
        {coverUrl && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
            <img
              src={coverUrl}
              alt={article.cover?.alternativeText ?? article.title}
              className="w-full rounded-2xl shadow-lg object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
            <Markdown>{article.content}</Markdown>
          </div>
        </article>
      </div>
    </>
  );
}
```

**Step 2: Add route to App.tsx**

In `src/App.tsx`, add the import at the top (after the ActualitesPage import):

```typescript
import { ArticlePage } from "@/pages/ArticlePage";
```

And add the route right after the `/actualites` route (line 122):

```tsx
<Route path="/actualites/:slug" element={<ArticlePage />} />
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/ArticlePage.tsx src/App.tsx
git commit -m "feat(actualites): add individual article page with Markdown rendering"
```

---

### Task 7: Add Tailwind typography plugin for prose styles

The `ArticlePage` uses `prose` classes from `@tailwindcss/typography`.

**Step 1: Install**

Run: `npm install @tailwindcss/typography`

**Step 2: Add plugin to CSS**

In the main CSS file that imports Tailwind (look for `@import "tailwindcss"` or similar), add:

```css
@plugin "@tailwindcss/typography";
```

Note: Tailwind CSS 4 uses `@plugin` syntax instead of the `plugins` array in a config file.

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add package.json package-lock.json src/index.css
git commit -m "chore: add @tailwindcss/typography for article prose styling"
```

---

### Task 8: Configure Strapi — Content Type & Permissions (Manual)

This task is done in the Strapi admin panel at `https://srv799120.hstgr.cloud/admin`.

**Step 1: Create Article content type**

Go to Content-Type Builder → Create new Collection Type → `Article`

Add fields:
- `title` — Text (Short text), Required
- `slug` — UID (attached to `title`), Required
- `excerpt` — Text (Long text), Required
- `content` — Rich Text (Markdown), Required
- `cover` — Media (Single media), Not required
- `category` — Enumeration, Required, values: `communique`, `analyse`, `veille`, `opinion`, `nomination`, `evenement`

Click Save.

**Step 2: Set public API permissions**

Go to Settings → Users & Permissions → Roles → Public

Under `Article`, check:
- `find` (list articles)
- `findOne` (get single article)

Click Save.

**Step 3: Configure CORS (if needed)**

If CORS blocks requests, go to `config/middlewares.ts` (or `.js`) on the Strapi server and update the `strapi::cors` middleware to allow origins: `https://gouvernance.ai`, `http://localhost:5173`.

**Step 4: Create a test article**

Go to Content Manager → Article → Create new entry. Fill in all fields, then click Publish.

**Step 5: Verify API**

Open in browser: `https://srv799120.hstgr.cloud/api/articles?populate=cover`
Expected: JSON response with the test article data.

---

### Task 9: Final verification

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors

**Step 2: Start dev server**

Run: `npm run dev`

**Step 3: Test /actualites page**

Navigate to `http://localhost:5173/actualites`:
- Category filter buttons render
- Articles from Strapi appear in the grid
- Cover images display correctly
- Dates are formatted in French
- Pagination works if > 9 articles

**Step 4: Test article detail page**

Click on an article → navigates to `/actualites/<slug>`:
- Back link works
- Title, category badge, date render
- Cover image displays
- Markdown content renders with prose styling
- 404 state works for invalid slugs

**Step 5: Push**

```bash
git push origin main
```
