import { Badge } from "@/components/ui/badge";
import { getColorClass } from "@/portail/constants/colors";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  colorMap: Record<string, string>;
  value: string | undefined | null;
  label?: string;
  fallback?: string;
  className?: string;
}

export function StatusBadge({ colorMap, value, label, fallback, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(getColorClass(colorMap, value, fallback), className)}>
      {label ?? value ?? "\u2014"}
    </Badge>
  );
}
