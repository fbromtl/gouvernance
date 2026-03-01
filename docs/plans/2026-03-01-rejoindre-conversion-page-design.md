# Rejoindre Page — Conversion Landing Page Design

## Goal

Transform the existing basic "Rejoindre le Cercle" page into a high-converting landing page that convinces visitors to create a free account. Uses a problem/solution approach with concrete tool benefits.

## Architecture

Single-file edit to `src/pages/RejoindrePage.tsx`. Complete rewrite of the page content using existing design system patterns from HomePage (bento grid, dark sections, violet accent `#ab54f3`, rounded-[40px] cards).

## Key Decisions

- **CTA target**: `/inscription` (free account creation)
- **Tone**: Problem/solution — start with pain points, then present concrete tools
- **Layout**: Compact two-column hero + benefit sections below
- **Tool access**: Some tools free (Observateur plan), others require paid plans (Membre/Expert)
- **No new components**: Reuse Tailwind patterns from HomePage

## Page Structure

### Section 1: Hero — Two-column (above the fold)

**Left column (60%)**:
- Violet badge: "Inscription gratuite — aucune carte de crédit"
- H1: "Votre gouvernance IA repose encore sur des tableurs et des documents Word ?"
- Subtitle: "Le Cercle vous donne les outils pour inventorier, évaluer et sécuriser vos projets IA — en quelques minutes, pas en quelques mois."
- 4 checkmarks:
  - Inventaire IA en 10 minutes
  - Score de risque automatique
  - Documentation audit en 1 clic
  - 100% gratuit pour commencer
- Primary CTA: violet gradient button "Créer mon compte gratuitement" → /inscription
- Secondary CTA: text link "Comparer les plans →" → /tarifs
- Trust: "150+ professionnels nous font déjà confiance"

**Right column (40%)**:
- Photo (businesspeople-meeting.jpg or similar) in rounded frame with shadow

**Style**: White bg with purple radial gradients, pt-32 pb-20

### Section 2: Free Tools — Bento Grid (6 cards)

**Header**: Violet line + "OUTILS INCLUS GRATUITEMENT" tag + separator
**Title**: "Tout ce qu'il faut pour démarrer votre gouvernance IA"

**3x2 grid** with rounded-[40px] cards, bg-neutral-50:

1. **Inventaire IA en 10 min** — Wizard guidé, score de risque automatique
2. **Générateur de politiques IA** — Templates prêts, versioning, plus de page blanche
3. **Évaluation de risque en 10 min** — Questionnaire en langage simple, checklist auto-générée
4. **Documentation en 1 clic** — Evidence Pack complet pour les audits, plus rien à rédiger
5. **Conformité multi-référentiels** — Scores temps réel, alertes veille réglementaire
6. **Tableaux de bord board-ready** — Rapport pour votre CA en 60 secondes, mode présentation

### Section 3: Community & Diagnostic — Dark Section

**Style**: bg-neutral-950 (dark)

**Two columns**:

Left — "Un cercle d'échange entre professionnels de l'IA":
- Exchange structuré, répertoire de membres, networking
- Stats: 150+ experts, 15 disciplines

Right — "Diagnostic d'évolution de votre gouvernance IA":
- Évaluez votre maturité, recommandations personnalisées
- CTA: "Lancer le diagnostic" → /diagnostic

### Section 4: Advanced Tools — Paid Plans Teaser

**Header**: Violet line + "POUR ALLER PLUS LOIN" tag
**Title**: "Des outils avancés pour les organisations ambitieuses"

**2x2 grid** with plan badges (Membre/Expert):

1. **Gestion des fournisseurs IA** (Membre) — Solutions 100% automatique, questionnaire sécurité
2. **Veille documentaire IA** (Membre) — Adapte vos politiques automatiquement, assistant IA réglementaire
3. **Monitoring & gestion des incidents** (Expert) — Suivi temps réel, alertes automatiques
4. **Gestion biais & équité** (Membre) — Évaluation systématique, rapports de conformité

CTA: "Comparer les plans →" → /tarifs

### Section 5: Final CTA Banner

**Style**: Dark gradient (like TarifsPage bottom CTA)

- Title: "Prêt à sécuriser vos projets IA ?"
- Subtitle: "Inscription gratuite en 30 secondes. Aucune carte de crédit."
- Button: "Créer mon compte gratuitement" → /inscription

## Icons (Lucide)

- ClipboardList (inventaire), FileText (politiques), AlertTriangle (risque), FileCheck (documentation), BarChart3 (conformité), LayoutDashboard (tableaux de bord)
- Users (communauté), Target (diagnostic)
- Truck (fournisseurs), BookOpen (veille), Activity (monitoring), Scale (biais)
- Shield, Check, ArrowRight (existing)
