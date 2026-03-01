import { Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ClipboardList,
  FileText,
  AlertTriangle,
  FileCheck,
  BarChart3,
  LayoutDashboard,
  Users,
  Target,
  Truck,
  BookOpen,
  Activity,
  Scale,
  Shield,
} from "lucide-react";

import { SEO } from "@/components/SEO";

/* ------------------------------------------------------------------ */
/*  DATA                                                                */
/* ------------------------------------------------------------------ */

const freeTools = [
  {
    icon: ClipboardList,
    title: "Inventaire IA en 10 min",
    description: "Wizard guidé, score de risque automatique.",
  },
  {
    icon: FileText,
    title: "Générateur de politiques IA",
    description: "Templates prêts, versioning, plus de page blanche.",
  },
  {
    icon: AlertTriangle,
    title: "Évaluation de risque en 10 min",
    description: "Questionnaire en langage simple, checklist auto-générée.",
  },
  {
    icon: FileCheck,
    title: "Documentation en 1 clic",
    description: "Evidence Pack complet pour les audits, plus rien à rédiger.",
  },
  {
    icon: BarChart3,
    title: "Conformité multi-référentiels",
    description: "Scores temps réel, alertes veille réglementaire.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableaux de bord board-ready",
    description: "Rapport pour votre CA en 60 secondes, mode présentation.",
  },
];

const advancedTools = [
  {
    icon: Truck,
    title: "Gestion des fournisseurs IA",
    description:
      "Solutions 100% automatique pour gérer vos fournisseurs IA avec des questionnaires de sécurité à remplir par eux.",
    badge: "Membre",
  },
  {
    icon: BookOpen,
    title: "Veille documentaire IA",
    description:
      "Adapte vos politiques automatiquement aux évolutions grâce à un assistant IA entraîné sur les dernières nouveautés réglementaires.",
    badge: "Membre",
  },
  {
    icon: Activity,
    title: "Monitoring & gestion des incidents",
    description:
      "Suivi temps réel de vos systèmes IA, alertes automatiques et gestion complète des incidents.",
    badge: "Expert",
  },
  {
    icon: Scale,
    title: "Gestion biais & équité",
    description:
      "Évaluation systématique des biais algorithmiques et rapports de conformité en matière d'équité.",
    badge: "Membre",
  },
];

