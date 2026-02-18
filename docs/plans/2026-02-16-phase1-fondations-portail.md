# Phase 1 — Fondations du Portail SaaS

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mettre en place les fondations multi-tenant, RBAC, layout portail avec sidebar 15 modules, et les composants UI transversaux pour supporter tous les modules métier.

**Architecture:** Multi-tenant avec `organization_id` sur toutes les tables, RLS Supabase, JWT custom claims pour `organization_id` et `role`. Layout portail avec sidebar collapsible, header avec notifications et recherche. Composants UI réutilisables (DataTable, FormWizard, StatusBadge, etc.).

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui, Supabase (PostgreSQL + Auth + Storage + Edge Functions), TanStack Query, TanStack Table, react-router-dom 7, i18next, date-fns.

**Scope:** Portail uniquement (pas le site vitrine). Routes `/portail/*` renommées vers les routes spec (`/dashboard`, `/ai-systems`, etc.).

---

## Prérequis

### Dépendances à installer
```bash
npm install @tanstack/react-query @tanstack/react-table date-fns react-grid-layout sonner
npm install -D @types/react-grid-layout supabase
```

### Supabase CLI
```bash
npx supabase init
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

---

## Task 1: Initialiser Supabase CLI et la structure de migrations

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/seed.sql`

**Step 1: Initialiser Supabase dans le projet**

Run: `cd C:\Users\fbrom\OneDrive\Documents\gouvernance\gouvernance && npx supabase init`

Expected: Creates `supabase/` directory with `config.toml`.

**Step 2: Lier au projet Supabase distant**

Run: `npx supabase link --project-ref <PROJECT_REF>`

Note: Trouver le PROJECT_REF dans les variables d'env Netlify ou le dashboard Supabase. L'URL Supabase est de la forme `https://<PROJECT_REF>.supabase.co`.

**Step 3: Commit**

```bash
git add supabase/
git commit -m "chore: init supabase CLI structure"
```

---

## Task 2: Migration — Table `organizations`

**Files:**
- Create: `supabase/migrations/20260216000001_create_organizations.sql`

**Step 1: Écrire la migration**

```sql
-- Table organizations (tenant principal)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sector TEXT,
  size TEXT CHECK (size IN ('1-50', '51-200', '201-1000', '1001-5000', '5000+')),
  country TEXT DEFAULT 'Canada',
  province TEXT DEFAULT 'Québec',
  logo_url TEXT,
  settings JSONB DEFAULT '{
    "enabled_frameworks": ["loi_25"],
    "default_language": "fr",
    "review_frequency_default": "semi_annual",
    "notification_preferences": {}
  }'::jsonb,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policy: les membres d'une org peuvent la voir
CREATE POLICY "select_own_organization" ON public.organizations
  FOR SELECT USING (
    id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Policy: seul org_admin peut modifier
CREATE POLICY "update_own_organization" ON public.organizations
  FOR UPDATE USING (
    id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin')
  );
```

**Step 2: Appliquer la migration**

Run: `npx supabase db push`

