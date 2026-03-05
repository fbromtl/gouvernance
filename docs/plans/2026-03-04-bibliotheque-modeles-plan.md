# Bibliothèque de Modèles de Gouvernance IA — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Créer une page `/modeles` dans le portail affichant 80 modèles DOCX avec sidebar catégories, grille de cards, aperçu HTML et téléchargement.

**Architecture:** Script de build convertit les DOCX en HTML statique via mammoth.js. Un index JSON + des fichiers HTML sont générés dans `public/templates/`. La page portail charge l'index et affiche les documents dans une grille filtrable avec aperçu en Sheet latéral.

**Tech Stack:** mammoth.js (build), React, Tailwind, shadcn/ui (Sheet, Badge, ScrollArea), Lucide icons

---

## Task 1 : Installer mammoth et créer le script de conversion

**Files:**
- Create: `scripts/build-templates.mjs`
- Modify: `package.json` (scripts section)

**Step 1: Installer mammoth**

```bash
npm install --save-dev mammoth
```

**Step 2: Créer le script de conversion**

Créer `scripts/build-templates.mjs` qui :
1. Lit tous les fichiers DOCX depuis le dossier source `ModeleDoc/Modeles_Gouvernance_IA/`
2. Pour chaque DOCX, extrait le numéro et le nom depuis le filename (pattern `NN-Nom_Du_Doc.docx`)
3. Convertit en HTML via `mammoth.convertToHtml()`
4. Extrait le premier paragraphe comme description
5. Détecte la catégorie depuis le dossier parent (les fichiers ne sont PAS dans des sous-dossiers, donc on mappe par plage de numéros : 01-06 → gouvernance-strategique, 07-12 → ethique-valeurs, etc.)
6. Détecte le type de document depuis le titre (contient "Politique" → politique, "Charte" → charte, etc.)
7. Détecte les frameworks référencés dans le contenu HTML (ISO 42001, NIST, Loi 25, RGPD, etc.)
8. Génère `src/data/templates-index.json` avec les métadonnées
9. Copie chaque fichier HTML dans `public/templates/{id}.html`
10. Copie chaque DOCX original dans `public/templates/docx/{filename}`

**Mapping catégories par numéro :**

```javascript
const CATEGORY_RANGES = [
  { range: [1, 6],   slug: "gouvernance-strategique",   label: "Gouvernance stratégique" },
  { range: [7, 12],  slug: "ethique-valeurs",           label: "Éthique & Valeurs" },
  { range: [13, 20], slug: "utilisation-pratiques",      label: "Utilisation & Pratiques" },
  { range: [21, 28], slug: "securite-confidentialite",   label: "Sécurité & Confidentialité" },
  { range: [29, 36], slug: "gestion-risques",           label: "Gestion des risques" },
  { range: [37, 44], slug: "conformite-legale",         label: "Conformité & Légale" },
  { range: [45, 50], slug: "approvisionnement",         label: "Approvisionnement" },
  { range: [51, 57], slug: "rh-formation",              label: "RH & Formation" },
  { range: [58, 66], slug: "documentation-technique",   label: "Documentation technique" },
  { range: [67, 70], slug: "propriete-intellectuelle",  label: "Propriété intellectuelle" },
  { range: [71, 75], slug: "qualite-amelioration",      label: "Qualité & Amélioration" },
  { range: [76, 80], slug: "communication-changement",  label: "Communication & Changement" },
];
```

**Mapping types de documents :**

```javascript
const TYPE_PATTERNS = [
  { pattern: /politique/i,    type: "politique",  label: "Politique" },
  { pattern: /charte/i,       type: "charte",     label: "Charte" },
  { pattern: /guide/i,        type: "guide",      label: "Guide" },
  { pattern: /plan/i,         type: "plan",       label: "Plan" },
  { pattern: /registre/i,     type: "registre",   label: "Registre" },
  { pattern: /proc[eé]dure/i, type: "procedure",  label: "Procédure" },
  { pattern: /cadre/i,        type: "cadre",      label: "Cadre" },
  { pattern: /matrice/i,      type: "matrice",    label: "Matrice" },
  { pattern: /grille/i,       type: "grille",     label: "Grille" },
  { pattern: /formulaire/i,   type: "formulaire", label: "Formulaire" },
  { pattern: /catalogue/i,    type: "catalogue",  label: "Catalogue" },
  { pattern: /fiche/i,        type: "fiche",      label: "Fiche" },
  { pattern: /checklist/i,    type: "checklist",  label: "Checklist" },
  { pattern: /rapport/i,      type: "rapport",    label: "Rapport" },
  { pattern: /faq/i,          type: "faq",        label: "FAQ" },
  { pattern: /journal/i,      type: "journal",    label: "Journal" },
  { pattern: /strat[eé]gie/i, type: "plan",       label: "Plan" },
  { pattern: /processus/i,    type: "procedure",  label: "Procédure" },
  { pattern: /programme/i,    type: "plan",        label: "Plan" },
  { pattern: /code/i,         type: "charte",     label: "Charte" },
  { pattern: /principes/i,    type: "cadre",      label: "Cadre" },
  { pattern: /crit[eè]res/i,  type: "cadre",      label: "Cadre" },
  { pattern: /mod[eè]le/i,    type: "formulaire", label: "Formulaire" },
  { pattern: /inventaire/i,   type: "registre",   label: "Registre" },
  { pattern: /tableau/i,      type: "matrice",    label: "Matrice" },
];
```

