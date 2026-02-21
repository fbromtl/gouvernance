import type { ReactNode } from "react";
import { SectionHelpButton } from "./SectionHelpButton";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  /** i18n namespace for contextual help dialog (e.g. "dashboard") */
  helpNs?: string;
}

export function PageHeader({ title, description, actions, icon: Icon, helpNs }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/10 mt-0.5">
            <Icon className="h-5 w-5 text-brand-purple" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {helpNs && <SectionHelpButton ns={helpNs} />}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 mt-3 sm:mt-0">{actions}</div>}
    </div>
  );
}
