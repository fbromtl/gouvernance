import { useQuery } from '@tanstack/react-query';
import {
  fetchArticles,
  fetchArticleBySlug,
  type ArticleCategory,
} from '@/lib/strapi';

export function useArticles(page = 1, category?: ArticleCategory) {
  return useQuery({
    queryKey: ['articles', page, category],
    queryFn: () => fetchArticles(page, 9, category),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug),
    enabled: !!slug,
  });
}
