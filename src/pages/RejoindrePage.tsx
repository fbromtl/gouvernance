import { useState } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  Lightbulb,
  Handshake,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

const benefits = [
  {
    icon: Users,
    title: "Réseau d'excellence",
    description:
      "Accédez à une communauté de 150+ experts en gouvernance de l'IA, issus de 15 disciplines.",
  },
  {
    icon: BookOpen,
    title: "Ressources exclusives",
    description:
      "Guides pratiques, gabarits de politiques, grilles d'évaluation et outils disponibles uniquement aux membres.",
  },
  {
    icon: Calendar,
    title: "Événements privilégiés",
    description:
      "Accès prioritaire aux tables rondes, webinaires et au sommet annuel.",
  },
  {
    icon: Award,
    title: "Visibilité professionnelle",
    description:
      "Profil d'expert sur notre plateforme, opportunités de conférences et de publications.",
  },
  {
    icon: Lightbulb,
    title: "Veille stratégique",
    description:
      "Analyses réglementaires, tendances technologiques et retours d'expérience en avant-première.",
  },
  {
    icon: Handshake,
    title: "Collaborations",
    description:
      "Participez à des projets de recherche et des comités thématiques avec des pairs de haut niveau.",
  },
];

const membershipTiers = [
  {
    name: "Membre expert",
    description: "Professionnels reconnus en gouvernance IA",
    features: [
      "Accès complet aux ressources",
      "Participation aux comités",
      "Profil expert public",
      "Droit de vote",
    ],
    popular: true,
  },
  {
    name: "Membre associé",
    description: "Professionnels en début de parcours en gouvernance IA",
    features: [
      "Accès aux ressources",
      "Participation aux événements",
      "Mentorat par un expert",
    ],
    popular: false,
  },
  {
    name: "Membre organisationnel",
    description: "Organisations souhaitant structurer leur gouvernance IA",
    features: [
      "Jusqu'à 5 représentants",
      "Diagnostic de maturité inclus",
      "Accompagnement personnalisé",
    ],
    popular: false,
  },
  {
    name: "Membre honoraire",
    description: "Personnalités ayant contribué de manière exceptionnelle",
    features: [
      "Invitation sur recommandation",
      "Accès à vie",
      "Rôle consultatif",
    ],
    popular: false,
  },
];

const MEMBERSHIP_OPTIONS = [
  "Membre expert",
  "Membre associé",
  "Membre organisationnel",
  "Membre honoraire",
] as const;

export function RejoindrePage() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    organisation: "",
    titre: "",
    niveau: "" as string,
    domaines: "",
    motivation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Membership application submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <SEO title="Rejoindre le Cercle" description="Rejoignez un réseau de 150+ experts en gouvernance IA. Accédez à des ressources exclusives, événements et mentorat." />
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
            Rejoindre le Cercle
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Intégrez un réseau d&apos;experts de premier plan et contribuez à façonner l&apos;avenir
            de la gouvernance de l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Pourquoi devenir membre */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Pourquoi devenir membre ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 text-center">
            Des avantages concrets pour accélérer votre impact en gouvernance de l&apos;IA.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="border-2 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="size-7" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Niveaux de membership */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-16 text-center">
            Niveaux de membership
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative border-2 transition-all duration-300",
                  tier.popular
                    ? "border-brand-purple shadow-lg shadow-brand-purple/15 hover:shadow-xl"
                    : "hover:border-primary/30 hover:shadow-lg"
                )}
              >
                {tier.popular && (
                  <Badge
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-purple text-white border-0"
                  >
                    Le plus populaire
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Critères d'admissibilité */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center">
            Critères d&apos;admissibilité
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            Le Cercle de Gouvernance de l&apos;IA accueille des professionnels et organisations qui
            partagent notre engagement envers une IA responsable.
          </p>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-medium">
                1
              </span>
              Expertise dans au moins un domaine lié à l&apos;IA (technique, éthique, juridique,
              stratégique)
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-medium">
                2
              </span>
              Engagement envers les principes de gouvernance responsable
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-medium">
                3
              </span>
              Volonté de contribuer activement aux travaux du Cercle
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-medium">
                4
              </span>
              Parrainage par un membre existant (recommandé, non obligatoire)
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION: Formulaire de candidature */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-center">
            Soumettre votre candidature
          </h2>
          <p className="text-muted-foreground mb-10 text-center">
            Notre comité examine chaque candidature sous 10 jours ouvrables.
          </p>

          <Card className="border-2 shadow-xl">
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">
                      Prénom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      placeholder="Votre prénom"
                      required
                      value={formData.prenom}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">
                      Nom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nom"
                      name="nom"
                      type="text"
                      placeholder="Votre nom"
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="organisation">Organisation</Label>
                    <Input
                      id="organisation"
                      name="organisation"
                      type="text"
                      placeholder="Votre entreprise ou organisation"
                      value={formData.organisation}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre / Fonction</Label>
                    <Input
                      id="titre"
                      name="titre"
                      type="text"
                      placeholder="Votre titre"
                      value={formData.titre}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niveau">Niveau de membership souhaité</Label>
                  <select
                    id="niveau"
                    name="niveau"
                    value={formData.niveau}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Sélectionnez un niveau</option>
                    {MEMBERSHIP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domaines">Domaines d&apos;expertise</Label>
                  <Textarea
                    id="domaines"
                    name="domaines"
                    placeholder="Décrivez vos domaines d'expertise (technique, éthique, juridique, stratégie...)"
                    rows={4}
                    value={formData.domaines}
                    onChange={handleChange}
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">
                    Motivation <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="motivation"
                    name="motivation"
                    placeholder="Pourquoi souhaitez-vous rejoindre le Cercle ?"
                    rows={5}
                    required
                    value={formData.motivation}
                    onChange={handleChange}
                    className="min-h-[120px] resize-y"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full py-6 text-base px-8">
                  Soumettre ma candidature
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
    </>
  );
}
