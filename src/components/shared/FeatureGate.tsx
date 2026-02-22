import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  silent?: boolean;
}

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature, plan } = usePlanFeatures();
  const navigate = useNavigate();
  const { t } = useTranslation('billing');

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (silent) return null;

  const requiredPlan = plan === 'free' ? 'Pro' : 'Entreprise';

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-brand-purple" />
          </div>
          <h3 className="text-xl font-semibold">{t('gate.title')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('gate.description', { plan: requiredPlan })}
          </p>
          <Button
            onClick={() => navigate('/billing')}
            className="bg-brand-purple hover:bg-brand-purple-dark text-white"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            {t('gate.upgrade')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
