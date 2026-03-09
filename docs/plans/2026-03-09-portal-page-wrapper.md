# PortalPage Wrapper — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `PortalPage` wrapper component that enforces consistent structure across all portal pages (padding, spacing, PageHeader, optional FeatureGate).

**Architecture:** Single wrapper component in `src/portail/components/PortalPage.tsx` that composes PageHeader + FeatureGate + standard div wrapper. All 25+ portal pages migrate to use it. Special pages (Dashboard, Profil, Onboarding, Conditions, Placeholder) keep custom layouts.

**Tech Stack:** React, TypeScript, existing PageHeader + FeatureGate components.

---

### Task 1: Create PortalPage component

**Files:**
- Create: `src/portail/components/PortalPage.tsx`

**Step 1: Create the component**

```tsx
import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureGate } from "@/components/shared/FeatureGate";

interface PortalPageProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  helpNs?: string;
  badge?: string;
  actions?: ReactNode;
  feature?: string;
  children: ReactNode;
}

export function PortalPage({
  title,
  description,
  icon,
  helpNs,
  badge,
  actions,
  feature,
  children,
}: PortalPageProps) {
  const content = (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        helpNs={helpNs}
        badge={badge}
        actions={actions}
      />
      {children}
    </div>
  );

  if (feature) {
    return <FeatureGate feature={feature}>{content}</FeatureGate>;
  }

  return content;
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
feat: créer le composant PortalPage wrapper
```

---

### Task 2: Migrate standard pages (batch 1)

Migrate pages that currently use `<div className="space-y-6 p-4 md:p-6">` + `<PageHeader>`:

- AdminPage (icon=Building2, helpNs=admin)
- AgentsPage (icon=Bot, feature gate: none, has actions)
- AgentTracesPage (icon=Activity)
- BibliothecPage (icon=BookOpen)
- DecisionsPage (icon=ClipboardCheck, feature=decisions, helpNs=decisions)
- VendorsPage (icon=Building2, feature=vendors, helpNs=vendors)

**Pattern for each page:**
1. Replace `import { PageHeader }` with `import { PortalPage }`
2. Remove FeatureGate import if only used as wrapper
3. Replace outer `<div className="space-y-6 p-4 md:p-6">` + `<PageHeader .../>` + `</div>` with `<PortalPage ...>` children `</PortalPage>`
4. Move FeatureGate feature prop to PortalPage if applicable

---

### Task 3: Migrate standard pages (batch 2)

Pages with FeatureGate + PageHeader:

- CompliancePage (icon=CheckCircle, feature=compliance, helpNs=compliance)
- DataPage (icon=Database, feature=data_catalog, helpNs=data)
- MonitoringPage (icon=Activity, feature=monitoring, helpNs=monitoring)
- TransparencyPage (icon=Eye, feature=transparency, helpNs=transparency)
- BiasPage (icon=Scale, feature=bias, helpNs=bias, has actions)

---

### Task 4: Migrate standard pages (batch 3)

Pages with different padding or no padding that need normalization:

- GovernancePage (icon=Shield, feature=governance_structure, helpNs=governance, has actions)
- DocumentsPage (icon=FolderOpen, feature=documents, helpNs=documents)
- ModelesBibliothequePage (icon=Library)
- RoadmapPage (icon=Map)

---

### Task 5: Migrate list pages

- AiSystemsListPage (icon=Bot, helpNs=aiSystems, has actions)
- IncidentListPage (icon=AlertTriangle, feature=incidents, helpNs=incidents, has actions)
- RiskAssessmentListPage (icon=ShieldAlert, feature=risk_assessments, helpNs=riskAssessments, has actions)
- VeillePage (icon=Newspaper, helpNs=veille, has actions+badge)

---

### Task 6: Migrate detail/wizard pages

- AiSystemDetailPage (icon=Bot)
- IncidentDetailPage (icon=AlertCircle, helpNs=incidents, has actions)
- IncidentReportPage (icon=AlertTriangle, helpNs=incidents)
- RiskAssessmentDetailPage (icon=ShieldAlert, helpNs=riskAssessments, has actions)
- RiskAssessmentWizardPage (icon=ShieldAlert, helpNs=riskAssessments)
- LifecyclePage (icon=RefreshCw, helpNs=lifecycle)
- BillingPage (icon=CreditCard) — 3 render paths
- MembresPage (icon=Users, has badge)

---

### Task 7: Update CLAUDE.md

Add to conventions section:
```
### Pages du portail
- Toute nouvelle page du portail DOIT utiliser `<PortalPage>` de `@/portail/components/PortalPage`
- Props : icon, title, description, helpNs, badge, actions, feature (FeatureGate optionnel)
- Les pages spéciales (Dashboard, Profil, Onboarding, Conditions, Placeholder) utilisent leur propre layout
```

---

### Task 8: Final verification

Run: `npm run build`
Verify all pages render correctly.
Commit and push.
