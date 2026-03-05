# Design — Intégration photo immersive pages publiques

**Date** : 2026-03-04
**Style** : Immersif et cinématique — grandes images, hero pleine largeur, overlay texte

---

## Pages ciblées

### 1. Page À Propos (`/a-propos`)
- **Hero** : Photo pleine largeur + overlay — `professional-silhouette-in-front-of-large-abstract-digital-display.jpg`
- **Section Mission** : Layout 50/50 — `four-professionals-seated-around-a-circular-table.jpg`
- **Section Gouvernance** : Fond photo pleine largeur + overlay + cards semi-transparentes — `aerial-view-of-professionals-around-circular-table.jpg`
- **Section Cadres** : Image accent — `executive-signing-document-at-minimal-desk.jpg`

### 2. Page Contact (`/contact`)
- **Hero** : Photo pleine largeur — `two-business-professionals-having-a-conversation-over-coffee.jpg`
- **Section formulaire** : Layout 60/40 formulaire|image — `professional-showing-laptop-screen-to-client-across-desk.jpg`

### 3. Page Ressources (`/ressources`)
- **Hero** : Photo pleine largeur — `overhead-shot-of-minimal-desk-with-hand-drawn-network-diagram.jpg`
- **Section Boîte à outils** : Image accent — `close-up-of-human-hands-hovering-over-glowing-data.jpg`

### 4. Page Rejoindre (`/rejoindre`)
- **Hero** : Photo pleine largeur — `des-femmes-d-affaires-dans-une-conférences.jpg`
- **Section Avantages** : Image accent — `des-personnes-a-une-soirée.jpg`
- **Section Outils avancés** : Image — `professional-staring-thoughtfully-at-multiple-transparent-screens.jpg`

### 5. Page Diagnostic (`/diagnostic`)
- **Hero** : Photo — `person-holding-transparent-glass-panel-with-AI-visualization.jpg`

---

## Approche technique
- Images copiées dans `public/images-gouvernance-ai/`
- Hero = `relative` container + `<img>` absolute + overlay gradient `brand-ink/80`
- Sections image/texte = grid 2 colonnes, image `object-cover rounded-2xl`
- Lazy loading `loading="lazy"` sur toutes les images
- Responsive : images cachées ou réduites sur mobile si nécessaire
