# Sidebar Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réorganiser le menu sidebar du portail en 5 groupes intuitifs pour CTO/DPO, et déplacer Organisation dans le dropdown profil du header.

**Architecture:** Restructurer `nav-config.ts` (5 nouveaux groupes), mettre à jour les traductions i18n, ajouter Membres au dropdown profil dans `AppHeader.tsx`, adapter `AppIconRail.tsx`.

**Tech Stack:** React, TypeScript, i18next, Lucide React icons

---

### Task 1: Restructurer nav-config.ts

**Files:**
- Modify: `src/portail/layout/nav-config.ts`

**Step 1: Replace CATEGORY_ICONS and navGroups**

Replace the entire content of `nav-config.ts` with:

```typescript
import type { Permission } from "@/lib/permissions";
import {
  LayoutDashboard,
  Bot,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  Scale,
  AlertCircle,
  Eye,
  RefreshCw,
  FileText,
  Activity,
  Database,
  Building2,
  CheckCircle,
  Newspaper,
  BookOpen,
  Library,
  Shield,
} from "lucide-react";

export interface NavItem {
  key: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  ready?: boolean;
  badge?: string;
}

export interface NavGroup {
  /** Translation key for the group label (e.g. "sections.overview") */
  labelKey: string;
  /** Category identifier used by the icon rail */
  category: string;
  items: NavItem[];
}

/** Icon used to represent each category in the icon rail */
export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  inventory: Bot,
  risks: AlertTriangle,
  compliance: ShieldCheck,
  resources: BookOpen,
};

export const navGroups: NavGroup[] = [
  {
    labelKey: "sections.dashboard",
    category: "dashboard",
    items: [
      { key: "dashboard", path: "/dashboard", icon: LayoutDashboard, ready: true },
    ],
  },
  {
    labelKey: "sections.inventory",
    category: "inventory",
    items: [
      { key: "aiSystems", path: "/ai-systems", icon: Bot, ready: true },
      { key: "lifecycle", path: "/lifecycle", icon: RefreshCw, ready: true },
      { key: "vendors", path: "/vendors", icon: Building2, permission: "manage_vendors", ready: true },
      { key: "agents", path: "/agents", icon: Bot, ready: true },
      { key: "agentTraces", path: "/agent-traces", icon: Activity, ready: true },
    ],
  },
  {
    labelKey: "sections.risks",
    category: "risks",
    items: [
      { key: "risks", path: "/risks", icon: AlertTriangle, permission: "assess_risks", ready: true },
      { key: "bias", path: "/bias", icon: Scale, permission: "manage_bias", ready: true },
      { key: "incidents", path: "/incidents", icon: AlertCircle, ready: true },
    ],
  },
  {
    labelKey: "sections.compliance",
    category: "compliance",
    items: [
      { key: "governance", path: "/governance", icon: Shield, permission: "manage_policies", ready: true },
      { key: "compliance", path: "/compliance", icon: CheckCircle, permission: "manage_compliance", ready: true },
      { key: "decisions", path: "/decisions", icon: ClipboardCheck, permission: "approve_decisions", ready: true },
      { key: "transparency", path: "/transparency", icon: Eye, ready: true },
      { key: "monitoring", path: "/monitoring", icon: Activity, permission: "configure_monitoring", ready: true },
      { key: "data", path: "/data", icon: Database, ready: true },
    ],
  },
  {
    labelKey: "sections.resources",
    category: "resources",
    items: [
      { key: "documents", path: "/documents", icon: FileText, ready: true },
      { key: "veille", path: "/veille", icon: Newspaper, ready: true, badge: "IA" },
      { key: "bibliotheque", path: "/bibliotheque", icon: BookOpen, ready: true },
      { key: "modeles", path: "/modeles", icon: Library, ready: true },
    ],
  },
];

/**
 * Given a pathname (e.g. "/risks/123"), returns the matching category key.
 * Falls back to "dashboard" if no match.
 */
export function getCategoryForPath(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.path || pathname.startsWith(item.path + "/")) {
        return group.category;
      }
    }
  }
  return "dashboard";
}
```

Note: Removed imports `Users`, `CreditCard`, `Map` (moved to header dropdown). Changed fallback from `"home"` to `"dashboard"`.

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: May show errors in AppIconRail.tsx or other files referencing old category keys — those are fixed in subsequent tasks.

**Step 3: Commit**

```bash
git add src/portail/layout/nav-config.ts
git commit -m "refactor: restructure nav-config en 5 groupes (dashboard, inventaire, risques, conformité, ressources)"
```

---

### Task 2: Mettre à jour les traductions i18n

**Files:**
- Modify: `src/i18n/locales/fr/portail.json`
- Modify: `src/i18n/locales/en/portail.json`

**Step 1: Update French translations**

In `src/i18n/locales/fr/portail.json`, replace the `sections` object with:

```json
"sections": {
  "dashboard": "Tableau de bord",
  "inventory": "Inventaire",
  "risks": "Risques",
  "compliance": "Conformité",
  "resources": "Ressources",
  "settings": "Paramètres",
  "main": "Principal",
  "modules": "Modules"
}
```

And replace the `rail` object with:

```json
"rail": {
  "dashboard": "Accueil",
  "inventory": "Inventaire",
  "risks": "Risques",
  "compliance": "Conformité",
  "resources": "Ressources",
  "backToSite": "Site",
  "settings": "Profil"
}
```

**Step 2: Update English translations**

In `src/i18n/locales/en/portail.json`, replace the `sections` object with:

