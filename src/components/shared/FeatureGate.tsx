import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** When true, render nothing if feature is missing (for hiding UI fragments) */
  silent?: boolean;
}

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature, plan } = usePlanFeatures();
  const navigate = useNavigate();
  const { t } = useTranslation('billing');

  // Feature is available → render children normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Silent mode → hide entirely
  if (silent) return null;

  // Preview mode → show children with blur overlay + sticky banner
  return (
    <div className="relative">
      {/* Sticky upgrade banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-brand-purple px-4 py-2.5 text-white text-sm shadow-md">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" />
          <span>{t('gate.preview')}</span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 bg-white text-brand-purple hover:bg-white/90 font-medium"
          onClick={() => navigate('/billing')}
        >
          <ArrowUpCircle className="h-4 w-4 mr-1.5" />
          {t('gate.unlock')}
        </Button>
      </div>

      {/* Content wrapper with blur overlay */}
      <div className="relative overflow-hidden select-none pointer-events-none">
        {/* Actual page content (rendered but not interactive) */}
        <div aria-hidden="true">
          {children}
        </div>

        {/* Progressive blur overlay: transparent at top, blurred at bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.3) 50%, black 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.3) 50%, black 75%)',
          }}
        />
      </div>
    </div>
  );
}
