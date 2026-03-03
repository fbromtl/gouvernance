import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Bot,
  RefreshCw,
  Building2,
  AlertTriangle,
  AlertCircle,
  Scale,
  CheckCircle,
  Shield,
  ClipboardCheck,
  FileText,
  Eye,
  Activity,
  Database,
  Newspaper,
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SEO, JsonLd } from "@/components/SEO";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */

interface Feature {
  key: string;
  icon: LucideIcon;
}

interface Category {
  id: string;
  features: Feature[];
}

/* ------------------------------------------------------------------ */
/*  STATIC DATA                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES: Category[] = [
  {
    id: "inventory",
    features: [
      { key: "aiSystems", icon: Bot },
      { key: "lifecycle", icon: RefreshCw },
      { key: "vendors", icon: Building2 },
    ],
  },
  {
    id: "risks",
    features: [
      { key: "risks", icon: AlertTriangle },
      { key: "incidents", icon: AlertCircle },
      { key: "bias", icon: Scale },
    ],
  },
  {
    id: "compliance",
    features: [
      { key: "compliance", icon: CheckCircle },
      { key: "policies", icon: Shield },
      { key: "decisions", icon: ClipboardCheck },
      { key: "documents", icon: FileText },
      { key: "agents", icon: Bot },
    ],
  },
  {
    id: "operations",
    features: [
      { key: "transparency", icon: Eye },
      { key: "monitoring", icon: Activity },
      { key: "data", icon: Database },
      { key: "veille", icon: Newspaper },
    ],
  },
  {
    id: "intelligence",
    features: [
      { key: "dashboard", icon: LayoutDashboard },
      { key: "aiChat", icon: MessageSquare },
    ],
  },
  {
    id: "community",
    features: [
      { key: "members", icon: Users },
      { key: "profile", icon: UserCircle },
      { key: "library", icon: BookOpen },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export function FonctionnalitesPage() {
  const { t } = useTranslation("fonctionnalites");

  /* ---- IntersectionObserver for active nav pill ---- */
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    for (const cat of CATEGORIES) {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  /** Scroll the active pill into view inside the horizontal nav */
  useEffect(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector(
      `[data-cat="${activeCategory}"]`,
    ) as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeCategory]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <SEO title={t("seo.title")} description={t("seo.description")} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Fonctionnalites -- Cercle de Gouvernance en Intelligence Artificielle",
          description: t("seo.description"),
          url: "https://gouvernance.ai/fonctionnalites",
        }}
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30] pt-32 pb-20 sm:pt-36 sm:pb-24">
        {/* Radial purple glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-[#ab54f3]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#ab54f3] to-[#7c2cd4] hover:from-[#9b44e3] hover:to-[#6c1cc4] text-white shadow-xl shadow-[#ab54f3]/25 px-7 h-11 text-sm font-semibold"
            >
              <Link to="/inscription">
                {t("hero.cta")}
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-7 h-11 text-sm font-semibold"
            >
              <Link to="/tarifs">{t("hero.ctaSecondary")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STICKY CATEGORY NAV                                          */}
      {/* ============================================================ */}
      <nav className="sticky top-16 z-30 bg-white/80 backdrop-blur-lg border-b border-border/40">
        <div
          ref={navRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto py-3 scrollbar-hide"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              data-cat={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#ab54f3]/10 text-[#ab54f3] shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(`categories.${cat.id}.title`)}
            </button>
          ))}
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  FEATURE SECTIONS                                             */}
      {/* ============================================================ */}
      {CATEGORIES.map((cat, catIdx) => (
        <section
          key={cat.id}
          id={cat.id}
          ref={(el) => {
            sectionRefs.current[cat.id] = el;
          }}
          className={`scroll-mt-28 py-16 sm:py-24 ${
            catIdx % 2 === 0 ? "bg-white" : "bg-neutral-50/60"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                {t(`categories.${cat.id}.title`)}
              </h2>
              <p className="mt-3 text-muted-foreground text-base max-w-xl mx-auto">
                {t(`categories.${cat.id}.subtitle`)}
              </p>
            </motion.div>

            {/* Feature cards grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {cat.features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.key}
                    variants={cardVariants}
                    className="group rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#ab54f3]/40 hover:shadow-lg hover:shadow-[#ab54f3]/5"
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#ab54f3]/10">
                      <Icon className="size-5 text-[#ab54f3]" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {t(`features.${feat.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`features.${feat.key}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      ))}

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                   */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30] py-16 sm:py-24">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[#ab54f3]/10 blur-[120px]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-base text-white/65 max-w-xl mx-auto leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#ab54f3] to-[#7c2cd4] hover:from-[#9b44e3] hover:to-[#6c1cc4] text-white shadow-xl shadow-[#ab54f3]/25 px-7 h-11 text-sm font-semibold"
            >
              <Link to="/inscription">
                {t("cta.primary")}
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-7 h-11 text-sm font-semibold"
            >
              <Link to="/tarifs">{t("cta.secondary")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
