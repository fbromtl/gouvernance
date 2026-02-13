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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
            Services et accompagnement
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Des solutions sur mesure pour structurer et optimiser la gouvernance de l'IA dans votre
            organisation.
          </p>
        </div>
      </section>

      {/* SECTION: Diagnostic de maturité IA */}
      <section id="diagnostic" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Diagnostic de maturité IA
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Évaluez le niveau de gouvernance IA de votre organisation grâce à notre diagnostic
                structuré. Notre approche couvre les sept piliers essentiels : éthique, sécurité,
                conformité, protection des données, gestion des risques, transparence et formation.
              </p>
              <Button asChild size="lg" className="bg-brand-purple text-white hover:bg-brand-purple-dark">
                <Link to="/contact">Demander un diagnostic</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {diagnosticSteps.map((step) => (
                <Card
                  key={step.num}
                  className="border-2 hover:border-primary/30 transition-all group overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple font-bold text-sm group-hover:bg-brand-purple/30 transition-colors">
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
      <section id="accompagnement" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Accompagnement stratégique
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un accompagnement personnalisé pour chaque type d&apos;organisation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accompagnementTypes.map((item) => (
              <Card
                key={item.title}
                className="border-2 hover:border-primary/30 hover:shadow-lg transition-all group h-full"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Formations et ateliers */}
      <section id="formations" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Formations et ateliers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des programmes de formation adaptés pour développer les compétences en gouvernance de
              l&apos;IA à tous les niveaux de l&apos;organisation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <Card
                key={formation.title}
                className="border-2 hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
              >
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {formation.duree}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
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
      <section id="conferences" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Conférences et interventions
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Nos experts sont disponibles pour animer des conférences, panels et tables rondes
                lors de vos événements.
              </p>
              <ul className="space-y-3 mb-8">
                {conferenceTopics.map((topic) => (
                  <li key={topic} className="flex items-center gap-3 text-foreground">
                    <Mic2 className="size-4 text-primary shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-brand-purple text-white hover:bg-brand-purple-dark gap-2">
                <Link to="/contact">
                  Réserver un conférencier
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="size-20 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
