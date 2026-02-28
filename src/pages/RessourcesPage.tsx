import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { DocumentLibraryPreview } from "@/components/resources/DocumentLibraryPreview";
import { VeilleShowcase } from "@/components/resources/VeilleShowcase";
import { ToolkitShowcase } from "@/components/resources/ToolkitShowcase";

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
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: text + CTA */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                Boîte à outils
              </h2>
              <p className="text-lg text-neutral-400 max-w-xl mb-4">
                Générez automatiquement vos documents de gouvernance IA : charte
                d&apos;utilisation, politique d&apos;IA générative, code d&apos;éthique et
                registre des systèmes.
              </p>
              <p className="text-sm text-neutral-500 mb-8">
                Gratuit — aucune carte de crédit requise.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
              >
                Créer mes documents gratuitement
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
