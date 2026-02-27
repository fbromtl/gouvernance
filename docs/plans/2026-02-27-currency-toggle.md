# Currency Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a CAD/EUR/USD currency selector to the pricing page with fixed prices per currency and auto-detection from browser language.

**Architecture:** Add a `CURRENCY_PRICES` lookup in `stripe.ts`, a `currency` state in `TarifsPage`, a `detectCurrency()` helper, and a small pill selector UI below the billing toggle. The `formatPrice` and `billedAnnually` display adapt to the selected currency. Display-only — Stripe checkout stays CAD.

**Tech Stack:** React, TypeScript, Tailwind CSS, i18next, Framer Motion (existing stack)

---

### Task 1: Add currency types and price data to stripe.ts

**Files:**
- Modify: `src/lib/stripe.ts`

**Step 1: Add Currency type, CURRENCY_PRICES map, detectCurrency helper, and formatCurrencySymbol helper**

Add after the existing `PLANS` export (after line 71):

```ts
/* ------------------------------------------------------------------ */
/*  Multi-currency display prices (display-only, Stripe stays CAD)     */
/* ------------------------------------------------------------------ */

export type Currency = 'CAD' | 'EUR' | 'USD';

/** Fixed display prices per currency. CAD = source of truth. */
export const CURRENCY_PRICES: Record<Currency, Record<PlanId, { monthly: number; yearly: number }>> = {
  CAD: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 99, yearly: 950 },
    expert:   { monthly: 499, yearly: 4790 },
    honorary: { monthly: 0, yearly: 0 },
  },
  EUR: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 69, yearly: 690 },
    expert:   { monthly: 369, yearly: 3490 },
    honorary: { monthly: 0, yearly: 0 },
  },
  USD: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 75, yearly: 720 },
    expert:   { monthly: 379, yearly: 3590 },
    honorary: { monthly: 0, yearly: 0 },
  },
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'CA$',
  EUR: '€',
  USD: 'US$',
};

export function currencySymbol(c: Currency): string {
  return CURRENCY_SYMBOLS[c];
}

/** Auto-detect currency from navigator.language */
export function detectCurrency(): Currency {
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'fr-CA').toLowerCase();
  // European locales → EUR
  if (/^(fr-fr|de|it|es|nl|pt|fr-be|fr-ch)/.test(lang)) return 'EUR';
  // English (non-Canadian) → USD
  if (/^en(?!-ca)/.test(lang)) return 'USD';
  // fr-CA, en-CA, fr (no region), everything else → CAD
  return 'CAD';
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with zero errors.

**Step 3: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "feat(tarifs): add multi-currency types and price data"
```

---

### Task 2: Update translation files for currency-aware labels

**Files:**
- Modify: `src/i18n/locales/fr/billing.json`
- Modify: `src/i18n/locales/en/billing.json`

**Step 1: Update FR translations**

Replace `"billedAnnually"` line and add currency key:

```json
"billedAnnually": "Facturé {{price}} {{symbol}}/an",
```

This replaces the current `"billedAnnually": "Facturé {{price}} $/an"` — we pass `symbol` dynamically now.

**Step 2: Update EN translations**

Replace `"billedAnnually"` line:

```json
"billedAnnually": "Billed {{price}} {{symbol}}/year",
```

This replaces the current `"billedAnnually": "Billed {{price}} $/year"`.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with zero errors.

**Step 4: Commit**

```bash
git add src/i18n/locales/fr/billing.json src/i18n/locales/en/billing.json
git commit -m "feat(tarifs): make billedAnnually translation currency-aware"
```

---

### Task 3: Add currency state, selector UI, and update formatPrice in TarifsPage

**Files:**
- Modify: `src/pages/TarifsPage.tsx`

This is the main task. Several changes in one file:

**Step 1: Add imports**

Update the import from `@/lib/stripe` (line 11) to also import `CURRENCY_PRICES`, `Currency`, `currencySymbol`, `detectCurrency`:

```tsx
import { PLANS, CURRENCY_PRICES, type PlanId, type Currency, currencySymbol, detectCurrency } from "@/lib/stripe";
```

**Step 2: Add currency state**

After line 198 (`const [isYearly, setIsYearly] = useState(true);`), add:

```tsx
const [currency, setCurrency] = useState<Currency>(detectCurrency);
```

Note: pass the function reference `detectCurrency` (no parentheses) as the lazy initializer to avoid calling it on every render.

**Step 3: Update `formatPrice` function**

Replace the existing `formatPrice` function (lines 205-211) with:

```tsx
const formatPrice = (plan: PlanId) => {
  const prices = CURRENCY_PRICES[currency][plan];
  if (isYearly) {
    return prices.yearly > 0 ? Math.round(prices.yearly / 12) : 0;
  }
  return prices.monthly;
};
```

**Step 4: Add currency selector UI**

After the closing `</motion.div>` of the billing toggle (after line 344), add:

```tsx
          {/* Currency Selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 inline-flex items-center gap-0.5 rounded-full bg-white/5 border border-white/10 p-0.5"
          >
            {(["CAD", "EUR", "USD"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                  currency === c
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {c}
              </button>
            ))}
          </motion.div>
```

**Step 5: Update price display in plan cards**

Replace the hardcoded `$` in the price display. Find line 438:

```tsx
{price === 0 ? "$0" : `$${price}`}
```

Replace with:

```tsx
{price === 0 ? `${currencySymbol(currency)}0` : `${currencySymbol(currency)}${price}`}
```

**Step 6: Update billedAnnually to pass currency symbol**

Find the `billedAnnually` call (line 449):

```tsx
t("billedAnnually", { price: PLANS[config.id].yearlyPrice.toLocaleString() })
```

Replace with:

```tsx
t("billedAnnually", { price: CURRENCY_PRICES[currency][config.id].yearly.toLocaleString(), symbol: currencySymbol(currency) })
```

**Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds with zero errors.

**Step 8: Commit**

```bash
git add src/pages/TarifsPage.tsx
git commit -m "feat(tarifs): add currency toggle with CAD/EUR/USD selector"
```

---

### Task 4: Visual verification and push

**Step 1: Start dev server and navigate to /tarifs**

Verify on the preview:
- Default currency matches browser language (likely CAD for fr-CA)
- Toggle between CAD / EUR / USD — prices update correctly
- Toggle between Mensuel / Annuel — prices update correctly
- Combined: EUR + Annuel shows `€58/mois` with `Facturé 690 €/an` for Membre
- Observer always shows `CA$0` / `€0` / `US$0`
- Currency selector is visually smaller/subtler than billing toggle

**Step 2: Push**

```bash
git push
```
