# Refactoring structurel du portail — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactorer le portail pour centraliser les constantes/couleurs, créer une factory de hooks CRUD, standardiser les états loading/erreur, réduire les `as any`, extraire les composants dupliqués, et corriger les permissions de navigation.

**Architecture:** 6 axes indépendants exécutables en parallèle par des subagents. Chaque axe produit un commit atomique. Les axes A et F n'ont aucune dépendance. Les axes B, C, D, E peuvent être parallélisés après A.

**Tech Stack:** React 19, TypeScript 5.9, TanStack React Query, Supabase, shadcn/ui, Tailwind CSS 4, i18next.

**Estimation totale : ~22h de travail agent (~3-4h temps réel en multi-agent parallèle)**

---

## Axe A — Centraliser les constantes et couleurs (~3h)

### Task A1: Créer le fichier de couleurs centralisé

**Files:**
- Create: `src/portail/constants/colors.ts`

Créer le fichier avec toutes les color maps utilisées dans le portail. Consolider depuis `chart-theme.ts` + les 18+ pages qui redéfinissent leurs propres couleurs.

```typescript
// src/portail/constants/colors.ts

/** Severity colors — used for risk levels, incident severity, bias severity */
export const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
} as const;

/** Workflow status colors — used for documents, assessments, policies */
export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  in_review: "bg-teal-100 text-teal-800 border-teal-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  implemented: "bg-brand-forest/10 text-brand-forest border-brand-forest/20",
  published: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
} as const;

/** Risk level colors — used for AI systems, vendors, risk assessments */
export const RISK_COLORS = {
  prohibited: "bg-red-200 text-red-900 border-red-300",
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  limited: "bg-amber-100 text-amber-800 border-amber-200",
  minimal: "bg-green-100 text-green-800 border-green-200",
} as const;

/** Decision impact colors */
export const IMPACT_COLORS = {
  critical: "bg-red-100 text-red-800",
  significant: "bg-orange-100 text-orange-800",
  moderate: "bg-amber-100 text-amber-800",
  minor: "bg-green-100 text-green-800",
} as const;

/** Decision type colors */
export const DECISION_TYPE_COLORS = {
  go_nogo: "bg-blue-100 text-blue-800",
  substantial_change: "bg-purple-100 text-purple-800",
  scale_deployment: "bg-teal-100 text-teal-800",
  vendor_change: "bg-orange-100 text-orange-800",
  policy_adjustment: "bg-amber-100 text-amber-800",
  ethical_arbitration: "bg-pink-100 text-pink-800",
  suspension: "bg-red-100 text-red-800",
  exception: "bg-gray-100 text-gray-800",
} as const;

/** Agent autonomy level colors */
export const AUTONOMY_COLORS = {
  full: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
  none: "bg-gray-100 text-gray-800",
} as const;

/** Priority colors — used for compliance remediation */
export const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
} as const;

/** Helper: get color class from any color map safely */
export function getColorClass(
  colorMap: Record<string, string>,
  key: string | undefined | null,
  fallback = "bg-gray-100 text-gray-800"
): string {
  if (!key) return fallback;
  return colorMap[key] ?? fallback;
}
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: centralisation des color maps du portail`

---

### Task A2: Créer les fichiers de constantes domaine

**Files:**
- Create: `src/portail/constants/ai-systems.ts`
- Create: `src/portail/constants/incidents.ts`
- Create: `src/portail/constants/decisions.ts`
- Create: `src/portail/constants/index.ts`

Extraire les constantes dupliquées depuis les pages vers des fichiers partagés.

```typescript
// src/portail/constants/ai-systems.ts
export const SYSTEM_TYPES = [
  "predictive_ml", "rules_based", "genai_text", "genai_image",
  "genai_code", "genai_multimodal", "nlp", "computer_vision",
  "robotics", "recommendation", "other",
] as const;

export const LIFECYCLE_STATUSES = [
  "active", "testing", "production", "maintenance", "deprecated", "archived",
] as const;

export const DEPARTMENTS = [
  "engineering", "product", "marketing", "sales", "hr",
  "finance", "legal", "operations", "customer_support", "research",
] as const;

export type SystemType = (typeof SYSTEM_TYPES)[number];
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];
```

```typescript
// src/portail/constants/incidents.ts
export const INCIDENT_STATUSES = [
  "reported", "investigating", "mitigating", "resolved", "closed",
] as const;

export const INCIDENT_SEVERITIES = ["critical", "high", "medium", "low"] as const;

export const AI_INCIDENT_TYPES = [
  "performance", "security", "bias", "privacy", "reliability", "safety", "other",
] as const;

export const PRIVACY_INCIDENT_TYPES = [
  "unauthorized_access", "data_breach", "consent_violation",
  "excessive_collection", "retention_violation", "cross_border",
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
```

