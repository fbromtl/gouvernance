# Diagnostic de Gouvernance IA — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 10-question governance maturity diagnostic quiz that serves as a conversion funnel: homepage CTA -> public Typeform-style quiz -> teaser results with blurred details -> social login -> CGU -> dashboard with full results.

**Architecture:** Public page `/diagnostic` with immersive one-question-at-a-time UI. Answers stored in localStorage. After login, a new `governance_diagnostics` table stores results. Dashboard shows a dedicated widget when diagnostic results are pending. The ProtectedRoute and AuthCallback are modified to detect pending diagnostic data and redirect accordingly.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion (for transitions), localStorage, Supabase (new table + RLS), react-i18next

---

## Overview of Files

### Files to CREATE (5)
| # | File | Purpose |
|---|------|---------|
| 1 | `src/pages/DiagnosticPage.tsx` | Public quiz page — Typeform-style, one question at a time |
| 2 | `src/pages/DiagnosticResultsPage.tsx` | Public teaser results — score visible, details blurred, CTA to login |
| 3 | `src/i18n/locales/fr/diagnostic.json` | French translations for all 10 questions + results |
| 4 | `src/i18n/locales/en/diagnostic.json` | English translations |
| 5 | `src/portail/components/dashboard/DiagnosticResultWidget.tsx` | Dashboard widget showing full diagnostic results |

### Files to MODIFY (6)
| # | File | Change |
|---|------|--------|
| 6 | `src/pages/HomePage.tsx` | Add diagnostic CTA section (between Section 5 and Section 6) |
| 7 | `src/App.tsx` | Add routes: `/diagnostic` (public) and `/diagnostic/resultats` (public) |
| 8 | `src/i18n/index.ts` | Register `diagnostic` namespace |
| 9 | `src/pages/auth/AuthCallbackPage.tsx` | After login, detect localStorage diagnostic data and redirect to dashboard |
| 10 | `src/portail/pages/DashboardPage.tsx` | Import and render DiagnosticResultWidget when pending results exist |
| 11 | `src/lib/ProtectedRoute.tsx` | No change needed — existing flow handles CGU + onboarding naturally |

### Database Migration (1)
| # | Migration | Purpose |
|---|-----------|---------|
| 12 | `create_governance_diagnostics` | New table `governance_diagnostics` with RLS policies |

---

## Diagnostic Scoring System

### 10 Questions — 4 Levels Each (0-3 points)

| # | Domain | Key |
|---|--------|-----|
| 1 | Inventaire IA | `inventory` |
| 2 | Evaluation des risques | `risk_assessment` |
| 3 | Protection des donnees | `data_protection` |
| 4 | Biais & Equite | `bias_fairness` |
| 5 | Transparence | `transparency` |
| 6 | Supervision humaine | `human_oversight` |
| 7 | Conformite reglementaire | `regulatory_compliance` |
| 8 | Gestion des incidents | `incident_management` |
| 9 | Gouvernance organisationnelle | `organizational_governance` |
| 10 | Formation & sensibilisation | `training_awareness` |

### Answer Options (same for all questions)
- `not_at_all` = 0 points
- `considering` = 1 point
- `partially` = 2 points
- `fully_implemented` = 3 points

### Maturity Levels (total /30)
- **0-6**: Debutant (red)
- **7-12**: Emergent (orange)
- **13-18**: Intermediaire (yellow)
- **19-24**: Avance (green)
- **25-30**: Exemplaire (purple/brand)

### localStorage Key
```
gouvernance:diagnostic:pending
```
Value: `{ answers: Record<string, number>, score: number, level: string, completedAt: string }`

---

## Task 1: Database Migration

**Create Supabase table for storing diagnostic results.**

Use the Supabase MCP `apply_migration` tool.

**Migration name:** `create_governance_diagnostics`

