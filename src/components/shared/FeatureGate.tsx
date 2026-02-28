import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** When true, render nothing if feature is missing (for hiding UI fragments) */
  silent?: boolean;
}

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature } = usePlanFeatures();
  const navigate = useNavigate();

  const allowed = hasFeature(feature);

  // Redirect observers to the membership page
  useEffect(() => {
    if (!allowed && !silent) {
      navigate('/adhesion', { replace: true });
    }
  }, [allowed, silent, navigate]);

  // Feature is available -> render children normally
  if (allowed) {
    return <>{children}</>;
  }

  // Silent mode -> hide entirely
  if (silent) return null;

  // Redirect is pending, render nothing
  return null;
}
