# Phase 2 — Modules Métier Principaux

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. For each module, launch a UX design agent in parallel to refine the user experience.

**Goal:** Implémenter les 3 modules métier fondamentaux du portail : Registre des Systèmes IA (Module 01), Évaluations de Risques (Module 03), et Registre des Incidents (Module 06). Ces modules constituent le coeur fonctionnel MVP de la plateforme.

**Architecture:** Chaque module suit le pattern : migration SQL → types TypeScript → hooks TanStack Query → pages (liste + détail + formulaire). Les données sont multi-tenant (`organization_id` sur chaque table), protégées par RLS Supabase. Chaque formulaire utilise un wizard multi-étapes pour guider les utilisateurs non techniques. Un agent UX design travaille en parallèle sur chaque module pour garantir une expérience fluide.

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui, Supabase (PostgreSQL + Auth + Storage), TanStack Query, TanStack Table, react-hook-form + zod, i18next, date-fns, Recharts.

**Scope:** 3 modules (AI Systems, Risk Assessments, Incidents) avec : tables SQL + RLS, CRUD complet, wizard multi-étapes, listes filtrables, fiches détaillées, score de risque automatique, workflow d'incidents.

---

## Prérequis

### Dépendances à installer
```bash
npm install react-hook-form @hookform/resolvers zod recharts
npx shadcn@latest add form radio-group switch textarea badge tabs
```

### Branche
```bash
git checkout -b feature/phase2-modules-metier
```

---

## MODULE A : REGISTRE DES SYSTÈMES IA (Spec 01)

### Task 1: Migration — Table `ai_systems`

**Files:**
- Create: `supabase/migrations/20260217000001_create_ai_systems.sql`

**Step 1: Écrire la migration**

