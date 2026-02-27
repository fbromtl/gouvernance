# SEO Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve SEO across the site with dynamic sitemap, structured data (JSON-LD), PWA manifest, and enhanced meta tags.

**Architecture:** Build-time sitemap generation via Node script; per-page JSON-LD schemas added to existing page components; lightweight SEO component enhancements for article OG tags; PWA manifest for mobile branding.

**Tech Stack:** Node.js (fs, path) for sitemap script, existing custom `<SEO>` + `<JsonLd>` components, no new dependencies.

---

### Task 1: Dynamic Sitemap Generator

**Files:**
- Create: `scripts/generate-sitemap.mjs`
- Modify: `package.json:6-10` (scripts section)
- Remove: `public/sitemap.xml` (replaced by generated one)

**Step 1: Create the sitemap generator script**

Create `scripts/generate-sitemap.mjs`:

```js
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE = "https://gouvernance.ai";

// Static public routes
const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/a-propos", changefreq: "monthly", priority: "0.8" },
  { path: "/experts", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/ressources", changefreq: "weekly", priority: "0.9" },
  { path: "/evenements", changefreq: "weekly", priority: "0.7" },
  { path: "/rejoindre", changefreq: "monthly", priority: "0.8" },
  { path: "/organisations", changefreq: "monthly", priority: "0.6" },
  { path: "/actualites", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/tarifs", changefreq: "monthly", priority: "0.8" },
  { path: "/confidentialite", changefreq: "yearly", priority: "0.3" },
  { path: "/mentions-legales", changefreq: "yearly", priority: "0.3" },
  { path: "/accessibilite", changefreq: "yearly", priority: "0.3" },
];

// Read article slugs and dates from markdown frontmatter
function getArticleRoutes() {
  const dir = resolve(ROOT, "content/articles");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const raw = readFileSync(resolve(dir, file), "utf-8");
    const slugMatch = raw.match(/^slug:\s*(.+)$/m);
    const dateMatch = raw.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?$/m);
    const slug = slugMatch?.[1]?.trim();
    const date = dateMatch?.[1]?.trim();
    return slug ? { path: `/actualites/${slug}`, changefreq: "monthly", priority: "0.6", lastmod: date } : null;
  }).filter(Boolean);
}

// Build XML
function buildSitemap(routes) {
  const urls = routes.map((r) => {
    let entry = `  <url>\n    <loc>${SITE}${r.path}</loc>\n`;
    if (r.lastmod) entry += `    <lastmod>${r.lastmod}</lastmod>\n`;
    entry += `    <changefreq>${r.changefreq}</changefreq>\n`;
    entry += `    <priority>${r.priority}</priority>\n`;
    entry += `  </url>`;
    return entry;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const allRoutes = [...staticRoutes, ...getArticleRoutes()];
const xml = buildSitemap(allRoutes);
writeFileSync(resolve(ROOT, "dist/sitemap.xml"), xml);
console.log(`✅ Sitemap generated with ${allRoutes.length} URLs`);
```

**Step 2: Update package.json scripts**

In `package.json`, change the scripts section:
- Change `"build"` to: `"tsc -b && vite build && node scripts/generate-sitemap.mjs"`
- The `public/sitemap.xml` will still be copied by Vite to `dist/` during build, but the postbuild script will overwrite it with the dynamic version.

**Step 3: Delete `public/sitemap.xml`**

Remove the static sitemap file since it will be generated at build time. Keep `public/robots.txt` as-is (it already points to the correct URL).

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds, last line shows "Sitemap generated with ~20 URLs"

**Step 5: Commit**

```
git add scripts/generate-sitemap.mjs package.json
git rm public/sitemap.xml
git commit -m "feat(seo): add dynamic sitemap generation at build time"
```

---

### Task 2: Article Page Structured Data

**Files:**
- Modify: `src/pages/ArticlePage.tsx:19,109`

**Step 1: Add JsonLd import**

At line 19, change:
```tsx
import { SEO } from "@/components/SEO";
```
to:
```tsx
import { SEO, JsonLd } from "@/components/SEO";
```

**Step 2: Add NewsArticle and BreadcrumbList schemas**

After the `<SEO>` tag at line 109, add two `<JsonLd>` components:

