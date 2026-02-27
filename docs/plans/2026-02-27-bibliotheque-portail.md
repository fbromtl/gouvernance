# Bibliothèque documentaire — Migration vers le portail

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the document library from the public `/ressources` page into the authenticated portail as `/bibliotheque`, and replace the public version with a landing page preview that invites login.

**Architecture:** Single `DocumentLibrary` component with a `mode` prop (`"public"` | `"portail"`). New `BibliothecPage` wraps it in portail mode. New `DocumentLibraryPreview` wraps it in public mode with login CTA. Sidebar gets a new entry after "Veille réglementaire".

**Tech Stack:** React, TypeScript, react-router-dom, react-i18next, lucide-react, Tailwind CSS

---

### Task 1: Add `mode` prop to `DocumentLibrary`

**Files:**
- Modify: `src/components/resources/DocumentLibrary.tsx`

**Step 1: Add mode prop and adjust behavior**

In `DocumentLibrary.tsx`, add a `mode` prop. In `"portail"` mode, skip `LoginDialog` and open files directly. In `"public"` mode (default), keep current soft-gate behavior but change the button label to "Se connecter" and redirect to `/bibliotheque` after login.

```typescript
// Change the function signature (line 16):
export function DocumentLibrary({ mode = "public" }: { mode?: "public" | "portail" }) {

// In portail mode, we don't need login state. Modify handleConsult (lines 23-30):
const handleConsult = useCallback((doc: PublicDocument) => {
  if (mode === "portail") {
    window.open(doc.file_url, "_blank");
    return;
  }
  // public mode: always show login
  setPendingUrl(doc.file_url);
  setLoginOpen(true);
}, [mode]);

// In portail mode, handleLoginSuccess is unused but harmless.
// Keep it as-is for simplicity.
```

**Step 2: In public mode, change button label and redirect**

In the `DocumentCard` sub-component, pass the mode down and change the button text:

```typescript
// Change DocumentCard props (line 139):
function DocumentCard({ doc, onConsult, mode = "public" }: {
  doc: PublicDocument;
  onConsult: () => void;
  mode?: "public" | "portail";
}) {

// Change Button content (lines 174-182):
<Button
  variant="ghost"
  size="sm"
  className="shrink-0 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
  onClick={onConsult}
>
  <FileDown className="h-3.5 w-3.5" />
  {mode === "portail" ? "Consulter" : "Se connecter"}
</Button>
```

Update the DocumentCard call site (line 111) to pass `mode`:

```typescript
<DocumentCard key={doc.id} doc={doc} onConsult={() => handleConsult(doc)} mode={mode} />
```

**Step 3: In public mode, redirect to /bibliotheque after login**

Add `useNavigate` and change `handleLoginSuccess`:

```typescript
import { useNavigate } from "react-router-dom";

// Inside DocumentLibrary, add:
const navigate = useNavigate();

// Change handleLoginSuccess (lines 32-37):
const handleLoginSuccess = useCallback(() => {
  if (mode === "public") {
    navigate("/bibliotheque");
    return;
  }
  if (pendingUrl) {
    window.open(pendingUrl, "_blank");
    setPendingUrl(null);
  }
}, [mode, pendingUrl, navigate]);
```

**Step 4: Conditionally render LoginDialog**

Only render `LoginDialog` when mode is `"public"`:

```typescript
// Line 134: wrap in condition
{mode === "public" && (
  <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onSuccess={handleLoginSuccess} />
)}
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/components/resources/DocumentLibrary.tsx
git commit -m "feat(bibliotheque): add mode prop to DocumentLibrary component"
```

---

### Task 2: Create portail page `BibliothecPage.tsx`

**Files:**
- Create: `src/portail/pages/BibliothecPage.tsx`

**Step 1: Create the page**

Follow the same pattern as `VeillePage.tsx` — header with title + description, then the component.

```typescript
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";

export default function BibliothecPage() {
  const { t } = useTranslation("portail");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("nav.bibliotheque")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t("bibliothequeDescription")}
        </p>
      </div>

      <DocumentLibrary mode="portail" />
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (i18n keys will just return the key string if missing — we add them in Task 4)

**Step 3: Commit**

```bash
git add src/portail/pages/BibliothecPage.tsx
git commit -m "feat(bibliotheque): create portail page for document library"
```

---

### Task 3: Add route and sidebar entry

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/portail/layout/AppSidebar.tsx`

