import {
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
            Nos experts
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Un réseau multidisciplinaire de professionnels engagés dans la gouvernance
            responsable de l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Comités thématiques */}
      <section id="comites" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 text-center">
            Comités thématiques
          </h2>
          <p className="text-lg text-neutral-400 text-center mb-16 max-w-2xl mx-auto">
            Nos experts sont organisés en comités de travail spécialisés pour approfondir les
            enjeux clés de la gouvernance de l&apos;IA.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {committees.map((com) => (
              <Card
                key={com.title}
                className="bg-white/5 border border-white/10 rounded-3xl hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <com.icon className="size-6" />
                  </div>
                  <CardTitle className="text-base text-white">{com.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-neutral-400">{com.description}</CardDescription>
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
