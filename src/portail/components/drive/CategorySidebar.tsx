import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Inbox, FileStack } from "lucide-react";
import { cn } from "@/lib/utils";
import { DRIVE_CATEGORIES } from "./constants";
import type { Category } from "./constants";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CategorySidebarProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelect: (category: string | null, subcategory: string | null) => void;
  counts: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/*  Category item                                                      */
/* ------------------------------------------------------------------ */

function CategoryItem({
  cat,
  isSelected,
  selectedSubcategory,
  counts,
  onSelect,
  t,
}: {
  cat: Category;
  isSelected: boolean;
  selectedSubcategory: string | null;
  counts: Record<string, number>;
  onSelect: (category: string | null, subcategory: string | null) => void;
  t: (key: string, opts?: any) => string;
}) {
  const [expanded, setExpanded] = useState(isSelected);
  const Icon = cat.icon;
  const count = counts[cat.key] ?? 0;

  return (
    <div>
      <button
        onClick={() => {
          if (isSelected && !selectedSubcategory) {
            setExpanded(!expanded);
          } else {
            onSelect(cat.key, null);
            setExpanded(true);
          }
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
          isSelected && !selectedSubcategory
            ? "bg-brand-purple/10 text-brand-purple font-medium"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1 text-left">
          {t(`drive.categories.${cat.labelKey}`, { defaultValue: cat.labelKey })}
        </span>
        {count > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {count}
          </span>
        )}
      </button>

      {/* Subcategories */}
      {expanded && (
        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
          {cat.subcategories.map((sub) => {
            const subCount = counts[`${cat.key}/${sub.key}`] ?? 0;
            const isSubSelected =
              isSelected && selectedSubcategory === sub.key;

            return (
              <button
                key={sub.key}
                onClick={() => onSelect(cat.key, sub.key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                  isSubSelected
                    ? "bg-brand-purple/10 text-brand-purple font-medium"
                    : "text-foreground/60 hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate flex-1 text-left">
                  {t(`drive.subcategories.${sub.labelKey}`, {
                    defaultValue: sub.labelKey,
                  })}
                </span>
                {subCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {subCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main sidebar                                                       */
/* ------------------------------------------------------------------ */

export function CategorySidebar({
  selectedCategory,
  selectedSubcategory,
  onSelect,
  counts,
}: CategorySidebarProps) {
  const { t } = useTranslation("documents");

  const totalCount = counts["__all__"] ?? 0;
  const uncategorizedCount = counts["__uncategorized__"] ?? 0;

  return (
    <div className="flex flex-col gap-0.5 py-2">
      {/* All documents */}
      <button
        onClick={() => onSelect(null, null)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
          selectedCategory === null
            ? "bg-brand-purple/10 text-brand-purple font-medium"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <FileStack className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">
          {t("drive.allDocuments", { defaultValue: "Tous les documents" })}
        </span>
        {totalCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {totalCount}
          </span>
        )}
      </button>

      {/* Separator */}
      <div className="h-px bg-border/40 my-1.5 mx-2" />

      {/* Categories */}
      {DRIVE_CATEGORIES.map((cat) => (
        <CategoryItem
          key={cat.key}
          cat={cat}
          isSelected={selectedCategory === cat.key}
          selectedSubcategory={selectedSubcategory}
          counts={counts}
          onSelect={onSelect}
          t={t}
        />
      ))}

      {/* Separator */}
      <div className="h-px bg-border/40 my-1.5 mx-2" />

      {/* Uncategorized */}
      <button
        onClick={() => onSelect("__uncategorized__", null)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
          selectedCategory === "__uncategorized__"
            ? "bg-brand-purple/10 text-brand-purple font-medium"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <Inbox className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">
          {t("drive.uncategorized", { defaultValue: "Non classe" })}
        </span>
        {uncategorizedCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {uncategorizedCount}
          </span>
        )}
      </button>
    </div>
  );
}
