import { cn } from "@/lib/utils";
import { PortalCardHeader } from "./PortalCardHeader";

interface PortalChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  minHeight?: string;
}

export function PortalChartContainer({
  title,
  children,
  className,
  action,
  minHeight = "320px",
}: PortalChartContainerProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-neutral-100 flex flex-col",
        className,
      )}
      style={{ minHeight }}
    >
      <div className="p-5 pb-0">
        <PortalCardHeader action={action}>{title}</PortalCardHeader>
      </div>
      <div className="flex-1 p-3 pt-0">
        {children}
      </div>
    </div>
  );
}
