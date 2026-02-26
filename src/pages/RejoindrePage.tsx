import { useState } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  Lightbulb,
  Handshake,
} from "lucide-react";

import { cn } from "@/lib/utils";
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

const membershipTiers = [
  {
    name: "Membre expert",
    description: "Professionnels reconnus en gouvernance IA",
    features: [
      "Accès complet aux ressources",
      "Participation aux comités",
      "Profil expert public",
      "Droit de vote",
    ],
    popular: true,
  },
  {
    name: "Membre associé",
    description: "Professionnels en début de parcours en gouvernance IA",
    features: [
      "Accès aux ressources",
      "Participation aux événements",
      "Mentorat par un expert",
    ],
    popular: false,
  },
  {
    name: "Membre organisationnel",
    description: "Organisations souhaitant structurer leur gouvernance IA",
    features: [
      "Jusqu'à 5 représentants",
      "Diagnostic de maturité inclus",
      "Accompagnement personnalisé",
    ],
    popular: false,
  },
  {
    name: "Membre honoraire",
    description: "Personnalités ayant contribué de manière exceptionnelle",
    features: [
      "Invitation sur recommandation",
      "Accès à vie",
      "Rôle consultatif",
    ],
    popular: false,
  },
];

const MEMBERSHIP_OPTIONS = [
  "Membre expert",
  "Membre associé",
  "Membre organisationnel",
  "Membre honoraire",
] as const;

export function RejoindrePage() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    organisation: "",
    titre: "",
    niveau: "" as string,
    domaines: "",
    motivation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Membership application submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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

      {/* SECTION: Niveaux de membership */}
      <section className="py-24 sm:py-32 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-16 text-center">
            Niveaux de membership
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative rounded-3xl transition-all duration-300 p-6",
                  tier.popular
                    ? "bg-white/5 border border-brand-purple/50 shadow-lg shadow-brand-purple/15 hover:shadow-xl"
                    : "bg-white/5 border border-white/10 hover:border-white/20 hover:shadow-lg"
                )}
              >
                {tier.popular && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-purple text-white border-0 rounded-full px-3 py-0.5 text-xs font-medium"
                  >
                    Le plus populaire
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <p className="text-sm text-neutral-400 mt-1">{tier.description}</p>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-neutral-300">
                      <span className="size-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Critères d'admissibilité */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-8 text-center">
            Critères d&apos;admissibilité
          </h2>
          <p className="text-lg text-neutral-600 mb-8 text-center">
            Le Cercle de Gouvernance de l&apos;IA accueille des professionnels et organisations qui
            partagent notre engagement envers une IA responsable.
          </p>
          <ul className="space-y-4 text-neutral-600">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                1
              </span>
              Expertise dans au moins un domaine lié à l&apos;IA (technique, éthique, juridique,
              stratégique)
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                2
              </span>
              Engagement envers les principes de gouvernance responsable
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                3
              </span>
              Volonté de contribuer activement aux travaux du Cercle
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                4
              </span>
              Parrainage par un membre existant (recommandé, non obligatoire)
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION: Formulaire de candidature */}
      <section className="py-24 sm:py-32 bg-neutral-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 text-center">
            Soumettre votre candidature
          </h2>
          <p className="text-neutral-400 mb-10 text-center">
            Notre comité examine chaque candidature sous 10 jours ouvrables.
          </p>

          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="prenom" className="block text-sm font-medium text-neutral-200">
                    Prénom <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    placeholder="Votre prénom"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="nom" className="block text-sm font-medium text-neutral-200">
                    Nom <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    placeholder="Votre nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-200">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="organisation" className="block text-sm font-medium text-neutral-200">
                    Organisation
                  </label>
                  <input
                    id="organisation"
                    name="organisation"
                    type="text"
                    placeholder="Votre entreprise ou organisation"
                    value={formData.organisation}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="titre" className="block text-sm font-medium text-neutral-200">
                    Titre / Fonction
                  </label>
                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    placeholder="Votre titre"
                    value={formData.titre}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="niveau" className="block text-sm font-medium text-neutral-200">
                  Niveau de membership souhaité
                </label>
                <select
                  id="niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                >
                  <option value="" className="bg-neutral-900 text-neutral-400">Sélectionnez un niveau</option>
                  {MEMBERSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-neutral-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="domaines" className="block text-sm font-medium text-neutral-200">
                  Domaines d&apos;expertise
                </label>
                <textarea
                  id="domaines"
                  name="domaines"
                  placeholder="Décrivez vos domaines d'expertise (technique, éthique, juridique, stratégie...)"
                  rows={4}
                  value={formData.domaines}
                  onChange={handleChange}
                  className="flex min-h-[100px] w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="motivation" className="block text-sm font-medium text-neutral-200">
                  Motivation <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  placeholder="Pourquoi souhaitez-vous rejoindre le Cercle ?"
                  rows={5}
                  required
                  value={formData.motivation}
                  onChange={handleChange}
                  className="flex min-h-[120px] w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
              >
                Soumettre ma candidature
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