Expected: Migration applied successfully.

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add organizations table with RLS"
```

---

## Task 3: Migration — Table `user_roles` et mise à jour `profiles`

**Files:**
- Create: `supabase/migrations/20260216000002_create_user_roles_and_update_profiles.sql`

**Step 1: Écrire la migration**

```sql
-- Table user_roles (RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN (
    'super_admin', 'org_admin', 'compliance_officer', 'risk_manager',
    'data_scientist', 'ethics_officer', 'auditor', 'member'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE TRIGGER on_user_roles_updated
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Ajouter organization_id au profil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_user_roles_same_org" ON public.user_roles
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "manage_user_roles_admin" ON public.user_roles
  FOR ALL USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin')
  );

-- Mettre à jour RLS de profiles pour ajouter le filtre org
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop les anciennes policies si elles existent (le projet existant peut en avoir)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recréer des policies compatibles multi-tenant
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_select_same_org" ON public.profiles
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
```

**Step 2: Appliquer la migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add user_roles table, add organization_id to profiles"
```

---

## Task 4: Migration — Fonction pour injecter les custom claims dans le JWT

**Files:**
- Create: `supabase/migrations/20260216000003_jwt_custom_claims.sql`

**Step 1: Écrire la migration**

```sql
-- Fonction qui retourne les custom claims pour le JWT
-- Supabase appelle cette fonction automatiquement si elle existe
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_org_id uuid;
  user_role text;
BEGIN
  claims := event -> 'claims';

  -- Récupérer l'organization_id et le rôle depuis user_roles
  SELECT ur.organization_id, ur.role
  INTO user_org_id, user_role
  FROM public.user_roles ur
  WHERE ur.user_id = (event ->> 'user_id')::uuid
  LIMIT 1;

  -- Injecter dans les claims
  IF user_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(user_org_id::text));
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;

-- Autoriser Supabase Auth à appeler cette fonction
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
```

Note: Après avoir appliqué cette migration, il faut activer le hook dans le dashboard Supabase :
Dashboard > Authentication > Hooks > Custom Access Token > Activer > Sélectionner `custom_access_token_hook`.

**Step 2: Appliquer et activer**

Run: `npx supabase db push`

Then manually enable the hook in the Supabase Dashboard.

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add JWT custom claims hook for org_id and role"
```

---

## Task 5: Migration — Table `audit_logs`

**Files:**
- Create: `supabase/migrations/20260216000004_create_audit_logs.sql`

**Step 1: Écrire la migration**

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'view', 'export',
    'approve', 'reject', 'submit', 'login', 'logout'
  )),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_audit_logs_authorized" ON public.audit_logs
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'auditor')
  );

-- Seul le système peut insérer (via service_role ou function)
CREATE POLICY "insert_audit_logs_system" ON public.audit_logs
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Les audit logs ne sont JAMAIS modifiables ni supprimables
-- (pas de policy UPDATE ni DELETE = interdit)
```

**Step 2: Appliquer**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add immutable audit_logs table with RLS"
```

---

## Task 6: Migration — Table `notifications`

**Files:**
- Create: `supabase/migrations/20260216000005_create_notifications.sql`

**Step 1: Écrire la migration**

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN (
    'alert', 'reminder', 'approval_request', 'info', 'escalation'
  )),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_org ON public.notifications(organization_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "update_own_notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "insert_notifications_same_org" ON public.notifications
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Activer Realtime sur cette table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

**Step 2: Appliquer**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add notifications table with realtime"
```

---

## Task 7: Installer les dépendances frontend

**Step 1: Installer les packages**

Run:
```bash
cd C:\Users\fbrom\OneDrive\Documents\gouvernance\gouvernance
npm install @tanstack/react-query @tanstack/react-table date-fns sonner
```

**Step 2: Installer les composants shadcn manquants**

Run:
```bash
npx shadcn@latest add dialog dropdown-menu tooltip select command scroll-area skeleton avatar popover checkbox radio-group switch progress toast sonner table form
```

Note: Certains composants existent peut-être déjà. shadcn les ignore s'ils existent.

**Step 3: Commit**

```bash
git add package.json package-lock.json src/components/ui/
git commit -m "chore: add tanstack query, tanstack table, date-fns, shadcn components"
```

---

## Task 8: Configurer TanStack Query et le client Supabase typé

**Files:**
- Create: `src/lib/query-client.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/main.tsx`
- Create: `src/types/database.ts`

**Step 1: Générer les types Supabase**

Run: `npx supabase gen types typescript --linked > src/types/database.ts`

Note: Si le lien n'est pas fait, utiliser `--project-id <id>` à la place de `--linked`.

**Step 2: Créer `src/lib/query-client.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 1,
    },
  },
});
```

**Step 3: Mettre à jour `src/lib/supabase.ts`**

Ajouter le typage Database au client :

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient<Database> = supabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : (null as unknown as SupabaseClient<Database>)
```

**Step 4: Mettre à jour `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
```

**Step 5: Commit**

```bash
git add src/lib/query-client.ts src/types/database.ts src/lib/supabase.ts src/main.tsx
git commit -m "feat: add TanStack Query, typed Supabase client, toaster"
```

---

## Task 9: Hooks utilitaires — `useOrganization`, `useCurrentRole`, `usePermissions`

**Files:**
- Create: `src/hooks/useOrganization.ts`
- Create: `src/hooks/useCurrentRole.ts`
- Create: `src/hooks/usePermissions.ts`
- Create: `src/lib/permissions.ts`

**Step 1: Créer la matrice de permissions `src/lib/permissions.ts`**

```typescript
export const ROLES = [
  'super_admin', 'org_admin', 'compliance_officer', 'risk_manager',
  'data_scientist', 'ethics_officer', 'auditor', 'member',
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  manage_organization:   ['super_admin', 'org_admin'],
  manage_users:          ['super_admin', 'org_admin'],
  create_ai_system:      ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
  edit_ai_system:        ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
  view_ai_systems:       ROLES,
  assess_risks:          ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
  manage_incidents:      ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager', 'data_scientist', 'ethics_officer'],
  report_incident:       ROLES,
  manage_bias:           ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager', 'data_scientist', 'ethics_officer'],
  approve_decisions:     ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager', 'ethics_officer'],
  manage_compliance:     ['super_admin', 'org_admin', 'compliance_officer'],
  export_data:           ['super_admin', 'org_admin', 'compliance_officer', 'auditor'],
  view_audit_trail:      ['super_admin', 'org_admin', 'compliance_officer', 'auditor'],
  configure_monitoring:  ['super_admin', 'org_admin', 'risk_manager', 'data_scientist'],
  manage_policies:       ['super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'],
  manage_vendors:        ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}
```

**Step 2: Créer `src/hooks/useOrganization.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export function useOrganization() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}
```

**Step 3: Créer `src/hooks/useCurrentRole.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

