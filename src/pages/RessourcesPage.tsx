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

export function RessourcesPage() {
  return (
    <>
      <SEO title="Ressources" description="Guides, cadres de gouvernance, boîte à outils et veille réglementaire pour la gouvernance de l'intelligence artificielle." />
      <div className="overflow-x-hidden">
      {/* HERO — fond beige */}
      <section className="pt-32 pb-20 bg-[#f7f6f4]">
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1a1a1a] mb-6">
            Ressources
          </h1>
          <p className="text-lg sm:text-xl text-[#5c5a56] max-w-2xl mx-auto">
            Guides pratiques, outils et veille réglementaire pour structurer votre gouvernance de
            l&apos;IA.
          </p>
        </div>
      </section>

      {/* SECTION: Bibliothèque documentaire */}
      <DocumentLibraryPreview />

      {/* SECTION: Boîte à outils */}
      <section id="outils" className="py-24 sm:py-32 bg-[#0e0f19] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <Badge className="rounded-full bg-[#57886c]/10 text-[#81a684] border border-[#57886c]/20 mb-4">
              <Sparkles className="size-3 mr-1" />
              Acc&egrave;s gratuit
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
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
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-[#57886c]/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#57886c]/10 text-[#81a684] group-hover:bg-[#57886c]/20 transition-colors">
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

          {/* Image accent — data analysis */}
          <div className="relative rounded-[24px] overflow-hidden mb-16 h-[220px] sm:h-[280px]">
            <img
              src="/images-gouvernance-ai/hands-hovering-glowing-data.jpg"
              alt="Analyse de données de gouvernance IA"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e0f19]/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-white/90 text-sm font-semibold uppercase tracking-widest">Pilotez vos données IA</p>
            </div>
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
                className="inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-7 py-3 text-sm font-semibold text-white transition-all"
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
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4">
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
              className="inline-flex items-center gap-2 rounded-full bg-[#57886c] hover:bg-[#466060] px-7 py-3 text-sm font-semibold text-white transition-all"
            >
              Recevoir les mises à jour réglementaires
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