```sql
-- Table ai_systems (registre central)
CREATE TABLE public.ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Étape 1: Identification
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  internal_ref TEXT,
  system_type TEXT NOT NULL CHECK (system_type IN (
    'predictive', 'recommendation', 'classification', 'nlp', 'genai_llm',
    'computer_vision', 'biometric', 'robotic_process', 'decision_support',
    'autonomous_agent', 'other'
  )),
  genai_subtype TEXT CHECK (genai_subtype IN (
    'chatbot', 'content_generation', 'code_generation', 'summarization',
    'translation', 'image_generation', 'other_genai'
  )),

  -- Étape 2: Périmètre & impact
  departments TEXT[] DEFAULT '{}',
  purpose TEXT,
  affected_population TEXT[] DEFAULT '{}',
  estimated_volume TEXT,
  autonomy_level TEXT CHECK (autonomy_level IN (
    'full_auto', 'human_in_the_loop', 'human_on_the_loop', 'human_in_command'
  )),
  sensitive_domains TEXT[] DEFAULT '{}',

  -- Étape 3: Données & fournisseur
  data_types TEXT[] DEFAULT '{}',
  system_source TEXT CHECK (system_source IN (
    'internal', 'vendor_saas', 'vendor_onprem', 'open_source', 'hybrid'
  )),
  vendor_name TEXT,
  model_version TEXT,
  data_locations TEXT[] DEFAULT '{}',

  -- Étape 4: Propriétaires
  business_owner_id UUID REFERENCES auth.users(id),
  tech_owner_id UUID REFERENCES auth.users(id),
  privacy_owner_id UUID REFERENCES auth.users(id),
  risk_owner_id UUID REFERENCES auth.users(id),
  approver_id UUID REFERENCES auth.users(id),

  -- Étape 5: Statut & planification
  lifecycle_status TEXT NOT NULL DEFAULT 'idea' CHECK (lifecycle_status IN (
    'idea', 'pilot', 'development', 'testing', 'production', 'suspended', 'decommissioned'
  )),
  production_date DATE,
  next_review_date DATE,
  review_frequency TEXT DEFAULT 'semi_annual' CHECK (review_frequency IN (
    'monthly', 'quarterly', 'semi_annual', 'annual'
  )),
  notes TEXT,

  -- Score de risque (calculé)
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT DEFAULT 'minimal' CHECK (risk_level IN (
    'minimal', 'limited', 'high', 'critical', 'prohibited'
  )),

  -- Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'archived')),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  -- Unicité
  UNIQUE(organization_id, name)
);

-- Indexes
CREATE INDEX idx_ai_systems_org ON public.ai_systems(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_systems_risk ON public.ai_systems(risk_level, risk_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_systems_lifecycle ON public.ai_systems(lifecycle_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_systems_review ON public.ai_systems(next_review_date) WHERE deleted_at IS NULL AND lifecycle_status = 'production';

-- Trigger updated_at
CREATE TRIGGER on_ai_systems_updated
  BEFORE UPDATE ON public.ai_systems
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.ai_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_ai_systems_member" ON public.ai_systems
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND deleted_at IS NULL
  );

CREATE POLICY "insert_ai_systems_authorized" ON public.ai_systems
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );

CREATE POLICY "update_ai_systems_authorized" ON public.ai_systems
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );

-- Fonction de calcul du score de risque préliminaire
CREATE OR REPLACE FUNCTION public.calculate_risk_score(p_system_id UUID)
RETURNS INTEGER AS $$
DECLARE
  sys RECORD;
  score INTEGER := 0;
BEGIN
  SELECT * INTO sys FROM public.ai_systems WHERE id = p_system_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Autonomie (max 30)
  IF sys.autonomy_level = 'full_auto' THEN score := score + 30;
  ELSIF sys.autonomy_level = 'human_in_the_loop' THEN score := score + 15;
  ELSIF sys.autonomy_level = 'human_on_the_loop' THEN score := score + 10;
  ELSIF sys.autonomy_level = 'human_in_command' THEN score := score + 5;
  END IF;

  -- Données (max 25)
  IF 'sensitive_data' = ANY(sys.data_types) THEN score := score + 25;
  ELSIF 'personal_data' = ANY(sys.data_types) THEN score := score + 15;
  END IF;
  IF 'financial_data' = ANY(sys.data_types) THEN score := score + 10; END IF;

  -- Population (max 20)
  IF 'minors' = ANY(sys.affected_population) THEN score := score + 20;
  ELSIF 'vulnerable' = ANY(sys.affected_population) THEN score := score + 15;
  END IF;
  IF sys.estimated_volume IN ('10000-100000', '> 100000') THEN score := score + 10; END IF;

  -- Domaines sensibles (max 25)
  IF array_length(sys.sensitive_domains, 1) >= 2 THEN score := score + 25;
  ELSIF array_length(sys.sensitive_domains, 1) >= 1 THEN score := score + 15;
  END IF;

  -- Plafonner à 100
  score := LEAST(score, 100);

  -- Mettre à jour le système
  UPDATE public.ai_systems SET
    risk_score = score,
    risk_level = CASE
      WHEN score >= 76 THEN 'critical'
      WHEN score >= 51 THEN 'high'
      WHEN score >= 26 THEN 'limited'
      ELSE 'minimal'
    END
  WHERE id = p_system_id;

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 2: Appliquer la migration via le SQL Editor Supabase**

**Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add ai_systems table with risk score function"
```

---

### Task 2: Migration — Table `risk_assessments`

**Files:**
- Create: `supabase/migrations/20260217000002_create_risk_assessments.sql`

**Step 1: Écrire la migration**

```sql
CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID NOT NULL REFERENCES public.ai_systems(id) ON DELETE CASCADE,

  -- Résultats
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  risk_level TEXT DEFAULT 'minimal' CHECK (risk_level IN (
    'minimal', 'limited', 'high', 'critical', 'prohibited'
  )),

  -- Réponses du questionnaire (stockées en JSONB par section)
  answers JSONB DEFAULT '{}'::jsonb,

  -- Exigences générées automatiquement
  requirements JSONB DEFAULT '[]'::jsonb,

  -- Matrice
  probability TEXT CHECK (probability IN ('rare', 'unlikely', 'possible', 'likely', 'almost_certain')),
  impact TEXT CHECK (impact IN ('negligible', 'minor', 'moderate', 'major', 'catastrophic')),

  -- Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'archived')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_risk_assessments_org ON public.risk_assessments(organization_id);
CREATE INDEX idx_risk_assessments_system ON public.risk_assessments(ai_system_id);
CREATE INDEX idx_risk_assessments_level ON public.risk_assessments(risk_level);

CREATE TRIGGER on_risk_assessments_updated
  BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_risk_assessments" ON public.risk_assessments
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "insert_risk_assessments" ON public.risk_assessments
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );

CREATE POLICY "update_risk_assessments" ON public.risk_assessments
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'risk_manager')
  );
```

