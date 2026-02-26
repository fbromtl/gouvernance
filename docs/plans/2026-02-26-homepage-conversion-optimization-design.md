# Homepage Conversion Optimization — Design

**Date:** 2026-02-26
**Objectif:** Augmenter les inscriptions gratuites et les lancements de diagnostic de maturité IA.
**Approche:** Micro-optimisations CTA (Approche A) — changements chirurgicaux sur `HomePage.tsx`.

## Entonnoir ciblé

Visiteur → Inscription gratuite → Diagnostic de maturité offert

## Changements

### 1. Hero — Remplacement du faux formulaire email

- Supprimer le champ email (pas de backend, friction inutile)
- Bouton primaire : « Créer mon compte gratuit » → `/inscription` (gradient violet avec glow)
- Bouton secondaire : « Lancer le diagnostic » → `/diagnostic` (outline blanc)
- Ligne de réassurance sous les boutons : « ✓ Gratuit — ✓ Sans carte de crédit — ✓ Diagnostic en 10 min »

### 2. Preuve sociale « above the fold »

- Rangée d'avatars empilés (`flex -space-x-2`, 5-6 images rondes `w-8 h-8`) + texte « **150+ organisations** nous font confiance »
- Positionnée entre les CTAs et le mockup dashboard

### 3. Sticky CTA bar (bottom float)

- Barre flottante en bas de l'écran, apparaît après scroll past hero (~500px)
- `fixed bottom-4 inset-x-4 z-40 rounded-2xl bg-white/95 backdrop-blur border shadow-lg`
- Contenu : « Évaluez votre maturité IA — Gratuit, 10 minutes » + bouton « S'inscrire » (violet)
- Animation slide-up (`translate-y-full → translate-y-0`)
- Bouton × pour fermer (state React)
- Disparaît automatiquement quand l'utilisateur atteint la section Pricing

### 4. CTAs intermédiaires

- Après section Bento « Pourquoi le Cercle » : « Rejoindre le Cercle gratuitement → » (gradient pill)
- Après les témoignages : « Commencer mon évaluation gratuite → » (bg-neutral-950)
- Après la FAQ : « Créer mon compte — C'est gratuit → » (gradient pill)

### 5. Bannière d'urgence → CTA actionnable

- Remplacer le lien texte par un bouton `rounded-full bg-[#ab54f3] text-white`
- Pointer vers `/inscription` au lieu de `/services#diagnostic`

## Fichiers impactés

- `src/pages/HomePage.tsx` (seul fichier modifié)

## Ce qui ne change pas

- Structure des sections (Bento, How it works, Features, Metrics, Testimonials, Pricing, FAQ, Final CTA)
- Design system (couleurs, typographie, cards, gradients)
- Aucune nouvelle dépendance ou route