```typescript
// src/portail/constants/decisions.ts
export const DECISION_TYPES = [
  "go_nogo", "substantial_change", "scale_deployment", "vendor_change",
  "policy_adjustment", "ethical_arbitration", "suspension", "exception",
] as const;

export const DECISION_STATUSES = [
  "draft", "submitted", "in_review", "approved", "rejected",
] as const;

export const DECISION_IMPACTS = [
  "critical", "significant", "moderate", "minor",
] as const;

export type DecisionType = (typeof DECISION_TYPES)[number];
export type DecisionStatus = (typeof DECISION_STATUSES)[number];
```

```typescript
// src/portail/constants/index.ts
export * from "./colors";
export * from "./ai-systems";
export * from "./incidents";
export * from "./decisions";
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: extraction des constantes domaine partagées`

---

### Task A3: Migrer les pages pour utiliser les constantes centralisées

**Files:**
- Modify: `src/portail/pages/AiSystemsListPage.tsx` — remplacer SYSTEM_TYPES, LIFECYCLE_STATUSES locaux par imports
- Modify: `src/portail/pages/AiSystemWizardPage.tsx` — remplacer SYSTEM_TYPES, LIFECYCLE_STATUSES, DEPARTMENTS locaux
- Modify: `src/portail/pages/DecisionsPage.tsx` — remplacer STATUS_COLORS, IMPACT_COLORS, TYPE_COLORS, DECISION_TYPES locaux
- Modify: `src/portail/pages/IncidentListPage.tsx` — remplacer SEVERITY_COLORS locaux
- Modify: `src/portail/pages/IncidentReportPage.tsx` — remplacer SEVERITY_INDICATORS locaux
- Modify: `src/portail/pages/BiasPage.tsx` — remplacer severityColor() inline
- Modify: `src/portail/pages/CompliancePage.tsx` — remplacer STATUS_COLORS, PRIORITY_COLORS locaux
- Modify: `src/portail/pages/TransparencyPage.tsx` — remplacer color functions inline
- Modify: `src/portail/pages/VendorsPage.tsx` — remplacer RISK_COLORS, STATUS_COLORS locaux
- Modify: `src/portail/pages/DataPage.tsx` — remplacer STATUS_COLORS locaux
- Modify: `src/portail/pages/AgentsPage.tsx` — remplacer AUTONOMY_COLORS, STATUS_COLORS, RISK_COLORS locaux
- Modify: `src/portail/pages/AgentTracesPage.tsx` — remplacer EVENT_TYPE_COLORS, etc.
- Modify: `src/portail/pages/MonitoringPage.tsx` — remplacer color maps locaux

**Pattern de migration pour chaque page :**

1. Supprimer la définition locale (ex: `const STATUS_COLORS = { ... }`)
2. Ajouter l'import : `import { STATUS_COLORS, getColorClass } from "@/portail/constants/colors"`
3. Adapter les usages si la structure diffère (certaines pages utilisent des clés légèrement différentes)

**Verify:** `npx tsc --noEmit` après chaque batch de 3-4 pages

**Commit:** `refactor: migration des pages vers les constantes centralisées`

---

### Task A4: Consolider les demo data dupliquées

**Files:**
- Modify: `src/portail/components/dashboard/demo-data.ts` — supprimer les 4 DEMO_* dupliquées, importer depuis `@/portail/demo`
- Modify: `src/portail/pages/DashboardPage.tsx` — mettre à jour les imports

Supprimer DEMO_INCIDENTS, DEMO_COMPLIANCE_SCORES, DEMO_DECISIONS, DEMO_BIAS_FINDINGS de `dashboard/demo-data.ts` et les importer depuis `@/portail/demo` à la place.

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: suppression des demo data dupliquées`

---

## Axe B — Factory de hooks CRUD (~6h)

### Task B1: Créer le helper de recherche partagé

**Files:**
- Create: `src/lib/supabase-helpers.ts`

```typescript
// src/lib/supabase-helpers.ts
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

/**
 * Sanitize a search term for PostgREST ilike queries.
 * Removes characters that could break or abuse the query.
 */
export function sanitizeSearch(term: string): string {
  return term.replace(/[%_,.*()]/g, "").trim();
}

