# Dashboard Full Spec 14 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete executive dashboard per spec 14 — KPI rows, Recharts visualizations (compliance radar, incident timeline, trend chart, risk donut, system breakdowns), top-risk table, pending actions list, reviews due, and recent decisions.

**Architecture:** The dashboard page (`DashboardPage.tsx`) will be composed of self-contained widget components living in `src/portail/components/dashboard/`. Each widget fetches its own data via existing hooks or receives pre-fetched data as props. Recharts 3.7 (already installed) provides RadarChart, BarChart, LineChart, PieChart. We skip react-grid-layout drag-and-drop for now (YAGNI) and use a fixed responsive CSS grid layout instead. A new `useComplianceSnapshots` hook will be created for the trend chart.

**Tech Stack:** React 19, TypeScript, Recharts 3.7, Tailwind CSS 4, shadcn/ui Card, existing hooks (useAiSystems, useIncidents, useComplianceScores, useDecisions, useBiasFindings, useRiskAssessments, useVendors), date-fns 4, i18next.

---

## Task 1: Create Recharts theme constants + wrapper utilities

**Files:**
- Create: `src/portail/components/dashboard/chart-theme.ts`

**Step 1: Create the chart theme file**

```ts
// src/portail/components/dashboard/chart-theme.ts

// Brand-aligned chart colors
export const CHART_COLORS = {
  purple: "#ab54f3",
  purpleLight: "#c084fc",
  teal: "#14b8a6",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  emerald: "#10b981",
  orange: "#f97316",
  indigo: "#6366f1",
  pink: "#ec4899",
} as const;

// Risk level colors (consistent across all charts)
export const RISK_COLORS: Record<string, string> = {
  prohibited: "#991b1b",  // red-900
  critical: "#ef4444",    // red-500
  high: "#f97316",        // orange-500
  limited: "#f59e0b",     // amber-500
  minimal: "#10b981",     // emerald-500
};

// Severity colors for incidents/bias
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

// Status colors for decisions
export const STATUS_COLORS: Record<string, string> = {
  draft: "#9ca3af",       // gray-400
  submitted: "#3b82f6",   // blue-500
  in_review: "#6366f1",   // indigo-500
  approved: "#10b981",    // emerald-500
  rejected: "#ef4444",    // red-500
  implemented: "#14b8a6", // teal-500
};

// Compliance framework colors for radar
export const FRAMEWORK_COLORS: Record<string, string> = {
  LOI_25: "#ab54f3",
  EU_AI_ACT: "#3b82f6",
  NIST_AI_RMF: "#14b8a6",
  ISO_42001: "#f59e0b",
  RGPD: "#ec4899",
};

// Shared Recharts tooltip style
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    fontSize: "12px",
    padding: "8px 12px",
  },
};

// Responsive chart container props
export const CHART_MARGIN = { top: 5, right: 5, bottom: 5, left: 5 };
```

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/chart-theme.ts
git commit -m "feat(dashboard): add chart theme constants and color maps"
```

---

## Task 2: RiskDistributionChart — Donut chart by risk level

**Files:**
- Create: `src/portail/components/dashboard/RiskDistributionChart.tsx`

**Step 1: Create the component**

```tsx
// Donut chart showing AI systems distribution by risk level
// Uses: PieChart from recharts + RISK_COLORS from chart-theme
// Props: aiSystems: AiSystem[] (from useAiSystems)
// Computation: group by risk_level, count each, render donut
// Center label: total count
// Legend: below chart, horizontal, colored dots + label + count
// Size: fits a 1x1 card (~300px)
```

The component should:
- Accept `aiSystems` array as prop
- Use `useMemo` to compute `{ name, value, color }[]` grouped by `risk_level`
- Render `<ResponsiveContainer><PieChart><Pie innerRadius="60%" outerRadius="80%" dataKey="value" /></PieChart></ResponsiveContainer>`
- Custom label in center showing total
- Custom legend with colored dots
- Wrap in `<Card>` with `<CardHeader><CardTitle>` using i18n key

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/RiskDistributionChart.tsx
git commit -m "feat(dashboard): add risk distribution donut chart"
```

---

## Task 3: ComplianceRadarChart — Radar per framework

**Files:**
- Create: `src/portail/components/dashboard/ComplianceRadarChart.tsx`

**Step 1: Create the component**

```tsx
// Radar chart with one axis per compliance framework
// Uses: RadarChart from recharts + FRAMEWORK_COLORS
// Props: frameworks: FrameworkScore[] (from useComplianceScores)
// Each axis = framework name, value = score (0-100)
// Filled area with brand-purple/30 opacity
// Dots on each vertex showing score
// Size: fits 2x2 card
```

