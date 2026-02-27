# Blog/Actualites with Strapi CMS — Design Document

**Date:** 2026-02-26
**Status:** Approved

## Context

The `/actualites` page currently shows 6 hardcoded placeholder articles. The user has installed Strapi CMS (headless) on Hostinger (`https://srv799120.hstgr.cloud`) and wants to power the blog dynamically.

## Decisions

- **Architecture:** Direct fetch from frontend to Strapi REST API (no proxy)
- **Access:** 100% public (no auth required to read articles)
- **Categories:** Fixed enumeration — Communiqué, Analyse, Veille, Opinion, Nomination, Événement
- **Content:** Rich text (Markdown) — title, excerpt, cover image, body
- **Approach:** Strapi provides the API; React frontend fetches via React Query

## Strapi Content Type: `Article`

| Field         | Type                | Required | Notes                              |
|---------------|---------------------|----------|------------------------------------|
| `title`       | Text (short)        | Yes      | Article title                      |
| `slug`        | UID (from title)    | Yes      | Auto-generated URL-friendly slug   |
| `excerpt`     | Text (long)         | Yes      | 2-3 line summary for card display  |
| `content`     | Rich Text (Markdown)| Yes      | Full article body                  |
| `cover`       | Media (single)      | No       | Cover image                        |
| `category`    | Enumeration         | Yes      | communique, analyse, veille, opinion, nomination, evenement |
| `publishedAt` | DateTime            | Auto     | Managed by Strapi                  |

## Frontend Changes

### New Files

1. **`src/lib/strapi.ts`** — Strapi client
   - Reads `VITE_STRAPI_URL` env var
   - `fetchArticles(page, pageSize, category?)` → paginated article list
   - `fetchArticleBySlug(slug)` → single article
   - TypeScript types for Strapi API responses

2. **`src/hooks/useArticles.ts`** — React Query hooks
   - `useArticles(page, category?)` — paginated list with filter
   - `useArticle(slug)` — single article by slug

3. **`src/pages/ArticlePage.tsx`** — Individual article page
   - Route: `/actualites/:slug`
   - Cover image + title + date + category badge + rendered Markdown body
   - Back button to `/actualites`

### Modified Files

4. **`src/pages/ActualitesPage.tsx`** — Replace hardcoded data
   - Fetch from Strapi via `useArticles()`
   - Category filter (clickable badges)
   - Pagination
   - Loading skeletons + empty state
   - Keep existing visual style (hero + card grid)

5. **`src/App.tsx`** — Add route
   - `/actualites/:slug` → `ArticlePage`

### Environment

```
VITE_STRAPI_URL=https://srv799120.hstgr.cloud
```

## Strapi Configuration (Manual)

1. Create `Article` content type with fields above
2. Set public API permissions: `find` and `findOne` on Article
3. Configure CORS: allow `gouvernance.ai` and `localhost:5173`

## Dependencies

- `react-markdown` — Render Markdown content from Strapi rich text fields

## What Stays Unchanged

- Hero section visual style
- Newsletter CTA section at bottom
- Layout wrapper (Header/Footer)
- SEO component pattern
