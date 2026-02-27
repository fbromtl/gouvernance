import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const articles = [
  {
    badge: "Communiqué",
    date: "5 février 2026",
    title: "Le Cercle de Gouvernance de l'IA annonce son sommet annuel 2026",
    excerpt:
      "L'événement se tiendra le 20 mai à Montréal et réunira plus de 200 participants.",
    href: "#",
  },
  {
    badge: "Analyse",
    date: "28 janvier 2026",
    title: "AI Act européen : premières interdictions en vigueur depuis février 2025",
    excerpt: "Retour sur les implications pour les organisations canadiennes.",
    href: "#",
  },
  {
    badge: "Veille",
    date: "15 janvier 2026",
    title: "Mise à jour du cadre MCN pour l'IA générative au Québec",
    excerpt:
      "Le ministère de la Cybersécurité et du Numérique publie de nouvelles directives.",
    href: "#",
  },
  {
    badge: "Opinion",
    date: "8 janvier 2026",
    title: "Pourquoi la certification ISO 42001 deviendra un avantage concurrentiel en 2026",
    excerpt:
      "Analyse des tendances de certification dans l'écosystème québécois.",
    href: "#",
  },
  {
    badge: "Nomination",
    date: "20 décembre 2025",
    title: "Nouveaux membres au comité directeur du Cercle",
    excerpt: "Bienvenue aux trois nouveaux experts qui rejoignent notre gouvernance.",
    href: "#",
  },
  {
    badge: "Événement",
    date: "12 décembre 2025",
    title: "Récapitulatif de notre première table ronde sur la Loi 25 et l'IA",
    excerpt: "Plus de 50 participants ont échangé sur les défis de conformité.",
    href: "#",
  },
];

const badgeColors: Record<string, string> = {
  Communiqué: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  Analyse: "bg-primary/15 text-primary border-primary/30",
  Veille: "border-muted-foreground text-muted-foreground",
  Opinion: "bg-primary/15 text-primary border-primary/30",
  Nomination: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  Événement: "bg-primary/15 text-primary border-primary/30",
};

export function ActualitesPage() {
  return (
    <>
      <SEO title="Actualités" description="Suivez les dernières actualités en gouvernance de l'intelligence artificielle : réglementation, technologies, événements et publications." />
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
            Nouvelles du Cercle, veille stratégique et prises de position sur la gouvernance de
            l&apos;IA.
          </p>
        </div>
      </section>

      {/* NEWS GRID */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.title}
                className="group rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={article.badge === "Veille" ? "outline" : "secondary"}
                      className={cn("text-xs rounded-full", badgeColors[article.badge])}
                    >
                      {article.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-tight">
                    <Link
                      to={article.href}
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
                    to={article.href}
                    className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 group/link"
                  >
                    Lire la suite
                    <ArrowRight className="size-4 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
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
