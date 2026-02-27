import { authors } from "@/../content/authors";
import type { Article, Category, Author } from "@/types/article";

// Import all .md files from content/articles at build time
const articleModules = import.meta.glob("/content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Browser-compatible YAML frontmatter parser (no Node.js deps). */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  for (const line of yamlBlock.split(/\r?\n/)) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    let val: unknown = rawVal;
    // Strip surrounding quotes
    if (/^".*"$/.test(rawVal) || /^'.*'$/.test(rawVal)) {
      val = rawVal.slice(1, -1);
    } else if (rawVal === "true") {
      val = true;
    } else if (rawVal === "false") {
      val = false;
    }
    data[key] = val;
  }

  return { data, content };
}

function parseArticle(raw: string): Article {
  const { data, content } = parseFrontmatter(raw);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    slug: data.slug as string,
    title: data.title as string,
    date: data.date as string,
    category: data.category as Category,
    excerpt: data.excerpt as string,
    cover: data.cover as string,
    author: data.author as string,
    featured: (data.featured as boolean) ?? false,
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
