# Portal Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the entire portal (layout, dashboard, widgets, charts) to match the public homepage's visual style using a new portal design system.

**Architecture:** Create 4 wrapper components (PortalCard, PortalCardHeader, PortalKPI, PortalChartContainer) that encapsulate the homepage's visual language. Replace shadcn Card usage across all portal dashboard components. Update layout (sidebar, header) to use light neutral theme. Remove dark mode support.

**Tech Stack:** React, TypeScript, Tailwind CSS, Recharts, Lucide icons

---

### Task 1: Create Portal Design System components

**Files:**
- Create: `src/portail/components/ui/PortalCard.tsx`
- Create: `src/portail/components/ui/PortalCardHeader.tsx`
- Create: `src/portail/components/ui/PortalKPI.tsx`
- Create: `src/portail/components/ui/PortalChartContainer.tsx`

**Step 1: Create `PortalCard.tsx`**

Create `src/portail/components/ui/PortalCard.tsx` with this exact content:

```tsx
import { cn } from "@/lib/utils";

interface PortalCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function PortalCard({ children, className, hoverable = true }: PortalCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-neutral-100 p-5",
        hoverable && "hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

**Step 2: Create `PortalCardHeader.tsx`**

Create `src/portail/components/ui/PortalCardHeader.tsx` with this exact content:

```tsx
import { cn } from "@/lib/utils";

interface PortalCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function PortalCardHeader({ children, className, action }: PortalCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 mb-4", className)}>
      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
        {children}
      </h3>
      {action}
    </div>
  );
}
```

**Step 3: Create `PortalKPI.tsx`**

Create `src/portail/components/ui/PortalKPI.tsx` with this exact content:

```tsx
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";

interface PortalKPIProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  href?: string;
  trend?: "up" | "down" | "neutral" | null;
}

const TrendIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus };

export function PortalKPI({ icon: Icon, label, value, color, bgColor, href, trend }: PortalKPIProps) {
  const TIcon = trend ? TrendIcon[trend] : null;

  const content = (
    <div className="group relative overflow-hidden bg-white rounded-xl border border-neutral-100 p-5 hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {TIcon && (
          <TIcon
            className={cn(
              "h-4 w-4",
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-neutral-300",
            )}
          />
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-neutral-900">{value}</p>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{label}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#ab54f3]/40 group-hover:w-full transition-all duration-500" />
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}
```

**Step 4: Create `PortalChartContainer.tsx`**

Create `src/portail/components/ui/PortalChartContainer.tsx` with this exact content:

```tsx
import { cn } from "@/lib/utils";
import { PortalCardHeader } from "./PortalCardHeader";

interface PortalChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  minHeight?: string;
}

export function PortalChartContainer({
  title,
  children,
  className,
  action,
  minHeight = "320px",
}: PortalChartContainerProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-neutral-100 flex flex-col",
        className,
      )}
      style={{ minHeight }}
    >
      <div className="p-5 pb-0">
        <PortalCardHeader action={action}>{title}</PortalCardHeader>
      </div>
      <div className="flex-1 p-3 pt-0">
        {children}
      </div>
    </div>
  );
}
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 6: Commit**

```bash
git add src/portail/components/ui/PortalCard.tsx src/portail/components/ui/PortalCardHeader.tsx src/portail/components/ui/PortalKPI.tsx src/portail/components/ui/PortalChartContainer.tsx
git commit -m "feat(portail): add portal design system components"
```

---

### Task 2: Update chart-theme.ts with new RECHARTS_STYLE

**Files:**
- Modify: `src/portail/components/dashboard/chart-theme.ts`

**Step 1: Add RECHARTS_STYLE export**

After the existing `TOOLTIP_STYLE` export (line 59-68), add the following new export:

```ts
// Upgraded Recharts shared styles (homepage-aligned)
export const RECHARTS_STYLE = {
  grid: { stroke: "#f5f5f5", strokeDasharray: "3 3" },
  axis: {
    tick: { fill: "#a3a3a3", fontSize: 11 },
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "white",
      border: "1px solid #f5f5f5",
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      padding: "12px 16px",
      fontSize: "12px",
    },
    labelStyle: {
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color: "#a3a3a3",
      marginBottom: "6px",
    },
    cursor: { fill: "rgba(0,0,0,0.03)" },
  },
  bar: { radius: [4, 4, 0, 0] as [number, number, number, number] },
} as const;
```

**Step 2: Update existing TOOLTIP_STYLE to match new design**

