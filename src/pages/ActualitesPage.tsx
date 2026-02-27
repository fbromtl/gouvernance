import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { useArticles } from '@/hooks/useArticles';
import { strapiMediaUrl, type ArticleCategory } from '@/lib/strapi';

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'communique', label: 'Communiqué' },
  { value: 'analyse', label: 'Analyse' },
  { value: 'veille', label: 'Veille' },
  { value: 'opinion', label: 'Opinion' },
  { value: 'nomination', label: 'Nomination' },
  { value: 'evenement', label: 'Événement' },
];

const badgeColors: Record<string, string> = {
  communique: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  analyse: 'bg-primary/15 text-primary border-primary/30',
  veille: 'border-muted-foreground text-muted-foreground',
  opinion: 'bg-primary/15 text-primary border-primary/30',
  nomination: 'bg-brand-purple/20 text-brand-purple border-brand-purple/40',
  evenement: 'bg-primary/15 text-primary border-primary/30',
};

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ActualitesPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<ArticleCategory | undefined>();
  const { data, isLoading, isError } = useArticles(page, category);

  const articles = data?.articles ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <SEO
        title="Actualités"
        description="Suivez les dernières actualités en gouvernance de l'intelligence artificielle : réglementation, technologies, événements et publications."
      />
      <div className="overflow-x-hidden">
        {/* HERO */}
        <section
          className="overflow-hidden pt-32 pb-20 relative"
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
          <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight mb-6">
              Actualités
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
              Nouvelles du Cercle, veille stratégique et prises de position sur la gouvernance de
              l&apos;IA.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="pt-12 pb-4 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory(undefined);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                !category
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
              )}
            >
              Tous
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                  category === cat.value
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* NEWS GRID */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-neutral-400" />
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-neutral-500">
                Impossible de charger les articles. Veuillez réessayer plus tard.
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                Aucun article pour le moment.
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => {
                    const coverUrl = strapiMediaUrl(article.cover);
                    return (
                      <Card
                        key={article.documentId}
                        className="group rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden"
                      >
                        {coverUrl && (
                          <Link to={`/actualites/${article.slug}`}>
                            <img
                              src={coverUrl}
                              alt={article.cover?.alternativeText ?? article.title}
                              className="w-full h-48 object-cover"
                            />
                          </Link>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={article.category === 'veille' ? 'outline' : 'secondary'}
                              className={cn(
                                'text-xs rounded-full',
                                badgeColors[article.category],
                              )}
                            >
                              {categoryLabel(article.category)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleDateString('fr-CA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <h2 className="text-lg font-semibold leading-tight">
                            <Link
                              to={`/actualites/${article.slug}`}
                              className="text-foreground hover:text-primary transition-colors line-clamp-2"
                            >
                              {article.title}
                            </Link>
                          </h2>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {article.excerpt}
                          </p>
                          <Link
                            to={`/actualites/${article.slug}`}
                            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 group/link"
                          >
                            Lire la suite
                            <ArrowRight className="size-4 group-hover/link:translate-x-0.5 transition-transform" />
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.pageCount > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Précédent
                    </Button>
                    <span className="flex items-center px-3 text-sm text-neutral-500">
                      {page} / {pagination.pageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page >= pagination.pageCount}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* NEWSLETTER CTA */}
        <section className="py-24 sm:py-32 bg-neutral-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Newspaper className="size-10 text-purple-400 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Restez informé
            </h2>
            <p className="text-neutral-400 text-lg mb-8">
              Abonnez-vous à notre infolettre pour ne rien manquer.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
            >
              Nous contacter
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
