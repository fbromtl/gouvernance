# Mission Section Bento Grid — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic card-based "Notre mission" section on AProposPage with a premium 4-column bento grid that matches the HomePage design system.

**Architecture:** Single-file edit to `src/pages/AProposPage.tsx`. Replace the `#mission` section (lines 107-165) with a bento grid layout using exact CSS patterns from HomePage. Remove unused imports. No new files, no new dependencies.

**Tech Stack:** React, Tailwind CSS, Lucide React icons

**Design doc:** `docs/plans/2026-03-01-mission-section-redesign.md`

---

### Task 1: Replace section header with HomePage-style header

**Files:**
- Modify: `src/pages/AProposPage.tsx:108-112`

**Step 1: Replace the `<h2>Notre mission</h2>` header**

Replace lines 108-112 (the section opening and h2) with the HomePage bento section header pattern:

```tsx
<section id="mission" className="overflow-hidden border-y bg-white border-neutral-200 pt-24 pb-24 relative scroll-mt-20">
  <div className="z-10 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative">
    {/* Section header */}
    <div className="flex flex-col w-full mb-12">
      <div className="flex items-end justify-between w-full pb-5">
        <div className="flex gap-x-2 items-center">
          <span className="w-8 h-px bg-[#ab54f3]" />
          <span className="uppercase text-xs font-bold text-[#ab54f3] tracking-[0.2em]">
            Notre raison d&apos;être
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-neutral-200 mb-8" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-16">
        <h2 className="md:text-4xl lg:text-5xl leading-[1.05] text-3xl text-neutral-900 tracking-tight max-w-3xl font-semibold">
          L&apos;IA avance. Votre gouvernance doit avancer plus vite.
        </h2>
        <div className="lg:max-w-sm flex-shrink-0 lg:pt-2">
          <p className="leading-relaxed text-base text-neutral-600">
            Le Cercle structure l&apos;expertise collective pour que chaque décision IA soit éclairée, conforme et responsable.
          </p>
        </div>
      </div>
    </div>
```

**Step 2: Verify the dev server compiles without error**

Run: preview server check — page should load, header should show violet line + tag + editorial title + right-side subtitle.

**Step 3: Commit**

```bash
git add src/pages/AProposPage.tsx
git commit -m "feat(a-propos): replace mission header with HomePage-style bento header"
```

---

### Task 2: Build the 4-column bento grid container and Column 1 (Mission)

**Files:**
- Modify: `src/pages/AProposPage.tsx` — replace inner content of #mission section

**Step 1: Add bento grid container and Column 1**

After the section header (from Task 1), add the bento grid. Replace the entire old grid content (`<div className="grid lg:grid-cols-2 ...">` through its closing `</div>`) with:

```tsx
    {/* Bento grid – 4 columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Column 1: Mission */}
      <div className="group flex flex-col hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500 bg-neutral-50 lg:h-[520px] border-neutral-200/60 border rounded-[40px] px-10 py-10 justify-between">
        <div>
          <div className="w-12 h-12 bg-[#ab54f3]/10 rounded-2xl flex items-center justify-center text-[#ab54f3] mb-8">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-2xl text-neutral-900 mb-6 tracking-tight leading-tight font-semibold">
            Accompagner l&apos;adoption responsable de l&apos;IA.
          </h3>
          <p className="text-neutral-500 leading-relaxed">
            Face à la multiplication des cadres réglementaires et à l&apos;accélération technologique, les dirigeants ont besoin d&apos;un espace structuré pour naviguer avec confiance.
          </p>
        </div>
        <div className="pt-6 border-t border-neutral-100">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Depuis 2024
          </span>
        </div>
      </div>
```

**Step 2: Verify Column 1 renders correctly**

Run: preview — first bento card should appear with Shield icon, title, text, and "Depuis 2024" footer tag.

**Step 3: Commit**

```bash
git add src/pages/AProposPage.tsx
git commit -m "feat(a-propos): add bento grid container and Mission column"
```

---

### Task 3: Add Column 2 (Photo + Vision)

**Files:**
- Modify: `src/pages/AProposPage.tsx` — add after Column 1 inside the bento grid

**Step 1: Add Column 2 code**

```tsx
      {/* Column 2: Photo + Vision */}
      <div className="relative rounded-[40px] overflow-hidden lg:h-[520px] h-[400px] bg-neutral-900 group">
        <img
          src="/images-gouvernance-ai/businesspeople-meeting.jpg"
          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
          alt="Réunion de gouvernance IA"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
        <div className="absolute top-6 left-6">
          <span className="inline-block px-3 py-1 bg-[#ab54f3] rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
            Notre vision
          </span>
        </div>
        <div className="absolute bottom-10 left-10 text-white pr-10">
          <p className="text-2xl leading-tight font-semibold">
            Devenir la référence francophone en gouvernance de l&apos;intelligence artificielle.
          </p>
        </div>
      </div>
```

**Step 2: Verify Column 2 renders correctly**

Run: preview — photo card should show the meeting image at 60% opacity, "Notre vision" violet badge at top, vision text at bottom white, image should zoom on hover.

**Step 3: Commit**

```bash
git add src/pages/AProposPage.tsx
git commit -m "feat(a-propos): add Photo + Vision bento column"
```

---

### Task 4: Add Column 3 (Values — 3 stacked sub-cards)

**Files:**
- Modify: `src/pages/AProposPage.tsx` — add after Column 2 inside the bento grid

**Step 1: Add Column 3 code**

