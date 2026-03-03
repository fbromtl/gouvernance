# Restructuration Gratuit / Membre — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the SaaS portal from 3 plan levels (Observer/Member/Expert) to 2 levels (Gratuit/Membre), where the free plan gives read-only access to ALL modules with demo data, and the gate only blocks actions (create/edit/delete/export).

**Architecture:** Remove all page-level `<FeatureGate>` wrappers. Create a new `<ActionGate>` component that wraps individual action buttons. Simplify Stripe/plan definitions to 2 levels. Seed demo data "MonOrganisation inc." for new free users. Update TarifsPage to 2 columns.

**Tech Stack:** React 19, TypeScript, Supabase (PostgreSQL + Edge Functions), Stripe, i18next, Tailwind CSS, shadcn/ui

**Design doc:** `docs/plans/2026-03-03-restructuration-gratuit-membre-design.md`

---

## Task 1: Update TypeScript types and Stripe plan definitions

**Files:**
- Modify: `src/types/database.ts:6`
- Modify: `src/lib/stripe.ts`

**Step 1: Update SubscriptionPlan type**

In `src/types/database.ts`, change the `SubscriptionPlan` type:

```typescript
// Before
export type SubscriptionPlan = 'observer' | 'member' | 'expert' | 'honorary';

// After
export type SubscriptionPlan = 'free' | 'member' | 'honorary';
```

**Step 2: Simplify stripe.ts plan definitions**

In `src/lib/stripe.ts`:

```typescript
export type PlanId = 'free' | 'member' | 'honorary';

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxMembers: 1,
    maxAiSystems: null, // unlimited read-only with demo data
  },
  member: {
    id: 'member',
    monthlyPrice: 249,
    yearlyPrice: 2388,
    monthlyPriceId: 'price_1T3nfmGxmyz5JooX0eHr5UID',
    yearlyPriceId: 'price_1T3nfnGxmyz5JooXt3KF9w7O',
    maxMembers: null,
    maxAiSystems: null,
    highlighted: true,
    badgeColor: 'brand-purple',
  },
  honorary: {
    id: 'honorary',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxMembers: null,
    maxAiSystems: null,
    badgeColor: 'slate-400',
  },
};

export const PURCHASABLE_PLANS: PlanId[] = ['free', 'member'];

export function effectivePlan(plan: PlanId): PlanId {
  return plan === 'honorary' ? 'member' : plan;
}
```

Remove `expert` from `CURRENCY_PRICES` (keep only `free`, `member`, `honorary`).

**Step 3: Fix all TypeScript compilation errors**

Run: `npx tsc --noEmit`

Search the codebase for all references to `'observer'`, `'expert'`, `'enterprise'`, `'pro'` plan names and update them:
- `'observer'` → `'free'`
- `'expert'` → `'member'` (merge access)
- `'honorary'` stays, effectivePlan maps to `'member'`

Key files to check:
- `src/hooks/usePlanFeatures.ts:13` — default plan fallback `'observer'` → `'free'`
- `src/hooks/usePlanFeatures.ts:35` — fallback for expert `plan === 'expert'` → `plan === 'member' || plan === 'honorary'`
- `src/hooks/useSubscription.ts` — any plan references
- `src/portail/pages/DashboardPage.tsx` — uses `useSubscription()` directly
- `src/portail/pages/BillingPage.tsx` — plan display and upgrade logic
- `src/components/shared/FeatureGate.tsx:45` — checkout plan `'member'` (already correct)

**Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: simplifier plans à 2 niveaux (Gratuit/Membre), supprimer Expert"
git push
```

---

## Task 2: Create ActionGate component

**Files:**
- Create: `src/components/shared/ActionGate.tsx`
- Modify: `src/i18n/locales/fr/billing.json` (add ActionGate keys)
- Modify: `src/i18n/locales/en/billing.json` (add ActionGate keys)

**Step 1: Create the ActionGate component**

`src/components/shared/ActionGate.tsx`:

```tsx
import { type ReactNode, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActionGateProps {
  children: ReactNode;
  /** Optional feature key — if omitted, gates on plan === 'free' */
  feature?: string;
}

/**
 * Wraps an action button. If the user is on the free plan,
 * the button is visually dimmed and clicking shows a tooltip
 * prompting upgrade. The child button is NOT hidden — it's
 * just disabled with an upgrade hint.
 */
export function ActionGate({ children, feature }: ActionGateProps) {
  const { plan, hasFeature } = usePlanFeatures();
  const { t } = useTranslation('billing');

  // Member/honorary: everything unlocked
  const isLocked = feature ? !hasFeature(feature) : plan === 'free';

  if (!isLocked) return <>{children}</>;

  const handleBlock = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex cursor-not-allowed"
          onClick={handleBlock}
          onPointerDown={handleBlock}
        >
          <span className="pointer-events-none opacity-50">
            {children}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="flex items-center gap-1.5 text-xs"
      >
        <Lock className="h-3 w-3" />
        {t('actionGate.tooltip')}
      </TooltipContent>
    </Tooltip>
  );
}
```

**Step 2: Add i18n keys**

In `src/i18n/locales/fr/billing.json`, add:
```json
"actionGate": {
  "tooltip": "Passez au plan Membre pour débloquer cette action"
}
```

In `src/i18n/locales/en/billing.json`, add:
```json
"actionGate": {
  "tooltip": "Upgrade to Member plan to unlock this action"
}
```

**Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/shared/ActionGate.tsx src/i18n/locales/fr/billing.json src/i18n/locales/en/billing.json
git commit -m "feat: créer composant ActionGate pour bloquer les actions du plan gratuit"
git push
```

---

## Task 3: Refactor portail pages — Remove page-level FeatureGate, add ActionGate on buttons

This is the largest task. Each page follows the same pattern:

1. Remove `<FeatureGate feature="xxx">` wrapping
2. Keep `useFeaturePreview` if present (for demo data)
3. Import `ActionGate` and wrap action buttons (Create, Edit, Delete, Export)
4. Leave view-only buttons (Eye) unwrapped

### Pages to refactor (13 pages):

**Group A — Pages with FeatureGate wrapping entire page:**

#### 3a. RiskAssessmentListPage.tsx
- **Remove:** `<FeatureGate feature="risk_assessments">` at lines ~103 and ~129 (two return branches)
- **Wrap with ActionGate:**
  - Line ~110: `<Button onClick={() => navigate("/risks/new")}>` (header Create)
  - Line ~136: Same button in normal branch
  - Line ~121: `EmptyState onAction` — wrap the Button inside EmptyState or the whole EmptyState action

#### 3b. IncidentListPage.tsx
- **Remove:** `<FeatureGate feature="incidents">` at lines ~180, ~209, ~224 (three return branches)
- **Wrap with ActionGate:**
  - Line ~232: Create button in PageHeader
  - Line ~317: EmptyState action button

#### 3c. CompliancePage.tsx
- **Remove:** `<FeatureGate feature="compliance">` at line ~116
- **Wrap with ActionGate:**
  - Frameworks tab: Seed buttons (lines ~392, ~402)
  - Remediation tab: Create (line ~655, ~669), Edit (line ~713), Delete (line ~721)

#### 3d. GovernancePage.tsx
- **Remove:** `<FeatureGate feature="governance_structure">` at lines ~1422
- **Wrap with ActionGate:**
  - Policies tab: Create (line ~307, ~380), Edit (line ~429, ~449), Submit (line ~437), Publish (line ~457), New version (line ~471), Archive (line ~479)
  - Roles tab: Create (line ~743, ~775), Edit (line ~846), Delete (line ~853)
  - Committees tab: Create (line ~1153, ~1179), Edit (line ~1225), Delete (line ~1232), Add member (line ~1302)

#### 3e. DecisionsPage.tsx
- **Remove:** `<FeatureGate feature="decisions">` at line ~270
- **Wrap with ActionGate:**
  - Create (line ~317, ~337), Edit (line ~400), Submit (line ~403), Delete (line ~406), Approve (line ~413), Reject (line ~416)

#### 3f. BiasPage.tsx
- **Remove:** `<FeatureGate feature="bias">` at line ~307
- **Wrap with ActionGate:**
  - Create (line ~322, ~384), Edit (line ~428), Delete (line ~431)

#### 3g. TransparencyPage.tsx
- **Remove:** `<FeatureGate feature="transparency">` at line ~188
- **Wrap with ActionGate:**
  - Registry: Create (line ~319), Edit (line ~358), Delete (line ~359)
  - Contestations: Create (line ~582), Edit (line ~621)