**Step 2: Appliquer + Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add risk_assessments table with RLS"
```

---

### Task 3: Migration — Table `incidents`

**Files:**
- Create: `supabase/migrations/20260217000003_create_incidents.sql`

**Step 1: Écrire la migration**

```sql
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Signalement initial
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'privacy')),
  incident_type TEXT NOT NULL,
  ai_system_id UUID REFERENCES public.ai_systems(id),
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  detection_mode TEXT CHECK (detection_mode IN (
    'automated_monitoring', 'user_report', 'internal_audit',
    'external_report', 'media', 'regulatory'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),

  -- Triage
  assigned_to UUID REFERENCES auth.users(id),
  impact_description TEXT,
  affected_count INTEGER,
  priority TEXT CHECK (priority IN ('p1_immediate', 'p2_24h', 'p3_72h', 'p4_week')),
  serious_harm_risk BOOLEAN DEFAULT false,

  -- Investigation
  root_cause TEXT,
  contributing_factors TEXT[] DEFAULT '{}',

  -- Résolution
  resolution_date TIMESTAMPTZ,
  corrective_actions JSONB DEFAULT '[]'::jsonb,

  -- Post-mortem
  post_mortem JSONB,
  lessons_learned TEXT,

  -- Workflow
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN (
    'reported', 'triaged', 'investigating', 'resolving', 'resolved', 'post_mortem', 'closed'
  )),

  -- Loi 25 (incidents de confidentialité)
  cai_notification_status TEXT CHECK (cai_notification_status IN ('not_required', 'to_notify', 'notified', 'acknowledged')),
  cai_notified_at TIMESTAMPTZ,
  persons_notified BOOLEAN DEFAULT false,

  -- Metadata
  reported_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_incidents_org ON public.incidents(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_status ON public.incidents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_severity ON public.incidents(severity) WHERE deleted_at IS NULL AND status NOT IN ('resolved', 'closed');
CREATE INDEX idx_incidents_system ON public.incidents(ai_system_id) WHERE deleted_at IS NULL;

CREATE TRIGGER on_incidents_updated
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les incidents de son org
CREATE POLICY "select_incidents" ON public.incidents
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND deleted_at IS NULL
  );

-- Tout le monde peut signaler un incident
CREATE POLICY "insert_incidents" ON public.incidents
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Seuls les rôles autorisés peuvent modifier
CREATE POLICY "update_incidents" ON public.incidents
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN (
      'super_admin', 'org_admin', 'compliance_officer',
      'risk_manager', 'data_scientist', 'ethics_officer'
    )
  );
```

**Step 2: Appliquer + Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add incidents table with severity workflow and Loi 25 fields"
```

---

### Task 4: Mettre à jour `database.ts` avec les nouveaux types

**Files:**
- Modify: `src/types/database.ts`

Ajouter les 3 nouvelles tables au type `Database`. Ajouter aussi les types utilitaires pour chaque module.

**Commit:**
```bash
git commit -m "feat: add ai_systems, risk_assessments, incidents to database types"
```

---

### Task 5: Installer dépendances + composants shadcn manquants

**Step 1:**
```bash
npm install react-hook-form @hookform/resolvers zod recharts
npx shadcn@latest add form radio-group switch textarea tabs badge
```

**Step 2: Commit**
```bash
git commit -m "chore: add react-hook-form, zod, recharts, shadcn form components"
```

---

### Task 6: Composant réutilisable — DataTable générique

**Files:**
- Create: `src/components/shared/DataTable.tsx`

Table générique basée sur TanStack Table avec : tri, filtres, pagination, sélection de lignes, actions en masse. Ce composant sera réutilisé par tous les modules.

**Commit:**
```bash
git commit -m "feat: add generic DataTable component with sorting, filtering, pagination"
```

---

### Task 7: Composant réutilisable — FormWizard multi-étapes

**Files:**
- Create: `src/components/shared/FormWizard.tsx`

