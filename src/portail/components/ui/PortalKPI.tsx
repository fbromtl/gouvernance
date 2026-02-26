import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";

interface PortalKPIProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  href?: string;
  trend?: "up" | "down" | "neutral" | null;
}

const TrendIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus };

export function PortalKPI({ icon: Icon, label, value, color, bgColor, href, trend }: PortalKPIProps) {
  const TIcon = trend ? TrendIcon[trend] : null;

  const content = (
    <div className="group relative overflow-hidden bg-white rounded-xl border border-neutral-100 p-5 hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {TIcon && (
          <TIcon
            className={cn(
              "h-4 w-4",
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-neutral-300",
            )}
          />
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-neutral-900">{value}</p>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{label}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#ab54f3]/40 group-hover:w-full transition-all duration-500" />
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}