/**
 * Apply ilike search across multiple fields with OR logic.
 * Returns the query builder with search filter applied.
 */
export function applySearch<T extends PostgrestFilterBuilder<any, any, any>>(
  query: T,
  search: string | undefined,
  fields: string[],
): T {
  if (!search?.trim()) return query;
  const safe = sanitizeSearch(search);
  if (!safe) return query;
  const or = fields.map((f) => `${f}.ilike.%${safe}%`).join(",");
  return query.or(or) as T;
}
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: extraction du helper de recherche Supabase`

---

### Task B2: Migrer les hooks pour utiliser applySearch

**Files:**
- Modify: `src/hooks/useAiSystems.ts` — remplacer le bloc de recherche inline par `applySearch(query, filters.search, ["name", "description"])`
- Modify: `src/hooks/useVendors.ts`
- Modify: `src/hooks/useBiasFindings.ts`
- Modify: `src/hooks/useDecisions.ts`
- Modify: `src/hooks/useIncidents.ts`
- Modify: `src/hooks/useLifecycleEvents.ts`
- Modify: `src/hooks/useMonitoring.ts`
- Modify: `src/hooks/useData.ts`

**Pattern pour chaque hook :**

Avant :
```typescript
if (filters?.search) {
  const safe = filters.search.replace(/[%_,.*()]/g, "");
  query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
}
```

Après :
```typescript
import { applySearch } from "@/lib/supabase-helpers";
// ...
query = applySearch(query, filters?.search, ["name", "description"]);
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: utilisation du helper applySearch dans tous les hooks`

---

### Task B3: Fusionner useAiChat et usePublicChat

**Files:**
- Create: `src/hooks/useSSEChat.ts` — hook factory SSE streaming partagé
- Modify: `src/hooks/useAiChat.ts` — déléguer à useSSEChat
- Modify: `src/hooks/usePublicChat.ts` — déléguer à useSSEChat

Créer `useSSEChat` qui encapsule la logique SSE commune (streaming, AbortController, message parsing, error handling) :

```typescript
// src/hooks/useSSEChat.ts
interface SSEChatOptions {
  endpoint: string;
  getHeaders: () => Promise<Record<string, string>>;
  buildBody: (message: string) => Record<string, unknown>;
  welcomeMessage: string;
  onRateLimit?: () => string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useSSEChat(options: SSEChatOptions) {
  // ... logique SSE commune extraite de useAiChat et usePublicChat
  // AbortController, streaming fetch, message parsing, error state
  return { messages, sendMessage, isStreaming, error, resetChat };
}
```

Puis simplifier `useAiChat` et `usePublicChat` en wrappers de ~20 lignes chacun.

**Verify:** `npx tsc --noEmit` + tester le chat portail et le chat public

**Commit:** `refactor: fusion des hooks chat SSE en factory partagée`

---

## Axe C — Standardiser les états loading/erreur (~4h)

### Task C1: Créer un composant QueryState générique

**Files:**
- Create: `src/portail/components/QueryState.tsx`

Composant wrapper qui gère automatiquement les états loading/error/empty pour les données TanStack Query :

```typescript
// src/portail/components/QueryState.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  emptyTitle?: string;
  emptyDescription?: string;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyIcon: EmptyIcon,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  skeleton,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return skeleton ?? <DefaultSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-800">Erreur de chargement</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {EmptyIcon && <EmptyIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />}
        <p className="font-medium text-muted-foreground">{emptyTitle}</p>
        {emptyDescription && <p className="text-sm text-muted-foreground/70 mt-1">{emptyDescription}</p>}
      </div>
    );
  }

  return <>{children}</>;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 flex-1 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit`

**Commit:** `feat: composant QueryState pour états loading/erreur standardisés`

---

### Task C2: Appliquer QueryState aux pages sans loading/erreur

**Files:** Modifier les 20 pages sans loading state et les 28 pages sans error state.

Pages prioritaires (les plus visitées) :
- Modify: `src/portail/pages/GovernancePage.tsx`
- Modify: `src/portail/pages/DecisionsPage.tsx`
- Modify: `src/portail/pages/BiasPage.tsx`
- Modify: `src/portail/pages/TransparencyPage.tsx`
- Modify: `src/portail/pages/VendorsPage.tsx`
- Modify: `src/portail/pages/DataPage.tsx`
- Modify: `src/portail/pages/LifecyclePage.tsx`
- Modify: `src/portail/pages/DocumentsPage.tsx`
- Modify: `src/portail/pages/CompliancePage.tsx`

**Pattern :** Wrapper la section data de chaque page :

```tsx
import { QueryState } from "@/portail/components/QueryState";

