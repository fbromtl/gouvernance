# Design : Tarifs + Stripe + BillingPage

**Date :** 2026-03-05
**Scope :** Mise à jour des prix Stripe, synchronisation des price IDs, redesign BillingPage

## Contexte

Les price IDs dans le code pointent vers un ancien compte Stripe. Le nouveau compte a des produits "Cercle - Membre" et "Cercle - Membre Expert" mais avec des prix incorrects (99$/499$ au lieu de 249$/879$). La BillingPage du portail affiche les prix en € au lieu de $ et a un design basique qui ne correspond pas au style soigné de la page tarifs publique.

## Décisions

- **Prix officiels :** Membre 249$/mo (2 388$/an), Expert 879$/mo (8 388$/an) en CAD
- **Approche design :** Adaptation au portail — reprendre le style des cartes TarifsPage sur fond blanc

## Plan d'implémentation

### 1. Stripe — Créer les bons prix

Créer 4 prix CAD via MCP Stripe sur les produits existants :
- `prod_U29kfNe56YD8xU` (Membre) : 24900 cents/mo + 238800 cents/an
- `prod_U29kOEpK4yhOUq` (Expert) : 87900 cents/mo + 838800 cents/an

### 2. stripe.ts — Mettre à jour les price IDs

Remplacer les 4 price IDs obsolètes par les nouveaux.

### 3. stripe-checkout edge function — Mettre à jour les fallbacks

Mêmes 4 price IDs dans les fallbacks hardcodés.

### 4. BillingPage — Redesign

- Fix € → CA$ pour l'affichage des prix
- Cartes plans style TarifsPage : icônes (Eye/Users/Crown), bordure verte Membre, badge "Recommandé"
- Toggle mensuel/annuel en pill buttons
- 3 colonnes toujours (Observer, Membre, Expert)
- Features list avec check icons verts

## Fichiers impactés

- `src/lib/stripe.ts`
- `src/portail/pages/BillingPage.tsx`
- `supabase/functions/stripe-checkout/index.ts`
