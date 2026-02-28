# ToolkitShowcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static "Boite a outils" section on `/ressources` with an animated CSS mockup showing AI document generation (form -> IA -> PDF), redirecting users to the free portail.

**Architecture:** Single new React component `ToolkitShowcase` using scoped CSS keyframes (same pattern as `VeilleShowcase`). The `RessourcesPage` section is updated to a two-column layout with text+CTA on the left and the animation on the right.

**Tech Stack:** React, CSS keyframes (scoped `<style>`), Lucide icons, Tailwind CSS

---

### Task 1: Create ToolkitShowcase component

**Files:**
- Create: `src/components/resources/ToolkitShowcase.tsx`

**Step 1: Create the component file with scoped CSS keyframes**

Create `src/components/resources/ToolkitShowcase.tsx` with the full animation. The component follows the exact same pattern as `VeilleShowcase.tsx` (lines 1-203):

- Scoped `<style>` block with CSS `@keyframes` for a 12s infinite loop
- `aria-hidden="true"` on the container
- `hover:[&_*]:[animation-play-state:paused]` on the card wrapper
- `prefers-reduced-motion` media query disabling animations
- All animated elements get class `toolkit-anim` for the reduced-motion selector

**Animation keyframes needed (12s cycle):**

```
@keyframes toolkitFormIn        — 0-12%: form fades in from below
@keyframes toolkitTypeField1    — 8-16%: "Acme Corp" types in (width grows)
@keyframes toolkitTypeField2    — 12-20%: "Services financiers" types in
@keyframes toolkitDocSelect     — 17-33%: doc selector cycles, settles on "Charte d'utilisation de l'IA"
@keyframes toolkitBtnPulse      — 33-42%: "Generer" button pulses purple glow
@keyframes toolkitProgress      — 42-65%: progress bar fills left to right
@keyframes toolkitLine1         — 50-65%: first text line fades in
@keyframes toolkitLine2         — 55-65%: second text line fades in
@keyframes toolkitLine3         — 60-65%: third text line fades in
@keyframes toolkitPdfSlide      — 65-90%: PDF preview slides in from right
@keyframes toolkitBadge         — 72-90%: "PDF pret" badge appears
@keyframes toolkitFadeOut       — 90-100%: everything fades out for cycle reset
```

**Component JSX structure:**

```tsx
<div className="flex justify-center" aria-hidden="true">
  <style>{`/* all keyframes here */`}</style>

  <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden group hover:[&_*]:[animation-play-state:paused]">
    {/* Header bar */}
    <div> <!-- icon FileText + "Generateur de documents" + badge "IA" --> </div>

    {/* Body */}
    <div className="px-5 py-5 min-h-[360px]">

      {/* Form section */}
      <div toolkit-anim formIn>
        {/* Field: Entreprise — label + input with auto-typed "Acme Corp" */}
        {/* Field: Secteur — label + input with auto-typed "Services financiers" */}
        {/* Document type selector — shows "Charte d'utilisation de l'IA" */}
      </div>

      {/* Generate button */}
      <button toolkit-anim btnPulse>
        <Sparkles /> Generer avec l'IA
      </button>

      {/* Progress bar */}
      <div toolkit-anim progress>
        <div> <!-- inner bar that grows width 0->100% --> </div>
      </div>

      {/* Generated text lines */}
      <div toolkit-anim line1>"1. Objectif et portee de la charte"</div>
      <div toolkit-anim line2>"2. Principes directeurs"</div>
      <div toolkit-anim line3>"3. Roles et responsabilites"</div>

      {/* PDF preview card */}
      <div toolkit-anim pdfSlide>
        <!-- Stylized PDF doc with title, sections, badge -->
        "Charte d'utilisation de l'IA — Acme Corp"
        Section headings + gray placeholder lines
        <Badge> "PDF pret" with CheckCircle2 </Badge>
      </div>
    </div>
  </div>
</div>
```

**Lucide icons to import:** `FileText, Sparkles, CheckCircle2`

**Step 2: Verify component renders in isolation**

Add a temporary import in `RessourcesPage.tsx` below `VeilleShowcase` import:
```tsx
import { ToolkitShowcase } from "@/components/resources/ToolkitShowcase";
```

And temporarily render `<ToolkitShowcase />` somewhere visible. Check in dev server that:
- Animation plays through all phases
- Hover pauses animation
- No console errors

**Step 3: Commit**

```bash
git add src/components/resources/ToolkitShowcase.tsx
git commit -m "feat(resources): add ToolkitShowcase animated component

CSS-animated mockup showing AI document generation flow:
form auto-fill → document type selection → AI generation → PDF preview.
12s cycle, pure CSS keyframes, same pattern as VeilleShowcase."
```

---

### Task 2: Replace "Boite a outils" section in RessourcesPage

**Files:**
- Modify: `src/pages/RessourcesPage.tsx`

**Step 1: Update imports**

Remove unused imports that were only used by the old toolkit section:
- Remove: `ClipboardList`, `FileCheck`, `Wrench`, `BookOpen` from lucide-react import
- Remove: the `outils` array constant (lines 16-21)
- Add: `import { ToolkitShowcase } from "@/components/resources/ToolkitShowcase";` (if not already added)
- Keep: `FileText`, `ArrowRight` (still used or used by other sections)

**Step 2: Replace the section JSX**

Replace the `{/* SECTION: Boite a outils */}` block (lines 61-98) with a two-column layout:

```tsx
{/* SECTION: Boite a outils */}
<section id="outils" className="py-24 sm:py-32 bg-neutral-950 scroll-mt-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Left: text + CTA */}
      <div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
          Boite a outils
        </h2>
        <p className="text-lg text-neutral-400 max-w-xl mb-4">
          Generez automatiquement vos documents de gouvernance IA :
          charte d'utilisation, politique d'IA generative, code d'ethique
          et registre des systemes.
        </p>
        <p className="text-sm text-neutral-500 mb-8">
          Gratuit — aucune carte de credit requise.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
        >
          Creer mes documents gratuitement
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Right: animated mockup */}
      <ToolkitShowcase />
    </div>
  </div>
</section>
```

**Step 3: Clean up unused imports**

After removing the old section, verify no remaining references to `ClipboardList`, `FileCheck`, `Wrench`, `BookOpen`, or the `outils` array. Remove any that are unused to avoid TS6133 errors.

**Step 4: Verify in dev server**

- Visit `/ressources` and scroll to the "Boite a outils" section
- Confirm two-column layout on desktop (text left, animation right)
- Confirm stacked layout on mobile (text on top, animation below)
- Confirm CTA button links to `/register`
- No TypeScript errors, no console errors

**Step 5: Commit**

```bash
git add src/pages/RessourcesPage.tsx
git commit -m "feat(resources): replace static toolkit with animated ToolkitShowcase

Two-column layout: text+CTA on left, CSS-animated document generation
mockup on right. Removes old static 4-item grid. CTA links to /register."
```

---

### Task 3: Final verification and push

**Step 1: Full page check**

Visit `/ressources` and verify all 4 sections render correctly:
1. Hero
2. Bibliotheque documentaire
3. Boite a outils (new animated version)
4. Veille reglementaire (existing VeilleShowcase)
5. Etudes de cas

**Step 2: Check footer anchor links**

Footer links to `/ressources#outils` should still scroll to the toolkit section correctly.

**Step 3: Check accessibility**

Enable `prefers-reduced-motion` in browser devtools and confirm the ToolkitShowcase shows a static state.

**Step 4: Push**

```bash
git push origin main
```
