# Ecosystem Marquee — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an infinite-scroll marquee of 13 Québec AI ecosystem logos (grayscale, clickable) to the homepage, placed after the hero section.

**Architecture:** Single presentational component `EcosystemMarquee.tsx` with CSS keyframe animation. Logos scraped from entity websites and stored locally. Component imported in `HomePage.tsx` before `McpAgentShowcase`.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS @keyframes

---

### Task 1: Scrape and store ecosystem logos

**Files:**
- Create: `public/logos/ecosystem/` directory
- Create: 13 logo files (PNG/SVG)

**Step 1: Create the directory**

```bash
mkdir -p public/logos/ecosystem
```

**Step 2: Download logos from each entity website**

For each of the 13 entities, fetch the best available logo (SVG preferred, PNG fallback). Use the website's favicon, Open Graph image, or visible logo. Target dimensions: at least 200px wide for clarity at `h-8` display.

Entities and their websites:
1. Mila — https://mila.quebec
2. IVADO — https://ivado.ca
3. OBVIA — https://www.obvia.ca
4. CIRANO — https://cirano.qc.ca
5. Scale AI — https://www.scaleai.ca
6. Min. Cybersécurité et Numérique — https://www.quebec.ca/gouvernement/ministere/cybersecurite-numerique
7. CAI — https://www.cai.gouv.qc.ca
8. Conseil de l'innovation du Québec — https://conseilinnovation.quebec
9. CDPQ — https://www.cdpq.com
10. Investissement Québec — https://www.investquebec.com
11. Centech — https://centech.co
12. District 3 — https://d3center.ca
13. Montréal International — https://www.montrealinternational.com

Save files with clean names: `mila.png`, `ivado.png`, `obvia.png`, `cirano.png`, `scaleai.png`, `mcn.png`, `cai.png`, `conseil-innovation.png`, `cdpq.png`, `investissement-quebec.png`, `centech.png`, `district3.png`, `montreal-international.png`

Use SVG extension when SVG is available.

**Step 3: Verify all 13 files exist**

```bash
ls -la public/logos/ecosystem/
```

Expected: 13 files, all non-zero size.

**Step 4: Commit**

```bash
git add public/logos/ecosystem/
git commit -m "feat(home): add ecosystem partner logos"
```

---

### Task 2: Create `EcosystemMarquee` component

**Files:**
- Create: `src/components/home/EcosystemMarquee.tsx`

**Step 1: Create the component**

```tsx
const ECOSYSTEM = [
  // Recherche & Innovation
  { name: "Mila", logo: "/logos/ecosystem/mila.png", url: "https://mila.quebec" },
  { name: "IVADO", logo: "/logos/ecosystem/ivado.png", url: "https://ivado.ca" },
  { name: "OBVIA", logo: "/logos/ecosystem/obvia.png", url: "https://www.obvia.ca" },
  { name: "CIRANO", logo: "/logos/ecosystem/cirano.png", url: "https://cirano.qc.ca" },
  { name: "Scale AI", logo: "/logos/ecosystem/scaleai.png", url: "https://www.scaleai.ca" },
  // Gouvernement & Régulateurs
  { name: "Min. Cybersécurité et Numérique", logo: "/logos/ecosystem/mcn.png", url: "https://www.quebec.ca/gouvernement/ministere/cybersecurite-numerique" },
  { name: "CAI", logo: "/logos/ecosystem/cai.png", url: "https://www.cai.gouv.qc.ca" },
  { name: "Conseil de l'innovation", logo: "/logos/ecosystem/conseil-innovation.png", url: "https://conseilinnovation.quebec" },
  // Industrie & Accélération
  { name: "CDPQ", logo: "/logos/ecosystem/cdpq.png", url: "https://www.cdpq.com" },
  { name: "Investissement Québec", logo: "/logos/ecosystem/investissement-quebec.png", url: "https://www.investquebec.com" },
  { name: "Centech", logo: "/logos/ecosystem/centech.png", url: "https://centech.co" },
  { name: "District 3", logo: "/logos/ecosystem/district3.png", url: "https://d3center.ca" },
  { name: "Montréal International", logo: "/logos/ecosystem/montreal-international.png", url: "https://www.montrealinternational.com" },
];

const CATEGORIES = [
  "Recherche & Innovation",
  "Gouvernement & Régulateurs",
  "Industrie & Accélération",
];

export function EcosystemMarquee() {
  // Duplicate items for seamless loop
  const items = [...ECOSYSTEM, ...ECOSYSTEM];

  return (
    <section className="bg-neutral-50 py-12 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
          Découvrez l'écosystème
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-3 py-1"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="relative group">
        {/* Edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex items-center gap-12 animate-marquee group-hover:[animation-play-state:paused]">
          {items.map((entity, i) => (
            <a
              key={`${entity.name}-${i}`}
              href={entity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title={entity.name}
            >
              <img
                src={entity.logo}
                alt={entity.name}
                className="h-8 w-auto object-contain"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem;
            padding: 0 1rem;
          }
        }
      `}</style>
    </section>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/home/EcosystemMarquee.tsx
git commit -m "feat(home): create EcosystemMarquee component"
```

---

### Task 3: Integrate into HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Step 1: Add import**

At line 21 (after McpAgentShowcase import), add:

```typescript
import { EcosystemMarquee } from "@/components/home/EcosystemMarquee";
```

**Step 2: Insert component**

At line 277 (before `<McpAgentShowcase />`), add:

```tsx
        {/* ============================================================ */}
        {/*  ECOSYSTEM MARQUEE                                           */}
        {/* ============================================================ */}
        <EcosystemMarquee />

```

The `<McpAgentShowcase />` line stays right after.

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): integrate ecosystem marquee after hero"
```

---

### Task 4: Visual verification

**Step 1: Start dev server and navigate to homepage**

Run: `npm run dev`
Navigate to: `http://localhost:5173/`

**Step 2: Verify section placement**

Scroll past the hero — the "Découvrez l'écosystème" section should appear before the MCP Agent Showcase.

**Step 3: Verify marquee behavior**

1. Logos scroll continuously left-to-right
2. All 13 logos display in grayscale
3. Hovering a logo: colorizes + full opacity
4. Hovering the marquee track: animation pauses
5. Clicking a logo: opens entity website in new tab
6. Edge fade gradients visible on left/right

**Step 4: Verify responsive**

Check mobile viewport — logos should still scroll. Reduced-motion: check static flex-wrap fallback.

**Step 5: Fix any issues found, commit**

```bash
git add -A
git commit -m "fix(home): ecosystem marquee visual adjustments"
```