```sql
-- Governance diagnostic results table
CREATE TABLE public.governance_diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 30),
  maturity_level TEXT NOT NULL CHECK (maturity_level IN ('debutant', 'emergent', 'intermediaire', 'avance', 'exemplaire')),
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_governance_diagnostics_user ON public.governance_diagnostics(user_id);
CREATE INDEX idx_governance_diagnostics_org ON public.governance_diagnostics(organization_id);

-- RLS
ALTER TABLE public.governance_diagnostics ENABLE ROW LEVEL SECURITY;

-- Users can read their own diagnostics
CREATE POLICY "Users can read own diagnostics"
  ON public.governance_diagnostics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own diagnostics
CREATE POLICY "Users can insert own diagnostics"
  ON public.governance_diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Org members can read org diagnostics
CREATE POLICY "Org members can read org diagnostics"
  ON public.governance_diagnostics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );
```

**Verify:** Run `list_tables` to confirm the table exists.

---

## Task 2: i18n Translation Files

### Step 1: Create `src/i18n/locales/fr/diagnostic.json`

```json
{
  "pageTitle": "Diagnostic de Gouvernance IA",
  "pageDescription": "Evaluez votre niveau de maturite en gouvernance de l'intelligence artificielle en 10 questions.",
  "startButton": "Commencer le diagnostic",
  "nextButton": "Suivante",
  "previousButton": "Precedente",
  "seeResults": "Voir mes resultats",
  "questionOf": "Question {{current}} sur {{total}}",
  "questions": {
    "inventory": {
      "question": "Avez-vous un registre de vos systemes d'intelligence artificielle ?",
      "description": "Un inventaire complet des systemes IA utilises dans votre organisation."
    },
    "risk_assessment": {
      "question": "Evaluez-vous les risques de vos systemes IA ?",
      "description": "Analyse systematique des impacts potentiels de chaque systeme IA."
    },
    "data_protection": {
      "question": "Vos systemes IA traitent-ils des donnees personnelles de facon encadree ?",
      "description": "Conformite au RGPD, Loi 25, et bonnes pratiques de protection des donnees."
    },
    "bias_fairness": {
      "question": "Avez-vous des processus pour detecter les biais algorithmiques ?",
      "description": "Tests d'equite, audits reguliers et mecanismes de correction."
    },
    "transparency": {
      "question": "Informez-vous les personnes qu'elles interagissent avec une IA ?",
      "description": "Obligation de transparence et droit a l'explication des decisions automatisees."
    },
    "human_oversight": {
      "question": "Un humain peut-il intervenir sur les decisions de vos IA ?",
      "description": "Mecanismes de supervision et possibilite de contester les decisions."
    },
    "regulatory_compliance": {
      "question": "Suivez-vous les exigences de la Loi 25 ou du EU AI Act ?",
      "description": "Veille reglementaire et conformite aux cadres juridiques applicables."
    },
    "incident_management": {
      "question": "Avez-vous un processus de signalement des incidents IA ?",
      "description": "Procedures de detection, signalement et resolution des incidents."
    },
    "organizational_governance": {
      "question": "Avez-vous des roles ou comites dedies a la gouvernance IA ?",
      "description": "Structure organisationnelle avec responsabilites claires pour l'IA."
    },
    "training_awareness": {
      "question": "Vos equipes sont-elles formees aux enjeux de l'IA responsable ?",
      "description": "Programmes de formation et sensibilisation a l'ethique IA."
    }
  },
  "answers": {
    "not_at_all": "Pas du tout",
    "considering": "En reflexion",
    "partially": "Partiellement en place",
    "fully_implemented": "Oui, formalise"
  },
  "levels": {
    "debutant": "Debutant",
    "emergent": "Emergent",
    "intermediaire": "Intermediaire",
    "avance": "Avance",
    "exemplaire": "Exemplaire"
  },
  "results": {
    "title": "Votre score de maturite",
    "subtitle": "Gouvernance IA",
    "scoreLabel": "{{score}} / 30",
    "detailsLocked": "Creez votre compte gratuit pour debloquer vos recommandations personnalisees par domaine.",
    "ctaButton": "Debloquer mes resultats complets",
    "ctaSubtext": "Gratuit — Connexion avec Google en 10 secondes",
    "domains": {
      "inventory": "Inventaire IA",
      "risk_assessment": "Evaluation des risques",
      "data_protection": "Protection des donnees",
      "bias_fairness": "Biais & Equite",
      "transparency": "Transparence",
      "human_oversight": "Supervision humaine",
      "regulatory_compliance": "Conformite reglementaire",
      "incident_management": "Gestion des incidents",
      "organizational_governance": "Gouvernance organisationnelle",
      "training_awareness": "Formation & sensibilisation"
    }
  },
  "widget": {
    "title": "Votre diagnostic de gouvernance IA",
    "retake": "Refaire le diagnostic",
    "viewDetails": "Voir le detail",
    "completedOn": "Complete le {{date}}"
  },
  "homepage": {
    "badge": "Diagnostic gratuit",
    "title": "Evaluez votre maturite en gouvernance IA",
    "description": "10 questions pour obtenir votre score de maturite et des recommandations personnalisees. Gratuit, sans engagement.",
    "cta": "Lancer le diagnostic",
    "duration": "3 minutes",
    "questionsCount": "10 questions",
    "free": "100% gratuit"
  }
}
```

