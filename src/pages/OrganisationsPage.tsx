import { Link } from "react-router-dom";
import {
  Building2,
  Heart,
  Building,
  Landmark,
  AlertCircle,
  Target,
  Gift,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const orgTabs = [
  {
    id: "pme",
    label: "PME",
    icon: Building2,
  },
  {
    id: "obnl",
    label: "OBNL",
    icon: Heart,
  },
  {
    id: "grandes",
    label: "Grandes organisations",
    icon: Building,
  },
  {
    id: "public",
    label: "Secteur public",
    icon: Landmark,
  },
];

const tabContent = {
  pme: {
    title: "PME — Une gouvernance accessible et pragmatique",
    challenges: [
      "Ressources limitées",
      "Manque d'expertise interne",
      "Besoin de conformité rapide",
    ],
    approach: "Approche en 5 étapes simplifiées : Inventaire IA, Politique d'utilisation, Évaluation des risques, Conformité Loi 25, Formation continue.",
    benefits: [
      "Tarification adaptée",
      "Accompagnement pas à pas",
      "Accès aux gabarits prêts à l'emploi",
    ],
    cta: "Demander un accompagnement PME",
    ctaTo: "/contact",
  },
  obnl: {
    title: "OBNL — Gouvernance alignée sur votre mission",
    challenges: [
      "Budgets contraints",
      "Obligation de transparence accrue",
      "Responsabilité sociale",
    ],
    approach: "Gouvernance proportionnée à la mission, mutualisation entre OBNL, attention aux populations vulnérables.",
    benefits: [
      "Tarifs préférentiels",
      "Possibilité de subventions",
      "Ressources mutualisées",
    ],
    cta: "Découvrir l'offre OBNL",
    ctaTo: "/contact",
  },
  grandes: {
    title: "Grandes organisations — Programmes sur mesure",
    challenges: [
      "Systèmes IA complexes",
      "Enjeux réglementaires multiples",
      "Coordination inter-départements",
    ],
    approach: "Alignement ISO 42001, comités internes de gouvernance, programmes de certification.",
    benefits: [
      "Accompagnement personnalisé",
      "Expertise multi-cadres",
      "Audit et certification",
    ],
    cta: "Planifier une consultation",
    ctaTo: "/contact",
  },
  public: {
    title: "Secteur public — Conformité et transparence",
    challenges: [
      "Reddition de comptes",
      "Transparence algorithmique",
      "Cadre MCN, directives gouvernementales",
    ],
    approach: "Conformité aux cadres québécois et canadiens, transparence dans les décisions automatisées.",
    benefits: [
      "Expertise réglementaire spécialisée",
      "Accompagnement conforme aux directives publiques",
    ],
    cta: "Nous contacter",
    ctaTo: "/contact",
  },
} as const;

type TabKey = keyof typeof tabContent;

function TabCard({ content, Icon }: { content: (typeof tabContent)[TabKey]; Icon: typeof Building2 }) {
  return (
    <Card className="border-2 hover:border-primary/30 transition-all overflow-hidden">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
          <Icon className="size-6" />
        </div>
        <CardTitle className="text-xl">{content.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="size-4 text-primary shrink-0" />
            Défis
          </h4>
          <ul className="space-y-1 text-muted-foreground text-sm">
            {content.challenges.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Target className="size-4 text-primary shrink-0" />
            Notre approche
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{content.approach}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Gift className="size-4 text-primary shrink-0" />
            Avantages
          </h4>
          <ul className="space-y-1 text-muted-foreground text-sm">
            {content.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <Button asChild className="gap-2 px-8">
          <Link to={content.ctaTo}>
            {content.cta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function OrganisationsPage() {
  return (
    <>
      <SEO title="Organisations membres" description="Découvrez les organisations membres du Cercle de Gouvernance de l'IA et leurs contributions à la gouvernance responsable." />
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
            Pour les organisations
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Des programmes adaptés à chaque type d&apos;organisation pour structurer une gouvernance
            IA efficace et conforme.
          </p>
        </div>
      </section>

      {/* TABS CONTENT */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="pme" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 mb-8 bg-muted">
              {orgTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex-1 min-w-[140px] sm:min-w-0 gap-2",
                    "data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  )}
                >
                  <tab.icon className="size-4 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {orgTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <TabCard content={tabContent[tab.id as TabKey]} Icon={tab.icon} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
    </>
  );
}
