# Cookie Consent Banner (Loi 25) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Loi 25-compliant cookie consent banner to the public site with preference management.

**Architecture:** A `useCookieConsent` hook manages consent state in localStorage. A `CookieConsent` snackbar renders at the bottom of the public layout. A `CookiePreferences` dialog lets users customize choices. Footer and privacy page link back to preferences.

**Tech Stack:** React, Framer Motion, shadcn/ui (Dialog, Switch), localStorage, Tailwind CSS

---

### Task 1: Create `useCookieConsent` hook

**Files:**
- Create: `src/hooks/useCookieConsent.ts`

**Step 1: Write the hook**

```typescript
import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cookie_consent';
const CONSENT_VERSION = 1;

export interface CookieConsentState {
  version: number;
  timestamp: string;
  essential: true;
  functional: boolean;
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useCookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const saveConsent = useCallback((functional: boolean) => {
    const state: CookieConsentState = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      essential: true,
      functional,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    emitChange();
  }, []);

  const acceptAll = useCallback(() => saveConsent(true), [saveConsent]);
  const refuseAll = useCallback(() => saveConsent(false), [saveConsent]);
  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    emitChange();
  }, []);

  const hasConsent = useCallback(
    (category: 'essential' | 'functional') => {
      if (category === 'essential') return true;
      return consent?.functional ?? false;
    },
    [consent],
  );

  return {
    consent,
    showBanner: consent === null,
    acceptAll,
    refuseAll,
    saveConsent,
    resetConsent,
    hasConsent,
  };
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/hooks/useCookieConsent.ts
git commit -m "feat: ajout hook useCookieConsent pour gestion consentement Loi 25"
```

---

### Task 2: Create `CookiePreferences` dialog

**Files:**
- Create: `src/components/cookie/CookiePreferences.tsx`

**Step 1: Write the component**

```tsx
import { useState } from 'react';
import { Shield, Cookie, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookiePreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePreferences({ open, onOpenChange }: CookiePreferencesProps) {
  const { consent, saveConsent } = useCookieConsent();
  const [functional, setFunctional] = useState(consent?.functional ?? false);

  const handleSave = () => {
    saveConsent(functional);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-brand-forest" />
            Gestion des cookies
          </DialogTitle>
          <DialogDescription>
            Conformément à la Loi 25 du Québec, vous pouvez gérer vos préférences de cookies.
            Les cookies essentiels ne peuvent pas être désactivés.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Essential */}
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4 bg-neutral-50">
            <div className="flex gap-3">
              <Cookie className="size-5 text-brand-forest shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cookies essentiels</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nécessaires au fonctionnement du site : authentification, paiement sécurisé,
                  préférence de langue.
                </p>
              </div>
            </div>
            <Switch checked disabled aria-label="Cookies essentiels (toujours actifs)" />
          </div>

          <Separator />

          {/* Functional */}
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex gap-3">
              <MessageSquare className="size-5 text-brand-forest shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cookies fonctionnels</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Améliorent votre expérience : sauvegarde du diagnostic en cours,
                  session du chat public.
                </p>
              </div>
            </div>
            <Switch
              checked={functional}
              onCheckedChange={setFunctional}
              aria-label="Cookies fonctionnels"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-brand-forest hover:bg-brand-teal">
            Enregistrer mes choix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/cookie/CookiePreferences.tsx
git commit -m "feat: ajout dialog CookiePreferences pour personnalisation consentement"
```

---

### Task 3: Create `CookieConsent` banner

**Files:**
- Create: `src/components/cookie/CookieConsent.tsx`

**Step 1: Write the component**

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookiePreferences } from './CookiePreferences';

export function CookieConsent() {
  const { showBanner, acceptAll, refuseAll } = useCookieConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl"
          >
            <div className="rounded-2xl bg-[#0e0f19] p-4 sm:p-5 shadow-2xl border border-white/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                {/* Text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-forest/20">
                    <Cookie className="size-4 text-brand-sage" />
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Ce site utilise des cookies essentiels et fonctionnels pour améliorer votre
                    expérience.{' '}
                    <Link
                      to="/confidentialite"
                      className="text-brand-sage hover:text-white underline underline-offset-2 transition-colors"
                    >
                      Politique de confidentialité
                    </Link>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setPrefsOpen(true)}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors whitespace-nowrap"
                  >
                    Personnaliser
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refuseAll}
                    className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white bg-transparent rounded-full text-xs"
                  >
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="bg-brand-forest hover:bg-brand-teal text-white rounded-full text-xs"
                  >
                    Accepter
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferences open={prefsOpen} onOpenChange={setPrefsOpen} />
    </>
  );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/cookie/CookieConsent.tsx