```json
"sections": {
  "dashboard": "Dashboard",
  "inventory": "Inventory",
  "risks": "Risks",
  "compliance": "Compliance",
  "resources": "Resources",
  "settings": "Settings",
  "main": "Main",
  "modules": "Modules"
}
```

And replace the `rail` object with:

```json
"rail": {
  "dashboard": "Home",
  "inventory": "Inventory",
  "risks": "Risks",
  "compliance": "Compliance",
  "resources": "Resources",
  "backToSite": "Site",
  "settings": "Profile"
}
```

**Step 3: Commit**

```bash
git add src/i18n/locales/fr/portail.json src/i18n/locales/en/portail.json
git commit -m "i18n: mise à jour des traductions sidebar (5 groupes)"
```

---

### Task 3: Mettre à jour AppHeader.tsx — ajouter Membres au dropdown

**Files:**
- Modify: `src/portail/layout/AppHeader.tsx`

**Step 1: Add missing imports**

Add `Users, Map, Building2` to the lucide-react import (line 5). The current import is:

```typescript
import { Bell, Menu, LogOut, User, Settings, Check, ChevronRight, Rocket, CreditCard } from "lucide-react";
```

Replace with:

```typescript
import { Bell, Menu, LogOut, User, Settings, Check, ChevronRight, Rocket, CreditCard, Users, Map, Building2 } from "lucide-react";
```

**Step 2: Add Membres item to dropdown**

In the `<DropdownMenuContent>` (around line 245-275), the current order is:
1. Profil
2. Facturation
3. Admin
4. Roadmap
5. ---separator---
6. Déconnexion

Replace the dropdown content with this order:
1. Profil
2. ---separator---
3. Membres
4. Admin
5. Facturation
6. Roadmap
7. ---separator---
8. Déconnexion

The JSX for the dropdown items should be:

```tsx
<DropdownMenuContent align="end" className="w-48 shadow-lg">
  <DropdownMenuItem asChild>
    <Link to="/profile" className="flex items-center gap-2">
      <User className="h-4 w-4" />
      {t("nav.profile")}
    </Link>
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem asChild>
    <Link to="/membres" className="flex items-center gap-2">
      <Users className="h-4 w-4" />
      {t("nav.members")}
    </Link>
  </DropdownMenuItem>
  <DropdownMenuItem asChild>
    <Link to="/admin" className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      {t("nav.admin")}
    </Link>
  </DropdownMenuItem>
  <DropdownMenuItem asChild>
    <Link to="/billing" className="flex items-center gap-2">
      <CreditCard className="h-4 w-4" />
      {t("nav.billing")}
    </Link>
  </DropdownMenuItem>
  <DropdownMenuItem asChild>
    <Link to="/roadmap" className="flex items-center gap-2">
      <Map className="h-4 w-4" />
      {t("nav.roadmap")}
    </Link>
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
    <LogOut className="h-4 w-4" />
    {tc("signOutShort")}
  </DropdownMenuItem>
</DropdownMenuContent>
```

Note: Changed Admin icon from `Settings` to `Building2`, Roadmap icon from `Rocket` to `Map`.

**Step 3: Add route labels for breadcrumbs**

In `ROUTE_LABELS` (line 60-79), add any missing entries. Ensure these keys exist:
- `agents: "nav.agents"`
- `"agent-traces": "nav.agentTraces"`
- `billing: "nav.billing"`
- `bibliotheque: "nav.bibliotheque"`
- `modeles: "nav.modeles"`
- `veille: "nav.veille"`

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: PASS (or errors only in files not yet updated)

**Step 5: Commit**

```bash
git add src/portail/layout/AppHeader.tsx
git commit -m "feat: ajout membres, admin, facturation, roadmap dans le dropdown profil"
```

---

### Task 4: Mettre à jour AppIconRail.tsx

**Files:**
- Modify: `src/portail/layout/AppIconRail.tsx`

**Step 1: No code changes needed**

`AppIconRail.tsx` already iterates over `navGroups` dynamically and uses `CATEGORY_ICONS[group.category]` — both of which are updated in Task 1. The component renders categories from the config automatically.

Verify: the component at line 30-63 iterates `navGroups.map(...)` and accesses `CATEGORY_ICONS[group.category]`. Since we updated both in nav-config.ts, no changes needed.

**Step 2: Verify the full build**

Run: `npx tsc --noEmit`
Expected: PASS — no TypeScript errors

**Step 3: Commit (if any adjustments were needed)**

Only commit if changes were made.

---

### Task 5: Vérifier les références aux anciennes catégories

**Files:**
- Search across: `src/portail/`

**Step 1: Search for old category keys**

Search for string literals `"home"`, `"registry"`, `"organization"` in portail files to catch any hardcoded references to old category names.

Run: `grep -rn '"home"\|"registry"\|"organization"' src/portail/`

Check any matches. The main places to look:
- `PortailLayout.tsx` — may initialize `activeCategory` state with `"home"` (should change to `"dashboard"`)
- Any component that calls `getCategoryForPath` — already returns `"dashboard"` as fallback

**Step 2: Fix any hardcoded references**

If `PortailLayout.tsx` has `useState("home")`, change to `useState("dashboard")`.

**Step 3: Full build verification**

Run: `npm run build`
Expected: Build completes successfully with no errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: mise à jour des références aux anciennes catégories sidebar"
```

---

### Task 6: Push et déploiement

**Step 1: Push to remote**

```bash
git push
```

**Step 2: Verify Netlify deployment**

Check that the Netlify build succeeds (either via CLI or Netlify dashboard).
