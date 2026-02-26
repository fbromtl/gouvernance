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
    <Card className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
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
        <Link
          to={content.ctaTo}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
        >
          {content.cta}
          <ArrowRight className="size-4" />
        </Link>
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
            Pour les organisations
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Des programmes adaptés à chaque type d&apos;organisation pour structurer une gouvernance
            IA efficace et conforme.
          </p>
        </div>
      </section>

      {/* TABS CONTENT */}
      <section className="py-24 sm:py-32 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 text-center mb-12">
            Un programme pour chaque réalité
          </h2>
          <Tabs defaultValue="pme" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1.5 mb-10 rounded-full bg-neutral-100 border border-neutral-200">
              {orgTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex-1 min-w-[140px] sm:min-w-0 gap-2 rounded-full transition-all",
                    "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-neutral-950"
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

      {/* DARK CTA SECTION */}
      <section className="py-24 sm:py-32 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6">
            Prêt à structurer votre gouvernance IA?
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
            Contactez-nous pour découvrir le programme adapté à votre organisation et démarrer votre démarche de gouvernance responsable.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
          >
            Nous contacter
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
