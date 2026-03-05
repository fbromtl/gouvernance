import type {
  TemplateDoc,
  TemplateCategory,
  TemplateCategoryInfo,
} from "@/types/template";

// Import the generated index
import templatesData from "@/data/templates-index.json";

// Normalise raw JSON — add default `tags` if missing from generated data
const allTemplates: TemplateDoc[] = (
  templatesData as (Omit<TemplateDoc, "tags"> & { tags?: string[] })[]
).map((t) => ({
  ...t,
  tags: t.tags ?? [],
}));

export function getAllTemplates(): TemplateDoc[] {
  return allTemplates;
}

export function getTemplateById(id: string): TemplateDoc | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(
  category: TemplateCategory,
): TemplateDoc[] {
  return allTemplates.filter((t) => t.category === category);
}

export function searchTemplates(query: string): TemplateDoc[] {
  const q = query.toLowerCase();
  return allTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.frameworks.some((f) => f.toLowerCase().includes(q)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}

export function getCategories(): TemplateCategoryInfo[] {
  const categoryMap = new Map<string, { label: string; count: number }>();

  for (const t of allTemplates) {
    const existing = categoryMap.get(t.category);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(t.category, { label: t.categoryLabel, count: 1 });
    }
  }

  const CATEGORY_ICONS: Record<string, string> = {
    "gouvernance-strategique": "Building2",
    "ethique-valeurs": "Heart",
    "utilisation-pratiques": "Settings",
    "securite-confidentialite": "Shield",
    "gestion-risques": "AlertTriangle",
    "conformite-legale": "Scale",
    "approvisionnement": "ShoppingCart",
    "rh-formation": "Users",
    "documentation-technique": "FileCode",
    "propriete-intellectuelle": "Copyright",
    "qualite-amelioration": "TrendingUp",
    "communication-changement": "MessageSquare",
  };

  return Array.from(categoryMap.entries()).map(([slug, { label, count }]) => ({
    slug: slug as TemplateCategory,
    label,
    count,
    icon: CATEGORY_ICONS[slug] || "FileText",
  }));
}
