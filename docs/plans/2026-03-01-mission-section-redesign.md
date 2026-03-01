# Design: Section "Notre mission" - Bento Grid Redesign

**Date:** 2026-03-01
**Page:** AProposPage.tsx - Section #mission
**Objectif:** Aligner la section mission sur le design premium de la HomePage (bento grid)

## Contexte

La section "Notre mission" actuelle utilise des composants shadcn generiques (Card) qui contrastent avec le design bento premium de la HomePage. L'objectif est de creer une continuite visuelle forte tout en equilibrant credibilite (stats, cadres) et inspiration (photo, vision).

## Architecture visuelle

### En-tete (pattern HomePage)
- Ligne violet `#ab54f3` + tag uppercase "Notre raison d'etre"
- Titre H2 editorial : "L'IA avance. Votre gouvernance doit avancer plus vite."
- Sous-texte a droite (lg) : "Le Cercle structure l'expertise collective pour que chaque decision IA soit eclairee, conforme et responsable."
- Separateur `h-px bg-neutral-200`

### Bento Grid (4 colonnes, h-[520px])

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Mission    │    Photo     │   Valeurs    │    Stats     │
│  neutral-50  │  + overlay   │  3 sub-cards │  neutral-950 │
│  rounded-40  │  rounded-40  │  rounded-40  │  rounded-40  │
│              │              │              │              │
│  Shield icon │ meeting.jpg  │ Eye icon     │ "Le Cercle   │
│  + titre     │ opacity-60   │ Transparence │  en chiffres"│
│  + texte     │ gradient bot │              │              │
│              │              │ Shield icon  │  150+        │
│  ──────────  │ badge violet │ Rigueur      │  Experts     │
│  "Depuis     │ "Notre       │              │              │
│   2024"      │  vision"     │ Users icon   │  15          │
│              │              │ Collab.      │  Disciplines │
│              │ Texte blanc  │              │              │
│              │ vision       │              │  [CTA btn]   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Colonne 1 - Mission
- Fond: `bg-neutral-50`, `rounded-[40px]`, `px-10 py-10`
- Icone: Shield dans `w-12 h-12 bg-[#ab54f3]/10 rounded-2xl`
- Titre: "Accompagner l'adoption responsable de l'IA."
- Texte: "Face a la multiplication des cadres reglementaires et a l'acceleration technologique, les dirigeants ont besoin d'un espace structure pour naviguer avec confiance."
- Bas: border-t + tag "Depuis 2024"

#### Colonne 2 - Photo + Vision
- Image: `businesspeople-meeting.jpg`, `object-cover opacity-60`
- Overlay: `bg-gradient-to-t from-neutral-950 via-transparent to-transparent`
- Badge haut: `bg-[#ab54f3] rounded-full` "Notre vision"
- Texte bas blanc: "Devenir la reference francophone en gouvernance de l'intelligence artificielle."

#### Colonne 3 - Valeurs (container `rounded-[40px]`)
- 3 sous-cartes empilees dans un conteneur `bg-neutral-50 rounded-[40px] p-6`
- Chaque valeur: icone violet + titre bold + description courte
  - Transparence (Eye): "Methodologies ouvertes, referentiels partages."
  - Rigueur (Shield): "Cadres reconnus, validation systematique."
  - Collaboration (Users): "L'intelligence collective au service de la gouvernance."

#### Colonne 4 - Stats
- Fond: `bg-neutral-950`, texte blanc
- Header: "Le Cercle en chiffres" en violet
- Stats: "150+" Experts, "15" Disciplines (gros chiffres)
- CTA bas: "Rejoindre le Cercle" bouton `bg-white text-neutral-900 rounded-[20px]`

### Responsive
- **lg**: 4 colonnes, h-[520px]
- **md**: 2x2 grid (mission+photo / valeurs+stats)
- **sm**: 1 colonne empilee, hauteurs auto sauf photo h-[400px]

### Interactions
- Cartes: `hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500`
- Photo: `group-hover:scale-110 transition-transform duration-1000`
- Stats liens: `group-hover/link:text-[#ab54f3] transition-colors`
- Pas de framer-motion (coherence avec le bento de la home)

## Fichiers impactes
- `src/pages/AProposPage.tsx` - Remplacement de la section #mission

## Decisions
- Reutilisation des patterns CSS exacts de la HomePage (pas de nouveaux composants)
- Photos existantes de `/images-gouvernance-ai/`
- Pas de nouvelles dependances
