# FeatureGate Free Trial — Design

**Date** : 2026-02-26
**Statut** : Approuve

## Objectif

Transformer la fenetre FeatureGate en modale de conversion avec essai gratuit 15 jours du plan Membre, toggle mensuel/annuel, et bouton Stripe checkout direct.

## Decisions cles

- **Plan trial** : Membre (99$/mois)
- **Carte** : Collectee des le debut via Stripe (facturation apres 15 jours)
- **Periode** : Toggle mensuel (99$/mois) / annuel (990$/an, -17%) dans la modale
- **Approche** : FeatureGate enrichi (tout dans le composant, pas de page intermediaire)

## Fenetre FeatureGate amelioree

### Structure visuelle

```
+-------------------------------------+
|          Lock icon (purple)          |
|                                      |
|      Reserve aux Membres             |
|                                      |
|   Debloquez toutes les               |
|   fonctionnalites pendant 15 jours   |
|                                      |
|   check Evaluations de risques       |
|   check Conformite & audits          |
|   check Gestion des incidents        |
|   check Export PDF & chat IA         |
|                                      |
|      [Mensuel] [Annuel -17%]         |
|                                      |
|      99$/mois                        |
|      apres l'essai gratuit           |
|                                      |
|   [Essayer gratuitement 15 jours]    |
|                                      |
|   Aucun paiement avant 15 jours      |
|   Annulez a tout moment              |
+-------------------------------------+
```

### Comportement

- Toggle mensuel/annuel : state local, prix affiche change dynamiquement
- Bouton CTA : appelle `useCreateCheckout` avec `plan: 'member'`, `period: selected`, `trialDays: 15`
- Redirect vers Stripe Checkout avec trial active (carte collectee, pas debitee)
- Loading state sur le bouton pendant la creation de la session

### Style

- Meme conteneur que l'actuel : `bg-white rounded-2xl border border-neutral-100 shadow-xl`
- `max-w-md` (un peu plus large pour le contenu supplementaire)
- Features list : `Check` icon en `text-emerald-500`, texte en `text-neutral-700`
- Toggle : pills arrondies, active = `bg-[#ab54f3] text-white`, inactive = `bg-neutral-100 text-neutral-500`
- Badge `-17%` en `bg-emerald-50 text-emerald-600 text-[10px] rounded-full`
- Prix : `text-2xl font-bold text-neutral-900`
- Reassurance : `text-[11px] text-neutral-400`

## Backend — Stripe checkout avec trial

### Edge function `stripe-checkout`

Accepter `trial_period_days` (optionnel, number) dans le body JSON.

Quand present, passer a Stripe :
```ts
subscription_data: {
  trial_period_days: body.trial_period_days,
  metadata: { organization_id }
}
```

### Hook `useCreateCheckout`

Ajouter `trialDays?: number` au type d'input. Passer comme `trial_period_days` dans le body fetch.

### Webhook

Aucun changement — `checkout.session.completed` gere deja le statut `trialing` de Stripe.
Aucune migration DB — le type `subscription_status` inclut deja `'trialing'`.

## i18n — nouvelles cles

### FR (`billing.json` > `gate`)

```json
{
  "trialSubtitle": "Debloquez toutes les fonctionnalites pendant 15 jours",
  "trialFeatures": ["Evaluations de risques", "Conformite & audits", "Gestion des incidents", "Export PDF & chat IA"],
  "trialCta": "Essayer gratuitement 15 jours",
  "trialReassurance": "Aucun paiement avant 15 jours - Annulez a tout moment",
  "priceMonthly": "{{price}}$/mois",
  "priceYearly": "{{price}}$/an",
  "afterTrial": "apres l'essai gratuit",
  "discount": "-17%"
}
```

### EN (`billing.json` > `gate`)

Memes cles traduites en anglais.

## Fichiers concernes

### Modifies (4)
- `src/components/shared/FeatureGate.tsx` — modale enrichie
- `src/hooks/useSubscription.ts` — `trialDays` param
- `supabase/functions/stripe-checkout/index.ts` — `trial_period_days`
- `src/i18n/locales/fr/billing.json` + `en/billing.json` — nouvelles cles