Wizard générique multi-étapes avec : navigation, validation par étape (zod), sauvegarde en brouillon, indicateur de progression.

**Commit:**
```bash
git commit -m "feat: add generic FormWizard component with step validation"
```

---

### Task 8: Composant — RiskScoreGauge

**Files:**
- Create: `src/components/shared/RiskScoreGauge.tsx`

Jauge visuelle circulaire (0-100) avec code couleur selon le niveau de risque.

**Commit:**
```bash
git commit -m "feat: add RiskScoreGauge component"
```

---

### Task 9: Hook + types — useAiSystems

**Files:**
- Create: `src/hooks/useAiSystems.ts`

Hook TanStack Query pour le CRUD des systèmes IA : `useAiSystems()` (list), `useAiSystem(id)` (detail), `useCreateAiSystem()`, `useUpdateAiSystem()`, `useDeleteAiSystem()` (soft delete).

**Commit:**
```bash
git commit -m "feat: add useAiSystems hook with CRUD operations"
```

---

### Task 10: i18n — Traductions Module AI Systems

**Files:**
- Create: `src/i18n/locales/fr/aiSystems.json`
- Create: `src/i18n/locales/en/aiSystems.json`
- Modify: `src/i18n/index.ts` (ajouter namespace)

Toutes les clés pour : wizard labels, liste, filtres, détails, messages, validation.

**Commit:**
```bash
git commit -m "feat: add i18n translations for AI Systems module (fr/en)"
```

---

### Task 11: Page — AI Systems Liste

**Files:**
- Create: `src/portail/pages/ai-systems/AiSystemsPage.tsx`
- Create: `src/portail/pages/ai-systems/index.ts`

Page principale avec : PageHeader + bouton "Nouveau système", barre de filtres (type, département, risque, statut), DataTable avec colonnes spec, empty state.

**UX Design Agent:** Optimiser le layout pour scanner rapidement les systèmes critiques (couleurs, icônes de risque, sorting par défaut sur risque desc).

**Commit:**
```bash
git commit -m "feat: add AI Systems list page with filters and DataTable"
```

---

### Task 12: Page — AI Systems Wizard (Création/Édition)

**Files:**
- Create: `src/portail/pages/ai-systems/AiSystemWizard.tsx`
- Create: `src/portail/pages/ai-systems/wizard/Step1Identification.tsx`
- Create: `src/portail/pages/ai-systems/wizard/Step2Scope.tsx`
- Create: `src/portail/pages/ai-systems/wizard/Step3Data.tsx`
- Create: `src/portail/pages/ai-systems/wizard/Step4Owners.tsx`
- Create: `src/portail/pages/ai-systems/wizard/Step5Status.tsx`

Wizard 5 étapes avec validation zod par étape, sauvegarde en brouillon, calcul du score de risque à la soumission.

**UX Design Agent:** Rendre le wizard accessible aux non-techniques (tooltips, exemples en placeholder, info-bulles, langage simple). Progress indicator clair. Étape conditionnelle pour GenAI subtype.

**Commit:**
```bash
git commit -m "feat: add AI System wizard with 5-step creation flow"
```

---

### Task 13: Page — AI System Fiche détaillée

**Files:**
- Create: `src/portail/pages/ai-systems/AiSystemDetailPage.tsx`

Page avec onglets : Résumé (métadonnées + score jauge + propriétaires), Risques (lien Module 03), Incidents (lien Module 06), Historique (audit log). Les onglets non implémentés restent en placeholder.

**UX Design Agent:** Layout executif : les infos critiques (risque, statut, prochaine revue) doivent être visibles sans scroller. Cards visuelles pour les propriétaires.

**Commit:**
```bash
git commit -m "feat: add AI System detail page with tabs"
```

---

### Task 14: Routes — Brancher les pages AI Systems dans App.tsx

**Files:**
- Modify: `src/App.tsx`

Remplacer le PlaceholderPage pour `/ai-systems` par les vraies pages :
- `/ai-systems` → AiSystemsPage (liste)
- `/ai-systems/new` → AiSystemWizard (création)
- `/ai-systems/:id` → AiSystemDetailPage (détail)
- `/ai-systems/:id/edit` → AiSystemWizard (édition)

