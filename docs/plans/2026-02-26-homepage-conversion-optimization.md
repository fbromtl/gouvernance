# Homepage Conversion Optimization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Increase free signups and diagnostic launches by optimizing CTAs across HomePage.

**Architecture:** Five surgical edits to `src/pages/HomePage.tsx`. No new files, no new dependencies. Add scroll-aware state for sticky bar, remove unused email state, add intermediate CTAs between existing sections.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, react-router-dom (Link), lucide-react (X icon added)

---

### Task 1: Clean up imports and state — remove email, add scroll + dismiss state

**Files:**
- Modify: `src/pages/HomePage.tsx:1-29`

**Step 1: Update imports and state**

Replace lines 1-29 with:

```tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  Lock,
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  CreditCard,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  ChevronDown,
  AlertTriangle,
  X,
} from "lucide-react";

import { SEO, JsonLd } from "@/components/SEO";

/* ================================================================== */
/*  HOME PAGE – Template-inspired design with governance content       */
/* ================================================================== */

export function HomePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
```

Changes:
- Add `useEffect` import
- Remove `Mail` import (no longer needed)
- Add `X` import (for sticky bar close button)
- Remove `const [email, setEmail] = useState("")`
- Add `showStickyBar` and `stickyDismissed` state

**Step 2: Add scroll listener useEffect after state declarations**

Insert right after the state declarations (after line with `stickyDismissed`), before `return (`:

```tsx

  // Sticky CTA bar: show after scrolling past hero, hide near pricing
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pricingEl = document.getElementById("pricing");
      const pricingTop = pricingEl ? pricingEl.offsetTop - window.innerHeight : Infinity;
      setShowStickyBar(scrollY > 500 && scrollY < pricingTop);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
```

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: May have errors about unused `email` references — that's fine, we fix those in Task 2.

**Step 4: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "refactor(home): clean imports, add scroll state for sticky CTA bar"
```

---

### Task 2: Replace hero email field with 2 CTA buttons + reassurance line

**Files:**
- Modify: `src/pages/HomePage.tsx` — the CTA row block (lines ~97-125)

**Step 1: Replace the CTA row**

Find this block (the `{/* CTA row */}` comment through to its closing `</div>`, lines 97-125):

```tsx
            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20 items-center justify-center w-full max-w-2xl mx-auto">
              <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Mail className="h-[18px] w-[18px] text-neutral-400 group-focus-within:text-[#ab54f3]/60 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre courriel"
                  className="w-full bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full pl-12 pr-6 py-4 text-base font-medium text-neutral-900 focus:outline-none focus:ring-4 focus:ring-[#ab54f3]/10 focus:border-[#ab54f3]/40 transition-all placeholder:text-neutral-400 shadow-sm hover:border-neutral-300"
                />
              </div>
              <Link
                to="/inscription"
                className="group inline-flex items-center gap-2 font-medium text-white bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] rounded-full pt-4 pr-8 pb-4 pl-8 relative shadow-lg overflow-hidden transition-all duration-300 hover:shadow-[#ab54f3]/50"
                style={{
                  boxShadow:
                    "0 15px 33px -12px rgba(171,84,243,0.6), inset 0 4px 6.3px rgba(255,255,255,0.3), inset 0 -5px 6.3px rgba(0,0,0,0.1)",
                }}
              >
                <div className="group-hover:translate-y-0 transition-transform duration-300 bg-white/10 absolute inset-0 translate-y-full" />
                <span className="relative flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
```

Replace with:

```tsx
            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-center w-full max-w-2xl mx-auto">
              <Link
                to="/inscription"
                className="group inline-flex items-center gap-2 font-medium text-white bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] rounded-full py-4 px-8 relative shadow-lg overflow-hidden transition-all duration-300 hover:shadow-[#ab54f3]/50"
                style={{
                  boxShadow:
                    "0 15px 33px -12px rgba(171,84,243,0.6), inset 0 4px 6.3px rgba(255,255,255,0.3), inset 0 -5px 6.3px rgba(0,0,0,0.1)",
                }}
              >
                <div className="group-hover:translate-y-0 transition-transform duration-300 bg-white/10 absolute inset-0 translate-y-full" />
                <span className="relative flex items-center gap-2">
                  Créer mon compte gratuit
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                to="/diagnostic"
                className="inline-flex items-center gap-2 font-medium text-neutral-900 bg-white border border-neutral-200 rounded-full py-4 px-8 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all"
              >
                Lancer le diagnostic
                <Zap className="w-4 h-4" />
              </Link>
            </div>

            {/* Reassurance line */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Gratuit</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Sans carte de crédit</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Diagnostic en 10 min</span>
            </div>
```

Key changes: removed email input + Mail icon usage, added 2 Link buttons, added reassurance checkmarks, reduced `mb-20` to `mb-8` (reassurance takes rest of space).

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS (no more `email` or `Mail` references)

**Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): replace email field with dual CTA buttons + reassurance line"
```

---

### Task 3: Add social proof avatars between CTAs and dashboard mockup

**Files:**
- Modify: `src/pages/HomePage.tsx` — insert between reassurance line and `{/* ── Dashboard Mockup ── */}`

**Step 1: Insert social proof block**

Find the line `{/* ── Dashboard Mockup ── */}` and insert BEFORE it:

```tsx
            {/* ── Social Proof Avatars ── */}
            <div className="flex items-center justify-center gap-3 mb-16">
              <div className="flex -space-x-2.5">
                {[
                  "/images-gouvernance-ai/businesswoman-meeting.jpg",
                  "/images-gouvernance-ai/businessman-ai.jpg",
                  "/images-gouvernance-ai/businesspeople-meeting.jpg",
                  "/images-gouvernance-ai/businessman-laptop.jpg",
                  "/images-gouvernance-ai/coworking.jpg",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">150+ organisations</span> nous font confiance
              </p>
            </div>

```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): add social proof avatars above the fold"
```

---

### Task 4: Add sticky CTA bar at bottom of page

**Files:**
- Modify: `src/pages/HomePage.tsx` — insert just before the closing `</div>` and `</>` at the very end of the component's return JSX

**Step 1: Add id="pricing" to the pricing section**

Find this line:
```tsx
        <section className="max-w-7xl mr-auto ml-auto pt-24 pr-6 pb-24 pl-6">