```tsx
<SEO title={article.title} description={article.excerpt} />
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.title,
  "description": article.excerpt,
  "datePublished": article.date,
  "dateModified": article.date,
  "author": author ? {
    "@type": "Person",
    "name": author.name,
    "jobTitle": author.title,
  } : undefined,
  "publisher": {
    "@type": "Organization",
    "name": "Cercle de Gouvernance de l'IA",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gouvernance.ai/logo.svg",
    },
  },
  "image": article.cover?.startsWith("http") ? article.cover : `https://gouvernance.ai${article.cover}`,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://gouvernance.ai/actualites/${article.slug}`,
  },
}} />
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://gouvernance.ai/" },
    { "@type": "ListItem", "position": 2, "name": "Actualités", "item": "https://gouvernance.ai/actualites" },
    { "@type": "ListItem", "position": 3, "name": article.title },
  ],
}} />
```

**Step 3: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: No type errors, build succeeds.

**Step 4: Commit**

```
git add src/pages/ArticlePage.tsx
git commit -m "feat(seo): add NewsArticle and BreadcrumbList JSON-LD to article pages"
```

---

### Task 3: Evenements Page Structured Data

**Files:**
- Modify: `src/pages/EvenementsPage.tsx:6,57`

**Step 1: Add JsonLd import**

At line 6, change:
```tsx
import { SEO } from "@/components/SEO";
```
to:
```tsx
import { SEO, JsonLd } from "@/components/SEO";
```

**Step 2: Add Event schemas**

After the `<SEO>` tag at line 57, add a `<JsonLd>` for each upcoming event. The `upcomingEvents` array is defined at line 8. Add:

```tsx
{upcomingEvents.map((evt, i) => (
  <JsonLd key={i} data={{
    "@context": "https://schema.org",
    "@type": "Event",
    "name": evt.title,
    "description": evt.description,
    "startDate": evt.date,
    "location": evt.location === "En ligne"
      ? { "@type": "VirtualLocation", "url": "https://gouvernance.ai/evenements" }
      : { "@type": "Place", "name": evt.location, "address": evt.location },
    "organizer": {
      "@type": "Organization",
      "name": "Cercle de Gouvernance de l'IA",
      "url": "https://gouvernance.ai",
    },
    "eventAttendanceMode": evt.location === "En ligne"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
  }} />
))}
```

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

**Step 4: Commit**

```
git add src/pages/EvenementsPage.tsx
git commit -m "feat(seo): add Event JSON-LD schemas to evenements page"
```

---

### Task 4: Tarifs Page Structured Data

**Files:**
- Modify: `src/pages/TarifsPage.tsx` (import line ~9, after `<SEO>` usage)

**Step 1: Add JsonLd import**

Change the SEO import to include JsonLd:
```tsx
import { SEO, JsonLd } from "@/components/SEO";
```

**Step 2: Add Product/Offer schema**

After the `<SEO>` component, add a schema listing the pricing plans. The plan names/prices come from the `PLANS` config + the page's card configs. Add a schema with the 3 plans (Observateur/free, Membre/monthly, Partenaire/annual):

```tsx
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Membership — Cercle de Gouvernance de l'IA",
  "description": "Accédez aux ressources, événements et au réseau d'experts en gouvernance de l'IA.",
  "brand": {
    "@type": "Organization",
    "name": "Cercle de Gouvernance de l'IA",
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Observateur",
      "price": "0",
      "priceCurrency": "CAD",
      "availability": "https://schema.org/InStock",
      "description": "Accès gratuit aux ressources de base",
    },
    {
      "@type": "Offer",
      "name": "Membre",
      "price": "49",
      "priceCurrency": "CAD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "description": "Accès complet aux ressources et événements",
    },
    {
      "@type": "Offer",
      "name": "Partenaire",
      "price": "499",
      "priceCurrency": "CAD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "description": "Accès premium avec accompagnement personnalisé",
    },
  ],
}} />
```

Note: Verify actual prices from the PLANS config or the page content. Adjust values as needed.

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors.

**Step 4: Commit**

```
git add src/pages/TarifsPage.tsx
git commit -m "feat(seo): add Product/Offer JSON-LD to tarifs page"
```

---

### Task 5: Experts Page Structured Data

**Files:**
- Modify: `src/pages/ExpertsPage.tsx` (import line ~10, after `<SEO>` usage)

**Step 1: Add JsonLd import and ItemList schema**

Change import and add after `<SEO>`:

```tsx
import { SEO, JsonLd } from "@/components/SEO";
```

```tsx
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Comités d'experts en gouvernance de l'IA",
  "description": "Plus de 150 experts répartis en comités thématiques pour la gouvernance responsable de l'intelligence artificielle.",
  "numberOfItems": 5,
  "itemListElement": committees.map((c, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": c.title,
    "description": c.description,
  })),
}} />
```

The `committees` array is defined at line 12.

**Step 2: Verify and commit**

```
git add src/pages/ExpertsPage.tsx
git commit -m "feat(seo): add ItemList JSON-LD to experts page"
```

---

### Task 6: SEO Component Enhancements

**Files:**
- Modify: `src/components/SEO.tsx:8-14,40-82`

**Step 1: Add article-specific OG props**

Add optional props to the SEO interface:

```tsx
interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  /** ISO date string for article pages */
  publishedTime?: string;
  /** Author name for article pages */
  authorName?: string;
}
```

**Step 2: Update the useEffect to set article meta tags**

Inside the useEffect, after the Twitter section, add:

```tsx
// Article-specific meta
if (publishedTime) {
  setMeta("property", "article:published_time", publishedTime);
  setMeta("property", "article:author", authorName ?? "");
}

// Always set locale
setMeta("property", "og:locale", "fr_CA");
setMeta("property", "og:site_name", SITE_NAME);
```

Make sure to add `publishedTime` and `authorName` to the dependency array of the useEffect.

**Step 3: Update ArticlePage to use new props**

In `src/pages/ArticlePage.tsx` line 109, update the `<SEO>` call:

```tsx
<SEO
  title={article.title}
  description={article.excerpt}
  type="article"
  publishedTime={article.date}
  authorName={author?.name}
/>
```

**Step 4: Verify and commit**

```
git add src/components/SEO.tsx src/pages/ArticlePage.tsx
git commit -m "feat(seo): add article OG tags and og:locale to SEO component"
```

---

### Task 7: PWA Manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `index.html:16-17`

**Step 1: Create manifest.json**

Create `public/manifest.json`:

```json
{
  "name": "Cercle de Gouvernance de l'IA",
  "short_name": "Gouvernance IA",
  "description": "Gouvernance responsable de l'intelligence artificielle",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6c3baa",
  "background_color": "#ffffff",
  "lang": "fr",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

**Step 2: Add manifest link to index.html**

After the apple-touch-icon line (line 17), add:

```html
<link rel="manifest" href="/manifest.json" />
```

**Step 3: Verify and commit**

```
git add public/manifest.json index.html
git commit -m "feat(seo): add PWA web app manifest"
```

---

### Task 8: Final Verification

**Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds, sitemap generated with ~20 URLs.

**Step 2: Verify sitemap content**

Check that `dist/sitemap.xml` contains both static routes and article routes.

**Step 3: Push to git**

```
git push
```
