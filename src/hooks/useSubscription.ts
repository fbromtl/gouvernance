import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { SubscriptionPlan, BillingPeriod, SubscriptionStatus } from '@/types/database';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  billing_period: BillingPeriod | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  FETCH CURRENT ORG SUBSCRIPTION                                     */
/* ------------------------------------------------------------------ */

export function useSubscription() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ['subscription', orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Subscription) ?? null;
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  CREATE STRIPE CHECKOUT SESSION                                     */
/* ------------------------------------------------------------------ */

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (params: {
      plan: SubscriptionPlan;
      period: BillingPeriod;
      organizationId: string;
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: params.plan,
          period: params.period,
          organization_id: params.organizationId,
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create checkout');
      }

      const { url } = await res.json();
      return url as string;
    },
  });
}

/* ------------------------------------------------------------------ */
/*  OPEN STRIPE CUSTOMER PORTAL                                        */
/* ------------------------------------------------------------------ */

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_id: organizationId,
          return_url: `${window.location.origin}/billing`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to open portal');
      }

      const { url } = await res.json();
      return url as string;
    },
  });
}
