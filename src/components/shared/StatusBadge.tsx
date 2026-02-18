import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  // Lifecycle
  idea: "bg-gray-100 text-gray-700 border-gray-200",
  pilot: "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-indigo-50 text-indigo-700 border-indigo-200",
  testing: "bg-amber-50 text-amber-700 border-amber-200",
  production: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  // Risk levels
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-green-50 text-green-700 border-green-200",
  minimal: "bg-green-50 text-green-700 border-green-200",
  limited: "bg-amber-50 text-amber-700 border-amber-200",
  prohibited: "bg-red-100 text-red-800 border-red-300",
  // Workflow
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
  // Compliance
  compliant: "bg-green-50 text-green-700 border-green-200",
  partially_compliant: "bg-amber-50 text-amber-700 border-amber-200",
  non_compliant: "bg-red-50 text-red-700 border-red-200",
  not_applicable: "bg-gray-100 text-gray-600 border-gray-200",
  // Incident workflow
  reported: "bg-red-50 text-red-700 border-red-200",
  triaged: "bg-orange-50 text-orange-700 border-orange-200",
  investigating: "bg-amber-50 text-amber-700 border-amber-200",
  resolving: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  post_mortem: "bg-indigo-50 text-indigo-700 border-indigo-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
  // Loi 25 notification
  to_notify: "bg-red-50 text-red-700 border-red-200",
  notified: "bg-blue-50 text-blue-700 border-blue-200",
  acknowledged: "bg-green-50 text-green-700 border-green-200",
  // Generic
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", variants[status] ?? variants.draft, className)}
    >
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}
