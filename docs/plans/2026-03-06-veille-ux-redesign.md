# Veille Regulementaire UX Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformer la page Veille reglementaire d'un simple lecteur de flux RSS en un outil de veille structure avec sauvegarde d'articles, favoris personnels, partage a l'organisation, resume IA persiste et workflow de suivi.

**Architecture:** Nouvelle table `saved_articles` dans Supabase, hook `useSavedArticles`, refonte complete de VeillePage.tsx avec onglets (Flux / Favoris / Org), cards compactes enrichies et Sheet de detail.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack React Query, Supabase (PostgreSQL + RLS), i18next

---

## Schema de donnees

Nouvelle table `saved_articles`:

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `organization_id` | UUID FK | Organisation |
| `saved_by` | UUID FK | Utilisateur qui a sauvegarde |
| `article_link` | TEXT NOT NULL | URL de l'article |
| `title` | TEXT | Titre |
| `source` | TEXT | Source RSS |
| `snippet` | TEXT | Extrait |
| `pub_date` | TIMESTAMPTZ | Date de publication |
| `jurisdiction` | TEXT | quebec/canada/eu/france/usa/international |
| `ai_summary` | TEXT | Resume IA (persiste) |
| `notes` | TEXT | Notes personnelles |
| `is_favorite` | BOOLEAN DEFAULT true | Favori personnel |
| `shared_to_org` | BOOLEAN DEFAULT false | Partage a l'organisation |
| `status` | TEXT DEFAULT 'unread' | unread / read / archived |
| `assigned_to` | UUID FK nullable | Membre assigne pour suivi |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

Contrainte unique: `(saved_by, article_link)`.

RLS:
- SELECT: articles sauvegardes par moi + articles partages a mon org
- INSERT/UPDATE/DELETE: uniquement mes propres articles

---

## Layout de la page

**En-tete:**
- PageHeader avec titre + badge IA + help button
- 3 onglets avec compteurs: Flux (42) / Favoris (7) / Org (3)

**Barre de filtres:**
- Pills juridiction cliquables avec compteurs (Tout / Quebec / Canada / UE / France / USA / International)
- Champ recherche texte a droite
- Onglet Org: filtre supplementaire par statut

**Corps:**
- Onglet Flux: card resume hebdo collapsible en haut + liste de cards compactes
- Onglet Favoris: liste de cards sauvegardees
- Onglet Org: liste de cards partagees avec statut/assignation

**Sheet coulissant:**
- S'ouvre au clic sur un article (w-full sm:max-w-lg)
- Detail complet + resume IA + notes + actions

---

## Design des cards

Card compacte (style ligne enrichie):
- Etoile favori (toggle) a gauche
- Badge juridiction colore
- Source (muted) + Date (alignee droite)
- Titre (font-medium, 1-2 lignes)
- Snippet (text-sm muted, tronque 2 lignes)
- Boutons: Resumer (Sparkles) + Sauvegarder (Bookmark)

Variantes:
- Deja sauvegarde: Bookmark rempli, fond teinte
- Partage a l'org: indicateur Users discret
- Onglet Org: avatar assigne + badge statut

---

## Sheet de detail

Structure:
1. Badge juridiction + source + date
2. Titre complet
3. Extrait original
4. Lien "Lire l'article original" (nouvel onglet)
5. Resume IA (persiste si sauvegarde, sinon bouton "Generer")
6. Notes (textarea auto-save debounce 1s, visible si sauvegarde)
7. Actions: toggle favori, toggle partage org, select assignation (useOrgMembers), select statut

Article non sauvegarde: sections Notes/Assigner/Statut masquees.

---

## Onglet Organisation

- Affiche articles partages par n'importe quel membre de l'org
- Card enrichie avec: "Partage par X - Assigne a Y - [Statut]"
- Filtre par statut: Tous / Non lu / Lu / Archive
- Tri: Non lu en premier, puis date decroissante
- Badges statut colores: Non lu (bleu), Lu (gris), Archive (muted)
- Tout membre peut changer statut/assignation
- Notes partagees (visibles par tous)

---

## Fichiers impactes

- `supabase/migrations/YYYYMMDDHHMMSS_create_saved_articles.sql` — nouvelle table + RLS
- `src/hooks/useSavedArticles.ts` — CRUD hook (create, list, update, delete)
- `src/portail/pages/VeillePage.tsx` — refonte complete
- `src/i18n/locales/fr/veille.json` — nouvelles cles
- `src/i18n/locales/en/veille.json` — idem EN
