# Diagnostic Pages Re-skin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Re-skin DiagnosticPage.tsx and DiagnosticResultsPage.tsx from dark purple/navy theme to light modern UI matching the homepage.

**Architecture:** CSS-only changes — swap Tailwind classes and inline styles. Zero logic, animation, or structure changes. Two independent tasks, one per file.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, framer-motion

---

### Task 1: Re-skin DiagnosticPage.tsx

**Files:**
- Modify: `src/pages/DiagnosticPage.tsx`

**Reference:** Design spec at `docs/plans/2026-02-26-diagnostic-reskin-design.md`, section "DiagnosticPage.tsx"

**Step 1: Replace the outer container background (line 148)**

Find:
```tsx
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]">
```

Replace with:
```tsx
    <div className="fixed inset-0 flex flex-col" style={{ background: "radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(250,100%,90%,0.5) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(340,100%,93%,0.4) 0, transparent 50%), white" }}>
```

**Step 2: Restyle the back button (line 154)**

Find:
```tsx
          className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white disabled:invisible"
```

Replace with:
```tsx
          className="flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-neutral-700 disabled:invisible"
```

**Step 3: Restyle the question counter (line 160)**

Find:
```tsx
        <span className="text-sm font-medium text-white/70">
```

Replace with:
```tsx
        <span className="text-sm font-medium text-neutral-500">
```

**Step 4: Restyle the close button (line 166)**

Find:
```tsx
          className="text-white/60 transition-colors hover:text-white"
```

Replace with:
```tsx
          className="text-neutral-400 transition-colors hover:text-neutral-700"
```

**Step 5: Restyle the progress bar track (line 174)**

Find:
```tsx
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
```

Replace with:
```tsx
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
```

**Step 6: Restyle the icon container (line 199)**

Find:
```tsx
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ab54f3]/20 sm:h-20 sm:w-20">
```

Replace with:
```tsx
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ab54f3]/10 sm:h-20 sm:w-20">
```

**Step 7: Restyle the question title (line 205)**

Find:
```tsx
            <h2 className="mb-3 text-center text-xl font-bold text-white sm:text-2xl lg:text-3xl">
```

Replace with:
```tsx
            <h2 className="mb-3 text-center text-xl font-bold text-neutral-900 sm:text-2xl lg:text-3xl">
```

**Step 8: Restyle the question description (line 208)**

Find:
```tsx
            <p className="mb-10 text-center text-sm text-white/60 sm:text-base">
```

Replace with:
```tsx
            <p className="mb-10 text-center text-sm text-neutral-500 sm:text-base">
```

**Step 9: Restyle the answer button outer wrapper (lines 222-228)**

Find:
```tsx
                    className={`group relative w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#ab54f3] bg-[#ab54f3]/20 text-white"
                        : wasPreviouslySelected
                          ? "border-[#ab54f3]/50 bg-[#ab54f3]/10 text-white"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    }`}
```

Replace with:
```tsx
                    className={`group relative w-full rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#ab54f3] bg-[#ab54f3]/5 shadow-md shadow-purple-500/10 text-neutral-900"
                        : wasPreviouslySelected
                          ? "border-[#ab54f3]/50 bg-[#ab54f3]/5 text-neutral-900"
                          : "border-neutral-200 bg-white shadow-sm text-neutral-700 hover:border-neutral-300 hover:shadow-md hover:bg-neutral-50"
                    }`}
```

**Step 10: Restyle the score badge in answer buttons (lines 232-238)**

Find:
```tsx
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                          isSelected
                            ? "bg-[#ab54f3] text-white"
                            : wasPreviouslySelected
                              ? "bg-[#ab54f3]/60 text-white"
                              : "bg-white/10 text-white/60 group-hover:bg-white/20"
                        }`}
```

Replace with:
```tsx
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                          isSelected
                            ? "bg-[#ab54f3] text-white"
                            : wasPreviouslySelected
                              ? "bg-[#ab54f3]/60 text-white"
                              : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                        }`}
```

**Step 11: Restyle the footer text (line 256)**

Find:
```tsx
        <p className="text-xs text-white/30">
```

Replace with:
```tsx
        <p className="text-xs text-neutral-300">
```

**Step 12: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 13: Commit**

```bash
git add src/pages/DiagnosticPage.tsx
git commit -m "style(diagnostic): re-skin quiz page to light theme"
```

---

### Task 2: Re-skin DiagnosticResultsPage.tsx

**Files:**
- Modify: `src/pages/DiagnosticResultsPage.tsx`

**Reference:** Design spec at `docs/plans/2026-02-26-diagnostic-reskin-design.md`, section "DiagnosticResultsPage.tsx"

**Step 1: Restyle the loading state background (line 182)**

Find:
```tsx
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]">
```

Replace with:
```tsx
      <div className="flex min-h-screen items-center justify-center" style={{ background: "radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(250,100%,90%,0.5) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(340,100%,93%,0.4) 0, transparent 50%), white" }}>
```

**Step 2: Restyle the loading spinner (line 183)**

Find:
```tsx
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ab54f3]" />
```

Replace with:
```tsx
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#ab54f3]" />
```

