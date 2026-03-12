# Beta Banner & Bug Report Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent beta banner to the portal and a bug report dialog accessible from the banner and user menu.

**Architecture:** A `BetaBanner` component is placed in `PortailLayout` between the header and main content. A `BugReportDialog` (shadcn Dialog + react-hook-form + Zod) is mounted once in the layout and triggered from the banner link and a new AppHeader dropdown item. A `useBugReports` hook encapsulates the Supabase mutation (insert + screenshot upload). A migration creates the `bug_reports` table with RLS and a `bug-screenshots` storage bucket.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, shadcn/ui, react-hook-form, Zod, Supabase, TanStack React Query, Vitest + MSW + Testing Library

**Spec:** `docs/superpowers/specs/2026-03-12-beta-banner-bug-report-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/20260312100000_create_bug_reports.sql` | Table, RLS policies, trigger, storage bucket |
| Create | `src/hooks/useBugReports.ts` | `useCreateBugReport` mutation hook |
| Create | `src/portail/components/BetaBanner.tsx` | Persistent beta info banner |
| Create | `src/portail/components/BugReportDialog.tsx` | Bug report form dialog |
| Create | `src/__tests__/hooks/useBugReports.test.ts` | Hook unit tests |
| Create | `src/__tests__/components/bug-report-dialog.test.tsx` | Dialog component tests |
| Modify | `src/portail/layout/PortailLayout.tsx` | Wire banner + dialog + state |
| Modify | `src/portail/layout/AppHeader.tsx` | Add `onOpenBugReport` prop + dropdown item |
| Modify | `src/__tests__/mocks/handlers.ts` | Add `bug_reports` to mock tables |

---

## Chunk 1: Database & Hook

### Task 1: Supabase Migration

**Files:**
- Create: `supabase/migrations/20260312100000_create_bug_reports.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Bug reports table for beta portal feedback
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('blocking', 'annoying', 'minor')),
  screenshot_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bug_reports_organization_id ON public.bug_reports(organization_id);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert bug reports for their organization"
  ON public.bug_reports FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Users can view bug reports for their organization"
  ON public.bug_reports FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Users can update own bug reports"
  ON public.bug_reports FOR UPDATE
  USING (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  )
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE TRIGGER set_updated_at_bug_reports
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT ALL ON public.bug_reports TO authenticated;

-- Storage bucket for bug report screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-screenshots', 'bug-screenshots', false);

CREATE POLICY "Authenticated users can upload bug screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bug-screenshots'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view bug screenshots from their org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bug-screenshots'
    AND auth.role() = 'authenticated'
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260312100000_create_bug_reports.sql
git commit -m "feat: add bug_reports migration with RLS and storage bucket"
```

**Note:** After applying this migration to Supabase, regenerate TypeScript types with `npx supabase gen types typescript --project-id <project-id> > src/types/database.ts` so that `supabase.from("bug_reports")` is type-safe. If types cannot be regenerated immediately, the hook will still work — Supabase's `.from()` accepts arbitrary strings at runtime.

---

### Task 2: Add `bug_reports` to MSW mock handlers

**Files:**
- Modify: `src/__tests__/mocks/handlers.ts`

- [ ] **Step 1: Add `bug_reports` to the `tables` array**

In `src/__tests__/mocks/handlers.ts`, add `"bug_reports"` to the `tables` array (after `"notifications"`):

```typescript
  "notifications", "audit_logs", "plan_features",
  "bug_reports",
```

- [ ] **Step 2: Commit**

```bash
git add src/__tests__/mocks/handlers.ts
git commit -m "test: add bug_reports to MSW mock handlers"
```

---

### Task 3: Write `useBugReports` hook test

**Files:**
- Create: `src/__tests__/hooks/useBugReports.test.ts`

- [ ] **Step 1: Write the test file**

