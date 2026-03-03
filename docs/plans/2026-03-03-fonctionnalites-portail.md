# Page Fonctionnalités du Portail — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a public `/fonctionnalites` page showcasing all 20 portal modules organized in 6 thematic categories with sticky navigation, Framer Motion animations, and responsive card grid.

**Architecture:** Single-page component `FonctionnalitesPage.tsx` using the site vitrine `Layout`. Data is static (no API calls). i18n namespace `fonctionnalites` for FR/EN. Follows exact patterns from `TarifsPage.tsx` and `RessourcesPage.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui Card, Framer Motion, Lucide React, i18next, React Router 7.

---

### Task 1: Create i18n translation files

**Files:**
- Create: `src/i18n/locales/fr/fonctionnalites.json`
- Create: `src/i18n/locales/en/fonctionnalites.json`
- Modify: `src/i18n/index.ts` (register new namespace)

**Step 1: Create French translation file**

Create `src/i18n/locales/fr/fonctionnalites.json`:

```json
{
  "seo": {
    "title": "Fonctionnalités",
    "description": "Découvrez les 20 modules intégrés du portail de gouvernance IA : inventaire, risques, conformité, transparence, monitoring et plus encore."
  },
  "hero": {
    "title": "Tout ce dont vous avez besoin pour gouverner votre IA",
    "subtitle": "20 modules intégrés pour inventorier, évaluer, conformer et piloter vos systèmes d'intelligence artificielle.",
    "cta": "Essayer gratuitement",
    "ctaSecondary": "Voir les tarifs"
  },
  "categories": {
    "inventory": {
      "title": "Inventaire & Cycle de vie",
      "subtitle": "Recensez, suivez et gérez l'ensemble de votre parc IA"
    },
    "risks": {
      "title": "Gestion des risques",
      "subtitle": "Évaluez, détectez et corrigez les risques de vos systèmes"
    },
    "compliance": {
      "title": "Conformité & Gouvernance",
      "subtitle": "Alignez-vous sur les référentiels et structurez votre gouvernance"
    },
    "operations": {
      "title": "Transparence & Opérations",
      "subtitle": "Surveillez, documentez et rendez des comptes en continu"
    },
    "intelligence": {
      "title": "Tableau de bord & Intelligence",
      "subtitle": "Pilotez votre gouvernance IA depuis un centre de commande unique"
    },
    "community": {
      "title": "Communauté & Collaboration",
      "subtitle": "Rejoignez un réseau de professionnels engagés en gouvernance IA"
    }
  },
  "features": {
    "aiSystems": {
      "title": "Inventaire des systèmes IA",
      "description": "Recensez tous vos systèmes d'IA en quelques clics. Un assistant pas-à-pas capture le type, la portée, les données utilisées et les responsables. Vous obtenez instantanément un score de risque et une vue complète de votre parc IA."
    },
    "lifecycle": {
      "title": "Cycle de vie",
      "description": "Tracez chaque changement — mise à jour de modèle, changement de fournisseur, suspension, décommissionnement. Un journal chronologique complet qui prouve votre diligence et facilite les audits."
    },
    "vendors": {
      "title": "Gestion des fournisseurs",
      "description": "Centralisez vos fournisseurs IA : contrats, certifications, niveaux de risque, SLA. Identifiez en un coup d'œil les dépendances critiques et les renouvellements à venir."
    },
    "risks": {
      "title": "Évaluations des risques",
      "description": "Un questionnaire structuré en 6 sections qui calcule automatiquement le score de risque de chaque système. Le résultat s'aligne sur les niveaux du EU AI Act et génère la liste des exigences applicables."
    },
    "incidents": {
      "title": "Gestion des incidents",
      "description": "Déclarez, triagez et résolvez les incidents IA avec un workflow complet. Suivi de la sévérité, assignation, investigation, post-mortem — tout est documenté pour la conformité."
    },
    "bias": {
      "title": "Analyse des biais",
      "description": "Identifiez et corrigez les biais algorithmiques : impact disparate, stéréotypage, hallucinations. Chaque constat est tracé avec sa méthode de détection, sa sévérité et son plan de remédiation."
    },
    "compliance": {
      "title": "Conformité multi-cadres",
      "description": "Évaluez votre conformité simultanément sur 5 référentiels — Loi 25, EU AI Act, NIST AI RMF, ISO 42001, RGPD. Un score global et par cadre, avec un plan de remédiation priorisé."
    },
    "policies": {
      "title": "Politiques & Procédures",
      "description": "Créez et versionnez vos politiques de gouvernance IA : charte éthique, procédures d'approbation, gestion des plaintes. Workflow de publication intégré (brouillon → révision → publié)."
    },
    "decisions": {
      "title": "Registre des décisions",
      "description": "Documentez chaque décision de gouvernance — Go/No-Go, arbitrage éthique, exception. Workflow d'approbation multi-niveaux avec historique complet et piste d'audit."
    },
    "documents": {
      "title": "Gestion documentaire",
      "description": "Centralisez tous vos documents de gouvernance : politiques, rapports d'audit, évaluations d'impact. Classification automatique par IA, versionnement et recherche instantanée."
    },
    "agents": {
      "title": "Registre des agents IA",
      "description": "Cataloguez vos agents IA avec leur niveau d'autonomie (A1 à A5), leur classification de risque et leurs politiques d'usage. Tracez chaque action avec un journal d'exécution détaillé."
    },
    "transparency": {
      "title": "Transparence & Contestations",
      "description": "Tenez un registre des décisions automatisées conforme à la Loi 25 et au RGPD. Gérez les contestations des personnes concernées avec un workflow de traitement complet."
    },
    "monitoring": {
      "title": "Monitoring & Performance",
      "description": "Surveillez vos systèmes IA en continu : performance, dérive de données, dérive de modèle, latence. Configurez des seuils d'alerte et recevez des notifications en temps réel."
    },
    "data": {
      "title": "Gouvernance des données",
      "description": "Cartographiez vos jeux de données : sources, catégories, sensibilité, volumes. Documentez chaque transfert de données avec sa base légale et ses mesures de protection."
    },
    "veille": {
      "title": "Veille réglementaire",
      "description": "Restez informé des évolutions réglementaires au Québec, au Canada et à l'international. Flux automatisé d'actualités avec filtrage par juridiction et analyse d'impact."
    },
    "dashboard": {
      "title": "Tableau de bord centralisé",
      "description": "Vue d'ensemble en temps réel : systèmes en production, score de conformité, incidents actifs, systèmes à haut risque. Graphiques radar multi-cadres, chronologie des incidents et actions en attente."
    },
    "aiChat": {
      "title": "Assistant IA intégré",
      "description": "Posez vos questions de gouvernance à un assistant IA spécialisé. Il connaît vos cadres réglementaires, vos systèmes et vos politiques pour des réponses contextualisées."
    },
    "members": {
      "title": "Répertoire des membres",
      "description": "Connectez-vous avec les professionnels du Cercle. Consultez les profils, expertises et organisations de la communauté de gouvernance IA."
    },
    "profile": {
      "title": "Profil professionnel",
      "description": "Affichez votre expertise en gouvernance IA avec un profil public. Badge LinkedIn, visibilité dans le répertoire et reconnaissance de vos compétences."
    },
    "library": {
      "title": "Bibliothèque de ressources",
      "description": "Accédez à des modèles, guides et bonnes pratiques pour structurer votre gouvernance IA. Une base de connaissances partagée par la communauté."
    }
  },
  "cta": {
    "title": "Prêt à structurer votre gouvernance IA ?",
    "subtitle": "Commencez gratuitement avec le plan Observateur. Aucune carte de crédit requise.",
    "primary": "Créer mon compte",
    "secondary": "Comparer les plans"
  }
}
```

**Step 2: Create English translation file**

Create `src/i18n/locales/en/fonctionnalites.json`:

```json
{
  "seo": {
    "title": "Features",
    "description": "Discover the 20 integrated modules of the AI governance portal: inventory, risks, compliance, transparency, monitoring and more."
  },
  "hero": {
    "title": "Everything you need to govern your AI",
    "subtitle": "20 integrated modules to inventory, assess, comply and manage your artificial intelligence systems.",
    "cta": "Try for free",
    "ctaSecondary": "View pricing"
  },
  "categories": {
    "inventory": {
      "title": "Inventory & Lifecycle",
      "subtitle": "Catalog, track and manage your entire AI portfolio"
    },
    "risks": {
      "title": "Risk Management",
      "subtitle": "Assess, detect and remediate risks across your systems"
    },
    "compliance": {
      "title": "Compliance & Governance",
      "subtitle": "Align with frameworks and structure your governance"
    },
    "operations": {
      "title": "Transparency & Operations",
      "subtitle": "Monitor, document and ensure accountability continuously"
    },
    "intelligence": {
      "title": "Dashboard & Intelligence",
      "subtitle": "Steer your AI governance from a single command center"
    },
    "community": {
      "title": "Community & Collaboration",
      "subtitle": "Join a network of professionals committed to AI governance"
    }
  },
  "features": {
    "aiSystems": {
      "title": "AI Systems Inventory",
      "description": "Catalog all your AI systems in a few clicks. A step-by-step wizard captures type, scope, data used and owners. You instantly get a risk score and a complete view of your AI portfolio."
    },
    "lifecycle": {
      "title": "Lifecycle Management",
      "description": "Track every change — model update, vendor switch, suspension, decommissioning. A complete chronological log that proves your diligence and facilitates audits."
    },
    "vendors": {
      "title": "Vendor Management",
      "description": "Centralize your AI vendors: contracts, certifications, risk levels, SLAs. Spot critical dependencies and upcoming renewals at a glance."
    },
    "risks": {
      "title": "Risk Assessments",
      "description": "A structured 6-section questionnaire that automatically calculates each system's risk score. Results align with EU AI Act levels and generate the list of applicable requirements."
    },
    "incidents": {
      "title": "Incident Management",
      "description": "Report, triage and resolve AI incidents with a complete workflow. Severity tracking, assignment, investigation, post-mortem — everything documented for compliance."
    },
    "bias": {
      "title": "Bias Analysis",
      "description": "Identify and fix algorithmic biases: disparate impact, stereotyping, hallucinations. Each finding is tracked with its detection method, severity and remediation plan."
    },
    "compliance": {
      "title": "Multi-Framework Compliance",
      "description": "Assess your compliance simultaneously across 5 frameworks — Law 25, EU AI Act, NIST AI RMF, ISO 42001, GDPR. A global and per-framework score, with a prioritized remediation plan."
    },
    "policies": {
      "title": "Policies & Procedures",
      "description": "Create and version your AI governance policies: ethics charter, approval procedures, complaint handling. Built-in publication workflow (draft → review → published)."
    },
    "decisions": {
      "title": "Decision Registry",
      "description": "Document every governance decision — Go/No-Go, ethical arbitration, exception. Multi-level approval workflow with complete history and audit trail."
    },
    "documents": {
      "title": "Document Management",
      "description": "Centralize all your governance documents: policies, audit reports, impact assessments. AI-powered classification, versioning and instant search."
    },
    "agents": {
      "title": "AI Agent Registry",
      "description": "Catalog your AI agents with their autonomy level (A1 to A5), risk classification and usage policies. Trace every action with a detailed execution log."
    },
    "transparency": {
      "title": "Transparency & Contestations",
      "description": "Maintain an automated decisions registry compliant with Law 25 and GDPR. Handle contestations from affected individuals with a complete processing workflow."
    },
    "monitoring": {
      "title": "Monitoring & Performance",
      "description": "Monitor your AI systems continuously: performance, data drift, model drift, latency. Configure alert thresholds and receive real-time notifications."
    },
    "data": {
      "title": "Data Governance",
      "description": "Map your datasets: sources, categories, sensitivity, volumes. Document every data transfer with its legal basis and protection measures."
    },
    "veille": {
      "title": "Regulatory Watch",
      "description": "Stay informed of regulatory developments in Quebec, Canada and internationally. Automated news feed with jurisdiction filtering and impact analysis."
    },
    "dashboard": {
      "title": "Centralized Dashboard",
      "description": "Real-time overview: systems in production, compliance score, active incidents, high-risk systems. Multi-framework radar charts, incident timeline and pending actions."
    },
    "aiChat": {
      "title": "Built-in AI Assistant",
      "description": "Ask your governance questions to a specialized AI assistant. It knows your regulatory frameworks, systems and policies for contextualized answers."
    },
    "members": {
      "title": "Member Directory",
      "description": "Connect with Circle professionals. Browse profiles, expertise and organizations from the AI governance community."
    },
    "profile": {
      "title": "Professional Profile",
      "description": "Showcase your AI governance expertise with a public profile. LinkedIn badge, directory visibility and recognition of your skills."
    },
    "library": {
      "title": "Resource Library",
      "description": "Access templates, guides and best practices to structure your AI governance. A knowledge base shared by the community."
    }
  },
  "cta": {
    "title": "Ready to structure your AI governance?",
    "subtitle": "Start free with the Observer plan. No credit card required.",
    "primary": "Create my account",
    "secondary": "Compare plans"
  }
}
```

**Step 3: Register namespace in i18n config**

Open `src/i18n/index.ts`. Add `fonctionnalites` to the resource imports and namespace registration, following the same pattern as existing namespaces (e.g., `billing`, `diagnostic`).

**Step 4: Commit**

```bash
git add src/i18n/locales/fr/fonctionnalites.json src/i18n/locales/en/fonctionnalites.json src/i18n/index.ts
git commit -m "feat: ajout traductions FR/EN page fonctionnalités"
```

---

### Task 2: Create FonctionnalitesPage component

**Files:**
- Create: `src/pages/FonctionnalitesPage.tsx`

**Step 1: Create the page component**

Create `src/pages/FonctionnalitesPage.tsx` with this structure:

```tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowRight,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SEO, JsonLd } from "@/components/SEO";
import { Button } from "@/components/ui/button";