#### 3h. VendorsPage.tsx
- **Remove:** `<FeatureGate feature="vendors">` at lines ~302, ~316 (two return branches)
- **Wrap with ActionGate:**
  - Create (line ~371, ~393), Edit (line ~473), Delete (line ~481)

#### 3i. DocumentsPage.tsx
- **Remove:** `<FeatureGate feature="documents">` at lines ~345, ~361
- **Wrap with ActionGate:**
  - DropZone (upload area) — wrap the DropZone component itself
  - Delete (line ~554 via onDelete prop, line ~679 confirm button)
  - Download button in FileDetail — leave unwrapped (read-only is fine)

#### 3j. MonitoringPage.tsx
- **Remove:** `<FeatureGate feature="monitoring">` at lines ~314, ~328
- **Wrap with ActionGate:**
  - Create metric (line ~395, ~413), Edit metric (line ~466), Delete metric (line ~474)
  - Add data point (line ~519, ~543)

#### 3k. DataPage.tsx
- **Remove:** `<FeatureGate feature="data_catalog">` at lines ~476, ~490
- **Wrap with ActionGate:**
  - Datasets: Create (line ~556, ~578), Edit (line ~636), Delete (line ~644)
  - Transfers: Create (line ~695, ~717), Edit (line ~762), Delete (line ~770)

**Group B — Pages without FeatureGate (add ActionGate only):**

#### 3l. AiSystemsListPage.tsx
- No FeatureGate to remove
- **Wrap with ActionGate:**
  - Create button (line ~219): `<Button onClick={() => navigate("/ai-systems/new")}>`
  - EmptyState action (line ~297)

#### 3m. LifecyclePage.tsx
- No FeatureGate to remove
- **Wrap with ActionGate:**
  - Create (line ~290, ~334), Edit (line ~399), Delete (line ~407)

#### 3n. AgentsPage.tsx
- No FeatureGate to remove
- **Wrap with ActionGate:**
  - Create (line ~181, ~201), Suspend (line ~289), Revoke (line ~300)

**Pattern for each page:**

```tsx
// Before (page-level gate)
import { FeatureGate } from '@/components/shared/FeatureGate';

return (
  <FeatureGate feature="risk_assessments">
    <div className="space-y-6">
      <PageHeader actions={<Button><Plus /> Nouveau</Button>} />
      {/* ... content ... */}
    </div>
  </FeatureGate>
);

// After (action-level gate)
import { ActionGate } from '@/components/shared/ActionGate';

return (
  <div className="space-y-6">
    <PageHeader actions={
      <ActionGate>
        <Button><Plus /> Nouveau</Button>
      </ActionGate>
    } />
    {/* ... content visible to all ... */}
    {/* Inline action buttons wrapped too: */}
    <ActionGate><Button size="icon"><Pencil /></Button></ActionGate>
    <ActionGate><Button size="icon"><Trash2 /></Button></ActionGate>
  </div>
);
```

**Step (after all pages):** Verify compilation

Run: `npx tsc --noEmit`
Expected: 0 errors

**Commit after each group or after all:**

```bash
git add -A && git commit -m "refactor: remplacer FeatureGate page-level par ActionGate sur boutons d'action"
git push
```

---

## Task 4: Update usePlanFeatures hook

**Files:**
- Modify: `src/hooks/usePlanFeatures.ts`

**Step 1: Simplify the hook**

The hook currently queries `plan_features` from Supabase. With the new architecture:
- **Free plan:** `hasFeature()` always returns `false` (all actions gated)
- **Member/Honorary:** `hasFeature()` always returns `true` (all actions unlocked)

We can simplify:

```typescript
import { useSubscription } from './useSubscription';
import type { SubscriptionPlan } from '@/types/database';

export function usePlanFeatures() {
  const { data: subscription } = useSubscription();
  const plan: SubscriptionPlan = subscription?.plan ?? 'free';

  const hasFeature = (_featureKey: string): boolean => {
    // Member and honorary have everything
    return plan === 'member' || plan === 'honorary';
  };

  return { plan, hasFeature };
}
```

