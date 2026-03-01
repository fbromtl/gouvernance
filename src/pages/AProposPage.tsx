import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Users,
  BookOpen,
  Shield,
  FileCheck,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

export function AProposPage() {
  const values = [
    {
      title: "Transparence",
      description: "Nous documentons nos méthodologies et partageons ouvertement nos référentiels pour construire la confiance.",
    },
    {
      title: "Rigueur",
      description: "Nos travaux s'appuient sur des cadres reconnus et des processus de validation éprouvés.",
    },
    {
      title: "Collaboration",
      description: "Nous favorisons l'échange entre experts et organisations pour une gouvernance collective.",
    },
  ];


  const frameworks = [
    {
      name: "Loi 25 (Québec)",
      description: "Protection des renseignements personnels",
      origin: "Québec",
    },
    {
      name: "Projet de loi C-27",
      description: "Loi sur l'intelligence artificielle et les données",
      origin: "Canada",
    },
    {
      name: "AI Act (UE)",
      description: "Règlement européen sur l'intelligence artificielle",
      origin: "UE",
    },
    {
      name: "NIST AI RMF",
      description: "Cadre de gestion des risques de l'IA",
      origin: "États-Unis",
    },
    {
      name: "ISO/IEC 42001",
      description: "Système de gestion de l'intelligence artificielle",
      origin: "International",
    },
  ];

  const gouvernanceItems = [
    {
      title: "Comité directeur",
      description:
        "Un groupe de dirigeants et d'experts assure l'orientation stratégique du Cercle, la validation des travaux et la représentation auprès des parties prenantes.",
    },
    {
      title: "Charte éthique",
      description:
        "Des principes de conduite guident nos activités : impartialité, intégrité intellectuelle, respect de la confidentialité et engagement envers le bien commun.",
    },
    {
      title: "Processus décisionnel",
      description:
        "Les orientations majeures sont prises collectivement, selon des mécanismes de concertation et de vote définis dans nos statuts.",
    },
  ];

  return (
    <>
      <SEO title="À propos" description="Découvrez la mission, la vision et l'approche du Cercle de Gouvernance de l'IA. Un réseau d'experts dédié à la gouvernance responsable de l'intelligence artificielle." />
      <div className="overflow-x-hidden">
      {/* HERO SECTION */}
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
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-950 tracking-tight mb-6">
            À propos du Cercle
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Une communauté d&apos;experts engagés pour une gouvernance responsable de
            l&apos;intelligence artificielle.
          </p>
        </div>
      </section>

      {/* SECTION: Notre mission (id="mission") — Bento Grid */}
      <section id="mission" className="overflow-hidden border-y bg-white border-neutral-200 pt-24 pb-24 relative scroll-mt-20">
        <div className="z-10 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative">
          {/* Section header */}
          <div className="flex flex-col w-full mb-12">
            <div className="flex items-end justify-between w-full pb-5">
              <div className="flex gap-x-2 items-center">
                <span className="w-8 h-px bg-[#ab54f3]" />
                <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
                  Notre mission
                </span>
              </div>
            </div>
            <div className="w-full h-px bg-neutral-200 mb-8" />
          </div>

          {/* Bento grid – 2 rows */}
          {/* Row 1: Mission (left half) + Photo+Vision (right half) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mission card */}
            <div className="group flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 bg-neutral-50 border-neutral-200/60 border rounded-[40px] px-10 py-10 justify-between min-h-[340px]">
              <div>
                <div className="w-12 h-12 bg-[#ab54f3]/10 rounded-2xl flex items-center justify-center text-[#ab54f3] mb-6">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-2xl text-neutral-900 mb-4 tracking-tight leading-tight font-semibold">
                  Notre mission
                </h3>
                <p className="text-neutral-500 leading-relaxed mb-4">
                  Le Cercle de Gouvernance de l&apos;IA existe pour combler un besoin critique : <span className="text-neutral-700 font-medium">outiller les organisations avec des outils de gouvernance simples et faciles à utiliser</span>, afin que les dirigeants puissent sécuriser leurs projets IA.
                </p>
                <p className="text-neutral-500 leading-relaxed">
                  Face à l&apos;évolution rapide de l&apos;IA et à la multiplication des cadres réglementaires, nous offrons un espace d&apos;échange structuré et des ressources pratiques pour une adoption éthique, sécuritaire et conforme.
                </p>
              </div>
              <div className="pt-6 border-t border-neutral-100 mt-6">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Depuis 2024
                </span>
              </div>
            </div>

            {/* Photo + Vision card */}
            <div className="relative rounded-[40px] overflow-hidden min-h-[340px] h-[400px] lg:h-auto bg-neutral-900 group hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500">
              <img
                src="/images-gouvernance-ai/businesspeople-meeting.jpg"
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                alt="Réunion de gouvernance IA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
              <div className="absolute top-6 left-6">
                <span className="inline-block px-3 py-1 bg-[#ab54f3] rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                  Notre vision
                </span>
              </div>
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <p className="text-2xl leading-tight font-semibold">
                  Devenir la référence francophone en gouvernance de l&apos;IA, en produisant des outils concrets et accessibles pour que chaque dirigeant puisse gouverner l&apos;IA avec confiance.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: 3 Values + Stats dark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Transparence */}
            <div className="group bg-neutral-50 border border-neutral-200/60 rounded-[40px] px-8 py-8 flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500">
              <div className="w-10 h-10 bg-[#ab54f3]/10 rounded-xl flex items-center justify-center text-[#ab54f3] mb-5">
                <Eye className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">Transparence</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Nous documentons nos méthodologies et partageons ouvertement nos référentiels pour construire la confiance.
              </p>
            </div>

            {/* Rigueur */}
            <div className="group bg-neutral-50 border border-neutral-200/60 rounded-[40px] px-8 py-8 flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500">
              <div className="w-10 h-10 bg-[#ab54f3]/10 rounded-xl flex items-center justify-center text-[#ab54f3] mb-5">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">Rigueur</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Nos travaux s&apos;appuient sur des cadres reconnus et des processus de validation éprouvés.
              </p>
            </div>

            {/* Collaboration */}
            <div className="group bg-neutral-50 border border-neutral-200/60 rounded-[40px] px-8 py-8 flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500">
              <div className="w-10 h-10 bg-[#ab54f3]/10 rounded-xl flex items-center justify-center text-[#ab54f3] mb-5">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">Collaboration</h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Nous favorisons l&apos;échange entre experts et organisations pour une gouvernance collective.
              </p>
            </div>

            {/* Stats dark */}
            <div className="bg-neutral-950 px-8 py-8 rounded-[40px] flex flex-col justify-between text-white relative hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 min-h-[220px]">
              <span className="text-sm font-medium tracking-tight text-[#ab54f3] uppercase tracking-widest">
                Le Cercle en chiffres
              </span>
              <div className="space-y-4 my-4">
                <div className="group/link cursor-pointer">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Experts</p>
                  <p className="text-3xl font-bold group-hover/link:text-[#ab54f3] transition-colors">
                    150+
                  </p>
                </div>
                <div className="group/link cursor-pointer">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Disciplines</p>
                  <p className="text-3xl font-bold group-hover/link:text-[#ab54f3] transition-colors">
                    15
                  </p>
                </div>
              </div>
              <Link
                to="/rejoindre"
                className="w-full bg-white text-neutral-900 py-3 rounded-[20px] text-sm font-semibold hover:bg-[#ab54f3] hover:text-white transition-colors duration-300 text-center block"
              >
                Rejoindre le Cercle
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION: Notre approche (id="approche") — bg-white */}
      <section id="approche" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4 text-center">
            Notre approche
          </h2>
          <p className="text-lg text-neutral-600 text-center mb-16 max-w-2xl mx-auto">
            Notre méthodologie s&apos;appuie sur les cadres de référence les plus reconnus
            au niveau international, adaptés à la réalité québécoise et canadienne.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {frameworks.map((f) => (
              <Card
                key={f.name}
                className="rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2 text-xs rounded-full">
                    {f.origin}
                  </Badge>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="size-4 text-purple-500 shrink-0" />
                    {f.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Gouvernance du cercle (id="gouvernance") — DARK bg-neutral-950 */}
      <section id="gouvernance" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 text-center">
            Gouvernance du cercle
          </h2>
          <p className="text-lg text-neutral-400 text-center mb-16 max-w-2xl mx-auto">
            Une structure organisationnelle transparente pour garantir l&apos;intégrité et
            l&apos;efficacité de nos actions.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300">
              <Shield className="size-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Comité directeur</h3>
              <p className="text-neutral-400 leading-relaxed">
                {gouvernanceItems[0].description}
              </p>
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300">
              <FileCheck className="size-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Charte éthique</h3>
              <p className="text-neutral-400 leading-relaxed">
                {gouvernanceItems[1].description}
              </p>
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300">
              <Users className="size-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Processus décisionnel</h3>
              <p className="text-neutral-400 leading-relaxed">
                {gouvernanceItems[2].description}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/rejoindre"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
            >
              Rejoindre le Cercle
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