Replace the existing `TOOLTIP_STYLE` (lines 58-68):

From:
```ts
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
```

To:
```ts
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "white",
    border: "1px solid #f5f5f5",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    fontSize: "12px",
    padding: "12px 16px",
  },
};
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 4: Commit**

```bash
git add src/portail/components/dashboard/chart-theme.ts
git commit -m "style(portail): update chart theme with homepage-aligned styles"
```

---

### Task 3: Update Layout files (PortailLayout + AppSidebar + AppHeader)

**Files:**
- Modify: `src/portail/layout/PortailLayout.tsx`
- Modify: `src/portail/layout/AppSidebar.tsx`
- Modify: `src/portail/layout/AppHeader.tsx`

**Step 1: Update PortailLayout.tsx — background color**

In `src/portail/layout/PortailLayout.tsx`, change line 21:

From:
```tsx
<div className="flex h-screen overflow-hidden bg-background">
```
To:
```tsx
<div className="flex h-screen overflow-hidden bg-neutral-50/50">
```

**Step 2: Update AppSidebar.tsx — light theme**

In `src/portail/layout/AppSidebar.tsx`, make these changes:

**Change 1 — aside wrapper (line 304-307):**
From:
```tsx
"flex flex-col border-r border-border/60 bg-card transition-all duration-300 ease-in-out",
```
To:
```tsx
"flex flex-col border-r border-neutral-100 bg-white transition-all duration-300 ease-in-out",
```

**Change 2 — brand header border (line 312):**
From:
```tsx
"flex items-center gap-3 border-b border-border/60 px-3 h-14 shrink-0",
```
To:
```tsx
"flex items-center gap-3 border-b border-neutral-100 px-3 h-14 shrink-0",
```

**Change 3 — brand name text (line 321):**
From:
```tsx
<span className="font-bold text-sm tracking-tight truncate text-foreground">
```
To:
```tsx
<span className="font-bold text-sm tracking-tight truncate text-neutral-900">
```

**Change 4 — brand tagline (line 324):**
From:
```tsx
<span className="text-[10px] text-foreground/40 -mt-0.5 font-medium">
```
To:
```tsx
<span className="text-[10px] text-neutral-400 -mt-0.5 font-medium">
```

**Change 5 — group labels (line 288):**
From:
```tsx
<span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/35">
```
To:
```tsx
<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
```

**Change 6 — nav links (lines 232-237):**
From:
```tsx
active
  ? "bg-brand-purple/10 text-brand-purple shadow-[inset_0_0_0_1px_rgba(171,84,243,0.12)]"
  : "text-foreground/65 hover:bg-muted/80 hover:text-foreground",
```
To:
```tsx
active
  ? "bg-[#ab54f3]/8 text-[#ab54f3] shadow-[inset_0_0_0_1px_rgba(171,84,243,0.10)]"
  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
```

**Change 7 — icon colors (lines 247-248):**
From:
```tsx
active ? "text-brand-purple" : "text-foreground/45 group-hover:text-foreground/70"
```
To:
```tsx
active ? "text-[#ab54f3]" : "text-neutral-400 group-hover:text-neutral-700"
```

**Change 8 — collapsed separator (line 294):**
From:
```tsx
<div className="mx-3 my-2.5 border-t border-border/40" />
```
To:
```tsx
<div className="mx-3 my-2.5 border-t border-neutral-100" />
```

**Change 9 — footer (line 339):**
From:
```tsx
<div className="border-t border-border/60 p-2 space-y-0.5">
```
To:
```tsx
<div className="border-t border-neutral-100 p-2 space-y-0.5">
```

**Change 10 — footer link (line 343):**
From:
```tsx
"flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/45 hover:text-foreground hover:bg-muted/60 transition-all duration-200",
```
To:
```tsx
"flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200",
```

**Change 11 — collapse button (line 356):**
From:
```tsx
"w-full h-8 text-foreground/40 hover:text-foreground hover:bg-muted/60",
```
To:
```tsx
"w-full h-8 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50",
```

**Step 3: Update AppHeader.tsx — light theme**

In `src/portail/layout/AppHeader.tsx`, make these changes:

**Change 1 — header wrapper (line 106):**
From:
```tsx
<header className="flex items-center justify-between border-b border-border/60 bg-card px-4 lg:px-6 h-14 shrink-0">
```
To:
```tsx
<header className="flex items-center justify-between border-b border-neutral-100 bg-white px-4 lg:px-6 h-14 shrink-0">
```

**Change 2 — breadcrumb parent links (line 130-133):**
From:
```tsx
<Link
  to={crumb.path}
  className="text-foreground/50 hover:text-foreground transition-colors truncate"
