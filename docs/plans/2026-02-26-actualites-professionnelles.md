# Actualites Professionnelles - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static ActualitesPage into a professional editorial experience with Markdown articles, author profiles, featured article, category filters, pagination, and individual article pages.

**Architecture:** Markdown files in `content/articles/` with YAML frontmatter, loaded at build time via `import.meta.glob`. Authors defined in `content/authors.ts`. Articles parsed with `gray-matter`, rendered with `react-markdown` + `@tailwindcss/typography`.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, shadcn/ui, react-markdown, gray-matter, @tailwindcss/typography, Vite import.meta.glob, sonner (toasts), lucide-react (icons).

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install npm packages**

Run: `npm install react-markdown gray-matter @tailwindcss/typography`

**Step 2: Add typography plugin to CSS**

Modify: `src/index.css` - add at line 3:

```css
@plugin "@tailwindcss/typography";
```

**Step 3: Commit**

```bash
git add package.json package-lock.json src/index.css
git commit -m "chore: add react-markdown, gray-matter, typography plugin"
```

---

### Task 2: Create types and author registry

**Files:**
- Create: `src/types/article.ts`
- Create: `content/authors.ts`

**Step 1: Create article types**

Create `src/types/article.ts`:

```ts
export type Category =
  | "communique"
  | "analyse"
  | "veille"
  | "opinion"
  | "nomination"
  | "evenement";

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: Category;
  excerpt: string;
  cover: string;
  author: string;
  featured: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
  readingTime: number;
}

export interface Author {
  name: string;
  title: string;
  bio: string;
  avatar: string;
}

export const categoryLabels: Record<Category, string> = {
  communique: "Communiqué",
  analyse: "Analyse",
  veille: "Veille",
  opinion: "Opinion",
  nomination: "Nomination",
  evenement: "Événement",
};

export const categoryColors: Record<Category, string> = {
  communique: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  analyse: "bg-primary/15 text-primary border-primary/30",
  veille: "border-muted-foreground text-muted-foreground",
  opinion: "bg-primary/15 text-primary border-primary/30",
  nomination: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  evenement: "bg-primary/15 text-primary border-primary/30",
};
```

**Step 2: Create author registry**

Create `content/authors.ts`:

```ts
import type { Author } from "@/types/article";

export const authors: Record<string, Author> = {
  "florian-brobst": {
    name: "Florian Brobst",
    title: "Fondateur & Directeur",
    bio: "Spécialiste en gouvernance de l'intelligence artificielle, Florian accompagne les organisations dans la mise en place de cadres de gouvernance responsables et conformes aux réglementations émergentes.",
    avatar: "/images/authors/florian-brobst.jpg",
  },
  "equipe-cercle": {
    name: "L'équipe du Cercle",
    title: "Cercle de Gouvernance de l'IA",
    bio: "Le Cercle de Gouvernance de l'IA rassemble des experts et professionnels engagés dans la promotion d'une intelligence artificielle responsable et éthique.",
    avatar: "/images/authors/cercle-logo.jpg",
  },
};
```

**Step 3: Commit**

```bash
git add src/types/article.ts content/authors.ts
git commit -m "feat(actualites): add article types and author registry"
```

---

### Task 3: Create article loader library

**Files:**
- Create: `src/lib/articles.ts`

**Step 1: Create the article loading module**

Create `src/lib/articles.ts`:

```ts
import matter from "gray-matter";
import { authors } from "@/../content/authors";
import type { Article, ArticleMeta, Category, Author } from "@/types/article";

// Import all .md files from content/articles at build time
const articleModules = import.meta.glob("/content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseArticle(raw: string): Article {
  const { data, content } = matter(raw);
  const meta = data as ArticleMeta;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    ...meta,
    featured: meta.featured ?? false,
    content,
    readingTime: Math.max(1, Math.ceil(wordCount / 200)),
  };
}

const allArticles: Article[] = Object.values(articleModules)
  .map(parseArticle)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getAllArticles(): Article[] {
  return allArticles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Category): Article[] {
  return allArticles.filter((a) => a.category === category);
}

export function getFeaturedArticle(): Article | undefined {
  return allArticles.find((a) => a.featured);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return allArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}

export function getAuthor(authorId: string): Author | undefined {
  return authors[authorId];
}
```

**Step 2: Commit**

