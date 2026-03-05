export type Category =
  | "communique"
  | "analyse"
  | "veille"
  | "opinion"
  | "nomination"
  | "evenement";

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: Category;
  excerpt: string;
  cover: string;
  author: string;
  featured: boolean;
  tags: string[];
}

export interface Article extends ArticleMeta {
  content: string;
  readingTime: number;
}

export interface Author {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  linkedin?: string;
}

export const categoryLabels: Record<Category, string> = {
  communique: "Communiqu\u00e9",
  analyse: "Analyse",
  veille: "Veille",
  opinion: "Opinion",
  nomination: "Nomination",
  evenement: "\u00c9v\u00e9nement",
};

export const categoryColors: Record<Category, string> = {
  communique: "bg-brand-forest/15 text-brand-forest border-brand-forest/30",
  analyse: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
  veille: "bg-neutral-100 text-neutral-600 border-neutral-300",
  opinion: "bg-brand-forest/15 text-brand-forest border-brand-forest/30",
  nomination: "bg-brand-sage/15 text-brand-sage border-brand-sage/30",
  evenement: "bg-brand-rose/20 text-brand-teal border-brand-rose/40",
};
