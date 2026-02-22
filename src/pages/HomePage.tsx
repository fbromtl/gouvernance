import { useState, useRef, useEffect } from "react";
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
  CheckCircle,
  Building2,
  Globe,
  Clock,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEO, JsonLd } from "@/components/SEO";

export function HomePage() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

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
    <>
      <SEO title="Accueil" description="Le Cercle de Gouvernance de l'IA réunit 150+ experts pour vous accompagner dans la conformité, l'éthique et la stratégie IA de votre organisation." />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Cercle de Gouvernance de l'IA",
        "url": "https://gouvernance.ai",
        "logo": "https://gouvernance.ai/logo.svg",
        "description": "Réseau de 150+ experts en gouvernance de l'intelligence artificielle. Diagnostic de maturité IA, formations, accompagnement stratégique.",
        "areaServed": { "@type": "Country", "name": "Canada" },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Services de Gouvernance IA",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diagnostic de maturité IA" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Accompagnement stratégique" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Formations et ateliers" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Conférences et interventions" } }
          ]
        }
      }} />
      <div className="overflow-x-hidden">
      {/* SECTION 1 - HERO */}
      <section className="relative min-h-[calc((100dvh-120px)*0.7)] flex flex-col items-center justify-center px-4 py-16 sm:py-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient de secours (visible si pas de vidéo ou avant chargement) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]" />

        {/* Video background */}
        <div className="absolute inset-0">
          <video
            ref={heroVideoRef}
            src="/hero-bg.mp4"
            poster="/hero-bg-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            aria-hidden
          />
        </div>

        {/* Overlay: assombrit la vidéo et conserve la teinte brand */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1e1a30]/80 via-[#252243]/70 to-[#1e1a30]/90"
          aria-hidden
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(171,84,243,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(171,84,243,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Purple glow accents */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 60% 50% at 15% 85%, rgba(171, 84, 243, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 85% 15%, rgba(49, 45, 238, 0.10) 0%, transparent 60%)
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          {/* Top badge */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] rounded-full px-4 py-1.5">
              <span className="flex h-2 w-2 rounded-full bg-brand-purple animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-purple-200/90 tracking-wide">
                Cercle de Gouvernance de l&apos;IA
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-white tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Gouvernance de
            <br />
            <span className="bg-gradient-to-r from-brand-purple-light via-brand-purple to-[#312dee] bg-clip-text text-transparent">
              l&apos;Intelligence Artificielle
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-base sm:text-lg lg:text-xl text-purple-100/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Maîtrisez les risques, assurez la conformité et guidez la stratégie IA
            de votre organisation avec confiance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button asChild size="lg" className="text-base px-8 py-6 h-auto gap-2">
              <Link to="/services#diagnostic">
                Démarrer votre évaluation
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="text-base px-8 py-6 h-auto">
              <Link to="/a-propos#approche">Explorer le cadre</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                {
                  icon: CheckCircle,
                  label: "Conforme Loi 25 & ISO 42001",
                },
                {
                  icon: Building2,
                  label: "150+ experts, 15 disciplines",
                },
                {
                  icon: Globe,
                  label: "Cadre NIST AI & Principes OCDE",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-purple/20">
                    <item.icon className="size-4 text-brand-purple-light" />
                  </div>
                  <span className="text-sm text-white/70 font-medium leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#trois-piliers"
            className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
            aria-label="Défiler vers le bas"
          >
            <ChevronDown className="size-6" />
          </a>
        </div>
      </section>

      {/* SECTION 2 - THREE PILLARS */}
      <section
        id="trois-piliers"
        className="py-24 sm:py-32 bg-background relative overflow-hidden"
      >
        {/* Décor subtil */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, rgba(171,84,243,1) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-purple/8 border border-brand-purple/15 rounded-full px-4 py-1.5 mb-6">
              <Shield className="size-3.5 text-brand-purple" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-purple">
                Nos fondements
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5">
              Un cadre de gouvernance complet
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trois piliers fondamentaux pour une IA responsable et performante
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Shield,
                title: "Cadre de Gouvernance",
                description:
                  "Assurez la transparence et la responsabilité avec un cadre de gouvernance adapté aux systèmes d'intelligence artificielle.",
                accent: "from-brand-purple/20 to-brand-purple/5",
                iconBg: "bg-brand-purple/10",
                iconColor: "text-brand-purple",
                number: "01",
              },
              {
                icon: Scale,
                title: "Éthique et Réglementation",
                description:
                  "Intégrez les principes éthiques et respectez les réglementations en vigueur pour une IA responsable et conforme.",
                accent: "from-brand-blue/20 to-brand-blue/5",
                iconBg: "bg-brand-blue/10",
                iconColor: "text-brand-blue",
                number: "02",
              },
              {
                icon: Lightbulb,
                title: "Stratégie et Innovation",
                description:
                  "Exploitez l'IA de manière stratégique pour améliorer votre compétitivité et innover durablement.",
                accent: "from-brand-teal/20 to-brand-teal/5",
                iconBg: "bg-brand-teal/10",
                iconColor: "text-brand-teal",
                number: "03",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="group relative bg-card rounded-2xl border border-border/60 p-8 lg:p-10 hover:shadow-2xl hover:shadow-primary/[0.06] hover:-translate-y-1.5 transition-all duration-500 cursor-default overflow-hidden"
              >
                {/* Gradient accent top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pillar.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Number */}
                <span className="absolute top-8 right-8 lg:top-10 lg:right-10 text-6xl font-extrabold text-foreground/[0.03] leading-none select-none">
                  {pillar.number}
                </span>

                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pillar.iconBg} mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <pillar.icon className={`size-7 ${pillar.iconColor}`} />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>

                {/* Learn more */}
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-brand-purple opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  En savoir plus
                  <ArrowRight className="size-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom separator */}
          <div className="flex items-center justify-center mt-16 gap-4">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Aligné ISO 42001 &middot; NIST AI RMF &middot; Principes OCDE
            </span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>
      </section>

      {/* SECTION 3 - ABOUT */}
      <section className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
        {/* Décor subtil */}
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.025]"
          style={{ background: "radial-gradient(circle, rgba(171,84,243,1) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left - Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-purple/8 border border-brand-purple/15 rounded-full px-4 py-1.5 mb-6">
                <Users className="size-3.5 text-brand-purple" />
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-purple">
                  Notre mission
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.15] mb-6">
                Pourquoi un Cercle de
                <br className="hidden sm:block" />
                {" "}Gouvernance de l&apos;IA ?
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                L&apos;adoption rapide de l&apos;IA transforme les organisations, mais soulève
                aussi des défis majeurs : risques éthiques, biais algorithmiques, conformité
                réglementaire.
              </p>

              {/* Key points */}
              <div className="space-y-4 mb-10">
                {[
                  "Gouvernance efficace, sécuritaire et conforme",
                  "Espace d'échange et d'apprentissage pour dirigeants",
                  "Décisions éclairées, risques minimisés, valeur maximisée",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 mt-0.5">
                      <CheckCircle className="size-3.5 text-brand-purple" />
                    </div>
                    <span className="text-[15px] text-foreground/80 leading-snug">{point}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "150+", label: "Experts en IA", icon: Users },
                  { value: "15", label: "Disciplines", icon: Globe },
                  { value: "7", label: "Piliers", icon: Shield },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="relative group text-center p-5 rounded-2xl bg-card border border-border/60 hover:border-brand-purple/20 hover:shadow-lg hover:shadow-brand-purple/[0.04] transition-all duration-300"
                  >
                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-b from-brand-purple to-brand-purple-dark bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              {/* Image principale */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
                <img
                  src="/images-gouvernance-ai/ceo-analysing.jpg"
                  alt="Équipe de direction analysant des données"
                  className="w-full object-cover aspect-[4/3]"
                />
                {/* Overlay subtil */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1a30]/30 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border/60 rounded-2xl p-5 shadow-xl max-w-[220px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/10">
                    <Shield className="size-5 text-brand-purple" />
                  </div>
                  <div className="text-sm font-bold text-foreground leading-tight">Cadre certifié</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aligné ISO 42001, NIST AI RMF et conforme Loi 25
                </p>
              </div>

              {/* Décor dot grid */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(171,84,243,1) 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        {/* Décor */}
        <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-purple/8 border border-brand-purple/15 rounded-full px-4 py-1.5 mb-6">
              <Mic className="size-3.5 text-brand-purple" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-purple">
                Fonctionnement
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5">
              Comment fonctionne le Cercle ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Les membres se réunissent périodiquement pour échanger sur des thèmes
              d&apos;actualité et des défis concrets.
            </p>
          </div>

          {/* Timeline layout */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[4.5rem] left-0 right-0 h-px">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
              {[
                {
                  icon: Users,
                  title: "Partage de meilleures pratiques",
                  description:
                    "Échangez avec des dirigeants ayant expérimenté différentes approches en gouvernance de l'IA.",
                  step: "01",
                  glowBg: "bg-brand-purple/10",
                  circleBorderHover: "group-hover:border-brand-purple/30",
                  iconColor: "text-brand-purple",
                  badgeBg: "bg-brand-purple",
                },
                {
                  icon: Mic,
                  title: "Interventions d'experts",
                  description:
                    "Bénéficiez de perspectives éclairées sur les tendances réglementaires et technologiques.",
                  step: "02",
                  glowBg: "bg-brand-blue/10",
                  circleBorderHover: "group-hover:border-brand-blue/30",
                  iconColor: "text-brand-blue",
                  badgeBg: "bg-brand-blue",
                },
                {
                  icon: MessageSquare,
                  title: "Tables rondes thématiques",
                  description:
                    "Explorez des sujets tels que l'IA et la cybersécurité, la prise de décision automatisée, la protection des données et l'IA générative.",
                  step: "03",
                  glowBg: "bg-brand-teal/10",
                  circleBorderHover: "group-hover:border-brand-teal/30",
                  iconColor: "text-brand-teal",
                  badgeBg: "bg-brand-teal",
                },
              ].map((item) => (
                <div key={item.step} className="group flex flex-col items-center text-center">
                  {/* Step number + icon */}
                  <div className="relative mb-8">
                    {/* Glow ring */}
                    <div className={`absolute inset-0 rounded-full ${item.glowBg} scale-100 group-hover:scale-[1.3] transition-transform duration-500 blur-lg`} />
                    {/* Circle */}
                    <div className={`relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-card border-2 border-border/60 ${item.circleBorderHover} shadow-lg transition-all duration-300`}>
                      <item.icon className={`size-7 ${item.iconColor}`} />
                    </div>
                    {/* Step badge */}
                    <div className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full ${item.badgeBg} text-white text-xs font-bold shadow-md`}>
                      {item.step}
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold text-foreground tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom image band */}
          <div className="mt-20 grid grid-cols-3 gap-3 sm:gap-4 rounded-2xl overflow-hidden">
            <img
              src="/images-gouvernance-ai/coworking.jpg"
              alt="Espace de coworking"
              className="w-full h-40 sm:h-52 object-cover"
            />
            <img
              src="/images-gouvernance-ai/businesswoman-meeting.jpg"
              alt="Réunion professionnelle"
              className="w-full h-40 sm:h-52 object-cover"
            />
            <img
              src="/images-gouvernance-ai/businesspeople-meeting.jpg"
              alt="Rencontre d'affaires"
              className="w-full h-40 sm:h-52 object-cover"
            />
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Accompagnement des entreprises dans la gouvernance éthique et responsable de
              l&apos;intelligence artificielle.
            </p>
            <img
              src="/images-gouvernance-ai/business-strategy.jpg"
              alt="Stratégie et analyse business"
              className="max-w-3xl mx-auto rounded-2xl shadow-lg object-cover aspect-[21/9] w-full"
            />
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

      {/* SECTION 5b - DIAGNOSTIC CTA */}
      <section className="relative py-20 sm:py-24 bg-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(171, 84, 243, 0.4) 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-brand-purple/10 text-brand-purple border-brand-purple/30 hover:bg-brand-purple/20"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Diagnostic gratuit
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Évaluez votre maturité en gouvernance IA
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            10 questions pour obtenir votre score de maturité et des recommandations personnalisées. Gratuit, sans engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { icon: Clock, label: "3 minutes" },
              { icon: ListChecks, label: "10 questions" },
              { icon: Sparkles, label: "100% gratuit" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/10">
                  <item.icon className="h-4 w-4 text-brand-purple" />
                </div>
                {item.label}
              </div>
            ))}
          </div>
          <Button
            asChild
            size="lg"
            className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8 py-6 h-auto text-base font-semibold shadow-lg shadow-brand-purple/25"
          >
            <Link to="/diagnostic">
              Lancer le diagnostic
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
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
            variant="outline"
            size="lg"
            className="bg-white text-[#252243] hover:bg-purple-50 border-2 border-white px-8 py-6 h-auto text-base font-semibold shadow-lg"
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
                <Button type="submit" size="lg" className="w-full sm:w-auto px-8">
                  Envoyer votre message
                </Button>
              </form>
            </div>
            <div className="flex flex-col justify-center">
              <img
                src="/images-gouvernance-ai/businessman-ai.jpg"
                alt="Professionnel et intelligence artificielle"
                className="w-full rounded-2xl shadow-lg object-cover aspect-video mb-6"
              />
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
    </>
  );
}
