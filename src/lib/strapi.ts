/* ------------------------------------------------------------------ */
/*  Strapi CMS client                                                  */
/* ------------------------------------------------------------------ */

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL as string;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ArticleCategory =
  | 'communique'
  | 'analyse'
  | 'veille'
  | 'opinion'
  | 'nomination'
  | 'evenement';

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  publishedAt: string;
  cover: StrapiMedia | null;
}

export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
}

interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: StrapiPagination };
}

/** Resolve a Strapi media URL (may be relative or absolute). */
export function strapiMediaUrl(media: StrapiMedia | null | undefined): string | null {
  if (!media?.url) return null;
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}

/* ------------------------------------------------------------------ */
/*  API functions                                                      */
/* ------------------------------------------------------------------ */

export async function fetchArticles(
  page = 1,
  pageSize = 9,
  category?: ArticleCategory,
): Promise<{ articles: StrapiArticle[]; pagination: StrapiPagination }> {
  const params = new URLSearchParams();
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));
  params.set('sort', 'publishedAt:desc');
  params.set('populate', 'cover');

  if (category) {
    params.set('filters[category][$eq]', category);
  }

  params.set('publicationState', 'live');

  const res = await fetch(`${STRAPI_URL}/api/articles?${params}`);
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);

  const json: StrapiListResponse<StrapiArticle> = await res.json();
  return { articles: json.data, pagination: json.meta.pagination };
}

export async function fetchArticleBySlug(
  slug: string,
): Promise<StrapiArticle | null> {
  const params = new URLSearchParams();
  params.set('filters[slug][$eq]', slug);
  params.set('populate', 'cover');
  params.set('publicationState', 'live');

  const res = await fetch(`${STRAPI_URL}/api/articles?${params}`);
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);

  const json: StrapiListResponse<StrapiArticle> = await res.json();
  return json.data[0] ?? null;
}
