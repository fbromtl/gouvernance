# Header Desktop — Redesign 2 niveaux avec compaction au scroll

## Contexte

Le header actuel utilise une disposition sur une seule ligne (logo gauche, nav centre, auth droite). Le nouveau design place le logo centré au-dessus de la navigation, avec une compaction en une seule ligne au scroll.

## Design validé

### État initial (haut de page, `scrolled === false`)

- **Bannière promo** : inchangée (brand-teal `#466060`)
- **Ligne 1 — Logo** : fond blanc, logo centré (`justify-center`), `h-10` (~40px), padding `py-5`, `border-b border-border/30`
- **Ligne 2 — Nav** : nav centrée + auth absolute à droite, hauteur ~48px, `border-b` au scroll
- Séparation : fine `border-b border-border/30` entre logo et nav

### État scrollé (`scrolled === true`)

- Ligne logo collapse (`max-h-0`, `overflow-hidden`, `transition-all duration-300`)
- Ligne nav devient la seule ligne visible : logo réduit `h-7` à gauche + nav centrée + auth à droite
- `shadow-md`, `backdrop-blur-md`
- Hauteur ~56px

### Ce qui ne change pas

- Menu mobile (Sheet)
- Responsive < lg breakpoint
- Bannière promo
- Dropdown utilisateur connecté
