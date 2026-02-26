import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  Lock,
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  CreditCard,
  Mail,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

import { SEO, JsonLd } from "@/components/SEO";

/* ================================================================== */
/*  HOME PAGE – Template-inspired design with governance content       */
/* ================================================================== */

export function HomePage() {
  const [email, setEmail] = useState("");
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <SEO
        title="Accueil"
        description="Le Cercle de Gouvernance de l'IA réunit 150+ experts pour vous accompagner dans la conformité, l'éthique et la stratégie IA de votre organisation."
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Cercle de Gouvernance de l'IA",
          url: "https://gouvernance.ai",
          logo: "https://gouvernance.ai/logo.svg",
          description:
            "Réseau de 150+ experts en gouvernance de l'intelligence artificielle. Diagnostic de maturité IA, formations, accompagnement stratégique.",
          areaServed: { "@type": "Country", name: "Canada" },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services de Gouvernance IA",
            itemListElement: [
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Diagnostic de maturité IA" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Accompagnement stratégique" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Formations et ateliers" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Conférences et interventions" } },
            ],
          },
        }}
      />

      <div className="overflow-x-hidden antialiased">
        {/* ============================================================ */}
        {/*  HERO SECTION – Mesh gradient                                */}
        {/* ============================================================ */}
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
          <div className="text-center max-w-7xl mr-auto ml-auto pr-6 pl-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur border border-neutral-200 px-3 py-1 rounded-full mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#ab54f3] animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-500">
                Gouvernance IA Responsable
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl tracking-tight text-neutral-900 mb-6 max-w-4xl mx-auto leading-[1.1] font-semibold">
              Gouvernez l&apos;IA avec{" "}
              <span className="text-[#ab54f3]">confiance</span> et conformité
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              La plateforme tout-en-un pour évaluer, conformer et piloter vos systèmes d&apos;IA.
              Rejoignez plus de 150 experts en gouvernance de l&apos;intelligence artificielle.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20 items-center justify-center w-full max-w-2xl mx-auto">
              <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Mail className="h-[18px] w-[18px] text-neutral-400 group-focus-within:text-[#ab54f3]/60 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre courriel"
                  className="w-full bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full pl-12 pr-6 py-4 text-base font-medium text-neutral-900 focus:outline-none focus:ring-4 focus:ring-[#ab54f3]/10 focus:border-[#ab54f3]/40 transition-all placeholder:text-neutral-400 shadow-sm hover:border-neutral-300"
                />
              </div>
              <Link
                to="/inscription"
                className="group inline-flex items-center gap-2 font-medium text-white bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] rounded-full pt-4 pr-8 pb-4 pl-8 relative shadow-lg overflow-hidden transition-all duration-300 hover:shadow-[#ab54f3]/50"
                style={{
                  boxShadow:
                    "0 15px 33px -12px rgba(171,84,243,0.6), inset 0 4px 6.3px rgba(255,255,255,0.3), inset 0 -5px 6.3px rgba(0,0,0,0.1)",
                }}
              >
                <div className="group-hover:translate-y-0 transition-transform duration-300 bg-white/10 absolute inset-0 translate-y-full" />
                <span className="relative flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>

            {/* ── Dashboard Mockup ── */}
            <div className="overflow-hidden flex flex-col bg-white max-w-6xl border-neutral-200/60 border rounded-2xl mr-auto ml-auto relative shadow-2xl">
              {/* Mockup header */}
              <header className="flex z-20 shrink-0 bg-white border-neutral-100 border-b pt-4 pr-6 pb-4 pl-6 items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                  Tableau de bord — Gouvernance IA
                </h2>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#ab54f3] rounded-lg pt-2 pr-4 pb-2 pl-4 shadow-sm">
                    <Shield className="h-3.5 w-3.5" />
                    Conforme
                  </span>
                </div>
              </header>

              {/* Mockup content */}
              <div className="p-6 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Systèmes IA", value: "24", change: "+3", color: "text-[#ab54f3]" },
                    { label: "Score Conformité", value: "87%", change: "+5%", color: "text-emerald-500" },
                    { label: "Incidents actifs", value: "2", change: "-1", color: "text-amber-500" },
                    { label: "Risque élevé", value: "3", change: "0", color: "text-red-500" },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-neutral-50 rounded-xl p-4 border border-neutral-100"
                    >
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        {kpi.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</span>
                        <span className="text-xs text-neutral-400">{kpi.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart area + sidebar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chart placeholder */}
                  <div className="md:col-span-2 bg-neutral-50 rounded-xl p-4 border border-neutral-100 h-48">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                      Conformité par cadre
                    </p>
                    <div className="flex items-end gap-3 h-28 px-2">
                      {[
                        { label: "Loi 25", h: "h-24", color: "bg-[#ab54f3]" },
                        { label: "EU AI", h: "h-20", color: "bg-[#ab54f3]/80" },
                        { label: "NIST", h: "h-16", color: "bg-[#ab54f3]/60" },
                        { label: "ISO", h: "h-22", color: "bg-[#ab54f3]/70" },
                        { label: "RGPD", h: "h-18", color: "bg-[#ab54f3]/50" },
                      ].map((bar) => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full ${bar.h} ${bar.color} rounded-t-lg`} />
                          <span className="text-[8px] text-neutral-400">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk list */}
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 h-48">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                      Systèmes à risque
                    </p>
                    <div className="space-y-3">
                      {[
                        { name: "Chatbot RH", risk: "Élevé", color: "bg-red-100 text-red-600" },
                        { name: "Scoring crédit", risk: "Critique", color: "bg-red-200 text-red-700" },
                        { name: "Tri CV auto", risk: "Modéré", color: "bg-amber-100 text-amber-600" },
                      ].map((sys) => (
                        <div key={sys.name} className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-700">{sys.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sys.color}`}>
                            {sys.risk}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Social Proof ── */}
            <div className="mt-12 pt-6 w-full">
              <p className="uppercase text-sm font-medium text-zinc-400 tracking-wide text-center mb-6">
                Aligné sur les cadres de référence internationaux
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                {["Loi 25", "EU AI Act", "NIST AI RMF", "ISO 42001", "RGPD", "OCDE"].map(
                  (framework) => (
                    <span
                      key={framework}
                      className="text-sm font-bold text-neutral-300 uppercase tracking-widest hover:text-neutral-500 transition-colors"
                    >
                      {framework}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CLIENT LOGOS – Trust bar                                     */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-8">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Banque Nationale", "Hydro-Québec", "Desjardins", "CAE", "WSP", "BDC"].map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-neutral-300 opacity-40 hover:opacity-70 transition-opacity select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  BENTO "WHY" SECTION                                         */}
        {/* ============================================================ */}
        <section className="overflow-hidden border-y bg-white border-neutral-200 pt-24 pb-24 relative">
          <div className="z-10 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative">
            {/* Section header */}
            <div className="flex flex-col w-full mb-12">
              <div className="flex items-end justify-between w-full pb-5">
                <div className="flex gap-x-2 items-center">
                  <span className="w-8 h-px bg-[#ab54f3]" />
                  <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
                    Pourquoi le Cercle ?
                  </span>
                </div>
                <Link
                  to="/a-propos"
                  className="group flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors"
                >
                  En savoir plus
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="w-full h-px bg-neutral-200 mb-8" />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
                  La précision réglementaire est le moteur de chaque déploiement IA réussi.
                </h2>
                <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
                  <p className="leading-relaxed text-base text-neutral-600">
                    Les données fragmentées sont l&apos;ennemi de la conformité. Le Cercle unifie votre
                    gouvernance IA en une source unique de vérité.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento grid – 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Conformité */}
              <div className="group flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 bg-neutral-50 h-[520px] border-neutral-200/60 border rounded-[40px] px-10 py-10 justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#ab54f3]/10 rounded-2xl flex items-center justify-center text-[#ab54f3] mb-8">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl text-neutral-900 mb-6 tracking-tight leading-tight font-semibold">
                    Conformité réglementaire de niveau institutionnel.
                  </h3>
                  <p className="text-neutral-500 leading-relaxed">
                    Vos systèmes sont évalués selon les cadres Loi 25, EU AI Act, NIST et ISO 42001, garantissant
                    une conformité sans compromis.
                  </p>
                </div>
                <div className="pt-6 border-t border-neutral-100">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Multi-Framework
                  </span>
                </div>
              </div>

              {/* Card 2: Image card */}
              <div className="relative rounded-[40px] overflow-hidden h-[520px] bg-neutral-900 group">
                <img
                  src="/images-gouvernance-ai/ceo-analysing.jpg"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  alt="Analyse de gouvernance IA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white pr-10">
                  <span className="inline-block px-3 py-1 bg-[#ab54f3] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    Temps réel
                  </span>
                  <p className="text-2xl leading-tight font-semibold">
                    Agissez à la vitesse de l&apos;IA, pas à celle des tableurs.
                  </p>
                </div>
              </div>

              {/* Card 3: Score circle */}
              <div className="flex flex-col overflow-hidden group bg-neutral-50 h-[520px] border-neutral-200 border rounded-[40px] px-10 py-10 relative shadow-sm items-center justify-between">
                <div className="text-center">
                  <span className="text-xs text-[#ab54f3] font-bold block mb-2 uppercase tracking-[0.2em]">
                    Score de conformité
                  </span>
                  <span className="text-xl font-medium text-neutral-900">Fiabilité garantie</span>
                </div>
                <div className="flex w-56 h-56 relative items-center justify-center">
                  <div className="absolute inset-0 bg-[#ab54f3]/5 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-[14px] border-neutral-100 rounded-full" />
                  <div
                    className="border-[14px] border-t-transparent border-r-transparent border-[#ab54f3] rounded-full absolute inset-0 -rotate-45"
                  />
                  <div className="text-5xl tracking-tighter text-neutral-900 font-bold">98%</div>
                </div>
                <Link
                  to="/portail"
                  className="w-full bg-neutral-900 text-white py-4 rounded-[20px] text-sm font-semibold hover:bg-[#ab54f3] transition-colors duration-300 shadow-lg shadow-neutral-200 text-center block"
                >
                  Voir le portail
                </Link>
              </div>

              {/* Card 4: Expert Support dark */}
              <div className="bg-neutral-950 p-10 rounded-[40px] flex flex-col justify-between h-[520px] text-white relative hover:shadow-2xl hover:shadow-[#ab54f3]/20 transition-all duration-500">
                <div className="flex justify-between items-start">
                  <span className="text-lg font-medium tracking-tight text-[#ab54f3]">
                    Accompagnement Expert
                  </span>
                  <div className="p-2 bg-white/10 rounded-full">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl leading-[1.2] font-semibold">
                  Des humains dans la boucle, chaque fois que vous en avez besoin.
                </p>
                <div className="space-y-6">
                  <div className="group/link cursor-pointer">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Experts réseau</p>
                    <p className="text-lg font-medium border-b border-white/10 pb-2 group-hover/link:text-[#ab54f3] transition-colors">
                      150+ spécialistes
                    </p>
                  </div>
                  <div className="group/link cursor-pointer">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Disciplines</p>
                    <p className="text-lg font-medium group-hover/link:text-[#ab54f3] transition-colors">
                      15 domaines couverts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS – 3 steps                                      */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-24">
          {/* Section header */}
          <div className="flex items-end justify-between w-full pb-5 mb-8">
            <div className="flex gap-2 items-center">
              <span className="w-8 h-px bg-[#ab54f3]" />
              <span className="uppercase text-xs font-semibold text-[#ab54f3] tracking-[0.2em]">
                Comment ça marche
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 max-w-3xl mb-16">
            Trois étapes pour piloter votre gouvernance IA
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connection line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px border-t-2 border-dashed border-neutral-200" />

            {[
              {
                num: "01",
                icon: UserPlus,
                title: "Inscrivez-vous gratuitement",
                desc: "Créez votre compte en 30 secondes. Aucune carte de crédit requise.",
              },
              {
                num: "02",
                icon: ClipboardCheck,
                title: "Lancez votre diagnostic",
                desc: "Évaluez la maturité IA de votre organisation en 10 minutes.",
              },
              {
                num: "03",
                icon: BarChart3,
                title: "Pilotez votre gouvernance",
                desc: "Suivez vos systèmes, risques et conformité depuis un portail unifié.",
              },
            ].map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-neutral-50 border border-neutral-200 mb-6 relative z-10">
                  <step.icon className="w-8 h-8 text-[#ab54f3]" />
                </div>
                <p className="text-5xl font-bold text-neutral-100 mb-3">{step.num}</p>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 bg-neutral-950 text-white px-8 py-4 rounded-full font-medium hover:bg-neutral-800 transition-colors"
            >
              Commencer maintenant — c&apos;est gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CORE FEATURES – Bento grid with mockups                     */}
        {/* ============================================================ */}
        <section className="max-w-7xl z-10 mr-auto ml-auto pt-24 pr-6 pb-24 pl-6 relative">
          <div className="overflow-hidden bg-white ring-neutral-200 ring-1 rounded-[32px] pt-8 pr-8 pb-8 pl-8 relative">
            {/* Section header */}
            <div className="flex flex-col w-full pb-12">
              <div className="flex items-end justify-between w-full pb-5">
                <div className="flex gap-2 items-center">
                  <span className="w-8 h-px bg-[#ab54f3]" />
                  <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
                    Fonctionnalités clés
                  </span>
                </div>
                <Link
                  to="/services"
                  className="group flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors"
                >
                  Voir tous les services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="w-full h-px bg-neutral-200 mb-8" />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
                  Tout ce qu&apos;il faut pour piloter votre gouvernance IA
                </h2>
                <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
                  <p className="leading-relaxed text-base text-neutral-600">
                    Le portail IAG offre une interface centralisée pour suivre chaque système,
                    chaque risque et chaque obligation de conformité.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Registre IA (vertical) */}
              <article className="lg:col-span-1 group relative flex flex-col justify-between overflow-hidden bg-white border border-neutral-200 rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-[#ab54f3] text-xs font-semibold tracking-medium mb-6">
                    Registre IA
                  </div>
                  <h3 className="text-neutral-900 text-2xl tracking-tight mb-3 font-semibold">
                    Vos systèmes, cartographiés.
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    Inventoriez et classifiez tous vos systèmes d&apos;IA avec leur niveau de risque,
                    leur propriétaire et leur statut de conformité.
                  </p>
                </div>
                {/* Mini mockup */}
                <div className="relative w-full h-[240px] bg-neutral-50 border border-neutral-100 rounded-2xl p-4 overflow-hidden select-none">
                  <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-2 shadow-sm border border-neutral-100">
                    <span className="text-[10px] font-semibold text-neutral-900">24 systèmes</span>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 bg-[#ab54f3]/10 text-[#ab54f3] text-[8px] font-bold rounded-full">
                        Filtrer
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Chatbot Support", type: "GenAI", risk: "Limité", color: "bg-blue-100 text-blue-600" },
                      { name: "Scoring Crédit", type: "ML", risk: "Élevé", color: "bg-red-100 text-red-600" },
                      { name: "Tri CV Auto", type: "ML", risk: "Élevé", color: "bg-red-100 text-red-600" },
                      { name: "Recommandation", type: "ML", risk: "Minimal", color: "bg-emerald-100 text-emerald-600" },
                    ].map((sys) => (
                      <div
                        key={sys.name}
                        className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-neutral-100 shadow-sm"
                      >
                        <div className="w-1.5 h-6 rounded-full bg-[#ab54f3]/40" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-neutral-900 truncate">{sys.name}</p>
                          <p className="text-[8px] text-neutral-400">{sys.type}</p>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${sys.color}`}>
                          {sys.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* Card 2: Évaluation des Risques (horizontal) */}
              <article className="lg:col-span-2 group relative flex flex-col justify-between overflow-hidden bg-white border border-neutral-200 rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
                <div className="relative z-10 max-w-lg">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold tracking-medium mb-6">
                    Évaluation des Risques
                  </div>
                  <h3 className="text-neutral-900 text-2xl tracking-tight mb-3 font-semibold">
                    Votre matrice de risques, automatisée.
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    Identifiez, évaluez et priorisez les risques de chaque système IA avec des matrices
                    conformes aux cadres NIST et ISO 42001.
                  </p>
                </div>
                {/* Mini mockup: risk matrix */}
                <div className="relative w-full h-[240px] bg-neutral-50 border border-neutral-100 rounded-2xl p-4 overflow-hidden select-none">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-neutral-900">Matrice de risque</span>
                    <span className="text-[9px] text-neutral-400">5 × 5</span>
                  </div>
                  <div className="grid grid-cols-5 grid-rows-5 gap-1 h-[180px]">
                    {Array.from({ length: 25 }, (_, i) => {
                      const row = Math.floor(i / 5);
                      const col = i % 5;
                      const score = (4 - row) + col;
                      const bg =
                        score >= 6
                          ? "bg-red-200"
                          : score >= 4
                            ? "bg-amber-200"
                            : score >= 2
                              ? "bg-yellow-100"
                              : "bg-emerald-100";
                      const hasSystem = [3, 8, 11, 17, 22].includes(i);
                      return (
                        <div key={i} className={`${bg} rounded-md flex items-center justify-center relative`}>
                          {hasSystem && (
                            <div className="w-3 h-3 bg-[#ab54f3] rounded-full shadow-md shadow-[#ab54f3]/30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>

              {/* Card 3: Conformité (horizontal) */}
              <article className="lg:col-span-2 group relative flex flex-col justify-between overflow-hidden bg-white border border-neutral-200 rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
                <div className="relative z-10 max-w-lg">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold tracking-medium mb-6">
                    Suivi de Conformité
                  </div>
                  <h3 className="text-neutral-900 text-2xl tracking-tight mb-3 font-semibold">
                    Multi-framework, zéro angle mort.
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    Suivez votre conformité simultanément sur Loi 25, EU AI Act, NIST AI RMF, ISO 42001
                    et RGPD depuis un tableau unique.
                  </p>
                </div>
                {/* Mini mockup: compliance list */}
                <div className="relative w-full h-[240px] bg-neutral-50 border border-neutral-100 rounded-2xl p-4 overflow-hidden select-none">
                  <div className="absolute inset-x-4 top-4 bottom-0 bg-white rounded-t-xl border-x border-t border-neutral-200 shadow-sm flex flex-col">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-900">Cadres réglementaires</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#ab54f3]/10 text-[#ab54f3] text-[8px] font-bold">
                          5
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {[
                        { name: "Loi 25", score: "92%", color: "bg-emerald-500" },
                        { name: "EU AI Act", score: "78%", color: "bg-amber-500" },
                        { name: "NIST AI RMF", score: "85%", color: "bg-emerald-500" },
                        { name: "ISO 42001", score: "71%", color: "bg-amber-500" },
                      ].map((fw) => (
                        <div
                          key={fw.name}
                          className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${fw.color}`} />
                          <span className="text-[10px] font-semibold text-neutral-900 flex-1">{fw.name}</span>
                          <span className="text-[10px] font-bold text-neutral-600">{fw.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 4: Diagnostic (vertical) */}
              <article className="lg:col-span-1 group relative flex flex-col justify-between overflow-hidden bg-white border border-neutral-200 rounded-[32px] p-8 hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-medium mb-6">
                    Diagnostic
                  </div>
                  <h3 className="text-neutral-900 text-2xl tracking-tight mb-3 font-semibold">
                    Votre maturité, mesurée.
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    10 questions pour évaluer votre maturité en gouvernance IA et recevoir des
                    recommandations personnalisées.
                  </p>
                </div>
                {/* Mini mockup: questionnaire */}
                <div className="relative w-full h-[240px] bg-neutral-50 border border-neutral-100 rounded-2xl p-4 overflow-hidden select-none">
                  <div className="w-full h-full bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-[#ab54f3] rounded-full" />
                      </div>
                      <span className="text-[9px] font-bold text-neutral-400">6/10</span>
                    </div>
                    <p className="text-[10px] font-bold text-neutral-900 mb-3">
                      Avez-vous un inventaire de vos systèmes IA ?
                    </p>
                    <div className="space-y-2">
                      {["Oui, complet et à jour", "Partiel", "Non, pas encore"].map((opt, i) => (
                        <div
                          key={opt}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[9px] font-medium ${
                            i === 0
                              ? "border-[#ab54f3] bg-[#ab54f3]/5 text-[#ab54f3]"
                              : "border-neutral-200 text-neutral-600"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              i === 0 ? "border-[#ab54f3] bg-[#ab54f3]" : "border-neutral-300"
                            }`}
                          >
                            {i === 0 && (
                              <Check className="w-2 h-2 text-white mx-auto" />
                            )}
                          </div>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  KEY METRICS – Impact numbers                                 */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-neutral-50 border border-neutral-200 rounded-[32px] py-12 px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
              {[
                { value: "150+", label: "Experts du réseau" },
                { value: "5", label: "Cadres réglementaires" },
                { value: "87%", label: "Score conformité moyen" },
                { value: "< 5 min", label: "Pour créer votre registre" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center ${i > 0 ? "lg:border-l lg:border-neutral-200" : ""}`}
                >
                  <p className="text-4xl md:text-5xl font-bold text-neutral-950 mb-2">{stat.value}</p>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  TESTIMONIALS                                                 */}
        {/* ============================================================ */}
        <section className="overflow-hidden border-y bg-white border-neutral-200 pt-24 pb-24 relative">
          <div className="z-10 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6 relative">
            {/* Section header */}
            <div className="flex flex-col w-full mb-16">
              <div className="flex flex-col w-full mb-12">
                <div className="flex items-end justify-between w-full pb-5">
                  <div className="flex gap-2 items-center">
                    <span className="w-8 h-px bg-[#ab54f3]" />
                    <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
                      Témoignages
                    </span>
                  </div>
                </div>
                <div className="w-full h-px bg-neutral-200 mb-8" />
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                  <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
                    Bâtissez la confiance avec une gouvernance IA que vos parties prenantes apprécient
                  </h2>
                  <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
                    <p className="leading-relaxed text-base text-neutral-600">
                      Le Cercle est recommandé par des dirigeants, DPO et responsables conformité qui
                      comptent sur la rigueur au quotidien.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="group flex flex-col hover:bg-white hover:shadow-xl hover:shadow-[#ab54f3]/10 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-8 py-8 justify-between">
                <div>
                  <div className="flex gap-1 mb-6 text-[#ab54f3]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.07-31-51.07,31a16,16,0,0,1-23.84-17.34l13.51-58.6-45.1-39.36A16,16,0,0,1,30.5,87.49l59.6-5.49L113.84,26a16,16,0,0,1,28.32,0L165.9,82l59.6,5.49a16,16,0,0,1,9,26.89Z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-xl text-neutral-800 leading-snug font-medium tracking-tight">
                    &ldquo;Le Cercle nous a permis de structurer notre gouvernance IA et d&apos;accélérer notre mise en
                    conformité Loi 25. Un accompagnement sans égal.&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center gap-4 mt-12 pt-6 border-t border-neutral-200/50">
                  <img
                    src="/images-gouvernance-ai/businesswoman-meeting.jpg"
                    className="group-hover:grayscale-0 transition-all duration-500 w-12 h-12 object-cover rounded-full grayscale"
                    alt="Marie Dupont"
                  />
                  <div>
                    <div className="font-bold text-neutral-900 text-base">Marie Dupont</div>
                    <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
                      DPO, FinTech Québec
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 – highlighted */}
              <div className="group bg-gradient-to-br from-[#ab54f3] to-[#8b3fd4] p-8 rounded-[40px] flex flex-col justify-between shadow-2xl shadow-[#ab54f3]/20 transition-all duration-500 hover:-translate-y-2">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-8 backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                      <path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56h60A16,16,0,0,1,116,72Zm116,0v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H152a16,16,0,0,1-16-16V72a16,16,0,0,1,16-16h60A16,16,0,0,1,232,72Z" />
                    </svg>
                  </div>
                  <blockquote className="text-xl text-white leading-snug font-medium tracking-tight">
                    &ldquo;Travailler avec le Cercle, c&apos;est comme avoir une extension de notre équipe. Ils ont
                    compris nos défis et livré des résultats concrets et mesurables.&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center gap-4 mt-12 pt-6 border-t border-white/10">
                  <img
                    src="/images-gouvernance-ai/businessman-ai.jpg"
                    className="w-12 h-12 object-cover border-white/20 border-2 rounded-full"
                    alt="Jean-Pierre Martin"
                  />
                  <div>
                    <div className="font-bold text-white text-base">Jean-Pierre Martin</div>
                    <div className="text-purple-100 text-xs font-medium uppercase tracking-wider">
                      VP Innovation, Groupe Média
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="group flex flex-col hover:bg-white hover:shadow-xl hover:shadow-[#ab54f3]/10 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-8 py-8 justify-between">
                <div>
                  <div className="flex gap-1 mb-6 text-[#ab54f3]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.07-31-51.07,31a16,16,0,0,1-23.84-17.34l13.51-58.6-45.1-39.36A16,16,0,0,1,30.5,87.49l59.6-5.49L113.84,26a16,16,0,0,1,28.32,0L165.9,82l59.6,5.49a16,16,0,0,1,9,26.89Z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-xl text-neutral-800 leading-snug font-medium tracking-tight">
                    &ldquo;Dès la première rencontre, le Cercle a apporté clarté et élan à notre stratégie IA.
                    Nous avons constaté une nette amélioration de notre posture de conformité.&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center gap-4 mt-12 pt-6 border-t border-neutral-200/50">
                  <img
                    src="/images-gouvernance-ai/businesspeople-meeting.jpg"
                    className="group-hover:grayscale-0 transition-all duration-500 w-12 h-12 object-cover rounded-full grayscale"
                    alt="Sophie Tremblay"
                  />
                  <div>
                    <div className="font-bold text-neutral-900 text-base">Sophie Tremblay</div>
                    <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
                      CISO, Assurances Nationales
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  PRICING                                                      */}
        {/* ============================================================ */}
        <section className="max-w-7xl mr-auto ml-auto pt-24 pr-6 pb-24 pl-6">
          {/* Section header */}
          <div className="flex flex-col w-full mb-12">
            <div className="flex items-end justify-between w-full pb-5">
              <div className="flex gap-2 items-center">
                <span className="w-8 h-px bg-[#ab54f3]" />
                <span className="uppercase text-xs font-semibold text-[#ab54f3] tracking-[0.2em]">
                  Tarification
                </span>
              </div>
              <Link
                to="/services"
                className="group flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors"
              >
                Comparer les plans
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="w-full h-px bg-neutral-200 mb-8" />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
              <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
                Une tarification simple et transparente qui évolue avec vos ambitions
              </h2>
              <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
                <p className="leading-relaxed text-base text-neutral-600">
                  Choisissez le plan adapté à votre organisation. Le portail IAG est conçu pour
                  vous accompagner de votre premier système IA à votre centième.
                </p>
              </div>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-neutral-950" : "text-neutral-400"}`}>
              Mensuel
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? "bg-[#ab54f3]" : "bg-neutral-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isYearly ? "translate-x-7" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? "text-neutral-950" : "text-neutral-400"}`}>
              Annuel
            </span>
            {isYearly && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                -17%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Observateur — 0$/mois */}
            <div className="lg:col-span-1">
              <div className="hover:shadow-md transition-shadow bg-white h-full border-neutral-200 border rounded-[32px] px-8 py-10 shadow-sm flex flex-col">
                <h3 className="text-3xl tracking-tight mb-2 font-semibold">Observateur</h3>
                <p className="text-neutral-500 mb-8 text-sm">
                  Découvrez la plateforme de l&apos;extérieur.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold">0$</span>
                  <span className="text-neutral-400 text-sm">/{isYearly ? "an" : "mois"}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {[
                    "Dashboard de gouvernance",
                    "Jusqu'à 3 systèmes IA",
                    "Cycle de vie IA",
                    "Veille réglementaire (lecture)",
                    "1 membre",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-neutral-600">
                      <Check className="h-5 w-5 text-neutral-950" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/inscription"
                  className="hover:bg-neutral-50 transition-colors font-medium text-neutral-950 w-full border-neutral-200 border rounded-full pt-4 pb-4 text-center block"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>

            {/* Membre — 99$/mois */}
            <div className="lg:col-span-1">
              <div className="hover:shadow-md transition-shadow bg-neutral-50 h-full border-[#ab54f3]/30 border-2 rounded-[32px] px-8 py-10 shadow-sm flex flex-col relative">
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#ab54f3]/10 border border-[#ab54f3]/20 text-[10px] font-semibold text-[#ab54f3] uppercase tracking-widest">
                  Populaire
                </span>
                <h3 className="text-3xl tracking-tight mb-2 font-semibold">Membre</h3>
                <p className="text-neutral-500 mb-8 text-sm">
                  Faites partie du Cercle de Gouvernance de l&apos;IA.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold">{isYearly ? "990$" : "99$"}</span>
                  <span className="text-neutral-400 text-sm">/{isYearly ? "an" : "mois"}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {[
                    "Systèmes IA illimités",
                    "Évaluations des risques",
                    "Suivi des incidents",
                    "Conformité réglementaire",
                    "Assistant IA intégré",
                    "Export PDF",
                    "Jusqu'à 10 membres",
                    "Répertoire membres & profil public",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-neutral-600">
                      <Check className="h-5 w-5 text-neutral-950" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/inscription"
                  className="hover:bg-neutral-800 transition-colors font-medium text-white bg-neutral-950 w-full rounded-full pt-4 pb-4 text-center block"
                >
                  Devenir Membre
                </Link>
              </div>
            </div>

            {/* Expert — 499$/mois */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-950 border border-white/10 rounded-[32px] px-8 py-10 h-full text-white relative shadow-2xl overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ab54f3]/20 blur-3xl" />
                <h3 className="text-3xl tracking-tight mb-2 font-semibold">Membre Expert</h3>
                <p className="text-neutral-400 mb-8 text-sm">
                  Soyez reconnu et dirigez la gouvernance IA.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold">{isYearly ? "4 990$" : "499$"}</span>
                  <span className="text-neutral-500 text-sm">/{isYearly ? "an" : "mois"}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {[
                    "Tout du plan Membre",
                    "Monitoring avancé",
                    "Catalogue de données",
                    "Structure de gouvernance",
                    "Support dédié",
                    "Membres illimités",
                    "Visibilité prioritaire",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-neutral-300">
                      <Check className="h-5 w-5 text-[#ab54f3]" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/inscription"
                  className="hover:opacity-90 transition-opacity font-medium text-white bg-[#ab54f3] w-full rounded-full pt-4 pb-4 text-center block"
                >
                  Devenir Expert
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FAQ                                                          */}
        {/* ============================================================ */}
        <section className="max-w-3xl mx-auto px-6 pt-24 pb-12">
          {/* Section header */}
          <div className="flex items-end justify-between w-full pb-5 mb-8">
            <div className="flex gap-2 items-center">
              <span className="w-8 h-px bg-[#ab54f3]" />
              <span className="uppercase text-xs font-semibold text-[#ab54f3] tracking-[0.2em]">
                Questions fréquentes
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-12">
            Tout ce que vous devez savoir
          </h2>

          <div className="space-y-0">
            {[
              {
                q: "Le plan Observateur est-il vraiment gratuit ?",
                a: "Oui, sans limite de durée ni carte de crédit. Accédez au dashboard, enregistrez jusqu\u2019à 3 systèmes IA et lancez votre diagnostic de maturité.",
              },
              {
                q: "Combien de temps prend le diagnostic ?",
                a: "Environ 10 minutes. Vous recevez un rapport complet avec un score de maturité et des recommandations personnalisées pour votre organisation.",
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Absolument. Hébergement Supabase avec chiffrement au repos et en transit, conforme aux exigences de la Loi 25 et du RGPD.",
              },
              {
                q: "Quels cadres réglementaires couvrez-vous ?",
                a: "Loi 25 (Québec), EU AI Act, NIST AI RMF, ISO/IEC 42001 et les principes OCDE. Chaque cadre dispose de son propre tableau de suivi.",
              },
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, passez du plan Observateur au Membre ou Expert quand vous le souhaitez. La transition est instantanée et vos données sont conservées.",
              },
              {
                q: "Comment fonctionne le support ?",
                a: "Observateur : documentation en ligne. Membre : support par courriel sous 24h. Expert : support dédié avec temps de réponse garanti.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-base font-medium text-neutral-900 pr-8">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-sm text-neutral-500 leading-relaxed pr-12">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  REGULATORY URGENCY BANNER                                    */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#ab54f3]/5 border border-[#ab54f3]/20 rounded-2xl px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ab54f3]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#ab54f3]" />
              </div>
              <p className="text-sm md:text-base text-neutral-700 font-medium">
                La Loi 25 est en vigueur. L&apos;EU AI Act entre en application.{" "}
                <span className="text-neutral-900 font-semibold">Votre organisation est-elle prête ?</span>
              </p>
            </div>
            <Link
              to="/services#diagnostic"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors whitespace-nowrap"
            >
              Vérifier ma conformité
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FINAL CTA                                                    */}
        {/* ============================================================ */}
        <section className="overflow-hidden bg-white border-neutral-200 pt-24 pb-24 relative">
          <div className="max-w-7xl z-10 mr-auto ml-auto pt-0 pr-6 pb-0 pl-6 relative">
            <div className="overflow-hidden lg:p-24 text-center bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-12 py-12 relative shadow-sm">
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(171,84,243,0.07),transparent_50%)] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ab54f3]/10 border border-[#ab54f3]/20 mb-10">
                  <span className="text-[10px] font-semibold text-[#ab54f3] uppercase tracking-widest">
                    Pilotez votre IA
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl text-neutral-900 tracking-tight leading-[1.1] mb-8 font-semibold">
                  Bâtissez la confiance avec une gouvernance IA{" "}
                  <span className="text-[#ab54f3]">transparente</span>
                </h2>

                <p className="text-lg text-neutral-600 mb-12 leading-relaxed max-w-2xl">
                  Le Cercle est la référence en gouvernance de l&apos;IA au Québec. Lancez votre diagnostic
                  gratuit et rejoignez plus de 150 organisations engagées.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
                  <Link
                    to="/diagnostic"
                    className="w-full sm:w-auto bg-neutral-900 text-white px-10 py-4 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200/50 flex items-center justify-center gap-2"
                  >
                    Lancer le diagnostic gratuit
                    <Zap className="w-4 h-4 fill-current" />
                  </Link>
                  <Link
                    to="/services"
                    className="w-full sm:w-auto bg-white border border-neutral-200 text-neutral-900 px-10 py-4 rounded-full text-sm font-medium hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                  >
                    Découvrir nos services
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-[18px] w-[18px] text-[#ab54f3]" />
                    <span className="text-xs font-medium uppercase tracking-wider">Multi-framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-[18px] w-[18px] text-[#ab54f3]" />
                    <span className="text-xs font-medium uppercase tracking-wider">Sans carte requise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-[18px] w-[18px] text-[#ab54f3]" />
                    <span className="text-xs font-medium uppercase tracking-wider">150+ experts</span>
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