// Dans le composant :
<QueryState
  isLoading={isLoading}
  error={error}
  isEmpty={data?.length === 0}
  emptyIcon={FileText}
  emptyTitle={t("emptyTitle")}
>
  {/* contenu existant */}
</QueryState>
```

**Verify:** `npx tsc --noEmit`

**Commit:** `feat: ajout loading/erreur standardisés sur les pages du portail`

---

## Axe D — Réduire les `as any` (~3h)

### Task D1: Créer des types helper pour Supabase mutations

**Files:**
- Create: `src/lib/supabase-types.ts`

```typescript
// src/lib/supabase-types.ts
import type { Database } from "@/types/database";

/** Helper type: extract Insert type for a given table */
export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Helper type: extract Update type for a given table */
export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** Helper type: extract Row type for a given table */
export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: types helper pour mutations Supabase`

---

### Task D2: Remplacer les `as any` dans les hooks CRUD

**Files:** Modifier les 20 hooks avec `as any` sur les mutations Supabase.

Hooks prioritaires (ceux avec le plus de `as any`) :
- Modify: `src/hooks/useIncidents.ts` (6 casts)
- Modify: `src/hooks/useDecisions.ts` (5 casts)
- Modify: `src/hooks/useData.ts` (4 casts)
- Modify: `src/hooks/useDocuments.ts` (4 casts)
- Modify: `src/hooks/useAiSystems.ts` (3 casts)
- Modify: `src/hooks/useAdminMutations.ts` (3 casts)
- Modify: `src/hooks/useCompliance.ts` (3 casts)

**Pattern :** Remplacer `as any` par le type correct :

Avant :
```typescript
const { data, error } = await supabase
  .from("incidents")
  .insert(record as any)
  .select()
  .single();
```

Après :
```typescript
import type { TableInsert } from "@/lib/supabase-types";

const payload: TableInsert<"incidents"> = {
  ...input,
  organization_id: profile.organization_id,
  created_by: user.id,
};
const { data, error } = await supabase
  .from("incidents")
  .insert(payload)
  .select()
  .single();
```

**Note :** Pour les `as any` sur les clés i18n (12 instances), utiliser un cast plus précis :
```typescript
// Avant : t(`org.plans.${org.plan}` as any)
// Après : t(`org.plans.${org.plan}` as `org.plans.${string}`)
// Ou simplement : String(t(`org.plans.${org.plan}`))
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: élimination des as any dans les hooks Supabase`

---

## Axe E — Extraire composants et splitter pages (~4h)

### Task E1: Extraire MessageBubble partagé

**Files:**
- Create: `src/portail/components/ChatMessageBubble.tsx`
- Modify: `src/portail/components/FloatingChat.tsx` — supprimer MessageBubble inline, importer
- Modify: `src/portail/components/AiChatPanel.tsx` — supprimer MessageBubble inline, importer

```typescript
// src/portail/components/ChatMessageBubble.tsx
import ReactMarkdown from "react-markdown";

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  variant?: "floating" | "panel";
}

