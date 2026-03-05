import {
  FileStack,
  Building2,
  Heart,
  Settings,
  Shield,
  AlertTriangle,
  Scale,
  ShoppingCart,
  Users,
  FileCode,
  Copyright,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateCategory, TemplateCategoryInfo } from "@/types/template";

/* ------------------------------------------------------------------ */
/*  Category icon mapping                                              */
/* ------------------------------------------------------------------ */

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "gouvernance-strategique": Building2,
  "ethique-valeurs": Heart,
  "utilisation-pratiques": Settings,
  "securite-confidentialite": Shield,
  "gestion-risques": AlertTriangle,
  "conformite-legale": Scale,
  "approvisionnement": ShoppingCart,
  "rh-formation": Users,
  "documentation-technique": FileCode,
  "propriete-intellectuelle": Copyright,
  "qualite-amelioration": TrendingUp,
  "communication-changement": MessageSquare,
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface TemplateSidebarProps {
  categories: TemplateCategoryInfo[];
  activeCategory: TemplateCategory | null;
  onSelect: (category: TemplateCategory | null) => void;
  totalCount: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TemplateSidebar({
  categories,
  activeCategory,
  onSelect,
  totalCount,
}: TemplateSidebarProps) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      {/* All templates */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
          activeCategory === null
            ? "bg-brand-forest/10 text-brand-forest font-medium"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <FileStack className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Tous les modeles</span>
        {totalCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {totalCount}
          </span>
        )}
      </button>

      {/* Separator */}
      <div className="h-px bg-border/40 my-1.5 mx-2" />

      {/* Categories */}
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.slug] ?? FileStack;
        const isActive = activeCategory === cat.slug;

        return (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onSelect(cat.slug)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-brand-forest/10 text-brand-forest font-medium"
                : "text-foreground/70 hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1 text-left">{cat.label}</span>
            {cat.count > 0 && (
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
