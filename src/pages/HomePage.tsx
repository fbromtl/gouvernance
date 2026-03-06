import { useState, useEffect } from "react";
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
  X,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  ChevronDown,
  AlertTriangle,
  Bot,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { SEO, JsonLd } from "@/components/SEO";
import { McpAgentShowcase } from "@/components/home/McpAgentShowcase";
import { EcosystemMarquee } from "@/components/home/EcosystemMarquee";

/* ================================================================== */
/*  HOME PAGE – Template-inspired design with governance content       */
/* ================================================================== */

export function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);

  // Sticky CTA bar: show after scrolling past hero, hide near pricing
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pricingEl = document.getElementById("pricing");
      const pricingTop = pricingEl ? pricingEl.offsetTop - window.innerHeight : Infinity;
      setShowStickyBar(scrollY > 500 && scrollY < pricingTop);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              radial-gradient(at 0% 0%, #E9E0D1 0, transparent 50%),
              radial-gradient(at 100% 0%, #E9E0D1 0, transparent 50%),
              radial-gradient(at 100% 100%, #E9E0D1 0, transparent 50%),
              radial-gradient(at 0% 100%, #E9E0D1 0, transparent 50%)
            `,
          }}
        >
          <div className="text-center max-w-7xl mr-auto ml-auto pr-6 pl-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur border border-neutral-200 px-3 py-1 rounded-full mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#57886c] animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-500">
                Gouvernance IA Responsable
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-neutral-900 mb-6 max-w-4xl mx-auto leading-[1.1] font-semibold">
              Gérez vos systèmes d&apos;IA.<br />
              En <span className="text-[#57886c]">conformité</span>.<br />
              Sans <span className="text-[#57886c]">complexité</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              La plateforme tout-en-un pour évaluer, conformer et piloter vos systèmes d&apos;IA.
              Rejoignez plus de 150 experts en gouvernance de l&apos;intelligence artificielle.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-center w-full max-w-2xl mx-auto">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 font-medium text-white bg-[#57886c] rounded-full py-4 px-8 transition-all duration-300 hover:bg-[#466060]"
              >
                Créer mon compte gratuit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/diagnostic"
                className="inline-flex items-center gap-2 font-medium text-neutral-900 bg-white border border-neutral-200 rounded-full py-4 px-8 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all"
              >
                Lancer le diagnostic
                <Zap className="w-4 h-4" />
              </Link>
            </div>

            {/* Reassurance line */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#57886c]" /> Gratuit</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#57886c]" /> Sans carte de crédit</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#57886c]" /> Diagnostic en 10 min</span>
            </div>

            {/* Quebec badge */}
            <div className="flex justify-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur border border-neutral-200 px-3.5 py-1.5 rounded-full">
                <span className="text-[#57886c] text-sm leading-none">⚜</span>
                <span className="text-[11px] font-medium text-neutral-500">
                  Fièrement québécois
                </span>
              </div>
            </div>

            {/* ── Social Proof Avatars ── */}
            <div className="flex items-center justify-center gap-3 mb-16">
              <div className="flex -space-x-2.5">
                {[
                  "/images-gouvernance-ai/businesswoman-meeting.jpg",
                  "/images-gouvernance-ai/businessman-ai.jpg",
                  "/images-gouvernance-ai/businesspeople-meeting.jpg",
                  "/images-gouvernance-ai/businessman-laptop.jpg",
                  "/images-gouvernance-ai/coworking.jpg",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">150+ organisations</span> nous font confiance
              </p>
            </div>

            {/* ── Dashboard Mockup + Phone ── */}
            <div className="relative max-w-6xl mx-auto">
              {/* Desktop dashboard */}
              <div className="overflow-hidden flex flex-col bg-white border-neutral-200/60 border rounded-2xl relative shadow-2xl">
                {/* Mockup header */}
                <header className="flex z-20 shrink-0 bg-white border-neutral-100 border-b pt-4 pr-6 pb-4 pl-6 items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                    Tableau de bord : Gouvernance IA
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#57886c] rounded-lg pt-2 pr-4 pb-2 pl-4 shadow-sm">
                      <Shield className="h-3.5 w-3.5" />
                      Conforme
                    </span>
                  </div>
                </header>

                {/* Dashboard content */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* KPI Row — enhanced with icons and trend arrows */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "Systèmes IA", value: "24", change: "+3", up: true, color: "text-[#57886c]", bg: "bg-[#57886c]/8", Icon: Bot },
                      { label: "Score Conformité", value: "87%", change: "+5%", up: true, color: "text-[#57886c]", bg: "bg-[#57886c]/8", Icon: CheckCircle },
                      { label: "Incidents actifs", value: "2", change: "-1", up: false, color: "text-amber-500", bg: "bg-amber-50", Icon: AlertCircle },
                      { label: "Risque élevé", value: "3", change: "stable", up: false, color: "text-red-500", bg: "bg-red-50", Icon: AlertTriangle },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {kpi.label}
                          </p>
                          <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                            <kpi.Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</span>
                          <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.up ? "text-emerald-500" : "text-neutral-400"}`}>
                            {kpi.up ? <TrendingUp className="h-3 w-3" /> : kpi.change !== "stable" ? <TrendingDown className="h-3 w-3" /> : null}
                            {kpi.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compliance progress bars */}
                  <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                      Conformité par référentiel
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: "Loi 25 (Québec)", value: 92 },
                        { label: "EU AI Act", value: 78 },
                        { label: "NIST AI RMF", value: 85 },
                        { label: "ISO 42001", value: 71 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-neutral-600 w-28 sm:w-36 truncate">{item.label}</span>
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#57886c] rounded-full"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-700 w-10 text-right">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart + Activity timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bar chart */}
                    <div className="md:col-span-2 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm h-48">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                        Conformité par cadre
                      </p>
                      <div className="flex items-end gap-3 h-28 px-2">
                        {[
                          { label: "Loi 25", h: "h-24", color: "bg-[#57886c]" },
                          { label: "EU AI", h: "h-20", color: "bg-[#57886c]/80" },
                          { label: "NIST", h: "h-16", color: "bg-[#57886c]/60" },
                          { label: "ISO", h: "h-22", color: "bg-[#57886c]/70" },
                          { label: "RGPD", h: "h-18", color: "bg-[#57886c]/50" },
                        ].map((bar) => (
                          <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full ${bar.h} ${bar.color} rounded-t-lg transition-all`} />
                            <span className="text-[8px] text-neutral-400">{bar.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity timeline */}
                    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm h-48">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                        Activité récente
                      </p>
                      <div className="space-y-3.5">
                        {[
                          { text: "Évaluation terminée — Chatbot RH", time: "il y a 2h", dot: "bg-emerald-400" },
                          { text: "Incident résolu — API Scoring", time: "il y a 5h", dot: "bg-blue-400" },
                          { text: "Nouveau système — IA Recrutement", time: "il y a 1j", dot: "bg-[#57886c]" },
                        ].map((item) => (
                          <div key={item.text} className="flex gap-2.5">
                            <div className="flex flex-col items-center">
                              <span className={`w-2 h-2 rounded-full ${item.dot} mt-1 shrink-0`} />
                              <span className="w-px flex-1 bg-neutral-100" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-neutral-700 leading-tight truncate">{item.text}</p>
                              <p className="text-[9px] text-neutral-400 mt-0.5">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Floating Phone Mockup ── */}
              <div className="hidden md:block absolute -bottom-12 -right-6 lg:-right-10 z-10 animate-phone-float">
                {/* Phone frame — white/silver */}
                <div className="w-[200px] lg:w-[220px] bg-white border border-neutral-200 rounded-[2.5rem] p-[6px] shadow-xl shadow-black/10">
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white rounded-full z-10 border border-neutral-100" />
                  {/* Screen */}
                  <div className="w-full bg-neutral-50 rounded-[2.1rem] overflow-hidden flex flex-col" style={{ aspectRatio: "9/19" }}>
                    {/* App header */}
                    <div className="flex items-center justify-between px-4 pt-8 pb-2 bg-white border-b border-neutral-100">
                      <span className="text-[10px] font-bold text-neutral-900 tracking-tight">GiA</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[8px] text-neutral-400">En ligne</span>
                      </div>
                    </div>

                    {/* Mobile dashboard content */}
                    <div className="flex-1 px-2.5 py-2.5 space-y-2 overflow-hidden">
                      {/* Mini KPIs */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-white rounded-lg p-2 border border-neutral-100">
                          <p className="text-[6px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Conformité</p>
                          <span className="text-sm font-bold text-[#57886c]">87%</span>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-neutral-100">
                          <p className="text-[6px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Systèmes</p>
                          <span className="text-sm font-bold text-[#57886c]">24</span>
                        </div>
                      </div>

                      {/* Mini donut chart */}
                      <div className="bg-white rounded-lg p-2.5 border border-neutral-100 flex items-center gap-3">
                        <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e5e5" strokeWidth="4" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#57886c" strokeWidth="4"
                            strokeDasharray="76.4 87.96" strokeDashoffset="22" strokeLinecap="round" />
                          <text x="18" y="20" textAnchor="middle" className="text-[8px] font-bold fill-neutral-700">87%</text>
                        </svg>
                        <div>
                          <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-widest">Score global</p>
                          <p className="text-[8px] text-neutral-600 mt-0.5">4/5 cadres conformes</p>
                        </div>
                      </div>

                      {/* Mini notifications */}
                      <div className="bg-white rounded-lg p-2 border border-neutral-100 space-y-1.5">
                        <p className="text-[6px] font-bold text-neutral-400 uppercase tracking-widest">Notifications</p>
                        {[
                          { text: "Évaluation terminée", dot: "bg-emerald-400" },
                          { text: "Incident résolu", dot: "bg-blue-400" },
                        ].map((n) => (
                          <div key={n.text} className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${n.dot} shrink-0`} />
                            <span className="text-[8px] text-neutral-600 truncate">{n.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom tab bar */}
                    <div className="flex items-center justify-around px-2 py-1.5 border-t border-neutral-100 bg-white shrink-0">
                      {[
                        { label: "Accueil", active: true },
                        { label: "IA", active: false },
                        { label: "Risques", active: false },
                        { label: "Conformité", active: false },
                        { label: "Plus", active: false },
                      ].map((tab) => (
                        <div key={tab.label} className="flex flex-col items-center gap-0.5">
                          <div className={`w-3 h-3 rounded ${tab.active ? "bg-[#57886c]" : "bg-neutral-200"}`} />
                          <span className={`text-[5px] font-medium ${tab.active ? "text-[#57886c]" : "text-neutral-400"}`}>
                            {tab.label}
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
              <p className="uppercase text-xs font-semibold text-neutral-900 tracking-[0.2em] text-center mb-5">
                Aligné sur les cadres de référence internationaux
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {["Loi 25", "EU AI Act", "NIST AI RMF", "ISO 42001", "RGPD", "OCDE"].map(
                  (framework) => (
                    <span
                      key={framework}
                      className="rounded-lg bg-white/95 px-4 py-2 text-xs font-bold text-[#1a1a2e] uppercase tracking-wider shadow-sm backdrop-blur-sm"
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
        {/*  MCP AGENT SHOWCASE                                          */}
        {/* ============================================================ */}
        <McpAgentShowcase />

        {/* ============================================================ */}
        {/*  BENTO "WHY" SECTION                                         */}
        {/* ============================================================ */}
        <section className="overflow-hidden border-y bg-white border-neutral-200 pt-24 pb-24 relative">
          <div className="z-10 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative">
            {/* Section header */}
            <div className="flex flex-col w-full mb-12">
              <div className="flex items-end justify-between w-full pb-5">
                <div className="flex gap-x-2 items-center">
                  <span className="w-8 h-px bg-[#57886c]" />
                  <span className="uppercase text-xs font-bold text-[#57886c] tracking-[0.2em]">
                    Pourquoi le Cercle ?
                  </span>
                </div>
                <Link
                  to="/a-propos"
                  className="group flex items-center gap-2 text-sm font-medium text-[#57886c] hover:text-[#466060] transition-colors"
                >
                  En savoir plus
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="w-full h-px bg-neutral-200 mb-8" />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                <h2 className="font-serif md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
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
              <div className="group flex flex-col hover:shadow-xl hover:shadow-[#57886c]/5 transition-all duration-500 bg-neutral-50 h-[520px] border-neutral-200/60 border rounded-[40px] px-10 py-10 justify-between">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#57886c]/10 to-[#81a684]/15 rounded-2xl flex items-center justify-center text-[#57886c] mb-8">
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
              <div className="relative rounded-[40px] overflow-hidden h-[520px] bg-[#0e0f19] group">
                <img
                  src="/images-gouvernance-ai/ceo-analysing.jpg"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  alt="Analyse de gouvernance IA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white pr-10">
                  <span className="inline-block px-3 py-1 bg-[#57886c] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
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
                  <span className="text-xs text-[#57886c] font-bold block mb-2 uppercase tracking-[0.2em]">
                    Score de conformité
                  </span>
                  <span className="text-xl font-medium text-neutral-900">Fiabilité garantie</span>
                </div>
                <div className="flex w-56 h-56 relative items-center justify-center">
                  <div className="absolute inset-0 bg-[#57886c]/5 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-[14px] border-neutral-100 rounded-full" />
                  <div
                    className="border-[14px] border-t-transparent border-r-transparent border-[#57886c] rounded-full absolute inset-0 -rotate-45"
                  />
                  <div className="text-5xl tracking-tighter text-neutral-900 font-bold">98%</div>
                </div>
                <Link
                  to="/portail"
                  className="w-full bg-[#0e0f19] text-white py-4 rounded-[20px] text-sm font-semibold hover:bg-[#57886c] transition-colors duration-300 shadow-lg shadow-neutral-200 text-center block"
                >
                  Voir le portail
                </Link>
              </div>

              {/* Card 4: Expert Support dark */}
              <div className="bg-[#0e0f19] p-10 rounded-[40px] flex flex-col justify-between h-[520px] text-white relative transition-all duration-500">
                <div className="flex justify-between items-start">
                  <span className="text-lg font-medium tracking-tight text-[#81a684]">
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
                    <p className="text-lg font-medium border-b border-white/10 pb-2 group-hover/link:text-[#57886c] transition-colors">
                      150+ spécialistes
                    </p>
                  </div>
                  <div className="group/link cursor-pointer">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Disciplines</p>
                    <p className="text-lg font-medium group-hover/link:text-[#57886c] transition-colors">
                      15 domaines couverts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intermediate CTA */}
        <div className="text-center py-10 bg-white">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-7 py-3 text-sm font-semibold text-white transition-all"
          >
            Rejoindre le Cercle gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/*  HOW IT WORKS – 3 steps                                      */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-24">
          {/* Section header */}
          <div className="flex items-end justify-between w-full pb-5 mb-8">
            <div className="flex gap-2 items-center">
              <span className="w-8 h-px bg-[#57886c]" />
              <span className="uppercase text-xs font-semibold text-[#57886c] tracking-[0.2em]">
                Comment ça marche
              </span>
            </div>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 max-w-3xl mb-16">
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
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#57886c]/5 border border-[#57886c]/15 mb-6 relative z-10">
                  <step.icon className="w-8 h-8 text-[#57886c]" />
                </div>
                <p className="text-5xl font-bold text-[#57886c]/10 mb-3">{step.num}</p>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 bg-[#466060] text-white px-8 py-4 rounded-full font-medium hover:bg-[#0e0f19] transition-colors"
            >
              Commencer maintenant, c&apos;est gratuit
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
                  <span className="w-8 h-px bg-[#57886c]" />
                  <span className="uppercase text-xs font-bold text-[#57886c] tracking-[0.2em]">
                    Fonctionnalités clés
                  </span>
                </div>
                <Link
                  to="/ressources"
                  className="group flex items-center gap-2 text-sm font-medium text-[#57886c] hover:text-[#466060] transition-colors"
                >
                  Voir les ressources
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="w-full h-px bg-neutral-200 mb-8" />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                <h2 className="font-serif md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
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
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#57886c]/10 text-[#57886c] text-xs font-semibold tracking-medium mb-6">
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
                      <span className="px-2 py-0.5 bg-[#57886c]/10 text-[#57886c] text-[8px] font-bold rounded-full">
                        Filtrer
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Chatbot Support", type: "GenAI", risk: "Limité", color: "bg-[#466060]/15 text-[#466060]" },
                      { name: "Scoring Crédit", type: "ML", risk: "Élevé", color: "bg-red-100 text-red-600" },
                      { name: "Tri CV Auto", type: "ML", risk: "Élevé", color: "bg-red-100 text-red-600" },
                      { name: "Recommandation", type: "ML", risk: "Minimal", color: "bg-[#81a684]/20 text-[#57886c]" },
                    ].map((sys) => (
                      <div
                        key={sys.name}
                        className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-neutral-100 shadow-sm"
                      >
                        <div className="w-1.5 h-6 rounded-full bg-[#57886c]/40" />
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
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#57886c]/10 text-[#57886c] text-xs font-semibold tracking-medium mb-6">
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
                              : "bg-[#81a684]/20";
                      const hasSystem = [3, 8, 11, 17, 22].includes(i);
                      return (
                        <div key={i} className={`${bg} rounded-md flex items-center justify-center relative`}>
                          {hasSystem && (
                            <div className="w-3 h-3 bg-[#57886c] rounded-full shadow-md shadow-[#57886c]/30" />
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
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#466060]/10 text-[#466060] text-xs font-semibold tracking-medium mb-6">
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
                        <span className="px-1.5 py-0.5 rounded-full bg-[#57886c]/10 text-[#57886c] text-[8px] font-bold">
                          5
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {[
                        { name: "Loi 25", score: "92%", color: "bg-[#57886c]" },
                        { name: "EU AI Act", score: "78%", color: "bg-amber-500" },
                        { name: "NIST AI RMF", score: "85%", color: "bg-[#57886c]" },
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
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#466060]/10 text-[#466060] text-xs font-semibold tracking-medium mb-6">
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
                        <div className="w-3/5 h-full bg-[#57886c] rounded-full" />
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
                              ? "border-[#57886c] bg-[#57886c]/5 text-[#57886c]"
                              : "border-neutral-200 text-neutral-600"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              i === 0 ? "border-[#57886c] bg-[#57886c]" : "border-neutral-300"
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
                  <p className="text-4xl md:text-5xl font-bold text-[#0e0f19] mb-2">{stat.value}</p>
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
                    <span className="w-8 h-px bg-[#57886c]" />
                    <span className="uppercase text-xs font-bold text-[#57886c] tracking-[0.2em]">
                      Témoignages
                    </span>
                  </div>
                </div>
                <div className="w-full h-px bg-neutral-200 mb-8" />
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                  <h2 className="font-serif md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
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
              <div className="group flex flex-col hover:bg-white hover:shadow-xl hover:shadow-[#57886c]/10 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-8 py-8 justify-between">
                <div>
                  <div className="flex gap-1 mb-6 text-[#f59e0b]">
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
              <div className="group bg-gradient-to-br from-[#57886c] to-[#466060] p-8 rounded-[40px] flex flex-col justify-between transition-all duration-500 hover:-translate-y-2">
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
                    <div className="text-white/70 text-xs font-medium uppercase tracking-wider">
                      VP Innovation, Groupe Média
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="group flex flex-col hover:bg-white hover:shadow-xl hover:shadow-[#57886c]/10 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-8 py-8 justify-between">
                <div>
                  <div className="flex gap-1 mb-6 text-[#f59e0b]">
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

        {/* Intermediate CTA */}
        <div className="text-center py-10">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-[#0e0f19] px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1a1f2e] transition-all"
          >
            Commencer mon évaluation gratuite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/*  PRICING                                                      */}
        {/* ============================================================ */}
        <section id="pricing" className="max-w-7xl mr-auto ml-auto pt-24 pr-6 pb-24 pl-6">
          <div className="flex flex-col w-full mb-12">
            <div className="flex items-end justify-between w-full pb-5">
              <div className="flex gap-2 items-center">
                <span className="w-8 h-px bg-[#57886c]" />
                <span className="uppercase text-xs font-semibold text-[#57886c] tracking-[0.2em]">
                  Tarification
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-200 mb-8" />

            <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
              <h2 className="font-serif md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight font-semibold">
                Une tarification simple et transparente
              </h2>
              <p className="leading-relaxed text-base text-neutral-600">
                Choisissez le plan adapté à votre organisation. Le portail est conçu pour
                vous accompagner de votre premier système IA à votre centième.
              </p>
              <Link
                to="/tarifs"
                className="group inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-8 py-4 text-sm font-semibold text-white transition-all"
              >
                Voir les tarifs d&apos;adhésion
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
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
              <span className="w-8 h-px bg-[#57886c]" />
              <span className="uppercase text-xs font-semibold text-[#57886c] tracking-[0.2em]">
                Questions fréquentes
              </span>
            </div>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 mb-12">
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

        {/* Intermediate CTA */}
        <div className="text-center py-10">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-7 py-3 text-sm font-semibold text-white transition-all"
          >
            Créer mon compte, c'est gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/*  REGULATORY URGENCY BANNER                                    */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#f8c7cc]/10 border border-[#f8c7cc]/30 rounded-2xl px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f8c7cc]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#c4707a]" />
              </div>
              <p className="text-sm md:text-base text-neutral-700 font-medium">
                La Loi 25 est en vigueur. L&apos;EU AI Act entre en application.{" "}
                <span className="text-neutral-900 font-semibold">Votre organisation est-elle prête ?</span>
              </p>
            </div>
            <Link
              to="/inscription"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-5 py-2.5 text-sm font-semibold text-white transition-all whitespace-nowrap"
            >
              Vérifier maintenant
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(87,136,108,0.07),transparent_50%)] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_100%_100%,rgba(248,199,204,0.08),transparent_60%)] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#57886c]/10 border border-[#57886c]/20 mb-10">
                  <span className="text-[10px] font-semibold text-[#57886c] uppercase tracking-widest">
                    Pilotez votre IA
                  </span>
                </div>

                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-900 tracking-tight leading-[1.1] mb-8 font-semibold">
                  Bâtissez la confiance avec une gouvernance IA{" "}
                  <span className="text-[#57886c]">transparente</span>
                </h2>

                <p className="text-lg text-neutral-600 mb-12 leading-relaxed max-w-2xl">
                  Le Cercle est la référence en gouvernance de l&apos;IA au Québec. Lancez votre diagnostic
                  gratuit et rejoignez plus de 150 organisations engagées.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
                  <Link
                    to="/diagnostic"
                    className="w-full sm:w-auto bg-[#0e0f19] text-white px-10 py-4 rounded-full text-sm font-medium hover:bg-[#1a1f2e] transition-all shadow-xl shadow-neutral-200/50 flex items-center justify-center gap-2"
                  >
                    Lancer le diagnostic gratuit
                    <Zap className="w-4 h-4 fill-current" />
                  </Link>
                  <Link
                    to="/ressources"
                    className="w-full sm:w-auto bg-white border border-neutral-200 text-neutral-900 px-10 py-4 rounded-full text-sm font-medium hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                  >
                    Explorer les ressources
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-[18px] w-[18px] text-[#57886c]" />
                    <span className="text-xs font-medium uppercase tracking-wider">Multi-framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-[18px] w-[18px] text-[#57886c]" />
                    <span className="text-xs font-medium uppercase tracking-wider">Sans carte requise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-[18px] w-[18px] text-[#57886c]" />
                    <span className="text-xs font-medium uppercase tracking-wider">150+ experts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  ECOSYSTEM MARQUEE                                           */}
        {/* ============================================================ */}
        <EcosystemMarquee />

        {/* ============================================================ */}
        {/*  STICKY CTA BAR                                               */}
        {/* ============================================================ */}
        {showStickyBar && !stickyDismissed && (
          <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg px-6 py-3">
              <p className="text-sm font-medium text-neutral-700 hidden sm:block">
                Évaluez votre maturité IA :{" "}
                <span className="text-neutral-500">Gratuit, 10 minutes</span>
              </p>
              <p className="text-sm font-medium text-neutral-700 sm:hidden">
                Diagnostic IA gratuit
              </p>
              <div className="flex items-center gap-2">
                <Link
                  to="/inscription"
                  className="inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-5 py-2 text-sm font-semibold text-white transition-all whitespace-nowrap"
                >
                  S'inscrire
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setStickyDismissed(true)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
