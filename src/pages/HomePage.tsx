import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Scale,
  Lightbulb,
  Users,
  Mic,
  MessageSquare,
  Wrench,
  GraduationCap,
  Folder,
  TrendingUp,
  ShieldAlert,
  FileCheck,
  ChevronDown,
  ArrowRight,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function HomePage() {
  const [formData, setFormData] = useState({
    prenom: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="overflow-x-hidden">
      {/* SECTION 1 - HERO */}
      <section className="relative min-h-[calc(100dvh-104px)] flex flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient background — brand navy + purple */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]" />

        {/* Animated geometric grid overlay */}
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
        {/* Purple glow accents */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(171, 84, 243, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(49, 45, 238, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(158, 104, 242, 0.15) 0%, transparent 40%)
            `,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Gouvernance de l&apos;Intelligence Artificielle
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Maîtrisez les risques, assurez la conformité et guidez la stratégie IA de votre
            organisation avec confiance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              asChild
              size="lg"
              className="bg-brand-purple text-white hover:bg-brand-purple-dark text-base px-8 py-6 h-auto shadow-lg shadow-brand-purple/30"
            >
              <Link to="/services#diagnostic">Démarrer votre évaluation</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white text-base px-8 py-6 h-auto backdrop-blur-sm"
            >
              <Link to="/a-propos#approche">Explorer le cadre</Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#trois-piliers"
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
            aria-label="Défiler vers le bas"
          >
            <ChevronDown className="size-8" />
            <span className="text-xs font-medium">Découvrir</span>
          </a>
        </div>
      </section>

      {/* SECTION 2 - THREE PILLARS */}
      <section
        id="trois-piliers"
        className="py-20 sm:py-24 bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Un cadre de gouvernance complet
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trois piliers fondamentaux pour une IA responsable et performante
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Cadre de Gouvernance",
                description:
                  "Assurez la transparence et la responsabilité avec un cadre de gouvernance adapté aux systèmes d'intelligence artificielle.",
              },
              {
                icon: Scale,
                title: "Éthique et Réglementation",
                description:
                  "Intégrez les principes éthiques et respectez les réglementations en vigueur pour une IA responsable et conforme.",
              },
              {
                icon: Lightbulb,
                title: "Stratégie et Innovation",
                description:
                  "Exploitez l'IA de manière stratégique pour améliorer votre compétitivité et innover durablement.",
              },
            ].map((pillar) => (
              <Card
                key={pillar.title}
                className="group border-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <pillar.icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - ABOUT */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Pourquoi un Cercle de Gouvernance de l&apos;IA ?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                L&apos;adoption rapide de l&apos;IA transforme les organisations, mais soulève
                aussi des défis majeurs : risques éthiques, biais algorithmiques, conformité
                réglementaire. Le Cercle de Gouvernance de l&apos;IA vous accompagne dans
                l&apos;élaboration d&apos;une gouvernance efficace, sécuritaire et conforme. Notre
                mission est d&apos;offrir aux dirigeants un espace d&apos;échange et
                d&apos;apprentissage pour prendre des décisions éclairées, minimiser les risques
                et maximiser la valeur de l&apos;IA.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: "150+", label: "Experts en IA" },
                { value: "15", label: "Disciplines couvertes" },
                { value: "7", label: "Piliers de gouvernance" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Comment fonctionne le Cercle ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Les membres se réunissent périodiquement pour échanger sur des thèmes d&apos;actualité
              et des défis concrets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Partage de meilleures pratiques",
                description:
                  "Échangez avec des dirigeants ayant expérimenté différentes approches en gouvernance de l'IA.",
                step: "01",
              },
              {
                icon: Mic,
                title: "Interventions d'experts",
                description:
                  "Bénéficiez de perspectives éclairées sur les tendances réglementaires et technologiques.",
                step: "02",
              },
              {
                icon: MessageSquare,
                title: "Tables rondes thématiques",
                description:
                  "Explorez des sujets tels que l'IA et la cybersécurité, la prise de décision automatisée, la protection des données et l'IA générative.",
                step: "03",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col p-8 rounded-2xl border-2 bg-card hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <span className="absolute top-6 right-6 text-5xl font-bold text-primary/10">
                  {item.step}
                </span>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="size-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 - SERVICES & TOOLS */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Services et Outils
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Accompagnement des entreprises dans la gouvernance éthique et responsable de
              l&apos;intelligence artificielle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wrench,
                title: "Outils pratiques",
                description:
                  "Accédez à des matrices de gouvernance pour intégrer l'IA dans votre gestion des risques.",
              },
              {
                icon: GraduationCap,
                title: "Formations en ligne",
                description:
                  "Des formations adaptées pour dirigeants sur les meilleures pratiques de gouvernance de l'IA.",
              },
              {
                icon: Folder,
                title: "Projets IA",
                description:
                  "Découvrez nos projets pour une gouvernance responsable de l'IA.",
              },
              {
                icon: TrendingUp,
                title: "Stratégie IA",
                description:
                  "Améliorez la performance avec une stratégie d'IA solide.",
              },
              {
                icon: ShieldAlert,
                title: "Gestion des risques",
                description:
                  "Assurez une gestion des risques conforme et éthique.",
              },
              {
                icon: FileCheck,
                title: "Conformité réglementaire",
                description:
                  "Respectez les réglementations en matière de gouvernance IA.",
              },
            ].map((service) => (
              <Card
                key={service.title}
                className="group border-2 hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden"
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <service.icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center justify-between gap-2">
                      {service.title}
                      <ArrowRight className="size-4 shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription className="mt-1">{service.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - PORTAIL IAG */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[#252243] via-[#3a1d6e] to-[#1e1a30] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 70%, rgba(171, 84, 243, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(49, 45, 238, 0.2) 0%, transparent 50%)
            `,
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge
            variant="secondary"
            className="mb-6 bg-brand-purple/20 text-white border-brand-purple/40 hover:bg-brand-purple/30"
          >
            Portail IAG
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pilotez l&apos;IA en toute confiance
          </h2>
          <p className="text-lg text-purple-100/90 mb-8 max-w-2xl mx-auto">
            Accédez à des outils stratégiques pour évaluer, structurer et optimiser la
            gouvernance de l&apos;intelligence artificielle au sein de votre organisation.
          </p>
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-5 fill-brand-amber text-brand-amber" />
            ))}
          </div>
          <p className="text-sm text-purple-200/80 mb-8">
            Recommandé par plus de 100 organisations
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#252243] hover:bg-purple-50 px-8 py-6 h-auto text-base font-semibold shadow-lg"
          >
            <Link to="/services">Découvrir nos services</Link>
          </Button>
        </div>
      </section>

      {/* SECTION 7 - CONTACT FORM */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Rejoindre le Cercle de Gouvernance
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    placeholder="Votre prénom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="h-11"
                  />
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
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Votre message..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="min-h-[120px] resize-y"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Envoyer votre message
                </Button>
              </form>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-lg text-muted-foreground mb-6">
                Rejoignez une communauté de <strong className="text-foreground">150+ experts</strong> en
                intelligence artificielle, couvrant <strong className="text-foreground">15
                disciplines</strong> pour vous accompagner dans votre démarche de gouvernance responsable.
              </p>
              <Separator className="my-6" />
              <div className="flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Experts en IA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">15</div>
                  <div className="text-sm text-muted-foreground">Disciplines couvertes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