This eliminates the Supabase query entirely since the logic is now binary (free vs. paid). The `plan_features` table can still exist for future granular control if needed.

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/hooks/usePlanFeatures.ts
git commit -m "refactor: simplifier usePlanFeatures — logique binaire gratuit/membre"
git push
```

---

## Task 5: Update FeatureGate to be an upgrade CTA page (keep for edge cases)

**Files:**
- Modify: `src/components/shared/FeatureGate.tsx`

The existing `FeatureGate` component still works and is still useful as a **full-page upgrade prompt** for any edge case where we want to block an entire route. After the refactor, most pages won't use it, but we keep it operational.

**Step 1: Update FeatureGate default plan reference**

Change `checkout.mutate({ plan: 'member' })` — already correct.
No other changes needed since the component already works with the new plan structure.

**Step 2: Verify the `FeatureGate` import is removed from all portail pages (done in Task 3)**

Search: `grep -r "FeatureGate" src/portail/pages/`
Expected: 0 results (all removed in Task 3)

**Step 3: Commit (if any changes)**

```bash
git add -A && git commit -m "chore: nettoyer FeatureGate après migration vers ActionGate"
git push
```

---

## Task 6: Simplify TarifsPage — 2 columns (Gratuit / Membre)

**Files:**
- Modify: `src/pages/TarifsPage.tsx`
- Modify: `src/i18n/locales/fr/billing.json` (update plan names and features)
- Modify: `src/i18n/locales/en/billing.json`

**Step 1: Update plan configurations**

Replace the 3-plan config with 2 plans:

```tsx
const FREE_FEATURES: PlanFeature[] = [
  { key: "all_modules_readonly" },
  { key: "demo_data" },
  { key: "veille_read" },
  { key: "bibliotheque" },
  { key: "members_cercle" },
  { key: "ai_chat_limited", interpolation: { count: 3 } },
];

const MEMBER_FEATURES: PlanFeature[] = [
  { key: "all_modules_full" },
  { key: "create_edit_delete" },
  { key: "ai_systems_unlimited" },
  { key: "risk_assessments" },
  { key: "incidents" },
  { key: "compliance" },
  { key: "governance_structure" },
  { key: "monitoring" },
  { key: "data_catalog" },
  { key: "decisions" },
  { key: "bias" },
  { key: "transparency" },
  { key: "vendors" },
  { key: "documents" },
  { key: "ai_chat_unlimited" },
  { key: "export_pdf" },
  { key: "support_email" },
  { key: "members_unlimited" },
  { key: "member_directory" },
  { key: "public_profile" },
  { key: "linkedin_badge" },
];

const PLAN_CONFIGS: PlanCardConfig[] = [
  {
    id: "free",
    icon: Eye,
    features: FREE_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "chooseFree",
  },
  {
    id: "member",
    icon: Users,
    features: MEMBER_FEATURES,
    ctaTo: "/inscription",
    ctaLabel: "becomeMember",
  },
];
```

**Step 2: Update comparison table to 2 columns**

Change `PLAN_AVAILABILITY` from `[boolean, boolean, boolean]` to `[boolean, boolean]` (Gratuit, Membre):

```tsx
const PLAN_AVAILABILITY: Record<string, [boolean, boolean]> = {
  all_modules_readonly:  [true,  true],
  demo_data:             [true,  false],
  create_edit_delete:    [false, true],
  ai_systems:            [true,  true],  // read-only vs full
  risk_assessments:      [true,  true],
  incidents:             [true,  true],
  compliance:            [true,  true],
  decisions:             [true,  true],
  bias:                  [true,  true],
  transparency:          [true,  true],
  vendors:               [true,  true],
  documents:             [true,  true],
  monitoring:            [true,  true],
  data_catalog:          [true,  true],
  governance_structure:  [true,  true],
  lifecycle:             [true,  true],
  ai_chat:               [true,  true],  // limited vs unlimited (use label)
  export_pdf:            [false, true],
  support_email:         [false, true],
  member_directory:      [false, true],
  public_profile:        [false, true],
  linkedin_badge:        [false, true],
};
```

Add a `labelOverride` concept for features that differ in degree (e.g., "3 messages/jour" vs "Illimité" for chat).

**Step 3: Remove Expert-specific elements**

- Remove `EXPERT_FEATURES` array
- Remove `expert` PlanCardConfig
- Remove `Crown` icon import (was for Expert)
- Remove `expert` from `PLAN_ORDER`
- Update SEO `JsonLd` — remove the Expert offer
- Remove honorary members banner (or keep if still relevant — honorary now maps to member)

**Step 4: Update grid layout**

The plan cards grid should be 2 columns max:
```tsx
// Before
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// After
className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
```

**Step 5: Add i18n keys for new features**

In FR `billing.json`:
```json
"plans": {
  "free": { "name": "Gratuit", "tagline": "Explorez tous les modules en lecture seule" },
  "member": { "name": "Membre", "tagline": "Tout débloqué — créez, modifiez, exportez" }
},
"features": {
  "all_modules_readonly": "Accès à tous les modules en lecture seule",
  "demo_data": "Données de démonstration \"MonOrganisation inc.\"",
  "all_modules_full": "Accès complet à tous les modules",
  "create_edit_delete": "Création, modification et suppression",
  "ai_chat_limited": "Chat IA ({{count}} messages/jour)",
  "ai_chat_unlimited": "Chat IA illimité",
  "members_unlimited": "Membres illimités"
}
```

Similar in EN.

**Step 6: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: simplifier page Tarifs à 2 colonnes (Gratuit/Membre)"
git push
```