Follow the exact pattern from `src/__tests__/hooks/useIncidents.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { useCreateBugReport } from "@/hooks/useBugReports";

describe("useCreateBugReport", () => {
  it("creates a bug report", async () => {
    const created = {
      id: "bug-001",
      title: "Test bug",
      description: "Description",
      severity: "minor",
      page_url: "/dashboard",
      organization_id: "org-001",
      user_id: "user-001",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      screenshot_url: null,
    };

    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/bug_reports`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateBugReport(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        title: "Test bug",
        description: "Description",
        severity: "minor",
        page_url: "/dashboard",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/hooks/useBugReports.test.ts`
Expected: FAIL — `useCreateBugReport` does not exist yet

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/hooks/useBugReports.test.ts
git commit -m "test: add useBugReports hook test (red)"
```

---

### Task 4: Implement `useBugReports` hook

**Files:**
- Create: `src/hooks/useBugReports.ts`

- [ ] **Step 1: Write the hook**

Follow the pattern from `src/hooks/useIncidents.ts`:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface BugReportInsert {
  title: string;
  description: string;
  page_url?: string;
  severity: "blocking" | "annoying" | "minor";
  screenshot?: File;
}

export function useCreateBugReport() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ screenshot, ...input }: BugReportInsert) => {
      if (!user || !profile?.organization_id) {
        throw new Error("Not authenticated");
      }

      const record = {
        ...input,
        organization_id: profile.organization_id,
        user_id: user.id,
      };

      // 1. Insert bug report
      const { data, error } = await supabase
        .from("bug_reports")
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      // 2. Upload screenshot if provided
      if (screenshot && data) {
        const path = `${profile.organization_id}/${data.id}/${screenshot.name}`;
        const { error: uploadError } = await supabase.storage
          .from("bug-screenshots")
          .upload(path, screenshot);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("bug-screenshots")
            .getPublicUrl(path);

          await supabase
            .from("bug_reports")
            .update({ screenshot_url: urlData.publicUrl })
            .eq("id", data.id);
        }
        // If upload fails, the bug report is still created — warn user
        if (uploadError) {
          const { toast } = await import("sonner");
          toast.warning("La capture d'écran n'a pas pu être jointe au rapport.");
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug_reports"] });
    },
  });
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/__tests__/hooks/useBugReports.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBugReports.ts
git commit -m "feat: add useBugReports hook with screenshot upload"
```

---

## Chunk 2: UI Components

### Task 5: Write `BugReportDialog` test

**Files:**
- Create: `src/__tests__/components/bug-report-dialog.test.tsx`

- [ ] **Step 1: Write the test file**

Follow the pattern from `src/__tests__/components/agents/create-agent-dialog.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../mocks/utils";