**Commit:**
```bash
git commit -m "feat: wire AI Systems routes in App.tsx"
```

---

## MODULE B : ÉVALUATION DES RISQUES (Spec 03)

### Task 15: Hook — useRiskAssessments

**Files:**
- Create: `src/hooks/useRiskAssessments.ts`

CRUD + hook pour calculer le score côté client (miroir de la fonction SQL).

**Commit:**
```bash
git commit -m "feat: add useRiskAssessments hook"
```

---

### Task 16: i18n — Traductions Module Risques

**Files:**
- Create: `src/i18n/locales/fr/risks.json`
- Create: `src/i18n/locales/en/risks.json`
- Modify: `src/i18n/index.ts`

Questions du questionnaire, labels des sections, niveaux de risque, exigences.

**Commit:**
```bash
git commit -m "feat: add i18n translations for Risk module (fr/en)"
```

---

### Task 17: Page — Risk Assessment Questionnaire

**Files:**
- Create: `src/portail/pages/risks/RiskAssessmentWizard.tsx`
- Create: `src/portail/pages/risks/sections/SectionA.tsx` (Impact)
- Create: `src/portail/pages/risks/sections/SectionB.tsx` (EU AI Act)
- Create: `src/portail/pages/risks/sections/SectionC.tsx` (Données)
- Create: `src/portail/pages/risks/sections/SectionD.tsx` (Biais)
- Create: `src/portail/pages/risks/sections/SectionE.tsx` (Transparence)
- Create: `src/portail/pages/risks/sections/SectionF.tsx` (Supervision)

Questionnaire guidé 6 sections. Calcul du score en temps réel à droite. Résultat avec niveau + couleur + exigences auto-générées.

**UX Design Agent:** Questions en langage simple avec exemples. Jauge de score qui évolue en temps réel pendant le questionnaire. Résultat avec exigences groupées par priorité et lien vers les actions.

**Commit:**
```bash
git commit -m "feat: add Risk Assessment questionnaire with 6 sections"
```

---

### Task 18: Page — Risks Liste + Score Result

**Files:**
- Create: `src/portail/pages/risks/RisksPage.tsx`
- Create: `src/portail/pages/risks/RiskScoreResult.tsx`
- Create: `src/portail/pages/risks/index.ts`

Liste des évaluations avec filtres (système, niveau, date). Page résultat avec score, niveau, exigences générées, bouton approbation.

**Commit:**
```bash
git commit -m "feat: add Risks list page and score result view"
```

---

### Task 19: Routes — Brancher les pages Risques

**Files:**
- Modify: `src/App.tsx`

- `/risks` → RisksPage
- `/risks/new?system=:id` → RiskAssessmentWizard
- `/risks/:id` → RiskScoreResult

**Commit:**
```bash
git commit -m "feat: wire Risk Assessment routes"
```

---

## MODULE C : REGISTRE DES INCIDENTS (Spec 06)

### Task 20: Hook — useIncidents

**Files:**
- Create: `src/hooks/useIncidents.ts`

CRUD + workflow transitions (reported→triaged→investigating→resolving→resolved→post_mortem→closed).

**Commit:**
```bash
git commit -m "feat: add useIncidents hook with workflow transitions"
```

---

### Task 21: i18n — Traductions Module Incidents

**Files:**
- Create: `src/i18n/locales/fr/incidents.json`
- Create: `src/i18n/locales/en/incidents.json`
- Modify: `src/i18n/index.ts`

**Commit:**
```bash
git commit -m "feat: add i18n translations for Incidents module (fr/en)"
```

---

### Task 22: Page — Incident Report Form (signalement rapide)

**Files:**
- Create: `src/portail/pages/incidents/IncidentReportForm.tsx`

Formulaire rapide (5 champs max) pour signaler un incident. Accessible à tous les membres.

**UX Design Agent:** Formulaire ultra-simple pour encourager le signalement. Sévérité avec couleurs explicites. Champ description avec placeholder contextuel selon la catégorie.

**Commit:**
```bash
git commit -m "feat: add quick incident report form"
```

---

### Task 23: Page — Incidents Liste

**Files:**
- Create: `src/portail/pages/incidents/IncidentsPage.tsx`
- Create: `src/portail/pages/incidents/index.ts`

