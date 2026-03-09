import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureGate } from "@/components/shared/FeatureGate";

interface PortalPageProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  helpNs?: string;
  badge?: string;
  actions?: ReactNode;
  /** When set, wraps the page in a FeatureGate */
  feature?: string;
  children: ReactNode;
}

export function PortalPage({
  title,
  description,
  icon,
  helpNs,
  badge,
  actions,
  feature,
  children,
}: PortalPageProps) {
  const content = (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        helpNs={helpNs}
        badge={badge}
        actions={actions}
      />
      {children}
    </div>
  );

  if (feature) {
    return <FeatureGate feature={feature}>{content}</FeatureGate>;
  }

  return content;
}