>
```
To:
```tsx
<Link
  to={crumb.path}
  className="text-neutral-400 hover:text-neutral-900 transition-colors truncate"
>
```

**Change 3 — breadcrumb active (line 126-127):**
From:
```tsx
<span className="font-semibold text-foreground truncate">
```
To:
```tsx
<span className="font-semibold text-neutral-900 truncate">
```

**Change 4 — breadcrumb chevron (line 123):**
From:
```tsx
<ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/25" />
```
To:
```tsx
<ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
```

**Change 5 — notification bell (line 149):**
From:
```tsx
<Button variant="ghost" size="icon" className="relative h-8 w-8 text-foreground/50 hover:text-foreground">
```
To:
```tsx
<Button variant="ghost" size="icon" className="relative h-8 w-8 text-neutral-400 hover:text-neutral-900">
```

**Change 6 — separator (line 227):**
From:
```tsx
<div className="h-5 w-px bg-border/60 mx-1.5 hidden sm:block" />
```
To:
```tsx
<div className="h-5 w-px bg-neutral-200 mx-1.5 hidden sm:block" />
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 5: Commit**

```bash
git add src/portail/layout/PortailLayout.tsx src/portail/layout/AppSidebar.tsx src/portail/layout/AppHeader.tsx
git commit -m "style(portail): restyle layout with homepage-aligned light theme"
```

---

### Task 4: Update DashboardPage.tsx

**Files:**
- Modify: `src/portail/pages/DashboardPage.tsx`

**Step 1: Replace Card/CardContent/CardHeader/CardTitle imports**

Remove lines 16-17 (Card imports):
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

Add instead:
```tsx
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalKPI } from "@/portail/components/ui/PortalKPI";
```

Keep the `Button`, `Avatar`, `Switch`, `Badge` imports — they are still needed.

**Step 2: Update skeleton loader (lines 107-129)**

Replace the skeleton loader with homepage-aligned styles:

From:
```tsx
<div className="space-y-8">
  {/* Skeleton header */}
  <div className="space-y-2">
    <div className="h-8 w-56 bg-muted animate-pulse rounded-lg" />
    <div className="h-4 w-72 bg-muted/60 animate-pulse rounded-lg" />
  </div>
  {/* Skeleton KPI cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-32 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
    ))}
  </div>
  {/* Skeleton charts */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 h-80 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
    <div className="h-80 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 h-64 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
    <div className="h-64 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
  </div>
</div>
```

To:
```tsx
<div className="space-y-8">
  <div className="space-y-2">
    <div className="h-8 w-56 bg-neutral-100 animate-pulse rounded-lg" />
    <div className="h-4 w-72 bg-neutral-100/60 animate-pulse rounded-lg" />
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-32 bg-white animate-pulse rounded-xl border border-neutral-100" />
    ))}
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 h-80 bg-white animate-pulse rounded-xl border border-neutral-100" />
    <div className="h-80 bg-white animate-pulse rounded-xl border border-neutral-100" />
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 h-64 bg-white animate-pulse rounded-xl border border-neutral-100" />
    <div className="h-64 bg-white animate-pulse rounded-xl border border-neutral-100" />
  </div>
</div>
```

**Step 3: Update page header text (lines 204-211)**

From:
```tsx
<h1 className="text-2xl font-extrabold tracking-tight text-foreground">
```
To:
```tsx
<h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
```

From:
```tsx
<p className="text-sm text-muted-foreground mt-1">
```
To:
```tsx
<p className="text-sm text-neutral-500 mt-1">
```

**Step 4: Update demo toggle text colors**

Change demo badge `text-muted-foreground/50` → `text-neutral-400` and `text-muted-foreground` → `text-neutral-500` in the demo toggle area (lines 225-228).

**Step 5: Replace KPI card rendering (lines 354-380)**

Replace the entire KPI cards grid section:

From:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {statCards.map((stat) => {
    const Icon = stat.icon;
    const TIcon = stat.trend ? TrendIcon[stat.trend] : null;
    return (
      <Link key={stat.key} to={stat.path}>
        <Card className="group relative overflow-hidden hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)] hover:border-border/80 transition-all duration-300">
          <CardContent className="p-5">
            ...
          </CardContent>
          <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-purple/40 group-hover:w-full transition-all duration-500" />
        </Card>
      </Link>
    );
  })}
