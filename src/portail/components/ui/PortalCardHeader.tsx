import { cn } from "@/lib/utils";

interface PortalCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function PortalCardHeader({ children, className, action }: PortalCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 mb-4", className)}>
      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
        {children}
      </h3>
      {action}
    </div>
  );
}
