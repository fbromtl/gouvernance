# Currency Toggle — Tarifs Page

## Summary

Add a EUR / USD / CAD currency selector to the pricing page. Prices are fixed per currency (no live conversion). Default currency is auto-detected from `navigator.language`.

## Price Grid

| Plan | CAD monthly | CAD yearly | EUR monthly | EUR yearly | USD monthly | USD yearly |
|------|-------------|------------|-------------|------------|-------------|------------|
| Observer | 0 | 0 | 0 | 0 | 0 | 0 |
| Member | $99 | $950 | 69 € | 690 € | $75 | $720 |
| Expert | $499 | $4,790 | 369 € | 3,490 € | $379 | $3,590 |

Annual discount ~20% maintained across all currencies.

## UI Placement

Small pill selector (`CAD | EUR | USD`) below the Monthly/Annual toggle in the hero section. Secondary styling (smaller, muted).

## Currency Detection

Based on `navigator.language`:
- `fr-FR`, `de`, `it`, `es`, `nl`, `pt` → EUR
- `en-US`, `en-GB`, `en` (no region) → USD
- `fr-CA`, `en-CA`, `fr` (no region), fallback → CAD

## Symbols

- CAD: `CA$` (or `$` when context is clear)
- USD: `US$`
- EUR: `€`

## Files to Modify

1. **`src/lib/stripe.ts`** — Add `CurrencyPrices` type and price data per currency per plan
2. **`src/pages/TarifsPage.tsx`** — Add `currency` state, detector, selector UI, update `formatPrice`
3. **`src/i18n/locales/fr/billing.json`** + **`en/billing.json`** — Currency label keys

## Notes

- Toggle is display-only. Stripe checkout still processes in CAD.
- No backend changes required.