export function useCurrentRole() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id, profile?.organization_id],
    queryFn: async () => {
      if (!user || !profile?.organization_id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", profile.organization_id)
        .single();
      if (error) return "member" as Role;
      return data.role as Role;
    },
    enabled: !!user && !!profile?.organization_id,
  });
}
```

**Step 4: Créer `src/hooks/usePermissions.ts`**

```typescript
import { useCurrentRole } from "./useCurrentRole";
import { hasPermission, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const { data: role } = useCurrentRole();

  return {
    role,
    can: (permission: Permission) => hasPermission(role ?? null, permission),
  };
}
```

**Step 5: Commit**

```bash
git add src/lib/permissions.ts src/hooks/
git commit -m "feat: add RBAC permissions matrix and hooks"
```

---

## Task 10: Nouveau layout portail — Sidebar 15 modules + Header

**Files:**
- Create: `src/portail/layout/AppSidebar.tsx`
- Create: `src/portail/layout/AppHeader.tsx`
- Modify: `src/portail/layout/PortailLayout.tsx`
- Modify: `src/i18n/locales/fr/portail.json`
- Modify: `src/i18n/locales/en/portail.json`

**Step 1: Mettre à jour les traductions `src/i18n/locales/fr/portail.json`**

```json
{
  "brandName": "gouvernance.ai",
  "nav": {
    "dashboard": "Tableau de bord",
    "aiSystems": "Systèmes IA",
    "governance": "Gouvernance",
    "risks": "Risques",
    "decisions": "Décisions",
    "bias": "Biais & Équité",
    "incidents": "Incidents",
    "transparency": "Transparence",
    "lifecycle": "Cycle de vie",
    "documents": "Documentation",
    "monitoring": "Monitoring",
    "data": "Données & EFVP",
    "vendors": "Fournisseurs",
    "compliance": "Conformité",
    "admin": "Administration",
    "profile": "Profil"
  },
  "sections": {
    "main": "Principal",
    "modules": "Modules",
    "settings": "Paramètres"
  },
  "backToSite": "Retour au site",
  "openMenu": "Ouvrir le menu",
  "collapseMenu": "Réduire le menu",
  "notifications": "Notifications",
  "noNotifications": "Aucune notification",
  "markAllRead": "Tout marquer comme lu",
  "search": "Rechercher...",
  "searchPlaceholder": "Rechercher un système, incident, décision..."
}
```

**Step 2: Mettre à jour `src/i18n/locales/en/portail.json`**

```json
{
  "brandName": "gouvernance.ai",
  "nav": {
    "dashboard": "Dashboard",
    "aiSystems": "AI Systems",
    "governance": "Governance",
    "risks": "Risks",
    "decisions": "Decisions",
    "bias": "Bias & Equity",
    "incidents": "Incidents",
    "transparency": "Transparency",
    "lifecycle": "Lifecycle",
    "documents": "Documentation",
    "monitoring": "Monitoring",
    "data": "Data & PIA",
    "vendors": "Vendors",
    "compliance": "Compliance",
    "admin": "Administration",
    "profile": "Profile"
  },
  "sections": {
    "main": "Main",
    "modules": "Modules",
    "settings": "Settings"
  },
  "backToSite": "Back to site",
  "openMenu": "Open menu",
  "collapseMenu": "Collapse menu",
  "notifications": "Notifications",
  "noNotifications": "No notifications",
  "markAllRead": "Mark all as read",
  "search": "Search...",
  "searchPlaceholder": "Search for a system, incident, decision..."
}
```

**Step 3: Créer `src/portail/layout/AppSidebar.tsx`**

```tsx
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import {
  LayoutDashboard, Bot, Users, AlertTriangle, ClipboardList,
  Scale, AlertCircle, Eye, RefreshCw, FileText, Activity,
  Database, Building2, CheckCircle, Settings, ChevronLeft,
  ChevronRight, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  key: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  section: "main" | "modules" | "settings";
}