const heroChecks = [
  "Inventaire IA en 10 minutes",
  "Score de risque automatique",
  "Documentation audit en 1 clic",
  "100% gratuit pour commencer",
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function RejoindrePage() {
  return (
    <>
      <SEO
        title="Rejoindre le Cercle"
        description="Rejoignez gratuitement le Cercle de Gouvernance de l'IA. Outils de gouvernance simples, diagnostic de maturité, communauté de 150+ experts."
      />
      <div className="overflow-x-hidden">
        {/* ============================================================ */}
        {/*  SECTION 1 — HERO TWO-COLUMN                                  */}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
              {/* Left column — 60% */}
              <div className="lg:col-span-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ab54f3]/10 px-4 py-1.5 mb-6">
                  <Shield className="size-3.5 text-[#ab54f3]" />
                  <span className="text-xs font-semibold text-[#ab54f3] tracking-wide">
                    Inscription gratuite — aucune carte de crédit
                  </span>
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 mb-6 leading-[1.1]">
                  Votre gouvernance IA repose encore sur des tableurs et des documents Word ?
                </h1>

                <p className="text-lg text-neutral-600 mb-8 max-w-xl leading-relaxed">
                  Le Cercle vous donne les outils pour inventorier, évaluer et sécuriser vos projets IA — en quelques minutes, pas en quelques mois.
                </p>

                <ul className="space-y-3 mb-8">
                  {heroChecks.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="size-3 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                  <Link
                    to="/inscription"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
                  >
                    Créer mon compte gratuitement
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/tarifs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors py-3.5"
                  >
                    Comparer les plans
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <p className="text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-500">150+</span> professionnels nous font déjà confiance
                </p>
              </div>

              {/* Right column — 40% */}
              <div className="lg:col-span-2 relative">
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-purple-500/10">
                  <img
                    src="/images-gouvernance-ai/businesspeople-meeting.jpg"
                    className="w-full h-[400px] lg:h-[480px] object-cover"
                    alt="Professionnels collaborant sur la gouvernance IA"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#ab54f3]/10">
                          <Shield className="size-5 text-[#ab54f3]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">Portail de gouvernance IA</p>
                          <p className="text-xs text-neutral-500">Accès immédiat après inscription</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SECTION 2 — FREE TOOLS BENTO GRID                            */}
        {/* ============================================================ */}
        <section className="overflow-hidden border-y bg-white border-neutral-200 pt-24 pb-24 relative">
          <div className="z-10 max-w-7xl mx-auto px-6 relative">
            {/* Section header */}
            <div className="flex flex-col w-full mb-12">
              <div className="flex items-end justify-between w-full pb-5">
                <div className="flex gap-x-2 items-center">
                  <span className="w-8 h-px bg-[#ab54f3]" />
                  <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
                    Outils inclus gratuitement
                  </span>
                </div>
              </div>
              <div className="w-full h-px bg-neutral-200 mb-8" />
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
                  Tout ce qu&apos;il faut pour démarrer votre gouvernance IA
                </h2>
                <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
                  <p className="leading-relaxed text-base text-neutral-600">
                    Des outils simples et concrets, accessibles dès votre inscription gratuite. Aucune configuration complexe.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento grid 3x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeTools.map((tool) => (
                <div
                  key={tool.title}
                  className="group flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-8 py-8"
                >
                  <div className="w-12 h-12 bg-[#ab54f3]/10 rounded-2xl flex items-center justify-center text-[#ab54f3] mb-6">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{tool.description}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-neutral-800 transition-all"
              >
                Commencer gratuitement
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SECTION 3 — COMMUNITY & DIAGNOSTIC (DARK)                    */}
        {/* ============================================================ */}
        <section className="py-24 sm:py-32 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Community card */}
              <div className="rounded-[40px] bg-white/5 border border-white/10 p-10 hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500">
                <div className="w-12 h-12 bg-[#ab54f3]/20 rounded-2xl flex items-center justify-center text-[#ab54f3] mb-6">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">
                  Un cercle d&apos;échange entre professionnels de l&apos;IA
                </h3>
                <p className="text-neutral-400 leading-relaxed mb-8">
                  Rejoignez une communauté structurée de dirigeants, DPO et responsables conformité. Partagez vos défis, échangez des bonnes pratiques et bénéficiez d&apos;un répertoire de membres experts.
                </p>
                <div className="flex gap-8 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-3xl font-bold text-white">150+</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Experts</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">15</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Disciplines</p>
                  </div>
                </div>
              </div>

              {/* Diagnostic card */}
              <div className="rounded-[40px] bg-white/5 border border-white/10 p-10 hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#ab54f3]/20 rounded-2xl flex items-center justify-center text-[#ab54f3] mb-6">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">
                    Diagnostic d&apos;évolution de votre gouvernance IA
                  </h3>
                  <p className="text-neutral-400 leading-relaxed mb-8">
                    Évaluez la maturité de votre organisation en gouvernance IA. Recevez un score personnalisé et des recommandations concrètes pour améliorer votre posture de conformité.
                  </p>
                </div>
                <Link
                  to="/diagnostic"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-900 px-7 py-3.5 text-sm font-semibold hover:bg-[#ab54f3] hover:text-white transition-colors duration-300 w-fit"
                >
                  Lancer le diagnostic
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SECTION 4 — ADVANCED TOOLS (PAID PLANS TEASER)                */}
        {/* ============================================================ */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="flex flex-col w-full mb-12">
              <div className="flex items-end justify-between w-full pb-5">
                <div className="flex gap-x-2 items-center">
                  <span className="w-8 h-px bg-[#ab54f3]" />
                  <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
                    Pour aller plus loin
                  </span>
                </div>
                <Link
                  to="/tarifs"
                  className="group flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors"
                >
                  Comparer les plans
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="w-full h-px bg-neutral-200 mb-8" />
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
                <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
                  Des outils avancés pour les organisations ambitieuses
                </h2>
                <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
                  <p className="leading-relaxed text-base text-neutral-600">
                    Automatisez votre gouvernance IA avec des outils professionnels disponibles dans les plans Membre et Expert.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {advancedTools.map((tool) => (
                <div
                  key={tool.title}
                  className="group flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-8 py-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-[#ab54f3]/10 rounded-2xl flex items-center justify-center text-[#ab54f3]">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ab54f3]/10 text-[#ab54f3] text-[10px] font-bold uppercase tracking-widest">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  SECTION 5 — FINAL CTA BANNER                                  */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0b1a] via-[#1e1a30] to-[#2d1f4e] py-20 sm:py-28">
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[#ab54f3]/10 blur-[120px]" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Prêt à sécuriser vos projets IA ?
            </h2>
            <p className="text-lg text-white/65 max-w-xl mx-auto leading-relaxed mb-8">
              Inscription gratuite en 30 secondes. Aucune carte de crédit requise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
              >
                Créer mon compte gratuitement
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/tarifs"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Comparer les plans
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
