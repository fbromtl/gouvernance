# Tarifs Page Rework — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the pricing page to emphasize "Cercle" community positioning and display annual pricing as monthly-equivalent by default.

**Architecture:** Update translation files for community-tone wording, modify `TarifsPage.tsx` price display logic and add a community social proof banner. No new components or files — all changes in existing files.

**Tech Stack:** React, i18next, Tailwind CSS, Framer Motion, Lucide icons

---

### Task 1: Update French translation file

**Files:**
- Modify: `src/i18n/locales/fr/billing.json`

**What to change:**

1. Update `pricingSubtitle`:
```json
"pricingSubtitle": "Rejoignez une communauté de professionnels qui partagent les mêmes enjeux. Plateforme de gouvernance IA incluse avec votre adhésion."
```

2. Update `idealFor` object:
```json
"idealFor": {
  "observer": "Découvrez le Cercle et explorez la plateforme",
  "member": "Intégrez le Cercle et ses outils complets de gouvernance",
  "expert": "Dirigez la gouvernance IA et bénéficiez d'un accompagnement dédié"
}
```

3. Update `readySubtitle`:
```json
"readySubtitle": "Rejoignez des professionnels qui font face aux mêmes défis. Accédez à la plateforme, l'annuaire et le réseau d'experts."
```

4. Add new keys for pricing display:
```json
"billedAnnually": "Facturé {{price}} $/an"
```

5. Add new key for community banner:
```json
"communityBanner": "+150 professionnels en gouvernance de l'IA — juristes, CISO, DPO, responsables conformité — échangent et collaborent au sein du Cercle."
```

**Step 1:** Apply all 5 changes to the FR billing.json file.

**Step 2:** Commit: `feat(tarifs): update French billing translations for community tone`

---

### Task 2: Update English translation file

**Files:**
- Modify: `src/i18n/locales/en/billing.json`

**What to change:**

1. Update `pricingSubtitle`:
```json
"pricingSubtitle": "Join a community of professionals facing the same challenges. AI governance platform included with your membership."
```

2. Update `idealFor` object:
```json
"idealFor": {
  "observer": "Discover the Circle and explore the platform",
  "member": "Join the Circle and its comprehensive governance tools",
  "expert": "Lead AI governance with dedicated support"
}
```

3. Update `readySubtitle`:
```json
"readySubtitle": "Join professionals facing the same challenges. Access the platform, directory and expert network."
```

4. Add new keys for pricing display:
```json
"billedAnnually": "Billed {{price}} $/year"
```

5. Add new key for community banner:
```json
"communityBanner": "+150 AI governance professionals — lawyers, CISOs, DPOs, compliance officers — exchange and collaborate within the Circle."
```

**Step 1:** Apply all 5 changes to the EN billing.json file.

**Step 2:** Commit: `feat(tarifs): update English billing translations for community tone`

---

### Task 3: Change default toggle to annual and update price display logic

**Files:**
- Modify: `src/pages/TarifsPage.tsx`

**What to change:**

**3a.** Change the default state from `false` to `true` (line ~178 in current file):
```tsx
// BEFORE
const [isYearly, setIsYearly] = useState(false);
// AFTER
const [isYearly, setIsYearly] = useState(true);
```

**3b.** Update the `formatPrice` function to always return the monthly-equivalent price:
```tsx
// BEFORE
const formatPrice = (plan: PlanId) => {
  const p = PLANS[plan];
  return isYearly ? p.yearlyPrice : p.monthlyPrice;
};

// AFTER
const formatPrice = (plan: PlanId) => {
  const p = PLANS[plan];
  if (isYearly) {
    return p.yearlyPrice > 0 ? Math.round(p.yearlyPrice / 12) : 0;
  }
  return p.monthlyPrice;
};
```

**3c.** Update the price display block in the plan card JSX. Find the `{/* Price */}` section and replace it. The price suffix should always show `/ mois` (except for $0 plans). Below the price, when `isYearly` is true, show the annual total in gray:

```tsx
{/* Price */}
<div className="mb-6">
  {config.id === "expert" && (
    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
      {t("startingAt")}
    </span>
  )}
  <div className="flex items-baseline gap-1 mt-0.5">
    <span className="text-4xl font-extrabold text-foreground tracking-tight">
      {price === 0 ? "$0" : `$${price}`}
    </span>
    {price > 0 && (
      <span className="text-sm text-muted-foreground font-medium">
        {t("month")}
      </span>
    )}
  </div>
  {isYearly && price > 0 && (
    <p className="text-xs text-muted-foreground mt-1">
      {t("billedAnnually", { price: PLANS[config.id].yearlyPrice.toLocaleString() })}
    </p>
  )}
</div>
```

Note: The previous yearly discount text (`t("yearlyDiscount")` shown when `isYearly && price > 0`) is replaced by the `billedAnnually` text. The discount badge already appears on the toggle button, so we don't need it twice.

**Step 1:** Apply changes 3a, 3b, 3c.

**Step 2:** Run `npx tsc --noEmit` — expect zero errors.

**Step 3:** Commit: `feat(tarifs): default to annual pricing with monthly-equivalent display`

---

### Task 4: Add community social proof banner

**Files:**
- Modify: `src/pages/TarifsPage.tsx`

**What to add:**

Inside the plan cards `<section>`, between `<div className="mx-auto max-w-7xl ...">` and the `<motion.div variants={containerVariants}>` grid, add a community social proof banner:

```tsx
{/* Community social proof */}
<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="mx-auto max-w-2xl text-center mb-10"
>
  <div className="inline-flex items-center gap-2 rounded-2xl bg-muted/30 border border-border/40 px-5 py-3">
    <Users className="size-4 text-brand-purple shrink-0" />
    <p className="text-sm text-muted-foreground">
      {t("communityBanner")}
    </p>
  </div>
</motion.div>
```

The `Users` icon is already imported at the top of the file (`import { ..., Users, ... } from "lucide-react"`).

**Step 1:** Add the banner JSX in the correct position.

**Step 2:** Run `npx tsc --noEmit` — expect zero errors.

**Step 3:** Visual verification via dev server (port 5173):
- Navigate to `/tarifs`
- Verify: annual toggle selected by default
- Verify: Membre shows "$82 /mois" with "Facturé 990 $/an" below
- Verify: Expert shows "$415 /mois" with "Facturé 4 990 $/an" below
- Verify: community banner visible above plan cards
- Verify: switching to monthly shows "$99 /mois" and "$499 /mois" without annual note
- Verify: hero subtitle mentions "communauté de professionnels"
- Verify: bottom CTA subtitle mentions "mêmes défis"

**Step 4:** Commit: `feat(tarifs): add community social proof banner`

---

### Task 5: Final build verification and push

**Step 1:** Run `npm run build` — expect zero errors.

**Step 2:** Push all commits to remote: `git push`