</div>
```

To:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {statCards.map((stat) => (
    <PortalKPI
      key={stat.key}
      icon={stat.icon}
      label={t(`stats.${stat.key}`)}
      value={stat.value}
      color={stat.color}
      bgColor={stat.bgColor}
      trend={stat.trend}
      href={stat.path}
    />
  ))}
</div>
```

Remove the `TrendIcon` import/mapping from DashboardPage (lines 187) — it's now inside PortalKPI. Also remove the `TrendingUp`, `TrendingDown`, `Minus` lucide imports from DashboardPage since they're no longer used there.

**Step 6: Update Membership widget — member variant (lines 248-295)**

Replace the `<Card className="border-border/60">` wrapper with `<PortalCard>`:

From:
```tsx
<Card className="border-border/60">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-semibold">
      ...
    </CardTitle>
  </CardHeader>
  <CardContent className="pb-5">
    ...
  </CardContent>
</Card>
```

To:
```tsx
<PortalCard>
  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
    {t("membership.profileTitle", { defaultValue: "Votre profil de membre" })}
  </h3>
  <div className="flex items-center gap-3">
    ... (avatar and profile info — keep as-is)
  </div>
  <div className="mt-3">
    ... (links — keep as-is)
  </div>
</PortalCard>
```

**Step 7: Update Quick Access section (lines 422-458)**

Replace the quick access `<Card>` usage:

From:
```tsx
<Card className="group hover:shadow-md transition-all duration-300 cursor-pointer border-border/60 h-full">
  <CardHeader className="pb-3">
    ...
  </CardHeader>
  <CardContent className="pb-5">
    <CardTitle className="text-sm font-semibold">{t(`modules.${mod.key}.title`)}</CardTitle>
    ...
  </CardContent>
</Card>
```

To:
```tsx
<PortalCard className="h-full cursor-pointer">
  <div className="flex items-center justify-between pb-3">
    <div className={`h-10 w-10 rounded-xl ${mod.bgColor} flex items-center justify-center`}>
      <Icon className={`h-5 w-5 ${mod.color}`} />
    </div>
    {mod.count !== null && (
      <span className="text-2xl font-bold text-neutral-200 group-hover:text-neutral-400 transition-colors duration-300">
        {mod.count}
      </span>
    )}
  </div>
  <h4 className="text-sm font-semibold text-neutral-900">{t(`modules.${mod.key}.title`)}</h4>
  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
    {t(`modules.${mod.key}.description`)}
  </p>
  <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#ab54f3] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <span>{t("viewModule", { defaultValue: "Ouvrir" })}</span>
    <ArrowRight className="h-3 w-3" />
  </div>
</PortalCard>
```

**Step 8: Update section title (line 424)**

From:
```tsx
<h2 className="text-lg font-semibold tracking-tight">{t("quickAccess")}</h2>
```
To:
```tsx
<h2 className="text-lg font-semibold tracking-tight text-neutral-900">{t("quickAccess")}</h2>
```

**Step 9: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 10: Commit**

```bash
git add src/portail/pages/DashboardPage.tsx
git commit -m "style(portail): redesign dashboard page with portal design system"
```

---

### Task 5: Update chart widgets (4 files)

**Files:**
- Modify: `src/portail/components/dashboard/ComplianceRadarChart.tsx`
- Modify: `src/portail/components/dashboard/RiskDistributionChart.tsx`
- Modify: `src/portail/components/dashboard/IncidentTimelineChart.tsx`
- Modify: `src/portail/components/dashboard/SystemsByTypeChart.tsx`

**Step 1: Update ComplianceRadarChart.tsx**

Replace the `Card` import (line 11):
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```
With:
```tsx
import { PortalChartContainer } from "@/portail/components/ui/PortalChartContainer";
```

Replace the return JSX (lines 100-158). Replace the outer `<Card>` + `<CardHeader>` + `<CardContent>` with `<PortalChartContainer>`:

From:
```tsx
<Card className="min-h-[400px] flex flex-col">
  <CardHeader>
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="text-base">
        {t("widgets.complianceRadar")}
      </CardTitle>
      {globalScore !== null && (
        <Badge ...>
          {globalScore}%
        </Badge>
      )}
    </div>
  </CardHeader>
  <CardContent className="flex-1 flex items-center justify-center">
    ...
  </CardContent>
