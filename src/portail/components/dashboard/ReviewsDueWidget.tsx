import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { differenceInDays, parseISO, isPast, startOfDay } from "date-fns";

import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
import { Badge } from "@/components/ui/badge";

interface ReviewSystem {
  id: string;
  name: string;
  next_review_date: string | null;
}

interface ReviewsDueWidgetProps {
  systems: ReviewSystem[];
}

interface ReviewItem {
  id: string;
  name: string;
  nextReviewDate: Date;
  daysUntil: number;
  isOverdue: boolean;
}

function renderDaysIndicator(item: ReviewItem) {
  const absDays = Math.abs(item.daysUntil);

  if (item.isOverdue) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-red-100 text-red-700 text-[10px] dark:bg-red-950 dark:text-red-400"
      >
        En retard &middot; {absDays}j
      </Badge>
    );
  }

  if (item.daysUntil < 30) {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-orange-100 text-orange-700 text-[10px] dark:bg-orange-950 dark:text-orange-400"
      >
        {item.daysUntil}j
      </Badge>
    );
  }

  if (item.daysUntil < 90) {
    return (
      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
        {item.daysUntil}j
      </span>
    );
  }

  return (
    <span className="text-[11px] text-neutral-400">
      {item.daysUntil}j
    </span>
  );
}

export default function ReviewsDueWidget({ systems }: ReviewsDueWidgetProps) {
  const { t } = useTranslation("dashboard");

  const today = useMemo(() => startOfDay(new Date()), []);

  const reviews = useMemo(() => {
    const items: ReviewItem[] = [];

    for (const sys of systems) {
      if (!sys.next_review_date) continue;

      const reviewDate = parseISO(sys.next_review_date);
      const reviewDay = startOfDay(reviewDate);
      const isOverdue = isPast(reviewDay) && reviewDay.getTime() !== today.getTime();
      const daysUntil = differenceInDays(reviewDay, today);

      items.push({
        id: sys.id,
        name: sys.name,
        nextReviewDate: reviewDate,
        daysUntil,
        isOverdue,
      });
    }

    items.sort(
      (a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime(),
    );

    return items.slice(0, 6);
  }, [systems, today]);

  const reviewsIn30Days = useMemo(
    () => reviews.filter((r) => r.daysUntil <= 30).length,
    [reviews],
  );

  return (
    <PortalCard>
      <PortalCardHeader
        action={
          reviewsIn30Days > 0 ? (
            <Badge variant="secondary" className="text-[10px]">
              {reviewsIn30Days}
            </Badge>
          ) : undefined
        }
      >
        {t("widgets.reviewsDue")}
      </PortalCardHeader>
      <div>
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarClock className="h-8 w-8 text-neutral-400 mb-2" />
            <p className="text-sm text-neutral-500">
              {t("widgets.noReviewsDue")}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {reviews.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-50"
              >
                <Link
                  to={`/ai-systems/${item.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                >
                  {item.name}
                </Link>
                {renderDaysIndicator(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalCard>
  );
}
