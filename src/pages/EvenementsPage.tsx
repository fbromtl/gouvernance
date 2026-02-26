import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

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
            Événements
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Conférences, tables rondes et webinaires pour approfondir les enjeux de la gouvernance
            de l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Événements à venir */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-12">
            Événements à venir
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card
                key={event.title}
                className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-brand-purple/15 text-brand-purple-dark font-medium"
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
                  <Link
                    to={event.href}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
                  >
                    {event.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Sommet annuel */}
      <section
        id="sommet"
        className="py-24 sm:py-32 relative overflow-hidden"
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
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
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
          >
            Réserver votre place
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* SECTION: Événements passés (dark) */}
      <section className="py-24 sm:py-32 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-12">
            Événements passés
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            {pastEvents.map((event) => (
              <Card
                key={event.title}
                className="rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <CardHeader className="pb-2">
                  <span className="text-sm text-neutral-400 flex items-center gap-1.5 mb-2">
                    <Calendar className="size-4 shrink-0" />
                    {event.date}
                  </span>
                  <CardTitle className="text-lg text-neutral-300">{event.title}</CardTitle>
                  <Badge variant="outline" className="rounded-full w-fit mt-2 text-xs border-white/20 text-neutral-400">
                    {event.badge}
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-neutral-400">
            Les enregistrements et présentations sont accessibles aux membres du Cercle.
          </p>
        </div>
      </section>
    </div>
    </>
  );
}
