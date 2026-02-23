import { usePlanFeatures } from './usePlanFeatures';

/**
 * Returns whether a feature should render in preview (read-only) mode.
 * Preview mode = user lacks the feature but we still show demo content
 * with a blur overlay and upgrade banner.
 */
export function useFeaturePreview(feature: string) {
  const { hasFeature, plan } = usePlanFeatures();
  const isPreview = !hasFeature(feature);
  const requiredPlan = plan === 'observer' ? 'Membre' : 'Membre Expert';
  return { isPreview, requiredPlan, plan };
}
