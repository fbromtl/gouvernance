# MCP Agent Showcase Section — Design

## Goal

Add an animated showcase section on the homepage (between hero social proof and "Pourquoi le Cercle") that demonstrates the MCP server agent connection feature with a looping dashboard animation.

## Placement

Between the hero section ending (framework social proof at ~line 270) and the "Bento WHY" section starting at line 276 in `HomePage.tsx`.

## Layout

Two-column layout on desktop (stacked on mobile), white background with top/bottom borders:

- **Left column:** Marketing text with "NOUVEAU" badge, headline, description, CTA button
- **Right column:** Animated dashboard mockup showing the agent connection flow

## Left Column Content

- Badge: "NOUVEAU" (purple pill, small)
- Title: "Connectez vos agents IA via le serveur MCP"
- Description: Explains that the MCP server allows AI agents to report algorithmic decisions directly to the platform with real-time monitoring
- CTA: "Découvrir le MCP" link/button

## Right Column — Animated Mockup

A stylized mini-dashboard widget showing the "Agent Activity" flow with a CSS `@keyframes` looping animation (~8s cycle):

1. **t=0s** — Dashboard with empty agent activity widget, "+ Connecter Agent" button visible
2. **t=1.5s** — Button pulses/glows to draw attention
3. **t=2.5s** — Config modal slides in (agent name, MCP endpoint, API key fields)
4. **t=4s** — Modal closes, new agent "Agent-Conformité-01" appears in timeline with green "Connecté" badge
5. **t=5.5s** — Decision trace appears: "Décision: approbation auto — scoring crédit" with green dot
6. **t=7s** — Notification badge appears on counter
7. **t=8s** — Reset, loop back to step 1

## Technical Approach

- Pure CSS `@keyframes` with `animation-delay` for sequencing (Approach A)
- No Framer Motion or external libraries needed
- GPU-accelerated CSS transforms for performance
- Responsive: 2 columns on lg+, stacked on mobile

## Style Tokens

- Brand purple: `#ab54f3`
- Navy dark: `#1e1a30`
- Background: white with `border-y border-neutral-200`
- Badge "Nouveau": `bg-[#ab54f3]/10 text-[#ab54f3]` pill
- CTA: `text-[#ab54f3] hover:text-[#8b3fd4]` with arrow
- Mockup card: `bg-white border border-neutral-200 rounded-2xl shadow-xl`
- Agent dot colors: green (#22c55e) for connected, blue (#3b82f6) for decisions

## Files

- Create: `src/components/home/McpAgentShowcase.tsx` — New component
- Modify: `src/pages/HomePage.tsx` — Insert component between hero and "Pourquoi le Cercle"
