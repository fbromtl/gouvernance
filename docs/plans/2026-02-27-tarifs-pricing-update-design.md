# Design: Mise a jour des prix et renommage du plan Expert

**Date:** 2026-02-27
**Statut:** Approuve

## Objectif

Mettre a jour les prix de la page Tarifs et renommer le plan "Expert" en "Membre Expert".

## Nouveaux prix (CAD)

| Plan | Mensuel (sans engagement) | Annuel (/mois) | Annuel (total) | Remise |
|------|--------------------------|----------------|----------------|--------|
| Observateur | 0 $ | 0 $ | 0 $ | -- |
| Membre | 249 $ | 199 $ | 2 388 $ | ~20,1 % |
| Membre Expert | 879 $ | 699 $ | 8 388 $ | ~20,5 % |
| Honoraire | 0 $ | 0 $ | 0 $ | -- |

## Prix multi-devises (affichage seulement)

| Plan | EUR (mo) | EUR (an) | USD (mo) | USD (an) |
|------|---------|---------|---------|---------|
| Membre | 149 | 1 430 | 169 | 1 590 |
| Membre Expert | 529 | 4 990 | 589 | 5 590 |

## Approche choisie: Changement minimal (A)

- Mettre a jour les prix dans `src/lib/stripe.ts` (PLANS + CURRENCY_PRICES)
- Renommer l'affichage "Expert" -> "Membre Expert" dans `TarifsPage.tsx` et i18n
- Garder le `PlanId = 'expert'` interne inchange (pas de migration DB)
- Mettre a jour le JSON-LD (schema.org) dans TarifsPage
- Mettre a jour les Stripe Price IDs (a creer dans le dashboard Stripe)

## Fichiers a modifier

1. **`src/lib/stripe.ts`** -- Prix CAD dans PLANS, prix EUR/USD dans CURRENCY_PRICES
2. **`src/pages/TarifsPage.tsx`** -- Affichage "Membre Expert", JSON-LD, badge remise
3. **Fichiers i18n** (`locales/fr/`, `locales/en/`) -- Labels du plan Expert si presents

## Ce qui ne change PAS

- Le type `PlanId` reste `'expert'`
- Les plans Observer et Honoraire
- La logique `effectivePlan()`
- La structure du composant et le toggle mensuel/annuel
