# Auth Split Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform auth floating dialogs into landscape split cards with a gradient purple benefits panel on the right.

**Architecture:** Each auth page gets a right-side panel (`hidden md:flex`) inside the existing floating card. The card widens to `md:max-w-[820px]` on desktop while staying `max-w-[440px]` on mobile. A shared `BenefitsPanel` component avoids duplication.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide icons

---

### Task 1: Create shared BenefitsPanel component

**Files:**
- Create: `src/components/auth/BenefitsPanel.tsx`

**Step 1: Create the BenefitsPanel component**

Create `src/components/auth/BenefitsPanel.tsx` with this exact content:

```tsx
import { Zap, LayoutDashboard, ClipboardCheck, BadgeCheck } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Simple et rapide",
    description: "Inscription en quelques secondes",
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description: "Accédez en 1 clic à votre portail",
  },
  {
    icon: ClipboardCheck,
    title: "Diagnostic IA",
    description: "Évaluez votre maturité en 5 min",
  },
  {
    icon: BadgeCheck,
    title: "100% gratuit",
    description: "Aucun engagement",
  },
];

interface BenefitsPanelProps {
  title?: string;
}

export function BenefitsPanel({ title = "Pourquoi nous rejoindre ?" }: BenefitsPanelProps) {
  return (
    <div className="hidden md:flex flex-col justify-center w-[320px] shrink-0 bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4f46e5] p-8 text-white">
      <h2 className="text-lg font-semibold mb-8">{title}</h2>

      <div className="space-y-6">
        {benefits.map(({ icon: Icon, title: t, description }) => (
          <div key={t} className="flex items-start gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-white/15 shrink-0">
              <Icon className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-sm text-white/70 mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/20">
        <p className="text-sm text-white/70">
          <span className="font-semibold text-white">150+</span> professionnels nous font confiance
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 3: Commit**

```bash
git add src/components/auth/BenefitsPanel.tsx
git commit -m "feat(auth): add shared BenefitsPanel component"
```

---

### Task 2: Update RegisterPage.tsx to split card layout

**Files:**
- Modify: `src/pages/auth/RegisterPage.tsx`

**Step 1: Add BenefitsPanel import**

At line 3, after the lucide import, add:

```tsx
import { BenefitsPanel } from "@/components/auth/BenefitsPanel";
```

**Step 2: Widen the outer card container (line 145)**

Change line 145 from:
```tsx
<div className="relative w-full max-w-[440px] rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
```
To:
```tsx
<div className="relative w-full max-w-[440px] md:max-w-[820px] rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row">
```

**Step 3: Wrap the left side (form) in a flex-1 container**

The existing form content spans from the Close button (line 147) through the Footer div (line 327). Wrap everything from line 147 to line 327 in:

```tsx
{/* Left side — form */}
<div className="flex-1 min-w-0">
  ... existing content (Close button through Footer) ...
</div>
```

**Step 4: Add the BenefitsPanel after the left side wrapper**

Right after the closing `</div>` of the left side wrapper, before the closing card `</div>`, add:

```tsx
{/* Right side — benefits */}
<BenefitsPanel />
```

**Step 5: Move the X close button positioning**

The Close button `<Link to="/">` currently uses `absolute top-4 right-4`. Since we added `flex` to the parent, absolute positioning still works but the `right-4` should be relative to the left panel. Change line 150 from:

```tsx
className="absolute top-4 right-4 z-10 ...
```
To:
```tsx
className="absolute top-4 right-4 md:right-auto md:left-[calc(100%-3rem)] z-10 ...
```

Wait — simpler approach: keep absolute positioning inside the left panel div. Since the left panel is `relative` (no, it's not). Better: just leave it as-is. The Close button is inside the left `flex-1` wrapper which will naturally scope it. Actually since we're wrapping, the `absolute` will position relative to the nearest positioned ancestor. Add `relative` to the left wrapper:

Change the left wrapper to:
```tsx
<div className="relative flex-1 min-w-0">
```

This keeps the X button positioned in the top-right of the left panel, not the full card.

**Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 7: Commit**

```bash
git add src/pages/auth/RegisterPage.tsx
git commit -m "style(auth): add split card layout to RegisterPage"
```

---

### Task 3: Update LoginPage.tsx to split card layout

**Files:**
- Modify: `src/pages/auth/LoginPage.tsx`

Apply the same pattern as Task 2:

**Step 1: Add BenefitsPanel import**

After line 3, add:
```tsx
import { BenefitsPanel } from "@/components/auth/BenefitsPanel";
```

**Step 2: Widen card container (line 88)**

Change:
```tsx
<div className="relative w-full max-w-[440px] rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
```
To:
```tsx
<div className="relative w-full max-w-[440px] md:max-w-[820px] rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row">
```

**Step 3: Wrap left side in flex-1 container**

Wrap from Close button (line 90) through Footer (line 239) in:
```tsx
<div className="relative flex-1 min-w-0">
  ... existing content ...
</div>
```

**Step 4: Add BenefitsPanel with adapted title**

After left wrapper, add:
```tsx
<BenefitsPanel title="Retrouvez votre portail" />
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 6: Commit**

```bash
git add src/pages/auth/LoginPage.tsx
git commit -m "style(auth): add split card layout to LoginPage"
```

---

### Task 4: Final verification and push

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 2: Push all commits**

```bash
git push
```