const navItems: NavItem[] = [
  { key: "dashboard", path: "/dashboard", icon: LayoutDashboard, section: "main" },
  { key: "aiSystems", path: "/ai-systems", icon: Bot, section: "modules" },
  { key: "governance", path: "/governance", icon: Users, section: "modules", permission: "manage_policies" },
  { key: "risks", path: "/risks", icon: AlertTriangle, section: "modules", permission: "assess_risks" },
  { key: "decisions", path: "/decisions", icon: ClipboardList, section: "modules", permission: "approve_decisions" },
  { key: "bias", path: "/bias", icon: Scale, section: "modules", permission: "manage_bias" },
  { key: "incidents", path: "/incidents", icon: AlertCircle, section: "modules" },
  { key: "transparency", path: "/transparency", icon: Eye, section: "modules" },
  { key: "lifecycle", path: "/lifecycle", icon: RefreshCw, section: "modules" },
  { key: "documents", path: "/documents", icon: FileText, section: "modules" },
  { key: "monitoring", path: "/monitoring", icon: Activity, section: "modules", permission: "configure_monitoring" },
  { key: "data", path: "/data", icon: Database, section: "modules" },
  { key: "vendors", path: "/vendors", icon: Building2, section: "modules", permission: "manage_vendors" },
  { key: "compliance", path: "/compliance", icon: CheckCircle, section: "modules", permission: "manage_compliance" },
  { key: "admin", path: "/admin", icon: Settings, section: "settings", permission: "manage_organization" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { t } = useTranslation("portail");
  const location = useLocation();
  const { can } = usePermissions();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const renderSection = (section: "main" | "modules" | "settings") => {
    const items = navItems.filter((item) => {
      if (item.section !== section) return false;
      // Si permission requise et pas le droit, masquer
      if (item.permission && !can(item.permission as any)) return false;
      return true;
    });

    return items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.path);

      const linkContent = (
        <Link
          to={item.path}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            active
              ? "bg-brand-purple/10 text-brand-purple font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
        </Link>
      );

      if (collapsed) {
        return (
          <Tooltip key={item.key}>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right">{t(`nav.${item.key}`)}</TooltipContent>
          </Tooltip>
        );
      }

      return <div key={item.key}>{linkContent}</div>;
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-200",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        {/* Logo / Brand */}
        <div className={cn("flex items-center gap-2 border-b px-3 h-14", collapsed && "justify-center")}>
          <div className="h-7 w-7 rounded-lg bg-brand-purple flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">{t("brandName")}</span>
          )}
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className="flex flex-col gap-1 px-2">
            {/* Main */}
            {renderSection("main")}

            <Separator className="my-2" />

            {/* Modules */}
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                {t("sections.modules")}
              </span>
            )}
            {renderSection("modules")}

            <Separator className="my-2" />

            {/* Settings */}
            {renderSection("settings")}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {!collapsed && <span>{t("backToSite")}</span>}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full mt-1"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-xs">{t("collapseMenu")}</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