```bash
git add src/lib/articles.ts
git commit -m "feat(actualites): add article loader with gray-matter parsing"
```

---

### Task 4: Create sample Markdown articles

**Files:**
- Create: `content/articles/2026-02-05-sommet-annuel-2026.md`
- Create: `content/articles/2026-01-28-ai-act-europeen.md`
- Create: `content/articles/2026-01-15-cadre-mcn-ia-generative.md`
- Create: `content/articles/2026-01-08-certification-iso-42001.md`
- Create: `content/articles/2025-12-20-nouveaux-membres-comite.md`
- Create: `content/articles/2025-12-12-table-ronde-loi-25.md`

**Step 1: Create first article (featured)**

Create `content/articles/2026-02-05-sommet-annuel-2026.md`:

```markdown
---
title: "Le Cercle de Gouvernance de l'IA annonce son sommet annuel 2026"
slug: sommet-annuel-2026
date: "2026-02-05"
category: communique
excerpt: "L'événement se tiendra le 20 mai à Montréal et réunira plus de 200 participants autour des enjeux de gouvernance de l'intelligence artificielle."
cover: /images/articles/sommet-2026.jpg
author: florian-brobst
featured: true
---

## Un rendez-vous incontournable

Le Cercle de Gouvernance de l'IA est fier d'annoncer la tenue de son sommet annuel 2026, qui se déroulera le **20 mai prochain** au Palais des congrès de Montréal.

Cet événement réunira plus de **200 participants** — dirigeants, responsables de la conformité, chercheurs et décideurs publics — autour d'une programmation riche et diversifiée.

## Thématiques principales

Cette année, le sommet s'articulera autour de trois axes :

1. **Conformité réglementaire** — Les implications de la Loi 25, du AI Act européen et des nouvelles directives fédérales
2. **Gouvernance opérationnelle** — Mise en place de comités d'éthique, registres de systèmes d'IA et processus d'évaluation des risques
3. **Innovation responsable** — Comment innover avec l'IA tout en maintenant des standards éthiques élevés

## Conférenciers confirmés

Nous avons le plaisir d'accueillir des experts reconnus dans le domaine :

- **Dre Marie-Claire Trudeau**, Commissaire à l'éthique de l'IA du Québec
- **Prof. Jean-François Gagné**, Directeur de Mila
- **Sophie Chen**, VP Gouvernance IA chez Desjardins

## Inscription

Les inscriptions ouvriront le **1er mars 2026**. Les membres du Cercle bénéficieront d'un tarif préférentiel et d'un accès prioritaire aux ateliers pratiques.

Restez à l'affût de notre prochaine communication pour tous les détails.
```

**Step 2: Create remaining 5 articles**

Create each with appropriate frontmatter and 3-5 paragraphs of content. Use `featured: false` for all. Vary categories: analyse, veille, opinion, nomination, evenement. Use `author: florian-brobst` for analyse/opinion and `author: equipe-cercle` for the rest.

Content should be realistic and relevant to AI governance in Quebec/Canada. Each article should have 150-300 words of body content.

**Step 3: Add placeholder images**

Create placeholder directories:

```bash
mkdir -p public/images/articles public/images/authors
```

Note: actual images will be added later. The UI should handle missing images gracefully with a fallback.

**Step 4: Commit**

```bash
git add content/articles/ public/images/
git commit -m "feat(actualites): add 6 sample articles with Markdown content"
```

---

### Task 5: Rewrite ActualitesPage with featured article + grid + filters + pagination

**Files:**
- Modify: `src/pages/ActualitesPage.tsx`

**Step 1: Rewrite ActualitesPage**

Replace the entire content of `src/pages/ActualitesPage.tsx` with the new implementation:

- Import `getAllArticles`, `getFeaturedArticle`, `getAuthor` from `@/lib/articles`
- Import types, `categoryLabels`, `categoryColors` from `@/types/article`
- Use `useState` for `activeCategory` (string | null, null = "Tous") and `currentPage` (number)
- Constants: `ARTICLES_PER_PAGE = 6`

**Hero section**: Keep existing gradient style and text.

**Category filters**: Horizontal row of pill buttons below hero. "Tous" + each category from `categoryLabels`. Active pill has filled purple background, inactive has outline style. Clicking resets `currentPage` to 1.

