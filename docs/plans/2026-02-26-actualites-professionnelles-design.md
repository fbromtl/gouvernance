# Actualites Professionnelles - Design

## Objectif

Transformer la page Actualites en une experience editoriale professionnelle avec articles Markdown, profils auteurs complets, article vedette, filtres par categorie et pages articles individuelles.

## Decisions

- **Source de donnees** : fichiers Markdown dans `content/articles/` avec frontmatter YAML
- **Auteurs** : registre dans `content/authors.ts` avec photo, nom, titre, bio
- **Approche technique** : import statique au build via `import.meta.glob` (approche 1)
- **Dependances** : `react-markdown`, `gray-matter`, `@tailwindcss/typography`

## Structure des donnees

### Fichiers Markdown (`content/articles/*.md`)

```yaml
---
title: "Le Cercle annonce son sommet annuel 2026"
slug: sommet-annuel-2026
date: 2026-02-05
category: communique  # communique|analyse|veille|opinion|nomination|evenement
excerpt: "L'evenement se tiendra le 20 mai a Montreal..."
cover: /images/articles/sommet-2026.jpg
author: florian-brobst
featured: true
---

Contenu Markdown...
```

### Auteurs (`content/authors.ts`)

```ts
export const authors: Record<string, Author> = {
  "florian-brobst": {
    name: "Florian Brobst",
    title: "Fondateur & Directeur",
    bio: "Expert en gouvernance de l'IA...",
    avatar: "/images/authors/florian-brobst.jpg",
  },
};
```

### Types (`src/types/article.ts`)

```ts
interface Article {
  slug: string;
  title: string;
  date: string;
  category: Category;
  excerpt: string;
  cover: string;
  author: string;
  featured: boolean;
  content: string;
  readingTime: number; // calcule
}

interface Author {
  name: string;
  title: string;
  bio: string;
  avatar: string;
}

type Category = "communique" | "analyse" | "veille" | "opinion" | "nomination" | "evenement";
```

## Page liste (`/actualites`)

### Structure

1. **Hero** : titre + sous-titre (style existant avec gradient)
2. **Filtres categorie** : onglets horizontaux (pills), "Tous" par defaut, filtrage cote client
3. **Article vedette** : carte pleine largeur, 2 colonnes (image gauche / contenu droit), uniquement l'article avec `featured: true`
4. **Grille d'articles** : 3 colonnes desktop, 2 tablette, 1 mobile
5. **Pagination** : 6 articles par page, boutons Previous/Next + numeros
6. **Newsletter CTA** : section conservee telle quelle

### Carte article (grille)

- Image de couverture en haut (ratio 16:9, object-cover)
- Badge categorie + date
- Titre (line-clamp-2)
- Excerpt (line-clamp-2)
- Avatar auteur (24px) + nom

### Carte article vedette

- 2 colonnes : image a gauche (50%), contenu a droite
- Badge + date, titre grand (text-2xl), excerpt, avatar + nom auteur + titre
- Lien "Lire la suite" avec fleche

## Page article (`/actualites/:slug`)

### Structure

1. **Image de couverture** : pleine largeur, max-h-96, object-cover, coins arrondis
2. **Meta** : badge categorie + temps de lecture
3. **Titre** : text-4xl font-extrabold
4. **Excerpt** : text-xl text-muted-foreground
5. **Encart auteur compact** : avatar (40px) + nom + titre + date
6. **Separateur**
7. **Contenu Markdown** : rendu avec `react-markdown`, classe `prose` (typography plugin), max-w-3xl
8. **Separateur**
9. **Boutons de partage** : LinkedIn, Twitter/X, copier le lien (toast confirmation via sonner)
10. **Encart auteur complet** : carte avec avatar (64px), nom, titre, bio
11. **Articles similaires** : 3 articles de la meme categorie, cartes compactes
12. **Newsletter CTA**

### Temps de lecture

Calcule automatiquement : `Math.ceil(content.split(/\s+/).length / 200)` minutes.

## Chargement des articles

```ts
// src/lib/articles.ts
const articleModules = import.meta.glob("/content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Parse chaque fichier avec gray-matter pour extraire frontmatter + contenu
// Trie par date decroissante
// Expose: getAllArticles(), getArticleBySlug(), getArticlesByCategory()
```

## Routing

```tsx
<Route path="/actualites" element={<ActualitesPage />} />
<Route path="/actualites/:slug" element={<ArticlePage />} />
```

## Style

- Suit le design system existant : shadcn/ui, Tailwind, palette purple/teal
- Cartes : `rounded-3xl`, hover shadow + translate, transition 300ms
- Typographie prose : `@tailwindcss/typography` pour le rendu Markdown
- Images auteurs : `rounded-full` avec border subtle
- Responsive : mobile-first, breakpoints sm/lg
