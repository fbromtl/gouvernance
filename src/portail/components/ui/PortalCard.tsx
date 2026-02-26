import { cn } from "@/lib/utils";

interface PortalCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function PortalCard({ children, className, hoverable = true }: PortalCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-neutral-100 p-5",
        hoverable && "hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300",
        className,
      )}
    >
      {children}
    </div>
  );
}