**Step 3: Restyle the main page background (line 192)**

Find:
```tsx
    <div className="min-h-screen bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]">
```

Replace with:
```tsx
    <div className="min-h-screen" style={{ background: "radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(250,100%,90%,0.5) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(340,100%,93%,0.4) 0, transparent 50%), white" }}>
```

**Step 4: Restyle the page title (line 204)**

Find:
```tsx
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
```

Replace with:
```tsx
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
```

**Step 5: Restyle the gauge track circle stroke (line 110)**

Find:
```tsx
            stroke="rgba(255,255,255,0.1)"
```

Replace with:
```tsx
            stroke="rgba(0,0,0,0.06)"
```

**Step 6: Restyle the score number text (line 131)**

Find:
```tsx
            className="text-4xl font-bold text-white"
```

Replace with:
```tsx
            className="text-4xl font-bold text-neutral-900"
```

**Step 7: Restyle the "/ 30" text (line 138)**

Find:
```tsx
          <span className="text-sm text-white/50">/ 30</span>
```

Replace with:
```tsx
          <span className="text-sm text-neutral-400">/ 30</span>
```

**Step 8: Restyle the level badge (line 147)**

Find:
```tsx
        className="mt-4 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
        style={{ backgroundColor: color + "33", border: `1px solid ${color}` }}
```

Replace with:
```tsx
        className="mt-4 rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-900"
        style={{ backgroundColor: color + "1A", border: `1px solid ${color}` }}
```

**Step 9: Restyle the domain breakdown cards (line 228)**

Find:
```tsx
                  className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 ${
```

Replace with:
```tsx
                  className={`flex items-center gap-3 rounded-xl border border-neutral-200 bg-white shadow-sm px-4 py-3 ${
```

**Step 10: Restyle the domain icon color (line 233)**

Find:
```tsx
                  <Icon className="h-5 w-5 shrink-0 text-white/50" />
```

Replace with:
```tsx
                  <Icon className="h-5 w-5 shrink-0 text-neutral-400" />
```

**Step 11: Restyle the domain name text (line 234)**

Find:
```tsx
                  <span className="flex-1 text-sm text-white/80">
```

Replace with:
```tsx
                  <span className="flex-1 text-sm text-neutral-700">
```

**Step 12: Restyle the empty score bars (line 243)**

Find:
```tsx
                            step <= value - 1 ? getScoreBarColor(value) : "bg-white/10"
```

Replace with:
```tsx
                            step <= value - 1 ? getScoreBarColor(value) : "bg-neutral-200"
```

**Step 13: Restyle the score text (line 248)**

Find:
```tsx
                    <span className="w-8 text-right text-sm font-bold text-white/70">
```

Replace with:
```tsx
                    <span className="w-8 text-right text-sm font-bold text-neutral-500">
```

**Step 14: Restyle the blur overlay gradient (line 262)**

Find:
```tsx
            className="absolute inset-x-0 bottom-0 flex flex-col items-center rounded-2xl bg-gradient-to-t from-[#1e1a30] via-[#1e1a30]/95 to-transparent px-6 pb-6 pt-24"
```

Replace with:
```tsx
            className="absolute inset-x-0 bottom-0 flex flex-col items-center rounded-2xl bg-gradient-to-t from-white via-white/95 to-transparent px-6 pb-6 pt-24"
```

**Step 15: Restyle the lock icon container (line 264)**

Find:
```tsx
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
```

Replace with:
```tsx
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
```

**Step 16: Restyle the lock icon (line 265)**

Find:
```tsx
              <LockIcon className="h-6 w-6 text-white/60" />
```

Replace with:
```tsx
              <LockIcon className="h-6 w-6 text-neutral-400" />
```

**Step 17: Restyle the locked description text (line 267)**

Find:
```tsx
            <p className="mb-6 max-w-md text-center text-sm text-white/60">
```

Replace with:
```tsx
            <p className="mb-6 max-w-md text-center text-sm text-neutral-500">
```

**Step 18: Restyle the CTA button (line 272)**

Find:
```tsx
              className="group inline-flex items-center gap-2 rounded-xl bg-[#ab54f3] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ab54f3]/25 transition-all hover:bg-[#9b3fe3] hover:shadow-[#ab54f3]/40"
```

Replace with:
```tsx
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
```

**Step 19: Restyle the CTA subtext (line 277)**

Find:
```tsx
            <p className="mt-3 text-xs text-white/40">
```

Replace with:
```tsx
            <p className="mt-3 text-xs text-neutral-400">
```

**Step 20: Restyle the retake button (line 290)**

Find:
```tsx
            className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
```

Replace with:
```tsx
            className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-600"
```

**Step 21: Restyle the home link (line 295)**

Find:
```tsx
          <Link to="/" className="text-xs text-white/30 hover:text-white/50">
```

Replace with:
```tsx
          <Link to="/" className="text-xs text-neutral-300 hover:text-neutral-500">
```

**Step 22: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 23: Commit**

```bash
git add src/pages/DiagnosticResultsPage.tsx
git commit -m "style(diagnostic): re-skin results page to light theme"
```