// --- Data types ---

interface Feature {
  key: string;
  icon: LucideIcon;
}

interface Category {
  key: string;
  features: Feature[];
}

// --- Static data ---

const categories: Category[] = [
  {
    key: "inventory",
    features: [
      { key: "aiSystems", icon: Bot },
      { key: "lifecycle", icon: RefreshCw },
      { key: "vendors", icon: Building2 },
    ],
  },
  {
    key: "risks",
    features: [
      { key: "risks", icon: AlertTriangle },
      { key: "incidents", icon: AlertCircle },
      { key: "bias", icon: Scale },
    ],
  },
  {
    key: "compliance",
    features: [
      { key: "compliance", icon: CheckCircle },
      { key: "policies", icon: Shield },
      { key: "decisions", icon: ClipboardCheck },
      { key: "documents", icon: FileText },
      { key: "agents", icon: Bot },
    ],
  },
  {
    key: "operations",
    features: [
      { key: "transparency", icon: Eye },
      { key: "monitoring", icon: Activity },
      { key: "data", icon: Database },
      { key: "veille", icon: Newspaper },
    ],
  },
  {
    key: "intelligence",
    features: [
      { key: "dashboard", icon: LayoutDashboard },
      { key: "aiChat", icon: MessageSquare },
    ],
  },
  {
    key: "community",
    features: [
      { key: "members", icon: Users },
      { key: "profile", icon: UserCircle },
      { key: "library", icon: BookOpen },
    ],
  },
];

