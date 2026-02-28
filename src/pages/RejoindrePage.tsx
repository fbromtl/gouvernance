import {
  Users,
  BookOpen,
  Calendar,
  Award,
  Lightbulb,
  Handshake,
} from "lucide-react";

import { SEO } from "@/components/SEO";

const benefits = [
  {
    icon: Users,
    title: "Réseau d'excellence",
    description:
      "Accédez à une communauté de 150+ experts en gouvernance de l'IA, issus de 15 disciplines.",
  },
  {
    icon: BookOpen,
    title: "Ressources exclusives",
    description:
      "Guides pratiques, gabarits de politiques, grilles d'évaluation et outils disponibles uniquement aux membres.",
  },
  {
    icon: Calendar,
    title: "Événements privilégiés",
    description:
      "Accès prioritaire aux tables rondes, webinaires et au sommet annuel.",
  },
  {
    icon: Award,
    title: "Visibilité professionnelle",
    description:
      "Profil d'expert sur notre plateforme, opportunités de conférences et de publications.",
  },
  {
    icon: Lightbulb,
    title: "Veille stratégique",
    description:
      "Analyses réglementaires, tendances technologiques et retours d'expérience en avant-première.",
  },
  {
    icon: Handshake,
    title: "Collaborations",
    description:
      "Participez à des projets de recherche et des comités thématiques avec des pairs de haut niveau.",
  },
];

export function RejoindrePage() {
  return (
    <>
      <SEO title="Rejoindre le Cercle" description="Rejoignez un réseau de 150+ experts en gouvernance IA. Accédez à des ressources exclusives, événements et mentorat." />
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 mb-6">
            Rejoindre le Cercle
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Intégrez un réseau d&apos;experts de premier plan et contribuez à façonner l&apos;avenir
            de la gouvernance de l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Pourquoi devenir membre */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4 text-center">
            Pourquoi devenir membre ?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-16 text-center">
            Des avantages concrets pour accélérer votre impact en gouvernance de l&apos;IA.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 group p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-4 group-hover:bg-purple-200 transition-colors">
                  <benefit.icon className="size-7" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-950 mb-2">{benefit.title}</h3>
                <p className="text-base leading-relaxed text-neutral-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