</Card>
```

To:
```tsx
<PortalChartContainer
  title={t("widgets.complianceRadar")}
  minHeight="400px"
  action={
    globalScore !== null ? (
      <Badge
        variant="outline"
        className={`text-xs font-semibold px-2 py-0.5 ${badgeColor}`}
      >
        {globalScore}%
      </Badge>
    ) : undefined
  }
>
  <div className="flex-1 flex items-center justify-center">
    {isEmpty ? (
      <span className="text-2xl text-neutral-400 select-none">—</span>
    ) : (
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart ...>
          <PolarGrid stroke="#f5f5f5" />
          <PolarAngleAxis dataKey="framework" tick={{ fontSize: 11, fill: "#a3a3a3" }} />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10, fill: "#a3a3a3" }} axisLine={false} />
          ... (Radar and Tooltip stay the same)
        </RadarChart>
      </ResponsiveContainer>
    )}
  </div>
</PortalChartContainer>
```

Also update the tooltip text colors: `text-foreground` → `text-neutral-900` in CustomTooltip (line 54).

**Step 2: Update RiskDistributionChart.tsx**

Replace `Card` import with:
```tsx
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
```

Replace the outer Card wrapper (lines 127-198):

From:
```tsx
<Card className="flex flex-col" style={{ minHeight: "320px" }}>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-semibold">
      {t("widgets.riskDistribution")}
    </CardTitle>
  </CardHeader>
  <CardContent className="flex flex-1 flex-col gap-4 pt-0">
    ...
  </CardContent>
</Card>
```

To:
```tsx
<PortalCard className="flex flex-col" style={{ minHeight: "320px" }}>
  <PortalCardHeader>{t("widgets.riskDistribution")}</PortalCardHeader>
  <div className="flex flex-1 flex-col gap-4">
    ...
  </div>
</PortalCard>
```

Update empty state `text-gray-400` → `text-neutral-400`.
Update legend text colors: `text-gray-700` → `text-neutral-600`, `text-gray-900` → `text-neutral-900`.
Update CenterLabel `className="fill-foreground"` → use `style={{ fill: "#171717" }}` (neutral-900).
Update CenterLabel bottom text `fill: "#6b7280"` → `fill: "#a3a3a3"` (neutral-400).

**Step 3: Update IncidentTimelineChart.tsx**

Replace `Card` import with:
```tsx
import { PortalChartContainer } from "@/portail/components/ui/PortalChartContainer";
```

Replace outer Card wrapper:

From:
```tsx
<Card className="min-h-[320px] flex flex-col">
  <CardHeader className="pb-2">
    <CardTitle className="text-base font-semibold">
      {t("widgets.incidentTimeline")}
    </CardTitle>
  </CardHeader>
  <CardContent className="flex-1 flex flex-col justify-center">
    ...
  </CardContent>
</Card>
```

To:
```tsx
<PortalChartContainer title={t("widgets.incidentTimeline")}>
  <div className="flex-1 flex flex-col justify-center">
    ...
  </div>
</PortalChartContainer>
```

Update CartesianGrid: `stroke="#f0f0f0"` → `stroke="#f5f5f5"`.
Update XAxis tick: `fill: "#6b7280"` → `fill: "#a3a3a3"`.
Update YAxis tick: `fill: "#6b7280"` → `fill: "#a3a3a3"`.
Update tooltip text colors: `text-gray-800` → `text-neutral-900`, `text-gray-600` → `text-neutral-500`, `text-gray-500` → `text-neutral-400`, `border-gray-100` → `border-neutral-100`.
Update empty state: `text-gray-400` → `text-neutral-400`.

**Step 4: Update SystemsByTypeChart.tsx**

Apply the same pattern: replace Card with PortalCard + PortalCardHeader. Update all `text-foreground/muted-foreground/gray-*` colors to neutral equivalents.

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 6: Commit**

```bash
git add src/portail/components/dashboard/ComplianceRadarChart.tsx src/portail/components/dashboard/RiskDistributionChart.tsx src/portail/components/dashboard/IncidentTimelineChart.tsx src/portail/components/dashboard/SystemsByTypeChart.tsx
git commit -m "style(portail): redesign chart widgets with portal design system"
```

---

### Task 6: Update list/table widgets (6 files)

**Files:**
- Modify: `src/portail/components/dashboard/TopRiskSystemsTable.tsx`
- Modify: `src/portail/components/dashboard/BiasDebtWidget.tsx`
- Modify: `src/portail/components/dashboard/PendingActionsWidget.tsx`
- Modify: `src/portail/components/dashboard/ReviewsDueWidget.tsx`
- Modify: `src/portail/components/dashboard/RecentDecisionsWidget.tsx`
- Modify: `src/portail/components/dashboard/AgentActivityWidget.tsx`

For ALL 6 files, apply the same transformation pattern:

**Common changes for each file:**

1. Replace import:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```
With:
```tsx
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
```