export function ChatMessageBubble({ role, content, variant = "floating" }: ChatMessageBubbleProps) {
  const isUser = role === "user";
  const userClass = variant === "floating"
    ? "bg-brand-forest text-white rounded-br-md"
    : "bg-brand-forest/10 text-foreground rounded-br-md";
  const aiClass = "bg-muted text-foreground rounded-bl-md";

  return (
    <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${isUser ? userClass : aiClass}`}>
      {isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}
    </div>
  );
}
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: extraction du composant ChatMessageBubble partagé`

---

### Task E2: Extraire les composants StatusBadge et ChartTooltip

**Files:**
- Create: `src/portail/components/StatusBadge.tsx`

```typescript
// src/portail/components/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { getColorClass } from "@/portail/constants/colors";

interface StatusBadgeProps {
  colorMap: Record<string, string>;
  value: string | undefined | null;
  label?: string;
  fallback?: string;
}

export function StatusBadge({ colorMap, value, label, fallback }: StatusBadgeProps) {
  return (
    <Badge className={getColorClass(colorMap, value, fallback)}>
      {label ?? value ?? "—"}
    </Badge>
  );
}
```

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: extraction des composants StatusBadge et ChartTooltip`

---

### Task E3: Splitter les pages > 900 LOC en sous-composants

**Files:**
- Create: `src/portail/components/governance/PoliciesTab.tsx`
- Create: `src/portail/components/governance/RolesTab.tsx`
- Create: `src/portail/components/governance/CommitteesTab.tsx`
- Modify: `src/portail/pages/GovernancePage.tsx` — importer les 3 onglets
- Create: `src/portail/components/transparency/RegistryTab.tsx`
- Create: `src/portail/components/transparency/ContestationsTab.tsx`
- Modify: `src/portail/pages/TransparencyPage.tsx` — importer les 2 onglets
- Create: `src/portail/components/data/DatasetsTab.tsx`
- Create: `src/portail/components/data/TransfersTab.tsx`
- Modify: `src/portail/pages/DataPage.tsx` — importer les 2 onglets

**Pattern :** Extraire chaque fonction de contenu d'onglet en composant séparé, en passant les données et callbacks via props.

Chaque composant d'onglet reçoit :
- Les données (items, isLoading, etc.)
- Les mutations (create, update, delete)
- L'état du formulaire (form dialog state)
- Les permissions (readOnly flag)

**Verify:** `npx tsc --noEmit`

**Commit:** `refactor: split des pages GovernancePage, TransparencyPage, DataPage en sous-composants`

---

## Axe F — Permissions navigation + 404 (~2h)

### Task F1: Filtrer les items de navigation par permission

**Files:**
- Modify: `src/portail/layout/AppSidebar.tsx`

Ajouter le filtrage par permission dans AppSidebar. Le champ `permission` existe déjà dans `NavItem` et est assigné sur 7 items dans `nav-config.ts`.

```typescript
// Dans AppSidebar.tsx, ajouter :
import { usePermissions } from "@/hooks/usePermissions";

// Dans le composant :
const { can } = usePermissions();

// Filtrer les items par permission
const displayGroups = navGroups.map((group) => ({
  ...group,
  items: group.items.filter(
    (item) => !item.permission || can(item.permission)
  ),
})).filter((group) => group.items.length > 0);
```

**Verify:** `npx tsc --noEmit`

**Commit:** `feat: filtrage des items de navigation par permission utilisateur`

---

### Task F2: Masquer le lien Admin par permission

**Files:**
- Modify: `src/portail/layout/AppHeader.tsx`

Dans le dropdown utilisateur, conditionner l'affichage du lien Admin :

```typescript
import { usePermissions } from "@/hooks/usePermissions";

// Dans le composant AppHeader :
const { can } = usePermissions();

// Dans le DropdownMenu, entourer le lien Admin :
{can("manage_organization") && (
  <DropdownMenuItem asChild>
    <Link to="/admin">...</Link>
  </DropdownMenuItem>
)}
```

**Verify:** `npx tsc --noEmit`

**Commit:** `feat: masquage du lien Admin selon les permissions`

---

### Task F3: Ajouter une route 404

**Files:**
- Create: `src/pages/NotFoundPage.tsx`
- Modify: `src/App.tsx`

```typescript
// src/pages/NotFoundPage.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-brand-forest mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link to="/"><Home className="mr-2 h-4 w-4" /> Retour à l'accueil</Link>
      </Button>
    </div>
  );
}
```

Dans `App.tsx`, ajouter comme dernière route dans `<Routes>` :
```tsx
<Route path="*" element={<NotFoundPage />} />
```

**Verify:** `npx tsc --noEmit` + naviguer vers une URL invalide

**Commit:** `feat: ajout page 404 pour les routes non trouvées`

---

## Résumé d'exécution

| Axe | Tasks | Estimé | Dépendances | Parallélisable |
|-----|-------|--------|-------------|----------------|
| **A** | A1, A2, A3, A4 | ~3h | Aucune | Oui (agent 1) |
| **B** | B1, B2, B3 | ~6h | Aucune | Oui (agent 2) |
| **C** | C1, C2 | ~4h | Aucune | Oui (agent 3) |
| **D** | D1, D2 | ~3h | Aucune | Oui (agent 4) |
| **E** | E1, E2, E3 | ~4h | A (pour E2 StatusBadge) | Après A |
| **F** | F1, F2, F3 | ~2h | Aucune | Oui (agent 5) |

**Total séquentiel :** ~22h
**Total parallèle (5 agents) :** ~6h agent + ~1h review = **~3-4h temps réel**

### Ordre recommandé avec multi-agent :

**Vague 1 (parallèle) :** A + B + C + D + F → 5 agents simultanés
**Vague 2 (séquentiel) :** E → après que A soit terminé (E2 dépend des couleurs centralisées)
**Vague 3 :** Build final + review globale
