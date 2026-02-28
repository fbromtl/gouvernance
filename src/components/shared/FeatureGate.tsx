import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { useCreateCheckout } from '@/hooks/useSubscription';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** When true, render nothing if feature is missing (for hiding UI fragments) */
  silent?: boolean;
}

const TRIAL_FEATURES = [
  'trialFeature1',
  'trialFeature2',
  'trialFeature3',
  'trialFeature4',
] as const;

const PRICES = { monthly: 99, yearly: 990 } as const;

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature } = usePlanFeatures();
  const { t } = useTranslation('billing');
  const { profile } = useAuth();
  const checkout = useCreateCheckout();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Feature is available -> render children normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Silent mode -> hide entirely
  if (silent) return null;

  const price = PRICES[period];

  const handleTrial = () => {
    if (!profile?.organization_id) return;
    checkout.mutate(
      {
        plan: 'member',
        period,
        organizationId: profile.organization_id,
        trialDays: 15,
      },
      {
        onSuccess: (url) => {
          window.location.href = url;
        },
      },
    );
  };

  // Preview mode -> show children with blur + centered trial modal
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

      {/* Centered trial modal */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md mx-4 bg-white rounded-2xl border border-neutral-100 shadow-xl shadow-neutral-200/50 p-8 text-center">
          {/* Lock icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ab54f3]/10">
            <Lock className="h-7 w-7 text-[#ab54f3]" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            {t('gate.title')}
          </h3>

          {/* Subtitle */}
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
            {t('gate.trialSubtitle')}
          </p>

          {/* Features list */}
          <ul className="mt-5 space-y-2 text-left">
            {TRIAL_FEATURES.map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {t(`gate.${key}`)}
              </li>
            ))}
          </ul>

          {/* Period toggle */}
          <div className="mt-6 inline-flex items-center rounded-full bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                period === 'monthly'
                  ? 'bg-[#ab54f3] text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t('gate.toggleMonthly')}
            </button>
            <button
              type="button"
              onClick={() => setPeriod('yearly')}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                period === 'yearly'
                  ? 'bg-[#ab54f3] text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t('gate.toggleYearly')}
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                {t('gate.discount')}
              </span>
            </button>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="text-2xl font-bold text-neutral-900">
              {period === 'monthly'
                ? t('gate.priceMonthly', { price })
                : t('gate.priceYearly', { price })}
            </span>
            <p className="mt-1 text-xs text-neutral-400">{t('gate.afterTrial')}</p>
          </div>

          {/* CTA button */}
          <Button
            className="mt-6 w-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] text-white rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all font-semibold"
            onClick={handleTrial}
            disabled={checkout.isPending}
          >
            {checkout.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t('gate.trialCta')}
          </Button>

          {/* Reassurance */}
          <p className="mt-3 text-[11px] text-neutral-400">
            {t('gate.trialReassurance')}
          </p>
        </div>
      </div>
    </div>
  );
}
