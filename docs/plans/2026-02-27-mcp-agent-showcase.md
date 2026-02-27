# MCP Agent Showcase — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an animated MCP agent showcase section on the homepage between the hero and "Pourquoi le Cercle".

**Architecture:** Single new React component with pure CSS animations, inserted into the existing HomePage.

**Tech Stack:** React, Tailwind CSS, CSS @keyframes, Lucide icons

---

### Task 1: Create the McpAgentShowcase component

**Files:**
- Create: `src/components/home/McpAgentShowcase.tsx`

**What to build:**

A self-contained component with a two-column layout (text left, animated mockup right).

**Left column markup:**

```tsx
<div className="flex flex-col justify-center">
  {/* "NOUVEAU" badge */}
  <span className="inline-flex items-center gap-1.5 w-fit mb-4 px-3 py-1 rounded-full bg-[#ab54f3]/10 text-[#ab54f3] text-xs font-bold uppercase tracking-widest">
    <Zap className="h-3 w-3" />
    Nouveau
  </span>

  {/* Title */}
  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
    Connectez vos agents IA{" "}
    <span className="text-[#ab54f3]">via le serveur MCP</span>
  </h2>

  {/* Description */}
  <p className="text-base text-neutral-500 leading-relaxed mb-6 max-w-lg">
    Votre serveur Model Context Protocol permet à vos agents IA autonomes
    de remonter chaque décision algorithmique directement sur la plateforme.
    Monitoring en temps réel, traçabilité complète.
  </p>

  {/* CTA */}
  <Link
    to="/ressources"
    className="group inline-flex items-center gap-2 text-sm font-semibold text-[#ab54f3] hover:text-[#8b3fd4] transition-colors"
  >
    Découvrir le MCP
    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
  </Link>
</div>
```

**Right column — Animated mockup:**

A card (`bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden`) containing:

1. **Header bar:** "Activité des agents" title with a `+ Connecter Agent` button
2. **Empty state area:** "Aucun agent connecté" placeholder (visible at animation start)
3. **Config modal overlay:** Slide-in form with fields: Nom de l'agent, Endpoint MCP, Clé API
4. **Agent timeline entry:** "Agent-Conformité-01" with green "Connecté" badge
5. **Decision trace entry:** "Décision: approbation auto — scoring crédit" with green timeline dot
6. **Notification counter:** Badge on a bell icon incrementing from 0 to 1

Each element uses CSS classes that reference a shared animation with `animation-delay` to sequence the appearance:

```css
/* Define in a <style> tag or Tailwind @layer */
@keyframes mcpFadeIn {
  0%, 15% { opacity: 0; transform: translateY(8px); }
  20%, 85% { opacity: 1; transform: translateY(0); }
  90%, 100% { opacity: 0; transform: translateY(-4px); }
}

@keyframes mcpPulse {
  0%, 15% { box-shadow: 0 0 0 0 rgba(171,84,243,0); }
  18%, 25% { box-shadow: 0 0 0 6px rgba(171,84,243,0.3); }
  30%, 100% { box-shadow: 0 0 0 0 rgba(171,84,243,0); }
}

@keyframes mcpSlideIn {
  0%, 28% { opacity: 0; transform: translateY(20px) scale(0.95); }
  33%, 45% { opacity: 1; transform: translateY(0) scale(1); }
  50%, 100% { opacity: 0; transform: translateY(-10px) scale(0.95); }
}

@keyframes mcpAppear {
  0%, 48% { opacity: 0; transform: translateX(-12px); }
  53%, 82% { opacity: 1; transform: translateX(0); }
  87%, 100% { opacity: 0; }
}

@keyframes mcpTrace {
  0%, 63% { opacity: 0; transform: translateX(-12px); }
  68%, 82% { opacity: 1; transform: translateX(0); }
  87%, 100% { opacity: 0; }
}

@keyframes mcpBadge {
  0%, 78% { opacity: 0; transform: scale(0); }
  83%, 90% { opacity: 1; transform: scale(1); }
  95%, 100% { opacity: 0; transform: scale(0); }
}
```

All animations share `animation: <name> 8s ease-in-out infinite`.

Use inline `<style>` JSX tag within the component to keep CSS co-located:

```tsx
<style>{`
  @keyframes mcpFadeIn { ... }
  @keyframes mcpPulse { ... }
  /* etc. */
  .mcp-fadeIn { animation: mcpFadeIn 8s ease-in-out infinite; }
  .mcp-pulse { animation: mcpPulse 8s ease-in-out infinite; }
  .mcp-slideIn { animation: mcpSlideIn 8s ease-in-out infinite; }
  .mcp-appear { animation: mcpAppear 8s ease-in-out infinite; }
  .mcp-trace { animation: mcpTrace 8s ease-in-out infinite; }
  .mcp-badge { animation: mcpBadge 8s ease-in-out infinite; }
`}</style>
```

**Responsive behavior:**
- `lg:grid-cols-2` → 2 columns on desktop
- `grid-cols-1` → stacked on mobile (text on top, mockup below)

**Imports needed:**
- `Link` from react-router-dom
- `ArrowRight`, `Zap`, `Plus`, `Server`, `Bell`, `Activity`, `CheckCircle` from lucide-react

**Step 1:** Create `src/components/home/` directory and the component file with the full markup and CSS animations.

**Step 2:** Verify the component renders in isolation by importing it in HomePage temporarily.

**Step 3:** Commit: `feat(home): add MCP agent showcase component with CSS animations`

---

### Task 2: Insert the component into HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx`

**What to do:**

1. Add import at top of file:
```tsx
import { McpAgentShowcase } from "@/components/home/McpAgentShowcase";
```

2. Insert `<McpAgentShowcase />` between the end of the hero section (after the closing `</section>` at ~line 271) and before the BENTO "WHY" SECTION comment at ~line 273:

```tsx
        </section>

        {/* ============================================================ */}
        {/*  MCP AGENT SHOWCASE                                          */}
        {/* ============================================================ */}
        <McpAgentShowcase />

        {/* ============================================================ */}
        {/*  BENTO "WHY" SECTION                                         */}
        {/* ============================================================ */}
```

**Step 1:** Add import and insert component.

**Step 2:** Run `npx tsc --noEmit` to verify zero TypeScript errors.

**Step 3:** Visual check on dev server:
- Section visible between hero and "Pourquoi le Cercle"
- Animation loops correctly (~8s cycle)
- "NOUVEAU" badge visible
- Responsive: stacks on mobile
- Text is readable, CTA works

**Step 4:** Commit: `feat(home): integrate MCP agent showcase on homepage`
