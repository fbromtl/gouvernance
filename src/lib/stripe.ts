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

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PlanDefinition {
  id: PlanId;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  maxMembers: number | null;  // null = unlimited
  maxAiSystems: number | null;
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxMembers: 1,
    maxAiSystems: 3,
  },
  pro: {
    id: 'pro',
    monthlyPrice: 99,
    yearlyPrice: 990,
    maxMembers: 10,
    maxAiSystems: null,
    highlighted: true,
  },
  enterprise: {
    id: 'enterprise',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    maxMembers: null,
    maxAiSystems: null,
  },
};
