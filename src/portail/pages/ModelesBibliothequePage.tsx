import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TemplateCard } from "@/portail/components/templates/TemplateCard";
import { TemplateSidebar } from "@/portail/components/templates/TemplateSidebar";
import { TemplatePreviewSheet } from "@/portail/components/templates/TemplatePreviewSheet";
import { getAllTemplates, searchTemplates, getCategories } from "@/lib/templates";
import type { TemplateDoc, TemplateCategory } from "@/types/template";

export default function ModelesBibliothequePage() {
  const [activeCategory, setActiveCategory] =
    useState<TemplateCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDoc | null>(null);

  const allTemplates = getAllTemplates();
  const categories = getCategories();

  const filteredTemplates = useMemo(() => {
    let results = allTemplates;

    // Search filter
    if (searchQuery.trim()) {
      results = searchTemplates(searchQuery);
    }

    // Category filter
    if (activeCategory) {
      results = results.filter((t) => t.category === activeCategory);
    }

    return results;
  }, [allTemplates, searchQuery, activeCategory]);

  function handleCategoryChange(category: TemplateCategory | null) {
    setActiveCategory(category);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Mod&egrave;les de documents
          </h1>
          <p className="mt-1 text-muted-foreground">
            {allTemplates.length} mod&egrave;les de gouvernance IA pr&ecirc;ts
            &agrave; l&rsquo;emploi pour structurer vos pratiques.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un mod\u00e8le..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Mobile category pills */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-4">
        <button
          onClick={() => handleCategoryChange(null)}
          className={cn(
            "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
            activeCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-white border border-neutral-200 text-muted-foreground hover:bg-neutral-50",
          )}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-white border border-neutral-200 text-muted-foreground hover:bg-neutral-50",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-4">
            <TemplateSidebar
              categories={categories}
              activeCategory={activeCategory}
              onSelect={handleCategoryChange}
              totalCount={allTemplates.length}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={setSelectedTemplate}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg py-12">
              Aucun mod&egrave;le trouv&eacute;.
            </p>
          )}
        </div>
      </div>

      {/* Preview sheet */}
      <TemplatePreviewSheet
        template={selectedTemplate}
        open={selectedTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTemplate(null);
        }}
      />
    </div>
  );
}
