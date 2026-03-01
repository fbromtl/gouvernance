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
  communique: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  analyse: "bg-primary/15 text-primary border-primary/30",
  veille: "border-muted-foreground text-muted-foreground",
  opinion: "bg-primary/15 text-primary border-primary/30",
  nomination: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  evenement: "bg-primary/15 text-primary border-primary/30",
};