```

**Step 4: Créer `src/portail/layout/AppHeader.tsx`**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { Bell, Search, Menu, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageSwitcher from "@/portail/components/LanguageSwitcher";
import { Link } from "react-router-dom";

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}

export function AppHeader({ onMobileMenuToggle }: AppHeaderProps) {
  const { t } = useTranslation("portail");
  const { t: tc } = useTranslation("common");
  const { user, profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="flex items-center justify-between border-b bg-card px-4 h-14">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: notifications, language, user */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        {/* Notifications bell */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-brand-purple/10 text-brand-purple">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                {profile?.full_name ?? tc("user")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("nav.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("nav.admin")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              {tc("signOutShort")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

**Step 5: Réécrire `src/portail/layout/PortailLayout.tsx`**

```tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function PortailLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add src/portail/layout/ src/i18n/locales/
git commit -m "feat: new portal layout with 15-module sidebar, header, responsive"
```

---

## Task 11: Mettre à jour le routeur avec les routes spec

**Files:**
- Modify: `src/App.tsx`
- Create: `src/portail/pages/PlaceholderPage.tsx`

**Step 1: Créer une page placeholder pour les modules pas encore implémentés**

`src/portail/pages/PlaceholderPage.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PlaceholderPage() {
  const { t } = useTranslation("portail");
  const location = useLocation();

  // Extraire le nom du module depuis le path
  const segment = location.pathname.split("/").filter(Boolean).pop() ?? "";
  const moduleNames: Record<string, string> = {
    "ai-systems": "nav.aiSystems",
    governance: "nav.governance",
    risks: "nav.risks",
    decisions: "nav.decisions",
    bias: "nav.bias",
    incidents: "nav.incidents",
    transparency: "nav.transparency",
    lifecycle: "nav.lifecycle",
    documents: "nav.documents",
    monitoring: "nav.monitoring",
    data: "nav.data",
    vendors: "nav.vendors",
    compliance: "nav.compliance",
    admin: "nav.admin",
  };

  const moduleName = moduleNames[segment] ? t(moduleNames[segment]) : segment;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
            <Construction className="h-8 w-8 text-brand-purple" />
          </div>
          <h2 className="text-xl font-semibold">{moduleName}</h2>
          <p className="text-muted-foreground text-sm">
            Ce module est en cours de développement et sera disponible prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Mettre à jour `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/ProtectedRoute";

// Site vitrine
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { AProposPage } from "@/pages/AProposPage";
import { ExpertsPage } from "@/pages/ExpertsPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { RessourcesPage } from "@/pages/RessourcesPage";
import { EvenementsPage } from "@/pages/EvenementsPage";
import { RejoindrePage } from "@/pages/RejoindrePage";
import { OrganisationsPage } from "@/pages/OrganisationsPage";
import { ActualitesPage } from "@/pages/ActualitesPage";
import { ContactPage } from "@/pages/ContactPage";
import { ConfidentialitePage } from "@/pages/ConfidentialitePage";
import { MentionsLegalesPage } from "@/pages/MentionsLegalesPage";
import { AccessibilitePage } from "@/pages/AccessibilitePage";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";

// Portail
import { PortailLayout } from "@/portail/layout/PortailLayout";
import DashboardPage from "@/portail/pages/DashboardPage";
import ProfilPage from "@/portail/pages/ProfilPage";
import ConditionsPage from "@/portail/pages/ConditionsPage";
import PlaceholderPage from "@/portail/pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Site vitrine */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/a-propos" element={<AProposPage />} />
            <Route path="/experts" element={<ExpertsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/ressources" element={<RessourcesPage />} />
            <Route path="/evenements" element={<EvenementsPage />} />
            <Route path="/rejoindre" element={<RejoindrePage />} />
            <Route path="/organisations" element={<OrganisationsPage />} />
            <Route path="/actualites" element={<ActualitesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/confidentialite" element={<ConfidentialitePage />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="/accessibilite" element={<AccessibilitePage />} />
          </Route>

          {/* Auth pages */}
          <Route element={<Layout />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
          </Route>

          {/* OAuth callback */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Portail SaaS (protégé) */}
          <Route element={<ProtectedRoute />}>
            {/* CGU (hors layout portail) */}
            <Route path="/conditions" element={<ConditionsPage />} />

            <Route element={<PortailLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilPage />} />

              {/* Modules — placeholder pour l'instant */}
              <Route path="/ai-systems" element={<PlaceholderPage />} />
              <Route path="/governance" element={<PlaceholderPage />} />
              <Route path="/risks" element={<PlaceholderPage />} />
              <Route path="/decisions" element={<PlaceholderPage />} />
              <Route path="/bias" element={<PlaceholderPage />} />
              <Route path="/incidents" element={<PlaceholderPage />} />
              <Route path="/transparency" element={<PlaceholderPage />} />
              <Route path="/lifecycle" element={<PlaceholderPage />} />
              <Route path="/documents" element={<PlaceholderPage />} />
              <Route path="/monitoring" element={<PlaceholderPage />} />
              <Route path="/data" element={<PlaceholderPage />} />
              <Route path="/vendors" element={<PlaceholderPage />} />
              <Route path="/compliance" element={<PlaceholderPage />} />
              <Route path="/admin" element={<PlaceholderPage />} />
            </Route>

            {/* Redirects anciennes routes */}
            <Route path="/portail" element={<Navigate to="/dashboard" replace />} />
            <Route path="/portail/profil" element={<Navigate to="/profile" replace />} />
            <Route path="/portail/conditions" element={<Navigate to="/conditions" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

**Step 3: Mettre à jour `src/lib/ProtectedRoute.tsx`** pour les nouvelles routes

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;

  if (profile && !profile.cgu_accepted && location.pathname !== "/conditions") {
    return <Navigate to="/conditions" replace />;
  }

  return <Outlet />;
}
```

**Step 4: Commit**

```bash
git add src/App.tsx src/lib/ProtectedRoute.tsx src/portail/pages/PlaceholderPage.tsx
git commit -m "feat: update routing to spec paths, add placeholder pages for all 15 modules"
```

---

## Task 12: Composants UI réutilisables — StatusBadge, EmptyState, LoadingSkeleton

**Files:**
- Create: `src/components/shared/StatusBadge.tsx`
- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/PageHeader.tsx`

**Step 1: Créer `src/components/shared/StatusBadge.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  // Lifecycle
  idea: "bg-gray-100 text-gray-700 border-gray-200",
  pilot: "bg-blue-50 text-blue-700 border-blue-200",
  development: "bg-indigo-50 text-indigo-700 border-indigo-200",
  testing: "bg-amber-50 text-amber-700 border-amber-200",
  production: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  // Risk levels
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-green-50 text-green-700 border-green-200",
  minimal: "bg-green-50 text-green-700 border-green-200",
  limited: "bg-amber-50 text-amber-700 border-amber-200",
  prohibited: "bg-red-100 text-red-800 border-red-300",
  // Workflow
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
  // Compliance
  compliant: "bg-green-50 text-green-700 border-green-200",
  partially_compliant: "bg-amber-50 text-amber-700 border-amber-200",
  non_compliant: "bg-red-50 text-red-700 border-red-200",
  not_applicable: "bg-gray-100 text-gray-600 border-gray-200",
  // Generic
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", variants[status] ?? variants.draft, className)}
    >
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}
```

**Step 2: Créer `src/components/shared/EmptyState.tsx`**

```tsx
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
```

**Step 3: Créer `src/components/shared/PageHeader.tsx`**

```tsx
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 mt-2 sm:mt-0">{actions}</div>}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add reusable StatusBadge, EmptyState, PageHeader components"
```

---

## Task 13: Hook `useAuditLog` pour logger les actions

**Files:**
- Create: `src/hooks/useAuditLog.ts`

**Step 1: Créer le hook**

```typescript
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface AuditLogEntry {
  action: "create" | "update" | "delete" | "view" | "export" | "approve" | "reject" | "submit";
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export function useAuditLog() {
  const { user, profile } = useAuth();

  const log = async (entry: AuditLogEntry) => {
    if (!user || !profile?.organization_id) return;

    await supabase.from("audit_logs").insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      changes: entry.changes,
    });
  };

  return { log };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useAuditLog.ts