NOTE: The accents in French translations must be added properly (e, e with accents, etc.) when implementing — the plan uses ASCII for readability. Use proper UTF-8 French accents: e -> e/e/e, a -> a, u -> u, i -> i, o -> o, c -> c as appropriate.

### Step 2: Create `src/i18n/locales/en/diagnostic.json`

Mirror structure with English translations.

### Step 3: Modify `src/i18n/index.ts`

Add imports for `frDiagnostic` and `enDiagnostic`, register in both `fr` and `en` resource objects, and add `'diagnostic'` to the `ns` array.

**Commit:** `feat: add diagnostic i18n translations (fr + en)`

---

## Task 3: Public Diagnostic Quiz Page

**Create `src/pages/DiagnosticPage.tsx`**

This is the Typeform-style quiz with one question per screen.

### Key Design Decisions:
- Full-viewport height, dark gradient background (matches hero aesthetic)
- AnimatePresence from framer-motion for slide transitions between questions
- Progress bar at top (thin, brand-purple)
- Question counter: "3 / 10"
- 4 answer buttons styled as large clickable cards (not radio buttons)
- Auto-advance after selecting an answer (300ms delay for visual feedback)
- Back button (chevron left) in top-left
- Close button (X) in top-right to go back to homepage
- Answers stored in React state, persisted to localStorage on each answer
- On last question submit -> navigate to `/diagnostic/resultats`

### Component Structure:
```
DiagnosticPage
  |- ProgressBar (thin bar at top)
  |- QuestionCounter ("3 / 10")
  |- AnimatePresence
  |    |- QuestionCard (question text + description)
  |    |- AnswerButtons (4 large cards, one per answer level)
  |- NavigationControls (back / close)
```

### localStorage interaction:
```typescript
const STORAGE_KEY = "gouvernance:diagnostic:pending";

// Save after each answer
function saveProgress(answers: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    answers,
    timestamp: Date.now(),
  }));
}

// On completion, calculate and save full result
function saveResult(answers: Record<string, number>) {
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const level = getMaturityLevel(score);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    answers,
    score,
    level,
    completedAt: new Date().toISOString(),
  }));
}
```

**Commit:** `feat: add DiagnosticPage — Typeform-style public quiz`

---

## Task 4: Public Teaser Results Page

**Create `src/pages/DiagnosticResultsPage.tsx`**

### Layout:
- Same dark gradient background
- Animated score reveal (count-up animation from 0 to score)
- Large circular gauge (reuse RiskScoreGauge pattern but adapted for 0-30 scale, 5 maturity levels)
- Maturity level badge with color
- Below the gauge: 10-domain breakdown grid
  - Each domain shows: icon + name + individual score (0-3) as small bar
  - **BUT** the bottom 7 domains are covered by a frosted-glass blur overlay
  - Only top 3 domains visible (to tease value)