2. Replace `<Card>` with `<PortalCard>`
3. Replace `<CardHeader>/<CardTitle>` with `<PortalCardHeader>{title}</PortalCardHeader>`
4. Replace `<CardContent>` with `<div>` (just remove the component, keep the div)
5. Replace `text-foreground` with `text-neutral-900`
6. Replace `text-muted-foreground` with `text-neutral-500`
7. Replace `bg-muted` with `bg-neutral-100`
8. Replace `border-border` with `border-neutral-100`
9. Replace `text-gray-*` colors with neutral equivalents:
   - `text-gray-400` → `text-neutral-400`
   - `text-gray-500` → `text-neutral-500`
   - `text-gray-600` → `text-neutral-500`
   - `text-gray-700` → `text-neutral-600`
   - `text-gray-800` → `text-neutral-900`
   - `text-gray-900` → `text-neutral-900`
10. Replace `hover:bg-muted/50` with `hover:bg-neutral-50`

**Specific per-file notes:**

**TopRiskSystemsTable.tsx:**
- Empty state icon: `bg-muted/80` → `bg-neutral-100`, `text-muted-foreground/60` → `text-neutral-400`
- Row hover: `hover:bg-muted/50` → `hover:bg-neutral-50`
- Row border: `border-b` → `border-b border-neutral-100`
- Rank text: `text-muted-foreground` → `text-neutral-400`
- Badge `variant="secondary"` can stay (it's fine for lifecycle status)

**BiasDebtWidget.tsx:**
- Total count: `text-foreground` → `text-neutral-900`
- Subtitle: `text-muted-foreground` → `text-neutral-500`
- Pills: `border` stays, `text-muted-foreground` → `text-neutral-500`
- Stacked bar: `bg-muted` → `bg-neutral-100`

**PendingActionsWidget.tsx, ReviewsDueWidget.tsx, RecentDecisionsWidget.tsx, AgentActivityWidget.tsx:**
- Same pattern — replace Card with PortalCard, update all color tokens

**Step 1: Update all 6 files following the pattern above**

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 3: Commit**

```bash
git add src/portail/components/dashboard/TopRiskSystemsTable.tsx src/portail/components/dashboard/BiasDebtWidget.tsx src/portail/components/dashboard/PendingActionsWidget.tsx src/portail/components/dashboard/ReviewsDueWidget.tsx src/portail/components/dashboard/RecentDecisionsWidget.tsx src/portail/components/dashboard/AgentActivityWidget.tsx
git commit -m "style(portail): redesign list/table widgets with portal design system"
```

---

### Task 7: Update DiagnosticResultWidget

**Files:**
- Modify: `src/portail/components/dashboard/DiagnosticResultWidget.tsx`

This is the biggest widget (291 lines) with a circular gauge, domain breakdown, maturity levels, and action buttons.

**Step 1: Replace Card import**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```
With:
```tsx
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
```

**Step 2: Replace all Card wrappers**

Replace all `<Card>` with `<PortalCard>`, all `<CardHeader>/<CardTitle>` with `<PortalCardHeader>`, all `<CardContent>` with simple `<div>`.

**Step 3: Update color tokens**

- `text-foreground` → `text-neutral-900`
- `text-muted-foreground` → `text-neutral-500`
- `bg-muted` → `bg-neutral-100`
- `border-border` → `border-neutral-100`
- All `text-gray-*` → neutral equivalents

**Step 4: Update progress bars and gauge**

The circular gauge uses inline SVG — update any `stroke="currentColor"` or foreground references to use neutral-900 or keep the brand purple colors (those are fine).

Progress bars for domain breakdown: keep the colored bars, just update the background track from `bg-muted` → `bg-neutral-100`.

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 6: Commit**

```bash
git add src/portail/components/dashboard/DiagnosticResultWidget.tsx
git commit -m "style(portail): redesign DiagnosticResultWidget with portal design system"
```

---

### Task 8: Final verification and push

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 2: Push all commits**

```bash
git push
```
