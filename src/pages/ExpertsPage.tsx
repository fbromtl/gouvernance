import { Link } from "react-router-dom";
import {
  ChevronDown,
  Shield,
  Lock,
  FileText,
  TrendingUp,
  Database,
  UserPlus,
  Handshake,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DOMAIN_COLORS: Record<string, string> = {
  "Éthique IA": "bg-primary/10 text-primary",
  Conformité: "bg-accent/20 text-accent-foreground",
  Cybersécurité: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Droit du numérique": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Science des données": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "Stratégie IA": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

const experts = [
  {
    initials: "ML",
    name: "Marie Lefebvre",
    title: "Directrice, Conformité et gouvernance IA",
    organization: "Institut québécois des données",
    domains: ["Conformité", "Éthique IA", "Droit du numérique"],
    color: "bg-primary/20",
  },
  {
    initials: "JD",
    name: "Jean-François Dubois",
    title: "Responsable de la cybersécurité IA",
    organization: "Centre de recherche en IA",
    domains: ["Cybersécurité", "Science des données"],
    color: "bg-accent/20",
  },
  {
    initials: "SB",
    name: "Sophie Bouchard",
    title: "Avocate, Droit numérique et IA",
    organization: "Cabinet Bouchard & Associés",
    domains: ["Droit du numérique", "Conformité"],
    color: "bg-blue-500/20",
  },
  {
    initials: "PT",
    name: "Pierre Tremblay",
    title: "Chercheur en science des données",
    organization: "Université de Montréal",
    domains: ["Science des données", "Éthique IA"],
    color: "bg-teal-500/20",
  },
  {
    initials: "CL",
    name: "Catherine Lamontagne",
    title: "Stratège IA et transformation numérique",
    organization: "Conseil national des normes",
    domains: ["Stratégie IA", "Conformité"],
    color: "bg-violet-500/20",
  },
  {
    initials: "MG",
    name: "Marc Gagnon",
    title: "Expert en éthique et biais algorithmiques",
    organization: "Observatoire international de l&apos;IA",
    domains: ["Éthique IA", "Conformité"],
    color: "bg-amber-500/20",
  },
];

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

const partnerCategories = [
  {
    title: "Universités et centres de recherche",
    items: ["Mila", "IVADO", "CIRANO", "CRIM"],
  },
  {
    title: "Associations professionnelles",
    items: ["AI Québec", "CPQ", "Barreau du Québec"],
  },
  {
    title: "Partenaires technologiques",
    items: ["Éditeurs de solutions IA", "Integrateurs certifiés"],
  },
];

export function ExpertsPage() {
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
            Nos experts
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Un réseau multidisciplinaire de professionnels engagés dans la gouvernance
            responsable de l&apos;IA.
          </p>
        </div>
        <a
          href="#repertoire"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          aria-label="Défiler vers le répertoire"
        >
          <ChevronDown className="size-8" />
          <span className="text-xs font-medium">Découvrir</span>
        </a>
      </section>

      {/* SECTION: Répertoire des experts */}
      <section id="repertoire" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Répertoire des experts
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Nos membres couvrent l&apos;ensemble des disciplines nécessaires à une gouvernance
            efficace de l&apos;intelligence artificielle.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {experts.map((expert) => (
              <Card
                key={expert.name}
                className="border-2 hover:border-primary/30 transition-colors overflow-hidden"
              >
                <CardHeader className="flex flex-row gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${expert.color} text-lg font-bold text-foreground`}
                  >
                    {expert.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{expert.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {expert.title}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">{expert.organization}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {expert.domains.map((d) => (
                      <Badge
                        key={d}
                        variant="secondary"
                        className={DOMAIN_COLORS[d] ?? "bg-muted text-muted-foreground"}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-12 max-w-xl mx-auto">
            Vous êtes expert en gouvernance de l&apos;IA ? Rejoignez notre réseau.
          </p>
          <div className="flex justify-center mt-6">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/rejoindre">
                <UserPlus className="size-4" />
                Rejoindre le réseau
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION: Comités thématiques */}
      <section className="py-20 sm:py-24 bg-muted/50">
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

      {/* SECTION: Partenaires et alliés */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Partenaires et alliés
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Nous collaborons avec des organisations de premier plan pour faire avancer la
            gouvernance de l&apos;IA.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {partnerCategories.map((cat) => (
              <Card key={cat.title} className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Handshake className="size-5 text-primary" />
                    {cat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-purple text-white hover:bg-brand-purple-dark"
            >
              <Link to="/contact" className="gap-2">
                Devenir partenaire
                <Handshake className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
