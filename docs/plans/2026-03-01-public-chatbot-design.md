# Public Chatbot — Conversion Assistant Design

## Goal

Add an AI chatbot to the public website (all pages) that answers visitor questions about the Cercle de Gouvernance de l'IA and guides them toward creating a free account at `/inscription`.

## Architecture

Separate edge function + dedicated client hook, reusing the existing `FloatingChat` UI component.

## Key Decisions

- **Approach**: New edge function `public-chat` (not modifying existing `ai-chat`)
- **Auth**: No JWT required — rate limiting by IP + session ID
- **Rate limit**: 50 messages per 10-minute window, 2s cooldown between messages
- **Model**: `gpt-4o-mini`, max_tokens 800, temperature 0.7
- **System prompt**: Specialized for conversion — knows all tools, plans, and pricing
- **CTA target**: `/inscription` (free account)
- **Visibility**: All public pages via `Layout.tsx`
- **i18n**: French only (hardcoded, public site is French)

## Files to Create/Modify

### 1. `supabase/functions/public-chat/index.ts` (NEW)

Edge function with:
- CORS headers (same pattern as `ai-chat`)
- Rate limiting: in-memory Map keyed by IP, 50 req/10 min, 2s cooldown
- Session ID from request body for tracking
- Specialized system prompt with full knowledge of:
  - Free tools: inventaire IA, générateur de politiques, évaluation de risque, documentation en 1 clic, conformité multi-référentiels, tableaux de bord board-ready
  - Community features: cercle d'échange, diagnostic de maturité
  - Paid tools (Membre/Expert): fournisseurs IA, veille documentaire, monitoring/incidents, biais/équité
  - Plans: Observateur (gratuit), Membre, Expert
- OpenAI streaming SSE (same pattern as `ai-chat`)
- No Supabase auth verification

### 2. `src/hooks/usePublicChat.ts` (NEW)

Simplified chat hook:
- No Supabase auth, no `useCurrentRole`
- Calls `${SUPABASE_URL}/functions/v1/public-chat`
- Sends `sessionId` (generated once, stored in sessionStorage)
- SSE streaming (same pattern as `useAiChat`)
- Welcome message: client-side, hardcoded French
- History: last 20 messages sent to API

### 3. `src/components/PublicChat.tsx` (NEW)

Wrapper component:
- Uses `usePublicChat` hook
- Renders `FloatingChat` component with the hook's state
- French-only (no i18n)

### 4. `src/components/layout/Layout.tsx` (MODIFY)

Add `<PublicChat />` before closing div to show chatbot on all public pages.

## System Prompt Content

The system prompt will include:
- Role: AI governance advisor for gouvernance.ai
- Complete knowledge of all platform tools and features
- Knowledge of pricing plans (Observateur free, Membre, Expert)
- Objective: answer questions helpfully, present advantages, guide toward /inscription
- Tone: professional, warm, concise
- Always suggest inscription when relevant
- Never invent data or statistics
- Format with short paragraphs and lists

## Rate Limiting Strategy

- In-memory Map keyed by client IP (from `x-forwarded-for` or connection info)
- Each entry: `{ count: number, resetAt: number, lastMessage: number }`
- 50 messages per 10-minute rolling window
- 2-second minimum between consecutive messages
- Returns 429 Too Many Requests when exceeded
- Entries auto-cleaned after expiry
