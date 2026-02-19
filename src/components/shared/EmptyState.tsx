import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-5 shadow-sm">
        <Icon className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold mb-1.5 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
