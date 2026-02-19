import {
  ChevronDown,
  Shield,
  Lock,
  FileText,
  TrendingUp,
  Database,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

const committees = [
  {
    icon: Shield,
    title: "Éthique et responsabilité",
    description:
      "Principes éthiques, prévention des biais, impact social de l&apos;IA",
  },
  {
    icon: Lock,
    title: "Cybersécurité IA",
    description:
      "Sécurité des systèmes d&apos;IA, attaques adversariales, protection des modèles",
  },
  {
    icon: FileText,
    title: "Conformité réglementaire",
    description:
      "Veille juridique, conformité aux lois, certification ISO 42001",
  },
  {
    icon: TrendingUp,
    title: "Adoption responsable",
    description:
      "Stratégie d&apos;adoption, gestion du changement, formation des équipes",
  },
  {
    icon: Database,
    title: "Données et vie privée",
    description:
      "Protection des données personnelles, gouvernance des données, Loi 25",
  },
];

export function ExpertsPage() {
  return (
    <>
      <SEO title="Nos experts" description="Plus de 150 experts en gouvernance IA : conformité, éthique, cybersécurité, droit du numérique et stratégie. Découvrez nos comités thématiques." />
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
            Nos experts
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Un réseau multidisciplinaire de professionnels engagés dans la gouvernance
            responsable de l&apos;IA.
          </p>
        </div>
        <a
          href="#comites"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          aria-label="Défiler vers les comités"
        >
          <ChevronDown className="size-8" />
          <span className="text-xs font-medium">Découvrir</span>
        </a>
      </section>

      {/* SECTION: Comités thématiques */}
      <section id="comites" className="py-20 sm:py-24 bg-muted/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Comités thématiques
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Nos experts sont organisés en comités de travail spécialisés pour approfondir les
            enjeux clés de la gouvernance de l&apos;IA.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {committees.map((com) => (
              <Card
                key={com.title}
                className="border-2 hover:border-primary/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <com.icon className="size-6" />
                  </div>
                  <CardTitle className="text-base">{com.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{com.description}</CardDescription>
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
