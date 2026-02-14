import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const upcomingEvents = [
  {
    badge: "Table ronde",
    date: "15 mars 2026",
    title: "Gouvernance de l'IA générative : défis et opportunités",
    description:
      "Discussion entre experts sur les enjeux spécifiques de gouvernance liés aux modèles génératifs.",
    location: "En ligne",
    cta: "S'inscrire",
    href: "#",
  },
  {
    badge: "Webinaire",
    date: "2 avril 2026",
    title: "Conformité à l'AI Act : ce que les organisations canadiennes doivent savoir",
    description:
      "Présentation des obligations extraterritoriales du règlement européen.",
    location: "En ligne",
    cta: "S'inscrire",
    href: "#",
  },
  {
    badge: "Conférence",
    date: "20 mai 2026",
    title: "Sommet annuel de la Gouvernance de l'IA",
    description:
      "Une journée complète dédiée aux meilleures pratiques en gouvernance de l'IA, avec panels d'experts et ateliers.",
    location: "Montréal, QC",
    cta: "Réserver votre place",
    href: "/contact",
  },
];

const pastEvents = [
  {
    date: "15 janvier 2026",
    title: "Introduction à la gouvernance de l'IA pour les dirigeants",
    badge: "Récapitulatif disponible",
  },
  {
    date: "10 décembre 2025",
    title: "La Loi 25 et ses implications pour les systèmes d'IA",
    badge: "Enregistrement disponible",
  },
];

export function EvenementsPage() {
  return (
    <>
      <SEO title="Événements" description="Participez aux événements du Cercle de Gouvernance de l'IA : conférences, tables rondes, ateliers sur la gouvernance responsable de l'intelligence artificielle." />
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
            Événements
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Conférences, tables rondes et webinaires pour approfondir les enjeux de la gouvernance
            de l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Événements à venir */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12">
            Événements à venir
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card
                key={event.title}
                className="border-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-brand-purple/15 text-brand-purple-dark font-medium"
                    >
                      {event.badge}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-4 shrink-0" />
                      {event.date}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {event.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild size="sm">
                    <Link to={event.href}>{event.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Sommet annuel */}
      <section
        id="sommet"
        className="py-20 sm:py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#252243] via-[#3a1d6e] to-[#1e1a30]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 70%, rgba(171, 84, 243, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(49, 45, 238, 0.25) 0%, transparent 50%)
            `,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sommet annuel de la Gouvernance de l&apos;IA
          </h2>
          <p className="text-lg text-purple-200/90 mb-2">
            20 mai 2026 — Montréal
          </p>
          <p className="text-lg text-purple-100/90 mb-10 max-w-2xl mx-auto">
            L&apos;événement phare du Cercle réunit les décideurs, experts et praticiens pour une
            journée de partage, d&apos;apprentissage et de réseautage autour de la gouvernance
            responsable de l&apos;IA.
          </p>
          <ul className="flex flex-wrap justify-center gap-4 mb-10 text-purple-100/90">
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-purple-light" />
              Panels d&apos;experts
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-purple-light" />
              Ateliers pratiques
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-purple-light" />
              Réseautage dirigé
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-purple-light" />
              Études de cas
            </li>
          </ul>
          <Button asChild size="lg" className="px-8 py-6 h-auto text-base">
            <Link to="/contact">Réserver votre place</Link>
          </Button>
        </div>
      </section>

      {/* SECTION: Événements passés */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12">
            Événements passés
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            {pastEvents.map((event) => (
              <Card
                key={event.title}
                className="border-2 bg-muted/50 opacity-90 hover:opacity-100 transition-opacity"
              >
                <CardHeader className="pb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="size-4 shrink-0" />
                    {event.date}
                  </span>
                  <CardTitle className="text-lg text-muted-foreground">{event.title}</CardTitle>
                  <Badge variant="outline" className="w-fit mt-2 text-xs">
                    {event.badge}
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-muted-foreground">
            Les enregistrements et présentations sont accessibles aux membres du Cercle.
          </p>
        </div>
      </section>
    </div>
    </>
  );
}
