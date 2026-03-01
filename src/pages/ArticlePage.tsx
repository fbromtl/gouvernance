import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Linkedin,
  Twitter,
  Link2,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SEO, JsonLd } from "@/components/SEO";

import { getArticleBySlug, getRelatedArticles, getAuthor } from "@/lib/articles";
import type { Article, Author, Category } from "@/types/article";
import { categoryLabels, categoryColors } from "@/types/article";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const [coverError, setCoverError] = useState(false);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Reset cover error when slug changes
  useEffect(() => {
    setCoverError(false);
  }, [slug]);

  const article: Article | undefined = slug ? getArticleBySlug(slug) : undefined;
  const author: Author | undefined = article ? getAuthor(article.author) : undefined;
  const relatedArticles: Article[] = article ? getRelatedArticles(article, 3) : [];

  // --- Not found state ---
  if (!article) {
    return (
      <>
        <SEO title="Article non trouv\u00e9" />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <Newspaper className="size-16 text-muted-foreground/40 mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Article non trouv\u00e9
          </h1>
          <p className="text-muted-foreground mb-6">
            L&apos;article que vous cherchez n&apos;existe pas ou a \u00e9t\u00e9
            d\u00e9plac\u00e9.
          </p>
          <Link
            to="/actualites"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Retour aux actualit\u00e9s
          </Link>
        </div>
      </>
    );
  }

  const url = window.location.href;

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`,
      "_blank",
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => toast.success("Lien copi\u00e9 !"));
  };

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        image={article.cover?.startsWith("http") ? article.cover : `https://gouvernance.ai${article.cover}`}
        type="article"
        publishedTime={article.date}
        authorName={author?.name}
        articleSection={categoryLabels[article.category as Category]}
        tags={article.tags}
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.excerpt,
        "datePublished": article.date,
        "dateModified": article.date,
        "inLanguage": "fr-CA",
        "articleSection": categoryLabels[article.category as Category],
        "keywords": article.tags?.join(", ") ?? "",
        "wordCount": article.content.split(/\s+/).filter(Boolean).length,
        "author": author ? {
          "@type": "Person",
          "name": author.name,
          "jobTitle": author.title,
        } : undefined,
        "publisher": {
          "@type": "Organization",
          "name": "Cercle de Gouvernance de l'IA",
          "url": "https://gouvernance.ai",
          "logo": {
            "@type": "ImageObject",
            "url": "https://gouvernance.ai/logo.svg",
          },
        },
        "image": {
          "@type": "ImageObject",
          "url": article.cover?.startsWith("http") ? article.cover : `https://gouvernance.ai${article.cover}`,
          "width": 1200,
          "height": 630,
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://gouvernance.ai/actualites/${article.slug}`,
        },
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://gouvernance.ai/" },
          { "@type": "ListItem", "position": 2, "name": "Actualités", "item": "https://gouvernance.ai/actualites" },
          { "@type": "ListItem", "position": 3, "name": article.title },
        ],
      }} />
      <div className="overflow-x-hidden">
        {/* Article content */}
        <section className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 1. Cover image */}
            {!coverError ? (
              <img
                src={article.cover}
                alt={article.title}
                className="w-full max-h-96 object-cover rounded-2xl"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="w-full max-h-96 h-64 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <Newspaper className="size-16 text-white/60" />
              </div>
            )}

            {/* 2. Meta row */}
            <div className="flex items-center gap-3 mt-8">
              <Badge
                variant="outline"
                className={cn("text-xs rounded-full", categoryColors[article.category])}
              >
                {categoryLabels[article.category]}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="size-3.5" />
                {article.readingTime} min de lecture
              </span>
            </div>

            {/* 3. Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mt-6">
              {article.title}
            </h1>

            {/* 4. Excerpt */}
            <p className="text-lg sm:text-xl text-muted-foreground mt-4">
              {article.excerpt}
            </p>

            {/* 5. Author compact row */}
            {author && (
              <div className="mt-6 flex items-center gap-3">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="size-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallback = (e.target as HTMLImageElement)
                        .nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="size-10 rounded-full bg-purple-600 text-white text-sm font-semibold items-center justify-center"
                  style={{ display: author.avatar ? "none" : "flex" }}
                >
                  {getInitials(author.name)}
                </div>
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {author.name}
                    {author.linkedin && (
                      <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="size-4" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {author.title} &middot; {formatDate(article.date)}
                  </div>
                </div>
              </div>
            )}

            {/* 6. Separator */}
            <hr className="my-8 border-neutral-200" />

            {/* 7. Markdown content */}
            <article className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </article>

            {/* 8. Separator */}
            <hr className="my-8 border-neutral-200" />

            {/* 9. Share buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Partager :</span>
              <Button variant="outline" size="sm" onClick={handleShareLinkedIn}>
                <Linkedin className="size-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareTwitter}>
                <Twitter className="size-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Link2 className="size-4" />
                <span className="sr-only">Copier le lien</span>
              </Button>
            </div>

            {/* 10. Author card */}
            {author && (
              <Card className="mt-12 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="size-16 rounded-full object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const fallback = (e.target as HTMLImageElement)
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="size-16 rounded-full bg-purple-600 text-white text-lg font-semibold items-center justify-center shrink-0"
                      style={{ display: author.avatar ? "none" : "flex" }}
                    >
                      {getInitials(author.name)}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground flex items-center gap-2">
                        {author.name}
                        {author.linkedin && (
                          <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Linkedin className="size-5" />
                          </a>
                        )}
                      </div>
                      <div className="text-muted-foreground">{author.title}</div>
                      {author.bio && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* 11. Related articles */}
        {relatedArticles.length > 0 && (
          <section className="py-16 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Articles similaires
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/actualites/${related.slug}`}
                    className="group"
                  >
                    <Card className="rounded-2xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {related.cover ? (
                        <img
                          src={related.cover}
                          alt={related.title}
                          className="aspect-[16/9] w-full object-cover rounded-t-2xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="aspect-[16/9] w-full bg-gradient-to-br from-purple-600 to-purple-800 rounded-t-2xl flex items-center justify-center">
                          <Newspaper className="size-10 text-white/60" />
                        </div>
                      )}
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs rounded-full",
                              categoryColors[related.category],
                            )}
                          >
                            {categoryLabels[related.category]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(related.date)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 12. Newsletter CTA */}
        <section className="py-24 sm:py-32 bg-neutral-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Newspaper className="size-10 text-purple-400 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Restez inform\u00e9
            </h2>
            <p className="text-neutral-400 text-lg mb-8">
              Abonnez-vous \u00e0 notre infolettre pour ne rien manquer.
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