```
(the PRICING section, around line 821)

Replace with:
```tsx
        <section id="pricing" className="max-w-7xl mr-auto ml-auto pt-24 pr-6 pb-24 pl-6">
```

**Step 2: Insert sticky bar before the closing tags**

Find the last lines of the return JSX:
```tsx
      </div>
    </>
  );
}
```

Insert the sticky bar BEFORE `</div>`:

```tsx
        {/* ============================================================ */}
        {/*  STICKY CTA BAR                                               */}
        {/* ============================================================ */}
        {showStickyBar && !stickyDismissed && (
          <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg px-6 py-3">
              <p className="text-sm font-medium text-neutral-700 hidden sm:block">
                Évaluez votre maturité IA —{" "}
                <span className="text-neutral-500">Gratuit, 10 minutes</span>
              </p>
              <p className="text-sm font-medium text-neutral-700 sm:hidden">
                Diagnostic IA gratuit
              </p>
              <div className="flex items-center gap-2">
                <Link
                  to="/inscription"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 transition-all whitespace-nowrap"
                >
                  S&apos;inscrire
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setStickyDismissed(true)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
```

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): add sticky CTA bar that appears on scroll"
```

---

### Task 5: Add 3 intermediate CTAs after key sections

**Files:**
- Modify: `src/pages/HomePage.tsx` — 3 insertions

**Step 1: CTA after Bento "Pourquoi le Cercle" section**

Find the closing of the Bento section (after `</section>`, around line 368-369 where we see `{/* HOW IT WORKS`):

```tsx
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS – 3 steps                                      */}
```

Insert between `</section>` and the HOW IT WORKS comment:

```tsx
        </section>

        {/* Intermediate CTA */}
        <div className="text-center py-10 bg-white">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
          >
            Rejoindre le Cercle gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/*  HOW IT WORKS – 3 steps                                      */}
```

**Step 2: CTA after Testimonials section**

Find the closing of the Testimonials section (after `</section>`, around line 816 where we see `{/* PRICING`):

```tsx
        </section>

        {/* ============================================================ */}
        {/*  PRICING                                                      */}
```

Insert between `</section>` and the PRICING comment:

```tsx
        </section>

        {/* Intermediate CTA */}
        <div className="text-center py-10">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-neutral-800 transition-all"
          >
            Commencer mon évaluation gratuite
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/*  PRICING                                                      */}
```

**Step 3: CTA after FAQ section**

Find the closing of the FAQ section (after `</section>`, around line 1055 where we see `{/* REGULATORY URGENCY BANNER`):

```tsx
        </section>

        {/* ============================================================ */}
        {/*  REGULATORY URGENCY BANNER                                    */}
```

Insert between `</section>` and the REGULATORY comment:

```tsx
        </section>

        {/* Intermediate CTA */}
        <div className="text-center py-10">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
          >
            Créer mon compte — C&apos;est gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ============================================================ */}
        {/*  REGULATORY URGENCY BANNER                                    */}
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): add 3 intermediate CTAs between sections"
```

---

### Task 6: Upgrade urgency banner to actionable button

**Files:**
- Modify: `src/pages/HomePage.tsx` — the urgency banner Link (around line 1071-1077)

**Step 1: Replace the text link with a button-style Link**

Find:
```tsx
            <Link
              to="/services#diagnostic"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium text-[#ab54f3] hover:text-[#8b3fd4] transition-colors whitespace-nowrap"
            >
              Vérifier ma conformité
              <ArrowRight className="w-4 h-4" />
            </Link>
```

Replace with:
```tsx
            <Link
              to="/inscription"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-[#ab54f3] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:brightness-110 transition-all whitespace-nowrap"
            >
              Vérifier maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
```

Changes: text link → pill button, `/services#diagnostic` → `/inscription`, label shortened.

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Final visual verification**

Run dev server and check:
- Hero: 2 buttons (violet + white), reassurance line with green checks, avatar row
- Scroll down: sticky bar appears after hero, disappears near pricing
- Sticky bar: dismiss button works
- 3 intermediate CTAs visible between Bento→HowItWorks, Testimonials→Pricing, FAQ→Banner
- Urgency banner: violet button instead of text link

**Step 4: Commit and push**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): upgrade urgency banner to actionable CTA button"
git push
```
