# Auth Pages — Split Card Paysage avec Panneau Avantages

**Date** : 2026-02-26
**Statut** : Approuvé

## Objectif

Transformer les fenêtres flottantes d'inscription et connexion en format paysage (split card) avec un panneau d'avantages à droite sur fond gradient violet.

## Fichiers concernés

- `src/pages/auth/RegisterPage.tsx`
- `src/pages/auth/LoginPage.tsx`

## Design

### Layout split card

La carte flottante passe de `max-w-[440px]` à `max-w-[440px] md:max-w-[820px]`. Structure interne en `flex` :

- **Gauche** (`flex-1 min-w-0`) : formulaire actuel inchangé, fond blanc
- **Droite** (`hidden md:flex`, `w-[320px] shrink-0`) : panneau avantages, gradient violet, `rounded-r-2xl`

### Panneau droit — Inscription

- **Fond** : `bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4f46e5]`
- **Coins** : `rounded-r-2xl` (arrondi uniquement côté droit)
- **Titre** : « Pourquoi nous rejoindre ? » — `text-lg font-semibold text-white`
- **4 avantages** (icône Lucide + titre bold + description) :
  1. `Zap` — **Simple et rapide** — Inscription en quelques secondes
  2. `LayoutDashboard` — **Tableau de bord** — Accédez en 1 clic à votre portail
  3. `ClipboardCheck` — **Diagnostic IA** — Évaluez votre maturité en 5 min
  4. `BadgeCheck` — **100% gratuit** — Aucun engagement
- **Social proof** en bas : « 150+ professionnels nous font confiance » avec bordure top `border-t border-white/20`

### Panneau droit — Connexion

Même structure visuelle, texte adapté :
- Titre : « Retrouvez votre portail »
- Mêmes 4 avantages
- Social proof identique

### Responsive

- **Desktop/tablette** (`md:` et plus) : split card paysage, panneau visible
- **Mobile** (`< md`) : panneau masqué (`hidden md:flex`), formulaire seul comme actuellement

## Changements CSS spécifiques

### Wrapper externe
- `max-w-[440px]` → `max-w-[440px] md:max-w-[820px]`

### Carte flottante
- Ajouter `flex flex-col md:flex-row` au conteneur principal
- Formulaire gauche dans `flex-1 min-w-0`
- Nouveau `<div>` panneau droit : `hidden md:flex flex-col justify-center w-[320px] shrink-0 rounded-r-2xl bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4f46e5] p-8 text-white`

### Formulaire gauche
- Aucun changement fonctionnel
- Le `overflow-hidden rounded-2xl` reste sur le wrapper externe
