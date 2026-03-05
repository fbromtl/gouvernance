# Design : Bibliothèque de Modèles de Gouvernance IA

**Date :** 2026-03-04
**Statut :** Validé
**Route :** `/modeles`

---

## Contexte

Le portail dispose de 80 modèles de documents DOCX couvrant 12 domaines de la gouvernance IA (chartes, politiques, guides, registres, etc.). Ces modèles doivent être accessibles à tous les utilisateurs du portail dans une interface de consultation avec aperçu HTML et téléchargement DOCX.

La V2 ajoutera un chatbot RAG pour personnaliser les modèles. Le bouton est posé visuellement dès la V1 (désactivé).

---

## Architecture

### Approche retenue : Build statique

Un script Node (`scripts/build-templates.mjs`) convertit les 80 DOCX en HTML au build via `mammoth.js`.

**Artifacts générés :**
- `src/data/templates-index.json` — Métadonnées des 80 documents
- `public/templates/{id}.html` — Contenu HTML de chaque document
- `public/templates/{filename}.docx` — Fichiers DOCX originaux pour téléchargement

### Commande de build

Ajout dans `package.json` :
```json
"build:templates": "node scripts/build-templates.mjs",
"build": "npm run build:templates && tsc -b && vite build && node scripts/generate-sitemap.mjs"
```

---

## Données

### TemplateDoc (type)

```typescript
interface TemplateDoc {
  id: string;            // "01-strategie-ia"
  number: number;        // 1
  title: string;         // "Stratégie IA"
  filename: string;      // "01-Strategie_IA.docx"
  category: TemplateCategory;
  categoryLabel: string; // "Gouvernance stratégique"
  type: TemplateType;    // "politique" | "charte" | "guide" | ...
  description: string;   // Extrait du 1er paragraphe
  frameworks: string[];  // ["ISO 42001", "NIST AI RMF"]
  tags: string[];
  htmlPath: string;      // "/templates/01-strategie-ia.html"
  docxPath: string;      // "/templates/01-Strategie_IA.docx"
}
```

### 12 catégories

| Slug | Label | Nb docs |
|------|-------|---------|
| gouvernance-strategique | Gouvernance stratégique | 6 |
| ethique-valeurs | Éthique & Valeurs | 6 |
| utilisation-pratiques | Utilisation & Pratiques | 8 |
| securite-confidentialite | Sécurité & Confidentialité | 8 |
| gestion-risques | Gestion des risques | 8 |
| conformite-legale | Conformité & Légale | 8 |
| approvisionnement | Approvisionnement | 6 |
| rh-formation | RH & Formation | 7 |
| documentation-technique | Documentation technique | 9 |
| propriete-intellectuelle | Propriété intellectuelle | 4 |
| qualite-amelioration | Qualité & Amélioration | 5 |
| communication-changement | Communication & Changement | 5 |

### Types de documents

`politique` · `charte` · `guide` · `plan` · `registre` · `procedure` · `cadre` · `matrice` · `grille` · `formulaire` · `catalogue` · `fiche` · `checklist` · `rapport` · `faq` · `journal`

---

## Layout de la page

### Desktop (lg+)

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Modèles de documents"                         │
│  Sous-titre + Recherche          80 modèles · 12 cat.  │
├───────────┬─────────────────────────────────────────────┤
│ SIDEBAR   │  GRILLE (3 colonnes)                        │
│ catégories│  Cards avec numéro, titre, desc, badges     │
│ + compteur│                                             │
├───────────┴─────────────────────────────────────────────┤
│  Sheet (panneau latéral droit) — Aperçu HTML            │
│  Header: titre, catégorie, type                         │
│  Corps: HTML rendu du DOCX                              │
│  Footer: [Télécharger] [Personnaliser — bientôt]        │
└─────────────────────────────────────────────────────────┘
```

### Mobile

- Sidebar → pills horizontales scrollables (pattern ActualitesPage)
- Grille → 1 colonne
- Sheet → pleine largeur

---

## Composants

### Page : `ModelesBibliothequePage.tsx`

Route `/modeles` dans le portail (protégée par auth).

### Composants :
- `TemplateCard` — Card avec numéro, icône type, titre, description, badges catégorie/frameworks
- `TemplateSidebar` — Sidebar des 12 catégories avec compteurs
- `TemplatePreviewSheet` — Sheet latéral avec aperçu HTML fetché, actions télécharger/personnaliser
- `TemplateSearch` — Barre de recherche full-text (titre, description, tags, frameworks)

---

## Navigation

Ajout dans `AppSidebar` section "Ressources" :
```
📚 Modèles de documents → /modeles
```
Icône : `Library` (Lucide). Position : entre Bibliothèque et Documents.

---

## Recherche et filtrage

- **Recherche** : full-text côté client sur `title`, `description`, `tags`, `frameworks`
- **Filtre catégorie** : sidebar + pills mobile
- **Compteur** : nombre de documents par catégorie (dynamique selon recherche)

---

## V2 — Chatbot RAG (non implémenté)

Le bouton "Démarrer la personnalisation" est posé visuellement mais **désactivé** avec tooltip "Bientôt disponible".

Quand activé (V2) :
1. Ouvre un chat contextuel pré-chargé avec le contenu du modèle
2. Le chatbot guide l'utilisateur (nom entreprise, secteur, cadres)
3. Génère un DOCX personnalisé téléchargeable

---

## Dépendances

- `mammoth` (npm) — Conversion DOCX → HTML au build
- Pas de nouvelle dépendance runtime

---

## Fichiers impactés

### Nouveaux fichiers
- `scripts/build-templates.mjs` — Script de conversion
- `src/data/templates-index.json` — Index généré (gitignored? ou commité)
- `src/types/template.ts` — Types TypeScript
- `src/portail/pages/ModelesBibliothequePage.tsx` — Page principale
- `src/portail/components/templates/TemplateCard.tsx`
- `src/portail/components/templates/TemplateSidebar.tsx`
- `src/portail/components/templates/TemplatePreviewSheet.tsx`
- `src/portail/components/templates/TemplateSearch.tsx`
- `public/templates/` — HTML + DOCX générés

### Fichiers modifiés
- `src/App.tsx` — Ajout route `/modeles`
- `src/portail/layout/AppSidebar.tsx` — Ajout lien navigation
- `package.json` — Script `build:templates`