vi.mock("@/hooks/useBugReports", () => ({
  useCreateBugReport: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import BugReportDialog from "@/portail/components/BugReportDialog";

describe("BugReportDialog", () => {
  it("does not render content when closed", () => {
    renderWithProviders(
      <BugReportDialog open={false} onOpenChange={vi.fn()} />,
    );
    expect(screen.queryByText("Signaler un bug")).not.toBeInTheDocument();
  });

  it("renders dialog with form fields when open", () => {
    renderWithProviders(
      <BugReportDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText("Signaler un bug")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Résumé du problème")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Décrivez le bug rencontré...")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <BugReportDialog open={true} onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByText("Annuler"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("pre-fills page URL with current pathname", () => {
    renderWithProviders(
      <BugReportDialog open={true} onOpenChange={vi.fn()} />,
      { route: "/dashboard" },
    );
    const pageInput = screen.getByDisplayValue("/dashboard");
    expect(pageInput).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/components/bug-report-dialog.test.tsx`
Expected: FAIL — `BugReportDialog` does not exist yet

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/components/bug-report-dialog.test.tsx
git commit -m "test: add BugReportDialog component test (red)"
```

---

### Task 6: Implement `BugReportDialog`

**Files:**
- Create: `src/portail/components/BugReportDialog.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateBugReport } from "@/hooks/useBugReports";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const bugReportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  page_url: z.string().optional(),
  severity: z.enum(["blocking", "annoying", "minor"], {
    required_error: "La sévérité est requise",
  }),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

const SEVERITY_LABELS: Record<string, string> = {
  blocking: "Bloquant",
  annoying: "Gênant",
  minor: "Mineur",
};

interface BugReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BugReportDialog({ open, onOpenChange }: BugReportDialogProps) {
  const { pathname } = useLocation();
  const createBugReport = useCreateBugReport();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      page_url: pathname,
      severity: "minor",
    },
  });

  // Update page_url when pathname changes and dialog is closed
  useEffect(() => {
    if (!open) {
      reset({
        title: "",
        description: "",
        page_url: pathname,
        severity: "minor",
      });
    }
  }, [open, pathname, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: BugReportFormData) => {
    // Get screenshot file if selected
    const fileInput = document.getElementById("screenshot") as HTMLInputElement;
    const screenshot = fileInput?.files?.[0] ?? undefined;

    // Client-side file validation
    if (screenshot) {
      if (!ACCEPTED_IMAGE_TYPES.includes(screenshot.type)) {
        toast.error("Format d'image non supporté. Utilisez JPEG, PNG ou WebP.");
        return;
      }
      if (screenshot.size > MAX_FILE_SIZE) {
        toast.error("La capture d'écran ne doit pas dépasser 5 Mo.");
        return;
      }
    }

    try {
      await createBugReport.mutateAsync({ ...data, screenshot });
      toast.success("Bug signalé avec succès. Merci pour votre retour !");
      handleOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'envoi du rapport. Veuillez réessayer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Signaler un bug</DialogTitle>
          <DialogDescription>
            Décrivez le problème rencontré. Notre équipe analysera votre rapport.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Résumé du problème"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le bug rencontré..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Page URL */}
          <div className="space-y-2">
            <Label htmlFor="page_url">Page concernée</Label>
            <Input
              id="page_url"
              {...register("page_url")}
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Sévérité *</Label>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.severity && (
              <p className="text-sm text-destructive">{errors.severity.message}</p>
            )}
          </div>

          {/* Screenshot */}
          <div className="space-y-2">
            <Label htmlFor="screenshot">Capture d'écran</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG ou WebP. Max 5 Mo.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createBugReport.isPending}
            >
              {createBugReport.isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/__tests__/components/bug-report-dialog.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/portail/components/BugReportDialog.tsx
git commit -m "feat: add BugReportDialog component with Zod validation"
```

---

### Task 7: Implement `BetaBanner`

**Files:**
- Create: `src/portail/components/BetaBanner.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { Info } from "lucide-react";

interface BetaBannerProps {
  onOpenBugReport: () => void;
}

export function BetaBanner({ onOpenBugReport }: BetaBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 lg:px-6 py-2 text-sm text-amber-800">
      <Info className="h-4 w-4 shrink-0" />
      <p>
        <span className="font-medium">Portail en version bêta</span>
        {" — "}
        Certaines fonctionnalités ne sont pas entièrement finalisées.{" "}
        <button
          type="button"
          onClick={onOpenBugReport}
          className="underline underline-offset-2 hover:text-amber-900 font-medium"
        >
          Signaler un bug
        </button>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portail/components/BetaBanner.tsx
git commit -m "feat: add BetaBanner component"
```

---

## Chunk 3: Integration

### Task 8: Integrate into `PortailLayout`

**Files:**
- Modify: `src/portail/layout/PortailLayout.tsx`

- [ ] **Step 1: Add imports**

Add at the top of `src/portail/layout/PortailLayout.tsx`, after the existing imports:

```typescript
import { BetaBanner } from "@/portail/components/BetaBanner";
import BugReportDialog from "@/portail/components/BugReportDialog";
```

- [ ] **Step 2: Add state**

Inside `PortailLayout()`, after the existing `useState` declarations (after line 14):

```typescript
const [bugReportOpen, setBugReportOpen] = useState(false);
```

- [ ] **Step 3: Add BetaBanner between AppHeader and main**

In the JSX, between `<AppHeader ... />` (line 41-43) and `<main ...>` (line 44), add:

```typescript
        <BetaBanner onOpenBugReport={() => setBugReportOpen(true)} />
```

- [ ] **Step 4: Add onOpenBugReport prop to AppHeader**

Change the existing `<AppHeader>` call to pass the new prop:

```typescript
        <AppHeader
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          onOpenBugReport={() => setBugReportOpen(true)}
        />
```

- [ ] **Step 5: Add BugReportDialog inside the flex-col div**

After `</main>` (line 50) and before the closing `</div>` of the `flex flex-1 flex-col overflow-hidden` wrapper (line 51), add:

```typescript
        <BugReportDialog
          open={bugReportOpen}
          onOpenChange={setBugReportOpen}
        />
```

The resulting structure should be:
```tsx
        </main>
        <BugReportDialog
          open={bugReportOpen}
          onOpenChange={setBugReportOpen}
        />
      </div>  {/* closes div.flex.flex-1.flex-col */}
```

- [ ] **Step 6: Commit**

```bash
git add src/portail/layout/PortailLayout.tsx
git commit -m "feat: integrate BetaBanner and BugReportDialog into PortailLayout"
```

---

### Task 9: Add bug report item to `AppHeader`

**Files:**
- Modify: `src/portail/layout/AppHeader.tsx`

- [ ] **Step 1: Add Bug icon to imports**

In `src/portail/layout/AppHeader.tsx`, add `Bug` to the lucide-react import (line 5):

```typescript
import { Bell, Menu, LogOut, User, Check, ChevronRight, CreditCard, Users, Map, Building2, Bug } from "lucide-react";
```

- [ ] **Step 2: Update interface**

Change the `AppHeaderProps` interface (lines 24-26) to:

```typescript
interface AppHeaderProps {
  onMobileMenuToggle: () => void;
  onOpenBugReport: () => void;
}
```

- [ ] **Step 3: Destructure new prop**

Change line 88 to:

```typescript
export function AppHeader({ onMobileMenuToggle, onOpenBugReport }: AppHeaderProps) {
```

- [ ] **Step 4: Add dropdown menu item**

After the Roadmap `DropdownMenuItem` block (lines 281-286) and before the `<DropdownMenuSeparator />` (line 287), add:

```typescript
            <DropdownMenuItem onClick={onOpenBugReport} className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Signaler un bug
            </DropdownMenuItem>
```

- [ ] **Step 5: Commit**

```bash
git add src/portail/layout/AppHeader.tsx
git commit -m "feat: add bug report item to AppHeader user dropdown"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass, including the new `useBugReports.test.ts` and `bug-report-dialog.test.tsx`

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Run dev server and verify visually**

Run: `npx vite dev`
- Navigate to the portal (login required)
- Verify the amber beta banner appears between header and content
- Verify "Signaler un bug" link in banner opens the dialog
- Verify the bug report item appears in the user dropdown menu
- Verify the form fields work (title, description, page URL pre-filled, severity select)
- Verify form validation (submit with empty required fields)
- Verify cancel button closes and resets the form

- [ ] **Step 4: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix: address any issues found during verification"
```
