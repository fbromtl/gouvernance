import { useSubscription } from './useSubscription';
import type { SubscriptionPlan } from '@/types/database';

export function usePlanFeatures() {
  const { data: subscription } = useSubscription();
  const plan: SubscriptionPlan = subscription?.plan ?? 'free';

  const hasFeature = (_featureKey: string): boolean => {
    return plan === 'member' || plan === 'honorary';
  };

  return { plan, hasFeature };
}