**Détection frameworks :**

```javascript
const FRAMEWORKS = [
  { pattern: /loi\s*25/i,           label: "Loi 25" },
  { pattern: /C-27|LIAD|AIDA/i,     label: "C-27 / AIDA" },
  { pattern: /EU\s*AI\s*Act|AI\s*Act/i, label: "EU AI Act" },
  { pattern: /ISO\s*42001/i,        label: "ISO 42001" },
  { pattern: /NIST\s*AI\s*RMF/i,    label: "NIST AI RMF" },
  { pattern: /RGPD|GDPR/i,          label: "RGPD" },
  { pattern: /OCDE|OECD/i,          label: "OCDE" },
  { pattern: /ISO\s*27001/i,        label: "ISO 27001" },
];
```

**Step 3: Modifier package.json**

Ajouter le script `build:templates` et l'intégrer au build principal :

```json
"build:templates": "node scripts/build-templates.mjs",
"build": "npm run build:templates && tsc -b && vite build && node scripts/generate-sitemap.mjs"
```

**Step 4: Exécuter le script et vérifier**

```bash
npm run build:templates
```

Vérifier que :
- `src/data/templates-index.json` contient 80 entrées
- `public/templates/` contient 80 fichiers HTML
- `public/templates/docx/` contient 80 fichiers DOCX

**Step 5: Ajouter au .gitignore**

Les fichiers générés dans `public/templates/` et `src/data/templates-index.json` doivent être gitignorés (générés au build) :

```
# Generated templates
public/templates/
src/data/templates-index.json
```

**Step 6: Commit**

```bash
git add scripts/build-templates.mjs package.json .gitignore
git commit -m "feat: script de conversion DOCX → HTML pour la bibliothèque de modèles"
```

---

## Task 2 : Types TypeScript

**Files:**
- Create: `src/types/template.ts`

**Step 1: Créer les types**

```typescript
export type TemplateCategory =
  | "gouvernance-strategique"
  | "ethique-valeurs"
  | "utilisation-pratiques"
  | "securite-confidentialite"
  | "gestion-risques"
  | "conformite-legale"
  | "approvisionnement"
  | "rh-formation"
  | "documentation-technique"
  | "propriete-intellectuelle"
  | "qualite-amelioration"
  | "communication-changement";

export type TemplateType =
  | "politique" | "charte" | "guide" | "plan"
  | "registre" | "procedure" | "cadre" | "matrice"
  | "grille" | "formulaire" | "catalogue" | "fiche"
  | "checklist" | "rapport" | "faq" | "journal";

export interface TemplateDoc {
  id: string;
  number: number;
  title: string;
  filename: string;
  category: TemplateCategory;
  categoryLabel: string;
  type: TemplateType;
  typeLabel: string;
  description: string;
  frameworks: string[];
  tags: string[];
  htmlPath: string;
  docxPath: string;
}

export interface TemplateCategoryInfo {
  slug: TemplateCategory;
  label: string;
  count: number;
  icon: string; // Lucide icon name
}
```

**Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/types/template.ts
git commit -m "feat: types TypeScript pour les modèles de documents"
```

---

## Task 3 : Lib de chargement des templates

**Files:**
- Create: `src/lib/templates.ts`

**Step 1: Créer le module de données**

Ce module charge `templates-index.json` et expose des fonctions de requête :

```typescript
import type { TemplateDoc, TemplateCategory, TemplateCategoryInfo } from "@/types/template";

// Import the generated index
import templatesData from "@/data/templates-index.json";

const allTemplates: TemplateDoc[] = templatesData as TemplateDoc[];

export function getAllTemplates(): TemplateDoc[] {
  return allTemplates;
}

export function getTemplateById(id: string): TemplateDoc | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateDoc[] {
  return allTemplates.filter((t) => t.category === category);
}

