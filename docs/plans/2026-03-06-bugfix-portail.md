# Correction bugs portail - Plan d'implementation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger les bugs critiques et majeurs du portail SaaS identifies par l'audit de code.

**Architecture:** Corrections en 4 phases : (1) auth race condition, (2) memory leaks chat, (3) onError global sur mutations, (4) bugs mineurs pages. Chaque phase est un commit atomique.

**Tech Stack:** React 19, TanStack Query, Supabase, Sonner (toasts)

---

### Task 1: Fix double fetch profil au demarrage (auth.tsx)

**Files:**
- Modify: `src/lib/auth.tsx:120-153`

**Bug:** `getSession()` appelle `fetchOrCreateProfile`, puis `onAuthStateChange` fire avec `INITIAL_SESSION` et appelle `fetchOrCreateProfile` une 2e fois. Race condition + double requete DB.

**Step 1: Implement fix**

Deplacer la logique de fetch UNIQUEMENT dans `onAuthStateChange` et supprimer le fetch dans `getSession()`. Le `getSession()` sert juste a initialiser le state user synchrone. `onAuthStateChange` fire toujours avec INITIAL_SESSION au demarrage.

```typescript
useEffect(() => {
  if (!supabaseConfigured) {
    setLoading(false);
    return;
  }

  // Only use onAuthStateChange — it fires INITIAL_SESSION on startup
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const authUser = session?.user ?? null;
    setUser(authUser);
    if (authUser) {
      fetchOrCreateProfile(authUser).finally(() => setLoading(false));
    } else {
      setProfile(null);
      setLoading(false);
    }
  });

  return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add src/lib/auth.tsx
git commit -m "fix: supprimer double fetch profil au demarrage (race condition auth)"
```

---

### Task 2: Fix memory leak AbortController dans les hooks chat

**Files:**
- Modify: `src/hooks/useAiChat.ts`
- Modify: `src/hooks/usePublicChat.ts`

**Bug:** Si le composant unmount pendant un stream SSE, le fetch continue en arriere-plan. L'AbortController n'est jamais abort au unmount.

**Step 1: Add useEffect cleanup in useAiChat.ts**

Ajouter apres la declaration de `abortRef` (ligne 62):

```typescript
import { useState, useCallback, useRef, useEffect } from "react";

// ... after abortRef declaration:
useEffect(() => {
  return () => {
    abortRef.current?.abort();
  };
}, []);
```

**Step 2: Same fix in usePublicChat.ts**

Meme pattern exact.

**Step 3: Verify build**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/hooks/useAiChat.ts src/hooks/usePublicChat.ts
git commit -m "fix: cleanup AbortController au unmount des hooks chat (memory leak)"
```

---

### Task 3: Ajouter onError global sur toutes les mutations CRUD

**Files:**
- Modify: `src/hooks/useAiSystems.ts`
- Modify: `src/hooks/useRiskAssessments.ts`
- Modify: `src/hooks/useIncidents.ts`
- Modify: `src/hooks/useCompliance.ts`
- Modify: `src/hooks/useDecisions.ts`
- Modify: `src/hooks/useBiasFindings.ts`
- Modify: `src/hooks/useTransparency.ts`
- Modify: `src/hooks/useLifecycleEvents.ts`
- Modify: `src/hooks/useDocuments.ts`
- Modify: `src/hooks/useMonitoring.ts`
- Modify: `src/hooks/useData.ts`
- Modify: `src/hooks/useVendors.ts`
- Modify: `src/hooks/useMembers.ts`

**Bug:** Aucune mutation n'a de callback `onError`. Si une operation echoue (reseau, permission, validation DB), l'utilisateur n'est jamais notifie. Echecs silencieux.

**Step 1: Add toast import and onError to each mutation**

Pattern a appliquer dans chaque hook:

```typescript
import { toast } from "sonner";

// Dans chaque useMutation:
onError: (error: Error) => {
  toast.error(error.message || "Une erreur est survenue");
},
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/hooks/*.ts
git commit -m "fix: ajouter toast onError sur toutes les mutations CRUD du portail"
```

---

### Task 4: Fix bugs mineurs pages portail

**Files:** Multiples pages portail

**Bug A — DashboardPage.tsx:101** : `profile?.full_name?.split(" ")[0]` retourne "" si full_name est "".
**Fix:** `(profile?.full_name?.split(" ")[0]?.trim() || t("welcomeFallback"))`

**Bug B — IncidentDetailPage.tsx:175** : Texte "Incident introuvable." hardcode au lieu de t().
**Fix:** Utiliser `t("detail.notFound")` ou garder le francais vu que c'est le fallback.

**Step 1: Apply fixes**
**Step 2: Verify build**
**Step 3: Commit**

```bash
git commit -m "fix: corrections mineures pages portail (empty name, textes non traduits)"
```
