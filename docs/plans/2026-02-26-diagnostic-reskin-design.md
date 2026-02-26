# Diagnostic Pages Re-skin Design

## Context

The homepage has been restyled to a light, modern SaaS aesthetic with mesh gradient backgrounds, white cards, and purple accents. The diagnostic quiz (`DiagnosticPage.tsx`) and results (`DiagnosticResultsPage.tsx`) still use the old dark purple/navy theme (`#1e1a30`). This design aligns them with the new UI.

## Approach

**Re-skin Light** -- change only Tailwind CSS classes and inline styles. Preserve all logic, animations, framer-motion variants, state management, i18n keys, localStorage handling, and JSX structure.

## Layout Decision

Keep fullscreen immersive layout (no header/footer) for both pages. The quiz benefits from zero distractions.

---

## DiagnosticPage.tsx

### Background
Replace `bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]` with the homepage mesh gradient:

```css
background: radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%),
            radial-gradient(at 50% 0%, hsla(250,100%,90%,0.5) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(340,100%,93%,0.4) 0, transparent 50%),
            white;
```

Applied via `style` prop on the outer `<div>`, replacing the Tailwind gradient classes.

### Top Bar
- Back button: `text-neutral-400 hover:text-neutral-700` (was `text-white/60 hover:text-white`)
- Counter text: `text-neutral-500 font-medium` (was `text-white/70`)
- Close button: `text-neutral-400 hover:text-neutral-700` (was `text-white/60 hover:text-white`)

### Progress Bar
- Track: `bg-neutral-200` (was `bg-white/10`)
- Fill: `bg-[#ab54f3]` (unchanged)

### Question Area
- Icon container: `bg-[#ab54f3]/10` (was `bg-[#ab54f3]/20`)
- Icon color: `text-[#ab54f3]` (unchanged)
- Question title: `text-neutral-900` (was `text-white`)
- Description: `text-neutral-500` (was `text-white/60`)

### Answer Buttons

**Default state:**
```
bg-white border border-neutral-200 rounded-2xl shadow-sm text-neutral-700
```
Was: `border-white/10 bg-white/5 text-white/80`

**Hover state:**
```
hover:border-neutral-300 hover:shadow-md hover:bg-neutral-50
```
Was: `hover:border-white/30 hover:bg-white/10 hover:text-white`

**Selected state (flash):**
```
border-[#ab54f3] bg-[#ab54f3]/5 shadow-md shadow-purple-500/10 text-neutral-900
```
Was: `border-[#ab54f3] bg-[#ab54f3]/20 text-white`

**Previously selected (when returning to a question):**
```
border-[#ab54f3]/50 bg-[#ab54f3]/5 text-neutral-900
```
Was: `border-[#ab54f3]/50 bg-[#ab54f3]/10 text-white`

### Score Badge (number in answer button)
- Default: `bg-neutral-100 text-neutral-500` (was `bg-white/10 text-white/60`)
- Hover: `group-hover:bg-neutral-200` (was `group-hover:bg-white/20`)
- Selected: `bg-[#ab54f3] text-white` (unchanged)
- Previously selected: `bg-[#ab54f3]/60 text-white` (unchanged)

### Footer
- Text: `text-neutral-300` (was `text-white/30`)

---

## DiagnosticResultsPage.tsx

### Background
Same mesh gradient as DiagnosticPage (via inline `style` prop).

### Loading State
- Background: mesh gradient (was dark `#1e1a30`)
- Spinner: `border-neutral-200 border-t-[#ab54f3]` (was `border-white/20 border-t-[#ab54f3]`)

### Header
- Subtitle badge: `bg-[#ab54f3]/10 text-[#ab54f3]` (unchanged -- already matches)
- Title: `text-neutral-900` (was `text-white`)

### Score Gauge
- Track circle stroke: `rgba(0,0,0,0.06)` (was `rgba(255,255,255,0.1)`)
- Progress circle stroke: unchanged (dynamic `color`)
- Score number: `text-neutral-900` (was `text-white`)
- "/ 30" text: `text-neutral-400` (was `text-white/50`)

### Level Badge
- Background: `{color}1A` (10% opacity, was `{color}33` / 20%)
- Border: `1px solid {color}` (unchanged)
- Text: `text-neutral-900` (was `text-white`)

### Domain Breakdown Cards
- Card: `border border-neutral-200 bg-white shadow-sm` (was `border-white/10 bg-white/5`)
- Icon: `text-neutral-400` (was `text-white/50`)
- Domain name: `text-neutral-700` (was `text-white/80`)
- Score bars filled: unchanged (dynamic color classes)
- Score bars empty: `bg-neutral-200` (was `bg-white/10`)
- Score text: `text-neutral-500 font-bold` (was `text-white/70`)
- Blurred cards: `opacity: 0.4, filter: blur(4px)` (unchanged, works on light bg too)

### Blur Overlay + CTA
- Gradient: `from-white via-white/95 to-transparent` (was `from-[#1e1a30] via-[#1e1a30]/95`)
- Lock icon container: `bg-neutral-100` (was `bg-white/10`)
- Lock icon: `text-neutral-400` (was `text-white/60`)
- Description text: `text-neutral-500` (was `text-white/60`)
- CTA button: `bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-white` (was solid `bg-[#ab54f3]`)
- CTA subtext: `text-neutral-400` (was `text-white/40`)

### Bottom Actions
- Retake button: `text-neutral-400 hover:text-neutral-600` (was `text-white/40 hover:text-white/70`)
- Retake icon: same
- Home link: `text-neutral-300 hover:text-neutral-500` (was `text-white/30 hover:text-white/50`)

---

## What Stays Unchanged
- All framer-motion animations (slideVariants, AnimatePresence, motion.div/circle)
- All state management (useState, useCallback, useEffect)
- All constants (STORAGE_KEY, QUESTION_KEYS, ANSWER_OPTIONS, DOMAIN_ICONS)
- All logic (handleAnswer, goBack, goHome, getMaturityLevel, getLevelColor, getScoreBarColor)
- JSX structure (element hierarchy, conditional rendering, map iterations)
- i18n translation keys
- localStorage read/write
- Navigation (useNavigate, Link)
- Mobile responsiveness (sm:, lg: breakpoints)