**Featured article** (only when `activeCategory` is null and `currentPage` is 1): Full-width card, `grid md:grid-cols-2 gap-0`, image left (aspect-[16/10], object-cover, rounded-l-3xl), content right with badge, date, title (text-2xl font-bold), excerpt, author avatar (32px rounded-full) + name + title, "Lire la suite" link.

**Article grid**: Filter articles by category if set, exclude featured from page 1. Paginate. Each card: image top (aspect-[16/9], object-cover, rounded-t-3xl), CardHeader with badge + date + title (line-clamp-2), CardContent with excerpt (line-clamp-2), author row (avatar 24px + name).

**Pagination**: Show if totalPages > 1. Previous/Next buttons + page numbers. Use `Button` component variant="outline" for inactive, variant="default" for active page.

**Newsletter CTA**: Keep existing section unchanged.

All images should use `onError` handler to show a purple gradient placeholder if the image fails to load.

**Step 2: Verify the build compiles**

Run: `npm run build`
Expected: No TypeScript or build errors.

**Step 3: Commit**

```bash
git add src/pages/ActualitesPage.tsx
git commit -m "feat(actualites): professional page with featured article, filters, pagination"
```

---

### Task 6: Create ArticlePage for individual articles

**Files:**
- Create: `src/pages/ArticlePage.tsx`
- Modify: `src/App.tsx` (add route)

**Step 1: Create ArticlePage component**

Create `src/pages/ArticlePage.tsx`:

- `useParams<{ slug: string }>()` to get slug from URL
- `getArticleBySlug(slug)` to load article
- `getAuthor(article.author)` to load author
- `getRelatedArticles(article, 3)` for similar articles
- If article not found, show a "Article non trouvé" message with link back to `/actualites`

**Layout:**

1. **Cover image**: full-width inside max-w-5xl, rounded-2xl, max-h-96, object-cover. Fallback gradient if missing.
2. **Meta row**: Badge (category) + Clock icon + reading time ("X min de lecture")
3. **Title**: text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight
4. **Excerpt**: text-lg sm:text-xl text-muted-foreground
5. **Author compact**: avatar (40px) + column(name bold, title + "·" + formatted date)
6. **Separator**: `<hr />`
7. **Content**: `<ReactMarkdown>` inside `<article className="prose prose-lg max-w-none">`. Customize heading styles to match brand.
8. **Separator**
9. **Share buttons**: Row of 3 buttons (LinkedIn, Twitter/X, Copier le lien). LinkedIn/Twitter open `window.open()` with share URL. Copy uses `navigator.clipboard.writeText()` + `toast.success("Lien copié !")` from sonner.
10. **Author card**: Card with avatar (64px), name (text-xl font-bold), title (text-muted-foreground), bio paragraph.
11. **Related articles**: Section title "Articles similaires", grid of 3 compact cards (image + badge + title + date). Only show if related articles exist.
12. **Newsletter CTA**: Same dark section as ActualitesPage — extract to a shared component or duplicate.

**Step 2: Add route in App.tsx**

Add after the `/actualites` route (line 122):

```tsx
import { ArticlePage } from "@/pages/ArticlePage";
// ...
<Route path="/actualites/:slug" element={<ArticlePage />} />
```

**Step 3: Verify build**

Run: `npm run build`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/pages/ArticlePage.tsx src/App.tsx
git commit -m "feat(actualites): add individual article page with author, sharing, related articles"
```

---

### Task 7: Visual polish and verify

**Files:**
- Possibly adjust: `src/pages/ActualitesPage.tsx`, `src/pages/ArticlePage.tsx`

**Step 1: Run dev server and visually verify**

Run: `npm run dev`

Check:
- `/actualites` loads with hero, filters, featured card, grid, pagination
- Category filter works (filters articles, resets page)
- Pagination works (shows correct articles per page)
- Featured article displays prominently with image + author
- Each card links to `/actualites/:slug`
- Individual article page renders Markdown, shows author, share buttons work
- Related articles section shows correct articles
- Responsive: mobile (1 col), tablet (2 col), desktop (3 col)
- Image fallbacks work when images are missing

**Step 2: Fix any visual issues found**

Adjust spacing, colors, responsive breakpoints as needed.

**Step 3: Final build check**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 4: Commit and push**

```bash
git add -A
git commit -m "feat(actualites): visual polish and responsive adjustments"
git push
```
