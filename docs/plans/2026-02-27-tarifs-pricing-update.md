# Tarifs Pricing Update — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update pricing for Membre (249$/mo → 199$/mo annual) and Expert/Membre Expert (879$/mo → 699$/mo annual) plans, keeping internal PlanId unchanged.

**Architecture:** Data-only change across 2 source files (stripe.ts, TarifsPage.tsx). The i18n files already display "Membre Expert" — no translation changes needed. Stripe Price IDs are placeholders until created in dashboard.

**Tech Stack:** React + TypeScript, i18next, Stripe

---

### Task 1: Update CAD prices in PLANS (stripe.ts)

**Files:**
- Modify: `src/lib/stripe.ts:42-58`

**Step 1: Update member plan prices**

In `src/lib/stripe.ts`, change the `member` entry in the `PLANS` object:

```typescript
  member: {
    id: 'member',
    monthlyPrice: 249,
    yearlyPrice: 2388,
    monthlyPriceId: 'price_1T3nfmGxmyz5JooX0eHr5UID',
    yearlyPriceId: 'price_1T3nfnGxmyz5JooXt3KF9w7O',
    maxMembers: 10,
    maxAiSystems: null,
    highlighted: true,
    badgeColor: 'brand-purple',
  },
```

Old values: `monthlyPrice: 149`, `yearlyPrice: 1430`
New values: `monthlyPrice: 249`, `yearlyPrice: 2388`

**Step 2: Update expert plan prices**

In the same file, change the `expert` entry:

```typescript
  expert: {
    id: 'expert',
    monthlyPrice: 879,
    yearlyPrice: 8388,
    monthlyPriceId: 'price_1T3nfoGxmyz5JooXGE1vzOMQ',
    yearlyPriceId: 'price_1T3nfpGxmyz5JooXrBWeSha0',
    maxMembers: null,
    maxAiSystems: null,
    badgeColor: 'amber-500',
  },
```

Old values: `monthlyPrice: 499`, `yearlyPrice: 4790`
New values: `monthlyPrice: 879`, `yearlyPrice: 8388`

> Note: Stripe Price IDs are kept as-is for now — they must be updated after creating new prices in Stripe dashboard.

---

### Task 2: Update CURRENCY_PRICES in stripe.ts

**Files:**
- Modify: `src/lib/stripe.ts:88-107`

**Step 1: Update CAD currency prices**

Replace the CAD section of `CURRENCY_PRICES`:

```typescript
  CAD: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 249, yearly: 2388 },
    expert:   { monthly: 879, yearly: 8388 },
    honorary: { monthly: 0, yearly: 0 },
  },
```

Old: member `{ monthly: 149, yearly: 1430 }`, expert `{ monthly: 499, yearly: 4790 }`

**Step 2: Update EUR currency prices**

Replace the EUR section:

```typescript
  EUR: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 149, yearly: 1430 },
    expert:   { monthly: 529, yearly: 4990 },
    honorary: { monthly: 0, yearly: 0 },
  },
```

Old: member `{ monthly: 89, yearly: 858 }`, expert `{ monthly: 299, yearly: 2868 }`

**Step 3: Update USD currency prices**

Replace the USD section:

```typescript
  USD: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 169, yearly: 1590 },
    expert:   { monthly: 589, yearly: 5590 },
    honorary: { monthly: 0, yearly: 0 },
  },
```

Old: member `{ monthly: 99, yearly: 950 }`, expert `{ monthly: 349, yearly: 3348 }`

---

### Task 3: Update JSON-LD in TarifsPage.tsx

**Files:**
- Modify: `src/pages/TarifsPage.tsx:254-268`

**Step 1: Update JSON-LD structured data prices**

Change the Membre offer price and rename Expert to Membre Expert:

```tsx
          {
            "@type": "Offer",
            "name": "Membre",
            "price": "249",
            "priceCurrency": "CAD",
            "availability": "https://schema.org/InStock",
            "description": "Accès complet aux ressources et événements",
          },
          {
            "@type": "Offer",
            "name": "Membre Expert",
            "price": "879",
            "priceCurrency": "CAD",
            "availability": "https://schema.org/InStock",
            "description": "Accès premium avec accompagnement personnalisé",
          },
```

Old: Membre `"price": "149"`, Expert `"price": "499"` with `"name": "Expert"`

---

### Task 4: Verify display and build

**Step 1: Run the dev server**

```bash
cd gouvernance && npm run dev
```

**Step 2: Verify visually in browser**

Open `http://localhost:5173/tarifs` and verify:
- Monthly toggle shows: Membre = 249$, Membre Expert = 879$
- Yearly toggle shows: Membre = 199$/mois, Membre Expert = 699$/mois
- "-20%" badge is still accurate (~20% discount for both)
- EUR selector shows correct prices (Membre = 149€, Expert = 529€)
- USD selector shows correct prices (Membre = US$169, Expert = US$589)
- "Facturé X $/an" line shows correct annual totals

**Step 3: Run TypeScript check**

```bash
cd gouvernance && npx tsc --noEmit
```

Expected: No errors (data-only changes, no type changes)

---

### Task 5: Commit

**Step 1: Stage and commit**

```bash
git add src/lib/stripe.ts src/pages/TarifsPage.tsx
git commit -m "feat(tarifs): update pricing — Membre 249/199, Expert 879/699"
```

---

## Summary of all changes

| File | What changes |
|------|-------------|
| `src/lib/stripe.ts:42-58` | PLANS: monthlyPrice & yearlyPrice for member and expert |
| `src/lib/stripe.ts:88-107` | CURRENCY_PRICES: CAD, EUR, USD prices for member and expert |
| `src/pages/TarifsPage.tsx:254-268` | JSON-LD: price values and Expert→Membre Expert name |

## What does NOT change

- `PlanId` type stays `'expert'`
- i18n files — already show "Membre Expert" (FR) / "Expert Member" (EN)
- `effectivePlan()` logic
- Component structure, toggle, currency selector
- `-20%` badge (still accurate: ~20.1% and ~20.5%)
- BillingPage.tsx — reads from PLANS object, automatically gets new prices

## Post-deploy TODO

- [ ] Create new Stripe Price objects in dashboard with updated amounts
- [ ] Update `monthlyPriceId` and `yearlyPriceId` in stripe.ts with new Stripe Price IDs