- Blur overlay contains:
  - Lock icon
  - "Creez votre compte gratuit pour debloquer vos recommandations personnalisees"
  - Large CTA button: "Debloquer mes resultats complets" -> navigates to `/connexion?redirect=dashboard&from=diagnostic`
  - Subtext: "Gratuit — Connexion avec Google en 10 secondes"

### Redirect Flow:
The CTA button links to `/connexion?redirect=dashboard&from=diagnostic`. The existing auth flow:
1. User clicks Google login on `/connexion`
2. OAuth callback -> `/auth/callback`
3. AuthCallbackPage redirects to `/portail` -> `/dashboard`
4. ProtectedRoute checks CGU -> `/conditions` if needed
5. Dashboard detects localStorage diagnostic data -> saves to DB -> shows widget

No modification needed to AuthCallbackPage or ProtectedRoute — the existing flow handles it naturally. The Dashboard is the only component that needs to detect and consume the localStorage data.

**Commit:** `feat: add DiagnosticResultsPage — teaser with blurred details`

---

## Task 5: Homepage Diagnostic CTA Section

**Modify `src/pages/HomePage.tsx`**

Insert a new section between the existing "Services et Outils" (Section 5) and "Portail IAG" (Section 6).

### Design:
```
bg-background with subtle brand-purple radial gradient overlay

[Badge: "Diagnostic gratuit"]

"Evaluez votre maturite en gouvernance IA"

"10 questions pour obtenir votre score de maturite
et des recommandations personnalisees."

[Three mini-cards in a row:]
  - Clock icon: "3 minutes"
  - ListChecks icon: "10 questions"
  - Sparkles icon: "100% gratuit"

[Large CTA Button: "Lancer le diagnostic" -> /diagnostic]
  ArrowRight icon

[Decorative: animated gauge preview / illustration]
```

**Commit:** `feat: add diagnostic CTA section to homepage`

---

## Task 6: Route Registration

**Modify `src/App.tsx`**

```typescript
// Add imports
import { DiagnosticPage } from "@/pages/DiagnosticPage";
import { DiagnosticResultsPage } from "@/pages/DiagnosticResultsPage";

// Add routes inside the public Layout routes (between line 108 and 109):
<Route path="/diagnostic" element={<DiagnosticPage />} />
<Route path="/diagnostic/resultats" element={<DiagnosticResultsPage />} />
```

Note: DiagnosticPage uses its own full-screen layout (no header/footer needed), but DiagnosticResultsPage can use the public Layout. Actually, both should be outside the Layout for a fully immersive experience. Add them as standalone routes after the Layout block:

```typescript
{/* Diagnostic public (standalone, no header/footer) */}
<Route path="/diagnostic" element={<DiagnosticPage />} />
<Route path="/diagnostic/resultats" element={<DiagnosticResultsPage />} />
```

**Commit:** `feat: register diagnostic routes in App.tsx`

---

## Task 7: Dashboard Diagnostic Widget

**Create `src/portail/components/dashboard/DiagnosticResultWidget.tsx`**

### Behavior:
1. On mount, check localStorage for `gouvernance:diagnostic:pending`
2. If found AND has `completedAt` (fully completed):
   a. Save to Supabase `governance_diagnostics` table (mutation)
   b. Clear localStorage
   c. Show full results widget with confetti/celebration animation
3. If already saved in DB (query on mount), show persistent widget

### Widget Design:
- Card with gradient top border (brand-purple)
- Title: "Votre diagnostic de gouvernance IA"
- Score gauge (small version, inline)
- Maturity level badge
- 10-domain breakdown as horizontal progress bars (0-3 each)
  - Color: 0=red, 1=orange, 2=yellow, 3=green
- "Refaire le diagnostic" link
- "Complete le [date]"

### Data Hook:
```typescript
// src/hooks/useDiagnostic.ts
export function useDiagnostic() {
  // Query existing diagnostic from DB
  // Mutation to save new diagnostic
  // Logic to consume localStorage and save
}
```

Actually, create a separate hook file:

**Create `src/hooks/useDiagnostic.ts`**

