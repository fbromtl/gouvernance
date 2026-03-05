export type TemplateCategory =
  | "gouvernance-strategique"
  | "ethique-valeurs"
  | "utilisation-pratiques"
  | "securite-confidentialite"
  | "gestion-risques"
  | "conformite-legale"
  | "approvisionnement"
  | "rh-formation"
  | "documentation-technique"
  | "propriete-intellectuelle"
  | "qualite-amelioration"
  | "communication-changement";

export type TemplateType =
  | "politique" | "charte" | "guide" | "plan"
  | "registre" | "procedure" | "cadre" | "matrice"
  | "grille" | "formulaire" | "catalogue" | "fiche"
  | "checklist" | "rapport" | "faq" | "journal";

export interface TemplateDoc {
  id: string;
  number: number;
  title: string;
  filename: string;
  category: TemplateCategory;
  categoryLabel: string;
  type: TemplateType;
  typeLabel: string;
  description: string;
  frameworks: string[];
  tags: string[];
  htmlPath: string;
  docxPath: string;
}

export interface TemplateCategoryInfo {
  slug: TemplateCategory;
  label: string;
  count: number;
  icon: string; // Lucide icon name
}
