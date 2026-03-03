import { type ReactNode, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActionGateProps {
  children: ReactNode;
  /** Optional feature key — if omitted, gates on plan === 'free' */
  feature?: string;
}

/**
 * Wraps an action button. If the user is on the free plan,
 * the button is visually dimmed and clicking shows a tooltip
 * prompting upgrade.
 */
export function ActionGate({ children, feature }: ActionGateProps) {
  const { plan, hasFeature } = usePlanFeatures();
  const { t } = useTranslation('billing');

  const isLocked = feature ? !hasFeature(feature) : plan === 'free';

  if (!isLocked) return <>{children}</>;

  const handleBlock = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex cursor-not-allowed"
          onClick={handleBlock}
          onPointerDown={handleBlock}
        >
          <span className="pointer-events-none opacity-50">
            {children}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="flex items-center gap-1.5 text-xs"
      >
        <Lock className="h-3 w-3" />
        {t('actionGate.tooltip')}
      </TooltipContent>
    </Tooltip>
  );
}
