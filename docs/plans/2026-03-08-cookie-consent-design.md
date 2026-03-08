# Design : Bandeau de cookies conforme Loi 25

**Date** : 2026-03-08
**Statut** : Approuvé

## Contexte

Le site gouvernance.ai n'a aucun bandeau de cookies ni mécanisme de consentement. Les seuls cookies/stockage utilisés sont essentiels (Supabase auth, Stripe.js, i18n) et fonctionnels (diagnostic progress, session chat public). Aucun analytics ni tracking n'est prévu.

La Loi 25 du Québec exige un consentement explicite avant le dépôt de cookies non essentiels, une information claire sur leur finalité, et la possibilité de retirer son consentement à tout moment.

## Architecture

Un composant `CookieConsent` injecté dans `Layout.tsx` au même niveau que `PublicChat`. Consentement stocké en `localStorage`. Aucune dépendance externe.

### Catégories de cookies

| Catégorie | Désactivable | Exemples |
|-----------|-------------|----------|
| Essentiels | Non | Supabase auth, Stripe.js, i18n (langue) |
| Fonctionnels | Oui | Diagnostic progress, session chat public |

### Composants

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `CookieConsent` | `src/components/cookie/CookieConsent.tsx` | Barre snackbar en bas de page |
| `CookiePreferences` | `src/components/cookie/CookiePreferences.tsx` | Dialog modal pour personnaliser |
| `useCookieConsent` | `src/hooks/useCookieConsent.ts` | Hook — lit/écrit localStorage, expose `hasConsent(category)` |

## UX Flow

1. **Première visite** : barre discrète fixe en bas — texte court + 3 boutons : "Accepter", "Refuser", "Personnaliser"
2. **"Personnaliser"** : ouvre un Dialog (shadcn) avec les 2 catégories, toggles, descriptions
3. **Après choix** : barre disparaît, choix sauvegardé en localStorage avec timestamp
4. **Accès ultérieur** : lien "Gestion des cookies" dans le footer + section sur `/confidentialite`

## Stockage localStorage

Clé : `cookie_consent`

```json
{
  "version": 1,
  "timestamp": "2026-03-08T...",
  "essential": true,
  "functional": true
}
```

## Design visuel

- Barre fixe en bas, fond `brand-ink` (#0e0f19), texte blanc, coins arrondis avec marge
- Boutons : "Accepter" en `brand-forest`, "Refuser" en outline blanc, "Personnaliser" en text link
- Animation Framer Motion slide-up
- Responsive mobile-first (stack vertical sur petit écran)

## Points d'intégration

- `Layout.tsx` : ajout de `<CookieConsent />` après `<PublicChat />`
- `Footer.tsx` : ajout lien "Gestion des cookies" dans la section légale
- `ConfidentialitePage.tsx` : ajout section avec bouton pour rouvrir les préférences
- `useDiagnostic.ts` / `usePublicChat.ts` : conditionner le stockage fonctionnel à `hasConsent('functional')`

## Conformité Loi 25

- Consentement explicite requis avant cookies fonctionnels
- Information claire sur la finalité de chaque catégorie
- Retrait du consentement possible à tout moment
- Lien vers la politique de confidentialité
- Horodatage du consentement conservé