The component should:
- Accept `frameworks` array as prop
- Transform to `{ framework: string, score: number, fullMark: 100 }[]`
- Translate framework codes to display names via i18n
- Render `<RadarChart><PolarGrid /><PolarAngleAxis /><PolarRadiusAxis /><Radar /></RadarChart>`
- Use `fill={CHART_COLORS.purple}` with `fillOpacity={0.2}` and `stroke={CHART_COLORS.purple}`
- Wrap in Card with title "Conformité par cadre"

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/ComplianceRadarChart.tsx
git commit -m "feat(dashboard): add compliance radar chart"
```

---

## Task 4: IncidentTimelineChart — Stacked bar by month + severity

**Files:**
- Create: `src/portail/components/dashboard/IncidentTimelineChart.tsx`

**Step 1: Create the component**

```tsx
// Stacked bar chart: X = months (last 6), Y = incident count, stack by severity
// Uses: BarChart from recharts + SEVERITY_COLORS
// Props: incidents: Incident[] (from useIncidents)
// Computation: group by month (from detected_at or created_at), then by severity
// Each severity is a separate <Bar> with stackId="a"
// Tooltip shows month name + breakdown per severity
// Size: fits 2x1 card
```

The component should:
- Accept `incidents` array
- Use `useMemo` + `date-fns` (`format`, `subMonths`, `startOfMonth`, `isSameMonth`) to bucket last 6 months
- Generate `{ month: string, critical: number, high: number, medium: number, low: number }[]`
- Render stacked `<BarChart>` with 4 `<Bar>` components (one per severity)
- Custom tooltip with severity colors
- X axis: short month names (date-fns locale-aware)

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/IncidentTimelineChart.tsx
git commit -m "feat(dashboard): add incident timeline stacked bar chart"
```

---

## Task 5: SystemsByTypeChart — Donut by system type

**Files:**
- Create: `src/portail/components/dashboard/SystemsByTypeChart.tsx`

**Step 1: Create the component**

```tsx
// Donut chart showing AI system count by system_type
// Uses: PieChart from recharts
// Props: aiSystems: AiSystem[]
// Computation: group by system_type, count each
// Colors: cycle through CHART_COLORS values
// Legend: external, right side or below
// Size: 1x1 card
```

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/SystemsByTypeChart.tsx
git commit -m "feat(dashboard): add systems by type donut chart"
```

---

## Task 6: TopRiskSystemsTable — Top 5 highest risk

**Files:**
- Create: `src/portail/components/dashboard/TopRiskSystemsTable.tsx`

**Step 1: Create the component**

```tsx
// Compact table: top 5 AI systems by risk_score (desc)
// Props: aiSystems: AiSystem[]
// Columns: Rank (#), Name (link), Risk Score (colored badge), Status
// Uses existing RiskScoreGauge (size="sm") or just a colored badge
// Wrap in Card with title "Systèmes à risque élevé"
// Size: 2x1 card
```

The component should:
- Sort by `risk_score` descending, take top 5
- Each row: numbered rank, system name as Link to `/ai-systems/${id}`, risk score with color, lifecycle status badge
- Compact table with `text-sm`, row hover `hover:bg-muted/50`

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/TopRiskSystemsTable.tsx
git commit -m "feat(dashboard): add top risk systems table widget"
```

---

## Task 7: PendingActionsWidget — Decisions + remediations pending

**Files:**
- Create: `src/portail/components/dashboard/PendingActionsWidget.tsx`

**Step 1: Create the component**

```tsx
// List of pending actions requiring attention
// Data sources:
//   - Decisions with status "submitted" or "in_review" (from useDecisions)
//   - Bias findings with status "identified" or "in_remediation"
// Each item: icon (ClipboardCheck for decisions, Scale for bias), title, date, link
// Empty state if nothing pending
// Size: 1x2 card
```

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/PendingActionsWidget.tsx
git commit -m "feat(dashboard): add pending actions list widget"
```

---

## Task 8: ReviewsDueWidget — Upcoming system reviews

**Files:**
- Create: `src/portail/components/dashboard/ReviewsDueWidget.tsx`

**Step 1: Create the component**

```tsx
// List of AI systems with upcoming or overdue review dates
// Props: aiSystems: AiSystem[]
// Filter: next_review_date is not null
// Sort by next_review_date ascending
// Show: system name, days until review (colored: red if overdue, orange < 30d, green > 30d)
// Max 5 items
// Counter badge in card header: total systems needing review in next 30 days
// Size: 1x1 card
```

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/ReviewsDueWidget.tsx
git commit -m "feat(dashboard): add reviews due widget"
```

---

## Task 9: RecentDecisionsWidget — Recent decision timeline

**Files:**
- Create: `src/portail/components/dashboard/RecentDecisionsWidget.tsx`

**Step 1: Create the component**