git commit -m "feat: add useAuditLog hook for immutable audit trail"
```

---

## Task 14: Hook `useNotifications` avec Realtime

**Files:**
- Create: `src/hooks/useNotifications.ts`

**Step 1: Créer le hook**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], ...query } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user!.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  return {
    notifications,
    unreadCount,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    ...query,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useNotifications.ts
git commit -m "feat: add useNotifications hook with Supabase Realtime"
```

---

## Task 15: Mettre à jour le DashboardPage pour le nouveau layout

**Files:**
- Modify: `src/portail/pages/DashboardPage.tsx`
- Modify: `src/i18n/locales/fr/dashboard.json`
- Modify: `src/i18n/locales/en/dashboard.json`

**Step 1: Mettre à jour les traductions `src/i18n/locales/fr/dashboard.json`**

```json
{
  "title": "Tableau de bord",
  "welcome": "Bienvenue, {{firstName}}",
  "welcomeFallback": "là",
  "description": "Vue d'ensemble de votre gouvernance IA.",
  "quickAccess": "Accès rapide",
  "stats": {
    "aiSystems": "Systèmes IA",
    "complianceScore": "Score de conformité",
    "activeIncidents": "Incidents actifs",
    "pendingAlerts": "Alertes en attente"
  },
  "noOrg": "Aucune organisation",
  "noOrgDescription": "Vous n'êtes rattaché à aucune organisation. Contactez votre administrateur ou créez une organisation.",
  "createOrg": "Créer une organisation",
  "modules": {
    "aiSystems": { "title": "Systèmes IA", "description": "Gérer le registre de vos systèmes IA" },
    "risks": { "title": "Risques", "description": "Évaluer et suivre les risques" },
    "compliance": { "title": "Conformité", "description": "Suivre votre conformité multi-référentiels" },
    "incidents": { "title": "Incidents", "description": "Déclarer et gérer les incidents" }
  }
}
```

