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
  ArrowRight,
} from "lucide-react";

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
            Ressources
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Guides pratiques, outils et veille réglementaire pour structurer votre gouvernance de
            l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Guides et cadres de référence */}
      <section id="guides" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
              Guides et cadres de référence
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Documents téléchargeables et gabarits pour structurer votre démarche de gouvernance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <Card
                key={guide.title}
                className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                      <guide.icon className="size-5" />
                    </div>
                    <Badge
                      variant={guide.badge === "Gratuit" ? "default" : "secondary"}
                      className={cn(
                        "rounded-full",
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
                    <Download className="size-4 text-neutral-400 opacity-60" aria-hidden />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Boîte à outils */}
      <section id="outils" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Boîte à outils
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Des outils pratiques pour accompagner votre démarche au quotidien.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {outils.map((outil, index) => (
              <div
                key={outil}
                className="bg-white/5 border border-white/10 rounded-3xl flex flex-row items-center gap-4 p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-purple-400">
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
                <p className="font-medium text-neutral-200">{outil}</p>
                <div className="ml-auto">
                  <Wrench className="size-4 text-neutral-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Veille réglementaire */}
      <section id="veille" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
              Veille réglementaire
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Suivi des lois et règlements en matière d&apos;intelligence artificielle au Québec, au
              Canada et à l&apos;international.
            </p>
          </div>

          <Tabs defaultValue="quebec" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto rounded-full bg-neutral-100 border border-neutral-200 p-1.5">
              <TabsTrigger value="quebec" className="text-xs sm:text-sm py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Québec
              </TabsTrigger>
              <TabsTrigger value="canada" className="text-xs sm:text-sm py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Canada
              </TabsTrigger>
              <TabsTrigger value="ue" className="text-xs sm:text-sm py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Union européenne
              </TabsTrigger>
              <TabsTrigger value="international" className="text-xs sm:text-sm py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                International
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="quebec" className="mt-0">
                <Card className="rounded-3xl border border-neutral-200">
                  <CardContent className="pt-6">
                    <p className="text-neutral-600 leading-relaxed">{veilleContent.quebec}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="canada" className="mt-0">
                <Card className="rounded-3xl border border-neutral-200">
                  <CardContent className="pt-6">
                    <p className="text-neutral-600 leading-relaxed">{veilleContent.canada}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ue" className="mt-0">
                <Card className="rounded-3xl border border-neutral-200">
                  <CardContent className="pt-6">
                    <p className="text-neutral-600 leading-relaxed">{veilleContent.ue}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="international" className="mt-0">
                <Card className="rounded-3xl border border-neutral-200">
                  <CardContent className="pt-6">
                    <p className="text-neutral-600 leading-relaxed">
                      {veilleContent.international}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="text-center mt-10">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
            >
              Recevoir les mises à jour réglementaires
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: Études de cas */}
      <section id="etudes" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Études de cas
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Exemples concrets d&apos;implantation de gouvernance IA par secteur d&apos;activité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {etudesDeCas.map((etude) => (
              <div
                key={etude}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all relative overflow-hidden"
              >
                <Badge className="rounded-full bg-white/10 text-neutral-300 border border-white/20 mb-4">
                  À venir
                </Badge>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">{etude}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Cette étude de cas sera bientôt disponible pour illustrer les meilleures
                  pratiques de gouvernance IA.
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
