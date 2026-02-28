# Design : Showcase animé "Veille réglementaire"

**Date**: 2026-02-27
**Page cible**: `/ressources#veille` (RessourcesPage.tsx)
**Composant**: `VeilleShowcase.tsx`

## Concept

Un mockup d'interface animé en boucle (~12s) montrant le flux complet de la veille réglementaire. Remplace les 4 onglets statiques actuels (Québec/Canada/UE/International). Style similaire au McpAgentShowcase existant.

## Scénario d'animation

| Phase | Timing | Action |
|-------|--------|--------|
| 1. Article apparaît | 0-2s | Carte d'article slide depuis le bas (titre, badge source "Québec", date) |
| 2. Clic "Résumer IA" | 2-4s | Bouton pulse, panneau résumé slide en dessous |
| 3. Résumé généré | 4-7s | Texte apparaît progressivement (typewriter), 3 bullet points |
| 4. Mise en favori | 7-9s | Étoile s'anime (scale + couleur jaune), badge confirmation |
| 5. Ajout organisation | 9-11s | Bouton "+ Org" pulse, badge "Partagé avec votre équipe" |
| Reset | 11-12s | Fade out, boucle recommence |

## Architecture

- **Composant unique** : `src/components/resources/VeilleShowcase.tsx`
- **CSS keyframes** inline (comme McpAgentShowcase) :
  - `veilleSlideIn` : apparition de la carte article
  - `veilleTypewriter` : génération progressive du résumé
  - `veillePulse` : animation des boutons d'action
  - `veilleBadge` : apparition des badges de confirmation
  - `veilleFadeOut` : transition de fin avant boucle
- **Accessibilité** : `prefers-reduced-motion: reduce` → animation désactivée
- **Interaction** : pause au hover (`animation-play-state: paused`)

## Intégration

- Remplace lignes 112-178 de `RessourcesPage.tsx` (bloc des onglets)
- Garde le titre de section et le CTA existant
- Centré avec `max-w-2xl`

## Contenu du mockup

**Article simulé** :
- Badge : "Québec"
- Date : "12 fév. 2026"
- Titre : "Loi 25 — Nouvelles obligations de conformité IA pour 2026"

**Résumé IA simulé** :
- "Obligation de conformité IA pour toutes les organisations"
- "Échéance : mars 2026"
- "Impact : secteurs public et privé au Québec"

**Badges de confirmation** :
- "Ajouté aux favoris"
- "Partagé avec votre équipe"
