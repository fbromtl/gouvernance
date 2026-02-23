# Feature Gate Preview Mode — Design

**Date:** 2026-02-22
**Status:** Approved

## Problem

Observer (free) users see a blocking "Réservé aux Membres" card with a lock icon when accessing premium features. This completely hides the functionality, giving users no sense of what they're missing. The goal is to create FOMO by letting them **see** the features in read-only preview mode.

## Design

### Behavior

When an Observer accesses a gated page:

1. **Sticky banner** (brand-purple, ~44px) at the top:
   - Lock icon + "Aperçu — Cette fonctionnalité est réservée aux Membres"
   - CTA button "Débloquer cette fonctionnalité" → redirects to `/billing`
   - Stays visible on scroll (`sticky top-0 z-50`)

2. **Progressive blur** on the page content:
   - Top half: clear, fully readable (titles, first table rows, charts)
   - Bottom half: progressively blurred via CSS `mask-image` + `backdrop-filter: blur(8px)`
   - Transition zone around 40-50% of viewport height

3. **Interactions disabled:**
   - `pointer-events: none` on all content
   - `user-select: none` to prevent copy-paste

4. **Static demo data** displayed instead of real Supabase data

### Visual Structure

```
┌─────────────────────────────────────────────┐
│ 🔒 Aperçu · Réservé aux Membres  [Débloquer] │  ← sticky banner
├─────────────────────────────────────────────┤
│                                             │
│   Page content (clear, readable)            │  ← top 40%: no blur
│   Titles, first table rows, charts          │
│                                             │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← transition zone
│ ░░░░ increasingly blurred content ░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← bottom 60%: blurred
│                                             │
└─────────────────────────────────────────────┘
    pointer-events: none (no clicks)
    user-select: none (no copy)
```

### CSS Technique

The blur is achieved with an `::after` pseudo-element overlay:
- `position: absolute; inset: 0`
- `backdrop-filter: blur(8px)`
- `mask-image: linear-gradient(to bottom, transparent 40%, black 90%)`
- This creates a smooth transition from clear to blurred

## Demo Data

Each gated page displays static demo data instead of fetching from Supabase:

| Page | Demo Content |
|------|-------------|
| **Risques** | 4-5 risk assessments with varied scores (high/medium/low) |
| **Conformité** | Dashboard with 3 frameworks (EU AI Act, ISO 42001, NIST) and % scores |
| **Transparence** | 2-3 transparency reports with statuses |
| **Gouvernance** | Org chart with roles (DPO, AI Committee, etc.) |
| **Incidents** | 3-4 incidents with different severities |
| **Monitoring** | Metrics with charts (performance, drift, fairness) |
| **Décisions** | 4-5 decision registry entries with dates and statuses |
| **Documents** | File tree with folders and sample documents |
| **Données** | Catalog with 3-4 datasets |
| **Biais** | Analyses with fairness metrics |

Data uses realistic but generic names (e.g., "Système de scoring RH", "Chatbot service client").

## Files

### Modified (core - 2 files)
- `src/components/shared/FeatureGate.tsx` — Full redesign: render children with blur + banner instead of blocking
- `src/i18n/locales/fr/billing.json` — New i18n keys for banner (`gate.preview`, `gate.unlock`)

### Created (3 files)
- `src/hooks/useFeaturePreview.ts` — Hook exposing `{ isPreview }` per feature
- `src/portail/demo/index.ts` — Centralized export of all demo data
- `src/portail/demo/data.ts` — 10 demo datasets (one object per feature)

### Modified (10 page files)
Each page checks `isPreview` and injects demo data:
```tsx
const { isPreview } = useFeaturePreview('risk_assessments');
const realData = useRiskAssessments();
const data = isPreview ? DEMO_RISK_ASSESSMENTS : realData;
```

Pages:
- `src/portail/pages/RiskAssessmentListPage.tsx`
- `src/portail/pages/CompliancePage.tsx`
- `src/portail/pages/TransparencyPage.tsx`
- `src/portail/pages/GovernancePage.tsx`
- `src/portail/pages/IncidentListPage.tsx`
- `src/portail/pages/MonitoringPage.tsx`
- `src/portail/pages/DecisionsPage.tsx`
- `src/portail/pages/DocumentsPage.tsx`
- `src/portail/pages/DataPage.tsx`
- `src/portail/pages/BiasPage.tsx`

**Total: ~15 files touched**

## Existing `silent` prop

The `silent` prop on `FeatureGate` continues to work — when `silent={true}`, the component renders nothing (used for conditionally hiding UI elements like buttons).
