import { Link } from "react-router-dom";
import {
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  Download,
  FileCheck,
  Wrench,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const guides = [
  {
    icon: FileText,
    title: "Guide complet de la gouvernance de l'IA",
    description:
      "Les sept piliers, les cadres réglementaires et les meilleures pratiques en un seul document.",
    badge: "Bientôt disponible" as const,
  },
  {
    icon: ClipboardList,
    title: "Gabarit de politique d'utilisation de l'IA",
    description: "Modèle prêt à adapter pour encadrer l'utilisation de l'IA dans votre organisation.",
    badge: "Bientôt disponible" as const,
  },
  {
    icon: AlertTriangle,
    title: "Grille d'évaluation des risques IA",
    description: "Matrice structurée pour identifier, évaluer et prioriser les risques liés à vos systèmes d'IA.",
    badge: "Bientôt disponible" as const,
  },
  {
    icon: CheckSquare,
    title: "Checklist de conformité réglementaire",
    description: "Liste de vérification couvrant la Loi 25, l'AI Act et les directives canadiennes.",
    badge: "Gratuit" as const,
  },
];

const outils = [
  "Checklist de conformité Loi 25 pour l'IA",
  "Modèle d'évaluation d'impact algorithmique",
  "Template de politique d'IA générative",
  "FAQ juridique — IA et protection des données",
];

const veilleContent = {
  quebec:
    "Loi 25 en vigueur, cadre MCN publié décembre 2025, 12 principes éthiques. Les organisations doivent adapter leurs pratiques de gouvernance IA aux exigences québécoises.",
  canada:
    "C-27 mort au feuilleton, LPRPDE/PIPEDA active, approche codes volontaires. Le Canada poursuit une stratégie d'IA responsable centrée sur les principes directeurs.",
  ue: "AI Act en déploiement progressif 2024-2027, approche basée sur les risques. Classification par niveaux de risque : inacceptable, élevé, limité, minimal.",
  international:
    "OCDE, UNESCO, ISO 42001, IEEE 7000. Les cadres internationaux convergent vers des principes communs : transparence, redevabilité, équité.",
};

const etudesDeCas = [
  "Implantation d'un cadre de gouvernance IA dans une institution financière",
  "Conformité à la Loi 25 pour un réseau de santé",
  "Gouvernance de l'IA générative dans une PME technologique",
];

export function RessourcesPage() {
  return (
    <>
      <SEO title="Ressources" description="Guides, cadres de gouvernance, boîte à outils, veille réglementaire et études de cas pour la gouvernance de l'intelligence artificielle." />
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
            Ressources
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Guides pratiques, outils et veille réglementaire pour structurer votre gouvernance de
            l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Guides et cadres de référence */}
      <section id="guides" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Guides et cadres de référence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Documents téléchargeables et gabarits pour structurer votre démarche de gouvernance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <Card
                key={guide.title}
                className="border-2 hover:border-primary/30 transition-all group flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <guide.icon className="size-5" />
                    </div>
                    <Badge
                      variant={guide.badge === "Gratuit" ? "default" : "secondary"}
                      className={cn(
                        guide.badge === "Gratuit" && "bg-brand-purple/20 text-brand-purple-dark"
                      )}
                    >
                      {guide.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {guide.description}
                  </CardDescription>
                  <div className="mt-4 flex justify-end">
                    <Download className="size-4 text-muted-foreground opacity-60" aria-hidden />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Boîte à outils */}
      <section id="outils" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Boîte à outils
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils pratiques pour accompagner votre démarche au quotidien.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {outils.map((outil, index) => (
              <Card
                key={outil}
                className="border-2 hover:border-primary/30 transition-all flex flex-row items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ml-4">
                  {index === 0 ? (
                    <FileCheck className="size-5" />
                  ) : index === 1 ? (
                    <ClipboardList className="size-5" />
                  ) : index === 2 ? (
                    <FileText className="size-5" />
                  ) : (
                    <BookOpen className="size-5" />
                  )}
                </div>
                <CardContent className="py-4 pl-0">
                  <p className="font-medium text-foreground">{outil}</p>
                </CardContent>
                <div className="ml-auto pr-4">
                  <Wrench className="size-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Veille réglementaire */}
      <section id="veille" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Veille réglementaire
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Suivi des lois et règlements en matière d&apos;intelligence artificielle au Québec, au
              Canada et à l&apos;international.
            </p>
          </div>

          <Tabs defaultValue="quebec" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 p-1">
              <TabsTrigger value="quebec" className="text-xs sm:text-sm py-2">
                Québec
              </TabsTrigger>
              <TabsTrigger value="canada" className="text-xs sm:text-sm py-2">
                Canada
              </TabsTrigger>
              <TabsTrigger value="ue" className="text-xs sm:text-sm py-2">
                Union européenne
              </TabsTrigger>
              <TabsTrigger value="international" className="text-xs sm:text-sm py-2">
                International
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="quebec" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">{veilleContent.quebec}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="canada" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">{veilleContent.canada}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ue" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">{veilleContent.ue}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="international" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {veilleContent.international}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="text-center mt-10">
            <Button asChild size="lg" className="px-8">
              <Link to="/contact">Recevoir les mises à jour réglementaires</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION: Études de cas */}
      <section id="etudes" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Études de cas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exemples concrets d&apos;implantation de gouvernance IA par secteur d&apos;activité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {etudesDeCas.map((etude) => (
              <Card
                key={etude}
                className="border-2 border-dashed hover:border-primary/20 transition-all relative overflow-hidden"
              >
                <CardHeader>
                  <Badge variant="secondary" className="absolute top-4 right-4 w-fit">
                    À venir
                  </Badge>
                  <CardTitle className="text-lg pr-20">{etude}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Cette étude de cas sera bientôt disponible pour illustrer les meilleures
                    pratiques de gouvernance IA.
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
