import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

import { getAllArticles, getFeaturedArticle, getAuthor } from "@/lib/articles";
import type { Article, Category } from "@/types/article";
import { categoryLabels, categoryColors } from "@/types/article";

const ARTICLES_PER_PAGE = 6;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.style.display = "none";
  const fallback = img.nextElementSibling as HTMLElement | null;
  if (fallback) fallback.style.display = "flex";
}

export function ActualitesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const allArticles = getAllArticles();
  const featuredArticle = getFeaturedArticle();

  // Determine which articles to show in the grid
  const gridArticles = useMemo(() => {
    let articles = allArticles;

    // Filter by category if set
    if (activeCategory) {
      articles = articles.filter((a) => a.category === activeCategory);
    } else if (featuredArticle && currentPage === 1) {
      // Exclude featured article from page 1 when showing all categories
      articles = articles.filter((a) => a.slug !== featuredArticle.slug);
    }

    return articles;
  }, [allArticles, activeCategory, currentPage, featuredArticle]);

  const totalPages = Math.ceil(gridArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = gridArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  const showFeatured =
    activeCategory === null && currentPage === 1 && featuredArticle;

  function handleCategoryChange(category: Category | null) {
    setActiveCategory(category);
    setCurrentPage(1);
  }

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
            backgroundColor: "#ffffff",
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
              Nouvelles du Cercle, veille stratégique et prises de position sur
              la gouvernance de l&apos;IA.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="py-8 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-neutral-200 text-muted-foreground hover:bg-neutral-50",
                )}
              >
                Tous
              </button>
              {(Object.entries(categoryLabels) as [Category, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      activeCategory === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-neutral-200 text-muted-foreground hover:bg-neutral-50",
                    )}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </section>

        {/* FEATURED ARTICLE */}
        {showFeatured && <FeaturedCard article={featuredArticle} />}

        {/* ARTICLE GRID */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {paginatedArticles.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-lg py-12">
                Aucun article trouvé dans cette catégorie.
              </p>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      aria-label={`Page ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </nav>
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
              Nous contacter <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

/* ---------- Featured Card ---------- */

function FeaturedCard({ article }: { article: Article }) {
  const author = getAuthor(article.author);

  return (
    <section className="pb-8 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/actualites/${article.slug}`}
          className="group block rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Cover image */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={article.cover}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover rounded-t-3xl md:rounded-t-none md:rounded-l-3xl"
                onError={handleImgError}
              />
              <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center rounded-t-3xl md:rounded-t-none md:rounded-l-3xl">
                <Newspaper className="size-10 text-purple-300" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs rounded-full",
                    categoryColors[article.category],
                  )}
                >
                  {categoryLabels[article.category]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(article.date)}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h2>

              <p className="text-muted-foreground mb-6 line-clamp-3">
                {article.excerpt}
              </p>

              {author && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative size-8 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="size-8 rounded-full object-cover"
                      onError={handleImgError}
                    />
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center rounded-full">
                      <span className="text-xs font-bold text-purple-400">
                        {author.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {author.title}
                    </p>
                  </div>
                </div>
              )}

              <span className="text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Lire la suite
                <ArrowRight className="size-4" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ---------- Article Card ---------- */

function ArticleCard({ article }: { article: Article }) {
  const author = getAuthor(article.author);

  return (
    <Card className="group rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
      <Link to={`/actualites/${article.slug}`} className="flex flex-col h-full">
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={article.cover}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-2xl"
            onError={handleImgError}
          />
          <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center">
            <Newspaper className="size-10 text-purple-300" />
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs rounded-full",
                categoryColors[article.category],
              )}
            >
              {categoryLabels[article.category]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(article.date)}
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {article.excerpt}
          </p>
          {author && (
            <div className="flex items-center gap-2">
              <div className="relative size-6 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="size-6 rounded-full object-cover"
                  onError={handleImgError}
                />
                <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center rounded-full">
                  <span className="text-[10px] font-bold text-purple-400">
                    {author.name.charAt(0)}
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {author.name}
              </span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
