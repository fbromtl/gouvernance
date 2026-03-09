import { useState, useMemo, useCallback } from "react";
import { Library, Search, X, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { PortalPage } from "@/portail/components/PortalPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateCard } from "@/portail/components/templates/TemplateCard";
import { TemplatePreviewSheet } from "@/portail/components/templates/TemplatePreviewSheet";
import {
  getAllTemplates,
  searchTemplates,
  getCategories,
  getTypes,
  getFrameworks,
} from "@/lib/templates";
import type { TemplateDoc, TemplateCategory, TemplateType } from "@/types/template";

const STORAGE_KEY = "gia-template-downloaded";

function hasDownloaded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markDownloaded() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // silently ignore
  }
}

const STEPS = [
  { icon: Search, label: "Choisir un modèle" },
  { icon: FileText, label: "Télécharger le document" },
  { icon: Library, label: "Personnaliser le contenu" },
  { icon: CheckCircle, label: "Publier dans Gouvernance" },
];

const ALL = "__all__";

export default function ModelesBibliothequePage() {
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [frameworkFilter, setFrameworkFilter] = useState<string>(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDoc | null>(null);
  const [downloaded, setDownloaded] = useState(hasDownloaded);

  const allTemplates = getAllTemplates();
  const categories = getCategories();
  const types = getTypes();
  const frameworks = getFrameworks();

  const hasActiveFilters =
    categoryFilter !== ALL ||
    typeFilter !== ALL ||
    frameworkFilter !== ALL ||
    searchQuery.trim() !== "";

  const filteredTemplates = useMemo(() => {
    let results = allTemplates;

    if (searchQuery.trim()) {
      results = searchTemplates(searchQuery);
    }

    if (categoryFilter !== ALL) {
      results = results.filter(
        (t) => t.category === (categoryFilter as TemplateCategory),
      );
    }

    if (typeFilter !== ALL) {
      results = results.filter(
        (t) => t.type === (typeFilter as TemplateType),
      );
    }

    if (frameworkFilter !== ALL) {
      results = results.filter((t) => t.frameworks.includes(frameworkFilter));
    }

    return results;
  }, [allTemplates, searchQuery, categoryFilter, typeFilter, frameworkFilter]);

  function resetFilters() {
    setCategoryFilter(ALL);
    setTypeFilter(ALL);
    setFrameworkFilter(ALL);
    setSearchQuery("");
  }

  const handleDownload = useCallback(() => {
    markDownloaded();
    setDownloaded(true);
  }, []);

  return (
    <PortalPage
      icon={Library}
      title="Modèles de documents"
      description={`${allTemplates.length} modèles de gouvernance IA prêts à l\u2019emploi pour structurer vos pratiques.`}
    >
      {/* ---- Getting started banner ---- */}
      {!downloaded && (
        <div className="rounded-xl border border-brand-forest/20 bg-brand-forest/[0.03] p-5 sm:p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">
            Bien démarrer avec vos politiques IA
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Structurez votre gouvernance en 4 étapes simples.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg bg-white border border-neutral-100 p-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-foreground leading-tight">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Filter bar ---- */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un modèle..."
            className="pl-9"
          />
        </div>

        {/* Category */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-auto min-w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.label} ({cat.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-auto min-w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t.slug} value={t.slug}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Framework */}
        <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
          <SelectTrigger className="w-auto min-w-[160px]">
            <SelectValue placeholder="Cadre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les cadres</SelectItem>
            {frameworks.map((fw) => (
              <SelectItem key={fw} value={fw}>
                {fw}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Result count + reset */}
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="font-medium">
            {filteredTemplates.length} modèle{filteredTemplates.length !== 1 ? "s" : ""}
          </Badge>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* ---- Template grid ---- */}
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">
            Aucun modèle ne correspond à vos filtres.
          </p>
          <Button variant="link" onClick={resetFilters} className="mt-2 gap-1">
            Réinitialiser les filtres <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ---- Preview sheet ---- */}
      <TemplatePreviewSheet
        template={selectedTemplate}
        open={selectedTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTemplate(null);
        }}
        onDownload={handleDownload}
      />
    </PortalPage>
  );
}