// --- Animation variants ---

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

// --- Component ---

export function FonctionnalitesPage() {
  const { t } = useTranslation("fonctionnalites");
  const [activeSection, setActiveSection] = useState(categories[0].key);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Intersection observer for sticky nav highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    for (const cat of categories) {
      const el = sectionRefs.current[cat.key];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <SEO
        title={t("seo.title")}
        description={t("seo.description")}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Fonctionnalités — Cercle de Gouvernance en Intelligence Artificielle",
          description: t("seo.description"),
          url: "https://gouvernance.ai/fonctionnalites",
        }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1e1a30] via-[#252243] to-[#1e1a30] py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(171,84,243,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-neutral-300 sm:text-xl"
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-8 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110">
              <Link to="/inscription">{t("hero.cta")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10">
              <Link to="/tarifs">{t("hero.ctaSecondary")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Sticky category nav ── */}
      <nav className="sticky top-16 z-30 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => scrollTo(cat.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSection === cat.key
                  ? "bg-[#ab54f3]/10 text-[#ab54f3]"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {t(`categories.${cat.key}.title`)}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Feature sections ── */}
      {categories.map((cat, i) => (
        <section
          key={cat.key}
          id={cat.key}
          ref={(el) => { sectionRefs.current[cat.key] = el; }}
          className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/60"}
        >
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="mb-14 text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {t(`categories.${cat.key}.title`)}
              </h2>
              <p className="mt-3 text-lg text-neutral-500">
                {t(`categories.${cat.key}.subtitle`)}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {cat.features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.key}
                    variants={cardVariants}
                    className="group relative rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#ab54f3]/30 hover:shadow-md hover:shadow-purple-500/5"
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#ab54f3]/10 text-[#ab54f3] transition-colors group-hover:bg-[#ab54f3]/15">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {t(`features.${feat.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {t(`features.${feat.key}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      ))}

      {/* ── Bottom CTA ── */}
      <section className="bg-gradient-to-b from-[#1e1a30] to-[#252243] py-20 sm:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-lg text-neutral-300">
            {t("cta.subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-8 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110">
              <Link to="/inscription">
                {t("cta.primary")}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10">
              <Link to="/tarifs">{t("cta.secondary")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to FonctionnalitesPage

**Step 3: Commit**

```bash
git add src/pages/FonctionnalitesPage.tsx
git commit -m "feat: ajout composant FonctionnalitesPage"
```

---

### Task 3: Add route and navigation links

**Files:**
- Modify: `src/App.tsx` — add route
- Modify: `src/components/layout/Header.tsx` — add desktop + mobile nav link
- Modify: `src/components/layout/Footer.tsx` — add footer link

**Step 1: Add route in App.tsx**

After the existing import of `TarifsPage`, add:
```typescript
import { FonctionnalitesPage } from "@/pages/FonctionnalitesPage";
```

Inside the `<Route element={<Layout />}>` block, after the `/tarifs` route, add:
```typescript
<Route path="/fonctionnalites" element={<FonctionnalitesPage />} />
```

**Step 2: Add desktop nav link in Header.tsx**

In the desktop `<nav>` section (around line 180), add before the "Adhésion" NavLink:
```typescript
<NavLink to="/fonctionnalites">Fonctionnalités</NavLink>
```

**Step 3: Add mobile nav link in Header.tsx**

In the mobile `<nav>` section (around line 350), add before the "Adhésion" MobileNavLink:
```typescript
<MobileNavLink to="/fonctionnalites" active={isActive("/fonctionnalites")}>Fonctionnalités</MobileNavLink>
```

**Step 4: Add footer link in Footer.tsx**

In the `footerColumns` array, in the "Plateforme" column's `links` array, add before "Diagnostic IA":
```typescript
{ to: "/fonctionnalites", label: "Fonctionnalités" },
```

**Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/App.tsx src/components/layout/Header.tsx src/components/layout/Footer.tsx
git commit -m "feat: ajout route /fonctionnalites et liens navigation"
```

---

### Task 4: Verify full build and push

**Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 2: Visual check (optional)**

```bash
npm run dev
```

Open `http://localhost:5173/fonctionnalites` and verify:
- Hero renders with title, subtitle, 2 CTAs
- Sticky nav appears and highlights active section on scroll
- 6 sections render with correct cards (3+3+5+4+2+3 = 20 cards)
- Cards have icons, titles, descriptions
- Bottom CTA renders
- Mobile responsive (1 column)
- Header shows "Fonctionnalités" link
- Footer shows "Fonctionnalités" link

**Step 3: Commit and push**

```bash
git push
```
