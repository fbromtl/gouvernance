# Feature Gate Preview Mode — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the blocking "Réservé aux Membres" card with a read-only preview showing demo data under progressive blur + sticky upgrade banner across all 11 gated portail pages.

**Architecture:** Redesign `FeatureGate` to render children with a blur overlay + sticky banner instead of blocking. Create a `useFeaturePreview` hook and static demo data files. Each page swaps real data for demo data when `isPreview` is true.

**Tech Stack:** React, TypeScript, Tailwind CSS, i18next, lucide-react

---

### Task 1: Update i18n keys for preview banner

**Files:**
- Modify: `src/i18n/locales/fr/billing.json` (lines 92-96)

**Step 1: Add new gate keys**

In `billing.json`, replace the `gate` object:

```json
"gate": {
  "title": "Réservé aux Membres",
  "description": "Cette fonctionnalité est disponible avec le niveau {{plan}} ou supérieur.",
  "upgrade": "Devenir Membre",
  "preview": "Aperçu — Cette fonctionnalité est réservée aux Membres",
  "unlock": "Débloquer cette fonctionnalité"
}
```

**Step 2: Commit**

```bash
git add src/i18n/locales/fr/billing.json
git commit -m "feat(i18n): add preview banner translation keys for feature gate"
```

---

### Task 2: Create `useFeaturePreview` hook

**Files:**
- Create: `src/hooks/useFeaturePreview.ts`

**Step 1: Create the hook**

```typescript
import { usePlanFeatures } from './usePlanFeatures';

/**
 * Returns whether a feature should render in preview (read-only) mode.
 * Preview mode = user lacks the feature but we still show demo content.
 */
export function useFeaturePreview(feature: string) {
  const { hasFeature, plan } = usePlanFeatures();
  const isPreview = !hasFeature(feature);
  const requiredPlan = plan === 'observer' ? 'Membre' : 'Membre Expert';
  return { isPreview, requiredPlan, plan };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useFeaturePreview.ts
git commit -m "feat: add useFeaturePreview hook"
```

---

### Task 3: Redesign `FeatureGate` component

**Files:**
- Modify: `src/components/shared/FeatureGate.tsx`

**Step 1: Rewrite FeatureGate**

Replace the entire file with:

```tsx
import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  /** When true, render nothing if feature is missing (for hiding UI fragments) */
  silent?: boolean;
}

export function FeatureGate({ feature, children, silent = false }: FeatureGateProps) {
  const { hasFeature, plan } = usePlanFeatures();
  const navigate = useNavigate();
  const { t } = useTranslation('billing');

  // Feature is available → render children normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Silent mode → hide entirely
  if (silent) return null;

  const requiredPlan = plan === 'observer' ? 'Membre' : 'Membre Expert';

  // Preview mode → show children with blur overlay + sticky banner
  return (
    <div className="relative">
      {/* Sticky upgrade banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-brand-purple px-4 py-2.5 text-white text-sm shadow-md">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            {t('gate.preview', { plan: requiredPlan })}
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 bg-white text-brand-purple hover:bg-white/90 font-medium"
          onClick={() => navigate('/billing')}
        >
          <ArrowUpCircle className="h-4 w-4 mr-1.5" />
          {t('gate.unlock')}
        </Button>
      </div>

      {/* Content wrapper with blur overlay */}
      <div className="relative overflow-hidden select-none pointer-events-none">
        {/* Actual page content (rendered but not interactive) */}
        <div aria-hidden="true">
          {children}
        </div>

        {/* Progressive blur overlay: transparent at top, blurred at bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.3) 50%, black 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.3) 50%, black 75%)',
          }}
        />
      </div>
    </div>
  );
}
```

Key design decisions:
- `pointer-events-none` + `select-none` on the content wrapper prevents interaction
- `aria-hidden="true"` on content so screen readers skip demo data
- The blur overlay uses `maskImage` gradient: transparent at top 35% (clear), transitions from 50%, fully blurred at 75%+
- The banner button keeps `pointer-events: auto` because it's outside the blur wrapper

