import { Link } from "react-router-dom";
import {
  Building,
  Landmark,
  Heart,
  Building2,
  FileText,
  Mic2,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO, JsonLd } from "@/components/SEO";

const diagnosticSteps = [
  { num: 1, title: "Audit initial", desc: "Cartographie de vos usages actuels de l'IA" },
  { num: 2, title: "Évaluation", desc: "Analyse des écarts par rapport aux cadres de référence" },
  { num: 3, title: "Recommandations", desc: "Plan d'action priorisé avec jalons clairs" },
  { num: 4, title: "Suivi", desc: "Accompagnement dans la mise en œuvre" },
];

const accompagnementTypes = [
  {
    icon: Building,
    title: "PME",
    description:
      "Approche pragmatique et accessible, adaptée aux ressources limitées. Politique d'utilisation, évaluation des risques, conformité Loi 25.",
  },
  {
    icon: Landmark,
    title: "Grandes organisations",
    description:
      "Alignement ISO 42001, comités de gouvernance, programmes de certification et audit.",
  },
  {
    icon: Heart,
    title: "OBNL",
    description:
      "Gouvernance alignée sur la mission, transparence renforcée, mutualisation des ressources entre organisations.",
  },
  {
    icon: Building2,
    title: "Secteur public et parapublic",
    description:
      "Conformité aux directives gouvernementales, transparence algorithmique, reddition de comptes.",
  },
];

const formations = [
  {
    title: "Sensibilisation à la gouvernance IA",
    duree: "1 journée",
    public: "Dirigeants et gestionnaires",
    description: "Comprendre les enjeux, les risques et les opportunités de la gouvernance de l'IA.",
  },
  {
    title: "Certification interne en gouvernance IA",
    duree: "3 jours",
    public: "Responsables conformité et TI",
    description:
      "Maîtriser les cadres ISO 42001 et NIST AI RMF pour implanter une gouvernance structurée.",
  },
  {
    title: "Ateliers pratiques",
    duree: "Demi-journée",
    public: "Équipes opérationnelles",
    description:
      "Exercices concrets : évaluation des risques, rédaction de politiques IA, analyse d'impact.",
  },
];

const conferenceTopics = [
  "Gouvernance de l'IA générative",
  "Conformité à l'AI Act européen",
  "Éthique et biais algorithmiques",
  "Cybersécurité des systèmes d'IA",
  "Stratégie d'adoption responsable",
];

export function ServicesPage() {
  return (
    <>
      <SEO title="Services" description="Diagnostic de maturité IA, accompagnement stratégique, formations et conférences. Des services adaptés pour la gouvernance responsable de l'intelligence artificielle." />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Services de Gouvernance IA",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Diagnostic de maturité IA", "url": "https://gouvernance.ai/services#diagnostic" },
          { "@type": "ListItem", "position": 2, "name": "Accompagnement stratégique", "url": "https://gouvernance.ai/services#accompagnement" },
          { "@type": "ListItem", "position": 3, "name": "Formations et ateliers", "url": "https://gouvernance.ai/services#formations" },
          { "@type": "ListItem", "position": 4, "name": "Conférences et interventions", "url": "https://gouvernance.ai/services#conferences" }
        ]
      }} />
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
            Services et accompagnement
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Des solutions sur mesure pour structurer et optimiser la gouvernance de l&apos;IA dans votre
            organisation.
          </p>
        </div>
      </section>

      {/* SECTION: Diagnostic de maturité IA */}
      <section id="diagnostic" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
                Diagnostic de maturité IA
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                Évaluez le niveau de gouvernance IA de votre organisation grâce à notre diagnostic
                structuré. Notre approche couvre les sept piliers essentiels : éthique, sécurité,
                conformité, protection des données, gestion des risques, transparence et formation.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
              >
                Demander un diagnostic
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {diagnosticSteps.map((step) => (
                <Card
                  key={step.num}
                  className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-purple/20 text-brand-purple font-bold text-sm group-hover:bg-brand-purple/30 transition-colors">
                        {step.num}
                      </span>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">{step.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Accompagnement stratégique */}
      <section id="accompagnement" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Accompagnement stratégique
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Un accompagnement personnalisé pour chaque type d&apos;organisation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accompagnementTypes.map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group h-full"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-purple-400 mb-3 group-hover:bg-white/15 transition-colors">
                  <item.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Formations et ateliers */}
      <section id="formations" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
              Formations et ateliers
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Des programmes de formation adaptés pour développer les compétences en gouvernance de
              l&apos;IA à tous les niveaux de l&apos;organisation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <Card
                key={formation.title}
                className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {formation.duree}
                    </Badge>
                    <Badge variant="outline" className="text-xs rounded-full">
                      {formation.public}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{formation.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="leading-relaxed">{formation.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Conférences et interventions */}
      <section id="conferences" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                Conférences et interventions
              </h2>
              <p className="text-lg text-neutral-300 leading-relaxed mb-6">
                Nos experts sont disponibles pour animer des conférences, panels et tables rondes
                lors de vos événements.
              </p>
              <ul className="space-y-3 mb-8">
                {conferenceTopics.map((topic) => (
                  <li key={topic} className="flex items-center gap-3 text-neutral-300">
                    <Mic2 className="size-4 text-purple-400 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
              >
                Réserver un conférencier
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="flex h-48 w-48 items-center justify-center bg-white/5 rounded-3xl text-purple-400/40">
                <FileText className="size-20" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