This hook:
- `useLatestDiagnostic()` — queries the most recent diagnostic for the current user
- `useSaveDiagnostic()` — mutation to save diagnostic from localStorage to DB
- `consumePendingDiagnostic()` — helper that checks localStorage, saves to DB, clears localStorage

**Commit:** `feat: add DiagnosticResultWidget + useDiagnostic hook`

---

## Task 8: Dashboard Integration

**Modify `src/portail/pages/DashboardPage.tsx`**

Add the DiagnosticResultWidget at the top of the dashboard (below the welcome section, above the KPI row) when a diagnostic exists.

```typescript
import DiagnosticResultWidget from "@/portail/components/dashboard/DiagnosticResultWidget";

// In the render, after the welcome section:
<DiagnosticResultWidget />
```

The widget handles its own visibility (shows nothing if no diagnostic exists).

**Commit:** `feat: integrate diagnostic widget into dashboard`

---

## Task 9: Install framer-motion

```bash
npm install framer-motion
```

This should be done BEFORE Task 3 since DiagnosticPage uses AnimatePresence.

**Commit:** `chore: install framer-motion for diagnostic animations`

---

## Task 10: Build & Deploy

```bash
npm run build
```

Expected: 0 TypeScript errors, successful build.

Then deploy:
```bash
npx netlify-cli deploy --dir=dist --prod --site c2d1529c-5f1e-4bba-a650-7e95fb6290b5
```

**Verify in Chrome:**
1. Homepage: new diagnostic CTA section visible
2. `/diagnostic`: quiz starts, can answer all 10 questions
3. `/diagnostic/resultats`: score shown, details blurred, CTA button present
4. Click CTA -> login with Google -> CGU (if needed) -> dashboard
5. Dashboard shows full diagnostic results widget
6. Refresh dashboard -> widget persists (data in DB)

---

## Implementation Order

1. **Task 9** — Install framer-motion (dependency)
2. **Task 1** — Database migration
3. **Task 2** — i18n translations
4. **Task 6** — Route registration
5. **Task 3** — DiagnosticPage (quiz)
6. **Task 4** — DiagnosticResultsPage (teaser)
7. **Task 5** — Homepage CTA section
8. **Task 7** — Dashboard widget + hook
9. **Task 8** — Dashboard integration
10. **Task 10** — Build & deploy & verify

---

## Key Technical Notes

### localStorage Flow
```
Homepage -> /diagnostic -> answers saved progressively -> completion -> /diagnostic/resultats
    |                                                                        |
    |  (user sees score + blurred details)                                   |
    |                                                                        v
    |                                                              CTA: /connexion
    |                                                                        |
    |                                                              Google OAuth
    |                                                                        |
    |                                                              /auth/callback
    |                                                                        |
    |                                                              /dashboard
    |                                                                        |
    |                                                     Dashboard detects localStorage
    |                                                     Saves to governance_diagnostics
    |                                                     Clears localStorage
    |                                                     Shows full results widget
```

### Score Calculation
```typescript
function getMaturityLevel(score: number): string {
  if (score <= 6) return "debutant";
  if (score <= 12) return "emergent";
  if (score <= 18) return "intermediaire";
  if (score <= 24) return "avance";
  return "exemplaire";
}

function getLevelColor(level: string): string {
  switch (level) {
    case "debutant": return "text-red-500";
    case "emergent": return "text-orange-500";
    case "intermediaire": return "text-yellow-500";
    case "avance": return "text-green-500";
    case "exemplaire": return "text-brand-purple";
    default: return "text-muted-foreground";
  }
}
```

### Domain Icons (Lucide)
```typescript
const DOMAIN_ICONS = {
  inventory: ClipboardList,
  risk_assessment: ShieldAlert,
  data_protection: Lock,
  bias_fairness: Scale,
  transparency: Eye,
  human_oversight: UserCheck,
  regulatory_compliance: Gavel,
  incident_management: AlertTriangle,
  organizational_governance: Building2,
  training_awareness: GraduationCap,
};
```