**Step 2: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/shared/FeatureGate.tsx
git commit -m "feat: redesign FeatureGate with blur preview + sticky upgrade banner"
```

---

### Task 4: Create demo data file

**Files:**
- Create: `src/portail/demo/data.ts`
- Create: `src/portail/demo/index.ts`

**Step 1: Create the demo directory and data file**

Create `src/portail/demo/data.ts` with static demo datasets for all 11 pages. Each dataset matches the TypeScript types expected by the page. Use realistic French-language content about AI governance.

```typescript
// src/portail/demo/data.ts
// Static demo data for feature gate preview mode.
// Displayed to Observer users to showcase premium features.

/* ------------------------------------------------------------------ */
/*  RISK ASSESSMENTS                                                    */
/* ------------------------------------------------------------------ */
export const DEMO_RISK_ASSESSMENTS = [
  {
    id: 'demo-risk-1',
    ai_system_id: 'demo-sys-1',
    total_score: 78,
    risk_level: 'high' as const,
    status: 'approved' as const,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-20T14:00:00Z',
    organization_id: 'demo-org',
    ai_systems: { name: 'Système de scoring RH' },
  },
  {
    id: 'demo-risk-2',
    ai_system_id: 'demo-sys-2',
    total_score: 42,
    risk_level: 'limited' as const,
    status: 'in_review' as const,
    created_at: '2026-01-22T09:00:00Z',
    updated_at: '2026-01-25T11:00:00Z',
    organization_id: 'demo-org',
    ai_systems: { name: 'Chatbot service client' },
  },
  {
    id: 'demo-risk-3',
    ai_system_id: 'demo-sys-3',
    total_score: 91,
    risk_level: 'critical' as const,
    status: 'submitted' as const,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-03T16:00:00Z',
    organization_id: 'demo-org',
    ai_systems: { name: 'Détection de fraude financière' },
  },
  {
    id: 'demo-risk-4',
    ai_system_id: 'demo-sys-4',
    total_score: 15,
    risk_level: 'minimal' as const,
    status: 'approved' as const,
    created_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-02-12T09:00:00Z',
    organization_id: 'demo-org',
    ai_systems: { name: 'Traduction automatique interne' },
  },
];

/* ------------------------------------------------------------------ */
/*  COMPLIANCE                                                          */
/* ------------------------------------------------------------------ */
export const DEMO_COMPLIANCE_SCORES = {
  global: 68,
  frameworks: [
    { framework: 'eu_ai_act', score: 72, compliant: 18, partial: 8, nonCompliant: 4, notApplicable: 2 },
    { framework: 'iso_42001', score: 65, compliant: 14, partial: 10, nonCompliant: 6, notApplicable: 1 },
    { framework: 'nist_ai_rmf', score: 71, compliant: 16, partial: 7, nonCompliant: 5, notApplicable: 3 },
  ],
};

export const DEMO_COMPLIANCE_ASSESSMENTS = [
  {
    id: 'demo-comp-1', framework_code: 'eu_ai_act', requirement_code: 'ART-9',
    status: 'compliant' as const, last_verified_at: '2026-02-01T10:00:00Z',
    responsible_user_id: null, organization_id: 'demo-org',
  },
  {
    id: 'demo-comp-2', framework_code: 'eu_ai_act', requirement_code: 'ART-10',
    status: 'partially_compliant' as const, last_verified_at: '2026-01-28T10:00:00Z',
    responsible_user_id: null, organization_id: 'demo-org',
  },
  {
    id: 'demo-comp-3', framework_code: 'iso_42001', requirement_code: '6.1',
    status: 'non_compliant' as const, last_verified_at: null,
    responsible_user_id: null, organization_id: 'demo-org',
  },
];

