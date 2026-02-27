# SEO Improvements Design

**Date:** 2026-02-27
**Status:** Approved

## Context

The site is a React SPA (Vite + React Router) deployed on Netlify. It already has a solid SEO foundation (8.5/10): meta tags in index.html, a custom `<SEO>` component for per-page meta, robots.txt, static sitemap, structured data (Organization, WebSite), and optimized Netlify headers.

## Scope

Improve SEO without pre-rendering. Focus on meta tags, structured data, sitemap, and PWA manifest.

## 1. Dynamic Sitemap Generation

**Problem:** Static `public/sitemap.xml` only has 13 routes. Article pages (`/actualites/:slug`) are missing.

**Solution:** Build-time script `scripts/generate-sitemap.mjs` that:
- Includes all static public routes (hardcoded list)
- Scans `content/articles/*.md` to extract slugs and dates
- Generates `dist/sitemap.xml` after build
- Runs via `postbuild` npm script

Article entries use `changefreq: monthly`, `priority: 0.6`, `<lastmod>` from article date.

## 2. Article Structured Data (JSON-LD)

**Problem:** ArticlePage has `<SEO>` but no `<JsonLd>` schema.

**Solution:** Add two schemas to ArticlePage:

### NewsArticle schema
```json
{
  "@type": "NewsArticle",
  "headline": "...",
  "datePublished": "...",
  "author": { "@type": "Person", "name": "...", "jobTitle": "..." },
  "publisher": { "@type": "Organization", "name": "Cercle de Gouvernance de l'IA", "logo": "..." },
  "image": "...",
  "description": "...",
  "mainEntityOfPage": "canonical URL"
}
```

### BreadcrumbList schema
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Accueil", "item": "https://gouvernance.ai/" },
    { "position": 2, "name": "Actualités", "item": "https://gouvernance.ai/actualites" },
    { "position": 3, "name": "Article title" }
  ]
}
```

## 3. Page-Specific Structured Data

Add JSON-LD schemas to key public pages:

- **TarifsPage:** `Product` with `Offer` for each pricing plan
- **EvenementsPage:** `Event` schema for events
- **ExpertsPage:** `ItemList` schema for experts listing

## 4. PWA Manifest

Create `public/manifest.json`:
- `name`: "Cercle de Gouvernance de l'IA"
- `short_name`: "Gouvernance IA"
- `theme_color`: "#6c3baa"
- `background_color`: "#ffffff"
- `display`: "standalone"
- `start_url`: "/"
- Icons in multiple sizes (192x192, 512x512)

Add `<link rel="manifest">` in index.html.

## 5. SEO Component Enhancements

Enhance `src/components/SEO.tsx`:
- Add `article:published_time` and `article:author` OG tags (for article pages)
- Add `og:image:width` and `og:image:height` props
- Keep `og:locale` always set to `fr_CA`

## Files Changed

| File | Action |
|------|--------|
| `scripts/generate-sitemap.mjs` | NEW - build-time sitemap generator |
| `package.json` | EDIT - add postbuild script |
| `public/sitemap.xml` | REMOVE - replaced by generated sitemap |
| `src/pages/ArticlePage.tsx` | EDIT - add NewsArticle + BreadcrumbList JsonLd |
| `src/pages/TarifsPage.tsx` | EDIT - add Product/Offer JsonLd |
| `src/pages/EvenementsPage.tsx` | EDIT - add Event JsonLd |
| `src/pages/ExpertsPage.tsx` | EDIT - add ItemList JsonLd |
| `src/components/SEO.tsx` | EDIT - add article OG props |
| `public/manifest.json` | NEW - PWA manifest |
| `index.html` | EDIT - add manifest link |