Liste avec DataTable : titre, catégorie, sévérité (badge couleur), statut (workflow badge), assigné, système, date. Filtres par sévérité, statut, catégorie.

**Commit:**
```bash
git commit -m "feat: add Incidents list page with severity badges"
```

---

### Task 24: Page — Incident Détail + Workflow

**Files:**
- Create: `src/portail/pages/incidents/IncidentDetailPage.tsx`
- Create: `src/portail/pages/incidents/IncidentWorkflowStepper.tsx`

Fiche détaillée avec : workflow stepper en haut (visualisation du statut), sections triage/investigation/résolution/post-mortem. Boutons d'action pour avancer dans le workflow.

**UX Design Agent:** Workflow stepper horizontal avec couleurs (gris=futur, bleu=en cours, vert=passé). Les sections non encore atteintes sont grisées mais visibles. Timeline des événements à droite.

**Commit:**
```bash
git commit -m "feat: add Incident detail page with workflow stepper"
```

---

### Task 25: Routes — Brancher les pages Incidents

**Files:**
- Modify: `src/App.tsx`

- `/incidents` → IncidentsPage
- `/incidents/new` → IncidentReportForm
- `/incidents/:id` → IncidentDetailPage

**Commit:**
```bash
git commit -m "feat: wire Incident routes"
```

---

## TRANSVERSAL

### Task 26: Mettre à jour le Dashboard avec des vrais KPI

**Files:**
- Modify: `src/portail/pages/DashboardPage.tsx`

Remplacer les "—" par des vrais compteurs : nombre de systèmes IA, incidents ouverts, alertes. Ajouter des hooks qui comptent les données réelles.

**Commit:**
```bash
git commit -m "feat: update dashboard with live KPI from modules data"
```

---

### Task 27: Build et vérification finale

**Step 1:** `npm run build` — Fix toutes les erreurs TypeScript
**Step 2:** Test dev server
**Step 3:** Commit des fixes si nécessaire

---

## Résumé des Tasks

| # | Module | Description | Fichiers clés |
|---|--------|-------------|---------------|
| 1 | A | Migration `ai_systems` + score function | SQL migration |
| 2 | B | Migration `risk_assessments` | SQL migration |
| 3 | C | Migration `incidents` | SQL migration |
| 4 | — | Types TypeScript database.ts | `database.ts` |
| 5 | — | Deps + shadcn components | `package.json` |
| 6 | — | DataTable générique | `shared/DataTable.tsx` |
| 7 | — | FormWizard générique | `shared/FormWizard.tsx` |
| 8 | — | RiskScoreGauge | `shared/RiskScoreGauge.tsx` |
| 9 | A | Hook useAiSystems | `hooks/useAiSystems.ts` |
| 10 | A | i18n AI Systems | `locales/*/aiSystems.json` |
| 11 | A | Page liste AI Systems | `AiSystemsPage.tsx` |
| 12 | A | Wizard AI System (5 étapes) | `AiSystemWizard.tsx` + 5 steps |
| 13 | A | Fiche détaillée AI System | `AiSystemDetailPage.tsx` |
| 14 | A | Routes AI Systems | `App.tsx` |
| 15 | B | Hook useRiskAssessments | `hooks/useRiskAssessments.ts` |
| 16 | B | i18n Risques | `locales/*/risks.json` |
| 17 | B | Questionnaire risque (6 sections) | `RiskAssessmentWizard.tsx` + 6 sections |
| 18 | B | Page liste + résultat | `RisksPage.tsx` + `RiskScoreResult.tsx` |
| 19 | B | Routes Risques | `App.tsx` |
| 20 | C | Hook useIncidents | `hooks/useIncidents.ts` |
| 21 | C | i18n Incidents | `locales/*/incidents.json` |
| 22 | C | Formulaire signalement rapide | `IncidentReportForm.tsx` |
| 23 | C | Page liste Incidents | `IncidentsPage.tsx` |
| 24 | C | Fiche détaillée + workflow | `IncidentDetailPage.tsx` |
| 25 | C | Routes Incidents | `App.tsx` |
| 26 | — | Dashboard KPI live | `DashboardPage.tsx` |
| 27 | — | Build + vérification | — |
