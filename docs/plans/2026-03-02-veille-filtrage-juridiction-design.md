# Veille réglementaire — Filtrage par juridiction et recherche

**Date :** 2026-03-02
**Statut :** Approuvé
**Module :** Portail > Veille réglementaire

## Objectif

Ajouter un système de filtrage par juridiction (classification IA) et une recherche textuelle à la page Veille réglementaire du portail. Permettre aux utilisateurs de retrouver rapidement les articles pertinents pour leur contexte géographique/législatif.

## Contexte

La page Veille actuelle (`VeillePage.tsx`) affiche une liste plate d'articles RSS sans aucun mécanisme de filtrage. Les utilisateurs doivent parcourir manuellement tous les articles pour trouver ceux qui les concernent.

## Approche retenue

**Approche A — Classification IA batch côté Edge Function**

L'Edge Function `regulatory-watch` enrichit chaque article avec un champ `jurisdiction` lors du fetch RSS. La classification se fait en un seul appel IA batch. Le frontend filtre instantanément côté client.

### Approches écartées

- **B — Classification côté client** : Double latence (RSS + IA), UX dégradée
- **C — Mapping statique par source** : Moins précis, ne répond pas au besoin de classification IA riche

## Modèle de données

### Type `Article` enrichi

```ts
interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
  jurisdiction: Jurisdiction;  // NOUVEAU
}

type Jurisdiction =
  | "quebec"
  | "canada"
  | "eu"
  | "france"
  | "usa"
  | "international";
```

### Table de cache Supabase

```sql
CREATE TABLE veille_articles_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  snippet TEXT,
  pub_date TIMESTAMPTZ NOT NULL,
  jurisdiction TEXT NOT NULL,  -- quebec|canada|eu|france|usa|international
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '24 hours'
);

CREATE INDEX idx_veille_jurisdiction ON veille_articles_cache(jurisdiction);
CREATE INDEX idx_veille_expires ON veille_articles_cache(expires_at);

ALTER TABLE veille_articles_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow edge function access" ON veille_articles_cache
  FOR ALL USING (true);
```

**TTL : 24h.** Les articles expirent après 24 heures et seront reclassifiés au prochain chargement.

## Edge Function — `regulatory-watch`

### Logique modifiée (GET)

1. Fetch RSS → obtenir les articles bruts
2. Pour chaque article, vérifier s'il existe dans `veille_articles_cache` (par `link`) et n'est pas expiré
3. Les articles déjà en cache → utiliser la juridiction cachée
4. Les articles non trouvés ou expirés → appel IA batch pour classifier
5. Upsert les nouveaux articles classifiés dans le cache
6. Retourner tous les articles enrichis avec `jurisdiction`

### Prompt IA de classification

```
Tu es un classificateur de juridictions pour des articles de veille réglementaire en gouvernance de l'IA.

Pour chaque article ci-dessous, détermine la juridiction principale parmi :
- "quebec" : Loi 25, CAI, OBVIA, droit québécois
- "canada" : CPVP, C-27/LIAD, droit fédéral canadien
- "eu" : EU AI Act, RGPD, normes européennes (hors France spécifiquement)
- "france" : CNIL, droit français spécifique
- "usa" : NIST, Executive Orders, droit américain
- "international" : ISO, IEEE, UNESCO, OCDE, multi-juridictionnel

Retourne un tableau JSON de juridictions dans le même ordre que les articles.

Articles :
[{title, snippet}, ...]
```

## Frontend — `VeillePage.tsx`

### Nouveaux états

```ts
const [activeJurisdiction, setActiveJurisdiction] = useState<Jurisdiction | "all">("all");
const [searchQuery, setSearchQuery] = useState("");
```

### Filtrage côté client

```ts
const filteredArticles = useMemo(() => {
  return articles.filter(a => {
    const matchJurisdiction = activeJurisdiction === "all" || a.jurisdiction === activeJurisdiction;
    const matchSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJurisdiction && matchSearch;
  });
}, [articles, activeJurisdiction, searchQuery]);
```

### Nouvelle section UI — Barre de filtres

Positionnée entre le header de page et la carte de résumé IA.

```
┌─────────────────────────────────────────────────────────────┐
│  [🔍 Rechercher un article...]                              │
│                                                             │
│  Tous(30)  Québec(12)  Canada(5)  UE(8)  France(2)  ...    │
└─────────────────────────────────────────────────────────────┘
```

**Composants :**
- `Input` avec icône `Search` de lucide-react
- Boutons pill horizontaux avec `ScrollArea` horizontal pour le débordement mobile
- Chaque bouton affiche le compteur d'articles : `Québec (12)`
- Bouton actif : fond violet (`bg-brand-purple text-white`)
- Boutons inactifs : `bg-neutral-100 text-neutral-600 hover:bg-neutral-200`

### Badge juridiction sur chaque carte d'article

Ajouté à côté du badge source existant :

| Juridiction | Couleur badge |
|-------------|---------------|
| Québec | `bg-blue-100 text-blue-700` |
| Canada | `bg-red-100 text-red-700` |
| UE | `bg-indigo-100 text-indigo-700` |
| France | `bg-sky-100 text-sky-700` |
| USA | `bg-amber-100 text-amber-700` |
| International | `bg-neutral-100 text-neutral-700` |

### Adaptation de la liste

- Utiliser `filteredArticles` au lieu de `articles` pour le rendu de la liste et le compteur
- L'état vide change de message quand un filtre est actif : "Aucun article ne correspond à vos filtres"

## Internationalisation (i18n)

### Ajouts à `veille.json` (FR)

```json
{
  "filters": {
    "searchPlaceholder": "Rechercher un article...",
    "all": "Tous",
    "quebec": "Québec",
    "canada": "Canada",
    "eu": "UE",
    "france": "France",
    "usa": "USA",
    "international": "International",
    "resultsCount": "{{count}} résultat(s)",
    "noResults": "Aucun article ne correspond à vos filtres."
  }
}
```

### Ajouts à `veille.json` (EN)

```json
{
  "filters": {
    "searchPlaceholder": "Search articles...",
    "all": "All",
    "quebec": "Quebec",
    "canada": "Canada",
    "eu": "EU",
    "france": "France",
    "usa": "USA",
    "international": "International",
    "resultsCount": "{{count}} result(s)",
    "noResults": "No articles match your filters."
  }
}
```

## Fichiers impactés

| Fichier | Changement |
|---------|-----------|
| `supabase/functions/regulatory-watch/index.ts` | Ajouter classification IA batch + logique cache |
| `src/portail/pages/VeillePage.tsx` | Ajouter filtres, recherche, badges juridiction |
| `src/i18n/locales/fr/veille.json` | Ajouter clés `filters.*` |
| `src/i18n/locales/en/veille.json` | Ajouter clés `filters.*` |
| Supabase (migration) | Créer table `veille_articles_cache` |

## Hors périmètre

- Favoris / sauvegarde d'articles
- Filtrage par thème/catégorie (itération future)
- Notifications / alertes par juridiction
- Résumé IA filtré par juridiction (le résumé reste global)