**Step 2: Mettre à jour `src/i18n/locales/en/dashboard.json`**

```json
{
  "title": "Dashboard",
  "welcome": "Welcome, {{firstName}}",
  "welcomeFallback": "there",
  "description": "Overview of your AI governance.",
  "quickAccess": "Quick access",
  "stats": {
    "aiSystems": "AI Systems",
    "complianceScore": "Compliance Score",
    "activeIncidents": "Active Incidents",
    "pendingAlerts": "Pending Alerts"
  },
  "noOrg": "No organization",
  "noOrgDescription": "You are not attached to any organization. Contact your administrator or create one.",
  "createOrg": "Create an organization",
  "modules": {
    "aiSystems": { "title": "AI Systems", "description": "Manage your AI systems registry" },
    "risks": { "title": "Risks", "description": "Assess and monitor risks" },
    "compliance": { "title": "Compliance", "description": "Track your multi-framework compliance" },
    "incidents": { "title": "Incidents", "description": "Report and manage incidents" }
  }
}
```

**Step 3: Réécrire `src/portail/pages/DashboardPage.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "@/hooks/useOrganization";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertTriangle, CheckCircle, AlertCircle, Building2 } from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { profile } = useAuth();
  const { data: org, isLoading } = useOrganization();

  const firstName = profile?.full_name?.split(" ")[0] ?? t("welcomeFallback");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Pas d'organisation rattachée
  if (!profile?.organization_id || !org) {
    return (
      <EmptyState
        icon={Building2}
        title={t("noOrg")}
        description={t("noOrgDescription")}
      />
    );
  }

  const statCards = [
    { key: "aiSystems", icon: Bot, value: "—", path: "/ai-systems" },
    { key: "complianceScore", icon: CheckCircle, value: "—", path: "/compliance" },
    { key: "activeIncidents", icon: AlertCircle, value: "—", path: "/incidents" },
    { key: "pendingAlerts", icon: AlertTriangle, value: "—", path: "/monitoring" },
  ];

  const quickModules = [
    { key: "aiSystems", icon: Bot, path: "/ai-systems" },
    { key: "risks", icon: AlertTriangle, path: "/risks" },
    { key: "compliance", icon: CheckCircle, path: "/compliance" },
    { key: "incidents", icon: AlertCircle, path: "/incidents" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("welcome", { firstName })}
        description={t("description")}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.key} to={stat.path}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{t(`stats.${stat.key}`)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{t("quickAccess")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.key} to={mod.path}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-purple" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm">{t(`modules.${mod.key}.title`)}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`modules.${mod.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/portail/pages/DashboardPage.tsx src/i18n/locales/
git commit -m "feat: update dashboard with KPI cards and org-aware layout"
```

---

## Task 16: Mettre à jour les i18n namespaces dans la config

**Files:**
- Modify: `src/i18n/index.ts`

**Step 1: Ajouter les nouveaux namespaces pour les modules futurs**

Le fichier `src/i18n/index.ts` doit référencer tous les namespaces existants. Pour l'instant, garder les 5 existants et s'assurer que la structure est correcte. Les namespaces des modules seront ajoutés quand les modules seront implémentés.

Pas de changement nécessaire pour l'instant — la config actuelle est correcte.

**Step 2: Commit** — skip si rien n'a changé.

---

## Task 17: Sécurité — Ajouter CSP et HSTS dans netlify.toml

**Files:**
- Modify: `netlify.toml`

**Step 1: Ajouter les headers de sécurité manquants**

Modifier la section `[[headers]]` pour `/*` :

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'"
```

**Step 2: Commit**

```bash
git add netlify.toml
git commit -m "security: add CSP and HSTS headers to netlify.toml"
```

---

## Task 18: Fix domaine — Mettre à jour les canonicals vers gouvernance.ai

**Files:**
- Modify: `index.html` (dans `dist/` — mais en réalité c'est le `index.html` source)

**Step 1: Identifier le fichier source**

Le `index.html` est probablement à la racine du projet (pas dans `dist/`). Chercher et remplacer toutes les occurrences de `gouvernance-ia.ca` par `gouvernance.ai`.

Run: Grep pour `gouvernance-ia.ca` dans le projet et remplacer par `gouvernance.ai`.

**Step 2: Commit**

```bash
git add index.html
git commit -m "fix: update all canonical/OG URLs from gouvernance-ia.ca to gouvernance.ai"
```

---

## Task 19: Build et vérification

**Step 1: Vérifier que le build passe**

Run:
```bash
cd C:\Users\fbrom\OneDrive\Documents\gouvernance\gouvernance
npm run build
```

Expected: Build successful, no TypeScript errors.

**Step 2: Fix les erreurs éventuelles**

Si des erreurs TypeScript apparaissent, les corriger.

**Step 3: Test local**

Run: `npm run dev`

Vérifier :
- [ ] Le portail charge à `/dashboard`
- [ ] La sidebar affiche les 15 modules
- [ ] Cliquer sur un module ouvre la page placeholder
- [ ] La sidebar se collapse/expand
- [ ] Le menu mobile fonctionne
- [ ] Le language switcher FR/EN fonctionne
- [ ] Le redirect `/portail` → `/dashboard` fonctionne

**Step 4: Commit final si des fixes ont été nécessaires**

```bash
git add -A
git commit -m "fix: resolve build issues from Phase 1 implementation"
```

---

## Résumé des Tasks

| # | Description | Fichiers clés |
|---|-------------|---------------|
| 1 | Init Supabase CLI | `supabase/config.toml` |
| 2 | Migration `organizations` | `migrations/...create_organizations.sql` |
| 3 | Migration `user_roles` + update `profiles` | `migrations/...user_roles.sql` |
| 4 | JWT custom claims hook | `migrations/...jwt_custom_claims.sql` |
| 5 | Migration `audit_logs` | `migrations/...audit_logs.sql` |
| 6 | Migration `notifications` | `migrations/...notifications.sql` |
| 7 | Install deps (TanStack, date-fns, shadcn) | `package.json` |
| 8 | TanStack Query + typed Supabase | `query-client.ts`, `supabase.ts`, `main.tsx` |
| 9 | RBAC hooks (permissions, role, org) | `permissions.ts`, `hooks/` |
| 10 | Nouveau layout portail (sidebar 15 modules) | `AppSidebar.tsx`, `AppHeader.tsx`, `PortailLayout.tsx` |
| 11 | Routes spec + placeholders | `App.tsx`, `PlaceholderPage.tsx` |
| 12 | Composants réutilisables (StatusBadge, etc.) | `components/shared/` |
| 13 | Hook audit log | `useAuditLog.ts` |
| 14 | Hook notifications + Realtime | `useNotifications.ts` |
| 15 | DashboardPage org-aware | `DashboardPage.tsx` |
| 16 | i18n config update | `i18n/index.ts` |
| 17 | Headers sécurité (CSP, HSTS) | `netlify.toml` |
| 18 | Fix domaine gouvernance.ai | `index.html` |
| 19 | Build + vérification | — |