export const DEMO_REMEDIATION_ACTIONS = [
  {
    id: 'demo-rem-1', title: 'Documenter les processus de gouvernance des données',
    status: 'in_progress' as const, priority: 'high' as const,
    responsible_user_id: null, due_date: '2026-03-15', organization_id: 'demo-org',
    assessment_id: 'demo-comp-2',
  },
  {
    id: 'demo-rem-2', title: 'Implémenter le registre de transparence',
    status: 'planned' as const, priority: 'critical' as const,
    responsible_user_id: null, due_date: '2026-04-01', organization_id: 'demo-org',
    assessment_id: 'demo-comp-3',
  },
];

/* ------------------------------------------------------------------ */
/*  TRANSPARENCY                                                        */
/* ------------------------------------------------------------------ */
export const DEMO_AUTOMATED_DECISIONS = [
  {
    id: 'demo-ad-1', decision_type: 'Scoring de crédit',
    automation_level: 'fully_automated' as const,
    affected_persons: ['clients', 'demandeurs de prêt'],
    decision_impact: 'high' as const,
    explanation_enabled: true, contestation_enabled: true,
    status: 'active' as const, organization_id: 'demo-org',
    ai_system_id: 'demo-sys-3',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'demo-ad-2', decision_type: 'Tri de candidatures',
    automation_level: 'semi_automated' as const,
    affected_persons: ['candidats'],
    decision_impact: 'high' as const,
    explanation_enabled: true, contestation_enabled: false,
    status: 'active' as const, organization_id: 'demo-org',
    ai_system_id: 'demo-sys-1',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
];

export const DEMO_CONTESTATIONS = [
  {
    id: 'demo-cont-1', case_number: 'CONT-2026-001',
    requester_name: 'Marie Dupont', requester_email: null,
    received_at: '2026-02-05T14:00:00Z',
    status: 'under_review' as const, review_outcome: null,
    automated_decision_id: 'demo-ad-1', organization_id: 'demo-org',
    assigned_to: null,
  },
];

/* ------------------------------------------------------------------ */
/*  GOVERNANCE                                                          */
/* ------------------------------------------------------------------ */
export const DEMO_POLICIES = [
  {
    id: 'demo-pol-1', title: "Politique d'utilisation de l'IA",
    policy_type: 'ai_usage' as const, status: 'published' as const,
    version: 2, updated_at: '2026-01-15T10:00:00Z',
    organization_id: 'demo-org', content: '', created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'demo-pol-2', title: "Charte éthique IA",
    policy_type: 'ethics_charter' as const, status: 'in_review' as const,
    version: 1, updated_at: '2026-02-10T10:00:00Z',
    organization_id: 'demo-org', content: '', created_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'demo-pol-3', title: "Procédure de gestion des incidents IA",
    policy_type: 'incident_procedure' as const, status: 'draft' as const,
    version: 1, updated_at: '2026-02-18T10:00:00Z',
    organization_id: 'demo-org', content: '', created_at: '2026-02-01T10:00:00Z',
  },
];

export const DEMO_GOVERNANCE_ROLES = [
  {
    id: 'demo-role-1', role_type: 'sponsor' as const,
    user_id: null, scope: 'global' as const,
    ai_system_id: null, status: 'active',
    nominated_at: '2025-06-01T10:00:00Z', organization_id: 'demo-org',
  },
  {
    id: 'demo-role-2', role_type: 'privacy_officer' as const,
    user_id: null, scope: 'global' as const,
    ai_system_id: null, status: 'active',
    nominated_at: '2025-06-01T10:00:00Z', organization_id: 'demo-org',
  },
  {
    id: 'demo-role-3', role_type: 'ai_lead' as const,
    user_id: null, scope: 'per_system' as const,
    ai_system_id: 'demo-sys-1', status: 'active',
    nominated_at: '2025-09-15T10:00:00Z', organization_id: 'demo-org',
  },
];

export const DEMO_COMMITTEES = [
  {
    id: 'demo-com-1', name: "Comité d'éthique IA",
    meeting_frequency: 'monthly' as const,
    members: [], status: 'active', organization_id: 'demo-org',
    created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'demo-com-2', name: 'Comité de pilotage IA',
    meeting_frequency: 'quarterly' as const,
    members: [], status: 'active', organization_id: 'demo-org',
    created_at: '2025-06-01T10:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  INCIDENTS                                                           */
/* ------------------------------------------------------------------ */
export const DEMO_INCIDENTS = [
  {
    id: 'demo-inc-1', title: 'Biais détecté dans le modèle de scoring',
    category: 'ai' as const, incident_type: 'bias',
    severity: 'high' as const, status: 'investigating' as const,
    detected_at: '2026-02-10T08:30:00Z', assigned_to: null,
    organization_id: 'demo-org', description: '',
    created_at: '2026-02-10T08:30:00Z',
  },
  {
    id: 'demo-inc-2', title: 'Fuite de données personnelles via chatbot',
    category: 'privacy' as const, incident_type: 'data_breach',
    severity: 'critical' as const, status: 'resolving' as const,
    detected_at: '2026-01-28T14:00:00Z', assigned_to: null,
    organization_id: 'demo-org', description: '',
    created_at: '2026-01-28T14:00:00Z',
  },
  {
    id: 'demo-inc-3', title: "Hallucination dans l'assistant interne",
    category: 'ai' as const, incident_type: 'hallucination',
    severity: 'medium' as const, status: 'resolved' as const,
    detected_at: '2026-01-15T10:00:00Z', assigned_to: null,
    organization_id: 'demo-org', description: '',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'demo-inc-4', title: 'Temps de réponse dégradé — moteur de recommandation',
    category: 'ai' as const, incident_type: 'performance',
    severity: 'low' as const, status: 'closed' as const,
    detected_at: '2026-01-05T16:00:00Z', assigned_to: null,
    organization_id: 'demo-org', description: '',
    created_at: '2026-01-05T16:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  MONITORING                                                          */
/* ------------------------------------------------------------------ */
export const DEMO_MONITORING_METRICS = [
  {
    id: 'demo-met-1', name: 'Précision du modèle',
    category: 'performance' as const,
    direction: 'higher_is_better' as const, unit: '%',
    target_value: 95, warning_threshold: 90, critical_threshold: 85,
    collection_frequency: 'daily' as const, source: 'api_webhook' as const,
    is_active: true, organization_id: 'demo-org', ai_system_id: 'demo-sys-1',
    created_at: '2025-10-01T10:00:00Z',
  },
  {
    id: 'demo-met-2', name: 'Data drift score',
    category: 'drift_data' as const,
    direction: 'lower_is_better' as const, unit: 'PSI',
    target_value: 0.1, warning_threshold: 0.15, critical_threshold: 0.25,
    collection_frequency: 'weekly' as const, source: 'scheduled_report' as const,
    is_active: true, organization_id: 'demo-org', ai_system_id: 'demo-sys-3',
    created_at: '2025-11-01T10:00:00Z',
  },
  {
    id: 'demo-met-3', name: 'Latence moyenne',
    category: 'latency' as const,
    direction: 'lower_is_better' as const, unit: 'ms',
    target_value: 200, warning_threshold: 500, critical_threshold: 1000,
    collection_frequency: 'realtime' as const, source: 'api_webhook' as const,
    is_active: true, organization_id: 'demo-org', ai_system_id: 'demo-sys-2',
    created_at: '2025-12-01T10:00:00Z',
  },
];

export const DEMO_MONITORING_DATA_POINTS = [
  { id: 'demo-dp-1', metric_id: 'demo-met-1', value: 93.2, recorded_at: '2026-02-20T10:00:00Z', alert_level: 'ok' as const, notes: null },
  { id: 'demo-dp-2', metric_id: 'demo-met-1', value: 91.5, recorded_at: '2026-02-19T10:00:00Z', alert_level: 'ok' as const, notes: null },
  { id: 'demo-dp-3', metric_id: 'demo-met-1', value: 88.1, recorded_at: '2026-02-18T10:00:00Z', alert_level: 'warning' as const, notes: null },
];

/* ------------------------------------------------------------------ */
/*  DECISIONS                                                           */
/* ------------------------------------------------------------------ */
export const DEMO_DECISIONS = [
  {
    id: 'demo-dec-1', title: 'Déploiement du modèle de scoring v2',
    decision_type: 'go_nogo' as const,
    ai_system_ids: ['demo-sys-1'], context: 'Nouvelle version avec corrections de biais',
    decision_made: 'Approuvé avec conditions', justification: 'Audit indépendant satisfaisant',
    impact: 'high' as const, status: 'approved' as const,
    created_at: '2026-02-01T10:00:00Z', effective_date: '2026-02-15',
    requester_id: null, approved_at: '2026-02-10T15:00:00Z',
    organization_id: 'demo-org',
  },
  {
    id: 'demo-dec-2', title: 'Changement de fournisseur LLM',
    decision_type: 'vendor_change' as const,
    ai_system_ids: ['demo-sys-2'], context: 'Migration vers un modèle plus performant',
    decision_made: null, justification: null,
    impact: 'medium' as const, status: 'in_review' as const,
    created_at: '2026-02-15T10:00:00Z', effective_date: null,
    requester_id: null, approved_at: null,
    organization_id: 'demo-org',
  },
  {
    id: 'demo-dec-3', title: "Suspension temporaire de l'outil de détection",
    decision_type: 'suspension' as const,
    ai_system_ids: ['demo-sys-3'], context: 'Taux de faux positifs trop élevé',
    decision_made: 'Suspension immédiate', justification: 'Impact client inacceptable',
    impact: 'critical' as const, status: 'implemented' as const,
    created_at: '2026-01-20T10:00:00Z', effective_date: '2026-01-20',
    requester_id: null, approved_at: '2026-01-20T12:00:00Z',
    organization_id: 'demo-org',
  },
  {
    id: 'demo-dec-4', title: 'Ajustement de la politique de rétention des données',
    decision_type: 'policy_adjustment' as const,
    ai_system_ids: [], context: 'Mise en conformité RGPD',
    decision_made: 'Réduction à 12 mois', justification: 'Principe de minimisation',
    impact: 'low' as const, status: 'implemented' as const,
    created_at: '2026-01-10T10:00:00Z', effective_date: '2026-02-01',
    requester_id: null, approved_at: '2026-01-12T10:00:00Z',
    organization_id: 'demo-org',
  },
];

/* ------------------------------------------------------------------ */
/*  DOCUMENTS                                                           */
/* ------------------------------------------------------------------ */
export const DEMO_DOCUMENTS = [
  {
    id: 'demo-doc-1', title: "Politique d'utilisation de l'IA — v2",
    category: 'policy', subcategory: 'ai_usage',
    file_name: 'politique-ia-v2.pdf', file_size: 245000,
    status: 'approved' as const, tags: ['IA', 'politique', 'gouvernance'],
    organization_id: 'demo-org', created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'demo-doc-2', title: 'Rapport EIVP — Chatbot service client',
    category: 'assessment', subcategory: 'eivp',
    file_name: 'eivp-chatbot-2026.pdf', file_size: 512000,
    status: 'in_review' as const, tags: ['EIVP', 'chatbot', 'vie privée'],
    organization_id: 'demo-org', created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'demo-doc-3', title: 'Charte éthique IA',
    category: 'policy', subcategory: 'ethics',
    file_name: 'charte-ethique-ia.docx', file_size: 128000,
    status: 'draft' as const, tags: ['éthique', 'charte'],
    organization_id: 'demo-org', created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
  },
  {
    id: 'demo-doc-4', title: 'Compte rendu — Comité IA Q4 2025',
    category: 'meeting', subcategory: 'committee',
    file_name: 'cr-comite-ia-q4-2025.pdf', file_size: 87000,
    status: 'approved' as const, tags: ['comité', 'compte rendu'],
    organization_id: 'demo-org', created_at: '2025-12-20T10:00:00Z',
    updated_at: '2025-12-20T10:00:00Z',
  },
];

export const DEMO_DOCUMENT_COUNTS = {
  policy: 2,
  assessment: 1,
  meeting: 1,
  training: 0,
  audit: 0,
};

/* ------------------------------------------------------------------ */
/*  DATA CATALOG                                                        */
/* ------------------------------------------------------------------ */
export const DEMO_DATASETS = [
  {
    id: 'demo-ds-1', name: 'Données candidats RH',
    source: 'internal_db' as const, classification: 'sensitive' as const,
    data_categories: ['CV', 'évaluations', 'données personnelles'],
    volume: '10k_100k' as const, quality: 'high' as const,
    freshness: 'daily' as const, status: 'active' as const,
    ai_system_ids: ['demo-sys-1'], organization_id: 'demo-org',
    created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'demo-ds-2', name: 'Historique conversations chatbot',
    source: 'vendor_api' as const, classification: 'personal' as const,
    data_categories: ['messages', 'métadonnées utilisateur'],
    volume: 'gt_1m' as const, quality: 'medium' as const,
    freshness: 'realtime' as const, status: 'active' as const,
    ai_system_ids: ['demo-sys-2'], organization_id: 'demo-org',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 'demo-ds-3', name: 'Transactions financières (anonymisées)',
    source: 'internal_db' as const, classification: 'none' as const,
    data_categories: ['montants', 'timestamps', 'catégories'],
    volume: 'gt_1m' as const, quality: 'high' as const,
    freshness: 'daily' as const, status: 'active' as const,
    ai_system_ids: ['demo-sys-3'], organization_id: 'demo-org',
    created_at: '2025-03-01T10:00:00Z',
  },
];

export const DEMO_DATA_TRANSFERS = [
  {
    id: 'demo-dt-1', dataset_id: 'demo-ds-1',
    destination_country: 'États-Unis', transfer_purpose: 'Hébergement cloud (AWS)',
    contractual_basis: 'Clauses contractuelles types (CCT)',
    efvp_completed: true, status: 'active' as const,
    organization_id: 'demo-org', created_at: '2025-06-15T10:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  BIAS                                                                */
/* ------------------------------------------------------------------ */
export const DEMO_BIAS_FINDINGS = [
  {
    id: 'demo-bias-1', title: 'Disparité de genre dans le scoring RH',
    bias_type: 'disparate_impact' as const, severity: 'high' as const,
    status: 'in_remediation' as const,
    detection_method: 'automated_test' as const,
    protected_dimensions: ['genre'], affected_count: 1250,
    remediation_target_date: '2026-03-01',
    detected_at: '2026-01-20T10:00:00Z',
    organization_id: 'demo-org', ai_system_id: 'demo-sys-1',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'demo-bias-2', title: 'Sous-représentation des seniors',
    bias_type: 'representation' as const, severity: 'medium' as const,
    status: 'identified' as const,
    detection_method: 'manual_audit' as const,
    protected_dimensions: ['âge'], affected_count: 340,
    remediation_target_date: '2026-04-15',
    detected_at: '2026-02-05T10:00:00Z',
    organization_id: 'demo-org', ai_system_id: 'demo-sys-1',
    created_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'demo-bias-3', title: 'Stéréotypes culturels dans les réponses chatbot',
    bias_type: 'stereotyping' as const, severity: 'medium' as const,
    status: 'resolved' as const,
    detection_method: 'user_complaint' as const,
    protected_dimensions: ['origine ethnique'], affected_count: null,
    remediation_target_date: null,
    detected_at: '2025-11-10T10:00:00Z',
    organization_id: 'demo-org', ai_system_id: 'demo-sys-2',
    created_at: '2025-11-10T10:00:00Z',
  },
];

/* ------------------------------------------------------------------ */
/*  VENDORS                                                             */
/* ------------------------------------------------------------------ */
export const DEMO_VENDORS = [
  {
    id: 'demo-ven-1', name: 'OpenAI',
    vendor_type: 'model_provider' as const,
    risk_level: 'high' as const, status: 'active' as const,
    contract_end_date: '2026-12-31',
    organization_id: 'demo-org', created_at: '2025-06-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'demo-ven-2', name: 'AWS',
    vendor_type: 'infrastructure' as const,
    risk_level: 'medium' as const, status: 'active' as const,
    contract_end_date: '2027-06-30',
    organization_id: 'demo-org', created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-12-01T10:00:00Z',
  },
  {
    id: 'demo-ven-3', name: 'Mistral AI',
    vendor_type: 'model_provider' as const,
    risk_level: 'medium' as const, status: 'under_review' as const,
    contract_end_date: null,
    organization_id: 'demo-org', created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  },
];
```

**Step 2: Create the index file**

Create `src/portail/demo/index.ts`:

```typescript
export {
  DEMO_RISK_ASSESSMENTS,
  DEMO_COMPLIANCE_SCORES,
  DEMO_COMPLIANCE_ASSESSMENTS,
  DEMO_REMEDIATION_ACTIONS,
  DEMO_AUTOMATED_DECISIONS,
  DEMO_CONTESTATIONS,
  DEMO_POLICIES,
  DEMO_GOVERNANCE_ROLES,
  DEMO_COMMITTEES,
  DEMO_INCIDENTS,
  DEMO_MONITORING_METRICS,
  DEMO_MONITORING_DATA_POINTS,
  DEMO_DECISIONS,
  DEMO_DOCUMENTS,
  DEMO_DOCUMENT_COUNTS,
  DEMO_DATASETS,
  DEMO_DATA_TRANSFERS,
  DEMO_BIAS_FINDINGS,
  DEMO_VENDORS,
} from './data';
```

**Step 3: Commit**

```bash
git add src/portail/demo/
git commit -m "feat: add static demo data for feature gate preview mode"
```

---

### Task 5: Update RiskAssessmentListPage for preview mode

**Files:**
- Modify: `src/portail/pages/RiskAssessmentListPage.tsx`

**Step 1: Add preview imports and logic**

Add at top with other imports:
```typescript
import { useFeaturePreview } from '@/hooks/useFeaturePreview';
import { DEMO_RISK_ASSESSMENTS } from '@/portail/demo';
```

Inside the component, after the existing hooks, add:
```typescript
const { isPreview } = useFeaturePreview('risk_assessments');
```

Replace the data source: where the component uses `assessments` from `useRiskAssessments()`, add a line after:
```typescript
const displayAssessments = isPreview ? DEMO_RISK_ASSESSMENTS : assessments;
```

Use `displayAssessments` instead of `assessments` in the JSX (DataTable data prop and empty-state check). When `isPreview` is true, also set `isLoading = false`.

**Step 2: Build to verify**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/portail/pages/RiskAssessmentListPage.tsx
git commit -m "feat: add preview mode with demo data to RiskAssessmentListPage"
```

---

### Task 6: Update CompliancePage for preview mode

**Files:**
- Modify: `src/portail/pages/CompliancePage.tsx`

**Step 1: Add preview imports and logic**

Add imports:
```typescript
import { useFeaturePreview } from '@/hooks/useFeaturePreview';
import { DEMO_COMPLIANCE_SCORES, DEMO_COMPLIANCE_ASSESSMENTS, DEMO_REMEDIATION_ACTIONS } from '@/portail/demo';
```

Inside the main `CompliancePage` component, add:
```typescript
const { isPreview } = useFeaturePreview('compliance');
```

Pass `isPreview` to the sub-tab components. Each tab component should swap real data for demo data when `isPreview` is true. The compliance scores dashboard, assessments list, and remediation actions all need demo data injection.

**Step 2: Build and commit**

```bash
git add src/portail/pages/CompliancePage.tsx
git commit -m "feat: add preview mode with demo data to CompliancePage"
```

---

### Task 7: Update TransparencyPage for preview mode

**Files:**
- Modify: `src/portail/pages/TransparencyPage.tsx`

Same pattern: import `useFeaturePreview` + `DEMO_AUTOMATED_DECISIONS` + `DEMO_CONTESTATIONS`. Swap data sources when `isPreview` is true.

**Commit:**
```bash
git add src/portail/pages/TransparencyPage.tsx
git commit -m "feat: add preview mode with demo data to TransparencyPage"
```

---

### Task 8: Update GovernancePage for preview mode

**Files:**
- Modify: `src/portail/pages/GovernancePage.tsx`

Import `useFeaturePreview` + `DEMO_POLICIES` + `DEMO_GOVERNANCE_ROLES` + `DEMO_COMMITTEES`. Swap data in each tab component.

**Commit:**
```bash
git add src/portail/pages/GovernancePage.tsx
git commit -m "feat: add preview mode with demo data to GovernancePage"
```

---

### Task 9: Update IncidentListPage for preview mode

**Files:**
- Modify: `src/portail/pages/IncidentListPage.tsx`

Import `useFeaturePreview` + `DEMO_INCIDENTS`. Swap incidents data.

**Commit:**
```bash
git add src/portail/pages/IncidentListPage.tsx
git commit -m "feat: add preview mode with demo data to IncidentListPage"
```

---

### Task 10: Update MonitoringPage for preview mode

**Files:**
- Modify: `src/portail/pages/MonitoringPage.tsx`

Import `useFeaturePreview` + `DEMO_MONITORING_METRICS` + `DEMO_MONITORING_DATA_POINTS`. Swap data.

**Commit:**
```bash
git add src/portail/pages/MonitoringPage.tsx
git commit -m "feat: add preview mode with demo data to MonitoringPage"
```

---

### Task 11: Update DecisionsPage for preview mode

**Files:**
- Modify: `src/portail/pages/DecisionsPage.tsx`

Import `useFeaturePreview` + `DEMO_DECISIONS`. Swap decisions data.

**Commit:**
```bash
git add src/portail/pages/DecisionsPage.tsx
git commit -m "feat: add preview mode with demo data to DecisionsPage"
```

---

### Task 12: Update DocumentsPage for preview mode

**Files:**
- Modify: `src/portail/pages/DocumentsPage.tsx`

Import `useFeaturePreview` + `DEMO_DOCUMENTS` + `DEMO_DOCUMENT_COUNTS`. Swap data.

**Commit:**
```bash
git add src/portail/pages/DocumentsPage.tsx
git commit -m "feat: add preview mode with demo data to DocumentsPage"
```

---

### Task 13: Update DataPage for preview mode

**Files:**
- Modify: `src/portail/pages/DataPage.tsx`

Import `useFeaturePreview` + `DEMO_DATASETS` + `DEMO_DATA_TRANSFERS`. Swap data in both tabs.

**Commit:**
```bash
git add src/portail/pages/DataPage.tsx
git commit -m "feat: add preview mode with demo data to DataPage"
```

---

### Task 14: Update BiasPage for preview mode

**Files:**
- Modify: `src/portail/pages/BiasPage.tsx`

Import `useFeaturePreview` + `DEMO_BIAS_FINDINGS`. Swap data.

**Commit:**
```bash
git add src/portail/pages/BiasPage.tsx
git commit -m "feat: add preview mode with demo data to BiasPage"
```

---

### Task 15: Update VendorsPage for preview mode

**Files:**
- Modify: `src/portail/pages/VendorsPage.tsx`

Import `useFeaturePreview` + `DEMO_VENDORS`. Swap data.

**Commit:**
```bash
git add src/portail/pages/VendorsPage.tsx
git commit -m "feat: add preview mode with demo data to VendorsPage"
```

---

### Task 16: Final build verification and push

**Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with zero errors.

**Step 2: Push to GitHub**

```bash
git push origin main
```

Expected: Netlify auto-deploys. Verify on production that Observer users see the blur preview with demo data on all gated pages.
