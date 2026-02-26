import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const { t } = useTranslation('billing');

  // Feature is available → render children normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Silent mode → hide entirely
  if (silent) return null;

  // Preview mode → show children with blur + centered upgrade dialog
  return (
    <div className="relative">
      {/* Content wrapper with blur overlay */}
      <div className="relative overflow-hidden select-none pointer-events-none">
        <div aria-hidden="true">
          {children}
        </div>

        {/* Full blur overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            background: 'rgba(255,255,255,0.4)',
          }}
        />
      </div>

      {/* Centered upgrade dialog */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm mx-4 bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-neutral-200/50 p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ab54f3]/10">
            <Lock className="h-7 w-7 text-[#ab54f3]" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            {t('gate.title')}
          </h3>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
            {t('gate.preview')}
          </p>
          <Button
            className="mt-6 w-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] text-white rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all font-semibold"
            onClick={() => navigate('/billing')}
          >
            {t('gate.unlock')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
