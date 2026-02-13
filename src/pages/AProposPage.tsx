import { Link } from "react-router-dom";
import {
  ChevronDown,
  Target,
  Eye,
  Users,
  BookOpen,
  Shield,
  FileCheck,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AProposPage() {
  const values = [
    {
      title: "Transparence",
      description: "Nous documentons nos méthodologies et partageons ouvertement nos référentiels pour construire la confiance.",
    },
    {
      title: "Rigueur",
      description: "Nos travaux s'appuient sur des cadres reconnus et des processus de validation éprouvés.",
    },
    {
      title: "Collaboration",
      description: "Nous favorisons l'échange entre experts et organisations pour une gouvernance collective.",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Genèse",
      description:
        "Constat du besoin d'un cadre structuré pour la gouvernance de l'IA au Québec et au Canada",
    },
    {
      year: "2025",
      title: "Fondation",
      description:
        "Création du Cercle de Gouvernance de l'IA, rassemblement des premiers experts",
    },
    {
      year: "2025",
      title: "Premiers travaux",
      description:
        "Publication de guides pratiques, premières tables rondes thématiques",
    },
    {
      year: "2026",
      title: "Expansion",
      description:
        "Ouverture aux organisations, lancement des programmes d'accompagnement",
    },
  ];

  const frameworks = [
    {
      name: "Loi 25 (Québec)",
      description: "Protection des renseignements personnels",
      origin: "Québec",
    },
    {
      name: "Projet de loi C-27",
      description: "Loi sur l'intelligence artificielle et les données",
      origin: "Canada",
    },
    {
      name: "AI Act (UE)",
      description: "Règlement européen sur l'intelligence artificielle",
      origin: "UE",
    },
    {
      name: "NIST AI RMF",
      description: "Cadre de gestion des risques de l'IA",
      origin: "États-Unis",
    },
    {
      name: "ISO/IEC 42001",
      description: "Système de gestion de l'intelligence artificielle",
      origin: "International",
    },
  ];

  const gouvernanceItems = [
    {
      title: "Comité directeur",
      description:
        "Un groupe de dirigeants et d'experts assure l'orientation stratégique du Cercle, la validation des travaux et la représentation auprès des parties prenantes.",
    },
    {
      title: "Charte éthique",
      description:
        "Des principes de conduite guident nos activités : impartialité, intégrité intellectuelle, respect de la confidentialité et engagement envers le bien commun.",
    },
    {
      title: "Processus décisionnel",
      description:
        "Les orientations majeures sont prises collectivement, selon des mécanismes de concertation et de vote définis dans nos statuts.",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(171,84,243,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(171,84,243,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(171, 84, 243, 0.35) 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            À propos du Cercle
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto mb-10">
            Une communauté d&apos;experts engagés pour une gouvernance responsable de
            l&apos;intelligence artificielle.
          </p>
        </div>
        <a
          href="#mission"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          aria-label="Défiler vers Notre mission"
        >
          <ChevronDown className="size-8" />
          <span className="text-xs font-medium">Découvrir</span>
        </a>
      </section>

      {/* SECTION: Notre mission (id="mission") */}
      <section id="mission" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-16 text-center">
            Notre mission
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Le Cercle de Gouvernance de l&apos;IA existe pour combler un besoin critique :
                accompagner les organisations dans l&apos;adoption éthique, sécuritaire et
                conforme de l&apos;intelligence artificielle. Face à l&apos;évolution rapide
                de l&apos;IA et à la multiplication des cadres réglementaires, les dirigeants
                ont besoin d&apos;un espace d&apos;échange structuré et de ressources pratiques
                pour naviguer avec confiance.
              </p>
              <div className="flex items-start gap-4 rounded-xl bg-primary/5 border border-primary/10 p-6">
                <Eye className="size-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Notre vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Devenir la référence francophone en matière de gouvernance de
                    l&apos;intelligence artificielle, en rassemblant les meilleurs experts
                    et en produisant des ressources concrètes et accessibles.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {values.map((v) => (
                  <Card key={v.title} className="border-2 hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-2">
                      <Target className="size-6 text-primary mb-2" />
                      <CardTitle className="text-base">{v.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">{v.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-8 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">150+</div>
                  <div className="text-sm font-medium text-muted-foreground">Experts</div>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-8 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">15</div>
                  <div className="text-sm font-medium text-muted-foreground">Disciplines</div>
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-8 flex items-center justify-center">
                <Users className="size-24 text-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Notre histoire (id="histoire") */}
      <section id="histoire" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Notre histoire
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Une trajectoire marquée par l&apos;engagement et l&apos;expertise collective.
          </p>
          <div className="relative">
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-primary/30" />
            <div className="space-y-8">
              {milestones.map((m) => (
                <div key={`${m.year}-${m.title}`} className="relative flex gap-6 sm:gap-8 pl-12 sm:pl-16">
                  <div className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {m.year.slice(-2)}
                  </div>
                  <Card className="flex-1 border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{m.year}</Badge>
                      </div>
                      <CardTitle className="text-lg">{m.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{m.description}</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Notre approche (id="approche") */}
      <section id="approche" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Notre approche
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Notre méthodologie s&apos;appuie sur les cadres de référence les plus reconnus
            au niveau international, adaptés à la réalité québécoise et canadienne.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {frameworks.map((f) => (
              <Card
                key={f.name}
                className="border-2 hover:border-primary/30 transition-colors group"
              >
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2 text-xs">
                    {f.origin}
                  </Badge>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    {f.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Gouvernance du cercle (id="gouvernance") */}
      <section id="gouvernance" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Gouvernance du cercle
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Une structure organisationnelle transparente pour garantir l&apos;intégrité et
            l&apos;efficacité de nos actions.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Shield className="size-8 text-primary mb-2" />
                <CardTitle>Comité directeur</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {gouvernanceItems[0].description}
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <FileCheck className="size-8 text-primary mb-2" />
                <CardTitle>Charte éthique</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {gouvernanceItems[1].description}
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Users className="size-8 text-primary mb-2" />
                <CardTitle>Processus décisionnel</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {gouvernanceItems[2].description}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          <div className="text-center">
            <Button asChild size="lg" className="gap-2 px-8">
              <Link to="/rejoindre">
                Rejoindre le Cercle
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
