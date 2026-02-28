# Design: ToolkitShowcase — Animation de génération de documents IA

## Contexte

La page `/ressources` contient une section "Boîte à outils" avec 4 items statiques. On la remplace par un mockup animé CSS pur (style VeilleShowcase) montrant le flux de génération d'un document de gouvernance IA depuis le portail. L'objectif est de rediriger les utilisateurs vers le portail, où les ressources sont accessibles gratuitement (comptes observer à 0$).

## Layout

Section fond sombre `bg-neutral-950`, deux colonnes :

- **Gauche** : Titre + description + CTA
- **Droite** : Composant `ToolkitShowcase` animé

Responsive : empilé sur mobile (texte au-dessus, mockup en dessous).

## Animation (~12s, boucle infinie)

| Temps   | Étape              | Visuel                                                                                     |
|---------|--------------------|---------------------------------------------------------------------------------------------|
| 0-2s    | Formulaire         | Mini formulaire apparaît, champs "Entreprise" et "Secteur" se remplissent en auto-type      |
| 2-4s    | Sélection document | Sélecteur cycle entre 4 types, se fixe sur "Charte d'utilisation de l'IA"                   |
| 4-5s    | Bouton Générer     | Bouton "Générer avec l'IA" pulse, barre de progression apparaît avec sparkles               |
| 5-8s    | Génération IA      | Barre progresse, lignes de texte apparaissent progressivement                               |
| 8-11s   | Aperçu PDF         | Document stylisé slide en place : titre, sections, badge "PDF prêt"                         |
| 11-12s  | Reset              | Fade out, cycle recommence                                                                  |

### Types de documents affichés dans le sélecteur

1. Charte d'utilisation de l'IA
2. Politique d'IA générative
3. Code d'éthique IA
4. Registre des systèmes IA

## Spécifications techniques

- **Composant** : `src/components/resources/ToolkitShowcase.tsx`
- **Animations** : CSS keyframes scopées (comme VeilleShowcase), pas de JS
- **Accessibilité** : `prefers-reduced-motion` → état statique (aperçu PDF final)
- **Hover** : `animation-play-state: paused`
- **Couleurs** : violet `#ab54f3`, fond sombre, texte clair

## CTA

- Visiteurs non connectés → "Créer mes documents gratuitement" → `/register`
- Utilisateurs connectés → lien vers le portail

## Modifications

- **Supprimer** : Section "Boîte à outils" actuelle dans `RessourcesPage.tsx` (4 items statiques)
- **Créer** : `src/components/resources/ToolkitShowcase.tsx`
- **Modifier** : `src/pages/RessourcesPage.tsx` — remplacer la section par le nouveau composant
