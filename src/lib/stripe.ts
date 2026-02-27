import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise ?? Promise.resolve(null);
}

export const stripeConfigured = Boolean(stripePublishableKey);

/* ------------------------------------------------------------------ */
/*  Plan definitions (shared between pricing page & billing page)      */
/* ------------------------------------------------------------------ */

export type PlanId = 'observer' | 'member' | 'expert' | 'honorary';

export interface PlanDefinition {
  id: PlanId;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  maxMembers: number | null;
  maxAiSystems: number | null;
  highlighted?: boolean;
  badgeColor?: string;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  observer: {
    id: 'observer',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxMembers: 1,
    maxAiSystems: 3,
  },
  member: {
    id: 'member',
    monthlyPrice: 99,
    yearlyPrice: 950,
    monthlyPriceId: 'price_1T3nfmGxmyz5JooX0eHr5UID',
    yearlyPriceId: 'price_1T3nfnGxmyz5JooXt3KF9w7O',
    maxMembers: 10,
    maxAiSystems: null,
    highlighted: true,
    badgeColor: 'brand-purple',
  },
  expert: {
    id: 'expert',
    monthlyPrice: 499,
    yearlyPrice: 4790,
    monthlyPriceId: 'price_1T3nfoGxmyz5JooXGE1vzOMQ',
    yearlyPriceId: 'price_1T3nfpGxmyz5JooXrBWeSha0',
    maxMembers: null,
    maxAiSystems: null,
    badgeColor: 'amber-500',
  },
  honorary: {
    id: 'honorary',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxMembers: null,
    maxAiSystems: null,
    badgeColor: 'slate-400',
  },
};

/** Plans that can be purchased via Stripe (excludes honorary) */
export const PURCHASABLE_PLANS: PlanId[] = ['observer', 'member', 'expert'];

/** honorary gets same access as expert */
export function effectivePlan(plan: PlanId): PlanId {
  return plan === 'honorary' ? 'expert' : plan;
}

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
    member:   { monthly: 59, yearly: 588 },
    expert:   { monthly: 299, yearly: 2868 },
    honorary: { monthly: 0, yearly: 0 },
  },
  USD: {
    observer: { monthly: 0, yearly: 0 },
    member:   { monthly: 69, yearly: 660 },
    expert:   { monthly: 349, yearly: 3348 },
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
