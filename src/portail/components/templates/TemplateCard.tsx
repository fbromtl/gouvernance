import {
  Shield,
  FileText,
  BookOpen,
  Map,
  ClipboardList,
  ListChecks,
  Layers,
  Grid3X3,
  Table2,
  FileInput,
  Library,
  FileCheck,
  CheckSquare,
  BarChart3,
  HelpCircle,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TemplateDoc } from "@/types/template";

/* ------------------------------------------------------------------ */
/*  Type icon mapping                                                  */
/* ------------------------------------------------------------------ */

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  politique: Shield,
  charte: FileText,
  guide: BookOpen,
  plan: Map,
  registre: ClipboardList,
  procedure: ListChecks,
  cadre: Layers,
  matrice: Grid3X3,
  grille: Table2,
  formulaire: FileInput,
  catalogue: Library,
  fiche: FileCheck,
  checklist: CheckSquare,
  rapport: BarChart3,
  faq: HelpCircle,
  journal: BookMarked,
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface TemplateCardProps {
  template: TemplateDoc;
  onClick: (template: TemplateDoc) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const Icon = TYPE_ICONS[template.type] ?? FileText;
  const numberLabel = `#${String(template.number).padStart(2, "0")}`;
  const visibleFrameworks = template.frameworks.slice(0, 2);
  const extraCount = template.frameworks.length - 2;

  return (
    <button
      type="button"
      onClick={() => onClick(template)}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all duration-200",
        "hover:shadow-md hover:border-brand-forest/30 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40"
      )}
    >
      {/* Header: number badge + icon */}
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">
          {numberLabel}
        </span>
        <Icon className="h-5 w-5 text-brand-forest/60" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-brand-forest transition-colors">
        {template.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {template.description}
      </p>

      {/* Footer: badges */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {template.categoryLabel}
        </Badge>
        {visibleFrameworks.map((fw) => (
          <Badge
            key={fw}
            variant="outline"
            className="text-[10px] px-1.5 py-0 text-muted-foreground"
          >
            {fw}
          </Badge>
        ))}
        {extraCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            +{extraCount}
          </span>
        )}
      </div>
    </button>
  );
}
