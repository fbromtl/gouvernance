import matter from "gray-matter";
import { authors } from "@/../content/authors";
import type { Article, Category, Author } from "@/types/article";

// Import all .md files from content/articles at build time
const articleModules = import.meta.glob("/content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseArticle(raw: string): Article {
  const { data, content } = matter(raw);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    category: data.category,
    excerpt: data.excerpt,
    cover: data.cover,
    author: data.author,
    featured: data.featured ?? false,
    content,
    readingTime: Math.max(1, Math.ceil(wordCount / 200)),
  };
}

const allArticles: Article[] = Object.values(articleModules)
  .map(parseArticle)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getAllArticles(): Article[] {
  return allArticles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Category): Article[] {
  return allArticles.filter((a) => a.category === category);
}

export function getFeaturedArticle(): Article | undefined {
  return allArticles.find((a) => a.featured);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return allArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}

export function getAuthor(authorId: string): Author | undefined {
  return authors[authorId];
}
