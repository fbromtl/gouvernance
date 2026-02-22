import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSubscription } from './useSubscription';
import type { SubscriptionPlan } from '@/types/database';

interface PlanFeature {
  feature_key: string;
  enabled: boolean;
}

export function usePlanFeatures() {
  const { data: subscription } = useSubscription();
  const plan: SubscriptionPlan = subscription?.plan ?? 'free';

  const query = useQuery({
    queryKey: ['plan-features', plan],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_features')
        .select('feature_key, enabled')
        .eq('plan', plan);

      if (error) throw error;

      const map: Record<string, boolean> = {};
      for (const f of (data ?? []) as PlanFeature[]) {
        map[f.feature_key] = f.enabled;
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  const hasFeature = (featureKey: string): boolean => {
    if (!query.data) return plan === 'enterprise';
    return query.data[featureKey] ?? false;
  };

  return { ...query, plan, hasFeature };
}