---

## Task 7: SQL Migration — Update plan_features and subscription_plan

**Files:**
- Create: `supabase/migrations/20260303000001_restructure_plans_gratuit_membre.sql`

**Step 1: Write the migration**

```sql
-- Migration: Restructure from 3 plans to 2 (Gratuit/Membre)
-- Observer → free, Member → member, Expert → removed (merged into member)

-- 1. Update organizations currently on 'enterprise'/'expert' to 'pro'/'member'
UPDATE organizations SET plan = 'pro' WHERE plan = 'enterprise';

-- 2. Update plan_features: enable ALL features for 'pro' (member)
UPDATE plan_features SET enabled = true WHERE plan = 'pro';

-- 3. Remove enterprise rows from plan_features
DELETE FROM plan_features WHERE plan = 'enterprise';

-- 4. Add is_demo column to main tables for demo data seeding
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE compliance_assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE bias_findings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE monitoring_metrics ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE monitoring_data_points ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE data_transfers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE governance_policies ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE governance_roles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE governance_committees ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE lifecycle_events ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE automated_decisions ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE contestations ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- 5. Update subscriptions table: map expert plans to member
UPDATE subscriptions SET plan = 'pro' WHERE plan = 'enterprise';

-- Note: We keep the enum values 'free', 'pro', 'enterprise' in the DB
-- but 'enterprise' is now unused. A future migration can remove it
-- once all references are confirmed clean.
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260303000001_restructure_plans_gratuit_membre.sql
git commit -m "feat: migration SQL — restructuration plans gratuit/membre, ajout is_demo"
git push
```

---

## Task 8: Create demo data seed Edge Function

**Files:**
- Create: `supabase/functions/seed-demo-data/index.ts`

**Step 1: Write the Edge Function**

This function creates a complete set of demo data for "MonOrganisation inc." when a new free user signs up. It's called from the onboarding flow or triggered by a database function.