git commit -m "feat: ajout bandeau CookieConsent avec animation Framer Motion"
```

---

### Task 4: Integrate into Layout

**Files:**
- Modify: `src/components/layout/Layout.tsx`

**Step 1: Add CookieConsent to Layout**

Add import and component after `<PublicChat />`:

```tsx
import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { PublicChat } from "@/components/PublicChat";
import { CookieConsent } from "@/components/cookie/CookieConsent";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-[120px]">
        <Outlet />
      </main>
      <Footer />
      <PublicChat />
      <CookieConsent />
    </div>
  );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/Layout.tsx
git commit -m "feat: intégration CookieConsent dans Layout public"
```

---

### Task 5: Add "Gestion des cookies" to Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Step 1: Add cookie link to legalLinks array**

Change the `legalLinks` array (around line 65) to add a cookie management entry:

```typescript
const legalLinks = [
  { to: "/confidentialite", label: "Confidentialité" },
  { to: "/mentions-legales", label: "Mentions légales" },
  { to: "/accessibilite", label: "Accessibilité" },
  { to: "#cookies", label: "Gestion des cookies" },
];
```

Then in the Footer component, handle the `#cookies` link specially. Replace the `legalLinks.map` block (around line 274) to detect the cookie link and call `resetConsent` instead of navigating:

Import the hook at the top of the file:
```typescript
import { useCookieConsent } from '@/hooks/useCookieConsent';
```

Inside `Footer()`, after the existing state hooks:
```typescript
const { resetConsent } = useCookieConsent();
```

Replace the legalLinks map with:
```tsx
{legalLinks.map((link, i) => (
  <span key={link.to} className="flex items-center">
    {i > 0 && <span className="text-white/20 mx-1.5">·</span>}
    {link.to === '#cookies' ? (
      <button
        type="button"
        onClick={resetConsent}
        className="text-xs text-white/35 hover:text-white/60 transition-colors"
      >
        {link.label}
      </button>
    ) : (
      <Link
        to={link.to}
        className="text-xs text-white/35 hover:text-white/60 transition-colors"
      >
        {link.label}
      </Link>
    )}
  </span>
))}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: ajout lien Gestion des cookies dans le footer"
```

---

### Task 6: Add cookie section to ConfidentialitePage

**Files:**
- Modify: `src/pages/ConfidentialitePage.tsx`

**Step 1: Update the Cookies section**

Import the hook and add a button. Replace the existing Cookies `<section>` (lines 56-65) with:

```tsx
<section>
  <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Cookies</h2>
  <p className="text-muted-foreground leading-relaxed">
    Notre site utilise des cookies pour assurer son fonctionnement et améliorer votre
    expérience. Conformément à la Loi 25 du Québec, nous distinguons deux catégories :
  </p>
  <ul className="mt-3 space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
    <li>
      <strong className="text-foreground">Cookies essentiels</strong> — nécessaires au
      fonctionnement du site (authentification, paiement, préférence de langue). Ils ne
      peuvent pas être désactivés.
    </li>
    <li>
      <strong className="text-foreground">Cookies fonctionnels</strong> — améliorent votre
      expérience (sauvegarde du diagnostic en cours, session du chat). Vous pouvez les
      accepter ou les refuser.
    </li>
  </ul>
  <p className="mt-4 text-muted-foreground leading-relaxed">
    Vous pouvez modifier vos préférences à tout moment :
  </p>
  <button
    type="button"
    onClick={resetConsent}
    className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
  >
    <Shield className="size-4" />
    Modifier mes préférences de cookies
  </button>
</section>
```

Add imports at top:
```typescript
import { Shield } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
```

Inside the component, before the return:
```typescript
const { resetConsent } = useCookieConsent();
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/pages/ConfidentialitePage.tsx
git commit -m "feat: mise à jour section cookies sur page confidentialité avec bouton préférences"
```

---

### Task 7: Final verification and push

**Step 1: Full build check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Visual check**

Run: `npm run dev`
Verify:
- Banner appears on first visit (bottom of page, dark snackbar)
- "Accepter" saves consent and hides banner
- "Refuser" saves consent (functional: false) and hides banner
- "Personnaliser" opens dialog with toggles
- Banner does not reappear after choice
- Footer "Gestion des cookies" link resets consent and banner reappears
- `/confidentialite` page has updated cookie section with preferences button

**Step 3: Push all commits**

```bash
git push
```