export function searchTemplates(query: string): TemplateDoc[] {
  const q = query.toLowerCase();
  return allTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.frameworks.some((f) => f.toLowerCase().includes(q)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function getCategories(): TemplateCategoryInfo[] {
  // Build from data — deduplicate and count
}
```

**Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/lib/templates.ts
git commit -m "feat: module de chargement des modèles de documents"
```

---

## Task 4 : Composants UI — TemplateCard + TemplateSidebar

**Files:**
- Create: `src/portail/components/templates/TemplateCard.tsx`
- Create: `src/portail/components/templates/TemplateSidebar.tsx`

**Step 1: TemplateCard**

Card avec :
- Numéro (#01) en coin
- Icône selon le type de document (FileText, Shield, Scale, BookOpen, etc.)
- Titre tronqué à 2 lignes
- Description tronquée à 2 lignes
- Badges : catégorie + frameworks (max 2)
- Hover : shadow + translate-y cohérent avec ArticleCard

Pattern : s'inspirer des `FileCard.tsx` existants dans `portail/components/drive/`.

**Step 2: TemplateSidebar**

Sidebar avec :
- Bouton "Toutes" en haut avec compteur total
- 12 catégories avec icône, label, compteur
- Catégorie active highlighted en `brand-forest`
- Scroll si nécessaire

Pattern : s'inspirer de `CategorySidebar.tsx` dans `portail/components/drive/`.

**Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/portail/components/templates/
git commit -m "feat: composants TemplateCard et TemplateSidebar"
```

---

## Task 5 : Composant UI — TemplatePreviewSheet

**Files:**
- Create: `src/portail/components/templates/TemplatePreviewSheet.tsx`

**Step 1: Créer le Sheet d'aperçu**

Utilise le composant `Sheet` de shadcn/ui (côté droit, large). Contenu :

- **Header** : titre, numéro, badges catégorie + type + frameworks
- **Corps** : HTML rendu du DOCX (fetché via `fetch(template.htmlPath)` puis rendu via `dangerouslySetInnerHTML` dans un conteneur stylé)
- **Footer sticky** :
  - Bouton `Télécharger DOCX` (lien vers `template.docxPath`)
  - Bouton `Démarrer la personnalisation` — disabled, avec Tooltip "Bientôt disponible"

**Styles du HTML rendu :** Ajouter une classe wrapper `.template-preview` avec des styles Tailwind prose-like (headings, paragraphs, lists, tables).

**Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/portail/components/templates/TemplatePreviewSheet.tsx
git commit -m "feat: panneau d'aperçu HTML des modèles de documents"
```

---

## Task 6 : Page principale ModelesBibliothequePage

**Files:**
- Create: `src/portail/pages/ModelesBibliothequePage.tsx`

**Step 1: Créer la page**

Layout :
- Header avec titre "Modèles de documents", sous-titre, compteur
- Barre de recherche (Input avec icône Search)
- Desktop : sidebar gauche (TemplateSidebar) + grille 3 colonnes (TemplateCard)
- Mobile : pills horizontales scrollables pour les catégories + grille 1 colonne
- TemplatePreviewSheet contrôlé par state `selectedTemplate`

State :
- `activeCategory: TemplateCategory | null`
- `searchQuery: string`
- `selectedTemplate: TemplateDoc | null`

Filtrage :
- Si `activeCategory` → filtre par catégorie
- Si `searchQuery` → filtre via `searchTemplates()`
- Les deux filtres se combinent

**Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/portail/pages/ModelesBibliothequePage.tsx
git commit -m "feat: page bibliothèque de modèles de gouvernance IA"
```

---

## Task 7 : Routing et navigation

**Files:**
- Modify: `src/App.tsx` — Ajouter route `/modeles`
- Modify: `src/portail/layout/nav-config.ts` — Ajouter item navigation

**Step 1: Ajouter la route dans App.tsx**

Ajouter l'import en haut :
```typescript
import ModelesBibliothequePage from "@/portail/pages/ModelesBibliothequePage";
```

Ajouter la route dans le bloc `<PortailLayout>` :
```tsx
<Route path="/modeles" element={<ModelesBibliothequePage />} />
```

**Step 2: Ajouter dans nav-config.ts**

Dans le groupe `overview`, après `bibliotheque` :
```typescript
{ key: "modeles", path: "/modeles", icon: Library, ready: true },
```

Ajouter `Library` aux imports Lucide.

**Step 3: Ajouter la traduction**

Ajouter la clé `nav.modeles` dans les fichiers i18n (FR: "Modèles de documents", EN: "Document templates").

**Step 4: Vérifier le build complet**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/App.tsx src/portail/layout/nav-config.ts src/i18n/
git commit -m "feat: route /modeles et navigation sidebar"
```

---

## Task 8 : Vérification visuelle et polish

**Step 1: Démarrer le serveur dev**

```bash
npm run dev
```

**Step 2: Vérifier visuellement**

- Naviguer vers `/modeles`
- Vérifier la sidebar avec les 12 catégories et compteurs
- Cliquer sur une catégorie → filtrage
- Taper dans la recherche → filtrage
- Cliquer sur une card → Sheet d'aperçu HTML
- Vérifier le rendu HTML (headings, paragraphes, listes, tableaux)
- Tester le bouton Télécharger DOCX
- Vérifier le bouton "Personnalisation" est bien désactivé
- Tester le responsive mobile (pills + grille 1 col)

**Step 3: Corriger les problèmes visuels si nécessaire**

**Step 4: Build final**

```bash
npm run build
```

**Step 5: Commit final**

```bash
git add -A
git commit -m "fix: polish visuel bibliothèque de modèles"
git push
```