```typescript
// supabase/functions/seed-demo-data/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No auth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: { user } } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    return new Response(JSON.stringify({ error: 'No organization' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const orgId = profile.organization_id;

  // Check if demo data already exists
  const { count } = await supabase
    .from('ai_systems')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_demo', true);

  if ((count ?? 0) > 0) {
    return new Response(JSON.stringify({ message: 'Demo data already seeded' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ---- SEED DEMO DATA ----
  // Full demo data creation calls here (ai_systems, risks, incidents, etc.)
  // Each insert includes: organization_id: orgId, is_demo: true
  // See design doc for the complete list of demo entities

  // ... (detailed insert logic for all 5 AI systems, 3 risk assessments,
  //      2 incidents, compliance scores, 3 vendors, 3 decisions,
  //      2 bias findings, monitoring metrics, documents, etc.)

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

> **Note:** The full seed data (5 AI systems, 3 risk assessments, 2 incidents, compliance scores, 3 vendors, 3 decisions, 2 bias findings, monitoring data, documents) should be implemented as detailed JSON objects matching each table's schema. Reference the design doc (`docs/plans/2026-03-03-restructuration-gratuit-membre-design.md` lines 83–91) for the exact entities.

**Step 2: Create SQL function to clean demo data on upgrade**

Add to the migration or a new migration:

```sql
CREATE OR REPLACE FUNCTION clean_demo_data(p_org_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM ai_systems WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM risk_assessments WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM incidents WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM compliance_assessments WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM decisions WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM bias_findings WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM vendors WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM documents WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM monitoring_metrics WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM monitoring_data_points WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM datasets WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM data_transfers WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM governance_policies WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM governance_roles WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM governance_committees WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM lifecycle_events WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM automated_decisions WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM contestations WHERE organization_id = p_org_id AND is_demo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 3: Commit**

```bash
git add supabase/functions/seed-demo-data/ supabase/migrations/
git commit -m "feat: edge function seed données de démo MonOrganisation inc."
git push
```

---

## Task 9: Integrate demo data seed in onboarding flow

**Files:**
- Modify: `src/hooks/useOnboarding.ts` or equivalent onboarding logic
- Modify: Stripe webhook handler (clean demo data on upgrade)

**Step 1: Call seed-demo-data after onboarding**

After user completes onboarding (organization created), call the Edge Function:

```typescript
// In onboarding completion handler
const { data } = await supabase.functions.invoke('seed-demo-data');
```

**Step 2: Clean demo data on subscription upgrade**

In `supabase/functions/stripe-webhooks/index.ts`, when a `checkout.session.completed` event is received and the subscription activates, call `clean_demo_data(org_id)`:

```typescript
// After successful subscription activation
await supabaseAdmin.rpc('clean_demo_data', { p_org_id: organizationId });
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: intégrer seed démo à l'onboarding + nettoyage à l'upgrade"
git push
```

---

## Task 10: Update Stripe checkout Edge Function

**Files:**
- Modify: `supabase/functions/stripe-checkout/index.ts`

**Step 1: Remove expert plan references**

In the `getPriceId()` function, remove `expert`/`enterprise` aliases. Only keep `member`/`pro` mapping:

```typescript
function getPriceId(plan: string, period: string): string {
  const normalizedPlan = plan === 'pro' ? 'MEMBER' : plan.toUpperCase();
  const normalizedPeriod = period.toUpperCase();
  const envKey = `STRIPE_PRICE_${normalizedPlan}_${normalizedPeriod}`;

  return Deno.env.get(envKey)
    ?? FALLBACK_PRICES[`${normalizedPlan}_${normalizedPeriod}`]
    ?? '';
}
```

Remove all `ENTERPRISE`/`EXPERT` fallback price IDs.

**Step 2: Commit**

```bash
git add supabase/functions/stripe-checkout/
git commit -m "refactor: simplifier stripe-checkout — supprimer plan expert"
git push
```

---

## Task 11: Update navigation sidebar (if needed)

**Files:**
- Modify: `src/portail/layout/AppSidebar.tsx` (if any nav items are gated by plan)

**Step 1: Check if sidebar hides modules based on plan**

Search for any plan-based conditional rendering in the sidebar. If modules are hidden for free users, make them all visible.

**Step 2: Commit (if changes needed)**

```bash
git add -A && git commit -m "fix: rendre tous les modules navigables dans la sidebar pour le plan gratuit"
git push
```

---

## Task 12: Final verification and build

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Search for stale references**

```bash
grep -r "observer" src/ --include="*.ts" --include="*.tsx" -l
grep -r "expert" src/ --include="*.ts" --include="*.tsx" -l
grep -r "enterprise" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: No results (or only in comments/docs)

**Step 4: Final commit**

```bash
git add -A && git commit -m "chore: vérification finale restructuration Gratuit/Membre"
git push
```

---

## Execution Order

Tasks can be partially parallelized:

```
Task 1 (types + stripe) ──→ Task 2 (ActionGate) ──→ Task 3 (refactor pages) ──→ Task 5 (clean FeatureGate)
                          ├──→ Task 4 (usePlanFeatures)
                          ├──→ Task 6 (TarifsPage)
                          └──→ Task 7 (SQL migration)

Task 7 (SQL) ──→ Task 8 (seed function) ──→ Task 9 (onboarding integration)
Task 1 ──→ Task 10 (stripe-checkout)
Task 3 ──→ Task 11 (sidebar)

All ──→ Task 12 (final verification)
```

**Critical path:** Task 1 → Task 2 → Task 3 → Task 12
