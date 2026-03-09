import type { ReactNode, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyIcon?: ComponentType<{ className?: string }>;
  emptyTitle?: string;
  emptyDescription?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function ErrorCard({ error }: { error: Error }) {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-red-900">
            Une erreur est survenue
          </p>
          <p className="text-sm text-red-700">
            {error.message || "Impossible de charger les données. Veuillez réessayer."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}) {
  const DisplayIcon = Icon ?? Inbox;
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <DisplayIcon className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">
          {title ?? "Aucune donnée"}
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description ?? "Aucun élément à afficher pour le moment."}
        </p>
      </CardContent>
    </Card>
  );
}

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  skeleton,
  children,
}: QueryStateProps) {
  if (isLoading) return skeleton ?? <DefaultSkeleton />;
  if (error) return <ErrorCard error={error} />;
  if (isEmpty)
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  return <>{children}</>;
}