```tsx
      {/* Column 3: Values */}
      <div className="bg-neutral-50 border border-neutral-200/60 rounded-[40px] p-6 lg:h-[520px] flex flex-col justify-between gap-4 hover:shadow-xl hover:shadow-[#ab54f3]/5 transition-all duration-500">
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#ab54f3]/10 rounded-xl flex items-center justify-center text-[#ab54f3]">
              <Eye className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-neutral-900">Transparence</h4>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Méthodologies ouvertes, référentiels partagés.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#ab54f3]/10 rounded-xl flex items-center justify-center text-[#ab54f3]">
              <Shield className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-neutral-900">Rigueur</h4>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Cadres reconnus, validation systématique.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#ab54f3]/10 rounded-xl flex items-center justify-center text-[#ab54f3]">
              <Users className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-neutral-900">Collaboration</h4>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            L&apos;intelligence collective au service de la gouvernance.
          </p>
        </div>
      </div>
```

**Step 2: Verify Column 3 renders correctly**

Run: preview — third card should show 3 stacked white sub-cards inside a neutral-50 container, each with a small violet icon + title + description.

**Step 3: Commit**

```bash
git add src/pages/AProposPage.tsx
git commit -m "feat(a-propos): add Values bento column with 3 stacked sub-cards"
```

---

### Task 5: Add Column 4 (Stats — dark card)

**Files:**
- Modify: `src/pages/AProposPage.tsx` — add after Column 3 inside the bento grid

**Step 1: Add Column 4 code and close the grid + section**

```tsx
      {/* Column 4: Stats */}
      <div className="bg-neutral-950 p-10 rounded-[40px] flex flex-col justify-between lg:h-[520px] text-white relative hover:shadow-2xl hover:shadow-[#ab54f3]/20 transition-all duration-500">
        <div>
          <span className="text-lg font-medium tracking-tight text-[#ab54f3]">
            Le Cercle en chiffres
          </span>
        </div>
        <div className="space-y-6">
          <div className="group/link cursor-pointer">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Experts réseau</p>
            <p className="text-4xl font-bold border-b border-white/10 pb-2 group-hover/link:text-[#ab54f3] transition-colors">
              150+
            </p>
          </div>
          <div className="group/link cursor-pointer">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Disciplines</p>
            <p className="text-4xl font-bold group-hover/link:text-[#ab54f3] transition-colors">
              15
            </p>
          </div>
        </div>
        <Link
          to="/rejoindre"
          className="w-full bg-white text-neutral-900 py-4 rounded-[20px] text-sm font-semibold hover:bg-[#ab54f3] hover:text-white transition-colors duration-300 shadow-lg shadow-neutral-900 text-center block"
        >
          Rejoindre le Cercle
        </Link>
      </div>
    </div>
  </div>
</section>
```

**Step 2: Verify Column 4 renders correctly**

Run: preview — dark card should show "Le Cercle en chiffres" in violet, bold 150+ and 15 stats with hover-to-violet effect, white CTA button at bottom.

**Step 3: Commit**

```bash
git add src/pages/AProposPage.tsx
git commit -m "feat(a-propos): add Stats dark bento column with CTA"
```

---

### Task 6: Clean up unused imports and data arrays

**Files:**
- Modify: `src/pages/AProposPage.tsx:1-30`

**Step 1: Remove unused imports**

The `values` array (lines 17-30) is no longer used — all value content is now inline in Column 3. Remove it.

Remove unused imports that are no longer referenced anywhere in the file:
- `Target` — was used by values cards, now removed
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` — check if still used by other sections (Notre approche still uses Card). Keep Card imports if `frameworks` section still uses them.
- `Badge` — check if still used by frameworks section. Keep if yes.

After removing:
```tsx
import { Link } from "react-router-dom";
import {
  Eye,
  Users,
  BookOpen,
  Shield,
  FileCheck,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
```

Note: Keep `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`, and `Badge` because they are still used by the "Notre approche" frameworks section.

**Step 2: Remove the `values` array**

Delete the entire `values` const (lines 17-30) and the blank line after it.

**Step 3: Verify everything compiles and renders**

Run: preview — ensure no console errors, all 4 sections render (Hero, Mission bento, Notre approche, Gouvernance).

**Step 4: Commit**

```bash
git add src/pages/AProposPage.tsx
git commit -m "refactor(a-propos): remove unused values array and Target import"
```

---

### Task 7: Visual verification of complete implementation

**Files:**
- Read-only: `src/pages/AProposPage.tsx`

**Step 1: Full-page desktop verification**

Run: preview at desktop width — verify:
- Section header has violet line + "Notre raison d'être" tag + editorial title + right-side subtitle
- 4-column bento grid at `lg` breakpoint
- Column 1: neutral-50 bg, Shield icon, mission text, "Depuis 2024" footer
- Column 2: meeting photo with opacity-60, gradient overlay, violet "Notre vision" badge, white vision text
- Column 3: neutral-50 container with 3 white sub-cards (Eye/Shield/Users icons)
- Column 4: dark bg-neutral-950, violet header, bold stats, white CTA button
- Hover states work on all 4 cards

**Step 2: Responsive verification**

Run: preview at tablet width (md) — verify 2x2 grid layout.
Run: preview at mobile width (sm) — verify single column stacked layout.

**Step 3: Verify rest of page unaffected**

Scroll to "Notre approche" and "Gouvernance du cercle" — verify they render exactly as before.

**Step 4: Final commit if any adjustments were needed**

```bash
git add src/pages/AProposPage.tsx
git commit -m "fix(a-propos): responsive adjustments for mission bento grid"
```
