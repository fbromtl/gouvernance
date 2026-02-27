# Tarifs Page Rework — Design

## Goal

Rework the pricing page to emphasize the "Cercle" (professional club/community) positioning and change the default pricing display to show annual billing with monthly-equivalent prices.

## Changes

### 1. Price Display Logic

**Default toggle:** `isYearly = true` (annual selected by default).

**When annual is selected:**
- Display price = `yearlyPrice ÷ 12` (monthly equivalent), rounded to nearest integer
- Suffix: `/ mois`
- Below price: gray text « Facturé XXX $/an » showing the actual annual total

**When monthly is selected:**
- Display price = `monthlyPrice` (as-is)
- Suffix: `/ mois`
- No additional line below

**Concrete examples:**

| Plan | Annual toggle | Monthly toggle |
|------|--------------|----------------|
| Observateur | **0 $** | **0 $** |
| Membre | **82 $/mois** + "Facturé 990 $/an" | **99 $/mois** |
| Expert | **415 $/mois** + "Facturé 4 990 $/an" | **499 $/mois** |

The `-17%` badge stays on the Annual toggle button. The "2 mois offerts" badge stays in the hero.

### 2. Updated Texts (Cercle/Community Tone)

**Hero subtitle:**
- Current: "L'outil de gouvernance IA le plus complet, inclus avec votre adhésion"
- New (FR): "Rejoignez une communauté de professionnels qui partagent les mêmes enjeux. Plateforme de gouvernance IA incluse avec votre adhésion."
- New (EN): "Join a community of professionals facing the same challenges. AI governance platform included with your membership."

**Plan descriptions (idealFor):**
- Observer FR: "Découvrez le Cercle et explorez la plateforme"
- Observer EN: "Discover the Circle and explore the platform"
- Member FR: "Intégrez le Cercle et ses outils complets de gouvernance"
- Member EN: "Join the Circle and its comprehensive governance tools"
- Expert FR: "Dirigez la gouvernance IA et bénéficiez d'un accompagnement dédié"
- Expert EN: "Lead AI governance with dedicated support"

**Bottom CTA subtitle:**
- New (FR): "Rejoignez des professionnels qui font face aux mêmes défis. Accédez à la plateforme, l'annuaire et le réseau d'experts."
- New (EN): "Join professionals facing the same challenges. Access the platform, directory and expert network."

### 3. Community Social Proof Banner

Add a centered, subtle banner between the hero and plan cards:

> 👥 **+150 professionnels** en gouvernance de l'IA — juristes, CISO, DPO, responsables conformité — échangent et collaborent au sein du Cercle.

**Style:** `bg-muted/30 border border-border/40 rounded-2xl`, centered text, `Users` icon, small and elegant. Not a full section — just a one-line social proof strip.

**Placement:** Inside the plan cards section, above the grid, below the `-mt-10` offset.

## Files to Modify

1. `src/pages/TarifsPage.tsx` — Price display logic + community banner
2. `src/i18n/locales/fr/billing.json` — French translation updates
3. `src/i18n/locales/en/billing.json` — English translation updates

## What Stays Unchanged

- Plan names (Observateur, Membre, Expert)
- Plan features lists
- Comparison table
- Animation variants
- Auth/subscription logic
- Stripe price IDs and plan definitions
