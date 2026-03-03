import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/stripe";

interface MemberBadgeProps {
  plan: PlanId;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BADGE_STYLES: Record<string, string> = {
  member: "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
  expert: "bg-amber-100 text-amber-700 border-amber-300",
  honorary: "bg-slate-200 text-slate-700 border-slate-300 shadow-inner",
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0 h-4",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
};

export function MemberBadge({ plan, size = "md", className }: MemberBadgeProps) {
  const { t } = useTranslation("members");

  // Observer gets no badge
  if (plan === "observer") return null;

  const style = BADGE_STYLES[plan] ?? BADGE_STYLES.member;

  return (
    <Badge
      variant="outline"
      className={cn(style, SIZE_CLASSES[size], "font-bold tracking-wide", className)}
    >
      {t(`badge.${plan}`)}
    </Badge>
  );
}
