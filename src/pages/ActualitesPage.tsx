import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(171, 84, 243, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(49, 45, 238, 0.25) 0%, transparent 50%)
            `,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Actualités
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Nouvelles du Cercle, veille stratégique et prises de position sur la gouvernance de
            l&apos;IA.
          </p>
        </div>
      </section>

      {/* NEWS GRID */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.title}
                className="group border-2 hover:border-primary/30 hover:shadow-lg transition-all h-full flex flex-col"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={article.badge === "Veille" ? "outline" : "secondary"}
                      className={cn("text-xs", badgeColors[article.badge])}
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

          <div className="mt-16 text-center p-6 rounded-xl bg-muted/50 border">
            <Newspaper className="size-10 text-primary mx-auto mb-3 opacity-70" />
            <p className="text-muted-foreground">
              Abonnez-vous à notre infolettre pour ne rien manquer.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-3 text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Nous contacter
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