```tsx
// Vertical timeline of 5 most recent decisions
// Props: decisions: Decision[]
// Each entry: colored dot (STATUS_COLORS[status]), title, type badge, relative time
// Links to /decisions (no detail page yet, so link to list)
// Size: 1x2 card
```

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/RecentDecisionsWidget.tsx
git commit -m "feat(dashboard): add recent decisions timeline widget"
```

---

## Task 10: BiasDebtWidget — Open bias findings indicator

**Files:**
- Create: `src/portail/components/dashboard/BiasDebtWidget.tsx`

**Step 1: Create the component**

```tsx
// Summary card: total open bias findings grouped by severity
// Props: biasFindings: BiasFinding[]
// Filter: status not in ["resolved", "accepted_risk"]
// Display: large total count + 4 colored sub-counts (critical, high, medium, low)
// Visual: small horizontal stacked bar (proportional) below the counts
// Size: 1x1 card
```

**Step 2: Commit**

```bash
git add src/portail/components/dashboard/BiasDebtWidget.tsx
git commit -m "feat(dashboard): add bias debt indicator widget"
```

---

## Task 11: Add i18n keys for all dashboard widgets

**Files:**
- Modify: `src/i18n/locales/fr/dashboard.json`
- Modify: `src/i18n/locales/en/dashboard.json`

**Step 1: Add all new keys**

Add to both files (fr and en versions):
- `widgets.riskDistribution` / `widgets.riskDistributionDesc`
- `widgets.complianceRadar` / `widgets.complianceRadarDesc`
- `widgets.incidentTimeline` / `widgets.incidentTimelineDesc`
- `widgets.systemsByType`
- `widgets.topRiskSystems`
- `widgets.pendingActions` / `widgets.noPendingActions`
- `widgets.reviewsDue` / `widgets.noReviewsDue` / `widgets.overdue` / `widgets.daysLeft`
- `widgets.recentDecisions` / `widgets.noDecisions`
- `widgets.biasDebt` / `widgets.openFindings`
- `widgets.trend` / `widgets.trendDesc`
- `periods.3months` / `periods.6months` / `periods.12months`
- Framework display names: `frameworks.LOI_25`, `frameworks.EU_AI_ACT`, `frameworks.NIST_AI_RMF`, `frameworks.ISO_42001`, `frameworks.RGPD`
- Risk levels: `riskLevels.prohibited`, `riskLevels.critical`, `riskLevels.high`, `riskLevels.limited`, `riskLevels.minimal`
- Severity labels: `severity.critical`, `severity.high`, `severity.medium`, `severity.low`

**Step 2: Commit**

```bash
git add src/i18n/locales/fr/dashboard.json src/i18n/locales/en/dashboard.json
git commit -m "feat(dashboard): add i18n keys for all dashboard widgets"
```

---

## Task 12: Assemble DashboardPage with full widget grid

**Files:**
- Modify: `src/portail/pages/DashboardPage.tsx`

**Step 1: Rewrite DashboardPage**

The new page structure:
```
<div className="space-y-8">
  {/* Page header: welcome + description */}

  {/* Row 1: 4 KPI cards (existing, keep improved version) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

  {/* Row 2: 3 summary cards — risk donut, bias debt, pending decisions count */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

  {/* Row 3: Wide charts — compliance radar (2/3) + top risk table (1/3) */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2"><ComplianceRadarChart /></div>
    <TopRiskSystemsTable />
  </div>

  {/* Row 4: Incident timeline (2/3) + systems by type donut (1/3) */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2"><IncidentTimelineChart /></div>
    <SystemsByTypeChart />
  </div>

  {/* Row 5: Pending actions (1/2) + recent decisions (1/2) */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <PendingActionsWidget />
    <RecentDecisionsWidget />
  </div>

  {/* Row 6: Reviews due (1/2) + quick access modules (1/2) */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <ReviewsDueWidget />
    {/* Keep existing quick access grid, nested 2x2 */}
  </div>
</div>
```

Additional hooks to import: `useDecisions`, `useBiasFindings`, `useRiskAssessments`.

Pass pre-fetched data as props to chart widgets (single query per hook, shared across widgets).

**Step 2: Run build**

```bash
npm run build
```

Expected: 0 TypeScript errors, bundle built.

**Step 3: Commit**

```bash
git add src/portail/pages/DashboardPage.tsx
git commit -m "feat(dashboard): assemble full spec-14 dashboard with all widgets"
```

---

## Task 13: Final build verification + push

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Push to remote**

```bash
git push
```

---

## Summary

| Task | Widget | Recharts component | Estimated effort |
|------|--------|--------------------|-----------------|
| 1 | Chart theme | — | 2 min |
| 2 | Risk distribution donut | PieChart | 10 min |
| 3 | Compliance radar | RadarChart | 10 min |
| 4 | Incident timeline | BarChart (stacked) | 12 min |
| 5 | Systems by type | PieChart | 8 min |
| 6 | Top risk systems | Table | 8 min |
| 7 | Pending actions | List | 8 min |
| 8 | Reviews due | List | 8 min |
| 9 | Recent decisions | Timeline | 8 min |
| 10 | Bias debt indicator | Custom bar | 8 min |
| 11 | i18n keys | — | 5 min |
| 12 | Assemble page | — | 15 min |
| 13 | Build + push | — | 2 min |
| **Total** | | | **~105 min** |

## Deferred (YAGNI for now)
- `react-grid-layout` drag-and-drop widget arrangement
- `useComplianceSnapshots` hook + trend chart over time (needs `compliance_snapshots` table seeded)
- Risk heatmap (impact × probability custom SVG) — needs probability/impact on assessments
- Board report PDF generation
- Presentation mode full-screen
- Per-user widget preference persistence