**Step 1: Add import and route in App.tsx**

After line 91 (`import VeillePage`), add:

```typescript
// Module: Bibliothèque documentaire
import BibliothecPage from "@/portail/pages/BibliothecPage";
```

After line 156 (`<Route path="/veille" ...>`), add:

```typescript
<Route path="/bibliotheque" element={<BibliothecPage />} />
```

**Step 2: Add sidebar entry in AppSidebar.tsx**

Add `BookOpen` to the lucide-react import (line 26, before the closing `}`):

```typescript
import {
  // ... existing imports ...
  BookOpen,
  Users,
} from "lucide-react";
```

In the `navGroups` array, in the `sections.overview` group, after the `veille` entry (after line 75), add:

```typescript
{
  key: "bibliotheque",
  path: "/bibliotheque",
  icon: BookOpen,
  ready: true,
},
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/App.tsx src/portail/layout/AppSidebar.tsx
git commit -m "feat(bibliotheque): add route and sidebar entry"
```

---

### Task 4: Add i18n keys

**Files:**
- Modify: `src/i18n/locales/fr/portail.json`
- Modify: `src/i18n/locales/en/portail.json`

**Step 1: Add French keys**

After the `"veille"` nav key, add:

```json
"bibliotheque": "Bibliothèque",
```

At the root level of the JSON, add:

```json
"bibliothequeDescription": "Cadres, lois et guides de gouvernance de l'IA — organisés par juridiction."
```

**Step 2: Add English keys**

After the `"veille"` nav key, add:

```json
"bibliotheque": "Library",
```

At the root level:

```json
"bibliothequeDescription": "AI governance frameworks, laws and guides — organized by jurisdiction."
```

**Step 3: Commit**

```bash
git add src/i18n/locales/fr/portail.json src/i18n/locales/en/portail.json
git commit -m "feat(bibliotheque): add i18n keys for library page"
```

---

### Task 5: Create `DocumentLibraryPreview` for public page

**Files:**
- Create: `src/components/resources/DocumentLibraryPreview.tsx`
- Modify: `src/pages/RessourcesPage.tsx`

**Step 1: Create the preview wrapper**

This is a thin wrapper that renders `DocumentLibrary` in public mode. The component already handles the "Se connecter" button and login redirect in public mode (from Task 1).

```typescript
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";

export function DocumentLibraryPreview() {
  return <DocumentLibrary mode="public" />;
}
```

**Step 2: Update RessourcesPage.tsx**

Change the import (line 15):

```typescript
// Before:
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";
// After:
import { DocumentLibraryPreview } from "@/components/resources/DocumentLibraryPreview";
```

Change the usage (line 70):

```typescript
// Before:
<DocumentLibrary />
// After:
<DocumentLibraryPreview />
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/resources/DocumentLibraryPreview.tsx src/pages/RessourcesPage.tsx
git commit -m "feat(bibliotheque): replace public DocumentLibrary with preview wrapper"
```

---

### Task 6: Visual verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify public `/ressources` page**

1. Navigate to `/ressources` (not logged in)
2. Confirm document library section shows titles, summaries, badges
3. Confirm button says "Se connecter" (not "Consulter")
4. Click "Se connecter" → LoginDialog popup opens
5. After login → redirects to `/bibliotheque`

**Step 3: Verify portail `/bibliotheque` page**

1. Navigate to `/bibliotheque` (logged in)
2. Confirm sidebar shows "Bibliothèque" under "Vue d'ensemble", after "Veille réglementaire"
3. Confirm document library displays with full jurisdiction tabs, accordions, document cards
4. Confirm button says "Consulter"
5. Click "Consulter" → document opens in new tab (no login popup)

**Step 4: Verify other sections unchanged**

1. On `/ressources`, confirm Boîte à outils, Veille réglementaire, Études de cas sections are intact
2. In portail, confirm `/documents` page still works (separate internal documents page)

**Step 5: Commit (if any fixes needed)**

```bash
git commit -m "fix(bibliotheque): visual adjustments from verification"
```
