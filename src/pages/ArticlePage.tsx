import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { useArticle } from '@/hooks/useArticles';
import { strapiMediaUrl } from '@/lib/strapi';

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  communique: 'Communiqué',
  analyse: 'Analyse',
  veille: 'Veille',
  opinion: 'Opinion',
  nomination: 'Nomination',
  evenement: 'Événement',
};

const badgeColors: Record<string, string> = {
  communique: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  analyse: 'bg-primary/15 text-primary border-primary/30',
  veille: 'border-muted-foreground text-muted-foreground',
  opinion: 'bg-primary/15 text-primary border-primary/30',
  nomination: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  evenement: 'bg-primary/15 text-primary border-primary/30',
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useArticle(slug ?? '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="text-center py-32">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Article introuvable</h1>
        <p className="text-neutral-500 mb-6">Cet article n'existe pas ou a été retiré.</p>
        <Link
          to="/actualites"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Retour aux actualités
        </Link>
      </div>
    );
  }

  const coverUrl = strapiMediaUrl(article.cover);

  return (
    <>
      <SEO title={article.title} description={article.excerpt} />
      <div className="overflow-x-hidden">
        {/* Hero with cover */}
        <section
          className="overflow-hidden pt-32 pb-16 relative"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: `
              radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%),
              radial-gradient(at 100% 0%, hsla(280,100%,95%,1) 0, transparent 50%),
              radial-gradient(at 100% 100%, hsla(250,100%,92%,1) 0, transparent 50%),
              radial-gradient(at 0% 100%, hsla(220,100%,96%,1) 0, transparent 50%)
            `,
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              to="/actualites"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
            >
              <ArrowLeft className="size-4" />
              Actualités
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant={article.category === 'veille' ? 'outline' : 'secondary'}
                className={cn('text-xs rounded-full', badgeColors[article.category])}
              >
                {CATEGORY_LABELS[article.category] ?? article.category}
              </Badge>
              <time className="text-sm text-neutral-500">
                {new Date(article.publishedAt).toLocaleDateString('fr-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              {article.title}
            </h1>
          </div>
        </section>

        {/* Cover image */}
        {coverUrl && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
            <img
              src={coverUrl}
              alt={article.cover?.alternativeText ?? article.title}
              className="w-full rounded-2xl shadow-lg object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
            <Markdown>{article.content}</Markdown>
          </div>
        </article>
      </div>
    </>
  );
}
