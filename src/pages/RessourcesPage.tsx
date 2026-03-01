import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Database,
  ShieldAlert,
  BarChart3,
  ClipboardCheck,
  Files,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { DocumentLibraryPreview } from "@/components/resources/DocumentLibraryPreview";
import { VeilleShowcase } from "@/components/resources/VeilleShowcase";
import { ToolkitShowcase } from "@/components/resources/ToolkitShowcase";

const outils = [
  {
    icon: FileText,
    title: "Générateur de documents",
    description:
      "Chartes d\u2019utilisation, politiques d\u2019IA g\u00e9n\u00e9rative, codes d\u2019\u00e9thique.",
  },
  {
    icon: Database,
    title: "Registre des syst\u00e8mes IA",
    description:
      "Inventoriez et suivez tous vos syst\u00e8mes d\u2019intelligence artificielle.",
  },
  {
    icon: ShieldAlert,
    title: "\u00c9valuation des risques",
    description:
      "\u00c9valuez et documentez les risques associ\u00e9s \u00e0 vos syst\u00e8mes IA.",
  },
  {
    icon: BarChart3,
    title: "Diagnostic de maturit\u00e9",
    description:
      "Mesurez votre niveau de gouvernance IA en quelques minutes.",
  },
  {
    icon: ClipboardCheck,
    title: "Checklist de conformit\u00e9",
    description: "Loi\u00a025, AI Act europ\u00e9en, norme ISO/IEC\u00a042001.",
  },
  {
    icon: Files,
    title: "Mod\u00e8les et templates",
    description:
      "Cadres de gouvernance pr\u00eats \u00e0 l\u2019emploi et personnalisables.",
  },
];

const etudesDeCas = [
  "Implantation d'un cadre de gouvernance IA dans une institution financière",
  "Conformité à la Loi 25 pour un réseau de santé",
  "Gouvernance de l'IA générative dans une PME technologique",
];

export function RessourcesPage() {
  return (
    <>
      <SEO title="Ressources" description="Guides, cadres de gouvernance, boîte à outils, veille réglementaire et études de cas pour la gouvernance de l'intelligence artificielle." />
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 mb-6">
            Ressources
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Guides pratiques, outils et veille réglementaire pour structurer votre gouvernance de
            l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Bibliothèque documentaire */}
      <DocumentLibraryPreview />

      {/* SECTION: Boîte à outils */}
      <section id="outils" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <Badge className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <Sparkles className="size-3 mr-1" />
              Acc&egrave;s gratuit
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Bo&icirc;te &agrave; outils
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Des outils pratiques pour accompagner votre d&eacute;marche de gouvernance IA
              au quotidien. Tous accessibles gratuitement depuis votre portail.
            </p>
          </div>

          {/* Tools grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {outils.map((outil) => {
              const Icon = outil.icon;
              return (
                <div
                  key={outil.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {outil.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {outil.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Animation showcase + CTA */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                G&eacute;n&eacute;rez vos documents en quelques clics
              </h3>
              <p className="text-neutral-400 leading-relaxed mb-3">
                Notre g&eacute;n&eacute;rateur IA cr&eacute;e automatiquement vos documents de
                gouvernance : charte d&apos;utilisation, politique d&apos;IA g&eacute;n&eacute;rative,
                code d&apos;&eacute;thique et registre des syst&egrave;mes.
              </p>
              <p className="text-sm text-neutral-500 mb-8">
                Aucune carte de cr&eacute;dit requise &mdash; cr&eacute;ez votre compte gratuit
                pour acc&eacute;der &agrave; tous les outils.
              </p>
              <Link
                to="/rejoindre"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
              >
                Acc&eacute;der aux outils gratuitement
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Right: animated mockup */}
            <ToolkitShowcase />
          </div>
        </div>
      </section>

      {/* SECTION: Veille réglementaire */}
      <section id="veille" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
              Veille réglementaire
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Suivi des lois et règlements en matière d&apos;intelligence artificielle au Québec, au
              Canada et à l&apos;international.
            </p>
          </div>

          <VeilleShowcase />

          <div className="text-center mt-10">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
            >
              Recevoir les mises à jour réglementaires
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: Études de cas */}
      <section id="etudes" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Études de cas
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Exemples concrets d&apos;implantation de gouvernance IA par secteur d&apos;activité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {etudesDeCas.map((etude) => (
              <div
                key={etude}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all relative overflow-hidden"
              >
                <Badge className="rounded-full bg-white/10 text-neutral-300 border border-white/20 mb-4">
                  À venir
                </Badge>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">{etude}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Cette étude de cas sera bientôt disponible pour illustrer les meilleures
                  pratiques de gouvernance IA.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
