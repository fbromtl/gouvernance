# Public Pages Restyling Design

## Goal
Apply the Ledger SaaS template design patterns consistently across all public pages (excluding portail/dashboard), ensuring visual coherence with the already-restyled HomePage and Header.

## Pages In Scope (9 main pages)
- AProposPage, ExpertsPage, ServicesPage, RessourcesPage, RejoindrePage
- EvenementsPage, ActualitesPage, ContactPage, OrganisationsPage

## Pages Out of Scope
- **DiagnosticPage / DiagnosticResultsPage** — self-contained wizard UI
- **MemberPublicPage** — standalone profile card
- **Auth pages** — separate portal flow
- **Legal pages** — minor touch-ups only (Confidentialite, MentionsLegales, Accessibilite)

## Design System Changes

### 1. Hero Sections: Dark gradient -> Light mesh gradient
```
Before: bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30] + white text
After:  White bg + pastel radial-gradients + text-neutral-950
```

### 2. Cards: shadcn defaults -> Template rounded + hover
```
Before: border-2 hover:border-primary/30
After:  rounded-3xl border border-neutral-200 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300
```

### 3. Section Backgrounds: Introduce dark neutral-950 sections
```
Alternate: white/neutral-50 | neutral-950 (dark with white text)
```

### 4. CTA Buttons: Solid primary -> Purple gradient pill
```
bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] rounded-full shadow-lg shadow-purple-500/25
```

### 5. Typography: Bolder, tighter
```
H2: text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight
```

### 6. Section Padding: More generous
```
py-24 sm:py-32
```

### 7. Icon Containers: Larger, gradient bg
```
rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 h-14 w-14
```

### 8. Badges: Rounded-full pills
```
rounded-full with subtle backgrounds
```

## Approved: 2026-02-25
